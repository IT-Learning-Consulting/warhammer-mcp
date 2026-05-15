// Phase 5 mcp_crud_expansion — Shared RegionShape discriminated union (A3).
//
// Region.shapes is an ArrayField<TypedSchemaField> with FOUR shape variants
// (NOT three as plan §1.3 originally claimed — DRIFT-1 from Phase 0 probe).
// Discriminator: `type: StringField` ∈ {rectangle, circle, ellipse, polygon}.
// All variants share `hole: BooleanField` (whether this shape is a cutout).
//
// Lifted from phase5_probes.md §Region — shapesDetail.
// Probe-confirmed 2026-05-15 (Foundry 13.351, world adventures-in-the-warhammer-world).

import { z } from 'zod';

// Common axis fields across all 4 variants — see per-variant overrides.
const RectangleShape = z
  .object({
    type: z.literal('rectangle'),
    hole: z.boolean().optional(),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    rotation: z.number().min(0).max(360).optional(),
  })
  .strict();

const CircleShape = z
  .object({
    type: z.literal('circle'),
    hole: z.boolean().optional(),
    x: z.number(),
    y: z.number(),
    radius: z.number().positive(),
  })
  .strict();

const EllipseShape = z
  .object({
    type: z.literal('ellipse'),
    hole: z.boolean().optional(),
    x: z.number(),
    y: z.number(),
    radiusX: z.number().positive(),
    radiusY: z.number().positive(),
    rotation: z.number().min(0).max(360).optional(),
  })
  .strict();

// Foundry stores polygon points as a flat [x1, y1, x2, y2, ...] NumberField array.
const PolygonShape = z
  .object({
    type: z.literal('polygon'),
    hole: z.boolean().optional(),
    points: z.array(z.number()).min(6), // at least 3 points (6 coordinates)
  })
  .strict();

export const RegionShapeSchema = z.discriminatedUnion('type', [
  RectangleShape,
  CircleShape,
  EllipseShape,
  PolygonShape,
]);

export type RegionShape = z.infer<typeof RegionShapeSchema>;
