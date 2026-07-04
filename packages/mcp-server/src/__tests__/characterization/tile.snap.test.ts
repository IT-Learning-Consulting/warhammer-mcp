// Characterization snapshot — TileTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Actions: create / update / delete / get / list (normal, countOnly) / duplicate / bring-to-front / send-to-back.

import { describe, it, expect } from 'vitest';
import { TileTool } from '../../tools/tile.js';
import { makeToolDeps } from '../test-utils.js';

const TILE_VM = {
  id: 'tile-id-001',
  sceneId: 'scene-id-001',
  x: 200,
  y: 300,
  width: 200,
  height: 200,
  elevation: 0,
  sort: 0,
  rotation: 0,
  alpha: 1,
  hidden: false,
  locked: false,
  texture: {
    src: 'modules/foo/tile.webp',
    anchorX: 0.5,
    anchorY: 0.5,
    offsetX: 0,
    offsetY: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    tint: '#ffffff',
    fit: 'fill',
  },
  occlusion: { mode: 0, alpha: 0 },
  video: { loop: false, autoplay: false, volume: 0 },
  restrictions: { light: false, weather: false },
  flags: {},
};

const TILE_LIST_ITEM = {
  id: 'tile-id-001',
  sceneId: 'scene-id-001',
  src: 'modules/foo/tile.webp',
  overhead: false,
  hidden: false,
};

const tool = (mockReturn: any) => new TileTool(makeToolDeps(mockReturn));

describe('TileTool — characterization', () => {
  it('create — tile created view', async () => {
    const r = await tool({
      tile: TILE_VM,
      requestedChanges: { action: 'create', sceneId: 'scene-id-001', width: 200, height: 200, texture: { src: 'modules/foo/tile.webp' } },
    }).execute({ action: 'create', sceneId: 'scene-id-001', width: 200, height: 200, texture: { src: 'modules/foo/tile.webp' } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update — changed fields + updated tile view', async () => {
    const r = await tool({
      tile: { ...TILE_VM, hidden: true },
      requestedChanges: { action: 'update', sceneId: 'scene-id-001', tileId: 'tile-id-001', changes: { hidden: true } },
      changedFields: ['hidden'],
    }).execute({ action: 'update', sceneId: 'scene-id-001', tileId: 'tile-id-001', changes: { hidden: true } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete — deleted confirmation', async () => {
    const r = await tool({
      deletedId: 'tile-id-001',
      sceneId: 'scene-id-001',
    }).execute({ action: 'delete', sceneId: 'scene-id-001', tileId: 'tile-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — single tile view', async () => {
    const r = await tool({
      tile: TILE_VM,
    }).execute({ action: 'get', sceneId: 'scene-id-001', tileId: 'tile-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — paginated tiles', async () => {
    const r = await tool({
      tiles: [TILE_LIST_ITEM],
      total: 1,
      page: 1,
      pageSize: 50,
      countOnly: false,
    }).execute({ action: 'list', sceneId: 'scene-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — countOnly path', async () => {
    // BUG-435: foundry-module countOnly is LEAN — {total, filterApplied}, no tiles array.
    const r = await tool({
      total: 5,
      filterApplied: null,
    }).execute({ action: 'list', sceneId: 'scene-id-001', countOnly: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('duplicate — cloned tile with sourceId', async () => {
    const r = await tool({
      tile: { ...TILE_VM, id: 'tile-id-002' },
      sourceId: 'tile-id-001',
    }).execute({ action: 'duplicate', sceneId: 'scene-id-001', tileId: 'tile-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('bring-to-front — tile sort updated', async () => {
    const r = await tool({
      tile: { ...TILE_VM, sort: 100 },
    }).execute({ action: 'bring-to-front', sceneId: 'scene-id-001', tileId: 'tile-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('send-to-back — tile sort updated', async () => {
    const r = await tool({
      tile: { ...TILE_VM, sort: -1 },
    }).execute({ action: 'send-to-back', sceneId: 'scene-id-001', tileId: 'tile-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
