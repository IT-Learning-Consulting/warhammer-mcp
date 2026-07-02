// Module Integration v2 Phase 8 — module-mortal-needs handler (Mortal Needs, Wand & Widgets v2.3.2).
//
// Always-registered umbrella. requireModuleActive('mortal-needs') is the FIRST active-state check —
// RETURNS the MODULE_NOT_ACTIVE envelope, never throws (v1 Phase 1 contract).
//
// 26 actions across 9 idioms (capability_audit/mortal-needs.md + phase8_pre_plan.md). Direct in-process
// API access: game.modules.get('mortal-needs').api (frozen, mounted in `ready`) — no macro bridge, no
// runtime-import seam (the module is unbundled but the API is a plain property reachable in-process).
//
// TWO LOAD-BEARING GUARDS (phase8_pre_plan.md §Confirmed facts #4, #6):
//   1. TRACK-FIRST + VERIFY-FLAG — the engine has NO tracking guard on stress/relieve/set/reset; an
//      untracked actor gets an in-memory write (#state Map) and a truthy return, but persistActor()
//      silently no-ops the actor.setFlag() call (needs-store.js:246-248). Every need write idempotently
//      tracks first (api.actors.track if !isTracked) AND post-write verifies the PERSISTED flag against
//      the AUTHORITATIVE in-memory value (api.needs.get) via verifyFlagWrite — catching the silent drop
//      even if track-first itself silently failed (defense in depth, mirrors the vitest coverage).
//   2. IMPORTCONFIG-PERSIST — config.updateNeedConfig/enableNeed/disableNeed (and register.need/
//      unregisterNeed) mutate ONLY in-memory state; `persistConfig` is dead code, only
//      config.importConfig(json) writes the `needsConfig` world setting (config-manager.js:325-327).
//      configure/enable/disable-need AND register/unregister-custom-need route through
//      read-full-config → apply → importConfig, then verify via getNeedConfig. The upstream defect
//      (raw config.* calls never persisting) is logged to bugs_to_fix.md — not our code to fix.
//
// Confirm-gate (CCR-4): reset-all, untrack-actor, long-rest (party-wide, entityId omitted),
// unregister-custom-need use confirm:z.boolean().optional() + a handler `!== true` reject.
//
// Consequence wiring (R8.2) is DIALOG-FREE — api.consequences.apply/remove route directly to
// ConsequenceEngine.applyConsequence/removeConsequence; the only DialogV2 in the module
// (#showRemovalDialog) lives in the AUTO-TICK recovery path (#handleRecovery), never reachable from
// the direct consequences.apply/remove API methods we wire (consequence-engine.js:52-71 vs 117-163).
//
// Source of truth: .agents/research/module_integration/phase8_pre_plan.md +
// capability_audit/mortal-needs.md.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { verifyFlagWrite } from '../../../utils/verifyWrite.js';
import { MortalNeedsInput, type MortalNeedsInputType } from './schemas.js';
import { notify } from '../../../notify.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

const MODULE_ID = 'mortal-needs';
const NEEDS_FLAG_SCOPE = 'mortal-needs';

const WRITE_ACTIONS = new Set([
  'stress-need',
  'relieve-need',
  'set-need',
  'reset-need',
  'track-actor',
  'batch-stress',
  'batch-relieve',
  'short-rest',
  'long-rest',
  'configure-need',
  'enable-need',
  'disable-need',
  'apply-consequence',
  'remove-consequence',
  'set-scene-modifier',
  'register-custom-need',
  'unregister-custom-need',
  'reset-all',
  'untrack-actor',
]);

// ── Local helpers ──────────────────────────────────────────────────────────────

function getGame(): any {
  return (globalThis as any).game;
}
function isGM(): boolean {
  return Boolean(getGame()?.user?.isGM);
}
function getApi(): any {
  return getGame()?.modules?.get?.(MODULE_ID)?.api;
}
function getActor(entityId: string): any | null {
  return getGame()?.actors?.get?.(entityId) ?? null;
}
function actorName(entityId: string | null | undefined): string | null {
  if (!entityId) return null;
  return getActor(entityId)?.name ?? null;
}
function getProp(obj: any, path: string): any {
  return (globalThis as any).foundry?.utils?.getProperty(obj, path);
}

function targetNotFound(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.MORTAL_NEEDS_TARGET_NOT_FOUND}: ${detail}` };
}
function confirmRequired(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.MORTAL_NEEDS_CONFIRM_REQUIRED}: ${detail}` };
}

/**
 * Build the expected post-write `needs` flag value for verifyFlagWrite. Reads the CURRENT persisted
 * flag once, then overrides each touched need id with the AUTHORITATIVE in-memory value
 * (api.needs.get — the engine's #state Map, always up to date regardless of persistence).
 * verifyFlagWrite re-reads the flag INDEPENDENTLY at verify time, so if persistActor() silently
 * no-op'd (the untracked-actor trap), the override won't match the re-read and the drift is caught —
 * no separate before-snapshot needed (the wfrp-economy aliasing-guard shape doesn't apply here because
 * we never read the SAME mutated object twice for the comparison; verifyFlagWrite's getFlag call is
 * the one true read).
 */
function expectedNeedsFlag(api: any, entityId: string, actor: any, needIds: string[]): Record<string, number> {
  const fresh: Record<string, number> = { ...(actor.getFlag(NEEDS_FLAG_SCOPE, 'needs') || {}) };
  for (const id of needIds) {
    const live = api.needs.get(entityId, id);
    if (live && typeof live.value === 'number') fresh[id] = live.value;
  }
  return fresh;
}

function verifyNeedsFlag(actor: any, expected: Record<string, number>): void {
  verifyFlagWrite(actor, NEEDS_FLAG_SCOPE, 'needs', expected, ErrorTokens.MORTAL_NEEDS_NOT_PERSISTED);
}

async function trackIfNeeded(api: any, entityId: string): Promise<void> {
  if (!api.actors.isTracked(entityId)) {
    await api.actors.track(entityId);
  }
}

function enabledNeedIds(api: any): string[] {
  return (api.config.getEnabledNeeds() ?? []).map((c: any) => c.id);
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

export async function dispatchModuleMortalNeeds(data: unknown): Promise<Envelope<unknown>> {
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: MortalNeedsInputType;
  try {
    input = MortalNeedsInput.parse(data);
  } catch (e) {
    return { success: false, error: `MORTAL_NEEDS_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `MORTAL_NEEDS_ACCESS_DENIED: ${input.action} requires GM` };
  }

  const api = getApi();
  if (!api) {
    return {
      success: false,
      error: `MORTAL_NEEDS_API_UNAVAILABLE: game.modules.get('mortal-needs').api not found (module not ready?)`,
    };
  }

  try {
    switch (input.action) {
      // ── reads ──
      case 'get-needs':
        return handleGetNeeds(api, input);
      case 'get-need':
        return handleGetNeed(api, input);
      case 'list-tracked':
        return handleListTracked(api);
      case 'get-need-config':
        return handleGetNeedConfig(api, input);
      case 'query-critical':
        return handleQueryCritical(api);
      case 'query-above-threshold':
        return handleQueryAboveThreshold(api, input);
      case 'get-need-history':
        return handleGetNeedHistory(api, input);

      // ── single writes ──
      case 'stress-need':
        return await handleStressOrRelieve(api, input, 'stress');
      case 'relieve-need':
        return await handleStressOrRelieve(api, input, 'relieve');
      case 'set-need':
        return await handleSetNeed(api, input);
      case 'reset-need':
        return await handleResetNeed(api, input);
      case 'track-actor':
        return await handleTrackActor(api, input);

      // ── batch writes ──
      case 'batch-stress':
        return await handleBatch(api, input, 'stress');
      case 'batch-relieve':
        return await handleBatch(api, input, 'relieve');

      // ── rest ──
      case 'short-rest':
        return await handleShortRest(api, input);
      case 'long-rest':
        return await handleLongRest(api, input);

      // ── config (importConfig-persist) ──
      case 'configure-need':
        return await handleConfigureNeed(api, input, input.changes);
      case 'enable-need':
        return await handleConfigureNeed(api, input, { enabled: true });
      case 'disable-need':
        return await handleConfigureNeed(api, input, { enabled: false });

      // ── consequence (dialog-free) ──
      case 'apply-consequence':
        return await handleConsequence(api, input, 'apply');
      case 'remove-consequence':
        return await handleConsequence(api, input, 'remove');

      // ── scene ──
      case 'set-scene-modifier':
        return await handleSetSceneModifier(api, input);

      // ── custom needs ──
      case 'register-custom-need':
        return await handleRegisterCustomNeed(api, input);
      case 'unregister-custom-need':
        return await handleUnregisterCustomNeed(api, input);

      // ── destructive ──
      case 'reset-all':
        return await handleResetAll(api, input);
      case 'untrack-actor':
        return await handleUntrackActor(api, input);

      default: {
        const _exhaustive: never = input;
        return { success: false, error: `MORTAL_NEEDS_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `MORTAL_NEEDS_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── reads ────────────────────────────────────────────────────────────────────

type GetNeedsInput = Extract<MortalNeedsInputType, { action: 'get-needs' }>;
function handleGetNeeds(api: any, input: GetNeedsInput): Envelope<unknown> {
  const needs = api.needs.getAll(input.entityId) ?? {};
  return { success: true, data: { action: 'get-needs', entityId: input.entityId, needs } };
}

type GetNeedInput = Extract<MortalNeedsInputType, { action: 'get-need' }>;
function handleGetNeed(api: any, input: GetNeedInput): Envelope<unknown> {
  const state = api.needs.get(input.entityId, input.needId);
  if (!state) {
    return targetNotFound(
      `no need state for "${input.needId}" on entity "${input.entityId}" (untracked, need disabled/unknown, or not visible)`,
    );
  }
  return { success: true, data: { action: 'get-need', entityId: input.entityId, needId: input.needId, ...state } };
}

function handleListTracked(api: any): Envelope<unknown> {
  const tracked = (api.actors.getTracked() ?? []).map((e: any) => ({
    id: e.id,
    source: e.source,
    name: e.name,
    img: e.img,
    linkedActorId: e.linkedActorId ?? null,
    needs: e.needs ?? {},
  }));
  return { success: true, data: { action: 'list-tracked', count: tracked.length, tracked } };
}

type GetNeedConfigInput = Extract<MortalNeedsInputType, { action: 'get-need-config' }>;
function handleGetNeedConfig(api: any, input: GetNeedConfigInput): Envelope<unknown> {
  if (input.needId) {
    const config = api.config.getNeedConfig(input.needId);
    if (!config) return targetNotFound(`need config "${input.needId}" not found`);
    return { success: true, data: { action: 'get-need-config', needId: input.needId, config } };
  }
  const configs = api.config.getAllNeeds() ?? [];
  return { success: true, data: { action: 'get-need-config', count: configs.length, configs } };
}

function handleQueryCritical(api: any): Envelope<unknown> {
  const actors = api.query.criticalActors() ?? [];
  return { success: true, data: { action: 'query-critical', count: actors.length, actors } };
}

type QueryAboveInput = Extract<MortalNeedsInputType, { action: 'query-above-threshold' }>;
function handleQueryAboveThreshold(api: any, input: QueryAboveInput): Envelope<unknown> {
  const threshold = input.threshold ?? 80;
  const actors = api.query.actorsAboveThreshold(input.needId, threshold) ?? [];
  return {
    success: true,
    data: { action: 'query-above-threshold', needId: input.needId, threshold, count: actors.length, actors },
  };
}

type GetHistoryInput = Extract<MortalNeedsInputType, { action: 'get-need-history' }>;
function handleGetNeedHistory(api: any, input: GetHistoryInput): Envelope<unknown> {
  const entries = api.query.needHistory(input.entityId, input.needId, input.limit ?? 50) ?? [];
  return {
    success: true,
    data: {
      action: 'get-need-history',
      entityId: input.entityId,
      needId: input.needId ?? null,
      count: entries.length,
      entries,
    },
  };
}

// ── single writes ──────────────────────────────────────────────────────────────

type StressOrRelieveInput = Extract<MortalNeedsInputType, { action: 'stress-need' | 'relieve-need' }>;
async function handleStressOrRelieve(
  api: any,
  input: StressOrRelieveInput,
  mode: 'stress' | 'relieve',
): Promise<Envelope<unknown>> {
  const actor = getActor(input.entityId);
  if (!actor) return targetNotFound(`actor "${input.entityId}" not found`);
  await trackIfNeeded(api, input.entityId);

  const result =
    mode === 'stress'
      ? await api.needs.stress(input.entityId, input.needId, input.amount)
      : await api.needs.relieve(input.entityId, input.needId, input.amount);
  if (!result) {
    return targetNotFound(
      `need "${input.needId}" rejected (not enabled, not visible, or unknown) for actor "${input.entityId}"`,
    );
  }

  verifyNeedsFlag(actor, expectedNeedsFlag(api, input.entityId, actor, [input.needId]));

  notify.updated('mortal-needs', actor.name ?? input.entityId, { summary: `${input.needId} ${mode} → ${result.value}` });
  return {
    success: true,
    data: {
      action: input.action,
      entityId: input.entityId,
      needId: input.needId,
      value: result.value,
      previousValue: result.previousValue,
      min: result.min,
      max: result.max,
    },
  };
}

type SetNeedInput = Extract<MortalNeedsInputType, { action: 'set-need' }>;
async function handleSetNeed(api: any, input: SetNeedInput): Promise<Envelope<unknown>> {
  const actor = getActor(input.entityId);
  if (!actor) return targetNotFound(`actor "${input.entityId}" not found`);
  await trackIfNeeded(api, input.entityId);

  const result = await api.needs.set(input.entityId, input.needId, input.value);
  if (!result) {
    return targetNotFound(
      `need "${input.needId}" rejected (not enabled, not visible, or unknown) for actor "${input.entityId}"`,
    );
  }

  verifyNeedsFlag(actor, expectedNeedsFlag(api, input.entityId, actor, [input.needId]));

  const clamped = result.value !== input.value;
  notify.updated('mortal-needs', actor.name ?? input.entityId, {
    summary: `${input.needId} set → ${result.value}${clamped ? ' (clamped)' : ''}`,
  });
  return {
    success: true,
    data: {
      action: 'set-need',
      entityId: input.entityId,
      needId: input.needId,
      value: result.value,
      requestedValue: input.value,
      clamped,
      min: result.min,
      max: result.max,
    },
  };
}

type ResetNeedInput = Extract<MortalNeedsInputType, { action: 'reset-need' }>;
async function handleResetNeed(api: any, input: ResetNeedInput): Promise<Envelope<unknown>> {
  const actor = getActor(input.entityId);
  if (!actor) return targetNotFound(`actor "${input.entityId}" not found`);
  await trackIfNeeded(api, input.entityId);

  const result = await api.needs.reset(input.entityId, input.needId);
  if (!result) return targetNotFound(`need "${input.needId}" not found/unknown for actor "${input.entityId}"`);

  verifyNeedsFlag(actor, expectedNeedsFlag(api, input.entityId, actor, [input.needId]));

  notify.updated('mortal-needs', actor.name ?? input.entityId, { summary: `${input.needId} reset → ${result.value}` });
  return { success: true, data: { action: 'reset-need', entityId: input.entityId, needId: input.needId, value: result.value } };
}

type TrackActorInput = Extract<MortalNeedsInputType, { action: 'track-actor' }>;
async function handleTrackActor(api: any, input: TrackActorInput): Promise<Envelope<unknown>> {
  const actor = getActor(input.entityId);
  if (!actor) return targetNotFound(`actor "${input.entityId}" not found`);

  if (api.actors.isTracked(input.entityId)) {
    return { success: true, data: { action: 'track-actor', entityId: input.entityId, alreadyTracked: true } };
  }
  await api.actors.track(input.entityId);

  const trackedIds: string[] = getGame()?.settings?.get?.(MODULE_ID, 'trackedActors') ?? [];
  if (!api.actors.isTracked(input.entityId) || !trackedIds.includes(input.entityId)) {
    return {
      success: false,
      error: `${ErrorTokens.MORTAL_NEEDS_NOT_PERSISTED}: actor "${input.entityId}" not present in trackedActors after track-actor.`,
    };
  }

  notify.created('mortal-needs', actor.name ?? input.entityId, { summary: 'now tracked' });
  return { success: true, data: { action: 'track-actor', entityId: input.entityId, alreadyTracked: false } };
}

// ── batch writes ───────────────────────────────────────────────────────────────

type BatchInput = Extract<MortalNeedsInputType, { action: 'batch-stress' | 'batch-relieve' }>;
async function handleBatch(api: any, input: BatchInput, mode: 'stress' | 'relieve'): Promise<Envelope<unknown>> {
  let targetIds: string[];
  if (input.entityIds && input.entityIds.length > 0) {
    targetIds = input.entityIds;
    for (const id of targetIds) {
      if (!getActor(id)) return targetNotFound(`actor "${id}" not found`);
    }
    for (const id of targetIds) {
      await trackIfNeeded(api, id);
    }
    const needAmounts = [{ needId: input.needId, amount: input.amount }];
    if (mode === 'stress') await api.batch.stressMultiple(targetIds, needAmounts);
    else await api.batch.relieveMultiple(targetIds, needAmounts);
  } else {
    targetIds = (api.actors.getTrackedActors() ?? []).map((e: any) => e.id);
    if (mode === 'stress') await api.batch.stressAll(input.needId, input.amount);
    else await api.batch.relieveAll(input.needId, input.amount);
  }

  const drift: string[] = [];
  const results: Record<string, number | null> = {};
  for (const id of targetIds) {
    const actor = getActor(id);
    if (!actor) continue; // ES-sourced entity has no Actor doc / flag to verify
    const expected = expectedNeedsFlag(api, id, actor, [input.needId]);
    try {
      verifyNeedsFlag(actor, expected);
      results[id] = expected[input.needId] ?? null;
    } catch {
      drift.push(id);
      results[id] = null;
    }
  }
  if (drift.length > 0) {
    return {
      success: false,
      error: `${ErrorTokens.MORTAL_NEEDS_NOT_PERSISTED}: ${input.needId} ${mode} did not persist for ${drift.length} actor(s): ${drift.join(', ')}`,
    };
  }

  notify.updated('mortal-needs', `${input.needId} ${mode}`, { summary: `${targetIds.length} actor(s) affected` });
  return {
    success: true,
    data: { action: input.action, needId: input.needId, amount: input.amount ?? null, affected: targetIds.length, results },
  };
}

// ── rest ─────────────────────────────────────────────────────────────────────────

type ShortRestInput = Extract<MortalNeedsInputType, { action: 'short-rest' }>;
async function handleShortRest(api: any, input: ShortRestInput): Promise<Envelope<unknown>> {
  const before: string[] = (api.actors.getTrackedActors() ?? []).map((e: any) => e.id);
  await api.macro.shortRest(input.reliefPercentage ?? 25);
  // No strict per-need flag verify here (the module's partial-relief math is per-actor-per-need
  // conditional on canRecover; replicating it would duplicate engine internals — CLAUDE Rule 8).
  // Best-effort: report the post-call needs snapshot for every tracked actor so the caller can confirm
  // relief landed. Documented in the skill's safety-and-traps reference.
  const after = (api.actors.getTracked() ?? []).filter((e: any) => before.includes(e.id));
  notify.updated('mortal-needs', 'short-rest', { summary: `${after.length} tracked actor(s), relief ${input.reliefPercentage ?? 25}%` });
  return {
    success: true,
    data: {
      action: 'short-rest',
      reliefPercentage: input.reliefPercentage ?? 25,
      affected: after.length,
      actors: after.map((e: any) => ({ id: e.id, name: e.name, needs: e.needs })),
    },
  };
}

type LongRestInput = Extract<MortalNeedsInputType, { action: 'long-rest' }>;
async function handleLongRest(api: any, input: LongRestInput): Promise<Envelope<unknown>> {
  if (input.entityId) {
    const actor = getActor(input.entityId);
    if (!actor) return targetNotFound(`actor "${input.entityId}" not found`);
    await trackIfNeeded(api, input.entityId);
    await api.needs.resetAll(input.entityId);
    verifyNeedsFlag(actor, expectedNeedsFlag(api, input.entityId, actor, enabledNeedIds(api)));
    notify.updated('mortal-needs', actor.name ?? input.entityId, { summary: 'long rest — all needs reset' });
    return { success: true, data: { action: 'long-rest', entityId: input.entityId, partyWide: false } };
  }

  if (input.confirm !== true) {
    return confirmRequired(
      'long-rest with no entityId resets ALL tracked actors. Re-call with confirm:true, or pass entityId to reset one actor (ungated).',
    );
  }

  const targetIds: string[] = (api.actors.getTrackedActors() ?? []).map((e: any) => e.id);
  await api.macro.longRest();

  const drift: string[] = [];
  for (const id of targetIds) {
    const actor = getActor(id);
    if (!actor) continue;
    try {
      verifyNeedsFlag(actor, expectedNeedsFlag(api, id, actor, enabledNeedIds(api)));
    } catch {
      drift.push(id);
    }
  }
  if (drift.length > 0) {
    return {
      success: false,
      error: `${ErrorTokens.MORTAL_NEEDS_NOT_PERSISTED}: long-rest did not persist for ${drift.length} actor(s): ${drift.join(', ')}`,
    };
  }

  notify.updated('mortal-needs', 'long-rest', { summary: `party-wide — ${targetIds.length} actor(s) reset` });
  return { success: true, data: { action: 'long-rest', partyWide: true, affected: targetIds.length, entityIds: targetIds } };
}

// ── config (importConfig-persist) ─────────────────────────────────────────────────

async function applyConfigChangeAndPersist(
  api: any,
  needId: string,
  changes: Record<string, unknown>,
): Promise<{ ok: true; config: any } | { ok: false; reason: string }> {
  const full = api.config.getAllNeeds() ?? [];
  const idx = full.findIndex((c: any) => c.id === needId);
  if (idx === -1) return { ok: false, reason: `need config "${needId}" not found` };

  const merged = full.map((c: any, i: number) => (i === idx ? { ...c, ...changes } : c));
  await api.config.importConfig({ needs: merged });

  const fresh = api.config.getNeedConfig(needId);
  for (const [key, value] of Object.entries(changes)) {
    if (JSON.stringify((fresh as any)?.[key]) !== JSON.stringify(value)) {
      return {
        ok: false,
        reason: `field "${key}" expected ${JSON.stringify(value)}, got ${JSON.stringify((fresh as any)?.[key])} after importConfig`,
      };
    }
  }
  return { ok: true, config: fresh };
}

type ConfigureNeedInput = Extract<MortalNeedsInputType, { action: 'configure-need' | 'enable-need' | 'disable-need' }>;
async function handleConfigureNeed(
  api: any,
  input: ConfigureNeedInput,
  changes: Record<string, unknown>,
): Promise<Envelope<unknown>> {
  const outcome = await applyConfigChangeAndPersist(api, input.needId, changes);
  if (!outcome.ok) {
    if (outcome.reason.includes('not found')) return targetNotFound(outcome.reason);
    return { success: false, error: `${ErrorTokens.MORTAL_NEEDS_NOT_PERSISTED}: ${outcome.reason}` };
  }
  notify.updated('mortal-needs', input.needId, { summary: `config changed: ${Object.keys(changes).join(', ')} (importConfig-persisted)` });
  return { success: true, data: { action: input.action, needId: input.needId, config: outcome.config } };
}

// ── consequence (dialog-free) ─────────────────────────────────────────────────────

function buildConsequenceConfig(
  input: Extract<MortalNeedsInputType, { action: 'apply-consequence' | 'remove-consequence' }>,
): { type: string; config: Record<string, unknown>; threshold: number; ticks: number; reversible: boolean } | { error: string } {
  const threshold = input.threshold ?? 100;
  const ticks = input.ticks ?? 1;
  const reversible = input.reversible ?? true;
  if (input.consequenceType === 'condition-apply') {
    if (!input.statusId) {
      return { error: `${input.action} with consequenceType "condition-apply" requires statusId` };
    }
    return { type: 'condition-apply', config: { statusId: input.statusId }, threshold, ticks, reversible };
  }
  if (!input.path || !input.operation || input.amount === undefined) {
    return { error: `${input.action} with consequenceType "attribute-modify" requires path, operation, and amount` };
  }
  return { type: 'attribute-modify', config: { path: input.path, operation: input.operation, amount: input.amount }, threshold, ticks, reversible };
}

type ConsequenceInput = Extract<MortalNeedsInputType, { action: 'apply-consequence' | 'remove-consequence' }>;
async function handleConsequence(api: any, input: ConsequenceInput, mode: 'apply' | 'remove'): Promise<Envelope<unknown>> {
  const actor = getActor(input.entityId);
  if (!actor) return targetNotFound(`actor "${input.entityId}" not found`);
  await trackIfNeeded(api, input.entityId);

  const built = buildConsequenceConfig(input);
  if ('error' in built) return { success: false, error: `MORTAL_NEEDS_INVALID_INPUT: ${built.error}` };

  if (built.type === 'condition-apply') {
    const statusId = (built.config as any).statusId as string;
    if (mode === 'apply') {
      await api.consequences.apply(input.entityId, input.needId, built);
      const active = Boolean(actor.statuses?.has?.(statusId));
      if (!active) {
        return {
          success: false,
          error: `${ErrorTokens.MORTAL_NEEDS_NOT_PERSISTED}: condition "${statusId}" not present on actor "${input.entityId}" after apply-consequence (already active, no linked actor, or unknown status).`,
        };
      }
      notify.updated('mortal-needs', actor.name ?? input.entityId, { summary: `condition applied: ${statusId}` });
      return {
        success: true,
        data: { action: 'apply-consequence', entityId: input.entityId, needId: input.needId, consequenceType: 'condition-apply', statusId, active: true },
      };
    }
    await api.consequences.remove(input.entityId, input.needId, built);
    const active = Boolean(actor.statuses?.has?.(statusId));
    if (active) {
      return {
        success: false,
        error: `${ErrorTokens.MORTAL_NEEDS_NOT_PERSISTED}: condition "${statusId}" still present on actor "${input.entityId}" after remove-consequence.`,
      };
    }
    notify.updated('mortal-needs', actor.name ?? input.entityId, { summary: `condition removed: ${statusId}` });
    return {
      success: true,
      data: { action: 'remove-consequence', entityId: input.entityId, needId: input.needId, consequenceType: 'condition-apply', statusId, active: false },
    };
  }

  // attribute-modify (R8.2 — writability of system.status.fatigue.value is unverified; static
  // verify here catches a SYNCHRONOUS revert; an ASYNC derived-data recompute is live-smoke-only —
  // documented in the skill's safety-and-traps reference, Open Q#1).
  const path = (built.config as any).path as string;
  const operation = (built.config as any).operation as string;
  const amt = (built.config as any).amount as number;
  const before = Number(getProp(actor, path));
  if (mode === 'apply') {
    await api.consequences.apply(input.entityId, input.needId, built);
    const after = Number(getProp(actor, path));
    const expected =
      operation === 'subtract' ? Math.max(0, before - amt) : operation === 'add' ? before + amt : operation === 'set' ? amt : Math.round(before * amt);
    if (!Number.isFinite(before) || after !== expected) {
      return {
        success: false,
        error: `${ErrorTokens.MORTAL_NEEDS_NOT_PERSISTED}: attribute "${path}" expected ${expected} after apply-consequence, got ${after} (before ${before}). WFRP4e derived-data recompute may revert this synchronously — see skill safety-and-traps; prefer the condition-apply path for fatigued.`,
      };
    }
    notify.updated('mortal-needs', actor.name ?? input.entityId, { summary: `${path} ${operation} ${amt} → ${after}` });
    return {
      success: true,
      data: { action: 'apply-consequence', entityId: input.entityId, needId: input.needId, consequenceType: 'attribute-modify', path, previousValue: before, value: after },
    };
  }

  // remove: 'set' cannot be reverted by the module (no-op by design) — don't hard-fail-verify that case.
  await api.consequences.remove(input.entityId, input.needId, built);
  const after = Number(getProp(actor, path));
  if (operation !== 'set') {
    const expected = operation === 'subtract' ? before + amt : operation === 'add' ? Math.max(0, before - amt) : amt !== 0 ? Math.round(before / amt) : before;
    if (after !== expected) {
      return {
        success: false,
        error: `${ErrorTokens.MORTAL_NEEDS_NOT_PERSISTED}: attribute "${path}" expected ${expected} after remove-consequence, got ${after} (before ${before}).`,
      };
    }
  }
  notify.updated('mortal-needs', actor.name ?? input.entityId, { summary: `${path} consequence removed (now ${after})` });
  return {
    success: true,
    data: { action: 'remove-consequence', entityId: input.entityId, needId: input.needId, consequenceType: 'attribute-modify', path, previousValue: before, value: after, reverted: operation !== 'set' },
  };
}

// ── scene ────────────────────────────────────────────────────────────────────────

type SetSceneModifierInput = Extract<MortalNeedsInputType, { action: 'set-scene-modifier' }>;
async function handleSetSceneModifier(api: any, input: SetSceneModifierInput): Promise<Envelope<unknown>> {
  const scene = getGame()?.scenes?.active;
  if (!scene) return targetNotFound('no active scene (set-scene-modifier requires game.scenes.active)');

  const modifiers: Record<string, number> = {};
  if (input.stressMultiplier !== undefined) modifiers.stressMultiplier = input.stressMultiplier;
  if (input.decayMultiplier !== undefined) modifiers.decayMultiplier = input.decayMultiplier;
  if (Object.keys(modifiers).length === 0) {
    return { success: false, error: 'MORTAL_NEEDS_INVALID_INPUT: set-scene-modifier requires stressMultiplier and/or decayMultiplier' };
  }

  await api.macro.setSceneModifier(input.needId, modifiers);

  const fresh = { ...((scene.getFlag(NEEDS_FLAG_SCOPE, 'modifiers') as Record<string, any>) || {}) };
  const expectedEntry = { ...(fresh[input.needId] || {}), ...modifiers };
  const expected = { ...fresh, [input.needId]: expectedEntry };
  verifyFlagWrite(scene, NEEDS_FLAG_SCOPE, 'modifiers', expected, ErrorTokens.MORTAL_NEEDS_NOT_PERSISTED);

  notify.updated('mortal-needs', `scene modifier: ${input.needId}`, { summary: JSON.stringify(modifiers) });
  return { success: true, data: { action: 'set-scene-modifier', sceneId: scene.id, needId: input.needId, modifiers: expectedEntry } };
}

// ── custom needs ───────────────────────────────────────────────────────────────────

type RegisterCustomNeedInput = Extract<MortalNeedsInputType, { action: 'register-custom-need' }>;
async function handleRegisterCustomNeed(api: any, input: RegisterCustomNeedInput): Promise<Envelope<unknown>> {
  const needId = (input.needConfig as any)?.id;
  if (!needId || typeof needId !== 'string') {
    return { success: false, error: 'MORTAL_NEEDS_INVALID_INPUT: register-custom-need requires needConfig.id (string)' };
  }
  if ((api.config.getAllNeeds() ?? []).some((c: any) => c.id === needId)) {
    return targetNotFound(`need "${needId}" is already registered`);
  }

  const registered = api.register.need(input.needConfig);
  if (!registered) {
    return { success: false, error: `${ErrorTokens.MORTAL_NEEDS_NOT_PERSISTED}: register.need("${needId}") returned null (duplicate id or rejected by the module)` };
  }

  // register.need() is in-memory only (no settings.set) — persist via the same importConfig path as
  // configure/enable/disable-need so the custom need survives a reload.
  const full = api.config.getAllNeeds() ?? [];
  await api.config.importConfig({ needs: full });

  const fresh = api.config.getNeedConfig(needId);
  if (!fresh) {
    return { success: false, error: `${ErrorTokens.MORTAL_NEEDS_NOT_PERSISTED}: need "${needId}" absent after register-custom-need + importConfig.` };
  }

  notify.created('mortal-needs', needId, { summary: 'custom need registered (importConfig-persisted)' });
  return { success: true, data: { action: 'register-custom-need', needId, config: fresh } };
}

type UnregisterCustomNeedInput = Extract<MortalNeedsInputType, { action: 'unregister-custom-need' }>;
async function handleUnregisterCustomNeed(api: any, input: UnregisterCustomNeedInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`unregister-custom-need "${input.needId}" destroys per-actor data for that need. Re-call with confirm:true.`);
  }
  const existing = api.config.getNeedConfig(input.needId);
  if (!existing) return targetNotFound(`need "${input.needId}" not found`);
  if (!existing.custom) {
    return { success: false, error: `MORTAL_NEEDS_INVALID_INPUT: "${input.needId}" is a built-in need — unregister-custom-need only removes custom needs.` };
  }

  api.register.unregisterNeed(input.needId);

  const full = api.config.getAllNeeds() ?? [];
  await api.config.importConfig({ needs: full });

  const fresh = api.config.getNeedConfig(input.needId);
  if (fresh) {
    return { success: false, error: `${ErrorTokens.MORTAL_NEEDS_NOT_PERSISTED}: need "${input.needId}" still present after unregister-custom-need + importConfig.` };
  }

  notify.deleted('mortal-needs', input.needId, { summary: 'custom need unregistered (importConfig-persisted)' });
  return { success: true, data: { action: 'unregister-custom-need', needId: input.needId, deleted: true } };
}

// ── destructive (confirm-gated) ─────────────────────────────────────────────────────

type ResetAllInput = Extract<MortalNeedsInputType, { action: 'reset-all' }>;
async function handleResetAll(api: any, input: ResetAllInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(
      `reset-all wipes every enabled need for actor "${input.entityId}" back to default. Re-call with confirm:true (or use long-rest for the ungated camp-rest idiom).`,
    );
  }
  const actor = getActor(input.entityId);
  if (!actor) return targetNotFound(`actor "${input.entityId}" not found`);
  await trackIfNeeded(api, input.entityId);

  await api.needs.resetAll(input.entityId);
  verifyNeedsFlag(actor, expectedNeedsFlag(api, input.entityId, actor, enabledNeedIds(api)));

  notify.updated('mortal-needs', actor.name ?? input.entityId, { summary: 'reset-all — all needs wiped to default' });
  return { success: true, data: { action: 'reset-all', entityId: input.entityId } };
}

type UntrackActorInput = Extract<MortalNeedsInputType, { action: 'untrack-actor' }>;
async function handleUntrackActor(api: any, input: UntrackActorInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(
      `untrack-actor "${input.entityId}" removes the actor from the tracked roster (the needs flag stays on the actor but stops decaying/tracking). Re-call with confirm:true.`,
    );
  }
  if (!api.actors.isTracked(input.entityId)) {
    return targetNotFound(`actor "${input.entityId}" is not tracked`);
  }
  const name = actorName(input.entityId);
  await api.actors.untrack(input.entityId);

  const trackedIds: string[] = getGame()?.settings?.get?.(MODULE_ID, 'trackedActors') ?? [];
  if (api.actors.isTracked(input.entityId) || trackedIds.includes(input.entityId)) {
    return { success: false, error: `${ErrorTokens.MORTAL_NEEDS_NOT_PERSISTED}: actor "${input.entityId}" still tracked after untrack-actor.` };
  }

  notify.deleted('mortal-needs', name ?? input.entityId, { summary: 'untracked' });
  return { success: true, data: { action: 'untrack-actor', entityId: input.entityId, deleted: true } };
}
