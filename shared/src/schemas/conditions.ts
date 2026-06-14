// Phase 4b — conditions + active-effects primitive schemas.
// Input schemas use .strict() per CCR-5.

import { z } from 'zod';
import { ActorId } from './branded-ids.js';

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
    actorId: ActorId,
    conditionKey: ConditionKey,
    value: z.number().int().min(1).optional().default(1),
  })
  .strict();

export const RemoveConditionInput = z
  .object({
    actorId: ActorId,
    conditionKey: ConditionKey,
    count: z.number().int().min(1).optional().default(1),
  })
  .strict();

export const ListConditionsInput = z
  .object({
    actorId: ActorId,
  })
  .strict();

// TOOL-IDEA-002 (2026-05-14): `includeItemAEs` opts in to surfacing AEs attached to
// the actor's embedded items (e.g. weapon-AEs on Camila's Dagger). Default false to
// preserve back-compat — callers that ignore the projection's new `parentType` field
// still work because actor-level AEs come back as before.
export const ListActiveEffectsInput = z
  .object({
    actorId: ActorId,
    filter: z
      .enum(['all', 'applied', 'temporary', 'conditions'])
      .optional()
      .default('all'),
    includeItemAEs: z.boolean().optional().default(false),
  })
  .strict();

// Projection returned by list-active-effects (research §2.4 — full AE is heavy)
// TOOL-IDEA-002 (2026-05-14): added parentType/parentId/parentName so a flat single-array
// result can disambiguate actor-level vs item-level AEs without nesting.
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
  parentType: z.enum(['Actor', 'Item']).optional(),
  parentId: z.string().optional(), // polymorphic: not branded (Phase 1 design)
  parentName: z.string().optional(),
});

export type ConditionKey = z.infer<typeof ConditionKey>;
export type ApplyConditionInput = z.infer<typeof ApplyConditionInput>;
export type RemoveConditionInput = z.infer<typeof RemoveConditionInput>;
export type ListConditionsInput = z.infer<typeof ListConditionsInput>;
export type ListActiveEffectsInput = z.infer<typeof ListActiveEffectsInput>;
export type ActiveEffectProjection = z.infer<typeof ActiveEffectProjection>;
