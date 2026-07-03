// DIALOG-PATH: DIALOG_FREE — the file only LISTENS for the modules own Hooks.callAll("aa.ready", ...) emission (captured once at Foundry init to populate a local reference); this handler never opens a Dialog/DialogV2 and never awaits a Hooks.once-tied Promise.
// Module Integration v1 Phase 8 — module-autoanimations handler.
//
// 7-action umbrella for Automated Animations (AA): per-item flag authoring,
// animation discovery, world-level Autorec config, and manual director play.
//
// Design constraints (dossier autoanimations.md §3-§6; pre-plan ADR-8.1):
//   - requireModuleActive('autoanimations', ['sequencer','socketlib']) FIRST —
//       RETURNS the failure envelope, never throws.
//   - set-item-animation: TWO-STEP write (clear `flags.-=autoanimations` then set),
//       FORCE version:5 + isCustomized:true (the silent-failure guards, §3a), then
//       DP-16 post-write re-read to confirm the write landed.
//   - macro.enable:true requires confirmedMacro:true (SUPPORTED_WITH_CONFIRMATION §5):
//       AA runs an arbitrary world macro on every roll.
//   - list-animations reads AA's `aaDatabase` tree captured at the `aa.ready` hook —
//       NOT Sequencer.Database.searchFor (AA registers `autoanimations.*` PRIVATE, so
//       searchFor returns [] — pre-plan ADR-8.1, autoanimations.js:12075).
//   - get-autorec / merge-autorec-entry go through AutomatedAnimations.AutorecManager.
//   - play-animation: GM + confirm (transient Sequencer effect, no undo).
//   - CCR-3: notify.updated on writes; no notify on reads.

import { requireModuleActive } from '../_shared/require-module-active.js';
import {
  ModuleAutoAnimationsInput,
  type ModuleAutoAnimationsInputType,
  type AnimationPayloadType,
} from './schemas.js';
import { notify } from '../../../notify.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

// ── aa.ready capture (ADR-8.1) ──────────────────────────────────────────────
//
// AA fires `Hooks.callAll("aa.ready", aaDatabase)` once JB2A is compiled +
// registered (autoanimations.js:12077). This module is eagerly imported by
// queries.ts at Foundry init (well before aa.ready), so the once-listener
// captures the menu tree. list-animations reads this reference, because the
// `autoanimations.*` Sequencer namespace is PRIVATE (searchFor → []).
let aaDatabaseRef: Record<string, any> | null = null;
try {
  const Hooks: any = (globalThis as any).Hooks;
  Hooks?.once?.('aa.ready', (db: any) => {
    aaDatabaseRef = db ?? null;
  });
} catch {
  // Hooks unavailable at import (test env) — list-animations will report not-ready.
}

// ── Local helpers ───────────────────────────────────────────────────────────

function isGM(): boolean {
  return Boolean((globalThis as any).game?.user?.isGM);
}

function getAA(): any {
  const aa = (globalThis as any).AutomatedAnimations;
  if (!aa) throw new Error('AA_API_UNAVAILABLE: window.AutomatedAnimations not bound');
  return aa;
}

function randomId(): string {
  const f = (globalThis as any).foundry;
  if (f?.utils?.randomID) return f.utils.randomID();
  return Math.random().toString(36).slice(2, 18);
}

async function resolveDoc(uuid: string): Promise<any> {
  const fromUuid = (globalThis as any).fromUuid;
  if (typeof fromUuid !== 'function') throw new Error('FROMUUID_UNAVAILABLE');
  return await fromUuid(uuid);
}

/** AA's own label normalization for Autorec name-matching (dossier §3g / open-q §2). */
function normalizeLabel(s: string): string {
  return String(s ?? '').replace(/\s+/g, '').toLowerCase();
}

// ── v5 flag expansion (dossier §3a) ─────────────────────────────────────────
//
// Build the full v5 `flags.autoanimations` object from the simplified MCP payload,
// FORCING version:5 + isCustomized:true. Missing option sub-fields fall back to AA's
// documented defaults.

function expandVideo(v: AnimationPayloadType['primary'] | undefined): Record<string, unknown> {
  return {
    dbSection: v?.dbSection ?? 'melee',
    menuType: v?.menuType ?? 'weapon',
    animation: v?.animation ?? '',
    variant: v?.variant ?? '01',
    color: v?.color ?? 'white',
    enableCustom: v?.enableCustom ?? false,
    customPath: v?.customPath ?? '',
  };
}

function expandSound(s: AnimationPayloadType['sound'] | undefined): Record<string, unknown> {
  return {
    enable: s?.enable ?? false,
    file: s?.file,
    volume: s?.volume ?? 0.75,
    delay: s?.delay ?? 0,
    startTime: s?.startTime ?? 0,
    repeat: s?.repeat ?? 1,
    repeatDelay: s?.repeatDelay ?? 250,
  };
}

function defaultOptions(p: AnimationPayloadType): Record<string, unknown> {
  return {
    delay: p.delay ?? 0,
    elevation: p.elevation ?? 1000,
    opacity: 1,
    repeat: 1,
    repeatDelay: 500,
    size: p.size ?? 1,
    tint: false,
    tintColor: '#FFFFFF',
    zIndex: 1,
    isWait: false,
    isReturning: false,
    onlyX: false,
    addTokenWidth: false,
    anchor: '0.5',
    fadeIn: 250,
    fadeOut: 500,
    isMasked: false,
    isRadius: false,
  };
}

function expandFxSlot(slot: AnimationPayloadType['secondary'] | undefined): Record<string, unknown> {
  return {
    enable: slot?.enable ?? false,
    video: expandVideo(slot?.video),
    sound: expandSound(slot?.sound),
    options: {
      addTokenWidth: false, anchor: '0.5', delay: 0,
      elevation: 1000, fadeIn: 250, fadeOut: 500,
      isWait: false, isMasked: false, isRadius: false,
      opacity: 1, repeat: 1, repeatDelay: 250, size: 1, zIndex: 1,
      persistent: false, unbindAlpha: false, unbindVisibility: false,
    },
  };
}

/**
 * Expand the simplified payload to the full v5 object.
 * label is the item/entry name (for autorec name-match + UI sync).
 */
function expandToV5(payload: AnimationPayloadType, label: string): Record<string, unknown> {
  const primaryVideo = expandVideo(payload.primary);
  const menu = payload.menu ?? payload.primary?.dbSection ?? 'melee';
  return {
    // Control — the MCP guard surface (§3a)
    version: 5,                              // MUST be 5; flagMigrations.handle() is a no-op on v5
    isEnabled: payload.isEnabled ?? true,
    isCustomized: true,                      // FORCED true — false silently falls back to Autorec
    id: randomId(),
    label,
    fromAmmo: payload.fromAmmo ?? false,
    menu,

    primary: {
      video: primaryVideo,
      sound: expandSound(payload.sound),
      options: defaultOptions(payload),
    },
    secondary: expandFxSlot(payload.secondary),
    source: expandFxSlot(payload.source),
    target: expandFxSlot(payload.target),
    soundOnly: {
      sound: {
        delay: payload.soundOnly?.delay ?? 0,
        enable: payload.soundOnly?.enable ?? false,
        file: payload.soundOnly?.file,
        startTime: payload.soundOnly?.startTime ?? 0,
        volume: payload.soundOnly?.volume ?? 0.75,
      },
    },
    macro: {
      enable: payload.macro?.enable ?? false,
      name: payload.macro?.name,
      args: payload.macro?.args,
      playWhen: payload.macro?.playWhen,
    },
    meleeSwitch: {
      video: expandVideo(payload.meleeSwitch?.video),
      sound: expandSound(undefined),
      options: {
        detect: payload.meleeSwitch?.detect ?? 'automatic',
        range: payload.meleeSwitch?.range ?? 2,
        isReturning: payload.meleeSwitch?.isReturning ?? false,
        switchType: payload.meleeSwitch?.switchType ?? 'on',
      },
    },
  };
}

// ── Public dispatcher ───────────────────────────────────────────────────────

export async function dispatchModuleAutoAnimations(data: unknown): Promise<any> {
  // FIRST executable statement — gate on autoanimations + hard deps.
  const g = requireModuleActive('autoanimations', ['sequencer', 'socketlib']);
  if (g) return g;

  // BUG-366: translate schema-parse failures into a clean typed token instead of letting
  // a raw Zod invalid_union/unrecognized_keys error surface to the caller.
  let parsed: ModuleAutoAnimationsInputType;
  try {
    parsed = ModuleAutoAnimationsInput.parse(data);
  } catch (e: unknown) {
    return { success: false, error: `AA_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  switch (parsed.action) {
    case 'get-item-animation':   return handleGetItemAnimation(parsed);
    case 'set-item-animation':   return handleSetItemAnimation(parsed);
    case 'clear-item-animation': return handleClearItemAnimation(parsed);
    case 'list-animations':      return handleListAnimations(parsed);
    case 'get-autorec':          return handleGetAutorec(parsed);
    case 'merge-autorec-entry':  return handleMergeAutorecEntry(parsed);
    case 'play-animation':       return handlePlayAnimation(parsed);
    default: {
      const _exhaustive: never = parsed;
      return { success: false, error: `Unknown module-autoanimations action: ${(_exhaustive as { action: string }).action}` };
    }
  }
}

// ── Per-item flag authoring ──────────────────────────────────────────────────

type GetItemInput = Extract<ModuleAutoAnimationsInputType, { action: 'get-item-animation' }>;
type SetItemInput = Extract<ModuleAutoAnimationsInputType, { action: 'set-item-animation' }>;
type ClearItemInput = Extract<ModuleAutoAnimationsInputType, { action: 'clear-item-animation' }>;

async function handleGetItemAnimation(input: GetItemInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED' };
  try {
    const item = await resolveDoc(input.uuid);
    if (!item) return { success: false, error: `ITEM_NOT_FOUND: no document at uuid "${input.uuid}"` };
    const flags = (item.flags as any)?.autoanimations ?? null;
    return {
      success: true,
      data: {
        uuid: input.uuid,
        name: item.name ?? null,
        flags,
        isCustomized: flags?.isCustomized ?? null,
        version: flags?.version ?? null,
      },
    };
  } catch (e) {
    return { success: false, error: `AA_GET_ITEM_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

async function handleSetItemAnimation(input: SetItemInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can write item animations' };

  // Macro gate (SUPPORTED_WITH_CONFIRMATION §5).
  if (input.animation.macro?.enable === true && input.confirmedMacro !== true) {
    return {
      success: false,
      error: 'AA_MACRO_NOT_CONFIRMED: animation.macro.enable=true makes AA run an arbitrary world macro on every roll. Re-send with confirmedMacro:true to allow it.',
    };
  }

  try {
    const item = await resolveDoc(input.uuid);
    if (!item) return { success: false, error: `ITEM_NOT_FOUND: no document at uuid "${input.uuid}"` };
    if (typeof item.update !== 'function') {
      return { success: false, error: `NOT_AN_ITEM: uuid "${input.uuid}" did not resolve to an updatable Item` };
    }

    const v5 = expandToV5(input.animation, item.name ?? 'item');

    // Two-step write (dossier §3a) — clear old, then set.
    await item.update({ 'flags.-=autoanimations': null });
    await item.update({ 'flags.autoanimations': v5 });

    // DP-16 post-write re-read.
    const written = (item.flags as any)?.autoanimations;
    if (!written || written.version !== 5 || written.isCustomized !== true) {
      return {
        success: false,
        error: `AA_FLAG_VERIFY_FAILED: post-write re-read did not confirm version=5 + isCustomized=true (got version=${written?.version}, isCustomized=${written?.isCustomized})`,
      };
    }

    notify.updated('autoanimations', item.name ?? input.uuid, {
      summary: `${written.menu}/${written.primary?.video?.animation ?? '?'}`,
      uuid: input.uuid,
    });
    return {
      success: true,
      data: { uuid: input.uuid, name: item.name ?? null, version: 5, isCustomized: true, menu: written.menu },
    };
  } catch (e) {
    return { success: false, error: `AA_SET_ITEM_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

async function handleClearItemAnimation(input: ClearItemInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED' };
  try {
    const item = await resolveDoc(input.uuid);
    if (!item) return { success: false, error: `ITEM_NOT_FOUND: no document at uuid "${input.uuid}"` };
    if (typeof item.update !== 'function') {
      return { success: false, error: `NOT_AN_ITEM: uuid "${input.uuid}" is not an updatable Item` };
    }
    await item.update({ 'flags.-=autoanimations': null });
    // DP-16 verify absence.
    if ((item.flags as any)?.autoanimations !== undefined) {
      return { success: false, error: 'AA_CLEAR_VERIFY_FAILED: flags.autoanimations still present after clear' };
    }
    notify.updated('autoanimations', item.name ?? input.uuid, { summary: 'animation cleared', uuid: input.uuid });
    return { success: true, data: { uuid: input.uuid, name: item.name ?? null, cleared: true } };
  } catch (e) {
    return { success: false, error: `AA_CLEAR_ITEM_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Discovery (DEPENDENCY_GATED on aa.ready) ─────────────────────────────────

type ListAnimInput = Extract<ModuleAutoAnimationsInputType, { action: 'list-animations' }>;

async function handleListAnimations(input: ListAnimInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED' };
  if (!aaDatabaseRef) {
    return {
      success: false,
      error: 'AA_DATABASE_NOT_READY: AA has not fired its aa.ready hook yet (JB2A not compiled, or the module loaded after this one). Retry after the world is fully loaded.',
    };
  }
  try {
    // Navigate AA's menu tree (NOT Sequencer.Database.searchFor — private namespace, ADR-8.1).
    let node: any = aaDatabaseRef;
    const trail: string[] = [];
    if (input.dbSection) {
      node = node?.[input.dbSection];
      trail.push(input.dbSection);
      if (!node) return { success: true, data: { trail, keys: [], count: 0, note: `no dbSection "${input.dbSection}"` } };
    }
    if (input.menuType) {
      node = node?.[input.menuType];
      trail.push(input.menuType);
      if (!node) return { success: true, data: { trail, keys: [], count: 0, note: `no menuType "${input.menuType}"` } };
    }
    const keys = node && typeof node === 'object' ? Object.keys(node) : [];
    return { success: true, data: { trail, keys, count: keys.length } };
  } catch (e) {
    return { success: false, error: `AA_LIST_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Autorec world-config ─────────────────────────────────────────────────────

type GetAutorecInput = Extract<ModuleAutoAnimationsInputType, { action: 'get-autorec' }>;
type MergeAutorecInput = Extract<ModuleAutoAnimationsInputType, { action: 'merge-autorec-entry' }>;

function getAutorecManager(): any {
  const aa = getAA();
  const mgr = aa.AutorecManager;
  if (!mgr) throw new Error('AA_AUTOREC_MANAGER_UNAVAILABLE: AutomatedAnimations.AutorecManager not bound');
  return mgr;
}

async function handleGetAutorec(_input: GetAutorecInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED' };
  try {
    const mgr = getAutorecManager();
    const entries = mgr.getAutorecEntries();
    const counts: Record<string, number> = {};
    for (const cat of ['melee', 'range', 'ontoken', 'templatefx', 'aura', 'preset', 'aefx']) {
      counts[cat] = Array.isArray(entries?.[cat]) ? entries[cat].length : 0;
    }
    return { success: true, data: { counts, version: entries?.version ?? null } };
  } catch (e) {
    return { success: false, error: `AA_GET_AUTOREC_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

async function handleMergeAutorecEntry(input: MergeAutorecInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can write Autorec config' };

  if (input.animation.macro?.enable === true && input.confirmedMacro !== true) {
    return {
      success: false,
      error: 'AA_MACRO_NOT_CONFIRMED: animation.macro.enable=true makes AA run an arbitrary world macro. Re-send with confirmedMacro:true.',
    };
  }

  try {
    const mgr = getAutorecManager();
    const existing = mgr.getAutorecEntries();
    const cat: any[] = Array.isArray(existing?.[input.category]) ? existing[input.category] : [];

    // Duplicate-label check using AA's own normalization (dossier §3g).
    const norm = normalizeLabel(input.label);
    if (cat.some((e: any) => normalizeLabel(e?.label) === norm)) {
      return { success: false, error: `AA_AUTOREC_DUPLICATE_LABEL: an entry labelled "${input.label}" already exists in category "${input.category}" (normalized "${norm}"). mergeMenus would not add a duplicate.` };
    }

    const entry = {
      ...expandToV5(input.animation, input.label),
      label: input.label,
      id: randomId(),
    };

    // AAAutorecManager.mergeMenus is async (autoanimations.js:23111) — MUST await,
    // or the DP-16 re-read below races the unfinished settings write (live smoke
    // AA_MERGE_VERIFY_FAILED, 2026-06-11). Options key is the category flag (:23130).
    //
    // The menu object MUST carry the world's current autorec `version` — mergeMenus runs
    // autoRecMigration.handle() which only skips migration when upToDate(menu) is true
    // (menu.version >= currentVersion, autoanimations.js:20487/14370-style). Without it,
    // AA migrates a partial menu from scratch and throws "Cannot read properties of
    // undefined (reading 'replace')" (live smoke 2026-06-11). Using the existing world
    // version (not greater) also clears the menu.version>currentVersion guard (:23113).
    await mgr.mergeMenus(
      { [input.category]: [entry], version: existing?.version },
      { [input.category]: true },
    );

    // DP-16 verify.
    const after = mgr.getAutorecEntries();
    const found = (Array.isArray(after?.[input.category]) ? after[input.category] : [])
      .find((e: any) => normalizeLabel(e?.label) === norm);
    if (!found) {
      return { success: false, error: `AA_MERGE_VERIFY_FAILED: entry "${input.label}" not found in "${input.category}" after mergeMenus` };
    }

    notify.updated('autoanimations', `Autorec ${input.category}`, { summary: `+ "${input.label}"` });
    return { success: true, data: { category: input.category, label: input.label, added: true } };
  } catch (e) {
    return { success: false, error: `AA_MERGE_AUTOREC_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Manual director play (GM + confirm) ──────────────────────────────────────

type PlayAnimInput = Extract<ModuleAutoAnimationsInputType, { action: 'play-animation' }>;

async function handlePlayAnimation(input: PlayAnimInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can fire director animations' };
  if (input.confirm !== true) {
    return { success: false, error: 'CONFIRM_REQUIRED: play-animation fires a transient Sequencer effect (no undo). Re-send with confirm:true.' };
  }
  if (!input.itemUuid && !input.itemName) {
    return { success: false, error: 'ITEM_REF_REQUIRED: supply itemUuid or itemName so AA can route the animation.' };
  }
  try {
    const aa = getAA();
    if (typeof aa.playAnimation !== 'function') {
      return { success: false, error: 'AA_PLAY_UNAVAILABLE: AutomatedAnimations.playAnimation not bound' };
    }

    const tokenDoc = await resolveDoc(input.sourceTokenUuid);
    if (!tokenDoc) return { success: false, error: `SOURCE_TOKEN_NOT_FOUND: no token at "${input.sourceTokenUuid}"` };
    const sourceToken = tokenDoc.object ?? tokenDoc;

    const item = input.itemUuid ? await resolveDoc(input.itemUuid) : { name: input.itemName };
    if (input.itemUuid && !item) return { success: false, error: `ITEM_NOT_FOUND: no item at "${input.itemUuid}"` };

    // Explicit empty array when no targets supplied (dossier open-q §6: avoid silent
    // fallback to game.user.targets).
    const targets: any[] = [];
    for (const tu of input.targetUuids ?? []) {
      const td = await resolveDoc(tu);
      if (td) targets.push(td.object ?? td);
    }

    const result = await aa.playAnimation(sourceToken, item, { targets });
    const played = result !== false;
    notify.updated('autoanimations', (item as any)?.name ?? input.itemName ?? 'animation', {
      summary: `manual play (${targets.length} target(s))`,
    });
    return { success: true, data: { played, sourceToken: input.sourceTokenUuid, targetCount: targets.length } };
  } catch (e) {
    return { success: false, error: `AA_PLAY_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}
