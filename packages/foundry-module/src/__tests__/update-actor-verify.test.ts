import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { FoundryDataAccess } from '../data-access.js';

type HookHandler = (...args: any[]) => void;

interface HookRegistry {
  next: number;
  byId: Map<number, { event: string; fn: HookHandler }>;
  register(event: string, fn: HookHandler): number;
  off(event: string, id: number): void;
  fire(event: string, ...args: any[]): void;
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
            for (const [nk, nv] of Object.entries(nested)) {
              result[`${k}.${nk}`] = nv;
            }
          } else {
            result[k] = v;
          }
        }
        return result;
      },
      getProperty(obj: any, path: string): any {
        return path.split('.').reduce((cursor: any, seg: string) => cursor?.[seg], obj);
      },
    },
  };
}

function installHookRegistry(): HookRegistry {
  const reg: HookRegistry = {
    next: 1,
    byId: new Map(),
    register(event, fn) {
      const id = this.next++;
      this.byId.set(id, { event, fn });
      return id;
    },
    off(_event, id) {
      this.byId.delete(id);
    },
    fire(event, ...args) {
      for (const entry of this.byId.values()) {
        if (entry.event === event) entry.fn(...args);
      }
    },
  };
  (globalThis as any).Hooks = {
    on: (event: string, fn: HookHandler) => reg.register(event, fn),
    off: (event: string, id: number) => reg.off(event, id),
    once: (_event: string, _fn: HookHandler) => 0,
    call: () => {},
    callAll: () => {},
  };
  return reg;
}

function makeDA() {
  const da = new FoundryDataAccess();
  (da as any).validateFoundryState = () => {};
  return da;
}

describe('updateActor verify timing (BUG-149)', () => {
  let hooks: HookRegistry;

  beforeEach(() => {
    hooks = installHookRegistry();
    installFoundryUtils();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    (globalThis as any).ui = {
      notifications: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('waits for the matching updateActor hook before verifying persisted fields', async () => {
    const actor: any = {
      id: 'actor-1',
      name: 'Recruit',
      uuid: 'Actor.actor-1',
      system: { details: { career: { value: undefined } } },
      update: vi.fn(async () => {
        Promise.resolve().then(() => {
          actor.system.details.career.value = 'Recruit';
          hooks.fire('updateActor', actor, {
            system: { details: { career: { value: 'Recruit' } } },
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
      updateData: { 'system.details.career.value': 'Recruit' },
    });

    expect(result.updated).toEqual(['system.details.career.value']);
  });

  it('falls back after timeout when no updateActor hook fires', async () => {
    vi.useFakeTimers();
    const actor: any = {
      id: 'actor-1',
      name: 'Recruit',
      uuid: 'Actor.actor-1',
      system: { details: { career: { value: undefined } } },
      update: vi.fn(async () => actor),
    };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: (id: string) => (id === actor.id ? actor : null) },
    };
    const da = makeDA();

    const updatePromise = da.updateActor({
      actorId: actor.id,
      updateData: { 'system.details.career.value': undefined },
    });

    await vi.advanceTimersByTimeAsync(300);
    const result = await updatePromise;
    expect(result.updated).toEqual(['system.details.career.value']);
  });
});
