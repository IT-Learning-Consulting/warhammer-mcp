// Module Integration v2 Phase 6 — module-wfrp-economy mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool layer
// only needs typed response shapes for this.query<T> (DP-15 — never <any>).
//
// Warhammer Economy v1.0.0. 29 actions across 10 idioms (unified-ledger: record-transaction /
// delete-account added Phase 2; levy-and-burn: apply-levies / money-to-burn added Phase 4,
// wfrp_economy_system_v1_prd.md §10). Each handler return carries `action` as a discriminant;
// WfrpEconomyResult is their union so the tool stays typed without <any>.

export interface WfrpEconomySummary {
  id: string;
  name: string;
  currency: string;
  bankCount: number;
  propertyCount: number;
  stockCount: number;
}

export interface WfrpEconomyListEconomiesResult {
  action: 'list-economies';
  count: number;
  economies: WfrpEconomySummary[];
}

export interface WfrpEconomyGetEconomyResult {
  action: 'get-economy';
  economyId: string;
  name: string;
  currency: string;
  banks: Array<Record<string, unknown>>;
  properties: Array<Record<string, unknown>>;
  stocks: Array<Record<string, unknown>>;
}

export interface WfrpEconomyBankerEntry {
  bankerId: string;
  actorId: string;
  bankId: string;
  economyId: string;
}

export interface WfrpEconomyListBankersResult {
  action: 'list-bankers';
  count: number;
  bankers: WfrpEconomyBankerEntry[];
}

export interface WfrpEconomyCreateEconomyResult {
  action: 'create-economy';
  economyId: string;
  name: string;
  bankCount: number;
  stockCount: number;
  propertyCount: number;
}

export interface WfrpEconomyUpdateEconomyResult {
  action: 'update-economy';
  economyId: string;
  name: string;
}

export interface WfrpEconomyDeleteEconomyResult {
  action: 'delete-economy';
  economyId: string;
  deleted: boolean;
}

export interface WfrpEconomyCreateAccountResult {
  action: 'create-account';
  economyId: string;
  bankId: string;
  actorId: string;
  accountId: string;
  balance: number;
}

export interface WfrpEconomyAccountEntry {
  accountId: string;
  actorId: string;
  actorName: string | null;
  bankId: string;
  economyId: string;
  balance: number;
  loanActive: boolean;
  loanAmount: number | null;
}

export interface WfrpEconomyListAccountsResult {
  action: 'list-accounts';
  count: number;
  accounts: WfrpEconomyAccountEntry[];
}

export interface WfrpEconomyTransactionResult {
  action: 'deposit' | 'withdraw';
  accountId: string;
  amountBp: number;
  accountBalance: number;
  walletBalanceBp: number;
}

export interface WfrpEconomyTransferResult {
  action: 'transfer';
  sourceAccountId: string;
  destinationAccountId: string;
  amountBp: number;
  sourceBalance: number;
  destinationBalance: number;
}

export interface WfrpEconomyLoanResult {
  action: 'request-loan' | 'repay-loan';
  accountId: string;
  amountBp: number;
  loanAmount: number;
  loanActive: boolean;
  accountBalance: number;
}

export interface WfrpEconomyStockTradeResult {
  action: 'buy-stock' | 'sell-stock';
  accountId: string;
  stockId: string;
  quantity: number;
  totalBp: number;
  holding: number;
  accountBalance: number;
}

export interface WfrpEconomyPortfolioHolding {
  stockId: string;
  stockName: string | null;
  symbol: string | null;
  quantity: number;
  currentPrice: number | null;
  valueBp: number | null;
}

export interface WfrpEconomyPortfolioResult {
  action: 'get-portfolio';
  actorId: string;
  economyId: string;
  holdingCount: number;
  holdings: WfrpEconomyPortfolioHolding[];
}

export interface WfrpEconomyBuyPropertyResult {
  action: 'buy-property';
  propertyId: string;
  accountId: string;
  owner: string;
  ownerName: string | null;
  accountBalance: number;
}

export interface WfrpEconomySellPropertyResult {
  action: 'sell-property';
  propertyId: string;
  accountId: string;
  accountBalance: number;
}

export interface WfrpEconomySetRentedResult {
  action: 'set-rented';
  propertyId: string;
  rented: boolean;
}

export interface WfrpEconomyWalletBalanceResult {
  action: 'get-wallet-balance';
  actorId: string;
  balanceBp: number;
}

export interface WfrpEconomyWalletAdjustResult {
  action: 'wallet-add' | 'wallet-remove';
  actorId: string;
  amountBp: number;
  balanceBp: number;
}

export interface WfrpEconomyTransactionEntry {
  id: string;
  type: string;
  source: string | null;
  actorId: string | null;
  actorName: string | null;
  economyId: string | null;
  bankId: string | null;
  amount: number;
  amountDisplay: string | number | null;
  description: string;
  date: string | null;
}

export interface WfrpEconomyListTransactionsResult {
  action: 'list-transactions';
  count: number;
  transactions: WfrpEconomyTransactionEntry[];
}

export interface WfrpEconomyActorSummaryResult {
  action: 'actor-transaction-summary';
  actorId: string;
  economyId: string;
  summary: Record<string, unknown>;
}

export interface WfrpEconomyBankSummaryResult {
  action: 'bank-transaction-summary';
  bankId: string;
  economyId: string;
  summary: Record<string, unknown>;
}

export interface WfrpEconomyRecordTransactionResult {
  action: 'record-transaction';
  actorId: string;
  amountBp: number;
  source: string;
  type: string;
  transactionId: string;
}

export interface WfrpEconomyDeleteAccountResult {
  action: 'delete-account';
  accountId: string;
  deleted: boolean;
}

// ── levy-and-burn idiom (Phase 4, wfrp_economy_system) ──────────────────────────

export interface WfrpEconomyLevyVerdict {
  actorId: string;
  actorName: string | null;
  levyId: string;
  chargedBp: number;
  paid: boolean;
  declined: boolean;
  modifierDelta: number;
}

export interface WfrpEconomyRefusal {
  actorId: string;
  reason: string;
}

export interface WfrpEconomyApplyLeviesResult {
  action: 'apply-levies';
  dryRun: boolean;
  elapsedWeeks: number;
  weekIndex: number | null;
  verdicts: WfrpEconomyLevyVerdict[];
  refused: WfrpEconomyRefusal[];
}

export interface WfrpEconomyMoneyToBurnVerdict {
  actorId: string;
  actorName: string | null;
  wipedBp: number;
  protectedBp: number;
}

export interface WfrpEconomyMoneyToBurnResult {
  action: 'money-to-burn';
  dryRun: boolean;
  verdicts: WfrpEconomyMoneyToBurnVerdict[];
  refused: WfrpEconomyRefusal[];
}

export type WfrpEconomyResult =
  | WfrpEconomyListEconomiesResult
  | WfrpEconomyGetEconomyResult
  | WfrpEconomyListBankersResult
  | WfrpEconomyCreateEconomyResult
  | WfrpEconomyUpdateEconomyResult
  | WfrpEconomyDeleteEconomyResult
  | WfrpEconomyCreateAccountResult
  | WfrpEconomyListAccountsResult
  | WfrpEconomyTransactionResult
  | WfrpEconomyTransferResult
  | WfrpEconomyLoanResult
  | WfrpEconomyStockTradeResult
  | WfrpEconomyPortfolioResult
  | WfrpEconomyBuyPropertyResult
  | WfrpEconomySellPropertyResult
  | WfrpEconomySetRentedResult
  | WfrpEconomyWalletBalanceResult
  | WfrpEconomyWalletAdjustResult
  | WfrpEconomyListTransactionsResult
  | WfrpEconomyActorSummaryResult
  | WfrpEconomyBankSummaryResult
  | WfrpEconomyRecordTransactionResult
  | WfrpEconomyDeleteAccountResult
  | WfrpEconomyApplyLeviesResult
  | WfrpEconomyMoneyToBurnResult;

// ── The action enum (mirrors the foundry-module discriminatedUnion literals; 29 actions) ──

export const WFRP_ECONOMY_ACTIONS = [
  'list-economies',
  'get-economy',
  'list-bankers',
  'create-economy',
  'update-economy',
  'delete-economy',
  'create-account',
  'list-accounts',
  'deposit',
  'withdraw',
  'transfer',
  'request-loan',
  'repay-loan',
  'buy-stock',
  'sell-stock',
  'get-portfolio',
  'buy-property',
  'sell-property',
  'set-rented',
  'get-wallet-balance',
  'wallet-add',
  'wallet-remove',
  'list-transactions',
  'actor-transaction-summary',
  'bank-transaction-summary',
  'record-transaction',
  'delete-account',
  'apply-levies',
  'money-to-burn',
] as const;

export type WfrpEconomyAction = (typeof WFRP_ECONOMY_ACTIONS)[number];
