// BUG-491 (Wave 2) — un-normalized compendium imports collapsed every TableResult
// range to [1,1], so roll/draw-many returned ALL results at once (success envelope,
// no warning). Mock result shapes cite the live capture in the BUG-491 ledger body
// (sweep-28 rolltable executor NL1: post-import read-back showed range [1,1] on every
// entry; 5 consecutive rolls each returned the whole table) — not invented (PF-003).
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  degenerateRangesError,
  rollOnTable,
  importRollTableFromCompendium,
} from '../handlers/rolltable.js';

function collection(contents: any[]): any {
  return {
    contents,
    size: contents.length,
    some: (fn: (r: any) => boolean) => contents.some(fn),
    filter: (fn: (r: any) => boolean) => contents.filter(fn),
    map: (fn: (r: any) => any) => contents.map(fn),
    [Symbol.iterator]() { return contents[Symbol.iterator](); },
  };
}

beforeEach(() => {
  (globalThis as any).game.user = { isGM: true };
});

describe('degenerateRangesError (BUG-491 fail-loud guard)', () => {
  it('flags a multi-row all-[1,1] table', () => {
    const table = {
      name: 'Imported Loot',
      results: collection([
        { id: 'a', range: [1, 1] },
        { id: 'b', range: [1, 1] },
        { id: 'c', range: [1, 1] },
      ]),
    };
    const err = degenerateRangesError(table);
    expect(err).toContain('ROLLTABLE_DEGENERATE_RANGES');
    expect(err).toContain('Imported Loot');
  });

  it('passes banded tables (normalize:false author bands, BUG-416 class) and single-row tables', () => {
    const banded = {
      name: 'Banded',
      results: collection([
        { id: 'a', range: [1, 4] },
        { id: 'b', range: [5, 8] },
      ]),
    };
    expect(degenerateRangesError(banded)).toBeNull();
    const single = { name: 'One', results: collection([{ id: 'a', range: [1, 1] }]) };
    expect(degenerateRangesError(single)).toBeNull();
    const sequential = {
      name: 'Seq',
      results: collection([
        { id: 'a', range: [1, 1] },
        { id: 'b', range: [2, 2] },
      ]),
    };
    expect(degenerateRangesError(sequential)).toBeNull();
  });
});

describe('rollOnTable degenerate guard', () => {
  it('fails loud instead of drawing on an all-[1,1] multi-row table', async () => {
    const draw = vi.fn();
    const table = {
      id: 'tDegen',
      name: 'Degen',
      formula: '1d100',
      replacement: true,
      draw,
      results: collection([
        { id: 'a', range: [1, 1] },
        { id: 'b', range: [1, 1] },
      ]),
    };
    (globalThis as any).game.tables = { get: (id: string) => (id === 'tDegen' ? table : undefined) };

    const result = await rollOnTable({ tableId: 'tDegen' });
    expect(result.success).toBe(false);
    expect(String((result as any).error)).toContain('ROLLTABLE_DEGENERATE_RANGES');
    expect(draw).not.toHaveBeenCalled();
  });

  it('draws exactly one result once ranges are sequential', async () => {
    const drawn = { id: 'b', type: 'text', range: [2, 2], text: 'row b', description: '', drawn: false };
    const table = {
      id: 'tSeq',
      name: 'Seq',
      formula: '1d2',
      replacement: true,
      draw: vi.fn(async () => ({ roll: { total: 2 }, results: [drawn] })),
      results: collection([
        { id: 'a', range: [1, 1] },
        drawn,
      ]),
    };
    (globalThis as any).game.tables = { get: (id: string) => (id === 'tSeq' ? table : undefined) };

    const result = await rollOnTable({ tableId: 'tSeq' });
    expect(result.success).toBe(true);
    expect((result as any).data.content).toBe('row b');
    expect(table.draw).toHaveBeenCalledOnce();
  });
});

describe('importRollTableFromCompendium sequential range assignment', () => {
  function mkWorld(collapsedCount: number, ranges?: Array<[number, number]>) {
    const contents = Array.from({ length: collapsedCount }, (_, i) => ({
      id: `r${i}`,
      // Live-captured collapse shape (BUG-491 body): every un-normalized
      // compendium-typed result lands with range [1,1].
      range: ranges ? ranges[i] : [1, 1],
      drawn: false,
    }));
    const worldTable: any = {
      id: 'newTable',
      name: 'Imported',
      formula: '1d100',
      results: collection(contents),
      updateEmbeddedDocuments: vi.fn(async (_type: string, updates: any[]) => {
        for (const u of updates) {
          const row = contents.find((r) => r.id === u._id);
          if (row) row.range = u.range;
        }
      }),
      update: vi.fn(async (changes: any) => {
        if (changes.formula) worldTable.formula = changes.formula;
      }),
    };
    return worldTable;
  }

  function wireGame(worldTable: any) {
    const sourceDoc = { id: 'srcDoc', name: 'Imported' };
    const pack = { getDocument: vi.fn(async () => sourceDoc) };
    (globalThis as any).game.packs = { get: (id: string) => (id === 'wfrp4e-core.tables' ? pack : undefined) };
    (globalThis as any).game.tables = {
      get: (id: string) => (id === 'newTable' ? worldTable : undefined),
      importFromCompendium: vi.fn(async () => ({ id: 'newTable', name: 'Imported' })),
    };
  }

  it('assigns [1,1]..[N,N] + rewrites formula when ALL ranges collapsed (no author bands)', async () => {
    const worldTable = mkWorld(3);
    wireGame(worldTable);

    const result = await importRollTableFromCompendium({
      pack: 'wfrp4e-core.tables',
      documentId: 'srcDocAAAAAAAAAA',
      normalize: false,
    });

    expect(result.success).toBe(true);
    const data = (result as any).data;
    expect(data.rangesAssigned).toBe(true);
    expect(data.formulaRewritten).toEqual({ from: '1d100', to: '1d3' });
    expect(worldTable.results.contents.map((r: any) => r.range)).toEqual([[1, 1], [2, 2], [3, 3]]);
    // No degenerate table remains post-import.
    expect(degenerateRangesError(worldTable)).toBeNull();
  });

  it('leaves author bands untouched under normalize:false (BUG-416 preservation)', async () => {
    const worldTable = mkWorld(3, [[1, 4], [5, 8], [9, 100]]);
    wireGame(worldTable);

    const result = await importRollTableFromCompendium({
      pack: 'wfrp4e-core.tables',
      documentId: 'srcDocAAAAAAAAAA',
      normalize: false,
    });

    expect(result.success).toBe(true);
    const data = (result as any).data;
    expect(data.rangesAssigned).toBeUndefined();
    expect(data.formulaRewritten).toBeUndefined();
    expect(worldTable.updateEmbeddedDocuments).not.toHaveBeenCalled();
    expect(worldTable.results.contents.map((r: any) => r.range)).toEqual([[1, 4], [5, 8], [9, 100]]);
  });
});
