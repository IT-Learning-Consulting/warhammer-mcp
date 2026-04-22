// Phase 5 follow-up B: delete-active-effect input schema.
// Handler enforces: at least one of effectId/effectName must be present.

import { z } from 'zod';
import { ItemTarget } from './item-target.js';

export const DeleteActiveEffectInput = z
  .object({
    target: ItemTarget,
    effectId: z.string().optional(),
    effectName: z.string().optional(),
  })
  .strict();

export type DeleteActiveEffectInputType = z.infer<typeof DeleteActiveEffectInput>;
