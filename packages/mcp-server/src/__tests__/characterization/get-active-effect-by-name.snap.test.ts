// Characterization snapshot — GetActiveEffectByNameTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2 (R0.1).
// GetActiveEffectByNameTool.handle() returns the bare query payload; backend.ts:789 wraps it.
// We JSON.stringify the raw result to lock the same data shape.

import { describe, it, expect } from 'vitest';
import { GetActiveEffectByNameTool } from '../../tools/get-active-effect-by-name.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new GetActiveEffectByNameTool(makeToolDeps(mockReturn));

const cannedEffect = {
  id: 'effect-aaa111',
  name: 'Burning Touch',
  img: 'icons/svg/aura.svg',
  statuses: [],
  disabled: false,
  duration: {},
  origin: 'Item.item-sword99',
  changes: [{ key: 'system.characteristics.ws.modifier', mode: 2, value: '-5' }],
};

describe('GetActiveEffectByNameTool — characterization', () => {
  it('scope=actor, effectName — look up by name on item-owned effect', async () => {
    const r = await tool({
      success: true,
      scope: 'actor',
      actorId: 'actor-grimgor',
      itemId: 'item-sword99',
      itemName: 'Choppa',
      effectId: 'effect-aaa111',
      effectName: 'Burning Touch',
      parentType: 'Item',
      parentId: 'item-sword99',
      parentName: 'Choppa',
      effect: cannedEffect,
    }).handle({
      target: { scope: 'actor', actorName: 'Grimgor Ironhide', itemName: 'Choppa' },
      effectName: 'Burning Touch',
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });

  it('scope=actor, effectId — authoritative id lookup on item-owned effect', async () => {
    const r = await tool({
      success: true,
      scope: 'actor',
      actorId: 'actor-grimgor',
      itemId: 'item-sword99',
      itemName: 'Choppa',
      effectId: 'effect-aaa111',
      effectName: 'Burning Touch',
      parentType: 'Item',
      parentId: 'item-sword99',
      parentName: 'Choppa',
      effect: cannedEffect,
    }).handle({
      target: { scope: 'actor', actorName: 'Grimgor Ironhide', itemName: 'Choppa' },
      effectId: 'effect-aaa111',
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });

  it('scope=world — look up on world-scope item', async () => {
    const r = await tool({
      success: true,
      scope: 'world',
      actorId: null,
      itemId: 'item-blessed01',
      itemName: 'Blessed Sword',
      effectId: 'effect-bbb222',
      effectName: 'Holy Aura',
      parentType: 'Item',
      parentId: 'item-blessed01',
      parentName: 'Blessed Sword',
      effect: {
        id: 'effect-bbb222',
        name: 'Holy Aura',
        img: 'icons/svg/aura.svg',
        statuses: [],
        disabled: false,
        duration: {},
        origin: '',
        changes: [],
      },
    }).handle({
      target: { scope: 'world', itemName: 'Blessed Sword' },
      effectName: 'Holy Aura',
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });

  it('scope=actor-direct — look up effect on actor directly', async () => {
    const r = await tool({
      success: true,
      scope: 'actor-direct',
      actorId: 'actor-abc123',
      itemId: null,
      itemName: null,
      effectId: 'effect-ccc333',
      effectName: 'WS Debuff',
      parentType: 'Actor',
      parentId: 'actor-abc123',
      parentName: 'Test NPC',
      effect: {
        id: 'effect-ccc333',
        name: 'WS Debuff',
        img: 'icons/svg/aura.svg',
        statuses: [],
        disabled: false,
        duration: {},
        origin: '',
        changes: [{ key: 'system.characteristics.ws.modifier', mode: 2, value: '-10' }],
      },
    }).handle({
      target: { scope: 'actor-direct', actorId: 'actor-abc123' },
      effectName: 'WS Debuff',
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });
});
