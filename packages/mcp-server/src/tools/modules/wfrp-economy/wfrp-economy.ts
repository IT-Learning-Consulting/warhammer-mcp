// Module Integration v2 Phase 6 — module-wfrp-economy MCP tool (Warhammer Economy, wfrp4e-economy v1.0.0).
//
// Always-registered umbrella. The foundry-module handler guards on wfrp4e-economy being active; when
// inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw → moduleNotActiveContent().
// Pre-flight with module-probe.is-active wfrp4e-economy.
//
// 92 actions across 17 idioms (stand-up-an-economy, open-a-bank-account, run-a-transaction, loan-cycle,
// investment-cycle [RETIRED Phase 7d], property-management, wallet-quick-adjust, audit-the-ledger,
// unified-ledger, levy-and-burn, banking-and-income, legitimate-business-enterprises,
// enterprise-ownership-and-debt [Phase 7e2: +1 action — set-enterprise-income-sources], levy-groups,
// venture-ledger [Phase 7d2: +4 actions — toggle-venture-badge, issue-parts, set-venture-status,
// set-venture-standing], trading [Phase 7f: +20 actions, trading-* prefix; post-7f: +3 actions —
// trading-list-vehicle-actors, trading-connect-cargo-vehicle, trading-disconnect-cargo-vehicle; post-7f
// Trade Rumour Table redesign (Change 1/2): +1 action — trading-delete-rumour], economic-climate
// [Phase 8: +2 actions — climate-get-state, climate-set-state (GM-only)]; banking-and-income
// [Phase 9, D7 revisit: +1 action — run-economic-cycle, the module-UI-only "Run Economic Cycle" button's
// headless composer]). Anchors:
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
      return d.retired
        ? `${p}.list-bankers: banker assignments are retired; no assignment records remain.`
        : `${p}.list-bankers: ${d.count} banker(s).`;
    case 'create-economy':
      return `${p}.create-economy: ${d.name} (${d.economyId}) — ${d.bankCount} bank/${d.stockCount} stock/${d.propertyCount} property.`;
    case 'update-economy':
      return `${p}.update-economy: ${d.name} (${d.economyId}) updated.`;
    case 'delete-economy':
      return `${p}.delete-economy: economy ${d.economyId} ${d.deleted ? 'archived and deleted (transaction history retained)' : 'not deleted'}.`;
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
      return d.ownerDeleted
        ? `${p}.resolve-investment: investment ${d.investmentId} — owner actor no longer exists, NOT resolved (principal ${d.principalBp} + accrued ${d.accruedBp} on record). Untrack via the Banking tab's Remove Record control.`
        : d.bankrupt
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
    case 'run-economic-cycle': {
      const invLines = d.investmentVerdicts.map((v) => `\n  - investment ${v.investmentId} (${v.actorName ?? v.actorId}): +${v.accruedDeltaBp} BP (accrued total ${v.accruedBp} BP)`);
      const acctLines = d.accountVerdicts.map((v) => `\n  - account ${v.accountId} (${v.actorName ?? v.actorId}): +${v.accruedDeltaBp} BP (balance ${v.newBalanceBp} BP)`);
      const reminderLines = d.loanReminders.map((r) => `\n  - loan reminder ${r.accountId} (${r.actorName ?? r.actorId}): owes ${r.totalOwedBp} BP`);
      const rentalLines = d.rentalVerdicts.map((v) =>
        v.notFound
          ? `\n  - rental ${v.propertyName ?? v.propertyId}: linked account NOT FOUND`
          : `\n  - rental ${v.propertyName ?? v.propertyId} (${v.actorName ?? v.actorId}): +${v.incomeBp} BP (balance ${v.newBalanceBp} BP)`,
      );
      const ventureLines = d.ventureVerdicts.map((v) => `\n  - venture ${v.ventureId} [${v.kind}]`);
      return `${p}.run-economic-cycle: ${d.dryRun ? '[dry-run] ' : ''}economy=${d.economyId}, lastCycleAt=${d.lastCycleAt ?? 'null'} — ${d.investmentVerdicts.length} investment(s), ${d.accountVerdicts.length} account(s), ${d.loanReminders.length} loan reminder(s), ${d.rentalVerdicts.length} rental verdict(s), ${d.ventureVerdicts.length} venture-pass event(s)${d.dryRun ? ' (venture pass not previewed on dryRun)' : ''}.${invLines.join('')}${acctLines.join('')}${reminderLines.join('')}${rentalLines.join('')}${ventureLines.join('')}`;
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
      return `${p}.enterprise-repay-debt: enterprise ${d.enterpriseId} — applied ${d.appliedBp} BP, unapplied ${d.unappliedBp} BP, principal now ${d.principalBp} BP, wallet ${d.walletBalanceBp} BP.`;
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
    case 'set-enterprise-income-sources':
      return `${p}.set-enterprise-income-sources: enterprise ${d.enterpriseId} — ${d.incomeModifiers.length} source(s)${d.actorSynced ? ', synced to backing actor' : ''}.`;
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
    case 'trading-list-settlements':
      return `${p}.trading-list-settlements: ${d.count} settlement(s).`;
    case 'trading-list-cargo-types':
      return `${p}.trading-list-cargo-types: ${d.count} cargo type(s).`;
    case 'trading-get-season':
      return `${p}.trading-get-season: ${d.season} (source: ${d.seasonSource}).`;
    case 'trading-set-season':
      return `${p}.trading-set-season: ${d.season} (source: ${d.seasonSource}).`;
    case 'trading-check-availability':
      return `${p}.trading-check-availability: ${d.settlement} (${d.season}) — ${d.slotCount} slot(s): ${d.slots.map((s) => `${s.cargo.name} ${s.amountEp}EP`).join(', ')}.`;
    case 'trading-calc-purchase-price':
      return `${p}.trading-calc-purchase-price: ${d.quantity} EP ${d.cargoName} (${d.season}) — ${bpToTriple(d.totalBp)} total (${d.pricePerEpBp.toFixed(2)} BP/EP).`;
    case 'trading-calc-sale-price':
      return `${p}.trading-calc-sale-price: ${d.quantity} EP ${d.cargoName} at ${d.settlement} (${d.season}) — ${bpToTriple(d.totalBp)} total (${d.pricePerEpBp.toFixed(2)} BP/EP)${d.linkedDemandApplied ? `, linked demand: ${d.linkedDemandApplied.reason} (x${d.linkedDemandApplied.multiplier})` : ''}.`;
    case 'trading-haggle-test':
      return `${p}.trading-haggle-test: ${d.resultDescription} — ${d.success ? 'player wins' : 'merchant wins/tie'}.`;
    case 'trading-gossip-test':
      return `${p}.trading-gossip-test: ${d.resultDescription} — ${d.success ? 'success' : 'failure'} (${d.degrees} degree(s))${d.rumourMinted ? ` — minted rumour ${d.rumourMinted.id} (${d.rumourMinted.effect.kind} x${d.rumourMinted.effect.multiplier}, goods: ${d.rumourMinted.goods.join(', ')})` : ''}.`;
    case 'trading-buy-cargo':
      return `${p}.trading-buy-cargo: ${d.quantity} EP ${d.cargoName} at ${d.settlement} for ${bpToTriple(d.totalBp)} (lot ${d.lotId}) — wallet now ${bpToTriple(d.walletBalanceBp)}${d.secretQuality ? `, secret quality: ${d.secretQuality.tier}` : ''}${d.rumourApplied ? `, rumour applied (x${d.rumourApplied.multiplier})` : ''}.`;
    case 'trading-sell-cargo':
      return (d.soldPartial
        ? `${p}.trading-sell-cargo: lot ${d.lotId} at ${d.settlement} — sold ${d.quantitySold} EP (${d.quantityRemaining} EP remaining) for ${bpToTriple(d.totalBp)}, wallet now ${bpToTriple(d.walletBalanceBp)}.`
        : `${p}.trading-sell-cargo: lot ${d.lotId} at ${d.settlement} sold for ${bpToTriple(d.totalBp)} — wallet now ${bpToTriple(d.walletBalanceBp)}.`)
        + (d.rumourApplied ? ` Rumour applied (x${d.rumourApplied.multiplier}).` : '')
        + (d.linkedDemandApplied ? ` Linked demand: ${d.linkedDemandApplied.reason} (x${d.linkedDemandApplied.multiplier}).` : '');
    case 'trading-delete-rumour':
      return `${p}.trading-delete-rumour: rumour ${d.rumourId} deleted.`;
    case 'trading-get-hold':
      return `${p}.trading-get-hold: ${d.count} lot(s), ${d.currentHoldEp}/${d.capacity} EP (capacity source: ${d.capacitySource}${d.connectedVehicleName ? `, vehicle "${d.connectedVehicleName}"` : ''}).`;
    case 'trading-list-vehicle-actors':
      return `${p}.trading-list-vehicle-actors: ${d.count} unconnected vehicle actor(s)${d.count ? ` — ${d.actors.map((a) => `${a.name} (${a.carriesMax} EP)`).join(', ')}` : ''}.`;
    case 'trading-connect-cargo-vehicle':
      return `${p}.trading-connect-cargo-vehicle: actor ${d.actorId} connected — carries.max ${d.carriesMax} EP.`;
    case 'trading-disconnect-cargo-vehicle':
      return `${p}.trading-disconnect-cargo-vehicle: vehicle disconnected — capacity reverted to the manual setting.`;
    case 'trading-list-gazetteers':
      return `${p}.trading-list-gazetteers: ${d.count} gazetteer(s), ${d.activeIds.length} active (${d.activeIds.join(', ') || 'none'}).`;
    case 'trading-import-gazetteer':
      return `${p}.trading-import-gazetteer: "${d.packId}" imported — ${d.settlementCount} settlement(s).`;
    case 'trading-configure-gazetteers':
      return `${p}.trading-configure-gazetteers: active now [${d.active.join(', ') || 'none'}].`;
    case 'trading-generate-merchant':
      return `${p}.trading-generate-merchant: ${d.type} of ${d.cargoType} — haggling skill ${d.hagglingSkill} (${d.skillDescription}).`;
    case 'trading-reveal-quality':
      return `${p}.trading-reveal-quality: lot ${d.lotId} (${d.cargoName}) revealed as ${d.revealedTier}${d.misreported ? ' (misreported — not the true tier)' : ''}.`;
    case 'trading-get-price-modifiers':
      return `${p}.trading-get-price-modifiers: global ${d.global}${Object.keys(d.perCargo).length ? `, ${Object.keys(d.perCargo).length} perCargo override(s)` : ''}.`;
    case 'trading-set-price-modifiers':
      return `${p}.trading-set-price-modifiers: global ${d.previous.global} → ${d.current.global}.`;
    case 'trading-migration-status':
      return d.alreadyMigrated
        ? `${p}.trading-migration-status: already migrated (from "${d.migratedFrom}").`
        : `${p}.trading-migration-status: seed-once migration ran — season ${d.seededSeason ?? 'n/a'}, ${d.seededHoldCount} hold lot(s), dial seeded ${d.seededDial}.`;
    case 'climate-get-state':
    case 'climate-set-state':
      return `${p}.${d.action} [economy ${d.economyId}]: ${d.label} (${d.state}) — price x${d.priceFactor}, income x${d.incomeFactor}, event shift ${d.eventShift >= 0 ? '+' : ''}${d.eventShift}; set ${d.updatedAt === null ? 'never' : new Date(d.updatedAt).toISOString()}.`;
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
        description: `Drive the Warhammer Economy module (wfrp4e-economy) — named bank economies with interest-bearing accounts, loans, an account-to-account transfer rail, a stock market with portfolios, property ownership/rent, and an immutable transaction ledger. Active state persists in registered world settings (economies / bankAccounts / transactionLogs and feature-specific stores — server-verifiable); banker assignments and stockPortfolios are retired. Wallet ops read/write the actor's WFRP4e money items (GC/SS/BP at 240/12/1 BP). Additive to /module-itempiles (physical loot) and /wfrp-status (weekly earnings).
Conditional: returns MODULE_NOT_ACTIVE when wfrp4e-economy is absent/inactive. Pre-flight: module-probe.is-active wfrp4e-economy. All amounts are integer Brass Pennies (BP).

CONFIRM-GATED (CCR-4): delete-economy (archives the economy and dependent active records before removal; transaction history is retained), delete-account (removes the account record; transaction history is kept), money-to-burn (unless dryRun:true), transfer >= 4800 BP (20 GC), resolve-investment, stash-withdraw (both can total-loss the holding on a bad roll), create-enterprise, enterprise-repay-debt, enterprise-upgrade, delete-enterprise, set-enterprise-owners, add-enterprise-debt, forgive-enterprise-debt, save-levy-group, delete-levy-group, create-venture, subscribe-venture, transfer-venture-parts, settle-venture, distribute-venture, toggle-venture-badge, issue-parts, set-venture-status, set-venture-standing, and run-economic-cycle (unless dryRun:true) require confirm:true. EXCLUDED (HC-v2-6 dialog-deadlock): advance-day, clearAllFinancialData, and every UI-open — not exposed. RETIRED: banker assignments (Phase 7g); list-bankers remains enum-compatible and returns an empty response marked retired. Also retired (Phase 7d): buy-stock / sell-stock / get-portfolio — the Venture Ledger replaces stock trading; calling any of the three returns a typed WFRP_ECONOMY_ACTION_RETIRED error naming the venture-ledger successors (enum literals stay for HC8 back-compat, but the action itself always fails now). BADGE-GATED (Phase 7d2, D7): subscribe-venture and transfer-venture-parts refuse with WFRP_ECONOMY_VENTURE_DISPUTED while the deed carries the Disputed badge; distribute-venture and settle-venture refuse with WFRP_ECONOMY_VENTURE_SEIZED while Seized. settle-venture also refuses with WFRP_ECONOMY_VENTURE_SETTLE_DELAYED while delayCycles > 0 (a fixed false-success bug, B2).

92 actions:
stand-up-an-economy: list-economies {} · get-economy { economyId } · list-bankers { economyId? } (retired compatibility read; always empty) · create-economy { name, currency?, currencySystem?, banks?, properties?, stocks? } · update-economy { economyId, name?, currency?, banks?, properties?, stocks? } · delete-economy { economyId, confirm }.
open-a-bank-account: create-account { economyId, bankId, actorId } · list-accounts { economyId?, actorId? }.
run-a-transaction: deposit { economyId, accountId, amountBp } · withdraw { economyId, accountId, amountBp } · transfer { economyId, sourceAccountId, destinationAccountId, amountBp, confirm? }.
loan-cycle: request-loan { economyId, accountId, amountBp, interestRate? } · repay-loan { economyId, accountId, amountBp }.
investment-cycle (RETIRED Phase 7d — the Venture Ledger replaces stock trading): buy-stock {} · sell-stock {} · get-portfolio {} — all three now IMMEDIATELY return WFRP_ECONOMY_ACTION_RETIRED naming create-venture/subscribe-venture/transfer-venture-parts/list-ventures as successors; no fields are read.
property-management: buy-property { economyId, accountId, propertyId } · sell-property { economyId, accountId, propertyId } (credits value × the GM-configurable propertySaleRate world setting, default 0.8) · set-rented { economyId, propertyId, rented }.
wallet-quick-adjust: get-wallet-balance { actorId, economyId? } · wallet-add { actorId, amountBp, economyId? } · wallet-remove { actorId, amountBp, economyId? }.
audit-the-ledger: list-transactions { actorId?, economyId?, type?, bankId?, source? } · actor-transaction-summary { actorId, economyId } · bank-transaction-summary { bankId, economyId }.
unified-ledger: record-transaction { actorId, amountBp, source, type, description, economyId?, bankId?, targetActorId?, currency? } — append an arbitrary ledger row (source: earn/trade/itempiles/levy/economy); use for skill/levy callers that write coins outside this module's own 9 tracked ops · delete-account { accountId, economyId?, confirm } — remove a stale/orphaned account record (does NOT cascade-delete ledger history).
levy-and-burn: apply-levies { actorIds?, target?, groupId?, levyIds?, excludeActorIds?, dryRun?, declared? } — cadence-gated levy tick (weekly cost-of-living is seeded built-in; monthly/per-travel/one-off levies apply only when named in levyIds). Roster resolution (Phase 7c, R7c.5): explicit actorIds always WINS (back-compat); otherwise groupId (or target:"party") resolves the roster engine-side via the SAME resolveTargets() the Levies tab's target select uses — groupId names a levyGroups entry, target:"party" resolves every player-owned character. Omitting ALL of actorIds/target/groupId (BUG-543 fix) resolves each levy's OWN embedded target per-levy: group-targeted levies charge their named group verbatim; party-scoped levies charge every player-owned character minus the levyExcludedActorIds world setting (the Levies tab's Party Roster checkboxes). Auto payment model: can-pay → pays; insufficient → declines (status modifier -1, no partial deduction; a paid-while-declined actor recovers +1, floored at 0). Charges exactly ONE elapsed week per call — call again to catch up further weeks; the response reports elapsedWeeks so a caller can loop. Character-only (npc/creature actors are refused — the source macro's uncascaded NPC writes were a bug, not RAW). dryRun:true previews with zero writes and no confirm required. declared:true (ADR-U3 extension) is a GM-declared apply — no elapsed-time gate, charges exactly once per call, and stamps state to the CURRENT levy index instead of walking elapsedWeeks forward. Delegates to the wfrp4e-economy fork's own levy engine — the SAME engine the Economy Manager's Levies tab buttons call · money-to-burn { actorIds?, target?, groupId?, dryRun?, confirm } — RAW Money-to-Burn: zeroes every unprotected carried money item's quantity at downtime's end (items are never deleted). Bank-account balances, recorded stashes, AND active endeavour investments (principal + accrued) are protected and survive. Same actorIds/target/groupId resolution as apply-levies (Q&A fold-in, Phase 7c). Requires confirm:true to execute; dryRun:true previews without confirm. Both actions render all amounts full-triple (e.g. "0gc 6ss 0bp", including the zero-case).
banking-and-income (RAW Banking/Income Between-Adventures Endeavours — Phase 5b, cycle semantics per ADR-U3): invest { actorId, rate(1-10), amountBp, economyId?, bankId? } — open an interest-bearing endeavour investment at a chosen/rolled rate (percent per economic cycle — a GM-declared abstract period, not a calendar month); debits the actor's wallet immediately. Returns { insufficientFunds: true, walletBalanceBp, requiredBp } and writes nothing when the wallet can't cover amountBp. Investments are a STANDALONE store (endeavourInvestments), NOT a bank-account field — bank accounts carry no per-account rate · resolve-investment { investmentId, d100Roll(1-100), confirm } — settle an investment: RAW d100Roll <= rate is a TOTAL LOSS (bankrupt, no payout); otherwise credits principal+accrued to the wallet and closes the investment. Pre-roll the d100 via dice-roll and pass the total — this action never rolls dice itself; a non-integer or out-of-1-100 roll returns { invalidRoll: true, d100Roll } with no write. confirm:true required (can total-loss). If the investment's owner actor has since been deleted, resolve-investment returns { ownerDeleted: true, principalBp, accruedBp } instead — a distinct non-error outcome (nothing was resolved; use the Banking tab's Remove Record control, GM-only, to untrack it — no MCP action exists for that, it is UI-only per D11) · list-investments { actorId?, activeOnly? } — read-only projection, each entry carries lastCycleAt (ISO, display-only) · stash-deposit { actorId, amountBp } — debit wallet into the RAW Stashing option (money-to-burn-protected, zero interest); same insufficientFunds guard as invest · stash-withdraw { actorId, d100Roll(1-100), confirm } — WHOLE-STASH withdrawal only (no partial); RAW d100Roll <= 10 is a total loss of the stash; confirm:true required; same invalidRoll guard as resolve-investment · accrue-interest { economyId?, dryRun? } — one MCP call covers THREE duties: (a) each active endeavour investment accrues at its own rate, (b) every bank account with balance > 0 at an interest-bearing bank accrues at the bank's rate, (c) accounts with an active loan get a reminder verdict (no coin moved). CYCLE SEMANTICS (ADR-U3): NOT gated on elapsed calendar time — every call accrues one abstract GM-declared cycle to every eligible entity; cycleApplied is always true and there is no "caught up" no-op state, so calling it twice in a row pays twice. lastCycleAt (ISO, display-only) is returned for UI display. dryRun:true previews with zero writes, no confirm required. Rental income and the venture pass (the module's other cycle duties) are covered by run-economic-cycle instead (below) — not by this action. TRAP: running the module's own "Run Economic Cycle" button AND this action for the same GM-declared cycle double-pays regular bank accounts and investments — pick one per world, per cycle · run-economic-cycle { economyId, dryRun?, cycleRolls?, confirm } — Phase 9 (D7 revisit): the FULL 6-duty economic cycle, delegating to the SAME fork engine export the Economy Manager's "Run Economic Cycle" button calls (identical engine path — kills the double-pay hazard by construction). Composes accrue-interest's three duties (investment/account interest, loan reminders) PLUS rental income (properties with rented:true credit their owner's linked bank account) PLUS the full venture pass (queued-transfer resolution, due distributions, standing decay, delay-tick, and — when the module's "roll events each cycle" setting is on — venture events). cycleRolls is a flat { [ventureId|offerId]: preRolledD100 } map forwarded verbatim into the venture pass (the engine is roll-free, D6 — supply one entry per venture drawing an event and per queued transfer offer resolving this pass, or that venture/offer is silently skipped/left queued). confirm:true required unless dryRun:true. IMPORTANT: dryRun:true previews ONLY the investment/account/loan/rental verdicts — the venture pass is skipped entirely on dryRun (never previewed) and ventureVerdicts is always empty in that case. TRAP (same as accrue-interest, shared engine): running this action AND the module's own "Run Economic Cycle" button for the same GM-declared cycle double-pays every duty — pick exactly one trigger per world per cycle. Supersedes accrue-interest for full-cycle use; accrue-interest remains for standalone duties a-c.

legitimate-business-enterprises (RAW Legitimate Business Enterprises, Archives III — Phase 6): list-enterprises { unconnectedActors? } — read-only projection over the 'enterprises' world setting; unconnectedActors:true additionally lists world archives3 enterprise actors with no instance record yet · get-enterprise { enterpriseId } — full record incl. incomeModifiers, eventTable, and debt { principalBp, escalationTier } · create-enterprise { presetKey?, profile?, backing, ownerActorId, actorId?, financedPortionBp?, confirm } — start a new enterprise from a built-in Archives III preset (presetKey) or a custom profile object; backing:"create" embeds a NEW wfrp4e-archives3 enterprise actor (requires wfrp4e-archives3 active — returns MODULE_NOT_ACTIVE otherwise), backing:"link" attaches an EXISTING archives3 actor (actorId required), backing:"data-only" keeps no actor at all. financedPortionBp is the BP a Creditor covers (becomes debt principal); the remainder debits the owner actor's wallet immediately. Invalid financing is refused with zero writes. confirm:true required · connect-enterprise-actor { actorId, ownerActorId? } — durable discover-and-connect for an existing archives3 enterprise actor not yet tracked; alreadyConnected:true is a success, not an error · enterprise-income { enterpriseId, rolledTotal, outcome } — pay one income roll's payout across every incomeModifiers source; pre-roll and pass rolledTotal/outcome, this action never rolls itself · enterprise-event { enterpriseId, d100Roll } — draw one event-table result (a custom override band first, then the linked Foundry table); pre-roll and pass d100Roll · enterprise-pay-interest { enterpriseId, declineToPay? } — pay the enterprise's upkeep as a Creditor interest payment, or declineToPay:true to skip (escalates the Creditor's escalationTier instead) · enterprise-repay-debt { enterpriseId, amountBp, confirm } — pay down at most the remaining debt.principal and report both appliedBp and unappliedBp; confirm:true required · enterprise-upgrade { enterpriseId, level, financedPortionBp?, confirm } — apply only the next sequential upgradePaths entry; invalid financing and skipped levels are refused with zero writes, and active Creditor debt remains RAW-blocked (upgradeBlocked). confirm:true required · delete-enterprise { enterpriseId, confirm } — UNTRACK an enterprise: removes the store instance only (the backing Actor is never deleted, no coin moves, an enterprise-delete ledger row is logged — RAW tie-in: use after a tier-3 Creditor seizure/destruction). confirm:true required. All ten delegate to the wfrp4e-economy fork's own headless enterprises engine (src/enterprises/enterprise-engine.js) except list-enterprises(default)/get-enterprise, which are pure reads.

enterprise-ownership-and-debt (Phase 7c, R7c.1/R7c.2 — widens the single ownerActorId scalar to weighted co-ownership + RAW Archives III Creditors debt ops): set-enterprise-owners { enterpriseId, ownerShares: [{ actorId, sharePct }], confirm } — replace the owners list; ownerShares' sharePct MUST sum to exactly 100 (integer percent) or the call is refused with zero writes ({ invalidShares: true, shareSum }). ownerActorId/ownerActorName in get-enterprise/list-enterprises responses are MAINTAINED as a deprecated alias = the largest-share owner (ties → first) — every existing single-owner caller keeps working unchanged. { ventureId } owner slots (lifted Phase 7d) let a venture hold an enterprise share — validated against the live ventures store (returns WFRP_ECONOMY_VENTURE_NOT_FOUND if the id doesn't exist); that slot's income/interest share routes to the venture's escrowBp instead of an actor wallet, never touches ownerActorId. confirm:true required · add-enterprise-debt { enterpriseId, amountBp, creditor?: { name?, notes? }, recipientActorId?, confirm } — RAW: a Creditor covers costs the characters can't; credits amountBp to ONE recipient actor (default = the primary/largest-share owner) and adds amountBp to debt.principal. Distinct ledger type (enterprise-add-debt) from enterprise-repay-debt. confirm:true required · forgive-enterprise-debt { enterpriseId, amountBp?, confirm } — reduces debt.principal by amountBp, or to ZERO when amountBp is omitted (forgive the entire remaining principal); zero wallet writes (forgiveness is the Creditor's grace, not a payment). Distinct ledger type (enterprise-debt-forgiven). confirm:true required · set-enterprise-income-sources { enterpriseId, incomeModifiers: [{ label, skill, tier, standing }] } — Phase 7e2, manager-primary: REPLACES the full incomeModifiers list (not a patch) and, when the enterprise is actor-backed, pushes the SAME list onto the archives3 actor's system.income.list so the Economy Manager and the actor sheet never drift (a fork updateActor hook mirrors the reverse direction — an actor-sheet edit — back into this instance automatically). No confirm gate (no coin moves, only a metadata list). Refused with WFRP_ECONOMY_INVALID_INCOME_SOURCES (zero writes) on a bad entry — tier must be one of b/s/g, standing an integer >= 1, label non-empty. All four delegate to enterprise-engine.js's setOwners/addDebt/forgiveDebt/setIncomeSources exports.

levy-groups (Phase 7c, R7c.4/R7c.5 — named actor rosters a levy's target/groupId can point at): list-levies {} — read-only projection over the levies world setting; each row carries type (tax/toll/due/tithe/custom/builtin — a UI/read-filter concern only, the engine never branches on it) · save-levy-group { groupId?, name, actorIds, confirm } — create (omit groupId) or rename/re-member (pass groupId) a named roster; confirm:true required · list-levy-groups {} — read-only projection over the levyGroups world setting · delete-levy-group { groupId, confirm } — remove a named roster (levies still targeting it resolve to an empty roster afterward — no cascade rewrite). confirm:true required. All four read/write the levyGroups world setting that apply-levies'/money-to-burn's groupId param resolves against.

venture-ledger (Phase 7d, extended Phase 7d2 — Venture Events v2, WFRP-native risk model): create-venture { name, type: expedition|partnership|project|concern, parts: { total, priceBp }, terms?: { managerActorId?, managerPortionPct? }, handledBy?, linkedEnterpriseId?, exposureTags?, confirm } — start a new deed; Expedition/Project self-liquidate on settle-venture, Partnership/Chartered-Concern are open-ended (distribute-venture repeatedly, or Wind Up via set-venture-status to reach Settling — GM-only, module UI). parts.total × parts.priceBp IS the deed's valuation (no separate valueBp field). confirm:true required · get-venture { ventureId } — full record incl. holders, queuedTransfers, badges, notices, deedDateText, and the sanitized handledBy link (Phase 7e D8) · list-ventures { type?, status?, bankId?, economyId? } — read-only projection; all filters optional, bankId/economyId together additionally restrict to deeds with a matching linked Registry entry (Phase 7e D8) · subscribe-venture { ventureId, actorId? | externalName?, partsCount, bankId?, economyId?, confirm } — buy Parts; coin flows into the deed's escrowBp (an actor is debited; an externalName subscriber's coin is narrative off-book). Refused ({ registryNotHandling: true }) unless the deed carries a handledBy[] entry with role:"registry" (or, when bankId/economyId are supplied, an entry matching that exact institution — Phase 7e D8); ALSO refused with WFRP_ECONOMY_VENTURE_DISPUTED while the deed carries the Disputed badge. confirm:true required · transfer-venture-parts { ventureId, sellerActorId? | sellerExternalName?, partsCount, askingPriceBp, confirm } — QUEUE a secondary-market sell offer; it does NOT resolve here — resolution (a standing- AND price-modified buyer roll, 7d2 §8b) happens only at the fork's own "Run Economic Cycle" button (module UI, not exposed via MCP this phase); the whole batch stays queued if the deed is Disputed. confirm:true required · settle-venture { ventureId, netBp?, confirm } — Expedition/Project always; Partnership/Chartered-Concern ONLY after a GM Wind Up (refused with { doesNotSettle: true } otherwise): credits netBp into escrow, then auto-distributes and marks the deed completed. Refused with WFRP_ECONOMY_VENTURE_SEIZED while Seized, or WFRP_ECONOMY_VENTURE_SETTLE_DELAYED while delayCycles > 0 (typed — previously false-succeeded, bug B2). confirm:true required · distribute-venture { ventureId, confirm } — drain the deed's current escrowBp to every holder by Parts-weighted split (a manager cut is taken first when terms.managerPortionPct is set); external holders' shares stay in escrow with a notice (no wallet to credit). Refused with WFRP_ECONOMY_VENTURE_SEIZED while Seized. confirm:true required · venture-event { ventureId, d100Roll } — draw one event band from the table matching the deed's CURRENT STATUS (Open/Funded/Underway/Settling each have their own table, 7d2 §3); pre-roll and pass the NATURAL d100 (this action never rolls itself — a natural 01/100 is a standing-gated critical, resolved before any band lookup). Response is additive: naturalRoll, modifiedRoll (standing-adjusted, clamped 2-99), standingModifier, critical ('boon'|'disaster'|null), effectsApplied (the effect field names this draw touched) alongside the existing text/standing. Refused with { noEventsForStatus: true, status } on a Completed/Defaulted deed · toggle-venture-badge { ventureId, badge: disputed|seized, confirm } — GM toggle for the two MANUAL badges (Delayed is derived from delayCycles and cannot be set here); Disputed gates subscribe/transfer-resolution, Seized freezes escrow. confirm:true required · issue-parts { ventureId, count, priceModPct?, confirm } — raises parts.total (dilution happens for free once the new Parts are subscribed — existing holders keep their absolute Parts, their SHARE falls only when new coin actually enters escrow); priceModPct optionally moves parts.priceBp in the same call. confirm:true required · set-venture-status { ventureId, status, confirm } — GM override of the deed's status (incl. the Wind Up idiom: move an open-ended deed to 'settling' so the Reckoning table applies and settle-venture becomes reachable). confirm:true required · set-venture-standing { ventureId, standing, confirm } — GM override of the deed's standing ladder position. confirm:true required. All twelve delegate to the wfrp4e-economy fork's own headless ventures engine (src/ventures/venture-engine.js) except get-venture/list-ventures, which are pure reads. NO delete-venture action (UI-only, GM-warned instead when a deed is Defaulted or Ruinous).

trading (Phase 7f — the ported trading-places engine, NATIVE to this module; ADDITIVE to the still-live module-trading-places umbrella, which stays untouched until Phase 7g retirement): trading-list-settlements { gazetteerId? } — settlements from the active gazetteer set (or one pack) · trading-list-cargo-types {} — the 20-cargo catalog · trading-get-season {} / trading-set-season { season?, clear? } — season is calendar-derived by default (simple-timekeeping); season sets a manual override, clear:true reverts to calendar-derived; every response echoes seasonSource (manual/calendar/fallback) · trading-check-availability { settlement, season?, rolls: [{cargoRoll,amountRoll}] } — runs the availability pipeline; rolls must cover at least the settlement's slotCount this season (over-supply is fine, extras ignored) — response's slotCount tells you how many were actually used · trading-calc-purchase-price { cargoName, quantity, quality?, season? } / trading-calc-sale-price { cargoName, quantity, settlement, quality?, season? } — pure price quotes with the GM dial applied; trading-calc-sale-price response is additive: linkedDemandApplied (the settlement's connected-economy sale bonus { multiplier, reason }, or null — a standing settlement-data condition re-evaluated fresh every call, NOT a one-time consumed rumour like trading-buy-cargo/trading-sell-cargo's rumourApplied) · trading-haggle-test { playerSkill, merchantSkill, playerRoll, merchantRoll, hasDealmakerTalent? } — BUG-534-fixed signed-degree comparison (a player success can never falsely tie a merchant failure) · trading-gossip-test { playerSkill, playerRoll, difficulty?, rumourD100Roll } — RAW Difficult (-10) default; Trade Rumour Table redesign (Change 1/2): rumourD100Roll (1-100, required, pre-rolled — this layer never rolls) selects the RAW 20-band d100 Trade Rumour Table row; on a successful Gossip Test this mints+stores that row's own rumour (a real write) and echoes it as rumourMinted { id, text, goods, effect: { kind, multiplier }, mintedAt } (null on a failed test) · trading-buy-cargo { actorId, cargoName, quantity, settlement, season?, quality?, secretQualityD10Roll?, originBonusSteps? } — REAL wallet debit + hold write; secretQualityD10Roll is the RAW secret wine/brandy quality roll (D12, GM-only — echoed in the response because the MCP caller IS the GM); refuses with zero writes on capacity overflow or insufficient funds; response is additive: rumourApplied (the auto-matched+consumed buyDiscount rumour's { id, text, multiplier }, or null — no rumourId param, the engine matches by cargo name itself) · trading-sell-cargo { actorId, lotId, settlement, isTradeSettlement, buyerRoll, halfCargoRetryRoll?, weeksElapsedSincePurchase?, topShelfBuyerRoll? } — runs the RAW sell-side demand gates (village/self-supply/not-where-bought/buyer-chance, in order) before crediting the wallet; a gate refusal is a typed WFRP_ECONOMY_TRADING_SALE_REFUSED naming the gate, zero writes; response is additive: rumourApplied (the auto-matched+consumed sellBonus rumour's { id, text, multiplier }, or null — no rumourId param, mirrors trading-buy-cargo), linkedDemandApplied (the settlement's connected-economy sale bonus { multiplier, reason }, or null — same standing settlement-data condition as trading-calc-sale-price, not consumed) · trading-delete-rumour { rumourId } — GM-only manual removal of a stored-but-unused rumour (also fires internally when trading-buy-cargo/trading-sell-cargo consume a matched rumour); refuses with WFRP_ECONOMY_TARGET_NOT_FOUND on an unknown id · trading-get-hold {} — the shared cargo hold (one hold, GM-tunable capacity); response is additive: capacitySource ('vehicle'|'manual') + connectedVehicleName (nullable) echo whether the effective capacity comes from a connected vehicle actor or the flat manual setting · trading-list-vehicle-actors {} — every world 'vehicle'-type actor NOT currently connected as the hold's capacity source, each with its system.status.carries.max · trading-connect-cargo-vehicle { actorId } — tie the hold's capacity to a real vehicle actor's carries.max instead of the flat tradingCargoCapacity setting; refuses with WFRP_ECONOMY_TARGET_NOT_FOUND if actorId isn't a vehicle-type actor · trading-disconnect-cargo-vehicle {} — revert the hold's capacity to the flat manual setting · trading-list-gazetteers {} — builtin + GM-imported packs with active/settlement-count · trading-import-gazetteer { pack } — validate + store a custom gazetteer pack JSON; fail-loud refusal on a malformed shape (no partial write) · trading-configure-gazetteers { activeIds } — set the active gazetteer set · trading-generate-merchant { settlement, cargoType, merchantType, percentileRoll } — D4 narrative-only merchant flavor (haggling skill + special behaviors); percentileRoll is REQUIRED here (the engine's own Math.random() UI-convenience fallback must never fire from MCP) · trading-reveal-quality { lotId, evaluateSuccess, sl, misreportDirection? } — reveals (or, on a failed Evaluate Test, misreports by ceil(|SL|/2) tiers) a hold lot's secret quality; refuses on a lot with no secret quality assigned · trading-get-price-modifiers {} / trading-set-price-modifiers { global?, perCargo?, reset? } — the NEW dial, under this module's OWN namespace (separate store from module-trading-places' dial; D2 seed-once migration copies the old value in ONCE) · trading-migration-status {} — idempotent manual trigger for the D2 seed-once migration (copies the old trading-places season/hold/capacity + dial into this module on first call; a second call returns alreadyMigrated:true with zero writes). All trading actions are DIALOG_FREE and ROLL-FREE — every stochastic call takes a caller pre-rolled total.

economic-climate (Phase 8; PER-ECONOMY): climate-get-state { economyId } — read ONE economy's climate; climate-set-state { economyId, state } — GM-only, sets one of 8 states FOR THAT ECONOMY ONLY (The Empire at war never touches Brettonia; unknown economyId refuses with zero writes): prosperity, bountiful-harvest, festival (positive), none (identity — restores that economy's baseline prices/income/events exactly), banditry, plague, war, siege (negative). Both actions echo the FULL resolved state entry (economyId, label, priceFactor, incomeFactor, eventShift, updatedAt), never a bare id. The climate factor is applied by the fork engine at exactly three seams, each reading its OWN economy's state — trading price quotes (priceFactor; the calc actions take an optional economyId, omitted = no climate factor), enterprise income payouts (incomeFactor; the enterprise's economy), and venture event roll shifts (eventShift, re-clamped 2-99; the deed's economy) — this action only changes which state is active; it never itself moves coin (no ledger row on set).

For create-economy, embed a stock to enable the buy/sell round-trip: stocks:[{ name, symbol, currentPrice, availableShares }] — historical stock DATA still round-trips through get-economy/create-economy (R7d.7, frozen), even though buy-stock/sell-stock/get-portfolio themselves are retired. Example: { action: "deposit", economyId: "abc", accountId: "def", amountBp: 240 }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: [...WFRP_ECONOMY_ACTIONS], description: 'Warhammer Economy action to perform.' },
            economyId: { type: 'string', description: 'Economy id — REQUIRED on most actions (the Phases 5-8 per-economy sweep: every list/ledger/levy/banking/venture action is economy-scoped; climate-get-state / climate-set-state are per-economy — The Empire\'s war never touches Brettonia). OPTIONAL only on trading-calc-purchase-price / trading-calc-sale-price (names which economy\'s climate factors the quote; omitted = no climate factor, identity) and the wallet ops (get-wallet-balance / wallet-add / wallet-remove, which read actor money items). list-ventures: required, acts as the economy filter. subscribe-venture: optional institution-context gate (Phase 7e D8) — when supplied it MUST be paired with bankId (both-or-neither; one-sided returns WFRP_ECONOMY_VENTURE_PARTIAL_CONTEXT, zero writes; both present requires a handledBy Registry entry matching the pair).' },
            bankId: { type: 'string', description: 'Bank id within the economy (create-account / bank-transaction-summary). list-ventures / subscribe-venture: optional institution-context filter/gate (Phase 7e D8) — MUST be paired with economyId (both-or-neither; one-sided → WFRP_ECONOMY_VENTURE_PARTIAL_CONTEXT); when both supplied, requires one handledBy Registry entry matching both.' },
            accountId: { type: 'string', description: 'Bank account id (deposit / withdraw / loan / stock / property / delete-account).' },
            sourceAccountId: { type: 'string', description: 'transfer: source bank account id.' },
            destinationAccountId: { type: 'string', description: 'transfer: destination bank account id.' },
            actorId: { type: 'string', description: 'Actor id (create-account / wallet ops / get-portfolio / summaries / list filter / record-transaction / invest / list-investments / stash-deposit / stash-withdraw / connect-enterprise-actor (required) / create-enterprise (only when backing:"link") / trading-connect-cargo-vehicle (required, must be a vehicle-type actor)).' },
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
            confirm: { type: 'boolean', description: 'delete-economy / delete-account / large transfer / money-to-burn (unless dryRun:true) / resolve-investment / stash-withdraw / create-enterprise / enterprise-repay-debt / enterprise-upgrade / delete-enterprise / set-enterprise-owners / add-enterprise-debt / forgive-enterprise-debt / save-levy-group / delete-levy-group / run-economic-cycle (unless dryRun:true): must be true to execute the gated op.' },
            actorIds: { type: 'array', items: { type: 'string' }, description: 'apply-levies / money-to-burn: actor ids to process — wins over target/groupId when provided (back-compat). save-levy-group (required): the group\'s member actor ids.' },
            levyIds: { type: 'array', items: { type: 'string' }, description: 'apply-levies: optional explicit levy ids to apply (omit = all cadence-eligible levies, e.g. the weekly cost-of-living levy).' },
            excludeActorIds: { type: 'array', items: { type: 'string' }, description: 'apply-levies: optional actor ids to skip this run.' },
            dryRun: { type: 'boolean', description: 'apply-levies / money-to-burn: preview the outcome with zero writes; does not require confirm. accrue-interest: same, and also skipped when dryRun is set (no confirm required either way). run-economic-cycle: same, but previews ONLY investment/account/loan/rental verdicts — the venture pass never previews (always skipped on dryRun).' },
            target: { type: 'string', enum: ['party'], description: 'apply-levies / money-to-burn: "party" resolves every player-owned character (the default when neither target nor groupId nor actorIds is given). Ignored when actorIds is provided.' },
            groupId: { type: 'string', description: 'apply-levies / money-to-burn: id of a levyGroups entry to target (resolveTargets(), Phase 7c). save-levy-group: omit to create a new group, pass to rename/re-member an existing one. delete-levy-group (required): the group to remove.' },
            ownerShares: { type: 'array', items: { type: 'object', additionalProperties: true, properties: { actorId: { type: 'string' }, ventureId: { type: 'string' }, sharePct: { type: 'number' } }, required: ['sharePct'] }, description: 'set-enterprise-owners (required): the new owners list — [{ actorId, sharePct }] or [{ ventureId, sharePct }] (Phase 7d: a venture-held slot), sharePct integers MUST sum to exactly 100.' },
            creditor: { type: 'object', additionalProperties: false, properties: { name: { type: 'string' }, notes: { type: 'string' } }, description: 'create-enterprise / enterprise-upgrade / add-enterprise-debt: Creditor identity (RAW Archives III) — { name?, notes? }.' },
            recipientActorId: { type: 'string', description: 'add-enterprise-debt: which owner actor receives the Creditor\'s BP (omit = the primary/largest-share owner).' },
            investmentId: { type: 'string', description: 'Endeavour investment id (resolve-investment).' },
            rate: { type: 'number', description: 'invest (required): interest rate as an integer percent 1-10 per economic cycle (RAW Banking endeavour — roll 1d10 or GM-picked).' },
            d100Roll: { type: 'number', description: 'resolve-investment / stash-withdraw / enterprise-event / venture-event (required): pre-rolled d100 total (1-100). resolve-investment: <= rate is bankruptcy. stash-withdraw: <= 10 loses the whole stash. enterprise-event: looks up the matching event-table band. venture-event: the NATURAL roll (WFRP-native, unmodified) — a natural 01/100 is always a critical regardless of standing; otherwise standing-modified before the band lookup. This action never rolls dice itself.' },
            declared: { type: 'boolean', description: 'apply-levies: ADR-U3 extension — GM-declared apply (no elapsed-time gate, charges exactly once per call, stamps state to the CURRENT levy index instead of walking elapsedWeeks forward).' },
            enterpriseId: { type: 'string', description: 'Enterprise instance id (get-enterprise / enterprise-income / enterprise-event / enterprise-pay-interest / enterprise-repay-debt / enterprise-upgrade / delete-enterprise / set-enterprise-owners / add-enterprise-debt / forgive-enterprise-debt / set-enterprise-income-sources).' },
            incomeModifiers: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { label: { type: 'string' }, skill: { type: 'string' }, tier: { type: 'string', enum: ['b', 's', 'g'] }, standing: { type: 'number' } }, required: ['label', 'skill', 'tier', 'standing'] }, description: 'set-enterprise-income-sources (required): the new FULL income-sources list — [{ label, skill, tier: "b"|"s"|"g", standing }], replacing (not patching) the enterprise\'s current list.' },
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
            handledBy: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { role: { type: 'string' }, name: { type: 'string' }, bankId: { type: 'string' }, economyId: { type: 'string' } }, required: ['role'] }, description: 'create-venture: [{ role, name?, bankId?, economyId? }] — subscribe-venture is refused unless this array carries an entry with role:"registry". bankId/economyId must both be present (a real institution link, Phase 7e D8) or both absent (Phase 7d generic/unassigned entry).' },
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
            gazetteerId: { type: 'string', description: 'trading-list-settlements: optional filter to one active gazetteer pack (omit = every active pack).' },
            season: { type: 'string', enum: ['spring', 'summer', 'autumn', 'winter'], description: 'trading-check-availability / trading-calc-purchase-price / trading-calc-sale-price: override season (omit = calendar-derived). trading-set-season: the manual override to set (mutually exclusive with clear:true).' },
            clear: { type: 'boolean', description: 'trading-set-season: true clears the manual override, reverting to calendar-derived (mutually exclusive with season).' },
            settlement: { type: 'string', description: 'Settlement name (trading-check-availability / trading-calc-sale-price / trading-buy-cargo / trading-sell-cargo / trading-generate-merchant, all required).' },
            rolls: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { cargoRoll: { type: 'number' }, amountRoll: { type: 'number' } }, required: ['cargoRoll', 'amountRoll'] }, description: 'trading-check-availability (required): one pre-rolled {cargoRoll(1-100), amountRoll(1-100)} pair per availability-pipeline slot — over-supply is fine (extras beyond slotCount are ignored); under-supply refuses with the required count named.' },
            cycleRolls: { type: 'object', additionalProperties: { type: 'number' }, description: 'run-economic-cycle: flat { [ventureId|offerId]: preRolledD100 } map forwarded verbatim into the venture pass (the engine is roll-free, D6) — supply one entry per venture drawing an event and per queued transfer offer resolving this pass, or that venture/offer is silently skipped/left queued. Distinct from `rolls` (trading-check-availability\'s differently-shaped array) to avoid a flattened-schema collision.' },
            cargoName: { type: 'string', description: 'Cargo catalog name (trading-calc-purchase-price / trading-calc-sale-price / trading-buy-cargo, all required).' },
            quality: { type: 'string', enum: ['poor', 'average', 'good', 'excellent'], description: 'trading-calc-purchase-price / trading-calc-sale-price / trading-buy-cargo: quality tier (Wine/Brandy only — the general 4-tier system, distinct from the secret d10 quality below).' },
            playerSkill: { type: 'number', description: 'trading-haggle-test / trading-gossip-test (both required): the player\'s Haggle/Gossip skill target number.' },
            merchantSkill: { type: 'number', description: 'trading-haggle-test (required): the merchant\'s Haggle skill target number.' },
            playerRoll: { type: 'number', description: 'trading-haggle-test / trading-gossip-test (both required): pre-rolled 1d100 total for the player\'s test.' },
            merchantRoll: { type: 'number', description: 'trading-haggle-test (required): pre-rolled 1d100 total for the merchant\'s test.' },
            hasDealmakerTalent: { type: 'boolean', description: 'trading-haggle-test: applies the Dealmaker talent\'s doubled haggle effect.' },
            difficulty: { type: 'number', description: 'trading-gossip-test: modifier applied to playerSkill (RAW default -10, Difficult).' },
            secretQualityD10Roll: { type: 'number', description: 'trading-buy-cargo: pre-rolled 1d10 for the RAW secret wine/brandy quality tier (D12) — required by RAW for Wine/Brandy lots, omit for other cargo.' },
            originBonusSteps: { type: 'number', description: 'trading-buy-cargo: Kemperbad-class settlement origin bonus applied to the secret quality tier (+2 steps, clamped, RAW).' },
            lotId: { type: 'string', description: 'A cargo hold lot id (trading-sell-cargo / trading-reveal-quality, both required).' },
            isTradeSettlement: { type: 'boolean', description: 'trading-sell-cargo (required): whether the selling settlement carries the Trade flag (raises buyer-chance and enables fire-sale).' },
            buyerRoll: { type: 'number', description: 'trading-sell-cargo (required): pre-rolled 1d100 for the RAW buyer-chance demand gate.' },
            halfCargoRetryRoll: { type: 'number', description: 'trading-sell-cargo: pre-rolled 1d100 retry roll, consumed only if buyerRoll fails the first buyer-chance gate (offers half the lot).' },
            weeksElapsedSincePurchase: { type: 'number', description: 'trading-sell-cargo: weeks since the lot was bought, for the not-where-bought gate (default 1 — assumes travel).' },
            rumourId: { type: 'string', description: 'trading-delete-rumour (required): a stored tradingRumours entry id to remove manually (GM-only). NOT a param on trading-buy-cargo/trading-sell-cargo anymore — those auto-match a stored rumour by cargo name instead.' },
            rumourD100Roll: { type: 'number', description: 'trading-gossip-test (required): pre-rolled 1d100 (1-100) selecting the RAW 20-band Trade Rumour Table row; consumed only when the Gossip Test succeeds (this action never rolls dice itself).' },
            topShelfBuyerRoll: { type: 'number', description: 'trading-sell-cargo: pre-rolled 1d10, consumed only for the Top Shelf Wine/Brandy self-supply exception (RAW — a settlement that Produces the cargo still finds a buyer for Top Shelf quality).' },
            pack: { type: 'object', additionalProperties: true, description: 'trading-import-gazetteer (required): a raw gazetteer pack JSON { packId, label, settlements: [{name,size,wealth,...}], flagEffects? } — validated fail-loud, no partial write on a malformed shape.' },
            activeIds: { type: 'array', items: { type: 'string' }, description: 'trading-configure-gazetteers (required): the full new set of active gazetteer pack ids (builtin + imported).' },
            cargoType: { type: 'string', description: 'trading-generate-merchant (required): the cargo type this narrative merchant deals in.' },
            merchantType: { type: 'string', enum: ['producer', 'seeker'], description: 'trading-generate-merchant (required): whether the merchant produces (sells) or seeks (buys) the cargoType.' },
            percentileRoll: { type: 'number', description: 'trading-generate-merchant (required): pre-rolled 0-100 for the merchant\'s haggling-skill generation — required so the engine\'s own Math.random() UI-convenience fallback never fires from MCP.' },
            evaluateSuccess: { type: 'boolean', description: 'trading-reveal-quality (required): whether the buyer\'s Evaluate Test succeeded.' },
            sl: { type: 'number', description: 'trading-reveal-quality (required): the Evaluate Test\'s Success Level (any sign; only the magnitude sets the misreport offset on failure).' },
            misreportDirection: { type: 'number', enum: [1, -1], description: 'trading-reveal-quality: on a failed Evaluate Test, whether the misreported tier skews better (1, default) or worse (-1) than the true tier.' },
            global: { type: 'number', description: 'trading-set-price-modifiers: the global price-dial multiplier (> 0, 1 = neutral).' },
            perCargo: { type: 'object', additionalProperties: { type: 'number' }, description: 'trading-set-price-modifiers: per-cargo-name price-dial multiplier overrides, merged onto (not replacing) the existing perCargo map.' },
            reset: { type: 'boolean', description: 'trading-set-price-modifiers: true restores {global:1, perCargo:{}}, ignoring global/perCargo.' },
            state: { type: 'string', enum: ['prosperity', 'bountiful-harvest', 'festival', 'none', 'banditry', 'plague', 'war', 'siege'], description: 'climate-set-state (required, GM-only): the economic-climate state to activate FOR THE economyId GIVEN (per-economy — other economies keep their own climate). "none" restores that economy to exact baseline (identity — no price/income/event modification).' },
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
