// Module Integration v1 Phase 2 — module-matt handler (Monk's Active Tiles).
//
// Expands the Phase-1 stub into the full ~17-action umbrella. Conditional on
// monks-active-tiles being active: requireModuleActive RETURNS the failure envelope
// (never throws — carry-forward §Discoveries) and is the FIRST executable statement.
//
// Validation standard (dossier §3): catalog-driven (action-catalog.ts) — strict Zod for
// high-value/dangerous actions + raw-with-warning long tail. Every write: catalog-validate →
// scene/region.update → DP-16 post-read of _source → notify.* (CCR-3).
//
// Phase split (filled across sub-phases; each leaves a green tree):
//   2A: reads (get-capabilities/get-trigger-tile/list-trigger-tiles/validate-sequence)
//       + create-trigger-tile + update-trigger-config.
//   2B: sequence editing + set-variables + reset-history.
//   2C: fire-trigger + link-region-trigger + destructive safety finalization.
//
// Anchors:
//   - PRD R3/R17/R18; CCR-1 (guard), CCR-3 (notify), CCR-4 (preview/confirm), CCR-5 (schema).
//   - DP-15 (typed), DP-16 (post-write verify), exhaustiveness via const _exhaustive:never.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ModuleMattInput, type ModuleMattInputType, type MattActionObjType } from './schemas.js';
import {
  TRIGGER_MODES,
  ACTION_CATALOG,
  ACTION_KEYS,
  isDangerousAction,
  validateSequence,
  makeMattId,
  type MattActionInput,
} from './action-catalog.js';
import { notify } from '../../../notify.js';

const MATT_MODULE_ID = 'monks-active-tiles';
const MATT_FLAG = 'monks-active-tiles';

// ── Envelope ──────────────────────────────────────────────────────────────────
type Envelope<T> = { success: true; data: T } | { success: false; error: string };

// ── Local helpers (mirror region.ts; kept package-local, CCR-5) ───────────────

function isGM(): boolean {
  return Boolean((globalThis as any).game?.user?.isGM);
}

function deepStripUndefined<T>(value: T): T {
  if (Array.isArray(value)) return value.map(deepStripUndefined) as any;
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      if (v === undefined) continue;
      out[k] = deepStripUndefined(v);
    }
    return out as any;
  }
  return value;
}

function getSceneOrThrow(sceneId: string): any {
  const scene = (globalThis as any).game?.scenes?.get(sceneId);
  if (!scene) throw new Error(`SCENE_NOT_FOUND: no Scene with id "${sceneId}"`);
  return scene;
}

function getActiveSceneOrThrow(): any {
  const scene = (globalThis as any).game?.scenes?.active;
  if (!scene) throw new Error('NO_ACTIVE_SCENE: no scene is currently active');
  return scene;
}

/** Resolve a tile UUID (Scene.<sid>.Tile.<tid>) to its scene + tile document. */
function getTileByUuidOrThrow(uuid: string): { scene: any; tile: any } {
  const sync = (globalThis as any).fromUuidSync;
  if (typeof sync === 'function') {
    try {
      const tile = sync(uuid);
      if (tile) {
        const scene = tile.parent ?? tile.scene ?? null;
        if (scene) return { scene, tile };
      }
    } catch {
      // fall through to manual parse
    }
  }
  const m = /^Scene\.([^.]+)\.Tile\.([^.]+)$/.exec(uuid);
  if (m) {
    const scene = (globalThis as any).game?.scenes?.get(m[1]);
    const tile = scene?.tiles?.get(m[2]);
    if (scene && tile) return { scene, tile };
  }
  throw new Error(`MATT_TILE_NOT_FOUND: no Tile resolvable from uuid "${uuid}"`);
}

/** Read the persisted MATT flag block from _source (F08-safe). */
function readMattFlags(tile: any): Record<string, any> {
  return (tile._source?.flags?.[MATT_FLAG] ?? tile.flags?.[MATT_FLAG] ?? {}) as Record<string, any>;
}

/** Mint ids for any action lacking one; coerce to {id, action, data}. */
function normalizeActions(actions: MattActionObjType[] | MattActionInput[]): Array<{ id: string; action: string; data: Record<string, unknown> }> {
  return (actions ?? []).map((a) => ({
    id: a.id ?? makeMattId(),
    action: a.action,
    data: (a.data ?? {}) as Record<string, unknown>,
  }));
}

/** Impact report for a payload containing dangerous actions (CCR-4). */
function buildImpactReport(actions: Array<{ action: string; data: Record<string, unknown> }>): {
  dangerous: Array<{ action: string; risk: string; body?: string }>;
} {
  const dangerous: Array<{ action: string; risk: string; body?: string }> = [];
  for (const a of actions) {
    if (!isDangerousAction(a.action)) continue;
    const entry: { action: string; risk: string; body?: string } = {
      action: a.action,
      risk:
        ACTION_CATALOG[a.action]?.repairGated
          ? 'REPAIR_GATED — no WFRP4e adapter; fires generic or errors'
          : 'SUPPORTED_WITH_CONFIRMATION — destructive/elevated-risk',
    };
    // Surface the source-visible body for code/macro actions (dossier §4).
    if (a.action === 'runcode' && typeof a.data?.code === 'string') entry.body = a.data.code as string;
    if (a.action === 'runmacro' && a.data?.entity != null) {
      let body = `macro=${JSON.stringify(a.data.entity)}`;
      // Resolve macro UUID and append source command (dossier §4 — surface source-visible body for safety preview).
      const ent: any = a.data.entity;
      const uuid: string | null =
        typeof ent === 'string' ? ent : (typeof ent?.id === 'string' ? ent.id : null);
      if (uuid && uuid.includes('Macro.')) {
        try {
          const resolver =
            (globalThis as any).fromUuidSync ?? (globalThis as any).foundry?.utils?.fromUuidSync;
          const macro: any = resolver?.(uuid);
          const command = macro?.command;
          if (typeof command === 'string' && command.length > 0) {
            body += `\ncommand=\n${command}`;
          }
        } catch {
          // Unresolvable — keep entity-only body (safe default).
        }
      }
      entry.body = body;
    }
    dangerous.push(entry);
  }
  return { dangerous };
}

// ── Dispatcher ───────────────────────────────────────────────────────────────

/**
 * Dispatch a `module-matt` umbrella request.
 *
 * Guard FIRST (returns MODULE_NOT_ACTIVE when monks-active-tiles is absent/inactive),
 * then strict-parse, then switch over all 17 actions with a compile-time exhaustiveness check.
 */
export async function dispatchModuleMatt(data: unknown): Promise<Envelope<unknown>> {
  // Guard — requireModuleActive RETURNS {success:false,error}; never throws (carry-forward).
  const guard = requireModuleActive(MATT_MODULE_ID);
  if (guard) return guard;

  // Strict-parse via the package-local discriminated union.
  let input: ModuleMattInputType;
  try {
    input = ModuleMattInput.parse(data);
  } catch (e) {
    return { success: false, error: `MATT_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  // Writes are GM-gated.
  const WRITE_ACTIONS = new Set([
    'create-trigger-tile', 'update-trigger-config', 'replace-action-sequence', 'add-action',
    'insert-action', 'update-action', 'remove-action', 'reorder-actions', 'duplicate-action',
    'set-variables', 'reset-history', 'fire-trigger', 'link-region-trigger',
  ]);
  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `MATT_ACCESS_DENIED: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      // — reads —
      case 'get-capabilities':
        return handleGetCapabilities();
      case 'get-trigger-tile':
        return handleGetTriggerTile(input.tileUuid);
      case 'list-trigger-tiles':
        return handleListTriggerTiles(input.sceneId);
      case 'validate-sequence':
        return handleValidateSequence(input.actions);

      // — create + config (2A.6) —
      case 'create-trigger-tile':
        return handleCreateTriggerTile(input);
      case 'update-trigger-config':
        return handleUpdateTriggerConfig(input);

      // — sequence editing (2B) —
      case 'replace-action-sequence':
        return handleReplaceActionSequence(input);
      case 'add-action':
        return handleAddAction(input);
      case 'insert-action':
        return handleInsertAction(input);
      case 'update-action':
        return handleUpdateAction(input);
      case 'remove-action':
        return handleRemoveAction(input);
      case 'reorder-actions':
        return handleReorderActions(input);
      case 'duplicate-action':
        return handleDuplicateAction(input);

      // — state (2B) —
      case 'set-variables':
        return handleSetVariables(input);
      case 'reset-history':
        return handleResetHistory(input);

      // — runtime + region (2C) —
      case 'fire-trigger':
        return handleFireTrigger(input);
      case 'link-region-trigger':
        return handleLinkRegionTrigger(input);

      default: {
        const _exhaustive: never = input;
        return { success: false, error: `MATT_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `MATT_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Read handlers (2A.4) ───────────────────────────────────────────────────────

function handleGetCapabilities(): Envelope<unknown> {
  const matt = (globalThis as any).game?.MonksActiveTiles;
  const registeredActions = matt?.triggerActions ? Object.keys(matt.triggerActions) : [];
  const groups = matt?.triggerGroups ? Object.keys(matt.triggerGroups) : ['actions', 'logic', 'filters'];

  const modules = (globalThis as any).game?.modules;
  const depActive = (id: string): boolean => Boolean(modules?.get?.(id)?.active);
  const optionalDeps = {
    tagger: depActive('tagger'),
    levels: depActive('levels'),
    sequencer: depActive('sequencer'),
    jb2a: depActive('jb2a') || depActive('jb2a_patreon'),
    'forien-quest-log': depActive('forien-quest-log'),
    'monks-enhanced-journal': depActive('monks-enhanced-journal'),
    'lib-wrapper': depActive('lib-wrapper'),
    'party-inventory': depActive('party-inventory'),
  };

  // MATT world settings (best-effort read; absent → omitted).
  const settingKeys = ['default-trigger', 'default-restricted', 'default-controlled', 'allow-player',
    'allow-door', 'teleport-wash', 'prevent-when-paused'];
  const settings: Record<string, unknown> = {};
  for (const k of settingKeys) {
    try {
      settings[k] = (globalThis as any).game?.settings?.get?.(MATT_MODULE_ID, k);
    } catch {
      // setting not registered — skip
    }
  }

  return {
    success: true,
    data: {
      triggers: [...TRIGGER_MODES],
      actions: ACTION_KEYS.map((key) => ({ key, ...ACTION_CATALOG[key] })),
      dangerousActions: ACTION_KEYS.filter((k) => isDangerousAction(k)),
      groups,
      registeredActions,
      optionalDeps,
      settings,
      counts: { triggers: TRIGGER_MODES.length, builtinActions: ACTION_KEYS.length },
    },
  };
}

function handleGetTriggerTile(tileUuid: string): Envelope<unknown> {
  const { scene, tile } = getTileByUuidOrThrow(tileUuid);
  const flags = readMattFlags(tile);
  return {
    success: true,
    data: {
      uuid: tile.uuid ?? `Scene.${scene.id}.Tile.${tile.id}`,
      tileId: tile.id,
      sceneId: scene.id,
      name: flags.name ?? tile.name ?? null,
      active: flags.active ?? null,
      trigger: flags.trigger ?? null,
      restriction: flags.restriction ?? null,
      controlled: flags.controlled ?? null,
      chance: flags.chance ?? null,
      pertoken: flags.pertoken ?? null,
      cooldown: flags.cooldown ?? null,
      actions: flags.actions ?? [],
      variables: flags.variables ?? {},
      history: flags.history ?? {},
      config: flags,
    },
  };
}

function handleListTriggerTiles(sceneId?: string): Envelope<unknown> {
  const scene = sceneId ? getSceneOrThrow(sceneId) : getActiveSceneOrThrow();
  const tiles = Array.from(scene.tiles?.values?.() ?? []) as any[];
  const mattTiles = tiles
    .filter((t) => (t._source?.flags?.[MATT_FLAG] ?? t.flags?.[MATT_FLAG]) != null)
    .map((t) => {
      const flags = readMattFlags(t);
      return {
        uuid: t.uuid ?? `Scene.${scene.id}.Tile.${t.id}`,
        tileId: t.id,
        name: flags.name ?? null,
        active: flags.active ?? null,
        trigger: flags.trigger ?? null,
        actionCount: Array.isArray(flags.actions) ? flags.actions.length : 0,
      };
    });
  return { success: true, data: { sceneId: scene.id, count: mattTiles.length, tiles: mattTiles } };
}

function handleValidateSequence(actions: MattActionObjType[]): Envelope<unknown> {
  const result = validateSequence(actions as MattActionInput[]);
  return { success: true, data: result };
}

// ── Create + config (2A.6) ─────────────────────────────────────────────────────

type CreateInput = Extract<ModuleMattInputType, { action: 'create-trigger-tile' }>;
type UpdateConfigInput = Extract<ModuleMattInputType, { action: 'update-trigger-config' }>;

async function handleCreateTriggerTile(input: CreateInput): Promise<Envelope<unknown>> {
  const scene = getSceneOrThrow(input.sceneId);

  const actions = normalizeActions(input.actions ?? []);
  if (actions.length > 0) {
    const v = validateSequence(actions);
    if (!v.valid) {
      return { success: false, error: `MATT_SEQUENCE_INVALID: ${v.errors.join('; ')}` };
    }
    // Dangerous initial actions require confirm:true (CCR-4).
    if (v.dangerous.length > 0 && input.confirm !== true) {
      return {
        success: false,
        error: `MATT_CONFIRM_REQUIRED: initial actions include dangerous action(s) [${v.dangerous.join(', ')}]. Re-send with confirm:true.`,
      };
    }
  }

  const flagConfig: Record<string, unknown> = deepStripUndefined({
    active: input.active ?? true,
    record: input.record,
    restriction: input.restriction,
    controlled: input.controlled,
    allowpaused: input.allowpaused,
    usealpha: input.usealpha,
    pointer: input.pointer,
    vision: input.vision,
    pertoken: input.pertoken,
    minrequired: input.minrequired,
    cooldown: input.cooldown,
    chance: input.chance,
    name: input.name,
    files: input.files,
    fileindex: input.fileindex,
    trigger: input.trigger,
    actions,
    variables: {},
  });

  const tilePayload: Record<string, unknown> = {
    x: input.x,
    y: input.y,
    width: input.width ?? 100,
    height: input.height ?? 100,
    hidden: false,
    flags: { [MATT_FLAG]: flagConfig },
  };
  if (input.img) tilePayload.texture = { src: input.img };

  const created = await scene.createEmbeddedDocuments('Tile', [tilePayload]);
  if (!created || created.length === 0) {
    return { success: false, error: 'MATT_TILE_NOT_PERSISTED: createEmbeddedDocuments returned no doc' };
  }
  const persisted = scene.tiles.get(created[0].id);
  // DP-16 — re-read _source flags and confirm trigger persisted.
  const persistedFlags = (persisted?._source?.flags?.[MATT_FLAG] ?? {}) as Record<string, any>;
  if (!persistedFlags || JSON.stringify(persistedFlags.trigger) !== JSON.stringify(input.trigger)) {
    return { success: false, error: 'MATT_TILE_NOT_PERSISTED: trigger flag not present after create' };
  }

  const uuid = persisted.uuid ?? `Scene.${scene.id}.Tile.${persisted.id}`;
  notify.created('tile', (input.name as string) ?? `MATT tile ${persisted.id}`, { uuid });

  return {
    success: true,
    data: {
      tileId: persisted.id,
      uuid,
      sceneId: scene.id,
      trigger: persistedFlags.trigger,
      actionCount: Array.isArray(persistedFlags.actions) ? persistedFlags.actions.length : 0,
      name: input.name ?? null,
    },
  };
}

async function handleUpdateTriggerConfig(input: UpdateConfigInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);

  const patch: Record<string, unknown> = {};
  if (input.trigger) patch[`flags.${MATT_FLAG}.trigger`] = input.trigger;
  for (const [k, v] of Object.entries(input.config ?? {})) {
    if (v !== undefined) patch[`flags.${MATT_FLAG}.${k}`] = v;
  }
  if (Object.keys(patch).length === 0) {
    return { success: false, error: 'MATT_EMPTY_PAYLOAD: update-trigger-config requires trigger or at least one config field' };
  }

  await tile.update(patch);

  // DP-16 — re-read _source and verify each patched key.
  const persistedFlags = (tile._source?.flags?.[MATT_FLAG] ?? {}) as Record<string, any>;
  const verified: string[] = [];
  if (input.trigger) {
    if (JSON.stringify(persistedFlags.trigger) !== JSON.stringify(input.trigger)) {
      return { success: false, error: 'MATT_CONFIG_NOT_PERSISTED: trigger did not persist' };
    }
    verified.push('trigger');
  }
  for (const [k, v] of Object.entries(input.config ?? {})) {
    if (v === undefined) continue;
    // scalar compare; arrays (files) compared by JSON.
    const got = persistedFlags[k];
    const ok = Array.isArray(v) ? JSON.stringify(got) === JSON.stringify(v) : got === v;
    if (!ok) {
      return { success: false, error: `MATT_CONFIG_NOT_PERSISTED: "${k}" did not persist (got ${JSON.stringify(got)})` };
    }
    verified.push(k);
  }

  const uuid = tile.uuid ?? `Scene.${scene.id}.Tile.${tile.id}`;
  notify.updated('tile', (persistedFlags.name as string) ?? `MATT tile ${tile.id}`, {
    summary: `config: ${verified.join(', ')}`,
    uuid,
  });

  return { success: true, data: { uuid, tileId: tile.id, sceneId: scene.id, updated: verified } };
}

// ── Sequence editing (2B — implemented in Phase 2B) ────────────────────────────

type ReplaceSeqInput = Extract<ModuleMattInputType, { action: 'replace-action-sequence' }>;
type AddActionInput = Extract<ModuleMattInputType, { action: 'add-action' }>;
type InsertActionInput = Extract<ModuleMattInputType, { action: 'insert-action' }>;
type UpdateActionInput = Extract<ModuleMattInputType, { action: 'update-action' }>;
type RemoveActionInput = Extract<ModuleMattInputType, { action: 'remove-action' }>;
type ReorderActionsInput = Extract<ModuleMattInputType, { action: 'reorder-actions' }>;
type DuplicateActionInput = Extract<ModuleMattInputType, { action: 'duplicate-action' }>;
type SetVariablesInput = Extract<ModuleMattInputType, { action: 'set-variables' }>;
type ResetHistoryInput = Extract<ModuleMattInputType, { action: 'reset-history' }>;
type FireTriggerInput = Extract<ModuleMattInputType, { action: 'fire-trigger' }>;
type LinkRegionInput = Extract<ModuleMattInputType, { action: 'link-region-trigger' }>;

type StoredAction = { id: string; action: string; data: Record<string, unknown> };

function readActions(tile: any): StoredAction[] {
  const flags = readMattFlags(tile);
  return Array.isArray(flags.actions) ? (flags.actions as StoredAction[]) : [];
}

/**
 * Catalog-validate + confirm-gate + write a full actions array, then DP-16 re-read.
 * Shared by every sequence-edit action (CCR-3/CCR-4/DP-16).
 */
async function writeActions(
  scene: any,
  tile: any,
  newActions: StoredAction[],
  confirm: boolean | undefined,
  opSummary: string,
  extra?: Record<string, unknown>,
): Promise<Envelope<unknown>> {
  const v = validateSequence(newActions);
  if (!v.valid) {
    return { success: false, error: `MATT_SEQUENCE_INVALID: ${v.errors.join('; ')}` };
  }
  if (v.dangerous.length > 0 && confirm !== true) {
    const impact = buildImpactReport(newActions);
    return {
      success: false,
      error: `MATT_CONFIRM_REQUIRED: sequence contains dangerous action(s) [${v.dangerous.join(', ')}]. Review impact and re-send with confirm:true. impact=${JSON.stringify(impact.dangerous)}`,
    };
  }

  await tile.update({ [`flags.${MATT_FLAG}.actions`]: newActions });

  // DP-16 — re-read _source and confirm the count persisted.
  const persisted = readActions(tile);
  if (persisted.length !== newActions.length) {
    return { success: false, error: `MATT_ACTIONS_NOT_PERSISTED: expected ${newActions.length} action(s), found ${persisted.length}` };
  }

  const uuid = tile.uuid ?? `Scene.${scene.id}.Tile.${tile.id}`;
  const flags = readMattFlags(tile);
  notify.updated('tile', (flags.name as string) ?? `MATT tile ${tile.id}`, { summary: opSummary, uuid });

  return {
    success: true,
    data: {
      uuid,
      tileId: tile.id,
      actionCount: persisted.length,
      actions: persisted.map((a) => ({ id: a.id, action: a.action })),
      ...(extra ?? {}),
    },
  };
}

async function handleReplaceActionSequence(input: ReplaceSeqInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);
  const newActions = normalizeActions(input.actions);
  return writeActions(scene, tile, newActions, input.confirm, `replaced sequence (${newActions.length} action(s))`);
}

async function handleAddAction(input: AddActionInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);
  const current = readActions(tile);
  const added = normalizeActions([input.mattAction])[0];
  return writeActions(scene, tile, [...current, added], input.confirm, `added action "${added.action}"`, { actionId: added.id });
}

async function handleInsertAction(input: InsertActionInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);
  const current = readActions(tile);
  if (input.index > current.length) {
    return { success: false, error: `MATT_INDEX_OUT_OF_RANGE: index ${input.index} > length ${current.length}` };
  }
  const inserted = normalizeActions([input.mattAction])[0];
  const next = [...current];
  next.splice(input.index, 0, inserted);
  return writeActions(scene, tile, next, input.confirm, `inserted action "${inserted.action}" at ${input.index}`, { actionId: inserted.id });
}

async function handleUpdateAction(input: UpdateActionInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);
  const current = readActions(tile);
  const idx = current.findIndex((a) => a.id === input.actionId);
  if (idx === -1) {
    return { success: false, error: `MATT_ACTION_NOT_FOUND: no action with id "${input.actionId}"` };
  }
  const next = [...current];
  next[idx] = {
    id: input.actionId,
    action: input.newActionKey ?? current[idx].action,
    data: input.data,
  };
  return writeActions(scene, tile, next, input.confirm, `updated action ${input.actionId}`, { actionId: input.actionId });
}

async function handleRemoveAction(input: RemoveActionInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);
  const current = readActions(tile);
  const next = current.filter((a) => a.id !== input.actionId);
  if (next.length === current.length) {
    return { success: false, error: `MATT_ACTION_NOT_FOUND: no action with id "${input.actionId}"` };
  }
  return writeActions(scene, tile, next, input.confirm, `removed action ${input.actionId}`, { actionId: input.actionId });
}

async function handleReorderActions(input: ReorderActionsInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);
  const current = readActions(tile);
  const byId = new Map(current.map((a) => [a.id, a]));
  if (input.order.length !== current.length || !input.order.every((id) => byId.has(id))) {
    return {
      success: false,
      error: `MATT_REORDER_MISMATCH: order must be a permutation of the ${current.length} existing action id(s)`,
    };
  }
  const next = input.order.map((id) => byId.get(id) as StoredAction);
  return writeActions(scene, tile, next, input.confirm, 'reordered actions');
}

async function handleDuplicateAction(input: DuplicateActionInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);
  const current = readActions(tile);
  const idx = current.findIndex((a) => a.id === input.actionId);
  if (idx === -1) {
    return { success: false, error: `MATT_ACTION_NOT_FOUND: no action with id "${input.actionId}"` };
  }
  const clone: StoredAction = {
    id: makeMattId(),
    action: current[idx].action,
    data: JSON.parse(JSON.stringify(current[idx].data ?? {})),
  };
  const next = [...current];
  next.splice(idx + 1, 0, clone);
  return writeActions(scene, tile, next, input.confirm, `duplicated action ${input.actionId}`, { actionId: clone.id });
}

async function handleSetVariables(input: SetVariablesInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);
  const flags = readMattFlags(tile);
  const merged = { ...(flags.variables ?? {}), ...input.variables };

  await tile.update({ [`flags.${MATT_FLAG}.variables`]: merged });

  // DP-16 — re-read and confirm every requested key persisted.
  const persisted = (readMattFlags(tile).variables ?? {}) as Record<string, unknown>;
  for (const [k, val] of Object.entries(input.variables)) {
    if (JSON.stringify(persisted[k]) !== JSON.stringify(val)) {
      return { success: false, error: `MATT_VARIABLE_NOT_PERSISTED: "${k}" did not persist` };
    }
  }

  const uuid = tile.uuid ?? `Scene.${scene.id}.Tile.${tile.id}`;
  notify.updated('tile', (flags.name as string) ?? `MATT tile ${tile.id}`, {
    summary: `variables: ${Object.keys(input.variables).join(', ')}`,
    uuid,
  });
  return { success: true, data: { uuid, tileId: tile.id, variables: persisted } };
}

async function handleResetHistory(input: ResetHistoryInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);
  const flags = readMattFlags(tile);
  const history = { ...(flags.history ?? {}) } as Record<string, unknown>;

  let cleared: string;
  if (input.tokenId) {
    delete history[input.tokenId];
    await tile.update({ [`flags.${MATT_FLAG}.history`]: history });
    cleared = `token ${input.tokenId}`;
  } else {
    await tile.update({ [`flags.${MATT_FLAG}.history`]: {} });
    cleared = 'all tokens';
  }

  // DP-16 — re-read.
  const persisted = (readMattFlags(tile).history ?? {}) as Record<string, unknown>;
  if (input.tokenId && persisted[input.tokenId] !== undefined) {
    return { success: false, error: `MATT_HISTORY_NOT_CLEARED: token ${input.tokenId} still present` };
  }
  if (!input.tokenId && Object.keys(persisted).length !== 0) {
    return { success: false, error: 'MATT_HISTORY_NOT_CLEARED: history not empty after reset' };
  }

  const uuid = tile.uuid ?? `Scene.${scene.id}.Tile.${tile.id}`;
  notify.updated('tile', (flags.name as string) ?? `MATT tile ${tile.id}`, { summary: `reset history (${cleared})`, uuid });
  return { success: true, data: { uuid, tileId: tile.id, cleared } };
}

// ── Runtime + region (2C — implemented in Phase 2C) ────────────────────────────

async function handleFireTrigger(input: FireTriggerInput): Promise<Envelope<unknown>> {
  // typeof-guard the static API (source-confirmed signature: triggerTile(uuid: string) => Promise<void>,
  // monks-active-tiles.js:180 — fires with canvas.tokens.controlled, respects active/pertoken).
  const matt = (globalThis as any).game?.MonksActiveTiles;
  if (typeof matt?.triggerTile !== 'function') {
    return { success: false, error: 'MATT_API_NOT_AVAILABLE: game.MonksActiveTiles.triggerTile is not callable' };
  }

  const { tile } = getTileByUuidOrThrow(input.tileUuid);
  const actions = readActions(tile);
  const impact = buildImpactReport(actions);

  // CCR-4 — firing ALWAYS requires confirm:true; surface the full impact (ordered actions + dangerous bodies).
  if (input.confirm !== true) {
    const seq = actions.map((a) => a.action).join(' → ') || '(no actions)';
    const danger = impact.dangerous.length ? ` DANGEROUS: ${JSON.stringify(impact.dangerous)}.` : '';
    return {
      success: false,
      error: `MATT_CONFIRM_REQUIRED: firing tile ${input.tileUuid} will run ${actions.length} action(s): ${seq}.${danger} Re-send with confirm:true.`,
    };
  }

  const tokensUsed = (globalThis as any).canvas?.tokens?.controlled?.length ?? 0;
  await matt.triggerTile(input.tileUuid);

  notify.info(`MATT trigger fired: ${input.tileUuid} (${actions.length} action(s), ${tokensUsed} controlled token(s))`);
  return { success: true, data: { uuid: input.tileUuid, fired: true, tokensUsed } };
}

async function handleLinkRegionTrigger(input: LinkRegionInput): Promise<Envelope<unknown>> {
  const scene = getSceneOrThrow(input.sceneId);
  const region = scene.regions?.get(input.regionId);
  if (!region) {
    return { success: false, error: `MATT_REGION_NOT_FOUND: no Region "${input.regionId}" on scene "${input.sceneId}"` };
  }

  // Create the monks-active-tiles.triggerTile behavior directly. region.createBehavior's typed union
  // covers only the 7 core subtypes, so the MATT subtype must be authored here (audit §10 schema:
  // events (SetField) + uuid (ActiveTileDocumentUUIDField) + usetiletrigger; source line 2120).
  const events = input.events ?? ['tokenEnter', 'tokenExit'];
  const payload = deepStripUndefined({
    type: 'monks-active-tiles.triggerTile',
    name: input.name ?? 'MATT trigger',
    system: {
      uuid: input.tileUuid,
      usetiletrigger: input.usetiletrigger ?? true,
      events,
    },
    disabled: false,
  });

  const created = await region.createEmbeddedDocuments('RegionBehavior', [payload]);
  if (!created || created.length === 0) {
    return { success: false, error: 'MATT_REGION_LINK_NOT_PERSISTED: createEmbeddedDocuments returned no doc' };
  }
  const behavior = region.behaviors?.get(created[0].id);

  // DP-16 — re-read system.uuid (string or array per single:false) and confirm it references the tile.
  const sysUuid = behavior?._source?.system?.uuid ?? behavior?.system?.uuid;
  const linked = Array.isArray(sysUuid) ? sysUuid.includes(input.tileUuid) : sysUuid === input.tileUuid;
  if (!linked) {
    return { success: false, error: `MATT_REGION_LINK_NOT_PERSISTED: behavior system.uuid did not persist (got ${JSON.stringify(sysUuid)})` };
  }

  notify.created('region', 'monks-active-tiles.triggerTile', { summary: `→ tile ${input.tileUuid} on region ${region.name ?? input.regionId}` });
  return {
    success: true,
    data: { regionId: region.id, behaviorId: behavior.id, tileUuid: input.tileUuid, sceneId: scene.id },
  };
}

// Re-export shared helpers for the Phase-2B/2C handlers (same file) + tests.
export {
  buildImpactReport,
  normalizeActions,
  getTileByUuidOrThrow,
  readMattFlags,
  deepStripUndefined,
  getSceneOrThrow,
};
