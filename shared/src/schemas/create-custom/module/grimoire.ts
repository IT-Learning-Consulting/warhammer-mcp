// Module subtype: forien-armoury.grimoire (GrimoireModel extends EquippableItemModel).
// Requires the forien-armoury module to be active in the target world.

import { z } from 'zod';
import { CreateCustomItemCommon, priceFields } from '../common.js';

const Price = priceFields();

export const GrimoireSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('forien-armoury.grimoire'),
  quantity: z.number().optional(),
  encumbrance: z.number().optional(),
  price: Price.optional(),
  availability: z.string().optional(),
  location: z.number().optional(),
  worn: z.boolean().optional(),
  equipped: z.boolean().optional(),
  spells: z
    .array(
      z.object({
        name: z.string(),
        uuid: z.string(),
      })
    )
    .optional(),
  language: z.string().optional(),
  twohanded: z.boolean().optional(),
});

export type GrimoireInput = z.infer<typeof GrimoireSchema>;

export function buildGrimoireSystem(p: GrimoireInput): Record<string, unknown> {
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
    equipped: { value: p.equipped ?? false },
    spells: p.spells ?? [],
    language: p.language ?? 'Magick',
    twohanded: { value: p.twohanded ?? false },
  };
}
