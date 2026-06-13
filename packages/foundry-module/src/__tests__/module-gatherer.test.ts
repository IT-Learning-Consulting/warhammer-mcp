// Module Integration v1 Phase 14 — Unit test for module-gatherer dispatcher (gatherer).
//
// Deterministic: mocks globalThis.game.modules (+ .API) + game.user + game.settings + fromUuid.
// Branches:
//   - module inactive            → MODULE_NOT_ACTIVE
//   - non-GM on a write          → GATHERER_ACCESS_DENIED
//   - gather on minigame page    → minigame:"opened" (fire-and-forget; API.gather kicked off un-awaited, no socket deadlock)
//   - gather happy               → API.gather called; quantityPath warning surfaced when misconfigured
//   - reset-spot                 → flags.gatherer.data unset
//   - harvest-token no gatherSheet→ GATHERER_NO_GATHER_SHEET

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

import { dispatchModuleGatherer } from '../handlers/modules/gatherer/gatherer.js';

let PAGES: Record<string, any> = {};
let ACTORS: Record<string, any> = {};
const gatherSpy = vi.fn(async () => ({ things: [{ name: 'Mandrake Root', qty: 2 }] }));

function makePage(name: string, flags: Record<string, any>) {
  const store: Record<string, any> = { ...flags };
  return {
    name,
    getFlag: (scope: string, key: string) => store[key],
    setFlag: vi.fn(async (scope: string, key: string, val: any) => {
      store[key] = val;
    }),
    unsetFlag: vi.fn(async (scope: string, key: string) => {
      delete store[key];
    }),
    _store: store,
  };
}

function setGame(opts: { active: boolean; isGM?: boolean; quantityPath?: string; apiBound?: boolean }) {
  gatherSpy.mockClear();
  (globalThis as any).game = {
    modules: {
      get: (id: string) =>
        id === 'gatherer'
          ? { active: opts.active, API: opts.apiBound === false ? undefined : { gather: gatherSpy } }
          : { active: true },
    },
    user: { isGM: opts.isGM ?? true },
    settings: { get: (m: string, k: string) => (k === 'quantityPath' ? (opts.quantityPath ?? 'quantity') : undefined) },
    time: { worldTime: 0 },
  };
  (globalThis as any).fromUuid = vi.fn(async (uuid: string) => PAGES[uuid] ?? ACTORS[uuid]);
}

beforeEach(() => {
  (globalThis as any).game = undefined;
  (globalThis as any).fromUuid = undefined;
  PAGES = {};
  ACTORS = {};
});

describe('dispatchModuleGatherer', () => {
  it('returns MODULE_NOT_ACTIVE when inactive', async () => {
    setGame({ active: false });
    const r = (await dispatchModuleGatherer({ action: 'get-spot-status', pageUuid: 'p1' })) as any;
    expect(r.success).toBe(false);
    expect(r.error).toContain('MODULE_NOT_ACTIVE');
  });

  it('denies a write to a non-GM', async () => {
    setGame({ active: true, isGM: false });
    const r = (await dispatchModuleGatherer({ action: 'gather', pageUuid: 'p1', actorUuid: 'a1' })) as any;
    expect(r.success).toBe(false);
    expect(r.error).toContain('GATHERER_ACCESS_DENIED');
  });

  it('opens a minigame page interactively (fire-and-forget, no socket deadlock)', async () => {
    PAGES['p1'] = makePage('Magic Mushroom Patch', { minigame: 1500 });
    setGame({ active: true, quantityPath: 'quantity.value' });
    const r = (await dispatchModuleGatherer({ action: 'gather', pageUuid: 'p1', actorUuid: 'a1' })) as any;
    expect(r.success).toBe(true);
    expect(r.data.minigame).toBe('opened');
    // Fire-and-forget: API.gather IS invoked, but the handler does NOT await it (returns immediately).
    expect(gatherSpy).toHaveBeenCalledWith('p1', 'a1');
  });

  it('gathers a normal page and warns on a misconfigured quantityPath', async () => {
    PAGES['p1'] = makePage('Herb Patch', { table: 'RollTable.x' });
    setGame({ active: true, quantityPath: 'quantity' }); // WRONG for WFRP4e
    const r = (await dispatchModuleGatherer({ action: 'gather', pageUuid: 'p1', actorUuid: 'a1' })) as any;
    expect(r.success).toBe(true);
    expect(gatherSpy).toHaveBeenCalledWith('p1', 'a1');
    expect(r.data.quantityPathOk).toBe(false);
    expect(r.data.quantityPathWarning).toBeTruthy();
  });

  it('reset-spot unsets flags.gatherer.data', async () => {
    const page = makePage('Herb Patch', { data: { drawsUsed: 3 } });
    PAGES['p1'] = page;
    setGame({ active: true });
    const r = (await dispatchModuleGatherer({ action: 'reset-spot', pageUuid: 'p1' })) as any;
    expect(r.success).toBe(true);
    expect(page.unsetFlag).toHaveBeenCalledWith('gatherer', 'data');
  });

  it('harvest-token errors when the creature has no gatherSheet', async () => {
    ACTORS['c1'] = makePage('Dead Goblin', {});
    setGame({ active: true });
    const r = (await dispatchModuleGatherer({ action: 'harvest-token', actorUuid: 'c1', gatheringActorUuid: 'pc1' })) as any;
    expect(r.success).toBe(false);
    expect(r.error).toContain('GATHERER_NO_GATHER_SHEET');
  });
});
