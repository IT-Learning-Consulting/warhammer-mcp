// Module Integration v2 Phase 6 — module-wfrp-economy MCP tool (Warhammer Economy, wfrp4e-economy v1.0.0).
//
// Always-registered umbrella. The foundry-module handler guards on wfrp4e-economy being active; when
// inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw → moduleNotActiveContent().
// Pre-flight with module-probe.is-active wfrp4e-economy.
//
// 64 actions across 15 idioms (stand-up-an-economy, open-a-bank-account, run-a-transaction, loan-cycle,
// investment-cycle [RETIRED Phase 7d], property-management, wallet-quick-adjust, audit-the-ledger,
// unified-ledger, levy-and-burn, banking-and-income, legitimate-business-enterprises,
// enterprise-ownership-and-debt, levy-groups, venture-ledger [Phase 7d2: +4 actions — toggle-venture-badge,
// issue-parts, set-venture-status, set-venture-standing]). Anchors:
// DP-15 (concrete this.query<WfrpEconomyResult> — never <any>); R2.4 (errors via errorResponse). The
// transactional writes + property/stock ops are LIVE-SMOKE-ONLY (need a configured economy; the
// smoke-runbook self-bootstraps one).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { WFRP_ECONOMY_ACTIONS, type WfrpEconomyResult } from './schemas.js';
import { z } from 'zod';
import { WfrpEconomyInput } from '@foundry-mcp/shared';

type WfrpEconomyArgs = z.infer<typeof WfrpEconomyInput>;

// ── Single discriminated formatter (one text line per action) ──────────────────

// HC1 full-triple display (validate F02): 240/12/1 decomposition, zeros always shown
// (mirrors the fork's WFRP4eCurrency.bpToString default).
function bpToTriple(bp: number): string {
  const total = Math.max(0, Math.floor(bp));
  return `${Math.floor(total / 240)}gc ${Math.floor((total % 240) / 12)}ss ${total % 12}bp`;
}

function formatResult(d: WfrpEconomyResult): string {
  const p = 'module-wfrp-economy';
  switch (d.action) {
    case 'list-economies':
      return `${p}.list-economies: ${d.count} economy(ies)${d.count ? ` — ${d.economies.map((e) => `${e.name} (${e.id})`).join(', ')}` : ''}.`;
    case 'get-economy':
      return `${p}.get-economy: ${d.name} (${d.economyId}) — ${d.banks.length} bank(s), ${d.stocks.length} stock(s), ${d.properties.length} property(ies), currency "${d.currency}".`;
    case 'list-bankers':
      return `${p}.list-bankers: ${d.count} banker(s).`;
    case 'create-economy':
      return `${p}.create-economy: ${d.name} (${d.economyId}) — ${d.bankCount} bank/${d.stockCount} stock/${d.propertyCount} property.`;
    case 'update-economy':
      return `${p}.update-economy: ${d.name} (${d.economyId}) updated.`;
    case 'delete-economy':
      return `${p}.delete-economy: economy ${d.economyId} ${d.deleted ? 'deleted (+ related stores purged)' : 'not deleted'}.`;
    case 'create-account':
      return `${p}.create-account: account ${d.accountId} for actor ${d.actorId} @ bank ${d.bankId} (balance ${d.balance} BP).`;
    case 'list-accounts':
      return `${p}.list-accounts: ${d.count} account(s).`;
    case 'deposit':
    case 'withdraw':
      return `${p}.${d.action}: ${d.amountBp} BP on account ${d.accountId} — account ${d.accountBalance} BP, wallet ${d.walletBalanceBp} BP.`;
    case 'transfer':
      return `${p}.transfer: ${d.amountBp} BP ${d.sourceAccountId} (${d.sourceBalance} BP) → ${d.destinationAccountId} (${d.destinationBalance} BP).`;
    case 'request-loan':
    case 'repay-loan':
      return `${p}.${d.action}: ${d.amountBp} BP on account ${d.accountId} — loan ${d.loanActive ? `active (${d.loanAmount} BP)` : 'cleared'}, balance ${d.accountBalance} BP.`;
    case 'buy-property':
      return `${p}.buy-property: property ${d.propertyId} bought by ${d.ownerName ?? d.owner} — account ${d.accountId} now ${d.accountBalance} BP.`;
    case 'sell-property':
      return `${p}.sell-property: property ${d.propertyId} sold — account ${d.accountId} now ${d.accountBalance} BP.`;
    case 'set-rented':
      return `${p}.set-rented: property ${d.propertyId} rented → ${d.rented}.`;
    case 'get-wallet-balance':
      return `${p}.get-wallet-balance: actor ${d.actorId} has ${d.balanceBp} BP.`;
    case 'wallet-add':
    case 'wallet-remove':
      return `${p}.${d.action}: ${d.amountBp} BP → actor ${d.actorId} now ${d.balanceBp} BP.`;
    case 'list-transactions':
      return `${p}.list-transactions: ${d.count} transaction(s).`;
    case 'actor-transaction-summary':
      return `${p}.actor-transaction-summary: actor ${d.actorId} in economy ${d.economyId}.`;
    case 'bank-transaction-summary':
      return `${p}.bank-transaction-summary: bank ${d.bankId} in economy ${d.economyId}.`;
    case 'record-transaction':
      return `${p}.record-transaction: ${d.amountBp} BP (${d.source}/${d.type}) logged for actor ${d.actorId} — id ${d.transactionId}.`;
    case 'delete-account':
      return `${p}.delete-account: account ${d.accountId} ${d.deleted ? 'deleted' : 'not deleted'}.`;
    case 'apply-levies': {
      const lines = d.verdicts.map((v) =>
        `\n  - ${v.actorName ?? v.actorId}: ${bpToTriple(v.chargedBp)} — ${v.paid ? 'paid' : v.declined ? 'declined' : 'no charge'}${v.modifierDelta !== 0 ? ` (modifier ${v.modifierDelta > 0 ? '+' : ''}${v.modifierDelta})` : ''}`);
      const refusals = d.refused.map((r) => `\n  - refused ${r.actorId}: ${r.reason}`);
      return `${p}.apply-levies: ${d.dryRun ? '[dry-run] ' : ''}elapsedWeeks=${d.elapsedWeeks}${d.weekIndex !== null ? ` (weekIndex ${d.weekIndex})` : ''} — ${d.verdicts.length} verdict(s), ${d.refused.length} refused.${lines.join('')}${refusals.join('')}`;
    }
    case 'money-to-burn': {
      const lines = d.verdicts.map((v) =>
        `\n  - ${v.actorName ?? v.actorId}: wiped ${bpToTriple(v.wipedBp)} (protected ${bpToTriple(v.protectedBp)})`);
      const refusals = d.refused.map((r) => `\n  - refused ${r.actorId}: ${r.reason}`);
      return `${p}.money-to-burn: ${d.dryRun ? '[dry-run] ' : ''}${d.verdicts.length} actor(s) processed, ${d.refused.length} refused.${lines.join('')}${refusals.join('')}`;
    }
    case 'invest':
      return `${p}.invest: ${d.principalBp} BP @ rate ${d.rate}% for actor ${d.actorId} — investment ${d.investmentId}, wallet now ${d.walletBalanceBp} BP.`;
    case 'resolve-investment':
      return d.bankrupt
        ? `${p}.resolve-investment: investment ${d.investmentId} (actor ${d.actorId}) BANKRUPT — total loss.`
        : `${p}.resolve-investment: investment ${d.investmentId} (actor ${d.actorId}) paid out ${d.payoutBp} BP (principal ${d.principalBp} + accrued ${d.accruedBp}) — wallet now ${d.walletBalanceBp} BP.`;
    case 'list-investments':
      return `${p}.list-investments: ${d.count} investment(s).`;
    case 'stash-deposit':
      return `${p}.stash-deposit: ${d.amountBp} BP for actor ${d.actorId} — stash now ${d.stashBalanceBp} BP, wallet ${d.walletBalanceBp} BP.`;
    case 'stash-withdraw':
      return d.lost
        ? `${p}.stash-withdraw: actor ${d.actorId} LOST the stash (bad roll).`
        : `${p}.stash-withdraw: actor ${d.actorId} withdrew ${d.amountBp} BP — wallet now ${d.walletBalanceBp} BP.`;
    case 'accrue-interest': {
      const invLines = d.investmentVerdicts.map((v) => `\n  - investment ${v.investmentId} (${v.actorName ?? v.actorId}): +${v.accruedDeltaBp} BP (accrued total ${v.accruedBp} BP)`);
      const acctLines = d.accountVerdicts.map((v) => `\n  - account ${v.accountId} (${v.actorName ?? v.actorId}): +${v.accruedDeltaBp} BP (balance ${v.newBalanceBp} BP)`);
      const reminderLines = d.loanReminders.map((r) => `\n  - loan reminder ${r.accountId} (${r.actorName ?? r.actorId}): owes ${r.totalOwedBp} BP`);
      return `${p}.accrue-interest: ${d.dryRun ? '[dry-run] ' : ''}cycleApplied=${d.cycleApplied === true}, lastCycleAt=${d.lastCycleAt ?? 'null'} — ${d.investmentVerdicts.length} investment(s), ${d.accountVerdicts.length} account(s), ${d.loanReminders.length} loan reminder(s).${invLines.join('')}${acctLines.join('')}${reminderLines.join('')}`;
    }
    case 'list-enterprises':
      return `${p}.list-enterprises: ${d.count} enterprise(s)${d.unconnectedActors ? `, ${d.actors.length} unconnected archives3 actor(s)` : ''}${d.count ? ` — ${d.enterprises.map((e) => `${e.name} (${e.instanceId}, lvl ${e.level})`).join(', ')}` : ''}${d.unconnectedActors && d.actors.length ? ` — unconnected: ${d.actors.map((a) => `${a.name} (${a.actorId})`).join(', ')}` : ''}.`;
    case 'get-enterprise':
      return `${p}.get-enterprise: ${d.name} (${d.instanceId}) — level ${d.level}, upkeep ${d.upkeep} BP, debt ${d.debt.principalBp} BP (escalation tier ${d.debt.escalationTier}), backing ${d.backing}, ${d.incomeModifiers.length} income source(s), eventTable ${d.eventTable?.uuid ?? 'none'} (${d.eventTable?.overrides?.length ?? 0} override band(s)).`;
    case 'create-enterprise':
      return `${p}.create-enterprise: instance ${d.instanceId ?? 'null'} (${d.backing}) — debt ${d.debtPrincipalBp} BP, wallet now ${d.walletBalanceBp} BP.`;
    case 'connect-enterprise-actor':
      return `${p}.connect-enterprise-actor: instance ${d.instanceId}${d.alreadyConnected ? ' (already connected)' : ''}.`;
    case 'enterprise-income':
      return `${p}.enterprise-income: enterprise ${d.enterpriseId} paid ${d.payoutBp} BP — wallet now ${d.walletBalanceBp} BP.`;
    case 'enterprise-event':
      return `${p}.enterprise-event: enterprise ${d.enterpriseId} — ${d.text}${d.matchedOverride ? ' (custom override)' : ' (global table)'}.`;
    case 'enterprise-pay-interest':
      return d.paid
        ? `${p}.enterprise-pay-interest: enterprise ${d.enterpriseId} paid — wallet now ${d.walletBalanceBp} BP.`
        : `${p}.enterprise-pay-interest: enterprise ${d.enterpriseId} DECLINED — Creditor escalation now tier ${d.escalationTier}.`;
    case 'enterprise-repay-debt':
      return `${p}.enterprise-repay-debt: enterprise ${d.enterpriseId} — principal now ${d.principalBp} BP, wallet ${d.walletBalanceBp} BP.`;
    case 'enterprise-upgrade':
      return `${p}.enterprise-upgrade: enterprise ${d.enterpriseId} → level ${d.level} — upkeep ${d.newUpkeep} BP, debt ${d.debtPrincipalBp} BP, wallet ${d.walletBalanceBp} BP.`;
    case 'delete-enterprise':
      return `${p}.delete-enterprise: "${d.name}" (${d.enterpriseId}) untracked — backing actor untouched, no coin moved.`;
    case 'set-enterprise-owners':
      return `${p}.set-enterprise-owners: enterprise ${d.enterpriseId} — ${d.owners.map((o) => `${o.actorName ?? o.actorId} (${o.sharePct}%)`).join(', ')}; primary owner ${d.ownerActorId}.`;
    case 'add-enterprise-debt':
      return `${p}.add-enterprise-debt: enterprise ${d.enterpriseId} — Creditor advanced ${d.amountBp} BP to ${d.recipientActorName ?? d.recipientActorId}, principal now ${d.principalBp} BP, wallet ${d.walletBalanceBp} BP.`;
    case 'forgive-enterprise-debt':
      return `${p}.forgive-enterprise-debt: enterprise ${d.enterpriseId} — principal now ${d.principalBp} BP.`;
    case 'list-levies':
      return `${p}.list-levies: ${d.count} levy(ies)${d.count ? ` — ${d.levies.map((l) => `${l.name} (${l.type}/${l.cadence}${l.active ? '' : ', inactive'})`).join(', ')}` : ''}.`;
    case 'save-levy-group':
      return `${p}.save-levy-group: group "${d.name}" (${d.groupId}) — ${d.actorIds.length} member(s).`;
    case 'list-levy-groups':
      return `${p}.list-levy-groups: ${d.count} group(s)${d.count ? ` — ${d.groups.map((g) => `${g.name} (${g.memberCount})`).join(', ')}` : ''}.`;
    case 'delete-levy-group':
      return `${p}.delete-levy-group: group ${d.groupId} ${d.deleted ? 'deleted' : 'not found'}.`;
    case 'create-venture':
      return `${p}.create-venture: "${d.name}" (${d.type}, ${d.ventureId}) — status ${d.status}, standing ${d.standing}.`;
    case 'get-venture':
      return `${p}.get-venture: "${d.name}" (${d.ventureId}) — ${d.type}, ${d.status}/${d.standing}, ${d.partsSubscribed}/${d.partsTotal} Parts @ ${d.priceBp} BP, escrow ${d.escrowBp} BP, ${d.holders.length} holder(s), ${d.queuedTransfers.length} queued transfer(s)${d.badges.length ? `, badges: ${d.badges.join(', ')}` : ''}.`;
    case 'list-ventures':
      return `${p}.list-ventures: ${d.count} venture(s)${d.count ? ` — ${d.ventures.map((v) => `${v.name} (${v.type}, ${v.status})`).join(', ')}` : ''}.`;
    case 'subscribe-venture':
      return `${p}.subscribe-venture: venture ${d.ventureId} — ${d.subscribedParts} Part(s) subscribed, escrow now ${d.escrowBp} BP.`;
    case 'transfer-venture-parts':
      return `${p}.transfer-venture-parts: offer ${d.offerId} queued on venture ${d.ventureId} — resolves at the next economic cycle.`;
    case 'settle-venture':
      return `${p}.settle-venture: venture ${d.ventureId} — status ${d.status}, distributed ${d.distributedBp} BP.`;
    case 'distribute-venture':
      return `${p}.distribute-venture: venture ${d.ventureId} — distributed ${d.distributedBp} BP across ${d.splitCount} split(s), escrow now ${d.escrowBp} BP.`;
    case 'venture-event':
      return `${p}.venture-event: venture ${d.ventureId} — natural ${d.naturalRoll}${d.standingModifier ? ` (modified ${d.modifiedRoll}, standing ${d.standingModifier > 0 ? '+' : ''}${d.standingModifier})` : ''}${d.critical ? `, CRITICAL ${d.critical.toUpperCase()}` : ''}: ${d.text} (standing now ${d.standing})${d.effectsApplied.length ? ` [${d.effectsApplied.join(', ')}]` : ''}.`;
    case 'toggle-venture-badge':
      return `${p}.toggle-venture-badge: venture ${d.ventureId} — badges now: ${d.badges.length ? d.badges.join(', ') : '(none)'}.`;
    case 'issue-parts':
      return `${p}.issue-parts: venture ${d.ventureId} — parts.total now ${d.partsTotal}, price ${d.priceBp} BP.`;
    case 'set-venture-status':
      return `${p}.set-venture-status: venture ${d.ventureId} — status now ${d.status}.`;
    case 'set-venture-standing':
      return `${p}.set-venture-standing: venture ${d.ventureId} — standing now ${d.standing}.`;
    default: {
      const _exhaustive: never = d;
      return `${p}: ${JSON.stringify(_exhaustive)}`;
    }
  }
}

export interface ModuleWfrpEconomyToolOptions extends BaseToolOptions {}

export class ModuleWfrpEconomyTool extends BaseTool {
  constructor(options: ModuleWfrpEconomyToolOptions) {
    super(options);
  }

  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [{ name: 'module-wfrp-economy', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-wfrp-economy',
        title: 'Warhammer Economy integration — banks / loans / stocks / property / wallet ledger',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Drive the Warhammer Economy module (wfrp4e-economy) — named bank economies with interest-bearing accounts, loans, an account-to-account transfer rail, a stock market with portfolios, property ownership/rent, and an immutable transaction ledger. All state persists in world settings (economies / bankers / bankAccounts / stockPortfolios / transactionLogs — server-verifiable). Wallet ops read/write the actor's WFRP4e money items (GC/SS/BP at 240/12/1 BP). Additive to /module-itempiles (physical loot) and /wfrp-status (weekly earnings).
Conditional: returns MODULE_NOT_ACTIVE when wfrp4e-economy is absent/inactive. Pre-flight: module-probe.is-active wfrp4e-economy. All amounts are integer Brass Pennies (BP).

CONFIRM-GATED (CCR-4): delete-economy (purges the economy + its accounts/bankers/portfolios/logs), delete-account (removes the account record; transaction history is kept), money-to-burn (unless dryRun:true), transfer >= 4800 BP (20 GC), resolve-investment, stash-withdraw (both can total-loss the holding on a bad roll), create-enterprise, enterprise-repay-debt, enterprise-upgrade, delete-enterprise, set-enterprise-owners, add-enterprise-debt, forgive-enterprise-debt, save-levy-group, delete-levy-group, create-venture, subscribe-venture, transfer-venture-parts, settle-venture, distribute-venture, toggle-venture-badge, issue-parts, set-venture-status, and set-venture-standing require confirm:true. EXCLUDED (HC-v2-6 dialog-deadlock): advance-day, clearAllFinancialData, and every UI-open — not exposed. RETIRED (Phase 7d): buy-stock / sell-stock / get-portfolio — the Venture Ledger replaces stock trading; calling any of the three returns a typed WFRP_ECONOMY_ACTION_RETIRED error naming the venture-ledger successors (enum literals stay for HC8 back-compat, but the action itself always fails now). BADGE-GATED (Phase 7d2, D7): subscribe-venture and transfer-venture-parts refuse with WFRP_ECONOMY_VENTURE_DISPUTED while the deed carries the Disputed badge; distribute-venture and settle-venture refuse with WFRP_ECONOMY_VENTURE_SEIZED while Seized. settle-venture also refuses with WFRP_ECONOMY_VENTURE_SETTLE_DELAYED while delayCycles > 0 (a fixed false-success bug, B2).

64 actions:
stand-up-an-economy: list-economies {} · get-economy { economyId } · list-bankers { economyId? } · create-economy { name, currency?, currencySystem?, banks?, properties?, stocks? } · update-economy { economyId, name?, currency?, banks?, properties?, stocks? } · delete-economy { economyId, confirm }.
open-a-bank-account: create-account { economyId, bankId, actorId } · list-accounts { economyId?, actorId? }.
run-a-transaction: deposit { economyId, accountId, amountBp } · withdraw { economyId, accountId, amountBp } · transfer { economyId, sourceAccountId, destinationAccountId, amountBp, confirm? }.
loan-cycle: request-loan { economyId, accountId, amountBp, interestRate? } · repay-loan { economyId, accountId, amountBp }.
investment-cycle (RETIRED Phase 7d — the Venture Ledger replaces stock trading): buy-stock {} · sell-stock {} · get-portfolio {} — all three now IMMEDIATELY return WFRP_ECONOMY_ACTION_RETIRED naming create-venture/subscribe-venture/transfer-venture-parts/list-ventures as successors; no fields are read.
property-management: buy-property { economyId, accountId, propertyId } · sell-property { economyId, accountId, propertyId } (credits value × the GM-configurable propertySaleRate world setting, default 0.8) · set-rented { economyId, propertyId, rented }.
wallet-quick-adjust: get-wallet-balance { actorId, economyId? } · wallet-add { actorId, amountBp, economyId? } · wallet-remove { actorId, amountBp, economyId? }.
audit-the-ledger: list-transactions { actorId?, economyId?, type?, bankId?, source? } · actor-transaction-summary { actorId, economyId } · bank-transaction-summary { bankId, economyId }.
unified-ledger: record-transaction { actorId, amountBp, source, type, description, economyId?, bankId?, targetActorId?, currency? } — append an arbitrary ledger row (source: earn/trade/itempiles/levy/economy); use for skill/levy callers that write coins outside this module's own 9 tracked ops · delete-account { accountId, economyId?, confirm } — remove a stale/orphaned account record (does NOT cascade-delete ledger history).
levy-and-burn: apply-levies { actorIds?, target?, groupId?, levyIds?, excludeActorIds?, dryRun?, declared? } — cadence-gated levy tick (weekly cost-of-living is seeded built-in; monthly/per-travel/one-off levies apply only when named in levyIds). Roster resolution (Phase 7c, R7c.5): explicit actorIds always WINS (back-compat); otherwise groupId (or target:"party") resolves the roster engine-side via the SAME resolveTargets() the Levies tab's target select uses — groupId names a levyGroups entry, target:"party" resolves every player-owned character. Omitting ALL of actorIds/target/groupId (BUG-543 fix) resolves each levy's OWN embedded target per-levy: group-targeted levies charge their named group verbatim; party-scoped levies charge every player-owned character minus the levyExcludedActorIds world setting (the Levies tab's Party Roster checkboxes). Auto payment model: can-pay → pays; insufficient → declines (status modifier -1, no partial deduction; a paid-while-declined actor recovers +1, floored at 0). Charges exactly ONE elapsed week per call — call again to catch up further weeks; the response reports elapsedWeeks so a caller can loop. Character-only (npc/creature actors are refused — the source macro's uncascaded NPC writes were a bug, not RAW). dryRun:true previews with zero writes and no confirm required. declared:true (ADR-U3 extension) is a GM-declared apply — no elapsed-time gate, charges exactly once per call, and stamps state to the CURRENT levy index instead of walking elapsedWeeks forward. Delegates to the wfrp4e-economy fork's own levy engine — the SAME engine the Economy Manager's Levies tab buttons call · money-to-burn { actorIds?, target?, groupId?, dryRun?, confirm } — RAW Money-to-Burn: zeroes every unprotected carried money item's quantity at downtime's end (items are never deleted). Bank-account balances, recorded stashes, AND active endeavour investments (principal + accrued) are protected and survive. Same actorIds/target/groupId resolution as apply-levies (Q&A fold-in, Phase 7c). Requires confirm:true to execute; dryRun:true previews without confirm. Both actions render all amounts full-triple (e.g. "0gc 6ss 0bp", including the zero-case).
banking-and-income (RAW Banking/Income Between-Adventures Endeavours — Phase 5b, cycle semantics per ADR-U3): invest { actorId, rate(1-10), amountBp, economyId?, bankId? } — open an interest-bearing endeavour investment at a chosen/rolled rate (percent per economic cycle — a GM-declared abstract period, not a calendar month); debits the actor's wallet immediately. Returns { insufficientFunds: true, walletBalanceBp, requiredBp } and writes nothing when the wallet can't cover amountBp. Investments are a STANDALONE store (endeavourInvestments), NOT a bank-account field — bank accounts carry no per-account rate · resolve-investment { investmentId, d100Roll(1-100), confirm } — settle an investment: RAW d100Roll <= rate is a TOTAL LOSS (bankrupt, no payout); otherwise credits principal+accrued to the wallet and closes the investment. Pre-roll the d100 via dice-roll and pass the total — this action never rolls dice itself; a non-integer or out-of-1-100 roll returns { invalidRoll: true, d100Roll } with no write. confirm:true required (can total-loss) · list-investments { actorId?, activeOnly? } — read-only projection, each entry carries lastCycleAt (ISO, display-only) · stash-deposit { actorId, amountBp } — debit wallet into the RAW Stashing option (money-to-burn-protected, zero interest); same insufficientFunds guard as invest · stash-withdraw { actorId, d100Roll(1-100), confirm } — WHOLE-STASH withdrawal only (no partial); RAW d100Roll <= 10 is a total loss of the stash; confirm:true required; same invalidRoll guard as resolve-investment · accrue-interest { economyId?, dryRun? } — one MCP call covers THREE duties: (a) each active endeavour investment accrues at its own rate, (b) every bank account with balance > 0 at an interest-bearing bank accrues at the bank's rate, (c) accounts with an active loan get a reminder verdict (no coin moved). CYCLE SEMANTICS (ADR-U3): NOT gated on elapsed calendar time — every call accrues one abstract GM-declared cycle to every eligible entity; cycleApplied is always true and there is no "caught up" no-op state, so calling it twice in a row pays twice. lastCycleAt (ISO, display-only) is returned for UI display. dryRun:true previews with zero writes, no confirm required. Rental income and stock-market fluctuation (the module's other two cycle duties) are module-UI-only this phase (the Economy Manager's "Run Economic Cycle" button) — not exposed here. TRAP: running the module's own "Run Economic Cycle" button AND this action for the same GM-declared cycle double-pays regular bank accounts and investments — pick one per world, per cycle.

legitimate-business-enterprises (RAW Legitimate Business Enterprises, Archives III — Phase 6): list-enterprises { unconnectedActors? } — read-only projection over the 'enterprises' world setting; unconnectedActors:true additionally lists world archives3 enterprise actors with no instance record yet · get-enterprise { enterpriseId } — full record incl. incomeModifiers, eventTable, and debt { principalBp, escalationTier } · create-enterprise { presetKey?, profile?, backing, ownerActorId, actorId?, financedPortionBp?, confirm } — start a new enterprise from a built-in Archives III preset (presetKey) or a custom profile object; backing:"create" embeds a NEW wfrp4e-archives3 enterprise actor (requires wfrp4e-archives3 active — returns MODULE_NOT_ACTIVE otherwise), backing:"link" attaches an EXISTING archives3 actor (actorId required), backing:"data-only" keeps no actor at all. financedPortionBp is the BP a Creditor covers (becomes debt principal); the remainder debits the owner actor's wallet immediately. confirm:true required · connect-enterprise-actor { actorId, ownerActorId? } — durable discover-and-connect for an existing archives3 enterprise actor not yet tracked; alreadyConnected:true is a success, not an error · enterprise-income { enterpriseId, rolledTotal, outcome } — pay one income roll's payout across every incomeModifiers source; pre-roll and pass rolledTotal/outcome, this action never rolls itself · enterprise-event { enterpriseId, d100Roll } — draw one event-table result (a custom override band first, then the linked Foundry table); pre-roll and pass d100Roll · enterprise-pay-interest { enterpriseId, declineToPay? } — pay the enterprise's upkeep as a Creditor interest payment, or declineToPay:true to skip (escalates the Creditor's escalationTier instead) · enterprise-repay-debt { enterpriseId, amountBp, confirm } — pay down debt.principal directly; confirm:true required · enterprise-upgrade { enterpriseId, level, financedPortionBp?, confirm } — apply a profile's upgradePaths entry; RAW-refused with zero writes while the enterprise carries active Creditor debt (upgradeBlocked). confirm:true required · delete-enterprise { enterpriseId, confirm } — UNTRACK an enterprise: removes the store instance only (the backing Actor is never deleted, no coin moves, an enterprise-delete ledger row is logged — RAW tie-in: use after a tier-3 Creditor seizure/destruction). confirm:true required. All ten delegate to the wfrp4e-economy fork's own headless enterprises engine (src/enterprises/enterprise-engine.js) except list-enterprises(default)/get-enterprise, which are pure reads.

enterprise-ownership-and-debt (Phase 7c, R7c.1/R7c.2 — widens the single ownerActorId scalar to weighted co-ownership + RAW Archives III Creditors debt ops): set-enterprise-owners { enterpriseId, ownerShares: [{ actorId, sharePct }], confirm } — replace the owners list; ownerShares' sharePct MUST sum to exactly 100 (integer percent) or the call is refused with zero writes ({ invalidShares: true, shareSum }). ownerActorId/ownerActorName in get-enterprise/list-enterprises responses are MAINTAINED as a deprecated alias = the largest-share owner (ties → first) — every existing single-owner caller keeps working unchanged. { ventureId } owner slots (lifted Phase 7d) let a venture hold an enterprise share — validated against the live ventures store (returns WFRP_ECONOMY_VENTURE_NOT_FOUND if the id doesn't exist); that slot's income/interest share routes to the venture's escrowBp instead of an actor wallet, never touches ownerActorId. confirm:true required · add-enterprise-debt { enterpriseId, amountBp, creditor?: { name?, notes? }, recipientActorId?, confirm } — RAW: a Creditor covers costs the characters can't; credits amountBp to ONE recipient actor (default = the primary/largest-share owner) and adds amountBp to debt.principal. Distinct ledger type (enterprise-add-debt) from enterprise-repay-debt. confirm:true required · forgive-enterprise-debt { enterpriseId, amountBp?, confirm } — reduces debt.principal by amountBp, or to ZERO when amountBp is omitted (forgive the entire remaining principal); zero wallet writes (forgiveness is the Creditor's grace, not a payment). Distinct ledger type (enterprise-debt-forgiven). confirm:true required. All three delegate to enterprise-engine.js's setOwners/addDebt/forgiveDebt exports.

levy-groups (Phase 7c, R7c.4/R7c.5 — named actor rosters a levy's target/groupId can point at): list-levies {} — read-only projection over the levies world setting; each row carries type (tax/toll/due/tithe/custom/builtin — a UI/read-filter concern only, the engine never branches on it) · save-levy-group { groupId?, name, actorIds, confirm } — create (omit groupId) or rename/re-member (pass groupId) a named roster; confirm:true required · list-levy-groups {} — read-only projection over the levyGroups world setting · delete-levy-group { groupId, confirm } — remove a named roster (levies still targeting it resolve to an empty roster afterward — no cascade rewrite). confirm:true required. All four read/write the levyGroups world setting that apply-levies'/money-to-burn's groupId param resolves against.

venture-ledger (Phase 7d, extended Phase 7d2 — Venture Events v2, WFRP-native risk model): create-venture { name, type: expedition|partnership|project|concern, parts: { total, priceBp }, terms?: { managerActorId?, managerPortionPct? }, handledBy?, linkedEnterpriseId?, exposureTags?, confirm } — start a new deed; Expedition/Project self-liquidate on settle-venture, Partnership/Chartered-Concern are open-ended (distribute-venture repeatedly, or Wind Up via set-venture-status to reach Settling — GM-only, module UI). parts.total × parts.priceBp IS the deed's valuation (no separate valueBp field). confirm:true required · get-venture { ventureId } — full record incl. holders, queuedTransfers, badges, notices, deedDateText · list-ventures { type?, status? } — read-only projection, both filters optional · subscribe-venture { ventureId, actorId? | externalName?, partsCount, confirm } — buy Parts; coin flows into the deed's escrowBp (an actor is debited; an externalName subscriber's coin is narrative off-book). Refused ({ registryNotHandling: true }) unless the deed carries a handledBy[] entry with role:"registry"; ALSO refused with WFRP_ECONOMY_VENTURE_DISPUTED while the deed carries the Disputed badge. confirm:true required · transfer-venture-parts { ventureId, sellerActorId? | sellerExternalName?, partsCount, askingPriceBp, confirm } — QUEUE a secondary-market sell offer; it does NOT resolve here — resolution (a standing- AND price-modified buyer roll, 7d2 §8b) happens only at the fork's own "Run Economic Cycle" button (module UI, not exposed via MCP this phase); the whole batch stays queued if the deed is Disputed. confirm:true required · settle-venture { ventureId, netBp?, confirm } — Expedition/Project always; Partnership/Chartered-Concern ONLY after a GM Wind Up (refused with { doesNotSettle: true } otherwise): credits netBp into escrow, then auto-distributes and marks the deed completed. Refused with WFRP_ECONOMY_VENTURE_SEIZED while Seized, or WFRP_ECONOMY_VENTURE_SETTLE_DELAYED while delayCycles > 0 (typed — previously false-succeeded, bug B2). confirm:true required · distribute-venture { ventureId, confirm } — drain the deed's current escrowBp to every holder by Parts-weighted split (a manager cut is taken first when terms.managerPortionPct is set); external holders' shares stay in escrow with a notice (no wallet to credit). Refused with WFRP_ECONOMY_VENTURE_SEIZED while Seized. confirm:true required · venture-event { ventureId, d100Roll } — draw one event band from the table matching the deed's CURRENT STATUS (Open/Funded/Underway/Settling each have their own table, 7d2 §3); pre-roll and pass the NATURAL d100 (this action never rolls itself — a natural 01/100 is a standing-gated critical, resolved before any band lookup). Response is additive: naturalRoll, modifiedRoll (standing-adjusted, clamped 2-99), standingModifier, critical ('boon'|'disaster'|null), effectsApplied (the effect field names this draw touched) alongside the existing text/standing. Refused with { noEventsForStatus: true, status } on a Completed/Defaulted deed · toggle-venture-badge { ventureId, badge: disputed|seized, confirm } — GM toggle for the two MANUAL badges (Delayed is derived from delayCycles and cannot be set here); Disputed gates subscribe/transfer-resolution, Seized freezes escrow. confirm:true required · issue-parts { ventureId, count, priceModPct?, confirm } — raises parts.total (dilution happens for free once the new Parts are subscribed — existing holders keep their absolute Parts, their SHARE falls only when new coin actually enters escrow); priceModPct optionally moves parts.priceBp in the same call. confirm:true required · set-venture-status { ventureId, status, confirm } — GM override of the deed's status (incl. the Wind Up idiom: move an open-ended deed to 'settling' so the Reckoning table applies and settle-venture becomes reachable). confirm:true required · set-venture-standing { ventureId, standing, confirm } — GM override of the deed's standing ladder position. confirm:true required. All twelve delegate to the wfrp4e-economy fork's own headless ventures engine (src/ventures/venture-engine.js) except get-venture/list-ventures, which are pure reads. NO delete-venture action (UI-only, GM-warned instead when a deed is Defaulted or Ruinous).

For create-economy, embed a stock to enable the buy/sell round-trip: stocks:[{ name, symbol, currentPrice, availableShares }] — historical stock DATA still round-trips through get-economy/create-economy (R7d.7, frozen), even though buy-stock/sell-stock/get-portfolio themselves are retired. Example: { action: "deposit", economyId: "abc", accountId: "def", amountBp: 240 }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: [...WFRP_ECONOMY_ACTIONS], description: 'Warhammer Economy action to perform.' },
            economyId: { type: 'string', description: 'Economy id (most actions).' },
            bankId: { type: 'string', description: 'Bank id within the economy (create-account / bank-transaction-summary).' },
            accountId: { type: 'string', description: 'Bank account id (deposit / withdraw / loan / stock / property / delete-account).' },
            sourceAccountId: { type: 'string', description: 'transfer: source bank account id.' },
            destinationAccountId: { type: 'string', description: 'transfer: destination bank account id.' },
            actorId: { type: 'string', description: 'Actor id (create-account / wallet ops / get-portfolio / summaries / list filter / record-transaction / invest / list-investments / stash-deposit / stash-withdraw / connect-enterprise-actor (required) / create-enterprise (only when backing:"link")).' },
            stockId: { type: 'string', description: 'Stock id within the economy (buy-stock / sell-stock).' },
            propertyId: { type: 'string', description: 'Property id within the economy (buy/sell-property / set-rented).' },
            amountBp: { type: 'number', description: 'Amount in integer Brass Pennies (deposit/withdraw/transfer/loan/wallet/record-transaction/invest/stash-deposit/enterprise-repay-debt). add-enterprise-debt (required): BP the Creditor advances. forgive-enterprise-debt: BP to forgive (omit = forgive the entire remaining principal). 1 GC = 240 BP, 1 SS = 12 BP.' },
            activeOnly: { type: 'boolean', description: 'list-investments: when true, exclude resolved (bankrupt/paid-out) investments.' },
            quantity: { type: 'number', description: 'Share count (buy-stock / sell-stock).' },
            interestRate: { type: 'number', description: 'request-loan: optional loan interest percent (defaults to the bank loanRate).' },
            rented: { type: 'boolean', description: 'set-rented: the rented state to set.' },
            name: { type: 'string', description: 'create-economy (required) / update-economy: economy display name. save-levy-group (required): the group\'s display name.' },
            currency: { type: 'string', description: 'create-economy / update-economy: currency display name (default "Gold Crowns"). record-transaction: optional currency label on the logged row.' },
            currencySystem: { type: 'string', description: 'create-economy / update-economy: "triCurrency" for WFRP4e (default).' },
            banks: { type: 'array', items: { type: 'object', additionalProperties: true }, description: 'create-economy / update-economy: bank objects { name, interestRate?, loanRate? } (ids auto-filled).' },
            properties: { type: 'array', items: { type: 'object', additionalProperties: true }, description: 'create-economy / update-economy: property objects { name, value } (ids auto-filled).' },
            stocks: { type: 'array', items: { type: 'object', additionalProperties: true }, description: 'create-economy / update-economy: stock objects { name, symbol, currentPrice, availableShares } (ids auto-filled).' },
            type: { type: 'string', description: 'list-transactions: optional transaction-type filter (e.g. deposit, withdraw, stock_purchase). record-transaction (required): free-form transaction type label. list-ventures: optional venture type filter (expedition/partnership/project/concern).' },
            source: { type: 'string', enum: ['earn', 'trade', 'itempiles', 'levy', 'economy'], description: 'record-transaction (required): who originated this row. list-transactions: optional source filter.' },
            description: { type: 'string', description: 'record-transaction (required): human-readable ledger description.' },
            targetActorId: { type: 'string', description: 'record-transaction: optional second actor (e.g. transfer counterparty).' },
            confirm: { type: 'boolean', description: 'delete-economy / delete-account / large transfer / money-to-burn (unless dryRun:true) / resolve-investment / stash-withdraw / create-enterprise / enterprise-repay-debt / enterprise-upgrade / delete-enterprise / set-enterprise-owners / add-enterprise-debt / forgive-enterprise-debt / save-levy-group / delete-levy-group: must be true to execute the gated op.' },
            actorIds: { type: 'array', items: { type: 'string' }, description: 'apply-levies / money-to-burn: actor ids to process — wins over target/groupId when provided (back-compat). save-levy-group (required): the group\'s member actor ids.' },
            levyIds: { type: 'array', items: { type: 'string' }, description: 'apply-levies: optional explicit levy ids to apply (omit = all cadence-eligible levies, e.g. the weekly cost-of-living levy).' },
            excludeActorIds: { type: 'array', items: { type: 'string' }, description: 'apply-levies: optional actor ids to skip this run.' },
            dryRun: { type: 'boolean', description: 'apply-levies / money-to-burn: preview the outcome with zero writes; does not require confirm. accrue-interest: same, and also skipped when dryRun is set (no confirm required either way).' },
            target: { type: 'string', enum: ['party'], description: 'apply-levies / money-to-burn: "party" resolves every player-owned character (the default when neither target nor groupId nor actorIds is given). Ignored when actorIds is provided.' },
            groupId: { type: 'string', description: 'apply-levies / money-to-burn: id of a levyGroups entry to target (resolveTargets(), Phase 7c). save-levy-group: omit to create a new group, pass to rename/re-member an existing one. delete-levy-group (required): the group to remove.' },
            ownerShares: { type: 'array', items: { type: 'object', additionalProperties: true, properties: { actorId: { type: 'string' }, ventureId: { type: 'string' }, sharePct: { type: 'number' } }, required: ['sharePct'] }, description: 'set-enterprise-owners (required): the new owners list — [{ actorId, sharePct }] or [{ ventureId, sharePct }] (Phase 7d: a venture-held slot), sharePct integers MUST sum to exactly 100.' },
            creditor: { type: 'object', additionalProperties: false, properties: { name: { type: 'string' }, notes: { type: 'string' } }, description: 'create-enterprise / enterprise-upgrade / add-enterprise-debt: Creditor identity (RAW Archives III) — { name?, notes? }.' },
            recipientActorId: { type: 'string', description: 'add-enterprise-debt: which owner actor receives the Creditor\'s BP (omit = the primary/largest-share owner).' },
            investmentId: { type: 'string', description: 'Endeavour investment id (resolve-investment).' },
            rate: { type: 'number', description: 'invest (required): interest rate as an integer percent 1-10 per economic cycle (RAW Banking endeavour — roll 1d10 or GM-picked).' },
            d100Roll: { type: 'number', description: 'resolve-investment / stash-withdraw / enterprise-event / venture-event (required): pre-rolled d100 total (1-100). resolve-investment: <= rate is bankruptcy. stash-withdraw: <= 10 loses the whole stash. enterprise-event: looks up the matching event-table band. venture-event: the NATURAL roll (WFRP-native, unmodified) — a natural 01/100 is always a critical regardless of standing; otherwise standing-modified before the band lookup. This action never rolls dice itself.' },
            declared: { type: 'boolean', description: 'apply-levies: ADR-U3 extension — GM-declared apply (no elapsed-time gate, charges exactly once per call, stamps state to the CURRENT levy index instead of walking elapsedWeeks forward).' },
            enterpriseId: { type: 'string', description: 'Enterprise instance id (get-enterprise / enterprise-income / enterprise-event / enterprise-pay-interest / enterprise-repay-debt / enterprise-upgrade / delete-enterprise / set-enterprise-owners / add-enterprise-debt / forgive-enterprise-debt).' },
            presetKey: { type: 'string', description: 'create-enterprise: id of a built-in Archives III enterprise preset (omit when passing a custom profile).' },
            profile: { type: 'object', additionalProperties: true, description: 'create-enterprise: a custom enterprise-profile object (enterprise-presets.js shape) — used when presetKey is omitted; persisted into the store under a generated id.' },
            backing: { type: 'string', enum: ['create', 'link', 'data-only'], description: 'create-enterprise (required): "create" embeds a NEW wfrp4e-archives3 enterprise actor (requires wfrp4e-archives3 active); "link" attaches an EXISTING archives3 actor (actorId required); "data-only" keeps no actor.' },
            ownerActorId: { type: 'string', description: 'create-enterprise (required): the actor who owns/funds the enterprise. connect-enterprise-actor: optional owner to assign on connect.' },
            financedPortionBp: { type: 'number', description: 'create-enterprise / enterprise-upgrade: BP a Creditor covers (becomes/adds to debt.principal) — the remainder debits the owner actor\'s wallet immediately. Pair with creditor to record who covered it.' },
            unconnectedActors: { type: 'boolean', description: 'list-enterprises: when true, also list world wfrp4e-archives3 enterprise actors with no instance record yet (calls discoverEnterpriseActors).' },
            rolledTotal: { type: 'number', description: 'enterprise-income (required): pre-rolled income-test total. This action never rolls dice itself.' },
            outcome: { type: 'string', enum: ['success', 'fail', 'astounding-fail'], description: 'enterprise-income (required): the income test\'s outcome band, paired with rolledTotal.' },
            declineToPay: { type: 'boolean', description: 'enterprise-pay-interest: when true, skip paying upkeep and escalate the Creditor\'s escalationTier instead of debiting the wallet.' },
            level: { type: 'number', description: 'enterprise-upgrade (required): the profile\'s upgradePaths[].level to apply.' },
            ventureId: { type: 'string', description: 'Venture deed instance id (get-venture / subscribe-venture / transfer-venture-parts / settle-venture / distribute-venture / venture-event / toggle-venture-badge / issue-parts / set-venture-status / set-venture-standing, all required).' },
            parts: { type: 'object', additionalProperties: false, properties: { total: { type: 'number' }, priceBp: { type: 'number' } }, description: 'create-venture (required): { total, priceBp } — total Parts and price per Part in BP; total × priceBp IS the deed valuation.' },
            partsCount: { type: 'number', description: 'subscribe-venture / transfer-venture-parts (both required): a Parts quantity (NOT the create-venture `parts` object — that field only exists on create-venture).' },
            terms: { type: 'object', additionalProperties: false, properties: { managerActorId: { type: 'string' }, managerPortionPct: { type: 'number' } }, description: 'create-venture: optional { managerActorId?, managerPortionPct? } — a flat manager cut taken before the Parts-weighted distribute split.' },
            handledBy: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { role: { type: 'string' }, name: { type: 'string' } }, required: ['role'] }, description: 'create-venture: [{ role, name? }] — subscribe-venture is refused unless this array carries an entry with role:"registry".' },
            linkedEnterpriseId: { type: 'string', description: 'create-venture: optional enterprise instance id this venture is tied to (narrative link only).' },
            exposureTags: { type: 'array', items: { type: 'string' }, description: 'create-venture: optional free-form risk/flavor tags.' },
            externalName: { type: 'string', description: 'subscribe-venture: off-book subscriber name (alternative to actorId — coin is narrative, no wallet debited).' },
            sellerActorId: { type: 'string', description: 'transfer-venture-parts: the selling holder\'s actor id (alternative to sellerExternalName).' },
            sellerExternalName: { type: 'string', description: 'transfer-venture-parts: the selling holder\'s external (off-book) name (alternative to sellerActorId).' },
            askingPriceBp: { type: 'number', description: 'transfer-venture-parts (required): asking price in BP for the queued Parts offer.' },
            netBp: { type: 'number', description: 'settle-venture: net proceeds in BP credited into escrow before auto-distribution (omit = 0).' },
            status: { type: 'string', enum: ['open', 'funded', 'underway', 'settling', 'completed', 'defaulted'], description: 'list-ventures: optional deed-status filter. set-venture-status (required): the GM-forced status — the Wind Up idiom is set-venture-status { status: "settling" } on an open-ended (Partnership/Chartered-Concern) Underway deed.' },
            standing: { type: 'string', enum: ['celebrated', 'esteemed', 'reputable', 'uncertain', 'troubled', 'ruinous'], description: 'set-venture-standing (required): the GM-forced standing ladder position.' },
            badge: { type: 'string', enum: ['disputed', 'seized'], description: 'toggle-venture-badge (required): which MANUAL badge to add-if-absent/remove-if-present. Delayed is derived from delayCycles and cannot be set here.' },
            count: { type: 'number', description: 'issue-parts (required): how many NEW Parts to add to parts.total (dilutes existing holders only once the new Parts are subscribed).' },
            priceModPct: { type: 'number', description: 'issue-parts: optional signed percent applied to parts.priceBp in the same call (e.g. -25 for a fire-sale capital raise).' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: WfrpEconomyArgs) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-wfrp-economy action', { action });
    if (!(WFRP_ECONOMY_ACTIONS as readonly string[]).includes(action)) {
      return this.errorResponse(action, `unknown action: ${action}`);
    }
    try {
      const data = await this.query<WfrpEconomyResult>('module-wfrp-economy', rawArgs);
      return {
        content: [{ type: 'text' as const, text: formatResult(data) }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-wfrp-economy', msg);
      return this.errorResponse(action, msg);
    }
  }
}
