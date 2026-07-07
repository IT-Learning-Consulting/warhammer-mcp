// Characterization snapshot — ModuleSceneAtmosphereTool READ actions.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers representative read-side output shapes + one MODULE_NOT_ACTIVE snapshot.

import { describe, it, expect } from 'vitest';
import { ModuleSceneAtmosphereTool } from '../../tools/modules/scene-atmosphere/scene-atmosphere.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any, mockThrow?: string) =>
  new ModuleSceneAtmosphereTool(makeToolDeps(mockReturn, mockThrow));

describe('ModuleSceneAtmosphereTool (read) — characterization', () => {
  // ── MODULE_NOT_ACTIVE ────────────────────────────────────────────────────────
  it('MODULE_NOT_ACTIVE — throws → moduleNotActiveContent format', async () => {
    const r = await tool(null, 'MODULE_NOT_ACTIVE: fxmaster is not active').execute({
      action: 'play-preset',
      preset: 'rain',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // ── Bundle status ────────────────────────────────────────────────────────────
  it('get-bundle-status — all members listed with active/inactive state', async () => {
    const r = await tool({
      members: [
        { id: 'fxmaster', active: true, title: 'FXMaster', version: '8.1.0' },
        { id: 'tokenmagic', active: true, title: 'Token Magic FX', version: '4.0.0' },
        { id: 'scenery', active: false, title: 'Scenery', version: null },
        { id: 'scene-transitions', active: false, title: 'Scene Transitions', version: null },
        { id: 'multiface-tiles', active: true, title: 'Multiface Tiles', version: '1.2.0' },
        { id: 'dynamic-soundscapes', active: false, title: 'Dynamic Soundscapes', version: null },
      ],
    }).execute({ action: 'get-bundle-status' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // ── fxmaster reads ───────────────────────────────────────────────────────────
  it('list-presets — preset name list with counts', async () => {
    const r = await tool({
      presets: ['rain', 'snow', 'fog', 'thunderstorm'],
      count: 4,
      hasFxmasterPlus: false,
      hasFxmaster: true,
      note: 'Free presets only (fxmaster-plus not active)',
    }).execute({ action: 'list-presets' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-active-presets — active presets on scene', async () => {
    const r = await tool({
      presets: ['rain'],
      count: 1,
      scene: 'scene-abc123',
    }).execute({ action: 'list-active-presets' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-valid-presets — valid preset names for current modules', async () => {
    const r = await tool({
      presets: ['rain', 'snow', 'fog'],
      count: 3,
      topDown: false,
      note: 'Only free presets — fxmaster-plus not active',
    }).execute({ action: 'list-valid-presets' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // ── scenery reads ────────────────────────────────────────────────────────────
  it('list-variations — multiple named variations', async () => {
    const r = await tool({
      sceneId: 'scene001',
      sceneName: 'Dungeon Hall',
      activeVariationIndex: 1,
      variations: [
        { index: 0, name: 'Default', gmBackground: 'modules/bg/default.webp', plBackground: 'modules/bg/default.webp', hasSceneData: false },
        { index: 1, name: 'Ruined', gmBackground: 'modules/bg/ruined.webp', plBackground: null, hasSceneData: true },
      ],
      count: 2,
    }).execute({ action: 'list-variations' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-active-variation — active variation details', async () => {
    const r = await tool({
      sceneId: 'scene001',
      sceneName: 'Dungeon Hall',
      hasScenery: true,
      activeVariationIndex: 1,
      activeVariation: {
        index: 1,
        name: 'Ruined',
        gmBackground: 'modules/bg/ruined.webp',
        plBackground: null,
        hasSceneData: true,
      },
    }).execute({ action: 'get-active-variation' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // ── multiface-tiles reads ─────────────────────────────────────────────────────
  it('list-tile-faces — tile with original + alt images', async () => {
    const r = await tool({
      tileId: 'tile001',
      originalImage: 'modules/tiles/door-closed.webp',
      altImages: ['modules/tiles/door-open.webp', 'modules/tiles/door-broken.webp'],
      activeFace: 'modules/tiles/door-open.webp',
      activeFaceLabel: 'alt[0]',
      totalFaces: 3,
      faces: [
        { label: 'original', path: 'modules/tiles/door-closed.webp', isActive: false },
        { label: 'alt[0]', path: 'modules/tiles/door-open.webp', isActive: true },
        { label: 'alt[1]', path: 'modules/tiles/door-broken.webp', isActive: false },
      ],
    }).execute({ action: 'list-tile-faces', tileId: 'tile001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // ── dynamic-soundscapes reads ─────────────────────────────────────────────────
  it('list-soundscapes — soundscape list with playing status', async () => {
    const r = await tool({
      soundscapesFolder: 'Soundscapes',
      soundscapesFolderId: 'folder001',
      playingPlaylistId: 'playlist001',
      count: 2,
      soundscapes: [
        { id: 'playlist001', name: 'Tavern Ambience', mood: 'moodA', isPlaying: true, blockCount: 2, soundCount: 5 },
        { id: 'playlist002', name: 'Combat', mood: 'moodB', isPlaying: false, blockCount: 1, soundCount: 3 },
      ],
    }).execute({ action: 'list-soundscapes' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-mood — mood read with explicit flag note', async () => {
    const r = await tool({
      playlistId: 'playlist001',
      playlistName: 'Tavern Ambience',
      mood: 'moodB',
      isFlagExplicit: true,
      moodNote: 'Mood flag set explicitly on playlist.',
    }).execute({ action: 'get-mood', playlistId: 'playlist001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
