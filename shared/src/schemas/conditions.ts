// Phase 4b — conditions + active-effects primitive schemas.
// Input schemas use .strict() per CCR-5.

import { z } from 'zod';

// Static list mirroring CONFIG.WFRP4E.conditions. Handler-side also validates
// against live CONFIG.WFRP4E.conditions keys to catch system drift.
export const ConditionKey = z.enum([
  'ablaze',
  'bleeding',
  'blinded',
  'broken',
  'deafened',
  'entangled',
  'fatigued',
  'poisoned',
  'prone',
  'stunned',
  'surprised',
  'unconscious',
  'dead',
  'stuffed',
  'grappled',
  'engaged',
  'defeated',
]);

export const ApplyConditionInput = z
  .object({
    actorId: z.string(),
    conditionKey: ConditionKey,
    value: z.number().int().min(1).optional().default(1),
  })
  .strict();

export const RemoveConditionInput = z
  .object({
    actorId: z.string(),
    conditionKey: ConditionKey,
    count: z.number().int().min(1).optional().default(1),
  })
  .strict();

export const ListConditionsInput = z
  .object({
    actorId: z.string(),
  })
  .strict();

export const ListActiveEffectsInput = z
  .object({
    actorId: z.string(),
    filter: z
      .enum(['all', 'applied', 'temporary', 'conditions'])
      .optional()
      .default('all'),
  })
  .strict();

// Projection returned by list-active-effects (research §2.4 — full AE is heavy)
export const ActiveEffectProjection = z.object({
  id: z.string(),
  name: z.string(),
  img: z.string().nullable(),
  statuses: z.array(z.string()),
  disabled: z.boolean(),
  duration: z
    .object({
      rounds: z.number().nullable(),
      turns: z.number().nullable(),
      seconds: z.number().nullable(),
    })
    .partial(),
  origin: z.string().nullable(),
  changes: z.array(
    z.object({
      key: z.string(),
      mode: z.number(),
      value: z.string(),
      priority: z.number().nullable(),
    }),
  ),
});

export type ConditionKey = z.infer<typeof ConditionKey>;
export type ApplyConditionInput = z.infer<typeof ApplyConditionInput>;
export type RemoveConditionInput = z.infer<typeof RemoveConditionInput>;
export type ListConditionsInput = z.infer<typeof ListConditionsInput>;
export type ListActiveEffectsInput = z.infer<typeof ListActiveEffectsInput>;
export type ActiveEffectProjection = z.infer<typeof ActiveEffectProjection>;
