// Phase 1 mcp_coverage_expansion — ItemDirectory tool schema tests (CCR-13).
//
// Tests: action enum (5 values), missing required fields → throw, unknown key → throw (strict),
// invalid discriminant → safeParse false, import-from-compendium required fields.

import { describe, it, expect, vi } from 'vitest';
import { ItemDirectoryToolInput } from '@foundry-mcp/shared';
import { ItemDirectoryTool } from '../tools/item-directory.js';

function makeLogger(): any {
  const noop = () => undefined;
  return { info: noop, warn: noop, error: noop, debug: noop, child: () => makeLogger() };
}

function makeTool(mockReturn: any = null, mockThrow: string | null = null) {
  const foundryClient: any = {
    query: vi.fn(async (_key: string, _args: any) => {
      if (mockThrow) throw new Error(mockThrow);
      return mockReturn ?? { items: [], total: 0, page: 1, pageSize: 100, typeFilter: null, folderId: null };
    }),
  };
  return new ItemDirectoryTool({ foundryClient, logger: makeLogger() });
}

// ── Schema tests ──────────────────────────────────────────────────────────────

describe('ItemDirectoryToolInput schema', () => {
  it('action enum contains exactly 5 values', () => {
    const actions = ItemDirectoryToolInput.options.map((o) => o.shape.action.value);
    expect(actions.sort()).toEqual(
      ['duplicate', 'get', 'import-from-compendium', 'list', 'search'],
    );
  });

  it('list action parses with no optional fields', () => {
    expect(() => ItemDirectoryToolInput.parse({ action: 'list' })).not.toThrow();
  });

  it('list action parses with typeFilter', () => {
    expect(() => ItemDirectoryToolInput.parse({ action: 'list', typeFilter: 'weapon' })).not.toThrow();
  });

  it('get action requires itemId', () => {
    expect(() => ItemDirectoryToolInput.parse({ action: 'get' })).toThrow();
  });

  it('get action accepts itemId', () => {
    expect(() => ItemDirectoryToolInput.parse({ action: 'get', itemId: 'abc123' })).not.toThrow();
  });

  it('search action parses with no optional fields', () => {
    expect(() => ItemDirectoryToolInput.parse({ action: 'search' })).not.toThrow();
  });

  it('search action parses with query + filters', () => {
    expect(() =>
      ItemDirectoryToolInput.parse({ action: 'search', query: 'Sword', filters: { type: 'weapon' } }),
    ).not.toThrow();
  });

  it('duplicate action requires itemId', () => {
    expect(() => ItemDirectoryToolInput.parse({ action: 'duplicate' })).toThrow();
  });

  it('duplicate action accepts itemId + optional newName', () => {
    expect(() =>
      ItemDirectoryToolInput.parse({ action: 'duplicate', itemId: 'abc', newName: 'My Copy' }),
    ).not.toThrow();
  });

  it('import-from-compendium requires packId + itemId', () => {
    expect(() => ItemDirectoryToolInput.parse({ action: 'import-from-compendium' })).toThrow();
    expect(() =>
      ItemDirectoryToolInput.parse({ action: 'import-from-compendium', packId: 'wfrp4e-core.items' }),
    ).toThrow();
    expect(() =>
      ItemDirectoryToolInput.parse({ action: 'import-from-compendium', itemId: 'abc' }),
    ).toThrow();
  });

  it('import-from-compendium accepts packId + itemId', () => {
    expect(() =>
      ItemDirectoryToolInput.parse({
        action: 'import-from-compendium',
        packId: 'wfrp4e-core.items',
        itemId: 'gxdjLQoQUTYgD6fm',
      }),
    ).not.toThrow();
  });

  it('invalid action discriminant → safeParse false', () => {
    const result = ItemDirectoryToolInput.safeParse({ action: 'nonexistent-action' });
    expect(result.success).toBe(false);
  });

  it('unknown key → throw (strict mode)', () => {
    expect(() =>
      ItemDirectoryToolInput.parse({ action: 'list', unknownKey: 'should-fail' }),
    ).toThrow();
  });

  it('missing action → throw', () => {
    expect(() => ItemDirectoryToolInput.parse({})).toThrow();
    expect(() => ItemDirectoryToolInput.parse({ itemId: 'abc' })).toThrow();
  });
});

// ── Tool behavior tests ───────────────────────────────────────────────────────

describe('ItemDirectoryTool.execute', () => {
  it('list action routes to query and formats response', async () => {
    const mockData = { items: [{ id: 'i1', name: 'Sword', type: 'weapon', img: null, folderId: null, system: {}, flags: {} }], total: 1, page: 1, pageSize: 100, typeFilter: null, folderId: null };
    const tool = makeTool(mockData);
    const result = await tool.execute({ action: 'list' });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('Sword');
  });

  it('list action returns empty message when no items', async () => {
    const tool = makeTool({ items: [], total: 0, page: 1, pageSize: 100, typeFilter: null, folderId: null });
    const result = await tool.execute({ action: 'list' });
    expect(result.content[0].text).toContain('No world items found');
  });

  it('get action returns isError on tool throw', async () => {
    const tool = makeTool(null, 'ITEM_NOT_FOUND: no world item with id "bad"');
    const result = await tool.execute({ action: 'get', itemId: 'bad' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('ITEM_NOT_FOUND');
  });

  it('duplicate action formats id + sourceId', async () => {
    const tool = makeTool({ id: 'newId', name: 'Copy', type: 'weapon', sourceId: 'origId', img: null, folderId: null });
    const result = await tool.execute({ action: 'duplicate', itemId: 'origId' });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('newId');
    expect(result.content[0].text).toContain('origId');
  });

  it('import-from-compendium formats world id', async () => {
    const tool = makeTool({ id: 'worldId', name: 'Healing Draught', type: 'trapping', packId: 'wfrp4e-core.items', compendiumItemId: 'comp1', img: null, folderId: null });
    const result = await tool.execute({ action: 'import-from-compendium', packId: 'wfrp4e-core.items', itemId: 'comp1' });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('worldId');
  });
});
