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
import { _resolveItem } from './shared/document-resolver.js';

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
              `UPDATE_ITEM_NOT_PERSISTED: Item.update() returned undefined (preUpdate cancelled write?). Requested changes were not applied. ${preview}${cancelled.length > 3 ? `; +${cancelled.length - 3} more` : ''}`,
            );
          }
        }
        const freshItem =
          scope === 'actor'
            ? (game.actors as any)?.get(owner?.id)?.items?.get(item.id)
            : (game.items as any)?.get(item.id);
        if (!freshItem) {
          throw new Error(`UPDATE_ITEM_NOT_PERSISTED: item ${item.id} disappeared after update`);
        }
        const drift: string[] = [];
        for (const [path, expected] of Object.entries(flatUpdate)) {
          if (path.includes('.-=')) continue;
          const actual = (foundry as any).utils.getProperty(freshItem, path);
          if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            drift.push(`${path}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
          }
        }
        if (drift.length > 0) {
          throw new Error(
            `UPDATE_ITEM_NOT_PERSISTED: ${drift.length} field(s) did not persist (DataModelValidationError? auto-derive overwrite?). Drift: ${drift.slice(0, 3).join('; ')}${drift.length > 3 ? `; +${drift.length - 3} more` : ''}`
          );
        }
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
        effectiveItemData = (foundry as any).utils.mergeObject(cloned, data.itemData, {
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
        const item: any = createdItems[0];
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

      // Decrement source — capture result for DP-16 verify BEFORE creating destination.
      // BUG-213: if source decrement fails silently, dest create would duplicate the item.
      // The throw MUST precede toActor.createEmbeddedDocuments — that ordering IS the fix.
      const updateResult = await item.update({ 'system.quantity.value': sourceQty - data.quantity });
      const freshItem = fromActor.items?.get(data.itemId);
      const freshQty = (freshItem as any)?.system?.quantity?.value ?? sourceQty;
      if (updateResult === undefined || freshQty !== sourceQty - data.quantity) {
        throw new Error(
          `TRADE_ITEM_SOURCE_DECREMENT_NOT_PERSISTED: source quantity expected ${sourceQty - data.quantity} but found ${freshQty} (updateResult=${updateResult === undefined ? 'undefined' : 'ok'})`,
        );
      }

      // Create on destination
      const destCreated = await toActor.createEmbeddedDocuments('Item', [cloned]);
      const destItem: any = destCreated[0];

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
      };
    }

    // Full transfer: delete from source, create on destination
    const cloned: any = item.toObject();
    delete cloned._id;

    await fromActor.deleteEmbeddedDocuments('Item', [data.itemId]);
    const destCreated = await toActor.createEmbeddedDocuments('Item', [cloned]);
    const destItem: any = destCreated[0];

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
        notify.deleted('item', itemName, { summary: 'world directory' });
      } else {
        await owner.deleteEmbeddedDocuments('Item', [itemId]);
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
    const embedOptions: Record<string, unknown> = {};
    if (parsed.skipSpecialisationChoice) embedOptions.skipSpecialisationChoice = true;
    const createdItems = await actor.createEmbeddedDocuments('Item', [itemData], embedOptions);
    if (!createdItems || createdItems.length === 0) throw new Error('Failed to create item on actor');

    const createdItem = createdItems[0]!;
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
    const persistedQualityNames = new Set(
      ((persistedItem._source as any)?.system?.qualities?.value ?? []).map((entry: any) => String(entry?.name ?? '').toLowerCase())
    );
    const persistedFlawNames = new Set(
      ((persistedItem._source as any)?.system?.flaws?.value ?? []).map((entry: any) => String(entry?.name ?? '').toLowerCase())
    );
    for (const quality of parsed.addQualities) {
      if (!persistedQualityNames.has(String(quality.name).toLowerCase())) {
        throw new Error(`MODIFY_ITEM_QUALITIES_NOT_PERSISTED: missing added quality "${quality.name}"`);
      }
    }
    for (const quality of parsed.removeQualities) {
      if (persistedQualityNames.has(quality.toLowerCase())) {
        throw new Error(`MODIFY_ITEM_QUALITIES_NOT_PERSISTED: quality "${quality}" was not removed`);
      }
    }
    for (const flaw of parsed.addFlaws) {
      if (!persistedFlawNames.has(String(flaw.name).toLowerCase())) {
        throw new Error(`MODIFY_ITEM_QUALITIES_NOT_PERSISTED: missing added flaw "${flaw.name}"`);
      }
    }
    for (const flaw of parsed.removeFlaws) {
      if (persistedFlawNames.has(flaw.toLowerCase())) {
        throw new Error(`MODIFY_ITEM_QUALITIES_NOT_PERSISTED: flaw "${flaw}" was not removed`);
      }
    }

    notify.updated('item', item.name, {
      summary: `qualities modified on ${ownerLabel}`,
      uuid: (item as any).uuid,
    });
    return { itemName: item.name, owner: ownerLabel };
  }
}
