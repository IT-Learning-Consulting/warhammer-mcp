// Characterization snapshot — WorldTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// WorldTool.handleGetWorldInfo() returns { content:[{type:"text",text}], structuredContent }.

import { describe, it, expect } from 'vitest';
import { WorldTool } from '../../tools/world.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new WorldTool(makeToolDeps(mockReturn));

describe('WorldTool — characterization', () => {
  it('get-world-info — world with active GM user', async () => {
    const r = await tool({
      id: 'adventures-in-the-warhammer-world',
      title: 'Adventures in the Warhammer World',
      system: 'wfrp4e',
      systemVersion: '6.6.2',
      foundryVersion: '13.341',
      users: [
        { id: 'user-gm-001', name: 'Gamemaster', isGM: true, active: true },
        { id: 'user-player-001', name: 'Alice', isGM: false, active: false },
      ],
    }).handleGetWorldInfo({});
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-world-info — no active users', async () => {
    const r = await tool({
      id: 'empty-world',
      title: 'Empty World',
      system: 'wfrp4e',
      systemVersion: '6.6.0',
      foundryVersion: '13.300',
      users: [
        { id: 'user-gm-001', name: 'Gamemaster', isGM: true, active: false },
      ],
    }).handleGetWorldInfo({});
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-world-info — minimal payload (all optional fields missing)', async () => {
    const r = await tool({}).handleGetWorldInfo({});
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
