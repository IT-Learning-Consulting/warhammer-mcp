// Phase 3b — BUG-015 / CCR-1 / R3: every handler emits a uniform envelope.
// One test per category (read, actor-write, item-write, journal-write,
// rolltable-write, scene-read). Stubs dataAccess; asserts full envelope shape.

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
  (globalThis as any).game = {
    ...(globalThis as any).game,
    system: { id: 'wfrp4e' },
    user: { isGM: true, id: 'gm', name: 'GM' },
    tables: new Map(),
    actors: new Map(),
  };
});

describe('handler envelope — read (handleListActors)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    (qh.dataAccess as any).listActors = async () => [
      { id: 'a1', name: 'Hero' },
    ];
    const result = await (qh as any).handleListActors({});
    expectEnvelope<Array<{ id: string; name: string }>>(result);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('a1');
  });
});

describe('handler envelope — scene-read (handleGetActiveScene)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    (qh.dataAccess as any).getActiveScene = async () => ({
      id: 's1',
      name: 'Stage',
    });
    const result = await (qh as any).handleGetActiveScene({});
    expectEnvelope<{ id: string; name: string }>(result);
    expect(result.data.name).toBe('Stage');
  });
});

describe('handler envelope — actor-write (handleUpdateActor)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    (qh.dataAccess as any).updateActor = async () => ({
      actorId: 'a1',
      updated: true,
    });
    const result = await (qh as any).handleUpdateActor({
      actorId: 'a1',
      updateData: { name: 'Renamed' },
    });
    expectEnvelope<{ actorId: string; updated: boolean }>(result);
    expect(result.data.updated).toBe(true);
  });
});

describe('handler envelope — item-write (handleCreateItem)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    (qh.dataAccess as any).createItem = async () => ({
      itemId: 'i1',
      itemName: 'Sword',
    });
    const result = await (qh as any).handleCreateItem({
      actorId: 'a1',
      itemData: { name: 'Sword', type: 'weapon' },
    });
    expectEnvelope<{ itemId: string; itemName: string }>(result);
    expect(result.data.itemId).toBe('i1');
  });
});

describe('handler envelope — journal-write (handleCreateJournalEntry)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    (qh.dataAccess as any).createJournalEntry = async () => ({
      journalId: 'j1',
      name: 'Log',
    });
    const result = await qh.handleCreateJournalEntry({
      name: 'Log',
      content: 'hello',
    });
    expectEnvelope<{ journalId: string; name: string }>(result);
    expect(result.data.journalId).toBe('j1');
  });
});

describe('handler envelope — rolltable-write (handleCreateRollTable)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    (globalThis as any).RollTable = class {
      static async create(tableData: any) {
        return {
          id: 't1',
          name: tableData.name,
          createEmbeddedDocuments: async () => {},
        };
      }
    };
    const result = await (qh as any).handleCreateRollTable({
      tableData: { name: 'Mishaps', results: [] },
    });
    expectEnvelope<{ id: string; name: string }>(result);
    expect(result.data.name).toBe('Mishaps');
  });
});
