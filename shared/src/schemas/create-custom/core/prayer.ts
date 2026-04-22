// Core subtype: prayer (PrayerModel). Type discriminator blessing|miracle per Core p.213.

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

export const PrayerSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('prayer'),
  type: z.enum(['blessing', 'miracle']),
  god: z.string().optional(),
  range: z.string().optional(),
  duration: z.string().optional(),
  target: z.string().optional(),
  damage: z.string().optional(),
  damageDice: z.string().optional(),
  overcast: z.record(z.unknown()).optional(),
});

export type PrayerInput = z.infer<typeof PrayerSchema>;

export function buildPrayerSystem(p: PrayerInput): Record<string, unknown> {
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    type: { value: p.type },
    god: { value: p.god ?? '' },
    range: { value: p.range ?? '' },
    duration: { value: p.duration ?? '' },
    target: { value: p.target ?? '', aoe: false, extendableAoE: false },
    damage: { value: p.damage ?? '', dice: p.damageDice ?? '', addSL: false },
    overcast: p.overcast ?? { enabled: false },
  };
}
