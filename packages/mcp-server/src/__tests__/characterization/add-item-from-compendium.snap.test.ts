// Characterization snapshot — AddItemFromCompendiumTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// AddItemFromCompendiumTool.handle() passes the query result through verbatim (no content wrapper).

import { describe, it, expect } from 'vitest';
import { AddItemFromCompendiumTool } from '../../tools/add-item-from-compendium.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new AddItemFromCompendiumTool(makeToolDeps(mockReturn));

describe('AddItemFromCompendiumTool — characterization', () => {
  it('add item by itemUuid — raw passthrough', async () => {
    const r = await tool({
      embedded: true,
      itemId: 'item-new-001',
      itemName: 'Longsword',
      actorId: 'actor-001',
    }).handle({
      actorId: 'actor-001',
      itemUuid: 'Compendium.wfrp4e-core.items.Item.sgBDLL1iLenHJ5um',
    });
    expect(r).toMatchSnapshot();
  });

  it('add specialisation skill with skipSpecialisationChoice — raw passthrough', async () => {
    const r = await tool({
      embedded: true,
      itemId: 'item-new-002',
      itemName: 'Lore (Beasts)',
      actorId: 'actor-002',
    }).handle({
      actorId: 'actor-002',
      itemUuid: 'Compendium.wfrp4e-core.items.Item.loreBeasts001',
      skipSpecialisationChoice: true,
    });
    expect(r).toMatchSnapshot();
  });
});
