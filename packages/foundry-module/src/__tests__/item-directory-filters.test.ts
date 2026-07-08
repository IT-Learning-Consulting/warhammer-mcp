// BUG-495 (Wave 2) — item-directory search `filters` crashed ("filters is not
// iterable"): the handler forwarded the documented {type?, folder?} OBJECT into
// Foundry's DocumentCollection#search, which iterates `filters` as a FieldFilter
// ARRAY. The fix applies the documented object shape on the results instead.
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

import { dispatchItemDirectory } from '../handlers/item-directory.js';

function mkItem(id: string, name: string, type: string, folder: string | null) {
  return {
    id,
    name,
    type,
    img: '',
    folder: folder ? { id: folder } : null,
    _source: { folder },
    system: {},
  };
}

const ITEMS = [
  mkItem('itemAAAAAAAAAAA1', 'Sword', 'weapon', 'folderBBBBBBBBB1'),
  mkItem('itemAAAAAAAAAAA2', 'Shield', 'weapon', null),
  mkItem('itemAAAAAAAAAAA3', 'Healing Draught', 'trapping', 'folderBBBBBBBBB1'),
];

beforeEach(() => {
  (globalThis as any).game = {
    user: { isGM: true },
    items: {
      contents: ITEMS,
      get: (id: string) => ITEMS.find((i) => i.id === id),
      search: vi.fn((opts: any) => {
        // Faithful to the live failure mode: iterating a non-array filters crashes.
        if (opts.filters !== undefined && !Array.isArray(opts.filters)) {
          throw new TypeError('filters is not iterable');
        }
        return ITEMS;
      }),
    },
  };
});

describe('BUG-495: item-directory search filters (documented object shape)', () => {
  it('filters:{type} narrows without crashing', async () => {
    const r: any = await dispatchItemDirectory({ action: 'search', filters: { type: 'weapon' } });
    expect(r.success).toBe(true);
    expect(r.data.items.map((i: any) => i.name).sort()).toEqual(['Shield', 'Sword']);
    // BUG-528 bounded the search response: total → totalAvailable (+truncated/offset/limit).
    expect(r.data.totalAvailable).toBe(2);
  });

  it('filters:{type, folder} compose', async () => {
    const r: any = await dispatchItemDirectory({
      action: 'search',
      filters: { type: 'weapon', folder: 'folderBBBBBBBBB1' },
    });
    expect(r.success).toBe(true);
    expect(r.data.items.map((i: any) => i.name)).toEqual(['Sword']);
  });

  it('unfiltered search still returns everything', async () => {
    const r: any = await dispatchItemDirectory({ action: 'search' });
    expect(r.success).toBe(true);
    // BUG-528 bounded the search response: total → totalAvailable (+truncated/offset/limit).
    expect(r.data.totalAvailable).toBe(3);
  });
});
