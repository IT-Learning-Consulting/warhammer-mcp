// Phase 7g — Unit tests for the RETIRED module-trading-places dispatcher.
//
// wfrp_economy_system Phase 3/7 built the original 19-action dispatcher (buy/sell cargo, season,
// availability, price calc, haggle/gossip tests, merchant generation, price dial, currency). Phase 7g
// retires ALL of it in favor of module-wfrp-economy's ported trading-* engine — this suite replaces the
// old handler-behavior coverage (season resolution, change-making arithmetic, hold capacity, etc., which
// no longer exist as code paths) with retirement-behavior coverage instead.
//
// WHY (Rule 9): a regression here would silently resurrect a supposedly-retired legacy action, or (the
// more likely real-world failure mode per Risk 7g.A-1) let requireModuleActive's MODULE_NOT_ACTIVE
// envelope shadow the retirement message once the module is actually disabled in the live world — the
// ordering test is the one that catches that specific regression class.

import { describe, it, expect } from 'vitest';
import { dispatchModuleTradingPlaces } from '../trading-places.js';

function makeGame(opts: { tradingPlacesActive?: boolean } = {}) {
  return {
    modules: {
      get: (id: string) => {
        if (id === 'trading-places') {
          return (opts.tradingPlacesActive ?? true) ? { active: true, title: 'Trading Places', version: '0.3.0' } : undefined;
        }
        return undefined;
      },
    },
    user: { isGM: true, id: 'gm1' },
  };
}

// action → { successor substring, a FULLY VALID legacy payload for that action's original .strict() Zod
// shape }. The dispatcher parses BEFORE checking retirement (D6 ordering test below), so a retirement
// assertion needs a payload that still passes the old schema — a bare {action} alone under-satisfies
// several `.strict()` variants (add-cargo, deduct-currency, etc.) and would surface
// TRADING_PLACES_INVALID_INPUT instead of the retirement message it's meant to test.
const RETIRED_ACTIONS_FIXTURES: Record<string, { successor: string; payload: Record<string, unknown> }> = {
  'list-settlements': { successor: 'trading-list-settlements', payload: {} },
  'list-cargo-types': { successor: 'trading-list-cargo-types', payload: {} },
  'get-season': { successor: 'trading-get-season', payload: {} },
  'set-season': { successor: 'trading-set-season', payload: { season: 'spring' } },
  'check-availability': { successor: 'trading-check-availability', payload: { settlement: 'Altdorf', availabilityRoll: 50 } },
  'calc-purchase-price': { successor: 'trading-calc-purchase-price', payload: { cargoName: 'Grain', quantity: 10 } },
  'calc-sale-price': { successor: 'trading-calc-sale-price', payload: { cargoName: 'Grain', quantity: 10, settlement: 'Altdorf' } },
  'haggle-test': { successor: 'trading-haggle-test', payload: { playerSkill: 40, merchantSkill: 40, playerRoll: 30, merchantRoll: 60 } },
  'gossip-test': { successor: 'trading-gossip-test', payload: { playerSkill: 40, playerRoll: 30 } },
  'add-cargo': { successor: 'trading-buy-cargo', payload: { cargoName: 'Grain', quantity: 10, totalCostBp: 2400, settlement: 'Altdorf' } },
  'remove-cargo': { successor: 'trading-sell-cargo', payload: { cargoId: 'lot1' } },
  'get-current-cargo': { successor: 'trading-get-hold', payload: {} },
  'get-transaction-history': { successor: 'list-transactions', payload: {} },
  'get-currency': { successor: 'get-wallet-balance', payload: { actorId: 'actor1' } },
  'deduct-currency': { successor: 'wallet-remove', payload: { actorId: 'actor1', amountBp: 100 } },
  'add-currency': { successor: 'wallet-add', payload: { actorId: 'actor1', amountBp: 100 } },
  'merchant-generation': { successor: 'trading-generate-merchant', payload: { settlement: 'Altdorf', cargoType: 'Grain', merchantType: 'producer' } },
  'get-price-modifiers': { successor: 'trading-get-price-modifiers', payload: {} },
  'set-price-modifiers': { successor: 'trading-set-price-modifiers', payload: { global: 1.1 } },
};

describe('module-trading-places — full retirement (Phase 7g)', () => {
  // One assertion per retired action, cloning the wfrp-economy.test.ts:1352-1386 retirement-test pattern.
  for (const [action, { successor, payload }] of Object.entries(RETIRED_ACTIONS_FIXTURES)) {
    it(`${action} → TRADING_PLACES_ACTION_RETIRED naming ${successor}`, async () => {
      (globalThis as any).game = makeGame({ tradingPlacesActive: true });
      const res: any = await dispatchModuleTradingPlaces({ action, ...payload });
      expect(res.success).toBe(false);
      expect(res.error).toContain('TRADING_PLACES_ACTION_RETIRED');
      expect(res.error).toContain(successor);
    });
  }

  it('has exactly 19 retired actions (baseline count — a change here must be a deliberate plan decision)', () => {
    expect(Object.keys(RETIRED_ACTIONS_FIXTURES)).toHaveLength(19);
  });

  it('retirement fires even for a non-GM caller (checked before any GM gate would matter)', async () => {
    (globalThis as any).game = { ...makeGame({ tradingPlacesActive: true }), user: { isGM: false, id: 'p1' } };
    const res: any = await dispatchModuleTradingPlaces({ action: 'add-cargo', ...RETIRED_ACTIONS_FIXTURES['add-cargo'].payload });
    expect(res.success).toBe(false);
    expect(res.error).toContain('TRADING_PLACES_ACTION_RETIRED');
  });

  // D6 ordering test — Risk 7g.A-1: the retirement short-circuit MUST run BEFORE requireModuleActive, or
  // a disabled module (the live end-state after this phase's Task 5.5) makes every retired action return
  // the generic MODULE_NOT_ACTIVE envelope instead of naming the successor — unreachable retirement
  // guidance is exactly the bug the plan's D6 decision exists to prevent.
  it('retirement fires even when trading-places is DISABLED — proves the short-circuit precedes requireModuleActive', async () => {
    (globalThis as any).game = makeGame({ tradingPlacesActive: false });
    const res: any = await dispatchModuleTradingPlaces({ action: 'list-settlements' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('TRADING_PLACES_ACTION_RETIRED');
    expect(res.error).toContain('trading-list-settlements');
    expect(res.error).not.toContain('MODULE_NOT_ACTIVE');
  });

  it('a genuinely unknown action → TRADING_PLACES_INVALID_INPUT regardless of module state (Zod rejects before requireModuleActive is ever reached — D6 parses first)', async () => {
    (globalThis as any).game = makeGame({ tradingPlacesActive: false });
    const res: any = await dispatchModuleTradingPlaces({ action: 'not-a-real-action' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('TRADING_PLACES_INVALID_INPUT');
    expect(res.error).not.toContain('ACTION_RETIRED');
  });

  it('malformed payload for a real retired action → TRADING_PLACES_INVALID_INPUT, never a retirement message for an unparseable action', async () => {
    (globalThis as any).game = makeGame({ tradingPlacesActive: true });
    const res: any = await dispatchModuleTradingPlaces({ action: 'add-cargo', quantity: 'not-a-number' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('TRADING_PLACES_INVALID_INPUT');
  });
});
