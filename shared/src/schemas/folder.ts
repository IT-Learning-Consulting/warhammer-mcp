// Phase 4 mcp_completion_v1 — Folder umbrella shared schemas.
//
// 6 actions: create, update, delete, get, list, list-contents.
// Folder.delete carries CCR-Delete-Safety confirm gate + deleteContents cascade flag.
// Folder.update excludes `type` (conventionally immutable post-create).
// Folder type enum includes all 10 v13 FOLDER_DOCUMENT_TYPES (incl. 'Compendium').
//
// Anchors:
//   - DP-15: typed inputs and response interfaces.
//   - CCR-Schema-Fidelity: all 10 FOLDER_DOCUMENT_TYPES per CONST.FOLDER_DOCUMENT_TYPES.
//   - CCR-Delete-Safety: confirm: z.boolean() required on delete (matches playlist + macro pattern).
//   - Design Decision: type excluded from update.changes (conventionally immutable post-create).

import { z } from 'zod';

const FOUNDRY_ID = z.string().min(1);

export const FOLDER_DOCUMENT_TYPES = [
  'Actor',
  'Cards',
  'Item',
  'JournalEntry',
  'Macro',
  'Playlist',
  'RollTable',
  'Scene',
  'Adventure',
  'Compendium',
] as const;

// ── Per-action Input schemas ─────────────────────────────────────────────────

export const FolderCreateInput = z.object({
  action: z.literal('create'),
  name: z.string().min(1),
  type: z.enum(FOLDER_DOCUMENT_TYPES),
  folder: FOUNDRY_ID.nullable().optional(),
  color: z.string().nullable().optional(),
  description: z.string().optional(),
  sort: z.number().int().optional(),
  sorting: z.enum(['a', 'm']).optional(),
  flags: z.record(z.unknown()).optional(),
}).strict();

export const FolderUpdateInput = z.object({
  action: z.literal('update'),
  folderId: FOUNDRY_ID,
  changes: z.object({
    name: z.string().min(1).optional(),
    folder: FOUNDRY_ID.nullable().optional(),
    color: z.string().nullable().optional(),
    description: z.string().optional(),
    sort: z.number().int().optional(),
    sorting: z.enum(['a', 'm']).optional(),
    flags: z.record(z.unknown()).optional(),
  }).strict(),
}).strict();

export const FolderDeleteInput = z.object({
  action: z.literal('delete'),
  folderId: FOUNDRY_ID,
  confirm: z.boolean(),
  deleteContents: z.boolean().default(false),
  cascade: z.boolean().default(false),
}).strict();

export const FolderGetInput = z.object({
  action: z.literal('get'),
  folderId: FOUNDRY_ID,
}).strict();

export const FolderListInput = z.object({
  action: z.literal('list'),
  typeFilter: z.enum(FOLDER_DOCUMENT_TYPES).optional(),
  nameFilter: z.string().optional(),
  parentId: FOUNDRY_ID.nullable().optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  countOnly: z.boolean().optional(),
}).strict();

export const FolderListContentsInput = z.object({
  action: z.literal('list-contents'),
  folderId: FOUNDRY_ID,
  recursive: z.boolean().default(false),
}).strict();

// ── Discriminated union ──────────────────────────────────────────────────────

export const FolderToolInput = z.discriminatedUnion('action', [
  FolderCreateInput,
  FolderUpdateInput,
  FolderDeleteInput,
  FolderGetInput,
  FolderListInput,
  FolderListContentsInput,
]);

// ── Inferred types ───────────────────────────────────────────────────────────

export type FolderCreateInputType = z.infer<typeof FolderCreateInput>;
export type FolderUpdateInputType = z.infer<typeof FolderUpdateInput>;
export type FolderDeleteInputType = z.infer<typeof FolderDeleteInput>;
export type FolderGetInputType = z.infer<typeof FolderGetInput>;
export type FolderListInputType = z.infer<typeof FolderListInput>;
export type FolderListContentsInputType = z.infer<typeof FolderListContentsInput>;
export type FolderToolInputType = z.infer<typeof FolderToolInput>;

// ── Response interfaces ──────────────────────────────────────────────────────

export interface FolderViewModel {
  id: string;
  name: string;
  type: string;
  color: string | null;
  description: string;
  folder: string | null;
  sort: number;
  sorting: string;
  depth: number;
  flags: Record<string, unknown>;
}

export interface FolderListItem {
  id: string;
  name: string;
  type: string;
  folder: string | null;
  depth: number;
  color: string | null;
}

export interface FolderContentsItem {
  id: string;
  name: string;
  documentType: string;
  uuid: string | null;
}
