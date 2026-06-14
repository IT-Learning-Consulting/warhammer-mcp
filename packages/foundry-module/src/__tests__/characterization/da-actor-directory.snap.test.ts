import { beforeEach, describe, expect, it } from 'vitest';
import { FoundryDataAccess } from '../../data-access.js';

function makeDA() {
  const da = new FoundryDataAccess();
  (da as any).validateFoundryState = () => {};
  return da;
}

function makeActorObj(overrides: Record<string, any> = {}) {
  return {
    id: 'actor-1',
    name: 'Heinrich Kemmler',
    type: 'character',
    img: 'systems/wfrp4e/icons/actors/human.png',
    ...overrides,
  };
}

describe('FoundryDataAccess.listActors — characterization', () => {
  beforeEach(() => {
    (globalThis as any).foundry.utils.randomID = () => 'fixed-id';
  });

  it('returns all actors when no type filter is provided', async () => {
    const actors = [
      makeActorObj({ id: 'a1', name: 'Brunhilde', type: 'character' }),
      makeActorObj({ id: 'a2', name: 'Goblin Boss', type: 'creature', img: undefined }),
      makeActorObj({ id: 'a3', name: 'Hans the Merchant', type: 'npc' }),
    ];
    // listActors uses game.actors directly if no type filter, or .filter() if one is given.
    // setup.ts stubs game.actors as a Map; we need an iterable with .map() and .filter().
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: {
        map: (fn: (a: any) => any) => actors.map(fn),
        filter: (fn: (a: any) => boolean) => actors.filter(fn),
      },
    };

    const da = makeDA();
    const result = await da.listActors();
    expect(result).toMatchSnapshot();
  });

  it('returns only actors matching the given type', async () => {
    const actors = [
      makeActorObj({ id: 'a1', name: 'Brunhilde', type: 'character' }),
      makeActorObj({ id: 'a2', name: 'Goblin Boss', type: 'creature' }),
    ];
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: {
        map: (fn: (a: any) => any) => actors.map(fn),
        filter: (fn: (a: any) => boolean) => actors.filter(fn),
      },
    };

    const da = makeDA();
    const result = await da.listActors('character');
    expect(result).toMatchSnapshot();
  });

  it('returns empty array when no actors match type filter', async () => {
    const actors = [makeActorObj({ id: 'a1', name: 'Brunhilde', type: 'character' })];
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: {
        map: (fn: (a: any) => any) => actors.map(fn),
        filter: (fn: (a: any) => boolean) => actors.filter(fn),
      },
    };

    const da = makeDA();
    const result = await da.listActors('creature');
    expect(result).toMatchSnapshot();
  });
});

describe('FoundryDataAccess.listActorItems — characterization', () => {
  beforeEach(() => {
    (globalThis as any).foundry.utils.randomID = () => 'fixed-id';
  });

  function makeItem(overrides: Record<string, any> = {}) {
    return {
      id: 'item-1',
      name: 'Sword',
      type: 'weapon',
      system: {
        advances: { value: 0 },
        specification: { value: '' },
      },
      ...overrides,
    };
  }

  it('returns all items on actor with no type filter', async () => {
    const items = [
      makeItem({ id: 'i1', name: 'Sword', type: 'weapon' }),
      makeItem({ id: 'i2', name: 'Athletics', type: 'skill', system: { advances: { value: 3 }, specification: { value: null } } }),
      makeItem({ id: 'i3', name: 'Frenzy', type: 'talent', system: { advances: { value: 1 }, specification: { value: '' } } }),
    ];
    const actor = {
      id: 'actor-1',
      name: 'Test Fighter',
      items: items,
    };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: (id: string) => (id === 'actor-1' ? actor : null) },
    };

    const da = makeDA();
    const result = await da.listActorItems({ actorId: 'actor-1' });
    expect(result).toMatchSnapshot();
  });

  it('returns filtered items when typeFilter is given', async () => {
    const items = [
      makeItem({ id: 'i1', name: 'Sword', type: 'weapon' }),
      makeItem({ id: 'i2', name: 'Athletics', type: 'skill' }),
    ];
    const actor = {
      id: 'actor-1',
      name: 'Test Fighter',
      items: items,
    };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: (id: string) => (id === 'actor-1' ? actor : null) },
    };

    const da = makeDA();
    const result = await da.listActorItems({ actorId: 'actor-1', typeFilter: 'skill' });
    expect(result).toMatchSnapshot();
  });

  it('throws when actor is not found', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: () => null },
    };

    const da = makeDA();
    await expect(da.listActorItems({ actorId: 'no-such-actor' })).rejects.toThrow(
      /Actor not found/,
    );
  });
});
