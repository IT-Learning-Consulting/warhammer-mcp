// Phase 4 mcp_crud_expansion — Scene entity-level CRUD umbrella schema.
//
// Single `scene` MCP tool with 11 actions on Scene + embedded TokenDocument.
// Replaces the 5 legacy schemas previously in this file (GetActiveSceneInput,
// ListScenesInput, SwitchSceneInput) plus folds Scene-level actions.
// Phase 5: add-tokens / delete-token migrated to the `token` umbrella.
//
// Phase 0 probe anchors (verified via F12 paste 2026-05-14, see
// `.agents/research/mcp_crud_expansion/phase4_probes.md`):
//   - fog.* is nested: fog.exploration, fog.overlay, fog.reset, fog.colors.{explored,unexplored}
//   - grid.type is the CONST.GRID_TYPES 0-5 enum (0=GRIDLESS, 1=SQUARE,
//     2=HEXODDR, 3=HEXEVENR, 4=HEXODDQ, 5=HEXEVENQ)
//   - grid.{style, thickness} exist but DROPPED from Phase 4 write scope (UI-conflated, rarely meaningful)
//   - backgroundElevation / backgroundVolume DO NOT exist anywhere in v13 schema (only foregroundElevation top-level)
//   - environment.darknessLock (NOT darknessLevelLock — stale types-interface drift)
//   - environment.globalLight has 10 sub-fields {enabled, alpha, bright, color, coloration,
//     luminosity, saturation, contrast, shadows, darkness.{min, max}}
//   - background (TextureData) has 11 sub-fields {src, anchorX/Y, offsetX/Y, fit,
//     scaleX/Y, rotation, tint, alphaThreshold}
//   - FK fields (journal, journalEntryPage, playlist, playlistSound, folder) are
//     ALL nullable: true; Foundry does NOT auto-NULL on referent delete (stale FK persists)
//   - weather is non-nullable StringField — use "" for "no weather", NOT null
//   - Scene.clone({...}, {save: true}) persists in one step (no separate create() needed)
//
// CCR-Schema-Fidelity: Zod field paths mirror Foundry defineSchema paths 1:1.
// CCR-Envelope-Consumer: every response interface is a concrete shape, no <any>.
// CCR-Umbrella-Hygiene: action names are <verb> or <verb>-<noun> kebab-case.

import { z } from 'zod';
import { FOUNDRY_ID, paginationFields } from './primitives.js';
import { ApplyTemplateInput } from './actor.js';
import {
  SceneId,
  JournalEntryId,
  JournalEntryPageId,
  PlaylistId,
  PlaylistSoundId,
  FolderId,
  TokenId,
  PackId,
} from './branded-ids.js';

// ── Constants & shared shapes ────────────────────────────────────────────────

// 0 = GRIDLESS, 1 = SQUARE, 2 = HEXODDR, 3 = HEXEVENR, 4 = HEXODDQ, 5 = HEXEVENQ
const GridTypeEnum = z
  .number()
  .int()
  .min(0)
  .max(5)
  .describe('CONST.GRID_TYPES: 0=GRIDLESS, 1=SQUARE, 2=HEXODDR, 3=HEXEVENR, 4=HEXODDQ, 5=HEXEVENQ');

// Foundry document ownership level: 0=NONE, 1=LIMITED, 2=OBSERVER, 3=OWNER.
// Scene ownership accepts the same map shape as JournalEntry — { default?, "<userId>"?: 0|1|2|3 }.
const OwnershipMap = z
  .record(z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]))
  .describe('Ownership map: default + per-user levels. 0=NONE, 1=LIMITED, 2=OBSERVER, 3=OWNER.');

// ── Sub-schemas for Scene fields ─────────────────────────────────────────────

// TextureData (background field). 11 sub-fields per Probe A.
// src is nullable per live schema; all others are required-but-non-nullable.
const BackgroundTextureInput = z
  .object({
    src: z.string().nullable().optional(),
    anchorX: z.number().optional(),
    anchorY: z.number().optional(),
    offsetX: z.number().optional(),
    offsetY: z.number().optional(),
    fit: z.string().optional(),
    scaleX: z.number().optional(),
    scaleY: z.number().optional(),
    rotation: z.number().optional(),
    tint: z.string().optional(),
    alphaThreshold: z.number().min(0).max(1).optional(),
  })
  .strict();

// initial.{x, y, scale} — view-position SchemaField. All NumberField, all nullable.
const InitialViewInput = z
  .object({
    x: z.number().nullable().optional(),
    y: z.number().nullable().optional(),
    scale: z.number().nullable().optional(),
  })
  .strict();

// grid.* sub-fields (excluding style/thickness — dropped from Phase 4 scope).
const GridInput = z
  .object({
    type: GridTypeEnum.optional(),
    size: z.number().int().positive().optional(),
    color: z.string().optional(),
    alpha: z.number().min(0).max(1).optional(),
    distance: z.number().positive().optional(),
    units: z.string().optional(),
  })
  .strict();

// fog.colors.{explored, unexplored} — both nullable ColorField.
const FogColorsInput = z
  .object({
    explored: z.string().nullable().optional(),
    unexplored: z.string().nullable().optional(),
  })
  .strict();

// fog.* nested SchemaField (Probe A confirmed nested, not flat).
const FogInput = z
  .object({
    exploration: z.boolean().optional(),
    reset: z.number().nullable().optional(),
    overlay: z.string().nullable().optional(),
    colors: FogColorsInput.optional(),
  })
  .strict();

// environment.globalLight.darkness.{min, max} — two AlphaFields.
const GlobalLightDarknessInput = z
  .object({
    min: z.number().min(0).max(1).optional(),
    max: z.number().min(0).max(1).optional(),
  })
  .strict();

// environment.globalLight.* — 10 sub-fields per Probe A.
const GlobalLightInput = z
  .object({
    enabled: z.boolean().optional(),
    alpha: z.number().min(0).max(1).optional(),
    bright: z.boolean().optional(),
    color: z.string().nullable().optional(),
    coloration: z.number().nullable().optional(),
    luminosity: z.number().optional(),
    saturation: z.number().optional(),
    contrast: z.number().optional(),
    shadows: z.number().optional(),
    darkness: GlobalLightDarknessInput.optional(),
  })
  .strict();

// environment.base.* and environment.dark.* — day/night cycle SchemaFields.
const EnvironmentCycleInput = z
  .object({
    hue: z.number().optional(),
    intensity: z.number().min(0).max(1).optional(),
    luminosity: z.number().optional(),
    saturation: z.number().optional(),
    shadows: z.number().optional(),
  })
  .strict();

// environment.* nested SchemaField.
const EnvironmentInput = z
  .object({
    darknessLevel: z.number().min(0).max(1).optional(),
    darknessLock: z.boolean().optional(),
    cycle: z.boolean().optional(),
    globalLight: GlobalLightInput.optional(),
    base: EnvironmentCycleInput.optional(),
    dark: EnvironmentCycleInput.optional(),
  })
  .strict();

// ── Writable Scene fields (shared by create + update.changes) ────────────────
//
// SceneConfig UI surface (Basics/Grid/Lighting/Ambience tabs) plus the §6.2
// EXPANDED scope from Phase 0 probe findings. Every field is .optional() here
// so a single shape can serve both create (defaults applied by Foundry) and
// update.changes (partial). The create action attaches .min(1) name separately.

const SceneWritableFields = {
  // Basics
  name: z.string().min(1).optional(),
  active: z.boolean().optional(),
  navigation: z.boolean().optional(),
  navOrder: z.number().int().optional(),
  navName: z.string().optional(),
  background: BackgroundTextureInput.optional(),
  foreground: z.string().nullable().optional(),
  foregroundElevation: z.number().int().nullable().optional(),
  thumb: z.string().nullable().optional(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  padding: z.number().min(0).max(0.5).optional(),
  initial: InitialViewInput.optional(),
  backgroundColor: z.string().optional(),
  // Grid
  grid: GridInput.optional(),
  // Lighting / Vision
  tokenVision: z.boolean().optional(),
  fog: FogInput.optional(),
  environment: EnvironmentInput.optional(),
  // Ambience (FK fields — all nullable per Probe A)
  journal: JournalEntryId.nullable().optional(),
  journalEntryPage: JournalEntryPageId.nullable().optional(),
  playlist: PlaylistId.nullable().optional(),
  playlistSound: PlaylistSoundId.nullable().optional(),
  // Weather is non-nullable StringField; "" = no weather.
  weather: z.string().optional(),
  // Organization
  folder: FolderId.nullable().optional(),
  sort: z.number().int().optional(),
  // Permissions
  ownership: OwnershipMap.optional(),
  // Module/system flags
  flags: z.record(z.unknown()).optional(),
};

// ── 11 action input schemas ──────────────────────────────────────────────────

// Writable fields with `name` lifted out — create overrides it with .min(1) required.
const { name: _writableNameOmit, ...SceneWritableFieldsNoName } = SceneWritableFields;

export const SceneCreateInput = z
  .object({
    action: z.literal('create'),
    ...SceneWritableFieldsNoName,
    // name is required on create (StringField required: true in live schema).
    name: z.string().min(1),
  })
  .strict();

export const SceneUpdateInput = z
  .object({
    action: z.literal('update'),
    sceneId: SceneId,
    changes: z
      .object(SceneWritableFields)
      .strict()
      .refine((obj) => Object.keys(obj).length > 0, {
        message: 'SCENE_EMPTY_PAYLOAD: changes object must contain at least one field',
      }),
  })
  .strict();

export const SceneDeleteInput = z
  .object({
    action: z.literal('delete'),
    sceneId: SceneId,
    // Phase 10 cross-doc-fk: when true, clears inbound FK references (e.g.
    // tokens referencing this scene via Note.entryId targets) before delete.
    // Default false preserves Phase 4 behavior (R10.6 backward-compat).
    cascade: z.boolean().default(false).optional(),
  })
  .strict();

export const SceneCloneInput = z
  .object({
    action: z.literal('clone'),
    sceneId: SceneId,
    // newName is required so the clone is distinguishable in the directory.
    newName: z.string().min(1),
    // Optional overrides applied via Scene.clone(overrides, {save:true}).
    // Each field is the same partial shape as update.changes.
    overrides: z.object(SceneWritableFields).strict().optional(),
  })
  .strict();

export const SceneActivateInput = z
  .object({
    action: z.literal('activate'),
    sceneId: SceneId,
  })
  .strict();

export const SceneViewInput = z
  .object({
    action: z.literal('view'),
    sceneId: SceneId,
  })
  .strict();

export const SceneThumbnailInput = z
  .object({
    action: z.literal('thumbnail'),
    sceneId: SceneId,
    // Foundry's createThumbnail() accepts img/width/height/format/quality overrides.
    // All optional — Foundry picks defaults (300x100 webp at 0.8 quality) per docs.
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    format: z.string().optional(),
    quality: z.number().min(0).max(1).optional(),
  })
  .strict();

export const SceneGetInput = z
  .object({
    action: z.literal('get'),
    // sceneId optional — defaults to currently active scene (back-compat with
    // legacy get-current-scene shape).
    sceneId: SceneId.optional(),
    includeTokens: z.boolean().optional(),
    includeHidden: z.boolean().optional(),
  })
  .strict();

export const SceneListInput = z
  .object({
    action: z.literal('list'),
    filter: z.string().optional(),
    include_active_only: z.boolean().optional(),
    ...paginationFields(),
    countOnly: z.boolean().optional(),
  })
  .strict();

// Phase 5: SceneAddTokensInput / SceneDeleteTokenInput retired — those actions
// now live on the dedicated `token` umbrella (shared/src/schemas/token.ts).

// ── Phase 9A — Scene reset & presentation actions ────────────────────────────

// Embedded layers clear-layer can bulk-delete (tokens excluded — own umbrella).
export const SCENE_CLEARABLE_LAYERS = [
  'lights',
  'sounds',
  'tiles',
  'templates',
  'regions',
  'drawings',
  'notes',
] as const;

// R9A.1 — bulk-clear one embedded collection. CCR-4 destructive: dryRun preview
// + confirm:z.literal(true). dryRun returns {count, items:[{id,name}]} without mutating.
export const SceneClearLayerInput = z
  .object({
    action: z.literal('clear-layer'),
    sceneId: SceneId,
    layer: z.enum(SCENE_CLEARABLE_LAYERS),
    dryRun: z.boolean().optional(),
    confirm: z.literal(true),
  })
  .strict();

// R9A.2 — reset fog of war (deletes FogExploration docs for the scene). CCR-2a.
export const SceneResetFogInput = z
  .object({
    action: z.literal('reset-fog'),
    sceneId: SceneId,
    confirm: z.literal(true),
  })
  .strict();

// R9A.3 — animate a darkness transition + persist. Hybrid (animate canvas-only,
// then scene.update so the persisted environment.darknessLevel re-read is meaningful).
// target: 'day'→0, 'dark'→1, or an explicit 0-1 number.
export const SceneLightingTransitionInput = z
  .object({
    action: z.literal('lighting-transition'),
    sceneId: SceneId,
    target: z.union([z.enum(['day', 'dark']), z.number().min(0).max(1)]),
    confirm: z.literal(true),
  })
  .strict();

// R9A.4 — preload a scene to all clients (game.scenes.preload(id, true)). CCR-2b transient.
export const ScenePreloadInput = z
  .object({
    action: z.literal('preload'),
    sceneId: SceneId,
  })
  .strict();

// R9B.5 — import a Scene from a compendium pack into the world. CCR-2a.
// {packId, documentId} per plan D1 (NOT {uuid}).
export const SceneImportFromCompendiumInput = z
  .object({
    action: z.literal('import-from-compendium'),
    packId: PackId,
    documentId: FOUNDRY_ID, // polymorphic: not branded (Phase 1 design; FOUNDRY_ID primitive per C2 task 5.2)
  })
  .strict();

// ── Discriminated-union umbrella ─────────────────────────────────────────────

export const SceneToolInput = z.discriminatedUnion('action', [
  SceneCreateInput,
  SceneUpdateInput,
  SceneDeleteInput,
  SceneCloneInput,
  SceneActivateInput,
  SceneViewInput,
  SceneThumbnailInput,
  SceneGetInput,
  SceneListInput,
  SceneClearLayerInput,
  SceneResetFogInput,
  SceneLightingTransitionInput,
  ScenePreloadInput,
  SceneImportFromCompendiumInput,
]);

export type SceneToolInputType = z.infer<typeof SceneToolInput>;
export type SceneClearLayerInputType = z.infer<typeof SceneClearLayerInput>;
export type SceneResetFogInputType = z.infer<typeof SceneResetFogInput>;
export type SceneLightingTransitionInputType = z.infer<typeof SceneLightingTransitionInput>;
export type ScenePreloadInputType = z.infer<typeof ScenePreloadInput>;
export type SceneImportFromCompendiumInputType = z.infer<typeof SceneImportFromCompendiumInput>;
export type SceneCreateInputType = z.infer<typeof SceneCreateInput>;
export type SceneUpdateInputType = z.infer<typeof SceneUpdateInput>;
export type SceneDeleteInputType = z.infer<typeof SceneDeleteInput>;
export type SceneCloneInputType = z.infer<typeof SceneCloneInput>;
export type SceneActivateInputType = z.infer<typeof SceneActivateInput>;
export type SceneViewInputType = z.infer<typeof SceneViewInput>;
export type SceneThumbnailInputType = z.infer<typeof SceneThumbnailInput>;
export type SceneGetInputType = z.infer<typeof SceneGetInput>;
export type SceneListInputType = z.infer<typeof SceneListInput>;

// ── Concrete response shapes (CCR-Envelope-Consumer §3) ──────────────────────
//
// Each handler returns this exact shape after BaseTool.query unwraps the
// producer's {success, data} envelope. Every interface is a closed shape — no
// `[k: string]: any` and no <any> casts on consumer site.

// Shared "scene view" payload: the §6.2 surface a get/list/clone/update returns.
// `_source.journal` is the raw stored ID; `journalLinked` reports whether it
// resolves (DP-19 dangling-FK surface — Probe D finding).
export interface SceneViewModel {
  id: string;
  name: string;
  active: boolean;
  navigation: boolean;
  navName: string | null;
  width: number | null;
  height: number | null;
  padding: number;
  backgroundColor: string;
  // Basics
  background: {
    src: string | null;
    anchorX: number;
    anchorY: number;
    offsetX: number;
    offsetY: number;
    fit: string;
    scaleX: number;
    scaleY: number;
    rotation: number;
    tint: string;
    alphaThreshold: number;
  };
  foreground: string | null;
  foregroundElevation: number | null;
  thumb: string | null;
  initial: { x: number | null; y: number | null; scale: number | null };
  // Grid
  grid: {
    type: number;
    typeName: string; // 'GRIDLESS' | 'SQUARE' | 'HEXODDR' | ...
    size: number;
    style: string;
    thickness: number;
    color: string;
    alpha: number;
    distance: number;
    units: string;
  };
  // Lighting
  tokenVision: boolean;
  fog: {
    exploration: boolean;
    reset: number | null;
    overlay: string | null;
    colors: { explored: string | null; unexplored: string | null };
  };
  environment: {
    darknessLevel: number;
    darknessLock: boolean;
    cycle: boolean;
    globalLight: {
      enabled: boolean;
      alpha: number;
      bright: boolean;
      color: string | null;
      coloration: number | null;
      luminosity: number;
      saturation: number;
      contrast: number;
      shadows: number;
      darkness: { min: number; max: number };
    };
    base: { hue: number; intensity: number; luminosity: number; saturation: number; shadows: number };
    dark: { hue: number; intensity: number; luminosity: number; saturation: number; shadows: number };
  };
  // Ambience (FKs — `*Linked` distinguishes stored-but-orphan from null per Probe D)
  journal: string | null;
  journalLinked: boolean;
  journalEntryPage: string | null;
  journalEntryPageLinked: boolean;
  playlist: string | null;
  playlistLinked: boolean;
  playlistSound: string | null;
  playlistSoundLinked: boolean;
  weather: string;
  // Organization
  folder: string | null;
  folderLinked: boolean;
  sort: number;
  // Counts of embedded collections (Phase 5 will expose embedded CRUD)
  counts: {
    tokens: number;
    walls: number;
    lights: number;
    sounds: number;
    notes: number;
    drawings: number;
    regions: number;
    templates: number;
    tiles: number;
  };
  ownership: { default: number; [userId: string]: number };
}

// Sparse token shape surfaced in scene.get includeTokens response.
export interface SceneTokenView {
  id: string;
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  actorId: string | null;
  disposition: string; // 'hostile' | 'neutral' | 'friendly' | 'unknown'
  hidden: boolean;
  hasImage: boolean;
}

// ── Action-specific response interfaces ──────────────────────────────────────

export interface SceneCreateResponse {
  scene: SceneViewModel;
  requestedChanges: Record<string, unknown>;
}

export interface SceneUpdateResponse {
  scene: SceneViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}

export interface SceneDeleteResponse {
  deletedId: string;
  deletedName: string;
  remainingScenes: number;
  // Phase 10 cross-doc-fk: present only when `cascade: true` was set on input.
  // Lists docs whose FK pointing AT this scene was cleared mid-delete.
  affectedDocs?: import('./cross-doc-fk.js').FkAffectedDocEntry[];
}

export interface SceneCloneResponse {
  source: { id: string; name: string };
  clone: SceneViewModel;
}

export interface SceneActivateResponse {
  activatedId: string;
  activatedName: string;
  previousActiveId: string | null;
}

export interface SceneViewResponse {
  viewedId: string;
  viewedName: string;
  isLocalUser: boolean;
}

export interface SceneThumbnailResponse {
  sceneId: string;
  sceneName: string;
  // Foundry's createThumbnail returns a data URL ("data:image/webp;base64,...").
  thumbDataUrl: string;
  width: number;
  height: number;
  format: string;
}

export interface SceneGetResponse {
  scene: SceneViewModel;
  tokens?: SceneTokenView[];
  tokenSummary?: {
    total: number;
    byDisposition: { friendly: number; neutral: number; hostile: number; unknown: number };
    hasActors: number;
    withoutActors: number;
  };
}

// list response shape varies by pagination input. The bare-array form is
// preserved for back-compat with TOOL-IDEA-001 carry-forward callers.
export interface SceneListEntry {
  id: string;
  name: string;
  active: boolean;
  navigation: boolean;
  width: number | null;
  height: number | null;
  folder: string | null;
}

export interface SceneListBareResponse {
  scenes: SceneListEntry[];
}

export interface SceneListPaginatedResponse {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  scenes: SceneListEntry[];
}

export interface SceneListCountOnlyResponse {
  total: number;
  filterApplied: string | null;
}

export type SceneListResponse =
  | SceneListBareResponse
  | SceneListPaginatedResponse
  | SceneListCountOnlyResponse;

// ── Phase 9A response interfaces ─────────────────────────────────────────────

// clear-layer: `items` are the docs that were (confirm) or would be (dryRun)
// deleted. `dryRun` distinguishes; on confirm `count === items.length` deleted.
export interface SceneClearLayerResponse {
  sceneId: string;
  layer: string;
  dryRun: boolean;
  count: number;
  items: Array<{ id: string; name: string }>;
}

export interface SceneResetFogResponse {
  sceneId: string;
  // CCR-2a: count of FogExploration docs remaining for the scene after reset (asserted 0).
  fogDocsRemaining: number;
}

export interface SceneLightingTransitionResponse {
  sceneId: string;
  target: number;
  // Persisted darkness after animate + scene.update (re-read of environment.darknessLevel).
  darknessLevel: number;
}

export interface ScenePreloadResponse {
  sceneId: string;
  sceneName: string;
  // CCR-2b transient: the preload Promise resolved; no persisted state to re-read.
  preloaded: true;
}

export interface SceneImportFromCompendiumResponse {
  scene: SceneViewModel;
  sourcePack: string;
}

// ── Legacy / unrelated schemas retained ──────────────────────────────────────
//
// ApplyTemplateToTokenInput is a separate MCP tool, not folded into the scene
// umbrella. Kept here because the existing tools/apply-template-to-token.ts
// imports it from this file. Behavior unchanged from pre-Phase-4 surface.

export const ApplyTemplateToTokenInput = z
  .object({
    sceneId: SceneId,
    tokenId: TokenId,
    templateUuid: ApplyTemplateInput.shape.templateUuid,
    preResolvedChoices: ApplyTemplateInput.shape.preResolvedChoices,
    // Phase 12 R12.1: dryRun → return the serialized plan (incl. the WRITE #3 token-rename note), perform zero writes.
    dryRun: ApplyTemplateInput.shape.dryRun,
  })
  .strict();
