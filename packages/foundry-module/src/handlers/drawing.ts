// Phase 5 mcp_coverage_expansion — Drawing CRUD handler (5 factory actions + duplicate).
//
// 6 actions: create / update / delete / get / list (via createEmbeddedCRUDHandlers)
//   + duplicate (bespoke — the factory dispatch routes only the 5 standard verbs).
// Drawings are embedded on Scene (scene.drawings), mirroring tile / light / sound / template.
//
// `shape` is Foundry v13 flat ShapeData → skipped in the DP-16 scalar loop (nested object);
//   `text` is skipped too (smoke covers it directly). Colours/scalars stay DP-16-verified.
// duplicate re-keys within the same collection, so newId !== sourceId is a valid CCR-2a guard
//   (a cross-collection import would PRESERVE the source id — not applicable here).
// HC1 / CCR-3: no CONFIG reads / no game-rule logic.
//
// FACTORY: drawing Drawing

import {
  DrawingToolInput,
  DrawingCreateInput,
  DrawingUpdateInput,
  DrawingDeleteInput,
  DrawingGetInput,
  DrawingListInput,
  type DrawingToolInputType,
  type DrawingViewModel,
  type DrawingListItem,
} from '@foundry-mcp/shared';
import {
  createEmbeddedCRUDHandlers,
  validateGMAccess,
  getSceneOrThrow,
  type Envelope,
} from '../utils/embeddedCRUDFactory.js';
import { getEmbeddedOrThrow } from '../utils/getEmbeddedOrThrow.js';
import { wrappedWrite } from '../transaction-manager.js';
import { notify } from '../notify.js';

// ── Shape-type word ↔ code mapping ─────────────────────────────────────────────
// Foundry v13 ShapeData stores `shape.type` as the subclass single-char TYPE code
// (RectangleShapeData.TYPE="r", etc.) — the full-word TYPES *keys* are NOT valid
// `type` values (createEmbeddedDocuments rejects "rectangle is not a valid choice").
// The MCP API keeps the friendly words for discoverability; we translate at the
// Foundry write boundary (encode on create/update) and back on read (decode in serializers).
const SHAPE_WORD_TO_CODE: Record<string, string> = {
  rectangle: 'r',
  ellipse: 'e',
  polygon: 'p',
  circle: 'c',
};
const SHAPE_CODE_TO_WORD: Record<string, string> = {
  r: 'rectangle',
  e: 'ellipse',
  p: 'polygon',
  c: 'circle',
};

// Foundry v13 requires every Drawing to have at least ONE visible property — visible text,
// a visible fill (fillType>0 & fillAlpha>0), OR a visible line (strokeWidth>0 & strokeAlpha>0) —
// or DrawingDocument.validateJoint throws "Drawings must have visible text, a visible fill, or a
// visible line." Foundry defaults strokeWidth=0 & fillType=0, so a bare-geometry create (e.g.
// {x,y,shape} with no text/fill/stroke) fails. Default to a visible line (8px @ alpha 1 — the
// serializer's canonical baseline) when the caller supplied no visible property. CREATE-only:
// updates merge onto an already-valid stored doc.
function ensureVisibleDrawing<T extends Record<string, any>>(payload: T): T {
  const p: any = payload ?? {};
  const hasText = typeof p.text === 'string' && p.text.length > 0;
  const hasFill = (p.fillType ?? 0) > 0 && (p.fillAlpha ?? 0.5) > 0;
  const hasLine = (p.strokeWidth ?? 0) > 0 && (p.strokeAlpha ?? 1) > 0;
  if (hasText || hasFill || hasLine) return payload;
  return { ...payload, strokeWidth: 8, strokeAlpha: 1 };
}

// Map a payload's shape.type word → Foundry code (no-op if absent / already a code).
function encodeShapeType<T extends Record<string, any>>(payload: T): T {
  const t = payload?.shape?.type;
  if (typeof t === 'string' && SHAPE_WORD_TO_CODE[t]) {
    return { ...payload, shape: { ...payload.shape, type: SHAPE_WORD_TO_CODE[t] } };
  }
  return payload;
}

// Phase 13B module_integration_v1 — advanced-drawing-tools delegate expansion.
// Lifts the optional `advancedDrawing` block onto flags['advanced-drawing-tools'] (nested form so it
// works for BOTH createEmbeddedDocuments — which does not expand dotted keys — and update, which
// recursively merges nested objects).
// FAIL-OPEN (HC1/HC5): `drawing` is a CORE tool. If advanced-drawing-tools is inactive, the block is
// silently dropped and the core write proceeds — NO MODULE_NOT_ACTIVE (that would fail a drawing write
// over an optional styling block, breaking zero-module isolation). lib-wrapper is NOT gated here: flag
// writes are Foundry-native and land regardless; lib-wrapper only powers ADT's canvas-render patches.
const ADT_MODULE = 'advanced-drawing-tools';
function expandAdvancedDrawingFlags<T extends Record<string, any>>(payload: T): T {
  const { advancedDrawing, ...rest } = (payload ?? {}) as any;
  if (!advancedDrawing) return payload;
  const mod = (globalThis as any).game?.modules?.get?.(ADT_MODULE);
  if (!mod?.active) return rest as T; // fail-open: drop the block, continue core write.

  const adt: Record<string, any> = {};
  if (advancedDrawing.invisible !== undefined) adt.invisible = advancedDrawing.invisible;
  if (advancedDrawing.lineStyle !== undefined) adt.lineStyle = advancedDrawing.lineStyle;
  if (advancedDrawing.fillStyle !== undefined) adt.fillStyle = advancedDrawing.fillStyle;
  if (advancedDrawing.textStyle !== undefined) adt.textStyle = advancedDrawing.textStyle;

  const mergedFlags = { ...(rest.flags ?? {}), [ADT_MODULE]: adt };
  return { ...rest, flags: mergedFlags } as T;
}

// ── Serializers ──────────────────────────────────────────────────────────────
// Read from `_source` (raw stored data) so ColorField / nested getters don't leak
// derived objects (Color instances etc.) into the view model.
function serializeDrawingViewModel(scene: any, d: any): DrawingViewModel {
  const src: any = (d as any)._source ?? d ?? {};
  const s: any = src.shape ?? {};
  return {
    id: d.id as string,
    sceneId: scene.id as string,
    x: src.x ?? 0,
    y: src.y ?? 0,
    shape: {
      type: SHAPE_CODE_TO_WORD[s.type] ?? s.type ?? 'rectangle',
      width: s.width ?? 0,
      height: s.height ?? 0,
      radius: s.radius ?? 0,
      points: Array.isArray(s.points) ? s.points : [],
    },
    bezierFactor: src.bezierFactor ?? 0,
    text: src.text ?? '',
    fontFamily: src.fontFamily ?? 'Signika',
    fontSize: src.fontSize ?? 48,
    textColor: src.textColor ?? '#ffffff',
    textAlpha: src.textAlpha ?? 1,
    fillType: src.fillType ?? 0,
    fillColor: src.fillColor ?? '#ffffff',
    fillAlpha: src.fillAlpha ?? 0.5,
    strokeWidth: src.strokeWidth ?? 8,
    strokeColor: src.strokeColor ?? '#ffffff',
    strokeAlpha: src.strokeAlpha ?? 1,
    texture: src.texture ?? null,
    rotation: src.rotation ?? 0,
    elevation: src.elevation ?? 0,
    sort: src.sort ?? 0,
    hidden: src.hidden ?? false,
    locked: src.locked ?? false,
    interface: src.interface ?? false,
    flags: (src.flags as Record<string, unknown>) ?? {},
    author: (src.author ?? null) as string | null,
  };
}

function serializeDrawingListItem(scene: any, d: any): DrawingListItem {
  const src: any = (d as any)._source ?? d ?? {};
  return {
    id: d.id as string,
    sceneId: scene.id as string,
    shapeType: SHAPE_CODE_TO_WORD[src.shape?.type] ?? src.shape?.type ?? 'rectangle',
    text: src.text ?? '',
    hidden: src.hidden ?? false,
    locked: src.locked ?? false,
  };
}

// ── List filters ─────────────────────────────────────────────────────────────
function applyDrawingListFilters(input: any, items: any[]): any[] {
  let filtered = items;
  if (input.hidden !== undefined) {
    filtered = filtered.filter((d: any) => (d.hidden ?? false) === input.hidden);
  }
  if (input.locked !== undefined) {
    filtered = filtered.filter((d: any) => (d.locked ?? false) === input.locked);
  }
  if (input.shapeType !== undefined) {
    filtered = filtered.filter((d: any) => {
      const code = d.shape?.type ?? null;
      return (SHAPE_CODE_TO_WORD[code] ?? code) === input.shapeType;
    });
  }
  return filtered;
}

function isDrawingFilterApplied(input: any): boolean {
  return input.hidden !== undefined || input.locked !== undefined || input.shapeType !== undefined;
}

// ── Factory wiring (5 standard actions) ────────────────────────────────────────
const handlers = createEmbeddedCRUDHandlers<any, any, DrawingViewModel, DrawingListItem>({
  documentName: 'Drawing',
  documentLabel: 'drawing',
  collection: 'drawings',
  idField: 'drawingId',
  gmGateReads: true, // GM authoring tool; reads gated like light / sound (NF3).
  deleteApi: 'scene.deleteEmbeddedDocuments',
  schemas: {
    create: DrawingCreateInput,
    update: DrawingUpdateInput,
    delete: DrawingDeleteInput,
    get: DrawingGetInput,
    list: DrawingListInput,
    toolInput: DrawingToolInput,
  },
  // shape is a nested SchemaField; text is smoke-covered; advancedDrawing is a transform-only
  // input (expandAdvancedDrawingFlags re-keys it into flags['advanced-drawing-tools'], so it never
  // persists under its own name — _source.advancedDrawing is always undefined) — skip all three in
  // the DP-16 scalar loop. (Phase 13B: the factory's loop compares pre-transform requestedChanges
  // against persisted._source; advancedDrawing is the first family field that a preCreateTransform
  // actually removes, breaking that loop's "transform is a no-op" assumption.)
  dp16SkipFields: ['shape', 'text', 'advancedDrawing'],
  formatter: serializeDrawingViewModel,
  listItemFormatter: serializeDrawingListItem,
  applyListFilters: applyDrawingListFilters,
  isFilterApplied: isDrawingFilterApplied,
  responseKeys: {
    viewModel: 'drawing',
    listArray: 'drawings',
    remainingCount: 'remainingDrawings',
  },
  notifyKind: 'drawing',
  defaultPageSize: 50,
  // Translate the friendly shape.type word → Foundry's single-char code at the write boundary,
  // then expand the optional advanced-drawing-tools delegate block (Phase 13B, fail-open).
  preCreateTransform: (_scene, payload) => ensureVisibleDrawing(expandAdvancedDrawingFlags(encodeShapeType(payload))),
  preUpdateTransform: (_scene, changes) => expandAdvancedDrawingFlags(encodeShapeType(changes)),
});

export const createDrawing = handlers.create;
export const updateDrawing = handlers.update;
export const deleteDrawing = handlers.delete;
export const getDrawing = handlers.get;
export const listDrawings = handlers.list;

// ── Bespoke duplicate (6th action — not covered by the factory dispatch) ───────
async function duplicateDrawing(
  input: Extract<DrawingToolInputType, { action: 'duplicate' }>,
): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: duplicateDrawing requires GM' };

  const scene = getSceneOrThrow(input.sceneId);
  const source = getEmbeddedOrThrow<any>(scene, 'drawings', input.drawingId, 'Drawing');
  const sourceId = source.id as string;

  return wrappedWrite('drawing.duplicate', async () => {
    const data: any = source.toObject();
    delete data._id; // re-key on create
    delete data.sort;
    delete data.author; // auto-set to the current user on create

    const created = await scene.createEmbeddedDocuments('Drawing', [data]);
    const doc = Array.isArray(created) ? created[0] : created;
    if (!doc) {
      throw new Error('DRAWING_DUPLICATE_FAILED: createEmbeddedDocuments returned empty');
    }

    // CCR-2a: re-read + confirm same-collection duplicate re-keyed.
    const persisted = getEmbeddedOrThrow<any>(scene, 'drawings', doc.id, 'Drawing');
    if (persisted.id === sourceId) {
      throw new Error(
        `DRAWING_DUPLICATE_FAILED: duplicate id equals source id "${sourceId}" — creation may have been a no-op`,
      );
    }

    notify.created('drawing', `Drawing ${persisted.id}`, {
      summary: `duplicated from ${sourceId} on scene ${input.sceneId}`,
    });

    return {
      success: true as const,
      data: {
        success: true,
        drawing: serializeDrawingViewModel(scene, persisted),
        sourceId,
      },
    };
  }, { sceneId: input.sceneId });
}

// ── Custom dispatch (factory 5 + duplicate) ────────────────────────────────────
export const dispatchDrawing = async (data: unknown): Promise<Envelope<any>> => {
  let input: DrawingToolInputType;
  try {
    input = DrawingToolInput.parse(data ?? {}) as DrawingToolInputType;
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  switch (input.action) {
    case 'create':
      return handlers.create(input);
    case 'update':
      return handlers.update(input);
    case 'delete':
      return handlers.delete(input);
    case 'get':
      return handlers.get(input);
    case 'list':
      return handlers.list(input);
    case 'duplicate':
      return duplicateDrawing(input);
    default:
      throw new Error(`Unknown drawing action: ${(input as any).action}`);
  }
};
