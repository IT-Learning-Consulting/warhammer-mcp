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
    transferCurrencies: vi.fn().mockResolvedValue(true),
    transferAllCurrencies: vi.fn().mockResolvedValue(true),
    // Split
    splitItemPileContents: vi.fn().mockResolvedValue(true),
    // Vault
    canItemFitInVault: vi.fn().mockReturnValue(true),
    fitItemsIntoVault: vi.fn().mockReturnValue([]),
    getVaultGridData: vi.fn().mockReturnValue({ cols: 4, rows: 4, items: [] }),
    // Merchant / trade
    rollItemTable: vi.fn().mockResolvedValue([]),
    refreshMerchantInventory: vi.fn().mockResolvedValue(true),
    tradeItems: vi.fn().mockResolvedValue({ itemMoved: true }),
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
