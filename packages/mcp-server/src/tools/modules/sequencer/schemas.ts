// Module Integration v1 Phase 5B — mcp-server typing aid for module-sequencer.
//
// CCR-5: server-side schema is a typing aid only — no .strict() on variants.
// The foundry-module handler owns .strict() + the macro-guard + security gate.

import { z } from 'zod';
import { SceneId } from '@foundry-mcp/shared';

export const ModuleSequencerToolInput = z.object({
  action: z.enum([
    'play-sequence-json',
    'end-effects', 'end-all-effects', 'get-effects', 'update-effects',
    'play-sound', 'end-sounds', 'end-all-sounds', 'get-sounds',
    'database-search', 'database-get-paths', 'database-entry-exists', 'database-get-entry',
    'preload', 'preload-for-clients',
    'permission-write',
  ]),
  sequence: z.array(z.record(z.unknown())).optional(),
  options: z.record(z.unknown()).optional(),
  filter: z.record(z.unknown()).optional(),
  updates: z.record(z.unknown()).optional(),
  sceneId: SceneId.optional(),
  confirm: z.boolean().optional(),
  file: z.string().optional(),
  files: z.array(z.string()).optional(),
  showProgressBar: z.boolean().optional(),
  path: z.string().optional(),
  softFail: z.boolean().optional(),
  key: z.string().optional(),
  value: z.number().optional(),
});

export type ModuleSequencerToolInputType = z.infer<typeof ModuleSequencerToolInput>;
