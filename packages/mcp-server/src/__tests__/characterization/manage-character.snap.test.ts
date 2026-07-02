// Characterization snapshot — ManageCharacterTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// ManageCharacterTool.handle() returns a formatted string for all 5 actions.
// Multi-query actions (update-stats, update-skill-talent, add-skill-talent, add-xp-log)
// use the function form of mockReturn to vary the response by query key.

import { describe, it, expect } from 'vitest';
import { ManageCharacterTool } from '../../tools/manage-character.js';
import { makeToolDeps } from '../test-utils.js';

/** Minimal character stub returned by getCharacterInfo. */
const CHAR_STUB = {
  id: 'char001234567890',
  name: 'Aldric',
  type: 'character',
  system: {
    details: {
      experience: { current: 50, total: 200, spent: 150, log: [] },
      gmnotes: { value: '' },
      biography: { value: '' },
    },
    gmnotes: { value: '' },
  },
  items: [
    { id: 'item001234567890', name: 'Melee (Basic)', type: 'skill' },
    { id: 'item002345678901', name: 'Strike Mighty Blow', type: 'talent' },
  ],
};

/** makeToolDeps that always returns CHAR_STUB regardless of query key. */
const twoQueryTool = () =>
  new ManageCharacterTool(makeToolDeps((_key: string) => CHAR_STUB));

/** Post-write stub: includes ws.initial and fortune.value to satisfy Phase 1 verify block. */
const CHAR_STUB_POST_WRITE = {
  ...CHAR_STUB,
  system: {
    ...CHAR_STUB.system,
    characteristics: { ws: { initial: 40 } },
    status: { fortune: { value: 3 } },
  },
};

describe('ManageCharacterTool — characterization', () => {
  it('update-stats — formatted confirmation string (character type)', async () => {
    // update-stats: getCharacterInfo → updateActor → getCharacterInfo (verify re-fetch, Phase 1 DP-16)
    // Mock: updateActor returns {}; both getCharacterInfo calls return a stub that has the written values.
    let callCount = 0;
    const mockFn = (key: string) => {
      if (key === 'warhammer-mcp.updateActor') return {};
      callCount++;
      // First call = pre-write lookup; subsequent = post-write verify.
      return callCount === 1 ? CHAR_STUB : CHAR_STUB_POST_WRITE;
    };
    const r = await new ManageCharacterTool(makeToolDeps(mockFn)).handle({
      action: 'update-stats',
      characterName: 'Aldric',
      updates: { weaponSkill: 40, fortune: 3 },
    });
    expect(r).toMatchSnapshot();
  });

  it('update-stats — npc type with species + size', async () => {
    const r = await twoQueryTool().handle({
      action: 'update-stats',
      characterName: 'Aldric',
      actorType: 'npc',
      updates: { species: 'Goblin', size: 'sml' },
    });
    expect(r).toMatchSnapshot();
  });

  it('update-skill-talent — melee advances updated', async () => {
    // update-skill-talent: getCharacterInfo → updateItem
    const r = await twoQueryTool().handle({
      action: 'update-skill-talent',
      characterName: 'Aldric',
      itemName: 'Melee (Basic)',
      updates: { advances: 8 },
    });
    expect(r).toMatchSnapshot();
  });

  it('update-notes — gmnotes set (non-append)', async () => {
    // update-notes: getCharacterInfo → updateActor
    const r = await twoQueryTool().handle({
      action: 'update-notes',
      characterName: 'Aldric',
      noteType: 'gmnotes',
      content: 'Suspected heretic. Keep watch.',
      append: false,
    });
    expect(r).toMatchSnapshot();
  });

  it('update-notes — biography append', async () => {
    const r = await twoQueryTool().handle({
      action: 'update-notes',
      characterName: 'Aldric',
      noteType: 'biography',
      content: 'Was raised in Altdorf.',
      append: true,
    });
    expect(r).toMatchSnapshot();
  });

  it('add-xp-log — earned, log-only (no total update)', async () => {
    // add-xp-log with updateTotal=false: getCharacterInfo → updateActor (2 queries)
    const r = await twoQueryTool().handle({
      action: 'add-xp-log',
      characterName: 'Aldric',
      amount: 50,
      reason: 'Defeated the ogre chieftain',
      type: 'earned',
    });
    expect(r).toMatchSnapshot();
  });

  it('add-xp-log — spent with updateTotal=true', async () => {
    // add-xp-log with updateTotal=true: getCharacterInfo → updateActor → getCharacterInfo (3 queries)
    // The third getCharacterInfo must return a system.details.experience.total that
    // matches the expected new total (150 current + 30 delta... but type='spent' = -30 → 120).
    // However since actorType='character', expectedTotal = 200 - 30 = 170.
    const charWithXP = {
      ...CHAR_STUB,
      system: {
        ...CHAR_STUB.system,
        details: {
          ...CHAR_STUB.system.details,
          experience: { current: 50, total: 170, spent: 180, log: [] },
        },
      },
    };
    const tool = new ManageCharacterTool(
      makeToolDeps((key: string) => {
        // 1st call (getCharacterInfo) → CHAR_STUB (total=200)
        // 2nd call (updateActor) → {}
        // 3rd call (getCharacterInfo for verify) → charWithXP (total=170)
        if (key === 'warhammer-mcp.updateActor') return {};
        return charWithXP;
      }),
    );
    // Pre-seed: first getCharacterInfo must return total=200 so the math yields expectedTotal=170.
    // But our mock always returns charWithXP (total=170) — that means the updateActor update
    // will compute delta=-30 and expectedTotal=170-30=140 ≠ 170 → throws.
    // Fix: use a call-count gate instead.
    let callCount = 0;
    const gatedMock = makeToolDeps((key: string) => {
      if (key === 'warhammer-mcp.updateActor') return {};
      callCount++;
      if (callCount === 1) return CHAR_STUB;          // first getCharacterInfo (total=200)
      return { ...CHAR_STUB, system: { ...CHAR_STUB.system, details: { ...CHAR_STUB.system.details, experience: { current: 50, total: 170, spent: 180, log: [] } } } };
    });
    const gatedTool = new ManageCharacterTool(gatedMock);
    const r = await gatedTool.handle({
      action: 'add-xp-log',
      characterName: 'Aldric',
      amount: 30,
      reason: 'Bought Strike Mighty Blow',
      type: 'spent',
      updateTotal: true,
    });
    expect(r).toMatchSnapshot();
  });

  it('add-skill-talent — talent added (no advances)', async () => {
    // add-skill-talent (no advances arg): getCharacterInfo → searchCompendium → addItemFromCompendium (3 queries)
    const searchResult = [{ name: 'Lightning Reflexes', type: 'talent', pack: 'wfrp4e-core.items', id: 'talent001234' }];
    let seq = 0;
    const tool = new ManageCharacterTool(makeToolDeps((key: string) => {
      if (key === 'warhammer-mcp.searchCompendium') return searchResult;
      if (key === 'warhammer-mcp.addItemFromCompendium') return {};
      return CHAR_STUB;   // getCharacterInfo (seq 0 = initial lookup)
    }));
    const r = await tool.handle({
      action: 'add-skill-talent',
      characterName: 'Aldric',
      itemName: 'Lightning Reflexes',
      itemType: 'talent',
    });
    expect(r).toMatchSnapshot();
  });
});
