// Characterization snapshot tests — FoundryDataAccess.getCombat / listCombatants
// Phase 0 sub-phase 0.7.3: lock the return-shape so refactors have a regression net.
// These tests NEVER test behaviour; they only freeze the current output shape.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FoundryDataAccess } from '../../data-access.js';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn(), warn: vi.fn() },
}));

function makeDA() {
  const da = new FoundryDataAccess();
  (da as any).validateFoundryState = () => {};
  return da;
}

function makeCombat(overrides: Record<string, any> = {}) {
  return {
    id: 'combat-001',
    round: 1,
    turn: 0,
    active: true,
    started: true,
    scene: { id: 'scene-001' },
    combatant: { id: 'combatant-001' },
    turns: [
      {
        id: 'combatant-001',
        actorId: 'actor-001',
        tokenId: 'token-001',
        name: 'Guard',
        initiative: 52,
        defeated: false,
        hidden: false,
      },
      {
        id: 'combatant-002',
        actorId: 'actor-002',
        tokenId: 'token-002',
        name: 'Villain',
        initiative: 35,
        defeated: false,
        hidden: true,
      },
    ],
    ...overrides,
  };
}

describe('FoundryDataAccess.getCombat — characterization', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('snapshot: active combat with scene and combatant', async () => {
    const combat = makeCombat();
    (globalThis as any).game = {
      ...(globalThis as any).game,
      combats: {
        active: combat,
        get: (id: string) => (id === combat.id ? combat : null),
        values: function* () { yield combat; },
      },
      scenes: { active: { id: 'scene-001' } },
    };

    const da = makeDA();
    const result = await da.getCombat({ combatId: 'combat-001' });
    expect(result).toMatchSnapshot();
  });

  it('snapshot: combat with no scene or combatant', async () => {
    const combat = makeCombat({ scene: undefined, combatant: undefined, turns: [] });
    (globalThis as any).game = {
      ...(globalThis as any).game,
      combats: {
        active: combat,
        get: (id: string) => (id === combat.id ? combat : null),
        values: function* () { yield combat; },
      },
      scenes: { active: { id: 'scene-001' } },
    };

    const da = makeDA();
    const result = await da.getCombat({ combatId: 'combat-001' });
    expect(result).toMatchSnapshot();
  });

  it('snapshot: no combat returns null', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      combats: {
        active: null,
        get: () => null,
        values: function* () {},
      },
      scenes: { active: null },
    };

    const da = makeDA();
    const result = await da.getCombat({});
    expect(result).toMatchSnapshot();
  });
});

describe('FoundryDataAccess.listCombatants — characterization', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('snapshot: two combatants with full fields', async () => {
    const combat = makeCombat();
    (globalThis as any).game = {
      ...(globalThis as any).game,
      combats: {
        active: combat,
        get: (id: string) => (id === combat.id ? combat : null),
        values: function* () { yield combat; },
      },
      scenes: { active: { id: 'scene-001' } },
    };

    const da = makeDA();
    const result = await da.listCombatants({ combatId: 'combat-001' });
    expect(result).toMatchSnapshot();
  });

  it('snapshot: no combat returns empty array', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      combats: {
        active: null,
        get: () => null,
        values: function* () {},
      },
      scenes: { active: null },
    };

    const da = makeDA();
    const result = await da.listCombatants({});
    expect(result).toMatchSnapshot();
  });
});
