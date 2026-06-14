// Characterization snapshot — UpdateActiveEffectTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2 (R0.1).
// UpdateActiveEffectTool.handle() returns the bare query payload; backend.ts:789 wraps it.
// We JSON.stringify the raw result to lock the same data shape.

import { describe, it, expect } from 'vitest';
import { UpdateActiveEffectTool } from '../../tools/update-active-effect.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new UpdateActiveEffectTool(makeToolDeps(mockReturn));

describe('UpdateActiveEffectTool — characterization', () => {
  it('scope=actor, effectId — partial update by id on item-owned effect', async () => {
    const r = await tool({
      effectId: 'effect-aaa111',
      effectName: 'Burning Touch',
      parentType: 'Item',
      parentId: 'item-sword99',
      parentName: 'Choppa',
      updatedFields: ['disabled'],
    }).handle({
      target: { scope: 'actor', actorName: 'Grimgor Ironhide', itemName: 'Choppa' },
      effectId: 'effect-aaa111',
      updates: { disabled: true },
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });

  it('scope=world, effectName — update by name on world-scope item', async () => {
    const r = await tool({
      effectId: 'effect-bbb222',
      effectName: 'Holy Aura',
      parentType: 'Item',
      parentId: 'item-blessed01',
      parentName: 'Blessed Sword',
      updatedFields: ['name', 'disabled'],
    }).handle({
      target: { scope: 'world', itemName: 'Blessed Sword' },
      effectName: 'Holy Aura',
      updates: { name: 'Weakened Aura', disabled: false },
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });

  it('scope=actor-direct — update effect on actor directly', async () => {
    const r = await tool({
      effectId: 'effect-ccc333',
      effectName: 'WS Debuff',
      parentType: 'Actor',
      parentId: 'actor-abc123',
      parentName: 'Test NPC',
      updatedFields: ['description'],
    }).handle({
      target: { scope: 'actor-direct', actorId: 'actor-abc123' },
      effectName: 'WS Debuff',
      updates: { description: 'Updated: -10 WS penalty from sickness.' },
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });

  it('returnFullPayload=true — full updated effect document in response', async () => {
    const r = await tool({
      effectId: 'effect-ddd444',
      effectName: 'Poison',
      parentType: 'Item',
      parentId: 'item-dagger01',
      parentName: 'Dagger',
      updatedFields: ['disabled'],
      fullDocument: {
        _id: 'effect-ddd444',
        name: 'Poison',
        disabled: true,
        changes: [],
        statuses: [],
        flags: {},
      },
    }).handle({
      target: { scope: 'actor', actorName: 'Grimgor', itemName: 'Dagger' },
      effectId: 'effect-ddd444',
      updates: { disabled: true },
      returnFullPayload: true,
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });
});
