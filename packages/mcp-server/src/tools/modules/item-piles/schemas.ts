// Module Integration v1 Phase 3 — mcp-server return interfaces for module-itempiles.
//
// TS return interfaces (no Zod) for typed this.query<T>(...) calls.
// One interface per action return shape. DP-15: never <any> on response.

import { SceneId } from '@foundry-mcp/shared';

export interface ItemPileCreateResult {
  tokenUuid: string | null;
  actorUuid: string | null;
  type: string;
  sceneId: SceneId;
  flagData: unknown;
}

export interface ItemPileUpdateResult {
  actorUuid: string;
  pileUuid?: string;
  updated: Record<string, unknown>;
  flagData: unknown;
}

export interface ItemPileDeleteResult {
  tokenUuid: string;
  deleted: boolean;
}

export interface ItemPileSetStateResult {
  state: string;
  actorUuid?: string;
  tokenCount?: number;
  /** BUG-420: per-token SYNTHETIC pile-actor UUIDs echoed by turnTokens/revertTokens —
   * the valid split-loot / get-contents targets (token.actorId is the SHARED base actor). */
  pileActorUuids?: (string | null)[];
  result: unknown;
  flagData?: unknown;
}

export interface ItemPileItem {
  id: string | null;
  name: string | null;
  type: string | null;
  quantity: number;
  uuid: string | null;
}

export interface ItemPileGetContentsResult {
  actorUuid: string;
  isValidPile: boolean;
  isContainer: boolean;
  isMerchant: boolean;
  isVault: boolean;
  isLocked: boolean | null;
  isClosed: boolean | null;
  isEmpty: boolean | null;
  /** Total item count on the pile (NOT the page length — see `items`/`itemsLimit`). */
  itemCount: number;
  /** BUG-788: bounded page, not the whole pile — see itemsOffset/itemsLimit/itemsTruncated/itemsNextOffset. */
  items: ItemPileItem[];
  itemsOffset: number;
  itemsLimit: number;
  itemsTruncated: boolean;
  itemsNextOffset: number | null;
  currencies: unknown;
  /** BUG-788: never includes the raw `log` key — the log is surfaced separately (paginated) below. */
  flagData: unknown;
  /** BUG-788: bounded page of the vault/merchant audit log (includeLog:true only). */
  log?: unknown[];
  logCount?: number;
  logOffset?: number;
  logLimit?: number;
  logTruncated?: boolean;
  logNextOffset?: number | null;
}

export interface ItemPileAddItemsResult {
  actorUuid: string;
  itemsAdded: number;
  totalItems: number;
}

export interface ItemPileRemoveItemsResult {
  actorUuid: string;
  itemsRemoved: number;
  totalItems: number;
}

// BUG-423 (XPK-01): result mirrors the handler's normalized DTO. The real
// transferItems/transferAllItems/combineItemPiles API resolution is a bare array —
// the handler wraps it as { ok, itemsTransferred }; no other field exists.
export interface ItemPileTransferItemsResult {
  mode: string;
  sourceUuid: string;
  targetUuid: string;
  targetItemCount: number;
  result: { ok: boolean; itemsTransferred: unknown[] };
}

export interface ItemPileAddCurrencyResult {
  actorUuid: string;
  currenciesAdded: string;
  currentCurrencies: unknown;
}

export interface ItemPileRemoveCurrencyResult {
  actorUuid: string;
  currenciesRemoved: string;
  previousBalance: unknown;
  currentCurrencies: unknown;
}

// BUG-423 (XPK-01) + live-smoke correction 2026-07-02: the real transferCurrencies/
// transferAllCurrencies resolution is { itemDeltas, attributeDeltas } (verified against the
// live item-piles dist — the boolean shape was fixture-fabricated). ok=false means EMPTY
// deltas: Item Piles silently no-ops without error in some WFRP4e states (BUG-428) — the
// formatter must warn, and balances come from the DP-16 re-reads.
export interface ItemPileTransferCurrencyResult {
  mode: string;
  sourceUuid: string;
  targetUuid: string;
  sourceCurrencies: unknown;
  targetCurrencies: unknown;
  result: { ok: boolean; itemDeltas: unknown[]; attributeDeltas: Record<string, unknown> };
}

export interface ItemPileSplitLootResult {
  actorUuid: string;
  targets: string[];
  itemsRemaining: number;
}

export interface ItemPileVaultGridItem {
  item: unknown;
  itemFlagData: unknown;
  quantity: number;
}

export interface ItemPileVaultGridData {
  totalSpaces: number;
  enabledSpaces: number;
  freeSpaces: number;
  enabledCols: number;
  enabledRows: number;
  cols: number;
  rows: number;
  items: ItemPileVaultGridItem[];
  grid: unknown[][];
  freeCells: { x: number; y: number }[];
}

export interface ItemPileVaultInfoResult {
  actorUuid: string;
  subAction: string;
  gridData?: ItemPileVaultGridData;
  flagData?: unknown;
  canFit?: boolean;
  itemUuid?: string;
  quantity?: number;
  fitResult?: unknown;
}

// BUG-446: the handler returns targetItems: null on the documented no-target call shape
// (flow.ts roll-item-table — targetItems only populated when targetActorUuid was given) and
// `result` is the raw API resolution (not guaranteed an array). The old non-optional types
// were a lie that let the formatter deref .length unguarded — a raw TypeError masked a
// successful roll. Nullable types force the guards at every use site (D16).
export interface ItemPileRollTableResult {
  tableUuid: string;
  targetActorUuid: string | null;
  result: unknown;
  targetItems: { id: string; name: string; type: string; quantity: number }[] | null;
}

export interface ItemPileRefreshMerchantResult {
  merchantUuid: string;
  removeExistingActorItems: boolean;
  itemCount: number;
}

// BUG-423 (XPK-01) + live-smoke correction 2026-07-02: the real tradeItems resolution is
// { itemDeltas, attributeDeltas, itemPrices } (verified against the live item-piles dist —
// {itemMoved} exists nowhere in the module; it was fixture-fabricated). Same ok semantics
// as transfer-currency: empty deltas = nothing moved = ok:false.
export interface ItemPileTradeResult {
  merchantUuid: string;
  buyerUuid: string;
  itemsTraded: number;
  buyerCurrencies: unknown;
  buyerItemCount: number;
  result: { ok: boolean; itemDeltas: unknown[]; attributeDeltas: Record<string, unknown> };
}

export interface ItemPilePriceModifiersResult {
  actorUuid: string;
  subAction?: string;
  modifiers?: unknown;
  itemUuid?: string;
  quantity?: number;
  prices?: unknown;
  cost?: unknown;
}
