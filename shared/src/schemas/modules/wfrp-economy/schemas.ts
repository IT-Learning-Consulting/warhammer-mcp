// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v2 Phase 6 — Zod schema (promoted to @foundry-mcp/shared, ADR-020) for module-wfrp-economy
// (Warhammer Economy, wfrp4e-economy v1.0.0).
//
// CCR-5: module-specific schemas are promoted to @foundry-mcp/shared (ADR-020, Phase C2). `.strict()` on
// every top-level action variant rejects unknown keys. Per carry-forward §4 every variant is a plain
// `.strict()` ZodObject (NO `.refine`/`.transform` — a ZodEffects breaks the discriminatedUnion);
// cross-field rules (confirm-gate, large-transfer threshold, target resolution) live in the handler.
//
// 91 actions across 16 idioms (capability_audit/wfrp4e-economy.md + phase6_pre_plan.md §Action surface;
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
//   enterprise-ownership-and-debt (4, Phase 7c + 7e2): set-enterprise-owners / add-enterprise-debt /
//     forgive-enterprise-debt / set-enterprise-income-sources — DELEGATE to the same
//     enterprise-engine.js (setOwners/addDebt/forgiveDebt/setIncomeSources exports). owners[] widens
//     the single ownerActorId scalar to weighted shares; ownerActorId stays as a deprecated alias
//     (= largest-share owner). RAW Archives III Creditors debt model: principal never auto-derives a
//     tier, escalation derives from missed payments. set-enterprise-income-sources (Phase 7e2) is
//     manager-primary: it replaces the full incomeModifiers list and pushes the same list onto the
//     backing actor (when actor-backed) so the Economy Manager and the archives3 actor sheet never
//     drift — see enterprise-engine.js's setIncomeSources + the fork's updateActor mirror hook.
//   levy-groups (4, Phase 7c): list-levies / save-levy-group / list-levy-groups / delete-levy-group —
//     list-levies is a pure read over the `levies` world setting; the group actions DELEGATE to the
//     `levyGroups` world setting (named actor rosters a levy's `target`/`groupId` can point at,
//     resolved engine-side by levy-engine.js's resolveTargets()).
//   trading (24, Phase 7f — the ported trading-places engine, native to this module; +1 post-7f Change-2
//     rumour-table sync): trading-list-settlements / trading-list-cargo-types / trading-get-season /
//     trading-set-season / trading-check-availability / trading-calc-purchase-price / trading-calc-sale-price /
//     trading-haggle-test / trading-gossip-test / trading-buy-cargo / trading-sell-cargo /
//     trading-delete-rumour / trading-get-hold / trading-list-gazetteers /
//     trading-import-gazetteer / trading-configure-gazetteers / trading-generate-merchant /
//     trading-reveal-quality / trading-get-price-modifiers / trading-set-price-modifiers /
//     trading-migration-status — DELEGATE to the wfrp4e-economy fork's own headless, roll-free/
//     dialog-free trading engine (src/trading/trading-engine.js + gazetteer-store.js + trading-math.js
//     barrel). Additive, ADDITIVE-ONLY to the still-live `module-trading-places` umbrella (19 actions,
//     untouched) — this is the 7f "native successor" surface, not a replacement (retirement is 7g).
//     Settlements/cargo/season/price-quote/haggle/gossip/hold/gazetteers/merchant-generation/dial mirror
//     the trading-places precedent field names (settlement, cargoName, playerRoll, merchantRoll,
//     availabilityRoll-shaped rolls[], etc.) for cross-tool consistency (D11). Every stochastic action
//     REQUIRES a pre-rolled total (memo F8/AC-10) — trading-generate-merchant's percentileRoll is
//     REQUIRED here even though the engine itself allows omitting it (a Math.random() UI-convenience
//     fallback lives in merchant-generator.js — this MCP surface must never trigger it). Secret d10 wine/
//     brandy quality (D12) is GM-only data; trading-buy-cargo/trading-reveal-quality echo it because the
//     MCP caller IS the GM surface. trading-migration-status exposes the D2 seed-once migration
//     (idempotent — a second call returns `alreadyMigrated:true`) as a manual/diagnostic trigger; the
//     fork's own ready-hook already calls it automatically on first engine init. Trade Rumour Table
//     redesign (post-7f Change 1/2 — real 20-band d100 table, data/trading/rumour-table.json, replacing
//     the old flat single-cargo 2x-eligibility model): trading-gossip-test now REQUIRES rumourD100Roll
//     (1-100, pre-rolled — this layer never rolls) and, on a successful Gossip Test, mints+stores a rumour
//     via mintAndStoreRumour, echoing it as rumourMinted (null on a failed test). trading-buy-cargo/
//     trading-sell-cargo no longer take a rumourId param — the engine auto-matches a stored rumour against
//     the traded cargo's name (buyDiscount on buy, sellBonus on sell; first eligible match wins, mint
//     order) and consumes it on a successful trade; both responses are additive with rumourApplied (the
//     consumed rumour's { id, text, multiplier }, or null). trading-delete-rumour { rumourId } — new
//     GM-only manual removal of a stored-but-unused rumour, mirroring delete-enterprise/delete-levy-group's
//     deepClone-read -> filter -> write -> verify idiom. +3 actions (post-7f
//     vehicle-linked cargo capacity): trading-list-vehicle-actors {} — unconnected world `vehicle`-type
//     actors, each carrying their system.status.carries.max · trading-connect-cargo-vehicle { actorId } —
//     tie the shared hold's capacity to a real vehicle actor's carries.max instead of the flat
//     tradingCargoCapacity setting · trading-disconnect-cargo-vehicle {} — revert to the flat manual
//     setting. trading-get-hold's response is additive: capacitySource ('vehicle'|'manual') +
//     connectedVehicleName (nullable) now echo which capacity source is active, mirroring the
//     seasonSource/backing conventions used elsewhere in this schema.
//   venture-ledger (8, Phase 7d): create-venture / get-venture / list-ventures / subscribe-venture /
//     transfer-venture-parts / settle-venture / distribute-venture / venture-event — DELEGATE to the
//     wfrp4e-economy fork's own headless ventures engine (src/ventures/venture-engine.js). Deeds are a
//     standalone `ventures` world setting ({instances}); a deed carries Parts (total/subscribed/priceBp),
//     holders[] (actorId or externalName), an escrowBp coin pool, a status/standing pair, and
//     queuedTransfers[]. transfer-venture-parts QUEUES an offer — resolution happens only at the fork's
//     Run Economic Cycle button, never instantly. get-venture/list-ventures are pure reads.
//   economic-climate (2, Phase 8; addendum-2 PER-ECONOMY): climate-get-state { economyId } /
//     climate-set-state { economyId, state } — DELEGATE to the fork's climate-math.js 8-state table via
//     climate-state.js (re-exported through trading-engine.js). Climate is keyed PER ECONOMY (a map
//     { [economyId]: { state, updatedAt } }); The Empire at `war` never touches Brettonia. set is
//     GM-gated identically to trading-set-price-modifiers; both actions echo the FULL resolved state
//     entry (economyId + label + priceFactor + incomeFactor + eventShift + updatedAt), never a bare id.
//     `none` = exact identity everywhere the climate factor is consumed (applyDial, enterprise income
//     payout, venture event roll — each seam reads its OWN economy's state; trading quote actions take
//     an optional economyId, omitted = identity) — the seams live entirely in the fork, this schema
//     only validates the GM's state pick.
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

// Phase 7f (trading, D11) — mirrors module-trading-places/schemas.ts field-naming precedent.
const tradingSeasonEnum = z.enum(['spring', 'summer', 'autumn', 'winter']);
const tradingQuality = z.enum(['poor', 'average', 'good', 'excellent']); // wine/brandy quality tiers
const tradingD100Roll = z.number().int().min(1).max(100); // pre-rolled 1d100 total
const tradingD10Roll = z.number().int().min(1).max(10); // pre-rolled 1d10 total (secret quality / Top-Shelf gate)
const tradingSkillValue = z.number().int().min(0).max(100); // WFRP skill target number
const tradingEpQuantity = z.number().int().positive(); // Encumbrance Points
const tradingGazetteerId = z.string().min(1); // BRANDED-ID-EXEMPT:gazetteerId — module-internal id (a gazetteer pack's packId), not a Foundry document id
const tradingLotId = z.string().min(1); // BRANDED-ID-EXEMPT:lotId — module-internal id (a tradingCargoHold entry's randomID), not a Foundry document id
const tradingRumourId = z.string().min(1); // BRANDED-ID-EXEMPT:rumourId — module-internal id (a tradingRumours entry's randomID), not a Foundry document id
const tradingPriceMultiplier = z.number().positive(); // price-dial multiplier, > 0 (1 = neutral)
// Phase 8 (D1): the 8 economic-climate state ids — MUST mirror climate-math.js CLIMATE_STATE_IDS exactly
// (fork engine): 4 positive-class + none + 3 negative-class per D1's generalization directive.
const climateStateEnum = z.enum(['prosperity', 'bountiful-harvest', 'festival', 'none', 'banditry', 'plague', 'war', 'siege']);
// One pre-rolled { availabilityRoll, cargoRoll, amountRoll } triple per availability-pipeline POTENTIAL
// slot (memo F5 — no Foundry `new Roll("1d100")` fallback exists; over-supply is fine, extras are ignored
// by runAvailabilityPipeline). GM directive 2026-07-19 (P10-4): availabilityRoll is the RAW "Availability
// of Goods" gate (Gazetteer of the Reikland p.75, d100 <= (Size+Wealth)x10) — rolled and checked
// INDIVIDUALLY per potential slot; a slot whose availabilityRoll fails contributes no cargo at all. Before
// P10-4 this field didn't exist and every potential slot always produced a cargo — that was the bug.
const tradingAvailabilityRollPair = z.object({ availabilityRoll: tradingD100Roll, cargoRoll: tradingD100Roll, amountRoll: tradingD100Roll }).strict();

// Phase 7e2: an income-source entry (mirrors WfrpEconomyIncomeModifier / the fork's
// validateIncomeSources rules — cross-field/tier/standing enforcement lives in the handler, not here,
// per the ZodEffects-breaks-discriminatedUnion constraint above).
const incomeModifierInput = z
  .object({
    label: z.string(),
    skill: z.string(),
    tier: z.enum(['b', 's', 'g']),
    standing: z.number().int(),
  })
  .strict();

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
  z
    .object({
      action: z.literal('get-economy'),
      economyId: economyId,
      // Follow-up plan (2026-07-19): optional convenience filter over the returned properties array —
      // additive, HC8-safe (no new action/tool). Matches the wfrp4e-economy fork UI's Available/Owned
      // split (owner == null = available). Omitted/'all' = today's unfiltered behavior (back-compat).
      propertyFilter: z.enum(['all', 'owned', 'available']).optional(),
    })
    .strict(),
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
      economyId,
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
      economyId,
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
      economyId,
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
      economyId,
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
  z.object({ action: z.literal('list-levies'), economyId }).strict(),
  z
    .object({
      action: z.literal('save-levy-group'),
      economyId,
      groupId: levyGroupId.optional(), // omit = create new
      name: z.string().min(1),
      actorIds: z.array(ActorId).min(1),
      confirm: z.boolean().optional(),
    })
    .strict(),
  z.object({ action: z.literal('list-levy-groups'), economyId }).strict(),
  z
    .object({ action: z.literal('delete-levy-group'), economyId, groupId: levyGroupId, confirm: z.boolean().optional() })
    .strict(),

  // ── banking-and-income idiom (Phase 5, wfrp_economy_system) ─────────────────────
  z
    .object({
      action: z.literal('invest'),
      actorId: ActorId,
      rate: z.number().int().min(1).max(10), // RAW Banking endeavour interest rate, percent per elapsed Imperial month
      amountBp,
      economyId,
      bankId: bankId.optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('resolve-investment'),
      investmentId: investmentId,
      economyId,
      d100Roll: z.number().int().min(1).max(100), // pre-rolled by the caller; <= rate = RAW bankruptcy (total loss)
      confirm: z.boolean().optional(), // required — can total-loss the investment
    })
    .strict(),
  z
    .object({ action: z.literal('list-investments'), economyId, actorId: ActorId.optional(), activeOnly: z.boolean().optional() })
    .strict(),
  z.object({ action: z.literal('stash-deposit'), economyId, actorId: ActorId, amountBp }).strict(),
  z
    .object({
      action: z.literal('stash-withdraw'),
      economyId,
      actorId: ActorId,
      d100Roll: z.number().int().min(1).max(100), // pre-rolled by the caller; <= 10 = RAW total stash loss
      confirm: z.boolean().optional(), // required — whole-stash withdrawal, can total-loss
    })
    .strict(),
  z
    .object({
      action: z.literal('accrue-interest'),
      economyId,
      dryRun: z.boolean().optional(), // preview only, zero writes — no confirm required
    })
    .strict(),
  z
    .object({
      action: z.literal('run-economic-cycle'),
      economyId,
      // Preview covers investment/account/loan/rental verdicts ONLY — the venture pass (queued-transfer
      // resolution, distributions, standing decay, delay-tick, events) is SKIPPED entirely on dryRun
      // (engine contract, banking-engine.js:622) and never previews. No confirm required on dryRun.
      dryRun: z.boolean().optional(),
      // Flat {ventureId|offerId: preRolledD100} map forwarded verbatim to the venture pass (D6: engine is
      // roll-free — the caller pre-rolls every d100). Named cycleRolls, not `rolls`, to avoid colliding
      // with trading-check-availability's differently-shaped `rolls` in the flattened mcp-server
      // inputSchema (same precedent as partsCount vs create-venture's `parts`).
      cycleRolls: z.record(z.string().min(1), z.number().int().min(1).max(100)).optional(),
      // Required to execute (dryRun:false/undefined) — no worldTime gate; a repeat call pays every duty
      // again (cycle, not calendar).
      confirm: z.boolean().optional(),
    })
    .strict(),

  // ── legitimate-business-enterprises idiom (Phase 6, wfrp_economy_system) ───────
  z
    .object({ action: z.literal('list-enterprises'), economyId, unconnectedActors: z.boolean().optional() })
    .strict(),
  z.object({ action: z.literal('get-enterprise'), enterpriseId }).strict(),
  z
    .object({
      action: z.literal('create-enterprise'),
      economyId,
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
    .object({ action: z.literal('connect-enterprise-actor'), economyId, actorId: ActorId, ownerActorId: ActorId.optional() })
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

  // Phase 7e2 (R6.1/R6.5/R7c.3): manager-primary income-source write — DELEGATES to the fork's new
  // setIncomeSources engine duty (mutex + verify + echo-tagged actor push). Full-list replace, not a
  // patch. tier/standing/label validation lives in the handler (validateIncomeSources on the fork side).
  z
    .object({
      action: z.literal('set-enterprise-income-sources'),
      enterpriseId,
      incomeModifiers: z.array(incomeModifierInput),
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
      economyId,
      name: z.string().min(1),
      type: ventureType,
      parts: z.object({ total: z.number().int().positive(), priceBp: amountBp }).strict(),
      terms: z.object({ managerActorId: ActorId.optional(), managerPortionPct: z.number().int().min(0).max(100).optional() }).strict().optional(),
      // D8 (Phase 7e): a linked Registry entry additively carries {bankId,economyId} as a pair — both
      // present names a real institution; both absent stays the Phase 7d generic/context-free entry.
      handledBy: z
        .array(
          z
            .object({ role: z.string().min(1), name: z.string().optional(), bankId: bankId.optional(), economyId: economyId.optional() })
            .strict()
            .refine((h) => (h.bankId == null) === (h.economyId == null), { message: 'handledBy bankId/economyId must both be present (linked) or both absent (unassigned)' }),
        )
        .optional(),
      linkedEnterpriseId: z.string().min(1).optional(), // BRANDED-ID-EXEMPT:linkedEnterpriseId — module-internal id (enterprise instance id, actor UUID or generated), not a Foundry document id

      exposureTags: z.array(z.string().min(1)).optional(),
      confirm: z.boolean().optional(),
    })
    .strict(),
  z.object({ action: z.literal('get-venture'), ventureId }).strict(),
  z
    .object({
      action: z.literal('list-ventures'),
      type: ventureType.optional(),
      status: ventureStatus.optional(),
      // Per-economy sweep (Phases 5-8): economyId is REQUIRED — every list is economy-scoped; the old
      // Phase 7d "omit both for context-free" behavior is retired. D8's institution-context gate is now
      // bankId-only: supplying bankId additionally requires a handledBy Registry entry matching the pair.
      // BUG-545: the bankId-pairing gate is enforced at the foundry-module HANDLER (handleListVentures →
      // WFRP_ECONOMY_VENTURE_PARTIAL_CONTEXT), NOT here — a discriminatedUnion variant cannot carry a
      // .refine()/.superRefine() (ZodEffects has no .shape and breaks discrimination; see file header CCR-5).
      bankId: bankId.optional(),
      economyId,
    })
    .strict(),
  z
    .object({
      action: z.literal('subscribe-venture'),
      ventureId,
      actorId: ActorId.optional(),
      externalName: z.string().min(1).optional(),
      // NOT `parts` — create-venture's `parts` is an object ({total,priceBp}); a scalar under the same
      // key would collide in the flattened mcp-server inputSchema (one JSON-schema type per property name).
      partsCount: z.number().int().positive(),
      // D8: optional institution context — when supplied, the venture must carry one Registry entry
      // matching both fields (registryNotHandling otherwise). Omit both for the Phase 7d "any Registry" rule.
      // BUG-545: both-or-neither is enforced at the foundry-module HANDLER (handleSubscribeVenture →
      // WFRP_ECONOMY_VENTURE_PARTIAL_CONTEXT), NOT here (discriminatedUnion variants can't carry .refine()).
      bankId: bankId.optional(),
      economyId: economyId.optional(),
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
  // delete-venture — closes BUG-821's delete half. The engine already refuses a deed whose escrow is
  // non-empty AND still has at least one payable holder; it permits the delete (writing the residue
  // off) only when EVERY holder is unpayable, i.e. deleted actors and/or external names nobody can be
  // paid through. That orphan case was previously unrecoverable except by raw settings surgery.
  z.object({ action: z.literal('delete-venture'), ventureId, confirm: z.boolean().optional() }).strict(),
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

  // ── trading idiom (Phase 7f, D11) — DELEGATE to src/trading/{trading-engine,gazetteer-store,trading-math}.js ──
  z.object({ action: z.literal('trading-list-settlements'), gazetteerId: tradingGazetteerId.optional() }).strict(),
  z.object({ action: z.literal('trading-list-cargo-types') }).strict(),
  z.object({ action: z.literal('trading-get-season') }).strict(),
  z
    .object({ action: z.literal('trading-set-season'), season: tradingSeasonEnum.optional(), clear: z.boolean().optional() })
    .strict(),
  z
    .object({
      action: z.literal('trading-check-availability'),
      settlement: z.string().min(1),
      season: tradingSeasonEnum.optional(),
      rolls: z.array(tradingAvailabilityRollPair).min(1), // caller over-supplies; extras beyond slotCount are ignored
    })
    .strict(),
  z
    .object({
      action: z.literal('trading-calc-purchase-price'),
      cargoName: z.string().min(1),
      quantity: tradingEpQuantity,
      quality: tradingQuality.optional(),
      season: tradingSeasonEnum.optional(),
      // addendum-2: per-economy climate — optional (HC8-additive); omitted = identity/no climate factor.
      economyId: economyId.optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('trading-calc-sale-price'),
      cargoName: z.string().min(1),
      quantity: tradingEpQuantity,
      settlement: z.string().min(1),
      quality: tradingQuality.optional(),
      season: tradingSeasonEnum.optional(),
      // addendum-2: per-economy climate — optional (HC8-additive); omitted = identity/no climate factor.
      economyId: economyId.optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('trading-haggle-test'),
      playerSkill: tradingSkillValue,
      merchantSkill: tradingSkillValue,
      playerRoll: tradingD100Roll,
      merchantRoll: tradingD100Roll,
      hasDealmakerTalent: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('trading-gossip-test'),
      playerSkill: tradingSkillValue,
      playerRoll: tradingD100Roll,
      difficulty: z.number().int().optional(), // modifier; RAW default -10 (Difficult)
      // Change 2 redesign: this action now ALSO mints+stores a rumour (mintAndStoreRumour) whenever the
      // Gossip Test succeeds — rumourD100Roll selects the RAW 20-band d100 Trade Rumour Table row
      // (rumour-table.json). Required always (not just on success) since this layer never rolls (HC10);
      // the engine itself no-ops (returns null, zero writes) when the test failed.
      rumourD100Roll: tradingD100Roll,
    })
    .strict(),
  z
    .object({
      action: z.literal('trading-buy-cargo'),
      economyId,
      actorId: ActorId,
      cargoName: z.string().min(1),
      quantity: tradingEpQuantity,
      settlement: z.string().min(1),
      season: tradingSeasonEnum.optional(),
      quality: tradingQuality.optional(),
      secretQualityD10Roll: tradingD10Roll.optional(), // required (by RAW) for Wine/Brandy lots; D12
      originBonusSteps: z.number().int().optional(), // Kemperbad-class settlement origin bonus (+2, D3)
    })
    .strict(),
  z
    .object({
      action: z.literal('trading-sell-cargo'),
      economyId,
      actorId: ActorId,
      lotId: tradingLotId,
      settlement: z.string().min(1),
      isTradeSettlement: z.boolean(),
      buyerRoll: tradingD100Roll,
      halfCargoRetryRoll: tradingD100Roll.optional(), // only consumed on a first buyer-chance failure
      weeksElapsedSincePurchase: z.number().int().nonnegative().optional(), // default 1 (assume travel)
      // Change 2 redesign: rumourId dropped — the engine now auto-matches a stored sellBonus rumour by
      // cargo name (first eligible match wins, mint order) and consumes it itself; no explicit id param.
      topShelfBuyerRoll: tradingD10Roll.optional(), // Top Shelf Wine/Brandy self-supply exception (RAW)
      // P10-4 (GM directive 2026-07-19): RAW Selling #6/#7 guaranteed fire sale. Opt-in — only consulted
      // when buyerChance (and its half-cargo retry, if halfCargoRetryRoll was supplied) BOTH fail; a
      // Trade-flagged settlement then always sells at flat half base price (no wealth/haggle/rumour
      // modifiers). Omitted/false preserves the pre-existing hard-refusal-on-failure behavior.
      acceptFireSale: z.boolean().optional(),
    })
    .strict(),
  // Change 1 (GM-only removal): mirrors the deepClone-read -> filter-out -> write -> verify idiom used by
  // every other delete in this module (delete-enterprise, delete-levy-group). Also fires internally when
  // buyCargo/sellCargo consume a matched rumour on use — this action is the standalone/manual path.
  z.object({ action: z.literal('trading-delete-rumour'), rumourId: tradingRumourId }).strict(),
  z.object({ action: z.literal('trading-get-hold') }).strict(),
  z.object({ action: z.literal('trading-list-vehicle-actors') }).strict(),
  z.object({ action: z.literal('trading-connect-cargo-vehicle'), actorId: ActorId }).strict(),
  z.object({ action: z.literal('trading-disconnect-cargo-vehicle') }).strict(),
  z.object({ action: z.literal('trading-list-gazetteers') }).strict(),
  z.object({ action: z.literal('trading-import-gazetteer'), pack: z.record(z.unknown()) }).strict(),
  z
    .object({ action: z.literal('trading-configure-gazetteers'), activeIds: z.array(z.string().min(1)).min(1) })
    .strict(),
  z
    .object({
      action: z.literal('trading-generate-merchant'),
      settlement: z.string().min(1),
      cargoType: z.string().min(1),
      merchantType: z.enum(['producer', 'seeker']),
      // REQUIRED here (unlike the engine's own optional param) — merchant-generator.js falls back to
      // Math.random() when omitted; this MCP surface must never trigger that (AC-10/memo F8).
      percentileRoll: z.number().min(0).max(100),
    })
    .strict(),
  z
    .object({
      action: z.literal('trading-reveal-quality'),
      lotId: tradingLotId,
      evaluateSuccess: z.boolean(),
      sl: z.number().int(), // the buyer's Evaluate Test Success Level (any sign; magnitude only is used)
      misreportDirection: z.union([z.literal(1), z.literal(-1)]).optional(),
    })
    .strict(),
  z.object({ action: z.literal('trading-get-price-modifiers') }).strict(),
  z
    .object({
      action: z.literal('trading-set-price-modifiers'),
      global: tradingPriceMultiplier.optional(),
      perCargo: z.record(z.string().min(1), tradingPriceMultiplier).optional(),
      reset: z.boolean().optional(), // true restores {global:1, perCargo:{}}, ignoring global/perCargo
    })
    .strict(),
  z.object({ action: z.literal('trading-migration-status') }).strict(),
  // Phase 8 (D1/D4/D11; addendum-2 PER-ECONOMY) — economic climate is keyed by economyId (The Empire's
  // war never touches Brettonia's harvest): both actions REQUIRE economyId, same posture as the levy
  // actions. set is GM-gated in the handler (mirrors trading-set-price-modifiers) and takes exactly one
  // of the 8 climate-state ids; an unknown economyId refuses with zero writes.
  z.object({ action: z.literal('climate-get-state'), economyId: economyId }).strict(),
  z.object({ action: z.literal('climate-set-state'), economyId: economyId, state: climateStateEnum }).strict(),
]);

export type WfrpEconomyInputType = z.infer<typeof WfrpEconomyInput>;
