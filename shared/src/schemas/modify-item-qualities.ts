// Modify qualities / flaws on an item — actor-embedded or world-scope.
// Carved out of the broken create-item.ts. Supports the same `destination`
// discriminator as create-custom-item for unified targeting.

import { z } from 'zod';
import { ItemId } from './branded-ids.js';
import { Destination } from './create-custom/destination.js';

const QualityEntry = z.object({
  name: z.string(),
  value: z.number().optional(),
});

export const ModifyItemQualitiesV2Input = z
  .object({
    destination: Destination,
    itemName: z.string().optional(),
    itemId: ItemId.optional(),
    addQualities: z.array(QualityEntry).default([]),
    removeQualities: z.array(z.string()).default([]),
    addFlaws: z.array(QualityEntry).default([]),
    removeFlaws: z.array(z.string()).default([]),
  })
  .strict()
  .refine((d) => Boolean(d.itemName) || Boolean(d.itemId), {
    message: 'itemName or itemId is required',
  });

export type ModifyItemQualitiesV2InputType = z.infer<typeof ModifyItemQualitiesV2Input>;
