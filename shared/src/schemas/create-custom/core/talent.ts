// Core subtype: talent (TalentModel). Max often a characteristic key or number.

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

export const TalentSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('talent'),
  max: z.union([z.string(), z.number()]).optional(),
  advances: z.union([
    z.number(),
    z.object({
      value: z.number().optional(),
      force: z.boolean().optional(),
    }),
  ]).optional(),
  career: z.string().optional(),
  tests: z.string().optional(),
});

export type TalentInput = z.infer<typeof TalentSchema>;

export function buildTalentSystem(p: TalentInput): Record<string, unknown> {
  const adv = typeof p.advances === 'number' ? { value: p.advances } : (p.advances ?? {});
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    max: { value: String(p.max ?? '1') },
    advances: { value: adv.value ?? 1, force: adv.force ?? false },
    career: { value: p.career ?? '' },
    tests: { value: p.tests ?? '' },
  };
}
