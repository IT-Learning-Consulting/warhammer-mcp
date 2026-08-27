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

// ── systemic_bug_class_prevention v2 Phase 4 (D2, BUG-784 residual) — the 4 precise veto tokens ──
//
// falseReturnCause()/falseReturnMessage()/falseReturnEnvelope() now accept an optional
// `targetUuid`; when a GM is confirmed active, it is probed (in specificity order:
// isValidItemPile / isItemPileLocked / isItemPileClosed / isItemPileMerchant) for the most
// specific detectable veto cause. These cases prove (i) each of the 4 new tokens fires under its
// mocked predicate, (ii) NO_ACTIVE_GM still fires when the GM is genuinely inactive — even with a
// targetUuid supplied and a predicate that would otherwise match (old exit-state preserved,
// NO_ACTIVE_GM is checked BEFORE any probing), and (iii) ITEM_PILES_OPERATION_VETOED still fires
// when the GM is active and no predicate matches (old exit-state preserved, unchanged from the
// pre-Phase-4 2-way split).
describe('BUG-784 Phase 4 (D2) — precise veto-token reachability via targetUuid', () => {
  it('emits ITEM_PILES_INVALID_TARGET when isValidItemPile is false', () => {
    (globalThis as any).game = {
      user: { isGM: true },
      users: [{ isGM: true, active: true }],
      itempiles: { API: { isValidItemPile: () => false } },
    };
    const { noActiveGm, token } = falseReturnCause('Actor.notapile');
    expect(noActiveGm).toBe(false);
    expect(token).toBe('ITEM_PILES_INVALID_TARGET');

    const msg = falseReturnMessage('set-pile-state (open)', 'Actor.notapile', undefined, 'Actor.notapile');
    expect(msg).toMatch(/^ITEM_PILES_INVALID_TARGET:/);
    expect(msg).not.toContain('NO_ACTIVE_GM');
  });

  it('emits ITEM_PILES_TARGET_LOCKED when isItemPileLocked is true (isValidItemPile true, so it does not shadow it)', () => {
    (globalThis as any).game = {
      user: { isGM: true },
      users: [{ isGM: true, active: true }],
      itempiles: { API: { isValidItemPile: () => true, isItemPileLocked: () => true } },
    };
    const { token } = falseReturnCause('Actor.locked');
    expect(token).toBe('ITEM_PILES_TARGET_LOCKED');

    const env = falseReturnEnvelope('add-items', 'Actor.locked', undefined, 'Actor.locked');
    expect((env as any).error).toMatch(/^ITEM_PILES_TARGET_LOCKED:/);
    expect((env as any).error).toContain('is currently locked');
  });

  it('emits ITEM_PILES_TARGET_CLOSED when isItemPileClosed is true (isValidItemPile true, isItemPileLocked false)', () => {
    (globalThis as any).game = {
      user: { isGM: true },
      users: [{ isGM: true, active: true }],
      itempiles: {
        API: { isValidItemPile: () => true, isItemPileLocked: () => false, isItemPileClosed: () => true },
      },
    };
    const { token } = falseReturnCause('Actor.closed');
    expect(token).toBe('ITEM_PILES_TARGET_CLOSED');

    const env = falseReturnEnvelope('remove-items', 'Actor.closed', undefined, 'Actor.closed');
    expect((env as any).error).toMatch(/^ITEM_PILES_TARGET_CLOSED:/);
    expect((env as any).error).toContain('is currently closed');
  });

  it('emits ITEM_PILES_NOT_A_MERCHANT when isItemPileMerchant is false (the 3 earlier predicates all pass)', () => {
    (globalThis as any).game = {
      user: { isGM: true },
      users: [{ isGM: true, active: true }],
      itempiles: {
        API: {
          isValidItemPile: () => true,
          isItemPileLocked: () => false,
          isItemPileClosed: () => false,
          isItemPileMerchant: () => false,
        },
      },
    };
    const { token } = falseReturnCause('Actor.notmerchant');
    expect(token).toBe('ITEM_PILES_NOT_A_MERCHANT');

    const env = falseReturnEnvelope('trade-items', 'Actor.notmerchant', undefined, 'Actor.notmerchant');
    expect((env as any).error).toMatch(/^ITEM_PILES_NOT_A_MERCHANT:/);
    expect((env as any).error).toContain('does not resolve as an item-pile merchant');
  });

  it('falls back to ITEM_PILES_OPERATION_VETOED when a GM is active and no predicate matches (old exit-state preserved)', () => {
    (globalThis as any).game = {
      user: { isGM: true },
      users: [{ isGM: true, active: true }],
      itempiles: {
        API: {
          isValidItemPile: () => true,
          isItemPileLocked: () => false,
          isItemPileClosed: () => false,
          isItemPileMerchant: () => true,
        },
      },
    };
    const { noActiveGm, token } = falseReturnCause('Actor.healthy');
    expect(noActiveGm).toBe(false);
    expect(token).toBe('ITEM_PILES_OPERATION_VETOED');

    const env = falseReturnEnvelope('add-items', 'Actor.healthy', undefined, 'Actor.healthy');
    expect((env as any).error).toMatch(/^ITEM_PILES_OPERATION_VETOED:/);
  });

  it('a probe that throws is UNDETECTED, not a match — probing continues to the next predicate', () => {
    (globalThis as any).game = {
      user: { isGM: true },
      users: [{ isGM: true, active: true }],
      itempiles: {
        API: {
          isValidItemPile: () => { throw new Error('token-less target'); },
          isItemPileLocked: () => true,
        },
      },
    };
    const { token } = falseReturnCause('Actor.throwsOnFirstProbe');
    expect(token).toBe('ITEM_PILES_TARGET_LOCKED');
  });

  it('still yields NO_ACTIVE_GM when the GM is genuinely inactive, even with a targetUuid whose predicate would otherwise match (old exit-state preserved — NO_ACTIVE_GM is decided before any probing)', () => {
    (globalThis as any).game = {
      user: { isGM: true },
      users: [{ isGM: true, active: false }],
      itempiles: { API: { isValidItemPile: () => false, isItemPileLocked: () => true } },
    };
    const { noActiveGm, token } = falseReturnCause('Actor.wouldBeLocked');
    expect(noActiveGm).toBe(true);
    expect(token).toBe('NO_ACTIVE_GM');

    const msg = falseReturnMessage('add-items', 'Actor.wouldBeLocked', undefined, 'Actor.wouldBeLocked');
    expect(msg).toMatch(/^NO_ACTIVE_GM:/);
    expect(msg).not.toContain('ITEM_PILES_TARGET_LOCKED');
  });

  it('no targetUuid supplied → skips probing entirely and falls back to ITEM_PILES_OPERATION_VETOED (backward-compatible 2-arg call shape)', () => {
    (globalThis as any).game = {
      user: { isGM: true },
      users: [{ isGM: true, active: true }],
      itempiles: { API: { isValidItemPile: () => false } }, // would match if probed
    };
    const { token } = falseReturnCause();
    expect(token).toBe('ITEM_PILES_OPERATION_VETOED');
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
  it('BUG-784 (D3): a non-merchant target is refused pre-call with ITEM_PILES_NOT_A_MERCHANT — the API write is never attempted', async () => {
    const refreshMerchantInventory = async () => { throw new Error('should never be called — D3 pre-check must refuse first'); };
    (globalThis as any).game = {
      user: { isGM: true },
      users: [{ isGM: true, active: true }],
      itempiles: { API: { getActorItems: () => [], isItemPileMerchant: () => false, refreshMerchantInventory } },
    };
    const result: any = await handleRefreshMerchant({ action: 'refresh-merchant', merchantUuid: 'Actor.notamerchant' } as any);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/^ITEM_PILES_NOT_A_MERCHANT:/);
    expect(result.error).not.toContain('NO_ACTIVE_GM');
  });

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
