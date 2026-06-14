// Characterization snapshot tests — FoundryDataAccess.listConditions
// Phase 0 sub-phase 0.7.3: lock the return-shape so refactors have a regression net.

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

describe('FoundryDataAccess.listConditions — characterization', () => {
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

    const da = makeDA();
    const result = await da.listConditions({ actorId: 'actor-001' });
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

    const da = makeDA();
    const result = await da.listConditions({ actorId: 'actor-002' });
    expect(result).toMatchSnapshot();
  });
});
