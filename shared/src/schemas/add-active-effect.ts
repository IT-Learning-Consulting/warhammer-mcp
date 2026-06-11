// Phase 5 follow-up B: add-active-effect input schema.
// Attach an ActiveEffect to an existing item (actor-embedded or world-scope),
// or directly onto an actor (Phase 4 mcp_coverage_expansion: scope='actor-direct').
// Reuses ActiveEffectDataSchema + buildEffectPayload from Phase 5.

import { z } from 'zod';
import { ActiveEffectTarget } from './active-effect-target.js';
import { ActiveEffectDataSchema } from './create-custom/effect.js';

export const AddActiveEffectInput = z
  .object({
    target: ActiveEffectTarget,
    effect: ActiveEffectDataSchema,
    returnFullPayload: z.boolean().optional(),
  })
  .strict();

export type AddActiveEffectInputType = z.infer<typeof AddActiveEffectInput>;
