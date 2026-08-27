// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/window.confirm; no matches. Module-API calls here are item/currency mutations only.
// Module Integration v1 Phase 3 — module-itempiles: item/currency mutations + loot split.
// mcp_code_quality_v2 Phase C3 (19a split): extracted verbatim from item-piles.ts — zero
// behavioral change (behavior freeze HC3/HC13).

import { ErrorTokens, type ModuleItempilesInputType } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { Envelope, getGame } from '../_shared/handler-utils.js';
import { settlePoll } from '../_shared/settle-poll.js';
import { normalizeItemsArray, validateCurrencyString, checkActiveGm } from './catalog.js';
import { getItemPilesAPI, notPersisted, gmRequired, activeGmRequired } from './helpers.js';
import { totalQuantity } from './verify-quantity.js';
import { recordEconomyTransaction } from '../wfrp-economy/ledger.js';
import { buildOutcomeResponse } from '../../../services/shared/outcome-response.js';
import { requireConfirm } from '../../../services/shared/destructive-confirm.js';

// ── Phase 4 (wfrp_economy_system) money-leak closure ────────────────────────────
//
// add-items/remove-items/transfer-items/split-loot move generic `type:'money'` items without ever
// touching wfrp-economy's ledger (unlike add-currency/remove-currency/transfer-currency above, which
// already call recordEconomyTransaction). Detection is DELTA-BASED — measure an actor's total money-BP
// before/after the write settles — rather than parsing per-entry item shapes: add/remove/transfer's
// `items` payloads are shape-flexible (full item data for add, bare {_id,quantity} refs for
// remove/transfer), so a delta on the actor's OWN post-write state is simpler and cannot drift from
// whatever shape the caller passed in. Post-write detection ONLY — never gates or filters the op itself
// (fail-open, mirrors recordEconomyTransaction's own contract).
// ⚠ Do NOT read money via API.getActorItems — Item Piles EXCLUDES currency-registered items from
// it (the wfrp4e bridge registers money items as item-type currencies) and applies its physical-item
// filters, so money is structurally invisible through that API and the delta reads 0 forever.
// Live-falsified 2026-07-10 (Phase 4 validate smoke: 240 BP transfer produced no ledger row).
// Read the actor document's own embedded items instead.
function actorMoneyBp(_API: any, actorUuid: string): number {
  const resolved = (globalThis as any).fromUuidSync?.(actorUuid);
  const doc = resolved?.documentName === 'Token' ? resolved?.actor : resolved;
  const items = doc?.items ?? [];
  let sum = 0;
  for (const it of items) {
    if (it?.type === 'money') {
      sum += Number(it?.system?.quantity?.value ?? 0) * Number(it?.system?.coinValue?.value ?? 0);
    }
  }
  return sum;
}

// ── BUG-772/786: shared confirm-choreography helper ────────────────────────────
//
// add-items(removeExistingActorItems:true), roll-item-table(removeExistingActorItems:true +
// targetActorUuid), and remove-items are all irreversible-destruction paths that had no
// confirm:true gate (BUG-772: the two wipe paths; BUG-786: permanent item removal). This mirrors
// the CONFIRM_REQUIRED choreography already established by refresh-merchant (merchant.ts CCR-4),
// remove-currency, split-loot, and transfer-items(all/combine) — one envelope shape instead of
// three more hand-rolled duplicates. Exported so merchant.ts's roll-item-table gate (BUG-772,
// same wipe class as add-items) reuses it rather than re-deriving the choreography.

/** Best-effort "N item(s): Name (qty: n), ..." summary for a confirm-choreography preview. */
export function previewItemLines(items: unknown): { count: number; summary: string } {
  const arr = Array.isArray(items) ? items : [];
  const lines = arr.map((it: any) => {
    const qty = it?.system?.quantity?.value ?? it?.system?.quantity ?? 1;
    return `${String(it?.name ?? '(unnamed)')} (qty: ${qty})`;
  });
  return { count: arr.length, summary: arr.length === 0 ? '(empty)' : `${arr.length} item(s): ${lines.join(', ')}` };
}

/**
 * The CONFIRM_REQUIRED envelope every gated destructive item-piles action returns pre-confirm.
 * Thin delegate to the shared `requireConfirm()` helper (systemic_bug_class_prevention v2 Phase
 * 1/5.1 — R1.3 consolidation) — kept as a distinct function (rather than inlining at each call
 * site) so its 3 existing call sites (`flow.ts` add-items/remove-items, `merchant.ts`
 * roll-item-table) stay untouched and byte-identical. `detail`'s own trailing period is stripped
 * before composing the blast-radius string because `requireConfirm()` appends its own terminal
 * period ahead of the `Re-send with confirm:true.` trailer — without the strip the two periods
 * would collide and the refusal text would drift from its pre-consolidation wording.
 */
export function confirmRequiredEnvelope(action: string, actorUuid: string, detail: string): Envelope<unknown> {
  const trimmedDetail = detail.endsWith('.') ? detail.slice(0, -1) : detail;
  const blastRadius = `${actorUuid} ${trimmedDetail}`;
  // requireConfirm() only resolves null when confirm===true; this call always passes
  // confirm:false since it exists to BUILD the refusal envelope, so the result is always the
  // ConfirmRequiredEnvelope arm, which is a valid Envelope<unknown> (Envelope<T>'s false arm).
  return requireConfirm({ confirm: false }, action, blastRadius) as Envelope<unknown>;
}

// ── BUG-784: false-return classification (shared by flow.ts/merchant.ts/container.ts) ─────────
//
// Every socket-routed item-piles API call resolves a bare `false` for MULTIPLE distinct causes
// upstream never distinguishes: a disconnected GM mid-call (M-2's original concern), a hook veto
// (e.g. a preAddItems/preTradeItems/preLockItemPile handler refusing the operation), a
// non-lootable-target refusal, or another business-condition failure. Every handler in this
// trio previously translated ALL of these uniformly to NO_ACTIVE_GM, asserting a network/
// principal cause the response cannot actually know (BUG-784).
//
// activeGmRequired() already confirms a GM is active BEFORE the API call runs. Re-running that
// exact same check immediately AFTER a bare `false` comes back is the one genuine business-vs-
// connectivity discriminator available here: if a GM is STILL active post-call, the socket call
// itself didn't fail for lack of a GM — the `false` is a business-condition veto. Only a GM that
// has genuinely gone inactive between the pre-check and this call still yields NO_ACTIVE_GM —
// which stays truthful because it is re-verified, not assumed.
//
// systemic_bug_class_prevention v2 Phase 4 (D2, BUG-784 residual): when a GM is confirmed active,
// an optional `targetUuid` is now probed for the MOST SPECIFIC detectable cause instead of always
// reporting the neutral veto — see probeVetoToken()/vetoClause() below. All five tokens
// (ITEM_PILES_OPERATION_VETOED + the 4 precise ones) are enum-backed via ErrorTokens (D4).

/**
 * D2: probe `targetUuid` (in specificity order) for the most likely reason item-piles returned
 * `false` while a GM was active. Each predicate is independently try/catch-guarded — a probe
 * that throws (no targetUuid, or the target doesn't resolve for that predicate) is UNDETECTED,
 * never a match, and probing continues to the next predicate. Returns null (→ the neutral
 * ITEM_PILES_OPERATION_VETOED residual) when there is no targetUuid or no predicate matched.
 */
function probeVetoToken(targetUuid: string | undefined): string | null {
  if (!targetUuid) return null;
  let API: any;
  try {
    API = getItemPilesAPI();
  } catch (_) {
    return null;
  }
  try {
    if (API.isValidItemPile(targetUuid) === false) return ErrorTokens.ITEM_PILES_INVALID_TARGET;
  } catch (_) { /* undetected — probing continues */ }
  try {
    if (API.isItemPileLocked(targetUuid) === true) return ErrorTokens.ITEM_PILES_TARGET_LOCKED;
  } catch (_) { /* undetected */ }
  try {
    if (API.isItemPileClosed(targetUuid) === true) return ErrorTokens.ITEM_PILES_TARGET_CLOSED;
  } catch (_) { /* undetected */ }
  try {
    if (API.isItemPileMerchant(targetUuid) === false) return ErrorTokens.ITEM_PILES_NOT_A_MERCHANT;
  } catch (_) { /* undetected */ }
  return null;
}

/** Token-specific clause text for the GM-active branch of falseReturnCause() (D2). */
function vetoClause(token: string, targetUuid: string | undefined): string {
  const gmNote = 'a GM is currently active, so this is not a connectivity failure';
  switch (token) {
    case ErrorTokens.ITEM_PILES_INVALID_TARGET:
      return `${gmNote} — target ${targetUuid} does not resolve as a valid item pile`;
    case ErrorTokens.ITEM_PILES_TARGET_LOCKED:
      return `${gmNote} — target ${targetUuid} is currently locked`;
    case ErrorTokens.ITEM_PILES_TARGET_CLOSED:
      return `${gmNote} — target ${targetUuid} is currently closed`;
    case ErrorTokens.ITEM_PILES_NOT_A_MERCHANT:
      return `${gmNote} — target ${targetUuid} does not resolve as an item-pile merchant`;
    default:
      return `was refused by item-piles — ${gmNote} (likely a hook veto or a business-condition refusal, e.g. a non-lootable target)`;
  }
}

export function falseReturnCause(targetUuid?: string): { noActiveGm: boolean; clause: string; token: string } {
  const gmErr = checkActiveGm(getGame());
  if (gmErr) {
    return { noActiveGm: true, clause: 'no active GM client is currently detected', token: 'NO_ACTIVE_GM' };
  }
  const token = probeVetoToken(targetUuid) ?? ErrorTokens.ITEM_PILES_OPERATION_VETOED;
  return { noActiveGm: false, clause: vetoClause(token, targetUuid), token };
}

/** Message form of the BUG-784 classification, for sites that throw rather than return an Envelope. */
export function falseReturnMessage(operation: string, target: string, detail?: string, targetUuid?: string): string {
  const { noActiveGm, clause, token } = falseReturnCause(targetUuid);
  if (noActiveGm) {
    return `NO_ACTIVE_GM: ${operation} on ${target} — item-piles socket returned false and ${clause}.`;
  }
  return `${token}: ${operation} on ${target} ${clause}.${detail ? ` ${detail}` : ''}`;
}

/** Envelope form of the BUG-784 classification for every bare-`false`-from-item-piles site. */
export function falseReturnEnvelope(operation: string, target: string, detail?: string, targetUuid?: string): Envelope<never> {
  return { success: false, error: falseReturnMessage(operation, target, detail, targetUuid) };
}

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

    // BUG-772: removeExistingActorItems:true wipes the target's ENTIRE existing inventory before
    // adding (item-piles.js _addItems: transaction.appendItemChanges(existingItems, {remove:true})
    // when removeExistingActorItems) — the same class of destructive replacement refresh-merchant
    // already confirm-gates (CCR-4), but this wipe path was never extended the same gate. Preview
    // the existing inventory + replacement count before requiring literal confirm:true.
    const removeExisting = input.removeExistingActorItems ?? false;
    if (removeExisting && input.confirm !== true) {
      let previewItems: unknown = null;
      try {
        previewItems = API.getActorItems(input.actorUuid);
      } catch (_) { /* best-effort */ }
      const { summary } = previewItemLines(previewItems);
      return confirmRequiredEnvelope(
        'add-items',
        input.actorUuid,
        `with removeExistingActorItems:true will WIPE the current inventory (${summary}) before adding ${items.length} replacement item(s).`,
      );
    }

    // BUG-461(b): quantity-dimension verify. Adding an item onto an existing same-name stack
    // merges — distinct-item COUNT stays flat while quantity grows — so the old count-based
    // check false-failed the successful add exactly like BUG-445b. Build the added-item
    // name/id family and measure TOTAL QUANTITY over it (verify-quantity.ts, D8). No family
    // resolvable → whole-actor total (an add only increases it), mirroring remove-items.
    const addedIds = new Set<string>();
    const addedNames = new Set<string>();
    for (const entry of items) {
      if (entry && typeof entry === 'object') {
        const obj = entry as Record<string, unknown>;
        if (obj['_id'] !== undefined) addedIds.add(String(obj['_id']));
        if (obj['id'] !== undefined) addedIds.add(String(obj['id']));
        if (obj['name'] !== undefined) addedNames.add(String(obj['name']));
      }
    }
    const family = (addedIds.size > 0 || addedNames.size > 0)
      ? { ids: addedIds, names: addedNames }
      : undefined;
    const beforeQty = totalQuantity(API, input.actorUuid, family);
    const beforeMoneyBp = actorMoneyBp(API, input.actorUuid);

    // L-1: mergeSimilarItems/respectItemIds removed — not real addItems options (item-piles.js:98428)
    const options: Record<string, unknown> = {
      removeExistingActorItems: removeExisting,
    };

    const addResult = await API.addItems(input.actorUuid, items, options);
    // BUG-784: bare false is a GM-disconnect OR a business-condition veto (hook veto, etc.) —
    // classify, don't assume (see falseReturnEnvelope block comment above).
    if (addResult === false) {
      return falseReturnEnvelope('add-items', input.actorUuid, undefined, input.actorUuid);
    }

    // DP-16 (BUG-461b): post-write verify (settle-polled) — on the additive path
    // (removeExistingActorItems false) the added family's total quantity must strictly increase.
    const readQty = () => totalQuantity(API, input.actorUuid, family);
    if (items.length > 0 && !options.removeExistingActorItems) {
      const persisted = await settlePoll(() => readQty() > beforeQty);
      if (!persisted) {
        return notPersisted(ErrorTokens.ITEM_PILES_ADD_ITEMS_NOT_PERSISTED, `add-items to ${input.actorUuid} did not increase the added item family's total quantity (before: ${beforeQty}, after: ${readQty()})`);
      }
    }
    const afterItems = API.getActorItems(input.actorUuid, { getItemCurrencies: true }); // BUG-775
    const count = Array.isArray(afterItems) ? afterItems.length : 0;
    // Money-leak closure (Phase 4): a generic add-items call can add type:'money' items, which never
    // touches the wfrp-economy ledger otherwise. Post-write delta, fail-open, never gates the op.
    const moneyDelta = actorMoneyBp(API, input.actorUuid) - beforeMoneyBp;
    if (moneyDelta > 0) {
      await recordEconomyTransaction({
        actorId: input.actorUuid,
        amount: moneyDelta,
        type: 'item-ops-money-add',
        source: 'itempiles',
        description: `Item Piles: money item(s) added via add-items (+${moneyDelta} BP)`,
      });
    }
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

    // BUG-786: remove-items permanently destroys inventory with no confirm gate — the safety
    // reference already requires confirm:true for irreversible ops (permanent currency deduction
    // is gated via remove-currency's CCR-4 choreography) but item removal was silently exempt.
    // Preview requested-vs-current quantity per targeted item before requiring confirm:true.
    if (input.confirm !== true) {
      let currentItems: unknown = null;
      try {
        currentItems = API.getActorItems(input.actorUuid);
      } catch (_) { /* best-effort */ }
      const currentArr = Array.isArray(currentItems) ? currentItems : [];
      const lines = items.map((entry: unknown) => {
        const obj = (entry && typeof entry === 'object') ? (entry as Record<string, unknown>) : {};
        const id = String(obj['_id'] ?? obj['id'] ?? '');
        const current: any = currentArr.find((it: any) => String(it?.id ?? it?._id ?? '') === id);
        const name = current?.name ?? (id || '(unresolved item)');
        const currentQty = current?.system?.quantity?.value ?? current?.system?.quantity ?? '?';
        const requestedQty = obj['quantity'] ?? currentQty;
        return `${name} (current qty: ${currentQty}, requesting removal of: ${requestedQty})`;
      });
      return confirmRequiredEnvelope(
        'remove-items',
        input.actorUuid,
        `will permanently remove ${items.length} item(s) — ${lines.join('; ') || '(no items resolved)'}.`,
      );
    }

    // BUG-445 (D8): partial-stack removal (1-of-2) keeps the distinct-item COUNT static while
    // quantity drops 2→1 — the old count-based verify false-failed successful removals.
    // Measure total quantity over the removed id/name family instead; when no family can be
    // derived from the entries, fall back to the whole-actor total (removal only subtracts).
    const removedIds = new Set<string>();
    const removedNames = new Set<string>();
    for (const entry of items) {
      if (entry && typeof entry === 'object') {
        const obj = entry as Record<string, unknown>;
        if (obj['_id'] !== undefined) removedIds.add(String(obj['_id']));
        if (obj['id'] !== undefined) removedIds.add(String(obj['id']));
        if (obj['name'] !== undefined) removedNames.add(String(obj['name']));
      }
    }
    const family = (removedIds.size > 0 || removedNames.size > 0)
      ? { ids: removedIds, names: removedNames }
      : undefined;
    const beforeQty = totalQuantity(API, input.actorUuid, family);
    const beforeMoneyBp = actorMoneyBp(API, input.actorUuid);

    const removeResult = await API.removeItems(input.actorUuid, items);
    // BUG-784: classify bare false — GM-disconnect vs. business-condition veto.
    if (removeResult === false) {
      return falseReturnEnvelope('remove-items', input.actorUuid, undefined, input.actorUuid);
    }

    // DP-16 (BUG-445c, D8): post-write verify (settle-polled) — total quantity over the
    // removed family must drop when items were requested.
    const readQty = () => totalQuantity(API, input.actorUuid, family);
    if (items.length > 0) {
      const persisted = await settlePoll(() => readQty() < beforeQty);
      if (!persisted) {
        return notPersisted(ErrorTokens.ITEM_PILES_REMOVE_ITEMS_NOT_PERSISTED, `remove-items from ${input.actorUuid} left the removed item family's total quantity unchanged (before: ${beforeQty}, after: ${readQty()})`);
      }
    }
    const afterItems = API.getActorItems(input.actorUuid, { getItemCurrencies: true }); // BUG-775
    const count = Array.isArray(afterItems) ? afterItems.length : 0;
    // Money-leak closure (Phase 4): mirrors add-items above.
    const moneyDelta = beforeMoneyBp - actorMoneyBp(API, input.actorUuid);
    if (moneyDelta > 0) {
      await recordEconomyTransaction({
        actorId: input.actorUuid,
        amount: moneyDelta,
        type: 'item-ops-money-remove',
        source: 'itempiles',
        description: `Item Piles: money item(s) removed via remove-items (-${moneyDelta} BP)`,
      });
    }
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

    // BUG-461(b): quantity-dimension verify (mirrors trade-items / BUG-445b). Transferred
    // items stack-merge into the target's existing same-name items (distinct COUNT stays flat
    // while quantity grows) AND the target copies get NEW embedded ids — so the only stable
    // join is the item NAME family, resolved from the SOURCE before the transfer. all/combine
    // move the whole source with no pre-known list → fall back to the whole-target total.
    const transferredIds = new Set<string>();
    for (const entry of (input.items ?? [])) {
      if (entry && typeof entry === 'object') {
        const obj = entry as Record<string, unknown>;
        if (obj['_id'] !== undefined) transferredIds.add(String(obj['_id']));
        if (obj['id'] !== undefined) transferredIds.add(String(obj['id']));
      }
    }
    const sourceItemsPre = API.getActorItems(input.sourceUuid, { getItemCurrencies: true }); // BUG-775: money items must be visible for the moneyMayMove detection below
    const transferredNames = new Set<string>(
      (Array.isArray(sourceItemsPre) ? sourceItemsPre : [])
        .filter((it: any) => transferredIds.has(String(it?.id ?? it?._id ?? '')))
        .map((it: any) => String(it?.name ?? '')),
    );
    const targetFamily = transferredNames.size > 0 ? { names: transferredNames } : undefined;
    const beforeTargetQty = totalQuantity(API, input.targetUuid, targetFamily);
    const beforeTargetMoneyBp = actorMoneyBp(API, input.targetUuid);
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

    // BUG-784: classify bare false — GM-disconnect vs. business-condition veto.
    if (result === false) {
      return falseReturnEnvelope(`transfer-items (mode: ${mode})`, `${input.sourceUuid} -> ${input.targetUuid}`, undefined, input.targetUuid);
    }

    // BUG-423 (XPK-01): normalize the raw API resolution into an explicit DTO.
    // transferItems/transferAllItems/combineItemPiles resolve to a BARE ARRAY of
    // transferred-item records — never the rich object the formatter previously assumed.
    const dto = { ok: true, itemsTransferred: Array.isArray(result) ? result : [] };

    // DP-16 (BUG-461b): post-write verify — the transferred family's total quantity on the
    // target must not drop after any transfer mode (a transfer only adds to the target).
    const afterTargetQty = totalQuantity(API, input.targetUuid, targetFamily);
    const targetItems = API.getActorItems(input.targetUuid, { getItemCurrencies: true }); // BUG-775
    const targetCount = Array.isArray(targetItems) ? targetItems.length : 0;
    if (dto.itemsTransferred.length > 0 && afterTargetQty < beforeTargetQty) {
      return notPersisted(ErrorTokens.ITEM_PILES_TRANSFER_ITEMS_NOT_PERSISTED, `transfer-items to ${input.targetUuid} target total quantity dropped (before: ${beforeTargetQty}, after: ${afterTargetQty})`);
    }
    // Money-leak closure (Phase 4): covers all 3 modes (transfer/all/combine) uniformly since the
    // before-snapshot is taken pre-branch. ONE row, mirrors transfer-currency's targetActorId convention.
    // Validate F10: settle-poll before the delta read — a later-tick settle would read delta 0 and
    // silently skip the row (fail-open). Polled ONLY when the moved set can contain money items, so
    // ordinary non-money transfers never pay the poll-to-timeout penalty.
    const preItems = Array.isArray(sourceItemsPre) ? sourceItemsPre : [];
    const moneyMayMove = mode === 'transfer' && transferredIds.size > 0
      ? preItems.some((it: any) => transferredIds.has(String(it?.id ?? it?._id ?? '')) && it?.type === 'money')
      : preItems.some((it: any) => it?.type === 'money' && Number(it?.system?.quantity?.value ?? 0) > 0);
    if (moneyMayMove && dto.itemsTransferred.length > 0) {
      await settlePoll(() => actorMoneyBp(API, input.targetUuid) > beforeTargetMoneyBp, 1000);
    }
    const targetMoneyDelta = actorMoneyBp(API, input.targetUuid) - beforeTargetMoneyBp;
    if (targetMoneyDelta > 0) {
      await recordEconomyTransaction({
        actorId: input.sourceUuid,
        targetActorId: input.targetUuid,
        amount: targetMoneyDelta,
        type: 'item-ops-money-transfer',
        source: 'itempiles',
        description: `Item Piles: money item(s) transferred (mode: ${mode}) — +${targetMoneyDelta} BP to ${input.targetUuid}`,
      });
    }
    notify.updated('item-piles', `Transferred items (mode: ${mode}) from ${input.sourceUuid} to ${input.targetUuid}`, {});
    // BUG-780: an empty/no-op transfer (nothing resolved to move) still reaches this success
    // path — report it as `noop` with a reason rather than an indistinguishable `applied`.
    const transferOutcome = dto.itemsTransferred.length > 0 ? 'applied' : 'noop';
    return {
      success: true,
      data: buildOutcomeResponse(transferOutcome, {
        mode,
        sourceUuid: input.sourceUuid,
        targetUuid: input.targetUuid,
        targetItemCount: targetCount,
        result: dto,
        ...(transferOutcome === 'noop' ? { reason: 'nothing resolved to transfer — result set was empty' } : {}),
      }),
    };
  } catch (e) {
    return { success: false, error: `TRANSFER_ITEMS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── 3A: Currency flow ─────────────────────────────────────────────────────────

// BUG-428 bypass plumbing. item-piles' removeCurrencies/transferCurrencies route through
// getPaymentData → getPriceData, which synthesizes a fake item whose system.price is a bare
// number; item-piles-wfrp4e's ITEM_COST_TRANSFORMER expects {gc,ss,bp} at that path, so the
// cost recomputes to 0 → "free item" branch → empty deltas → silent no-op. remove/transfer are
// rebuilt as: subtract in string space (calculateCurrencies — pure arithmetic, safe), then
// write the result back as an ABSOLUTE per-denomination set.
//
// ⚠ API.updateCurrencies is NOT usable for that write (live-falsified 2026-07-05, validate
// smoke): for item-type currencies _updateCurrencies maps each denomination to
// { item, quantity: 1, cost: <target> } (dist :84079-84081) but Transaction.appendItemChanges
// reads only `quantity` (the hardcoded 1) and is ALWAYS additive for existing items —
// newQuantity = itemQuantity + incomingQuantity even under set:true (dist :41693, :41719) —
// so every mentioned denomination gains +1 instead of being set. No absolute-set primitive
// exists on the public API (setCurrencies is world currency CONFIG, not balances), so the
// absolute set is written directly onto the resolved actor's money items via
// updateEmbeddedDocuments (applyAbsoluteCurrencies below). addCurrencies IS sound (its
// quantity mapping is correct, dist :84114) and stays in use for the transfer add side and
// for creating missing denomination items.

// Float tolerance for primary-unit totals (exchange rates like 1/240 are not exact binary;
// e.g. 20 × 0.05 !== 1 in IEEE 754 — an exact-balance removal must not false-refuse).
const CURRENCY_EPSILON = 1e-6;

/** Total value of parsed currency entries in primary-currency units (quantity × exchangeRate). */
export function currencyTotal(entries: unknown): number {
  return (Array.isArray(entries) ? entries : [])
    .reduce((acc: number, c: any) => acc + (Number(c?.quantity) || 0) * (Number(c?.exchangeRate) || 0), 0);
}

// BUG-769/775: item-piles.js:99325 defaults getActorCurrencies to `{getAll:false}`, which
// silently drops every ZERO-quantity denomination from the result. Every call in this file
// now passes `{getAll:true}` (item-piles.js:34922 shows the module's OWN internal callers use
// getAll:true for exactly this reason) — omitting it meant applyAbsoluteCurrencies() below
// could never CREATE a denomination that was zero before the operation (it only iterates
// `current`, which wouldn't contain that denomination at all), and absoluteSetSettled()'s
// `entries.every()` vacuously passed when the actor's positive-coin list was empty.

/** An actor's balance as entries + primary-unit total + a currency string calculateCurrencies accepts. */
function readBalance(API: any, actorUuid: string): { entries: any[]; total: number; str: string } {
  const entries: any[] = API.getActorCurrencies(actorUuid, { getAll: true }) ?? [];
  const total = currencyTotal(entries);
  let str = '';
  if (entries.length > 0) {
    // Public getStringFromCurrencies validates {cost:number>=0, abbreviation:string}
    // (dist :98938-98951) — getActorCurrencies entries carry {quantity}, so re-map.
    str = API.getStringFromCurrencies(
      entries.map((c: any) => ({ cost: Number(c?.quantity) || 0, abbreviation: c?.abbreviation })),
    );
  }
  return { entries, total, str };
}

/**
 * Expand a calculateCurrencies result into an explicit absolute set covering EVERY registered
 * currency. updateCurrencies only writes denominations mentioned in the string (dist :84079-84083,
 * set:true per mentioned currency) and calculateCurrencies drops zero-cost denominations from its
 * output — so zeroed denominations must be spelled out or they would keep their old quantity.
 */
function absoluteSetString(API: any, newAbsolute: string): string {
  const quantities = new Map<string, number>();
  if (newAbsolute && newAbsolute.trim() !== '') {
    for (const c of (API.getCurrenciesFromString(newAbsolute) ?? []) as any[]) {
      const key = String(c?.abbreviation ?? '');
      quantities.set(key, (quantities.get(key) ?? 0) + (Number(c?.quantity) || 0));
    }
  }
  const all: any[] = API.CURRENCIES ?? [];
  return all
    .map((c) => {
      const abbr = String(c?.abbreviation ?? '');
      const qty = quantities.get(abbr) ?? 0;
      return abbr.includes('{#}') ? abbr.replace('{#}', String(qty)) : `${qty}${abbr}`;
    })
    .join(' ')
    .trim();
}

/** One denomination as a currency string ("3SS" from abbreviation "{#}SS"). */
function denominationString(abbr: string, qty: number): string {
  return abbr.includes('{#}') ? abbr.replace('{#}', String(qty)) : `${qty}${abbr}`;
}

/**
 * Write an absolute per-denomination set DIRECTLY onto the actor's money items (see the
 * plumbing block above for why API.updateCurrencies cannot do this). Existing items get their
 * quantity path set via updateEmbeddedDocuments (synthetic token actors resolve via fromUuid;
 * the write lands on the ActorDelta as usual); denominations with no item and a positive
 * target are created via addCurrencies (its creation path is sound). Attribute-type
 * currencies are out of scope (WFRP4e registers item currencies only) — fail loud if one
 * would need changing. Returns the abbreviation → quantity target map for exact verification.
 */
async function applyAbsoluteCurrencies(API: any, actorUuid: string, setString: string): Promise<Map<string, number>> {
  const targets = new Map<string, number>();
  for (const c of (API.getCurrenciesFromString(setString) ?? []) as any[]) {
    const key = String(c?.abbreviation ?? '');
    targets.set(key, (targets.get(key) ?? 0) + (Number(c?.quantity) || 0));
  }
  const qtyPath = String(API.ITEM_QUANTITY_ATTRIBUTE ?? '');
  if (!qtyPath) throw new Error('ITEM_QUANTITY_ATTRIBUTE unavailable — cannot write an absolute currency set');
  const actor: any = await (globalThis as any).fromUuid(actorUuid);
  if (!actor) throw new Error(`actor ${actorUuid} did not resolve via fromUuid`);

  const current: any[] = API.getActorCurrencies(actorUuid, { getAll: true }) ?? [];
  const updates: Record<string, unknown>[] = [];
  const creations: string[] = [];
  for (const cur of current) {
    const abbr = String(cur?.abbreviation ?? '');
    const target = targets.get(abbr) ?? 0;
    const have = Number(cur?.quantity) || 0;
    if (cur?.type === 'attribute') {
      if (target !== have) throw new Error(`attribute-type currency ${abbr} is not supported by the absolute-set path`);
      continue;
    }
    if (cur?.id) {
      if (target !== have) updates.push({ _id: cur.id, [qtyPath]: target });
    } else if (target > 0) {
      creations.push(denominationString(abbr, target));
    }
  }
  if (updates.length > 0) await actor.updateEmbeddedDocuments('Item', updates);
  for (const c of creations) {
    const r = await API.addCurrencies(actorUuid, c);
    // BUG-784: classify bare false — GM-disconnect vs. business-condition veto.
    if (r === false) throw new Error(falseReturnMessage('add-currency (creating denomination)', actorUuid, `denomination: ${c}`, actorUuid));
  }
  return targets;
}

/**
 * Exact-match settle predicate: every item-type denomination reads back at its target
 * quantity. "Balance changed" is too weak — the 2026-07-05 live smoke proved a WRONG write
 * (upstream +1 drift) also "changes" the balance and would pass a difference check.
 */
function absoluteSetSettled(API: any, actorUuid: string, targets: Map<string, number>): boolean {
  const entries: any[] = API.getActorCurrencies(actorUuid, { getAll: true }) ?? [];
  return entries.every((cur: any) => {
    if (cur?.type === 'attribute') return true;
    const abbr = String(cur?.abbreviation ?? '');
    return (Number(cur?.quantity) || 0) === (targets.get(abbr) ?? 0);
  });
}

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
    const beforeCurrencies = API.getActorCurrencies(input.actorUuid, { getAll: true });
    const addCurrResult = await API.addCurrencies(input.actorUuid, input.currencies);
    // BUG-784: classify bare false — GM-disconnect vs. business-condition veto.
    if (addCurrResult === false) {
      return falseReturnEnvelope('add-currency', input.actorUuid, undefined, input.actorUuid);
    }

    // DP-16: post-write verify (settle-polled) — closure-diff against the pre-call snapshot.
    const beforeJson = JSON.stringify(beforeCurrencies);
    const persisted = await settlePoll(() => JSON.stringify(API.getActorCurrencies(input.actorUuid, { getAll: true })) !== beforeJson);
    if (!persisted) {
      return notPersisted(ErrorTokens.ITEM_PILES_ADD_CURRENCY_NOT_PERSISTED, `add-currency "${input.currencies}" to ${input.actorUuid} left currencies unchanged`);
    }
    const currentCurrencies = API.getActorCurrencies(input.actorUuid, { getAll: true });
    notify.updated('item-piles', `Added currencies "${input.currencies}" to ${input.actorUuid}`, {});
    await recordEconomyTransaction({
      actorId: input.actorUuid,
      amount: currencyTotal(API.getCurrenciesFromString(input.currencies)),
      type: 'currency-add',
      source: 'itempiles',
      description: `Item Piles: added "${input.currencies}"`,
    });
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

  // CCR-4: dangerous — confirm required. Migrated onto the shared requireConfirm() helper
  // (systemic_bug_class_prevention v2 Phase 1/5.1 — R1.3 consolidation); preview content
  // (denomination summary) and refusal trigger conditions are unchanged from the pre-migration
  // hand-rolled envelope.
  if (input.confirm !== true) {
    // BUG-448#7: readable preview — denomination summary ("4GC 2SS 3BP") via the
    // readBalance()/getStringFromCurrencies idiom instead of a serialized document dump.
    let balanceStr = 'unknown';
    try {
      const API = getItemPilesAPI();
      balanceStr = readBalance(API, input.actorUuid).str || '(none)';
    } catch (_) { /* best-effort */ }
    return requireConfirm(
      { confirm: false }, // inside the input.confirm !== true branch — always false here
      'remove-currency',
      `${input.actorUuid} — will permanently deduct "${input.currencies}" (current balance: ${balanceStr})`,
    ) as Envelope<unknown>;
  }

  // BUG-428 bypass: removeCurrencies silently no-ops in WFRP4e (see plumbing block above) —
  // subtract in string space and write the result back as an absolute per-denomination set.
  try {
    const API = getItemPilesAPI();

    let balance: { entries: any[]; total: number; str: string };
    try {
      balance = readBalance(API, input.actorUuid);
    } catch (e) {
      return { success: false, error: `CURRENCY_STRING_MAP_ERROR: could not express ${input.actorUuid}'s balance as a currency string — ${e instanceof Error ? e.message : String(e)}` };
    }
    const removeEntries = API.getCurrenciesFromString(input.currencies) ?? [];
    const removeTotal = currencyTotal(removeEntries);
    if (removeTotal <= 0) {
      return { success: false, error: `INVALID_CURRENCY_STRING: "${input.currencies}" resolves to a non-positive amount — nothing to remove` };
    }
    // Sufficiency pre-check BEFORE any write: calculateCurrencies on a would-go-negative
    // subtraction produces garbage denomination splits (getPriceArray on negative totals,
    // dist :35455-35519) — refuse cleanly instead.
    if (removeTotal > balance.total + CURRENCY_EPSILON) {
      return { success: false, error: `INSUFFICIENT_CURRENCY: not enough currency to remove "${input.currencies}" from ${input.actorUuid} — current balance: ${balance.str || '(none)'}` };
    }

    // Snapshot BEFORE the write — getActorCurrencies returns live references, so serializing
    // balance.entries after the write would alias the post-write state (observed 2026-07-05).
    const previousBalance = JSON.parse(JSON.stringify(balance.entries));

    const newAbsolute: string = API.calculateCurrencies(balance.str, input.currencies, true);
    const setString = absoluteSetString(API, newAbsolute);
    const targets = await applyAbsoluteCurrencies(API, input.actorUuid, setString);

    // DP-16 (exact-match): every denomination must read back at its computed target.
    const persisted = await settlePoll(() => absoluteSetSettled(API, input.actorUuid, targets));
    if (!persisted) {
      return notPersisted(ErrorTokens.ITEM_PILES_REMOVE_CURRENCY_NOT_PERSISTED, `remove-currency "${input.currencies}" from ${input.actorUuid} did not settle at the computed target quantities`);
    }
    const afterCurrencies = API.getActorCurrencies(input.actorUuid, { getAll: true });
    notify.updated('item-piles', `Removed currencies "${input.currencies}" from ${input.actorUuid}`, {});
    await recordEconomyTransaction({
      actorId: input.actorUuid,
      amount: removeTotal,
      type: 'currency-remove',
      source: 'itempiles',
      description: `Item Piles: removed "${input.currencies}"`,
    });
    return { success: true, data: { actorUuid: input.actorUuid, currenciesRemoved: input.currencies, previousBalance, currentCurrencies: afterCurrencies } };
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
    const beforeTargetCurrencies = API.getActorCurrencies(input.targetUuid, { getAll: true });
    let result: unknown;

    if (mode === 'all') {
      result = await API.transferAllCurrencies(input.sourceUuid, input.targetUuid);
    } else {
      if (!input.currencies) {
        return { success: false, error: 'MISSING_CURRENCIES: currencies is required for transfer mode (use mode:"all" to transfer everything)' };
      }
      const currErr = validateCurrencyString(input.currencies);
      if (currErr) return { success: false, error: currErr };

      // BUG-428 bypass: transferCurrencies silently no-ops in WFRP4e (see plumbing block
      // above). Rebuilt as remove-from-source (absolute set) → verify → addCurrencies to
      // target → verify. NON-ATOMIC: no cross-actor Transaction exists on the public API
      // that isn't the broken _transferCurrencies path, and automatic rollback is not
      // attempted — an add-side failure surfaces ITEM_PILES_PARTIAL_TRANSFER instead.
      let sourceBalance: { entries: any[]; total: number; str: string };
      try {
        sourceBalance = readBalance(API, input.sourceUuid);
      } catch (e) {
        return { success: false, error: `CURRENCY_STRING_MAP_ERROR: could not express ${input.sourceUuid}'s balance as a currency string — ${e instanceof Error ? e.message : String(e)}` };
      }
      const transferEntries = API.getCurrenciesFromString(input.currencies) ?? [];
      const transferTotal = currencyTotal(transferEntries);
      if (transferTotal <= 0) {
        return { success: false, error: `INVALID_CURRENCY_STRING: "${input.currencies}" resolves to a non-positive amount — nothing to transfer` };
      }
      if (transferTotal > sourceBalance.total + CURRENCY_EPSILON) {
        return { success: false, error: `INSUFFICIENT_CURRENCY: source ${input.sourceUuid} cannot cover "${input.currencies}" — current balance: ${sourceBalance.str || '(none)'}` };
      }

      // Remove side: subtract in string space, write absolute per-denomination set directly
      // (see plumbing block — API.updateCurrencies is upstream-broken for item currencies).
      const sourceBefore = new Map<string, number>(
        (sourceBalance.entries as any[]).map((c: any) => [String(c?.abbreviation ?? ''), Number(c?.quantity) || 0]),
      );
      const newAbsolute: string = API.calculateCurrencies(sourceBalance.str, input.currencies, true);
      const setString = absoluteSetString(API, newAbsolute);
      const sourceTargets = await applyAbsoluteCurrencies(API, input.sourceUuid, setString);
      // DP-16 (exact-match): source must settle at the computed targets before the target
      // side is touched — a remove-side failure aborts here with nothing moved (safe).
      const removedPersisted = await settlePoll(() => absoluteSetSettled(API, input.sourceUuid, sourceTargets));
      if (!removedPersisted) {
        return notPersisted(ErrorTokens.ITEM_PILES_TRANSFER_CURRENCY_NOT_PERSISTED, `transfer-currency (mode: transfer) source ${input.sourceUuid} did not settle at the computed target quantities — verify balance before retrying`);
      }

      // Add side: addCurrencies is proven immune to the BUG-428 chain.
      try {
        const addResult = await API.addCurrencies(input.targetUuid, input.currencies);
        // BUG-784: classify bare false — GM-disconnect vs. business-condition veto — instead of
        // asserting "no-active-GM" as the cause unconditionally.
        if (addResult === false) {
          const { clause } = falseReturnCause();
          return { success: false, error: `ITEM_PILES_PARTIAL_TRANSFER: removed "${input.currencies}" from ${input.sourceUuid} but the add to ${input.targetUuid} ${clause} — manual reconcile needed (transfer is non-atomic, no automatic rollback)` };
        }
      } catch (e) {
        return { success: false, error: `ITEM_PILES_PARTIAL_TRANSFER: removed "${input.currencies}" from ${input.sourceUuid} but failed to add to ${input.targetUuid} — manual reconcile needed (transfer is non-atomic, no automatic rollback). Cause: ${e instanceof Error ? e.message : String(e)}` };
      }
      // DP-16: add side must land on the target too — a timeout here is still a
      // partial transfer (source already debited), not a plain no-op.
      const beforeTargetJson2 = JSON.stringify(beforeTargetCurrencies);
      const addPersisted = await settlePoll(() => JSON.stringify(API.getActorCurrencies(input.targetUuid, { getAll: true })) !== beforeTargetJson2);
      if (!addPersisted) {
        return { success: false, error: `ITEM_PILES_PARTIAL_TRANSFER: removed "${input.currencies}" from ${input.sourceUuid} but target ${input.targetUuid} currencies never changed — manual reconcile needed (transfer is non-atomic, no automatic rollback)` };
      }

      // Deltas computed from the verified source write (before → target per denomination);
      // the direct-write path has no Transaction resolution to echo.
      const dtoT = {
        ok: true,
        itemDeltas: Array.from(sourceTargets.entries())
          .filter(([abbr, qty]) => (sourceBefore.get(abbr) ?? 0) !== qty)
          .map(([abbr, qty]) => ({ abbreviation: abbr, quantity: qty - (sourceBefore.get(abbr) ?? 0) })),
        attributeDeltas: {},
      };
      const sourceAfter = API.getActorCurrencies(input.sourceUuid, { getAll: true });
      const targetAfter = API.getActorCurrencies(input.targetUuid, { getAll: true });
      notify.updated('item-piles', `Transferred currencies (mode: ${mode}) from ${input.sourceUuid} to ${input.targetUuid}`, {});
      // ONE record covers the whole transfer (source→target), not two — targetActorId carries
      // the destination.
      await recordEconomyTransaction({
        actorId: input.sourceUuid,
        targetActorId: input.targetUuid,
        amount: transferTotal,
        type: 'currency-transfer',
        source: 'itempiles',
        description: `Item Piles: transferred "${input.currencies}"`,
      });
      return {
        success: true,
        data: buildOutcomeResponse('applied', { mode, sourceUuid: input.sourceUuid, targetUuid: input.targetUuid, sourceCurrencies: sourceAfter, targetCurrencies: targetAfter, result: dtoT }),
      };
    }

    // BUG-784: classify bare false — GM-disconnect vs. business-condition veto.
    if (result === false) {
      return falseReturnEnvelope(`transfer-currency (mode: ${mode})`, `${input.sourceUuid} -> ${input.targetUuid}`, undefined, input.targetUuid);
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
      const persisted = await settlePoll(() => JSON.stringify(API.getActorCurrencies(input.targetUuid, { getAll: true })) !== beforeTargetJson);
      if (!persisted) {
        return notPersisted(ErrorTokens.ITEM_PILES_TRANSFER_CURRENCY_NOT_PERSISTED, `transfer-currency (mode: ${mode}) to ${input.targetUuid} reported ok but left target currencies unchanged`);
      }
    }
    const sourceCurrencies = API.getActorCurrencies(input.sourceUuid, { getAll: true });
    const targetCurrencies = API.getActorCurrencies(input.targetUuid, { getAll: true });
    notify.updated('item-piles', `Transferred currencies (mode: ${mode}) from ${input.sourceUuid} to ${input.targetUuid}`, {});
    if (dto.ok) {
      // mode:"all" has no single currency string to re-derive a total from — sum itemDeltas
      // against each denomination's exchangeRate (same formula as currencyTotal, best-effort
      // per memo's "no uniform delta exists" note).
      const rateByAbbr = new Map<string, number>((API.CURRENCIES ?? []).map((c: any) => [String(c?.abbreviation ?? ''), Number(c?.exchangeRate) || 0]));
      const allModeTotal = dto.itemDeltas.reduce((sum: number, d: any) => sum + Math.abs(Number(d?.quantity) || 0) * (rateByAbbr.get(String(d?.abbreviation ?? '')) ?? 0), 0);
      await recordEconomyTransaction({
        actorId: input.sourceUuid,
        targetActorId: input.targetUuid,
        amount: allModeTotal,
        type: 'currency-transfer',
        source: 'itempiles',
        description: `Item Piles: transferred all currencies (mode: ${mode})`,
      });
    }
    // BUG-780: mode:"all" can resolve `dto.ok:false` on a silent no-op (BUG-428 class) and
    // still reach here — report `noop` with a reason instead of an indistinguishable `applied`.
    return {
      success: true,
      data: buildOutcomeResponse(dto.ok ? 'applied' : 'noop', {
        mode,
        sourceUuid: input.sourceUuid,
        targetUuid: input.targetUuid,
        sourceCurrencies,
        targetCurrencies,
        result: dto,
        ...(dto.ok ? {} : { reason: 'nothing moved — module reported empty deltas' }),
      }),
    };
  } catch (e) {
    return { success: false, error: `TRANSFER_CURRENCY_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── 3A: Loot split ────────────────────────────────────────────────────────────

type SplitLootInput = Extract<ModuleItempilesInputType, { action: 'split-loot' }>;

/** Per-stack quantity of one item document — same coercion as verify-quantity.ts's totalQuantity(). */
function splitLootItemQuantity(item: any): number {
  const q = item?.system?.quantity?.value ?? item?.system?.quantity;
  const n = Number(q);
  return q !== undefined && q !== null && Number.isFinite(n) ? n : 1;
}

/** BUG-776: expected TOTAL quantity remaining after split-loot, mirroring item-piles.js's
 *  _splitItemPileContents (:85474-85536) per-stack `Math.floor(qty/numPlayers)*numPlayers` removal
 *  EXACTLY — sum of per-stack remainders is not the remainder of the summed quantity, so this must
 *  be computed stack-by-stack, never as a single aggregate mod. Currency-registered items (`type ===
 *  'money'`, this file's own established detection — see actorMoneyBp above) ALWAYS split
 *  (unconditional in upstream); ordinary items split ONLY when shareItemsEnabled. */
function expectedSplitLootRemaining(items: any[], numPlayers: number, shareItemsEnabled: boolean): number {
  let remaining = 0;
  for (const item of items) {
    const qty = splitLootItemQuantity(item);
    const eligible = item?.type === 'money' || shareItemsEnabled;
    remaining += eligible ? qty % numPlayers : qty;
  }
  return remaining;
}

export async function handleSplitLoot(input: SplitLootInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  // L-5: defensive pre-check before confirm gate
  if (!input.targets || input.targets.length === 0) {
    return { success: false, error: 'MISSING_TARGETS: targets must be a non-empty array of actor/token UUIDs (C8 — omitting targets with no active player chars → silent no-op)' };
  }

  // BUG-776: duplicate target UUIDs were previously accepted as multiple recipients, which both
  // corrupts the floor(qty/numPlayers) split math (numPlayers counted the duplicate) and would
  // create two separate Transaction entries crediting the same actor twice.
  const dedupedTargets = [...new Set(input.targets)];

  // CCR-4: dangerous — confirm required
  if (input.confirm !== true) {
    // BUG-461(a): readable preview — item-count + name-list summary (refresh-merchant's
    // count-only preview at merchant.ts:131 is the precedent) instead of a serialized
    // getActorItems document dump (the multi-KB bloat class BUG-448#7 fixed elsewhere).
    let contentsSummary = 'unknown';
    try {
      const API = getItemPilesAPI();
      const previewItems = API.getActorItems(input.actorUuid);
      const arr = Array.isArray(previewItems) ? previewItems : [];
      const names = arr.map((it: any) => String(it?.name ?? '(unnamed)'));
      contentsSummary = arr.length === 0 ? '(empty)' : `${arr.length} item(s): ${names.join(', ')}`;
    } catch (_) { /* best-effort */ }
    return {
      success: false,
      error: `CONFIRM_REQUIRED: split-loot distributes ordinary items + currency among ${dedupedTargets.length} target(s) from pile ${input.actorUuid}, leaving any indivisible remainder behind (upstream floor(qty/${dedupedTargets.length})*${dedupedTargets.length} split — an uneven stack does NOT empty the pile). Current contents: ${contentsSummary}. Re-send with confirm:true.`,
    };
  }

  try {
    const API = getItemPilesAPI();
    const fromUuidSync = (globalThis as any).fromUuidSync;
    const numPlayers = dedupedTargets.length;

    // C-7: targets/instigator must be Actor/TokenDocument instances (item-piles.js:98305-98312);
    // passing UUID strings throws. Resolve each via fromUuidSync.
    const resolvedTargets = dedupedTargets.map((uuid: string) => {
      const doc = typeof fromUuidSync === 'function' ? fromUuidSync(uuid) : null;
      if (!doc) throw new Error(`ACTOR_NOT_FOUND: cannot resolve target UUID "${uuid}" — ensure the actor/token exists`);
      return doc;
    });

    // Money-leak closure (Phase 4): per-recipient before-snapshot for the delta-based detection below.
    const beforeTargetMoneyBp = new Map<string, number>(dedupedTargets.map((uuid: string) => [uuid, actorMoneyBp(API, uuid)]));

    // BUG-776: item-piles defaults shareItemsEnabled:false on every pile — upstream's own
    // _splitItemPileContents (item-piles.js:85482) skips ORDINARY items entirely when it's not
    // explicitly true, leaving them behind while advertising "split loot". A GM invoking this
    // action clearly intends items to move; auto-enable the flag (persists on the pile going
    // forward, which is the correct/expected state for a pile meant to be looted) rather than
    // silently under-delivering the tool's own advertised behavior.
    const preFlagData: any = API.getActorFlagData(input.actorUuid);
    const shareItemsEnabled = preFlagData?.shareItemsEnabled === true;
    if (!shareItemsEnabled) {
      await API.updateItemPile(input.actorUuid, { shareItemsEnabled: true });
    }

    // BUG-776: currency-inclusive, per-stack snapshot BEFORE the write — the expected-remainder
    // math below needs individual stack quantities (a per-stack floor/mod), not an aggregate total.
    const beforeItems: any[] = API.getActorItems(input.actorUuid, { getItemCurrencies: true }) ?? [];
    const beforeTotal = beforeItems.reduce((acc, it) => acc + splitLootItemQuantity(it), 0);
    const expectedRemaining = expectedSplitLootRemaining(beforeItems, numPlayers, true);

    if (beforeTotal === 0) {
      return { success: true, data: buildOutcomeResponse('noop', { actorUuid: input.actorUuid, targets: dedupedTargets, itemsRemaining: 0, reason: 'pile was already empty — nothing to split' }) };
    }

    const options: Record<string, unknown> = {
      targets: resolvedTargets,
    };
    if (input.instigator) {
      const instigatorDoc = typeof fromUuidSync === 'function' ? fromUuidSync(input.instigator) : null;
      if (!instigatorDoc) throw new Error(`ACTOR_NOT_FOUND: cannot resolve instigator UUID "${input.instigator}"`);
      options['instigator'] = instigatorDoc;
    }

    const splitResult = await API.splitItemPileContents(input.actorUuid, options);
    // BUG-784: classify bare false — GM-disconnect vs. business-condition veto.
    if (splitResult === false) {
      return falseReturnEnvelope('split-loot', input.actorUuid, `target(s): ${dedupedTargets.join(', ')}`, input.actorUuid);
    }

    // BUG-776 (DP-16): post-write verify against the EXPECTED remainder (currency-inclusive TOTAL
    // quantity), not a bare stack-count-equals-zero check — upstream intentionally leaves an
    // indivisible per-stack remainder (floor(qty/numPlayers)*numPlayers removed), so "pile not
    // empty" is the CORRECT end state whenever any stack's quantity isn't a multiple of numPlayers.
    const readRemainingTotal = () => {
      const cur = API.getActorItems(input.actorUuid, { getItemCurrencies: true });
      return (Array.isArray(cur) ? cur : []).reduce((acc: number, it: any) => acc + splitLootItemQuantity(it), 0);
    };
    const persisted = await settlePoll(() => readRemainingTotal() === expectedRemaining);
    const remaining = readRemainingTotal();
    if (!persisted && remaining !== expectedRemaining) {
      return notPersisted(ErrorTokens.ITEM_PILES_SPLIT_LOOT_NOT_PERSISTED, `split-loot on ${input.actorUuid} left ${remaining} total quantity in the pile — expected ${expectedRemaining} (the indivisible remainder for ${numPlayers} target(s))`);
    }
    // Money-leak closure (Phase 4): ONE ledger row PER RECIPIENT (design decision — per-recipient rows
    // preserve who-got-what auditability), fail-open, post-write only.
    for (const uuid of dedupedTargets) {
      const before = beforeTargetMoneyBp.get(uuid) ?? 0;
      const delta = actorMoneyBp(API, uuid) - before;
      if (delta > 0) {
        await recordEconomyTransaction({
          actorId: uuid,
          amount: delta,
          type: 'item-ops-money-split-loot',
          source: 'itempiles',
          description: `Item Piles: received ${delta} BP in money items via split-loot from ${input.actorUuid}`,
        });
      }
    }
    notify.updated('item-piles', `Split loot from ${input.actorUuid} among ${dedupedTargets.length} actors`, {});
    // BUG-776: by this point `remaining === expectedRemaining` is already GUARANTEED (the verify
    // above returns NOT_PERSISTED otherwise) — a nonzero remainder that matches the expected
    // indivisible leftover is a full success, not partial. There is no distinguishable partial
    // state from this single aggregate verification; a true mid-operation failure surfaces as
    // NOT_PERSISTED above instead.
    return { success: true, data: buildOutcomeResponse('applied', { actorUuid: input.actorUuid, targets: dedupedTargets, itemsRemaining: remaining, expectedRemaining }) };
  } catch (e) {
    return { success: false, error: `SPLIT_LOOT_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}
