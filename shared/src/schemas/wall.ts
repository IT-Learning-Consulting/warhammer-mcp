// opportunity_scan_2026-08-21 F11 — Wall umbrella schema.
//
// Field surface from kb/foundry_docs_v13/documents/interfaces/types.WallData.md +
// types.WallThresholdData.md (v13-stamped). `c` (coordinates) and `threshold`
// (nested SchemaField) mirror light.ts's `config` treatment — both go in the
// handler's dp16SkipFields since DP-16's scalar `_source` comparison loop only
// handles flat dot-paths.

import { z } from 'zod';
import { paginationFields } from './primitives.js';
import { SceneId, WallId } from './branded-ids.js';

const WallThresholdSchema = z
  .object({
    attenuation: z.boolean().optional(),
    light: z.number().optional(),
    sight: z.number().optional(),
    sound: z.number().optional(),
  })
  .strict();

const WallWritableFields = {
  c: z.array(z.number()).length(4).optional(),
  dir: z.number().optional(),
  door: z.number().optional(),
  doorSound: z.string().optional(),
  ds: z.number().optional(),
  light: z.number().optional(),
  move: z.number().optional(),
  sight: z.number().optional(),
  sound: z.number().optional(),
  threshold: WallThresholdSchema.optional(),
  flags: z.record(z.unknown()).optional(),
};

export const WallCreateInput = z
  .object({
    action: z.literal('create'),
    sceneId: SceneId,
    ...WallWritableFields,
    c: z.array(z.number()).length(4),
  })
  .strict();

export const WallUpdateInput = z
  .object({
    action: z.literal('update'),
    sceneId: SceneId,
    wallId: WallId,
    changes: z
      .object(WallWritableFields)
      .strict()
      .refine((obj) => Object.keys(obj).length > 0, {
        message: 'WALL_EMPTY_PAYLOAD: changes object must contain at least one field',
      }),
  })
  .strict();

export const WallDeleteInput = z
  .object({
    action: z.literal('delete'),
    sceneId: SceneId,
    wallId: WallId,
  })
  .strict();

export const WallGetInput = z
  .object({
    action: z.literal('get'),
    sceneId: SceneId,
    wallId: WallId,
  })
  .strict();

export const WallListInput = z
  .object({
    action: z.literal('list'),
    sceneId: SceneId.optional(),
    // Named `doorOnly`, not `door` — `door` is the WALL_DOOR_TYPES numeric enum on
    // create/update; reusing it here as a boolean would collide in the published
    // inputSchema (one property, two incompatible types).
    doorOnly: z.boolean().optional(),
    ...paginationFields(),
    countOnly: z.boolean().optional(),
  })
  .strict();

export const WallToolInput = z.discriminatedUnion('action', [
  WallCreateInput,
  WallUpdateInput,
  WallDeleteInput,
  WallGetInput,
  WallListInput,
]);

export type WallToolInputType = z.infer<typeof WallToolInput>;
export type WallCreateInputType = z.infer<typeof WallCreateInput>;
export type WallUpdateInputType = z.infer<typeof WallUpdateInput>;
export type WallDeleteInputType = z.infer<typeof WallDeleteInput>;
export type WallGetInputType = z.infer<typeof WallGetInput>;
export type WallListInputType = z.infer<typeof WallListInput>;

export interface WallThresholdViewModel {
  attenuation: boolean;
  light: number;
  sight: number;
  sound: number;
}

export interface WallViewModel {
  id: string;
  sceneId: string;
  c: number[];
  dir: number;
  door: number;
  doorSound: string | null;
  ds: number;
  light: number;
  move: number;
  sight: number;
  sound: number;
  threshold: WallThresholdViewModel;
  flags: Record<string, unknown>;
}

export interface WallListItem {
  id: string;
  sceneId: string;
  c: number[];
  door: number;
  ds: number;
}
