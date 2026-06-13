// BUG-064 regression — applyDamage must (a) pass `loc` (not `hitloc`) to wfrp4e's
// applyBasicDamage, and (b) wait for the fire-and-forget actor.update() to commit
// (via the updateActor hook) before snapshotting `after`.

import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { FoundryDataAccess } from '../data-access.js';

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

function makeActor(id: string, initialWounds: number, maxWounds: number) {
  const actor: any = {
    id,
    name: `Actor-${id}`,
    system: {
      status: {
        wounds: { value: initialWounds, max: maxWounds },
        criticalWounds: { value: 0, max: 0 },
        fate: { value: 0 },
        fortune: { value: 0 },
        advantage: { value: 0 },
      },
    },
    effects: [],
    applyBasicDamage: vi.fn(),
  };
  return actor;
}

describe('FoundryDataAccess.applyDamage (BUG-064)', () => {
  let da: FoundryDataAccess;
  let hooks: HookRegistry;

  beforeEach(() => {
    hooks = installHookRegistry();
    // BUG-344: wfrp4e exposes DAMAGE_TYPE on `game.wfrp4e.config`, NOT `CONFIG.WFRP4E`
    // (CONFIG.WFRP4E is undefined in the live system). The old mock set it on CONFIG.WFRP4E,
    // so the test stayed green while production silently collapsed every IGNORE_* to NORMAL.
    // The mock now reflects reality: DAMAGE_TYPE lives on game.wfrp4e.config, and CONFIG.WFRP4E
    // is intentionally absent so a regression back to the CONFIG.WFRP4E accessor fails this test.
    (globalThis as any).CONFIG = { queries: {} };
    (globalThis as any).game = (globalThis as any).game ?? {};
    (globalThis as any).game.wfrp4e = {
      config: { DAMAGE_TYPE: { NORMAL: 0, IGNORE_AP: 1, IGNORE_TB: 2, IGNORE_ALL: 3 } },
    };
    da = new FoundryDataAccess();
    (da as any).validateFoundryState = () => {};
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('passes `loc: <string>` (not `hitloc: { result }`) to applyBasicDamage', async () => {
    const actor = makeActor('actor-1', 12, 12);
    actor.applyBasicDamage = vi.fn(async (_amount: number, _opts: any) => {
      // Simulate wfrp4e's fire-and-forget update by mutating + firing the hook in a microtask.
      Promise.resolve().then(() => {
        actor.system.status.wounds.value = 5;
        hooks.fire('updateActor', actor, { system: { status: { wounds: { value: 5 } } } });
      });
    });
    (globalThis as any).game.actors = new Map([[actor.id, actor]]);

    const result = await da.applyDamage({
      actorId: 'actor-1',
      amount: 10,
      damageType: 'IGNORE_ALL',
      hitLocation: 'head',
    });

    expect(actor.applyBasicDamage).toHaveBeenCalledTimes(1);
    const [amount, opts] = actor.applyBasicDamage.mock.calls[0];
    expect(amount).toBe(10);
    expect(opts).toEqual({ damageType: 3, loc: 'head' });
    // Crucial: the deprecated `hitloc` wrapper must not be present.
    expect(opts).not.toHaveProperty('hitloc');

    expect(result.before.wounds.value).toBe(12);
    expect(result.after.wounds.value).toBe(5);
  });

  it('defaults `loc` to "body" when no hitLocation is given', async () => {
    const actor = makeActor('actor-2', 8, 8);
    actor.applyBasicDamage = vi.fn(async () => {
      Promise.resolve().then(() => {
        actor.system.status.wounds.value = 6;
        hooks.fire('updateActor', actor, {});
      });
    });
    (globalThis as any).game.actors = new Map([[actor.id, actor]]);

    await da.applyDamage({ actorId: 'actor-2', amount: 2 });

    const [, opts] = actor.applyBasicDamage.mock.calls[0];
    expect(opts.loc).toBe('body');
    expect(opts.damageType).toBe(0);
  });

  it('waits for the updateActor hook before snapshotting `after` — proves the fire-and-forget fix', async () => {
    const actor = makeActor('actor-3', 20, 20);
    actor.applyBasicDamage = vi.fn(async () => {
      // Resolve the inner promise *before* the wounds mutation lands. The handler must NOT
      // snapshot here — it must wait for the updateActor hook below.
      return;
    });
    (globalThis as any).game.actors = new Map([[actor.id, actor]]);

    const applyPromise = da.applyDamage({ actorId: 'actor-3', amount: 7, damageType: 'NORMAL' });

    // Yield once so the handler reaches its `await updateApplied` line.
    await Promise.resolve();
    await Promise.resolve();

    // Now mutate the actor and fire the hook (simulates wfrp4e's deferred actor.update commit).
    actor.system.status.wounds.value = 13;
    hooks.fire('updateActor', actor, {});

    const result = await applyPromise;
    expect(result.before.wounds.value).toBe(20);
    expect(result.after.wounds.value).toBe(13);
  });

  it('ignores updateActor hooks for unrelated actors', async () => {
    const target = makeActor('target', 15, 15);
    const bystander = makeActor('bystander', 99, 99);
    target.applyBasicDamage = vi.fn(async () => {});
    (globalThis as any).game.actors = new Map([
      [target.id, target],
      [bystander.id, bystander],
    ]);

    vi.useFakeTimers();
    const applyPromise = da.applyDamage({ actorId: 'target', amount: 5 });

    // Yield so the handler installs its hook.
    await Promise.resolve();
    await Promise.resolve();

    // Fire updateActor for a DIFFERENT actor — must not satisfy the wait.
    hooks.fire('updateActor', bystander, {});

    // Advance fake timers to trip the 2s safety net. (Hook never fires for the target actor.)
    await vi.advanceTimersByTimeAsync(2100);

    const result = await applyPromise;
    // Without the update, the snapshot stays at the initial value — the safety timeout
    // guarantees the handler returns rather than hanging forever.
    expect(result.before.wounds.value).toBe(15);
    expect(result.after.wounds.value).toBe(15);
  });

  it('throws a clear error when actorId is unknown', async () => {
    (globalThis as any).game.actors = new Map();
    await expect(
      da.applyDamage({ actorId: 'missing', amount: 1 })
    ).rejects.toThrow(/Actor not found with ID: missing/);
  });
});
