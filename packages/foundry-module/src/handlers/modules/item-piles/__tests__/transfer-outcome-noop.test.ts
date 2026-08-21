// BUG-780 — transfer-items and transfer-currency (mode:"all") hard-coded a successful DTO even
// when upstream resolved nothing to move: transfer-items always set `dto.ok:true` regardless of
// the resolved array, and transfer-currency mode:"all" could derive `dto.ok:false` from empty
// deltas but still returned `success:true`. Same false-success class as trade-items
// (trade-items-noop.test.ts).

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleTransferItems, handleTransferCurrency } from '../flow.js';

function mockGlobals(api: any) {
  (globalThis as any).game = {
    user: { isGM: true },
    users: [{ isGM: true, active: true }],
  };
  (globalThis as any).game.itempiles = { API: api };
}

afterEach(() => {
  delete (globalThis as any).game;
});

describe('handleTransferItems — BUG-780 empty/no-op verification', () => {
  it('reports outcome:"noop" with a reason when nothing resolves to transfer', async () => {
    mockGlobals({
      getActorItems: () => [],
      transferItems: vi.fn().mockResolvedValue([]),
    });

    const result: any = await handleTransferItems({
      action: 'transfer-items',
      sourceUuid: 'Actor.source',
      targetUuid: 'Actor.target',
      items: [],
    } as any);

    expect(result.success).toBe(true);
    expect(result.data.outcome).toBe('noop');
    expect(typeof result.data.reason).toBe('string');
  });

  it('still reports outcome:"applied" (regression guard) when items actually move', async () => {
    mockGlobals({
      getActorItems: () => [],
      transferItems: vi.fn().mockResolvedValue([{ itemId: 'sw1', quantity: 1 }]),
    });

    const result: any = await handleTransferItems({
      action: 'transfer-items',
      sourceUuid: 'Actor.source',
      targetUuid: 'Actor.target',
      items: [{ _id: 'sw1' }],
    } as any);

    expect(result.success).toBe(true);
    expect(result.data.outcome).toBe('applied');
    expect(result.data.reason).toBeUndefined();
  });
});

describe('handleTransferCurrency mode:"all" — BUG-780 empty/no-op verification', () => {
  it('reports outcome:"noop" with a reason when upstream resolves empty deltas (BUG-428 class)', async () => {
    mockGlobals({
      getActorCurrencies: () => [],
      transferAllCurrencies: vi.fn().mockResolvedValue({ itemDeltas: [], attributeDeltas: {} }),
    });

    const result: any = await handleTransferCurrency({
      action: 'transfer-currency',
      sourceUuid: 'Actor.source',
      targetUuid: 'Actor.target',
      mode: 'all',
      confirm: true,
    } as any);

    expect(result.success).toBe(true);
    expect(result.data.outcome).toBe('noop');
    expect(typeof result.data.reason).toBe('string');
  });

  it('still reports outcome:"applied" (regression guard) when currency actually moves', async () => {
    // DP-16 verify requires the target's currencies to actually CHANGE post-transfer.
    let targetCurrencies: any[] = [];
    mockGlobals({
      getActorCurrencies: () => targetCurrencies,
      transferAllCurrencies: vi.fn().mockImplementation(async () => {
        targetCurrencies = [{ abbreviation: 'gc', quantity: 5, exchangeRate: 1, type: 'item' }];
        return { itemDeltas: [{ abbreviation: 'gc', quantity: 5 }], attributeDeltas: {} };
      }),
      CURRENCIES: [{ abbreviation: 'gc', exchangeRate: 1 }],
    });

    const result: any = await handleTransferCurrency({
      action: 'transfer-currency',
      sourceUuid: 'Actor.source',
      targetUuid: 'Actor.target',
      mode: 'all',
      confirm: true,
    } as any);

    expect(result.success).toBe(true);
    expect(result.data.outcome).toBe('applied');
    expect(result.data.reason).toBeUndefined();
  });
});
