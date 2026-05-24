import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createFlatWorldDocCRUDHandlers } from '../utils/flatWorldCRUDFactory.js';

describe('flatWorldCRUDFactory errorTag normalization (BUG-153)', () => {
  it('normalizes spaces and hyphens to underscores in *_NOT_FOUND tokens', async () => {
    (globalThis as any).game.user = { isGM: true };
    (globalThis as any).game.missingCollection = undefined;

    const baseSchemas = {
      create: z.object({ action: z.literal('create') }),
      update: z.object({ action: z.literal('update'), docId: z.string(), changes: z.record(z.string(), z.unknown()) }),
      delete: z.object({ action: z.literal('delete'), docId: z.string() }),
      get: z.object({ action: z.literal('get'), docId: z.string() }),
      list: z.object({ action: z.literal('list') }),
      toolInput: z.discriminatedUnion('action', [
        z.object({ action: z.literal('create') }),
        z.object({ action: z.literal('update'), docId: z.string(), changes: z.record(z.string(), z.unknown()) }),
        z.object({ action: z.literal('delete'), docId: z.string() }),
        z.object({ action: z.literal('get'), docId: z.string() }),
        z.object({ action: z.literal('list') }),
      ]),
    } as const;

    const handlers = createFlatWorldDocCRUDHandlers<any, any, any, any>({
      documentName: 'JournalEntry',
      documentLabel: 'chat message',
      collectionKey: 'missingCollection',
      idField: 'docId',
      gmGateReads: true,
      schemas: baseSchemas,
      dp16SkipFields: [],
      formatter: (doc: any) => doc,
      listItemFormatter: (doc: any) => doc,
      applyListFilters: (_input: any, docs: any[]) => docs,
      isFilterApplied: () => false,
      responseKeys: { viewModel: 'doc', listArray: 'items', remainingCount: 'remainingCount' },
      notifyKind: 'mcp',
    });

    await expect(handlers.get({ action: 'get', docId: 'abc' }))
      .rejects
      .toThrow('CHAT_MESSAGE_COLLECTION_NOT_FOUND');
  });
});
