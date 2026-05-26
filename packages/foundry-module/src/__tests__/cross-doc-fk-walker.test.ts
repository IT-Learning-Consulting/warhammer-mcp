// BUG-173: positive-case vitest for walkInboundFor cascade walker.
// Asserts that a Scene with a journal: FK pointing to a live JournalEntry
// appears in walkInboundFor('JournalEntry', entryId) results.
// Live-fixture pattern: mocks game.journal + game.scenes with controlled data.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { walkInboundFor } from '../handlers/cross-doc-fk.js';

const ENTRY_ID = 'test-journal-entry-001';
const SCENE_ID = 'test-scene-fk-001';

function makeCollection(docs: any[]) {
  return {
    contents: docs,
    get(id: string) { return docs.find((d) => d.id === id); },
  };
}

function makeJournalEntry(id: string) {
  return { id, name: 'Test Journal', _source: { _id: id } };
}

function makeScene(id: string, journalId: string) {
  return {
    id,
    name: 'Test Scene',
    _source: {
      _id: id,
      journal: journalId,
      journalEntryPage: null,
    },
  };
}

let savedGame: any;

beforeEach(() => {
  savedGame = (globalThis as any).game;
  (globalThis as any).game = {
    journal: makeCollection([makeJournalEntry(ENTRY_ID)]),
    scenes: makeCollection([makeScene(SCENE_ID, ENTRY_ID)]),
    // stub remaining top-level collections walker may access
    actors: makeCollection([]),
    items: makeCollection([]),
    tables: makeCollection([]),
    macros: makeCollection([]),
    users: makeCollection([]),
    notes: makeCollection([]),
    playlists: makeCollection([]),
  };
});

afterEach(() => {
  (globalThis as any).game = savedGame;
});

describe('walkInboundFor — positive case (BUG-173)', () => {
  it('finds Scene that references the target JournalEntry via journal FK', async () => {
    const orphans = await walkInboundFor('JournalEntry', ENTRY_ID);

    // walkInboundFor uses skipResolution:true (BUG-106 cascade mode), which means
    // every FK reference to the target is returned regardless of whether the target
    // is alive. The Scene with journal:ENTRY_ID must appear in the result.
    expect(orphans.length).toBeGreaterThan(0);
    expect(orphans.some((o) => o.sourceDocId === SCENE_ID)).toBe(true);
  });

  it('returns empty array when JournalEntry has no inbound FKs', async () => {
    const orphans = await walkInboundFor('JournalEntry', 'nonexistent-entry-id');
    expect(Array.isArray(orphans)).toBe(true);
    // No scenes reference this id, so no orphan entries should be found.
    expect(orphans.length).toBe(0);
  });
});
