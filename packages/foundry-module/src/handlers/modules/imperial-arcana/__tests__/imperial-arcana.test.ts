// wfrp_imperial_arcana Phase 7 — vitest: imperial-arcana handler.
//
// Deterministic — no live Foundry. game.journal / game.cards / game.folders are in-memory
// so we assert the MODULE_NOT_ACTIVE guard, draw-reading read-only shape, the record
// round-trip + DP-16 flag verify, search/recall filters, and the schemaVersion fail-loud.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { dispatchImperialArcana } from '../imperial-arcana.js';
import { MODULE_ID, DECK_ID, JOURNAL_CARDS_ID, CARD_PAGE_IDS, READINGS_FOLDER } from '../const.js';

let journalStore: Map<string, any>;
let folderStore: any[];
let recCounter: number;

function cardPageHtml(n: number): string {
  return (
    `<h3>Promise</h3><p>Promise text ${n}.</p>` +
    `<h3>Peril</h3><p>Peril text ${n}.</p>` +
    `<h3>Reader's Line</h3><blockquote>Line ${n}.</blockquote>` +
    `<h3>Dominant Omen</h3><p>Omen text ${n}.</p>`
  );
}

function makeReadingRecord(id: string, flags: any, folderId: string): any {
  return {
    id,
    uuid: `JournalEntry.${id}`,
    name: `Reading ${id}`,
    folder: { id: folderId },
    flags: { [MODULE_ID]: flags },
    getFlag(scope: string, key: string) { return this.flags?.[scope]?.[key]; },
    pages: { contents: [], get: () => undefined, find: () => undefined },
    async update(patch: any) {
      if (patch.flags) this.flags = { ...this.flags, ...patch.flags };
      if (patch.name) this.name = patch.name;
    },
  };
}

function mockGlobals(opts: { active?: boolean } = {}) {
  const active = opts.active ?? true;
  journalStore = new Map();
  folderStore = [{ id: 'folderReadings', name: READINGS_FOLDER, type: 'JournalEntry' }];
  recCounter = 0;

  // Card Index journal: 36 pages keyed by CARD_PAGE_IDS[n], each with the fixed heading structure.
  const cardPages = new Map<string, any>(
    CARD_PAGE_IDS.map((pid, n) => [pid, { id: pid, text: { content: cardPageHtml(n) } }]),
  );
  journalStore.set(JOURNAL_CARDS_ID, {
    id: JOURNAL_CARDS_ID,
    name: 'Card Index',
    folder: null,
    flags: {},
    getFlag() { return undefined; },
    pages: { get: (id: string) => cardPages.get(id), contents: [...cardPages.values()], find: () => undefined },
  });

  (globalThis as any).game = {
    user: { id: 'gm1', isGM: true },
    modules: { get: (id: string) => (id === MODULE_ID ? { active } : null) },
    cards: { get: (id: string) => (id === DECK_ID ? { id: DECK_ID, cards: { size: 36 } } : null) },
    journal: {
      get: (id: string) => journalStore.get(id),
      get contents() { return Array.from(journalStore.values()); },
    },
    folders: { find: (fn: any) => folderStore.find(fn) },
  };
  (globalThis as any).Folder = {
    create: async (data: any) => { const f = { id: `folder${folderStore.length}`, ...data }; folderStore.push(f); return f; },
  };
  (globalThis as any).JournalEntry = {
    create: async (data: any) => {
      const id = data._id ?? `rec${++recCounter}`;
      const pagesArr = (data.pages ?? []).map((p: any, i: number) => ({
        id: `p${i}`, name: p.name, type: p.type, text: { ...p.text },
        async update(patch: any) { if (patch['text.content'] !== undefined) this.text.content = patch['text.content']; },
      }));
      const e: any = {
        id, uuid: `JournalEntry.${id}`, name: data.name,
        folder: data.folder ? { id: data.folder } : null,
        flags: data.flags ?? {},
        ownership: data.ownership,
        getFlag(scope: string, key: string) { return this.flags?.[scope]?.[key]; },
        pages: { contents: pagesArr, get: (pid: string) => pagesArr.find((p: any) => p.id === pid), find: (fn: any) => pagesArr.find(fn) },
        async update(patch: any) { if (patch.flags) this.flags = { ...this.flags, ...patch.flags }; if (patch.name) this.name = patch.name; },
      };
      journalStore.set(id, e);
      return e;
    },
  };
  // notify.* routes through ui.notifications + ChatMessage; stub both.
  (globalThis as any).ui = { notifications: { info: () => undefined, success: () => undefined, warn: () => undefined, error: () => undefined } };
  (globalThis as any).ChatMessage = { create: async () => undefined };
  (globalThis as any).Hooks = { callAll: () => undefined };
}

beforeEach(() => mockGlobals());
afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).Folder;
  delete (globalThis as any).JournalEntry;
  delete (globalThis as any).ui;
  delete (globalThis as any).ChatMessage;
  delete (globalThis as any).Hooks;
});

describe('imperial-arcana — guard', () => {
  it('returns MODULE_NOT_ACTIVE when the module is inactive', async () => {
    mockGlobals({ active: false });
    const res = await dispatchImperialArcana({ action: 'draw-reading', spread: 'A' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
  });
});

describe('imperial-arcana — draw-reading (read-only)', () => {
  it('lays the spread positions with meanings and makes NO world write', async () => {
    const before = journalStore.size;
    const res = await dispatchImperialArcana({ action: 'draw-reading', spread: 'A', question: 'What comes?' });
    expect(res.success).toBe(true);
    expect(res.data.readOnly).toBe(true);
    expect(res.data.spread).toBe('A');
    expect(res.data.positions).toHaveLength(3);
    for (const p of res.data.positions) {
      expect(typeof p.numeral).toBe('number');
      expect(p.promise).toMatch(/Promise text/);
      expect(p.peril).toMatch(/Peril text/);
      expect(p.title.length).toBeGreaterThan(0);
    }
    // distinct numerals
    const set = new Set(res.data.positions.map((p: any) => p.numeral));
    expect(set.size).toBe(3);
    expect(journalStore.size).toBe(before); // read-only: no record created
  });

  it('fails loud when the deck is absent', async () => {
    (globalThis as any).game.cards.get = () => null;
    const res = await dispatchImperialArcana({ action: 'draw-reading', spread: 'A' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('IMPERIAL_ARCANA_DECK_MISSING');
  });

  // BUG-400 — inline / physical reading via supplied numerals (no Card-Index overflow read).
  it('interprets supplied numerals in position order and computes ninefold, making NO world write', async () => {
    const before = journalStore.size;
    const res = await dispatchImperialArcana({ action: 'draw-reading', spread: 'A', numerals: [31, 33, 35] });
    expect(res.success).toBe(true);
    expect(res.data.readOnly).toBe(true);
    expect(res.data.positions.map((p: any) => p.numeral)).toEqual([31, 33, 35]); // exact, in order
    expect(res.data.positions[0].position).toBe('The Road Behind');
    expect(res.data.positions[0].promise).toMatch(/Promise text 31/);
    expect(res.data.ninefold).toBe(true); // 31+33+35 = 99, divisible by 9
    expect(res.data.conjunctions).toEqual([]);
    expect(journalStore.size).toBe(before); // read-only
  });

  it('computes conjunctions for an inline reading', async () => {
    const res = await dispatchImperialArcana({ action: 'draw-reading', spread: 'A', numerals: [34, 35, 1] });
    expect(res.success).toBe(true);
    expect(res.data.conjunctions.some((c: any) => c.key === '34|35')).toBe(true); // The Mordheim Echo
  });

  it('rejects supplied numerals whose count does not match the spread', async () => {
    const res = await dispatchImperialArcana({ action: 'draw-reading', spread: 'A', numerals: [1, 2] });
    expect(res.success).toBe(false);
    expect(res.error).toContain('NUMERAL_COUNT_MISMATCH');
  });

  it('rejects supplied numerals with a repeat (a deck lays distinct cards)', async () => {
    const res = await dispatchImperialArcana({ action: 'draw-reading', spread: 'A', numerals: [5, 5, 6] });
    expect(res.success).toBe(false);
    expect(res.error).toContain('DUPLICATE_NUMERALS');
  });
});

describe('imperial-arcana — record-reading (write + verify)', () => {
  it('writes a CCR-10 record (schemaVersion 1) into the readings folder and verifies persistence', async () => {
    const res = await dispatchImperialArcana({
      action: 'record-reading', spread: 'A', numerals: [4, 32, 33], dominantOmen: 32,
      linkedUuids: ['Actor.hero1'], question: 'Smoke', session: 'test', date: '2026-06-21',
    });
    expect(res.success).toBe(true);
    expect(res.data.flags.schemaVersion).toBe(1);
    expect(res.data.flags.numerals).toEqual([4, 32, 33]);
    expect(res.data.flags.spread).toBe('A');
    expect(res.data.flags.positions).toHaveLength(3);
    expect(res.data.flags.dominantOmen).toBe(32);
    expect(res.data.flags.conjunctions).toContain('4|32'); // detected conjunction
    const stored = journalStore.get(res.data.journalId);
    expect(stored.flags[MODULE_ID].schemaVersion).toBe(1);
    expect(stored.folder.id).toBe('folderReadings');
  });

  it('computes ninefold for a divisible-by-9 numeral sum', async () => {
    const res = await dispatchImperialArcana({ action: 'record-reading', spread: 'A', numerals: [1, 8, 9] });
    expect(res.data.flags.ninefold).toBe(true); // 1+8+9 = 18
  });

  it('rejects a dominantOmen not among the drawn numerals', async () => {
    const res = await dispatchImperialArcana({ action: 'record-reading', spread: 'A', numerals: [1, 2, 3], dominantOmen: 9 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('DOMINANT_OMEN_NOT_DRAWN');
  });

  it('rejects a numeral count that does not match the spread', async () => {
    const res = await dispatchImperialArcana({ action: 'record-reading', spread: 'A', numerals: [1, 2] });
    expect(res.success).toBe(false);
    expect(res.error).toContain('NUMERAL_COUNT_MISMATCH');
  });
});

describe('imperial-arcana — search-omens + recall-callbacks', () => {
  beforeEach(async () => {
    // seed two records via the write path
    await dispatchImperialArcana({ action: 'record-reading', spread: 'A', numerals: [4, 32, 33], linkedUuids: ['Actor.hero1'], date: '2026-06-20' });
    await dispatchImperialArcana({ action: 'record-reading', spread: 'B', numerals: [1, 2, 3], linkedUuids: ['Actor.hero2'], date: '2026-06-21' });
  });

  it('search-omens filters by spread', async () => {
    const res = await dispatchImperialArcana({ action: 'search-omens', spread: 'A' });
    expect(res.success).toBe(true);
    expect(res.data.count).toBe(1);
    expect(res.data.records[0].spread).toBe('A');
  });

  it('search-omens filters by numeral subset', async () => {
    const res = await dispatchImperialArcana({ action: 'search-omens', numerals: [4, 33] });
    expect(res.data.count).toBe(1);
    expect(res.data.records[0].numerals).toContain(4);
  });

  it('recall-callbacks returns records for a linked entity UUID', async () => {
    const res = await dispatchImperialArcana({ action: 'recall-callbacks', linkedUuid: 'Actor.hero2' });
    expect(res.success).toBe(true);
    expect(res.data.count).toBe(1);
    expect(res.data.records[0].linkedUuids).toContain('Actor.hero2');
    expect(typeof res.data.records[0].summary).toBe('string');
  });

  it('fails loud on a schemaVersion drift record (CCR-10)', async () => {
    journalStore.set('drift1', makeReadingRecord('drift1', {
      schemaVersion: 2, numerals: [1, 2, 3], spread: 'A', positions: [], dominantOmen: null,
      ninefold: false, conjunctions: [], linkedUuids: [], session: '', date: '2026-06-21',
    }, 'folderReadings'));
    // readAllRecords throws on drift; dispatch does not catch (wrapQuery does, in the socket path).
    await expect(dispatchImperialArcana({ action: 'search-omens', spread: 'A' })).rejects.toThrow(
      /IMPERIAL_ARCANA_RECORD_NOT_PERSISTED/,
    );
  });
});
