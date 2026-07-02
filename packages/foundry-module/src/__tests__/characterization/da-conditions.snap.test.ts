// Characterization snapshot tests — ConditionsService.listConditions
// Phase 0 sub-phase 0.7.3: lock the return-shape so refactors have a regression net.
// Phase 6 (R5.2): Contract — the conditions cluster was promoted off FoundryDataAccess to
// QueryHandlers; these tests now pierce ConditionsService directly (values unchanged).

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConditionsService } from '../../services/index.js';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn(), warn: vi.fn() },
}));

function makeService() {
  return new ConditionsService(() => {});
}

function makeConditionEffect(id: string, conditionKey: string, value: number) {
  return {
    id,
    isCondition: true,
    conditionKey,
    conditionValue: value,
    statuses: { first: () => conditionKey },
    name: conditionKey,
    flags: { wfrp4e: { value } },
  };
}

describe('ConditionsService.listConditions — characterization', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('snapshot: actor with two conditions', async () => {
    const actor = {
      id: 'actor-001',
      name: 'Test Rat',
      effects: [
        makeConditionEffect('eff-001', 'stunned', 1),
        makeConditionEffect('eff-002', 'bleeding', 2),
        // non-condition effect should be excluded
        { id: 'eff-003', isCondition: false, name: 'Blessing' },
      ],
    };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: (id: string) => (id === actor.id ? actor : null) },
    };

    const svc = makeService();
    const result = await svc.listConditions({ actorId: 'actor-001' });
    expect(result).toMatchSnapshot();
  });

  it('snapshot: actor with no conditions returns empty array', async () => {
    const actor = {
      id: 'actor-002',
      name: 'Healthy Fighter',
      effects: [],
    };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: (id: string) => (id === actor.id ? actor : null) },
    };

    const svc = makeService();
    const result = await svc.listConditions({ actorId: 'actor-002' });
    expect(result).toMatchSnapshot();
  });

  // P-09 (wfrp_layer_expansion Phase 5) — combatId batch branch.
  it('combatId batch: returns a per-actor roster map keyed by actorId', async () => {
    const rat = {
      id: 'actor-101',
      name: 'Giant Rat',
      effects: [makeConditionEffect('eff-101', 'bleeding', 1)],
    };
    const skel = {
      id: 'actor-102',
      name: 'Skeleton',
      effects: [
        makeConditionEffect('eff-102', 'prone', 1),
        makeConditionEffect('eff-103', 'stunned', 2),
      ],
    };
    const combat = {
      id: 'combat-001',
      combatants: [
        { actor: rat, actorId: rat.id },
        { actor: skel, actorId: skel.id },
        // dangling/tokenless combatant — no resolvable actor → must be skipped
        { actor: null, actorId: undefined },
      ],
    };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      combats: { get: (id: string) => (id === combat.id ? combat : null) },
    };

    const svc = makeService();
    const result = await svc.listConditions({ combatId: 'combat-001' });
    // roster shape: { [actorId]: { actorName, conditions[] } }, dangling combatant skipped
    expect(Object.keys(result).sort()).toEqual(['actor-101', 'actor-102']);
    expect(result['actor-101'].actorName).toBe('Giant Rat');
    expect(result['actor-102'].conditions).toHaveLength(2);
    expect(result).toMatchSnapshot();
  });

  // P-09 regression — single-actor path is byte-for-byte unchanged (returns an ARRAY,
  // not the roster object). Guards against the batch refactor leaking into the legacy shape.
  it('single-actor regression: actorId still returns a flat conditions array', async () => {
    const actor = {
      id: 'actor-201',
      name: 'Regression Rat',
      effects: [makeConditionEffect('eff-201', 'poisoned', 1)],
    };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: (id: string) => (id === actor.id ? actor : null) },
    };

    const svc = makeService();
    const result = await svc.listConditions({ actorId: 'actor-201' });
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].conditionKey).toBe('poisoned');
  });

  it('combatId batch: throws COMBAT_NOT_FOUND for an unknown combat id', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      combats: { get: () => null },
    };
    const svc = makeService();
    await expect(svc.listConditions({ combatId: 'nope' })).rejects.toThrow('COMBAT_NOT_FOUND');
  });
});
