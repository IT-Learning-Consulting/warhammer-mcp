// Phase 4b — combat + damage primitive schemas (master D2, D3, D5).
// Input schemas use .strict() per CCR-5.

import { z } from 'zod';

// Shared id aliases
export const CombatId = z.string();
export const CombatantId = z.string();
export const ActorId = z.string();

// manage-combat inputs (6)

export const GetCombatInput = z
  .object({
    combatId: z.string().optional(),
  })
  .strict();

export const ListCombatantsInput = z
  .object({
    combatId: z.string().optional(),
  })
  .strict();

export const AdvanceCombatInput = z
  .object({
    combatId: z.string().optional(),
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
    combatId: z.string().optional(),
    actorIds: z.array(z.string()).min(1),
    sceneId: z.string().optional(),
  })
  .strict();

export const RemoveCombatantsInput = z
  .object({
    combatId: z.string().optional(),
    combatantIds: z.array(z.string()).min(1),
  })
  .strict();

export const EndCombatInput = z
  .object({
    combatId: z.string().optional(),
  })
  .strict();

// apply-damage input

export const ApplyDamageInput = z
  .object({
    actorId: z.string(),
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

export const StatusSnapshot = z.object({
  wounds: z.object({ value: z.number(), max: z.number() }),
  criticalWounds: z.object({ value: z.number(), max: z.number() }),
  fate: z.object({ value: z.number() }),
  fortune: z.object({ value: z.number() }),
  advantage: z.object({ value: z.number() }),
  conditions: z.array(z.string()),
});

export const ApplyDamageOutput = z.object({
  actorId: z.string(),
  damage: z.object({
    amount: z.number(),
    damageType: z.string(),
    hitLocation: z.string().optional(),
  }),
  before: StatusSnapshot,
  after: StatusSnapshot,
});

export type GetCombatInput = z.infer<typeof GetCombatInput>;
export type ListCombatantsInput = z.infer<typeof ListCombatantsInput>;
export type AdvanceCombatInput = z.infer<typeof AdvanceCombatInput>;
export type AddCombatantsInput = z.infer<typeof AddCombatantsInput>;
export type RemoveCombatantsInput = z.infer<typeof RemoveCombatantsInput>;
export type EndCombatInput = z.infer<typeof EndCombatInput>;
export type ApplyDamageInput = z.infer<typeof ApplyDamageInput>;
export type StatusSnapshot = z.infer<typeof StatusSnapshot>;
export type ApplyDamageOutput = z.infer<typeof ApplyDamageOutput>;
