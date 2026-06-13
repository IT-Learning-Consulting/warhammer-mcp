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

// 16 region events from CONST.REGION_EVENTS (Phase 0 probe). Reference only.
// Per-subtype `events` SetField in Foundry's _createEventsField() restricts choices
// per subtype, but the restriction list is NOT exposed via schema.fields.events.element.choices
// (live F12 probe: all 3 event-carrying subtypes return choices: []). The actual
// restriction is enforced in each subtype's strict-mode validate flow (varies per subtype:
// executeMacro/executeScript log non-fatal warnings; displayScrollingText rejects writes).
// Zod defers to Foundry's runtime: events is `z.array(z.string())` here; invalid strings
// surface as DataModelValidationError in console; displayScrollingText writes with
// non-empty events surface as BEHAVIOR_WRITE_NOT_PERSISTED via DP-16 post-verify.
// See bugs_to_fix.md BUG-078 for the displayScrollingText events upstream issue.
const REGION_EVENTS_REFERENCE = [
  'regionBoundary',
  'behaviorActivated', 'behaviorDeactivated',
  'behaviorViewed', 'behaviorUnviewed',
  'tokenEnter', 'tokenExit',
  'tokenMoveIn', 'tokenMoveOut', 'tokenMoveWithin',
  'tokenAnimateIn', 'tokenAnimateOut',
  'tokenTurnStart', 'tokenTurnEnd',
  'tokenRoundStart', 'tokenRoundEnd',
] as const;
// Exported only to keep the spike-sentinel evidence linked from this file; not used in schemas.
export const _REGION_EVENTS_REFERENCE = REGION_EVENTS_REFERENCE;

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
    // BUG-353: destination is a DocumentUUIDField targeting a REGION (v13:
    // "teleports Tokens ... to a preset destination Region"). It must be a full Region
    // UUID like "Scene.<sceneId>.Region.<regionId>". A bare id or "Scene.<id>" is NOT a
    // Region UUID, so Foundry's field validator silently cleans it to null at write time.
    // Guard requires the ".Region." segment (catches exactly the failing forms) while
    // accepting any valid Region UUID.
    destination: z
      .string()
      .refine(
        (v) => v === '' || v.includes('.Region.'),
        'destination must be a full Region document UUID like "Scene.<sceneId>.Region.<regionId>" — a bare id or "Scene.<id>" silently nulls at write time',
      )
      .nullable()
      .optional(),
    choice: z.boolean().optional(),
  })
  .strict();

const ExecuteMacroSystem = z
  .object({
    // F06: events is z.array(z.string()) — Foundry's per-subtype validator is authoritative.
    events: z.array(z.string()).optional(),
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
    // F06: Foundry strict-validates displayScrollingText.system.events and rejects ANY
    // non-empty array (including valid token events). Constrain to empty until
    // upstream BUG-078 resolves; protects callers from silent BEHAVIOR_WRITE_NOT_PERSISTED.
    events: z
      .array(z.string())
      .max(0, 'displayScrollingText.system.events must be empty (Foundry rejects non-empty arrays for this subtype — BUG-078).')
      .optional(),
    text: z.string().min(1),
    // F07: color is required by Foundry's ColorField — write fails silently without it.
    color: z.string(),
    visibility: RegionVisibilityEnum.optional(),
    once: z.boolean().optional(),
  })
  .strict();

const ExecuteScriptSystem = z
  .object({
    // F06: events is z.array(z.string()) — Foundry's per-subtype validator is authoritative.
    events: z.array(z.string()).optional(),
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

// ── Phase 9A — append a single shape (no whole-array clobber) ─────────────────
// R9A.5 — appends one RegionShape to region.shapes. CCR-2a (shapes.length +1).
export const RegionAddShapeInput = z
  .object({
    action: z.literal('add-shape'),
    sceneId: FOUNDRY_ID,
    regionId: FOUNDRY_ID,
    shape: RegionShapeSchema,
  })
  .strict();

// ── Discriminated-union umbrella (9 actions) ─────────────────────────────────

export const RegionToolInput = z.discriminatedUnion('action', [
  RegionCreateInput,
  RegionUpdateInput,
  RegionDeleteInput,
  RegionGetInput,
  RegionListInput,
  RegionCreateBehaviorInput,
  RegionUpdateBehaviorInput,
  RegionDeleteBehaviorInput,
  RegionAddShapeInput,
]);

export type RegionToolInputType = z.infer<typeof RegionToolInput>;
export type RegionAddShapeInputType = z.infer<typeof RegionAddShapeInput>;
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
