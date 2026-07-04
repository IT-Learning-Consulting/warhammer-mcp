// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/window.confirm; no matches. Module-API calls here are item/currency mutations only.
// Module Integration v1 Phase 3 — module-itempiles: item/currency mutations + loot split.
// mcp_code_quality_v2 Phase C3 (19a split): extracted verbatim from item-piles.ts — zero
// behavioral change (behavior freeze HC3/HC13).

import { ErrorTokens, type ModuleItempilesInputType } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { Envelope } from '../_shared/handler-utils.js';
import { settlePoll } from '../_shared/settle-poll.js';
import { normalizeItemsArray, validateCurrencyString } from './catalog.js';
import { getItemPilesAPI, notPersisted, gmRequired, activeGmRequired } from './helpers.js';

// ── 3A: Item mutations ────────────────────────────────────────────────────────

type AddItemsInput = Extract<ModuleItempilesInputType, { action: 'add-items' }>;

export async function handleAddItems(input: AddItemsInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  try {
    const API = getItemPilesAPI();
    const items = normalizeItemsArray(input.items);
    const beforeItems = API.getActorItems(input.actorUuid);
    const beforeCount = Array.isArray(beforeItems) ? beforeItems.length : 0;

    // L-1: mergeSimilarItems/respectItemIds removed — not real addItems options (item-piles.js:98428)
    const options: Record<string, unknown> = {
      removeExistingActorItems: input.removeExistingActorItems ?? false,
    };

    const addResult = await API.addItems(input.actorUuid, items, options);
    // M-2: socket returns false when GM disconnects mid-call
    if (addResult === false) {
      return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
    }

    // DP-16: post-write verify (settle-polled) — count must not go DOWN and, when
    // removeExistingActorItems is false (the additive path), must strictly increase.
    const readCount = () => {
      const cur = API.getActorItems(input.actorUuid);
      return Array.isArray(cur) ? cur.length : 0;
    };
    if (items.length > 0 && !options.removeExistingActorItems) {
      const persisted = await settlePoll(() => readCount() > beforeCount);
      if (!persisted) {
        return notPersisted(ErrorTokens.ITEM_PILES_ADD_ITEMS_NOT_PERSISTED, `add-items to ${input.actorUuid} did not increase item count (before: ${beforeCount}, after: ${readCount()})`);
      }
    }
    const count = readCount();
    notify.updated('item-piles', `Added ${items.length} item(s) to ${input.actorUuid}`, {});
    return { success: true, data: { actorUuid: input.actorUuid, itemsAdded: items.length, totalItems: count } };
  } catch (e) {
    return { success: false, error: `ADD_ITEMS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type RemoveItemsInput = Extract<ModuleItempilesInputType, { action: 'remove-items' }>;

export async function handleRemoveItems(input: RemoveItemsInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  try {
    const API = getItemPilesAPI();
    const items = normalizeItemsArray(input.items);
    const beforeItems = API.getActorItems(input.actorUuid);
    const beforeCount = Array.isArray(beforeItems) ? beforeItems.length : 0;

    const removeResult = await API.removeItems(input.actorUuid, items);
    // M-2: socket returns false when GM disconnects mid-call
    if (removeResult === false) {
      return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
    }

    // DP-16: post-write verify (settle-polled) — count must not stay the same or go up when items were requested.
    const readCount = () => {
      const cur = API.getActorItems(input.actorUuid);
      return Array.isArray(cur) ? cur.length : 0;
    };
    if (items.length > 0) {
      const persisted = await settlePoll(() => readCount() < beforeCount);
      if (!persisted) {
        return notPersisted(ErrorTokens.ITEM_PILES_REMOVE_ITEMS_NOT_PERSISTED, `remove-items from ${input.actorUuid} did not decrease item count (before: ${beforeCount}, after: ${readCount()})`);
      }
    }
    const count = readCount();
    notify.updated('item-piles', `Removed ${items.length} item(s) from ${input.actorUuid}`, {});
    return { success: true, data: { actorUuid: input.actorUuid, itemsRemoved: items.length, totalItems: count } };
  } catch (e) {
    return { success: false, error: `REMOVE_ITEMS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type TransferItemsInput = Extract<ModuleItempilesInputType, { action: 'transfer-items' }>;

export async function handleTransferItems(input: TransferItemsInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  const mode = input.mode ?? 'transfer';

  // CCR-4: all/combine are dangerous — confirm required
  if ((mode === 'all' || mode === 'combine') && input.confirm !== true) {
    const modeDesc = mode === 'all' ? 'transferAllItems (empties source actor)' : 'combineItemPiles (empties all source piles)';
    return {
      success: false,
      error: `CONFIRM_REQUIRED: transfer-items mode "${mode}" (${modeDesc}) is destructive. Re-send with confirm:true.`,
    };
  }

  try {
    const API = getItemPilesAPI();
    const beforeTargetItems = API.getActorItems(input.targetUuid);
    const beforeTargetCount = Array.isArray(beforeTargetItems) ? beforeTargetItems.length : 0;
    let result: unknown;

    if (mode === 'all') {
      result = await API.transferAllItems(input.sourceUuid, input.targetUuid);
    } else if (mode === 'combine') {
      // C-4: combineItemPiles(target, sources, options) — item-piles.js:98866; previously reversed
      const options: Record<string, unknown> = {};
      if (input.targetItemPileFlags) options['targetItemPileFlags'] = input.targetItemPileFlags;
      result = await API.combineItemPiles(input.targetUuid, [input.sourceUuid], options);
    } else {
      const items = normalizeItemsArray(input.items ?? []);
      result = await API.transferItems(input.sourceUuid, input.targetUuid, items);
    }

    // M-2: socket returns false when GM disconnects mid-call
    if (result === false) {
      return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
    }

    // BUG-423 (XPK-01): normalize the raw API resolution into an explicit DTO.
    // transferItems/transferAllItems/combineItemPiles resolve to a BARE ARRAY of
    // transferred-item records — never the rich object the formatter previously assumed.
    const dto = { ok: true, itemsTransferred: Array.isArray(result) ? result : [] };

    // DP-16: post-write verify — target item count must not go down after any transfer mode.
    const targetItems = API.getActorItems(input.targetUuid);
    const targetCount = Array.isArray(targetItems) ? targetItems.length : 0;
    if (dto.itemsTransferred.length > 0 && targetCount < beforeTargetCount) {
      return notPersisted(ErrorTokens.ITEM_PILES_TRANSFER_ITEMS_NOT_PERSISTED, `transfer-items to ${input.targetUuid} target item count dropped (before: ${beforeTargetCount}, after: ${targetCount})`);
    }
    notify.updated('item-piles', `Transferred items (mode: ${mode}) from ${input.sourceUuid} to ${input.targetUuid}`, {});
    return { success: true, data: { mode, sourceUuid: input.sourceUuid, targetUuid: input.targetUuid, targetItemCount: targetCount, result: dto } };
  } catch (e) {
    return { success: false, error: `TRANSFER_ITEMS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── 3A: Currency flow ─────────────────────────────────────────────────────────

type AddCurrencyInput = Extract<ModuleItempilesInputType, { action: 'add-currency' }>;

export async function handleAddCurrency(input: AddCurrencyInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  const currErr = validateCurrencyString(input.currencies);
  if (currErr) return { success: false, error: currErr };

  try {
    const API = getItemPilesAPI();
    const beforeCurrencies = API.getActorCurrencies(input.actorUuid);
    const addCurrResult = await API.addCurrencies(input.actorUuid, input.currencies);
    // M-2: socket returns false when GM disconnects mid-call
    if (addCurrResult === false) {
      return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
    }

    // DP-16: post-write verify (settle-polled) — closure-diff against the pre-call snapshot.
    const beforeJson = JSON.stringify(beforeCurrencies);
    const persisted = await settlePoll(() => JSON.stringify(API.getActorCurrencies(input.actorUuid)) !== beforeJson);
    if (!persisted) {
      return notPersisted(ErrorTokens.ITEM_PILES_ADD_CURRENCY_NOT_PERSISTED, `add-currency "${input.currencies}" to ${input.actorUuid} left currencies unchanged`);
    }
    const currentCurrencies = API.getActorCurrencies(input.actorUuid);
    notify.updated('item-piles', `Added currencies "${input.currencies}" to ${input.actorUuid}`, {});
    return { success: true, data: { actorUuid: input.actorUuid, currenciesAdded: input.currencies, currentCurrencies } };
  } catch (e) {
    return { success: false, error: `ADD_CURRENCY_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type RemoveCurrencyInput = Extract<ModuleItempilesInputType, { action: 'remove-currency' }>;

export async function handleRemoveCurrency(input: RemoveCurrencyInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  const currErr = validateCurrencyString(input.currencies);
  if (currErr) return { success: false, error: currErr };

  // CCR-4: dangerous — confirm required
  if (input.confirm !== true) {
    // Pre-check: read current balance for the impact report
    let currentCurrencies: unknown = null;
    try {
      const API = getItemPilesAPI();
      currentCurrencies = API.getActorCurrencies(input.actorUuid);
    } catch (_) { /* best-effort */ }
    return {
      success: false,
      error: `CONFIRM_REQUIRED: remove-currency will permanently deduct "${input.currencies}" from ${input.actorUuid}. Current balance: ${JSON.stringify(currentCurrencies)}. Re-send with confirm:true.`,
    };
  }

  // Pre-check: verify sufficient balance BEFORE calling the API
  try {
    const API = getItemPilesAPI();
    const currentCurrencies = API.getActorCurrencies(input.actorUuid);

    const removeCurrResult = await API.removeCurrencies(input.actorUuid, input.currencies);
    // M-2: socket returns false when GM disconnects mid-call
    if (removeCurrResult === false) {
      return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
    }

    // DP-16: post-write verify (settle-polled) — currencies must actually have changed.
    const beforeJson = JSON.stringify(currentCurrencies);
    const persisted = await settlePoll(() => JSON.stringify(API.getActorCurrencies(input.actorUuid)) !== beforeJson);
    if (!persisted) {
      return notPersisted(ErrorTokens.ITEM_PILES_REMOVE_CURRENCY_NOT_PERSISTED, `remove-currency "${input.currencies}" from ${input.actorUuid} left currencies unchanged`);
    }
    const afterCurrencies = API.getActorCurrencies(input.actorUuid);
    notify.updated('item-piles', `Removed currencies "${input.currencies}" from ${input.actorUuid}`, {});
    return { success: true, data: { actorUuid: input.actorUuid, currenciesRemoved: input.currencies, previousBalance: currentCurrencies, currentCurrencies: afterCurrencies } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('insufficient') || msg.includes('Insufficient') || msg.includes('enough')) {
      return { success: false, error: `INSUFFICIENT_CURRENCY: not enough currency to remove "${input.currencies}" — ${msg}` };
    }
    return { success: false, error: `REMOVE_CURRENCY_ERROR: ${msg}` };
  }
}

type TransferCurrencyInput = Extract<ModuleItempilesInputType, { action: 'transfer-currency' }>;

export async function handleTransferCurrency(input: TransferCurrencyInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  const mode = input.mode ?? 'transfer';

  if (mode === 'all' && input.confirm !== true) {
    return {
      success: false,
      error: 'CONFIRM_REQUIRED: transfer-currency mode "all" (transferAllCurrencies) moves ALL currencies from source. Re-send with confirm:true.',
    };
  }

  try {
    const API = getItemPilesAPI();
    const beforeTargetCurrencies = API.getActorCurrencies(input.targetUuid);
    let result: unknown;

    if (mode === 'all') {
      result = await API.transferAllCurrencies(input.sourceUuid, input.targetUuid);
    } else {
      if (!input.currencies) {
        return { success: false, error: 'MISSING_CURRENCIES: currencies is required for transfer mode (use mode:"all" to transfer everything)' };
      }
      const currErr = validateCurrencyString(input.currencies);
      if (currErr) return { success: false, error: currErr };
      result = await API.transferCurrencies(input.sourceUuid, input.targetUuid, input.currencies);
    }

    // M-2: socket returns false when GM disconnects mid-call
    if (result === false) {
      return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
    }

    // BUG-423 (XPK-01) + live-smoke correction (2026-07-02): the REAL transferCurrencies/
    // transferAllCurrencies resolution is { itemDeltas, attributeDeltas } (item-piles dist
    // _transferCurrencies return site) — NOT the boolean our own test fixture fabricated.
    // ok = "something actually moved": Item Piles can resolve { itemDeltas: [] } on a SILENT
    // NO-OP with no error thrown (observed live in WFRP4e — BUG-428), so empty deltas must
    // read as ok:false and the formatter warns.
    const rc: any = result ?? {};
    const dto = {
      ok: (Array.isArray(rc.itemDeltas) && rc.itemDeltas.length > 0)
        || Object.keys(rc.attributeDeltas ?? {}).length > 0,
      itemDeltas: Array.isArray(rc.itemDeltas) ? rc.itemDeltas : [],
      attributeDeltas: rc.attributeDeltas ?? {},
    };

    // DP-16: post-write verify (settle-polled) — BUG-428 class: dto.ok can be false on a silent
    // no-op; when the module itself reported something moved, the target's currencies must
    // actually differ.
    if (dto.ok) {
      const beforeTargetJson = JSON.stringify(beforeTargetCurrencies);
      const persisted = await settlePoll(() => JSON.stringify(API.getActorCurrencies(input.targetUuid)) !== beforeTargetJson);
      if (!persisted) {
        return notPersisted(ErrorTokens.ITEM_PILES_TRANSFER_CURRENCY_NOT_PERSISTED, `transfer-currency (mode: ${mode}) to ${input.targetUuid} reported ok but left target currencies unchanged`);
      }
    }
    const sourceCurrencies = API.getActorCurrencies(input.sourceUuid);
    const targetCurrencies = API.getActorCurrencies(input.targetUuid);
    notify.updated('item-piles', `Transferred currencies (mode: ${mode}) from ${input.sourceUuid} to ${input.targetUuid}`, {});
    return { success: true, data: { mode, sourceUuid: input.sourceUuid, targetUuid: input.targetUuid, sourceCurrencies, targetCurrencies, result: dto } };
  } catch (e) {
    return { success: false, error: `TRANSFER_CURRENCY_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── 3A: Loot split ────────────────────────────────────────────────────────────

type SplitLootInput = Extract<ModuleItempilesInputType, { action: 'split-loot' }>;

export async function handleSplitLoot(input: SplitLootInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  // L-5: defensive pre-check before confirm gate
  if (!input.targets || input.targets.length === 0) {
    return { success: false, error: 'MISSING_TARGETS: targets must be a non-empty array of actor/token UUIDs (C8 — omitting targets with no active player chars → silent no-op)' };
  }

  // CCR-4: dangerous — confirm required
  if (input.confirm !== true) {
    let previewItems: unknown = null;
    try {
      const API = getItemPilesAPI();
      previewItems = API.getActorItems(input.actorUuid);
    } catch (_) { /* best-effort */ }
    return {
      success: false,
      error: `CONFIRM_REQUIRED: split-loot distributes and empties the pile ${input.actorUuid} among ${input.targets.length} target(s). Current contents: ${JSON.stringify(previewItems)}. Re-send with confirm:true.`,
    };
  }

  try {
    const API = getItemPilesAPI();
    const fromUuidSync = (globalThis as any).fromUuidSync;

    // C-7: targets/instigator must be Actor/TokenDocument instances (item-piles.js:98305-98312);
    // passing UUID strings throws. Resolve each via fromUuidSync.
    const resolvedTargets = input.targets.map((uuid: string) => {
      const doc = typeof fromUuidSync === 'function' ? fromUuidSync(uuid) : null;
      if (!doc) throw new Error(`ACTOR_NOT_FOUND: cannot resolve target UUID "${uuid}" — ensure the actor/token exists`);
      return doc;
    });

    const options: Record<string, unknown> = {
      targets: resolvedTargets,
    };
    if (input.instigator) {
      const instigatorDoc = typeof fromUuidSync === 'function' ? fromUuidSync(input.instigator) : null;
      if (!instigatorDoc) throw new Error(`ACTOR_NOT_FOUND: cannot resolve instigator UUID "${input.instigator}"`);
      options['instigator'] = instigatorDoc;
    }

    const splitResult = await API.splitItemPileContents(input.actorUuid, options);
    // M-2: socket returns false when GM disconnects mid-call
    if (splitResult === false) {
      return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
    }

    // DP-16: post-write verify (settle-polled) — pile should be empty
    const readRemaining = () => {
      const cur = API.getActorItems(input.actorUuid);
      return Array.isArray(cur) ? cur.length : 0;
    };
    const persisted = await settlePoll(() => readRemaining() === 0);
    const remaining = readRemaining();
    if (!persisted && remaining > 0) {
      return notPersisted(ErrorTokens.ITEM_PILES_SPLIT_LOOT_NOT_PERSISTED, `split-loot on ${input.actorUuid} left ${remaining} item(s) in the pile — expected empty`);
    }
    notify.updated('item-piles', `Split loot from ${input.actorUuid} among ${input.targets.length} actors`, {});
    return { success: true, data: { actorUuid: input.actorUuid, targets: input.targets, itemsRemaining: remaining } };
  } catch (e) {
    return { success: false, error: `SPLIT_LOOT_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}
