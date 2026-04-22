// Core subtype: spell (SpellModel). Fields per wfrp4e_system/data/Item/spell.md.

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

export const SpellSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('spell'),
  lore: z.string().optional(),
  cn: z.number().optional(),
  range: z.string().optional(),
  target: z.string().optional(),
  duration: z.string().optional(),
  damage: z.string().optional(),
  damageDice: z.string().optional(),
  magicMissile: z.boolean().optional(),
  memorized: z.boolean().optional(),
  skill: z.string().optional(),
  ingredients: z.array(z.string()).optional(),
  wind: z.string().optional(),
  ritual: z
    .object({
      value: z.boolean().optional(),
      type: z.string().optional(),
      xp: z.number().optional(),
    })
    .optional(),
  overcast: z.record(z.unknown()).optional(),
});

export type SpellInput = z.infer<typeof SpellSchema>;

export function buildSpellSystem(p: SpellInput): Record<string, unknown> {
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    lore: { value: p.lore ?? '', effectString: '' },
    cn: { value: p.cn ?? 0, SL: 0 },
    range: { value: p.range ?? '', vortex: false },
    target: { value: p.target ?? '', aoe: false },
    duration: { value: p.duration ?? '', extendable: false },
    damage: { value: p.damage ?? '', dice: p.damageDice ?? '' },
    magicMissile: { value: p.magicMissile ?? false },
    memorized: { value: p.memorized ?? false },
    skill: { value: p.skill ?? '' },
    ingredients: p.ingredients ?? [],
    currentIng: { value: '' },
    wind: { value: p.wind ?? '' },
    ritual: {
      value: p.ritual?.value ?? false,
      type: p.ritual?.type ?? '',
      xp: p.ritual?.xp ?? 0,
    },
    overcast: p.overcast ?? { enabled: false },
  };
}
