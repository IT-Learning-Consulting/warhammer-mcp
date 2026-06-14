// Characterization snapshot — ModuleSceneAtmosphereTool WRITE actions.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers main weather/filter/token-fx write output shapes.

import { describe, it, expect } from 'vitest';
import { ModuleSceneAtmosphereTool } from '../../tools/modules/scene-atmosphere/scene-atmosphere.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any, mockThrow?: string) =>
  new ModuleSceneAtmosphereTool(makeToolDeps(mockReturn, mockThrow));

describe('ModuleSceneAtmosphereTool (write) — characterization', () => {
  // ── fxmaster writes ──────────────────────────────────────────────────────────
  it('play-preset — preset play confirmation', async () => {
    const r = await tool({
      preset: 'rain',
      options: { topDown: false, density: 'medium' },
      activePresets: ['rain'],
    }).execute({ action: 'play-preset', preset: 'rain' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('stop-preset — preset stop with remaining active list', async () => {
    const r = await tool({
      preset: 'rain',
      stopped: true,
      activePresets: [],
    }).execute({ action: 'stop-preset', preset: 'rain' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('play-particles — particle effect ids and type list', async () => {
    const r = await tool({
      ids: { rain: 'fx-id-001' },
      particleCount: 1,
      types: ['rain'],
      verifiedEffectsFlag: { rain: 'fx-id-001' },
    }).execute({
      action: 'play-particles',
      particles: [{ type: 'rain', options: { density: 0.8 } }],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('clear-effects — nuclear clear confirmation with verify fields', async () => {
    const r = await tool({
      cleared: ['particles', 'filters'],
      target: 'both',
      verify: {
        effectsFlag: null,
        filtersFlag: null,
        stackFlag: null,
      },
    }).execute({ action: 'clear-effects', target: 'both', confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // ── tokenmagic writes ────────────────────────────────────────────────────────
  it('tokenmagic-apply — filter applied to token with verify count', async () => {
    const r = await tool({
      placeableId: 'token001',
      placeableType: 'Token',
      appliedCount: 1,
      filterTypes: ['glow'],
      filterIds: ['filter-id-001'],
      replace: false,
      verifiedFilterCount: 1,
    }).execute({
      action: 'tokenmagic-apply',
      placeableId: 'token001',
      placeableType: 'Token',
      params: [{ filterType: 'glow', color: 0xffcc00 }],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('tokenmagic-wound-create — wound filter applied', async () => {
    const r = await tool({
      tokenId: 'token001',
      tokenName: 'Goblin',
      damageFraction: 0.6,
      verifiedWoundFilterCount: 1,
    }).execute({
      action: 'tokenmagic-wound-create',
      tokenId: 'token001',
      damageFraction: 0.6,
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // ── scenery writes ────────────────────────────────────────────────────────────
  it('set-active-variation — switches scene variation', async () => {
    const r = await tool({
      sceneId: 'scene001',
      sceneName: 'Dungeon Hall',
      previousIndex: 0,
      newActiveIndex: 1,
      newVariationName: 'Ruined',
      verifiedActiveIndex: 1,
      elementRestoreSkipNote: 'Element restore skipped (no sceneData stored).',
    }).execute({ action: 'set-active-variation', variationIndex: 1, confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // ── multiface-tiles writes ────────────────────────────────────────────────────
  it('switch-tile-face — face changed with verify match', async () => {
    const r = await tool({
      tileId: 'tile001',
      tileName: 'Door',
      previousFacePath: 'modules/tiles/door-closed.webp',
      facePath: 'modules/tiles/door-open.webp',
      changed: true,
      verifiedTextureSrc: 'modules/tiles/door-open.webp',
      verifiedMatch: true,
    }).execute({
      action: 'switch-tile-face',
      tileId: 'tile001',
      facePath: 'modules/tiles/door-open.webp',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // ── dynamic-soundscapes writes ────────────────────────────────────────────────
  it('set-soundscape — activates soundscape playlist', async () => {
    const r = await tool({
      playlistId: 'playlist001',
      playlistName: 'Tavern Ambience',
      verifiedPlaylistId: 'playlist001',
      settingMatch: true,
      updateStateDelayNote: 'Audio output starts on GM client when RandomSoundController fires (~<1s delay).',
    }).execute({ action: 'set-soundscape', playlistId: 'playlist001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('set-mood — mood updated with verify', async () => {
    const r = await tool({
      playlistId: 'playlist001',
      playlistName: 'Tavern Ambience',
      mood: 'moodB',
      verifiedMood: 'moodB',
      moodMatch: true,
      moodNote: 'Mood B = tension/fight.',
    }).execute({ action: 'set-mood', mood: 'moodB', playlistId: 'playlist001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
