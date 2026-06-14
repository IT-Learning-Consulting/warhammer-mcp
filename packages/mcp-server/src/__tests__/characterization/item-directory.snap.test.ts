// Characterization snapshot — ItemDirectoryTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// ItemDirectoryTool.execute() returns { content: [{ type, text }] } for all 5 actions.

import { describe, it, expect } from 'vitest';
import { ItemDirectoryTool } from '../../tools/item-directory.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ItemDirectoryTool(makeToolDeps(mockReturn));

describe('ItemDirectoryTool — characterization', () => {
  it('list — world items page view', async () => {
    const r = await tool({
      items: [
        { id: 'item-001', name: 'Longsword', type: 'weapon', img: 'icons/weapons/sword.png', folderId: null, system: {}, flags: {} },
        { id: 'item-002', name: 'Mail Coat', type: 'armour', img: null, folderId: 'folder-01', system: {}, flags: {} },
      ],
      total: 2,
      page: 1,
      pageSize: 100,
      typeFilter: null,
      folderId: null,
    }).execute({ action: 'list' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — filtered by type', async () => {
    const r = await tool({
      items: [
        { id: 'item-001', name: 'Longsword', type: 'weapon', img: null, folderId: null, system: {}, flags: {} },
      ],
      total: 1,
      page: 1,
      pageSize: 100,
      typeFilter: 'weapon',
      folderId: null,
    }).execute({ action: 'list', typeFilter: 'weapon' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — full serialized world item', async () => {
    const r = await tool({
      id: 'item-001',
      name: 'Longsword',
      type: 'weapon',
      img: 'icons/weapons/sword.png',
      folderId: null,
      system: { damage: { value: 'SB+4' }, reach: { value: 'average' } },
      flags: {},
    }).execute({ action: 'get', itemId: 'item-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('search — name substring results', async () => {
    const r = await tool({
      items: [
        { id: 'item-003', name: 'Healing Draught', type: 'trapping', img: null, folderId: null, system: {}, flags: {} },
      ],
      total: 1,
      query: 'Healing',
    }).execute({ action: 'search', query: 'Healing' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('duplicate — cloned item summary', async () => {
    const r = await tool({
      id: 'item-clone-001',
      name: 'My Custom Longsword',
      type: 'weapon',
      sourceId: 'item-001',
      img: 'icons/weapons/sword.png',
      folderId: null,
    }).execute({ action: 'duplicate', itemId: 'item-001', newName: 'My Custom Longsword' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('import-from-compendium — imported item with preserved id', async () => {
    const r = await tool({
      id: 'gxdjLQoQUTYgD6fm',
      name: 'Hand Weapon',
      type: 'weapon',
      packId: 'wfrp4e-core.items',
      compendiumItemId: 'gxdjLQoQUTYgD6fm',
      idMatchesCompendium: true,
      img: null,
      folderId: null,
    }).execute({ action: 'import-from-compendium', packId: 'wfrp4e-core.items', itemId: 'gxdjLQoQUTYgD6fm' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
