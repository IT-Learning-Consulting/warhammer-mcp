// Phase 4b — combat + damage primitive schemas (master D2, D3, D5).
// Input schemas use .strict() per CCR-5.

import { z } from 'zod';
import { ActorId, CombatId, CombatantId, SceneId } from './branded-ids.js';

// manage-combat inputs (6)

export const GetCombatInput = z
  .object({
    combatId: CombatId.optional(),
  })
  .strict();

export const ListCombatantsInput = z
  .object({
    combatId: CombatId.optional(),
  })
  .strict();

export const AdvanceCombatInput = z
  .object({
    combatId: CombatId.optional(),
    action: z.enum([
      'start',
      'next',
      'prev',
      'nextRound',
      'prevRound',
      'rollAll',
      'rollNPC',
    ]),
  })
  .strict();

export const AddCombatantsInput = z
  .object({
    combatId: CombatId.optional(),
    actorIds: z.array(ActorId).min(1),
    sceneId: SceneId.optional(),
  })
  .strict();

export const RemoveCombatantsInput = z
  .object({
    combatId: CombatId.optional(),
    combatantIds: z.array(CombatantId).min(1),
  })
  .strict();

export const EndCombatInput = z
  .object({
    combatId: CombatId.optional(),
  })
  .strict();

// apply-damage input

export const ApplyDamageInput = z
  .object({
    actorId: ActorId,
    amount: z.number().int().nonnegative(),
    damageType: z
      .enum(['NORMAL', 'IGNORE_AP', 'IGNORE_TB', 'IGNORE_ALL'])
      .optional()
      .default('NORMAL'),
    hitLocation: z
      .enum(['head', 'body', 'rArm', 'lArm', 'rLeg', 'lLeg'])
      .optional(),
  })
  .strict();

// Status snapshot (master D5)

// Phase 11 (R11.1): resilience/resolve added + `.passthrough()` so the generated
// apply-damage `outputSchema` faithfully describes (and does not forbid) the full
// status snapshot the handler returns. The snapshot characterization shows all 8
// pools present; `.passthrough()` keeps it forward-compatible against future fields.
// Phase 11 fix (BUG-390): wounds is the only pool present on EVERY actor type;
// fate/fortune/resilience/resolve are character-only (absent on npc/creature), and
// the snapshot may carry undefined leaf values for missing pools. Only `wounds` is
// required (and even its leaves optional); the rest are optional + `.passthrough()`
// so apply-damage `.parse()` never throws regardless of the damaged actor's type.
export const StatusSnapshot = z.object({
  wounds: z.object({ value: z.number().optional(), max: z.number().optional() }).passthrough(),
  criticalWounds: z.object({ value: z.number().optional(), max: z.number().optional() }).passthrough().optional(),
  fate: z.object({ value: z.number().optional() }).passthrough().optional(),
  fortune: z.object({ value: z.number().optional() }).passthrough().optional(),
  resilience: z.object({ value: z.number().optional() }).passthrough().optional(),
  resolve: z.object({ value: z.number().optional() }).passthrough().optional(),
  advantage: z.object({ value: z.number().optional() }).passthrough().optional(),
  conditions: z.array(z.string()).optional(),
}).passthrough();

export const ApplyDamageOutput = z.object({
  actorId: z.string(),
  damage: z.object({
    amount: z.number(),
    damageType: z.string(),
    hitLocation: z.string().optional(),
  }).passthrough(),
  before: StatusSnapshot,
  after: StatusSnapshot,
}).passthrough();

export type GetCombatInput = z.infer<typeof GetCombatInput>;
export type ListCombatantsInput = z.infer<typeof ListCombatantsInput>;
export type AdvanceCombatInput = z.infer<typeof AdvanceCombatInput>;
export type AddCombatantsInput = z.infer<typeof AddCombatantsInput>;
export type RemoveCombatantsInput = z.infer<typeof RemoveCombatantsInput>;
export type EndCombatInput = z.infer<typeof EndCombatInput>;
export type ApplyDamageInput = z.infer<typeof ApplyDamageInput>;
export type StatusSnapshot = z.infer<typeof StatusSnapshot>;
export type ApplyDamageOutput = z.infer<typeof ApplyDamageOutput>;
