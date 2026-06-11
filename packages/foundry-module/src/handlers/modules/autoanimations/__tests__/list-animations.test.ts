// Module Integration v1 Phase 8 — vitest: list-animations reads the aa.ready tree.
//
// Why (pre-plan ADR-8.1): AA registers `autoanimations.*` as a PRIVATE Sequencer
// namespace, so Sequencer.Database.searchFor returns []. list-animations must read AA's
// `aaDatabase` menu tree captured at the `aa.ready` hook. This test installs a Hooks
// mock BEFORE the module import (vi.hoisted) so the once-listener captures honestly,
// then drives it with a fake tree.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Install a Hooks mock before the module import so its top-level Hooks.once('aa.ready')
// is captured. The store lets the test fire the captured callback to populate aaDatabaseRef.
const hoisted = vi.hoisted(() => {
  const store: { cb?: (db: any) => void } = {};
  (globalThis as any).Hooks = {
    once: (name: string, cb: (db: any) => void) => {
      if (name === 'aa.ready') store.cb = cb;
    },
  };
  return store;
});

import { dispatchModuleAutoAnimations } from '../autoanimations.js';

function mockGlobalsActive() {
  (globalThis as any).game = {
    user: { isGM: true },
    modules: {
      get: (id: string) =>
        ['autoanimations', 'sequencer', 'socketlib'].includes(id) ? { active: true } : null,
    },
  };
}

const fakeTree = {
  melee: { weapon: { sword: { '01': {}, '02': {} }, dagger: { '01': {} } } },
  range: { weapon: { bow: { regular: {} } } },
};

beforeEach(() => {
  mockGlobalsActive();
});

afterEach(() => {
  delete (globalThis as any).game;
});

describe('list-animations', () => {
  it('returns AA_DATABASE_NOT_READY before aa.ready fires', async () => {
    // hoisted.cb not invoked yet → aaDatabaseRef is null.
    const result = await dispatchModuleAutoAnimations({ action: 'list-animations' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('AA_DATABASE_NOT_READY');
  });

  it('lists top-level dbSections after aa.ready', async () => {
    hoisted.cb?.(fakeTree);
    const result = await dispatchModuleAutoAnimations({ action: 'list-animations' });
    expect(result.success).toBe(true);
    expect(result.data.keys).toEqual(expect.arrayContaining(['melee', 'range']));
  });

  it('navigates dbSection + menuType into the tree', async () => {
    hoisted.cb?.(fakeTree);
    const result = await dispatchModuleAutoAnimations({
      action: 'list-animations',
      dbSection: 'melee',
      menuType: 'weapon',
    });
    expect(result.success).toBe(true);
    expect(result.data.trail).toEqual(['melee', 'weapon']);
    expect(result.data.keys).toEqual(expect.arrayContaining(['sword', 'dagger']));
  });

  it('returns an empty key set for an unknown dbSection (not an error)', async () => {
    hoisted.cb?.(fakeTree);
    const result = await dispatchModuleAutoAnimations({ action: 'list-animations', dbSection: 'static' });
    expect(result.success).toBe(true);
    expect(result.data.count).toBe(0);
  });
});
