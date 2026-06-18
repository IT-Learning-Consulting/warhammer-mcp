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
//   - R2.4: errors route through the shared BaseTool.errorResponse (was a module-local errorContent helper).
//   - Phase-5 F03: formatter emits EVERY field each handler returns (no silent drops).
//   - Phase 6 plan §2.1 + fxmaster audit.md §API Surface.
//
// Phase 8 (R8.4): the 6 sub-family result-interface + formatter blocks and the getToolDefinitions
// inputSchema literal were extracted VERBATIM to sibling files (fxmaster.ts / tokenmagic.ts /
// scenery.ts / scene-transitions.ts / multiface-tiles.ts / dynamic-soundscapes.ts / definitions.ts)
// so each file lands <=600 lines. This file is now the class shell: execute + formatResult
// trampoline (delegating to the imported formatters) + getToolDefinitions returning the constant.


import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { SCENE_ATMOSPHERE_TOOL_DEFINITIONS } from './definitions.js';
import {
  BundleMemberStatus,
  GetBundleStatusResult,
  PlayPresetResult,
  StopPresetResult,
  TogglePresetResult,
  SwitchPresetResult,
  ListPresetsResult,
  ListActivePresetsResult,
  ListValidPresetsResult,
  PlayParticlesResult,
  PlayFiltersResult,
  StopEffectsResult,
  ToggleEffectsResult,
  ClearEffectsResult,
  SetEnabledResult,
  SetRegionParticlesResult,
  SetRegionFiltersResult,
  SuppressSceneParticlesResult,
  SuppressSceneFiltersResult,
  FxmasterResult,
  formatGetBundleStatus,
  formatPlayPreset,
  formatStopPreset,
  formatTogglePreset,
  formatSwitchPreset,
  formatListPresets,
  formatListActivePresets,
  formatListValidPresets,
  formatPlayParticles,
  formatPlayFilters,
  formatStopEffects,
  formatToggleEffects,
  formatClearEffects,
  formatSetEnabled,
  formatSetRegionParticles,
  formatSetRegionFilters,
  formatSuppressSceneParticles,
  formatSuppressSceneFilters,
} from './fxmaster.js';
import {
  TokenmagicApplyResult,
  TokenmagicUpsertResult,
  TokenmagicRemoveResult,
  TokenmagicQueryResult,
  TokenmagicPresetResult,
  TokenmagicWoundCreateResult,
  TokenmagicWoundHealResult,
  TokenmagicWoundRemoveResult,
  TokenmagicWoundReapplyResult,
  WoundToggleDisableResult,
  WoundSetBloodColorResult,
  TokenmagicResult,
  formatTokenmagicApply,
  formatTokenmagicUpsert,
  formatTokenmagicRemove,
  formatTokenmagicQuery,
  formatTokenmagicPreset,
  formatTokenmagicWoundCreate,
  formatTokenmagicWoundHeal,
  formatTokenmagicWoundRemove,
  formatTokenmagicWoundReapply,
  formatWoundToggleDisable,
  formatWoundSetBloodColor,
} from './tokenmagic.js';
import {
  SceneryVariation,
  ListVariationsResult,
  GetActiveVariationResult,
  SetActiveVariationResult,
  AddVariationResult,
  DeleteVariationResult,
  SetVariationBackgroundsResult,
  ResetVariationSceneDataResult,
  CheckSceneryModuleActiveResult,
  ReadScenerySettingsResult,
  SceneryResult,
  formatListVariations,
  formatGetActiveVariation,
  formatSetActiveVariation,
  formatAddVariation,
  formatDeleteVariation,
  formatSetVariationBackgrounds,
  formatResetVariationSceneData,
  formatCheckSceneryModuleActive,
  formatReadScenerySettings,
} from './scenery.js';
import {
  TransitionOptions,
  PlayTransitionResult,
  EndTransitionResult,
  SetSceneTransitionResult,
  GetSceneTransitionResult,
  DeleteSceneTransitionResult,
  SceneTransitionsResult,
  formatPlayTransition,
  formatEndTransition,
  formatSetSceneTransition,
  formatGetSceneTransition,
  formatDeleteSceneTransition,
} from './scene-transitions.js';
import {
  TileFaceEntry,
  SwitchTileFaceResult,
  ListTileFacesResult,
  GetTileOriginalFaceResult,
  GetTileActiveFaceResult,
  ResetToOriginalFaceResult,
  AddTileFaceResult,
  RemoveTileFaceResult,
  CycleTileFaceResult,
  ClearTileFacesResult,
  MultifaceTilesResult,
  formatSwitchTileFace,
  formatListTileFaces,
  formatGetTileOriginalFace,
  formatGetTileActiveFace,
  formatResetToOriginalFace,
  formatAddTileFace,
  formatRemoveTileFace,
  formatCycleTileFace,
  formatClearTileFaces,
} from './multiface-tiles.js';
import {
  SetSoundscapeResult,
  StopSoundscapeResult,
  SetMoodResult,
  GetMoodResult,
  SetLayerEnabledResult,
  SetLayerVolumeResult,
  SoundscapeEntry,
  ListSoundscapesResult,
  BlockSoundRef,
  BlockEntry,
  ListBlocksResult,
  GetSelectedResult,
  SetSelectedResult,
  CreateSoundscapeResult,
  DeleteSoundscapeResult,
  AddSoundResult,
  RemoveSoundResult,
  UpdateBlocksResult,
  DynamicSoundscapesResult,
  formatSetSoundscape,
  formatStopSoundscape,
  formatSetMood,
  formatGetMood,
  formatSetLayerEnabled,
  formatSetLayerVolume,
  formatListSoundscapes,
  formatListBlocks,
  formatGetSelected,
  formatSetSelected,
  formatCreateSoundscape,
  formatDeleteSoundscape,
  formatAddSound,
  formatRemoveSound,
  formatUpdateBlocks,
} from './dynamic-soundscapes.js';

const TOOL_NAME = 'module-scene-atmosphere' as const;

// Full result union — member phases extend this.
type SceneAtmosphereResult =
  | GetBundleStatusResult
  | FxmasterResult
  | TokenmagicResult
  | SceneryResult
  | SceneTransitionsResult
  | MultifaceTilesResult
  | DynamicSoundscapesResult;

export interface ModuleSceneAtmosphereToolOptions extends BaseToolOptions {}

export class ModuleSceneAtmosphereTool extends BaseTool {
  constructor(options: ModuleSceneAtmosphereToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'module-scene-atmosphere', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return SCENE_ATMOSPHERE_TOOL_DEFINITIONS;
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
        msg.includes(ErrorTokens.MODULE_NOT_ACTIVE) ||
        msg.includes(ErrorTokens.COMPANION_NOT_ACTIVE) ||
        msg.includes(ErrorTokens.SOCKETLIB_NOT_ACTIVE)
      ) {
        return moduleNotActiveContent(TOOL_NAME, msg);
      }
      return this.errorResponse(`${TOOL_NAME}/${action}`, msg);
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
