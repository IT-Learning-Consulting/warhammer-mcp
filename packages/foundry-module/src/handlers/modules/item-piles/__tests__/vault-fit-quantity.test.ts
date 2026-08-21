// BUG-781 — vault fit-check/fit-items ignored the requested quantity while still claiming it
// in the result, and fit-items sent `[{item:itemDoc,quantity}]` to fitItemsIntoVault even though
// upstream expects each array entry to itself be an Item/item-data object (a placement
// CALCULATION, not a write — item-piles.js:36270-36315, 99588-99592).
//
// Why: canItemFitInVault has no quantity argument at all — it only ever answers "does ONE unit
// of this item type fit". A caller requesting quantity 5 of a non-stackable item (each unit
// needs its own grid cell) could be told "fits" after a single-unit check even with only 1 free
// cell. The fix models the requested quantity the way upstream's own addItems() does
// (setItemQuantity + fitItemsIntoVault): a stackable item type gets ONE entry carrying the full
// quantity (a stack occupies one cell regardless of value); a non-stackable item type gets N
// repeated single-unit entries (each needs its own cell). This fixture proves: (1) the
// covered-cell count in the returned plan reflects the requested N for a non-stackable item, not
// 1; (2) fitItemsIntoVault receives real item-data entries (never the old {item,quantity}
// wrapper) — proven via the mock's received args; (3) insufficient space for N units is
// correctly rejected (VAULT_FULL) even though a single unit would fit.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { handleVaultInfo } from '../merchant.js';
import { installItemPilesGame, baseApi } from './verify-harness.js';

function makeItemDoc(overrides: Record<string, any> = {}) {
  return {
    id: 'item1',
    _id: 'item1',
    name: 'Rusty Dagger',
    type: 'weapon',
    system: { quantity: { value: 1 } },
    toObject: () => ({
      _id: 'item1',
      name: 'Rusty Dagger',
      type: 'weapon',
      system: { quantity: { value: 1 } },
    }),
    ...overrides,
  };
}

afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).fromUuidSync;
});

describe('handleVaultInfo fit-check/fit-items — BUG-781 quantity + item-shape fix', () => {
  it('fit-check: non-stackable item, quantity 5 — covered-cell count reflects 5, not 1', async () => {
    const fitItemsIntoVault = vi.fn().mockReturnValue({
      updates: [{}, {}, {}, {}, {}],
      deletions: [],
    });
    const api = baseApi({
      canItemFitInVault: vi.fn().mockReturnValue(true),
      canItemStack: vi.fn().mockReturnValue(false), // non-stackable
      ITEM_QUANTITY_ATTRIBUTE: 'system.quantity.value',
      fitItemsIntoVault,
      getVaultGridData: vi.fn().mockReturnValue({ cols: 4, rows: 4, items: [] }),
    });
    const teardown = installItemPilesGame(api);
    (globalThis as any).fromUuidSync = vi.fn().mockReturnValue(makeItemDoc());

    const result: any = await handleVaultInfo({
      action: 'vault-info',
      subAction: 'fit-check',
      actorUuid: 'Actor.vault',
      itemUuid: 'Item.abc',
      quantity: 5,
    } as any);

    expect(result.success).toBe(true);
    expect(result.data.quantity).toBe(5);
    expect(result.data.coveredCount).toBe(5);
    expect(result.data.stackable).toBe(false);

    // The mock must have received 5 real item-data entries (never the old {item,quantity} wrapper).
    expect(fitItemsIntoVault).toHaveBeenCalledTimes(1);
    const [entriesArg, vaultActorArg] = fitItemsIntoVault.mock.calls[0]!;
    expect(vaultActorArg).toBe('Actor.vault');
    expect(Array.isArray(entriesArg)).toBe(true);
    expect(entriesArg).toHaveLength(5);
    for (const entry of entriesArg) {
      // Real item-data shape: has type/name/system directly, NOT wrapped under `.item`.
      expect(entry.item).toBeUndefined();
      expect(entry.type).toBe('weapon');
      expect(entry.name).toBe('Rusty Dagger');
      expect(entry.system.quantity.value).toBe(1);
    }

    teardown();
  });

  it('fit-check: stackable item, quantity 5 — ONE entry carries the full quantity, covered count is 1', async () => {
    const fitItemsIntoVault = vi.fn().mockReturnValue({ updates: [{}], deletions: [] });
    const api = baseApi({
      canItemFitInVault: vi.fn().mockReturnValue(true),
      canItemStack: vi.fn().mockReturnValue(true), // stackable
      ITEM_QUANTITY_ATTRIBUTE: 'system.quantity.value',
      fitItemsIntoVault,
      getVaultGridData: vi.fn().mockReturnValue({ cols: 4, rows: 4, items: [] }),
    });
    const teardown = installItemPilesGame(api);
    (globalThis as any).fromUuidSync = vi.fn().mockReturnValue(makeItemDoc());

    const result: any = await handleVaultInfo({
      action: 'vault-info',
      subAction: 'fit-check',
      actorUuid: 'Actor.vault',
      itemUuid: 'Item.abc',
      quantity: 5,
    } as any);

    expect(result.success).toBe(true);
    expect(result.data.stackable).toBe(true);
    expect(result.data.coveredCount).toBe(1);

    const [entriesArg] = fitItemsIntoVault.mock.calls[0]!;
    expect(entriesArg).toHaveLength(1);
    expect(entriesArg[0].system.quantity.value).toBe(5); // full requested quantity baked onto the one entry

    teardown();
  });

  it('fit-check: quantity 5 rejected as VAULT_FULL when only enough space for fewer units (single-unit check alone would have passed)', async () => {
    const api = baseApi({
      canItemFitInVault: vi.fn().mockReturnValue(true), // one unit fits fine
      canItemStack: vi.fn().mockReturnValue(false),
      ITEM_QUANTITY_ATTRIBUTE: 'system.quantity.value',
      fitItemsIntoVault: vi.fn().mockReturnValue(false), // but all 5 do not
      getVaultGridData: vi.fn().mockReturnValue({ cols: 4, rows: 4, items: [] }),
    });
    const teardown = installItemPilesGame(api);
    (globalThis as any).fromUuidSync = vi.fn().mockReturnValue(makeItemDoc());

    const result: any = await handleVaultInfo({
      action: 'vault-info',
      subAction: 'fit-check',
      actorUuid: 'Actor.vault',
      itemUuid: 'Item.abc',
      quantity: 5,
    } as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('VAULT_FULL');
    expect(result.error).toContain('qty: 5');

    teardown();
  });

  it('fit-items: returns the real fitItemsIntoVault plan under data.fitResult (fit-check omits it)', async () => {
    const plan = { updates: [{ a: 1 }, { a: 2 }], deletions: [] };
    const fitItemsIntoVault = vi.fn().mockReturnValue(plan);
    const api = baseApi({
      canItemFitInVault: vi.fn().mockReturnValue(true),
      canItemStack: vi.fn().mockReturnValue(false),
      ITEM_QUANTITY_ATTRIBUTE: 'system.quantity.value',
      fitItemsIntoVault,
      getVaultGridData: vi.fn().mockReturnValue({ cols: 4, rows: 4, items: [] }),
    });
    const teardown = installItemPilesGame(api);
    (globalThis as any).fromUuidSync = vi.fn().mockReturnValue(makeItemDoc());

    const fitItemsResult: any = await handleVaultInfo({
      action: 'vault-info',
      subAction: 'fit-items',
      actorUuid: 'Actor.vault',
      itemUuid: 'Item.abc',
      quantity: 2,
    } as any);
    expect(fitItemsResult.data.fitResult).toEqual(plan);

    const fitCheckResult: any = await handleVaultInfo({
      action: 'vault-info',
      subAction: 'fit-check',
      actorUuid: 'Actor.vault',
      itemUuid: 'Item.abc',
      quantity: 2,
    } as any);
    expect(fitCheckResult.data.fitResult).toBeNull();

    teardown();
  });

  it('rejects a non-positive-integer quantity with INVALID_QUANTITY instead of crashing', async () => {
    const api = baseApi({
      canItemFitInVault: vi.fn().mockReturnValue(true),
      canItemStack: vi.fn().mockReturnValue(false),
      ITEM_QUANTITY_ATTRIBUTE: 'system.quantity.value',
      fitItemsIntoVault: vi.fn(),
      getVaultGridData: vi.fn(),
    });
    const teardown = installItemPilesGame(api);
    (globalThis as any).fromUuidSync = vi.fn().mockReturnValue(makeItemDoc());

    const result: any = await handleVaultInfo({
      action: 'vault-info',
      subAction: 'fit-check',
      actorUuid: 'Actor.vault',
      itemUuid: 'Item.abc',
      quantity: 0,
    } as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('INVALID_QUANTITY');

    teardown();
  });
});
