// Phase 8 mcp_coverage_expansion — `document-io` shared schema.
//
// Generic export / import-as-new / preview over 8 world document types:
//   Actor, Item, JournalEntry, Macro, Scene, Playlist, RollTable, Cards.
//
// Clone/template semantics — NOT backup/restore. Ids are REGENERATED on import.
// World-scope only. Inline JSON payload (toObject() round-trip).
//
// Three actions:
//   export       → doc.toObject() JSON (read-only, no confirm)
//   import-as-new → validate→strip→DocClass.create→re-read→{newId,oldId,idMap,warnings}
//   preview      → new DocClass(data) in-memory, NO write, NO confirm
//
// CCR-4: only import-as-new is a write; it carries confirm:z.literal(true).
// HC1 / CCR-3: no CONFIG/WFRP references; thin cross-type primitive.

import { z } from 'zod';

const FOUNDRY_ID = z.string().min(1);

// Authoritative 8-type documentType enum (PRD R8.1).
// Collection map lives in cross-doc-fk.ts getDocCollection().
export const DOCUMENT_TYPE = z.enum([
  'Actor',
  'Item',
  'JournalEntry',
  'Macro',
  'Scene',
  'Playlist',
  'RollTable',
  'Cards',
]);

export type DocumentTypeType = z.infer<typeof DOCUMENT_TYPE>;

// ── export ────────────────────────────────────────────────────────────────────

export const DocumentIoExportInput = z
  .object({
    action: z.literal('export'),
    documentType: DOCUMENT_TYPE,
    id: FOUNDRY_ID,
  })
  .strict();

// ── import-as-new ─────────────────────────────────────────────────────────────

export const DocumentIoImportInput = z
  .object({
    action: z.literal('import-as-new'),
    documentType: DOCUMENT_TYPE,
    // Permissive payload — accepts any toObject() output (arbitrary keys).
    // The wrapper object is strict; the payload itself is passthrough.
    data: z.record(z.unknown()),
    // Mirror FromCompendiumOptions semantics (PRD R8.2):
    //   preserveOwnership=false (default) → strip ownership on import.
    //   targetFolderId=<id> → place doc in that folder; omit → clear folder.
    preserveOwnership: z.boolean().default(false),
    targetFolderId: FOUNDRY_ID.optional(),
    // CCR-4: only this action writes; require explicit confirmation.
    confirm: z.literal(true),
  })
  .strict();

// ── preview ───────────────────────────────────────────────────────────────────

export const DocumentIoPreviewInput = z
  .object({
    action: z.literal('preview'),
    documentType: DOCUMENT_TYPE,
    data: z.record(z.unknown()),
  })
  .strict();

// ── Umbrella union ────────────────────────────────────────────────────────────
// discriminatedUnion on `action` — every member is a plain strict ZodObject
// (no member-level .refine() — those would produce ZodEffects, which
// discriminatedUnion rejects; Phase 4/7 lesson).

export const DocumentIoToolInput = z.discriminatedUnion('action', [
  DocumentIoExportInput,
  DocumentIoImportInput,
  DocumentIoPreviewInput,
]);

export type DocumentIoToolInputType = z.infer<typeof DocumentIoToolInput>;

// ── View models (CCR-Envelope-Consumer: concrete typed, no `any`) ─────────────

export interface DocumentIoExportResult {
  documentType: string;
  id: string;
  /** Full toObject() JSON of the exported document. */
  data: Record<string, unknown>;
}

export interface DocumentIoImportResult {
  documentType: string;
  newId: string;
  oldId: string;
  /** Top-level id map only: { [oldId]: newId }. Embedded ids are regenerated
   *  by Foundry (keepEmbeddedIds defaults false) but are NOT tracked here (v2). */
  idMap: Record<string, string>;
  /** Advisory warnings surfaced to the caller without blocking the import.
   *  Always includes the @UUID-may-break note; Cards imports additionally
   *  warn about cross-stack origin FK breakage. */
  warnings: string[];
}

export interface DocumentIoPreviewResult {
  documentType: string;
  name: string;
  /** Count of embedded documents per sub-collection (e.g. {items: 5, effects: 2}). */
  embeddedCounts: Record<string, number>;
  /** Whether the source data has a non-null folder field. */
  hasFolder: boolean;
  /** Whether the source data has a non-default ownership record. */
  hasOwnership: boolean;
  /** Count of @UUID[ link occurrences in the serialized JSON (not resolved). */
  uuidLinkCount: number;
  /** Validation warnings from in-memory construction (non-fatal schema drift, etc.). */
  warnings: string[];
}
