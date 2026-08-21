// BUG-774 — relative price modifiers could false-fail a correct write or corrupt an omitted side.
//
// Why: item-piles.js:98404-98407 computes `new = old + requested` per side under relative:true.
// The MCP verifier previously compared the stored absolute result directly to the requested DELTA
// (not old+delta), so a genuinely correct `1.0 + 0.1 -> 1.1` write reported NOT_PERSISTED — inviting
// a client retry that would apply a second +0.1 on top of the already-persisted 1.1. Separately, the
// schema lets a caller supply only one side; upstream computes the omitted side as `old + undefined`
// = NaN (Math.max(0, NaN) is still NaN), silently corrupting it. `override` is never preserved
// upstream (always rewritten to `override ?? false`) but was never verified at all.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { handleUpdatePriceModifiers } from '../merchant.js';

function mockGlobals(initial: { buyPriceModifier?: number; sellPriceModifier?: number; override?: boolean } = {}) {
  const entry: any = { actorUuid: 'Actor.merchant', ...initial };
  const flagData: any = { actorPriceModifiers: [entry] };

  (globalThis as any).game = {
    user: { isGM: true },
    users: [{ isGM: true, active: true }],
  };
  (globalThis as any).game.itempiles = {
    API: {
      isItemPileMerchant: () => true,
      getActorFlagData: () => flagData,
      getMerchantPriceModifiers: () => ({ buyPriceModifier: entry.buyPriceModifier, sellPriceModifier: entry.sellPriceModifier }),
      // Mirrors item-piles.js:98398-98413's exact arithmetic — a faithful mock, not an invented shape.
      updateMerchantPriceModifiers: async (_actorUuid: string, entries: any[]) => {
        for (const req of entries) {
          const oldBuy = entry.buyPriceModifier ?? 1;
          const oldSell = entry.sellPriceModifier ?? 0.5;
          entry.buyPriceModifier = Math.max(0, req.relative ? oldBuy + req.buyPriceModifier : req.buyPriceModifier ?? oldBuy);
          entry.sellPriceModifier = Math.max(0, req.relative ? oldSell + req.sellPriceModifier : req.sellPriceModifier ?? oldSell);
          entry.override = req.override ?? false;
        }
        return true;
      },
    },
  };
  return entry;
}

afterEach(() => {
  delete (globalThis as any).game;
});

describe('handleUpdatePriceModifiers — BUG-774 relative-mode verification', () => {
  it('a correct relative write verifies as success (previously false-failed)', async () => {
    mockGlobals({ buyPriceModifier: 1.0 });
    const result: any = await handleUpdatePriceModifiers({
      action: 'update-price-modifiers',
      subAction: 'update-modifiers',
      actorUuid: 'Actor.merchant',
      relative: true,
      buyPriceModifier: 0.1,
    } as any);
    expect(result.success).toBe(true);
    expect(result.data.outcome).toBe('applied');
  });

  it('omitting one side under relative:true does not write NaN to it (preserves old value via a 0 delta)', async () => {
    const entry = mockGlobals({ buyPriceModifier: 1.0, sellPriceModifier: 0.5 });
    const result: any = await handleUpdatePriceModifiers({
      action: 'update-price-modifiers',
      subAction: 'update-modifiers',
      actorUuid: 'Actor.merchant',
      relative: true,
      buyPriceModifier: 0.2,
      // sellPriceModifier omitted — must NOT become NaN.
    } as any);
    expect(result.success).toBe(true);
    expect(entry.sellPriceModifier).toBe(0.5);
    expect(Number.isNaN(entry.sellPriceModifier)).toBe(false);
  });

  it('override is verified even though upstream never preserves it (always rewritten to override ?? false)', async () => {
    mockGlobals({ buyPriceModifier: 1.0, override: true });
    const result: any = await handleUpdatePriceModifiers({
      action: 'update-price-modifiers',
      subAction: 'update-modifiers',
      actorUuid: 'Actor.merchant',
      buyPriceModifier: 1.2,
      // override omitted -> upstream resets it to false; the verifier must expect false, not true.
    } as any);
    expect(result.success).toBe(true);
  });

  it('re-fire: two successive genuine relative updates each apply their own delta from the CURRENT persisted state, not a stale/cached one', async () => {
    const entry = mockGlobals({ buyPriceModifier: 1.0 });
    const first: any = await handleUpdatePriceModifiers({
      action: 'update-price-modifiers', subAction: 'update-modifiers', actorUuid: 'Actor.merchant', relative: true, buyPriceModifier: 0.1,
    } as any);
    expect(first.success).toBe(true);
    expect(entry.buyPriceModifier).toBeCloseTo(1.1);

    const second: any = await handleUpdatePriceModifiers({
      action: 'update-price-modifiers', subAction: 'update-modifiers', actorUuid: 'Actor.merchant', relative: true, buyPriceModifier: 0.1,
    } as any);
    expect(second.success).toBe(true);
    // 1.1 + 0.1 = 1.2 (one legitimate further delta), never 1.0 + 0.1 + 0.1 double-counted from a
    // stale "old" snapshot, and never a false NOT_PERSISTED that would have invited a THIRD retry.
    expect(entry.buyPriceModifier).toBeCloseTo(1.2);
  });
});
