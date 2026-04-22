// Module subtype: wfrp4e-archives3.cant (CantModel extends GenericAspectModel).
// Requires the wfrp4e-archives3 module. Cants consume SL from spells in their lore.

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

export const CantSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('wfrp4e-archives3.cant'),
  lore: z.string().optional(),
  cost: z
    .object({
      value: z.number().int().min(0).optional(),
      variable: z.boolean().optional(),
      max: z.string().optional(),
    })
    .optional(),
});

export type CantInput = z.infer<typeof CantSchema>;

export function buildCantSystem(p: CantInput): Record<string, unknown> {
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    lore: { value: p.lore ?? '' },
    cost: {
      value: p.cost?.value ?? 1,
      variable: p.cost?.variable ?? false,
      max: p.cost?.max ?? '',
    },
  };
}
