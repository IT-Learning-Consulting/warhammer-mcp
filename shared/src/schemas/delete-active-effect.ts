// Phase 5 follow-up B: delete-active-effect input schema.
// Handler enforces: at least one of effectId/effectName must be present.
// Phase 4 mcp_coverage_expansion: target widened to ActiveEffectTarget (adds actor-direct scope).

import { z } from 'zod';
import { ActiveEffectTarget } from './active-effect-target.js';

export const DeleteActiveEffectInput = z
  .object({
    target: ActiveEffectTarget,
    effectId: z.string().optional(),
    effectName: z.string().optional(),
  })
  .strict();

export type DeleteActiveEffectInputType = z.infer<typeof DeleteActiveEffectInput>;
