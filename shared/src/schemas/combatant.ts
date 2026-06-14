// Phase 3 mcp_coverage_expansion — combatant umbrella schema.
//
// Per-combatant control beside the untouched flat manage-combat surface
// (get-combat / list-combatants / advance-combat / add-combatants /
// remove-combatants / end-combat). 7 actions:
//   get-combatant      — read one combatant's fields (no write).
//   update-combatant   — write allow-list {name, img, flags, hidden, defeated}; REJECTS initiative.
//   set-initiative     — literal number via Combat.setInitiative (turn-pointer stable).
//   clear-initiative   — combatant.update({initiative: null}) (setInitiative is non-nullable).
//   reroll-initiative  — Combat#rollInitiative([id], {formula, updateTurn:true}); posts a roll message.
//   set-hidden         — boolean toggle.
//   set-defeated       — boolean toggle (core auto-applies the token defeated overlay).
//
// Thin primitive (HC1 / CCR-3): no CONFIG reads, no game-rule logic. Initiative is
// rejected from update-combatant because raw combatant.update({initiative}) bypasses
// Combat.setInitiative's turn-order maintenance and corrupts the current-turn pointer.

import { z } from 'zod';
import { CombatantId, CombatId } from './branded-ids.js';

// update-combatant writable allow-list — exactly the safe BaseCombatant.defineSchema()
// fields. .strict() rejects everything else (actorId/tokenId/sceneId FKs, type, system,
// group, and crucially `initiative` — routed to the dedicated set/clear/reroll actions).
const CombatantUpdateChanges = z
  .object({
    name: z.string().optional(),
    img: z.string().optional(),
    flags: z.record(z.unknown()).optional(),
    hidden: z.boolean().optional(),
    defeated: z.boolean().optional(),
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'COMBATANT_EMPTY_PAYLOAD: changes must contain at least one of {name, img, flags, hidden, defeated}',
  });

export const CombatantGetInput = z
  .object({
    action: z.literal('get-combatant'),
    combatantId: CombatantId,
    combatId: CombatId.optional(),
  })
  .strict();

export const CombatantUpdateInput = z
  .object({
    action: z.literal('update-combatant'),
    combatantId: CombatantId,
    combatId: CombatId.optional(),
    changes: CombatantUpdateChanges,
  })
  .strict();

export const CombatantSetInitiativeInput = z
  .object({
    action: z.literal('set-initiative'),
    combatantId: CombatantId,
    combatId: CombatId.optional(),
    // Literal number only. Formula-based initiative is owned by reroll-initiative;
    // a second formula entry point here would be a redundant path.
    value: z.number(),
  })
  .strict();

export const CombatantClearInitiativeInput = z
  .object({
    action: z.literal('clear-initiative'),
    combatantId: CombatantId,
    combatId: CombatId.optional(),
  })
  .strict();

export const CombatantRerollInitiativeInput = z
  .object({
    action: z.literal('reroll-initiative'),
    combatantId: CombatantId,
    combatId: CombatId.optional(),
    // Optional override; omit to use the system's default initiative formula.
    formula: z.string().min(1).optional(),
  })
  .strict();

export const CombatantSetHiddenInput = z
  .object({
    action: z.literal('set-hidden'),
    combatantId: CombatantId,
    combatId: CombatId.optional(),
    hidden: z.boolean(),
  })
  .strict();

export const CombatantSetDefeatedInput = z
  .object({
    action: z.literal('set-defeated'),
    combatantId: CombatantId,
    combatId: CombatId.optional(),
    defeated: z.boolean(),
  })
  .strict();

export const CombatantToolInput = z.discriminatedUnion('action', [
  CombatantGetInput,
  CombatantUpdateInput,
  CombatantSetInitiativeInput,
  CombatantClearInitiativeInput,
  CombatantRerollInitiativeInput,
  CombatantSetHiddenInput,
  CombatantSetDefeatedInput,
]);

export type CombatantToolInputType = z.infer<typeof CombatantToolInput>;
export type CombatantGetInputType = z.infer<typeof CombatantGetInput>;
export type CombatantUpdateInputType = z.infer<typeof CombatantUpdateInput>;
export type CombatantSetInitiativeInputType = z.infer<typeof CombatantSetInitiativeInput>;
export type CombatantClearInitiativeInputType = z.infer<typeof CombatantClearInitiativeInput>;
export type CombatantRerollInitiativeInputType = z.infer<typeof CombatantRerollInitiativeInput>;
export type CombatantSetHiddenInputType = z.infer<typeof CombatantSetHiddenInput>;
export type CombatantSetDefeatedInputType = z.infer<typeof CombatantSetDefeatedInput>;
