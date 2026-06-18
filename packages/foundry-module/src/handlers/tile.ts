// Phase 5 mcp_crud_expansion — Tile CRUD handler (5 actions).
// Phase 6.2 retrofit — factored through createEmbeddedCRUDHandlers (~51% LOC reduction).
//
// External API preserved: createTile / updateTile / deleteTile / getTile /
// listTiles / dispatchTile. Behavior identical to pre-factory.
//
// Phase 6.2.5 additional fix: factory's DP-16 scalar-loop now fires on tile
// updates (pre-factory tile.ts skipped the loop entirely — weakest DP-16
// coverage per phase6_factory_audit.md Deliverable 1).
//
// FACTORY: tile Tile
// B3 guard: preUpdateTransform applies deepStripUndefined to prevent
//           video.volume silent-zero on partial update.
// F08 _source pattern emitted by factory's DP-16 loop.

import {
  ErrorTokens,
  TileToolInput,
  TileCreateInput,
  TileUpdateInput,
  TileDeleteInput,
  TileGetInput,
  TileListInput,
  type TileToolInputType,
  type TileViewModel,
  type TileListItem,
} from '@foundry-mcp/shared';
import {
  createEmbeddedCRUDHandlers,
  deepStripUndefined,
  validateGMAccess,
  getSceneOrThrow,
  type Envelope,
} from '../utils/embeddedCRUDFactory.js';
import { getEmbeddedOrThrow } from '../utils/getEmbeddedOrThrow.js';
import { wrappedWrite } from '../transaction-manager.js';
import { notify } from '../notify.js';

// ── Serializers ──────────────────────────────────────────────────────────────
function serializeTileViewModel(scene: any, tile: any): TileViewModel {
  const t = tile.texture ?? {};
  return {
    id: tile.id as string,
    sceneId: scene.id as string,
    texture: {
      src: t.src ?? null,
      anchorX: t.anchorX ?? 0,
      anchorY: t.anchorY ?? 0,
      offsetX: t.offsetX ?? 0,
      offsetY: t.offsetY ?? 0,
      fit: t.fit ?? 'contain',
      scaleX: t.scaleX ?? 1,
      scaleY: t.scaleY ?? 1,
      rotation: t.rotation ?? 0,
      tint: t.tint ?? '#ffffff',
      alphaThreshold: t.alphaThreshold ?? 0,
    },
    width: tile.width ?? 0,
    height: tile.height ?? 0,
    x: tile.x ?? 0,
    y: tile.y ?? 0,
    elevation: tile.elevation ?? 0,
    sort: tile.sort ?? 0,
    rotation: tile.rotation ?? 0,
    alpha: tile.alpha ?? 1,
    hidden: tile.hidden ?? false,
    locked: tile.locked ?? false,
    restrictions: {
      light: tile.restrictions?.light ?? false,
      weather: tile.restrictions?.weather ?? false,
    },
    occlusion: {
      mode: tile.occlusion?.mode ?? 0,
      alpha: tile.occlusion?.alpha ?? 0,
    },
    video: {
      loop: tile.video?.loop ?? true,
      autoplay: tile.video?.autoplay ?? true,
      volume: tile.video?.volume ?? 0,
    },
    flags: (tile.flags as Record<string, unknown>) ?? {},
  };
}

function serializeTileListItem(scene: any, tile: any): TileListItem {
  const overhead = (tile.elevation > 0) || (tile.occlusion?.mode === 4);
  return {
    id: tile.id as string,
    sceneId: scene.id as string,
    src: tile.texture?.src ?? null,
    hidden: tile.hidden ?? false,
    overhead,
  };
}

// ── List filters ─────────────────────────────────────────────────────────────
function applyTileListFilters(input: any, items: any[]): any[] {
  let filtered = items;
  if (input.filter !== undefined) {
    const needle = String(input.filter).toLowerCase();
    filtered = filtered.filter((t: any) => (t.texture?.src ?? '').toLowerCase().includes(needle));
  }
  if (input.hidden !== undefined) {
    filtered = filtered.filter((t: any) => (t.hidden ?? false) === input.hidden);
  }
  if (input.locked !== undefined) {
    filtered = filtered.filter((t: any) => (t.locked ?? false) === input.locked);
  }
  if (input.overheadOnly === true) {
    filtered = filtered.filter((t: any) => (t.elevation > 0) || (t.occlusion?.mode === 4));
  }
  return filtered;
}

// ── Factory wiring ───────────────────────────────────────────────────────────
const handlers = createEmbeddedCRUDHandlers<any, any, TileViewModel, TileListItem>({
  documentName: 'Tile',
  documentLabel: 'tile',
  collection: 'tiles',
  idField: 'tileId',
  gmGateReads: false, // tile is open to players for get/list per Phase 5 design
  deleteApi: 'scene.deleteEmbeddedDocuments',
  schemas: {
    create: TileCreateInput,
    update: TileUpdateInput,
    delete: TileDeleteInput,
    get: TileGetInput,
    list: TileListInput,
    toolInput: TileToolInput,
  },
  // texture / restrictions / occlusion / video / flags are nested SchemaFields — skip scalar compare.
  dp16SkipFields: ['texture', 'restrictions', 'occlusion', 'video'],
  formatter: serializeTileViewModel,
  listItemFormatter: serializeTileListItem,
  applyListFilters: applyTileListFilters,
  responseKeys: {
    viewModel: 'tile',
    listArray: 'tiles',
    remainingCount: 'remainingTiles', // not actually used; delete builder overridden below
  },
  notifyKind: 'tile',
  defaultPageSize: 50,
  // B3 guard: video sub-fields arriving as undefined must be stripped so Foundry
  // does not merge AlphaField initial (0) over existing volume on partial update.
  preUpdateTransform: (_scene, changes) => deepStripUndefined(changes),
  // Tile uses a non-standard delete response (no remainingCount).
  responseBuilders: {
    delete: ({ deletedId, sceneId }) => ({ deletedId, sceneId }),
    // tile.list always paginates — bare variant returns same shape as paginated
    // minus pageCount. tile.list response: {success, tiles, total, page, pageSize}.
    listBare: ({ items, total }) => ({ tiles: items, total, page: 1, pageSize: 50 }),
    listPaginated: ({ items, total, page, pageSize }) => ({ tiles: items, total, page, pageSize }),
    listCount: ({ total, page, pageSize }) => ({
      tiles: [],
      total,
      page: page ?? 1,
      pageSize: pageSize ?? 50,
      countOnly: true,
    }),
  },
});

export const createTile = handlers.create;
export const updateTile = handlers.update;
export const deleteTile = handlers.delete;
export const getTile = handlers.get;
export const listTiles = handlers.list;

// ── Phase 9C bespoke actions (duplicate + z-order) ─────────────────────────────

// duplicate: toObject → strip _id/sort → createEmbeddedDocuments → CCR-2a re-read.
async function duplicateTile(
  input: Extract<TileToolInputType, { action: 'duplicate' }>,
): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: duplicateTile requires GM' };

  const scene = getSceneOrThrow(input.sceneId);
  const source = getEmbeddedOrThrow<any>(scene, 'tiles', input.tileId, 'Tile');
  const sourceId = source.id as string;

  return wrappedWrite('tile.duplicate', async () => {
    const data: any = source.toObject();
    delete data._id;
    delete data.sort;

    const created = await scene.createEmbeddedDocuments('Tile', [data]);
    const doc = Array.isArray(created) ? created[0] : created;
    if (!doc) throw new Error('TILE_DUPLICATE_FAILED: createEmbeddedDocuments returned empty');

    const persisted = getEmbeddedOrThrow<any>(scene, 'tiles', doc.id, 'Tile');
    if (persisted.id === sourceId) {
      throw new Error(`TILE_DUPLICATE_FAILED: duplicate id equals source id "${sourceId}"`);
    }

    notify.created('tile', `Tile ${persisted.id}`, { summary: `duplicated from ${sourceId}` });

    return {
      success: true as const,
      data: { tile: serializeTileViewModel(scene, persisted), sourceId },
    };
  }, { sceneId: input.sceneId });
}

// z-order: compute max+1 (front) / min-1 (back) across scene.tiles, then update sort.
async function setTileZOrder(
  input: Extract<TileToolInputType, { action: 'bring-to-front' | 'send-to-back' }>,
  mode: 'front' | 'back',
): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: setTileZOrder requires GM' };

  const scene = getSceneOrThrow(input.sceneId);
  const tile = getEmbeddedOrThrow<any>(scene, 'tiles', input.tileId, 'Tile');

  const sorts: number[] = (Array.from(scene.tiles?.values?.() ?? []) as any[]).map(
    (t: any) => (typeof t.sort === 'number' ? t.sort : 0),
  );
  const targetSort =
    mode === 'front'
      ? (sorts.length ? Math.max(...sorts) : 0) + 1
      : (sorts.length ? Math.min(...sorts) : 0) - 1;

  return wrappedWrite(`tile.${mode === 'front' ? 'bringToFront' : 'sendToBack'}`, async () => {
    await tile.update({ sort: targetSort });

    // CCR-2a: re-read the persisted sort.
    const persisted = getEmbeddedOrThrow<any>(scene, 'tiles', input.tileId, 'Tile');
    const persistedSort = (persisted._source?.sort ?? persisted.sort) as number;
    if (persistedSort !== targetSort) {
      throw new Error(
        `${ErrorTokens.TILE_ZORDER_NOT_PERSISTED}: sort is ${persistedSort}, expected ${targetSort}`,
      );
    }

    notify.updated('tile', `Tile ${persisted.id}`, { summary: `${mode} (sort ${targetSort})` });

    return {
      success: true as const,
      data: { tile: serializeTileViewModel(scene, persisted) },
    };
  }, { sceneId: input.sceneId });
}

// ── Custom dispatch (factory 5 + duplicate + 2 z-order) ────────────────────────
export const dispatchTile = async (data: unknown): Promise<Envelope<any>> => {
  let input: TileToolInputType;
  try {
    input = TileToolInput.parse(data ?? {}) as TileToolInputType;
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
      return duplicateTile(input);
    case 'bring-to-front':
      return setTileZOrder(input, 'front');
    case 'send-to-back':
      return setTileZOrder(input, 'back');
    default:
      throw new Error(`Unknown tile action: ${(input as any).action}`);
  }
};
