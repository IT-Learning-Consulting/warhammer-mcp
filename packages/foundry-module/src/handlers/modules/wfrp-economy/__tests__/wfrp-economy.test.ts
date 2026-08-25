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
//   5. ROUTING DEVIATIONS — transfer calls TransferProcess and request-loan/repay-loan call LoanProcess
//      DIRECTLY (never _handleTransferProcess/_handleLoanProcess: since the fork's D5 hardening those are
//      socket-envelope entry points that run _authorizeGMRequest and silently no-op on a direct flat call).
//      WHY: the whole HC-v2-7 thesis is that we drive the AWAITED direct methods and never the
//      envelope-only/fire-and-forget wrappers.
//   6. A write whose mocked read-back mismatches → WFRP_ECONOMY_NOT_PERSISTED. WHY: DP-16 must catch a
//      silently no-op'ing write (Document/settings success ≠ persistence proof).
//   7. An unknown action → WFRP_ECONOMY_INVALID_INPUT (discriminatedUnion reject).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { dispatchModuleWfrpEconomy as dispatchModuleWfrpEconomyRaw, rebucketEconomySummary } from '../wfrp-economy.js';

const ECO = 'eco1';

// Economy-owned stores must never be queried or mutated without an explicit scope.
// Existing behavior tests use this helper so they exercise the default test economy;
// dedicated contract tests below call the raw dispatcher to verify that omission fails.
const ECONOMY_SCOPED_ACTIONS = new Set([
  'list-transactions',
  'record-transaction',
  'apply-levies',
  'money-to-burn',
  'list-levies',
  'save-levy-group',
  'list-levy-groups',
  'delete-levy-group',
  'invest',
  'resolve-investment',
  'list-investments',
  'stash-deposit',
  'stash-withdraw',
  'accrue-interest',
  'run-economic-cycle',
  'list-enterprises',
  'create-enterprise',
  'connect-enterprise-actor',
  'create-venture',
  'list-ventures',
  'trading-buy-cargo',
  'trading-sell-cargo',
]);

function dispatchModuleWfrpEconomy(input: Record<string, any>) {
  const scopedInput = ECONOMY_SCOPED_ACTIONS.has(input.action) && input.economyId == null
    ? { ...input, economyId: ECO }
    : input;
  return dispatchModuleWfrpEconomyRaw(scopedInput);
}

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

describe('economy isolation contract', () => {
  it('rejects an economy-owned read when economyId is omitted', async () => {
    const { settings } = makeSettings({ levies: [] });
    (globalThis as any).game = makeGame({ active: true, settings });

    const res: any = await dispatchModuleWfrpEconomyRaw({ action: 'list-levies' } as any);

    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_INVALID_INPUT');
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

  it('delete-economy WITH confirm:true delegates to the recovery-archive workflow and retains transaction history', async () => {
    const { settings, store } = makeSettings({
      economies: [{ id: ECO, name: 'Reikland', banks: [], properties: [], stocks: [] }],
      transactionLogs: [{ id: 'tx1', economyId: ECO }],
    });
    const archiveAndDeleteEconomy = vi.fn(async (economyId: string) => {
      store.economies = store.economies.filter((entry: any) => entry.id !== economyId);
      return {
        deleted: true, archiveId: 'archive1', affected: { bankAccounts: 0 },
        transactionHistoryRetained: true, persistedCheckFailed: false,
      };
    });
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ archiveAndDeleteEconomy });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'delete-economy', economyId: ECO, confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.deleted).toBe(true);
    expect(res.data.archiveId).toBe('archive1');
    expect(res.data.transactionHistoryRetained).toBe(true);
    expect(archiveAndDeleteEconomy).toHaveBeenCalledWith(ECO);
    expect(store.economies).toHaveLength(0);
    expect(store.transactionLogs).toEqual([{ id: 'tx1', economyId: ECO }]);
  });

  it('list-bankers is a retired compatibility read and never touches the unregistered setting', async () => {
    const { settings, store } = makeSettings();
    settings.get = vi.fn((_scope: string, key: string) => {
      if (key === 'bankers') throw new Error('bankers setting is unregistered');
      return store[key];
    });
    (globalThis as any).game = makeGame({ active: true, settings });

    const res: any = await dispatchModuleWfrpEconomy({ action: 'list-bankers', economyId: ECO });

    expect(res.success).toBe(true);
    expect(res.data).toMatchObject({ action: 'list-bankers', count: 0, bankers: [], retired: true });
    expect((settings.get as any).mock.calls.some(([, key]: [string, string]) => key === 'bankers')).toBe(false);
  });

  it('large transfer (>= 4800 BP) WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, module never called', async () => {
    const { settings } = makeSettings({
      economies: [{ id: ECO, name: 'Reikland', currency: 'Gold Crowns', banks: [{ id: 'b1', name: 'Reik Bank' }], properties: [], stocks: [] }],
      bankAccounts: { acc1: { id: 'acc1', actorId: 'a1', bankId: 'b1', economyId: ECO, balance: 100000 }, acc2: { id: 'acc2', actorId: 'a2', bankId: 'b1', economyId: ECO, balance: 0 } },
    });
    const TransferProcess = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ SocketHandler: { TransferProcess } });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'transfer', economyId: ECO, sourceAccountId: 'acc1', destinationAccountId: 'acc2', amountBp: 5000 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(TransferProcess).not.toHaveBeenCalled();
  });
});

// ── 5. Routing deviations (the HC-v2-7 thesis) ────────────────────────────────────

describe('routing deviations — direct awaited methods, never the broken wrappers', () => {
  // sell-stock's processStockSale/broadcastStockSale routing-deviation test (BUG-A bypass) was RETIRED
  // Phase 7d along with the action itself — socket-handler.js's processStockSale no longer exists
  // (deleted, Phase 3 sweep). See "venture-ledger — retired investment-cycle actions" below for its
  // replacement coverage (sell-stock now always returns WFRP_ECONOMY_ACTION_RETIRED, engine never called).

  it('transfer calls TransferProcess directly and NOT the envelope-only _handleTransferProcess (D5 silent no-op)', async () => {
    const { settings, store } = makeSettings({
      economies: [{ id: ECO, name: 'Reikland', currency: 'Gold Crowns', banks: [{ id: 'b1', name: 'Reik Bank' }], properties: [], stocks: [] }],
      bankAccounts: { acc1: { id: 'acc1', actorId: 'a1', bankId: 'b1', economyId: ECO, balance: 1000 }, acc2: { id: 'acc2', actorId: 'a2', bankId: 'b1', economyId: ECO, balance: 0 } },
    });
    const TransferProcess = vi.fn(async (data: any) => {
      store.bankAccounts[data.sourceAccountId].balance -= data.amount;
      store.bankAccounts[data.destinationAccountId].balance += data.amount;
      return { ok: true };
    });
    // Envelope-only socket entry point — runs _authorizeGMRequest and silently no-ops on a direct flat call.
    const _handleTransferProcess = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ SocketHandler: { TransferProcess, _handleTransferProcess } });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'transfer', economyId: ECO, sourceAccountId: 'acc1', destinationAccountId: 'acc2', amountBp: 100 });
    expect(res.success).toBe(true);
    expect(TransferProcess).toHaveBeenCalledTimes(1);
    expect(_handleTransferProcess).not.toHaveBeenCalled();
    expect(res.data.sourceBalance).toBe(900);
    expect(res.data.destinationBalance).toBe(100);
  });

  it('request-loan calls LoanProcess directly and NOT the envelope-only _handleLoanProcess (D5 silent no-op)', async () => {
    const { settings, store } = makeSettings({
      economies: [{ id: ECO, name: 'Reikland', currency: 'Gold Crowns', banks: [{ id: 'b1', name: 'Reik Bank', loanRate: 0.05 }], properties: [], stocks: [] }],
      bankAccounts: { acc1: { id: 'acc1', actorId: 'a1', bankId: 'b1', economyId: ECO, balance: 0 } },
    });
    const LoanProcess = vi.fn(async (data: any) => {
      // Mirrors socket-handler.js:778-781 — loan.interest stored as a FRACTION (interestRate ?? bank default 0.05).
      store.bankAccounts[data.accountId].loan = { amount: data.amount, interest: data.interestRate ?? 0.05, active: true };
      store.bankAccounts[data.accountId].balance += data.amount;
      return { ok: true };
    });
    // Envelope-only socket entry point — runs _authorizeGMRequest and silently no-ops on a direct flat call.
    const _handleLoanProcess = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ SocketHandler: { LoanProcess, _handleLoanProcess } });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Debtor' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'request-loan', economyId: ECO, accountId: 'acc1', amountBp: 240 });
    expect(res.success).toBe(true);
    expect(LoanProcess).toHaveBeenCalledTimes(1);
    expect(_handleLoanProcess).not.toHaveBeenCalled();
    expect(res.data.loanActive).toBe(true);
    expect(res.data.loanAmount).toBe(240);
  });

  it('request-loan converts the published PERCENT interestRate input to the module FRACTION convention (BUG-542 class)', async () => {
    const { settings, store } = makeSettings({
      economies: [{ id: ECO, name: 'Reikland', currency: 'Gold Crowns', banks: [{ id: 'b1', name: 'Reik Bank', loanRate: 0.1 }], properties: [], stocks: [] }],
      bankAccounts: { acc1: { id: 'acc1', actorId: 'a1', bankId: 'b1', economyId: ECO, balance: 0 } },
    });
    const LoanProcess = vi.fn(async (data: any) => {
      store.bankAccounts[data.accountId].loan = { amount: data.amount, interest: data.interestRate ?? 0.05, active: true };
      store.bankAccounts[data.accountId].balance += data.amount;
      return { ok: true };
    });
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ SocketHandler: { LoanProcess } });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Debtor' } } });
    // Published contract: interestRate is a percent (5 = 5%). Module storage: fraction (0.05).
    const res: any = await dispatchModuleWfrpEconomy({ action: 'request-loan', economyId: ECO, accountId: 'acc1', amountBp: 240, interestRate: 5 });
    expect(res.success).toBe(true);
    expect(LoanProcess).toHaveBeenCalledWith(expect.objectContaining({ interestRate: 0.05 }));
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
    const LoanProcess = vi.fn(async (data: any) => {
      const acc = store.bankAccounts[data.accountId]; // SAME object the handler retains (aliasing)
      acc.balance -= data.amount;
      // Mirrors socket-handler.js:840 — interest is a FRACTION (BUG-542): principalPaid = amount / (1 + fraction).
      const principalPaid = data.amount / (1 + acc.loan.interest);
      acc.loan.amount = Math.max(0, acc.loan.amount - principalPaid);
      if (acc.loan.amount < 0.01) acc.loan.active = false;
      return { ok: true };
    });
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ SocketHandler: { LoanProcess } });
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
    const LoanProcess = vi.fn(async (data: any) => {
      const acc = store.bankAccounts[data.accountId];
      acc.balance -= data.amount;
      // Mirrors socket-handler.js:817 — totalOwed = round(amount * (1 + FRACTION interest)) (BUG-542).
      const totalOwed = Math.round(acc.loan.amount * (1 + acc.loan.interest));
      if (data.amount >= totalOwed) acc.loan.active = false;
      return { ok: true };
    });
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ SocketHandler: { LoanProcess } });
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
    const LoanProcess = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ SocketHandler: { LoanProcess } });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Debtor' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'repay-loan', economyId: ECO, accountId: 'acc1', amountBp: 300 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('exceeds total owed');
    expect(LoanProcess).not.toHaveBeenCalled();
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

  // D11 (Phase 9 orphan-guard): the owner actor was deleted — this is NOT a persistence failure (the
  // engine never attempted a wallet write), so it must surface as a distinct SUCCESSFUL non-resolving
  // outcome, never WFRP_ECONOMY_NOT_PERSISTED (the misleading detail this used to fall through to).
  it('engine ownerDeleted verdict → success:true with ownerDeleted:true, never NOT_PERSISTED', async () => {
    const { settings } = makeSettings();
    const resolveInvestment = vi.fn(async () => ({ ownerDeleted: true, investmentId: 'inv1', principalBp: 2400, accruedBp: 144 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ resolveInvestment });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'resolve-investment', investmentId: 'inv1', d100Roll: 50, confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.ownerDeleted).toBe(true);
    expect(res.data.principalBp).toBe(2400);
    expect(res.data.accruedBp).toBe(144);
    expect(res.data.actorId).toBeUndefined();
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
    expect(listInvestments).toHaveBeenCalledWith({ actorId: undefined, activeOnly: true, economyId: ECO });
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
    expect(accrueInterest).toHaveBeenCalledWith({ economyId: ECO, dryRun: true });
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

// ── Phase 9 (D7 revisit): run-economic-cycle — headless composer for the module-UI-only "Run Economic
// Cycle" button. Delegates to the SAME engine export the button calls (kills the double-pay hazard by
// construction, rather than merely documenting it). dryRun:true previews investment/account/loan/rental
// verdicts ONLY — the venture pass is skipped entirely on dryRun (banking-engine.js:622) and never
// previews. cycleRolls (the schema field) forwards verbatim as the engine's `rolls` param.
describe('banking-and-income — run-economic-cycle', () => {
  it('without confirm or dryRun → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never imported', async () => {
    const { settings } = makeSettings({ economies: [{ id: ECO, name: 'Test' }] });
    (globalThis as any).__wfrpEconomyRuntimeImport = () => {
      throw new Error('must not import the engine before the confirm gate');
    };
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'run-economic-cycle' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
  });

  it('a non-GM caller → WFRP_ECONOMY_ACCESS_DENIED (write-action GM gate)', async () => {
    const { settings } = makeSettings({ economies: [{ id: ECO, name: 'Test' }] });
    (globalThis as any).game = makeGame({ active: true, isGM: false, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'run-economic-cycle', dryRun: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_ACCESS_DENIED');
  });

  it('unknown economyId → WFRP_ECONOMY_TARGET_NOT_FOUND, engine never imported', async () => {
    const { settings } = makeSettings({ economies: [] });
    (globalThis as any).__wfrpEconomyRuntimeImport = () => {
      throw new Error('must not import the engine for an unknown economy');
    };
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomyRaw({ action: 'run-economic-cycle', economyId: 'nope', dryRun: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
  });

  it('dryRun:true previews investment/account/loan/rental verdicts only — ventureVerdicts stays empty and cycleRolls forwards as rolls', async () => {
    const { settings } = makeSettings({ economies: [{ id: ECO, name: 'Test' }] });
    const runEconomicCycle = vi.fn(async () => ({
      lastCycleAt: '2026-07-18T00:00:00.000Z',
      investmentVerdicts: [{ investmentId: 'inv1', actorId: 'a1', actorName: 'Investor', accruedDeltaBp: 144, accruedBp: 144 }],
      accountVerdicts: [{ accountId: 'acc1', actorId: 'a1', actorName: 'Investor', economyId: ECO, bankId: 'bank1', accruedDeltaBp: 12, newBalanceBp: 252 }],
      loanReminders: [{ accountId: 'acc2', actorId: 'a2', actorName: 'Debtor', totalOwedBp: 500 }],
      rentalVerdicts: [{ accountId: 'acc3', actorId: 'a3', actorName: 'Landlord', economyId: ECO, bankId: 'bank1', propertyId: 'p1', propertyName: 'Inn', incomeBp: 100, newBalanceBp: 100 }],
      ventureVerdicts: [],
    }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ runEconomicCycle });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'run-economic-cycle', dryRun: true, cycleRolls: { v1: 42 } });
    expect(res.success).toBe(true);
    expect(runEconomicCycle).toHaveBeenCalledWith({ economyId: ECO, dryRun: true, rolls: { v1: 42 } });
    expect(res.data.dryRun).toBe(true);
    expect(res.data.investmentVerdicts).toHaveLength(1);
    expect(res.data.accountVerdicts).toHaveLength(1);
    expect(res.data.loanReminders).toHaveLength(1);
    expect(res.data.rentalVerdicts).toHaveLength(1);
    expect(res.data.ventureVerdicts).toHaveLength(0);
  });

  it('confirmed real cycle returns all 5 verdict families + lastCycleAt', async () => {
    const { settings } = makeSettings({ economies: [{ id: ECO, name: 'Test' }] });
    const runEconomicCycle = vi.fn(async () => ({
      lastCycleAt: '2026-07-18T00:00:00.000Z',
      investmentVerdicts: [],
      accountVerdicts: [],
      loanReminders: [],
      rentalVerdicts: [],
      ventureVerdicts: [{ kind: 'transfer', ventureId: 'v1', offerId: 'o1', sold: true }],
    }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ runEconomicCycle });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'run-economic-cycle', confirm: true, cycleRolls: { o1: 55 } });
    expect(res.success).toBe(true);
    expect(runEconomicCycle).toHaveBeenCalledWith({ economyId: ECO, dryRun: false, rolls: { o1: 55 } });
    expect(res.data.ventureVerdicts).toHaveLength(1);
    expect(res.data.lastCycleAt).toBe('2026-07-18T00:00:00.000Z');
  });

  it('a persistedCheckFailed venture verdict → WFRP_ECONOMY_NOT_PERSISTED naming the venture', async () => {
    const { settings } = makeSettings({ economies: [{ id: ECO, name: 'Test' }] });
    const runEconomicCycle = vi.fn(async () => ({
      lastCycleAt: '2026-07-18T00:00:00.000Z',
      investmentVerdicts: [],
      accountVerdicts: [],
      loanReminders: [],
      rentalVerdicts: [],
      ventureVerdicts: [{ kind: 'distribution', ventureId: 'v1', persistedCheckFailed: true, detail: 'escrow mismatch' }],
    }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ runEconomicCycle });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'run-economic-cycle', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
    expect(res.error).toContain('v1');
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
            id: 'ent1', economyId: ECO, name: 'The Salty Dog', profileId: 'tavern', backing: 'data-only', actorUuid: null,
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
    // Phase 7d ADDITIVE: ventureId:null rides alongside every owner slot (D2/task 1.7 lift — a slot may
    // be venture-held instead of actor-held; this fixture's slot is actor-held).
    expect(res.data.owners).toEqual([{ actorId: 'a1', ventureId: null, sharePct: 100, actorName: 'Owner' }]);
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

  // Mock provenance: live enterprise-engine.js createEnterprise contract captured 2026-07-16:
  // {invalidFinancing:true, minimumSelfFundedBp, maximumFinancedBp} is a zero-write refusal.
  it('engine invalidFinancing verdict → typed refusal instead of fabricated success', async () => {
    const { settings } = makeSettings();
    const createEnterprise = vi.fn(async () => ({ invalidFinancing: true, minimumSelfFundedBp: 240, maximumFinancedBp: 2160 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ createEnterprise });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Owner' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'create-enterprise', presetKey: 'tavern', backing: 'data-only', ownerActorId: 'a1', financedPortionBp: 2400, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
    expect(res.error).toContain('240 BP');
    expect(res.error).toContain('2160 BP');
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
    const repayDebt = vi.fn(async () => ({ principalBp: 240, walletBalanceBp: 760, appliedBp: 240, unappliedBp: 0 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ repayDebt });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'enterprise-repay-debt', enterpriseId: 'ent1', amountBp: 240, confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.principalBp).toBe(240);
    expect(res.data.walletBalanceBp).toBe(760);
    expect(res.data.appliedBp).toBe(240);
    expect(res.data.unappliedBp).toBe(0);
  });

  // Mock provenance: live enterprise-engine.js repayDebt contract captured 2026-07-16:
  // requested repayment is capped to principal and returns both appliedBp and unappliedBp.
  it('capped/no-op repayment exposes applied and unapplied BP instead of reporting the request as paid', async () => {
    const { settings } = makeSettings();
    const repayDebt = vi.fn(async () => ({ principalBp: 0, walletBalanceBp: 1000, appliedBp: 0, unappliedBp: 999 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ repayDebt });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'enterprise-repay-debt', enterpriseId: 'ent1', amountBp: 999, confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.principalBp).toBe(0);
    expect(res.data.walletBalanceBp).toBe(1000);
    expect(res.data.appliedBp).toBe(0);
    expect(res.data.unappliedBp).toBe(999);
  });

  it('missing applied/unapplied engine fields fail loud instead of fabricating repayment values', async () => {
    const { settings } = makeSettings();
    const repayDebt = vi.fn(async () => ({ principalBp: 0, walletBalanceBp: 1000 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ repayDebt });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'enterprise-repay-debt', enterpriseId: 'ent1', amountBp: 999, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
    expect(res.error).toContain('applied/unapplied');
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

  // Mock provenance: live enterprise-engine.js upgrade contract captured 2026-07-16:
  // invalidLevel carries requested level + requiredLevel; invalidFinancing carries owner/Creditor bounds.
  it('skipped upgrade level → typed refusal naming the required next level', async () => {
    const { settings } = makeSettings();
    const upgrade = vi.fn(async () => ({ invalidLevel: true, level: 3, requiredLevel: 1 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ upgrade });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'enterprise-upgrade', enterpriseId: 'ent1', level: 3, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
    expect(res.error).toContain('required next sequential level is 1');
  });

  it('upgrade invalidFinancing verdict → typed refusal instead of fabricated success', async () => {
    const { settings } = makeSettings();
    const upgrade = vi.fn(async () => ({ invalidFinancing: true, minimumSelfFundedBp: 120, maximumFinancedBp: 1080 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ upgrade });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'enterprise-upgrade', enterpriseId: 'ent1', level: 1, financedPortionBp: 1200, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
    expect(res.error).toContain('120 BP');
    expect(res.error).toContain('1080 BP');
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

describe('enterprise-ownership-and-debt — set-enterprise-income-sources (Phase 7e2)', () => {
  it('forwards enterpriseId to the engine call', async () => {
    const { settings } = makeSettings();
    const setIncomeSources = vi.fn(async () => ({ incomeModifiers: [], actorSynced: false }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setIncomeSources });
    (globalThis as any).game = makeGame({ active: true, settings });
    await dispatchModuleWfrpEconomy({ action: 'set-enterprise-income-sources', enterpriseId: 'ent1', incomeModifiers: [] });
    expect(setIncomeSources).toHaveBeenCalledWith('ent1', expect.objectContaining({ incomeModifiers: [] }));
  });

  it('forwards incomeModifiers to the engine call', async () => {
    const { settings } = makeSettings();
    const incomeModifiers = [{ label: 'Haggle', skill: 'Haggle', tier: 's', standing: 3 }];
    const setIncomeSources = vi.fn(async () => ({ incomeModifiers, actorSynced: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setIncomeSources });
    (globalThis as any).game = makeGame({ active: true, settings });
    await dispatchModuleWfrpEconomy({ action: 'set-enterprise-income-sources', enterpriseId: 'ent1', incomeModifiers });
    expect(setIncomeSources).toHaveBeenCalledWith('ent1', { incomeModifiers });
  });

  it('WITH a happy-path result echoes enterpriseId, incomeModifiers, and actorSynced', async () => {
    const { settings } = makeSettings();
    const incomeModifiers = [{ label: 'Haggle', skill: 'Haggle', tier: 's', standing: 3 }];
    const setIncomeSources = vi.fn(async () => ({ incomeModifiers, actorSynced: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setIncomeSources });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'set-enterprise-income-sources', enterpriseId: 'ent1', incomeModifiers });
    expect(res.success).toBe(true);
    expect(res.data.action).toBe('set-enterprise-income-sources');
    expect(res.data.enterpriseId).toBe('ent1');
    expect(res.data.incomeModifiers).toEqual(incomeModifiers);
    expect(res.data.actorSynced).toBe(true);
  });

  it('engine invalidSources verdict → WFRP_ECONOMY_INVALID_INCOME_SOURCES', async () => {
    const { settings } = makeSettings();
    const setIncomeSources = vi.fn(async () => ({ invalidSources: true, reason: 'entry 0: standing must be an integer >= 1, got "0"' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setIncomeSources });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'set-enterprise-income-sources', enterpriseId: 'ent1', incomeModifiers: [{ label: 'Bad', skill: '', tier: 'b', standing: 0 }] });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_INVALID_INCOME_SOURCES');
    expect(res.error).toContain('standing');
  });

  it('engine notFound verdict → WFRP_ECONOMY_TARGET_NOT_FOUND, no confirm gate required', async () => {
    const { settings } = makeSettings();
    const setIncomeSources = vi.fn(async () => ({ notFound: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setIncomeSources });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'set-enterprise-income-sources', enterpriseId: 'ghost', incomeModifiers: [] });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
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
        { id: 'l1', economyId: ECO, name: 'Cost of Living', cadence: 'weekly', active: true, amount: { kind: 'standing-scaled', multiplier: 1.5 }, target: 'party', builtin: true, state: {} },
        { id: 'l2', economyId: ECO, name: 'River Toll', cadence: 'per-travel', active: true, amount: { kind: 'fixed-bp', value: 120 }, target: 'group:g1', type: 'toll', builtin: false, state: {} },
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
    const { settings, store } = makeSettings({ levyGroups: [{ id: 'g1', economyId: ECO, name: 'Old Name', actorIds: ['a1'] }] });
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
    const { settings } = makeSettings({ levyGroups: [{ id: 'g1', economyId: ECO, name: 'River Party', actorIds: ['a1', 'a2'] }] });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'list-levy-groups' });
    expect(res.success).toBe(true);
    expect(res.data.count).toBe(1);
    expect(res.data.groups[0].memberCount).toBe(2);
  });
});

describe('levy-groups — delete-levy-group', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, settings never written', async () => {
    const { settings, store } = makeSettings({ levyGroups: [{ id: 'g1', economyId: ECO, name: 'River Party', actorIds: ['a1'] }] });
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
    const { settings, store } = makeSettings({ levyGroups: [{ id: 'g1', economyId: ECO, name: 'River Party', actorIds: ['a1'] }] });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'delete-levy-group', groupId: 'g1', confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.deleted).toBe(true);
    expect(store.levyGroups).toEqual([]);
  });
});

// ── Phase 7d — venture-ledger (R7d.1-R7d.8) + the FIRST typed action retirement ─────────────────
//
// WHY (Rule 9): the venture-ledger idiom replaces investment-cycle; every write forwards to
// venture-engine.js exactly, every confirm-gate refuses BEFORE the engine is touched (mirrors the
// enterprise-ownership-and-debt suite above), and retirement must short-circuit ahead of any engine
// import — a regression here would silently resurrect the retired stock-trading surface.

describe('venture-ledger — retired investment-cycle actions', () => {
  it('buy-stock → WFRP_ECONOMY_ACTION_RETIRED naming create-venture/subscribe-venture, no engine import', async () => {
    const { settings } = makeSettings();
    const createVenture = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ createVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'buy-stock' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_ACTION_RETIRED');
    expect(res.error).toContain('create-venture');
    expect(res.error).toContain('subscribe-venture');
    expect(createVenture).not.toHaveBeenCalled();
  });

  it('sell-stock → WFRP_ECONOMY_ACTION_RETIRED naming transfer-venture-parts', async () => {
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'sell-stock' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_ACTION_RETIRED');
    expect(res.error).toContain('transfer-venture-parts');
  });

  it('get-portfolio → WFRP_ECONOMY_ACTION_RETIRED naming list-ventures/get-venture', async () => {
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'get-portfolio' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_ACTION_RETIRED');
    expect(res.error).toContain('list-ventures');
    expect(res.error).toContain('get-venture');
  });

  it('retirement fires even for a non-GM caller (checked before the GM gate would matter — read-shaped enum, no WRITE_ACTIONS membership)', async () => {
    (globalThis as any).game = makeGame({ active: true, isGM: false, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'buy-stock' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_ACTION_RETIRED');
  });
});

describe('venture-ledger — create-venture', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never called', async () => {
    const { settings } = makeSettings();
    const createVenture = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ createVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'create-venture', name: 'Reik Cargo Run', type: 'expedition', parts: { total: 10, priceBp: 240 } });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(createVenture).not.toHaveBeenCalled();
  });

  it('WITH confirm:true forwards every pass-through field exactly and returns the created deed', async () => {
    const { settings } = makeSettings();
    const createVenture = vi.fn(async () => ({ instanceId: 'v1', name: 'Reik Cargo Run', type: 'expedition', status: 'open', standing: 'reputable', escrowBp: 0 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ createVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({
      action: 'create-venture', name: 'Reik Cargo Run', type: 'expedition',
      parts: { total: 10, priceBp: 240 }, terms: { managerPortionPct: 10 },
      handledBy: [{ role: 'registry', name: 'Reikland Trading House' }], linkedEnterpriseId: 'ent1', exposureTags: ['river'],
      confirm: true,
    });
    expect(res.success).toBe(true);
    expect(createVenture).toHaveBeenCalledWith({
      economyId: ECO, name: 'Reik Cargo Run', type: 'expedition', parts: { total: 10, priceBp: 240 },
      terms: { managerPortionPct: 10 }, handledBy: [{ role: 'registry', name: 'Reikland Trading House' }],
      linkedEnterpriseId: 'ent1', exposureTags: ['river'],
    });
    expect(res.data.ventureId).toBe('v1');
    expect(res.data.status).toBe('open');
    expect(res.data.standing).toBe('reputable');
  });

  it('engine invalidType verdict → WFRP_ECONOMY_TARGET_NOT_FOUND-shaped refusal, zero writes claimed', async () => {
    const { settings } = makeSettings();
    const createVenture = vi.fn(async () => ({ invalidType: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ createVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'create-venture', name: 'X', type: 'expedition', parts: { total: 1, priceBp: 1 }, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
  });
});

describe('venture-ledger — get-venture / list-ventures (pure reads)', () => {
  it('get-venture projects holders, queuedTransfers, badges, notices, deedDateText', async () => {
    const { settings } = makeSettings();
    const inst = {
      id: 'v1', name: 'Reik Cargo Run', type: 'expedition', status: 'underway', standing: 'reputable',
      parts: { total: 10, subscribed: 4, priceBp: 240 }, escrowBp: 480,
      holders: [{ actorId: 'a1', parts: 4 }],
      queuedTransfers: [{ offerId: 'o1', sellerActorId: 'a1', parts: 1, askingPriceBp: 300 }],
      badges: ['delayed'], notices: ['A bridge toll delayed the wagons.'],
      deedDate: { text: '1 Nachexen 2522' },
    };
    const getVenture = vi.fn(async () => inst);
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ getVenture });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Investor A' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'get-venture', ventureId: 'v1' });
    expect(res.success).toBe(true);
    expect(getVenture).toHaveBeenCalledWith('v1');
    expect(res.data.holders[0]).toEqual({ actorId: 'a1', externalName: null, actorName: 'Investor A', parts: 4 });
    expect(res.data.queuedTransfers[0].sellerName).toBe('Investor A');
    expect(res.data.badges).toEqual(['delayed']);
    expect(res.data.notices).toEqual(['A bridge toll delayed the wagons.']);
    expect(res.data.deedDateText).toBe('1 Nachexen 2522');
  });

  it('BUG-822: get-venture projects handledBy (stored, filter-driving, previously never echoed)', async () => {
    const { settings } = makeSettings();
    const inst = {
      id: 'v1', name: 'Reik Cargo Run', type: 'expedition', status: 'open', standing: 'reputable',
      parts: { total: 10, subscribed: 0, priceBp: 240 }, escrowBp: 0, capitalBp: 0,
      holders: [], queuedTransfers: [], badges: [], notices: [],
      handledBy: [{ role: 'registry', name: 'Bank of Reikland', bankId: 'b1', economyId: 'e1' }],
    };
    const getVenture = vi.fn(async () => inst);
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ getVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'get-venture', ventureId: 'v1' });
    expect(res.success).toBe(true);
    expect(res.data.handledBy).toEqual([{ role: 'registry', name: 'Bank of Reikland', bankId: 'b1', economyId: 'e1' }]);
  });

  it('BUG-822: a Phase-7d context-free handledBy entry normalises its absent fields to null, not undefined', async () => {
    // Pre-Phase-7e entries carry a role and nothing else. They must still round-trip as a present
    // field with explicit nulls — `undefined` would be dropped by JSON serialisation, leaving the
    // caller unable to distinguish "no Registry" from "field not implemented".
    const { settings } = makeSettings();
    const inst = {
      id: 'v1', name: 'Old Deed', type: 'expedition', status: 'open', standing: 'reputable',
      parts: { total: 10, subscribed: 0, priceBp: 240 }, escrowBp: 0, capitalBp: 0,
      holders: [], queuedTransfers: [], badges: [], notices: [],
      handledBy: [{ role: 'registry' }],
    };
    const getVenture = vi.fn(async () => inst);
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ getVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'get-venture', ventureId: 'v1' });
    expect(res.data.handledBy).toEqual([{ role: 'registry', name: null, bankId: null, economyId: null }]);
  });

  it('BUG-822: create-venture echoes the PERSISTED (sanitised) handledBy, not the raw input', async () => {
    const { settings } = makeSettings();
    const createVenture = vi.fn(async () => ({
      instanceId: 'v9', name: 'New Deed', type: 'partnership', status: 'open', standing: 'reputable', escrowBp: 0,
      handledBy: [{ role: 'registry', name: 'Sanitised Registry', bankId: 'b1', economyId: 'e1' }],
    }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ createVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({
      action: 'create-venture', economyId: 'e1', name: 'New Deed', type: 'partnership',
      parts: { total: 4, priceBp: 100 },
      handledBy: [{ role: 'registry', name: 'Raw Input Registry', bankId: 'b1', economyId: 'e1' }],
      confirm: true,
    });
    expect(res.success).toBe(true);
    expect(res.data.handledBy[0].name).toBe('Sanitised Registry');
  });

  it('get-venture on a missing deed → WFRP_ECONOMY_TARGET_NOT_FOUND', async () => {
    const { settings } = makeSettings();
    const getVenture = vi.fn(async () => ({ notFound: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ getVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'get-venture', ventureId: 'ghost' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
  });

  it('list-ventures forwards type/status filters exactly', async () => {
    const { settings } = makeSettings();
    const listVentures = vi.fn(async () => [{ id: 'v1', name: 'Reik Cargo Run', type: 'expedition', status: 'underway', standing: 'reputable', parts: { total: 10, subscribed: 4, priceBp: 240 }, escrowBp: 480, badges: [] }]);
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ listVentures });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'list-ventures', type: 'expedition', status: 'underway' });
    expect(res.success).toBe(true);
    expect(listVentures).toHaveBeenCalledWith({ type: 'expedition', status: 'underway', bankId: undefined, economyId: ECO });
    expect(res.data.count).toBe(1);
    expect(res.data.ventures[0].ventureId).toBe('v1');
  });
});

describe('venture-ledger — subscribe-venture', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never called', async () => {
    const { settings } = makeSettings();
    const subscribeVenture = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ subscribeVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'subscribe-venture', ventureId: 'v1', actorId: 'a1', partsCount: 2 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(subscribeVenture).not.toHaveBeenCalled();
  });

  it('WITH confirm:true forwards actorId/externalName/partsCount→parts exactly', async () => {
    const { settings } = makeSettings();
    const subscribeVenture = vi.fn(async () => ({ ventureId: 'v1', subscribedParts: 6, escrowBp: 1440, walletBalanceBp: 5000 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ subscribeVenture });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Investor A' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'subscribe-venture', ventureId: 'v1', actorId: 'a1', partsCount: 2, confirm: true });
    expect(res.success).toBe(true);
    expect(subscribeVenture).toHaveBeenCalledWith('v1', { actorId: 'a1', externalName: undefined, parts: 2, bankId: undefined, economyId: undefined });
    expect(res.data.subscribedParts).toBe(6);
    expect(res.data.escrowBp).toBe(1440);
    expect(res.data.walletBalanceBp).toBe(5000);
  });

  it('forwards the D8 institution-context pair (bankId+economyId) into the engine (Phase 9 S3 T80/T83 regression pin)', async () => {
    const { settings } = makeSettings();
    const subscribeVenture = vi.fn(async () => ({ ventureId: 'v1', subscribedParts: 1, escrowBp: 240, walletBalanceBp: 0 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ subscribeVenture });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Investor A' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'subscribe-venture', ventureId: 'v1', actorId: 'a1', partsCount: 1, bankId: 'bankA', economyId: 'eco1', confirm: true });
    expect(res.success).toBe(true);
    expect(subscribeVenture).toHaveBeenCalledWith('v1', { actorId: 'a1', externalName: undefined, parts: 1, bankId: 'bankA', economyId: 'eco1' });
  });

  it('partialContext verdict (one-sided bankId/economyId) → typed WFRP_ECONOMY_VENTURE_PARTIAL_CONTEXT refusal', async () => {
    const { settings } = makeSettings();
    const subscribeVenture = vi.fn(async () => ({ partialContext: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ subscribeVenture });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Investor A' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'subscribe-venture', ventureId: 'v1', actorId: 'a1', partsCount: 1, economyId: 'eco1', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_VENTURE_PARTIAL_CONTEXT');
  });

  it('economyMismatch verdict (deed belongs to another economy) → typed refusal, zero writes', async () => {
    const { settings } = makeSettings();
    const subscribeVenture = vi.fn(async () => ({ economyMismatch: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ subscribeVenture });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Investor A' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'subscribe-venture', ventureId: 'v1', actorId: 'a1', partsCount: 1, bankId: 'bankB', economyId: 'eco2', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_VENTURE_REGISTRY_NOT_HANDLING');
  });

  it('externalName subscriber forwards correctly (no actor pre-check)', async () => {
    const { settings } = makeSettings();
    const subscribeVenture = vi.fn(async () => ({ ventureId: 'v1', subscribedParts: 1, escrowBp: 240, walletBalanceBp: null }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ subscribeVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'subscribe-venture', ventureId: 'v1', externalName: 'The Reikland Trading House', partsCount: 1, confirm: true });
    expect(res.success).toBe(true);
    expect(subscribeVenture).toHaveBeenCalledWith('v1', { actorId: undefined, externalName: 'The Reikland Trading House', parts: 1 });
    expect(res.data.walletBalanceBp).toBeNull();
  });

  it('registryNotHandling verdict surfaces a typed refusal, zero writes', async () => {
    const { settings } = makeSettings();
    const subscribeVenture = vi.fn(async () => ({ registryNotHandling: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ subscribeVenture });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Investor A' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'subscribe-venture', ventureId: 'v1', actorId: 'a1', partsCount: 1, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_VENTURE_REGISTRY_NOT_HANDLING');
  });

  it('unknown actorId → WFRP_ECONOMY_TARGET_NOT_FOUND, engine never called', async () => {
    const { settings } = makeSettings();
    const subscribeVenture = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ subscribeVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'subscribe-venture', ventureId: 'v1', actorId: 'ghost', partsCount: 1, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
    expect(subscribeVenture).not.toHaveBeenCalled();
  });

  it('ventureDisputed verdict (7d2 badge gate) → typed WFRP_ECONOMY_VENTURE_DISPUTED refusal', async () => {
    const { settings } = makeSettings();
    const subscribeVenture = vi.fn(async () => ({ ventureDisputed: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ subscribeVenture });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Investor A' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'subscribe-venture', ventureId: 'v1', actorId: 'a1', partsCount: 1, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_VENTURE_DISPUTED');
  });
});

describe('venture-ledger — transfer-venture-parts (queues only, never resolves here)', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never called', async () => {
    const { settings } = makeSettings();
    const queueTransfer = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ queueTransfer });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'transfer-venture-parts', ventureId: 'v1', sellerActorId: 'a1', partsCount: 1, askingPriceBp: 300 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(queueTransfer).not.toHaveBeenCalled();
  });

  it('WITH confirm:true forwards sellerActorId/sellerExternalName/partsCount→parts/askingPriceBp exactly and returns queued:true', async () => {
    const { settings } = makeSettings();
    const queueTransfer = vi.fn(async () => ({ queued: true, offerId: 'o1' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ queueTransfer });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Investor A' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'transfer-venture-parts', ventureId: 'v1', sellerActorId: 'a1', partsCount: 2, askingPriceBp: 500, confirm: true });
    expect(res.success).toBe(true);
    expect(queueTransfer).toHaveBeenCalledWith('v1', { sellerActorId: 'a1', sellerExternalName: undefined, parts: 2, askingPriceBp: 500 });
    expect(res.data.offerId).toBe('o1');
    expect(res.data.queued).toBe(true);
  });

  it('holderNotFound verdict → WFRP_ECONOMY_TARGET_NOT_FOUND', async () => {
    const { settings } = makeSettings();
    const queueTransfer = vi.fn(async () => ({ holderNotFound: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ queueTransfer });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Investor A' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'transfer-venture-parts', ventureId: 'v1', sellerActorId: 'a1', partsCount: 1, askingPriceBp: 100, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
  });
});

describe('venture-ledger — settle-venture', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never called', async () => {
    const { settings } = makeSettings();
    const settleVenture = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ settleVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'settle-venture', ventureId: 'v1', netBp: 1000 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(settleVenture).not.toHaveBeenCalled();
  });

  it('WITH confirm:true forwards netBp exactly and returns the resulting status', async () => {
    const { settings } = makeSettings();
    const settleVenture = vi.fn(async () => ({ settled: true, status: 'completed', distributed: { distributedBp: 1000 } }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ settleVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'settle-venture', ventureId: 'v1', netBp: 1000, confirm: true });
    expect(res.success).toBe(true);
    expect(settleVenture).toHaveBeenCalledWith('v1', { netBp: 1000 });
    expect(res.data.status).toBe('completed');
    expect(res.data.distributedBp).toBe(1000);
  });

  it('doesNotSettle verdict (open-ended type) → typed refusal naming distribute-venture', async () => {
    const { settings } = makeSettings();
    const settleVenture = vi.fn(async () => ({ doesNotSettle: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ settleVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'settle-venture', ventureId: 'v1', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_VENTURE_DOES_NOT_SETTLE');
    expect(res.error).toContain('distribute-venture');
  });

  // BUG-549 RESIDUAL REGRESSION (2026-07-18): the engine now preflights holders BEFORE any write —
  // its {noHolders:true} refusal must surface as a typed failure, never a false success.
  it('BUG-549: noHolders verdict → typed refusal (settlement never happened, zero writes)', async () => {
    const { settings } = makeSettings();
    const settleVenture = vi.fn(async () => ({ noHolders: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ settleVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'settle-venture', ventureId: 'v1', netBp: 1, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('no holders');
    expect(res.data).toBeUndefined();
  });

  // B2 REGRESSION (7d2): settleDelayed previously fell through to the success path (status:undefined,
  // distributedBp:0, a "settled" toast for a settlement that never happened). Must now be a typed refusal.
  it('B2: settleDelayed verdict → typed WFRP_ECONOMY_VENTURE_SETTLE_DELAYED, NOT a false success', async () => {
    const { settings } = makeSettings();
    const settleVenture = vi.fn(async () => ({ settleDelayed: true, delayCycles: 2 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ settleVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'settle-venture', ventureId: 'v1', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_VENTURE_SETTLE_DELAYED');
    expect(res.error).toContain('2');
    expect(res.data).toBeUndefined();
  });

  // Phase 9 S3 T59 REGRESSION: settlementNotReady (deed not yet "settling" — post-BUG-549
  // isSettlementReady gate) fell through to the success path exactly like pre-fix B2. Typed refusal now.
  it('settlementNotReady verdict → typed WFRP_ECONOMY_VENTURE_SETTLE_NOT_READY, NOT a false success', async () => {
    const { settings } = makeSettings();
    const settleVenture = vi.fn(async () => ({ settlementNotReady: true, status: 'open' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ settleVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'settle-venture', ventureId: 'v1', netBp: 500, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_VENTURE_SETTLE_NOT_READY');
    expect(res.error).toContain('"open"');
    expect(res.data).toBeUndefined();
  });

  // BUG-544 REGRESSION (DP-16): settleVenture now re-reads the store and verifies its escrow/status write
  // before ledgering. The handler had NO persistedCheckFailed branch, so a dropped write would have fallen
  // through to success:true — the same false-success shape as B2, one layer down.
  it('BUG-544: persistedCheckFailed verdict → typed WFRP_ECONOMY_NOT_PERSISTED, NOT a false success', async () => {
    const { settings } = makeSettings();
    const settleVenture = vi.fn(async () => ({
      status: 'underway',
      persistedCheckFailed: true,
      detail: 'instance "v1" expected status "settling" / escrowBp 500, got status "underway" / escrowBp 0',
    }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ settleVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'settle-venture', ventureId: 'v1', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
    expect(res.error).toContain('v1');
    expect(res.data).toBeUndefined();
  });

  it('escrowSeized verdict → typed WFRP_ECONOMY_VENTURE_SEIZED refusal', async () => {
    const { settings } = makeSettings();
    const settleVenture = vi.fn(async () => ({ escrowSeized: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ settleVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'settle-venture', ventureId: 'v1', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_VENTURE_SEIZED');
  });
});

describe('venture-ledger — distribute-venture', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never called', async () => {
    const { settings } = makeSettings();
    const distributeVenture = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ distributeVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'distribute-venture', ventureId: 'v1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(distributeVenture).not.toHaveBeenCalled();
  });

  it('WITH confirm:true forwards ventureId exactly and returns the split summary', async () => {
    const { settings } = makeSettings();
    const distributeVenture = vi.fn(async () => ({ distributed: true, distributedBp: 1440, escrowBp: 0, splits: [{ actorId: 'a1', amountBp: 1440 }] }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ distributeVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'distribute-venture', ventureId: 'v1', confirm: true });
    expect(res.success).toBe(true);
    expect(distributeVenture).toHaveBeenCalledWith('v1');
    expect(res.data.distributedBp).toBe(1440);
    expect(res.data.escrowBp).toBe(0);
    expect(res.data.splitCount).toBe(1);
  });

  it('noHolders verdict → WFRP_ECONOMY_NOT_PERSISTED (nothing to distribute)', async () => {
    const { settings } = makeSettings();
    const distributeVenture = vi.fn(async () => ({ noHolders: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ distributeVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'distribute-venture', ventureId: 'v1', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
  });

  it('escrowSeized verdict → typed WFRP_ECONOMY_VENTURE_SEIZED refusal, zero writes attempted beyond the call', async () => {
    const { settings } = makeSettings();
    const distributeVenture = vi.fn(async () => ({ escrowSeized: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ distributeVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'distribute-venture', ventureId: 'v1', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_VENTURE_SEIZED');
  });
});

describe('venture-ledger — venture-event (CONFIRM-GATED since BUG-841 C5)', () => {
  it('forwards ventureId and d100Roll exactly, returns the drawn text + standing', async () => {
    const { settings } = makeSettings();
    const drawVentureEvent = vi.fn(async () => ({ text: 'A bridge toll delays the wagons.', standing: 'uncertain' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ drawVentureEvent });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'venture-event', ventureId: 'v1', d100Roll: 12, confirm: true });
    expect(res.success).toBe(true);
    expect(drawVentureEvent).toHaveBeenCalledWith('v1', { d100Roll: 12 });
    expect(res.data.text).toBe('A bridge toll delays the wagons.');
    expect(res.data.standing).toBe('uncertain');
  });

  // BUG-841 C5: venture-event was the ONLY mutating venture action with no confirm gate (CCR-4). A
  // single unconfirmed call could shift standing, move or destroy escrow, badge, delay, dilute via
  // issueParts, or force the deed to defaulted. This pins the gate itself — the engine must not even
  // be reached without confirm:true.
  it('C5: without confirm:true it returns CONFIRM_REQUIRED and never reaches the engine', async () => {
    const { settings } = makeSettings();
    const drawVentureEvent = vi.fn(async () => ({ text: 'should never be drawn', standing: 'reputable' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ drawVentureEvent });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'venture-event', ventureId: 'v1', d100Roll: 50 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('CONFIRM_REQUIRED');
    expect(drawVentureEvent).not.toHaveBeenCalled();
  });

  it('engine invalidRoll verdict (defensive path — Zod already constrains d100Roll to 1-100) → typed refusal', async () => {
    const { settings } = makeSettings();
    const drawVentureEvent = vi.fn(async () => ({ invalidRoll: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ drawVentureEvent });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'venture-event', ventureId: 'v1', d100Roll: 50, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_INVALID_ROLL');
  });

  it('a non-GM caller may draw a venture event (WRITE_ACTIONS membership, mirrors enterprise-event)', async () => {
    const { settings } = makeSettings();
    const drawVentureEvent = vi.fn(async () => ({ text: 'Fair skies.', standing: 'reputable' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ drawVentureEvent });
    (globalThis as any).game = makeGame({ active: true, isGM: false, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'venture-event', ventureId: 'v1', d100Roll: 50, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_ACCESS_DENIED');
  });

  // BUG-842 — these five predated BUG-841 M8 and were missing from WRITE_ACTIONS; the engine self-guards
  // on isGM() and silently no-ops for a non-GM, so a non-GM caller previously got a confusing
  // NOT_PERSISTED instead of the same clean WFRP_ECONOMY_ACCESS_DENIED every other venture write returns.
  it('BUG-842: a non-GM caller is refused delete-venture with ACCESS_DENIED, not NOT_PERSISTED', async () => {
    const { settings } = makeSettings();
    const deleteVenture = vi.fn(async () => ({ deleted: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ deleteVenture });
    (globalThis as any).game = makeGame({ active: true, isGM: false, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'delete-venture', ventureId: 'v1', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_ACCESS_DENIED');
    expect(deleteVenture).not.toHaveBeenCalled();
  });

  it('BUG-842: a non-GM caller is refused toggle-venture-badge with ACCESS_DENIED, not NOT_PERSISTED', async () => {
    const { settings } = makeSettings();
    const toggleBadge = vi.fn(async () => ({ badges: ['disputed'] }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ toggleBadge });
    (globalThis as any).game = makeGame({ active: true, isGM: false, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'toggle-venture-badge', ventureId: 'v1', badge: 'disputed', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_ACCESS_DENIED');
    expect(toggleBadge).not.toHaveBeenCalled();
  });

  it('BUG-842: a non-GM caller is refused issue-parts with ACCESS_DENIED, not NOT_PERSISTED', async () => {
    const { settings } = makeSettings();
    const issuePartsForVenture = vi.fn(async () => ({ partsTotal: 5, priceBp: 100 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ issuePartsForVenture });
    (globalThis as any).game = makeGame({ active: true, isGM: false, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'issue-parts', ventureId: 'v1', count: 1, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_ACCESS_DENIED');
    expect(issuePartsForVenture).not.toHaveBeenCalled();
  });

  it('BUG-842: a non-GM caller is refused set-venture-status with ACCESS_DENIED, not NOT_PERSISTED', async () => {
    const { settings } = makeSettings();
    const setStatus = vi.fn(async () => ({ status: 'completed', from: 'underway' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setStatus });
    (globalThis as any).game = makeGame({ active: true, isGM: false, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'set-venture-status', ventureId: 'v1', status: 'completed', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_ACCESS_DENIED');
    expect(setStatus).not.toHaveBeenCalled();
  });

  it('BUG-842: a non-GM caller is refused set-venture-standing with ACCESS_DENIED, not NOT_PERSISTED', async () => {
    const { settings } = makeSettings();
    const setStanding = vi.fn(async () => ({ standing: 'troubled' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setStanding });
    (globalThis as any).game = makeGame({ active: true, isGM: false, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'set-venture-standing', ventureId: 'v1', standing: 'troubled', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_ACCESS_DENIED');
    expect(setStanding).not.toHaveBeenCalled();
  });

  // 7d2: the response is additive — naturalRoll/modifiedRoll/standingModifier/critical/effectsApplied.
  it('7d2: forwards the richer standing-modified-roll response (naturalRoll/modifiedRoll/standingModifier/critical/effectsApplied)', async () => {
    const { settings } = makeSettings();
    const drawVentureEvent = vi.fn(async () => ({
      text: 'The cargo is seized at a tollhouse on a pretext.', standing: 'troubled',
      naturalRoll: 68, modifiedRoll: 94, standingModifier: 26, critical: null,
      effectsApplied: ['escrowModPct', 'addBadge', 'standingShift'],
    }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ drawVentureEvent });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'venture-event', ventureId: 'v1', d100Roll: 68, confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.naturalRoll).toBe(68);
    expect(res.data.modifiedRoll).toBe(94);
    expect(res.data.standingModifier).toBe(26);
    expect(res.data.critical).toBeNull();
    expect(res.data.effectsApplied).toEqual(['escrowModPct', 'addBadge', 'standingShift']);
  });

  it('7d2: noEventsForStatus verdict (Completed/Defaulted deed) → typed refusal, zero writes', async () => {
    const { settings } = makeSettings();
    const drawVentureEvent = vi.fn(async () => ({ noEventsForStatus: true, status: 'completed' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ drawVentureEvent });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'venture-event', ventureId: 'v1', d100Roll: 50, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_VENTURE_NO_EVENTS_FOR_STATUS');
  });
});

describe('venture-ledger — delete-venture (closes BUG-821 delete half)', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never called', async () => {
    const { settings } = makeSettings();
    const deleteVenture = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ deleteVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'delete-venture', ventureId: 'v1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(deleteVenture).not.toHaveBeenCalled();
  });

  it('WITH confirm:true forwards ventureId exactly and returns the deed name', async () => {
    const { settings } = makeSettings();
    const deleteVenture = vi.fn(async () => ({ deleted: true, name: 'Doomed Deed', writtenOffBp: 0 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ deleteVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'delete-venture', ventureId: 'v1', confirm: true });
    expect(res.success).toBe(true);
    expect(deleteVenture).toHaveBeenCalledWith('v1');
    expect(res.data.name).toBe('Doomed Deed');
    expect(res.data.writtenOffBp).toBe(0);
  });

  it('escrowNotEmpty verdict → typed refusal naming the balance, NOT a success', async () => {
    // The deed still has a holder who could be paid. Deleting here would silently destroy claimable
    // coin, so the engine refuses and the handler must surface that as a failure envelope.
    const { settings } = makeSettings();
    const deleteVenture = vi.fn(async () => ({ escrowNotEmpty: true, escrowBp: 1470 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ deleteVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'delete-venture', ventureId: 'v1', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_VENTURE_ESCROW_NOT_EMPTY');
    expect(res.error).toContain('1470');
  });

  it('orphaned deed (every holder unpayable) deletes and reports the written-off amount', async () => {
    // The P9-Smoke shape that previously required raw settings surgery: escrow > 0 but nobody left to
    // pay. writtenOffBp must be reported so the GM is told the coin vanished rather than being paid out.
    const { settings } = makeSettings();
    const deleteVenture = vi.fn(async () => ({ deleted: true, name: 'P9 Smoke Expedition', writtenOffBp: 1470 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ deleteVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'delete-venture', ventureId: 'orphan', confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.writtenOffBp).toBe(1470);
  });

  it('notFound verdict → WFRP_ECONOMY_TARGET_NOT_FOUND', async () => {
    const { settings } = makeSettings();
    const deleteVenture = vi.fn(async () => ({ notFound: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ deleteVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'delete-venture', ventureId: 'ghost', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
  });

  it('persistedCheckFailed verdict → WFRP_ECONOMY_NOT_PERSISTED (DP-16)', async () => {
    const { settings } = makeSettings();
    const deleteVenture = vi.fn(async () => ({ deleted: true, name: 'Ghost', writtenOffBp: 0, persistedCheckFailed: true, detail: 'still present after delete' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ deleteVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'delete-venture', ventureId: 'v1', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('NOT_PERSISTED');
  });
});

describe('venture-ledger — toggle-venture-badge (7d2, D7/D13)', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never called', async () => {
    const { settings } = makeSettings();
    const toggleBadge = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ toggleBadge });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'toggle-venture-badge', ventureId: 'v1', badge: 'disputed' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(toggleBadge).not.toHaveBeenCalled();
  });

  it('WITH confirm:true forwards ventureId/badge exactly and returns the resulting badges', async () => {
    const { settings } = makeSettings();
    const toggleBadge = vi.fn(async () => ({ badges: ['disputed'] }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ toggleBadge });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'toggle-venture-badge', ventureId: 'v1', badge: 'disputed', confirm: true });
    expect(res.success).toBe(true);
    expect(toggleBadge).toHaveBeenCalledWith('v1', 'disputed');
    expect(res.data.badges).toEqual(['disputed']);
  });

  it('notFound verdict → WFRP_ECONOMY_TARGET_NOT_FOUND', async () => {
    const { settings } = makeSettings();
    const toggleBadge = vi.fn(async () => ({ notFound: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ toggleBadge });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'toggle-venture-badge', ventureId: 'ghost', badge: 'seized', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
  });
});

describe('venture-ledger — issue-parts (7d2, D10/D12)', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never called', async () => {
    const { settings } = makeSettings();
    const issuePartsForVenture = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ issuePartsForVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'issue-parts', ventureId: 'v1', count: 2 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(issuePartsForVenture).not.toHaveBeenCalled();
  });

  it('WITH confirm:true forwards count/priceModPct exactly and returns the new total/price', async () => {
    const { settings } = makeSettings();
    const issuePartsForVenture = vi.fn(async () => ({ partsTotal: 12, priceBp: 180 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ issuePartsForVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'issue-parts', ventureId: 'v1', count: 2, priceModPct: -25, confirm: true });
    expect(res.success).toBe(true);
    expect(issuePartsForVenture).toHaveBeenCalledWith('v1', { count: 2, priceModPct: -25 });
    expect(res.data.partsTotal).toBe(12);
    expect(res.data.priceBp).toBe(180);
  });

  it('engine invalidCount verdict (defensive path — Zod already constrains count to a positive integer) → typed refusal', async () => {
    const { settings } = makeSettings();
    const issuePartsForVenture = vi.fn(async () => ({ invalidCount: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ issuePartsForVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'issue-parts', ventureId: 'v1', count: 2, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_VENTURE_INVALID_PARTS_COUNT');
  });

  it('notFound verdict → WFRP_ECONOMY_TARGET_NOT_FOUND', async () => {
    const { settings } = makeSettings();
    const issuePartsForVenture = vi.fn(async () => ({ notFound: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ issuePartsForVenture });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'issue-parts', ventureId: 'ghost', count: 2, confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
  });
});

describe('venture-ledger — set-venture-status (7d2, incl. the Wind Up idiom)', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never called', async () => {
    const { settings } = makeSettings();
    const setStatus = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setStatus });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'set-venture-status', ventureId: 'v1', status: 'settling' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(setStatus).not.toHaveBeenCalled();
  });

  it('WITH confirm:true forwards status exactly (Wind Up: Partnership/Concern → settling)', async () => {
    const { settings } = makeSettings();
    const setStatus = vi.fn(async () => ({ status: 'settling' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setStatus });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'set-venture-status', ventureId: 'v1', status: 'settling', confirm: true });
    expect(res.success).toBe(true);
    expect(setStatus).toHaveBeenCalledWith('v1', 'settling');
    expect(res.data.status).toBe('settling');
  });

  it('notFound verdict → WFRP_ECONOMY_TARGET_NOT_FOUND', async () => {
    const { settings } = makeSettings();
    const setStatus = vi.fn(async () => ({ notFound: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setStatus });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'set-venture-status', ventureId: 'ghost', status: 'settling', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
  });
});

describe('venture-ledger — set-venture-standing (7d2)', () => {
  it('WITHOUT confirm → WFRP_ECONOMY_CONFIRM_REQUIRED, engine never called', async () => {
    const { settings } = makeSettings();
    const setStanding = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setStanding });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'set-venture-standing', ventureId: 'v1', standing: 'ruinous' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_CONFIRM_REQUIRED');
    expect(setStanding).not.toHaveBeenCalled();
  });

  it('WITH confirm:true forwards standing exactly', async () => {
    const { settings } = makeSettings();
    const setStanding = vi.fn(async () => ({ standing: 'ruinous' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setStanding });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'set-venture-standing', ventureId: 'v1', standing: 'ruinous', confirm: true });
    expect(res.success).toBe(true);
    expect(setStanding).toHaveBeenCalledWith('v1', 'ruinous');
    expect(res.data.standing).toBe('ruinous');
  });
});

describe('venture-ledger — set-enterprise-owners ventureId-slot acceptance (D2/task 1.7 lift)', () => {
  it('a {ventureId, sharePct} slot passes through to the engine unmodified (no ventureSlotsNotSupported rejection)', async () => {
    const { settings } = makeSettings();
    const setOwners = vi.fn(async () => ({ owners: [{ actorId: 'a1', sharePct: 60 }, { ventureId: 'v1', sharePct: 40 }], ownerActorId: 'a1' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setOwners });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Owner A' } } });
    const res: any = await dispatchModuleWfrpEconomy({
      action: 'set-enterprise-owners', enterpriseId: 'ent1',
      ownerShares: [{ actorId: 'a1', sharePct: 60 }, { ventureId: 'v1', sharePct: 40 }], confirm: true,
    });
    expect(res.success).toBe(true);
    expect(setOwners).toHaveBeenCalledWith('ent1', { ownerShares: [{ actorId: 'a1', sharePct: 60 }, { ventureId: 'v1', sharePct: 40 }] });
    expect(res.data.owners[1]).toEqual({ actorId: null, ventureId: 'v1', sharePct: 40, actorName: null });
  });

  it('engine ventureNotFound verdict → WFRP_ECONOMY_VENTURE_NOT_FOUND naming the missing venture', async () => {
    const { settings } = makeSettings();
    const setOwners = vi.fn(async () => ({ ventureNotFound: true, ventureId: 'ghost' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setOwners });
    (globalThis as any).game = makeGame({ active: true, settings, actors: { a1: { name: 'Owner A' } } });
    const res: any = await dispatchModuleWfrpEconomy({
      action: 'set-enterprise-owners', enterpriseId: 'ent1',
      ownerShares: [{ actorId: 'a1', sharePct: 60 }, { ventureId: 'ghost', sharePct: 40 }], confirm: true,
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_VENTURE_NOT_FOUND');
    expect(res.error).toContain('ghost');
  });
});

describe('venture-ledger — list-transactions projection pin extension (ventureId)', () => {
  it('projects ventureId from stored venture-* rows (same convention as enterpriseId/bankName)', async () => {
    const { settings } = makeSettings();
    const row = {
      id: 't1', type: 'venture-subscribe', source: 'economy', actorId: 'a1', actorName: 'Investor A',
      economyId: null, bankId: null, bankName: null, amount: 480, amountDisplay: '2gc 0ss 0bp',
      targetActorId: null, targetActorName: null, enterpriseId: null, ventureId: 'v1',
      description: 'Venture "Reik Cargo Run" — subscribed 2 Parts', date: 'today',
    };
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ TransactionLogger: { getTransactionLogs: () => [row] } });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'list-transactions', actorId: 'a1' });
    expect(res.success).toBe(true);
    expect(res.data.transactions[0].ventureId).toBe('v1');
  });
});

describe('venture-ledger — get-economy ventureCount (additive, R7d.7 stock fields frozen)', () => {
  it('get-economy response carries ventureCount additively alongside the frozen stocks array', async () => {
    // BUG-821(c) / ADR-16 (systemic_bug_class_prevention v2 Phase 2, task 3.3): ventureCount is now
    // ECONOMY-SCOPED — only ventures whose handledBy[] links name this economy count. v1/v2 each carry
    // a handledBy entry naming ECO (mirrors the fork's matchingVentureLinks predicate in wfrp-economy.ts
    // ventureCount()) so this fixture still tests "get-economy counts THIS economy's ventures", not the
    // retired world-global count.
    const { settings } = makeSettings({
      economies: [{ id: ECO, name: 'The Empire', currency: 'GC', banks: [], properties: [], stocks: [{ id: 's1', name: 'Old Stock Row' }] }],
      ventures: { instances: {
        v1: { id: 'v1', handledBy: [{ economyId: ECO }] },
        v2: { id: 'v2', handledBy: [{ economyId: ECO }] },
      } },
    });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'get-economy', economyId: ECO });
    expect(res.success).toBe(true);
    expect(res.data.stocks).toHaveLength(1); // R7d.7 — frozen, still round-trips
    expect(res.data.ventureCount).toBe(2);
  });
});

// ── trading (Phase 7f) ────────────────────────────────────────────────────────
// Coverage: one forwarding assertion per pass-through field on every new trading-* action (7c lesson,
// BLOCKING per the plan), plus refusal cases (capacity exceeded, insufficient funds, gazetteer/settlement
// not found, insufficient pre-rolled rolls) and the D2 seed-once dial-migration read path.

const RIVER = { name: 'ALTDORF', size: 5, wealth: 5, population: 50000, produces: ['Grain'], demands: ['Wine/Brandy'], flags: ['trade'] };
const REIKLAND_PACK = { packId: 'reikland', label: 'Reikland', settlements: [RIVER] };

describe('trading — trading-list-settlements', () => {
  it('flattens active-gazetteer settlements with pack metadata', async () => {
    const loadActiveGazetteers = vi.fn(async () => [REIKLAND_PACK]);
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ loadActiveGazetteers });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-list-settlements' });
    expect(res.success).toBe(true);
    expect(loadActiveGazetteers).toHaveBeenCalledWith();
    expect(res.data.count).toBe(1);
    expect(res.data.settlements[0]).toMatchObject({ name: 'ALTDORF', gazetteerId: 'reikland', size: 5, wealth: 5, produces: ['Grain'], demands: ['Wine/Brandy'] });
  });

  it('an unrecognized gazetteerId filter → TARGET_NOT_FOUND-style refusal', async () => {
    const loadActiveGazetteers = vi.fn(async () => [REIKLAND_PACK]);
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ loadActiveGazetteers });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-list-settlements', gazetteerId: 'nowhereland' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
    expect(res.error).toContain('nowhereland');
  });
});

describe('trading — trading-list-cargo-types', () => {
  it('forwards the catalog straight through', async () => {
    const loadCargoCatalog = vi.fn(async () => [{ name: 'Grain', basePrice: 10 }]);
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ loadCargoCatalog });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-list-cargo-types' });
    expect(res.success).toBe(true);
    expect(res.data.count).toBe(1);
    expect(res.data.cargoTypes[0].name).toBe('Grain');
  });
});

describe('trading — trading-get-season / trading-set-season', () => {
  it('trading-get-season echoes season + seasonSource from the engine', async () => {
    const tradingSeason = vi.fn(() => ({ season: 'summer', seasonSource: 'calendar' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ tradingSeason });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-get-season' });
    expect(res.success).toBe(true);
    expect(res.data).toMatchObject({ season: 'summer', seasonSource: 'calendar' });
  });

  it('trading-set-season { season } writes the setting and echoes the manual seasonSource', async () => {
    const { settings, store } = makeSettings();
    const tradingSeason = vi.fn(() => ({ season: 'winter', seasonSource: 'manual' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ tradingSeason });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-set-season', season: 'winter' });
    expect(res.success).toBe(true);
    expect(settings.set).toHaveBeenCalledWith('wfrp4e-economy', 'tradingSeason', 'winter');
    expect(store.tradingSeason).toBe('winter');
    expect(res.data).toMatchObject({ season: 'winter', seasonSource: 'manual' });
  });

  it('trading-set-season { clear:true } writes an empty override', async () => {
    const { settings, store } = makeSettings({ tradingSeason: 'summer' });
    const tradingSeason = vi.fn(() => ({ season: 'spring', seasonSource: 'fallback' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ tradingSeason });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-set-season', clear: true });
    expect(res.success).toBe(true);
    expect(settings.set).toHaveBeenCalledWith('wfrp4e-economy', 'tradingSeason', '');
    expect(store.tradingSeason).toBe('');
  });

  it('trading-set-season with neither season nor clear → invalid-input refusal, no write', async () => {
    const { settings } = makeSettings();
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-set-season' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TRADING_INVALID_INPUT');
    expect(settings.set).not.toHaveBeenCalled();
  });
});

describe('trading — trading-check-availability', () => {
  it('forwards settlement/season/rolls into the pipeline and reports slotCount used', async () => {
    const resolveSettlement = vi.fn(async () => ({ settlement: RIVER, pack: REIKLAND_PACK }));
    const tradingSeason = vi.fn(() => ({ season: 'spring', seasonSource: 'calendar' }));
    const loadCargoCatalog = vi.fn(async () => [{ name: 'Grain' }]);
    const loadTuning = vi.fn(async () => ({ cargoSlots: {} }));
    const calculateCargoSlots = vi.fn(() => 1);
    const runAvailabilityPipeline = vi.fn(() => ({ potentialSlotCount: 1, slotCount: 1, slots: [{ slotNumber: 1, cargo: { name: 'Grain', category: 'food', probability: 100, weight: 1 }, amountEp: 50 }] }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ resolveSettlement, tradingSeason, loadCargoCatalog, loadTuning, calculateCargoSlots, runAvailabilityPipeline });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const rolls = [{ availabilityRoll: 1, cargoRoll: 50, amountRoll: 50 }];
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-check-availability', settlement: 'ALTDORF', rolls });
    expect(res.success).toBe(true);
    expect(resolveSettlement).toHaveBeenCalledWith('ALTDORF');
    expect(runAvailabilityPipeline).toHaveBeenCalledWith({ settlement: RIVER, season: 'spring', cargoCatalog: [{ name: 'Grain' }], tuning: { cargoSlots: {} }, rolls });
    expect(res.data.potentialSlotCount).toBe(1);
    expect(res.data.slotCount).toBe(1);
    expect(res.data.settlement).toBe('ALTDORF');
  });

  it('an unresolvable settlement → TARGET_NOT_FOUND-style refusal', async () => {
    const resolveSettlement = vi.fn(async () => ({ notFound: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ resolveSettlement });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-check-availability', settlement: 'NOWHERE', rolls: [{ availabilityRoll: 1, cargoRoll: 1, amountRoll: 1 }] });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
  });

  it('fewer pre-rolled rolls than the settlement needs this season → typed refusal naming the required count', async () => {
    const resolveSettlement = vi.fn(async () => ({ settlement: RIVER, pack: REIKLAND_PACK }));
    const tradingSeason = vi.fn(() => ({ season: 'spring', seasonSource: 'calendar' }));
    const loadCargoCatalog = vi.fn(async () => []);
    const loadTuning = vi.fn(async () => ({}));
    const calculateCargoSlots = vi.fn(() => 3);
    const runAvailabilityPipeline = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ resolveSettlement, tradingSeason, loadCargoCatalog, loadTuning, calculateCargoSlots, runAvailabilityPipeline });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-check-availability', settlement: 'ALTDORF', rolls: [{ availabilityRoll: 1, cargoRoll: 1, amountRoll: 1 }] });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TRADING_INSUFFICIENT_ROLLS');
    expect(res.error).toContain('3');
    expect(runAvailabilityPipeline).not.toHaveBeenCalled();
  });
});

describe('trading — trading-calc-purchase-price / trading-calc-sale-price', () => {
  it('trading-calc-purchase-price forwards cargoName/quantity/season/quality to quotePurchasePrice', async () => {
    const quotePurchasePrice = vi.fn(async () => ({ pricePerEpBp: 2, totalBp: 200, dialFactor: 1 }));
    const tradingSeason = vi.fn(() => ({ season: 'spring', seasonSource: 'calendar' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ quotePurchasePrice, tradingSeason });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-calc-purchase-price', cargoName: 'Grain', quantity: 100, season: 'summer', quality: 'good' });
    expect(res.success).toBe(true);
    expect(quotePurchasePrice).toHaveBeenCalledWith({ cargoName: 'Grain', quantity: 100, season: 'summer', quality: 'good' });
    expect(res.data).toMatchObject({ cargoName: 'Grain', quantity: 100, season: 'summer', totalBp: 200, pricePerEpBp: 2 });
  });

  it('trading-calc-purchase-price on an unknown cargo → TARGET_NOT_FOUND-style refusal', async () => {
    const quotePurchasePrice = vi.fn(async () => ({ notFound: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ quotePurchasePrice });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-calc-purchase-price', cargoName: 'Unobtainium', quantity: 10 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
  });

  it('trading-calc-sale-price forwards cargoName/quantity/settlementName/season/quality to quoteSalePrice', async () => {
    const quoteSalePrice = vi.fn(async () => ({ pricePerEpBp: 3, totalBp: 300, dialFactor: 1, linkedDemandApplied: null }));
    const tradingSeason = vi.fn(() => ({ season: 'autumn', seasonSource: 'calendar' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ quoteSalePrice, tradingSeason });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-calc-sale-price', cargoName: 'Grain', quantity: 100, settlement: 'ALTDORF', season: 'autumn', quality: 'average' });
    expect(res.success).toBe(true);
    expect(quoteSalePrice).toHaveBeenCalledWith({ cargoName: 'Grain', quantity: 100, settlementName: 'ALTDORF', season: 'autumn', quality: 'average' });
    expect(res.data).toMatchObject({ cargoName: 'Grain', quantity: 100, settlement: 'ALTDORF', totalBp: 300, linkedDemandApplied: null });
  });

  // WHY: linked demand (connected economy) is a standing settlement-data condition computed inside
  // calculateSalePrice/quoteSalePrice — NOT a one-time consumed rumour. trading-calc-sale-price must echo
  // it so a GM can preview the connected-economy bonus before committing to trading-sell-cargo.
  it('trading-calc-sale-price echoes a non-null linkedDemandApplied from quoteSalePrice verbatim', async () => {
    const linkedDemandApplied = { multiplier: 1.25, reason: 'Kemperbad is a metalworking town' };
    const quoteSalePrice = vi.fn(async () => ({ pricePerEpBp: 5, totalBp: 500, dialFactor: 1, linkedDemandApplied }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ quoteSalePrice });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-calc-sale-price', cargoName: 'Ores', quantity: 100, settlement: 'KEMPERBAD', season: 'summer' });
    expect(res.success).toBe(true);
    expect(res.data.linkedDemandApplied).toEqual(linkedDemandApplied);
  });

  it('trading-calc-sale-price at an unresolvable settlement → TARGET_NOT_FOUND-style refusal', async () => {
    const quoteSalePrice = vi.fn(async () => ({ settlementNotFound: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ quoteSalePrice });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-calc-sale-price', cargoName: 'Grain', quantity: 10, settlement: 'NOWHERE' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
  });
});

describe('trading — trading-haggle-test / trading-gossip-test (roll-free engine, pre-rolled totals only)', () => {
  it('trading-haggle-test forwards every field positionally to performHaggleTest', async () => {
    const performHaggleTest = vi.fn(() => ({ success: true, hasDealmakerTalent: true, player: { degrees: 2 }, merchant: { degrees: -1 }, resultDescription: 'Player wins' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ performHaggleTest });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-haggle-test', playerSkill: 50, merchantSkill: 40, playerRoll: 30, merchantRoll: 60, hasDealmakerTalent: true });
    expect(res.success).toBe(true);
    expect(performHaggleTest).toHaveBeenCalledWith(50, 40, true, 30, 60);
    expect(res.data).toMatchObject({ success: true, hasDealmakerTalent: true, resultDescription: 'Player wins' });
  });

  // WHY: Change 2 redesign — a FAILED Gossip Test must never mint (mintAndStoreRumour is still called so
  // the engine's own zero-write no-op is exercised, but gossipSuccess:false must reach it and the response
  // must echo rumourMinted:null, not silently drop the field).
  it('trading-gossip-test forwards playerSkill/playerRoll/difficulty (RAW default -10 when omitted); a failed test mints nothing', async () => {
    const performGossipTest = vi.fn(() => ({ success: false, degrees: -1, resultDescription: 'Gossip Test Failure' }));
    const mintAndStoreRumour = vi.fn(async () => null);
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ performGossipTest, mintAndStoreRumour });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-gossip-test', playerSkill: 45, playerRoll: 80, rumourD100Roll: 37 });
    expect(res.success).toBe(true);
    expect(performGossipTest).toHaveBeenCalledWith(45, 80, -10);
    expect(mintAndStoreRumour).toHaveBeenCalledWith({ gossipSuccess: false, rumourD100Roll: 37 });
    expect(res.data).toMatchObject({ success: false, degrees: -1, rumourMinted: null });
  });

  // WHY: Change 2 redesign — a SUCCESSFUL Gossip Test rolls the RAW 20-band Trade Rumour Table
  // (rumourD100Roll) and mints+stores the row's own rumour; the response must echo the minted rumour
  // verbatim (not just a boolean) so a caller can reference its id later (e.g. trading-delete-rumour).
  it('trading-gossip-test on a successful test mints+stores a rumour and echoes it as rumourMinted', async () => {
    const performGossipTest = vi.fn(() => ({ success: true, degrees: 2, resultDescription: 'Gossip Test Success' }));
    const rumour = { id: 'r1', text: 'Grain fire at the mill', goods: ['Grain'], effect: { kind: 'sellBonus', multiplier: 1.75 }, mintedAt: '2026-01-01T00:00:00.000Z' };
    const mintAndStoreRumour = vi.fn(async () => ({ minted: true, rumour }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ performGossipTest, mintAndStoreRumour });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-gossip-test', playerSkill: 45, playerRoll: 20, rumourD100Roll: 13 });
    expect(res.success).toBe(true);
    expect(mintAndStoreRumour).toHaveBeenCalledWith({ gossipSuccess: true, rumourD100Roll: 13 });
    expect(res.data.rumourMinted).toEqual(rumour);
  });

  it('trading-gossip-test rumour mint persistence failure → WFRP_ECONOMY_NOT_PERSISTED', async () => {
    const performGossipTest = vi.fn(() => ({ success: true, degrees: 1, resultDescription: 'Gossip Test Success' }));
    const mintAndStoreRumour = vi.fn(async () => ({ minted: true, rumour: { id: 'r2' }, persistedCheckFailed: true, detail: 'rumour "r2" absent from tradingRumours after write' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ performGossipTest, mintAndStoreRumour });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-gossip-test', playerSkill: 45, playerRoll: 20, rumourD100Roll: 13 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
  });

  it('a non-GM caller → WFRP_ECONOMY_ACCESS_DENIED (trading-gossip-test is now a real write, GM-gated)', async () => {
    (globalThis as any).game = makeGame({ active: true, isGM: false, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-gossip-test', playerSkill: 45, playerRoll: 80, rumourD100Roll: 37 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_ACCESS_DENIED');
  });
});

describe('trading — trading-buy-cargo (real wallet debit + hold write)', () => {
  it('forwards every buy field to buyCargo (no rumourId param), echoes secretQuality via getHoldRows, and notifies', async () => {
    const buyCargo = vi.fn(async () => ({ bought: true, lotId: 'lot1', totalBp: 1000, walletBalanceBp: 500, rumourApplied: null }));
    const getHoldRows = vi.fn(() => [{ lotId: 'lot1', cargoName: 'Wine/Brandy', secretQuality: { tierIndex: 4, tier: 'Excellent', priceMultiplierPer10Ep: 6 } }]);
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ buyCargo, getHoldRows });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings, actors: { a1: { name: 'Buyer' } } });
    const res: any = await dispatchModuleWfrpEconomy({
      action: 'trading-buy-cargo', actorId: 'a1', cargoName: 'Wine/Brandy', quantity: 50, settlement: 'ALTDORF',
      season: 'spring', quality: 'good', secretQualityD10Roll: 8, originBonusSteps: 2,
    });
    expect(res.success).toBe(true);
    expect(buyCargo).toHaveBeenCalledWith({
      actorId: 'a1', economyId: ECO, cargoName: 'Wine/Brandy', quantity: 50, settlementName: 'ALTDORF', season: 'spring',
      quality: 'good', secretQualityD10Roll: 8, originBonusSteps: 2,
    });
    expect(res.data).toMatchObject({ actorId: 'a1', lotId: 'lot1', cargoName: 'Wine/Brandy', quantity: 50, settlement: 'ALTDORF', totalBp: 1000, walletBalanceBp: 500, rumourApplied: null });
    expect(res.data.secretQuality).toMatchObject({ tier: 'Excellent' });
  });

  // WHY: Change 2 redesign — buyCargo now auto-matches+consumes a stored buyDiscount rumour internally;
  // the MCP response must echo it as rumourApplied so a caller (and the player-facing narration) can see
  // the discount fired, since there is no longer a rumourId request param to correlate against.
  it('echoes rumourApplied when buyCargo auto-consumed a matching buyDiscount rumour', async () => {
    const rumourApplied = { id: 'r3', text: 'Dwarf smith selling cheap pots', multiplier: 0.5 };
    const buyCargo = vi.fn(async () => ({ bought: true, lotId: 'lot2', totalBp: 400, walletBalanceBp: 600, rumourApplied }));
    const getHoldRows = vi.fn(() => [{ lotId: 'lot2', cargoName: 'Metal', secretQuality: null }]);
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ buyCargo, getHoldRows });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings, actors: { a1: {} } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-buy-cargo', actorId: 'a1', cargoName: 'Metal', quantity: 20, settlement: 'ALTDORF' });
    expect(res.success).toBe(true);
    expect(res.data.rumourApplied).toEqual(rumourApplied);
  });

  // WHY (this task, vehicle-materialization response-shape verification): the post-buy secretQuality
  // lookup must use getHoldRows() — NOT getHold() — or a lot materialized as a vehicle-embedded Item
  // (secretQuality lives on the item's flags) would silently echo secretQuality:null even though it was
  // actually assigned, because getHold() only ever reads the abstract tradingCargoHold setting.
  it('looks up the bought lot via getHoldRows (NOT getHold) so vehicle-embedded secretQuality surfaces', async () => {
    const buyCargo = vi.fn(async () => ({ bought: true, lotId: 'itemXYZ', totalBp: 1000, walletBalanceBp: 500, rumourApplied: null }));
    const getHold = vi.fn(() => { throw new Error('getHold() must not be called by trading-buy-cargo'); });
    const getHoldRows = vi.fn(() => [{ lotId: 'itemXYZ', cargoName: 'Wine/Brandy', secretQuality: { tierIndex: 5, tier: 'Top Shelf', priceMultiplierPer10Ep: 8 } }]);
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ buyCargo, getHold, getHoldRows });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings, actors: { a1: {} } });
    const res: any = await dispatchModuleWfrpEconomy({
      action: 'trading-buy-cargo', actorId: 'a1', cargoName: 'Wine/Brandy', quantity: 10, settlement: 'ALTDORF', secretQualityD10Roll: 10,
    });
    expect(res.success).toBe(true);
    expect(getHoldRows).toHaveBeenCalled();
    expect(getHold).not.toHaveBeenCalled();
    expect(res.data.secretQuality).toMatchObject({ tier: 'Top Shelf' });
  });

  it('actor not found → TARGET_NOT_FOUND, engine never called', async () => {
    const buyCargo = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ buyCargo });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings, actors: {} });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-buy-cargo', actorId: 'ghost', cargoName: 'Grain', quantity: 10, settlement: 'ALTDORF' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
    expect(buyCargo).not.toHaveBeenCalled();
  });

  it('hold capacity exceeded → typed refusal, zero notify/wallet-echo', async () => {
    const buyCargo = vi.fn(async () => ({ capacityExceeded: true, capacity: 400, currentHoldEp: 380 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ buyCargo });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings, actors: { a1: {} } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-buy-cargo', actorId: 'a1', cargoName: 'Grain', quantity: 50, settlement: 'ALTDORF' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TRADING_CAPACITY_EXCEEDED');
    expect(res.error).toContain('400');
  });

  it('insufficient wallet funds → WFRP_ECONOMY_NOT_PERSISTED (mirrors invest/stash-deposit precedent)', async () => {
    const buyCargo = vi.fn(async () => ({ insufficientFunds: true, walletBalanceBp: 50, requiredBp: 1000 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ buyCargo });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings, actors: { a1: {} } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-buy-cargo', actorId: 'a1', cargoName: 'Grain', quantity: 50, settlement: 'ALTDORF' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
    expect(res.error).toContain('1000');
  });

  it('a non-GM caller → WFRP_ECONOMY_ACCESS_DENIED (write-action GM gate)', async () => {
    (globalThis as any).game = makeGame({ active: true, isGM: false, settings: makeSettings().settings, actors: { a1: {} } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-buy-cargo', actorId: 'a1', cargoName: 'Grain', quantity: 50, settlement: 'ALTDORF' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_ACCESS_DENIED');
  });
});

describe('trading — trading-sell-cargo (RAW demand gates)', () => {
  // WHY: Change 2 redesign — sellCargo no longer takes a `rumour`/`rumourId` param at all; the engine
  // auto-matches a stored sellBonus rumour by the lot's cargo name internally. This test locks the exact
  // sellCargo call shape (no rumour key present) so a regression that re-adds the old lookup is caught.
  it('forwards every sell field to sellCargo with NO rumour/rumourId key, and echoes the engine\'s rumourApplied', async () => {
    const rumourApplied = { id: 'r1', text: 'Bandits rustling cattle', multiplier: 1.5 };
    const sellCargo = vi.fn(async () => ({ sold: true, totalBp: 800, walletBalanceBp: 900, rumourApplied, linkedDemandApplied: null }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ sellCargo });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings, actors: { a1: {} } });
    const res: any = await dispatchModuleWfrpEconomy({
      action: 'trading-sell-cargo', actorId: 'a1', lotId: 'lot1', settlement: 'KEMPERBAD', isTradeSettlement: true,
      buyerRoll: 20, halfCargoRetryRoll: 40, weeksElapsedSincePurchase: 2, topShelfBuyerRoll: 7,
    });
    expect(res.success).toBe(true);
    expect(sellCargo).toHaveBeenCalledWith({
      actorId: 'a1', economyId: ECO, lotId: 'lot1', settlementName: 'KEMPERBAD', isTradeSettlement: true, buyerRoll: 20,
      halfCargoRetryRoll: 40, weeksElapsedSincePurchase: 2, topShelfBuyerRoll: 7, acceptFireSale: false,
    });
    expect(Object.keys(sellCargo.mock.calls[0][0])).not.toContain('rumour');
    expect(Object.keys(sellCargo.mock.calls[0][0])).not.toContain('rumourId');
    expect(res.data).toMatchObject({ actorId: 'a1', lotId: 'lot1', settlement: 'KEMPERBAD', soldPartial: false, totalBp: 800, walletBalanceBp: 900, rumourApplied, linkedDemandApplied: null });
  });

  it('echoes rumourApplied:null when no sellBonus rumour matched the lot\'s cargo', async () => {
    const sellCargo = vi.fn(async () => ({ sold: true, totalBp: 400, walletBalanceBp: 400, rumourApplied: null, linkedDemandApplied: null }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ sellCargo });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings, actors: { a1: {} } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-sell-cargo', actorId: 'a1', lotId: 'lot1', settlement: 'ALTDORF', isTradeSettlement: false, buyerRoll: 5 });
    expect(res.success).toBe(true);
    expect(res.data.rumourApplied).toBeNull();
  });

  // WHY: linked-demand (connected economy) is a settlement-side sale bonus computed inside
  // calculateSalePrice and threaded through sellCargo's priceResult — distinct from rumourApplied (a
  // one-time consumed rumour). The MCP response must echo it so a caller/narration can see WHY a sale
  // fetched more than the base wealth-adjusted price.
  it('echoes a non-null linkedDemandApplied from sellCargo verbatim', async () => {
    const linkedDemandApplied = { multiplier: 1.25, reason: 'Kemperbad is a metalworking town' };
    const sellCargo = vi.fn(async () => ({ sold: true, totalBp: 1250, walletBalanceBp: 1250, rumourApplied: null, linkedDemandApplied }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ sellCargo });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings, actors: { a1: {} } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-sell-cargo', actorId: 'a1', lotId: 'lot1', settlement: 'KEMPERBAD', isTradeSettlement: false, buyerRoll: 5 });
    expect(res.success).toBe(true);
    expect(res.data.linkedDemandApplied).toEqual(linkedDemandApplied);
  });

  // WHY: linkedDemandApplied must also survive the soldPartial (half-cargo-retry) branch — sellCargo's
  // engine contract carries it on BOTH the `sold` and `soldPartial` return shapes (trading-engine.js:680-682).
  it('echoes linkedDemandApplied on the soldPartial branch too', async () => {
    const linkedDemandApplied = { multiplier: 1.1, reason: 'Altdorf produces Cloth' };
    const sellCargo = vi.fn(async () => ({
      soldPartial: true, quantitySold: 20, quantityRemaining: 20, totalBp: 300, walletBalanceBp: 300,
      rumourApplied: null, linkedDemandApplied,
    }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ sellCargo });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings, actors: { a1: {} } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-sell-cargo', actorId: 'a1', lotId: 'lot1', settlement: 'ALTDORF', isTradeSettlement: false, buyerRoll: 5 });
    expect(res.success).toBe(true);
    expect(res.data).toMatchObject({ soldPartial: true, quantitySold: 20, quantityRemaining: 20, linkedDemandApplied });
  });

  it('a RAW demand-gate refusal (e.g. village non-Grain) → typed refusal naming the gate, zero writes', async () => {
    const sellCargo = vi.fn(async () => ({ refused: true, gate: 'village', verdict: { reason: 'village has no demand for Wine/Brandy outside Grain/Spring' } }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ sellCargo });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings, actors: { a1: {} } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-sell-cargo', actorId: 'a1', lotId: 'lot1', settlement: 'A_VILLAGE', isTradeSettlement: false, buyerRoll: 10 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TRADING_SALE_REFUSED');
    expect(res.error).toContain('village');
  });

  it('lot not found in the hold → TARGET_NOT_FOUND-style refusal', async () => {
    const sellCargo = vi.fn(async () => ({ lotNotFound: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ sellCargo });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings, actors: { a1: {} } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-sell-cargo', actorId: 'a1', lotId: 'ghost', settlement: 'ALTDORF', isTradeSettlement: false, buyerRoll: 10 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
  });
});

describe('trading — trading-delete-rumour (Change 1: GM-only manual removal)', () => {
  it('deletes a stored rumour via deleteRumour and notifies', async () => {
    const deleteRumour = vi.fn(async () => ({ deleted: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ deleteRumour });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-delete-rumour', rumourId: 'r1' });
    expect(res.success).toBe(true);
    expect(deleteRumour).toHaveBeenCalledWith({ rumourId: 'r1' });
    expect(res.data).toMatchObject({ action: 'trading-delete-rumour', rumourId: 'r1', deleted: true });
  });

  it('an unknown rumourId → TARGET_NOT_FOUND', async () => {
    const deleteRumour = vi.fn(async () => ({ notFound: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ deleteRumour });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-delete-rumour', rumourId: 'ghost' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
  });

  it('a persistence-check failure → WFRP_ECONOMY_NOT_PERSISTED', async () => {
    const deleteRumour = vi.fn(async () => ({ deleted: true, persistedCheckFailed: true, detail: 'rumour "r1" still present in tradingRumours after delete' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ deleteRumour });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-delete-rumour', rumourId: 'r1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
  });

  it('a non-GM caller → WFRP_ECONOMY_ACCESS_DENIED (write-action GM gate)', async () => {
    (globalThis as any).game = makeGame({ active: true, isGM: false, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-delete-rumour', rumourId: 'r1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_ACCESS_DENIED');
  });
});

describe('trading — trading-get-hold', () => {
  it('sums quantity across lots and echoes the GM-tunable capacity (manual source)', async () => {
    const getHoldRows = vi.fn(() => [{ lotId: 'l1', quantity: 100 }, { lotId: 'l2', quantity: 40 }]);
    const getCargoCapacityInfo = vi.fn(() => ({ capacity: 400, capacitySource: 'manual', connectedVehicleName: null }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ getHoldRows, getCargoCapacityInfo });
    const { settings } = makeSettings({ tradingCargoCapacity: 400 });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-get-hold' });
    expect(res.success).toBe(true);
    expect(res.data).toMatchObject({ capacity: 400, capacitySource: 'manual', connectedVehicleName: null, currentHoldEp: 140, count: 2 });
  });

  // WHY: post-7f vehicle-linked capacity — trading-get-hold must surface WHICH capacity source is active
  // (a connected vehicle's carries.max vs the flat setting) so a caller can tell why the number changed.
  it('echoes a connected vehicle as the capacity source', async () => {
    const getHoldRows = vi.fn(() => []);
    const getCargoCapacityInfo = vi.fn(() => ({ capacity: 600, capacitySource: 'vehicle', connectedVehicleName: 'The Reik Trader' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ getHoldRows, getCargoCapacityInfo });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-get-hold' });
    expect(res.success).toBe(true);
    expect(res.data).toMatchObject({ capacity: 600, capacitySource: 'vehicle', connectedVehicleName: 'The Reik Trader' });
  });

  // WHY (this task, vehicle-materialization response-shape verification): getHoldRows() is the unified
  // reader across BOTH hold modes (post-7f). The handler must call getHoldRows(), never the RAW getHold()
  // (which only reads the abstract tradingCargoHold setting and would silently show an empty/stale hold
  // once a vehicle is connected, since buyCargo/sellCargo/deleteCargoLot stop writing that setting in
  // vehicle mode). This test locks the exact function called so a regression that reverts to getHold()
  // is caught, and asserts vehicle-sourced rows (which carry the same field shape as manual-mode rows)
  // pass through untouched.
  it('reads hold rows via getHoldRows (NOT getHold) so vehicle-embedded cargo rows surface correctly', async () => {
    const vehicleRow = {
      lotId: 'item123', cargoName: 'Ores', quantity: 60, purchasePricePerEpBp: 4, purchaseTotalBp: 240,
      purchaseSettlement: 'NULN', purchaseSeason: 'summer', purchasedAt: '2026-01-01T00:00:00.000Z', secretQuality: null,
    };
    const getHold = vi.fn(() => { throw new Error('getHold() must not be called by trading-get-hold'); });
    const getHoldRows = vi.fn(() => [vehicleRow]);
    const getCargoCapacityInfo = vi.fn(() => ({ capacity: 600, capacitySource: 'vehicle', connectedVehicleName: 'The Reik Trader' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ getHold, getHoldRows, getCargoCapacityInfo });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-get-hold' });
    expect(res.success).toBe(true);
    expect(getHoldRows).toHaveBeenCalled();
    expect(getHold).not.toHaveBeenCalled();
    expect(res.data).toMatchObject({ count: 1, currentHoldEp: 60, hold: [vehicleRow] });
  });
});

describe('trading — trading-list-vehicle-actors (read-only discover)', () => {
  it('returns the engine\'s unconnected-vehicle-actor list verbatim', async () => {
    const discoverCargoVehicleActors = vi.fn(() => [
      { actorId: 'v1', actorUuid: 'Actor.v1', name: 'The Reik Trader', carriesMax: 600 },
    ]);
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ discoverCargoVehicleActors });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-list-vehicle-actors' });
    expect(res.success).toBe(true);
    expect(res.data).toMatchObject({ count: 1, actors: [{ actorId: 'v1', name: 'The Reik Trader', carriesMax: 600 }] });
  });

  it('is read-only — reachable by a non-GM caller (not in WRITE_ACTIONS)', async () => {
    const discoverCargoVehicleActors = vi.fn(() => []);
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ discoverCargoVehicleActors });
    (globalThis as any).game = makeGame({ active: true, isGM: false, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-list-vehicle-actors' });
    expect(res.success).toBe(true);
  });
});

describe('trading — trading-connect-cargo-vehicle', () => {
  it('happy path delegates to connectCargoVehicle and notifies', async () => {
    const connectCargoVehicle = vi.fn(async () => ({ actorUuid: 'Actor.v1', carriesMax: 600 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ connectCargoVehicle });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings, actors: { v1: { name: 'The Reik Trader' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-connect-cargo-vehicle', actorId: 'v1' });
    expect(res.success).toBe(true);
    expect(connectCargoVehicle).toHaveBeenCalledWith({ actorId: 'v1' });
    expect(res.data).toMatchObject({ actorId: 'v1', actorUuid: 'Actor.v1', carriesMax: 600 });
  });

  it('actor not found in game.actors → TARGET_NOT_FOUND, engine never called', async () => {
    const connectCargoVehicle = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ connectCargoVehicle });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings, actors: {} });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-connect-cargo-vehicle', actorId: 'ghost' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
    expect(connectCargoVehicle).not.toHaveBeenCalled();
  });

  it('engine notFound (actor exists but is not vehicle-type) → TARGET_NOT_FOUND', async () => {
    const connectCargoVehicle = vi.fn(async () => ({ notFound: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ connectCargoVehicle });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings, actors: { v1: { name: 'Not A Vehicle' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-connect-cargo-vehicle', actorId: 'v1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
  });

  it('persistedCheckFailed → WFRP_ECONOMY_NOT_PERSISTED (DP-16)', async () => {
    const connectCargoVehicle = vi.fn(async () => ({ actorUuid: 'Actor.v1', carriesMax: 600, persistedCheckFailed: true, detail: 'mismatch' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ connectCargoVehicle });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings, actors: { v1: { name: 'The Reik Trader' } } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-connect-cargo-vehicle', actorId: 'v1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
  });

  it('a non-GM caller → WFRP_ECONOMY_ACCESS_DENIED (write-action GM gate)', async () => {
    const connectCargoVehicle = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ connectCargoVehicle });
    (globalThis as any).game = makeGame({ active: true, isGM: false, settings: makeSettings().settings, actors: { v1: {} } });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-connect-cargo-vehicle', actorId: 'v1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_ACCESS_DENIED');
    expect(connectCargoVehicle).not.toHaveBeenCalled();
  });
});

describe('trading — trading-disconnect-cargo-vehicle', () => {
  it('happy path delegates to disconnectCargoVehicle and notifies', async () => {
    const disconnectCargoVehicle = vi.fn(async () => ({ disconnected: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ disconnectCargoVehicle });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-disconnect-cargo-vehicle' });
    expect(res.success).toBe(true);
    expect(disconnectCargoVehicle).toHaveBeenCalled();
    expect(res.data).toMatchObject({ disconnected: true });
  });

  it('persistedCheckFailed → WFRP_ECONOMY_NOT_PERSISTED (DP-16)', async () => {
    const disconnectCargoVehicle = vi.fn(async () => ({ disconnected: true, persistedCheckFailed: true, detail: 'mismatch' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ disconnectCargoVehicle });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-disconnect-cargo-vehicle' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
  });

  it('a non-GM caller → WFRP_ECONOMY_ACCESS_DENIED (write-action GM gate)', async () => {
    const disconnectCargoVehicle = vi.fn();
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ disconnectCargoVehicle });
    (globalThis as any).game = makeGame({ active: true, isGM: false, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-disconnect-cargo-vehicle' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_ACCESS_DENIED');
    expect(disconnectCargoVehicle).not.toHaveBeenCalled();
  });
});

describe('trading — trading-list-gazetteers / trading-import-gazetteer / trading-configure-gazetteers', () => {
  it('trading-list-gazetteers merges builtin + imported packs with active flags', async () => {
    const readActiveGazetteerIds = vi.fn(() => ['reikland']);
    const readImportedGazetteers = vi.fn(() => ({ homebrew: { label: 'Homebrew', settlements: [{ name: 'X' }] } }));
    const loadBuiltinPack = vi.fn(async (id: string) => ({ label: id, settlements: [{ name: 'A' }] }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({
      BUILTIN_GAZETTEER_IDS: ['reikland'], readActiveGazetteerIds, readImportedGazetteers, loadBuiltinPack,
    });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-list-gazetteers' });
    expect(res.success).toBe(true);
    expect(res.data.count).toBe(2);
    expect(res.data.activeIds).toEqual(['reikland']);
    expect(res.data.gazetteers.find((g: any) => g.packId === 'reikland')).toMatchObject({ builtin: true, active: true, settlementCount: 1 });
    expect(res.data.gazetteers.find((g: any) => g.packId === 'homebrew')).toMatchObject({ builtin: false, active: false, settlementCount: 1 });
  });

  it('trading-import-gazetteer forwards the raw pack object and echoes settlementCount', async () => {
    const pack = { packId: 'homebrew', label: 'Homebrew', settlements: [{ name: 'X', size: 2, wealth: 2 }] };
    const importGazetteerPack = vi.fn(async () => ({ imported: true, packId: 'homebrew' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ importGazetteerPack });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-import-gazetteer', pack });
    expect(res.success).toBe(true);
    expect(importGazetteerPack).toHaveBeenCalledWith(pack);
    expect(res.data).toMatchObject({ packId: 'homebrew', settlementCount: 1 });
  });

  it('trading-import-gazetteer on a malformed pack → fail-loud refusal, no partial write', async () => {
    const importGazetteerPack = vi.fn(async () => ({ invalidPack: true, detail: 'pack "bad" has no settlements[] array' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ importGazetteerPack });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-import-gazetteer', pack: { packId: 'bad' } });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TRADING_INVALID_GAZETTEER');
    expect(res.error).toContain('no settlements');
  });

  it('trading-configure-gazetteers forwards activeIds exactly', async () => {
    const setActiveGazetteerIds = vi.fn(async (ids: string[]) => ({ active: ids }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setActiveGazetteerIds });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-configure-gazetteers', activeIds: ['reikland', 'averland'] });
    expect(res.success).toBe(true);
    expect(setActiveGazetteerIds).toHaveBeenCalledWith(['reikland', 'averland']);
    expect(res.data.active).toEqual(['reikland', 'averland']);
  });
});

describe('trading — trading-generate-merchant (D4 narrative-only)', () => {
  it('forwards settlement/cargoType/merchantType/percentileRoll (roll REQUIRED — never the engine Math.random fallback)', async () => {
    const resolveSettlement = vi.fn(async () => ({ settlement: RIVER, pack: REIKLAND_PACK }));
    const loadTuning = vi.fn(async () => ({ skillDistribution: { baseSkill: 30 }, specialSourceBehaviors: {} }));
    const generateMerchant = vi.fn(() => ({ id: 'm1', type: 'seeker', settlement: RIVER, cargoType: 'Grain', hagglingSkill: 55, skillDescription: 'Competent', equilibrium: { supply: 1, demand: 1 }, specialBehaviors: [] }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ resolveSettlement, loadTuning, generateMerchant });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-generate-merchant', settlement: 'ALTDORF', cargoType: 'Grain', merchantType: 'seeker', percentileRoll: 63 });
    expect(res.success).toBe(true);
    expect(generateMerchant).toHaveBeenCalledWith(expect.objectContaining({
      settlement: RIVER, cargoType: 'Grain', merchantType: 'seeker', percentileRoll: 63,
      merchantId: expect.any(String), skillDistribution: { baseSkill: 30 }, specialSourceBehaviors: {},
    }));
    expect(res.data).toMatchObject({ type: 'seeker', hagglingSkill: 55, skillDescription: 'Competent' });
  });
});

describe('trading — trading-reveal-quality', () => {
  it('forwards trueTierIndex/evaluateSuccess/sl/misreportDirection and echoes the GM-only true tier', async () => {
    const getHoldRows = vi.fn(() => [{ lotId: 'lot1', cargoName: 'Wine/Brandy', secretQuality: { tierIndex: 5, tier: 'Top Shelf' } }]);
    const revealQuality = vi.fn(() => ({ revealedTierIndex: 3, revealedTier: 'Good', misreported: true, trueTierIndex: 5 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ getHoldRows, revealQuality });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-reveal-quality', lotId: 'lot1', evaluateSuccess: false, sl: -3, misreportDirection: -1 });
    expect(res.success).toBe(true);
    expect(revealQuality).toHaveBeenCalledWith({ trueTierIndex: 5, evaluateSuccess: false, sl: -3, misreportDirection: -1 });
    expect(res.data).toMatchObject({ lotId: 'lot1', cargoName: 'Wine/Brandy', revealedTier: 'Good', misreported: true, trueTier: 'Top Shelf' });
  });

  it('a lot with no secret quality assigned → typed refusal', async () => {
    const getHoldRows = vi.fn(() => [{ lotId: 'lot1', cargoName: 'Grain' }]);
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ getHoldRows });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-reveal-quality', lotId: 'lot1', evaluateSuccess: true, sl: 2 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TRADING_NO_SECRET_QUALITY');
  });

  // WHY (this task, vehicle-materialization response-shape verification): same getHoldRows()-not-getHold()
  // fix as trading-buy-cargo/trading-get-hold — a vehicle-embedded lot's secretQuality would otherwise be
  // silently unreachable (WFRP_ECONOMY_TARGET_NOT_FOUND) since getHold() never sees vehicle-mode cargo.
  it('looks up the lot via getHoldRows (NOT getHold)', async () => {
    const getHold = vi.fn(() => { throw new Error('getHold() must not be called by trading-reveal-quality'); });
    const getHoldRows = vi.fn(() => [{ lotId: 'item1', cargoName: 'Wine/Brandy', secretQuality: { tierIndex: 2, tier: 'Average' } }]);
    const revealQuality = vi.fn(() => ({ revealedTierIndex: 2, revealedTier: 'Average', misreported: false, trueTierIndex: 2 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ getHold, getHoldRows, revealQuality });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-reveal-quality', lotId: 'item1', evaluateSuccess: true, sl: 1 });
    expect(res.success).toBe(true);
    expect(getHoldRows).toHaveBeenCalled();
    expect(getHold).not.toHaveBeenCalled();
  });
});

describe('trading — trading-get-price-modifiers / trading-set-price-modifiers (NEW dial, separate from the old warhammer-mcp namespace one)', () => {
  it('trading-get-price-modifiers reads the wfrp4e-economy-namespace tradingPriceModifiers setting', async () => {
    const { settings } = makeSettings({ tradingPriceModifiers: { global: 1.2, perCargo: { Grain: 0.9 } } });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-get-price-modifiers' });
    expect(res.success).toBe(true);
    expect(res.data).toMatchObject({ global: 1.2, perCargo: { Grain: 0.9 } });
  });

  it('trading-set-price-modifiers merges perCargo (not replaces) and round-trip verifies', async () => {
    const { settings, store } = makeSettings({ tradingPriceModifiers: { global: 1, perCargo: { Grain: 1.1 } } });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-set-price-modifiers', global: 1.5, perCargo: { Wine: 2 } });
    expect(res.success).toBe(true);
    expect(settings.set).toHaveBeenCalledWith('wfrp4e-economy', 'tradingPriceModifiers', { global: 1.5, perCargo: { Grain: 1.1, Wine: 2 } });
    expect(store.tradingPriceModifiers).toEqual({ global: 1.5, perCargo: { Grain: 1.1, Wine: 2 } });
    expect(res.data.current).toEqual({ global: 1.5, perCargo: { Grain: 1.1, Wine: 2 } });
  });

  it('trading-set-price-modifiers { reset:true } restores neutral, ignoring global/perCargo', async () => {
    const { settings, store } = makeSettings({ tradingPriceModifiers: { global: 3, perCargo: { Grain: 5 } } });
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-set-price-modifiers', reset: true, global: 9 });
    expect(res.success).toBe(true);
    expect(store.tradingPriceModifiers).toEqual({ global: 1, perCargo: {} });
  });
});

// F03 fix: the handler now echoes labels/factors from the FORK's CLIMATE_STATES (fork shape: labelKey,
// not label) — mocks provide the fork table so the echo path is exercised end-to-end.
const FORK_CLIMATE_STATES = {
  none: { id: 'none', labelKey: 'financial-system.climate.none', priceFactor: 1, incomeFactor: 1, eventShift: 0 },
  war: { id: 'war', labelKey: 'financial-system.climate.war', priceFactor: 1.40, incomeFactor: 0.80, eventShift: 20 },
  banditry: { id: 'banditry', labelKey: 'financial-system.climate.banditry', priceFactor: 1.15, incomeFactor: 0.85, eventShift: 10 },
};

describe('economic-climate — climate-get-state / climate-set-state (Phase 8, D1/D4/D11; addendum-2 per-economy)', () => {
  it('climate-get-state reads ONE economy\'s record and echoes the full resolved state entry incl. economyId', async () => {
    const getEconomicClimate = vi.fn(() => ({ state: 'war', updatedAt: 12345 }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ getEconomicClimate, CLIMATE_STATES: FORK_CLIMATE_STATES });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings({ economies: [{ id: 'empire', name: 'The Empire' }] }).settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'climate-get-state', economyId: 'empire' });
    expect(res.success).toBe(true);
    expect(getEconomicClimate).toHaveBeenCalledWith('empire');
    expect(res.data).toMatchObject({ action: 'climate-get-state', economyId: 'empire', state: 'war', priceFactor: 1.40, incomeFactor: 0.80, eventShift: 20, updatedAt: 12345 });
  });

  it('climate-get-state falls back to none identity when that economy has never been set', async () => {
    const getEconomicClimate = vi.fn(() => ({ state: 'none', updatedAt: null }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ getEconomicClimate, CLIMATE_STATES: FORK_CLIMATE_STATES });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings({ economies: [{ id: 'brettonia', name: 'Brettonia' }] }).settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'climate-get-state', economyId: 'brettonia' });
    expect(res.success).toBe(true);
    expect(getEconomicClimate).toHaveBeenCalledWith('brettonia');
    expect(res.data).toMatchObject({ economyId: 'brettonia', state: 'none', priceFactor: 1, incomeFactor: 1, eventShift: 0 });
  });

  it('climate-get-state refuses an unknown economyId with TARGET_NOT_FOUND instead of a bogus identity read (Phase 9 S3 finding)', async () => {
    const getEconomicClimate = vi.fn(() => ({ state: 'none', updatedAt: null }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ getEconomicClimate, CLIMATE_STATES: FORK_CLIMATE_STATES });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings({ economies: [{ id: 'empire', name: 'The Empire' }] }).settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'climate-get-state', economyId: 'totally-fake-id' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_TARGET_NOT_FOUND');
    expect(getEconomicClimate).not.toHaveBeenCalled();
  });

  it('climate-set-state forwards economyId + state to setEconomicClimate and round-trip verifies per economy', async () => {
    const written = { state: 'banditry', updatedAt: 99999 };
    const setEconomicClimate = vi.fn(async (_economyId: string, state: string) => ({ state, updatedAt: 99999 }));
    const getEconomicClimate = vi.fn(() => written);
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setEconomicClimate, getEconomicClimate, CLIMATE_STATES: FORK_CLIMATE_STATES });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'climate-set-state', economyId: 'empire', state: 'banditry' });
    expect(res.success).toBe(true);
    expect(setEconomicClimate).toHaveBeenCalledWith('empire', 'banditry');
    expect(getEconomicClimate).toHaveBeenCalledWith('empire');
    expect(res.data).toMatchObject({ action: 'climate-set-state', economyId: 'empire', state: 'banditry', priceFactor: 1.15, incomeFactor: 0.85, eventShift: 10 });
  });

  it('climate-set-state refuses an unknown economyId (economyNotFound) with zero read-back', async () => {
    const setEconomicClimate = vi.fn(async (economyId: string) => ({ economyNotFound: true, economyId }));
    const getEconomicClimate = vi.fn(() => { throw new Error('must not read back after a refused write'); });
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setEconomicClimate, getEconomicClimate, CLIMATE_STATES: FORK_CLIMATE_STATES });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'climate-set-state', economyId: 'nurgle-land', state: 'plague' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('nurgle-land');
    expect(getEconomicClimate).not.toHaveBeenCalled();
  });

  it('climate-set-state returns NOT_PERSISTED when the read-back state does not match what was written', async () => {
    const setEconomicClimate = vi.fn(async (_economyId: string, state: string) => ({ state, updatedAt: 1 }));
    const getEconomicClimate = vi.fn(() => ({ state: 'none', updatedAt: null })); // stale read-back — GM write silently no-op'd
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ setEconomicClimate, getEconomicClimate, CLIMATE_STATES: FORK_CLIMATE_STATES });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'climate-set-state', economyId: 'empire', state: 'siege' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_NOT_PERSISTED');
  });

  it('climate-set-state is GM-gated (WRITE_ACTIONS) — non-GM caller refused before the engine import', async () => {
    (globalThis as any).__wfrpEconomyRuntimeImport = () => { throw new Error('must not import the engine for a refused non-GM write'); };
    (globalThis as any).game = makeGame({ active: true, isGM: false, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'climate-set-state', economyId: 'empire', state: 'plague' });
    expect(res.success).toBe(false);
  });
});

describe('trading — trading-migration-status (D2 seed-once, dial-migration read path)', () => {
  it('a fresh world runs the seed-once migration and reports what was seeded', async () => {
    const ensureMigrated = vi.fn(async () => ({ migrated: true, seededSeason: 'spring', seededHoldCount: 3, seededCapacity: 400, seededDial: true }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ ensureMigrated });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-migration-status' });
    expect(res.success).toBe(true);
    expect(ensureMigrated).toHaveBeenCalledWith();
    expect(res.data).toMatchObject({ migrated: true, alreadyMigrated: false, seededSeason: 'spring', seededHoldCount: 3, seededCapacity: 400, seededDial: true });
  });

  it('a second call is idempotent — reads back alreadyMigrated:true with zero re-seeding', async () => {
    const ensureMigrated = vi.fn(async () => ({ alreadyMigrated: true, migratedFrom: 'trading-places' }));
    (globalThis as any).__wfrpEconomyRuntimeImport = () => ({ ensureMigrated });
    (globalThis as any).game = makeGame({ active: true, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-migration-status' });
    expect(res.success).toBe(true);
    expect(res.data).toMatchObject({ alreadyMigrated: true, migratedFrom: 'trading-places' });
  });

  it('a non-GM caller → WFRP_ECONOMY_ACCESS_DENIED (migration can write on first call)', async () => {
    (globalThis as any).game = makeGame({ active: true, isGM: false, settings: makeSettings().settings });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-migration-status' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('WFRP_ECONOMY_ACCESS_DENIED');
  });
});

describe('trading — inactive module guard covers the new trading idiom too', () => {
  it('inactive wfrp4e-economy → MODULE_NOT_ACTIVE on a trading read action', async () => {
    (globalThis as any).game = makeGame({ active: false });
    const res: any = await dispatchModuleWfrpEconomy({ action: 'trading-get-season' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
  });
});
