// Phase 5 mcp_crud_expansion — Region umbrella schema + RegionBehavior CRUD.
//
// Lifted from phase5_probes.md §Region + §RegionBehavior_* (Foundry 13.351).
//
// DRIFT-1 RESOLVED: Region.shapes has FOUR variants (rectangle/circle/ellipse/polygon),
// not three — see shared/src/schemas/region-shape.ts. All variants share `hole: BooleanField`.
//
// DRIFT-2 RESOLVED: RegionBehavior `events` lives INSIDE per-subtype `system`
// (as SetField<StringField>), not at the document level. Only 3 of 7 subtypes
// declare events in system (executeMacro, displayScrollingText, executeScript).
// Base RegionBehavior schema: {name, type, system, disabled}.
//
// Spike-Sentinel 3 CONFIRMED: Region.elevation is nested SchemaField {bottom, top}.
// Risk 5.B NOT triggered — all 7 subtypes have ≤5 simple system fields. Full typed Zod.

import { z } from 'zod';
import { RegionShapeSchema } from './region-shape.js';

const FOUNDRY_ID = z.string().min(1);

// REGION_VISIBILITY: LAYER=0, GAMEMASTER=1, ALWAYS=2
const RegionVisibilityEnum = z
  .number()
  .int()
  .min(0)
  .max(2)
  .describe('CONST.REGION_VISIBILITY: 0=LAYER, 1=GAMEMASTER, 2=ALWAYS');

// 16 region events from CONST.REGION_EVENTS (Phase 0 probe).
const REGION_EVENTS = [
  'regionBoundary',
  'behaviorActivated', 'behaviorDeactivated',
  'behaviorViewed', 'behaviorUnviewed',
  'tokenEnter', 'tokenExit',
  'tokenMoveIn', 'tokenMoveOut', 'tokenMoveWithin',
  'tokenAnimateIn', 'tokenAnimateOut',
  'tokenTurnStart', 'tokenTurnEnd',
  'tokenRoundStart', 'tokenRoundEnd',
] as const;

const RegionEventEnum = z.enum(REGION_EVENTS);

const RegionElevationInput = z
  .object({
    bottom: z.number().nullable().optional(),
    top: z.number().nullable().optional(),
  })
  .strict();

const RegionWritableFields = {
  name: z.string().optional(),
  color: z.string().optional(),
  shapes: z.array(RegionShapeSchema).optional(),
  elevation: RegionElevationInput.optional(),
  visibility: RegionVisibilityEnum.optional(),
  locked: z.boolean().optional(),
  flags: z.record(z.unknown()).optional(),
};

// ── Base Region CRUD (5 actions) ─────────────────────────────────────────────

export const RegionCreateInput = z
  .object({
    action: z.literal('create'),
    sceneId: FOUNDRY_ID,
    ...RegionWritableFields,
    name: z.string().min(1),
  })
  .strict();

export const RegionUpdateInput = z
  .object({
    action: z.literal('update'),
    sceneId: FOUNDRY_ID,
    regionId: FOUNDRY_ID,
    changes: z
      .object(RegionWritableFields)
      .strict()
      .refine((obj) => Object.keys(obj).length > 0, {
        message: 'REGION_EMPTY_PAYLOAD: changes object must contain at least one field',
      }),
  })
  .strict();

export const RegionDeleteInput = z
  .object({
    action: z.literal('delete'),
    sceneId: FOUNDRY_ID,
    regionId: FOUNDRY_ID,
  })
  .strict();

export const RegionGetInput = z
  .object({
    action: z.literal('get'),
    sceneId: FOUNDRY_ID,
    regionId: FOUNDRY_ID,
    includeBehaviors: z.boolean().optional(),
  })
  .strict();

export const RegionListInput = z
  .object({
    action: z.literal('list'),
    sceneId: FOUNDRY_ID.optional(),
    filter: z.string().optional(),
    locked: z.boolean().optional(),
    page: z.number().int().min(1).optional(),
    pageSize: z.number().int().min(1).max(100).optional(),
    countOnly: z.boolean().optional(),
  })
  .strict();

// ── RegionBehavior CRUD (3 actions, 7 typed subtypes) ────────────────────────
//
// Discriminated union over `type` ∈ 7 v13-core subtypes:
//   teleportToken / executeMacro / adjustDarknessLevel / suppressWeather /
//   displayScrollingText / executeScript / pauseGame
// Each subtype's `system` schema is typed per the live probe (no passthrough).
// Module-added subtypes (fxmaster.*, monks-active-tiles.*, multi-token-edit.*)
// + 2 v13-core out-of-scope (modifyMovementCost, toggleBehavior) deferred.

const TeleportTokenSystem = z
  .object({
    destination: z.string().nullable().optional(),
    choice: z.boolean().optional(),
  })
  .strict();

const ExecuteMacroSystem = z
  .object({
    events: z.array(RegionEventEnum).optional(),
    uuid: z.string().nullable().optional(),
    everyone: z.boolean().optional(),
  })
  .strict();

const AdjustDarknessLevelSystem = z
  .object({
    mode: z.number().int().min(0).max(2).optional(),
    modifier: z.number().min(0).max(1).optional(),
  })
  .strict();

const SuppressWeatherSystem = z.object({}).strict();

const DisplayScrollingTextSystem = z
  .object({
    events: z.array(RegionEventEnum).optional(),
    text: z.string().min(1),
    color: z.string().optional(),
    visibility: RegionVisibilityEnum.optional(),
    once: z.boolean().optional(),
  })
  .strict();

const ExecuteScriptSystem = z
  .object({
    events: z.array(RegionEventEnum).optional(),
    source: z.string(),
  })
  .strict();

const PauseGameSystem = z
  .object({
    once: z.boolean().optional(),
  })
  .strict();

// Discriminated union of {type, system} payloads for create/update behavior actions.
const RegionBehaviorPayload = z.discriminatedUnion('type', [
  z.object({ type: z.literal('teleportToken'), system: TeleportTokenSystem }).strict(),
  z.object({ type: z.literal('executeMacro'), system: ExecuteMacroSystem }).strict(),
  z.object({ type: z.literal('adjustDarknessLevel'), system: AdjustDarknessLevelSystem }).strict(),
  z.object({ type: z.literal('suppressWeather'), system: SuppressWeatherSystem }).strict(),
  z.object({ type: z.literal('displayScrollingText'), system: DisplayScrollingTextSystem }).strict(),
  z.object({ type: z.literal('executeScript'), system: ExecuteScriptSystem }).strict(),
  z.object({ type: z.literal('pauseGame'), system: PauseGameSystem }).strict(),
]);

export const RegionCreateBehaviorInput = z
  .object({
    action: z.literal('createBehavior'),
    sceneId: FOUNDRY_ID,
    regionId: FOUNDRY_ID,
    name: z.string().optional(),
    disabled: z.boolean().optional(),
    behavior: RegionBehaviorPayload,
  })
  .strict();

export const RegionUpdateBehaviorInput = z
  .object({
    action: z.literal('updateBehavior'),
    sceneId: FOUNDRY_ID,
    regionId: FOUNDRY_ID,
    behaviorId: FOUNDRY_ID,
    name: z.string().optional(),
    disabled: z.boolean().optional(),
    // The behavior payload is optional on update — caller may toggle only `disabled` or rename.
    behavior: RegionBehaviorPayload.optional(),
  })
  .strict();

export const RegionDeleteBehaviorInput = z
  .object({
    action: z.literal('deleteBehavior'),
    sceneId: FOUNDRY_ID,
    regionId: FOUNDRY_ID,
    behaviorId: FOUNDRY_ID,
  })
  .strict();

// ── Discriminated-union umbrella (8 actions) ─────────────────────────────────

export const RegionToolInput = z.discriminatedUnion('action', [
  RegionCreateInput,
  RegionUpdateInput,
  RegionDeleteInput,
  RegionGetInput,
  RegionListInput,
  RegionCreateBehaviorInput,
  RegionUpdateBehaviorInput,
  RegionDeleteBehaviorInput,
]);

export type RegionToolInputType = z.infer<typeof RegionToolInput>;
export type RegionCreateInputType = z.infer<typeof RegionCreateInput>;
export type RegionUpdateInputType = z.infer<typeof RegionUpdateInput>;
export type RegionDeleteInputType = z.infer<typeof RegionDeleteInput>;
export type RegionGetInputType = z.infer<typeof RegionGetInput>;
export type RegionListInputType = z.infer<typeof RegionListInput>;
export type RegionCreateBehaviorInputType = z.infer<typeof RegionCreateBehaviorInput>;
export type RegionUpdateBehaviorInputType = z.infer<typeof RegionUpdateBehaviorInput>;
export type RegionDeleteBehaviorInputType = z.infer<typeof RegionDeleteBehaviorInput>;
export type RegionBehaviorPayloadType = z.infer<typeof RegionBehaviorPayload>;

export interface RegionBehaviorSummary {
  id: string;
  name: string;
  type: string;
  disabled: boolean;
  system: Record<string, unknown>;
}

export interface RegionViewModel {
  id: string;
  sceneId: string;
  name: string;
  color: string;
  shapes: Array<Record<string, unknown>>; // shape variants serialized at handler layer
  elevation: { bottom: number | null; top: number | null };
  visibility: number;
  locked: boolean;
  behaviorCount: number;
  /** Populated only when get/createBehavior/updateBehavior returns. */
  behaviors?: RegionBehaviorSummary[];
  flags: Record<string, unknown>;
}

export interface RegionListItem {
  id: string;
  sceneId: string;
  name: string;
  shapeCount: number;
  behaviorCount: number;
  locked: boolean;
  visibility: number;
}
