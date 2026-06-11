// Module Integration v1 Phase 6C — dynamic-soundscapes action Zod schemas.
//
// Every variant is .strict() — rejects unknown top-level keys.
// Imported by scene-atmosphere/schemas.ts and spread into the discriminated union.
//
// Data model overview:
//   Soundscapes are standard Foundry Playlist documents inside a folder named "Soundscapes".
//   Module-specific state lives in flags["dynamic-soundscapes"] on Playlist and PlaylistSound docs.
//
// Playlist-level flags:
//   flags["dynamic-soundscapes"].mood      — "moodA" | "moodB" | "moodC" (absent = "moodA")
//   flags["dynamic-soundscapes"].blocks    — Block[] (see Block shape below)
//
// PlaylistSound-level flags:
//   flags["dynamic-soundscapes"].enabled   — boolean (layer on/off in ambient/random modes)
//
// World settings:
//   game.settings("dynamic-soundscapes", "playingPlaylist") — active soundscape playlist ID
//   game.settings("dynamic-soundscapes", "selectedPlaylist") — UI-selected playlist ID (cosmetic)
//
// Block shape (element of flags["dynamic-soundscapes"].blocks):
//   { title, id, sounds: string[], isOrphaned, mode: "ambient"|"soundboard"|"random",
//     time, variance, size, color, conditions: string[], conditionMode: "all"|"any"|"none" }
//
// updateState-delay NOTE (CRITICAL):
//   Writing the "playingPlaylist" setting is the authoritative state write. The setting change
//   propagates server-side immediately. HOWEVER — audio playback (i.e. actual sound starting)
//   only fires when the active GM client's RandomSoundController.setPlaylist() onChange handler
//   runs after receiving the settings update. MCP callers should expect a brief client-side
//   delay (typically <1s on local network) between the setting write and audible audio output.
//   This is not a defect; it is an architectural property of the module. See audit.md §9.
//
// Confirm gates (CCR-4):
//   delete-soundscape, remove-sound, update-blocks all carry confirm: z.literal(true).
//
// Anchors:
//   - dynamic-soundscapes/capability-manifest.json mcp_action values
//   - dynamic-soundscapes/audit.md §2 + §3 + §4 + §8
//   - CCR-4 confirm gate on destructive writes
//   - CCR-5: schemas package-local

import { z } from 'zod';

// ── Block shape (shared inline) ───────────────────────────────────────────────
//
// 9-field Block as defined in audit.md §2. Used in list-blocks response + update-blocks input.
// All fields are optional except title + id at write time (module assigns id internally,
// but existing blocks always have it set); at read time all fields are present.

const blockSchema = z.object({
  /** Block display title (e.g. "Forest Ambience"). */
  title: z.string(),
  /** 20-char randomID assigned by the module. Required on update; omit on create (module assigns). */
  id: z.string().optional(),
  /** PlaylistSound._id references belonging to this block. */
  sounds: z.array(z.string()).optional(),
  /** Auto-managed "catch-all" block for unassigned sounds. */
  isOrphaned: z.boolean().optional(),
  /** Playback mode: ambient (looping layers), soundboard (one-shot), random (timer-based). */
  mode: z.enum(['ambient', 'soundboard', 'random']).optional(),
  /** Random timer seconds (random mode only). */
  time: z.number().optional(),
  /** Random interval variance 0–1 (random mode only). */
  variance: z.number().min(0).max(1).optional(),
  /** Icon size in the mixer UI: "40px"|"50px"|"60px"|"70px"|"90px". */
  size: z.enum(['40px', '50px', '60px', '70px', '90px']).optional(),
  /** CSS hex border/background color for the block in the mixer UI. */
  color: z.string().optional(),
  /**
   * Condition keys that gate this block. Built-in: "inCombat", "notInCombat", "day", "night",
   * "moodA", "moodB", "moodC", "weather-<key>". Empty array = always active.
   */
  conditions: z.array(z.string()).optional(),
  /** How multiple conditions combine: "all" (AND), "any" (OR), "none" (NOT-ALL). */
  conditionMode: z.enum(['all', 'any', 'none']).optional(),
});

// ── set-soundscape ────────────────────────────────────────────────────────────
//
// Sets the active (playing) soundscape by writing the world setting
// "dynamic-soundscapes.playingPlaylist" to the given playlist ID.
//
// updateState-delay NOTE: The setting write is authoritative and server-persisted immediately.
// Audio playback starts on the active GM client when RandomSoundController.setPlaylist() fires
// via the setting's onChange handler. Callers should document this ~<1s delay.
//
// After write: re-reads the setting to verify the new value and reports it in the response.

export const setSoundscapeInput = z.object({
  action: z.literal('set-soundscape'),
  /**
   * Playlist document ID of the soundscape to activate. Must be a Playlist in the
   * "Soundscapes" folder. Use list-soundscapes to enumerate available IDs.
   */
  playlistId: z.string().min(1),
}).strict();

// ── stop-soundscape ───────────────────────────────────────────────────────────
//
// Stops soundscape playback by writing the "playingPlaylist" setting to an empty string.
// Equivalent to set-soundscape with playlistId="".

export const stopSoundscapeInput = z.object({
  action: z.literal('stop-soundscape'),
}).strict();

// ── set-mood ──────────────────────────────────────────────────────────────────
//
// Sets the mood on the currently-playing soundscape (or a named playlist).
// Writes playlist.flags["dynamic-soundscapes"].mood = "moodA"|"moodB"|"moodC".
//
// The mood flag is the primary atmosphere lever: blocks with moodA/moodB/moodC conditions
// start/stop immediately after the ConditionEvaluator re-evaluates on the updatePlaylist hook.
//
// moodA is the default when the flag is absent — do NOT write it unnecessarily.

export const setMoodInput = z.object({
  action: z.literal('set-mood'),
  /**
   * Mood to activate: "moodA" (default/calm), "moodB" (tension/fight), "moodC" (climax/special).
   * "moodA" is the absence default — only write explicitly to change from B or C.
   */
  mood: z.enum(['moodA', 'moodB', 'moodC']),
  /**
   * Playlist ID to set mood on. Defaults to the currently-playing soundscape
   * (game.settings.get("dynamic-soundscapes","playingPlaylist")). Provide explicitly
   * to set mood on a different soundscape (e.g. to stage it before playing).
   */
  playlistId: z.string().optional(),
}).strict();

// ── get-mood ──────────────────────────────────────────────────────────────────
//
// Reads the current mood flag from a soundscape playlist.
// Returns "moodA" when the flag is absent (module default).

export const getMoodInput = z.object({
  action: z.literal('get-mood'),
  /**
   * Playlist ID to read mood from. Defaults to the currently-playing soundscape.
   * Supply explicitly to inspect a specific soundscape.
   */
  playlistId: z.string().optional(),
}).strict();

// ── set-layer-enabled ─────────────────────────────────────────────────────────
//
// Enables or disables a specific sound layer within a soundscape.
// Writes flags["dynamic-soundscapes"].enabled on the PlaylistSound document via
// playlist.updateEmbeddedDocuments("PlaylistSound", [{_id, flags:{"dynamic-soundscapes":{enabled}}}]).
//
// NOTE: This only updates the persisted flag. For the audio state to update immediately,
// the active GM client's updateState() must run (triggered by the updatePlaylistSound hook).

export const setLayerEnabledInput = z.object({
  action: z.literal('set-layer-enabled'),
  /** Playlist document ID (the soundscape containing the sound). */
  playlistId: z.string().min(1),
  /** PlaylistSound document ID (the layer to enable/disable). */
  soundId: z.string().min(1),
  /** true = layer active; false = layer muted/disabled. */
  enabled: z.boolean(),
}).strict();

// ── set-layer-volume ──────────────────────────────────────────────────────────
//
// Sets the volume of a specific sound layer within a soundscape.
// Writes PlaylistSound.volume via playlist.updateEmbeddedDocuments("PlaylistSound", [{_id, volume}]).
// Volume is a standard Foundry field (0.0 = silent, 1.0 = full). No module flag involved.

export const setLayerVolumeInput = z.object({
  action: z.literal('set-layer-volume'),
  /** Playlist document ID (the soundscape containing the sound). */
  playlistId: z.string().min(1),
  /** PlaylistSound document ID (the layer whose volume to set). */
  soundId: z.string().min(1),
  /** Volume 0.0 (silent) to 1.0 (full). */
  volume: z.number().min(0).max(1),
}).strict();

// ── list-soundscapes ──────────────────────────────────────────────────────────
//
// Lists all soundscape playlists in the "Soundscapes" folder.
// Returns playlist IDs, names, current mood, playing state, and block count.
// Includes the currently-playing playlist ID from the world setting.

export const listSoundscapesInput = z.object({
  action: z.literal('list-soundscapes'),
}).strict();

// ── list-blocks ───────────────────────────────────────────────────────────────
//
// Returns the flags["dynamic-soundscapes"].blocks array for a soundscape playlist.
// Each block includes its title, id, mode, conditions, conditionMode, and sound IDs.
// Use to inspect the block configuration before writing via update-blocks.

export const listBlocksInput = z.object({
  action: z.literal('list-blocks'),
  /** Playlist document ID of the soundscape to read blocks from. */
  playlistId: z.string().min(1),
}).strict();

// ── get-selected ──────────────────────────────────────────────────────────────
//
// Reads the "dynamic-soundscapes.selectedPlaylist" world setting.
// This is the cosmetic UI-selected playlist (shown in the mixer sidebar), not the playing one.
// Use list-soundscapes to find the playing soundscape.

export const getSelectedInput = z.object({
  action: z.literal('get-selected'),
}).strict();

// ── set-selected ──────────────────────────────────────────────────────────────
//
// Writes the "dynamic-soundscapes.selectedPlaylist" world setting (cosmetic UI selection).
// SWC: world-scoped setting; affects any open mixer window for all connected clients.
// This is purely cosmetic — it does NOT start playback.

export const setSelectedInput = z.object({
  action: z.literal('set-selected'),
  /**
   * Playlist document ID to select in the mixer UI, or "" to clear.
   * CCR-4: cosmetic but world-scoped; confirm intent before writing.
   */
  playlistId: z.string(),
  /** CCR-4: Required true — this is a world-scoped setting write. */
  confirm: z.literal(true),
}).strict();

// ── create-soundscape ─────────────────────────────────────────────────────────
//
// Creates a new Playlist document in the "Soundscapes" folder.
// The playlist is created with mode=DISABLED (-1) as required by the module.
// The "Soundscapes" folder is auto-created by the module on GM ready if absent.

export const createSoundscapeInput = z.object({
  action: z.literal('create-soundscape'),
  /** Display name for the new soundscape. */
  name: z.string().min(1),
}).strict();

// ── delete-soundscape ─────────────────────────────────────────────────────────
//
// Deletes a soundscape Playlist document (and all its embedded PlaylistSounds).
// CCR-4: requires confirm:true — this permanently destroys the playlist and all its sounds.
// If the deleted soundscape is currently playing, stops it first (sets playingPlaylist to "").

export const deleteSoundscapeInput = z.object({
  action: z.literal('delete-soundscape'),
  /** Playlist document ID to delete. */
  playlistId: z.string().min(1),
  /** CCR-4: Required true to confirm permanent deletion of this soundscape and all its sounds. */
  confirm: z.literal(true),
}).strict();

// ── add-sound ─────────────────────────────────────────────────────────────────
//
// Adds a new sound layer to a soundscape via playlist.createEmbeddedDocuments("PlaylistSound").
// Standard Foundry PlaylistSound fields: name, path, volume, repeat.
// The module treats all sounds in Soundscapes playlists as layers; ambient mode = repeat:true.

export const addSoundInput = z.object({
  action: z.literal('add-sound'),
  /** Playlist document ID of the soundscape to add the sound to. */
  playlistId: z.string().min(1),
  /** Display name for the sound layer. */
  name: z.string().min(1),
  /** Foundry-relative or absolute URL audio file path. */
  path: z.string().min(1),
  /** Initial volume 0.0–1.0 (default: 1.0). */
  volume: z.number().min(0).max(1).optional(),
  /** Whether the sound loops. Default: true (ambient mode). */
  repeat: z.boolean().optional(),
}).strict();

// ── remove-sound ─────────────────────────────────────────────────────────────
//
// Removes a sound layer from a soundscape.
// Deletes the PlaylistSound document; also removes the sound ID from any blocks[] that
// reference it in the playlist's flags["dynamic-soundscapes"].blocks.
// CCR-4: requires confirm:true — this permanently deletes the sound layer.

export const removeSoundInput = z.object({
  action: z.literal('remove-sound'),
  /** Playlist document ID containing the sound to remove. */
  playlistId: z.string().min(1),
  /** PlaylistSound document ID to delete. */
  soundId: z.string().min(1),
  /** CCR-4: Required true to confirm permanent deletion of the sound layer. */
  confirm: z.literal(true),
}).strict();

// ── update-blocks ─────────────────────────────────────────────────────────────
//
// Writes the full blocks[] array to playlist.flags["dynamic-soundscapes"].blocks.
//
// CAUTION: This is an atomic write of the entire blocks array. Always read existing blocks
// first via list-blocks, modify only the needed entries, then write back the full array.
// Partial writes or malformed structures will corrupt the soundscape configuration.
//
// Block shape: { title, id?, sounds?, isOrphaned?, mode?, time?, variance?, size?,
//               color?, conditions?, conditionMode? }
//
// updateState-delay NOTE: After writing blocks, the ConditionEvaluator re-evaluates on the
// updatePlaylist hook on the active GM client. A brief delay before audio routing changes
// is expected. If the soundscape is playing, triggering set-soundscape with the same ID
// will force a re-evaluation immediately.
//
// CCR-4: requires confirm:true — atomic overwrite of the entire blocks flag.

export const updateBlocksInput = z.object({
  action: z.literal('update-blocks'),
  /** Playlist document ID whose blocks flag to overwrite. */
  playlistId: z.string().min(1),
  /** Full replacement blocks array. Read list-blocks first to avoid data loss. */
  blocks: z.array(blockSchema).min(0),
  /** CCR-4: Required true — overwrites the entire blocks array atomically. */
  confirm: z.literal(true),
}).strict();

// ── Exported variant array (inserted into discriminated union by schemas.ts) ──

export const dynamicSoundscapesVariants = [
  setSoundscapeInput,
  stopSoundscapeInput,
  setMoodInput,
  getMoodInput,
  setLayerEnabledInput,
  setLayerVolumeInput,
  listSoundscapesInput,
  listBlocksInput,
  getSelectedInput,
  setSelectedInput,
  createSoundscapeInput,
  deleteSoundscapeInput,
  addSoundInput,
  removeSoundInput,
  updateBlocksInput,
] as const;
