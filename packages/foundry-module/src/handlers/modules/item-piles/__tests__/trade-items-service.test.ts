// BUG-770 — service purchases could charge first and then report failure or skip the effect.
//
// Why: item-piles.js:85727 (`if (itemFlagData.isService) continue;`) deliberately never
// embeds a purchased service item on the buyer — the effect is delivered by the item's macro
// instead. The MCP verifier previously still required the buyer's quantity for EVERY traded
// item name to grow, so a pure-service purchase would false-fail
// ITEM_PILES_TRADE_ITEMS_NOT_PERSISTED after the buyer had already been charged. Separately, a
// missing/throwing service macro (upstream runs it AFTER both transactions commit) previously
// surfaced as a plain TRADE_ITEMS_ERROR indistinguishable from "nothing happened" — inviting an
// unsafe retry that would double-charge the buyer.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleTradeItems } from '../merchant.js';

const tradeItemsMock = vi.fn();

function healingPotionItem(id: string, isService = false) {
  return { id, _id: id, name: 'Healing Service', flags: { 'item-piles': { isService } } };
}

function mockGlobals(opts: { buyerCurrencyAfter?: number } = {}) {
  const merchantItems = [healingPotionItem('svc1', true)];
  let buyerCurrencyTotal = 100; // arbitrary "before" primary-unit total
  const afterTotal = opts.buyerCurrencyAfter ?? buyerCurrencyTotal;

  (globalThis as any).game = {
    user: { isGM: true },
    users: [{ isGM: true, active: true }],
  };
  (globalThis as any).game.itempiles = {
    API: {
      isItemPileMerchant: () => true,
      getActorItems: (uuid: string) => (uuid === 'Actor.merchant' ? merchantItems : []),
      getActorCurrencies: () => [{ abbreviation: 'gc', quantity: buyerCurrencyTotal, exchangeRate: 1, type: 'item' }],
      tradeItems: tradeItemsMock,
    },
  };
  return {
    setBuyerCurrencyAfterTrade: () => {
      buyerCurrencyTotal = afterTotal;
    },
  };
}

beforeEach(() => {
  tradeItemsMock.mockReset();
});

afterEach(() => {
  delete (globalThis as any).game;
});

describe('handleTradeItems — BUG-770 service purchase verification', () => {
  it('does not false-fail a pure-service purchase even though the buyer item family never grows', async () => {
    const ctl = mockGlobals({ buyerCurrencyAfter: 90 });
    // tradeItems resolves with a currency-only itemDelta (payment) and NO delta for the
    // service item itself — matches upstream's isService skip at item-piles.js:85727.
    tradeItemsMock.mockImplementation(async () => {
      ctl.setBuyerCurrencyAfterTrade();
      return { itemDeltas: [{ abbreviation: 'gc', quantity: -10 }], attributeDeltas: {} };
    });

    const result = await handleTradeItems({
      action: 'trade-items',
      merchantUuid: 'Actor.merchant',
      buyerUuid: 'Actor.buyer',
      items: [{ itemId: 'svc1', quantity: 1 }],
      confirm: true,
    } as any);

    expect(result.success).toBe(true);
  });

  it('reports ITEM_PILES_TRADE_POST_PAYMENT_ERROR (not a plain error) when tradeItems throws after payment committed', async () => {
    const ctl = mockGlobals({ buyerCurrencyAfter: 90 });
    tradeItemsMock.mockImplementation(async () => {
      // Payment already landed (buyer currency dropped) before the missing-macro throw.
      ctl.setBuyerCurrencyAfterTrade();
      throw new Error('Macro "heal-npc" not found');
    });

    const result = await handleTradeItems({
      action: 'trade-items',
      merchantUuid: 'Actor.merchant',
      buyerUuid: 'Actor.buyer',
      items: [{ itemId: 'svc1', quantity: 1 }],
      confirm: true,
    } as any);

    expect(result.success).toBe(false);
    expect((result as any).error).toContain('ITEM_PILES_TRADE_POST_PAYMENT_ERROR');
    expect((result as any).error).toContain('do NOT retry');
  });

  it('reports a plain TRADE_ITEMS_ERROR when tradeItems throws with no payment committed', async () => {
    mockGlobals({ buyerCurrencyAfter: 100 }); // unchanged — no payment happened
    tradeItemsMock.mockImplementation(async () => {
      throw new Error('some pre-payment validation error');
    });

    const result = await handleTradeItems({
      action: 'trade-items',
      merchantUuid: 'Actor.merchant',
      buyerUuid: 'Actor.buyer',
      items: [{ itemId: 'svc1', quantity: 1 }],
      confirm: true,
    } as any);

    expect(result.success).toBe(false);
    expect((result as any).error).toContain('TRADE_ITEMS_ERROR');
    expect((result as any).error).not.toContain('POST_PAYMENT');
  });
});
