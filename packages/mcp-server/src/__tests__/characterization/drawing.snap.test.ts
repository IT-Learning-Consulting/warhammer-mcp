// Characterization snapshot — DrawingTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Actions: create / update / delete / get / list (bare, countOnly) / duplicate.

import { describe, it, expect } from 'vitest';
import { DrawingTool } from '../../tools/drawing.js';
import { makeToolDeps } from '../test-utils.js';

const DRAWING_VM = {
  id: 'draw-id-001',
  sceneId: 'scene-id-001',
  shape: { type: 'rectangle', width: 200, height: 120, radius: 0, points: [] },
  bezierFactor: 0,
  x: 100,
  y: 150,
  rotation: 0,
  elevation: 0,
  sort: 0,
  fillType: 1,
  fillColor: '#ff0000',
  fillAlpha: 0.5,
  strokeColor: '#000000',
  strokeAlpha: 1,
  strokeWidth: 2,
  texture: null,
  text: 'Hazard Zone',
  fontFamily: 'Signika',
  fontSize: 48,
  textColor: '#ffffff',
  textAlpha: 1,
  hidden: false,
  locked: false,
  interface: false,
  flags: {},
};

const DRAWING_LIST_ITEM = {
  id: 'draw-id-001',
  sceneId: 'scene-id-001',
  shapeType: 'rectangle',
  text: 'Hazard Zone',
  hidden: false,
  locked: false,
};

const tool = (mockReturn: any) => new DrawingTool(makeToolDeps(mockReturn));

describe('DrawingTool — characterization', () => {
  it('create — drawing created view', async () => {
    const r = await tool({
      drawing: DRAWING_VM,
      requestedChanges: { action: 'create', sceneId: 'scene-id-001', x: 100, y: 150, shape: { type: 'rectangle', width: 200, height: 120 }, text: 'Hazard Zone' },
    }).execute({ action: 'create', sceneId: 'scene-id-001', x: 100, y: 150, shape: { type: 'rectangle', width: 200, height: 120 }, text: 'Hazard Zone' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update — changed fields + updated drawing view', async () => {
    const r = await tool({
      drawing: { ...DRAWING_VM, hidden: true },
      requestedChanges: { action: 'update', sceneId: 'scene-id-001', drawingId: 'draw-id-001', changes: { hidden: true } },
      changedFields: ['hidden'],
    }).execute({ action: 'update', sceneId: 'scene-id-001', drawingId: 'draw-id-001', changes: { hidden: true } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete — deleted confirmation', async () => {
    const r = await tool({
      deletedId: 'draw-id-001',
      sceneId: 'scene-id-001',
      remainingDrawings: 3,
    }).execute({ action: 'delete', sceneId: 'scene-id-001', drawingId: 'draw-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — single drawing view', async () => {
    const r = await tool({
      drawing: DRAWING_VM,
    }).execute({ action: 'get', sceneId: 'scene-id-001', drawingId: 'draw-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — paginated drawings', async () => {
    const r = await tool({
      drawings: [DRAWING_LIST_ITEM],
      total: 1,
      page: 1,
      pageSize: 50,
      pageCount: 1,
    }).execute({ action: 'list', sceneId: 'scene-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — countOnly path', async () => {
    const r = await tool({
      total: 7,
    }).execute({ action: 'list', sceneId: 'scene-id-001', countOnly: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('duplicate — cloned drawing with sourceId', async () => {
    const r = await tool({
      drawing: { ...DRAWING_VM, id: 'draw-id-002' },
      sourceId: 'draw-id-001',
    }).execute({ action: 'duplicate', sceneId: 'scene-id-001', drawingId: 'draw-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
