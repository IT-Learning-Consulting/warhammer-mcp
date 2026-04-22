// Core subtype: ammunition (AmmunitionModel).

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

const QualityOrFlaw = z.object({
  name: z.string(),
  value: z.number().optional(),
});

const Price = z.object({
  gc: z.number().optional(),
  ss: z.number().optional(),
  bp: z.number().optional(),
});

export const AmmunitionSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('ammunition'),
  quantity: z.number().optional(),
  encumbrance: z.number().optional(),
  price: Price.optional(),
  availability: z.string().optional(),
  location: z.number().optional(),
  ammunitionType: z.string().optional(),
  range: z.string().optional(),
  damage: z.string().optional(),
  damageDice: z.string().optional(),
  qualities: z.array(QualityOrFlaw).optional(),
  flaws: z.array(QualityOrFlaw).optional(),
  special: z.string().optional(),
});

export type AmmunitionInput = z.infer<typeof AmmunitionSchema>;

export function buildAmmunitionSystem(p: AmmunitionInput): Record<string, unknown> {
  const price = p.price ?? {};
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    quantity: { value: p.quantity ?? 1 },
    encumbrance: { value: p.encumbrance ?? 0 },
    price: { gc: price.gc ?? 0, ss: price.ss ?? 0, bp: price.bp ?? 0 },
    availability: { value: p.availability ?? '' },
    location: { value: p.location ?? 0 },
    ammunitionType: { value: p.ammunitionType ?? '' },
    range: { value: p.range ?? '' },
    damage: { value: p.damage ?? '', dice: p.damageDice ?? '' },
    qualities: { value: p.qualities ?? [] },
    flaws: { value: p.flaws ?? [] },
    special: { value: p.special ?? '' },
  };
}
