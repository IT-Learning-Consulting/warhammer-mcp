// Characterization snapshot — SceneTool write actions return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Split: write (create, update, delete, clone, activate, view, clear-layer, reset-fog, lighting-transition, preload, import-from-compendium).

import { describe, it, expect } from 'vitest';
import { SceneTool } from '../../tools/scene.js';
import { makeToolDeps } from '../test-utils.js';

const SCENE_VIEW = {
  id: 'scene001',
  name: 'Red Moon Inn',
  active: false,
  navigation: true,
  navName: '',
  background: { src: 'worlds/aitww/maps/tavern.webp', anchorX: 0.5, anchorY: 0.5, offsetX: 0, offsetY: 0, fit: 'contain', scaleX: 1, scaleY: 1, rotation: 0, tint: null, alphaThreshold: 0.75 },
  foreground: null,
  foregroundElevation: null,
  thumb: null,
  backgroundColor: '#000000',
  width: 2048,
  height: 1536,
  padding: 0.25,
  initial: { x: null, y: null, scale: null },
  grid: { type: 1, typeName: 'SQUARE', size: 100, distance: 5, units: 'yds', style: 'solidLines', thickness: 1, color: '#000000', alpha: 0.2 },
  tokenVision: true,
  fog: { exploration: true, reset: null, overlay: null, colors: { explored: null, unexplored: null } },
  environment: {
    darknessLevel: 0,
    darknessLock: false,
    cycle: false,
    globalLight: { enabled: false, alpha: 0.5, bright: false, color: null, coloration: null, luminosity: 0, saturation: 0, contrast: 0, shadows: 0, darkness: { min: 0, max: 1 } },
  },
  journal: null,
  journalLinked: false,
  journalEntryPage: null,
  journalEntryPageLinked: false,
  playlist: null,
  playlistLinked: false,
  playlistSound: null,
  playlistSoundLinked: false,
  weather: '',
  folder: null,
  folderLinked: false,
  sort: 0,
  ownership: { default: 0 },
  counts: { tokens: 0, walls: 0, lights: 0, sounds: 0, notes: 0, drawings: 0, regions: 0, templates: 0, tiles: 0 },
};

const tool = (mockReturn: any) => new SceneTool(makeToolDeps(mockReturn));

describe('SceneTool — characterization (write)', () => {
  it('create — full scene view', async () => {
    const r = await tool({
      scene: SCENE_VIEW,
      requestedChanges: { name: 'Red Moon Inn', background: { src: 'worlds/aitww/maps/tavern.webp' } },
    }).execute({ action: 'create', name: 'Red Moon Inn', background: { src: 'worlds/aitww/maps/tavern.webp' } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update — changed fields + scene view', async () => {
    const r = await tool({
      scene: { ...SCENE_VIEW, name: 'Tavern Renamed' },
      changedFields: ['name'],
    }).execute({ action: 'update', sceneId: 'scene001', changes: { name: 'Tavern Renamed' } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete — permanent removal', async () => {
    const r = await tool({
      deletedName: 'Red Moon Inn',
      deletedId: 'scene001',
      remainingScenes: 4,
      affectedDocs: [],
    }).execute({ action: 'delete', sceneId: 'scene001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('clone — source + clone view', async () => {
    const r = await tool({
      source: { name: 'Red Moon Inn', id: 'scene001' },
      clone: { ...SCENE_VIEW, id: 'scene002', name: 'Red Moon Inn (Copy)' },
    }).execute({ action: 'clone', sceneId: 'scene001', newName: 'Red Moon Inn (Copy)' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('activate — sets world-active scene', async () => {
    const r = await tool({
      activatedName: 'Red Moon Inn',
      activatedId: 'scene001',
      previousActiveId: 'scene000',
    }).execute({ action: 'activate', sceneId: 'scene001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('view — local camera switch', async () => {
    const r = await tool({
      viewedName: 'Red Moon Inn',
      viewedId: 'scene001',
    }).execute({ action: 'view', sceneId: 'scene001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('clear-layer — dryRun preview', async () => {
    const r = await tool({
      dryRun: true,
      layer: 'lights',
      sceneId: 'scene001',
      count: 3,
      items: [
        { id: 'light1', name: 'Torch' },
        { id: 'light2', name: 'Lantern' },
        { id: 'light3', name: null },
      ],
    }).execute({ action: 'clear-layer', sceneId: 'scene001', layer: 'lights', dryRun: true, confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('clear-layer — execute delete', async () => {
    const r = await tool({
      dryRun: false,
      layer: 'lights',
      sceneId: 'scene001',
      count: 3,
      items: [],
    }).execute({ action: 'clear-layer', sceneId: 'scene001', layer: 'lights', confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('reset-fog — fog docs cleared', async () => {
    const r = await tool({ sceneId: 'scene001', fogDocsRemaining: 0 }).execute({ action: 'reset-fog', sceneId: 'scene001', confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('lighting-transition — darkness persisted', async () => {
    const r = await tool({ sceneId: 'scene001', darknessLevel: 0, target: 'day' }).execute({ action: 'lighting-transition', sceneId: 'scene001', target: 'day', confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('preload — push to clients', async () => {
    const r = await tool({ sceneName: 'Red Moon Inn', sceneId: 'scene001' }).execute({ action: 'preload', sceneId: 'scene001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('import-from-compendium — imported scene view', async () => {
    const r = await tool({
      sourcePack: 'wfrp4e-core.scenes',
      scene: { ...SCENE_VIEW, id: 'scene999', name: 'Bögenhafen' },
    }).execute({ action: 'import-from-compendium', packId: 'wfrp4e-core.scenes', documentId: 'docXYZ' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
