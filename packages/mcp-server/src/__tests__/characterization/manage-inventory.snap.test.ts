// Characterization snapshot — ManageInventoryTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// ManageInventoryTool.handle() returns formatted strings for all 5 actions.
// Multi-query actions (remove-item, track-ammunition) use a function mockReturn
// keyed on the query name to return different canned responses per call.

import { describe, it, expect } from 'vitest';
import { ManageInventoryTool } from '../../tools/manage-inventory.js';
import { makeToolDeps } from '../test-utils.js';

const CHARACTER_FIXTURE = {
  id: 'actor-001',
  name: 'Hans Müller',
  system: {
    characteristics: {
      s: { value: 35 },
      t: { value: 30 },
    },
    status: {
      encumbrance: { value: 4 },
      money: { gc: 2, ss: 5, bp: 12 },
    },
  },
  items: [
    { id: 'item-w01', name: 'Longsword', type: 'weapon', system: { quantity: { value: 1 } } },
    { id: 'item-a01', name: 'Mail Coat', type: 'armour', system: { quantity: { value: 1 } } },
    { id: 'item-t01', name: 'Rope', type: 'trapping', system: { quantity: { value: 1 } } },
    {
      id: 'item-am01',
      name: 'Arrows',
      type: 'ammunition',
      system: { quantity: { value: 3 } },
    },
  ],
};

const tool = (mockReturn: any) => new ManageInventoryTool(makeToolDeps(mockReturn));

describe('ManageInventoryTool — characterization', () => {
  it('get-status — formatted inventory report', async () => {
    const r = await tool(CHARACTER_FIXTURE).handle({
      action: 'get-status',
      characterName: 'Hans Müller',
    });
    expect(r).toMatchSnapshot();
  });

  it('check-encumbrance — formatted encumbrance report (normal capacity)', async () => {
    const r = await tool(CHARACTER_FIXTURE).handle({
      action: 'check-encumbrance',
      characterName: 'Hans Müller',
    });
    expect(r).toMatchSnapshot();
  });

  it('check-encumbrance — formatted report (over encumbered)', async () => {
    const overEncumbered = {
      ...CHARACTER_FIXTURE,
      system: {
        ...CHARACTER_FIXTURE.system,
        characteristics: { s: { value: 20 }, t: { value: 20 } },
        status: { ...CHARACTER_FIXTURE.system.status, encumbrance: { value: 10 } },
      },
    };
    const r = await tool(overEncumbered).handle({
      action: 'check-encumbrance',
      characterName: 'Hans Müller',
    });
    expect(r).toMatchSnapshot();
  });

  it('remove-item (full removal) — formatted confirmation string', async () => {
    // remove-item calls getCharacterInfo then deleteItem — use function mockReturn
    const mockFn = (key: string, _args: any) => {
      if (key === 'warhammer-mcp.getCharacterInfo') return CHARACTER_FIXTURE;
      if (key === 'warhammer-mcp.deleteItem') return { deleted: true };
      return null;
    };
    const r = await tool(mockFn).handle({
      action: 'remove-item',
      characterName: 'Hans Müller',
      itemName: 'Rope',
    });
    expect(r).toMatchSnapshot();
  });

  it('track-ammunition (shots fired) — formatted confirmation string', async () => {
    // track-ammunition calls getCharacterInfo then updateItem
    const mockFn = (key: string, _args: any) => {
      if (key === 'warhammer-mcp.getCharacterInfo') return CHARACTER_FIXTURE;
      if (key === 'warhammer-mcp.updateItem') return { updated: true };
      return null;
    };
    const r = await tool(mockFn).handle({
      action: 'track-ammunition',
      characterName: 'Hans Müller',
      ammunitionType: 'Arrows',
      amount: -1,
    });
    expect(r).toMatchSnapshot();
  });
});
