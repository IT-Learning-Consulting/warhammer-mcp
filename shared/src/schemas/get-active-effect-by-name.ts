// TOOL-IDEA-003 (2026-05-14): read-only AE resolver by name.
// First-class alternative to using update-active-effect + returnFullPayload=true as a
// discovery workaround (a write tool pretending to be a read). Reuses ItemTarget so
// the resolver path matches add/update/delete-active-effect's `_resolveItem` →
// `_findEffect` chain on the foundry-module side. Handler enforces: at least one of
// effectId/effectName must be present (mirrors update/delete-active-effect).

import { z } from 'zod';
import { ItemTarget } from './item-target.js';

export const GetActiveEffectByNameInput = z
  .object({
    target: ItemTarget,
    effectId: z.string().optional(),
    effectName: z.string().optional(),
  })
  .strict();

export type GetActiveEffectByNameInputType = z.infer<typeof GetActiveEffectByNameInput>;
