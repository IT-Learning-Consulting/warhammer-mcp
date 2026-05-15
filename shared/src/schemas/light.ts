// Phase 5 mcp_crud_expansion — AmbientLight umbrella schema.
//
// Lifted from phase5_probes.md §AmbientLight (Foundry 13.351).
// `config` reuses shared LightDataSchema (A1) — identical to Token.light.
// ViewModel surfaces `isGlobal` boolean derived from AmbientLightDocument.isGlobal getter.

import { z } from 'zod';
import { LightDataSchema, type LightData } from './light-data.js';

const FOUNDRY_ID = z.string().min(1);

const LightWritableFields = {
  x: z.number().optional(),
  y: z.number().optional(),
  elevation: z.number().optional(),
  rotation: z.number().min(0).max(360).optional(),
  walls: z.boolean().optional(),
  vision: z.boolean().optional(),
  config: LightDataSchema.optional(),
  hidden: z.boolean().optional(),
  flags: z.record(z.unknown()).optional(),
};

export const LightCreateInput = z
  .object({
    action: z.literal('create'),
    sceneId: FOUNDRY_ID,
    ...LightWritableFields,
    x: z.number(),
    y: z.number(),
  })
  .strict();

export const LightUpdateInput = z
  .object({
    action: z.literal('update'),
    sceneId: FOUNDRY_ID,
    lightId: FOUNDRY_ID,
    changes: z
      .object(LightWritableFields)
      .strict()
      .refine((obj) => Object.keys(obj).length > 0, {
        message: 'LIGHT_EMPTY_PAYLOAD: changes object must contain at least one field',
      }),
  })
  .strict();

export const LightDeleteInput = z
  .object({
    action: z.literal('delete'),
    sceneId: FOUNDRY_ID,
    lightId: FOUNDRY_ID,
  })
  .strict();

export const LightGetInput = z
  .object({
    action: z.literal('get'),
    sceneId: FOUNDRY_ID,
    lightId: FOUNDRY_ID,
  })
  .strict();

export const LightListInput = z
  .object({
    action: z.literal('list'),
    sceneId: FOUNDRY_ID.optional(),
    filter: z.string().optional(),
    hidden: z.boolean().optional(),
    isGlobal: z.boolean().optional(),
    page: z.number().int().min(1).optional(),
    pageSize: z.number().int().min(1).max(100).optional(),
    countOnly: z.boolean().optional(),
  })
  .strict();

export const LightToolInput = z.discriminatedUnion('action', [
  LightCreateInput,
  LightUpdateInput,
  LightDeleteInput,
  LightGetInput,
  LightListInput,
]);

export type LightToolInputType = z.infer<typeof LightToolInput>;
export type LightCreateInputType = z.infer<typeof LightCreateInput>;
export type LightUpdateInputType = z.infer<typeof LightUpdateInput>;
export type LightDeleteInputType = z.infer<typeof LightDeleteInput>;
export type LightGetInputType = z.infer<typeof LightGetInput>;
export type LightListInputType = z.infer<typeof LightListInput>;

export interface LightViewModel {
  id: string;
  sceneId: string;
  x: number;
  y: number;
  elevation: number;
  rotation: number;
  walls: boolean;
  vision: boolean;
  hidden: boolean;
  isGlobal: boolean;
  config: LightData;
  flags: Record<string, unknown>;
}

export interface LightListItem {
  id: string;
  sceneId: string;
  isGlobal: boolean;
  hidden: boolean;
  dim: number;
  bright: number;
}
