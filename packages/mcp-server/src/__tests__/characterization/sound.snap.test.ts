// Characterization snapshot — SoundTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Actions: create / update / delete / get / list (bare, paginated, countOnly) / duplicate.

import { describe, it, expect } from 'vitest';
import { SoundTool } from '../../tools/sound.js';
import { makeToolDeps } from '../test-utils.js';

const SOUND_VM = {
  id: 'sound-id-001',
  sceneId: 'scene-id-001',
  x: 500,
  y: 300,
  elevation: 0,
  radius: 30,
  path: 'sounds/ambient/tavern.ogg',
  volume: 0.4,
  repeat: true,
  easing: true,
  walls: true,
  hidden: false,
  darkness: { min: 0, max: 1 },
  effects: {
    base: { type: null, intensity: 5 },
    muffled: { type: null, intensity: 5 },
  },
  flags: {},
};

const SOUND_LIST_ITEM = {
  id: 'sound-id-001',
  sceneId: 'scene-id-001',
  volume: 0.4,
  hidden: false,
  path: 'sounds/ambient/tavern.ogg',
};

const tool = (mockReturn: any) => new SoundTool(makeToolDeps(mockReturn));

describe('SoundTool — characterization', () => {
  it('create — ambient sound created with requested fields', async () => {
    const r = await tool({
      sound: SOUND_VM,
      requestedChanges: { action: 'create', sceneId: 'scene-id-001', x: 500, y: 300, path: 'sounds/ambient/tavern.ogg', volume: 0.4, radius: 30 },
    }).execute({ action: 'create', sceneId: 'scene-id-001', x: 500, y: 300, path: 'sounds/ambient/tavern.ogg', volume: 0.4, radius: 30 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update — changed fields + updated sound view', async () => {
    const r = await tool({
      sound: { ...SOUND_VM, hidden: true, volume: 0.6 },
      requestedChanges: { action: 'update', sceneId: 'scene-id-001', soundId: 'sound-id-001', changes: { hidden: true, volume: 0.6 } },
      changedFields: ['hidden', 'volume'],
    }).execute({ action: 'update', sceneId: 'scene-id-001', soundId: 'sound-id-001', changes: { hidden: true, volume: 0.6 } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete — deleted confirmation with remaining count', async () => {
    const r = await tool({
      deletedId: 'sound-id-001',
      remainingSounds: 1,
    }).execute({ action: 'delete', sceneId: 'scene-id-001', soundId: 'sound-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — single sound view', async () => {
    const r = await tool({
      sound: SOUND_VM,
    }).execute({ action: 'get', sceneId: 'scene-id-001', soundId: 'sound-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — bare list of sounds', async () => {
    const r = await tool({
      sounds: [SOUND_LIST_ITEM],
    }).execute({ action: 'list', sceneId: 'scene-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — paginated sounds', async () => {
    const r = await tool({
      sounds: [SOUND_LIST_ITEM],
      total: 3,
      page: 1,
      pageSize: 20,
      pageCount: 1,
    }).execute({ action: 'list', sceneId: 'scene-id-001', page: 1, pageSize: 20 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — countOnly path with filter', async () => {
    const r = await tool({
      total: 2,
      filterApplied: 'tavern',
    }).execute({ action: 'list', sceneId: 'scene-id-001', countOnly: true, filter: 'tavern' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('duplicate — cloned sound with sourceId', async () => {
    const r = await tool({
      sound: { ...SOUND_VM, id: 'sound-id-002' },
      sourceId: 'sound-id-001',
    }).execute({ action: 'duplicate', sceneId: 'scene-id-001', soundId: 'sound-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
