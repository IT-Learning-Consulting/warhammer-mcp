// Phase 5 mcp_crud_expansion — Note (map-pin) umbrella schema.
//
// Lifted from phase5_probes.md §Note (Foundry 13.351).
// entryId + pageId are ForeignDocumentField nullable — FK orphan recovery via formatFKLink.
// ViewModel surfaces entryLinked + pageLinked booleans.
// B5 (older Foundry data with entryId pointing at a Page) handled at handler layer, not schema.

import { z } from 'zod';
import { paginationFields } from './primitives.js';
import { TextureDataSchema, type TextureData } from './texture-data.js';
// Phase 6.4 — auto-link branch reuses Phase 3's PageInput discriminated union.
// B3: do NOT redefine the page shape; lift the canonical one from journal.ts.
import { PageInput } from './journal.js';
import { SceneId, NoteId, JournalEntryId, JournalEntryPageId } from './branded-ids.js';

const NoteWritableFields = {
  entryId: JournalEntryId.nullable().optional(),
  pageId: JournalEntryPageId.nullable().optional(),
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

// Phase 6.4 — auto-link branch: when present, handler creates a JournalEntry
// first, captures the new entry's id (and first page's id), then creates the
// note with those IDs. Mutually exclusive with explicit entryId — caller passes
// either {entryId, pageId?} OR {journalContent: {name, pages: [...]}}, never both.
export const NoteJournalContentInput = z.object({
  name: z.string().min(1),
  pages: z.array(PageInput).min(1),
}).strict();

export const NoteCreateInput = z
  .object({
    action: z.literal('create'),
    sceneId: SceneId,
    ...NoteWritableFields,
    x: z.number(),
    y: z.number(),
    // Auto-link convenience: create JournalEntry + link in one call.
    // If provided, entryId in the FK fields is overwritten with the new entry's id.
    // Branch-ambiguity check (entryId + journalContent both set) happens in the
    // handler, not in the schema — discriminatedUnion can't accept ZodEffects.
    journalContent: NoteJournalContentInput.optional(),
  })
  .strict();

export const NoteUpdateInput = z
  .object({
    action: z.literal('update'),
    sceneId: SceneId,
    noteId: NoteId,
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
    sceneId: SceneId,
    noteId: NoteId,
  })
  .strict();

export const NoteGetInput = z
  .object({
    action: z.literal('get'),
    sceneId: SceneId,
    noteId: NoteId,
  })
  .strict();

export const NoteListInput = z
  .object({
    action: z.literal('list'),
    sceneId: SceneId.optional(),
    filter: z.string().optional(),
    entryId: JournalEntryId.optional(),
    onlyOrphaned: z.boolean().optional(),
    ...paginationFields(),
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
