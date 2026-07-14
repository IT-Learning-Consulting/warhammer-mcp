// Module Integration v2 Phase 6 — module-wfrp-economy mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool layer
// only needs typed response shapes for this.query<T> (DP-15 — never <any>).
//
// Warhammer Economy v1.0.0. 64 actions across 14 idioms (unified-ledger: record-transaction /
// delete-account added Phase 2; levy-and-burn: apply-levies / money-to-burn added Phase 4;
// banking-and-income: invest / resolve-investment / list-investments / stash-deposit / stash-withdraw /
// accrue-interest added Phase 5; legitimate-business-enterprises: list-enterprises / get-enterprise /
// create-enterprise / connect-enterprise-actor / enterprise-income / enterprise-event /
// enterprise-pay-interest / enterprise-repay-debt / enterprise-upgrade / delete-enterprise added Phase 6;
// enterprise-ownership-and-debt: set-enterprise-owners / add-enterprise-debt / forgive-enterprise-debt +
// levy-groups: list-levies / save-levy-group / list-levy-groups / delete-levy-group added Phase 7c;
// venture-ledger: create-venture / get-venture / list-ventures / subscribe-venture /
// transfer-venture-parts / settle-venture / distribute-venture / venture-event added Phase 7d (the
// investment-cycle idiom's buy-stock/sell-stock/get-portfolio are RETIRED the same phase — enum literals
// preserved, WFRP_ECONOMY_ACTION_RETIRED short-circuit); +toggle-venture-badge / issue-parts /
// set-venture-status / set-venture-standing added Phase 7d2 (Venture Events v2), wfrp_economy_system_v1_prd.md
// §10). Each handler
// return carries `action` as a discriminant; WfrpEconomyResult is their union so the tool stays typed
// without <any>.

export interface WfrpEconomySummary {
  id: string;
  name: string;
  currency: string;
  bankCount: number;
  propertyCount: number;
  stockCount: number; // frozen — R7d.7, stock fields never removed
  ventureCount: number; // ADDITIVE, Phase 7d
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
  stocks: Array<Record<string, unknown>>; // frozen — R7d.7
  ventureCount: number; // ADDITIVE, Phase 7d — count of live venture-ledger deeds (world-scoped, not per-economy)
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
  stockCount: number; // frozen — R7d.7
  propertyCount: number;
  ventureCount: number; // ADDITIVE, Phase 7d — world-scoped venture count (ventures aren't per-economy)
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
  ventureId: string | null; // ADDITIVE, Phase 7d — venture-* rows carry the deed's instanceId (D16)
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
  // Phase 7c ADDITIVE (R7c.5) — echoes the resolved groupId when the caller targeted a named group.
  groupId: string | null;
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
  // Phase 7c ADDITIVE (Q&A fold-in) — echoes the resolved groupId when the caller targeted a named group.
  groupId: string | null;
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

// Phase 7c (D2/D3): weighted ownership share. actorName is a display convenience the handler resolves.
// Phase 7d: a slot may be venture-held instead of actor-held (ventureId set, actorId/actorName null).
export interface WfrpEconomyOwnerEntry {
  actorId: string | null;
  ventureId: string | null;
  sharePct: number;
  actorName: string | null;
}

export interface WfrpEconomyEnterpriseSummary {
  instanceId: string;
  name: string;
  profileId: string | null;
  backing: 'create' | 'link' | 'data-only';
  actorUuid: string | null;
  // ownerActorId/ownerActorName stay for back-compat — D3: maintained as a deprecated alias, always the
  // largest-share owner. owners[] is the Phase 7c ADDITIVE widened shape (never remove the scalar pair).
  ownerActorId: string | null;
  ownerActorName: string | null;
  owners: WfrpEconomyOwnerEntry[];
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
  owners: WfrpEconomyOwnerEntry[];
  level: number;
  upkeep: number;
  incomeModifiers: WfrpEconomyIncomeModifier[];
  eventTable: WfrpEconomyEventTable;
  // creditor is Phase 7c ADDITIVE (D1/D6 — RAW Archives III Creditors identity).
  debt: { principalBp: number; escalationTier: number; creditor: { name: string; notes: string } };
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

// ── enterprise-ownership-and-debt idiom (Phase 7c, R7c.1/R7c.2) ─────────────────

export interface WfrpEconomySetEnterpriseOwnersResult {
  action: 'set-enterprise-owners';
  enterpriseId: string;
  owners: WfrpEconomyOwnerEntry[];
  ownerActorId: string; // the newly-resolved primary (largest-share) owner — D3 alias.
}

export interface WfrpEconomyAddEnterpriseDebtResult {
  action: 'add-enterprise-debt';
  enterpriseId: string;
  amountBp: number; // echo of the BP the Creditor advanced (F03 polish, 2026-07-13)
  principalBp: number;
  recipientActorId: string;
  recipientActorName: string | null; // resolved recipient name, null when the actor is gone
  walletBalanceBp: number;
}

export interface WfrpEconomyForgiveEnterpriseDebtResult {
  action: 'forgive-enterprise-debt';
  enterpriseId: string;
  principalBp: number;
}

// ── levy-groups idiom (Phase 7c, R7c.4/R7c.5) ───────────────────────────────────

export interface WfrpEconomyLevyEntry {
  levyId: string;
  name: string;
  type: string; // 'tax' | 'toll' | 'due' | 'tithe' | 'custom' | 'builtin' — D9, UI/read-filter concern only.
  cadence: string;
  active: boolean;
  amount: Record<string, unknown>; // {kind:'fixed-bp', value} | {kind:'standing-scaled', multiplier}
  target: string | null;
  groupId: string | null;
  builtin: boolean;
  state: Record<string, unknown>;
}

export interface WfrpEconomyListLeviesResult {
  action: 'list-levies';
  count: number;
  levies: WfrpEconomyLevyEntry[];
}

export interface WfrpEconomyLevyGroupEntry {
  groupId: string;
  name: string;
  actorIds: string[];
  memberCount: number;
}

export interface WfrpEconomySaveLevyGroupResult {
  action: 'save-levy-group';
  groupId: string;
  name: string;
  actorIds: string[];
}

export interface WfrpEconomyListLevyGroupsResult {
  action: 'list-levy-groups';
  count: number;
  groups: WfrpEconomyLevyGroupEntry[];
}

export interface WfrpEconomyDeleteLevyGroupResult {
  action: 'delete-levy-group';
  groupId: string;
  deleted: boolean;
}

// ── venture-ledger idiom (Phase 7d, wfrp_economy_system) ────────────────────────

export interface WfrpEconomyVentureHolder {
  actorId: string | null;
  externalName: string | null;
  actorName: string | null; // resolved display name (actor.name or externalName)
  parts: number;
}

export interface WfrpEconomyVentureQueuedTransfer {
  offerId: string;
  sellerActorId: string | null;
  sellerExternalName: string | null;
  sellerName: string | null;
  parts: number;
  askingPriceBp: number;
}

export interface WfrpEconomyVentureSummary {
  ventureId: string;
  name: string;
  type: string;
  status: string;
  standing: string;
  partsTotal: number;
  partsSubscribed: number;
  priceBp: number;
  escrowBp: number;
  badges: string[];
}

export interface WfrpEconomyCreateVentureResult {
  action: 'create-venture';
  ventureId: string;
  name: string;
  type: string;
  status: string;
  standing: string;
  escrowBp: number;
}

export interface WfrpEconomyGetVentureResult {
  action: 'get-venture';
  ventureId: string;
  name: string;
  type: string;
  status: string;
  standing: string;
  partsTotal: number;
  partsSubscribed: number;
  priceBp: number;
  escrowBp: number;
  holders: WfrpEconomyVentureHolder[];
  queuedTransfers: WfrpEconomyVentureQueuedTransfer[];
  badges: string[];
  notices: string[];
  deedDateText: string | null;
}

export interface WfrpEconomyListVenturesResult {
  action: 'list-ventures';
  count: number;
  ventures: WfrpEconomyVentureSummary[];
}

export interface WfrpEconomySubscribeVentureResult {
  action: 'subscribe-venture';
  ventureId: string;
  subscribedParts: number;
  escrowBp: number;
  walletBalanceBp: number | null; // null for externalName subscribers (no actor wallet)
}

export interface WfrpEconomyTransferVentureResult {
  action: 'transfer-venture-parts';
  ventureId: string;
  offerId: string;
  queued: true; // resolves only at the next Run Economic Cycle — never instant (ADR-U11)
}

export interface WfrpEconomySettleVentureResult {
  action: 'settle-venture';
  ventureId: string;
  status: string;
  distributedBp: number;
}

export interface WfrpEconomyDistributeVentureResult {
  action: 'distribute-venture';
  ventureId: string;
  distributedBp: number;
  escrowBp: number; // remaining after distribution (external-holder shares that stayed in escrow)
  splitCount: number;
}

export interface WfrpEconomyVentureEventResult {
  action: 'venture-event';
  ventureId: string;
  text: string;
  standing: string;
  // Phase 7d2 (Venture Events v2) — additive fields, existing 3 pins stay green.
  naturalRoll: number;
  modifiedRoll: number;
  standingModifier: number;
  critical: 'boon' | 'disaster' | null;
  effectsApplied: string[];
}

export interface WfrpEconomyToggleVentureBadgeResult {
  action: 'toggle-venture-badge';
  ventureId: string;
  badges: string[];
}

export interface WfrpEconomyIssuePartsResult {
  action: 'issue-parts';
  ventureId: string;
  partsTotal: number;
  priceBp: number;
}

export interface WfrpEconomySetVentureStatusResult {
  action: 'set-venture-status';
  ventureId: string;
  status: string;
}

export interface WfrpEconomySetVentureStandingResult {
  action: 'set-venture-standing';
  ventureId: string;
  standing: string;
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
  | WfrpEconomyDeleteEnterpriseResult
  | WfrpEconomySetEnterpriseOwnersResult
  | WfrpEconomyAddEnterpriseDebtResult
  | WfrpEconomyForgiveEnterpriseDebtResult
  | WfrpEconomyListLeviesResult
  | WfrpEconomySaveLevyGroupResult
  | WfrpEconomyListLevyGroupsResult
  | WfrpEconomyDeleteLevyGroupResult
  | WfrpEconomyCreateVentureResult
  | WfrpEconomyGetVentureResult
  | WfrpEconomyListVenturesResult
  | WfrpEconomySubscribeVentureResult
  | WfrpEconomyTransferVentureResult
  | WfrpEconomySettleVentureResult
  | WfrpEconomyDistributeVentureResult
  | WfrpEconomyVentureEventResult
  | WfrpEconomyToggleVentureBadgeResult
  | WfrpEconomyIssuePartsResult
  | WfrpEconomySetVentureStatusResult
  | WfrpEconomySetVentureStandingResult;

// ── The action enum (mirrors the foundry-module discriminatedUnion literals; 64 actions) ──

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
  'set-enterprise-owners',
  'add-enterprise-debt',
  'forgive-enterprise-debt',
  'list-levies',
  'save-levy-group',
  'list-levy-groups',
  'delete-levy-group',
  'create-venture',
  'get-venture',
  'list-ventures',
  'subscribe-venture',
  'transfer-venture-parts',
  'settle-venture',
  'distribute-venture',
  'venture-event',
  'toggle-venture-badge',
  'issue-parts',
  'set-venture-status',
  'set-venture-standing',
] as const;

export type WfrpEconomyAction = (typeof WFRP_ECONOMY_ACTIONS)[number];
