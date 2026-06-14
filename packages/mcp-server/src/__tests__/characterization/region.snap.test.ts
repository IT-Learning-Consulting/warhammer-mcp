// Characterization snapshot — RegionTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Actions: create / update / delete / get / list (normal, countOnly) /
//          createBehavior / updateBehavior / deleteBehavior / add-shape.

import { describe, it, expect } from 'vitest';
import { RegionTool } from '../../tools/region.js';
import { makeToolDeps } from '../test-utils.js';

const REGION_VM = {
  id: 'region-id-001',
  sceneId: 'scene-id-001',
  name: 'Danger Zone',
  color: '#ff0000',
  visibility: 0,
  locked: false,
  behaviorCount: 0,
  shapes: [{ type: 'rectangle', x: 100, y: 100, width: 300, height: 200, hole: false }],
  elevation: { bottom: null, top: null },
  behaviors: [],
  flags: {},
};

const REGION_LIST_ITEM = {
  id: 'region-id-001',
  name: 'Danger Zone',
  shapeCount: 1,
  behaviorCount: 0,
  visibility: 0,
  locked: false,
};

const BEHAVIOR_SUMMARY = {
  id: 'behavior-id-001',
  type: 'pauseGame',
  name: 'Pause on entry',
  disabled: false,
  system: { once: true },
};

const tool = (mockReturn: any) => new RegionTool(makeToolDeps(mockReturn));

describe('RegionTool — characterization', () => {
  it('create — region created view', async () => {
    const r = await tool({
      region: REGION_VM,
      requestedChanges: { action: 'create', sceneId: 'scene-id-001', name: 'Danger Zone', color: '#ff0000' },
    }).execute({ action: 'create', sceneId: 'scene-id-001', name: 'Danger Zone', color: '#ff0000' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update — changed fields + updated region view', async () => {
    const r = await tool({
      region: { ...REGION_VM, locked: true },
      requestedChanges: { action: 'update', sceneId: 'scene-id-001', regionId: 'region-id-001', changes: { locked: true } },
      changedFields: ['locked'],
    }).execute({ action: 'update', sceneId: 'scene-id-001', regionId: 'region-id-001', changes: { locked: true } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete — deleted confirmation', async () => {
    const r = await tool({
      deletedId: 'region-id-001',
      sceneId: 'scene-id-001',
      remainingRegions: 0,
    }).execute({ action: 'delete', sceneId: 'scene-id-001', regionId: 'region-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — single region view', async () => {
    const r = await tool({
      region: REGION_VM,
    }).execute({ action: 'get', sceneId: 'scene-id-001', regionId: 'region-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — region with embedded behaviors', async () => {
    const r = await tool({
      region: { ...REGION_VM, behaviorCount: 1, behaviors: [BEHAVIOR_SUMMARY] },
    }).execute({ action: 'get', sceneId: 'scene-id-001', regionId: 'region-id-001', includeBehaviors: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — paginated regions', async () => {
    const r = await tool({
      regions: [REGION_LIST_ITEM],
      total: 1,
      page: 1,
      pageSize: 50,
      countOnly: false,
    }).execute({ action: 'list', sceneId: 'scene-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — countOnly path', async () => {
    const r = await tool({
      regions: [],
      total: 2,
      page: 1,
      pageSize: 50,
      countOnly: true,
    }).execute({ action: 'list', sceneId: 'scene-id-001', countOnly: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('createBehavior — behavior created on region', async () => {
    const r = await tool({
      regionId: 'region-id-001',
      behavior: BEHAVIOR_SUMMARY,
    }).execute({ action: 'createBehavior', sceneId: 'scene-id-001', regionId: 'region-id-001', behavior: { type: 'pauseGame', system: { once: true } }, name: 'Pause on entry' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('updateBehavior — behavior updated on region', async () => {
    const r = await tool({
      regionId: 'region-id-001',
      behavior: { ...BEHAVIOR_SUMMARY, disabled: true },
      changedFields: ['disabled'],
    }).execute({ action: 'updateBehavior', sceneId: 'scene-id-001', regionId: 'region-id-001', behaviorId: 'behavior-id-001', disabled: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('deleteBehavior — behavior deleted from region', async () => {
    const r = await tool({
      regionId: 'region-id-001',
      deletedBehaviorId: 'behavior-id-001',
      remainingBehaviors: 0,
    }).execute({ action: 'deleteBehavior', sceneId: 'scene-id-001', regionId: 'region-id-001', behaviorId: 'behavior-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('add-shape — shape appended to region', async () => {
    const r = await tool({
      region: { ...REGION_VM, shapes: [REGION_VM.shapes[0], { type: 'circle', x: 400, y: 400, radius: 50, hole: false }] },
      shapeCount: 2,
    }).execute({ action: 'add-shape', sceneId: 'scene-id-001', regionId: 'region-id-001', shape: { type: 'circle', x: 400, y: 400, radius: 50 } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
