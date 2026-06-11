// Compendium handler input schemas + compendium value schemas.
// CCR-4 per-domain file. Input schemas use .strict() per CCR-5.

import { z } from 'zod';

export const CompendiumSearchResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  img: z.string().optional(),
  pack: z.string(),
  packLabel: z.string(),
  system: z.record(z.unknown()).optional(),
});

export const CompendiumPackSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.string(),
  system: z.string(),
  private: z.boolean(),
});

const SearchFilters = z.object({
  challengeRating: z.union([
    z.number(),
    z.object({ min: z.number().optional(), max: z.number().optional() }),
  ]).optional(),
  creatureType: z.string().optional(),
  size: z.string().optional(),
  spellcaster: z.boolean().optional(),
});

// itemType field added here (optional, unused until 3d per plan task 1.3) so
// schema does not need to change twice between 3a and 3d.
// PARITY-COVERAGE-EXEMPT:itemType  — staged future API field; tool inputSchema
// won't expose until 3d ships.
export const SearchCompendiumInput = z.object({
  query: z.string(),
  packType: z.string().optional(),
  filters: SearchFilters.optional(),
  itemType: z.string().optional(),
}).strict();

export const ListCreaturesByCriteriaInput = z.object({
  threatLevel: z.union([
    z.number(),
    z.object({ min: z.number().optional(), max: z.number().optional() }),
  ]).optional(),
  creatureType: z.string().optional(),
  size: z.string().optional(),
  hasSpells: z.boolean().optional(),
  hasSpecialAbilities: z.boolean().optional(),
  limit: z.number().optional(),
}).strict();

export const GetAvailablePacksInput = z.object({}).strict();

// TOOL-IDEA-009 (2026-05-14): `summary_only` short-circuits the verbose `fullData`
// + system tree payload that get-compendium-entry-full returns by default. Bridges
// the gap between get-compendium-item (compact=true, too lean) and the full payload
// (too verbose). The flag is also accepted by get-compendium-item (server-side hint
// only — module returns the same shape regardless).
export const GetCompendiumDocumentFullInput = z.object({
  packId: z.string(),
  documentId: z.string(),
  summary_only: z.boolean().optional(),
}).strict();

export const GetEnhancedCreatureIndexInput = z.object({}).strict();

// ────────────────────────────────────────────────────────────────────────────
// Phase 9 — Compendium umbrella tool (CRU only; HC3 forbids any delete action)
// ────────────────────────────────────────────────────────────────────────────
//
// 10 actions on a single discriminated union (6 pack/document CRU + 4 in-pack
// folder management, added 2026-06-11). NO delete-pack and NO
// delete-document-from-pack — those literals are grep-enforced absent
// (mcp_crud_expansion PRD §7 HC3). delete-folder-in-pack IS present and HC3-OK
// (folder = organizational metadata, not a pack or document — see the in-pack
// folder block below). Validate Step 4 + executor smoke gates scan this file
// and the umbrella tool file for any delete-pack/delete-document introduction.
//
// Pack-creation handler uses `foundry.documents.collections.CompendiumCollection`
// (v13-canonical; bare global deprecated since v13, removed v15 — see
// phase9_probes.md Probe D capture).

export const CreatePackInput = z.object({
  action: z.literal('create-pack'),
  name: z.string().min(1),
  label: z.string(),
  type: z.enum(['Actor', 'Item', 'JournalEntry', 'RollTable', 'Macro', 'Scene', 'Playlist']),
  system: z.string().optional(),
  scope: z.enum(['world', 'module']).default('world'),
  moduleId: z.string().optional(),
}).strict();

// BUG-099 (2026-05-18): `label` removed from update-pack changes.
// Foundry v13.351 `pack.configure({label})` silently drops the change for
// world-scope packs — `metadata.label` is loaded at pack-creation/manifest
// time and is not configurable post-create. Removing the field from the
// schema turns the silent drop into a Zod parse error at the input layer.
// To rename a world-scope pack: delete + re-create via Foundry UI, OR wait
// for v2's pack-rename surface. `folder`/`sort`/`locked` persist correctly
// via `pack.configure()`.
export const UpdatePackInput = z.object({
  action: z.literal('update-pack'),
  packId: z.string(),
  changes: z.object({
    folder: z.string().nullable().optional(),
    sort: z.number().int().optional(),
    locked: z.boolean().optional(),
  }).strict(),
}).strict();

export const ReadPackInput = z.object({
  action: z.literal('read-pack'),
  packId: z.string(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(500).optional(),
}).strict();

export const AddDocumentToPackInput = z.object({
  action: z.literal('add-document-to-pack'),
  packId: z.string(),
  source: z.union([
    z.object({ kind: z.literal('uuid'), uuid: z.string() }).strict(),
    z.object({ kind: z.literal('inline'), data: z.record(z.string(), z.unknown()) }).strict(),
  ]),
  // Optional in-pack folder id to place the imported document into. The handler
  // sets it via newDoc.update({folder}) AFTER importDocument (toCompendium keeps
  // the source's WORLD folder id, which doesn't resolve in the pack → root). The
  // folder must already exist in pack.folders.
  folder: z.string().optional(),
}).strict();

export const UpdateDocumentInPackInput = z.object({
  action: z.literal('update-document-in-pack'),
  packId: z.string(),
  documentId: z.string(),
  changes: z.record(z.string(), z.unknown()),
}).strict();

export const ReadDocumentFromPackInput = z.object({
  action: z.literal('read-document-from-pack'),
  packId: z.string(),
  documentId: z.string(),
}).strict();

// ────────────────────────────────────────────────────────────────────────────
// In-pack folder management (2026-06-11) — 4 actions on pack.folders.
// ────────────────────────────────────────────────────────────────────────────
//
// These operate on folders INSIDE a pack (pack.folders / CompendiumFolderCollection),
// distinct from the pack's own sidebar folder (UpdatePackInput.changes.folder).
//
// HC3 reconciliation: delete-folder-in-pack IS a delete, but HC3 forbids only
// pack deletion (LevelDB dirs, orphan risk) and document deletion (content loss).
// A folder is organizational metadata — deleting it does not lose documents
// (deleteContents:false un-parents them to root). So delete-folder-in-pack does
// NOT violate HC3. It still requires CCR-Delete-Safety confirm:true.
//
// Pack folder depth cap is 3 (CONST.FOLDER_MAX_DEPTH - 1), enforced Foundry-side
// in Folder._preCreate — distinct from the world folder cap of 4.

export const CreateFolderInPackInput = z.object({
  action: z.literal('create-folder-in-pack'),
  packId: z.string(),
  folderName: z.string().min(1),
  parentFolderId: z.string().optional(),
  color: z.string().optional(),
  sort: z.number().int().optional(),
}).strict();

export const ListFoldersInPackInput = z.object({
  action: z.literal('list-folders-in-pack'),
  packId: z.string(),
}).strict();

export const UpdateFolderInPackInput = z.object({
  action: z.literal('update-folder-in-pack'),
  packId: z.string(),
  folderId: z.string(),
  changes: z.object({
    folderName: z.string().min(1).optional(),
    color: z.string().nullable().optional(),
    sort: z.number().int().optional(),
    parentFolderId: z.string().nullable().optional(),
  }).strict(),
}).strict();

export const DeleteFolderInPackInput = z.object({
  action: z.literal('delete-folder-in-pack'),
  packId: z.string(),
  folderId: z.string(),
  confirm: z.boolean(),
  deleteContents: z.boolean().default(false),
}).strict();

export const CompendiumToolInput = z.discriminatedUnion('action', [
  CreatePackInput,
  UpdatePackInput,
  ReadPackInput,
  AddDocumentToPackInput,
  UpdateDocumentInPackInput,
  ReadDocumentFromPackInput,
  CreateFolderInPackInput,
  ListFoldersInPackInput,
  UpdateFolderInPackInput,
  DeleteFolderInPackInput,
]);

export type CompendiumToolInputType = z.infer<typeof CompendiumToolInput>;
