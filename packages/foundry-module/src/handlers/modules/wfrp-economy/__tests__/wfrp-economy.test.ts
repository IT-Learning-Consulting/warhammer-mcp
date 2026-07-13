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
import { dispatchModuleWfrpEconomy, rebucketEconomySummary } from '../wfrp-economy.js';

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
      economies: [{ id: ECO, name: 'Reikland', currency: 'Gold Crowns', banks: [{ id: 'b1', name: 'Reik Bank', loanRate: 0.05 }], properties: [], stocks: [] }],
      bankAccounts: { acc1: { id: 'acc1', actorId: 'a1', bankId: 'b1', economyId: ECO, balance: 0 } },
    });
    const _handleLoanProcess = vi.fn(async (data: any) => {
      // Mirrors socket-handler.js:778-781 — loan.interest stored as a FRACTION (interestRate ?? bank default 0.05).
      store.bankAccounts[data.accountId].loan = { amount: data.amount, interest: data.interestRate ?? 0.05, active: true };
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

  it('request-loan converts the published PERCENT interestRate input to the module FRACTION convention (BUG-542 class)', async () => {
    const { settings, store } = makeSettings({
      economies: [{ id: ECO, name: 'Reikland', currency: 'Gold Crowns', banks: [{ id: 'b1', name: 'Reik Bank', loanRate: 0.1 }], properties: [], stocks: [] }],
      bankAccounts: { acc1: { id: 'acc1', actorId: 'a1', bankId: 'b1', economyId: ECO, balance: 0 } },
    });
    const _handleLoanProcess = vi.fn(async (data: any) => {
      store.bankAccounts[data.accountId].loan = { amount: data.amount, interest: data.interestRate ?? 0.05, active: true };
      store.bankAccounts[data.accountId].balance += data.amount;
    });
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ SocketHandler: { _handleLoanProcess } });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Debtor' } } });
    // Published contract: interestRate is a percent (5 = 5%). Module storage: fraction (0.05).
    const res: any = await dispatchModuleWfrpEconomy({ action: 'request-loan', economyId: ECO, accountId: 'acc1', amountBp: 240, interestRate: 5 });
    expect(res.success).toBe(true);
    expect(_handleLoanProcess).toHaveBeenCalledWith(expect.objectContaining({ interestRate: 0.05 }));
    expect(store.bankAccounts.acc1.loan.interest).toBe(0.05);
  });

  it('repay-loan (partial) verifies against a PRIMITIVE before-snapshot, not the mutated-in-place reference (aliasing regression)', async () => {
    // settings.get returns the LIVE store reference, so the mock's in-place mutation aliases the handler's
    // retained `account` — exactly the production trap. With the pre-fix code, `account.balance` read 1200
    // post-call → expected 960 ≠ 1200 → false WFRP_ECONOMY_NOT_PERSISTED. The primitive snapshot fixes it.
    const { settings, store } = makeSettings({
      economies: [{ id: ECO, name: 'Reikland', currency: 'Gold Crowns', banks: [{ id: 'b1', name: 'Reik Bank', loanRate: 0.1 }], properties: [], stocks: [] }],
      bankAccounts: { acc1: { id: 'acc1', actorId: 'a1', bankId: 'b1', economyId: ECO, balance: 1440, loan: { amount: 240, interest: 0.1, active: true } } },
    });
    const _handleLoanProcess = vi.fn(async (data: any) => {
      const acc = store.bankAccounts[data.accountId]; // SAME object the handler retains (aliasing)
      acc.balance -= data.amount;
      // Mirrors socket-handler.js:840 — interest is a FRACTION (BUG-542): principalPaid = amount / (1 + fraction).
      const principalPaid = data.amount / (1 + acc.loan.interest);
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
      economies: [{ id: ECO, name: 'Reikland', currency: 'Gold Crowns', banks: [{ id: 'b1', name: 'Reik Bank', loanRate: 0.1 }], properties: [], stocks: [] }],
      bankAccounts: { acc1: { id: 'acc1', actorId: 'a1', bankId: 'b1', economyId: ECO, balance: 1440, loan: { amount: 240, interest: 0.1, active: true } } },
    });
    const _handleLoanProcess = vi.fn(async (data: any) => {
      const acc = store.bankAccounts[data.accountId];
      acc.balance -= data.amount;
      // Mirrors socket-handler.js:817 — totalOwed = round(amount * (1 + FRACTION interest)) (BUG-542).
      const totalOwed = Math.round(acc.loan.amount * (1 + acc.loan.interest));
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
      economies: [{ id: ECO, name: 'Reikland', currency: 'Gold Crowns', banks: [{ id: 'b1', name: 'Reik Bank', loanRate: 0.1 }], properties: [], stocks: [] }],
      bankAccounts: { acc1: { id: 'acc1', actorId: 'a1', bankId: 'b1', economyId: ECO, balance: 5000, loan: { amount: 240, interest: 0.1, active: true } } },
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

  it('rate out of 1-10 bounds (invest) → WFRP_ECONOMY_INVALID_INPUT', async () => {
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Investor' } }, wallet: { getBalance: () => 100000 } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'invest', actorId: 'a1', rate: 11, amountBp: 240 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_INVALID_INPUT');
  });

  it('d100Roll out of 1-100 bounds (resolve-investment) → WFRP_ECONOMY_INVALID_INPUT', async () => {
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'resolve-investment', investmentId: 'inv1', d100Roll: 101, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_INVALID_INPUT');
  });
});

// ── 8. banking-and-income (Phase 5) — engine delegation via importBankingEngine ────
//
// The engine (src/banking/banking-engine.js) is a fork file, not TS — these tests only prove the MCP-side
// wiring (schema/confirm-gate/delegation/persistence-check surfacing), mirroring the levy-and-burn
// engine-contract pattern. Provenance: engine return shapes cited match the contract comment atop
// wfrp-economy.ts (task 1.2 of wfrp-economy-phase5-banking-interest.md), NOT an invented mock (PF-003).
// Engine return-statement anchors (banking-engine.js): investDeposit :97 · resolveInvestment
// bankrupt :135-138 / payout :172 · listInvestments :186-196 · stashDeposit :232.

describe('banking-and-income — invest', () => {
  it('WITH sufficient wallet balance delegates to BankingEngine.investDeposit and returns its shape', async () => {
    const { settings } = makeSettings();
    const investDeposit = vi.fn(async (data: any) => ({
      investmentId: 'inv1', principalBp: data.amountBp, walletBalanceBp: 100000 - data.amountBp,
    }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ investDeposit });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Investor' } }, wallet: { getBalance: () => 100000 } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'invest', actorId: 'a1', rate: 6, amountBp: 2400 });
    expect(res.success).toBe(true);
    expect(investDeposit).toHaveBeenCalledTimes(1);
    expect(res.data.investmentId).toBe('inv1');
    expect(res.data.principalBp).toBe(2400);
    expect(res.data.walletBalanceBp).toBe(97600);
  });

  it('amountBp exceeding wallet balance → WFRP_ECONOMY_NOT_PERSISTED, engine never called', async () => {
    const { settings } = makeSettings();
    const investDeposit = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ investDeposit });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Investor' } }, wallet: { getBalance: () => 100 } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'invest', actorId: 'a1', rate: 6, amountBp: 2400 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
    expect(investDeposit).not.toHaveBeenCalled();
  });

  // G1 (Phase 5b): the handler's own pre-check above already guards this in practice, but the engine's
  // insufficientFunds verdict shape must still surface correctly if that pre-check is ever loosened.
  it('engine insufficientFunds verdict (defensive path) → WFRP_ECONOMY_NOT_PERSISTED', async () => {
    const { settings } = makeSettings();
    const investDeposit = vi.fn(async () => ({ insufficientFunds: true, walletBalanceBp: 100, requiredBp: 2400 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ investDeposit });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Investor' } }, wallet: { getBalance: () => 100000 } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'invest', actorId: 'a1', rate: 6, amountBp: 2400 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
  });
});

describe('banking-and-income — resolve-investment (confirm-gate, D11)', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never called', async () => {
    const { settings } = makeSettings();
    const resolveInvestment = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ resolveInvestment });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'resolve-investment', investmentId: 'inv1', d100Roll: 50 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(resolveInvestment).not.toHaveBeenCalled();
  });

  it('WITH confirm:true and d100Roll <= rate → bankrupt verdict surfaced', async () => {
    const { settings } = makeSettings();
    const resolveInvestment = vi.fn(async () => ({
      actorId: 'a1', actorName: 'Investor', bankrupt: true, payoutBp: 0, principalBp: 2400, accruedBp: 144, walletBalanceBp: 0,
    }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ resolveInvestment });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'resolve-investment', investmentId: 'inv1', d100Roll: 4, confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.bankrupt).toBe(true);
    expect(res.data.payoutBp).toBe(0);
  });

  it('WITH confirm:true and d100Roll > rate → payout verdict surfaced', async () => {
    const { settings } = makeSettings();
    const resolveInvestment = vi.fn(async () => ({
      actorId: 'a1', actorName: 'Investor', bankrupt: false, payoutBp: 2544, principalBp: 2400, accruedBp: 144, walletBalanceBp: 102544,
    }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ resolveInvestment });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'resolve-investment', investmentId: 'inv1', d100Roll: 50, confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.bankrupt).toBe(false);
    expect(res.data.payoutBp).toBe(2544);
    expect(res.data.walletBalanceBp).toBe(102544);
  });

  it('engine notFound → WFRP_ECONOMY_TARGET_NOT_FOUND', async () => {
    const { settings } = makeSettings();
    const resolveInvestment = vi.fn(async () => ({ notFound: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ resolveInvestment });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'resolve-investment', investmentId: 'gone', d100Roll: 50, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
  });

  // G2 (Phase 5b): defensive — the shared Zod schema already constrains d100Roll to an integer 1-100,
  // so this path is unreachable via the MCP surface today, but must still surface correctly if that
  // constraint is ever loosened.
  it('engine invalidRoll verdict (defensive path) → WFRP_ECONOMY_NOT_PERSISTED', async () => {
    const { settings } = makeSettings();
    const resolveInvestment = vi.fn(async () => ({ invalidRoll: true, d100Roll: 0 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ resolveInvestment });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'resolve-investment', investmentId: 'inv1', d100Roll: 50, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
  });
});

describe('banking-and-income — list-investments (read-only)', () => {
  it('projects the engine listInvestments array', async () => {
    const { settings } = makeSettings();
    const listInvestments = vi.fn(async () => [
      { investmentId: 'inv1', actorId: 'a1', actorName: 'Investor', rate: 6, principalBp: 2400, accruedBp: 144, economyId: null, bankId: null, active: true, lastCycleAt: '2026-07-11T00:00:00.000Z' },
    ]);
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ listInvestments });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'list-investments', activeOnly: true });
    expect(res.success).toBe(true);
    expect(listInvestments).toHaveBeenCalledWith({ actorId: undefined, activeOnly: true });
    expect(res.data.count).toBe(1);
    expect(res.data.investments[0].investmentId).toBe('inv1');
    expect(res.data.investments[0].lastCycleAt).toBe('2026-07-11T00:00:00.000Z'); // D9 pass-through
  });
});

// Phase5b validate: rows STORE bankName (engine G4 resolves it via findBank) — the projection must
// surface it, same class as the Phase4-F12 targetActorId/Name drop. Pins the full stored→projected set.
describe('audit-the-ledger — list-transactions projection', () => {
  it('projects bankName (G4) and targetActorId/Name (F12) from stored rows', async () => {
    const { settings } = makeSettings();
    const row = {
      id: 't1', type: 'interest_income', source: 'economy', actorId: 'a1', actorName: 'Investor',
      economyId: 'e1', bankId: 'b1', bankName: 'Smoke Bank', amount: 144, amountDisplay: '0gc 12ss 0bp',
      targetActorId: 'a2', targetActorName: 'Counterparty', enterpriseId: 'ent1',
      description: 'Investment interest accrued', date: 'today',
    };
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ TransactionLogger: { getTransactionLogs: () => [row] } });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'list-transactions', actorId: 'a1' });
    expect(res.success).toBe(true);
    expect(res.data.transactions[0].bankName).toBe('Smoke Bank');
    expect(res.data.transactions[0].targetActorId).toBe('a2');
    expect(res.data.transactions[0].targetActorName).toBe('Counterparty');
    expect(res.data.transactions[0].enterpriseId).toBe('ent1');
  });
});

describe('banking-and-income — stash-deposit / stash-withdraw', () => {
  it('stash-deposit WITH sufficient wallet balance delegates and returns the new stash total', async () => {
    const { settings } = makeSettings();
    const stashDeposit = vi.fn(async (data: any) => ({ stashBalanceBp: data.amountBp, walletBalanceBp: 100000 - data.amountBp }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ stashDeposit });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Stasher' } }, wallet: { getBalance: () => 100000 } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'stash-deposit', actorId: 'a1', amountBp: 480 });
    expect(res.success).toBe(true);
    expect(res.data.stashBalanceBp).toBe(480);
  });

  it('stash-withdraw WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never called', async () => {
    const { settings } = makeSettings();
    const stashWithdraw = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ stashWithdraw });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Stasher' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'stash-withdraw', actorId: 'a1', d100Roll: 50 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(stashWithdraw).not.toHaveBeenCalled();
  });

  it('stash-withdraw WITH confirm:true and d100Roll <= 10 → whole stash lost', async () => {
    const { settings } = makeSettings();
    const stashWithdraw = vi.fn(async () => ({ lost: true, amountBp: 0, walletBalanceBp: 0 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ stashWithdraw });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Stasher' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'stash-withdraw', actorId: 'a1', d100Roll: 7, confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.lost).toBe(true);
    expect(res.data.amountBp).toBe(0);
  });
});

// CYCLE SEMANTICS (Phase 5b, ADR-U3): mocks mirror banking-engine.js accrueInterest's actual return shape
// post-rework (E:\foundry_v13\data\Data\modules\wfrp4e-economy\src\banking\banking-engine.js:298-345) —
// `cycleApplied: true` + `lastCycleAt` ISO stamp, no `monthIndex`. There is no worldTime gate, so there is
// no "caught up, zero-verdict" no-op shape any more — every call accrues (asserted below by calling twice).
describe('banking-and-income — accrue-interest', () => {
  it('dryRun:true previews with the engine result and never requires confirm', async () => {
    const { settings } = makeSettings();
    const accrueInterest = vi.fn(async () => ({
      cycleApplied: true,
      lastCycleAt: '2026-07-11T00:00:00.000Z',
      investmentVerdicts: [{ investmentId: 'inv1', actorId: 'a1', actorName: 'Investor', accruedDeltaBp: 144, accruedBp: 144 }],
      accountVerdicts: [],
      loanReminders: [],
    }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ accrueInterest });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'accrue-interest', dryRun: true });
    expect(res.success).toBe(true);
    expect(accrueInterest).toHaveBeenCalledWith({ economyId: undefined, dryRun: true });
    expect(res.data.dryRun).toBe(true);
    expect(res.data.cycleApplied).toBe(true);
    expect(res.data.lastCycleAt).toBe('2026-07-11T00:00:00.000Z');
    expect(res.data.investmentVerdicts).toHaveLength(1);
  });

  it('two consecutive calls BOTH accrue — no worldTime gate, no caught-up no-op shape', async () => {
    const { settings } = makeSettings();
    const accrueInterest = vi.fn(async () => ({
      cycleApplied: true,
      lastCycleAt: '2026-07-11T00:00:00.000Z',
      investmentVerdicts: [{ investmentId: 'inv1', actorId: 'a1', actorName: 'Investor', accruedDeltaBp: 144, accruedBp: 144 }],
      accountVerdicts: [],
      loanReminders: [],
    }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ accrueInterest });
    (globalThis as any).game = makeGame({ active: true, settings });

    const first: any = await dispatchModuleWfrpEconomy({ action: 'accrue-interest' });
    const second: any = await dispatchModuleWfrpEconomy({ action: 'accrue-interest' });

    expect(first.success).toBe(true);
    expect(first.data.cycleApplied).toBe(true);
    expect(second.success).toBe(true);
    expect(second.data.cycleApplied).toBe(true);
    expect(accrueInterest).toHaveBeenCalledTimes(2);
  });

  it('a persistedCheckFailed verdict → WFRP_ECONOMY_NOT_PERSISTED', async () => {
    const { settings } = makeSettings();
    const accrueInterest = vi.fn(async () => ({
      cycleApplied: true,
      lastCycleAt: '2026-07-11T00:00:00.000Z',
      investmentVerdicts: [{ investmentId: 'inv1', actorId: 'a1', accruedDeltaBp: 0, accruedBp: 0, persistedCheckFailed: true, detail: 'accrued mismatch' }],
      accountVerdicts: [],
      loanReminders: [],
    }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ accrueInterest });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'accrue-interest' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
  });
});

// ── BUG-471: read-side re-bucketing of the module's under-reporting summary ───────
// WHY (Rule 9): the wfrp4e-economy aggregator buckets stock sales by 'stock_sale' (underscore) while
// rows are logged 'stock-sale' (hyphen), and only credits actor loans under targetActorId — so a
// borrower-actor's loan and every hyphen stock-sale silently read 0. This must be corrected at READ.
describe('BUG-471 rebucketEconomySummary', () => {
  afterEach(() => { delete (globalThis as any).game; });

  it('ACTOR: a hyphen stock-sale + a borrower-actor loan produce non-zero totals (both were 0)', () => {
    (globalThis as any).game = {}; // no i18n → recentTransactions untouched
    const summary: any = { totalStockSales: 0, totalLoans: 0, totalStockSalesDisplay: '0 BP', totalLoansDisplay: '0 BP' };
    const logs = [
      { type: 'stock-sale', amount: 480, actorId: 'A' },            // hyphen spelling, actor is seller
      { type: 'loan', amount: 240, actorId: 'A' },                  // borrower-actor loan (module misses it)
      { type: 'deposit', amount: 99, actorId: 'A' },                // unrelated bucket
    ];
    rebucketEconomySummary(summary, logs, { actorId: 'A' });
    expect(summary.totalStockSales).toBe(480);
    expect(summary.totalLoans).toBe(240);
    expect(summary.totalStockSalesDisplay).toBe('480 BP');
    expect(summary.totalLoansDisplay).toBe('240 BP');
  });

  it('ACTOR: sums both stock-sale AND stock_sale spellings, only in scope', () => {
    (globalThis as any).game = {};
    const summary: any = { totalStockSales: 0, totalLoans: 0 };
    const logs = [
      { type: 'stock-sale', amount: 100, targetActorId: 'A' },
      { type: 'stock_sale', amount: 50, actorId: 'A' },
      { type: 'stock-sale', amount: 999, actorId: 'B' }, // out of scope
    ];
    rebucketEconomySummary(summary, logs, { actorId: 'A' });
    expect(summary.totalStockSales).toBe(150);
  });

  it('BANK (no actorId scope): sums all stock sales regardless of actor', () => {
    (globalThis as any).game = {};
    const summary: any = { totalStockSales: 0, totalLoans: 0 };
    const logs = [
      { type: 'stock-sale', amount: 100, actorId: 'A' },
      { type: 'stock_sale', amount: 200, actorId: 'B' },
      { type: 'loan', amount: 240, actorId: 'C' },
    ];
    rebucketEconomySummary(summary, logs, {});
    expect(summary.totalStockSales).toBe(300);
    expect(summary.totalLoans).toBe(240);
  });

  it('localizes a raw i18n-key description (the withdraw row), leaves plain text alone', () => {
    (globalThis as any).game = {
      i18n: { localize: (k: string) => (k === 'financial-system.bank.transactions.withdraw' ? 'Withdrawal' : k) },
    };
    const summary: any = {
      totalStockSales: 0,
      totalLoans: 0,
      recentTransactions: [
        { description: 'financial-system.bank.transactions.withdraw' },
        { description: 'Bought 3× ACME for 90 BP' },
      ],
    };
    rebucketEconomySummary(summary, [], {});
    expect(summary.recentTransactions[0].description).toBe('Withdrawal');
    expect(summary.recentTransactions[1].description).toBe('Bought 3× ACME for 90 BP');
  });
});

// ── legitimate-business-enterprises (Phase 6, wfrp_economy_system) ─────────────
//
// list-enterprises(default)/get-enterprise are PURE READS over the `enterprises` setting store — tested
// directly against the seeded settings store (no runtime-import mock needed), mirroring the module-active
// guard tests above that call list-economies/list-bankers without a __wfrpEconomyRuntimeImport seam. The
// other 7 actions mock only the enterprise-engine.js export(s) each test needs, mirroring the
// banking-and-income describe blocks above (the engine is a fork .js file, not TS — these tests prove the
// MCP-side wiring, not the engine's own arithmetic).

describe('legitimate-business-enterprises — list-enterprises / get-enterprise (direct settings read)', () => {
  it('list-enterprises (default) projects the enterprises store directly, no engine import needed', async () => {
    const { settings } = makeSettings({
      enterprises: {
        profiles: {},
        instances: {
          ent1: {
            id: 'ent1', name: 'The Salty Dog', profileId: 'tavern', backing: 'data-only', actorUuid: null,
            ownerActorId: 'a1', level: 1, upkeep: 240, debt: { principal: 480, escalationTier: 0 },
          },
        },
      },
    });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Owner' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'list-enterprises' });
    expect(res.success).toBe(true);
    expect(res.data.count).toBe(1);
    expect(res.data.unconnectedActors).toBe(false);
    expect(res.data.actors).toEqual([]);
    expect(res.data.enterprises[0].instanceId).toBe('ent1');
    expect(res.data.enterprises[0].ownerActorName).toBe('Owner');
    expect(res.data.enterprises[0].debtPrincipalBp).toBe(480);
  });

  it('unconnectedActors:true additionally calls discoverEnterpriseActors', async () => {
    const { settings } = makeSettings({ enterprises: { profiles: {}, instances: {} } });
    const discoverEnterpriseActors = vi.fn(async () => [{ actorId: 'a9', actorUuid: 'Actor.a9', name: 'Loose Actor' }]);
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ discoverEnterpriseActors });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'list-enterprises', unconnectedActors: true });
    expect(res.success).toBe(true);
    expect(discoverEnterpriseActors).toHaveBeenCalledTimes(1);
    expect(res.data.unconnectedActors).toBe(true);
    expect(res.data.actors).toEqual([{ actorId: 'a9', actorUuid: 'Actor.a9', name: 'Loose Actor' }]);
  });

  it('get-enterprise found reads the store directly', async () => {
    const { settings } = makeSettings({
      enterprises: {
        profiles: {},
        instances: {
          ent1: {
            id: 'ent1', name: 'The Salty Dog', profileId: 'tavern', backing: 'data-only', actorUuid: null,
            ownerActorId: 'a1', owners: [{ actorId: 'a1', sharePct: 100 }], level: 1, upkeep: 240,
            incomeModifiers: [{ label: 'Trade', skill: 'Trade (Tavernkeeping)', tier: 'b', standing: 2 }],
            eventTable: { uuid: null, overrides: [] },
            debt: { principal: 480, escalationTier: 1, creditor: { name: 'Baron von Debt', notes: '' } },
            createdAt: '2026-07-01T00:00:00.000Z',
          },
        },
      },
    });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Owner' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'get-enterprise', enterpriseId: 'ent1' });
    expect(res.success).toBe(true);
    expect(res.data.name).toBe('The Salty Dog');
    expect(res.data.ownerActorName).toBe('Owner');
    // Phase 7c ADDITIVE: owners[] + debt.creditor now ride alongside the pre-existing scalar fields
    // (D3 back-compat) — delta-based assertion, not the old exact-equality (would break on every
    // future additive field, per the eval-pair lesson in the plan's §Validation).
    expect(res.data.debt).toEqual({ principalBp: 480, escalationTier: 1, creditor: { name: 'Baron von Debt', notes: '' } });
    expect(res.data.owners).toEqual([{ actorId: 'a1', sharePct: 100, actorName: 'Owner' }]);
    expect(res.data.incomeModifiers).toHaveLength(1);
  });

  it('get-enterprise not found → WFRP_ECONOMY_TARGET_NOT_FOUND', async () => {
    const { settings } = makeSettings({ enterprises: { profiles: {}, instances: {} } });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'get-enterprise', enterpriseId: 'gone' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
  });
});

describe('legitimate-business-enterprises — create-enterprise', () => {
  it('happy path (data-only backing) delegates to createEnterprise and returns its shape', async () => {
    const { settings } = makeSettings();
    const createEnterprise = vi.fn(async () => ({ instanceId: 'ent1', actorUuid: null, debtPrincipalBp: 100, walletBalanceBp: 900 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ createEnterprise });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Owner' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'create-enterprise', presetKey: 'tavern', backing: 'data-only', ownerActorId: 'a1', confirm: true });
    expect(res.success).toBe(true);
    expect(createEnterprise).toHaveBeenCalledTimes(1);
    expect(res.data.instanceId).toBe('ent1');
    expect(res.data.debtPrincipalBp).toBe(100);
  });

  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never called', async () => {
    const { settings } = makeSettings();
    const createEnterprise = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ createEnterprise });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Owner' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'create-enterprise', presetKey: 'tavern', backing: 'data-only', ownerActorId: 'a1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(createEnterprise).not.toHaveBeenCalled();
  });

  it('backing:"create" with wfrp4e-archives3 absent/inactive → MODULE_NOT_ACTIVE, engine never called', async () => {
    const { settings } = makeSettings();
    const createEnterprise = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ createEnterprise });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Owner' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'create-enterprise', presetKey: 'tavern', backing: 'create', ownerActorId: 'a1', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
    expect(res.error).toContain('wfrp4e-archives3');
    expect(createEnterprise).not.toHaveBeenCalled();
  });

  it('engine insufficientFunds verdict → WFRP_ECONOMY_NOT_PERSISTED', async () => {
    const { settings } = makeSettings();
    const createEnterprise = vi.fn(async () => ({ insufficientFunds: true, walletBalanceBp: 50, requiredBp: 500 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ createEnterprise });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Owner' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'create-enterprise', presetKey: 'tavern', backing: 'data-only', ownerActorId: 'a1', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
  });
});

describe('legitimate-business-enterprises — connect-enterprise-actor', () => {
  it('happy path delegates to connectActor', async () => {
    const { settings } = makeSettings();
    const connectActor = vi.fn(async () => ({ instanceId: 'Actor.a9', actorUuid: 'Actor.a9' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ connectActor });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a9: { name: 'Loose Actor' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'connect-enterprise-actor', actorId: 'a9' });
    expect(res.success).toBe(true);
    expect(res.data.instanceId).toBe('Actor.a9');
    expect(res.data.alreadyConnected).toBe(false);
  });

  it('notFound bound (not an archives3 enterprise actor) → WFRP_ECONOMY_TARGET_NOT_FOUND', async () => {
    const { settings } = makeSettings();
    const connectActor = vi.fn(async () => ({ notFound: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ connectActor });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a9: { name: 'Not An Enterprise' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'connect-enterprise-actor', actorId: 'a9' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
  });

  it('alreadyConnected:true is a success, actorUuid resolved from the settings store', async () => {
    const { settings } = makeSettings({
      enterprises: { profiles: {}, instances: { 'Actor.a9': { id: 'Actor.a9', actorUuid: 'Actor.a9' } } },
    });
    const connectActor = vi.fn(async () => ({ alreadyConnected: true, instanceId: 'Actor.a9' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ connectActor });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a9: { name: 'Loose Actor' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'connect-enterprise-actor', actorId: 'a9' });
    expect(res.success).toBe(true);
    expect(res.data.alreadyConnected).toBe(true);
    expect(res.data.actorUuid).toBe('Actor.a9');
  });
});

describe('legitimate-business-enterprises — enterprise-income', () => {
  it('happy success outcome delegates to income()', async () => {
    const { settings } = makeSettings();
    const income = vi.fn(async () => ({ payoutBp: 240, walletBalanceBp: 1240 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ income });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'enterprise-income', enterpriseId: 'ent1', rolledTotal: 65, outcome: 'success' });
    expect(res.success).toBe(true);
    expect(income).toHaveBeenCalledWith('ent1', { rolledTotal: 65, outcome: 'success' });
    expect(res.data.payoutBp).toBe(240);
  });

  it('astounding-fail outcome — payoutBp 0 but the call still succeeds', async () => {
    const { settings } = makeSettings();
    const income = vi.fn(async () => ({ payoutBp: 0, walletBalanceBp: 1000 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ income });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'enterprise-income', enterpriseId: 'ent1', rolledTotal: 3, outcome: 'astounding-fail' });
    expect(res.success).toBe(true);
    expect(res.data.payoutBp).toBe(0);
  });

  it('invalidRoll bound (defensive) → WFRP_ECONOMY_NOT_PERSISTED', async () => {
    const { settings } = makeSettings();
    const income = vi.fn(async () => ({ invalidRoll: true, rolledTotal: 65, outcome: 'success' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ income });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'enterprise-income', enterpriseId: 'ent1', rolledTotal: 65, outcome: 'success' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
  });
});

describe('legitimate-business-enterprises — enterprise-event', () => {
  it('override-matched draw', async () => {
    const { settings } = makeSettings();
    const drawEvent = vi.fn(async () => ({ text: 'A rival merchant undercuts your prices.', matchedOverride: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ drawEvent });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'enterprise-event', enterpriseId: 'ent1', d100Roll: 42 });
    expect(res.success).toBe(true);
    expect(res.data.matchedOverride).toBe(true);
    expect(res.data.text).toBe('A rival merchant undercuts your prices.');
  });

  it('global-table-fallback draw (no matching custom override)', async () => {
    const { settings } = makeSettings();
    const drawEvent = vi.fn(async () => ({ text: 'A minor fire breaks out.', matchedOverride: false }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ drawEvent });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'enterprise-event', enterpriseId: 'ent1', d100Roll: 88 });
    expect(res.success).toBe(true);
    expect(res.data.matchedOverride).toBe(false);
    expect(res.data.text).toBe('A minor fire breaks out.');
  });
});

describe('legitimate-business-enterprises — enterprise-pay-interest', () => {
  it('happy paid', async () => {
    const { settings } = makeSettings();
    const payInterest = vi.fn(async () => ({ paid: true, walletBalanceBp: 760 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ payInterest });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'enterprise-pay-interest', enterpriseId: 'ent1' });
    expect(res.success).toBe(true);
    expect(res.data.paid).toBe(true);
    expect(res.data.walletBalanceBp).toBe(760);
  });

  it('declineToPay:true returns the new escalationTier, no wallet debit', async () => {
    const { settings } = makeSettings();
    const payInterest = vi.fn(async () => ({ paid: false, escalationTier: 1 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ payInterest });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'enterprise-pay-interest', enterpriseId: 'ent1', declineToPay: true });
    expect(res.success).toBe(true);
    expect(payInterest).toHaveBeenCalledWith('ent1', { declineToPay: true });
    expect(res.data.paid).toBe(false);
    expect(res.data.escalationTier).toBe(1);
  });

  it('insufficientFunds bound → WFRP_ECONOMY_NOT_PERSISTED', async () => {
    const { settings } = makeSettings();
    const payInterest = vi.fn(async () => ({ insufficientFunds: true, walletBalanceBp: 10, requiredBp: 240 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ payInterest });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'enterprise-pay-interest', enterpriseId: 'ent1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
  });
});

describe('legitimate-business-enterprises — enterprise-repay-debt', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never called', async () => {
    const { settings } = makeSettings();
    const repayDebt = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ repayDebt });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'enterprise-repay-debt', enterpriseId: 'ent1', amountBp: 240 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(repayDebt).not.toHaveBeenCalled();
  });

  it('WITH confirm:true delegates and returns the new principal', async () => {
    const { settings } = makeSettings();
    const repayDebt = vi.fn(async () => ({ principalBp: 240, walletBalanceBp: 760 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ repayDebt });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'enterprise-repay-debt', enterpriseId: 'ent1', amountBp: 240, confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.principalBp).toBe(240);
    expect(res.data.walletBalanceBp).toBe(760);
  });
});

describe('legitimate-business-enterprises — enterprise-upgrade', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never called', async () => {
    const { settings } = makeSettings();
    const upgrade = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ upgrade });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'enterprise-upgrade', enterpriseId: 'ent1', level: 2 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(upgrade).not.toHaveBeenCalled();
  });

  it('upgradeBlocked bound (RAW: cannot Expand while in Creditor debt) → WFRP_ECONOMY_NOT_PERSISTED', async () => {
    const { settings } = makeSettings();
    const upgrade = vi.fn(async () => ({ upgradeBlocked: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ upgrade });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'enterprise-upgrade', enterpriseId: 'ent1', level: 2, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
    expect(res.error).toContain('debt');
  });

  it('happy path', async () => {
    const { settings } = makeSettings();
    const upgrade = vi.fn(async () => ({ level: 2, newUpkeep: 480, debtPrincipalBp: 0, walletBalanceBp: 500 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ upgrade });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'enterprise-upgrade', enterpriseId: 'ent1', level: 2, confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.level).toBe(2);
    expect(res.data.newUpkeep).toBe(480);
    expect(res.data.debtPrincipalBp).toBe(0);
  });
});

// delete-enterprise added post-Phase-6 L4a (user directive 2026-07-12) — untrack only, actor untouched.
// Mock provenance: engine deleteEnterprise(id) → {notFound:true} | {deleted:true, name, persistedCheckFailed?, detail?}
// (enterprise-engine.js deleteEnterprise, added same session).
describe('legitimate-business-enterprises — delete-enterprise', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never called', async () => {
    const { settings } = makeSettings();
    const deleteEnterprise = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ deleteEnterprise });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'delete-enterprise', enterpriseId: 'ent1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(deleteEnterprise).not.toHaveBeenCalled();
  });

  it('unknown instance → WFRP_ECONOMY_TARGET_NOT_FOUND', async () => {
    const { settings } = makeSettings();
    const deleteEnterprise = vi.fn(async () => ({ notFound: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ deleteEnterprise });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'delete-enterprise', enterpriseId: 'nope', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
  });

  it('happy path — deleted:true + name, actor untouched by contract', async () => {
    const { settings } = makeSettings();
    const deleteEnterprise = vi.fn(async () => ({ deleted: true, name: 'Tavern' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ deleteEnterprise });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'delete-enterprise', enterpriseId: 'ent1', confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.deleted).toBe(true);
    expect(res.data.name).toBe('Tavern');
    expect(deleteEnterprise).toHaveBeenCalledWith('ent1');
  });

  it('persistedCheckFailed → WFRP_ECONOMY_NOT_PERSISTED', async () => {
    const { settings } = makeSettings();
    const deleteEnterprise = vi.fn(async () => ({ deleted: true, name: 'Tavern', persistedCheckFailed: true, detail: 'still present' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ deleteEnterprise });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'delete-enterprise', enterpriseId: 'ent1', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
  });
});

// ── Phase 7c — enterprise-ownership-and-debt (R7c.1/R7c.2) ──────────────────────
//
// Mock provenance: enterprise-engine.js setOwners(id, {ownerShares}) →
//   {notFound:true} | {ventureSlotsNotSupported:true} | {invalidShares:true, shareSum} |
//   {owners, ownerActorId, persistedCheckFailed?, detail?}   (enterprise-engine.js, added Phase 7c task 1.2)
// addDebt(id, {amountBp, creditor, recipientActorId}) →
//   {notFound:true} | {principalBp, recipientActorId, walletBalanceBp, persistedCheckFailed?, detail?}
// forgiveDebt(id, {amountBp?}) → {notFound:true} | {principalBp, persistedCheckFailed?, detail?}

describe('enterprise-ownership-and-debt — set-enterprise-owners', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never called', async () => {
    const { settings } = makeSettings();
    const setOwners = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setOwners });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Owner A' }, a2: { name: 'Owner B' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'set-enterprise-owners', enterpriseId: 'ent1', ownerShares: [{ actorId: 'a1', sharePct: 60 }, { actorId: 'a2', sharePct: 40 }] });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(setOwners).not.toHaveBeenCalled();
  });

  it('WITH confirm:true delegates and returns the widened owners + primary alias', async () => {
    const { settings } = makeSettings();
    const setOwners = vi.fn(async () => ({ owners: [{ actorId: 'a1', sharePct: 60 }, { actorId: 'a2', sharePct: 40 }], ownerActorId: 'a1' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setOwners });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Owner A' }, a2: { name: 'Owner B' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'set-enterprise-owners', enterpriseId: 'ent1', ownerShares: [{ actorId: 'a1', sharePct: 60 }, { actorId: 'a2', sharePct: 40 }], confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.ownerActorId).toBe('a1');
    expect(res.data.owners).toHaveLength(2);
    expect(res.data.owners[0].actorName).toBe('Owner A');
  });

  it('engine invalidShares (Σ≠100) verdict → WFRP_ECONOMY_INVALID_SHARES', async () => {
    const { settings } = makeSettings();
    const setOwners = vi.fn(async () => ({ invalidShares: true, shareSum: 90 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setOwners });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Owner A' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'set-enterprise-owners', enterpriseId: 'ent1', ownerShares: [{ actorId: 'a1', sharePct: 90 }], confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_INVALID_SHARES');
    expect(res.error).toContain('90');
  });
});

describe('enterprise-ownership-and-debt — add-enterprise-debt', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never called', async () => {
    const { settings } = makeSettings();
    const addDebt = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ addDebt });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'add-enterprise-debt', enterpriseId: 'ent1', amountBp: 240 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(addDebt).not.toHaveBeenCalled();
  });

  it('WITH confirm:true delegates and returns the recipient credit + new principal', async () => {
    const { settings } = makeSettings();
    const addDebt = vi.fn(async () => ({ principalBp: 720, recipientActorId: 'a1', walletBalanceBp: 1000 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ addDebt });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Owner A' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'add-enterprise-debt', enterpriseId: 'ent1', amountBp: 240, creditor: { name: 'Baron von Debt' }, recipientActorId: 'a1', confirm: true });
    expect(res.success).toBe(true);
    expect(addDebt).toHaveBeenCalledWith('ent1', { amountBp: 240, creditor: { name: 'Baron von Debt' }, recipientActorId: 'a1' });
    expect(res.data.principalBp).toBe(720);
    expect(res.data.recipientActorId).toBe('a1');
    expect(res.data.amountBp).toBe(240);
    expect(res.data.recipientActorName).toBe('Owner A');
  });

  it('unknown recipientActorId → WFRP_ECONOMY_TARGET_NOT_FOUND, engine never called', async () => {
    const { settings } = makeSettings();
    const addDebt = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ addDebt });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'add-enterprise-debt', enterpriseId: 'ent1', amountBp: 240, recipientActorId: 'ghost', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
    expect(addDebt).not.toHaveBeenCalled();
  });
});

describe('enterprise-ownership-and-debt — forgive-enterprise-debt', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never called', async () => {
    const { settings } = makeSettings();
    const forgiveDebt = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ forgiveDebt });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'forgive-enterprise-debt', enterpriseId: 'ent1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(forgiveDebt).not.toHaveBeenCalled();
  });

  it('WITH confirm:true and no amountBp forgives the entire remaining principal (zero wallet write)', async () => {
    const { settings } = makeSettings();
    const forgiveDebt = vi.fn(async () => ({ principalBp: 0 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ forgiveDebt });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'forgive-enterprise-debt', enterpriseId: 'ent1', confirm: true });
    expect(res.success).toBe(true);
    expect(forgiveDebt).toHaveBeenCalledWith('ent1', { amountBp: undefined });
    expect(res.data.principalBp).toBe(0);
  });
});

// ── Phase 7c — levy-groups (R7c.4/R7c.5) ─────────────────────────────────────────
//
// list-levies is a PURE READ over the `levies` setting (no engine import — mirrors list-enterprises).
// save-levy-group/delete-levy-group write the standalone `levyGroups` setting DIRECTLY (register.js
// pattern) — no engine export exists for this simple CRUD, so these tests seed/assert the settings
// store directly rather than mocking a runtime import.

describe('levy-groups — list-levies (direct settings read)', () => {
  it('projects the levies store directly, defaulting type to custom/builtin, no engine import needed', async () => {
    const { settings } = makeSettings({
      levies: [
        { id: 'l1', name: 'Cost of Living', cadence: 'weekly', active: true, amount: { kind: 'standing-scaled', multiplier: 1.5 }, target: 'party', builtin: true, state: {} },
        { id: 'l2', name: 'River Toll', cadence: 'per-travel', active: true, amount: { kind: 'fixed-bp', value: 120 }, target: 'group:g1', type: 'toll', builtin: false, state: {} },
      ],
    });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'list-levies' });
    expect(res.success).toBe(true);
    expect(res.data.count).toBe(2);
    expect(res.data.levies[0].type).toBe('builtin');
    expect(res.data.levies[1].type).toBe('toll');
    expect(res.data.levies[1].groupId).toBe('g1');
  });
});

describe('levy-groups — save-levy-group (direct settings write)', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, settings never written', async () => {
    const { settings, store } = makeSettings({ levyGroups: [] });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'A' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'save-levy-group', name: 'River Party', actorIds: ['a1'] });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(store.levyGroups).toEqual([]);
  });

  it('WITH confirm:true and no groupId creates a new group, persisted read-back confirms it', async () => {
    const { settings, store } = makeSettings({ levyGroups: [] });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'A' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'save-levy-group', name: 'River Party', actorIds: ['a1'], confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.name).toBe('River Party');
    expect(store.levyGroups).toHaveLength(1);
    expect(store.levyGroups[0].actorIds).toEqual(['a1']);
  });

  it('WITH confirm:true and an existing groupId renames/re-members in place (no duplicate row)', async () => {
    const { settings, store } = makeSettings({ levyGroups: [{ id: 'g1', name: 'Old Name', actorIds: ['a1'] }] });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'A' }, a2: { name: 'B' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'save-levy-group', groupId: 'g1', name: 'New Name', actorIds: ['a1', 'a2'], confirm: true });
    expect(res.success).toBe(true);
    expect(store.levyGroups).toHaveLength(1);
    expect(store.levyGroups[0].name).toBe('New Name');
    expect(store.levyGroups[0].actorIds).toEqual(['a1', 'a2']);
  });

  it('unknown member actorId → WFRP_ECONOMY_TARGET_NOT_FOUND, settings never written', async () => {
    const { settings, store } = makeSettings({ levyGroups: [] });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'save-levy-group', name: 'Ghost Party', actorIds: ['ghost'], confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
    expect(store.levyGroups).toEqual([]);
  });
});

describe('levy-groups — list-levy-groups (direct settings read)', () => {
  it('projects the levyGroups store directly', async () => {
    const { settings } = makeSettings({ levyGroups: [{ id: 'g1', name: 'River Party', actorIds: ['a1', 'a2'] }] });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'list-levy-groups' });
    expect(res.success).toBe(true);
    expect(res.data.count).toBe(1);
    expect(res.data.groups[0].memberCount).toBe(2);
  });
});

describe('levy-groups — delete-levy-group', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, settings never written', async () => {
    const { settings, store } = makeSettings({ levyGroups: [{ id: 'g1', name: 'River Party', actorIds: ['a1'] }] });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'delete-levy-group', groupId: 'g1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(store.levyGroups).toHaveLength(1);
  });

  it('unknown groupId → WFRP_ECONOMY_TARGET_NOT_FOUND', async () => {
    const { settings } = makeSettings({ levyGroups: [] });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'delete-levy-group', groupId: 'gone', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
  });

  it('WITH confirm:true removes the group, persisted read-back confirms removal', async () => {
    const { settings, store } = makeSettings({ levyGroups: [{ id: 'g1', name: 'River Party', actorIds: ['a1'] }] });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'delete-levy-group', groupId: 'g1', confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.deleted).toBe(true);
    expect(store.levyGroups).toEqual([]);
  });
});
