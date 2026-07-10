// wfrp_economy_system Phase 3 — module-trading-places mcp-server response interfaces.
//
// CCR-5: Zod input validation lives in @foundry-mcp/shared (TradingPlacesInput). The mcp-server tool
// layer only needs typed response shapes for this.query<T> (DP-15 — never <any>).
//
// Trading Places v0.3.0. 16 actions (PRD R3.2's 11 + 5 extras, Q&A 2026-07-10). Each handler return
// carries `action` as a discriminant; TradingPlacesResult is their union so the tool stays typed.
// All monetary amounts are integer Brass Pennies (BP); 1 GC = 240 BP, 1 SS = 12 BP.

export interface TradingPlacesSettlementEntry {
  name: string;
  region: string | null;
  size: string | number | null;
  wealth: number | null;
  isTradeCenter: boolean;
}

export interface TradingPlacesListSettlementsResult {
  action: 'list-settlements';
  count: number;
  region: string | null;
  settlements: TradingPlacesSettlementEntry[];
}

export interface TradingPlacesCargoTypeEntry {
  name: string;
  category: string | null;
}

export interface TradingPlacesListCargoTypesResult {
  action: 'list-cargo-types';
  count: number;
  cargoTypes: TradingPlacesCargoTypeEntry[];
}

/**
 * Where the resolved season came from: the Foundry world calendar, the module's manual setting, or an
 * explicit `season` argument on the call ('explicit' never appears on get-season — only on
 * availability/price results when the caller overrode the season).
 */
export type TradingPlacesSeasonSource = 'calendar' | 'module-setting' | 'explicit';

export interface TradingPlacesGetSeasonResult {
  action: 'get-season';
  season: string;
  seasonSource: TradingPlacesSeasonSource;
}

export interface TradingPlacesSetSeasonResult {
  action: 'set-season';
  season: string;
  previousSeason: string | null;
}

export interface TradingPlacesCheckAvailabilityResult {
  action: 'check-availability';
  settlement: string;
  season: string;
  seasonSource: TradingPlacesSeasonSource;
  available: boolean;
  chance: number;
  roll: number | null;
  cargoTypes: string[];
  cargoSizeEp: number | null;
}

export interface TradingPlacesPriceResult {
  action: 'calc-purchase-price' | 'calc-sale-price';
  cargoName: string;
  quantity: number;
  settlement: string | null;
  season: string;
  seasonSource: TradingPlacesSeasonSource;
  quality: string;
  pricePerEpBp: number;
  totalBp: number;
  /** The engine's full calculation object, passed through for breakdown/audit. */
  calculation: Record<string, unknown>;
}

export interface TradingPlacesHaggleTestResult {
  action: 'haggle-test';
  /** True = the player won the opposed haggle (named to avoid the envelope-`success` banned token). */
  playerWins: boolean;
  resultDescription: string;
  player: Record<string, unknown>;
  merchant: Record<string, unknown>;
}

export interface TradingPlacesGossipTestResult {
  action: 'gossip-test';
  /** True = the gossip skill test succeeded (named to avoid the envelope-`success` banned token). */
  testSucceeded: boolean;
  roll: number;
  modifiedSkill: number;
  degrees: number;
  resultDescription: string;
}

export interface TradingPlacesCargoEntry {
  id: string;
  cargo: string;
  category: string | null;
  quantity: number;
  pricePerEP: number;
  totalCost: number;
  settlement: string | null;
  season: string | null;
  contraband: boolean;
}

export interface TradingPlacesAddCargoResult {
  action: 'add-cargo';
  cargoId: string;
  cargoName: string;
  quantity: number;
  totalCostBp: number;
  merged: boolean;
  holdUsedEp: number;
  holdCapacityEp: number;
}

export interface TradingPlacesRemoveCargoResult {
  action: 'remove-cargo';
  cargoId: string;
  cargoName: string;
  removedQuantity: number;
  remainingQuantity: number;
  holdUsedEp: number;
}

export interface TradingPlacesGetCurrentCargoResult {
  action: 'get-current-cargo';
  count: number;
  holdUsedEp: number;
  holdCapacityEp: number;
  cargo: TradingPlacesCargoEntry[];
}

export interface TradingPlacesGetTransactionHistoryResult {
  action: 'get-transaction-history';
  count: number;
  transactions: Array<Record<string, unknown>>;
}

export interface TradingPlacesCoinEntry {
  name: string;
  coinValue: number;
  quantity: number;
}

export interface TradingPlacesGetCurrencyResult {
  action: 'get-currency';
  actorId: string;
  actorName: string | null;
  totalBp: number;
  coins: TradingPlacesCoinEntry[];
}

export interface TradingPlacesCurrencyWriteResult {
  action: 'deduct-currency' | 'add-currency';
  actorId: string;
  actorName: string | null;
  amountBp: number;
  previousTotalBp: number;
  newTotalBp: number;
  /** True when the wfrp-economy unified-ledger row was appended (fail-open — false never fails the write). */
  ledgered: boolean;
}

export type TradingPlacesResult =
  | TradingPlacesListSettlementsResult
  | TradingPlacesListCargoTypesResult
  | TradingPlacesGetSeasonResult
  | TradingPlacesSetSeasonResult
  | TradingPlacesCheckAvailabilityResult
  | TradingPlacesPriceResult
  | TradingPlacesHaggleTestResult
  | TradingPlacesGossipTestResult
  | TradingPlacesAddCargoResult
  | TradingPlacesRemoveCargoResult
  | TradingPlacesGetCurrentCargoResult
  | TradingPlacesGetTransactionHistoryResult
  | TradingPlacesGetCurrencyResult
  | TradingPlacesCurrencyWriteResult;

// ── The action enum (mirrors the shared discriminatedUnion literals; 16 actions) ──

export const TRADING_PLACES_ACTIONS = [
  'list-settlements',
  'list-cargo-types',
  'get-season',
  'set-season',
  'check-availability',
  'calc-purchase-price',
  'calc-sale-price',
  'haggle-test',
  'gossip-test',
  'add-cargo',
  'remove-cargo',
  'get-current-cargo',
  'get-transaction-history',
  'get-currency',
  'deduct-currency',
  'add-currency',
] as const;

export type TradingPlacesAction = (typeof TRADING_PLACES_ACTIONS)[number];
