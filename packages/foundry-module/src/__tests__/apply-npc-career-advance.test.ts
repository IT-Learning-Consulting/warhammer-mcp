// Phase 4g — applyNpcCareerAdvance handler + data-access coverage.
// Happy path + non-npc guard + missing career guard + missing advance() guard.

import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { QueryHandlers } from '../queries.js';
import { expectEnvelope } from './test-utils.js';

function makeHandlers(): QueryHandlers {
  const qh = new QueryHandlers();
  (qh.dataAccess as any).validateFoundryState = () => {};
  return qh;
}

// Mirrors Foundry's real EmbeddedCollection contract just enough for BUG-692's delta-verify
// (which needs .get() for career lookup AND array-like .filter()/iteration for the fresh
// characteristic/skill/talent read-back) — a plain {get} stub is not iterable/filterable.
class MockItemCollection extends Map<string, any> {
  filter(fn: (it: any) => boolean): any[] {
    return Array.from(this.values()).filter(fn);
  }
  find(fn: (it: any) => boolean): any {
    return Array.from(this.values()).find(fn);
  }
  [Symbol.iterator](): IterableIterator<any> {
    return this.values();
  }
}

function mockActor(opts: {
  id: string;
  name: string;
  type: string;
  items?: Array<{ id: string; name: string; type: string; system?: any }>;
  advance?: (career: any) => void;
}) {
  const items = new MockItemCollection((opts.items ?? []).map((i) => [i.id, i]));
  return {
    id: opts.id,
    name: opts.name,
    type: opts.type,
    items,
    deleteEmbeddedDocuments: async (_docType: string, ids: string[]) => {
      for (const id of ids) items.delete(id);
      return ids;
    },
    system: { advance: opts.advance ?? (() => {}) },
  };
}

// Capture the global Hooks setup so BUG-217/218 tests can restore it after use.
const _originalHooks = (globalThis as any).Hooks;

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  (globalThis as any).ui = { notifications: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } };
  (globalThis as any).game = {
    ...(globalThis as any).game,
    system: { id: 'wfrp4e' },
    user: { isGM: true, id: 'gm', name: 'GM' },
    tables: new Map(),
    actors: new Map(),
  };
});

afterEach(() => {
  // Restore Hooks to the global setup.ts version; BUG-217/218 tests replace it.
  (globalThis as any).Hooks = _originalHooks;
});

describe('handleApplyNpcCareerAdvance — happy path envelope', () => {
  it('returns { success: true, data } with actor + career summary', async () => {
    const qh = makeHandlers();
    (qh.actorService as any).applyNpcCareerAdvance = async () => ({
      success: true,
      actorId: 'npc-1',
      actorName: 'Marius',
      careerItemId: 'c1',
      careerName: 'Apothecary',
      careerLevel: 2,
    });
    const result = await (qh as any).handleApplyNpcCareerAdvance({
      actorId: 'npc-1',
      careerItemId: 'c1',
    });
    expectEnvelope<{ actorId: string; careerName: string; careerLevel: number }>(result);
    expect(result.data.actorId).toBe('npc-1');
    expect(result.data.careerName).toBe('Apothecary');
    expect(result.data.careerLevel).toBe(2);
  });
});

describe('handleApplyNpcCareerAdvance — Zod boundary', () => {
  it('rejects missing careerItemId with Invalid input', async () => {
    const qh = makeHandlers();
    await expect(
      (qh as any).handleApplyNpcCareerAdvance({ actorId: 'npc-1' }),
    ).rejects.toThrow(/Invalid input/);
  });

  it('rejects unknown extra keys', async () => {
    const qh = makeHandlers();
    await expect(
      (qh as any).handleApplyNpcCareerAdvance({
        actorId: 'npc-1',
        careerItemId: 'c1',
        extraneous: true,
      }),
    ).rejects.toThrow(/Invalid input/);
  });
});

describe('dataAccess.applyNpcCareerAdvance — type + item guards', () => {
  it('invokes actor.system.advance(career) on happy path', async () => {
    // BUG-692: waitForActorUpdateCommit's timeout is now an explicit failure, so this
    // fixture's advance() must fire the updateActor hook — matching what a real (awaited)
    // actor.update() commit would do — or the call now correctly throws.
    const hooks = makeHooksMock();
    (globalThis as any).Hooks = hooks;

    const qh = makeHandlers();
    const advanceCalls: any[] = [];
    const career = { id: 'c1', name: 'Apothecary', type: 'career', system: { level: { value: 2 } } };
    const actor = mockActor({
      id: 'npc-1',
      name: 'Marius',
      type: 'npc',
      items: [career],
      advance: (c) => {
        advanceCalls.push(c);
        hooks.fire('updateActor', { id: 'npc-1' });
      },
    });
    (globalThis as any).game.actors = new Map([['npc-1', actor]]);

    const result = await (qh.actorService as any).applyNpcCareerAdvance({
      actorId: 'npc-1',
      careerItemId: 'c1',
    });

    expect(advanceCalls).toHaveLength(1);
    expect(advanceCalls[0]).toBe(career);
    expect(result.success).toBe(true);
    expect(result.actorId).toBe('npc-1');
    expect(result.careerName).toBe('Apothecary');
    expect(result.careerLevel).toBe(2);
  });

  it('rejects creature-type actor with a typed error', async () => {
    const qh = makeHandlers();
    const actor = mockActor({ id: 'cr-1', name: 'Goblin', type: 'creature' });
    (globalThis as any).game.actors = new Map([['cr-1', actor]]);

    await expect(
      (qh.actorService as any).applyNpcCareerAdvance({ actorId: 'cr-1', careerItemId: 'c1' }),
    ).rejects.toThrow(/requires an npc-type actor/);
  });

  it('rejects character-type actor with a typed error', async () => {
    const qh = makeHandlers();
    const actor = mockActor({ id: 'pc-1', name: 'Hero', type: 'character' });
    (globalThis as any).game.actors = new Map([['pc-1', actor]]);

    await expect(
      (qh.actorService as any).applyNpcCareerAdvance({ actorId: 'pc-1', careerItemId: 'c1' }),
    ).rejects.toThrow(/requires an npc-type actor/);
  });

  it('rejects missing actor', async () => {
    const qh = makeHandlers();
    (globalThis as any).game.actors = new Map();

    await expect(
      (qh.actorService as any).applyNpcCareerAdvance({ actorId: 'ghost', careerItemId: 'c1' }),
    ).rejects.toThrow(/Actor not found/);
  });

  it('rejects missing career item on actor', async () => {
    const qh = makeHandlers();
    const actor = mockActor({ id: 'npc-2', name: 'X', type: 'npc', items: [] });
    (globalThis as any).game.actors = new Map([['npc-2', actor]]);

    await expect(
      (qh.actorService as any).applyNpcCareerAdvance({ actorId: 'npc-2', careerItemId: 'missing' }),
    ).rejects.toThrow(/Career item ".+" not found/);
  });

  it('rejects non-career item id', async () => {
    const qh = makeHandlers();
    const actor = mockActor({
      id: 'npc-3',
      name: 'X',
      type: 'npc',
      items: [{ id: 'w1', name: 'Sword', type: 'weapon' }],
    });
    (globalThis as any).game.actors = new Map([['npc-3', actor]]);

    await expect(
      (qh.actorService as any).applyNpcCareerAdvance({ actorId: 'npc-3', careerItemId: 'w1' }),
    ).rejects.toThrow(/expected "career"/);
  });

  it('rejects when actor.system.advance is missing', async () => {
    const qh = makeHandlers();
    const career = { id: 'c1', name: 'Apothecary', type: 'career' };
    const actor: any = mockActor({ id: 'npc-4', name: 'X', type: 'npc', items: [career] });
    actor.system = {}; // no advance method
    (globalThis as any).game.actors = new Map([['npc-4', actor]]);

    await expect(
      (qh.actorService as any).applyNpcCareerAdvance({ actorId: 'npc-4', careerItemId: 'c1' }),
    ).rejects.toThrow(/no system\.advance method/);
  });
});

// BUG-217 + BUG-218 — waitForActorUpdateCommit observer pattern + post-verify throw.
// Tests use a controlled Hooks stub so model.advance can fire the hook synchronously.

function makeHooksMock() {
  let counter = 0;
  const cbs: Record<string, Array<{ id: number; fn: Function }>> = {};
  return {
    on(event: string, fn: Function) {
      const id = ++counter;
      (cbs[event] = cbs[event] ?? []).push({ id, fn });
      return id;
    },
    off(event: string, id: number) {
      cbs[event] = (cbs[event] ?? []).filter((h) => h.id !== id);
    },
    fire(event: string, ...args: unknown[]) {
      for (const h of cbs[event] ?? []) h.fn(...args);
    },
  };
}

describe('applyNpcCareerAdvance — BUG-217/218 observer + post-verify', () => {
  it('BUG-217: handler awaits updateActor hook before returning (observer resolves before return)', async () => {
    const hooks = makeHooksMock();
    (globalThis as any).Hooks = hooks;

    const career = { id: 'c1', name: 'Apothecary', type: 'career', system: { level: { value: 2 } } };
    const actor = mockActor({
      id: 'npc-5',
      name: 'Gunther',
      type: 'npc',
      items: [career],
      advance(c: any) {
        // Fire the hook synchronously — simulates Foundry's async actor.update completing.
        hooks.fire('updateActor', { id: 'npc-5', name: 'Gunther' });
        void c; // no-op — advance doesn't use return value
      },
    });
    (globalThis as any).game.actors = new Map([['npc-5', actor]]);

    const qh = makeHandlers();
    const res = await (qh.actorService as any).applyNpcCareerAdvance({
      actorId: 'npc-5',
      careerItemId: 'c1',
    });
    // Handler completed successfully — observer resolved before handler returned.
    expect(res.success).toBe(true);
    expect(res.actorId).toBe('npc-5');
  });

  it('BUG-218: actor gone after commit → throws APPLY_NPC_CAREER_ADVANCE_NOT_PERSISTED', async () => {
    const hooks = makeHooksMock();
    (globalThis as any).Hooks = hooks;

    const career = { id: 'c1', name: 'Apothecary', type: 'career', system: { level: { value: 1 } } };
    const actor = mockActor({
      id: 'npc-6',
      name: 'Wulfhart',
      type: 'npc',
      items: [career],
      advance(c: any) {
        hooks.fire('updateActor', { id: 'npc-6' }); // observer resolves
        void c;
      },
    });
    // After the observer fires, actor is no longer in game.actors (simulates disappearance).
    const actorMap: Map<string, any> = new Map([['npc-6', actor]]);
    (globalThis as any).game.actors = actorMap;

    const qh = makeHandlers();
    // Override advance to also remove the actor from the map (post-commit disappearance).
    actor.system.advance = (c: any) => {
      hooks.fire('updateActor', { id: 'npc-6' });
      actorMap.delete('npc-6'); // actor disappears after commit
      void c;
    };

    await expect(
      (qh.actorService as any).applyNpcCareerAdvance({ actorId: 'npc-6', careerItemId: 'c1' }),
    ).rejects.toThrow(/APPLY_NPC_CAREER_ADVANCE_NOT_PERSISTED/);
  });
});

// BUG-692 — timeout is now an explicit failure, and success requires the PROMISED
// characteristic/skill/talent deltas to have actually landed, not just document existence.

describe('applyNpcCareerAdvance — BUG-692 explicit timeout failure + real delta verify', () => {
  // BUG-866: the timeout path is no longer an unconditional throw — a bounded re-check
  // (~3 x 150ms) of the SAME promised-delta verification the success path uses runs first.
  // This fixture's career now promises a characteristic that advance() never actually delivers
  // (advance() is a true no-op — no hook fire, no state mutation), so the re-check genuinely
  // finds the delta absent on every attempt and the original token still fires — the "old
  // exit-state preserved" sibling case. (Previously this career promised nothing at all, which
  // is now a vacuously-verified case under BUG-866's re-check and no longer proves a genuine
  // failure; the promised characteristic makes this fixture an actual absent-delta case again.)
  it('throws APPLY_NPC_CAREER_ADVANCE_NOT_PERSISTED when the updateActor hook never fires AND the promised delta never lands (genuine timeout)', async () => {
    const hooks = makeHooksMock(); // hook never fired by advance() below — simulates a slow/contended write
    (globalThis as any).Hooks = hooks;

    const career = {
      id: 'c1', name: 'Apothecary', type: 'career',
      system: { level: { value: 1 }, characteristics: { ws: true }, skills: [], talents: [] },
    };
    const actor = mockActor({
      id: 'npc-7',
      name: 'Timeout',
      type: 'npc',
      items: [career],
      advance() { /* never fires the hook, never mutates state */ },
    });
    (actor as any).system.characteristics = { ws: { advances: 0 } }; // never reaches the expected 5
    (globalThis as any).game.actors = new Map([['npc-7', actor]]);

    const qh = makeHandlers();
    await expect(
      (qh.actorService as any).applyNpcCareerAdvance({ actorId: 'npc-7', careerItemId: 'c1' }),
    ).rejects.toThrow(/APPLY_NPC_CAREER_ADVANCE_NOT_PERSISTED.*timed out/);
  }, 2000);

  // BUG-866: reachability case A — the observer times out (`committed === false`, the old
  // unconditional-throw condition) but the actor ALREADY carries every promised delta (advance()
  // mutated state synchronously, same as a real un-awaited actor.update() landing just after the
  // 250ms window closes) — this is not a failure. The bounded re-check finds the deltas on
  // (at most) its first pass and the call resolves as success; `advance()` is called exactly
  // once — no second write is ever issued.
  it('BUG-866: resolves success when the observer times out but the promised deltas are already present', async () => {
    const hooks = makeHooksMock(); // hook deliberately never fires — forces committed === false
    (globalThis as any).Hooks = hooks;

    const career = {
      id: 'c1', name: 'Apothecary', type: 'career',
      system: { level: { value: 1 }, characteristics: { ws: true }, skills: ['Heal'], talents: ['Savvy'] },
    };
    const healSkill = { id: 'sk1', name: 'Heal', type: 'skill', system: { advances: { value: 5 } } };
    const advanceCalls: any[] = [];
    const actor = mockActor({
      id: 'npc-12', name: 'Already-Landed', type: 'npc', items: [career, healSkill],
      advance(c: any) {
        advanceCalls.push(c);
        // Mutates state synchronously (simulating the un-awaited actor.update() having already
        // settled) but deliberately never fires the updateActor hook — the observer times out.
        (actor as any).items.set('tal1', { id: 'tal1', name: 'Savvy', type: 'talent' });
      },
    });
    (actor as any).system.characteristics = { ws: { advances: 5 } }; // meets expected 5 (level 1 * 5)
    (globalThis as any).game.actors = new Map([['npc-12', actor]]);

    const qh = makeHandlers();
    const result = await (qh.actorService as any).applyNpcCareerAdvance({
      actorId: 'npc-12', careerItemId: 'c1',
    });

    expect(result.success).toBe(true);
    expect(result.actorId).toBe('npc-12');
    expect(result.talentsAdded).toBe(1);
    expect(advanceCalls).toHaveLength(1);
  }, 2000);

  it('throws when the hook fires but the promised characteristic advance never landed', async () => {
    const hooks = makeHooksMock();
    (globalThis as any).Hooks = hooks;

    const career = {
      id: 'c1', name: 'Apothecary', type: 'career',
      system: { level: { value: 2 }, characteristics: { ws: true }, skills: [], talents: [] },
    };
    const actor = mockActor({
      id: 'npc-8', name: 'Half-Advanced', type: 'npc', items: [career],
      advance(c: any) {
        hooks.fire('updateActor', { id: 'npc-8' }); // hook fires — commit "observed"
        void c; // but the characteristic write never actually happened (system stays default)
      },
    });
    (actor as any).system.characteristics = { ws: { advances: 0 } }; // below the expected 10 (level 2 * 5)
    (globalThis as any).game.actors = new Map([['npc-8', actor]]);

    const qh = makeHandlers();
    await expect(
      (qh.actorService as any).applyNpcCareerAdvance({ actorId: 'npc-8', careerItemId: 'c1' }),
    ).rejects.toThrow(/promised deltas did not fully land.*characteristic "ws"/);
  });

  it('succeeds when every promised characteristic/skill/talent delta is actually present', async () => {
    const hooks = makeHooksMock();
    (globalThis as any).Hooks = hooks;

    const career = {
      id: 'c1', name: 'Apothecary', type: 'career',
      system: { level: { value: 1 }, characteristics: { ws: true }, skills: ['Heal'], talents: ['Savvy'] },
    };
    const healSkill = { id: 'sk1', name: 'Heal', type: 'skill', system: { advances: { value: 5 } } };
    const actor = mockActor({
      id: 'npc-9', name: 'Fully-Advanced', type: 'npc', items: [career, healSkill],
      advance(c: any) {
        (actor as any).items.set('tal1', { id: 'tal1', name: 'Savvy', type: 'talent' });
        hooks.fire('updateActor', { id: 'npc-9' });
        void c;
      },
    });
    (actor as any).system.characteristics = { ws: { advances: 5 } }; // meets expected 5 (level 1 * 5)
    (globalThis as any).game.actors = new Map([['npc-9', actor]]);

    const qh = makeHandlers();
    const result = await (qh.actorService as any).applyNpcCareerAdvance({ actorId: 'npc-9', careerItemId: 'c1' });
    expect(result.success).toBe(true);
    expect(result.talentsAdded).toBe(1);
    expect(result.talentsTrimmed).toBe(0);
  });
});

// BUG-696 — wfrp4e's advance() has no talent-count policy of its own; talentPolicy:'min'
// is a post-hoc trim of the newly-added talents after advance() commits.

describe('applyNpcCareerAdvance — BUG-696 talentPolicy', () => {
  function setupTwoTalentAdvance(actorId: string) {
    const hooks = makeHooksMock();
    (globalThis as any).Hooks = hooks;
    const career = {
      id: 'c1', name: 'Apothecary', type: 'career',
      system: { level: { value: 1 }, characteristics: {}, skills: [], talents: ['Savvy', 'Suave'] },
    };
    const actor = mockActor({
      id: actorId, name: 'Multi-Talent', type: 'npc', items: [career],
      advance() {
        (actor as any).items.set('tal1', { id: 'tal1', name: 'Savvy', type: 'talent' });
        (actor as any).items.set('tal2', { id: 'tal2', name: 'Suave', type: 'talent' });
        hooks.fire('updateActor', { id: actorId });
      },
    });
    (globalThis as any).game.actors = new Map([[actorId, actor]]);
    return actor;
  }

  it('talentPolicy "all" (default) keeps every newly-added talent', async () => {
    setupTwoTalentAdvance('npc-10');
    const qh = makeHandlers();
    const result = await (qh.actorService as any).applyNpcCareerAdvance({ actorId: 'npc-10', careerItemId: 'c1' });
    expect(result.talentPolicy).toBe('all');
    expect(result.talentsAdded).toBe(2);
    expect(result.talentsTrimmed).toBe(0);
  });

  it('talentPolicy "min" trims all but one newly-added talent', async () => {
    const actor = setupTwoTalentAdvance('npc-11');
    const qh = makeHandlers();
    const result = await (qh.actorService as any).applyNpcCareerAdvance({
      actorId: 'npc-11', careerItemId: 'c1', talentPolicy: 'min',
    });
    expect(result.talentPolicy).toBe('min');
    expect(result.talentsAdded).toBe(1);
    expect(result.talentsTrimmed).toBe(1);
    // The actor's actual talent item collection reflects the trim.
    const remaining = Array.from((actor as any).items.values()).filter((it: any) => it.type === 'talent');
    expect(remaining).toHaveLength(1);
  });
});
