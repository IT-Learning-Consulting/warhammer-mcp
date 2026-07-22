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
    // RC1.1a: create/delete now need to mutate the SAME backing itemMap that items.get() reads,
    // so the post-write dest re-read (create) and source absence check (delete) both see reality.
    createEmbeddedDocuments: vi.fn(async (_type: string, payloads: any[]) =>
      payloads.map((p, i) => {
        const newId = `${id}-new-${i}`;
        const created = {
          id: newId,
          name: p.name,
          type: p.type,
          toObject: () => ({ ...p, _id: newId }),
        };
        itemMap.set(newId, created);
        return created;
      })
    ),
    deleteEmbeddedDocuments: vi.fn(async (_type: string, ids: string[]) => {
      for (const delId of ids) itemMap.delete(delId);
      return ids.map((delId) => ({ id: delId }));
    }),
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

  it('leaves the source untouched when destination creation fails (BUG-642 full)', async () => {
    const fromActor = makeActor('a1', 'Hans', [
      { id: 'item1', name: 'Longsword', type: 'weapon', quantity: 1 },
    ]);
    const toActor = makeActor('a2', 'Maria', []);
    toActor.createEmbeddedDocuments = vi.fn(async () => {
      throw new Error('destination rejects item');
    });
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: (id: string) => (id === 'a1' ? fromActor : id === 'a2' ? toActor : null) },
    };

    await expect(makeDA().tradeItem({ fromActorId: 'a1', toActorId: 'a2', itemId: 'item1' }))
      .rejects.toThrow(/destination rejects item/);

    expect(fromActor.items.get('item1')).not.toBeNull();
    expect(fromActor.deleteEmbeddedDocuments).not.toHaveBeenCalled();
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

  it('leaves source quantity untouched when destination creation fails (BUG-642 partial)', async () => {
    const fromActor = makeActor('a1', 'Hans', [
      { id: 'stack', name: 'Arrows', type: 'ammunition', quantity: 20 },
    ]);
    const toActor = makeActor('a2', 'Maria', []);
    toActor.createEmbeddedDocuments = vi.fn(async () => {
      throw new Error('destination rejects stack');
    });
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: (id: string) => (id === 'a1' ? fromActor : id === 'a2' ? toActor : null) },
    };

    await expect(makeDA().tradeItem({
      fromActorId: 'a1', toActorId: 'a2', itemId: 'stack', quantity: 5,
    })).rejects.toThrow(/destination rejects stack/);

    const srcItem: any = fromActor._itemMap.get('stack');
    expect(srcItem.system.quantity.value).toBe(20);
    expect(srcItem.update).not.toHaveBeenCalled();
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
  it('compensates the destination copy when the source decrement is rejected', async () => {
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

    // BUG-642 requires destination-first ordering; BUG-213 now compensates that copy.
    expect(toActor.createEmbeddedDocuments).toHaveBeenCalledOnce();
    expect(toActor.deleteEmbeddedDocuments).toHaveBeenCalledOnce();
    expect(toActor._itemMap.size).toBe(0);
    expect((fromActor._itemMap.get('stack') as any).system.quantity.value).toBe(5);
  });
});
