// Characterization snapshot — LightTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Actions: create / update / delete / get / list (bare, paginated, countOnly).

import { describe, it, expect } from 'vitest';
import { LightTool } from '../../tools/light.js';
import { makeToolDeps } from '../test-utils.js';

const LIGHT_VM = {
  id: 'light-id-001',
  sceneId: 'scene-id-001',
  x: 500,
  y: 300,
  elevation: 0,
  rotation: 0,
  walls: true,
  vision: false,
  hidden: false,
  isGlobal: false,
  config: {
    dim: 20,
    bright: 10,
    angle: 360,
    color: '#ffaa00',
    alpha: 0.5,
    coloration: 1,
    luminosity: 0.5,
    saturation: 0,
    contrast: 0,
    shadows: 0,
    attenuation: 0.5,
    priority: 0,
    negative: false,
    darkness: { min: 0, max: 1 },
    animation: { type: 'torch', speed: 5, intensity: 5, reverse: false },
  },
  flags: {},
};

const LIGHT_LIST_ITEM = {
  id: 'light-id-001',
  sceneId: 'scene-id-001',
  dim: 20,
  bright: 10,
  isGlobal: false,
  hidden: false,
};

const tool = (mockReturn: any) => new LightTool(makeToolDeps(mockReturn));

describe('LightTool — characterization', () => {
  it('create — ambient light created with requested fields', async () => {
    const r = await tool({
      light: LIGHT_VM,
      requestedChanges: { action: 'create', sceneId: 'scene-id-001', x: 500, y: 300, config: { bright: 10, dim: 20, color: '#ffaa00' } },
    }).execute({ action: 'create', sceneId: 'scene-id-001', x: 500, y: 300, config: { bright: 10, dim: 20, color: '#ffaa00' } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update — changed fields + updated light view', async () => {
    const r = await tool({
      light: { ...LIGHT_VM, hidden: true },
      requestedChanges: { action: 'update', sceneId: 'scene-id-001', lightId: 'light-id-001', changes: { hidden: true } },
      changedFields: ['hidden'],
    }).execute({ action: 'update', sceneId: 'scene-id-001', lightId: 'light-id-001', changes: { hidden: true } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete — deleted confirmation with remaining count', async () => {
    const r = await tool({
      deletedId: 'light-id-001',
      remainingLights: 2,
    }).execute({ action: 'delete', sceneId: 'scene-id-001', lightId: 'light-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — single light view', async () => {
    const r = await tool({
      light: LIGHT_VM,
    }).execute({ action: 'get', sceneId: 'scene-id-001', lightId: 'light-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — bare list of lights', async () => {
    const r = await tool({
      lights: [LIGHT_LIST_ITEM],
    }).execute({ action: 'list', sceneId: 'scene-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — paginated lights', async () => {
    const r = await tool({
      lights: [LIGHT_LIST_ITEM],
      total: 5,
      page: 1,
      pageSize: 20,
      pageCount: 1,
    }).execute({ action: 'list', sceneId: 'scene-id-001', page: 1, pageSize: 20 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — countOnly path', async () => {
    const r = await tool({
      total: 4,
      filterApplied: false,
    }).execute({ action: 'list', sceneId: 'scene-id-001', countOnly: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
