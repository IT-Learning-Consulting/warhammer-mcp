// fast-check property tests — WFRP4e SL / d100 roll-under invariants (Phase 0 R0.2)
//
// Site: FoundryDataAccess.buildRollResultPayload (data-access.ts ~2964, private)
//
// Contract (mirrors TestWFRP.computeResult, default SLMethod):
//   Rule 1 — success ⟺ roll ≤ target, EXCEPT:
//               auto-success when roll ≤ 5 (regardless of target)
//               auto-failure when roll ≥ 96 (regardless of target)
//   Rule 2 — SL sign matches outcome:
//               success  ⟹ SL ≥ 0  (auto-success forces SL ≥ 1)
//               failure  ⟹ SL ≤ 0  (auto-failure forces SL ≤ -1)
//   Rule 3 — SL formula: floor(target/10) − floor(roll/10), then clamped by rules above.
//   Rule 4 — Totality: never throws for any roll/target in [1, 100].

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// ---------------------------------------------------------------------------
// Inline implementation — mirrors data-access.ts:2978-2982 exactly
// (private method; we copy rather than poke the class to avoid Foundry-state
// dependency, and because the function is a pure mathematical computation).
// ---------------------------------------------------------------------------

function computeWFRPResult(d100: number, target: number): { SL: number; success: boolean } {
  const baseSL = Math.floor(target / 10) - Math.floor(d100 / 10);
  const success = d100 <= 5 || (d100 < 96 && d100 <= target);
  const SL = success
    ? (d100 <= 5 && baseSL < 1 ? 1 : baseSL)
    : (d100 >= 96 && baseSL > -1 ? -1 : baseSL);
  return { SL, success };
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** WFRP d100 value in [1, 100]. */
const d100 = fc.integer({ min: 1, max: 100 });
/** Characteristic / skill target in [1, 100]. */
const target = fc.integer({ min: 1, max: 100 });

// ---------------------------------------------------------------------------
// Property 1 — SL sign matches success/failure
// ---------------------------------------------------------------------------

describe('WFRP SL computation — SL sign matches outcome', () => {
  it('success ⟹ SL ≥ 0', () => {
    fc.assert(
      fc.property(d100, target, (roll, tgt) => {
        const { SL, success } = computeWFRPResult(roll, tgt);
        if (success) {
          return SL >= 0;
        }
        return true; // only asserting the success branch
      }),
      { numRuns: 10000 }
    );
  });

  it('failure ⟹ SL ≤ 0', () => {
    fc.assert(
      fc.property(d100, target, (roll, tgt) => {
        const { SL, success } = computeWFRPResult(roll, tgt);
        if (!success) {
          return SL <= 0;
        }
        return true;
      }),
      { numRuns: 10000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2 — Auto-success rule (roll ≤ 5 always succeeds with SL ≥ 1)
// ---------------------------------------------------------------------------

describe('WFRP SL computation — auto-success on roll ≤ 5', () => {
  it('roll ≤ 5 always yields success=true and SL ≥ 1', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        target,
        (roll, tgt) => {
          const { SL, success } = computeWFRPResult(roll, tgt);
          return success === true && SL >= 1;
        }
      ),
      { numRuns: 2000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 3 — Auto-failure rule (roll ≥ 96 always fails with SL ≤ -1)
// ---------------------------------------------------------------------------

describe('WFRP SL computation — auto-failure on roll ≥ 96', () => {
  it('roll ≥ 96 always yields success=false and SL ≤ -1', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 96, max: 100 }),
        target,
        (roll, tgt) => {
          const { SL, success } = computeWFRPResult(roll, tgt);
          return success === false && SL <= -1;
        }
      ),
      { numRuns: 2000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4 — Normal zone (6 ≤ roll ≤ 95): success iff roll ≤ target
// ---------------------------------------------------------------------------

describe('WFRP SL computation — normal zone success condition', () => {
  it('6 ≤ roll ≤ 95: success iff roll ≤ target', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 6, max: 95 }),
        target,
        (roll, tgt) => {
          const { success } = computeWFRPResult(roll, tgt);
          return success === (roll <= tgt);
        }
      ),
      { numRuns: 10000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 5 — Totality: never throws for any roll/target in [1, 100]
// ---------------------------------------------------------------------------

describe('WFRP SL computation — totality', () => {
  it('never throws for any (roll, target) ∈ [1,100]²', () => {
    fc.assert(
      fc.property(d100, target, (roll, tgt) => {
        // Must not throw; result fields must be finite numbers + boolean.
        const { SL, success } = computeWFRPResult(roll, tgt);
        return (
          typeof SL === 'number' &&
          Number.isFinite(SL) &&
          typeof success === 'boolean'
        );
      }),
      { numRuns: 10000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6 — SL formula in normal zone: floor(target/10) − floor(roll/10)
// ---------------------------------------------------------------------------

describe('WFRP SL computation — SL formula correctness in normal zone', () => {
  it('6 ≤ roll ≤ 95 and no auto-clamp: SL = tens(target) − tens(roll)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 6, max: 95 }),
        target,
        (roll, tgt) => {
          const { SL, success } = computeWFRPResult(roll, tgt);
          const expected = Math.floor(tgt / 10) - Math.floor(roll / 10);
          // The only clamp in normal zone is auto-success floor to +1 (roll ≤ 5,
          // which is excluded here). So SL must equal the formula.
          return SL === expected;
        }
      ),
      { numRuns: 10000 }
    );
  });
});
