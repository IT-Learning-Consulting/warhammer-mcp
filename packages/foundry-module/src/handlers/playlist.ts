// Phase 7 mcp_crud_expansion — Playlist + PlaylistSound CRUD handler.
//
// Hybrid architecture:
//   - Top-level Playlist CRUD (create/update/delete/get/list/play/stop) is
//     hand-rolled here. World-level docs don't reuse the embedded-doc pattern;
//     `Playlist.create()` / `playlist.delete()` are direct class APIs.
//   - PlaylistSound CRUD (add-sound/update-sound/delete-sound) routes through
//     the worldCRUDFactory — embedded-on-world-parent pattern.
//
// Probes (.agents/research/mcp_crud_expansion/phase7_probes.md) confirmed:
//   - Embedded doc-type string is "PlaylistSound" (singular) — NOT "PlaylistSounds".
//   - Playlist.prototype.playAll() / stopAll() exist as parameterless functions.
//   - PlaylistSound has 12 fields (no _stats).
//
// Anchors:
//   - DP-15: typed query<T> — no <any> on response side (CCR-Envelope-Consumer).
//   - DP-16 / F08: scalar comparison uses _source path, not derived getters.
//   - DP-18: delete-playlist cascade — snapshot sound count BEFORE delete,
//     surface as deletedSoundCount in response; verify embedded gone after.
//   - DP-19: every formatter field is grep-findable from the tool description.
//   - BUG-075: snapshot requestedChanges BEFORE any mutating .update() call.
//   - CCR-Delete-Safety: delete-playlist requires confirm: true on the schema.

import {
  PlaylistToolInput,
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
  PLAYLIST_PLAY_MODE_ALIASES,
  type PlaylistViewModel,
  type PlaylistSoundViewModel,
  type PlaylistListItem,
  type PlaylistPlayModeAlias,
  type PlaylistDuplicateInputType,
  type PlaylistPauseSoundInputType,
  type PlaylistBulkImportSoundsInputType,
  type PlaylistPreloadSoundInputType,
} from '@foundry-mcp/shared';
import { z } from 'zod';
import { wrappedWrite } from '../transaction-manager.js';
import { notify } from '../notify.js';
import {
  createWorldDocCRUDHandlers,
  validateGMAccess,
  deepStripUndefined,
  getParentOrThrow,
  type Envelope,
} from '../utils/worldCRUDFactory.js';

// ── Serializers ──────────────────────────────────────────────────────────────

function serializePlaylistSoundViewModel(playlist: any, sound: any): PlaylistSoundViewModel {
  return {
    id: sound.id as string,
    playlistId: playlist.id as string,
    name: (sound._source?.name as string) ?? '',
    description: (sound._source?.description as string) ?? '',
    channel: (sound._source?.channel as string) ?? null,
    path: (sound._source?.path as string) ?? '',
    repeat: !!sound._source?.repeat,
    fade: typeof sound._source?.fade === 'number' ? sound._source.fade : null,
    sort: typeof sound._source?.sort === 'number' ? sound._source.sort : 0,
    volume: typeof sound._source?.volume === 'number' ? sound._source.volume : 1,
    playing: !!sound._source?.playing,
    pausedTime: typeof sound._source?.pausedTime === 'number' ? sound._source.pausedTime : null,
    flags: (sound._source?.flags as Record<string, unknown>) ?? {},
  };
}

interface PlaylistSoundListItem {
  id: string;
  playlistId: string;
  name: string;
  path: string;
  playing: boolean;
  volume: number;
}

function serializePlaylistSoundListItem(playlist: any, sound: any): PlaylistSoundListItem {
  return {
    id: sound.id as string,
    playlistId: playlist.id as string,
    name: (sound._source?.name as string) ?? '',
    path: (sound._source?.path as string) ?? '',
    playing: !!sound._source?.playing,
    volume: typeof sound._source?.volume === 'number' ? sound._source.volume : 1,
  };
}

function serializePlaylistViewModel(playlist: any): PlaylistViewModel {
  const sounds: PlaylistSoundViewModel[] = ((playlist.sounds?.contents as any[]) ?? []).map(
    (s) => serializePlaylistSoundViewModel(playlist, s),
  );
  return {
    id: playlist.id as string,
    name: (playlist._source?.name as string) ?? '',
    description: (playlist._source?.description as string) ?? '',
    channel: (playlist._source?.channel as string) ?? 'music',
    mode: typeof playlist._source?.mode === 'number' ? playlist._source.mode : 0,
    playing: !!playlist._source?.playing,
    fade: typeof playlist._source?.fade === 'number' ? playlist._source.fade : 0,
    seed: typeof playlist._source?.seed === 'number' ? playlist._source.seed : 0,
    sorting: (playlist._source?.sorting as string) ?? 'a',
    sort: typeof playlist._source?.sort === 'number' ? playlist._source.sort : 0,
    folder: (playlist._source?.folder as string) ?? null,
    ownership: (playlist._source?.ownership as Record<string, number>) ?? {},
    flags: (playlist._source?.flags as Record<string, unknown>) ?? {},
    sounds,
  };
}

function serializePlaylistListItem(playlist: any): PlaylistListItem {
  return {
    id: playlist.id as string,
    name: (playlist._source?.name as string) ?? '',
    playing: !!playlist._source?.playing,
    soundCount: (playlist.sounds?.size as number) ?? 0,
    mode: typeof playlist._source?.mode === 'number' ? playlist._source.mode : 0,
    channel: (playlist._source?.channel as string) ?? 'music',
    folder: (playlist._source?.folder as string) ?? null,
  };
}

// ── PlaylistSound CRUD via worldCRUDFactory ──────────────────────────────────
//
// The factory's get / list paths are not surfaced through the playlist umbrella
// (the umbrella exposes get-playlist + list-playlists at the top level).
// Local minimum-viable get/list schemas are passed for type completeness; the
// factory's dispatch is never invoked here — the umbrella switch routes
// directly to factoryHandlers.create / .update / .delete.

const PlaylistSoundGetInputInternal = z.object({
  action: z.literal('get-sound'),
  playlistId: z.string().min(1),
  soundId: z.string().min(1),
}).strict();

const PlaylistSoundListInputInternal = z.object({
  action: z.literal('list-sounds'),
  playlistId: z.string().min(1),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  countOnly: z.boolean().optional(),
}).strict();

const PlaylistSoundFactoryUnion = z.discriminatedUnion('action', [
  PlaylistAddSoundInput,
  PlaylistUpdateSoundInput,
  PlaylistDeleteSoundInput,
  PlaylistSoundGetInputInternal,
  PlaylistSoundListInputInternal,
]);

const soundFactoryHandlers = createWorldDocCRUDHandlers<any, any, PlaylistSoundViewModel, PlaylistSoundListItem>({
  documentName: 'PlaylistSound',
  documentLabel: 'playlist-sound',
  collection: 'sounds',
  parentCollectionKey: 'playlists',
  parentIdField: 'playlistId',
  parentLabel: 'playlist',
  idField: 'soundId',
  gmGateReads: true,
  deleteApi: 'parent.deleteEmbeddedDocuments',
  schemas: {
    create: PlaylistAddSoundInput,
    update: PlaylistUpdateSoundInput,
    delete: PlaylistDeleteSoundInput,
    get: PlaylistSoundGetInputInternal,
    list: PlaylistSoundListInputInternal,
    toolInput: PlaylistSoundFactoryUnion,
  },
  // pausedTime is nullable scalar — let DP-16 compare normally.
  // No nested SchemaFields here, so no skipFields beyond default 'flags'.
  dp16SkipFields: [],
  formatter: serializePlaylistSoundViewModel,
  listItemFormatter: serializePlaylistSoundListItem,
  responseKeys: {
    viewModel: 'sound',
    listArray: 'sounds',
    remainingCount: 'remainingSoundCount',
  },
  notifyKind: 'playlist-sound',
  formatNotifyTitle: (doc: any) =>
    `Sound "${doc?._source?.name ?? doc?.name ?? '(unnamed)'}"`,
  formatNotifySummary: (input: any) =>
    `on playlist ${input.playlistId}`,
});

// ── Top-level Playlist CRUD (hand-rolled) ────────────────────────────────────

const PLAYLIST_DENY = (op: string) => `Access denied: ${op}Playlist requires GM`;

export async function createPlaylist(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: PLAYLIST_DENY('create') };

  const input = PlaylistCreatePlaylistInput.strict().parse(data ?? {});

  // BUG-075: snapshot BEFORE Foundry mutates the payload.
  const { action: _action, sounds: _sounds, ...rest } = input as any;
  const requestedChanges = { ...rest, sounds: input.sounds ?? [] };
  const inlineSounds = (input.sounds ?? []) as Array<Record<string, unknown>>;

  return wrappedWrite('playlist.createPlaylist', async () => {
    // Create the top-level Playlist with everything EXCEPT sounds — sounds are
    // added via createEmbeddedDocuments after the parent is materialised.
    const cleaned = deepStripUndefined({ ...rest });
    const created: any = await (Playlist as any).create(cleaned);
    if (!created) {
      throw new Error('PLAYLIST_WRITE_NOT_PERSISTED: Playlist.create returned empty');
    }

    let soundIds: string[] = [];
    if (inlineSounds.length > 0) {
      const cleanedSounds = inlineSounds.map((s) => deepStripUndefined({ ...s }));
      const soundDocs = await created.createEmbeddedDocuments('PlaylistSound', cleanedSounds);
      const arr = Array.isArray(soundDocs) ? soundDocs : [soundDocs];
      soundIds = arr.map((d: any) => d.id as string);
    }

    // DP-16 post-verify: re-read from game.playlists.
    const persisted = (game as any).playlists?.get(created.id);
    if (!persisted) {
      throw new Error(
        `PLAYLIST_WRITE_NOT_PERSISTED: Playlist "${created.id}" missing from game.playlists after create`,
      );
    }
    // F08 _source check on name (the only required field — sentinel for write success).
    if ((persisted._source as any)?.name !== input.name) {
      throw new Error(
        `PLAYLIST_WRITE_NOT_PERSISTED: post-create _source.name = ${JSON.stringify((persisted._source as any)?.name)}, expected ${JSON.stringify(input.name)}`,
      );
    }

    notify.created('playlist', `Playlist "${persisted._source.name}"`, {
      summary: soundIds.length > 0 ? `with ${soundIds.length} sound(s)` : 'empty',
    });

    return {
      success: true as const,
      data: {
        success: true,
        id: persisted.id,
        name: persisted._source.name,
        soundIds,
        requestedChanges,
        playlist: serializePlaylistViewModel(persisted),
      },
    };
  });
}

export async function updatePlaylist(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: PLAYLIST_DENY('update') };

  const input = PlaylistUpdatePlaylistInput.strict().parse(data ?? {});
  const playlist = getParentOrThrow('playlists', input.playlistId);

  // BUG-075: snapshot BEFORE the mutating call.
  const requestedChanges = { ...input.changes };
  const changedFields = Object.keys(requestedChanges);

  return wrappedWrite('playlist.updatePlaylist', async () => {
    await playlist.update(requestedChanges);

    // DP-16 post-verify: re-read via game.playlists.
    const persisted = (game as any).playlists?.get(input.playlistId);
    if (!persisted) {
      throw new Error(
        `PLAYLIST_WRITE_NOT_PERSISTED: Playlist "${input.playlistId}" missing after update`,
      );
    }
    const skip = new Set<string>(['flags']);
    for (const [field, requestedValue] of Object.entries(requestedChanges)) {
      if (skip.has(field)) continue;
      const persistedValue = (persisted._source as any)?.[field];
      if (persistedValue !== requestedValue) {
        throw new Error(
          `PLAYLIST_WRITE_NOT_PERSISTED: field "${field}" expected ${JSON.stringify(requestedValue)} ` +
            `but post-update _source value is ${JSON.stringify(persistedValue)}`,
        );
      }
    }

    notify.updated('playlist', `Playlist "${persisted._source.name}"`, {
      summary: changedFields.join(', '),
    });

    return {
      success: true as const,
      data: {
        success: true,
        playlistId: input.playlistId,
        playlist: serializePlaylistViewModel(persisted),
        requestedChanges,
        changedFields,
      },
    };
  });
}

export async function deletePlaylist(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: PLAYLIST_DENY('delete') };

  const input = PlaylistDeletePlaylistInput.strict().parse(data ?? {});
  if (!input.confirm) {
    return {
      success: false,
      error: 'PLAYLIST_DELETE_NOT_CONFIRMED: delete-playlist requires confirm: true (CCR-Delete-Safety)',
    };
  }

  const playlist = getParentOrThrow('playlists', input.playlistId);

  // DP-18 cascade-aware verify: snapshot sound count BEFORE delete so the
  // response can surface deletedSoundCount.
  const deletedSoundCount: number = (playlist.sounds?.size as number) ?? 0;
  const deletedName: string = (playlist._source?.name as string) ?? '(unnamed)';

  return wrappedWrite('playlist.deletePlaylist', async () => {
    // Phase 10 cross-doc-fk cascade: clear Scene.playlist + Scene.playlistSound
    // FKs targeting this playlist (and its embedded sounds) BEFORE delete.
    let affectedDocs: import('@foundry-mcp/shared').FkAffectedDocEntry[] | undefined;
    if (input.cascade === true) {
      // R2.3: helper per sub-walk; compound fan-out (Playlist + each embedded
      // sound) preserved. affectedDocs order is identical to the prior inlined loop
      // (playlist refs first, then sound refs in sound order) — targets are disjoint
      // so the cleared set/order is unchanged.
      const { clearInboundOrphansFor } = await import('./cross-doc-fk.js');
      affectedDocs = await clearInboundOrphansFor('Playlist', input.playlistId);
      for (const s of (playlist.sounds?.contents ?? []) as any[]) {
        affectedDocs.push(...(await clearInboundOrphansFor('PlaylistSound', s.id)));
      }
    }

    await playlist.delete();

    // DP-16/DP-18 post-verify: confirm parent removal + implicit cascade.
    const stillPresent = (game as any).playlists?.get(input.playlistId);
    if (stillPresent) {
      throw new Error(
        `PLAYLIST_WRITE_NOT_PERSISTED: Playlist "${input.playlistId}" still present after delete`,
      );
    }

    notify.deleted('playlist', `Playlist "${deletedName}"`, {
      summary: deletedSoundCount > 0 ? `cascaded ${deletedSoundCount} sound(s)` : 'no embedded sounds',
    });

    return {
      success: true as const,
      data: {
        success: true,
        playlistId: input.playlistId,
        deletedSoundCount,
        ...(affectedDocs !== undefined ? { affectedDocs } : {}),
      },
    };
  });
}

export async function getPlaylist(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: PLAYLIST_DENY('get') };

  const input = PlaylistGetPlaylistInput.strict().parse(data ?? {});
  const playlist = getParentOrThrow('playlists', input.playlistId);

  return {
    success: true,
    data: {
      success: true,
      playlist: serializePlaylistViewModel(playlist),
    },
  };
}

export async function listPlaylists(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: PLAYLIST_DENY('list') };

  const input = PlaylistListPlaylistsInput.strict().parse(data ?? {});

  const all: any[] = ((game as any).playlists?.contents as any[] | undefined) ?? [];

  let filtered = all;
  if (input.filter !== undefined) {
    const needle = String(input.filter).toLowerCase();
    filtered = filtered.filter((p) => ((p._source?.name as string) ?? '').toLowerCase().includes(needle));
  }
  if (input.folder !== undefined) {
    filtered = filtered.filter((p) => ((p._source?.folder as string) ?? null) === input.folder);
  }
  const total = filtered.length;

  if (input.countOnly) {
    const filterApplied =
      input.filter !== undefined
        ? `filter=${input.filter}`
        : input.folder !== undefined
          ? `folder=${input.folder ?? 'null'}`
          : null;
    return {
      success: true,
      data: { success: true, total, filterApplied },
    };
  }

  if (input.page !== undefined || input.pageSize !== undefined) {
    const pageSize = input.pageSize ?? 20;
    const page = input.page ?? 1;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const offset = (page - 1) * pageSize;
    const paged = filtered.slice(offset, offset + pageSize);
    return {
      success: true,
      data: {
        success: true,
        total,
        page,
        pageSize,
        pageCount,
        playlists: paged.map(serializePlaylistListItem),
      },
    };
  }

  return {
    success: true,
    data: {
      success: true,
      playlists: filtered.map(serializePlaylistListItem),
    },
  };
}

export async function playPlaylist(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: PLAYLIST_DENY('play') };

  const input = PlaylistPlayInput.strict().parse(data ?? {});
  const playlist = getParentOrThrow('playlists', input.playlistId);

  return wrappedWrite('playlist.playPlaylist', async () => {
    // Optional mode override: 'sequential' | 'shuffle' | 'simultaneous' | 'disabled'.
    if (input.mode) {
      const modeNum = PLAYLIST_PLAY_MODE_ALIASES[input.mode as PlaylistPlayModeAlias];
      await playlist.update({ mode: modeNum });
    }

    await playlist.playAll();

    // Re-read to surface persisted state. Probe B confirmed playAll is parameterless.
    const persisted = (game as any).playlists?.get(input.playlistId);
    if (!persisted) {
      throw new Error(`PLAYLIST_WRITE_NOT_PERSISTED: Playlist "${input.playlistId}" missing after playAll`);
    }
    // BUG-201: assert _source.playing===true after playAll.
    // DISABLED-mode (mode:-1) is a legitimate no-op — playAll does not start DISABLED playlists.
    // Return a suppressed flag instead of throwing a false PLAYLIST_WRITE_NOT_PERSISTED.
    if (persisted._source.mode === -1) {
      notify.updated('playlist', `Playlist "${persisted._source.name}"`, {
        summary: 'play suppressed (DISABLED mode)',
      });
      return {
        success: true as const,
        data: {
          success: true,
          playlistId: input.playlistId,
          playing: false,
          mode: persisted._source.mode,
          suppressed: true,
        },
      };
    }
    if (persisted._source.playing !== true) {
      throw new Error(
        `PLAYLIST_WRITE_NOT_PERSISTED: _source.playing is false after playAll (mode: ${JSON.stringify(persisted._source.mode)})`,
      );
    }

    notify.updated('playlist', `Playlist "${persisted._source.name}"`, {
      summary: input.mode ? `playing (${input.mode})` : 'playing',
    });

    return {
      success: true as const,
      data: {
        success: true,
        playlistId: input.playlistId,
        playing: !!persisted._source.playing,
        mode: persisted._source.mode,
      },
    };
  });
}

export async function stopPlaylist(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: PLAYLIST_DENY('stop') };

  const input = PlaylistStopInput.strict().parse(data ?? {});
  const playlist = getParentOrThrow('playlists', input.playlistId);

  return wrappedWrite('playlist.stopPlaylist', async () => {
    await playlist.stopAll();

    const persisted = (game as any).playlists?.get(input.playlistId);
    if (!persisted) {
      throw new Error(`PLAYLIST_WRITE_NOT_PERSISTED: Playlist "${input.playlistId}" missing after stopAll`);
    }
    // BUG-202: assert _source.playing===false after stopAll.
    // Idempotent double-stop: already-stopped leaves playing:false → no throw.
    if (persisted._source.playing !== false) {
      throw new Error(
        `PLAYLIST_WRITE_NOT_PERSISTED: _source.playing is still true after stopAll`,
      );
    }

    notify.updated('playlist', `Playlist "${persisted._source.name}"`, {
      summary: 'stopped',
    });

    return {
      success: true as const,
      data: {
        success: true,
        playlistId: input.playlistId,
        playing: !!persisted._source.playing,
      },
    };
  });
}

// ── Sound CRUD pass-through to factory ───────────────────────────────────────
export const addPlaylistSound = soundFactoryHandlers.create;
export const updatePlaylistSound = soundFactoryHandlers.update;

// Phase 10 cross-doc-fk: bespoke delete-sound override (factory stays cascade-free
// for generic reuse). Mirrors deletePlaylist pattern; cascade targets are
// Scene.playlistSound FKs pointing at this specific sound.
export async function deletePlaylistSound(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: PLAYLIST_DENY('delete-sound') };

  const input: any = data ?? {};
  // No cascade fast path: delegate to factory.
  if (input.cascade !== true) {
    return soundFactoryHandlers.delete(data);
  }

  // Cascade path: clear inbound FKs first, then delegate to factory for the actual delete.
  const { clearInboundOrphansFor } = await import('./cross-doc-fk.js');

  // BUG-306: only the FK-clear runs under this transaction —
  // clearInboundOrphansFor's contract makes the caller responsible for wrapping.
  // The factory delete below runs its own wrappedWrite; nesting it here
  // created a second independent transaction that committed even when the
  // outer one later failed (transactions don't join), so it now runs after.
  // R2.3: helper is the wrappedWrite body (the read-only walk now runs inside the
  // same transaction — no writes precede it, so the cleared set is unchanged).
  const affectedDocs = await wrappedWrite('playlist.deletePlaylistSound.cascade', () =>
    clearInboundOrphansFor('PlaylistSound', input.soundId),
  );

  // Factory delete handles the actual deleteEmbeddedDocuments + post-verify
  // (and wraps itself in wrappedWrite).
  const result = await soundFactoryHandlers.delete(data);
  if (!result.success) return result;
  return {
    success: true as const,
    data: { ...(result.data as any), affectedDocs },
  };
}

// ── Phase 9C — duplicate / pause-sound / bulk-import / preload ─────────────────

// R9C.3 — duplicate a whole Playlist (toObject minus _id/sort/folder → create). CCR-2a.
export async function duplicatePlaylist(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: PLAYLIST_DENY('duplicate') };

  const input: PlaylistDuplicateInputType = PlaylistDuplicateInput.strict().parse(data ?? {});
  const source = getParentOrThrow('playlists', input.playlistId);
  const sourceId = source.id as string;

  return wrappedWrite('playlist.duplicatePlaylist', async () => {
    const payload: any = source.toObject();
    delete payload._id;
    delete payload.sort;
    delete payload.folder;
    payload.name = `${source._source?.name ?? source.name} (Copy)`;

    const created: any = await (Playlist as any).create(payload);
    if (!created) throw new Error('PLAYLIST_DUPLICATE_FAILED: Playlist.create returned empty');

    const persisted = (game as any).playlists?.get(created.id);
    if (!persisted || persisted.id === sourceId) {
      throw new Error(`PLAYLIST_DUPLICATE_FAILED: cloned playlist missing or equals source id`);
    }

    notify.created('playlist', `Playlist "${persisted._source?.name}"`, {
      summary: `duplicated from ${sourceId}`,
    });

    return {
      success: true as const,
      data: { id: persisted.id, name: persisted._source?.name, playlist: serializePlaylistViewModel(persisted) },
    };
  });
}

// R9C.5 — pause-sound: thin wrapper enforcing {playing:false, pausedTime?}. CCR-2a.
export async function pausePlaylistSound(data: unknown): Promise<Envelope<any>> {
  const input: PlaylistPauseSoundInputType = PlaylistPauseSoundInput.strict().parse(data ?? {});
  const changes: Record<string, unknown> = { playing: false };
  if (input.pausedTime !== undefined) changes.pausedTime = input.pausedTime;
  // Delegate to the factory update path (re-uses CCR-2a verify + notify).
  return updatePlaylistSound({
    action: 'update-sound',
    playlistId: input.playlistId,
    soundId: input.soundId,
    changes,
  });
}

// R9C.5 — bulk-import-sounds: create one PlaylistSound per audio file in a folder. CCR-2a.
export async function bulkImportSounds(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: PLAYLIST_DENY('bulk-import') };

  const input: PlaylistBulkImportSoundsInputType = PlaylistBulkImportSoundsInput.strict().parse(data ?? {});
  const playlist = getParentOrThrow('playlists', input.playlistId);
  const source = input.source ?? 'data';

  const FilePicker: any =
    (foundry as any)?.applications?.apps?.FilePicker?.implementation ?? (globalThis as any).FilePicker;
  if (!FilePicker?.browse) {
    return { success: false, error: 'FILEPICKER_UNAVAILABLE: FilePicker.browse is not available' };
  }

  const AUDIO_EXT = /\.(ogg|mp3|wav|flac|m4a|opus|webm)$/i;

  return wrappedWrite('playlist.bulkImportSounds', async () => {
    const result = await FilePicker.browse(source, input.folder);
    const files: string[] = (result?.files ?? []).filter((f: string) => AUDIO_EXT.test(f));
    if (files.length === 0) {
      throw new Error(`PLAYLIST_BULK_IMPORT_EMPTY: no audio files found in "${input.folder}"`);
    }

    const payloads = files.map((path) => {
      const name = path.split('/').pop()?.replace(AUDIO_EXT, '') ?? path;
      return { name, path };
    });
    const before = playlist.sounds?.size ?? 0;
    await playlist.createEmbeddedDocuments('PlaylistSound', payloads);

    // CCR-2a: re-read — sound count grew by the number imported.
    const after = playlist.sounds?.size ?? 0;
    if (after !== before + payloads.length) {
      throw new Error(
        `PLAYLIST_BULK_IMPORT_NOT_PERSISTED: expected ${before + payloads.length} sounds, found ${after}`,
      );
    }

    notify.created('playlist', `Playlist "${playlist._source?.name}"`, {
      summary: `bulk-imported ${payloads.length} sound(s) from ${input.folder}`,
    });

    return {
      success: true as const,
      data: { playlistId: input.playlistId, imported: payloads.length, files },
    };
  });
}

// R9C.5 — preload-sound: game.audio.preload(src) cross-client broadcast. CCR-2b transient.
export async function preloadPlaylistSound(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: PLAYLIST_DENY('preload') };

  const input: PlaylistPreloadSoundInputType = PlaylistPreloadSoundInput.strict().parse(data ?? {});

  // CCR-2b transient: confirm the preload Promise resolved; nothing persisted.
  const audio = (game as any).audio;
  if (typeof audio?.preload !== 'function') {
    return { success: false, error: 'AUDIO_PRELOAD_UNAVAILABLE: game.audio.preload is not available' };
  }
  await audio.preload(input.src);

  notify.info(`Preloaded sound "${input.src}" to all clients`);

  return {
    success: true as const,
    data: { src: input.src, preloaded: true },
  };
}

// ── Umbrella dispatcher ──────────────────────────────────────────────────────

export async function dispatchPlaylist(data: unknown): Promise<any> {
  let input: any;
  try {
    input = PlaylistToolInput.parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  switch (input.action) {
    case 'create-playlist':
      return createPlaylist(input);
    case 'update-playlist':
      return updatePlaylist(input);
    case 'delete-playlist':
      return deletePlaylist(input);
    case 'get-playlist':
      return getPlaylist(input);
    case 'list-playlists':
      return listPlaylists(input);
    case 'add-sound':
      return addPlaylistSound(input);
    case 'update-sound':
      return updatePlaylistSound(input);
    case 'delete-sound':
      return deletePlaylistSound(input);
    case 'play':
      return playPlaylist(input);
    case 'stop':
      return stopPlaylist(input);
    case 'duplicate-playlist':
      return duplicatePlaylist(input);
    case 'pause-sound':
      return pausePlaylistSound(input);
    case 'bulk-import-sounds':
      return bulkImportSounds(input);
    case 'preload-sound':
      return preloadPlaylistSound(input);
    default:
      throw new Error(`Unknown playlist action: ${(input as any).action}`);
  }
}
