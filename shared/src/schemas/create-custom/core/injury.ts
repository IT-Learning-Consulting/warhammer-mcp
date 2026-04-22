// Core subtype: injury (InjuryModel). Same shape family as critical.

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

export const InjurySchema = CreateCustomItemCommon.extend({
  itemType: z.literal('injury'),
  location: z.string().optional(),
  penalty: z.string().optional(),
  duration: z
    .object({
      value: z.string().optional(),
      active: z.boolean().optional(),
      permanent: z.boolean().optional(),
    })
    .optional(),
});

export type InjuryInput = z.infer<typeof InjurySchema>;

export function buildInjurySystem(p: InjuryInput): Record<string, unknown> {
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    location: { value: p.location ?? '' },
    penalty: { value: p.penalty ?? '' },
    duration: {
      value: p.duration?.value ?? '',
      active: p.duration?.active ?? false,
      permanent: p.duration?.permanent ?? false,
    },
  };
}
