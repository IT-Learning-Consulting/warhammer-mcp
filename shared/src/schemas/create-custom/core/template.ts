// Core subtype: template (TemplateModel). Composite "recipe" item for encounter-builder.
// Schema is loose per research §4: template.json is empty {}; real schema lives on the
// class and varies across owb modules. Accept raw composite payload.

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

export const TemplateSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('template'),
  characteristics: z.record(z.unknown()).optional(),
  skills: z.record(z.unknown()).optional(),
  talents: z.record(z.unknown()).optional(),
  traits: z.record(z.unknown()).optional(),
  trappings: z.record(z.unknown()).optional(),
  lores: z.record(z.unknown()).optional(),
  alterName: z
    .object({
      pre: z.string().optional(),
      post: z.string().optional(),
    })
    .optional(),
  notes: z.string().optional(),
  templateData: z.record(z.unknown()).optional(),
});

export type TemplateInput = z.infer<typeof TemplateSchema>;

export function buildTemplateSystem(p: TemplateInput): Record<string, unknown> {
  const base: Record<string, unknown> = {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
  };
  if (p.characteristics) base.characteristics = p.characteristics;
  if (p.skills) base.skills = p.skills;
  if (p.talents) base.talents = p.talents;
  if (p.traits) base.traits = p.traits;
  if (p.trappings) base.trappings = p.trappings;
  if (p.lores) base.lores = p.lores;
  if (p.alterName) base.alterName = { pre: p.alterName.pre ?? '', post: p.alterName.post ?? '' };
  if (p.notes !== undefined) base.notes = p.notes;
  if (p.templateData) Object.assign(base, p.templateData);
  return base;
}
