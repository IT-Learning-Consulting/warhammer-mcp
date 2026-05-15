// Phase 5 mcp_crud_expansion — MeasuredTemplate umbrella schema.
//
// Lifted from phase5_probes.md §MeasuredTemplate (Foundry 13.351).
// `author` field excluded from write surface (auto-set by Foundry).
// `t` enum (MEASURED_TEMPLATE_TYPES): 'circle'|'cone'|'rect'|'ray' — note "rect" not "rectangle".
//
// GM-only writes per plan §Design Decisions (no author-or-GM exemption surface).

import { z } from 'zod';

const FOUNDRY_ID = z.string().min(1);

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
  borderColor: z.string().optional(),
  fillColor: z.string().optional(),
  texture: z.string().nullable().optional(),
  hidden: z.boolean().optional(),
  flags: z.record(z.unknown()).optional(),
};

export const TemplateCreateInput = z
  .object({
    action: z.literal('create'),
    sceneId: FOUNDRY_ID,
    ...TemplateWritableFields,
    // Position is required for create — Foundry needs x/y to place the template.
    x: z.number(),
    y: z.number(),
  })
  .strict();

export const TemplateUpdateInput = z
  .object({
    action: z.literal('update'),
    sceneId: FOUNDRY_ID,
    templateId: FOUNDRY_ID,
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
    sceneId: FOUNDRY_ID,
    templateId: FOUNDRY_ID,
  })
  .strict();

export const TemplateGetInput = z
  .object({
    action: z.literal('get'),
    sceneId: FOUNDRY_ID,
    templateId: FOUNDRY_ID,
  })
  .strict();

export const TemplateListInput = z
  .object({
    action: z.literal('list'),
    sceneId: FOUNDRY_ID.optional(),
    filter: z.string().optional(),
    hidden: z.boolean().optional(),
    page: z.number().int().min(1).optional(),
    pageSize: z.number().int().min(1).max(100).optional(),
    countOnly: z.boolean().optional(),
  })
  .strict();

export const TemplateToolInput = z.discriminatedUnion('action', [
  TemplateCreateInput,
  TemplateUpdateInput,
  TemplateDeleteInput,
  TemplateGetInput,
  TemplateListInput,
]);

export type TemplateToolInputType = z.infer<typeof TemplateToolInput>;
export type TemplateCreateInputType = z.infer<typeof TemplateCreateInput>;
export type TemplateUpdateInputType = z.infer<typeof TemplateUpdateInput>;
export type TemplateDeleteInputType = z.infer<typeof TemplateDeleteInput>;
export type TemplateGetInputType = z.infer<typeof TemplateGetInput>;
export type TemplateListInputType = z.infer<typeof TemplateListInput>;

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
