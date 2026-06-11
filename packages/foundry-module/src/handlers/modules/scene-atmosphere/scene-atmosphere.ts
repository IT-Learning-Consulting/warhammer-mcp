// Module Integration v1 Phase 6 — module-scene-atmosphere handler dispatcher.
//
// Central dispatcher for the scene-atmosphere bundle umbrella. Routes ~67 actions
// across 6 conditional members: fxmaster / tokenmagic / scenery / scene-transitions /
// multiface-tiles / dynamic-soundscapes.
//
// Guard design (HC1/CCR-1):
//   - get-bundle-status: ALWAYS succeeds (no guard). Reports active state of all members.
//   - All other actions: guarded via ACTION_MEMBER_MAP (action → member-id).
//     requireModuleActive(member) returns failure envelope; never throws.
//   - wound-* actions additionally guard requireCompanionActive('tokenmagic-automatic-wounds').
//     (TODO Phase 3: add wound-* entries to ACTION_MEMBER_MAP and companion guard)
//   - play-transition / end-transition additionally guard requireModuleActive('socketlib').
//     (TODO Phase 4: add socketlib guard in the scene-transitions case block)
//
// Transport: all actions call game.* / module.api.* directly in-handler (CONFIG.queries
// runs inside Foundry). No macro-execute bridge. scene-transitions precedent confirmed.
//
// Envelope contract: returns {success:true,data} | {success:false,error} — NEVER throws
// for the inactive/guard case (see require-module-active.ts design note).
//
// Anchors:
//   - Phase 6 plan §Design Decisions (bundle guard, transport, per-member file isolation).
//   - phase6_pre_plan.md §Guard + §Impl template.
//   - Phase 5 dispatchers (tagger.ts / sequencer.ts) as structural exemplars.

import { requireModuleActive, requireCompanionActive } from '../_shared/require-module-active.js';
import { ModuleSceneAtmosphereInput, type ModuleSceneAtmosphereInputType, BUNDLE_MEMBERS } from './schemas.js';
import {
  handlePlayPreset,
  handleStopPreset,
  handleTogglePreset,
  handleSwitchPreset,
  handleListPresets,
  handleListActivePresets,
  handleListValidPresets,
  handlePlayParticles,
  handlePlayFilters,
  handleStopEffects,
  handleToggleEffects,
  handleClearEffects,
  handleSetEnabled,
  handleSetRegionParticles,
  handleSetRegionFilters,
  handleSuppressSceneParticles,
  handleSuppressSceneFilters,
} from './fxmaster.js';
import {
  handleTokenmagicApply,
  handleTokenmagicUpsert,
  handleTokenmagicRemove,
  handleTokenmagicQuery,
  handleTokenmagicPreset,
  handleTokenmagicWoundCreate,
  handleTokenmagicWoundHeal,
  handleTokenmagicWoundRemove,
  handleTokenmagicWoundReapply,
  handleWoundToggleDisable,
  handleWoundSetBloodColor,
} from './tokenmagic.js';
import {
  handleListVariations,
  handleGetActiveVariation,
  handleSetActiveVariation,
  handleAddVariation,
  handleDeleteVariation,
  handleSetVariationBackgrounds,
  handleResetVariationSceneData,
  handleCheckSceneryModuleActive,
  handleReadScenerySettings,
} from './scenery.js';
import {
  handlePlayTransition,
  handleEndTransition,
  handleSetSceneTransition,
  handleGetSceneTransition,
  handleDeleteSceneTransition,
} from './scene-transitions.js';
import {
  handleSwitchTileFace,
  handleListTileFaces,
  handleGetTileOriginalFace,
  handleGetTileActiveFace,
  handleResetToOriginalFace,
  handleAddTileFace,
  handleRemoveTileFace,
  handleCycleTileFace,
  handleClearTileFaces,
} from './multiface-tiles.js';
import {
  handleSetSoundscape,
  handleStopSoundscape,
  handleSetMood,
  handleGetMood,
  handleSetLayerEnabled,
  handleSetLayerVolume,
  handleListSoundscapes,
  handleListBlocks,
  handleGetSelected,
  handleSetSelected,
  handleCreateSoundscape,
  handleDeleteSoundscape,
  handleAddSound,
  handleRemoveSound,
  handleUpdateBlocks,
} from './dynamic-soundscapes.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

// ── ACTION_MEMBER_MAP ─────────────────────────────────────────────────────────
//
// Maps action → primary member module ID for the guard block.
// Phase 1: empty — only get-bundle-status is defined and it skips the map.
// Member phases populate this map as their actions are added.
//
// TODO Phase 4 (scenery/transitions/tiles): Add ~23 action keys.
// TODO Phase 5 (dynamic-soundscapes): Add ~15 soundscapes action keys.

export const ACTION_MEMBER_MAP: Record<string, string> = {
  // Phase 2 — fxmaster actions
  'play-preset':              'fxmaster',
  'stop-preset':              'fxmaster',
  'toggle-preset':            'fxmaster',
  'switch-preset':            'fxmaster',
  'list-presets':             'fxmaster',
  'list-active-presets':      'fxmaster',
  'list-valid-presets':       'fxmaster',
  'play-particles':           'fxmaster',
  'play-filters':             'fxmaster',
  'stop-effects':             'fxmaster',
  'toggle-effects':           'fxmaster',
  'clear-effects':            'fxmaster',
  'set-enabled':              'fxmaster',
  'set-region-particles':     'fxmaster',
  'set-region-filters':       'fxmaster',
  'suppress-scene-particles': 'fxmaster',
  'suppress-scene-filters':   'fxmaster',

  // Phase 3 — tokenmagic base actions (guard: tokenmagic primary module)
  'tokenmagic-apply':   'tokenmagic',
  'tokenmagic-upsert':  'tokenmagic',
  'tokenmagic-remove':  'tokenmagic',
  'tokenmagic-query':   'tokenmagic',
  'tokenmagic-preset':  'tokenmagic',

  // Phase 3 — wound actions (guard: tokenmagic primary + companion tokenmagic-automatic-wounds)
  // These are ALSO in WOUND_ACTIONS below for the companion guard.
  'tokenmagic-wound-create':  'tokenmagic',
  'tokenmagic-wound-heal':    'tokenmagic',
  'tokenmagic-wound-remove':  'tokenmagic',
  'tokenmagic-wound-reapply': 'tokenmagic',
  'wound-toggle-disable':     'tokenmagic',
  'wound-set-blood-color':    'tokenmagic',

  // Phase 4B — scenery actions
  'list-variations':              'scenery',
  'get-active-variation':         'scenery',
  'set-active-variation':         'scenery',
  'add-variation':                'scenery',
  'delete-variation':             'scenery',
  'set-variation-backgrounds':    'scenery',
  'reset-variation-scene-data':   'scenery',
  'check-scenery-module-active':  'scenery',
  'read-scenery-settings':        'scenery',

  // Phase 4B — scene-transitions actions (play-transition + end-transition ALSO get socketlib guard)
  'play-transition':        'scene-transitions',
  'end-transition':         'scene-transitions',
  'set-scene-transition':   'scene-transitions',
  'get-scene-transition':   'scene-transitions',
  'delete-scene-transition':'scene-transitions',

  // Phase 4B — multiface-tiles actions
  'switch-tile-face':        'multiface-tiles',
  'list-tile-faces':         'multiface-tiles',
  'get-tile-original-face':  'multiface-tiles',
  'get-tile-active-face':    'multiface-tiles',
  'reset-to-original-face':  'multiface-tiles',
  'add-tile-face':           'multiface-tiles',
  'remove-tile-face':        'multiface-tiles',
  'cycle-tile-face':         'multiface-tiles',
  'clear-tile-faces':        'multiface-tiles',

  // Phase 5 — dynamic-soundscapes actions
  //
  // updateState-delay note: set-soundscape / stop-soundscape write world settings that are
  // server-persisted immediately. Audio playback starts when the active GM client's
  // RandomSoundController.setPlaylist() fires via onChange. This is architectural, not a defect.
  'set-soundscape':    'dynamic-soundscapes',
  'stop-soundscape':   'dynamic-soundscapes',
  'set-mood':          'dynamic-soundscapes',
  'get-mood':          'dynamic-soundscapes',
  'set-layer-enabled': 'dynamic-soundscapes',
  'set-layer-volume':  'dynamic-soundscapes',
  'list-soundscapes':  'dynamic-soundscapes',
  'list-blocks':       'dynamic-soundscapes',
  'get-selected':      'dynamic-soundscapes',
  'set-selected':      'dynamic-soundscapes',
  'create-soundscape': 'dynamic-soundscapes',
  'delete-soundscape': 'dynamic-soundscapes',
  'add-sound':         'dynamic-soundscapes',
  'remove-sound':      'dynamic-soundscapes',
  'update-blocks':     'dynamic-soundscapes',
};

// ── WOUND_ACTIONS ─────────────────────────────────────────────────────────────
//
// Actions that require BOTH tokenmagic primary guard AND tokenmagic-automatic-wounds
// companion guard. After ACTION_MEMBER_MAP guard passes for 'tokenmagic', the
// dispatcher additionally checks requireCompanionActive('tokenmagic-automatic-wounds').

const WOUND_ACTIONS = new Set([
  'tokenmagic-wound-create',
  'tokenmagic-wound-heal',
  'tokenmagic-wound-remove',
  'tokenmagic-wound-reapply',
  'wound-toggle-disable',
  'wound-set-blood-color',
]);

// ── SOCKETLIB_ACTIONS ─────────────────────────────────────────────────────────
//
// scene-transitions actions that additionally require socketlib active.
// The primary scene-transitions guard (ACTION_MEMBER_MAP) passes first.
// Then for these two actions, the dispatcher additionally checks requireModuleActive('socketlib').
//
// Rationale: the module's source has no defensive guard — it calls
// sceneTransitionsSocket.executeForEveryone/Others/Users without checking socketlib.
// Missing socketlib causes a throw. MCP must guard before the handler is called.
// Pattern mirrors WOUND_ACTIONS (secondary guard after primary member guard).

const SOCKETLIB_ACTIONS = new Set([
  'play-transition',
  'end-transition',
]);

// ── Public dispatcher ─────────────────────────────────────────────────────────

export async function dispatchModuleSceneAtmosphere(data: unknown): Promise<any> {
  const parsed = ModuleSceneAtmosphereInput.parse(data);
  const action = parsed.action;

  // ── Per-action guard block ───────────────────────────────────────────────
  //
  // get-bundle-status is excluded from the guard (always succeeds).
  // All other actions must resolve a member via ACTION_MEMBER_MAP.
  //
  // Phase 3 (DONE): wound-* actions call requireCompanionActive after primary guard.
  // Phase 4B (DONE): play-transition / end-transition also call requireModuleActive('socketlib').

  if (action !== 'get-bundle-status') {
    const member = ACTION_MEMBER_MAP[action];
    if (member) {
      const g = requireModuleActive(member);
      if (g) return g;
    }
    // Phase 3: wound-* actions additionally require the companion module active.
    // Primary tokenmagic guard already passed above; this is the secondary companion check.
    if (WOUND_ACTIONS.has(action)) {
      const cg = requireCompanionActive('tokenmagic-automatic-wounds');
      if (cg) return cg;
    }
    // Phase 4B: play-transition / end-transition additionally require socketlib active.
    // Primary scene-transitions guard already passed above; this is the secondary socketlib check.
    // The module throws without socketlib — no defensive guard in module source.
    if (SOCKETLIB_ACTIONS.has(action)) {
      const sg = requireModuleActive('socketlib');
      if (sg) return sg;
    }
    // Note: if action is not in ACTION_MEMBER_MAP, it falls through to the switch
    // default, which returns UNKNOWN_ACTION. Member phases must add their actions
    // to ACTION_MEMBER_MAP before adding the switch case.
  }

  // ── Action dispatch ───────────────────────────────────────────────────────

  switch (parsed.action) {
    case 'get-bundle-status':
      return handleGetBundleStatus(parsed);

    // ── Phase 2: fxmaster ─────────────────────────────────────────────────
    case 'play-preset':              return handlePlayPreset(parsed);
    case 'stop-preset':              return handleStopPreset(parsed);
    case 'toggle-preset':            return handleTogglePreset(parsed);
    case 'switch-preset':            return handleSwitchPreset(parsed);
    case 'list-presets':             return handleListPresets(parsed);
    case 'list-active-presets':      return handleListActivePresets(parsed);
    case 'list-valid-presets':       return handleListValidPresets(parsed);
    case 'play-particles':           return handlePlayParticles(parsed);
    case 'play-filters':             return handlePlayFilters(parsed);
    case 'stop-effects':             return handleStopEffects(parsed);
    case 'toggle-effects':           return handleToggleEffects(parsed);
    case 'clear-effects':            return handleClearEffects(parsed);
    case 'set-enabled':              return handleSetEnabled(parsed);
    case 'set-region-particles':     return handleSetRegionParticles(parsed);
    case 'set-region-filters':       return handleSetRegionFilters(parsed);
    case 'suppress-scene-particles': return handleSuppressSceneParticles(parsed);
    case 'suppress-scene-filters':   return handleSuppressSceneFilters(parsed);

    // ── Phase 3: tokenmagic + automatic-wounds companion ──────────────────
    case 'tokenmagic-apply':          return handleTokenmagicApply(parsed);
    case 'tokenmagic-upsert':         return handleTokenmagicUpsert(parsed);
    case 'tokenmagic-remove':         return handleTokenmagicRemove(parsed);
    case 'tokenmagic-query':          return handleTokenmagicQuery(parsed);
    case 'tokenmagic-preset':         return handleTokenmagicPreset(parsed);
    case 'tokenmagic-wound-create':   return handleTokenmagicWoundCreate(parsed);
    case 'tokenmagic-wound-heal':     return handleTokenmagicWoundHeal(parsed);
    case 'tokenmagic-wound-remove':   return handleTokenmagicWoundRemove(parsed);
    case 'tokenmagic-wound-reapply':  return handleTokenmagicWoundReapply(parsed);
    case 'wound-toggle-disable':      return handleWoundToggleDisable(parsed);
    case 'wound-set-blood-color':     return handleWoundSetBloodColor(parsed);

    // ── Phase 4B: scenery ─────────────────────────────────────────────────
    case 'list-variations':              return handleListVariations(parsed);
    case 'get-active-variation':         return handleGetActiveVariation(parsed);
    case 'set-active-variation':         return handleSetActiveVariation(parsed);
    case 'add-variation':                return handleAddVariation(parsed);
    case 'delete-variation':             return handleDeleteVariation(parsed);
    case 'set-variation-backgrounds':    return handleSetVariationBackgrounds(parsed);
    case 'reset-variation-scene-data':   return handleResetVariationSceneData(parsed);
    case 'check-scenery-module-active':  return handleCheckSceneryModuleActive(parsed);
    case 'read-scenery-settings':        return handleReadScenerySettings(parsed);

    // ── Phase 4B: scene-transitions ───────────────────────────────────────
    case 'play-transition':              return handlePlayTransition(parsed);
    case 'end-transition':               return handleEndTransition(parsed);
    case 'set-scene-transition':         return handleSetSceneTransition(parsed);
    case 'get-scene-transition':         return handleGetSceneTransition(parsed);
    case 'delete-scene-transition':      return handleDeleteSceneTransition(parsed);

    // ── Phase 4B: multiface-tiles ─────────────────────────────────────────
    case 'switch-tile-face':             return handleSwitchTileFace(parsed);
    case 'list-tile-faces':              return handleListTileFaces(parsed);
    case 'get-tile-original-face':       return handleGetTileOriginalFace(parsed);
    case 'get-tile-active-face':         return handleGetTileActiveFace(parsed);
    case 'reset-to-original-face':       return handleResetToOriginalFace(parsed);
    case 'add-tile-face':                return handleAddTileFace(parsed);
    case 'remove-tile-face':             return handleRemoveTileFace(parsed);
    case 'cycle-tile-face':              return handleCycleTileFace(parsed);
    case 'clear-tile-faces':             return handleClearTileFaces(parsed);

    // ── Phase 5: dynamic-soundscapes ─────────────────────────────────────
    case 'set-soundscape':    return handleSetSoundscape(parsed);
    case 'stop-soundscape':   return handleStopSoundscape(parsed);
    case 'set-mood':          return handleSetMood(parsed);
    case 'get-mood':          return handleGetMood(parsed);
    case 'set-layer-enabled': return handleSetLayerEnabled(parsed);
    case 'set-layer-volume':  return handleSetLayerVolume(parsed);
    case 'list-soundscapes':  return handleListSoundscapes(parsed);
    case 'list-blocks':       return handleListBlocks(parsed);
    case 'get-selected':      return handleGetSelected(parsed);
    case 'set-selected':      return handleSetSelected(parsed);
    case 'create-soundscape': return handleCreateSoundscape(parsed);
    case 'delete-soundscape': return handleDeleteSoundscape(parsed);
    case 'add-sound':         return handleAddSound(parsed);
    case 'remove-sound':      return handleRemoveSound(parsed);
    case 'update-blocks':     return handleUpdateBlocks(parsed);

    default: {
      // Exhaustiveness guard — if TypeScript compilation succeeds with this line,
      // every variant in the discriminated union has a case above.
      // Use `const _exhaustive: never` (NOT `as never`) per Phase-1 lesson.
      const _exhaustive: never = parsed;
      return {
        success: false,
        error: `UNKNOWN_ACTION: module-scene-atmosphere action "${(_exhaustive as any).action}" is not implemented.`,
      };
    }
  }
}

// ── get-bundle-status ─────────────────────────────────────────────────────────
//
// Unguarded. Iterates BUNDLE_MEMBERS and reports active state for each via
// game.modules.get(id). Returns a members array with {id, active, title, version}.
// Useful as a pre-flight before calling member-specific actions.

type GetBundleStatusInput = Extract<ModuleSceneAtmosphereInputType, { action: 'get-bundle-status' }>;

interface BundleMemberStatus {
  id: string;
  active: boolean;
  title: string | null;
  version: string | null;
}

async function handleGetBundleStatus(_input: GetBundleStatusInput): Promise<Envelope<{ members: BundleMemberStatus[] }>> {
  const game = (globalThis as any).game;

  const members: BundleMemberStatus[] = BUNDLE_MEMBERS.map((id) => {
    const mod = game?.modules?.get?.(id);
    return {
      id,
      active: Boolean(mod?.active),
      title: mod?.title ?? null,
      version: mod?.version ?? null,
    };
  });

  return {
    success: true,
    data: { members },
  };
}
