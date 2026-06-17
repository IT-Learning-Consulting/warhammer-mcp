// Characterization snapshot tests — item CREATE write-args, for the 2 thin-coverage methods
// extracted in Phase 7.5 (services/item.ts):
//   FoundryDataAccess.createItem            — write args of createEmbeddedDocuments / Item.create + dest routing
//   QueryHandlers.handleAddItemFromCompendium — the inline queries.ts:511 handler ABSORBED into ItemService
//
// createItem result-shapes + folder-chain are already asserted in da-write-results.snap.test.ts and
// create-item-destination.test.ts; this net locks the *write payloads* so the verbatim move (HC1/HC3)
// stays byte-identical. addItemFromCompendium has no other foundry-module-level net before Phase 7.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FoundryDataAccess } from '../../data-access.js';
import { QueryHandlers } from '../../queries.js';

vi.mock('../../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn(), warn: vi.fn() },
}));

function installItemFoundry() {
  (globalThis as any).foundry = {
    ...(globalThis as any).foundry,
    utils: {
      ...(globalThis as any).foundry?.utils,
      mergeObject: (a: any, b: any) => ({ ...a, ...b, system: { ...a?.system, ...b?.system } }),
    },
  };
}

// ══════════════════════════════════════════════════
// createItem — write-arg capture (data-access direct)
// ══════════════════════════════════════════════════
describe('FoundryDataAccess.createItem — write-arg characterization', () => {
  function makeActorStub(id: string, name: string) {
    return {
      id,
      name,
      createEmbeddedDocuments: vi.fn(async (_type: string, payloads: any[]) =>
        payloads.map((p, i) => ({
          id: `created-${i}`,
          name: p.name,
          type: p.type,
          uuid: `Actor.${id}.Item.created-${i}`,
          toObject: () => ({ ...p, _id: `created-${i}` }),
          effects: { map: () => [] },
        })),
      ),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    installItemFoundry();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('snapshot: actor-scope createEmbeddedDocuments args', async () => {
    const actor = makeActorStub('a1', 'Hans');
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: (id: string) => (id === actor.id ? actor : null), find: () => null },
    };
    const da = new FoundryDataAccess();
    (da as any).validateFoundryState = () => {};
    await da.createItem({
      itemData: { name: 'Hand Weapon', type: 'weapon', system: { damage: { value: 'SB+4' } } },
      destination: { type: 'actor', actorId: 'a1' },
    });
    // createEmbeddedDocuments('Item', [effectiveItemData]) — the verbatim write payload.
    expect((actor.createEmbeddedDocuments as any).mock.calls).toMatchSnapshot('actor-create-args');
  });

  it('snapshot: world-scope Item.create args with a folder chain', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: () => null, find: () => null },
      folders: { find: () => null },
    };
    const createdFolders: any[] = [];
    (globalThis as any).Folder = class {
      static create = vi.fn(async (data: any) => {
        const f = { id: `folder-${createdFolders.length + 1}`, name: data.name, type: data.type, folder: data.folder ?? null };
        createdFolders.push(f);
        return f;
      });
    };
    const ItemCreate = vi.fn(async (data: any) => ({
      id: 'world-item-1',
      name: data.name,
      type: data.type,
      uuid: 'Item.world-item-1',
      toObject: () => ({ ...data, _id: 'world-item-1' }),
      effects: { map: () => [] },
    }));
    (globalThis as any).Item = class { static create = ItemCreate; };

    const da = new FoundryDataAccess();
    (da as any).validateFoundryState = () => {};
    await da.createItem({
      itemData: { name: 'Torch', type: 'trapping', system: {} },
      destination: { type: 'world', folder: ['Homebrew', 'Gear'] },
    });
    // Item.create(createPayload) — createPayload spreads itemData + a resolved folder id.
    expect(ItemCreate.mock.calls).toMatchSnapshot('world-create-args');
  });

  it('snapshot: fromCompendium clone seed — _id stripped, user overrides merged', async () => {
    const actor = makeActorStub('a1', 'Hans');
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { get: (id: string) => (id === actor.id ? actor : null), find: () => null },
    };
    (globalThis as any).fromUuid = vi.fn(async () => ({
      toObject: () => ({
        name: 'Source Sword', type: 'weapon', _id: 'source-id',
        effects: [{ _id: 'eff-1', name: 'Keen' }],
        system: { damage: { value: 'SB+4' } },
      }),
    }));
    const da = new FoundryDataAccess();
    (da as any).validateFoundryState = () => {};
    await da.createItem({
      itemData: { name: 'Fire Sword', system: { damage: { value: 'SB+6' } } },
      destination: { type: 'actor', actorId: 'a1' },
      fromCompendium: 'Compendium.wfrp4e-core.items.Item.source-id',
    });
    expect((actor.createEmbeddedDocuments as any).mock.calls).toMatchSnapshot('clone-create-args');
  });
});

// ══════════════════════════════════════════════════
// addItemFromCompendium — write-arg capture (handler, pre-absorption monolith)
// ══════════════════════════════════════════════════
describe('QueryHandlers.handleAddItemFromCompendium — write-arg characterization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    installItemFoundry();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    (globalThis as any).ui = { notifications: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } };
  });

  it('snapshot: createEmbeddedDocuments args + result payload (skipSpecialisationChoice)', async () => {
    const actor = {
      id: 'a1',
      name: 'Hans',
      createEmbeddedDocuments: vi.fn(async (_type: string, payloads: any[]) =>
        payloads.map((p, i) => ({ id: `added-${i}`, name: p.name, type: p.type, uuid: `Actor.a1.Item.added-${i}` })),
      ),
    };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      user: { isGM: true, id: 'gm', name: 'GM' },
      actors: { get: (id: string) => (id === actor.id ? actor : null) },
    };
    (globalThis as any).fromUuid = vi.fn(async () => ({
      toObject: () => ({ name: 'Sigmar Holy Symbol', type: 'trapping', _id: 'compendium-src', system: {} }),
    }));

    const qh = new QueryHandlers();
    (qh.dataAccess as any).validateFoundryState = () => {};
    const result = await (qh as any).handleAddItemFromCompendium({
      actorId: 'a1',
      compendiumId: 'Compendium.wfrp4e-core.items.Item.aaaaaaaaaaaaaaaa',
      skipSpecialisationChoice: true,
    });

    // createEmbeddedDocuments('Item', [itemData], { skipSpecialisationChoice: true }).
    expect((actor.createEmbeddedDocuments as any).mock.calls).toMatchSnapshot('addfromcompendium-create-args');
    expect(result).toMatchSnapshot('addfromcompendium-result');
  });
});
