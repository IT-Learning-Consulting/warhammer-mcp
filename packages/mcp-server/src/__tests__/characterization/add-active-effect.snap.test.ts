// Characterization snapshot — AddActiveEffectTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2 (R0.1).
// AddActiveEffectTool.handle() returns the bare query payload; at the transport boundary
// (backend.ts:789) the backend wraps non-content results as JSON.stringify(result) inside
// content[0].text. We JSON.stringify the raw result here to lock the same data shape.

import { describe, it, expect } from 'vitest';
import { AddActiveEffectTool } from '../../tools/add-active-effect.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new AddActiveEffectTool(makeToolDeps(mockReturn));

describe('AddActiveEffectTool — characterization', () => {
  it('scope=actor — effect created on item owned by actor', async () => {
    const r = await tool({
      effectId: 'effect-aaa111',
      effectName: 'Burning Touch',
      parentType: 'Item',
      parentId: 'item-sword99',
      parentName: 'Choppa',
      actorId: 'actor-grimgor',
      actorName: 'Grimgor Ironhide',
    }).handle({
      target: { scope: 'actor', actorName: 'Grimgor Ironhide', itemName: 'Choppa' },
      effect: { name: 'Burning Touch', trigger: 'applyDamage', script: '' },
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });

  it('scope=world — effect created on world-scope item', async () => {
    const r = await tool({
      effectId: 'effect-bbb222',
      effectName: 'Holy Aura',
      parentType: 'Item',
      parentId: 'item-blessed01',
      parentName: 'Blessed Sword',
    }).handle({
      target: { scope: 'world', itemName: 'Blessed Sword' },
      effect: { name: 'Holy Aura', trigger: 'prePrepareData' },
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });

  it('scope=actor-direct — one-off effect placed directly on actor', async () => {
    const r = await tool({
      effectId: 'effect-ccc333',
      effectName: 'WS Debuff',
      parentType: 'Actor',
      parentId: 'actor-abc123',
      parentName: 'Test NPC',
    }).handle({
      target: { scope: 'actor-direct', actorId: 'actor-abc123' },
      effect: {
        name: 'WS Debuff',
        trigger: 'prePrepareData',
        description: 'Applies a -10 penalty to Weapon Skill.',
        changes: [{ key: 'system.characteristics.ws.modifier', mode: 2, value: '-10' }],
      },
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });

  it('returnFullPayload=true — full effect document included in response', async () => {
    const r = await tool({
      effectId: 'effect-ddd444',
      effectName: 'Poison',
      parentType: 'Item',
      parentId: 'item-dagger01',
      parentName: 'Dagger',
      fullDocument: {
        _id: 'effect-ddd444',
        name: 'Poison',
        changes: [],
        disabled: false,
        statuses: [],
        flags: { wfrp4e: { trigger: 'applyDamage' } },
      },
    }).handle({
      target: { scope: 'actor', actorName: 'Grimgor', itemName: 'Dagger' },
      effect: { name: 'Poison', trigger: 'applyDamage' },
      returnFullPayload: true,
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });
});
