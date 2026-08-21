// BUG-772/786 (bug-fix-campaign-123 Phase 3, wave 2 "confirm-gate omission batch") —
// add-items{removeExistingActorItems:true}, roll-item-table{removeExistingActorItems:true,
// targetActorUuid}, and remove-items all destroyed existing inventory with no confirm:true gate.
// This suite proves: (1) each destructive path REJECTS a missing confirm without ever calling
// the underlying upstream API method (no silent partial execution), (2) the identical call with
// confirm:true reaches the API and succeeds — a post-op read-back on the mock call count proves
// the gated operation only fires WITH confirm, and (3) the safe/no-op paths (removeExistingActorItems
// false or omitted; roll-item-table with no targetActorUuid — a genuine upstream no-op per
// _rollItemTable's `if (targetActor)` branch) are NOT over-gated.
//
// Uses the Deliverable-0 shared harness (installItemPilesGame/baseApi) rather than hand-rolling
// mockGlobals(), per plan D2/D9.

import { describe, it, expect, afterEach } from 'vitest';
import { handleAddItems, handleRemoveItems } from '../flow.js';
import { handleRollItemTable } from '../merchant.js';
import { installItemPilesGame, baseApi } from './verify-harness.js';

afterEach(() => {
  delete (globalThis as any).game;
});

describe('BUG-772: add-items{removeExistingActorItems:true} confirm gate', () => {
  it('rejects a missing confirm and never calls API.addItems (no partial wipe)', async () => {
    const addItemsMock = { called: 0 as number };
    const api = baseApi({
      getActorItems: () => [
        { id: 'e1', name: 'Old Sword', type: 'weapon', system: { quantity: { value: 1 } } },
        { id: 'e2', name: 'Old Shield', type: 'armour', system: { quantity: { value: 1 } } },
      ],
      addItems: async () => { addItemsMock.called += 1; return []; },
    });
    const teardown = installItemPilesGame(api);
    try {
      const result: any = await handleAddItems({
        action: 'add-items',
        actorUuid: 'Actor.pile',
        items: [{ name: 'New Sword', type: 'weapon' }],
        removeExistingActorItems: true,
        // confirm intentionally omitted
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('CONFIRM_REQUIRED');
      expect(result.error).toContain('WIPE');
      // BUG-461(a)-style preview: names of the items about to be destroyed are named, not a document dump.
      expect(result.error).toContain('Old Sword');
      expect(result.error).toContain('Old Shield');
      expect(addItemsMock.called).toBe(0); // post-op read-back: the gated op never fired
    } finally {
      teardown();
    }
  });

  it('confirm:true reaches API.addItems and succeeds', async () => {
    const addItemsMock = { called: 0 as number, lastOptions: undefined as any };
    const api = baseApi({
      getActorItems: () => [{ id: 'n1', name: 'New Sword', type: 'weapon', system: { quantity: { value: 1 } } }],
      addItems: async (_uuid: string, _items: unknown, options: any) => {
        addItemsMock.called += 1;
        addItemsMock.lastOptions = options;
        return [];
      },
    });
    const teardown = installItemPilesGame(api);
    try {
      const result: any = await handleAddItems({
        action: 'add-items',
        actorUuid: 'Actor.pile',
        items: [{ name: 'New Sword', type: 'weapon' }],
        removeExistingActorItems: true,
        confirm: true,
      } as any);

      expect(result.success).toBe(true);
      expect(addItemsMock.called).toBe(1); // post-op read-back: the gated op fired exactly once
      expect(addItemsMock.lastOptions?.removeExistingActorItems).toBe(true);
    } finally {
      teardown();
    }
  });

  it('regression guard: removeExistingActorItems omitted (safe default) is NOT gated — no confirm required', async () => {
    let items: any[] = [];
    const api = baseApi({
      getActorItems: () => items,
      addItems: async () => {
        items = [{ id: 'a1', name: 'Torch', type: 'trapping', system: { quantity: { value: 1 } } }];
        return [];
      },
    });
    const teardown = installItemPilesGame(api);
    try {
      const result: any = await handleAddItems({
        action: 'add-items',
        actorUuid: 'Actor.pile',
        items: [{ name: 'Torch', type: 'trapping' }],
        // removeExistingActorItems omitted -> defaults false; confirm omitted -> must still succeed
      } as any);

      expect(result.success).toBe(true);
    } finally {
      teardown();
    }
  });
});

describe('BUG-772: roll-item-table{removeExistingActorItems:true, targetActorUuid} confirm gate', () => {
  it('rejects a missing confirm and never calls API.rollItemTable', async () => {
    const rollMock = { called: 0 as number };
    const api = baseApi({
      getActorItems: (uuid: string) => (uuid === 'Actor.target'
        ? [{ id: 'e1', name: 'Stale Loot', type: 'trapping', system: { quantity: { value: 3 } } }]
        : []),
      rollItemTable: async () => { rollMock.called += 1; return []; },
    });
    const teardown = installItemPilesGame(api);
    try {
      const result: any = await handleRollItemTable({
        action: 'roll-item-table',
        tableUuid: 'RollTable.loot',
        targetActorUuid: 'Actor.target',
        removeExistingActorItems: true,
        // confirm intentionally omitted
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('CONFIRM_REQUIRED');
      expect(result.error).toContain('WIPE');
      expect(result.error).toContain('Stale Loot');
      expect(rollMock.called).toBe(0); // post-op read-back: the gated op never fired
    } finally {
      teardown();
    }
  });

  it('confirm:true reaches API.rollItemTable and succeeds', async () => {
    const rollMock = { called: 0 as number, lastOptions: undefined as any };
    const api = baseApi({
      getActorItems: () => [],
      rollItemTable: async (_table: string, options: any) => {
        rollMock.called += 1;
        rollMock.lastOptions = options;
        return [];
      },
    });
    const teardown = installItemPilesGame(api);
    try {
      const result: any = await handleRollItemTable({
        action: 'roll-item-table',
        tableUuid: 'RollTable.loot',
        targetActorUuid: 'Actor.target',
        removeExistingActorItems: true,
        confirm: true,
      } as any);

      expect(result.success).toBe(true);
      expect(rollMock.called).toBe(1); // post-op read-back: the gated op fired exactly once
      expect(rollMock.lastOptions?.removeExistingActorItems).toBe(true);
    } finally {
      teardown();
    }
  });

  it('regression guard: removeExistingActorItems:true with NO targetActorUuid is a genuine upstream no-op — not gated', async () => {
    // item-piles.js _rollItemTable only forwards to _addItems (the wipe) inside `if (targetActor)`;
    // with no target nothing is added anywhere, so removeExistingActorItems cannot wipe anything.
    const rollMock = { called: 0 as number };
    const api = baseApi({
      getActorItems: () => [],
      rollItemTable: async () => { rollMock.called += 1; return []; },
    });
    const teardown = installItemPilesGame(api);
    try {
      const result: any = await handleRollItemTable({
        action: 'roll-item-table',
        tableUuid: 'RollTable.loot',
        removeExistingActorItems: true,
        // no targetActorUuid, no confirm — must still succeed (flag is inert without a target)
      } as any);

      expect(result.success).toBe(true);
      expect(rollMock.called).toBe(1);
    } finally {
      teardown();
    }
  });
});

describe('BUG-786: remove-items confirm gate', () => {
  it('rejects a missing confirm and never calls API.removeItems, previewing name/current-qty/requested-qty', async () => {
    const removeMock = { called: 0 as number };
    const api = baseApi({
      getActorItems: () => [{ id: 'r1', name: 'Arrow', type: 'ammunition', system: { quantity: { value: 5 } } }],
      removeItems: async () => { removeMock.called += 1; return []; },
    });
    const teardown = installItemPilesGame(api);
    try {
      const result: any = await handleRemoveItems({
        action: 'remove-items',
        actorUuid: 'Actor.pile',
        items: [{ id: 'r1', quantity: 2 }],
        // confirm intentionally omitted
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('CONFIRM_REQUIRED');
      expect(result.error).toContain('Arrow');
      expect(result.error).toContain('current qty: 5');
      expect(result.error).toContain('requesting removal of: 2');
      expect(result.error).toContain('Actor.pile');
      expect(removeMock.called).toBe(0); // post-op read-back: the gated op never fired
    } finally {
      teardown();
    }
  });

  it('confirm:true reaches API.removeItems and succeeds on a genuine partial-stack removal', async () => {
    // Mirrors module-item-piles.test.ts's BUG-445c precedent: 1-of-2 removal keeps distinct-item
    // COUNT static while quantity drops 2->1 — the verify below must key on quantity, not count.
    let removed = false;
    const removeMock = { called: 0 as number };
    const api = baseApi({
      getActorItems: () => [{ id: 'r1', name: 'Arrow', type: 'ammunition', system: { quantity: { value: removed ? 1 : 2 } } }],
      removeItems: async () => { removeMock.called += 1; removed = true; return []; },
    });
    const teardown = installItemPilesGame(api);
    try {
      const result: any = await handleRemoveItems({
        action: 'remove-items',
        actorUuid: 'Actor.pile',
        items: [{ id: 'r1', quantity: 1 }],
        confirm: true,
      } as any);

      expect(result.success).toBe(true);
      expect(removeMock.called).toBe(1); // post-op read-back: the gated op fired exactly once
      expect(result.data.totalItems).toBe(1); // count static — the sibling BUG-445 dimension
    } finally {
      teardown();
    }
  });
});
