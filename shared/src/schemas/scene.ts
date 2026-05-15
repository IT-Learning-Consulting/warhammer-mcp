// Phase 4 mcp_crud_expansion — Scene entity-level CRUD umbrella schema.
//
// Single `scene` MCP tool with 11 actions on Scene + embedded TokenDocument.
// Replaces the 5 legacy schemas previously in this file (GetActiveSceneInput,
// ListScenesInput, SwitchSceneInput, AddActorsToSceneInput, DeleteTokenInput)
// plus folds the standalone add-actors-to-scene and delete-token tools.
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
import { ApplyTemplateInput } from './actor.js';

// ── Constants & shared shapes ────────────────────────────────────────────────

const FOUNDRY_ID = z.string().min(1);

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
  journal: FOUNDRY_ID.nullable().optional(),
  journalEntryPage: FOUNDRY_ID.nullable().optional(),
  playlist: FOUNDRY_ID.nullable().optional(),
  playlistSound: FOUNDRY_ID.nullable().optional(),
  // Weather is non-nullable StringField; "" = no weather.
  weather: z.string().optional(),
  // Organization
  folder: FOUNDRY_ID.nullable().optional(),
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
    sceneId: FOUNDRY_ID,
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
    sceneId: FOUNDRY_ID,
  })
  .strict();

export const SceneCloneInput = z
  .object({
    action: z.literal('clone'),
    sceneId: FOUNDRY_ID,
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
    sceneId: FOUNDRY_ID,
  })
  .strict();

export const SceneViewInput = z
  .object({
    action: z.literal('view'),
    sceneId: FOUNDRY_ID,
  })
  .strict();

export const SceneThumbnailInput = z
  .object({
    action: z.literal('thumbnail'),
    sceneId: FOUNDRY_ID,
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
    sceneId: FOUNDRY_ID.optional(),
    includeTokens: z.boolean().optional(),
    includeHidden: z.boolean().optional(),
  })
  .strict();

export const SceneListInput = z
  .object({
    action: z.literal('list'),
    filter: z.string().optional(),
    include_active_only: z.boolean().optional(),
    page: z.number().int().min(1).optional(),
    pageSize: z.number().int().min(1).max(100).optional(),
    countOnly: z.boolean().optional(),
  })
  .strict();

// BUG-051 hotfix carry-forward: prototype-token pattern. quantities[i] = number
// of tokens to drop for actorIds[i]. Missing → 1 each. Lets one world actor
// with prototypeToken.actorLink=false produce N unlinked tokens each carrying
// its own ActorDelta. sceneId optional (TOOL-IDEA-004 carry-forward).
// Note: quantities.length === actorIds.length is enforced at handler time
// (`.refine()` cannot be used on discriminatedUnion branches in Zod v3).
export const SceneAddTokensInput = z
  .object({
    action: z.literal('add-tokens'),
    actorIds: z.array(FOUNDRY_ID).min(1),
    quantities: z.array(z.number().int().positive()).optional(),
    placement: z.enum(['random', 'grid', 'center']).optional(),
    hidden: z.boolean().optional(),
    sceneId: FOUNDRY_ID.optional(),
  })
  .strict();

// BUG-051 hotfix companion. Single-token delete; pairs with add-tokens for
// encounter unwind + orphan-token cleanup.
export const SceneDeleteTokenInput = z
  .object({
    action: z.literal('delete-token'),
    sceneId: FOUNDRY_ID,
    tokenId: FOUNDRY_ID,
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
  SceneAddTokensInput,
  SceneDeleteTokenInput,
]);

export type SceneToolInputType = z.infer<typeof SceneToolInput>;
export type SceneCreateInputType = z.infer<typeof SceneCreateInput>;
export type SceneUpdateInputType = z.infer<typeof SceneUpdateInput>;
export type SceneDeleteInputType = z.infer<typeof SceneDeleteInput>;
export type SceneCloneInputType = z.infer<typeof SceneCloneInput>;
export type SceneActivateInputType = z.infer<typeof SceneActivateInput>;
export type SceneViewInputType = z.infer<typeof SceneViewInput>;
export type SceneThumbnailInputType = z.infer<typeof SceneThumbnailInput>;
export type SceneGetInputType = z.infer<typeof SceneGetInput>;
export type SceneListInputType = z.infer<typeof SceneListInput>;
export type SceneAddTokensInputType = z.infer<typeof SceneAddTokensInput>;
export type SceneDeleteTokenInputType = z.infer<typeof SceneDeleteTokenInput>;

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

// Sparse token shape surfaced in get includeTokens / add-tokens response.
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
  success: true;
  scene: SceneViewModel;
  requestedChanges: Record<string, unknown>;
}

export interface SceneUpdateResponse {
  success: true;
  scene: SceneViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}

export interface SceneDeleteResponse {
  success: true;
  deletedId: string;
  deletedName: string;
  remainingScenes: number;
}

export interface SceneCloneResponse {
  success: true;
  source: { id: string; name: string };
  clone: SceneViewModel;
}

export interface SceneActivateResponse {
  success: true;
  activatedId: string;
  activatedName: string;
  previousActiveId: string | null;
}

export interface SceneViewResponse {
  success: true;
  viewedId: string;
  viewedName: string;
  isLocalUser: boolean;
}

export interface SceneThumbnailResponse {
  success: true;
  sceneId: string;
  sceneName: string;
  // Foundry's createThumbnail returns a data URL ("data:image/webp;base64,...").
  thumbDataUrl: string;
  width: number;
  height: number;
  format: string;
}

export interface SceneGetResponse {
  success: true;
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
  success: true;
  scenes: SceneListEntry[];
}

export interface SceneListPaginatedResponse {
  success: true;
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  scenes: SceneListEntry[];
}

export interface SceneListCountOnlyResponse {
  success: true;
  total: number;
  filterApplied: string | null;
}

export type SceneListResponse =
  | SceneListBareResponse
  | SceneListPaginatedResponse
  | SceneListCountOnlyResponse;

export interface SceneAddTokensResponse {
  success: true;
  sceneId: string;
  sceneName: string;
  placedTokens: SceneTokenView[];
  // Per-actor placement count summary (useful when quantities provided).
  perActor: Array<{ actorId: string; placed: number }>;
}

export interface SceneDeleteTokenResponse {
  success: true;
  sceneId: string;
  sceneName: string;
  deletedTokenId: string;
  remainingTokens: number;
}

// ── Legacy / unrelated schemas retained ──────────────────────────────────────
//
// ApplyTemplateToTokenInput is a separate MCP tool, not folded into the scene
// umbrella. Kept here because the existing tools/apply-template-to-token.ts
// imports it from this file. Behavior unchanged from pre-Phase-4 surface.

export const ApplyTemplateToTokenInput = z
  .object({
    sceneId: FOUNDRY_ID,
    tokenId: FOUNDRY_ID,
    templateUuid: ApplyTemplateInput.shape.templateUuid,
    preResolvedChoices: ApplyTemplateInput.shape.preResolvedChoices,
  })
  .strict();
