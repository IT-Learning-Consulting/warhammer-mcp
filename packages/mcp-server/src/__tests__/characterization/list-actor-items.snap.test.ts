// Characterization snapshot — ListActorItemsTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// ListActorItemsTool.handle() passes the query result through verbatim (no content wrapper).

import { describe, it, expect } from 'vitest';
import { ListActorItemsTool } from '../../tools/list-actor-items.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ListActorItemsTool(makeToolDeps(mockReturn));

describe('ListActorItemsTool — characterization', () => {
  it('list all items — raw passthrough', async () => {
    const r = await tool({
      total: 3,
      items: [
        { id: 'item-001', name: 'Longsword', type: 'weapon', system: { advances: { value: 0 } } },
        { id: 'item-002', name: 'Athletics', type: 'skill', system: { advances: { value: 5 } } },
        { id: 'item-003', name: 'Strike Mighty Blow', type: 'talent', system: { advances: { value: 1 } } },
      ],
    }).handle({ actorId: 'actor-001' });
    expect(r).toMatchSnapshot();
  });

  it('list items filtered by type — raw passthrough', async () => {
    const r = await tool({
      total: 1,
      items: [
        { id: 'item-002', name: 'Athletics', type: 'skill', system: { advances: { value: 5 } } },
      ],
    }).handle({ actorId: 'actor-001', typeFilter: 'skill' });
    expect(r).toMatchSnapshot();
  });
});
