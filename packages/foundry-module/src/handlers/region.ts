// Phase 5 mcp_crud_expansion — Region handlers (umbrella, 8 actions).
//
// 5 base Region embedded-CRUD actions + 3 RegionBehavior CRUD actions
// (createBehavior / updateBehavior / deleteBehavior). RegionBehavior is
// an EmbeddedCollectionField ON RegionDocument (not on Scene) — so behavior
// mutations target `region.createEmbeddedDocuments('RegionBehavior', [...])`
// rather than `scene.createEmbeddedDocuments`.
//
// CCR-Trust: validateGMAccess() on every write.
// CCR-Transactions: wrappedWrite('region.<name>', ...).
// CCR-Envelope: returns {success, data} | {success, error}.
// CCR-Schema-Fidelity: Phase 0 probe-locked (phase5_probes.md §Region + §RegionBehavior_*).
// DP-16: re-read via getEmbeddedOrThrow after every write.
//
// DRIFT-1 RESOLVED (Region.shapes 4 variants — rectangle/circle/ellipse/polygon):
//   Zod RegionShapeSchema handles the 4-variant discriminated union.
//
// DRIFT-2 RESOLVED (RegionBehavior events INSIDE system, not top-level):
//   Per-subtype `system` payload includes events: SetField<StringField> for
//   ExecuteMacro / DisplayScrollingText / ExecuteScript only. The other 4
//   subtypes (TeleportToken / AdjustDarknessLevel / SuppressWeather / PauseGame)
//   have no events in system. Foundry runtime validates against per-subtype schema.
//
// Risk 5.B contingency NOT triggered — all 7 subtypes typed via Zod discriminator.

import {
  RegionToolInput,
  RegionCreateInput,
  RegionUpdateInput,
  RegionDeleteInput,
  RegionGetInput,
  RegionListInput,
  RegionCreateBehaviorInput,
  RegionUpdateBehaviorInput,
  RegionDeleteBehaviorInput,
  type RegionToolInputType,
  type RegionCreateInputType,
  type RegionUpdateInputType,
  type RegionDeleteInputType,
  type RegionGetInputType,
  type RegionListInputType,
  type RegionCreateBehaviorInputType,
  type RegionUpdateBehaviorInputType,
  type RegionDeleteBehaviorInputType,
  type RegionViewModel,
  type RegionListItem,
  type RegionBehaviorSummary,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { getEmbeddedOrThrow } from '../utils/getEmbeddedOrThrow.js';

type AccessGate = { allowed: boolean };
type EnvelopeOK<T> = { success: true; data: T };
type EnvelopeErr = { success: false; error: string };
type Envelope<T> = EnvelopeOK<T> | EnvelopeErr;

export interface RegionCreateResponse {
  success: true;
  region: RegionViewModel;
  requestedChanges: Record<string, unknown>;
}
export interface RegionUpdateResponse {
  success: true;
  region: RegionViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}
export interface RegionDeleteResponse {
  success: true;
  deletedId: string;
  sceneId: string;
  remainingRegions: number;
}
export interface RegionGetResponse {
  success: true;
  region: RegionViewModel;
}
export interface RegionListResponse {
  success: true;
  regions: RegionListItem[];
  total: number;
  page: number;
  pageSize: number;
  countOnly?: boolean;
  filterApplied?: string | null;
}
export interface RegionBehaviorCreateResponse {
  success: true;
  regionId: string;
  behavior: RegionBehaviorSummary;
}
export interface RegionBehaviorUpdateResponse {
  success: true;
  regionId: string;
  behavior: RegionBehaviorSummary;
  changedFields: string[];
}
export interface RegionBehaviorDeleteResponse {
  success: true;
  regionId: string;
  deletedBehaviorId: string;
  remainingBehaviors: number;
}

export type RegionResponse =
  | RegionCreateResponse
  | RegionUpdateResponse
  | RegionDeleteResponse
  | RegionGetResponse
  | RegionListResponse
  | RegionBehaviorCreateResponse
  | RegionBehaviorUpdateResponse
  | RegionBehaviorDeleteResponse;

function validateGMAccess(): AccessGate {
  return { allowed: Boolean(game.user?.isGM) };
}

function deepStripUndefined<T>(value: T): T {
  if (Array.isArray(value)) return value.map(deepStripUndefined) as any;
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

function getActiveSceneOrThrow(): any {
  const scene = (game as any).scenes?.active;
  if (!scene) throw new Error('NO_ACTIVE_SCENE: no scene is currently active');
  return scene;
}

// ── Serializers ──────────────────────────────────────────────────────────────

function serializeBehaviorSummary(b: any): RegionBehaviorSummary {
  const system = b.system?._source ?? b._source?.system ?? b.system ?? {};
  return {
    id: b.id as string,
    name: (b.name as string) ?? '',
    type: b.type as string,
    disabled: Boolean(b.disabled),
    system: system as Record<string, unknown>,
  };
}

function serializeRegionViewModel(
  scene: any,
  region: any,
  includeBehaviors: boolean,
): RegionViewModel {
  const shapesRaw = (region._source?.shapes ?? region.shapes ?? []) as any[];
  const shapes = Array.isArray(shapesRaw)
    ? shapesRaw.map((s) => ({ ...s }))
    : [];

  const behaviors = includeBehaviors
    ? (Array.from(region.behaviors?.values?.() ?? []) as any[]).map(serializeBehaviorSummary)
    : null;

  const base: RegionViewModel = {
    id: region.id as string,
    sceneId: scene.id as string,
    name: (region.name as string) ?? '',
    color: (region.color as string) ?? '#000000',
    shapes,
    elevation: {
      bottom: (region.elevation?.bottom as number | null) ?? null,
      top: (region.elevation?.top as number | null) ?? null,
    },
    visibility: (region.visibility as number) ?? 0,
    locked: Boolean(region.locked),
    behaviorCount: region.behaviors?.size ?? 0,
    flags: (region.flags as Record<string, unknown>) ?? {},
  };
  if (behaviors !== null) base.behaviors = behaviors;
  return base;
}

function serializeRegionListItem(scene: any, region: any): RegionListItem {
  const shapes = (region._source?.shapes ?? region.shapes ?? []) as any[];
  return {
    id: region.id as string,
    sceneId: scene.id as string,
    name: (region.name as string) ?? '',
    shapeCount: Array.isArray(shapes) ? shapes.length : 0,
    behaviorCount: region.behaviors?.size ?? 0,
    locked: Boolean(region.locked),
    visibility: (region.visibility as number) ?? 0,
  };
}

// ── 1. createRegion ──────────────────────────────────────────────────────────

export async function createRegion(data: unknown): Promise<Envelope<RegionCreateResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: createRegion requires GM' };

  const input: RegionCreateInputType = RegionCreateInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);

  const { action: _action, sceneId: _sceneId, ...rest } = input;
  const requestedChanges: Record<string, unknown> = { ...rest };

  return wrappedWrite('region.create', async () => {
    const payload = deepStripUndefined({ ...rest });
    const created = await scene.createEmbeddedDocuments('Region', [payload]);
    if (!created || created.length === 0) {
      throw new Error('REGION_WRITE_NOT_PERSISTED: createEmbeddedDocuments returned no doc');
    }
    const persisted = getEmbeddedOrThrow<any>(scene, 'regions', created[0].id, 'Region');
    return {
      success: true as const,
      data: {
        success: true,
        region: serializeRegionViewModel(scene, persisted, false),
        requestedChanges,
      } satisfies RegionCreateResponse,
    };
  });
}

// ── 2. updateRegion ──────────────────────────────────────────────────────────

export async function updateRegion(data: unknown): Promise<Envelope<RegionUpdateResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: updateRegion requires GM' };

  const input: RegionUpdateInputType = RegionUpdateInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const region = getEmbeddedOrThrow<any>(scene, 'regions', input.regionId, 'Region');

  const requestedChanges: Record<string, unknown> = { ...input.changes };
  const changedFields = Object.keys(requestedChanges);

  return wrappedWrite('region.update', async () => {
    const payload = deepStripUndefined({ ...input.changes });
    await region.update(payload);

    // DP-16 — scalar/string fields verified; nested (elevation, shapes, flags) trust Foundry merge.
    for (const [field, requestedValue] of Object.entries(requestedChanges)) {
      if (field === 'elevation' || field === 'shapes' || field === 'flags') {
        const persisted = (region as any)[field];
        if (persisted === undefined || persisted === null) {
          throw new Error(`REGION_WRITE_NOT_PERSISTED: nested "${field}" missing after update`);
        }
        continue;
      }
      const persistedValue = (region as any)[field];
      if (persistedValue !== requestedValue) {
        throw new Error(
          `REGION_WRITE_NOT_PERSISTED: field "${field}" expected ${JSON.stringify(requestedValue)} ` +
            `but post-update is ${JSON.stringify(persistedValue)}`,
        );
      }
    }

    return {
      success: true as const,
      data: {
        success: true,
        region: serializeRegionViewModel(scene, region, false),
        requestedChanges,
        changedFields,
      } satisfies RegionUpdateResponse,
    };
  });
}

// ── 3. deleteRegion ──────────────────────────────────────────────────────────

export async function deleteRegion(data: unknown): Promise<Envelope<RegionDeleteResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: deleteRegion requires GM' };

  const input: RegionDeleteInputType = RegionDeleteInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const region = getEmbeddedOrThrow<any>(scene, 'regions', input.regionId, 'Region');
  const sizeBefore = scene.regions?.size ?? 0;

  return wrappedWrite('region.delete', async () => {
    await region.delete();

    const post = scene.regions?.get(input.regionId);
    if (post) {
      throw new Error(`REGION_WRITE_NOT_PERSISTED: region "${input.regionId}" still present`);
    }
    const sizeAfter = scene.regions?.size ?? 0;
    if (sizeAfter !== sizeBefore - 1) {
      throw new Error(
        `REGION_WRITE_NOT_PERSISTED: scene.regions.size expected ${sizeBefore - 1} ` +
          `but found ${sizeAfter}`,
      );
    }
    return {
      success: true as const,
      data: {
        success: true,
        deletedId: input.regionId,
        sceneId: input.sceneId,
        remainingRegions: sizeAfter,
      } satisfies RegionDeleteResponse,
    };
  });
}

// ── 4. getRegion ─────────────────────────────────────────────────────────────

export async function getRegion(data: unknown): Promise<Envelope<RegionGetResponse>> {
  const input: RegionGetInputType = RegionGetInput_strict_parse(data);
  try {
    const scene = getSceneOrThrow(input.sceneId);
    const region = getEmbeddedOrThrow<any>(scene, 'regions', input.regionId, 'Region');
    return {
      success: true,
      data: {
        success: true,
        region: serializeRegionViewModel(scene, region, Boolean(input.includeBehaviors)),
      },
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'getRegion failed' };
  }
}

// ── 5. listRegions ───────────────────────────────────────────────────────────

export async function listRegions(data: unknown): Promise<Envelope<RegionListResponse>> {
  const input: RegionListInputType = RegionListInput_strict_parse(data);
  try {
    const scene = input.sceneId ? getSceneOrThrow(input.sceneId) : getActiveSceneOrThrow();
    let regions: any[] = Array.from(scene.regions?.values?.() ?? []);

    const filterApplied = input.filter ?? null;
    if (filterApplied) {
      const needle = filterApplied.toLowerCase();
      regions = regions.filter((r) => ((r.name as string) ?? '').toLowerCase().includes(needle));
    }
    if (typeof input.locked === 'boolean') {
      regions = regions.filter((r) => Boolean(r.locked) === input.locked);
    }

    const total = regions.length;
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 50;
    const items = input.countOnly ? [] : regions.slice((page - 1) * pageSize, page * pageSize);

    return {
      success: true,
      data: {
        success: true,
        regions: items.map((r) => serializeRegionListItem(scene, r)),
        total,
        page,
        pageSize,
        countOnly: input.countOnly ?? false,
        filterApplied,
      } satisfies RegionListResponse,
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'listRegions failed' };
  }
}

// ── 6. createBehavior ───────────────────────────────────────────────────────
//
// DRIFT-2: `behavior.system` already includes `events` for subtypes that opt in
// (executeMacro / displayScrollingText / executeScript). Other 4 subtypes have
// no events field in system. Foundry per-subtype defineSchema validates at write.

export async function createBehavior(
  data: unknown,
): Promise<Envelope<RegionBehaviorCreateResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed)
    return { success: false, error: 'Access denied: region.createBehavior requires GM' };

  const input: RegionCreateBehaviorInputType = RegionCreateBehaviorInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const region = getEmbeddedOrThrow<any>(scene, 'regions', input.regionId, 'Region');

  return wrappedWrite('region.createBehavior', async () => {
    const payload = deepStripUndefined({
      name: input.name ?? '',
      type: input.behavior.type,
      system: input.behavior.system,
      disabled: input.disabled ?? false,
    });
    const created = await region.createEmbeddedDocuments('RegionBehavior', [payload]);
    if (!created || created.length === 0) {
      throw new Error('BEHAVIOR_WRITE_NOT_PERSISTED: createEmbeddedDocuments returned no doc');
    }
    const persisted = getEmbeddedOrThrow<any>(region, 'behaviors', created[0].id, 'RegionBehavior');
    return {
      success: true as const,
      data: {
        success: true,
        regionId: region.id as string,
        behavior: serializeBehaviorSummary(persisted),
      } satisfies RegionBehaviorCreateResponse,
    };
  });
}

// ── 7. updateBehavior ───────────────────────────────────────────────────────

export async function updateBehavior(
  data: unknown,
): Promise<Envelope<RegionBehaviorUpdateResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed)
    return { success: false, error: 'Access denied: region.updateBehavior requires GM' };

  const input: RegionUpdateBehaviorInputType = RegionUpdateBehaviorInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const region = getEmbeddedOrThrow<any>(scene, 'regions', input.regionId, 'Region');
  const behavior = getEmbeddedOrThrow<any>(
    region,
    'behaviors',
    input.behaviorId,
    'RegionBehavior',
  );

  // CCR-Type-Locked: if a `behavior` payload is supplied, its `type` MUST match
  // the existing behavior's type. Cross-subtype migration is unsupported here.
  if (input.behavior && input.behavior.type !== behavior.type) {
    return {
      success: false,
      error:
        `BEHAVIOR_TYPE_MISMATCH: existing type "${behavior.type}" cannot be changed to "${input.behavior.type}". ` +
        'Delete and re-create the behavior to switch subtypes.',
    };
  }

  const changes: Record<string, unknown> = {};
  if (input.name !== undefined) changes.name = input.name;
  if (input.disabled !== undefined) changes.disabled = input.disabled;
  if (input.behavior) changes.system = input.behavior.system;

  const changedFields = Object.keys(changes);
  if (changedFields.length === 0) {
    return { success: false, error: 'BEHAVIOR_EMPTY_PAYLOAD: updateBehavior requires at least one change' };
  }

  return wrappedWrite('region.updateBehavior', async () => {
    const payload = deepStripUndefined(changes);
    await behavior.update(payload);
    return {
      success: true as const,
      data: {
        success: true,
        regionId: region.id as string,
        behavior: serializeBehaviorSummary(behavior),
        changedFields,
      } satisfies RegionBehaviorUpdateResponse,
    };
  });
}

// ── 8. deleteBehavior ───────────────────────────────────────────────────────

export async function deleteBehavior(
  data: unknown,
): Promise<Envelope<RegionBehaviorDeleteResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed)
    return { success: false, error: 'Access denied: region.deleteBehavior requires GM' };

  const input: RegionDeleteBehaviorInputType = RegionDeleteBehaviorInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const region = getEmbeddedOrThrow<any>(scene, 'regions', input.regionId, 'Region');
  const behavior = getEmbeddedOrThrow<any>(
    region,
    'behaviors',
    input.behaviorId,
    'RegionBehavior',
  );
  const sizeBefore = region.behaviors?.size ?? 0;

  return wrappedWrite('region.deleteBehavior', async () => {
    await behavior.delete();
    const post = region.behaviors?.get(input.behaviorId);
    if (post) {
      throw new Error(
        `BEHAVIOR_WRITE_NOT_PERSISTED: behavior "${input.behaviorId}" still present after delete()`,
      );
    }
    const sizeAfter = region.behaviors?.size ?? 0;
    if (sizeAfter !== sizeBefore - 1) {
      throw new Error(
        `BEHAVIOR_WRITE_NOT_PERSISTED: region.behaviors.size expected ${sizeBefore - 1} ` +
          `but found ${sizeAfter}`,
      );
    }
    return {
      success: true as const,
      data: {
        success: true,
        regionId: region.id as string,
        deletedBehaviorId: input.behaviorId,
        remainingBehaviors: sizeAfter,
      } satisfies RegionBehaviorDeleteResponse,
    };
  });
}

// ── Dispatcher ──────────────────────────────────────────────────────────────

export async function dispatchRegion(data: unknown): Promise<Envelope<RegionResponse>> {
  let input: RegionToolInputType;
  try {
    input = RegionToolInput.parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }
  switch (input.action) {
    case 'create':
      return createRegion(input);
    case 'update':
      return updateRegion(input);
    case 'delete':
      return deleteRegion(input);
    case 'get':
      return getRegion(input);
    case 'list':
      return listRegions(input);
    case 'createBehavior':
      return createBehavior(input);
    case 'updateBehavior':
      return updateBehavior(input);
    case 'deleteBehavior':
      return deleteBehavior(input);
  }
}

// ── Per-handler strict-parse wrappers ───────────────────────────────────────

function RegionCreateInput_strict_parse(data: unknown): RegionCreateInputType {
  return RegionCreateInput.parse(data ?? {});
}
function RegionUpdateInput_strict_parse(data: unknown): RegionUpdateInputType {
  return RegionUpdateInput.parse(data ?? {});
}
function RegionDeleteInput_strict_parse(data: unknown): RegionDeleteInputType {
  return RegionDeleteInput.parse(data ?? {});
}
function RegionGetInput_strict_parse(data: unknown): RegionGetInputType {
  return RegionGetInput.parse(data ?? {});
}
function RegionListInput_strict_parse(data: unknown): RegionListInputType {
  return RegionListInput.parse(data ?? {});
}
function RegionCreateBehaviorInput_strict_parse(data: unknown): RegionCreateBehaviorInputType {
  return RegionCreateBehaviorInput.parse(data ?? {});
}
function RegionUpdateBehaviorInput_strict_parse(data: unknown): RegionUpdateBehaviorInputType {
  return RegionUpdateBehaviorInput.parse(data ?? {});
}
function RegionDeleteBehaviorInput_strict_parse(data: unknown): RegionDeleteBehaviorInputType {
  return RegionDeleteBehaviorInput.parse(data ?? {});
}
