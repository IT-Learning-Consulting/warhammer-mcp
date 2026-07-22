// Phase 1 mcp_coverage_expansion — Item-directory umbrella handler.
//
// Covers 5 actions over game.items (world WorldCollection):
//   list / get / search / duplicate / import-from-compendium
//
// Architecture:
//   - list / get / search are read-only; run inline with GM gate + validateFoundryState.
//   - duplicate + import-from-compendium are writes; wrapped in wrappedWrite + notify.created.
//   - CCR-2a: duplicate and import both re-read the created document to confirm id ≠ source.
//   - HC1 / CCR-3: no CONFIG.WFRP4E / game-rule logic.
//   - BUG-069 class: handler always returns {success:true, data} envelopes; never bare.
//
// Error tokens:
//   ITEM_NOT_FOUND, ITEM_PACK_NOT_FOUND, ITEM_DUPLICATE_FAILED, ITEM_IMPORT_FAILED

import {
  ItemDirectoryToolInput,
  type ItemDirectoryToolInputType,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { boundList } from '../services/bounded-response.js';
import { notify } from '../notify.js';
import { MAX_PAGE_SIZE } from '../constants/toolLimits.js';
import { validateGMAccess as validateGMAccessGate } from '../utils/embeddedCRUDFactory.js';

// ── GM gate helper (inline, mirrors folder.ts + diagnostic.ts pattern) ────────

// CORE-04 (mcp_code_quality_v2 Phase C2) — thin local adapter over the canonical
// utils/embeddedCRUDFactory.ts validateGMAccess() gate. This file's throw-only call sites
// stay unchanged; only the underlying isGM check is de-duplicated.
function validateGMAccess(): void {
  if (!validateGMAccessGate().allowed) {
    throw new Error('Access denied: GM-only operation');
  }
}
// ── Serializer ────────────────────────────────────────────────────────────────

function serializeWorldItem(item: any): Record<string, unknown> {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    img: item.img ?? null,
    folderId: item._source?.folder ?? null,
    system: item._source?.system ?? {},
    flags: item._source?.flags ?? {},
  };
}

// ── Envelope type ─────────────────────────────────────────────────────────────

type Envelope<T> = { success: true; data: T };

// ── Action handlers ───────────────────────────────────────────────────────────

function listWorldItems(input: Extract<ItemDirectoryToolInputType, { action: 'list' }>): Envelope<unknown> {
  const allItems: any[] = Array.from((game.items as any)?.contents ?? []);

  // BUG-662: typeFilter and folderId are independent, composable predicates.
  // The former ternary silently discarded folderId whenever typeFilter was present.
  const filtered = allItems.filter((item: any) =>
    (!input.typeFilter || item.type === input.typeFilter) &&
    (!input.folderId || (item._source?.folder ?? null) === input.folderId)
  );

  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? MAX_PAGE_SIZE;
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return {
    success: true,
    data: {
      items: paged.map(serializeWorldItem),
      total,
      page,
      pageSize,
      typeFilter: input.typeFilter ?? null,
      folderId: input.folderId ?? null,
    },
  };
}

function getWorldItem(input: Extract<ItemDirectoryToolInputType, { action: 'get' }>): Envelope<unknown> {
  const item = (game.items as any)?.get(input.itemId);
  if (!item) {
    throw new Error(`ITEM_NOT_FOUND: no world item with id "${input.itemId}"`);
  }
  // BUG-663: this previously reused serializeWorldItem — the same narrow, pagination-safe
  // summary shape (id/name/type/img/folderId/system/flags) that `list`/`search` use — despite
  // the tool's own description promising "the full serialized item" for a single-item `get`.
  // Effects, ownership, sort, and other document fields were silently absent, making this
  // response unsuitable for clone/effect verification. `get` is a single-document read, not a
  // paginated list, so there's no response-size reason to withhold the full document. Spread
  // toObject() (Foundry's own full-serialization) and overlay the pre-existing `id`/`folderId`
  // convenience aliases on top so existing callers relying on those exact key names still work.
  const full = item.toObject();
  return { success: true, data: { ...full, id: item.id, folderId: item._source?.folder ?? null } };
}

function searchWorldItems(input: Extract<ItemDirectoryToolInputType, { action: 'search' }>): Envelope<unknown> {
  const searchOpts: Record<string, unknown> = {};
  if (input.query) searchOpts.query = input.query;
  if (input.exclude) searchOpts.exclude = input.exclude;

  // BUG-495 (Wave 2): Foundry's DocumentCollection#search expects `filters` as an
  // ARRAY of FieldFilters — forwarding the documented {type?, folder?} OBJECT crashed
  // with "filters is not iterable". Apply the documented object shape ourselves on
  // the search results (deterministic; folder matches the scalar _source FK id).
  let results: any[] = (game.items as any)?.search(searchOpts) ?? [];
  if (input.filters?.type !== undefined) {
    results = results.filter((i: any) => i?.type === input.filters!.type);
  }
  if (input.filters?.folder !== undefined) {
    results = results.filter(
      (i: any) => ((i?._source?.folder ?? i?.folder?.id ?? i?.folder) ?? null) === input.filters!.folder,
    );
  }
  // BUG-528 (7th proven overflow surface): bound the result set — full serialized
  // items at 164 world items measured 75.6k chars, over the BUG-490 budget.
  const bounded = boundList(results, { limit: input.limit, offset: input.offset });
  return {
    success: true,
    data: {
      items: bounded.items.map(serializeWorldItem),
      totalAvailable: bounded.totalAvailable,
      truncated: bounded.truncated,
      offset: bounded.offset,
      limit: bounded.limit,
      query: input.query ?? null,
    },
  };
}

async function duplicateWorldItem(
  input: Extract<ItemDirectoryToolInputType, { action: 'duplicate' }>,
): Promise<Envelope<unknown>> {
  validateGMAccess();

  return wrappedWrite('item-directory.duplicate', async () => {
    const source: any = (game.items as any)?.get(input.itemId);
    if (!source) {
      throw new Error(`ITEM_NOT_FOUND: no world item with id "${input.itemId}"`);
    }

    const sourceId = source.id as string;
    const itemData: any = source.toObject();

    delete itemData._id;
    delete itemData.folder;
    delete itemData.sort;

    // Strip embedded ActiveEffect ids so Foundry generates fresh ones on create.
    if (Array.isArray(itemData.effects)) {
      for (const eff of itemData.effects) delete eff._id;
    }

    if (input.newName) itemData.name = input.newName;

    const created: any = await (Item as any).create(itemData);
    if (!created) throw new Error('ITEM_DUPLICATE_FAILED: Item.create returned null');

    // CCR-2a: confirm new id ≠ source id.
    if (created.id === sourceId) {
      throw new Error(
        `ITEM_DUPLICATE_FAILED: duplicate id equals source id "${sourceId}" — creation may have been a no-op`,
      );
    }

    notify.created('item', created.name, {
      summary: `duplicated from ${source.name}`,
      uuid: (created as any).uuid,
    });

    return {
      success: true,
      data: {
        id: created.id,
        name: created.name,
        type: created.type,
        sourceId,
        img: created.img ?? null,
        folderId: created._source?.folder ?? null,
      },
    } satisfies Envelope<unknown>;
  });
}

async function importFromCompendium(
  input: Extract<ItemDirectoryToolInputType, { action: 'import-from-compendium' }>,
): Promise<Envelope<unknown>> {
  validateGMAccess();

  return wrappedWrite('item-directory.import-from-compendium', async () => {
    const pack: any = (game.packs as any)?.get(input.packId);
    if (!pack) {
      throw new Error(`ITEM_PACK_NOT_FOUND: no compendium pack with id "${input.packId}"`);
    }

    // game.items.importFromCompendium is the canonical path (runs WorldCollection.fromCompendium).
    // Signature: (pack, id, updateData?, options?): Promise<Item>.
    // Foundry v13 PRESERVES the source compendium _id on import (fromCompendium keepId default) —
    // so the imported world item id EQUALS input.itemId by design (cross-collection import, unlike
    // same-collection `duplicate` which re-keys). clearFolder:true drops the compendium folder FK,
    // which has no world counterpart (avoids dangling folder references on the imported item).
    const created: any = await (game.items as any).importFromCompendium(
      pack,
      input.itemId,
      input.updateData ?? {},
      { clearFolder: true },
    );

    if (!created) {
      throw new Error(
        `ITEM_IMPORT_FAILED: importFromCompendium returned null for pack "${input.packId}" id "${input.itemId}"`,
      );
    }

    // DP-16: confirm the imported item actually persisted in the world collection.
    // (created.id may equal input.itemId — that is the NORMAL v13 outcome, NOT a collision.)
    const fresh: any = (game.items as any)?.get(created.id);
    if (!fresh) {
      throw new Error(
        `ITEM_IMPORT_FAILED: imported item id "${created.id}" did not persist in game.items (pack "${input.packId}")`,
      );
    }

    notify.created('item', created.name, {
      summary: `imported from ${input.packId}`,
      uuid: (created as any).uuid,
    });

    return {
      success: true,
      data: {
        id: created.id,
        name: created.name,
        type: created.type,
        packId: input.packId,
        compendiumItemId: input.itemId,
        idMatchesCompendium: created.id === input.itemId,
        img: created.img ?? null,
        folderId: created._source?.folder ?? null,
      },
    } satisfies Envelope<unknown>;
  });
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

export async function dispatchItemDirectory(data: unknown): Promise<Envelope<unknown>> {
  let input: ItemDirectoryToolInputType;
  try {
    input = ItemDirectoryToolInput.parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  validateGMAccess();

  if (!game.items) {
    throw new Error('Foundry state not ready: game.items unavailable');
  }

  switch (input.action) {
    case 'list':
      return listWorldItems(input);
    case 'get':
      return getWorldItem(input);
    case 'search':
      return searchWorldItems(input);
    case 'duplicate':
      return duplicateWorldItem(input);
    case 'import-from-compendium':
      return importFromCompendium(input);
  }
}
