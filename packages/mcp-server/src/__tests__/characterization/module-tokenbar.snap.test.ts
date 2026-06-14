// Characterization snapshot — ModuleTokenbarTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: change-movement global (free, none, combat no-op); change-movement per-token;
//         MODULE_NOT_ACTIVE branch.

import { describe, it, expect } from 'vitest';
import { ModuleTokenbarTool } from '../../tools/modules/tokenbar/tokenbar.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ModuleTokenbarTool(makeToolDeps(mockReturn));

describe('ModuleTokenbarTool — characterization', () => {
  it('change-movement — global free', async () => {
    const r = await tool({
      movement: 'free',
      scope: 'global',
      applied: true,
    }).execute({ action: 'change-movement', movement: 'free' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('change-movement — global none (full lockdown)', async () => {
    const r = await tool({
      movement: 'none',
      scope: 'global',
      applied: true,
    }).execute({ action: 'change-movement', movement: 'none' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('change-movement — combat mode no-op (no active combat)', async () => {
    const r = await tool({
      movement: 'combat',
      scope: 'global',
      applied: false,
      note: 'no active combat',
    }).execute({ action: 'change-movement', movement: 'combat' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('change-movement — per-token override', async () => {
    const r = await tool({
      movement: 'free',
      scope: 'per-token',
      tokenCount: 1,
      applied: true,
    }).execute({
      action: 'change-movement',
      movement: 'free',
      tokens: ['Scene.abc.Token.xyz'],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('MODULE_NOT_ACTIVE — monks-tokenbar not active', async () => {
    const r = await new ModuleTokenbarTool(
      makeToolDeps(null, 'MODULE_NOT_ACTIVE: monks-tokenbar is not active'),
    ).execute({ action: 'change-movement', movement: 'none' });
    expect((r as any).content[0].text).toMatchSnapshot();
    expect((r as any).isError).toBe(true);
  });
});
