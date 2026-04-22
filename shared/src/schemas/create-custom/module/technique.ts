// Module subtype: wfrp4e-helf.technique (TechniqueModel extends GenericAspectModel).
// UI label is "Sword Dance"; internal type key is "technique" under the wfrp4e-helf namespace.

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

export const TechniqueSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('wfrp4e-helf.technique'),
  sl: z.number().int().min(0).optional(),
});

export type TechniqueInput = z.infer<typeof TechniqueSchema>;

export function buildTechniqueSystem(p: TechniqueInput): Record<string, unknown> {
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    sl: p.sl ?? 1,
  };
}
