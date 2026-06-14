// Characterization snapshot — UpdateItemTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// UpdateItemTool.handle() passes the query result through verbatim (no content wrapper).

import { describe, it, expect } from 'vitest';
import { UpdateItemTool } from '../../tools/update-item.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new UpdateItemTool(makeToolDeps(mockReturn));

describe('UpdateItemTool — characterization', () => {
  it('update actor-embedded skill advances by actorId + itemId', async () => {
    const r = await tool({
      updated: true,
      itemId: 'item-skill-001',
      actorId: 'actor-abc',
      verified: true,
    }).handle({
      actorId: 'actor-abc',
      itemId: 'item-skill-001',
      updateData: { 'system.advances.value': 5 },
    });
    expect(r).toMatchSnapshot();
  });

  it('update world-scope item by name — raw passthrough', async () => {
    const r = await tool({
      updated: true,
      itemId: 'item-world-002',
      itemName: 'Longsword',
      verified: false,
    }).handle({
      destination: { type: 'world' },
      itemName: 'Longsword',
      updateData: { 'system.damage.value': 'SB+4' },
    });
    expect(r).toMatchSnapshot();
  });
});
