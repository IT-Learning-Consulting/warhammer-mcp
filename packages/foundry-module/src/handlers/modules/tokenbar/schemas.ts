// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 9 — package-local Zod schema for module-tokenbar.
//
// CCR-5: module-specific schemas stay package-local (not in @foundry-mcp/shared).
// Single action: change-movement — wraps MonksTokenBarAPI.changeMovement (monks-tokenbar).
// `.strict()` rejects unknown top-level keys.
//
// Source: dossier wfrp-mechanic-delegates.md §4 + §5.
// NOTE: 'ignore' is deliberately NOT a valid movement value — it is only a
// movement-after-combat *setting* sentinel; changeMovement('ignore') is invalid (dossier §4).

import { z } from 'zod';

export const ModuleTokenbarInput = z.discriminatedUnion('action', [
  z
    .object({
      action: z.literal('change-movement'),
      movement: z.enum(['free', 'none', 'combat']),
      // tokens absent → global change; present → per-token override (token UUIDs).
      tokens: z.array(z.string().min(1)).min(1).optional(),
    })
    .strict(),
]);

export type ModuleTokenbarInputType = z.infer<typeof ModuleTokenbarInput>;
