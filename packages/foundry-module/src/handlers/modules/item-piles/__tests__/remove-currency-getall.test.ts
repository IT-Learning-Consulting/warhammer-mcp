// BUG-769 — absolute currency change-making could destroy the wrong value.
//
// Why: item-piles.js:99325 defaults getActorCurrencies to {getAll:false}, silently dropping
// every ZERO-quantity denomination. Before the fix, applyAbsoluteCurrencies() iterated only
// `current` (the un-getAll'd read) and so could never CREATE a denomination that started at
// zero, and absoluteSetSettled()'s entries.every() vacuously passed when the actor's positive
// coin list was empty. This test proves getActorCurrencies is always called with
// {getAll:true} in the remove-currency path, and that a zero-balance denomination the
// operation needs to CREATE (paying with a coin the actor previously had none of change for)
// actually gets created via addCurrencies rather than silently skipped.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../wfrp-economy/ledger.js', () => ({ recordEconomyTransaction: vi.fn().mockResolvedValue(undefined) }));

import { handleRemoveCurrency } from '../flow.js';

const getActorCurrenciesCalls: any[] = [];
const addCurrenciesMock = vi.fn().mockResolvedValue(true);
const updateEmbeddedDocumentsMock = vi.fn().mockResolvedValue(undefined);

// Actor holds only 1GC (240 exchange rate) and 0SS (1 exchange rate) — paying 1SS requires
// creating the SS item, which did not exist before (no `id`).
function currentCurrencies() {
  return [
    { id: 'item-gc', abbreviation: 'gc', quantity: 1, exchangeRate: 240, type: 'item' },
    { id: undefined, abbreviation: 'ss', quantity: 0, exchangeRate: 1, type: 'item' },
  ];
}

function mockApi() {
  return {
    getActorCurrencies: vi.fn((uuid: string, opts: any) => {
      getActorCurrenciesCalls.push(opts);
      return currentCurrencies();
    }),
    getStringFromCurrencies: () => '1gc 0ss',
    getCurrenciesFromString: (s: string) => {
      // Minimal deterministic parser for this test's fixed strings. exchangeRate must be
      // present — currencyTotal() sums quantity*exchangeRate (a missing rate silently zeroes
      // the total and trips the handler's early INVALID_CURRENCY_STRING/insufficient-funds
      // pre-checks before applyAbsoluteCurrencies is ever reached).
      if (s === '1ss') return [{ abbreviation: 'ss', quantity: 1, exchangeRate: 1 }];
      if (s === '19ss') return [{ abbreviation: 'ss', quantity: 19, exchangeRate: 1 }];
      if (s === '0gc 19ss') return [{ abbreviation: 'gc', quantity: 0, exchangeRate: 240 }, { abbreviation: 'ss', quantity: 19, exchangeRate: 1 }];
      return [];
    },
    calculateCurrencies: () => '0gc 19ss', // 1gc(240bp) - 1ss(1bp) expressed as change-making result
    CURRENCIES: [{ abbreviation: 'gc' }, { abbreviation: 'ss' }],
    ITEM_QUANTITY_ATTRIBUTE: 'system.quantity.value',
    addCurrencies: addCurrenciesMock,
  };
}

beforeEach(() => {
  getActorCurrenciesCalls.length = 0;
  addCurrenciesMock.mockClear();
  updateEmbeddedDocumentsMock.mockClear();
  (globalThis as any).game = { user: { isGM: true }, users: [{ isGM: true, active: true }] };
  const API = mockApi();
  (globalThis as any).game.itempiles = { API };
  (globalThis as any).fromUuid = vi.fn(async () => ({ updateEmbeddedDocuments: updateEmbeddedDocumentsMock }));
});

afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).fromUuid;
});

describe('handleRemoveCurrency — BUG-769 getAll:true + zero-denomination creation', () => {
  it('always reads currencies with { getAll: true }', async () => {
    await handleRemoveCurrency({ action: 'remove-currency', actorUuid: 'Actor.x', currencies: '1ss', confirm: true } as any);
    expect(getActorCurrenciesCalls.length).toBeGreaterThan(0);
    for (const opts of getActorCurrenciesCalls) {
      expect(opts).toEqual({ getAll: true });
    }
  });

  it('creates a previously-zero denomination via addCurrencies instead of silently skipping it', async () => {
    await handleRemoveCurrency({ action: 'remove-currency', actorUuid: 'Actor.x', currencies: '1ss', confirm: true } as any);
    // ss target is 19 (from calculateCurrencies mock) and had no `id` (zero balance, no item
    // existed) — applyAbsoluteCurrencies must create it via addCurrencies, not drop it.
    expect(addCurrenciesMock).toHaveBeenCalledWith('Actor.x', '19ss');
  });
});
