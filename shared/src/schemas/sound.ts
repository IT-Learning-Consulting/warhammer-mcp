// Phase 5 mcp_crud_expansion — AmbientSound umbrella schema.
//
// Lifted from phase5_probes.md §AmbientSound (Foundry 13.351).
// effects.{base, muffled} each carry {type: StringField, intensity: NumberField} —
// Spike-Sentinel 6 RESOLVED. darkness.{min, max} are AlphaField range.

import { z } from 'zod';
import { paginationFields } from './primitives.js';
import { SceneId, AmbientSoundId } from './branded-ids.js';

const SoundDarknessInput = z
  .object({
    min: z.number().min(0).max(1).optional(),
    max: z.number().min(0).max(1).optional(),
  })
  .strict();

const SoundEffectVariantInput = z
  .object({
    type: z.string().nullable().optional(),
    intensity: z.number().int().min(0).max(10).optional(),
  })
  .strict();

const SoundEffectsInput = z
  .object({
    base: SoundEffectVariantInput.optional(),
    muffled: SoundEffectVariantInput.optional(),
  })
  .strict();

const SoundWritableFields = {
  x: z.number().optional(),
  y: z.number().optional(),
  elevation: z.number().optional(),
  radius: z.number().min(0).optional(),
  path: z.string().nullable().optional(),
  repeat: z.boolean().optional(),
  volume: z.number().min(0).max(1).optional(),
  walls: z.boolean().optional(),
  easing: z.boolean().optional(),
  hidden: z.boolean().optional(),
  darkness: SoundDarknessInput.optional(),
  effects: SoundEffectsInput.optional(),
  flags: z.record(z.unknown()).optional(),
};

export const SoundCreateInput = z
  .object({
    action: z.literal('create'),
    sceneId: SceneId,
    ...SoundWritableFields,
    x: z.number(),
    y: z.number(),
  })
  .strict();

export const SoundUpdateInput = z
  .object({
    action: z.literal('update'),
    sceneId: SceneId,
    soundId: AmbientSoundId,
    changes: z
      .object(SoundWritableFields)
      .strict()
      .refine((obj) => Object.keys(obj).length > 0, {
        message: 'SOUND_EMPTY_PAYLOAD: changes object must contain at least one field',
      }),
  })
  .strict();

export const SoundDeleteInput = z
  .object({
    action: z.literal('delete'),
    sceneId: SceneId,
    soundId: AmbientSoundId,
  })
  .strict();

export const SoundGetInput = z
  .object({
    action: z.literal('get'),
    sceneId: SceneId,
    soundId: AmbientSoundId,
  })
  .strict();

export const SoundListInput = z
  .object({
    action: z.literal('list'),
    sceneId: SceneId.optional(),
    filter: z.string().optional(),
    hidden: z.boolean().optional(),
    ...paginationFields(),
    countOnly: z.boolean().optional(),
  })
  .strict();

// Phase 9C — duplicate an AmbientSound (toObject minus _id → create). CCR-2a.
export const SoundDuplicateInput = z
  .object({
    action: z.literal('duplicate'),
    sceneId: SceneId,
    soundId: AmbientSoundId,
  })
  .strict();

export const SoundToolInput = z.discriminatedUnion('action', [
  SoundCreateInput,
  SoundUpdateInput,
  SoundDeleteInput,
  SoundGetInput,
  SoundListInput,
  SoundDuplicateInput,
]);

export type SoundToolInputType = z.infer<typeof SoundToolInput>;
export type SoundCreateInputType = z.infer<typeof SoundCreateInput>;
export type SoundUpdateInputType = z.infer<typeof SoundUpdateInput>;
export type SoundDeleteInputType = z.infer<typeof SoundDeleteInput>;
export type SoundGetInputType = z.infer<typeof SoundGetInput>;
export type SoundListInputType = z.infer<typeof SoundListInput>;
export type SoundDuplicateInputType = z.infer<typeof SoundDuplicateInput>;

export interface SoundViewModel {
  id: string;
  sceneId: string;
  x: number;
  y: number;
  elevation: number;
  radius: number;
  path: string | null;
  repeat: boolean;
  volume: number;
  walls: boolean;
  easing: boolean;
  hidden: boolean;
  darkness: {
    min: number;
    max: number;
  };
  effects: {
    base: { type: string | null; intensity: number };
    muffled: { type: string | null; intensity: number };
  };
  flags: Record<string, unknown>;
}

export interface SoundListItem {
  id: string;
  sceneId: string;
  path: string | null;
  hidden: boolean;
  volume: number;
}
