// Module Integration v1 Phase 5A — mcp-server typing aid for module-tagger.
//
// CCR-5: server-side schema is a typing aid ONLY — no .strict() on variants.
// The foundry-module handler owns .strict() + the actual security gate.
// This schema is used for coercion + TypeScript inference only.

import { z } from 'zod';

const DocRefs = z.union([z.string(), z.array(z.string())]);

export const ModuleTaggerToolInput = z.object({
  action: z.enum(['tag', 'untag', 'query', 'set-tags', 'clear-tags', 'check-tags']),
  uuids: DocRefs.optional(),
  tags: z.array(z.string()).optional(),
  toggle: z.boolean().optional(),
  sceneId: z.string().optional(),
  matchAny: z.boolean().optional(),
  matchExactly: z.boolean().optional(),
  caseInsensitive: z.boolean().optional(),
  allScenes: z.boolean().optional(),
  ignore: z.array(z.string()).optional(),
  objects: z.array(z.string()).optional(),
  applyRules: z.boolean().optional(),
  confirm: z.boolean().optional(),
  check: z.boolean().optional(),
});

export type ModuleTaggerToolInputType = z.infer<typeof ModuleTaggerToolInput>;
