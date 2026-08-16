// BUG-775 — generic add/remove/transfer-items quantity verify excluded money items entirely.
//
// Why: item-piles.js:34919 (`getActorItems`) filters out every currency-registered item by
// DEFAULT (getItemCurrencies:false). WFRP4e registers money items as item-type currencies, so
// a generic add-items/remove-items call whose payload was ONLY money items was invisible to
// totalQuantity()'s before/after read — a genuinely successful coin mutation false-failed as
// *_NOT_PERSISTED. This proves totalQuantity() now passes getItemCurrencies:true.

import { describe, it, expect } from 'vitest';
import { totalQuantity } from '../verify-quantity.js';

describe('totalQuantity — BUG-775 currency-inclusive read', () => {
  it('calls API.getActorItems with { getItemCurrencies: true }', () => {
    const calls: any[] = [];
    const API = {
      getActorItems: (uuid: string, opts: any) => {
        calls.push([uuid, opts]);
        return [];
      },
    };
    totalQuantity(API, 'Actor.x');
    expect(calls).toEqual([['Actor.x', { getItemCurrencies: true }]]);
  });

  it('sums a money item that a non-currency-inclusive read would have excluded', () => {
    const API = {
      getActorItems: (_uuid: string, opts: any) => {
        // Simulate upstream: only returns the money item when getItemCurrencies is true.
        if (!opts?.getItemCurrencies) return [];
        return [{ id: 'coin1', name: 'Gold Crown', type: 'money', system: { quantity: { value: 5 } } }];
      },
    };
    expect(totalQuantity(API, 'Actor.x')).toBe(5);
    expect(totalQuantity(API, 'Actor.x', { names: new Set(['Gold Crown']) })).toBe(5);
  });
});
