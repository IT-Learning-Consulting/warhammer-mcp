// Phase 3 mcp_crud_expansion — Journal multi-page + multi-type umbrella schemas.
//
// Single `journal` MCP tool with 13 actions on JournalEntry + JournalEntryPage +
// JournalEntryCategory. Replaces the 5 legacy schemas previously in meta.ts:
//   - CreateJournalEntryInput
//   - ListJournalsInput
//   - GetJournalContentInput
//   - UpdateJournalContentInput
//   - DeleteJournalEntryInput
//
// Anchors:
//   v13 schema sentinels (verified via F12 paste 2026-05-14):
//   - JournalEntryPage.TYPES = ['text','image','pdf','video','gatherer.gatherer',
//     'mastercrafted.mastercrafted'] — 4 core + 2 module-provided. CRUD inputs
//     accept the 4 core types only; module types stay out of scope (their parent
//     module owns their CRUD surface). Reads (get-entry / list-entries) return
//     the raw `type: string` so module-typed pages don't break inspection.
//   - title defaults: {show: true, level: 1}
//   - text.format default: 1 (HTML); 2 = MARKDOWN (CONST.JOURNAL_ENTRY_PAGE_FORMATS)
//   - PDF src accepts both URL ("https://...") and Foundry-relative path
//     ("modules/.../foo.pdf") — single z.string() validator suffices.
//
// CCR-Schema-Fidelity: Zod field paths mirror Foundry defineSchema paths 1:1.
// CCR-Envelope-Consumer: every response interface is a concrete shape, no <any>.
// CCR-Umbrella-Hygiene: action names are <verb>-<noun> kebab-case; ≤ 10 fields
// per action variant excluding the discriminator.

import { z } from 'zod';
import { FolderId, JournalCategoryId, JournalEntryId, JournalEntryPageId } from './branded-ids.js';

// ── Constants & small shared shapes ──────────────────────────────────────────

// 4 core page types. Module-provided types (e.g. 'gatherer.gatherer') are read-
// only in this surface — their CRUD lives with the parent module.
const CORE_PAGE_TYPES = ['text', 'image', 'pdf', 'video'] as const;

const PageTitleInput = z.object({
  show: z.boolean().optional(),
  level: z.number().int().min(1).max(6).optional(),
}).strict();

const PageTextInputBody = z.object({
  content: z.string().optional(),
  // 1 = HTML (ProseMirror), 2 = MARKDOWN. CONST.JOURNAL_ENTRY_PAGE_FORMATS.
  format: z.union([z.literal(1), z.literal(2)]).optional(),
  // Foundry auto-populates this on format=2 saves; we let callers write it too
  // for round-trip parity (research §1.3).
  markdown: z.string().optional(),
}).strict();

const PageImageInputBody = z.object({
  caption: z.string().optional(),
}).strict();

const PageVideoInputBody = z.object({
  autoplay: z.boolean().optional(),
  loop: z.boolean().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  volume: z.number().min(0).max(1).optional(),
  timestamp: z.number().int().nonnegative().optional(),
  controls: z.boolean().optional(),
}).strict();

// ── Page-type-discriminated input schemas (used by create-entry, add-page) ───

const PageCommonInput = {
  name: z.string().min(1),
  sort: z.number().int().optional(),
  title: PageTitleInput.optional(),
  // Category FK — assign at create time. Null means "uncategorised".
  category: JournalCategoryId.nullable().optional(),
  flags: z.record(z.unknown()).optional(),
  ownership: z.record(z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])).optional(),
};

export const PageTextInput = z.object({
  type: z.literal('text'),
  text: PageTextInputBody.optional(),
  ...PageCommonInput,
}).strict();

export const PageImageInput = z.object({
  type: z.literal('image'),
  src: z.string().min(1),
  image: PageImageInputBody.optional(),
  ...PageCommonInput,
}).strict();

export const PagePDFInput = z.object({
  type: z.literal('pdf'),
  src: z.string().min(1),
  ...PageCommonInput,
}).strict();

export const PageVideoInput = z.object({
  type: z.literal('video'),
  src: z.string().optional(),
  video: PageVideoInputBody.optional(),
  ...PageCommonInput,
}).strict();

export const PageInput = z.discriminatedUnion('type', [
  PageTextInput,
  PageImageInput,
  PagePDFInput,
  PageVideoInput,
]);

// ── Page partial-diff schemas (used by update-page changes) ─────────────────
//
// update-page accepts a `changes: { ...partial fields }` object that can patch
// any subset of the page's writable fields. Type cannot change post-create
// (Foundry rejects type swaps on updateEmbeddedDocuments — schema enforces this
// by omitting `type` from the changes shape).

const PageChangesCommon = {
  name: z.string().min(1).optional(),
  sort: z.number().int().optional(),
  title: PageTitleInput.optional(),
  category: JournalCategoryId.nullable().optional(),
  flags: z.record(z.unknown()).optional(),
  ownership: z.record(z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])).optional(),
};

export const PageChangesInput = z.object({
  ...PageChangesCommon,
  // Subtype-specific bodies (caller passes whichever applies to the page's type;
  // handler validates against the page's actual type at runtime).
  text: PageTextInputBody.optional(),
  image: PageImageInputBody.optional(),
  video: PageVideoInputBody.optional(),
  src: z.string().optional(),
}).strict().refine(
  (obj) => Object.keys(obj).length > 0,
  { message: 'JOURNAL_EMPTY_PAYLOAD: changes object must contain at least one field' },
);

// ── JournalEntry top-level writable fields (used by update-entry) ───────────

const EntryWritableFields = {
  name: z.string().min(1).optional(),
  folder: FolderId.nullable().optional(),
  sort: z.number().int().optional(),
  // Ownership: { default?: 0|1|2|3, "<userId>": 0|1|2|3, ... } — Foundry's
  // DocumentOwnershipField. 0=NONE 1=LIMITED 2=OBSERVER 3=OWNER.
  ownership: z.record(z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])).optional(),
  flags: z.record(z.unknown()).optional(),
};

// ── JournalEntryCategory schemas (used by add/update/delete-category) ──────
//
// BaseJournalEntryCategory.defineSchema (verified): { _id, _stats, flags, name, sort }.
// No description / image / icon — Categories are minimal organisational headers.

const CategoryWritableFields = {
  name: z.string().min(1).optional(),
  sort: z.number().int().optional(),
  flags: z.record(z.unknown()).optional(),
};

// ── 13 action schemas (discriminated union on `action`) ─────────────────────

export const JournalCreateEntryInput = z.object({
  action: z.literal('create-entry'),
  name: z.string().min(1),
  folder: FolderId.nullable().optional(),
  sort: z.number().int().optional(),
  ownership: z.record(z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])).optional(),
  flags: z.record(z.unknown()).optional(),
  pages: z.array(PageInput).optional(),
  // Categories optional inline-on-create. Each one creates a JournalEntryCategory
  // embedded doc on the new entry; their generated IDs are returned in the
  // response shape so the caller can wire pages → categories in a follow-up call.
  categories: z.array(z.object({
    name: z.string().min(1),
    sort: z.number().int().optional(),
    flags: z.record(z.unknown()).optional(),
  }).strict()).optional(),
}).strict();

export const JournalUpdateEntryInput = z.object({
  action: z.literal('update-entry'),
  entryId: JournalEntryId,
  changes: z.object(EntryWritableFields).strict().refine(
    (obj) => Object.keys(obj).length > 0,
    { message: 'JOURNAL_EMPTY_PAYLOAD: changes object must contain at least one field' },
  ),
}).strict();

export const JournalDeleteEntryInput = z.object({
  action: z.literal('delete-entry'),
  entryId: JournalEntryId,
  // Phase 10 cross-doc-fk: when true, clears Scene.journal/journalEntryPage
  // + Note.entryId/pageId FKs pointing at this entry (and its pages) before
  // delete. Default false preserves Phase 3 behavior (R10.6).
  cascade: z.boolean().default(false).optional(),
}).strict();

export const JournalListEntriesInput = z.object({
  action: z.literal('list-entries'),
  // General template filter — matches journals whose name starts with
  // `<template>:` case-insensitive (e.g. filterTemplate: "session-log").
  filterTemplate: z.string().min(1).optional(),
  // Back-compat alias for filterTemplate: "quest". Existing
  // /wfrp-session-prep + /wfrp-journal callers continue to work.
  filterQuests: z.boolean().optional(),
  // When true: each entry's first text-page content is populated in `content`.
  includeContent: z.boolean().optional(),
  // Optional folder filter (by id).
  folder: FolderId.nullable().optional(),
}).strict();

export const JournalGetEntryInput = z.object({
  action: z.literal('get-entry'),
  entryId: JournalEntryId,
  // When true: respond with the shallow `{id, name, pageIds, pageCount, categoryCount}`
  // shape (cheaper for 272-page lore journals). Default false = deep response.
  shallow: z.boolean().optional(),
}).strict();

export const JournalAddPageInput = z.object({
  action: z.literal('add-page'),
  entryId: JournalEntryId,
  page: PageInput,
}).strict();

export const JournalUpdatePageInput = z.object({
  action: z.literal('update-page'),
  entryId: JournalEntryId,
  pageId: JournalEntryPageId,
  changes: PageChangesInput,
}).strict();

export const JournalDeletePageInput = z.object({
  action: z.literal('delete-page'),
  entryId: JournalEntryId,
  pageId: JournalEntryPageId,
  // Phase 10 cross-doc-fk: when true, clears Scene.journalEntryPage +
  // Note.pageId FKs targeting this specific page. Default false (R10.6).
  cascade: z.boolean().default(false).optional(),
}).strict();

export const JournalReorderPagesInput = z.object({
  action: z.literal('reorder-pages'),
  entryId: JournalEntryId,
  // Ordered array of every page ID on the entry. Length must equal
  // entry.pages.size — partial reorder rejected (Q&A R3 lock).
  pageIds: z.array(JournalEntryPageId).min(1),
}).strict();

export const JournalAddCategoryInput = z.object({
  action: z.literal('add-category'),
  entryId: JournalEntryId,
  name: z.string().min(1),
  sort: z.number().int().optional(),
  flags: z.record(z.unknown()).optional(),
}).strict();

export const JournalUpdateCategoryInput = z.object({
  action: z.literal('update-category'),
  entryId: JournalEntryId,
  categoryId: JournalCategoryId,
  changes: z.object(CategoryWritableFields).strict().refine(
    (obj) => Object.keys(obj).length > 0,
    { message: 'JOURNAL_EMPTY_PAYLOAD: changes object must contain at least one field' },
  ),
}).strict();

export const JournalDeleteCategoryInput = z.object({
  action: z.literal('delete-category'),
  entryId: JournalEntryId,
  categoryId: JournalCategoryId,
}).strict();

export const JournalAssignPageToCategoryInput = z.object({
  action: z.literal('assign-page-to-category'),
  entryId: JournalEntryId,
  pageId: JournalEntryPageId,
  // null = UNASSIGN (clears the page's category FK).
  categoryId: JournalCategoryId.nullable(),
}).strict();

// ── Phase 9B — document presentation ────────────────────────────────────────

// R9B.1 — show-to-players: JournalEntry#show(true) socket broadcast. CCR-2b transient.
// NOTE: v13 .show() takes only a `force` boolean — NO per-user targeting (the PRD's
// `users?` param has no API backing, so it is intentionally omitted — plan D2).
export const JournalShowToPlayersInput = z.object({
  action: z.literal('show-to-players'),
  entryId: JournalEntryId,
}).strict();

// R9B.2 — duplicate-entry: clone the JournalEntry (entry.clone({}, {save:true})). CCR-2a.
export const JournalDuplicateEntryInput = z.object({
  action: z.literal('duplicate-entry'),
  entryId: JournalEntryId,
}).strict();

// ── Discriminated-union umbrella ────────────────────────────────────────────

export const JournalToolInput = z.discriminatedUnion('action', [
  JournalCreateEntryInput,
  JournalUpdateEntryInput,
  JournalDeleteEntryInput,
  JournalListEntriesInput,
  JournalGetEntryInput,
  JournalAddPageInput,
  JournalUpdatePageInput,
  JournalDeletePageInput,
  JournalReorderPagesInput,
  JournalAddCategoryInput,
  JournalUpdateCategoryInput,
  JournalDeleteCategoryInput,
  JournalAssignPageToCategoryInput,
  JournalShowToPlayersInput,
  JournalDuplicateEntryInput,
]);

export type JournalToolInputType = z.infer<typeof JournalToolInput>;
export type JournalShowToPlayersInputType = z.infer<typeof JournalShowToPlayersInput>;
export type JournalDuplicateEntryInputType = z.infer<typeof JournalDuplicateEntryInput>;
export type JournalCreateEntryInputType = z.infer<typeof JournalCreateEntryInput>;
export type JournalUpdateEntryInputType = z.infer<typeof JournalUpdateEntryInput>;
export type JournalDeleteEntryInputType = z.infer<typeof JournalDeleteEntryInput>;
export type JournalListEntriesInputType = z.infer<typeof JournalListEntriesInput>;
export type JournalGetEntryInputType = z.infer<typeof JournalGetEntryInput>;
export type JournalAddPageInputType = z.infer<typeof JournalAddPageInput>;
export type JournalUpdatePageInputType = z.infer<typeof JournalUpdatePageInput>;
export type JournalDeletePageInputType = z.infer<typeof JournalDeletePageInput>;
export type JournalReorderPagesInputType = z.infer<typeof JournalReorderPagesInput>;
export type JournalAddCategoryInputType = z.infer<typeof JournalAddCategoryInput>;
export type JournalUpdateCategoryInputType = z.infer<typeof JournalUpdateCategoryInput>;
export type JournalDeleteCategoryInputType = z.infer<typeof JournalDeleteCategoryInput>;
export type JournalAssignPageToCategoryInputType = z.infer<typeof JournalAssignPageToCategoryInput>;
export type PageInputType = z.infer<typeof PageInput>;
export type PageChangesInputType = z.infer<typeof PageChangesInput>;

// ── Response shapes (concrete typed; CCR-Envelope-Consumer rule 3) ─────────

export interface JournalPagePayload {
  id: string;
  type: string; // includes module types like 'gatherer.gatherer' on read
  name: string;
  sort: number;
  title: { show: boolean; level: number };
  category: string | null;
  text?: { content: string; format: number; markdown?: string };
  src?: string;
  image?: { caption?: string };
  video?: {
    autoplay?: boolean;
    loop?: boolean;
    width?: number;
    height?: number;
    volume?: number;
    timestamp?: number;
    controls?: boolean;
  };
  flags?: Record<string, unknown>;
  ownership?: Record<string, number>;
}

export interface JournalCategoryPayload {
  id: string;
  name: string;
  sort: number;
  flags?: Record<string, unknown>;
}

export interface JournalEntryDeepPayload {
  id: string;
  name: string;
  folder: string | null;
  sort: number;
  ownership: Record<string, number>;
  flags: Record<string, unknown>;
  pages: JournalPagePayload[];
  categories: JournalCategoryPayload[];
}

export interface JournalEntryShallowPayload {
  id: string;
  name: string;
  pageIds: string[];
  pageCount: number;
  categoryCount: number;
}

export interface JournalListEntryPayload {
  id: string;
  name: string;
  type: 'JournalEntry';
  pageCount: number;
  // Present only when includeContent=true on list-entries.
  content?: string;
}

export interface JournalCreateEntryResponse {
  id: string;
  name: string;
  pageIds: string[];
  categoryIds: string[];
}

export interface JournalUpdateEntryResponse {
  entryId: string;
  changes: Record<string, unknown>;
}

export interface JournalDeleteEntryResponse {
  entryId: string;
  // Phase 10: populated only when input cascade:true was set.
  affectedDocs?: import('./cross-doc-fk.js').FkAffectedDocEntry[];
}

export type JournalListEntriesResponse = JournalListEntryPayload[];

export type JournalGetEntryResponse = JournalEntryDeepPayload | JournalEntryShallowPayload;

export interface JournalAddPageResponse {
  entryId: string;
  pageId: string;
  type: string;
}

export interface JournalUpdatePageResponse {
  entryId: string;
  pageId: string;
  changes: Record<string, unknown>;
}

export interface JournalDeletePageResponse {
  entryId: string;
  pageId: string;
  // Phase 10: populated only when input cascade:true was set.
  affectedDocs?: import('./cross-doc-fk.js').FkAffectedDocEntry[];
}

export interface JournalReorderPagesResponse {
  entryId: string;
  pageCount: number;
  pageIds: string[];
}

export interface JournalAddCategoryResponse {
  entryId: string;
  categoryId: string;
  name: string;
}

export interface JournalUpdateCategoryResponse {
  entryId: string;
  categoryId: string;
  changes: Record<string, unknown>;
}

export interface JournalDeleteCategoryResponse {
  entryId: string;
  categoryId: string;
  affectedPages: string[];
}

export interface JournalAssignPageToCategoryResponse {
  entryId: string;
  pageId: string;
  categoryId: string | null;
}

// Phase 9B response shapes.
export interface JournalShowToPlayersResponse {
  entryId: string;
  name: string;
  // CCR-2b transient: the show() socket broadcast fired; no persisted state.
  shown: true;
}

export interface JournalDuplicateEntryResponse {
  sourceId: string;
  newId: string;
  name: string;
}

// Export the core page-type constant so callers can introspect what CRUD covers.
export const JOURNAL_CORE_PAGE_TYPES = CORE_PAGE_TYPES;
