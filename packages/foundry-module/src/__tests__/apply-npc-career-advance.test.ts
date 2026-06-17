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

function mockActor(opts: {
  id: string;
  name: string;
  type: string;
  items?: Array<{ id: string; name: string; type: string; system?: any }>;
  advance?: (career: any) => void;
}) {
  const items = new Map((opts.items ?? []).map((i) => [i.id, i]));
  return {
    id: opts.id,
    name: opts.name,
    type: opts.type,
    items: { get: (k: string) => items.get(k) },
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
    const qh = makeHandlers();
    const advanceCalls: any[] = [];
    const career = { id: 'c1', name: 'Apothecary', type: 'career', system: { level: { value: 2 } } };
    const actor = mockActor({
      id: 'npc-1',
      name: 'Marius',
      type: 'npc',
      items: [career],
      advance: (c) => advanceCalls.push(c),
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
