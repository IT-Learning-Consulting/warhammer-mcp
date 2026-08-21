// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/window.confirm; no matches. Module-API calls here are vault/rolltable/merchant reads+writes only.
// Module Integration v1 Phase 3 — module-itempiles: vault, rolltable population, merchant + trade.
// mcp_code_quality_v2 Phase C3 (19a split): extracted verbatim from item-piles.ts — zero
// behavioral change (behavior freeze HC3/HC13).

import { ErrorTokens, type ModuleItempilesInputType } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { Envelope, isGM } from '../_shared/handler-utils.js';
import { settlePoll } from '../_shared/settle-poll.js';
import { getActionCatalog, validateRelativeModifier } from './catalog.js';
import { getItemPilesAPI, notPersisted, gmRequired, activeGmRequired } from './helpers.js';
import { totalQuantity } from './verify-quantity.js';
import { currencyTotal, confirmRequiredEnvelope, previewItemLines, falseReturnEnvelope } from './flow.js';
import { recordEconomyTransaction } from '../wfrp-economy/ledger.js';
import { buildOutcomeResponse } from '../../../services/shared/outcome-response.js';

// ── 3B: Vault info ────────────────────────────────────────────────────────────

type VaultInfoInput = Extract<ModuleItempilesInputType, { action: 'vault-info' }>;

// BUG-781: dot-path property setter mirroring foundry.utils.setProperty's semantics
// (creates intermediate objects) without taking a new dependency on the `foundry` global
// in this file — used to bake a requested quantity onto a cloned item-data object at
// whatever path the world's item-piles ITEM_QUANTITY_ATTRIBUTE setting names (system-
// agnostic; never hardcode "system.quantity.value").
function setDeepProperty(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!;
    if (typeof cur[key] !== 'object' || cur[key] === null) cur[key] = {};
    cur = cur[key] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]!] = value;
}

export async function handleVaultInfo(input: VaultInfoInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: vault-info requires GM access' };

  try {
    const API = getItemPilesAPI();
    const subAction = input.subAction ?? 'grid-data';

    if (subAction === 'fit-check' || subAction === 'fit-items') {
      if (!input.itemUuid) {
        return { success: false, error: 'MISSING_ITEM_UUID: itemUuid is required for fit-check/fit-items' };
      }
      const itemDoc = (globalThis as any).fromUuidSync?.(input.itemUuid);
      if (!itemDoc) {
        return { success: false, error: `ITEM_NOT_FOUND: cannot resolve item UUID "${input.itemUuid}"` };
      }

      const requestedQty = input.quantity ?? 1;
      if (!Number.isInteger(requestedQty) || requestedQty < 1) {
        return { success: false, error: `INVALID_QUANTITY: quantity must be a positive integer, got ${requestedQty}` };
      }

      // C-5: canItemFitInVault(item, vaultActor) — item-piles.js:99588 — item FIRST, actor
      // second; no quantity arg on canItemFitInVault (it doesn't accept one). Cheap
      // single-unit structural gate (does this item TYPE fit at all) — fast-fail before the
      // fuller quantity-aware check below.
      const canFitOne = API.canItemFitInVault(itemDoc, input.actorUuid);
      if (!canFitOne) {
        return {
          success: false,
          error: `VAULT_FULL: item "${input.itemUuid}" (qty: ${requestedQty}) does not fit in vault ${input.actorUuid}`,
        };
      }

      // BUG-781: canItemFitInVault has no quantity concept (the single check above can only
      // ever answer "does ONE unit fit"), and fitItemsIntoVault expects each array entry to
      // itself BE an Item/item-data object (item-piles.js:36270-36315, 99588-99592) — it is
      // a placement CALCULATION (no .update()/.create() call inside it — confirmed by
      // reading the function body), not a write. The old `[{item:itemDoc,quantity}]`
      // wrapper was never a valid entry: fitItemsIntoVault deep-clones the wrapper itself
      // (not `.item`), so getItemFlagData/width/height lookups saw no type/system data.
      //
      // Model the requested quantity the way upstream's own addItems() does (item-piles.js
      // :98461-98463 `setItemQuantity(item, itemData.quantity, true)`):
      //  - stackable item type (API.canItemStack): ONE entry carrying the FULL requested
      //    quantity via ITEM_QUANTITY_ATTRIBUTE — a stack occupies a single grid cell
      //    regardless of its quantity value (footprint comes from width/height only).
      //  - non-stackable item type: N repeated single-unit entries — each occupies its own
      //    cell since non-stackable items cannot merge into one document.
      const rawItemData = typeof itemDoc.toObject === 'function' ? itemDoc.toObject() : itemDoc;
      const stackable = Boolean(API.canItemStack(itemDoc, input.actorUuid));
      const qtyAttr: string | undefined = API.ITEM_QUANTITY_ATTRIBUTE;
      const buildEntry = (qty: number) => {
        const entry = structuredClone(rawItemData);
        if (qtyAttr) setDeepProperty(entry, qtyAttr, qty);
        return entry;
      };
      const fitEntries = stackable
        ? [buildEntry(requestedQty)]
        : Array.from({ length: requestedQty }, () => buildEntry(1));

      // C-5: fitItemsIntoVault(items, vaultActor) — item-piles.js:99591 — items FIRST,
      // actor second. Success returns {updates,deletions} covering EVERY entry passed in
      // (all-or-nothing — upstream early-returns false the moment one entry can't be
      // placed, per the function body); failure returns false.
      const fitResult: any = API.fitItemsIntoVault(fitEntries, input.actorUuid);
      if (fitResult === false) {
        return {
          success: false,
          error: `VAULT_FULL: item "${input.itemUuid}" (qty: ${requestedQty}) does not fit in vault ${input.actorUuid}`,
        };
      }
      // coveredCount: number of the requested entries the plan actually accounts for
      // (newly-placed cells + merge-into-existing-stack deletions) — for a non-stackable
      // item this equals the requested quantity N (not 1, BUG-781's headline defect); for a
      // stackable item this is 1 (single merged/placed document) regardless of N.
      const coveredCount = (Array.isArray(fitResult?.updates) ? fitResult.updates.length : 0)
        + (Array.isArray(fitResult?.deletions) ? fitResult.deletions.length : 0);

      const gridData = API.getVaultGridData(input.actorUuid);
      return {
        success: true,
        data: {
          actorUuid: input.actorUuid,
          subAction,
          canFit: true,
          itemUuid: input.itemUuid,
          quantity: requestedQty,
          stackable,
          coveredCount,
          fitResult: subAction === 'fit-items' ? fitResult : null,
          gridData,
        },
      };
    }

    // grid-data (default)
    const gridData = API.getVaultGridData(input.actorUuid);
    const flagData = API.getActorFlagData(input.actorUuid);
    return { success: true, data: { actorUuid: input.actorUuid, subAction: 'grid-data', gridData, flagData } };
  } catch (e) {
    return { success: false, error: `VAULT_INFO_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── 3B: RollTable population ──────────────────────────────────────────────────

type RollItemTableInput = Extract<ModuleItempilesInputType, { action: 'roll-item-table' }>;

export async function handleRollItemTable(input: RollItemTableInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  try {
    const API = getItemPilesAPI();
    const catalog = getActionCatalog()['roll-item-table']!;

    const removeExisting = input.removeExistingActorItems ?? (catalog.dataDefaults.removeExistingActorItems as boolean);

    // BUG-772: rollItemTable only wipes when BOTH removeExistingActorItems:true AND a
    // targetActorUuid are given — item-piles.js _rollItemTable forwards to _addItems(targetActor,
    // ..., {removeExistingActorItems}) only inside `if (targetActor)`; with no target the flag is
    // a no-op (nothing is added anywhere, so nothing is wiped) and confirm is not required.
    if (removeExisting && input.targetActorUuid && input.confirm !== true) {
      let previewItems: unknown = null;
      try {
        previewItems = API.getActorItems(input.targetActorUuid);
      } catch (_) { /* best-effort */ }
      const { summary } = previewItemLines(previewItems);
      return confirmRequiredEnvelope(
        'roll-item-table',
        input.targetActorUuid,
        `with removeExistingActorItems:true will WIPE the current inventory (${summary}) before adding the table roll results.`,
      );
    }

    const options: Record<string, unknown> = {
      timesToRoll: input.timesToRoll ?? (catalog.dataDefaults.timesToRoll as number),
      removeExistingActorItems: removeExisting,
    };
    if (input.targetActorUuid) options.targetActor = input.targetActorUuid;
    if (input.rollData) options.rollData = input.rollData;

    const result = await API.rollItemTable(input.tableUuid, options);
    // BUG-784: classify bare false — GM-disconnect vs. business-condition veto.
    if (result === false) {
      return falseReturnEnvelope('roll-item-table', input.targetActorUuid ?? input.tableUuid);
    }

    // DP-16: post-write verify (if target actor specified)
    // H-2/H-3: serialize to {id,name,type,quantity}[] — live Item docs have circular refs and blow up JSON.stringify
    let targetItems: unknown = null;
    if (input.targetActorUuid) {
      try {
        const rawItems = API.getActorItems(input.targetActorUuid);
        targetItems = (Array.isArray(rawItems) ? rawItems : []).map((item: any) => ({
          id: item.id ?? item._id ?? null,
          name: item.name ?? null,
          type: item.type ?? null,
          quantity: item.system?.quantity?.value ?? item.system?.quantity ?? 1,
        }));
      } catch (_) { /* best-effort */ }
    }

    notify.updated('item-piles', `Rolled item table ${input.tableUuid}`, {});
    return { success: true, data: { tableUuid: input.tableUuid, targetActorUuid: input.targetActorUuid ?? null, result, targetItems } };
  } catch (e) {
    return { success: false, error: `ROLL_ITEM_TABLE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type RefreshMerchantInput = Extract<ModuleItempilesInputType, { action: 'refresh-merchant' }>;

export async function handleRefreshMerchant(input: RefreshMerchantInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  // Asymmetric default: removeExistingActorItems defaults to FALSE here (safe)
  // The API default is TRUE (wipes inventory) — we flip it.
  const removeExisting = input.removeExistingActorItems ?? false;

  // CCR-4 + rich-impact-body (matt.ts:498 pattern): confirm required when removeExistingActorItems:true
  if (removeExisting && input.confirm !== true) {
    let previewItems: unknown = null;
    try {
      const API = getItemPilesAPI();
      previewItems = API.getActorItems(input.merchantUuid);
    } catch (_) { /* best-effort */ }
    const itemCount = Array.isArray(previewItems) ? previewItems.length : 'unknown';
    return {
      success: false,
      error: `CONFIRM_REQUIRED: refresh-merchant with removeExistingActorItems:true will WIPE the current inventory (${itemCount} items) of merchant ${input.merchantUuid} before restocking. Re-send with confirm:true.`,
    };
  }

  try {
    const API = getItemPilesAPI();

    // M-1: tablesForPopulate removed — it's an actor flag, not an API arg (item-piles.js:99278);
    // set table population via update-pile pile flags before calling refresh-merchant.
    const options: Record<string, unknown> = {
      removeExistingActorItems: removeExisting,
    };

    const refreshResult = await API.refreshMerchantInventory(input.merchantUuid, options);
    // BUG-784: classify bare false — GM-disconnect vs. business-condition veto.
    if (refreshResult === false) {
      return falseReturnEnvelope('refresh-merchant', input.merchantUuid);
    }

    // DP-16: post-write verify — refreshMerchantInventory's own restock table is out of our
    // control (table roll may legitimately restock to 0 items), so gate on structural sanity:
    // the actor must still resolve as a merchant pile after the call.
    const afterItems = API.getActorItems(input.merchantUuid);
    const count = Array.isArray(afterItems) ? afterItems.length : 0;
    if (!API.isItemPileMerchant(input.merchantUuid)) {
      return notPersisted(ErrorTokens.ITEM_PILES_REFRESH_MERCHANT_NOT_PERSISTED, `merchant ${input.merchantUuid} no longer resolves as an item-pile merchant after refreshMerchantInventory`);
    }
    notify.updated('item-piles', `Refreshed merchant inventory for ${input.merchantUuid}`, {});
    return { success: true, data: { merchantUuid: input.merchantUuid, removeExistingActorItems: removeExisting, itemCount: count } };
  } catch (e) {
    return { success: false, error: `REFRESH_MERCHANT_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── 3B: Scripted trade ────────────────────────────────────────────────────────

type TradeItemsInput = Extract<ModuleItempilesInputType, { action: 'trade-items' }>;

export async function handleTradeItems(input: TradeItemsInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  // Validate merchant type
  try {
    const API = getItemPilesAPI();
    const isMerchant = API.isItemPileMerchant(input.merchantUuid);
    if (!isMerchant) {
      return { success: false, error: `INVALID_PILE_TYPE: actor ${input.merchantUuid} is not a merchant pile — use update-pile to set type:"merchant" first` };
    }

    // CCR-4: dangerous — confirm required
    if (input.confirm !== true) {
      // BUG-448#7: readable preview — first-item price string + buyer balance via
      // getStringFromCurrencies instead of a ~4KB serialized price-data dump.
      // C-6/C-8 (trade preview): getPricesForItem needs Item instance not UUID (item-piles.js:99471)
      let pricePreview = 'unknown';
      let buyerBalance = 'unknown';
      try {
        const item = input.items[0];
        if (item?.itemId) {
          const fromUuidSync = (globalThis as any).fromUuidSync;
          // item.itemId is a bare embedded-item id, not a full UUID — resolve it against the
          // merchant actor: full UUID is "<merchantUuid>.Item.<itemId>". Fall back to a direct
          // id lookup on the merchant's items collection.
          let itemDoc = typeof fromUuidSync === 'function'
            ? fromUuidSync(`${input.merchantUuid}.Item.${item.itemId}`)
            : null;
          if (!itemDoc) {
            const merchant = typeof fromUuidSync === 'function' ? fromUuidSync(input.merchantUuid) : null;
            itemDoc = merchant?.items?.get?.(item.itemId) ?? null;
          }
          if (itemDoc) {
            // BUG-771: pass the buyer so upstream applies any buyer-specific price modifier
            // (item-piles.js:99470 getPricesForItem + 85630-85639 _tradeItems both resolve
            // seller+buyer before pricing) — the later real trade always supplies both; this
            // preview previously supplied seller only, so a per-buyer modifier was invisible
            // here but active at charge time (GM approves one price, player charged another).
            // Also select the SAME payment option index the trade itself will use
            // (getPaymentData: item-piles.js:35963 `[data.paymentIndex || 0]`) instead of
            // always previewing index 0 regardless of the caller's chosen option.
            const prices: any = API.getPricesForItem(itemDoc, { seller: input.merchantUuid, buyer: input.buyerUuid, quantity: item.quantity });
            const p: any = Array.isArray(prices) ? prices[item.paymentIndex ?? 0] : prices;
            pricePreview = String(p?.priceString || p?.basePriceString || (p?.free ? 'free' : 'unknown'));
          }
        }
        const buyerEntries: any[] = API.getActorCurrencies(input.buyerUuid) ?? [];
        if (buyerEntries.length > 0) {
          buyerBalance = API.getStringFromCurrencies(
            buyerEntries.map((c: any) => ({ cost: Number(c?.quantity) || 0, abbreviation: c?.abbreviation })),
          ) || '(none)';
        }
      } catch (_) { /* best-effort */ }
      return {
        success: false,
        error: `CONFIRM_REQUIRED: trade-items will deduct currency from buyer ${input.buyerUuid} for ${input.items.length} item(s) from merchant ${input.merchantUuid}. First item price: ${pricePreview}; buyer holds: ${buyerBalance}. Re-send with confirm:true.`,
      };
    }

    const items = input.items.map((i) => ({
      item: i.itemId,
      quantity: i.quantity,
      paymentIndex: i.paymentIndex ?? 0,
    }));
    // BUG-445 (D8): resolve traded item NAMES from the merchant BEFORE the trade — buyer-side
    // copies get new embedded ids (or stack-merge into an existing same-name item), so the
    // name family is the only stable join for the quantity-delta verify below.
    const merchantItemsPre = API.getActorItems(input.merchantUuid);
    const merchantItemsArr = Array.isArray(merchantItemsPre) ? merchantItemsPre : [];
    const tradedIds = new Set(input.items.map((i) => String(i.itemId)));
    const tradedMerchantItems = merchantItemsArr.filter((it: any) => tradedIds.has(String(it?.id ?? it?._id ?? '')));
    const tradedNames = new Set<string>(tradedMerchantItems.map((it: any) => String(it?.name ?? '')));
    // BUG-770: item-piles.js:85727 (`if (itemFlagData.isService) continue;`) deliberately never
    // embeds a purchased service item on the buyer — that's by design, the effect is delivered
    // by the item's macro instead. The MCP verifier previously still required the buyer's
    // quantity for EVERY traded name to grow, so a pure-service purchase would false-fail
    // ITEM_PILES_TRADE_ITEMS_NOT_PERSISTED after the buyer had already been charged. Exclude
    // service item names from the "must grow" family — services are verified by committed
    // payment (dto.ok) alone, matching upstream's own contract for them.
    const serviceNames = new Set<string>(
      tradedMerchantItems
        .filter((it: any) => Boolean(it?.flags?.['item-piles']?.isService))
        .map((it: any) => String(it?.name ?? '')),
    );
    const growthCheckNames = new Set<string>([...tradedNames].filter((n) => !serviceNames.has(n)));
    const beforeBuyerQty = totalQuantity(API, input.buyerUuid, { names: growthCheckNames });
    // Net currency delta for the ledger append below: before/after snapshot of the buyer's
    // currency, NOT itemDeltas (shape unverified for a mixed merchandise+payment trade — memo
    // flags this; the snapshot approach sidesteps it entirely).
    const beforeBuyerCurrencyTotal = currencyTotal(API.getActorCurrencies(input.buyerUuid));

    let result: unknown;
    try {
      result = await API.tradeItems(input.merchantUuid, input.buyerUuid, items);
    } catch (e) {
      // BUG-770 (macro branch): upstream commits BOTH transactions before running the
      // purchased item's macro (item-piles.js:85756-85797) — a missing named macro THROWS
      // from inside tradeItems, after payment already landed. Distinguish "payment committed,
      // then something downstream broke" from a plain trade failure so the caller does not
      // retry and double-charge the buyer.
      const afterThrowBuyerCurrencyTotal = currencyTotal(API.getActorCurrencies(input.buyerUuid));
      const paidDespiteThrow = Math.max(0, beforeBuyerCurrencyTotal - afterThrowBuyerCurrencyTotal);
      if (paidDespiteThrow > 0) {
        await recordEconomyTransaction({
          actorId: input.buyerUuid,
          targetActorId: input.merchantUuid,
          amount: paidDespiteThrow,
          type: 'trade-items',
          source: 'itempiles',
          description: `Item Piles: bought ${input.items.length} item(s) from merchant (post-payment error — see ITEM_PILES_TRADE_POST_PAYMENT_ERROR)`,
        });
      }
      const msg = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        error: paidDespiteThrow > 0
          ? `ITEM_PILES_TRADE_POST_PAYMENT_ERROR: buyer ${input.buyerUuid} was already charged (${paidDespiteThrow}) before this error — do NOT retry the trade, it would double-charge. Cause: ${msg}`
          : `TRADE_ITEMS_ERROR: ${msg}`,
      };
    }
    // BUG-784: classify bare false — GM-disconnect vs. business-condition veto.
    if (result === false) {
      return falseReturnEnvelope('trade-items', `${input.merchantUuid} -> ${input.buyerUuid}`);
    }

    // BUG-423 (XPK-01) + live-smoke correction (2026-07-02): the REAL tradeItems resolution
    // is { itemDeltas, attributeDeltas, itemPrices } (item-piles dist _tradeItems return
    // site). The previously assumed {itemMoved} exists NOWHERE in the module — it was
    // fixture-fabricated. Same ok semantics as transfer-currency: empty deltas = nothing
    // moved = ok:false (loud).
    const rt: any = result ?? {};
    const dto = {
      ok: (Array.isArray(rt.itemDeltas) && rt.itemDeltas.length > 0)
        || Object.keys(rt.attributeDeltas ?? {}).length > 0,
      itemDeltas: Array.isArray(rt.itemDeltas) ? rt.itemDeltas : [],
      attributeDeltas: rt.attributeDeltas ?? {},
    };

    // DP-16 (BUG-445b, D8): post-write verify (settle-polled) — when the module reported items
    // moved (dto.ok), the buyer's TOTAL QUANTITY over the traded item family must have grown.
    // Distinct-item count is the wrong dimension: a stack-merge (buyer already holds the item)
    // leaves the count static while quantity 1→2, and false-failed successful trades.
    // Empty name family (traded ids unresolvable pre-trade, or every traded item is a service
    // per BUG-770 above) → dto.ok stands alone; a whole-actor sum would net-DECREASE on the
    // currency side (money items are items too).
    if (dto.ok && growthCheckNames.size > 0) {
      const readBuyerQty = () => totalQuantity(API, input.buyerUuid, { names: growthCheckNames });
      const persisted = await settlePoll(() => readBuyerQty() > beforeBuyerQty);
      if (!persisted) {
        return notPersisted(ErrorTokens.ITEM_PILES_TRADE_ITEMS_NOT_PERSISTED, `trade-items to buyer ${input.buyerUuid} reported ok but the traded (non-service) item family's total quantity failed to grow (before: ${beforeBuyerQty}, after: ${readBuyerQty()})`);
      }
    }
    const buyerCurrencies = API.getActorCurrencies(input.buyerUuid);
    const buyerItems = API.getActorItems(input.buyerUuid);
    const buyerItemCount = Array.isArray(buyerItems) ? buyerItems.length : 0;

    notify.updated('item-piles', `Traded ${input.items.length} item(s) from ${input.merchantUuid} to ${input.buyerUuid}`, {});
    const afterBuyerCurrencyTotal = currencyTotal(buyerCurrencies);
    const paidAmount = Math.max(0, beforeBuyerCurrencyTotal - afterBuyerCurrencyTotal);
    await recordEconomyTransaction({
      actorId: input.buyerUuid,
      targetActorId: input.merchantUuid,
      amount: paidAmount,
      type: 'trade-items',
      source: 'itempiles',
      description: `Item Piles: bought ${input.items.length} item(s) from merchant`,
    });
    // BUG-780: an empty/no-op trade (dto.ok:false — nothing moved and no attribute delta)
    // still reaches this success path; `itemsTraded` also previously echoed the REQUESTED
    // count regardless of what actually committed. Report `noop` with a reason and the
    // actually-committed count.
    return {
      success: true,
      data: buildOutcomeResponse(dto.ok ? 'applied' : 'noop', {
        merchantUuid: input.merchantUuid,
        buyerUuid: input.buyerUuid,
        itemsTraded: dto.ok ? input.items.length : 0,
        buyerCurrencies,
        buyerItemCount,
        result: dto,
        ...(dto.ok ? {} : { reason: 'nothing moved — module reported no item or attribute deltas' }),
      }),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('insufficient') || msg.includes('Insufficient') || msg.includes('enough')) {
      return { success: false, error: `INSUFFICIENT_CURRENCY: buyer does not have enough currency for this trade — ${msg}` };
    }
    return { success: false, error: `TRADE_ITEMS_ERROR: ${msg}` };
  }
}

// ── 3B: Merchant price layer ──────────────────────────────────────────────────

type UpdatePriceModifiersInput = Extract<ModuleItempilesInputType, { action: 'update-price-modifiers' }>;

export async function handleUpdatePriceModifiers(input: UpdatePriceModifiersInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: price modifier operations require GM access' };

  try {
    const API = getItemPilesAPI();
    const subAction = input.subAction ?? 'get-modifiers';

    // BUG-773: omitting `subAction` silently defaults to the read-only 'get-modifiers' — every
    // authored recipe supplying buy/sell/relative/override fields but no explicit subAction
    // therefore executed a no-op read while reporting success. Fail loud instead: a write field
    // present on a read subAction is almost certainly a missing `subAction:"update-modifiers"`,
    // not deliberate.
    const writeFieldsPresent = ['buyPriceModifier', 'sellPriceModifier', 'relative', 'override'].filter(
      (f) => (input as any)[f] !== undefined,
    );
    if (subAction !== 'update-modifiers' && writeFieldsPresent.length > 0) {
      return {
        success: false,
        error: `MODULE_ITEMPILES_WRITE_FIELDS_ON_READ_SUBACTION: [${writeFieldsPresent.join(', ')}] supplied but subAction is "${subAction}" (read-only) — did you mean subAction:"update-modifiers"? These fields are ignored by ${subAction} and would silently no-op if not rejected here.`,
      };
    }

    if (subAction === 'get-prices') {
      if (!input.itemUuid) {
        return { success: false, error: 'MISSING_ITEM_UUID: itemUuid is required for get-prices' };
      }
      // C-6: getPricesForItem/getCostOfItem need live Item instances (item-piles.js:99471/99456)
      const fromUuidSync = (globalThis as any).fromUuidSync;
      const itemDoc = typeof fromUuidSync === 'function' ? fromUuidSync(input.itemUuid) : null;
      if (!itemDoc) {
        return { success: false, error: `ITEM_NOT_FOUND: cannot resolve item UUID "${input.itemUuid}"` };
      }
      // BUG-771: forward targetActorUuid as the buyer (mirrors BUG-380's actorOpt pattern for
      // get-modifiers just below) so a buyer-specific price modifier is reflected in this
      // preview — without it getPricesForItem defaults buyer:false and only the merchant's
      // global/seller-only price is ever shown, even when a per-buyer override exists.
      const buyerOpt = input.targetActorUuid ?? false;
      const prices = API.getPricesForItem(itemDoc, { seller: input.actorUuid, buyer: buyerOpt, quantity: input.quantity ?? 1 });
      const cost = API.getCostOfItem(itemDoc);
      return { success: true, data: { actorUuid: input.actorUuid, targetActorUuid: input.targetActorUuid ?? null, itemUuid: input.itemUuid, quantity: input.quantity ?? 1, prices, cost } };
    }

    if (subAction === 'get-modifiers') {
      // L-7: isItemPileMerchant pre-check for get-modifiers
      if (!API.isItemPileMerchant(input.actorUuid)) {
        return { success: false, error: 'INVALID_PILE_TYPE: actor is not an item pile merchant' };
      }
      // BUG-380: forward targetActorUuid as the `actor` option so getMerchantPriceModifiers
      // resolves the per-actor override from actorPriceModifiers. Without it the API returns
      // only the merchant global default (1.0), never the per-actor value update-modifiers wrote.
      const actorOpt = input.targetActorUuid ?? false;
      const modifiers = API.getMerchantPriceModifiers(input.actorUuid, { actor: actorOpt });
      return { success: true, data: { actorUuid: input.actorUuid, targetActorUuid: input.targetActorUuid ?? null, modifiers } };
    }

    // update-modifiers
    // L-7: isItemPileMerchant pre-check
    if (!API.isItemPileMerchant(input.actorUuid)) {
      return { success: false, error: 'INVALID_PILE_TYPE: actor is not an item pile merchant' };
    }

    const agmErr = activeGmRequired();
    if (agmErr) return agmErr;

    // L-4/C-9: validate modifier values REGARDLESS of relative flag (relative:false with NaN still corrupts)
    const buyErr = validateRelativeModifier(input.buyPriceModifier, 'buyPriceModifier');
    if (buyErr) return { success: false, error: buyErr };
    const sellErr = validateRelativeModifier(input.sellPriceModifier, 'sellPriceModifier');
    if (sellErr) return { success: false, error: sellErr };

    // C-3: updateMerchantPriceModifiers needs ARRAY of entries each with actorUuid (item-piles.js:98364)
    // targetActorUuid defaults to actorUuid (merchant's own modifier) when not specified
    const targetUuid = input.targetActorUuid ?? input.actorUuid;
    const isRelative = input.relative === true;

    // BUG-774: snapshot the PRE-write raw entry/flag data — upstream's relative-mode arithmetic
    // (item-piles.js:98404-98407) is `new = old + requested`, and `old` comes from THIS exact
    // fallback chain (per-actor entry -> merchant global flag -> hardcoded default). The verifier
    // below must compute the same expected value, not compare the stored result to the raw delta.
    const preFlagData: any = API.getActorFlagData(input.actorUuid);
    const preEntry: any = (Array.isArray(preFlagData?.actorPriceModifiers) ? preFlagData.actorPriceModifiers : [])
      .find((e: any) => e?.actorUuid === targetUuid) ?? {};
    const oldBuy: number = preEntry?.buyPriceModifier ?? preFlagData?.buyPriceModifier ?? 1;
    const oldSell: number = preEntry?.sellPriceModifier ?? preFlagData?.sellPriceModifier ?? 0.5;

    // BUG-774: under relative:true, upstream computes `old + requested` per side independently —
    // an omitted side becomes `old + undefined = NaN` (Math.max(0, NaN) is still NaN), silently
    // corrupting whichever side the caller didn't touch. Default an omitted side to a 0 delta
    // (relative "no change") instead of leaving it undefined — this is the "preserve omitted
    // fields explicitly" fix route from the bug entry, chosen over "require both fields" because
    // it keeps a legitimate single-side relative update (e.g. "raise buy only") working.
    const buyRequested = isRelative ? (input.buyPriceModifier ?? 0) : input.buyPriceModifier;
    const sellRequested = isRelative ? (input.sellPriceModifier ?? 0) : input.sellPriceModifier;

    const modifierEntry: Record<string, unknown> = { actorUuid: targetUuid };
    if (buyRequested !== undefined) modifierEntry['buyPriceModifier'] = buyRequested;
    if (sellRequested !== undefined) modifierEntry['sellPriceModifier'] = sellRequested;
    if (input.relative !== undefined) modifierEntry['relative'] = input.relative;
    if (input.override !== undefined) modifierEntry['override'] = input.override;

    const modifyResult = await API.updateMerchantPriceModifiers(input.actorUuid, [modifierEntry]);
    // BUG-784: classify bare false — GM-disconnect vs. business-condition veto.
    if (modifyResult === false) {
      return falseReturnEnvelope('update-price-modifiers', input.actorUuid);
    }

    // BUG-774: expected POST-write value per field, mirroring item-piles.js:98404-98407 exactly:
    // relative -> Math.max(0, old + requested); absolute -> requested ?? old (a field genuinely
    // untouched by this call keeps its old value and is excluded from the drift check below).
    // override is NEVER preserved upstream (item-piles.js:98411) — every write resets it to
    // `override ?? false`, so it is always verified, not only when explicitly supplied.
    const expected: Record<string, number | boolean> = { override: input.override ?? false };
    if (modifierEntry['buyPriceModifier'] !== undefined) {
      expected['buyPriceModifier'] = isRelative ? Math.max(0, oldBuy + (buyRequested as number)) : Math.max(0, buyRequested as number);
    }
    if (modifierEntry['sellPriceModifier'] !== undefined) {
      expected['sellPriceModifier'] = isRelative ? Math.max(0, oldSell + (sellRequested as number)) : Math.max(0, sellRequested as number);
    }

    // DP-16 (BUG-445d, D8; BUG-774 extends to override + relative-aware expected values): verify
    // against the RAW actorPriceModifiers flag entry — the actual write target (item-piles.js:98364),
    // read via getActorFlagData at the SAME scope we wrote (targetUuid; BUG-380). getMerchantPriceModifiers
    // returns the COMPOSED effective modifier (per-actor × merchant global), so a correct write of
    // e.g. sell:0.5 under a 0.5 global read back as 0.25 and false-failed the old compare.
    const rawFlagData: any = API.getActorFlagData(input.actorUuid);
    const rawEntry: any = (Array.isArray(rawFlagData?.actorPriceModifiers) ? rawFlagData.actorPriceModifiers : [])
      .find((e: any) => e?.actorUuid === targetUuid) ?? {};
    const drift = (Object.keys(expected) as Array<keyof typeof expected>).filter((k) => {
      const raw = rawEntry?.[k];
      const want = expected[k];
      return typeof want === 'boolean' ? Boolean(raw) !== want : Number(raw) !== want;
    });
    if (drift.length > 0) {
      return notPersisted(ErrorTokens.ITEM_PILES_PRICE_MODIFIERS_NOT_PERSISTED, `price modifiers for ${input.actorUuid} did not persist in the raw actorPriceModifiers flag entry for ${targetUuid}: ${drift.join(', ')} (expected ${JSON.stringify(expected)}, raw flag entry ${JSON.stringify(rawEntry)})`);
    }
    const afterModifiers: any = API.getMerchantPriceModifiers(input.actorUuid, { actor: targetUuid });
    notify.updated('item-piles', `Updated price modifiers for ${input.actorUuid}`, {});
    return { success: true, data: buildOutcomeResponse('applied', { actorUuid: input.actorUuid, subAction: 'update-modifiers', targetActorUuid: input.targetActorUuid ?? null, modifiers: afterModifiers }) };
  } catch (e) {
    return { success: false, error: `UPDATE_PRICE_MODIFIERS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}
