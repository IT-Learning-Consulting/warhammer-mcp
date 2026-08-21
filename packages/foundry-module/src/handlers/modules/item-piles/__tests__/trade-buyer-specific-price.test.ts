// BUG-771 — buyer-specific price previews omitted the buyer, so a GM could approve a global
// price in the confirmation gate while the later real trade — which DOES supply the buyer —
// charged a different, buyer-specific-modifier price.
//
// Why: upstream getPricesForItem(item, {seller, buyer, quantity}) and the real trade path
// (_tradeItems -> getPaymentData -> getPriceData) both resolve a per-buyer price modifier via
// the `buyer` option (item-piles.js:99470-99491 getPricesForItem, :85630-85639 _tradeItems,
// :35707-35728 getPriceData's modifier resolution). Both MCP preview call sites — the
// trade-items confirmation gate and update-price-modifiers subAction:"get-prices" — previously
// called getPricesForItem with {seller, quantity} only, never buyer, so a merchant with a
// per-buyer discount/markup showed the global price at preview time while the real charge (which
// DOES pass buyer) differed. This fixture proves the previewed price and the actually-charged
// price are computed off the SAME buyer-aware pricing call and therefore match — plus that the
// preview selects the SAME payment-option index (paymentIndex) the real trade will use.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { handleTradeItems, handleUpdatePriceModifiers } from '../merchant.js';
import { installItemPilesGame, baseApi } from './verify-harness.js';

// Mirrors upstream getPricesForItem: returns a DIFFERENT price depending on whether a buyer
// with a per-buyer modifier was supplied — the exact behavior the fix must exercise. Two
// options per call (index 0 = primary, index 1 = a secondary/alternate option) so the
// paymentIndex-selection half of the fix is also exercised.
function makeGetPricesForItem() {
  return vi.fn((_item: any, opts: any) => {
    const buyerSpecific = opts?.buyer === 'Actor.buyer';
    const primaryCost = buyerSpecific ? 80 : 100; // per-buyer discount vs. global price
    const altCost = buyerSpecific ? 40 : 50;
    const mk = (totalCost: number) => ({
      free: false,
      basePrices: [],
      prices: [],
      basePriceString: `${totalCost} gc`,
      priceString: `${totalCost} gc`,
      totalCost,
      baseCost: totalCost,
      primary: true,
      maxQuantity: 0,
      quantity: opts?.quantity ?? 1,
    });
    return [mk(primaryCost), mk(altCost)];
  });
}

function tradeItem(id: string) {
  // BUG-770 precedent: mark as a service so the buyer-inventory-growth verify branch (a
  // separate concern, already covered by trade-items-service.test.ts) is skipped and this
  // fixture stays focused on the price-computation regression.
  return { id, _id: id, name: 'Fine Cloak', flags: { 'item-piles': { isService: true } } };
}

function mockTradeGlobals(
  getPricesForItem: ReturnType<typeof makeGetPricesForItem>,
  tradeItemsImpl?: (chargedAmount: number) => any,
) {
  const merchantItems = [tradeItem('cloak1')];
  let buyerCurrencyTotal = 200;

  (globalThis as any).fromUuidSync = (uuid: string) => {
    if (uuid === 'Actor.merchant.Item.cloak1') return merchantItems[0];
    if (uuid === 'Actor.merchant') return { items: { get: (id: string) => merchantItems.find((i) => i.id === id) } };
    return null;
  };

  const api = baseApi({
    isItemPileMerchant: () => true,
    getActorItems: (uuid: string) => (uuid === 'Actor.merchant' ? merchantItems : []),
    getActorCurrencies: () => [{ abbreviation: 'gc', quantity: buyerCurrencyTotal, exchangeRate: 1, type: 'item' }],
    getStringFromCurrencies: (entries: any[]) => entries.map((e: any) => `${e.cost}gc`).join(' '),
    getPricesForItem,
    ...(tradeItemsImpl
      ? {
          tradeItems: vi.fn(async (_merchantUuid: string, buyer: string, items: any[]) => {
            // Mirrors upstream's own internal pricing resolution (getPaymentData ->
            // getPriceData) selecting [data.paymentIndex || 0] and applying the SAME
            // buyer-aware price used for the actual charge (item-piles.js:35963).
            const priced = getPricesForItem(merchantItems[0], {
              seller: 'Actor.merchant',
              buyer,
              quantity: items[0].quantity,
            })[items[0].paymentIndex || 0];
            buyerCurrencyTotal -= priced.totalCost;
            return tradeItemsImpl(priced.totalCost);
          }),
        }
      : {}),
  });

  const teardown = installItemPilesGame(api, { isGM: true });
  return { teardown, getBuyerCurrencyTotal: () => buyerCurrencyTotal };
}

afterEach(() => {
  delete (globalThis as any).fromUuidSync;
});

describe('handleTradeItems preview — BUG-771 buyer-specific price', () => {
  it('the confirmation preview reflects the buyer-specific price, not the global price', async () => {
    const getPricesForItem = makeGetPricesForItem();
    const { teardown } = mockTradeGlobals(getPricesForItem);
    try {
      const result: any = await handleTradeItems({
        action: 'trade-items',
        merchantUuid: 'Actor.merchant',
        buyerUuid: 'Actor.buyer',
        items: [{ itemId: 'cloak1', quantity: 1, paymentIndex: 0 }],
        // confirm omitted -> preview path
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('CONFIRM_REQUIRED');
      // Regression: previously called with {seller, quantity} only — no buyer.
      expect(getPricesForItem).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ seller: 'Actor.merchant', buyer: 'Actor.buyer', quantity: 1 }),
      );
      expect(result.error).toContain('80 gc'); // buyer-specific price
      expect(result.error).not.toContain('100 gc'); // global price must NOT be shown
    } finally {
      teardown();
    }
  });

  it('the preview selects the same payment option index (paymentIndex) the real trade will use', async () => {
    const getPricesForItem = makeGetPricesForItem();
    const { teardown } = mockTradeGlobals(getPricesForItem);
    try {
      const result: any = await handleTradeItems({
        action: 'trade-items',
        merchantUuid: 'Actor.merchant',
        buyerUuid: 'Actor.buyer',
        items: [{ itemId: 'cloak1', quantity: 1, paymentIndex: 1 }], // the alternate option
      } as any);

      expect(result.error).toContain('40 gc'); // buyer-specific ALT option, not the primary 80
      expect(result.error).not.toContain('80 gc');
    } finally {
      teardown();
    }
  });

  it('the previewed price equals the price actually charged at trade time (the bug: they used to differ)', async () => {
    const getPricesForItem = makeGetPricesForItem();
    const { teardown, getBuyerCurrencyTotal } = mockTradeGlobals(getPricesForItem, (chargedAmount: number) => ({
      itemDeltas: [{ abbreviation: 'gc', quantity: -chargedAmount }],
      attributeDeltas: {},
    }));
    try {
      const previewResult: any = await handleTradeItems({
        action: 'trade-items',
        merchantUuid: 'Actor.merchant',
        buyerUuid: 'Actor.buyer',
        items: [{ itemId: 'cloak1', quantity: 1, paymentIndex: 0 }],
      } as any);
      const previewedPrice = Number(previewResult.error.match(/First item price: (\d+) gc/)?.[1]);
      expect(previewedPrice).toBe(80);

      const beforeCurrency = getBuyerCurrencyTotal();
      const tradeResult: any = await handleTradeItems({
        action: 'trade-items',
        merchantUuid: 'Actor.merchant',
        buyerUuid: 'Actor.buyer',
        items: [{ itemId: 'cloak1', quantity: 1, paymentIndex: 0 }],
        confirm: true,
      } as any);
      expect(tradeResult.success).toBe(true);
      const actuallyCharged = beforeCurrency - getBuyerCurrencyTotal();

      // The bug: a seller-only preview would have shown 100 (the global price) while the real
      // buyer-aware trade charges 80 — GM approves one price, player charged another. The fix
      // makes preview and charge equal.
      expect(actuallyCharged).toBe(previewedPrice);
    } finally {
      teardown();
    }
  });
});

describe('handleUpdatePriceModifiers get-prices — BUG-771 buyer-specific price', () => {
  function mockGetPricesGlobals(getPricesForItem: ReturnType<typeof makeGetPricesForItem>) {
    (globalThis as any).fromUuidSync = () => ({ id: 'cloak1' });
    const api = baseApi({ getPricesForItem, getCostOfItem: () => 100 });
    return installItemPilesGame(api, { isGM: true });
  }

  it('forwards targetActorUuid as the buyer so a per-buyer modifier is reflected', async () => {
    const getPricesForItem = makeGetPricesForItem();
    const teardown = mockGetPricesGlobals(getPricesForItem);
    try {
      const result: any = await handleUpdatePriceModifiers({
        action: 'update-price-modifiers',
        subAction: 'get-prices',
        actorUuid: 'Actor.merchant',
        targetActorUuid: 'Actor.buyer',
        itemUuid: 'Item.cloak1',
        quantity: 1,
      } as any);

      expect(result.success).toBe(true);
      expect(getPricesForItem).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ seller: 'Actor.merchant', buyer: 'Actor.buyer', quantity: 1 }),
      );
      expect(result.data.prices[0].priceString).toBe('80 gc');
    } finally {
      teardown();
    }
  });

  it('without targetActorUuid, buyer defaults to false (unchanged global-price behavior)', async () => {
    const getPricesForItem = makeGetPricesForItem();
    const teardown = mockGetPricesGlobals(getPricesForItem);
    try {
      const result: any = await handleUpdatePriceModifiers({
        action: 'update-price-modifiers',
        subAction: 'get-prices',
        actorUuid: 'Actor.merchant',
        itemUuid: 'Item.cloak1',
        quantity: 1,
      } as any);

      expect(result.success).toBe(true);
      expect(getPricesForItem).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ seller: 'Actor.merchant', buyer: false, quantity: 1 }),
      );
      expect(result.data.prices[0].priceString).toBe('100 gc');
    } finally {
      teardown();
    }
  });
});
