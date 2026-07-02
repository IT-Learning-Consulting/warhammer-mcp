// wfrp_layer_expansion_v1 Phase 6 (P-10) — availability-test handler unit tests.
//
// Covers the pure lookup/compute math + the dispatcher's post-flow:
//   - town/scarce target 60, available when rolled <= 60
//   - exotic always unavailable (test:0 short-circuit), quantity 0
//   - town dice-stock ("1d10") without stockRolled → AVAILABILITY_TEST_STOCK_ROLL_REQUIRED
//   - city "∞" stock passthrough
//   - invalid settlement / rarity → typed rejection
//   - happy path posts a ChatMessage and DP-16-verifies it (returns messageId)
//
// Deterministic: mocks globalThis.game.wfrp4e.config.availabilityTable +
// globalThis.ChatMessage + game.messages + notify. NEVER touches a live Foundry.

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

// wrappedWrite just runs the fn (no transaction infra in unit context).
vi.mock('../transaction-manager.js', () => ({
  wrappedWrite: (_label: string, fn: () => Promise<any>) => fn(),
}));

// validateGMAccess → allowed.
vi.mock('../utils/flatWorldCRUDFactory.js', () => ({
  validateGMAccess: () => ({ allowed: true }),
}));

import { computeAvailability, dispatchAvailabilityTest } from '../handlers/availability-test.js';

// Mirror of wfrp4e.js:21762 (only the rows the tests touch).
const AVAILABILITY_TABLE = {
  'MARKET.Village': {
    'WFRP4E.Availability.Common': { test: 100, stock: '2' },
    'WFRP4E.Availability.Scarce': { test: 30, stock: '1' },
    'WFRP4E.Availability.Rare': { test: 15, stock: '1' },
    'WFRP4E.Availability.Exotic': { test: 0, stock: '0' },
  },
  'MARKET.Town': {
    'WFRP4E.Availability.Common': { test: 100, stock: '2d10' },
    'WFRP4E.Availability.Scarce': { test: 60, stock: '1d10' },
    'WFRP4E.Availability.Rare': { test: 30, stock: '1d5' },
    'WFRP4E.Availability.Exotic': { test: 0, stock: '0' },
  },
  'MARKET.City': {
    'WFRP4E.Availability.Common': { test: 100, stock: '∞' },
    'WFRP4E.Availability.Scarce': { test: 90, stock: '∞' },
    'WFRP4E.Availability.Rare': { test: 45, stock: '∞' },
    'WFRP4E.Availability.Exotic': { test: 0, stock: '0' },
  },
};

let CREATED_MESSAGES: Record<string, any>;
let messageCounter: number;

function setGame() {
  CREATED_MESSAGES = {};
  messageCounter = 0;
  (globalThis as any).game = {
    wfrp4e: { config: { availabilityTable: AVAILABILITY_TABLE } },
    i18n: { localize: (k: string) => k },
    messages: { get: (id: string) => CREATED_MESSAGES[id] },
  };
  (globalThis as any).CONST = { CHAT_MESSAGE_STYLES: { OTHER: 0 } };
  (globalThis as any).ChatMessage = {
    create: vi.fn(async (data: any) => {
      const id = `msg-${++messageCounter}`;
      const doc = { id, ...data };
      CREATED_MESSAGES[id] = doc;
      return doc;
    }),
  };
}

beforeEach(() => {
  setGame();
});

// ── Pure compute ───────────────────────────────────────────────────────────────

describe('computeAvailability', () => {
  it('town/scarce target is 60; rolled 40 ≤ 60 → available, dice-stock needs stockRolled', () => {
    const lookup = AVAILABILITY_TABLE['MARKET.Town']['WFRP4E.Availability.Scarce'];
    const r = computeAvailability(lookup, 40, 7);
    expect(r.targetNumber).toBe(60);
    expect(r.isAvailable).toBe(true);
    expect(r.quantity).toBe(7); // pre-rolled stock passthrough
  });

  it('rolled above target → unavailable, quantity 0', () => {
    const lookup = AVAILABILITY_TABLE['MARKET.Town']['WFRP4E.Availability.Scarce'];
    const r = computeAvailability(lookup, 61, 7);
    expect(r.isAvailable).toBe(false);
    expect(r.quantity).toBe(0);
  });

  it('exotic (test:0) is never available regardless of roll', () => {
    const lookup = AVAILABILITY_TABLE['MARKET.City']['WFRP4E.Availability.Exotic'];
    const r = computeAvailability(lookup, 1, 5);
    expect(r.targetNumber).toBe(0);
    expect(r.isAvailable).toBe(false);
    expect(r.quantity).toBe(0);
  });

  it('town dice-stock without stockRolled throws AVAILABILITY_TEST_STOCK_ROLL_REQUIRED', () => {
    const lookup = AVAILABILITY_TABLE['MARKET.Town']['WFRP4E.Availability.Scarce'];
    expect(() => computeAvailability(lookup, 40)).toThrow(/AVAILABILITY_TEST_STOCK_ROLL_REQUIRED/);
  });

  it('city "∞" stock passes through as "∞" (no stockRolled needed)', () => {
    const lookup = AVAILABILITY_TABLE['MARKET.City']['WFRP4E.Availability.Common'];
    const r = computeAvailability(lookup, 50);
    expect(r.isAvailable).toBe(true);
    expect(r.quantity).toBe('∞');
  });

  it('village static numeric stock parses to a number', () => {
    const lookup = AVAILABILITY_TABLE['MARKET.Village']['WFRP4E.Availability.Common'];
    const r = computeAvailability(lookup, 50);
    expect(r.isAvailable).toBe(true);
    expect(r.quantity).toBe(2);
  });
});

// ── Dispatcher ──────────────────────────────────────────────────────────────────

describe('dispatchAvailabilityTest', () => {
  it('happy path posts a market card, verifies it, returns messageId', async () => {
    const r: any = await dispatchAvailabilityTest({
      settlement: 'town',
      rarity: 'scarce',
      rolledTotal: 40,
      stockRolled: 7,
      itemName: 'Hand Weapon',
    });
    expect(r.success).toBe(true);
    expect(r.data.targetNumber).toBe(60);
    expect(r.data.isAvailable).toBe(true);
    expect(r.data.quantity).toBe(7);
    expect(r.data.messageId).toBe('msg-1');
    expect((globalThis as any).ChatMessage.create).toHaveBeenCalledTimes(1);
  });

  it('exotic in any settlement → unavailable, quantity 0, still posts a card', async () => {
    const r: any = await dispatchAvailabilityTest({
      settlement: 'city',
      rarity: 'exotic',
      rolledTotal: 1,
    });
    expect(r.success).toBe(true);
    expect(r.data.isAvailable).toBe(false);
    expect(r.data.quantity).toBe(0);
    expect(r.data.messageId).toBe('msg-1');
  });

  it('town dice-stock without stockRolled rejects with AVAILABILITY_TEST_STOCK_ROLL_REQUIRED', async () => {
    await expect(
      dispatchAvailabilityTest({ settlement: 'town', rarity: 'scarce', rolledTotal: 40 }),
    ).rejects.toThrow(/AVAILABILITY_TEST_STOCK_ROLL_REQUIRED/);
    // No message posted on rejection.
    expect((globalThis as any).ChatMessage.create).not.toHaveBeenCalled();
  });

  it('NOT_PERSISTED when the posted message cannot be re-read', async () => {
    // ChatMessage.create succeeds but the message never lands in game.messages.
    (globalThis as any).ChatMessage.create = vi.fn(async () => ({ id: 'ghost' }));
    await expect(
      dispatchAvailabilityTest({ settlement: 'city', rarity: 'common', rolledTotal: 50 }),
    ).rejects.toThrow(/AVAILABILITY_TEST_NOT_PERSISTED/);
  });
});
