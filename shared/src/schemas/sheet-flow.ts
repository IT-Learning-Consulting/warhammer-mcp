// Phase 13 (wfrp_layer_expansion_v1 R16) — sheet-flow primitive schemas: fear/terror
// (design B — reimplement Fear-item creation, skip setupExtendedTest), check-reload
// (checkReloadExtendedTest wrap), add-money / direct-pay (MarketWFRP4e wraps).
// Input schemas use .strict() per CCR-5.

import { z } from 'zod';
import { ActorId, ItemId } from './branded-ids.js';

// apply-fear (manage-character) — also reused for apply-terror (terror always
// inflicts Fear; the Cool-test→Broken cascade is delegated to the sheet + a
// confirm-gated apply-condition follow-up in the skill layer per HC2).
export const ApplyFearInput = z
  .object({
    actorId: ActorId,
    rating: z.number().int().min(1),
    sourceName: z.string().min(1),
  })
  .strict();

// check-reload (manage-inventory) — actor+weapon resolved to ids by the mcp-server
// handler (name-keyed at the umbrella boundary) before this query key is called.
export const CheckReloadInput = z
  .object({
    actorId: ActorId,
    weaponId: ItemId,
  })
  .strict();

// add-money (manage-character) — single-denomination MarketWFRP4e.addMoneyTo format:
// "<amt><b|s|g>" e.g. "5g" / "1.5g" / "12b".
export const AddMoneyInput = z
  .object({
    actorId: ActorId,
    amountString: z.string().min(1),
  })
  .strict();

// direct-pay (manage-character) — multi-denomination MarketWFRP4e.directPayCommand
// format: "8gc6bp" (order-free, localized abbreviations).
export const DirectPayInput = z
  .object({
    actorId: ActorId,
    amountString: z.string().min(1),
  })
  .strict();

export type ApplyFearInput = z.infer<typeof ApplyFearInput>;
export type CheckReloadInput = z.infer<typeof CheckReloadInput>;
export type AddMoneyInput = z.infer<typeof AddMoneyInput>;
export type DirectPayInput = z.infer<typeof DirectPayInput>;
