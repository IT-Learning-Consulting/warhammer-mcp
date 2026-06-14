// Characterization snapshot — PlaylistTool write actions return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Split: write (create-playlist, update-playlist, delete-playlist, add-sound, update-sound,
//   delete-sound, play, stop, duplicate-playlist, pause-sound, bulk-import-sounds, preload-sound).

import { describe, it, expect } from 'vitest';
import { PlaylistTool } from '../../tools/playlist.js';
import { makeToolDeps } from '../test-utils.js';

const PLAYLIST_VIEW = {
  id: 'pl001',
  name: 'Tavern Ambience',
  description: '',
  channel: 'environment',
  mode: 1,
  playing: false,
  fade: 2000,
  seed: 0,
  sorting: 'a',
  sort: 0,
  folder: null,
  ownership: { default: 0 },
  flags: {},
  sounds: [],
};

const SOUND_VIEW = {
  id: 'snd001',
  name: 'Crowd Murmur',
  playlistId: 'pl001',
  path: 'worlds/aitww/audio/tavern-crowd.ogg',
  description: '',
  volume: 0.4,
  repeat: true,
  playing: false,
  fade: null,
  channel: null,
  sort: 0,
  flags: {},
  pausedTime: null,
};

const tool = (mockReturn: any) => new PlaylistTool(makeToolDeps(mockReturn));

describe('PlaylistTool — characterization (write)', () => {
  it('create-playlist — playlist created', async () => {
    const r = await tool({
      id: 'pl001',
      name: 'Tavern Ambience',
      soundIds: [],
      requestedChanges: { name: 'Tavern Ambience', channel: 'environment', mode: 1 },
      playlist: PLAYLIST_VIEW,
    }).execute({ action: 'create-playlist', name: 'Tavern Ambience', channel: 'environment', mode: 1 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update-playlist — changed fields + view', async () => {
    const r = await tool({
      playlistId: 'pl001',
      playlist: { ...PLAYLIST_VIEW, fade: 4000 },
      requestedChanges: { fade: 4000 },
      changedFields: ['fade'],
    }).execute({ action: 'update-playlist', playlistId: 'pl001', changes: { fade: 4000 } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete-playlist — cascade sounds', async () => {
    const r = await tool({
      playlistId: 'pl001',
      deletedSoundCount: 3,
      affectedDocs: [],
    }).execute({ action: 'delete-playlist', playlistId: 'pl001', confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('add-sound — sound added', async () => {
    const r = await tool({
      playlistId: 'pl001',
      sound: SOUND_VIEW,
      requestedChanges: { path: 'worlds/aitww/audio/tavern-crowd.ogg', volume: 0.4 },
    }).execute({ action: 'add-sound', playlistId: 'pl001', path: 'worlds/aitww/audio/tavern-crowd.ogg', volume: 0.4 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update-sound — changed fields + view', async () => {
    const r = await tool({
      playlistId: 'pl001',
      sound: { ...SOUND_VIEW, volume: 0.8 },
      requestedChanges: { volume: 0.8 },
      changedFields: ['volume'],
    }).execute({ action: 'update-sound', playlistId: 'pl001', soundId: 'snd001', changes: { volume: 0.8 } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete-sound — sound removed', async () => {
    const r = await tool({
      deletedId: 'snd001',
      playlistId: 'pl001',
      remainingSoundCount: 2,
      affectedDocs: [],
    }).execute({ action: 'delete-sound', playlistId: 'pl001', soundId: 'snd001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('play — playlist started', async () => {
    const r = await tool({ playlistId: 'pl001', playing: true, mode: 1 }).execute({ action: 'play', playlistId: 'pl001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('play — suppressed (disabled mode)', async () => {
    const r = await tool({ playlistId: 'pl001', playing: false, mode: -1, suppressed: true }).execute({ action: 'play', playlistId: 'pl001', mode: 'disabled' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('stop — playlist stopped', async () => {
    const r = await tool({ playlistId: 'pl001', playing: false }).execute({ action: 'stop', playlistId: 'pl001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('duplicate-playlist — cloned', async () => {
    const r = await tool({
      id: 'pl002',
      name: 'Tavern Ambience (Copy)',
      playlist: { ...PLAYLIST_VIEW, id: 'pl002', name: 'Tavern Ambience (Copy)' },
    }).execute({ action: 'duplicate-playlist', playlistId: 'pl001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('pause-sound — sound paused', async () => {
    const r = await tool({
      playlistId: 'pl001',
      sound: { ...SOUND_VIEW, playing: false, pausedTime: 42 },
      requestedChanges: { playing: false, pausedTime: 42 },
      changedFields: ['playing', 'pausedTime'],
    }).execute({ action: 'pause-sound', playlistId: 'pl001', soundId: 'snd001', pausedTime: 42 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('bulk-import-sounds — files imported', async () => {
    const r = await tool({
      playlistId: 'pl001',
      imported: 3,
      files: ['worlds/aitww/audio/a.ogg', 'worlds/aitww/audio/b.ogg', 'worlds/aitww/audio/c.ogg'],
    }).execute({ action: 'bulk-import-sounds', playlistId: 'pl001', folder: 'worlds/aitww/audio' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('preload-sound — pushed to clients', async () => {
    const r = await tool({ src: 'worlds/aitww/audio/tavern-crowd.ogg', preloaded: true }).execute({ action: 'preload-sound', src: 'worlds/aitww/audio/tavern-crowd.ogg' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
