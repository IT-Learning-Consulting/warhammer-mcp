// Module Integration v2 Phase 6 — module-wfrp-economy mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool layer
// only needs typed response shapes for this.query<T> (DP-15 — never <any>).
//
// Warhammer Economy v1.0.0. 92 actions across 17 idioms (unified-ledger: record-transaction /
// delete-account added Phase 2; levy-and-burn: apply-levies / money-to-burn added Phase 4;
// banking-and-income: invest / resolve-investment / list-investments / stash-deposit / stash-withdraw /
// accrue-interest added Phase 5 (+run-economic-cycle added Phase 9, D7 revisit — the module-UI-only
// "Run Economic Cycle" button's headless composer); legitimate-business-enterprises: list-enterprises / get-enterprise /
// create-enterprise / connect-enterprise-actor / enterprise-income / enterprise-event /
// enterprise-pay-interest / enterprise-repay-debt / enterprise-upgrade / delete-enterprise added Phase 6;
// enterprise-ownership-and-debt: set-enterprise-owners / add-enterprise-debt / forgive-enterprise-debt
// (+set-enterprise-income-sources added Phase 7e2) +
// levy-groups: list-levies / save-levy-group / list-levy-groups / delete-levy-group added Phase 7c;
// venture-ledger: create-venture / get-venture / list-ventures / subscribe-venture /
// transfer-venture-parts / settle-venture / distribute-venture / venture-event added Phase 7d (the
// investment-cycle idiom's buy-stock/sell-stock/get-portfolio are RETIRED the same phase — enum literals
// preserved, WFRP_ECONOMY_ACTION_RETIRED short-circuit); +toggle-venture-badge / issue-parts /
// set-venture-status / set-venture-standing added Phase 7d2 (Venture Events v2), wfrp_economy_system_v1_prd.md
// §10; trading idiom (23 actions, trading-* prefix) — the ported trading-places engine, native to this
// module — added Phase 7f, wfrp-economy-phase7f plan §10; +trading-list-vehicle-actors /
// trading-connect-cargo-vehicle / trading-disconnect-cargo-vehicle, vehicle-linked cargo capacity,
// post-7f; +trading-delete-rumour, post-7f Trade Rumour Table redesign Change 1/2); economic-climate
// idiom (climate-get-state / climate-set-state) added Phase 8, wfrp-economy-phase8-living-economy
// plan §10. Each handler return carries `action` as a discriminant; WfrpEconomyResult is their union so
// the tool stays typed without <any>.

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
  retired?: boolean;
  detail?: string;
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
  archiveId?: string;
  affected?: Record<string, number>;
  transactionHistoryRetained?: boolean;
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
  // D11 (Phase 9 orphan-guard): ownerDeleted:true is a distinct non-error outcome — the owner actor no
  // longer exists, so none of the payout/bankrupt fields below are populated (nothing was resolved; the
  // record stays trackable only via the Banking-tab "remove record" affordance).
  ownerDeleted?: boolean;
  actorId?: string;
  bankrupt?: boolean;
  payoutBp?: number;
  principalBp: number;
  accruedBp: number;
  walletBalanceBp?: number;
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

export interface WfrpEconomyRentalVerdict {
  accountId?: string;
  actorId?: string;
  actorName?: string | null;
  economyId?: string | null;
  bankId?: string | null;
  propertyId: string | null;
  propertyName: string | null;
  incomeBp?: number;
  newBalanceBp?: number;
  notFound?: boolean;
}

// Venture-pass verdicts are heterogeneous by `kind` (runVenturePass, venture-engine.js:1028-1078 — transfer
// / distribution / standing-decay / delay-tick / event, each with its own extra fields); a loose shape
// keeps this typed without re-deriving every per-kind field union. The formatter reads `kind` + common
// fields defensively.
export interface WfrpEconomyVenturePassVerdict {
  kind: 'transfer' | 'distribution' | 'standing-decay' | 'delay-tick' | 'event';
  ventureId: string;
  [key: string]: unknown;
}

// Phase 9 (D7 revisit): the fork's own headless composer for the module-UI-only "Run Economic Cycle"
// button — delegates to the SAME BankingEngine.runEconomicCycle export. dryRun:true previews
// investment/account/loan/rental verdicts ONLY — the venture pass is skipped entirely on dryRun
// (banking-engine.js:622) and ventureVerdicts is always [] in that case.
export interface WfrpEconomyRunEconomicCycleResult {
  action: 'run-economic-cycle';
  economyId: string;
  dryRun: boolean;
  lastCycleAt: string | null;
  investmentVerdicts: WfrpEconomyInvestmentAccrualVerdict[];
  accountVerdicts: WfrpEconomyAccountAccrualVerdict[];
  loanReminders: WfrpEconomyLoanReminder[];
  rentalVerdicts: WfrpEconomyRentalVerdict[];
  ventureVerdicts: WfrpEconomyVenturePassVerdict[];
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
  appliedBp: number;
  unappliedBp: number;
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

// Phase 7e2 (R6.1/R6.5/R7c.3) — manager-primary income-source write.
export interface WfrpEconomySetEnterpriseIncomeSourcesResult {
  action: 'set-enterprise-income-sources';
  enterpriseId: string;
  incomeModifiers: WfrpEconomyIncomeModifier[];
  actorSynced: boolean;
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

// Phase 7e D8: a linked entry carries bankId/economyId as a pair (a real institution); a generic/
// unassigned Phase 7d entry carries neither.
export interface WfrpEconomyVentureHandledByEntry {
  role: string;
  name: string | null;
  bankId: string | null;
  economyId: string | null;
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
  /** Invested principal held inside escrowBp (D1/D2) — escrowBp minus this is distributable profit. */
  capitalBp: number;
  badges: string[];
  handledBy: WfrpEconomyVentureHandledByEntry[];
}

export interface WfrpEconomyCreateVentureResult {
  action: 'create-venture';
  ventureId: string;
  name: string;
  type: string;
  status: string;
  standing: string;
  escrowBp: number;
  handledBy: WfrpEconomyVentureHandledByEntry[];
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
  /** Invested principal held inside escrowBp (D1/D2) — escrowBp minus this is distributable profit. */
  capitalBp: number;
  /** Consecutive cycles with no activity; standing decays at the ventureQuietCyclesBeforeDecay threshold (D6). */
  quietCycles: number;
  /** Fully subscribed and awaiting launch — launches at the next cycle or via the GM button (D5b). */
  readyToLaunch: boolean;
  holders: WfrpEconomyVentureHolder[];
  queuedTransfers: WfrpEconomyVentureQueuedTransfer[];
  badges: string[];
  notices: string[];
  deedDateText: string | null;
  handledBy: WfrpEconomyVentureHandledByEntry[];
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

export interface WfrpEconomyDeleteVentureResult {
  action: 'delete-venture';
  ventureId: string;
  name: string;
  /**
   * BP that could NOT be paid to anyone and was written off with the deed — non-zero only when every
   * remaining holder was unpayable (deleted actor and/or external name). This coin was never moved to
   * a wallet; it ceased to be tracked. Zero on a normal empty-escrow delete.
   */
  writtenOffBp: number;
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

// ── trading (Phase 7f) ───────────────────────────────────────────────────────

export interface WfrpTradingSettlement {
  name: string;
  gazetteerId: string;
  region: string;
  size: number;
  wealth: number;
  population: number | null;
  produces: string[];
  demands: string[];
  flags: string[];
}

export interface WfrpEconomyTradingListSettlementsResult {
  action: 'trading-list-settlements';
  count: number;
  settlements: WfrpTradingSettlement[];
}

export interface WfrpEconomyTradingListCargoTypesResult {
  action: 'trading-list-cargo-types';
  count: number;
  cargoTypes: Array<Record<string, unknown>>;
}

export interface WfrpEconomyTradingGetSeasonResult {
  action: 'trading-get-season';
  season: string;
  seasonSource: 'manual' | 'calendar' | 'fallback';
}

export interface WfrpEconomyTradingSetSeasonResult {
  action: 'trading-set-season';
  season: string;
  seasonSource: 'manual' | 'calendar' | 'fallback';
}

export interface WfrpTradingAvailabilitySlot {
  slotNumber: number;
  cargo: { name: string; category: string; probability: number; weight: number };
  amountEp: number;
}

export interface WfrpEconomyTradingCheckAvailabilityResult {
  action: 'trading-check-availability';
  settlement: string;
  season: string;
  potentialSlotCount: number;
  slotCount: number;
  slots: WfrpTradingAvailabilitySlot[];
}

export interface WfrpEconomyTradingCalcPurchasePriceResult {
  action: 'trading-calc-purchase-price';
  cargoName: string;
  quantity: number;
  season: string;
  pricePerEpBp: number;
  totalBp: number;
  dialFactor: number;
}

// Linked demand (connected economy, NEW — not RAW, a GM-requested extension): a standing, deterministic
// settlement-data condition (produces/size/flags), re-evaluated fresh on every quote/sale — unlike
// WfrpTradingRumourApplied, this is never minted/stored/consumed.
export interface WfrpTradingLinkedDemandApplied {
  multiplier: number;
  reason: string;
}

export interface WfrpEconomyTradingCalcSalePriceResult {
  action: 'trading-calc-sale-price';
  cargoName: string;
  quantity: number;
  settlement: string;
  season: string;
  pricePerEpBp: number;
  totalBp: number;
  dialFactor: number;
  linkedDemandApplied: WfrpTradingLinkedDemandApplied | null;
}

export interface WfrpEconomyTradingHaggleTestResult {
  action: 'trading-haggle-test';
  success: boolean;
  hasDealmakerTalent: boolean;
  player: Record<string, unknown>;
  merchant: Record<string, unknown>;
  resultDescription: string;
}

// Trade Rumour Table redesign (post-7f Change 1/2) — the 20-band d100 table's minted-row shape and the
// buy/sell-time consumed-rumour echo. Replaces the old flat single-cargo 2x-eligibility model.
export interface WfrpTradingRumour {
  id: string;
  text: string;
  goods: string[];
  effect: { kind: 'sellBonus' | 'buyDiscount'; multiplier: number };
  mintedAt: string;
}

export interface WfrpTradingRumourApplied {
  id: string;
  text: string;
  multiplier: number;
  persistedCheckFailed?: boolean;
  detail?: string;
}

export interface WfrpEconomyTradingGossipTestResult {
  action: 'trading-gossip-test';
  success: boolean;
  degrees: number;
  resultDescription: string;
  rumourMinted: WfrpTradingRumour | null;
}

export interface WfrpEconomyTradingBuyCargoResult {
  action: 'trading-buy-cargo';
  actorId: string;
  lotId: string;
  cargoName: string;
  quantity: number;
  settlement: string;
  totalBp: number;
  walletBalanceBp: number;
  secretQuality: { tierIndex: number; tier: string; priceMultiplierPer10Ep: number } | null;
  rumourApplied: WfrpTradingRumourApplied | null;
}

export interface WfrpEconomyTradingSellCargoResult {
  action: 'trading-sell-cargo';
  actorId: string;
  lotId: string;
  settlement: string;
  soldPartial: boolean;
  quantitySold: number | null;
  quantityRemaining: number;
  totalBp: number;
  walletBalanceBp: number;
  saleType: 'normal' | 'fireSale';
  rumourApplied: WfrpTradingRumourApplied | null;
  linkedDemandApplied: WfrpTradingLinkedDemandApplied | null;
}

export interface WfrpEconomyTradingDeleteRumourResult {
  action: 'trading-delete-rumour';
  rumourId: string;
  deleted: true;
}

export interface WfrpEconomyTradingGetHoldResult {
  action: 'trading-get-hold';
  capacity: number;
  capacitySource: 'vehicle' | 'manual';
  connectedVehicleName: string | null;
  currentHoldEp: number;
  count: number;
  hold: Array<Record<string, unknown>>;
}

export interface WfrpTradingVehicleActorEntry {
  actorId: string;
  actorUuid: string;
  name: string;
  carriesMax: number;
}

export interface WfrpEconomyTradingListVehicleActorsResult {
  action: 'trading-list-vehicle-actors';
  count: number;
  actors: WfrpTradingVehicleActorEntry[];
}

export interface WfrpEconomyTradingConnectCargoVehicleResult {
  action: 'trading-connect-cargo-vehicle';
  actorId: string;
  actorUuid: string;
  carriesMax: number;
}

export interface WfrpEconomyTradingDisconnectCargoVehicleResult {
  action: 'trading-disconnect-cargo-vehicle';
  disconnected: true;
}

export interface WfrpTradingGazetteerEntry {
  packId: string;
  label: string;
  builtin: boolean;
  active: boolean;
  settlementCount: number;
  loadError?: string;
}

export interface WfrpEconomyTradingListGazetteersResult {
  action: 'trading-list-gazetteers';
  count: number;
  activeIds: string[];
  gazetteers: WfrpTradingGazetteerEntry[];
}

export interface WfrpEconomyTradingImportGazetteerResult {
  action: 'trading-import-gazetteer';
  packId: string;
  settlementCount: number;
}

export interface WfrpEconomyTradingConfigureGazetteersResult {
  action: 'trading-configure-gazetteers';
  active: string[];
}

export interface WfrpEconomyTradingGenerateMerchantResult {
  action: 'trading-generate-merchant';
  id: string;
  type: 'producer' | 'seeker';
  settlement: Record<string, unknown>;
  cargoType: string;
  hagglingSkill: number;
  skillDescription: string;
  equilibrium: { supply: number; demand: number };
  specialBehaviors: string[];
}

export interface WfrpEconomyTradingRevealQualityResult {
  action: 'trading-reveal-quality';
  lotId: string;
  cargoName: string;
  revealedTier: string;
  misreported: boolean;
  trueTier: string;
}

export interface WfrpEconomyTradingGetPriceModifiersResult {
  action: 'trading-get-price-modifiers';
  global: number;
  perCargo: Record<string, number>;
}

export interface WfrpEconomyTradingSetPriceModifiersResult {
  action: 'trading-set-price-modifiers';
  previous: { global: number; perCargo: Record<string, number> };
  current: { global: number; perCargo: Record<string, number> };
}

export interface WfrpEconomyTradingMigrationStatusResult {
  action: 'trading-migration-status';
  migrated: true;
  alreadyMigrated: boolean;
  migratedFrom?: string;
  seededSeason?: string | null;
  seededHoldCount?: number;
  seededCapacity?: number | null;
  seededDial?: boolean;
}

// Phase 8 (D1/D4/D11) — economic climate: 2 additive actions (89 -> 91). Response carries the FULL
// resolved state-table entry (label + all 3 factors), never a bare id — write-amount-echo discipline
// (7c F03 lesson).
export interface WfrpEconomyClimateStateResult {
  action: 'climate-get-state' | 'climate-set-state';
  // addendum-2: climate is PER-ECONOMY — the record echoed is this economy's own state, never global.
  economyId: string;
  state: string;
  label: string;
  priceFactor: number;
  incomeFactor: number;
  eventShift: number;
  updatedAt: number | null;
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
  | WfrpEconomyRunEconomicCycleResult
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
  | WfrpEconomySetEnterpriseIncomeSourcesResult
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
  | WfrpEconomyDeleteVentureResult
  | WfrpEconomyVentureEventResult
  | WfrpEconomyToggleVentureBadgeResult
  | WfrpEconomyIssuePartsResult
  | WfrpEconomySetVentureStatusResult
  | WfrpEconomySetVentureStandingResult
  | WfrpEconomyTradingListSettlementsResult
  | WfrpEconomyTradingListCargoTypesResult
  | WfrpEconomyTradingGetSeasonResult
  | WfrpEconomyTradingSetSeasonResult
  | WfrpEconomyTradingCheckAvailabilityResult
  | WfrpEconomyTradingCalcPurchasePriceResult
  | WfrpEconomyTradingCalcSalePriceResult
  | WfrpEconomyTradingHaggleTestResult
  | WfrpEconomyTradingGossipTestResult
  | WfrpEconomyTradingBuyCargoResult
  | WfrpEconomyTradingSellCargoResult
  | WfrpEconomyTradingDeleteRumourResult
  | WfrpEconomyTradingGetHoldResult
  | WfrpEconomyTradingListVehicleActorsResult
  | WfrpEconomyTradingConnectCargoVehicleResult
  | WfrpEconomyTradingDisconnectCargoVehicleResult
  | WfrpEconomyTradingListGazetteersResult
  | WfrpEconomyTradingImportGazetteerResult
  | WfrpEconomyTradingConfigureGazetteersResult
  | WfrpEconomyTradingGenerateMerchantResult
  | WfrpEconomyTradingRevealQualityResult
  | WfrpEconomyTradingGetPriceModifiersResult
  | WfrpEconomyTradingSetPriceModifiersResult
  | WfrpEconomyTradingMigrationStatusResult
  | WfrpEconomyClimateStateResult;

// ── The action enum (mirrors the foundry-module discriminatedUnion literals; 91 actions) ──

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
  'run-economic-cycle',
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
  'set-enterprise-income-sources',
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
  'delete-venture',
  'venture-event',
  'toggle-venture-badge',
  'issue-parts',
  'set-venture-status',
  'set-venture-standing',
  'trading-list-settlements',
  'trading-list-cargo-types',
  'trading-get-season',
  'trading-set-season',
  'trading-check-availability',
  'trading-calc-purchase-price',
  'trading-calc-sale-price',
  'trading-haggle-test',
  'trading-gossip-test',
  'trading-buy-cargo',
  'trading-sell-cargo',
  'trading-delete-rumour',
  'trading-get-hold',
  'trading-list-vehicle-actors',
  'trading-connect-cargo-vehicle',
  'trading-disconnect-cargo-vehicle',
  'trading-list-gazetteers',
  'trading-import-gazetteer',
  'trading-configure-gazetteers',
  'trading-generate-merchant',
  'trading-reveal-quality',
  'trading-get-price-modifiers',
  'trading-set-price-modifiers',
  'trading-migration-status',
  'climate-get-state',
  'climate-set-state',
] as const;

export type WfrpEconomyAction = (typeof WFRP_ECONOMY_ACTIONS)[number];
