// Characterization snapshot — DeleteItemTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2. Locks the raw handler
// return so any format change produces a clear snapshot diff (regression net for Phases 1-14).
// DeleteItemTool.handle() passes the query result through verbatim (no content wrapper).

import { describe, it, expect } from 'vitest';
import { DeleteItemTool } from '../../tools/delete-item.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new DeleteItemTool(makeToolDeps(mockReturn));

describe('DeleteItemTool — characterization', () => {
  it('delete actor-embedded item by id — raw passthrough', async () => {
    const r = await tool({
      deleted: true,
      itemId: 'item-abc123',
      actorId: 'actor-xyz789',
    }).handle({ actorId: 'actor-xyz789', itemId: 'item-abc123' });
    expect(r).toMatchSnapshot();
  });

  it('delete world-scope item by name — raw passthrough', async () => {
    const r = await tool({
      deleted: true,
      itemId: 'item-world-001',
      itemName: 'Old Sword',
    }).handle({ destination: { type: 'world' }, itemName: 'Old Sword' });
    expect(r).toMatchSnapshot();
  });
});
