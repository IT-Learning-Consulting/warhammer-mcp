import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

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
