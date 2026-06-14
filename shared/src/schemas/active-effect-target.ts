// Phase 4 mcp_coverage_expansion: AE-only target union.
// Widens the four AE tools (add/update/delete/get-by-name) to accept an actor-direct
// scope, enabling one-off effects directly on actors without a carrier item.
//
// Design: new AE-local union (not a widening of shared ItemTarget) so the
// actor-direct scope is not exposed to item tools (manage-inventory etc.) that
// import ItemTarget.  The existing scope:'actor' (item-on-actor) and scope:'world'
// branches are reused byte-for-byte for back-compat.
//
// Note: z.discriminatedUnion cannot contain z.ZodEffects members (Zod constraint).
// We use z.union here and apply a top-level refine for the actor-direct branch.
// The discriminant check (unknown scope) is handled by the union parse failure.

import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// HC8 EXCEPTION (Phase 1 branded-IDs): the actorId/itemId fields below feed
// `zodToJsonSchema(ActiveEffectTarget, ...)` which IS the published wire inputSchema.
// Branding them is wire-visible — the brand's `.min(1)` injects `minLength:1` (these were
// bare `z.string()`) and reusing one brand instance across branches makes zod-to-json-schema
// emit an unresolvable `$ref`. Both would break HC8 byte-identical. So these stay UNBRANDED.
// (The handler-side branding of AE ids happens via the response DTOs, not here.)

// Reuse the ItemTarget's existing branches verbatim — back-compat for all
// existing item-AE writes (scope:'actor'+itemId and scope:'world'+itemId).
const ActorTarget = z
  .object({
    scope: z.literal('actor'),
    actorId: z.string().optional(),
    actorName: z.string().optional(),
    itemId: z.string().optional(),
    itemName: z.string().optional(),
  })
  .strict();

const WorldTarget = z
  .object({
    scope: z.literal('world'),
    itemId: z.string().optional(),
    itemName: z.string().optional(),
  })
  .strict();

// New branch: effect lives directly on the actor (no carrier item required).
const ActorDirectTargetBase = z
  .object({
    scope: z.literal('actor-direct'),
    actorId: z.string().optional(),
    actorName: z.string().optional(),
  })
  .strict();

// Refine enforces that at least one identifier is supplied.
// Applied at the union level for discriminated parsing, then the refine fires.
export const ActiveEffectTarget = z
  .union([ActorTarget, WorldTarget, ActorDirectTargetBase])
  .superRefine((val, ctx) => {
    if (val.scope === 'actor-direct' && !val.actorId && !val.actorName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'actor-direct target requires actorId or actorName',
        path: [],
      });
    }
  });

export type ActiveEffectTargetInput = z.infer<typeof ActiveEffectTarget>;

// JSON-Schema fragment generated once at module load.
// Spread into the 4 AE tool inputSchema.properties.target fields.
export const ACTIVE_EFFECT_TARGET_JSON_SCHEMA = zodToJsonSchema(ActiveEffectTarget, {
  target: 'jsonSchema7',
});
