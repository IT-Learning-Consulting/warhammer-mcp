// Characterization snapshot — ModifyItemQualitiesTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// ModifyItemQualitiesTool.handle() returns a formatted string (not a content envelope).

import { describe, it, expect } from 'vitest';
import { ModifyItemQualitiesTool } from '../../tools/modify-item-qualities.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ModifyItemQualitiesTool(makeToolDeps(mockReturn));

describe('ModifyItemQualitiesTool — characterization', () => {
  it('add qualities to actor-embedded weapon — formatted string', async () => {
    const r = await tool({
      itemName: 'Longsword',
      qualities: { value: [{ name: 'impale', value: null }, { name: 'precise', value: null }] },
      flaws: { value: [] },
    }).handle({
      destination: { type: 'actor', actorId: 'actor-001' },
      itemName: 'Longsword',
      addQualities: [{ name: 'impale' }, { name: 'precise' }],
      removeQualities: [],
      addFlaws: [],
      removeFlaws: [],
    });
    expect(r).toMatchSnapshot();
  });

  it('remove flaw from world-scope item — formatted string', async () => {
    const r = await tool({
      itemName: 'Old Shield',
      qualities: { value: [] },
      flaws: { value: [] },
    }).handle({
      destination: { type: 'world' },
      itemName: 'Old Shield',
      addQualities: [],
      removeQualities: [],
      addFlaws: [],
      removeFlaws: ['clumsy'],
    });
    expect(r).toMatchSnapshot();
  });

  it('add quality and flaw simultaneously — formatted string', async () => {
    const r = await tool({
      itemName: 'Rusty Dagger',
      qualities: { value: [{ name: 'fast', value: null }] },
      flaws: { value: [{ name: 'tiring', value: null }] },
    }).handle({
      destination: { type: 'actor', actorName: 'Hans' },
      itemName: 'Rusty Dagger',
      addQualities: [{ name: 'fast' }],
      removeQualities: [],
      addFlaws: [{ name: 'tiring' }],
      removeFlaws: [],
    });
    expect(r).toMatchSnapshot();
  });
});
