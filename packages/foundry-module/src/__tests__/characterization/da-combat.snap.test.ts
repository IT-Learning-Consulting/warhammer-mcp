// Characterization snapshot tests — CombatService.getCombat / listCombatants
// Phase 0 sub-phase 0.7.3: lock the return-shape so refactors have a regression net.
// Phase 6 (R5.2): Contract — the combat cluster was promoted off FoundryDataAccess to
// QueryHandlers; these tests now pierce CombatService directly (values unchanged).
// These tests NEVER test behaviour; they only freeze the current output shape.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CombatService } from '../../services/index.js';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn(), warn: vi.fn() },
}));

function makeService() {
  return new CombatService(() => {});
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

describe('CombatService.getCombat — characterization', () => {
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

    const svc = makeService();
    const result = await svc.getCombat({ combatId: 'combat-001' });
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

    const svc = makeService();
    const result = await svc.getCombat({ combatId: 'combat-001' });
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

    const svc = makeService();
    const result = await svc.getCombat({});
    expect(result).toMatchSnapshot();
  });
});

describe('CombatService.listCombatants — characterization', () => {
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

    const svc = makeService();
    const result = await svc.listCombatants({ combatId: 'combat-001' });
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

    const svc = makeService();
    const result = await svc.listCombatants({});
    expect(result).toMatchSnapshot();
  });
});
