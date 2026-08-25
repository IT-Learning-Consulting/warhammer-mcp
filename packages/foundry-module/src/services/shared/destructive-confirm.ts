// services/shared/destructive-confirm.ts — systemic_bug_class_prevention v2, Phase 1, HC12 (Q2 Journal ADR).
//
// Shared confirm-gate helper for destructive/irreversible in-world MCP writes (inventory wipes,
// item/flag deletes, world-permission changes, all-client broadcasts). Generalizes the
// `confirmRequiredEnvelope()` / `previewItemLines()` shape already established in
// `handlers/modules/item-piles/flow.ts:44-70` (BUG-772/786) into one reusable primitive so every
// new gate (BUG-802, BUG-813, ...) shares a single implementation instead of re-deriving the
// choreography per handler.
//
// PLACEMENT: services/shared/ — co-located with operation-receipt.ts and outcome-response.ts
// (caps-exempt under the lint-ratchet `**/services/**` glob; dep-cruiser permits cross-service
// import from here, unlike a flat services/<svc>.ts).
//
// ONE-CALL PATTERN (qa.md Q2, binding — deviates from PRD §6.4's `z.literal(true)` + `dryRun`
// two-call example; see the Phase 1 Journal ADR): `confirm: z.boolean().optional()` at parse time,
// paired with a hard handler-side gate that returns a clean `CONFIRM_REQUIRED` refusal envelope
// instead of letting an unconfirmed call fail Zod parse (BUG-810 precedent — this exact module
// family already reverted `z.literal(true)` for producing an opaque raw Zod error instead of a
// legible refusal). Existing `z.literal(true)` sites elsewhere in the codebase are untouched
// (CCR-7, additive-only).
//
// SCHEMA-SIDE CONVENTION (why schema files don't import `destructiveConfirmField()` directly):
// the Zod schemas for these actions live in the `shared/` npm package
// (`shared/src/schemas/modules/.../schemas.ts`), which cannot import from `foundry-module` — that
// would invert the package dependency direction (foundry-module depends on shared, never the
// reverse). Schema files therefore use the INLINE convention instead:
//
//   confirm: z.boolean().optional(),  // CONFIRM-GATE(<action>):
//
// The `// CONFIRM-GATE(<action>):` comment is load-bearing: it is what the Phase 7 CONFIRM-GATE
// checker (`check-source-pattern.mjs` Rule 5) and future authors key on to recognize a confirm
// field as belonging to this contract, since the factory itself is unreachable from that file.
//
// CANONICAL FIELD NAME: new surfaces use `confirm` (matches `destructiveConfirmField()` below).
// `macro.ts`'s `confirmedExecution` field is legacy and is NOT being renamed — renaming a live
// input field is a breaking schema change (CCR-7 / PRD §4.3 "no tool renames"). The CONFIRM-GATE
// checker (a later phase task) flags BOTH spellings (`"confirm": true` and
// `"confirmedExecution": true`) hardcoded into asset files — a reusable idiom/asset must never
// pre-authorize either one.

import { z } from 'zod';

/** The envelope every gated destructive action returns when `confirm` was not `true`. */
export interface ConfirmRequiredEnvelope {
  success: false;
  error: string;
}

/**
 * Gate for a destructive/irreversible write. Returns `null` when the caller has confirmed
 * (`input.confirm === true`) — the handler proceeds. Otherwise returns the `CONFIRM_REQUIRED`
 * refusal envelope, whose exact shape and wording (the `CONFIRM_REQUIRED:` token, the
 * `Re-send with confirm:true.` trailer) mirrors `confirmRequiredEnvelope()`
 * (`handlers/modules/item-piles/flow.ts:65-70`) — every existing eval/skill choreography in this
 * codebase keys on that literal string shape, so it is preserved verbatim here.
 *
 * @param input - the parsed action input; only `confirm` is read.
 * @param action - the action name (e.g. `'permission-write'`, `'clear-item-animation'`).
 * @param blastRadius - a human-readable description of what will be affected (target + effect),
 *   composed by the caller (e.g. via a preview helper) before this is invoked.
 */
export function requireConfirm(
  input: { confirm?: boolean },
  action: string,
  blastRadius: string,
): ConfirmRequiredEnvelope | null {
  if (input.confirm === true) return null;
  return {
    success: false,
    error: `CONFIRM_REQUIRED: ${action} on ${blastRadius}. Re-send with confirm:true.`,
  };
}

/**
 * Zod factory for the `confirm` field on a destructive-action schema. Use directly in
 * `foundry-module`-local schemas; `shared/` package schemas use the equivalent inline convention
 * documented above instead (they cannot import this file).
 */
export function destructiveConfirmField(): z.ZodOptional<z.ZodBoolean> {
  return z
    .boolean()
    .optional()
    .describe(
      'Set true only after presenting the blast radius to the user and receiving explicit approval. Never hardcode true.',
    );
}
