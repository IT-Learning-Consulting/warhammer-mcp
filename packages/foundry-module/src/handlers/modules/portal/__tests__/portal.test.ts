// Module Integration v2 Phase 13A — Unit tests for module-portal dispatcher + guards.
//
// Deterministic: mocks globalThis.game/canvas/Portal — no live Foundry, no live canvas.
//
// Coverage (Rule 9 — each test encodes WHY the behavior matters):
//   1. Inactive portal-lib -> MODULE_NOT_ACTIVE.
//   2. spawn fired by a non-GM -> PORTAL_ACCESS_DENIED.
//   3. canvas not ready -> PORTAL_CANVAS_NOT_READY — Portal's Propagator/collision-avoidance reads live canvas
//      geometry; spawning against a closed scene would silently no-op or throw deep inside the module.
//   4. sceneId mismatch vs the live canvas.scene.id -> PORTAL_WRONG_SCENE_ACTIVE — Portal has NO sceneId
//      parameter of its own; without this guard a caller targeting a non-viewed scene would silently spawn
//      onto the WRONG scene.
//   5. Happy-path spawn dispatch: builder chain called in order (addCreature -> setLocation -> spawn),
//      awaited, tokenIds returned from the resolved documents.

import { describe, it, expect, afterEach, vi } from 'vitest';

vi.mock('../../../../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

import { dispatchModulePortal } from '../portal.js';

const MODULE_ID = 'portal-lib';

function baseInput(overrides: Partial<any> = {}) {
  return {
    action: 'spawn',
    sceneId: 'scene1',
    creatures: [{ uuid: 'Actor.abc123' }],
    x: 100,
    y: 200,
    ...overrides,
  };
}

afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).canvas;
  delete (globalThis as any).Portal;
});

// ── 1. Inactive module guard ────────────────────────────────────────────────────

describe('module-active guard', () => {
  it('inactive portal-lib -> MODULE_NOT_ACTIVE', async () => {
    (globalThis as any).game = { modules: { get: () => undefined } };
    const res: any = await dispatchModulePortal(baseInput());
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
  });
});

function setActive(isGM = true) {
  (globalThis as any).game = { modules: { get: (id: string) => (id === MODULE_ID ? { active: true } : undefined) }, user: { isGM } };
}

// ── 2. GM gate ──────────────────────────────────────────────────────────────────

describe('GM gate', () => {
  it('spawn fired by a non-GM -> PORTAL_ACCESS_DENIED', async () => {
    setActive(false);
    (globalThis as any).canvas = { ready: true, scene: { id: 'scene1' } };
    const res: any = await dispatchModulePortal(baseInput());
    expect(res.success).toBe(false);
    expect(res.error).toContain('PORTAL_ACCESS_DENIED');
  });
});

// ── 3. canvas-not-ready guard ─────────────────────────────────────────────────────

describe('canvas-ready guard', () => {
  it('canvas.ready falsy -> PORTAL_CANVAS_NOT_READY', async () => {
    setActive(true);
    (globalThis as any).canvas = { ready: false, scene: { id: 'scene1' } };
    const res: any = await dispatchModulePortal(baseInput());
    expect(res.success).toBe(false);
    expect(res.error).toContain('PORTAL_CANVAS_NOT_READY');
  });
});

// ── 4. wrong-scene guard ──────────────────────────────────────────────────────────

describe('scene-match guard', () => {
  it('sceneId does not match canvas.scene.id -> PORTAL_WRONG_SCENE_ACTIVE, no spawn attempted', async () => {
    setActive(true);
    (globalThis as any).canvas = { ready: true, scene: { id: 'scene-DIFFERENT' } };
    const spawn = vi.fn();
    (globalThis as any).Portal = vi.fn(() => ({ addCreature: vi.fn(), setLocation: vi.fn(), spawn }));
    const res: any = await dispatchModulePortal(baseInput({ sceneId: 'scene1' }));
    expect(res.success).toBe(false);
    expect(res.error).toContain('PORTAL_WRONG_SCENE_ACTIVE');
    expect(spawn).not.toHaveBeenCalled();
  });
});

// ── 5. happy-path spawn dispatch ──────────────────────────────────────────────────

describe('spawn dispatch', () => {
  it('builds addCreature -> setLocation -> spawn in order, awaits, and returns tokenIds', async () => {
    setActive(true);
    (globalThis as any).canvas = { ready: true, scene: { id: 'scene1' } };
    const calls: string[] = [];
    const addCreatureOpts: any[] = [];
    const addCreature = vi.fn((uuid: string, opts: any) => {
      calls.push(`addCreature:${uuid}`);
      addCreatureOpts.push(opts);
    });
    const setLocation = vi.fn((loc: any) => {
      calls.push(`setLocation:${loc.x},${loc.y}`);
    });
    const spawn = vi.fn(async () => {
      calls.push('spawn');
      return [{ id: 'tok1' }, { id: 'tok2' }];
    });
    (globalThis as any).Portal = vi.fn(() => ({ addCreature, setLocation, spawn }));

    const res: any = await dispatchModulePortal(baseInput({ creatures: [{ uuid: 'Actor.abc' }, { uuid: 'Actor.def', count: 2 }] }));

    expect(res.success).toBe(true);
    expect(res.data.tokenIds).toEqual(['tok1', 'tok2']);
    expect(calls).toEqual(['addCreature:Actor.abc', 'addCreature:Actor.def', 'setLocation:100,200', 'spawn']);
    // F01 regression guard: the count MUST be passed under portal-lib's `count` option key
    // (the live bundle destructures `o.count`; a `number` key is silently ignored → 1 token).
    expect(addCreatureOpts[0]).toEqual({ count: 1 });
    expect(addCreatureOpts[1]).toEqual({ count: 2 });
  });
});
