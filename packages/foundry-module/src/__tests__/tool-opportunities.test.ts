// TOOL-IDEA-001/002/003/007 regression coverage (2026-05-14).
// Covers data-access changes for list-scenes pagination/countOnly, listActiveEffects
// includeItemAEs, getActiveEffectByName, and getActiveScene sceneId.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FoundryDataAccess } from '../data-access.js';

function makeScene(id: string, name: string, active = false) {
  return {
    id,
    name,
    active,
    dimensions: { width: 4000, height: 3000 },
    grid: { size: 100 },
    background: { src: '' },
    img: '',
    walls: { size: 0, map: (fn: any) => [] },
    tokens: { size: 0, map: (fn: any) => [] },
    lights: { size: 0 },
    sounds: { size: 0 },
    notes: { map: (fn: any) => [] },
    navigation: false,
    width: 4000,
    height: 3000,
    padding: 0,
  };
}

function makeActor(id: string, name: string, opts: { items?: any[]; effects?: any[] } = {}) {
  const effectList = opts.effects ?? [];
  const itemList = opts.items ?? [];
  return {
    id,
    name,
    appliedEffects: effectList.filter((e: any) => !e.disabled),
    temporaryEffects: effectList.filter((e: any) => e.duration?.rounds || e.duration?.turns || e.duration?.seconds),
    effects: {
      [Symbol.iterator]: function* () { yield* effectList; },
    },
    items: {
      [Symbol.iterator]: function* () { yield* itemList; },
      get: (id: string) => itemList.find((i: any) => i.id === id) ?? null,
      find: (pred: any) => itemList.find(pred) ?? null,
    },
  };
}

function makeItem(id: string, name: string, effects: any[] = []) {
  return {
    id,
    name,
    type: 'weapon',
    effects: {
      contents: effects,
      [Symbol.iterator]: function* () { yield* effects; },
    },
  };
}

function makeEffect(id: string, name: string, extra: any = {}) {
  return {
    id,
    name,
    img: 'icons/blank.png',
    statuses: new Set<string>(),
    disabled: false,
    duration: { rounds: null, turns: null, seconds: null },
    origin: null,
    changes: [],
    ...extra,
  };
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('FoundryDataAccess.listScenes — TOOL-IDEA-001 pagination + countOnly', () => {
  it('returns a bare array (back-compat) when no pagination params are set', async () => {
    const scenes = [makeScene('s1', 'A'), makeScene('s2', 'B')];
    (globalThis as any).game = { scenes: { contents: scenes } };
    const da: any = new FoundryDataAccess();
    da.validateFoundryState = () => {};

    const result = await da.listScenes({});

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('s1');
  });

  it('returns {total, filterApplied} when countOnly=true', async () => {
    const scenes = Array.from({ length: 215 }, (_, i) => makeScene(`s${i}`, `Scene ${i}`));
    (globalThis as any).game = { scenes: { contents: scenes } };
    const da: any = new FoundryDataAccess();
    da.validateFoundryState = () => {};

    const result = await da.listScenes({ countOnly: true });

    expect(result).toEqual({ total: 215, filterApplied: false });
  });

  it('reports filterApplied=true in countOnly when a filter is set', async () => {
    const scenes = [makeScene('s1', 'Town'), makeScene('s2', 'Forest'), makeScene('s3', 'Tower')];
    (globalThis as any).game = { scenes: { contents: scenes } };
    const da: any = new FoundryDataAccess();
    da.validateFoundryState = () => {};

    const result = await da.listScenes({ countOnly: true, filter: 'to' });

    expect(result.total).toBe(2); // Town + Tower
    expect(result.filterApplied).toBe(true);
  });

  it('returns paginated envelope when pageSize is set', async () => {
    const scenes = Array.from({ length: 125 }, (_, i) => makeScene(`s${i}`, `Scene ${i}`));
    (globalThis as any).game = { scenes: { contents: scenes } };
    const da: any = new FoundryDataAccess();
    da.validateFoundryState = () => {};

    const result = await da.listScenes({ page: 2, pageSize: 50 });

    expect(result).toMatchObject({
      total: 125,
      page: 2,
      pageSize: 50,
      pageCount: 3,
    });
    expect(result.scenes).toHaveLength(50);
    expect(result.scenes[0].id).toBe('s50');
    expect(result.scenes[49].id).toBe('s99');
  });

  it('returns short final page', async () => {
    const scenes = Array.from({ length: 125 }, (_, i) => makeScene(`s${i}`, `Scene ${i}`));
    (globalThis as any).game = { scenes: { contents: scenes } };
    const da: any = new FoundryDataAccess();
    da.validateFoundryState = () => {};

    const result = await da.listScenes({ page: 3, pageSize: 50 });

    expect(result.scenes).toHaveLength(25); // 125 - 50 - 50
    expect(result.pageCount).toBe(3);
  });
});

describe('FoundryDataAccess.getActiveScene — TOOL-IDEA-007 sceneId param', () => {
  it('returns active scene when sceneId is omitted (back-compat)', async () => {
    const active = makeScene('active', 'Active Scene', true);
    (globalThis as any).game = {
      scenes: { current: active, get: () => null },
    };
    const da: any = new FoundryDataAccess();
    da.validateFoundryState = () => {};
    da.getTokenDisposition = () => 'neutral';

    const result = await da.getActiveScene({});

    expect(result.id).toBe('active');
    expect(result.active).toBe(true);
  });

  it('returns target scene when sceneId is provided', async () => {
    const active = makeScene('active', 'Active', true);
    const other = makeScene('other', 'Other', false);
    (globalThis as any).game = {
      scenes: {
        current: active,
        get: (id: string) => (id === 'other' ? other : null),
      },
    };
    const da: any = new FoundryDataAccess();
    da.validateFoundryState = () => {};
    da.getTokenDisposition = () => 'neutral';

    const result = await da.getActiveScene({ sceneId: 'other' });

    expect(result.id).toBe('other');
    expect(result.active).toBe(false);
  });

  it('throws SceneNotFound when sceneId misses', async () => {
    (globalThis as any).game = {
      scenes: { current: makeScene('a', 'A', true), get: () => null },
    };
    const da: any = new FoundryDataAccess();
    da.validateFoundryState = () => {};

    await expect(da.getActiveScene({ sceneId: 'ghost' })).rejects.toThrow(/Scene not found.*ghost/);
  });
});

describe('FoundryDataAccess.listActiveEffects — TOOL-IDEA-002 includeItemAEs', () => {
  it('includeItemAEs=false: surfaces only actor-level AEs (back-compat)', async () => {
    const actorAE = makeEffect('ae1', 'Bless');
    const itemAE = makeEffect('ae2', 'Sharpness');
    const sword = makeItem('i1', 'Sword', [itemAE]);
    const actor = makeActor('a1', 'Hans', { items: [sword], effects: [actorAE] });
    (globalThis as any).game = { actors: { get: (id: string) => (id === 'a1' ? actor : null) } };
    const da: any = new FoundryDataAccess();
    da.validateFoundryState = () => {};

    const result = await da.listActiveEffects({ actorId: 'a1', filter: 'all' });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bless');
    expect(result[0].parentType).toBe('Actor');
    expect(result[0].parentName).toBe('Hans');
  });

  it('includeItemAEs=true: surfaces item AEs with parent provenance', async () => {
    const actorAE = makeEffect('ae1', 'Bless');
    const itemAE = makeEffect('ae2', 'Sharpness');
    const sword = makeItem('i1', 'Sword', [itemAE]);
    const actor = makeActor('a1', 'Hans', { items: [sword], effects: [actorAE] });
    (globalThis as any).game = { actors: { get: (id: string) => (id === 'a1' ? actor : null) } };
    const da: any = new FoundryDataAccess();
    da.validateFoundryState = () => {};

    const result = await da.listActiveEffects({ actorId: 'a1', filter: 'all', includeItemAEs: true });

    expect(result).toHaveLength(2);
    const actorEntry = result.find((e: any) => e.parentType === 'Actor');
    const itemEntry = result.find((e: any) => e.parentType === 'Item');
    expect(actorEntry?.name).toBe('Bless');
    expect(itemEntry?.name).toBe('Sharpness');
    expect(itemEntry?.parentId).toBe('i1');
    expect(itemEntry?.parentName).toBe('Sword');
  });

  it('actor-level AEs always carry parentType="Actor" + parentId/parentName', async () => {
    const ae = makeEffect('ae1', 'Bless');
    const actor = makeActor('a1', 'Hans', { effects: [ae] });
    (globalThis as any).game = { actors: { get: () => actor } };
    const da: any = new FoundryDataAccess();
    da.validateFoundryState = () => {};

    const result = await da.listActiveEffects({ actorId: 'a1', filter: 'all' });

    expect(result[0]).toMatchObject({
      parentType: 'Actor',
      parentId: 'a1',
      parentName: 'Hans',
    });
  });
});

describe('FoundryDataAccess.getActiveEffectByName — TOOL-IDEA-003', () => {
  it('resolves an AE by name on an actor-embedded item', async () => {
    const ae = makeEffect('ae1', 'Sharpness');
    const sword = makeItem('i1', 'Sword', [ae]);
    const actor = makeActor('a1', 'Hans', { items: [sword] });
    (globalThis as any).game = {
      actors: {
        get: (id: string) => (id === 'a1' ? actor : null),
        find: (pred: any) => [actor].find(pred) ?? null,
      },
      items: { get: () => null, find: () => null },
    };
    (globalThis as any).ui = { notifications: { info: vi.fn(), warn: vi.fn() } };
    const da: any = new FoundryDataAccess();
    da.validateFoundryState = () => {};

    const result = await da.getActiveEffectByName({
      target: { scope: 'actor', actorId: 'a1', itemName: 'Sword' },
      effectName: 'Sharpness',
    });

    expect(result.success).toBe(true);
    expect(result.scope).toBe('actor');
    expect(result.effectId).toBe('ae1');
    expect(result.effectName).toBe('Sharpness');
    expect(result.parentType).toBe('Item');
    expect(result.parentId).toBe('i1');
    expect(result.parentName).toBe('Sword');
    expect(result.effect.id).toBe('ae1');
  });

  it('resolves by effectId when supplied', async () => {
    const ae = makeEffect('ae1', 'Sharpness');
    const sword = makeItem('i1', 'Sword', [ae]);
    const actor = makeActor('a1', 'Hans', { items: [sword] });
    (globalThis as any).game = {
      actors: { get: (id: string) => (id === 'a1' ? actor : null) },
      items: { get: () => null, find: () => null },
    };
    (globalThis as any).ui = { notifications: { info: vi.fn() } };
    const da: any = new FoundryDataAccess();
    da.validateFoundryState = () => {};

    const result = await da.getActiveEffectByName({
      target: { scope: 'actor', actorId: 'a1', itemId: 'i1' },
      effectId: 'ae1',
    });

    expect(result.effectId).toBe('ae1');
    expect(result.parentType).toBe('Item');
  });

  it('throws when neither effectId nor effectName is provided', async () => {
    const sword = makeItem('i1', 'Sword');
    const actor = makeActor('a1', 'Hans', { items: [sword] });
    (globalThis as any).game = {
      actors: { get: (id: string) => (id === 'a1' ? actor : null) },
      items: { get: () => null, find: () => null },
    };
    const da: any = new FoundryDataAccess();
    da.validateFoundryState = () => {};

    await expect(
      da.getActiveEffectByName({
        target: { scope: 'actor', actorId: 'a1', itemId: 'i1' },
      }),
    ).rejects.toThrow(/requires one of effectId or effectName/);
  });

  it('throws when effect name does not match', async () => {
    const ae = makeEffect('ae1', 'Sharpness');
    const sword = makeItem('i1', 'Sword', [ae]);
    const actor = makeActor('a1', 'Hans', { items: [sword] });
    (globalThis as any).game = {
      actors: { get: (id: string) => (id === 'a1' ? actor : null) },
      items: { get: () => null, find: () => null },
    };
    (globalThis as any).ui = { notifications: { info: vi.fn() } };
    const da: any = new FoundryDataAccess();
    da.validateFoundryState = () => {};

    await expect(
      da.getActiveEffectByName({
        target: { scope: 'actor', actorId: 'a1', itemId: 'i1' },
        effectName: 'Nonexistent',
      }),
    ).rejects.toThrow(/not found on "/);
  });
});
