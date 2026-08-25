// services/shared/resume-boundary.ts — systemic_bug_class_prevention v2, Phase 2 (HC3/HC5, qa.md Q6).
//
// Shared step-boundary / retry-idempotency primitive for composite in-world writes: an ordered write
// is unsafe to fail (a mid-sequence throw strands partial state with zero provenance) and unsafe to
// blindly retry (a resend after a landed-but-timed-out call doubles what already landed). This file
// generalizes the proven tracked-create + rollback pattern in
// `handlers/modules/item-piles/container.ts:23-171` (BUG-779) into a reusable primitive, composing
// with — never reimplementing — the existing helpers:
//   - `operation-receipt.ts`'s `buildOperationReceipt()` for the returned receipt shape.
//   - `outcome-response.ts`'s `OutcomeValue` union — this file's own `outcome` values ('applied' /
//     'partial' / 'failed') are members of that union, so a caller's `buildOutcomeResponse()` call
//     can consume `runWriteSteps()`'s output directly.
//   - `handlers/modules/_shared/settle-poll.ts`'s `settlePoll()` for the read-side race tolerance a
//     natural-key precheck needs when a prior write may still be in flight.
//   - `utils/verifyWrite.ts`'s `verifyDocWrite()` / `verifyFlagWrite()` for the per-step post-write
//     persistence check (the `template-apply.ts:442` idiom, generalized).
//
// PLACEMENT: services/shared/ — co-located with operation-receipt.ts, outcome-response.ts, and
// destructive-confirm.ts (caps-exempt under the lint-ratchet `**/services/**` glob; dep-cruiser
// permits cross-service import from here, unlike a flat services/<svc>.ts).
//
// IDEMPOTENCY DESIGN (qa.md Q6 — HARD CONSTRAINT, not a suggestion): this helper does NOT persist any
// operation-id / ledger record. "Already applied" is decided purely by inspecting CURRENT document or
// flag state via a caller-supplied natural-key predicate (`precheckAlreadyApplied`) — the same idiom
// `container.ts`'s `dedicatedPile` flag and `token-casualties.ts`'s natural-key check already use.
// `operation-receipt.ts` explicitly declined a persisted marker for the same reason (its own header,
// `operation-receipt.ts:5`: "no DB, no flag write") — Q6 settles that this new primitive does not
// reintroduce one either. Do NOT add a stored operation-id / audit-log / retry-ledger mechanism here.
//
// OUTPUT COMPOSABILITY (memo §2 point 4): `runWriteSteps()` returns a plain `OperationReceipt`
// (the exact shape `buildOperationReceipt()` produces) plus an `outcome` drawn from `OutcomeValue` —
// both are assignable directly into an existing `buildOperationReceipt()`/`buildOutcomeResponse()`
// call site with no parallel response shape.
//
// EXPORTED NAMES ARE FIXED: `runWriteSteps` and `precheckAlreadyApplied` are grepped literally by the
// `retry-idempotency` checker (`scripts/check-retry-idempotency.mjs`, Phase 2 task 6.2). Do not rename.

import { settlePoll } from '../../handlers/modules/_shared/settle-poll.js';
import { verifyDocWrite, verifyFlagWrite } from '../../utils/verifyWrite.js';
import { buildOperationReceipt, type OperationReceipt } from './operation-receipt.js';

/**
 * The ids a single write step produced. Deliberately the same shape `buildOperationReceipt()`'s
 * `args` already accepts (nullable entries allowed — handlers routinely hold nullable ids, e.g.
 * `destItem?.id ?? null`) — never a parallel id shape.
 */
export interface StepIds {
  created?: Array<string | null | undefined>;
  updated?: Array<string | null | undefined>;
  deleted?: Array<string | null | undefined>;
}

/**
 * Post-write persistence check for one step, fed straight into `verifyDocWrite()` / `verifyFlagWrite()`
 * (`utils/verifyWrite.ts`) — this helper never reimplements verify logic, only wires the call.
 * `freshDoc` / `doc` are thunks (not values) because re-reading AFTER the write lands is the
 * caller's job (verifyWrite.ts's own documented convention) — evaluating them eagerly at step
 * construction time would read stale pre-write state.
 */
export type StepVerify =
  | {
      kind: 'doc';
      freshDoc: () => unknown;
      expectedFields: Record<string, unknown>;
      errorToken: string;
      options?: { readSource?: boolean; skipPaths?: string[]; normalizeDimensions?: boolean };
    }
  | {
      kind: 'flag';
      doc: () => unknown;
      scope: string;
      key: string;
      expected: unknown;
      errorToken: string;
    };

/** One ordered write in a `runWriteSteps()` sequence. */
export interface WriteStep {
  /** Human-readable step name — surfaced as `failedStep` and inside undo-failure warning text. */
  label: string;
  /** Performs the write; resolves with the ids this step created/updated/deleted. */
  run(): Promise<StepIds>;
  /**
   * Compensating action for a LATER step's failure. Receives THIS step's own `run()` result.
   * Only ever invoked for steps 1..N-1 (in reverse order) when a later step N fails — never for
   * step N itself (a step whose own write needs self-cleanup on its own verify failure should be
   * split into its own step followed by a separate verify-only step, so the failure is "step N"
   * and the write becomes an undo-able "step N-1" — the same decomposition `container.ts`'s
   * create-then-verify sequence already follows).
   */
  undo?(ids: StepIds): Promise<void>;
  /**
   * Optional post-write persistence check, run immediately after `run()` resolves and BEFORE the
   * step is considered "landed". A thrown verify error is treated exactly like a `run()` throw —
   * it triggers the undo cascade for whatever steps landed before this one.
   */
  verify?: StepVerify;
}

export interface RunWriteStepsOutcome {
  /** 'applied' = full success. 'partial' = at least one earlier step landed before the failure.
   *  'failed' = the very first step never landed — nothing to report but the failure itself. */
  outcome: 'applied' | 'partial' | 'failed';
  /** ids-as-far-as-they-got: a step's ids stay in the receipt as provenance of what was attempted,
   *  even when `undo` subsequently reverted them — this is a record of what happened, not a live
   *  inventory of what currently exists. */
  receipt: OperationReceipt;
  /** The label of the step that failed. Absent when `outcome === 'applied'`. */
  failedStep?: string;
}

function runStepVerify(v: StepVerify): void {
  if (v.kind === 'doc') {
    verifyDocWrite(v.freshDoc(), v.expectedFields, v.errorToken, v.options);
  } else {
    verifyFlagWrite(v.doc(), v.scope, v.key, v.expected, v.errorToken);
  }
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/**
 * Executes an ordered array of write steps sequentially. On a step-N failure (the write itself
 * throws, or its optional `verify` throws), runs `undo` for every step that landed before it
 * (1..N-1), in reverse order, THEN returns — it never re-throws the original error to the caller.
 *
 * Every undo failure is pushed onto `receipt.warnings` — NEVER console-only (this is the exact
 * BUG-779 residual class this helper must not repeat: `container.ts:163-170`'s rollback-of-rollback
 * used to warn to console only and never reach the caller). The original failure is never swallowed
 * either way: it is always surfaced via `outcome` (never silently 'applied') and `failedStep`.
 */
export async function runWriteSteps(steps: WriteStep[]): Promise<RunWriteStepsOutcome> {
  const created: Array<string | null | undefined> = [];
  const updated: Array<string | null | undefined> = [];
  const deleted: Array<string | null | undefined> = [];
  const warnings: string[] = [];
  const landed: Array<{ step: WriteStep; ids: StepIds }> = [];

  for (const step of steps) {
    try {
      const ids = await step.run();
      if (step.verify) runStepVerify(step.verify);
      created.push(...(ids.created ?? []));
      updated.push(...(ids.updated ?? []));
      deleted.push(...(ids.deleted ?? []));
      landed.push({ step, ids });
    } catch (err) {
      for (let j = landed.length - 1; j >= 0; j--) {
        const entry = landed[j];
        if (!entry) continue;
        const { step: landedStep, ids } = entry;
        if (!landedStep.undo) continue;
        try {
          await landedStep.undo(ids);
        } catch (undoErr) {
          warnings.push(
            `undo failed for step "${landedStep.label}" (triggered by "${step.label}" failure: ${errMsg(err)}): ${errMsg(undoErr)}`,
          );
        }
      }
      return {
        outcome: landed.length > 0 ? 'partial' : 'failed',
        receipt: buildOperationReceipt({ created, updated, deleted, warnings }),
        failedStep: step.label,
      };
    }
  }

  return {
    outcome: 'applied',
    receipt: buildOperationReceipt({ created, updated, deleted, warnings }),
  };
}

/**
 * Evaluates a caller-supplied natural-key predicate against CURRENT document/flag state to decide
 * whether a requested write has already landed — the sole idempotency mechanism this helper
 * provides (Q6; see file header — no stored operation-id, no ledger). `settle`, when supplied,
 * polls `check` through `settlePoll()`'s generic read/isSettled form for the case where a prior
 * write may still be in flight (a fire-and-forget module write not yet visible — the same race
 * `settle-poll.ts` was built to tolerate); omitted, `check` is evaluated once, synchronously.
 *
 * Returns the verdict; the caller maps `true` onto `outcome:'alreadyApplied'` via
 * `buildOutcomeResponse()` and skips the write entirely.
 */
export async function precheckAlreadyApplied(
  check: () => boolean,
  settle?: { attempts?: number; delayMs?: number },
): Promise<boolean> {
  if (!settle) return check();
  return settlePoll(check, (v: boolean): boolean => v === true, settle.attempts, settle.delayMs);
}
