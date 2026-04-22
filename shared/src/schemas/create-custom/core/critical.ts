// Core subtype: critical (CriticalModel). Wounds is a formula (e.g. "1d10+SB"), not a total.

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

export const CriticalSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('critical'),
  wounds: z.string().optional(),
  modifier: z.string().optional(),
  location: z.string().optional(),
});

export type CriticalInput = z.infer<typeof CriticalSchema>;

export function buildCriticalSystem(p: CriticalInput): Record<string, unknown> {
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    wounds: { value: p.wounds ?? '1' },
    modifier: { value: p.modifier ?? '' },
    location: { value: p.location ?? '' },
  };
}
