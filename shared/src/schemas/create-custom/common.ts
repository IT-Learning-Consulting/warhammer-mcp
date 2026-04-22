// Common input fields shared across all 25 create-custom-item subtype schemas.
// Every subtype schema.extend()s this base and adds its own discriminator
// (`itemType: z.literal("...")`) plus subtype-specific fields.

import { z } from 'zod';
import { Destination } from './destination.js';
import { ActiveEffectDataSchema } from './effect.js';

export const CreateCustomItemCommon = z.object({
  name: z.string().min(1),
  img: z.string().optional(),
  description: z.string().optional(),
  gmdescription: z.string().optional(),
  fromCompendium: z.string().optional(),
  effects: z.array(ActiveEffectDataSchema).optional(),
  returnFullPayload: z.boolean().optional().default(false),
  destination: Destination,
  systemOverrides: z.record(z.unknown()).optional(),
});

export type CreateCustomItemCommonInput = z.infer<typeof CreateCustomItemCommon>;
