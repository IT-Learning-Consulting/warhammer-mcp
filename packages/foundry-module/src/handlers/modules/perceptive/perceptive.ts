// Module Integration v2 Phase 4 — module-perceptive handler (Perceptive v6.0.4, saibot).
//
// Always-registered umbrella. requireModuleActive('perceptive') is the FIRST active-state check —
// RETURNS the MODULE_NOT_ACTIVE envelope, never throws (v1 Phase 1 contract). The ONE exception is
// `wfrp-stealth-delegate`, which FAILS OPEN (CCR-9): when perceptive is inactive it returns a soft
// success message ("set manually if needed"), NOT the guard error, so the WFRP host flow is unchanged.
//
// 8 actions (capability_audit/perceptive.md + phase4_pre_plan.md), mixed write paths chosen per
// source verification (PerceptiveFlags.js / APIHandler.js / PeekingScript.js / DoorMovingScript.js):
//   set-stealth            RAW awaited doc.update({flags:{perceptive:{PerceptiveStealthingFlag}}},
//                          {PerceptiveVisionupdate:true}) — api.setPerceptiveStealthing drops its
//                          Promise (APIHandler.js:73-74), so we own the awaited write. Immediate-
//                          consistent → NO bounded-retry re-read poll.
//   set-DCs (via delegate  RAW awaited doc.update({flags:{perceptive:{PPDCFlag,APDCFlag}}}) — the api
//   + set-spottable)       setSpottingDCs un-awaits its pObject.update (PerceptiveFlags.js:1542).
//   set-spotting           game.modules.get('perceptive').api.PerceptiveFlags.addSpottedby(target,
//                          spotter) — properly awaited (PerceptiveFlags.js:1509-1521); immediate-consistent.
//   set-spottable          api.PerceptiveFlags.setcanbeSpotted(target, bool) (awaited,
//                          PerceptiveFlags.js:1384) + RAW PPDC/APDC write.
//   reset-stealth          game.Perceptive.RemoveLingeringAP([t], false) + api.PerceptiveFlags
//                          .clearSpottedby(t) + RAW clear PerceptiveStealthingFlag.
//   peek-door / move-door  GM-direct: the door MANAGERS (PeekingManager/DoorMovingManager) are NOT on
//                          any global (game.Perceptive exposes only Perception/SpotObjectsinVision/
//                          RemoveLingeringAP; api exposes flags but no door managers), so we runtime-
//                          import the SERVABLE ESM (perceptive ships individual files, NOT a bundle —
//                          module.json esmodules lists scripts/PeekingScript.js + DoorMovingScript.js)
//                          and call the EXPORTED GM-answer functions PeekDoorRequest / DoorMoveRequest.
//                          Those guard `game.user.isGM` and call PeekDoorGM/DoorMoveGM DIRECTLY — no
//                          socket round-trip, and pInfos={PlayerID: game.user.id} bypasses the
//                          conditional Dialog.confirm (PeekingScript.js:81, HC-v2-6). LIVE-SMOKE-ONLY
//                          (no walls in the eval snapshot). ⚠ creates persistent aux Wall docs.
//   wfrp-stealth-delegate  GM-supplied SL → RAW PPDCFlag=APDCFlag=sl write. Fail-open when inactive.
//   get-state              read the four flags + api.LightLevel(token).
//
// NO bounded-retry re-read poll anywhere: every write is either a raw `await doc.update()` we issue (immediate-
// consistent to the in-memory doc) or a properly-awaited module-API method (addSpottedby/setcanbeSpotted).
// This is the deliberate contrast with Phase-3's fire-and-forget read-back race trap.
//
// We NEVER emit on the module socket (we ARE the GM — self-emit does not loop back) and we NEVER
// re-implement the wall math. Source of truth: .agents/research/module_integration/phase4_pre_plan.md.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { verifyFlagWrite } from '../../../utils/verifyWrite.js';
import { PerceptiveInput, type PerceptiveInputType } from './schemas.js';
import { notify } from '../../../notify.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

const MODULE_ID = 'perceptive';
const FLAG_SCOPE = 'perceptive';

// ── Local helpers ──────────────────────────────────────────────────────────────

function isGM(): boolean {
  return Boolean((globalThis as any).game?.user?.isGM);
}

function getGame(): any {
  return (globalThis as any).game;
}

/** game.modules.get('perceptive').api — PerceptiveFlags, LightLevel, etc. (APIHandler.js:112-127). */
function perceptiveApi(): any {
  return getGame()?.modules?.get?.(MODULE_ID)?.api;
}

/** game.Perceptive — RemoveLingeringAP / SpotObjectsinVision (MacroHooks.js:8). */
function gamePerceptive(): any {
  return getGame()?.Perceptive;
}

/**
 * Runtime ESM import that EVADES esbuild/tsc static resolution (Function indirection). Used ONLY for
 * the two servable perceptive door scripts — the GM-answer functions are not exposed on any global.
 * Perceptive ships individual ESM files (module.json esmodules), so this URL is server-resolvable and
 * returns the already-loaded cached module namespace (no re-evaluation).
 */
const runtimeImport = (specifier: string): Promise<any> =>
  (Function('s', 'return import(s)') as (s: string) => Promise<any>)(specifier);

/** Resolve the target scene (explicit sceneId else the active canvas scene). */
function resolveScene(sceneId: string | undefined): any | null {
  if (sceneId) return getGame()?.scenes?.get?.(sceneId) ?? null;
  return (globalThis as any).canvas?.scene ?? null;
}

/** All TokenDocuments on a scene as an array (embedded collection → contents). */
function sceneTokens(scene: any): any[] {
  return scene?.tokens?.contents ?? (scene?.tokens ? Array.from(scene.tokens) : []);
}

/** Resolve a TokenDocument on a scene by id (preferred) or name. Returns null when neither resolves. */
function resolveTokenOnScene(scene: any, id?: string, name?: string): any | null {
  if (id) {
    const byId = scene?.tokens?.get?.(id);
    if (byId) return byId;
  }
  if (name) {
    const byName = sceneTokens(scene).find((t) => t?.name === name);
    if (byName) return byName;
  }
  return null;
}

type TokenTarget = { tokenId?: string | undefined; tokenName?: string | undefined; sceneId?: string | undefined };

/** Resolve { scene, doc } for a token target, or a typed error envelope. */
function resolveTokenTarget(t: TokenTarget): { scene: any; doc: any } | { error: string } {
  if (!t.tokenId && !t.tokenName) {
    return { error: `${ErrorTokens.PERCEPTIVE_TARGET_NOT_FOUND}: provide tokenId or tokenName` };
  }
  const scene = resolveScene(t.sceneId);
  if (!scene) return { error: `${ErrorTokens.PERCEPTIVE_TARGET_NOT_FOUND}: no scene (sceneId=${t.sceneId ?? 'active'})` };
  const doc = resolveTokenOnScene(scene, t.tokenId, t.tokenName);
  if (!doc) {
    return {
      error: `${ErrorTokens.PERCEPTIVE_TARGET_NOT_FOUND}: token "${t.tokenId ?? t.tokenName}" not on scene "${scene.id}"`,
    };
  }
  return { scene, doc };
}

function readFlag(doc: any, key: string): unknown {
  return doc?.getFlag?.(FLAG_SCOPE, key);
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

const WRITE_ACTIONS = new Set([
  'set-stealth',
  'set-spotting',
  'set-spottable',
  'reset-stealth',
  'peek-door',
  'move-door',
  'wfrp-stealth-delegate',
]);

export async function dispatchModulePerceptive(data: unknown): Promise<Envelope<unknown>> {
  // Guard computed up-front but applied AFTER parse — the delegate must fail-open (CCR-9), not return it.
  const guard = requireModuleActive(MODULE_ID);

  let input: PerceptiveInputType;
  try {
    input = PerceptiveInput.parse(data);
  } catch (e) {
    return { success: false, error: `PERCEPTIVE_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  // CCR-9 fail-open: the WFRP stealth delegate returns a SOFT message when perceptive is inactive,
  // so the host WFRP flow is unaffected (HC5/NF1). It NEVER surfaces the MODULE_NOT_ACTIVE guard.
  if (input.action === 'wfrp-stealth-delegate') {
    if (guard) {
      return {
        success: true,
        data: {
          action: 'wfrp-stealth-delegate',
          applied: false,
          moduleActive: false,
          sl: input.sl,
          tokenId: input.tokenId ?? null,
          tokenName: input.tokenName ?? null,
          message: `[Perceptive inactive] Stealth SL ${input.sl} not written — set the door/token spotting DCs manually if needed.`,
        },
      };
    }
  } else if (guard) {
    // All other actions: normal guard refusal.
    return guard;
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `PERCEPTIVE_ACCESS_DENIED: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      case 'set-stealth':
        return await handleSetStealth(input);
      case 'set-spotting':
        return await handleSetSpotting(input);
      case 'set-spottable':
        return await handleSetSpottable(input);
      case 'reset-stealth':
        return await handleResetStealth(input);
      case 'peek-door':
        return await handlePeekDoor(input);
      case 'move-door':
        return await handleMoveDoor(input);
      case 'wfrp-stealth-delegate':
        return await handleStealthDelegate(input);
      case 'get-state':
        return await handleGetState(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `PERCEPTIVE_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `PERCEPTIVE_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── set-stealth (RAW awaited flag write) ─────────────────────────────────────────

type SetStealthInput = Extract<PerceptiveInputType, { action: 'set-stealth' }>;
async function handleSetStealth(input: SetStealthInput): Promise<Envelope<unknown>> {
  const r = resolveTokenTarget(input);
  if ('error' in r) return { success: false, error: r.error };
  const { doc, scene } = r;

  // RAW awaited write mirroring PerceptiveFlags.#setPerceptiveStealthing (PerceptiveFlags.js:1023-1029).
  await doc.update(
    { flags: { [FLAG_SCOPE]: { PerceptiveStealthingFlag: Boolean(input.stealthing) } } },
    { PerceptiveVisionupdate: true },
  );
  // DP-16 — the raw await is immediate-consistent to the in-memory doc (no bounded-retry poll needed).
  verifyFlagWrite(doc, FLAG_SCOPE, 'PerceptiveStealthingFlag', Boolean(input.stealthing), ErrorTokens.PERCEPTIVE_NOT_PERSISTED);

  notify.updated('perceptive', doc.name, { summary: `stealth ${input.stealthing ? 'on' : 'off'}` });
  return {
    success: true,
    data: { action: 'set-stealth', tokenId: doc.id, tokenName: doc.name, sceneId: scene.id, stealthing: Boolean(input.stealthing) },
  };
}

// ── set-spotting (module API addSpottedby — properly awaited) ─────────────────────

type SetSpottingInput = Extract<PerceptiveInputType, { action: 'set-spotting' }>;
async function handleSetSpotting(input: SetSpottingInput): Promise<Envelope<unknown>> {
  const r = resolveTokenTarget(input);
  if ('error' in r) return { success: false, error: r.error };
  const { doc, scene } = r;

  if (!input.spotterId && !input.spotterName) {
    return { success: false, error: `${ErrorTokens.PERCEPTIVE_TARGET_NOT_FOUND}: provide spotterId or spotterName` };
  }
  const spotter = resolveTokenOnScene(scene, input.spotterId, input.spotterName);
  if (!spotter) {
    return { success: false, error: `${ErrorTokens.PERCEPTIVE_TARGET_NOT_FOUND}: spotter "${input.spotterId ?? input.spotterName}" not on scene "${scene.id}"` };
  }

  const api = perceptiveApi();
  if (typeof api?.PerceptiveFlags?.addSpottedby !== 'function') {
    return { success: false, error: 'PERCEPTIVE_API_UNAVAILABLE: api.PerceptiveFlags.addSpottedby not found' };
  }
  // Properly awaited (PerceptiveFlags.js:1509-1521) — immediate-consistent, no bounded-retry poll.
  await api.PerceptiveFlags.addSpottedby(doc, spotter);

  const spottedBy = (readFlag(doc, 'SpottedbyFlag') as string[]) ?? [];
  if (!spottedBy.includes(spotter.id)) {
    return {
      success: false,
      error: `${ErrorTokens.PERCEPTIVE_NOT_PERSISTED}: spotter ${spotter.id} not in SpottedbyFlag after addSpottedby`,
    };
  }

  notify.updated('perceptive', doc.name, { summary: `spotted by ${spotter.name}` });
  return {
    success: true,
    data: { action: 'set-spotting', tokenId: doc.id, tokenName: doc.name, sceneId: scene.id, spotterId: spotter.id, spottedBy },
  };
}

// ── set-spottable (module API setcanbeSpotted + RAW PPDC/APDC) ────────────────────

type SetSpottableInput = Extract<PerceptiveInputType, { action: 'set-spottable' }>;
async function handleSetSpottable(input: SetSpottableInput): Promise<Envelope<unknown>> {
  const r = resolveTokenTarget(input);
  if ('error' in r) return { success: false, error: r.error };
  const { doc, scene } = r;

  const api = perceptiveApi();
  if (typeof api?.PerceptiveFlags?.setcanbeSpotted !== 'function') {
    return { success: false, error: 'PERCEPTIVE_API_UNAVAILABLE: api.PerceptiveFlags.setcanbeSpotted not found' };
  }
  // Properly awaited (PerceptiveFlags.js:1384-1386).
  await api.PerceptiveFlags.setcanbeSpotted(doc, Boolean(input.canbeSpotted));
  verifyFlagWrite(doc, FLAG_SCOPE, 'canbeSpottedFlag', Boolean(input.canbeSpotted), ErrorTokens.PERCEPTIVE_NOT_PERSISTED);

  // PPDC/APDC go through a RAW awaited write (the api setSpottingDCs un-awaits its update).
  const dcFlags: Record<string, number> = {};
  if (input.ppdc !== undefined) dcFlags.PPDCFlag = input.ppdc;
  if (input.apdc !== undefined) dcFlags.APDCFlag = input.apdc;
  if (Object.keys(dcFlags).length > 0) {
    await doc.update({ flags: { [FLAG_SCOPE]: dcFlags } });
    if (input.ppdc !== undefined) verifyFlagWrite(doc, FLAG_SCOPE, 'PPDCFlag', input.ppdc, ErrorTokens.PERCEPTIVE_NOT_PERSISTED);
    if (input.apdc !== undefined) verifyFlagWrite(doc, FLAG_SCOPE, 'APDCFlag', input.apdc, ErrorTokens.PERCEPTIVE_NOT_PERSISTED);
  }

  notify.updated('perceptive', doc.name, { summary: `spottable=${input.canbeSpotted}` });
  return {
    success: true,
    data: {
      action: 'set-spottable',
      tokenId: doc.id,
      tokenName: doc.name,
      sceneId: scene.id,
      canbeSpotted: Boolean(input.canbeSpotted),
      ppdc: readFlag(doc, 'PPDCFlag') ?? null,
      apdc: readFlag(doc, 'APDCFlag') ?? null,
    },
  };
}

// ── reset-stealth (RemoveLingeringAP + clearSpottedby + clear stealth flag) ───────

type ResetStealthInput = Extract<PerceptiveInputType, { action: 'reset-stealth' }>;
async function handleResetStealth(input: ResetStealthInput): Promise<Envelope<unknown>> {
  const r = resolveTokenTarget(input);
  if ('error' in r) return { success: false, error: r.error };
  const { doc, scene } = r;

  const api = perceptiveApi();
  const gp = gamePerceptive();
  // RemoveLingeringAP(tokens, popup=false) — suppress the player popup (MacroHooks.js:11).
  if (typeof gp?.RemoveLingeringAP === 'function') {
    await gp.RemoveLingeringAP([doc], false);
  }
  // clearSpottedby — properly awaited (PerceptiveFlags.js:1528-1530).
  if (typeof api?.PerceptiveFlags?.clearSpottedby === 'function') {
    await api.PerceptiveFlags.clearSpottedby(doc);
  }
  // Clear the stealth flag via the RAW awaited write (immediate-consistent).
  await doc.update(
    { flags: { [FLAG_SCOPE]: { PerceptiveStealthingFlag: false } } },
    { PerceptiveVisionupdate: true },
  );

  const spottedBy = (readFlag(doc, 'SpottedbyFlag') as string[]) ?? [];
  if (spottedBy.length > 0) {
    return { success: false, error: `${ErrorTokens.PERCEPTIVE_NOT_PERSISTED}: SpottedbyFlag still has ${spottedBy.length} entry(ies) after reset` };
  }
  verifyFlagWrite(doc, FLAG_SCOPE, 'PerceptiveStealthingFlag', false, ErrorTokens.PERCEPTIVE_NOT_PERSISTED);

  notify.updated('perceptive', doc.name, { summary: 'stealth reset' });
  return {
    success: true,
    data: { action: 'reset-stealth', tokenId: doc.id, tokenName: doc.name, sceneId: scene.id, spottedBy, stealthing: false },
  };
}

// ── peek-door (GM-direct PeekDoorRequest, dialog bypass) — LIVE-SMOKE-ONLY ─────────

type PeekDoorInput = Extract<PerceptiveInputType, { action: 'peek-door' }>;
async function handlePeekDoor(input: PeekDoorInput): Promise<Envelope<unknown>> {
  const scene = resolveScene(input.sceneId);
  if (!scene) return { success: false, error: `${ErrorTokens.PERCEPTIVE_TARGET_NOT_FOUND}: no scene (sceneId=${input.sceneId ?? 'active'})` };
  const door = scene.walls?.get?.(input.doorId);
  if (!door) return { success: false, error: `${ErrorTokens.PERCEPTIVE_TARGET_NOT_FOUND}: door/wall "${input.doorId}" not on scene "${scene.id}"` };
  const missing = input.tokenIds.filter((id) => !scene.tokens?.get?.(id));
  if (missing.length > 0) {
    return { success: false, error: `${ErrorTokens.PERCEPTIVE_TARGET_NOT_FOUND}: peeking token(s) not on scene: ${missing.join(', ')}` };
  }

  // GM-direct: the exported PeekDoorRequest guards game.user.isGM and calls PeekDoorGM(door, tokens,
  // pInfos) directly (PeekingScript.js:241-244). pInfos.PlayerID === game.user.id bypasses the
  // conditional Dialog.confirm (PeekingScript.js:81). No socket emit (we ARE the GM).
  const mod = await runtimeImport(`/modules/${MODULE_ID}/scripts/PeekingScript.js`);
  if (typeof mod?.PeekDoorRequest !== 'function') {
    return { success: false, error: 'PERCEPTIVE_API_UNAVAILABLE: PeekingScript.PeekDoorRequest export not found' };
  }
  await mod.PeekDoorRequest({
    pDoorID: input.doorId,
    pSceneID: scene.id,
    pTokenIDs: input.tokenIds,
    pInfos: { PlayerID: getGame()?.user?.id },
  });

  // Best-effort read-back (the GM-answer fn is fire-and-forget; we do NOT bounded-retry poll). Door ops are
  // LIVE-SMOKE-ONLY — the GM re-reads LockpeekedbyFlag in the smoke-runbook to confirm.
  const peekedBy = (door.getFlag?.(FLAG_SCOPE, 'LockpeekedbyFlag') as string[]) ?? [];
  notify.updated('perceptive', `door ${input.doorId}`, { summary: 'lock-peek requested' });
  return {
    success: true,
    data: {
      action: 'peek-door',
      doorId: input.doorId,
      sceneId: scene.id,
      tokenIds: input.tokenIds,
      lockpeekedBy: peekedBy,
      note: 'Lock-peek dispatched (GM-direct). Aux walls may be created. Re-read flags.perceptive.LockpeekedbyFlag to confirm.',
    },
  };
}

// ── move-door (GM-direct DoorMoveRequest) — LIVE-SMOKE-ONLY ───────────────────────

type MoveDoorInput = Extract<PerceptiveInputType, { action: 'move-door' }>;
async function handleMoveDoor(input: MoveDoorInput): Promise<Envelope<unknown>> {
  const scene = resolveScene(input.sceneId);
  if (!scene) return { success: false, error: `${ErrorTokens.PERCEPTIVE_TARGET_NOT_FOUND}: no scene (sceneId=${input.sceneId ?? 'active'})` };
  const door = scene.walls?.get?.(input.doorId);
  if (!door) return { success: false, error: `${ErrorTokens.PERCEPTIVE_TARGET_NOT_FOUND}: door/wall "${input.doorId}" not on scene "${scene.id}"` };

  // GM-direct: DoorMoveRequest guards game.user.isGM and calls DoorMoveGM(door, direction, speed)
  // directly (DoorMovingScript.js:100-103). DoorMoveGM is dialog-free. No socket emit.
  const mod = await runtimeImport(`/modules/${MODULE_ID}/scripts/DoorMovingScript.js`);
  if (typeof mod?.DoorMoveRequest !== 'function') {
    return { success: false, error: 'PERCEPTIVE_API_UNAVAILABLE: DoorMovingScript.DoorMoveRequest export not found' };
  }
  await mod.DoorMoveRequest({
    pDoorID: input.doorId,
    pSceneID: scene.id,
    pDirection: input.direction,
    pSpeed: input.speed ?? 1,
  });

  // Best-effort read-back (fire-and-forget; no bounded-retry poll). LIVE-SMOKE-ONLY.
  notify.updated('perceptive', `door ${input.doorId}`, { summary: `door move ${input.direction > 0 ? '+' : '-'}` });
  return {
    success: true,
    data: {
      action: 'move-door',
      doorId: input.doorId,
      sceneId: scene.id,
      direction: input.direction,
      speed: input.speed ?? 1,
      doorMovementType: door.getFlag?.(FLAG_SCOPE, 'DoorMovementFlag') ?? null,
      swingState: door.getFlag?.(FLAG_SCOPE, 'DoorSwingStateFlag') ?? null,
      slideState: door.getFlag?.(FLAG_SCOPE, 'DoorSlideStateFlag') ?? null,
      note: 'Door move dispatched (GM-direct). Aux walls may be created. Re-read the door swing/slide flags to confirm.',
    },
  };
}

// ── wfrp-stealth-delegate (RAW PPDC=APDC=sl; fail-open handled in the dispatcher) ──

type StealthDelegateInput = Extract<PerceptiveInputType, { action: 'wfrp-stealth-delegate' }>;
async function handleStealthDelegate(input: StealthDelegateInput): Promise<Envelope<unknown>> {
  // Reached ONLY when perceptive is active (the inactive fail-open returns in the dispatcher).
  const r = resolveTokenTarget(input);
  if ('error' in r) return { success: false, error: r.error };
  const { doc, scene } = r;

  // RAW awaited write — the same path as set-DCs (the api setSpottingDCs un-awaits its update).
  await doc.update({ flags: { [FLAG_SCOPE]: { PPDCFlag: input.sl, APDCFlag: input.sl } } });
  verifyFlagWrite(doc, FLAG_SCOPE, 'PPDCFlag', input.sl, ErrorTokens.PERCEPTIVE_NOT_PERSISTED);
  verifyFlagWrite(doc, FLAG_SCOPE, 'APDCFlag', input.sl, ErrorTokens.PERCEPTIVE_NOT_PERSISTED);

  notify.updated('perceptive', doc.name, { summary: `WFRP stealth SL ${input.sl} → PPDC/APDC` });
  return {
    success: true,
    data: {
      action: 'wfrp-stealth-delegate',
      applied: true,
      moduleActive: true,
      tokenId: doc.id,
      tokenName: doc.name,
      sceneId: scene.id,
      sl: input.sl,
      ppdc: input.sl,
      apdc: input.sl,
    },
  };
}

// ── get-state (read flags + light level) ──────────────────────────────────────────

type GetStateInput = Extract<PerceptiveInputType, { action: 'get-state' }>;
async function handleGetState(input: GetStateInput): Promise<Envelope<unknown>> {
  const r = resolveTokenTarget(input);
  if ('error' in r) return { success: false, error: r.error };
  const { doc, scene } = r;

  let lightLevel: number | null = null;
  const api = perceptiveApi();
  if (typeof api?.LightLevel === 'function') {
    try {
      lightLevel = await api.LightLevel(doc);
    } catch {
      lightLevel = null; // LightLevel checks ownership; null when unreadable.
    }
  }

  return {
    success: true,
    data: {
      action: 'get-state',
      tokenId: doc.id,
      tokenName: doc.name,
      sceneId: scene.id,
      stealthing: Boolean(readFlag(doc, 'PerceptiveStealthingFlag')),
      spottedBy: (readFlag(doc, 'SpottedbyFlag') as string[]) ?? [],
      ppdc: readFlag(doc, 'PPDCFlag') ?? null,
      apdc: readFlag(doc, 'APDCFlag') ?? null,
      canbeSpotted: Boolean(readFlag(doc, 'canbeSpottedFlag')),
      lightLevel,
    },
  };
}
