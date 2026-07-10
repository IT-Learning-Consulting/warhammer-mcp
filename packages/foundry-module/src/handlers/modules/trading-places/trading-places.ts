// DIALOG-PATH: DIALOG_FREE — every wrapped surface is a pure calc/data method (TradingEngine price/
// haggle/availability math, DataManager settlement/cargo lookups) or a raw awaited game.settings.set /
// actor.updateEmbeddedDocuments. Grep-verified: Dialog/prompt paths exist ONLY in the module's ui/
// classes (TradingPlacesApplication and friends), none of which this handler imports or invokes.
//
// wfrp_economy_system Phase 3 — module-trading-places handler (Trading Places v0.3.0, WFRP4e
// bulk-cargo trading — Death on the Reik algorithm).
//
// Always-registered umbrella. requireModuleActive('trading-places') is the FIRST active-state check —
// RETURNS the MODULE_NOT_ACTIVE envelope, never throws (v1 Phase 1 contract).
//
// 16 actions across 7 idioms (phase3_pre_plan.md §Working primitives; PRD R3.1-R3.3):
//
//   ⚠ ROUTING DEVIATIONS (phase3_pre_plan §Module defects — verified against module source):
//     • Module singletons are reached ONLY via window.TradingPlaces.getDataManager()/getTradingEngine()
//       (main.js:1406-1413 ready-hook closures). game.modules.get('trading-places').dataManager etc.
//       are PERMANENTLY NULL (assigned at script-eval time, main.js:1497-1506) — never use them.
//     • Currency writes are OUR OWN coinValue-keyed wfrp4e money-item writes. The module's
//       SystemAdapter.deductCurrency/addCurrency target the legacy system.money.gc/ss/bp flat fields
//       that no longer exist on wfrp4e actors — NEVER delegate coin movement to the SystemAdapter.
//     • The module's compound buy path (validatePurchase/performPurchase) was unreachable dead code,
//       disposed 2026-07-10 (patch-log.md P3-1.2). Buys/sells are orchestrated by callers composing
//       deduct-currency + add-cargo (buy) / remove-cargo + add-currency (sell) — ADR-015 / Risk 3.A.
//     • haggle-test/gossip-test inject a rollFunction returning the PRE-ROLLED input totals — the
//       module's internal PRNG default roll (haggling-mechanics.js:64, chat-invisible) never fires.
//       performHaggleTest consumes the rollFunction TWICE (player then merchant), so the injection is
//       a queue, not a constant.
//     • Season resolves calendar-first (CCR-CALENDAR): game.time.components.season is a NUMERIC INDEX
//       into game.time.calendar.seasons.values (Imperial preset: 0=spring..3=winter); fall back to the
//       module's currentSeason setting, disclosing the source via seasonSource.
//
// Ledger (CCR-LEDGER/HC5): every currency write appends a wfrp-economy unified-ledger row with
// source:'trade' via recordEconomyTransaction (fail-open, append-after-verify, NO economyId — trade
// rows aren't bound to a bank economy). Item-piles handlers are NEVER called from here (their
// self-logging would tag rows 'itempiles'; CCR-ITEMPILES-CONCURRENCY forbids same-tick pairing anyway).
//
// Confirm-gate (CCR-4): deduct-currency/add-currency at/above LARGE_TRANSFER_THRESHOLD (4800 BP = 20 GC)
// require confirm:true (handler `!== true` reject, NOT z.literal(true)).

import { requireModuleActive } from '../_shared/require-module-active.js';
import { TradingPlacesInput, type TradingPlacesInputType } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { Envelope, getGame, isGM } from '../_shared/handler-utils.js';
import { recordEconomyTransaction } from '../wfrp-economy/ledger.js';

const MODULE_ID = 'trading-places';
const SETTING_SCOPE = 'trading-places';
const LARGE_TRANSFER_THRESHOLD = 4800; // 20 GC — currency writes at/above require confirm:true (CCR-4)
const VALID_SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;

// Write actions are GM-gated (warhammer-mcp runs as GM; world-setting + actor-item writes would fail or
// silently no-op for a non-GM, which the post-write verify would surface as NOT_PERSISTED — reject early).
const WRITE_ACTIONS = new Set(['set-season', 'add-cargo', 'remove-cargo', 'deduct-currency', 'add-currency']);

// ── Local error-token helpers (pre-write rejections carry no _NOT_PERSISTED suffix) ──

function targetNotFound(detail: string): { success: false; error: string } {
  return { success: false, error: `TRADING_PLACES_TARGET_NOT_FOUND: ${detail}` };
}

function notPersisted(detail: string): { success: false; error: string } {
  return { success: false, error: `TRADING_PLACES_NOT_PERSISTED: ${detail}` };
}

function confirmRequired(detail: string): { success: false; error: string } {
  return { success: false, error: `TRADING_PLACES_CONFIRM_REQUIRED: ${detail}` };
}

function seasonUnresolved(detail: string): { success: false; error: string } {
  return { success: false, error: `TRADING_PLACES_SEASON_UNRESOLVED: ${detail}` };
}

function apiUnavailable(detail: string): { success: false; error: string } {
  return { success: false, error: `TRADING_PLACES_MODULE_API_UNAVAILABLE: ${detail}` };
}

// ── Module-API access (window.TradingPlaces getters ONLY — see routing deviations) ──

function getTradingPlacesApi(): any | null {
  const api = (globalThis as any).window?.TradingPlaces ?? (globalThis as any).TradingPlaces;
  return api ?? null;
}

function getDataManager(): any | null {
  return getTradingPlacesApi()?.getDataManager?.() ?? null;
}

function getTradingEngine(): any | null {
  return getTradingPlacesApi()?.getTradingEngine?.() ?? null;
}

// ── Settings access ──────────────────────────────────────────────────────────────

function getSetting(key: string): any {
  return getGame()?.settings?.get?.(SETTING_SCOPE, key);
}

async function setSetting(key: string, value: unknown): Promise<void> {
  await getGame().settings.set(SETTING_SCOPE, key, value);
}

function readCurrentCargo(): any[] {
  const cargo = getSetting('currentCargo');
  if (!Array.isArray(cargo)) return [];
  // Deep-clone: callers mutate entries in place, and Foundry's settings cache can hand back the
  // same reference — the DP-16 post-write re-read must exercise storage, not our own mutation.
  const f = (globalThis as any).foundry;
  return f?.utils?.deepClone ? f.utils.deepClone(cargo) : JSON.parse(JSON.stringify(cargo));
}

function readCargoCapacity(): number {
  const cap = Number(getSetting('cargoCapacity'));
  return Number.isFinite(cap) && cap > 0 ? cap : 400;
}

function holdUsedEp(cargo: any[]): number {
  return cargo.reduce((sum, c) => sum + Number(c?.quantity ?? 0), 0);
}

function randomId(): string {
  const f = (globalThis as any).foundry;
  if (f?.utils?.randomID) return f.utils.randomID(16);
  // Crypto fallback (tests only — Foundry always has foundry.utils.randomID). Deliberately avoids
  // the banned PRNG token: AC-10 pins zero PRNG use in the tool path (rolls are always pre-rolled inputs).
  const bytes = new Uint8Array(12);
  (globalThis as any).crypto?.getRandomValues?.(bytes);
  return Array.from(bytes, (b: number) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

// ── HC1 tri-currency display (full triple, zeros shown) for ledger descriptions ──

function bpTriple(totalBp: number): string {
  const sign = totalBp < 0 ? '-' : '';
  const abs = Math.abs(Math.round(totalBp));
  const gc = Math.floor(abs / 240);
  const ss = Math.floor((abs % 240) / 12);
  const b = abs % 12;
  return `${sign}${gc}gc ${ss}ss ${b}bp`;
}

// ── Season resolution (CCR-CALENDAR) ──────────────────────────────────────────────

type SeasonSource = 'calendar' | 'module-setting' | 'explicit';

function isValidSeason(s: unknown): s is (typeof VALID_SEASONS)[number] {
  return typeof s === 'string' && (VALID_SEASONS as readonly string[]).includes(s);
}

/**
 * Resolve the effective season: explicit argument > Foundry calendar (numeric TimeComponents.season
 * index into game.time.calendar.seasons.values) > the module's manual currentSeason setting.
 * Returns null when nothing resolves (caller emits TRADING_PLACES_SEASON_UNRESOLVED).
 */
function resolveSeason(explicit?: string): { season: string; seasonSource: SeasonSource } | null {
  if (isValidSeason(explicit)) return { season: explicit, seasonSource: 'explicit' };

  const game = getGame();
  const idx = game?.time?.components?.season;
  if (typeof idx === 'number' && Number.isInteger(idx)) {
    const name = game?.time?.calendar?.seasons?.values?.[idx]?.name;
    const lowered = typeof name === 'string' ? name.toLowerCase() : null;
    if (isValidSeason(lowered)) return { season: lowered, seasonSource: 'calendar' };
  }

  const setting = getSetting('currentSeason');
  if (isValidSeason(setting)) return { season: setting, seasonSource: 'module-setting' };

  return null;
}

// ── Money items (coinValue-keyed — NEVER name-matched, manage-character.ts:988 locale-bug class) ──

function moneyItems(actor: any): any[] {
  const tagged = actor?.itemTags?.['money'];
  if (Array.isArray(tagged)) return tagged;
  const items = actor?.items;
  const all: any[] = typeof items?.filter === 'function' ? items.filter((i: any) => i?.type === 'money') : [];
  return all;
}

function coinValueOf(item: any): number {
  return Number(item?.system?.coinValue?.value ?? 0);
}

function quantityOf(item: any): number {
  return Number(item?.system?.quantity?.value ?? 0);
}

function totalBp(items: any[]): number {
  return items.reduce((sum, m) => sum + quantityOf(m) * coinValueOf(m), 0);
}

/**
 * Consolidate-style change-making: decompose newTotal across the actor's money items sorted by
 * coinValue desc (trunc/mod per denomination; duplicate-denomination items beyond the first are
 * zeroed). Returns the per-item target quantities, or the leftover remainder when a needed
 * denomination item is missing (caller halts loud — no partial writes, no silent remainder drop).
 */
function planWalletRecompose(items: any[], newTotal: number): { targets: Map<string, number>; remainder: number } {
  const sorted = [...items].sort((a, b) => coinValueOf(b) - coinValueOf(a));
  const targets = new Map<string, number>();
  const seenDenominations = new Set<number>();
  let remaining = newTotal;

  for (const item of sorted) {
    const cv = coinValueOf(item);
    if (cv <= 0 || seenDenominations.has(cv)) {
      targets.set(item.id, 0); // zero-value or duplicate-denomination item — consolidated away
      continue;
    }
    seenDenominations.add(cv);
    const qty = Math.floor(remaining / cv);
    targets.set(item.id, qty);
    remaining -= qty * cv;
  }

  return { targets, remainder: remaining };
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

export async function dispatchModuleTradingPlaces(data: unknown): Promise<Envelope<unknown>> {
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: TradingPlacesInputType;
  try {
    input = TradingPlacesInput.parse(data);
  } catch (e) {
    return { success: false, error: `TRADING_PLACES_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `TRADING_PLACES_ACCESS_DENIED: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      // ── reference data ──
      case 'list-settlements':
        return handleListSettlements(input);
      case 'list-cargo-types':
        return handleListCargoTypes();
      // ── season ──
      case 'get-season':
        return handleGetSeason();
      case 'set-season':
        return await handleSetSeason(input);
      // ── market math ──
      case 'check-availability':
        return await handleCheckAvailability(input);
      case 'calc-purchase-price':
        return handleCalcPurchasePrice(input);
      case 'calc-sale-price':
        return handleCalcSalePrice(input);
      // ── tests (pre-rolled totals) ──
      case 'haggle-test':
        return await handleHaggleTest(input);
      case 'gossip-test':
        return await handleGossipTest(input);
      // ── cargo hold ──
      case 'add-cargo':
        return await handleAddCargo(input);
      case 'remove-cargo':
        return await handleRemoveCargo(input);
      case 'get-current-cargo':
        return handleGetCurrentCargo();
      // ── bookkeeping ──
      case 'get-transaction-history':
        return handleGetTransactionHistory(input);
      // ── currency ──
      case 'get-currency':
        return handleGetCurrency(input);
      case 'deduct-currency':
      case 'add-currency':
        return await handleCurrencyWrite(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `TRADING_PLACES_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `TRADING_PLACES_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── reference data ────────────────────────────────────────────────────────────────

type ListSettlementsInput = Extract<TradingPlacesInputType, { action: 'list-settlements' }>;

function handleListSettlements(input: ListSettlementsInput): Envelope<unknown> {
  const dm = getDataManager();
  if (!dm) return apiUnavailable('window.TradingPlaces.getDataManager() returned null — module not initialized yet (reload the world?)');

  const all: any[] = input.region
    ? (dm.getSettlementsByRegion?.(input.region) ?? [])
    : (dm.getAllSettlements?.() ?? []);

  const settlements = all.map((s: any) => ({
    name: String(s?.name ?? ''),
    region: s?.region ?? null,
    size: s?.size ?? null,
    wealth: typeof s?.wealth === 'number' ? s.wealth : null,
    isTradeCenter: Boolean(dm.isTradeSettlement?.(s)),
  }));

  return {
    success: true,
    data: { action: 'list-settlements', count: settlements.length, region: input.region ?? null, settlements },
  };
}

function handleListCargoTypes(): Envelope<unknown> {
  const dm = getDataManager();
  if (!dm) return apiUnavailable('window.TradingPlaces.getDataManager() returned null — module not initialized yet (reload the world?)');

  const raw: any[] = dm.getCargoTypes?.() ?? [];
  const cargoTypes = raw.map((c: any) => ({
    name: String(c?.name ?? c ?? ''),
    category: c?.category ?? null,
  }));

  return { success: true, data: { action: 'list-cargo-types', count: cargoTypes.length, cargoTypes } };
}

// ── season ────────────────────────────────────────────────────────────────────────

function handleGetSeason(): Envelope<unknown> {
  const resolved = resolveSeason();
  if (!resolved) {
    return seasonUnresolved(
      'no calendar season index and the module currentSeason setting is unset/invalid — set-season first',
    );
  }
  return { success: true, data: { action: 'get-season', season: resolved.season, seasonSource: resolved.seasonSource } };
}

type SetSeasonInput = Extract<TradingPlacesInputType, { action: 'set-season' }>;

async function handleSetSeason(input: SetSeasonInput): Promise<Envelope<unknown>> {
  const engine = getTradingEngine();
  if (!engine) return apiUnavailable('window.TradingPlaces.getTradingEngine() returned null — module not initialized yet (reload the world?)');

  const previousSeason = isValidSeason(getSetting('currentSeason')) ? getSetting('currentSeason') : null;

  await engine.setCurrentSeason(input.season); // persists to the currentSeason world setting

  // DP-16 post-write verify — re-read the persisted setting.
  const persisted = getSetting('currentSeason');
  if (persisted !== input.season) {
    return notPersisted(`set-season wrote "${input.season}" but the currentSeason setting reads "${persisted}"`);
  }

  notify.updated('trading-places', 'season', { summary: `${previousSeason ?? 'none'} → ${input.season}` });
  return { success: true, data: { action: 'set-season', season: input.season, previousSeason } };
}

// ── market math ───────────────────────────────────────────────────────────────────

type CheckAvailabilityInput = Extract<TradingPlacesInputType, { action: 'check-availability' }>;

async function handleCheckAvailability(input: CheckAvailabilityInput): Promise<Envelope<unknown>> {
  const dm = getDataManager();
  const engine = getTradingEngine();
  if (!dm || !engine) return apiUnavailable('window.TradingPlaces module singletons unavailable — module not initialized yet (reload the world?)');

  const settlement = dm.getSettlement?.(input.settlement);
  if (!settlement) return targetNotFound(`settlement "${input.settlement}" not in the dataset (Empire-only, 14 provinces)`);

  const resolved = resolveSeason(input.season);
  if (!resolved) return seasonUnresolved('season unresolvable — pass season explicitly or set-season first');

  // Pass season EXPLICITLY (CCR-CALENDAR) — never trust the engine's stored season for this call.
  // availabilityRoll is schema-required: the module's internal chat-invisible PRNG never fires.
  const rollFunction = () => input.availabilityRoll;
  const result = await engine.performCompleteAvailabilityCheck(settlement, resolved.season, rollFunction);

  const check = result?.availabilityCheck ?? {};
  const cargoTypes: string[] = Array.isArray(result?.cargoTypes)
    ? result.cargoTypes.map((c: any) => String(c?.name ?? c ?? ''))
    : [];
  const sizeRaw = result?.cargoSize;
  const cargoSizeEp =
    typeof sizeRaw === 'number'
      ? sizeRaw
      : typeof sizeRaw?.totalEP === 'number'
        ? sizeRaw.totalEP
        : typeof sizeRaw?.size === 'number'
          ? sizeRaw.size
          : null;

  return {
    success: true,
    data: {
      action: 'check-availability',
      settlement: String(settlement.name ?? input.settlement),
      season: resolved.season,
      seasonSource: resolved.seasonSource,
      available: Boolean(result?.available),
      chance: Number(check?.chance ?? 0),
      roll: typeof check?.roll === 'number' ? check.roll : null,
      cargoTypes,
      cargoSizeEp,
    },
  };
}

function buildHaggleResultOption(input: {
  haggleSuccess?: boolean | undefined;
  hasDealmakerTalent?: boolean | undefined;
}): any | undefined {
  if (typeof input.haggleSuccess !== 'boolean') return undefined;
  return {
    success: input.haggleSuccess,
    // The module reads the TYPO'd key (hasDealmakertTalent, haggling-mechanics.js result shape);
    // set both spellings so either reader works.
    hasDealmakertTalent: input.hasDealmakerTalent ?? false,
    hasDealmakerTalent: input.hasDealmakerTalent ?? false,
  };
}

// The engine's CALCULATORS return per-UNIT keys — finalPricePerUnit/totalPrice, where a unit is
// encumbrancePerUnit (10) EP and the PLAIN fields are canonical BP (cargo-availability-pipeline.js:832-836
// is the per-EP ground truth: perEP = per10/10, total = perEP × quantityEP). Do NOT read the
// ...Canonical/formatted decorations: the calculators misread their BP numbers as GC there (×240 inflation,
// purchase-price-calculator.js:153-165). Live-verified 2026-07-10 (validate F08).
function calcToBp(calc: any, quantityEp: number): { pricePerEpBp: number; totalBp: number } {
  const perUnitBp = Number(calc.finalPricePerUnit ?? calc.basePricePerUnit ?? 0);
  const encPerUnit = Number(calc.encumbrancePerUnit) > 0 ? Number(calc.encumbrancePerUnit) : 10;
  const pricePerEpBp = perUnitBp / encPerUnit;
  return { pricePerEpBp, totalBp: Math.round(pricePerEpBp * quantityEp) };
}

type CalcPurchasePriceInput = Extract<TradingPlacesInputType, { action: 'calc-purchase-price' }>;

function handleCalcPurchasePrice(input: CalcPurchasePriceInput): Envelope<unknown> {
  const engine = getTradingEngine();
  if (!engine) return apiUnavailable('window.TradingPlaces.getTradingEngine() returned null — module not initialized yet (reload the world?)');

  const resolved = resolveSeason(input.season);
  if (!resolved) return seasonUnresolved('season unresolvable — pass season explicitly or set-season first');

  const calc = engine.calculatePurchasePrice(input.cargoName, input.quantity, {
    season: resolved.season, // explicit (CCR-CALENDAR)
    quality: input.quality ?? 'average',
    isPartialPurchase: input.isPartialPurchase ?? false,
    haggleResult: buildHaggleResultOption(input),
  });
  if (!calc || typeof calc !== 'object') return targetNotFound(`cargo type "${input.cargoName}" not in the dataset`);

  const { pricePerEpBp, totalBp: totalBpValue } = calcToBp(calc, input.quantity);

  return {
    success: true,
    data: {
      action: 'calc-purchase-price',
      cargoName: input.cargoName,
      quantity: input.quantity,
      settlement: null,
      season: resolved.season,
      seasonSource: resolved.seasonSource,
      quality: input.quality ?? 'average',
      pricePerEpBp,
      totalBp: totalBpValue,
      calculation: calc as Record<string, unknown>,
    },
  };
}

type CalcSalePriceInput = Extract<TradingPlacesInputType, { action: 'calc-sale-price' }>;

function handleCalcSalePrice(input: CalcSalePriceInput): Envelope<unknown> {
  const dm = getDataManager();
  const engine = getTradingEngine();
  if (!dm || !engine) return apiUnavailable('window.TradingPlaces module singletons unavailable — module not initialized yet (reload the world?)');

  const settlement = dm.getSettlement?.(input.settlement);
  if (!settlement) return targetNotFound(`settlement "${input.settlement}" not in the dataset (Empire-only, 14 provinces)`);

  const resolved = resolveSeason(input.season);
  if (!resolved) return seasonUnresolved('season unresolvable — pass season explicitly or set-season first');

  const calc = engine.calculateSalePrice(input.cargoName, input.quantity, settlement, {
    season: resolved.season, // explicit (CCR-CALENDAR)
    quality: input.quality ?? 'average',
    haggleResult: buildHaggleResultOption(input),
  });
  if (!calc || typeof calc !== 'object') return targetNotFound(`cargo type "${input.cargoName}" not in the dataset`);

  const { pricePerEpBp, totalBp: totalBpValue } = calcToBp(calc, input.quantity);

  return {
    success: true,
    data: {
      action: 'calc-sale-price',
      cargoName: input.cargoName,
      quantity: input.quantity,
      settlement: String(settlement.name ?? input.settlement),
      season: resolved.season,
      seasonSource: resolved.seasonSource,
      quality: input.quality ?? 'average',
      pricePerEpBp,
      totalBp: totalBpValue,
      calculation: calc as Record<string, unknown>,
    },
  };
}

// ── tests (pre-rolled totals injected; the module's internal PRNG default roll never fires) ──

type HaggleTestInput = Extract<TradingPlacesInputType, { action: 'haggle-test' }>;

async function handleHaggleTest(input: HaggleTestInput): Promise<Envelope<unknown>> {
  const engine = getTradingEngine();
  if (!engine) return apiUnavailable('window.TradingPlaces.getTradingEngine() returned null — module not initialized yet (reload the world?)');

  // performHaggleTest runs performSkillTest TWICE with the same rollFunction — player first,
  // then merchant (haggling-mechanics.js:112-113). Inject a queue, not a constant.
  const rollQueue = [input.playerRoll, input.merchantRoll];
  const rollFunction = () => rollQueue.shift();

  const result = await engine.performHaggleTest(
    input.playerSkill,
    input.merchantSkill,
    input.hasDealmakerTalent ?? false,
    {},
    rollFunction,
  );

  return {
    success: true,
    data: {
      action: 'haggle-test',
      playerWins: Boolean(result?.success),
      resultDescription: String(result?.resultDescription ?? ''),
      player: (result?.player ?? {}) as Record<string, unknown>,
      merchant: (result?.merchant ?? {}) as Record<string, unknown>,
    },
  };
}

type GossipTestInput = Extract<TradingPlacesInputType, { action: 'gossip-test' }>;

async function handleGossipTest(input: GossipTestInput): Promise<Envelope<unknown>> {
  const engine = getTradingEngine();
  if (!engine) return apiUnavailable('window.TradingPlaces.getTradingEngine() returned null — module not initialized yet (reload the world?)');

  const options = typeof input.difficulty === 'number' ? { difficulty: input.difficulty } : {};
  const result = await engine.performGossipTest(input.playerSkill, options, () => input.playerRoll);

  return {
    success: true,
    data: {
      action: 'gossip-test',
      testSucceeded: Boolean(result?.success),
      roll: Number(result?.roll ?? input.playerRoll),
      modifiedSkill: Number(result?.modifiedSkill ?? input.playerSkill),
      degrees: Number(result?.degrees ?? 0),
      resultDescription: String(result?.resultDescription ?? ''),
    },
  };
}

// ── cargo hold (module currentCargo world-setting store, TradingUIEventHandlers.js:1304-1364 shape) ──

function cargoEntryPublic(c: any): Record<string, unknown> {
  return {
    id: String(c?.id ?? ''),
    cargo: String(c?.cargo ?? ''),
    category: c?.category ?? null,
    quantity: Number(c?.quantity ?? 0),
    pricePerEP: Number(c?.pricePerEP ?? 0),
    totalCost: Number(c?.totalCost ?? 0),
    settlement: c?.settlement ?? null,
    season: c?.season ?? null,
    contraband: Boolean(c?.contraband),
  };
}

type AddCargoInput = Extract<TradingPlacesInputType, { action: 'add-cargo' }>;

async function handleAddCargo(input: AddCargoInput): Promise<Envelope<unknown>> {
  const dm = getDataManager();
  if (!dm) return apiUnavailable('window.TradingPlaces.getDataManager() returned null — module not initialized yet (reload the world?)');

  const resolved = resolveSeason(input.season);
  if (!resolved) return seasonUnresolved('season unresolvable — pass season explicitly or set-season first');

  // Resolve category from the cargo dataset when omitted (the merge key and the Sell tab both use it).
  let category = input.category ?? null;
  if (!category) {
    const cargoTypes: any[] = dm.getCargoTypes?.() ?? [];
    const match = cargoTypes.find((c: any) => String(c?.name ?? '').toLowerCase() === input.cargoName.toLowerCase());
    category = match?.category ?? null;
    if (!category) return targetNotFound(`cargo type "${input.cargoName}" not in the dataset and no explicit category given`);
  }

  const cargo = readCurrentCargo();
  const capacity = readCargoCapacity();
  const usedBefore = holdUsedEp(cargo);
  if (usedBefore + input.quantity > capacity) {
    return {
      success: false,
      error: `TRADING_PLACES_OVER_CAPACITY: adding ${input.quantity} EP would exceed the hold (${usedBefore}/${capacity} EP used)`,
    };
  }

  const contraband = input.contraband ?? false;
  const pricePerEP = input.quantity > 0 ? input.totalCostBp / input.quantity : 0;

  // Merge criteria mirror the module's own writer (_addCargoToInventory): cargo+category+settlement+season+contraband.
  const existing = cargo.find(
    (c: any) =>
      c?.cargo === input.cargoName &&
      c?.category === category &&
      c?.settlement === input.settlement &&
      c?.season === resolved.season &&
      Boolean(c?.contraband) === contraband,
  );

  let cargoId: string;
  let merged = false;
  if (existing) {
    merged = true;
    cargoId = String(existing.id);
    existing.quantity = Number(existing.quantity ?? 0) + input.quantity;
    existing.totalCost = Number(existing.totalCost ?? 0) + input.totalCostBp;
    existing.pricePerEP = existing.quantity > 0 ? existing.totalCost / existing.quantity : 0;
    existing.date = new Date().toISOString();
    existing.pricePerEPCanonical = existing.pricePerEP;
    existing.totalCostCanonical = existing.totalCost;
    existing.formattedPricePerEP = bpTriple(existing.pricePerEP);
    existing.formattedTotalCost = bpTriple(existing.totalCost);
  } else {
    cargoId = randomId();
    cargo.push({
      id: cargoId,
      cargo: input.cargoName,
      category,
      quantity: input.quantity,
      pricePerEP,
      totalCost: input.totalCostBp,
      settlement: input.settlement,
      season: resolved.season,
      date: new Date().toISOString(),
      contraband,
      // Canonical/BP duplicates + formatted strings mirror _addCargoToInventory's entry shape
      // (canonical == raw BP per currency-display.js:45-53 identity conversion).
      pricePerEPCanonical: pricePerEP,
      totalCostCanonical: input.totalCostBp,
      formattedPricePerEP: bpTriple(pricePerEP),
      formattedTotalCost: bpTriple(input.totalCostBp),
    });
  }

  await setSetting('currentCargo', cargo);

  // DP-16 post-write verify — re-read the setting and confirm the lot landed.
  const after = readCurrentCargo();
  const written = after.find((c: any) => String(c?.id) === cargoId);
  if (!written || Number(written.quantity) < input.quantity) {
    return notPersisted(`add-cargo lot ${cargoId} did not persist to the currentCargo setting`);
  }

  const holdUsed = holdUsedEp(after);
  notify.created('trading-places', input.cargoName, {
    summary: `${input.quantity} EP for ${bpTriple(input.totalCostBp)}${merged ? ' (merged)' : ''} — hold ${holdUsed}/${capacity} EP`,
  });

  return {
    success: true,
    data: {
      action: 'add-cargo',
      cargoId,
      cargoName: input.cargoName,
      quantity: input.quantity,
      totalCostBp: input.totalCostBp,
      merged,
      holdUsedEp: holdUsed,
      holdCapacityEp: capacity,
    },
  };
}

type RemoveCargoInput = Extract<TradingPlacesInputType, { action: 'remove-cargo' }>;

async function handleRemoveCargo(input: RemoveCargoInput): Promise<Envelope<unknown>> {
  // Cross-field rule (ADR-020: lives here, not in the Zod schema): need cargoId OR cargoName.
  if (!input.cargoId && !input.cargoName) {
    return { success: false, error: 'TRADING_PLACES_INVALID_INPUT: remove-cargo requires cargoId or cargoName' };
  }

  const cargo = readCurrentCargo();
  let entry: any | undefined;
  if (input.cargoId) {
    entry = cargo.find((c: any) => String(c?.id) === input.cargoId);
    if (!entry) return targetNotFound(`no hold entry with id "${input.cargoId}"`);
  } else {
    const matches = cargo.filter((c: any) => String(c?.cargo ?? '').toLowerCase() === input.cargoName!.toLowerCase());
    if (matches.length === 0) return targetNotFound(`no hold entry named "${input.cargoName}"`);
    if (matches.length > 1) {
      return targetNotFound(
        `"${input.cargoName}" matches ${matches.length} lots (${matches.map((m: any) => m.id).join(', ')}) — disambiguate with cargoId`,
      );
    }
    entry = matches[0];
  }

  const available = Number(entry.quantity ?? 0);
  const removeQty = input.quantity ?? available;
  if (removeQty > available) {
    return targetNotFound(`lot ${entry.id} holds ${available} EP — cannot remove ${removeQty} EP`);
  }

  const cargoId = String(entry.id);
  const cargoName = String(entry.cargo ?? '');
  let remaining = 0;
  if (removeQty === available) {
    const idx = cargo.indexOf(entry);
    cargo.splice(idx, 1);
  } else {
    remaining = available - removeQty;
    const pricePerEP = Number(entry.pricePerEP ?? 0);
    entry.quantity = remaining;
    entry.totalCost = Math.round(pricePerEP * remaining);
    entry.totalCostCanonical = entry.totalCost;
    entry.formattedTotalCost = bpTriple(entry.totalCost);
  }

  await setSetting('currentCargo', cargo);

  // DP-16 post-write verify — re-read and confirm the removal landed.
  const after = readCurrentCargo();
  const still = after.find((c: any) => String(c?.id) === cargoId);
  const persistedOk = removeQty === available ? !still : Number(still?.quantity) === remaining;
  if (!persistedOk) {
    return notPersisted(`remove-cargo on lot ${cargoId} did not persist to the currentCargo setting`);
  }

  const holdUsed = holdUsedEp(after);
  notify.deleted('trading-places', cargoName, { summary: `${removeQty} EP removed — hold ${holdUsed} EP used` });

  return {
    success: true,
    data: {
      action: 'remove-cargo',
      cargoId,
      cargoName,
      removedQuantity: removeQty,
      remainingQuantity: remaining,
      holdUsedEp: holdUsed,
    },
  };
}

function handleGetCurrentCargo(): Envelope<unknown> {
  const cargo = readCurrentCargo();
  return {
    success: true,
    data: {
      action: 'get-current-cargo',
      count: cargo.length,
      holdUsedEp: holdUsedEp(cargo),
      holdCapacityEp: readCargoCapacity(),
      cargo: cargo.map(cargoEntryPublic),
    },
  };
}

// ── bookkeeping ───────────────────────────────────────────────────────────────────

type GetTransactionHistoryInput = Extract<TradingPlacesInputType, { action: 'get-transaction-history' }>;

function handleGetTransactionHistory(input: GetTransactionHistoryInput): Envelope<unknown> {
  const historyRaw = getSetting('transactionHistory');
  const history: any[] = Array.isArray(historyRaw) ? historyRaw : [];
  // Most-recent rows are appended last; `limit` returns the newest N.
  const rows = typeof input.limit === 'number' ? history.slice(-input.limit) : history;
  return {
    success: true,
    data: { action: 'get-transaction-history', count: rows.length, transactions: rows as Array<Record<string, unknown>> },
  };
}

// ── currency (real wfrp4e money-item writes; coinValue-keyed) ─────────────────────

type GetCurrencyInput = Extract<TradingPlacesInputType, { action: 'get-currency' }>;

function handleGetCurrency(input: GetCurrencyInput): Envelope<unknown> {
  const actor = getGame()?.actors?.get?.(input.actorId);
  if (!actor) return targetNotFound(`actor "${input.actorId}" not found`);

  const items = moneyItems(actor);
  return {
    success: true,
    data: {
      action: 'get-currency',
      actorId: input.actorId,
      actorName: actor.name ?? null,
      totalBp: totalBp(items),
      coins: items.map((m: any) => ({ name: String(m?.name ?? ''), coinValue: coinValueOf(m), quantity: quantityOf(m) })),
    },
  };
}

type CurrencyWriteInput = Extract<TradingPlacesInputType, { action: 'deduct-currency' | 'add-currency' }>;

async function handleCurrencyWrite(input: CurrencyWriteInput): Promise<Envelope<unknown>> {
  const isDeduct = input.action === 'deduct-currency';

  if (input.amountBp >= LARGE_TRANSFER_THRESHOLD && input.confirm !== true) {
    return confirmRequired(
      `${input.action} of ${input.amountBp} BP (>= ${LARGE_TRANSFER_THRESHOLD} BP = 20 GC) requires confirm:true`,
    );
  }

  const actor = getGame()?.actors?.get?.(input.actorId);
  if (!actor) return targetNotFound(`actor "${input.actorId}" not found`);

  const items = moneyItems(actor);
  if (items.length === 0) return targetNotFound(`actor "${actor.name}" has no money items`);

  const previousTotal = totalBp(items);
  const newTotal = isDeduct ? previousTotal - input.amountBp : previousTotal + input.amountBp;

  if (isDeduct && newTotal < 0) {
    return {
      success: false,
      error: `TRADING_PLACES_INSUFFICIENT_FUNDS: ${actor.name} holds ${bpTriple(previousTotal)} (${previousTotal} BP) — cannot deduct ${bpTriple(input.amountBp)}`,
    };
  }

  // Consolidate-style change-making: recompose the whole wallet at the new total, coinValue desc.
  const plan = planWalletRecompose(items, newTotal);
  if (plan.remainder > 0) {
    return {
      success: false,
      error: `TRADING_PLACES_MISSING_DENOMINATION: ${plan.remainder} BP cannot be represented — ${actor.name} lacks a small enough coin denomination item (no partial write performed)`,
    };
  }

  const updates = items
    .filter((m: any) => plan.targets.has(m.id) && plan.targets.get(m.id) !== quantityOf(m))
    .map((m: any) => ({ _id: m.id, 'system.quantity.value': plan.targets.get(m.id) }));

  if (updates.length > 0) {
    await actor.updateEmbeddedDocuments('Item', updates);
  }

  // DP-16 post-write verify — Σ(qty×coinValue) must have moved by exactly the delta.
  const afterTotal = totalBp(moneyItems(actor));
  if (afterTotal !== newTotal) {
    return notPersisted(
      `${input.action} expected ${newTotal} BP after write but the actor's money items sum to ${afterTotal} BP`,
    );
  }

  // Ledger row (CCR-LEDGER/HC5): source:'trade', NO economyId, append-after-settle, fail-open.
  const economyModuleActive = Boolean(getGame()?.modules?.get?.('wfrp4e-economy')?.active);
  const description =
    input.description ??
    `Trading Places ${isDeduct ? 'purchase payment' : 'sale proceeds'}: ${bpTriple(input.amountBp)} (${actor.name})`;
  if (economyModuleActive) {
    await recordEconomyTransaction({
      actorId: input.actorId,
      amount: input.amountBp,
      type: isDeduct ? 'trade-buy' : 'trade-sell',
      source: 'trade',
      description,
    });
  }

  notify.updated('trading-places', actor.name ?? input.actorId, {
    summary: `${input.action} ${bpTriple(input.amountBp)} → ${bpTriple(newTotal)}`,
  });

  return {
    success: true,
    data: {
      action: input.action,
      actorId: input.actorId,
      actorName: actor.name ?? null,
      amountBp: input.amountBp,
      previousTotalBp: previousTotal,
      newTotalBp: newTotal,
      ledgered: economyModuleActive,
    },
  };
}
