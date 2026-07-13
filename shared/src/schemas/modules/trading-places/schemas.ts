// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// wfrp_economy_system Phase 3 — Zod schema (@foundry-mcp/shared, ADR-020) for module-trading-places
// (Trading Places v0.3.0, WFRP4e bulk-cargo trading — Death on the Reik algorithm).
//
// CCR-5/ADR-020: every top-level action variant is a plain `.strict()` ZodObject (NO `.refine`/
// `.transform` — a ZodEffects breaks the discriminatedUnion); cross-field rules (remove-cargo's
// id-or-name requirement, the >= 4800 BP confirm-gate on currency writes) live in the handler.
//
// 19 actions (PRD R3.2's 11 + 5 cheap extras, Q&A 2026-07-10; +3 wfrp_economy_system Phase 7):
//   reference-data (2): list-settlements / list-cargo-types
//   season (2): get-season / set-season
//   market-math (3): check-availability / calc-purchase-price / calc-sale-price
//   tests (2): haggle-test / gossip-test — REQUIRE pre-rolled d100 totals (vault convention: the
//     sheet/GM owns rolling; the module's Math.random() default roll must never fire)
//   cargo-hold (3): add-cargo / remove-cargo / get-current-cargo — the module's `currentCargo`
//     world-setting store (one shared hold, 400 EP default capacity)
//   bookkeeping (1): get-transaction-history
//   currency (3): get-currency / deduct-currency / add-currency — REAL wfrp4e actor money-item
//     writes (coinValue-keyed), ledgered via wfrp-economy `source:'trade'`
//   merchant-generation (1): merchant-generation — narrative-only prices (pricesAreNarrativeOnly);
//     real coin always via calc-purchase-price/calc-sale-price + deduct/add-currency.
//   price-dial (2): get-price-modifiers / set-price-modifiers — GM-tunable multiplier applied
//     post-calcToBp in the two calc actions; stored under the warhammer-mcp namespace (ADR-U10).
//
// All monetary amounts are integer Brass Pennies (BP); 1 GC = 240 BP, 1 SS = 12 BP. The module's
// own cargo store also uses canonical BP (currency-display.js:45-53 identity conversion).
//
// Source of truth: .agents/research/wfrp_economy_system/phase3_pre_plan.md (§Working primitives,
// §Integration seams).

import { z } from 'zod';
import { ActorId } from '../../branded-ids.js';

const season = z.enum(['spring', 'summer', 'autumn', 'winter']);
const quality = z.enum(['poor', 'average', 'good', 'excellent']); // wine/brandy quality tiers
const d100Roll = z.number().int().min(1).max(100); // pre-rolled 1d100 total
const skillValue = z.number().int().min(0).max(100); // WFRP skill target number
const epQuantity = z.number().int().positive(); // Encumbrance Points
const amountBp = z.number().int().positive(); // integer Brass Pennies, > 0
const percentileOverride = z.number().min(1).max(100); // merchant-generation skill-roll override
const priceMultiplier = z.number().positive(); // price-dial multiplier, > 0 (1 = neutral)

export const TradingPlacesInput = z.discriminatedUnion('action', [
  // ── reference data ──────────────────────────────────────────────────────────────
  z.object({ action: z.literal('list-settlements'), region: z.string().min(1).optional() }).strict(),
  z.object({ action: z.literal('list-cargo-types') }).strict(),

  // ── season (CCR-CALENDAR: get derives from the Foundry calendar first) ──────────
  z.object({ action: z.literal('get-season') }).strict(),
  z.object({ action: z.literal('set-season'), season }).strict(),

  // ── market math ─────────────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('check-availability'),
      settlement: z.string().min(1),
      season: season.optional(), // override; defaults to the calendar-derived season
      availabilityRoll: d100Roll, // pre-rolled d100, REQUIRED — the module's internal chat-invisible PRNG never fires (F02, 2026-07-10)
    })
    .strict(),
  z
    .object({
      action: z.literal('calc-purchase-price'),
      cargoName: z.string().min(1),
      quantity: epQuantity,
      quality: quality.optional(),
      season: season.optional(),
      isPartialPurchase: z.boolean().optional(), // +10% partial-purchase penalty
      haggleSuccess: z.boolean().optional(), // outcome of a prior haggle-test
      hasDealmakerTalent: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('calc-sale-price'),
      cargoName: z.string().min(1),
      quantity: epQuantity,
      settlement: z.string().min(1), // sale price is settlement-wealth-keyed
      quality: quality.optional(),
      season: season.optional(),
      haggleSuccess: z.boolean().optional(),
      hasDealmakerTalent: z.boolean().optional(),
    })
    .strict(),

  // ── tests (pre-rolled totals REQUIRED — no roll-free variant exists) ─────────────
  z
    .object({
      action: z.literal('haggle-test'),
      playerSkill: skillValue,
      merchantSkill: skillValue,
      playerRoll: d100Roll,
      merchantRoll: d100Roll,
      hasDealmakerTalent: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('gossip-test'),
      playerSkill: skillValue,
      playerRoll: d100Roll,
      difficulty: z.number().int().optional(), // modifier; module default -10
    })
    .strict(),

  // ── cargo hold (module `currentCargo` world-setting store) ──────────────────────
  z
    .object({
      action: z.literal('add-cargo'),
      cargoName: z.string().min(1),
      quantity: epQuantity,
      totalCostBp: z.number().int().nonnegative(), // canonical BP for the whole lot
      settlement: z.string().min(1),
      category: z.string().min(1).optional(), // resolved from the cargo dataset when omitted
      season: season.optional(), // defaults to the resolved current season
      contraband: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('remove-cargo'),
      cargoId: z.string().min(1).optional(), // handler requires cargoId OR cargoName
      cargoName: z.string().min(1).optional(),
      quantity: epQuantity.optional(), // partial removal; omitted → remove the whole entry
    })
    .strict(),
  z.object({ action: z.literal('get-current-cargo') }).strict(),

  // ── bookkeeping ──────────────────────────────────────────────────────────────────
  z
    .object({ action: z.literal('get-transaction-history'), limit: z.number().int().positive().max(200).optional() })
    .strict(),

  // ── currency (real actor money-item writes; confirm-gate >= 4800 BP in handler) ──
  z.object({ action: z.literal('get-currency'), actorId: ActorId }).strict(),
  z
    .object({
      action: z.literal('deduct-currency'),
      actorId: ActorId,
      amountBp,
      description: z.string().min(1).optional(), // ledger row description
      confirm: z.boolean().optional(), // required when amountBp >= 4800 BP (20 GC)
    })
    .strict(),
  z
    .object({
      action: z.literal('add-currency'),
      actorId: ActorId,
      amountBp,
      description: z.string().min(1).optional(),
      confirm: z.boolean().optional(),
    })
    .strict(),

  // ── merchant generation (wfrp_economy_system Phase 7) — narrative-only prices; real coin ──
  // always routes through calc-purchase-price/calc-sale-price + deduct/add-currency, never this. ──
  z
    .object({
      action: z.literal('merchant-generation'),
      settlement: z.string().min(1),
      cargoType: z.string().min(1),
      merchantType: z.enum(['producer', 'seeker']),
      percentile: percentileOverride.optional(), // overrides the skill roll; omitted → module's own Math.random()
    })
    .strict(),

  // ── price dial (wfrp_economy_system Phase 7) — GM-tunable multiplier applied post-calcToBp; ──
  // stored under the warhammer-mcp namespace (ADR-U10 portability), NOT a trading-places setting. ──
  z.object({ action: z.literal('get-price-modifiers') }).strict(),
  z
    .object({
      action: z.literal('set-price-modifiers'),
      global: priceMultiplier.optional(),
      perCargo: z.record(z.string().min(1), priceMultiplier).optional(),
      reset: z.boolean().optional(), // true restores {global:1, perCargo:{}}, ignoring global/perCargo
    })
    .strict(),
]);

export type TradingPlacesInputType = z.infer<typeof TradingPlacesInput>;
