// Phase 5 mcp_crud_expansion — MeasuredTemplate umbrella schema.
//
// Lifted from phase5_probes.md §MeasuredTemplate (Foundry 13.351).
// `author` field excluded from write surface (auto-set by Foundry).
// `t` enum (MEASURED_TEMPLATE_TYPES): 'circle'|'cone'|'rect'|'ray' — note "rect" not "rectangle".
//
// GM-only writes per plan §Design Decisions (no author-or-GM exemption surface).

import { z } from 'zod';
import { paginationFields } from './primitives.js';
import { SceneId, MeasuredTemplateId } from './branded-ids.js';

const TemplateTypeEnum = z
  .enum(['circle', 'cone', 'rect', 'ray'])
  .describe('CONST.MEASURED_TEMPLATE_TYPES: circle | cone | rect | ray');

const TemplateWritableFields = {
  t: TemplateTypeEnum.optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  elevation: z.number().optional(),
  sort: z.number().int().optional(),
  distance: z.number().optional(),
  direction: z.number().min(0).max(360).optional(),
  angle: z.number().min(0).max(360).optional(),
  width: z.number().optional(),
  // F09: Foundry's MeasuredTemplate ColorField stores 6-char hex only — passing 8-char
  // alpha-hex (#RRGGBBAA) silently corrupts the value (e.g. #0000ff80 → #00ff80, blue byte lost).
  // Constrain at the Zod layer so callers get a clear error instead of silent corruption.
  borderColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Color must be 6-char hex (#RRGGBB). Alpha-hex not supported by Foundry ColorField.')
    .optional(),
  fillColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Color must be 6-char hex (#RRGGBB). Alpha-hex not supported by Foundry ColorField.')
    .optional(),
  texture: z.string().nullable().optional(),
  hidden: z.boolean().optional(),
  flags: z.record(z.unknown()).optional(),
};

export const TemplateCreateInput = z
  .object({
    action: z.literal('create'),
    sceneId: SceneId,
    ...TemplateWritableFields,
    // Position is required for create — Foundry needs x/y to place the template.
    x: z.number(),
    y: z.number(),
  })
  .strict();

export const TemplateUpdateInput = z
  .object({
    action: z.literal('update'),
    sceneId: SceneId,
    templateId: MeasuredTemplateId,
    changes: z
      .object(TemplateWritableFields)
      .strict()
      .refine((obj) => Object.keys(obj).length > 0, {
        message: 'TEMPLATE_EMPTY_PAYLOAD: changes object must contain at least one field',
      }),
  })
  .strict();

export const TemplateDeleteInput = z
  .object({
    action: z.literal('delete'),
    sceneId: SceneId,
    templateId: MeasuredTemplateId,
  })
  .strict();

export const TemplateGetInput = z
  .object({
    action: z.literal('get'),
    sceneId: SceneId,
    templateId: MeasuredTemplateId,
  })
  .strict();

export const TemplateListInput = z
  .object({
    action: z.literal('list'),
    sceneId: SceneId.optional(),
    filter: z.string().optional(),
    hidden: z.boolean().optional(),
    ...paginationFields(),
    countOnly: z.boolean().optional(),
  })
  .strict();

// Phase 9C — duplicate a MeasuredTemplate (toObject minus _id → create). CCR-2a.
export const TemplateDuplicateInput = z
  .object({
    action: z.literal('duplicate'),
    sceneId: SceneId,
    templateId: MeasuredTemplateId,
  })
  .strict();

export const TemplateToolInput = z.discriminatedUnion('action', [
  TemplateCreateInput,
  TemplateUpdateInput,
  TemplateDeleteInput,
  TemplateGetInput,
  TemplateListInput,
  TemplateDuplicateInput,
]);

export type TemplateToolInputType = z.infer<typeof TemplateToolInput>;
export type TemplateCreateInputType = z.infer<typeof TemplateCreateInput>;
export type TemplateUpdateInputType = z.infer<typeof TemplateUpdateInput>;
export type TemplateDeleteInputType = z.infer<typeof TemplateDeleteInput>;
export type TemplateGetInputType = z.infer<typeof TemplateGetInput>;
export type TemplateListInputType = z.infer<typeof TemplateListInput>;
export type TemplateDuplicateInputType = z.infer<typeof TemplateDuplicateInput>;

export interface TemplateViewModel {
  id: string;
  sceneId: string;
  t: 'circle' | 'cone' | 'rect' | 'ray';
  x: number;
  y: number;
  elevation: number;
  sort: number;
  distance: number;
  direction: number;
  angle: number;
  width: number;
  borderColor: string;
  fillColor: string;
  texture: string | null;
  hidden: boolean;
  author: string;
  flags: Record<string, unknown>;
}

export interface TemplateListItem {
  id: string;
  sceneId: string;
  t: 'circle' | 'cone' | 'rect' | 'ray';
  distance: number;
  hidden: boolean;
  author: string;
}
