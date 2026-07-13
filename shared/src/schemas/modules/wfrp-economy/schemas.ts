// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v2 Phase 6 — Zod schema (promoted to @foundry-mcp/shared, ADR-020) for module-wfrp-economy
// (Warhammer Economy, wfrp4e-economy v1.0.0).
//
// CCR-5: module-specific schemas are promoted to @foundry-mcp/shared (ADR-020, Phase C2). `.strict()` on
// every top-level action variant rejects unknown keys. Per carry-forward §4 every variant is a plain
// `.strict()` ZodObject (NO `.refine`/`.transform` — a ZodEffects breaks the discriminatedUnion);
// cross-field rules (confirm-gate, large-transfer threshold, target resolution) live in the handler.
//
// 44 actions across 12 idioms (capability_audit/wfrp4e-economy.md + phase6_pre_plan.md §Action surface;
// record-transaction + delete-account added Phase 2, wfrp_economy_system_v1_prd.md §10; apply-levies +
// money-to-burn added Phase 4, same PRD §10; invest/resolve-investment/list-investments/stash-deposit/
// stash-withdraw/accrue-interest added Phase 5, same PRD §10; list-enterprises/get-enterprise/
// create-enterprise/connect-enterprise-actor/enterprise-income/enterprise-event/enterprise-pay-interest/
// enterprise-repay-debt/enterprise-upgrade added Phase 6, same PRD §10 — HC8-compliant, action count
// grows, tool count stays 1):
//   stand-up-an-economy (6): list-economies / get-economy / list-bankers / create-economy /
//     update-economy / delete-economy
//   open-a-bank-account (2): create-account / list-accounts
//   run-a-transaction (3): deposit / withdraw / transfer
//   loan-cycle (2): request-loan / repay-loan
//   investment-cycle (3): buy-stock / sell-stock / get-portfolio
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
//   legitimate-business-enterprises (9): list-enterprises / get-enterprise / create-enterprise /
//     connect-enterprise-actor / enterprise-income / enterprise-event / enterprise-pay-interest /
//     enterprise-repay-debt / enterprise-upgrade — DELEGATE to the wfrp4e-economy fork's own
//     src/enterprises/enterprise-engine.js (headless, roll-free/dialog-free), Phase 6 of
//     wfrp_economy_system_v1_prd.md §10. Enterprises live in a standalone `enterprises` world setting
//     ({ profiles, instances }); list-enterprises(default)/get-enterprise are pure reads over that
//     store (NOT engine delegations). backing is 'create' (embeds an archives3 enterprise actor, gated
//     on wfrp4e-archives3) | 'link' (an existing archives3 actor) | 'data-only' (no actor). Rolls
//     (rolledTotal/d100Roll) are pre-computed by the caller, never rolled by this layer.
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
const stockId = z.string().min(1); // BRANDED-ID-EXEMPT:stockId — module-internal id, not a Foundry document id
const propertyId = z.string().min(1); // BRANDED-ID-EXEMPT:propertyId — module-internal id, not a Foundry document id
const investmentId = z.string().min(1); // BRANDED-ID-EXEMPT:investmentId — module-internal id, not a Foundry document id
const enterpriseId = z.string().min(1); // BRANDED-ID-EXEMPT:enterpriseId — module-internal id (actor UUID when actor-backed, generated id when data-only)

const amountBp = z.number().int().positive(); // integer Brass Pennies, > 0
const quantity = z.number().int().positive();
const financedPortionBp = z.number().int().nonnegative(); // BP covered by a Creditor (becomes/adds to debt.principal)

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

  // ── investment-cycle idiom ──────────────────────────────────────────────────────
  z
    .object({ action: z.literal('buy-stock'), economyId: economyId, accountId: accountId, stockId: stockId, quantity })
    .strict(),
  z
    .object({ action: z.literal('sell-stock'), economyId: economyId, accountId: accountId, stockId: stockId, quantity })
    .strict(),
  z.object({ action: z.literal('get-portfolio'), actorId: ActorId, economyId: economyId }).strict(),

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

  // ── levy-and-burn idiom (Phase 4, wfrp_economy_system) ──────────────────────────
  z
    .object({
      action: z.literal('apply-levies'),
      actorIds: z.array(ActorId).min(1),
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
      actorIds: z.array(ActorId).min(1),
      dryRun: z.boolean().optional(), // preview only, zero writes — no confirm required
      confirm: z.boolean().optional(), // required to execute (dryRun:false/undefined) — mirrors delete-economy
    })
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
      confirm: z.boolean().optional(),
    })
    .strict(),
  // delete-enterprise added post-Phase-6 L4a (user directive 2026-07-12): untrack only — the backing
  // Actor is never deleted and no coin moves. Confirm-gated (CCR-4, destructive store write).
  z
    .object({ action: z.literal('delete-enterprise'), enterpriseId, confirm: z.boolean().optional() })
    .strict(),
]);

export type WfrpEconomyInputType = z.infer<typeof WfrpEconomyInput>;
