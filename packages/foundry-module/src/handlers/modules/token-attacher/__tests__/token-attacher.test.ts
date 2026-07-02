// Module Integration v2 Phase 3A — Unit tests for module-token-attacher dispatcher + guards.
//
// Deterministic: mocks globalThis.game.modules / game.user / globalThis.canvas / window.tokenAttacher —
// no live Foundry, no canvas render.
//
// Coverage (Rule 9 — each test encodes WHY the behavior matters):
//   1. Inactive token-attacher → MODULE_NOT_ACTIVE (guard returns, never throws). WHY: a tool fired in a
//      world without token-attacher must fail with the typed token, not a generic crash.
//   2. lib-wrapper (hard dep) inactive → MODULE_DEPENDENCY_NOT_ACTIVE. WHY: attach/detach call api paths
//      that lib-wrapper underpins; missing it is a distinct, actionable failure.
//   3. attach with canvas.ready=false → TOKEN_ATTACHER_CANVAS_NOT_READY. WHY: _AttachToToken reads live
//      PlaceableObject geometry — firing it without a ready canvas would throw deep inside the module.
//   4. query-attached returns the flag map HEADLESSLY (canvas not ready). WHY: query is a pure getFlag
//      read — it must work for a closed scene where attach cannot.
//   5. attach where the module drops the element (flag never lands) → TOKEN_ATTACHER_NOT_PERSISTED.
//      WHY: layerGetElement silently drops non-canvas ids — the DP-16 re-read is the only proof.
//   6. discriminatedUnion rejects a bad action → TOKEN_ATTACHER_INVALID_INPUT.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { dispatchModuleTokenAttacher } from '../token-attacher.js';

const SCENE_ID = 'scene1';
const BASE_ID = 'baseTok1';

/** A token document whose attached flag map is backed by a mutable object the api mock writes to. */
function makeSceneTokens(attachedMap: Record<string, string[]>) {
  const tokenDoc = {
    id: BASE_ID,
    getFlag: (scope: string, key: string) => {
      if (scope !== 'token-attacher') return undefined;
      if (key === 'attached') return attachedMap;
      return undefined;
    },
  };
  return { get: (id: string) => (id === BASE_ID ? tokenDoc : undefined) };
}

function makeCanvas(opts: {
  ready: boolean;
  attachedMap: Record<string, string[]>;
  placeables?: Record<string, any>; // "Type:id" → placeable obj
}) {
  const base = { id: BASE_ID, document: { id: BASE_ID } };
  return {
    ready: opts.ready,
    scene: { id: SCENE_ID, tokens: makeSceneTokens(opts.attachedMap) },
    tokens: { get: (id: string) => (id === BASE_ID ? base : undefined) },
    getLayerByEmbeddedName: (type: string) => ({
      get: (id: string) => opts.placeables?.[`${type}:${id}`],
    }),
  };
}

function makeGame(opts: { taActive: boolean; libWrapperActive?: boolean; isGM?: boolean; scene?: any }) {
  return {
    modules: {
      get: (id: string) => {
        if (id === 'token-attacher') return opts.taActive ? { active: true, title: 'Token Attacher', version: '4.6.12' } : undefined;
        if (id === 'lib-wrapper') return (opts.libWrapperActive ?? true) ? { active: true } : { active: false };
        return undefined;
      },
    },
    user: { isGM: opts.isGM ?? true },
    scenes: { get: (id: string) => (id === SCENE_ID ? opts.scene : undefined) },
  };
}

beforeEach(() => {
  (globalThis as any).game = undefined;
  (globalThis as any).canvas = undefined;
  (globalThis as any).window = (globalThis as any).window ?? {};
});
afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).canvas;
  if ((globalThis as any).window) delete (globalThis as any).window.tokenAttacher;
});

// ── 1. Inactive module guard ────────────────────────────────────────────────────

describe('module-active guard', () => {
  it('inactive token-attacher → MODULE_NOT_ACTIVE (returns, never throws)', async () => {
    (globalThis as any).game = makeGame({ taActive: false });
    const res: any = await dispatchModuleTokenAttacher({ action: 'query-attached', baseTokenId: BASE_ID });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
    expect(res.error).toContain('token-attacher');
  });

  it('lib-wrapper hard dep inactive → MODULE_DEPENDENCY_NOT_ACTIVE', async () => {
    (globalThis as any).game = makeGame({ taActive: true, libWrapperActive: false });
    const res: any = await dispatchModuleTokenAttacher({ action: 'query-attached', baseTokenId: BASE_ID });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_DEPENDENCY_NOT_ACTIVE');
    expect(res.error).toContain('lib-wrapper');
  });
});

// ── 2. Canvas-ready guard (attach is canvas-mandatory) ──────────────────────────

describe('canvas-ready guard', () => {
  it('attach with canvas.ready=false → TOKEN_ATTACHER_CANVAS_NOT_READY (refused before touching the api)', async () => {
    const attachedMap: Record<string, string[]> = {};
    const scene = { id: SCENE_ID, tokens: makeSceneTokens(attachedMap) };
    (globalThis as any).game = makeGame({ taActive: true, scene });
    (globalThis as any).canvas = makeCanvas({ ready: false, attachedMap });
    // api present but must NOT be reached — the canvas guard fires first.
    (globalThis as any).window.tokenAttacher = { attachElementsToToken: async () => { throw new Error('should not be called'); } };
    const res: any = await dispatchModuleTokenAttacher({
      action: 'attach',
      baseTokenId: BASE_ID,
      sceneId: SCENE_ID,
      elements: [{ type: 'Tile', id: 'tile1' }],
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('TOKEN_ATTACHER_CANVAS_NOT_READY');
  });
});

// ── 3. query is headless (works with canvas down) ───────────────────────────────

describe('query-attached headless', () => {
  it('query-attached returns the flag map even when canvas.ready=false (pure getFlag read)', async () => {
    const attachedMap: Record<string, string[]> = { Tile: ['tile1', 'tile2'], AmbientLight: ['light1'] };
    const scene = { id: SCENE_ID, tokens: makeSceneTokens(attachedMap) };
    (globalThis as any).game = makeGame({ taActive: true, scene });
    (globalThis as any).canvas = makeCanvas({ ready: false, attachedMap });
    const res: any = await dispatchModuleTokenAttacher({ action: 'query-attached', baseTokenId: BASE_ID, sceneId: SCENE_ID });
    expect(res.success).toBe(true);
    expect(res.data.attached).toEqual(attachedMap);
    expect(res.data.total).toBe(3);
  });

  it('query-by-type returns only that type\'s ids', async () => {
    const attachedMap: Record<string, string[]> = { Tile: ['tile1', 'tile2'], AmbientLight: ['light1'] };
    const scene = { id: SCENE_ID, tokens: makeSceneTokens(attachedMap) };
    (globalThis as any).game = makeGame({ taActive: true, scene });
    (globalThis as any).canvas = makeCanvas({ ready: false, attachedMap });
    const res: any = await dispatchModuleTokenAttacher({ action: 'query-by-type', baseTokenId: BASE_ID, sceneId: SCENE_ID, type: 'Tile' });
    expect(res.success).toBe(true);
    expect(res.data.ids).toEqual(['tile1', 'tile2']);
  });
});

// ── 4. attach happy path + DP-16 drop detection ─────────────────────────────────

describe('attach DP-16 flag verify', () => {
  it('attach succeeds when the module lands the element in flags.token-attacher.attached', async () => {
    const attachedMap: Record<string, string[]> = {};
    const scene = { id: SCENE_ID, tokens: makeSceneTokens(attachedMap) };
    (globalThis as any).game = makeGame({ taActive: true, scene });
    (globalThis as any).canvas = makeCanvas({
      ready: true,
      attachedMap,
      placeables: { 'Tile:tile1': { id: 'tile1' } },
    });
    // Faithful api: writes the id into the attached map (what the real module does on success).
    (globalThis as any).window.tokenAttacher = {
      attachElementsToToken: async (_els: any[], _tok: any, _suppress: boolean) => {
        attachedMap['Tile'] = [...(attachedMap['Tile'] ?? []), 'tile1'];
      },
    };
    const res: any = await dispatchModuleTokenAttacher({
      action: 'attach',
      baseTokenId: BASE_ID,
      sceneId: SCENE_ID,
      elements: [{ type: 'Tile', id: 'tile1' }],
    });
    expect(res.success).toBe(true);
    expect(res.data.attached.Tile).toContain('tile1');
    expect(res.data.affected).toEqual([{ type: 'Tile', id: 'tile1' }]);
  });

  it('attach where the module silently drops the id → TOKEN_ATTACHER_NOT_PERSISTED (layerGetElement drop)', async () => {
    const attachedMap: Record<string, string[]> = {};
    const scene = { id: SCENE_ID, tokens: makeSceneTokens(attachedMap) };
    (globalThis as any).game = makeGame({ taActive: true, scene });
    (globalThis as any).canvas = makeCanvas({
      ready: true,
      attachedMap,
      placeables: { 'Tile:tile1': { id: 'tile1' } },
    });
    // Sabotaged api: resolves but writes NOTHING — mimics the silent drop the DP-16 re-read must catch.
    (globalThis as any).window.tokenAttacher = { attachElementsToToken: async () => { /* drops */ } };
    const res: any = await dispatchModuleTokenAttacher({
      action: 'attach',
      baseTokenId: BASE_ID,
      sceneId: SCENE_ID,
      elements: [{ type: 'Tile', id: 'tile1' }],
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('TOKEN_ATTACHER_NOT_PERSISTED');
  });
});

// ── 4b. detach-all settles an ASYNC write before asserting ──────────────────────
//   WHY: window.tokenAttacher.detachAllElementsFromToken can RETURN before its internal
//   updateEmbeddedDocuments propagates to the in-memory TokenDocument. An immediate single re-read
//   races the write and reads the stale (pre-detach) map — the live-eval false-positive of
//   2026-06-25 (handler threw NOT_PERSISTED while query-attached moments later showed total:0). The
//   readAttachedSettled bounded retry must tolerate the delayed clear and report cleared:true.

describe('detach-all async-write settle', () => {
  it('detach-all tolerates a write that lands on a later tick (no false NOT_PERSISTED)', async () => {
    const attachedMap: Record<string, string[]> = { Tile: ['tile1'], AmbientLight: ['light1'] };
    const scene = { id: SCENE_ID, tokens: makeSceneTokens(attachedMap) };
    (globalThis as any).game = makeGame({ taActive: true, scene });
    (globalThis as any).canvas = makeCanvas({ ready: true, attachedMap });
    // Fire-and-forget api: returns immediately but clears the map on a LATER macrotask (mimics the
    // real module's async updateEmbeddedDocuments). The immediate re-read would still see 2 attached.
    (globalThis as any).window.tokenAttacher = {
      detachAllElementsFromToken: async () => {
        setTimeout(() => {
          delete attachedMap['Tile'];
          delete attachedMap['AmbientLight'];
        }, 25);
      },
    };
    const res: any = await dispatchModuleTokenAttacher({ action: 'detach-all', baseTokenId: BASE_ID, sceneId: SCENE_ID });
    expect(res.success).toBe(true);
    expect(res.data.cleared).toBe(true);
    expect(res.data.attached).toEqual({});
  });

  it('detach-all still fails NOT_PERSISTED when the write never lands (settle exhausts)', async () => {
    const attachedMap: Record<string, string[]> = { Tile: ['tile1'] };
    const scene = { id: SCENE_ID, tokens: makeSceneTokens(attachedMap) };
    (globalThis as any).game = makeGame({ taActive: true, scene });
    (globalThis as any).canvas = makeCanvas({ ready: true, attachedMap });
    // Sabotaged api: never clears the map — the settle retries exhaust and the assertion must fire.
    (globalThis as any).window.tokenAttacher = { detachAllElementsFromToken: async () => { /* never clears */ } };
    const res: any = await dispatchModuleTokenAttacher({ action: 'detach-all', baseTokenId: BASE_ID, sceneId: SCENE_ID });
    expect(res.success).toBe(false);
    expect(res.error).toContain('TOKEN_ATTACHER_NOT_PERSISTED');
  });
});

// ── 5. discriminatedUnion rejects an off-list action ────────────────────────────

describe('schema discriminatedUnion', () => {
  it('an unknown action is rejected at parse → TOKEN_ATTACHER_INVALID_INPUT', async () => {
    (globalThis as any).game = makeGame({ taActive: true });
    const res: any = await dispatchModuleTokenAttacher({ action: 'frobnicate', baseTokenId: BASE_ID });
    expect(res.success).toBe(false);
    expect(res.error).toContain('TOKEN_ATTACHER_INVALID_INPUT');
  });
});
