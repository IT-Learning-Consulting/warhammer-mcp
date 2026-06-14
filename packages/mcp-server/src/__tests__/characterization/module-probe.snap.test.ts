// Characterization snapshot — ModuleProbeTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: is-active (active), is-active (inactive), list-active (non-empty), list-active (empty).
// module-probe has NO self-guard — it is always-registered and reports status of OTHER modules.

import { describe, it, expect } from 'vitest';
import { ModuleProbeTool } from '../../tools/modules/probe/probe.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ModuleProbeTool(makeToolDeps(mockReturn));

describe('ModuleProbeTool — characterization', () => {
  it('is-active — module active', async () => {
    const r = await tool({
      id: 'monks-active-tiles',
      active: true,
      title: "Monk's Active Tiles",
      version: '12.15',
    }).execute({ action: 'is-active', moduleId: 'monks-active-tiles' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('is-active — module inactive / not installed', async () => {
    const r = await tool({
      id: 'some-missing-module',
      active: false,
    }).execute({ action: 'is-active', moduleId: 'some-missing-module' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-active — multiple modules', async () => {
    const r = await tool({
      modules: [
        { id: 'wfrp4e', title: 'Warhammer Fantasy Roleplay 4th Edition', version: '7.4.0' },
        { id: 'monks-active-tiles', title: "Monk's Active Tiles", version: '12.15' },
        { id: 'simple-timekeeping', title: 'Simple Timekeeping', version: '1.3.0' },
      ],
    }).execute({ action: 'list-active' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-active — no active modules', async () => {
    const r = await tool({ modules: [] }).execute({ action: 'list-active' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('is-active — error branch', async () => {
    const r = await new ModuleProbeTool(
      makeToolDeps(null, 'Foundry connection lost'),
    ).execute({ action: 'is-active', moduleId: 'monks-active-tiles' });
    expect((r as any).content[0].text).toMatchSnapshot();
    expect((r as any).isError).toBe(true);
  });
});
