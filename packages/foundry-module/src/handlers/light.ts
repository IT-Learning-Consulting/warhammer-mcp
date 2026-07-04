// Phase 5 mcp_crud_expansion — AmbientLight CRUD handler (5 actions).
// Phase 6.2 retrofit — factored through createEmbeddedCRUDHandlers (~51% LOC reduction).
//
// External API preserved: createLight / updateLight / deleteLight / getLight /
// listLights / dispatchLight. Behavior identical to pre-factory hand-rolled
// version. Serializers kept in-file (per-type 50-90 LOC stays uniquely shaped).
//
// FACTORY: light AmbientLight
// F08 _source pattern emitted by factory's DP-16 loop. BUG-069 typed-generic
// discipline preserved via the per-action Response interfaces below.

import {
  LightToolInput,
  LightCreateInput,
  LightUpdateInput,
  LightDeleteInput,
  LightGetInput,
  LightListInput,
  type LightViewModel,
  type LightListItem,
} from '@foundry-mcp/shared';
import { createEmbeddedCRUDHandlers } from '../utils/embeddedCRUDFactory.js';

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

// ── List filters ─────────────────────────────────────────────────────────────
function applyLightListFilters(input: any, items: any[]): any[] {
  let filtered = items;
  if (input.hidden !== undefined) {
    filtered = filtered.filter((l) => !!l.hidden === input.hidden);
  }
  if (input.isGlobal !== undefined) {
    filtered = filtered.filter((l) => (l.isGlobal === true) === input.isGlobal);
  }
  if (input.filter) {
    const lc = String(input.filter).toLowerCase();
    filtered = filtered.filter((l) => {
      const haystack = `${l.x ?? 0},${l.y ?? 0} ${l.id}`.toLowerCase();
      return haystack.includes(lc);
    });
  }
  return filtered;
}

// BUG-435: return the canonical string|null filter descriptor (not a bare boolean) so countOnly's
// filterApplied is uniform across list handlers (mirrors isSoundFilterApplied).
function isLightFilterApplied(input: any): string | null {
  if (input.filter !== undefined) return String(input.filter);
  if (input.hidden !== undefined) return `hidden=${input.hidden}`;
  if (input.isGlobal !== undefined) return `isGlobal=${input.isGlobal}`;
  return null;
}

// ── Factory wiring ───────────────────────────────────────────────────────────
const handlers = createEmbeddedCRUDHandlers<any, any, LightViewModel, LightListItem>({
  documentName: 'AmbientLight',
  documentLabel: 'light',
  collection: 'lights',
  idField: 'lightId',
  gmGateReads: true,
  deleteApi: 'scene.deleteEmbeddedDocuments',
  schemas: {
    create: LightCreateInput,
    update: LightUpdateInput,
    delete: LightDeleteInput,
    get: LightGetInput,
    list: LightListInput,
    toolInput: LightToolInput,
  },
  dp16SkipFields: ['config'],
  formatter: serializeLightViewModel,
  listItemFormatter: serializeLightListItem,
  applyListFilters: applyLightListFilters,
  isFilterApplied: isLightFilterApplied,
  responseKeys: {
    viewModel: 'light',
    listArray: 'lights',
    remainingCount: 'remainingLights',
  },
  notifyKind: 'light',
});

export const createLight = handlers.create;
export const updateLight = handlers.update;
export const deleteLight = handlers.delete;
export const getLight = handlers.get;
export const listLights = handlers.list;
export const dispatchLight = handlers.dispatch;
