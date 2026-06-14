// Module subtype: forien-armoury.scroll (ScrollModel extends PhysicalItemModel).
// Requires the forien-armoury module to be active.

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';
import { FoundryUuid } from '../../branded-ids.js';

const Price = z.object({
  gc: z.number().optional(),
  ss: z.number().optional(),
  bp: z.number().optional(),
});

export const ScrollSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('forien-armoury.scroll'),
  quantity: z.number().optional(),
  encumbrance: z.number().optional(),
  price: Price.optional(),
  availability: z.string().optional(),
  location: z.number().optional(),
  spellUuid: FoundryUuid.optional(),
  language: z.string().optional(),
});

export type ScrollInput = z.infer<typeof ScrollSchema>;

export function buildScrollSystem(p: ScrollInput): Record<string, unknown> {
  const price = p.price ?? {};
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    quantity: { value: p.quantity ?? 1 },
    encumbrance: { value: p.encumbrance ?? 0 },
    price: { gc: price.gc ?? 0, ss: price.ss ?? 0, bp: price.bp ?? 0 },
    availability: { value: p.availability ?? '' },
    location: { value: p.location ?? 0 },
    spellUuid: p.spellUuid ?? null,
    language: p.language ?? 'Magick',
  };
}
