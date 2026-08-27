// Characterization snapshot — ModifyItemQualitiesTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// BUG-869 (Phase 3, D5): ModifyItemQualitiesTool.handle() now returns a
// content+structuredContent envelope instead of a bare formatted string — the
// human-readable text summary is preserved BYTE-IDENTICAL as content[0].text
// (CCR-7 additive-envelope proof), and structuredContent (validated against
// ModifyItemQualitiesOutput) is new.

import { describe, it, expect } from 'vitest';
import { ModifyItemQualitiesTool } from '../../tools/modify-item-qualities.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ModifyItemQualitiesTool(makeToolDeps(mockReturn));

describe('ModifyItemQualitiesTool — characterization', () => {
  it('add qualities to actor-embedded weapon — envelope, text byte-identical to pre-BUG-869 shape', async () => {
    const r: any = await tool({
      itemName: 'Longsword',
      owner: 'actor-001',
      outcome: 'applied',
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
    // BYTE-IDENTICAL to the pre-BUG-869 snapshot value: "Modified **Longsword**.\nAdded qualities: impale, precise"
    expect(r.content[0].text).toBe('Modified **Longsword**.\nAdded qualities: impale, precise');
    expect(r).toMatchSnapshot();
  });

  it('remove flaw from world-scope item — envelope, text byte-identical to pre-BUG-869 shape', async () => {
    const r: any = await tool({
      itemName: 'Old Shield',
      owner: '(world)',
      outcome: 'applied',
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
    // BYTE-IDENTICAL to the pre-BUG-869 snapshot value: "Modified **Old Shield**.\nRemoved flaws: clumsy"
    expect(r.content[0].text).toBe('Modified **Old Shield**.\nRemoved flaws: clumsy');
    expect(r).toMatchSnapshot();
  });

  it('add quality and flaw simultaneously — envelope, text byte-identical to pre-BUG-869 shape', async () => {
    const r: any = await tool({
      itemName: 'Rusty Dagger',
      owner: 'Hans',
      outcome: 'applied',
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
    // BYTE-IDENTICAL to the pre-BUG-869 snapshot value: "Modified **Rusty Dagger**.\nAdded qualities: fast\nAdded flaws: tiring"
    expect(r.content[0].text).toBe('Modified **Rusty Dagger**.\nAdded qualities: fast\nAdded flaws: tiring');
    expect(r).toMatchSnapshot();
  });
});
