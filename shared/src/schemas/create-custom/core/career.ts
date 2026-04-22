// Core subtype: career (CareerModel). current/complete default false per Core p.44.

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

export const CareerSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('career'),
  careergroup: z.string().optional(),
  class: z.string().optional(),
  level: z.union([z.string(), z.number()]).optional(),
  current: z.boolean().optional(),
  complete: z.boolean().optional(),
  statusTier: z.enum(['b', 's', 'g']).optional(),
  statusStanding: z.number().optional(),
  characteristics: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  talents: z.array(z.string()).optional(),
  trappings: z.array(z.string()).optional(),
  incomeSkill: z.array(z.number()).optional(),
});

export type CareerInput = z.infer<typeof CareerSchema>;

export function buildCareerSystem(p: CareerInput): Record<string, unknown> {
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    careergroup: { value: p.careergroup ?? '' },
    class: { value: p.class ?? '' },
    current: { value: p.current ?? false },
    complete: { value: p.complete ?? false },
    level: { value: p.level ?? 1 },
    status: { tier: p.statusTier ?? '', standing: p.statusStanding ?? 0 },
    characteristics: p.characteristics ?? [],
    skills: p.skills ?? [],
    talents: p.talents ?? [],
    trappings: p.trappings ?? [],
    incomeSkill: p.incomeSkill ?? [],
  };
}
