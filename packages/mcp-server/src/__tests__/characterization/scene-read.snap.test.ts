// Characterization snapshot — SceneTool read actions return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Split: read (get, list, list-paginated, list-countOnly, thumbnail) vs write.

import { describe, it, expect } from 'vitest';
import { SceneTool } from '../../tools/scene.js';
import { makeToolDeps } from '../test-utils.js';

const SCENE_VIEW = {
  id: 'scene001',
  name: 'Red Moon Inn',
  active: true,
  navigation: true,
  navName: 'Tavern',
  background: { src: 'worlds/aitww/maps/tavern.webp', anchorX: 0.5, anchorY: 0.5, offsetX: 0, offsetY: 0, fit: 'contain', scaleX: 1, scaleY: 1, rotation: 0, tint: null, alphaThreshold: 0.75 },
  foreground: null,
  foregroundElevation: null,
  thumb: 'worlds/aitww/thumbs/tavern.webp',
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
  counts: { tokens: 3, walls: 42, lights: 5, sounds: 2, notes: 0, drawings: 0, regions: 0, templates: 0, tiles: 1 },
};

const tool = (mockReturn: any) => new SceneTool(makeToolDeps(mockReturn));

describe('SceneTool — characterization (read)', () => {
  it('get — full scene view without tokens', async () => {
    const r = await tool({ scene: SCENE_VIEW }).execute({ action: 'get', sceneId: 'scene001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — with tokens', async () => {
    const r = await tool({
      scene: SCENE_VIEW,
      tokens: [
        { id: 'tok1', name: 'Hans Mauer', position: { x: 500, y: 300 }, size: { width: 1, height: 1 }, disposition: 'FRIENDLY', hidden: false, actorId: 'actor1' },
        { id: 'tok2', name: 'Goblin', position: { x: 800, y: 400 }, size: { width: 1, height: 1 }, disposition: 'HOSTILE', hidden: true, actorId: null },
      ],
      tokenSummary: { total: 2, byDisposition: { hostile: 1, neutral: 0, friendly: 1, unknown: 0 }, hasActors: 1, withoutActors: 1 },
    }).execute({ action: 'get', sceneId: 'scene001', includeTokens: true, includeHidden: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — bare (no pagination)', async () => {
    const r = await tool({
      scenes: [
        { id: 'scene001', name: 'Red Moon Inn', active: true, navigation: true, width: 2048, height: 1536, folder: null },
        { id: 'scene002', name: 'Bögenhafen Market', active: false, navigation: true, width: 1024, height: 768, folder: null },
      ],
    }).execute({ action: 'list' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — paginated shape', async () => {
    const r = await tool({
      scenes: [{ id: 'scene001', name: 'Red Moon Inn', active: true, navigation: true, width: 2048, height: 1536 }],
      total: 5,
      page: 1,
      pageSize: 2,
      pageCount: 3,
    }).execute({ action: 'list', page: 1, pageSize: 2 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — countOnly shape', async () => {
    const r = await tool({ total: 7, filterApplied: null }).execute({ action: 'list', countOnly: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('thumbnail — data url summary', async () => {
    const r = await tool({
      sceneName: 'Red Moon Inn',
      sceneId: 'scene001',
      width: 300,
      height: 100,
      format: 'webp',
      thumbDataUrl: 'data:image/webp;base64,' + 'A'.repeat(200),
    }).execute({ action: 'thumbnail', sceneId: 'scene001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
