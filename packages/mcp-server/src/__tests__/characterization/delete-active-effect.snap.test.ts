// Characterization snapshot — DeleteActiveEffectTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2 (R0.1).
// DeleteActiveEffectTool.handle() returns the bare query payload; backend.ts:789 wraps it.
// We JSON.stringify the raw result to lock the same data shape.

import { describe, it, expect } from 'vitest';
import { DeleteActiveEffectTool } from '../../tools/delete-active-effect.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new DeleteActiveEffectTool(makeToolDeps(mockReturn));

describe('DeleteActiveEffectTool — characterization', () => {
  it('scope=actor, effectId — deletion by id from item-owned effect', async () => {
    const r = await tool({
      deleted: true,
      effectId: 'effect-aaa111',
      effectName: 'Burning Touch',
      parentType: 'Item',
      parentId: 'item-sword99',
      parentName: 'Choppa',
      actorId: 'actor-grimgor',
      actorName: 'Grimgor Ironhide',
    }).handle({
      target: { scope: 'actor', actorName: 'Grimgor Ironhide', itemName: 'Choppa' },
      effectId: 'effect-aaa111',
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });

  it('scope=world, effectName — deletion by name from world-scope item', async () => {
    const r = await tool({
      deleted: true,
      effectId: 'effect-bbb222',
      effectName: 'Holy Aura',
      parentType: 'Item',
      parentId: 'item-blessed01',
      parentName: 'Blessed Sword',
    }).handle({
      target: { scope: 'world', itemName: 'Blessed Sword' },
      effectName: 'Holy Aura',
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });

  it('scope=actor-direct, effectName — deletion from actor directly', async () => {
    const r = await tool({
      deleted: true,
      effectId: 'effect-ccc333',
      effectName: 'WS Debuff',
      parentType: 'Actor',
      parentId: 'actor-abc123',
      parentName: 'Test NPC',
    }).handle({
      target: { scope: 'actor-direct', actorId: 'actor-abc123' },
      effectName: 'WS Debuff',
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });
});
