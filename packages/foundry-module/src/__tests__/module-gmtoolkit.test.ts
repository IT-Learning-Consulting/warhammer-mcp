// Phase 11 module_integration_v1 — Unit test for module-gmtoolkit dispatcher (WFRP4e GM Toolkit).
//
// Deterministic: mocks globalThis.game.modules + game.gmtoolkit (ADR-9.1 Class-1 accessor) + canvas
// — no live Foundry. Branches:
//   - module inactive                 → MODULE_NOT_ACTIVE
//   - non-GM on a write               → GMTOOLKIT_ACCESS_DENIED
//   - bad input                       → GMTOOLKIT_INVALID_INPUT
//   - missing confirm on add-xp       → GMTOOLKIT_INVALID_INPUT
//   - api unbound                     → GMTOOLKIT_API_UNAVAILABLE
//   - update-advantage increase OUT of combat → ADVANTAGE_REQUIRES_COMBAT (Q2 guard)
//   - update-advantage increase IN combat     → socket-routed via Advantage.update(token,…,"mcp")
//   - clear-bulk missing confirm      → GMTOOLKIT_CONFIRM_REQUIRED
//   - add-xp                          → direct write + experience.log append (DP-16 verified)
//   - session-turnover                → merged XP + fortune reset write
//   - get-group                       → normalized member list

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

import { dispatchModuleGmtoolkit } from '../handlers/modules/wfrp4e-gm-toolkit/gmtoolkit.js';

const MODULE_ID = 'wfrp4e-gm-toolkit';

function setGame(opts: { active: boolean; isGM: boolean; gmtoolkit?: any; actor?: any; tokens?: any[] }) {
  (globalThis as any).game = {
    modules: { get: (id: string) => (id === MODULE_ID ? { active: opts.active } : { active: true }) },
    user: { isGM: opts.isGM },
    gmtoolkit: opts.gmtoolkit,
    actors: { get: () => opts.actor },
    scenes: { active: null, current: null, get: () => null },
    settings: { get: () => undefined },
  };
  (globalThis as any).canvas = { tokens: { get: (id: string) => (opts.tokens ?? []).find((t) => t.id === id), placeables: opts.tokens ?? [] } };
  (globalThis as any).fromUuidSync = undefined;
}

describe('dispatchModuleGmtoolkit', () => {
  beforeEach(() => {
    (globalThis as any).game = undefined;
    (globalThis as any).canvas = undefined;
    (globalThis as any).fromUuidSync = undefined;
  });

  it('returns MODULE_NOT_ACTIVE when wfrp4e-gm-toolkit is inactive', async () => {
    setGame({ active: false, isGM: true });
    const r = await dispatchModuleGmtoolkit({ action: 'get-session-info' });
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/^MODULE_NOT_ACTIVE:/);
  });

  it('returns GMTOOLKIT_ACCESS_DENIED for a non-GM on a write', async () => {
    setGame({ active: true, isGM: false, gmtoolkit: {} });
    const r = await dispatchModuleGmtoolkit({ action: 'roll-d100' });
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/GMTOOLKIT_ACCESS_DENIED/);
  });

  it('returns GMTOOLKIT_INVALID_INPUT on bad input (missing testSkill)', async () => {
    setGame({ active: true, isGM: true, gmtoolkit: {} });
    const r = await dispatchModuleGmtoolkit({ action: 'run-group-test' } as any);
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/^GMTOOLKIT_INVALID_INPUT:/);
  });

  it('returns GMTOOLKIT_INVALID_INPUT when add-xp is missing confirm:true', async () => {
    setGame({ active: true, isGM: true, gmtoolkit: {} });
    const r = await dispatchModuleGmtoolkit({ action: 'add-xp', actorId: 'A', amount: 50 } as any);
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/^GMTOOLKIT_INVALID_INPUT:/);
  });

  it('returns GMTOOLKIT_API_UNAVAILABLE when game.gmtoolkit is unbound', async () => {
    setGame({ active: true, isGM: true, gmtoolkit: undefined });
    const r = await dispatchModuleGmtoolkit({ action: 'get-session-info' });
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/GMTOOLKIT_(API_UNAVAILABLE|HANDLER_ERROR)/);
  });

  it('update-advantage increase OUTSIDE combat returns ADVANTAGE_REQUIRES_COMBAT (Q2 guard)', async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const token = { id: 'T1', actor: { name: 'Hero', inCombat: false, isOwner: true, system: { status: { advantage: { value: 0 } } } } };
    setGame({ active: true, isGM: true, gmtoolkit: { advantage: { update } }, tokens: [token] });
    const r = await dispatchModuleGmtoolkit({ action: 'update-advantage', mode: 'increase', tokenId: 'T1' });
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/ADVANTAGE_REQUIRES_COMBAT/);
    expect(update).not.toHaveBeenCalled();
  });

  it('update-advantage increase IN combat routes through Advantage.update(token, "increase", "mcp")', async () => {
    const adv = { value: 1 };
    const update = vi.fn().mockImplementation(async (_t: any, mode: string) => { if (mode === 'increase') adv.value += 1; });
    const token = { id: 'T1', actor: { name: 'Hero', inCombat: true, isOwner: true, system: { status: { advantage: adv } } } };
    setGame({ active: true, isGM: true, gmtoolkit: { advantage: { update } }, tokens: [token] });
    const r: any = await dispatchModuleGmtoolkit({ action: 'update-advantage', mode: 'increase', tokenId: 'T1' });
    expect(r.success).toBe(true);
    expect(r.data.previousValue).toBe(1);
    expect(r.data.value).toBe(2);
    expect(update).toHaveBeenCalledWith(token, 'increase', 'mcp');
  });

  it('update-advantage clear-bulk without confirm returns GMTOOLKIT_CONFIRM_REQUIRED', async () => {
    const update = vi.fn();
    setGame({ active: true, isGM: true, gmtoolkit: { advantage: { update } }, tokens: [] });
    const r = await dispatchModuleGmtoolkit({ action: 'update-advantage', mode: 'clear-bulk' });
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/GMTOOLKIT_CONFIRM_REQUIRED/);
    expect(update).not.toHaveBeenCalled();
  });

  it('add-xp writes total/current and appends an experience.log entry (DP-16 verified)', async () => {
    let exp: any = { total: 100, current: 40, log: [{ amount: 100, reason: 'start', type: 'total' }] };
    const actor: any = {
      name: 'Wizard',
      system: { details: { experience: exp } },
      update: vi.fn().mockImplementation(async (patch: any) => {
        exp = {
          total: patch['system.details.experience.total'],
          current: patch['system.details.experience.current'],
          log: patch['system.details.experience.log'],
        };
        actor.system.details.experience = exp;
      }),
    };
    setGame({ active: true, isGM: true, gmtoolkit: {}, actor });
    const r: any = await dispatchModuleGmtoolkit({ action: 'add-xp', actorId: 'A', amount: 50, reason: 'Session 3', confirm: true });
    expect(r.success).toBe(true);
    expect(r.data.total).toBe(150);
    expect(r.data.current).toBe(90);
    const logArg = actor.update.mock.calls[0][0]['system.details.experience.log'];
    expect(logArg).toHaveLength(2);
    expect(logArg[1]).toMatchObject({ amount: 50, reason: 'Session 3', type: 'total' });
  });

  it('session-turnover does a merged XP + fortune-reset write', async () => {
    const actor: any = {
      name: 'Hero',
      system: { details: { experience: { total: 200, current: 50, log: [] } }, status: { fate: { value: 3 }, fortune: { value: 0 } } },
      update: vi.fn().mockResolvedValue(undefined),
    };
    setGame({ active: true, isGM: true, gmtoolkit: {}, actor });
    const r: any = await dispatchModuleGmtoolkit({ action: 'session-turnover', actorId: 'A', xp: 30, resetFortune: true, confirm: true });
    expect(r.success).toBe(true);
    expect(r.data.xpAwarded).toBe(30);
    expect(r.data.fortuneReset).toEqual({ from: 0, to: 3 });
    const patch = actor.update.mock.calls[0][0];
    expect(patch['system.details.experience.total']).toBe(230);
    expect(patch['system.status.fortune.value']).toBe(3);
  });

  it('get-group normalizes the module getGroup result to {id,name} members', async () => {
    const getGroup = vi.fn().mockReturnValue([{ id: 'a1', name: 'Gunnar' }, { actor: { id: 'a2', name: 'Salundra' } }]);
    setGame({ active: true, isGM: true, gmtoolkit: { utility: { getGroup } } });
    const r: any = await dispatchModuleGmtoolkit({ action: 'get-group', groupType: 'party' });
    expect(r.success).toBe(true);
    expect(r.data.count).toBe(2);
    expect(r.data.members[1].name).toBe('Salundra');
  });
});

// ── BUG-492 + BUG-500 (Wave 2) ──────────────────────────────────────────────────
// Aggregate entry shape source-verified at wfrp4e-gm-toolkit/modules/group-test.mjs:216-229
// ({ actor: <token|actor doc>, skill, outcome, sl, description, roll, target }) — the raw
// `actor` field embeds the full doc (~97 KB / 8 targets live), which is WHY the compact
// projection exists. Not an invented mock shape (PF-003).

describe('BUG-492: run-group-test guard + compact projection', () => {
  it('malformed explicit targetGroup entry fails loud with GMTOOLKIT_INVALID_TARGET (no run call)', async () => {
    const run = vi.fn();
    setGame({ active: true, isGM: true, gmtoolkit: { grouptest: { run } } });
    (globalThis as any).fromUuid = vi.fn(async (u: string) => (u === 'Actor.good' ? { id: 'good' } : null));
    const r = await dispatchModuleGmtoolkit({
      action: 'run-group-test',
      testSkill: 'Perception',
      targetGroup: ['Actor.good', 'not-a-uuid'],
    } as any);
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/GMTOOLKIT_INVALID_TARGET/);
    expect((r as any).error).toContain('not-a-uuid');
    expect(run).not.toHaveBeenCalled();
    delete (globalThis as any).fromUuid;
  });

  it('response carries compact per-target rows, never the embedded actor doc', async () => {
    const run = vi.fn(async () => undefined);
    setGame({ active: true, isGM: true, gmtoolkit: { grouptest: { run } } });
    (globalThis as any).fromUuid = vi.fn(async () => ({ id: 'ok' }));
    // Heavy live-shaped aggregate entry (group-test.mjs:216-229).
    const heavyActor = { name: 'Hero', id: 'A1', prototypeToken: { texture: { src: 'x'.repeat(500) } }, items: [{ big: 'y'.repeat(500) }] };
    (globalThis as any).game.settings = {
      get: (_scope: string, key: string) =>
        key === 'aggregateResultGroupTest'
          ? [{ actor: heavyActor, skill: { name: 'Perception', system: { huge: 'z'.repeat(500) } }, outcome: 'success', sl: '+2', description: 'Astounding Success', roll: 12, target: 55 }]
          : undefined,
    };
    const r: any = await dispatchModuleGmtoolkit({
      action: 'run-group-test',
      testSkill: 'Perception',
      targetGroup: ['Actor.A1'],
    } as any);
    expect(r.success).toBe(true);
    expect(r.data.results).toEqual([
      { name: 'Hero', id: 'A1', skill: 'Perception', outcome: 'success', sl: '+2', description: 'Astounding Success', roll: 12, target: 55 },
    ]);
    // No embedded docs survive the projection.
    const json = JSON.stringify(r.data);
    expect(json).not.toContain('prototypeToken');
    expect(json).not.toContain('items');
    delete (globalThis as any).fromUuid;
  });
});

describe('BUG-500: update-advantage returns the settled post-write value', () => {
  it('later-tick write (module socket tick) is picked up by the settle-poll re-read', async () => {
    const adv = { value: 1 };
    // Live failure mode: Advantage.update returns BEFORE the document write lands
    // (the ×5 chained live repro always echoed previousValue). Simulate the
    // later-tick apply with a 120ms deferred mutation.
    const update = vi.fn().mockImplementation(async (_t: any, mode: string) => {
      setTimeout(() => { if (mode === 'increase') adv.value += 1; }, 120);
    });
    const token = { id: 'T1', actor: { name: 'Hero', inCombat: true, isOwner: true, system: { status: { advantage: adv } } } };
    setGame({ active: true, isGM: true, gmtoolkit: { advantage: { update } }, tokens: [token] });
    const r: any = await dispatchModuleGmtoolkit({ action: 'update-advantage', mode: 'increase', tokenId: 'T1' });
    expect(r.success).toBe(true);
    expect(r.data.previousValue).toBe(1);
    expect(r.data.value).toBe(2); // fresh, not the stale echo
    expect(r.data.note).toBeUndefined();
  });
});
