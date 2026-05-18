/**
 * Cross-doc Foreign-Key catalog.
 *
 * Phase 11 seeded 2 User entries; Phase 10 extends with ~20 cross-doc FK
 * relationships covering all 9 writable doc types Phase 1-11 ship. The catalog
 * is the source of truth for both the `cross-doc-fk` audit walker (foundry-
 * module side) and the `_fk-graph.md` extractor (warhammer_mcp/ tier doc).
 *
 * Field-type encoding (walker reads `doc.schema.fields[entry.sourceField].constructor.name`
 * at runtime; catalog flags are descriptive):
 *   - `isObjectField: true`              → ObjectField (User.hotbar special — keyed object of FKs)
 *   - `isForeignDocumentField: true`     → ForeignDocumentField (bare 16-char world id; resolves via game.<collection>.get)
 *   - (neither flag set)                 → DocumentUUIDField (5-segment UUID string; resolves via fromUuid)
 *
 * `autoNullOnDelete: true` means Foundry auto-clears the FK on referent delete
 * — walker SKIPS entries marked true. Per Phase 4 Probe D foundational fact
 * (2026-05-14): ForeignDocumentField does NOT auto-null. The default for all
 * Phase 10 entries is `autoNullOnDelete: false` (audit walker checks them).
 *
 * Phase 0 probe ratification (2026-05-18, see phase10_probes.md):
 *   - PROBE-G surfaced DRIFT in Phase 11 User.character seed (was
 *     `autoNullOnDelete: true`; corrected to `false`). BaseUser.defineSchema
 *     shows a vanilla ForeignDocumentField — no auto-null hook.
 *   - PROBE-A confirmed Token._regions EXCLUDED (internal `_` prefix; Foundry-
 *     managed by region containment).
 *   - PROBE-E confirmed JournalEntryPage.category EXCLUDED (intra-entry embed
 *     scope; existing deleteCategory cascade per BUG-072 handles it).
 */

export interface FKCatalogEntry {
    sourceDoc: string;
    sourceField: string;
    refDoc: string;
    isObjectField?: boolean;
    isForeignDocumentField?: boolean;
    autoNullOnDelete?: boolean;
}

export const FK_CATALOG: readonly FKCatalogEntry[] = [
    // --- User (seeded Phase 11; User.character autoNull DRIFT corrected 2026-05-18 per PROBE-G) ---
    { sourceDoc: 'User', sourceField: 'hotbar', refDoc: 'Macro', isObjectField: true },
    { sourceDoc: 'User', sourceField: 'character', refDoc: 'Actor', isForeignDocumentField: true, autoNullOnDelete: false },

    // --- Scene → world docs (5 FKs; all ForeignDocumentField) ---
    { sourceDoc: 'Scene', sourceField: 'folder', refDoc: 'Folder', isForeignDocumentField: true, autoNullOnDelete: false },
    { sourceDoc: 'Scene', sourceField: 'journal', refDoc: 'JournalEntry', isForeignDocumentField: true, autoNullOnDelete: false },
    { sourceDoc: 'Scene', sourceField: 'journalEntryPage', refDoc: 'JournalEntryPage', isForeignDocumentField: true, autoNullOnDelete: false },
    { sourceDoc: 'Scene', sourceField: 'playlist', refDoc: 'Playlist', isForeignDocumentField: true, autoNullOnDelete: false },
    { sourceDoc: 'Scene', sourceField: 'playlistSound', refDoc: 'PlaylistSound', isForeignDocumentField: true, autoNullOnDelete: false },

    // --- Token (embedded in Scene) → Actor (1 FK; ForeignDocumentField) ---
    { sourceDoc: 'Token', sourceField: 'actorId', refDoc: 'Actor', isForeignDocumentField: true, autoNullOnDelete: false },

    // --- Note (embedded in Scene) → journal docs (2 FKs; both ForeignDocumentField) ---
    { sourceDoc: 'Note', sourceField: 'entryId', refDoc: 'JournalEntry', isForeignDocumentField: true, autoNullOnDelete: false },
    { sourceDoc: 'Note', sourceField: 'pageId', refDoc: 'JournalEntryPage', isForeignDocumentField: true, autoNullOnDelete: false },

    // --- RegionBehavior (embedded in Region embedded in Scene) → behavior-typed FKs (2 FKs; both DocumentUUIDField, walker filters by behavior.type) ---
    // Walker MUST filter by `behavior.type === 'executeMacro'` / `'teleportToken'` before reading these fields.
    { sourceDoc: 'RegionBehavior', sourceField: 'system.uuid', refDoc: 'Macro', autoNullOnDelete: false },
    { sourceDoc: 'RegionBehavior', sourceField: 'system.destination', refDoc: 'Scene', autoNullOnDelete: false },

    // --- TableResult (embedded in RollTable) → polymorphic doc (1 FK; DocumentUUIDField) ---
    // Walker MUST filter by `result.type === 'document'` (`'text'` type has no FK).
    // refDoc 'Document' = polymorphic (any world or compendium doc); walker uses fromUuid for resolution.
    { sourceDoc: 'TableResult', sourceField: 'documentUuid', refDoc: 'Document', autoNullOnDelete: false },

    // --- Folder self-reference (1 FK; ForeignDocumentField) ---
    // Walker handles self-referential resolution; no infinite-loop risk because parent !== self at v13 schema level.
    { sourceDoc: 'Folder', sourceField: 'folder', refDoc: 'Folder', isForeignDocumentField: true, autoNullOnDelete: false },

    // --- Per-doctype `.folder` FKs (7 FKs; all ForeignDocumentField) ---
    // Every world doc type that supports folder organization stores its parent folder id here.
    { sourceDoc: 'Actor', sourceField: 'folder', refDoc: 'Folder', isForeignDocumentField: true, autoNullOnDelete: false },
    { sourceDoc: 'Item', sourceField: 'folder', refDoc: 'Folder', isForeignDocumentField: true, autoNullOnDelete: false },
    { sourceDoc: 'JournalEntry', sourceField: 'folder', refDoc: 'Folder', isForeignDocumentField: true, autoNullOnDelete: false },
    { sourceDoc: 'Macro', sourceField: 'folder', refDoc: 'Folder', isForeignDocumentField: true, autoNullOnDelete: false },
    { sourceDoc: 'Playlist', sourceField: 'folder', refDoc: 'Folder', isForeignDocumentField: true, autoNullOnDelete: false },
    { sourceDoc: 'RollTable', sourceField: 'folder', refDoc: 'Folder', isForeignDocumentField: true, autoNullOnDelete: false },
    { sourceDoc: 'Cards', sourceField: 'folder', refDoc: 'Folder', isForeignDocumentField: true, autoNullOnDelete: false },
    { sourceDoc: 'Adventure', sourceField: 'folder', refDoc: 'Folder', isForeignDocumentField: true, autoNullOnDelete: false },
] as const;
