// Characterization snapshot — RollTableTool write actions return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Split: write (create, delete, update, add-results, update-results, delete-results, normalize, reset, import-from-compendium).

import { describe, it, expect } from 'vitest';
import { RollTableTool } from '../../tools/rolltable.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new RollTableTool(makeToolDeps(mockReturn));

describe('RollTableTool — characterization (write)', () => {
  it('create — table created', async () => {
    const r = await tool({ id: 'tbl001' }).execute({
      action: 'create',
      name: 'Random Encounters',
      formula: '1d20',
      results: [{ type: 'text', text: 'Wolves' }],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete — confirm required guard fires', async () => {
    // Test the confirm-guard branch (no query call made).
    const r = await tool(null).execute({ action: 'delete', tableId: 'tbl001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete — confirmed delete', async () => {
    const r = await tool({}).execute({ action: 'delete', tableId: 'tbl001', confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update — fields changed', async () => {
    const r = await tool({
      tableId: 'tbl001',
      changes: { name: 'Renamed Encounters', formula: '1d100' },
    }).execute({ action: 'update', tableId: 'tbl001', changes: { name: 'Renamed Encounters', formula: '1d100' } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('add-results — results appended', async () => {
    const r = await tool({ tableId: 'tbl001', addedCount: 2 }).execute({
      action: 'add-results',
      tableId: 'tbl001',
      results: [{ type: 'text', text: 'Beastmen' }, { type: 'text', text: 'Chaos Warriors' }],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update-results — results updated', async () => {
    const r = await tool({ tableId: 'tbl001', updatedCount: 1 }).execute({
      action: 'update-results',
      tableId: 'tbl001',
      updates: [{ _id: 'r1', drawn: false }],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete-results — results removed', async () => {
    const r = await tool({ tableId: 'tbl001', deletedCount: 2 }).execute({
      action: 'delete-results',
      tableId: 'tbl001',
      resultIds: ['r1', 'r2'],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('normalize — ranges recalculated', async () => {
    const r = await tool({ tableId: 'tbl001', resultCount: 5 }).execute({ action: 'normalize', tableId: 'tbl001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('reset — drawn flags cleared', async () => {
    const r = await tool({ tableId: 'tbl001', resultCount: 5 }).execute({ action: 'reset', tableId: 'tbl001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('import-from-compendium — table imported', async () => {
    const r = await tool({ newTableId: 'tbl999', name: 'Warpstone Events', normalized: true }).execute({
      action: 'import-from-compendium',
      pack: 'wfrp4e-core.tables',
      documentId: 'docXYZ',
      normalize: true,
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
