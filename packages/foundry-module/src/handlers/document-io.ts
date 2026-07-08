// Phase 8 mcp_coverage_expansion — `document-io` handler.
//
// Three actions over 8 world document types (Actor/Item/JournalEntry/Macro/
// Scene/Playlist/RollTable/Cards):
//   export        → doc.toObject() JSON (read-only, no notify).
//   import-as-new → strip _id/folder/sort/ownership per flags →
//                   DocClass.create(data) → CCR-2a re-read via verifyDocWrite →
//                   {newId, oldId, idMap, warnings[]} → notify.created.
//   preview       → new DocClass(data) in-memory (NO write, NO confirm) →
//                   {name, embeddedCounts, hasFolder, hasOwnership, uuidLinkCount, warnings[]}
//
// Clone/template semantics — NOT backup/restore. Foundry regenerates top-level
// AND embedded ids by default (keepId/keepEmbeddedIds both falsy). idMap is
// top-level only (PRD R8.2); v2 will surface embedded id remap.
//
// R8.5 (WFRP _preCreate safety): a full-payload Actor import is automatically
// safe — the _preCreate auto-populate guard is `!data.items?.length`, so a
// non-empty items[] skips auto-populate. NO skipItems flag needed.
//
// HC1 / CCR-3: no CONFIG.WFRP4E or game-rule references.

import {
  ErrorTokens,
  DocumentIoToolInput,
  DocumentIoExportInput,
  DocumentIoImportInput,
  DocumentIoPreviewInput,
  type DocumentIoExportResult,
  type DocumentIoImportResult,
  type DocumentIoPreviewResult,
  type DocumentTypeType,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { notify } from '../notify.js';
import { verifyDocWrite } from '../utils/verifyWrite.js';
// BUG-490 (Wave 2): handler-side export size bound (whole-doc surface — no pagination).
import { DEFAULT_RESPONSE_BUDGET_CHARS } from '../services/bounded-response.js';
import {
  validateGMAccess,
  type Envelope,
} from '../utils/worldCRUDFactory.js';

// ── Type-to-collection + DocClass lookup ──────────────────────────────────────
//
// Mirrors cross-doc-fk.ts getDocCollection() for the 8 Phase-8-supported
// document types. We do NOT import that private function; this local map covers
// exactly the subset we care about (no Adventure/Folder/User/Token/etc.).

interface DocCollection {
  contents: any[];
  get(id: string): any | undefined;
}

/**
 * Resolve the world collection and document class for a given documentType.
 * Covers the 8 types in the Phase-8 documentType enum.
 * Returns null for any type not in the supported set (should not occur —
 * Zod enum rejects unknown values at the tool boundary).
 */
function resolveDocType(documentType: DocumentTypeType): { collection: DocCollection; DocClass: any } | null {
  const g = game as any;
  switch (documentType) {
    case 'Actor':
      return g.actors ? { collection: g.actors, DocClass: (globalThis as any).Actor } : null;
    case 'Item':
      return g.items ? { collection: g.items, DocClass: (globalThis as any).Item } : null;
    case 'JournalEntry':
      // game.journal (not game.journals) — Agent 3 confirmed.
      return g.journal ? { collection: g.journal, DocClass: (globalThis as any).JournalEntry } : null;
    case 'Macro':
      return g.macros ? { collection: g.macros, DocClass: (globalThis as any).Macro } : null;
    case 'Scene':
      return g.scenes ? { collection: g.scenes, DocClass: (globalThis as any).Scene } : null;
    case 'Playlist':
      return g.playlists ? { collection: g.playlists, DocClass: (globalThis as any).Playlist } : null;
    case 'RollTable':
      // game.tables (not game.rolltables) — Agent 3 confirmed.
      return g.tables ? { collection: g.tables, DocClass: (globalThis as any).RollTable } : null;
    case 'Cards':
      return g.cards ? { collection: g.cards, DocClass: (globalThis as any).Cards } : null;
    default:
      return null;
  }
}

/**
 * Map documentType → a NotifyKind for notify.created.
 * The 8 Phase-8 types map to notify.ts-registered kinds; 'journal' covers
 * JournalEntry, 'rolltable' covers RollTable (both registered in notify.ts).
 */
function docTypeToNotifyKind(documentType: DocumentTypeType): string {
  const MAP: Record<DocumentTypeType, string> = {
    Actor: 'actor',
    Item: 'item',
    JournalEntry: 'journal',
    Macro: 'macro',
    Scene: 'scene',
    Playlist: 'playlist',
    RollTable: 'rolltable',
    Cards: 'cards',
  };
  return MAP[documentType];
}

/**
 * Validate that the payload's discriminating fields align with the declared
 * documentType. A full type-safe check is impossible without loading the Zod
 * system schemas, but the simple structural markers below catch the common
 * mismatch case (e.g. Actor payload sent with documentType:"Item"):
 *
 *   Actor:        data.type ∈ {character, npc, vehicle, creature, …}
 *                 AND data.system exists (standard Foundry actor structure)
 *   Item:         data.type ∈ known item sub-types AND data.system exists
 *   JournalEntry: data.pages exists (array) or data.name exists
 *   Macro:        data.command or data.type ∈ {script, chat}
 *   Scene:        data.width or data.height (large numeric fields)
 *   Playlist:     data.sounds exists (array)
 *   RollTable:    data.results exists (array)
 *   Cards:        data.cards exists (array) or data.type ∈ {deck, hand, pile}
 *
 * Rejects on STRUCTURAL mismatch (e.g. results[] present → clearly a RollTable,
 * not an Actor). Passes on ambiguous payloads (shell docs with few fields).
 */
function validatePayloadMatchesType(documentType: DocumentTypeType, data: Record<string, unknown>): void {
  // Per-type markers: [expected key that should be present, key that must NOT be present
  // if a different type is declared]
  const ANTI_MARKERS: Array<{ type: DocumentTypeType; key: string }> = [
    // If data.sounds[] is present it is a Playlist, not an Actor/Item/etc.
    { type: 'Playlist', key: 'sounds' },
    // If data.results[] is present it is a RollTable.
    { type: 'RollTable', key: 'results' },
    // If data.cards[] is present it is a Cards stack.
    { type: 'Cards', key: 'cards' },
    // If data.pages[] is present it is a JournalEntry.
    { type: 'JournalEntry', key: 'pages' },
  ];

  for (const marker of ANTI_MARKERS) {
    if (documentType !== marker.type && Array.isArray(data[marker.key])) {
      throw new Error(
        `DOCUMENT_IO_TYPE_MISMATCH: documentType "${documentType}" but payload contains "${marker.key}[]" which is a structural marker of a ${marker.type} document. Re-export the source document and pass the matching documentType.`,
      );
    }
  }

  // BUG-367: Actor/Item mutual exclusion. Both carry `system` + `type`, so the anti-markers
  // above can't tell them apart. wfrp4e Actor types are character/npc/creature/vehicle; if the
  // payload declares one of those but documentType is Item (or vice-versa for known Item
  // subtypes), reject at pre-flight with a precise TYPE_MISMATCH instead of failing late at the
  // DB layer with a generic *_WRITE_NOT_PERSISTED. Lists are disjoint, so this never rejects a
  // valid import — an unknown type just falls through and is handled downstream.
  const ACTOR_TYPES = new Set(['character', 'npc', 'creature', 'vehicle']);
  const ITEM_TYPES = new Set([
    'weapon', 'armour', 'ammunition', 'trapping', 'container', 'money', 'cargo',
    'skill', 'career', 'talent', 'trait', 'prayer', 'spell', 'mutation',
    'critical', 'disease', 'psychology', 'injury', 'vehicleMod', 'vehicleRole', 'extendedTest',
  ]);
  if (typeof data.type === 'string') {
    if (documentType === 'Item' && ACTOR_TYPES.has(data.type)) {
      throw new Error(
        `DOCUMENT_IO_TYPE_MISMATCH: documentType "Item" but payload.type="${data.type}" is a WFRP4e Actor type. Re-export with documentType "Actor".`,
      );
    }
    if (documentType === 'Actor' && ITEM_TYPES.has(data.type)) {
      throw new Error(
        `DOCUMENT_IO_TYPE_MISMATCH: documentType "Actor" but payload.type="${data.type}" is a WFRP4e Item subtype. Re-export with documentType "Item".`,
      );
    }
  }

  // Scene anti-marker: if both width and height are numbers and there is no
  // system field, it looks like a Scene — reject if declared as something else.
  if (
    documentType !== 'Scene' &&
    typeof data.width === 'number' &&
    typeof data.height === 'number' &&
    data.system === undefined &&
    typeof data.background === 'object'
  ) {
    throw new Error(
      `DOCUMENT_IO_TYPE_MISMATCH: documentType "${documentType}" but payload contains numeric width/height/background which are structural markers of a Scene document.`,
    );
  }
}

// ── Warning messages ──────────────────────────────────────────────────────────

const WARN_UUID_MAY_BREAK =
  '@UUID links embedded in the document text may reference the old document id and will need manual re-linking. ' +
  'Cross-document UUID remap is deferred to v2 of this tool.';

const WARN_CARDS_ORIGIN_FK =
  'Cards (deck/hand/pile) round-trips are clone-only: embedded Card `origin` fields still reference ' +
  'the SOURCE stack id. Dealing, drawing, or recalling across the two stacks will break. ' +
  'This is a known limitation; cross-stack FK remap is deferred to v2.';

// ── Export ────────────────────────────────────────────────────────────────────

async function handleExport(
  data: unknown,
): Promise<Envelope<DocumentIoExportResult>> {
  const input = DocumentIoExportInput.strict().parse(data ?? {});
  const resolved = resolveDocType(input.documentType);
  if (!resolved) {
    return {
      success: false,
      error: `DOCUMENT_IO_COLLECTION_MISSING: collection for "${input.documentType}" is not available`,
    };
  }
  const doc = resolved.collection.get(input.id);
  if (!doc) {
    return {
      success: false,
      error: `DOCUMENT_IO_NOT_FOUND: ${input.documentType} "${input.id}" not found in world`,
    };
  }

  const exported = (doc as any).toObject() as Record<string, unknown>;

  // BUG-490 (Wave 2): export is whole-document by nature — pagination would corrupt
  // the round-trip payload, so the bound lands as a fail-loud guidance error instead
  // (a live Actor export measured 96.5k chars). The handler-side check mirrors the
  // global choke-point guard but names the document + the preview alternative.
  let serializedLength = 0;
  try {
    serializedLength = JSON.stringify(exported)?.length ?? 0;
  } catch {
    serializedLength = 0;
  }
  if (serializedLength > DEFAULT_RESPONSE_BUDGET_CHARS) {
    return {
      success: false,
      error:
        `RESPONSE_TOO_LARGE: exporting ${input.documentType} "${input.id}" serializes to ${serializedLength} chars ` +
        `(budget ${DEFAULT_RESPONSE_BUDGET_CHARS}). Use action:"preview" for a summary, or export a smaller document.`,
    };
  }

  return {
    success: true,
    data: {
      documentType: input.documentType,
      id: input.id,
      data: exported,
    },
  };
}

// ── Import-as-new ─────────────────────────────────────────────────────────────

async function handleImportAsNew(
  data: unknown,
): Promise<Envelope<DocumentIoImportResult>> {
  const gate = validateGMAccess();
  if (!gate.allowed) {
    return { success: false, error: 'DOCUMENT_IO_FORBIDDEN: import-as-new requires GM' };
  }

  const input = DocumentIoImportInput.strict().parse(data ?? {});

  // Validate payload↔type alignment before writing.
  validatePayloadMatchesType(input.documentType, input.data);

  const resolved = resolveDocType(input.documentType);
  if (!resolved) {
    return {
      success: false,
      error: `DOCUMENT_IO_COLLECTION_MISSING: collection for "${input.documentType}" is not available`,
    };
  }

  return wrappedWrite('document-io.import-as-new', async () => {
    // Build stripped payload — mirrors duplicateActor (data-access.ts:3615-3653)
    // and duplicateStack (cards.ts:308-342) patterns.
    const stripped: Record<string, unknown> = { ...input.data };

    // Capture the old id for idMap (may be absent in shell docs — ok).
    const oldId: string = (stripped._id as string) ?? '';

    // Always strip _id so Foundry regenerates it (keepId defaults false).
    delete stripped._id;

    // Strip sort (mirrors duplicateActor).
    delete stripped.sort;

    // Folder: clear unless caller provided targetFolderId.
    if (input.targetFolderId) {
      stripped.folder = input.targetFolderId;
    } else {
      delete stripped.folder;
    }

    // Ownership: clear unless preserveOwnership=true (mirrors FromCompendiumOptions.clearOwnership).
    if (!input.preserveOwnership) {
      delete stripped.ownership;
    }

    const { DocClass, collection } = resolved;

    const created: any = await DocClass.create(stripped);
    if (!created) {
      throw new Error(`${ErrorTokens.DOCUMENT_IO_WRITE_NOT_PERSISTED}: ${input.documentType}.create returned empty`);
    }

    // CCR-2a: re-read from the live collection.
    const persisted = collection.get(created.id);
    if (!persisted) {
      throw new Error(
        `${ErrorTokens.DOCUMENT_IO_WRITE_NOT_PERSISTED}: created ${input.documentType} "${created.id}" missing from collection after create`,
      );
    }

    // Minimal field verification — prove at least the name persisted.
    if (stripped.name) {
      verifyDocWrite(persisted, { name: stripped.name }, ErrorTokens.DOCUMENT_IO_WRITE_NOT_PERSISTED);
    }

    // Assemble warnings. BUG-516: only warn about @UUID re-linking when the imported payload actually
    // contains @UUID links — the preview action gates this correctly; import used to emit it
    // unconditionally (misleading on a doc with zero UUID content).
    const uuidLinkCount = (JSON.stringify(stripped ?? {}).match(/@UUID\[/g) ?? []).length;
    const warnings: string[] = uuidLinkCount > 0 ? [WARN_UUID_MAY_BREAK] : [];
    if (input.documentType === 'Cards') {
      warnings.push(WARN_CARDS_ORIGIN_FK);
    }

    // Build top-level idMap (old→new).
    const idMap: Record<string, string> = {};
    if (oldId && created.id) {
      idMap[oldId] = created.id as string;
    }

    const notifyKind = docTypeToNotifyKind(input.documentType) as any;
    notify.created(notifyKind, (persisted as any)._source?.name ?? created.id, {
      summary: `imported from document-io (old id: ${oldId || 'unknown'})`,
    });

    return {
      success: true as const,
      data: {
        documentType: input.documentType,
        newId: created.id as string,
        oldId,
        idMap,
        warnings,
      },
    };
  });
}

// ── Preview ───────────────────────────────────────────────────────────────────

async function handlePreview(
  data: unknown,
): Promise<Envelope<DocumentIoPreviewResult>> {
  const input = DocumentIoPreviewInput.strict().parse(data ?? {});

  const resolved = resolveDocType(input.documentType);
  if (!resolved) {
    return {
      success: false,
      error: `DOCUMENT_IO_COLLECTION_MISSING: collection for "${input.documentType}" is not available`,
    };
  }

  const warnings: string[] = [];
  let instance: any;

  try {
    // In-memory construction — NO database write. Foundry DataModel constructor
    // validates the data and populates embedded collections.
    instance = new resolved.DocClass(input.data);
  } catch (err: unknown) {
    return {
      success: false,
      error: `DOCUMENT_IO_PREVIEW_INVALID: in-memory construction failed — ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // Count embedded sub-collections (e.g. items, effects, sounds, cards, pages, results).
  const embeddedCounts: Record<string, number> = {};
  const embeddedNames = (instance.constructor?.metadata?.embedded ?? {}) as Record<string, unknown>;
  for (const collName of Object.keys(embeddedNames)) {
    const coll = (instance as any)[collName.toLowerCase()];
    if (coll && typeof coll.size === 'number') {
      embeddedCounts[collName.toLowerCase()] = coll.size;
    }
  }

  // BUG-368: raw-data counts are authoritative for preview. In-memory construction
  // (new DocClass(data) without full game context) does NOT populate EmbeddedCollections
  // from a plain-object payload — `.size` stays 0 — so the metadata-driven loop above can
  // report items:0 for an Actor whose payload carries a full items[] array. Always overwrite
  // with the raw array length so the preview-before-import guard reports the real content.
  const EMBEDDED_KEYS = ['items', 'effects', 'sounds', 'cards', 'pages', 'results'];
  for (const key of EMBEDDED_KEYS) {
    if (Array.isArray(input.data[key])) {
      embeddedCounts[key] = (input.data[key] as unknown[]).length;
    }
  }

  const dataStr = JSON.stringify(input.data);
  const uuidLinkCount = (dataStr.match(/@UUID\[/g) ?? []).length;

  // hasFolder: source data has a non-null/non-empty folder field.
  const hasFolder = typeof input.data.folder === 'string' && input.data.folder.length > 0;

  // hasOwnership: source data has an ownership record with at least one non-default entry.
  const ownershipData = input.data.ownership as Record<string, unknown> | undefined;
  const hasOwnership =
    ownershipData != null &&
    typeof ownershipData === 'object' &&
    Object.keys(ownershipData).some((k) => k !== 'default');

  const name: string = (instance._source?.name as string) ?? (input.data.name as string) ?? '';

  if (uuidLinkCount > 0) {
    warnings.push(
      `Document contains ${uuidLinkCount} @UUID link(s). These reference the OLD document ids and will need manual re-linking after import-as-new.`,
    );
  }

  return {
    success: true,
    data: {
      documentType: input.documentType,
      name,
      embeddedCounts,
      hasFolder,
      hasOwnership,
      uuidLinkCount,
      warnings,
    },
  };
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

export async function dispatchDocumentIo(data: unknown): Promise<Envelope<any>> {
  // Parse the discriminator only to route; each branch re-parses fully.
  const parsed = DocumentIoToolInput.parse(data ?? {});

  switch (parsed.action) {
    case 'export':
      return handleExport(data);
    case 'import-as-new':
      return handleImportAsNew(data);
    case 'preview':
      return handlePreview(data);
    default: {
      const _exhaustive: never = parsed;
      return { success: false, error: `DOCUMENT_IO_UNKNOWN_ACTION: ${(_exhaustive as any).action}` };
    }
  }
}
