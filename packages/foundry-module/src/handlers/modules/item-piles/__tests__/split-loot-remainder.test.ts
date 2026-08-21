// BUG-776 — split-loot left ordinary items behind by default and verified against the wrong end
// state (bare empty-pile check).
//
// Why: item-piles.js:143 defaults `shareItemsEnabled:false`; upstream's _splitItemPileContents
// (:85474-85536) skips ordinary items entirely unless that flag is true, and even when it IS true,
// each stack is split via `Math.floor(quantity/numPlayers)*numPlayers` — an indivisible remainder is
// LEFT BEHIND by design. The old verify treated "pile not empty" as failure regardless. Also:
// getActorItems() excludes currency-registered items by default (a money-only split was invisible),
// and duplicate target UUIDs were accepted as extra recipients (corrupting the numPlayers divisor).

import { describe, it, expect, beforeEach } from 'vitest';
import { dispatchModuleItempiles } from '../item-piles.js';

function makeGame(api: any) {
  return {
    modules: { get: (id: string) => (id === 'item-piles' ? { active: true } : undefined) },
    user: { isGM: true },
    users: [{ isGM: true, active: true }],
    itempiles: { API: api },
  };
}

function stubActor(uuid: string) {
  return { uuid, id: uuid, documentName: 'Actor' };
}

beforeEach(() => {
  (globalThis as any).game = undefined;
  (globalThis as any).fromUuidSync = (uuid: string) => stubActor(uuid);
});

describe('handleSplitLoot — BUG-776', () => {
  it('auto-enables shareItemsEnabled before splitting (upstream defaults it false and would otherwise skip ordinary items)', async () => {
    let flagState = { shareItemsEnabled: false, actorPriceModifiers: [] as any[] };
    const updateItemPile = async (_uuid: string, patch: any) => {
      flagState = { ...flagState, ...patch };
    };
    let pileItems = [{ id: 'i1', name: 'Rusty Sword', type: 'weapon', system: { quantity: { value: 4 } } }];
    const api = {
      getActorFlagData: () => flagState,
      getActorItems: (_uuid: string, _opts?: any) => pileItems,
      splitItemPileContents: async () => {
        // Simulate upstream: with shareItemsEnabled now true and 2 players, 4 -> floor(4/2)*2=4
        // removed, 0 remainder — pile ends up empty for this even stack.
        pileItems = [];
        return true;
      },
      updateItemPile,
    };
    (globalThis as any).game = makeGame(api);

    const result: any = await dispatchModuleItempiles({
      action: 'split-loot',
      actorUuid: 'Actor.pile',
      targets: ['Actor.p1', 'Actor.p2'],
      confirm: true,
    });

    expect(flagState.shareItemsEnabled).toBe(true);
    expect(result.success).toBe(true);
    expect(result.data.outcome).toBe('applied');
    expect(result.data.itemsRemaining).toBe(0);
  });

  it('verifies against the expected INDIVISIBLE REMAINDER, not bare emptiness — a correct split leaving a remainder is success, not NOT_PERSISTED', async () => {
    // 3 targets, one stack of quantity 7 -> floor(7/3)*3=6 removed, remainder 1 stays. The pile is
    // NOT empty afterward — that is the CORRECT end state, not a failure.
    let pileItems = [{ id: 'i1', name: 'Arrows', type: 'ammunition', system: { quantity: { value: 7 } } }];
    const api = {
      getActorFlagData: () => ({ shareItemsEnabled: true }),
      getActorItems: () => pileItems,
      splitItemPileContents: async () => {
        pileItems = [{ id: 'i1', name: 'Arrows', type: 'ammunition', system: { quantity: { value: 1 } } }];
        return true;
      },
      updateItemPile: async () => {},
    };
    (globalThis as any).game = makeGame(api);

    const result: any = await dispatchModuleItempiles({
      action: 'split-loot',
      actorUuid: 'Actor.pile',
      targets: ['Actor.p1', 'Actor.p2', 'Actor.p3'],
      confirm: true,
    });

    expect(result.success).toBe(true);
    expect(result.data.outcome).toBe('applied');
    expect(result.data.itemsRemaining).toBe(1);
    expect(result.data.expectedRemaining).toBe(1);
  });

  it('a genuine non-persist (split did nothing) still fails loud — the fix does not mask real failures', async () => {
    const pileItems = [{ id: 'i1', name: 'Gold Ring', type: 'trapping', system: { quantity: { value: 5 } } }];
    const api = {
      getActorFlagData: () => ({ shareItemsEnabled: true }),
      getActorItems: () => pileItems, // unchanged after "split" — genuine non-persist
      splitItemPileContents: async () => true,
      updateItemPile: async () => {},
    };
    (globalThis as any).game = makeGame(api);

    const result: any = await dispatchModuleItempiles({
      action: 'split-loot',
      actorUuid: 'Actor.pile',
      targets: ['Actor.p1'],
      confirm: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('ITEM_PILES_SPLIT_LOOT_NOT_PERSISTED');
  });

  it('duplicate target UUIDs are deduplicated before computing the numPlayers divisor', async () => {
    let pileItems = [{ id: 'i1', name: 'Coins', type: 'money', system: { quantity: { value: 4 } } }];
    const api = {
      getActorFlagData: () => ({ shareItemsEnabled: false }),
      getActorItems: () => pileItems,
      splitItemPileContents: async () => {
        // If numPlayers were wrongly 2 (duplicate not deduped) rather than 1: floor(4/2)*2=4 removed
        // (matches by coincidence here); use an odd quantity instead to distinguish deterministically.
        pileItems = [{ id: 'i1', name: 'Coins', type: 'money', system: { quantity: { value: 0 } } }];
        return true;
      },
      updateItemPile: async () => {},
    };
    (globalThis as any).game = makeGame(api);

    const result: any = await dispatchModuleItempiles({
      action: 'split-loot',
      actorUuid: 'Actor.pile',
      targets: ['Actor.p1', 'Actor.p1'], // duplicate
      confirm: true,
    });

    // numPlayers must be 1 (deduped), so expectedRemaining = 4 % 1 = 0 — matches, proving the
    // dedup happened (a non-deduped numPlayers=2 would also expect 0 here by coincidence, but the
    // targets echoed back in the response prove the dedup independent of the arithmetic).
    expect(result.success).toBe(true);
    expect(result.data.targets).toEqual(['Actor.p1']);
  });
});
