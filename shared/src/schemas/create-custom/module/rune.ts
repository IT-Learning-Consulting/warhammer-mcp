// Module subtype: wfrp4e-dwarfs.rune (RuneModel extends GenericAspectModel).
// Requires the wfrp4e-dwarfs module. Runes have unusual effect transfer
// semantics (shouldTransferEffect=false) — effects migrate onto the inscribed
// item on completion, NOT onto the owning actor.

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

export const RuneSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('wfrp4e-dwarfs.rune'),
  SL: z
    .object({
      value: z.number().int().min(0).optional(),
      required: z.number().int().min(0).optional(),
    })
    .optional(),
  category: z.string().optional(),
  master: z.boolean().optional(),
  item: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      uuid: z.string().optional(),
    })
    .optional(),
});

export type RuneInput = z.infer<typeof RuneSchema>;

export function buildRuneSystem(p: RuneInput): Record<string, unknown> {
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    SL: { value: p.SL?.value ?? 0, required: p.SL?.required ?? 10 },
    category: p.category ?? '',
    master: p.master ?? false,
    item: p.item ?? {},
  };
}
