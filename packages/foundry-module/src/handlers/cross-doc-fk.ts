// Phase 10 mcp_crud_expansion — Cross-doc FK audit + repair umbrella handler.
//
// Three actions:
//   - audit-orphans:    paginated world walk; returns FkOrphanEntry[]
//   - audit-document:   inbound + outbound audit for a single doc
//   - repair-orphans:   per-orphan FK clear, GM-only, wrappedWrite + post-verify
//
// Foundry FK semantics (per Phase 4 Probe D + Phase 10 Phase 0 probes):
//   - ForeignDocumentField (bare 16-char world id) does NOT auto-null on
//     referent delete. Read `_source.<field>` for audit; clear via `update`.
//   - DocumentUUIDField (5-segment UUID string) does NOT auto-null. Resolve
//     via `fromUuid` (compendium-prefixed UUIDs gated by includeCompendiums).
//   - ObjectField (User.hotbar special) → iterate keys; clear via
//     User.assignHotbarMacro(null, slot) per BUG-103. Raw `update({hotbar.-=N:
//     null})` SILENTLY no-ops.
//   - Embedded docs (Token / Note / RegionBehavior / TableResult / JournalEntryPage / PlaylistSound):
//     walker enters them via parent traversal; mutates via parent.update with
//     the embedded path.

import {
    FK_CATALOG,
    CrossDocFkInput,
    type FKCatalogEntry,
    type AuditOrphansInputType,
    type AuditDocumentInputType,
    type RepairOrphansInputType,
    type CrossDocFkInputType,
    type CrossDocFkDocTypeType,
    type FkOrphanEntry,
    type FkOrphanRefType,
    type AuditOrphansResponse,
    type AuditDocumentResponse,
    type RepairOrphansResponse,
    type FkRepairResultEntry,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { notify } from '../notify.js';

const CROSSDOC_DENY = (msg: string) => `FORBIDDEN: ${msg}`;

function ensureGM(operation: string): string | null {
    return game.user?.isGM ? null : CROSSDOC_DENY(`${operation} requires GM`);
}

// ============================================================================
// Doc-type → collection accessor
// ============================================================================

interface DocCollection {
    contents: any[];
    get(id: string): any | undefined;
}

function getDocCollection(docType: CrossDocFkDocTypeType): DocCollection | null {
    switch (docType) {
        case 'Actor': return game.actors as unknown as DocCollection;
        case 'Adventure': return (game as any).adventures ?? null;
        case 'Cards': return (game as any).cards ?? null;
        case 'Folder': return game.folders as unknown as DocCollection;
        case 'Item': return game.items as unknown as DocCollection;
        case 'JournalEntry': return game.journal as unknown as DocCollection;
        case 'Macro': return game.macros as unknown as DocCollection;
        case 'Playlist': return game.playlists as unknown as DocCollection;
        case 'RollTable': return game.tables as unknown as DocCollection;
        case 'Scene': return game.scenes as unknown as DocCollection;
        case 'User': return game.users as unknown as DocCollection;
        // Embedded docs walked via parent traversal — caller iterates manually.
        case 'Token':
        case 'Note':
        case 'RegionBehavior':
        case 'TableResult':
        case 'JournalEntryPage':
        case 'PlaylistSound':
            return null;
        default:
            return null;
    }
}

// ============================================================================
// _source field reader (dot-path) — never reads prepared accessor
// ============================================================================

function getSourceDeep(doc: any, fieldPath: string): unknown {
    const parts = fieldPath.split('.');
    // Always read from doc._source per Phase 4 Probe D / Phase 11 carry-forward —
    // doc._source is the raw persisted state; doc.<field> is the prepared accessor
    // that may not reflect deletion-in-flight. Fall back to doc only when _source
    // is unset (defensive; shouldn't happen for live docs).
    let cur: any = doc._source ?? doc;
    for (const part of parts) {
        if (cur == null) return undefined;
        cur = cur[part];
    }
    return cur;
}

// ============================================================================
// Existence resolver
// ============================================================================

/**
 * Resolve whether a referenced doc exists. Returns:
 *   - true  → reference resolves to a live doc
 *   - false → reference is stale (orphan)
 *   - 'skip' → compendium ref while includeCompendiums is false
 */
async function resolveRef(
    refDocType: CrossDocFkDocTypeType,
    refValue: string,
    entry: FKCatalogEntry,
    includeCompendiums: boolean,
): Promise<boolean | 'skip'> {
    if (!refValue) return true; // null / empty is not an orphan

    // Heuristic: 5-segment compendium UUID → DocumentUUIDField path
    const isCompendiumUuid = typeof refValue === 'string' && refValue.startsWith('Compendium.');
    if (isCompendiumUuid && !includeCompendiums) return 'skip';

    if (entry.isObjectField || entry.isForeignDocumentField) {
        // World id only (16-char bare id) — resolve via collection.get
        const collection = getDocCollection(refDocType);
        if (!collection) return true; // unknown collection — treat as non-orphan
        return collection.get(refValue) != null;
    }

    // DocumentUUIDField (no flag set) — resolve via fromUuid (v13 global)
    try {
        const resolved = await (globalThis as any).fromUuid?.(refValue);
        return resolved != null;
    } catch {
        return false;
    }
}

// ============================================================================
// Embedded-doc walkers (parent → embedded iteration)
// ============================================================================

interface EmbeddedRef {
    parent: any;
    doc: any;
    parentDocType: CrossDocFkDocTypeType;
    parentDocId: string;
}

function* iterateEmbedded(docType: CrossDocFkDocTypeType): Generator<EmbeddedRef> {
    switch (docType) {
        case 'Token': {
            for (const scene of (game.scenes?.contents ?? [])) {
                for (const tok of (scene.tokens?.contents ?? [])) {
                    yield { parent: scene, doc: tok, parentDocType: 'Scene', parentDocId: scene.id as string };
                }
            }
            return;
        }
        case 'Note': {
            for (const scene of (game.scenes?.contents ?? [])) {
                for (const note of (scene.notes?.contents ?? [])) {
                    yield { parent: scene, doc: note, parentDocType: 'Scene', parentDocId: scene.id as string };
                }
            }
            return;
        }
        case 'RegionBehavior': {
            for (const scene of (game.scenes?.contents ?? [])) {
                for (const region of ((scene as any).regions?.contents ?? [])) {
                    for (const beh of (region.behaviors?.contents ?? [])) {
                        yield { parent: region, doc: beh, parentDocType: 'Scene', parentDocId: scene.id as string };
                    }
                }
            }
            return;
        }
        case 'TableResult': {
            for (const tbl of (game.tables?.contents ?? [])) {
                for (const res of (tbl.results?.contents ?? [])) {
                    yield { parent: tbl, doc: res, parentDocType: 'RollTable', parentDocId: tbl.id };
                }
            }
            return;
        }
        case 'JournalEntryPage': {
            for (const j of (game.journal?.contents ?? [])) {
                for (const p of (j.pages?.contents ?? [])) {
                    yield { parent: j, doc: p, parentDocType: 'JournalEntry', parentDocId: j.id };
                }
            }
            return;
        }
        case 'PlaylistSound': {
            for (const pl of (game.playlists?.contents ?? [])) {
                for (const s of (pl.sounds?.contents ?? [])) {
                    yield { parent: pl, doc: s, parentDocType: 'Playlist', parentDocId: pl.id };
                }
            }
            return;
        }
        default:
            return;
    }
}

function isEmbeddedDocType(docType: CrossDocFkDocTypeType): boolean {
    return ['Token', 'Note', 'RegionBehavior', 'TableResult', 'JournalEntryPage', 'PlaylistSound'].includes(docType);
}

// ============================================================================
// Catalog walker
// ============================================================================

interface WalkOpts {
    includeCompendiums: boolean;
    /** When set, only return orphans pointing AT this target doc (inbound scan). */
    targetDocType?: CrossDocFkDocTypeType;
    targetDocId?: string;
    /**
     * When true, skip the live-existence check via resolveRef. Used by cascade
     * pre-steps (walkInboundFor) where the target doc is still alive but ABOUT
     * to be deleted — every catalog match is treated as an about-to-be orphan.
     * BUG-106 fix: without this, cascade pre-step always returns [] because the
     * target is still resolvable.
     */
    skipResolution?: boolean;
    /** When set, only audit this source doc (single-doc outbound scan). */
    onlySourceDocType?: CrossDocFkDocTypeType;
    onlySourceDocId?: string;
}

/**
 * Walks FK_CATALOG entries, yielding one FkOrphanEntry per stale reference.
 * Skips entries with `autoNullOnDelete: true` (Foundry handles those).
 */
async function walkCatalogForOrphans(opts: WalkOpts): Promise<FkOrphanEntry[]> {
    const orphans: FkOrphanEntry[] = [];

    for (const entry of FK_CATALOG) {
        if (entry.autoNullOnDelete === true) continue;

        const sourceDocType = entry.sourceDoc as CrossDocFkDocTypeType;
        if (opts.onlySourceDocType && opts.onlySourceDocType !== sourceDocType) continue;

        // RegionBehavior field selectors are type-discriminated (executeMacro vs teleportToken).
        // Walker reads `_source.system.<key>` only when `behavior.type` matches.
        const behaviorTypeFilter =
            sourceDocType === 'RegionBehavior' && entry.sourceField === 'system.uuid' ? 'executeMacro' :
            sourceDocType === 'RegionBehavior' && entry.sourceField === 'system.destination' ? 'teleportToken' :
            null;

        const sources: Array<{ doc: any; docId: string; docName: string | null }> = [];

        if (isEmbeddedDocType(sourceDocType)) {
            for (const ref of iterateEmbedded(sourceDocType)) {
                if (opts.onlySourceDocId && ref.doc.id !== opts.onlySourceDocId) continue;
                if (behaviorTypeFilter && ref.doc?.type !== behaviorTypeFilter) continue;
                sources.push({ doc: ref.doc, docId: ref.doc.id, docName: ref.doc.name ?? null });
            }
        } else {
            const collection = getDocCollection(sourceDocType);
            if (!collection) continue;
            const docs = opts.onlySourceDocId
                ? (collection.get(opts.onlySourceDocId) ? [collection.get(opts.onlySourceDocId)] : [])
                : collection.contents;
            for (const doc of docs) {
                sources.push({ doc, docId: doc.id, docName: doc.name ?? null });
            }
        }

        for (const src of sources) {
            // ObjectField (User.hotbar) special case
            if (entry.isObjectField) {
                const hotbar = (getSourceDeep(src.doc, entry.sourceField) as Record<string, string>) ?? {};
                for (const [slot, macroId] of Object.entries(hotbar)) {
                    if (!macroId) continue;
                    if (opts.targetDocType && opts.targetDocId) {
                        if (entry.refDoc !== opts.targetDocType || macroId !== opts.targetDocId) continue;
                    }
                    const verdict = opts.skipResolution
                        ? false  // BUG-106: cascade pre-step treats target-scoped matches as orphans
                        : await resolveRef(entry.refDoc as CrossDocFkDocTypeType, macroId, entry, opts.includeCompendiums);
                    if (verdict === false) {
                        orphans.push({
                            sourceDocType,
                            sourceDocId: src.docId,
                            sourceDocName: src.docName,
                            sourceField: `${entry.sourceField}.${slot}`,
                            refDocType: entry.refDoc as CrossDocFkDocTypeType,
                            refId: macroId,
                            isHotbarSlot: true,
                        });
                    }
                }
                continue;
            }

            // Scalar FK (ForeignDocumentField / DocumentUUIDField)
            const value = getSourceDeep(src.doc, entry.sourceField);
            if (!value || typeof value !== 'string') continue;

            if (opts.targetDocType && opts.targetDocId) {
                if (entry.refDoc !== opts.targetDocType && entry.refDoc !== 'Document') continue;
                if (value !== opts.targetDocId && !value.endsWith(`.${opts.targetDocId}`)) continue;
            }

            const verdict = opts.skipResolution
                ? false  // BUG-106: cascade pre-step treats target-scoped matches as orphans
                : await resolveRef(entry.refDoc as CrossDocFkDocTypeType, value, entry, opts.includeCompendiums);
            if (verdict === 'skip') continue;
            if (verdict === false) {
                orphans.push({
                    sourceDocType,
                    sourceDocId: src.docId,
                    sourceDocName: src.docName,
                    sourceField: entry.sourceField,
                    refDocType: entry.refDoc as CrossDocFkDocTypeType,
                    refId: value,
                    isCompendiumRef: typeof value === 'string' && value.startsWith('Compendium.'),
                });
            }
        }
    }

    return orphans;
}

// ============================================================================
// Clear helpers
// ============================================================================

/**
 * Clear one orphan FK. Routes by source doc type + field shape:
 *   - User.hotbar.<slot> → user.assignHotbarMacro(null, slot)  [BUG-103]
 *   - Embedded doc field → parent.update with embedded path
 *   - World doc field    → doc.update({ field: null })
 */
async function clearOrphan(ref: FkOrphanRefType): Promise<void> {
    const sourceDocType = ref.sourceDocType;

    // User.hotbar.<slot> special case
    if (sourceDocType === 'User' && ref.sourceField.startsWith('hotbar.')) {
        const user = (game.users as any)?.get(ref.sourceDocId);
        if (!user) throw new Error(`USER_NOT_FOUND: ${ref.sourceDocId}`);
        const slotStr = ref.sourceField.slice('hotbar.'.length);
        const slot = Number(slotStr);
        if (!Number.isFinite(slot)) throw new Error(`INVALID_HOTBAR_SLOT: ${slotStr}`);
        await user.assignHotbarMacro(null, slot);
        return;
    }

    // Embedded doc — resolve embedded doc; update via its own .update (Foundry routes through parent)
    if (isEmbeddedDocType(sourceDocType)) {
        for (const er of iterateEmbedded(sourceDocType)) {
            if (er.doc.id === ref.sourceDocId) {
                await er.doc.update({ [ref.sourceField]: null });
                return;
            }
        }
        throw new Error(`EMBEDDED_DOC_NOT_FOUND: ${sourceDocType} ${ref.sourceDocId}`);
    }

    // World doc
    const collection = getDocCollection(sourceDocType);
    const doc = collection?.get(ref.sourceDocId);
    if (!doc) throw new Error(`SOURCE_DOC_NOT_FOUND: ${sourceDocType} ${ref.sourceDocId}`);
    await doc.update({ [ref.sourceField]: null });
}

/**
 * Post-verify: read _source again and confirm the field is now null/cleared.
 * DP-16 compliance.
 */
function verifyCleared(ref: FkOrphanRefType): boolean {
    const sourceDocType = ref.sourceDocType;

    if (sourceDocType === 'User' && ref.sourceField.startsWith('hotbar.')) {
        const user = (game.users as any)?.get(ref.sourceDocId);
        if (!user) return false;
        const slot = ref.sourceField.slice('hotbar.'.length);
        // Read user._source.hotbar (raw persisted; matches BUG-103 verify pattern in user.ts).
        const hotbar = (user._source.hotbar as Record<string, string>) ?? {};
        return !Object.prototype.hasOwnProperty.call(hotbar, slot);
    }

    if (isEmbeddedDocType(sourceDocType)) {
        for (const er of iterateEmbedded(sourceDocType)) {
            if (er.doc.id === ref.sourceDocId) {
                const v = getSourceDeep(er.doc, ref.sourceField);
                return v == null || v === '';
            }
        }
        return false;
    }

    const collection = getDocCollection(sourceDocType);
    const doc = collection?.get(ref.sourceDocId);
    if (!doc) return false;
    const v = getSourceDeep(doc, ref.sourceField);
    return v == null || v === '';
}

// ============================================================================
// Action handlers
// ============================================================================

export async function auditOrphans(input: AuditOrphansInputType): Promise<AuditOrphansResponse> {
    const orphans = await walkCatalogForOrphans({ includeCompendiums: input.includeCompendiums });
    const totalOrphans = orphans.length;
    const pageSize = input.pageSize;
    const page = input.page;
    const pageCount = Math.max(1, Math.ceil(totalOrphans / pageSize));
    const start = (page - 1) * pageSize;
    const slice = orphans.slice(start, start + pageSize);

    return {
        orphanCount: slice.length,
        page,
        pageSize,
        pageCount,
        totalOrphans,
        includeCompendiums: input.includeCompendiums,
        orphans: slice,
    };
}

export async function auditDocument(input: AuditDocumentInputType): Promise<AuditDocumentResponse> {
    const docType = input.documentType;
    const docId = input.documentId;

    // Resolve the doc for name; embedded docs need parent traversal
    let docName: string | null = null;
    if (isEmbeddedDocType(docType)) {
        for (const er of iterateEmbedded(docType)) {
            if (er.doc.id === docId) { docName = er.doc.name ?? null; break; }
        }
    } else {
        const c = getDocCollection(docType);
        docName = c?.get(docId)?.name ?? null;
    }

    // Outbound: orphans owned by this doc (this doc's FK fields are stale)
    const outbound = await walkCatalogForOrphans({
        includeCompendiums: true,
        onlySourceDocType: docType,
        onlySourceDocId: docId,
    });

    // Inbound: orphans pointing AT this doc (other docs' FK fields target this doc, but this doc still exists)
    // Inbound by definition means "if I deleted this doc, these refs would become orphans." So we walk catalog
    // for entries where refDoc === docType and value === docId, regardless of resolveRef status.
    const inbound: FkOrphanEntry[] = [];
    for (const entry of FK_CATALOG) {
        if (entry.refDoc !== docType && entry.refDoc !== 'Document') continue;
        const sourceDocType = entry.sourceDoc as CrossDocFkDocTypeType;
        const sources: Array<{ doc: any; docId: string; docName: string | null }> = [];
        if (isEmbeddedDocType(sourceDocType)) {
            for (const r of iterateEmbedded(sourceDocType)) {
                sources.push({ doc: r.doc, docId: r.doc.id, docName: r.doc.name ?? null });
            }
        } else {
            const c = getDocCollection(sourceDocType);
            if (c) for (const d of c.contents) sources.push({ doc: d, docId: d.id, docName: d.name ?? null });
        }

        for (const src of sources) {
            if (entry.isObjectField) {
                const hotbar = (getSourceDeep(src.doc, entry.sourceField) as Record<string, string>) ?? {};
                for (const [slot, macroId] of Object.entries(hotbar)) {
                    if (macroId === docId) {
                        inbound.push({
                            sourceDocType,
                            sourceDocId: src.docId,
                            sourceDocName: src.docName,
                            sourceField: `${entry.sourceField}.${slot}`,
                            refDocType: docType,
                            refId: macroId,
                            isHotbarSlot: true,
                        });
                    }
                }
                continue;
            }
            const v = getSourceDeep(src.doc, entry.sourceField);
            if (typeof v !== 'string') continue;
            if (v === docId || v.endsWith(`.${docId}`)) {
                inbound.push({
                    sourceDocType,
                    sourceDocId: src.docId,
                    sourceDocName: src.docName,
                    sourceField: entry.sourceField,
                    refDocType: docType,
                    refId: v,
                });
            }
        }
    }

    return {
        documentType: docType,
        documentId: docId,
        documentName: docName,
        outbound,
        inbound,
        outboundCount: outbound.length,
        inboundCount: inbound.length,
    };
}

export async function repairOrphans(input: RepairOrphansInputType): Promise<RepairOrphansResponse> {
    const denied = ensureGM('cross-doc-fk.repairOrphans');
    if (denied) throw new Error(denied);

    if (input.dryRun) {
        const results: FkRepairResultEntry[] = input.orphans.map((o) => ({
            sourceDocType: o.sourceDocType,
            sourceDocId: o.sourceDocId,
            sourceField: o.sourceField,
            refDocType: o.refDocType,
            refId: o.refId,
            status: 'would-clear' as const,
        }));
        return {
            dryRun: true,
            requestedCount: input.orphans.length,
            clearedCount: 0,
            skippedCount: 0,
            results,
        };
    }

    return wrappedWrite('cross-doc-fk.repairOrphans', async () => {
        const results: FkRepairResultEntry[] = [];
        let cleared = 0;
        let skipped = 0;

        for (const ref of input.orphans) {
            try {
                await clearOrphan(ref);
                const verified = verifyCleared(ref);
                if (verified) {
                    cleared += 1;
                    results.push({
                        sourceDocType: ref.sourceDocType,
                        sourceDocId: ref.sourceDocId,
                        sourceField: ref.sourceField,
                        refDocType: ref.refDocType,
                        refId: ref.refId,
                        status: 'cleared',
                    });
                } else {
                    skipped += 1;
                    results.push({
                        sourceDocType: ref.sourceDocType,
                        sourceDocId: ref.sourceDocId,
                        sourceField: ref.sourceField,
                        refDocType: ref.refDocType,
                        refId: ref.refId,
                        status: 'skipped',
                        skipReason: 'POST_VERIFY_FAILED: field still set after update',
                    });
                }
            } catch (err) {
                skipped += 1;
                const msg = err instanceof Error ? err.message : String(err);
                results.push({
                    sourceDocType: ref.sourceDocType,
                    sourceDocId: ref.sourceDocId,
                    sourceField: ref.sourceField,
                    refDocType: ref.refDocType,
                    refId: ref.refId,
                    status: 'skipped',
                    skipReason: msg,
                });
            }
        }

        // Single batched notify per repair op (NOT per slot)
        if (cleared > 0) {
            notify.updated('cross-doc-fk', `${cleared} FK${cleared === 1 ? '' : 's'} cleared`, {
                summary: skipped > 0 ? `${skipped} skipped` : undefined,
            });
        }

        return {
            dryRun: false,
            requestedCount: input.orphans.length,
            clearedCount: cleared,
            skippedCount: skipped,
            results,
        };
    });
}

// ============================================================================
// Dispatcher (umbrella switch)
// ============================================================================

export async function dispatchCrossDocFk(data: unknown): Promise<any> {
    let input: CrossDocFkInputType;
    try {
        input = CrossDocFkInput.parse(data ?? {}) as CrossDocFkInputType;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid input';
        throw new Error(`Invalid input: ${message}`);
    }

    switch (input.action) {
        case 'audit-orphans':
            return { success: true, data: await auditOrphans(input) };
        case 'audit-document':
            return { success: true, data: await auditDocument(input) };
        case 'repair-orphans':
            return { success: true, data: await repairOrphans(input) };
        default:
            throw new Error(`Unknown cross-doc-fk action: ${(input as CrossDocFkInputType).action}`);
    }
}

// ============================================================================
// Public helpers (used by Phase 4 cascade integration in scene/journal/rolltable/playlist handlers)
// ============================================================================

/**
 * Find inbound orphans for a doc that is ABOUT to be deleted. Used by Phase 4
 * cascade-on-delete pre-steps. Returns FkOrphanEntry[] where refId matches the
 * target doc id (no live-existence check — these are about-to-be orphans).
 */
export async function walkInboundFor(
    targetDocType: CrossDocFkDocTypeType,
    targetDocId: string,
): Promise<FkOrphanEntry[]> {
    return walkCatalogForOrphans({
        includeCompendiums: false,
        targetDocType,
        targetDocId,
        skipResolution: true,  // BUG-106: target is alive (pre-delete); cascade-mode bypasses live check
    });
}

/**
 * Clear a single orphan (exported for Phase 4 cascade pre-steps). Caller is
 * responsible for wrapping in wrappedWrite + post-verify.
 */
export async function clearOrphanRef(ref: FkOrphanRefType): Promise<void> {
    await clearOrphan(ref);
}
