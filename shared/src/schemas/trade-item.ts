// Atomic Item move from one actor to another. Partial-quantity transfers are
// supported by setting `quantity` to a value less than the source item's quantity.
// Encumbrance recomputes automatically via the Foundry prepareData pipeline (HC3).

import { z } from 'zod';
import { ActorId, ItemId } from './branded-ids.js';

export const TradeItemInput = z
  .object({
    fromActorId: ActorId,
    toActorId: ActorId,
    itemId: ItemId,
    quantity: z.number().int().positive().optional(),
  })
  .strict();

export type TradeItemInputType = z.infer<typeof TradeItemInput>;
