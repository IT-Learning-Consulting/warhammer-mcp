// Characterization snapshot — GetWfrpConfigTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// GetWfrpConfigTool.handle() wraps the query result in { content:[{type:"text",text:JSON.stringify(output)}], structuredContent }.

import { describe, it, expect } from 'vitest';
import { GetWfrpConfigTool } from '../../tools/get-wfrp-config.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new GetWfrpConfigTool(makeToolDeps(mockReturn));

describe('GetWfrpConfigTool — characterization', () => {
  it('single key request — xpCost values', async () => {
    const r = await tool({
      values: {
        xpCost: {
          characteristic: [25, 30, 40, 50, 70],
          skill: [10, 15, 20, 30, 40],
        },
      },
      skipped: [],
    }).handle({ keys: ['xpCost'] });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('multiple keys — values and skipped', async () => {
    const r = await tool({
      values: {
        statusTiers: { Brass: 'brass', Silver: 'silver', Gold: 'gold' },
        conditions: { prone: 'Prone', stunned: 'Stunned', bleeding: 'Bleeding' },
      },
      skipped: ['unknownKey'],
    }).handle({ keys: ['statusTiers', 'conditions', 'unknownKey'] });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('all keys skipped — empty values', async () => {
    const r = await tool({
      values: {},
      skipped: ['badKey1', 'badKey2'],
    }).handle({ keys: ['badKey1', 'badKey2'] });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
