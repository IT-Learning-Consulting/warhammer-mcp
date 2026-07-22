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

describe('BUG-662: item-directory list composes folder and type filters', () => {
  it('applies typeFilter by itself', async () => {
    const r: any = await dispatchItemDirectory({ action: 'list', typeFilter: 'weapon' });
    expect(r.data.items.map((i: any) => i.name).sort()).toEqual(['Shield', 'Sword']);
  });

  it('applies folderId by itself', async () => {
    const r: any = await dispatchItemDirectory({ action: 'list', folderId: 'folderBBBBBBBBB1' });
    expect(r.data.items.map((i: any) => i.name).sort()).toEqual(['Healing Draught', 'Sword']);
  });

  it('applies typeFilter and folderId together', async () => {
    const r: any = await dispatchItemDirectory({
      action: 'list', typeFilter: 'weapon', folderId: 'folderBBBBBBBBB1',
    });
    expect(r.data.items.map((i: any) => i.name)).toEqual(['Sword']);
    expect(r.data.typeFilter).toBe('weapon');
    expect(r.data.folderId).toBe('folderBBBBBBBBB1');
  });
});

// BUG-663: `get` previously reused the same narrow serializer as `list`/`search`
// (id/name/type/img/folderId/system/flags only) despite the tool's own description promising
// "the full serialized item" — effects/ownership/sort were silently absent. Fixed to spread
// item.toObject() (Foundry's own full serialization).
describe('BUG-663: item-directory get returns the genuinely full document', () => {
  it('includes effects/ownership/sort — fields the old narrow serializer dropped', async () => {
    const fullDoc = {
      _id: 'itemFULLDOC0001',
      name: 'Runic Blade',
      type: 'weapon',
      img: 'icons/weapons/runic.png',
      folder: 'folderBBBBBBBBB1',
      system: { damage: { value: 'SB+5' } },
      flags: {},
      effects: [{ _id: 'effAAAAAAAAAAA1', name: 'Runic Glow' }],
      ownership: { default: 0, userXYZ: 3 },
      sort: 200000,
    };
    (globalThis as any).game.items.get = (id: string) =>
      id === 'itemFULLDOC0001'
        ? { id: 'itemFULLDOC0001', _source: { folder: 'folderBBBBBBBBB1' }, toObject: () => fullDoc }
        : undefined;

    const r: any = await dispatchItemDirectory({ action: 'get', itemId: 'itemFULLDOC0001' });
    expect(r.success).toBe(true);
    expect(r.data.effects).toEqual(fullDoc.effects);
    expect(r.data.ownership).toEqual(fullDoc.ownership);
    expect(r.data.sort).toBe(200000);
    // Convenience aliases still present for existing callers.
    expect(r.data.id).toBe('itemFULLDOC0001');
    expect(r.data.folderId).toBe('folderBBBBBBBBB1');
  });
});
