// Phase 7 mcp_crud_expansion — Playlist + PlaylistSound umbrella schema.
//
// Single `playlist` MCP tool with 10 actions on Playlist (world-level) +
// PlaylistSound (embedded). Eight mutation actions per PRD R7.1
// (create-playlist, update-playlist, delete-playlist, add-sound, update-sound,
// delete-sound, play, stop) plus get-playlist + list-playlists hygiene.
//
// Anchors — verified via F12 paste 2026-05-17 (.agents/research/mcp_crud_expansion/phase7_probes.md):
//   - Playlist schema: 15 fields. _id, _stats, channel, description, fade,
//     flags, folder, mode, name, ownership, playing, seed, sort, sorting, sounds.
//   - PlaylistSound schema: 12 fields. _id, channel, description, fade, flags,
//     name, path, pausedTime, playing, repeat, sort, volume. NO _stats.
//   - Playlist.prototype.playAll / stopAll: parameterless functions (length 0).
//   - Playlist.prototype.playSound / stopSound: take 1 arg (PlaylistSound doc).
//   - Embedded type string for createEmbeddedDocuments = "PlaylistSound"
//     (the metadata.name — singular). NOT "PlaylistSounds".
//   - volume: AlphaField → [0.0, 1.0] (research §2 §8 — interface drops range).
//   - CONST.PLAYLIST_MODES: -1 (DISABLED), 0 (SEQUENTIAL), 1 (SHUFFLE), 2 (SIMULTANEOUS).
//   - CONST.PLAYLIST_SORT_MODES: "a" (ALPHABETICAL), "m" (MANUAL).
//   - CONST.AUDIO_CHANNELS keys: "environment", "interface", "music".
//
// CCR-Schema-Fidelity: Zod field paths mirror Foundry defineSchema paths 1:1.
// CCR-Envelope-Consumer: every response interface is a concrete shape, no <any>.
// CCR-Umbrella-Hygiene: action names are <verb>-<noun> kebab-case; ≤ 10 fields
// per action variant excluding the discriminator.
// CCR-Delete-Safety: delete-playlist requires `confirm: true` for the hard-delete
// path; the /wfrp-playlist skill prefers archive-by-rename before confirm.

import { z } from 'zod';

// ── Constants & small shared shapes ──────────────────────────────────────────

const FOUNDRY_ID = z.string().min(1);

// CONST.PLAYLIST_MODES — explicit numeric literals (do NOT use z.nativeEnum on
// the numeric-mode enum: -1 reverse-mapping creates false positives).
const PLAYLIST_MODE = z.union([
  z.literal(-1), // DISABLED
  z.literal(0),  // SEQUENTIAL
  z.literal(1),  // SHUFFLE
  z.literal(2),  // SIMULTANEOUS
]);

// CONST.PLAYLIST_SORT_MODES
const PLAYLIST_SORTING = z.enum(['a', 'm']);

// CONST.AUDIO_CHANNELS keys
const AUDIO_CHANNEL = z.enum(['environment', 'interface', 'music']);

// Play-action friendly mode aliases (handler translates → numeric mode before .update).
// Kept inline in the action schema below; grep-findable per plan acceptance.

// Ownership map: { default?: 0|1|2|3, "<userId>": 0|1|2|3, ... }
const OWNERSHIP_LEVELS = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]);

// ── PlaylistSound writable fields (embedded; 12 fields confirmed via probe C) ─
//
// All fields optional on update; `path` required on create (FilePathField — see
// research §2: PlaylistSound without a path is invalid).

const PlaylistSoundWritableFields = {
  name: z.string().optional(),
  description: z.string().optional(),
  // Sound-level channel OVERRIDES parent playlist channel. null = inherit.
  channel: AUDIO_CHANNEL.nullable().optional(),
  path: z.string().min(1).optional(),
  repeat: z.boolean().optional(),
  // ms; null = inherit parent Playlist.fade. fadeDuration getter on the sound
  // resolves the fallback (research §7).
  fade: z.number().int().min(0).nullable().optional(),
  sort: z.number().int().optional(),
  // AlphaField range — z.number().min(0).max(1) enforces [0.0, 1.0].
  volume: z.number().min(0).max(1).optional(),
  playing: z.boolean().optional(),
  // null when not paused; number = seconds offset when paused (research §7).
  pausedTime: z.number().nullable().optional(),
  flags: z.record(z.unknown()).optional(),
};

// Create-time variant: path required.
const PlaylistSoundCreateFields = {
  ...PlaylistSoundWritableFields,
  path: z.string().min(1),
};

const PlaylistSoundInlineCreate = z.object({
  ...PlaylistSoundCreateFields,
}).strict();

// ── Playlist top-level writable fields (13 writable from 15 schema fields;
//     _id system-managed, _stats read-only, sounds via embedded actions) ──────
//
// PlaylistOtherWritableFields excludes `name` so create-action can override it
// with a required (.min(1)) variant without a duplicate-key error. Update uses
// PlaylistWritableFields which includes optional name.

const PlaylistOtherWritableFields = {
  description: z.string().optional(),
  channel: AUDIO_CHANNEL.optional(),
  mode: PLAYLIST_MODE.optional(),
  playing: z.boolean().optional(),
  // ms; applies to all sounds unless overridden per-sound.
  fade: z.number().int().min(0).optional(),
  // randomization seed; only meaningful when mode === 1 (SHUFFLE).
  seed: z.number().int().optional(),
  sorting: PLAYLIST_SORTING.optional(),
  sort: z.number().int().optional(),
  folder: FOUNDRY_ID.nullable().optional(),
  ownership: z.record(OWNERSHIP_LEVELS).optional(),
  flags: z.record(z.unknown()).optional(),
};

const PlaylistWritableFields = {
  name: z.string().optional(),
  ...PlaylistOtherWritableFields,
};

// ── 10 action schemas (8 mutations + 2 queries) ─────────────────────────────

export const PlaylistCreatePlaylistInput = z.object({
  action: z.literal('create-playlist'),
  name: z.string().min(1),
  ...PlaylistOtherWritableFields,
  // Inline sound creation — mirrors Phase 3 journal.create-entry inline `pages`.
  // Empty / undefined = create empty playlist; caller follows up with add-sound calls.
  sounds: z.array(PlaylistSoundInlineCreate).optional(),
}).strict();

export const PlaylistUpdatePlaylistInput = z.object({
  action: z.literal('update-playlist'),
  playlistId: FOUNDRY_ID,
  changes: z.object(PlaylistWritableFields).strict().refine(
    (obj) => Object.keys(obj).length > 0,
    { message: 'PLAYLIST_EMPTY_PAYLOAD: changes object must contain at least one field' },
  ),
}).strict();

export const PlaylistDeletePlaylistInput = z.object({
  action: z.literal('delete-playlist'),
  playlistId: FOUNDRY_ID,
  // CCR-Delete-Safety: hard delete requires explicit confirm: true. The
  // /wfrp-playlist skill prefers archive-by-rename (update name → "[archived]
  // <name>") before falling through to this confirm gate.
  confirm: z.boolean(),
  // Phase 10 cross-doc-fk: when true, clears Scene.playlist + Scene.playlistSound
  // FKs targeting this playlist (and its embedded sounds) before delete. Default
  // false (R10.6).
  cascade: z.boolean().default(false).optional(),
}).strict();

export const PlaylistGetPlaylistInput = z.object({
  action: z.literal('get-playlist'),
  playlistId: FOUNDRY_ID,
}).strict();

export const PlaylistListPlaylistsInput = z.object({
  action: z.literal('list-playlists'),
  filter: z.string().optional(),
  folder: FOUNDRY_ID.nullable().optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  countOnly: z.boolean().optional(),
}).strict();

export const PlaylistAddSoundInput = z.object({
  action: z.literal('add-sound'),
  playlistId: FOUNDRY_ID,
  ...PlaylistSoundCreateFields,
}).strict();

export const PlaylistUpdateSoundInput = z.object({
  action: z.literal('update-sound'),
  playlistId: FOUNDRY_ID,
  soundId: FOUNDRY_ID,
  changes: z.object(PlaylistSoundWritableFields).strict().refine(
    (obj) => Object.keys(obj).length > 0,
    { message: 'PLAYLIST_SOUND_EMPTY_PAYLOAD: changes object must contain at least one field' },
  ),
}).strict();

export const PlaylistDeleteSoundInput = z.object({
  action: z.literal('delete-sound'),
  playlistId: FOUNDRY_ID,
  soundId: FOUNDRY_ID,
  // Phase 10 cross-doc-fk: when true, clears Scene.playlistSound FKs targeting
  // this specific sound before delete. Default false (R10.6).
  cascade: z.boolean().default(false).optional(),
}).strict();

export const PlaylistPlayInput = z.object({
  action: z.literal('play'),
  playlistId: FOUNDRY_ID,
  // Optional mode override: if provided, the playlist's `mode` field is updated
  // to the matching numeric value before playAll() fires. Mapping:
  //   'disabled'    → -1   'sequential'    → 0
  //   'shuffle'     →  1   'simultaneous'  → 2
  mode: z.enum(['sequential','shuffle','simultaneous','disabled']).optional(),
}).strict();

export const PlaylistStopInput = z.object({
  action: z.literal('stop'),
  playlistId: FOUNDRY_ID,
}).strict();

// ── Phase 9C — duplicate-playlist + pause-sound + bulk-import-sounds + preload-sound ──

// R9C.3 — duplicate a whole Playlist (toObject minus _id/sort/folder → create). CCR-2a.
export const PlaylistDuplicateInput = z.object({
  action: z.literal('duplicate-playlist'),
  playlistId: FOUNDRY_ID,
}).strict();

// R9C.5 — pause-sound: dedicated wrapper enforcing {playing:false, pausedTime}. CCR-2a.
export const PlaylistPauseSoundInput = z.object({
  action: z.literal('pause-sound'),
  playlistId: FOUNDRY_ID,
  soundId: FOUNDRY_ID,
  // Position (seconds) to resume from; defaults to the sound's current playback time.
  pausedTime: z.number().nonnegative().optional(),
}).strict();

// R9C.5 — bulk-import-sounds: create one PlaylistSound per audio file in a folder. CCR-2a.
export const PlaylistBulkImportSoundsInput = z.object({
  action: z.literal('bulk-import-sounds'),
  playlistId: FOUNDRY_ID,
  folder: z.string().min(1),
  source: z.enum(['data', 'public', 's3']).optional(),
}).strict();

// R9C.5 — preload-sound: game.audio.preload(src) cross-client broadcast. CCR-2b transient.
export const PlaylistPreloadSoundInput = z.object({
  action: z.literal('preload-sound'),
  src: z.string().min(1),
}).strict();

// ── Discriminated-union umbrella ────────────────────────────────────────────

export const PlaylistToolInput = z.discriminatedUnion('action', [
  PlaylistCreatePlaylistInput,
  PlaylistUpdatePlaylistInput,
  PlaylistDeletePlaylistInput,
  PlaylistGetPlaylistInput,
  PlaylistListPlaylistsInput,
  PlaylistAddSoundInput,
  PlaylistUpdateSoundInput,
  PlaylistDeleteSoundInput,
  PlaylistPlayInput,
  PlaylistStopInput,
  PlaylistDuplicateInput,
  PlaylistPauseSoundInput,
  PlaylistBulkImportSoundsInput,
  PlaylistPreloadSoundInput,
]);

export type PlaylistToolInputType = z.infer<typeof PlaylistToolInput>;
export type PlaylistCreatePlaylistInputType = z.infer<typeof PlaylistCreatePlaylistInput>;
export type PlaylistUpdatePlaylistInputType = z.infer<typeof PlaylistUpdatePlaylistInput>;
export type PlaylistDeletePlaylistInputType = z.infer<typeof PlaylistDeletePlaylistInput>;
export type PlaylistGetPlaylistInputType = z.infer<typeof PlaylistGetPlaylistInput>;
export type PlaylistListPlaylistsInputType = z.infer<typeof PlaylistListPlaylistsInput>;
export type PlaylistAddSoundInputType = z.infer<typeof PlaylistAddSoundInput>;
export type PlaylistUpdateSoundInputType = z.infer<typeof PlaylistUpdateSoundInput>;
export type PlaylistDeleteSoundInputType = z.infer<typeof PlaylistDeleteSoundInput>;
export type PlaylistPlayInputType = z.infer<typeof PlaylistPlayInput>;
export type PlaylistStopInputType = z.infer<typeof PlaylistStopInput>;
export type PlaylistDuplicateInputType = z.infer<typeof PlaylistDuplicateInput>;
export type PlaylistPauseSoundInputType = z.infer<typeof PlaylistPauseSoundInput>;
export type PlaylistBulkImportSoundsInputType = z.infer<typeof PlaylistBulkImportSoundsInput>;
export type PlaylistPreloadSoundInputType = z.infer<typeof PlaylistPreloadSoundInput>;
export type PlaylistSoundInlineCreateType = z.infer<typeof PlaylistSoundInlineCreate>;

// ── Response shapes (concrete typed; CCR-Envelope-Consumer rule 3) ─────────

export interface PlaylistSoundViewModel {
  id: string;
  playlistId: string;
  name: string;
  description: string;
  // null when the sound inherits the parent playlist's channel.
  channel: string | null;
  path: string;
  repeat: boolean;
  // null when the sound inherits the parent playlist's fade duration.
  fade: number | null;
  sort: number;
  volume: number;
  playing: boolean;
  // null when not currently paused.
  pausedTime: number | null;
  flags: Record<string, unknown>;
}

export interface PlaylistViewModel {
  id: string;
  name: string;
  description: string;
  channel: string;
  mode: number;        // -1 | 0 | 1 | 2 — see CONST.PLAYLIST_MODES
  playing: boolean;
  fade: number;
  seed: number;
  sorting: string;     // "a" | "m" — see CONST.PLAYLIST_SORT_MODES
  sort: number;
  folder: string | null;
  ownership: Record<string, number>;
  flags: Record<string, unknown>;
  sounds: PlaylistSoundViewModel[];
}

export interface PlaylistListItem {
  id: string;
  name: string;
  playing: boolean;
  soundCount: number;
  mode: number;
  channel: string;
  folder: string | null;
}

// Re-export the mode alias map so handler + tool can share a single source of truth.
export const PLAYLIST_PLAY_MODE_ALIASES = {
  disabled: -1,
  sequential: 0,
  shuffle: 1,
  simultaneous: 2,
} as const;
export type PlaylistPlayModeAlias = keyof typeof PLAYLIST_PLAY_MODE_ALIASES;
