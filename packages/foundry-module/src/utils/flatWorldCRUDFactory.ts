// Phase 8 mcp_crud_expansion — flatWorldCRUDFactory<T>: top-level WORLD doc CRUD
// (Macro → game.macros; Cards → game.cards; Folder → game.folders, etc.).
//
// SIBLING to worldCRUDFactory.ts. The world factory handles parent-embedded
// children (Playlist → PlaylistSound). This flat factory handles top-level
// docs that live directly under a `game.<collectionKey>` collection with no
// embedded children — `Macro.create(payload)` returns the doc; `game.macros.get(id)`
// reads it; `doc.delete()` removes it.
//
// We INTENTIONALLY do not extend worldCRUDFactory by parameterizing away its
// parent resolver — that path was evaluated (Option A) and rejected for
// regression risk on the live PlaylistSound consumer. Sibling factory is
// Option B from phase8_pre_plan §H Q3.
//
// Shared utilities (validateGMAccess, deepStripUndefined, Envelope) are
// IMPORTED from worldCRUDFactory.ts — never duplicated. The only shape
// difference is the document resolver and the absence of parent context in
// formatter/notify callbacks.
//
// **DP-15 / CCR-Envelope-Consumer**: factory exposes typed Envelope<T> shapes
// via generics. No `<any>` on the response side.
//
// **DP-16 / F08**: scalar post-write comparison reads `(persisted._source as any)?.[field]`
// — never the derived getter. `dp16SkipFields` lets the consumer opt fragile
// fields (e.g. `command`, `flags`) out of the equality check.
//
// **BUG-075**: `requestedChanges = { ...input.changes }` snapshot captured
// BEFORE the mutating `.update()` call.

import { z } from 'zod';
import { wrappedWrite } from '../transaction-manager.js';
import { notify, type NotifyKind } from '../notify.js';
import {
  validateGMAccess,
  deepStripUndefined,
  type Envelope,
} from './worldCRUDFactory.js';

// Re-export the shared envelope types so consumers don't need to import
// from worldCRUDFactory.ts directly (keeps the import surface clean).
export type { Envelope, EnvelopeOK, EnvelopeErr } from './worldCRUDFactory.js';
export { validateGMAccess, deepStripUndefined };

// ── Factory config interface ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface FlatWorldFactoryConfig<_TCreate, TUpdate, TViewModel, TListItem> {
  /** Foundry doc type name, e.g. 'Macro' / 'Cards' / 'Folder'. Singular, capital. Used for the `globalThis[documentName].create()` call. */
  documentName: string;
  /** lowercase singular for error messages and notify titles, e.g. 'macro' / 'cards' / 'folder'. */
  documentLabel: string;
  /** Key on `game` for the world-level collection, e.g. 'macros' / 'cards' / 'folders'. */
  collectionKey: string;
  /** Input field name carrying the doc id for update/delete/get, e.g. 'macroId' / 'cardsId'. */
  idField: keyof TUpdate & string;
  /** GM gate on get/list reads. */
  gmGateReads: boolean;
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
  /**
   * Additional fields to skip in DP-16 post-write verification.
   *
   * NOTE: `'flags'` is ALWAYS skipped unconditionally inside the factory (see the
   * `skip` Set construction in the update handler — `new Set(['flags', ...dp16SkipFields])`).
   * Do NOT include `'flags'` in this array; the inclusion is redundant and misleads
   * future consumers into thinking the skip is opt-in.
   *
   * Use this for handler-specific fields that need to be excluded — typically:
   * nested objects (`speaker`, `system`), HTML content (`content`, `flavor`),
   * or any field where Foundry's persisted value diverges from the requested value
   * after a normalising getter / setter.
   */
  dp16SkipFields: string[];
  /** Build the view model for create/update/get responses. (no parent arg — flat) */
  formatter: (doc: any) => TViewModel;
  /** Build the list-item shape for list responses. (no parent arg — flat) */
  listItemFormatter: (doc: any) => TListItem;
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
  /** NotifyKind for this doc-type's notify.* calls. */
  notifyKind: NotifyKind;
  /** Notify-title builder. Receives the persisted doc; returns the toast title. */
  formatNotifyTitle?: (doc: any) => string;
  /** Notify-summary builder. Receives the parsed input (post-validation); returns summary text. (no parent arg — flat) */
  formatNotifySummary?: (input: any) => string;
  /** Default list pageSize when not specified. Default 20. */
  defaultPageSize?: number;
  /** Optional pre-create transform. Default: identity. (no parent arg — flat) */
  preCreateTransform?: (payload: any) => any;
  /** Optional pre-update transform applied to changes before .update(). (no parent arg — flat) */
  preUpdateTransform?: (changes: Record<string, any>) => Record<string, any>;
  /** Optional response-shape overrides. */
  responseBuilders?: {
    create?: (ctx: { doc: any; requestedChanges: Record<string, unknown> }) => Record<string, any>;
    update?: (ctx: { doc: any; requestedChanges: Record<string, unknown>; changedFields: string[] }) => Record<string, any>;
    delete?: (ctx: { deletedId: string; remainingCount: number; preDeleteAudit?: Record<string, unknown> }) => Record<string, any>;
    listBare?: (ctx: { items: any[]; total: number }) => Record<string, any>;
    listPaginated?: (ctx: {
      items: any[];
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    }) => Record<string, any>;
    listCount?: (ctx: { total: number; filterApplied: boolean | string | null; page?: number | undefined; pageSize?: number | undefined }) => Record<string, any>;
  };
  /** For docs that always paginate (no bare variant). Default false. */
  listAlwaysPaginated?: boolean;
  /**
   * Optional pre-delete audit hook. Runs BEFORE `doc.delete()`. Returned
   * object is forwarded to `responseBuilders.delete` via `preDeleteAudit`.
   * Use for WARN-ONLY orphan-reference scans (Phase 8: hotbarRefs + regionBehaviorRefs).
   */
  preDeleteAudit?: (doc: any) => Record<string, unknown>;
}

// ── Strict-parse helper ─────────────────────────────────────────────────────

function strictParse<T>(schema: z.ZodSchema, data: unknown, useStrict: boolean): T {
  const target = useStrict && 'strict' in schema && typeof (schema as any).strict === 'function'
    ? (schema as any).strict()
    : schema;
  return target.parse(data ?? {}) as T;
}

// ── Factory exports ─────────────────────────────────────────────────────────

export interface CreatedFlatWorldCRUDHandlers<TCreate, TUpdate, TViewModel, TListItem> {
  create: (data: unknown) => Promise<Envelope<any>>;
  update: (data: unknown) => Promise<Envelope<any>>;
  delete: (data: unknown) => Promise<Envelope<any>>;
  get: (data: unknown) => Promise<Envelope<any>>;
  list: (data: unknown) => Promise<Envelope<any>>;
  dispatch: (data: unknown) => Promise<Envelope<any>>;
  config: FlatWorldFactoryConfig<TCreate, TUpdate, TViewModel, TListItem>;
}

export function createFlatWorldDocCRUDHandlers<
  TCreate extends Record<string, any>,
  TUpdate extends Record<string, any> & { changes: Record<string, any> },
  TViewModel,
  TListItem,
>(
  config: FlatWorldFactoryConfig<TCreate, TUpdate, TViewModel, TListItem>,
): CreatedFlatWorldCRUDHandlers<TCreate, TUpdate, TViewModel, TListItem> {
  const {
    documentName,
    documentLabel,
    collectionKey,
    idField,
    gmGateReads,
    schemas,
    dp16SkipFields,
    formatter,
    listItemFormatter,
    applyListFilters,
    isFilterApplied,
    responseKeys,
    notifyKind,
    defaultPageSize = 20,
    preCreateTransform,
    preDeleteAudit,
  } = config;
  const useStrictParse = config.strictParse ?? true;
  const listAlwaysPaginated = config.listAlwaysPaginated ?? false;
  const responseBuilders = config.responseBuilders ?? {};
  const formatTitle = config.formatNotifyTitle
    ?? ((doc: any) => `${capitalize(documentLabel)} "${doc?.name ?? '(unnamed)'}"`);
  const formatSummary = config.formatNotifySummary
    ?? ((_input: any) => `${documentLabel}`);

  const errorTag = documentLabel.toUpperCase().replace(/[-\s]+/g, '_');
  const denyMessage = (op: string) =>
    `Access denied: ${op}${capitalize(documentLabel)} requires GM`;

  function getCollection(): any {
    const c = (game as any)[collectionKey];
    if (!c || typeof c.get !== 'function') {
      throw new Error(
        `${errorTag}_COLLECTION_NOT_FOUND: game.${collectionKey} is undefined or not a collection`,
      );
    }
    return c;
  }

  function getDocOrThrow(docId: string): any {
    const doc = getCollection().get(docId);
    if (!doc) {
      throw new Error(`${errorTag}_NOT_FOUND: no ${documentLabel} with id "${docId}"`);
    }
    return doc;
  }

  // ── 1. create ────────────────────────────────────────────────────────────
  async function create(data: unknown): Promise<Envelope<any>> {
    const gate = validateGMAccess();
    if (!gate.allowed) return { success: false, error: denyMessage('create') };

    const input = strictParse<TCreate>(schemas.create, data, useStrictParse);

    // BUG-075: snapshot BEFORE Foundry mutates the payload.
    const { action: _action, ...rest } = input as any;
    const requestedChanges = { ...rest };

    return wrappedWrite(`${documentLabel}.create${capitalize(documentLabel)}`, async () => {
      const raw = deepStripUndefined({ ...rest });
      const payload = preCreateTransform ? preCreateTransform(raw) : raw;
      const DocClass = (globalThis as any)[documentName];
      if (!DocClass || typeof DocClass.create !== 'function') {
        throw new Error(
          `${errorTag}_DOC_CLASS_NOT_FOUND: globalThis.${documentName} is undefined or not a Document class`,
        );
      }
      const created = await DocClass.create(payload);
      if (!created) {
        throw new Error(
          `${errorTag}_WRITE_NOT_PERSISTED: ${documentName}.create returned empty`,
        );
      }

      // DP-16 post-verify: re-read from collection.
      const persisted = getDocOrThrow(created.id);

      notify.created(
        notifyKind,
        formatTitle(persisted),
        { summary: formatSummary(input) },
      );

      return {
        success: true as const,
        data: buildCreateResponse(persisted, requestedChanges),
      };
    });
  }

  // ── 2. update ────────────────────────────────────────────────────────────
  async function update(data: unknown): Promise<Envelope<any>> {
    const gate = validateGMAccess();
    if (!gate.allowed) return { success: false, error: denyMessage('update') };

    const input = strictParse<TUpdate>(schemas.update, data, useStrictParse);
    const docId = input[idField] as string;
    const doc = getDocOrThrow(docId);

    // BUG-075: snapshot BEFORE the mutating call.
    const requestedChanges = { ...input.changes };
    const changedFields = Object.keys(requestedChanges);

    return wrappedWrite(`${documentLabel}.update${capitalize(documentLabel)}`, async () => {
      const massagedChanges = config.preUpdateTransform
        ? config.preUpdateTransform(input.changes)
        : input.changes;
      await doc.update(massagedChanges);

      // DP-16 post-verify: re-read + F08 _source compare.
      const persisted = getDocOrThrow(docId);
      // 'flags' is always skipped unconditionally — see FlatWorldFactoryConfig.dp16SkipFields JSDoc.
      const skip = new Set<string>(['flags', ...dp16SkipFields]);

      for (const [field, requestedValue] of Object.entries(requestedChanges)) {
        if (skip.has(field)) continue;
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
        data: buildUpdateResponse(persisted, requestedChanges, changedFields),
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
    const docId = input[idField] as string;
    const doc = getDocOrThrow(docId);

    return wrappedWrite(`${documentLabel}.delete${capitalize(documentLabel)}`, async () => {
      // Pre-delete audit (WARN-ONLY orphan-ref scan for Phase 8) runs INSIDE the
      // wrappedWrite envelope so audit-side throws are wrapped in the same error-
      // handling envelope as the delete itself (defense-in-depth, Phase 6 hardening).
      const preDeleteAuditResult = preDeleteAudit ? preDeleteAudit(doc) : undefined;

      await doc.delete();

      // DP-16 post-verify: confirm removal.
      const stillPresent = getCollection().get(docId);
      if (stillPresent) {
        throw new Error(
          `${errorTag}_WRITE_NOT_PERSISTED: ${documentName} "${docId}" still present after delete`,
        );
      }

      notify.deleted(notifyKind, `${capitalize(documentLabel)} ${docId}`);

      const sizeAfter = getCollection().size ?? 0;
      return {
        success: true as const,
        data: buildDeleteResponse(docId, sizeAfter, preDeleteAuditResult),
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
    const docId = input[idField] as string;
    const doc = getDocOrThrow(docId);

    return {
      success: true,
      data: buildGetResponse(doc),
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

    const allDocs: any[] = (getCollection().contents as any[] | undefined) ?? [];

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
        data: buildListPaginatedResponse(paged, total, page, pageSize, pageCount),
      };
    }

    // Bare list
    return {
      success: true,
      data: buildListBareResponse(filtered),
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
  function buildCreateResponse(persisted: any, requestedChanges: Record<string, unknown>) {
    if (responseBuilders.create) {
      return { success: true, ...responseBuilders.create({ doc: persisted, requestedChanges }) };
    }
    return {
      success: true,
      [responseKeys.viewModel]: formatter(persisted),
      requestedChanges,
    };
  }

  function buildUpdateResponse(
    persisted: any,
    requestedChanges: Record<string, unknown>,
    changedFields: string[],
  ) {
    if (responseBuilders.update) {
      return {
        success: true,
        ...responseBuilders.update({ doc: persisted, requestedChanges, changedFields }),
      };
    }
    return {
      success: true,
      [responseKeys.viewModel]: formatter(persisted),
      requestedChanges,
      changedFields,
    };
  }

  function buildDeleteResponse(
    deletedId: string,
    remainingCount: number,
    preDeleteAuditResult: Record<string, unknown> | undefined,
  ) {
    if (responseBuilders.delete) {
      const deleteCtx: { deletedId: string; remainingCount: number; preDeleteAudit?: Record<string, unknown> } = {
        deletedId,
        remainingCount,
      };
      if (preDeleteAuditResult !== undefined) deleteCtx.preDeleteAudit = preDeleteAuditResult;
      return {
        success: true,
        ...responseBuilders.delete(deleteCtx),
      };
    }
    return {
      success: true,
      deletedId,
      [responseKeys.remainingCount]: remainingCount,
      ...(preDeleteAuditResult ?? {}),
    };
  }

  function buildGetResponse(doc: any) {
    return {
      success: true,
      [responseKeys.viewModel]: formatter(doc),
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
          items: paged.map((d) => listItemFormatter(d)),
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
      [responseKeys.listArray]: paged.map((d) => listItemFormatter(d)),
    };
  }

  function buildListBareResponse(items: any[]) {
    if (responseBuilders.listBare) {
      return {
        success: true,
        ...responseBuilders.listBare({
          items: items.map((d) => listItemFormatter(d)),
          total: items.length,
        }),
      };
    }
    return {
      success: true,
      [responseKeys.listArray]: items.map((d) => listItemFormatter(d)),
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
