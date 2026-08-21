// BUG-784 — every socket-routed item-piles API call resolves a bare `false` for MULTIPLE
// distinct causes upstream never distinguishes (a disconnected GM mid-call, a hook veto, a
// non-lootable-target refusal, or another business-condition failure). Every false-return site
// across flow.ts/merchant.ts/container.ts previously translated ALL of these uniformly to
// NO_ACTIVE_GM, asserting a network/principal cause the response cannot actually know.
//
// Fix: falseReturnCause()/falseReturnMessage()/falseReturnEnvelope() (flow.ts) re-run the exact
// same active-GM check activeGmRequired() already performs BEFORE the call, but AFTER the bare
// `false` comes back. If a GM is still active post-call, the false is classified as a neutral
// ITEM_PILES_OPERATION_VETOED business-condition veto (operation + target context, no GM-
// disconnect claim). Only a GM that has genuinely gone inactive between the pre-check and the
// call still yields NO_ACTIVE_GM.
//
// This file directly unit-tests the shared classification functions, then proves a
// representative call site per DISTINCT shape across all three handler files actually routes
// through them: a plain item mutation (flow.ts: handleAddItems), a plain currency mutation
// (flow.ts: handleAddCurrency), the internal denomination-creation THROW site
// (flow.ts: applyAbsoluteCurrencies via handleRemoveCurrency), the embedded
// ITEM_PILES_PARTIAL_TRANSFER add-side site (flow.ts: handleTransferCurrency), a merchant
// refresh (merchant.ts: handleRefreshMerchant), a scripted trade (merchant.ts:
// handleTradeItems), pile creation WITH the BUG-779 rollback still firing (container.ts:
// handleCreatePile), a pile config update (container.ts: handleUpdatePile), and a container
// state change (container.ts: handleSetPileState). The remaining sites sharing an identical
// `falseReturnEnvelope(...)` call shape (remove-items, transfer-items, split-loot,
// roll-item-table, update-price-modifiers, transfer-currency's final result===false branch,
// set-pile-state's turnTokens/revertTokens branch) are covered by the direct unit tests of the
// shared function plus a static source-grep proving no site regressed to an inline
// 'NO_ACTIVE_GM: ... GM may have disconnected' literal.

import { describe, it, expect, afterEach } from 'vitest';
import { falseReturnMessage, falseReturnEnvelope, falseReturnCause, handleAddItems, handleAddCurrency, handleRemoveCurrency, handleTransferCurrency } from '../flow.js';
import { handleRefreshMerchant, handleTradeItems } from '../merchant.js';
import { handleCreatePile, handleUpdatePile, handleSetPileState } from '../container.js';

afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).fromUuid;
  delete (globalThis as any).fromUuidSync;
  delete (globalThis as any).Actor;
});

// ── Direct unit tests of the shared classification functions ──────────────────────────────────

describe('BUG-784 — falseReturnCause/falseReturnMessage/falseReturnEnvelope', () => {
  it('classifies a false-return as a business-condition veto (NOT NO_ACTIVE_GM) when a GM is still active', () => {
    (globalThis as any).game = { user: { isGM: true }, users: [{ isGM: true, active: true }] };

    const { noActiveGm, clause } = falseReturnCause();
    expect(noActiveGm).toBe(false);
    expect(clause).not.toMatch(/disconnect/i);

    const msg = falseReturnMessage('add-items', 'Actor.pile');
    expect(msg).toMatch(/^ITEM_PILES_OPERATION_VETOED:/);
    expect(msg).not.toContain('NO_ACTIVE_GM');
    expect(msg).not.toMatch(/disconnect/i);
    expect(msg).toContain('add-items');
    expect(msg).toContain('Actor.pile');

    const env = falseReturnEnvelope('add-items', 'Actor.pile', 'extra detail');
    expect(env.success).toBe(false);
    expect((env as any).error).toContain('ITEM_PILES_OPERATION_VETOED');
    expect((env as any).error).toContain('extra detail');
  });

  it('classifies a false-return as NO_ACTIVE_GM only when a re-check finds no active GM', () => {
    (globalThis as any).game = { user: { isGM: true }, users: [{ isGM: true, active: false }] };

    const { noActiveGm } = falseReturnCause();
    expect(noActiveGm).toBe(true);

    const msg = falseReturnMessage('refresh-merchant', 'Actor.merchant');
    expect(msg).toMatch(/^NO_ACTIVE_GM:/);
    expect(msg).not.toContain('ITEM_PILES_OPERATION_VETOED');

    const env = falseReturnEnvelope('refresh-merchant', 'Actor.merchant');
    expect((env as any).error).toMatch(/^NO_ACTIVE_GM:/);
  });
});

// ── flow.ts: plain item mutation (handleAddItems) ──────────────────────────────────────────────

describe('handleAddItems — BUG-784 (flow.ts)', () => {
  it('a hook-veto false (GM stays active) yields ITEM_PILES_OPERATION_VETOED, not NO_ACTIVE_GM', async () => {
    (globalThis as any).game = {
      user: { isGM: true },
      users: [{ isGM: true, active: true }],
      itempiles: { API: { getActorItems: () => [], addItems: async () => false } },
    };
    const result: any = await handleAddItems({ action: 'add-items', actorUuid: 'Actor.pile', items: [] } as any);
    expect(result.success).toBe(false);
    expect(result.error).toContain('ITEM_PILES_OPERATION_VETOED');
    expect(result.error).not.toContain('NO_ACTIVE_GM');
  });

  it('a genuine GM disconnect mid-call still yields NO_ACTIVE_GM', async () => {
    const users = [{ isGM: true, active: true }];
    const api = {
      getActorItems: () => [],
      addItems: async () => { users[0].active = false; return false; },
    };
    (globalThis as any).game = { user: { isGM: true }, users, itempiles: { API: api } };
    const result: any = await handleAddItems({ action: 'add-items', actorUuid: 'Actor.pile', items: [] } as any);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/^NO_ACTIVE_GM:/);
  });
});

// ── flow.ts: plain currency mutation (handleAddCurrency) ───────────────────────────────────────

describe('handleAddCurrency — BUG-784 (flow.ts)', () => {
  it('a hook-veto false stays neutral', async () => {
    (globalThis as any).game = {
      user: { isGM: true },
      users: [{ isGM: true, active: true }],
      itempiles: { API: { getActorCurrencies: () => [], addCurrencies: async () => false } },
    };
    const result: any = await handleAddCurrency({ action: 'add-currency', actorUuid: 'Actor.x', currencies: '5gc' } as any);
    expect(result.success).toBe(false);
    expect(result.error).toContain('ITEM_PILES_OPERATION_VETOED');
  });

  it('a genuine GM disconnect still yields NO_ACTIVE_GM', async () => {
    const users = [{ isGM: true, active: true }];
    const api = {
      getActorCurrencies: () => [],
      addCurrencies: async () => { users[0].active = false; return false; },
    };
    (globalThis as any).game = { user: { isGM: true }, users, itempiles: { API: api } };
    const result: any = await handleAddCurrency({ action: 'add-currency', actorUuid: 'Actor.x', currencies: '5gc' } as any);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/^NO_ACTIVE_GM:/);
  });
});

// ── flow.ts: internal denomination-creation THROW site (applyAbsoluteCurrencies, via
//    handleRemoveCurrency) — mock shape borrowed from remove-currency-getall.test.ts (BUG-769) ──

describe('handleRemoveCurrency — BUG-784 denomination-creation throw site (flow.ts)', () => {
  function currentCurrencies() {
    return [
      { id: 'item-gc', abbreviation: 'gc', quantity: 1, exchangeRate: 240, type: 'item' },
      { id: undefined, abbreviation: 'ss', quantity: 0, exchangeRate: 1, type: 'item' },
    ];
  }
  function mockApi(addCurrencies: any) {
    return {
      getActorCurrencies: () => currentCurrencies(),
      getStringFromCurrencies: () => '1gc 0ss',
      getCurrenciesFromString: (s: string) => {
        if (s === '1ss') return [{ abbreviation: 'ss', quantity: 1, exchangeRate: 1 }];
        if (s === '19ss') return [{ abbreviation: 'ss', quantity: 19, exchangeRate: 1 }];
        if (s === '0gc 19ss') return [{ abbreviation: 'gc', quantity: 0, exchangeRate: 240 }, { abbreviation: 'ss', quantity: 19, exchangeRate: 1 }];
        return [];
      },
      calculateCurrencies: () => '0gc 19ss',
      CURRENCIES: [{ abbreviation: 'gc' }, { abbreviation: 'ss' }],
      ITEM_QUANTITY_ATTRIBUTE: 'system.quantity.value',
      addCurrencies,
    };
  }

  it('a hook-veto false while creating the missing "ss" denomination surfaces ITEM_PILES_OPERATION_VETOED', async () => {
    (globalThis as any).game = { user: { isGM: true }, users: [{ isGM: true, active: true }] };
    (globalThis as any).game.itempiles = { API: mockApi(async () => false) };
    (globalThis as any).fromUuid = async () => ({ updateEmbeddedDocuments: async () => {} });

    const result: any = await handleRemoveCurrency({ action: 'remove-currency', actorUuid: 'Actor.x', currencies: '1ss', confirm: true } as any);
    expect(result.success).toBe(false);
    expect(result.error).toContain('ITEM_PILES_OPERATION_VETOED');
    expect(result.error).not.toContain('NO_ACTIVE_GM');
  });

  it('a genuine GM disconnect mid-creation still surfaces NO_ACTIVE_GM', async () => {
    const users = [{ isGM: true, active: true }];
    (globalThis as any).game = { user: { isGM: true }, users };
    (globalThis as any).game.itempiles = {
      API: mockApi(async () => { users[0].active = false; return false; }),
    };
    (globalThis as any).fromUuid = async () => ({ updateEmbeddedDocuments: async () => {} });

    const result: any = await handleRemoveCurrency({ action: 'remove-currency', actorUuid: 'Actor.x', currencies: '1ss', confirm: true } as any);
    expect(result.success).toBe(false);
    expect(result.error).toContain('NO_ACTIVE_GM');
  });
});

// ── flow.ts: embedded ITEM_PILES_PARTIAL_TRANSFER add-side site (handleTransferCurrency) ───────

describe('handleTransferCurrency (mode:transfer) — BUG-784 embedded ITEM_PILES_PARTIAL_TRANSFER add-side (flow.ts)', () => {
  function mockApi(addCurrencies: any, sourceEntries: any[]) {
    return {
      getActorCurrencies: (uuid: string) => (uuid === 'Actor.source' ? sourceEntries : []),
      getStringFromCurrencies: () => '1gc',
      getCurrenciesFromString: (s: string) => {
        if (s === '1gc') return [{ abbreviation: 'gc', quantity: 1, exchangeRate: 240 }];
        if (s === '0gc') return [{ abbreviation: 'gc', quantity: 0, exchangeRate: 240 }];
        return [];
      },
      calculateCurrencies: () => '0gc',
      CURRENCIES: [{ abbreviation: 'gc' }],
      ITEM_QUANTITY_ATTRIBUTE: 'system.quantity.value',
      addCurrencies,
    };
  }
  function mockFromUuid(sourceEntries: any[]) {
    return async () => ({
      updateEmbeddedDocuments: async (_type: string, updates: any[]) => {
        for (const u of updates) if (u._id === 'item-gc') sourceEntries[0].quantity = u['system.quantity.value'];
      },
    });
  }

  it('a hook-veto false on the add side surfaces the neutral clause, never claiming "no-active-GM"', async () => {
    const sourceEntries = [{ id: 'item-gc', abbreviation: 'gc', quantity: 1, exchangeRate: 240, type: 'item' }];
    (globalThis as any).game = { user: { isGM: true }, users: [{ isGM: true, active: true }] };
    (globalThis as any).game.itempiles = { API: mockApi(async () => false, sourceEntries) };
    (globalThis as any).fromUuid = mockFromUuid(sourceEntries);

    const result: any = await handleTransferCurrency({
      action: 'transfer-currency', sourceUuid: 'Actor.source', targetUuid: 'Actor.target', currencies: '1gc', confirm: true,
    } as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('ITEM_PILES_PARTIAL_TRANSFER');
    expect(result.error).not.toContain('no-active-GM');
    expect(result.error).toContain('was refused by item-piles');
  });

  it('a genuine GM disconnect on the add side still names an actually-detected no-active-GM condition', async () => {
    const sourceEntries = [{ id: 'item-gc', abbreviation: 'gc', quantity: 1, exchangeRate: 240, type: 'item' }];
    const users = [{ isGM: true, active: true }];
    (globalThis as any).game = { user: { isGM: true }, users };
    (globalThis as any).game.itempiles = {
      API: mockApi(async () => { users[0].active = false; return false; }, sourceEntries),
    };
    (globalThis as any).fromUuid = mockFromUuid(sourceEntries);

    const result: any = await handleTransferCurrency({
      action: 'transfer-currency', sourceUuid: 'Actor.source', targetUuid: 'Actor.target', currencies: '1gc', confirm: true,
    } as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('ITEM_PILES_PARTIAL_TRANSFER');
    expect(result.error).toContain('no active GM client is currently detected');
  });
});

// ── merchant.ts: handleRefreshMerchant ──────────────────────────────────────────────────────────

describe('handleRefreshMerchant — BUG-784 (merchant.ts)', () => {
  it('a hook-veto false stays neutral', async () => {
    (globalThis as any).game = {
      user: { isGM: true },
      users: [{ isGM: true, active: true }],
      itempiles: { API: { getActorItems: () => [], isItemPileMerchant: () => true, refreshMerchantInventory: async () => false } },
    };
    const result: any = await handleRefreshMerchant({ action: 'refresh-merchant', merchantUuid: 'Actor.merchant' } as any);
    expect(result.success).toBe(false);
    expect(result.error).toContain('ITEM_PILES_OPERATION_VETOED');
  });

  it('a genuine GM disconnect still yields NO_ACTIVE_GM', async () => {
    const users = [{ isGM: true, active: true }];
    const api = {
      getActorItems: () => [],
      isItemPileMerchant: () => true,
      refreshMerchantInventory: async () => { users[0].active = false; return false; },
    };
    (globalThis as any).game = { user: { isGM: true }, users, itempiles: { API: api } };
    const result: any = await handleRefreshMerchant({ action: 'refresh-merchant', merchantUuid: 'Actor.merchant' } as any);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/^NO_ACTIVE_GM:/);
  });
});

// ── merchant.ts: handleTradeItems ──────────────────────────────────────────────────────────────

describe('handleTradeItems — BUG-784 (merchant.ts)', () => {
  function baseApi(overrides: any = {}) {
    return {
      isItemPileMerchant: () => true,
      getActorItems: () => [],
      getActorCurrencies: () => [],
      tradeItems: async () => false,
      ...overrides,
    };
  }

  it('a pre-trade-hook veto false stays neutral', async () => {
    (globalThis as any).game = { user: { isGM: true }, users: [{ isGM: true, active: true }], itempiles: { API: baseApi() } };
    const result: any = await handleTradeItems({
      action: 'trade-items', merchantUuid: 'Actor.merchant', buyerUuid: 'Actor.buyer', items: [{ itemId: 'i1', quantity: 1 }], confirm: true,
    } as any);
    expect(result.success).toBe(false);
    expect(result.error).toContain('ITEM_PILES_OPERATION_VETOED');
  });

  it('a genuine GM disconnect still yields NO_ACTIVE_GM', async () => {
    const users = [{ isGM: true, active: true }];
    const api = baseApi({ tradeItems: async () => { users[0].active = false; return false; } });
    (globalThis as any).game = { user: { isGM: true }, users, itempiles: { API: api } };
    const result: any = await handleTradeItems({
      action: 'trade-items', merchantUuid: 'Actor.merchant', buyerUuid: 'Actor.buyer', items: [{ itemId: 'i1', quantity: 1 }], confirm: true,
    } as any);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/^NO_ACTIVE_GM:/);
  });
});

// ── container.ts: handleCreatePile — BUG-779 rollback must still fire regardless of classification

describe('handleCreatePile — BUG-784 classification, BUG-779 rollback preserved (container.ts)', () => {
  class FakeActor {
    uuid: string;
    deleted = false;
    constructor(public name: string) { this.uuid = `Actor.created.${name}`; }
    async setFlag() { /* no-op */ }
    async delete() { this.deleted = true; }
  }
  let lastCreated: FakeActor | null = null;
  (FakeActor as any).create = async (data: any) => {
    lastCreated = new FakeActor(data.name);
    return lastCreated;
  };

  it('a hook-veto false still rolls back the pre-created dedicated actor, and classifies as a business veto', async () => {
    lastCreated = null;
    (globalThis as any).Actor = FakeActor;
    (globalThis as any).game = {
      user: { isGM: true },
      users: [{ isGM: true, active: true }],
      itempiles: { API: { createItemPile: async () => false } },
    };

    const result: any = await handleCreatePile({
      action: 'create-pile', sceneId: 'Scene.s1', createDedicatedActor: true, pileActorName: 'Loot Chest',
    } as any);

    expect(lastCreated?.deleted).toBe(true);
    expect(result.success).toBe(false);
    expect(result.error).toContain('ITEM_PILES_OPERATION_VETOED');
    expect(result.error).not.toContain('NO_ACTIVE_GM');
  });

  it('a genuine GM disconnect still rolls back the actor AND yields NO_ACTIVE_GM', async () => {
    lastCreated = null;
    (globalThis as any).Actor = FakeActor;
    const users = [{ isGM: true, active: true }];
    (globalThis as any).game = {
      user: { isGM: true },
      users,
      itempiles: { API: { createItemPile: async () => { users[0].active = false; return false; } } },
    };

    const result: any = await handleCreatePile({
      action: 'create-pile', sceneId: 'Scene.s1', createDedicatedActor: true, pileActorName: 'Loot Chest',
    } as any);

    expect(lastCreated?.deleted).toBe(true);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/^NO_ACTIVE_GM:/);
  });
});

// ── container.ts: handleUpdatePile ──────────────────────────────────────────────────────────────

describe('handleUpdatePile — BUG-784 (container.ts)', () => {
  it('a hook-veto false stays neutral', async () => {
    (globalThis as any).game = {
      user: { isGM: true },
      users: [{ isGM: true, active: true }],
      itempiles: { API: { updateItemPile: async () => false, getActorFlagData: () => ({}) } },
    };
    const result: any = await handleUpdatePile({ action: 'update-pile', actorUuid: 'Actor.pile', type: 'container' } as any);
    expect(result.success).toBe(false);
    expect(result.error).toContain('ITEM_PILES_OPERATION_VETOED');
  });

  it('a genuine GM disconnect still yields NO_ACTIVE_GM', async () => {
    const users = [{ isGM: true, active: true }];
    const api = { updateItemPile: async () => { users[0].active = false; return false; }, getActorFlagData: () => ({}) };
    (globalThis as any).game = { user: { isGM: true }, users, itempiles: { API: api } };
    const result: any = await handleUpdatePile({ action: 'update-pile', actorUuid: 'Actor.pile', type: 'container' } as any);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/^NO_ACTIVE_GM:/);
  });
});

// ── container.ts: handleSetPileState (open/close/lock/unlock/rattle branch) ────────────────────

describe('handleSetPileState (open) — BUG-784 (container.ts)', () => {
  it('a hook-veto false on a VERIFIED container stays neutral (BUG-447 pre-check already ruled out "not a container")', async () => {
    (globalThis as any).game = {
      user: { isGM: true },
      users: [{ isGM: true, active: true }],
      itempiles: { API: { isItemPileContainer: () => true, getActorFlagData: () => ({}), openItemPile: async () => false } },
    };
    const result: any = await handleSetPileState({ action: 'set-pile-state', actorUuid: 'Actor.container', state: 'open' } as any);
    expect(result.success).toBe(false);
    expect(result.error).toContain('ITEM_PILES_OPERATION_VETOED');
  });

  it('a genuine GM disconnect still yields NO_ACTIVE_GM', async () => {
    const users = [{ isGM: true, active: true }];
    const api = {
      isItemPileContainer: () => true,
      getActorFlagData: () => ({}),
      openItemPile: async () => { users[0].active = false; return false; },
    };
    (globalThis as any).game = { user: { isGM: true }, users, itempiles: { API: api } };
    const result: any = await handleSetPileState({ action: 'set-pile-state', actorUuid: 'Actor.container', state: 'open' } as any);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/^NO_ACTIVE_GM:/);
  });
});
