// Phase 5 mcp_crud_expansion — AmbientSound CRUD handler (5 actions).
// Phase 6.2 retrofit — factored through createEmbeddedCRUDHandlers (~49% LOC reduction).
//
// External API preserved: createSound / updateSound / deleteSound / getSound /
// listSounds / dispatchSound. Behavior identical to pre-factory hand-rolled
// version. Serializers kept in-file.
//
// FACTORY: sound AmbientSound
// F08 _source pattern emitted by factory's DP-16 loop.

import {
  SoundToolInput,
  SoundCreateInput,
  SoundUpdateInput,
  SoundDeleteInput,
  SoundGetInput,
  SoundListInput,
  type SoundToolInputType,
  type SoundViewModel,
  type SoundListItem,
} from '@foundry-mcp/shared';
import {
  createEmbeddedCRUDHandlers,
  validateGMAccess,
  getSceneOrThrow,
  type Envelope,
} from '../utils/embeddedCRUDFactory.js';
import { getEmbeddedOrThrow } from '../utils/getEmbeddedOrThrow.js';
import { wrappedWrite } from '../transaction-manager.js';
import { notify } from '../notify.js';

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

// ── List filters ─────────────────────────────────────────────────────────────
function applySoundListFilters(input: any, items: any[]): any[] {
  let filtered = items;
  if (input.filter !== undefined) {
    const needle = String(input.filter).toLowerCase();
    filtered = filtered.filter((s) => (s.path ?? '').toLowerCase().includes(needle));
  }
  if (input.hidden !== undefined) {
    filtered = filtered.filter((s) => !!s.hidden === input.hidden);
  }
  return filtered;
}

// sound preserves the pre-factory filterApplied semantic: filter string OR "hidden=<bool>" OR null.
function isSoundFilterApplied(input: any): string | null {
  if (input.filter !== undefined) return String(input.filter);
  if (input.hidden !== undefined) return `hidden=${input.hidden}`;
  return null;
}

// ── Factory wiring ───────────────────────────────────────────────────────────
const handlers = createEmbeddedCRUDHandlers<any, any, SoundViewModel, SoundListItem>({
  documentName: 'AmbientSound',
  documentLabel: 'sound',
  collection: 'sounds',
  idField: 'soundId',
  gmGateReads: true,
  deleteApi: 'scene.deleteEmbeddedDocuments',
  schemas: {
    create: SoundCreateInput,
    update: SoundUpdateInput,
    delete: SoundDeleteInput,
    get: SoundGetInput,
    list: SoundListInput,
    toolInput: SoundToolInput,
  },
  // darkness + effects are nested SchemaFields — skip scalar compare.
  dp16SkipFields: ['darkness', 'effects'],
  formatter: serializeSoundViewModel,
  listItemFormatter: serializeSoundListItem,
  applyListFilters: applySoundListFilters,
  isFilterApplied: isSoundFilterApplied,
  responseKeys: {
    viewModel: 'sound',
    listArray: 'sounds',
    remainingCount: 'remainingSounds',
  },
  notifyKind: 'sound',
});

export const createSound = handlers.create;
export const updateSound = handlers.update;
export const deleteSound = handlers.delete;
export const getSound = handlers.get;
export const listSounds = handlers.list;

// ── Phase 9C bespoke duplicate ─────────────────────────────────────────────────
async function duplicateSound(
  input: Extract<SoundToolInputType, { action: 'duplicate' }>,
): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: duplicateSound requires GM' };

  const scene = getSceneOrThrow(input.sceneId);
  const source = getEmbeddedOrThrow<any>(scene, 'sounds', input.soundId, 'AmbientSound');
  const sourceId = source.id as string;

  return wrappedWrite('sound.duplicate', async () => {
    const data: any = source.toObject();
    delete data._id;

    const created = await scene.createEmbeddedDocuments('AmbientSound', [data]);
    const doc = Array.isArray(created) ? created[0] : created;
    if (!doc) throw new Error('SOUND_DUPLICATE_FAILED: createEmbeddedDocuments returned empty');

    const persisted = getEmbeddedOrThrow<any>(scene, 'sounds', doc.id, 'AmbientSound');
    if (persisted.id === sourceId) {
      throw new Error(`SOUND_DUPLICATE_FAILED: duplicate id equals source id "${sourceId}"`);
    }

    notify.created('sound', `AmbientSound ${persisted.id}`, { summary: `duplicated from ${sourceId}` });

    return {
      success: true as const,
      data: { sound: serializeSoundViewModel(scene, persisted), sourceId },
    };
  }, { sceneId: input.sceneId });
}

export const dispatchSound = async (data: unknown): Promise<Envelope<any>> => {
  let input: SoundToolInputType;
  try {
    input = SoundToolInput.parse(data ?? {}) as SoundToolInputType;
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }
  switch (input.action) {
    case 'create':
      return handlers.create(input);
    case 'update':
      return handlers.update(input);
    case 'delete':
      return handlers.delete(input);
    case 'get':
      return handlers.get(input);
    case 'list':
      return handlers.list(input);
    case 'duplicate':
      return duplicateSound(input);
    default:
      throw new Error(`Unknown sound action: ${(input as any).action}`);
  }
};
