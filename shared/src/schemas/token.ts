// Phase 5 mcp_crud_expansion — Token umbrella schema.
//
// Lifted from phase5_probes.md §Token (Foundry 13.351).
// Spike-Sentinel 1 RESOLVED: sight has 9 sub-fields.
// 7 actions: create / update / delete / get / list / add / delete-token (last two
// migrated from scene umbrella per plan §Phase 5).
//
// Write-surface exclusions (per plan §Design Decisions):
//   - delta (ActorDeltaField) — read-only in Phase 5; deferred to Phase 8+ alongside Macro CRUD
//   - _movementHistory, _regions — underscore-prefixed Foundry internals
//
// ViewModel surfaces `actorLinked` boolean via formatFKLink (FK-orphan recovery).
// Enums (TOKEN_DISPOSITIONS, TOKEN_DISPLAY_MODES, TOKEN_SHAPES) carried as bounded
// numeric ranges; CONFIG.WFRP4E.* matchers happen at handler layer.

import { z } from 'zod';
import { LightDataSchema, type LightData } from './light-data.js';
import { TextureDataSchema, type TextureData } from './texture-data.js';

const FOUNDRY_ID = z.string().min(1);

// TOKEN_DISPOSITIONS: SECRET=-2, HOSTILE=-1, NEUTRAL=0, FRIENDLY=1
const DispositionEnum = z
  .number()
  .int()
  .min(-2)
  .max(1)
  .describe('CONST.TOKEN_DISPOSITIONS: -2=SECRET, -1=HOSTILE, 0=NEUTRAL, 1=FRIENDLY');

// TOKEN_DISPLAY_MODES: NONE=0, CONTROL=10, OWNER_HOVER=20, HOVER=30, OWNER=40, ALWAYS=50
const DisplayModeEnum = z
  .number()
  .int()
  .min(0)
  .max(50)
  .describe('CONST.TOKEN_DISPLAY_MODES: 0=NONE, 10=CONTROL, 20=OWNER_HOVER, 30=HOVER, 40=OWNER, 50=ALWAYS');

// TOKEN_SHAPES: ELLIPSE_1=0..RECTANGLE_2=5 (probe initial = 4 RECTANGLE_1)
const ShapeEnum = z.number().int().min(0).max(5);

const TokenSightInput = z
  .object({
    enabled: z.boolean().optional(),
    range: z.number().nullable().optional(),
    angle: z.number().min(0).max(360).optional(),
    visionMode: z.string().optional(),
    color: z.string().nullable().optional(),
    attenuation: z.number().min(0).max(1).optional(),
    brightness: z.number().optional(),
    saturation: z.number().optional(),
    contrast: z.number().optional(),
  })
  .strict();

const TokenBarInput = z
  .object({
    attribute: z.string().nullable().optional(),
  })
  .strict();

const TokenOccludableInput = z
  .object({
    radius: z.number().min(0).optional(),
  })
  .strict();

const TokenRingColorsInput = z
  .object({
    ring: z.string().nullable().optional(),
    background: z.string().nullable().optional(),
  })
  .strict();

const TokenRingSubjectInput = z
  .object({
    scale: z.number().positive().optional(),
    texture: z.string().nullable().optional(),
  })
  .strict();

const TokenRingInput = z
  .object({
    enabled: z.boolean().optional(),
    colors: TokenRingColorsInput.optional(),
    effects: z.number().int().optional(),
    subject: TokenRingSubjectInput.optional(),
  })
  .strict();

const TokenTurnMarkerInput = z
  .object({
    mode: z.number().int().optional(),
    animation: z.string().nullable().optional(),
    src: z.string().nullable().optional(),
    disposition: z.boolean().optional(),
  })
  .strict();

const TokenWritableFields = {
  name: z.string().optional(),
  displayName: DisplayModeEnum.optional(),
  actorId: FOUNDRY_ID.nullable().optional(),
  actorLink: z.boolean().optional(),
  // delta omitted from write surface
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  texture: TextureDataSchema.optional(),
  shape: ShapeEnum.optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  elevation: z.number().optional(),
  sort: z.number().int().optional(),
  locked: z.boolean().optional(),
  lockRotation: z.boolean().optional(),
  rotation: z.number().min(0).max(360).optional(),
  alpha: z.number().min(0).max(1).optional(),
  hidden: z.boolean().optional(),
  disposition: DispositionEnum.optional(),
  displayBars: DisplayModeEnum.optional(),
  bar1: TokenBarInput.optional(),
  bar2: TokenBarInput.optional(),
  light: LightDataSchema.optional(),
  sight: TokenSightInput.optional(),
  occludable: TokenOccludableInput.optional(),
  ring: TokenRingInput.optional(),
  turnMarker: TokenTurnMarkerInput.optional(),
  movementAction: z.string().nullable().optional(),
  // _movementHistory, _regions excluded — Foundry internals
  flags: z.record(z.unknown()).optional(),
};

export const TokenCreateInput = z
  .object({
    action: z.literal('create'),
    sceneId: FOUNDRY_ID,
    ...TokenWritableFields,
    name: z.string().min(1),
    x: z.number(),
    y: z.number(),
  })
  .strict();

export const TokenUpdateInput = z
  .object({
    action: z.literal('update'),
    sceneId: FOUNDRY_ID,
    tokenId: FOUNDRY_ID,
    changes: z
      .object(TokenWritableFields)
      .strict()
      .refine((obj) => Object.keys(obj).length > 0, {
        message: 'TOKEN_EMPTY_PAYLOAD: changes object must contain at least one field',
      }),
  })
  .strict();

export const TokenDeleteInput = z
  .object({
    action: z.literal('delete'),
    sceneId: FOUNDRY_ID,
    tokenId: FOUNDRY_ID,
  })
  .strict();

export const TokenGetInput = z
  .object({
    action: z.literal('get'),
    sceneId: FOUNDRY_ID,
    tokenId: FOUNDRY_ID,
  })
  .strict();

export const TokenListInput = z
  .object({
    action: z.literal('list'),
    sceneId: FOUNDRY_ID.optional(),
    filter: z.string().optional(),
    hidden: z.boolean().optional(),
    onlyLinked: z.boolean().optional(),
    page: z.number().int().min(1).optional(),
    pageSize: z.number().int().min(1).max(100).optional(),
    countOnly: z.boolean().optional(),
  })
  .strict();

// Migrated from scene umbrella (Phase 4 → Phase 5). Prototype-token bulk drop;
// quantities[i] = number of tokens to drop for actorIds[i]. Missing → 1 each.
export const TokenAddInput = z
  .object({
    action: z.literal('add'),
    actorIds: z.array(FOUNDRY_ID).min(1),
    quantities: z.array(z.number().int().positive()).optional(),
    placement: z.enum(['random', 'grid', 'center']).optional(),
    hidden: z.boolean().optional(),
    sceneId: FOUNDRY_ID.optional(),
  })
  .strict();

// Migrated from scene umbrella. Single-token delete; pairs with `add` for unwind.
// Action key is 'delete-token' to avoid collision with the embedded-doc-style `delete`.
export const TokenDeleteTokenInput = z
  .object({
    action: z.literal('delete-token'),
    sceneId: FOUNDRY_ID,
    tokenId: FOUNDRY_ID,
  })
  .strict();

export const TokenToolInput = z.discriminatedUnion('action', [
  TokenCreateInput,
  TokenUpdateInput,
  TokenDeleteInput,
  TokenGetInput,
  TokenListInput,
  TokenAddInput,
  TokenDeleteTokenInput,
]);

export type TokenToolInputType = z.infer<typeof TokenToolInput>;
export type TokenCreateInputType = z.infer<typeof TokenCreateInput>;
export type TokenUpdateInputType = z.infer<typeof TokenUpdateInput>;
export type TokenDeleteInputType = z.infer<typeof TokenDeleteInput>;
export type TokenGetInputType = z.infer<typeof TokenGetInput>;
export type TokenListInputType = z.infer<typeof TokenListInput>;
export type TokenAddInputType = z.infer<typeof TokenAddInput>;
export type TokenDeleteTokenInputType = z.infer<typeof TokenDeleteTokenInput>;

export interface TokenViewModel {
  id: string;
  sceneId: string;
  name: string;
  displayName: number;
  actorId: string | null;
  /** True iff actorId is set AND the referenced Actor currently exists in game.actors. */
  actorLinked: boolean;
  actorLink: boolean;
  /** ActorDelta surface (read-only in Phase 5 — Token.delta is full sync-actor diff model). */
  delta: { hasOverrides: boolean } | null;
  width: number;
  height: number;
  texture: TextureData;
  shape: number;
  x: number;
  y: number;
  elevation: number;
  sort: number;
  locked: boolean;
  lockRotation: boolean;
  rotation: number;
  alpha: number;
  hidden: boolean;
  disposition: number;
  displayBars: number;
  bar1: { attribute: string | null };
  bar2: { attribute: string | null };
  light: LightData;
  sight: {
    enabled: boolean;
    range: number | null;
    angle: number;
    visionMode: string;
    color: string | null;
    attenuation: number;
    brightness: number;
    saturation: number;
    contrast: number;
  };
  movementAction: string | null;
  flags: Record<string, unknown>;
}

export interface TokenListItem {
  id: string;
  sceneId: string;
  name: string;
  actorId: string | null;
  actorLinked: boolean;
  hidden: boolean;
  disposition: number;
}
