// Module Integration v1 Phase 15 — mcp-server typing aid for module-lighting.
//
// CCR-5: server-side schema is a typing aid ONLY — no .strict().
// The foundry-module handler owns .strict() + the actual security gate.

import { z } from 'zod';

export const ModuleLightingToolInput = z.object({
  action: z.enum(['list-animations']),
});

export type ModuleLightingToolInputType = z.infer<typeof ModuleLightingToolInput>;
