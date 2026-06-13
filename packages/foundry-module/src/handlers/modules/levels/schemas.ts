// Module Integration v1 Phase 4 — package-local Zod schema for module-levels.
//
// CCR-5: module-specific schemas stay package-local (not in @foundry-mcp/shared).
// `.strict()` per variant rejects unknown keys.
//
// Source-verified surface (phase4_pre_plan.md §"Levels v6 raw-source verification"):
//   - Always write core `elevation`; NEVER flags.levels.rangeBottom (migrated-away, deleted on migrate).
//   - set-tile-range exposes exactly 7 flags; excludeFromChecker is internal-only and EXCLUDED;
//     tile bottom = core elevation.
//   - Wall flags live under the hyphenated `wall-height` namespace (flags."wall-height".top/.bottom).
//   - Volumetric depth = flags.levels.special; update persists but does NOT re-fire targeting.
//   - set-region-elevation = nested {elevation:{bottom,top}} + optional RegionHandler stair behavior.
//   - rescale-grid-distance is SUPPORTED_WITH_CONFIRMATION: dry-run unless confirm:true.

import { z } from 'zod';

const StairMode = z.enum(['stair', 'stairDown', 'stairUp', 'elevator']);

export const ModuleLevelsInput = z.discriminatedUnion('action', [
  // ── Reads ──────────────────────────────────────────────────────────────────
  // get-capabilities — installed family members, active state, migration status, settings disposition.
  z.object({
    action: z.literal('get-capabilities'),
  }).strict(),

  // get-elevation-data — all elevation + flags.levels.* + flags.wall-height.* for one document by uuid.
  z.object({
    action: z.literal('get-elevation-data'),
    uuid: z.string().min(1),
  }).strict(),

  // ── Document writes ──────────────────────────────────────────────────────────
  // set-token-elevation — core `elevation` + optional flags.wall-height.tokenHeight (LOS eye height).
  z.object({
    action: z.literal('set-token-elevation'),
    sceneId: z.string().min(1),
    tokenId: z.string().min(1),
    elevation: z.number(),
    tokenHeight: z.number().nullable().optional(), // flags.wall-height.tokenHeight; null clears
  }).strict(),

  // set-tile-range — core `elevation` (bottom) + the 7 verified flags.levels.* tile behavior flags.
  // excludeFromChecker is internal-only and intentionally NOT exposed.
  z.object({
    action: z.literal('set-tile-range'),
    sceneId: z.string().min(1),
    tileId: z.string().min(1),
    elevation: z.number().optional(),
    rangeTop: z.number().optional(),            // flags.levels.rangeTop (default Infinity in module)
    showIfAbove: z.boolean().optional(),
    showAboveRange: z.number().optional(),
    noCollision: z.boolean().optional(),
    noFogHide: z.boolean().optional(),
    isBasement: z.boolean().optional(),
    allWallBlockSight: z.boolean().optional(),
  }).strict(),

  // set-placeable-range — AmbientLight / AmbientSound / Note: core `elevation` + flags.levels.rangeTop.
  // advancedLighting (flags.wall-height.advancedLighting) only valid for light/sound (handler enforces).
  z.object({
    action: z.literal('set-placeable-range'),
    sceneId: z.string().min(1),
    placeableType: z.enum(['light', 'sound', 'note']),
    placeableId: z.string().min(1),
    elevation: z.number().optional(),
    rangeTop: z.number().optional(),
    advancedLighting: z.boolean().optional(),
  }).strict(),

  // set-wall-height — flags."wall-height".top / .bottom. At least one required (handler enforces).
  z.object({
    action: z.literal('set-wall-height'),
    sceneId: z.string().min(1),
    wallId: z.string().min(1),
    top: z.number().nullable().optional(),
    bottom: z.number().nullable().optional(),
  }).strict(),

  // set-volumetric-template — MeasuredTemplate core `elevation` + flags.levels.special (depth).
  // DEPENDENCY_GATED on levelsvolumetrictemplates. Update persists but does NOT re-fire targeting.
  z.object({
    action: z.literal('set-volumetric-template'),
    sceneId: z.string().min(1),
    templateId: z.string().min(1),
    elevation: z.number().optional(),
    special: z.number().optional(),
  }).strict(),

  // ── Scene + region orchestration ─────────────────────────────────────────────
  // define-scene-levels — flags.levels.sceneLevels: Array<[bottom, top, label]>.
  z.object({
    action: z.literal('define-scene-levels'),
    sceneId: z.string().min(1).optional(), // defaults to canvas.scene
    levels: z.array(
      z.tuple([z.number(), z.number(), z.string()]),
    ).min(1),
  }).strict(),

  // set-scene-flags — the 7 writable scene-level flags across levels / wall-height / levels-layer-effects.
  z.object({
    action: z.literal('set-scene-flags'),
    sceneId: z.string().min(1).optional(),
    backgroundElevation: z.number().optional(),      // flags.levels.backgroundElevation
    weatherElevation: z.number().optional(),         // flags.levels.weatherElevation
    lightMasking: z.boolean().optional(),            // flags.levels.lightMasking
    advancedVision: z.boolean().nullable().optional(), // flags.wall-height.advancedVision
    enableEffects: z.boolean().optional(),           // flags.levels-layer-effects.enableEffects
    blurMulti: z.number().min(0.1).max(100).optional(), // flags.levels-layer-effects.blurMulti
  }).strict(),

  // set-region-elevation — core v13 {elevation:{bottom,top}} + optional RegionHandler stair behavior.
  z.object({
    action: z.literal('set-region-elevation'),
    sceneId: z.string().min(1),
    regionId: z.string().min(1),
    bottom: z.number().nullable().optional(),
    top: z.number().nullable().optional(),
    stairMode: StairMode.optional(),
    elevatorData: z.string().optional(), // only for stairMode:'elevator'
    behaviorName: z.string().optional(), // defaults to "Levels v6 <mode>"
  }).strict(),

  // rescale-grid-distance — bulk updateEmbeddedDocuments across all elevation-bearing docs.
  // CCR-4: dry-run (report affected counts) unless confirm:true.
  z.object({
    action: z.literal('rescale-grid-distance'),
    sceneId: z.string().min(1).optional(),
    prevDistance: z.number(),
    currDistance: z.number(),
    confirm: z.boolean().optional(),
  }).strict(),
]);

export type ModuleLevelsInputType = z.infer<typeof ModuleLevelsInput>;
