// Module Integration v1 Phase 14 — module-patrol handler (patrol v3.0.3).
//
// Always-registered umbrella. requireModuleActive('patrol') is the FIRST executable statement —
// RETURNS the MODULE_NOT_ACTIVE envelope, never throws (Phase-1 carry-forward).
//
// 7 actions (dossier thin-session.md §2.7):
//   read:  get-config
//   GM writes: enable-token, disable-token, set-wander-zone, set-path, apply-undetectable
//   confirm-gated write: toggle-global
//
// Accessor (pre-plan §accessor): token flags under scope `patrol`; runtime engine state at
// `game.patrol._patrol.started` / `game.patrol._pathPatrol.started` (set on canvasReady, GM-only;
// NOT persisted). We set flags / runtime props only — the canvas-ticker movement is the GM client's.
//
// Write-order (§2.4): path mode requires a Drawing labeled `patrolPathName` BEFORE the token flag
// write — enable-token verifies it exists and refuses otherwise. set-path/set-wander-zone create the
// Drawings (text="Patrol" exact for wander; text=pathName for path).
//
// Anchors: DP-15 (typed), DP-16 (post-write flag verify), CCR-3 (notify on writes), CCR-4 (confirm on
// toggle-global; GM-gated writes). Source: phase14_pre_plan.md.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { ModulePatrolInput, type ModulePatrolInputType } from './schemas.js';
import { notify } from '../../../notify.js';
import { verifyFlagWrite } from '../../../utils/verifyWrite.js';
import { PATROL as MODULE_ID } from '../../../constants/moduleIds.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };
const ALL_FLAGS = ['enablePatrol', 'enableSpotting', 'makePatroller', 'multiPath', 'patrolPathName', 'pathNodeIndex', 'pathID'];

function isGM(): boolean {
  return Boolean((globalThis as any).game?.user?.isGM);
}

async function resolveToken(uuid: string): Promise<any> {
  const doc = await (globalThis as any).fromUuid?.(uuid);
  // Accept a Token placeable or a TokenDocument; normalize to the document.
  return doc?.document ?? doc;
}

function readFlags(tokenDoc: any): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of ALL_FLAGS) out[f] = tokenDoc.getFlag?.(MODULE_ID, f) ?? null;
  return out;
}

/** Find a Drawing on a scene whose `.text` matches a label (case-sensitive). */
function findDrawingByText(scene: any, label: string): any {
  const drawings = scene?.drawings?.contents ?? scene?.drawings ?? [];
  for (const d of drawings) {
    const txt = d.text ?? d.shape?.text ?? d._source?.text;
    if (txt === label) return d;
  }
  return undefined;
}

/** Build a polygon DrawingDocument payload from absolute points + a text label. */
function buildDrawingData(points: { x: number; y: number }[], label: string): any {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const ox = Math.min(...xs);
  const oy = Math.min(...ys);
  const width = Math.max(...xs) - ox;
  const height = Math.max(...ys) - oy;
  const rel: number[] = [];
  for (const p of points) rel.push(p.x - ox, p.y - oy);
  return {
    x: ox,
    y: oy,
    shape: { type: 'p', width, height, points: rel },
    text: label,
    strokeColor: '#FF9900',
    strokeWidth: 2,
    fillType: 0,
  };
}

const WRITE_ACTIONS = new Set([
  'enable-token', 'disable-token', 'set-wander-zone', 'set-path', 'apply-undetectable', 'toggle-global',
  'configure', 'set-waypoint', 'remap-paths',
]);
const SETTING_KEYS = ['patrolDelay', 'pathPatrolDelay', 'patrolAlertDelay', 'patrolDiagonals', 'patrolSmooth', 'patrolSound', 'patrolAlert', 'resetToRandomNode'];

export async function dispatchModulePatrol(data: unknown): Promise<Envelope<unknown>> {
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: ModulePatrolInputType;
  try {
    input = ModulePatrolInput.parse(data);
  } catch (e) {
    return { success: false, error: `PATROL_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `PATROL_ACCESS_DENIED: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      case 'get-token-config':
        return await handleGetConfig(input);
      case 'get-world-settings':
        return await handleGetWorldSettings(input);
      case 'list-tokens':
        return await handleListTokens(input);
      case 'configure':
        return await handleConfigure(input);
      case 'set-waypoint':
        return await handleSetWaypoint(input);
      case 'remap-paths':
        return await handleRemapPaths(input);
      case 'enable-token':
        return await handleEnableToken(input);
      case 'disable-token':
        return await handleDisableToken(input);
      case 'set-wander-zone':
        return await handleSetWanderZone(input);
      case 'set-path':
        return await handleSetPath(input);
      case 'apply-undetectable':
        return await handleApplyUndetectable(input);
      case 'toggle-global':
        return await handleToggleGlobal(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `PATROL_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `PATROL_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Read ─────────────────────────────────────────────────────────────────────

type GetConfigInput = Extract<ModulePatrolInputType, { action: 'get-token-config' }>;
async function handleGetConfig(input: GetConfigInput): Promise<Envelope<unknown>> {
  const token = await resolveToken(input.tokenUuid);
  if (!token) return { success: false, error: `PATROL_TOKEN_NOT_FOUND: ${input.tokenUuid}` };
  const patrol = (globalThis as any).game?.patrol;
  return {
    success: true,
    data: {
      tokenUuid: input.tokenUuid,
      tokenName: token.name,
      flags: readFlags(token),
      global: {
        wanderStarted: Boolean(patrol?._patrol?.started),
        pathStarted: Boolean(patrol?._pathPatrol?.started),
      },
    },
  };
}

// ── Token writes ───────────────────────────────────────────────────────────────

type EnableInput = Extract<ModulePatrolInputType, { action: 'enable-token' }>;
async function handleEnableToken(input: EnableInput): Promise<Envelope<unknown>> {
  if (input.mode === 'path' && !input.patrolPathName) {
    return { success: false, error: 'PATROL_INVALID_INPUT: enable-token mode:"path" requires patrolPathName (the Drawing label to follow)' };
  }
  const results: any[] = [];
  for (const uuid of input.tokenUuids) {
    const token = await resolveToken(uuid);
    if (!token) {
      results.push({ tokenUuid: uuid, ok: false, error: 'TOKEN_NOT_FOUND' });
      continue;
    }
    if (input.mode === 'path') {
      // §2.4 — the named Drawing MUST exist before the flag write, else pathID resolves to "".
      const scene = token.parent ?? token.scene;
      const drawing = findDrawingByText(scene, input.patrolPathName!);
      if (!drawing) {
        results.push({
          tokenUuid: uuid,
          ok: false,
          error: `PATROL_PATH_DRAWING_MISSING: no Drawing labeled "${input.patrolPathName}" on the token's scene — call set-path first`,
        });
        continue;
      }
      await token.setFlag(MODULE_ID, 'makePatroller', true);
      await token.setFlag(MODULE_ID, 'patrolPathName', input.patrolPathName);
      await token.setFlag(MODULE_ID, 'pathNodeIndex', input.pathNodeIndex ?? 0);
      if (input.multiPath !== undefined) await token.setFlag(MODULE_ID, 'multiPath', input.multiPath);
      // R2.5 DP-16: a silent setFlag drop leaves the token never patrolling — verify the mode-critical flag.
      verifyFlagWrite(token, MODULE_ID, 'makePatroller', true, ErrorTokens.PATROL_FLAG_NOT_PERSISTED);
    } else {
      await token.setFlag(MODULE_ID, 'enablePatrol', true);
      verifyFlagWrite(token, MODULE_ID, 'enablePatrol', true, ErrorTokens.PATROL_FLAG_NOT_PERSISTED);
    }
    if (input.spotting !== undefined) await token.setFlag(MODULE_ID, 'enableSpotting', input.spotting);
    results.push({ tokenUuid: uuid, tokenName: token.name, ok: true, mode: input.mode, flags: readFlags(token) });
  }
  const okCount = results.filter((r) => r.ok).length;
  notify.updated('patrol', `${okCount} token(s)`, { summary: `patrol enabled (${input.mode})` });
  return { success: true, data: { mode: input.mode, results } };
}

type DisableInput = Extract<ModulePatrolInputType, { action: 'disable-token' }>;
async function handleDisableToken(input: DisableInput): Promise<Envelope<unknown>> {
  const results: any[] = [];
  for (const uuid of input.tokenUuids) {
    const token = await resolveToken(uuid);
    if (!token) {
      results.push({ tokenUuid: uuid, ok: false, error: 'TOKEN_NOT_FOUND' });
      continue;
    }
    for (const f of ALL_FLAGS) await token.unsetFlag(MODULE_ID, f);
    results.push({ tokenUuid: uuid, tokenName: token.name, ok: true, flags: readFlags(token) });
  }
  const okCount = results.filter((r) => r.ok).length;
  notify.updated('patrol', `${okCount} token(s)`, { summary: 'patrol flags cleared' });
  return { success: true, data: { results } };
}

type SetWanderInput = Extract<ModulePatrolInputType, { action: 'set-wander-zone' }>;
async function handleSetWanderZone(input: SetWanderInput): Promise<Envelope<unknown>> {
  return setZoneDrawing(input.sceneId, 'Patrol', input.points, input.drawingId, 'set-wander-zone');
}

type SetPathInput = Extract<ModulePatrolInputType, { action: 'set-path' }>;
async function handleSetPath(input: SetPathInput): Promise<Envelope<unknown>> {
  // CRITICAL (pathPatroller.js:197): the path engine only indexes Drawings whose text CONTAINS "Path"
  // (substring, case-sensitive). A label without "Path" is silently ignored → patrol never moves.
  if (!input.pathName.includes('Path')) {
    return {
      success: false,
      error: `PATROL_PATH_NAME_INVALID: pathName "${input.pathName}" must contain the substring "Path" (the engine filters path Drawings by .text.includes("Path")). Use e.g. "${input.pathName} Path".`,
    };
  }
  return setZoneDrawing(input.sceneId, input.pathName, input.points, input.drawingId, 'set-path');
}

async function setZoneDrawing(
  sceneId: string,
  label: string,
  points: { x: number; y: number }[] | undefined,
  drawingId: string | undefined,
  action: string,
): Promise<Envelope<unknown>> {
  const scene = (globalThis as any).game?.scenes?.get(sceneId);
  if (!scene) return { success: false, error: `PATROL_SCENE_NOT_FOUND: ${sceneId}` };
  if (!points && !drawingId) {
    return { success: false, error: `PATROL_INVALID_INPUT: ${action} requires points[] or drawingId` };
  }

  // Reference an existing Drawing → ensure its text label matches.
  if (drawingId) {
    const existing = scene.drawings?.get?.(drawingId);
    if (!existing) return { success: false, error: `PATROL_DRAWING_NOT_FOUND: ${drawingId}` };
    const curText = existing.text ?? existing._source?.text;
    if (curText !== label) await existing.update({ text: label });
    return { success: true, data: { drawingId, sceneId, label, referenced: true } };
  }

  const [drawing] = await scene.createEmbeddedDocuments('Drawing', [buildDrawingData(points!, label)]);
  if (!drawing) return { success: false, error: 'PATROL_DRAWING_NOT_CREATED' };
  // DP-16 — verify the label round-trip.
  const persisted = drawing.text ?? drawing._source?.text;
  if (persisted !== label) {
    return { success: false, error: `${ErrorTokens.PATROL_DRAWING_LABEL_NOT_PERSISTED}: read back "${persisted}" after writing "${label}"` };
  }
  notify.created('patrol', label, { summary: `${action} Drawing on "${scene.name}"` });
  return { success: true, data: { drawingId: drawing.id, sceneId, label, referenced: false } };
}

type UndetectableInput = Extract<ModulePatrolInputType, { action: 'apply-undetectable' }>;
async function handleApplyUndetectable(input: UndetectableInput): Promise<Envelope<unknown>> {
  const actor = await (globalThis as any).fromUuid?.(input.actorUuid);
  if (!actor) return { success: false, error: `PATROL_ACTOR_NOT_FOUND: ${input.actorUuid}` };
  const STATUS = 'patrolundetectable';
  // NOTE: patrol pushes this status to CONFIG.statusEffects on init, but wfrp4e rebuilds that array
  // afterward and drops it, so actor.toggleStatusEffect(STATUS) throws "Invalid status ID" in a wfrp4e
  // world. patrol.js detects undetectability via effect.statuses, so we manage the ActiveEffect directly
  // (robust whether or not the status id is registered).
  const effects = actor.effects?.contents ?? actor.effects ?? [];
  const hasStatus = (e: any) =>
    e?.statuses?.has?.(STATUS) || (Array.isArray(e?.statuses) && e.statuses.includes(STATUS)) || e?.getFlag?.('core', 'statusId') === STATUS;
  const existing = effects.find(hasStatus);
  if (input.active) {
    if (!existing) {
      await actor.createEmbeddedDocuments('ActiveEffect', [
        { name: 'Patrol - Undetectable', img: 'icons/svg/eye.svg', statuses: [STATUS] },
      ]);
    }
  } else if (existing) {
    await actor.deleteEmbeddedDocuments('ActiveEffect', [existing.id]);
  }
  // DP-16 — verify the post-state.
  const after = actor.effects?.contents ?? actor.effects ?? [];
  const has = after.some(hasStatus);
  notify.updated('patrol', actor.name, { summary: `patrolundetectable ${input.active ? 'applied' : 'removed'}` });
  return { success: true, data: { actorUuid: input.actorUuid, actorName: actor.name, active: has } };
}

// ── Confirm-gated global toggle (runtime, not persisted) ──────────────────────────

type ToggleInput = Extract<ModulePatrolInputType, { action: 'toggle-global' }>;
async function handleToggleGlobal(input: ToggleInput): Promise<Envelope<unknown>> {
  const patrol = (globalThis as any).game?.patrol;
  if (!patrol) {
    return { success: false, error: 'PATROL_RUNTIME_UNAVAILABLE: game.patrol is not bound (no scene loaded on the GM client yet)' };
  }
  const engines = input.engines ?? 'both';
  if ((engines === 'wander' || engines === 'both') && patrol._patrol) patrol._patrol.started = input.started;
  if ((engines === 'path' || engines === 'both') && patrol._pathPatrol) patrol._pathPatrol.started = input.started;
  notify.updated('patrol', `engines: ${engines}`, { summary: `patrol ${input.started ? 'started' : 'stopped'} (runtime — resets on reload)` });
  return {
    success: true,
    data: {
      started: input.started,
      engines,
      wanderStarted: Boolean(patrol._patrol?.started),
      pathStarted: Boolean(patrol._pathPatrol?.started),
      note: 'Global patrol state is in-memory only (resets on page reload). Patrols also pause during active combat.',
    },
  };
}

// ── Phase 14 full-functionality handlers ──────────────────────────────────────

type GetWorldSettingsInput = Extract<ModulePatrolInputType, { action: 'get-world-settings' }>;
async function handleGetWorldSettings(_input: GetWorldSettingsInput): Promise<Envelope<unknown>> {
  const get = (k: string) => (globalThis as any).game?.settings?.get?.(MODULE_ID, k);
  const settings: Record<string, unknown> = {};
  for (const k of SETTING_KEYS) settings[k] = get(k);
  const patrol = (globalThis as any).game?.patrol;
  return {
    success: true,
    data: {
      settings,
      runtime: {
        wanderStarted: Boolean(patrol?._patrol?.started),
        pathStarted: Boolean(patrol?._pathPatrol?.started),
        wanderDelay: patrol?._patrol?.delay,
        pathDelay: patrol?._pathPatrol?.delay,
        diagonals: patrol?._patrol?.diagonals,
        mappedPathCoords: patrol?._pathPatrol?.pathCoords?.length,
      },
    },
  };
}

type ListTokensInput = Extract<ModulePatrolInputType, { action: 'list-tokens' }>;
async function handleListTokens(input: ListTokensInput): Promise<Envelope<unknown>> {
  const scene = (globalThis as any).game?.scenes?.get(input.sceneId);
  if (!scene) return { success: false, error: `PATROL_SCENE_NOT_FOUND: ${input.sceneId}` };
  const filter = input.filter ?? 'all';
  const tokens = scene.tokens?.contents ?? scene.tokens ?? [];
  const out: any[] = [];
  for (const t of tokens) {
    const flags = readFlags(t);
    const isWander = Boolean(flags.enablePatrol);
    const isPath = Boolean(flags.makePatroller);
    const isSpotting = Boolean(flags.enableSpotting);
    const match =
      filter === 'all'
        ? isWander || isPath || isSpotting
        : filter === 'wander'
          ? isWander
          : filter === 'path'
            ? isPath
            : isSpotting;
    if (!match) continue;
    out.push({ tokenUuid: t.uuid, tokenName: t.name, mode: isPath ? 'path' : isWander ? 'wander' : 'spotting-only', flags });
  }
  return { success: true, data: { sceneId: input.sceneId, filter, count: out.length, tokens: out } };
}

type ConfigureInput = Extract<ModulePatrolInputType, { action: 'configure' }>;
async function handleConfigure(input: ConfigureInput): Promise<Envelope<unknown>> {
  const provided = SETTING_KEYS.filter((k) => (input as any)[k] !== undefined);
  if (!provided.length) return { success: false, error: 'PATROL_INVALID_INPUT: configure requires at least one setting field' };
  const written: Record<string, unknown> = {};
  for (const k of provided) {
    await (globalThis as any).game.settings.set(MODULE_ID, k, (input as any)[k]);
    written[k] = (globalThis as any).game?.settings?.get?.(MODULE_ID, k);
  }
  const warning = input.patrolAlertDelay === 0 ? 'patrolAlertDelay=0 skips the alert phase → detection immediately pauses the game + pans the camera.' : undefined;
  notify.updated('patrol', 'world settings', { summary: `configured ${provided.join(', ')}` });
  return { success: true, data: { written, warning } };
}

type SetWaypointInput = Extract<ModulePatrolInputType, { action: 'set-waypoint' }>;
async function handleSetWaypoint(input: SetWaypointInput): Promise<Envelope<unknown>> {
  const results: any[] = [];
  for (const uuid of input.tokenUuids) {
    const token = await resolveToken(uuid);
    if (!token) {
      results.push({ tokenUuid: uuid, ok: false, error: 'TOKEN_NOT_FOUND' });
      continue;
    }
    await token.setFlag(MODULE_ID, 'pathNodeIndex', input.pathNodeIndex);
    if (input.pathID !== undefined) await token.setFlag(MODULE_ID, 'pathID', input.pathID);
    // R2.5 DP-16: a silent drop here would resume the patrol from the wrong node.
    verifyFlagWrite(token, MODULE_ID, 'pathNodeIndex', input.pathNodeIndex, ErrorTokens.PATROL_FLAG_NOT_PERSISTED);
    results.push({ tokenUuid: uuid, tokenName: token.name, ok: true, pathNodeIndex: token.getFlag(MODULE_ID, 'pathNodeIndex') });
  }
  notify.updated('patrol', `${results.filter((r) => r.ok).length} token(s)`, { summary: `waypoint → ${input.pathNodeIndex}` });
  return { success: true, data: { pathNodeIndex: input.pathNodeIndex, results } };
}

type RemapPathsInput = Extract<ModulePatrolInputType, { action: 'remap-paths' }>;
async function handleRemapPaths(_input: RemapPathsInput): Promise<Envelope<unknown>> {
  const pathPatrol = (globalThis as any).game?.patrol?._pathPatrol;
  if (!pathPatrol) return { success: false, error: 'PATROL_RUNTIME_UNAVAILABLE: game.patrol._pathPatrol is not bound (no scene loaded on the GM client yet)' };
  if (typeof pathPatrol.mapTokensAndPaths === 'function') pathPatrol.mapTokensAndPaths();
  if (typeof pathPatrol.resetPathIndex === 'function') await pathPatrol.resetPathIndex();
  notify.updated('patrol', 'path engine', { summary: 'paths re-mapped + indices reset' });
  return { success: true, data: { remapped: true, mappedPathCoords: pathPatrol.pathCoords?.length } };
}
