// Deliverable-0 (bug-fix-campaign-123 Phase 3) — self-tests for the shared verify-harness.
// Proves each harness helper behaves correctly BEFORE BUG-771/772/777/779/781/784/786/788's
// forthcoming fixtures build on it — a broken harness helper would silently false-pass or
// false-fail every fixture that imports it.

import { describe, it, expect, afterEach } from 'vitest';
import {
  family,
  installItemPilesGame,
  baseApi,
  zeroBalanceCurrency,
  expectQuantityChange,
  expectQuantityIncreases,
  expectQuantityDecreases,
  expectAllGetAllCurrencyCalls,
  mockSettlingPredicate,
  fastSettlePoll,
} from './verify-harness.js';

afterEach(() => {
  delete (globalThis as any).game;
});

describe('family()', () => {
  it('builds an empty ItemFamily when called with no args', () => {
    expect(family()).toEqual({});
  });

  it('builds ids-only, names-only, and combined families', () => {
    expect(family(['a', 'b'])).toEqual({ ids: new Set(['a', 'b']) });
    expect(family(undefined, ['Sword'])).toEqual({ names: new Set(['Sword']) });
    expect(family(['a'], ['Sword'])).toEqual({ ids: new Set(['a']), names: new Set(['Sword']) });
  });

  it('omits empty-array ids/names rather than emitting an empty Set (matches totalQuantity treating an absent key as unfiltered)', () => {
    expect(family([], [])).toEqual({});
  });
});

describe('installItemPilesGame()', () => {
  it('installs game.itempiles.API and the isGM/active-user guard shape', () => {
    const api = baseApi();
    const teardown = installItemPilesGame(api);
    try {
      expect((globalThis as any).game.itempiles.API).toBe(api);
      expect((globalThis as any).game.user.isGM).toBe(true);
      expect((globalThis as any).game.users).toEqual([{ isGM: true, active: true }]);
    } finally {
      teardown();
    }
  });

  it('respects isGM:false override and teardown removes globalThis.game', () => {
    const teardown = installItemPilesGame(baseApi(), { isGM: false });
    expect((globalThis as any).game.user.isGM).toBe(false);
    teardown();
    expect((globalThis as any).game).toBeUndefined();
  });
});

describe('baseApi()', () => {
  it('defaults getActorItems/getActorCurrencies to empty-array reads, overridable per test', () => {
    const api = baseApi();
    expect(api.getActorItems('Actor.x')).toEqual([]);
    expect(api.getActorCurrencies('Actor.x')).toEqual([]);

    const overridden = baseApi({ getActorItems: () => [{ id: 'i1', name: 'Sword', system: { quantity: { value: 2 } } }] });
    expect(overridden.getActorItems('Actor.x')).toHaveLength(1);
  });
});

describe('zeroBalanceCurrency()', () => {
  it('matches the BUG-769 shape: no id, quantity 0, given abbreviation/exchangeRate, type "item"', () => {
    expect(zeroBalanceCurrency('ss', 1)).toEqual({ id: undefined, abbreviation: 'ss', quantity: 0, exchangeRate: 1, type: 'item' });
  });
});

describe('expectQuantityChange() / expectQuantityIncreases() / expectQuantityDecreases() — real totalQuantity underneath', () => {
  it('reports before/after totals across a mutation that grows a tracked family', async () => {
    let items: any[] = [{ id: 'i1', name: 'Sword', system: { quantity: { value: 1 } } }];
    const api = baseApi({ getActorItems: (_uuid: string, _opts?: any) => items });

    const { before, after } = await expectQuantityChange(
      api,
      'Actor.x',
      family(undefined, ['Sword']),
      () => {
        items = [{ id: 'i1', name: 'Sword', system: { quantity: { value: 3 } } }];
      },
      (b, a) => expect(a).toBeGreaterThan(b),
    );
    expect(before).toBe(1);
    expect(after).toBe(3);
  });

  it('expectQuantityIncreases passes on growth and throws on a non-persist (genuine failure not masked)', async () => {
    let items: any[] = [{ id: 'i1', name: 'Coin', system: { quantity: { value: 5 } } }];
    const growingApi = baseApi({ getActorItems: () => items });
    await expectQuantityIncreases(growingApi, 'Actor.x', family(undefined, ['Coin']), () => {
      items = [{ id: 'i1', name: 'Coin', system: { quantity: { value: 6 } } }];
    });

    const staticApi = baseApi({ getActorItems: () => items }); // unchanged by the no-op mutate below
    await expect(
      expectQuantityIncreases(staticApi, 'Actor.x', family(undefined, ['Coin']), () => {}),
    ).rejects.toThrow();
  });

  it('expectQuantityDecreases passes on a genuine removal', async () => {
    let items: any[] = [{ id: 'i1', name: 'Arrows', system: { quantity: { value: 7 } } }];
    const api = baseApi({ getActorItems: () => items });
    const { before, after } = await expectQuantityDecreases(api, 'Actor.x', family(undefined, ['Arrows']), () => {
      items = [{ id: 'i1', name: 'Arrows', system: { quantity: { value: 4 } } }];
    });
    expect(before).toBe(7);
    expect(after).toBe(4);
  });

  it('honors totalQuantity currency-inclusive default (BUG-775): a money-type item is counted with no family filter', async () => {
    const api = baseApi({ getActorItems: () => [{ id: 'c1', name: 'Gold Crown', type: 'money', system: { quantity: { value: 5 } } }] });
    const { before } = await expectQuantityChange(api, 'Actor.x', undefined, () => {}, () => {});
    expect(before).toBe(5);
  });
});

describe('expectAllGetAllCurrencyCalls()', () => {
  it('passes when every recorded call requested { getAll: true }', () => {
    expect(() => expectAllGetAllCurrencyCalls([{ getAll: true }, { getAll: true }])).not.toThrow();
  });

  it('fails loud when a call omitted getAll or the call list is empty (regression: this is the exact BUG-769 defect shape)', () => {
    expect(() => expectAllGetAllCurrencyCalls([{ getAll: true }, undefined])).toThrow();
    expect(() => expectAllGetAllCurrencyCalls([{}])).toThrow();
    expect(() => expectAllGetAllCurrencyCalls([])).toThrow();
  });
});

describe('mockSettlingPredicate()', () => {
  it('returns false for calls before settleAfterCalls and true from settleAfterCalls onward', () => {
    const { predicate, calls } = mockSettlingPredicate(3);
    expect(predicate()).toBe(false);
    expect(predicate()).toBe(false);
    expect(predicate()).toBe(true);
    expect(predicate()).toBe(true); // stays settled
    expect(calls).toEqual([1, 2, 3, 4]);
  });

  it('settleAfterCalls:1 settles on the very first probe', () => {
    const { predicate } = mockSettlingPredicate(1);
    expect(predicate()).toBe(true);
  });
});

describe('fastSettlePoll() — real settlePoll underneath, compressed cadence', () => {
  it('settles late within the fast timeout', async () => {
    const { predicate } = mockSettlingPredicate(3);
    const result = await fastSettlePoll(predicate);
    expect(result).toBe(true);
  });

  it('never settles: returns false once the fast timeout is exhausted', async () => {
    const result = await fastSettlePoll(() => false, 30, 5);
    expect(result).toBe(false);
  });

  it('immediate: settles on the first check', async () => {
    const result = await fastSettlePoll(() => true);
    expect(result).toBe(true);
  });
});
