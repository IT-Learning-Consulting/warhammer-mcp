// Phase 5 mcp_crud_expansion — Note (map-pin) umbrella schema.
//
// Lifted from phase5_probes.md §Note (Foundry 13.351).
// entryId + pageId are ForeignDocumentField nullable — FK orphan recovery via formatFKLink.
// ViewModel surfaces entryLinked + pageLinked booleans.
// B5 (older Foundry data with entryId pointing at a Page) handled at handler layer, not schema.

import { z } from 'zod';
import { TextureDataSchema, type TextureData } from './texture-data.js';

const FOUNDRY_ID = z.string().min(1);

const NoteWritableFields = {
  entryId: FOUNDRY_ID.nullable().optional(),
  pageId: FOUNDRY_ID.nullable().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  elevation: z.number().optional(),
  sort: z.number().int().optional(),
  texture: TextureDataSchema.optional(),
  iconSize: z.number().min(8).optional(),
  text: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.number().min(8).optional(),
  textAnchor: z.number().int().min(0).max(4).optional(),
  textColor: z.string().optional(),
  global: z.boolean().optional(),
  flags: z.record(z.unknown()).optional(),
};

export const NoteCreateInput = z
  .object({
    action: z.literal('create'),
    sceneId: FOUNDRY_ID,
    ...NoteWritableFields,
    x: z.number(),
    y: z.number(),
  })
  .strict();

export const NoteUpdateInput = z
  .object({
    action: z.literal('update'),
    sceneId: FOUNDRY_ID,
    noteId: FOUNDRY_ID,
    changes: z
      .object(NoteWritableFields)
      .strict()
      .refine((obj) => Object.keys(obj).length > 0, {
        message: 'NOTE_EMPTY_PAYLOAD: changes object must contain at least one field',
      }),
  })
  .strict();

export const NoteDeleteInput = z
  .object({
    action: z.literal('delete'),
    sceneId: FOUNDRY_ID,
    noteId: FOUNDRY_ID,
  })
  .strict();

export const NoteGetInput = z
  .object({
    action: z.literal('get'),
    sceneId: FOUNDRY_ID,
    noteId: FOUNDRY_ID,
  })
  .strict();

export const NoteListInput = z
  .object({
    action: z.literal('list'),
    sceneId: FOUNDRY_ID.optional(),
    filter: z.string().optional(),
    entryId: FOUNDRY_ID.optional(),
    onlyOrphaned: z.boolean().optional(),
    page: z.number().int().min(1).optional(),
    pageSize: z.number().int().min(1).max(100).optional(),
    countOnly: z.boolean().optional(),
  })
  .strict();

export const NoteToolInput = z.discriminatedUnion('action', [
  NoteCreateInput,
  NoteUpdateInput,
  NoteDeleteInput,
  NoteGetInput,
  NoteListInput,
]);

export type NoteToolInputType = z.infer<typeof NoteToolInput>;
export type NoteCreateInputType = z.infer<typeof NoteCreateInput>;
export type NoteUpdateInputType = z.infer<typeof NoteUpdateInput>;
export type NoteDeleteInputType = z.infer<typeof NoteDeleteInput>;
export type NoteGetInputType = z.infer<typeof NoteGetInput>;
export type NoteListInputType = z.infer<typeof NoteListInput>;

export interface NoteViewModel {
  id: string;
  sceneId: string;
  entryId: string | null;
  pageId: string | null;
  /** True iff entryId is set AND the JournalEntry currently exists. */
  entryLinked: boolean;
  /** True iff pageId is set AND the page currently exists within the linked entry. */
  pageLinked: boolean;
  x: number;
  y: number;
  elevation: number;
  sort: number;
  texture: TextureData;
  iconSize: number;
  text: string | null;
  fontFamily: string;
  fontSize: number;
  textAnchor: number;
  textColor: string;
  global: boolean;
  flags: Record<string, unknown>;
}

export interface NoteListItem {
  id: string;
  sceneId: string;
  entryId: string | null;
  entryLinked: boolean;
  pageLinked: boolean;
  text: string | null;
}
