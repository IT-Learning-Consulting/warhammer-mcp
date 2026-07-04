// Core subtype: container (ContainerModel).

import { z } from 'zod';
import { CreateCustomItemCommon, priceFields } from '../common.js';

const Price = priceFields();

export const ContainerSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('container'),
  quantity: z.number().optional(),
  encumbrance: z.number().optional(),
  price: Price.optional(),
  availability: z.string().optional(),
  location: z.number().optional(),
  worn: z.boolean().optional(),
  wearable: z.boolean().optional(),
  carries: z.number().optional(),
  countEnc: z.boolean().optional(),
});

export type ContainerInput = z.infer<typeof ContainerSchema>;

export function buildContainerSystem(p: ContainerInput): Record<string, unknown> {
  const price = p.price ?? {};
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    quantity: { value: p.quantity ?? 1 },
    encumbrance: { value: p.encumbrance ?? 0 },
    price: { gc: price.gc ?? 0, ss: price.ss ?? 0, bp: price.bp ?? 0 },
    availability: { value: p.availability ?? '' },
    location: { value: p.location ?? 0 },
    worn: { value: p.worn ?? false },
    wearable: { value: p.wearable ?? false },
    carries: { value: p.carries ?? 0 },
    countEnc: { value: p.countEnc ?? true },
  };
}
