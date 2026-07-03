// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file. Module-API calls here are settings/document writes only.
// Module Integration v1 Phase 6C — dynamic-soundscapes action handlers.
//
// All handlers call game.*/Playlist/PlaylistSound directly in-handler (handlers run inside
// Foundry via CONFIG.queries — no macro-execute bridge needed).
//
// Data model: see dynamic-soundscapes-schemas.ts header comment.
//
// Key API note:
//   - set-soundscape / stop-soundscape: write world setting "dynamic-soundscapes.playingPlaylist".
//     The setting write is server-persisted immediately. Audio playback starts on the active GM
//     client when RandomSoundController.setPlaylist() fires via the setting's onChange handler.
//     UPDATESTATE-DELAY: There is an inherent ~<1s delay between the MCP setting write and
//     audible audio output because updateState() runs only on the active GM client's RAM.
//     This delay is an architectural property of the module, not a defect. Document to callers.
//
//   - set-mood / get-mood: read/write playlist.flags["dynamic-soundscapes"].mood via setFlag/getFlag.
//     ConditionEvaluator re-evaluates on the updatePlaylist hook → mood-gated blocks start/stop.
//
//   - set-layer-enabled: playlist.updateEmbeddedDocuments("PlaylistSound", [{_id, flags:{"dynamic-soundscapes":{enabled}}}])
//   - set-layer-volume:  playlist.updateEmbeddedDocuments("PlaylistSound", [{_id, volume}])
//
//   - list-soundscapes: enumerate game.playlists filtered to the "Soundscapes" folder.
//   - list-blocks: read playlist.flags["dynamic-soundscapes"].blocks.
//
//   - create-soundscape: Playlist.create({name, folder, mode: -1}).
//   - delete-soundscape: CONFIRM-gated; stops playing first if needed, then playlist.delete().
//   - add-sound: playlist.createEmbeddedDocuments("PlaylistSound", [...]).
//   - remove-sound: CONFIRM-gated; deletes PlaylistSound + removes ID from blocks.
//   - update-blocks: CONFIRM-gated; writes full blocks[] array via playlist.setFlag().
//
// Notify contract:
//   - set-soundscape, stop-soundscape: notify.updated('playlist', playlistName, {summary})
//   - set-mood: notify.updated('playlist', playlistName, {summary})
//   - set-layer-enabled, set-layer-volume: notify.updated('playlist-sound', soundName, {summary})
//   - set-selected: notify.updated('setting', 'selectedPlaylist', {summary})
//   - create-soundscape: notify.created('playlist', name)
//   - delete-soundscape: notify.deleted('playlist', name)
//   - add-sound: notify.created('playlist-sound', name)
//   - remove-sound: notify.deleted('playlist-sound', soundId)
//   - update-blocks: notify.updated('playlist', playlistName, {summary})
//   - Reads (list-soundscapes, list-blocks, get-mood, get-selected): silent.
//
// IMPORTANT: summary strings MUST NOT contain substring `from "` or `import ` —
//   use path=/name= style to avoid tripping the verify-browser-safe linter.
//
// Post-write verify (DP-16):
//   Settings: re-read via game.settings.get() after write.
//   Flags: re-read via playlist.getFlag() after setFlag().
//   Embedded docs: count re-read after updateEmbeddedDocuments / createEmbeddedDocuments.
//
// Anchors:
//   - dynamic-soundscapes/audit.md §2 + §3 + §4 + §8 + §9
//   - dynamic-soundscapes/capability-manifest.json
//   - CCR-4 confirm gate on delete-soundscape, remove-sound, update-blocks
//   - DP-16 post-write verify

import { notify } from '../../../notify.js';
import { DYNAMIC_SOUNDSCAPES as MODULE_ID } from '../../../constants/moduleIds.js';
import type { ModuleSceneAtmosphereInputType } from './schemas.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

// ── Constants ─────────────────────────────────────────────────────────────────

const SOUNDSCAPES_FOLDER = 'Soundscapes';
/** Playlist mode: DISABLED (-1) — required by the module for all soundscape playlists. */
const PLAYLIST_MODE_DISABLED = -1;

// ── API accessors ─────────────────────────────────────────────────────────────

function getGame(): any {
  return (globalThis as any).game;
}

// ── Playlist resolution ───────────────────────────────────────────────────────

function resolvePlaylist(playlistId: string): any {
  const game = getGame();
  const pl = game?.playlists?.get?.(playlistId);
  if (!pl) {
    throw new Error(`PLAYLIST_NOT_FOUND: No playlist with id "${playlistId}".`);
  }
  return pl;
}

/**
 * Get the currently playing soundscape playlist ID from the world setting.
 * Returns "" when nothing is playing.
 */
function getPlayingPlaylistId(): string {
  const game = getGame();
  try {
    return game?.settings?.get?.(MODULE_ID, 'playingPlaylist') ?? '';
  } catch {
    return '';
  }
}

// BUG-381: handleGetMood / handleSetMood now inline their explicit-id > playing > no-soundscape
// fallback resolution (returning a soft success instead of throwing NO_PLAYING_SOUNDSCAPE), so the
// former shared `resolvePlaylistForMood` helper was removed as dead code.

/**
 * Find the "Soundscapes" folder. Returns null if not found.
 */
function findSoundscapesFolder(): any {
  const game = getGame();
  const folders = game?.folders?.contents ?? [];
  return folders.find((f: any) => f.type === 'Playlist' && f.name === SOUNDSCAPES_FOLDER) ?? null;
}

/**
 * Get all soundscape playlists (those in the "Soundscapes" folder).
 */
function getSoundscapePlaylists(): any[] {
  const game = getGame();
  const folder = findSoundscapesFolder();
  if (!folder) return [];
  const all = game?.playlists?.contents ?? [];
  return all.filter((pl: any) => pl.folder?.id === folder.id || pl.folder === folder.id);
}

// ── Type aliases ──────────────────────────────────────────────────────────────

type SetSoundscapeInput = Extract<ModuleSceneAtmosphereInputType, { action: 'set-soundscape' }>;
type StopSoundscapeInput = Extract<ModuleSceneAtmosphereInputType, { action: 'stop-soundscape' }>;
type SetMoodInput = Extract<ModuleSceneAtmosphereInputType, { action: 'set-mood' }>;
type GetMoodInput = Extract<ModuleSceneAtmosphereInputType, { action: 'get-mood' }>;
type SetLayerEnabledInput = Extract<ModuleSceneAtmosphereInputType, { action: 'set-layer-enabled' }>;
type SetLayerVolumeInput = Extract<ModuleSceneAtmosphereInputType, { action: 'set-layer-volume' }>;
type ListSoundscapesInput = Extract<ModuleSceneAtmosphereInputType, { action: 'list-soundscapes' }>;
type ListBlocksInput = Extract<ModuleSceneAtmosphereInputType, { action: 'list-blocks' }>;
type GetSelectedInput = Extract<ModuleSceneAtmosphereInputType, { action: 'get-selected' }>;
type SetSelectedInput = Extract<ModuleSceneAtmosphereInputType, { action: 'set-selected' }>;
type CreateSoundscapeInput = Extract<ModuleSceneAtmosphereInputType, { action: 'create-soundscape' }>;
type DeleteSoundscapeInput = Extract<ModuleSceneAtmosphereInputType, { action: 'delete-soundscape' }>;
type AddSoundInput = Extract<ModuleSceneAtmosphereInputType, { action: 'add-sound' }>;
type RemoveSoundInput = Extract<ModuleSceneAtmosphereInputType, { action: 'remove-sound' }>;
type UpdateBlocksInput = Extract<ModuleSceneAtmosphereInputType, { action: 'update-blocks' }>;

// ── set-soundscape ────────────────────────────────────────────────────────────
//
// Writes world setting "dynamic-soundscapes.playingPlaylist" = playlistId.
// The setting write is authoritative and server-persisted. Audio playback starts on the
// active GM client's onChange handler (RandomSoundController.setPlaylist()).
//
// UPDATESTATE-DELAY: The setting write propagates immediately, but audio output depends on
// the GM client's event loop. Callers should document this expected ~<1s delay.

export async function handleSetSoundscape(input: SetSoundscapeInput): Promise<Envelope<unknown>> {
  try {
    const game = getGame();

    // Validate the playlist exists before writing
    const playlist = resolvePlaylist(input.playlistId);

    await game.settings.set(MODULE_ID, 'playingPlaylist', input.playlistId);

    // Post-write verify (DP-16)
    const verified = getPlayingPlaylistId();
    const match = verified === input.playlistId;

    const playlistName = playlist.name ?? input.playlistId;
    notify.updated('playlist', playlistName, {
      summary: `set-soundscape: playingPlaylist set, name=${playlistName}`,
    });

    return {
      success: true,
      data: {
        playlistId: input.playlistId,
        playlistName,
        verifiedPlaylistId: verified,
        settingMatch: match,
        updateStateDelayNote:
          'The world setting write is server-persisted. Audio playback starts on the active GM ' +
          'client when RandomSoundController.setPlaylist() fires via onChange. Expect a brief ' +
          'delay (<1s on local network) before audio output begins. See audit §9.',
      },
    };
  } catch (e) {
    return { success: false, error: `SET_SOUNDSCAPE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── stop-soundscape ───────────────────────────────────────────────────────────
//
// Clears the "playingPlaylist" setting to "" — equivalent to no soundscape playing.
// Same updateState-delay semantics as set-soundscape.

export async function handleStopSoundscape(_input: StopSoundscapeInput): Promise<Envelope<unknown>> {
  try {
    const game = getGame();

    const previousId = getPlayingPlaylistId();
    let previousName: string | null = null;
    if (previousId) {
      previousName = game?.playlists?.get?.(previousId)?.name ?? previousId;
    }

    await game.settings.set(MODULE_ID, 'playingPlaylist', '');

    // Post-write verify (DP-16)
    const verified = getPlayingPlaylistId();
    const stopped = verified === '';

    notify.updated('playlist', previousName ?? '(none)', {
      summary: 'stop-soundscape: playingPlaylist cleared',
    });

    return {
      success: true,
      data: {
        stopped,
        previousPlaylistId: previousId || null,
        previousPlaylistName: previousName,
        verifiedPlaylistId: verified,
        updateStateDelayNote:
          'The world setting write is server-persisted. The active GM client will stop audio ' +
          'via RandomSoundController.setPlaylist(null) onChange. Expect a brief delay.',
      },
    };
  } catch (e) {
    return { success: false, error: `STOP_SOUNDSCAPE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── set-mood ──────────────────────────────────────────────────────────────────
//
// Writes flags["dynamic-soundscapes"].mood on the target playlist.
// The ConditionEvaluator re-evaluates on the updatePlaylist hook → mood-gated blocks
// start/stop automatically on the active GM client.
//
// moodA is the module default (absence == moodA). Only write explicitly to change from B or C.

export async function handleSetMood(input: SetMoodInput): Promise<Envelope<unknown>> {
  try {
    // BUG-381: resolve explicit id > playing soundscape > no-soundscape fallback (no throw).
    const game = getGame();
    let playlist: any = null;
    if (input.playlistId) {
      playlist = game?.playlists?.get?.(input.playlistId);
      if (!playlist) {
        return { success: false, error: `SET_MOOD_ERROR: PLAYLIST_NOT_FOUND: No playlist with id "${input.playlistId}".` };
      }
    } else {
      const playingId = getPlayingPlaylistId();
      if (playingId) playlist = game?.playlists?.get?.(playingId);
    }

    // No-soundscape fallback: a flag can't be written without a target playlist. Return an
    // informative soft no-op (success:true, moodSet:false) instead of erroring — mirrors get-mood
    // so callers get a usable shape rather than NO_PLAYING_SOUNDSCAPE.
    if (!playlist) {
      return {
        success: true,
        data: {
          playlistId: null,
          playlistName: null,
          mood: input.mood,
          verifiedMood: null,
          moodMatch: false,
          moodSet: false,
          noSoundscapeNote:
            'No soundscape is currently playing and no playlistId was provided. Mood cannot be ' +
            'written without a target playlist. Pass a playlistId explicitly or start a soundscape ' +
            'with set-soundscape first.',
          moodNote:
            'moodA is the module default (absent flag == moodA). Condition re-evaluation fires on the updatePlaylist hook.',
        },
      };
    }

    await playlist.setFlag(MODULE_ID, 'mood', input.mood);

    // Post-write verify (DP-16)
    const verified = playlist.getFlag(MODULE_ID, 'mood') ?? 'moodA';

    notify.updated('playlist', playlist.name, {
      summary: `set-mood: mood=${input.mood}, name=${playlist.name}`,
    });

    return {
      success: true,
      data: {
        playlistId: playlist.id,
        playlistName: playlist.name,
        mood: input.mood,
        verifiedMood: verified,
        moodMatch: verified === input.mood,
        moodSet: true,
        moodNote:
          'moodA is the module default (absent flag == moodA). Writing moodA is a no-op unless ' +
          'reverting from moodB or moodC. Condition re-evaluation fires on the updatePlaylist hook.',
      },
    };
  } catch (e) {
    return { success: false, error: `SET_MOOD_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── get-mood ──────────────────────────────────────────────────────────────────

export async function handleGetMood(input: GetMoodInput): Promise<Envelope<unknown>> {
  try {
    // BUG-381: resolve explicit id > playing soundscape > no-soundscape fallback (no throw).
    const game = getGame();
    let playlist: any = null;
    if (input.playlistId) {
      playlist = game?.playlists?.get?.(input.playlistId);
      if (!playlist) {
        return { success: false, error: `GET_MOOD_ERROR: PLAYLIST_NOT_FOUND: No playlist with id "${input.playlistId}".` };
      }
    } else {
      const playingId = getPlayingPlaylistId();
      if (playingId) playlist = game?.playlists?.get?.(playingId);
    }

    // No-soundscape fallback: return the module default mood instead of erroring, so callers
    // get a usable shape rather than NO_PLAYING_SOUNDSCAPE.
    if (!playlist) {
      return {
        success: true,
        data: {
          playlistId: null,
          playlistName: null,
          mood: 'moodA',
          isFlagExplicit: false,
          noSoundscapeNote:
            'No soundscape is currently playing and no playlistId was provided. Returning the ' +
            'module default mood (moodA). Pass a playlistId or start a soundscape with set-soundscape.',
          moodNote:
            'moodA is the module default when the flag is absent. ' +
            'isFlagExplicit=false means the mood flag has not been written yet.',
        },
      };
    }

    const rawFlag = playlist.getFlag(MODULE_ID, 'mood');
    // Absent flag == moodA (module default: `mood === "moodA" || !flag`)
    const mood: string = rawFlag ?? 'moodA';

    return {
      success: true,
      data: {
        playlistId: playlist.id,
        playlistName: playlist.name,
        mood,
        isFlagExplicit: rawFlag !== undefined && rawFlag !== null,
        moodNote:
          'moodA is the module default when the flag is absent. ' +
          'isFlagExplicit=false means the mood flag has not been written yet.',
      },
    };
  } catch (e) {
    return { success: false, error: `GET_MOOD_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── set-layer-enabled ─────────────────────────────────────────────────────────
//
// Enables or disables a sound layer by writing flags["dynamic-soundscapes"].enabled.
// Uses updateEmbeddedDocuments for atomicity.

export async function handleSetLayerEnabled(input: SetLayerEnabledInput): Promise<Envelope<unknown>> {
  try {
    const playlist = resolvePlaylist(input.playlistId);

    const sound = playlist.sounds?.get?.(input.soundId);
    if (!sound) {
      return {
        success: false,
        error: `SOUND_NOT_FOUND: No PlaylistSound with id "${input.soundId}" in playlist "${playlist.name}".`,
      };
    }

    await playlist.updateEmbeddedDocuments('PlaylistSound', [
      {
        _id: input.soundId,
        flags: {
          [MODULE_ID]: { enabled: input.enabled },
        },
      },
    ]);

    // Post-write verify (DP-16): re-read the flag
    const updatedSound = playlist.sounds?.get?.(input.soundId);
    const verifiedEnabled = updatedSound?.getFlag?.(MODULE_ID, 'enabled') ?? null;

    const soundName = sound.name ?? input.soundId;
    notify.updated('playlist-sound', soundName, {
      summary: `set-layer-enabled: enabled=${input.enabled}, name=${soundName}`,
    });

    return {
      success: true,
      data: {
        playlistId: input.playlistId,
        playlistName: playlist.name,
        soundId: input.soundId,
        soundName,
        enabled: input.enabled,
        verifiedEnabled,
        flagMatch: verifiedEnabled === input.enabled,
      },
    };
  } catch (e) {
    return { success: false, error: `SET_LAYER_ENABLED_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── set-layer-volume ──────────────────────────────────────────────────────────
//
// Sets PlaylistSound.volume (standard Foundry field, no module flag).

export async function handleSetLayerVolume(input: SetLayerVolumeInput): Promise<Envelope<unknown>> {
  try {
    const playlist = resolvePlaylist(input.playlistId);

    const sound = playlist.sounds?.get?.(input.soundId);
    if (!sound) {
      return {
        success: false,
        error: `SOUND_NOT_FOUND: No PlaylistSound with id "${input.soundId}" in playlist "${playlist.name}".`,
      };
    }

    await playlist.updateEmbeddedDocuments('PlaylistSound', [
      { _id: input.soundId, volume: input.volume },
    ]);

    // Post-write verify (DP-16)
    const updatedSound = playlist.sounds?.get?.(input.soundId);
    const verifiedVolume: number | null = updatedSound?.volume ?? null;

    const soundName = sound.name ?? input.soundId;
    notify.updated('playlist-sound', soundName, {
      summary: `set-layer-volume: volume=${input.volume}, name=${soundName}`,
    });

    return {
      success: true,
      data: {
        playlistId: input.playlistId,
        playlistName: playlist.name,
        soundId: input.soundId,
        soundName,
        volume: input.volume,
        verifiedVolume,
        volumeMatch: verifiedVolume !== null && Math.abs(verifiedVolume - input.volume) < 0.001,
      },
    };
  } catch (e) {
    return { success: false, error: `SET_LAYER_VOLUME_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── list-soundscapes ──────────────────────────────────────────────────────────
//
// Enumerates all playlists in the "Soundscapes" folder.
// Reports id, name, mood, playing state, block count, and sound count per playlist.

export async function handleListSoundscapes(_input: ListSoundscapesInput): Promise<Envelope<unknown>> {
  try {
    const playingId = getPlayingPlaylistId();
    const playlists = getSoundscapePlaylists();

    const items = playlists.map((pl: any) => {
      const mood: string = pl.getFlag?.(MODULE_ID, 'mood') ?? 'moodA';
      const blocks: unknown[] = pl.getFlag?.(MODULE_ID, 'blocks') ?? [];
      const soundCount: number = pl.sounds?.size ?? 0;
      return {
        id: pl.id,
        name: pl.name,
        mood,
        isPlaying: pl.id === playingId,
        blockCount: Array.isArray(blocks) ? blocks.length : 0,
        soundCount,
      };
    });

    const folder = findSoundscapesFolder();

    return {
      success: true,
      data: {
        soundscapesFolder: folder?.name ?? null,
        soundscapesFolderId: folder?.id ?? null,
        playingPlaylistId: playingId || null,
        count: items.length,
        soundscapes: items,
      },
    };
  } catch (e) {
    return { success: false, error: `LIST_SOUNDSCAPES_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── list-blocks ───────────────────────────────────────────────────────────────
//
// Returns the blocks[] flag from a soundscape playlist.
// Each block includes title, id, mode, sounds, conditions, and conditionMode.

export async function handleListBlocks(input: ListBlocksInput): Promise<Envelope<unknown>> {
  try {
    const playlist = resolvePlaylist(input.playlistId);

    const rawBlocks: any[] = playlist.getFlag?.(MODULE_ID, 'blocks') ?? [];
    const blocks = Array.isArray(rawBlocks) ? rawBlocks : [];

    // Enrich with sound names for convenience
    const enriched = blocks.map((block: any) => {
      const soundIds: string[] = Array.isArray(block.sounds) ? block.sounds : [];
      const soundNames = soundIds.map((sid: string) => {
        const snd = playlist.sounds?.get?.(sid);
        return snd ? { id: sid, name: snd.name } : { id: sid, name: null };
      });
      return {
        title: block.title,
        id: block.id,
        mode: block.mode,
        isOrphaned: block.isOrphaned,
        time: block.time,
        variance: block.variance,
        size: block.size,
        color: block.color,
        conditions: block.conditions ?? [],
        conditionMode: block.conditionMode ?? 'all',
        soundCount: soundIds.length,
        sounds: soundNames,
      };
    });

    return {
      success: true,
      data: {
        playlistId: playlist.id,
        playlistName: playlist.name,
        blockCount: blocks.length,
        blocks: enriched,
      },
    };
  } catch (e) {
    return { success: false, error: `LIST_BLOCKS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── get-selected ──────────────────────────────────────────────────────────────
//
// Reads the "selectedPlaylist" world setting (cosmetic UI selection).

export async function handleGetSelected(_input: GetSelectedInput): Promise<Envelope<unknown>> {
  try {
    const game = getGame();
    let selectedId: string = '';
    try {
      selectedId = game?.settings?.get?.(MODULE_ID, 'selectedPlaylist') ?? '';
    } catch {
      selectedId = '';
    }

    let selectedName: string | null = null;
    if (selectedId) {
      selectedName = game?.playlists?.get?.(selectedId)?.name ?? null;
    }

    const playingId = getPlayingPlaylistId();

    return {
      success: true,
      data: {
        selectedPlaylistId: selectedId || null,
        selectedPlaylistName: selectedName,
        playingPlaylistId: playingId || null,
        note: 'selectedPlaylist is the cosmetic UI-selected mixer view. It does NOT indicate what is playing. Use playingPlaylistId for the active soundscape.',
      },
    };
  } catch (e) {
    return { success: false, error: `GET_SELECTED_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── set-selected ──────────────────────────────────────────────────────────────
//
// Writes the "selectedPlaylist" world setting (cosmetic).

export async function handleSetSelected(input: SetSelectedInput): Promise<Envelope<unknown>> {
  try {
    const game = getGame();

    await game.settings.set(MODULE_ID, 'selectedPlaylist', input.playlistId);

    // Post-write verify (DP-16)
    let verified = '';
    try {
      verified = game?.settings?.get?.(MODULE_ID, 'selectedPlaylist') ?? '';
    } catch {
      verified = '';
    }

    const selectedName = input.playlistId
      ? game?.playlists?.get?.(input.playlistId)?.name ?? null
      : null;

    notify.updated('setting', 'selectedPlaylist', {
      summary: `set-selected: selectedPlaylist set, playlistId=${input.playlistId || '(none)'}`,
    });

    return {
      success: true,
      data: {
        playlistId: input.playlistId || null,
        playlistName: selectedName,
        verifiedPlaylistId: verified || null,
        settingMatch: verified === input.playlistId,
        note: 'selectedPlaylist is cosmetic (UI mixer view). Does not affect audio playback.',
      },
    };
  } catch (e) {
    return { success: false, error: `SET_SELECTED_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── create-soundscape ─────────────────────────────────────────────────────────
//
// Creates a new Playlist in the "Soundscapes" folder with mode=DISABLED (-1).
// The "Soundscapes" folder is auto-created by the module on GM ready if absent.

export async function handleCreateSoundscape(input: CreateSoundscapeInput): Promise<Envelope<unknown>> {
  try {
    const Playlist = (globalThis as any).Playlist;
    if (!Playlist) {
      return { success: false, error: 'CREATE_SOUNDSCAPE_ERROR: Playlist class unavailable.' };
    }

    // Find or report Soundscapes folder
    const folder = findSoundscapesFolder();
    const folderId = folder?.id ?? null;

    if (!folderId) {
      // Module creates the folder on GM ready; if it's not here, something is wrong
      return {
        success: false,
        error:
          'CREATE_SOUNDSCAPE_ERROR: "Soundscapes" folder not found. Ensure the dynamic-soundscapes ' +
          'module is active and at least one GM has logged in (the module auto-creates the folder on ready).',
      };
    }

    const created = await Playlist.create({
      name: input.name,
      folder: folderId,
      mode: PLAYLIST_MODE_DISABLED,
    });

    if (!created) {
      return { success: false, error: 'CREATE_SOUNDSCAPE_ERROR: Playlist.create returned null.' };
    }

    notify.created('playlist', created.name);

    return {
      success: true,
      data: {
        playlistId: created.id,
        playlistName: created.name,
        folderId,
        folderName: folder.name,
        mode: PLAYLIST_MODE_DISABLED,
        modeNote: 'mode=-1 (DISABLED) is required by dynamic-soundscapes; Foundry native playlist logic is suppressed.',
      },
    };
  } catch (e) {
    return { success: false, error: `CREATE_SOUNDSCAPE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── delete-soundscape ─────────────────────────────────────────────────────────
//
// Permanently deletes a soundscape Playlist (confirm-gated — CCR-4).
// If the playlist is currently playing, stops it first.

export async function handleDeleteSoundscape(input: DeleteSoundscapeInput): Promise<Envelope<unknown>> {
  try {
    const game = getGame();
    const playlist = resolvePlaylist(input.playlistId);
    const playlistName = playlist.name ?? input.playlistId;
    const soundCount: number = playlist.sounds?.size ?? 0;

    // Stop playing soundscape if it's this one
    const playingId = getPlayingPlaylistId();
    let stoppedPlayback = false;
    if (playingId === input.playlistId) {
      await game.settings.set(MODULE_ID, 'playingPlaylist', '');
      stoppedPlayback = true;
    }

    await playlist.delete();

    // Post-delete verify: playlist should no longer exist
    const stillExists = Boolean(game?.playlists?.get?.(input.playlistId));

    notify.deleted('playlist', playlistName, {
      summary: `delete-soundscape: name=${playlistName}`,
    });

    return {
      success: true,
      data: {
        deleted: !stillExists,
        playlistId: input.playlistId,
        playlistName,
        soundsDeleted: soundCount,
        stoppedPlayback,
        verifiedGone: !stillExists,
      },
    };
  } catch (e) {
    return { success: false, error: `DELETE_SOUNDSCAPE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── add-sound ─────────────────────────────────────────────────────────────────
//
// Adds a new PlaylistSound to a soundscape.

export async function handleAddSound(input: AddSoundInput): Promise<Envelope<unknown>> {
  try {
    const playlist = resolvePlaylist(input.playlistId);

    const createData: Record<string, unknown> = {
      name: input.name,
      path: input.path,
      volume: input.volume ?? 1.0,
      repeat: input.repeat ?? true,
    };

    const created = await playlist.createEmbeddedDocuments('PlaylistSound', [createData]);
    const newSound = Array.isArray(created) ? created[0] : null;

    if (!newSound) {
      return { success: false, error: 'ADD_SOUND_ERROR: createEmbeddedDocuments returned no document.' };
    }

    // Post-write verify (DP-16)
    const verifiedSound = playlist.sounds?.get?.(newSound.id);
    const verifiedCount: number = playlist.sounds?.size ?? 0;

    notify.created('playlist-sound', newSound.name);

    return {
      success: true,
      data: {
        playlistId: input.playlistId,
        playlistName: playlist.name,
        soundId: newSound.id,
        soundName: newSound.name,
        path: input.path,
        volume: input.volume ?? 1.0,
        repeat: input.repeat ?? true,
        verifiedSoundExists: Boolean(verifiedSound),
        totalSoundCount: verifiedCount,
        blockNote:
          'The sound is added to the playlist but NOT yet assigned to any block. ' +
          'Use list-blocks + update-blocks to add its ID to the appropriate block.sounds[].',
      },
    };
  } catch (e) {
    return { success: false, error: `ADD_SOUND_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── remove-sound ─────────────────────────────────────────────────────────────
//
// Deletes a PlaylistSound and removes its ID from all blocks in the playlist's blocks flag.
// Confirm-gated (CCR-4).

export async function handleRemoveSound(input: RemoveSoundInput): Promise<Envelope<unknown>> {
  try {
    const playlist = resolvePlaylist(input.playlistId);

    const sound = playlist.sounds?.get?.(input.soundId);
    if (!sound) {
      return {
        success: false,
        error: `SOUND_NOT_FOUND: No PlaylistSound with id "${input.soundId}" in playlist "${playlist.name}".`,
      };
    }
    const soundName = sound.name ?? input.soundId;

    // Remove the sound ID from all blocks that reference it
    const rawBlocks: any[] = playlist.getFlag?.(MODULE_ID, 'blocks') ?? [];
    const blocks = Array.isArray(rawBlocks) ? rawBlocks : [];
    const affectedBlocks: string[] = [];
    let blocksModified = false;

    const newBlocks = blocks.map((block: any) => {
      const sounds: string[] = Array.isArray(block.sounds) ? block.sounds : [];
      if (sounds.includes(input.soundId)) {
        affectedBlocks.push(block.id ?? block.title ?? '?');
        blocksModified = true;
        return { ...block, sounds: sounds.filter((s: string) => s !== input.soundId) };
      }
      return block;
    });

    // Write updated blocks before deleting the sound (atomic order)
    if (blocksModified) {
      await playlist.setFlag(MODULE_ID, 'blocks', newBlocks);
    }

    // Delete the PlaylistSound
    await playlist.deleteEmbeddedDocuments('PlaylistSound', [input.soundId]);

    // Post-delete verify
    const stillExists = Boolean(playlist.sounds?.get?.(input.soundId));
    const verifiedCount: number = playlist.sounds?.size ?? 0;

    notify.deleted('playlist-sound', soundName, {
      summary: `remove-sound: name=${soundName}`,
    });

    return {
      success: true,
      data: {
        playlistId: input.playlistId,
        playlistName: playlist.name,
        soundId: input.soundId,
        soundName,
        deleted: !stillExists,
        verifiedGone: !stillExists,
        remainingSoundCount: verifiedCount,
        blocksModified,
        affectedBlocks,
      },
    };
  } catch (e) {
    return { success: false, error: `REMOVE_SOUND_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── update-blocks ─────────────────────────────────────────────────────────────
//
// Atomically overwrites the blocks[] flag on a soundscape playlist.
// CCR-4: confirm required.
//
// UPDATESTATE-DELAY NOTE: After writing blocks, the ConditionEvaluator re-evaluates on the
// updatePlaylist hook on the active GM client. To force immediate re-evaluation, callers
// may re-issue set-soundscape with the same playlist ID (triggers setPlaylist onChange).

export async function handleUpdateBlocks(input: UpdateBlocksInput): Promise<Envelope<unknown>> {
  try {
    const playlist = resolvePlaylist(input.playlistId);

    const previousBlocks: any[] = playlist.getFlag?.(MODULE_ID, 'blocks') ?? [];
    const previousCount = Array.isArray(previousBlocks) ? previousBlocks.length : 0;

    await playlist.setFlag(MODULE_ID, 'blocks', input.blocks);

    // Post-write verify (DP-16)
    const verifiedBlocks: any[] = playlist.getFlag?.(MODULE_ID, 'blocks') ?? [];
    const verifiedCount = Array.isArray(verifiedBlocks) ? verifiedBlocks.length : 0;

    notify.updated('playlist', playlist.name, {
      summary: `update-blocks: blocks count=${input.blocks.length}, name=${playlist.name}`,
    });

    return {
      success: true,
      data: {
        playlistId: input.playlistId,
        playlistName: playlist.name,
        previousBlockCount: previousCount,
        newBlockCount: input.blocks.length,
        verifiedBlockCount: verifiedCount,
        countMatch: verifiedCount === input.blocks.length,
        updateStateDelayNote:
          'Condition re-evaluation fires on the updatePlaylist hook on the active GM client. ' +
          'To force immediate re-evaluation, re-issue set-soundscape with this playlist ID.',
      },
    };
  } catch (e) {
    return { success: false, error: `UPDATE_BLOCKS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}
