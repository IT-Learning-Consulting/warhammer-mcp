// Characterization snapshot — FolderTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.

import { describe, it, expect } from 'vitest';
import { FolderTool } from '../../tools/folder.js';
import { makeToolDeps } from '../test-utils.js';

const FOLDER_VIEW = {
  id: 'fld001',
  name: 'Session 12 NPCs',
  type: 'Actor',
  depth: 0,
  folder: null,
  color: '#ff0000',
  sort: 0,
  sorting: 'm',
  description: '',
};

const tool = (mockReturn: any) => new FolderTool(makeToolDeps(mockReturn));

describe('FolderTool — characterization', () => {
  it('create — folder created', async () => {
    const r = await tool({
      folderId: 'fld001',
      folder: FOLDER_VIEW,
      requestedChanges: { name: 'Session 12 NPCs', type: 'Actor' },
    }).execute({ action: 'create', name: 'Session 12 NPCs', type: 'Actor' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update — changed fields + view', async () => {
    const r = await tool({
      folderId: 'fld001',
      folder: { ...FOLDER_VIEW, color: '#00ff00' },
      requestedChanges: { color: '#00ff00' },
      changedFields: ['color'],
    }).execute({ action: 'update', folderId: 'fld001', changes: { color: '#00ff00' } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete — folder removed', async () => {
    const r = await tool({ deletedId: 'fld001', remainingCount: 5 }).execute({ action: 'delete', folderId: 'fld001', confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — folder view', async () => {
    const r = await tool({ folder: FOLDER_VIEW }).execute({ action: 'get', folderId: 'fld001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — bare list with items', async () => {
    const r = await tool({
      items: [
        { id: 'fld001', name: 'Session 12 NPCs', type: 'Actor', depth: 0, color: '#ff0000' },
        { id: 'fld002', name: 'Session 13 NPCs', type: 'Actor', depth: 0, color: null },
      ],
      total: 2,
    }).execute({ action: 'list', typeFilter: 'Actor' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — countOnly', async () => {
    const r = await tool({ total: 12, filterApplied: null }).execute({ action: 'list', countOnly: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — paginated shape', async () => {
    const r = await tool({
      items: [{ id: 'fld001', name: 'Session 12 NPCs', type: 'Actor', depth: 0, color: null }],
      total: 5,
      page: 1,
      pageSize: 2,
      pageCount: 3,
    }).execute({ action: 'list', page: 1, pageSize: 2 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — empty', async () => {
    const r = await tool({ items: [] }).execute({ action: 'list' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-contents — shallow folder contents', async () => {
    const r = await tool({
      folderId: 'fld001',
      folderName: 'Session 12 NPCs',
      recursive: false,
      count: 2,
      items: [
        { id: 'act001', name: 'Hans Mauer', documentType: 'Actor', uuid: 'Actor.act001' },
        { id: 'act002', name: 'Gertrude Schmidt', documentType: 'Actor', uuid: 'Actor.act002' },
      ],
    }).execute({ action: 'list-contents', folderId: 'fld001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-contents — empty folder', async () => {
    const r = await tool({
      folderId: 'fld001',
      folderName: 'Empty Folder',
      recursive: false,
      count: 0,
      items: [],
    }).execute({ action: 'list-contents', folderId: 'fld001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
