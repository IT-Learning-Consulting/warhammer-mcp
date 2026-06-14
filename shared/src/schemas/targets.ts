import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// HC8 EXCEPTION (Phase 1 branded-IDs): actorId/itemId below feed the
// `ACTOR_TARGET_JSON_SCHEMA` / `ITEM_TARGET_JSON_SCHEMA` zodToJsonSchema fragments that are
// spread into published tool inputSchemas. Branding is wire-visible here (brand `.min(1)`
// injects `minLength:1` over the original bare `z.string()`, and instance reuse emits a
// `$ref`), which would break HC8 byte-identical. So these stay UNBRANDED.

// ActorTarget — an actor on the world (by id OR name)
export const actorTargetSchema = z.object({
  actorId: z.string().optional(),
  actorName: z.string().optional(),
}).strict().refine(
  (v) => !!(v.actorId || v.actorName),
  { message: 'actorId or actorName is required' }
);

// ItemTarget — scope=actor or scope=world
const actorItemTargetBranch = z.object({
  scope: z.literal('actor'),
  actorId: z.string().optional(),
  actorName: z.string().optional(),
  itemId: z.string().optional(),
  itemName: z.string().optional(),
}).strict();

const worldItemTargetBranch = z.object({
  scope: z.literal('world'),
  itemId: z.string().optional(),
  itemName: z.string().optional(),
}).strict();

export const itemTargetSchema = z.discriminatedUnion('scope', [
  actorItemTargetBranch,
  worldItemTargetBranch,
]);

// JSON-Schema fragments generated once at module load.
// Spread into a tool's inputSchema.properties / required where needed.
export const ACTOR_TARGET_JSON_SCHEMA = zodToJsonSchema(actorTargetSchema, { target: 'jsonSchema7' });
export const ITEM_TARGET_JSON_SCHEMA = zodToJsonSchema(itemTargetSchema, { target: 'jsonSchema7' });
