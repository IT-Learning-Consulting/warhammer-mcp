// Module Integration v1 Phase 4 — module-levels handler unit tests.
//
// Covers: conditional guard branches (MODULE_NOT_ACTIVE / MODULE_DEPENDENCY_NOT_ACTIVE / active),
// schema rejection, per-action dispatch with REAL-shaped mocks (instance .update/.getFlag/.setFlag,
// scene[collection].get), and the rescale dry-run safety gate (no API call without confirm:true).
//
// Mocks model the real Foundry API shape (phase5 lesson): documents expose instance methods, not
// statics; scene embedded collections are Maps with .get(); fromUuidSync is a global function.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dispatchModuleLevels } from '../handlers/modules/levels/levels.js';

// ── Mock document factory ───────────────────────────────────────────────────

function makeDoc(initial: Record<string, any> = {}) {
  const doc: any = {
    uuid: initial.uuid ?? 'Scene.s1.Token.t1',
    name: initial.name ?? 'Mock',
    documentName: initial.documentName ?? 'Token',
    elevation: initial.elevation ?? 0,
    flags: initial.flags ?? {},
    _source: { elevation: initial.elevation ?? 0, flags: JSON.parse(JSON.stringify(initial.flags ?? {})) },
    // RC1.1b: levels.ts now verifyDocWrite()s against doc._source after every update() — mirror
    // every write into a shadow _source object alongside the live doc mutation below.
    update: vi.fn(async (changes: Record<string, any>) => {
      // Apply dot-notation + plain keys to mirror Foundry expandObject semantics.
      for (const [k, v] of Object.entries(changes)) {
        if (k === 'elevation') { doc.elevation = v; doc._source.elevation = v; continue; }
        if (k.includes('.')) {
          const segs = k.split('.');
          let cur = doc;
          let srcCur = doc._source;
          for (let i = 0; i < segs.length - 1; i++) {
            cur[segs[i]] = cur[segs[i]] ?? {};
            srcCur[segs[i]] = srcCur[segs[i]] ?? {};
            cur = cur[segs[i]];
            srcCur = srcCur[segs[i]];
          }
          cur[segs[segs.length - 1]] = v;
          srcCur[segs[segs.length - 1]] = v;
        } else {
          doc[k] = v;
          doc._source[k] = v;
        }
      }
    }),
    getFlag: vi.fn((scope: string, key: string) => doc.flags?.[scope]?.[key]),
    setFlag: vi.fn(async (scope: string, key: string, val: any) => {
      doc.flags[scope] = doc.flags[scope] ?? {};
      doc.flags[scope][key] = val;
    }),
    // RC1.1b: levels.ts's set-region-elevation stair-behavior create now re-reads
    // region.behaviors.get(id) to confirm the RegionBehavior actually landed.
    behaviors: new Map<string, any>(),
    createEmbeddedDocuments: vi.fn(async (_type: string, payloads: any[]) => {
      const created = payloads.map((p, i) => ({ id: `beh${i}`, ...p, _source: { ...p } }));
      for (const c of created) doc.behaviors.set(c.id, c);
      return created;
    }),
  };
  return doc;
}

function makeScene(collections: Record<string, Map<string, any>> = {}) {
  const scene: any = {
    id: 's1',
    uuid: 'Scene.s1',
    name: 'Test Scene',
    flags: {},
    update: vi.fn(async (changes: Record<string, any>) => {
      for (const [k, v] of Object.entries(changes)) {
        if (k.includes('.')) {
          const segs = k.split('.');
          let cur = scene;
          for (let i = 0; i < segs.length - 1; i++) {
            cur[segs[i]] = cur[segs[i]] ?? {};
            cur = cur[segs[i]];
          }
          cur[segs[segs.length - 1]] = v;
        } else { scene[k] = v; }
      }
    }),
    getFlag: vi.fn((scope: string, key: string) => scene.flags?.[scope]?.[key]),
    setFlag: vi.fn(async (scope: string, key: string, val: any) => {
      scene.flags[scope] = scene.flags[scope] ?? {};
      scene.flags[scope][key] = val;
    }),
  };
  for (const [name, map] of Object.entries(collections)) scene[name] = map;
  return scene;
}

function setupGame(opts: { levels?: boolean; wallHeight?: boolean; volumetric?: boolean; scene?: any } = {}) {
  const mods = new Map<string, any>([
    ['levels', { active: opts.levels ?? true, version: '6.0.21' }],
    ['wall-height', { active: opts.wallHeight ?? true, version: '7.0.8' }],
    ['levelsvolumetrictemplates', { active: opts.volumetric ?? true, version: '3.0.1' }],
  ]);
  (globalThis as any).game = {
    modules: { get: (id: string) => mods.get(id) },
    user: { isGM: true },
    scenes: { get: (_id: string) => opts.scene },
    settings: { get: () => undefined },
  };
  (globalThis as any).canvas = { scene: opts.scene };
  (globalThis as any).fromUuidSync = (uuid: string) => makeDoc({ uuid, documentName: 'Token', flags: { levels: { rangeTop: 19 } } });
  (globalThis as any).CONFIG = { Levels: { API: { rescaleGridDistance: vi.fn(async () => []) } } };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('module-levels guard', () => {
  it('returns MODULE_NOT_ACTIVE when levels is inactive', async () => {
    setupGame({ levels: false });
    const r = await dispatchModuleLevels({ action: 'get-capabilities' });
    expect(r.success).toBe(false);
    expect(r.error).toContain('MODULE_NOT_ACTIVE');
  });

  it('returns MODULE_DEPENDENCY_NOT_ACTIVE when wall-height dep is inactive', async () => {
    setupGame({ levels: true, wallHeight: false });
    const r = await dispatchModuleLevels({ action: 'get-capabilities' });
    expect(r.success).toBe(false);
    expect(r.error).toContain('MODULE_DEPENDENCY_NOT_ACTIVE');
  });

  it('reaches the body when levels + wall-height are active', async () => {
    setupGame({ scene: makeScene() });
    const r = await dispatchModuleLevels({ action: 'get-capabilities' });
    expect(r.success).toBe(true);
  });
});

describe('module-levels schema', () => {
  it('rejects an unknown action', async () => {
    setupGame({ scene: makeScene() });
    await expect(dispatchModuleLevels({ action: 'bogus' })).rejects.toBeTruthy();
  });

  it('rejects unknown keys (strict)', async () => {
    setupGame({ scene: makeScene() });
    await expect(dispatchModuleLevels({ action: 'get-elevation-data', uuid: 'x', extra: 1 })).rejects.toBeTruthy();
  });
});

describe('module-levels writes', () => {
  it('set-token-elevation writes core elevation + tokenHeight and re-reads', async () => {
    const token = makeDoc({ documentName: 'Token' });
    const scene = makeScene({ tokens: new Map([['t1', token]]) });
    setupGame({ scene });
    const r: any = await dispatchModuleLevels({ action: 'set-token-elevation', sceneId: 's1', tokenId: 't1', elevation: 10, tokenHeight: 2 });
    expect(r.success).toBe(true);
    expect(token.update).toHaveBeenCalledWith(expect.objectContaining({ elevation: 10, 'flags.wall-height.tokenHeight': 2 }));
    expect(r.data.elevation).toBe(10);
    expect(r.data.tokenHeight).toBe(2);
  });

  it('set-tile-range writes the 7 flags but never rangeBottom', async () => {
    const tile = makeDoc({ documentName: 'Tile' });
    const scene = makeScene({ tiles: new Map([['t1', tile]]) });
    setupGame({ scene });
    const r: any = await dispatchModuleLevels({ action: 'set-tile-range', sceneId: 's1', tileId: 't1', elevation: 10, rangeTop: 19, showIfAbove: true, allWallBlockSight: true });
    expect(r.success).toBe(true);
    const call = tile.update.mock.calls[0][0];
    expect(call).toHaveProperty('flags.levels.rangeTop', 19);
    expect(call).not.toHaveProperty('flags.levels.rangeBottom');
    expect(r.data.rangeTop).toBe(19);
  });

  it('set-wall-height writes the hyphenated wall-height namespace', async () => {
    const wall = makeDoc({ documentName: 'Wall' });
    const scene = makeScene({ walls: new Map([['w1', wall]]) });
    setupGame({ scene });
    const r: any = await dispatchModuleLevels({ action: 'set-wall-height', sceneId: 's1', wallId: 'w1', top: 10, bottom: 0 });
    expect(r.success).toBe(true);
    expect(wall.update).toHaveBeenCalledWith(expect.objectContaining({ 'flags.wall-height.top': 10, 'flags.wall-height.bottom': 0 }));
  });

  it('set-volumetric-template flags retargetOnUpdate:false', async () => {
    const tpl = makeDoc({ documentName: 'MeasuredTemplate' });
    const scene = makeScene({ templates: new Map([['m1', tpl]]) });
    setupGame({ scene });
    const r: any = await dispatchModuleLevels({ action: 'set-volumetric-template', sceneId: 's1', templateId: 'm1', special: 15 });
    expect(r.success).toBe(true);
    expect(r.data.retargetOnUpdate).toBe(false);
  });

  it('set-volumetric-template fails when volumetric module inactive', async () => {
    const scene = makeScene({ templates: new Map([['m1', makeDoc()]]) });
    setupGame({ scene, volumetric: false });
    const r: any = await dispatchModuleLevels({ action: 'set-volumetric-template', sceneId: 's1', templateId: 'm1', special: 15 });
    expect(r.success).toBe(false);
    expect(r.error).toContain('MODULE_DEPENDENCY_NOT_ACTIVE');
  });

  it('define-scene-levels persists tuples and re-reads', async () => {
    const scene = makeScene();
    setupGame({ scene });
    const levels = [[0, 9, 'Ground'], [10, 19, 'Floor 1']];
    const r: any = await dispatchModuleLevels({ action: 'define-scene-levels', sceneId: 's1', levels });
    expect(r.success).toBe(true);
    expect(scene.setFlag).toHaveBeenCalledWith('levels', 'sceneLevels', levels);
    expect(r.data.count).toBe(2);
  });
});

describe('module-levels region + rescale', () => {
  it('set-region-elevation writes nested elevation + creates a stair behavior', async () => {
    const region = makeDoc({ documentName: 'Region', elevation: { bottom: null, top: null } });
    region.elevation = { bottom: null, top: null };
    region._source.elevation = { bottom: null, top: null };
    region.update = vi.fn(async (c: any) => {
      if (c.elevation) {
        region.elevation = { ...region.elevation, ...c.elevation };
        region._source.elevation = { ...region._source.elevation, ...c.elevation };
      }
    });
    const scene = makeScene({ regions: new Map([['r1', region]]) });
    setupGame({ scene });
    const r: any = await dispatchModuleLevels({ action: 'set-region-elevation', sceneId: 's1', regionId: 'r1', bottom: 0, top: 10, stairMode: 'stair' });
    expect(r.success).toBe(true);
    expect(region.update).toHaveBeenCalledWith({ elevation: { bottom: 0, top: 10 } });
    expect(region.createEmbeddedDocuments).toHaveBeenCalled();
    const behPayload = region.createEmbeddedDocuments.mock.calls[0][1][0];
    expect(behPayload.system.source).toContain('CONFIG.Levels.handlers.RegionHandler.stair(region, event)');
    expect(r.data.behavior).not.toBeNull();
  });

  it('rescale-grid-distance dry-run does NOT call the API', async () => {
    const scene = makeScene({ tokens: new Map([['t1', makeDoc()]]), tiles: new Map() });
    setupGame({ scene });
    const r: any = await dispatchModuleLevels({ action: 'rescale-grid-distance', sceneId: 's1', prevDistance: 5, currDistance: 2 });
    expect(r.success).toBe(true);
    expect(r.data.dryRun).toBe(true);
    expect((globalThis as any).CONFIG.Levels.API.rescaleGridDistance).not.toHaveBeenCalled();
  });

  it('rescale-grid-distance with confirm:true calls the API', async () => {
    const scene = makeScene({ tokens: new Map([['t1', makeDoc()]]) });
    setupGame({ scene });
    const r: any = await dispatchModuleLevels({ action: 'rescale-grid-distance', sceneId: 's1', prevDistance: 5, currDistance: 2, confirm: true });
    expect(r.success).toBe(true);
    expect(r.data.dryRun).toBe(false);
    expect((globalThis as any).CONFIG.Levels.API.rescaleGridDistance).toHaveBeenCalledWith(5, 2, scene);
  });
});
