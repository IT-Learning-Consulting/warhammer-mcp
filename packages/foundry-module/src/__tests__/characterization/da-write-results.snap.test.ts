// Characterization snapshot tests — FoundryDataAccess write methods (result-shape only)
//   updateActor   — returns {success, actorId, actorName, updated:[...]}
//   applyDamage   — returns {actorId, damage:{amount,damageType,hitLocation}, before, after}
//   createItem    — returns {success, scope, actorId?, actorName?, itemId, itemName, itemType, ...}
//
// Phase 0 sub-phase 0.7.3: lock return-shapes for refactor regression net.
// These are NOT behavioural tests — they only pin the current output shape.

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { QueryHandlers } from '../../queries.js';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn(), warn: vi.fn() },
}));

// ──────────────────────────────────────────────────
// Shared hook-registry (mirrors update-actor-verify.test.ts pattern)
// Required because updateActor + applyDamage both wait for the 'updateActor' hook.
// ──────────────────────────────────────────────────
type HookHandler = (...args: any[]) => void;
interface HookRegistry {
  next: number;
  byId: Map<number, { event: string; fn: HookHandler }>;
  register(event: string, fn: HookHandler): number;
  off(event: string, id: number): void;
  fire(event: string, ...args: any[]): void;
}

function installHookRegistry(): HookRegistry {
  const reg: HookRegistry = {
    next: 1,
    byId: new Map(),
    register(event, fn) { const id = this.next++; this.byId.set(id, { event, fn }); return id; },
    off(_event, id) { this.byId.delete(id); },
    fire(event, ...args) {
      for (const entry of this.byId.values()) {
        if (entry.event === event) entry.fn(...args);
      }
    },
  };
  (globalThis as any).Hooks = {
    on: (event: string, fn: HookHandler) => reg.register(event, fn),
    off: (event: string, id: number) => reg.off(event, id),
    once: () => 0,
    call: () => {},
    callAll: () => {},
  };
  return reg;
}

function installFoundryUtils() {
  (globalThis as any).foundry = {
    ...(globalThis as any).foundry,
    utils: {
      ...(globalThis as any).foundry?.utils,
      flattenObject(obj: any): Record<string, any> {
        const result: Record<string, any> = {};
        for (const [k, v] of Object.entries(obj)) {
          if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
            const nested = this.flattenObject(v as any);
            for (const [nk, nv] of Object.entries(nested)) { result[`${k}.${nk}`] = nv; }
          } else { result[k] = v; }
        }
        return result;
      },
      getProperty(obj: any, path: string): any {
        return path.split('.').reduce((cursor: any, seg: string) => cursor?.[seg], obj);
      },
      mergeObject: (a: any, b: any, _opts?: any) => ({ ...a, ...b }),
      deepClone: (v: any) => JSON.parse(JSON.stringify(v)),
    },
  };
}

function makeDA(): any {
  // Phase 8 (R7.3): the actor/item/effect mutation methods were promoted off FoundryDataAccess to the
  // QueryHandlers services; re-expose the ones this test pierces on the DA handle so the captured
  // write-paths are unchanged (the re-bind delegates to the same promoted service the handlers call).
  const qh = new QueryHandlers();
  const da: any = qh.dataAccess;
  da.validateFoundryState = () => {};
  da.updateActor = (d: any) => qh.actorService.updateActor(d);
  da.createItem = (d: any) => qh.itemService.createItem(d);
  return da;
}

// ══════════════════════════════════════════════════
// updateActor
// ══════════════════════════════════════════════════
describe('FoundryDataAccess.updateActor — characterization', () => {
  let hooks: HookRegistry;

  beforeEach(() => {
    hooks = installHookRegistry();
    installFoundryUtils();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    (globalThis as any).ui = {
      notifications: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('snapshot: success result shape for a single-field update', async () => {
    const actor: any = {
      id: 'actor-snap-001',
      name: 'Sigmar Recruit',
      uuid: 'Actor.actor-snap-001',
      system: { details: { career: { value: undefined } } },
      update: vi.fn(async () => {
        // Fire hook synchronously in next microtask — actor value already updated
        actor.system.details.career.value = 'Initiate';
        Promise.resolve().then(() => {
          hooks.fire('updateActor', actor, {
            'system.details.career.value': 'Initiate',
          });
        });
        return actor;
      }),
    };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: (id: string) => (id === actor.id ? actor : null) },
    };

    const da = makeDA();
    const result = await da.updateActor({
      actorId: actor.id,
      updateData: { 'system.details.career.value': 'Initiate' },
      verifyPersistence: false,
    });
    expect(result).toMatchSnapshot();
  });

  it('snapshot: success result shape with warnings array', async () => {
    const actor: any = {
      id: 'actor-snap-002',
      name: 'Veteran Soldier',
      uuid: 'Actor.actor-snap-002',
      system: { characteristics: { ws: { value: 35 } } },
      update: vi.fn(async () => {
        actor.system.characteristics.ws.value = 40;
        Promise.resolve().then(() => {
          hooks.fire('updateActor', actor, {});
        });
        return actor;
      }),
    };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: (id: string) => (id === actor.id ? actor : null) },
    };

    const da = makeDA();
    const result = await da.updateActor({
      actorId: actor.id,
      updateData: { 'system.characteristics.ws.value': 40 },
      warnings: ['Out-of-career advance costs double XP'],
      verifyPersistence: false,
    });
    expect(result).toMatchSnapshot();
  });
});

// ══════════════════════════════════════════════════
// applyDamage
// ══════════════════════════════════════════════════
describe('FoundryDataAccess.applyDamage — characterization', () => {
  let hooks: HookRegistry;

  beforeEach(() => {
    hooks = installHookRegistry();
    installFoundryUtils();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});

    // BUG-344: DAMAGE_TYPE must live on game.wfrp4e.config, not CONFIG.WFRP4E
    (globalThis as any).game = {
      ...(globalThis as any).game,
      wfrp4e: {
        config: { DAMAGE_TYPE: { NORMAL: 0, IGNORE_AP: 1, IGNORE_TB: 2, IGNORE_ALL: 3 } },
      },
    };
    (globalThis as any).canvas = {
      tokens: { placeables: [] },
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function makeActor(id: string, wounds: number, max: number) {
    const actor: any = {
      id,
      name: `Actor-${id}`,
      uuid: `Actor.${id}`,
      system: {
        status: {
          wounds: { value: wounds, max },
          criticalWounds: { value: 0, max: 0 },
          fate: { value: 2 },
          fortune: { value: 1 },
          advantage: { value: 0 },
        },
      },
      effects: [],
      applyBasicDamage: vi.fn(),
    };
    return actor;
  }

  it('snapshot: NORMAL damage to body — before/after shape', async () => {
    const actor = makeActor('damage-snap-001', 14, 14);
    actor.applyBasicDamage = vi.fn(async () => {
      Promise.resolve().then(() => {
        actor.system.status.wounds.value = 7;
        hooks.fire('updateActor', actor, {});
      });
    });
    (globalThis as any).game.actors = { get: (id: string) => (id === actor.id ? actor : null) };

    const da = makeDA();
    const result = await da.applyDamage({
      actorId: actor.id,
      amount: 7,
      damageType: 'NORMAL',
      hitLocation: 'body',
    });
    expect(result).toMatchSnapshot();
  });

  it('snapshot: IGNORE_ALL damage to head — damageType propagated to result', async () => {
    const actor = makeActor('damage-snap-002', 10, 10);
    actor.applyBasicDamage = vi.fn(async () => {
      Promise.resolve().then(() => {
        actor.system.status.wounds.value = 0;
        hooks.fire('updateActor', actor, {});
      });
    });
    (globalThis as any).game.actors = { get: (id: string) => (id === actor.id ? actor : null) };

    const da = makeDA();
    const result = await da.applyDamage({
      actorId: actor.id,
      amount: 10,
      damageType: 'IGNORE_ALL',
      hitLocation: 'head',
    });
    expect(result).toMatchSnapshot();
  });
});

// ══════════════════════════════════════════════════
// createItem
// ══════════════════════════════════════════════════
describe('FoundryDataAccess.createItem — characterization', () => {
  beforeEach(() => {
    installFoundryUtils();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('snapshot: actor-scope creation returns base shape (no returnFullPayload)', async () => {
    const createdItem = {
      id: 'item-snap-001',
      name: 'Hand Weapon',
      type: 'weapon',
      uuid: 'Actor.actor-snap-001.Item.item-snap-001',
      toObject: () => ({ id: 'item-snap-001', name: 'Hand Weapon', type: 'weapon' }),
      effects: { map: () => [] },
    };
    const actor: any = {
      id: 'actor-snap-create-001',
      name: 'Recruit Hansel',
      createEmbeddedDocuments: vi.fn(async () => [createdItem]),
    };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: (id: string) => (id === actor.id ? actor : null) },
    };

    const da = makeDA();
    const result = await da.createItem({
      itemData: { name: 'Hand Weapon', type: 'weapon' },
      destination: { type: 'actor', actorId: actor.id },
    });
    expect(result).toMatchSnapshot();
  });

  it('snapshot: world-scope creation returns folderId + folderPath', async () => {
    const createdItem = {
      id: 'item-snap-002',
      name: 'Torch',
      type: 'trapping',
      uuid: 'Item.item-snap-002',
      toObject: () => ({ id: 'item-snap-002', name: 'Torch', type: 'trapping' }),
      effects: { map: () => [] },
    };
    (globalThis as any).Item = class {
      static create = vi.fn(async () => createdItem);
    };

    // No folder path — folderId should be null, folderPath []
    const da = makeDA();
    const result = await da.createItem({
      itemData: { name: 'Torch', type: 'trapping' },
      destination: { type: 'world' },
    });
    expect(result).toMatchSnapshot();
  });

  it('snapshot: actor-scope with returnFullPayload=true includes itemData+effectIds', async () => {
    const rawObj = { id: 'item-snap-003', name: 'Pistol', type: 'weapon', effects: [] };
    const createdItem = {
      id: 'item-snap-003',
      name: 'Pistol',
      type: 'weapon',
      uuid: 'Actor.actor-snap-002.Item.item-snap-003',
      toObject: () => rawObj,
      effects: { map: (fn: any) => [] },
    };
    const actor: any = {
      id: 'actor-snap-create-002',
      name: 'Pistolier Kurt',
      createEmbeddedDocuments: vi.fn(async () => [createdItem]),
    };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: (id: string) => (id === actor.id ? actor : null) },
    };

    const da = makeDA();
    const result = await da.createItem({
      itemData: { name: 'Pistol', type: 'weapon' },
      destination: { type: 'actor', actorId: actor.id },
      returnFullPayload: true,
    });
    expect(result).toMatchSnapshot();
  });
});
