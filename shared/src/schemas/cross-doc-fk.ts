// Phase 10 mcp_crud_expansion — cross-doc FK audit + repair umbrella schemas.
//
// 3 actions in a discriminated union: audit-orphans, audit-document, repair-orphans.
// Catalog at `shared/src/fk-catalog.ts` enumerates the FK relationships the
// walker traverses. Per PRD §10 + PC9: audit-orphans is paginated (Phase 9
// `read-pack` shape), repair-orphans accepts `dryRun: true` (first MCP dryRun
// precedent — defense-in-depth for high-blast-radius op).
//
// Field-type encoding parallels fk-catalog.ts:
//   - `isObjectField: true`              → ObjectField (User.hotbar special)
//   - `isForeignDocumentField: true`     → ForeignDocumentField (bare 16-char world id)
//   - (neither flag set)                 → DocumentUUIDField (5-segment UUID)
//
// Per CCR-Envelope-Consumer §3: response interfaces are concrete typed objects,
// NO `z.any` / `<any>` anywhere in new code.

import { z } from 'zod';
import { FOUNDRY_ID, paginationFieldsDefaulted } from './primitives.js';

// World + embedded doc types Phase 10 catalog covers. Walker iterates these.
// Source: foundry_docs/CONST/variables/WORLD_DOCUMENT_TYPES.md + embedded subset
// with FK fields (Token, Note, RegionBehavior, TableResult).
export const CROSS_DOC_FK_DOC_TYPES = [
    // World docs
    'Actor',
    'Adventure',
    'Cards',
    'Folder',
    'Item',
    'JournalEntry',
    'Macro',
    'Playlist',
    'RollTable',
    'Scene',
    'User',
    // Embedded docs with cross-doc FKs (catalog walker enters these via parent traversal)
    'Token',
    'Note',
    'RegionBehavior',
    'TableResult',
    'JournalEntryPage',
    'PlaylistSound',
] as const;

export const CrossDocFkDocType = z.enum(CROSS_DOC_FK_DOC_TYPES);
export type CrossDocFkDocTypeType = z.infer<typeof CrossDocFkDocType>;

// --- Input schemas ---

export const AuditOrphansInput = z.object({
    action: z.literal('audit-orphans'),
    includeCompendiums: z.boolean().default(false),
    ...paginationFieldsDefaulted(500, 100),
});

export const AuditDocumentInput = z.object({
    action: z.literal('audit-document'),
    documentType: CrossDocFkDocType,
    documentId: FOUNDRY_ID, // polymorphic: not branded (Phase 1 design)
});

// One orphan reference identifies a stale FK by source doc + field + the bad target id.
export const FkOrphanRef = z.object({
    sourceDocType: CrossDocFkDocType,
    sourceDocId: FOUNDRY_ID, // polymorphic: not branded (Phase 1 design)
    sourceField: z.string().min(1),
    refDocType: CrossDocFkDocType,
    refId: FOUNDRY_ID, // polymorphic: not branded (Phase 1 design; FOUNDRY_ID primitive per C2 task 5.2)
});
export type FkOrphanRefType = z.infer<typeof FkOrphanRef>;

export const RepairOrphansInput = z.object({
    action: z.literal('repair-orphans'),
    orphans: z.array(FkOrphanRef).min(1),
    confirm: z.literal(true),
    dryRun: z.boolean().default(false),
});

export const CrossDocFkInput = z.discriminatedUnion('action', [
    AuditOrphansInput,
    AuditDocumentInput,
    RepairOrphansInput,
]);

export type AuditOrphansInputType = z.infer<typeof AuditOrphansInput>;
export type AuditDocumentInputType = z.infer<typeof AuditDocumentInput>;
export type RepairOrphansInputType = z.infer<typeof RepairOrphansInput>;
export type CrossDocFkInputType = z.infer<typeof CrossDocFkInput>;

// --- Response interfaces (CCR-Envelope-Consumer §3: concrete typed; no `<any>`) ---

/**
 * One orphan entry surfaced by the audit walker. Encodes the source-side FK
 * coordinates + the stale target id; consumers pass this back to
 * `repair-orphans` to clear the FK.
 */
export interface FkOrphanEntry {
    sourceDocType: CrossDocFkDocTypeType;
    sourceDocId: string;
    sourceDocName: string | null;
    sourceField: string;
    refDocType: CrossDocFkDocTypeType;
    refId: string;
    /** True for User.hotbar entries — `sourceField` is the slot number as string. */
    isHotbarSlot?: boolean;
    /** True for compendium-prefixed UUID refs (DocumentUUIDField targets in packs). */
    isCompendiumRef?: boolean;
}

/**
 * One affected doc surfaced by cascade-clear inside an umbrella delete. The
 * delete handler builds this list mid-`wrappedWrite` (before the delete) so
 * the response can show the user what was cleared atomically.
 */
export interface FkAffectedDocEntry {
    type: CrossDocFkDocTypeType;
    id: string;
    name: string | null;
    fkField: string;
}

export interface AuditOrphansResponse {
    orphanCount: number;
    page: number;
    pageSize: number;
    pageCount: number;
    totalOrphans: number;
    includeCompendiums: boolean;
    orphans: FkOrphanEntry[];
}

export interface AuditDocumentResponse {
    documentType: CrossDocFkDocTypeType;
    documentId: string;
    documentName: string | null;
    /** Orphans owned BY this doc (outbound stale refs). */
    outbound: FkOrphanEntry[];
    /** Orphans that POINT AT this doc (inbound — empty for non-target audits). */
    inbound: FkOrphanEntry[];
    outboundCount: number;
    inboundCount: number;
}

export interface RepairOrphansResponse {
    /** `true` when `dryRun: true` was set — no mutations performed. */
    dryRun: boolean;
    requestedCount: number;
    clearedCount: number;
    skippedCount: number;
    /** Per-orphan disposition for caller traceability. */
    results: FkRepairResultEntry[];
}

export interface FkRepairResultEntry {
    sourceDocType: CrossDocFkDocTypeType;
    sourceDocId: string;
    sourceField: string;
    refDocType: CrossDocFkDocTypeType;
    refId: string;
    status: 'cleared' | 'would-clear' | 'skipped';
    /** Present when status === 'skipped'. */
    skipReason?: string;
}
