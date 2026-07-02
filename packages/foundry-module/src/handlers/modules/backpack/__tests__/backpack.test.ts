// Module Integration v2 Phase 12 — Unit tests for module-backpack dispatcher + guards.
//
// Deterministic: mocks globalThis.game (modules/user/actors/backpacks.storage) and globalThis.foundry.utils
// — no live Foundry. This handler is the SOLE writer of its own settings (storage side, no settle-poll
// needed), but the atomic round-trip ALSO writes the actor's embedded-item collection — a second,
// independently-verified write per add-item/remove-item call.
//
// Coverage (Rule 9 — each test encodes WHY the behavior matters):
//   1. Inactive backpack → MODULE_NOT_ACTIVE for read AND write (guard returns, never throws).
//   2. A write fired by a non-GM → BACKPACK_ACCESS_DENIED.
//   3. Zod discriminatedUnion reject (unknown action) → BACKPACK_INVALID_INPUT.
//   4. set-limit out-of-range (below 5, above 100) → BACKPACK_INVALID_INPUT — the data layer has no max
//      enforcement of its own (gap-fill 5), so the handler self-imposes the ceiling.
//   5. reset without confirm → BACKPACK_CONFIRM_REQUIRED, no write attempted.
//   6. add-item into an occupied slot without overwrite → BACKPACK_SLOT_OCCUPIED — the storage layer
//      silently overwrites with no guard of its own (gap-fill 1), so the handler replicates it.
//   7. add-item happy path verifies BOTH storage add AND actor delete (atomic round-trip, additive-first).
//   8. add-item with a simulated actor-delete failure triggers a ROLLBACK of the storage add +
//      BACKPACK_ACTOR_NOT_PERSISTED — proves additive-first ordering recovers instead of losing the item.
//   9. remove-item happy path verifies BOTH actor create AND storage remove.
//  10. lock-slots requires exactly one of length/indices (XOR) → BACKPACK_INVALID_INPUT on both-or-neither.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../../../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

import { dispatchModuleBackpack } from '../backpack.js';

const MODULE_ID = 'backpack';

interface MockItem {
  id: string;
  name: string;
  toObject: () => any;
}

function makeWorld(
  opts: {
    isGM?: boolean;
    backpackItems?: Record<string, any[]>;
    backpackActorLimit?: Record<string, number>;
    backpackLimit?: number;
    backpacks?: Array<{ userId: string; limit: number }>;
    backpackSlotLocks?: Record<string, any>;
    actorItems?: Record<string, MockItem[]>;
    /** When true, deleteEmbeddedDocuments on the actor is a no-op (simulates an actor-side failure). */
    breakActorDelete?: boolean;
  } = {},
) {
  const settingsStore: Record<string, any> = {
    backpackItems: opts.backpackItems ?? {},
    backpackActorLimit: opts.backpackActorLimit ?? {},
    backpackLimit: opts.backpackLimit ?? 5,
    backpacks: opts.backpacks ?? [],
    backpackSlotLocks: opts.backpackSlotLocks ?? {},
  };

  const settings = {
    get: vi.fn((_scope: string, key: string) => settingsStore[key]),
  };

  function makeActor(actorId: string) {
    const items = new Map<string, MockItem>((opts.actorItems?.[actorId] ?? []).map((i) => [i.id, i]));
    return {
      id: actorId,
      items: {
        get: (id: string) => items.get(id),
      },
      deleteEmbeddedDocuments: vi.fn(async (_docType: string, ids: string[]) => {
        if (opts.breakActorDelete) return []; // simulate silent-drop failure
        for (const id of ids) items.delete(id);
        return ids;
      }),
      createEmbeddedDocuments: vi.fn(async (_docType: string, dataArr: any[]) => {
        const created = dataArr.map((d, i) => {
          const id = `created-${i}-${Math.random().toString(36).slice(2, 8)}`;
          const item: MockItem = { id, name: d.name, toObject: () => ({ ...d, _id: id }) };
          items.set(id, item);
          return { id };
        });
        return created;
      }),
    };
  }

  const actorsCache = new Map<string, any>();
  const actors = {
    get: (actorId: string) => {
      if (!actorsCache.has(actorId)) actorsCache.set(actorId, makeActor(actorId));
      return actorsCache.get(actorId);
    },
  };

  const storage = {
    getActorBackpackItems: vi.fn(async (actorId: string) => settingsStore.backpackItems[actorId] ?? []),
    addItemToBackpack: vi.fn(async (actorId: string, pojo: any, slotIndex: number) => {
      const arr = (settingsStore.backpackItems[actorId] ??= []);
      arr[slotIndex] = pojo;
    }),
    removeItemFromBackpack: vi.fn(async (actorId: string, slotIndex: number) => {
      const arr = settingsStore.backpackItems[actorId] ?? [];
      const removed = arr[slotIndex] ?? null;
      if (arr[slotIndex] !== undefined) arr[slotIndex] = null;
      return removed;
    }),
    moveItemInBackpack: vi.fn(async (actorId: string, fromSlot: number, toSlot: number) => {
      const arr = settingsStore.backpackItems[actorId] ?? [];
      if (!arr[fromSlot]) return false;
      arr[toSlot] = arr[fromSlot];
      arr[fromSlot] = null;
      return true;
    }),
    getActorBackpackLimit: vi.fn(async (actorId: string) => settingsStore.backpackActorLimit[actorId] ?? settingsStore.backpackLimit),
    saveActorBackpackLimit: vi.fn(async (actorId: string, limit: number) => {
      settingsStore.backpackActorLimit[actorId] = Math.max(limit, 5);
    }),
    getDefaultBackpackLimit: vi.fn(async () => settingsStore.backpackLimit),
    saveDefaultLimit: vi.fn(async (limit: number) => {
      settingsStore.backpackLimit = Math.max(limit, 5);
    }),
    getUserBackpack: vi.fn(async (userId: string) => settingsStore.backpacks.find((b: any) => b.userId === userId)),
    getPlayersData: vi.fn(async () => []),
    updateUserBackpack: vi.fn(async (userId: string, limit: number) => {
      const existing = settingsStore.backpacks.find((b: any) => b.userId === userId);
      if (existing) existing.limit = Math.max(limit, 5);
      else settingsStore.backpacks.push({ userId, limit: Math.max(limit, 5) });
    }),
    removeUserBackpack: vi.fn(async (userId: string) => {
      settingsStore.backpacks = settingsStore.backpacks.filter((b: any) => b.userId !== userId);
    }),
    resetAllSettings: vi.fn(async () => {
      settingsStore.backpacks = [];
      settingsStore.backpackLimit = 5;
    }),
    getActorSlotLocks: vi.fn(async (actorId: string) => settingsStore.backpackSlotLocks[actorId] ?? {}),
    lockSlotsForItem: vi.fn(async (actorId: string, leaderSlot: number, itemId: string, length: number) => {
      const locks = (settingsStore.backpackSlotLocks[actorId] ??= {});
      locks[leaderSlot] = { itemId, length: Math.max(1, length) };
    }),
    lockSlotsForItemCustomSlots: vi.fn(async (actorId: string, leaderSlot: number, itemId: string, indices: number[]) => {
      const locks = (settingsStore.backpackSlotLocks[actorId] ??= {});
      locks[leaderSlot] = { itemId, indices };
    }),
    clearLocksForItemId: vi.fn(async (actorId: string, itemId: string) => {
      const locks = settingsStore.backpackSlotLocks[actorId] ?? {};
      for (const key of Object.keys(locks)) if (locks[key]?.itemId === itemId) delete locks[key];
      return true;
    }),
    clearLocksForLeaderSlot: vi.fn(async (actorId: string, leaderSlot: number) => {
      const locks = settingsStore.backpackSlotLocks[actorId] ?? {};
      delete locks[leaderSlot];
      return true;
    }),
  };

  const game = {
    modules: { get: (id: string) => (id === MODULE_ID ? { active: true } : undefined) },
    user: { isGM: opts.isGM ?? true },
    settings,
    actors,
    backpacks: { storage },
  };

  return { game, settingsStore, storage, actors };
}

beforeEach(() => {
  (globalThis as any).game = undefined;
  (globalThis as any).foundry = {
    utils: {
      randomID: vi.fn(() => 'testid1234567890'),
      duplicate: (obj: any) => JSON.parse(JSON.stringify(obj)),
    },
  };
});
afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).foundry;
});

// ── 1. Inactive module guard ────────────────────────────────────────────────────

describe('module-active guard', () => {
  it('inactive backpack → MODULE_NOT_ACTIVE on a write action (returns, never throws)', async () => {
    (globalThis as any).game = { modules: { get: () => undefined } };
    const res: any = await dispatchModuleBackpack({ action: 'add-item', actorId: 'a1', itemId: 'i1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
    expect(res.error).toContain('backpack');
  });

  it('inactive backpack → MODULE_NOT_ACTIVE on a read action too', async () => {
    (globalThis as any).game = { modules: { get: () => undefined } };
    const res: any = await dispatchModuleBackpack({ action: 'read' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
  });
});

// ── 2. GM gate ──────────────────────────────────────────────────────────────────

describe('GM gate', () => {
  it('a write action fired by a non-GM → BACKPACK_ACCESS_DENIED', async () => {
    const world = makeWorld({ isGM: false });
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleBackpack({ action: 'add-item', actorId: 'a1', itemId: 'i1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('BACKPACK_ACCESS_DENIED');
  });
});

// ── 3. discriminatedUnion reject ─────────────────────────────────────────────────

describe('schema discriminatedUnion', () => {
  it('an unknown action is rejected at parse → BACKPACK_INVALID_INPUT', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleBackpack({ action: 'nuke-the-backpack' } as any);
    expect(res.success).toBe(false);
    expect(res.error).toContain('BACKPACK_INVALID_INPUT');
  });
});

// ── 4. set-limit range clamp ──────────────────────────────────────────────────────

describe('set-limit range validation', () => {
  it('a limit below 5 → BACKPACK_INVALID_INPUT (data layer has no max of its own — gap-fill 5)', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleBackpack({ action: 'set-limit', target: 'default', limit: 3 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('BACKPACK_INVALID_INPUT');
    expect(world.storage.saveDefaultLimit).not.toHaveBeenCalled();
  });

  it('a limit above 100 → BACKPACK_INVALID_INPUT', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleBackpack({ action: 'set-limit', target: 'default', limit: 250 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('BACKPACK_INVALID_INPUT');
  });
});

// ── 5. reset confirm-gate ──────────────────────────────────────────────────────────

describe('reset', () => {
  it('without confirm → BACKPACK_CONFIRM_REQUIRED, no write attempted', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleBackpack({ action: 'reset' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('BACKPACK_CONFIRM_REQUIRED');
    expect(world.storage.resetAllSettings).not.toHaveBeenCalled();
  });

  it('with confirm:true → backpacks array is empty afterward', async () => {
    const world = makeWorld({ backpacks: [{ userId: 'u1', limit: 10 }] });
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleBackpack({ action: 'reset', confirm: true });
    expect(res.success).toBe(true);
    expect(world.settingsStore.backpacks).toHaveLength(0);
  });
});

// ── 6. add-item occupied-slot guard ────────────────────────────────────────────────

describe('add-item slot guard', () => {
  it('targeting an occupied slot without overwrite → BACKPACK_SLOT_OCCUPIED, nothing written', async () => {
    const world = makeWorld({
      backpackItems: { a1: [{ _id: 'existing', name: 'Existing Item' }] },
      actorItems: { a1: [{ id: 'i1', name: 'Sword', toObject: () => ({ name: 'Sword' }) }] },
    });
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleBackpack({ action: 'add-item', actorId: 'a1', itemId: 'i1', slotIndex: 0 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('BACKPACK_SLOT_OCCUPIED');
    expect(world.storage.addItemToBackpack).not.toHaveBeenCalled();
  });
});

// ── 7. add-item atomic happy path ──────────────────────────────────────────────────

describe('add-item happy path', () => {
  it('verifies BOTH storage add AND actor delete', async () => {
    const world = makeWorld({
      actorItems: { a1: [{ id: 'i1', name: 'Sword', toObject: () => ({ name: 'Sword' }) }] },
    });
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleBackpack({ action: 'add-item', actorId: 'a1', itemId: 'i1' });
    expect(res.success).toBe(true);
    expect(res.data.slotIndex).toBe(0);
    expect(world.settingsStore.backpackItems.a1[0].name).toBe('Sword');
    expect(world.actors.get('a1').items.get('i1')).toBeUndefined();
  });
});

// ── 8. add-item rollback on actor-side failure ─────────────────────────────────────

describe('add-item rollback', () => {
  it('a simulated actor-delete failure rolls back the storage add + BACKPACK_ACTOR_NOT_PERSISTED', async () => {
    const world = makeWorld({
      actorItems: { a1: [{ id: 'i1', name: 'Sword', toObject: () => ({ name: 'Sword' }) }] },
      breakActorDelete: true,
    });
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleBackpack({ action: 'add-item', actorId: 'a1', itemId: 'i1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('BACKPACK_ACTOR_NOT_PERSISTED');
    // Rollback proof: the storage slot was reverted (removeItemFromBackpack called after the add).
    expect(world.storage.removeItemFromBackpack).toHaveBeenCalledWith('a1', 0);
    expect(world.settingsStore.backpackItems.a1[0]).toBeNull();
  });
});

// ── 9. remove-item atomic happy path ───────────────────────────────────────────────

describe('remove-item happy path', () => {
  it('verifies BOTH actor create AND storage remove', async () => {
    const world = makeWorld({
      backpackItems: { a1: [{ _id: 'stored1', name: 'Shield' }] },
    });
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleBackpack({ action: 'remove-item', actorId: 'a1', slotIndex: 0 });
    expect(res.success).toBe(true);
    expect(typeof res.data.itemId).toBe('string');
    expect(world.actors.get('a1').items.get(res.data.itemId)).toBeDefined();
    expect(world.settingsStore.backpackItems.a1[0]).toBeNull();
  });
});

// ── 10. lock-slots XOR validation ──────────────────────────────────────────────────

describe('lock-slots XOR', () => {
  it('neither length nor indices supplied → BACKPACK_INVALID_INPUT', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleBackpack({ action: 'lock-slots', actorId: 'a1', leaderSlot: 0, itemId: 'i1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('BACKPACK_INVALID_INPUT');
  });

  it('both length AND indices supplied → BACKPACK_INVALID_INPUT', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleBackpack({
      action: 'lock-slots',
      actorId: 'a1',
      leaderSlot: 0,
      itemId: 'i1',
      length: 2,
      indices: [1, 2],
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('BACKPACK_INVALID_INPUT');
  });

  it('length only → succeeds and verifies via getActorSlotLocks', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleBackpack({ action: 'lock-slots', actorId: 'a1', leaderSlot: 0, itemId: 'i1', length: 3 });
    expect(res.success).toBe(true);
    expect(world.settingsStore.backpackSlotLocks.a1[0].itemId).toBe('i1');
  });
});
