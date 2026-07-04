// Core subtype: cargo (CargoModel). Maritime/trade content.

import { z } from 'zod';
import { CreateCustomItemCommon, priceFields } from '../common.js';

const Price = priceFields();

export const CargoSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('cargo'),
  price: Price.optional(),
  encumbrance: z.number().optional(),
  cargoType: z.string().optional(),
  unitPrice: z.number().optional(),
  origin: z.string().optional(),
  quality: z.enum(['poor', 'average', 'good', 'exceptional']).optional(),
});

export type CargoInput = z.infer<typeof CargoSchema>;

export function buildCargoSystem(p: CargoInput): Record<string, unknown> {
  const price = p.price ?? {};
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    price: { gc: price.gc ?? 0, ss: price.ss ?? 0, bp: price.bp ?? 0 },
    encumbrance: { value: p.encumbrance ?? 0 },
    cargoType: { value: p.cargoType ?? '' },
    unitPrice: { value: p.unitPrice ?? 0 },
    origin: { value: p.origin ?? '' },
    quality: { value: p.quality ?? 'average' },
  };
}
