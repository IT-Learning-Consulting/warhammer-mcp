// Phase 6.2 mcp_crud_expansion — embeddedCRUD<T> factory.
//
// Eliminates ~120 LOC of structurally-identical boilerplate per embedded-doc
// handler (validateGMAccess, deepStripUndefined, getSceneOrThrow, strict-parse
// wrappers, dispatcher switch, DP-16 post-verify loop, BUG-075 snapshot, etc.).
//
// Cohort retrofitted in Phase 6.2: light / sound / tile / template (R6.7 ≥48% each).
// Outliers (note / token / region) stay hand-rolled — see // FACTORY-EXEMPT: markers.
//
// **F08 mandatory** (Phase 5 in-validate fix): DP-16 scalar comparison uses
// `(persisted._source as any)?.[field]`, NEVER `(persisted as any)[field]`.
// The latter returns Foundry-derived objects (Color, TextureData, embedded
// FK getters) that `!== requestedString` on raw value compare — false-positive
// _WRITE_NOT_PERSISTED on multi-field updates. Only template.ts had the correct
// pattern pre-factory; 6/7 hand-rolled handlers had the antipattern.
// See [[feedback_mcp_post_write_verification]] + bugs_to_fix.md F08 entry.
//
// **BUG-069 typed-generic discipline** (CCR-Envelope-Consumer): no <any> on
// query<T> usages. Factory exposes typed Response shapes via generics.
//
// **Phase 6.3 forward-compat**: wrappedWrite call sites accept optional
// {sceneId} opt arg. transaction-manager extension lands in Phase 6.3 — until
// then, sceneId is forwarded but ignored.

import { z } from 'zod';
import { wrappedWrite } from '../transaction-manager.js';
import { getEmbeddedOrThrow } from './getEmbeddedOrThrow.js';
import { notify, type NotifyKind } from '../notify.js';

// ── Shared envelope types ───────────────────────────────────────────────────
export type EnvelopeOK<T> = { success: true; data: T };
export type EnvelopeErr = { success: false; error: string };
export type Envelope<T> = EnvelopeOK<T> | EnvelopeErr;

// ── Shared utility functions (extractable from 7 handlers — ~50 LOC dup) ────

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

// CORE-15 (mcp_code_quality_v2 Phase C2) — shallow top-level-only undefined-key strip. Distinct from
// deepStripUndefined above (recursive): this one mutates+returns the SAME object reference, matching
// the F04-prevention idiom at journal.ts/rolltable.ts call sites (payload built inline, stripped
// before createEmbeddedDocuments/update).
export function stripUndefined<T extends Record<string, any>>(obj: T): T {
  Object.keys(obj).forEach((k) => obj[k] === undefined && delete obj[k]);
  return obj;
}

export function getSceneOrThrow(sceneId: string): any {
  const scene = (game as any).scenes?.get(sceneId);
  if (!scene) throw new Error(`SCENE_NOT_FOUND: no Scene with id "${sceneId}"`);
  return scene;
}

// ── Factory config interface ────────────────────────────────────────────────

// Note: TCreate is reserved for future schema-narrowing hooks (preCreateTransform). Currently consumed via the Zod schema.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface FactoryConfig<_TCreate, TUpdate, TViewModel, TListItem> {
  /** Foundry doc type name, e.g. 'AmbientLight' / 'AmbientSound' / 'Tile' / 'MeasuredTemplate' */
  documentName: string;
  /** lowercase singular for error messages and operation labels, e.g. 'light' */
  documentLabel: string;
  /** Embedded collection name on Scene, e.g. 'lights' / 'sounds' / 'tiles' / 'templates' */
  collection: string;
  /** Input field name for update/delete/get: 'lightId' / 'soundId' / 'tileId' / 'templateId' */
  idField: keyof TUpdate & string;
  /** GM gate on get/list reads. light + sound = true; tile + template = false */
  gmGateReads: boolean;
  /** Delete API choice. light/sound use scene.deleteEmbeddedDocuments; template uses doc.delete */
  deleteApi: 'doc.delete' | 'scene.deleteEmbeddedDocuments';
  /** Zod schemas — strict() is applied internally by the factory's parse wrappers */
  schemas: {
    create: z.ZodSchema;
    update: z.ZodSchema;
    delete: z.ZodSchema;
    get: z.ZodSchema;
    list: z.ZodSchema;
    toolInput: z.ZodSchema;
  };
  /** Whether schemas should be parsed via .strict() (light/sound/tile/template = true; note/token/region = false because of discriminated-union .parse) */
  strictParse?: boolean;
  /** Field names to skip in DP-16 scalar comparison loop. Always skips 'flags'. */
  dp16SkipFields: string[];
  /** Build the view model for create/update/get responses */
  formatter: (scene: any, doc: any) => TViewModel;
  /** Build the list-item shape for list responses */
  listItemFormatter: (scene: any, doc: any) => TListItem;
  /** Apply per-handler list filters. Default: no filtering. */
  applyListFilters?: (input: any, items: any[]) => any[];
  /** Determine if any filter was applied (for countOnly response). Returns boolean, string, or null per handler convention. */
  isFilterApplied?: (input: any) => boolean | string | null;
  /** Response shape keys */
  responseKeys: {
    /** Key for create/update/get's view model. e.g. 'light' for {success, light: {...}} */
    viewModel: string;
    /** Key for list array. e.g. 'lights' for {success, lights: [...]} */
    listArray: string;
    /** Key for delete's remaining count. e.g. 'remainingLights' */
    remainingCount: string;
  };
  /** NotifyKind for notify.created/updated/deleted calls. */
  notifyKind: NotifyKind;
  /** Default list pageSize when not specified by caller. Default 20. */
  defaultPageSize?: number;
  /** Optional pre-create transform — e.g. for note B5 FK resolution. Default: identity. */
  preCreateTransform?: (scene: any, payload: any) => any;
  /**
   * Optional pre-update transform — applied to changes before `.update()`.
   * Use for B3 deepStripUndefined guards (tile.video.volume silent-zero defense)
   * or any handler-specific massaging.
   */
  preUpdateTransform?: (scene: any, changes: Record<string, any>) => Record<string, any>;
  /**
   * Optional response-shape overrides. When omitted, factory uses the canonical
   * shape derived from responseKeys. Use these to preserve a handler's existing
   * non-standard response shape (e.g. tile + template omit pageCount; tile's
   * delete has no remainingCount; tile's countOnly returns {tiles:[], total, page, pageSize, countOnly:true}).
   */
  responseBuilders?: {
    delete?: (ctx: { deletedId: string; sceneId: string; remainingCount: number }) => Record<string, any>;
    listBare?: (ctx: { items: any[]; scene: any; total: number }) => Record<string, any>;
    listPaginated?: (ctx: {
      items: any[];
      scene: any;
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    }) => Record<string, any>;
    listCount?: (ctx: { total: number; filterApplied: boolean | string | null; page?: number | undefined; pageSize?: number | undefined }) => Record<string, any>;
  };
  /** For handlers like template where list mode always paginates (no bare variant). Default false. */
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

export interface CreatedCRUDHandlers<TCreate, TUpdate, TViewModel, TListItem> {
  create: (data: unknown) => Promise<Envelope<any>>;
  update: (data: unknown) => Promise<Envelope<any>>;
  delete: (data: unknown) => Promise<Envelope<any>>;
  get: (data: unknown) => Promise<Envelope<any>>;
  list: (data: unknown) => Promise<Envelope<any>>;
  dispatch: (data: unknown) => Promise<Envelope<any>>;
  /** Direct access to config (rarely needed; handler tests may inspect.) */
  config: FactoryConfig<TCreate, TUpdate, TViewModel, TListItem>;
}

export function createEmbeddedCRUDHandlers<
  TCreate extends { sceneId: string },
  TUpdate extends { sceneId: string; changes: Record<string, any> },
  TViewModel,
  TListItem,
>(
  config: FactoryConfig<TCreate, TUpdate, TViewModel, TListItem>,
): CreatedCRUDHandlers<TCreate, TUpdate, TViewModel, TListItem> {
  const {
    documentName,
    documentLabel,
    collection,
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
    notifyKind,
    defaultPageSize = 20,
    preCreateTransform,
  } = config;
  const useStrictParse = config.strictParse ?? true;
  const listAlwaysPaginated = config.listAlwaysPaginated ?? false;
  const responseBuilders = config.responseBuilders ?? {};

  const errorTag = documentLabel.toUpperCase();
  const denyMessage = (op: string) =>
    `Access denied: ${op}${capitalize(documentLabel)} requires GM`;

  // ── 1. create ────────────────────────────────────────────────────────────
  async function create(data: unknown): Promise<Envelope<any>> {
    const gate = validateGMAccess();
    if (!gate.allowed) return { success: false, error: denyMessage('create') };

    const input = strictParse<TCreate>(schemas.create, data, useStrictParse);
    const scene = getSceneOrThrow(input.sceneId);

    // BUG-075: snapshot BEFORE Foundry mutates the payload.
    const { action: _action, sceneId: _sceneId, ...rest } = input as any;
    const requestedChanges: Record<string, unknown> = { ...rest };

    return wrappedWrite(`${documentLabel}.create${capitalize(documentLabel)}`, async () => {
      const raw = deepStripUndefined({ ...rest });
      const payload = preCreateTransform ? preCreateTransform(scene, raw) : raw;
      const created = await scene.createEmbeddedDocuments(documentName, [payload]);
      const doc = Array.isArray(created) ? created[0] : created;
      if (!doc) {
        throw new Error(
          `${errorTag}_WRITE_NOT_PERSISTED: createEmbeddedDocuments returned empty`,
        );
      }

      // DP-16 post-verify: re-read from scene collection.
      // BUG-363(d): use the friendly label (Template/Light/Sound) for the *_NOT_FOUND token so it
      // matches the errorTag prefix, instead of the raw Foundry class name (MeasuredTemplate/AmbientLight).
      const persisted = getEmbeddedOrThrow<any>(scene, collection, doc.id, capitalize(documentLabel));

      // PARITY-003: field-compare loop mirrors update:261-274 (F08 _source read).
      // Skip flags + family-specific dp16SkipFields (normalization / deep objects).
      // preCreateTransform is unused by all 4 families (template/light/tile/sound) —
      // safe to compare requestedChanges (pre-transform) against persisted._source.
      const createSkip = new Set<string>(['flags', ...dp16SkipFields]);
      const source = (persisted._source as any) ?? {};
      for (const [field, requestedValue] of Object.entries(requestedChanges)) {
        if (createSkip.has(field)) continue;
        // BUG-290: skip fields the document schema doesn't persist (absent from
        // _source) — comparing against undefined would always be a false positive.
        if (!(field in source)) continue;
        const persistedValue = source[field];
        if (persistedValue !== requestedValue) {
          throw new Error(
            `${errorTag}_WRITE_NOT_PERSISTED: field "${field}" expected ${JSON.stringify(requestedValue)} ` +
              `but post-create _source value is ${JSON.stringify(persistedValue)}`,
          );
        }
      }

      notify.created(
        notifyKind,
        `${capitalize(documentLabel)} @(${persisted.x ?? 0},${persisted.y ?? 0})`,
        { summary: `on scene ${input.sceneId}` },
      );

      return {
        success: true as const,
        data: buildCreateResponse(scene, persisted, requestedChanges),
      };
    }, { sceneId: input.sceneId });
  }

  // ── 2. update ────────────────────────────────────────────────────────────
  async function update(data: unknown): Promise<Envelope<any>> {
    const gate = validateGMAccess();
    if (!gate.allowed) return { success: false, error: denyMessage('update') };

    const input = strictParse<TUpdate>(schemas.update, data, useStrictParse);
    const scene = getSceneOrThrow(input.sceneId);
    const docId = (input as any)[idField] as string;
    const doc = getEmbeddedOrThrow<any>(scene, collection, docId, capitalize(documentLabel));

    // BUG-075: snapshot BEFORE the mutating call.
    const requestedChanges: Record<string, unknown> = { ...input.changes };
    const changedFields = Object.keys(requestedChanges);

    return wrappedWrite(`${documentLabel}.update${capitalize(documentLabel)}`, async () => {
      const massagedChanges = config.preUpdateTransform
        ? config.preUpdateTransform(scene, input.changes)
        : input.changes;
      await doc.update(massagedChanges);

      // DP-16 post-verify: re-read via getEmbeddedOrThrow, then F08 _source compare.
      const persisted = getEmbeddedOrThrow<any>(scene, collection, docId, documentName);
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
        data: buildUpdateResponse(scene, persisted, requestedChanges, changedFields),
      };
    }, { sceneId: input.sceneId });
  }

  // ── 3. delete ────────────────────────────────────────────────────────────
  async function deleteOp(data: unknown): Promise<Envelope<any>> {
    const gate = validateGMAccess();
    if (!gate.allowed) return { success: false, error: denyMessage('delete') };

    const input = strictParse<{ sceneId: string } & Record<string, any>>(
      schemas.delete,
      data,
      useStrictParse,
    );
    const scene = getSceneOrThrow(input.sceneId);
    const docId = input[idField] as string;
    const doc = getEmbeddedOrThrow<any>(scene, collection, docId, capitalize(documentLabel));

    return wrappedWrite(`${documentLabel}.delete${capitalize(documentLabel)}`, async () => {
      if (deleteApi === 'doc.delete') {
        await doc.delete();
      } else {
        await scene.deleteEmbeddedDocuments(documentName, [docId]);
      }

      // DP-16 post-verify: confirm removal.
      const stillPresent = (scene as any)[collection]?.get?.(docId);
      if (stillPresent) {
        throw new Error(
          `${errorTag}_WRITE_NOT_PERSISTED: ${documentName} "${docId}" still present after delete`,
        );
      }

      notify.deleted(
        notifyKind,
        `${capitalize(documentLabel)} ${docId}`,
      );

      const sizeAfter = (scene as any)[collection]?.size ?? 0;
      return {
        success: true as const,
        data: buildDeleteResponse(docId, input.sceneId, sizeAfter),
      };
    }, { sceneId: input.sceneId });
  }

  // ── 4. get ───────────────────────────────────────────────────────────────
  async function get(data: unknown): Promise<Envelope<any>> {
    if (gmGateReads) {
      const gate = validateGMAccess();
      if (!gate.allowed) return { success: false, error: denyMessage('get') };
    }

    const input = strictParse<{ sceneId: string } & Record<string, any>>(
      schemas.get,
      data,
      useStrictParse,
    );
    const scene = getSceneOrThrow(input.sceneId);
    const docId = input[idField] as string;
    const doc = getEmbeddedOrThrow<any>(scene, collection, docId, capitalize(documentLabel));

    return {
      success: true,
      data: buildGetResponse(scene, doc),
    };
  }

  // ── 5. list ──────────────────────────────────────────────────────────────
  async function list(data: unknown): Promise<Envelope<any>> {
    if (gmGateReads) {
      const gate = validateGMAccess();
      if (!gate.allowed) return { success: false, error: denyMessage('list') };
    }

    const input = strictParse<{
      sceneId?: string;
      page?: number;
      pageSize?: number;
      countOnly?: boolean;
    } & Record<string, any>>(schemas.list, data, useStrictParse);

    const sceneId = input.sceneId ?? (game as any).scenes?.active?.id;
    if (!sceneId) {
      throw new Error('NO_ACTIVE_SCENE: no sceneId provided and no active scene found');
    }
    const scene = getSceneOrThrow(sceneId);

    const allDocs: any[] = ((scene as any)[collection]?.contents as any[] | undefined) ?? [];

    let filtered = allDocs;
    if (applyListFilters) {
      filtered = applyListFilters(input, allDocs);
    }
    const total = filtered.length;

    if (input.countOnly) {
      // BUG-435: default to null (not false) so countOnly's filterApplied is uniformly string|null.
      const filterApplied = isFilterApplied ? isFilterApplied(input) : null;
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
        data: buildListPaginatedResponse(
          scene,
          paged,
          total,
          page,
          pageSize,
          pageCount,
        ),
      };
    }

    // Bare list
    return {
      success: true,
      data: buildListBareResponse(scene, filtered),
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
  function buildCreateResponse(scene: any, persisted: any, requestedChanges: Record<string, unknown>) {
    return {
      [responseKeys.viewModel]: formatter(scene, persisted),
      requestedChanges,
    };
  }

  function buildUpdateResponse(
    scene: any,
    persisted: any,
    requestedChanges: Record<string, unknown>,
    changedFields: string[],
  ) {
    return {
      [responseKeys.viewModel]: formatter(scene, persisted),
      requestedChanges,
      changedFields,
    };
  }

  function buildDeleteResponse(deletedId: string, sceneId: string, remainingCount: number) {
    if (responseBuilders.delete) {
      return { ...responseBuilders.delete({ deletedId, sceneId, remainingCount }) };
    }
    return {
      deletedId,
      sceneId,
      [responseKeys.remainingCount]: remainingCount,
    };
  }

  function buildGetResponse(scene: any, doc: any) {
    return {
      [responseKeys.viewModel]: formatter(scene, doc),
    };
  }

  function buildListCountResponse(
    total: number,
    filterApplied: boolean | string | null,
    page?: number,
    pageSize?: number,
  ) {
    if (responseBuilders.listCount) {
      return { ...responseBuilders.listCount({ total, filterApplied, page, pageSize }) };
    }
    return {
      total,
      filterApplied,
    };
  }

  function buildListPaginatedResponse(
    scene: any,
    paged: any[],
    total: number,
    page: number,
    pageSize: number,
    pageCount: number,
  ) {
    if (responseBuilders.listPaginated) {
      return {
        ...responseBuilders.listPaginated({
          items: paged.map((d) => listItemFormatter(scene, d)),
          scene,
          total,
          page,
          pageSize,
          pageCount,
        }),
      };
    }
    return {
      total,
      page,
      pageSize,
      pageCount,
      [responseKeys.listArray]: paged.map((d) => listItemFormatter(scene, d)),
    };
  }

  function buildListBareResponse(scene: any, items: any[]) {
    if (responseBuilders.listBare) {
      return {
        ...responseBuilders.listBare({
          items: items.map((d) => listItemFormatter(scene, d)),
          scene,
          total: items.length,
        }),
      };
    }
    return {
      [responseKeys.listArray]: items.map((d) => listItemFormatter(scene, d)),
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
