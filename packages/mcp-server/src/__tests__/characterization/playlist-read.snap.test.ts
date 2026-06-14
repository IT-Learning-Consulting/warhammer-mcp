// Characterization snapshot — PlaylistTool read actions return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Split: read (get-playlist, list-playlists bare/paginated/countOnly).

import { describe, it, expect } from 'vitest';
import { PlaylistTool } from '../../tools/playlist.js';
import { makeToolDeps } from '../test-utils.js';

const PLAYLIST_VIEW = {
  id: 'pl001',
  name: 'Tavern Ambience',
  description: 'Cozy tavern sounds.',
  channel: 'environment',
  mode: 1,
  playing: true,
  fade: 2000,
  seed: 42,
  sorting: 'a',
  sort: 0,
  folder: null,
  ownership: { default: 0 },
  flags: {},
  sounds: [
    {
      id: 'snd001',
      name: 'Crowd Murmur',
      playlistId: 'pl001',
      path: 'worlds/aitww/audio/tavern-crowd.ogg',
      volume: 0.4,
      repeat: true,
      playing: true,
      fade: null,
      channel: null,
      sort: 0,
      flags: {},
      description: '',
      pausedTime: null,
    },
  ],
};

const tool = (mockReturn: any) => new PlaylistTool(makeToolDeps(mockReturn));

describe('PlaylistTool — characterization (read)', () => {
  it('get-playlist — full playlist view', async () => {
    const r = await tool({ playlist: PLAYLIST_VIEW }).execute({ action: 'get-playlist', playlistId: 'pl001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-playlists — bare list', async () => {
    const r = await tool({
      playlists: [
        { id: 'pl001', name: 'Tavern Ambience', soundCount: 3, mode: 1, channel: 'environment', playing: true, folder: null },
        { id: 'pl002', name: 'Battle Music', soundCount: 1, mode: 2, channel: 'music', playing: false, folder: null },
      ],
    }).execute({ action: 'list-playlists' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-playlists — paginated shape', async () => {
    const r = await tool({
      total: 10,
      page: 1,
      pageSize: 5,
      pageCount: 2,
      playlists: [
        { id: 'pl001', name: 'Tavern Ambience', soundCount: 3, mode: 1, channel: 'environment', playing: true, folder: null },
      ],
    }).execute({ action: 'list-playlists', page: 1, pageSize: 5 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-playlists — countOnly', async () => {
    const r = await tool({ total: 8, filterApplied: null }).execute({ action: 'list-playlists', countOnly: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-playlists — empty world', async () => {
    const r = await tool({ playlists: [] }).execute({ action: 'list-playlists' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
