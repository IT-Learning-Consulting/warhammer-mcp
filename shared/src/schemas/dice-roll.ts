// Phase 2 mcp_coverage_expansion — dice-roll tool schema.
//
// GM-side immediate formula evaluation over Foundry v13 `Roll`, distinct from the
// interactive `request-player-rolls` workflow (which posts clickable player buttons).
//
// 3 actions:
//   roll      — evaluate a formula; optional actor roll-data + ChatMessage post.
//   validate  — Roll.validate(formula) → boolean (no evaluation).
//   simulate  — Roll.simulate(formula, n) → distribution stats (n capped at 1000).
//
// Thin primitive (HC1 / CCR-3): no CONFIG.WFRP4E, no rule logic. Actor-aware
// formulas read actor.getRollData() ONLY — never raw actor.system (Risk 2.A).

import { z } from 'zod';

const FOUNDRY_ID = z.string().min(1);

// Foundry roll visibility modes (CONFIG.Dice.rollModes keys).
const ROLL_MODES = ['publicroll', 'gmroll', 'blindroll', 'selfroll'] as const;

// Minimal speaker projection for createMessage. All ids optional; when omitted the
// handler falls back to ChatMessage.getSpeaker() (or getSpeaker({actor}) when actorId set).
const DiceRollSpeakerInput = z
  .object({
    alias: z.string().optional(),
    actor: FOUNDRY_ID.optional(),
    token: FOUNDRY_ID.optional(),
    scene: FOUNDRY_ID.optional(),
  })
  .strict();

export const DiceRollRollInput = z
  .object({
    action: z.literal('roll'),
    formula: z.string().min(1),
    actorId: FOUNDRY_ID.optional(),
    createMessage: z.boolean().optional(),
    rollMode: z.enum(ROLL_MODES).optional(),
    flavor: z.string().optional(),
    speaker: DiceRollSpeakerInput.optional(),
  })
  .strict();

export const DiceRollValidateInput = z
  .object({
    action: z.literal('validate'),
    formula: z.string().min(1),
  })
  .strict();

export const DiceRollSimulateInput = z
  .object({
    action: z.literal('simulate'),
    formula: z.string().min(1),
    // R2.3: cap at 1000 — strict reject (NOT silent clamp). 10000 totals bloat the
    // response; summary stats let callers skip iterating the raw array.
    n: z.number().int().min(1).max(1000),
  })
  .strict();

export const DiceRollToolInput = z.discriminatedUnion('action', [
  DiceRollRollInput,
  DiceRollValidateInput,
  DiceRollSimulateInput,
]);

export type DiceRollToolInputType = z.infer<typeof DiceRollToolInput>;
export type DiceRollRollInputType = z.infer<typeof DiceRollRollInput>;
export type DiceRollValidateInputType = z.infer<typeof DiceRollValidateInput>;
export type DiceRollSimulateInputType = z.infer<typeof DiceRollSimulateInput>;
