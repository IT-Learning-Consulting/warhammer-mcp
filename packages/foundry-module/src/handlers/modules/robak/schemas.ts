// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 9 — package-local Zod schema for module-robak.
//
// CCR-5: module-specific schemas stay package-local (not in @foundry-mcp/shared).
// Single action: roll-skill-silent — wraps SocketHandlers.rollSkill (wfrp4e-macros-and-more).
// `.strict()` rejects unknown top-level keys (CCR-5).
//
// Source: dossier wfrp-mechanic-delegates.md §3 (CAP-01) + §5.

import { z } from 'zod';

// wfrp4e difficulty keys (dossier §5 / §3 options shape).
const WfrpDifficulty = z.enum([
  'easy',
  'average',
  'challenging',
  'hard',
  'veryHard',
  'daunting',
  'impossible',
]);

const RollMode = z.enum(['gmroll', 'blindroll', 'publicroll', 'selfroll']);

export const ModuleRobakInput = z.discriminatedUnion('action', [
  // roll-skill-silent — headless GM-controlled skill test, no player dialog.
  // BUG-359: skill MUST be an exact skill name ("Perception", "Cool", "Dodge") as it appears on
  // the actor sheet. Characteristic names/keys ("Agility"/"ag") are NOT supported — robak's
  // rollSkill calls actor.setupSkill(skill) directly with no characteristic-resolution path.
  z
    .object({
      action: z.literal('roll-skill-silent'),
      actorId: z.string().min(1, 'actorId is required (actor UUID or world-document ID)'),
      skill: z.string().min(1, 'skill is required (exact skill name; characteristic names/keys are not supported)'),
      options: z
        .object({
          difficulty: WfrpDifficulty.optional(),
          modifier: z.number().optional(),
          rollMode: RollMode.optional(),
        })
        .strict()
        .optional(),
    })
    .strict(),
]);

export type ModuleRobakInputType = z.infer<typeof ModuleRobakInput>;
