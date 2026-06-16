// BUG-051 hotfix (prototype-token pattern) — addActorsToScene honors per-actor `quantities`
// so one world actor with `prototypeToken.actorLink=false` can spawn N unlinked tokens.

import { describe, it, beforeEach, vi, expect } from 'vitest';
// Phase 6 (R5.2): addActorsToScene was promoted off FoundryDataAccess to ScenePlacementService;
// this pierce now instantiates the service directly (no-op validateState + auditLog seams).
import { ScenePlacementService } from '../services/index.js';

function makeService(): any {
  return new ScenePlacementService(() => {}, () => {});
}

function makeActor(id: string, name: string, actorLink = false) {
  return {
    id,
    name,
    prototypeToken: {
      actorLink,
      toObject: () => ({
        name,
        texture: { src: 'systems/wfrp4e/icons/blank.png' },
        width: 1,
        height: 1,
      }),
    },
  };
}

function makeScene(width = 4000, height = 3000) {
  const created: any[] = [];
  return {
    id: 'scene-1',
    name: 'Test Scene',
    width,
    height,
    grid: { size: 100 },
    createEmbeddedDocuments: vi.fn(async (_name: string, data: any[]) => {
      created.push(...data);
      return data.map((d, idx) => ({ id: `tok-${idx}`, ...d }));
    }),
    __created: created,
  };
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('ScenePlacementService.addActorsToScene — per-actor quantities (BUG-051 post-hotfix)', () => {
  it('drops N tokens for one actor when quantities[0] = N; each at a distinct calculated position', async () => {
    const scene = makeScene();
    const actor = makeActor('act-1', 'Skeleton');
    (globalThis as any).game = {
      ...(globalThis as any).game,
      scenes: { current: scene },
      actors: { get: (id: string) => (id === 'act-1' ? actor : null) },
    };

    const svc: any = makeService();

    await svc.addActorsToScene({
      actorIds: ['act-1'],
      quantities: [3],
      placement: 'grid',
      hidden: false,
    });

    expect(scene.createEmbeddedDocuments).toHaveBeenCalledTimes(1);
    const created = scene.createEmbeddedDocuments.mock.calls[0]![1];
    expect(created).toHaveLength(3);
    for (const t of created) {
      expect(t.actorId).toBe('act-1');
      expect(t.name).toBe('Skeleton');
    }
    // Grid layout produces strictly increasing token positions — no two tokens at (x0,y0).
    const positions = created.map((t: any) => `${t.x},${t.y}`);
    expect(new Set(positions).size).toBe(3);
  });

  it('defaults to 1 token per actor when quantities is omitted (back-compat)', async () => {
    const scene = makeScene();
    const a1 = makeActor('act-1', 'Goblin');
    const a2 = makeActor('act-2', 'Ghoul');
    (globalThis as any).game = {
      ...(globalThis as any).game,
      scenes: { current: scene },
      actors: { get: (id: string) => (id === 'act-1' ? a1 : id === 'act-2' ? a2 : null) },
    };

    const svc: any = makeService();

    await svc.addActorsToScene({
      actorIds: ['act-1', 'act-2'],
      placement: 'grid',
      hidden: false,
    });

    const created = scene.createEmbeddedDocuments.mock.calls[0]![1];
    expect(created).toHaveLength(2);
    const actorIds = created.map((t: any) => t.actorId).sort();
    expect(actorIds).toEqual(['act-1', 'act-2']);
  });
});

// TOOL-IDEA-004 + TOOL-IDEA-005 (2026-05-14)
describe('ScenePlacementService.addActorsToScene — sceneId + tokens[] response', () => {
  it('targets a non-active scene via sceneId (TOOL-IDEA-004)', async () => {
    const activeScene = makeScene();
    activeScene.id = 'active-scene';
    activeScene.name = 'Active';
    const inactiveScene = makeScene();
    inactiveScene.id = 'other-scene';
    inactiveScene.name = 'Other';
    const actor = makeActor('act-1', 'Skeleton');
    (globalThis as any).game = {
      ...(globalThis as any).game,
      scenes: {
        current: activeScene,
        get: (id: string) => (id === 'other-scene' ? inactiveScene : null),
      },
      actors: { get: (id: string) => (id === 'act-1' ? actor : null) },
    };

    const svc: any = makeService();

    const result = await svc.addActorsToScene({
      actorIds: ['act-1'],
      placement: 'grid',
      hidden: false,
      sceneId: 'other-scene',
    });

    // Inactive scene received the create call, not the active one.
    expect(inactiveScene.createEmbeddedDocuments).toHaveBeenCalledTimes(1);
    expect(activeScene.createEmbeddedDocuments).not.toHaveBeenCalled();
    expect(result.sceneId).toBe('other-scene');
    expect(result.sceneName).toBe('Other');
  });

  it('throws SceneNotFound when sceneId misses (TOOL-IDEA-004)', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      scenes: {
        current: makeScene(),
        get: () => null,
      },
      actors: { get: () => null },
    };

    const svc: any = makeService();

    await expect(
      svc.addActorsToScene({
        actorIds: ['act-1'],
        placement: 'grid',
        hidden: false,
        sceneId: 'nonexistent',
      }),
    ).rejects.toThrow(/Scene not found.*nonexistent/);
  });

  it('returns tokens[] with id/name/actorId alongside legacy tokenIds (TOOL-IDEA-005)', async () => {
    const scene = makeScene();
    const actor = makeActor('act-1', 'Skeleton');
    (globalThis as any).game = {
      ...(globalThis as any).game,
      scenes: { current: scene },
      actors: { get: (id: string) => (id === 'act-1' ? actor : null) },
    };

    const svc: any = makeService();

    const result = await svc.addActorsToScene({
      actorIds: ['act-1'],
      quantities: [3],
      placement: 'grid',
      hidden: false,
    });

    expect(result.tokenIds).toHaveLength(3);
    expect(result.tokens).toHaveLength(3);
    for (const t of result.tokens) {
      expect(t).toHaveProperty('id');
      expect(t).toHaveProperty('name');
      expect(t).toHaveProperty('actorId');
      expect(t.actorId).toBe('act-1');
    }
    // tokenIds and tokens are parallel — same ordering, same ids.
    expect(result.tokens.map((t: any) => t.id)).toEqual(result.tokenIds);
  });
});
