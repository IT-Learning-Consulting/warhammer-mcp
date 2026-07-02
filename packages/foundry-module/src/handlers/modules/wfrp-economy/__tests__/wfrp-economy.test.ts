// Module Integration v2 Phase 6 — Unit tests for module-wfrp-economy dispatcher + guards.
//
// Deterministic: mocks globalThis.game (modules / user / settings / actors / financial.wallet) and injects
// a fake runtime import via globalThis.__wfrpEconomyRuntimeImport so the DIRECT SocketHandler dispatch is
// coverable without a live Foundry. No canvas / no UI.
//
// Coverage (Rule 9 — each test encodes WHY the behavior matters):
//   1. Inactive wfrp4e-economy → MODULE_NOT_ACTIVE for read AND write (guard returns, never throws).
//      WHY: a tool fired in a world without wfrp4e-economy must fail with the typed token, not crash.
//   2. A write fired by a non-GM → WFRP_ECONOMY_ACCESS_DENIED. WHY: the module fns self-no-op for non-GM,
//      which our read-back would surface as NOT_PERSISTED — reject early with the precise token instead.
//   3. delete-economy / large transfer WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, BEFORE any write.
//      WHY: CCR-4 — destructive/large ops gate on confirm, and the reject must precede the mutation.
//   4. delete-economy WITH confirm:true removes the economy + related stores. WHY: the confirmed path works.
//   5. ROUTING DEVIATIONS — sell-stock calls processStockSale (NOT broadcastStockSale, the BUG-A path);
//      transfer calls _handleTransferProcess (NOT processTransfer, the double-invoke path); request-loan
//      calls _handleLoanProcess (NOT processLoan, the await-dropping path). WHY: the whole HC-v2-7 thesis is
//      that we drive the AWAITED direct methods and never the broken/fire-and-forget wrappers.
//   6. A write whose mocked read-back mismatches → WFRP_ECONOMY_NOT_PERSISTED. WHY: DP-16 must catch a
//      silently no-op'ing write (Document/settings success ≠ persistence proof).
//   7. An unknown action → WFRP_ECONOMY_INVALID_INPUT (discriminatedUnion reject).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { dispatchModuleWfrpEconomy } from '../wfrp-economy.js';

const ECO = 'eco1';

function makeSettings(seed: Record<string, any> = {}) {
  const store: Record<string, any> = {
    economies: [],
    bankers: {},
    bankAccounts: {},
    stockPortfolios: {},
    transactionLogs: [],
    ...seed,
  };
  const settings = {
    get: (_s: string, k: string) => store[k],
    set: vi.fn(async (_s: string, k: string, v: any) => {
      store[k] = v;
    }),
  };
  return { settings, store };
}

function makeGame(opts: {
  active: boolean;
  isGM?: boolean;
  settings?: any;
  actors?: Record<string, any>;
  wallet?: any;
}) {
  const actors = opts.actors ?? {};
  return {
    modules: {
      get: (id: string) =>
        id === 'wfrp4e-economy'
          ? opts.active
            ? { active: true, title: 'Warhammer Economy', version: '1.0.0' }
            : undefined
          : undefined,
    },
    user: { isGM: opts.isGM ?? true, id: 'gm1' },
    settings: opts.settings,
    actors: { get: (id: string) => actors[id] },
    financial: { wallet: opts.wallet },
  };
}

beforeEach(() => {
  (globalThis as any).game = undefined;
});
afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).__wfrpEconomyRuntimeImport;
});

// ── 1. Inactive module guard ────────────────────────────────────────────────────

describe('module-active guard', () => {
  it('inactive wfrp4e-economy → MODULE_NOT_ACTIVE on a write action (returns, never throws)', async () => {
    (globalThis as any).game = makeGame({ active: false });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'set-rented', economyId: ECO, propertyId: 'p1', rented: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
    expect(res.error).toContain('wfrp4e-economy');
  });

  it('inactive wfrp4e-economy → MODULE_NOT_ACTIVE on a read action too', async () => {
    (globalThis as any).game = makeGame({ active: false });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'list-economies' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
  });
});

// ── 2. GM gate ──────────────────────────────────────────────────────────────────

describe('GM gate', () => {
  it('a write action fired by a non-GM → WFRP_ECONOMY_ACCESS_DENIED', async () => {
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ active: true, isGM: false, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'deposit', economyId: ECO, accountId: 'a1', amountBp: 100 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_ACCESS_DENIED');
  });
});

// ── 3/4. Confirm-gated delete-economy + large transfer ────────────────────────────

describe('confirm gates (CCR-4)', () => {
  it('delete-economy WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED and economy untouched', async () => {
    const { settings, store } = makeSettings({ economies: [{ id: ECO, name: 'Reikland', banks: [], properties: [], stocks: [] }] });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'delete-economy', economyId: ECO });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(store.economies).toHaveLength(1); // not deleted
    expect(settings.set).not.toHaveBeenCalled();
  });

  it('delete-economy WITH confirm:true removes the economy', async () => {
    const { settings, store } = makeSettings({ economies: [{ id: ECO, name: 'Reikland', banks: [], properties: [], stocks: [] }] });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'delete-economy', economyId: ECO, confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.deleted).toBe(true);
    expect(store.economies).toHaveLength(0);
  });

  it('large transfer (>= 4800 BP) WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, module never called', async () => {
    const { settings } = makeSettings({
      economies: [{ id: ECO, name: 'Reikland', currency: 'Gold Crowns', banks: [{ id: 'b1', name: 'Reik Bank' }], properties: [], stocks: [] }],
      bankAccounts: { acc1: { id: 'acc1', actorId: 'a1', bankId: 'b1', economyId: ECO, balance: 100000 }, acc2: { id: 'acc2', actorId: 'a2', bankId: 'b1', economyId: ECO, balance: 0 } },
    });
    const _handleTransferProcess = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ SocketHandler: { _handleTransferProcess } });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'transfer', economyId: ECO, sourceAccountId: 'acc1', destinationAccountId: 'acc2', amountBp: 5000 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(_handleTransferProcess).not.toHaveBeenCalled();
  });
});

// ── 5. Routing deviations (the HC-v2-7 thesis) ────────────────────────────────────

describe('routing deviations — direct awaited methods, never the broken wrappers', () => {
  it('sell-stock calls processStockSale and NOT broadcastStockSale (BUG-A bypass)', async () => {
    const { settings, store } = makeSettings({
      economies: [{ id: ECO, name: 'Reikland', currency: 'Gold Crowns', banks: [{ id: 'b1', name: 'Reik Bank' }], properties: [], stocks: [{ id: 'stk1', name: 'Reik Salt', symbol: 'SALT', currentPrice: 12, availableShares: 100 }] }],
      bankAccounts: { acc1: { id: 'acc1', actorId: 'a1', bankId: 'b1', economyId: ECO, balance: 1000 } },
      stockPortfolios: { 'a1-eco1': { stk1: 5 } },
    });
    const processStockSale = vi.fn(async (data: any) => {
      store.stockPortfolios['a1-eco1'][data.stockId] -= data.quantity;
      if (store.stockPortfolios['a1-eco1'][data.stockId] <= 0) delete store.stockPortfolios['a1-eco1'][data.stockId];
    });
    const broadcastStockSale = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ SocketHandler: { processStockSale, broadcastStockSale } });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Salzenmund' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'sell-stock', economyId: ECO, accountId: 'acc1', stockId: 'stk1', quantity: 5 });
    expect(res.success).toBe(true);
    expect(processStockSale).toHaveBeenCalledTimes(1);
    expect(broadcastStockSale).not.toHaveBeenCalled();
    expect(res.data.holding).toBe(0);
  });

  it('transfer calls _handleTransferProcess and NOT processTransfer (double-invoke bypass)', async () => {
    const { settings, store } = makeSettings({
      economies: [{ id: ECO, name: 'Reikland', currency: 'Gold Crowns', banks: [{ id: 'b1', name: 'Reik Bank' }], properties: [], stocks: [] }],
      bankAccounts: { acc1: { id: 'acc1', actorId: 'a1', bankId: 'b1', economyId: ECO, balance: 1000 }, acc2: { id: 'acc2', actorId: 'a2', bankId: 'b1', economyId: ECO, balance: 0 } },
    });
    const _handleTransferProcess = vi.fn(async (data: any) => {
      store.bankAccounts[data.sourceAccountId].balance -= data.amount;
      store.bankAccounts[data.destinationAccountId].balance += data.amount;
    });
    const processTransfer = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ SocketHandler: { _handleTransferProcess, processTransfer } });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'transfer', economyId: ECO, sourceAccountId: 'acc1', destinationAccountId: 'acc2', amountBp: 100 });
    expect(res.success).toBe(true);
    expect(_handleTransferProcess).toHaveBeenCalledTimes(1);
    expect(processTransfer).not.toHaveBeenCalled();
    expect(res.data.sourceBalance).toBe(900);
    expect(res.data.destinationBalance).toBe(100);
  });

  it('request-loan calls _handleLoanProcess and NOT processLoan (await-drop bypass)', async () => {
    const { settings, store } = makeSettings({
      economies: [{ id: ECO, name: 'Reikland', currency: 'Gold Crowns', banks: [{ id: 'b1', name: 'Reik Bank', loanRate: 5 }], properties: [], stocks: [] }],
      bankAccounts: { acc1: { id: 'acc1', actorId: 'a1', bankId: 'b1', economyId: ECO, balance: 0 } },
    });
    const _handleLoanProcess = vi.fn(async (data: any) => {
      store.bankAccounts[data.accountId].loan = { amount: data.amount, interest: 5, active: true };
      store.bankAccounts[data.accountId].balance += data.amount;
    });
    const processLoan = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ SocketHandler: { _handleLoanProcess, processLoan } });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Debtor' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'request-loan', economyId: ECO, accountId: 'acc1', amountBp: 240 });
    expect(res.success).toBe(true);
    expect(_handleLoanProcess).toHaveBeenCalledTimes(1);
    expect(processLoan).not.toHaveBeenCalled();
    expect(res.data.loanActive).toBe(true);
    expect(res.data.loanAmount).toBe(240);
  });

  it('repay-loan (partial) verifies against a PRIMITIVE before-snapshot, not the mutated-in-place reference (aliasing regression)', async () => {
    // settings.get returns the LIVE store reference, so the mock's in-place mutation aliases the handler's
    // retained `account` — exactly the production trap. With the pre-fix code, `account.balance` read 1200
    // post-call → expected 960 ≠ 1200 → false WFRP_ECONOMY_NOT_PERSISTED. The primitive snapshot fixes it.
    const { settings, store } = makeSettings({
      economies: [{ id: ECO, name: 'Reikland', currency: 'Gold Crowns', banks: [{ id: 'b1', name: 'Reik Bank', loanRate: 10 }], properties: [], stocks: [] }],
      bankAccounts: { acc1: { id: 'acc1', actorId: 'a1', bankId: 'b1', economyId: ECO, balance: 1440, loan: { amount: 240, interest: 10, active: true } } },
    });
    const _handleLoanProcess = vi.fn(async (data: any) => {
      const acc = store.bankAccounts[data.accountId]; // SAME object the handler retains (aliasing)
      acc.balance -= data.amount;
      const principalPaid = data.amount / (1 + acc.loan.interest / 100);
      acc.loan.amount = Math.max(0, acc.loan.amount - principalPaid);
      if (acc.loan.amount < 0.01) acc.loan.active = false;
    });
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ SocketHandler: { _handleLoanProcess } });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Debtor' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'repay-loan', economyId: ECO, accountId: 'acc1', amountBp: 240 });
    expect(res.success).toBe(true);
    expect(res.data.accountBalance).toBe(1200); // 1440 − 240; would be the false-fail point pre-fix
    expect(res.data.loanCleared).toBe(false); // 240 < totalOwed 264 → partial
    expect(res.data.loanActive).toBe(true);
    expect(res.data.totalOwed).toBeCloseTo(264);
    expect(res.data.loanAmount).toBeGreaterThan(0);
    expect(res.data.loanAmount).toBeLessThan(240);
  });

  it('repay-loan (amount = totalOwed) clears the loan', async () => {
    const { settings, store } = makeSettings({
      economies: [{ id: ECO, name: 'Reikland', currency: 'Gold Crowns', banks: [{ id: 'b1', name: 'Reik Bank', loanRate: 10 }], properties: [], stocks: [] }],
      bankAccounts: { acc1: { id: 'acc1', actorId: 'a1', bankId: 'b1', economyId: ECO, balance: 1440, loan: { amount: 240, interest: 10, active: true } } },
    });
    const _handleLoanProcess = vi.fn(async (data: any) => {
      const acc = store.bankAccounts[data.accountId];
      acc.balance -= data.amount;
      const totalOwed = acc.loan.amount + (acc.loan.amount * acc.loan.interest) / 100;
      if (data.amount >= totalOwed) acc.loan.active = false;
    });
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ SocketHandler: { _handleLoanProcess } });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Debtor' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'repay-loan', economyId: ECO, accountId: 'acc1', amountBp: 264 });
    expect(res.success).toBe(true);
    expect(res.data.loanCleared).toBe(true);
    expect(res.data.loanActive).toBe(false);
    expect(res.data.accountBalance).toBe(1176); // 1440 − 264
  });

  it('repay-loan rejects an amount above total owed BEFORE calling the module', async () => {
    const { settings } = makeSettings({
      economies: [{ id: ECO, name: 'Reikland', currency: 'Gold Crowns', banks: [{ id: 'b1', name: 'Reik Bank', loanRate: 10 }], properties: [], stocks: [] }],
      bankAccounts: { acc1: { id: 'acc1', actorId: 'a1', bankId: 'b1', economyId: ECO, balance: 5000, loan: { amount: 240, interest: 10, active: true } } },
    });
    const _handleLoanProcess = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ SocketHandler: { _handleLoanProcess } });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Debtor' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'repay-loan', economyId: ECO, accountId: 'acc1', amountBp: 300 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('exceeds total owed');
    expect(_handleLoanProcess).not.toHaveBeenCalled();
  });
});

// ── 6. DP-16 read-back ────────────────────────────────────────────────────────────

describe('post-write read-back (DP-16)', () => {
  it('a deposit whose mocked module call no-ops → WFRP_ECONOMY_NOT_PERSISTED', async () => {
    const { settings } = makeSettings({
      economies: [{ id: ECO, name: 'Reikland', currency: 'Gold Crowns', banks: [{ id: 'b1', name: 'Reik Bank' }], properties: [], stocks: [] }],
      bankAccounts: { acc1: { id: 'acc1', actorId: 'a1', bankId: 'b1', economyId: ECO, balance: 0 } },
    });
    const TransactionProcess = vi.fn(async () => undefined); // silently does nothing (the trap)
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ SocketHandler: { TransactionProcess } });
    (globalThis as any).game = makeGame({
      active: true,
      settings,
      actors: { a1: { name: 'Saver' } },
      wallet: { getBalance: () => 10000, addFunds: vi.fn(), removeFunds: vi.fn() },
    });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'deposit', economyId: ECO, accountId: 'acc1', amountBp: 240 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
    expect(TransactionProcess).toHaveBeenCalledTimes(1); // it WAS attempted; the read-back caught the no-op
  });
});

// ── 7. discriminatedUnion rejects an off-list action ──────────────────────────────

describe('schema discriminatedUnion', () => {
  it('an unknown action is rejected at parse → WFRP_ECONOMY_INVALID_INPUT', async () => {
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'advance-day', economyId: ECO });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_INVALID_INPUT');
  });
});
