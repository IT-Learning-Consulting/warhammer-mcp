// Destination discriminator for create-custom-item / modify-item-qualities.
// Actor-scope embeds on a specific actor; world-scope lands in the Items
// sidebar with optional nested folder placement. Folder chain is auto-created
// by the Foundry-module handler's _ensureFolderChain helper.

import { z } from 'zod';

// NOTE: The "actor must have actorId OR actorName" check is enforced at the
// handler layer rather than via `.refine()` here — zod's discriminatedUnion
// requires each branch to be a plain ZodObject, but refine returns ZodEffects
// which breaks the union type. Handler-side validation preserves parse
// narrowing + union compatibility.
const DestinationActor = z
  .object({
    type: z.literal('actor'),
    actorId: z.string().optional(),
    actorName: z.string().optional(),
  })
  .strict();

const DestinationWorld = z
  .object({
    type: z.literal('world'),
    folder: z.array(z.string().min(1)).optional(),
  })
  .strict();

export const Destination = z.discriminatedUnion('type', [DestinationActor, DestinationWorld]);

export type DestinationInput = z.infer<typeof Destination>;
