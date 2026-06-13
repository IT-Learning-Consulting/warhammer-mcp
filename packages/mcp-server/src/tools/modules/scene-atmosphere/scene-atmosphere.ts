// Module Integration v1 Phase 6 — module-scene-atmosphere MCP tool.
//
// Umbrella tool exposing the full ~65-action surface of the scene-atmosphere bundle:
// fxmaster / tokenmagic / scenery / scene-transitions / multiface-tiles / dynamic-soundscapes.
//
// Conditional: returns MODULE_NOT_ACTIVE when the relevant member is absent/inactive.
// Returns COMPANION_NOT_ACTIVE for wound-* actions when tokenmagic-automatic-wounds is absent.
//
// Phase 2: fxmaster actions added. Phase 3–5: member actions TBD.
//
// Anchors:
//   - DP-15: typed this.query<T> — never <any>.
//   - CCR-G2: errorContent is module-local (not on BaseTool).
//   - Phase-5 F03: formatter emits EVERY field each handler returns (no silent drops).
//   - Phase 6 plan §2.1 + fxmaster audit.md §API Surface.

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { moduleNotActiveContent } from '../_shared/module-guard.js';

const TOOL_NAME = 'module-scene-atmosphere' as const;

// ── Response shapes (DP-15 — typed interfaces, never <any> on this.query) ────

interface BundleMemberStatus {
  id: string;
  active: boolean;
  title: string | null;
  version: string | null;
}

interface GetBundleStatusResult {
  members: BundleMemberStatus[];
}

// ── Phase 2: fxmaster result shapes ──────────────────────────────────────────

interface PlayPresetResult {
  preset: string;
  options: Record<string, unknown>;
  activePresets: string[];
}

interface StopPresetResult {
  preset: string;
  stopped: boolean;
  activePresets: string[];
}

interface TogglePresetResult {
  preset: string;
  toggled: boolean;
  activePresets: string[];
}

interface SwitchPresetResult {
  preset: string | null;
  switched: boolean;
  activePresets: string[];
}

interface ListPresetsResult {
  presets: string[];
  count: number;
  hasFxmasterPlus: boolean;
  hasFxmaster: boolean;
  note: string;
}

interface ListActivePresetsResult {
  presets: string[];
  count: number;
  scene: string | null;
}

interface ListValidPresetsResult {
  presets: string[];
  count: number;
  topDown: boolean;
  note: string;
}

interface PlayParticlesResult {
  ids: Record<string, unknown>;
  particleCount: number;
  types: string[];
  verifiedEffectsFlag: unknown;
}

interface PlayFiltersResult {
  ids: Record<string, unknown>;
  filterCount: number;
  types: string[];
  verifiedFiltersFlag: unknown;
}

interface StopEffectsResult {
  stopped: boolean;
  particles: string[];
  filters: string[];
  effects: string[];
}

interface ToggleEffectsResult {
  toggled: boolean;
  toggleKey: string | null;
  particles: string[];
  filters: string[];
  effects: string[];
}

interface ClearEffectsResult {
  cleared: string[];
  target: string;
  verify: {
    effectsFlag: unknown;
    filtersFlag: unknown;
    stackFlag: unknown;
  };
}

interface SetEnabledResult {
  disableAll: boolean;
  verifiedDisableAll: boolean;
  note: string;
}

interface SetRegionParticlesResult {
  regionId: string;
  behaviorId: string | null;
  behaviorType: string;
  particleType: string;
  replaced: boolean;
}

interface SetRegionFiltersResult {
  regionId: string;
  behaviorId: string | null;
  behaviorType: string;
  filterType: string;
  replaced: boolean;
}

interface SuppressSceneParticlesResult {
  regionId: string;
  behaviorId?: string | null;
  removed: boolean;
  behaviorType: string;
}

interface SuppressSceneFiltersResult {
  regionId: string;
  behaviorId?: string | null;
  removed: boolean;
  behaviorType: string;
}

// Phase 2 union of all fxmaster results
type FxmasterResult =
  | PlayPresetResult
  | StopPresetResult
  | TogglePresetResult
  | SwitchPresetResult
  | ListPresetsResult
  | ListActivePresetsResult
  | ListValidPresetsResult
  | PlayParticlesResult
  | PlayFiltersResult
  | StopEffectsResult
  | ToggleEffectsResult
  | ClearEffectsResult
  | SetEnabledResult
  | SetRegionParticlesResult
  | SetRegionFiltersResult
  | SuppressSceneParticlesResult
  | SuppressSceneFiltersResult;

// ── Phase 3: tokenmagic + automatic-wounds result shapes ──────────────────────

interface TokenmagicApplyResult {
  placeableId: string;
  placeableType: string;
  appliedCount: number;
  filterTypes: string[];
  filterIds: (string | null)[];
  replace: boolean;
  verifiedFilterCount: number | null;
}

interface TokenmagicUpsertResult {
  placeableId: string;
  placeableType: string;
  upsertedCount: number;
  filterTypes: string[];
  filterIds: (string | null)[];
  verifiedFilterCount: number | null;
}

interface TokenmagicRemoveResult {
  placeableId: string;
  placeableType: string;
  filterId: string | null;
  filterType: string | null;
  filterInternalId: string | null;
  targetDesc: string;
  verifiedRemainingFilterCount: number;
}

interface TokenmagicQueryResult {
  subAction: string;
  // Fields vary by subAction — typed as unknown; formatter emits all per F03.
  [key: string]: unknown;
}

interface TokenmagicPresetResult {
  subAction: string;
  [key: string]: unknown;
}

interface TokenmagicWoundCreateResult {
  tokenId: string;
  tokenName: string;
  damageFraction: number;
  verifiedWoundFilterCount: number;
}

interface TokenmagicWoundHealResult {
  tokenId: string;
  tokenName: string;
  healingFraction: number;
  verifiedRemainingWoundFilterCount: number;
}

interface TokenmagicWoundRemoveResult {
  tokenId: string;
  tokenName: string;
  removed: boolean;
  verifiedRemainingWoundFilterCount: number;
}

interface TokenmagicWoundReapplyResult {
  tokenId: string;
  tokenName: string;
  reapplied: boolean;
  verifiedWoundFilterCount: number;
}

interface WoundToggleDisableResult {
  actorId: string;
  actorName: string;
  disabled: boolean;
  enabled: boolean;
  toggled: boolean;
  note?: string;
  flagInversionNote: string;
}

interface WoundSetBloodColorResult {
  tokenId: string;
  tokenName: string;
  color: string;
  verifiedColor: string | null;
  colorMatchesInput: boolean;
}

type TokenmagicResult =
  | TokenmagicApplyResult
  | TokenmagicUpsertResult
  | TokenmagicRemoveResult
  | TokenmagicQueryResult
  | TokenmagicPresetResult
  | TokenmagicWoundCreateResult
  | TokenmagicWoundHealResult
  | TokenmagicWoundRemoveResult
  | TokenmagicWoundReapplyResult
  | WoundToggleDisableResult
  | WoundSetBloodColorResult;

// ── Phase 4B: scenery result shapes ──────────────────────────────────────────

interface SceneryVariation {
  index: number;
  name: string;
  gmBackground: string | null;
  plBackground: string | null;
  hasSceneData: boolean;
}

interface ListVariationsResult {
  sceneId: string;
  sceneName: string;
  activeVariationIndex: number;
  variations: SceneryVariation[];
  count: number;
  isLegacyMigrated: boolean;
}

interface GetActiveVariationResult {
  sceneId: string;
  sceneName: string;
  hasScenery: boolean;
  activeVariationIndex: number;
  activeVariation: SceneryVariation | null;
}

interface SetActiveVariationResult {
  sceneId: string;
  sceneName: string;
  previousIndex: number;
  newActiveIndex: number;
  newVariationName: string;
  verifiedActiveIndex: number | null;
  elementRestoreSkipNote: string;
}

interface AddVariationResult {
  sceneId: string;
  sceneName: string;
  addedVariationIndex: number;
  addedVariationName: string;
  gmBackground: string | null;
  plBackground: string | null;
  totalVariationsCount: number;
  verifiedTotalCount: number | null;
}

interface DeleteVariationResult {
  sceneId: string;
  sceneName: string;
  deletedVariationName: string;
  deletedIndex: number;
  newActiveVariationIndex: number;
  remainingVariationsCount: number;
  verifiedTotalCount: number | null;
}

interface SetVariationBackgroundsResult {
  sceneId: string;
  sceneName: string;
  variationIndex: number;
  variationName: string;
  gmBackground: string | null;
  plBackground: string | null;
  plBackgroundNote?: string;
  verifiedGmBackground: string | null;
  verifiedPlBackground: string | null;
}

interface ResetVariationSceneDataResult {
  sceneId: string;
  sceneName: string;
  variationIndex: number;
  variationName: string;
  hadSceneData: boolean;
  verifiedHasSceneData: boolean;
}

interface CheckSceneryModuleActiveResult {
  moduleId: string;
  active: boolean;
  title: string | null;
  version: string | null;
}

interface ReadScenerySettingsResult {
  moduleId: string;
  settings: Record<string, unknown>;
  globalElementTypes: Record<string, unknown>;
  note: string;
}

type SceneryResult =
  | ListVariationsResult
  | GetActiveVariationResult
  | SetActiveVariationResult
  | AddVariationResult
  | DeleteVariationResult
  | SetVariationBackgroundsResult
  | ResetVariationSceneDataResult
  | CheckSceneryModuleActiveResult
  | ReadScenerySettingsResult;

// ── Phase 4B: scene-transitions result shapes ─────────────────────────────────

interface TransitionOptions {
  action?: string;
  name?: string;
  content?: string;
  [key: string]: unknown;
}

interface PlayTransitionResult {
  played: boolean;
  showMe: boolean;
  options: TransitionOptions;
  note: string;
}

interface EndTransitionResult {
  ended: boolean;
  note: string;
}

interface SetSceneTransitionResult {
  subAction: string;
  sceneId?: string | null;
  sceneName?: string | null;
  savedOptions?: TransitionOptions;
  // per-scene: verifiedHasOptions; world-default: verified
  verifiedHasOptions?: boolean;
  verified?: boolean;
  // show-journal branch
  showJournal?: boolean;
  note?: string;
}

interface GetSceneTransitionResult {
  subAction: string;
  sceneId?: string | null;
  sceneName?: string | null;
  // per-scene branch
  hasTransition?: boolean;
  transition?: unknown;
  // world-default branch
  hasDefault?: boolean;
  defaultOptions?: unknown;
  note?: string;
}

interface DeleteSceneTransitionResult {
  sceneId: string;
  sceneName: string;
  hadTransition: boolean;
  deleted: boolean;
  verifiedDeleted: boolean;
  note: string;
}

type SceneTransitionsResult =
  | PlayTransitionResult
  | EndTransitionResult
  | SetSceneTransitionResult
  | GetSceneTransitionResult
  | DeleteSceneTransitionResult;

// ── Phase 4B: multiface-tiles result shapes ───────────────────────────────────

interface TileFaceEntry {
  label: string;
  path: string;
  isActive: boolean;
}

interface SwitchTileFaceResult {
  tileId: string;
  tileName: string;
  previousFacePath?: string | null;
  facePath?: string;
  changed: boolean;
  verifiedTextureSrc?: string | null;
  verifiedMatch?: boolean;
  note?: string;
  mattOverlapNote?: string;
}

interface ListTileFacesResult {
  tileId: string;
  originalImage: string | null;
  altImages: string[];
  activeFace: string | null;
  activeFaceLabel: string;
  totalFaces: number;
  faces: TileFaceEntry[];
}

interface GetTileOriginalFaceResult {
  tileId: string;
  tileName: string;
  originalImage: string | null;
  hasOriginalImage: boolean;
  note?: string;
}

interface GetTileActiveFaceResult {
  tileId: string;
  tileName: string;
  activeSrc: string | null;
  activeFaceLabel?: string;
  originalImage?: string | null;
}

interface ResetToOriginalFaceResult {
  tileId: string;
  tileName: string;
  originalImage: string;
  previousFacePath?: string | null;
  changed: boolean;
  verifiedTextureSrc?: string | null;
  verifiedMatch?: boolean;
  note?: string;
}

interface AddTileFaceResult {
  tileId: string;
  tileName: string;
  addedFacePath: string;
  altImages: string[];
  altImagesCount: number;
  originalImage: string | null;
  originalImageSetOnFirstAdd: boolean;
  verifiedAltImages: string[];
  verifiedAltImagesCount: number;
}

interface RemoveTileFaceResult {
  tileId: string;
  tileName: string;
  removedFacePath: string;
  wasActiveFace: boolean;
  altImages: string[];
  altImagesCount: number;
  verifiedAltImages: string[];
  verifiedAltImagesCount: number;
  activeStateNote: string | null;
}

interface CycleTileFaceResult {
  tileId: string;
  tileName: string;
  previousFacePath: string | null;
  previousFaceIndex: number;
  nextFacePath: string;
  nextFaceIndex: number;
  facesInCycle: string[];
  facesCount: number;
  verifiedTextureSrc: string | null;
  verifiedMatch: boolean;
  authoredNote: string;
  mattOverlapNote: string;
}

interface ClearTileFacesResult {
  tileId: string;
  tileName: string;
  hadFaces: boolean;
  clearedAltImagesCount: number;
  clearedOriginalImage: string | null;
  verifiedAltImages: string[];
  verifiedOriginalImage: string | null;
  activeSrc: string | null;
  note: string;
}

type MultifaceTilesResult =
  | SwitchTileFaceResult
  | ListTileFacesResult
  | GetTileOriginalFaceResult
  | GetTileActiveFaceResult
  | ResetToOriginalFaceResult
  | AddTileFaceResult
  | RemoveTileFaceResult
  | CycleTileFaceResult
  | ClearTileFacesResult;

// ── Phase 5: dynamic-soundscapes result shapes ────────────────────────────────

interface SetSoundscapeResult {
  playlistId: string;
  playlistName: string;
  verifiedPlaylistId: string;
  settingMatch: boolean;
  updateStateDelayNote: string;
}

interface StopSoundscapeResult {
  stopped: boolean;
  previousPlaylistId: string | null;
  previousPlaylistName: string | null;
  verifiedPlaylistId: string | null;
  updateStateDelayNote: string;
}

interface SetMoodResult {
  playlistId: string;
  playlistName: string;
  mood: string;
  verifiedMood: string;
  moodMatch: boolean;
  moodNote: string;
}

interface GetMoodResult {
  playlistId: string;
  playlistName: string;
  mood: string;
  isFlagExplicit: boolean;
  moodNote: string;
}

interface SetLayerEnabledResult {
  playlistId: string;
  playlistName: string;
  soundId: string;
  soundName: string;
  enabled: boolean;
  verifiedEnabled: boolean | null;
  flagMatch: boolean;
}

interface SetLayerVolumeResult {
  playlistId: string;
  playlistName: string;
  soundId: string;
  soundName: string;
  volume: number;
  verifiedVolume: number | null;
  volumeMatch: boolean;
}

interface SoundscapeEntry {
  id: string;
  name: string;
  mood: string;
  isPlaying: boolean;
  blockCount: number;
  soundCount: number;
}

interface ListSoundscapesResult {
  soundscapesFolder: string | null;
  soundscapesFolderId: string | null;
  playingPlaylistId: string | null;
  count: number;
  soundscapes: SoundscapeEntry[];
}

interface BlockSoundRef {
  id: string;
  name: string | null;
}

interface BlockEntry {
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

interface ListBlocksResult {
  playlistId: string;
  playlistName: string;
  blockCount: number;
  blocks: BlockEntry[];
}

interface GetSelectedResult {
  selectedPlaylistId: string | null;
  selectedPlaylistName: string | null;
  playingPlaylistId: string | null;
  note: string;
}

interface SetSelectedResult {
  playlistId: string | null;
  playlistName: string | null;
  verifiedPlaylistId: string | null;
  settingMatch: boolean;
  note: string;
}

interface CreateSoundscapeResult {
  playlistId: string;
  playlistName: string;
  folderId: string;
  folderName: string;
  mode: number;
  modeNote: string;
}

interface DeleteSoundscapeResult {
  deleted: boolean;
  playlistId: string;
  playlistName: string;
  soundsDeleted: number;
  stoppedPlayback: boolean;
  verifiedGone: boolean;
}

interface AddSoundResult {
  playlistId: string;
  playlistName: string;
  soundId: string;
  soundName: string;
  path: string;
  volume: number;
  repeat: boolean;
  verifiedSoundExists: boolean;
  totalSoundCount: number;
  blockNote: string;
}

interface RemoveSoundResult {
  playlistId: string;
  playlistName: string;
  soundId: string;
  soundName: string;
  deleted: boolean;
  verifiedGone: boolean;
  remainingSoundCount: number;
  blocksModified: boolean;
  affectedBlocks: string[];
}

interface UpdateBlocksResult {
  playlistId: string;
  playlistName: string;
  previousBlockCount: number;
  newBlockCount: number;
  verifiedBlockCount: number;
  countMatch: boolean;
  updateStateDelayNote: string;
}

type DynamicSoundscapesResult =
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

// Full result union — member phases extend this.
type SceneAtmosphereResult =
  | GetBundleStatusResult
  | FxmasterResult
  | TokenmagicResult
  | SceneryResult
  | SceneTransitionsResult
  | MultifaceTilesResult
  | DynamicSoundscapesResult;

// ── Error helper (CCR-G2 — NOT on BaseTool) ───────────────────────────────────

function errorContent(action: string, message: string) {
  return {
    content: [{ type: 'text' as const, text: `${TOOL_NAME}/${action} failed: ${message}` }],
    isError: true,
  };
}

// ── Format helpers (Phase-5 F03 — emit every returned field) ─────────────────

function formatGetBundleStatus(r: GetBundleStatusResult): string {
  const lines = r.members.map((m) => {
    const status = m.active ? 'ACTIVE' : 'INACTIVE';
    const meta = m.title ? ` (${m.title}${m.version ? ` v${m.version}` : ''})` : '';
    return `- ${m.id}${meta}: ${status}`;
  });
  const activeCount = r.members.filter((m) => m.active).length;
  return `module-scene-atmosphere bundle status: ${activeCount}/${r.members.length} members active.\n\n${lines.join('\n')}`;
}

// ── Phase 2: fxmaster formatters (F03 — emit EVERY returned field) ────────────

function formatPlayPreset(r: PlayPresetResult): string {
  const active = r.activePresets.length > 0 ? r.activePresets.join(', ') : '(none)';
  return `fxmaster: play-preset "${r.preset}" OK.\nOptions: ${JSON.stringify(r.options)}\nNow active: ${active}`;
}

function formatStopPreset(r: StopPresetResult): string {
  const active = r.activePresets.length > 0 ? r.activePresets.join(', ') : '(none)';
  return `fxmaster: stop-preset "${r.preset}" OK (stopped=${r.stopped}).\nNow active: ${active}`;
}

function formatTogglePreset(r: TogglePresetResult): string {
  const active = r.activePresets.length > 0 ? r.activePresets.join(', ') : '(none)';
  return `fxmaster: toggle-preset "${r.preset}" OK (toggled=${r.toggled}).\nNow active: ${active}`;
}

function formatSwitchPreset(r: SwitchPresetResult): string {
  const to = r.preset ?? 'null (all stopped)';
  const active = r.activePresets.length > 0 ? r.activePresets.join(', ') : '(none)';
  return `fxmaster: switch-preset → "${to}" OK (switched=${r.switched}).\nNow active: ${active}`;
}

function formatListPresets(r: ListPresetsResult): string {
  return [
    `fxmaster: list-presets — ${r.count} presets registered.`,
    `hasFxmasterPlus: ${r.hasFxmasterPlus} | hasFxmaster: ${r.hasFxmaster}`,
    `Presets: ${r.presets.join(', ')}`,
    `Note: ${r.note}`,
  ].join('\n');
}

function formatListActivePresets(r: ListActivePresetsResult): string {
  const active = r.presets.length > 0 ? r.presets.join(', ') : '(none)';
  return `fxmaster: list-active-presets — ${r.count} active on ${r.scene ?? 'current scene'}.\nActive: ${active}`;
}

function formatListValidPresets(r: ListValidPresetsResult): string {
  const presets = r.presets.length > 0 ? r.presets.join(', ') : '(none)';
  return [
    `fxmaster: list-valid-presets — ${r.count} valid (topDown=${r.topDown}).`,
    `Valid: ${presets}`,
    `Note: ${r.note}`,
  ].join('\n');
}

function formatPlayParticles(r: PlayParticlesResult): string {
  const idSummary = JSON.stringify(r.ids);
  return [
    `fxmaster: play-particles OK — ${r.particleCount} effect(s): ${r.types.join(', ')}.`,
    `IDs: ${idSummary}`,
    `Verified effects flag: ${r.verifiedEffectsFlag !== null && r.verifiedEffectsFlag !== undefined ? 'set' : 'null'}`,
  ].join('\n');
}

function formatPlayFilters(r: PlayFiltersResult): string {
  const idSummary = JSON.stringify(r.ids);
  return [
    `fxmaster: play-filters OK — ${r.filterCount} filter(s): ${r.types.join(', ')}.`,
    `IDs: ${idSummary}`,
    `Verified filters flag: ${r.verifiedFiltersFlag !== null && r.verifiedFiltersFlag !== undefined ? 'set' : 'null'}`,
  ].join('\n');
}

function formatStopEffects(r: StopEffectsResult): string {
  return [
    `fxmaster: stop-effects OK (stopped=${r.stopped}).`,
    `Particles stopped: ${r.particles.length > 0 ? r.particles.join(', ') : '(none)'}`,
    `Filters stopped: ${r.filters.length > 0 ? r.filters.join(', ') : '(none)'}`,
    `Effects stopped: ${r.effects.length > 0 ? r.effects.join(', ') : '(none)'}`,
  ].join('\n');
}

function formatToggleEffects(r: ToggleEffectsResult): string {
  return [
    `fxmaster: toggle-effects OK (toggled=${r.toggled}).`,
    `Toggle key: ${r.toggleKey ?? '(none)'}`,
    `Particles: ${r.particles.join(', ') || '(none)'}`,
    `Filters: ${r.filters.join(', ') || '(none)'}`,
    `Effects: ${r.effects.join(', ') || '(none)'}`,
  ].join('\n');
}

function formatClearEffects(r: ClearEffectsResult): string {
  const v = r.verify;
  return [
    `fxmaster: clear-effects OK — cleared: ${r.cleared.join(', ')} (target=${r.target}).`,
    `Verify — effectsFlag: ${v.effectsFlag != null ? 'still set (unexpected)' : 'null OK'}`,
    `Verify — filtersFlag: ${v.filtersFlag != null ? 'still set (unexpected)' : 'null OK'}`,
    `Verify — stackFlag: ${v.stackFlag != null ? 'still set (unexpected)' : 'null OK'}`,
  ].join('\n');
}

function formatSetEnabled(r: SetEnabledResult): string {
  return [
    `fxmaster: set-enabled OK — disableAll=${r.disableAll} (verified=${r.verifiedDisableAll}).`,
    r.note,
  ].join('\n');
}

function formatSetRegionParticles(r: SetRegionParticlesResult): string {
  return [
    `fxmaster: set-region-particles OK.`,
    `Region: ${r.regionId} | Behavior: ${r.behaviorId ?? '(unknown)'} | Type: ${r.behaviorType}`,
    `Particle type: ${r.particleType} | Replaced existing: ${r.replaced}`,
  ].join('\n');
}

function formatSetRegionFilters(r: SetRegionFiltersResult): string {
  return [
    `fxmaster: set-region-filters OK.`,
    `Region: ${r.regionId} | Behavior: ${r.behaviorId ?? '(unknown)'} | Type: ${r.behaviorType}`,
    `Filter type: ${r.filterType} | Replaced existing: ${r.replaced}`,
  ].join('\n');
}

function formatSuppressSceneParticles(r: SuppressSceneParticlesResult): string {
  if (r.removed) {
    return `fxmaster: suppress-scene-particles removed from region ${r.regionId} (type=${r.behaviorType}).`;
  }
  return `fxmaster: suppress-scene-particles added to region ${r.regionId}.\nBehavior: ${r.behaviorId ?? '(unknown)'} | Type: ${r.behaviorType}`;
}

function formatSuppressSceneFilters(r: SuppressSceneFiltersResult): string {
  if (r.removed) {
    return `fxmaster: suppress-scene-filters removed from region ${r.regionId} (type=${r.behaviorType}).`;
  }
  return `fxmaster: suppress-scene-filters added to region ${r.regionId}.\nBehavior: ${r.behaviorId ?? '(unknown)'} | Type: ${r.behaviorType}`;
}

// ── Phase 3: tokenmagic + wounds formatters (F03 — emit EVERY returned field) ─

function formatTokenmagicApply(r: TokenmagicApplyResult): string {
  const ids = r.filterIds.map((id, i) => `${r.filterTypes[i]}${id ? `(${id})` : ''}`).join(', ');
  return [
    `tokenmagic: apply OK — ${r.appliedCount} filter(s) on ${r.placeableType}:${r.placeableId}${r.replace ? ' (replace=true)' : ''}.`,
    `Filters: ${ids}`,
    `Verified total filter count: ${r.verifiedFilterCount ?? 'unknown'}`,
  ].join('\n');
}

function formatTokenmagicUpsert(r: TokenmagicUpsertResult): string {
  const ids = r.filterIds.map((id, i) => `${r.filterTypes[i]}${id ? `(${id})` : ''}`).join(', ');
  return [
    `tokenmagic: upsert OK — ${r.upsertedCount} filter(s) on ${r.placeableType}:${r.placeableId}.`,
    `Filters: ${ids}`,
    `Verified total filter count: ${r.verifiedFilterCount ?? 'unknown'}`,
  ].join('\n');
}

function formatTokenmagicRemove(r: TokenmagicRemoveResult): string {
  return [
    `tokenmagic: remove OK on ${r.placeableType}:${r.placeableId}.`,
    `Target: ${r.targetDesc}`,
    `filterId: ${r.filterId ?? '(none)'} | filterType: ${r.filterType ?? '(none)'} | filterInternalId: ${r.filterInternalId ?? '(none)'}`,
    `Verified remaining filter count: ${r.verifiedRemainingFilterCount}`,
  ].join('\n');
}

function formatTokenmagicQuery(r: TokenmagicQueryResult): string {
  // Emit all returned fields generically (F03 — no silent drops for read-only action).
  const sub = r.subAction as string;
  const fields = Object.entries(r)
    .filter(([k]) => k !== 'subAction')
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n  ');
  return `tokenmagic: query/${sub} result:\n  ${fields}`;
}

function formatTokenmagicPreset(r: TokenmagicPresetResult): string {
  const sub = r.subAction as string;
  const fields = Object.entries(r)
    .filter(([k]) => k !== 'subAction')
    .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
    .join('\n  ');
  return `tokenmagic: preset/${sub} result:\n  ${fields}`;
}

function formatTokenmagicWoundCreate(r: TokenmagicWoundCreateResult): string {
  return [
    `tokenmagic-wounds: wound-create OK — token "${r.tokenName}" (${r.tokenId}).`,
    `Damage fraction: ${r.damageFraction.toFixed(2)}`,
    `Verified wound filter count: ${r.verifiedWoundFilterCount}`,
  ].join('\n');
}

function formatTokenmagicWoundHeal(r: TokenmagicWoundHealResult): string {
  return [
    `tokenmagic-wounds: wound-heal OK — token "${r.tokenName}" (${r.tokenId}).`,
    `Healing fraction: ${r.healingFraction.toFixed(2)}`,
    `Verified remaining wound filter count: ${r.verifiedRemainingWoundFilterCount}`,
  ].join('\n');
}

function formatTokenmagicWoundRemove(r: TokenmagicWoundRemoveResult): string {
  return [
    `tokenmagic-wounds: wound-remove OK — token "${r.tokenName}" (${r.tokenId}).`,
    `Removed: ${r.removed}`,
    `Verified remaining wound filter count: ${r.verifiedRemainingWoundFilterCount}`,
  ].join('\n');
}

function formatTokenmagicWoundReapply(r: TokenmagicWoundReapplyResult): string {
  return [
    `tokenmagic-wounds: wound-reapply OK — token "${r.tokenName}" (${r.tokenId}).`,
    `Reapplied: ${r.reapplied}`,
    `Verified wound filter count: ${r.verifiedWoundFilterCount}`,
  ].join('\n');
}

function formatWoundToggleDisable(r: WoundToggleDisableResult): string {
  const stateLabel = r.disabled ? 'DISABLED (wounds suppressed)' : 'ENABLED (wounds active)';
  return [
    `tokenmagic-wounds: wound-toggle-disable OK — actor "${r.actorName}" (${r.actorId}).`,
    `Wounds now: ${stateLabel} | toggled: ${r.toggled}`,
    r.note ? `Note: ${r.note}` : '',
    `FLAG INVERSION: ${r.flagInversionNote}`,
  ].filter(Boolean).join('\n');
}

function formatWoundSetBloodColor(r: WoundSetBloodColorResult): string {
  const verifyLabel = r.colorMatchesInput ? 'OK' : `MISMATCH (got ${r.verifiedColor ?? 'null'})`;
  return [
    `tokenmagic-wounds: wound-set-blood-color OK — token "${r.tokenName}" (${r.tokenId}).`,
    `Color: ${r.color} | Verified: ${verifyLabel}`,
  ].join('\n');
}

// ── Phase 4B: scenery formatters (F03 — emit EVERY returned field) ────────────

function formatListVariations(r: ListVariationsResult): string {
  const rows = r.variations.map((v) => {
    const active = v.index === r.activeVariationIndex ? ' [ACTIVE]' : '';
    const sceneData = v.hasSceneData ? ' +sceneData' : '';
    return `  [${v.index}]${active} "${v.name}"${sceneData}`;
  });
  const migratedNote = r.isLegacyMigrated ? ' (legacy v1 migrated in-memory)' : '';
  return [
    `scenery: list-variations — ${r.count} variation(s) on "${r.sceneName}" (${r.sceneId})${migratedNote}.`,
    `Active index: ${r.activeVariationIndex}`,
    rows.join('\n'),
  ].join('\n');
}

function formatGetActiveVariation(r: GetActiveVariationResult): string {
  if (!r.hasScenery || !r.activeVariation) {
    return `scenery: get-active-variation — "${r.sceneName}" (${r.sceneId}): no scenery data configured.`;
  }
  const v = r.activeVariation;
  return [
    `scenery: get-active-variation — "${r.sceneName}" (${r.sceneId}) active index=${r.activeVariationIndex}.`,
    `Name: "${v.name}"`,
    `GM background: ${v.gmBackground ?? '(none)'}`,
    `Player background: ${v.plBackground ?? '(none)'}`,
    `Has sceneData: ${v.hasSceneData}`,
  ].join('\n');
}

function formatSetActiveVariation(r: SetActiveVariationResult): string {
  return [
    `scenery: set-active-variation OK — "${r.sceneName}" (${r.sceneId}).`,
    `Previous: ${r.previousIndex} → Active: ${r.newActiveIndex} ("${r.newVariationName}")`,
    `Verified activeVariationIndex: ${r.verifiedActiveIndex ?? 'unknown'}`,
    `Note: ${r.elementRestoreSkipNote}`,
  ].join('\n');
}

function formatAddVariation(r: AddVariationResult): string {
  return [
    `scenery: add-variation OK — "${r.sceneName}" (${r.sceneId}).`,
    `New index: ${r.addedVariationIndex} | Name: "${r.addedVariationName}"`,
    `GM background: ${r.gmBackground ?? '(none)'} | Player background: ${r.plBackground ?? '(none)'}`,
    `Total count: ${r.totalVariationsCount} | Verified count: ${r.verifiedTotalCount ?? 'unknown'}`,
  ].join('\n');
}

function formatDeleteVariation(r: DeleteVariationResult): string {
  return [
    `scenery: delete-variation OK — "${r.sceneName}" (${r.sceneId}).`,
    `Deleted index ${r.deletedIndex} ("${r.deletedVariationName}")`,
    `Active variation now: ${r.newActiveVariationIndex} | Remaining: ${r.remainingVariationsCount} (verified: ${r.verifiedTotalCount ?? 'unknown'})`,
  ].join('\n');
}

function formatSetVariationBackgrounds(r: SetVariationBackgroundsResult): string {
  const plNote = r.plBackgroundNote ? `\nNote: ${r.plBackgroundNote}` : '';
  return [
    `scenery: set-variation-backgrounds OK — "${r.sceneName}" (${r.sceneId}) index=${r.variationIndex} ("${r.variationName}").`,
    `GM bg: ${r.gmBackground ?? '(none)'} | Player bg: ${r.plBackground ?? '(none)'}${plNote}`,
    `Verified — GM bg: ${r.verifiedGmBackground ?? '(none)'} | Player bg: ${r.verifiedPlBackground ?? '(none)'}`,
  ].join('\n');
}

function formatResetVariationSceneData(r: ResetVariationSceneDataResult): string {
  return [
    `scenery: reset-variation-scene-data OK — "${r.sceneName}" (${r.sceneId}) index=${r.variationIndex} ("${r.variationName}").`,
    `Had sceneData: ${r.hadSceneData} | Verified hasSceneData: ${r.verifiedHasSceneData}`,
  ].join('\n');
}

function formatCheckSceneryModuleActive(r: CheckSceneryModuleActiveResult): string {
  const meta = r.title ? ` (${r.title}${r.version ? ` v${r.version}` : ''})` : '';
  return `scenery: check-module-active — "${r.moduleId}"${meta}: ${r.active ? 'ACTIVE' : 'INACTIVE'}`;
}

function formatReadScenerySettings(r: ReadScenerySettingsResult): string {
  const count = Object.keys(r.settings).length;
  const rows = Object.entries(r.settings).map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`).join('\n');
  return [`scenery: read-settings — ${count} setting(s).`, rows, `Note: ${r.note}`].join('\n');
}

// ── Phase 4B: scene-transitions formatters (F03 — emit EVERY returned field) ──

function formatPlayTransition(r: PlayTransitionResult): string {
  const actionLabel = r.options?.action ? ` action=${r.options.action}` : '';
  const nameLabel = r.options?.name ? ` "${r.options.name}"` : '';
  const rawContent = typeof r.options?.content === 'string' ? r.options.content : null;
  const contentSnippet = rawContent
    ? rawContent.slice(0, 60).replace(/<[^>]+>/g, '').trim()
    : null;
  const snippet = contentSnippet ? `\nContent: ${contentSnippet}` : '';
  return [
    `scene-transitions: play-transition OK${actionLabel}${nameLabel} (played=${r.played}, showMe=${r.showMe}).${snippet}`,
    `Note: ${r.note}`,
  ].join('\n');
}

function formatEndTransition(r: EndTransitionResult): string {
  return [`scene-transitions: end-transition OK (ended=${r.ended}).`, `Note: ${r.note}`].join('\n');
}

function formatSetSceneTransition(r: SetSceneTransitionResult): string {
  const sceneLabel = r.sceneId ? ` on "${r.sceneName}" (${r.sceneId})` : '';
  const lines: string[] = [
    `scene-transitions: set-scene-transition OK (subAction=${r.subAction})${sceneLabel}.`,
  ];
  if (r.savedOptions !== undefined) {
    lines.push(`Saved options: ${JSON.stringify(r.savedOptions)}`);
  }
  if (r.verifiedHasOptions !== undefined) {
    lines.push(`Verified has options: ${r.verifiedHasOptions}`);
  } else if (r.verified !== undefined) {
    lines.push(`Verified: ${r.verified}`);
  }
  if (r.showJournal !== undefined) {
    lines.push(`showJournal: ${r.showJournal}`);
  }
  if (r.note) {
    lines.push(`Note: ${r.note}`);
  }
  return lines.join('\n');
}

function formatGetSceneTransition(r: GetSceneTransitionResult): string {
  const sceneLabel = r.sceneId ? ` from "${r.sceneName}" (${r.sceneId})` : '';
  if (r.subAction === 'per-scene') {
    if (!r.hasTransition) {
      return `scene-transitions: get-scene-transition (subAction=${r.subAction})${sceneLabel}: not set.`;
    }
    return [
      `scene-transitions: get-scene-transition (subAction=${r.subAction})${sceneLabel}: found.`,
      `Transition: ${JSON.stringify(r.transition)}`,
    ].join('\n');
  }
  // world-default branch
  if (!r.hasDefault) {
    return `scene-transitions: get-scene-transition (subAction=${r.subAction}): no world default set.`;
  }
  return [
    `scene-transitions: get-scene-transition (subAction=${r.subAction}): world default found.`,
    `Default options: ${JSON.stringify(r.defaultOptions)}`,
  ].join('\n');
}

function formatDeleteSceneTransition(r: DeleteSceneTransitionResult): string {
  return [
    `scene-transitions: delete-scene-transition OK — "${r.sceneName}" (${r.sceneId}).`,
    `Had transition: ${r.hadTransition} | Deleted: ${r.deleted} | Verified deleted: ${r.verifiedDeleted}`,
    `Note: ${r.note}`,
  ].join('\n');
}

// ── Phase 4B: multiface-tiles formatters (F03 — emit EVERY returned field) ───

function formatSwitchTileFace(r: SwitchTileFaceResult): string {
  if (!r.changed) {
    return [
      `multiface-tiles: switch-tile-face — tile ${r.tileId} (${r.tileName}).`,
      `(was already the active face — no-op)`,
      r.note ? `Note: ${r.note}` : '',
    ].filter(Boolean).join('\n');
  }
  return [
    `multiface-tiles: switch-tile-face OK — tile ${r.tileId} (${r.tileName}).`,
    `Previous: ${r.previousFacePath ?? '(none)'} → New: ${r.facePath}`,
    `Verified face: ${r.verifiedTextureSrc ?? '(none)'} | Match: ${r.verifiedMatch}`,
    r.mattOverlapNote ? `Note: ${r.mattOverlapNote}` : '',
  ].filter(Boolean).join('\n');
}

function formatListTileFaces(r: ListTileFacesResult): string {
  const rows = r.faces.map((f) => `  ${f.label}: ${f.path}${f.isActive ? ' [ACTIVE]' : ''}`);
  return [
    `multiface-tiles: list-tile-faces — tile ${r.tileId} — ${r.totalFaces} face(s).`,
    `Active face (${r.activeFaceLabel}): ${r.activeFace ?? '(none)'}`,
    `Original image: ${r.originalImage ?? '(not tracked)'}`,
    rows.join('\n'),
  ].join('\n');
}

function formatGetTileOriginalFace(r: GetTileOriginalFaceResult): string {
  return [
    `multiface-tiles: get-tile-original-face — tile ${r.tileId} (${r.tileName}).`,
    `Original image: ${r.originalImage ?? '(not tracked)'} | Has original: ${r.hasOriginalImage}`,
    r.note ? `Note: ${r.note}` : '',
  ].filter(Boolean).join('\n');
}

function formatGetTileActiveFace(r: GetTileActiveFaceResult): string {
  const labelSuffix = r.activeFaceLabel ? ` (${r.activeFaceLabel})` : '';
  return [
    `multiface-tiles: get-tile-active-face — tile ${r.tileId} (${r.tileName}).`,
    `Active face${labelSuffix}: ${r.activeSrc ?? '(none)'}`,
    r.originalImage !== undefined ? `Original image: ${r.originalImage ?? '(not tracked)'}` : '',
  ].filter(Boolean).join('\n');
}

function formatResetToOriginalFace(r: ResetToOriginalFaceResult): string {
  if (!r.changed) {
    return [
      `multiface-tiles: reset-to-original-face — tile ${r.tileId} (${r.tileName}).`,
      `(was already on original face — no-op)`,
      r.note ? `Note: ${r.note}` : '',
    ].filter(Boolean).join('\n');
  }
  return [
    `multiface-tiles: reset-to-original-face OK — tile ${r.tileId} (${r.tileName}).`,
    `Previous: ${r.previousFacePath ?? '(none)'} → Original: ${r.originalImage}`,
    `Verified face: ${r.verifiedTextureSrc ?? '(none)'} | Match: ${r.verifiedMatch}`,
  ].filter(Boolean).join('\n');
}

function formatAddTileFace(r: AddTileFaceResult): string {
  return [
    `multiface-tiles: add-tile-face OK — tile ${r.tileId} (${r.tileName}).`,
    `Added: "${r.addedFacePath}"`,
    `Total alt count: ${r.altImagesCount} (verified: ${r.verifiedAltImagesCount})`,
    r.originalImageSetOnFirstAdd ? `Original image set to: "${r.originalImage}"` : `Original image was already: "${r.originalImage ?? '(none)'}"`,
  ].join('\n');
}

function formatRemoveTileFace(r: RemoveTileFaceResult): string {
  return [
    `multiface-tiles: remove-tile-face OK — tile ${r.tileId} (${r.tileName}).`,
    `Removed: "${r.removedFacePath}"`,
    r.wasActiveFace ? 'Warning: removed face was the active face; tile will show previous texture until face is switched.' : '',
    `Total alt count: ${r.altImagesCount} (verified: ${r.verifiedAltImagesCount})`,
    r.activeStateNote ? `Note: ${r.activeStateNote}` : '',
  ].filter(Boolean).join('\n');
}

function formatCycleTileFace(r: CycleTileFaceResult): string {
  return [
    `multiface-tiles: cycle-tile-face OK — tile ${r.tileId} (${r.tileName}).`,
    `Previous: ${r.previousFacePath ?? '(none)'} (index ${r.previousFaceIndex}) → New (index ${r.nextFaceIndex}/${r.facesCount - 1}): ${r.nextFacePath}`,
    `Verified face: ${r.verifiedTextureSrc ?? '(none)'} | Match: ${r.verifiedMatch}`,
    `Note: ${r.authoredNote}`,
    `Note: ${r.mattOverlapNote}`,
  ].join('\n');
}

function formatClearTileFaces(r: ClearTileFacesResult): string {
  return [
    `multiface-tiles: clear-tile-faces OK — tile ${r.tileId} (${r.tileName}).`,
    `Had faces: ${r.hadFaces} | Cleared ${r.clearedAltImagesCount} alt face(s) | Original image was: ${r.clearedOriginalImage ?? '(none)'}`,
    `Verified altImages count: ${r.verifiedAltImages.length} | Verified originalImage: ${r.verifiedOriginalImage ?? '(null)'}`,
    `Active src: ${r.activeSrc ?? '(none)'}`,
    `Note: ${r.note}`,
  ].join('\n');
}

// ── Phase 5: dynamic-soundscapes formatters (F03 — emit EVERY returned field) ─

function formatSetSoundscape(r: SetSoundscapeResult): string {
  const match = r.settingMatch ? 'OK' : `MISMATCH (verified=${r.verifiedPlaylistId})`;
  return [
    `dynamic-soundscapes: set-soundscape OK — playlist "${r.playlistName}" (${r.playlistId}).`,
    `Setting verified: ${match}`,
    `Note: ${r.updateStateDelayNote}`,
  ].join('\n');
}

function formatStopSoundscape(r: StopSoundscapeResult): string {
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

function formatSetMood(r: SetMoodResult): string {
  const match = r.moodMatch ? 'OK' : `MISMATCH (verified=${r.verifiedMood})`;
  return [
    `dynamic-soundscapes: set-mood OK — "${r.playlistName}" (${r.playlistId}) mood=${r.mood}.`,
    `Verified: ${match}`,
    `Note: ${r.moodNote}`,
  ].join('\n');
}

function formatGetMood(r: GetMoodResult): string {
  const explicitLabel = r.isFlagExplicit ? '(explicit flag)' : '(absent flag — module default)';
  return [
    `dynamic-soundscapes: get-mood — "${r.playlistName}" (${r.playlistId}): mood=${r.mood} ${explicitLabel}.`,
    `Note: ${r.moodNote}`,
  ].join('\n');
}

function formatSetLayerEnabled(r: SetLayerEnabledResult): string {
  const match = r.flagMatch ? 'OK' : `MISMATCH (verified=${r.verifiedEnabled})`;
  return [
    `dynamic-soundscapes: set-layer-enabled OK — sound "${r.soundName}" (${r.soundId}) in "${r.playlistName}".`,
    `enabled=${r.enabled} | Verified: ${match}`,
  ].join('\n');
}

function formatSetLayerVolume(r: SetLayerVolumeResult): string {
  const match = r.volumeMatch ? 'OK' : `MISMATCH (verified=${r.verifiedVolume})`;
  return [
    `dynamic-soundscapes: set-layer-volume OK — sound "${r.soundName}" (${r.soundId}) in "${r.playlistName}".`,
    `volume=${r.volume} | Verified: ${match}`,
  ].join('\n');
}

function formatListSoundscapes(r: ListSoundscapesResult): string {
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

function formatListBlocks(r: ListBlocksResult): string {
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

function formatGetSelected(r: GetSelectedResult): string {
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

function formatSetSelected(r: SetSelectedResult): string {
  const match = r.settingMatch ? 'OK' : `MISMATCH (verified=${r.verifiedPlaylistId ?? 'null'})`;
  const name = r.playlistName ? `"${r.playlistName}"` : '(cleared)';
  return [
    `dynamic-soundscapes: set-selected OK — selectedPlaylist=${name} (${r.playlistId ?? 'none'}).`,
    `Verified: ${match}`,
    `Note: ${r.note}`,
  ].join('\n');
}

function formatCreateSoundscape(r: CreateSoundscapeResult): string {
  return [
    `dynamic-soundscapes: create-soundscape OK — "${r.playlistName}" (${r.playlistId}).`,
    `Folder: "${r.folderName}" (${r.folderId}) | mode=${r.mode}`,
    `Note: ${r.modeNote}`,
  ].join('\n');
}

function formatDeleteSoundscape(r: DeleteSoundscapeResult): string {
  return [
    `dynamic-soundscapes: delete-soundscape OK — "${r.playlistName}" (${r.playlistId}).`,
    `Deleted: ${r.deleted} | Verified gone: ${r.verifiedGone} | Sounds deleted: ${r.soundsDeleted}`,
    r.stoppedPlayback ? 'Was playing — stopped before delete.' : '',
  ].filter(Boolean).join('\n');
}

function formatAddSound(r: AddSoundResult): string {
  return [
    `dynamic-soundscapes: add-sound OK — "${r.soundName}" (${r.soundId}) in "${r.playlistName}".`,
    `path=${r.path} | volume=${r.volume} | repeat=${r.repeat}`,
    `Verified exists: ${r.verifiedSoundExists} | Total sounds: ${r.totalSoundCount}`,
    `Note: ${r.blockNote}`,
  ].join('\n');
}

function formatRemoveSound(r: RemoveSoundResult): string {
  const blockInfo = r.blocksModified
    ? `Removed path=${r.soundId} from blocks: ${r.affectedBlocks.join(', ')}`
    : 'Sound was not in any block.';
  return [
    `dynamic-soundscapes: remove-sound OK — "${r.soundName}" (${r.soundId}) playlist=${r.playlistId}.`,
    `Deleted: ${r.deleted} | Verified gone: ${r.verifiedGone} | Remaining sounds: ${r.remainingSoundCount}`,
    blockInfo,
  ].join('\n');
}

function formatUpdateBlocks(r: UpdateBlocksResult): string {
  const match = r.countMatch ? 'OK' : `MISMATCH (verified=${r.verifiedBlockCount})`;
  return [
    `dynamic-soundscapes: update-blocks OK — "${r.playlistName}" (${r.playlistId}).`,
    `Previous=${r.previousBlockCount} → New=${r.newBlockCount} | Verified: ${match}`,
    `Note: ${r.updateStateDelayNote}`,
  ].join('\n');
}

export interface ModuleSceneAtmosphereToolOptions extends BaseToolOptions {}

export class ModuleSceneAtmosphereTool extends BaseTool {
  constructor(options: ModuleSceneAtmosphereToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        // String literal (not the TOOL_NAME const) so _tools/audit-skills.mjs --check
        // resolve — which regex-scans source for `name: '<literal>'` — resolves this tool.
        // Matches the module-sequencer / module-tagger convention. Runtime value is identical.
        name: 'module-scene-atmosphere',
        title: 'Scene atmosphere — visual FX, audio, transitions, and tile faces',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Scene atmosphere umbrella for WFRP4e. Controls visual FX (fxmaster, tokenmagic),
presentation (scenery variants, scene-transitions, multiface-tiles), and audio (dynamic-soundscapes).
Conditional: returns MODULE_NOT_ACTIVE per member when the relevant module is absent/inactive.
Returns COMPANION_NOT_ACTIVE for wound-* actions when tokenmagic-automatic-wounds is absent.
Returns SOCKETLIB_NOT_ACTIVE for play-transition/end-transition when socketlib is absent.
Pre-flight: use get-bundle-status to check which members are active.

Phase 2 (fxmaster) + Phase 3 (tokenmagic + wounds) + Phase 4B (scenery + scene-transitions + multiface-tiles) + Phase 5 (dynamic-soundscapes) live — 67 actions available.

SCENERY — scene background variations (requires scenery module active):
- list-variations             { sceneId? }                               — list all named variations + active index
- get-active-variation        { sceneId? }                               — get current variation details
- set-active-variation        { sceneId?, variationIndex?, variationName?, confirm:true } — switch active variation
- add-variation               { sceneId?, name, gmBackground, plBackground?, sceneData?, confirm:true } — add new variation
- delete-variation            { sceneId?, variationIndex?, variationName?, confirm:true } — delete variation (index 0 / Default is protected)
- set-variation-backgrounds   { sceneId?, variationIndex?, variationName?, gmBackground?, plBackground?, confirm:true } — update backgrounds (plBackground locked for index 0)
- reset-variation-scene-data  { sceneId?, variationIndex?, variationName?, confirm:true } — clear saved sceneData for variation
- check-scenery-module-active {}                                         — check if scenery module is active
- read-scenery-settings       {}                                         — read all scenery world settings

SCENE-TRANSITIONS — animated scene transitions (requires scene-transitions + socketlib active):
- play-transition       { transitionOptions: { sceneID?, content?, ... }, showMe? } — play a transition immediately
- end-transition        {}                                                            — end the current transition
- set-scene-transition  { subAction: "per-scene"|"world-default"|"show-journal", sceneId?, transitionOptions? } — store transition config
- get-scene-transition  { subAction: "per-scene"|"world-default", sceneId? }         — read stored transition config
- delete-scene-transition { sceneId, confirm:true }                                  — remove per-scene transition flag

Actual transitionOptions fields: sceneID · content · fontColor · fontSize · bgImg · bgPos · bgLoop · bgMuted · bgSize · bgColor · bgOpacity · fadeIn · delay · fadeOut · audio · volume · audioLoop · allowPlayersToEnd · gmEndAll · gmHide · showUI · activateScene · users (NEVER set fromSocket — the module sets it automatically)

MULTIFACE-TILES — tile image face cycling (requires multiface-tiles active):
- switch-tile-face       { tileId, facePath }  — switch active texture to a specific face path
- list-tile-faces        { tileId }            — list all faces: originalImage + altImages
- get-tile-original-face { tileId }            — get the originalImage tracking value
- get-tile-active-face   { tileId }            — get current texture.src + label
- reset-to-original-face { tileId }            — restore texture.src to originalImage
- add-tile-face          { tileId, facePath }  — append a path to altImages; sets originalImage on first add
- remove-tile-face       { tileId, facePath }  — remove a path from altImages (warns if face was active)
- cycle-tile-face        { tileId }            — advance to next face in sequence [originalImage, ...altImages] (MCP-authored — module stub only)
- clear-tile-faces       { tileId }            — reset altImages+originalImage to empty (wipe all tracking)
WARNING: both multiface-tiles and MATT write texture.src — use separate tiles to avoid conflicts.

TOKENMAGIC — per-token/tile/template/drawing/region filter FX (requires tokenmagic module active):
- tokenmagic-apply   { placeableId, placeableType, params[], replace? }  — addFilters; apply FX to any placeable
- tokenmagic-upsert  { placeableId, placeableType, params[] }            — addUpdateFilters; upsert (add or update by filterId)
- tokenmagic-remove  { placeableId, placeableType, filterId?, filterType? } — deleteFilters; selective or nuclear remove
- tokenmagic-query   { subAction, placeableId?, placeableType?, filterType?, filterId? } — reads: has-filter-type/id, get-filters, get-anime-info, get-filter-types, get-min-padding, get-settings
- tokenmagic-preset  { subAction, presetName?, params?, library?, path?, importOptions?, confirm? } — preset CRUD: get/list/add/delete/import-from-path/import-from-url/import-template-settings/reset-library

All 43 filterType keys: adjustment · ascii · bevel · blur · bulgepinch · crt · ddTint · distortion
  dot · electric · field · fire · flood · fog · fumes · globes · glow · images · liquid · oldfilm
  outline · pixel · polymorph · ray · replaceColor · rgbSplit · ripples · shadow · shockwave · smoke
  splash · sprite · spriteMask · twist · wave · web · xfire · xfog · xglow · xray · zapshadow · zoomblur · transform
Placeable types: Token · Tile · MeasuredTemplate · Drawing · Region

TOKENMAGIC AUTOMATIC WOUNDS — wound FX (requires tokenmagic-automatic-wounds companion active):
- tokenmagic-wound-create  { tokenId, damageFraction }   — createWoundOnToken; splash effect at damage level
- tokenmagic-wound-heal    { tokenId, healingFraction }  — healWoundsOnToken; shrink/remove wound filters
- tokenmagic-wound-remove  { tokenId }                   — removeWoundsOnToken; clear all wound FX
- tokenmagic-wound-reapply { tokenId }                   — reapplyWoundsBasedOnCurrentHp; recalculate from HP
- wound-toggle-disable  { actorId, disabled? }           — toggleDisableWounds; disable/enable per-actor (FLAG INVERSION: internal flag 'enabled-for-token'=true means DISABLED)
- wound-set-blood-color { tokenId, color }               — setBloodColor; hex color for wound splatter (e.g. '0x22aa22' for orc green)

WFRP4e idioms: splash='blood wound', glow='buff aura', fire='burning condition', blur='invisible', fog='fear aura', xglow='warpstone', electric='tempest spell'

FXMASTER — particle weather + scene filters (requires fxmaster module active):
- play-preset      { preset, options? }   — play a named preset (24 free: rain, snow, fog, thunderstorm, etc.)
- stop-preset      { preset, scene? }     — stop a named preset
- toggle-preset    { preset, options? }   — toggle preset on/off idempotently
- switch-preset    { preset|null, options? } — stop current + start new; null stops all active presets
- list-presets     {}                     — list all registered preset names
- list-active-presets { scene? }          — list currently active presets on the scene
- list-valid-presets  { topDown? }        — list presets playable with current modules
- play-particles   { particles[], scene?, skipFading?, apiToggleKey? } — play raw particle effects by type + options; returns IDs
- play-filters     { filters[], scene?, skipFading?, apiToggleKey? }   — play raw filter effects; returns IDs
- stop-effects     { particles?, filters?, effects?, scene?, skipFading? } — stop by returned IDs
- toggle-effects   { particles?, filters?, effects?, toggleKey?, scene? } — toggle named effect group
- clear-effects    { target?, scene?, confirm:true } — nuclear unsetFlag (CONFIRM required — irreversible)
- set-enabled      { disableAll, confirm? } — kill-switch: suspend/resume all FX rendering (confirm required for disableAll:true)
- set-region-particles   { regionId, particleType, options?, replace? } — add fxmaster particleEffectsRegion behavior to region
- set-region-filters     { regionId, filterType, options?, replace? }   — add fxmaster filterEffectsRegion behavior to region
- suppress-scene-particles { regionId, remove? } — add/remove suppressSceneParticles behavior on region
- suppress-scene-filters   { regionId, remove? } — add/remove suppressSceneFilters behavior on region

Free particle types: autumnleaves · bats · birds · bubbles · clouds · crows · eagles
                     embers · fog · hail · rain · rats · snow · snowstorm · spiders · stars
Free filter types:  bloom · color · fog · lightning · oldfilm · predator · underwater
fxmaster-plus types (require the fxmaster-plus add-on module active):
  particles: fireflies · ghosts · magiccrystals · sakurabloom · sakurablossoms
  filters:   sunlight
wfrp-fxmaster-custom types (require the wfrp-fxmaster-custom module active):
  particles: warpstonemotes · chaosembers · blightspores · soulwisps · fallingash
             warpfiresparks · censersmoke · daemoneyes · witchlight
  weather:   windgusts · dustgale · warpstorm · ashstorm
  filters:   corruption (pulsing warp taint) · grimdark (desaturated vignette) · warpshimmer (heat-haze distortion)
             waterflow (directional flowing-water refraction) · waterwaves (directional traveling waves)
             watervortex (whirlpool around centerX/centerY) · lightningbolt (random bolt strikes, topDown option + screen flash)
             (all custom filters accept region masking via filterEffectsRegion / set-region-filters)
Free presets (24): acid-rain · autumn-leaves · blizzard · blood-rain · cloudy · drizzle
  fog · hail · heat-wave · hurricane · ice-storm · mist · monsoon · nullfront · overcast
  partly-cloudy · rain · rolling-fog · sleet · snow · spore-cloud · sunshower · thunderstorm · wildfire-smoke
  (Gambit's FXMaster fork 8.1.x also registers 18 themed plus-only presets — aether-haze,
   meteor-shower, etc. — playable only with fxmaster-plus; use list-valid-presets to filter.)

DYNAMIC-SOUNDSCAPES — soundscape playlists with mood routing (requires dynamic-soundscapes module active):
updateState-delay: set-soundscape/stop-soundscape write the world setting immediately (server-persisted).
Audio output starts on the active GM client when RandomSoundController fires via onChange (~<1s delay).
- set-soundscape       { playlistId }                                — activate a soundscape (write playingPlaylist setting)
- stop-soundscape      {}                                            — stop all soundscape playback (clear playingPlaylist)
- set-mood             { mood: "moodA"|"moodB"|"moodC", playlistId? } — set mood flag on playing or named soundscape
- get-mood             { playlistId? }                               — read current mood (absent flag == "moodA")
- set-layer-enabled    { playlistId, soundId, enabled }              — enable/disable a sound layer (write enabled flag)
- set-layer-volume     { playlistId, soundId, volume }               — set layer volume 0.0–1.0
- list-soundscapes     {}                                            — list all soundscapes in "Soundscapes" folder
- list-blocks          { playlistId }                                — read blocks[] flag with sound names
- get-selected         {}                                            — read cosmetic UI-selected playlist (not playing)
- set-selected         { playlistId, confirm:true }                  — set cosmetic UI-selected playlist
- create-soundscape    { name }                                      — create new Playlist in Soundscapes folder (mode=DISABLED)
- delete-soundscape    { playlistId, confirm:true }                  — delete soundscape and all its sounds (stops if playing)
- add-sound            { playlistId, name, path, volume?, repeat? }  — add PlaylistSound layer (assign to block via update-blocks)
- remove-sound         { playlistId, soundId, confirm:true }         — delete layer + remove path=soundId from blocks[]
- update-blocks        { playlistId, blocks[], confirm:true }         — atomic overwrite of blocks[] flag (read list-blocks first)

Block shape: { title, id?, sounds?: string[], isOrphaned?, mode?: "ambient"|"soundboard"|"random",
               time?, variance?, size?, color?, conditions?: string[], conditionMode?: "all"|"any"|"none" }
Conditions: "inCombat" · "notInCombat" · "day" · "night" · "moodA" · "moodB" · "moodC" · "weather-<key>"
Mood idioms: moodA=calm/exploration, moodB=tension/fight, moodC=climax/boss

BUNDLE STATUS:
- get-bundle-status {}  — check which of the 6 atmosphere members are active
Members: fxmaster · tokenmagic · scenery · scene-transitions · multiface-tiles · dynamic-soundscapes

Examples:
- { action: "get-bundle-status" }
- { action: "play-preset", preset: "thunderstorm" }
- { action: "play-preset", preset: "rain", options: { topDown: true, density: "high" } }
- { action: "switch-preset", preset: null }
- { action: "play-particles", particles: [{ type: "rain", options: { density: 0.8 } }] }
- { action: "play-filters", filters: [{ type: "color", options: { brightness: 0.6 } }] }
- { action: "clear-effects", target: "both", confirm: true }
- { action: "set-enabled", disableAll: true, confirm: true }
- { action: "list-variations" }
- { action: "set-active-variation", variationIndex: 1, confirm: true }
- { action: "add-variation", name: "Ruined", gmBackground: "modules/scenery/bg_ruined.webp", confirm: true }
- { action: "play-transition", transitionOptions: { content: "<p>Scene Title</p>", fadeIn: 1000, fadeOut: 1000 }, showMe: true }
- { action: "set-scene-transition", subAction: "per-scene", sceneId: "abc123", transitionOptions: { content: "<p>Title</p>", bgColor: "#000000" } }
- { action: "list-tile-faces", tileId: "def456" }
- { action: "cycle-tile-face", tileId: "def456" }
- { action: "add-tile-face", tileId: "def456", facePath: "modules/mytiles/variant2.webp" }
- { action: "list-soundscapes" }
- { action: "set-soundscape", playlistId: "abc123" }
- { action: "set-mood", mood: "moodB" }
- { action: "set-mood", mood: "moodA", playlistId: "abc123" }
- { action: "get-mood" }
- { action: "stop-soundscape" }
- { action: "list-blocks", playlistId: "abc123" }
- { action: "set-layer-enabled", playlistId: "abc123", soundId: "snd001", enabled: false }
- { action: "set-layer-volume", playlistId: "abc123", soundId: "snd001", volume: 0.6 }
- { action: "create-soundscape", name: "Tavern Ambience" }
- { action: "add-sound", playlistId: "abc123", name: "Fireplace", path: "modules/soundscapes/fire.ogg" }
- { action: "update-blocks", playlistId: "abc123", blocks: [{ title: "Ambient", sounds: ["snd001"], mode: "ambient" }], confirm: true }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                // Always available
                'get-bundle-status',
                // Phase 2: fxmaster
                'play-preset',
                'stop-preset',
                'toggle-preset',
                'switch-preset',
                'list-presets',
                'list-active-presets',
                'list-valid-presets',
                'play-particles',
                'play-filters',
                'stop-effects',
                'toggle-effects',
                'clear-effects',
                'set-enabled',
                'set-region-particles',
                'set-region-filters',
                'suppress-scene-particles',
                'suppress-scene-filters',
                // Phase 3: tokenmagic base
                'tokenmagic-apply',
                'tokenmagic-upsert',
                'tokenmagic-remove',
                'tokenmagic-query',
                'tokenmagic-preset',
                // Phase 3: tokenmagic-automatic-wounds companion
                'tokenmagic-wound-create',
                'tokenmagic-wound-heal',
                'tokenmagic-wound-remove',
                'tokenmagic-wound-reapply',
                'wound-toggle-disable',
                'wound-set-blood-color',
                // Phase 4B: scenery
                'list-variations',
                'get-active-variation',
                'set-active-variation',
                'add-variation',
                'delete-variation',
                'set-variation-backgrounds',
                'reset-variation-scene-data',
                'check-scenery-module-active',
                'read-scenery-settings',
                // Phase 4B: scene-transitions
                'play-transition',
                'end-transition',
                'set-scene-transition',
                'get-scene-transition',
                'delete-scene-transition',
                // Phase 4B: multiface-tiles
                'switch-tile-face',
                'list-tile-faces',
                'get-tile-original-face',
                'get-tile-active-face',
                'reset-to-original-face',
                'add-tile-face',
                'remove-tile-face',
                'cycle-tile-face',
                'clear-tile-faces',
                // Phase 5: dynamic-soundscapes
                'set-soundscape',
                'stop-soundscape',
                'set-mood',
                'get-mood',
                'set-layer-enabled',
                'set-layer-volume',
                'list-soundscapes',
                'list-blocks',
                'get-selected',
                'set-selected',
                'create-soundscape',
                'delete-soundscape',
                'add-sound',
                'remove-sound',
                'update-blocks',
              ],
              description: 'Scene atmosphere action. Pre-flight with get-bundle-status to check member availability.',
            },
            // ── fxmaster preset fields ────────────────────────────────────
            preset: {
              type: 'string',
              description: 'Preset name for play-preset/stop-preset/toggle-preset/switch-preset. Null for switch-preset to stop all.',
            },
            options: {
              type: 'object',
              description: 'Action-specific options (play-preset/toggle-preset/switch-preset: topDown, direction, color, speed, density, belowTokens, belowTiles, belowForeground, darknessActivationEnabled, scene, silent).',
            },
            scene: {
              type: 'string',
              description: 'Scene UUID or ID for cross-scene operations. Defaults to current canvas scene.',
            },
            // ── fxmaster effect fields ────────────────────────────────────
            particles: {
              type: 'array',
              description: 'Array of { type, options? } for play-particles. Also used as array of IDs for stop-effects/toggle-effects.',
              items: { type: 'object' },
            },
            filters: {
              type: 'array',
              description: 'Array of { type, options? } for play-filters. Also used as array of IDs for stop-effects/toggle-effects.',
              items: { type: 'object' },
            },
            effects: {
              type: 'array',
              description: 'Array of effect IDs for stop-effects/toggle-effects (auto-detects particle/filter).',
              items: { type: 'string' },
            },
            skipFading: {
              type: 'boolean',
              description: 'Skip fade-in/out transition for play/stop operations.',
            },
            apiToggleKey: {
              type: 'string',
              description: 'Named group key for toggling a set of effects together (play-particles/play-filters).',
            },
            toggleKey: {
              type: 'string',
              description: 'Toggle group key for toggle-effects.',
            },
            // ── clear-effects / set-enabled ───────────────────────────────
            target: {
              type: 'string',
              enum: ['particles', 'filters', 'both', 'stack'],
              description: 'What to clear for clear-effects: particles, filters, both (default), or stack.',
            },
            confirm: {
              type: 'boolean',
              description: 'Required for clear-effects and set-enabled with disableAll:true — confirms destructive/world-wide action. NOTE: add-variation, delete-variation, set-variation-backgrounds, reset-variation-scene-data, delete-scene-transition, set-selected, delete-soundscape, remove-sound, and update-blocks require exactly true (not just any truthy value).',
            },
            disableAll: {
              type: 'boolean',
              description: 'For set-enabled: true = suspend all FX rendering (kill-switch); false = re-enable.',
            },
            // ── region behavior fields ────────────────────────────────────
            regionId: {
              type: 'string',
              description: 'Foundry Region document ID for region behavior actions.',
            },
            particleType: {
              type: 'string',
              description: 'Free-tier particle type for set-region-particles.',
            },
            filterType: {
              type: 'string',
              description: 'Free-tier filter type for set-region-filters.',
            },
            replace: {
              type: 'boolean',
              description: 'For set-region-particles/set-region-filters: delete existing behaviors of the same type before creating.',
            },
            remove: {
              type: 'boolean',
              description: 'For suppress-scene-particles/suppress-scene-filters: remove the behavior instead of adding.',
            },
            // ── Phase 3: tokenmagic fields ────────────────────────────────
            placeableId: {
              type: 'string',
              description: 'Foundry document ID of the target placeable (Token, Tile, MeasuredTemplate, Drawing, or Region). Required for tokenmagic-apply/upsert/remove and tokenmagic-query placeable sub-actions.',
            },
            placeableType: {
              type: 'string',
              enum: ['Token', 'Tile', 'MeasuredTemplate', 'Drawing', 'Region'],
              description: 'Placeable type for tokenmagic actions. Determines which canvas collection to resolve the ID against.',
            },
            params: {
              type: 'array',
              description: 'Filter params array for tokenmagic-apply/upsert. Each entry must include filterType (one of 43 types). Optional: filterId, rank, enabled, animated, randomized, users, padding, zOrder, plus filter-type-specific params.',
              items: { type: 'object' },
            },
            filterId: {
              type: 'string',
              description: 'Filter ID for tokenmagic-remove (remove a specific filter by ID) and tokenmagic-query has-filter-type/id.',
            },
            filterInternalId: {
              type: 'string',
              description: 'Internal tokenmagic filter id (rarely needed; prefer filterId) for tokenmagic-remove.',
            },
            subAction: {
              type: 'string',
              description: 'Sub-action for tokenmagic-query (has-filter-type/id, get-filters, get-anime-info, get-filter-types, get-min-padding, get-settings) and tokenmagic-preset (get/list/add/delete/import-from-path/import-from-url/import-template-settings/reset-library).',
            },
            presetName: {
              type: 'string',
              description: 'Preset name for tokenmagic-preset get/add/delete. Can be a string or adjustment object {name, library?, ...overrides}.',
            },
            library: {
              type: 'string',
              description: 'Preset library name for tokenmagic-preset list/add/delete. Defaults to \'tmfx-main\'. Also \'tmfx-template\' for template presets.',
            },
            path: {
              type: 'string',
              description:
                'File path (Foundry-relative) or URL. ' +
                'tokenmagic-preset: import-from-path/import-from-url/import-template-settings. ' +
                'add-sound (dynamic-soundscapes): audio file path for the new sound layer.',
            },
            importOptions: {
              type: 'object',
              description: 'Import options for tokenmagic-preset import actions: { overwrite: boolean, replaceLibrary: boolean }.',
            },
            // ── Phase 3: tokenmagic wound fields ──────────────────────────
            tokenId: {
              type: 'string',
              description: 'Token document ID on the current scene for wound-* actions.',
            },
            damageFraction: {
              type: 'number',
              description: 'Damage as fraction of max HP (0.0–1.0) for tokenmagic-wound-create.',
            },
            healingFraction: {
              type: 'number',
              description: 'Healing as fraction of max HP (0.0–1.0) for tokenmagic-wound-heal.',
            },
            actorId: {
              type: 'string',
              description: 'Actor document ID for wound-toggle-disable.',
            },
            disabled: {
              type: 'boolean',
              description: 'For wound-toggle-disable: true = disable wounds, false = enable wounds. Omit to unconditionally toggle current state. NOTE: the internal companion flag \'enabled-for-token\'=true means DISABLED — this param uses clear naming.',
            },
            color: {
              type: 'string',
              description: 'Hex color for wound-set-blood-color. Format: \'0xRRGGBB\' (e.g. \'0x990505\' = dark red, \'0x22aa22\' = orc green).',
            },
            // ── Phase 4B: scenery fields ──────────────────────────────────
            sceneId: {
              type: 'string',
              description: 'Scene document ID or UUID for scenery/scene-transitions actions. Defaults to active canvas scene if omitted.',
            },
            variationIndex: {
              type: 'number',
              description: 'Zero-based variation index for scenery actions. Index 0 is the protected Default variation.',
            },
            variationName: {
              type: 'string',
              description: 'Variation name (alternative to variationIndex) for scenery set-active/delete/set-backgrounds/reset actions.',
            },
            name: {
              type: 'string',
              description:
                'Name string. add-variation (scenery): variation name. ' +
                'create-soundscape: new soundscape display name. ' +
                'add-sound: sound layer display name.',
            },
            gmBackground: {
              type: 'string',
              description: 'GM background image path for scenery add-variation/set-variation-backgrounds.',
            },
            plBackground: {
              type: 'string',
              description: 'Player background image path for scenery add-variation/set-variation-backgrounds. Locked to scene.background.src for index 0.',
            },
            sceneData: {
              type: 'object',
              description: 'Optional sceneData snapshot to embed in a variation (add-variation). Object with scene flags/settings to restore when variation is activated.',
            },
            // ── Phase 4B: scene-transitions fields ───────────────────────
            showJournal: {
              type: 'boolean',
              description: 'Toggle for set-scene-transition subAction:show-journal.',
            },
            showMe: {
              type: 'boolean',
              description: 'For play-transition: whether to show the transition to all connected clients (default: true).',
            },
            transitionOptions: {
              type: 'object',
              description: 'Transition options for play-transition/set-scene-transition. Fields: sceneID, content, fontColor, fontSize, bgImg, bgPos, bgLoop, bgMuted, bgSize, bgColor, bgOpacity, fadeIn, delay, fadeOut, audio, volume, audioLoop, allowPlayersToEnd, gmEndAll, gmHide, showUI, activateScene, users. NEVER include fromSocket.',
            },
            // ── Phase 4B: multiface-tiles fields ─────────────────────────
            tileId: {
              type: 'string',
              description: 'Tile document ID for multiface-tiles actions.',
            },
            facePath: {
              type: 'string',
              description: 'Image file path for switch-tile-face, add-tile-face, remove-tile-face.',
            },
            // ── Phase 5: dynamic-soundscapes fields ───────────────────────
            //
            // Fields shared with earlier phases (path, name, enabled, volume, repeat, confirm)
            // are documented on the existing entries above — updated to cover both uses.
            playlistId: {
              type: 'string',
              description:
                'Playlist document ID for dynamic-soundscapes actions. ' +
                'set-soundscape: soundscape to activate (must be in "Soundscapes" folder). ' +
                'set-mood/get-mood: defaults to currently playing soundscape if omitted. ' +
                'set-layer-enabled/set-layer-volume/list-blocks/delete-soundscape/add-sound/remove-sound/update-blocks: required. ' +
                'set-selected: playlist to show in the mixer UI sidebar.',
            },
            mood: {
              type: 'string',
              enum: ['moodA', 'moodB', 'moodC'],
              description:
                'Mood for set-mood: "moodA" (default/calm), "moodB" (tension/fight), "moodC" (climax/special). ' +
                'moodA is the module default when the flag is absent — only write explicitly to change from B or C.',
            },
            soundId: {
              type: 'string',
              description: 'PlaylistSound document ID for set-layer-enabled, set-layer-volume, remove-sound.',
            },
            enabled: {
              type: 'boolean',
              description: 'Layer enable flag for set-layer-enabled: true = active, false = muted/disabled.',
            },
            volume: {
              type: 'number',
              description: 'Layer volume 0.0–1.0 for set-layer-volume.',
            },
            repeat: {
              type: 'boolean',
              description: 'Whether the sound loops; default true (ambient mode) for add-sound.',
            },
            blocks: {
              type: 'array',
              description:
                'Full replacement Block[] array for update-blocks. ' +
                'Each block: { title, id?, sounds?: string[], isOrphaned?, mode?: "ambient"|"soundboard"|"random", ' +
                'time?, variance?, size?, color?, conditions?: string[], conditionMode?: "all"|"any"|"none" }. ' +
                'Always read list-blocks first — this is an atomic overwrite of the entire array.',
              items: { type: 'object' },
            },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: Record<string, unknown>) {
    const action = String(args.action ?? 'unknown');
    this.logger.info(`Executing ${TOOL_NAME} action`, { action });
    try {
      const data = await this.query<SceneAtmosphereResult>(TOOL_NAME, args);
      const text = this.formatResult(action, data);
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // MODULE_NOT_ACTIVE, COMPANION_NOT_ACTIVE, and SOCKETLIB_NOT_ACTIVE all use
      // moduleNotActiveContent so the caller gets a typed, consistent error presentation.
      if (
        msg.includes('MODULE_NOT_ACTIVE') ||
        msg.includes('COMPANION_NOT_ACTIVE') ||
        msg.includes('SOCKETLIB_NOT_ACTIVE')
      ) {
        return moduleNotActiveContent(TOOL_NAME, msg);
      }
      return errorContent(action, msg);
    }
  }

  private formatResult(action: string, data: SceneAtmosphereResult): string {
    switch (action) {
      case 'get-bundle-status':
        return formatGetBundleStatus(data as GetBundleStatusResult);

      // ── Phase 2: fxmaster ──────────────────────────────────────────────
      case 'play-preset':
        return formatPlayPreset(data as PlayPresetResult);
      case 'stop-preset':
        return formatStopPreset(data as StopPresetResult);
      case 'toggle-preset':
        return formatTogglePreset(data as TogglePresetResult);
      case 'switch-preset':
        return formatSwitchPreset(data as SwitchPresetResult);
      case 'list-presets':
        return formatListPresets(data as ListPresetsResult);
      case 'list-active-presets':
        return formatListActivePresets(data as ListActivePresetsResult);
      case 'list-valid-presets':
        return formatListValidPresets(data as ListValidPresetsResult);
      case 'play-particles':
        return formatPlayParticles(data as PlayParticlesResult);
      case 'play-filters':
        return formatPlayFilters(data as PlayFiltersResult);
      case 'stop-effects':
        return formatStopEffects(data as StopEffectsResult);
      case 'toggle-effects':
        return formatToggleEffects(data as ToggleEffectsResult);
      case 'clear-effects':
        return formatClearEffects(data as ClearEffectsResult);
      case 'set-enabled':
        return formatSetEnabled(data as SetEnabledResult);
      case 'set-region-particles':
        return formatSetRegionParticles(data as SetRegionParticlesResult);
      case 'set-region-filters':
        return formatSetRegionFilters(data as SetRegionFiltersResult);
      case 'suppress-scene-particles':
        return formatSuppressSceneParticles(data as SuppressSceneParticlesResult);
      case 'suppress-scene-filters':
        return formatSuppressSceneFilters(data as SuppressSceneFiltersResult);

      // ── Phase 3: tokenmagic + wounds ──────────────────────────────────
      case 'tokenmagic-apply':
        return formatTokenmagicApply(data as TokenmagicApplyResult);
      case 'tokenmagic-upsert':
        return formatTokenmagicUpsert(data as TokenmagicUpsertResult);
      case 'tokenmagic-remove':
        return formatTokenmagicRemove(data as TokenmagicRemoveResult);
      case 'tokenmagic-query':
        return formatTokenmagicQuery(data as TokenmagicQueryResult);
      case 'tokenmagic-preset':
        return formatTokenmagicPreset(data as TokenmagicPresetResult);
      case 'tokenmagic-wound-create':
        return formatTokenmagicWoundCreate(data as TokenmagicWoundCreateResult);
      case 'tokenmagic-wound-heal':
        return formatTokenmagicWoundHeal(data as TokenmagicWoundHealResult);
      case 'tokenmagic-wound-remove':
        return formatTokenmagicWoundRemove(data as TokenmagicWoundRemoveResult);
      case 'tokenmagic-wound-reapply':
        return formatTokenmagicWoundReapply(data as TokenmagicWoundReapplyResult);
      case 'wound-toggle-disable':
        return formatWoundToggleDisable(data as WoundToggleDisableResult);
      case 'wound-set-blood-color':
        return formatWoundSetBloodColor(data as WoundSetBloodColorResult);

      // ── Phase 4B: scenery ─────────────────────────────────────────────
      case 'list-variations':
        return formatListVariations(data as ListVariationsResult);
      case 'get-active-variation':
        return formatGetActiveVariation(data as GetActiveVariationResult);
      case 'set-active-variation':
        return formatSetActiveVariation(data as SetActiveVariationResult);
      case 'add-variation':
        return formatAddVariation(data as AddVariationResult);
      case 'delete-variation':
        return formatDeleteVariation(data as DeleteVariationResult);
      case 'set-variation-backgrounds':
        return formatSetVariationBackgrounds(data as SetVariationBackgroundsResult);
      case 'reset-variation-scene-data':
        return formatResetVariationSceneData(data as ResetVariationSceneDataResult);
      case 'check-scenery-module-active':
        return formatCheckSceneryModuleActive(data as CheckSceneryModuleActiveResult);
      case 'read-scenery-settings':
        return formatReadScenerySettings(data as ReadScenerySettingsResult);

      // ── Phase 4B: scene-transitions ───────────────────────────────────
      case 'play-transition':
        return formatPlayTransition(data as PlayTransitionResult);
      case 'end-transition':
        return formatEndTransition(data as EndTransitionResult);
      case 'set-scene-transition':
        return formatSetSceneTransition(data as SetSceneTransitionResult);
      case 'get-scene-transition':
        return formatGetSceneTransition(data as GetSceneTransitionResult);
      case 'delete-scene-transition':
        return formatDeleteSceneTransition(data as DeleteSceneTransitionResult);

      // ── Phase 4B: multiface-tiles ─────────────────────────────────────
      case 'switch-tile-face':
        return formatSwitchTileFace(data as SwitchTileFaceResult);
      case 'list-tile-faces':
        return formatListTileFaces(data as ListTileFacesResult);
      case 'get-tile-original-face':
        return formatGetTileOriginalFace(data as GetTileOriginalFaceResult);
      case 'get-tile-active-face':
        return formatGetTileActiveFace(data as GetTileActiveFaceResult);
      case 'reset-to-original-face':
        return formatResetToOriginalFace(data as ResetToOriginalFaceResult);
      case 'add-tile-face':
        return formatAddTileFace(data as AddTileFaceResult);
      case 'remove-tile-face':
        return formatRemoveTileFace(data as RemoveTileFaceResult);
      case 'cycle-tile-face':
        return formatCycleTileFace(data as CycleTileFaceResult);
      case 'clear-tile-faces':
        return formatClearTileFaces(data as ClearTileFacesResult);

      // ── Phase 5: dynamic-soundscapes ──────────────────────────────────
      case 'set-soundscape':
        return formatSetSoundscape(data as SetSoundscapeResult);
      case 'stop-soundscape':
        return formatStopSoundscape(data as StopSoundscapeResult);
      case 'set-mood':
        return formatSetMood(data as SetMoodResult);
      case 'get-mood':
        return formatGetMood(data as GetMoodResult);
      case 'set-layer-enabled':
        return formatSetLayerEnabled(data as SetLayerEnabledResult);
      case 'set-layer-volume':
        return formatSetLayerVolume(data as SetLayerVolumeResult);
      case 'list-soundscapes':
        return formatListSoundscapes(data as ListSoundscapesResult);
      case 'list-blocks':
        return formatListBlocks(data as ListBlocksResult);
      case 'get-selected':
        return formatGetSelected(data as GetSelectedResult);
      case 'set-selected':
        return formatSetSelected(data as SetSelectedResult);
      case 'create-soundscape':
        return formatCreateSoundscape(data as CreateSoundscapeResult);
      case 'delete-soundscape':
        return formatDeleteSoundscape(data as DeleteSoundscapeResult);
      case 'add-sound':
        return formatAddSound(data as AddSoundResult);
      case 'remove-sound':
        return formatRemoveSound(data as RemoveSoundResult);
      case 'update-blocks':
        return formatUpdateBlocks(data as UpdateBlocksResult);

      default:
        // Generic fallback — emits the raw data so no field is silently dropped (F03).
        return `${TOOL_NAME}.${action}: ${JSON.stringify(data)}`;
    }
  }
}
