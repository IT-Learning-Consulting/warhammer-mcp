// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v2 Phase 6 — package-local Zod schema for module-wfrp-economy
// (Warhammer Economy, wfrp4e-economy v1.0.0).
//
// CCR-5: module-specific schemas stay package-local (not in @foundry-mcp/shared). `.strict()` on
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
  z.object({ action: z.literal('get-economy'), economyId: z.string().min(1) }).strict(),
  z.object({ action: z.literal('list-bankers'), economyId: z.string().min(1).optional() }).strict(),
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
      economyId: z.string().min(1),
      name: z.string().min(1).optional(),
      currency: z.string().min(1).optional(),
      currencySystem: z.string().min(1).optional(),
      banks: z.array(bankObj).optional(),
      properties: z.array(propertyObj).optional(),
      stocks: z.array(stockObj).optional(),
    })
    .strict(),
  z
    .object({ action: z.literal('delete-economy'), economyId: z.string().min(1), confirm: z.boolean().optional() })
    .strict(),

  // ── open-a-bank-account idiom ───────────────────────────────────────────────────
  z
    .object({ action: z.literal('create-account'), economyId: z.string().min(1), bankId: z.string().min(1), actorId: z.string().min(1) })
    .strict(),
  z
    .object({ action: z.literal('list-accounts'), economyId: z.string().min(1).optional(), actorId: z.string().min(1).optional() })
    .strict(),

  // ── run-a-transaction idiom ─────────────────────────────────────────────────────
  z.object({ action: z.literal('deposit'), economyId: z.string().min(1), accountId: z.string().min(1), amountBp }).strict(),
  z.object({ action: z.literal('withdraw'), economyId: z.string().min(1), accountId: z.string().min(1), amountBp }).strict(),
  z
    .object({
      action: z.literal('transfer'),
      economyId: z.string().min(1),
      sourceAccountId: z.string().min(1),
      destinationAccountId: z.string().min(1),
      amountBp,
      confirm: z.boolean().optional(), // required when amountBp >= LARGE_TRANSFER_THRESHOLD
    })
    .strict(),

  // ── loan-cycle idiom ────────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('request-loan'),
      economyId: z.string().min(1),
      accountId: z.string().min(1),
      amountBp,
      interestRate: z.number().nonnegative().optional(), // percent; defaults to the bank's loanRate
    })
    .strict(),
  z.object({ action: z.literal('repay-loan'), economyId: z.string().min(1), accountId: z.string().min(1), amountBp }).strict(),

  // ── investment-cycle idiom ──────────────────────────────────────────────────────
  z
    .object({ action: z.literal('buy-stock'), economyId: z.string().min(1), accountId: z.string().min(1), stockId: z.string().min(1), quantity })
    .strict(),
  z
    .object({ action: z.literal('sell-stock'), economyId: z.string().min(1), accountId: z.string().min(1), stockId: z.string().min(1), quantity })
    .strict(),
  z.object({ action: z.literal('get-portfolio'), actorId: z.string().min(1), economyId: z.string().min(1) }).strict(),

  // ── property-management idiom ───────────────────────────────────────────────────
  z
    .object({ action: z.literal('buy-property'), economyId: z.string().min(1), accountId: z.string().min(1), propertyId: z.string().min(1) })
    .strict(),
  z
    .object({ action: z.literal('sell-property'), economyId: z.string().min(1), accountId: z.string().min(1), propertyId: z.string().min(1) })
    .strict(),
  z
    .object({ action: z.literal('set-rented'), economyId: z.string().min(1), propertyId: z.string().min(1), rented: z.boolean() })
    .strict(),

  // ── wallet-quick-adjust idiom (economyId ignored in WFRP4e mode — reads actor money items) ──
  z.object({ action: z.literal('get-wallet-balance'), actorId: z.string().min(1), economyId: z.string().min(1).optional() }).strict(),
  z.object({ action: z.literal('wallet-add'), actorId: z.string().min(1), amountBp, economyId: z.string().min(1).optional() }).strict(),
  z.object({ action: z.literal('wallet-remove'), actorId: z.string().min(1), amountBp, economyId: z.string().min(1).optional() }).strict(),

  // ── audit-the-ledger idiom ──────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('list-transactions'),
      actorId: z.string().min(1).optional(),
      economyId: z.string().min(1).optional(),
      type: z.string().min(1).optional(),
      bankId: z.string().min(1).optional(),
    })
    .strict(),
  z.object({ action: z.literal('actor-transaction-summary'), actorId: z.string().min(1), economyId: z.string().min(1) }).strict(),
  z.object({ action: z.literal('bank-transaction-summary'), bankId: z.string().min(1), economyId: z.string().min(1) }).strict(),
]);

export type WfrpEconomyInputType = z.infer<typeof WfrpEconomyInput>;
