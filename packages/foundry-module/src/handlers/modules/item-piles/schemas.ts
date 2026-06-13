// Module Integration v1 Phase 3 — package-local Zod schema for module-itempiles.
//
// CCR-5: module-specific schemas stay package-local (not in @foundry-mcp/shared).
// Covers all 17 actions (3A foundation + 3B advanced).
// .strict() per variant (rejects unknown top-level keys).
//
// Source corrections baked in (from phase3_pre_plan.md §Confirmed facts):
//   - tablesForPopulate: {uuid, addAll, timesToRoll, items, customCategory} (NOT rollFormula/addItems)
//   - vaultAccess: {uuid, view, organize, items:{withdraw,deposit}, currencies:{withdraw,deposit}}
//   - tradeItems items: [{item: idString, quantity, paymentIndex: 0}]
//   - split-loot targets: z.array(z.string()) — required to avoid C8 silent no-op
//   - Currency strings: z.string() — case-insensitive "Xgc Yss Zbp"
//   - transfer-items: combine mode + targetItemPileFlags
//   - get-contents: log field in response (vault/merchant audit trail)
//   - update-pile: merchant overheadCost + vaultAccess nested structure

import { z } from 'zod';

// ── Shared sub-schemas ────────────────────────────────────────────────────────

/** All pile types — banker/auctioneer will be rejected by the handler with MODULE_DEPENDENCY_NOT_ACTIVE */
const PileType = z.enum(['pile', 'container', 'merchant', 'vault', 'banker', 'auctioneer']);

/** Currency string: "Xgc Yss Zbp" (case-insensitive; item-piles lowercases internally) */
const CurrencyString = z.string().min(1);

/** vaultAccess entry schema (source-corrected from item-piles.js:80474, :36392) */
const VaultAccessEntry = z.object({
  uuid: z.string().min(1),                        // Actor OR User UUID
  view: z.boolean().optional(),
  organize: z.boolean().optional(),
  items: z.object({
    withdraw: z.boolean().optional(),
    deposit: z.boolean().optional(),
  }).optional(),
  currencies: z.object({
    withdraw: z.boolean().optional(),
    deposit: z.boolean().optional(),
  }).optional(),
}).strict();

/** overhead cost entry (merchant) */
const OverheadCostEntry = z.object({
  name: z.string().min(1),
  price: z.string().min(1),
}).strict();

/** trade-items item entry (source-corrected from item-piles.js:99494) */
const TradeItemEntry = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().positive(),
  paymentIndex: z.number().int().nonnegative().default(0),
}).strict();

// ── 17 action variants ────────────────────────────────────────────────────────

export const ModuleItempilesInput = z.discriminatedUnion('action', [

  // 1. create-pile — createItemPile; sceneId REQUIRED (C5)
  z.object({
    action: z.literal('create-pile'),
    sceneId: z.string().min(1, 'sceneId is required — game.user.viewedScene is null server-side (C5)'),
    type: PileType.optional(),
    position: z.object({ x: z.number(), y: z.number() }).optional(),
    items: z.array(z.record(z.unknown())).optional(),
    // currencies removed — createItemPile has no currencies param (item-piles.js:97842)
    pileActorName: z.string().optional(),
    // createDedicatedActor:true → createActor:true; false/absent → shared Default actor (item-piles.js:84697)
    createDedicatedActor: z.boolean().optional(),
    tokenName: z.string().optional(),
    locked: z.boolean().optional(),
    closed: z.boolean().optional(),
    closedImage: z.string().optional(),
    openedImage: z.string().optional(),
    lockedImage: z.string().optional(),
    emptyImage: z.string().optional(),
    lockedSound: z.string().optional(),
    closedSound: z.string().optional(),
    openedSound: z.string().optional(),
  }).strict(),

  // 2. update-pile — updateItemPile; updates actor flag data
  z.object({
    action: z.literal('update-pile'),
    actorUuid: z.string().min(1),
    type: PileType.optional(),
    enabled: z.boolean().optional(),  // activate/deactivate pile (item-piles.js:34842 enabled&&type check)
    locked: z.boolean().optional(),
    closed: z.boolean().optional(),
    closedImage: z.string().optional(),
    openedImage: z.string().optional(),
    lockedImage: z.string().optional(),
    emptyImage: z.string().optional(),
    lockedSound: z.string().optional(),
    closedSound: z.string().optional(),
    openedSound: z.string().optional(),
    // merchant-specific
    merchantColumns: z.array(z.object({
      label: z.string(),
      path: z.string(),
    })).optional(),
    overheadCost: z.array(OverheadCostEntry).optional(),
    // vault-specific
    vaultAccess: z.array(VaultAccessEntry).optional(),
    vaultExpansion: z.boolean().optional(),
    cols: z.number().int().positive().optional(),
    rows: z.number().int().positive().optional(),
    // open times (GUIDANCE_ONLY: requires Simple Calendar for enforcement)
    openTimes: z.record(z.unknown()).optional(),
  }).strict(),

  // 3. delete-pile — deleteItemPile; requires Token UUID (C10); confirm required (dangerous)
  z.object({
    action: z.literal('delete-pile'),
    tokenUuid: z.string().min(1, 'tokenUuid must be a Token UUID (contains "Token"), not an Actor UUID (C10)'),
    confirm: z.boolean().optional(),
  }).strict(),

  // 4. set-pile-state — open/close/lock/unlock/rattle/turnTokens/revertTokens
  z.object({
    action: z.literal('set-pile-state'),
    actorUuid: z.string().min(1).optional(),
    tokenUuids: z.array(z.string().min(1)).optional(), // for turnTokens/revertTokens
    state: z.enum(['open', 'close', 'lock', 'unlock', 'rattle', 'turnTokens', 'revertTokens']),
    confirm: z.boolean().optional(),                   // revertTokens is confirm-gated
    interactingTokenUuid: z.string().optional(),
  }).strict(),

  // 5. get-contents — read pile contents (items + currencies + flags + type checks)
  z.object({
    action: z.literal('get-contents'),
    actorUuid: z.string().min(1),
    includeLog: z.boolean().optional(),               // vault/merchant audit trail
  }).strict(),

  // 6. add-items — addItems; items REQUIRED array (C1)
  z.object({
    action: z.literal('add-items'),
    actorUuid: z.string().min(1),
    items: z.array(z.record(z.unknown())).min(1, 'items must be a non-empty array (C1 — addItems forEach crash on null/undefined)'),
    removeExistingActorItems: z.boolean().optional(),
    // mergeSimilarItems and respectItemIds removed — not real addItems options (item-piles.js:98428)
  }).strict(),

  // 7. remove-items — removeItems; items REQUIRED array (C2)
  z.object({
    action: z.literal('remove-items'),
    actorUuid: z.string().min(1),
    items: z.array(z.object({
      _id: z.string().optional(),
      id: z.string().optional(),
      quantity: z.number().int().positive().optional(),
    })).min(1, 'items must be a non-empty array (C2 — removeItems forEach crash)'),
  }).strict(),

  // 8. transfer-items — transferItems/transferAllItems/combineItemPiles; items required (C3)
  z.object({
    action: z.literal('transfer-items'),
    sourceUuid: z.string().min(1),
    targetUuid: z.string().min(1),
    items: z.array(z.object({
      _id: z.string().optional(),
      id: z.string().optional(),
      quantity: z.number().int().positive().optional(),
    })).optional(),
    mode: z.enum(['transfer', 'all', 'combine']).optional(),
    targetItemPileFlags: z.record(z.unknown()).optional(),  // used by combine mode
    confirm: z.boolean().optional(),                        // required for all/combine
  }).strict(),

  // 9. add-currency — addCurrencies; currency string "Xgc Yss Zbp"
  z.object({
    action: z.literal('add-currency'),
    actorUuid: z.string().min(1),
    currencies: CurrencyString,
  }).strict(),

  // 10. remove-currency — removeCurrencies; confirm required; pre-check balance
  z.object({
    action: z.literal('remove-currency'),
    actorUuid: z.string().min(1),
    currencies: CurrencyString,
    confirm: z.boolean().optional(),
  }).strict(),

  // 11. transfer-currency — transferCurrencies/transferAllCurrencies
  z.object({
    action: z.literal('transfer-currency'),
    sourceUuid: z.string().min(1),
    targetUuid: z.string().min(1),
    currencies: CurrencyString.optional(),
    mode: z.enum(['transfer', 'all']).optional(),
    confirm: z.boolean().optional(),    // required for all mode
  }).strict(),

  // 12. split-loot — splitItemPileContents; targets REQUIRED (C8)
  z.object({
    action: z.literal('split-loot'),
    actorUuid: z.string().min(1),
    targets: z.array(z.string().min(1)).min(1, 'targets is required and must be a non-empty array (C8 — omitting targets with no active player chars → silent no-op)'),
    instigator: z.string().optional(),
    confirm: z.boolean().optional(),
  }).strict(),

  // 13. vault-info — canItemFitInVault/fitItemsIntoVault/getVaultGridData (read-only)
  z.object({
    action: z.literal('vault-info'),
    actorUuid: z.string().min(1),
    itemUuid: z.string().optional(),    // for fit-check
    quantity: z.number().int().positive().optional(),
    subAction: z.enum(['fit-check', 'grid-data', 'fit-items']).optional(),
  }).strict(),

  // 14. roll-item-table — rollItemTable
  z.object({
    action: z.literal('roll-item-table'),
    tableUuid: z.string().min(1),
    targetActorUuid: z.string().optional(),
    rollData: z.record(z.unknown()).optional(),    // formula context (full-strength param)
    timesToRoll: z.number().int().positive().optional(),
    removeExistingActorItems: z.boolean().optional(),
  }).strict(),

  // 15. refresh-merchant — refreshMerchantInventory; removeExistingActorItems defaults FALSE (safe; asymmetric)
  z.object({
    action: z.literal('refresh-merchant'),
    merchantUuid: z.string().min(1),
    removeExistingActorItems: z.boolean().optional(),   // defaults false in catalog (asymmetric safe)
    // tablesForPopulate removed — it's an actor flag not an API arg (item-piles.js:99278);
    // set table population via update-pile pile flags instead
    confirm: z.boolean().optional(),    // required when removeExistingActorItems:true
  }).strict(),

  // 16. trade-items — tradeItems; items required (C4); confirm required (dangerous)
  z.object({
    action: z.literal('trade-items'),
    merchantUuid: z.string().min(1),
    buyerUuid: z.string().min(1),
    items: z.array(TradeItemEntry).min(1, 'items must be a non-empty array (C4 — tradeItems forEach crash)'),
    confirm: z.boolean().optional(),
  }).strict(),

  // 17. update-price-modifiers — getMerchantPriceModifiers/updateMerchantPriceModifiers/getPricesForItem
  z.object({
    action: z.literal('update-price-modifiers'),
    actorUuid: z.string().min(1),
    subAction: z.enum(['get-modifiers', 'update-modifiers', 'get-prices']).optional(),
    buyPriceModifier: z.number().optional(),    // requires finite (C9/L-4 — validated regardless of relative flag)
    sellPriceModifier: z.number().optional(),
    relative: z.boolean().optional(),
    override: z.boolean().optional(),
    // targetActorUuid: the actor whose price modifier is being set (item-piles.js:98383 each entry needs actorUuid)
    targetActorUuid: z.string().optional(),
    itemUuid: z.string().optional(),            // for get-prices; resolved to Item instance before call
    quantity: z.number().int().positive().optional(),
  }).strict(),

]);

export type ModuleItempilesInputType = z.infer<typeof ModuleItempilesInput>;
