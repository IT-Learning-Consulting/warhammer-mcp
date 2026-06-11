// Module Integration v1 Phase 6A-ii — tokenmagic action Zod schemas.
//
// Every variant is .strict() — rejects unknown top-level keys.
// Imported by scene-atmosphere/schemas.ts and spread into the discriminated union.
//
// FilterType catalog — all 43 types (source-verified from audit.md §FilterType Catalog):
//   adjustment · ascii · bevel · blur · bulgepinch · crt · ddTint · distortion · dot
//   electric · field · fire · flood · fog · fumes · globes · glow · images · liquid
//   oldfilm · outline · pixel · polymorph · ray · replaceColor · rgbSplit · ripples
//   shadow · shockwave · smoke · splash · sprite · spriteMask · twist · wave · web
//   xfire · xfog · xglow · xray · zapshadow · zoomblur · transform
//
// Placeable types: Token, Tile, MeasuredTemplate, Drawing, Region
//
// Companion global: globalThis.TokenMagicAutomaticWounds
// Primary global:   globalThis.TokenMagic
//
// FLAG INVERSION NOTE: the companion flag 'enabled-for-token' has inverted semantics.
//   flag value true  → wounds are DISABLED for this actor.
//   flag value false → wounds are ENABLED for this actor.
// This is a source-level naming bug in the companion (FLAG_DISABLE_WOUNDS = 'enabled-for-token').
// The wound-toggle-disable schema exposes a `disabled: boolean` param and the handler
// maps it correctly — callers work with `disabled` intent, not the inverted flag name.
//
// Confirm gates (CCR-4):
//   tokenmagic-preset with sub-action 'import-from-path', 'import-from-url',
//   'import-template-settings', 'reset-library' require confirm:true.
//
// Anchors:
//   - tokenmagic/capability-manifest.json mcp_action = module-scene-atmosphere.<action>
//   - tokenmagic/audit.md §API Surface + §FilterType Catalog + §Preset Methods
//   - tokenmagic/audit.md §Token Magic Automatic Wounds §Global API
//   - CCR-4: confirm gate on import/reset preset actions
//   - CCR-5: schemas package-local

import { z } from 'zod';

// ── Shared sub-schemas ────────────────────────────────────────────────────────

/** All 43 filterType keys (source-verified from audit.md lines 335–378). */
const FILTER_TYPES = [
  'adjustment', 'ascii', 'bevel', 'blur', 'bulgepinch', 'crt', 'ddTint',
  'distortion', 'dot', 'electric', 'field', 'fire', 'flood', 'fog', 'fumes',
  'globes', 'glow', 'images', 'liquid', 'oldfilm', 'outline', 'pixel', 'polymorph',
  'ray', 'replaceColor', 'rgbSplit', 'ripples', 'shadow', 'shockwave', 'smoke',
  'splash', 'sprite', 'spriteMask', 'twist', 'wave', 'web', 'xfire', 'xfog',
  'xglow', 'xray', 'zapshadow', 'zoomblur', 'transform',
] as const;

/** Supported placeable document types for filter operations. */
const PLACEABLE_TYPES = ['Token', 'Tile', 'MeasuredTemplate', 'Drawing', 'Region'] as const;

/**
 * A filter params object. Must include filterType. filterId is the stable identity
 * for update/delete operations — callers should supply a meaningful string.
 * Additional filter-type-specific params are passed through.
 */
const filterParamsEntry = z.object({
  filterType: z.enum(FILTER_TYPES),
  filterId: z.string().optional(),
  rank: z.number().int().optional(),
  enabled: z.boolean().optional(),
  animated: z.record(z.unknown()).optional(),
  randomized: z.record(z.unknown()).optional(),
  users: z.object({
    include: z.array(z.string()).optional(),
    exclude: z.array(z.string()).optional(),
  }).optional(),
  padding: z.number().optional(),
  zOrder: z.number().optional(),
}).catchall(z.unknown());

// ── tokenmagic-apply ──────────────────────────────────────────────────────────
//
// Wraps: TokenMagic.addFilters(placeable, paramsArray, replace?)
// Also covers: updateFiltersByPlaceable (supported, same flags path)
// placeableId = Foundry document ID; placeableType = which canvas collection to look up.

export const tokenmagicApplyInput = z.object({
  action: z.literal('tokenmagic-apply'),
  /** Foundry document ID of the target placeable. */
  placeableId: z.string(),
  /** Placeable type — determines which canvas collection to resolve the ID against. */
  placeableType: z.enum(PLACEABLE_TYPES),
  /** Array of filter param objects. Each MUST include filterType. */
  params: z.array(filterParamsEntry).min(1),
  /**
   * If true, replaces ALL existing filters on this placeable instead of appending.
   * Use with care — removes all existing TMFX effects.
   */
  replace: z.boolean().optional(),
}).strict();

// ── tokenmagic-upsert ─────────────────────────────────────────────────────────
//
// Wraps: TokenMagic.addUpdateFilters(placeable, paramsArray)
// Upsert: updates existing filter if filterId+filterType match; adds as new if not found.
// Preferred over tokenmagic-apply when idempotent updates are needed (avoids stacking).

export const tokenmagicUpsertInput = z.object({
  action: z.literal('tokenmagic-upsert'),
  placeableId: z.string(),
  placeableType: z.enum(PLACEABLE_TYPES),
  /** Array of filter param objects for upsert. Supply filterId to target existing filters. */
  params: z.array(filterParamsEntry).min(1),
}).strict();

// ── tokenmagic-remove ─────────────────────────────────────────────────────────
//
// Wraps: TokenMagic.deleteFilters(placeable, filterId?, filterType?, filterInternalId?)
// Selective delete: pass filterId, filterType, or both to target specific filters.
// Pass no optional args to delete ALL filters from the placeable.

export const tokenmagicRemoveInput = z.object({
  action: z.literal('tokenmagic-remove'),
  placeableId: z.string(),
  placeableType: z.enum(PLACEABLE_TYPES),
  /**
   * Filter ID to delete (the stable caller-supplied identity).
   * Omit to target by filterType only, or omit both to delete ALL filters.
   */
  filterId: z.string().optional(),
  /**
   * Filter type to delete. Omit to target by filterId only, or omit both for
   * nuclear delete of all filters on this placeable.
   */
  filterType: z.enum(FILTER_TYPES).optional(),
  /** Internal filter ID (rarely needed; prefer filterId). */
  filterInternalId: z.string().optional(),
}).strict();

// ── tokenmagic-query ──────────────────────────────────────────────────────────
//
// Read-only surface. Covers:
//   - hasFilterType(placeable, filterType) → boolean | null
//   - hasFilterId(placeable, filterId) → boolean | null
//   - Read flags.tokenmagic.filters from placeable (all current filters)
//   - Read flags.tokenmagic.animeInfo
//   - TokenMagic.filterTypes (the 43-key catalog object)
//   - getMinPadding() → game.settings.get('tokenmagic','minPadding')
//   - TokenMagic world settings read
//   - companion world settings read
// No writes; no notify emitted.

export const tokenmagicQueryInput = z.object({
  action: z.literal('tokenmagic-query'),
  /** Query sub-action to execute. */
  subAction: z.enum([
    'has-filter-type',      // hasFilterType(placeable, filterType)
    'has-filter-id',        // hasFilterId(placeable, filterId)
    'get-filters',          // read flags.tokenmagic.filters on placeable
    'get-anime-info',       // read flags.tokenmagic.animeInfo on placeable
    'get-filter-types',     // TokenMagic.filterTypes — the 43-key catalog
    'get-min-padding',      // TokenMagic.getMinPadding()
    'get-settings',         // read tokenmagic + companion world settings
  ]),
  /** Required for has-filter-type, has-filter-id, get-filters, get-anime-info. */
  placeableId: z.string().optional(),
  /** Required for has-filter-type, has-filter-id, get-filters, get-anime-info. */
  placeableType: z.enum(PLACEABLE_TYPES).optional(),
  /** Required for has-filter-type. */
  filterType: z.enum(FILTER_TYPES).optional(),
  /** Required for has-filter-id. */
  filterId: z.string().optional(),
}).strict();

// ── tokenmagic-preset ─────────────────────────────────────────────────────────
//
// Covers: getPreset / getPresets / addPreset / deletePreset /
//         importPresetLibraryFromPath / importPresetLibraryFromURL /
//         importTemplateSettingsFromPath / resetPresetLibrary
//
// CCR-4: sub-actions 'import-from-path', 'import-from-url',
//        'import-template-settings', 'reset-library' require confirm:true.
//
// Preset library names: 'tmfx-main' (token/tile/drawing) or 'tmfx-template' (templates).
// Custom library names are accepted by the API; default = 'tmfx-main'.

export const tokenmagicPresetInput = z.object({
  action: z.literal('tokenmagic-preset'),
  /** Preset sub-action. */
  subAction: z.enum([
    'get',                    // getPreset(name) → params array
    'list',                   // getPresets(library?) → preset objects array
    'add',                    // addPreset(name, params) → boolean
    'delete',                 // deletePreset(name) → boolean
    'import-from-path',       // importPresetLibraryFromPath(path, options?) — CONFIRM
    'import-from-url',        // importPresetLibraryFromURL(url, options?) — CONFIRM
    'import-template-settings', // importTemplateSettingsFromPath(path) — CONFIRM
    'reset-library',          // resetPresetLibrary() — CONFIRM
  ]),
  /**
   * Preset name or name-adjustment object ({ name, library?, ...adjustments }).
   * Required for get, add, delete. Optional for list (ignored).
   */
  presetName: z.union([z.string(), z.record(z.unknown())]).optional(),
  /**
   * Preset parameter array. Required for add.
   */
  params: z.array(z.record(z.unknown())).optional(),
  /**
   * Library name for list/add/delete. Defaults to 'tmfx-main'.
   * Also 'tmfx-template' for template presets.
   */
  library: z.string().optional(),
  /** Suppress success dialog on add/delete when true. */
  silent: z.boolean().optional(),
  /**
   * File path (Foundry-relative) for import-from-path / import-template-settings.
   * URL string for import-from-url.
   */
  path: z.string().optional(),
  /** Import options: overwrite existing, replace entire library. */
  importOptions: z.object({
    overwrite: z.boolean().optional(),
    replaceLibrary: z.boolean().optional(),
  }).optional(),
  /**
   * CCR-4: Required true for import-from-path, import-from-url,
   * import-template-settings, reset-library.
   * These operations overwrite world settings — irreversible without re-import.
   */
  confirm: z.boolean().optional(),
}).strict();

// ── tokenmagic-wound-create ───────────────────────────────────────────────────
//
// Wraps: TokenMagicAutomaticWounds.createWoundOnToken(token, damageFraction)
// Requires companion 'tokenmagic-automatic-wounds' active.
// token must be a Token placeable on the current scene.
// damageFraction: proportion of max HP taken as damage (0.0–1.0).

export const tokenmagicWoundCreateInput = z.object({
  action: z.literal('tokenmagic-wound-create'),
  /** Token document ID on the current scene. */
  tokenId: z.string(),
  /**
   * Damage as a fraction of max HP (0.0 = no damage, 1.0 = fully wounded).
   * The companion uses this to calculate wound severity and splash effect sizing.
   */
  damageFraction: z.number().min(0).max(1),
}).strict();

// ── tokenmagic-wound-heal ─────────────────────────────────────────────────────
//
// Wraps: TokenMagicAutomaticWounds.healWoundsOnToken(token, healingFraction)
// Requires companion 'tokenmagic-automatic-wounds' active.
// Shrinks or removes existing wound splash filters proportionally.

export const tokenmagicWoundHealInput = z.object({
  action: z.literal('tokenmagic-wound-heal'),
  /** Token document ID on the current scene. */
  tokenId: z.string(),
  /**
   * Healing as a fraction of max HP (0.0 = no healing, 1.0 = fully healed).
   * The companion proportionally shrinks/removes existing wound filters.
   */
  healingFraction: z.number().min(0).max(1),
}).strict();

// ── tokenmagic-wound-remove ───────────────────────────────────────────────────
//
// Wraps: TokenMagicAutomaticWounds.removeWoundsOnToken(token)
// Removes ALL automaticWoundEffect splash filters from the token.
// Use after full heal or when clearing a dead token's visual state.

export const tokenmagicWoundRemoveInput = z.object({
  action: z.literal('tokenmagic-wound-remove'),
  /** Token document ID on the current scene. */
  tokenId: z.string(),
}).strict();

// ── tokenmagic-wound-reapply ──────────────────────────────────────────────────
//
// Wraps: TokenMagicAutomaticWounds.reapplyWoundsBasedOnCurrentHp(token)
// Removes existing wound filters then recreates them from current HP state.
// Stateless recalculation — safe to call after HP sync or token clone.

export const tokenmagicWoundReapplyInput = z.object({
  action: z.literal('tokenmagic-wound-reapply'),
  /** Token document ID on the current scene. */
  tokenId: z.string(),
}).strict();

// ── wound-toggle-disable ──────────────────────────────────────────────────────
//
// Wraps: TokenMagicAutomaticWounds.toggleDisableWounds(actor)
//
// FLAG INVERSION (CRITICAL):
//   The companion stores per-actor disable state in:
//     actor.flags['tokenmagic-automatic-wounds']['enabled-for-token']
//   where flag value true  means wounds are DISABLED (counterintuitive naming).
//         flag value false means wounds are ENABLED.
//   The variable name in companion source is: FLAG_DISABLE_WOUNDS = 'enabled-for-token'
//
// This schema exposes a `disabled: boolean` param (clear intent).
// The handler calls toggleDisableWounds(actor) which toggles the flag internally.
// toggleDisableWounds returns the new disabled state (boolean).
// To set state explicitly: use setDisabled param; to toggle: omit it.

export const woundToggleDisableInput = z.object({
  action: z.literal('wound-toggle-disable'),
  /** Actor document ID. Wounds are tracked per-actor (across all its tokens). */
  actorId: z.string(),
  /**
   * Optional explicit disabled state. When omitted, toggles the current state.
   * true  = disable wounds (prevent automatic wound FX on this actor).
   * false = enable wounds (allow automatic wound FX on this actor).
   *
   * NOTE: The companion flag is named 'enabled-for-token' with INVERTED semantics:
   * flag=true means DISABLED. This param uses clear naming (disabled=true means
   * wounds are OFF) and the handler maps it correctly.
   */
  disabled: z.boolean().optional(),
}).strict();

// ── wound-set-blood-color ─────────────────────────────────────────────────────
//
// Wraps: TokenMagicAutomaticWounds.setBloodColor(token, newColor)
// Sets a hex blood color on the actor's token for wound splash effects.
// Stored as: actor.setFlag('tokenmagic-automatic-wounds', 'blood-color', hexColor)
// Default color if not set: '0x990505' (dark red).
// Use for non-human creatures — e.g. green for Orcs, yellow for daemons.

export const woundSetBloodColorInput = z.object({
  action: z.literal('wound-set-blood-color'),
  /** Token document ID on the current scene. */
  tokenId: z.string(),
  /**
   * Hex color string for wound splatter effects.
   * Format: '0xRRGGBB' (e.g. '0x990505' = dark red, '0x22aa22' = orc green).
   * The companion uses this for all future createWoundOnToken calls on this token.
   */
  color: z.string(),
}).strict();

// ── Exported variant array (inserted into discriminated union by schemas.ts) ──

export const tokenmagicVariants = [
  tokenmagicApplyInput,
  tokenmagicUpsertInput,
  tokenmagicRemoveInput,
  tokenmagicQueryInput,
  tokenmagicPresetInput,
  tokenmagicWoundCreateInput,
  tokenmagicWoundHealInput,
  tokenmagicWoundRemoveInput,
  tokenmagicWoundReapplyInput,
  woundToggleDisableInput,
  woundSetBloodColorInput,
] as const;
