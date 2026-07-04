// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v2 Phase 6 — Zod schema (promoted to @foundry-mcp/shared, ADR-020) for module-wfrp-economy
// (Warhammer Economy, wfrp4e-economy v1.0.0).
//
// CCR-5: module-specific schemas are promoted to @foundry-mcp/shared (ADR-020, Phase C2). `.strict()` on
// every top-level action variant rejects unknown keys. Per carry-forward §4 every variant is a plain
// `.strict()` ZodObject (NO `.refine`/`.transform` — a ZodEffects breaks the discriminatedUnion);
// cross-field rules (confirm-gate, large-transfer threshold, target resolution) live in the handler.
//
// 25 actions across 8 idioms (capability_audit/wfrp4e-economy.md + phase6_pre_plan.md §Action surface):
//   stand-up-an-economy (6): list-economies / get-economy / list-bankers / create-economy /
//     update-economy / delete-economy
//   open-a-bank-account (2): create-account / list-accounts
//   run-a-transaction (3): deposit / withdraw / transfer
//   loan-cycle (2): request-loan / repay-loan
//   investment-cycle (3): buy-stock / sell-stock / get-portfolio
//   property-management (3): buy-property / sell-property / set-rented
//   wallet-quick-adjust (3): get-wallet-balance / wallet-add / wallet-remove
//   audit-the-ledger (3): list-transactions / actor-transaction-summary / bank-transaction-summary
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

const amountBp = z.number().int().positive(); // integer Brass Pennies, > 0
const quantity = z.number().int().positive();

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
    })
    .strict(),
  z.object({ action: z.literal('actor-transaction-summary'), actorId: ActorId, economyId: economyId }).strict(),
  z.object({ action: z.literal('bank-transaction-summary'), bankId: bankId, economyId: economyId }).strict(),
]);

export type WfrpEconomyInputType = z.infer<typeof WfrpEconomyInput>;
