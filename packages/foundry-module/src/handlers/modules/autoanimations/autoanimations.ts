// DIALOG-PATH: DIALOG_FREE — no Dialog/DialogV2 anywhere in this file. handlePlayAnimation (BUG-795
// fix) DOES await a Hooks.once-tied Promise (`aa.animationEnd`), but that hook is fired
// unconditionally from AA's own animation pipeline (autoanimations.js:17346/17638/17809/18373) —
// never gated behind a user dialog/confirmation — so it carries none of ADR-10.1's dialog-deadlock
// risk (bounded by a timeout regardless). The aa.ready capture below is a separate, unrelated
// Hooks.on listener (module-init capture, not awaited by any handler).
// Module Integration v1 Phase 8 — module-autoanimations handler.
//
// 9-action umbrella for Automated Animations (AA): per-item flag authoring,
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
} from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { Envelope, isGM } from '../_shared/handler-utils.js';
import { buildOutcomeResponse } from '../../../services/shared/outcome-response.js';
import { requireConfirm } from '../../../services/shared/destructive-confirm.js';
import { runWriteSteps, type WriteStep } from '../../../services/shared/resume-boundary.js';
import { verifyFlagWrite } from '../../../utils/verifyWrite.js';
import { boundList } from '../../../services/bounded-response.js';


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

/** Compact human-readable summary of a stored Autorec/item entry's primary animation slot. */
function summarizeAnimation(entry: any): string {
  const v = entry?.primary?.video;
  if (!v) return '(none)';
  if (v.enableCustom) return `custom:${v.customPath ?? '?'}`;
  return `${v.dbSection ?? '?'}/${v.menuType ?? '?'}/${v.animation ?? '?'}`;
}

/**
 * BUG-812(a): compact per-entry projection for the filtered get-autorec read — the full stored
 * entry carries the entire v5 animation tree (secondary/source/target/soundOnly/macro/
 * meleeSwitch), far too heavy for a listing response; project only the fields useful for
 * identifying/inspecting an entry before an update/remove call.
 */
function projectAutorecEntry(e: any): Record<string, unknown> {
  return {
    id: e?.id ?? null,
    label: e?.label ?? null,
    isEnabled: e?.isEnabled ?? null,
    isCustomized: e?.isCustomized ?? null,
    fromAmmo: e?.fromAmmo ?? null,
    menu: e?.menu ?? null,
    version: e?.version ?? null,
    animation: summarizeAnimation(e),
  };
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
    case 'update-autorec-entry': return handleUpdateAutorecEntry(parsed);
    case 'remove-autorec-entry': return handleRemoveAutorecEntry(parsed);
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

// BUG-799: cross-check a complete DB-driven video tuple against AA's own live menu tree (the same
// tree handleListAnimations navigates) BEFORE writing — AA's path builder does not reject an
// unresolvable key at write time, it silently substitutes the first available database choice.
// Best-effort ("when possible" per the fix route): if aaDatabaseRef isn't populated yet (AA hasn't
// fired aa.ready), this check is skipped rather than blocking the write on an unrelated timing gap.
// UNIT-TEST GAP: aaDatabaseRef is captured once via a module-load-time Hooks.once('aa.ready', ...)
// (this file's own header comment: "Hooks unavailable at import (test env)") — no existing test
// seam populates it, matching handleListAnimations' own untested populated-tree path. The
// null-skip branch above IS exercised by every existing test (aaDatabaseRef stays null
// throughout); the populated-tree rejection branch needs a live/F12 Foundry probe to verify.
function unresolvedVideoKey(video: { dbSection?: string | undefined; menuType?: string | undefined; animation?: string | undefined; enableCustom?: boolean | undefined } | undefined): string | null {
  if (!video || video.enableCustom === true) return null; // custom-path videos aren't DB-key-checkable
  if (!video.dbSection || !video.menuType || !video.animation) return null; // incomplete tuples are already rejected by the Zod refine
  if (!aaDatabaseRef) return null; // AA not ready yet — best-effort, do not block the write
  const node = (aaDatabaseRef as any)?.[video.dbSection]?.[video.menuType]?.[video.animation];
  return node === undefined ? `${video.dbSection}/${video.menuType}/${video.animation}` : null;
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

  // BUG-799: reject an unresolvable DB-driven key BEFORE writing, across every video-bearing slot.
  const unresolved = [
    unresolvedVideoKey(input.animation.primary),
    unresolvedVideoKey(input.animation.secondary?.video),
    unresolvedVideoKey(input.animation.source?.video),
    unresolvedVideoKey(input.animation.target?.video),
    unresolvedVideoKey(input.animation.meleeSwitch?.video),
  ].filter((x): x is string => x !== null);
  if (unresolved.length > 0) {
    return {
      success: false,
      error: `AA_VIDEO_KEY_UNRESOLVED: [${unresolved.join(', ')}] do(es) not resolve against AA's live animation database — AA's path builder would silently substitute an arbitrary fallback for this instead of rejecting it. Check list-animations for valid keys.`,
    };
  }

  try {
    const item = await resolveDoc(input.uuid);
    if (!item) return { success: false, error: `ITEM_NOT_FOUND: no document at uuid "${input.uuid}"` };
    if (typeof item.update !== 'function') {
      return { success: false, error: `NOT_AN_ITEM: uuid "${input.uuid}" did not resolve to an updatable Item` };
    }

    const v5 = expandToV5(input.animation, item.name ?? 'item');

    // BUG-797: snapshot the pre-write flag value BEFORE the delete so every post-delete failure
    // branch below can restore it instead of leaving the item flagless. `null` (no prior flag)
    // makes the restore a no-op delete — there was never a "working" flag to lose.
    const snapshot = (item.flags as any)?.autoanimations ?? null;
    const restoreSnapshot = async (): Promise<void> => {
      if (snapshot === null) {
        await item.update({ 'flags.-=autoanimations': null });
        return;
      }
      await item.update({ 'flags.autoanimations': snapshot });
      verifyFlagWrite(item, 'autoanimations', 'version', (snapshot as any)?.version, 'AA_ROLLBACK_VERIFY_FAILED');
    };
    // Best-effort — a rollback-verify failure is reported as a suffix on the ORIGINAL error,
    // never thrown over it (the caller needs to see WHY the write failed first).
    const restoreSnapshotSafe = async (): Promise<string | undefined> => {
      try {
        await restoreSnapshot();
        return undefined;
      } catch (e) {
        return e instanceof Error ? e.message : String(e);
      }
    };

    // Captures whichever step's run() throws so the reconstructed error below carries the exact
    // original message — runWriteSteps() itself does not return it (same `runCapturing` idiom as
    // template-apply.ts's BUG-677 fix).
    let lastStepError: unknown;
    const runCapturing = async <T,>(fn: () => Promise<T>): Promise<T> => {
      try {
        return await fn();
      } catch (err) {
        lastStepError = err;
        throw err;
      }
    };

    // Two-step write (dossier §3a) — clear old, then set — run as runWriteSteps steps so a throw
    // on either write triggers the clear step's `undo` (restoreSnapshot) instead of leaving the
    // item flagless (BUG-797, was the outer catch's uncompensated path).
    const steps: WriteStep[] = [
      {
        label: 'clear-old-flag',
        run: () => runCapturing(async () => {
          await item.update({ 'flags.-=autoanimations': null });
          return { updated: [input.uuid] };
        }),
        undo: restoreSnapshot,
      },
      {
        label: 'set-new-flag',
        run: () => runCapturing(async () => {
          await item.update({ 'flags.autoanimations': v5 });
          return { updated: [input.uuid] };
        }),
      },
    ];
    const stepResult = await runWriteSteps(steps);
    if (stepResult.outcome !== 'applied') {
      const original = lastStepError instanceof Error
        ? lastStepError.message
        : `write step "${stepResult.failedStep}" failed`;
      const rollbackNote = stepResult.receipt.warnings.length > 0 ? ` (${stepResult.receipt.warnings.join('; ')})` : '';
      return {
        success: false,
        error: `AA_SET_ITEM_ERROR: ${original}${rollbackNote}`,
      };
    }

    // DP-16 post-write re-read.
    const written = (item.flags as any)?.autoanimations;
    if (!written || written.version !== 5 || written.isCustomized !== true) {
      // BUG-797: the two-step write itself landed, but content verification failed — restore the
      // pre-write snapshot before returning so the item never ends up flagless.
      const rollbackWarning = await restoreSnapshotSafe();
      return {
        success: false,
        error: `AA_FLAG_VERIFY_FAILED: post-write re-read did not confirm version=5 + isCustomized=true (got version=${written?.version}, isCustomized=${written?.isCustomized})${rollbackWarning ? ` — ROLLBACK_FAILED: ${rollbackWarning}` : ''}`,
      };
    }

    // BUG-799: version/isCustomized alone previously verified NOTHING about the actual requested
    // content — deep-compare every executable field (video/sound/macro/soundOnly across all
    // slots) against what we asked to be written, so a persisted-but-wrong value fails loud
    // instead of reporting success on a "customized" flag that doesn't play what was requested.
    const EXECUTABLE_FIELDS = ['primary', 'secondary', 'source', 'target', 'soundOnly', 'macro', 'meleeSwitch'] as const;
    const contentDrift = EXECUTABLE_FIELDS.filter((f) => JSON.stringify(written[f]) !== JSON.stringify((v5 as any)[f]));
    if (contentDrift.length > 0) {
      // BUG-797: same rollback as the version/isCustomized branch above — content drifted, so
      // restore the pre-write snapshot rather than leaving the wrong (or partial) flag in place.
      const rollbackWarning = await restoreSnapshotSafe();
      return {
        success: false,
        error: `AA_FLAG_CONTENT_NOT_PERSISTED: version/isCustomized landed but these executable field(s) do not match what was requested: [${contentDrift.join(', ')}]${rollbackWarning ? ` — ROLLBACK_FAILED: ${rollbackWarning}` : ''}`,
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

    // BUG-813: read the config that would be destroyed BEFORE the confirm gate, so an
    // unconfirmed call previews exactly what it would delete (blastRadius string — Envelope's
    // success:false branch carries no `data` field, matching item-piles' confirmRequiredEnvelope
    // convention, flow.ts:65-70).
    const currentFlags = (item.flags as any)?.autoanimations ?? null;
    const blastRadius = currentFlags
      ? `item "${item.name ?? input.uuid}" (menu=${currentFlags.menu ?? '?'}, animation=${currentFlags.primary?.video?.animation ?? '?'}, version=${currentFlags.version ?? '?'})`
      : `item "${item.name ?? input.uuid}" (no flags.autoanimations currently set)`;
    // requireConfirm's param type is `{ confirm?: boolean }`; under this repo's
    // exactOptionalPropertyTypes:true, Zod's `.optional()` infers `boolean | undefined`
    // (not exactly-omittable), so pass a normalized boolean rather than `input` directly.
    const refusal = requireConfirm({ confirm: input.confirm === true }, 'clear-item-animation', blastRadius);
    if (refusal) return refusal;

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
type UpdateAutorecInput = Extract<ModuleAutoAnimationsInputType, { action: 'update-autorec-entry' }>;
type RemoveAutorecInput = Extract<ModuleAutoAnimationsInputType, { action: 'remove-autorec-entry' }>;

function getAutorecManager(): any {
  const aa = getAA();
  const mgr = aa.AutorecManager;
  if (!mgr) throw new Error('AA_AUTOREC_MANAGER_UNAVAILABLE: AutomatedAnimations.AutorecManager not bound');
  return mgr;
}

const AUTOREC_CATEGORIES = ['melee', 'range', 'ontoken', 'templatefx', 'aura', 'preset', 'aefx'] as const;

// BUG-812(c): the removal-capable mechanism — direct game.settings.get/.set against
// "aaAutorec-<category>", confirmed by the qa.md second research pass to be EXACTLY what
// AAAutorecManager.getAutorecEntries() itself reads per category (live-bundle-verified,
// autoanimations.js:23018-23030 — each category key returns that category's array directly).
// AutorecManager exposes no delete/remove method; mergeMenus is add-only and would silently
// no-op on a reduced array (qa.md, quoted evidence) — never used here.
function autorecSettingKey(category: string): string {
  return `aaAutorec-${category}`;
}

function readAutorecCategory(category: string): any[] {
  const g = (globalThis as any).game;
  const arr = g?.settings?.get?.('autoanimations', autorecSettingKey(category));
  return Array.isArray(arr) ? arr : [];
}

async function writeAutorecCategory(category: string, entries: any[]): Promise<void> {
  const g = (globalThis as any).game;
  await g.settings.set('autoanimations', autorecSettingKey(category), entries);
}

async function handleGetAutorec(input: GetAutorecInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED' };
  try {
    const mgr = getAutorecManager();
    const entries = mgr.getAutorecEntries();
    const counts: Record<string, number> = {};
    for (const cat of AUTOREC_CATEGORIES) {
      counts[cat] = Array.isArray(entries?.[cat]) ? entries[cat].length : 0;
    }

    // D7 / CCR-7: a parameterless call MUST keep returning the exact pre-fix counts-only
    // shape — only a supplied category/label/limit/offset triggers the heavier per-entry
    // payload below. Existing callers/eval pairs stay byte-unmodified.
    if (input.category === undefined && input.label === undefined && input.limit === undefined && input.offset === undefined) {
      return { success: true, data: { counts, version: entries?.version ?? null } };
    }

    // BUG-812(a): bounded, filtered read — category scope, label substring
    // (normalizeLabel, matching Autorec's own duplicate-check normalization), paged via
    // boundList() (item-directory.ts:60-134 filter->paginate->serialize recipe).
    const categories = input.category ? [input.category] : AUTOREC_CATEGORIES;
    const normNeedle = input.label !== undefined ? normalizeLabel(input.label) : null;
    const filtered: any[] = [];
    for (const cat of categories) {
      const arr: any[] = Array.isArray(entries?.[cat]) ? entries[cat] : [];
      for (const e of arr) {
        if (normNeedle !== null && !normalizeLabel(e?.label).includes(normNeedle)) continue;
        filtered.push(e);
      }
    }
    const bounded = boundList(filtered, { limit: input.limit, offset: input.offset });
    return {
      success: true,
      data: {
        entries: bounded.items.map(projectAutorecEntry),
        totalAvailable: bounded.totalAvailable,
        truncated: bounded.truncated,
        offset: bounded.offset,
        limit: bounded.limit,
      },
    };
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
    //
    // BUG-812(b): surface the MATCHED entry's id/label/menu/animation summary in the error
    // instead of discarding it — the pre-fix message named only the caller's own input,
    // leaving the GM unable to inspect what's actually stored without the AA UI.
    const norm = normalizeLabel(input.label);
    const matched = cat.find((e: any) => normalizeLabel(e?.label) === norm);
    if (matched) {
      return {
        success: false,
        error: `AA_AUTOREC_DUPLICATE_LABEL: an entry labelled "${input.label}" already exists in category "${input.category}" (normalized "${norm}") — id="${matched.id ?? '?'}", label="${matched.label ?? '?'}", menu="${matched.menu ?? '?'}", animation=${summarizeAnimation(matched)}. mergeMenus would not add a duplicate. Inspect via get-autorec {category, label}; update/remove via the new actions.`,
      };
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

// BUG-812(c): update a stored Autorec entry by id (label and/or animation) — confirm-gated,
// snapshot + DP-16 re-read + restore-on-verify-fail, direct game.settings write (D5/D6).
async function handleUpdateAutorecEntry(input: UpdateAutorecInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can write Autorec config' };

  // Handler-side "at least one of label/animation" — discriminatedUnion cannot host a
  // `.refine()`'d member (schemas.ts comment above the union entry).
  if (input.label === undefined && input.animation === undefined) {
    return {
      success: false,
      error: 'AA_AUTOREC_UPDATE_EMPTY: at least one of label/animation must be supplied to update-autorec-entry.',
    };
  }

  if (input.animation?.macro?.enable === true && input.confirmedMacro !== true) {
    return {
      success: false,
      error: 'AA_MACRO_NOT_CONFIRMED: animation.macro.enable=true makes AA run an arbitrary world macro. Re-send with confirmedMacro:true.',
    };
  }

  try {
    const before = readAutorecCategory(input.category);
    const idx = before.findIndex((e: any) => e?.id === input.id);
    if (idx === -1) {
      return {
        success: false,
        error: `AA_AUTOREC_ENTRY_NOT_FOUND: no entry with id "${input.id}" in category "${input.category}". Inspect via get-autorec {category:"${input.category}"} to find the id.`,
      };
    }
    const matched = before[idx];
    const newLabel = input.label ?? matched.label;

    // Blast-radius preview BEFORE the confirm gate (handleClearItemAnimation shape, D6).
    const blastRadius = `Autorec entry "${matched.label ?? '?'}" (id=${matched.id}, category="${input.category}", menu="${matched.menu ?? '?'}", animation=${summarizeAnimation(matched)})`
      + `${input.label !== undefined ? ` → label="${input.label}"` : ''}${input.animation !== undefined ? ', animation replaced' : ''}`;
    // Same exactOptionalPropertyTypes normalization as handleClearItemAnimation (:469-472).
    const refusal = requireConfirm({ confirm: input.confirm === true }, 'update-autorec-entry', blastRadius);
    if (refusal) return refusal;

    // Patch: label-only leaves every other field untouched; a supplied animation rebuilds the
    // entry via the same expandToV5 recipe merge-autorec-entry uses, preserving the original id.
    const patched = input.animation !== undefined
      ? { ...expandToV5(input.animation, newLabel), id: matched.id, label: newLabel }
      : { ...matched, label: newLabel };

    const snapshot = before;
    const after = before.map((e: any, i: number) => (i === idx ? patched : e));
    await writeAutorecCategory(input.category, after);

    // DP-16 fresh re-read — verify the patched entry (not the pre-write `after` array) actually
    // persisted, by value.
    const verifyRead = readAutorecCategory(input.category);
    const verified = verifyRead.find((e: any) => e?.id === input.id);
    const persisted = verified !== undefined && JSON.stringify(verified) === JSON.stringify(patched);
    if (!persisted) {
      let rolledBack = true;
      try {
        await writeAutorecCategory(input.category, snapshot);
      } catch {
        rolledBack = false;
      }
      return {
        success: false,
        error: `AA_AUTOREC_UPDATE_NOT_PERSISTED: entry "${input.id}" in category "${input.category}" did not verify after update (rolledBack: ${rolledBack})`,
      };
    }

    notify.updated('autoanimations', `Autorec ${input.category}`, { summary: `~ "${patched.label}"` });
    return { success: true, data: { category: input.category, id: input.id, label: patched.label, updated: true } };
  } catch (e) {
    return { success: false, error: `AA_UPDATE_AUTOREC_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// BUG-812(c): remove a stored Autorec entry by id — confirm-gated, snapshot + DP-16 re-read +
// restore-on-verify-fail, direct game.settings write (D5/D6; qa.md second research pass LAW).
async function handleRemoveAutorecEntry(input: RemoveAutorecInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can write Autorec config' };

  try {
    const before = readAutorecCategory(input.category);
    const matched = before.find((e: any) => e?.id === input.id);
    if (!matched) {
      return {
        success: false,
        error: `AA_AUTOREC_ENTRY_NOT_FOUND: no entry with id "${input.id}" in category "${input.category}". Inspect via get-autorec {category:"${input.category}"} to find the id.`,
      };
    }

    // Blast-radius preview BEFORE the confirm gate (handleClearItemAnimation shape, D6).
    const blastRadius = `Autorec entry "${matched.label ?? '?'}" (id=${matched.id}, category="${input.category}", menu="${matched.menu ?? '?'}", animation=${summarizeAnimation(matched)})`;
    const refusal = requireConfirm({ confirm: input.confirm === true }, 'remove-autorec-entry', blastRadius);
    if (refusal) return refusal;

    const snapshot = before;
    const after = before.filter((e: any) => e?.id !== input.id);
    await writeAutorecCategory(input.category, after);

    // DP-16 fresh re-read — verify the id is genuinely absent.
    const verifyRead = readAutorecCategory(input.category);
    const stillPresent = verifyRead.some((e: any) => e?.id === input.id);
    if (stillPresent) {
      let rolledBack = true;
      try {
        await writeAutorecCategory(input.category, snapshot);
      } catch {
        rolledBack = false;
      }
      return {
        success: false,
        error: `AA_AUTOREC_REMOVE_NOT_PERSISTED: entry "${input.id}" still present in category "${input.category}" after remove (rolledBack: ${rolledBack})`,
      };
    }

    notify.updated('autoanimations', `Autorec ${input.category}`, { summary: `- "${matched.label ?? input.id}"` });
    return { success: true, data: { category: input.category, id: input.id, label: matched.label ?? null, removed: true } };
  } catch (e) {
    return { success: false, error: `AA_REMOVE_AUTOREC_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Manual director play (GM + confirm) ──────────────────────────────────────

type PlayAnimInput = Extract<ModuleAutoAnimationsInputType, { action: 'play-animation' }>;

type AnimationEndSignal = 'ended' | 'no-target' | 'timeout';

// BUG-795: AA's exported playAnimation() (autoanimations.js:18686-18708) fires its internal
// trafficCop$1(handler) WITHOUT awaiting it, then returns `handler` — always truthy unless `item`
// itself is falsy, and completely unrelated to whether trafficCop actually dispatched anything.
// The old `result !== false` check was therefore true almost unconditionally. AA fires real
// lifecycle hooks unconditionally from its own pipeline instead: `aa.animationStart`/
// `aa.animationEnd(sourceToken, targetsOrNoTarget)`, including a `"no-target"` signal at the exact
// melee/range-exits-for-zero-targets path this bug names (autoanimations.js:17809/18373). Observe
// that instead of trusting playAnimation()'s return value. Bounded by a timeout — an animation
// that hasn't signaled completion within budget is reported honestly as unconfirmed, never as a
// fabricated success (fix route: "return an honest queued state rather than fabricated completion").
// Ephemeral — hooksApi.off in finally{}, same self-cleaning shape as actor-update-observer.ts's
// waitForActorUpdateCommit (check-signal-hooks.mjs's own precedent exemption).
async function observeAnimationEnd(sourceToken: unknown, timeoutMs: number): Promise<AnimationEndSignal> {
  const hooksApi: any = (globalThis as any).Hooks;
  if (!hooksApi?.on || !hooksApi?.off) return 'timeout';

  let hookId: number | undefined;
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  try {
    return await new Promise<AnimationEndSignal>((resolve) => {
      hookId = hooksApi.on('aa.animationEnd', (tok: unknown, tgts: unknown) => {
        if (tok !== sourceToken) return; // scope strictly to THIS call's source token
        resolve(tgts === 'no-target' ? 'no-target' : 'ended');
      });
      timeoutHandle = setTimeout(() => resolve('timeout'), timeoutMs);
    });
  } finally {
    if (hookId !== undefined) hooksApi.off('aa.animationEnd', hookId);
    if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
  }
}

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

    // BUG-795: unresolved target UUIDs were previously dropped silently, so a typo'd/stale target
    // UUID could shrink the played target count below what the GM requested without any signal.
    // Explicit empty array when no targets supplied at all (dossier open-q §6: avoid silent
    // fallback to game.user.targets) is preserved — only a UUID that was SUPPLIED and failed to
    // resolve is now an error.
    const targets: any[] = [];
    const unresolvedTargets: string[] = [];
    for (const tu of input.targetUuids ?? []) {
      const td = await resolveDoc(tu);
      if (td) targets.push(td.object ?? td);
      else unresolvedTargets.push(tu);
    }
    if (unresolvedTargets.length > 0) {
      return {
        success: false,
        error: `TARGET_NOT_FOUND: could not resolve target UUID(s) [${unresolvedTargets.join(', ')}] — supply valid token/actor UUIDs or omit targetUuids entirely.`,
      };
    }

    const AA_ANIMATION_END_TIMEOUT_MS = 3000;
    const endObserved = observeAnimationEnd(sourceToken, AA_ANIMATION_END_TIMEOUT_MS);
    await aa.playAnimation(sourceToken, item, { targets });
    const endSignal = await endObserved;

    const played = endSignal === 'ended';
    const outcome = endSignal === 'ended' ? 'applied' : (endSignal === 'no-target' ? 'failed' : 'partial');
    if (played) {
      notify.updated('autoanimations', (item as any)?.name ?? input.itemName ?? 'animation', {
        summary: `manual play (${targets.length} target(s))`,
      });
    }
    return {
      success: true,
      data: buildOutcomeResponse(outcome, {
        played,
        sourceToken: input.sourceTokenUuid,
        targetCount: targets.length,
        endSignal,
        ...(endSignal === 'timeout' ? { note: `no aa.animationEnd signal observed within ${AA_ANIMATION_END_TIMEOUT_MS}ms — dispatch is unconfirmed, not a fabricated success` } : {}),
        ...(endSignal === 'no-target' ? { note: 'AA exited via its own zero-target path (melee/range playback found nothing to animate against)' } : {}),
      }),
    };
  } catch (e) {
    return { success: false, error: `AA_PLAY_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}
