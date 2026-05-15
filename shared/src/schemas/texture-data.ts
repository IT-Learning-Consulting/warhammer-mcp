// Phase 5 mcp_crud_expansion — Shared TextureData sub-schema (A2).
//
// TextureData is a Foundry TextureData class used identically by:
//   - Token.texture  (token sprite image)
//   - Note.texture   (map-pin icon image)
//   - Tile.texture   (placed tile image / video)
//
// Probe-confirmed identical sub-fields across all three consumers
// (phase5_probes.md §Token, §Note, §Tile — A2 shared-schema decision validated).
//
// NOTE: MeasuredTemplate.texture is a bare FilePathField (string), NOT TextureData.
// Do NOT use this schema for MeasuredTemplate.
//
// CCR-Schema-Fidelity: 11 sub-fields per Probe A; only `src` is nullable.

import { z } from 'zod';

export const TextureDataSchema = z
  .object({
    src: z.string().nullable().optional(),
    anchorX: z.number().optional(),
    anchorY: z.number().optional(),
    offsetX: z.number().optional(),
    offsetY: z.number().optional(),
    fit: z.string().optional(), // "contain" | "cover" | "fill" | "width" | "height"
    scaleX: z.number().optional(),
    scaleY: z.number().optional(),
    rotation: z.number().min(0).max(360).optional(),
    tint: z.string().optional(),
    alphaThreshold: z.number().min(0).max(1).optional(),
  })
  .strict();

export type TextureData = z.infer<typeof TextureDataSchema>;
