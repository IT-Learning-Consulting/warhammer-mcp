// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 6A — fxmaster action Zod schemas.
//
// Every variant is .strict() — rejects unknown top-level keys.
// Imported by scene-atmosphere/schemas.ts and spread into the discriminated union.
//
// Particle / filter type catalogs (free tier only — plus-only types rejected at handler level):
//   Particles (16): autumnleaves · bats · birds · bubbles · clouds · crows · eagles
//                   embers · fog · hail · rain · rats · snow · snowstorm · spiders · stars
//   Filters (7):   bloom · color · fog · lightning · oldfilm · predator · underwater
//   Blend modes (12): normal · multiply · screen · overlay · softLight · hardLight
//                     colorDodge · colorBurn · darken · lighten · difference · exclusion
//
// Region behavior types (4): particleEffectsRegion · filterEffectsRegion
//                             suppressSceneParticles · suppressSceneFilters
//
// Anchors:
//   - capability-manifest.json mcp_action = module-scene-atmosphere.<action>
//   - fxmaster audit.md §API Surface + §Particle Effect Catalog + §Filter Effect Catalog
//   - CCR-4: confirm gate on clear-effects + set-enabled (disableAll:true)
//   - CCR-5: schemas promoted to @foundry-mcp/shared (ADR-020)

import { z } from 'zod';

// ── Shared option sub-schemas ────────────────────────────────────────────────

const FREE_PARTICLE_TYPES = [
  'autumnleaves', 'bats', 'birds', 'bubbles', 'clouds', 'crows', 'eagles',
  'embers', 'fog', 'hail', 'rain', 'rats', 'snow', 'snowstorm', 'spiders', 'stars',
] as const;

const FREE_FILTER_TYPES = [
  'bloom', 'color', 'fog', 'lightning', 'oldfilm', 'predator', 'underwater',
] as const;

// fxmaster-plus add-on types — only valid when the `fxmaster-plus` module is active
// (registers via fxmaster.preRegister*Effects). Verified live 2026-06-12 against
// fxmaster-plus v1.0.8 (Particle Effects UI + clean recent-errors load).
const PLUS_PARTICLE_TYPES = [
  'fireflies', 'ghosts', 'magiccrystals', 'sakurabloom', 'sakurablossoms',
] as const;
const PLUS_FILTER_TYPES = ['sunlight'] as const;

// wfrp-fxmaster-custom add-on types — only valid when that module is active.
// Built on the free FXMaster engine (no fxmaster-plus required). WFRP atmosphere set.
const CUSTOM_PARTICLE_TYPES = [
  'warpstonemotes', 'chaosembers', 'blightspores', 'soulwisps', 'fallingash',
  'warpfiresparks', 'censersmoke', 'daemoneyes', 'witchlight',
  // weather group
  'windgusts', 'dustgale', 'warpstorm', 'ashstorm',
] as const;
const CUSTOM_FILTER_TYPES = [
  'corruption', 'grimdark', 'warpshimmer',
  'waterflow', 'waterwaves', 'watervortex', 'lightningbolt',
] as const;

const ALL_PARTICLE_TYPES = [...FREE_PARTICLE_TYPES, ...PLUS_PARTICLE_TYPES, ...CUSTOM_PARTICLE_TYPES] as const;
const ALL_FILTER_TYPES = [...FREE_FILTER_TYPES, ...PLUS_FILTER_TYPES, ...CUSTOM_FILTER_TYPES] as const;

// The 24 free-tier presets — confirmed live against Gambit's FXMaster fork 8.1.4
// via list-valid-presets (the fork is backward-compatible: all 24 still play; it
// also registers 18 themed plus-only presets that require fxmaster-plus, which
// list-valid-presets correctly excludes when plus is absent).
const FREE_PRESET_NAMES = [
  'acid-rain', 'autumn-leaves', 'blizzard', 'blood-rain', 'cloudy', 'drizzle',
  'fog', 'hail', 'heat-wave', 'hurricane', 'ice-storm', 'mist', 'monsoon',
  'nullfront', 'overcast', 'partly-cloudy', 'rain', 'rolling-fog', 'sleet',
  'snow', 'spore-cloud', 'sunshower', 'thunderstorm', 'wildfire-smoke',
] as const;

const BLEND_MODES = [
  'normal', 'multiply', 'screen', 'overlay', 'softLight', 'hardLight',
  'colorDodge', 'colorBurn', 'darken', 'lighten', 'difference', 'exclusion',
] as const;

/** Base particle options shared by all 16 free particle types. */
const particleBaseOptions = z.object({
  direction: z.union([z.number(), z.string()]).optional(),
  speed: z.union([z.number(), z.string()]).optional(),
  density: z.union([z.number(), z.string()]).optional(),
  scale: z.number().optional(),
  alpha: z.number().optional(),
  lifetime: z.number().optional(),
  tint: z.object({ apply: z.boolean(), value: z.string() }).optional(),
  belowTokens: z.boolean().optional(),
  belowTiles: z.boolean().optional(),
  belowForeground: z.boolean().optional(),
  blendMode: z.enum(BLEND_MODES).optional(),
  darknessActivationEnabled: z.boolean().optional(),
  darknessActivationRange: z.object({ min: z.number(), max: z.number() }).optional(),
  soundFxEnabled: z.boolean().optional(),
  // Plus-only: levels (array of level IDs — silently ignored without Levels module)
  levels: z.array(z.string()).optional(),
});

/** Particle entry for play-particles (type + type-specific options). PLUS types need fxmaster-plus active. */
const particleEntry = z.object({
  type: z.enum(ALL_PARTICLE_TYPES),
  options: particleBaseOptions.catchall(z.unknown()).optional(),
});

/** Filter entry for play-filters. PLUS types (sunlight) need fxmaster-plus active. */
const filterEntry = z.object({
  type: z.enum(ALL_FILTER_TYPES),
  options: z.record(z.unknown()).optional(),
});

/** Preset play options shared by play-preset / toggle-preset / switch-preset. */
const presetPlayOptions = z.object({
  topDown: z.boolean().optional(),
  direction: z.union([z.number(), z.string()]).optional(),
  color: z.string().optional(),
  speed: z.union([z.number(), z.string()]).optional(),
  density: z.union([z.number(), z.string()]).optional(),
  belowTokens: z.boolean().optional(),
  belowTiles: z.boolean().optional(),
  belowForeground: z.boolean().optional(),
  darknessActivationEnabled: z.boolean().optional(),
  darknessActivationRange: z.object({ min: z.number(), max: z.number() }).optional(),
  scene: z.string().optional(),
  silent: z.boolean().optional(),
});

// ── Preset ops ───────────────────────────────────────────────────────────────

export const playPresetInput = z.object({
  action: z.literal('play-preset'),
  preset: z.enum(FREE_PRESET_NAMES),
  options: presetPlayOptions.optional(),
}).strict();

export const stopPresetInput = z.object({
  action: z.literal('stop-preset'),
  preset: z.enum(FREE_PRESET_NAMES),
  scene: z.string().optional(),
}).strict();

export const togglePresetInput = z.object({
  action: z.literal('toggle-preset'),
  preset: z.enum(FREE_PRESET_NAMES),
  options: presetPlayOptions.optional(),
}).strict();

export const switchPresetInput = z.object({
  action: z.literal('switch-preset'),
  /** Preset to switch to. OMIT (or pass null) to stop all active API presets. */
  preset: z.enum(FREE_PRESET_NAMES).nullable().optional(),
  options: presetPlayOptions.optional(),
}).strict();

export const listPresetsInput = z.object({
  action: z.literal('list-presets'),
}).strict();

export const listActivePresetsInput = z.object({
  action: z.literal('list-active-presets'),
  scene: z.string().optional(),
}).strict();

export const listValidPresetsInput = z.object({
  action: z.literal('list-valid-presets'),
  topDown: z.boolean().optional(),
}).strict();

// ── Raw effect ops ────────────────────────────────────────────────────────────

export const playParticlesInput = z.object({
  action: z.literal('play-particles'),
  particles: z.array(particleEntry).min(1),
  scene: z.string().optional(),
  skipFading: z.boolean().optional(),
  apiToggleKey: z.string().optional(),
}).strict();

export const playFiltersInput = z.object({
  action: z.literal('play-filters'),
  filters: z.array(filterEntry).min(1),
  scene: z.string().optional(),
  skipFading: z.boolean().optional(),
  apiToggleKey: z.string().optional(),
}).strict();

export const stopEffectsInput = z.object({
  action: z.literal('stop-effects'),
  particles: z.array(z.string()).optional(),
  filters: z.array(z.string()).optional(),
  effects: z.array(z.string()).optional(),
  scene: z.string().optional(),
  skipFading: z.boolean().optional(),
}).strict();

export const toggleEffectsInput = z.object({
  action: z.literal('toggle-effects'),
  particles: z.array(z.string()).optional(),
  filters: z.array(z.string()).optional(),
  effects: z.array(z.string()).optional(),
  toggleKey: z.string().optional(),
  scene: z.string().optional(),
  skipFading: z.boolean().optional(),
}).strict();

// ── Nuclear clear ─────────────────────────────────────────────────────────────
//
// CCR-4 confirm gate: must send confirm:true to proceed.

export const clearEffectsInput = z.object({
  action: z.literal('clear-effects'),
  /** Which flags to clear. Defaults to both when omitted. */
  target: z.enum(['particles', 'filters', 'both', 'stack']).default('both'),
  scene: z.string().optional(),
  /** CCR-4: must be true to proceed — clears all scene FX state irreversibly. */
  confirm: z.boolean(),
}).strict();

// ── Kill switch ───────────────────────────────────────────────────────────────
//
// Disabling all FX (disableAll:true) requires confirm:true (CCR-4 / SUPPORTED_WITH_CONFIRMATION).

export const setEnabledInput = z.object({
  action: z.literal('set-enabled'),
  /** true = disable all FX (kill-switch), false = re-enable */
  disableAll: z.boolean(),
  /** CCR-4: confirm required when disableAll:true — FX rendering is suspended world-wide. */
  confirm: z.boolean().optional(),
}).strict();

// ── Region behaviors ──────────────────────────────────────────────────────────
//
// These actions create/update fxmaster RegionBehavior documents on a Region.
// The region must already exist (regionId). Behavior type is fixed per action.

export const setRegionParticlesInput = z.object({
  action: z.literal('set-region-particles'),
  regionId: z.string(),
  particleType: z.enum(ALL_PARTICLE_TYPES),
  options: particleBaseOptions.catchall(z.unknown()).optional(),
  /** Replace all existing particleEffectsRegion behaviors on this region. */
  replace: z.boolean().optional(),
}).strict();

export const setRegionFiltersInput = z.object({
  action: z.literal('set-region-filters'),
  regionId: z.string(),
  filterType: z.enum(ALL_FILTER_TYPES),
  options: z.record(z.unknown()).optional(),
  replace: z.boolean().optional(),
}).strict();

export const suppressSceneParticlesInput = z.object({
  action: z.literal('suppress-scene-particles'),
  regionId: z.string(),
  /** Remove the suppression behavior instead of adding it. */
  remove: z.boolean().optional(),
}).strict();

export const suppressSceneFiltersInput = z.object({
  action: z.literal('suppress-scene-filters'),
  regionId: z.string(),
  remove: z.boolean().optional(),
}).strict();

// ── Exported variant array (inserted into discriminated union by schemas.ts) ─

export const fxmasterVariants = [
  playPresetInput,
  stopPresetInput,
  togglePresetInput,
  switchPresetInput,
  listPresetsInput,
  listActivePresetsInput,
  listValidPresetsInput,
  playParticlesInput,
  playFiltersInput,
  stopEffectsInput,
  toggleEffectsInput,
  clearEffectsInput,
  setEnabledInput,
  setRegionParticlesInput,
  setRegionFiltersInput,
  suppressSceneParticlesInput,
  suppressSceneFiltersInput,
] as const;
