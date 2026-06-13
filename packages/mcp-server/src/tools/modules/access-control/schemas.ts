// Module Integration v1 Phase 7 — module-access-control mcp-server schema (typing aid).
//
// CCR-5: real validation lives in the foundry-module discriminated union. The server
// side is a thin typing aid only — no .strict().

import { z } from 'zod';

export const ModuleAccessControlServerInput = z.object({
  action: z.string(),
});

export type ModuleAccessControlServerInputType = z.infer<typeof ModuleAccessControlServerInput>;
