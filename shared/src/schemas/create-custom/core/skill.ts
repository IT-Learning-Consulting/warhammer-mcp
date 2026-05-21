// Core subtype: skill (SkillModel).

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

export const SkillSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('skill'),
  characteristic: z.enum(['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel']).optional(),
  advances: z.union([
    z.number(),
    z.object({
      value: z.number().optional(),
      force: z.boolean().optional(),
      costModifier: z.number().optional(),
    }),
  ]).optional(),
  advanced: z.enum(['', 'adv']).optional(),
  grouped: z.enum(['noSpec', 'isSpec']).optional(),
  modifier: z.number().optional(),
});

export type SkillInput = z.infer<typeof SkillSchema>;

export function buildSkillSystem(p: SkillInput): Record<string, unknown> {
  const adv = typeof p.advances === 'number' ? { value: p.advances } : (p.advances ?? {});
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    advanced: { value: p.advanced ?? '' },
    grouped: { value: p.grouped ?? 'noSpec' },
    characteristic: { value: p.characteristic ?? 'ws' },
    advances: { value: adv.value ?? 0, costModifier: adv.costModifier ?? 0, force: adv.force ?? false },
    modifier: { value: p.modifier ?? 0 },
    total: {},
  };
}
