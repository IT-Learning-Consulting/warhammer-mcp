// Phase 9 mcp_crud_expansion — Compendium pack + document CRU (NO pack/document
// DELETE per HC3) + in-pack folder management (2026-06-11).
//
// Architecture (per pre-plan §Design Decisions D1 — hand-rolled umbrella):
//   - 10 handlers: 6 pack/document CRU (create-pack / update-pack / read-pack /
//                 add-document-to-pack / update-document-in-pack /
//                 read-document-from-pack) + 4 in-pack folder
//                 (create/list/update/delete-folder-in-pack), all bespoke.
//   - delete-folder-in-pack is HC3-compliant: a folder is organizational
//     metadata, NOT a pack (LevelDB dir) or document (content). deleteContents
//     defaults false (un-parent docs to root). CCR-Delete-Safety confirm required.
//   - In-pack folders use pack.folders (CompendiumFolderCollection); depth cap is
//     CONST.FOLDER_MAX_DEPTH-1 (=3). Folder#getSubfolders/#ancestors resolve
//     against game.folders (broken for pack folders) — we walk pack.folders.
//   - `flatWorldCRUDFactory` does NOT fit compendium API surface
//     (game.packs is Map, not WorldCollection; pack creation is
//     CompendiumCollection.createCompendium static; HC3 forbids delete
//     but factory always emits one).
//   - Probe findings (phase9_probes.md, 2026-05-18) drive concrete shapes:
//       - PC1: scope==='module' SILENTLY DOWNGRADES — pre-emptively refuse.
//       - PC2: `foundry.documents.collections.CompendiumCollection` is the
//              v13-canonical path (bare global deprecated since v13,
//              removed v15).
//       - PC3: `pack.configure(changes)` is the metadata-write API;
//              `pack.update` does not exist on pack instances.
//       - PR2: `pack.importDocument` preserves source ID — handler must
//              pre-check collision via `pack.index.has(source.id)`.
//       - PR3 / PR4: lock error is plain `Error` (no typed sentinel) and
//              ordering varies between write paths — handler MUST
//              pre-check `pack.locked` itself for uniform UX.
//
// Trust gates:
//   - `validateGMAccess()` at top of every mutating handler (CCR-Trust).
//   - Reads (read-pack, read-document-from-pack) are GM-gated as well
//     to match the other umbrella surfaces.
//
// HC3 enforcement:
//   - Zero `delete-pack` / `delete-document-from-pack` literal strings in
//     this file. The Zod discriminatedUnion in shared schemas omits the
//     variants entirely, so a bad caller produces a parse error before
//     reaching this file.

import {
  CompendiumToolInput,
  type CompendiumToolInputType,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { notify } from '../notify.js';
import { validateGMAccess, type Envelope } from '../utils/flatWorldCRUDFactory.js';

// ── Error tag helper ──────────────────────────────────────────────────────

const COMPENDIUM_DENY = (op: string) => `Access denied: ${op} requires GM`;

// ── View-model types (response shapes) ────────────────────────────────────

interface PackMetadataView {
  id: string;
  name: string;
  label: string;
  type: string;
  system: string | null;
  packageType: string;
  packageName: string;
  path: string | null;
  locked: boolean;
  folder: string | null;
  sort: number;
}

interface CreatePackResponse {
  packId: string;
  metadata: PackMetadataView;
  entryCount: number;
  ownership: Record<string, string>;
}

interface UpdatePackResponse {
  packId: string;
  changedFields: string[];
  metadata: PackMetadataView;
}

interface PackEntrySummary {
  id: string;
  name: string;
  type: string;
  img: string | null;
  uuid: string;
  folder: string | null;
}

// In-pack folder (an entry of pack.folders / CompendiumFolderCollection).
interface PackFolderSummary {
  id: string;
  name: string;
  color: string | null;
  sort: number;
  folder: string | null; // parent in-pack folder id
  depth: number;         // 1 = root-level, manually computed (not Folder#depth)
}

interface ReadPackResponse {
  packId: string;
  metadata: PackMetadataView;
  totalEntries: number;
  page: number;
  pageSize: number;
  pageCount: number;
  entries: PackEntrySummary[];
  folders: PackFolderSummary[];
}

interface CreateFolderInPackResponse {
  packId: string;
  folderId: string;
  name: string;
  uuid: string;
  depth: number;
}

interface ListFoldersInPackResponse {
  packId: string;
  folders: PackFolderSummary[];
}

interface UpdateFolderInPackResponse {
  packId: string;
  folderId: string;
  changedFields: string[];
}

interface DeleteFolderInPackResponse {
  packId: string;
  folderId: string;
  deletedFolderIds: string[]; // root + descendants removed
  unParentedDocs: number;     // docs moved to root (deleteContents=false)
  deletedDocs: number;        // docs deleted (deleteContents=true)
}

interface AddDocumentResponse {
  packId: string;
  documentId: string;
  documentUuid: string;
  name: string;
  type: string;
  entryCount: number;
  warnings: string[];
}

interface UpdateDocumentResponse {
  packId: string;
  documentId: string;
  documentUuid: string;
  changedFields: string[];
}

interface ReadDocumentResponse {
  packId: string;
  documentId: string;
  documentUuid: string;
  data: Record<string, unknown>;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function getCompendiumCollectionClass(): any {
  // PC2: prefer the v13-namespaced path; fall back to the deprecated global
  // only so unit tests / older runtimes don't crash. Real Foundry v13 hosts
  // both; v15 will drop the global.
  const f: any = (globalThis as any).foundry;
  return f?.documents?.collections?.CompendiumCollection
      ?? (globalThis as any).CompendiumCollection;
}

function getPackOrThrow(packId: string): any {
  const pack = (game as any).packs?.get(packId);
  if (!pack) {
    throw new Error(`COMPENDIUM_PACK_NOT_FOUND: no pack with id "${packId}"`);
  }
  return pack;
}

function serializePackMetadata(pack: any): PackMetadataView {
  const m = pack?.metadata ?? {};
  return {
    id: String(m.id ?? pack?.collection ?? ''),
    name: String(m.name ?? ''),
    label: String(m.label ?? ''),
    type: String(m.type ?? ''),
    system: m.system != null ? String(m.system) : null,
    packageType: String(m.packageType ?? ''),
    packageName: String(m.packageName ?? ''),
    path: m.path != null ? String(m.path) : null,
    locked: Boolean(pack?.locked ?? false),
    folder: (pack?.folder?.id ?? pack?.folder ?? null) as string | null,
    sort: Number(pack?.sort ?? 0),
  };
}

function serializePackEntry(entry: any, packId: string): PackEntrySummary {
  return {
    id: String(entry.id ?? entry._id ?? ''),
    name: String(entry.name ?? ''),
    type: String(entry.type ?? ''),
    img: (entry.img as string | undefined) ?? null,
    // 5-segment v13 UUID: Compendium.<packageType>.<packageName>.<DocType>.<docId>
    // packId is already "<packageType>.<packageName>"; build the canonical form.
    uuid: `Compendium.${packId}.${String(entry.type ?? '')}.${String(entry.id ?? entry._id ?? '')}`,
    // Foundry stores the in-pack folder id on each index entry (null = pack root).
    folder: (entry.folder as string | undefined) ?? null,
  };
}

// ── In-pack folder helpers ─────────────────────────────────────────────────
//
// CRITICAL: Folder#getSubfolders() and Folder#ancestors resolve against
// game.folders, NOT pack.folders — so they return wrong results for pack-resident
// folders (research §4 fact 5). We walk pack.folders manually instead.

function getFolderClass(): any {
  const f: any = (globalThis as any).foundry;
  const cls = f?.documents?.Folder ?? (globalThis as any).Folder;
  return cls?.implementation ?? cls;
}

// Pack folder cap is CONST.FOLDER_MAX_DEPTH - 1 (=3), one less than world folders.
function packFolderMaxDepth(): number {
  return ((globalThis as any).CONST?.FOLDER_MAX_DEPTH ?? 4) - 1;
}

function parentOf(folder: any): string | null {
  return (folder?._source?.folder ?? folder?.folder?.id ?? folder?.folder ?? null) as string | null;
}

// Depth = count of folders in the chain from this folder up to root (inclusive).
// Root-level folder → 1. Manual walk over pack.folders (getSubfolders/ancestors broken).
function packFolderDepth(pack: any, folderId: string | null | undefined): number {
  let depth = 0;
  let current = folderId ? pack.folders?.get?.(String(folderId)) : null;
  const seen = new Set<string>();
  while (current) {
    if (seen.has(current.id)) break; // cycle guard
    seen.add(current.id);
    depth += 1;
    const pid = parentOf(current);
    current = pid ? pack.folders?.get?.(String(pid)) : null;
  }
  return depth;
}

// Descendant folders of rootId (NOT including root), deepest-first.
function collectPackSubfolders(pack: any, rootId: string): any[] {
  const all = (pack.folders?.contents ?? []) as any[];
  const result: any[] = [];
  const seen = new Set<string>();
  const walk = (pid: string) => {
    for (const child of all.filter((f) => parentOf(f) === pid)) {
      if (seen.has(child.id)) continue; // cycle guard
      seen.add(child.id);
      walk(child.id);       // descend first
      result.push(child);   // push after children → deepest-first
    }
  };
  walk(rootId);
  return result;
}

function serializePackFolder(pack: any, folder: any): PackFolderSummary {
  const src = folder?._source ?? folder ?? {};
  return {
    id: String(folder?.id ?? src.id ?? ''),
    name: String(src.name ?? folder?.name ?? ''),
    color: (src.color as string | undefined) ?? null,
    sort: Number(src.sort ?? folder?.sort ?? 0),
    folder: parentOf(folder),
    depth: packFolderDepth(pack, String(folder?.id ?? src.id ?? '')),
  };
}

// ── Handlers ──────────────────────────────────────────────────────────────

async function createCompendiumPack(input: any): Promise<Envelope<CreatePackResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: COMPENDIUM_DENY('create-pack') };

  // PC1: pre-emptively refuse module-scope. Foundry silently downgrades to
  // world-scope at runtime, which is worse than failing loudly.
  if (input.scope === 'module') {
    return {
      success: false,
      error: `COMPENDIUM_MODULE_SCOPE_RUNTIME_NOT_SUPPORTED: module-scope packs must be declared in the module's manifest at module.json; runtime creation silently downgrades to world-scope. Use a world-scope pack instead.`,
    };
  }
  const wantedId = `world.${input.name}`;
  const existing = (game as any).packs?.get(wantedId);
  if (existing) {
    return {
      success: false,
      error: `COMPENDIUM_PACK_NAME_COLLISION: a pack with id "${wantedId}" already exists`,
    };
  }

  return wrappedWrite('compendium.create-pack', async () => {
    const Coll = getCompendiumCollectionClass();
    if (!Coll || typeof Coll.createCompendium !== 'function') {
      return {
        success: false as const,
        error: 'COMPENDIUM_API_UNAVAILABLE: foundry.documents.collections.CompendiumCollection.createCompendium not found',
      };
    }

    const metadata: any = {
      name: String(input.name),
      label: String(input.label),
      type: String(input.type),
    };
    if (input.system) metadata.system = String(input.system);

    let pack: any;
    try {
      pack = await Coll.createCompendium(metadata);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false as const, error: `COMPENDIUM_PACK_CREATE_FAILED: ${msg}` };
    }

    // PC1 defensive: post-verify scope wasn't silently downgraded.
    const resolved = (game as any).packs?.get(pack?.metadata?.id ?? wantedId);
    if (!resolved) {
      // D9: orphan LevelDB dir surface — HC3 forbids MCP-side delete; surface to user.
      return {
        success: false as const,
        error: `COMPENDIUM_PACK_CREATE_ORPHAN: createCompendium returned but the pack does not resolve in game.packs; LevelDB dir may exist at "${pack?.metadata?.path ?? '(unknown)'}" — clean up via Foundry's compendium sidebar`,
      };
    }

    notify.created('compendium-pack', `Compendium pack "${resolved.metadata?.label ?? wantedId}"`, {
      summary: `${resolved.metadata?.type ?? 'unknown'} (id ${resolved.metadata?.id ?? wantedId})`,
    });

    return {
      success: true as const,
      data: {
        packId: String(resolved.metadata?.id ?? wantedId),
        metadata: serializePackMetadata(resolved),
        entryCount: Number(resolved.index?.size ?? 0),
        ownership: (resolved.ownership as Record<string, string>) ?? {},
      },
    };
  });
}

async function updateCompendiumPack(input: any): Promise<Envelope<UpdatePackResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: COMPENDIUM_DENY('update-pack') };

  const pack = (game as any).packs?.get(input.packId);
  if (!pack) {
    return { success: false, error: `COMPENDIUM_PACK_NOT_FOUND: no pack with id "${input.packId}"` };
  }

  return wrappedWrite('compendium.update-pack', async () => {
    if (typeof pack.configure !== 'function') {
      // PC3: pack.update doesn't exist; configure is the only path.
      return {
        success: false as const,
        error: 'COMPENDIUM_API_UNAVAILABLE: pack.configure() not found (v13 expects this API)',
      };
    }

    // BUG-075 snapshot-clone for post-verify reference. BUG-099 (2026-05-18):
    // `label` was removed from the schema; it is read here only as a defensive
    // diagnostic in case Foundry surfaces an unexpected label drift.
    const before: Record<string, any> = {
      locked: pack?.locked,
      folder: pack?.folder?.id ?? pack?.folder ?? null,
      sort: pack?.sort,
    };

    try {
      await pack.configure({ ...input.changes });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false as const, error: `COMPENDIUM_PACK_UPDATE_FAILED: ${msg}` };
    }

    const refreshed = (game as any).packs?.get(input.packId);
    if (!refreshed) {
      return {
        success: false as const,
        error: `COMPENDIUM_PACK_NOT_FOUND_POST_UPDATE: pack disappeared from registry after configure()`,
      };
    }

    // DP-16: confirm each requested change actually landed on the pack.
    const changedFields: string[] = [];
    for (const key of Object.keys(input.changes)) {
      const want = (input.changes as any)[key];
      let got: any;
      switch (key) {
        case 'locked': got = refreshed?.locked; break;
        case 'folder': got = refreshed?.folder?.id ?? refreshed?.folder ?? null; break;
        case 'sort': got = refreshed?.sort; break;
        default: got = (refreshed as any)?.[key];
      }
      if (got === want || (want === null && (got === null || got === undefined))) {
        changedFields.push(key);
      }
    }

    notify.updated('compendium-pack', `Compendium pack "${refreshed.metadata?.label ?? input.packId}"`, {
      summary: `changed: ${changedFields.join(', ') || '(none verified)'}`,
    });
    void before; // retained for future audit logging

    return {
      success: true as const,
      data: {
        packId: String(input.packId),
        changedFields,
        metadata: serializePackMetadata(refreshed),
      },
    };
  });
}

async function readCompendiumPack(input: any): Promise<Envelope<ReadPackResponse>> {
  // PARITY-001: per-handler gate (CCR-Trust convention — matches sibling handlers)
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: COMPENDIUM_DENY('read-pack') };

  let pack: any;
  try { pack = getPackOrThrow(input.packId); }
  catch (e) { return { success: false, error: e instanceof Error ? e.message : String(e) }; }

  const index = pack.index;
  if (!index || typeof index.values !== 'function') {
    return { success: false, error: `COMPENDIUM_INDEX_UNAVAILABLE: pack index missing for "${input.packId}"` };
  }

  const total = Number(index.size ?? 0);
  const pageSize = Number(input.pageSize ?? Math.min(100, Math.max(total, 1)));
  const page = Number(input.page ?? 1);
  const pageCount = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;

  const allEntries = Array.from(index.values()) as any[];
  const start = (page - 1) * pageSize;
  const slice = allEntries.slice(start, start + pageSize);
  const entries = slice.map((e) => serializePackEntry(e, input.packId));

  // In-pack folder tree (not paginated — folder counts are small). Empty array
  // if the pack has no folders or the collection is unavailable.
  const folderDocs = (pack.folders?.contents ?? []) as any[];
  const folders = folderDocs.map((f) => serializePackFolder(pack, f));

  return {
    success: true,
    data: {
      packId: String(input.packId),
      metadata: serializePackMetadata(pack),
      totalEntries: total,
      page,
      pageSize,
      pageCount,
      entries,
      folders,
    },
  };
}

async function addDocumentToPack(input: any): Promise<Envelope<AddDocumentResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: COMPENDIUM_DENY('add-document-to-pack') };

  let pack: any;
  try { pack = getPackOrThrow(input.packId); }
  catch (e) { return { success: false, error: e instanceof Error ? e.message : String(e) }; }

  // PR3 / PR4: pre-check lock ourselves — Foundry's error path is plain `Error`
  // with i18n-vulnerable message and ordering varies between write paths.
  if (pack.locked) {
    return { success: false, error: `COMPENDIUM_PACK_LOCKED: pack "${input.packId}" is locked` };
  }

  return wrappedWrite('compendium.add-document-to-pack', async () => {
    const warnings: string[] = [];
    let newDoc: any = null;

    if (input.source.kind === 'uuid') {
      const fromUuid = (globalThis as any).fromUuid;
      if (typeof fromUuid !== 'function') {
        return { success: false as const, error: 'COMPENDIUM_API_UNAVAILABLE: fromUuid() not found' };
      }
      const source = await fromUuid(String(input.source.uuid));
      if (!source) {
        return {
          success: false as const,
          error: `COMPENDIUM_SOURCE_DOCUMENT_NOT_FOUND: fromUuid("${input.source.uuid}") returned null`,
        };
      }

      // PR2: importDocument preserves source ID — pre-check collision.
      if (pack.index?.has?.(source.id)) {
        return {
          success: false as const,
          error: `COMPENDIUM_DOCUMENT_ALREADY_EXISTS: pack "${input.packId}" already contains a document with id "${source.id}" (importDocument preserves source IDs)`,
        };
      }

      // BUG-298 (NOT-A-BUG, verified): v13 importDocument is copy-by-default — it
      // deep-clones via toCompendium() → toObject() → deepClone(_source) and never
      // mutates the world doc. The former { clone:false, data:cloned } options were
      // silently-ignored dead code (toCompendium recognizes neither key).
      try {
        newDoc = await pack.importDocument(source);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return { success: false as const, error: `COMPENDIUM_IMPORT_FAILED: ${msg}` };
      }

      // Risk 9.E surfacing — confirm world source still resolves.
      try {
        const stillThere = await fromUuid(String(input.source.uuid));
        if (!stillThere) warnings.push('COMPENDIUM_IMPORT_SOURCE_REMOVED: source UUID no longer resolves after import (unexpected — Foundry should be COPY-by-default)');
      } catch { /* non-fatal */ }
    } else if (input.source.kind === 'inline') {
      const docType = pack.metadata?.type;
      const cfg = (globalThis as any).CONFIG?.[docType];
      const DocClass = cfg?.documentClass;
      if (!DocClass || typeof DocClass.create !== 'function') {
        return {
          success: false as const,
          error: `COMPENDIUM_DOC_CLASS_UNAVAILABLE: CONFIG[${docType}].documentClass.create not found`,
        };
      }
      try {
        newDoc = await DocClass.create(input.source.data, { pack: pack.metadata.id });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return { success: false as const, error: `COMPENDIUM_INLINE_CREATE_FAILED: ${msg}` };
      }
    } else {
      return { success: false as const, error: `COMPENDIUM_SOURCE_KIND_UNKNOWN: ${String((input.source as any).kind)}` };
    }

    if (!newDoc?.id) {
      return { success: false as const, error: 'COMPENDIUM_ADD_NO_RESULT: write returned no document' };
    }

    // Optional placement into an in-pack folder. importDocument keeps the source's
    // WORLD folder id (toCompendium clearFolder defaults false), which doesn't
    // resolve in this pack → root. To place, set the in-pack folder id explicitly
    // AFTER create (research §4 fact 6). The folder must already exist.
    if (input.folder) {
      const targetFolder = pack.folders?.get?.(String(input.folder));
      if (!targetFolder) {
        return {
          success: false as const,
          error: `COMPENDIUM_FOLDER_NOT_FOUND: pack "${input.packId}" has no folder with id "${input.folder}" (create it first via create-folder-in-pack)`,
        };
      }
      try {
        await newDoc.update({ folder: String(input.folder) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        warnings.push(`COMPENDIUM_FOLDER_PLACEMENT_FAILED: document added but not placed in folder — ${msg}`);
      }
    }

    // Post-verify registry hit.
    if (!pack.index?.has?.(newDoc.id)) {
      warnings.push('COMPENDIUM_INDEX_NOT_UPDATED: pack.index does not yet contain the new id; eventual consistency?');
    }

    const docUuid: string = newDoc.uuid
      ?? `Compendium.${input.packId}.${pack.metadata?.type ?? 'unknown'}.${newDoc.id}`;

    notify.created('compendium-document', `Document "${newDoc.name ?? '(unnamed)'}"`, {
      summary: `added to ${input.packId}`,
    });

    return {
      success: true as const,
      data: {
        packId: String(input.packId),
        documentId: String(newDoc.id),
        documentUuid: docUuid,
        name: String(newDoc.name ?? ''),
        type: String(newDoc.type ?? pack.metadata?.type ?? ''),
        entryCount: Number(pack.index?.size ?? 0),
        warnings,
      },
    };
  });
}

async function updateDocumentInPack(input: any): Promise<Envelope<UpdateDocumentResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: COMPENDIUM_DENY('update-document-in-pack') };

  let pack: any;
  try { pack = getPackOrThrow(input.packId); }
  catch (e) { return { success: false, error: e instanceof Error ? e.message : String(e) }; }

  if (pack.locked) {
    return { success: false, error: `COMPENDIUM_PACK_LOCKED: pack "${input.packId}" is locked` };
  }

  return wrappedWrite('compendium.update-document-in-pack', async () => {
    let doc: any = null;
    try { doc = await pack.getDocument(String(input.documentId)); }
    catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false as const, error: `COMPENDIUM_DOCUMENT_FETCH_FAILED: ${msg}` };
    }
    if (!doc) {
      return {
        success: false as const,
        error: `COMPENDIUM_DOCUMENT_NOT_FOUND: no document with id "${input.documentId}" in pack "${input.packId}"`,
      };
    }

    // BUG-075 snapshot-clone for DP-16 post-verify reference.
    const before = typeof doc.toObject === 'function' ? doc.toObject() : { ...(doc._source ?? {}) };

    const docType = pack.metadata?.type;
    const DocClass = (globalThis as any).CONFIG?.[docType]?.documentClass;
    if (!DocClass || typeof DocClass.updateDocuments !== 'function') {
      return {
        success: false as const,
        error: `COMPENDIUM_DOC_CLASS_UNAVAILABLE: CONFIG[${docType}].documentClass.updateDocuments not found`,
      };
    }

    try {
      await DocClass.updateDocuments(
        [{ ...input.changes, _id: doc.id }],
        { pack: pack.metadata.id },
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false as const, error: `COMPENDIUM_DOCUMENT_UPDATE_FAILED: ${msg}` };
    }

    // Re-fetch to verify.
    const after = await pack.getDocument(String(input.documentId));
    if (!after) {
      return {
        success: false as const,
        error: `COMPENDIUM_DOCUMENT_VANISHED: document missing after update`,
      };
    }

    // DP-16 post-verify on _source for non-skip-set fields. Skip set per D11:
    // any field path that starts with `system.` or `flags.` (computed/derived
    // shapes after Foundry normalization).
    const changedFields: string[] = [];
    const afterSource = (after as any)._source ?? after;
    const beforeSource = before;
    for (const key of Object.keys(input.changes)) {
      if (key === '_id') continue;
      if (key.startsWith('system.') || key === 'system' || key.startsWith('flags.') || key === 'flags') {
        // Skip-set: treat as changed without strict compare.
        changedFields.push(key);
        continue;
      }
      const want = (input.changes as any)[key];
      const got = (afterSource as any)?.[key];
      const prev = (beforeSource as any)?.[key];
      // Field considered changed if (a) it equals the requested value, OR
      // (b) it changed from the snapshot. Handles deep-merged objects loosely.
      if (got === want || JSON.stringify(got) !== JSON.stringify(prev)) {
        changedFields.push(key);
      }
    }

    const docUuid: string = after.uuid
      ?? `Compendium.${input.packId}.${pack.metadata?.type ?? 'unknown'}.${after.id}`;

    notify.updated('compendium-document', `Document "${after.name ?? '(unnamed)'}"`, {
      summary: `updated in ${input.packId} (${changedFields.length} field(s))`,
    });

    return {
      success: true as const,
      data: {
        packId: String(input.packId),
        documentId: String(after.id),
        documentUuid: docUuid,
        changedFields,
      },
    };
  });
}

async function readDocumentFromPack(input: any): Promise<Envelope<ReadDocumentResponse>> {
  // PARITY-001: per-handler gate (CCR-Trust convention — matches sibling handlers)
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: COMPENDIUM_DENY('read-document-from-pack') };

  let pack: any;
  try { pack = getPackOrThrow(input.packId); }
  catch (e) { return { success: false, error: e instanceof Error ? e.message : String(e) }; }

  let doc: any = null;
  try { doc = await pack.getDocument(String(input.documentId)); }
  catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: `COMPENDIUM_DOCUMENT_FETCH_FAILED: ${msg}` };
  }
  if (!doc) {
    return {
      success: false,
      error: `COMPENDIUM_DOCUMENT_NOT_FOUND: no document with id "${input.documentId}" in pack "${input.packId}"`,
    };
  }

  const data = typeof doc.toObject === 'function'
    ? (doc.toObject() as Record<string, unknown>)
    : ({ ...(doc as any) } as Record<string, unknown>);

  const docUuid: string = doc.uuid
    ?? `Compendium.${input.packId}.${pack.metadata?.type ?? 'unknown'}.${doc.id}`;

  return {
    success: true,
    data: {
      packId: String(input.packId),
      documentId: String(doc.id),
      documentUuid: docUuid,
      data,
    },
  };
}

// ── In-pack folder handlers ────────────────────────────────────────────────

async function createFolderInPack(input: any): Promise<Envelope<CreateFolderInPackResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: COMPENDIUM_DENY('create-folder-in-pack') };

  let pack: any;
  try { pack = getPackOrThrow(input.packId); }
  catch (e) { return { success: false, error: e instanceof Error ? e.message : String(e) }; }

  if (pack.locked) {
    return { success: false, error: `COMPENDIUM_PACK_LOCKED: pack "${input.packId}" is locked` };
  }

  return wrappedWrite('compendium.create-folder-in-pack', async () => {
    // Validate parent exists in THIS pack + depth pre-check (cap 3 for packs).
    if (input.parentFolderId) {
      const parent = pack.folders?.get?.(String(input.parentFolderId));
      if (!parent) {
        return {
          success: false as const,
          error: `COMPENDIUM_FOLDER_NOT_FOUND: pack "${input.packId}" has no parent folder with id "${input.parentFolderId}"`,
        };
      }
      const newDepth = packFolderDepth(pack, String(input.parentFolderId)) + 1;
      if (newDepth > packFolderMaxDepth()) {
        return {
          success: false as const,
          error: `COMPENDIUM_FOLDER_MAX_DEPTH_EXCEEDED: creating under "${input.parentFolderId}" would put this folder at depth ${newDepth}, exceeding the pack folder cap (${packFolderMaxDepth()})`,
        };
      }
    }

    const FolderImpl = getFolderClass();
    if (!FolderImpl || typeof FolderImpl.create !== 'function') {
      return { success: false as const, error: 'COMPENDIUM_API_UNAVAILABLE: foundry.documents.Folder.implementation.create not found' };
    }

    const data: any = {
      name: String(input.folderName),
      type: String(pack.metadata?.type ?? ''), // MUST match the pack's document type
    };
    if (input.parentFolderId) data.folder = String(input.parentFolderId);
    if (input.color != null) data.color = String(input.color);
    if (typeof input.sort === 'number') data.sort = input.sort;

    let newFolder: any;
    try {
      newFolder = await FolderImpl.create(data, { pack: pack.collection ?? pack.metadata?.id });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false as const, error: `COMPENDIUM_FOLDER_CREATE_FAILED: ${msg}` };
    }

    if (!newFolder?.id || !pack.folders?.get?.(newFolder.id)) {
      return { success: false as const, error: 'COMPENDIUM_FOLDER_WRITE_NOT_PERSISTED: folder create returned but is not present in pack.folders' };
    }

    notify.created('folder', `Folder "${newFolder.name ?? input.folderName}"`, {
      summary: `in pack ${input.packId}`,
    });

    const uuid: string = newFolder.uuid
      ?? `Compendium.${input.packId}.Folder.${newFolder.id}`;

    return {
      success: true as const,
      data: {
        packId: String(input.packId),
        folderId: String(newFolder.id),
        name: String(newFolder.name ?? input.folderName),
        uuid,
        depth: packFolderDepth(pack, String(newFolder.id)),
      },
    };
  });
}

async function listFoldersInPack(input: any): Promise<Envelope<ListFoldersInPackResponse>> {
  // PARITY-001: per-handler gate (reads are GM-gated to match sibling handlers).
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: COMPENDIUM_DENY('list-folders-in-pack') };

  let pack: any;
  try { pack = getPackOrThrow(input.packId); }
  catch (e) { return { success: false, error: e instanceof Error ? e.message : String(e) }; }

  const folderDocs = (pack.folders?.contents ?? []) as any[];
  const folders = folderDocs.map((f) => serializePackFolder(pack, f));

  return {
    success: true,
    data: {
      packId: String(input.packId),
      folders,
    },
  };
}

async function updateFolderInPack(input: any): Promise<Envelope<UpdateFolderInPackResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: COMPENDIUM_DENY('update-folder-in-pack') };

  let pack: any;
  try { pack = getPackOrThrow(input.packId); }
  catch (e) { return { success: false, error: e instanceof Error ? e.message : String(e) }; }

  if (pack.locked) {
    return { success: false, error: `COMPENDIUM_PACK_LOCKED: pack "${input.packId}" is locked` };
  }

  // Defense in depth: type is immutable (Zod schema already omits it).
  if ('type' in (input.changes ?? {})) {
    return { success: false, error: 'COMPENDIUM_FOLDER_TYPE_IMMUTABLE: folder type cannot be changed after creation' };
  }

  return wrappedWrite('compendium.update-folder-in-pack', async () => {
    const folder = pack.folders?.get?.(String(input.folderId));
    if (!folder) {
      return { success: false as const, error: `COMPENDIUM_FOLDER_NOT_FOUND: pack "${input.packId}" has no folder with id "${input.folderId}"` };
    }

    const changes = input.changes ?? {};

    // Build the Foundry update payload (map skill-facing names → schema fields).
    const payload: any = {};
    if (changes.folderName !== undefined) payload.name = String(changes.folderName);
    if (changes.color !== undefined) payload.color = changes.color === null ? null : String(changes.color);
    if (changes.sort !== undefined) payload.sort = changes.sort;

    if (changes.parentFolderId !== undefined) {
      const newParent = changes.parentFolderId;
      if (newParent !== null) {
        // reparent target must exist, not be self, not be a descendant (cycle), and respect depth cap.
        if (String(newParent) === String(input.folderId)) {
          return { success: false as const, error: 'COMPENDIUM_FOLDER_CYCLE: cannot reparent a folder under itself' };
        }
        const descendantIds = new Set(collectPackSubfolders(pack, String(input.folderId)).map((f) => String(f.id)));
        if (descendantIds.has(String(newParent))) {
          return { success: false as const, error: 'COMPENDIUM_FOLDER_CYCLE: cannot reparent a folder under one of its own descendants' };
        }
        if (!pack.folders?.get?.(String(newParent))) {
          return { success: false as const, error: `COMPENDIUM_FOLDER_NOT_FOUND: pack "${input.packId}" has no parent folder with id "${newParent}"` };
        }
        const newDepth = packFolderDepth(pack, String(newParent)) + 1;
        if (newDepth > packFolderMaxDepth()) {
          return { success: false as const, error: `COMPENDIUM_FOLDER_MAX_DEPTH_EXCEEDED: re-parenting would put this folder at depth ${newDepth}, exceeding the pack folder cap (${packFolderMaxDepth()})` };
        }
      }
      payload.folder = newParent === null ? null : String(newParent);
    }

    if (Object.keys(payload).length === 0) {
      return { success: false as const, error: 'COMPENDIUM_FOLDER_NO_CHANGES: update-folder-in-pack requires at least one field in changes' };
    }

    const before: Record<string, any> = {
      name: folder._source?.name ?? folder.name,
      color: folder._source?.color ?? null,
      sort: folder._source?.sort ?? folder.sort,
      folder: parentOf(folder),
    };

    try {
      await folder.update(payload);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false as const, error: `COMPENDIUM_FOLDER_UPDATE_FAILED: ${msg}` };
    }

    const after = pack.folders?.get?.(String(input.folderId));
    if (!after) {
      return { success: false as const, error: 'COMPENDIUM_FOLDER_VANISHED: folder missing after update' };
    }

    // DP-16 post-verify: which requested fields actually changed on _source.
    const changedFields: string[] = [];
    const afterVals: Record<string, any> = {
      name: after._source?.name ?? after.name,
      color: after._source?.color ?? null,
      sort: after._source?.sort ?? after.sort,
      folder: parentOf(after),
    };
    for (const [key, want] of Object.entries(payload)) {
      const got = (afterVals as any)[key];
      if (got === want || (want === null && (got === null || got === undefined)) || JSON.stringify(got) !== JSON.stringify((before as any)[key])) {
        changedFields.push(key);
      }
    }

    notify.updated('folder', `Folder "${after.name ?? input.folderId}"`, {
      summary: `in ${input.packId} (${changedFields.length} field(s))`,
    });

    return {
      success: true as const,
      data: {
        packId: String(input.packId),
        folderId: String(input.folderId),
        changedFields,
      },
    };
  });
}

async function deleteFolderInPack(input: any): Promise<Envelope<DeleteFolderInPackResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: COMPENDIUM_DENY('delete-folder-in-pack') };

  let pack: any;
  try { pack = getPackOrThrow(input.packId); }
  catch (e) { return { success: false, error: e instanceof Error ? e.message : String(e) }; }

  if (pack.locked) {
    return { success: false, error: `COMPENDIUM_PACK_LOCKED: pack "${input.packId}" is locked` };
  }

  // CCR-Delete-Safety: explicit confirm required.
  if (!input.confirm) {
    return { success: false, error: 'COMPENDIUM_FOLDER_DELETE_NOT_CONFIRMED: pass confirm:true to proceed with folder deletion' };
  }

  return wrappedWrite('compendium.delete-folder-in-pack', async () => {
    const folder = pack.folders?.get?.(String(input.folderId));
    if (!folder) {
      return { success: false as const, error: `COMPENDIUM_FOLDER_NOT_FOUND: pack "${input.packId}" has no folder with id "${input.folderId}"` };
    }

    // Pack-aware recursion (getSubfolders is broken for pack folders — research §4 fact 5).
    const subfolders = collectPackSubfolders(pack, String(input.folderId)); // deepest-first, excludes root
    const allFolders = [...subfolders, folder];                              // deepest-first, root last
    const allFolderIds = allFolders.map((f) => String(f.id));
    const folderIdSet = new Set(allFolderIds);

    // Documents living in any of these folders (from the index).
    const containedDocIds = (Array.from(pack.index?.values?.() ?? []) as any[])
      .filter((e) => folderIdSet.has(String(e.folder ?? '')))
      .map((e) => String(e.id ?? e._id ?? ''))
      .filter(Boolean);

    const docType = pack.metadata?.type;
    const DocClass = (globalThis as any).CONFIG?.[docType]?.documentClass;

    let unParentedDocs = 0;
    let deletedDocs = 0;

    if (containedDocIds.length > 0) {
      // BUG-297: validate the DocClass method BEFORE any side effect (atomic-before-effects).
      if (input.deleteContents) {
        if (!DocClass || typeof DocClass.deleteDocuments !== 'function') {
          return { success: false as const, error: `COMPENDIUM_FOLDER_DELETE_CONTENTS_FAILED: CONFIG[${docType}].documentClass.deleteDocuments not found` };
        }
        try {
          await DocClass.deleteDocuments(containedDocIds, { pack: pack.metadata?.id });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          return { success: false as const, error: `COMPENDIUM_FOLDER_DELETE_CONTENTS_FAILED: ${msg}` };
        }
        deletedDocs = containedDocIds.length;
      } else {
        // Un-parent contained docs to pack root BEFORE deleting folders, so we never
        // rely on Foundry's (unconfirmed) native pack-folder cascade.
        if (!DocClass || typeof DocClass.updateDocuments !== 'function') {
          return { success: false as const, error: `COMPENDIUM_FOLDER_DELETE_CONTENTS_FAILED: CONFIG[${docType}].documentClass.updateDocuments not found` };
        }
        try {
          await DocClass.updateDocuments(
            containedDocIds.map((id) => ({ _id: id, folder: null })),
            { pack: pack.metadata?.id },
          );
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          return { success: false as const, error: `COMPENDIUM_FOLDER_DELETE_CONTENTS_FAILED: un-parent failed — ${msg}` };
        }
        unParentedDocs = containedDocIds.length;
      }
    }

    // Delete folders deepest-first (children before parents).
    try {
      for (const f of allFolders) {
        await f.delete();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false as const, error: `COMPENDIUM_FOLDER_DELETE_FAILED: ${msg}` };
    }

    // DP-16 post-verify: root folder must be gone.
    if (pack.folders?.get?.(String(input.folderId))) {
      return { success: false as const, error: `COMPENDIUM_FOLDER_WRITE_NOT_PERSISTED: folder "${input.folderId}" still present after delete` };
    }

    notify.deleted('folder', `Folder "${folder.name ?? input.folderId}"`, {
      summary: `from pack ${input.packId}`,
    });

    return {
      success: true as const,
      data: {
        packId: String(input.packId),
        folderId: String(input.folderId),
        deletedFolderIds: allFolderIds,
        unParentedDocs,
        deletedDocs,
      },
    };
  });
}

// ── Umbrella dispatcher ───────────────────────────────────────────────────

export async function dispatchCompendium(data: unknown): Promise<any> {
  // PARITY-001: dispatcher-level gate removed (was the only umbrella with a dispatcher gate,
  // violating CCR-Trust). Each handler self-gates, including read handlers. See per-handler
  // validateGMAccess() calls in createCompendiumPack/updateCompendiumPack/readCompendiumPack/
  // addDocumentToPack/updateDocumentInPack/readDocumentFromPack.

  let input: CompendiumToolInputType;
  try {
    input = CompendiumToolInput.parse(data ?? {}) as CompendiumToolInputType;
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  switch (input.action) {
    case 'create-pack':
      return createCompendiumPack(input);
    case 'update-pack':
      return updateCompendiumPack(input);
    case 'read-pack':
      return readCompendiumPack(input);
    case 'add-document-to-pack':
      return addDocumentToPack(input);
    case 'update-document-in-pack':
      return updateDocumentInPack(input);
    case 'read-document-from-pack':
      return readDocumentFromPack(input);
    case 'create-folder-in-pack':
      return createFolderInPack(input);
    case 'list-folders-in-pack':
      return listFoldersInPack(input);
    case 'update-folder-in-pack':
      return updateFolderInPack(input);
    case 'delete-folder-in-pack':
      return deleteFolderInPack(input);
    default:
      throw new Error(`Unknown compendium action: ${(input as any).action}`);
  }
}
