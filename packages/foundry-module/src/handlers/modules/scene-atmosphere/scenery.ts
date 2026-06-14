// Module Integration v1 Phase 6B — scenery action handlers.
//
// All handlers call game.*/scene.setFlag/getFlag directly (handlers run inside Foundry
// via CONFIG.queries — no macro-execute bridge needed).
//
// Data model: scene.flags.scenery.data = { activeVariationIndex, variations[] }
// Each variation: { name, gmBackground, plBackground, sceneData? }
//
// Default variation rules (CRITICAL):
//   - variations[0] is always the Default; cannot be deleted.
//   - variations[0].plBackground is locked to scene.background.src; never write a different value.
//   - variations[0].gmBackground is freely editable (GM-only overlay).
//
// Legacy v1 data migration:
//   Detection: flags.scenery.data has `bg` key but no `activeVariationIndex`.
//   Shape: { bg, gm, pl, defaultSceneData?, variations:[{name,file,sceneData?}] }
//   Handler migrates in-memory then writes back the v2 shape on any write operation.
//
// Element-restore-skip limitation (document here + surface in response):
//   A raw flag write (setFlag) skips the automatic live-canvas element snapshot of the
//   OUTGOING variation. Clients still restore the INCOMING variation's sceneData (if any).
//   For pre-authored variation workflows this is acceptable. Document this to callers.
//
// Notify contract:
//   - set-active-variation, add-variation, delete-variation, set-variation-backgrounds,
//     reset-variation-scene-data: notify.updated('scene', sceneName, { summary }) after success.
//   - list-variations, get-active-variation, check-module-active, read-settings: silent.
//
// Post-write verify (DP-16):
//   After every write, re-read flags.scenery.data and include the verified activeVariationIndex
//   and variations count in the response payload.
//
// Anchors:
//   - scenery/audit.md §2 + §3 + §7 + §8 + §15
//   - scenery/capability-manifest.json
//   - CCR-4 confirm gate on add/delete/set-backgrounds/reset-scenedata

import { notify } from '../../../notify.js';
import type { ModuleSceneAtmosphereInputType } from './schemas.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

// ── API accessors ─────────────────────────────────────────────────────────────

function getGame(): any {
  return (globalThis as any).game;
}

function getCanvas(): any {
  return (globalThis as any).canvas;
}

// ── Scene resolution ──────────────────────────────────────────────────────────

function resolveScene(sceneId?: string): any {
  const game = getGame();
  if (!sceneId) {
    const c = getCanvas();
    const scene = c?.scene;
    if (!scene) throw new Error('CANVAS_UNAVAILABLE: No active canvas scene; provide sceneId explicitly.');
    return scene;
  }
  // Try direct ID lookup first, then UUID
  const byId = game?.scenes?.get?.(sceneId);
  if (byId) return byId;
  // fromUuid for UUID strings
  const fromUuid = game?.scenes?.find?.((s: any) => s.uuid === sceneId);
  if (fromUuid) return fromUuid;
  throw new Error(`SCENE_NOT_FOUND: No scene with id/UUID "${sceneId}"`);
}

// ── Scenery data helpers ──────────────────────────────────────────────────────

interface SceneryVariation {
  name: string;
  gmBackground: string;
  plBackground: string;
  sceneData?: Record<string, unknown[]>;
}

interface SceneryData {
  activeVariationIndex: number;
  variations: SceneryVariation[];
}

/**
 * Read flags.scenery.data from a scene, migrating v1 legacy data if detected.
 * Returns null if no scenery data is configured.
 */
function getSceneryData(scene: any): SceneryData | null {
  const raw = scene.flags?.scenery?.data;
  if (!raw) return null;

  // Detect v1 legacy data: has 'bg' key but not 'activeVariationIndex'
  if ('bg' in raw && !('activeVariationIndex' in raw)) {
    return migrateLegacyData(raw, scene);
  }

  return raw as SceneryData;
}

/**
 * Migrate v1 legacy scenery data to v2 shape.
 * v1 shape: { bg, gm, pl, defaultSceneData?, variations:[{name,file,sceneData?}] }
 * v2 shape: { activeVariationIndex, variations:[{name,gmBackground,plBackground,sceneData?}] }
 */
function migrateLegacyData(raw: any, scene: any): SceneryData {
  const defaultPlBackground = scene.background?.src ?? raw.bg ?? '';
  const defaultVariation: SceneryVariation = {
    name: 'Default',
    gmBackground: raw.gm || raw.bg || defaultPlBackground,
    plBackground: defaultPlBackground,
    sceneData: raw.defaultSceneData,
  };

  const legacyVariations: SceneryVariation[] = Array.isArray(raw.variations)
    ? raw.variations.map((v: any) => ({
        name: v.name ?? 'Variation',
        gmBackground: v.file ?? '',
        plBackground: v.file ?? '',
        sceneData: v.sceneData,
      }))
    : [];

  return {
    activeVariationIndex: 0,
    variations: [defaultVariation, ...legacyVariations],
  };
}

/**
 * Find a variation by index or name. Returns { index, variation } or throws.
 */
function findVariation(
  data: SceneryData,
  variationIndex?: number,
  variationName?: string,
): { index: number; variation: SceneryVariation } {
  if (variationIndex !== undefined) {
    if (variationIndex < 0 || variationIndex >= data.variations.length) {
      throw new Error(`VARIATION_NOT_FOUND: Index ${variationIndex} out of range (have ${data.variations.length} variations)`);
    }
    return { index: variationIndex, variation: data.variations[variationIndex]! };
  }
  if (variationName !== undefined) {
    const idx = data.variations.findIndex((v) => v.name === variationName);
    if (idx < 0) {
      const names = data.variations.map((v) => `"${v.name}"`).join(', ');
      throw new Error(`VARIATION_NOT_FOUND: No variation named "${variationName}". Available: ${names}`);
    }
    return { index: idx, variation: data.variations[idx]! };
  }
  throw new Error('VARIATION_TARGET_REQUIRED: Provide variationIndex or variationName');
}

// ── Type aliases ──────────────────────────────────────────────────────────────

type ListVariationsInput = Extract<ModuleSceneAtmosphereInputType, { action: 'list-variations' }>;
type GetActiveVariationInput = Extract<ModuleSceneAtmosphereInputType, { action: 'get-active-variation' }>;
type SetActiveVariationInput = Extract<ModuleSceneAtmosphereInputType, { action: 'set-active-variation' }>;
type AddVariationInput = Extract<ModuleSceneAtmosphereInputType, { action: 'add-variation' }>;
type DeleteVariationInput = Extract<ModuleSceneAtmosphereInputType, { action: 'delete-variation' }>;
type SetVariationBackgroundsInput = Extract<ModuleSceneAtmosphereInputType, { action: 'set-variation-backgrounds' }>;
type ResetVariationSceneDataInput = Extract<ModuleSceneAtmosphereInputType, { action: 'reset-variation-scene-data' }>;
type CheckSceneryModuleActiveInput = Extract<ModuleSceneAtmosphereInputType, { action: 'check-scenery-module-active' }>;
type ReadScenerySettingsInput = Extract<ModuleSceneAtmosphereInputType, { action: 'read-scenery-settings' }>;

// ── list-variations ───────────────────────────────────────────────────────────

export async function handleListVariations(input: ListVariationsInput): Promise<Envelope<unknown>> {
  try {
    const scene = resolveScene(input.sceneId);
    const data = getSceneryData(scene);

    if (!data) {
      return {
        success: true,
        data: {
          sceneId: scene.id,
          sceneName: scene.name ?? scene.id,
          hasScenery: false,
          activeVariationIndex: 0,
          variations: [],
          count: 0,
        },
      };
    }

    const variations = data.variations.map((v, idx) => ({
      index: idx,
      name: v.name,
      gmBackground: v.gmBackground,
      plBackground: v.plBackground,
      isActive: idx === data.activeVariationIndex,
      hasSceneData: Boolean(v.sceneData && Object.keys(v.sceneData).length > 0),
    }));

    return {
      success: true,
      data: {
        sceneId: scene.id,
        sceneName: scene.name ?? scene.id,
        hasScenery: true,
        activeVariationIndex: data.activeVariationIndex,
        variations,
        count: variations.length,
      },
    };
  } catch (e) {
    return { success: false, error: `LIST_VARIATIONS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── get-active-variation ──────────────────────────────────────────────────────

export async function handleGetActiveVariation(input: GetActiveVariationInput): Promise<Envelope<unknown>> {
  try {
    const scene = resolveScene(input.sceneId);
    const data = getSceneryData(scene);

    if (!data || data.variations.length === 0) {
      return {
        success: true,
        data: {
          sceneId: scene.id,
          sceneName: scene.name ?? scene.id,
          hasScenery: false,
          activeVariationIndex: 0,
          activeVariation: null,
        },
      };
    }

    const activeIdx = Math.min(data.activeVariationIndex, data.variations.length - 1);
    const v = data.variations[activeIdx]!;

    return {
      success: true,
      data: {
        sceneId: scene.id,
        sceneName: scene.name ?? scene.id,
        hasScenery: true,
        activeVariationIndex: activeIdx,
        activeVariation: {
          name: v.name,
          gmBackground: v.gmBackground,
          plBackground: v.plBackground,
          hasSceneData: Boolean(v.sceneData && Object.keys(v.sceneData).length > 0),
        },
      },
    };
  } catch (e) {
    return { success: false, error: `GET_ACTIVE_VARIATION_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── set-active-variation ──────────────────────────────────────────────────────

export async function handleSetActiveVariation(input: SetActiveVariationInput): Promise<Envelope<unknown>> {
  try {
    if (input.variationIndex === undefined && input.variationName === undefined) {
      return { success: false, error: 'SET_ACTIVE_VARIATION_ERROR: Provide variationIndex or variationName' };
    }

    const scene = resolveScene(input.sceneId);
    const data = getSceneryData(scene);

    if (!data || data.variations.length === 0) {
      return { success: false, error: 'SET_ACTIVE_VARIATION_ERROR: Scene has no scenery data configured' };
    }

    const { index: targetIndex, variation: targetVariation } = findVariation(
      data,
      input.variationIndex,
      input.variationName,
    );

    // Write the updated data with the new active index
    const newData: SceneryData = { ...data, activeVariationIndex: targetIndex };
    await scene.setFlag('scenery', 'data', newData);

    // Post-write verify
    const verifiedData = getSceneryData(scene);
    const verifiedIndex = verifiedData?.activeVariationIndex ?? null;

    const sceneName = scene.name ?? scene.id;
    notify.updated('scene', sceneName, {
      summary: `set-active-variation: switched to "${targetVariation.name}" (index ${targetIndex}); element-restore-skip applies`,
    });

    return {
      success: true,
      data: {
        sceneId: scene.id,
        sceneName,
        previousIndex: data.activeVariationIndex,
        newActiveIndex: targetIndex,
        newVariationName: targetVariation.name,
        gmBackground: targetVariation.gmBackground,
        plBackground: targetVariation.plBackground,
        hasSceneData: Boolean(targetVariation.sceneData && Object.keys(targetVariation.sceneData).length > 0),
        verifiedActiveIndex: verifiedIndex,
        elementRestoreSkipNote: 'MCP flag write skips automatic outgoing-variation snapshot. Incoming sceneData (if any) is restored by the module on clients. See audit §3.',
      },
    };
  } catch (e) {
    return { success: false, error: `SET_ACTIVE_VARIATION_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── add-variation ─────────────────────────────────────────────────────────────

export async function handleAddVariation(input: AddVariationInput): Promise<Envelope<unknown>> {
  try {
    const scene = resolveScene(input.sceneId);

    // Determine plBackground default
    const plBackground = input.plBackground ?? scene.background?.src ?? '';

    // Read existing data (create empty if none)
    const existingData = getSceneryData(scene);
    const data: SceneryData = existingData ?? {
      activeVariationIndex: 0,
      variations: [{
        name: 'Default',
        gmBackground: scene.background?.src ?? '',
        plBackground: scene.background?.src ?? '',
      }],
    };

    // Append new variation
    const newVariation: SceneryVariation = {
      name: input.name,
      gmBackground: input.gmBackground,
      plBackground,
    };
    const newData: SceneryData = {
      ...data,
      variations: [...data.variations, newVariation],
    };

    await scene.setFlag('scenery', 'data', newData);

    // Post-write verify
    const verifiedData = getSceneryData(scene);
    const verifiedCount = verifiedData?.variations.length ?? null;
    const newIndex = newData.variations.length - 1;

    const sceneName = scene.name ?? scene.id;
    notify.updated('scene', sceneName, {
      summary: `add-variation: added "${input.name}" (index ${newIndex})`,
    });

    return {
      success: true,
      data: {
        sceneId: scene.id,
        sceneName,
        addedVariationName: input.name,
        addedVariationIndex: newIndex,
        gmBackground: input.gmBackground,
        plBackground,
        totalVariationsCount: newData.variations.length,
        verifiedTotalCount: verifiedCount,
      },
    };
  } catch (e) {
    return { success: false, error: `ADD_VARIATION_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── delete-variation ──────────────────────────────────────────────────────────

export async function handleDeleteVariation(input: DeleteVariationInput): Promise<Envelope<unknown>> {
  try {
    if (input.variationIndex === undefined && input.variationName === undefined) {
      return { success: false, error: 'DELETE_VARIATION_ERROR: Provide variationIndex or variationName' };
    }

    const scene = resolveScene(input.sceneId);
    const data = getSceneryData(scene);

    if (!data || data.variations.length === 0) {
      return { success: false, error: 'DELETE_VARIATION_ERROR: Scene has no scenery data configured' };
    }

    const { index: targetIndex, variation: targetVariation } = findVariation(
      data,
      input.variationIndex,
      input.variationName,
    );

    // GUARD: Cannot delete Default (index 0)
    if (targetIndex === 0) {
      return {
        success: false,
        error: `DELETE_VARIATION_ERROR: Cannot delete the Default variation (index 0). Scenery always requires at least the Default variation.`,
      };
    }

    // Build new variations array without the deleted entry
    const newVariations = data.variations.filter((_, idx) => idx !== targetIndex);

    // Adjust activeVariationIndex if needed
    let newActiveIndex = data.activeVariationIndex;
    if (data.activeVariationIndex === targetIndex) {
      newActiveIndex = 0; // reset to Default
    } else if (data.activeVariationIndex > targetIndex) {
      newActiveIndex = data.activeVariationIndex - 1; // shift down
    }

    const newData: SceneryData = {
      activeVariationIndex: newActiveIndex,
      variations: newVariations,
    };

    await scene.setFlag('scenery', 'data', newData);

    // Post-write verify
    const verifiedData = getSceneryData(scene);
    const verifiedCount = verifiedData?.variations.length ?? null;

    const sceneName = scene.name ?? scene.id;
    notify.deleted('scene', sceneName, {
      summary: `delete-variation: removed "${targetVariation.name}" (was index ${targetIndex}); active reset to ${newActiveIndex}`,
    });

    return {
      success: true,
      data: {
        sceneId: scene.id,
        sceneName,
        deletedVariationName: targetVariation.name,
        deletedIndex: targetIndex,
        newActiveVariationIndex: newActiveIndex,
        remainingVariationsCount: newVariations.length,
        verifiedTotalCount: verifiedCount,
      },
    };
  } catch (e) {
    return { success: false, error: `DELETE_VARIATION_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── set-variation-backgrounds ─────────────────────────────────────────────────

export async function handleSetVariationBackgrounds(input: SetVariationBackgroundsInput): Promise<Envelope<unknown>> {
  try {
    if (input.variationIndex === undefined && input.variationName === undefined) {
      return { success: false, error: 'SET_VARIATION_BACKGROUNDS_ERROR: Provide variationIndex or variationName' };
    }
    if (input.gmBackground === undefined && input.plBackground === undefined) {
      return { success: false, error: 'SET_VARIATION_BACKGROUNDS_ERROR: Provide at least one of gmBackground or plBackground' };
    }

    const scene = resolveScene(input.sceneId);
    const data = getSceneryData(scene);

    if (!data || data.variations.length === 0) {
      return { success: false, error: 'SET_VARIATION_BACKGROUNDS_ERROR: Scene has no scenery data configured' };
    }

    const { index: targetIndex, variation: targetVariation } = findVariation(
      data,
      input.variationIndex,
      input.variationName,
    );

    // Build updated variation
    const updatedVariation: SceneryVariation = { ...targetVariation };

    if (input.gmBackground !== undefined) {
      updatedVariation.gmBackground = input.gmBackground;
    }

    let plBackgroundNote: string | null = null;
    if (input.plBackground !== undefined) {
      if (targetIndex === 0) {
        // Default variation: plBackground is locked to scene.background.src — ignore and warn
        plBackgroundNote = `plBackground ignored for Default (index 0) — it is locked to scene.background.src="${scene.background?.src ?? ''}". Only gmBackground is editable on the Default.`;
      } else {
        updatedVariation.plBackground = input.plBackground;
      }
    }

    const newVariations = [...data.variations];
    newVariations[targetIndex] = updatedVariation;
    const newData: SceneryData = { ...data, variations: newVariations };

    await scene.setFlag('scenery', 'data', newData);

    // Post-write verify
    const verifiedData = getSceneryData(scene);
    const verifiedVariation = verifiedData?.variations[targetIndex];

    const sceneName = scene.name ?? scene.id;
    notify.updated('scene', sceneName, {
      summary: `set-variation-backgrounds: updated "${targetVariation.name}" (index ${targetIndex})`,
    });

    return {
      success: true,
      data: {
        sceneId: scene.id,
        sceneName,
        variationIndex: targetIndex,
        variationName: targetVariation.name,
        gmBackground: updatedVariation.gmBackground,
        plBackground: updatedVariation.plBackground,
        verifiedGmBackground: verifiedVariation?.gmBackground ?? null,
        verifiedPlBackground: verifiedVariation?.plBackground ?? null,
        plBackgroundNote,
      },
    };
  } catch (e) {
    return { success: false, error: `SET_VARIATION_BACKGROUNDS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── reset-variation-scene-data ────────────────────────────────────────────────

export async function handleResetVariationSceneData(input: ResetVariationSceneDataInput): Promise<Envelope<unknown>> {
  try {
    if (input.variationIndex === undefined && input.variationName === undefined) {
      return { success: false, error: 'RESET_VARIATION_SCENE_DATA_ERROR: Provide variationIndex or variationName' };
    }

    const scene = resolveScene(input.sceneId);
    const data = getSceneryData(scene);

    if (!data || data.variations.length === 0) {
      return { success: false, error: 'RESET_VARIATION_SCENE_DATA_ERROR: Scene has no scenery data configured' };
    }

    const { index: targetIndex, variation: targetVariation } = findVariation(
      data,
      input.variationIndex,
      input.variationName,
    );

    const hadSceneData = Boolean(targetVariation.sceneData && Object.keys(targetVariation.sceneData).length > 0);

    // Remove sceneData from the variation
    const updatedVariation: SceneryVariation = {
      name: targetVariation.name,
      gmBackground: targetVariation.gmBackground,
      plBackground: targetVariation.plBackground,
      // sceneData intentionally omitted
    };

    const newVariations = [...data.variations];
    newVariations[targetIndex] = updatedVariation;
    const newData: SceneryData = { ...data, variations: newVariations };

    await scene.setFlag('scenery', 'data', newData);

    // Post-write verify
    const verifiedData = getSceneryData(scene);
    const verifiedVariation = verifiedData?.variations[targetIndex];
    const verifiedHasSceneData = Boolean(
      verifiedVariation?.sceneData && Object.keys(verifiedVariation.sceneData).length > 0
    );

    const sceneName = scene.name ?? scene.id;
    notify.updated('scene', sceneName, {
      summary: `reset-variation-scene-data: cleared sceneData on "${targetVariation.name}" (index ${targetIndex})`,
    });

    return {
      success: true,
      data: {
        sceneId: scene.id,
        sceneName,
        variationIndex: targetIndex,
        variationName: targetVariation.name,
        hadSceneData,
        verifiedHasSceneData,
        note: 'After this reset, switching to this variation will keep current canvas elements unchanged (no element save/restore when sceneData is absent).',
      },
    };
  } catch (e) {
    return { success: false, error: `RESET_VARIATION_SCENE_DATA_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── check-scenery-module-active ───────────────────────────────────────────────

export async function handleCheckSceneryModuleActive(_input: CheckSceneryModuleActiveInput): Promise<Envelope<unknown>> {
  const game = getGame();
  const mod = game?.modules?.get?.('scenery');
  return {
    success: true,
    data: {
      moduleId: 'scenery',
      active: Boolean(mod?.active),
      version: mod?.version ?? null,
      title: mod?.title ?? null,
    },
  };
}

// ── read-scenery-settings ─────────────────────────────────────────────────────

export async function handleReadScenerySettings(_input: ReadScenerySettingsInput): Promise<Envelope<unknown>> {
  const game = getGame();

  const SETTING_KEYS = [
    'debugLogging', 'showHeaderButton', 'showVariationsLabel',
    'globalLights', 'globalSounds', 'globalTiles', 'globalWalls',
    'globalDrawings', 'globalTemplates', 'globalRegions', 'globalNotes',
    'gmMapIdentifiers', 'playerMapIdentifiers',
  ];

  const settings: Record<string, unknown> = {};
  for (const key of SETTING_KEYS) {
    try {
      settings[key] = game?.settings?.get?.('scenery', key) ?? null;
    } catch {
      settings[key] = null;
    }
  }

  return {
    success: true,
    data: {
      moduleId: 'scenery',
      settings,
      globalElementTypes: {
        lights: settings['globalLights'],
        sounds: settings['globalSounds'],
        tiles: settings['globalTiles'],
        walls: settings['globalWalls'],
        drawings: settings['globalDrawings'],
        templates: settings['globalTemplates'],
        regions: settings['globalRegions'],
        notes: settings['globalNotes'],
      },
      note: 'globalXxx=true means that element type is NOT managed per-variation (stays across switch). globalXxx=false means the module saves/restores those elements on variation switch.',
    },
  };
}
