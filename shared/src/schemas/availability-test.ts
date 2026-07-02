// wfrp_layer_expansion_v1 Phase 6 (P-10) — availability-test schema.
//
// Single-action primitive (NOT an umbrella). Wraps the WFRP4e market availability
// lookup (MarketWFRP4e.testForAvailability mechanics, wfrp4e.js:556 / availabilityTable
// :21762) WITHOUT rolling — the handler takes a PRE-ROLLED d100 (`rolledTotal`) and,
// for dice-formula stock, a PRE-ROLLED stock total (`stockRolled`). HC2: the d100 is a
// sheet/GM roll; the thin primitive never calls `new Roll(...)`.
//
// The handler posts a GM-visible market-result ChatMessage (the verifiable write per
// Q&A #1) and returns structuredContent. No actor/item mutation.

import { z } from 'zod';

// Friendly enums map to the WFRP4e config's localization-keyed table internally
// (village → "MARKET.Village", common → "WFRP4E.Availability.Common", etc.) so callers
// never hand-type a localization key.
export const AvailabilitySettlement = z.enum(['village', 'town', 'city']);
export type AvailabilitySettlement = z.infer<typeof AvailabilitySettlement>;

export const AvailabilityRarity = z.enum(['common', 'scarce', 'rare', 'exotic']);
export type AvailabilityRarity = z.infer<typeof AvailabilityRarity>;

export const AvailabilityTestInput = z
  .object({
    settlement: AvailabilitySettlement.describe(
      'Settlement size: village | town | city. Mapped to the WFRP4e availabilityTable internally.',
    ),
    rarity: AvailabilityRarity.describe(
      'Item rarity: common | scarce | rare | exotic. Exotic is never available (test target 0).',
    ),
    rolledTotal: z
      .number()
      .int()
      .min(1)
      .max(100)
      .describe(
        'The PRE-ROLLED d100 Availability Test total (already modified). HC2: the sheet/GM rolls — this tool never rolls. Item is available when test target > 0 and rolledTotal <= target.',
      ),
    stockRolled: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe(
        'Pre-rolled stock quantity. REQUIRED only when the looked-up stock is a dice formula (e.g. Town stock "2d10"/"1d10"/"1d5"). Static numeric stock and the City "∞" passthrough ignore it.',
      ),
    itemName: z
      .string()
      .min(1)
      .optional()
      .describe('Optional item name, used as the chat-card flavor (e.g. "Hand Weapon").'),
  })
  .strict();

export type AvailabilityTestInputType = z.infer<typeof AvailabilityTestInput>;

// ── Response ──────────────────────────────────────────────────────────────────

export interface AvailabilityTestResponse {
  settlement: AvailabilitySettlement;
  rarity: AvailabilityRarity;
  /** The pre-rolled d100 echoed back. */
  rolledTotal: number;
  /** The looked-up availability test target (0 for exotic / non-stocked). */
  targetNumber: number;
  /** test > 0 && rolledTotal <= test. */
  isAvailable: boolean;
  /** Resolved stock: numeric quantity, the literal "∞" for cities, or 0 when unavailable. */
  quantity: number | string;
  /** ID of the posted GM market-result ChatMessage (the verifiable write). */
  messageId: string;
}
