// Phase 7 mcp_crud_expansion — worldCRUDFactory<T>: embedded-doc CRUD on a
// WORLD-LEVEL parent (Playlist → PlaylistSound, Cards → Card, etc.).
//
// Sibling to embeddedCRUDFactory.ts. Both factories share the same dispatcher,
// validateGMAccess, deepStripUndefined, DP-16 _source post-verify pattern, and
// BUG-075 snapshot semantics — the only difference is the PARENT resolver.
//
// The embedded sibling factory hardcodes the scene-parent resolver from the
// world scene collection. This world factory parameterizes the resolver:
//
//   getParentOrThrow(parentCollectionKey, parentId)
//                    └─ e.g. 'playlists' ─┘ └─ e.g. 'abc123def...' ─┘
//
// This unlocks Phase 8 (Macro → game.macros) and Phase 9 (Card → game.cards.*)
// reuse without a fresh-cut factory.
//
// WORLD-CRUD-FACTORY v1
//
// **DP-16 / F08** (Phase 5 in-validate lesson): scalar comparison uses
// `(persisted._source as any)?.[field]`, NEVER `(persisted as any)[field]`.
// The latter returns Foundry-derived getters that fail raw-value compare.
//
// **BUG-075** (Phase 3 snapshot lesson): `requestedChanges = { ...input.changes }`
// is captured BEFORE the mutating `.update()` call — Foundry may mutate the
// payload object during processing.
//
// **DP-15 / CCR-Envelope-Consumer**: factory exposes typed Envelope<T> shapes
// via generics. No `<any>` on the response side. Per-handler view-model and
// list-item types are provided through the FactoryConfig generics.
//
// **Phase 7 — no scene tracking**: world-level writes do NOT pass `sceneId` to
// wrappedWrite. Phase 6.3 BUG-081 race-guard tracking is scene-only; world
// docs don't participate.

import { z } from 'zod';
import { wrappedWrite } from '../transaction-manager.js';
import { notify, type NotifyKind } from '../notify.js';

// ── Shared envelope types ───────────────────────────────────────────────────
export type EnvelopeOK<T> = { success: true; data: T };
export type EnvelopeErr = { success: false; error: string };
export type Envelope<T> = EnvelopeOK<T> | EnvelopeErr;

// ── Shared utilities ────────────────────────────────────────────────────────
// Re-exported from embeddedCRUDFactory's local copies. Kept duplicate-free at the
// usage-site level (callers import either factory, not both helpers directly).

export function validateGMAccess(): { allowed: boolean } {
  if (!(game as any).user?.isGM) return { allowed: false };
  return { allowed: true };
}

export function deepStripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(deepStripUndefined) as any;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      if (v === undefined) continue;
      out[k] = deepStripUndefined(v);
    }
    return out as any;
  }
  return value;
}

/**
 * Resolve a world-level parent document by collection key + id.
 *
 * @param collectionKey  Key on `game` for the world-level collection (e.g. 'playlists', 'macros', 'cards').
 * @param parentId       The parent document's id.
 *
 * @throws PARENT_COLLECTION_NOT_FOUND if `game[collectionKey]` is undefined.
 * @throws PARENT_NOT_FOUND if the collection exists but the id is missing.
 */
export function getParentOrThrow(collectionKey: string, parentId: string): any {
  const collection = (game as any)[collectionKey];
  if (!collection || typeof collection.get !== 'function') {
    throw new Error(
      `PARENT_COLLECTION_NOT_FOUND: game.${collectionKey} is undefined or not a collection`,
    );
  }
  const parent = collection.get(parentId);
  if (!parent) {
    throw new Error(`PARENT_NOT_FOUND: no game.${collectionKey} entry with id "${parentId}"`);
  }
  return parent;
}

/**
 * Resolve an embedded document inside a parent doc by collection name + id.
 * Same shape as utils/getEmbeddedOrThrow but parent-agnostic error wording.
 */
export function getEmbeddedFromParentOrThrow<T = unknown>(
  parent: unknown,
  collectionName: string,
  embeddedId: string,
  docType: string,
  parentLabel: string,
): T {
  if (!parent || typeof parent !== 'object') {
    throw new Error(
      `PARENT_NOT_A_DOCUMENT: cannot read collection "${collectionName}" from non-object ${parentLabel}`,
    );
  }
  const collection = (parent as Record<string, unknown>)[collectionName];
  if (!collection || typeof (collection as { get?: unknown }).get !== 'function') {
    throw new Error(
      `COLLECTION_NOT_FOUND: ${parentLabel} has no "${collectionName}" collection`,
    );
  }
  const doc = (collection as { get(id: string): unknown }).get(embeddedId);
  if (!doc) {
    throw new Error(
      `${docType.toUpperCase()}_NOT_FOUND: no ${docType} with id "${embeddedId}" in ${parentLabel}.${collectionName}`,
    );
  }
  return doc as T;
}

// ── Factory config interface ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface WorldFactoryConfig<_TCreate, TUpdate, TViewModel, TListItem> {
  /** Foundry doc type name, e.g. 'PlaylistSound' / 'Card' / 'Macro'. Singular, capital. */
  documentName: string;
  /** lowercase singular for error messages, e.g. 'playlist-sound' / 'card'. */
  documentLabel: string;
  /** Embedded collection accessor name on the parent doc, e.g. 'sounds' / 'cards' / 'pages'. */
  collection: string;
  /** Key on `game` for the world-level parent collection, e.g. 'playlists' / 'cards' / 'macros'. */
  parentCollectionKey: string;
  /** Input field name carrying the parent id, e.g. 'playlistId' / 'cardsId'. */
  parentIdField: string;
  /** lowercase singular for the parent for messages, e.g. 'playlist' / 'cards-deck'. */
  parentLabel: string;
  /** Input field name for update/delete/get: 'soundId' / 'cardId'. */
  idField: keyof TUpdate & string;
  /** GM gate on get/list reads. */
  gmGateReads: boolean;
  /** Delete API choice. */
  deleteApi: 'doc.delete' | 'parent.deleteEmbeddedDocuments';
  /** Zod schemas — strict() is applied internally by the factory's parse wrappers. */
  schemas: {
    create: z.ZodSchema;
    update: z.ZodSchema;
    delete: z.ZodSchema;
    get: z.ZodSchema;
    list: z.ZodSchema;
    toolInput: z.ZodSchema;
  };
  /** Whether schemas should be parsed via .strict(). Default true. */
  strictParse?: boolean;
  /** Field names to skip in DP-16 scalar comparison loop. Always skips 'flags'. */
  dp16SkipFields: string[];
  /** Build the view model for create/update/get responses. */
  formatter: (parent: any, doc: any) => TViewModel;
  /** Build the list-item shape for list responses. */
  listItemFormatter: (parent: any, doc: any) => TListItem;
  /** Apply per-handler list filters. Default: no filtering. */
  applyListFilters?: (input: any, items: any[]) => any[];
  /** Determine if any filter was applied (for countOnly response). */
  isFilterApplied?: (input: any) => boolean | string | null;
  /** Response shape keys. */
  responseKeys: {
    viewModel: string;
    listArray: string;
    remainingCount: string;
  };
  /** NotifyKind for this doc-type's notify.* calls (explicit to avoid cast drift). */
  notifyKind: NotifyKind;
  /** Notify-title builder. Receives the persisted doc; returns the toast title. */
  formatNotifyTitle?: (doc: any) => string;
  /** Notify-summary builder. Receives the parsed input (post-validation); returns summary text. */
  formatNotifySummary?: (input: any) => string;
  /** Default list pageSize when not specified. Default 20. */
  defaultPageSize?: number;
  /** Optional pre-create transform. Default: identity. */
  preCreateTransform?: (parent: any, payload: any) => any;
  /** Optional pre-update transform applied to changes before .update(). */
  preUpdateTransform?: (parent: any, changes: Record<string, any>) => Record<string, any>;
  /** Optional response-shape overrides — mirror embeddedCRUDFactory's responseBuilders. */
  responseBuilders?: {
    delete?: (ctx: { deletedId: string; parentId: string; remainingCount: number }) => Record<string, any>;
    listBare?: (ctx: { items: any[]; parent: any; total: number }) => Record<string, any>;
    listPaginated?: (ctx: {
      items: any[];
      parent: any;
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    }) => Record<string, any>;
    listCount?: (ctx: { total: number; filterApplied: boolean | string | null; page?: number | undefined; pageSize?: number | undefined }) => Record<string, any>;
  };
  /** For docs that always paginate (no bare variant). Default false. */
  listAlwaysPaginated?: boolean;
}

// ── Strict-parse helper ─────────────────────────────────────────────────────

function strictParse<T>(schema: z.ZodSchema, data: unknown, useStrict: boolean): T {
  const target = useStrict && 'strict' in schema && typeof (schema as any).strict === 'function'
    ? (schema as any).strict()
    : schema;
  return target.parse(data ?? {}) as T;
}

// ── Factory exports ─────────────────────────────────────────────────────────

export interface CreatedWorldCRUDHandlers<TCreate, TUpdate, TViewModel, TListItem> {
  create: (data: unknown) => Promise<Envelope<any>>;
  update: (data: unknown) => Promise<Envelope<any>>;
  delete: (data: unknown) => Promise<Envelope<any>>;
  get: (data: unknown) => Promise<Envelope<any>>;
  list: (data: unknown) => Promise<Envelope<any>>;
  dispatch: (data: unknown) => Promise<Envelope<any>>;
  config: WorldFactoryConfig<TCreate, TUpdate, TViewModel, TListItem>;
}

export function createWorldDocCRUDHandlers<
  TCreate extends Record<string, any>,
  TUpdate extends Record<string, any> & { changes: Record<string, any> },
  TViewModel,
  TListItem,
>(
  config: WorldFactoryConfig<TCreate, TUpdate, TViewModel, TListItem>,
): CreatedWorldCRUDHandlers<TCreate, TUpdate, TViewModel, TListItem> {
  const {
    documentName,
    documentLabel,
    collection,
    parentCollectionKey,
    parentIdField,
    parentLabel,
    idField,
    gmGateReads,
    deleteApi,
    schemas,
    dp16SkipFields,
    formatter,
    listItemFormatter,
    applyListFilters,
    isFilterApplied,
    responseKeys,
    defaultPageSize = 20,
    preCreateTransform,
  } = config;
  const useStrictParse = config.strictParse ?? true;
  const listAlwaysPaginated = config.listAlwaysPaginated ?? false;
  const responseBuilders = config.responseBuilders ?? {};
  const notifyKind = config.notifyKind;
  const formatTitle = config.formatNotifyTitle ?? ((doc: any) => `${capitalize(documentLabel)} "${doc?.name ?? '(unnamed)'}"`);
  const formatSummary = config.formatNotifySummary ?? ((input: any) => `on ${parentLabel} ${input[parentIdField]}`);

  const errorTag = documentLabel.toUpperCase().replace(/-/g, '_');
  const denyMessage = (op: string) =>
    `Access denied: ${op}${capitalize(documentLabel)} requires GM`;

  // ── 1. create ────────────────────────────────────────────────────────────
  async function create(data: unknown): Promise<Envelope<any>> {
    const gate = validateGMAccess();
    if (!gate.allowed) return { success: false, error: denyMessage('create') };

    const input = strictParse<TCreate>(schemas.create, data, useStrictParse);
    const parentId = input[parentIdField] as string;
    const parent = getParentOrThrow(parentCollectionKey, parentId);

    // BUG-075: snapshot BEFORE Foundry mutates the payload.
    const { action: _action, ...restWithParent } = input as any;
    const { [parentIdField]: _parent, ...rest } = restWithParent;
    const requestedChanges = { ...rest };

    return wrappedWrite(`${documentLabel}.create${capitalize(documentLabel)}`, async () => {
      const raw = deepStripUndefined({ ...rest });
      const payload = preCreateTransform ? preCreateTransform(parent, raw) : raw;
      const created = await parent.createEmbeddedDocuments(documentName, [payload]);
      const doc = Array.isArray(created) ? created[0] : created;
      if (!doc) {
        throw new Error(
          `${errorTag}_WRITE_NOT_PERSISTED: createEmbeddedDocuments returned empty`,
        );
      }

      // DP-16 post-verify: re-read from parent collection.
      const persisted = getEmbeddedFromParentOrThrow<any>(
        parent,
        collection,
        doc.id,
        documentName,
        parentLabel,
      );

      notify.created(
        notifyKind,
        formatTitle(persisted),
        { summary: formatSummary(input) },
      );

      return {
        success: true as const,
        data: buildCreateResponse(parent, persisted, requestedChanges, parentId),
      };
    });
  }

  // ── 2. update ────────────────────────────────────────────────────────────
  async function update(data: unknown): Promise<Envelope<any>> {
    const gate = validateGMAccess();
    if (!gate.allowed) return { success: false, error: denyMessage('update') };

    const input = strictParse<TUpdate>(schemas.update, data, useStrictParse);
    const parentId = input[parentIdField] as string;
    const parent = getParentOrThrow(parentCollectionKey, parentId);
    const docId = input[idField] as string;
    const doc = getEmbeddedFromParentOrThrow<any>(parent, collection, docId, documentName, parentLabel);

    // BUG-075: snapshot BEFORE the mutating call.
    const requestedChanges = { ...input.changes };
    const changedFields = Object.keys(requestedChanges);

    return wrappedWrite(`${documentLabel}.update${capitalize(documentLabel)}`, async () => {
      const massagedChanges = config.preUpdateTransform
        ? config.preUpdateTransform(parent, input.changes)
        : input.changes;
      await doc.update(massagedChanges);

      // DP-16 post-verify: re-read via getEmbeddedFromParentOrThrow, then F08 _source compare.
      const persisted = getEmbeddedFromParentOrThrow<any>(
        parent,
        collection,
        docId,
        documentName,
        parentLabel,
      );
      const skip = new Set<string>(['flags', ...dp16SkipFields]);

      for (const [field, requestedValue] of Object.entries(requestedChanges)) {
        if (skip.has(field)) continue;
        // F08 mandatory: read `_source` (raw stored data) not the derived getter.
        const persistedValue = (persisted._source as any)?.[field];
        if (persistedValue !== requestedValue) {
          throw new Error(
            `${errorTag}_WRITE_NOT_PERSISTED: field "${field}" expected ${JSON.stringify(requestedValue)} ` +
              `but post-update _source value is ${JSON.stringify(persistedValue)}`,
          );
        }
      }

      notify.updated(
        notifyKind,
        `${capitalize(documentLabel)} ${docId}`,
        { summary: changedFields.join(', ') },
      );

      return {
        success: true as const,
        data: buildUpdateResponse(parent, persisted, requestedChanges, changedFields, parentId),
      };
    });
  }

  // ── 3. delete ────────────────────────────────────────────────────────────
  async function deleteOp(data: unknown): Promise<Envelope<any>> {
    const gate = validateGMAccess();
    if (!gate.allowed) return { success: false, error: denyMessage('delete') };

    const input = strictParse<Record<string, any>>(
      schemas.delete,
      data,
      useStrictParse,
    );
    const parentId = input[parentIdField] as string;
    const parent = getParentOrThrow(parentCollectionKey, parentId);
    const docId = input[idField] as string;
    const doc = getEmbeddedFromParentOrThrow<any>(parent, collection, docId, documentName, parentLabel);

    return wrappedWrite(`${documentLabel}.delete${capitalize(documentLabel)}`, async () => {
      if (deleteApi === 'doc.delete') {
        await doc.delete();
      } else {
        await parent.deleteEmbeddedDocuments(documentName, [docId]);
      }

      // DP-16 post-verify: confirm removal.
      const stillPresent = (parent as any)[collection]?.get?.(docId);
      if (stillPresent) {
        throw new Error(
          `${errorTag}_WRITE_NOT_PERSISTED: ${documentName} "${docId}" still present after delete`,
        );
      }

      notify.deleted(notifyKind, `${capitalize(documentLabel)} ${docId}`);

      const sizeAfter = (parent as any)[collection]?.size ?? 0;
      return {
        success: true as const,
        data: buildDeleteResponse(docId, parentId, sizeAfter),
      };
    });
  }

  // ── 4. get ───────────────────────────────────────────────────────────────
  async function get(data: unknown): Promise<Envelope<any>> {
    if (gmGateReads) {
      const gate = validateGMAccess();
      if (!gate.allowed) return { success: false, error: denyMessage('get') };
    }

    const input = strictParse<Record<string, any>>(
      schemas.get,
      data,
      useStrictParse,
    );
    const parentId = input[parentIdField] as string;
    const parent = getParentOrThrow(parentCollectionKey, parentId);
    const docId = input[idField] as string;
    const doc = getEmbeddedFromParentOrThrow<any>(parent, collection, docId, documentName, parentLabel);

    return {
      success: true,
      data: buildGetResponse(parent, doc),
    };
  }

  // ── 5. list ──────────────────────────────────────────────────────────────
  async function list(data: unknown): Promise<Envelope<any>> {
    if (gmGateReads) {
      const gate = validateGMAccess();
      if (!gate.allowed) return { success: false, error: denyMessage('list') };
    }

    const input = strictParse<{
      page?: number;
      pageSize?: number;
      countOnly?: boolean;
    } & Record<string, any>>(schemas.list, data, useStrictParse);

    const parentId = input[parentIdField] as string;
    const parent = getParentOrThrow(parentCollectionKey, parentId);

    const allDocs: any[] = ((parent as any)[collection]?.contents as any[] | undefined) ?? [];

    let filtered = allDocs;
    if (applyListFilters) {
      filtered = applyListFilters(input, allDocs);
    }
    const total = filtered.length;

    if (input.countOnly) {
      const filterApplied = isFilterApplied ? isFilterApplied(input) : false;
      return {
        success: true,
        data: buildListCountResponse(total, filterApplied, input.page, input.pageSize),
      };
    }

    // Pagination
    if (listAlwaysPaginated || input.page !== undefined || input.pageSize !== undefined) {
      const pageSize = input.pageSize ?? defaultPageSize;
      const page = input.page ?? 1;
      const pageCount = Math.max(1, Math.ceil(total / pageSize));
      const offset = (page - 1) * pageSize;
      const paged = filtered.slice(offset, offset + pageSize);
      return {
        success: true,
        data: buildListPaginatedResponse(parent, paged, total, page, pageSize, pageCount),
      };
    }

    // Bare list
    return {
      success: true,
      data: buildListBareResponse(parent, filtered),
    };
  }

  // ── 6. dispatch ──────────────────────────────────────────────────────────
  async function dispatch(data: unknown): Promise<Envelope<any>> {
    let input: any;
    try {
      input = schemas.toolInput.parse(data ?? {});
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Invalid input';
      throw new Error(`Invalid input: ${message}`);
    }

    switch (input.action) {
      case 'create':
        return create(input);
      case 'update':
        return update(input);
      case 'delete':
        return deleteOp(input);
      case 'get':
        return get(input);
      case 'list':
        return list(input);
      default:
        throw new Error(`Unknown ${documentLabel} action: ${input.action}`);
    }
  }

  // ── Response builders (closed-over config) ───────────────────────────────
  function buildCreateResponse(
    _parent: any,
    persisted: any,
    requestedChanges: Record<string, unknown>,
    parentId: string,
  ) {
    return {
      success: true,
      [parentIdField]: parentId,
      [responseKeys.viewModel]: formatter(_parent, persisted),
      requestedChanges,
    };
  }

  function buildUpdateResponse(
    _parent: any,
    persisted: any,
    requestedChanges: Record<string, unknown>,
    changedFields: string[],
    parentId: string,
  ) {
    return {
      success: true,
      [parentIdField]: parentId,
      [responseKeys.viewModel]: formatter(_parent, persisted),
      requestedChanges,
      changedFields,
    };
  }

  function buildDeleteResponse(deletedId: string, parentId: string, remainingCount: number) {
    if (responseBuilders.delete) {
      return { success: true, ...responseBuilders.delete({ deletedId, parentId, remainingCount }) };
    }
    return {
      success: true,
      deletedId,
      [parentIdField]: parentId,
      [responseKeys.remainingCount]: remainingCount,
    };
  }

  function buildGetResponse(parent: any, doc: any) {
    return {
      success: true,
      [responseKeys.viewModel]: formatter(parent, doc),
    };
  }

  function buildListCountResponse(
    total: number,
    filterApplied: boolean | string | null,
    page?: number,
    pageSize?: number,
  ) {
    if (responseBuilders.listCount) {
      return { success: true, ...responseBuilders.listCount({ total, filterApplied, page, pageSize }) };
    }
    return {
      success: true,
      total,
      filterApplied,
    };
  }

  function buildListPaginatedResponse(
    parent: any,
    paged: any[],
    total: number,
    page: number,
    pageSize: number,
    pageCount: number,
  ) {
    if (responseBuilders.listPaginated) {
      return {
        success: true,
        ...responseBuilders.listPaginated({
          items: paged.map((d) => listItemFormatter(parent, d)),
          parent,
          total,
          page,
          pageSize,
          pageCount,
        }),
      };
    }
    return {
      success: true,
      total,
      page,
      pageSize,
      pageCount,
      [responseKeys.listArray]: paged.map((d) => listItemFormatter(parent, d)),
    };
  }

  function buildListBareResponse(parent: any, items: any[]) {
    if (responseBuilders.listBare) {
      return {
        success: true,
        ...responseBuilders.listBare({
          items: items.map((d) => listItemFormatter(parent, d)),
          parent,
          total: items.length,
        }),
      };
    }
    return {
      success: true,
      [responseKeys.listArray]: items.map((d) => listItemFormatter(parent, d)),
    };
  }

  return {
    create,
    update,
    delete: deleteOp,
    get,
    list,
    dispatch,
    config,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
