// Characterization snapshot — TradeItemTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Phase 12 R12.2: TradeItemTool.handle() now returns a content envelope { content, structuredContent }
// (was a bare string) so the operation receipt reaches the client.

import { describe, it, expect } from 'vitest';
import { TradeItemTool } from '../../tools/trade-item.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new TradeItemTool(makeToolDeps(mockReturn));

describe('TradeItemTool — characterization', () => {
  it('full item transfer — formatted string with quantity breakdown', async () => {
    const r = await tool({
      itemName: 'Longsword',
      fromActorId: 'actor-from',
      toActorId: 'actor-to',
      quantities: { from: 0, to: 1 },
      // Phase 12 R12.2: full transfer — dest item created, source item deleted.
      operationId: 'op-ti-full', createdDocumentIds: ['item-001'], updatedDocumentIds: [], deletedDocumentIds: ['item-src-001'], warnings: [],
    }).handle({
      fromActorId: 'actor-from',
      toActorId: 'actor-to',
      itemId: 'item-001',
    });
    expect(r).toMatchSnapshot();
  });

  it('partial quantity transfer — formatted string with remaining quantity', async () => {
    const r = await tool({
      itemName: 'Arrows',
      fromActorId: 'actor-from',
      toActorId: 'actor-to',
      quantities: { from: 5, to: 10 },
      // Phase 12 R12.2: partial transfer — dest item created, source item quantity updated.
      operationId: 'op-ti-partial', createdDocumentIds: ['item-002'], updatedDocumentIds: ['item-src-002'], deletedDocumentIds: [], warnings: [],
    }).handle({
      fromActorId: 'actor-from',
      toActorId: 'actor-to',
      itemId: 'item-002',
      quantity: 10,
    });
    expect(r).toMatchSnapshot();
  });
});
