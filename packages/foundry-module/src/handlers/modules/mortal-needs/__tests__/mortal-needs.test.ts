// Module Integration v2 Phase 8 — Unit tests for module-mortal-needs dispatcher + guards.
//
// Deterministic: mocks globalThis.game (modules/user/actors/settings/scenes) and globalThis.foundry.utils
// (for the attribute-modify dot-path consequence). No runtime-import seam needed (mortal-needs.ts reads
// game.modules.get('mortal-needs').api as a plain property — phase8_pre_plan.md §Confirmed facts #11),
// so each test builds a tailored `api` object with vi.fn()s for just the methods it exercises.
//
// Coverage (Rule 9 — each test encodes WHY the behavior matters):
//   1. Inactive mortal-needs → MODULE_NOT_ACTIVE for read AND write (guard returns, never throws).
//   2. TRACK-FIRST DEFENSE: even if api.actors.track() silently no-ops (the upstream bug class this
//      plan exists to guard against), verifyNeedsFlag still catches the drop via the independent
//      re-read — proving the verify step is the real safety net, not just the track-first call.
//   3. A write fired by a non-GM → MORTAL_NEEDS_ACCESS_DENIED. WHY: avoids a confusing NOT_PERSISTED
//      from the module's own internal isGM no-op.
//   4. Each of the 4 confirm-gated actions WITHOUT confirm → MORTAL_NEEDS_CONFIRM_REQUIRED, BEFORE any
//      module call. WHY: CCR-4 — irreversible/mass ops gate on confirm.
//   5. untrack-actor WITH confirm:true succeeds end to end.
//   6. configure-need / enable-need route through config.importConfig (NOT the non-persisting raw
//      config.updateNeedConfig). WHY: the whole importConfig-persist thesis (phase8_pre_plan.md #6).
//   7. apply-consequence (condition-apply) verifies via actor.statuses.has — the dialog-free path.
//   8. set-need reports a clamp when the engine returns a value different from the request.
//   9. An unknown action → MORTAL_NEEDS_INVALID_INPUT (discriminatedUnion reject).
//  10. track-actor is idempotent — an already-tracked actor short-circuits without calling api.actors.track.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { dispatchModuleMortalNeeds } from '../mortal-needs.js';

function makeActor(id: string, name: string, initialNeeds: Record<string, number> = {}) {
  let needsFlag: Record<string, number> = { ...initialNeeds };
  const statuses = new Set<string>();
  const system: any = { status: { fatigue: { value: 0 } } };
  return {
    id,
    name,
    system,
    statuses,
    effects: [] as any[],
    getFlag: vi.fn((scope: string, key: string) => {
      if (scope !== 'mortal-needs') return undefined;
      if (key === 'needs') return { ...needsFlag };
      return undefined;
    }),
    setFlag: vi.fn(async (scope: string, key: string, value: any) => {
      if (scope === 'mortal-needs' && key === 'needs') needsFlag = { ...value };
    }),
    update: vi.fn(async (changes: Record<string, any>) => {
      for (const [path, val] of Object.entries(changes)) {
        if (path === 'system.status.fatigue.value') system.status.fatigue.value = val;
      }
    }),
  };
}

function makeSettings(seed: Record<string, any> = {}) {
  const store: Record<string, any> = { trackedActors: [], ...seed };
  return {
    get: vi.fn((_s: string, k: string) => store[k]),
    set: vi.fn(async (_s: string, k: string, v: any) => {
      store[k] = v;
    }),
    store,
  };
}

function makeGame(opts: { active: boolean; isGM?: boolean; api?: any; settings?: any; actors?: Record<string, any> }) {
  const actors = opts.actors ?? {};
  return {
    modules: {
      get: (id: string) =>
        id === 'mortal-needs' ? (opts.active ? { active: true, title: 'Mortal Needs', version: '2.3.2', api: opts.api } : undefined) : undefined,
    },
    user: { isGM: opts.isGM ?? true, id: 'gm1' },
    settings: opts.settings,
    actors: { get: (id: string) => actors[id] },
    scenes: { active: null },
  };
}

beforeEach(() => {
  (globalThis as any).game = undefined;
  (globalThis as any).foundry = {
    utils: {
      getProperty: (obj: any, path: string) => path.split('.').reduce((o: any, k: string) => (o == null ? undefined : o[k]), obj),
    },
  };
});
afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).foundry;
});

// ── 1. Inactive module guard ────────────────────────────────────────────────────

describe('module-active guard', () => {
  it('inactive mortal-needs → MODULE_NOT_ACTIVE on a write action (returns, never throws)', async () => {
    (globalThis as any).game = makeGame({ active: false });
    const res: any = await dispatchModuleMortalNeeds({ action: 'stress-need', entityId: 'a1', needId: 'hunger', amount: 10 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
    expect(res.error).toContain('mortal-needs');
  });

  it('inactive mortal-needs → MODULE_NOT_ACTIVE on a read action too', async () => {
    (globalThis as any).game = makeGame({ active: false });
    const res: any = await dispatchModuleMortalNeeds({ action: 'list-tracked' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
  });
});

// ── 2. Track-first defense — verify catches the silent drop even when track() no-ops ───────────────

describe('untracked-actor silent-drop guard', () => {
  it('a stress whose persisted flag never reflects the in-memory value → MORTAL_NEEDS_NOT_PERSISTED', async () => {
    const a1 = makeActor('a1', 'Grenz'); // getFlag('needs') stays {} — simulates persistActor() no-op
    const api = {
      actors: { isTracked: vi.fn(() => false), track: vi.fn(async () => undefined) }, // track silently fails (the bug)
      needs: {
        stress: vi.fn(async () => ({ value: 25, min: 0, max: 100, lastChange: Date.now(), source: 'stress', previousValue: 0 })),
        get: vi.fn(() => ({ value: 25, min: 0, max: 100, lastChange: Date.now(), source: 'stress' })), // authoritative in-memory value
      },
    };
    (globalThis as any).game = makeGame({ active: true, api, actors: { a1 } });
    const res: any = await dispatchModuleMortalNeeds({ action: 'stress-need', entityId: 'a1', needId: 'hunger', amount: 25 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MORTAL_NEEDS_NOT_PERSISTED');
    expect(api.actors.track).toHaveBeenCalledTimes(1); // track-first WAS attempted
    expect(api.needs.stress).toHaveBeenCalledTimes(1);
  });
});

// ── 3. GM gate ──────────────────────────────────────────────────────────────────

describe('GM gate', () => {
  it('a write action fired by a non-GM → MORTAL_NEEDS_ACCESS_DENIED', async () => {
    const api = { needs: { stress: vi.fn() }, actors: { isTracked: vi.fn(() => true), track: vi.fn() } };
    (globalThis as any).game = makeGame({ active: true, isGM: false, api, actors: { a1: makeActor('a1', 'X') } });
    const res: any = await dispatchModuleMortalNeeds({ action: 'stress-need', entityId: 'a1', needId: 'hunger', amount: 10 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MORTAL_NEEDS_ACCESS_DENIED');
    expect(api.needs.stress).not.toHaveBeenCalled();
  });
});

// ── 4. Confirm gates (CCR-4) — all 4 destructive/mass actions ──────────────────────

describe('confirm gates (CCR-4)', () => {
  it('reset-all WITHOUT confirm → MORTAL_NEEDS_CONFIRM_REQUIRED, module never called', async () => {
    const api = { needs: { resetAll: vi.fn() }, actors: { isTracked: vi.fn(() => true), track: vi.fn() } };
    (globalThis as any).game = makeGame({ active: true, api, actors: { a1: makeActor('a1', 'X') } });
    const res: any = await dispatchModuleMortalNeeds({ action: 'reset-all', entityId: 'a1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MORTAL_NEEDS_CONFIRM_REQUIRED');
    expect(api.needs.resetAll).not.toHaveBeenCalled();
  });

  it('untrack-actor WITHOUT confirm → MORTAL_NEEDS_CONFIRM_REQUIRED, module never called', async () => {
    const api = { actors: { isTracked: vi.fn(() => true), untrack: vi.fn() } };
    (globalThis as any).game = makeGame({ active: true, api, actors: { a1: makeActor('a1', 'X') }, settings: makeSettings({ trackedActors: ['a1'] }) });
    const res: any = await dispatchModuleMortalNeeds({ action: 'untrack-actor', entityId: 'a1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MORTAL_NEEDS_CONFIRM_REQUIRED');
    expect(api.actors.untrack).not.toHaveBeenCalled();
  });

  it('long-rest with no entityId (party-wide) WITHOUT confirm → MORTAL_NEEDS_CONFIRM_REQUIRED', async () => {
    const api = { actors: { getTrackedActors: vi.fn(() => []) }, macro: { longRest: vi.fn() } };
    (globalThis as any).game = makeGame({ active: true, api, actors: {} });
    const res: any = await dispatchModuleMortalNeeds({ action: 'long-rest' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MORTAL_NEEDS_CONFIRM_REQUIRED');
    expect(api.macro.longRest).not.toHaveBeenCalled();
  });

  it('unregister-custom-need WITHOUT confirm → MORTAL_NEEDS_CONFIRM_REQUIRED', async () => {
    const api = {
      config: { getNeedConfig: vi.fn(() => ({ id: 'morale', custom: true })), getAllNeeds: vi.fn(() => []), importConfig: vi.fn() },
      register: { unregisterNeed: vi.fn() },
    };
    (globalThis as any).game = makeGame({ active: true, api, actors: {} });
    const res: any = await dispatchModuleMortalNeeds({ action: 'unregister-custom-need', needId: 'morale' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MORTAL_NEEDS_CONFIRM_REQUIRED');
    expect(api.register.unregisterNeed).not.toHaveBeenCalled();
  });
});

// ── 5. Confirmed untrack-actor succeeds end to end ──────────────────────────────────

describe('confirmed destructive action', () => {
  it('untrack-actor WITH confirm:true removes the actor from the tracked roster', async () => {
    const settings = makeSettings({ trackedActors: ['a1'] });
    let tracked = true;
    const api = {
      actors: {
        isTracked: vi.fn(() => tracked),
        untrack: vi.fn(async () => {
          tracked = false;
          settings.store.trackedActors = settings.store.trackedActors.filter((id: string) => id !== 'a1');
        }),
      },
    };
    (globalThis as any).game = makeGame({ active: true, api, actors: { a1: makeActor('a1', 'Grenz') }, settings });
    const res: any = await dispatchModuleMortalNeeds({ action: 'untrack-actor', entityId: 'a1', confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.deleted).toBe(true);
    expect(api.actors.untrack).toHaveBeenCalledTimes(1);
  });
});

// ── 6. importConfig-persist (NOT the raw non-persisting config.updateNeedConfig) ───────────────

describe('config writes route through importConfig', () => {
  it('enable-need calls config.importConfig and NEVER config.updateNeedConfig', async () => {
    let configs = [{ id: 'hunger', enabled: false, label: 'Hunger', min: 0, max: 100, default: 0 }];
    const api = {
      config: {
        getAllNeeds: vi.fn(() => configs),
        getNeedConfig: vi.fn((id: string) => configs.find((c) => c.id === id) ?? null),
        importConfig: vi.fn(async (json: any) => {
          configs = json.needs; // mirrors ConfigManager.importConfig → store.setNeedConfigs
        }),
        updateNeedConfig: vi.fn(() => {
          throw new Error('updateNeedConfig must never be called — it is the non-persisting path');
        }),
      },
    };
    (globalThis as any).game = makeGame({ active: true, api, actors: {} });
    const res: any = await dispatchModuleMortalNeeds({ action: 'enable-need', needId: 'hunger' });
    expect(res.success).toBe(true);
    expect(api.config.importConfig).toHaveBeenCalledTimes(1);
    expect(api.config.updateNeedConfig).not.toHaveBeenCalled();
    expect(res.data.config.enabled).toBe(true);
  });

  it('configure-need with arbitrary changes persists via importConfig and verifies the field landed', async () => {
    let configs = [{ id: 'cold', enabled: true, label: 'Cold', min: 0, max: 100, default: 0, stressAmount: 10 }];
    const api = {
      config: {
        getAllNeeds: vi.fn(() => configs),
        getNeedConfig: vi.fn((id: string) => configs.find((c) => c.id === id) ?? null),
        importConfig: vi.fn(async (json: any) => {
          configs = json.needs;
        }),
      },
    };
    (globalThis as any).game = makeGame({ active: true, api, actors: {} });
    const res: any = await dispatchModuleMortalNeeds({ action: 'configure-need', needId: 'cold', changes: { stressAmount: 20 } });
    expect(res.success).toBe(true);
    expect(res.data.config.stressAmount).toBe(20);
  });
});

// ── 7. Consequence — dialog-free condition-apply ────────────────────────────────────

describe('apply-consequence (R8.2, dialog-free)', () => {
  it('condition-apply verifies via actor.statuses.has, not a flag read', async () => {
    const a1 = makeActor('a1', 'Grenz');
    const api = {
      actors: { isTracked: vi.fn(() => true), track: vi.fn() },
      consequences: {
        apply: vi.fn(async () => {
          a1.statuses.add('fatigued');
        }),
      },
    };
    (globalThis as any).game = makeGame({ active: true, api, actors: { a1 } });
    const res: any = await dispatchModuleMortalNeeds({
      action: 'apply-consequence',
      entityId: 'a1',
      needId: 'exhaustion',
      consequenceType: 'condition-apply',
      statusId: 'fatigued',
    });
    expect(res.success).toBe(true);
    expect(res.data.active).toBe(true);
    expect(api.consequences.apply).toHaveBeenCalledTimes(1);
  });

  it('condition-apply that does not land (module no-op) → MORTAL_NEEDS_NOT_PERSISTED', async () => {
    const a1 = makeActor('a1', 'Grenz');
    const api = {
      actors: { isTracked: vi.fn(() => true), track: vi.fn() },
      consequences: { apply: vi.fn(async () => undefined) }, // never adds the status
    };
    (globalThis as any).game = makeGame({ active: true, api, actors: { a1 } });
    const res: any = await dispatchModuleMortalNeeds({
      action: 'apply-consequence',
      entityId: 'a1',
      needId: 'exhaustion',
      consequenceType: 'condition-apply',
      statusId: 'fatigued',
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MORTAL_NEEDS_NOT_PERSISTED');
  });
});

// ── 8. set-need clamp reporting ─────────────────────────────────────────────────────

describe('set-need clamp', () => {
  it('a value above max is clamped by the engine and the response reports clamped:true', async () => {
    const a1 = makeActor('a1', 'Grenz', {});
    const api = {
      actors: { isTracked: vi.fn(() => true), track: vi.fn() },
      needs: {
        set: vi.fn(async (_id: string, needId: string) => {
          (a1 as any)._setBackingFlag = { [needId]: 100 };
          await a1.setFlag('mortal-needs', 'needs', (a1 as any)._setBackingFlag);
          return { value: 100, min: 0, max: 100, lastChange: Date.now(), source: 'manual', previousValue: 0 };
        }),
        get: vi.fn((_id: string, needId: string) => ({ value: 100, min: 0, max: 100, lastChange: Date.now(), source: 'manual' })),
      },
    };
    (globalThis as any).game = makeGame({ active: true, api, actors: { a1 } });
    const res: any = await dispatchModuleMortalNeeds({ action: 'set-need', entityId: 'a1', needId: 'hunger', value: 150 });
    expect(res.success).toBe(true);
    expect(res.data.value).toBe(100);
    expect(res.data.requestedValue).toBe(150);
    expect(res.data.clamped).toBe(true);
  });
});

// ── 9. discriminatedUnion rejects an off-list action ────────────────────────────────

describe('schema discriminatedUnion', () => {
  it('an unknown action is rejected at parse → MORTAL_NEEDS_INVALID_INPUT', async () => {
    (globalThis as any).game = makeGame({ active: true, api: {}, actors: {} });
    const res: any = await dispatchModuleMortalNeeds({ action: 'nuke-the-world', entityId: 'a1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MORTAL_NEEDS_INVALID_INPUT');
  });
});

// ── 10. track-actor idempotency ──────────────────────────────────────────────────────

describe('track-actor idempotency', () => {
  it('an already-tracked actor short-circuits without calling api.actors.track', async () => {
    const api = { actors: { isTracked: vi.fn(() => true), track: vi.fn() } };
    (globalThis as any).game = makeGame({ active: true, api, actors: { a1: makeActor('a1', 'Grenz') } });
    const res: any = await dispatchModuleMortalNeeds({ action: 'track-actor', entityId: 'a1' });
    expect(res.success).toBe(true);
    expect(res.data.alreadyTracked).toBe(true);
    expect(api.actors.track).not.toHaveBeenCalled();
  });
});
