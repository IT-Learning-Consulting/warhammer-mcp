// Module Integration v2 Phase 13A — package-local Zod schema for module-portal (Portal v3.0.4, Posh Rat Games).
//
// CCR-5: module-specific schema stays package-local. Single `.strict()` ZodObject (one action -> a plain
// object schema, not a discriminatedUnion — matches the module-narrator/module-lighting single-action-family
// precedent per [[feedback_single_action_module_umbrella_exhaustiveness]]).
//
// 1 action: spawn. Portal writes to `canvas.scene` ONLY (no sceneId param anywhere in the fluent API) — the
// handler enforces `sceneId` matches the LIVE canvas.scene.id as a strict pre-check (PORTAL_WRONG_SCENE_ACTIVE)
// so a caller targeting a non-viewed scene gets an actionable refusal instead of a silent wrong-scene spawn.
//
// Source of truth: .agents/research/module_integration/phase13_pre_plan.md §13A.

import { z } from 'zod';

export const PORTAL_ACTIONS = ['spawn'] as const;
export type PortalAction = (typeof PORTAL_ACTIONS)[number];

const PortalCreature = z
  .object({
    uuid: z.string().min(1), // Actor UUID (world or compendium) — Portal resolves via Actor.getTokenDocument()
    count: z.number().int().positive().optional(), // default 1
    updateData: z.record(z.string(), z.unknown()).optional(), // per-creature TokenDocument update overrides
  })
  .strict();

export const PortalInput = z
  .object({
    action: z.literal('spawn'),
    sceneId: z.string().min(1), // MUST match the live canvas.scene.id — see PORTAL_WRONG_SCENE_ACTIVE
    creatures: z.array(PortalCreature).min(1),
    x: z.number(),
    y: z.number(),
    elevation: z.number().optional(),
  })
  .strict();

export type PortalInputType = z.infer<typeof PortalInput>;
