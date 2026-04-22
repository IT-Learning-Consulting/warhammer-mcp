// Core subtype: trait (TraitModel).

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

const QualityOrFlaw = z.object({
  name: z.string(),
  value: z.number().optional(),
});

export const TraitSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('trait'),
  rollable: z
    .object({
      value: z.boolean().optional(),
      damage: z.boolean().optional(),
      skill: z.string().optional(),
      rollCharacteristic: z.string().optional(),
      bonusCharacteristic: z.string().optional(),
      dice: z.string().optional(),
      defaultDifficulty: z.string().optional(),
      SL: z.boolean().optional(),
      attackType: z.enum(['melee', 'ranged']).optional(),
    })
    .optional(),
  specification: z.union([z.string(), z.number()]).optional(),
  qualities: z.array(QualityOrFlaw).optional(),
  flaws: z.array(QualityOrFlaw).optional(),
});

export type TraitInput = z.infer<typeof TraitSchema>;

export function buildTraitSystem(p: TraitInput): Record<string, unknown> {
  const r = p.rollable ?? {};
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    rollable: {
      value: r.value ?? false,
      damage: r.damage ?? false,
      skill: r.skill ?? '',
      rollCharacteristic: r.rollCharacteristic ?? '',
      bonusCharacteristic: r.bonusCharacteristic ?? '',
      dice: r.dice ?? '',
      defaultDifficulty: r.defaultDifficulty ?? 'challenging',
      SL: r.SL ?? true,
      attackType: r.attackType ?? 'melee',
    },
    specification: { value: p.specification ?? '' },
    qualities: { value: p.qualities ?? [] },
    flaws: { value: p.flaws ?? [] },
  };
}
