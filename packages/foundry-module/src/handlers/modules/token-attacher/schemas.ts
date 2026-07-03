// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v2 Phase 3A — package-local Zod schema for module-token-attacher
// (Token Attacher v4.6.12, KayelGee).
//
// CCR-5: module-specific schemas stay package-local (not in @foundry-mcp/shared). `.strict()` on
// every top-level action variant rejects unknown keys.
//
// 5 actions over the verified server-reachable surface (capability_audit/token-attacher.md):
//   attach          — bind one/more canvas placeables to a base token (canvas-mandatory).
//   detach          — unbind specific placeables from a base token (canvas-mandatory).
//   detach-all      — clear the entire attached map on a base token (canvas-mandatory).
//   query-attached  — read flags.token-attacher.attached (headless flag read, no canvas).
//   query-by-type   — read flags.token-attacher.attached[<type>] (headless flag read, no canvas).
//
// attach/detach/detach-all resolve token/element IDs → live placeables via canvas before calling
// window.tokenAttacher.* (the API reads PlaceableObject props — _AttachToToken token-attacher.js:953-998),
// so the handler guards `canvas?.ready` and returns TOKEN_ATTACHER_CANVAS_NOT_READY when down.
// query-* are pure getFlag reads (token-attacher.js:1449-1455) — no canvas render needed.
//
// Element types are the registered TA layer document names (token-attacher.js:282-284 + core.js:195
// Region shim): AmbientLight / AmbientSound / Drawing / MeasuredTemplate / Note / Tile / Token / Wall / Region.
//
// discriminatedUnion variants MUST be plain ZodObjects — a `.refine()` yields ZodEffects which the union
// rejects (carry-forward §4). Cross-field rules live in the handler body (none needed here).
//
// Source of truth: .agents/research/module_integration/phase3_pre_plan.md §3A +
// capability_audit/token-attacher.md (§API Methods, §Flag/Data Model, §Registered Layer Types).

import { z } from 'zod';

// The registered Token Attacher layer document types (capability_audit token-attacher.md:88, 149, 253).
export const TA_ELEMENT_TYPES = [
  'AmbientLight',
  'AmbientSound',
  'Drawing',
  'MeasuredTemplate',
  'Note',
  'Tile',
  'Token',
  'Wall',
  'Region',
] as const;

const ElementType = z.enum(TA_ELEMENT_TYPES);

// A single attach/detach target: a canvas placeable addressed by its document type + embedded id.
const ElementRef = z
  .object({
    type: ElementType,
    id: z.string().min(1, 'element id is required'),
  })
  .strict();

export const TokenAttacherInput = z.discriminatedUnion('action', [
  z
    .object({
      action: z.literal('attach'),
      baseTokenId: z.string().min(1, 'baseTokenId is required (the base Token placeable id on the scene)'),
      // Scene that owns the token + elements. Defaults to the active scene in the handler when omitted.
      sceneId: z.string().min(1).optional(),
      elements: z.array(ElementRef).min(1, 'at least one element is required'),
    })
    .strict(),
  z
    .object({
      action: z.literal('detach'),
      baseTokenId: z.string().min(1, 'baseTokenId is required'),
      sceneId: z.string().min(1).optional(),
      elements: z.array(ElementRef).min(1, 'at least one element is required'),
    })
    .strict(),
  z
    .object({
      action: z.literal('detach-all'),
      baseTokenId: z.string().min(1, 'baseTokenId is required'),
      sceneId: z.string().min(1).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('query-attached'),
      baseTokenId: z.string().min(1, 'baseTokenId is required'),
      sceneId: z.string().min(1).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('query-by-type'),
      baseTokenId: z.string().min(1, 'baseTokenId is required'),
      sceneId: z.string().min(1).optional(),
      type: ElementType,
    })
    .strict(),
]);

export type TokenAttacherInputType = z.infer<typeof TokenAttacherInput>;
