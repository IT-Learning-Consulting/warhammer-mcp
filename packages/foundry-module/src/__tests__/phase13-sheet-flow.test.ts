// wfrp_layer_expansion_v1 Phase 13 (R16) — sheet-flow service unit coverage.
// Tests the three services directly (mirrors apply-damage.test.ts's direct-call style):
// input-validation guards (zero-all-amount / insufficient-funds / coinless-actor rejected
// BEFORE any write), the DP-16/diff-verify path, and the BUG-064 hook-wait for direct-pay.

import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { PsychologyService } from '../services/psychology.js';
import { InventoryService } from '../services/inventory.js';
import { MarketService } from '../services/market.js';

type HookHandler = (...args: any[]) => void;

interface HookRegistry {
  next: number;
  byId: Map<number, { event: string; fn: HookHandler }>;
  register(event: string, fn: HookHandler): number;
  off(event: string, id: number): void;
  fire(event: string, ...args: any[]): void;
}

function installHookRegistry(): HookRegistry {
  const reg: HookRegistry = {
    next: 1,
    byId: new Map(),
    register(event, fn) {
      const id = this.next++;
      this.byId.set(id, { event, fn });
      return id;
    },
    off(_event, id) {
      this.byId.delete(id);
    },
    fire(event, ...args) {
      for (const entry of this.byId.values()) {
        if (entry.event === event) entry.fn(...args);
      }
    },
  };
  (globalThis as any).Hooks = {
    on: (event: string, fn: HookHandler) => reg.register(event, fn),
    off: (event: string, id: number) => reg.off(event, id),
    once: (_event: string, _fn: HookHandler) => 0,
    call: () => {},
    callAll: () => {},
  };
  return reg;
}

function installFoundryUtils(): void {
  (globalThis as any).foundry = {
    utils: {
      duplicate: (obj: any) => JSON.parse(JSON.stringify(obj)),
      setProperty: (obj: any, path: string, value: any) => {
        const parts = path.split('.');
        let cursor = obj;
        for (let i = 0; i < parts.length - 1; i++) {
          cursor[parts[i]!] = cursor[parts[i]!] ?? {};
          cursor = cursor[parts[i]!];
        }
        cursor[parts[parts.length - 1]!] = value;
      },
    },
  };
}

function makeMoneyItem(id: string, name: string, quantity: number, coinValue: number) {
  return { id, _id: id, name, type: 'money', system: { quantity: { value: quantity }, coinValue: { value: coinValue } } };
}

describe('PsychologyService.applyFear (design B — no setupExtendedTest)', () => {
  beforeEach(() => {
    installFoundryUtils();
    (globalThis as any).game = {
      wfrp4e: {
        config: {
          systemItems: {
            fear: { name: 'Fear Extended Test', type: 'extendedTest', system: { SL: { current: 0, target: 1 } }, flags: { wfrp4e: { fear: true } } },
          },
        },
      },
    };
  });

  it('creates a Fear item with the requested rating + source name, skipping setupExtendedTest', async () => {
    const createdItem = { id: 'fear-item-1', system: { SL: { target: 2 } }, flags: { wfrp4e: { fearName: 'Chaos Warrior' } }, name: 'Fear Extended Test' };
    const actor: any = {
      id: 'actor-1',
      name: 'Hans',
      uuid: 'Actor.actor-1',
      createEmbeddedDocuments: vi.fn(async () => [createdItem]),
      items: { get: (id: string) => (id === 'fear-item-1' ? createdItem : undefined) },
    };
    (globalThis as any).game.actors = new Map([[actor.id, actor]]);

    const svc = new PsychologyService(() => {});
    const result = await svc.applyFear({ actorId: 'actor-1', rating: 2, sourceName: 'Chaos Warrior' });

    expect(actor.createEmbeddedDocuments).toHaveBeenCalledTimes(1);
    const [docType, [fearDoc], opts] = actor.createEmbeddedDocuments.mock.calls[0];
    expect(docType).toBe('Item');
    expect(fearDoc.system.SL.target).toBe(2);
    expect(fearDoc.flags.wfrp4e.fearName).toBe('Chaos Warrior');
    expect(opts).toEqual({ condition: true });
    // setupExtendedTest must NEVER be called on the actor or the created item (ADR-10.1 dialog guard).
    expect(actor.setupExtendedTest).toBeUndefined();
    expect((createdItem as any).setupExtendedTest).toBeUndefined();

    expect(result.fearItemId).toBe('fear-item-1');
    expect(result.rating).toBe(2);
    expect(result.sourceName).toBe('Chaos Warrior');
  });

  it('throws APPLY_FEAR_NOT_PERSISTED when the re-read item does not match the requested fields', async () => {
    const createdItem = { id: 'fear-item-2', system: { SL: { target: 1 } }, flags: { wfrp4e: { fearName: 'wrong-name' } } };
    const actor: any = {
      id: 'actor-2',
      name: 'Grendel',
      uuid: 'Actor.actor-2',
      createEmbeddedDocuments: vi.fn(async () => [createdItem]),
      items: { get: (id: string) => (id === 'fear-item-2' ? createdItem : undefined) },
    };
    (globalThis as any).game.actors = new Map([[actor.id, actor]]);

    const svc = new PsychologyService(() => {});
    await expect(
      svc.applyFear({ actorId: 'actor-2', rating: 3, sourceName: 'Greater Daemon' }),
    ).rejects.toThrow(/APPLY_FEAR_NOT_PERSISTED/);
  });

  it('throws a clear error when actorId is unknown', async () => {
    (globalThis as any).game.actors = new Map();
    const svc = new PsychologyService(() => {});
    await expect(svc.applyFear({ actorId: 'missing', rating: 1, sourceName: 'x' })).rejects.toThrow(/Actor not found/);
  });
});

describe('InventoryService.checkReload', () => {
  beforeEach(() => {
    installFoundryUtils();
    (globalThis as any).game = {};
  });

  it('reports "started" when checkReloadExtendedTest creates a reload ExtendedTest item', async () => {
    let reloadingFlag: string | undefined = undefined;
    const weapon: any = {
      id: 'weapon-1',
      loading: true,
      getFlag: (_scope: string, _key: string) => reloadingFlag,
    };
    const actor: any = {
      id: 'actor-1',
      name: 'Hans',
      uuid: 'Actor.actor-1',
      items: { get: (id: string) => (id === 'weapon-1' ? weapon : undefined) },
      checkReloadExtendedTest: vi.fn(async () => {
        reloadingFlag = 'reload-item-1';
      }),
    };
    (globalThis as any).game.actors = new Map([[actor.id, actor]]);

    const svc = new InventoryService(() => {});
    const result = await svc.checkReload({ actorId: 'actor-1', weaponId: 'weapon-1' });

    expect(actor.checkReloadExtendedTest).toHaveBeenCalledWith(weapon, actor);
    expect(result.branch).toBe('started');
    expect(result.reloading).toBe(true);
  });

  it('reports "completed" when checkReloadExtendedTest clears the reload flag', async () => {
    let reloadingFlag: string | undefined = 'reload-item-1';
    const weapon: any = {
      id: 'weapon-2',
      loading: true,
      getFlag: (_scope: string, _key: string) => reloadingFlag,
    };
    const actor: any = {
      id: 'actor-2',
      name: 'Grendel',
      uuid: 'Actor.actor-2',
      items: { get: (id: string) => (id === 'weapon-2' ? weapon : undefined) },
      checkReloadExtendedTest: vi.fn(async () => {
        reloadingFlag = undefined;
      }),
    };
    (globalThis as any).game.actors = new Map([[actor.id, actor]]);

    const svc = new InventoryService(() => {});
    const result = await svc.checkReload({ actorId: 'actor-2', weaponId: 'weapon-2' });

    expect(result.branch).toBe('completed');
    expect(result.reloading).toBe(false);
  });

  // BUG-418: the branch classification diffs the tracker item's ID, not a boolean —
  // a repeat call that swaps the tracker (discarding SL progress) must NOT read as no-op.
  it('reports "restarted" when the reload tracker is replaced (id changes)', async () => {
    let reloadingFlag: string | undefined = 'reload-item-1';
    const weapon: any = {
      id: 'weapon-4',
      loading: true,
      getFlag: (_scope: string, _key: string) => reloadingFlag,
    };
    const actor: any = {
      id: 'actor-4',
      name: 'Ulrika',
      uuid: 'Actor.actor-4',
      items: { get: (id: string) => (id === 'weapon-4' ? weapon : undefined) },
      checkReloadExtendedTest: vi.fn(async () => {
        reloadingFlag = 'reload-item-2'; // old tracker deleted, fresh one created
      }),
    };
    (globalThis as any).game.actors = new Map([[actor.id, actor]]);

    const svc = new InventoryService(() => {});
    const result = await svc.checkReload({ actorId: 'actor-4', weaponId: 'weapon-4' });

    expect(result.branch).toBe('restarted');
    expect(result.reloading).toBe(true);
  });

  it('reports "no-op" only when the tracker id is unchanged', async () => {
    const reloadingFlag = 'reload-item-1';
    const weapon: any = {
      id: 'weapon-5',
      loading: true,
      getFlag: (_scope: string, _key: string) => reloadingFlag,
    };
    const actor: any = {
      id: 'actor-5',
      name: 'Gunnar',
      uuid: 'Actor.actor-5',
      items: { get: (id: string) => (id === 'weapon-5' ? weapon : undefined) },
      checkReloadExtendedTest: vi.fn(async () => { /* tracker untouched */ }),
    };
    (globalThis as any).game.actors = new Map([[actor.id, actor]]);

    const svc = new InventoryService(() => {});
    const result = await svc.checkReload({ actorId: 'actor-5', weaponId: 'weapon-5' });

    expect(result.branch).toBe('no-op');
    expect(result.reloading).toBe(true);
  });

  it('throws a clear error when the weapon is not found on the actor', async () => {
    const actor: any = { id: 'actor-3', name: 'Empty', items: { get: () => undefined } };
    (globalThis as any).game.actors = new Map([[actor.id, actor]]);
    const svc = new InventoryService(() => {});
    await expect(svc.checkReload({ actorId: 'actor-3', weaponId: 'missing' })).rejects.toThrow(
      /CHECK_RELOAD_WEAPON_NOT_FOUND/,
    );
  });
});

describe('MarketService.addMoney (zero-all-coins trap guard)', () => {
  beforeEach(() => {
    installFoundryUtils();
    (globalThis as any).game = {
      i18n: { localize: (key: string) => ({ 'NAME.BP': 'Brass Penny', 'NAME.SS': 'Silver Shilling', 'NAME.GC': 'Gold Crown' }[key] ?? key) },
    };
  });

  function makeActorWithMoney() {
    const gc = makeMoneyItem('gc-1', 'Gold Crown', 5, 240);
    const ss = makeMoneyItem('ss-1', 'Silver Shilling', 10, 12);
    const bp = makeMoneyItem('bp-1', 'Brass Penny', 20, 1);
    const items = new Map([[gc.id, gc], [ss.id, ss], [bp.id, bp]]);
    const actor: any = {
      id: 'actor-1',
      name: 'Hans',
      uuid: 'Actor.actor-1',
      itemTags: { money: [gc, ss, bp] },
      items: { get: (id: string) => items.get(id) },
      updateEmbeddedDocuments: vi.fn(async (_type: string, patch: any[]) => {
        for (const p of patch) {
          const existing = items.get(p._id ?? p.id);
          if (existing) existing.system.quantity.value = p.system.quantity.value;
        }
      }),
    };
    return { actor, gc, ss, bp };
  }

  it('rejects "0g" BEFORE calling addMoneyTo — blocks the zero-all-coins trap', async () => {
    const { actor, gc, ss, bp } = makeActorWithMoney();
    (globalThis as any).game.actors = new Map([[actor.id, actor]]);
    const addMoneyTo = vi.fn();
    (globalThis as any).game.wfrp4e = { market: { addMoneyTo } };

    const svc = new MarketService(() => {});
    await expect(svc.addMoney({ actorId: 'actor-1', amountString: '0g' })).rejects.toThrow(
      /ADD_MONEY_INVALID_AMOUNT/,
    );
    expect(addMoneyTo).not.toHaveBeenCalled();
    // Coins untouched.
    expect(gc.system.quantity.value).toBe(5);
    expect(ss.system.quantity.value).toBe(10);
    expect(bp.system.quantity.value).toBe(20);
  });

  it('rejects a malformed amount string BEFORE calling addMoneyTo', async () => {
    const { actor } = makeActorWithMoney();
    (globalThis as any).game.actors = new Map([[actor.id, actor]]);
    const addMoneyTo = vi.fn();
    (globalThis as any).game.wfrp4e = { market: { addMoneyTo } };
    const svc = new MarketService(() => {});
    await expect(svc.addMoney({ actorId: 'actor-1', amountString: 'not-a-number' })).rejects.toThrow(
      /ADD_MONEY_INVALID_AMOUNT/,
    );
    expect(addMoneyTo).not.toHaveBeenCalled();
  });

  it('rejects when the target tier coin item is missing on the actor', async () => {
    const gc = makeMoneyItem('gc-1', 'Gold Crown', 5, 240);
    const actor: any = {
      id: 'actor-2',
      name: 'Coinless',
      itemTags: { money: [gc] }, // no Brass Penny item
      items: { get: () => undefined },
    };
    (globalThis as any).game.actors = new Map([[actor.id, actor]]);
    (globalThis as any).game.wfrp4e = { market: { addMoneyTo: vi.fn() } };

    const svc = new MarketService(() => {});
    await expect(svc.addMoney({ actorId: 'actor-2', amountString: '5b' })).rejects.toThrow(
      /ADD_MONEY_NO_COIN_ITEM/,
    );
  });

  it('happy path: persists the addMoneyTo patch and diff-verifies', async () => {
    const { actor, gc } = makeActorWithMoney();
    (globalThis as any).game.actors = new Map([[actor.id, actor]]);
    const patch = [{ ...gc, system: { quantity: { value: 10 }, coinValue: { value: 240 } } }];
    (globalThis as any).game.wfrp4e = { market: { addMoneyTo: vi.fn(() => patch) } };

    const svc = new MarketService(() => {});
    const result = await svc.addMoney({ actorId: 'actor-1', amountString: '5g' });

    expect(actor.updateEmbeddedDocuments).toHaveBeenCalledWith('Item', patch);
    expect(gc.system.quantity.value).toBe(10);
    expect(result.amountString).toBe('5g');
  });
});

describe('MarketService.directPay (silent-fail funds guard + BUG-064 hook-wait)', () => {
  let hooks: HookRegistry;

  beforeEach(() => {
    installFoundryUtils();
    hooks = installHookRegistry();
    (globalThis as any).game = {};
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function makeActorWithMoney(gcQty: number, ssQty: number, bpQty: number) {
    const gc = makeMoneyItem('gc-1', 'Gold Crown', gcQty, 240);
    const ss = makeMoneyItem('ss-1', 'Silver Shilling', ssQty, 12);
    const bp = makeMoneyItem('bp-1', 'Brass Penny', bpQty, 1);
    const actor: any = {
      id: 'actor-1',
      name: 'Hans',
      uuid: 'Actor.actor-1',
      itemTags: { money: [gc, ss, bp] },
    };
    return { actor, gc, ss, bp };
  }

  it('rejects an over-budget payment BEFORE calling directPayCommand — coins unchanged', async () => {
    const { actor, gc, ss, bp } = makeActorWithMoney(0, 0, 5);
    (globalThis as any).game.actors = new Map([[actor.id, actor]]);
    const directPayCommand = vi.fn();
    (globalThis as any).game.wfrp4e = {
      market: { directPayCommand, parseMoneyTransactionString: () => ({ gc: 0, ss: 0, bp: 9999 }) },
    };

    const svc = new MarketService(() => {});
    await expect(svc.directPay({ actorId: 'actor-1', amountString: '9999bp' })).rejects.toThrow(
      /DIRECT_PAY_INSUFFICIENT_FUNDS/,
    );
    expect(directPayCommand).not.toHaveBeenCalled();
    expect(bp.system.quantity.value).toBe(5);
  });

  it('rejects an unparseable amount string', async () => {
    const { actor } = makeActorWithMoney(1, 1, 1);
    (globalThis as any).game.actors = new Map([[actor.id, actor]]);
    (globalThis as any).game.wfrp4e = {
      market: { directPayCommand: vi.fn(), parseMoneyTransactionString: () => false },
    };
    const svc = new MarketService(() => {});
    await expect(svc.directPay({ actorId: 'actor-1', amountString: 'garbage' })).rejects.toThrow(
      /DIRECT_PAY_INVALID_AMOUNT/,
    );
  });

  it('happy path: waits for the fire-and-forget updateItem hook before diff-verifying', async () => {
    const { actor, bp } = makeActorWithMoney(1, 0, 6);
    (globalThis as any).game.actors = new Map([[actor.id, actor]]);
    const directPayCommand = vi.fn(() => {
      // Simulate wfrp4e's fire-and-forget updateEmbeddedDocuments (BUG-064): the mutation +
      // hook fire happen in a later microtask, not synchronously inside directPayCommand.
      Promise.resolve().then(() => {
        bp.system.quantity.value -= 2;
        hooks.fire('updateItem', { parent: { id: actor.id } });
      });
    });
    (globalThis as any).game.wfrp4e = {
      market: { directPayCommand, parseMoneyTransactionString: () => ({ gc: 0, ss: 0, bp: 2 }) },
    };

    const svc = new MarketService(() => {});
    const result = await svc.directPay({ actorId: 'actor-1', amountString: '2bp' });

    expect(directPayCommand).toHaveBeenCalledWith('2bp', actor, { suppressMessage: true });
    expect(bp.system.quantity.value).toBe(4);
    expect(result.deductedBP).toBe(2);
  });
});
