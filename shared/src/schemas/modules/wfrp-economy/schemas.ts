// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v2 Phase 6 — Zod schema (promoted to @foundry-mcp/shared, ADR-020) for module-wfrp-economy
// (Warhammer Economy, wfrp4e-economy v1.0.0).
//
// CCR-5: module-specific schemas are promoted to @foundry-mcp/shared (ADR-020, Phase C2). `.strict()` on
// every top-level action variant rejects unknown keys. Per carry-forward §4 every variant is a plain
// `.strict()` ZodObject (NO `.refine`/`.transform` — a ZodEffects breaks the discriminatedUnion);
// cross-field rules (confirm-gate, large-transfer threshold, target resolution) live in the handler.
//
// 64 actions across 14 idioms (capability_audit/wfrp4e-economy.md + phase6_pre_plan.md §Action surface;
// record-transaction + delete-account added Phase 2, wfrp_economy_system_v1_prd.md §10; apply-levies +
// money-to-burn added Phase 4, same PRD §10; invest/resolve-investment/list-investments/stash-deposit/
// stash-withdraw/accrue-interest added Phase 5, same PRD §10; list-enterprises/get-enterprise/
// create-enterprise/connect-enterprise-actor/enterprise-income/enterprise-event/enterprise-pay-interest/
// enterprise-repay-debt/enterprise-upgrade added Phase 6, same PRD §10; set-enterprise-owners/
// add-enterprise-debt/forgive-enterprise-debt/list-levies/save-levy-group/list-levy-groups/
// delete-levy-group added Phase 7c (§10 same PRD) — HC8-compliant, action count grows, tool count
// stays 1):
//   stand-up-an-economy (6): list-economies / get-economy / list-bankers / create-economy /
//     update-economy / delete-economy
//   open-a-bank-account (2): create-account / list-accounts
//   run-a-transaction (3): deposit / withdraw / transfer
//   loan-cycle (2): request-loan / repay-loan
//   investment-cycle (3, RETIRED Phase 7d — D2): buy-stock / sell-stock / get-portfolio — enum literals
//     preserved (HC8), variants relaxed to action-only; the dispatcher short-circuits to
//     WFRP_ECONOMY_ACTION_RETIRED naming the venture-ledger successors below.
//   property-management (3): buy-property / sell-property / set-rented
//   wallet-quick-adjust (3): get-wallet-balance / wallet-add / wallet-remove
//   audit-the-ledger (3): list-transactions / actor-transaction-summary / bank-transaction-summary
//   unified-ledger (2): record-transaction / delete-account
//   levy-and-burn (2): apply-levies / money-to-burn — DELEGATE to the wfrp4e-economy fork's own
//     src/levies/levy-engine.js (headless, dialog-free); the same engine powers the Economy Manager's
//     Levies tab buttons. Character-only (npc/creature refuse — engine-side guard).
//   banking-and-income (6): invest / resolve-investment / list-investments / stash-deposit /
//     stash-withdraw / accrue-interest — DELEGATE to the wfrp4e-economy fork's own
//     src/banking/banking-engine.js (headless, dialog-free), Phase 5 of wfrp_economy_system_v1_prd.md §10.
//     Investments are a standalone `endeavourInvestments` world setting (accounts carry no per-account
//     rate); rolls (rate/d100) are pre-computed by the caller and passed in, never rolled by this layer.
//   legitimate-business-enterprises (10): list-enterprises / get-enterprise / create-enterprise /
//     connect-enterprise-actor / enterprise-income / enterprise-event / enterprise-pay-interest /
//     enterprise-repay-debt / enterprise-upgrade / delete-enterprise — DELEGATE to the wfrp4e-economy
//     fork's own src/enterprises/enterprise-engine.js (headless, roll-free/dialog-free), Phase 6 of
//     wfrp_economy_system_v1_prd.md §10. Enterprises live in a standalone `enterprises` world setting
//     ({ profiles, instances }); list-enterprises(default)/get-enterprise are pure reads over that
//     store (NOT engine delegations). backing is 'create' (embeds an archives3 enterprise actor, gated
//     on wfrp4e-archives3) | 'link' (an existing archives3 actor) | 'data-only' (no actor). Rolls
//     (rolledTotal/d100Roll) are pre-computed by the caller, never rolled by this layer.
//   enterprise-ownership-and-debt (3, Phase 7c): set-enterprise-owners / add-enterprise-debt /
//     forgive-enterprise-debt — DELEGATE to the same enterprise-engine.js (setOwners/addDebt/
//     forgiveDebt exports). owners[] widens the single ownerActorId scalar to weighted shares;
//     ownerActorId stays as a deprecated alias (= largest-share owner). RAW Archives III Creditors
//     debt model: principal never auto-derives a tier, escalation derives from missed payments.
//   levy-groups (4, Phase 7c): list-levies / save-levy-group / list-levy-groups / delete-levy-group —
//     list-levies is a pure read over the `levies` world setting; the group actions DELEGATE to the
//     `levyGroups` world setting (named actor rosters a levy's `target`/`groupId` can point at,
//     resolved engine-side by levy-engine.js's resolveTargets()).
//   venture-ledger (8, Phase 7d): create-venture / get-venture / list-ventures / subscribe-venture /
//     transfer-venture-parts / settle-venture / distribute-venture / venture-event — DELEGATE to the
//     wfrp4e-economy fork's own headless ventures engine (src/ventures/venture-engine.js). Deeds are a
//     standalone `ventures` world setting ({instances}); a deed carries Parts (total/subscribed/priceBp),
//     holders[] (actorId or externalName), an escrowBp coin pool, a status/standing pair, and
//     queuedTransfers[]. transfer-venture-parts QUEUES an offer — resolution happens only at the fork's
//     Run Economic Cycle button, never instantly. get-venture/list-ventures are pure reads.
//
// All monetary amounts are integer Brass Pennies (BP); 1 GC = 240 BP, 1 SS = 12 BP.
//
// Source of truth: .agents/research/module_integration/phase6_pre_plan.md +
// capability_audit/wfrp4e-economy.md (§Capability Inventory, §Money/Price Data Model, §Write Verifiability).

import { z } from 'zod';
import { ActorId } from '../../branded-ids.js';

const economyId = z.string().min(1); // BRANDED-ID-EXEMPT:economyId — module-internal id, not a Foundry document id
const bankId = z.string().min(1); // BRANDED-ID-EXEMPT:bankId — module-internal id, not a Foundry document id
const accountId = z.string().min(1); // BRANDED-ID-EXEMPT:accountId — module-internal id, not a Foundry document id
const sourceAccountId = z.string().min(1); // BRANDED-ID-EXEMPT:sourceAccountId — module-internal id, not a Foundry document id
const destinationAccountId = z.string().min(1); // BRANDED-ID-EXEMPT:destinationAccountId — module-internal id, not a Foundry document id
const propertyId = z.string().min(1); // BRANDED-ID-EXEMPT:propertyId — module-internal id, not a Foundry document id
const investmentId = z.string().min(1); // BRANDED-ID-EXEMPT:investmentId — module-internal id, not a Foundry document id
const enterpriseId = z.string().min(1); // BRANDED-ID-EXEMPT:enterpriseId — module-internal id (actor UUID when actor-backed, generated id when data-only)
const levyGroupId = z.string().min(1); // BRANDED-ID-EXEMPT:levyGroupId — module-internal id (levyGroups setting entry), not a Foundry document id
const ventureId = z.string().min(1); // BRANDED-ID-EXEMPT:ventureId — module-internal id (venture-engine.js randomID), not a Foundry document id

const amountBp = z.number().int().positive(); // integer Brass Pennies, > 0
const financedPortionBp = z.number().int().nonnegative(); // BP covered by a Creditor (becomes/adds to debt.principal)

// Phase 7c: RAW Archives III Creditors identity — name/notes, both optional (blank until a GM sets them).
const creditorInput = z.object({ name: z.string().optional(), notes: z.string().optional() }).strict();
// Phase 7c: weighted ownership share — integer percent; the handler asserts Σ(sharePct) === 100.
// Phase 7d: a slot may target a venture's escrow instead of an actor's wallet (ventureId variant) —
// the lifted ventureId-slot rejection (D2/task 1.7); a venture can never hold another venture (D19,
// enforced venture-side).
const ownerShareInput = z.union([
  z.object({ actorId: ActorId, sharePct: z.number().int().min(0).max(100) }).strict(),
  z.object({ ventureId: ventureId, sharePct: z.number().int().min(0).max(100) }).strict(),
]);

// Phase 7d: venture deed type enum (fixed 4-value, venture-types.js VENTURE_TYPES — D1, no `profiles` bucket).
const ventureType = z.enum(['expedition', 'partnership', 'project', 'concern']);
const ventureStatus = z.enum(['open', 'funded', 'underway', 'settling', 'completed', 'defaulted']);
// Phase 7d2: 6-band standing ladder (venture-types.js VENTURE_STANDINGS).
const ventureStanding = z.enum(['celebrated', 'esteemed', 'reputable', 'uncertain', 'troubled', 'ruinous']);
// Phase 7d2 (D8): only Disputed/Seized are MANUALLY toggleable — Delayed is DERIVED from delayCycles and
// cannot be set via this action (venture-form.js's badgeToggles carries the same restriction).
const ventureToggleableBadge = z.enum(['disputed', 'seized']);

// Loose embedded-document arrays for economy create/update. The module owns the canonical shape; the
// handler fills missing ids with foundry.utils.randomID. NOT `.strict()` (nested inside a strict variant).
const bankObj = z.record(z.unknown());
const propertyObj = z.record(z.unknown());
const stockObj = z.record(z.unknown());

export const WfrpEconomyInput = z.discriminatedUnion('action', [
  // ── stand-up-an-economy idiom ───────────────────────────────────────────────────
  z.object({ action: z.literal('list-economies') }).strict(),
  z.object({ action: z.literal('get-economy'), economyId: economyId }).strict(),
  z.object({ action: z.literal('list-bankers'), economyId: economyId.optional() }).strict(),
  z
    .object({
      action: z.literal('create-economy'),
      name: z.string().min(1),
      currency: z.string().min(1).optional(), // display name, e.g. "Gold Crowns"
      currencySystem: z.string().min(1).optional(), // 'triCurrency' for WFRP4e (default)
      banks: z.array(bankObj).optional(),
      properties: z.array(propertyObj).optional(),
      stocks: z.array(stockObj).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('update-economy'),
      economyId: economyId,
      name: z.string().min(1).optional(),
      currency: z.string().min(1).optional(),
      currencySystem: z.string().min(1).optional(),
      banks: z.array(bankObj).optional(),
      properties: z.array(propertyObj).optional(),
      stocks: z.array(stockObj).optional(),
    })
    .strict(),
  z
    .object({ action: z.literal('delete-economy'), economyId: economyId, confirm: z.boolean().optional() })
    .strict(),

  // ── open-a-bank-account idiom ───────────────────────────────────────────────────
  z
    .object({ action: z.literal('create-account'), economyId: economyId, bankId: bankId, actorId: ActorId })
    .strict(),
  z
    .object({ action: z.literal('list-accounts'), economyId: economyId.optional(), actorId: ActorId.optional() })
    .strict(),

  // ── run-a-transaction idiom ─────────────────────────────────────────────────────
  z.object({ action: z.literal('deposit'), economyId: economyId, accountId: accountId, amountBp }).strict(),
  z.object({ action: z.literal('withdraw'), economyId: economyId, accountId: accountId, amountBp }).strict(),
  z
    .object({
      action: z.literal('transfer'),
      economyId: economyId,
      sourceAccountId: sourceAccountId,
      destinationAccountId: destinationAccountId,
      amountBp,
      confirm: z.boolean().optional(), // required when amountBp >= LARGE_TRANSFER_THRESHOLD
    })
    .strict(),

  // ── loan-cycle idiom ────────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('request-loan'),
      economyId: economyId,
      accountId: accountId,
      amountBp,
      interestRate: z.number().nonnegative().optional(), // percent; defaults to the bank's loanRate
    })
    .strict(),
  z.object({ action: z.literal('repay-loan'), economyId: economyId, accountId: accountId, amountBp }).strict(),

  // ── investment-cycle idiom — RETIRED Phase 7d (D2), variants relaxed to action-only ────────────
  // The Venture Ledger (venture-ledger idiom below) replaces stock trading. Enum literals are PRESERVED
  // (HC8-as-amended: enum VALUES are never removed) so the dispatcher's typed retirement short-circuit
  // is reachable with minimal input; the old required fields (economyId/accountId/stockId/quantity) are
  // dropped from these 3 variants — first typed action retirement in the codebase (memo §MCP, grep = 0
  // precedent).
  z.object({ action: z.literal('buy-stock') }).strict(),
  z.object({ action: z.literal('sell-stock') }).strict(),
  z.object({ action: z.literal('get-portfolio') }).strict(),

  // ── property-management idiom ───────────────────────────────────────────────────
  z
    .object({ action: z.literal('buy-property'), economyId: economyId, accountId: accountId, propertyId: propertyId })
    .strict(),
  z
    .object({ action: z.literal('sell-property'), economyId: economyId, accountId: accountId, propertyId: propertyId })
    .strict(),
  z
    .object({ action: z.literal('set-rented'), economyId: economyId, propertyId: propertyId, rented: z.boolean() })
    .strict(),

  // ── wallet-quick-adjust idiom (economyId ignored in WFRP4e mode — reads actor money items) ──
  z.object({ action: z.literal('get-wallet-balance'), actorId: ActorId, economyId: economyId.optional() }).strict(),
  z.object({ action: z.literal('wallet-add'), actorId: ActorId, amountBp, economyId: economyId.optional() }).strict(),
  z.object({ action: z.literal('wallet-remove'), actorId: ActorId, amountBp, economyId: economyId.optional() }).strict(),

  // ── audit-the-ledger idiom ──────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('list-transactions'),
      actorId: ActorId.optional(),
      economyId: economyId.optional(),
      type: z.string().min(1).optional(),
      bankId: bankId.optional(),
      source: z.string().min(1).optional(),
    })
    .strict(),
  z.object({ action: z.literal('actor-transaction-summary'), actorId: ActorId, economyId: economyId }).strict(),
  z.object({ action: z.literal('bank-transaction-summary'), bankId: bankId, economyId: economyId }).strict(),

  // ── unified-ledger idiom (Phase 2, wfrp_economy_system) ─────────────────────────
  z
    .object({
      action: z.literal('record-transaction'),
      actorId: ActorId,
      amountBp,
      source: z.enum(['earn', 'trade', 'itempiles', 'levy', 'economy']),
      type: z.string().min(1),
      description: z.string().min(1),
      economyId: economyId.optional(),
      bankId: bankId.optional(),
      targetActorId: ActorId.optional(),
      currency: z.string().min(1).optional(),
    })
    .strict(),
  z
    .object({ action: z.literal('delete-account'), accountId: accountId, economyId: economyId.optional(), confirm: z.boolean().optional() })
    .strict(),

  // ── levy-and-burn idiom (Phase 4, wfrp_economy_system; groupId/target additive Phase 7c) ────
  z
    .object({
      action: z.literal('apply-levies'),
      // Phase 7c (R7c.5): actorIds is now OPTIONAL — when omitted, the engine's resolveTargets()
      // resolves `target`/`groupId` instead (explicit actorIds still WINS when provided, back-compat).
      actorIds: z.array(ActorId).min(1).optional(),
      target: z.enum(['party']).optional(), // 'party' is the only literal target; group targeting goes via groupId
      groupId: levyGroupId.optional(),
      levyIds: z.array(z.string().min(1)).optional(), // omit = all cadence-eligible levies (e.g. weekly cost-of-living)
      excludeActorIds: z.array(ActorId).optional(),
      dryRun: z.boolean().optional(), // preview only, zero writes — no confirm required
      // ADR-U3 extension: GM-declared apply — no elapsed-time gate, charges exactly once per call, and
      // stamps state to the CURRENT levy index rather than walking elapsedWeeks forward.
      declared: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('money-to-burn'),
      // Phase 7c (Q&A fold-in): actorIds is now OPTIONAL, same resolveTargets()/groupId back-compat
      // contract as apply-levies above.
      actorIds: z.array(ActorId).min(1).optional(),
      target: z.enum(['party']).optional(),
      groupId: levyGroupId.optional(),
      dryRun: z.boolean().optional(), // preview only, zero writes — no confirm required
      confirm: z.boolean().optional(), // required to execute (dryRun:false/undefined) — mirrors delete-economy
    })
    .strict(),

  // ── levy-groups idiom (Phase 7c, R7c.4/R7c.5) ───────────────────────────────────
  // list-levies is a pure read over the `levies` world setting (not an engine delegation — mirrors
  // list-enterprises/get-enterprise's read-only precedent).
  z.object({ action: z.literal('list-levies') }).strict(),
  z
    .object({
      action: z.literal('save-levy-group'),
      groupId: levyGroupId.optional(), // omit = create new
      name: z.string().min(1),
      actorIds: z.array(ActorId).min(1),
      confirm: z.boolean().optional(),
    })
    .strict(),
  z.object({ action: z.literal('list-levy-groups') }).strict(),
  z
    .object({ action: z.literal('delete-levy-group'), groupId: levyGroupId, confirm: z.boolean().optional() })
    .strict(),

  // ── banking-and-income idiom (Phase 5, wfrp_economy_system) ─────────────────────
  z
    .object({
      action: z.literal('invest'),
      actorId: ActorId,
      rate: z.number().int().min(1).max(10), // RAW Banking endeavour interest rate, percent per elapsed Imperial month
      amountBp,
      economyId: economyId.optional(), // omit = a stash-like "reputable institution" abstraction (world-global rows)
      bankId: bankId.optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('resolve-investment'),
      investmentId: investmentId,
      d100Roll: z.number().int().min(1).max(100), // pre-rolled by the caller; <= rate = RAW bankruptcy (total loss)
      confirm: z.boolean().optional(), // required — can total-loss the investment
    })
    .strict(),
  z
    .object({ action: z.literal('list-investments'), actorId: ActorId.optional(), activeOnly: z.boolean().optional() })
    .strict(),
  z.object({ action: z.literal('stash-deposit'), actorId: ActorId, amountBp }).strict(),
  z
    .object({
      action: z.literal('stash-withdraw'),
      actorId: ActorId,
      d100Roll: z.number().int().min(1).max(100), // pre-rolled by the caller; <= 10 = RAW total stash loss
      confirm: z.boolean().optional(), // required — whole-stash withdrawal, can total-loss
    })
    .strict(),
  z
    .object({
      action: z.literal('accrue-interest'),
      economyId: economyId.optional(), // omit = process all economies' bank accounts + every endeavour investment
      dryRun: z.boolean().optional(), // preview only, zero writes — no confirm required
    })
    .strict(),

  // ── legitimate-business-enterprises idiom (Phase 6, wfrp_economy_system) ───────
  z
    .object({ action: z.literal('list-enterprises'), unconnectedActors: z.boolean().optional() })
    .strict(),
  z.object({ action: z.literal('get-enterprise'), enterpriseId }).strict(),
  z
    .object({
      action: z.literal('create-enterprise'),
      presetKey: z.string().min(1).optional(),
      profile: z.record(z.unknown()).optional(),
      backing: z.enum(['create', 'link', 'data-only']),
      ownerActorId: ActorId,
      actorId: ActorId.optional(),
      financedPortionBp: financedPortionBp.optional(),
      creditor: creditorInput.optional(),
      confirm: z.boolean().optional(),
    })
    .strict(),
  z
    .object({ action: z.literal('connect-enterprise-actor'), actorId: ActorId, ownerActorId: ActorId.optional() })
    .strict(),
  z
    .object({
      action: z.literal('enterprise-income'),
      enterpriseId,
      rolledTotal: z.number().int().min(1),
      outcome: z.enum(['success', 'fail', 'astounding-fail']),
    })
    .strict(),
  z
    .object({ action: z.literal('enterprise-event'), enterpriseId, d100Roll: z.number().int().min(1).max(100) })
    .strict(),
  z
    .object({ action: z.literal('enterprise-pay-interest'), enterpriseId, declineToPay: z.boolean().optional() })
    .strict(),
  z
    .object({ action: z.literal('enterprise-repay-debt'), enterpriseId, amountBp, confirm: z.boolean().optional() })
    .strict(),
  z
    .object({
      action: z.literal('enterprise-upgrade'),
      enterpriseId,
      level: z.number().int().min(1),
      financedPortionBp: financedPortionBp.optional(),
      creditor: creditorInput.optional(),
      confirm: z.boolean().optional(),
    })
    .strict(),
  // delete-enterprise added post-Phase-6 L4a (user directive 2026-07-12): untrack only — the backing
  // Actor is never deleted and no coin moves. Confirm-gated (CCR-4, destructive store write).
  z
    .object({ action: z.literal('delete-enterprise'), enterpriseId, confirm: z.boolean().optional() })
    .strict(),

  // ── enterprise-ownership-and-debt idiom (Phase 7c, R7c.1/R7c.2) ─────────────────
  z
    .object({
      action: z.literal('set-enterprise-owners'),
      enterpriseId,
      ownerShares: z.array(ownerShareInput).min(1), // handler asserts Σ(sharePct) === 100
      confirm: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('add-enterprise-debt'),
      enterpriseId,
      amountBp,
      creditor: creditorInput.optional(),
      recipientActorId: ActorId.optional(), // omit = the primary (largest-share) owner
      confirm: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('forgive-enterprise-debt'),
      enterpriseId,
      amountBp: amountBp.optional(), // omit = forgive the entire remaining principal
      confirm: z.boolean().optional(),
    })
    .strict(),

  // ── venture-ledger idiom (Phase 7d, wfrp_economy_system, R7d.1-R7d.8) ───────────
  // DELEGATE to the wfrp4e-economy fork's own headless, roll-free/dialog-free ventures engine
  // (src/ventures/venture-engine.js, Phase 7d task 1.4) via the same runtimeImport idiom as
  // enterprise-engine.js above. Ventures are a standalone `ventures` world setting ({ instances }) — NO
  // `profiles` bucket (D1, the 4 deed types are a fixed enum). transfer-venture-parts QUEUES a secondary-
  // market offer (venture-engine's queueTransfer) — resolution happens ONLY at the fork's own Run
  // Economic Cycle button (duty f), never instantly; this action never resolves a sale itself.
  z
    .object({
      action: z.literal('create-venture'),
      name: z.string().min(1),
      type: ventureType,
      parts: z.object({ total: z.number().int().positive(), priceBp: amountBp }).strict(),
      terms: z.object({ managerActorId: ActorId.optional(), managerPortionPct: z.number().int().min(0).max(100).optional() }).strict().optional(),
      handledBy: z.array(z.object({ role: z.string().min(1), name: z.string().optional() }).strict()).optional(),
      linkedEnterpriseId: z.string().min(1).optional(), // BRANDED-ID-EXEMPT:linkedEnterpriseId — module-internal id (enterprise instance id, actor UUID or generated), not a Foundry document id

      exposureTags: z.array(z.string().min(1)).optional(),
      confirm: z.boolean().optional(),
    })
    .strict(),
  z.object({ action: z.literal('get-venture'), ventureId }).strict(),
  z.object({ action: z.literal('list-ventures'), type: ventureType.optional(), status: ventureStatus.optional() }).strict(),
  z
    .object({
      action: z.literal('subscribe-venture'),
      ventureId,
      actorId: ActorId.optional(),
      externalName: z.string().min(1).optional(),
      // NOT `parts` — create-venture's `parts` is an object ({total,priceBp}); a scalar under the same
      // key would collide in the flattened mcp-server inputSchema (one JSON-schema type per property name).
      partsCount: z.number().int().positive(),
      confirm: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('transfer-venture-parts'),
      ventureId,
      sellerActorId: ActorId.optional(),
      sellerExternalName: z.string().min(1).optional(),
      partsCount: z.number().int().positive(),
      askingPriceBp: amountBp,
      confirm: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('settle-venture'),
      ventureId,
      netBp: z.number().int().nonnegative().optional(),
      confirm: z.boolean().optional(),
    })
    .strict(),
  z.object({ action: z.literal('distribute-venture'), ventureId, confirm: z.boolean().optional() }).strict(),
  z.object({ action: z.literal('venture-event'), ventureId, d100Roll: z.number().int().min(1).max(100) }).strict(),

  // ── Phase 7d2 (Venture Events v2, D13) — 4 new GM actions ───────────────────────
  z
    .object({
      action: z.literal('toggle-venture-badge'),
      ventureId,
      badge: ventureToggleableBadge,
      confirm: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('issue-parts'),
      ventureId,
      count: z.number().int().positive(),
      priceModPct: z.number().int().optional(), // signed % applied to parts.priceBp in the same call
      confirm: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('set-venture-status'),
      ventureId,
      status: ventureStatus,
      confirm: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('set-venture-standing'),
      ventureId,
      standing: ventureStanding,
      confirm: z.boolean().optional(),
    })
    .strict(),
]);

export type WfrpEconomyInputType = z.infer<typeof WfrpEconomyInput>;
