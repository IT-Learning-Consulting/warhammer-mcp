// TOOL-IDEA-003 (2026-05-14): read-only AE resolver by name.
// First-class alternative to using update-active-effect + returnFullPayload=true as a
// discovery workaround (a write tool pretending to be a read). Reuses ActiveEffectTarget so
// the resolver path matches add/update/delete-active-effect.
// Phase 4 mcp_coverage_expansion: target widened to ActiveEffectTarget (adds actor-direct scope);
// handler returns parentType:'Actor' on that branch.
// Handler enforces: at least one of effectId/effectName must be present (mirrors update/delete-active-effect).

import { z } from 'zod';
import { ActiveEffectTarget } from './active-effect-target.js';

export const GetActiveEffectByNameInput = z
  .object({
    target: ActiveEffectTarget,
    effectId: z.string().optional(),
    effectName: z.string().optional(),
  })
  .strict();

export type GetActiveEffectByNameInputType = z.infer<typeof GetActiveEffectByNameInput>;
