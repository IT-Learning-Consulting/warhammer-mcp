// Module Integration v1 Phase 11 — module-gmtoolkit handler (WFRP4e GM Toolkit v9.1.1).
//
// Always-registered umbrella. requireModuleActive('wfrp4e-gm-toolkit') is the FIRST executable
// statement — RETURNS the MODULE_NOT_ACTIVE envelope, never throws (Phase 1 carry-forward).
//
// 12 actions over the verified server-reachable surface (capability-manifest.json), all via
// DIALOG-FREE paths (ADR-10.1). Dispositions (Q&A): lose-momentum + deal-damage are NOT actions
// (dispositioned EXCLUDED_UNSAFE / GUIDANCE_ONLY); session-turnover is decomposed to direct writes.
//
// ADR-9.1 accessor (Phase 9): GM Toolkit exposes its API as Class-1 `game.gmtoolkit` (set at the
// init hook; wfrp4e-gm-toolkit.mjs:37-64). getGmtoolkitApi() resolves it, throws
// GMTOOLKIT_API_UNAVAILABLE on absence; live smoke mandatory.
//
// HEADLINE (R12): update-advantage calls game.gmtoolkit.advantage.update(token, mode, "mcp") — the
// socket route inside Advantage.update makes the write succeed on PLAYER-OWNED tokens (a direct GM
// update-actor silently fails there). "mcp" context bypasses the single-controlled-token guard.
// Respects the module's !inCombat guard for increase/reduce (Q2); only clear skips it.
//
// SENTINELS to verify at live smoke (flagged per /agent-execute Step 3.1):
//   - toggle-scene-light globalLight path: v13 uses scene.environment.globalLight.enabled (legacy
//     was scene.globalLight). Written below as environment.globalLight.enabled — VERIFY live.
//   - add-xp / session-turnover experience.log entry shape: written as {amount, reason, type:'total'}
//     per wfrp4e convention — VERIFY the entry renders on the character sheet's XP log.
//   - check-conditions condition value path: read from effect flags — VERIFY against wfrp4e.
//
// Anchors: DP-15, DP-16, CCR-3 (notify on writes), CCR-4 (confirm on session-turnover/add-xp +
// handler-enforced confirm on clear-bulk). Source: phase11_pre_plan.md.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ModuleGmtoolkitInput, type ModuleGmtoolkitInputType } from './schemas.js';
import { notify } from '../../../notify.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

const MODULE_ID = 'wfrp4e-gm-toolkit';

// ── Local helpers ──────────────────────────────────────────────────────────────

function isGM(): boolean {
  return Boolean((globalThis as any).game?.user?.isGM);
}

/** Resolve `game.gmtoolkit` (ADR-9.1 Class-1 accessor), or throw. */
function getGmtoolkitApi(): any {
  const api = (globalThis as any).game?.gmtoolkit;
  if (!api) {
    throw new Error(
      'GMTOOLKIT_API_UNAVAILABLE: game.gmtoolkit is not bound — the module may not have reached its init hook',
    );
  }
  return api;
}

function resolveActor(actorId: string): any {
  const game = (globalThis as any).game;
  const sync = (globalThis as any).fromUuidSync;
  let actor: any = null;
  if (typeof sync === 'function' && actorId.includes('.')) {
    try { actor = sync(actorId); } catch { actor = null; }
  }
  if (!actor) actor = game?.actors?.get?.(actorId) ?? null;
  // A TokenDocument UUID resolves to the token; unwrap to its actor.
  if (actor?.actor) actor = actor.actor;
  return actor;
}

/** Resolve a placeable Token (Advantage.update wants a canvas Token, not a document). */
function resolveToken(tokenId: string): any {
  const canvas = (globalThis as any).canvas;
  const sync = (globalThis as any).fromUuidSync;
  let token: any = canvas?.tokens?.get?.(tokenId) ?? null;
  if (!token && typeof sync === 'function' && tokenId.includes('.')) {
    try {
      const doc = sync(tokenId);
      token = doc?.object ?? doc ?? null;
    } catch { token = null; }
  }
  return token;
}

function resolveScene(sceneId?: string): any {
  const game = (globalThis as any).game;
  if (sceneId) return game?.scenes?.get?.(sceneId) ?? null;
  return game?.scenes?.active ?? (game?.scenes?.current ?? null);
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

const READ_ACTIONS = new Set(['get-session-info', 'get-group', 'check-conditions']);

export async function dispatchModuleGmtoolkit(data: unknown): Promise<Envelope<unknown>> {
  // Guard FIRST — RETURNS {success:false,error}; never throws (carry-forward).
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: ModuleGmtoolkitInputType;
  try {
    input = ModuleGmtoolkitInput.parse(data);
  } catch (e) {
    return { success: false, error: `GMTOOLKIT_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (!READ_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `GMTOOLKIT_ACCESS_DENIED: ${input.action} requires GM` };
  }

  try {
    // await each handler so async throws (e.g. api unbound) are caught here and returned as the
    // typed HANDLER_ERROR envelope — the dispatcher never leaks a rejection.
    switch (input.action) {
      case 'run-group-test':
        return await handleRunGroupTest(input);
      case 'update-advantage':
        return await handleUpdateAdvantage(input);
      case 'get-session-info':
        return handleGetSessionInfo(input);
      case 'get-group':
        return handleGetGroup(input);
      case 'adjust-status':
        return await handleAdjustStatus(input);
      case 'toggle-scene-light':
        return await handleToggleSceneLight(input);
      case 'pull-to-scene':
        return await handlePullToScene(input);
      case 'toggle-compendium-visibility':
        return await handleToggleCompendiumVisibility(input);
      case 'roll-d100':
        return await handleRollD100(input);
      case 'check-conditions':
        return handleCheckConditions(input);
      case 'session-turnover':
        return await handleSessionTurnover(input);
      case 'add-xp':
        return await handleAddXp(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `GMTOOLKIT_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `GMTOOLKIT_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Group test (bypass:true → dialog-free) ────────────────────────────────────────

type GroupTestInput = Extract<ModuleGmtoolkitInputType, { action: 'run-group-test' }>;
async function handleRunGroupTest(input: GroupTestInput): Promise<Envelope<unknown>> {
  const api = getGmtoolkitApi();
  const run = api.grouptest?.run;
  if (typeof run !== 'function') {
    throw new Error('GMTOOLKIT_API_UNAVAILABLE: game.gmtoolkit.grouptest.run is not bound');
  }
  const testOptions: Record<string, unknown> = { bypass: true };
  if (input.difficulty !== undefined) testOptions.difficulty = input.difficulty;
  if (input.testModifier !== undefined) testOptions.testModifier = input.testModifier;
  if (input.rollMode !== undefined) testOptions.rollMode = input.rollMode;
  if (input.targetGroup !== undefined) {
    testOptions.targetGroup = input.targetGroup;
  } else {
    // BUG-351: api.grouptest.run IS the module's bare runGroupTest, whose first line is
    // `testOptions.targetGroup.filter(...)` — it crashes with TypeError if targetGroup is
    // undefined. The module's runSilentGroupTest wrapper auto-populates it via
    // getGroupMembers (controlled tokens, else the configured default party group); we
    // bypass that wrapper, so resolve the default party group here. Headless MCP path has
    // no controlled tokens, so this falls through to the configured player group.
    let partyUuids: string[] = [];
    try {
      const groupType = (globalThis as any).game?.settings?.get?.(MODULE_ID, 'defaultPartyGroupTest');
      const group: any[] = api.utility?.getGroup?.(groupType) ?? [];
      partyUuids = group
        .map((g: any) => g?.uuid)
        .filter((u: unknown): u is string => typeof u === 'string');
    } catch {
      partyUuids = [];
    }
    if (partyUuids.length === 0) {
      return {
        success: false,
        error:
          'GMTOOLKIT_GROUP_NOT_FOUND: no party members resolved — assign players to the configured default party group or pass targetGroup explicitly',
      };
    }
    testOptions.targetGroup = partyUuids;
  }
  const resolvedTarget = testOptions.targetGroup as string[];
  await run(input.testSkill, testOptions);
  // Aggregate result (if the module stored it) — best-effort read, not load-bearing.
  let aggregate: unknown = null;
  try { aggregate = (globalThis as any).game?.settings?.get?.(MODULE_ID, 'aggregateResultGroupTest') ?? null; } catch { aggregate = null; }
  notify.updated('gmtoolkit', `group test: ${input.testSkill}`, { summary: `bypass roll for ${resolvedTarget.length} target(s)` });
  return { success: true, data: { testSkill: input.testSkill, ran: true, targetCount: resolvedTarget.length, aggregate } };
}

// ── Advantage (player-owned socket-route fix + !inCombat guard) ────────────────────

const ADV_MODE_MAP: Record<string, string> = { increase: 'increase', reduce: 'reduce', 'clear-single': 'clear', 'clear-bulk': 'clear' };

type AdvantageInput = Extract<ModuleGmtoolkitInputType, { action: 'update-advantage' }>;
async function handleUpdateAdvantage(input: AdvantageInput): Promise<Envelope<unknown>> {
  const api = getGmtoolkitApi();
  // Advantage.update is a CLASS STATIC that calls this.adjust(...) internally — it MUST be invoked
  // BOUND (api.advantage.update(...)), never extracted-and-called, or `this` is undefined and the
  // module throws "reading 'adjust'". (Live-smoke caught this; the vitest mock didn't use `this`.)
  const advantage = api.advantage;
  if (!advantage || typeof advantage.update !== 'function') {
    throw new Error('GMTOOLKIT_API_UNAVAILABLE: game.gmtoolkit.advantage.update is not bound');
  }
  const adjustment = ADV_MODE_MAP[input.mode];

  if (input.mode === 'clear-bulk') {
    if (input.confirm !== true) {
      return { success: false, error: 'GMTOOLKIT_CONFIRM_REQUIRED: clear-bulk requires confirm:true (party-wide advantage reset)' };
    }
    const canvas = (globalThis as any).canvas;
    const tokens: any[] = (canvas?.tokens?.placeables ?? []).filter((t: any) => t?.actor);
    let cleared = 0;
    for (const t of tokens) {
      // Single-flight: await each (the wfrp4e/gmtoolkit socket serializes — carry-forward).
      await advantage.update(t, 'clear', 'mcp');
      cleared++;
    }
    notify.updated('gmtoolkit', 'advantage clear-bulk', { summary: `cleared advantage on ${cleared} token(s)` });
    return { success: true, data: { mode: input.mode, clearedCount: cleared } };
  }

  // Single-token modes
  if (!input.tokenId) {
    return { success: false, error: `GMTOOLKIT_INVALID_INPUT: tokenId is required for ${input.mode}` };
  }
  const token = resolveToken(input.tokenId);
  if (!token) return { success: false, error: `TOKEN_NOT_FOUND: no token "${input.tokenId}" on the canvas` };
  const actor = token.actor;
  const previousValue = Number(actor?.system?.status?.advantage?.value ?? 0);

  // Q2 — respect the module's !inCombat guard: increase/reduce only apply in active combat.
  if ((input.mode === 'increase' || input.mode === 'reduce') && !actor?.inCombat) {
    return { success: false, error: `ADVANTAGE_REQUIRES_COMBAT: ${input.mode} only applies to a token in active combat (use clear-single outside combat)` };
  }

  // The socket route inside Advantage.update handles player-owned tokens; "mcp" context bypasses the
  // single-controlled-token guard. Dialog-free for increase/reduce/clear (only loseMomentum opens one).
  // Bound call (advantage.update) — Advantage.update is a class static using this.adjust internally.
  await advantage.update(token, adjustment, 'mcp');

  // DP-16 read-back (best-effort: a socket-applied write to a player-owned token may settle async).
  const value = Number(token.actor?.system?.status?.advantage?.value ?? previousValue);
  const isOwner = Boolean(actor?.isOwner);
  const note = !isOwner && value === previousValue
    ? 'Write routed via the GM Toolkit socket (player-owned token) — verify the value settled on the sheet.'
    : undefined;
  notify.updated('gmtoolkit', actor?.name ?? input.tokenId, { summary: `advantage ${input.mode}: ${previousValue} → ${value}` });
  return { success: true, data: { tokenId: input.tokenId, actorName: actor?.name ?? null, mode: input.mode, previousValue, value, playerOwned: !isOwner, ...(note ? { note } : {}) } };
}

// ── Session info (read) ───────────────────────────────────────────────────────────

type SessionInfoInput = Extract<ModuleGmtoolkitInputType, { action: 'get-session-info' }>;
function handleGetSessionInfo(_input: SessionInfoInput): Envelope<unknown> {
  const api = getGmtoolkitApi();
  const getSession = api.utility?.getSession;
  if (typeof getSession !== 'function') {
    throw new Error('GMTOOLKIT_API_UNAVAILABLE: game.gmtoolkit.utility.getSession is not bound');
  }
  const s = getSession() ?? {};
  return { success: true, data: { sessionID: s.sessionID ?? s.session ?? null, date: s.date ?? null, time: s.time ?? null } };
}

// ── Group resolution (read) ─────────────────────────────────────────────────────

type GetGroupInput = Extract<ModuleGmtoolkitInputType, { action: 'get-group' }>;
function handleGetGroup(input: GetGroupInput): Envelope<unknown> {
  const api = getGmtoolkitApi();
  const getGroup = api.utility?.getGroup;
  if (typeof getGroup !== 'function') {
    throw new Error('GMTOOLKIT_API_UNAVAILABLE: game.gmtoolkit.utility.getGroup is not bound');
  }
  const options: Record<string, unknown> = {};
  if (input.activeOnly !== undefined) options.active = input.activeOnly;
  if (input.presentOnly !== undefined) options.present = input.presentOnly;
  const raw = getGroup(input.groupType, options) ?? [];
  const members = (Array.isArray(raw) ? raw : []).map((m: any) => {
    // getGroup returns actors or tokens depending on groupType — normalize.
    const actor = m?.actor ?? m;
    return { id: actor?.id ?? m?.id ?? null, name: actor?.name ?? m?.name ?? null };
  });
  return { success: true, data: { groupType: input.groupType, count: members.length, members } };
}

// ── Adjust status ────────────────────────────────────────────────────────────────

type AdjustStatusInput = Extract<ModuleGmtoolkitInputType, { action: 'adjust-status' }>;
async function handleAdjustStatus(input: AdjustStatusInput): Promise<Envelope<unknown>> {
  const actor = resolveActor(input.actorId);
  if (!actor) return { success: false, error: `ACTOR_NOT_FOUND: no actor resolves for "${input.actorId}"` };
  const field = `system.status.${input.status}.value`;
  const previousValue = Number(getByPath(actor, `system.status.${input.status}.value`) ?? 0);
  // Direct write (floor at 0). The module's utility.adjustStatus commits the same actor.update but
  // then calls ui.notifications.notify + canvas.hud.token.render() (utility.mjs:84-85), which CRASH
  // in headless MCP context ("DOMTokenList ... '[object Object]'"). So we bypass the module method
  // and write the field directly — the ADR-10.1 UI-side-effect-avoidance pattern. Max-cap (fortune≤
  // fate etc.) is the module's getMaxStatus convenience and is left to the GM (a wrong replicated cap
  // would silently truncate legit values); we only enforce the universal floor at 0.
  const newValue = Math.max(0, previousValue + input.change);
  await actor.update({ [field]: newValue });
  // DP-16 read-back.
  const value = Number(getByPath(resolveActor(input.actorId), `system.status.${input.status}.value`) ?? previousValue);
  if (value !== newValue) {
    return { success: false, error: `GMTOOLKIT_STATUS_NOT_PERSISTED: ${field} read back ${value}, expected ${newValue}` };
  }
  notify.updated('gmtoolkit', actor.name ?? input.actorId, { summary: `${input.status}: ${previousValue} → ${value} (${input.change >= 0 ? '+' : ''}${input.change})` });
  return { success: true, data: { actorId: input.actorId, actorName: actor.name ?? null, status: input.status, change: input.change, previousValue, value } };
}

function getByPath(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

// ── Scene vision / light toggle ──────────────────────────────────────────────────

type ToggleSceneLightInput = Extract<ModuleGmtoolkitInputType, { action: 'toggle-scene-light' }>;
async function handleToggleSceneLight(input: ToggleSceneLightInput): Promise<Envelope<unknown>> {
  const scene = resolveScene(input.sceneId);
  if (!scene) return { success: false, error: `SCENE_NOT_FOUND: no scene "${input.sceneId ?? '(active)'}"` };
  const patch: Record<string, unknown> = {};
  if (input.tokenVision !== undefined) patch.tokenVision = input.tokenVision;
  // SENTINEL: v13 stores global light under environment.globalLight.enabled (legacy: globalLight).
  if (input.globalLight !== undefined) patch['environment.globalLight.enabled'] = input.globalLight;
  if (Object.keys(patch).length === 0) {
    return { success: false, error: 'GMTOOLKIT_NO_FIELDS: toggle-scene-light requires tokenVision and/or globalLight' };
  }
  await scene.update(patch);
  notify.updated('gmtoolkit', scene.name ?? input.sceneId ?? '(active scene)', { summary: `scene light/vision: ${Object.keys(patch).join(', ')}` });
  return {
    success: true,
    data: {
      sceneId: scene.id ?? null,
      sceneName: scene.name ?? null,
      tokenVision: input.tokenVision !== undefined ? Boolean(scene.tokenVision) : null,
      globalLight: input.globalLight !== undefined ? Boolean(getByPath(scene, 'environment.globalLight.enabled')) : null,
    },
  };
}

// ── Pull players to a scene (scene.activate) ─────────────────────────────────────

type PullToSceneInput = Extract<ModuleGmtoolkitInputType, { action: 'pull-to-scene' }>;
async function handlePullToScene(input: PullToSceneInput): Promise<Envelope<unknown>> {
  const scene = resolveScene(input.sceneId);
  if (!scene) return { success: false, error: `SCENE_NOT_FOUND: no scene "${input.sceneId ?? '(active)'}"` };
  // scene.activate() makes it the active scene for all connected clients (the standard Foundry
  // "everyone goes here" mechanism). Full force-pull of players who navigated elsewhere is the
  // module's private socket — the GM can use the GM Toolkit macro for that hard pull.
  await scene.activate();
  notify.updated('gmtoolkit', scene.name ?? input.sceneId ?? 'scene', { summary: 'scene activated (players pulled)' });
  return { success: true, data: { sceneId: scene.id ?? null, sceneName: scene.name ?? null, activated: true } };
}

// ── Compendium pack visibility toggle ────────────────────────────────────────────

type ToggleCompendiumInput = Extract<ModuleGmtoolkitInputType, { action: 'toggle-compendium-visibility' }>;
async function handleToggleCompendiumVisibility(input: ToggleCompendiumInput): Promise<Envelope<unknown>> {
  const game = (globalThis as any).game;
  const pack = game?.packs?.get?.(input.packId);
  if (!pack) return { success: false, error: `PACK_NOT_FOUND: no compendium pack "${input.packId}"` };
  // v13: compendium visibility is the OWNERSHIP model (pack.ownership), not the legacy `private`
  // boolean (undefined in v13 → old reads/writes were no-ops). configure() validates the ownership
  // field as STRING level names and only the PLAYER role is configurable here — submit ONLY
  // {PLAYER: "NONE"|"OBSERVER"}, never the spread existing object (it carries a GAMEMASTER key the
  // validator rejects) and never numeric levels (rejected too). A pack is GM-only ("private") when
  // PLAYER access is NONE; "visible" = OBSERVER.
  const lvl = (pack.ownership ?? {}).PLAYER;
  const wasPrivate = lvl === 'NONE' || lvl === 0;
  const nextPrivate = input.private !== undefined ? input.private : !wasPrivate;
  await pack.configure({ ownership: { PLAYER: nextPrivate ? 'NONE' : 'OBSERVER' } });
  // DP-16 read-back from the live pack.
  const afterLvl = game?.packs?.get?.(input.packId)?.ownership?.PLAYER;
  const confirmedPrivate = afterLvl === 'NONE' || afterLvl === 0;
  notify.updated('gmtoolkit', pack.metadata?.label ?? input.packId, { summary: `visibility: ${confirmedPrivate ? 'GM-only' : 'visible'}` });
  return { success: true, data: { packId: input.packId, wasPrivate, private: confirmedPrivate } };
}

// ── Quick d100 roll ──────────────────────────────────────────────────────────────

type RollD100Input = Extract<ModuleGmtoolkitInputType, { action: 'roll-d100' }>;
async function handleRollD100(input: RollD100Input): Promise<Envelope<unknown>> {
  const RollCls = (globalThis as any).Roll;
  if (!RollCls) throw new Error('GMTOOLKIT_API_UNAVAILABLE: Foundry Roll class is not bound');
  const roll = await new RollCls('1d100').evaluate();
  try { await roll.toMessage({ flavor: input.flavor ?? 'GM d100' }); } catch { /* chat post is best-effort */ }
  notify.updated('gmtoolkit', 'd100', { summary: `rolled ${roll.total}` });
  return { success: true, data: { formula: '1d100', total: Number(roll.total), flavor: input.flavor ?? 'GM d100' } };
}

// ── Read an actor's active conditions ─────────────────────────────────────────────

type CheckConditionsInput = Extract<ModuleGmtoolkitInputType, { action: 'check-conditions' }>;
function handleCheckConditions(input: CheckConditionsInput): Envelope<unknown> {
  const actor = resolveActor(input.actorId);
  if (!actor) return { success: false, error: `ACTOR_NOT_FOUND: no actor resolves for "${input.actorId}"` };
  // wfrp4e conditions are ActiveEffects carrying a status id. The stack value mirrors the system's
  // own `conditionValue` getter (wfrp4e.js:11433): system.condition.value ?? getFlag("wfrp4e","value")
  // — in v13 the value lives in system.condition.value (the flag is legacy fallback). Verified live.
  const effects: any[] = actor.effects?.contents ?? [...(actor.effects ?? [])];
  const conditions = effects
    .filter((e: any) => (e.statuses?.size ?? e.statuses?.length ?? 0) > 0 || e.flags?.core?.statusId)
    .map((e: any) => ({
      id: e.id,
      name: e.name ?? e.label ?? null,
      value: e.system?.condition?.value ?? e.flags?.wfrp4e?.value ?? null,
    }));
  return { success: true, data: { actorId: input.actorId, actorName: actor.name ?? null, count: conditions.length, conditions } };
}

// ── Session turnover (dialog-free direct-write decompose) ─────────────────────────

/**
 * Append a wfrp4e experience.log entry. Canonical shape is
 * `{ reason, amount, spent, total, type: "total" }` (wfrp4e.js:25055) — the sheet renders the
 * running spent/total columns per entry, so they must be stamped (verified live: a {amount,reason,
 * type}-only entry left the spent/total columns blank).
 */
function appendXpLog(log: any[], amount: number, reason: string, spent: number, total: number): any[] {
  const next = Array.isArray(log) ? [...log] : [];
  next.push({ reason, amount, spent, total, type: 'total' });
  return next;
}

type SessionTurnoverInput = Extract<ModuleGmtoolkitInputType, { action: 'session-turnover' }>;
async function handleSessionTurnover(input: SessionTurnoverInput): Promise<Envelope<unknown>> {
  const actor = resolveActor(input.actorId);
  if (!actor) return { success: false, error: `ACTOR_NOT_FOUND: no actor resolves for "${input.actorId}"` };
  const exp = actor.system?.details?.experience ?? {};
  const prevTotal = Number(exp.total ?? 0);
  const prevCurrent = Number(exp.current ?? 0);
  const patch: Record<string, unknown> = {};

  const xp = input.xp ?? 0;
  if (xp > 0) {
    patch['system.details.experience.total'] = prevTotal + xp;
    patch['system.details.experience.current'] = prevCurrent + xp;
    // spent is unchanged by an award (total + current both rise by xp); total is the new total.
    patch['system.details.experience.log'] = appendXpLog(exp.log, xp, input.reason ?? 'Session turnover', prevTotal - prevCurrent, prevTotal + xp);
  }
  let fortuneReset: { from: number; to: number } | null = null;
  if (input.resetFortune) {
    const fate = Number(actor.system?.status?.fate?.value ?? 0);
    const prevFortune = Number(actor.system?.status?.fortune?.value ?? 0);
    patch['system.status.fortune.value'] = fate;
    fortuneReset = { from: prevFortune, to: fate };
  }
  if (Object.keys(patch).length > 0) {
    await actor.update(patch); // single merged write
  }
  if (input.activateSceneId) {
    const scene = resolveScene(input.activateSceneId);
    if (scene) await scene.activate();
  }
  notify.updated('gmtoolkit', actor.name ?? input.actorId, { summary: `session turnover (xp +${xp}${input.resetFortune ? ', fortune reset' : ''})` });
  return {
    success: true,
    data: {
      actorId: input.actorId,
      actorName: actor.name ?? null,
      xpAwarded: xp,
      experienceTotal: xp > 0 ? prevTotal + xp : prevTotal,
      fortuneReset,
      sceneActivated: input.activateSceneId ?? null,
    },
  };
}

// ── Add XP (direct write + experience.log append) ─────────────────────────────────

type AddXpInput = Extract<ModuleGmtoolkitInputType, { action: 'add-xp' }>;
async function handleAddXp(input: AddXpInput): Promise<Envelope<unknown>> {
  const actor = resolveActor(input.actorId);
  if (!actor) return { success: false, error: `ACTOR_NOT_FOUND: no actor resolves for "${input.actorId}"` };
  const exp = actor.system?.details?.experience ?? {};
  const prevTotal = Number(exp.total ?? 0);
  const prevCurrent = Number(exp.current ?? 0);
  const newTotal = prevTotal + input.amount;
  const newCurrent = prevCurrent + input.amount;
  await actor.update({
    'system.details.experience.total': newTotal,
    'system.details.experience.current': newCurrent,
    // spent is unchanged by an award (total + current both shift by amount); total is the new total.
    'system.details.experience.log': appendXpLog(exp.log, input.amount, input.reason, newTotal - newCurrent, newTotal),
  });
  // DP-16 read-back.
  const confirmedTotal = Number(resolveActor(input.actorId)?.system?.details?.experience?.total ?? prevTotal);
  if (confirmedTotal !== newTotal) {
    return { success: false, error: `GMTOOLKIT_XP_NOT_PERSISTED: experience.total read back ${confirmedTotal}, expected ${newTotal}` };
  }
  notify.updated('gmtoolkit', actor.name ?? input.actorId, { summary: `XP ${input.amount >= 0 ? '+' : ''}${input.amount} (${input.reason}) → total ${newTotal}` });
  return {
    success: true,
    data: { actorId: input.actorId, actorName: actor.name ?? null, amount: input.amount, reason: input.reason, previousTotal: prevTotal, total: newTotal, current: newCurrent },
  };
}
