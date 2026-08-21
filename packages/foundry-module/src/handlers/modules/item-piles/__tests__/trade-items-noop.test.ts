// BUG-780 — an empty/silent no-op trade-items call hard-coded a successful envelope with
// `itemsTraded` echoing the REQUESTED count, even when upstream resolved zero item and
// attribute deltas (nothing actually moved). Same false-success shape as the flow.ts transfer
// handlers covered by trade-items-outcome-noop.test.ts.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleTradeItems } from '../merchant.js';

const tradeItemsMock = vi.fn();

function merchantItem(id: string) {
  return { id, _id: id, name: 'Rusty Sword', flags: {} };
}

function mockGlobals() {
  (globalThis as any).game = {
    user: { isGM: true },
    users: [{ isGM: true, active: true }],
  };
  (globalThis as any).game.itempiles = {
    API: {
      isItemPileMerchant: () => true,
      getActorItems: (uuid: string) => (uuid === 'Actor.merchant' ? [merchantItem('sw1')] : []),
      getActorCurrencies: () => [{ abbreviation: 'gc', quantity: 100, exchangeRate: 1, type: 'item' }],
      tradeItems: tradeItemsMock,
    },
  };
}

beforeEach(() => {
  tradeItemsMock.mockReset();
});

afterEach(() => {
  delete (globalThis as any).game;
});

describe('handleTradeItems — BUG-780 empty/no-op verification', () => {
  it('reports outcome:"noop" with a reason when upstream resolves zero item and attribute deltas', async () => {
    mockGlobals();
    tradeItemsMock.mockResolvedValue({ itemDeltas: [], attributeDeltas: {} });

    const result: any = await handleTradeItems({
      action: 'trade-items',
      merchantUuid: 'Actor.merchant',
      buyerUuid: 'Actor.buyer',
      items: [{ itemId: 'sw1', quantity: 1 }],
      confirm: true,
    } as any);

    expect(result.success).toBe(true);
    expect(result.data.outcome).toBe('noop');
    expect(typeof result.data.reason).toBe('string');
    expect(result.data.reason.length).toBeGreaterThan(0);
    // BUG-780: itemsTraded previously echoed the REQUESTED count (1) even on a no-op.
    expect(result.data.itemsTraded).toBe(0);
  });

  it('still reports outcome:"applied" (regression guard) when items actually move', async () => {
    // DP-16 verify requires the buyer's tracked item family to actually GROW post-trade —
    // simulate the buyer receiving the sold item, mirroring trade-items-service.test.ts's
    // mutable-state pattern.
    let buyerItems: any[] = [];
    (globalThis as any).game = {
      user: { isGM: true },
      users: [{ isGM: true, active: true }],
    };
    (globalThis as any).game.itempiles = {
      API: {
        isItemPileMerchant: () => true,
        getActorItems: (uuid: string) => (uuid === 'Actor.merchant' ? [merchantItem('sw1')] : buyerItems),
        getActorCurrencies: () => [{ abbreviation: 'gc', quantity: 100, exchangeRate: 1, type: 'item' }],
        tradeItems: tradeItemsMock,
      },
    };
    tradeItemsMock.mockImplementation(async () => {
      buyerItems = [{ ...merchantItem('sw1-buyer'), name: 'Rusty Sword' }];
      return { itemDeltas: [{ itemId: 'sw1', quantity: 1 }], attributeDeltas: {} };
    });

    const result: any = await handleTradeItems({
      action: 'trade-items',
      merchantUuid: 'Actor.merchant',
      buyerUuid: 'Actor.buyer',
      items: [{ itemId: 'sw1', quantity: 1 }],
      confirm: true,
    } as any);

    expect(result.success).toBe(true);
    expect(result.data.outcome).toBe('applied');
    expect(result.data.itemsTraded).toBe(1);
    expect(result.data.reason).toBeUndefined();
  });
});
