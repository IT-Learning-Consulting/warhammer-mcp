// DIALOG-PATH: DIALOG_INVESTIGATED — in-file comment confirms the wfrp4e basic-skills-dialog does NOT pop on the GM client for the create-pile actor path (item-piles.js:84719); no other Dialog/DialogV2 call is reachable from this file's write paths.
// Module Integration v1 Phase 3 — module-itempiles: pile lifecycle + container state + contents read.
// mcp_code_quality_v2 Phase C3 (19a split): extracted verbatim from item-piles.ts — zero
// behavioral change (behavior freeze HC3/HC13).

import { ErrorTokens, type ModuleItempilesInputType } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { Envelope, getGame, isGM } from '../_shared/handler-utils.js';
import { normalizeItemsArray, validateTokenUuid } from './catalog.js';
import { getItemPilesAPI, notPersisted, resolveToTokenObject, gmRequired, activeGmRequired, bankerAuctioneerCheck } from './helpers.js';

// ── 3A: Pile lifecycle ────────────────────────────────────────────────────────

type CreatePileInput = Extract<ModuleItempilesInputType, { action: 'create-pile' }>;

export async function handleCreatePile(input: CreatePileInput): Promise<Envelope<unknown>> {
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
      if (!flagData || typeof flagData !== 'object') {
        return notPersisted(ErrorTokens.ITEM_PILES_CREATE_NOT_PERSISTED, `created pile actor ${actorUuid} has no flag data after createItemPile`);
      }
    }

    notify.created('item-piles', `Created ${input.type ?? 'pile'} pile in scene ${input.sceneId}`, {});
    return { success: true, data: { tokenUuid, actorUuid, type: input.type ?? 'pile', sceneId: input.sceneId, flagData } };
  } catch (e) {
    return { success: false, error: `CREATE_PILE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type UpdatePileInput = Extract<ModuleItempilesInputType, { action: 'update-pile' }>;

export async function handleUpdatePile(input: UpdatePileInput): Promise<Envelope<unknown>> {
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
      // BUG-448#6: tablesForPopulate is a top-level pile flag (item-piles.js:64389-64394);
      // it rides the same updateItemPile write. refresh-merchant consumes it.
      'tablesForPopulate',
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

    // BUG-429: token-pile synthetic-actor uuids (Scene.<s>.Token.<t>.Actor.<a>) must target
    // the parent TokenDocument — Item Piles keys token-pile flags on the token, not the
    // synthetic actor, so both the write and the flag re-read silently miss on the actor
    // uuid and the type change never lands. World-actor uuids (Actor.<id>) pass through.
    const tokenMatch = /^(Scene\.[^.]+\.Token\.[^.]+)\.Actor\./.exec(input.actorUuid);
    const pileUuid = tokenMatch ? tokenMatch[1] : input.actorUuid;

    const updateResult = await API.updateItemPile(pileUuid, updateData);
    // M-2: socket returns false when GM disconnects mid-call
    if (updateResult === false) {
      return { success: false, error: 'NO_ACTIVE_GM: item-piles socket returned false — GM may have disconnected' };
    }

    // DP-16: post-write verify — closure-diff against the requested field set (excluding the
    // advisory-only _simpleCalendarWarning marker, which is never persisted by design).
    // BUG-448#6(c): non-scalar fields (tablesForPopulate, openTimes, merchantColumns,
    // vaultAccess, overheadCost) String()-compare as "[object Object]" and always match —
    // JSON.stringify-compare objects/arrays instead.
    let flagData: any = API.getActorFlagData(pileUuid);
    const sameValue = (a: unknown, b: unknown): boolean =>
      (typeof b === 'object' && b !== null) ? JSON.stringify(a) === JSON.stringify(b) : String(a) === String(b);
    const computeDrift = (flags: any): string[] => Object.keys(updateData)
      .filter((k) => k !== '_simpleCalendarWarning')
      .filter((k) => !sameValue(flags?.[k], updateData[k]));
    let drift = computeDrift(flagData);
    // BUG-539: upstream updateItemPileData writes token-level pile flags only via
    // Actor#getActiveTokens(), which is viewed-canvas-scene-only — for a token-pile on a
    // non-viewed scene the token write silently no-ops (the actor-level write still lands,
    // which is what polluted the shared Default Item Pile actor). getActorFlagData reads
    // the TokenDocument's flags for token targets, so on drift write the merged flag data
    // onto the TokenDocument directly (canvas-render-independent, same treatment as
    // BUG-444's delete path) and re-verify.
    if (drift.length > 0 && tokenMatch) {
      const tokenDoc: any = await (globalThis as any).fromUuid(pileUuid);
      if (tokenDoc?.documentName === 'Token') {
        const requested: Record<string, unknown> = {};
        for (const k of Object.keys(updateData)) {
          if (k !== '_simpleCalendarWarning') requested[k] = updateData[k];
        }
        const merged = { ...(flagData ?? {}), ...requested };
        const write: Record<string, unknown> = { 'flags.item-piles.data': merged };
        if (!tokenDoc.actorLink) write.delta = { 'flags.item-piles.data': merged };
        await tokenDoc.update(write);
        flagData = API.getActorFlagData(pileUuid);
        drift = computeDrift(flagData);
      }
    }
    if (drift.length > 0) {
      return notPersisted(ErrorTokens.ITEM_PILES_UPDATE_NOT_PERSISTED, `pile ${pileUuid} field(s) did not persist: ${drift.join(', ')}`);
    }
    notify.updated('item-piles', `Updated pile ${pileUuid}`, {});
    return { success: true, data: { actorUuid: input.actorUuid, pileUuid, updated: updateData, flagData } };
  } catch (e) {
    return { success: false, error: `UPDATE_PILE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type DeletePileInput = Extract<ModuleItempilesInputType, { action: 'delete-pile' }>;

export async function handleDeletePile(input: DeletePileInput): Promise<Envelope<unknown>> {
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
    // BUG-444: do NOT route through API.deleteItemPile — its getToken() helper returns the
    // bare TokenDocument when the token's scene is not viewed (`.object` is null,
    // item-piles.js:34269), and the upstream delete path then derefs `target.document.delete()`
    // (item-piles.js:85022) → "Cannot read properties of undefined (reading 'delete')".
    // Resolve the TokenDocument ourselves and delete it directly — canvas-render-independent.
    // Upstream's PRE_DELETE hook choreography is intentionally not re-implemented (plan D10).
    const tokenDoc: any = await (globalThis as any).fromUuid(input.tokenUuid);
    if (!tokenDoc) {
      return { success: false, error: `INVALID_PILE_UUID: token UUID "${input.tokenUuid}" did not resolve to a document` };
    }
    if (tokenDoc.documentName !== 'Token') {
      return { success: false, error: `INVALID_PILE_UUID: "${input.tokenUuid}" resolved to a ${tokenDoc.documentName ?? typeof tokenDoc}, not a TokenDocument` };
    }
    await tokenDoc.delete();
    // DP-16: NEW post-write read-back (this site had zero verify at baseline) — confirm the
    // pile token no longer resolves.
    const stillResolves = (globalThis as any).fromUuidSync?.(input.tokenUuid);
    if (stillResolves) {
      return notPersisted(ErrorTokens.ITEM_PILES_DELETE_NOT_PERSISTED, `pile token ${input.tokenUuid} still resolves after the delete`);
    }
    notify.deleted('item-piles', `Deleted pile token ${input.tokenUuid}`, {});
    return { success: true, data: { tokenUuid: input.tokenUuid, deleted: true } };
  } catch (e) {
    return { success: false, error: `DELETE_PILE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── 3A: Container state ───────────────────────────────────────────────────────

type SetPileStateInput = Extract<ModuleItempilesInputType, { action: 'set-pile-state' }>;

export async function handleSetPileState(input: SetPileStateInput): Promise<Envelope<unknown>> {
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

      // BUG-420: echo the per-token SYNTHETIC pile-actor UUIDs (read post-conversion from
      // the live token objects). turnTokensIntoItemPiles resolves to TOKEN uuids only, and
      // token.actorId points at the SHARED base actor — neither is a valid split-loot /
      // get-contents target when N tokens share one base actor.
      const pileActorUuids = tokens.map((t: any) => t?.document?.actor?.uuid ?? t?.actor?.uuid ?? null);

      // DP-16: NEW post-write read-back (this site had zero verify at baseline) — confirm each
      // token's pile-actor validity actually flipped in the requested direction.
      for (const pileActorUuid of pileActorUuids) {
        if (!pileActorUuid) continue;
        const isValid = API.isValidItemPile(pileActorUuid);
        if (input.state === 'turnTokens' && !isValid) {
          return notPersisted(ErrorTokens.ITEM_PILES_TOKEN_CONVERT_NOT_PERSISTED, `token pile-actor ${pileActorUuid} is not a valid item pile after turnTokensIntoItemPiles`);
        }
        if (input.state === 'revertTokens' && isValid) {
          return notPersisted(ErrorTokens.ITEM_PILES_TOKEN_CONVERT_NOT_PERSISTED, `token pile-actor ${pileActorUuid} is still a valid item pile after revertTokensFromItemPiles`);
        }
      }

      notify.updated('item-piles', `${input.state} on ${tokens.length} token(s)`, {});
      return { success: true, data: { state: input.state, tokenCount: tokens.length, pileActorUuids, result } };
    }

    // open/close/lock/unlock/rattle — all take actorUuid
    if (!input.actorUuid) {
      return { success: false, error: 'MISSING_ACTOR_UUID: actorUuid is required for open/close/lock/unlock/rattle states' };
    }

    // BUG-447: open/close/lock/unlock return the same bare `false` for "not a container" as
    // for hook-veto / no-GM (item-piles.js:97969/:98001) — pre-check the pile type so a
    // non-container gets a truthful token instead of NO_ACTIVE_GM. 'rattle' is exempt (it
    // doesn't gate on container). NO_ACTIVE_GM below is now reserved for `false` returned
    // on a VERIFIED container.
    if (input.state !== 'rattle' && !API.isItemPileContainer(input.actorUuid)) {
      const actualType = (API.getActorFlagData(input.actorUuid) as any)?.type ?? 'unknown';
      return { success: false, error: `INVALID_PILE_TYPE: set-pile-state "${input.state}" requires a container pile — this pile is type "${actualType}"` };
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

    // DP-16: post-write verify — closure-diff against the boolean flag the requested state implies.
    // ('rattle' has no persisted state change — shake-to-check flavor only, nothing to assert.)
    const flagData: any = API.getActorFlagData(input.actorUuid);
    if (input.state === 'open' || input.state === 'close') {
      const expectedClosed = input.state === 'close';
      if (Boolean(flagData?.closed) !== expectedClosed) {
        return notPersisted(ErrorTokens.ITEM_PILES_STATE_NOT_PERSISTED, `pile ${input.actorUuid} "closed" expected ${expectedClosed} after state "${input.state}", got ${Boolean(flagData?.closed)}`);
      }
    } else if (input.state === 'lock' || input.state === 'unlock') {
      const expectedLocked = input.state === 'lock';
      if (Boolean(flagData?.locked) !== expectedLocked) {
        return notPersisted(ErrorTokens.ITEM_PILES_STATE_NOT_PERSISTED, `pile ${input.actorUuid} "locked" expected ${expectedLocked} after state "${input.state}", got ${Boolean(flagData?.locked)}`);
      }
    }
    notify.updated('item-piles', `Set pile state to "${input.state}" on ${input.actorUuid}`, {});
    return { success: true, data: { state: input.state, actorUuid: input.actorUuid, result, flagData } };
  } catch (e) {
    return { success: false, error: `SET_PILE_STATE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── 3A: Contents read ─────────────────────────────────────────────────────────

type GetContentsInput = Extract<ModuleItempilesInputType, { action: 'get-contents' }>;

export async function handleGetContents(input: GetContentsInput): Promise<Envelope<unknown>> {
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
