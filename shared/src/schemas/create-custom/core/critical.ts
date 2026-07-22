// Core subtype: critical (CriticalModel).

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

// BUG-646: `wounds` is NOT a formula despite the name and despite the 80 core criticals'
// own dice-notation-looking strings ("1d10+SB" etc.) — live-verified against
// wfrp4e.js:28575-28602's CriticalModel._onCreate: it calls `Number.parseInt(this.wounds.value)`
// and applies ONLY the leading integer, never rolls anything. The one other valid non-numeric
// token is the literal string "death" (case-insensitive) for instant-death criticals. A caller
// passing "1d5" gets 1 wound applied, silently, with no error — exactly the live evidence this
// bug reported (a wounds:"1d1+4" critical applied 4, expected-if-parsed-1 not a rolled 1-5+4).
const DICE_FORMULA_RE = /\d+d\d+/i;

export const CriticalSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('critical'),
  wounds: z
    .string()
    .optional()
    .refine(
      (v) => v === undefined || v.toLowerCase() === 'death' || !DICE_FORMULA_RE.test(v),
      {
        message:
          'wounds does not accept dice notation (e.g. "1d10+SB") — WFRP4e\'s CriticalModel calls Number.parseInt() and never rolls; only the leading integer would apply. Pass a plain integer string (e.g. "4") or the literal "death".',
      },
    ),
  modifier: z.string().optional(),
  location: z.string().optional(),
});

export type CriticalInput = z.infer<typeof CriticalSchema>;

export function buildCriticalSystem(p: CriticalInput): Record<string, unknown> {
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    wounds: { value: p.wounds ?? '1' },
    modifier: { value: p.modifier ?? '' },
    location: { value: p.location ?? '' },
  };
}
