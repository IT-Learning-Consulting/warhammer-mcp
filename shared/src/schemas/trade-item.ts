// Atomic Item move from one actor to another. Partial-quantity transfers are
// supported by setting `quantity` to a value less than the source item's quantity.
// Encumbrance recomputes automatically via the Foundry prepareData pipeline (HC3).

import { z } from 'zod';

export const TradeItemInput = z
  .object({
    fromActorId: z.string(),
    toActorId: z.string(),
    itemId: z.string(),
    quantity: z.number().int().positive().optional(),
  })
  .strict();

export type TradeItemInputType = z.infer<typeof TradeItemInput>;
