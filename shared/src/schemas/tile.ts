// Phase 5 mcp_crud_expansion — Tile umbrella schema.
//
// Lifted from phase5_probes.md §Tile (Foundry 13.351).
// B3 (Tile.video.volume silent-zero overwrite) — Spike-Sentinel 7 CONFIRMED:
//   video.volume is AlphaField initial 0. MUST use .optional() (never .default(0))
//   so a partial update without video.volume does NOT silently zero out the existing volume.
// occlusion.mode is OCCLUSION_MODES enum (NONE=0, FADE=1, RADIAL=3, VISION=4 — gap at 2).
// texture reuses TextureDataSchema (A2 shared).

import { z } from 'zod';
import { TextureDataSchema, type TextureData } from './texture-data.js';

const FOUNDRY_ID = z.string().min(1);

const TileOcclusionInput = z
  .object({
    mode: z.number().int().min(0).max(4).optional(),
    alpha: z.number().min(0).max(1).optional(),
  })
  .strict();

const TileVideoInput = z
  .object({
    loop: z.boolean().optional(),
    autoplay: z.boolean().optional(),
    // B3: .optional() — NEVER .default(0). Probe initial = 0; partial updates omit
    // this field by default and the post-write merge must NOT silently zero volume.
    volume: z.number().min(0).max(1).optional(),
  })
  .strict();

const TileRestrictionsInput = z
  .object({
    light: z.boolean().optional(),
    weather: z.boolean().optional(),
  })
  .strict();

const TileWritableFields = {
  texture: TextureDataSchema.optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  elevation: z.number().optional(),
  sort: z.number().int().optional(),
  rotation: z.number().min(0).max(360).optional(),
  alpha: z.number().min(0).max(1).optional(),
  hidden: z.boolean().optional(),
  locked: z.boolean().optional(),
  restrictions: TileRestrictionsInput.optional(),
  occlusion: TileOcclusionInput.optional(),
  video: TileVideoInput.optional(),
  flags: z.record(z.unknown()).optional(),
};

export const TileCreateInput = z
  .object({
    action: z.literal('create'),
    sceneId: FOUNDRY_ID,
    ...TileWritableFields,
    width: z.number().positive(),
    height: z.number().positive(),
  })
  .strict();

export const TileUpdateInput = z
  .object({
    action: z.literal('update'),
    sceneId: FOUNDRY_ID,
    tileId: FOUNDRY_ID,
    changes: z
      .object(TileWritableFields)
      .strict()
      .refine((obj) => Object.keys(obj).length > 0, {
        message: 'TILE_EMPTY_PAYLOAD: changes object must contain at least one field',
      }),
  })
  .strict();

export const TileDeleteInput = z
  .object({
    action: z.literal('delete'),
    sceneId: FOUNDRY_ID,
    tileId: FOUNDRY_ID,
  })
  .strict();

export const TileGetInput = z
  .object({
    action: z.literal('get'),
    sceneId: FOUNDRY_ID,
    tileId: FOUNDRY_ID,
  })
  .strict();

export const TileListInput = z
  .object({
    action: z.literal('list'),
    sceneId: FOUNDRY_ID.optional(),
    filter: z.string().optional(),
    hidden: z.boolean().optional(),
    locked: z.boolean().optional(),
    overheadOnly: z.boolean().optional(),
    page: z.number().int().min(1).optional(),
    pageSize: z.number().int().min(1).max(100).optional(),
    countOnly: z.boolean().optional(),
  })
  .strict();

export const TileToolInput = z.discriminatedUnion('action', [
  TileCreateInput,
  TileUpdateInput,
  TileDeleteInput,
  TileGetInput,
  TileListInput,
]);

export type TileToolInputType = z.infer<typeof TileToolInput>;
export type TileCreateInputType = z.infer<typeof TileCreateInput>;
export type TileUpdateInputType = z.infer<typeof TileUpdateInput>;
export type TileDeleteInputType = z.infer<typeof TileDeleteInput>;
export type TileGetInputType = z.infer<typeof TileGetInput>;
export type TileListInputType = z.infer<typeof TileListInput>;

export interface TileViewModel {
  id: string;
  sceneId: string;
  texture: TextureData;
  width: number;
  height: number;
  x: number;
  y: number;
  elevation: number;
  sort: number;
  rotation: number;
  alpha: number;
  hidden: boolean;
  locked: boolean;
  restrictions: { light: boolean; weather: boolean };
  occlusion: { mode: number; alpha: number };
  video: { loop: boolean; autoplay: boolean; volume: number };
  flags: Record<string, unknown>;
}

export interface TileListItem {
  id: string;
  sceneId: string;
  src: string | null;
  hidden: boolean;
  overhead: boolean;
}
