// Phase 5 mcp_crud_expansion — AmbientSound handlers (umbrella, 5 actions).
//
// Foundry-side write/read surface for the `sound` MCP umbrella tool.
// Operates on scene.sounds (EmbeddedCollectionField of AmbientSoundDocument).
//
// CCR-Trust: every write function starts with validateGMAccess().
// CCR-Transactions: every write routes through wrappedWrite('sound.<name>', ...).
// CCR-Envelope: returns {success, data} or {success, error}.
// CCR-Schema-Fidelity: field paths mirror AmbientSoundDocument.defineSchema() 1:1
//                      (Phase 5 probe-locked — see phase5_probes.md §AmbientSound).
// BUG-075: snapshot-clone requestedChanges BEFORE every mutating call.
// DP-16: post-verify each write by re-reading via getEmbeddedOrThrow().
// Spike-Sentinel 6: effects.{base,muffled}.{type,intensity} confirmed.

import {
  SoundToolInput,
  SoundCreateInput,
  SoundUpdateInput,
  SoundDeleteInput,
  SoundGetInput,
  SoundListInput,
  type SoundToolInputType,
  type SoundCreateInputType,
  type SoundUpdateInputType,
  type SoundDeleteInputType,
  type SoundGetInputType,
  type SoundListInputType,
  type SoundViewModel,
  type SoundListItem,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { getEmbeddedOrThrow } from '../utils/getEmbeddedOrThrow.js';

// ── Local types ──────────────────────────────────────────────────────────────

type EnvelopeOK<T> = { success: true; data: T };
type EnvelopeErr = { success: false; error: string };
type Envelope<T> = EnvelopeOK<T> | EnvelopeErr;

interface SoundCreateResponse {
  success: true;
  sound: SoundViewModel;
  requestedChanges: Record<string, unknown>;
}
interface SoundUpdateResponse {
  success: true;
  sound: SoundViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}
interface SoundDeleteResponse {
  success: true;
  deletedId: string;
  sceneId: string;
  remainingSounds: number;
}
interface SoundGetResponse {
  success: true;
  sound: SoundViewModel;
}
interface SoundListResponse {
  success: true;
  sounds?: SoundListItem[];
  total?: number;
  page?: number;
  pageSize?: number;
  pageCount?: number;
  filterApplied?: string | null;
}

type SoundResponse =
  | SoundCreateResponse
  | SoundUpdateResponse
  | SoundDeleteResponse
  | SoundGetResponse
  | SoundListResponse;

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

function resolveScene(sceneId?: string): any {
  const id = sceneId ?? (game as any).scenes?.active?.id;
  if (!id) throw new Error('NO_ACTIVE_SCENE: no sceneId provided and no active scene');
  return getSceneOrThrow(id);
}

// ── Serializers ──────────────────────────────────────────────────────────────

function serializeSoundViewModel(scene: any, sound: any): SoundViewModel {
  return {
    id: sound.id as string,
    sceneId: scene.id as string,
    x: typeof sound.x === 'number' ? sound.x : 0,
    y: typeof sound.y === 'number' ? sound.y : 0,
    elevation: typeof sound.elevation === 'number' ? sound.elevation : 0,
    radius: typeof sound.radius === 'number' ? sound.radius : 0,
    path: sound.path ?? null,
    repeat: !!sound.repeat,
    volume: typeof sound.volume === 'number' ? sound.volume : 0.5,
    walls: sound.walls !== undefined ? !!sound.walls : true,
    easing: sound.easing !== undefined ? !!sound.easing : true,
    hidden: !!sound.hidden,
    darkness: {
      min: sound.darkness?.min ?? 0,
      max: sound.darkness?.max ?? 1,
    },
    effects: {
      base: {
        type: sound.effects?.base?.type ?? null,
        intensity: typeof sound.effects?.base?.intensity === 'number' ? sound.effects.base.intensity : 5,
      },
      muffled: {
        type: sound.effects?.muffled?.type ?? null,
        intensity: typeof sound.effects?.muffled?.intensity === 'number' ? sound.effects.muffled.intensity : 5,
      },
    },
    flags: (sound.flags as Record<string, unknown>) ?? {},
  };
}

function serializeSoundListItem(scene: any, sound: any): SoundListItem {
  return {
    id: sound.id as string,
    sceneId: scene.id as string,
    path: sound.path ?? null,
    hidden: !!sound.hidden,
    volume: typeof sound.volume === 'number' ? sound.volume : 0.5,
  };
}

// ── 1. createSound ───────────────────────────────────────────────────────────

export async function createSound(data: unknown): Promise<Envelope<SoundCreateResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: createSound requires GM' };

  const input: SoundCreateInputType = SoundCreateInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);

  // BUG-075: snapshot BEFORE the mutating call.
  const { action: _action, sceneId: _sceneId, ...rest } = input;
  const requestedChanges: Record<string, unknown> = { ...rest };

  return wrappedWrite('sound.createSound', async () => {
    const payload = deepStripUndefined({ ...rest });
    const [created] = await scene.createEmbeddedDocuments('AmbientSound', [payload]);
    if (!created) {
      throw new Error('SOUND_WRITE_NOT_PERSISTED: createEmbeddedDocuments returned no document');
    }

    // DP-16 post-verify: re-read from collection.
    const persisted = getEmbeddedOrThrow<any>(scene, 'sounds', created.id, 'AmbientSound');

    return {
      success: true as const,
      data: {
        success: true,
        sound: serializeSoundViewModel(scene, persisted),
        requestedChanges,
      } satisfies SoundCreateResponse,
    };
  });
}

// ── 2. updateSound ───────────────────────────────────────────────────────────

export async function updateSound(data: unknown): Promise<Envelope<SoundUpdateResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: updateSound requires GM' };

  const input: SoundUpdateInputType = SoundUpdateInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const sound = getEmbeddedOrThrow<any>(scene, 'sounds', input.soundId, 'AmbientSound');

  // BUG-075: snapshot BEFORE mutation.
  const requestedChanges: Record<string, unknown> = { ...input.changes };
  const changedFields = Object.keys(requestedChanges);

  return wrappedWrite('sound.updateSound', async () => {
    await sound.update(deepStripUndefined(input.changes));

    // DP-16 post-verify: re-read; confirm nested fields present.
    const persisted = getEmbeddedOrThrow<any>(scene, 'sounds', input.soundId, 'AmbientSound');

    // Spot-check scalar fields that aren't nested.
    for (const field of changedFields) {
      if (field === 'darkness' || field === 'effects' || field === 'flags') {
        // Nested SchemaField — check presence only.
        if ((persisted as any)[field] === undefined || (persisted as any)[field] === null) {
          throw new Error(`SOUND_WRITE_NOT_PERSISTED: nested field "${field}" missing after update`);
        }
        continue;
      }
      const actual = (persisted as any)[field];
      const expected = (requestedChanges as any)[field];
      if (actual !== expected) {
        throw new Error(
          `SOUND_WRITE_NOT_PERSISTED: field "${field}" expected ${JSON.stringify(expected)} ` +
            `but post-update value is ${JSON.stringify(actual)}`,
        );
      }
    }

    return {
      success: true as const,
      data: {
        success: true,
        sound: serializeSoundViewModel(scene, persisted),
        requestedChanges,
        changedFields,
      } satisfies SoundUpdateResponse,
    };
  });
}

// ── 3. deleteSound ───────────────────────────────────────────────────────────

export async function deleteSound(data: unknown): Promise<Envelope<SoundDeleteResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: deleteSound requires GM' };

  const input: SoundDeleteInputType = SoundDeleteInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  // Confirm the sound exists before deletion.
  getEmbeddedOrThrow<any>(scene, 'sounds', input.soundId, 'AmbientSound');
  const sizeBefore = scene.sounds?.size ?? 0;

  return wrappedWrite('sound.deleteSound', async () => {
    await scene.deleteEmbeddedDocuments('AmbientSound', [input.soundId]);

    // DP-16 post-verify: sound should be gone.
    const stillPresent = scene.sounds?.get?.(input.soundId);
    if (stillPresent) {
      throw new Error(
        `SOUND_WRITE_NOT_PERSISTED: sound "${input.soundId}" still present after delete`,
      );
    }
    const sizeAfter = scene.sounds?.size ?? 0;
    if (sizeAfter !== sizeBefore - 1) {
      throw new Error(
        `SOUND_WRITE_NOT_PERSISTED: sounds.size expected ${sizeBefore - 1} after delete ` +
          `but found ${sizeAfter}`,
      );
    }

    return {
      success: true as const,
      data: {
        success: true,
        deletedId: input.soundId,
        sceneId: input.sceneId,
        remainingSounds: sizeAfter,
      } satisfies SoundDeleteResponse,
    };
  });
}

// ── 4. getSound ──────────────────────────────────────────────────────────────

export async function getSound(data: unknown): Promise<Envelope<SoundGetResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: getSound requires GM' };

  const input: SoundGetInputType = SoundGetInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const sound = getEmbeddedOrThrow<any>(scene, 'sounds', input.soundId, 'AmbientSound');

  return {
    success: true,
    data: {
      success: true,
      sound: serializeSoundViewModel(scene, sound),
    } satisfies SoundGetResponse,
  };
}

// ── 5. listSounds ────────────────────────────────────────────────────────────

export async function listSounds(data: unknown): Promise<Envelope<SoundListResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: listSounds requires GM' };

  const input: SoundListInputType = SoundListInput_strict_parse(data);

  // Resolve scene — throws NO_ACTIVE_SCENE if omitted and no active scene.
  const scene = resolveScene(input.sceneId);
  const sceneId = scene.id as string;

  let sounds: any[] = (scene.sounds?.contents as any[]) ?? [];

  // Apply filters.
  if (input.filter !== undefined) {
    const needle = input.filter.toLowerCase();
    sounds = sounds.filter((s) => (s.path ?? '').toLowerCase().includes(needle));
  }
  if (input.hidden !== undefined) {
    sounds = sounds.filter((s) => !!s.hidden === input.hidden);
  }

  const total = sounds.length;

  // countOnly branch.
  if (input.countOnly) {
    return {
      success: true,
      data: {
        success: true,
        total,
        filterApplied: input.filter ?? (input.hidden !== undefined ? `hidden=${input.hidden}` : null),
      } satisfies SoundListResponse,
    };
  }

  // Pagination.
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? (total || 1);
  const pageCount = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const paged = sounds.slice(start, start + pageSize);

  const items: SoundListItem[] = paged.map((s) => serializeSoundListItem({ id: sceneId }, s));

  if (input.page !== undefined || input.pageSize !== undefined) {
    return {
      success: true,
      data: {
        success: true,
        total,
        page,
        pageSize,
        pageCount,
        sounds: items,
      } satisfies SoundListResponse,
    };
  }

  return {
    success: true,
    data: {
      success: true,
      sounds: items,
    } satisfies SoundListResponse,
  };
}

// ── Dispatcher ──────────────────────────────────────────────────────────────

export async function dispatchSound(data: unknown): Promise<Envelope<SoundResponse>> {
  let input: SoundToolInputType;
  try {
    input = SoundToolInput.parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  switch (input.action) {
    case 'create':
      return createSound(input);
    case 'update':
      return updateSound(input);
    case 'delete':
      return deleteSound(input);
    case 'get':
      return getSound(input);
    case 'list':
      return listSounds(input);
  }
}

// ── Per-handler strict-parse wrappers ───────────────────────────────────────

function SoundCreateInput_strict_parse(data: unknown): SoundCreateInputType {
  return SoundCreateInput.strict().parse(data ?? {});
}
function SoundUpdateInput_strict_parse(data: unknown): SoundUpdateInputType {
  return SoundUpdateInput.strict().parse(data ?? {});
}
function SoundDeleteInput_strict_parse(data: unknown): SoundDeleteInputType {
  return SoundDeleteInput.strict().parse(data ?? {});
}
function SoundGetInput_strict_parse(data: unknown): SoundGetInputType {
  return SoundGetInput.strict().parse(data ?? {});
}
function SoundListInput_strict_parse(data: unknown): SoundListInputType {
  return SoundListInput.strict().parse(data ?? {});
}
