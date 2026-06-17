// Phase 8 (R8.4): dynamic-soundscapes sub-family of module-scene-atmosphere — result interfaces + formatters
// extracted VERBATIM from scene-atmosphere.ts (no logic change; the split is purely to land
// each file <=600 lines). Imported back by the main tool's formatResult trampoline.
import { FolderId, PlaylistId, PlaylistSoundId } from '@foundry-mcp/shared';

// ── Phase 5: dynamic-soundscapes result shapes ────────────────────────────────

export interface SetSoundscapeResult {
  playlistId: PlaylistId;
  playlistName: string;
  verifiedPlaylistId: PlaylistId;
  settingMatch: boolean;
  updateStateDelayNote: string;
}

export interface StopSoundscapeResult {
  stopped: boolean;
  previousPlaylistId: PlaylistId | null;
  previousPlaylistName: string | null;
  verifiedPlaylistId: PlaylistId | null;
  updateStateDelayNote: string;
}

export interface SetMoodResult {
  playlistId: PlaylistId;
  playlistName: string;
  mood: string;
  verifiedMood: string;
  moodMatch: boolean;
  moodNote: string;
}

export interface GetMoodResult {
  playlistId: PlaylistId;
  playlistName: string;
  mood: string;
  isFlagExplicit: boolean;
  moodNote: string;
}

export interface SetLayerEnabledResult {
  playlistId: PlaylistId;
  playlistName: string;
  soundId: PlaylistSoundId;
  soundName: string;
  enabled: boolean;
  verifiedEnabled: boolean | null;
  flagMatch: boolean;
}

export interface SetLayerVolumeResult {
  playlistId: PlaylistId;
  playlistName: string;
  soundId: PlaylistSoundId;
  soundName: string;
  volume: number;
  verifiedVolume: number | null;
  volumeMatch: boolean;
}

export interface SoundscapeEntry {
  id: string;
  name: string;
  mood: string;
  isPlaying: boolean;
  blockCount: number;
  soundCount: number;
}

export interface ListSoundscapesResult {
  soundscapesFolder: string | null;
  soundscapesFolderId: FolderId | null;
  playingPlaylistId: PlaylistId | null;
  count: number;
  soundscapes: SoundscapeEntry[];
}

export interface BlockSoundRef {
  id: string;
  name: string | null;
}

export interface BlockEntry {
  title: string;
  id: string | undefined;
  mode: string | undefined;
  isOrphaned: boolean | undefined;
  time: number | undefined;
  variance: number | undefined;
  size: string | undefined;
  color: string | undefined;
  conditions: string[];
  conditionMode: string;
  soundCount: number;
  sounds: BlockSoundRef[];
}

export interface ListBlocksResult {
  playlistId: PlaylistId;
  playlistName: string;
  blockCount: number;
  blocks: BlockEntry[];
}

export interface GetSelectedResult {
  selectedPlaylistId: PlaylistId | null;
  selectedPlaylistName: string | null;
  playingPlaylistId: PlaylistId | null;
  note: string;
}

export interface SetSelectedResult {
  playlistId: PlaylistId | null;
  playlistName: string | null;
  verifiedPlaylistId: PlaylistId | null;
  settingMatch: boolean;
  note: string;
}

export interface CreateSoundscapeResult {
  playlistId: PlaylistId;
  playlistName: string;
  folderId: FolderId;
  folderName: string;
  mode: number;
  modeNote: string;
}

export interface DeleteSoundscapeResult {
  deleted: boolean;
  playlistId: PlaylistId;
  playlistName: string;
  soundsDeleted: number;
  stoppedPlayback: boolean;
  verifiedGone: boolean;
}

export interface AddSoundResult {
  playlistId: PlaylistId;
  playlistName: string;
  soundId: PlaylistSoundId;
  soundName: string;
  path: string;
  volume: number;
  repeat: boolean;
  verifiedSoundExists: boolean;
  totalSoundCount: number;
  blockNote: string;
}

export interface RemoveSoundResult {
  playlistId: PlaylistId;
  playlistName: string;
  soundId: PlaylistSoundId;
  soundName: string;
  deleted: boolean;
  verifiedGone: boolean;
  remainingSoundCount: number;
  blocksModified: boolean;
  affectedBlocks: string[];
}

export interface UpdateBlocksResult {
  playlistId: PlaylistId;
  playlistName: string;
  previousBlockCount: number;
  newBlockCount: number;
  verifiedBlockCount: number;
  countMatch: boolean;
  updateStateDelayNote: string;
}

export type DynamicSoundscapesResult =
  | SetSoundscapeResult
  | StopSoundscapeResult
  | SetMoodResult
  | GetMoodResult
  | SetLayerEnabledResult
  | SetLayerVolumeResult
  | ListSoundscapesResult
  | ListBlocksResult
  | GetSelectedResult
  | SetSelectedResult
  | CreateSoundscapeResult
  | DeleteSoundscapeResult
  | AddSoundResult
  | RemoveSoundResult
  | UpdateBlocksResult;


// ── Phase 5: dynamic-soundscapes formatters (F03 — emit EVERY returned field) ─

export function formatSetSoundscape(r: SetSoundscapeResult): string {
  const match = r.settingMatch ? 'OK' : `MISMATCH (verified=${r.verifiedPlaylistId})`;
  return [
    `dynamic-soundscapes: set-soundscape OK — playlist "${r.playlistName}" (${r.playlistId}).`,
    `Setting verified: ${match}`,
    `Note: ${r.updateStateDelayNote}`,
  ].join('\n');
}

export function formatStopSoundscape(r: StopSoundscapeResult): string {
  const prev = r.previousPlaylistName
    ? `"${r.previousPlaylistName}" (${r.previousPlaylistId})`
    : '(none was playing)';
  return [
    `dynamic-soundscapes: stop-soundscape OK (stopped=${r.stopped}).`,
    `Previous: ${prev}`,
    `Verified playingPlaylist: "${r.verifiedPlaylistId ?? ''}"`,
    `Note: ${r.updateStateDelayNote}`,
  ].join('\n');
}

export function formatSetMood(r: SetMoodResult): string {
  const match = r.moodMatch ? 'OK' : `MISMATCH (verified=${r.verifiedMood})`;
  return [
    `dynamic-soundscapes: set-mood OK — "${r.playlistName}" (${r.playlistId}) mood=${r.mood}.`,
    `Verified: ${match}`,
    `Note: ${r.moodNote}`,
  ].join('\n');
}

export function formatGetMood(r: GetMoodResult): string {
  const explicitLabel = r.isFlagExplicit ? '(explicit flag)' : '(absent flag — module default)';
  return [
    `dynamic-soundscapes: get-mood — "${r.playlistName}" (${r.playlistId}): mood=${r.mood} ${explicitLabel}.`,
    `Note: ${r.moodNote}`,
  ].join('\n');
}

export function formatSetLayerEnabled(r: SetLayerEnabledResult): string {
  const match = r.flagMatch ? 'OK' : `MISMATCH (verified=${r.verifiedEnabled})`;
  return [
    `dynamic-soundscapes: set-layer-enabled OK — sound "${r.soundName}" (${r.soundId}) in "${r.playlistName}".`,
    `enabled=${r.enabled} | Verified: ${match}`,
  ].join('\n');
}

export function formatSetLayerVolume(r: SetLayerVolumeResult): string {
  const match = r.volumeMatch ? 'OK' : `MISMATCH (verified=${r.verifiedVolume})`;
  return [
    `dynamic-soundscapes: set-layer-volume OK — sound "${r.soundName}" (${r.soundId}) in "${r.playlistName}".`,
    `volume=${r.volume} | Verified: ${match}`,
  ].join('\n');
}

export function formatListSoundscapes(r: ListSoundscapesResult): string {
  const folderLabel = r.soundscapesFolder
    ? `"${r.soundscapesFolder}" (${r.soundscapesFolderId})`
    : '(folder not found)';
  const rows = r.soundscapes.map((s) => {
    const playing = s.isPlaying ? ' [PLAYING]' : '';
    return `  - "${s.name}" (${s.id})${playing} | mood=${s.mood} | blocks=${s.blockCount} sounds=${s.soundCount}`;
  });
  return [
    `dynamic-soundscapes: list-soundscapes — ${r.count} soundscape(s) in folder ${folderLabel}.`,
    `Playing: ${r.playingPlaylistId ?? '(none)'}`,
    rows.join('\n'),
  ].join('\n');
}

export function formatListBlocks(r: ListBlocksResult): string {
  const rows = r.blocks.map((b) => {
    const cond = b.conditions.length > 0
      ? ` conditions=[${b.conditions.join(',')}]/${b.conditionMode}`
      : '';
    const orphan = b.isOrphaned ? ' [ORPHANED]' : '';
    return `  [${b.id ?? '?'}] "${b.title}" mode=${b.mode ?? '?'}${orphan} sounds=${b.soundCount}${cond}`;
  });
  return [
    `dynamic-soundscapes: list-blocks — "${r.playlistName}" (${r.playlistId}) — ${r.blockCount} block(s).`,
    rows.join('\n'),
  ].join('\n');
}

export function formatGetSelected(r: GetSelectedResult): string {
  const sel = r.selectedPlaylistName
    ? `"${r.selectedPlaylistName}" (${r.selectedPlaylistId})`
    : r.selectedPlaylistId
      ? `(${r.selectedPlaylistId})`
      : '(none)';
  return [
    `dynamic-soundscapes: get-selected — selectedPlaylist=${sel}.`,
    `Playing: ${r.playingPlaylistId ?? '(none)'}`,
    `Note: ${r.note}`,
  ].join('\n');
}

export function formatSetSelected(r: SetSelectedResult): string {
  const match = r.settingMatch ? 'OK' : `MISMATCH (verified=${r.verifiedPlaylistId ?? 'null'})`;
  const name = r.playlistName ? `"${r.playlistName}"` : '(cleared)';
  return [
    `dynamic-soundscapes: set-selected OK — selectedPlaylist=${name} (${r.playlistId ?? 'none'}).`,
    `Verified: ${match}`,
    `Note: ${r.note}`,
  ].join('\n');
}

export function formatCreateSoundscape(r: CreateSoundscapeResult): string {
  return [
    `dynamic-soundscapes: create-soundscape OK — "${r.playlistName}" (${r.playlistId}).`,
    `Folder: "${r.folderName}" (${r.folderId}) | mode=${r.mode}`,
    `Note: ${r.modeNote}`,
  ].join('\n');
}

export function formatDeleteSoundscape(r: DeleteSoundscapeResult): string {
  return [
    `dynamic-soundscapes: delete-soundscape OK — "${r.playlistName}" (${r.playlistId}).`,
    `Deleted: ${r.deleted} | Verified gone: ${r.verifiedGone} | Sounds deleted: ${r.soundsDeleted}`,
    r.stoppedPlayback ? 'Was playing — stopped before delete.' : '',
  ].filter(Boolean).join('\n');
}

export function formatAddSound(r: AddSoundResult): string {
  return [
    `dynamic-soundscapes: add-sound OK — "${r.soundName}" (${r.soundId}) in "${r.playlistName}".`,
    `path=${r.path} | volume=${r.volume} | repeat=${r.repeat}`,
    `Verified exists: ${r.verifiedSoundExists} | Total sounds: ${r.totalSoundCount}`,
    `Note: ${r.blockNote}`,
  ].join('\n');
}

export function formatRemoveSound(r: RemoveSoundResult): string {
  const blockInfo = r.blocksModified
    ? `Removed path=${r.soundId} from blocks: ${r.affectedBlocks.join(', ')}`
    : 'Sound was not in any block.';
  return [
    `dynamic-soundscapes: remove-sound OK — "${r.soundName}" (${r.soundId}) playlist=${r.playlistId}.`,
    `Deleted: ${r.deleted} | Verified gone: ${r.verifiedGone} | Remaining sounds: ${r.remainingSoundCount}`,
    blockInfo,
  ].join('\n');
}

export function formatUpdateBlocks(r: UpdateBlocksResult): string {
  const match = r.countMatch ? 'OK' : `MISMATCH (verified=${r.verifiedBlockCount})`;
  return [
    `dynamic-soundscapes: update-blocks OK — "${r.playlistName}" (${r.playlistId}).`,
    `Previous=${r.previousBlockCount} → New=${r.newBlockCount} | Verified: ${match}`,
    `Note: ${r.updateStateDelayNote}`,
  ].join('\n');
}

