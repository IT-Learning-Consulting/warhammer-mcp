// Phase 4g — duplicateActor handler + data-access coverage.
// Happy path + missing source + envelope shape.

import { describe, it, beforeEach, vi, expect } from 'vitest';
import { QueryHandlers } from '../queries.js';
import { expectEnvelope } from './test-utils.js';

function makeHandlers(): QueryHandlers {
  const qh = new QueryHandlers();
  (qh.dataAccess as any).validateFoundryState = () => {};
  return qh;
}

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

describe('handleDuplicateActor — happy path envelope', () => {
  it('returns { success: true, data } with new actor id/name/type', async () => {
    const qh = makeHandlers();
    (qh.dataAccess as any).duplicateActor = async (args: any) => ({
      success: true,
      id: 'new-actor-123',
      name: args.newName ?? 'Source Actor',
      type: 'npc',
    });
    const result = await (qh as any).handleDuplicateActor({
      sourceActorId: 'source-1',
      newName: 'Clone',
    });
    expectEnvelope<{ id: string; name: string; type: string }>(result);
    expect(result.data.id).toBe('new-actor-123');
    expect(result.data.name).toBe('Clone');
    expect(result.data.type).toBe('npc');
  });
});

describe('handleDuplicateActor — missing source', () => {
  it('rejects when data-access throws for unknown source', async () => {
    const qh = makeHandlers();
    (qh.dataAccess as any).duplicateActor = async () => {
      throw new Error('Failed to duplicate actor: Source actor not found with ID: bogus');
    };
    await expect(
      (qh as any).handleDuplicateActor({ sourceActorId: 'bogus' }),
    ).rejects.toThrow(/Source actor not found/);
  });
});

describe('handleDuplicateActor — Zod boundary', () => {
  it('rejects missing sourceActorId with Invalid input', async () => {
    const qh = makeHandlers();
    await expect(
      (qh as any).handleDuplicateActor({}),
    ).rejects.toThrow(/Invalid input/);
  });

  it('rejects wrong type for newName', async () => {
    const qh = makeHandlers();
    await expect(
      (qh as any).handleDuplicateActor({ sourceActorId: 'a1', newName: 42 }),
    ).rejects.toThrow(/Invalid input/);
  });
});

describe('dataAccess.duplicateActor — Actor.create wiring', () => {
  it('strips _id/folder/sort and calls Actor.create with the clone payload', async () => {
    const qh = makeHandlers();
    const sourceObj = {
      _id: 'source-1',
      folder: 'old-folder',
      sort: 5,
      name: 'Template NPC',
      type: 'npc',
      system: { characteristics: {} },
      items: [],
    };
    const source = {
      id: 'source-1',
      name: 'Template NPC',
      toObject: () => ({ ...sourceObj }),
    };
    (globalThis as any).game.actors = new Map([['source-1', source]]);
    const createCalls: any[] = [];
    (globalThis as any).Actor = {
      create: async (data: any) => {
        createCalls.push(data);
        return { id: 'clone-42', name: data.name, type: data.type };
      },
    };

    const result = await (qh.dataAccess as any).duplicateActor({
      sourceActorId: 'source-1',
      newName: 'Cloned',
    });

    expect(createCalls).toHaveLength(1);
    const payload = createCalls[0];
    expect(payload._id).toBeUndefined();
    expect(payload.folder).toBeUndefined();
    expect(payload.sort).toBeUndefined();
    expect(payload.name).toBe('Cloned');
    expect(payload.type).toBe('npc');
    expect(result.success).toBe(true);
    expect(result.id).toBe('clone-42');
    expect(result.name).toBe('Cloned');
    expect(result.type).toBe('npc');
  });

  it('keeps the source name when newName omitted', async () => {
    const qh = makeHandlers();
    const source = {
      id: 'source-2',
      name: 'Keep My Name',
      toObject: () => ({ _id: 'source-2', name: 'Keep My Name', type: 'npc' }),
    };
    (globalThis as any).game.actors = new Map([['source-2', source]]);
    (globalThis as any).Actor = {
      create: async (data: any) => ({ id: 'clone-2', name: data.name, type: data.type }),
    };

    const result = await (qh.dataAccess as any).duplicateActor({
      sourceActorId: 'source-2',
    });

    expect(result.name).toBe('Keep My Name');
  });

  it('throws when source actor does not exist', async () => {
    const qh = makeHandlers();
    (globalThis as any).game.actors = new Map();

    await expect(
      (qh.dataAccess as any).duplicateActor({ sourceActorId: 'ghost' }),
    ).rejects.toThrow(/Source actor not found/);
  });

  it('throws when Actor.create returns null', async () => {
    const qh = makeHandlers();
    const source = {
      id: 'source-3',
      name: 'X',
      toObject: () => ({ _id: 'source-3', name: 'X', type: 'npc' }),
    };
    (globalThis as any).game.actors = new Map([['source-3', source]]);
    (globalThis as any).Actor = { create: async () => null };

    await expect(
      (qh.dataAccess as any).duplicateActor({ sourceActorId: 'source-3' }),
    ).rejects.toThrow(/Actor\.create returned no actor/);
  });
});
