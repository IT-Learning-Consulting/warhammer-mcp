// Phase 7 mcp_crud_expansion — Playlist + PlaylistSound umbrella tool.
//
// Wraps the `playlist` foundry-side handler (dispatchPlaylist). 10 actions:
// world-level Playlist CRUD (create/update/delete-playlist + get/list-playlist
// + play/stop) plus embedded PlaylistSound CRUD (add/update/delete-sound).
//
// **CCR-Envelope-Consumer / DP-15:** every handler uses a concrete typed
// generic on `this.query<...>` — no `<any>`. BUG-069: this.query<T> returns
// BARE unwrapped data; never check `.success` on the return.
//
// **DP-18 cascade-aware verify:** delete-playlist response surfaces
// `deletedSoundCount` so the consumer can render the cascade in chat.
//
// **DP-19 formatter completeness:** every field claimed by the description is
// grep-findable in the formatter functions below.
//
// **DP-20 / BUG-088 4-surface parity:** every nullable Zod field has a
// matching inputSchema.type union (e.g. ["string","null"]).

import { z } from 'zod';
import {
  PlaylistToolInput,
  type PlaylistViewModel,
  type PlaylistSoundViewModel,
  type PlaylistListItem,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';
import { formatAffectedDocs } from './format-affected-docs.js';

type PlaylistArgs = z.infer<typeof PlaylistToolInput>;
type ArgsFor<A extends PlaylistArgs['action']> = Extract<PlaylistArgs, { action: A }>;

// ── Inline response interfaces (mirror foundry-module handler local types) ────

interface PlaylistCreatePlaylistResponse {
  id: string;
  name: string;
  soundIds: string[];
  requestedChanges: Record<string, unknown>;
  playlist: PlaylistViewModel;
}
interface PlaylistUpdatePlaylistResponse {
  playlistId: string;
  playlist: PlaylistViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}
interface PlaylistDeletePlaylistResponse {
  playlistId: string;
  deletedSoundCount: number;
  affectedDocs?: import('@foundry-mcp/shared').FkAffectedDocEntry[];
}
interface PlaylistGetPlaylistResponse {
  playlist: PlaylistViewModel;
}

interface PlaylistListBareResponse {
  playlists: PlaylistListItem[];
}
interface PlaylistListPaginatedResponse {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  playlists: PlaylistListItem[];
}
interface PlaylistListCountResponse {
  total: number;
  filterApplied: string | null;
}
type PlaylistListResponse =
  | PlaylistListBareResponse
  | PlaylistListPaginatedResponse
  | PlaylistListCountResponse;

interface PlaylistAddSoundResponse {
  playlistId: string;
  sound: PlaylistSoundViewModel;
  requestedChanges: Record<string, unknown>;
}
interface PlaylistUpdateSoundResponse {
  playlistId: string;
  sound: PlaylistSoundViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}
interface PlaylistDeleteSoundResponse {
  deletedId: string;
  playlistId: string;
  remainingSoundCount: number;
  affectedDocs?: import('@foundry-mcp/shared').FkAffectedDocEntry[];
}

interface PlaylistPlayResponse {
  playlistId: string;
  playing: boolean;
  mode: number;
}
interface PlaylistStopResponse {
  playlistId: string;
  playing: boolean;
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function errorContent(action: string, message: string) {
  return {
    content: [{ type: 'text' as const, text: `Playlist/${action} failed: ${message}` }],
    isError: true,
  };
}

function modeName(mode: number): string {
  switch (mode) {
    case -1: return 'disabled';
    case 0:  return 'sequential';
    case 1:  return 'shuffle';
    case 2:  return 'simultaneous';
    default: return `unknown(${mode})`;
  }
}

function formatPlaylistView(p: PlaylistViewModel): string {
  const soundLines = p.sounds.length
    ? p.sounds.map((s) => `  - \`${s.id}\` ${s.name} · ${s.path} · vol=${s.volume} · repeat=${s.repeat ? 'yes' : 'no'} · playing=${s.playing ? 'yes' : 'no'} · fade=${s.fade ?? 'inherit'} · channel=${s.channel ?? 'inherit'}${s.pausedTime !== null ? ` · paused@${s.pausedTime}s` : ''}`).join('\n')
    : '  _(no sounds)_';
  return [
    `## Playlist \`${p.id}\` — ${p.name}`,
    p.description ? `**Description:** ${p.description}` : '',
    ``,
    `### Settings`,
    `- channel: ${p.channel} · mode: ${modeName(p.mode)} · sorting: ${p.sorting} · sort: ${p.sort}`,
    `- playing: ${p.playing ? 'yes' : 'no'} · fade: ${p.fade}ms · seed: ${p.seed}`,
    `- folder: ${p.folder ?? '_(none)_'}`,
    ``,
    `### Sounds (${p.sounds.length})`,
    soundLines,
    ``,
    `### Ownership / Flags`,
    `- ownership keys: ${Object.keys(p.ownership).length}`,
    `- flags keys: ${Object.keys(p.flags).length}`,
  ].filter(Boolean).join('\n');
}

function formatPlaylistListItem(p: PlaylistListItem): string {
  return (
    `- \`${p.id}\` ${p.name}` +
    ` · sounds=${p.soundCount}` +
    ` · mode=${modeName(p.mode)}` +
    ` · channel=${p.channel}` +
    ` · playing=${p.playing ? 'yes' : 'no'}` +
    ` · folder=${p.folder ?? '_(none)_'}`
  );
}

function formatPlaylistSoundView(s: PlaylistSoundViewModel): string {
  return [
    `## PlaylistSound \`${s.id}\` — ${s.name}`,
    `**Playlist:** \`${s.playlistId}\``,
    s.description ? `**Description:** ${s.description}` : '',
    ``,
    `### Audio`,
    `- path: ${s.path}`,
    `- volume: ${s.volume} · repeat: ${s.repeat ? 'yes' : 'no'} · fade: ${s.fade ?? 'inherit'}ms · channel: ${s.channel ?? 'inherit'}`,
    ``,
    `### Playback`,
    `- playing: ${s.playing ? 'yes' : 'no'}${s.pausedTime !== null ? ` · paused@${s.pausedTime}s` : ''} · sort: ${s.sort}`,
    ``,
    `### Flags`,
    `- flag keys: ${Object.keys(s.flags).length}`,
  ].filter(Boolean).join('\n');
}

export interface PlaylistToolOptions extends BaseToolOptions {}

export class PlaylistTool extends BaseTool {
  constructor(options: PlaylistToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'playlist',
        title: 'Manage Playlists + PlaylistSounds',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Manage Foundry VTT Playlist + embedded PlaylistSound documents. 10 actions span world-level Playlist CRUD, embedded sound CRUD, and playback control.

**Actions:**
- **create-playlist**: Create a new Playlist. Required: name. Optional: description, channel (environment/interface/music), mode (-1 disabled / 0 sequential / 1 shuffle / 2 simultaneous), playing, fade (ms), seed, sorting (a/m), sort, folder, ownership, flags, and inline sounds array (each sound: name, path required + description, channel, repeat, fade, sort, volume 0-1, playing, pausedTime, flags). Returns id, name, soundIds, requestedChanges, playlist view.
- **update-playlist**: Partial-diff update. playlistId + changes (≥1 of: name, description, channel, mode, playing, fade, seed, sorting, sort, folder, ownership, flags). Returns playlist view + changedFields.
- **delete-playlist**: Hard delete with CCR-Delete-Safety. playlistId + confirm: true (REQUIRED — false rejects). Cascades to all embedded sounds. Returns deletedSoundCount.
- **get-playlist**: Fetch full Playlist + nested sounds by playlistId. Returns PlaylistViewModel with sounds array.
- **list-playlists**: List world playlists. Optional filter (substring on name), folder (id or null), page/pageSize (1-100), countOnly. Items: id, name, playing, soundCount, mode, channel, folder.
- **add-sound**: Add a PlaylistSound to a Playlist. Required: playlistId + path. Optional: name, description, channel, repeat, fade (ms; null = inherit playlist), sort, volume (0-1), playing, pausedTime (null = not paused), flags. Returns sound view.
- **update-sound**: Partial-diff on a PlaylistSound. playlistId + soundId + changes (≥1 field). Returns sound view + changedFields.
- **delete-sound**: Remove a PlaylistSound from a Playlist. playlistId + soundId. Returns remainingSoundCount.
- **play**: Play a Playlist via playAll(). playlistId + optional mode override (sequential/shuffle/simultaneous/disabled). Returns persisted playing + mode.
- **stop**: Stop a Playlist via stopAll(). playlistId. Returns persisted playing.

**Examples:**
- create: {action:"create-playlist", name:"Tavern", channel:"environment", mode:1, sounds:[{path:"music/tavern.ogg", volume:0.4}]}
- update: {action:"update-playlist", playlistId:"abc", changes:{fade:2000, mode:2}}
- delete: {action:"delete-playlist", playlistId:"abc", confirm:true}
- add-sound: {action:"add-sound", playlistId:"abc", path:"music/track.ogg", volume:0.5, repeat:true}
- play: {action:"play", playlistId:"abc", mode:"shuffle"}`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'create-playlist',
                'update-playlist',
                'delete-playlist',
                'get-playlist',
                'list-playlists',
                'add-sound',
                'update-sound',
                'delete-sound',
                'play',
                'stop',
              ],
              description: 'The playlist action to perform.',
            },
            playlistId: {
              type: 'string',
              description: '[update/delete/get/play/stop/list/add-sound/update-sound/delete-sound] Playlist document ID.',
            },
            soundId: {
              type: 'string',
              description: '[update-sound/delete-sound] PlaylistSound document ID.',
            },
            // create-playlist / update-playlist.changes / add-sound writable fields
            name: { type: 'string', description: '[create-playlist] Required playlist name. [add-sound] Sound name.' },
            description: { type: 'string', description: '[create-playlist/update-playlist.changes/add-sound/update-sound.changes] Optional description text.' },
            channel: {
              type: ['string', 'null'],
              enum: ['environment', 'interface', 'music', null],
              description: '[create-playlist/update-playlist.changes/add-sound/update-sound.changes] AUDIO_CHANNELS key. On sound: null = inherit playlist.',
            },
            mode: {
              type: ['integer', 'string'],
              enum: [-1, 0, 1, 2, 'sequential', 'shuffle', 'simultaneous', 'disabled'],
              description: '[create-playlist/update-playlist.changes] Numeric PLAYLIST_MODE (-1/0/1/2). [play] String alias (sequential/shuffle/simultaneous/disabled).',
            },
            playing: { type: 'boolean', description: '[create-playlist/update-playlist.changes/add-sound/update-sound.changes] Currently playing flag.' },
            fade: {
              type: ['integer', 'null'],
              minimum: 0,
              description: '[create-playlist/update-playlist.changes] Playlist fade ms (non-null). [add-sound/update-sound.changes] Sound fade ms; null = inherit playlist.',
            },
            seed: { type: 'integer', description: '[create-playlist/update-playlist.changes] Randomization seed for SHUFFLE mode.' },
            sorting: {
              type: 'string',
              enum: ['a', 'm'],
              description: '[create-playlist/update-playlist.changes] Sort mode: a (ALPHABETICAL) or m (MANUAL).',
            },
            sort: { type: 'integer', description: '[create-playlist/update-playlist.changes/add-sound/update-sound.changes] Sort position integer.' },
            folder: {
              type: ['string', 'null'],
              description: '[create-playlist/update-playlist.changes/list-playlists] Folder document ID; null = no folder.',
            },
            ownership: {
              type: 'object',
              description: '[create-playlist/update-playlist.changes] Per-user ownership map: { default?: 0|1|2|3, "<userId>": 0|1|2|3, ... }.',
            },
            flags: { type: 'object', description: '[create-playlist/update-playlist.changes/add-sound/update-sound.changes] Foundry flag bag.' },
            sounds: {
              type: 'array',
              items: { type: 'object' },
              description: '[create-playlist] Inline sound creation. Array of { name?, description?, channel?, path (required), repeat?, fade?, sort?, volume?, playing?, pausedTime?, flags? }.',
            },
            // add-sound writable fields
            path: { type: 'string', minLength: 1, description: '[add-sound] Required audio file path. [update-sound.changes] Optional new path.' },
            repeat: { type: 'boolean', description: '[add-sound/update-sound.changes] Loop the sound on natural end.' },
            volume: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: '[add-sound/update-sound.changes] AlphaField volume 0-1.',
            },
            pausedTime: {
              type: ['number', 'null'],
              description: '[add-sound/update-sound.changes] Seconds offset when paused; null = not paused.',
            },
            // update actions
            changes: {
              type: 'object',
              description:
                '[update-playlist/update-sound] Partial-diff of writable fields. Must contain ≥1. Playlist: name, description, channel, mode, playing, fade, seed, sorting, sort, folder, ownership, flags. Sound: name, description, channel, path, repeat, fade, sort, volume, playing, pausedTime, flags.',
            },
            // delete-playlist CCR-Delete-Safety
            confirm: {
              type: 'boolean',
              description: '[delete-playlist] Required confirmation flag. Must be true to proceed with hard delete (cascades to all embedded sounds).',
            },
            // list-playlists
            filter: { type: 'string', description: '[list-playlists] Substring match on playlist name (case-insensitive).' },
            page: { type: 'integer', minimum: 1, description: '[list-playlists] 1-based page number.' },
            pageSize: { type: 'integer', minimum: 1, maximum: 100, description: '[list-playlists] Items per page (default 20).' },
            countOnly: { type: 'boolean', description: '[list-playlists] Return {total, filterApplied} only.' },
            // Phase 10 cross-doc-fk cascade flag (delete-playlist / delete-sound only).
            cascade: { type: 'boolean', description: '[delete-playlist/delete-sound] When true, clears Scene.playlist / Scene.playlistSound FKs targeting this playlist or sound before deletion. Default false.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: PlaylistArgs) {
    this.logger.info('Executing playlist action', { action: args.action });
    switch (args.action) {
      case 'create-playlist':
        return this.handleCreatePlaylist(args);
      case 'update-playlist':
        return this.handleUpdatePlaylist(args);
      case 'delete-playlist':
        return this.handleDeletePlaylist(args);
      case 'get-playlist':
        return this.handleGetPlaylist(args);
      case 'list-playlists':
        return this.handleListPlaylists(args);
      case 'add-sound':
        return this.handleAddSound(args);
      case 'update-sound':
        return this.handleUpdateSound(args);
      case 'delete-sound':
        return this.handleDeleteSound(args);
      case 'play':
        return this.handlePlay(args);
      case 'stop':
        return this.handleStop(args);
    }
  }

  // ── Handlers (concrete typed per CCR-Envelope-Consumer rule 3) ────────────

  private async handleCreatePlaylist(args: ArgsFor<'create-playlist'>) {
    try {
      const data = await this.query<PlaylistCreatePlaylistResponse>('playlist', args);
      const reqKeys = Object.keys(data.requestedChanges).filter((k) => k !== 'action').join(', ');
      const text =
        `Playlist Created\n\n${formatPlaylistView(data.playlist)}\n\n` +
        `**Inline sound IDs:** ${data.soundIds.length ? data.soundIds.map((id) => `\`${id}\``).join(', ') : '_(none)_'}\n` +
        `**Requested fields:** ${reqKeys || '(name only)'}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('create-playlist', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdatePlaylist(args: ArgsFor<'update-playlist'>) {
    try {
      const data = await this.query<PlaylistUpdatePlaylistResponse>('playlist', args);
      const text =
        `Playlist Updated\n\n**Changed fields:** ${data.changedFields.join(', ')}\n\n${formatPlaylistView(data.playlist)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('update-playlist', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDeletePlaylist(args: ArgsFor<'delete-playlist'>) {
    try {
      const data = await this.query<PlaylistDeletePlaylistResponse>('playlist', args);
      const text =
        `Playlist Deleted\n\n**ID:** \`${data.playlistId}\`\n**Cascaded sounds:** ${data.deletedSoundCount}\n\nPermanent — recovery requires journal restore or fresh creation.${formatAffectedDocs(data.affectedDocs)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('delete-playlist', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleGetPlaylist(args: ArgsFor<'get-playlist'>) {
    try {
      const data = await this.query<PlaylistGetPlaylistResponse>('playlist', args);
      return { content: [{ type: 'text' as const, text: formatPlaylistView(data.playlist) }] };
    } catch (e) {
      return errorContent('get-playlist', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleListPlaylists(args: ArgsFor<'list-playlists'>) {
    try {
      const data = await this.query<PlaylistListResponse>('playlist', args);

      if ('pageCount' in data) {
        const p = data as PlaylistListPaginatedResponse;
        const lines = p.playlists.map(formatPlaylistListItem);
        const text = `Playlists (page ${p.page} of ${p.pageCount}, ${p.total} total)\n\n${lines.join('\n') || '_(none)_'}`;
        return { content: [{ type: 'text' as const, text }] };
      }

      if ('filterApplied' in data) {
        const c = data as PlaylistListCountResponse;
        const text = `Playlist count\n\n**Total:** ${c.total}${c.filterApplied ? `\n**Filter applied:** ${c.filterApplied}` : ''}`;
        return { content: [{ type: 'text' as const, text }] };
      }

      const bare = data as PlaylistListBareResponse;
      if (bare.playlists.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No Playlists found.' }] };
      }
      const lines = bare.playlists.map(formatPlaylistListItem);
      const text = `Playlists (${bare.playlists.length})\n\n${lines.join('\n')}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('list-playlists', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleAddSound(args: ArgsFor<'add-sound'>) {
    try {
      const data = await this.query<PlaylistAddSoundResponse>('playlist', args);
      const reqKeys = Object.keys(data.requestedChanges).filter((k) => k !== 'action' && k !== 'playlistId').join(', ');
      const text =
        `PlaylistSound Added\n\n${formatPlaylistSoundView(data.sound)}\n\n**Requested fields:** ${reqKeys || '(path only)'}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('add-sound', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdateSound(args: ArgsFor<'update-sound'>) {
    try {
      const data = await this.query<PlaylistUpdateSoundResponse>('playlist', args);
      const text =
        `PlaylistSound Updated\n\n**Changed fields:** ${data.changedFields.join(', ')}\n\n${formatPlaylistSoundView(data.sound)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('update-sound', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDeleteSound(args: ArgsFor<'delete-sound'>) {
    try {
      const data = await this.query<PlaylistDeleteSoundResponse>('playlist', args);
      const text =
        `PlaylistSound Deleted\n\n**ID:** \`${data.deletedId}\`\n**Playlist:** \`${data.playlistId}\`\n**Remaining sounds:** ${data.remainingSoundCount}${formatAffectedDocs(data.affectedDocs)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('delete-sound', e instanceof Error ? e.message : String(e));
    }
  }

  private async handlePlay(args: ArgsFor<'play'>) {
    try {
      const data = await this.query<PlaylistPlayResponse>('playlist', args);
      const text =
        `Playlist Started\n\n**Playlist:** \`${data.playlistId}\`\n**Mode:** ${modeName(data.mode)}\n**Playing:** ${data.playing ? 'yes' : 'no'}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('play', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleStop(args: ArgsFor<'stop'>) {
    try {
      const data = await this.query<PlaylistStopResponse>('playlist', args);
      const text =
        `Playlist Stopped\n\n**Playlist:** \`${data.playlistId}\`\n**Playing:** ${data.playing ? 'yes' : 'no'}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('stop', e instanceof Error ? e.message : String(e));
    }
  }
}
