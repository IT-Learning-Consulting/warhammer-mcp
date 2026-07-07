// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file. Module-API calls here are settings/document writes only.
// Module Integration v1 Phase 6A — fxmaster action handlers.
//
// All handlers in this file call globalThis.FXMASTER.api.* directly (handlers run inside
// Foundry via CONFIG.queries — no macro-execute bridge needed).
//
// Free-tier type validation (Discipline rule 4):
//   - 16 free particle types: autumnleaves·bats·birds·bubbles·clouds·crows·eagles
//     embers·fog·hail·rain·rats·snow·snowstorm·spiders·stars
//   - 7 free filter types:  bloom·color·fog·lightning·oldfilm·predator·underwater
//   - 24 free presets: acid-rain through wildfire-smoke (see FREE_PRESET_NAMES in schemas)
//   Plus-only particle/filter TYPES are rejected at the Zod schema level (enum guards them out).
//   PRESET names accept a free string (ADR-020 — so Gambit-fork/classic presets pass); an unknown
//   preset is rejected by the FXMaster API at play time, not the Zod schema.
//
// Envelope contract: { success: true, data } | { success: false, error } — NEVER throw for
//   expected failures (DP-15 / Discipline rule 2).
//
// Notify contract (Discipline rule 3):
//   - All write operations call notify.updated('scene', sceneName, { summary }) AFTER
//     the write succeeds. clear-effects calls notify.deleted. Reads get NO notify.
//
// Post-write verify (Discipline rule 6):
//   - Flag-persisted writes re-read canvas.scene.getFlag('fxmaster', ...) and include
//     the verified state in the return payload where practical.
//
// Region behaviors (set-region-particles / set-region-filters / suppress-*):
//   - Operations on Foundry Region documents via game.scenes / region.createEmbeddedDocuments.
//   - Uses fxmaster RegionBehavior types registered in module.json documentTypes.
//
// Anchors:
//   - fxmaster audit.md §New API Surface (FXMASTER.api) — Full Method Index
//   - fxmaster audit.md §RegionBehavior Types
//   - scene-atmosphere dossier §4A API Surface
//   - capability-manifest.json action names (mcp_action = module-scene-atmosphere.<action>)

import { notify } from '../../../notify.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import type { ModuleSceneAtmosphereInputType } from '@foundry-mcp/shared';
import { Envelope, getGame, getCanvas } from '../_shared/handler-utils.js';

function getCanvasOrThrow(): any {
  const c = getCanvas();
  if (!c?.scene) {
    throw new Error('CANVAS_UNAVAILABLE: canvas.scene not available');
  }
  return c;
}


// ── FXMASTER API accessor ─────────────────────────────────────────────────────

function getFXMASTER(): any {
  const fx = (globalThis as any).FXMASTER;
  if (!fx?.api) {
    throw new Error('FXMASTER_API_UNAVAILABLE: window.FXMASTER.api not bound (module may not be fully initialised)');
  }
  return fx;
}

function getSceneName(): string {
  try {
    return (globalThis as any).canvas?.scene?.name ?? 'current scene';
  } catch {
    return 'current scene';
  }
}

// ── Type aliases (extracted from the union) ──────────────────────────────────

type PlayPresetInput         = Extract<ModuleSceneAtmosphereInputType, { action: 'play-preset' }>;
type StopPresetInput         = Extract<ModuleSceneAtmosphereInputType, { action: 'stop-preset' }>;
type TogglePresetInput       = Extract<ModuleSceneAtmosphereInputType, { action: 'toggle-preset' }>;
type SwitchPresetInput       = Extract<ModuleSceneAtmosphereInputType, { action: 'switch-preset' }>;
type ListPresetsInput        = Extract<ModuleSceneAtmosphereInputType, { action: 'list-presets' }>;
type ListActivePresetsInput  = Extract<ModuleSceneAtmosphereInputType, { action: 'list-active-presets' }>;
type ListValidPresetsInput   = Extract<ModuleSceneAtmosphereInputType, { action: 'list-valid-presets' }>;
type PlayParticlesInput      = Extract<ModuleSceneAtmosphereInputType, { action: 'play-particles' }>;
type PlayFiltersInput        = Extract<ModuleSceneAtmosphereInputType, { action: 'play-filters' }>;
type StopEffectsInput        = Extract<ModuleSceneAtmosphereInputType, { action: 'stop-effects' }>;
type ToggleEffectsInput      = Extract<ModuleSceneAtmosphereInputType, { action: 'toggle-effects' }>;
type ClearEffectsInput       = Extract<ModuleSceneAtmosphereInputType, { action: 'clear-effects' }>;
type SetEnabledInput         = Extract<ModuleSceneAtmosphereInputType, { action: 'set-enabled' }>;
type SetRegionParticlesInput = Extract<ModuleSceneAtmosphereInputType, { action: 'set-region-particles' }>;
type SetRegionFiltersInput   = Extract<ModuleSceneAtmosphereInputType, { action: 'set-region-filters' }>;
type SuppressSceneParticlesInput = Extract<ModuleSceneAtmosphereInputType, { action: 'suppress-scene-particles' }>;
type SuppressSceneFiltersInput   = Extract<ModuleSceneAtmosphereInputType, { action: 'suppress-scene-filters' }>;

// ── Preset ops ────────────────────────────────────────────────────────────────

export async function handlePlayPreset(input: PlayPresetInput): Promise<Envelope<unknown>> {
  try {
    const FXMASTER = getFXMASTER();
    const opts = input.options ?? {};
    await FXMASTER.api.presets.play(input.preset, opts);
    const sceneName = getSceneName();
    notify.updated('scene', sceneName, { summary: `fxmaster play-preset: ${input.preset}` });
    // Post-write verify: read active presets
    const active = FXMASTER.api.presets.listActive({ scene: opts.scene }) ?? [];
    return {
      success: true,
      data: {
        preset: input.preset,
        options: opts,
        activePresets: Array.isArray(active) ? active : [...active],
      },
    };
  } catch (e) {
    return { success: false, error: `FXMASTER_PLAY_PRESET_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function handleStopPreset(input: StopPresetInput): Promise<Envelope<unknown>> {
  try {
    const FXMASTER = getFXMASTER();
    const stopOpts: Record<string, unknown> = {};
    if (input.scene) stopOpts.scene = input.scene;
    await FXMASTER.api.presets.stop(input.preset, stopOpts);
    const sceneName = getSceneName();
    notify.updated('scene', sceneName, { summary: `fxmaster stop-preset: ${input.preset}` });
    const active = FXMASTER.api.presets.listActive(stopOpts) ?? [];
    return {
      success: true,
      data: {
        preset: input.preset,
        stopped: true,
        activePresets: Array.isArray(active) ? active : [...active],
      },
    };
  } catch (e) {
    return { success: false, error: `FXMASTER_STOP_PRESET_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function handleTogglePreset(input: TogglePresetInput): Promise<Envelope<unknown>> {
  try {
    const FXMASTER = getFXMASTER();
    const opts = input.options ?? {};
    await FXMASTER.api.presets.toggle(input.preset, opts);
    const sceneName = getSceneName();
    notify.updated('scene', sceneName, { summary: `fxmaster toggle-preset: ${input.preset}` });
    const active = FXMASTER.api.presets.listActive({ scene: (opts as any).scene }) ?? [];
    return {
      success: true,
      data: {
        preset: input.preset,
        toggled: true,
        activePresets: Array.isArray(active) ? active : [...active],
      },
    };
  } catch (e) {
    return { success: false, error: `FXMASTER_TOGGLE_PRESET_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function handleSwitchPreset(input: SwitchPresetInput): Promise<Envelope<unknown>> {
  try {
    const FXMASTER = getFXMASTER();
    const opts = input.options ?? {};
    // switch(null) stops all active API presets (documented in audit §Switch preset by name).
    // Omitting preset (undefined) is the stop-all path too — coalesce to null for the API.
    await FXMASTER.api.presets.switch(input.preset ?? null, opts);
    const sceneName = getSceneName();
    const summary = input.preset
      ? `fxmaster switch-preset: → ${input.preset}`
      : 'fxmaster switch-preset: stopped all';
    notify.updated('scene', sceneName, { summary });
    const active = FXMASTER.api.presets.listActive({ scene: (opts as any).scene }) ?? [];
    return {
      success: true,
      data: {
        preset: input.preset,
        switched: true,
        activePresets: Array.isArray(active) ? active : [...active],
      },
    };
  } catch (e) {
    return { success: false, error: `FXMASTER_SWITCH_PRESET_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Preset reads (no notify) ──────────────────────────────────────────────────

export async function handleListPresets(_input: ListPresetsInput): Promise<Envelope<unknown>> {
  try {
    const FXMASTER = getFXMASTER();
    const all = FXMASTER.api.presets.list() ?? [];
    const hasPlusRaw = FXMASTER.api.presets.hasFxmasterPlus?.();
    const hasFxmaster = FXMASTER.api.presets.hasFxmaster?.();
    return {
      success: true,
      data: {
        presets: Array.isArray(all) ? all : [...all],
        count: Array.isArray(all) ? all.length : 0,
        hasFxmasterPlus: Boolean(hasPlusRaw),
        hasFxmaster: Boolean(hasFxmaster),
        note: 'list() returns all registered presets including plus-only. Use list-valid-presets to filter to what\'s playable.',
      },
    };
  } catch (e) {
    return { success: false, error: `FXMASTER_LIST_PRESETS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function handleListActivePresets(input: ListActivePresetsInput): Promise<Envelope<unknown>> {
  try {
    const FXMASTER = getFXMASTER();
    const opts: Record<string, unknown> = {};
    if (input.scene) opts.scene = input.scene;
    const active = FXMASTER.api.presets.listActive(opts) ?? [];
    return {
      success: true,
      data: {
        presets: Array.isArray(active) ? active : [...active],
        count: Array.isArray(active) ? active.length : 0,
        scene: input.scene ?? null,
      },
    };
  } catch (e) {
    return { success: false, error: `FXMASTER_LIST_ACTIVE_PRESETS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function handleListValidPresets(input: ListValidPresetsInput): Promise<Envelope<unknown>> {
  try {
    const FXMASTER = getFXMASTER();
    const opts: Record<string, unknown> = {};
    if (input.topDown !== undefined) opts.topDown = input.topDown;
    const valid = FXMASTER.api.presets.listValid(opts) ?? new Set();
    const asArray = valid instanceof Set ? [...valid] : Array.isArray(valid) ? valid : [...(valid as any)];
    return {
      success: true,
      data: {
        presets: asArray,
        count: asArray.length,
        topDown: input.topDown ?? false,
        note: 'Plus-only presets excluded when fxmaster-plus is not installed.',
      },
    };
  } catch (e) {
    return { success: false, error: `FXMASTER_LIST_VALID_PRESETS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Raw effect ops ────────────────────────────────────────────────────────────

export async function handlePlayParticles(input: PlayParticlesInput): Promise<Envelope<unknown>> {
  try {
    const FXMASTER = getFXMASTER();
    const playArgs: Record<string, unknown> = {
      particles: input.particles,
    };
    if (input.scene) playArgs.scene = input.scene;
    if (input.skipFading !== undefined) playArgs.skipFading = input.skipFading;
    if (input.apiToggleKey) playArgs.apiToggleKey = input.apiToggleKey;

    const ids = await FXMASTER.api.effects.play(playArgs);
    const sceneName = getSceneName();
    notify.updated('scene', sceneName, {
      summary: `fxmaster play-particles: ${input.particles.map((p: any) => p.type).join(', ')}`,
    });
    // Post-write verify: re-read effects flag
    let verifiedEffects: unknown = null;
    try {
      verifiedEffects = getCanvasOrThrow().scene.getFlag('fxmaster', 'effects');
    } catch {
      // canvas may not be current scene; skip verification
    }
    return {
      success: true,
      data: {
        ids: ids ?? {},
        particleCount: input.particles.length,
        types: input.particles.map((p: any) => p.type),
        verifiedEffectsFlag: verifiedEffects,
      },
    };
  } catch (e) {
    return { success: false, error: `FXMASTER_PLAY_PARTICLES_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function handlePlayFilters(input: PlayFiltersInput): Promise<Envelope<unknown>> {
  try {
    const FXMASTER = getFXMASTER();
    const playArgs: Record<string, unknown> = {
      filters: input.filters,
    };
    if (input.scene) playArgs.scene = input.scene;
    if (input.skipFading !== undefined) playArgs.skipFading = input.skipFading;
    if (input.apiToggleKey) playArgs.apiToggleKey = input.apiToggleKey;

    const ids = await FXMASTER.api.effects.play(playArgs);
    const sceneName = getSceneName();
    notify.updated('scene', sceneName, {
      summary: `fxmaster play-filters: ${input.filters.map((f: any) => f.type).join(', ')}`,
    });
    let verifiedFilters: unknown = null;
    try {
      verifiedFilters = getCanvasOrThrow().scene.getFlag('fxmaster', 'filters');
    } catch {
      // skip
    }
    return {
      success: true,
      data: {
        ids: ids ?? {},
        filterCount: input.filters.length,
        types: input.filters.map((f: any) => f.type),
        verifiedFiltersFlag: verifiedFilters,
      },
    };
  } catch (e) {
    return { success: false, error: `FXMASTER_PLAY_FILTERS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function handleStopEffects(input: StopEffectsInput): Promise<Envelope<unknown>> {
  try {
    const FXMASTER = getFXMASTER();
    const stopArgs: Record<string, unknown> = {};
    if (input.particles?.length) stopArgs.particles = input.particles;
    if (input.filters?.length) stopArgs.filters = input.filters;
    if (input.effects?.length) stopArgs.effects = input.effects;
    if (input.scene) stopArgs.scene = input.scene;
    if (input.skipFading !== undefined) stopArgs.skipFading = input.skipFading;

    await FXMASTER.api.effects.stop(stopArgs);
    const sceneName = getSceneName();
    const stoppedCount =
      (input.particles?.length ?? 0) +
      (input.filters?.length ?? 0) +
      (input.effects?.length ?? 0);
    notify.updated('scene', sceneName, {
      summary: `fxmaster stop-effects: ${stoppedCount} effect(s)`,
    });
    return {
      success: true,
      data: {
        stopped: true,
        particles: input.particles ?? [],
        filters: input.filters ?? [],
        effects: input.effects ?? [],
      },
    };
  } catch (e) {
    return { success: false, error: `FXMASTER_STOP_EFFECTS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function handleToggleEffects(input: ToggleEffectsInput): Promise<Envelope<unknown>> {
  try {
    const FXMASTER = getFXMASTER();
    const toggleArgs: Record<string, unknown> = {};
    if (input.particles?.length) toggleArgs.particles = input.particles;
    if (input.filters?.length) toggleArgs.filters = input.filters;
    if (input.effects?.length) toggleArgs.effects = input.effects;
    if (input.toggleKey) toggleArgs.toggleKey = input.toggleKey;
    if (input.scene) toggleArgs.scene = input.scene;
    if (input.skipFading !== undefined) toggleArgs.skipFading = input.skipFading;

    await FXMASTER.api.effects.toggle(toggleArgs);
    const sceneName = getSceneName();
    notify.updated('scene', sceneName, {
      summary: `fxmaster toggle-effects${input.toggleKey ? `: key=${input.toggleKey}` : ''}`,
    });
    return {
      success: true,
      data: {
        toggled: true,
        toggleKey: input.toggleKey ?? null,
        particles: input.particles ?? [],
        filters: input.filters ?? [],
        effects: input.effects ?? [],
      },
    };
  } catch (e) {
    return { success: false, error: `FXMASTER_TOGGLE_EFFECTS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Nuclear clear ─────────────────────────────────────────────────────────────

export async function handleClearEffects(input: ClearEffectsInput): Promise<Envelope<unknown>> {
  // CCR-4 confirm gate
  if (input.confirm !== true) {
    const targetLabel = input.target ?? 'both';
    return {
      success: false,
      error: `CONFIRM_REQUIRED: clear-effects will unsetFlag("fxmaster", "${targetLabel}") on the current scene — irreversible without replaying effects. Re-send with confirm:true.`,
    };
  }

  try {
    const canvas = getCanvasOrThrow();
    const scene = canvas.scene;
    const target = input.target ?? 'both';

    const cleared: string[] = [];

    if (target === 'particles' || target === 'both') {
      await scene.unsetFlag('fxmaster', 'effects');
      cleared.push('effects (particles)');
    }
    if (target === 'filters' || target === 'both') {
      await scene.unsetFlag('fxmaster', 'filters');
      cleared.push('filters');
    }
    if (target === 'stack' || target === 'both') {
      // 'both' is a full FX clear — once particles+filters are gone the stack
      // (their layer-render-order array) is orphaned, so clear it too. This
      // matches FXMaster's own nuclear-clear (effects + filters + stack).
      await scene.unsetFlag('fxmaster', 'stack');
      cleared.push('stack');
    }

    const sceneName = getSceneName();
    notify.deleted('scene', sceneName, { summary: `fxmaster clear-effects: ${cleared.join(', ')}` });

    // Post-write verify: flags should now be null/undefined
    const verifiedEffects = target !== 'filters' && target !== 'stack'
      ? scene.getFlag('fxmaster', 'effects')
      : undefined;
    const verifiedFilters = target !== 'particles' && target !== 'stack'
      ? scene.getFlag('fxmaster', 'filters')
      : undefined;
    const verifiedStack = target === 'stack' || target === 'both'
      ? scene.getFlag('fxmaster', 'stack')
      : undefined;

    return {
      success: true,
      data: {
        cleared,
        target,
        verify: {
          effectsFlag: verifiedEffects ?? null,
          filtersFlag: verifiedFilters ?? null,
          stackFlag: verifiedStack ?? null,
        },
      },
    };
  } catch (e) {
    return { success: false, error: `FXMASTER_CLEAR_EFFECTS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Kill switch ───────────────────────────────────────────────────────────────

export async function handleSetEnabled(input: SetEnabledInput): Promise<Envelope<unknown>> {
  // CCR-4: disableAll:true is SUPPORTED_WITH_CONFIRMATION
  if (input.disableAll === true && input.confirm !== true) {
    return {
      success: false,
      error: 'CONFIRM_REQUIRED: set-enabled with disableAll:true suspends FX rendering world-wide without clearing flags. Flags persist and re-render when re-enabled. Re-send with confirm:true.',
    };
  }

  try {
    const game = getGame();
    await game.settings.set('fxmaster', 'disableAll', input.disableAll);
    const sceneName = getSceneName();
    notify.updated('scene', sceneName, {
      summary: `fxmaster set-enabled: disableAll=${input.disableAll}`,
    });
    // Post-write verify
    const verified = game.settings.get('fxmaster', 'disableAll');
    return {
      success: true,
      data: {
        disableAll: input.disableAll,
        verifiedDisableAll: Boolean(verified),
        note: input.disableAll
          ? 'FX rendering suspended. Flags persist — effects will re-render when re-enabled.'
          : 'FX rendering re-enabled.',
      },
    };
  } catch (e) {
    return { success: false, error: `FXMASTER_SET_ENABLED_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Region behaviors ──────────────────────────────────────────────────────────

/** Resolve a Region document from the current scene by ID. */
function getRegion(regionId: string): any {
  const scene = getCanvasOrThrow().scene;
  const region = scene.regions?.get(regionId);
  if (!region) {
    throw new Error(`REGION_NOT_FOUND: No Region with id "${regionId}" on the current scene "${scene.name ?? scene.id}"`);
  }
  return region;
}

export async function handleSetRegionParticles(input: SetRegionParticlesInput): Promise<Envelope<unknown>> {
  try {
    const region = getRegion(input.regionId);

    // If replace, delete existing particleEffectsRegion behaviors first
    if (input.replace) {
      const existing = region.behaviors?.filter((b: any) => b.type === 'fxmaster.particleEffectsRegion') ?? [];
      if (existing.length > 0) {
        await region.deleteEmbeddedDocuments('RegionBehavior', existing.map((b: any) => b.id));
      }
    }

    const behaviorData: Record<string, unknown> = {
      type: 'fxmaster.particleEffectsRegion',
      name: `Particles: ${input.particleType}`,
      system: {
        type: input.particleType,
        options: input.options ?? {},
      },
    };

    const [created] = await region.createEmbeddedDocuments('RegionBehavior', [behaviorData]);
    // RC1.1b triage (Design Decisions): RegionBehavior is a real structural embedded document,
    // not a cosmetic transient effect — gated per the fxmaster RegionBehavior verify pass.
    if (!created?.id || !region.behaviors?.get(created.id)) {
      return { success: false, error: `${ErrorTokens.FXMASTER_REGION_BEHAVIOR_NOT_PERSISTED}: particleEffectsRegion behavior absent from region ${input.regionId} after create` };
    }
    const sceneName = getSceneName();
    notify.updated('scene', sceneName, {
      summary: `fxmaster set-region-particles: region=${input.regionId} type=${input.particleType}`,
    });
    return {
      success: true,
      data: {
        regionId: input.regionId,
        behaviorId: created?.id ?? null,
        behaviorType: 'fxmaster.particleEffectsRegion',
        particleType: input.particleType,
        replaced: Boolean(input.replace),
      },
    };
  } catch (e) {
    return { success: false, error: `FXMASTER_SET_REGION_PARTICLES_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function handleSetRegionFilters(input: SetRegionFiltersInput): Promise<Envelope<unknown>> {
  try {
    const region = getRegion(input.regionId);

    if (input.replace) {
      const existing = region.behaviors?.filter((b: any) => b.type === 'fxmaster.filterEffectsRegion') ?? [];
      if (existing.length > 0) {
        await region.deleteEmbeddedDocuments('RegionBehavior', existing.map((b: any) => b.id));
      }
    }

    const behaviorData: Record<string, unknown> = {
      type: 'fxmaster.filterEffectsRegion',
      name: `Filter: ${input.filterType}`,
      system: {
        type: input.filterType,
        options: input.options ?? {},
      },
    };

    const [created] = await region.createEmbeddedDocuments('RegionBehavior', [behaviorData]);
    if (!created?.id || !region.behaviors?.get(created.id)) {
      return { success: false, error: `${ErrorTokens.FXMASTER_REGION_BEHAVIOR_NOT_PERSISTED}: filterEffectsRegion behavior absent from region ${input.regionId} after create` };
    }
    const sceneName = getSceneName();
    notify.updated('scene', sceneName, {
      summary: `fxmaster set-region-filters: region=${input.regionId} type=${input.filterType}`,
    });
    return {
      success: true,
      data: {
        regionId: input.regionId,
        behaviorId: created?.id ?? null,
        behaviorType: 'fxmaster.filterEffectsRegion',
        filterType: input.filterType,
        replaced: Boolean(input.replace),
      },
    };
  } catch (e) {
    return { success: false, error: `FXMASTER_SET_REGION_FILTERS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function handleSuppressSceneParticles(input: SuppressSceneParticlesInput): Promise<Envelope<unknown>> {
  try {
    const region = getRegion(input.regionId);

    if (input.remove) {
      const existing = region.behaviors?.filter((b: any) => b.type === 'fxmaster.suppressSceneParticles') ?? [];
      if (existing.length === 0) {
        return {
          success: false,
          error: `BEHAVIOR_NOT_FOUND: No fxmaster.suppressSceneParticles behavior on region "${input.regionId}"`,
        };
      }
      await region.deleteEmbeddedDocuments('RegionBehavior', existing.map((b: any) => b.id));
      const sceneName = getSceneName();
      notify.updated('scene', sceneName, {
        summary: `fxmaster suppress-scene-particles removed: region=${input.regionId}`,
      });
      return {
        success: true,
        data: {
          regionId: input.regionId,
          removed: true,
          behaviorType: 'fxmaster.suppressSceneParticles',
        },
      };
    }

    // Add suppression behavior
    const [created] = await region.createEmbeddedDocuments('RegionBehavior', [{
      type: 'fxmaster.suppressSceneParticles',
      name: 'Suppress Scene Particles',
    }]);
    if (!created?.id || !region.behaviors?.get(created.id)) {
      return { success: false, error: `${ErrorTokens.FXMASTER_REGION_BEHAVIOR_NOT_PERSISTED}: suppressSceneParticles behavior absent from region ${input.regionId} after create` };
    }
    const sceneName = getSceneName();
    notify.updated('scene', sceneName, {
      summary: `fxmaster suppress-scene-particles added: region=${input.regionId}`,
    });
    return {
      success: true,
      data: {
        regionId: input.regionId,
        behaviorId: created?.id ?? null,
        behaviorType: 'fxmaster.suppressSceneParticles',
        removed: false,
      },
    };
  } catch (e) {
    return { success: false, error: `FXMASTER_SUPPRESS_SCENE_PARTICLES_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function handleSuppressSceneFilters(input: SuppressSceneFiltersInput): Promise<Envelope<unknown>> {
  try {
    const region = getRegion(input.regionId);

    if (input.remove) {
      const existing = region.behaviors?.filter((b: any) => b.type === 'fxmaster.suppressSceneFilters') ?? [];
      if (existing.length === 0) {
        return {
          success: false,
          error: `BEHAVIOR_NOT_FOUND: No fxmaster.suppressSceneFilters behavior on region "${input.regionId}"`,
        };
      }
      await region.deleteEmbeddedDocuments('RegionBehavior', existing.map((b: any) => b.id));
      const sceneName = getSceneName();
      notify.updated('scene', sceneName, {
        summary: `fxmaster suppress-scene-filters removed: region=${input.regionId}`,
      });
      return {
        success: true,
        data: {
          regionId: input.regionId,
          removed: true,
          behaviorType: 'fxmaster.suppressSceneFilters',
        },
      };
    }

    const [created] = await region.createEmbeddedDocuments('RegionBehavior', [{
      type: 'fxmaster.suppressSceneFilters',
      name: 'Suppress Scene Filters',
    }]);
    if (!created?.id || !region.behaviors?.get(created.id)) {
      return { success: false, error: `${ErrorTokens.FXMASTER_REGION_BEHAVIOR_NOT_PERSISTED}: suppressSceneFilters behavior absent from region ${input.regionId} after create` };
    }
    const sceneName = getSceneName();
    notify.updated('scene', sceneName, {
      summary: `fxmaster suppress-scene-filters added: region=${input.regionId}`,
    });
    return {
      success: true,
      data: {
        regionId: input.regionId,
        behaviorId: created?.id ?? null,
        behaviorType: 'fxmaster.suppressSceneFilters',
        removed: false,
      },
    };
  } catch (e) {
    return { success: false, error: `FXMASTER_SUPPRESS_SCENE_FILTERS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}
