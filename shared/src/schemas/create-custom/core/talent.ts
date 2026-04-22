// Core subtype: talent (TalentModel). Max often a characteristic key or number.

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

export const TalentSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('talent'),
  max: z.union([z.string(), z.number()]).optional(),
  advances: z.number().optional(),
  career: z.string().optional(),
  tests: z.string().optional(),
});

export type TalentInput = z.infer<typeof TalentSchema>;

export function buildTalentSystem(p: TalentInput): Record<string, unknown> {
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    max: { value: String(p.max ?? '1') },
    advances: { value: p.advances ?? 1, force: false },
    career: { value: p.career ?? '' },
    tests: { value: p.tests ?? '' },
  };
}
