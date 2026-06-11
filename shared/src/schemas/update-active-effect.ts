// Phase 5 follow-up B: update-active-effect input schema.
// Partial update — only fields supplied in `updates` are applied (merge semantics).
// Handler enforces: at least one of effectId/effectName must be present.
// Phase 4 mcp_coverage_expansion: target widened to ActiveEffectTarget (adds actor-direct scope).

import { z } from 'zod';
import { ActiveEffectTarget } from './active-effect-target.js';
import { ActiveEffectDataSchema } from './create-custom/effect.js';

export const UpdateActiveEffectInput = z
  .object({
    target: ActiveEffectTarget,
    effectId: z.string().optional(),
    effectName: z.string().optional(),
    updates: ActiveEffectDataSchema.partial(),
    returnFullPayload: z.boolean().optional(),
  })
  .strict();

export type UpdateActiveEffectInputType = z.infer<typeof UpdateActiveEffectInput>;
