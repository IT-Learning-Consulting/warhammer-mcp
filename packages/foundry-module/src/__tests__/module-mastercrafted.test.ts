// Module Integration v1 Phase 14 — Unit test for module-mastercrafted dispatcher (mastercrafted).
//
// Deterministic: mocks globalThis.game.modules + game.user + game.journal + game.actors + fromUuid.
// The dynamic-import craft path (execute-craft / check-craftable) is exercised by LIVE smoke, not here
// (vitest cannot resolve the module's served ESM URL). These tests cover the class-free paths + gates:
//   - module inactive            → MODULE_NOT_ACTIVE
//   - non-GM on a write          → MASTERCRAFTED_ACCESS_DENIED
//   - execute-craft no confirm   → MASTERCRAFTED_INVALID_INPUT (CCR-4 confirm gate)
//   - list-recipes               → journal page iteration by type
//   - list-pending-crafts        → actor flag read + remainingSeconds
//   - grant-recipe-discovery     → ownership update + DP-16 read-back

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

import { dispatchModuleMastercrafted } from '../handlers/modules/mastercrafted/mastercrafted.js';

let ACTORS: Record<string, any> = {};
let PAGES: Record<string, any> = {};

function makeRecipePage(name: string, flags: any, parentName = 'Alchemy') {
  return { name, uuid: `JE.x.JEP.${name}`, id: name, type: 'mastercrafted.mastercrafted', parent: { name: parentName }, flags: { mastercrafted: flags } };
}

function setGame(opts: { active: boolean; isGM?: boolean; journals?: any[]; actors?: any[]; worldTime?: number }) {
  (globalThis as any).game = {
    modules: { get: (id: string) => (id === 'mastercrafted' ? { active: opts.active, API: { processDelayedCrafting: vi.fn(async () => {}) } } : { active: true }) },
    user: { isGM: opts.isGM ?? true },
    journal: { contents: opts.journals ?? [] },
    actors: { contents: opts.actors ?? [] },
    time: { worldTime: opts.worldTime ?? 0 },
    settings: { get: () => 'quantity.value', set: vi.fn(async () => {}) },
  };
  (globalThis as any).fromUuid = vi.fn(async (uuid: string) => PAGES[uuid] ?? ACTORS[uuid]);
}

beforeEach(() => {
  (globalThis as any).game = undefined;
  (globalThis as any).fromUuid = undefined;
  ACTORS = {};
  PAGES = {};
});

describe('dispatchModuleMastercrafted', () => {
  it('returns MODULE_NOT_ACTIVE when inactive', async () => {
    setGame({ active: false });
    const r = (await dispatchModuleMastercrafted({ action: 'list-recipes' })) as any;
    expect(r.success).toBe(false);
    expect(r.error).toContain('MODULE_NOT_ACTIVE');
  });

  it('denies a write to a non-GM', async () => {
    setGame({ active: true, isGM: false });
    const r = (await dispatchModuleMastercrafted({ action: 'execute-craft', pageUuid: 'p1', actorUuid: 'a1', confirm: true })) as any;
    expect(r.success).toBe(false);
    expect(r.error).toContain('MASTERCRAFTED_ACCESS_DENIED');
  });

  it('execute-craft requires confirm:true (CCR-4)', async () => {
    setGame({ active: true });
    const r = (await dispatchModuleMastercrafted({ action: 'execute-craft', pageUuid: 'p1', actorUuid: 'a1' })) as any;
    expect(r.success).toBe(false);
    expect(r.error).toContain('MASTERCRAFTED_INVALID_INPUT');
  });

  it('list-recipes iterates journal pages of the recipe type', async () => {
    const page = makeRecipePage('Healing Draught', { time: 0, ingredients: [{ name: 'Mandrake' }], products: [{ name: 'Healing Draught' }] });
    const je = { name: 'Alchemy', pages: { contents: [page] } };
    setGame({ active: true, journals: [je] });
    const r = (await dispatchModuleMastercrafted({ action: 'list-recipes' })) as any;
    expect(r.success).toBe(true);
    expect(r.data.count).toBe(1);
    expect(r.data.recipes[0].recipeName).toBe('Healing Draught');
    expect(r.data.recipes[0].ingredients).toContain('Mandrake');
  });

  it('list-pending-crafts reads actor flags and computes remainingSeconds', async () => {
    const actor = { name: 'Hans', id: 'a1', uuid: 'Actor.a1', flags: { mastercrafted: { craftABC: { time: 500, items: [{ name: 'Gromril Plate' }] } } } };
    setGame({ active: true, actors: [actor], worldTime: 200 });
    const r = (await dispatchModuleMastercrafted({ action: 'list-pending-crafts' })) as any;
    expect(r.success).toBe(true);
    expect(r.data.count).toBe(1);
    expect(r.data.pending[0].remainingSeconds).toBe(300);
    expect(r.data.pending[0].itemsToDeliver).toContain('Gromril Plate');
  });

  it('grant-recipe-discovery updates ownership and verifies the read-back', async () => {
    const own: Record<string, number> = {};
    const page = {
      name: 'Secret Recipe',
      uuid: 'p1',
      ownership: own,
      // RC1.1b CORE-05 fix: grant-recipe-discovery now verifyDocWrite()s against page._source —
      // _source.ownership shares the same backing object as the live `ownership` getter above,
      // so the update() mutation below satisfies both reads.
      _source: { ownership: own },
      update: vi.fn(async (data: any) => {
        for (const [k, v] of Object.entries(data)) {
          if (k.startsWith('ownership.')) own[k.slice('ownership.'.length)] = v as number;
        }
      }),
    };
    PAGES['p1'] = page;
    setGame({ active: true });
    const r = (await dispatchModuleMastercrafted({ action: 'grant-recipe-discovery', pageUuid: 'p1', userId: 'user9', level: 2 })) as any;
    expect(r.success).toBe(true);
    expect(page.update).toHaveBeenCalled();
    expect(own['user9']).toBe(2);
  });

  // BUG-468 (Wave 2): level:0 revoke — the documented revoke was Zod-unreachable
  // ([1,2] literals); post-fix it deletes the per-user ownership override via the
  // Foundry deletion marker and verifies the key is gone.
  it('grant-recipe-discovery level:0 REVOKES the ownership override (deletion marker)', async () => {
    const own: Record<string, number> = { user9: 1 };
    const page = {
      name: 'Secret Recipe',
      uuid: 'p1',
      ownership: own,
      _source: { ownership: own },
      update: vi.fn(async (data: any) => {
        for (const [k, v] of Object.entries(data)) {
          if (k.startsWith('ownership.-=')) delete own[k.slice('ownership.-='.length)];
          else if (k.startsWith('ownership.')) own[k.slice('ownership.'.length)] = v as number;
        }
      }),
    };
    PAGES['p1'] = page;
    setGame({ active: true });
    const r = (await dispatchModuleMastercrafted({ action: 'grant-recipe-discovery', pageUuid: 'p1', userId: 'user9', level: 0 })) as any;
    expect(r.success).toBe(true);
    expect(r.data.revoked).toBe(true);
    expect(page.update).toHaveBeenCalledWith({ 'ownership.-=user9': null });
    expect(own['user9']).toBeUndefined();
  });

  it('grant-recipe-discovery revoke that does not persist fails loud', async () => {
    const own: Record<string, number> = { user9: 1 };
    const page = {
      name: 'Secret Recipe',
      uuid: 'p1',
      ownership: own,
      _source: { ownership: own },
      update: vi.fn(async () => undefined), // silent no-op — override survives
    };
    PAGES['p1'] = page;
    setGame({ active: true });
    const r = (await dispatchModuleMastercrafted({ action: 'grant-recipe-discovery', pageUuid: 'p1', userId: 'user9', level: 0 })) as any;
    expect(r.success).toBe(false);
    expect(String(r.error)).toContain('MASTERCRAFTED_OWNERSHIP_NOT_PERSISTED');
  });
});
