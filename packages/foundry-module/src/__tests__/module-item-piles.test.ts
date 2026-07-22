// Module Integration v1 Phase 3 — Vitest for module-itempiles.
//
// Covers: guard branches, catalog safety (asymmetric defaults, pre-check gates),
// structured error tokens, and the real game.itempiles.API INSTANCE shape (phase5 lesson).
//
// Key decisions (Rule 9 — tests verify WHY, not just WHAT):
//   - Guard returns MODULE_NOT_ACTIVE when item-piles absent/inactive → prevents raw errors
//     from reaching the caller and exposes the typed MODULE_NOT_ACTIVE token.
//   - Catalog removeExistingActorItems defaults FALSE on refresh-merchant →
//     asymmetric safe default prevents accidental inventory wipe.
//   - split-loot targets required → C8 silent no-op prevention.
//   - delete-pile requires confirm:true → CCR-4 dangerous write gate.
//   - remove-currency requires confirm:true → CCR-4 dangerous write gate.
//   - turnTokens/revertTokens throw CONFIRM_REQUIRED on revert without confirm → CCR-4.
//   - banker/auctioneer pile type → MODULE_DEPENDENCY_NOT_ACTIVE (companion not installed).
//   - REAL API shape: game.itempiles.API methods are INSTANCE methods on an object, not static.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dispatchModuleItempiles } from '../handlers/modules/item-piles/item-piles.js';
import {
  getActionCatalog,
  checkActiveGm,
  normalizeItemsArray,
  validateTokenUuid,
  validateRelativeModifier,
  validateCurrencyString,
} from '../handlers/modules/item-piles/catalog.js';

// ── Mock helpers ──────────────────────────────────────────────────────────────

function makeModulesMap(entries: Record<string, { active: boolean }>) {
  return {
    get: (id: string) => {
      const e = entries[id];
      if (!e) return undefined;
      return { active: e.active };
    },
  };
}

/** Real game.itempiles.API shape — INSTANCE methods on an object (phase5 lesson: NOT static) */
function makeRealItemPilesAPI(overrides: Record<string, any> = {}) {
  return {
    // Pile lifecycle
    createItemPile: vi.fn().mockResolvedValue('Scene.abc.Token.xyz'),
    updateItemPile: vi.fn().mockResolvedValue(undefined),
    deleteItemPile: vi.fn().mockResolvedValue(true),
    turnTokensIntoItemPiles: vi.fn().mockResolvedValue([]),
    revertTokensFromItemPiles: vi.fn().mockResolvedValue([]),
    // Container state
    openItemPile: vi.fn().mockResolvedValue(true),
    closeItemPile: vi.fn().mockResolvedValue(true),
    lockItemPile: vi.fn().mockResolvedValue(true),
    unlockItemPile: vi.fn().mockResolvedValue(true),
    rattleItemPile: vi.fn().mockResolvedValue(true),
    // Item operations
    addItems: vi.fn().mockResolvedValue([]),
    removeItems: vi.fn().mockResolvedValue([]),
    transferItems: vi.fn().mockResolvedValue([]),
    transferAllItems: vi.fn().mockResolvedValue([]),
    combineItemPiles: vi.fn().mockResolvedValue([]),
    // Currency
    addCurrencies: vi.fn().mockResolvedValue(true),
    removeCurrencies: vi.fn().mockResolvedValue(true),
    // Live-verified 2026-07-02 (BUG-423 smoke): _transferCurrencies resolves
    // { itemDeltas, attributeDeltas } — never a boolean.
    transferCurrencies: vi.fn().mockResolvedValue({ itemDeltas: [{ quantity: 2 }], attributeDeltas: {} }),
    transferAllCurrencies: vi.fn().mockResolvedValue({ itemDeltas: [{ quantity: 5 }], attributeDeltas: {} }),
    // Split
    splitItemPileContents: vi.fn().mockResolvedValue(true),
    // Vault
    canItemFitInVault: vi.fn().mockReturnValue(true),
    fitItemsIntoVault: vi.fn().mockReturnValue([]),
    getVaultGridData: vi.fn().mockReturnValue({ cols: 4, rows: 4, items: [] }),
    // Merchant / trade
    rollItemTable: vi.fn().mockResolvedValue([]),
    refreshMerchantInventory: vi.fn().mockResolvedValue(true),
    // Live-verified 2026-07-02 (BUG-423 smoke): _tradeItems resolves
    // { itemDeltas, attributeDeltas, itemPrices } — {itemMoved} never existed.
    tradeItems: vi.fn().mockResolvedValue({ itemDeltas: [{ quantity: 1 }], attributeDeltas: {}, itemPrices: [] }),
    getMerchantPriceModifiers: vi.fn().mockReturnValue({}),
    updateMerchantPriceModifiers: vi.fn().mockResolvedValue(true),
    getPricesForItem: vi.fn().mockReturnValue([]),
    getCostOfItem: vi.fn().mockReturnValue(0),
    // Read helpers
    getActorFlagData: vi.fn().mockReturnValue({ type: 'pile' }),
    getActorItems: vi.fn().mockReturnValue([]),
    getActorCurrencies: vi.fn().mockReturnValue({}),
    // Type checks
    isValidItemPile: vi.fn().mockReturnValue(true),
    isItemPileContainer: vi.fn().mockReturnValue(false),
    isItemPileMerchant: vi.fn().mockReturnValue(false),
    isItemPileVault: vi.fn().mockReturnValue(false),
    isItemPileLocked: vi.fn().mockReturnValue(false),
    isItemPileClosed: vi.fn().mockReturnValue(false),
    isItemPileEmpty: vi.fn().mockReturnValue(false),
    ...overrides,
  };
}

function makeGame(modules: Record<string, { active: boolean }>, api?: any): any {
  return {
    modules: makeModulesMap(modules),
    user: { isGM: true },
    users: [{ isGM: true, active: true }],
    itempiles: api ? { API: api } : undefined,
  };
}

// ── Guard tests ───────────────────────────────────────────────────────────────

describe('module-itempiles guard', () => {
  beforeEach(() => {
    (globalThis as any).game = undefined;
    (globalThis as any).fromUuidSync = undefined;
  });

  it('returns MODULE_NOT_ACTIVE when item-piles module is absent', async () => {
    (globalThis as any).game = makeGame({ 'some-other-module': { active: true } });
    const result = await dispatchModuleItempiles({ action: 'get-contents', actorUuid: 'Actor.abc' });
    expect(result).not.toBeNull();
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/^MODULE_NOT_ACTIVE:/);
    expect(result.error).toContain('item-piles');
  });

  it('returns MODULE_NOT_ACTIVE when item-piles is installed but inactive', async () => {
    (globalThis as any).game = makeGame({ 'item-piles': { active: false } });
    const result = await dispatchModuleItempiles({ action: 'get-contents', actorUuid: 'Actor.abc' });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/^MODULE_NOT_ACTIVE:/);
  });

  it('proceeds past guard when item-piles is active', async () => {
    const api = makeRealItemPilesAPI();
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);
    const result = await dispatchModuleItempiles({ action: 'get-contents', actorUuid: 'Actor.abc' });
    // May fail with GM_REQUIRED or succeed — the point is it went past MODULE_NOT_ACTIVE
    expect(result.error ?? '').not.toMatch(/^MODULE_NOT_ACTIVE:/);
  });
});

// ── Catalog safety tests ──────────────────────────────────────────────────────

describe('catalog safety', () => {
  it('refresh-merchant defaults removeExistingActorItems to FALSE (asymmetric safe default)', () => {
    const catalog = getActionCatalog();
    const entry = catalog['refresh-merchant'];
    expect(entry.dataDefaults.removeExistingActorItems).toBe(false);
    // WHY: the API default is TRUE (wipes inventory); we flip it to false to prevent accidental wipe
  });

  it('add-items defaults removeExistingActorItems to false (safe)', () => {
    const catalog = getActionCatalog();
    expect(catalog['add-items'].dataDefaults.removeExistingActorItems).toBe(false);
  });

  it('create-pile defaults items to []', () => {
    const catalog = getActionCatalog();
    expect(catalog['create-pile'].dataDefaults.items).toEqual([]);
    // WHY: addItems forEach crash (C1) — null/undefined items array throws
  });

  it('catalog covers all 17 actions', () => {
    const catalog = getActionCatalog();
    const expectedActions = [
      'create-pile', 'update-pile', 'delete-pile', 'set-pile-state',
      'get-contents', 'add-items', 'remove-items', 'transfer-items',
      'add-currency', 'remove-currency', 'transfer-currency', 'split-loot',
      'vault-info', 'roll-item-table', 'refresh-merchant', 'trade-items',
      'update-price-modifiers',
    ];
    for (const action of expectedActions) {
      expect(catalog[action], `missing catalog entry for ${action}`).toBeDefined();
    }
    expect(Object.keys(catalog)).toHaveLength(17);
  });
});

// ── Pre-check gate tests ──────────────────────────────────────────────────────

describe('pre-check gates', () => {
  it('checkActiveGm returns NO_ACTIVE_GM when no GM user is active', () => {
    const game = { users: [{ isGM: true, active: false }] };
    const result = checkActiveGm(game);
    expect(result).not.toBeNull();
    expect(result).toContain('NO_ACTIVE_GM');
    // WHY: all socket-routed methods return false (not throw) with no active GM (C11)
  });

  it('checkActiveGm returns null when an active GM is present', () => {
    const game = { users: [{ isGM: true, active: true }] };
    expect(checkActiveGm(game)).toBeNull();
  });

  it('normalizeItemsArray returns [] for null (C1–C4 crash prevention)', () => {
    expect(normalizeItemsArray(null)).toEqual([]);
    expect(normalizeItemsArray(undefined)).toEqual([]);
    expect(normalizeItemsArray([])).toEqual([]);
    // WHY: addItems/removeItems/transferItems/tradeItems all forEach/map — null throws
  });

  it('normalizeItemsArray remaps id→_id when _id absent (C-8 fix)', () => {
    // WHY: removeItems/transferItems read only _id (item-piles.js:98494/98546);
    // callers passing {id} without _id would cause a TypeError crash.
    expect(normalizeItemsArray([{ id: 'abc' }])).toEqual([{ id: 'abc', _id: 'abc' }]);
    // When _id already present, leave as-is (no double-remap)
    expect(normalizeItemsArray([{ _id: 'xyz' }])).toEqual([{ _id: 'xyz' }]);
    // When both present, leave both untouched
    expect(normalizeItemsArray([{ id: 'abc', _id: 'xyz' }])).toEqual([{ id: 'abc', _id: 'xyz' }]);
  });

  it('validateTokenUuid rejects Actor UUID (C10)', () => {
    const result = validateTokenUuid('Actor.abc123');
    expect(result).not.toBeNull();
    expect(result).toContain('INVALID_PILE_UUID');
    // WHY: deleteItemPile hard-checks for Token UUID; Actor UUID silently fails
  });

  it('validateTokenUuid accepts Token UUID', () => {
    expect(validateTokenUuid('Scene.abc.Token.xyz')).toBeNull();
  });

  it('validateRelativeModifier rejects NaN when relative:true (C9)', () => {
    const result = validateRelativeModifier(NaN, 'buyPriceModifier');
    expect(result).not.toBeNull();
    expect(result).toContain('INVALID_MODIFIER');
    // WHY: relative:true with NaN writes NaN to flags, corrupting all future prices
  });

  it('validateRelativeModifier accepts finite numbers', () => {
    expect(validateRelativeModifier(1.5, 'buyPriceModifier')).toBeNull();
    expect(validateRelativeModifier(0, 'sellPriceModifier')).toBeNull();
  });

  it('validateRelativeModifier accepts undefined (omitted = OK)', () => {
    expect(validateRelativeModifier(undefined, 'buyPriceModifier')).toBeNull();
  });

  it('validateCurrencyString rejects empty string', () => {
    expect(validateCurrencyString('')).not.toBeNull();
    expect(validateCurrencyString('   ')).not.toBeNull();
  });

  it('validateCurrencyString accepts WFRP currency strings', () => {
    expect(validateCurrencyString('5gc 3ss 12bp')).toBeNull();
    expect(validateCurrencyString('5GC 3SS 12BP')).toBeNull(); // case-insensitive
    expect(validateCurrencyString('0gc 0ss 1bp')).toBeNull();
  });
});

// ── Structured error token tests ──────────────────────────────────────────────

describe('structured error tokens', () => {
  beforeEach(() => {
    (globalThis as any).game = undefined;
    (globalThis as any).fromUuidSync = undefined;
  });

  it('banker/auctioneer pile type returns MODULE_DEPENDENCY_NOT_ACTIVE', async () => {
    const api = makeRealItemPilesAPI();
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);
    const result = await dispatchModuleItempiles({
      action: 'create-pile',
      sceneId: 'Scene.abc',
      type: 'banker',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('MODULE_DEPENDENCY_NOT_ACTIVE');
    // WHY: banker/auctioneer require companion modules (item_piles_bankers/auctioneer) not installed
  });

  it('delete-pile without confirm returns CONFIRM_REQUIRED', async () => {
    const api = makeRealItemPilesAPI();
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);
    const result = await dispatchModuleItempiles({
      action: 'delete-pile',
      tokenUuid: 'Scene.abc.Token.xyz',
      // confirm intentionally omitted
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('CONFIRM_REQUIRED');
    // WHY: CCR-4 — delete-pile permanently destroys a token; must be intentional
  });

  it('remove-currency without confirm returns CONFIRM_REQUIRED', async () => {
    const api = makeRealItemPilesAPI();
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);
    const result = await dispatchModuleItempiles({
      action: 'remove-currency',
      actorUuid: 'Actor.abc',
      currencies: '5gc',
      // confirm intentionally omitted
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('CONFIRM_REQUIRED');
  });

  it('split-loot without confirm returns CONFIRM_REQUIRED', async () => {
    const api = makeRealItemPilesAPI();
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);
    const result = await dispatchModuleItempiles({
      action: 'split-loot',
      actorUuid: 'Actor.pile',
      targets: ['Actor.player1'],
      // confirm intentionally omitted
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('CONFIRM_REQUIRED');
  });

  it('set-pile-state revertTokens without confirm returns CONFIRM_REQUIRED', async () => {
    const api = makeRealItemPilesAPI();
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);
    const result = await dispatchModuleItempiles({
      action: 'set-pile-state',
      state: 'revertTokens',
      tokenUuids: ['Scene.abc.Token.xyz'],
      // confirm intentionally omitted
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('CONFIRM_REQUIRED');
  });

  it('transfer-items combine mode without confirm returns CONFIRM_REQUIRED', async () => {
    const api = makeRealItemPilesAPI();
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);
    const result = await dispatchModuleItempiles({
      action: 'transfer-items',
      sourceUuid: 'Actor.src',
      targetUuid: 'Actor.dst',
      mode: 'combine',
      // confirm intentionally omitted
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('CONFIRM_REQUIRED');
  });

  it('refresh-merchant with removeExistingActorItems:true without confirm returns CONFIRM_REQUIRED', async () => {
    const api = makeRealItemPilesAPI();
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);
    const result = await dispatchModuleItempiles({
      action: 'refresh-merchant',
      merchantUuid: 'Actor.merchant',
      removeExistingActorItems: true,
      // confirm intentionally omitted
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('CONFIRM_REQUIRED');
  });
});

// ── Vault fit-check gate test ─────────────────────────────────────────────────

describe('vault fit-check gate', () => {
  beforeEach(() => {
    (globalThis as any).game = undefined;
    (globalThis as any).fromUuidSync = undefined;
  });

  it('returns VAULT_FULL when canItemFitInVault returns false', async () => {
    const api = makeRealItemPilesAPI({
      canItemFitInVault: vi.fn().mockReturnValue(false),
    });
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);
    (globalThis as any).fromUuidSync = vi.fn().mockReturnValue({ id: 'item1', name: 'Heavy Chest', type: 'container' });
    const result = await dispatchModuleItempiles({
      action: 'vault-info',
      actorUuid: 'Actor.vault',
      itemUuid: 'Item.abc',
      quantity: 1,
      subAction: 'fit-check',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('VAULT_FULL');
    // WHY: add-items to a full vault throws; callers must check fit first
  });
});

// ── BUG-380: per-actor price-modifier read scope ─────────────────────────────

describe('get-modifiers per-actor scope (BUG-380)', () => {
  it('forwards targetActorUuid as the actor option so the per-actor override resolves (not the global)', async () => {
    const perActor = { buyPriceModifier: 1.2, sellPriceModifier: 0.9 };
    const merchantGlobal = { buyPriceModifier: 1.0, sellPriceModifier: 1.0 };
    const getMods = vi.fn((_target: string, opts: { actor?: unknown } = {}) =>
      opts.actor ? perActor : merchantGlobal,
    );
    const api = makeRealItemPilesAPI({
      isItemPileMerchant: vi.fn().mockReturnValue(true),
      getMerchantPriceModifiers: getMods,
    });
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);

    const result = await dispatchModuleItempiles({
      action: 'update-price-modifiers',
      subAction: 'get-modifiers',
      actorUuid: 'Actor.merchant',
      targetActorUuid: 'Actor.buyer',
    });

    expect(result.success).toBe(true);
    // WHY: without the actor option the API returns the merchant GLOBAL (1.0); the per-actor override
    // that update-price-modifiers persists (1.2) is only resolved when targetActorUuid is forwarded.
    expect(getMods).toHaveBeenCalledWith('Actor.merchant', { actor: 'Actor.buyer' });
    expect((result as any).data.modifiers.buyPriceModifier).toBe(1.2);
  });

  it('passes actor:false when no targetActorUuid → merchant global', async () => {
    const merchantGlobal = { buyPriceModifier: 1.0, sellPriceModifier: 1.0 };
    const getMods = vi.fn().mockReturnValue(merchantGlobal);
    const api = makeRealItemPilesAPI({
      isItemPileMerchant: vi.fn().mockReturnValue(true),
      getMerchantPriceModifiers: getMods,
    });
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);

    const result = await dispatchModuleItempiles({
      action: 'update-price-modifiers',
      subAction: 'get-modifiers',
      actorUuid: 'Actor.merchant',
    });

    expect(result.success).toBe(true);
    expect(getMods).toHaveBeenCalledWith('Actor.merchant', { actor: false });
  });
});

// ── Bugfix sprint 444-459: verify-dimension regressions (BUG-444/445/447) ─────
//
// Mock-shape citations (PF-003 — no invented fields):
//   - getActorItems entries {id, name, type, system:{quantity:{value}}} — the exact paths the
//     handlers themselves serialize (container.ts get-contents, flow.ts roll-item-table) and
//     WFRP4e's stored item shape (wfrp4e_system/data/Item — system.quantity.value).
//   - tradeItems resolution {itemDeltas, attributeDeltas, itemPrices} — live-verified
//     2026-07-02 (BUG-423 smoke), already encoded in makeRealItemPilesAPI above.
//   - actorPriceModifiers flag entries [{actorUuid, buyPriceModifier, sellPriceModifier}] —
//     upstream write site item-piles.js:98364 (updateMerchantPriceModifiers array contract).
//   - TokenDocument {documentName:'Token', delete()} — Foundry core Document shape
//     (foundry_docs/documents; documentName discriminator used across this repo).

describe('BUG-445: quantity-dimension verifies (stack-merge / partial-stack / raw-flag)', () => {
  beforeEach(() => {
    (globalThis as any).game = undefined;
    (globalThis as any).fromUuidSync = undefined;
    (globalThis as any).fromUuid = undefined;
  });

  it('trade-items PASSES when the buyer stack-merges (count static, quantity 1→2)', async () => {
    // WHY (BUG-445b): item-piles stack-merges a bought item into the buyer's existing
    // same-name stack — distinct-item COUNT stays flat while quantity grows. The old
    // count-based verify false-failed the successful trade and retries double-charged.
    let traded = false;
    const merchantItems = [{ id: 'm1', name: 'Sword', type: 'weapon', system: { quantity: { value: 5 } } }];
    const api = makeRealItemPilesAPI({
      isItemPileMerchant: vi.fn().mockReturnValue(true),
      tradeItems: vi.fn().mockImplementation(async () => {
        traded = true;
        return { itemDeltas: [{ quantity: 1 }], attributeDeltas: {}, itemPrices: [] };
      }),
      getActorItems: vi.fn((uuid: string) =>
        uuid === 'Actor.merchant'
          ? merchantItems
          : [{ id: 'b1', name: 'Sword', type: 'weapon', system: { quantity: { value: traded ? 2 : 1 } } }],
      ),
      getActorCurrencies: vi.fn().mockReturnValue([]),
    });
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);

    const result = await dispatchModuleItempiles({
      action: 'trade-items',
      merchantUuid: 'Actor.merchant',
      buyerUuid: 'Actor.buyer',
      items: [{ itemId: 'm1', quantity: 1 }],
      confirm: true,
    });

    expect(result.success).toBe(true);
    expect((result as any).data.buyerItemCount).toBe(1); // count static — the old dimension
  });

  it('remove-items PASSES on partial-stack removal (count static, quantity 2→1)', async () => {
    // WHY (BUG-445c): removing 1 of a 2-stack leaves the distinct-item count unchanged;
    // the old count-based verify reported the successful removal as NOT_PERSISTED.
    let removed = false;
    const api = makeRealItemPilesAPI({
      removeItems: vi.fn().mockImplementation(async () => {
        removed = true;
        return [];
      }),
      getActorItems: vi.fn(() => [
        { id: 'r1', name: 'Arrow', type: 'ammunition', system: { quantity: { value: removed ? 1 : 2 } } },
      ]),
    });
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);

    const result = await dispatchModuleItempiles({
      action: 'remove-items',
      actorUuid: 'Actor.pile',
      items: [{ id: 'r1' }],
    });

    expect(result.success).toBe(true);
    expect((result as any).data.totalItems).toBe(1); // count static — the old dimension
  });

  it('update-price-modifiers PASSES against the RAW flag entry when the composed read differs', async () => {
    // WHY (BUG-445d): getMerchantPriceModifiers returns the COMPOSED effective modifier
    // (per-actor × merchant global) — writing sell:0.5 under a 0.5 global composes to 0.25
    // and false-failed the old requested-vs-composed compare. The write target is the raw
    // actorPriceModifiers flag entry (item-piles.js:98364) — verify THAT.
    const api = makeRealItemPilesAPI({
      isItemPileMerchant: vi.fn().mockReturnValue(true),
      updateMerchantPriceModifiers: vi.fn().mockResolvedValue(true),
      getActorFlagData: vi.fn().mockReturnValue({
        type: 'merchant',
        actorPriceModifiers: [{ actorUuid: 'Actor.merchant', buyPriceModifier: 1, sellPriceModifier: 0.5 }],
      }),
      getMerchantPriceModifiers: vi.fn().mockReturnValue({ buyPriceModifier: 1, sellPriceModifier: 0.25 }),
    });
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);

    const result = await dispatchModuleItempiles({
      action: 'update-price-modifiers',
      subAction: 'update-modifiers',
      actorUuid: 'Actor.merchant',
      sellPriceModifier: 0.5,
    });

    expect(result.success).toBe(true);
  });

  // BUG-773: subAction defaults to the read-only 'get-modifiers' — every authored recipe
  // supplying buy/sell/relative/override fields but no explicit subAction silently executed a
  // no-op read while reporting success. Fail loud instead of letting write fields go ignored.
  it('rejects buy/sell/relative/override fields when subAction is omitted (defaults to read) (BUG-773)', async () => {
    const api = makeRealItemPilesAPI({ isItemPileMerchant: vi.fn().mockReturnValue(true) });
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);

    const result = await dispatchModuleItempiles({
      action: 'update-price-modifiers',
      actorUuid: 'Actor.merchant',
      targetActorUuid: 'Actor.buyer',
      buyPriceModifier: 1.2,
      sellPriceModifier: 0.5,
      relative: false,
    });

    expect(result.success).toBe(false);
    expect((result as any).error).toContain('MODULE_ITEMPILES_WRITE_FIELDS_ON_READ_SUBACTION');
    expect((result as any).error).toContain('buyPriceModifier');
  });

  it('rejects write fields on an explicit get-prices subAction too', async () => {
    const api = makeRealItemPilesAPI({ isItemPileMerchant: vi.fn().mockReturnValue(true) });
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);

    const result = await dispatchModuleItempiles({
      action: 'update-price-modifiers',
      subAction: 'get-prices',
      actorUuid: 'Actor.merchant',
      itemUuid: 'Item.abc',
      override: true,
    });

    expect(result.success).toBe(false);
    expect((result as any).error).toContain('MODULE_ITEMPILES_WRITE_FIELDS_ON_READ_SUBACTION');
  });
});

// ── BUG-461: item-piles hygiene — readable split-loot preview + quantity-dimension verifies ──
//
// Mock-shape citations (PF-003 — no invented fields): getActorItems entries
// {id, name, type, system:{quantity:{value}}} — the same shape captured for the BUG-445 block
// above (the paths the handlers serialize + WFRP4e's stored item shape). transfer-items input
// {_id, quantity} — the schema's documented per-action shape (item-piles.ts inputSchema:335).

describe('BUG-461: split-loot preview + add/transfer quantity verifies', () => {
  beforeEach(() => {
    (globalThis as any).game = undefined;
    (globalThis as any).fromUuidSync = undefined;
    (globalThis as any).fromUuid = undefined;
  });

  it('split-loot CONFIRM preview is a count + name-list summary, not a serialized document dump', async () => {
    // WHY (BUG-461a): the old preview did `Current contents: ${JSON.stringify(previewItems)}`,
    // dumping multi-KB getActorItems docs into the confirm message (the bloat class BUG-448#7
    // fixed at remove-currency/trade-items). It must render a readable item-count + name list.
    const api = makeRealItemPilesAPI({
      getActorItems: vi.fn().mockReturnValue([
        { id: 'i1', name: 'Rusty Sword', type: 'weapon', system: { quantity: { value: 1 } } },
        { id: 'i2', name: 'Gold Ring', type: 'trapping', system: { quantity: { value: 2 } } },
      ]),
    });
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);

    const result = await dispatchModuleItempiles({
      action: 'split-loot',
      actorUuid: 'Actor.pile',
      targets: ['Actor.player1'],
      // confirm omitted → preview branch
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('CONFIRM_REQUIRED');
    expect(result.error).toContain('2 item(s): Rusty Sword, Gold Ring');
    expect(result.error).not.toContain('"system"'); // no serialized document dump
    expect(result.error).not.toContain('quantity');
  });

  it('add-items PASSES when the added item stack-merges (count static, quantity 1→2)', async () => {
    // WHY (BUG-461b): adding a same-name item merges into the actor's existing stack — distinct
    // COUNT stays flat while quantity grows. The OLD count-based verify (readCount > before)
    // false-failed the successful add as NOT_PERSISTED (BUG-445b class); the quantity-family
    // delta passes.
    let added = false;
    const api = makeRealItemPilesAPI({
      addItems: vi.fn().mockImplementation(async () => {
        added = true;
        return [];
      }),
      getActorItems: vi.fn(() => [
        { id: 'a1', name: 'Torch', type: 'trapping', system: { quantity: { value: added ? 2 : 1 } } },
      ]),
    });
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);

    const result = await dispatchModuleItempiles({
      action: 'add-items',
      actorUuid: 'Actor.pile',
      items: [{ name: 'Torch', type: 'trapping', system: { quantity: { value: 1 } } }],
    });

    expect(result.success).toBe(true);
    expect((result as any).data.totalItems).toBe(1); // count static — the old dimension
  });

  it('transfer-items PASSES on a target stack-merge (target count static, name-family quantity 1→2)', async () => {
    // WHY (BUG-461b): a transferred item merges into the target's existing same-name stack —
    // target COUNT stays flat while quantity grows, and the target copy gets a NEW embedded id.
    // The name family, resolved from the SOURCE pre-transfer, is the only stable join; its
    // quantity delta must not false-fail.
    let transferred = false;
    const sourceItems = [{ id: 's1', name: 'Dagger', type: 'weapon', system: { quantity: { value: 1 } } }];
    const api = makeRealItemPilesAPI({
      transferItems: vi.fn().mockImplementation(async () => {
        transferred = true;
        return [{ item: { name: 'Dagger' }, quantity: 1 }];
      }),
      getActorItems: vi.fn((uuid: string) =>
        uuid === 'Actor.src'
          ? sourceItems
          : [{ id: 't1', name: 'Dagger', type: 'weapon', system: { quantity: { value: transferred ? 2 : 1 } } }],
      ),
    });
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);

    const result = await dispatchModuleItempiles({
      action: 'transfer-items',
      sourceUuid: 'Actor.src',
      targetUuid: 'Actor.dst',
      items: [{ _id: 's1', quantity: 1 }],
      mode: 'transfer',
    });

    expect(result.success).toBe(true);
    expect((result as any).data.targetItemCount).toBe(1); // count static — the old dimension
  });
});

describe('BUG-444: delete-pile bypasses API.deleteItemPile (non-viewed scene safe)', () => {
  beforeEach(() => {
    (globalThis as any).game = undefined;
    (globalThis as any).fromUuidSync = undefined;
    (globalThis as any).fromUuid = undefined;
  });

  it('deletes the TokenDocument directly — API.deleteItemPile is never consulted', async () => {
    // WHY: upstream getToken() returns the bare TokenDocument when the token's scene is not
    // viewed (`.object` null, item-piles.js:34269) and _deleteItemPile derefs
    // target.document.delete() (item-piles.js:85022) → TypeError. The handler now resolves
    // the TokenDocument itself and calls .delete() — canvas-render-independent.
    const tokenDelete = vi.fn().mockResolvedValue(undefined);
    const api = makeRealItemPilesAPI();
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);
    (globalThis as any).fromUuid = vi.fn().mockResolvedValue({ documentName: 'Token', delete: tokenDelete });
    (globalThis as any).fromUuidSync = vi.fn().mockReturnValue(null); // post-delete: token gone

    const result = await dispatchModuleItempiles({
      action: 'delete-pile',
      tokenUuid: 'Scene.offscene.Token.xyz',
      confirm: true,
    });

    expect(result.success).toBe(true);
    expect((result as any).data.deleted).toBe(true);
    expect(tokenDelete).toHaveBeenCalledTimes(1);
    expect(api.deleteItemPile).not.toHaveBeenCalled();
  });

  it('returns INVALID_PILE_UUID when the uuid resolves to a non-Token document', async () => {
    const api = makeRealItemPilesAPI();
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);
    (globalThis as any).fromUuid = vi.fn().mockResolvedValue({ documentName: 'Actor' });

    const result = await dispatchModuleItempiles({
      action: 'delete-pile',
      tokenUuid: 'Scene.abc.Token.xyz',
      confirm: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('INVALID_PILE_UUID');
  });
});

describe('BUG-447: set-pile-state non-container pre-check', () => {
  beforeEach(() => {
    (globalThis as any).game = undefined;
    (globalThis as any).fromUuidSync = undefined;
  });

  it('returns INVALID_PILE_TYPE naming the actual type on a plain pile', async () => {
    // WHY: openItemPile/closeItemPile return the same bare `false` for "not a container"
    // as for hook-veto / no-GM (item-piles.js:97969/:98001) — without the pre-check a
    // non-container close reported NO_ACTIVE_GM while the GM was connected.
    const api = makeRealItemPilesAPI({
      isItemPileContainer: vi.fn().mockReturnValue(false),
      getActorFlagData: vi.fn().mockReturnValue({ type: 'pile' }),
    });
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);

    const result = await dispatchModuleItempiles({
      action: 'set-pile-state',
      state: 'close',
      actorUuid: 'Actor.plainpile',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('INVALID_PILE_TYPE');
    expect(result.error).toContain('"pile"');
    expect(result.error).not.toContain('NO_ACTIVE_GM');
    expect(api.closeItemPile).not.toHaveBeenCalled();
  });

  it('rattle is exempt from the container pre-check', async () => {
    const api = makeRealItemPilesAPI({
      isItemPileContainer: vi.fn().mockReturnValue(false),
      getActorFlagData: vi.fn().mockReturnValue({ type: 'pile' }),
    });
    (globalThis as any).game = makeGame({ 'item-piles': { active: true } }, api);

    const result = await dispatchModuleItempiles({
      action: 'set-pile-state',
      state: 'rattle',
      actorUuid: 'Actor.plainpile',
    });

    // rattle has no persisted state — success with the API consulted, no INVALID_PILE_TYPE
    expect(result.error ?? '').not.toContain('INVALID_PILE_TYPE');
    expect(api.rattleItemPile).toHaveBeenCalled();
  });
});

// ── API instance shape verification ──────────────────────────────────────────

describe('API instance shape (phase5 lesson)', () => {
  it('makeRealItemPilesAPI returns an object with instance methods, not a class with statics', () => {
    const api = makeRealItemPilesAPI();
    // All methods should be directly on the instance (not on a prototype.constructor)
    expect(typeof api.createItemPile).toBe('function');
    expect(typeof api.getActorItems).toBe('function');
    expect(typeof api.tradeItems).toBe('function');
    // phase5 lesson: mocking as a static (Sequence.fromJSON) vs instance (new Sequence().fromJSON)
    // caused play-sequence-json to be completely non-functional through L3+426 tests
    // Item Piles API is accessed as game.itempiles.API.method() — always instance
  });
});
