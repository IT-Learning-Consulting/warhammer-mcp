// Phase 1 mcp_coverage_expansion — Item-directory umbrella schema.
//
// Covers 5 actions over game.items (world WorldCollection):
//   list / get / search / duplicate / import-from-compendium
//
// Single-collection scope: game.items only. Actor-embedded items are
// served by list-actor-items; compendium reads by search-compendium.

import { z } from 'zod';
import { FolderId, ItemId, PackId } from './branded-ids.js';

export const ItemDirectoryListInput = z
  .object({
    action: z.literal('list'),
    typeFilter: z.string().optional(),
    folderId: FolderId.optional(),
    page: z.number().int().min(1).optional(),
    pageSize: z.number().int().min(1).max(200).optional(),
  })
  .strict();

export const ItemDirectoryGetInput = z
  .object({
    action: z.literal('get'),
    itemId: ItemId,
  })
  .strict();

export const ItemDirectorySearchInput = z
  .object({
    action: z.literal('search'),
    query: z.string().optional(),
    filters: z
      .object({
        type: z.string().optional(),
        folder: z.string().optional(),
      })
      .optional(),
    exclude: z.array(z.string()).optional(),
  })
  .strict();

export const ItemDirectoryDuplicateInput = z
  .object({
    action: z.literal('duplicate'),
    itemId: ItemId,
    newName: z.string().optional(),
  })
  .strict();

export const ItemDirectoryImportFromCompendiumInput = z
  .object({
    action: z.literal('import-from-compendium'),
    packId: PackId,
    itemId: ItemId,
    updateData: z.record(z.unknown()).optional(),
  })
  .strict();

export const ItemDirectoryToolInput = z.discriminatedUnion('action', [
  ItemDirectoryListInput,
  ItemDirectoryGetInput,
  ItemDirectorySearchInput,
  ItemDirectoryDuplicateInput,
  ItemDirectoryImportFromCompendiumInput,
]);

export type ItemDirectoryToolInputType = z.infer<typeof ItemDirectoryToolInput>;
export type ItemDirectoryListInputType = z.infer<typeof ItemDirectoryListInput>;
export type ItemDirectoryGetInputType = z.infer<typeof ItemDirectoryGetInput>;
export type ItemDirectorySearchInputType = z.infer<typeof ItemDirectorySearchInput>;
export type ItemDirectoryDuplicateInputType = z.infer<typeof ItemDirectoryDuplicateInput>;
export type ItemDirectoryImportFromCompendiumInputType = z.infer<typeof ItemDirectoryImportFromCompendiumInput>;
