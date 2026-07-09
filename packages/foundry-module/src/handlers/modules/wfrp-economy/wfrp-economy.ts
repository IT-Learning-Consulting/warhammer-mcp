// DIALOG-PATH: DIALOG_FREE — module header states no write path touches a Dialog; every write is a raw awaited game.settings.set / game.financial.wallet.* call.
// Module Integration v2 Phase 6 — module-wfrp-economy handler (Warhammer Economy, wfrp4e-economy v1.0.0).
//
// Always-registered umbrella. requireModuleActive('wfrp4e-economy') is the FIRST active-state check —
// RETURNS the MODULE_NOT_ACTIVE envelope, never throws (v1 Phase 1 contract).
//
// 27 actions across 9 idioms (capability_audit/wfrp4e-economy.md + phase6_pre_plan.md §Action surface;
// unified-ledger idiom — record-transaction / delete-account — added Phase 2, wfrp_economy_system_v1_prd.md
// §10). ALL financial state lives in world-scoped game settings (economies / bankers / bankAccounts /
// stockPortfolios / transactionLogs). The 9 transactional writes are driven by runtime-importing the
// module's SocketHandler and calling its AWAITED process method DIRECTLY:
//
//   ⚠ ROUTING DEVIATIONS (phase6_pre_plan §Write access — verified against socket-handler.js):
//     • loan      → SocketHandler._handleLoanProcess(...)  NOT processLoan (non-async, drops await).
//     • transfer  → SocketHandler._handleTransferProcess(...) NOT processTransfer (calls _emit → the
//                   local dispatch re-invokes _handleTransferProcess → DOUBLE-INVOCATION).
//     • stock sale→ SocketHandler.processStockSale(...) NOT broadcastStockSale (BUG A: it emits the
//                   socket action 'processStockSale' which neither switch handles → silently dropped).
//   create-bank → processCreateBank; deposit/withdraw → TransactionProcess; stock buy →
//   processStockPurchase; property → processPropertyPurchase/Sale; rent → processRentedChange.
//
// Every process* / _handle*Process method `await game.settings.set(...)` before returning, so there is
// NO settle-poll anywhere — immediate read-back is consistent (DP-16). economy CRUD + wallet ops are
// raw awaited writes (game.settings.set / game.financial.wallet.*). No write path touches a Dialog
// (advance-day / clearAllFinancialData are EXCLUDED — HC-v2-6 deadlock class).
//
// Confirm-gate (CCR-4): delete-economy (always) + transfer >= LARGE_TRANSFER_THRESHOLD use
// confirm:z.boolean().optional() + a handler `!== true` reject (NOT z.literal(true)).
//
// Source of truth: .agents/research/module_integration/phase6_pre_plan.md +
// capability_audit/wfrp4e-economy.md.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { WfrpEconomyInput, type WfrpEconomyInputType } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { Envelope, getGame, isGM } from '../_shared/handler-utils.js';


const MODULE_ID = 'wfrp4e-economy';
const SETTING_SCOPE = 'wfrp4e-economy';
const LARGE_TRANSFER_THRESHOLD = 4800; // 20 GC — transfers at/above require confirm:true (CCR-4)

// Write actions are GM-gated (warhammer-mcp runs as GM; the module fns also self-guard on isGM and would
// silently no-op for a non-GM, which our read-back verify would then surface as NOT_PERSISTED — reject early).
const WRITE_ACTIONS = new Set([
  'create-economy',
  'update-economy',
  'delete-economy',
  'create-account',
  'deposit',
  'withdraw',
  'transfer',
  'request-loan',
  'repay-loan',
  'buy-stock',
  'sell-stock',
  'buy-property',
  'sell-property',
  'set-rented',
  'wallet-add',
  'wallet-remove',
  'record-transaction',
  'delete-account',
]);

// ── Local helpers ──────────────────────────────────────────────────────────────

function getSetting(key: string): any {
  return getGame()?.settings?.get?.(SETTING_SCOPE, key);
}

async function setSetting(key: string, value: unknown): Promise<void> {
  await getGame().settings.set(SETTING_SCOPE, key, value);
}

function readEconomies(): any[] {
  return getSetting('economies') ?? [];
}
function readBankAccounts(): Record<string, any> {
  return getSetting('bankAccounts') ?? {};
}
function readBankers(): Record<string, any> {
  return getSetting('bankers') ?? {};
}
function readPortfolios(): Record<string, any> {
  return getSetting('stockPortfolios') ?? {};
}

function randomId(): string {
  const f = (globalThis as any).foundry;
  if (f?.utils?.randomID) return f.utils.randomID(16);
  return Math.random().toString(36).slice(2, 18).padEnd(16, '0');
}

function findEconomy(economyId: string): any | null {
  return readEconomies().find((e) => e?.id === economyId) ?? null;
}

function resolveBank(economy: any, bankId: string): any | null {
  return economy?.banks?.find((b: any) => b?.id === bankId) ?? null;
}

/**
 * Build the `banker` descriptor the SocketHandler process methods require. They validate banker.actorId
 * + banker.bankId truthy and use banker.actorId only for a name lookup. We resolve the assigned banker
 * NPC from the `bankers` setting, falling back to the account owner so validation always passes.
 */
function resolveBanker(economyId: string, bankId: string, bankName: string | null, fallbackActorId: string): any {
  const entry = Object.values(readBankers()).find((b: any) => b?.bankId === bankId && b?.economyId === economyId);
  const actorId = (entry as any)?.actorId || fallbackActorId;
  return { actorId, bankId, name: bankName ?? undefined };
}

function actorName(actorId: string | null | undefined): string | null {
  if (!actorId) return null;
  return getGame()?.actors?.get?.(actorId)?.name ?? null;
}

function targetNotFound(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.WFRP_ECONOMY_TARGET_NOT_FOUND}: ${detail}` };
}

function notPersisted(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.WFRP_ECONOMY_NOT_PERSISTED}: ${detail}` };
}

function confirmRequired(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.WFRP_ECONOMY_CONFIRM_REQUIRED}: ${detail}` };
}

/**
 * Runtime ESM import that EVADES esbuild/tsc static resolution (Function indirection). wfrp4e-economy
 * ships its src/ tree as individual servable modules (module.json esmodules is a thin loader), so these
 * URLs resolve and return the cached module namespace. Mirrors augur-nexus.ts L95-103.
 */
const runtimeImport = (specifier: string): Promise<any> => {
  // Test seam: the Function-wrapped dynamic import is un-mockable by vitest. When
  // globalThis.__wfrpEconomyRuntimeImport is a function (set ONLY by the unit tests), use it so the
  // DIRECT-method dispatch is deterministically coverable. Never set in Foundry → the real import runs.
  const override = (globalThis as any).__wfrpEconomyRuntimeImport;
  if (typeof override === 'function') return Promise.resolve(override(specifier));
  return (Function('s', 'return import(s)') as (s: string) => Promise<any>)(specifier);
};

const importSocketHandler = (): Promise<any> =>
  runtimeImport(`/modules/${MODULE_ID}/src/utils/socket-handler.js`).then((m) => m.SocketHandler);
const importTransactionLogger = (): Promise<any> =>
  runtimeImport(`/modules/${MODULE_ID}/src/utils/transaction-logger.js`).then((m) => m.TransactionLogger);

function walletBalance(actorId: string, economyId: string | undefined): number {
  return Number(getGame()?.financial?.wallet?.getBalance?.(actorId, economyId ?? '') ?? 0);
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

export async function dispatchModuleWfrpEconomy(data: unknown): Promise<Envelope<unknown>> {
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: WfrpEconomyInputType;
  try {
    input = WfrpEconomyInput.parse(data);
  } catch (e) {
    return { success: false, error: `WFRP_ECONOMY_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `WFRP_ECONOMY_ACCESS_DENIED: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      // ── stand-up-an-economy ──
      case 'list-economies':
        return handleListEconomies();
      case 'get-economy':
        return handleGetEconomy(input);
      case 'list-bankers':
        return handleListBankers(input);
      case 'create-economy':
        return await handleCreateEconomy(input);
      case 'update-economy':
        return await handleUpdateEconomy(input);
      case 'delete-economy':
        return await handleDeleteEconomy(input);
      // ── open-a-bank-account ──
      case 'create-account':
        return await handleCreateAccount(input);
      case 'list-accounts':
        return handleListAccounts(input);
      // ── run-a-transaction ──
      case 'deposit':
      case 'withdraw':
        return await handleDepositWithdraw(input);
      case 'transfer':
        return await handleTransfer(input);
      // ── loan-cycle ──
      case 'request-loan':
        return await handleRequestLoan(input);
      case 'repay-loan':
        return await handleRepayLoan(input);
      // ── investment-cycle ──
      case 'buy-stock':
        return await handleBuyStock(input);
      case 'sell-stock':
        return await handleSellStock(input);
      case 'get-portfolio':
        return handleGetPortfolio(input);
      // ── property-management ──
      case 'buy-property':
        return await handleBuyProperty(input);
      case 'sell-property':
        return await handleSellProperty(input);
      case 'set-rented':
        return await handleSetRented(input);
      // ── wallet-quick-adjust ──
      case 'get-wallet-balance':
        return handleGetWalletBalance(input);
      case 'wallet-add':
      case 'wallet-remove':
        return await handleWalletAdjust(input);
      // ── audit-the-ledger ──
      case 'list-transactions':
        return await handleListTransactions(input);
      case 'actor-transaction-summary':
        return await handleActorSummary(input);
      case 'bank-transaction-summary':
        return await handleBankSummary(input);
      // ── unified-ledger (Phase 2) ──
      case 'record-transaction':
        return await handleRecordTransaction(input);
      case 'delete-account':
        return await handleDeleteAccount(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `WFRP_ECONOMY_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `WFRP_ECONOMY_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── stand-up-an-economy ──────────────────────────────────────────────────────────

function handleListEconomies(): Envelope<unknown> {
  const economies = readEconomies();
  const list = economies.map((e: any) => ({
    id: e?.id,
    name: e?.name,
    currency: e?.currency ?? '',
    bankCount: e?.banks?.length ?? 0,
    propertyCount: e?.properties?.length ?? 0,
    stockCount: e?.stocks?.length ?? 0,
  }));
  return { success: true, data: { action: 'list-economies', count: list.length, economies: list } };
}

type GetEconomyInput = Extract<WfrpEconomyInputType, { action: 'get-economy' }>;
function handleGetEconomy(input: GetEconomyInput): Envelope<unknown> {
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  return {
    success: true,
    data: {
      action: 'get-economy',
      economyId: economy.id,
      name: economy.name,
      currency: economy.currency ?? '',
      banks: economy.banks ?? [],
      properties: economy.properties ?? [],
      stocks: economy.stocks ?? [],
    },
  };
}

type ListBankersInput = Extract<WfrpEconomyInputType, { action: 'list-bankers' }>;
function handleListBankers(input: ListBankersInput): Envelope<unknown> {
  const bankers = readBankers();
  const list = Object.entries(bankers)
    .map(([bankerId, b]: [string, any]) => ({
      bankerId,
      actorId: b?.actorId,
      bankId: b?.bankId,
      economyId: b?.economyId,
    }))
    .filter((b) => !input.economyId || b.economyId === input.economyId);
  return { success: true, data: { action: 'list-bankers', count: list.length, bankers: list } };
}

type CreateEconomyInput = Extract<WfrpEconomyInputType, { action: 'create-economy' }>;
async function handleCreateEconomy(input: CreateEconomyInput): Promise<Envelope<unknown>> {
  const economyId = randomId();
  const banks = (input.banks ?? []).map((b: any) => ({
    name: 'Bank',
    interestRate: 0,
    loanRate: 5,
    ...b,
    id: typeof b?.id === 'string' && b.id ? b.id : randomId(),
  }));
  const properties = (input.properties ?? []).map((p: any) => ({
    name: 'Property',
    value: 0,
    owner: null,
    ownerName: null,
    purchasedFromBankId: null,
    rented: false,
    ...p,
    id: typeof p?.id === 'string' && p.id ? p.id : randomId(),
  }));
  const stocks = (input.stocks ?? []).map((s: any) => {
    const currentPrice = Number(s?.currentPrice ?? 0);
    return {
      name: 'Stock',
      symbol: 'STK',
      currentPrice,
      availableShares: 0,
      priceHistory: Array.isArray(s?.priceHistory) ? s.priceHistory : [currentPrice],
      ...s,
      id: typeof s?.id === 'string' && s.id ? s.id : randomId(),
    };
  });

  const economy = {
    id: economyId,
    name: input.name,
    currency: input.currency ?? 'Gold Crowns',
    currencySystem: input.currencySystem ?? 'triCurrency',
    imagePath: '',
    banks,
    properties,
    stocks,
  };

  const economies = readEconomies();
  economies.push(economy);
  await setSetting('economies', economies);

  if (!findEconomy(economyId)) return notPersisted(`economy "${economyId}" absent after create`);
  notify.created('wfrp-economy', input.name, { summary: `economy ${economyId} (${banks.length} bank/${stocks.length} stock/${properties.length} prop)` });
  return {
    success: true,
    data: { action: 'create-economy', economyId, name: input.name, bankCount: banks.length, stockCount: stocks.length, propertyCount: properties.length },
  };
}

type UpdateEconomyInput = Extract<WfrpEconomyInputType, { action: 'update-economy' }>;
async function handleUpdateEconomy(input: UpdateEconomyInput): Promise<Envelope<unknown>> {
  const economies = readEconomies();
  const idx = economies.findIndex((e: any) => e?.id === input.economyId);
  if (idx === -1) return targetNotFound(`economy "${input.economyId}" not found`);
  const economy = economies[idx];
  if (input.name !== undefined) economy.name = input.name;
  if (input.currency !== undefined) economy.currency = input.currency;
  if (input.currencySystem !== undefined) economy.currencySystem = input.currencySystem;
  if (input.banks !== undefined) economy.banks = input.banks;
  if (input.properties !== undefined) economy.properties = input.properties;
  if (input.stocks !== undefined) economy.stocks = input.stocks;
  economies[idx] = economy;
  await setSetting('economies', economies);

  const fresh = findEconomy(input.economyId);
  if (input.name !== undefined && fresh?.name !== input.name) {
    return notPersisted(`economy name expected "${input.name}", got "${fresh?.name ?? 'null'}"`);
  }
  notify.updated('wfrp-economy', economy.name, { summary: `economy ${input.economyId} updated` });
  return { success: true, data: { action: 'update-economy', economyId: input.economyId, name: economy.name } };
}

type DeleteEconomyInput = Extract<WfrpEconomyInputType, { action: 'delete-economy' }>;
async function handleDeleteEconomy(input: DeleteEconomyInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(
      `delete-economy "${input.economyId}" purges the economy AND its bank accounts, bankers, stock portfolios, and transaction logs. Re-call with confirm:true.`,
    );
  }
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  const name = economy.name;

  // 5 sequential settings keys (economies + the 4 related stores keyed by economyId).
  await setSetting('economies', readEconomies().filter((e: any) => e?.id !== input.economyId));

  const bankAccounts = readBankAccounts();
  for (const [accId, acc] of Object.entries(bankAccounts)) {
    if ((acc as any)?.economyId === input.economyId) delete bankAccounts[accId];
  }
  await setSetting('bankAccounts', bankAccounts);

  const bankers = readBankers();
  for (const [bId, b] of Object.entries(bankers)) {
    if ((b as any)?.economyId === input.economyId) delete bankers[bId];
  }
  await setSetting('bankers', bankers);

  const portfolios = readPortfolios();
  for (const key of Object.keys(portfolios)) {
    if (key.endsWith(`-${input.economyId}`)) delete portfolios[key];
  }
  await setSetting('stockPortfolios', portfolios);

  const logs = (getSetting('transactionLogs') ?? []).filter((l: any) => l?.economyId !== input.economyId);
  await setSetting('transactionLogs', logs);

  if (findEconomy(input.economyId)) return notPersisted(`economy "${input.economyId}" still present after delete`);
  notify.deleted('wfrp-economy', name, { summary: `economy ${input.economyId} + related stores purged` });
  return { success: true, data: { action: 'delete-economy', economyId: input.economyId, deleted: true } };
}

// ── open-a-bank-account ────────────────────────────────────────────────────────

type CreateAccountInput = Extract<WfrpEconomyInputType, { action: 'create-account' }>;
async function handleCreateAccount(input: CreateAccountInput): Promise<Envelope<unknown>> {
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  if (!resolveBank(economy, input.bankId)) return targetNotFound(`bank "${input.bankId}" not in economy "${input.economyId}"`);
  if (!getGame()?.actors?.get?.(input.actorId)) return targetNotFound(`actor "${input.actorId}" not found`);

  const SocketHandler = await importSocketHandler();
  const bankAccounts = readBankAccounts();
  const before = new Set(Object.keys(bankAccounts));
  // processCreateBank mutates the passed bankAccounts object and `await game.settings.set`s it. It does
  // NOT return the new id, so we diff the keyset.
  await SocketHandler.processCreateBank({
    selectedActorId: input.actorId,
    currentBanker: { bankId: input.bankId, economyId: input.economyId },
    bankAccounts,
  });

  const after = readBankAccounts();
  const newId = Object.keys(after).find((k) => !before.has(k) && after[k]?.actorId === input.actorId && after[k]?.bankId === input.bankId);
  if (!newId) return notPersisted(`no new bank account appeared for actor "${input.actorId}" at bank "${input.bankId}"`);

  notify.created('wfrp-economy', actorName(input.actorId) ?? input.actorId, { summary: `account ${newId} @ ${input.bankId}` });
  return {
    success: true,
    data: { action: 'create-account', economyId: input.economyId, bankId: input.bankId, actorId: input.actorId, accountId: newId, balance: Number(after[newId]?.balance ?? 0) },
  };
}

type ListAccountsInput = Extract<WfrpEconomyInputType, { action: 'list-accounts' }>;
function handleListAccounts(input: ListAccountsInput): Envelope<unknown> {
  const accounts = readBankAccounts();
  const list = Object.entries(accounts)
    .map(([accountId, a]: [string, any]) => ({
      accountId,
      actorId: a?.actorId,
      actorName: actorName(a?.actorId),
      bankId: a?.bankId,
      economyId: a?.economyId,
      balance: Number(a?.balance ?? 0),
      loanActive: Boolean(a?.loan?.active),
      loanAmount: a?.loan?.active ? Number(a?.loan?.amount ?? 0) : null,
    }))
    .filter((a) => (!input.economyId || a.economyId === input.economyId) && (!input.actorId || a.actorId === input.actorId));
  return { success: true, data: { action: 'list-accounts', count: list.length, accounts: list } };
}

// ── run-a-transaction ───────────────────────────────────────────────────────────

type DepositWithdrawInput = Extract<WfrpEconomyInputType, { action: 'deposit' | 'withdraw' }>;
async function handleDepositWithdraw(input: DepositWithdrawInput): Promise<Envelope<unknown>> {
  const accounts = readBankAccounts();
  const account = accounts[input.accountId];
  if (!account) return targetNotFound(`bank account "${input.accountId}" not found`);
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  const bank = resolveBank(economy, account.bankId);
  const actorId: string = account.actorId;
  const beforeBalance = Number(account.balance ?? 0);

  // Pre-validate the funds path the module checks silently (it returns without writing on shortfall).
  if (input.action === 'deposit') {
    const wb = walletBalance(actorId, input.economyId);
    if (input.amountBp > wb) return notPersisted(`deposit of ${input.amountBp} BP exceeds wallet balance ${wb} BP (actor ${actorId})`);
  } else {
    if (input.amountBp > beforeBalance) return notPersisted(`withdraw of ${input.amountBp} BP exceeds account balance ${beforeBalance} BP`);
  }

  const banker = resolveBanker(input.economyId, account.bankId, bank?.name ?? null, actorId);
  const SocketHandler = await importSocketHandler();
  await SocketHandler.TransactionProcess({
    actorId,
    type: input.action,
    economyId: input.economyId,
    currency: economy.currency,
    banker,
    amount: input.amountBp,
  });

  const after = readBankAccounts()[input.accountId];
  const afterBalance = Number(after?.balance ?? 0);
  const expected = input.action === 'deposit' ? beforeBalance + input.amountBp : beforeBalance - input.amountBp;
  if (afterBalance !== expected) {
    return notPersisted(`account balance expected ${expected} BP after ${input.action}, got ${afterBalance} BP`);
  }
  notify.updated('wfrp-economy', actorName(actorId) ?? actorId, { summary: `${input.action} ${input.amountBp} BP → account ${input.accountId}` });
  return {
    success: true,
    data: { action: input.action, accountId: input.accountId, amountBp: input.amountBp, accountBalance: afterBalance, walletBalanceBp: walletBalance(actorId, input.economyId) },
  };
}

type TransferInput = Extract<WfrpEconomyInputType, { action: 'transfer' }>;
async function handleTransfer(input: TransferInput): Promise<Envelope<unknown>> {
  if (input.amountBp >= LARGE_TRANSFER_THRESHOLD && input.confirm !== true) {
    return confirmRequired(`transfer of ${input.amountBp} BP (>= ${LARGE_TRANSFER_THRESHOLD} BP) is a large transfer. Re-call with confirm:true.`);
  }
  const accounts = readBankAccounts();
  const source = accounts[input.sourceAccountId];
  if (!source) return targetNotFound(`source account "${input.sourceAccountId}" not found`);
  const dest = accounts[input.destinationAccountId];
  if (!dest) return targetNotFound(`destination account "${input.destinationAccountId}" not found`);
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  const beforeSource = Number(source.balance ?? 0);
  const beforeDest = Number(dest.balance ?? 0);
  if (input.amountBp > beforeSource) return notPersisted(`transfer of ${input.amountBp} BP exceeds source balance ${beforeSource} BP`);

  const bank = resolveBank(economy, source.bankId);
  const banker = resolveBanker(input.economyId, source.bankId, bank?.name ?? null, source.actorId);
  const SocketHandler = await importSocketHandler();
  await SocketHandler._handleTransferProcess({
    sourceActorId: source.actorId,
    sourceAccountId: input.sourceAccountId,
    destinationAccountId: input.destinationAccountId,
    economyId: input.economyId,
    currency: economy.currency,
    banker,
    amount: input.amountBp,
    description: '',
  });

  const fresh = readBankAccounts();
  const afterSource = Number(fresh[input.sourceAccountId]?.balance ?? 0);
  const afterDest = Number(fresh[input.destinationAccountId]?.balance ?? 0);
  if (afterSource !== beforeSource - input.amountBp || afterDest !== beforeDest + input.amountBp) {
    return notPersisted(`transfer not reflected: source ${beforeSource}->${afterSource}, dest ${beforeDest}->${afterDest} (amount ${input.amountBp})`);
  }
  notify.updated('wfrp-economy', `transfer ${input.amountBp} BP`, { summary: `${input.sourceAccountId} → ${input.destinationAccountId}` });
  return {
    success: true,
    data: { action: 'transfer', sourceAccountId: input.sourceAccountId, destinationAccountId: input.destinationAccountId, amountBp: input.amountBp, sourceBalance: afterSource, destinationBalance: afterDest },
  };
}

// ── loan-cycle ──────────────────────────────────────────────────────────────────

type RequestLoanInput = Extract<WfrpEconomyInputType, { action: 'request-loan' }>;
async function handleRequestLoan(input: RequestLoanInput): Promise<Envelope<unknown>> {
  const accounts = readBankAccounts();
  const account = accounts[input.accountId];
  if (!account) return targetNotFound(`bank account "${input.accountId}" not found`);
  if (account.loan?.active) return notPersisted(`account "${input.accountId}" already has an active loan`);
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  const bank = resolveBank(economy, account.bankId);
  const banker = resolveBanker(input.economyId, account.bankId, bank?.name ?? null, account.actorId);

  const SocketHandler = await importSocketHandler();
  await SocketHandler._handleLoanProcess({
    actorId: account.actorId,
    accountId: input.accountId,
    economyId: input.economyId,
    currency: economy.currency,
    banker,
    amount: input.amountBp,
    interestRate: input.interestRate,
    loanAction: 'request',
  });

  const after = readBankAccounts()[input.accountId];
  if (!after?.loan?.active || Number(after.loan.amount) !== input.amountBp) {
    return notPersisted(`loan not active/wrong amount after request (loan=${JSON.stringify(after?.loan ?? null)})`);
  }
  notify.updated('wfrp-economy', actorName(account.actorId) ?? account.actorId, { summary: `loan ${input.amountBp} BP @ ${after.loan.interest}% on ${input.accountId}` });
  return {
    success: true,
    data: { action: 'request-loan', accountId: input.accountId, amountBp: input.amountBp, loanAmount: Number(after.loan.amount), loanActive: true, accountBalance: Number(after.balance ?? 0) },
  };
}

type RepayLoanInput = Extract<WfrpEconomyInputType, { action: 'repay-loan' }>;
async function handleRepayLoan(input: RepayLoanInput): Promise<Envelope<unknown>> {
  const account = readBankAccounts()[input.accountId];
  if (!account) return targetNotFound(`bank account "${input.accountId}" not found`);
  if (!account.loan?.active) return notPersisted(`account "${input.accountId}" has no active loan to repay`);
  // ALIASING GUARD: game.settings.get returns Foundry's CACHED bankAccounts object reference; the module's
  // _handleLoanProcess mutates account.balance / account.loan.amount IN PLACE on that same object. Snapshot
  // the before-state as PRIMITIVES now, so the post-write verification compares against the true pre-values
  // (not the mutated-in-place reference). Without this, account.balance reads the AFTER value post-call →
  // false WFRP_ECONOMY_NOT_PERSISTED on a repay that actually succeeded.
  const beforeBalance = Number(account.balance ?? 0);
  const beforeLoanAmount = Number(account.loan.amount ?? 0);
  const interest = Number(account.loan.interest ?? 0);
  // The module is interest-bearing: a full payoff costs principal × (1 + interest/100). A repay below that
  // is a valid PARTIAL repayment (reduces principal, loan stays active) — not a failure.
  const totalOwed = beforeLoanAmount + (beforeLoanAmount * interest) / 100;
  if (input.amountBp > beforeBalance) {
    return notPersisted(`repay of ${input.amountBp} BP exceeds account balance ${beforeBalance} BP`);
  }
  if (input.amountBp > totalOwed) {
    return notPersisted(
      `repay of ${input.amountBp} BP exceeds total owed ${totalOwed.toFixed(2)} BP (principal ${beforeLoanAmount} + ${interest}% interest); the module rejects over-repayment`,
    );
  }
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  const bank = resolveBank(economy, account.bankId);
  const banker = resolveBanker(input.economyId, account.bankId, bank?.name ?? null, account.actorId);

  const SocketHandler = await importSocketHandler();
  await SocketHandler._handleLoanProcess({
    actorId: account.actorId,
    accountId: input.accountId,
    economyId: input.economyId,
    currency: economy.currency,
    banker,
    amount: input.amountBp,
    interestRate: interest,
    loanAction: 'repay',
  });

  const after = readBankAccounts()[input.accountId];
  const afterBalance = Number(after?.balance ?? 0);
  if (afterBalance !== beforeBalance - input.amountBp) {
    return notPersisted(`account balance expected ${beforeBalance - input.amountBp} BP after repay, got ${afterBalance} BP`);
  }
  const loanCleared = !after?.loan?.active;
  const remainingLoan = Number(after?.loan?.amount ?? 0);
  // The module clears the loan only when amount >= totalOwed (it leaves loan.amount unchanged but flips
  // active=false). A partial repay keeps the loan active with a reduced principal. Verify the right outcome.
  if (!loanCleared && remainingLoan >= beforeLoanAmount) {
    return notPersisted(`repay did not reduce loan principal (before ${beforeLoanAmount} BP, after ${remainingLoan} BP)`);
  }
  notify.updated('wfrp-economy', actorName(account.actorId) ?? account.actorId, {
    summary: `repaid ${input.amountBp} BP on ${input.accountId}${loanCleared ? ' (loan cleared)' : ` (partial — ${remainingLoan.toFixed(2)} BP principal remains)`}`,
  });
  return {
    success: true,
    data: {
      action: 'repay-loan',
      accountId: input.accountId,
      amountBp: input.amountBp,
      totalOwed,
      loanCleared,
      loanAmount: remainingLoan,
      loanActive: Boolean(after?.loan?.active),
      accountBalance: afterBalance,
    },
  };
}

// ── investment-cycle ────────────────────────────────────────────────────────────

function portfolioHolding(actorId: string, economyId: string, stockId: string): number {
  const key = `${actorId}-${economyId}`;
  return Number(readPortfolios()[key]?.[stockId] ?? 0);
}

type BuyStockInput = Extract<WfrpEconomyInputType, { action: 'buy-stock' }>;
async function handleBuyStock(input: BuyStockInput): Promise<Envelope<unknown>> {
  const accounts = readBankAccounts();
  const account = accounts[input.accountId];
  if (!account) return targetNotFound(`bank account "${input.accountId}" not found`);
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  const stock = economy.stocks?.find((s: any) => s?.id === input.stockId);
  if (!stock) return targetNotFound(`stock "${input.stockId}" not in economy "${input.economyId}"`);
  const totalCost = Number(stock.currentPrice ?? 0) * input.quantity;
  if (totalCost > Number(account.balance ?? 0)) return notPersisted(`buy-stock cost ${totalCost} BP exceeds account balance ${Number(account.balance ?? 0)} BP`);
  if (input.quantity > Number(stock.availableShares ?? 0)) return notPersisted(`buy-stock quantity ${input.quantity} exceeds available shares ${Number(stock.availableShares ?? 0)}`);
  const bank = resolveBank(economy, account.bankId);
  const beforeHolding = portfolioHolding(account.actorId, input.economyId, input.stockId);

  const SocketHandler = await importSocketHandler();
  await SocketHandler.processStockPurchase({
    actorId: account.actorId,
    stockId: input.stockId,
    quantity: input.quantity,
    economyId: input.economyId,
    bankId: account.bankId,
    bankName: bank?.name ?? 'Bank',
    totalCost,
    currency: economy.currency,
    stockName: stock.name,
    stockSymbol: stock.symbol,
  });

  const afterHolding = portfolioHolding(account.actorId, input.economyId, input.stockId);
  if (afterHolding !== beforeHolding + input.quantity) {
    return notPersisted(`portfolio holding expected ${beforeHolding + input.quantity}, got ${afterHolding} after buy-stock`);
  }
  notify.updated('wfrp-economy', actorName(account.actorId) ?? account.actorId, { summary: `bought ${input.quantity}× ${stock.symbol} for ${totalCost} BP` });
  return {
    success: true,
    data: { action: 'buy-stock', accountId: input.accountId, stockId: input.stockId, quantity: input.quantity, totalBp: totalCost, holding: afterHolding, accountBalance: Number(readBankAccounts()[input.accountId]?.balance ?? 0) },
  };
}

type SellStockInput = Extract<WfrpEconomyInputType, { action: 'sell-stock' }>;
async function handleSellStock(input: SellStockInput): Promise<Envelope<unknown>> {
  const accounts = readBankAccounts();
  const account = accounts[input.accountId];
  if (!account) return targetNotFound(`bank account "${input.accountId}" not found`);
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  const stock = economy.stocks?.find((s: any) => s?.id === input.stockId);
  if (!stock) return targetNotFound(`stock "${input.stockId}" not in economy "${input.economyId}"`);
  const beforeHolding = portfolioHolding(account.actorId, input.economyId, input.stockId);
  if (input.quantity > beforeHolding) return notPersisted(`sell-stock quantity ${input.quantity} exceeds holding ${beforeHolding}`);
  const totalValue = Number(stock.currentPrice ?? 0) * input.quantity;
  const bank = resolveBank(economy, account.bankId);

  // ROUTING DEVIATION: processStockSale DIRECT (NOT broadcastStockSale — the BUG-A broken socket path).
  const SocketHandler = await importSocketHandler();
  await SocketHandler.processStockSale({
    actorId: account.actorId,
    stockId: input.stockId,
    quantity: input.quantity,
    economyId: input.economyId,
    bankId: account.bankId,
    bankName: bank?.name ?? 'Bank',
    totalValue,
    currency: economy.currency,
    stockName: stock.name,
    stockSymbol: stock.symbol,
  });

  const afterHolding = portfolioHolding(account.actorId, input.economyId, input.stockId);
  if (afterHolding !== beforeHolding - input.quantity) {
    return notPersisted(`portfolio holding expected ${beforeHolding - input.quantity}, got ${afterHolding} after sell-stock`);
  }
  notify.updated('wfrp-economy', actorName(account.actorId) ?? account.actorId, { summary: `sold ${input.quantity}× ${stock.symbol} for ${totalValue} BP` });
  return {
    success: true,
    data: { action: 'sell-stock', accountId: input.accountId, stockId: input.stockId, quantity: input.quantity, totalBp: totalValue, holding: afterHolding, accountBalance: Number(readBankAccounts()[input.accountId]?.balance ?? 0) },
  };
}

type GetPortfolioInput = Extract<WfrpEconomyInputType, { action: 'get-portfolio' }>;
function handleGetPortfolio(input: GetPortfolioInput): Envelope<unknown> {
  const key = `${input.actorId}-${input.economyId}`;
  const holdingsRaw = readPortfolios()[key] ?? {};
  const economy = findEconomy(input.economyId);
  const holdings = Object.entries(holdingsRaw).map(([stockId, qty]: [string, any]) => {
    const stock = economy?.stocks?.find((s: any) => s?.id === stockId);
    const quantity = Number(qty ?? 0);
    const currentPrice = stock ? Number(stock.currentPrice ?? 0) : null;
    return {
      stockId,
      stockName: stock?.name ?? null,
      symbol: stock?.symbol ?? null,
      quantity,
      currentPrice,
      valueBp: currentPrice !== null ? currentPrice * quantity : null,
    };
  });
  return { success: true, data: { action: 'get-portfolio', actorId: input.actorId, economyId: input.economyId, holdingCount: holdings.length, holdings } };
}

// ── property-management ─────────────────────────────────────────────────────────

type BuyPropertyInput = Extract<WfrpEconomyInputType, { action: 'buy-property' }>;
async function handleBuyProperty(input: BuyPropertyInput): Promise<Envelope<unknown>> {
  const accounts = readBankAccounts();
  const account = accounts[input.accountId];
  if (!account) return targetNotFound(`bank account "${input.accountId}" not found`);
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  const property = economy.properties?.find((p: any) => p?.id === input.propertyId);
  if (!property) return targetNotFound(`property "${input.propertyId}" not in economy "${input.economyId}"`);
  if (property.owner) return notPersisted(`property "${input.propertyId}" already owned by ${property.owner}`);
  const propertyValue = Number(property.value ?? 0);
  if (propertyValue > Number(account.balance ?? 0)) return notPersisted(`property value ${propertyValue} BP exceeds account balance ${Number(account.balance ?? 0)} BP`);
  const bank = resolveBank(economy, account.bankId);

  const SocketHandler = await importSocketHandler();
  await SocketHandler.processPropertyPurchase({
    actorId: account.actorId,
    propertyId: input.propertyId,
    economyId: input.economyId,
    bankId: account.bankId,
    bankName: bank?.name ?? 'Bank',
    propertyValue,
    currency: economy.currency,
    propertyName: property.name,
  });

  const freshProp = findEconomy(input.economyId)?.properties?.find((p: any) => p?.id === input.propertyId);
  if (freshProp?.owner !== account.actorId) {
    return notPersisted(`property owner expected ${account.actorId}, got ${freshProp?.owner ?? 'null'} after buy-property`);
  }
  notify.updated('wfrp-economy', property.name, { summary: `bought by ${actorName(account.actorId) ?? account.actorId} for ${propertyValue} BP` });
  return {
    success: true,
    data: { action: 'buy-property', propertyId: input.propertyId, accountId: input.accountId, owner: account.actorId, ownerName: actorName(account.actorId), accountBalance: Number(readBankAccounts()[input.accountId]?.balance ?? 0) },
  };
}

type SellPropertyInput = Extract<WfrpEconomyInputType, { action: 'sell-property' }>;
async function handleSellProperty(input: SellPropertyInput): Promise<Envelope<unknown>> {
  const accounts = readBankAccounts();
  const account = accounts[input.accountId];
  if (!account) return targetNotFound(`bank account "${input.accountId}" not found`);
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  const property = economy.properties?.find((p: any) => p?.id === input.propertyId);
  if (!property) return targetNotFound(`property "${input.propertyId}" not in economy "${input.economyId}"`);
  if (property.owner !== account.actorId) return notPersisted(`property "${input.propertyId}" not owned by account holder ${account.actorId} (owner=${property.owner ?? 'null'})`);
  // GM-configurable rate (Phase 2, default 0.8) — matches the module UI's sell path, which reads the
  // same setting (bank-property-manager.js). Was previously the full property value (parity gap).
  const propertySaleRate = Number(getGame()?.settings?.get?.(SETTING_SCOPE, 'propertySaleRate') ?? 0.8);
  const saleValue = Math.round(Number(property.value ?? 0) * propertySaleRate);
  const bank = resolveBank(economy, account.bankId);

  const SocketHandler = await importSocketHandler();
  await SocketHandler.processPropertySale({
    actorId: account.actorId,
    propertyId: input.propertyId,
    economyId: input.economyId,
    bankId: account.bankId,
    bankName: bank?.name ?? 'Bank',
    saleValue,
    currency: economy.currency,
    propertyName: property.name,
  });

  const freshProp = findEconomy(input.economyId)?.properties?.find((p: any) => p?.id === input.propertyId);
  if (freshProp?.owner !== null && freshProp?.owner !== undefined) {
    return notPersisted(`property owner expected null after sell-property, got ${freshProp?.owner}`);
  }
  notify.updated('wfrp-economy', property.name, { summary: `sold by ${actorName(account.actorId) ?? account.actorId} for ${saleValue} BP` });
  return {
    success: true,
    data: { action: 'sell-property', propertyId: input.propertyId, accountId: input.accountId, accountBalance: Number(readBankAccounts()[input.accountId]?.balance ?? 0) },
  };
}

type SetRentedInput = Extract<WfrpEconomyInputType, { action: 'set-rented' }>;
async function handleSetRented(input: SetRentedInput): Promise<Envelope<unknown>> {
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  const property = economy.properties?.find((p: any) => p?.id === input.propertyId);
  if (!property) return targetNotFound(`property "${input.propertyId}" not in economy "${input.economyId}"`);

  const firstBanker = Object.values(readBankers()).find((b: any) => b?.economyId === input.economyId) as any;
  const currentBanker = {
    bankId: property.purchasedFromBankId ?? firstBanker?.bankId ?? economy.banks?.[0]?.id ?? null,
    actorId: property.owner ?? firstBanker?.actorId ?? null,
  };

  const SocketHandler = await importSocketHandler();
  await SocketHandler.processRentedChange({
    propertyId: input.propertyId,
    isRented: input.rented,
    currentBanker,
    economy,
    selectedAccountIds: {},
  });

  const freshProp = findEconomy(input.economyId)?.properties?.find((p: any) => p?.id === input.propertyId);
  if (Boolean(freshProp?.rented) !== input.rented) {
    return notPersisted(`property rented expected ${input.rented}, got ${Boolean(freshProp?.rented)} after set-rented`);
  }
  notify.updated('wfrp-economy', property.name, { summary: `rented → ${input.rented}` });
  return { success: true, data: { action: 'set-rented', propertyId: input.propertyId, rented: input.rented } };
}

// ── wallet-quick-adjust ─────────────────────────────────────────────────────────

type GetWalletInput = Extract<WfrpEconomyInputType, { action: 'get-wallet-balance' }>;
function handleGetWalletBalance(input: GetWalletInput): Envelope<unknown> {
  if (!getGame()?.actors?.get?.(input.actorId)) return targetNotFound(`actor "${input.actorId}" not found`);
  return { success: true, data: { action: 'get-wallet-balance', actorId: input.actorId, balanceBp: walletBalance(input.actorId, input.economyId) } };
}

type WalletAdjustInput = Extract<WfrpEconomyInputType, { action: 'wallet-add' | 'wallet-remove' }>;
async function handleWalletAdjust(input: WalletAdjustInput): Promise<Envelope<unknown>> {
  if (!getGame()?.actors?.get?.(input.actorId)) return targetNotFound(`actor "${input.actorId}" not found`);
  const before = walletBalance(input.actorId, input.economyId);
  const wallet = getGame()?.financial?.wallet;
  if (!wallet) return targetNotFound('game.financial.wallet is unavailable (module not ready)');

  if (input.action === 'wallet-add') {
    await wallet.addFunds(input.actorId, input.economyId ?? '', input.amountBp);
  } else {
    await wallet.removeFunds(input.actorId, input.economyId ?? '', input.amountBp);
  }

  const after = walletBalance(input.actorId, input.economyId);
  const expected = input.action === 'wallet-add' ? before + input.amountBp : Math.max(0, before - input.amountBp);
  if (after !== expected) {
    return notPersisted(`wallet balance expected ${expected} BP after ${input.action}, got ${after} BP (actor may lack money items)`);
  }
  notify.updated('wfrp-economy', actorName(input.actorId) ?? input.actorId, { summary: `${input.action} ${input.amountBp} BP → ${after} BP` });
  return { success: true, data: { action: input.action, actorId: input.actorId, amountBp: input.amountBp, balanceBp: after } };
}

// ── audit-the-ledger ────────────────────────────────────────────────────────────

type ListTxInput = Extract<WfrpEconomyInputType, { action: 'list-transactions' }>;
async function handleListTransactions(input: ListTxInput): Promise<Envelope<unknown>> {
  const TransactionLogger = await importTransactionLogger();
  const filters: Record<string, unknown> = {};
  if (input.actorId) filters.actorId = input.actorId;
  if (input.economyId) filters.economyId = input.economyId;
  if (input.type) filters.type = input.type;
  if (input.bankId) filters.bankId = input.bankId;
  if (input.source) filters.source = input.source;
  const logs = TransactionLogger.getTransactionLogs(filters) ?? [];
  const list = logs.map((l: any) => ({
    id: l?.id,
    type: l?.type,
    source: l?.source ?? null,
    actorId: l?.actorId ?? null,
    actorName: l?.actorName ?? null,
    economyId: l?.economyId ?? null,
    bankId: l?.bankId ?? null,
    amount: Number(l?.amount ?? 0),
    amountDisplay: l?.amountDisplay ?? null,
    description: l?.description ?? '',
    date: l?.date ?? null,
  }));
  return { success: true, data: { action: 'list-transactions', count: list.length, transactions: list } };
}

// BUG-471 (D5): re-bucket the module's summary at READ, WITHOUT patching wfrp4e-economy. The module
// aggregators (transaction-logger.js getActor/getBankTransactionSummary) match stock sales by
// 'stock_sale' (underscore) while rows are logged 'stock-sale' (hyphen), and only credit actor-side
// loans under the targetActorId clause — so a borrower-actor's own loan and every hyphen-spelled stock
// sale silently drop to 0. Re-derive both from the FULL logs (both spellings, both actor sides), and
// localize raw i18n-key descriptions (e.g. the withdraw row `financial-system.bank.transactions.withdraw`)
// in recentTransactions. The summary itself only carries recentTransactions.slice(0,5), so we re-read
// via getTransactionLogs. On any module-shape drift the caller keeps the unmodified module summary.
export function rebucketEconomySummary(summary: any, logs: any[], scope: { actorId?: string }): void {
  const isStockSale = (t: unknown) => t === 'stock-sale' || t === 'stock_sale';
  const inScope = (l: any) => (scope.actorId ? l?.actorId === scope.actorId || l?.targetActorId === scope.actorId : true);
  const sum = (pred: (l: any) => boolean) =>
    logs.filter((l) => inScope(l) && pred(l)).reduce((s: number, l: any) => s + (Number(l?.amount) || 0), 0);
  summary.totalStockSales = sum((l) => isStockSale(l?.type));
  summary.totalLoans = sum((l) => String(l?.type) === 'loan');
  // Displays were formatted from the module's stale (0) totals — restate in the base BP unit so they
  // don't contradict the corrected numerics (Rule 12: no silent stale field).
  summary.totalStockSalesDisplay = `${summary.totalStockSales} BP`;
  summary.totalLoansDisplay = `${summary.totalLoans} BP`;
  const i18n = (globalThis as any).game?.i18n;
  if (i18n?.localize && Array.isArray(summary.recentTransactions)) {
    summary.recentTransactions = summary.recentTransactions.map((tx: any) => {
      const d = tx?.description;
      if (typeof d === 'string' && !d.includes(' ') && /^[a-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(d)) {
        const loc = i18n.localize(d);
        if (loc && loc !== d) return { ...tx, description: loc };
      }
      return tx;
    });
  }
}

type ActorSummaryInput = Extract<WfrpEconomyInputType, { action: 'actor-transaction-summary' }>;
async function handleActorSummary(input: ActorSummaryInput): Promise<Envelope<unknown>> {
  const TransactionLogger = await importTransactionLogger();
  const summary = TransactionLogger.getActorTransactionSummary(input.actorId, input.economyId) ?? {};
  try {
    const logs: any[] = TransactionLogger.getTransactionLogs?.({ actorId: input.actorId, economyId: input.economyId }) ?? [];
    rebucketEconomySummary(summary, logs, { actorId: input.actorId });
  } catch { /* module-shape drift — return the module summary unmodified */ }
  return { success: true, data: { action: 'actor-transaction-summary', actorId: input.actorId, economyId: input.economyId, summary } };
}

type BankSummaryInput = Extract<WfrpEconomyInputType, { action: 'bank-transaction-summary' }>;
async function handleBankSummary(input: BankSummaryInput): Promise<Envelope<unknown>> {
  const TransactionLogger = await importTransactionLogger();
  const summary = TransactionLogger.getBankTransactionSummary(input.bankId, input.economyId) ?? {};
  try {
    const logs: any[] = TransactionLogger.getTransactionLogs?.({ bankId: input.bankId, economyId: input.economyId }) ?? [];
    rebucketEconomySummary(summary, logs, {});
  } catch { /* module-shape drift — return the module summary unmodified */ }
  return { success: true, data: { action: 'bank-transaction-summary', bankId: input.bankId, economyId: input.economyId, summary } };
}

// ── unified-ledger (Phase 2, wfrp_economy_system) ───────────────────────────────
//
// Hybrid MCP-layer seam (Option D, phase2_pre_plan.md §Recommended approach): record-transaction is the
// arbitrary-append entry point for callers OUTSIDE this module's own 9 tracked ops (status earnings,
// /wfrp-trade, item-piles, future levies). The module's own 9 handlers above (deposit/withdraw/transfer/
// loan/stock/property) do NOT call this — they already log via TransactionLogger internally (R2.2, no
// double-log). delete-account mirrors delete-economy's confirm idiom exactly (generic confirmRequired/
// notPersisted/targetNotFound helpers, NOT bespoke per-action error tokens — matches every other action
// in this file; Rule 11 codebase-convention match over the plan's literal "WFRP_ECONOMY_DELETE_*" token
// wording).

type RecordTransactionInput = Extract<WfrpEconomyInputType, { action: 'record-transaction' }>;
async function handleRecordTransaction(input: RecordTransactionInput): Promise<Envelope<unknown>> {
  const actor = getGame()?.actors?.get?.(input.actorId);
  if (!actor) return targetNotFound(`actor "${input.actorId}" not found`);

  const TransactionLogger = await importTransactionLogger();
  const transactionId: string = await TransactionLogger.logTransaction({
    type: input.type,
    source: input.source,
    actorId: input.actorId,
    actorName: actor.name,
    economyId: input.economyId,
    bankId: input.bankId,
    amount: input.amountBp,
    currency: input.currency,
    description: input.description,
    targetActorId: input.targetActorId,
    targetActorName: actorName(input.targetActorId),
  });

  const verifyLogs: any[] = TransactionLogger.getTransactionLogs?.({ source: input.source }) ?? [];
  if (!verifyLogs.some((l: any) => l?.id === transactionId)) {
    return notPersisted(`transaction "${transactionId}" not found in ledger after record-transaction`);
  }
  notify.created('wfrp-economy', actor.name, { summary: `${input.source}/${input.type} ${input.amountBp} BP logged (${transactionId})` });
  return {
    success: true,
    data: { action: 'record-transaction', actorId: input.actorId, amountBp: input.amountBp, source: input.source, type: input.type, transactionId },
  };
}

type DeleteAccountInput = Extract<WfrpEconomyInputType, { action: 'delete-account' }>;
async function handleDeleteAccount(input: DeleteAccountInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`delete-account "${input.accountId}" removes the account record (transaction history is kept). Re-call with confirm:true.`);
  }
  const bankAccounts = readBankAccounts();
  const account = bankAccounts[input.accountId];
  if (!account) return targetNotFound(`bank account "${input.accountId}" not found`);

  const SocketHandler = await importSocketHandler();
  await SocketHandler.processDeleteAccount({ accountId: input.accountId, bankAccounts });

  if (readBankAccounts()[input.accountId]) return notPersisted(`bank account "${input.accountId}" still present after delete-account`);
  notify.deleted('wfrp-economy', actorName(account.actorId) ?? input.accountId, { summary: `account ${input.accountId} deleted` });
  return { success: true, data: { action: 'delete-account', accountId: input.accountId, deleted: true } };
}
