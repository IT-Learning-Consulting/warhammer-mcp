// Characterization snapshot — ModuleLightingTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: list-animations (read with entries), list-animations (empty), MODULE_NOT_ACTIVE branch.

import { describe, it, expect } from 'vitest';
import { ModuleLightingTool } from '../../tools/modules/community-lighting/lighting.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ModuleLightingTool(makeToolDeps(mockReturn));

describe('ModuleLightingTool — characterization', () => {
  it('list-animations — with entries (no custom props)', async () => {
    const r = await tool({
      animations: [
        { key: 'CLFlicker', label: 'CL Flicker', author: 'CommunityLighting', hasCustomProperties: false, customPropertyKeys: [] },
        { key: 'CLPulse', label: 'CL Pulse', author: 'CommunityLighting', hasCustomProperties: false, customPropertyKeys: [] },
      ],
      count: 2,
    }).execute({ action: 'list-animations' });
    expect((r as any).content[0].text).toMatchSnapshot();
    // structuredContent is also returned
    expect((r as any).structuredContent).toBeDefined();
  });

  it('list-animations — with custom properties', async () => {
    const r = await tool({
      animations: [
        { key: 'CLSmoke', label: 'CL Smoke', author: 'CommunityLighting', hasCustomProperties: true, customPropertyKeys: ['secondaryColor', 'speed'] },
      ],
      count: 1,
    }).execute({ action: 'list-animations' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-animations — empty registry', async () => {
    const r = await tool({
      animations: [],
      count: 0,
    }).execute({ action: 'list-animations' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('MODULE_NOT_ACTIVE — probe inactive branch', async () => {
    const r = await new ModuleLightingTool(
      makeToolDeps(null, 'MODULE_NOT_ACTIVE: CommunityLighting is not active'),
    ).execute({ action: 'list-animations' });
    expect((r as any).content[0].text).toMatchSnapshot();
    expect((r as any).isError).toBe(true);
  });
});
