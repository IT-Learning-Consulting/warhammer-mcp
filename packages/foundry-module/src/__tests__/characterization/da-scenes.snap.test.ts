import { beforeEach, describe, expect, it } from 'vitest';
import { FoundryDataAccess } from '../../data-access.js';

function makeDA() {
  const da = new FoundryDataAccess();
  (da as any).validateFoundryState = () => {};
  return da;
}

function makeToken(overrides: Record<string, any> = {}) {
  return {
    id: 'tok-1',
    name: 'Goblin',
    x: 100,
    y: 200,
    width: 1,
    height: 1,
    actorId: 'actor-1',
    texture: { src: 'systems/wfrp4e/icons/blank.png' },
    hidden: false,
    disposition: -1,
    ...overrides,
  };
}

function makeSceneObj(overrides: Record<string, any> = {}) {
  return {
    id: 'scene-1',
    name: 'Market Square',
    img: 'scenes/market.webp',
    background: { src: 'scenes/market.webp' },
    width: 4000,
    height: 3000,
    padding: 0.25,
    active: true,
    navigation: true,
    tokens: [makeToken()],
    walls: { size: 12 },
    lights: { size: 3 },
    sounds: { size: 1 },
    notes: [{ id: 'note-1', text: 'Fountain', x: 200, y: 300 }],
    ...overrides,
  };
}

describe('FoundryDataAccess.getActiveScene — characterization', () => {
  beforeEach(() => {
    (globalThis as any).foundry.utils.randomID = () => 'fixed-id';
  });

  it('returns current scene data with tokens and notes', async () => {
    const scene = makeSceneObj();
    (globalThis as any).game = {
      ...(globalThis as any).game,
      scenes: {
        current: scene,
        get: (_id: string) => null,
      },
    };

    const da = makeDA();
    const result = await da.getActiveScene();
    expect(result).toMatchSnapshot();
  });

  it('returns a non-active scene when sceneId is provided', async () => {
    const activeScene = makeSceneObj({ id: 'scene-active', name: 'Active' });
    const namedScene = makeSceneObj({
      id: 'scene-2',
      name: 'Dungeon',
      active: false,
      tokens: [],
      notes: [],
      walls: { size: 0 },
      lights: { size: 0 },
      sounds: { size: 0 },
    });
    (globalThis as any).game = {
      ...(globalThis as any).game,
      scenes: {
        current: activeScene,
        get: (id: string) => (id === 'scene-2' ? namedScene : null),
      },
    };

    const da = makeDA();
    const result = await da.getActiveScene({ sceneId: 'scene-2' });
    expect(result).toMatchSnapshot();
  });

  it('throws when sceneId is not found', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      scenes: {
        current: makeSceneObj(),
        get: () => null,
      },
    };

    const da = makeDA();
    await expect(da.getActiveScene({ sceneId: 'no-such-scene' })).rejects.toThrow(
      /Scene not found/,
    );
  });
});

describe('FoundryDataAccess.listScenes — characterization', () => {
  beforeEach(() => {
    (globalThis as any).foundry.utils.randomID = () => 'fixed-id';
  });

  function wireScenes(scenes: any[]) {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      scenes: {
        contents: scenes,
        find: (fn: (s: any) => boolean) => scenes.find(fn),
      },
    };
  }

  const sceneA = {
    id: 'scene-a',
    name: 'Market Square',
    active: true,
    dimensions: { width: 4000, height: 3000 },
    grid: { size: 100 },
    background: { src: 'scenes/market.webp' },
    walls: { size: 8 },
    tokens: { size: 3 },
    lights: { size: 2 },
    sounds: { size: 1 },
    navigation: true,
  };

  const sceneB = {
    id: 'scene-b',
    name: 'Dungeon Level 1',
    active: false,
    dimensions: { width: 2000, height: 2000 },
    grid: { size: 100 },
    background: { src: 'scenes/dungeon.webp' },
    walls: { size: 30 },
    tokens: { size: 0 },
    lights: { size: 5 },
    sounds: { size: 0 },
    navigation: false,
  };

  it('returns bare array of scenes with no options (back-compat)', async () => {
    wireScenes([sceneA, sceneB]);
    const da = makeDA();
    const result = await da.listScenes();
    expect(result).toMatchSnapshot();
  });

  it('returns empty array when no scenes exist', async () => {
    wireScenes([]);
    const da = makeDA();
    const result = await da.listScenes();
    expect(result).toMatchSnapshot();
  });

  it('returns paginated envelope when page is specified', async () => {
    wireScenes([sceneA, sceneB]);
    const da = makeDA();
    const result = await da.listScenes({ page: 1, pageSize: 1 });
    expect(result).toMatchSnapshot();
  });

  it('returns countOnly envelope', async () => {
    wireScenes([sceneA, sceneB]);
    const da = makeDA();
    const result = await da.listScenes({ countOnly: true });
    expect(result).toMatchSnapshot();
  });

  it('filters by name substring', async () => {
    wireScenes([sceneA, sceneB]);
    const da = makeDA();
    const result = await da.listScenes({ filter: 'dungeon' });
    expect(result).toMatchSnapshot();
  });
});
