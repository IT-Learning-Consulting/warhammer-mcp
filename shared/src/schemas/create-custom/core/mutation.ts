// Core subtype: mutation (MutationModel).

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

export const MutationSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('mutation'),
  // BUG-649: `mutationType` stays Zod-optional deliberately — create-custom-item.ts's handler
  // enforces the real requirement AFTER parsing (BUG-475(c) guard), throwing a clean typed
  // token (CREATE_CUSTOM_ITEM_MUTATION_TYPE_REQUIRED). Making this field Zod-required instead
  // would make that guard unreachable (schema .parse() throws first, before the handler's own
  // check runs) and downgrade the clean one-line error to a verbose ZodError issues array. The
  // handler check is the single canonical enforcement point; published schema/docs/validator/
  // examples are corrected to describe THIS reality instead.
  mutationType: z.enum(['physical', 'mental']).optional(),
  modifier: z.string().optional(),
  modifiesSkills: z.boolean().optional(),
});

export type MutationInput = z.infer<typeof MutationSchema>;

export function buildMutationSystem(p: MutationInput): Record<string, unknown> {
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    mutationType: { value: p.mutationType ?? 'physical' },
    modifier: { value: p.modifier ?? '' },
    modifiesSkills: { value: p.modifiesSkills ?? false },
  };
}
