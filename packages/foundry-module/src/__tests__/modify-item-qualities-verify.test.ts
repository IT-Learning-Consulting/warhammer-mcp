import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryHandlers } from '../queries.js';

function makeWorldItem(updatePersists: boolean) {
  const item: any = {
    id: 'item-quality-1',
    name: 'Fine Sword',
    system: {
      qualities: { value: [{ name: 'fine', value: 1 }] },
      flaws: { value: [] },
    },
    _source: {
      system: {
        qualities: { value: [{ name: 'fine', value: 1 }] },
        flaws: { value: [] },
      },
    },
  };
  item.update = vi.fn(async (payload: Record<string, any>) => {
    if (!updatePersists) return undefined;
    item.system.qualities.value = payload['system.qualities.value'];
    item.system.flaws.value = payload['system.flaws.value'];
    item._source.system.qualities.value = payload['system.qualities.value'];
    item._source.system.flaws.value = payload['system.flaws.value'];
    return item;
  });
  return item;
}

function serviceFor(item: any): any {
  (globalThis as any).game = {
    ...(globalThis as any).game,
    items: {
      get: (id: string) => id === item.id ? item : null,
      find: () => null,
    },
  };
  const handlers = new QueryHandlers();
  return handlers.itemService;
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('modifyItemQualities DP-16 value verification (BUG-661)', () => {
  it('rejects a cancelled fine:1 to fine:2 update even though the name still exists', async () => {
    const item = makeWorldItem(false);
    await expect(serviceFor(item).modifyItemQualities({
      destination: { type: 'world' },
      itemId: item.id,
      addQualities: [{ name: 'fine', value: 2 }],
      removeQualities: [],
      addFlaws: [],
      removeFlaws: [],
    })).rejects.toThrow(/MODIFY_ITEM_QUALITIES_NOT_PERSISTED/);
  });

  it('accepts the same value update when the complete canonical multiset persists', async () => {
    const item = makeWorldItem(true);
    await expect(serviceFor(item).modifyItemQualities({
      destination: { type: 'world' },
      itemId: item.id,
      addQualities: [{ name: 'fine', value: 2 }],
      removeQualities: [],
      addFlaws: [],
      removeFlaws: [],
    })).resolves.toMatchObject({ itemName: 'Fine Sword' });
  });
});
