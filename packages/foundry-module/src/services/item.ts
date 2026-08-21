// services/item.ts — MCP Code-Quality Hardening v1, Phase 7 (R7.1).
//
// The item MUTATION cluster, extracted VERBATIM from data-access.ts (updateItem / createItem / tradeItem /
// deleteItem + the createItem-only _ensureFolderChain helper) PLUS the two inline queries.ts handler bodies
// absorbed here for domain cohesion (user Q2): addItemFromCompendium + modifyItemQualities. FoundryDataAccess
// keeps thin facade delegates (Migrate; Contract → Phase 8); the queries.ts handlers shrink to
// gmCheck + parse + wrappedWrite(() => ({ success, data: dataAccess.<m>(parsed) })) so query keys + tools/list
// stay byte-stable (HC6/HC8).
//
// Seam: the injected validateState callback (was this.validateFoundryState). The 4 shared resolvers come from
// services/shared/ (no cross-service import). The absorbed handlers return the BARE payload the handler used
// to wrap in { success:true, data } — the wrapping moves to the (unchanged-shape) handler, net response
// identical.
//
// HC1: bodies are byte-identical; the only changes are `this.validateFoundryState()` → `this.validateState()`,
// and the 2 absorbed methods return the bare payload (the handler does the { success, data } wrap, exactly as
// handleTradeItem already does for tradeItem).

import { notify } from '../notify.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { _resolveItem } from './shared/document-resolver.js';
import { buildOperationReceipt } from './shared/operation-receipt.js';
import { buildOutcomeResponse } from './shared/outcome-response.js';
import { verifyDocWrite } from '../utils/verifyWrite.js';

export class ItemService {
  constructor(private readonly validateState: () => void) {}

  async updateItem(data: {
    actorId?: string | undefined;
    itemId?: string | undefined;
    itemName?: string | undefined;
    destination?:
    | { type: 'actor'; actorId?: string | undefined; actorName?: string | undefined }
    | { type: 'world'; folder?: string[] | undefined }
    | undefined;
    updateData: Record<string, any>;
    options?: { skipExperienceChecks?: boolean | undefined } | undefined;
    verifyPersistence?: boolean | undefined;
  }): Promise<any> {
    this.validateState();

    try {
      const { item, owner, scope } = _resolveItem(data);
      const flat =
        data.verifyPersistence !== false
          ? ((foundry as any).utils.flattenObject(data.updateData) as Record<string, unknown>)
          : null;
      const beforeValues =
        flat && data.verifyPersistence !== false
          ? Object.fromEntries(
            Object.entries(flat)
              .filter(([path]) => !path.includes('.-='))
              .map(([path]) => [path, (foundry as any).utils.getProperty(item, path)]),
          )
          : null;
      // BUG-385: a skill item whose `system.advances.value` changes on a character-type actor
      // triggers SkillModel._preUpdate → Advancement.advancementDialog (a DialogV2), which
      // deadlocks the MCP await until a human clicks. The wfrp4e gate is !options.skipExperienceChecks;
      // updateActor already injects this unconditionally — mirror it here (GM-only programmatic path,
      // the XP dialog is never appropriate).
      const updateResult = await item.update(
        data.updateData,
        { ...(data.options ?? {}), skipExperienceChecks: true } as any,
      );

      // MCP Completion v1 Phase 1 (R1.2): item.update() does NOT throw on
      // DataModelValidationError; Foundry logs to console.warn but resolves
      // silently. Without post-write verification our success envelope lies.
      // Mirrors updateActor's BUG-086 verify-block (data-access.ts:4190-4211).
      // Pass verifyPersistence:false to opt out when writing auto-derived fields.
      if (data.verifyPersistence !== false) {
        const flatUpdate = flat ?? {};
        // BUG-134: Foundry returns `undefined` when a preUpdate hook cancels the write.
        // Treat that as a failed persistence attempt whenever the requested payload
        // would have changed at least one field.
        if (updateResult === undefined && beforeValues) {
          const cancelled = Object.entries(flatUpdate)
            .filter(([path]) => !path.includes('.-='))
            .filter(([path, expected]) => JSON.stringify(beforeValues[path]) !== JSON.stringify(expected));
          if (cancelled.length > 0) {
            const preview = cancelled
              .slice(0, 3)
              .map(([path, expected]) => `${path}: expected ${JSON.stringify(expected)}, before ${JSON.stringify(beforeValues[path])}`)
              .join('; ');
            throw new Error(
              `${ErrorTokens.UPDATE_ITEM_NOT_PERSISTED}: Item.update() returned undefined (preUpdate cancelled write?). Requested changes were not applied. ${preview}${cancelled.length > 3 ? `; +${cancelled.length - 3} more` : ''}`,
            );
          }
        }
        const freshItem =
          scope === 'actor'
            ? (game.actors as any)?.get(owner?.id)?.items?.get(item.id)
            : (game.items as any)?.get(item.id);
        if (!freshItem) {
          throw new Error(`${ErrorTokens.UPDATE_ITEM_NOT_PERSISTED}: item ${item.id} disappeared after update`);
        }
        // CORE-05 (mcp_code_quality_v2 Phase C2) — consolidated onto verifyDocWrite (was a hand-rolled
        // JSON.stringify drift loop). readSource:false preserves the original direct-property read
        // (the hand-rolled loop never read via ._source; switching the default broke test doubles
        // that model a flat live-document shape without a ._source bag).
        verifyDocWrite(freshItem, flatUpdate, ErrorTokens.UPDATE_ITEM_NOT_PERSISTED, { readSource: false });
      }

      const ownerLabel = scope === 'world' ? '(world)' : owner?.name ?? '(unknown)';
      notify.updated('item', item.name, { summary: `on ${ownerLabel}`, uuid: (item as any).uuid });

      return {
        success: true,
        scope,
        actorId: owner?.id ?? null,
        itemId: item.id,
        itemName: item.name,
        updated: Object.keys(data.updateData),
      };
    } catch (error) {
      throw new Error(`Failed to update item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Walk the Items-sidebar folder tree; create missing segments.
   * Returns the leaf folder's ID. Empty/missing segments → null (root).
   */
  private async _ensureFolderChain(segments: string[]): Promise<string | null> {
    if (!segments || segments.length === 0) return null;

    let parentId: string | null = null;
    for (const name of segments) {
      const existing = (game.folders as any).find((f: any) => {
        const fParent = f.folder?.id ?? f.folder ?? null;
        return f.type === 'Item' && f.name === name && fParent === parentId;
      });
      if (existing) {
        parentId = existing.id;
        continue;
      }
      const payload: any = { name, type: 'Item', folder: parentId };
      const created: any = await (Folder as any).create(payload);
      if (!created?.id) {
        throw new Error(`Folder.create returned no id for segment "${name}"`);
      }
      if (!(game.folders as any).get(created.id)) {
        throw new Error(`${ErrorTokens.FOLDER_WRITE_NOT_PERSISTED}: folder "${name}" (${created.id}) absent from game.folders after create`);
      }
      notify.created('folder', name);
      parentId = created.id;
    }
    return parentId;
  }

  /**
   * Phase 5: Create an item on an actor OR as a world-level document with optional
   * folder placement. Optional compendium-clone seeding and rich-response opt-in.
   *
   * Input: { itemData, destination: {type:"actor"|"world", ...}, fromCompendium?, returnFullPayload? }
   */
  async createItem(data: {
    itemData: Record<string, any>;
    destination:
    | { type: 'actor'; actorId?: string | undefined; actorName?: string | undefined }
    | { type: 'world'; folder?: string[] | undefined };
    fromCompendium?: string | undefined;
    returnFullPayload?: boolean | undefined;
  }): Promise<any> {
    this.validateState();

    try {
      // 1. Resolve compendium clone seed if requested
      let effectiveItemData: Record<string, any> = data.itemData;
      if (data.fromCompendium) {
        const source: any = await (fromUuid as any)(data.fromCompendium);
        if (!source) {
          throw new Error(`Compendium source not found: ${data.fromCompendium}`);
        }
        const cloned: any = source.toObject();
        delete cloned._id;
        if (Array.isArray(cloned.effects)) {
          for (const eff of cloned.effects) delete eff._id;
        }
        // BUG-643: mergeObject treats arrays as atomic — a supplied `data.itemData.effects`
        // would wholesale-replace `cloned.effects`, contradicting the documented contract
        // (compendium-clone-patterns.md: "effects[] complements the cloned effect chain...
        // preserved by fromCompendium; the new entries are appended"). Pre-union the arrays
        // so mergeObject sees a single already-combined array on the incoming side.
        const requestedItemData = Array.isArray(data.itemData.effects) && data.itemData.effects.length > 0
          ? { ...data.itemData, effects: [...(cloned.effects ?? []), ...data.itemData.effects] }
          : data.itemData;
        effectiveItemData = (foundry as any).utils.mergeObject(cloned, requestedItemData, {
          recursive: true,
          overwrite: true,
          inplace: false,
        });
      }

      // 2. Route on destination type
      if (data.destination.type === 'actor') {
        const dest = data.destination;
        let actor: any = null;
        if (dest.actorId) {
          actor = (game.actors as any)?.get(dest.actorId);
        } else if (dest.actorName) {
          actor = (game.actors as any)?.find(
            (a: any) => a.name?.toLowerCase() === dest.actorName!.toLowerCase()
          );
        }
        if (!actor) {
          throw new Error(
            `Actor not found: ${dest.actorId ?? dest.actorName ?? '(no id/name provided)'}`
          );
        }

        const createdItems = await actor.createEmbeddedDocuments('Item', [effectiveItemData]);
        if (!createdItems?.length) {
          throw new Error(`${ErrorTokens.CREATE_ITEM_NOT_PERSISTED}: createEmbeddedDocuments returned no items`);
        }
        const item: any = createdItems[0];
        const freshDestItem: any = actor.items?.get(item.id);
        verifyDocWrite(freshDestItem, { name: item.name }, ErrorTokens.CREATE_ITEM_NOT_PERSISTED);
        notify.created('item', item.name, { summary: `on ${actor.name}`, uuid: (item as any).uuid });

        const base: any = {
          success: true,
          scope: 'actor',
          actorId: actor.id,
          actorName: actor.name,
          itemId: item.id,
          itemName: item.name,
          itemType: item.type,
        };
        if (data.returnFullPayload === true) {
          base.itemData = item.toObject();
          base.effectIds = (item.effects as any)?.map((e: any) => e.id) ?? [];
        }
        return base;
      }

      // World scope
      const worldDest = data.destination;
      const folderId =
        worldDest.folder && worldDest.folder.length > 0
          ? await this._ensureFolderChain(worldDest.folder)
          : null;

      const createPayload: any = { ...effectiveItemData };
      if (folderId) createPayload.folder = folderId;

      const created: any = await (Item as any).create(createPayload);
      if (!created) throw new Error('Item.create returned null');
      const freshWorldItem: any = (game.items as any).get(created.id);
      verifyDocWrite(freshWorldItem, { name: created.name }, ErrorTokens.CREATE_ITEM_NOT_PERSISTED);

      notify.created('item', created.name, { summary: 'in world directory', uuid: (created as any).uuid });

      const base: any = {
        success: true,
        scope: 'world',
        itemId: created.id,
        itemName: created.name,
        itemType: created.type,
        folderId: folderId ?? null,
        folderPath: worldDest.folder ?? [],
      };
      if (data.returnFullPayload === true) {
        base.itemData = created.toObject();
        base.effectIds = (created.effects as any)?.map((e: any) => e.id) ?? [];
      }
      // Phase 12 R12.2: operation receipt — created = the item only. The leaf folderId is intentionally NOT
      // in createdDocumentIds: _ensureFolderChain reuses existing folders silently and does not report which
      // (if any) it created, so claiming the folder was created would be unfaithful. folderId stays available
      // in the `folderId` field above. (Plan deferral: tracking created folders needs an _ensureFolderChain refactor.)
      Object.assign(base, buildOperationReceipt({ created: [created.id] }));
      return base;
    } catch (error) {
      throw new Error(
        `Failed to create item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Phase 5: Atomic trade — move an Item from one actor to another. Partial-quantity
   * transfers are supported via the `quantity` parameter. Encumbrance recomputes
   * automatically via the system's prepareData pipeline (HC3).
   *
   * Transaction semantics are provided by wrappedWrite at the handler layer; this
   * method throws on any failure so the outer wrapper rolls back.
   */
  async tradeItem(data: {
    fromActorId: string;
    toActorId: string;
    itemId: string;
    quantity?: number | undefined;
  }): Promise<any> {
    this.validateState();

    const fromActor: any = (game.actors as any)?.get(data.fromActorId);
    if (!fromActor) {
      throw new Error(`Source actor not found: ${data.fromActorId}`);
    }
    const toActor: any = (game.actors as any)?.get(data.toActorId);
    if (!toActor) {
      throw new Error(`Destination actor not found: ${data.toActorId}`);
    }

    const item: any = fromActor.items?.get(data.itemId);
    if (!item) {
      throw new Error(`Item ${data.itemId} not found on ${fromActor.name}`);
    }

    const itemName: string = item.name;
    const itemType: string = item.type;
    const sourceQty: number = item.system?.quantity?.value ?? 1;

    // Partial transfer: source retains (sourceQty - quantity); dest gets `quantity`.
    if (
      typeof data.quantity === 'number' &&
      data.quantity > 0 &&
      data.quantity < sourceQty
    ) {
      const cloned: any = item.toObject();
      delete cloned._id;
      if (cloned.system?.quantity) cloned.system.quantity.value = data.quantity;

      // BUG-642: create and verify the destination copy BEFORE touching the source.
      // A destination rejection therefore leaves the source byte-for-byte untouched.
      const destCreated = await toActor.createEmbeddedDocuments('Item', [cloned]);
      const destItem: any = destCreated[0];
      if (!destItem || !toActor.items?.get(destItem.id)) {
        throw new Error(`${ErrorTokens.TRADE_ITEM_DEST_CREATE_NOT_PERSISTED}: destination item absent after create on ${toActor.name}`);
      }

      // Only after the destination is durable do we decrement the source. If the source
      // write is rejected, compensate by deleting the destination copy so the trade is
      // atomic in both directions (BUG-213 duplication guard + BUG-642 loss guard).
      let sourceUpdateError: unknown;
      try {
        await item.update({ 'system.quantity.value': sourceQty - data.quantity });
      } catch (error) {
        sourceUpdateError = error;
      }
      const freshItem = fromActor.items?.get(data.itemId);
      const freshQty = (freshItem as any)?.system?.quantity?.value ?? sourceQty;
      if (freshQty !== sourceQty - data.quantity) {
        await toActor.deleteEmbeddedDocuments('Item', [destItem.id]);
        if (toActor.items?.get(destItem.id)) {
          throw new Error(
            `TRADE_ITEM_COMPENSATION_FAILED: source quantity remained ${freshQty} and destination item ${destItem.id} could not be removed`,
          );
        }
        const detail = sourceUpdateError instanceof Error ? `; update error: ${sourceUpdateError.message}` : '';
        throw new Error(
          `${ErrorTokens.TRADE_ITEM_SOURCE_DECREMENT_NOT_PERSISTED}: source quantity expected ${sourceQty - data.quantity} but found ${freshQty}${detail}`,
        );
      }

      notify.updated('item', itemName, { summary: `traded ${data.quantity} × from ${fromActor.name} → ${toActor.name}` });

      return {
        success: true,
        fromActorId: fromActor.id,
        fromActorName: fromActor.name,
        toActorId: toActor.id,
        toActorName: toActor.name,
        itemId: destItem?.id ?? null,
        itemName,
        itemType,
        quantities: { from: sourceQty - data.quantity, to: data.quantity },
        // Phase 12 R12.2: partial trade — dest item created, source item quantity UPDATED (not deleted).
        ...buildOperationReceipt({ created: [destItem?.id], updated: [data.itemId] }),
      };
    }

    // Full transfer: create and verify destination first, then delete source. This
    // ordering is the BUG-642 safety invariant: destination failure cannot lose source.
    const cloned: any = item.toObject();
    delete cloned._id;

    const destCreated = await toActor.createEmbeddedDocuments('Item', [cloned]);
    const destItem: any = destCreated[0];
    if (!destItem || !toActor.items?.get(destItem.id)) {
      throw new Error(`${ErrorTokens.TRADE_ITEM_DEST_CREATE_NOT_PERSISTED}: destination item absent after create on ${toActor.name}`);
    }

    let sourceDeleteError: unknown;
    try {
      await fromActor.deleteEmbeddedDocuments('Item', [data.itemId]);
    } catch (error) {
      sourceDeleteError = error;
    }
    if (fromActor.items?.get(data.itemId)) {
      await toActor.deleteEmbeddedDocuments('Item', [destItem.id]);
      if (toActor.items?.get(destItem.id)) {
        throw new Error(
          `TRADE_ITEM_COMPENSATION_FAILED: source item ${data.itemId} remained and destination item ${destItem.id} could not be removed`,
        );
      }
      const detail = sourceDeleteError instanceof Error ? `; delete error: ${sourceDeleteError.message}` : '';
      throw new Error(`${ErrorTokens.TRADE_ITEM_SOURCE_DELETE_NOT_PERSISTED}: item ${data.itemId} still present on ${fromActor.name} after delete${detail}`);
    }

    notify.updated('item', itemName, { summary: `traded from ${fromActor.name} → ${toActor.name}` });

    return {
      success: true,
      fromActorId: fromActor.id,
      fromActorName: fromActor.name,
      toActorId: toActor.id,
      toActorName: toActor.name,
      itemId: destItem?.id ?? null,
      itemName,
      itemType,
      quantities: { from: 0, to: sourceQty },
      // Phase 12 R12.2: full trade — dest item created, source item DELETED.
      ...buildOperationReceipt({ created: [destItem?.id], deleted: [data.itemId] }),
    };
  }

  /**
   * Delete an item from an actor OR a world-scope item.
   * Legacy `{actorId, itemId}` callers unaffected.
   */
  async deleteItem(data: {
    actorId?: string | undefined;
    itemId?: string | undefined;
    itemName?: string | undefined;
    destination?:
    | { type: 'actor'; actorId?: string | undefined; actorName?: string | undefined }
    | { type: 'world'; folder?: string[] | undefined }
    | undefined;
  }): Promise<any> {
    this.validateState();

    try {
      const { item, owner, scope } = _resolveItem(data);
      const itemName = item.name;
      const itemType = item.type;
      const itemId = item.id;

      if (scope === 'world') {
        await item.delete();
        if ((game.items as any).get(itemId)) {
          throw new Error(`${ErrorTokens.DELETE_ITEM_NOT_PERSISTED}: item ${itemId} still present in game.items after delete`);
        }
        notify.deleted('item', itemName, { summary: 'world directory' });
      } else {
        await owner.deleteEmbeddedDocuments('Item', [itemId]);
        if (owner.items?.get(itemId)) {
          throw new Error(`${ErrorTokens.DELETE_ITEM_NOT_PERSISTED}: item ${itemId} still present on ${owner.name} after delete`);
        }
        notify.deleted('item', itemName, { summary: `from ${owner.name}` });
      }

      return {
        success: true,
        scope,
        actorId: owner?.id ?? null,
        itemId,
        itemName,
        itemType,
      };
    } catch (error) {
      throw new Error(`Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Phase 7 (R7.1): absorbed from queries.ts handleAddItemFromCompendium (inline body, never a DA method).
   * Returns the bare payload; the queries.ts handler keeps gmCheck + parse + wrappedWrite + the { success,
   * data } wrap (mirrors handleTradeItem). The uuid-resolve guard moves in with the logic (verbatim).
   */
  async addItemFromCompendium(parsed: any): Promise<any> {
    const uuid = parsed.itemUuid ?? parsed.compendiumId;
    if (!uuid) throw new Error('add-item-from-compendium: one of {itemUuid, compendiumId} is required.');
    const actor = game.actors?.get(parsed.actorId);
    if (!actor) throw new Error(`Actor with ID "${parsed.actorId}" not found`);

    const itemDoc = await fromUuid(uuid);
    if (!itemDoc) throw new Error(`Item with UUID "${uuid}" not found in compendium`);

    const itemData = itemDoc.toObject();
    // BUG-476 (Wave 2, D3 + ADR-10.1): wfrp4e's LocationalItemModel._preCreate opens a
    // BLOCKING DialogV2 ("Choose Location") whenever an owned item carries
    // system.prompt:true with no location.key (ALL core critical wounds) — the MCP
    // query timed out while the create completed minutes later, and a retry
    // double-embedded. No creation option gates that dialog (the guard is only
    // `!location && this.prompt`), so ALWAYS pre-strip prompt on the carried copy:
    // the embed returns immediately; location stays unset for the GM to resolve on
    // the sheet (never invent a hit location).
    if (itemData?.system?.prompt === true && !itemData?.system?.location?.key) {
      itemData.system.prompt = false;
    }
    const embedOptions: Record<string, unknown> = {};
    if (parsed.skipSpecialisationChoice) embedOptions.skipSpecialisationChoice = true;
    const createdItems = await actor.createEmbeddedDocuments('Item', [itemData], embedOptions);
    if (!createdItems || createdItems.length === 0) throw new Error('Failed to create item on actor');

    const createdItem = createdItems[0]!;
    if (!actor.items?.get(createdItem.id)) {
      throw new Error(`${ErrorTokens.CREATE_ITEM_NOT_PERSISTED}: item ${createdItem.id} absent from ${actor.name}'s items after create`);
    }
    notify.created('item', createdItem.name ?? 'unknown', { summary: `on ${actor.name} from compendium`, uuid: (createdItem as any).uuid });

    return {
      itemId: createdItem.id,
      itemName: createdItem.name,
      itemType: (createdItem as any).type,
      actorId: actor.id,
      actorName: actor.name,
      message: `Successfully added "${createdItem.name}" to ${actor.name} from compendium`,
    };
  }

  /**
   * Phase 7 (R7.1): absorbed from queries.ts handleModifyItemQualities (inline body). Returns the bare
   * payload; the queries.ts handler keeps gmCheck + parse + wrappedWrite + the { success, data } wrap.
   */
  async modifyItemQualities(parsed: any): Promise<any> {
    // Phase 5: route on destination discriminator OR fall back to legacy characterName.
    let item: any = null;
    let ownerLabel = '';

    if (parsed.destination?.type === 'world') {
      // World-scope item lookup
      const items = (game.items as any) ?? [];
      if (parsed.itemId) {
        item = items.get?.(parsed.itemId) ?? null;
      }
      if (!item && parsed.itemName) {
        item = items.find?.(
          (i: any) => i.name?.toLowerCase() === parsed.itemName!.toLowerCase()
        ) ?? null;
      }
      if (!item) {
        throw new Error(
          `World item "${parsed.itemName ?? parsed.itemId}" not found in Items sidebar`
        );
      }
      ownerLabel = '(world)';
    } else {
      // Actor-scope lookup — destination.actor OR legacy characterName
      let actor: any = null;
      if (parsed.destination?.type === 'actor') {
        const dest = parsed.destination;
        if (dest.actorId) {
          actor = (game.actors as any)?.get(dest.actorId);
        } else if (dest.actorName) {
          actor = (game.actors as any)?.find(
            (a: any) => a.name?.toLowerCase() === dest.actorName!.toLowerCase()
          );
        }
      }
      if (!actor) {
        throw new Error(
          `Actor not found: ${parsed.destination?.type === 'actor'
            ? parsed.destination.actorId ?? parsed.destination.actorName
            : '(no identifier)'
          }`
        );
      }

      if (parsed.itemId) {
        item = actor.items?.get(parsed.itemId);
      } else if (parsed.itemName) {
        item = actor.items?.find(
          (i: any) => i.name?.toLowerCase() === parsed.itemName!.toLowerCase()
        );
      }
      if (!item) {
        throw new Error(
          `Item "${parsed.itemName ?? parsed.itemId}" not found on ${actor.name}`
        );
      }
      ownerLabel = actor.name;
    }

    const normaliseEntry = (entry: any) => {
      const normalised: Record<string, unknown> = { name: String(entry.name).toLowerCase() };
      if (entry.value !== undefined) normalised.value = entry.value;
      return normalised;
    };
    const readEntries = (key: 'qualities' | 'flaws') => {
      const raw = item.system?.[key]?.value;
      return Array.isArray(raw) ? raw.map((entry: any) => ({ ...entry })) : [];
    };
    const mergeEntries = (
      current: any[],
      additions: any[],
      removals: string[]
    ) => {
      const removeSet = new Set(removals.map((name) => name.toLowerCase()));
      const addNames = new Set(additions.map((entry) => String(entry.name).toLowerCase()));
      const next = current.filter((entry) => {
        const name = String(entry?.name ?? '').toLowerCase();
        return !removeSet.has(name) && !addNames.has(name);
      });
      next.push(...additions.map(normaliseEntry));
      return next;
    };

    const nextQualities = mergeEntries(
      readEntries('qualities'),
      parsed.addQualities,
      parsed.removeQualities
    );
    const nextFlaws = mergeEntries(
      readEntries('flaws'),
      parsed.addFlaws,
      parsed.removeFlaws
    );

    const updateData: Record<string, unknown> = {
      'system.qualities.value': nextQualities,
      'system.flaws.value': nextFlaws,
    };

    await item.update(updateData);

    // BUG-288: re-fetch from parent collection so verify reads persisted
    // _source, not the stale in-memory reference (DP-16 post-write pattern).
    const persistedItem = item.parent
      ? (item.parent.items?.get(item.id) ?? item)
      : ((game.items as any)?.get(item.id) ?? item);
    // BUG-661: name-only membership lets a rejected fine:1 → fine:2 update pass.
    // Compare the complete canonical name/value multisets so changed values, removals,
    // duplicates, and unexpected survivors all participate in DP-16 verification.
    const canonicalEntries = (entries: any[]) => entries
      .map((entry: any) => ({
        name: String(entry?.name ?? '').toLowerCase(),
        value: entry?.value ?? null,
      }))
      .sort((a: any, b: any) => `${a.name}:${String(a.value)}`.localeCompare(`${b.name}:${String(b.value)}`));
    const expectedQualities = canonicalEntries(nextQualities);
    const expectedFlaws = canonicalEntries(nextFlaws);
    const persistedQualities = canonicalEntries((persistedItem._source as any)?.system?.qualities?.value ?? []);
    const persistedFlaws = canonicalEntries((persistedItem._source as any)?.system?.flaws?.value ?? []);
    if (JSON.stringify(persistedQualities) !== JSON.stringify(expectedQualities)) {
      throw new Error(
        `${ErrorTokens.MODIFY_ITEM_QUALITIES_NOT_PERSISTED}: qualities expected ${JSON.stringify(expectedQualities)} but found ${JSON.stringify(persistedQualities)}`,
      );
    }
    if (JSON.stringify(persistedFlaws) !== JSON.stringify(expectedFlaws)) {
      throw new Error(
        `${ErrorTokens.MODIFY_ITEM_QUALITIES_NOT_PERSISTED}: flaws expected ${JSON.stringify(expectedFlaws)} but found ${JSON.stringify(persistedFlaws)}`,
      );
    }

    notify.updated('item', item.name, {
      summary: `qualities modified on ${ownerLabel}`,
      uuid: (item as any).uuid,
    });
    return buildOutcomeResponse('applied', { itemName: item.name, owner: ownerLabel });
  }
}
