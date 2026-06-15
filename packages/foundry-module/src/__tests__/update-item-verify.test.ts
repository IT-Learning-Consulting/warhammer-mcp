// MCP Completion v1 Phase 1 (R1.2) — updateItem post-write persistence verification.
// 5 cases: happy path, drift throw, disappearance throw, opt-out, deletion-marker skip.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FoundryDataAccess } from '../data-access.js';

// Provide flattenObject and getProperty to the foundry.utils stub for these tests.
// Real Foundry implementations: flattenObject converts nested objects to dot-paths;
// getProperty traverses an object by dot-path. Both are needed by the verify block.
function installFoundryUtils() {
  (globalThis as any).foundry = {
    ...(globalThis as any).foundry,
    utils: {
      ...(globalThis as any).foundry?.utils,
      flattenObject(obj: any): Record<string, any> {
        const result: Record<string, any> = {};
        for (const [k, v] of Object.entries(obj)) {
          if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
            const nested = this.flattenObject(v as any);
            for (const [nk, nv] of Object.entries(nested)) {
              result[`${k}.${nk}`] = nv;
            }
          } else {
            result[k] = v;
          }
        }
        return result;
      },
      getProperty(obj: any, path: string): any {
        return path.split('.').reduce((cursor: any, seg: string) => cursor?.[seg], obj);
      },
    },
  };
}

function makeItem(id: string, name: string, systemData: any = {}) {
  const item: any = {
    id,
    name,
    uuid: `Item.${id}`,
    system: { ...systemData },
    update: vi.fn(async () => item),
    delete: vi.fn(async () => true),
    effects: { contents: [] },
  };
  return item;
}

function makeActor(id: string, name: string, items: any[] = []) {
  const itemList = [...items];
  return {
    id,
    name,
    items: {
      get: (iid: string) => itemList.find((i) => i.id === iid) ?? null,
      find: (pred: (i: any) => boolean) => itemList.find(pred) ?? null,
    },
  };
}

function setupGame(opts: { actors?: any[]; worldItems?: any[] } = {}) {
  const actors = opts.actors ?? [];
  const worldItems = opts.worldItems ?? [];
  (globalThis as any).game = {
    ...(globalThis as any).game,
    actors: {
      get: (id: string) => actors.find((a) => a.id === id) ?? null,
    },
    items: {
      get: (id: string) => worldItems.find((i) => i.id === id) ?? null,
    },
  };
  (globalThis as any).ui = {
    notifications: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  };
}

function makeDA(): FoundryDataAccess {
  const da = new FoundryDataAccess();
  (da as any).validateFoundryState = () => {};
  return da;
}

beforeEach(() => {
  installFoundryUtils();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('updateItem verify-block (MCP Completion v1 Phase 1 R1.2)', () => {
  it('happy path: update persists correctly — no throw, success returned', async () => {
    const item = makeItem('i1', 'Rapier', { advances: { value: 3 } });
    // Simulate update applying the change (real Foundry mutates item in-place)
    item.update = vi.fn(async (_payload: any) => {
      item.system.advances.value = 4;
      return item;
    });
    const actor = makeActor('a1', 'Hans', [item]);
    setupGame({ actors: [actor] });
    const da = makeDA();

    const res = await da.updateItem({
      actorId: 'a1',
      itemId: 'i1',
      updateData: { 'system.advances.value': 4 },
    });

    expect(res.success).toBe(true);
    expect(res.scope).toBe('actor');
  });

  it('drift: update does not persist — throws UPDATE_ITEM_NOT_PERSISTED with path summary', async () => {
    const item = makeItem('i1', 'Rapier', { damage: { value: '1d6+SB' } });
    // Simulate Foundry silently rejecting the write (DataModelValidationError swallowed)
    item.update = vi.fn(async () => item); // item.system.damage.value unchanged at '1d6+SB'
    const actor = makeActor('a1', 'Hans', [item]);
    setupGame({ actors: [actor] });
    const da = makeDA();

    await expect(
      da.updateItem({
        actorId: 'a1',
        itemId: 'i1',
        updateData: { 'system.damage.value': '1d6+SBlarg' },
      })
    ).rejects.toThrow(/UPDATE_ITEM_NOT_PERSISTED/);
  });

  it('BUG-134: preUpdate-cancelled write (update returns undefined) throws instead of returning false success', async () => {
    const item = makeItem('i1', 'Melee (Basic)', { advances: { value: 0 } });
    item.update = vi.fn(async () => undefined);
    const actor = makeActor('a1', 'Hans', [item]);
    setupGame({ actors: [actor] });
    const da = makeDA();

    await expect(
      da.updateItem({
        actorId: 'a1',
        itemId: 'i1',
        updateData: { 'system.advances.value': 3 },
      })
    ).rejects.toThrow(/preUpdate cancelled write/i);
  });

  it('BUG-134: cancelled no-op does not throw when requested value already matches', async () => {
    const item = makeItem('i1', 'Melee (Basic)', { advances: { value: 3 } });
    item.update = vi.fn(async () => undefined);
    const actor = makeActor('a1', 'Hans', [item]);
    setupGame({ actors: [actor] });
    const da = makeDA();

    const res = await da.updateItem({
      actorId: 'a1',
      itemId: 'i1',
      updateData: { 'system.advances.value': 3 },
    });

    expect(res.success).toBe(true);
  });

  it('disappearance: item gone after update — throws UPDATE_ITEM_NOT_PERSISTED with id', async () => {
    const item = makeItem('i1', 'Rapier');
    item.update = vi.fn(async () => item);
    // Re-fetch returns null (item disappeared)
    setupGame({
      actors: [
        {
          id: 'a1',
          name: 'Hans',
          items: {
            get: (iid: string) => (iid === 'i1' ? item : null), // before update
          },
        },
      ],
    });
    // Override the actor's item lookup to return null AFTER update (simulates disappearance)
    const actor = makeActor('a1', 'Hans', []); // empty items — re-fetch returns null
    setupGame({ actors: [actor] });
    // But _resolveItem needs to find the item on initial resolution — put it back for that call
    // We need a different actor where initial lookup finds item but re-fetch does not.
    // Use world scope instead (simpler to control the re-fetch).
    const worldItem = makeItem('w1', 'World Sword');
    worldItem.update = vi.fn(async () => worldItem);
    setupGame({ worldItems: [] }); // world items empty → re-fetch returns null
    // world scope: _resolveItem needs game.items to find the item initially
    (globalThis as any).game.items = {
      get: vi.fn()
        .mockReturnValueOnce(worldItem)  // first call: _resolveItem finds item
        .mockReturnValueOnce(null),       // second call: verify re-fetch returns null
      find: (_pred: any) => null,
    };

    const da = makeDA();
    await expect(
      da.updateItem({
        destination: { type: 'world' },
        itemId: 'w1',
        updateData: { name: 'Updated Name' },
      })
    ).rejects.toThrow(/UPDATE_ITEM_NOT_PERSISTED.*disappeared/);
  });

  it('opt-out: verifyPersistence=false skips check even on drift — success returned', async () => {
    const item = makeItem('i1', 'Rapier', { damage: { value: '1d6+SB' } });
    item.update = vi.fn(async () => item); // does NOT apply change
    const actor = makeActor('a1', 'Hans', [item]);
    setupGame({ actors: [actor] });
    const da = makeDA();

    const res = await da.updateItem({
      actorId: 'a1',
      itemId: 'i1',
      updateData: { 'system.damage.value': '1d6+SBlarg' },
      verifyPersistence: false,
    });

    expect(res.success).toBe(true);
  });

  it('deletion-marker: path with .-= is not validated — no drift throw', async () => {
    const item = makeItem('i1', 'Rapier', { qualities: { value: ['sharp'] } });
    item.update = vi.fn(async () => item); // does NOT apply any change
    const actor = makeActor('a1', 'Hans', [item]);
    setupGame({ actors: [actor] });
    const da = makeDA();

    // Deletion markers (e.g. "system.qualities.value.-=0") are skipped by the verify block
    const res = await da.updateItem({
      actorId: 'a1',
      itemId: 'i1',
      updateData: { 'system.qualities.value.-=0': null },
    });

    expect(res.success).toBe(true);
  });

  it('BUG-385: injects skipExperienceChecks:true into item.update (bypasses the advancement dialog)', async () => {
    const item = makeItem('i1', 'Melee (Basic)', { advances: { value: 0 } });
    let capturedOptions: any;
    item.update = vi.fn(async (_payload: any, options: any) => {
      capturedOptions = options;
      item.system.advances.value = 5;
      return item;
    });
    const actor = makeActor('a1', 'Hans', [item]);
    setupGame({ actors: [actor] });
    const da = makeDA();

    await da.updateItem({
      actorId: 'a1',
      itemId: 'i1',
      updateData: { 'system.advances.value': 5 }, // no options passed — must still inject
    });

    // WHY: a character skill item's advances change opens SkillModel._preUpdate → advancementDialog,
    // a DialogV2 that deadlocks the headless MCP await. skipExperienceChecks:true bypasses it.
    expect(capturedOptions?.skipExperienceChecks).toBe(true);
  });

  it('BUG-385: injected skipExperienceChecks always wins, even over a caller-supplied false', async () => {
    const item = makeItem('i1', 'Rapier', { advances: { value: 3 } });
    let capturedOptions: any;
    item.update = vi.fn(async (_payload: any, options: any) => {
      capturedOptions = options;
      item.system.advances.value = 4;
      return item;
    });
    const actor = makeActor('a1', 'Hans', [item]);
    setupGame({ actors: [actor] });
    const da = makeDA();

    await da.updateItem({
      actorId: 'a1',
      itemId: 'i1',
      updateData: { 'system.advances.value': 4 },
      options: { skipExperienceChecks: false },
    });

    // The dialog must NEVER open on a programmatic update, so the injected true overrides the caller.
    expect(capturedOptions?.skipExperienceChecks).toBe(true);
  });
});
