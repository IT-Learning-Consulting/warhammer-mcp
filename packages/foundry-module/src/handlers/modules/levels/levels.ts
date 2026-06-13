// Module Integration v1 Phase 4 — module-levels handler.
//
// 11-action umbrella for the Levels family (levels + wall-height + levelsvolumetrictemplates +
// levels-layer-effects): multi-doc elevation, tile range/behavior flags, wall-height, scene level
// bands, region elevation + stair behaviors, volumetric template depth, bulk grid-distance rescale.
//
// Design constraints (phase4_pre_plan.md; dossier levels.md):
//   - requireModuleActive('levels', ['wall-height']) is the FIRST executable statement — Levels
//     HARD-requires wall-height (CCR-12). RETURNS failure, never throws.
//   - Always write core `elevation`; NEVER flags.levels.rangeBottom (v6-migrated, deleted on migrate).
//   - set-tile-range exposes 7 verified flags; excludeFromChecker excluded; tile bottom = elevation.
//   - Wall flags under the hyphenated `wall-height` namespace.
//   - set-volumetric-template: DEPENDENCY_GATED on levelsvolumetrictemplates; update persists but
//     does NOT re-fire targeting (only the create hook computes) — response says so.
//   - set-region-elevation: nested {elevation:{bottom,top}} + optional RegionHandler stair behavior
//     (createEmbeddedDocuments('RegionBehavior', executeScript)).
//   - rescale-grid-distance: CCR-4 dry-run (affected counts) unless confirm:true.
//   - GM-gated on every write; reads also GM-gated for consistency.
//   - CCR-3: notify.updated/created on every write; DP-16 post-write re-read.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { getEmbeddedOrThrow } from '../../../utils/getEmbeddedOrThrow.js';
import { ModuleLevelsInput, type ModuleLevelsInputType } from './schemas.js';
import { notify } from '../../../notify.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

const FAMILY = ['levels', 'wall-height', 'levelsvolumetrictemplates', 'levels-layer-effects', 'betterroofs'];

// Doc types rescaleGridDistance touches (verified API.js:62) → dry-run count surface.
const RESCALE_COLLECTIONS = ['tiles', 'tokens', 'lights', 'sounds', 'notes', 'walls', 'templates'];

// ── Local helpers ──────────────────────────────────────────────────────────────

function isGM(): boolean {
  return Boolean((globalThis as any).game?.user?.isGM);
}

function moduleActive(id: string): boolean {
  return Boolean((globalThis as any).game?.modules?.get?.(id)?.active);
}

function moduleVersion(id: string): string | null {
  const m = (globalThis as any).game?.modules?.get?.(id);
  return m ? (m.version ?? m.data?.version ?? null) : null;
}

function getScene(sceneId?: string): any {
  const game = (globalThis as any).game;
  const scene = sceneId ? game?.scenes?.get?.(sceneId) : (globalThis as any).canvas?.scene;
  if (!scene) {
    throw new Error(
      sceneId
        ? `SCENE_NOT_FOUND: no scene with id "${sceneId}"`
        : 'NO_ACTIVE_SCENE: no sceneId given and canvas.scene is null',
    );
  }
  return scene;
}

function resolveUuid(uuid: string): any {
  const sync = (globalThis as any).fromUuidSync;
  if (typeof sync === 'function') {
    const doc = sync(uuid);
    if (doc) return doc;
  }
  throw new Error(`DOCUMENT_NOT_FOUND: cannot resolve UUID "${uuid}" to a Foundry Document`);
}

function readFlag(doc: any, scope: string, key: string): unknown {
  try {
    return doc.getFlag?.(scope, key);
  } catch {
    return undefined;
  }
}

function tryGetSetting(scope: string, key: string): unknown {
  try {
    return (globalThis as any).game?.settings?.get?.(scope, key);
  } catch {
    return undefined;
  }
}

// ── Public dispatcher ─────────────────────────────────────────────────────────

export async function dispatchModuleLevels(data: unknown): Promise<any> {
  const g = requireModuleActive('levels', ['wall-height']);
  if (g) return g;

  const parsed = ModuleLevelsInput.parse(data);

  switch (parsed.action) {
    case 'get-capabilities':       return handleGetCapabilities(parsed);
    case 'get-elevation-data':     return handleGetElevationData(parsed);
    case 'set-token-elevation':    return handleSetTokenElevation(parsed);
    case 'set-tile-range':         return handleSetTileRange(parsed);
    case 'set-placeable-range':    return handleSetPlaceableRange(parsed);
    case 'set-wall-height':        return handleSetWallHeight(parsed);
    case 'set-volumetric-template':return handleSetVolumetricTemplate(parsed);
    case 'define-scene-levels':    return handleDefineSceneLevels(parsed);
    case 'set-scene-flags':        return handleSetSceneFlags(parsed);
    case 'set-region-elevation':   return handleSetRegionElevation(parsed);
    case 'rescale-grid-distance':  return handleRescaleGridDistance(parsed);
    default: {
      const _exhaustive: never = parsed;
      return { success: false, error: `Unknown module-levels action: ${(_exhaustive as any).action}` };
    }
  }
}

// ── Read handlers ─────────────────────────────────────────────────────────────

type GetCapsInput = Extract<ModuleLevelsInputType, { action: 'get-capabilities' }>;

async function handleGetCapabilities(_input: GetCapsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: get-capabilities requires GM access' };
  try {
    const family = FAMILY.map((id) => ({
      id,
      installed: Boolean((globalThis as any).game?.modules?.get?.(id)),
      active: moduleActive(id),
      version: moduleVersion(id),
    }));

    // Migration state: levels.migrateOnStartup default true; true = PENDING (warn), false = done.
    const migrateOnStartup = tryGetSetting('levels', 'migrateOnStartup');
    let residualRangeBottom = false;
    try {
      const scene = (globalThis as any).canvas?.scene;
      const tiles = scene?.tiles?.contents ?? [];
      residualRangeBottom = tiles.some((t: any) => t?.flags?.levels?.rangeBottom !== undefined);
    } catch { /* no canvas */ }

    const migration = {
      migrateOnStartup: migrateOnStartup ?? null,
      pending: migrateOnStartup === true, // true means migration has NOT yet self-cleared
      residualRangeBottomOnActiveScene: residualRangeBottom,
      warning: migrateOnStartup === true || residualRangeBottom
        ? 'Levels migration may not have run — write core `elevation`, never flags.levels.rangeBottom.'
        : null,
    };

    // READ_ONLY_INFORM settings that affect behavior (dossier §6).
    const settings = {
      'levels.fogHiding': tryGetSetting('levels', 'fogHiding') ?? null,
      'levels.preciseTokenVisibility': tryGetSetting('levels', 'preciseTokenVisibility') ?? null,
      'wall-height.autoLOSHeight': tryGetSetting('wall-height', 'autoLOSHeight') ?? null,
      'wall-height.defaultLosHeight': tryGetSetting('wall-height', 'defaultLosHeight') ?? null,
      'wall-height.losHeightMulti': tryGetSetting('wall-height', 'losHeightMulti') ?? null,
      'levelsvolumetrictemplates.volPercent': tryGetSetting('levelsvolumetrictemplates', 'volPercent') ?? null,
    };

    return {
      success: true,
      data: {
        family,
        volumetricActive: moduleActive('levelsvolumetrictemplates'),
        layerEffectsActive: moduleActive('levels-layer-effects'),
        betterRoofsActive: moduleActive('betterroofs'),
        migration,
        settings,
      },
    };
  } catch (e) {
    return { success: false, error: `LEVELS_CAPABILITIES_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type GetElevInput = Extract<ModuleLevelsInputType, { action: 'get-elevation-data' }>;

async function handleGetElevationData(input: GetElevInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: get-elevation-data requires GM access' };
  try {
    const doc = resolveUuid(input.uuid);
    return {
      success: true,
      data: {
        uuid: doc.uuid ?? input.uuid,
        documentName: doc.documentName ?? null,
        name: doc.name ?? null,
        elevation: doc.elevation ?? null, // number for most docs; {bottom,top} for Region
        flagsLevels: doc.flags?.levels ?? null,
        flagsWallHeight: doc.flags?.['wall-height'] ?? null,
      },
    };
  } catch (e) {
    return { success: false, error: `LEVELS_GET_ELEVATION_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Document write handlers ─────────────────────────────────────────────────────

type SetTokenInput = Extract<ModuleLevelsInputType, { action: 'set-token-elevation' }>;

async function handleSetTokenElevation(input: SetTokenInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can set elevation' };
  try {
    const scene = getScene(input.sceneId);
    const token = getEmbeddedOrThrow<any>(scene, 'tokens', input.tokenId, 'Token');
    const update: Record<string, unknown> = { elevation: input.elevation };
    if (input.tokenHeight !== undefined) update['flags.wall-height.tokenHeight'] = input.tokenHeight;
    await token.update(update);
    const verify = { elevation: token.elevation ?? null, tokenHeight: readFlag(token, 'wall-height', 'tokenHeight') ?? null };
    notify.updated('levels', `Token elevation → ${input.elevation}`, { uuid: token.uuid });
    return { success: true, data: { tokenId: input.tokenId, ...verify } };
  } catch (e) {
    return { success: false, error: `LEVELS_SET_TOKEN_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type SetTileInput = Extract<ModuleLevelsInputType, { action: 'set-tile-range' }>;

async function handleSetTileRange(input: SetTileInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can set tile range' };
  try {
    const scene = getScene(input.sceneId);
    const tile = getEmbeddedOrThrow<any>(scene, 'tiles', input.tileId, 'Tile');
    const update: Record<string, unknown> = {};
    if (input.elevation !== undefined) update.elevation = input.elevation;
    const flagKeys: Array<keyof SetTileInput> = ['rangeTop', 'showIfAbove', 'showAboveRange', 'noCollision', 'noFogHide', 'isBasement', 'allWallBlockSight'];
    for (const k of flagKeys) {
      if (input[k] !== undefined) update[`flags.levels.${k}`] = input[k];
    }
    if (Object.keys(update).length === 0) {
      return { success: false, error: 'NO_FIELDS: provide elevation and/or at least one tile flag to write' };
    }
    await tile.update(update);
    const lv = tile.flags?.levels ?? {};
    notify.updated('levels', `Tile range updated (${input.tileId})`, { uuid: tile.uuid });
    return {
      success: true,
      data: {
        tileId: input.tileId,
        elevation: tile.elevation ?? null,
        rangeTop: lv.rangeTop ?? null,
        showIfAbove: lv.showIfAbove ?? null,
        showAboveRange: lv.showAboveRange ?? null,
        noCollision: lv.noCollision ?? null,
        noFogHide: lv.noFogHide ?? null,
        isBasement: lv.isBasement ?? null,
        allWallBlockSight: lv.allWallBlockSight ?? null,
      },
    };
  } catch (e) {
    return { success: false, error: `LEVELS_SET_TILE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type SetPlaceableInput = Extract<ModuleLevelsInputType, { action: 'set-placeable-range' }>;

async function handleSetPlaceableRange(input: SetPlaceableInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can set placeable range' };
  try {
    const collectionByType: Record<string, { coll: string; docType: string }> = {
      light: { coll: 'lights', docType: 'AmbientLight' },
      sound: { coll: 'sounds', docType: 'AmbientSound' },
      note: { coll: 'notes', docType: 'Note' },
    };
    const map = collectionByType[input.placeableType];
    if (input.advancedLighting !== undefined && input.placeableType === 'note') {
      return { success: false, error: 'INVALID_PARAMS: advancedLighting is only valid for light/sound, not note' };
    }
    const scene = getScene(input.sceneId);
    const doc = getEmbeddedOrThrow<any>(scene, map.coll, input.placeableId, map.docType);
    const update: Record<string, unknown> = {};
    if (input.elevation !== undefined) update.elevation = input.elevation;
    if (input.rangeTop !== undefined) update['flags.levels.rangeTop'] = input.rangeTop;
    if (input.advancedLighting !== undefined) update['flags.wall-height.advancedLighting'] = input.advancedLighting;
    if (Object.keys(update).length === 0) {
      return { success: false, error: 'NO_FIELDS: provide elevation, rangeTop, and/or advancedLighting' };
    }
    await doc.update(update);
    notify.updated('levels', `${map.docType} range updated (${input.placeableId})`, { uuid: doc.uuid });
    return {
      success: true,
      data: {
        placeableType: input.placeableType,
        placeableId: input.placeableId,
        elevation: doc.elevation ?? null,
        rangeTop: doc.flags?.levels?.rangeTop ?? null,
        advancedLighting: doc.flags?.['wall-height']?.advancedLighting ?? null,
      },
    };
  } catch (e) {
    return { success: false, error: `LEVELS_SET_PLACEABLE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type SetWallInput = Extract<ModuleLevelsInputType, { action: 'set-wall-height' }>;

async function handleSetWallHeight(input: SetWallInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can set wall height' };
  if (input.top === undefined && input.bottom === undefined) {
    return { success: false, error: 'NO_FIELDS: provide top and/or bottom' };
  }
  try {
    const scene = getScene(input.sceneId);
    const wall = getEmbeddedOrThrow<any>(scene, 'walls', input.wallId, 'Wall');
    const update: Record<string, unknown> = {};
    if (input.top !== undefined) update['flags.wall-height.top'] = input.top;
    if (input.bottom !== undefined) update['flags.wall-height.bottom'] = input.bottom;
    await wall.update(update);
    const wh = wall.flags?.['wall-height'] ?? {};
    notify.updated('levels', `Wall height updated (${input.wallId})`, { uuid: wall.uuid });
    return { success: true, data: { wallId: input.wallId, top: wh.top ?? null, bottom: wh.bottom ?? null } };
  } catch (e) {
    return { success: false, error: `LEVELS_SET_WALL_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type SetVolumetricInput = Extract<ModuleLevelsInputType, { action: 'set-volumetric-template' }>;

async function handleSetVolumetricTemplate(input: SetVolumetricInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can set template depth' };
  // DEPENDENCY_GATED on levelsvolumetrictemplates.
  if (!moduleActive('levelsvolumetrictemplates')) {
    return { success: false, error: 'MODULE_DEPENDENCY_NOT_ACTIVE: "levelsvolumetrictemplates" is required for set-volumetric-template but is not active.' };
  }
  if (input.elevation === undefined && input.special === undefined) {
    return { success: false, error: 'NO_FIELDS: provide elevation and/or special (depth)' };
  }
  try {
    const scene = getScene(input.sceneId);
    const tpl = getEmbeddedOrThrow<any>(scene, 'templates', input.templateId, 'MeasuredTemplate');
    const update: Record<string, unknown> = {};
    if (input.elevation !== undefined) update.elevation = input.elevation;
    if (input.special !== undefined) update['flags.levels.special'] = input.special;
    await tpl.update(update);
    notify.updated('levels', `Volumetric template updated (${input.templateId})`, { uuid: tpl.uuid });
    return {
      success: true,
      data: {
        templateId: input.templateId,
        elevation: tpl.elevation ?? null,
        special: tpl.flags?.levels?.special ?? null,
        retargetOnUpdate: false,
        note: 'Volumetric depth persisted, but 3D targeting only recomputes on template CREATE (createMeasuredTemplate hook), not on update.',
      },
    };
  } catch (e) {
    return { success: false, error: `LEVELS_SET_VOLUMETRIC_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Scene + region orchestration ─────────────────────────────────────────────

type DefineSceneLevelsInput = Extract<ModuleLevelsInputType, { action: 'define-scene-levels' }>;

async function handleDefineSceneLevels(input: DefineSceneLevelsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can define scene levels' };
  try {
    const scene = getScene(input.sceneId);
    // sceneLevels shape verified API.js:102-110: Array<[bottom, top, label]>.
    await scene.setFlag('levels', 'sceneLevels', input.levels);
    const verify = scene.getFlag('levels', 'sceneLevels');
    notify.updated('levels', `Defined ${input.levels.length} scene level band(s)`, { uuid: scene.uuid });
    return { success: true, data: { sceneId: scene.id, sceneLevels: verify ?? null, count: input.levels.length } };
  } catch (e) {
    return { success: false, error: `LEVELS_DEFINE_SCENE_LEVELS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type SetSceneFlagsInput = Extract<ModuleLevelsInputType, { action: 'set-scene-flags' }>;

async function handleSetSceneFlags(input: SetSceneFlagsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can set scene flags' };
  try {
    const scene = getScene(input.sceneId);
    const update: Record<string, unknown> = {};
    if (input.backgroundElevation !== undefined) update['flags.levels.backgroundElevation'] = input.backgroundElevation;
    if (input.weatherElevation !== undefined) update['flags.levels.weatherElevation'] = input.weatherElevation;
    if (input.lightMasking !== undefined) update['flags.levels.lightMasking'] = input.lightMasking;
    if (input.advancedVision !== undefined) update['flags.wall-height.advancedVision'] = input.advancedVision;
    if (input.enableEffects !== undefined) update['flags.levels-layer-effects.enableEffects'] = input.enableEffects;
    if (input.blurMulti !== undefined) update['flags.levels-layer-effects.blurMulti'] = input.blurMulti;
    if (Object.keys(update).length === 0) {
      return { success: false, error: 'NO_FIELDS: provide at least one scene flag to write' };
    }
    await scene.update(update);
    notify.updated('levels', `Scene levels flags updated (${scene.name ?? scene.id})`, { uuid: scene.uuid });
    return {
      success: true,
      data: {
        sceneId: scene.id,
        backgroundElevation: scene.flags?.levels?.backgroundElevation ?? null,
        weatherElevation: scene.flags?.levels?.weatherElevation ?? null,
        lightMasking: scene.flags?.levels?.lightMasking ?? null,
        advancedVision: scene.flags?.['wall-height']?.advancedVision ?? null,
        enableEffects: scene.flags?.['levels-layer-effects']?.enableEffects ?? null,
        blurMulti: scene.flags?.['levels-layer-effects']?.blurMulti ?? null,
      },
    };
  } catch (e) {
    return { success: false, error: `LEVELS_SET_SCENE_FLAGS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type SetRegionInput = Extract<ModuleLevelsInputType, { action: 'set-region-elevation' }>;

async function handleSetRegionElevation(input: SetRegionInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can set region elevation' };
  if (input.bottom === undefined && input.top === undefined && !input.stairMode) {
    return { success: false, error: 'NO_FIELDS: provide bottom/top and/or a stairMode' };
  }
  if (input.stairMode === 'elevator' && !input.elevatorData) {
    return { success: false, error: 'MISSING_ELEVATOR_DATA: stairMode "elevator" requires elevatorData (the floor definition string)' };
  }
  try {
    const scene = getScene(input.sceneId);
    const region = getEmbeddedOrThrow<any>(scene, 'regions', input.regionId, 'Region');

    // 1. Core v13 elevation: nested {elevation:{bottom,top}}.
    if (input.bottom !== undefined || input.top !== undefined) {
      const elevation: Record<string, unknown> = {};
      if (input.bottom !== undefined) elevation.bottom = input.bottom;
      if (input.top !== undefined) elevation.top = input.top;
      await region.update({ elevation });
    }

    // 2. Optional RegionHandler stair/elevator behavior (verified migration.js:6-11 + regionHandler.js).
    let createdBehavior: { id: string; name: string; source: string } | null = null;
    if (input.stairMode) {
      const mode = input.stairMode;
      const source = mode === 'elevator'
        ? `const elevatorData = ${JSON.stringify(input.elevatorData ?? '')};\nCONFIG.Levels.handlers.RegionHandler.elevator(region, event, elevatorData);`
        : `CONFIG.Levels.handlers.RegionHandler.${mode}(region, event);`;
      const name = input.behaviorName ?? `Levels v6 ${mode}`;
      const created = await region.createEmbeddedDocuments('RegionBehavior', [
        { type: 'executeScript', name, system: { source, events: ['tokenEnter'] } },
      ]);
      const b = Array.isArray(created) ? created[0] : created;
      createdBehavior = { id: b?.id ?? '', name, source };
    }

    notify.updated('levels', `Region elevation updated (${input.regionId})${input.stairMode ? ` + ${input.stairMode} behavior` : ''}`, { uuid: region.uuid });
    return {
      success: true,
      data: {
        regionId: input.regionId,
        elevation: {
          bottom: region.elevation?.bottom ?? null,
          top: region.elevation?.top ?? null,
        },
        behavior: createdBehavior,
      },
    };
  } catch (e) {
    return { success: false, error: `LEVELS_SET_REGION_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type RescaleInput = Extract<ModuleLevelsInputType, { action: 'rescale-grid-distance' }>;

async function handleRescaleGridDistance(input: RescaleInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can rescale grid distance' };
  if (input.prevDistance === input.currDistance) {
    return { success: false, error: 'NO_OP: prevDistance equals currDistance — nothing to rescale' };
  }
  try {
    const scene = getScene(input.sceneId);

    // Affected-doc counts across the 7 doc types rescaleGridDistance touches (API.js:62).
    const affected: Record<string, number> = {};
    for (const coll of RESCALE_COLLECTIONS) {
      const c = (scene as any)[coll];
      affected[coll] = c?.size ?? c?.contents?.length ?? 0;
    }
    const sceneLevelsCount = (scene.getFlag('levels', 'sceneLevels') as unknown[] | undefined)?.length ?? 0;
    const totalAffected = Object.values(affected).reduce((s, n) => s + n, 0);

    // CCR-4: dry-run unless confirm:true.
    if (input.confirm !== true) {
      return {
        success: true,
        data: {
          dryRun: true,
          prevDistance: input.prevDistance,
          currDistance: input.currDistance,
          factor: input.currDistance / input.prevDistance,
          affected,
          sceneLevelsBands: sceneLevelsCount,
          totalAffected,
          note: 'Dry-run only — no documents mutated. Re-send with confirm:true to execute the bulk rescale.',
        },
      };
    }

    const api = (globalThis as any).CONFIG?.Levels?.API ?? (globalThis as any).CONFIG?.Levels;
    if (typeof api?.rescaleGridDistance !== 'function') {
      return { success: false, error: 'LEVELS_API_UNAVAILABLE: CONFIG.Levels.API.rescaleGridDistance is not a function' };
    }
    await api.rescaleGridDistance(input.prevDistance, input.currDistance, scene);
    notify.updated('levels', `Rescaled grid distance ${input.prevDistance} → ${input.currDistance} across ${totalAffected} doc(s)`, { uuid: scene.uuid });
    return {
      success: true,
      data: {
        dryRun: false,
        prevDistance: input.prevDistance,
        currDistance: input.currDistance,
        factor: input.currDistance / input.prevDistance,
        affected,
        sceneLevelsBands: sceneLevelsCount,
        totalAffected,
      },
    };
  } catch (e) {
    return { success: false, error: `LEVELS_RESCALE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}
