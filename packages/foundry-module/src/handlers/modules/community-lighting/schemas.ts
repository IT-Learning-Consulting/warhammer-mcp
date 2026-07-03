// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 15 — package-local Zod schema for module-lighting (CommunityLighting).
//
// CCR-5: module-specific schemas stay package-local (not in @foundry-mcp/shared).
// Single read-only action: list-animations (reads CONFIG.Canvas.lightAnimations).
// `.strict()` rejects unknown top-level keys.
//
// NOTE (single-member union): this is a 1-member discriminatedUnion. The dispatcher MUST
// use a plain default branch — NOT `const _x: never = parsed` — because a 1-member union
// is not a real union and the never-exhaustiveness check fails tsc.
// See [[feedback_single_action_module_umbrella_exhaustiveness]].

import { z } from 'zod';

export const ModuleLightingInput = z.discriminatedUnion('action', [
  // list-animations — reads CONFIG.Canvas.lightAnimations; no inputs beyond the action.
  z.object({
    action: z.literal('list-animations'),
  }).strict(),
]);

export type ModuleLightingInputType = z.infer<typeof ModuleLightingInput>;
