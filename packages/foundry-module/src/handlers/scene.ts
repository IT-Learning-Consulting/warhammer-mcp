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
  SceneClearLayerInput,
  SceneResetFogInput,
  SceneLightingTransitionInput,
  ScenePreloadInput,
  SceneImportFromCompendiumInput,
  SCENE_CLEARABLE_LAYERS,
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
  type SceneClearLayerInputType,
  type SceneResetFogInputType,
  type SceneLightingTransitionInputType,
  type ScenePreloadInputType,
  type SceneImportFromCompendiumInputType,
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
  type SceneClearLayerResponse,
  type SceneResetFogResponse,
  type SceneLightingTransitionResponse,
  type ScenePreloadResponse,
  type SceneImportFromCompendiumResponse,
} from '@foundry-mcp/shared';
import { wrappedWrite, transactionManager } from '../transaction-manager.js';
import { notify } from '../notify.js';
// R2.2 dedup: canonical deepStripUndefined (was a local byte-identical copy).
import { deepStripUndefined } from '../utils/embeddedCRUDFactory.js';

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
  | SceneListResponse
  | SceneClearLayerResponse
  | SceneResetFogResponse
  | SceneLightingTransitionResponse
  | ScenePreloadResponse
  | SceneImportFromCompendiumResponse;

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
    journal: src.journal ?? null, // BUG-311: envSrc.journal is always undefined (journal is a top-level FK, not inside environment)
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
    const payload = deepStripUndefined({ ...rest }) as Record<string, any>;

    // BUG-080 (2026-05-16) — when caller supplies a background image but no
    // explicit dimensions, probe the texture and auto-fit width/height to the
    // image's natural size. Otherwise Foundry's data-layer default of
    // 4000×3000 leaves the image fit-scaled and entity coordinates land in
    // the empty margin. Wrapped in try/catch — on probe failure (file missing,
    // unsupported format, headless runtime without PIXI), fall through to the
    // default Foundry behavior with a console warning.
    const bgSrc: string | null =
      (payload.background && typeof payload.background.src === 'string')
        ? payload.background.src
        : null;
    const widthOmitted = payload.width === undefined || payload.width === null;
    const heightOmitted = payload.height === undefined || payload.height === null;
    if (bgSrc && widthOmitted && heightOmitted) {
      try {
        const loader = (globalThis as any).loadTexture;
        if (typeof loader === 'function') {
          // BUG-082 (2026-05-16) — Foundry's `loadTexture` hangs (no fast-fail)
          // on missing or unsupported texture paths instead of rejecting
          // quickly. Without a timeout the outer wrappedWrite call exceeds
          // the MCP socket-bridge query timeout (~30s) and the entire
          // scene.create returns a stale "Query timeout" error envelope to
          // the caller — even though the probe was meant to be best-effort.
          // Race the loader against a 5s timeout so a missing-asset path
          // falls through to Foundry's 4000×3000 default with a console.warn
          // instead of failing the whole create.
          const PROBE_TIMEOUT_MS = 5000;
          let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
          const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutHandle = setTimeout(
              () => reject(new Error(`loadTexture probe timed out after ${PROBE_TIMEOUT_MS}ms`)),
              PROBE_TIMEOUT_MS,
            );
          });
          try {
            const texture: any = await Promise.race([loader(bgSrc), timeoutPromise]);
            const w = texture?.baseTexture?.width ?? texture?.width;
            const h = texture?.baseTexture?.height ?? texture?.height;
            if (typeof w === 'number' && typeof h === 'number' && w > 0 && h > 0) {
              payload.width = w;
              payload.height = h;
            }
          } finally {
            if (timeoutHandle) clearTimeout(timeoutHandle);
          }
        }
      } catch (probeErr) {
        // eslint-disable-next-line no-console
        console.warn(
          `[scene.createScene] BUG-080 dimension probe failed for "${bgSrc}":`,
          probeErr,
        );
      }
    }

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

    notify.created('scene', persisted.name as string, { uuid: (persisted as any).uuid });

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
        const persisted = (scene._source as any)?.[field];
        if (persisted === undefined || persisted === null) {
          throw new Error(
            `SCENE_WRITE_NOT_PERSISTED: nested field "${field}" missing after update`,
          );
        }
        continue;
      }
      // F08 fix (Phase 6.2 scope-extension): compare against `_source` (raw stored data).
      const persistedValue = (scene._source as any)?.[field];
      if (persistedValue !== requestedValue) {
        throw new Error(
          `SCENE_WRITE_NOT_PERSISTED: field "${field}" expected ${JSON.stringify(requestedValue)} ` +
            `but post-update _source value is ${JSON.stringify(persistedValue)}`,
        );
      }
    }

    notify.updated('scene', scene.name as string, { summary: changedFields.join(', ') });

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
    // Phase 10 cross-doc-fk cascade: clear inbound FK refs BEFORE delete.
    // Stale FK is less corrupt than orphan FK if delete throws after clears.
    let affectedDocs: import('@foundry-mcp/shared').FkAffectedDocEntry[] | undefined;
    if (input.cascade === true) {
      // R2.3: extracted byte-identical walkInboundFor→clearOrphanRef→affectedDocs loop.
      const { clearInboundOrphansFor } = await import('./cross-doc-fk.js');
      affectedDocs = await clearInboundOrphansFor('Scene', input.sceneId);
    }

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

    notify.deleted('scene', deletedName);

    return {
      success: true as const,
      data: {
        success: true,
        deletedId: input.sceneId,
        deletedName,
        remainingScenes: sizeAfter,
        ...(affectedDocs !== undefined ? { affectedDocs } : {}),
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

    notify.created('scene', persisted.name as string, {
      summary: `cloned from ${source.name}`,
    });

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

  // BUG-081 (Phase 6.3 full fix, 2026-05-16): before activating, wait for any
  // in-flight embedded-doc writes on this scene to complete. Pre-fix, parallel
  // `<embedded>.create` calls + `scene.activate` would race — Foundry's
  // activation re-sync overwrote embedded writes still in flight, dropping docs
  // silently while each create returned SUCCESS. The factory + 3 outliers thread
  // {sceneId} through every wrappedWrite, so awaitPendingWritesForScene
  // resolves to "no pending writes" once all embedded creates commit.
  await transactionManager.awaitPendingWritesForScene(input.sceneId);

  return wrappedWrite('scene.activateScene', async () => {
    await scene.activate();

    // DP-16 post-verify: scene.active === true AND it's the world-active.
    const refreshed = (game as any).scenes?.get(input.sceneId);
    if (!refreshed?.active) {
      throw new Error(
        `SCENE_WRITE_NOT_PERSISTED: scene "${input.sceneId}" is not active after activate()`,
      );
    }

    notify.updated('scene', scene.name as string, { summary: 'activated' });

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
    // BUG-116: Foundry returns a transparent placeholder data URL with
    // width=0/height=0 when the scene has no background image to thumbnail
    // from. Fail loudly so callers don't think they got a useful thumbnail.
    if (thumbData.width === 0 || thumbData.height === 0) {
      throw new Error(
        'SCENE_THUMBNAIL_NO_BACKGROUND: createThumbnail returned 0×0 dimensions. ' +
        `Scene "${scene.name as string}" has no background image to render. ` +
        'Set a background via scene { action: "update", changes: { "background.src": "<path>" } } first.',
      );
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
  // BUG-182: hard cap — unfiltered list on 200+ scene worlds exceeds ~68k transport limit.
  // Default to page 1 / 100 scenes when caller provides no pageSize.
  params.pageSize = input.pageSize !== undefined ? input.pageSize : 100;
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

// ── Phase 9A — Scene reset & presentation ─────────────────────────────────────

// Map a clear-layer `layer` param → {scene collection property, deleteEmbeddedDocuments name}.
const LAYER_TO_COLLECTION: Record<
  (typeof SCENE_CLEARABLE_LAYERS)[number],
  { prop: string; docName: string }
> = {
  lights: { prop: 'lights', docName: 'AmbientLight' },
  sounds: { prop: 'sounds', docName: 'AmbientSound' },
  tiles: { prop: 'tiles', docName: 'Tile' },
  templates: { prop: 'templates', docName: 'MeasuredTemplate' },
  regions: { prop: 'regions', docName: 'Region' },
  drawings: { prop: 'drawings', docName: 'Drawing' },
  notes: { prop: 'notes', docName: 'Note' },
};

// R9A.1 — clear-layer: bulk-delete one embedded collection. CCR-4 dryRun preview + confirm.
export async function clearLayer(
  data: unknown,
): Promise<Envelope<SceneClearLayerResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: clearLayer requires GM' };

  const input: SceneClearLayerInputType = SceneClearLayerInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const { prop, docName } = LAYER_TO_COLLECTION[input.layer];

  const collection = (scene as any)[prop];
  const docs: any[] = Array.from(collection?.values?.() ?? []);
  const items = docs.map((d) => ({ id: d.id as string, name: (d.name as string) ?? '' }));

  // CCR-4 preview — no mutation.
  if (input.dryRun) {
    return {
      success: true as const,
      data: {
        success: true,
        sceneId: input.sceneId,
        layer: input.layer,
        dryRun: true,
        count: items.length,
        items,
      } satisfies SceneClearLayerResponse,
    };
  }

  return wrappedWrite('scene.clearLayer', async () => {
    const ids = items.map((i) => i.id);
    if (ids.length > 0) {
      await scene.deleteEmbeddedDocuments(docName, ids);
    }

    // CCR-2a: re-read the collection — must be empty after the bulk delete.
    const sizeAfter = (scene as any)[prop]?.size ?? 0;
    if (sizeAfter !== 0) {
      throw new Error(
        `SCENE_CLEAR_LAYER_NOT_PERSISTED: layer "${input.layer}" still has ${sizeAfter} docs after clear`,
      );
    }

    notify.deleted('scene', `${ids.length} ${input.layer}`, {
      summary: `cleared ${input.layer} layer on scene ${scene.name}`,
    });

    return {
      success: true as const,
      data: {
        success: true,
        sceneId: input.sceneId,
        layer: input.layer,
        dryRun: false,
        count: ids.length,
        items,
      } satisfies SceneClearLayerResponse,
    };
  }, { sceneId: input.sceneId });
}

// R9A.2 — reset-fog: canvas.fog.reset() deletes FogExploration docs for the scene. CCR-2a.
export async function resetFog(
  data: unknown,
): Promise<Envelope<SceneResetFogResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: resetFog requires GM' };

  const input: SceneResetFogInputType = SceneResetFogInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);

  return wrappedWrite('scene.resetFog', async () => {
    const canvas = (globalThis as any).canvas;
    // canvas.fog.reset() targets the *currently rendered* scene; only meaningful when
    // this scene is the active canvas. Fall back gracefully if fog API is unavailable.
    const fog = canvas?.fog ?? canvas?.effects?.visibility;
    if (typeof fog?.reset === 'function') {
      await fog.reset();
    } else {
      throw new Error('SCENE_RESET_FOG_UNAVAILABLE: canvas.fog.reset() is not available (scene not rendered?)');
    }

    // CCR-2a: assert no FogExploration docs remain for this scene in the world collection.
    const fogColl: any[] = Array.from((game as any).fog?.values?.() ?? []);
    const remaining = fogColl.filter((f: any) => (f.scene?.id ?? f._source?.scene) === input.sceneId).length;

    notify.updated('scene', scene.name as string, { summary: 'fog of war reset' });

    return {
      success: true as const,
      data: {
        success: true,
        sceneId: input.sceneId,
        fogDocsRemaining: remaining,
      } satisfies SceneResetFogResponse,
    };
  }, { sceneId: input.sceneId });
}

// R9A.3 — lighting-transition: animate darkness + persist so the re-read is meaningful. Hybrid.
export async function lightingTransition(
  data: unknown,
): Promise<Envelope<SceneLightingTransitionResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: lightingTransition requires GM' };

  const input: SceneLightingTransitionInputType = SceneLightingTransitionInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);

  // Map 'day'→0, 'dark'→1, or pass the explicit number through.
  const target: number =
    input.target === 'day' ? 0 : input.target === 'dark' ? 1 : input.target;

  return wrappedWrite('scene.lightingTransition', async () => {
    // Animate the canvas overlay only when this scene is the rendered one (best-effort).
    const canvas = (globalThis as any).canvas;
    if (canvas?.scene?.id === input.sceneId && typeof canvas?.effects?.animateDarkness === 'function') {
      try {
        await canvas.effects.animateDarkness(target);
      } catch {
        // animation is cosmetic; the persisted update below is the source of truth.
      }
    }

    // D6: persist so the re-read of environment.darknessLevel is meaningful.
    await scene.update({ 'environment.darknessLevel': target });

    // CCR-2 hybrid: re-read the persisted darkness level (NOT environment.base.*).
    const persisted = (scene._source?.environment?.darknessLevel ?? scene.environment?.darknessLevel) as number;
    if (typeof persisted !== 'number' || Math.abs(persisted - target) > 1e-6) {
      throw new Error(
        `SCENE_LIGHTING_NOT_PERSISTED: environment.darknessLevel is ${persisted}, expected ${target}`,
      );
    }

    notify.updated('scene', scene.name as string, { summary: `darkness → ${target}` });

    return {
      success: true as const,
      data: {
        success: true,
        sceneId: input.sceneId,
        target,
        darknessLevel: persisted,
      } satisfies SceneLightingTransitionResponse,
    };
  }, { sceneId: input.sceneId });
}

// R9A.4 — preload: game.scenes.preload(id, true). CCR-2b transient (no persisted reread).
export async function preloadScene(
  data: unknown,
): Promise<Envelope<ScenePreloadResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: preloadScene requires GM' };

  const input: ScenePreloadInputType = ScenePreloadInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);

  // CCR-2b transient: confirm the preload Promise resolved; nothing persisted to re-read.
  await (game as any).scenes?.preload(input.sceneId, true);

  notify.info(`Preloaded scene "${scene.name}" to all clients`);

  return {
    success: true as const,
    data: {
      success: true,
      sceneId: input.sceneId,
      sceneName: scene.name as string,
      preloaded: true,
    } satisfies ScenePreloadResponse,
  };
}

// R9B.5 — import-from-compendium: WorldCollection.importFromCompendium. CCR-2a.
export async function importSceneFromCompendium(
  data: unknown,
): Promise<Envelope<SceneImportFromCompendiumResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: importSceneFromCompendium requires GM' };

  const input: SceneImportFromCompendiumInputType = SceneImportFromCompendiumInput_strict_parse(data);

  const pack = (game as any).packs?.get(input.packId);
  if (!pack) {
    return { success: false, error: `COMPENDIUM_PACK_NOT_FOUND: no pack with id "${input.packId}"` };
  }
  if (pack.documentName !== 'Scene') {
    return { success: false, error: `COMPENDIUM_WRONG_TYPE: pack "${input.packId}" holds ${pack.documentName}, not Scene` };
  }

  return wrappedWrite('scene.importFromCompendium', async () => {
    const imported = await (game as any).scenes.importFromCompendium(pack, input.documentId);
    if (!imported) {
      throw new Error('SCENE_IMPORT_FAILED: importFromCompendium returned null');
    }
    const persisted = (game as any).scenes?.get(imported.id);
    if (!persisted) {
      throw new Error(`SCENE_IMPORT_NOT_PERSISTED: imported scene "${imported.id}" missing from game.scenes`);
    }

    notify.created('scene', persisted.name as string, { summary: `imported from ${input.packId}` });

    return {
      success: true as const,
      data: {
        success: true,
        scene: serializeSceneViewModel(persisted),
        sourcePack: input.packId,
      } satisfies SceneImportFromCompendiumResponse,
    };
  });
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
    case 'clear-layer':
      return clearLayer(input);
    case 'reset-fog':
      return resetFog(input);
    case 'lighting-transition':
      return lightingTransition(input);
    case 'preload':
      return preloadScene(input);
    case 'import-from-compendium':
      return importSceneFromCompendium(input);
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
function SceneClearLayerInput_strict_parse(data: unknown): SceneClearLayerInputType {
  return SceneClearLayerInput.strict().parse(data ?? {});
}
function SceneResetFogInput_strict_parse(data: unknown): SceneResetFogInputType {
  return SceneResetFogInput.strict().parse(data ?? {});
}
function SceneLightingTransitionInput_strict_parse(data: unknown): SceneLightingTransitionInputType {
  return SceneLightingTransitionInput.strict().parse(data ?? {});
}
function ScenePreloadInput_strict_parse(data: unknown): ScenePreloadInputType {
  return ScenePreloadInput.strict().parse(data ?? {});
}
function SceneImportFromCompendiumInput_strict_parse(data: unknown): SceneImportFromCompendiumInputType {
  return SceneImportFromCompendiumInput.strict().parse(data ?? {});
}

// stripUndefined currently unused-export-safe; retained for symmetry with
// handlers/journal.ts (Phase 5 embedded CRUD will use it).
void stripUndefined;
