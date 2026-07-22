// Core subtype: disease (DiseaseModel). Formulas (incubation.value, duration.value) are strings per Core p.186.

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

// BUG-648: live-verified as an unconstrained string — wfrp4e.js:28723-28724 interpolates
// `this.incubation.unit`/`this.duration.unit` directly into localized display text with no
// type/enum validation. The published corpus (44 diseases) includes "minutes" and blank ("")
// units alongside hours/days/weeks; the prior enum rejected both, which schema probes confirmed.
const DurationUnit = z.string();

export const DiseaseSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('disease'),
  contraction: z.string().optional(),
  incubation: z
    .object({
      value: z.string().optional(),
      unit: DurationUnit.optional(),
    })
    .optional(),
  duration: z
    .object({
      value: z.string().optional(),
      unit: DurationUnit.optional(),
      active: z.boolean().optional(),
    })
    .optional(),
  symptoms: z.string().optional(),
  permanent: z.string().optional(),
});

export type DiseaseInput = z.infer<typeof DiseaseSchema>;

export function buildDiseaseSystem(p: DiseaseInput): Record<string, unknown> {
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    contraction: { value: p.contraction ?? '' },
    incubation: {
      value: p.incubation?.value ?? '',
      unit: p.incubation?.unit ?? 'days',
    },
    duration: {
      value: p.duration?.value ?? '',
      unit: p.duration?.unit ?? 'days',
      active: p.duration?.active ?? false,
    },
    symptoms: { value: p.symptoms ?? '' },
    permanent: { value: p.permanent ?? '' },
  };
}
