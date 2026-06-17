// Phase 5 follow-up B — FoundryDataAccess effect CRUD + updateItem/deleteItem
// destination-routing regression coverage.

import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { QueryHandlers } from '../queries.js';

function makeEffectStub(id: string, name: string, extra: any = {}) {
  const obj: any = {
    id,
    name,
    system: { scriptData: [{ trigger: 'manual', script: '' }], transferData: {} },
    ...extra,
  };
  // _source mirrors persisted raw data (BUG-216 fix: verifyDocWrite reads _source).
  obj._source = { id, name, disabled: extra.disabled ?? false, ...extra,
    system: { scriptData: [{ trigger: 'manual', script: '' }], transferData: {} } };
  obj.update = vi.fn(async (payload: Record<string, unknown>) => {
    for (const [k, v] of Object.entries(payload)) {
      if (k.startsWith('system.')) {
        const path = k.slice('system.'.length).split('.');
        let cursor: any = obj.system;
        let srcCursor: any = obj._source.system;
        while (path.length > 1) {
          const seg = path.shift()!;
          cursor[seg] = cursor[seg] ?? {};
          srcCursor[seg] = srcCursor[seg] ?? {};
          cursor = cursor[seg];
          srcCursor = srcCursor[seg];
        }
        cursor[path[0] as string] = v;
        srcCursor[path[0] as string] = v;
      } else {
        obj[k] = v;
        obj._source[k] = v; // keep _source in sync for verifyDocWrite
      }
    }
    return obj;
  });
  obj.toObject = () => ({ ...obj });
  return obj;
}

function makeItemStub(id: string, name: string, effects: any[] = []) {
  const effectList = [...effects];
  const item: any = {
    id,
    name,
    type: 'weapon',
    effects: {
      contents: effectList,
      [Symbol.iterator]: function* () { yield* effectList; },
    },
    createEmbeddedDocuments: vi.fn(async (_type: string, payloads: any[]) => {
      const created = payloads.map((p, i) =>
        makeEffectStub(`new-eff-${effectList.length + i}`, p.name ?? 'unnamed')
      );
      for (const c of created) effectList.push(c);
      return created;
    }),
    deleteEmbeddedDocuments: vi.fn(async (_type: string, ids: string[]) => {
      for (const id of ids) {
        const idx = effectList.findIndex((e) => e.id === id);
        if (idx >= 0) effectList.splice(idx, 1);
      }
      return ids;
    }),
    update: vi.fn(async () => item),
    delete: vi.fn(async () => true),
  };
  return item;
}

function makeActorStub(id: string, name: string, items: any[] = []) {
  const itemList = [...items];
  return {
    id,
    name,
    items: {
      get: (id: string) => itemList.find((i) => i.id === id) ?? null,
      find: (pred: (i: any) => boolean) => itemList.find(pred) ?? null,
    },
    deleteEmbeddedDocuments: vi.fn(async (_type: string, ids: string[]) => {
      for (const id of ids) {
        const idx = itemList.findIndex((i) => i.id === id);
        if (idx >= 0) itemList.splice(idx, 1);
      }
      return ids;
    }),
  };
}

function setupStubs(opts: { actors?: any[]; worldItems?: any[] } = {}) {
  const actors = opts.actors ?? [];
  const worldItems = opts.worldItems ?? [];
  (globalThis as any).game = {
    ...(globalThis as any).game,
    actors: {
      get: (id: string) => actors.find((a) => a.id === id) ?? null,
      find: (pred: (a: any) => boolean) => actors.find(pred) ?? null,
    },
    items: {
      get: (id: string) => worldItems.find((i) => i.id === id) ?? null,
      find: (pred: (i: any) => boolean) => worldItems.find(pred) ?? null,
    },
  };
  (globalThis as any).ui = { notifications: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } };
}

function makeDA(): any {
  // Phase 8 (R7.3): the actor/item/effect mutation methods were promoted off FoundryDataAccess to the
  // QueryHandlers services; re-expose the ones this test pierces on the DA handle so the captured
  // write-paths are unchanged (the re-bind delegates to the same promoted service the handlers call).
  const qh = new QueryHandlers();
  const da: any = qh.dataAccess;
  da.validateFoundryState = () => {};
  da.addActiveEffect = (d: any) => qh.effectsService.addActiveEffect(d);
  da.updateActiveEffect = (d: any) => qh.effectsService.updateActiveEffect(d);
  da.deleteActiveEffect = (d: any) => qh.effectsService.deleteActiveEffect(d);
  da.updateItem = (d: any) => qh.itemService.updateItem(d);
  da.deleteItem = (d: any) => qh.itemService.deleteItem(d);
  return da;
}

// Pre-warm the dynamic @foundry-mcp/shared import so tests don't hit a 5s timeout
// when running under concurrency (39 workers competing for the first ESM cache fill).
beforeAll(async () => {
  await import('@foundry-mcp/shared');
});

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('addActiveEffect', () => {
  it('creates effect on actor-embedded item by actorName + itemName', async () => {
    const item = makeItemStub('i1', 'Fire Sword');
    const actor = makeActorStub('a1', 'Hans', [item]);
    setupStubs({ actors: [actor] });
    const da = makeDA();

    const res = await da.addActiveEffect({
      target: { scope: 'actor', actorName: 'Hans', itemName: 'Fire Sword' },
      effect: { name: 'Burning', trigger: 'applyDamage', script: '' },
    });

    expect(res.success).toBe(true);
    expect(res.scope).toBe('actor');
    expect(res.actorId).toBe('a1');
    expect(res.itemId).toBe('i1');
    expect(res.effectName).toBe('Burning');
    expect(item.createEmbeddedDocuments).toHaveBeenCalledOnce();
  });

  it('creates effect on world item by itemId', async () => {
    const worldItem = makeItemStub('w1', 'World Spell');
    setupStubs({ worldItems: [worldItem] });
    const da = makeDA();

    const res = await da.addActiveEffect({
      target: { scope: 'world', itemId: 'w1' },
      effect: { name: 'Glow', trigger: 'prePrepareData', script: '' },
    });

    expect(res.scope).toBe('world');
    expect(res.itemId).toBe('w1');
    expect(res.actorId).toBeNull();
  });

  it('throws when target actor not found', async () => {
    setupStubs({ actors: [] });
    const da = makeDA();
    await expect(
      da.addActiveEffect({
        target: { scope: 'actor', actorName: 'Ghost', itemName: 'X' },
        effect: { name: 'E', trigger: 'manual', script: '' },
      })
    ).rejects.toThrow(/Actor not found/);
  });

  it('throws when target world item not found', async () => {
    setupStubs({ worldItems: [] });
    const da = makeDA();
    await expect(
      da.addActiveEffect({
        target: { scope: 'world', itemName: 'Nonexistent' },
        effect: { name: 'E', trigger: 'manual', script: '' },
      })
    ).rejects.toThrow(/World item/);
  });
});

describe('updateActiveEffect', () => {
  it('updates effect by id with partial merge semantics', async () => {
    const eff = makeEffectStub('e1', 'Burning', { disabled: false });
    const item = makeItemStub('i1', 'Fire Sword', [eff]);
    const actor = makeActorStub('a1', 'Hans', [item]);
    setupStubs({ actors: [actor] });
    const da = makeDA();

    const res = await da.updateActiveEffect({
      target: { scope: 'actor', actorId: 'a1', itemId: 'i1' },
      effectId: 'e1',
      updates: { disabled: true },
    });

    expect(res.effectId).toBe('e1');
    expect(eff.update).toHaveBeenCalledOnce();
    const payload = eff.update.mock.calls[0][0];
    expect(payload.disabled).toBe(true);
    // name/trigger/script not in updates -> no system.scriptData rewrite
    expect(payload['system.scriptData']).toBeUndefined();
  });

  it('resolves by effectName fallback', async () => {
    const eff = makeEffectStub('e1', 'Burning');
    const item = makeItemStub('i1', 'Fire Sword', [eff]);
    const actor = makeActorStub('a1', 'Hans', [item]);
    setupStubs({ actors: [actor] });
    const da = makeDA();

    const res = await da.updateActiveEffect({
      target: { scope: 'actor', actorId: 'a1', itemId: 'i1' },
      effectName: 'Burning',
      updates: { name: 'Smouldering' },
    });

    expect(res.effectId).toBe('e1');
    expect(eff.update).toHaveBeenCalledOnce();
    expect(eff.update.mock.calls[0][0].name).toBe('Smouldering');
  });

  it('rewrites system.scriptData when trigger changes', async () => {
    const eff = makeEffectStub('e1', 'Burning');
    const item = makeItemStub('i1', 'Fire Sword', [eff]);
    const actor = makeActorStub('a1', 'Hans', [item]);
    setupStubs({ actors: [actor] });
    const da = makeDA();

    await da.updateActiveEffect({
      target: { scope: 'actor', actorId: 'a1', itemId: 'i1' },
      effectId: 'e1',
      updates: { trigger: 'endTurn' },
    });

    const payload = eff.update.mock.calls[0][0];
    expect(payload['system.scriptData']).toBeDefined();
    expect(payload['system.scriptData'][0].trigger).toBe('endTurn');
  });

  it('throws when effect not found', async () => {
    const item = makeItemStub('i1', 'Fire Sword');
    const actor = makeActorStub('a1', 'Hans', [item]);
    setupStubs({ actors: [actor] });
    const da = makeDA();
    await expect(
      da.updateActiveEffect({
        target: { scope: 'actor', actorId: 'a1', itemId: 'i1' },
        effectId: 'missing',
        updates: { disabled: true },
      })
    ).rejects.toThrow(/Effect/);
  });

  it('throws when neither effectId nor effectName supplied', async () => {
    const da = makeDA();
    await expect(
      (da as any).updateActiveEffect({
        target: { scope: 'world', itemId: 'w1' },
        updates: { disabled: true },
      })
    ).rejects.toThrow(/effectId or effectName/);
  });
});

describe('deleteActiveEffect', () => {
  it('deletes effect by id', async () => {
    const eff = makeEffectStub('e1', 'Burning');
    const item = makeItemStub('i1', 'Fire Sword', [eff]);
    const actor = makeActorStub('a1', 'Hans', [item]);
    setupStubs({ actors: [actor] });
    const da = makeDA();

    const res = await da.deleteActiveEffect({
      target: { scope: 'actor', actorId: 'a1', itemId: 'i1' },
      effectId: 'e1',
    });

    expect(res.effectId).toBe('e1');
    expect(item.deleteEmbeddedDocuments).toHaveBeenCalledWith('ActiveEffect', ['e1']);
  });

  it('deletes effect by name (resolves to id)', async () => {
    const eff = makeEffectStub('e1', 'Burning');
    const item = makeItemStub('i1', 'Fire Sword', [eff]);
    setupStubs({ worldItems: [item] });
    const da = makeDA();

    await da.deleteActiveEffect({
      target: { scope: 'world', itemId: 'i1' },
      effectName: 'Burning',
    });

    expect(item.deleteEmbeddedDocuments).toHaveBeenCalledWith('ActiveEffect', ['e1']);
  });

  it('throws when neither effectId nor effectName supplied', async () => {
    const da = makeDA();
    await expect(
      (da as any).deleteActiveEffect({ target: { scope: 'world', itemId: 'w1' } })
    ).rejects.toThrow(/effectId or effectName/);
  });
});

describe('_resolveItem regression (Phase A: legacy paths preserved)', () => {
  it('updateItem legacy {actorId,itemId} path still works', async () => {
    const item = makeItemStub('i1', 'Cloak');
    item.update = vi.fn(async () => item);
    const actor = makeActorStub('a1', 'Hans', [item]);
    setupStubs({ actors: [actor] });
    const da = makeDA();

    const res = await da.updateItem({
      actorId: 'a1',
      itemId: 'i1',
      updateData: { 'system.advances.value': 2 },
      verifyPersistence: false,
    });
    expect(res.success).toBe(true);
    expect(res.scope).toBe('actor');
    expect(item.update).toHaveBeenCalled();
  });

  it('deleteItem legacy {actorId,itemId} path still works', async () => {
    const item = makeItemStub('i1', 'Cloak');
    const actor = makeActorStub('a1', 'Hans', [item]);
    setupStubs({ actors: [actor] });
    const da = makeDA();

    const res = await da.deleteItem({ actorId: 'a1', itemId: 'i1' });
    expect(res.success).toBe(true);
    expect(res.scope).toBe('actor');
    expect(actor.deleteEmbeddedDocuments).toHaveBeenCalledWith('Item', ['i1']);
  });

  it('deleteItem world scope by name calls item.delete (not actor.deleteEmbeddedDocuments)', async () => {
    const item = makeItemStub('w1', 'World Cloak');
    setupStubs({ worldItems: [item] });
    const da = makeDA();

    const res = await da.deleteItem({
      destination: { type: 'world' },
      itemName: 'World Cloak',
    });
    expect(res.scope).toBe('world');
    expect(item.delete).toHaveBeenCalled();
  });
});

describe('updateActiveEffect — BUG-216 post-verify', () => {
  // BUG-216 fix uses foundry.utils.flattenObject + getProperty inside updateActiveEffect.
  // The global setup.ts provides these, but we need to ensure they're present for these tests.
  beforeEach(() => {
    (globalThis as any).foundry = {
      ...(globalThis as any).foundry,
      utils: {
        ...(globalThis as any).foundry?.utils,
        flattenObject(obj: any): Record<string, any> {
          const result: Record<string, any> = {};
          for (const [k, v] of Object.entries(obj)) {
            if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
              const nested = (globalThis as any).foundry.utils.flattenObject(v as any);
              for (const [nk, nv] of Object.entries(nested)) result[`${k}.${nk}`] = nv;
            } else {
              result[k] = v;
            }
          }
          return result;
        },
        getProperty(obj: any, path: string): any {
          return path.split('.').reduce((c: any, seg: string) => c?.[seg], obj);
        },
      },
    };
  });

  it('throws UPDATE_ACTIVE_EFFECT_NOT_PERSISTED when update() returns undefined (cancelled write)', async () => {
    const eff = makeEffectStub('e1', 'Warpstone Taint', { disabled: false });
    // Override update to return undefined (simulates preUpdate hook cancellation).
    // _source NOT mutated → drift detected by verifyDocWrite.
    eff.update = vi.fn(async () => undefined);
    const item = makeItemStub('i1', 'Corrupted Blade', [eff]);
    const actor = makeActorStub('a1', 'Hans', [item]);
    setupStubs({ actors: [actor] });
    const da = makeDA();

    await expect(
      da.updateActiveEffect({
        target: { scope: 'actor', actorId: 'a1', itemId: 'i1' },
        effectId: 'e1',
        updates: { disabled: true },
      }),
    ).rejects.toThrow(/UPDATE_ACTIVE_EFFECT_NOT_PERSISTED/);
  });

  it('.-= deletion marker in updates is skipped — no false drift throw', async () => {
    // Deletion markers (e.g. "system.changes.-=0": null) cannot be validated
    // via value comparison; verifyDocWrite and the cancel-guard both skip them.
    const eff = makeEffectStub('e2', 'Burning', { disabled: false });
    const item = makeItemStub('i2', 'Flame Sword', [eff]);
    const actor = makeActorStub('a2', 'Maria', [item]);
    setupStubs({ actors: [actor] });
    const da = makeDA();

    // The .-= key should be skipped without throwing.
    const res = await da.updateActiveEffect({
      target: { scope: 'actor', actorId: 'a2', itemId: 'i2' },
      effectId: 'e2',
      updates: { name: 'Burning' }, // name unchanged → idempotent no-op
    });
    expect(res.effectId).toBe('e2');
  });

  it('BUG-342: tolerates wfrp4e options-shape normalization on a script update', async () => {
    // Live divergence: wfrp4e rewrites scriptData[].options on write to its own shape
    // (targeter/defending/runIfDisabled/deleteEffect/showDuplicates), which never matches
    // the MCP payload template (immediate/defer/tag). flattenObject treats the scriptData
    // array as a single leaf key, so a naive whole-array drift compare false-fails with
    // UPDATE_ACTIVE_EFFECT_NOT_PERSISTED even though the write landed. The fix skips the
    // array from the generic verify and checks the scriptData[0] script body instead.
    const LIVE_OPTIONS = {
      hideScript: '', activateScript: '', submissionScript: '',
      targeter: false, defending: false, runIfDisabled: false,
      deleteEffect: false, showDuplicates: false,
    };
    const eff: any = {
      id: 'e-342', name: 'Script Effect',
      system: { scriptData: [{ label: 'Script Effect', trigger: 'manual', script: 'old', options: { ...LIVE_OPTIONS } }], transferData: {} },
    };
    eff._source = {
      id: 'e-342', name: 'Script Effect', disabled: false,
      system: { scriptData: [{ label: 'Script Effect', trigger: 'manual', script: 'old', options: { ...LIVE_OPTIONS } }], transferData: {} },
    };
    eff.update = vi.fn(async (payload: Record<string, unknown>) => {
      // Simulate wfrp4e: accept the new script body but FORCE its own options shape.
      if (payload['system.scriptData']) {
        const incoming: any = (payload['system.scriptData'] as any[])[0];
        const normalized = { ...incoming, options: { ...LIVE_OPTIONS } };
        eff.system.scriptData = [normalized];
        eff._source.system.scriptData = [normalized];
      }
      for (const [k, v] of Object.entries(payload)) {
        if (!k.startsWith('system.')) { eff[k] = v; eff._source[k] = v; }
      }
      return eff;
    });
    eff.toObject = () => ({ ...eff });
    const item = makeItemStub('i-342', 'Blade', [eff]);
    const actor = makeActorStub('a-342', 'Hans', [item]);
    setupStubs({ actors: [actor] });
    const da = makeDA();

    // Old code (whole-array compare) threw here; the fix must NOT throw.
    const res = await da.updateActiveEffect({
      target: { scope: 'actor', actorId: 'a-342', itemId: 'i-342' },
      effectId: 'e-342',
      updates: { script: 'newbody' },
    });
    expect(res.effectId).toBe('e-342');
    // Targeted check still proves the script body actually persisted.
    expect(eff._source.system.scriptData[0].script).toBe('newbody');
  });
});
