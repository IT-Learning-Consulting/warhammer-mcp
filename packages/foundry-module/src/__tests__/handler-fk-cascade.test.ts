// Unit tests for FK-cascade behaviors in token and note formatters.
// Task 8.8 — Phase 5 mcp_crud_expansion.
//
// Three scenarios per the D3 spec:
//   S1: Token with actorId → actor deleted → actorLinked === false
//   S2: Note with entryId → journal deleted → entryLinked === false
//   S3: Note with entryId + pageId → page deleted (entry still present)
//        → entryLinked === true, pageLinked === false
//
// These are pure unit tests against the serializer helpers. No live Foundry.
// Mocks mirror the minimum Collection surface: { get(id): unknown }.

import { describe, it, expect } from 'vitest';
import { formatFKLink } from '@foundry-mcp/shared';

// ---------------------------------------------------------------------------
// Local re-implementations of the two serializer helpers under test.
// We import formatFKLink directly (same import the handlers use, but from the
// shared source rather than the compiled alias) and restate only the FK parts
// of the serializer so the test doesn't need the full Foundry document shape.
// ---------------------------------------------------------------------------

interface FKActorResult {
  actorId: string | null;
  actorLinked: boolean;
}

function resolveTokenActorFK(
  actorIdRaw: string | null,
  actors: { get(id: string): unknown },
): FKActorResult {
  const link = formatFKLink(actorIdRaw, actors);
  return { actorId: link.id, actorLinked: link.linked };
}

interface FKNoteResult {
  entryId: string | null;
  entryLinked: boolean;
  pageId: string | null;
  pageLinked: boolean;
}

// Mirrors resolveNoteLinks() in handlers/note.ts exactly (B5-aware path).
function resolveNoteLinks(
  entryIdRaw: string | null,
  pageIdRaw: string | null,
  journals: { get(id: string): unknown; values?(): Iterable<unknown> },
): FKNoteResult {
  const entryLink = formatFKLink(entryIdRaw, journals);

  let pageId: string | null = pageIdRaw ?? null;
  let pageLinked = false;

  if (entryLink.linked && pageId) {
    const entry = journals.get(entryLink.id!) as any;
    pageLinked = Boolean(entry?.pages?.get?.(pageId));
  } else if (!entryLink.linked && entryIdRaw) {
    // B5: entryId might actually be a page UUID stored in the wrong field.
    const entries = journals.values ? Array.from(journals.values()) : [];
    for (const entry of entries as any[]) {
      if (entry?.pages?.get?.(entryIdRaw)) {
        return {
          entryId: entry.id as string,
          entryLinked: true,
          pageId: entryIdRaw,
          pageLinked: true,
        };
      }
    }
  }

  return {
    entryId: entryLink.id,
    entryLinked: entryLink.linked,
    pageId,
    pageLinked,
  };
}

// ---------------------------------------------------------------------------
// Helpers — minimal Collection stub
// ---------------------------------------------------------------------------

function makeCollection(items: Array<{ id: string } & Record<string, unknown>>) {
  const map = new Map(items.map((i) => [i.id, i]));
  return {
    get: (id: string) => map.get(id) ?? null,
    delete: (id: string) => map.delete(id),
    values: () => map.values(),
  };
}

// ---------------------------------------------------------------------------
// S1: Token.actorId → delete Actor → actorLinked becomes false
// ---------------------------------------------------------------------------

describe('S1: Token FK — actor deleted → actorLinked false', () => {
  it('returns actorLinked true when actor exists', () => {
    const actors = makeCollection([{ id: 'actor-abc', name: 'Sigmar' }]);
    const result = resolveTokenActorFK('actor-abc', actors);
    expect(result.actorId).toBe('actor-abc');
    expect(result.actorLinked).toBe(true);
  });

  it('returns actorLinked false after actor is deleted', () => {
    const actors = makeCollection([{ id: 'actor-abc', name: 'Sigmar' }]);

    // Simulate actor deletion
    actors.delete('actor-abc');

    const result = resolveTokenActorFK('actor-abc', actors);
    expect(result.actorId).toBe('actor-abc');   // raw ID is preserved
    expect(result.actorLinked).toBe(false);      // but link is broken
  });
});

// ---------------------------------------------------------------------------
// S2: Note.entryId → delete JournalEntry → entryLinked becomes false
// ---------------------------------------------------------------------------

describe('S2: Note FK — journal entry deleted → entryLinked false', () => {
  it('returns entryLinked true when journal entry exists', () => {
    const journals = makeCollection([
      { id: 'journal-xyz', name: 'Lore of Sigmar', pages: makeCollection([]) },
    ]);
    const result = resolveNoteLinks('journal-xyz', null, journals);
    expect(result.entryId).toBe('journal-xyz');
    expect(result.entryLinked).toBe(true);
    expect(result.pageLinked).toBe(false); // no page set
  });

  it('returns entryLinked false after journal entry is deleted', () => {
    const journals = makeCollection([
      { id: 'journal-xyz', name: 'Lore of Sigmar', pages: makeCollection([]) },
    ]);

    // Simulate JournalEntry deletion
    journals.delete('journal-xyz');

    const result = resolveNoteLinks('journal-xyz', null, journals);
    expect(result.entryId).toBe('journal-xyz'); // raw ID preserved (orphan)
    expect(result.entryLinked).toBe(false);
    expect(result.pageLinked).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// S3: Note.entryId + pageId → delete page only → entryLinked true, pageLinked false
// ---------------------------------------------------------------------------

describe('S3: Note FK — page deleted (entry still present) → entryLinked true, pageLinked false', () => {
  it('returns both true when entry and page exist', () => {
    const pages = makeCollection([{ id: 'page-001', name: 'Page One' }]);
    const journals = makeCollection([
      { id: 'journal-xyz', name: 'Lore', pages },
    ]);
    const result = resolveNoteLinks('journal-xyz', 'page-001', journals);
    expect(result.entryId).toBe('journal-xyz');
    expect(result.entryLinked).toBe(true);
    expect(result.pageId).toBe('page-001');
    expect(result.pageLinked).toBe(true);
  });

  it('returns entryLinked true but pageLinked false after page is deleted', () => {
    const pages = makeCollection([{ id: 'page-001', name: 'Page One' }]);
    const journals = makeCollection([
      { id: 'journal-xyz', name: 'Lore', pages },
    ]);

    // Simulate page deletion only — journal entry remains
    pages.delete('page-001');

    const result = resolveNoteLinks('journal-xyz', 'page-001', journals);
    expect(result.entryId).toBe('journal-xyz');
    expect(result.entryLinked).toBe(true);  // entry still exists
    expect(result.pageId).toBe('page-001');  // raw page ID preserved
    expect(result.pageLinked).toBe(false);   // but page is gone
  });
});
