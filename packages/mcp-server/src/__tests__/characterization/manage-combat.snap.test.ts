// Characterization snapshot — ManageCombatTools return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// All ManageCombatTools handlers return the raw query result (no content wrapper),
// except handleListCombatants which adds a {combatId, combatants} envelope when
// the Foundry handler returns a bare array.

import { describe, it, expect } from 'vitest';
import { ManageCombatTools } from '../../tools/manage-combat.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ManageCombatTools(makeToolDeps(mockReturn));

const COMBAT_STATE = {
  id: 'combat12345678901',
  round: 2,
  turn: 1,
  started: true,
  active: true,
  combatants: [
    { id: 'comb001', name: 'Aldric', initiative: 35, defeated: false, hidden: false },
    { id: 'comb002', name: 'Goblin Snag', initiative: 12, defeated: false, hidden: false },
  ],
};

const COMBATANT_LIST = [
  { id: 'comb001', actorId: 'actor001', tokenId: 'token001', name: 'Aldric', initiative: 35, defeated: false, hidden: false },
  { id: 'comb002', actorId: 'actor002', tokenId: 'token002', name: 'Goblin Snag', initiative: 12, defeated: false, hidden: false },
];

describe('ManageCombatTools — characterization', () => {
  it('get-combat — active combat state', async () => {
    const r = await tool(COMBAT_STATE).handleGetCombat({});
    expect(r).toMatchSnapshot();
  });

  it('get-combat — no active combat (null)', async () => {
    const r = await tool(null).handleGetCombat({});
    expect(r).toMatchSnapshot();
  });

  it('list-combatants — envelope wrapping (array from Foundry)', async () => {
    // When query returns an array, handleListCombatants wraps it with {combatId, combatants}
    // and calls getCombat for the combatId. Both queries return from the same mock.
    // Use function form: getCombat returns COMBAT_STATE, listCombatants returns array.
    const r = await tool((key: string) => {
      if (key === 'warhammer-mcp.listCombatants') return COMBATANT_LIST;
      return COMBAT_STATE; // getCombat
    }).handleListCombatants({});
    expect(r).toMatchSnapshot();
  });

  it('list-combatants — object passthrough (already wrapped)', async () => {
    const r = await tool({
      combatId: 'combat12345678901',
      combatants: COMBATANT_LIST,
    }).handleListCombatants({});
    expect(r).toMatchSnapshot();
  });

  it('advance-combat — next turn', async () => {
    const r = await tool({ round: 2, turn: 2, currentCombatantId: 'comb002' }).handleAdvanceCombat({
      action: 'next',
    });
    expect(r).toMatchSnapshot();
  });

  it('advance-combat — rollNPC initiative', async () => {
    const r = await tool({ rolled: ['comb002'], round: 1 }).handleAdvanceCombat({
      action: 'rollNPC',
    });
    expect(r).toMatchSnapshot();
  });

  it('add-combatants — two actors added', async () => {
    const r = await tool({
      added: ['comb001', 'comb002'],
      combatId: 'combat12345678901',
    }).handleAddCombatants({
      actorIds: ['actor001', 'actor002'],
    });
    expect(r).toMatchSnapshot();
  });

  it('remove-combatants — one combatant removed', async () => {
    const r = await tool({
      removed: ['comb002'],
      combatId: 'combat12345678901',
    }).handleRemoveCombatants({
      combatantIds: ['comb002'],
    });
    expect(r).toMatchSnapshot();
  });

  it('end-combat — combat deleted', async () => {
    const r = await tool({
      ended: 'combat12345678901',
    }).handleEndCombat({});
    expect(r).toMatchSnapshot();
  });
});
