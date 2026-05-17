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
  TileToolInput,
  TileCreateInput,
  TileUpdateInput,
  TileDeleteInput,
  TileGetInput,
  TileListInput,
  type TileViewModel,
  type TileListItem,
} from '@foundry-mcp/shared';
import {
  createEmbeddedCRUDHandlers,
  deepStripUndefined,
} from '../utils/embeddedCRUDFactory.js';

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
export const dispatchTile = handlers.dispatch;
