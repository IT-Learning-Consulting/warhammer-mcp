// Characterization snapshot — DocumentIoTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.

import { describe, it, expect } from 'vitest';
import { DocumentIoTool } from '../../tools/document-io.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new DocumentIoTool(makeToolDeps(mockReturn));

const ACTOR_PAYLOAD = {
  _id: 'oldActor1',
  name: 'Hans Mauer',
  type: 'character',
  system: { characteristics: {} },
  items: [],
  effects: [],
};

describe('DocumentIoTool — characterization', () => {
  it('export — full toObject JSON output', async () => {
    const r = await tool({
      success: true,
      documentType: 'Actor',
      id: 'oldActor1',
      data: ACTOR_PAYLOAD,
    }).execute({ action: 'export', documentType: 'Actor', id: 'oldActor1' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('preview — in-memory analysis', async () => {
    const r = await tool({
      success: true,
      documentType: 'Actor',
      name: 'Hans Mauer',
      embeddedCounts: { items: 3, effects: 0 },
      hasFolder: false,
      hasOwnership: false,
      uuidLinkCount: 0,
      warnings: [],
    }).execute({ action: 'preview', documentType: 'Actor', data: ACTOR_PAYLOAD });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('preview — with warnings and uuid links', async () => {
    const r = await tool({
      success: true,
      documentType: 'JournalEntry',
      name: 'Quest: Find the Witch Hunter',
      embeddedCounts: { pages: 2, categories: 1 },
      hasFolder: true,
      hasOwnership: true,
      uuidLinkCount: 5,
      warnings: ['@UUID links found — will need re-linking after import.'],
    }).execute({ action: 'preview', documentType: 'JournalEntry', data: { _id: 'jrn001', name: 'Quest: Find the Witch Hunter', pages: [] } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('import-as-new — clone created with id map', async () => {
    const r = await tool({
      success: true,
      documentType: 'Actor',
      newId: 'newActor2',
      oldId: 'oldActor1',
      idMap: { oldActor1: 'newActor2', 'item-a': 'item-b' },
      warnings: [],
    }).execute({ action: 'import-as-new', documentType: 'Actor', data: ACTOR_PAYLOAD, confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('import-as-new — with warnings', async () => {
    const r = await tool({
      success: true,
      documentType: 'Scene',
      newId: 'newScene9',
      oldId: 'oldScene1',
      idMap: { oldScene1: 'newScene9' },
      warnings: ['@UUID[JournalEntry.jrn001] links reference old id — re-link manually.'],
    }).execute({ action: 'import-as-new', documentType: 'Scene', data: { _id: 'oldScene1', name: 'Bögenhafen' }, confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
