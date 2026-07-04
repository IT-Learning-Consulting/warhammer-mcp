// Common input fields shared across all 25 create-custom-item subtype schemas.
// Every subtype schema.extend()s this base and adds its own discriminator
// (`itemType: z.literal("...")`) plus subtype-specific fields.

import { z } from 'zod';
import { Destination } from './destination.js';
import { ActiveEffectDataSchema } from './effect.js';

export const CreateCustomItemCommon = z.object({
  name: z.string().min(1),
  img: z.string().optional(),
  description: z.string().optional(),
  gmdescription: z.string().optional(),
  fromCompendium: z.string().optional(),
  effects: z.array(ActiveEffectDataSchema).optional(),
  returnFullPayload: z.boolean().optional().default(false),
  destination: Destination,
  systemOverrides: z.record(z.unknown()).optional(),
});

export type CreateCustomItemCommonInput = z.infer<typeof CreateCustomItemCommon>;

// ── Price factory (mcp_code_quality_v2 Phase C2, task 5.3 — D3) ────────────────────────────────
// FACTORY FUNCTION, deliberately NOT a shared Zod instance (zodToJsonSchema emits unresolvable
// `$ref`s for instances referenced from multiple schemas — C2 plan Design Decisions). Each of the
// 9 priced subtype schemas calls this for a fresh, byte-equivalent fragment (was: 9 byte-identical
// local `const Price = z.object({...})` redeclarations).
export function priceFields() {
  return z.object({
    gc: z.number().optional(),
    ss: z.number().optional(),
    bp: z.number().optional(),
  });
}
