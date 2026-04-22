// Core subtype: psychology (PsychologyModel). Description-only — effects do all the work.

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

export const PsychologySchema = CreateCustomItemCommon.extend({
  itemType: z.literal('psychology'),
});

export type PsychologyInput = z.infer<typeof PsychologySchema>;

export function buildPsychologySystem(p: PsychologyInput): Record<string, unknown> {
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
  };
}
