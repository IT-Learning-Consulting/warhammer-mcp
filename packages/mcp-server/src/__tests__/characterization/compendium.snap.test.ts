// Characterization snapshot — CompendiumUmbrellaTools return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: create-pack, update-pack, read-pack, add-document-to-pack,
//         update-document-in-pack, read-document-from-pack,
//         create-folder-in-pack, list-folders-in-pack, update-folder-in-pack,
//         delete-folder-in-pack

import { describe, it, expect } from 'vitest';
import { CompendiumUmbrellaTools } from '../../tools/compendium-umbrella.js';
import { makeToolDeps } from '../test-utils.js';

const PACK_META = {
  id: 'world.homebrew-weapons',
  name: 'homebrew-weapons',
  label: 'Homebrew Weapons',
  type: 'Item',
  system: 'wfrp4e',
  packageType: 'world',
  packageName: 'adventures-in-the-warhammer-world',
  path: null,
  locked: false,
  folder: null,
  sort: 0,
};

const tool = (mockReturn: any) => new CompendiumUmbrellaTools(makeToolDeps(mockReturn));

describe('CompendiumUmbrellaTools — characterization', () => {
  it('create-pack — world scope', async () => {
    const r = await tool({
      packId: 'world.homebrew-weapons',
      metadata: PACK_META,
      entryCount: 0,
      ownership: { default: 0 },
    }).execute({ action: 'create-pack', name: 'homebrew-weapons', label: 'Homebrew Weapons', type: 'Item' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update-pack — locked flag', async () => {
    const r = await tool({
      packId: 'world.homebrew-weapons',
      changedFields: ['locked'],
      metadata: { ...PACK_META, locked: true },
    }).execute({ action: 'update-pack', packId: 'world.homebrew-weapons', changes: { locked: true } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('read-pack — paginated entry list', async () => {
    const r = await tool({
      packId: 'wfrp4e-core.actors',
      metadata: { ...PACK_META, id: 'wfrp4e-core.actors', label: 'WFRP4e Core Actors', type: 'Actor' },
      totalEntries: 2,
      page: 1,
      pageSize: 100,
      pageCount: 1,
      entries: [
        { id: 'ent001', name: 'Goblin', type: 'npc', img: null, uuid: 'Compendium.wfrp4e-core.actors.Actor.ent001', folder: null },
        { id: 'ent002', name: 'Rat', type: 'npc', img: null, uuid: 'Compendium.wfrp4e-core.actors.Actor.ent002', folder: 'fld001' },
      ],
      folders: [
        { id: 'fld001', name: 'Vermin', color: '#550000', sort: 10, folder: null, depth: 1 },
      ],
    }).execute({ action: 'read-pack', packId: 'wfrp4e-core.actors' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('add-document-to-pack — uuid source', async () => {
    const r = await tool({
      packId: 'world.homebrew-weapons',
      documentId: 'doc001',
      documentUuid: 'Compendium.world.homebrew-weapons.Item.doc001',
      name: 'Iron Sword',
      type: 'Item',
      entryCount: 1,
      warnings: [],
    }).execute({
      action: 'add-document-to-pack',
      packId: 'world.homebrew-weapons',
      source: { kind: 'uuid', uuid: 'Item.srcabc' },
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update-document-in-pack — rename', async () => {
    const r = await tool({
      packId: 'world.homebrew-weapons',
      documentId: 'doc001',
      documentUuid: 'Compendium.world.homebrew-weapons.Item.doc001',
      changedFields: ['name'],
    }).execute({
      action: 'update-document-in-pack',
      packId: 'world.homebrew-weapons',
      documentId: 'doc001',
      changes: { name: 'Renamed Sword' },
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('read-document-from-pack — full data', async () => {
    const r = await tool({
      packId: 'wfrp4e-core.actors',
      documentId: 'ent001',
      documentUuid: 'Compendium.wfrp4e-core.actors.Actor.ent001',
      data: { _id: 'ent001', name: 'Goblin', type: 'npc', system: {} },
    }).execute({ action: 'read-document-from-pack', packId: 'wfrp4e-core.actors', documentId: 'ent001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('create-folder-in-pack — root level', async () => {
    const r = await tool({
      packId: 'world.homebrew-weapons',
      folderId: 'fld001',
      name: 'Common',
      uuid: 'Compendium.world.homebrew-weapons.Folder.fld001',
      depth: 1,
    }).execute({ action: 'create-folder-in-pack', packId: 'world.homebrew-weapons', folderName: 'Common' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-folders-in-pack — multiple folders', async () => {
    const r = await tool({
      packId: 'world.homebrew-weapons',
      folders: [
        { id: 'fld001', name: 'Common', color: null, sort: 0, folder: null, depth: 1 },
        { id: 'fld002', name: 'Rare', color: '#aa0000', sort: 10, folder: 'fld001', depth: 2 },
      ],
    }).execute({ action: 'list-folders-in-pack', packId: 'world.homebrew-weapons' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update-folder-in-pack — rename', async () => {
    const r = await tool({
      packId: 'world.homebrew-weapons',
      folderId: 'fld001',
      changedFields: ['name'],
    }).execute({
      action: 'update-folder-in-pack',
      packId: 'world.homebrew-weapons',
      folderId: 'fld001',
      changes: { folderName: 'Standard' },
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete-folder-in-pack — unparent contents', async () => {
    const r = await tool({
      packId: 'world.homebrew-weapons',
      folderId: 'fld001',
      deletedFolderIds: ['fld001'],
      unParentedDocs: 3,
      deletedDocs: 0,
    }).execute({
      action: 'delete-folder-in-pack',
      packId: 'world.homebrew-weapons',
      folderId: 'fld001',
      confirm: true,
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
