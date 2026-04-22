// Core subtype: mutation (MutationModel).

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

export const MutationSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('mutation'),
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
