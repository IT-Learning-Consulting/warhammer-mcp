// Module Integration v1 Phase 3 — mcp-server return interfaces for module-itempiles.
//
// TS return interfaces (no Zod) for typed this.query<T>(...) calls.
// One interface per action return shape. DP-15: never <any> on response.

export interface ItemPileCreateResult {
  tokenUuid: string | null;
  actorUuid: string | null;
  type: string;
  sceneId: string;
  flagData: unknown;
}

export interface ItemPileUpdateResult {
  actorUuid: string;
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
  itemCount: number;
  items: ItemPileItem[];
  currencies: unknown;
  flagData: unknown;
  log?: unknown[];
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

export interface ItemPileTransferItemsResult {
  mode: string;
  sourceUuid: string;
  targetUuid: string;
  targetItemCount: number;
  result: { itemsTransferred: unknown[]; attributesTransferred: unknown[]; deletedTokens?: unknown[] };
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

export interface ItemPileTransferCurrencyResult {
  mode: string;
  sourceUuid: string;
  targetUuid: string;
  sourceCurrencies: unknown;
  targetCurrencies: unknown;
  result: { itemsTransferred: unknown[]; attributesTransferred: unknown[]; deletedTokens?: unknown[] };
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

export interface ItemPileRollTableResult {
  tableUuid: string;
  targetActorUuid: string | null;
  result: unknown[];
  targetItems: { id: string; name: string; type: string; quantity: number }[];
}

export interface ItemPileRefreshMerchantResult {
  merchantUuid: string;
  removeExistingActorItems: boolean;
  itemCount: number;
}

export interface ItemPileTradeResult {
  merchantUuid: string;
  buyerUuid: string;
  itemsTraded: number;
  buyerCurrencies: unknown;
  buyerItemCount: number;
  result: { itemDeltas: unknown[]; attributeDeltas: unknown[]; itemPrices: unknown[] };
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
