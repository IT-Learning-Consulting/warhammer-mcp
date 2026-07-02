// Module Integration v2 Phase 4 — package-local Zod schema for module-perceptive
// (Perceptive v6.0.4, saibot).
//
// CCR-5: module-specific schemas stay package-local (not in @foundry-mcp/shared). `.strict()` on
// every top-level action variant rejects unknown keys.
//
// 8 actions over the verified server-reachable surface (capability_audit/perceptive.md +
// phase4_pre_plan.md). Mixed write paths (raw awaited flag write for stealth/DCs/delegate; module-API
// direct for spotting/spottable/reset; GM-direct ESM function for doors). Token targets accept id OR
// name (resolved in the handler, mirroring token-attacher's resolver); the "at least one of id/name"
// rule lives in the handler, NOT a schema refinement (carry-forward §4 — a Zod refinement yields
// ZodEffects which the discriminatedUnion rejects; every variant stays a plain .strict() ZodObject).
//
// Door targets address a Wall (door) by id only (walls have no name). Door ops are LIVE-SMOKE-ONLY
// for evals (no walls in the eval-world snapshot).
//
// Source of truth: .agents/research/module_integration/phase4_pre_plan.md +
// capability_audit/perceptive.md (§Flag/Data Model, §API Methods, §Dangerous Operations).

import { z } from 'zod';

// A token target: id or name (handler enforces "at least one"); optional scene (defaults to active).
const tokenTargetFields = {
  tokenId: z.string().min(1).optional(),
  tokenName: z.string().min(1).optional(),
  sceneId: z.string().min(1).optional(),
};

export const PerceptiveInput = z.discriminatedUnion('action', [
  // set-stealth — RAW awaited flag write PerceptiveStealthingFlag (the api drops its Promise).
  z
    .object({
      action: z.literal('set-stealth'),
      ...tokenTargetFields,
      stealthing: z.boolean(),
    })
    .strict(),

  // set-spotting — module API addSpottedby(target, spotter); spotter resolved like the target.
  z
    .object({
      action: z.literal('set-spotting'),
      ...tokenTargetFields,
      spotterId: z.string().min(1).optional(),
      spotterName: z.string().min(1).optional(),
    })
    .strict(),

  // set-spottable — module API setcanbeSpotted(target, bool) (awaited) + RAW flag write for PPDC/APDC.
  z
    .object({
      action: z.literal('set-spottable'),
      ...tokenTargetFields,
      canbeSpotted: z.boolean(),
      ppdc: z.number().optional(),
      apdc: z.number().optional(),
    })
    .strict(),

  // reset-stealth — RemoveLingeringAP + clearSpottedby + clear PerceptiveStealthingFlag.
  z
    .object({
      action: z.literal('reset-stealth'),
      ...tokenTargetFields,
    })
    .strict(),

  // peek-door — GM-direct PeekDoorRequest (PlayerID bypass). LIVE-SMOKE-ONLY. Creates aux walls.
  z
    .object({
      action: z.literal('peek-door'),
      doorId: z.string().min(1, 'doorId (the Wall/door id) is required'),
      tokenIds: z.array(z.string().min(1)).min(1, 'at least one peeking token id is required'),
      sceneId: z.string().min(1).optional(),
    })
    .strict(),

  // move-door — GM-direct DoorMoveRequest (swing/slide). LIVE-SMOKE-ONLY. Creates aux walls.
  z
    .object({
      action: z.literal('move-door'),
      doorId: z.string().min(1, 'doorId (the Wall/door id) is required'),
      // Swing/slide direction; DoorMoveGM takes Math.sign(direction) — use +1 / -1.
      direction: z.number(),
      speed: z.number().positive().optional(),
      sceneId: z.string().min(1).optional(),
    })
    .strict(),

  // wfrp-stealth-delegate — GM-supplied SL → RAW flag write PPDCFlag=APDCFlag=sl. Fail-open (CCR-9)
  // when perceptive is inactive (soft message, NOT the guard error).
  z
    .object({
      action: z.literal('wfrp-stealth-delegate'),
      ...tokenTargetFields,
      sl: z.number(),
    })
    .strict(),

  // get-state — read PerceptiveStealthingFlag / SpottedbyFlag / PPDCFlag / APDCFlag + api.LightLevel.
  z
    .object({
      action: z.literal('get-state'),
      ...tokenTargetFields,
    })
    .strict(),
]);

export type PerceptiveInputType = z.infer<typeof PerceptiveInput>;
