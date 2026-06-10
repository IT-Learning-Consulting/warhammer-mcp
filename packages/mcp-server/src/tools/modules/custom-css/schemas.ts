// Module Integration v1 Phase 13A — mcp-server typing aid for module-css.
//
// CCR-5: server-side schema is a typing aid ONLY — no .strict() on variants.
// The foundry-module handler owns .strict() + the actual security gate.

import { z } from 'zod';

export const ModuleCssToolInput = z.object({
  action: z.enum(['get', 'set', 'append', 'reset']),
  css: z.string().optional(),
  includeUserStylesheet: z.boolean().optional(),
  userStylesheet: z.string().optional(),
  separator: z.string().optional(),
});

export type ModuleCssToolInputType = z.infer<typeof ModuleCssToolInput>;
