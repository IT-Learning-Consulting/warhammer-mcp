// Module subtype: wfrp4e-soc.chanty (ChantyModel extends GenericAspectModel).
// Requires the wfrp4e-soc (Sea of Claws) module.

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

export const ChantySchema = CreateCustomItemCommon.extend({
  itemType: z.literal('wfrp4e-soc.chanty'),
  usage: z
    .object({
      establish: z.number().optional(),
      duration: z.number().optional(),
      skill: z.string().optional(),
    })
    .optional(),
});

export type ChantyInput = z.infer<typeof ChantySchema>;

export function buildChantySystem(p: ChantyInput): Record<string, unknown> {
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    usage: {
      establish: p.usage?.establish ?? 30,
      duration: p.usage?.duration ?? 3,
      skill: p.usage?.skill ?? 'Entertain (Singing)',
    },
  };
}
