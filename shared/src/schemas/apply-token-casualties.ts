// apply-token-casualties.ts — WFRP Battle Simulator Phase 5 (R13 / R5.1 / R5.1a).
//
// Batch per-token ActorDelta casualty writer. For each token: set wounds, apply conditions
// (unconscious/broken/prone/… — no "dead" condition exists in wfrp4e), embed an ArtAntares
// critical-wound Item by compendium UUID.
// Writes ALWAYS target the token's SYNTHETIC actor (tokenDoc.actor / ActorDelta), never the
// world actor — encounter forces are unlinked siblings of one world actor (HC2 / BUG-133).
//
// Post-hardening compliance (R5.1a): branded SceneId/TokenId (CCR-Branded-ID), outputSchema +
// structuredContent (CCR-Output-Schema — this is a high-stakes mutation), confirmedApply
// trust gate (HC4 — mirrors macro.execute's z.literal(true)), dryRun preview (quality-contract
// §3). Self-contained (input + output + JSON-schema const) to stay cohesive; under the 400-line cap.

import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { SceneId, TokenId, FoundryUuid } from './branded-ids.js';
import { ConditionKey } from './conditions.js';

// One token's casualty outcome. All write fields optional — a token may take only a condition,
// only wounds, or only a crit. At least one is enforced at the .refine() below.
const TokenCasualty = z
  .object({
    tokenId: TokenId,
    // Absolute remaining Wounds to set on system.status.wounds.value (the handler clamps to
    // [0, wounds.max]). Omit to leave wounds untouched (e.g. a broken-but-unhurt fleer).
    wounds: z.number().int().min(0).optional(),
    // WFRP4e condition keys to apply via actor.addCondition (unconscious / broken / prone …).
    conditions: z.array(ConditionKey).optional(),
    // ArtAntares crit Item compendium UUID to embed (Compendium.<pack>.Item.<id>). The handler
    // embeds it on the token's synthetic actor + bumps system.status.criticalWounds.value.
    criticalUuid: FoundryUuid.optional(),
  })
  .strict()
  .refine(
    (c) => c.wounds !== undefined || (c.conditions?.length ?? 0) > 0 || c.criticalUuid !== undefined,
    { message: 'each casualty must set at least one of: wounds, conditions, criticalUuid' },
  );

// BUG-409 idempotency: a caller-supplied batch key. When present, the handler records a per-token
// applied-marker (flags.warhammer-mcp.casualtyBatches on the token's synthetic actor) and SKIPS any
// token already marked for this batchId — so a blind retry after a socket timeout re-sends the whole
// batch safely (already-landed crit embeds / numbered conditions are not re-applied). 1-128 chars;
// generate a stable id per casualty batch (e.g. `<slug>-r<round>-<isoStamp>`) and reuse it on retry.
const BatchId = z.string().min(1).max(128);

export const ApplyTokenCasualtiesInput = z
  .object({
    sceneId: SceneId,
    // HC4 trust gate — the GM must explicitly confirm the apply after reviewing the dry-run
    // report. A literal-true (not a boolean) so a default/omission can never authorize a write.
    confirmedApply: z.literal(true),
    casualties: z.array(TokenCasualty).min(1),
    // quality-contract §3 — when true, resolve + validate every token (existence, actorLink,
    // clamp) and return the planned writes with ZERO mutations.
    dryRun: z.boolean().optional(),
    // BUG-409 — optional idempotency key. Reuse the SAME value on a retry so already-applied tokens
    // are skipped instead of double-written. Omit for the legacy (non-idempotent) one-shot behavior.
    batchId: BatchId.optional(),
  })
  .strict();
export type ApplyTokenCasualtiesInputType = z.infer<typeof ApplyTokenCasualtiesInput>;

// Per-token result. `applied` is false when the token was rejected (e.g. actorLink=true, not
// found) — batch writes surface per-item failure detail rather than burying it (quality-contract §2).
const TokenCasualtyResult = z
  .object({
    tokenId: z.string(),
    applied: z.boolean(),
    actorName: z.string().optional(),
    woundsBefore: z.number().optional(),
    woundsAfter: z.number().optional(),
    conditionsApplied: z.array(z.string()).optional(),
    critEmbedded: z.string().nullable().optional(), // embedded crit item id, or null
    siblingVerified: z.boolean().optional(), // HC2 — a same-world-actor sibling was unchanged
    // BUG-409 — true when this token was SKIPPED because it was already applied for the given batchId
    // (idempotent retry). `applied` is also true (the token is in the desired state); no write occurred.
    alreadyApplied: z.boolean().optional(),
    error: z.string().optional(), // populated when applied=false
  })
  .passthrough();

export const ApplyTokenCasualtiesOutput = z
  .object({
    sceneId: z.string(),
    dryRun: z.boolean(),
    tokenCount: z.number(),
    appliedCount: z.number(),
    failedCount: z.number(),
    // BUG-409 — subset of appliedCount that were SKIPPED as already-applied for this batchId
    // (idempotent retry). 0 when no batchId is supplied or nothing was previously applied.
    alreadyAppliedCount: z.number().optional(),
    results: z.array(TokenCasualtyResult),
    // operation-receipt fields (present on a real apply; the builder always emits them).
    operationId: z.string().optional(),
    createdDocumentIds: z.array(z.string()).optional(),
    updatedDocumentIds: z.array(z.string()).optional(),
    deletedDocumentIds: z.array(z.string()).optional(),
    warnings: z.array(z.string()).optional(),
    // RC1.2 (mcp_code_quality_v2 Phase C1): additive-only batch partial-failure detail
    // (derived from results[] — see services/token-casualties.ts).
    failedItems: z.array(z.object({ id: z.string(), reason: z.string() })).optional(),
  })
  .passthrough();
export type ApplyTokenCasualtiesOutputType = z.infer<typeof ApplyTokenCasualtiesOutput>;

export const APPLY_TOKEN_CASUALTIES_OUTPUT_JSON_SCHEMA = zodToJsonSchema(ApplyTokenCasualtiesOutput, {
  target: 'jsonSchema7',
});
