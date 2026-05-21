// Core subtype: money (MoneyModel). Coinage for WFRP4e.
// Fields: description/gmdescription (from common), quantity, encumbrance, location, coinValue.
// coinValue is denomination in pence: BP=1, SS=12, GC=240. Not enum-constrained — wfrp4e mods
// may add custom denominations at runtime.

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

export const MoneySchema = CreateCustomItemCommon.extend({
  itemType: z.literal('money'),
  quantity: z.number().optional(),
  encumbrance: z.number().optional(),
  location: z.number().optional(),
  coinValue: z.number().optional(),
});

export type MoneyInput = z.infer<typeof MoneySchema>;

export function buildMoneySystem(p: MoneyInput): Record<string, unknown> {
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    quantity: { value: p.quantity ?? 1 },
    encumbrance: { value: p.encumbrance ?? 0 },
    location: { value: p.location ?? 0 },
    coinValue: { value: p.coinValue ?? 1 },
  };
}
