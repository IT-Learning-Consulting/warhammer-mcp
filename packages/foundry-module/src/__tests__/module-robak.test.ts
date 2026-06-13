// Phase 9 module_integration_v1 — Unit test for module-robak dispatcher.
//
// Deterministic: mocks globalThis.game.modules + globalThis.SocketHandlers — no live Foundry.
// Branches:
//   - module inactive          → MODULE_NOT_ACTIVE envelope
//   - non-GM                   → GM_REQUIRED envelope
//   - bad input (missing skill)→ ZodError (parse throws)
//   - SocketHandlers unbound   → ROBAK_ROLL_SKILL_UNAVAILABLE envelope
//   - happy path               → maps test object → {roll, sl, outcome}

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

import { dispatchModuleRobak } from '../handlers/modules/robak/robak.js';

const MODULE_ID = 'wfrp4e-macros-and-more';

function setGame(opts: { active: boolean; isGM: boolean }) {
  (globalThis as any).game = {
    modules: { get: (id: string) => (id === MODULE_ID ? { active: opts.active } : undefined) },
    user: { isGM: opts.isGM },
    actors: { get: () => ({ name: 'Test Actor' }) },
  };
}

describe('dispatchModuleRobak', () => {
  beforeEach(() => {
    (globalThis as any).game = undefined;
    (globalThis as any).SocketHandlers = undefined;
    (globalThis as any).fromUuidSync = undefined;
  });

  it('returns MODULE_NOT_ACTIVE when wfrp4e-macros-and-more is inactive', async () => {
    setGame({ active: false, isGM: true });
    const r = await dispatchModuleRobak({ action: 'roll-skill-silent', actorId: 'Actor.x', skill: 'Perception' });
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/^MODULE_NOT_ACTIVE:/);
  });

  it('returns GM_REQUIRED for a non-GM caller', async () => {
    setGame({ active: true, isGM: false });
    const r = await dispatchModuleRobak({ action: 'roll-skill-silent', actorId: 'Actor.x', skill: 'Perception' });
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/^GM_REQUIRED:/);
  });

  it('throws on bad input (missing skill)', async () => {
    setGame({ active: true, isGM: true });
    await expect(
      dispatchModuleRobak({ action: 'roll-skill-silent', actorId: 'Actor.x' } as any),
    ).rejects.toThrow();
  });

  it('returns ACTOR_NOT_FOUND when the actorId resolves to no actor', async () => {
    setGame({ active: true, isGM: true });
    (globalThis as any).game.actors.get = () => undefined; // no such actor
    const r = await dispatchModuleRobak({ action: 'roll-skill-silent', actorId: 'nope', skill: 'Perception' });
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/^ACTOR_NOT_FOUND:/);
  });

  it('returns ROBAK_ROLL_SKILL_UNAVAILABLE when SocketHandlers.rollSkill is unbound', async () => {
    setGame({ active: true, isGM: true });
    (globalThis as any).SocketHandlers = {}; // no rollSkill
    const r = await dispatchModuleRobak({ action: 'roll-skill-silent', actorId: 'Actor.x', skill: 'Perception' });
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/ROBAK_ROLL_SKILL_UNAVAILABLE/);
  });

  it('maps the wfrp4e test object to {roll, sl, outcome} on the happy path', async () => {
    setGame({ active: true, isGM: true });
    const rollSkill = vi.fn().mockResolvedValue({ result: { roll: 42, SL: 3, outcome: 'success', target: 55 } });
    (globalThis as any).SocketHandlers = { rollSkill };
    const r: any = await dispatchModuleRobak({
      action: 'roll-skill-silent',
      actorId: 'abc',
      skill: 'Perception',
      options: { difficulty: 'average' },
    });
    expect(r.success).toBe(true);
    expect(r.data.roll).toBe(42);
    expect(r.data.sl).toBe(3);
    expect(r.data.outcome).toBe('success');
    expect(rollSkill).toHaveBeenCalledWith({ actorId: 'abc', skill: 'Perception', options: { difficulty: 'average' } });
  });
});
