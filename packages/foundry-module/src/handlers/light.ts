// Phase 5 mcp_crud_expansion — AmbientLight CRUD handler (5 actions).
//
// Foundry-side write/read surface for the `light` MCP umbrella tool.
// Actions: create / update / delete / get / list.
// All operate on scene.lights (EmbeddedCollectionField of AmbientLightDocument).
//
// CCR-Trust: every write starts with validateGMAccess().
// CCR-Transactions: every write routes through wrappedWrite('light.<name>', ...).
// CCR-Envelope: returns {success, data} or {success, error}.
// BUG-075: snapshot input shape BEFORE every mutating call.
// DP-16: post-verify each write by re-reading via getEmbeddedOrThrow.

import {
  LightToolInput,
  LightCreateInput,
  LightUpdateInput,
  LightDeleteInput,
  LightGetInput,
  LightListInput,
  type LightToolInputType,
  type LightCreateInputType,
  type LightUpdateInputType,
  type LightDeleteInputType,
  type LightGetInputType,
  type LightListInputType,
  type LightViewModel,
  type LightListItem,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { getEmbeddedOrThrow } from '../utils/getEmbeddedOrThrow.js';

// ── Local types ──────────────────────────────────────────────────────────────

type EnvelopeOK<T> = { success: true; data: T };
type EnvelopeErr = { success: false; error: string };
type Envelope<T> = EnvelopeOK<T> | EnvelopeErr;

interface LightCreateResponse {
  success: true;
  light: LightViewModel;
  requestedChanges: Record<string, unknown>;
}
interface LightUpdateResponse {
  success: true;
  light: LightViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}
interface LightDeleteResponse {
  success: true;
  deletedId: string;
  remainingLights: number;
}
interface LightGetResponse {
  success: true;
  light: LightViewModel;
}
interface LightListBareResponse {
  success: true;
  lights: LightListItem[];
}
interface LightListPaginatedResponse {
  success: true;
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  lights: LightListItem[];
}
interface LightListCountResponse {
  success: true;
  total: number;
  filterApplied: boolean;
}

type LightListResponse = LightListBareResponse | LightListPaginatedResponse | LightListCountResponse;

type LightResponse =
  | LightCreateResponse
  | LightUpdateResponse
  | LightDeleteResponse
  | LightGetResponse
  | LightListResponse;

// ── Access gate ──────────────────────────────────────────────────────────────

function validateGMAccess(): { allowed: boolean } {
  if (!game.user?.isGM) return { allowed: false };
  return { allowed: true };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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
  if (!scene) throw new Error(`SCENE_NOT_FOUND: no Scene with id "${sceneId}"`);
  return scene;
}

// ── Serializers ──────────────────────────────────────────────────────────────

function serializeLightViewModel(scene: any, light: any): LightViewModel {
  const cfg = light.config ?? {};
  const anim = cfg.animation ?? {};
  const dark = cfg.darkness ?? {};
  return {
    id: light.id as string,
    sceneId: scene.id as string,
    x: typeof light.x === 'number' ? light.x : 0,
    y: typeof light.y === 'number' ? light.y : 0,
    elevation: typeof light.elevation === 'number' ? light.elevation : 0,
    rotation: typeof light.rotation === 'number' ? light.rotation : 0,
    walls: light.walls !== false,
    vision: !!light.vision,
    hidden: !!light.hidden,
    isGlobal: light.isGlobal === true,
    config: {
      negative: !!cfg.negative,
      priority: typeof cfg.priority === 'number' ? cfg.priority : 0,
      alpha: typeof cfg.alpha === 'number' ? cfg.alpha : 0.5,
      angle: typeof cfg.angle === 'number' ? cfg.angle : 360,
      bright: typeof cfg.bright === 'number' ? cfg.bright : 0,
      color: cfg.color ?? null,
      coloration: typeof cfg.coloration === 'number' ? cfg.coloration : null,
      dim: typeof cfg.dim === 'number' ? cfg.dim : 0,
      attenuation: typeof cfg.attenuation === 'number' ? cfg.attenuation : 0.5,
      luminosity: typeof cfg.luminosity === 'number' ? cfg.luminosity : 0.5,
      saturation: typeof cfg.saturation === 'number' ? cfg.saturation : 0,
      contrast: typeof cfg.contrast === 'number' ? cfg.contrast : 0,
      shadows: typeof cfg.shadows === 'number' ? cfg.shadows : 0,
      animation: {
        type: anim.type ?? null,
        speed: typeof anim.speed === 'number' ? anim.speed : 5,
        intensity: typeof anim.intensity === 'number' ? anim.intensity : 5,
        reverse: !!anim.reverse,
      },
      darkness: {
        min: typeof dark.min === 'number' ? dark.min : 0,
        max: typeof dark.max === 'number' ? dark.max : 1,
      },
    },
    flags: (light.flags as Record<string, unknown>) ?? {},
  };
}

function serializeLightListItem(scene: any, light: any): LightListItem {
  return {
    id: light.id as string,
    sceneId: scene.id as string,
    isGlobal: light.isGlobal === true,
    hidden: !!light.hidden,
    dim: typeof light.config?.dim === 'number' ? light.config.dim : 0,
    bright: typeof light.config?.bright === 'number' ? light.config.bright : 0,
  };
}

// ── 1. createLight ───────────────────────────────────────────────────────────

export async function createLight(data: unknown): Promise<Envelope<LightCreateResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: createLight requires GM' };

  const input: LightCreateInputType = LightCreateInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);

  // BUG-075: snapshot BEFORE Foundry mutates the input.
  const { action: _action, sceneId: _sceneId, ...rest } = input;
  const requestedChanges: Record<string, unknown> = { ...rest };

  return wrappedWrite('light.createLight', async () => {
    const payload = deepStripUndefined({ ...rest });
    const created = await scene.createEmbeddedDocuments('AmbientLight', [payload]);
    const doc = Array.isArray(created) ? created[0] : created;
    if (!doc) {
      throw new Error('LIGHT_WRITE_NOT_PERSISTED: createEmbeddedDocuments returned nothing');
    }

    // DP-16 post-verify: re-read from the scene collection.
    const persisted = getEmbeddedOrThrow(scene, 'lights', doc.id, 'AmbientLight');

    return {
      success: true as const,
      data: {
        success: true,
        light: serializeLightViewModel(scene, persisted),
        requestedChanges,
      } satisfies LightCreateResponse,
    };
  });
}

// ── 2. updateLight ───────────────────────────────────────────────────────────

export async function updateLight(data: unknown): Promise<Envelope<LightUpdateResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: updateLight requires GM' };

  const input: LightUpdateInputType = LightUpdateInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const light = getEmbeddedOrThrow<any>(scene, 'lights', input.lightId, 'AmbientLight');

  // BUG-075: snapshot BEFORE the mutating call.
  const requestedChanges: Record<string, unknown> = { ...input.changes };
  const changedFields = Object.keys(requestedChanges);

  return wrappedWrite('light.updateLight', async () => {
    await light.update(input.changes);

    // DP-16 post-verify: re-read and confirm top-level scalar fields.
    const persisted = getEmbeddedOrThrow<any>(scene, 'lights', input.lightId, 'AmbientLight');
    for (const [field, requestedValue] of Object.entries(requestedChanges)) {
      if (field === 'config' || field === 'flags') {
        // Nested SchemaFields — skip deep verify; just confirm the field exists.
        if ((persisted as any)[field] === undefined) {
          throw new Error(`LIGHT_WRITE_NOT_PERSISTED: nested field "${field}" missing after update`);
        }
        continue;
      }
      const persistedValue = (persisted as any)[field];
      if (persistedValue !== requestedValue) {
        throw new Error(
          `LIGHT_WRITE_NOT_PERSISTED: field "${field}" expected ${JSON.stringify(requestedValue)} ` +
            `but post-update value is ${JSON.stringify(persistedValue)}`,
        );
      }
    }

    return {
      success: true as const,
      data: {
        success: true,
        light: serializeLightViewModel(scene, persisted),
        requestedChanges,
        changedFields,
      } satisfies LightUpdateResponse,
    };
  });
}

// ── 3. deleteLight ───────────────────────────────────────────────────────────

export async function deleteLight(data: unknown): Promise<Envelope<LightDeleteResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: deleteLight requires GM' };

  const input: LightDeleteInputType = LightDeleteInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  // Confirm doc exists before delete.
  getEmbeddedOrThrow(scene, 'lights', input.lightId, 'AmbientLight');

  return wrappedWrite('light.deleteLight', async () => {
    await scene.deleteEmbeddedDocuments('AmbientLight', [input.lightId]);

    // DP-16 post-verify: ensure the doc is gone.
    const stillPresent = scene.lights?.get?.(input.lightId);
    if (stillPresent) {
      throw new Error(
        `LIGHT_WRITE_NOT_PERSISTED: AmbientLight "${input.lightId}" still present on scene ` +
          `"${input.sceneId}" after delete`,
      );
    }

    return {
      success: true as const,
      data: {
        success: true,
        deletedId: input.lightId,
        remainingLights: scene.lights?.size ?? 0,
      } satisfies LightDeleteResponse,
    };
  });
}

// ── 4. getLight ──────────────────────────────────────────────────────────────

export async function getLight(data: unknown): Promise<Envelope<LightGetResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: getLight requires GM' };

  const input: LightGetInputType = LightGetInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const light = getEmbeddedOrThrow<any>(scene, 'lights', input.lightId, 'AmbientLight');

  return {
    success: true,
    data: {
      success: true,
      light: serializeLightViewModel(scene, light),
    } satisfies LightGetResponse,
  };
}

// ── 5. listLights ────────────────────────────────────────────────────────────

export async function listLights(data: unknown): Promise<Envelope<LightListResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: listLights requires GM' };

  const input: LightListInputType = LightListInput_strict_parse(data);

  // Resolve scene: explicit sceneId or fall back to active scene.
  const sceneId = input.sceneId ?? (game as any).scenes?.active?.id;
  if (!sceneId) {
    throw new Error('NO_ACTIVE_SCENE: no sceneId provided and no active scene found');
  }
  const scene = getSceneOrThrow(sceneId);

  const allLights: any[] = (scene.lights?.contents as any[] | undefined) ?? [];

  // Apply optional filters.
  let filtered = allLights;
  if (input.hidden !== undefined) {
    filtered = filtered.filter((l) => !!l.hidden === input.hidden);
  }
  if (input.isGlobal !== undefined) {
    filtered = filtered.filter((l) => (l.isGlobal === true) === input.isGlobal);
  }
  if (input.filter) {
    // AmbientLight has no name field — filter against stringified x/y position as a fallback.
    const lc = input.filter.toLowerCase();
    filtered = filtered.filter((l) => {
      const haystack = `${l.x ?? 0},${l.y ?? 0} ${l.id}`.toLowerCase();
      return haystack.includes(lc);
    });
  }

  const total = filtered.length;

  // countOnly: skip serialization.
  if (input.countOnly) {
    const filterApplied = !!(input.hidden !== undefined || input.isGlobal !== undefined || input.filter);
    return {
      success: true,
      data: { success: true, total, filterApplied } satisfies LightListCountResponse,
    };
  }

  // Pagination.
  if (input.page !== undefined || input.pageSize !== undefined) {
    const pageSize = input.pageSize ?? 20;
    const page = input.page ?? 1;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const offset = (page - 1) * pageSize;
    const paginated = filtered.slice(offset, offset + pageSize);
    return {
      success: true,
      data: {
        success: true,
        total,
        page,
        pageSize,
        pageCount,
        lights: paginated.map((l) => serializeLightListItem(scene, l)),
      } satisfies LightListPaginatedResponse,
    };
  }

  // Bare list.
  return {
    success: true,
    data: {
      success: true,
      lights: filtered.map((l) => serializeLightListItem(scene, l)),
    } satisfies LightListBareResponse,
  };
}

// ── Dispatcher ───────────────────────────────────────────────────────────────

export async function dispatchLight(data: unknown): Promise<Envelope<LightResponse>> {
  let input: LightToolInputType;
  try {
    input = LightToolInput.parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  switch (input.action) {
    case 'create':
      return createLight(input);
    case 'update':
      return updateLight(input);
    case 'delete':
      return deleteLight(input);
    case 'get':
      return getLight(input);
    case 'list':
      return listLights(input);
    default: {
      const exhaustive: never = input;
      throw new Error(`Unknown light action: ${(exhaustive as any).action}`);
    }
  }
}

// ── Per-handler strict-parse wrappers ────────────────────────────────────────

function LightCreateInput_strict_parse(data: unknown): LightCreateInputType {
  return LightCreateInput.strict().parse(data ?? {});
}
function LightUpdateInput_strict_parse(data: unknown): LightUpdateInputType {
  return LightUpdateInput.strict().parse(data ?? {});
}
function LightDeleteInput_strict_parse(data: unknown): LightDeleteInputType {
  return LightDeleteInput.strict().parse(data ?? {});
}
function LightGetInput_strict_parse(data: unknown): LightGetInputType {
  return LightGetInput.strict().parse(data ?? {});
}
function LightListInput_strict_parse(data: unknown): LightListInputType {
  return LightListInput.strict().parse(data ?? {});
}
