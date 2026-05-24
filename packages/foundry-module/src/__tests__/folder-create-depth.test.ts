import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFolder } from '../handlers/folder.js';

describe('folder.create depth guard (BUG-155)', () => {
  beforeEach(() => {
    (globalThis as any).CONST = { FOLDER_MAX_DEPTH: 4 };
    (globalThis as any).game.user = { isGM: true };
  });

  it('returns FOLDER_MAX_DEPTH_EXCEEDED before calling Folder.create', async () => {
    const parentDeep = { id: 'parent-deep', depth: 4 };
    const created = new Map<string, any>();
    const get = (id: string) => (id === 'parent-deep' ? parentDeep : created.get(id));
    (globalThis as any).game.folders = { get };

    const createSpy = vi.fn();
    (globalThis as any).Folder = { create: createSpy };

    const result = await createFolder({
      action: 'create',
      name: 'Too Deep',
      type: 'Actor',
      folder: 'parent-deep',
    });

    expect(result.success).toBe(false);
    expect(String((result as any).error)).toContain('FOLDER_MAX_DEPTH_EXCEEDED');
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('allows create when parent depth does not exceed the max', async () => {
    const parentOk = { id: 'parent-ok', depth: 3 };
    const created = new Map<string, any>();
    const get = (id: string) => (id === 'parent-ok' ? parentOk : created.get(id));
    (globalThis as any).game.folders = { get };

    const createSpy = vi.fn(async (payload: any) => {
      const doc = {
        id: 'new-folder-id',
        name: payload.name,
        depth: 4,
        _source: {
          name: payload.name,
          type: payload.type,
          color: null,
          description: '',
          folder: payload.folder ?? null,
          sort: 0,
          sorting: 'a',
          flags: {},
        },
      };
      created.set(doc.id, doc);
      return doc;
    });
    (globalThis as any).Folder = { create: createSpy };

    const result = await createFolder({
      action: 'create',
      name: 'Depth Four',
      type: 'Actor',
      folder: 'parent-ok',
    });

    expect(result.success).toBe(true);
    expect(createSpy).toHaveBeenCalledOnce();
  });
});
