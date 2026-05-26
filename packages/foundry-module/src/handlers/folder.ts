// Phase 4 mcp_completion_v1 — Folder CRUD + list-contents handler.
//
// Architecture:
//   - create/get/list flow through `createFlatWorldDocCRUDHandlers` (flat factory).
//   - update is a thin wrapper around the factory's update that adds:
//       * FOLDER_TYPE_IMMUTABLE defense (type excluded from Zod schema; defense-in-depth)
//       * FOLDER_MAX_DEPTH_EXCEEDED depth pre-check when re-parenting (changes.folder set)
//   - delete is hand-rolled to add CCR-Delete-Safety confirm gate + deleteContents cascade.
//   - list-contents is hand-rolled (factory doesn't cover — custom action).
//   - dispatchFolder is the umbrella; mirrors dispatchMacro / dispatchPlaylist.
//
// Error tokens:
//   FOLDER_DELETE_NOT_CONFIRMED, FOLDER_TYPE_IMMUTABLE, FOLDER_MAX_DEPTH_EXCEEDED,
//   FOLDER_NOT_FOUND, FOLDER_WRITE_NOT_PERSISTED, FOLDER_COLLECTION_NOT_FOUND
//
// Anchors:
//   - DP-15: typed Envelope<T> returns.
//   - DP-16 / F08: factory-baked _source scalar compare on create/update.
//   - CCR-Delete-Safety: confirm gate always fires before any destructive action.
//   - BUG-075: factory-baked BUG-075 snapshot before update.
//   - NEVER calls ChatMessage.create — all GM feedback routes through notify.*

import {
  FolderCreateInput,
  FolderUpdateInput,
  FolderDeleteInput,
  FolderGetInput,
  FolderListInput,
  FolderListContentsInput,
  FolderToolInput,
  type FolderViewModel,
  type FolderListItem,
  type FolderContentsItem,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { notify } from '../notify.js';
import {
  createFlatWorldDocCRUDHandlers,
  validateGMAccess,
  type Envelope,
} from '../utils/flatWorldCRUDFactory.js';

// ── Serializers ───────────────────────────────────────────────────────────

function serializeFolderViewModel(folder: any): FolderViewModel {
  return {
    id: folder.id as string,
    name: (folder._source?.name as string) ?? '',
    type: (folder._source?.type as string) ?? '',
    color: (folder._source?.color as string | null) ?? null,
    description: (folder._source?.description as string) ?? '',
    folder: (folder._source?.folder as string | null) ?? null,
    sort: (folder._source?.sort as number) ?? 0,
    sorting: (folder._source?.sorting as string) ?? 'a',
    depth: (folder.depth as number) ?? 0,
    flags: (folder._source?.flags as Record<string, unknown>) ?? {},
  };
}

function serializeFolderListItem(folder: any): FolderListItem {
  return {
    id: folder.id as string,
    name: (folder._source?.name as string) ?? '',
    type: (folder._source?.type as string) ?? '',
    folder: (folder._source?.folder as string | null) ?? null,
    depth: (folder.depth as number) ?? 0,
    color: (folder._source?.color as string | null) ?? null,
  };
}

// ── List filters ──────────────────────────────────────────────────────────

function applyFolderListFilters(input: any, items: any[]): any[] {
  let out = items;
  if (input.typeFilter) {
    out = out.filter((f) => f._source?.type === input.typeFilter);
  }
  if (input.nameFilter) {
    const needle = String(input.nameFilter).toLowerCase();
    out = out.filter((f) => ((f._source?.name as string) ?? '').toLowerCase().includes(needle));
  }
  if (input.parentId !== undefined) {
    if (input.parentId === null) {
      out = out.filter((f) => (f._source?.folder ?? null) === null);
    } else {
      out = out.filter((f) => f._source?.folder === input.parentId);
    }
  }
  return out;
}

function isAnyFolderFilterApplied(input: any): boolean | string {
  const applied: string[] = [];
  if (input.typeFilter) applied.push(`type="${input.typeFilter}"`);
  if (input.nameFilter) applied.push(`name="${input.nameFilter}"`);
  if (input.parentId !== undefined) applied.push(`parentId="${input.parentId}"`);
  return applied.length > 0 ? applied.join(', ') : false;
}

// ── Factory configuration ─────────────────────────────────────────────────

const folderFactoryHandlers = createFlatWorldDocCRUDHandlers<
  any,
  { changes: Record<string, any>; folderId: string },
  FolderViewModel,
  FolderListItem
>({
  documentName: 'Folder',
  documentLabel: 'folder',
  collectionKey: 'folders',
  idField: 'folderId',
  gmGateReads: true,
  schemas: {
    create: FolderCreateInput,
    update: FolderUpdateInput,
    delete: FolderDeleteInput,
    get: FolderGetInput,
    list: FolderListInput,
    toolInput: FolderToolInput,
  },
  dp16SkipFields: [],
  formatter: serializeFolderViewModel,
  listItemFormatter: serializeFolderListItem,
  applyListFilters: applyFolderListFilters,
  isFilterApplied: isAnyFolderFilterApplied,
  responseKeys: {
    viewModel: 'folder',
    listArray: 'items',
    remainingCount: 'remainingCount',
  },
  notifyKind: 'folder',
  formatNotifyTitle: (f) => `Folder "${f?._source?.name ?? '(unnamed)'}"`,
  formatNotifySummary: (input) => {
    if (input.action === 'create') return `${input.type} folder`;
    return 'folder';
  },
  defaultPageSize: 50,
  responseBuilders: {
    create: ({ doc, requestedChanges }) => ({
      folderId: doc.id,
      folder: serializeFolderViewModel(doc),
      requestedChanges,
    }),
    update: ({ doc, requestedChanges, changedFields }) => ({
      folderId: doc.id,
      folder: serializeFolderViewModel(doc),
      requestedChanges,
      changedFields,
    }),
  },
});

// ── Exported CRUD handlers ────────────────────────────────────────────────────

// BUG-155: create-path depth pre-check must run BEFORE Foundry validation.
// Foundry's FolderDataModel.validateJoint can reject depth overflow during
// create(), which bypasses our cleaner MCP error token unless we gate early.
export async function createFolder(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: createFolder requires GM' };

  let input: any;
  try {
    input = FolderCreateInput.strict().parse(data ?? {});
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${msg}`);
  }

  if (input.folder !== undefined && input.folder !== null) {
    const parentFolder = (game as any).folders?.get(input.folder);
    if (parentFolder) {
      const newDepth = ((parentFolder.depth as number) ?? 0) + 1;
      const FOLDER_MAX_DEPTH = (globalThis as any).CONST?.FOLDER_MAX_DEPTH ?? 4;
      if (newDepth > FOLDER_MAX_DEPTH) {
        return {
          success: false,
          error: `FOLDER_MAX_DEPTH_EXCEEDED: creating this folder would put it at depth ${newDepth} which exceeds CONST.FOLDER_MAX_DEPTH (${FOLDER_MAX_DEPTH})`,
        };
      }
    }
  }

  return folderFactoryHandlers.create(data);
}

export const getFolder = folderFactoryHandlers.get;
export const listFolders = folderFactoryHandlers.list;

// ── Custom update (depth pre-check + type-immutable guard) ─────────────────

export async function updateFolder(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: updateFolder requires GM' };

  let input: any;
  try {
    input = FolderUpdateInput.strict().parse(data ?? {});
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${msg}`);
  }

  // Defense in depth: reject type in changes (Zod already excludes it but belt-and-suspenders)
  if ('type' in (input.changes ?? {})) {
    return {
      success: false,
      error: 'FOLDER_TYPE_IMMUTABLE: type cannot be changed after folder creation',
    };
  }

  // Depth pre-check when re-parenting
  if (input.changes.folder !== undefined && input.changes.folder !== null) {
    const parentFolder = (game as any).folders?.get(input.changes.folder);
    if (parentFolder) {
      const newDepth = ((parentFolder.depth as number) ?? 0) + 1;
      const FOLDER_MAX_DEPTH = (globalThis as any).CONST?.FOLDER_MAX_DEPTH ?? 4;
      if (newDepth > FOLDER_MAX_DEPTH) {
        return {
          success: false,
          error: `FOLDER_MAX_DEPTH_EXCEEDED: re-parenting would put this folder at depth ${newDepth} which exceeds CONST.FOLDER_MAX_DEPTH (${FOLDER_MAX_DEPTH})`,
        };
      }
    }
  }

  // Delegate to factory's update (carries BUG-075 + DP-16)
  return folderFactoryHandlers.update(data);
}

// ── Custom delete (confirm gate + deleteContents cascade) ─────────────────

export async function deleteFolder(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: deleteFolder requires GM' };

  let input: any;
  try {
    input = FolderDeleteInput.strict().parse(data ?? {});
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${msg}`);
  }

  // CCR-Delete-Safety: confirm gate
  if (!input.confirm) {
    return {
      success: false,
      error: 'FOLDER_DELETE_NOT_CONFIRMED: pass confirm:true to proceed with folder deletion',
    };
  }

  // Guard reserved-for-future `cascade` field (Phase 10 cross-doc FK cleanup).
  // Schema field exists but is not yet wired; surface a clear error rather than silent no-op.
  if (input.cascade) {
    throw new Error(
      'FOLDER_CASCADE_NOT_IMPLEMENTED: the `cascade` field is reserved for Phase 10 cross-doc FK cleanup and not yet wired. Use `deleteContents:true` to cascade folder-contents only.',
    );
  }

  const folders = (game as any).folders;
  if (!folders || typeof folders.get !== 'function') {
    return { success: false, error: 'FOLDER_COLLECTION_NOT_FOUND: game.folders is unavailable' };
  }

  const folder = folders.get(input.folderId);
  if (!folder) {
    return {
      success: false,
      error: `FOLDER_NOT_FOUND: no folder with id "${input.folderId}"`,
    };
  }

  return wrappedWrite('folder.deleteFolder', async () => {
    if (input.deleteContents) {
      // Get all recursive subfolders (deepest first to avoid orphan issues)
      const subfolders: any[] = typeof folder.getSubfolders === 'function'
        ? folder.getSubfolders(true)
        : [];

      // Collect contained documents from this folder + all subfolders
      const allFolderIds = [folder, ...subfolders];
      for (const f of allFolderIds) {
        const contents: any[] = f.contents ?? [];
        const docIds = contents.map((d: any) => d.id).filter(Boolean);
        if (docIds.length > 0) {
          const DocClass = (globalThis as any)[folder.type];
          if (!DocClass || typeof DocClass.deleteDocuments !== 'function') {
            throw new Error(
              `FOLDER_DELETE_CONTENTS_FAILED: no deleteDocuments method found for folder type "${folder.type}" — cannot delete contents`,
            );
          }
          await DocClass.deleteDocuments(docIds);
        }
      }

      // Delete subfolders deepest-first (reverse order from getSubfolders)
      for (const subf of [...subfolders].reverse()) {
        await subf.delete();
      }
    }

    // Delete the folder itself (Foundry native: un-parents children if deleteContents=false)
    await folder.delete();

    // DP-16 post-verify: confirm removal
    if (folders.get(input.folderId)) {
      throw new Error(
        `FOLDER_WRITE_NOT_PERSISTED: folder "${input.folderId}" still present after delete`,
      );
    }

    notify.deleted('folder', `Folder "${folder.name ?? input.folderId}"`);

    return {
      success: true as const,
      data: {
        deletedId: input.folderId,
        remainingCount: folders.size ?? 0,
      },
    };
  });
}

// ── Custom list-contents (shallow default + optional recursive) ────────────

export async function listFolderContents(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: listFolderContents requires GM' };

  let input: any;
  try {
    input = FolderListContentsInput.strict().parse(data ?? {});
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${msg}`);
  }

  const folders = (game as any).folders;
  if (!folders || typeof folders.get !== 'function') {
    return { success: false, error: 'FOLDER_COLLECTION_NOT_FOUND: game.folders is unavailable' };
  }

  const folder = folders.get(input.folderId);
  if (!folder) {
    return {
      success: false,
      error: `FOLDER_NOT_FOUND: no folder with id "${input.folderId}"`,
    };
  }

  function serializeContentsItem(doc: any): FolderContentsItem {
    return {
      id: doc.id as string,
      name: (doc.name as string) ?? (doc._source?.name as string) ?? '',
      documentType: folder.type as string,
      uuid: (doc.uuid as string | null) ?? null,
    };
  }

  let items: FolderContentsItem[] = (folder.contents ?? []).map(serializeContentsItem);

  if (input.recursive) {
    const subfolders: any[] = typeof folder.getSubfolders === 'function'
      ? folder.getSubfolders(true)
      : [];
    for (const subf of subfolders) {
      const subContents: FolderContentsItem[] = (subf.contents ?? []).map(serializeContentsItem);
      items = items.concat(subContents);
    }
  }

  return {
    success: true,
    data: {
      folderId: input.folderId,
      folderName: folder.name ?? '',
      recursive: input.recursive ?? false,
      count: items.length,
      items,
    },
  };
}

// ── Umbrella dispatcher ────────────────────────────────────────────────────

export async function dispatchFolder(data: unknown): Promise<any> {
  let input: any;
  try {
    input = FolderToolInput.parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  switch (input.action) {
    case 'create':
      return createFolder(input);
    case 'update':
      return updateFolder(input);
    case 'delete':
      return deleteFolder(input);
    case 'get':
      return getFolder(input);
    case 'list':
      return listFolders(input);
    case 'list-contents':
      return listFolderContents(input);
    default:
      throw new Error(`Unknown folder action: ${(input as any).action}`);
  }
}
