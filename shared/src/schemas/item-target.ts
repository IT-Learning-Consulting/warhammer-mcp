// Phase 5 follow-up B: item-target discriminator for active-effect CRUD.
// Sibling of Destination (Phase 5) — Destination says WHERE an item lives;
// ItemTarget says WHICH item is being addressed. Both concepts appear in
// effect CRUD (target.scope === 'actor' | 'world').
//
// NOTE: the "one of actorId/actorName (+ one of itemId/itemName)" runtime
// check lives at the handler layer, not via `.refine()`, because
// z.discriminatedUnion requires each branch to be a plain ZodObject.

import { z } from 'zod';

const ActorTarget = z
  .object({
    scope: z.literal('actor'),
    actorId: z.string().optional(),
    actorName: z.string().optional(),
    itemId: z.string().optional(),
    itemName: z.string().optional(),
  })
  .strict();

const WorldTarget = z
  .object({
    scope: z.literal('world'),
    itemId: z.string().optional(),
    itemName: z.string().optional(),
  })
  .strict();

export const ItemTarget = z.discriminatedUnion('scope', [ActorTarget, WorldTarget]);
export type ItemTargetInput = z.infer<typeof ItemTarget>;
