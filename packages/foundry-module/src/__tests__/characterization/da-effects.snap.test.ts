// Characterization snapshot tests — FoundryDataAccess.listActiveEffects / getActiveEffectByName
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

function makeEffect(id: string, name: string, extra: Partial<{
  disabled: boolean;
  isCondition: boolean;
  origin: string;
  statuses: string[];
  duration: { rounds: number | null; turns: number | null; seconds: number | null };
  changes: Array<{ key: string; mode: number; value: string; priority: number | null }>;
  img: string;
}> = {}) {
  return {
    id,
    name,
    img: extra.img ?? 'icons/svg/aura.svg',
    statuses: new Set(extra.statuses ?? []),
    disabled: extra.disabled ?? false,
    isCondition: extra.isCondition ?? false,
    origin: extra.origin ?? null,
    duration: extra.duration ?? { rounds: null, turns: null, seconds: null },
    changes: extra.changes ?? [],
  };
}

function makeActor(id: string, name: string, effects: any[] = [], items: any[] = []) {
  return {
    id,
    name,
    effects: effects as any,
    appliedEffects: effects.filter((e: any) => !e.disabled),
    items: items as any,
  };
}

function makeItem(id: string, name: string, effects: any[] = []) {
  return {
    id,
    name,
    type: 'skill',
    effects: { contents: effects },
  };
}

describe('FoundryDataAccess.listActiveEffects — characterization', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('snapshot: filter=all with two actor AEs', async () => {
    const eff1 = makeEffect('eff-001', 'Blessed', {
      origin: 'Actor.actor-001',
      changes: [{ key: 'system.status.fate.value', mode: 2, value: '1', priority: null }],
    });
    const eff2 = makeEffect('eff-002', 'Stunned', {
      isCondition: true,
      statuses: ['stunned'],
      disabled: false,
    });
    const actor = makeActor('actor-001', 'Wilhelm', [eff1, eff2]);
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: (id: string) => (id === actor.id ? actor : null) },
    };

    const da = makeDA();
    const result = await da.listActiveEffects({ actorId: 'actor-001', filter: 'all' });
    expect(result).toMatchSnapshot();
  });

  it('snapshot: filter=applied excludes disabled AEs', async () => {
    const active = makeEffect('eff-001', 'Active Buff', { disabled: false });
    const inactive = makeEffect('eff-002', 'Inactive Debuff', { disabled: true });
    const actor = makeActor('actor-001', 'Wilhelm', [active, inactive]);
    // appliedEffects simulates Foundry's actor.appliedEffects getter (active only)
    actor.appliedEffects = [active];
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: (id: string) => (id === actor.id ? actor : null) },
    };

    const da = makeDA();
    const result = await da.listActiveEffects({ actorId: 'actor-001', filter: 'applied' });
    expect(result).toMatchSnapshot();
  });

  it('snapshot: filter=temporary — only AEs with duration.rounds set', async () => {
    const timed = makeEffect('eff-001', 'Timed Boost', {
      duration: { rounds: 3, turns: null, seconds: null },
    });
    const permanent = makeEffect('eff-002', 'Permanent Curse', {
      duration: { rounds: null, turns: null, seconds: null },
    });
    const actor = makeActor('actor-001', 'Greta', [timed, permanent]);
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: (id: string) => (id === actor.id ? actor : null) },
    };

    const da = makeDA();
    const result = await da.listActiveEffects({ actorId: 'actor-001', filter: 'temporary' });
    expect(result).toMatchSnapshot();
  });

  it('snapshot: includeItemAEs=true adds item-level effects', async () => {
    const actorEff = makeEffect('eff-actor-001', 'Actor Buff');
    const itemEff = makeEffect('eff-item-001', 'Sword Enchant', {
      changes: [{ key: 'system.characteristics.ws.value', mode: 2, value: '5', priority: null }],
    });
    const sword = makeItem('item-001', 'Runefang', [itemEff]);
    const actor = makeActor('actor-001', 'Kurt', [actorEff], [sword]);
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: (id: string) => (id === actor.id ? actor : null) },
    };

    const da = makeDA();
    const result = await da.listActiveEffects({
      actorId: 'actor-001',
      filter: 'all',
      includeItemAEs: true,
    });
    expect(result).toMatchSnapshot();
  });
});

describe('FoundryDataAccess.getActiveEffectByName — characterization', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('snapshot: actor-direct scope, found by effectId', async () => {
    const eff = makeEffect('eff-direct-001', 'Warpstone Corruption', {
      origin: 'Actor.actor-003',
      changes: [{ key: 'system.status.corruption.value', mode: 2, value: '1', priority: null }],
    });
    const actor = {
      id: 'actor-003',
      name: 'Tainted One',
      effects: { contents: [eff] },
    };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: {
        get: (id: string) => (id === actor.id ? actor : null),
        find: (fn: (a: any) => boolean) => fn(actor) ? actor : null,
      },
    };

    const da = makeDA();
    const result = await da.getActiveEffectByName({
      target: { scope: 'actor-direct', actorId: 'actor-003' },
      effectId: 'eff-direct-001',
    });
    expect(result).toMatchSnapshot();
  });

  it('snapshot: actor scope (item-parented), found by effectName', async () => {
    const eff = makeEffect('eff-item-007', 'Burning', {
      statuses: ['burning'],
      changes: [{ key: 'system.status.wounds.value', mode: 2, value: '-1', priority: null }],
    });
    const item = makeItem('item-007', 'Torch', [eff]);
    const actor = {
      id: 'actor-004',
      name: 'Torchbearer',
      items: {
        find: (fn: (i: any) => boolean) => fn(item) ? item : null,
        get: (id: string) => (id === item.id ? item : null),
        contents: [item],
      },
    };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: {
        get: (id: string) => (id === actor.id ? actor : null),
        find: (fn: (a: any) => boolean) => fn(actor) ? actor : null,
      },
      items: {
        get: () => null,
        find: () => null,
      },
    };

    const da = makeDA();
    const result = await da.getActiveEffectByName({
      target: { scope: 'actor', actorId: 'actor-004', itemId: 'item-007' },
      effectName: 'Burning',
    });
    expect(result).toMatchSnapshot();
  });
});
