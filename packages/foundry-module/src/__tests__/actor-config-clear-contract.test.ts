// BUG-497 (Wave 2, D15) — PERMANENT pin of the BUG-294 texture-clear contract:
//   clear (src:'') on prototypeToken.texture.src persists as NULL (a true clear),
//   never the document default icon, and the clear path must not hard-fail.
//   v13 cleans a blank string on the FilePathField to the default icon, so the
//   handler writes null; verifyArtWrite accepts ''/null and throws only when the
//   old texture is still present (the original BUG-294 contract).
// BUG-496 (Wave 2) — update-prototype-token verifies EVERY requested field
//   (partial writes fail loud) and surfaces effective-layer overrides.
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

import { dispatchActorConfig } from '../handlers/actor-config.js';

const ACTOR_ID = 'actorAAAAAAAAAA1';

function setPath(obj: any, path: string, value: unknown): void {
  const segs = path.split('.');
  let cursor = obj;
  for (const seg of segs.slice(0, -1)) {
    cursor[seg] = cursor[seg] ?? {};
    cursor = cursor[seg];
  }
  cursor[segs[segs.length - 1]!] = value;
}

function installFoundryUtils() {
  (globalThis as any).foundry = {
    ...(globalThis as any).foundry,
    utils: {
      ...(globalThis as any).foundry?.utils,
      getProperty(obj: any, path: string): any {
        return path.split('.').reduce((cursor: any, seg: string) => cursor?.[seg], obj);
      },
    },
  };
}

function makeActor(opts: { updateBehavior?: 'apply' | 'noop'; effectiveOverride?: Record<string, unknown> } = {}) {
  const src: any = {
    img: 'tokens/hero.webp',
    prototypeToken: { name: 'Hero', displayName: 20, disposition: 0, texture: { src: 'tokens/hero-token.webp' } },
  };
  const actor: any = {
    id: ACTOR_ID,
    name: 'Test Hero',
    _source: src,
    prototypeToken: {
      toObject: (source: boolean = true) => {
        const base = JSON.parse(JSON.stringify(src.prototypeToken));
        if (source === false && opts.effectiveOverride) return { ...base, ...opts.effectiveOverride };
        return base;
      },
    },
    update: vi.fn(async (payload: Record<string, unknown>) => {
      if (opts.updateBehavior === 'noop') return actor;
      for (const [k, v] of Object.entries(payload)) setPath(src, k, v);
      return actor;
    }),
  };
  return actor;
}

function wireGame(actor: any) {
  (globalThis as any).game = {
    user: { isGM: true },
    actors: { get: (id: string) => (id === ACTOR_ID ? actor : undefined) },
    items: { get: () => undefined },
    settings: { get: (_scope: string, key: string) => (key === 'allowWriteOperations' ? true : undefined) },
    scenes: { current: null, get: () => undefined },
  };
}

beforeEach(() => {
  installFoundryUtils();
});

describe('BUG-497 pin: texture-clear persists null, never the default icon, no hard-fail', () => {
  it('set-art src:"" which:"texture" writes NULL and succeeds', async () => {
    const actor = makeActor();
    wireGame(actor);
    const r: any = await dispatchActorConfig({
      action: 'set-art',
      target: { type: 'actor', id: ACTOR_ID },
      src: '',
      which: 'texture',
    });
    expect(r.success).toBe(true);
    expect(actor.update).toHaveBeenCalledWith({ 'prototypeToken.texture.src': null });
    expect(actor._source.prototypeToken.texture.src).toBeNull();
  });

  it('clear that silently does not take (old texture still present) throws SET_ART_NOT_PERSISTED', async () => {
    const actor = makeActor({ updateBehavior: 'noop' });
    wireGame(actor);
    await expect(
      dispatchActorConfig({
        action: 'set-art',
        target: { type: 'actor', id: ACTOR_ID },
        src: '',
        which: 'texture',
      }),
    ).rejects.toThrow(/SET_ART_NOT_PERSISTED/);
  });

  it('non-empty set still round-trips exactly', async () => {
    const actor = makeActor();
    wireGame(actor);
    const r: any = await dispatchActorConfig({
      action: 'set-art',
      target: { type: 'actor', id: ACTOR_ID },
      src: 'tokens/new-face.webp',
      which: 'texture',
    });
    expect(r.success).toBe(true);
    expect(actor._source.prototypeToken.texture.src).toBe('tokens/new-face.webp');
  });
});

describe('BUG-496: update-prototype-token full verify + effective-layer honesty', () => {
  it('all requested fields land → success, no warning', async () => {
    const actor = makeActor();
    wireGame(actor);
    const r: any = await dispatchActorConfig({
      action: 'update-prototype-token',
      actorId: ACTOR_ID,
      changes: { displayName: 50, disposition: -1 },
    });
    expect(r.success).toBe(true);
    expect(actor._source.prototypeToken.displayName).toBe(50);
    expect(actor._source.prototypeToken.disposition).toBe(-1);
    expect(r.data.warning).toBeUndefined();
  });

  it('a dropped field fails loud instead of returning a partial-success envelope', async () => {
    const actor = makeActor({ updateBehavior: 'noop' });
    wireGame(actor);
    await expect(
      dispatchActorConfig({
        action: 'update-prototype-token',
        actorId: ACTOR_ID,
        changes: { displayName: 50 },
      }),
    ).rejects.toThrow(/UPDATE_PROTOTYPE_TOKEN_NOT_PERSISTED/);
  });

  it('_source persisted but effective layer overridden → success WITH override warning', async () => {
    const actor = makeActor({ effectiveOverride: { displayName: 0 } });
    wireGame(actor);
    const r: any = await dispatchActorConfig({
      action: 'update-prototype-token',
      actorId: ACTOR_ID,
      changes: { displayName: 50 },
    });
    expect(r.success).toBe(true);
    expect(r.data.warning).toContain('PROTOTYPE_TOKEN_EFFECTIVE_OVERRIDE');
    expect(r.data.warning).toContain('prototypeToken.displayName');
  });

  it('extraFields are verified too (BUG-496 passthrough hole closed)', async () => {
    const actor = makeActor({ updateBehavior: 'noop' });
    wireGame(actor);
    await expect(
      dispatchActorConfig({
        action: 'update-prototype-token',
        actorId: ACTOR_ID,
        changes: { disposition: 0 }, // matches current _source → no drift from changes
        extraFields: { randomSetting: 'xyz' },
      }),
    ).rejects.toThrow(/UPDATE_PROTOTYPE_TOKEN_NOT_PERSISTED/);
  });
});
