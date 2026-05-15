// Phase 5 mcp_crud_expansion — Shared LightData sub-schema (A1).
//
// LightData is a Foundry EmbeddedDataField used identically by:
//   - Token.light       (token sprite emits light)
//   - AmbientLight.config  (placed AmbientLight on the scene)
//
// Both consumers reference the same `LightData` model with 15 fields.
// Lifted from phase5_probes.md §Token (`light` field) + §AmbientLight (`config` field).
// Probe-confirmed 2026-05-15 (Foundry 13.351); A1 shared-schema decision validated.
//
// CCR-Schema-Fidelity: field paths mirror Foundry defineSchema 1:1.
// Every field is .optional() so the same shape serves create + update.

import { z } from 'zod';

// animation: SchemaField — light animation parameters.
const LightAnimationInput = z
  .object({
    type: z.string().nullable().optional(), // e.g. "torch", "pulse"; nullable for "no animation"
    speed: z.number().int().min(0).max(10).optional(),
    intensity: z.number().int().min(0).max(10).optional(),
    reverse: z.boolean().optional(),
  })
  .strict();

// darkness: SchemaField — activation range over global darkness level.
// min/max are AlphaField (0..1). When darkness in [min, max], the light is active.
const LightDarknessInput = z
  .object({
    min: z.number().min(0).max(1).optional(),
    max: z.number().min(0).max(1).optional(),
  })
  .strict();

export const LightDataSchema = z
  .object({
    negative: z.boolean().optional(),
    priority: z.number().int().optional(),
    alpha: z.number().min(0).max(1).optional(),
    angle: z.number().min(0).max(360).optional(),
    bright: z.number().optional(),
    color: z.string().nullable().optional(),
    coloration: z.number().int().nullable().optional(),
    dim: z.number().optional(),
    attenuation: z.number().min(0).max(1).optional(),
    luminosity: z.number().optional(),
    saturation: z.number().optional(),
    contrast: z.number().optional(),
    shadows: z.number().optional(),
    animation: LightAnimationInput.optional(),
    darkness: LightDarknessInput.optional(),
  })
  .strict();

export type LightData = z.infer<typeof LightDataSchema>;
