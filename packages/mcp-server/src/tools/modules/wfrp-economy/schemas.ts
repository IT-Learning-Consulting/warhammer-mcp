// Module Integration v2 Phase 6 — module-wfrp-economy mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool layer
// only needs typed response shapes for this.query<T> (DP-15 — never <any>).
//
// Warhammer Economy v1.0.0. 44 actions across 12 idioms (unified-ledger: record-transaction /
// delete-account added Phase 2; levy-and-burn: apply-levies / money-to-burn added Phase 4;
// banking-and-income: invest / resolve-investment / list-investments / stash-deposit / stash-withdraw /
// accrue-interest added Phase 5; legitimate-business-enterprises: list-enterprises / get-enterprise /
// create-enterprise / connect-enterprise-actor / enterprise-income / enterprise-event /
// enterprise-pay-interest / enterprise-repay-debt / enterprise-upgrade added Phase 6,
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
  enterpriseId: string | null;
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
  // ADR-U3 extension: true when the caller passed declared:true (GM-declared apply — no elapsed-time
  // gate, charges once per call, stamps state to the CURRENT levy index).
  declared: boolean;
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

// ── banking-and-income idiom (Phase 5, wfrp_economy_system) ──────────────────────

export interface WfrpEconomyInvestResult {
  action: 'invest';
  investmentId: string;
  actorId: string;
  rate: number;
  principalBp: number;
  economyId: string | null;
  bankId: string | null;
  walletBalanceBp: number;
}

export interface WfrpEconomyResolveInvestmentResult {
  action: 'resolve-investment';
  investmentId: string;
  actorId: string;
  bankrupt: boolean;
  payoutBp: number;
  principalBp: number;
  accruedBp: number;
  walletBalanceBp: number;
}

export interface WfrpEconomyInvestmentEntry {
  investmentId: string;
  actorId: string;
  actorName: string | null;
  rate: number;
  principalBp: number;
  accruedBp: number;
  economyId: string | null;
  bankId: string | null;
  active: boolean;
  lastCycleAt: string | null; // Phase 5b, D9 — display-only ISO stamp, never a gate.
}

export interface WfrpEconomyListInvestmentsResult {
  action: 'list-investments';
  count: number;
  investments: WfrpEconomyInvestmentEntry[];
}

export interface WfrpEconomyStashDepositResult {
  action: 'stash-deposit';
  actorId: string;
  amountBp: number;
  stashBalanceBp: number;
  walletBalanceBp: number;
}

export interface WfrpEconomyStashWithdrawResult {
  action: 'stash-withdraw';
  actorId: string;
  lost: boolean;
  amountBp: number;
  walletBalanceBp: number;
}

export interface WfrpEconomyInvestmentAccrualVerdict {
  investmentId: string;
  actorId: string;
  actorName: string | null;
  accruedDeltaBp: number;
  accruedBp: number;
}

export interface WfrpEconomyAccountAccrualVerdict {
  accountId: string;
  actorId: string;
  actorName: string | null;
  economyId: string | null;
  bankId: string | null;
  accruedDeltaBp: number;
  newBalanceBp: number;
}

export interface WfrpEconomyLoanReminder {
  accountId: string;
  actorId: string;
  actorName: string | null;
  totalOwedBp: number;
}

export interface WfrpEconomyAccrueInterestResult {
  action: 'accrue-interest';
  dryRun: boolean;
  // CYCLE SEMANTICS (Phase 5b, ADR-U3): cycleApplied is always true — there is no worldTime-elapsed-month
  // gate, so calling this action twice in a row accrues twice. lastCycleAt is a display-only ISO stamp.
  cycleApplied: true;
  lastCycleAt: string | null;
  investmentVerdicts: WfrpEconomyInvestmentAccrualVerdict[];
  accountVerdicts: WfrpEconomyAccountAccrualVerdict[];
  loanReminders: WfrpEconomyLoanReminder[];
}

// ── legitimate-business-enterprises idiom (Phase 6, wfrp_economy_system) ─────────

export interface WfrpEconomyEnterpriseSummary {
  instanceId: string;
  name: string;
  profileId: string | null;
  backing: 'create' | 'link' | 'data-only';
  actorUuid: string | null;
  ownerActorId: string | null;
  ownerActorName: string | null;
  level: number;
  upkeep: number;
  debtPrincipalBp: number;
  escalationTier: number;
}

export interface WfrpEconomyUnconnectedActor {
  actorId: string;
  actorUuid: string;
  name: string;
}

export interface WfrpEconomyListEnterprisesResult {
  action: 'list-enterprises';
  unconnectedActors: boolean;
  count: number;
  enterprises: WfrpEconomyEnterpriseSummary[];
  actors: WfrpEconomyUnconnectedActor[];
}

export interface WfrpEconomyIncomeModifier {
  label: string;
  skill: string;
  tier: 'b' | 's' | 'g';
  standing: number;
}

export interface WfrpEconomyEventTable {
  uuid: string | null;
  overrides: Array<{ band: [number, number]; text: string }>;
}

export interface WfrpEconomyGetEnterpriseResult {
  action: 'get-enterprise';
  instanceId: string;
  name: string;
  profileId: string | null;
  backing: 'create' | 'link' | 'data-only';
  actorUuid: string | null;
  ownerActorId: string | null;
  ownerActorName: string | null;
  level: number;
  upkeep: number;
  incomeModifiers: WfrpEconomyIncomeModifier[];
  eventTable: WfrpEconomyEventTable;
  debt: { principalBp: number; escalationTier: number };
  createdAt: string | null;
}

export interface WfrpEconomyCreateEnterpriseResult {
  action: 'create-enterprise';
  instanceId: string | null;
  actorUuid: string | null;
  backing: 'create' | 'link' | 'data-only';
  debtPrincipalBp: number;
  walletBalanceBp: number;
}

export interface WfrpEconomyConnectEnterpriseActorResult {
  action: 'connect-enterprise-actor';
  instanceId: string;
  actorUuid: string | null;
  alreadyConnected: boolean;
}

export interface WfrpEconomyEnterpriseIncomeResult {
  action: 'enterprise-income';
  enterpriseId: string;
  payoutBp: number;
  walletBalanceBp: number;
}

export interface WfrpEconomyEnterpriseEventResult {
  action: 'enterprise-event';
  enterpriseId: string;
  text: string;
  matchedOverride: boolean;
}

export interface WfrpEconomyEnterprisePayInterestResult {
  action: 'enterprise-pay-interest';
  enterpriseId: string;
  paid: boolean;
  escalationTier: number | null;
  walletBalanceBp: number | null;
}

export interface WfrpEconomyEnterpriseRepayDebtResult {
  action: 'enterprise-repay-debt';
  enterpriseId: string;
  principalBp: number;
  walletBalanceBp: number;
}

export interface WfrpEconomyEnterpriseUpgradeResult {
  action: 'enterprise-upgrade';
  enterpriseId: string;
  level: number;
  newUpkeep: number;
  debtPrincipalBp: number;
  walletBalanceBp: number;
}

export interface WfrpEconomyDeleteEnterpriseResult {
  action: 'delete-enterprise';
  enterpriseId: string;
  deleted: true;
  name: string;
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
  | WfrpEconomyMoneyToBurnResult
  | WfrpEconomyInvestResult
  | WfrpEconomyResolveInvestmentResult
  | WfrpEconomyListInvestmentsResult
  | WfrpEconomyStashDepositResult
  | WfrpEconomyStashWithdrawResult
  | WfrpEconomyAccrueInterestResult
  | WfrpEconomyListEnterprisesResult
  | WfrpEconomyGetEnterpriseResult
  | WfrpEconomyCreateEnterpriseResult
  | WfrpEconomyConnectEnterpriseActorResult
  | WfrpEconomyEnterpriseIncomeResult
  | WfrpEconomyEnterpriseEventResult
  | WfrpEconomyEnterprisePayInterestResult
  | WfrpEconomyEnterpriseRepayDebtResult
  | WfrpEconomyEnterpriseUpgradeResult
  | WfrpEconomyDeleteEnterpriseResult;

// ── The action enum (mirrors the foundry-module discriminatedUnion literals; 44 actions) ──

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
  'invest',
  'resolve-investment',
  'list-investments',
  'stash-deposit',
  'stash-withdraw',
  'accrue-interest',
  'list-enterprises',
  'get-enterprise',
  'create-enterprise',
  'connect-enterprise-actor',
  'enterprise-income',
  'enterprise-event',
  'enterprise-pay-interest',
  'enterprise-repay-debt',
  'enterprise-upgrade',
  'delete-enterprise',
] as const;

export type WfrpEconomyAction = (typeof WFRP_ECONOMY_ACTIONS)[number];
