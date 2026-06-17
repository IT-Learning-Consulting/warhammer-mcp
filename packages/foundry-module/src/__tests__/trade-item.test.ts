// Phase 5 (B.9) — FoundryDataAccess.tradeItem handler behavior.
// Exercises the atomic move (full + partial) path + error paths on the Foundry-module side.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryHandlers } from '../queries.js';

function makeActor(
  id: string,
  name: string,
  items: Array<{ id: string; name: string; type: string; quantity?: number }>
) {
  const itemMap = new Map(
    items.map((i) => {
      // Use a mutable box so update() can mutate and return a non-undefined result
      // (BUG-213 fix: updateResult===undefined triggers TRADE_ITEM_SOURCE_DECREMENT_NOT_PERSISTED).
      const qtyBox = { value: i.quantity ?? 1 };
      const itemObj: any = {
        id: i.id,
        name: i.name,
        type: i.type,
        system: { quantity: qtyBox },
        toObject: () => ({
          _id: i.id,
          name: i.name,
          type: i.type,
          system: { quantity: { value: qtyBox.value } },
        }),
        update: vi.fn(async (payload: Record<string, unknown>) => {
          const newQty = payload['system.quantity.value'];
          if (typeof newQty === 'number') qtyBox.value = newQty;
          return itemObj; // non-undefined = success signal for BUG-213 guard
        }),
      };
      return [i.id, itemObj] as const;
    })
  );
  return {
    id,
    name,
    items: {
      get: (iid: string) => itemMap.get(iid) ?? null,
      find: (pred: (it: any) => boolean) => Array.from(itemMap.values()).find(pred) ?? null,
    },
    createEmbeddedDocuments: vi.fn(async (_type: string, payloads: any[]) =>
      payloads.map((p, i) => ({
        id: `${id}-new-${i}`,
        name: p.name,
        type: p.type,
        toObject: () => ({ ...p, _id: `${id}-new-${i}` }),
      }))
    ),
    deleteEmbeddedDocuments: vi.fn(async () => {}),
    _itemMap: itemMap,
  };
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

function makeDA(): any {
  // Phase 8 (R7.3): the actor/item/effect mutation methods were promoted off FoundryDataAccess to the
  // QueryHandlers services; re-expose the ones this test pierces on the DA handle so the captured
  // write-paths are unchanged (the re-bind delegates to the same promoted service the handlers call).
  const qh = new QueryHandlers();
  const da: any = qh.dataAccess;
  da.validateFoundryState = () => {};
  da.tradeItem = (d: any) => qh.itemService.tradeItem(d);
  return da;
}

describe('tradeItem — full transfer', () => {
  it('moves the item from source to destination', async () => {
    const fromActor = makeActor('a1', 'Hans', [
      { id: 'item1', name: 'Longsword', type: 'weapon', quantity: 1 },
    ]);
    const toActor = makeActor('a2', 'Maria', []);
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: {
        get: (id: string) => (id === 'a1' ? fromActor : id === 'a2' ? toActor : null),
      },
    };
    const da = makeDA();
    const res = await da.tradeItem({
      fromActorId: 'a1',
      toActorId: 'a2',
      itemId: 'item1',
    });
    expect(fromActor.deleteEmbeddedDocuments).toHaveBeenCalledOnce();
    expect(toActor.createEmbeddedDocuments).toHaveBeenCalledOnce();
    expect(res.success).toBe(true);
    expect(res.itemName).toBe('Longsword');
  });

  it('throws when source actor missing', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: () => null },
    };
    const da = makeDA();
    await expect(
      da.tradeItem({ fromActorId: 'ghost', toActorId: 'a2', itemId: 'x' })
    ).rejects.toThrow(/Source actor not found/);
  });

  it('throws when destination actor missing', async () => {
    const fromActor = makeActor('a1', 'Hans', [
      { id: 'item1', name: 'X', type: 'weapon' },
    ]);
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: (id: string) => (id === 'a1' ? fromActor : null) },
    };
    const da = makeDA();
    await expect(
      da.tradeItem({ fromActorId: 'a1', toActorId: 'ghost', itemId: 'item1' })
    ).rejects.toThrow(/Destination actor not found/);
  });

  it('throws when item missing on source', async () => {
    const fromActor = makeActor('a1', 'Hans', []);
    const toActor = makeActor('a2', 'Maria', []);
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: {
        get: (id: string) => (id === 'a1' ? fromActor : id === 'a2' ? toActor : null),
      },
    };
    const da = makeDA();
    await expect(
      da.tradeItem({ fromActorId: 'a1', toActorId: 'a2', itemId: 'ghost-item' })
    ).rejects.toThrow(/not found on/);
  });
});

describe('tradeItem — partial-quantity transfer', () => {
  it('decrements source and creates a new stack on destination', async () => {
    const fromActor = makeActor('a1', 'Hans', [
      { id: 'stack', name: 'Arrows', type: 'ammunition', quantity: 20 },
    ]);
    const toActor = makeActor('a2', 'Maria', []);
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: {
        get: (id: string) => (id === 'a1' ? fromActor : id === 'a2' ? toActor : null),
      },
    };
    const da = makeDA();
    const res = await da.tradeItem({
      fromActorId: 'a1',
      toActorId: 'a2',
      itemId: 'stack',
      quantity: 5,
    });
    const srcItem = fromActor._itemMap.get('stack');
    expect(srcItem?.update).toHaveBeenCalledWith({ 'system.quantity.value': 15 });
    expect(toActor.createEmbeddedDocuments).toHaveBeenCalledOnce();
    expect(res.quantities).toEqual({ from: 15, to: 5 });
  });

  it('full-transfer path used when quantity equals source quantity', async () => {
    const fromActor = makeActor('a1', 'Hans', [
      { id: 'stack', name: 'Arrows', type: 'ammunition', quantity: 10 },
    ]);
    const toActor = makeActor('a2', 'Maria', []);
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: {
        get: (id: string) => (id === 'a1' ? fromActor : id === 'a2' ? toActor : null),
      },
    };
    const da = makeDA();
    await da.tradeItem({
      fromActorId: 'a1',
      toActorId: 'a2',
      itemId: 'stack',
      quantity: 10,
    });
    // quantity === sourceQty triggers the full-transfer branch (not partial)
    expect(fromActor.deleteEmbeddedDocuments).toHaveBeenCalledOnce();
  });
});

describe('tradeItem — encumbrance stays system-owned (HC3)', () => {
  it('handler does not write to actor.system.status.encumbrance.current', async () => {
    const fromActor: any = makeActor('a1', 'Hans', [
      { id: 'item1', name: 'Armour', type: 'armour', quantity: 1 },
    ]);
    const toActor: any = makeActor('a2', 'Maria', []);
    fromActor.update = vi.fn();
    toActor.update = vi.fn();
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: {
        get: (id: string) => (id === 'a1' ? fromActor : id === 'a2' ? toActor : null),
      },
    };
    const da = makeDA();
    await da.tradeItem({ fromActorId: 'a1', toActorId: 'a2', itemId: 'item1' });
    // Neither actor.update nor any direct encumbrance-field write occurred.
    // Foundry prepareData recomputes encumbrance on item-list change.
    expect(fromActor.update).not.toHaveBeenCalled();
    expect(toActor.update).not.toHaveBeenCalled();
  });
});

describe('tradeItem — BUG-213 duplication guard (partial-quantity silent drop)', () => {
  it('throws TRADE_ITEM_SOURCE_DECREMENT_NOT_PERSISTED and does NOT call createEmbeddedDocuments when update() returns undefined', async () => {
    // Simulate a preUpdate hook cancelling the source decrement (update returns undefined).
    // Without the guard, handler would unconditionally create on destination → item duplication.
    const fromActor = makeActor('a1', 'Hans', [
      { id: 'stack', name: 'Arrows', type: 'ammunition', quantity: 5 },
    ]);
    const toActor = makeActor('a2', 'Maria', []);

    // Override update to return undefined (hook-cancelled write) without mutating qty.
    const srcItem: any = fromActor._itemMap.get('stack');
    srcItem.update = vi.fn(async () => undefined);

    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: {
        get: (id: string) => (id === 'a1' ? fromActor : id === 'a2' ? toActor : null),
      },
    };
    const da = makeDA();

    await expect(
      da.tradeItem({ fromActorId: 'a1', toActorId: 'a2', itemId: 'stack', quantity: 2 }),
    ).rejects.toThrow(/TRADE_ITEM_SOURCE_DECREMENT_NOT_PERSISTED/);

    // The duplication invariant: destination create must NOT have been called.
    expect(toActor.createEmbeddedDocuments).not.toHaveBeenCalled();
  });
});
