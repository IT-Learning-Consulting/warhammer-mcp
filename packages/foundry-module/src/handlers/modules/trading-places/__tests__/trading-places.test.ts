// wfrp_economy_system Phase 3 — Unit tests for module-trading-places dispatcher + guards.
//
// Deterministic: mocks globalThis.game (modules / user / settings / actors / time) and
// globalThis.TradingPlaces (the module's window-global getter API, main.js:1406-1413). No canvas / no UI.
//
// Mock-shape citations (PF-003 — no circular mocks; every mocked return shape was live-captured):
//   • money items { type:'money', system:{ quantity:{value}, coinValue:{value} } } — the committed
//     fixture convention at __tests__/phase13-sheet-flow.test.ts:66-67 + services/market.ts:31-36.
//   • performHaggleTest(playerSkill, merchantSkill, hasDealmakerTalent, options, rollFunction) consuming
//     rollFunction TWICE (player then merchant) — haggling-mechanics.js:100-113 (read 2026-07-10).
//   • TimeComponents.season as a NUMERIC index into game.time.calendar.seasons.values[] —
//     foundry v13 TimeComponents (phase3_pre_plan.md §Integration seams, Imperial preset 0=Spring..3=Winter).
//   • trading-places world settings (currentSeason/currentCargo/cargoCapacity/transactionHistory) —
//     main.js:694-847 registrations (read 2026-07-10).
//
// Coverage (Rule 9 — each test encodes WHY the behavior matters):
//   1. Inactive trading-places → MODULE_NOT_ACTIVE for read AND write (guard returns, never throws).
//   2. A write fired by a non-GM → TRADING_PLACES_ACCESS_DENIED (every WRITE_ACTION).
//   3. Confirm-gate boundary: 4799 BP needs no confirm; 4800 BP without confirm → CONFIRM_REQUIRED
//      BEFORE any write (CCR-4).
//   4. Unknown action / bad shape → TRADING_PLACES_INVALID_INPUT (discriminatedUnion reject).
//   5. Season resolution: calendar index wins (seasonSource:'calendar'); undefined index falls back to
//      the module setting (seasonSource:'module-setting'); neither → TRADING_PLACES_SEASON_UNRESOLVED.
//   6. deduct-currency beyond funds → TRADING_PLACES_INSUFFICIENT_FUNDS, zero writes.
//   7. Change-making arithmetic: deduct 300 BP from 2gc 0ss 0bp (480 BP) → 180 BP = 0gc 15ss 0bp,
//      asserted via Σ(qty×coinValue), not hand-waved strings.
//   8. Missing denomination halts loud (GC-only wallet cannot represent 180 BP) — no partial write.
//   9. add-cargo enforces the hold capacity and persists to currentCargo; remove-cargo partial removal
//      decrements quantity and recomputes totalCost.
//  10. haggle-test injects the pre-rolled queue: first rollFunction() call = playerRoll, second =
//      merchantRoll — the module's Math.random() default never fires.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { dispatchModuleTradingPlaces } from '../trading-places.js';

function makeSettings(seed: Record<string, any> = {}) {
  const store: Record<string, any> = {
    currentSeason: 'spring',
    currentCargo: [],
    cargoCapacity: 400,
    transactionHistory: [],
    ...seed,
  };
  const settings = {
    get: (_s: string, k: string) => store[k],
    set: vi.fn(async (_s: string, k: string, v: any) => {
      store[k] = v;
    }),
  };
  return { settings, store };
}

function makeMoneyItem(id: string, name: string, quantity: number, coinValue: number) {
  return { id, _id: id, name, type: 'money', system: { quantity: { value: quantity }, coinValue: { value: coinValue } } };
}

/** Actor whose updateEmbeddedDocuments actually mutates the mocked items (so DP-16 re-read verifies). */
function makeActor(id: string, name: string, money: any[]) {
  const actor: any = {
    id,
    name,
    itemTags: { money },
    updateEmbeddedDocuments: vi.fn(async (_type: string, updates: any[]) => {
      for (const u of updates) {
        const item = money.find((m) => m.id === (u._id ?? u.id));
        if (item) item.system.quantity.value = u['system.quantity.value'];
      }
    }),
  };
  return actor;
}

function makeGame(opts: {
  active?: boolean;
  isGM?: boolean;
  settings?: any;
  actors?: Record<string, any>;
  seasonIndex?: number | undefined;
  economyActive?: boolean;
}) {
  const actors = opts.actors ?? {};
  return {
    modules: {
      get: (id: string) => {
        if (id === 'trading-places') {
          return (opts.active ?? true) ? { active: true, title: 'Trading Places', version: '0.3.0' } : undefined;
        }
        if (id === 'wfrp4e-economy') {
          return opts.economyActive ? { active: true, title: 'Warhammer Economy', version: '1.0.0' } : undefined;
        }
        return undefined;
      },
    },
    user: { isGM: opts.isGM ?? true, id: 'gm1' },
    settings: opts.settings,
    actors: { get: (id: string) => actors[id] },
    time:
      opts.seasonIndex === undefined
        ? { components: {}, calendar: undefined }
        : {
            components: { season: opts.seasonIndex },
            calendar: { seasons: { values: [{ name: 'Spring' }, { name: 'Summer' }, { name: 'Autumn' }, { name: 'Winter' }] } },
          },
  };
}

function makeEngine(overrides: Record<string, any> = {}) {
  return {
    setCurrentSeason: vi.fn(async () => 'spring'),
    // Live engine shape (BUG-535): cargoTypes are plain name strings and cargoSize carries
    // totalSize — trading-engine.js:774 (legacy) / :851 (plan path); totalEP/size never existed.
    performCompleteAvailabilityCheck: vi.fn(async () => ({
      available: true,
      availabilityCheck: { chance: 70, roll: 42 },
      cargoTypes: ['Grain'],
      cargoSize: { totalSize: 80, baseMultiplier: 8, sizeMultiplier: 10 },
    })),
    // Live-captured calculator shape (2026-07-10, Grain/spring on the wfrp4e dataset): per-UNIT keys,
    // plain fields in canonical BP, unit = encumbrancePerUnit EP. The ...Canonical/formatted fields
    // reproduce the module's GC-misread decoration bug (×240) — the handler must never read them.
    calculatePurchasePrice: vi.fn(() => ({
      cargoName: 'Grain',
      basePricePerUnit: 240,
      finalPricePerUnit: 240,
      totalPrice: 2400,
      modifiers: [],
      basePricePerUnitCanonical: 57600,
      finalPricePerUnitCanonical: 57600,
      totalPriceCanonical: 576000,
      encumbrancePerUnit: 10,
    })),
    calculateSalePrice: vi.fn(() => ({
      cargoName: 'Grain',
      settlement: 'Altdorf',
      basePricePerUnit: 240,
      finalPricePerUnit: 300,
      totalPrice: 3000,
      modifiers: [],
      finalPricePerUnitCanonical: 72000,
      totalPriceCanonical: 720000,
      // sale returns carry NO encumbrancePerUnit — the handler falls back to 10
    })),
    performHaggleTest: vi.fn(),
    performGossipTest: vi.fn(),
    ...overrides,
  };
}

function makeDataManager(overrides: Record<string, any> = {}) {
  const settlements = [
    { name: 'Ubersreik', region: 'Reikland', size: 'Town', wealth: 3 },
    { name: 'Altdorf', region: 'Reikland', size: 'City', wealth: 5 },
  ];
  return {
    getAllSettlements: () => settlements,
    getSettlementsByRegion: (r: string) => settlements.filter((s) => s.region.toLowerCase() === r.toLowerCase()),
    getSettlement: (n: string) => settlements.find((s) => s.name.toLowerCase() === n.toLowerCase()) ?? null,
    getCargoTypes: () => [
      { name: 'Grain', category: 'Bulk Goods' },
      { name: 'Wine', category: 'Luxuries' },
    ],
    isTradeSettlement: () => false,
    ...overrides,
  };
}

function installModuleApi(api: { engine?: any; dataManager?: any }) {
  (globalThis as any).TradingPlaces = {
    getTradingEngine: () => api.engine ?? null,
    getDataManager: () => api.dataManager ?? null,
  };
}

beforeEach(() => {
  (globalThis as any).game = undefined;
});
afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).TradingPlaces;
  delete (globalThis as any).__wfrpEconomyRuntimeImport;
});

// ── 1. Inactive module guard ────────────────────────────────────────────────────

describe('module-active guard', () => {
  it('inactive trading-places → MODULE_NOT_ACTIVE on a write action (returns, never throws)', async () => {
    (globalThis as any).game = makeGame({ active: false });
    const res: any = await dispatchModuleTradingPlaces({ action: 'set-season', season: 'winter' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
    expect(res.error).toContain('trading-places');
  });

  it('inactive trading-places → MODULE_NOT_ACTIVE on a read action too', async () => {
    (globalThis as any).game = makeGame({ active: false });
    const res: any = await dispatchModuleTradingPlaces({ action: 'list-settlements' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
  });
});

// ── 2. GM gate ──────────────────────────────────────────────────────────────────

describe('GM gate', () => {
  const writeCalls: Array<Record<string, any>> = [
    { action: 'set-season', season: 'winter' },
    { action: 'add-cargo', cargoName: 'Grain', quantity: 10, totalCostBp: 120, settlement: 'Ubersreik' },
    { action: 'remove-cargo', cargoId: 'c1' },
    { action: 'deduct-currency', actorId: 'a1', amountBp: 100 },
    { action: 'add-currency', actorId: 'a1', amountBp: 100 },
  ];

  for (const call of writeCalls) {
    it(`${call.action} fired by a non-GM → TRADING_PLACES_ACCESS_DENIED`, async () => {
      const { settings } = makeSettings();
      (globalThis as any).game = makeGame({ isGM: false, settings });
      installModuleApi({ engine: makeEngine(), dataManager: makeDataManager() });
      const res: any = await dispatchModuleTradingPlaces(call);
      expect(res.success).toBe(false);
      expect(res.error).toContain('TRADING_PLACES_ACCESS_DENIED');
      expect(settings.set).not.toHaveBeenCalled();
    });
  }
});

// ── 3. Confirm-gate boundary (CCR-4) ──────────────────────────────────────────────

describe('confirm gate on currency writes (CCR-4, >= 4800 BP)', () => {
  it('4799 BP deduct needs NO confirm and succeeds (boundary is strictly below the threshold)', async () => {
    const money = [
      makeMoneyItem('gc', 'Gold Crown', 20, 240), // 4800 BP
      makeMoneyItem('ss', 'Silver Shilling', 0, 12),
      makeMoneyItem('bp', 'Brass Penny', 0, 1),
    ];
    const actor = makeActor('a1', 'Testkarl', money);
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ settings, actors: { a1: actor } });
    installModuleApi({ engine: makeEngine(), dataManager: makeDataManager() });
    const res: any = await dispatchModuleTradingPlaces({ action: 'deduct-currency', actorId: 'a1', amountBp: 4799 });
    expect(res.success).toBe(true);
    expect(res.data.newTotalBp).toBe(1); // 4800 - 4799 = 0gc 0ss 1bp
  });

  it('4800 BP deduct WITHOUT confirm → TRADING_PLACES_CONFIRM_REQUIRED, zero writes', async () => {
    const money = [makeMoneyItem('gc', 'Gold Crown', 30, 240)];
    const actor = makeActor('a1', 'Testkarl', money);
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ settings, actors: { a1: actor } });
    installModuleApi({ engine: makeEngine(), dataManager: makeDataManager() });
    const res: any = await dispatchModuleTradingPlaces({ action: 'deduct-currency', actorId: 'a1', amountBp: 4800 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('TRADING_PLACES_CONFIRM_REQUIRED');
    expect(actor.updateEmbeddedDocuments).not.toHaveBeenCalled();
  });

  it('4800 BP deduct WITH confirm:true executes', async () => {
    const money = [makeMoneyItem('gc', 'Gold Crown', 30, 240)]; // 7200 BP
    const actor = makeActor('a1', 'Testkarl', money);
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ settings, actors: { a1: actor } });
    installModuleApi({ engine: makeEngine(), dataManager: makeDataManager() });
    const res: any = await dispatchModuleTradingPlaces({ action: 'deduct-currency', actorId: 'a1', amountBp: 4800, confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.newTotalBp).toBe(2400); // 7200 - 4800, representable in whole GC
  });
});

// ── 4. Invalid input ──────────────────────────────────────────────────────────────

describe('input validation', () => {
  it('unknown action → TRADING_PLACES_INVALID_INPUT (discriminatedUnion reject)', async () => {
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ settings });
    const res: any = await dispatchModuleTradingPlaces({ action: 'open-ui' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('TRADING_PLACES_INVALID_INPUT');
  });

  it('remove-cargo with neither cargoId nor cargoName → TRADING_PLACES_INVALID_INPUT (handler cross-field rule)', async () => {
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ settings });
    const res: any = await dispatchModuleTradingPlaces({ action: 'remove-cargo' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('TRADING_PLACES_INVALID_INPUT');
  });
});

// ── 5. Season resolution (CCR-CALENDAR) ───────────────────────────────────────────

describe('season resolution', () => {
  it('calendar index resolves to the season name with seasonSource:"calendar" (index 2 → autumn)', async () => {
    const { settings } = makeSettings({ currentSeason: 'spring' });
    (globalThis as any).game = makeGame({ settings, seasonIndex: 2 });
    const res: any = await dispatchModuleTradingPlaces({ action: 'get-season' });
    expect(res.success).toBe(true);
    expect(res.data.season).toBe('autumn');
    expect(res.data.seasonSource).toBe('calendar');
  });

  it('undefined calendar index falls back to the module setting with seasonSource:"module-setting"', async () => {
    const { settings } = makeSettings({ currentSeason: 'winter' });
    (globalThis as any).game = makeGame({ settings, seasonIndex: undefined });
    const res: any = await dispatchModuleTradingPlaces({ action: 'get-season' });
    expect(res.success).toBe(true);
    expect(res.data.season).toBe('winter');
    expect(res.data.seasonSource).toBe('module-setting');
  });

  it('no calendar index AND an invalid module setting → TRADING_PLACES_SEASON_UNRESOLVED', async () => {
    const { settings } = makeSettings({ currentSeason: '' });
    (globalThis as any).game = makeGame({ settings, seasonIndex: undefined });
    const res: any = await dispatchModuleTradingPlaces({ action: 'get-season' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('TRADING_PLACES_SEASON_UNRESOLVED');
  });
});

// ── 6/7/8. Currency writes — coinValue-keyed change-making ────────────────────────

describe('currency writes (coinValue-keyed, consolidate-style change-making)', () => {
  it('deduct beyond funds → TRADING_PLACES_INSUFFICIENT_FUNDS, zero writes, no ledger row', async () => {
    const money = [makeMoneyItem('ss', 'Silver Shilling', 5, 12)]; // 60 BP
    const actor = makeActor('a1', 'Testkarl', money);
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ settings, actors: { a1: actor } });
    const res: any = await dispatchModuleTradingPlaces({ action: 'deduct-currency', actorId: 'a1', amountBp: 100 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('TRADING_PLACES_INSUFFICIENT_FUNDS');
    expect(actor.updateEmbeddedDocuments).not.toHaveBeenCalled();
  });

  it('deduct 300 BP from 2gc 0ss 0bp → 180 BP = 0gc 15ss 0bp (Σ qty×coinValue asserted)', async () => {
    const money = [
      makeMoneyItem('gc', 'Gold Crown', 2, 240),
      makeMoneyItem('ss', 'Silver Shilling', 0, 12),
      makeMoneyItem('bp', 'Brass Penny', 0, 1),
    ];
    const actor = makeActor('a1', 'Testkarl', money);
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ settings, actors: { a1: actor } });
    const res: any = await dispatchModuleTradingPlaces({ action: 'deduct-currency', actorId: 'a1', amountBp: 300 });
    expect(res.success).toBe(true);
    expect(res.data.previousTotalBp).toBe(480);
    expect(res.data.newTotalBp).toBe(180);
    // Post-write composition: 180 BP consolidates to 0gc 15ss 0bp.
    const byId = Object.fromEntries(money.map((m) => [m.id, m.system.quantity.value]));
    expect(byId['gc']).toBe(0);
    expect(byId['ss']).toBe(15);
    expect(byId['bp']).toBe(0);
    const sum = money.reduce((s, m) => s + m.system.quantity.value * m.system.coinValue.value, 0);
    expect(sum).toBe(180);
  });

  it('missing denomination halts loud: GC-only wallet cannot represent 180 BP → no partial write', async () => {
    const money = [makeMoneyItem('gc', 'Gold Crown', 2, 240)]; // 480 BP, no SS/BP items
    const actor = makeActor('a1', 'Testkarl', money);
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ settings, actors: { a1: actor } });
    const res: any = await dispatchModuleTradingPlaces({ action: 'deduct-currency', actorId: 'a1', amountBp: 300 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('TRADING_PLACES_MISSING_DENOMINATION');
    expect(actor.updateEmbeddedDocuments).not.toHaveBeenCalled();
    expect(money[0]!.system.quantity.value).toBe(2); // untouched
  });

  it('add-currency appends a source:"trade" ledger row when wfrp4e-economy is active (type trade-sell)', async () => {
    const money = [
      makeMoneyItem('gc', 'Gold Crown', 1, 240),
      makeMoneyItem('ss', 'Silver Shilling', 0, 12),
      makeMoneyItem('bp', 'Brass Penny', 0, 1),
    ];
    const actor = makeActor('a1', 'Testkarl', money);
    const { settings } = makeSettings();
    const logTransaction = vi.fn(async () => undefined);
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ TransactionLogger: { logTransaction } });
    (globalThis as any).game = makeGame({ settings, actors: { a1: actor }, economyActive: true });
    const res: any = await dispatchModuleTradingPlaces({ action: 'add-currency', actorId: 'a1', amountBp: 300 });
    expect(res.success).toBe(true);
    expect(res.data.newTotalBp).toBe(540);
    expect(res.data.ledgered).toBe(true);
    expect(logTransaction).toHaveBeenCalledTimes(1);
    const row = logTransaction.mock.calls[0]![0] as any;
    expect(row.source).toBe('trade');
    expect(row.type).toBe('trade-sell');
    expect(row.amount).toBe(300);
  });
});

// ── 9. Cargo hold ─────────────────────────────────────────────────────────────────

describe('cargo hold (currentCargo world-setting store)', () => {
  it('add-cargo persists a lot and enforces the 400 EP capacity', async () => {
    const { settings, store } = makeSettings({ currentCargo: [], cargoCapacity: 400 });
    (globalThis as any).game = makeGame({ settings });
    installModuleApi({ dataManager: makeDataManager() });

    const ok: any = await dispatchModuleTradingPlaces({
      action: 'add-cargo',
      cargoName: 'Grain',
      quantity: 380,
      totalCostBp: 456,
      settlement: 'Ubersreik',
    });
    expect(ok.success).toBe(true);
    expect(ok.data.holdUsedEp).toBe(380);
    expect(store.currentCargo).toHaveLength(1);
    expect(store.currentCargo[0].cargo).toBe('Grain');
    expect(store.currentCargo[0].category).toBe('Bulk Goods'); // resolved from the dataset

    const over: any = await dispatchModuleTradingPlaces({
      action: 'add-cargo',
      cargoName: 'Wine',
      quantity: 30,
      totalCostBp: 900,
      settlement: 'Ubersreik',
    });
    expect(over.success).toBe(false);
    expect(over.error).toContain('TRADING_PLACES_OVER_CAPACITY');
    expect(store.currentCargo).toHaveLength(1); // unchanged
  });

  it('remove-cargo partial removal decrements quantity and recomputes totalCost', async () => {
    const { settings, store } = makeSettings({
      currentCargo: [
        { id: 'lot1', cargo: 'Grain', category: 'Bulk Goods', quantity: 100, pricePerEP: 2, totalCost: 200, settlement: 'Ubersreik', season: 'spring', contraband: false },
      ],
    });
    (globalThis as any).game = makeGame({ settings });
    const res: any = await dispatchModuleTradingPlaces({ action: 'remove-cargo', cargoId: 'lot1', quantity: 40 });
    expect(res.success).toBe(true);
    expect(res.data.removedQuantity).toBe(40);
    expect(res.data.remainingQuantity).toBe(60);
    expect(store.currentCargo[0].quantity).toBe(60);
    expect(store.currentCargo[0].totalCost).toBe(120); // 2 BP/EP × 60 EP
  });
});

// ── 10. Pre-rolled totals (the module PRNG never fires) ───────────────────────────

describe('haggle/gossip pre-rolled injection', () => {
  it('haggle-test rollFunction queue yields playerRoll first, merchantRoll second', async () => {
    const observedRolls: number[] = [];
    // Mock consumes rollFunction exactly like haggling-mechanics.js:112-113 (two sequential
    // performSkillTest calls sharing one rollFunction — player first, merchant second).
    const performHaggleTest = vi.fn(async (_p: number, _m: number, _t: boolean, _o: any, rollFunction: () => number) => {
      observedRolls.push(rollFunction()); // player roll
      observedRolls.push(rollFunction()); // merchant roll
      return { success: true, resultDescription: 'Player wins', player: {}, merchant: {} };
    });
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ settings });
    installModuleApi({ engine: makeEngine({ performHaggleTest }) });

    const res: any = await dispatchModuleTradingPlaces({
      action: 'haggle-test',
      playerSkill: 45,
      merchantSkill: 40,
      playerRoll: 17,
      merchantRoll: 88,
    });
    expect(res.success).toBe(true);
    expect(observedRolls).toEqual([17, 88]);
  });

  it('gossip-test passes the pre-rolled total and the difficulty through', async () => {
    const performGossipTest = vi.fn(async (_skill: number, options: any, rollFunction: () => number) => ({
      success: true,
      roll: rollFunction(),
      modifiedSkill: 35,
      degrees: 2,
      resultDescription: 'Gossip Test Success (2 degrees)',
      testName: 'Gossip Test',
      difficulty: options?.difficulty,
    }));
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ settings });
    installModuleApi({ engine: makeEngine({ performGossipTest }) });

    const res: any = await dispatchModuleTradingPlaces({ action: 'gossip-test', playerSkill: 45, playerRoll: 21, difficulty: -20 });
    expect(res.success).toBe(true);
    expect(res.data.roll).toBe(21);
    expect(performGossipTest.mock.calls[0]![1]).toEqual({ difficulty: -20 });
  });
});

// ── 10b. Haggle verdict derivation (BUG-534 regression — live smoke 2026-07-10) ──────────
// The module engine's trailing tie-check (haggling-mechanics.js:146) compares UNSIGNED degrees,
// so success-by-N vs failure-by-N returns success:false + "Tie - no price change". The handler
// derives the winner from the per-side success flags when they differ. Mocked engine returns
// mirror the live shape: performSkillTest (haggling-mechanics.js:74-84) yields
// { testName, baseSkill, modifiers, totalModifier, modifiedSkill, roll, success, degrees,
//   resultDescription }; performHaggleTest (:151-157) wraps them as { success, player,
//   merchant, resultDescription } — including the buggy tie override on equal degrees.
describe('haggle-test verdict derivation (BUG-534)', () => {
  const skillTest = (name: string, skill: number, roll: number) => {
    const success = roll <= skill;
    const degrees = success ? Math.floor((skill - roll) / 10) + 1 : Math.floor((roll - skill - 1) / 10) + 1;
    return { testName: name, baseSkill: skill, modifiers: [], totalModifier: 0, modifiedSkill: skill, roll, success, degrees, resultDescription: `${name} ${success ? 'Success' : 'Failure'} (${degrees} degrees)` };
  };
  const install = (engineResult: any) => {
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ settings });
    installModuleApi({ engine: makeEngine({ performHaggleTest: vi.fn(async () => engineResult) }) });
  };
  const fire = (input: Partial<{ playerSkill: number; merchantSkill: number; playerRoll: number; merchantRoll: number }>) =>
    dispatchModuleTradingPlaces({ action: 'haggle-test', playerSkill: 90, merchantSkill: 10, playerRoll: 5, merchantRoll: 95, ...input });

  it('player success vs merchant failure with equal unsigned degrees overrides the engine "Tie" to a player win', async () => {
    // live 2026-07-10 repro: 90/10 + rolls 5/95 → success-by-9 vs failure-by-9 → engine "Tie"
    install({ success: false, player: skillTest('Player Haggle', 90, 5), merchant: skillTest('Merchant Haggle', 10, 95), resultDescription: 'Tie - no price change' });
    const res: any = await fire({});
    expect(res.success).toBe(true);
    expect(res.data.playerWins).toBe(true);
    expect(res.data.resultDescription).toMatch(/^Player wins - merchant failed their test/);
  });

  it('player failure vs merchant success with equal unsigned degrees corrects the "Tie" description to a merchant win', async () => {
    install({ success: false, player: skillTest('Player Haggle', 10, 95), merchant: skillTest('Merchant Haggle', 90, 5), resultDescription: 'Tie - no price change' });
    const res: any = await fire({ playerSkill: 10, merchantSkill: 90, playerRoll: 95, merchantRoll: 5 });
    expect(res.data.playerWins).toBe(false);
    expect(res.data.resultDescription).toMatch(/^Merchant wins - player failed their test/);
  });

  it('both succeed with distinct degrees passes the engine verdict through verbatim', async () => {
    install({ success: true, player: skillTest('Player Haggle', 90, 1), merchant: skillTest('Merchant Haggle', 90, 85), resultDescription: 'Player wins - 9 vs 1 degrees of success' });
    const res: any = await fire({ merchantSkill: 90, playerRoll: 1, merchantRoll: 85 });
    expect(res.data.playerWins).toBe(true);
    expect(res.data.resultDescription).toBe('Player wins - 9 vs 1 degrees of success');
  });

  it('both fail with equal degrees is a genuine tie and stays untouched', async () => {
    install({ success: false, player: skillTest('Player Haggle', 10, 95), merchant: skillTest('Merchant Haggle', 10, 95), resultDescription: 'Tie - no price change' });
    const res: any = await fire({ playerSkill: 10, merchantSkill: 10, playerRoll: 95, merchantRoll: 95 });
    expect(res.data.playerWins).toBe(false);
    expect(res.data.resultDescription).toBe('Tie - no price change');
  });
});

// ── 9. Price-calc BP mapping (F08 regression — live smoke 2026-07-10) ────────────
// The calculators return per-UNIT keys (finalPricePerUnit/totalPrice), NOT the availability
// pipeline's per-EP keys (finalPricePerEP/totalValue) the handler originally read — which made
// every price report 0. These pin the per-EP mapping against the live-captured shape above.

describe('price-calc BP mapping (F08 regression)', () => {
  it('calc-purchase-price maps finalPricePerUnit/encumbrancePerUnit to per-EP BP (240/unit → 24/EP, 10 EP → 240 BP)', async () => {
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ settings, seasonIndex: 0 });
    installModuleApi({ engine: makeEngine(), dataManager: makeDataManager() });

    const res: any = await dispatchModuleTradingPlaces({ action: 'calc-purchase-price', cargoName: 'Grain', quantity: 10 });
    expect(res.success).toBe(true);
    expect(res.data.pricePerEpBp).toBe(24);
    expect(res.data.totalBp).toBe(240);
  });

  it('calc-sale-price falls back to 10 EP/unit when the sale calc omits encumbrancePerUnit (300/unit → 30/EP, 10 EP → 300 BP)', async () => {
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ settings, seasonIndex: 0 });
    installModuleApi({ engine: makeEngine(), dataManager: makeDataManager() });

    const res: any = await dispatchModuleTradingPlaces({ action: 'calc-sale-price', cargoName: 'Grain', quantity: 10, settlement: 'Altdorf' });
    expect(res.success).toBe(true);
    expect(res.data.pricePerEpBp).toBe(30);
    expect(res.data.totalBp).toBe(300);
  });

  it('never reads the ...Canonical decoration fields (module GC-misread would inflate ×240)', async () => {
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ settings, seasonIndex: 0 });
    installModuleApi({ engine: makeEngine(), dataManager: makeDataManager() });

    const res: any = await dispatchModuleTradingPlaces({ action: 'calc-purchase-price', cargoName: 'Grain', quantity: 10 });
    expect(res.data.totalBp).not.toBe(576000);
    expect(res.data.pricePerEpBp).not.toBe(5760);
  });
});

// ── 11. Cargo-name pre-resolution (BUG-533) ───────────────────────────────────────
// The engine's calculators THROW on unknown cargo (purchase-price-calculator.js:69, read
// 2026-07-10) instead of returning null, so an unresolved name would bypass targetNotFound()
// and surface TRADING_PLACES_HANDLER_ERROR (live-reproduced 2026-07-10). The handlers must
// resolve against dm.getCargoTypes() — the very array the engine searches (live-captured
// 2026-07-10 probe macro: [{name:'Wine/Brandy', category:'Luxury Goods'}, ...]) — BEFORE the
// engine call, so unknown cargo keeps the promised TARGET_NOT_FOUND token and casing variants
// still price.

describe('cargo-name pre-resolution (BUG-533)', () => {
  it('unknown cargo → TRADING_PLACES_TARGET_NOT_FOUND and the throwing engine is never reached', async () => {
    const { settings } = makeSettings();
    const engine = makeEngine();
    (globalThis as any).game = makeGame({ settings, seasonIndex: 0 });
    installModuleApi({ engine, dataManager: makeDataManager() });

    const res: any = await dispatchModuleTradingPlaces({ action: 'calc-purchase-price', cargoName: 'Warpstone', quantity: 10 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('TRADING_PLACES_TARGET_NOT_FOUND');
    expect(engine.calculatePurchasePrice).not.toHaveBeenCalled();
  });

  it('calc-sale-price with unknown cargo → TRADING_PLACES_TARGET_NOT_FOUND, engine never reached', async () => {
    const { settings } = makeSettings();
    const engine = makeEngine();
    (globalThis as any).game = makeGame({ settings, seasonIndex: 0 });
    installModuleApi({ engine, dataManager: makeDataManager() });

    const res: any = await dispatchModuleTradingPlaces({ action: 'calc-sale-price', cargoName: 'Warpstone', quantity: 10, settlement: 'Altdorf' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('TRADING_PLACES_TARGET_NOT_FOUND');
    expect(engine.calculateSalePrice).not.toHaveBeenCalled();
  });

  it('case-insensitive match resolves to the dataset\'s own name and passes THAT to the engine', async () => {
    const { settings } = makeSettings();
    const engine = makeEngine();
    (globalThis as any).game = makeGame({ settings, seasonIndex: 0 });
    installModuleApi({ engine, dataManager: makeDataManager() });

    const res: any = await dispatchModuleTradingPlaces({ action: 'calc-purchase-price', cargoName: 'grain', quantity: 10 });
    expect(res.success).toBe(true);
    expect(res.data.cargoName).toBe('Grain'); // dataset casing echoed, not caller casing
    expect(engine.calculatePurchasePrice.mock.calls[0]![0]).toBe('Grain');
  });
});

// ── 12. check-availability enrichment mapping (BUG-535) ──────────────────────────
// The handler originally read cargoSize.totalEP/.size — keys that never existed on live
// returns (the engine returns totalSize in BOTH the legacy and plan paths,
// trading-engine.js:774/851) — and trusted engine cargoTypes, whose pipeline branch reads
// slot.cargoType||slot.label while the pipeline actually emits slot.cargo.name
// (cargo-availability-pipeline.js:347-357), degrading to [] on retired-'Trade' settlements.
// Live-reproduced 2026-07-10 (ALTDORF available:true, cargoTypes:[], cargoSizeEp:null).
// These pin: totalSize is read, and cargo names are recovered from availabilityCheck.plan.slots
// when the engine's own cargoTypes come back empty.

describe('check-availability enrichment (BUG-535)', () => {
  it('available result populates cargoTypes from engine strings and cargoSizeEp from totalSize', async () => {
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ settings, seasonIndex: 0 });
    installModuleApi({ engine: makeEngine(), dataManager: makeDataManager() });

    const res: any = await dispatchModuleTradingPlaces({ action: 'check-availability', settlement: 'Altdorf', availabilityRoll: 42 });
    expect(res.success).toBe(true);
    expect(res.data.available).toBe(true);
    expect(res.data.cargoTypes).toEqual(['Grain']);
    expect(res.data.cargoSizeEp).toBe(80);
  });

  it('empty engine cargoTypes recovers deduped names from plan slots, dropping Unavailable placeholders', async () => {
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ settings, seasonIndex: 0 });
    const engine = makeEngine({
      performCompleteAvailabilityCheck: vi.fn(async () => ({
        available: true,
        availabilityCheck: {
          chance: 100,
          roll: 1,
          // Pipeline-path check shape: _processAvailabilityPlan attaches the full plan
          // (trading-engine.js:477-486); slots carry cargo.name (cargo-availability-pipeline.js:347-357).
          plan: {
            slots: [
              { slotNumber: 1, cargo: { name: 'Wine/Brandy' } },
              { slotNumber: 2, cargo: { name: 'Grain' } },
              { slotNumber: 3, cargo: { name: 'Grain' } },
              { slotNumber: 4, cargo: { name: 'Unavailable' } },
            ],
          },
        },
        cargoTypes: [], // engine's slot.cargoType||slot.label misread → always empty on the pipeline path
        cargoSize: { totalSize: 640, baseMultiplier: 8, sizeMultiplier: 80 },
      })),
    });
    installModuleApi({ engine, dataManager: makeDataManager() });

    const res: any = await dispatchModuleTradingPlaces({ action: 'check-availability', settlement: 'Altdorf', availabilityRoll: 1 });
    expect(res.success).toBe(true);
    expect(res.data.cargoTypes).toEqual(['Wine/Brandy', 'Grain']);
    expect(res.data.cargoSizeEp).toBe(640);
  });

  it('LIVE path (engine has no pipeline → legacy [] cargoTypes, no plan): names come from dm.getCargoAvailabilityPipeline().run', async () => {
    // Live config: new TradingEngine(dataManager) with no options (main.js:1167) → legacy path,
    // no plan on the check, cargoTypes [] (lowercase dataset flags never match the legacy map).
    // The UI's canonical source is dm.getCargoAvailabilityPipeline().run({settlement, season,
    // rollPercentile}) → { settlement, slotPlan, candidateTable, slots } with slots[].cargo.name
    // (BuyingFlow.js:105 + cargo-availability-pipeline.js:107-113, read 2026-07-11).
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ settings, seasonIndex: 0 });
    const engine = makeEngine({
      performCompleteAvailabilityCheck: vi.fn(async () => ({
        available: true,
        availabilityCheck: { chance: 100, roll: 1 },
        cargoTypes: [],
        cargoSize: { totalSize: 100, baseMultiplier: 10, sizeMultiplier: 10 },
      })),
    });
    const pipelineRun = vi.fn(async () => ({
      settlement: { name: 'ALTDORF' },
      slotPlan: {},
      candidateTable: {},
      slots: [{ slotNumber: 1, cargo: { name: 'Luxury Goods' } }, { slotNumber: 2, cargo: { name: 'Grain' } }],
    }));
    installModuleApi({
      engine,
      dataManager: makeDataManager({ getCargoAvailabilityPipeline: () => ({ run: pipelineRun }) }),
    });

    const res: any = await dispatchModuleTradingPlaces({ action: 'check-availability', settlement: 'Altdorf', availabilityRoll: 1 });
    expect(res.success).toBe(true);
    expect(res.data.cargoTypes).toEqual(['Luxury Goods', 'Grain']);
    expect(res.data.cargoSizeEp).toBe(100);
    // The pipeline was driven with a deterministic rollPercentile, never Foundry chat rolls.
    expect(pipelineRun).toHaveBeenCalledTimes(1);
    expect(typeof pipelineRun.mock.calls[0]![0].rollPercentile).toBe('function');
  });
});
