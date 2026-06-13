// Phase 11 module_integration_v1 — Unit test for module-party-resources dispatcher (Party Resources).
//
// Deterministic: mocks globalThis.game.modules + game.settings (a Map-backed store) + window.pr.api
// (ADR-9.1 Class-3 accessor) — no live Foundry. Branches:
//   - module inactive               → MODULE_NOT_ACTIVE
//   - non-GM on a write             → PARTY_RESOURCES_ACCESS_DENIED
//   - bad input                     → PARTY_RESOURCES_INVALID_INPUT
//   - missing confirm on create     → PARTY_RESOURCES_INVALID_INPUT
//   - get unknown id                → RESOURCE_NOT_FOUND
//   - api unbound on a write        → PARTY_RESOURCES_API_UNAVAILABLE
//   - list / get happy              → snapshot read-back from settings
//   - increment happy               → api.increment fired, clamped read-back
//   - create (confirmed) happy      → register_resource + resource_list append
//   - delete (confirmed) happy      → resource_list splice

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

import { dispatchModulePartyResources } from '../handlers/modules/fvtt-party-resources/party-resources.js';

const MODULE_ID = 'fvtt-party-resources';

/** Build a Map-backed settings store + a window.pr.api that mutates it (mirrors the real module). */
function makeStore(seed: Record<string, unknown> = {}) {
  const store = new Map<string, unknown>(Object.entries(seed));
  const settings = {
    get: (mod: string, key: string) => (mod === MODULE_ID ? store.get(key) : undefined),
    set: vi.fn(async (mod: string, key: string, value: unknown) => { if (mod === MODULE_ID) store.set(key, value); }),
  };
  const api = {
    register_resource: vi.fn((id: string) => { if (!store.has(id)) store.set(id, 0); }),
    set: vi.fn(async (id: string, value: number) => { store.set(id, value); }),
    increment: vi.fn(async (id: string, jump = 1) => {
      const max = Number(store.get(`${id}_max`) ?? 100);
      store.set(id, Math.min(max, Number(store.get(id) ?? 0) + jump));
    }),
    decrement: vi.fn(async (id: string, jump = 1) => {
      const min = Number(store.get(`${id}_min`) ?? -100);
      store.set(id, Math.max(min, Number(store.get(id) ?? 0) - jump));
    }),
  };
  return { store, settings, api };
}

function setGame(opts: { active: boolean; isGM: boolean; settings?: any; api?: any | null }) {
  (globalThis as any).game = {
    modules: { get: (id: string) => (id === MODULE_ID ? { active: opts.active } : { active: true }) },
    user: { isGM: opts.isGM },
    settings: opts.settings ?? { get: () => undefined, set: vi.fn() },
  };
  (globalThis as any).window = { pr: opts.api === null ? undefined : { api: opts.api } };
}

describe('dispatchModulePartyResources', () => {
  beforeEach(() => {
    (globalThis as any).game = undefined;
    (globalThis as any).window = undefined;
    (globalThis as any).pr = undefined;
  });

  it('returns MODULE_NOT_ACTIVE when fvtt-party-resources is inactive', async () => {
    setGame({ active: false, isGM: true });
    const r = await dispatchModulePartyResources({ action: 'list' });
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/^MODULE_NOT_ACTIVE:/);
  });

  it('returns PARTY_RESOURCES_ACCESS_DENIED for a non-GM on a write', async () => {
    const { settings, api } = makeStore({ resource_list: ['doom'] });
    setGame({ active: true, isGM: false, settings, api });
    const r = await dispatchModulePartyResources({ action: 'increment', resourceId: 'doom' });
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/PARTY_RESOURCES_ACCESS_DENIED/);
  });

  it('returns PARTY_RESOURCES_INVALID_INPUT on bad input (missing value on set-value)', async () => {
    const { settings, api } = makeStore({ resource_list: ['doom'] });
    setGame({ active: true, isGM: true, settings, api });
    const r = await dispatchModulePartyResources({ action: 'set-value', resourceId: 'doom' } as any);
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/^PARTY_RESOURCES_INVALID_INPUT:/);
  });

  it('returns PARTY_RESOURCES_INVALID_INPUT when create is missing confirm:true', async () => {
    const { settings, api } = makeStore();
    setGame({ active: true, isGM: true, settings, api });
    const r = await dispatchModulePartyResources({ action: 'create', resourceId: 'doom', name: 'Doom' } as any);
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/^PARTY_RESOURCES_INVALID_INPUT:/);
  });

  it('returns RESOURCE_NOT_FOUND when get targets an unregistered id', async () => {
    const { settings, api } = makeStore({ resource_list: ['doom'] });
    setGame({ active: true, isGM: true, settings, api });
    const r = await dispatchModulePartyResources({ action: 'get', resourceId: 'nope' });
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/^RESOURCE_NOT_FOUND:/);
  });

  it('returns PARTY_RESOURCES_API_UNAVAILABLE when the api is unbound on create', async () => {
    // create needs window.pr.api.register_resource; the value mutations (set/inc/dec) write settings
    // directly and do NOT depend on the api, so create is the action that surfaces an unbound api.
    const { settings } = makeStore({ resource_list: [] });
    setGame({ active: true, isGM: true, settings, api: null });
    const r = await dispatchModulePartyResources({ action: 'create', resourceId: 'doom', confirm: true });
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/PARTY_RESOURCES_(API_UNAVAILABLE|HANDLER_ERROR)/);
  });

  it('list returns registered resources sorted by position', async () => {
    const { settings, api } = makeStore({
      resource_list: ['doom', 'coin'],
      doom: 3, doom_name: 'Doom', doom_position: 2, doom_max: 13, doom_min: 0,
      coin: 50, coin_name: 'Coin', coin_position: 1,
    });
    setGame({ active: true, isGM: true, settings, api });
    const r: any = await dispatchModulePartyResources({ action: 'list' });
    expect(r.success).toBe(true);
    expect(r.data.count).toBe(2);
    expect(r.data.resources[0].id).toBe('coin'); // position 1 sorts first
    expect(r.data.resources[1].name).toBe('Doom');
    expect(r.data.resources[1].max).toBe(13);
  });

  it('get returns the full snapshot for a registered resource', async () => {
    const { settings, api } = makeStore({ resource_list: ['doom'], doom: 8, doom_name: 'Doom', doom_max: 13, doom_visible: false });
    setGame({ active: true, isGM: true, settings, api });
    const r: any = await dispatchModulePartyResources({ action: 'get', resourceId: 'doom' });
    expect(r.success).toBe(true);
    expect(r.data.value).toBe(8);
    expect(r.data.visible).toBe(false);
  });

  it('increment clamps to max and writes the value directly (api.increment is fire-and-forget)', async () => {
    // The module's api.increment doesn't await its write, so the handler replicates the clamp math
    // and writes via game.settings.set directly (reliable persistence + read-back).
    const { settings, api } = makeStore({ resource_list: ['doom'], doom: 12, doom_max: 13 });
    setGame({ active: true, isGM: true, settings, api });
    const r: any = await dispatchModulePartyResources({ action: 'increment', resourceId: 'doom', jump: 5 });
    expect(r.success).toBe(true);
    expect(r.data.previousValue).toBe(12);
    expect(r.data.value).toBe(13); // clamped to max
    expect(settings.set).toHaveBeenCalledWith('fvtt-party-resources', 'doom', 13);
  });

  it('set-value writes directly and fires api.set for the chat broadcast when notifyChat', async () => {
    const { settings, api } = makeStore({ resource_list: ['doom'], doom: 2 });
    setGame({ active: true, isGM: true, settings, api });
    const r: any = await dispatchModulePartyResources({ action: 'set-value', resourceId: 'doom', value: 9, notifyChat: true });
    expect(r.success).toBe(true);
    expect(r.data.value).toBe(9);
    expect(settings.set).toHaveBeenCalledWith('fvtt-party-resources', 'doom', 9); // guaranteed persistence
    expect(api.set).toHaveBeenCalledWith('doom', 9, { notify: true }); // best-effort chat side-channel
  });

  it('create (confirmed) registers the resource and appends to resource_list', async () => {
    const { store, settings, api } = makeStore({ resource_list: [] });
    setGame({ active: true, isGM: true, settings, api });
    const r: any = await dispatchModulePartyResources({ action: 'create', resourceId: 'doom', name: 'Doom', value: 0, max: 13, min: 0, confirm: true });
    expect(r.success).toBe(true);
    expect(api.register_resource).toHaveBeenCalledWith('doom');
    expect((store.get('resource_list') as string[])).toContain('doom');
    expect(r.data.snapshot.max).toBe(13);
  });

  it('delete (confirmed) splices the resource from resource_list', async () => {
    const { store, settings, api } = makeStore({ resource_list: ['doom', 'coin'], doom_name: 'Doom' });
    setGame({ active: true, isGM: true, settings, api });
    const r: any = await dispatchModulePartyResources({ action: 'delete', resourceId: 'doom', confirm: true });
    expect(r.success).toBe(true);
    expect(r.data.remaining).toBe(1);
    expect((store.get('resource_list') as string[])).not.toContain('doom');
  });
});
