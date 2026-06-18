// Characterization snapshot — CreateCustomItemTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// CreateCustomItemTool.handle() returns { content: [{ type, text }], structuredContent }.
// Snapshot content[0].text (prose) and structuredContent separately to lock both shapes.

import { describe, it, expect } from 'vitest';
import { CreateCustomItemTool } from '../../tools/create-custom-item.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new CreateCustomItemTool(makeToolDeps(mockReturn));

describe('CreateCustomItemTool — characterization', () => {
  it('create weapon at world scope — prose + structured lock', async () => {
    const r = await tool({
      success: true,
      itemId: 'item-new-001',
      itemName: 'Fire Sword',
      itemType: 'weapon',
      scope: 'world',
      folderId: 'folder-001',
      folderPath: ['Homebrew', 'Weapons'],
      operationId: 'op-cci-001', createdDocumentIds: ['item-new-001'], updatedDocumentIds: [], deletedDocumentIds: [], warnings: [],
    }).handle({
      itemType: 'weapon',
      name: 'Fire Sword',
      destination: { type: 'world', folder: ['Homebrew', 'Weapons'] },
    });
    expect((r as any).content[0].text).toMatchSnapshot();
    expect((r as any).structuredContent).toMatchSnapshot();
  });

  it('create spell on actor scope — prose + structured lock', async () => {
    const r = await tool({
      success: true,
      itemId: 'item-new-002',
      itemName: 'Firebolt',
      itemType: 'spell',
      scope: 'actor',
      actorId: 'actor-001',
      actorName: 'Hans',
      operationId: 'op-cci-002', createdDocumentIds: ['item-new-002'], updatedDocumentIds: [], deletedDocumentIds: [], warnings: [],
    }).handle({
      itemType: 'spell',
      name: 'Firebolt',
      destination: { type: 'actor', actorName: 'Hans' },
    });
    expect((r as any).content[0].text).toMatchSnapshot();
    expect((r as any).structuredContent).toMatchSnapshot();
  });

  it('create prayer (miracle type) at world scope — prose + structured lock', async () => {
    const r = await tool({
      success: true,
      itemId: 'item-new-003',
      itemName: "Sigmar's Fiery Hammer",
      itemType: 'prayer',
      scope: 'world',
      folderId: null,
      folderPath: [],
      operationId: 'op-cci-003', createdDocumentIds: ['item-new-003'], updatedDocumentIds: [], deletedDocumentIds: [], warnings: [],
    }).handle({
      itemType: 'prayer',
      name: "Sigmar's Fiery Hammer",
      type: 'miracle',
      destination: { type: 'world' },
    });
    expect((r as any).content[0].text).toMatchSnapshot();
    expect((r as any).structuredContent).toMatchSnapshot();
  });
});
