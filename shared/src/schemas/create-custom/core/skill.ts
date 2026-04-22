// Core subtype: skill (SkillModel).

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

export const SkillSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('skill'),
  characteristic: z.enum(['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel']).optional(),
  advances: z.number().optional(),
  advanced: z.enum(['', 'adv']).optional(),
  grouped: z.enum(['noSpec', 'isSpec']).optional(),
  modifier: z.number().optional(),
});

export type SkillInput = z.infer<typeof SkillSchema>;

export function buildSkillSystem(p: SkillInput): Record<string, unknown> {
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    advanced: { value: p.advanced ?? '' },
    grouped: { value: p.grouped ?? 'noSpec' },
    characteristic: { value: p.characteristic ?? 'ws' },
    advances: { value: p.advances ?? 0, costModifier: 0, force: false },
    modifier: { value: p.modifier ?? 0 },
    total: {},
  };
}
