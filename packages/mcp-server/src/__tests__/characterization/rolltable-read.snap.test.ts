// Characterization snapshot — RollTableTool read actions return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Split: read (list, get, roll, draw-many).

import { describe, it, expect } from 'vitest';
import { RollTableTool } from '../../tools/rolltable.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new RollTableTool(makeToolDeps(mockReturn));

describe('RollTableTool — characterization (read)', () => {
  it('list — tables in world', async () => {
    const r = await tool([
      { id: 'tbl001', name: 'Random Encounters', formula: '1d20', results: [{ text: 'Wolves' }, { text: 'Goblins' }] },
      { id: 'tbl002', name: 'Critical Hits', formula: '1d100', results: [] },
    ]).execute({ action: 'list' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — empty world', async () => {
    const r = await tool([]).execute({ action: 'list' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — table details with ranged results', async () => {
    const r = await tool({
      id: 'tbl001',
      name: 'Random Encounters',
      formula: '1d20',
      description: 'Roll for a random encounter.',
      results: [
        { id: 'r1', text: 'Wolves', type: 'text', range: [1, 10], weight: 1, documentUuid: '' },
        { id: 'r2', text: 'Goblin warband', type: 'text', range: [11, 20], weight: 1, documentUuid: '' },
      ],
    }).execute({ action: 'get', tableId: 'tbl001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('roll — table result', async () => {
    const r = await tool({
      tableName: 'Random Encounters',
      roll: 7,
      text: 'Wolves',
      result: 'Wolves',
    }).execute({ action: 'roll', tableId: 'tbl001', rollMode: 'public' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('draw-many — multiple results', async () => {
    const r = await tool({
      tableName: 'Random Encounters',
      roll: 14,
      results: [
        { id: 'r1', text: 'Wolves', type: 'text', documentUuid: '', name: '', img: '', description: '', range: [1, 10], weight: 1, drawn: true },
        { id: 'r2', text: 'Goblin warband', type: 'text', documentUuid: '', name: '', img: '', description: '', range: [11, 20], weight: 1, drawn: true },
      ],
      exhausted: false,
      requested: 2,
      returned: 2,
    }).execute({ action: 'draw-many', tableId: 'tbl001', number: 2 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('draw-many — pool exhausted', async () => {
    const r = await tool({
      tableName: 'Random Encounters',
      roll: 5,
      results: [
        { id: 'r1', text: 'Wolves', type: 'text', documentUuid: '', name: '', img: '', description: '', range: [1, 10], weight: 1, drawn: true },
      ],
      exhausted: true,
      requested: 3,
      returned: 1,
    }).execute({ action: 'draw-many', tableId: 'tbl001', number: 3 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
