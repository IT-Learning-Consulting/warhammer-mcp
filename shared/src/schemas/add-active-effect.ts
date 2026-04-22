// Phase 5 follow-up B: add-active-effect input schema.
// Attach an ActiveEffect to an existing item (actor-embedded or world-scope).
// Reuses ActiveEffectDataSchema + buildEffectPayload from Phase 5.

import { z } from 'zod';
import { ItemTarget } from './item-target.js';
import { ActiveEffectDataSchema } from './create-custom/effect.js';

export const AddActiveEffectInput = z
  .object({
    target: ItemTarget,
    effect: ActiveEffectDataSchema,
    returnFullPayload: z.boolean().optional(),
  })
  .strict();

export type AddActiveEffectInputType = z.infer<typeof AddActiveEffectInput>;
