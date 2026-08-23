// opportunity_scan_2026-08-21 F11 — Wall CRUD handler (5 actions).
//
// FACTORY: wall Wall
// Follows the light.ts precedent exactly (see .agents/research/opportunity-scan-noncheap/wall_tool_design.md).
// DIALOG_FREE (ADR-10.1 classification) — Wall is core-Foundry Scene-embedded,
// no wfrp4e system-layer document lifecycle involvement; confirmed via grep of
// kb/wfrp4e_system/ + live systems/wfrp4e for _preCreate/_preUpdate/DialogV2.confirm
// scoped to Wall — 0 hits (memo §(d)).
//
// External API: createWall / updateWall / deleteWall / getWall / listWalls / dispatchWall.

import {
  WallToolInput,
  WallCreateInput,
  WallUpdateInput,
  WallDeleteInput,
  WallGetInput,
  WallListInput,
  type WallViewModel,
  type WallListItem,
} from '@foundry-mcp/shared';
import { createEmbeddedCRUDHandlers } from '../utils/embeddedCRUDFactory.js';

// ── Serializers ──────────────────────────────────────────────────────────────
// Defaults mirror WallDocument's own CONST defaults (WALL_DIRECTIONS.BOTH,
// WALL_DOOR_TYPES.NONE, WALL_DOOR_STATES.CLOSED, WALL_SENSE_TYPES.NORMAL,
// WALL_MOVEMENT_TYPES.NORMAL) — kb/foundry_docs_v13/CONST/variables/WALL_*.md.

function numOr<T extends number>(value: unknown, fallback: T): number {
  return typeof value === 'number' ? value : fallback;
}

function serializeWallThreshold(threshold: any): WallViewModel['threshold'] {
  return {
    attenuation: !!threshold?.attenuation,
    light: numOr(threshold?.light, 0),
    sight: numOr(threshold?.sight, 0),
    sound: numOr(threshold?.sound, 0),
  };
}

function serializeWallViewModel(scene: any, wall: any): WallViewModel {
  return {
    id: wall.id as string,
    sceneId: scene.id as string,
    c: Array.isArray(wall.c) ? wall.c : [0, 0, 0, 0],
    dir: numOr(wall.dir, 0),
    door: numOr(wall.door, 0),
    doorSound: wall.doorSound ?? null,
    ds: numOr(wall.ds, 0),
    light: numOr(wall.light, 20),
    move: numOr(wall.move, 20),
    sight: numOr(wall.sight, 20),
    sound: numOr(wall.sound, 20),
    threshold: serializeWallThreshold(wall.threshold ?? {}),
    flags: (wall.flags as Record<string, unknown>) ?? {},
  };
}

function serializeWallListItem(scene: any, wall: any): WallListItem {
  return {
    id: wall.id as string,
    sceneId: scene.id as string,
    c: Array.isArray(wall.c) ? wall.c : [0, 0, 0, 0],
    door: typeof wall.door === 'number' ? wall.door : 0,
    ds: typeof wall.ds === 'number' ? wall.ds : 0,
  };
}

// ── List filters ─────────────────────────────────────────────────────────────
function applyWallListFilters(input: any, items: any[]): any[] {
  let filtered = items;
  if (input.doorOnly !== undefined) {
    filtered = filtered.filter((w) => (typeof w.door === 'number' ? w.door > 0 : false) === input.doorOnly);
  }
  return filtered;
}

function isWallFilterApplied(input: any): string | null {
  if (input.doorOnly !== undefined) return `doorOnly=${input.doorOnly}`;
  return null;
}

// ── Factory wiring ───────────────────────────────────────────────────────────
const handlers = createEmbeddedCRUDHandlers<any, any, WallViewModel, WallListItem>({
  documentName: 'Wall',
  documentLabel: 'wall',
  collection: 'walls',
  idField: 'wallId',
  gmGateReads: true,
  deleteApi: 'scene.deleteEmbeddedDocuments',
  schemas: {
    create: WallCreateInput,
    update: WallUpdateInput,
    delete: WallDeleteInput,
    get: WallGetInput,
    list: WallListInput,
    toolInput: WallToolInput,
  },
  dp16SkipFields: ['c', 'threshold'],
  formatter: serializeWallViewModel,
  listItemFormatter: serializeWallListItem,
  applyListFilters: applyWallListFilters,
  isFilterApplied: isWallFilterApplied,
  responseKeys: {
    viewModel: 'wall',
    listArray: 'walls',
    remainingCount: 'remainingWalls',
  },
  notifyKind: 'wall',
});

export const createWall = handlers.create;
export const updateWall = handlers.update;
export const deleteWall = handlers.delete;
export const getWall = handlers.get;
export const listWalls = handlers.list;
export const dispatchWall = handlers.dispatch;
