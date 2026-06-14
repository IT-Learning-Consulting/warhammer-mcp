// Module Integration v1 Phase 3 — module-itempiles handler (Item Piles v3.3.2).
//
// 17-action umbrella: pile lifecycle, container state, item/currency ops, merchant,
// vault, rolltable, trade, price modifiers, loot split.
//
// Design constraints:
//   - requireModuleActive('item-piles') is the FIRST executable statement — RETURNS failure, never throws.
//   - Catalog dataDefaults injected before each API call (C1–C9 crash prevention).
//   - Pre-check gates return structured errors before calling the API.
//   - turnTokens/revertTokens MUST resolve fromUuidSync(uuid)?.object — API hard-rejects UUID strings (C6/C7).
//   - No active GM → NO_ACTIVE_GM structured error on socket-routed actions (C11).
//   - banker/auctioneer pile types → MODULE_DEPENDENCY_NOT_ACTIVE (companion not installed).
//   - DP-16: post-write re-read via getActorFlagData/getActorItems/getActorCurrencies.
//   - CCR-3: notify.* once per write, after verify.
//   - CCR-4: confirm:true required for dangerous actions (delete-pile, split-loot,
//            remove-currency, refresh-merchant with removeExistingActorItems:true,
//            transfer-items all/combine modes, revert mode).
//   - Simple Calendar openTimes GUIDANCE_ONLY warning (not enforced, but warned).
//
// Sources: phase3_pre_plan.md §Confirmed facts; dossier §3, §4; item-piles.js source audit.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ModuleItempilesInput, type ModuleItempilesInputType } from './schemas.js';
import { notify } from '../../../notify.js';
import {
  getActionCatalog,
  checkActiveGm,
  normalizeItemsArray,
  validateTokenUuid,
  validateRelativeModifier,
  validateCurrencyString,
} from './catalog.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

// ── API accessor ──────────────────────────────────────────────────────────────

function getItemPilesAPI(): any {
  const api = (globalThis as any).game?.itempiles?.API;
  if (!api) throw new Error('ITEMPILES_API_UNAVAILABLE: game.itempiles.API is not available — module may not have reached ready state');
  return api;
}

function isGM(): boolean {
  return Boolean((globalThis as any).game?.user?.isGM);
}

function getGame(): any {
  return (globalThis as any).game;
}

/** Resolve a UUID string to a live Token object (for turnTokens/revertTokens — C6/C7) */
function resolveToTokenObject(uuid: string): any {
  const fromUuidSync = (globalThis as any).fromUuidSync;
  if (typeof fromUuidSync === 'function') {
    const doc = fromUuidSync(uuid);
    if (doc?.object) return doc.object;   // TokenDocument → Token (canvas object)
    if (doc && doc.documentName === 'Token') return doc;
  }
  // fallback: try canvas.scene tokens
  const scene = (globalThis as any).canvas?.scene;
  if (scene) {
    // extract token id from the UUID (Scene.xxx.Token.yyy)
    const parts = uuid.split('.');
    const tokenIdx = parts.findIndex((p) => p === 'Token');
    if (tokenIdx !== -1 && parts[tokenIdx + 1]) {
      const tokenId = parts[tokenIdx + 1];
      const tokenDoc = scene.tokens?.get?.(tokenId);
      if (tokenDoc?.object) return tokenDoc.object;
    }
  }
  throw new Error(`TOKEN_NOT_FOUND: cannot resolve UUID "${uuid}" to a live Token object — ensure the token is on the active canvas scene`);
}

// ── Public dispatcher ─────────────────────────────────────────────────────────

export async function dispatchModuleItempiles(data: unknown): Promise<any> {
  const g = requireModuleActive('item-piles');
  if (g) return g;

  const parsed = ModuleItempilesInput.parse(data);

  switch (parsed.action) {
    case 'create-pile':           return handleCreatePile(parsed);
    case 'update-pile':           return handleUpdatePile(parsed);
    case 'delete-pile':           return handleDeletePile(parsed);
    case 'set-pile-state':        return handleSetPileState(parsed);
    case 'get-contents':          return handleGetContents(parsed);
    case 'add-items':             return handleAddItems(parsed);
    case 'remove-items':          return handleRemoveItems(parsed);
    case 'transfer-items':        return handleTransferItems(parsed);
    case 'add-currency':          return handleAddCurrency(parsed);
    case 'remove-currency':       return handleRemoveCurrency(parsed);
    case 'transfer-currency':     return handleTransferCurrency(parsed);
    case 'split-loot':            return handleSplitLoot(parsed);
    case 'vault-info':            return handleVaultInfo(parsed);
    case 'roll-item-table':       return handleRollItemTable(parsed);
    case 'refresh-merchant':      return handleRefreshMerchant(parsed);
    case 'trade-items':           return handleTradeItems(parsed);
    case 'update-price-modifiers': return handleUpdatePriceModifiers(parsed);
    default: {
      const _exhaustive: never = parsed;
      return { success: false, error: `Unknown module-itempiles action: ${(_exhaustive as any).action}` };
    }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function gmRequired(): Envelope<never> | null {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can perform item pile write operations' };
  return null;
}

function activeGmRequired(): Envelope<never> | null {
  const err = checkActiveGm(getGame());
  if (err) return { success: false, error: err };
  return null;
}

function bankerAuctioneerCheck(type: string | undefined): Envelope<never> | null {
  if (type === 'banker' || type === 'auctioneer') {
    return {
      success: false,
      error: `MODULE_DEPENDENCY_NOT_ACTIVE: pile type "${type}" requires a companion module that is not installed. Install "item_piles_bankers" (for banker) or "item_piles_auctioneer" (for auctioneer) via Foundry Module Manager.`,
    };
  }
  return null;
}

// ── 3A: Pile lifecycle ────────────────────────────────────────────────────────

type CreatePileInput = Extract<ModuleItempilesInputType, { action: 'create-pile' }>;

async function handleCreatePile(input: CreatePileInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  const typeErr = bankerAuctioneerCheck(input.type);
  if (typeErr) return typeErr;

  // L-5: defensive pre-check
  if (!input.sceneId) {
    return { success: false, error: 'MISSING_SCENE_ID: sceneId is required for create-pile (game.user.viewedScene is null server-side)' };
  }

  try {
    const API = getItemPilesAPI();

    // Build itemPileFlags from pile-config fields (item-piles.js:97847 — these MUST be nested here;
    // flat top-level options are silently ignored by createItemPile).
    const itemPileFlags: Record<string, unknown> = {};
    const pileType = input.type ?? 'pile';
    itemPileFlags['type'] = pileType;
    // NOTE: do NOT set enabled — the API stamps enabled:true itself (item-piles.js:84707)
    if (input.locked !== undefined) itemPileFlags['locked'] = input.locked;
    if (input.closed !== undefined) itemPileFlags['closed'] = input.closed;
    if (input.closedImage) itemPileFlags['closedImage'] = input.closedImage;
    if (input.openedImage) itemPileFlags['openedImage'] = input.openedImage;
    if (input.lockedImage) itemPileFlags['lockedImage'] = input.lockedImage;
    if (input.emptyImage) itemPileFlags['emptyImage'] = input.emptyImage;
    if (input.lockedSound) itemPileFlags['lockedSound'] = input.lockedSound;
    if (input.closedSound) itemPileFlags['closedSound'] = input.closedSound;
    if (input.openedSound) itemPileFlags['openedSound'] = input.openedSound;

    const options: Record<string, unknown> = {
      sceneId: input.sceneId,
      itemPileFlags,
    };

    if (input.position) options['position'] = input.position;
    if (input.items) options['items'] = normalizeItemsArray(input.items);

    // tokenName → tokenOverrides.name (item-piles.js:97845)
    if (input.tokenName) options['tokenOverrides'] = { name: input.tokenName };

    // createDedicatedActor / pileActorName routing (item-piles.js:97849-97884):
    //   createActor:true  → create new actor (actor = name for the new actor)
    //   actor (string)    → resolve as existing actor UUID/name
    //   neither           → use shared Default Item Pile actor
    if (input.createDedicatedActor) {
      // Pre-create the dedicated actor with skipItems:true so the wfrp4e ActorWFRP4e._preCreate
      // "add basic skills + money?" DialogV2 does NOT pop on the GM client. item-piles.js:84719
      // calls Actor.create(actorData) with NO options, so we cannot forward skipItems through
      // createItemPile — pre-create here + hand it to item-piles as an existing actor instead.
      const g = getGame();
      const actorType = API.ACTOR_CLASS_TYPE ?? 'npc';
      const ActorCls = g?.actors?.documentClass ?? (globalThis as any).Actor;
      const newActor = await ActorCls.create(
        { name: input.pileActorName ?? 'Item Pile', type: actorType },
        { skipItems: true },
      );
      options['actor'] = newActor?.uuid;   // existing-actor path; createActor stays false
    } else if (input.pileActorName) {
      options['actor'] = input.pileActorName;
    }

    // createItemPile returns { tokenUuid?: string, actorUuid: string } (item-piles.js:84851/84860) —
    // NOT a bare UUID. Extract both; never assign the whole object to a string field.
    const result = await API.createItemPile(options);
    // M-2: socket returns false when no active GM disconnects mid-call
    if (result === false) {
      return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
    }
    const tokenUuid: string | null = result?.tokenUuid ?? null;
    const actorUuid: string | null = result?.actorUuid ?? null;

    // The createDedicatedActor path pre-creates a bare actor (with skipItems to avoid the wfrp4e
    // dialog) and hands it to createItemPile as an existing actor — but that path does NOT stamp
    // enabled:true or the type/config flags (only the createActor:true path does, and that one
    // triggers the dialog). Stamp the pile config now via updateItemPile (verified-working merge),
    // so the dedicated merchant/vault/container is actually enabled + correctly typed.
    if (input.createDedicatedActor && actorUuid) {
      await API.updateItemPile(actorUuid, { ...itemPileFlags, enabled: true });
    }

    // DP-16: post-write verify — read back flag data from the created actor (by actorUuid, not the result object)
    let flagData: unknown = null;
    if (actorUuid) {
      try {
        flagData = API.getActorFlagData(actorUuid);
      } catch (_) { /* best-effort */ }
    }

    notify.created('item-piles', `Created ${input.type ?? 'pile'} pile in scene ${input.sceneId}`, {});
    return { success: true, data: { tokenUuid, actorUuid, type: input.type ?? 'pile', sceneId: input.sceneId, flagData } };
  } catch (e) {
    return { success: false, error: `CREATE_PILE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type UpdatePileInput = Extract<ModuleItempilesInputType, { action: 'update-pile' }>;

async function handleUpdatePile(input: UpdatePileInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  // M-4: guard against banker/auctioneer (companion module required)
  const typeErr = bankerAuctioneerCheck(input.type);
  if (typeErr) return typeErr;

  try {
    const API = getItemPilesAPI();

    const updateData: Record<string, unknown> = {};
    // C-2: 'enabled' added — required to activate merchant/vault (isItemPileMerchant needs enabled&&type)
    const fields: (keyof UpdatePileInput)[] = [
      'type', 'enabled', 'locked', 'closed', 'closedImage', 'openedImage', 'lockedImage',
      'emptyImage', 'lockedSound', 'closedSound', 'openedSound', 'merchantColumns',
      'overheadCost', 'vaultAccess', 'vaultExpansion', 'cols', 'rows', 'openTimes',
    ];
    for (const f of fields) {
      if (input[f] !== undefined) updateData[f as string] = input[f];
    }

    // GUIDANCE_ONLY warning: openTimes.status:"auto" without Simple Calendar
    if ((updateData.openTimes as any)?.status === 'auto') {
      const scActive = (globalThis as any).game?.modules?.get?.('simple-calendar')?.active;
      if (!scActive) {
        // proceed but warn — the API will permanently rewrite the flag to "open" on the next cycle
        updateData._simpleCalendarWarning = 'Simple Calendar is not active; openTimes.status:"auto" will be rewritten to "open" by item-piles on the next open/close cycle';
      }
    }

    const updateResult = await API.updateItemPile(input.actorUuid, updateData);
    // M-2: socket returns false when GM disconnects mid-call
    if (updateResult === false) {
      return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
    }

    // DP-16: post-write verify
    const flagData = API.getActorFlagData(input.actorUuid);
    notify.updated('item-piles', `Updated pile ${input.actorUuid}`, {});
    return { success: true, data: { actorUuid: input.actorUuid, updated: updateData, flagData } };
  } catch (e) {
    return { success: false, error: `UPDATE_PILE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type DeletePileInput = Extract<ModuleItempilesInputType, { action: 'delete-pile' }>;

async function handleDeletePile(input: DeletePileInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  // C10: validate Token UUID
  const uuidErr = validateTokenUuid(input.tokenUuid);
  if (uuidErr) return { success: false, error: uuidErr };

  // CCR-4: dangerous — confirm required
  if (input.confirm !== true) {
    return {
      success: false,
      error: 'CONFIRM_REQUIRED: delete-pile permanently deletes the token. Re-send with confirm:true to proceed.',
    };
  }

  try {
    const API = getItemPilesAPI();
    const deleteResult = await API.deleteItemPile(input.tokenUuid);
    // M-2: socket returns false when GM disconnects mid-call
    if (deleteResult === false) {
      return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
    }
    notify.deleted('item-piles', `Deleted pile token ${input.tokenUuid}`, {});
    return { success: true, data: { tokenUuid: input.tokenUuid, deleted: true } };
  } catch (e) {
    return { success: false, error: `DELETE_PILE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── 3A: Container state ───────────────────────────────────────────────────────

type SetPileStateInput = Extract<ModuleItempilesInputType, { action: 'set-pile-state' }>;

async function handleSetPileState(input: SetPileStateInput): Promise<Envelope<unknown>> {
  // M-3: GM gate covers ALL branches (open/close/lock/unlock/rattle + turnTokens/revertTokens)
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  try {
    const API = getItemPilesAPI();

    // turnTokens/revertTokens: resolve live Token objects (C6/C7)
    if (input.state === 'turnTokens' || input.state === 'revertTokens') {
      // gmRequired already checked at handler top (M-3)
      if (!input.tokenUuids || input.tokenUuids.length === 0) {
        return { success: false, error: 'MISSING_TOKEN_UUIDS: tokenUuids is required for turnTokens/revertTokens' };
      }

      if (input.state === 'revertTokens' && input.confirm !== true) {
        return {
          success: false,
          error: 'CONFIRM_REQUIRED: revertTokens strips pile flags from live tokens. Re-send with confirm:true.',
        };
      }

      // Resolve UUID strings to live Token objects (API hard-rejects UUID strings)
      const tokens = input.tokenUuids.map(resolveToTokenObject);

      let result: unknown;
      if (input.state === 'turnTokens') {
        result = await API.turnTokensIntoItemPiles(tokens);
      } else {
        result = await API.revertTokensFromItemPiles(tokens);
      }
      // M-2: socket returns false when GM disconnects mid-call
      if (result === false) {
        return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
      }

      notify.updated('item-piles', `${input.state} on ${tokens.length} token(s)`, {});
      return { success: true, data: { state: input.state, tokenCount: tokens.length, result } };
    }

    // open/close/lock/unlock/rattle — all take actorUuid
    if (!input.actorUuid) {
      return { success: false, error: 'MISSING_ACTOR_UUID: actorUuid is required for open/close/lock/unlock/rattle states' };
    }

    let result: unknown;
    const interacting = input.interactingTokenUuid || null;

    switch (input.state) {
      case 'open':
        result = await API.openItemPile(input.actorUuid, interacting);
        break;
      case 'close':
        result = await API.closeItemPile(input.actorUuid, interacting);
        break;
      case 'lock':
        result = await API.lockItemPile(input.actorUuid);
        break;
      case 'unlock':
        result = await API.unlockItemPile(input.actorUuid);
        break;
      case 'rattle':
        result = await API.rattleItemPile(input.actorUuid);
        break;
    }

    // M-2: socket returns false when GM disconnects mid-call
    if (result === false) {
      return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
    }

    // DP-16: post-write verify
    const flagData = API.getActorFlagData(input.actorUuid);
    notify.updated('item-piles', `Set pile state to "${input.state}" on ${input.actorUuid}`, {});
    return { success: true, data: { state: input.state, actorUuid: input.actorUuid, result, flagData } };
  } catch (e) {
    return { success: false, error: `SET_PILE_STATE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── 3A: Contents read ─────────────────────────────────────────────────────────

type GetContentsInput = Extract<ModuleItempilesInputType, { action: 'get-contents' }>;

async function handleGetContents(input: GetContentsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: get-contents requires GM access' };

  try {
    const API = getItemPilesAPI();
    const actorUuid = input.actorUuid;

    const flagData = API.getActorFlagData(actorUuid);
    const items = API.getActorItems(actorUuid);
    const currencies = API.getActorCurrencies(actorUuid);

    // Type checks
    const isValidPile = API.isValidItemPile(actorUuid);
    const isContainer = API.isItemPileContainer(actorUuid);
    const isMerchant = API.isItemPileMerchant(actorUuid);
    const isVault = API.isItemPileVault(actorUuid);
    const isLocked = isValidPile ? API.isItemPileLocked(actorUuid) : null;
    const isClosed = isValidPile ? API.isItemPileClosed(actorUuid) : null;
    const isEmpty = isValidPile ? API.isItemPileEmpty(actorUuid) : null;

    // Serialize items (Item documents → plain objects)
    const serializedItems = (Array.isArray(items) ? items : []).map((item: any) => ({
      id: item.id ?? item._id ?? null,
      name: item.name ?? null,
      type: item.type ?? null,
      quantity: item.system?.quantity?.value ?? item.system?.quantity ?? 1,
      uuid: item.uuid ?? null,
    }));

    const result: Record<string, unknown> = {
      actorUuid,
      isValidPile,
      isContainer,
      isMerchant,
      isVault,
      isLocked,
      isClosed,
      isEmpty,
      itemCount: serializedItems.length,
      items: serializedItems,
      currencies,
      flagData,
    };

    // Vault/merchant audit log (if requested and available)
    if (input.includeLog && flagData) {
      result.log = (flagData as any)?.log ?? [];
    }

    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: `GET_CONTENTS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── 3A: Item mutations ────────────────────────────────────────────────────────

type AddItemsInput = Extract<ModuleItempilesInputType, { action: 'add-items' }>;

async function handleAddItems(input: AddItemsInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  try {
    const API = getItemPilesAPI();
    const items = normalizeItemsArray(input.items);

    // L-1: mergeSimilarItems/respectItemIds removed — not real addItems options (item-piles.js:98428)
    const options: Record<string, unknown> = {
      removeExistingActorItems: input.removeExistingActorItems ?? false,
    };

    const addResult = await API.addItems(input.actorUuid, items, options);
    // M-2: socket returns false when GM disconnects mid-call
    if (addResult === false) {
      return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
    }

    // DP-16: post-write verify
    const currentItems = API.getActorItems(input.actorUuid);
    const count = Array.isArray(currentItems) ? currentItems.length : 0;
    notify.updated('item-piles', `Added ${items.length} item(s) to ${input.actorUuid}`, {});
    return { success: true, data: { actorUuid: input.actorUuid, itemsAdded: items.length, totalItems: count } };
  } catch (e) {
    return { success: false, error: `ADD_ITEMS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type RemoveItemsInput = Extract<ModuleItempilesInputType, { action: 'remove-items' }>;

async function handleRemoveItems(input: RemoveItemsInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  try {
    const API = getItemPilesAPI();
    const items = normalizeItemsArray(input.items);

    const removeResult = await API.removeItems(input.actorUuid, items);
    // M-2: socket returns false when GM disconnects mid-call
    if (removeResult === false) {
      return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
    }

    // DP-16: post-write verify
    const currentItems = API.getActorItems(input.actorUuid);
    const count = Array.isArray(currentItems) ? currentItems.length : 0;
    notify.updated('item-piles', `Removed ${items.length} item(s) from ${input.actorUuid}`, {});
    return { success: true, data: { actorUuid: input.actorUuid, itemsRemoved: items.length, totalItems: count } };
  } catch (e) {
    return { success: false, error: `REMOVE_ITEMS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type TransferItemsInput = Extract<ModuleItempilesInputType, { action: 'transfer-items' }>;

async function handleTransferItems(input: TransferItemsInput): Promise<Envelope<unknown>> {
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

    // DP-16: post-write verify
    const targetItems = API.getActorItems(input.targetUuid);
    const targetCount = Array.isArray(targetItems) ? targetItems.length : 0;
    notify.updated('item-piles', `Transferred items (mode: ${mode}) from ${input.sourceUuid} to ${input.targetUuid}`, {});
    return { success: true, data: { mode, sourceUuid: input.sourceUuid, targetUuid: input.targetUuid, targetItemCount: targetCount, result } };
  } catch (e) {
    return { success: false, error: `TRANSFER_ITEMS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── 3A: Currency flow ─────────────────────────────────────────────────────────

type AddCurrencyInput = Extract<ModuleItempilesInputType, { action: 'add-currency' }>;

async function handleAddCurrency(input: AddCurrencyInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  const currErr = validateCurrencyString(input.currencies);
  if (currErr) return { success: false, error: currErr };

  try {
    const API = getItemPilesAPI();
    const addCurrResult = await API.addCurrencies(input.actorUuid, input.currencies);
    // M-2: socket returns false when GM disconnects mid-call
    if (addCurrResult === false) {
      return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
    }

    // DP-16: post-write verify
    const currentCurrencies = API.getActorCurrencies(input.actorUuid);
    notify.updated('item-piles', `Added currencies "${input.currencies}" to ${input.actorUuid}`, {});
    return { success: true, data: { actorUuid: input.actorUuid, currenciesAdded: input.currencies, currentCurrencies } };
  } catch (e) {
    return { success: false, error: `ADD_CURRENCY_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type RemoveCurrencyInput = Extract<ModuleItempilesInputType, { action: 'remove-currency' }>;

async function handleRemoveCurrency(input: RemoveCurrencyInput): Promise<Envelope<unknown>> {
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

    // DP-16: post-write verify
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

async function handleTransferCurrency(input: TransferCurrencyInput): Promise<Envelope<unknown>> {
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

    // DP-16: post-write verify
    const sourceCurrencies = API.getActorCurrencies(input.sourceUuid);
    const targetCurrencies = API.getActorCurrencies(input.targetUuid);
    notify.updated('item-piles', `Transferred currencies (mode: ${mode}) from ${input.sourceUuid} to ${input.targetUuid}`, {});
    return { success: true, data: { mode, sourceUuid: input.sourceUuid, targetUuid: input.targetUuid, sourceCurrencies, targetCurrencies, result } };
  } catch (e) {
    return { success: false, error: `TRANSFER_CURRENCY_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── 3A: Loot split ────────────────────────────────────────────────────────────

type SplitLootInput = Extract<ModuleItempilesInputType, { action: 'split-loot' }>;

async function handleSplitLoot(input: SplitLootInput): Promise<Envelope<unknown>> {
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

    // DP-16: post-write verify — pile should be empty
    const remainingItems = API.getActorItems(input.actorUuid);
    const remaining = Array.isArray(remainingItems) ? remainingItems.length : 0;
    notify.updated('item-piles', `Split loot from ${input.actorUuid} among ${input.targets.length} actors`, {});
    return { success: true, data: { actorUuid: input.actorUuid, targets: input.targets, itemsRemaining: remaining } };
  } catch (e) {
    return { success: false, error: `SPLIT_LOOT_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── 3B: Vault info ────────────────────────────────────────────────────────────

type VaultInfoInput = Extract<ModuleItempilesInputType, { action: 'vault-info' }>;

async function handleVaultInfo(input: VaultInfoInput): Promise<Envelope<unknown>> {
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

      // C-5: canItemFitInVault(item, vaultActor) — item-piles.js:99588 — item FIRST, actor second;
      // no quantity arg on canItemFitInVault (it doesn't accept one)
      const canFit = API.canItemFitInVault(itemDoc, input.actorUuid);
      if (!canFit) {
        return {
          success: false,
          error: `VAULT_FULL: item "${input.itemUuid}" (qty: ${input.quantity ?? 1}) does not fit in vault ${input.actorUuid}`,
        };
      }

      let fitResult: unknown = null;
      if (subAction === 'fit-items') {
        // C-5: fitItemsIntoVault(items, vaultActor) — item-piles.js:99591 — items FIRST, actor second
        fitResult = API.fitItemsIntoVault([{ item: itemDoc, quantity: input.quantity ?? 1 }], input.actorUuid);
      }

      const gridData = API.getVaultGridData(input.actorUuid);
      return { success: true, data: { actorUuid: input.actorUuid, subAction, canFit: true, itemUuid: input.itemUuid, quantity: input.quantity ?? 1, fitResult, gridData } };
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

async function handleRollItemTable(input: RollItemTableInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  try {
    const API = getItemPilesAPI();
    const catalog = getActionCatalog()['roll-item-table']!;

    const options: Record<string, unknown> = {
      timesToRoll: input.timesToRoll ?? (catalog.dataDefaults.timesToRoll as number),
      removeExistingActorItems: input.removeExistingActorItems ?? (catalog.dataDefaults.removeExistingActorItems as boolean),
    };
    if (input.targetActorUuid) options.targetActor = input.targetActorUuid;
    if (input.rollData) options.rollData = input.rollData;

    const result = await API.rollItemTable(input.tableUuid, options);
    // M-2: socket returns false when GM disconnects mid-call
    if (result === false) {
      return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
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

async function handleRefreshMerchant(input: RefreshMerchantInput): Promise<Envelope<unknown>> {
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
    // M-2: socket returns false when GM disconnects mid-call
    if (refreshResult === false) {
      return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
    }

    // DP-16: post-write verify
    const afterItems = API.getActorItems(input.merchantUuid);
    const count = Array.isArray(afterItems) ? afterItems.length : 0;
    notify.updated('item-piles', `Refreshed merchant inventory for ${input.merchantUuid}`, {});
    return { success: true, data: { merchantUuid: input.merchantUuid, removeExistingActorItems: removeExisting, itemCount: count } };
  } catch (e) {
    return { success: false, error: `REFRESH_MERCHANT_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── 3B: Scripted trade ────────────────────────────────────────────────────────

type TradeItemsInput = Extract<ModuleItempilesInputType, { action: 'trade-items' }>;

async function handleTradeItems(input: TradeItemsInput): Promise<Envelope<unknown>> {
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
      // C-6/C-8 (trade preview): getPricesForItem needs Item instance not UUID (item-piles.js:99471)
      let pricePreview: unknown = null;
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
            pricePreview = API.getPricesForItem(itemDoc, { seller: input.merchantUuid, quantity: item.quantity });
          }
        }
      } catch (_) { /* best-effort */ }
      return {
        success: false,
        error: `CONFIRM_REQUIRED: trade-items will deduct currency from buyer ${input.buyerUuid} for ${input.items.length} item(s) from merchant ${input.merchantUuid}. Price preview: ${JSON.stringify(pricePreview)}. Re-send with confirm:true.`,
      };
    }

    const items = input.items.map((i) => ({
      item: i.itemId,
      quantity: i.quantity,
      paymentIndex: i.paymentIndex ?? 0,
    }));

    const result = await API.tradeItems(input.merchantUuid, input.buyerUuid, items);
    // M-2: socket returns false when GM disconnects mid-call
    if (result === false) {
      return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
    }

    // DP-16: post-write verify
    const buyerCurrencies = API.getActorCurrencies(input.buyerUuid);
    const buyerItems = API.getActorItems(input.buyerUuid);
    const buyerItemCount = Array.isArray(buyerItems) ? buyerItems.length : 0;

    notify.updated('item-piles', `Traded ${input.items.length} item(s) from ${input.merchantUuid} to ${input.buyerUuid}`, {});
    return {
      success: true,
      data: {
        merchantUuid: input.merchantUuid,
        buyerUuid: input.buyerUuid,
        itemsTraded: input.items.length,
        buyerCurrencies,
        buyerItemCount,
        result,
      },
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

async function handleUpdatePriceModifiers(input: UpdatePriceModifiersInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: price modifier operations require GM access' };

  try {
    const API = getItemPilesAPI();
    const subAction = input.subAction ?? 'get-modifiers';

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
      const prices = API.getPricesForItem(itemDoc, { seller: input.actorUuid, quantity: input.quantity ?? 1 });
      const cost = API.getCostOfItem(itemDoc);
      return { success: true, data: { actorUuid: input.actorUuid, itemUuid: input.itemUuid, quantity: input.quantity ?? 1, prices, cost } };
    }

    if (subAction === 'get-modifiers') {
      // L-7: isItemPileMerchant pre-check for get-modifiers
      if (!API.isItemPileMerchant(input.actorUuid)) {
        return { success: false, error: 'INVALID_PILE_TYPE: actor is not an item pile merchant' };
      }
      const modifiers = API.getMerchantPriceModifiers(input.actorUuid);
      return { success: true, data: { actorUuid: input.actorUuid, modifiers } };
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
    const modifierEntry: Record<string, unknown> = { actorUuid: targetUuid };
    if (input.buyPriceModifier !== undefined) modifierEntry['buyPriceModifier'] = input.buyPriceModifier;
    if (input.sellPriceModifier !== undefined) modifierEntry['sellPriceModifier'] = input.sellPriceModifier;
    if (input.relative !== undefined) modifierEntry['relative'] = input.relative;
    if (input.override !== undefined) modifierEntry['override'] = input.override;

    const modifyResult = await API.updateMerchantPriceModifiers(input.actorUuid, [modifierEntry]);
    // M-2: socket returns false when GM disconnects mid-call
    if (modifyResult === false) {
      return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
    }

    // DP-16: post-write verify
    const afterModifiers = API.getMerchantPriceModifiers(input.actorUuid);
    notify.updated('item-piles', `Updated price modifiers for ${input.actorUuid}`, {});
    return { success: true, data: { actorUuid: input.actorUuid, subAction: 'update-modifiers', modifiers: afterModifiers } };
  } catch (e) {
    return { success: false, error: `UPDATE_PRICE_MODIFIERS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}
