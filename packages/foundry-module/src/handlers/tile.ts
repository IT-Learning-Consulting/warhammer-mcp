// Phase 5 mcp_crud_expansion — Tile CRUD handler (5 actions).
//
// Foundry-side write/read surface for the `tile` MCP umbrella tool.
// Actions: create / update / delete / get / list
//
// Operates on scene.tiles (EmbeddedCollectionField of TileDocument).
//
// CCR-Trust: every write starts with validateGMAccess().
// CCR-Transactions: every write routes through wrappedWrite('tile.<name>', ...).
// CCR-Envelope: returns {success, data} or {success, error}.
// CCR-Schema-Fidelity: input field paths mirror TileDocument.defineSchema() 1:1
//                      (phase5_probes.md §Tile — probe-locked).
// BUG-075: snapshot requestedChanges BEFORE mutating call.
// DP-15: typed return on every handler (no `any` payloads).
// DP-16: post-verify each write by re-reading via getEmbeddedOrThrow.
// B3: video.volume initial=0 silent-zero trap — deepStripUndefined on create AND update.

import {
  TileToolInput,
  TileCreateInput,
  TileUpdateInput,
  TileDeleteInput,
  TileGetInput,
  TileListInput,
  type TileToolInputType,
  type TileCreateInputType,
  type TileUpdateInputType,
  type TileDeleteInputType,
  type TileGetInputType,
  type TileListInputType,
  type TileViewModel,
  type TileListItem,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { getEmbeddedOrThrow } from '../utils/getEmbeddedOrThrow.js';

// ── Local types ──────────────────────────────────────────────────────────────

type EnvelopeOK<T> = { success: true; data: T };
type EnvelopeErr = { success: false; error: string };
type Envelope<T> = EnvelopeOK<T> | EnvelopeErr;

interface TileCreateResponse {
  success: boolean;
  tile: TileViewModel;
  requestedChanges: Record<string, unknown>;
}

interface TileUpdateResponse {
  success: boolean;
  tile: TileViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}

interface TileDeleteResponse {
  success: boolean;
  deletedId: string;
  sceneId: string;
}

interface TileGetResponse {
  success: boolean;
  tile: TileViewModel;
}

interface TileListResponse {
  success: boolean;
  tiles: TileListItem[];
  total: number;
  page: number;
  pageSize: number;
  countOnly?: boolean;
}

type TileResponse =
  | TileCreateResponse
  | TileUpdateResponse
  | TileDeleteResponse
  | TileGetResponse
  | TileListResponse;

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
  if (!scene) {
    throw new Error(`SCENE_NOT_FOUND: no Scene with id "${sceneId}"`);
  }
  return scene;
}

function getActiveSceneOrThrow(): any {
  const scene = (game as any).scenes?.active;
  if (!scene) {
    throw new Error('SCENE_NOT_FOUND: no active scene');
  }
  return scene;
}

// ── ViewModel serializers ────────────────────────────────────────────────────

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

// ── 1. createTile ────────────────────────────────────────────────────────────

export async function createTile(data: unknown): Promise<Envelope<TileCreateResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: createTile requires GM' };

  const input: TileCreateInputType = TileCreateInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);

  // BUG-075: snapshot BEFORE mutating.
  const { action: _action, sceneId: _sceneId, ...rest } = input;
  const requestedChanges: Record<string, unknown> = { ...rest };

  return wrappedWrite('tile.create', async () => {
    // B3 guard: strip undefined to prevent video.volume silent-zero on partial update.
    const payload = deepStripUndefined({ ...rest });

    const created = await scene.createEmbeddedDocuments('Tile', [payload]);
    if (!created || created.length === 0) {
      throw new Error('TILE_WRITE_NOT_PERSISTED: createEmbeddedDocuments returned empty array');
    }
    const tileId: string = created[0].id;

    // DP-16 post-verify: re-read via getEmbeddedOrThrow.
    const persisted = getEmbeddedOrThrow<any>(scene, 'tiles', tileId, 'Tile');

    return {
      success: true as const,
      data: {
        success: true,
        tile: serializeTileViewModel(scene, persisted),
        requestedChanges,
      } satisfies TileCreateResponse,
    };
  });
}

// ── 2. updateTile ────────────────────────────────────────────────────────────

export async function updateTile(data: unknown): Promise<Envelope<TileUpdateResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: updateTile requires GM' };

  const input: TileUpdateInputType = TileUpdateInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const tile = getEmbeddedOrThrow<any>(scene, 'tiles', input.tileId, 'Tile');

  // BUG-075: snapshot BEFORE mutating.
  const requestedChanges: Record<string, unknown> = { ...input.changes };
  const changedFields = Object.keys(requestedChanges);

  return wrappedWrite('tile.update', async () => {
    // B3 guard: strip undefined to prevent video.volume silent-zero on partial update.
    // Zod schema uses .optional() so omitted video sub-fields arrive as undefined;
    // deepStripUndefined removes them so Foundry sees a true partial update and
    // does not merge the AlphaField initial (0) over the existing volume value.
    const payload = deepStripUndefined(input.changes);

    await tile.update(payload);

    // DP-16 post-verify: re-read after write.
    const persisted = getEmbeddedOrThrow<any>(scene, 'tiles', input.tileId, 'Tile');

    return {
      success: true as const,
      data: {
        success: true,
        tile: serializeTileViewModel(scene, persisted),
        requestedChanges,
        changedFields,
      } satisfies TileUpdateResponse,
    };
  });
}

// ── 3. deleteTile ────────────────────────────────────────────────────────────

export async function deleteTile(data: unknown): Promise<Envelope<TileDeleteResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: deleteTile requires GM' };

  const input: TileDeleteInputType = TileDeleteInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  // Confirm exists before delete.
  getEmbeddedOrThrow<any>(scene, 'tiles', input.tileId, 'Tile');

  return wrappedWrite('tile.delete', async () => {
    await scene.deleteEmbeddedDocuments('Tile', [input.tileId]);

    // DP-16 post-verify: confirm gone.
    const stillPresent = (scene.tiles as any)?.get(input.tileId);
    if (stillPresent) {
      throw new Error(
        `TILE_WRITE_NOT_PERSISTED: tile "${input.tileId}" still present after delete`,
      );
    }

    return {
      success: true as const,
      data: {
        success: true,
        deletedId: input.tileId,
        sceneId: input.sceneId,
      } satisfies TileDeleteResponse,
    };
  });
}

// ── 4. getTile ───────────────────────────────────────────────────────────────

export async function getTile(data: unknown): Promise<Envelope<TileGetResponse>> {
  const input: TileGetInputType = TileGetInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const tile = getEmbeddedOrThrow<any>(scene, 'tiles', input.tileId, 'Tile');

  return {
    success: true as const,
    data: {
      success: true,
      tile: serializeTileViewModel(scene, tile),
    } satisfies TileGetResponse,
  };
}

// ── 5. listTiles ─────────────────────────────────────────────────────────────

export async function listTiles(data: unknown): Promise<Envelope<TileListResponse>> {
  const input: TileListInputType = TileListInput_strict_parse(data);

  const scene = input.sceneId ? getSceneOrThrow(input.sceneId) : getActiveSceneOrThrow();

  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 50;

  // Collect all tiles from the scene's tiles collection.
  let tiles: any[] = Array.from((scene.tiles as any)?.values() ?? []);

  // Apply filters.
  if (input.filter !== undefined) {
    const needle = input.filter.toLowerCase();
    tiles = tiles.filter((t: any) => (t.texture?.src ?? '').toLowerCase().includes(needle));
  }
  if (input.hidden !== undefined) {
    tiles = tiles.filter((t: any) => (t.hidden ?? false) === input.hidden);
  }
  if (input.locked !== undefined) {
    tiles = tiles.filter((t: any) => (t.locked ?? false) === input.locked);
  }
  if (input.overheadOnly === true) {
    tiles = tiles.filter((t: any) => (t.elevation > 0) || (t.occlusion?.mode === 4));
  }

  const total = tiles.length;

  if (input.countOnly === true) {
    return {
      success: true as const,
      data: {
        success: true,
        tiles: [],
        total,
        page: 1,
        pageSize,
        countOnly: true,
      } satisfies TileListResponse,
    };
  }

  // Paginate.
  const start = (page - 1) * pageSize;
  const pageSlice = tiles.slice(start, start + pageSize);

  return {
    success: true as const,
    data: {
      success: true,
      tiles: pageSlice.map((t: any) => serializeTileListItem(scene, t)),
      total,
      page,
      pageSize,
    } satisfies TileListResponse,
  };
}

// ── Dispatcher ───────────────────────────────────────────────────────────────

export async function dispatchTile(data: unknown): Promise<Envelope<TileResponse>> {
  let input: TileToolInputType;
  try {
    input = TileToolInput.parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  switch (input.action) {
    case 'create':
      return createTile(input);
    case 'update':
      return updateTile(input);
    case 'delete':
      return deleteTile(input);
    case 'get':
      return getTile(input);
    case 'list':
      return listTiles(input);
  }
}

// ── Per-handler strict-parse wrappers ────────────────────────────────────────

function TileCreateInput_strict_parse(data: unknown): TileCreateInputType {
  return TileCreateInput.strict().parse(data ?? {});
}
function TileUpdateInput_strict_parse(data: unknown): TileUpdateInputType {
  return TileUpdateInput.strict().parse(data ?? {});
}
function TileDeleteInput_strict_parse(data: unknown): TileDeleteInputType {
  return TileDeleteInput.strict().parse(data ?? {});
}
function TileGetInput_strict_parse(data: unknown): TileGetInputType {
  return TileGetInput.strict().parse(data ?? {});
}
function TileListInput_strict_parse(data: unknown): TileListInputType {
  return TileListInput.strict().parse(data ?? {});
}
