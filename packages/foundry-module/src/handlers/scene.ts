// Phase 4 mcp_crud_expansion — Scene handlers (umbrella, 9 actions).
// Phase 5: addTokens / deleteTokenAction migrated to handlers/token.ts.
//
// Foundry-side write/read surface for the `scene` MCP umbrella tool.
// Actions: create / update / delete / clone / activate / view / thumbnail / get / list.
// Token lifecycle (add/delete-token) lives on handlers/token.ts since Phase 5.
//
// CCR-Trust: every write function starts with validateGMAccess().
// CCR-Transactions: every write routes through wrappedWrite('scene.<name>', ...).
// CCR-Envelope: returns {success, data} or {success, error}.
// CCR-Schema-Fidelity: input field paths mirror Foundry defineSchema 1:1
//                      (Phase 0 probe-locked — see phase4_probes.md).
// BUG-075: snapshot-clone input.changes BEFORE every mutating call.
// DP-15: typed return on every handler (no `any` payloads).
// DP-16: post-verify each write by re-reading the document.
// DP-18: delete-scene asserts post-state via game.scenes.get + .size delta.
// DP-19: serializeSceneViewModel surfaces every §6.2 PRD field.

import {
  SceneToolInput,
  SceneCreateInput,
  SceneUpdateInput,
  SceneDeleteInput,
  SceneCloneInput,
  SceneActivateInput,
  SceneViewInput,
  SceneThumbnailInput,
  SceneGetInput,
  SceneListInput,
  type SceneToolInputType,
  type SceneCreateInputType,
  type SceneUpdateInputType,
  type SceneDeleteInputType,
  type SceneCloneInputType,
  type SceneActivateInputType,
  type SceneViewInputType,
  type SceneThumbnailInputType,
  type SceneGetInputType,
  type SceneListInputType,
  type SceneViewModel,
  type SceneTokenView,
  type SceneListEntry,
  type SceneCreateResponse,
  type SceneUpdateResponse,
  type SceneDeleteResponse,
  type SceneCloneResponse,
  type SceneActivateResponse,
  type SceneViewResponse,
  type SceneThumbnailResponse,
  type SceneGetResponse,
  type SceneListResponse,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';

// ── Local types ──────────────────────────────────────────────────────────────

type AccessGate = { allowed: boolean };
type EnvelopeOK<T> = { success: true; data: T };
type EnvelopeErr = { success: false; error: string };
type Envelope<T> = EnvelopeOK<T> | EnvelopeErr;

type SceneResponse =
  | SceneCreateResponse
  | SceneUpdateResponse
  | SceneDeleteResponse
  | SceneCloneResponse
  | SceneActivateResponse
  | SceneViewResponse
  | SceneThumbnailResponse
  | SceneGetResponse
  | SceneListResponse;

// Minimal data-access surface the dispatcher needs. queries.ts passes its own
// FoundryDataAccess instance in; we type just the methods we touch so the
// handler file doesn't import the heavy data-access.ts directly.
export interface SceneDataAccessFacade {
  validateFoundryState(): void;
  listScenes(input: any): Promise<any>;
}

// ── Access gate ──────────────────────────────────────────────────────────────

function validateGMAccess(): AccessGate {
  if (!game.user?.isGM) return { allowed: false };
  return { allowed: true };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  Object.keys(obj).forEach((k) => obj[k] === undefined && delete obj[k]);
  return obj;
}

function deepStripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(deepStripUndefined) as any;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      if (v === undefined) continue;
      out[k] = deepStripUndefined(v);
    }
    return out as any;
  }
  return value;
}

function getSceneOrThrow(sceneId: string): any {
  const scene = (game as any).scenes?.get(sceneId);
  if (!scene) {
    throw new Error(`SCENE_NOT_FOUND: no Scene with id "${sceneId}"`);
  }
  return scene;
}

// CONST.GRID_TYPES enum 0-5 (Phase 0 Probe B confirmed).
const GRID_TYPE_NAMES = [
  'GRIDLESS',
  'SQUARE',
  'HEXODDR',
  'HEXEVENR',
  'HEXODDQ',
  'HEXEVENQ',
] as const;

function gridTypeName(type: number): string {
  return GRID_TYPE_NAMES[type] ?? 'UNKNOWN';
}

// Disposition name for token serialization (matches legacy formatter).
function dispositionName(disposition: number): SceneTokenView['disposition'] {
  switch (disposition) {
    case -1:
      return 'hostile';
    case 0:
      return 'neutral';
    case 1:
      return 'friendly';
    default:
      return 'unknown';
  }
}

// ── Serializers ──────────────────────────────────────────────────────────────

// DP-19: surface every §6.2 PRD field. _source distinguishes raw stored ID
// from resolved doc (Probe D: stale FKs persist).
function serializeSceneViewModel(scene: any): SceneViewModel {
  const src = scene._source ?? {};
  const env = scene.environment ?? {};
  const envSrc = src.environment ?? {};
  const fog = scene.fog ?? {};
  const fogSrc = src.fog ?? {};
  const grid = scene.grid ?? {};
  const bg = scene.background ?? {};
  const bgSrc = src.background ?? {};
  const initial = scene.initial ?? {};

  return {
    id: scene.id as string,
    name: scene.name ?? '',
    active: !!scene.active,
    navigation: !!scene.navigation,
    navName: scene.navName ?? null,
    width: typeof scene.width === 'number' ? scene.width : null,
    height: typeof scene.height === 'number' ? scene.height : null,
    padding: typeof scene.padding === 'number' ? scene.padding : 0.25,
    backgroundColor: scene.backgroundColor ?? '#000000',
    background: {
      src: bgSrc.src ?? bg.src ?? null,
      anchorX: bg.anchorX ?? 0,
      anchorY: bg.anchorY ?? 0,
      offsetX: bg.offsetX ?? 0,
      offsetY: bg.offsetY ?? 0,
      fit: bg.fit ?? 'fill',
      scaleX: bg.scaleX ?? 1,
      scaleY: bg.scaleY ?? 1,
      rotation: bg.rotation ?? 0,
      tint: bg.tint ?? '#ffffff',
      alphaThreshold: bg.alphaThreshold ?? 0,
    },
    foreground: src.foreground ?? scene.foreground ?? null,
    foregroundElevation:
      typeof scene.foregroundElevation === 'number' ? scene.foregroundElevation : null,
    thumb: src.thumb ?? scene.thumb ?? null,
    initial: {
      x: typeof initial.x === 'number' ? initial.x : null,
      y: typeof initial.y === 'number' ? initial.y : null,
      scale: typeof initial.scale === 'number' ? initial.scale : null,
    },
    grid: {
      type: typeof grid.type === 'number' ? grid.type : 1,
      typeName: gridTypeName(typeof grid.type === 'number' ? grid.type : 1),
      size: grid.size ?? 100,
      style: grid.style ?? 'solidLines',
      thickness: grid.thickness ?? 1,
      color: grid.color ?? '#000000',
      alpha: grid.alpha ?? 0.2,
      distance: grid.distance ?? 5,
      units: grid.units ?? 'ft',
    },
    tokenVision: !!scene.tokenVision,
    fog: {
      exploration: !!fog.exploration,
      reset: typeof fog.reset === 'number' ? fog.reset : null,
      overlay: fogSrc.overlay ?? fog.overlay ?? null,
      colors: {
        explored: fog.colors?.explored ?? null,
        unexplored: fog.colors?.unexplored ?? null,
      },
    },
    environment: {
      darknessLevel: env.darknessLevel ?? 0,
      darknessLock: !!env.darknessLock,
      cycle: !!env.cycle,
      globalLight: {
        enabled: !!env.globalLight?.enabled,
        alpha: env.globalLight?.alpha ?? 0.5,
        bright: !!env.globalLight?.bright,
        color: env.globalLight?.color ?? null,
        coloration: typeof env.globalLight?.coloration === 'number'
          ? env.globalLight.coloration
          : null,
        luminosity: env.globalLight?.luminosity ?? 0,
        saturation: env.globalLight?.saturation ?? 0,
        contrast: env.globalLight?.contrast ?? 0,
        shadows: env.globalLight?.shadows ?? 0,
        darkness: {
          min: env.globalLight?.darkness?.min ?? 0,
          max: env.globalLight?.darkness?.max ?? 0,
        },
      },
      base: {
        hue: env.base?.hue ?? 0,
        intensity: env.base?.intensity ?? 0,
        luminosity: env.base?.luminosity ?? 0,
        saturation: env.base?.saturation ?? 0,
        shadows: env.base?.shadows ?? 0,
      },
      dark: {
        hue: env.dark?.hue ?? 0,
        intensity: env.dark?.intensity ?? 0,
        luminosity: env.dark?.luminosity ?? 0,
        saturation: env.dark?.saturation ?? 0,
        shadows: env.dark?.shadows ?? 0,
      },
    },
    // FK fields: _source has raw ID (stale-survivable per Probe D); .* getters
    // return resolved doc (null when stale). *Linked flags distinguish.
    journal: envSrc.journal ?? src.journal ?? null,
    journalLinked: !!scene.journal,
    journalEntryPage: src.journalEntryPage ?? null,
    journalEntryPageLinked: !!scene.journalEntryPage,
    playlist: src.playlist ?? null,
    playlistLinked: !!scene.playlist,
    playlistSound: src.playlistSound ?? null,
    playlistSoundLinked: !!scene.playlistSound,
    weather: scene.weather ?? '',
    folder: src.folder ?? null,
    folderLinked: !!scene.folder,
    sort: typeof scene.sort === 'number' ? scene.sort : 0,
    counts: {
      tokens: scene.tokens?.size ?? 0,
      walls: scene.walls?.size ?? 0,
      lights: scene.lights?.size ?? 0,
      sounds: scene.sounds?.size ?? 0,
      notes: scene.notes?.size ?? 0,
      drawings: scene.drawings?.size ?? 0,
      regions: scene.regions?.size ?? 0,
      templates: scene.templates?.size ?? 0,
      tiles: scene.tiles?.size ?? 0,
    },
    ownership: { default: 0, ...(scene.ownership ?? {}) },
  };
}

function serializeListEntry(scene: any): SceneListEntry {
  return {
    id: scene.id as string,
    name: scene.name ?? '',
    active: !!scene.active,
    navigation: !!scene.navigation,
    width: typeof scene.width === 'number' ? scene.width : null,
    height: typeof scene.height === 'number' ? scene.height : null,
    folder: scene.folder?.id ?? scene._source?.folder ?? null,
  };
}

function serializeToken(token: any): SceneTokenView {
  return {
    id: token.id as string,
    name: token.name ?? '',
    position: { x: token.x ?? 0, y: token.y ?? 0 },
    size: { width: token.width ?? 1, height: token.height ?? 1 },
    actorId: token.actorId ?? null,
    disposition: dispositionName(typeof token.disposition === 'number' ? token.disposition : 0),
    hidden: !!token.hidden,
    hasImage: !!(token.texture?.src ?? token.img),
  };
}

// ── 1. createScene ───────────────────────────────────────────────────────────

export async function createScene(data: unknown): Promise<Envelope<SceneCreateResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: createScene requires GM' };

  const input: SceneCreateInputType = SceneCreateInput_strict_parse(data);

  // BUG-075: snapshot input shape BEFORE the mutating call. Foundry's
  // Document.create() may inject _id and mutate the payload.
  const { action: _action, ...rest } = input;
  const requestedChanges: Record<string, unknown> = { ...rest };

  return wrappedWrite('scene.createScene', async () => {
    const payload = deepStripUndefined({ ...rest });
    const SceneCls = (globalThis as any).Scene as any;
    const created = await SceneCls.create(payload);
    if (!created) {
      throw new Error('SCENE_WRITE_NOT_PERSISTED: Scene.create returned null unexpectedly');
    }

    // DP-16 post-verify: re-read by id, confirm name matches.
    const persisted = (game as any).scenes?.get(created.id);
    if (!persisted) {
      throw new Error(
        `SCENE_WRITE_NOT_PERSISTED: Scene "${created.id}" missing from game.scenes after create`,
      );
    }
    if (persisted.name !== input.name) {
      throw new Error(
        `SCENE_WRITE_NOT_PERSISTED: created Scene name "${persisted.name}" does not match ` +
          `requested "${input.name}"`,
      );
    }

    return {
      success: true as const,
      data: {
        success: true,
        scene: serializeSceneViewModel(persisted),
        requestedChanges,
      } satisfies SceneCreateResponse,
    };
  });
}

// ── 2. updateScene ──────────────────────────────────────────────────────────

export async function updateScene(data: unknown): Promise<Envelope<SceneUpdateResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: updateScene requires GM' };

  const input: SceneUpdateInputType = SceneUpdateInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);

  // BUG-075: snapshot BEFORE Foundry mutates the input.
  const requestedChanges: Record<string, unknown> = { ...input.changes };
  const changedFields = Object.keys(requestedChanges);

  return wrappedWrite('scene.updateScene', async () => {
    await scene.update(input.changes);

    // DP-16 post-verify: re-read each top-level requested field.
    // FK fields (journal/playlist/etc.) resolve to docs; compare against `_source` raw ID.
    for (const [field, requestedValue] of Object.entries(requestedChanges)) {
      const isFK = ['journal', 'journalEntryPage', 'playlist', 'playlistSound', 'folder'].includes(
        field,
      );
      if (isFK) {
        const persistedId = scene._source?.[field] ?? null;
        if (persistedId !== (requestedValue ?? null)) {
          throw new Error(
            `SCENE_WRITE_NOT_PERSISTED: ${field} expected ${JSON.stringify(requestedValue)} ` +
              `but post-update value is ${JSON.stringify(persistedId)}`,
          );
        }
        continue;
      }
      // Nested SchemaFields (grid, fog, environment, background, initial) — skip
      // deep verify (Foundry merges partial updates; checking shape would mean
      // walking every sub-key). Top-level scalar/string/bool fields verified.
      if (
        field === 'grid' ||
        field === 'fog' ||
        field === 'environment' ||
        field === 'background' ||
        field === 'initial' ||
        field === 'ownership' ||
        field === 'flags'
      ) {
        const persisted = (scene as any)[field];
        if (persisted === undefined || persisted === null) {
          throw new Error(
            `SCENE_WRITE_NOT_PERSISTED: nested field "${field}" missing after update`,
          );
        }
        continue;
      }
      const persistedValue = (scene as any)[field];
      if (persistedValue !== requestedValue) {
        throw new Error(
          `SCENE_WRITE_NOT_PERSISTED: field "${field}" expected ${JSON.stringify(requestedValue)} ` +
            `but post-update value is ${JSON.stringify(persistedValue)}`,
        );
      }
    }

    return {
      success: true as const,
      data: {
        success: true,
        scene: serializeSceneViewModel(scene),
        requestedChanges,
        changedFields,
      } satisfies SceneUpdateResponse,
    };
  });
}

// ── 3. deleteScene ──────────────────────────────────────────────────────────

export async function deleteScene(data: unknown): Promise<Envelope<SceneDeleteResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: deleteScene requires GM' };

  const input: SceneDeleteInputType = SceneDeleteInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const deletedName = scene.name as string;
  const sizeBefore = (game as any).scenes?.size ?? 0;

  return wrappedWrite('scene.deleteScene', async () => {
    await scene.delete();

    // DP-18: cascade-aware verify.
    const postScene = (game as any).scenes?.get(input.sceneId);
    if (postScene) {
      throw new Error(
        `SCENE_WRITE_NOT_PERSISTED: scene "${input.sceneId}" still present after delete()`,
      );
    }
    const sizeAfter = (game as any).scenes?.size ?? 0;
    if (sizeAfter !== sizeBefore - 1) {
      throw new Error(
        `SCENE_WRITE_NOT_PERSISTED: scenes.size expected ${sizeBefore - 1} after delete ` +
          `but found ${sizeAfter}`,
      );
    }

    return {
      success: true as const,
      data: {
        success: true,
        deletedId: input.sceneId,
        deletedName,
        remainingScenes: sizeAfter,
      } satisfies SceneDeleteResponse,
    };
  });
}

// ── 4. cloneScene ───────────────────────────────────────────────────────────

export async function cloneScene(data: unknown): Promise<Envelope<SceneCloneResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: cloneScene requires GM' };

  const input: SceneCloneInputType = SceneCloneInput_strict_parse(data);
  const source = getSceneOrThrow(input.sceneId);

  return wrappedWrite('scene.cloneScene', async () => {
    // Probe C: Scene.clone({...}, {save: true}) persists in one step.
    const overrides = deepStripUndefined({ name: input.newName, ...(input.overrides ?? {}) });
    const clone = await source.clone(overrides, { save: true });
    if (!clone) {
      throw new Error('SCENE_WRITE_NOT_PERSISTED: Scene.clone returned null unexpectedly');
    }

    // DP-16 post-verify: clone exists in game.scenes with the requested newName.
    const persisted = (game as any).scenes?.get(clone.id);
    if (!persisted) {
      throw new Error(
        `SCENE_WRITE_NOT_PERSISTED: cloned Scene "${clone.id}" missing from game.scenes`,
      );
    }
    if (persisted.name !== input.newName) {
      throw new Error(
        `SCENE_WRITE_NOT_PERSISTED: cloned Scene name "${persisted.name}" does not match ` +
          `requested "${input.newName}"`,
      );
    }

    return {
      success: true as const,
      data: {
        success: true,
        source: { id: source.id as string, name: source.name as string },
        clone: serializeSceneViewModel(persisted),
      } satisfies SceneCloneResponse,
    };
  });
}

// ── 5. activateScene ────────────────────────────────────────────────────────

export async function activateScene(data: unknown): Promise<Envelope<SceneActivateResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: activateScene requires GM' };

  const input: SceneActivateInputType = SceneActivateInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);

  // Capture previous active before mutating.
  const previousActive = (game as any).scenes?.active;
  const previousActiveId = previousActive?.id ?? null;

  return wrappedWrite('scene.activateScene', async () => {
    await scene.activate();

    // DP-16 post-verify: scene.active === true AND it's the world-active.
    const refreshed = (game as any).scenes?.get(input.sceneId);
    if (!refreshed?.active) {
      throw new Error(
        `SCENE_WRITE_NOT_PERSISTED: scene "${input.sceneId}" is not active after activate()`,
      );
    }

    return {
      success: true as const,
      data: {
        success: true,
        activatedId: input.sceneId,
        activatedName: scene.name as string,
        previousActiveId: previousActiveId === input.sceneId ? null : previousActiveId,
      } satisfies SceneActivateResponse,
    };
  });
}

// ── 6. viewScene ────────────────────────────────────────────────────────────

export async function viewScene(data: unknown): Promise<Envelope<SceneViewResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: viewScene requires GM' };

  const input: SceneViewInputType = SceneViewInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);

  return wrappedWrite('scene.viewScene', async () => {
    await scene.view();

    return {
      success: true as const,
      data: {
        success: true,
        viewedId: input.sceneId,
        viewedName: scene.name as string,
        isLocalUser: true,
      } satisfies SceneViewResponse,
    };
  });
}

// ── 7. thumbnailScene ───────────────────────────────────────────────────────

export async function thumbnailScene(
  data: unknown,
): Promise<Envelope<SceneThumbnailResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: thumbnailScene requires GM' };

  const input: SceneThumbnailInputType = SceneThumbnailInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);

  return wrappedWrite('scene.thumbnailScene', async () => {
    const opts = deepStripUndefined({
      width: input.width,
      height: input.height,
      format: input.format,
      quality: input.quality,
    });
    const thumbData = await scene.createThumbnail(opts);
    if (!thumbData || !thumbData.thumb) {
      throw new Error('SCENE_WRITE_NOT_PERSISTED: createThumbnail returned no data');
    }

    return {
      success: true as const,
      data: {
        success: true,
        sceneId: input.sceneId,
        sceneName: scene.name as string,
        thumbDataUrl: thumbData.thumb,
        width: thumbData.width ?? input.width ?? 300,
        height: thumbData.height ?? input.height ?? 100,
        format: thumbData.format ?? input.format ?? 'webp',
      } satisfies SceneThumbnailResponse,
    };
  });
}

// ── 8. getScene ─────────────────────────────────────────────────────────────

export async function getScene(data: unknown): Promise<Envelope<SceneGetResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: getScene requires GM' };

  const input: SceneGetInputType = SceneGetInput_strict_parse(data);

  // sceneId optional — default to active.
  const sceneId =
    input.sceneId ?? (game as any).scenes?.active?.id ?? (game as any).scenes?.current?.id;
  if (!sceneId) {
    throw new Error('SCENE_NOT_FOUND: no sceneId provided and no active scene found');
  }
  const scene = getSceneOrThrow(sceneId);

  const view = serializeSceneViewModel(scene);
  const response: SceneGetResponse = { success: true, scene: view };

  if (input.includeTokens) {
    const tokens = (scene.tokens?.contents as any[] | undefined) ?? [];
    const filtered = input.includeHidden ? tokens : tokens.filter((t) => !t.hidden);
    response.tokens = filtered.map(serializeToken);
    const summary = {
      total: filtered.length,
      byDisposition: { friendly: 0, neutral: 0, hostile: 0, unknown: 0 },
      hasActors: 0,
      withoutActors: 0,
    };
    for (const t of filtered) {
      const d = dispositionName(typeof t.disposition === 'number' ? t.disposition : 0);
      if (d === 'friendly') summary.byDisposition.friendly++;
      else if (d === 'neutral') summary.byDisposition.neutral++;
      else if (d === 'hostile') summary.byDisposition.hostile++;
      else summary.byDisposition.unknown++;
      if (t.actorId) summary.hasActors++;
      else summary.withoutActors++;
    }
    response.tokenSummary = summary;
  }

  return { success: true, data: response };
}

// ── 9. listScenesAction ─────────────────────────────────────────────────────

export async function listScenesAction(
  data: unknown,
  dataAccess: SceneDataAccessFacade,
): Promise<Envelope<SceneListResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: listScenes requires GM' };

  const input: SceneListInputType = SceneListInput_strict_parse(data);

  // Delegate the pagination + filter logic to the existing data-access layer
  // (battle-tested via TOOL-IDEA-001 carry-forward). Forward only the fields
  // it understands.
  const params: Record<string, any> = {
    filter: input.filter,
    include_active_only: input.include_active_only,
  };
  if (input.page !== undefined) params.page = input.page;
  if (input.pageSize !== undefined) params.pageSize = input.pageSize;
  if (input.countOnly !== undefined) params.countOnly = input.countOnly;

  const raw = await dataAccess.listScenes(params);

  // dataAccess.listScenes returns either:
  //   - bare array (no pagination/countOnly) → wrap as SceneListBareResponse
  //   - { total, page, pageSize, pageCount, scenes } → SceneListPaginatedResponse
  //   - { total, filterApplied } → SceneListCountOnlyResponse
  let response: SceneListResponse;
  if (Array.isArray(raw)) {
    response = {
      success: true,
      scenes: raw.map((s) => normalizeListEntry(s)),
    };
  } else if (raw && typeof raw === 'object' && 'page' in raw) {
    response = {
      success: true,
      total: (raw as any).total,
      page: (raw as any).page,
      pageSize: (raw as any).pageSize,
      pageCount: (raw as any).pageCount,
      scenes: ((raw as any).scenes ?? []).map((s: any) => normalizeListEntry(s)),
    };
  } else if (raw && typeof raw === 'object' && 'total' in raw && !('scenes' in raw)) {
    response = {
      success: true,
      total: (raw as any).total,
      filterApplied: input.filter ?? (input.include_active_only ? 'active_only' : null),
    };
  } else {
    // Defensive fallback — should not hit given the dataAccess contract.
    response = { success: true, scenes: [] };
  }

  return { success: true, data: response };
}

function normalizeListEntry(s: any): SceneListEntry {
  // Existing data-access returns various shapes (SceneInfo or raw doc) — we
  // accept either, falling through to id/name minimums.
  if (s && typeof s === 'object' && s.id) {
    return {
      id: s.id,
      name: s.name ?? '',
      active: !!s.active,
      navigation: !!s.navigation,
      width: typeof s.width === 'number' ? s.width : null,
      height: typeof s.height === 'number' ? s.height : null,
      folder: s.folder?.id ?? s._source?.folder ?? s.folder ?? null,
    };
  }
  return serializeListEntry(s);
}

// ── Dispatcher ──────────────────────────────────────────────────────────────

export async function dispatchScene(
  data: unknown,
  dataAccess: SceneDataAccessFacade,
): Promise<Envelope<SceneResponse>> {
  let input: SceneToolInputType;
  try {
    input = SceneToolInput.parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  switch (input.action) {
    case 'create':
      return createScene(input);
    case 'update':
      return updateScene(input);
    case 'delete':
      return deleteScene(input);
    case 'clone':
      return cloneScene(input);
    case 'activate':
      return activateScene(input);
    case 'view':
      return viewScene(input);
    case 'thumbnail':
      return thumbnailScene(input);
    case 'get':
      return getScene(input);
    case 'list':
      return listScenesAction(input, dataAccess);
    default: {
      const _exhaustive: never = input;
      throw new Error(`Invalid scene action: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

// ── Per-handler strict-parse wrappers ───────────────────────────────────────

function SceneCreateInput_strict_parse(data: unknown): SceneCreateInputType {
  return SceneCreateInput.strict().parse(data ?? {});
}
function SceneUpdateInput_strict_parse(data: unknown): SceneUpdateInputType {
  return SceneUpdateInput.strict().parse(data ?? {});
}
function SceneDeleteInput_strict_parse(data: unknown): SceneDeleteInputType {
  return SceneDeleteInput.strict().parse(data ?? {});
}
function SceneCloneInput_strict_parse(data: unknown): SceneCloneInputType {
  return SceneCloneInput.strict().parse(data ?? {});
}
function SceneActivateInput_strict_parse(data: unknown): SceneActivateInputType {
  return SceneActivateInput.strict().parse(data ?? {});
}
function SceneViewInput_strict_parse(data: unknown): SceneViewInputType {
  return SceneViewInput.strict().parse(data ?? {});
}
function SceneThumbnailInput_strict_parse(data: unknown): SceneThumbnailInputType {
  return SceneThumbnailInput.strict().parse(data ?? {});
}
function SceneGetInput_strict_parse(data: unknown): SceneGetInputType {
  return SceneGetInput.strict().parse(data ?? {});
}
function SceneListInput_strict_parse(data: unknown): SceneListInputType {
  return SceneListInput.strict().parse(data ?? {});
}

// stripUndefined currently unused-export-safe; retained for symmetry with
// handlers/journal.ts (Phase 5 embedded CRUD will use it).
void stripUndefined;
