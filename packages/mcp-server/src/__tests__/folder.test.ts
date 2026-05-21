// Phase 4 mcp_completion_v1 — Folder tool schema + dispatch tests.
//
// Tests: action enum (6 values), confirm gate, deleteContents branches,
// type-immutable guard, depth-exceeded, list-contents, and happy-path per action.
// Business logic (FOLDER_DELETE_NOT_CONFIRMED etc.) lives in the Foundry-side
// handler (handlers/folder.ts). These tests assert: schema parse, action dispatch,
// and error formatting when foundryClient returns/throws failure.

import { describe, it, expect, vi } from 'vitest';
import { FolderToolInput, FolderDeleteInput } from '@foundry-mcp/shared';
import { FolderTool } from '../tools/folder.js';

function makeLogger(): any {
  const noop = () => undefined;
  return { info: noop, warn: noop, error: noop, debug: noop, child: () => makeLogger() };
}

type MockReturn = { folderId?: string; folder?: any; deletedId?: string; remainingCount?: number; items?: any[]; count?: number; folderName?: string; recursive?: boolean; requestedChanges?: any; changedFields?: string[] };

function makeTool(mockReturn: MockReturn | null = null, mockThrow: string | null = null) {
  const foundryClient: any = {
    query: vi.fn(async (_key: string, _args: any) => {
      if (mockThrow) throw new Error(mockThrow);
      return mockReturn ?? { folderId: 'folder-123', folder: { id: 'folder-123', name: 'Test', type: 'Actor', depth: 0, folder: null, color: null, description: '', sort: 0, sorting: 'a', flags: {} } };
    }),
  };
  return new FolderTool({ foundryClient, logger: makeLogger() });
}

// ── Schema tests ──────────────────────────────────────────────────────────────

describe('FolderToolInput schema', () => {
  it('action enum contains exactly 6 values', () => {
    const actions = FolderToolInput.options.map((o) => o.shape.action.value);
    expect(actions.sort()).toEqual(['create', 'delete', 'get', 'list', 'list-contents', 'update']);
  });

  it('create requires name and type', () => {
    expect(() => FolderToolInput.parse({ action: 'create' })).toThrow();
    expect(() => FolderToolInput.parse({ action: 'create', name: 'Test', type: 'Actor' })).not.toThrow();
  });

  it('create accepts all 10 FOLDER_DOCUMENT_TYPES including Compendium', () => {
    const types = ['Actor', 'Cards', 'Item', 'JournalEntry', 'Macro', 'Playlist', 'RollTable', 'Scene', 'Adventure', 'Compendium'];
    for (const t of types) {
      expect(() => FolderToolInput.parse({ action: 'create', name: 'X', type: t })).not.toThrow();
    }
  });

  it('update excludes type from changes schema', () => {
    // type is not in the changes object schema — strict() rejects unknown fields
    expect(() =>
      FolderToolInput.parse({ action: 'update', folderId: 'abc', changes: { type: 'Item' } }),
    ).toThrow();
  });

  it('delete requires confirm field', () => {
    expect(() =>
      FolderToolInput.parse({ action: 'delete', folderId: 'abc' }),
    ).toThrow(); // confirm is required
    expect(() =>
      FolderToolInput.parse({ action: 'delete', folderId: 'abc', confirm: true }),
    ).not.toThrow();
    expect(() =>
      FolderToolInput.parse({ action: 'delete', folderId: 'abc', confirm: false }),
    ).not.toThrow(); // confirm:false is valid (will return FOLDER_DELETE_NOT_CONFIRMED)
  });

  it('delete schema includes deleteContents and cascade with defaults', () => {
    const parsed = FolderDeleteInput.parse({ action: 'delete', folderId: 'abc', confirm: true });
    expect(parsed.deleteContents).toBe(false);
    expect(parsed.cascade).toBe(false);
  });

  it('list-contents schema defaults recursive to false', () => {
    const parsed = FolderToolInput.parse({ action: 'list-contents', folderId: 'abc' });
    if (parsed.action === 'list-contents') {
      expect(parsed.recursive).toBe(false);
    }
  });
});

// ── FolderTool action dispatch tests ─────────────────────────────────────────

describe('FolderTool create — happy path', () => {
  it('returns created folder ID', async () => {
    const tool = makeTool({
      folderId: 'new-folder-id',
      folder: { id: 'new-folder-id', name: 'Session NPCs', type: 'Actor', depth: 0, folder: null, color: null, description: '', sort: 0, sorting: 'a', flags: {} },
      requestedChanges: {},
    });
    const result = await tool.execute({ action: 'create', name: 'Session NPCs', type: 'Actor' });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('Folder Created');
    expect(text).toContain('new-folder-id');
  });
});

describe('FolderTool delete — confirm gate', () => {
  it('surfaces FOLDER_DELETE_NOT_CONFIRMED when handler rejects', async () => {
    const tool = makeTool(null, 'FOLDER_DELETE_NOT_CONFIRMED: pass confirm:true to proceed');
    const result = await tool.execute({ action: 'delete', folderId: 'abc', confirm: false });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('FOLDER_DELETE_NOT_CONFIRMED');
    expect((result as any).isError).toBe(true);
  });

  it('delete with confirm:true returns success', async () => {
    const tool = makeTool({ deletedId: 'abc', remainingCount: 5 });
    const result = await tool.execute({ action: 'delete', folderId: 'abc', confirm: true });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('Folder Deleted');
    expect(text).toContain('abc');
  });
});

describe('FolderTool delete — deleteContents branches', () => {
  it('deleteContents:true calls handler with deleteContents flag', async () => {
    const queries: any[] = [];
    const foundryClient: any = {
      query: vi.fn(async (_key: string, args: any) => {
        queries.push(args);
        return { deletedId: args.folderId, remainingCount: 0 };
      }),
    };
    const tool = new FolderTool({ foundryClient, logger: makeLogger() });
    await tool.execute({ action: 'delete', folderId: 'abc', confirm: true, deleteContents: true });
    expect(queries[0]).toMatchObject({ action: 'delete', confirm: true, deleteContents: true });
  });

  it('deleteContents:false un-parents (default)', async () => {
    const queries: any[] = [];
    const foundryClient: any = {
      query: vi.fn(async (_key: string, args: any) => {
        queries.push(args);
        return { deletedId: args.folderId, remainingCount: 1 };
      }),
    };
    const tool = new FolderTool({ foundryClient, logger: makeLogger() });
    await tool.execute({ action: 'delete', folderId: 'abc', confirm: true, deleteContents: false });
    expect(queries[0]).toMatchObject({ action: 'delete', confirm: true, deleteContents: false });
  });
});

describe('FolderTool update — type immutable', () => {
  it('schema rejects type in changes at parse time', () => {
    expect(() =>
      FolderToolInput.parse({ action: 'update', folderId: 'abc', changes: { type: 'Item' as any } }),
    ).toThrow();
  });

  it('surfaces FOLDER_TYPE_IMMUTABLE when handler rejects', async () => {
    const tool = makeTool(null, 'FOLDER_TYPE_IMMUTABLE: type cannot be changed');
    const result = await tool.execute({ action: 'update', folderId: 'abc', changes: { name: 'Renamed' } });
    expect((result as any).isError).toBe(true);
    expect((result as any).content[0].text).toContain('FOLDER_TYPE_IMMUTABLE');
  });
});

describe('FolderTool update — depth exceeded', () => {
  it('surfaces FOLDER_MAX_DEPTH_EXCEEDED when handler rejects', async () => {
    const tool = makeTool(null, 'FOLDER_MAX_DEPTH_EXCEEDED: re-parenting would put this folder at depth 5');
    const result = await tool.execute({ action: 'update', folderId: 'abc', changes: { folder: 'deep-parent-id' } });
    expect((result as any).isError).toBe(true);
    expect((result as any).content[0].text).toContain('FOLDER_MAX_DEPTH_EXCEEDED');
  });
});

describe('FolderTool list-contents', () => {
  it('shallow returns count and items', async () => {
    const tool = makeTool({
      folderId: 'abc',
      folderName: 'Session NPCs',
      recursive: false,
      count: 2,
      items: [
        { id: 'actor-1', name: 'Goblin', documentType: 'Actor', uuid: 'Actor.actor-1' },
        { id: 'actor-2', name: 'Bandit', documentType: 'Actor', uuid: 'Actor.actor-2' },
      ],
    });
    const result = await tool.execute({ action: 'list-contents', folderId: 'abc', recursive: false });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('Session NPCs');
    expect(text).toContain('shallow');
    expect(text).toContain('Total: 2');
  });

  it('recursive:true passes through to handler', async () => {
    const queries: any[] = [];
    const foundryClient: any = {
      query: vi.fn(async (_key: string, args: any) => {
        queries.push(args);
        return { folderId: 'abc', folderName: 'Root', recursive: true, count: 0, items: [] };
      }),
    };
    const tool = new FolderTool({ foundryClient, logger: makeLogger() });
    await tool.execute({ action: 'list-contents', folderId: 'abc', recursive: true });
    expect(queries[0]).toMatchObject({ recursive: true });
  });

  it('empty + recursive:false surfaces (shallow) mode tag (F03 regression)', async () => {
    const tool = makeTool({
      folderId: 'abc',
      folderName: 'EmptyFolder',
      recursive: false,
      count: 0,
      items: [],
    });
    const result = await tool.execute({ action: 'list-contents', folderId: 'abc', recursive: false });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('EmptyFolder');
    expect(text).toContain('(shallow)');
    expect(text).toContain('is empty');
  });

  it('empty + recursive:true surfaces (recursive) mode tag (F03 regression)', async () => {
    const tool = makeTool({
      folderId: 'abc',
      folderName: 'EmptyFolder',
      recursive: true,
      count: 0,
      items: [],
    });
    const result = await tool.execute({ action: 'list-contents', folderId: 'abc', recursive: true });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('(recursive)');
    expect(text).toContain('is empty');
  });
});

describe('FolderTool get — happy path', () => {
  it('formats folder view', async () => {
    const tool = makeTool({
      folder: { id: 'abc', name: 'Enemies', type: 'Actor', depth: 1, folder: 'parent-1', color: '#ff0000', description: '', sort: 0, sorting: 'a', flags: {} },
    });
    const result = await tool.execute({ action: 'get', folderId: 'abc' });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('Enemies');
    expect(text).toContain('Actor');
  });
});
