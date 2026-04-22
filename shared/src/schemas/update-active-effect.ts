// Phase 5 follow-up B: update-active-effect input schema.
// Partial update — only fields supplied in `updates` are applied (merge semantics).
// Handler enforces: at least one of effectId/effectName must be present.

import { z } from 'zod';
import { ItemTarget } from './item-target.js';
import { ActiveEffectDataSchema } from './create-custom/effect.js';

export const UpdateActiveEffectInput = z
  .object({
    target: ItemTarget,
    effectId: z.string().optional(),
    effectName: z.string().optional(),
    updates: ActiveEffectDataSchema.partial(),
    returnFullPayload: z.boolean().optional(),
  })
  .strict();

export type UpdateActiveEffectInputType = z.infer<typeof UpdateActiveEffectInput>;
