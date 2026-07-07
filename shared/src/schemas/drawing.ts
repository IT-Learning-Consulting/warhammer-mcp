// Phase 5 mcp_coverage_expansion — drawing umbrella schema.
//
// DrawingDocument CRUD (create/update/delete/get/list) + duplicate, over scene.drawings.
//
// `shape` is Foundry v13 `ShapeData` — a FLAT model {type, width, height, radius, points},
// NOT the BaseShapeData subtype hierarchy that Region uses. So `shape` is modelled as a flat
// object with a `type` enum + optional geometry siblings (the template.ts flat-enum precedent),
// NOT a discriminated union.
//   - shape.type ∈ {rectangle, circle, ellipse, polygon}.
//   - "Freehand" is NOT a shape type — it is type:"polygon" + a top-level bezierFactor > 0.
//   - "Text" is NOT a shape type — `text` is an overlay StringField on any drawing.
//
// Field traps:
//   - `interface` is the literal field name (reserved word) — only ever a property key here.
//   - `texture` is a FilePathField (nullable). Clear via null, never "" ("" cleans to a default).
//   - fill/stroke/text colours are ColorField → must be 6-digit hex #rrggbb.
//
// Excludes `_id` + `author` (both auto-assigned by Foundry) from the writable surface.
// Thin primitive (HC1 / CCR-3): no CONFIG reads, no game-rule logic.

import { z } from 'zod';
import { paginationFields } from './primitives.js';
import { SceneId, DrawingId } from './branded-ids.js';
const HEX_COLOR = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'must be a 6-digit hex colour like #rrggbb');
const SHAPE_TYPE = z.enum(['rectangle', 'circle', 'ellipse', 'polygon']);

// Flat ShapeData: all geometry fields coexist; `type` selects which are semantically relevant.
// rectangle/ellipse → width+height; circle → width/radius; polygon → points [x1,y1,x2,y2,...].
const DrawingShapeInput = z
  .object({
    type: SHAPE_TYPE,
    width: z.number().optional(),
    height: z.number().optional(),
    radius: z.number().optional(),
    // BUG-523: a polygon needs ≥3 vertices = ≥6 flat coordinates [x1,y1,x2,y2,x3,y3,...]. Enforce the
    // documented minimum for a clean typed error instead of leaving Foundry to reject the degenerate shape.
    points: z.array(z.number()).min(6, 'polygon requires at least 3 points (≥6 flat coordinates)').optional(),
  })
  .strict();

// Phase 13B module_integration_v1 — advanced-drawing-tools delegate block.
// The 34 server-authorable flags from the advanced-drawing-tools module, passed through to
// flags.advanced-drawing-tools.* by the handler's expandAdvancedDrawingFlags transform.
// FAIL-OPEN: when the module is inactive the handler silently drops this block (core drawing
// write proceeds — HC1/HC5). NEVER write lineStyle.dashEnabled (UI-only; cleanData strips it).
// Traps: textStyle.fill[0] is the SECOND gradient stop (textColor is prepended first);
// fillStyle.transform.* only render when fillType=PATTERN(2) + a texture is set.
const AdvancedDrawingInput = z
  .object({
    invisible: z.boolean().optional(),
    lineStyle: z
      .object({
        // null = solid; [dashLen, gapLen] to enable. Exact 2-tuple (NOT z.array — wrong arity).
        dash: z.union([z.tuple([z.number(), z.number()]), z.null()]).optional(),
      })
      .optional(),
    fillStyle: z
      .object({
        texture: z
          .object({
            width: z.string().optional(), // "Npx" | "N%"
            height: z.string().optional(),
          })
          .optional(),
        transform: z
          .object({
            position: z.object({ x: z.string().optional(), y: z.string().optional() }).optional(),
            pivot: z.object({ x: z.string().optional(), y: z.string().optional() }).optional(),
            scale: z.object({ x: z.number().optional(), y: z.number().optional() }).optional(),
            rotation: z.number().optional(), // degrees
            skew: z.object({ x: z.number().optional(), y: z.number().optional() }).optional(),
          })
          .optional(),
      })
      .optional(),
    textStyle: z
      .object({
        align: z.enum(['left', 'center', 'right']).nullable().optional(),
        dropShadow: z.boolean().optional(),
        dropShadowAlpha: z.number().min(0).max(1).optional(),
        dropShadowAngle: z.number().optional(), // degrees
        dropShadowBlur: z.number().nullable().optional(),
        dropShadowColor: HEX_COLOR.optional(),
        dropShadowDistance: z.number().optional(),
        arc: z.number().min(-360).max(360).optional(),
        fill: z.array(HEX_COLOR).optional(), // appended AFTER textColor (fill[0] is 2nd stop)
        fillGradientStops: z.array(z.number().min(0).max(1)).optional(),
        fillGradientType: z.union([z.literal(0), z.literal(1)]).optional(), // 0=vertical, 1=horizontal
        fontStyle: z.enum(['normal', 'italic', 'oblique']).optional(),
        fontVariant: z.enum(['normal', 'small-caps']).optional(),
        fontWeight: z
          .enum(['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'])
          .optional(),
        leading: z.number().optional(),
        letterSpacing: z.number().optional(),
        lineHeight: z.number().nullable().optional(),
        stroke: HEX_COLOR.nullable().optional(),
        strokeThickness: z.number().nullable().optional(),
        strokeOpacity: z.number().min(0).max(1).nullable().optional(),
        wordWrapWidth: z.string().optional(), // "Npx" | "N%"
      })
      .optional(),
  })
  .strict();

const DrawingWritableFields = {
  x: z.number().optional(),
  y: z.number().optional(),
  shape: DrawingShapeInput.optional(),
  bezierFactor: z.number().min(0).max(1).optional(),
  text: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.number().positive().optional(),
  textColor: HEX_COLOR.optional(),
  textAlpha: z.number().min(0).max(1).optional(),
  fillType: z.number().int().min(0).max(2).optional(),
  fillColor: HEX_COLOR.optional(),
  fillAlpha: z.number().min(0).max(1).optional(),
  strokeWidth: z.number().nonnegative().optional(),
  strokeColor: HEX_COLOR.optional(),
  strokeAlpha: z.number().min(0).max(1).optional(),
  // FilePathField — nullable; pass null to clear, never "".
  texture: z.string().nullable().optional(),
  rotation: z.number().min(0).max(360).optional(),
  elevation: z.number().optional(),
  sort: z.number().int().optional(),
  hidden: z.boolean().optional(),
  locked: z.boolean().optional(),
  interface: z.boolean().optional(),
  flags: z.record(z.unknown()).optional(),
  // Phase 13B — optional advanced-drawing-tools delegate; expanded to flags.advanced-drawing-tools.*
  // by the handler (fail-open when the module is inactive). Flows to create + update via the spread.
  advancedDrawing: AdvancedDrawingInput.optional(),
};

export const DrawingCreateInput = z
  .object({
    action: z.literal('create'),
    sceneId: SceneId,
    ...DrawingWritableFields,
    // create requires position + a shape (with its type).
    x: z.number(),
    y: z.number(),
    shape: DrawingShapeInput,
  })
  .strict();

export const DrawingUpdateInput = z
  .object({
    action: z.literal('update'),
    sceneId: SceneId,
    drawingId: DrawingId,
    changes: z
      .object(DrawingWritableFields)
      .strict()
      .refine((obj) => Object.keys(obj).length > 0, {
        message: 'DRAWING_EMPTY_PAYLOAD: changes object must contain at least one field',
      }),
  })
  .strict();

export const DrawingDeleteInput = z
  .object({
    action: z.literal('delete'),
    sceneId: SceneId,
    drawingId: DrawingId,
  })
  .strict();

export const DrawingGetInput = z
  .object({
    action: z.literal('get'),
    sceneId: SceneId,
    drawingId: DrawingId,
  })
  .strict();

export const DrawingListInput = z
  .object({
    action: z.literal('list'),
    sceneId: SceneId.optional(),
    hidden: z.boolean().optional(),
    locked: z.boolean().optional(),
    shapeType: SHAPE_TYPE.optional(),
    ...paginationFields(),
    countOnly: z.boolean().optional(),
  })
  .strict();

export const DrawingDuplicateInput = z
  .object({
    action: z.literal('duplicate'),
    sceneId: SceneId,
    drawingId: DrawingId,
  })
  .strict();

export const DrawingToolInput = z.discriminatedUnion('action', [
  DrawingCreateInput,
  DrawingUpdateInput,
  DrawingDeleteInput,
  DrawingGetInput,
  DrawingListInput,
  DrawingDuplicateInput,
]);

export type DrawingToolInputType = z.infer<typeof DrawingToolInput>;
export type DrawingCreateInputType = z.infer<typeof DrawingCreateInput>;
export type DrawingUpdateInputType = z.infer<typeof DrawingUpdateInput>;
export type DrawingDeleteInputType = z.infer<typeof DrawingDeleteInput>;
export type DrawingGetInputType = z.infer<typeof DrawingGetInput>;
export type DrawingListInputType = z.infer<typeof DrawingListInput>;
export type DrawingDuplicateInputType = z.infer<typeof DrawingDuplicateInput>;

export interface DrawingShapeView {
  type: string;
  width: number;
  height: number;
  radius: number;
  points: number[];
}

export interface DrawingViewModel {
  id: string;
  sceneId: string;
  x: number;
  y: number;
  shape: DrawingShapeView;
  bezierFactor: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  textAlpha: number;
  fillType: number;
  fillColor: string;
  fillAlpha: number;
  strokeWidth: number;
  strokeColor: string;
  strokeAlpha: number;
  texture: string | null;
  rotation: number;
  elevation: number;
  sort: number;
  hidden: boolean;
  locked: boolean;
  interface: boolean;
  flags: Record<string, unknown>;
  author: string | null;
}

export interface DrawingListItem {
  id: string;
  sceneId: string;
  shapeType: string;
  text: string;
  hidden: boolean;
  locked: boolean;
}
