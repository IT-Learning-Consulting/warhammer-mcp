// Phase 5 (A.9) — FoundryDataAccess.createItem destination routing + folder chain tests.
// Mocks game.actors / game.folders / Item.create / Folder.create and exercises the
// actor-scope + world-scope branches plus the _ensureFolderChain helper (idempotency,
// partial existence, full existence, empty path).

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryHandlers } from '../queries.js';

type FolderStub = {
  id: string;
  name: string;
  type: string;
  folder: { id: string } | string | null;
};

// Local helpers to build stubs fresh per test
function makeActorStub(id: string, name: string, createdIdSeed = 'new-item') {
  // RC1.1a: createEmbeddedDocuments now needs a stateful backing store so the post-write
  // verify's actor.items.get(id) / verifyDocWrite re-read finds the just-created item.
  const backingItems = new Map<string, any>();
  return {
    id,
    name,
    items: {
      get: (itemId: string) => backingItems.get(itemId) ?? null,
      find: () => null,
    },
    createEmbeddedDocuments: vi.fn(async (_type: string, payloads: any[]) => {
      return payloads.map((p, i) => {
        const created = {
          id: `${createdIdSeed}-${i}`,
          name: p.name,
          type: p.type,
          toObject: () => ({ ...p, _id: `${createdIdSeed}-${i}` }),
          effects: [],
          _source: { ...p },
        };
        backingItems.set(created.id, created);
        return created;
      });
    }),
    deleteEmbeddedDocuments: vi.fn(async () => {}),
  };
}

function setupFoundryStubs(opts?: {
  actors?: any[];
  folders?: FolderStub[];
  createItemId?: string;
}) {
  const actors = opts?.actors ?? [];
  const folders = opts?.folders ?? [];
  const createItemId = opts?.createItemId ?? 'world-item-1';

  // RC1.1a: game.items is now read back by createItem's world-scope post-write verify —
  // back it with the same array Item.create pushes into (Map.get(id) not .find(pred)).
  const worldItems = new Map<string, any>();

  (globalThis as any).game = {
    ...(globalThis as any).game,
    actors: {
      get: (id: string) => actors.find((a) => a.id === id) ?? null,
      find: (pred: (a: any) => boolean) => actors.find(pred) ?? null,
    },
    folders: {
      get: (id: string) => folders.find((f) => f.id === id) ?? null,
      find: (pred: (f: FolderStub) => boolean) => folders.find(pred) ?? null,
    },
    items: worldItems,
  };

  const createdFolders: FolderStub[] = [];
  (globalThis as any).Folder = class {
    static create = vi.fn(async (data: any) => {
      const id = `folder-${createdFolders.length + 1}`;
      const folderRef =
        typeof data.folder === 'string' ? { id: data.folder } : data.folder ?? null;
      const f: FolderStub = { id, name: data.name, type: data.type, folder: folderRef };
      createdFolders.push(f);
      folders.push(f);
      return f;
    });
  };

  (globalThis as any).Item = class {
    static create = vi.fn(async (data: any) => {
      const created = {
        id: createItemId,
        name: data.name,
        type: data.type,
        folder: data.folder ?? null,
        toObject: () => ({ ...data, _id: createItemId }),
        effects: [],
        _source: { ...data },
      };
      worldItems.set(createItemId, created);
      return created;
    });
  };

  (globalThis as any).fromUuid = vi.fn(async (uuid: string) => ({
    toObject: () => ({
      name: 'Cloned Source',
      type: 'weapon',
      _id: 'source-id',
      effects: [{ _id: 'eff-1', name: 'E' }],
      system: { damage: { value: 'SB+4' } },
    }),
  }));

  (globalThis as any).foundry = {
    ...(globalThis as any).foundry,
    utils: {
      ...(globalThis as any).foundry?.utils,
      mergeObject: (a: any, b: any) => ({ ...a, ...b, system: { ...a?.system, ...b?.system } }),
    },
  };

  return { createdFolders, folders };
}

function makeDA(): any {
  // Phase 8 (R7.3): the actor/item/effect mutation methods were promoted off FoundryDataAccess to the
  // QueryHandlers services; re-expose the ones this test pierces on the DA handle so the captured
  // write-paths are unchanged (the re-bind delegates to the same promoted service the handlers call).
  const qh = new QueryHandlers();
  const da: any = qh.dataAccess;
  da.validateFoundryState = () => {};
  da.createItem = (d: any) => qh.itemService.createItem(d);
  return da;
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// ────────────── Actor-scope ──────────────

describe('createItem — actor destination', () => {
  it('resolves by actorName + creates embedded item', async () => {
    const actor = makeActorStub('a1', 'Hans');
    setupFoundryStubs({ actors: [actor] });
    const da = makeDA();
    const res = await da.createItem({
      itemData: { type: 'weapon', name: 'Sword', system: {} },
      destination: { type: 'actor', actorName: 'Hans' },
    });
    expect(res.success).toBe(true);
    expect(res.scope).toBe('actor');
    expect(res.actorId).toBe('a1');
    expect(actor.createEmbeddedDocuments).toHaveBeenCalledOnce();
  });

  it('resolves by actorId directly', async () => {
    const actor = makeActorStub('a2', 'Maria');
    setupFoundryStubs({ actors: [actor] });
    const da = makeDA();
    const res = await da.createItem({
      itemData: { type: 'talent', name: 'T', system: {} },
      destination: { type: 'actor', actorId: 'a2' },
    });
    expect(res.actorName).toBe('Maria');
  });

  it('throws when actor not found', async () => {
    setupFoundryStubs({ actors: [] });
    const da = makeDA();
    await expect(
      da.createItem({
        itemData: { type: 'weapon', name: 'Sword', system: {} },
        destination: { type: 'actor', actorName: 'Ghost' },
      })
    ).rejects.toThrow(/Actor not found/);
  });
});

// ────────────── World-scope (folder chain) ──────────────

describe('createItem — world destination (folder chain)', () => {
  it('creates at root when no folder specified', async () => {
    setupFoundryStubs();
    const da = makeDA();
    const res = await da.createItem({
      itemData: { type: 'weapon', name: 'Sword', system: {} },
      destination: { type: 'world' },
    });
    expect(res.scope).toBe('world');
    expect(res.folderId).toBeNull();
    expect(res.folderPath).toEqual([]);
    expect((globalThis as any).Item.create).toHaveBeenCalledOnce();
  });

  it('creates a single-segment folder when missing', async () => {
    const { createdFolders } = setupFoundryStubs();
    const da = makeDA();
    const res = await da.createItem({
      itemData: { type: 'weapon', name: 'Sword', system: {} },
      destination: { type: 'world', folder: ['Custom'] },
    });
    expect(createdFolders).toHaveLength(1);
    expect(createdFolders[0].name).toBe('Custom');
    expect(res.folderId).toBe(createdFolders[0].id);
  });

  it('reuses existing single-segment folder (creates 0 folders)', async () => {
    const existing: FolderStub = {
      id: 'folder-pre',
      name: 'Custom',
      type: 'Item',
      folder: null,
    };
    const { createdFolders } = setupFoundryStubs({ folders: [existing] });
    const da = makeDA();
    const res = await da.createItem({
      itemData: { type: 'weapon', name: 'Sword', system: {} },
      destination: { type: 'world', folder: ['Custom'] },
    });
    expect(createdFolders).toHaveLength(0);
    expect(res.folderId).toBe('folder-pre');
  });

  it('creates all 3 folders when none exist', async () => {
    const { createdFolders } = setupFoundryStubs();
    const da = makeDA();
    const res = await da.createItem({
      itemData: { type: 'weapon', name: 'Deep', system: {} },
      destination: { type: 'world', folder: ['Homebrew', 'Items', 'Keys'] },
    });
    expect(createdFolders).toHaveLength(3);
    expect(createdFolders.map((f) => f.name)).toEqual(['Homebrew', 'Items', 'Keys']);
    expect(res.folderId).toBe(createdFolders[2].id);
  });

  it('creates only missing leaf when 2 of 3 segments exist', async () => {
    const a: FolderStub = { id: 'A', name: 'Homebrew', type: 'Item', folder: null };
    const b: FolderStub = { id: 'B', name: 'Items', type: 'Item', folder: { id: 'A' } };
    const { createdFolders } = setupFoundryStubs({ folders: [a, b] });
    const da = makeDA();
    const res = await da.createItem({
      itemData: { type: 'weapon', name: 'Leaf', system: {} },
      destination: { type: 'world', folder: ['Homebrew', 'Items', 'Keys'] },
    });
    expect(createdFolders).toHaveLength(1);
    expect(createdFolders[0].name).toBe('Keys');
    expect(res.folderId).toBe(createdFolders[0].id);
  });

  it('reuses existing full chain (creates 0 folders)', async () => {
    const a: FolderStub = { id: 'A', name: 'Homebrew', type: 'Item', folder: null };
    const b: FolderStub = { id: 'B', name: 'Items', type: 'Item', folder: { id: 'A' } };
    const c: FolderStub = { id: 'C', name: 'Keys', type: 'Item', folder: { id: 'B' } };
    const { createdFolders } = setupFoundryStubs({ folders: [a, b, c] });
    const da = makeDA();
    const res = await da.createItem({
      itemData: { type: 'weapon', name: 'FullExists', system: {} },
      destination: { type: 'world', folder: ['Homebrew', 'Items', 'Keys'] },
    });
    expect(createdFolders).toHaveLength(0);
    expect(res.folderId).toBe('C');
  });

  it('is idempotent — back-to-back world creates reuse folder chain', async () => {
    const { createdFolders, folders } = setupFoundryStubs();
    const da = makeDA();
    await da.createItem({
      itemData: { type: 'spell', name: 'Fire1', system: {} },
      destination: { type: 'world', folder: ['Custom', 'Spells'] },
    });
    const afterFirstCount = createdFolders.length;
    expect(afterFirstCount).toBe(2);

    await da.createItem({
      itemData: { type: 'spell', name: 'Fire2', system: {} },
      destination: { type: 'world', folder: ['Custom', 'Spells'] },
    });
    // Folder chain reused — no new folders created on the second call
    expect(createdFolders.length).toBe(afterFirstCount);
    expect(folders.length).toBe(2);
  });
});

// ────────────── returnFullPayload ──────────────

describe('createItem — returnFullPayload opt-in', () => {
  it('returns minimal shape by default', async () => {
    setupFoundryStubs();
    const da = makeDA();
    const res = await da.createItem({
      itemData: { type: 'weapon', name: 'Sword', system: {} },
      destination: { type: 'world' },
    });
    expect(res.itemData).toBeUndefined();
    expect(res.effectIds).toBeUndefined();
  });

  it('echoes itemData + effectIds when returnFullPayload=true (world)', async () => {
    setupFoundryStubs();
    const da = makeDA();
    const res = await da.createItem({
      itemData: { type: 'weapon', name: 'Sword', system: {} },
      destination: { type: 'world', folder: ['Custom'] },
      returnFullPayload: true,
    });
    expect(res.itemData).toBeDefined();
    expect(res.effectIds).toEqual([]);
    expect(res.folderId).toBeDefined();
  });
});

// ────────────── fromCompendium clone ──────────────

describe('createItem — fromCompendium seeding', () => {
  it('clones source, strips _id + effect _ids, merges user overrides', async () => {
    const actor = makeActorStub('a1', 'Hans');
    setupFoundryStubs({ actors: [actor] });
    const da = makeDA();
    await da.createItem({
      itemData: { name: 'Fire Sword', system: { damage: { value: 'SB+6' } } },
      destination: { type: 'actor', actorName: 'Hans' },
      fromCompendium: 'Compendium.wfrp4e-core.items.Item.source-id',
    });
    const [, payloads] = (actor.createEmbeddedDocuments as any).mock.calls[0];
    const payload = payloads[0];
    // Source _id was stripped via delete before merge
    expect(payload._id).toBeUndefined();
    // User override merged on top of source system
    expect(payload.system.damage.value).toBe('SB+6');
    // Name override applied
    expect(payload.name).toBe('Fire Sword');
  });

  // BUG-643: the documented contract (compendium-clone-patterns.md) is that a caller-supplied
  // effects[] APPENDS to the cloned effect chain — previously it wholesale-replaced it, since
  // mergeObject treats arrays as atomic values rather than merging them element-by-element.
  it('appends caller-supplied effects to the cloned effect chain, not replaces it (BUG-643)', async () => {
    const actor = makeActorStub('a1', 'Hans');
    setupFoundryStubs({ actors: [actor] });
    const da = makeDA();
    await da.createItem({
      itemData: {
        name: 'Creeping Atrophy',
        system: {},
        effects: [{ name: 'end-turn tick', trigger: 'endTurn' }],
      },
      destination: { type: 'actor', actorName: 'Hans' },
      fromCompendium: 'Compendium.wfrp4e-core.items.Item.source-id',
    });
    const [, payloads] = (actor.createEmbeddedDocuments as any).mock.calls[0];
    const payload = payloads[0];
    expect(payload.effects).toHaveLength(2);
    expect(payload.effects.some((e: any) => e.name === 'E')).toBe(true); // source's own effect survived
    expect(payload.effects.some((e: any) => e.name === 'end-turn tick')).toBe(true); // new one appended
  });

  it('leaves the cloned effect chain untouched when the caller supplies no effects', async () => {
    const actor = makeActorStub('a1', 'Hans');
    setupFoundryStubs({ actors: [actor] });
    const da = makeDA();
    await da.createItem({
      itemData: { name: 'Plain Clone', system: {} },
      destination: { type: 'actor', actorName: 'Hans' },
      fromCompendium: 'Compendium.wfrp4e-core.items.Item.source-id',
    });
    const [, payloads] = (actor.createEmbeddedDocuments as any).mock.calls[0];
    const payload = payloads[0];
    expect(payload.effects).toHaveLength(1);
    expect(payload.effects[0].name).toBe('E');
  });
});
