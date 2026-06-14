// Characterization snapshot — ModuleLevelsTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: get-capabilities (read), get-elevation-data (read), set-token-elevation (write),
// rescale-grid-distance (write dry-run), MODULE_NOT_ACTIVE branch.

import { describe, it, expect } from 'vitest';
import { ModuleLevelsTool } from '../../tools/modules/levels/levels.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ModuleLevelsTool(makeToolDeps(mockReturn));

describe('ModuleLevelsTool — characterization', () => {
  it('get-capabilities — family active', async () => {
    const r = await tool({
      family: [
        { id: 'levels', installed: true, active: true, version: '15.0.0' },
        { id: 'wall-height', installed: true, active: true, version: '7.2.0' },
        { id: 'levelsvolumetrictemplates', installed: false, active: false, version: null },
        { id: 'levels-layer-effects', installed: false, active: false, version: null },
      ],
      volumetricActive: false,
      layerEffectsActive: false,
      betterRoofsActive: false,
      migration: {
        migrateOnStartup: false,
        pending: false,
        residualRangeBottomOnActiveScene: false,
        warning: null,
      },
      settings: {
        'levels.defaultTokenElevation': 0,
        'wall-height.defaultTokenHeight': 6,
      },
    }).execute({ action: 'get-capabilities' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-elevation-data — token elevation', async () => {
    const r = await tool({
      uuid: 'Scene.abc.Token.xyz',
      documentName: 'Token',
      name: 'Karl',
      elevation: 10,
      flagsLevels: { rangeBottom: 10 },
      flagsWallHeight: { tokenHeight: 6 },
    }).execute({ action: 'get-elevation-data', uuid: 'Scene.abc.Token.xyz' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('set-token-elevation — elevation written', async () => {
    const r = await tool({
      tokenId: 'Token.xyz',
      sceneId: 'Scene.abc',
      elevation: 10,
      tokenHeight: 6,
    }).execute({ action: 'set-token-elevation', sceneId: 'Scene.abc', tokenId: 'Token.xyz', elevation: 10 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('set-scene-flags — flags written', async () => {
    const r = await tool({
      sceneId: 'Scene.abc',
      backgroundElevation: 0,
      weatherElevation: 5,
    }).execute({ action: 'set-scene-flags', sceneId: 'Scene.abc', backgroundElevation: 0, weatherElevation: 5 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('rescale-grid-distance — dry run (no confirm)', async () => {
    const r = await tool({
      dryRun: true,
      prevDistance: 5,
      currDistance: 2,
      factor: 0.4,
      affected: { Token: 8, Tile: 2, Wall: 0 },
      sceneLevelsBands: 3,
      totalAffected: 10,
      note: 'Pass confirm:true to execute.',
    }).execute({ action: 'rescale-grid-distance', sceneId: 'Scene.abc', prevDistance: 5, currDistance: 2 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('MODULE_NOT_ACTIVE — probe inactive branch', async () => {
    const r = await new ModuleLevelsTool(
      makeToolDeps(null, 'MODULE_NOT_ACTIVE: levels is not active'),
    ).execute({ action: 'get-capabilities' });
    expect((r as any).content[0].text).toMatchSnapshot();
    expect((r as any).isError).toBe(true);
  });
});
