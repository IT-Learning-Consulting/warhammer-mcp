// Characterization snapshot — ListActiveEffectsTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2 (R0.1).
// ListActiveEffectsTool.handle() may make two queries: listActiveEffects → array of projections,
// then getCharacterInfo to resolve the actor name (BUG-319 fix). When query returns an array,
// the tool returns { actorId, actorName, effects }. When it returns an object directly, that
// object is forwarded. We use a function mockReturn to route both query keys.

import { describe, it, expect } from 'vitest';
import { ListActiveEffectsTool } from '../../tools/list-active-effects.js';
import { makeToolDeps } from '../test-utils.js';

const cannedEffects = [
  {
    id: 'effect-aaa111',
    name: 'Burning Touch',
    statuses: [],
    disabled: false,
    duration: {},
    origin: 'Item.item-sword99',
    changes: [{ key: 'system.characteristics.ws.modifier', mode: 2, value: '-5' }],
    parentType: 'Item',
    parentId: 'item-sword99',
    parentName: 'Choppa',
  },
  {
    id: 'effect-bbb222',
    name: 'Blessed',
    statuses: ['blessed'],
    disabled: false,
    duration: { rounds: 3, startRound: 1 },
    origin: '',
    changes: [],
    parentType: 'Actor',
    parentId: 'actor-grimgor',
    parentName: 'Grimgor Ironhide',
  },
];

const cannedCharacter = { name: 'Grimgor Ironhide' };

// Router: listActiveEffects returns array; getCharacterInfo returns the character object.
const makeRouter = (effects: any[], character: any) => (key: string, _args: any) => {
  if (key === 'warhammer-mcp.listActiveEffects') return effects;
  if (key === 'warhammer-mcp.getCharacterInfo') return character;
  return null;
};

const tool = (mockReturn: any) => new ListActiveEffectsTool(makeToolDeps(mockReturn));

describe('ListActiveEffectsTool — characterization', () => {
  it('filter=all — full effect list with actor name resolved', async () => {
    const r = await tool(makeRouter(cannedEffects, cannedCharacter)).handle({
      actorId: 'actor-grimgor',
      filter: 'all',
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });

  it('filter=applied — only non-disabled effects', async () => {
    const appliedEffects = cannedEffects.filter(e => !e.disabled);
    const r = await tool(makeRouter(appliedEffects, cannedCharacter)).handle({
      actorId: 'actor-grimgor',
      filter: 'applied',
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });

  it('filter=temporary — only effects with duration rounds/turns/seconds', async () => {
    const temporaryEffects = [cannedEffects[1]]; // only 'Blessed' has duration.rounds
    const r = await tool(makeRouter(temporaryEffects, cannedCharacter)).handle({
      actorId: 'actor-grimgor',
      filter: 'temporary',
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });

  it('filter=all, includeItemAEs=true — includes AEs from actor items', async () => {
    const itemAeEffects = [
      ...cannedEffects,
      {
        id: 'effect-item-ae-01',
        name: 'Sword Aura',
        statuses: [],
        disabled: false,
        duration: {},
        origin: 'Item.item-sword-special',
        changes: [],
        parentType: 'Item',
        parentId: 'item-sword-special',
        parentName: 'Enchanted Sword',
      },
    ];
    const r = await tool(makeRouter(itemAeEffects, cannedCharacter)).handle({
      actorId: 'actor-grimgor',
      filter: 'all',
      includeItemAEs: true,
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });

  it('actor name resolution fails gracefully — actorName is null', async () => {
    // When getCharacterInfo throws, the tool catches and sets actorName: null.
    const routerWithCharFail = (key: string, _args: any) => {
      if (key === 'warhammer-mcp.listActiveEffects') return cannedEffects;
      throw new Error('Actor not found');
    };
    const r = await tool(routerWithCharFail).handle({
      actorId: 'actor-unknown',
      filter: 'all',
    });
    expect(JSON.stringify(r)).toMatchSnapshot();
  });
});
