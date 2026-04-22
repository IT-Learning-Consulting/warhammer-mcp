// Core subtype: trapping (TrappingModel). General-equipment mixin family.

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

export const TrappingSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('trapping'),
  quantity: z.number().optional(),
  encumbrance: z.number().optional(),
  price: Price.optional(),
  availability: z.string().optional(),
  location: z.number().optional(),
  trappingType: z.string().optional(),
  worn: z.boolean().optional(),
  spellIngredient: z.string().optional(),
  qualities: z.array(QualityOrFlaw).optional(),
  flaws: z.array(QualityOrFlaw).optional(),
});

export type TrappingInput = z.infer<typeof TrappingSchema>;

export function buildTrappingSystem(p: TrappingInput): Record<string, unknown> {
  const price = p.price ?? {};
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    quantity: { value: p.quantity ?? 1 },
    encumbrance: { value: p.encumbrance ?? 0 },
    price: { gc: price.gc ?? 0, ss: price.ss ?? 0, bp: price.bp ?? 0 },
    availability: { value: p.availability ?? '' },
    location: { value: p.location ?? 0 },
    trappingType: { value: p.trappingType ?? '' },
    worn: p.worn ?? false,
    spellIngredient: { value: p.spellIngredient ?? '' },
    qualities: { value: p.qualities ?? [] },
    flaws: { value: p.flaws ?? [] },
  };
}
