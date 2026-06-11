// Module Integration v1 Phase 8 — mcp-server-side typing aid for module-autoanimations.
//
// CCR-5: the foundry-module handler owns the authoritative `.strict()` discriminated
// union + the security gate. This server-side schema is a flat typing aid only.

import { z } from 'zod';

export const ModuleAutoAnimationsToolInput = z.object({
  action: z.enum([
    'get-item-animation',
    'set-item-animation',
    'clear-item-animation',
    'list-animations',
    'get-autorec',
    'merge-autorec-entry',
    'play-animation',
  ]),
  uuid: z.string().optional(),
  animation: z.record(z.unknown()).optional(),
  confirmedMacro: z.boolean().optional(),
  dbSection: z.string().optional(),
  menuType: z.string().optional(),
  category: z.string().optional(),
  label: z.string().optional(),
  sourceTokenUuid: z.string().optional(),
  itemUuid: z.string().optional(),
  itemName: z.string().optional(),
  targetUuids: z.array(z.string()).optional(),
  confirm: z.boolean().optional(),
});

export type ModuleAutoAnimationsToolInputType = z.infer<typeof ModuleAutoAnimationsToolInput>;
