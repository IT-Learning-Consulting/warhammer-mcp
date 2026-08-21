// services/shared/outcome-response.ts — MCP Systemic Bug-Class Prevention v1, Phase 3 (HC4 / ADR-005).
//
// Shared success-semantics discriminator: a write handler's response must say WHICH of five things
// actually happened, not just whether the call threw. Composes with buildOperationReceipt() at the
// same call sites (the token-casualties.ts appliedCount/alreadyAppliedCount + buildOperationReceipt()
// combination is the precedent) — this helper stamps the ONE overall verdict, the receipt carries the
// per-item detail.
//
// PLACEMENT: services/shared/ — co-located with operation-receipt.ts and actor-update-observer.ts
// (caps-exempt under the lint-ratchet services/ glob; dep-cruiser permits cross-service import from
// here, unlike a flat services/<svc>.ts).
//
// HARD WIRE CONSTRAINT (D1, non-negotiable): `foundry-client.ts:83` does `return envelope.data as T` —
// a single unwrap site. `outcome` MUST be nested INSIDE the data object, never an envelope sibling, or
// it is silently dropped on the wire. buildOutcomeResponse() therefore spreads `outcome` INTO `data`,
// never wraps `data`.
//
// Called PER-`handleX()` (D2) — never at the queries.ts choke point. `outcome` is not a
// content-agnostic transform like wrapWithSizeGuard; a wrapper cannot know noop-vs-partial-vs-applied
// without the handler saying so.

/**
 * - `applied` — the write happened exactly as requested.
 * - `alreadyApplied` — the requested state already held (idempotent no-op on a repeat call); the BUG-409
 *   `token-casualties.ts` natural-key pattern this type promotes to a shared name.
 * - `noop` — nothing to do (e.g. an empty transfer); not an error, but no write occurred.
 * - `partial` — some but not all of a multi-part operation succeeded.
 * - `failed` — the write did not happen.
 */
export type OutcomeValue = 'applied' | 'alreadyApplied' | 'noop' | 'partial' | 'failed';

/** Spreads `outcome` into `data` as an own enumerable key — never a wrapper around `data`. */
export function buildOutcomeResponse<T extends object>(outcome: OutcomeValue, data: T): T & { outcome: OutcomeValue } {
  return { ...data, outcome };
}
