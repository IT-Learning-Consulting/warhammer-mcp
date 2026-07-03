// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 6B — scenery action Zod schemas.
//
// Every variant is .strict() — rejects unknown top-level keys.
// Imported by scene-atmosphere/schemas.ts and spread into the discriminated union.
//
// Data model: scene.flags.scenery.data
//   { activeVariationIndex: number, variations: [{ name, gmBackground, plBackground, sceneData? }] }
//
// Default variation special rules (enforced at handler level):
//   - variations[0] is always the Default; cannot be deleted.
//   - variations[0].plBackground is locked to scene.background.src — NEVER write a different value.
//   - variations[0].gmBackground is freely editable.
//
// Legacy data migration:
//   scenery v1 data has shape { bg, gm, pl, defaultSceneData, variations:[{name,file,sceneData}] }.
//   Detection: presence of `bg`/`gm`/`pl` keys without `activeVariationIndex`.
//   Handler reads existing flag, migrates to v2 shape in memory, then writes back.
//   Migration only runs on write (set/add/delete/set-backgrounds/reset-scenedata) — not on reads.
//
// Element-restore-skip limitation (document in schema JSDoc):
//   Writing flags.scenery.data.activeVariationIndex via setFlag skips the automatic
//   live-canvas element snapshot of the OUTGOING variation. If the GM has the scene active,
//   the module will restore the incoming variation's saved elements but will NOT capture
//   the outgoing variation's current canvas state before the switch. This is acceptable for
//   pre-authored variation workflows; callers should be aware.
//
// Confirm gates (CCR-4):
//   add-variation, delete-variation, set-variation-backgrounds, reset-variation-scene-data
//   all require confirm:true — they modify persistent scene variation data.
//
// Anchors:
//   - scenery/capability-manifest.json mcp_action = module-scene-atmosphere.<action>
//   - scenery/audit.md §2 Variant Data Model + §7 Server-Reachable Capability Analysis
//   - CCR-4 confirm gate on destructive variation writes
//   - CCR-5: schemas package-local

import { z } from 'zod';

// ── list-variations ───────────────────────────────────────────────────────────
//
// Read all variations for a scene. Returns the full variations[] array with names,
// backgrounds, active index, and whether each has sceneData captured.
// sceneId is optional — defaults to the currently active canvas scene.

export const listVariationsInput = z.object({
  action: z.literal('list-variations'),
  /** Scene document ID or UUID. Defaults to the currently active canvas scene if omitted. */
  sceneId: z.string().optional(),
}).strict();

// ── get-active-variation ──────────────────────────────────────────────────────
//
// Read the currently active variation for a scene. Returns the variation object
// (name, gmBackground, plBackground) and the active index.
// sceneId is optional — defaults to the currently active canvas scene.

export const getActiveVariationInput = z.object({
  action: z.literal('get-active-variation'),
  /** Scene document ID or UUID. Defaults to the currently active canvas scene if omitted. */
  sceneId: z.string().optional(),
}).strict();

// ── set-active-variation ──────────────────────────────────────────────────────
//
// Switch the active variation by index or name. Writes flags.scenery.data.activeVariationIndex.
// All connected clients update to their role-appropriate background via the updateScene hook.
//
// ELEMENT-RESTORE-SKIP WARNING: This call skips the automatic live-canvas snapshot of the
// outgoing variation. The incoming variation's saved sceneData (if any) WILL be restored,
// but the outgoing variation will NOT capture current canvas elements before the switch.
// Acceptable for pre-authored variation workflows; note in user-facing docstring.
//
// sceneId is optional — defaults to the currently active canvas scene.
// Either variationIndex (0-based integer) or variationName must be supplied.

export const setActiveVariationInput = z.object({
  action: z.literal('set-active-variation'),
  /** Scene document ID or UUID. Defaults to the currently active canvas scene if omitted. */
  sceneId: z.string().optional(),
  /**
   * 0-based index of the variation to activate.
   * Mutually exclusive with variationName — supply exactly one.
   */
  variationIndex: z.number().int().min(0).optional(),
  /**
   * Name of the variation to activate (case-sensitive match on variations[N].name).
   * Mutually exclusive with variationIndex — supply exactly one.
   */
  variationName: z.string().optional(),
  /**
   * BUG-355: optional confirm. The sibling destructive actions (add/delete-variation) require
   * confirm:true, so callers following that established confirm-gate pattern pass confirm:true
   * here too — but this `.strict()` schema previously rejected it with `unrecognized_keys`.
   * Switching the active variation applies the incoming variation's sceneData and skips the
   * outgoing snapshot (see ELEMENT-RESTORE-SKIP WARNING), so confirm:true is meaningful and
   * accepted; it is optional to avoid breaking existing no-confirm callers.
   */
  confirm: z.literal(true).optional(),
}).strict();

// ── add-variation ─────────────────────────────────────────────────────────────
//
// Add a new variation to a scene's variations array. Appends to flags.scenery.data.variations[].
// CCR-4: requires confirm:true because this modifies persistent scene data.
//
// At minimum: name and gmBackground must be supplied.
// plBackground defaults to scene.background.src if not supplied (following the module's own pattern).
// The new variation has no sceneData (elements will not be restored until explicitly captured).

export const addVariationInput = z.object({
  action: z.literal('add-variation'),
  /** Scene document ID or UUID. Defaults to the currently active canvas scene if omitted. */
  sceneId: z.string().optional(),
  /** Name for the new variation. E.g. "Night", "Aftermath", "Stage 2". */
  name: z.string().min(1),
  /**
   * GM-visible background path (Foundry-relative or absolute URL).
   * What the GM sees when this variation is active.
   */
  gmBackground: z.string().min(1),
  /**
   * Player-visible background path.
   * Defaults to scene.background.src if omitted (standard for a "player sees the real map" variation).
   * Never write a different value for variations[0] (Default) — that is enforced by the module.
   */
  plBackground: z.string().optional(),
  /**
   * CCR-4: Required true to confirm adding a new scene variation.
   * Modifies persistent flag data on the Scene document.
   */
  confirm: z.literal(true),
}).strict();

// ── delete-variation ──────────────────────────────────────────────────────────
//
// Delete a variation from the scene's variations array.
// CCR-4: requires confirm:true — this operation is destructive (removes sceneData snapshots).
// GUARD: Cannot delete variations[0] (the Default). Handler returns error if attempted.
// If the deleted variation was active, resets activeVariationIndex to 0 (Default).
//
// Either variationIndex (must be >= 1) or variationName must be supplied.

export const deleteVariationInput = z.object({
  action: z.literal('delete-variation'),
  /** Scene document ID or UUID. Defaults to the currently active canvas scene if omitted. */
  sceneId: z.string().optional(),
  /**
   * 0-based index of the variation to delete. Must be >= 1 (cannot delete Default/index 0).
   * Mutually exclusive with variationName — supply exactly one.
   */
  variationIndex: z.number().int().min(1).optional(),
  /**
   * Name of the variation to delete. Cannot be "Default".
   * Mutually exclusive with variationIndex — supply exactly one.
   */
  variationName: z.string().optional(),
  /**
   * CCR-4: Required true to confirm deletion.
   * Removes the variation and its sceneData snapshot permanently.
   */
  confirm: z.literal(true),
}).strict();

// ── set-variation-backgrounds ─────────────────────────────────────────────────
//
// Update the gmBackground and/or plBackground paths on an existing variation.
// CCR-4: requires confirm:true — modifies persistent flag data.
//
// GUARD: If targeting variations[0] (Default):
//   - plBackground must be omitted OR match scene.background.src (enforced by module UI; respected here).
//   - If plBackground is supplied, handler warns and ignores it (does not fail).
//   - gmBackground is freely editable on the Default.

export const setVariationBackgroundsInput = z.object({
  action: z.literal('set-variation-backgrounds'),
  /** Scene document ID or UUID. Defaults to the currently active canvas scene if omitted. */
  sceneId: z.string().optional(),
  /**
   * 0-based index of the variation to update.
   * Mutually exclusive with variationName — supply exactly one.
   */
  variationIndex: z.number().int().min(0).optional(),
  /**
   * Name of the variation to update.
   * Mutually exclusive with variationIndex — supply exactly one.
   */
  variationName: z.string().optional(),
  /**
   * New GM-visible background path.
   * Omit to leave gmBackground unchanged.
   */
  gmBackground: z.string().optional(),
  /**
   * New player-visible background path.
   * Ignored for variations[0] (Default) — that is always locked to scene.background.src.
   * Omit to leave plBackground unchanged.
   */
  plBackground: z.string().optional(),
  /**
   * CCR-4: Required true to confirm updating background paths.
   */
  confirm: z.literal(true),
}).strict();

// ── reset-variation-scene-data ────────────────────────────────────────────────
//
// Clear the sceneData snapshot from a variation (removes lights, sounds, tiles, walls, etc.
// captured for that variation). After reset, switching to this variation will keep the
// current canvas elements unchanged (no element save/restore happens when sceneData is absent).
// CCR-4: requires confirm:true — this destroys the captured element snapshot.

export const resetVariationSceneDataInput = z.object({
  action: z.literal('reset-variation-scene-data'),
  /** Scene document ID or UUID. Defaults to the currently active canvas scene if omitted. */
  sceneId: z.string().optional(),
  /**
   * 0-based index of the variation whose sceneData to reset.
   * Mutually exclusive with variationName — supply exactly one.
   */
  variationIndex: z.number().int().min(0).optional(),
  /**
   * Name of the variation whose sceneData to reset.
   * Mutually exclusive with variationIndex — supply exactly one.
   */
  variationName: z.string().optional(),
  /**
   * CCR-4: Required true to confirm deletion of the sceneData snapshot.
   * This is irreversible — the captured element snapshot is permanently removed.
   */
  confirm: z.literal(true),
}).strict();

// ── check-module-active ───────────────────────────────────────────────────────
//
// Check whether the scenery module is active. Returns { active: boolean, version? }.
// Useful as a pre-flight before performing variations. Same pattern as the dispatcher guard
// but exposed as a read-only action for callers that want to confirm availability.

export const checkSceneryModuleActiveInput = z.object({
  action: z.literal('check-scenery-module-active'),
}).strict();

// ── read-scenery-settings ─────────────────────────────────────────────────────
//
// Read the scenery world settings. Returns the full set of 13 world-scope settings.
// These settings affect element save/restore on variation switch:
//   globalLights, globalSounds, globalTiles, globalWalls, globalDrawings,
//   globalTemplates, globalRegions, globalNotes
// Read before set-active-variation to determine which element types will change on switch.

export const readScenerySettingsInput = z.object({
  action: z.literal('read-scenery-settings'),
}).strict();

// ── Exported variant array (inserted into discriminated union by schemas.ts) ──

export const sceneryVariants = [
  listVariationsInput,
  getActiveVariationInput,
  setActiveVariationInput,
  addVariationInput,
  deleteVariationInput,
  setVariationBackgroundsInput,
  resetVariationSceneDataInput,
  checkSceneryModuleActiveInput,
  readScenerySettingsInput,
] as const;
