// fast-check property test — DiceRollSimulateInput.n range invariants (Phase 0 R0.2)
//
// Site: DiceRollSimulateInput in @foundry-mcp/shared schemas/dice-roll.ts
// Schema: n: z.number().int().min(1).max(1000)
//
// Per the schema comment: "strict reject (NOT silent clamp)". This means the
// schema is a gate, not a transformer — out-of-range values must FAIL parse,
// not be silently clamped to a boundary value.
//
// Invariants:
//   A. For any integer n in [1, 1000], parse SUCCEEDS.
//   B. For any integer n < 1 OR n > 1000, parse FAILS (throws or safeParse=false).
//   C. For any non-integer number, parse FAILS (int constraint).

import { describe, it } from 'vitest';
import fc from 'fast-check';
import { DiceRollSimulateInput } from '@foundry-mcp/shared';

const VALID_FORMULA = '1d6';

describe('DiceRollSimulateInput.n — property', () => {
  // Invariant A: Any in-range integer [1, 1000] must parse successfully.
  it('accepts any integer n in [1, 1000]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        (n) => {
          const result = DiceRollSimulateInput.safeParse({ action: 'simulate', formula: VALID_FORMULA, n });
          return result.success === true;
        },
      ),
    );
  });

  // Invariant B1: Any integer strictly less than 1 must fail.
  it('rejects any integer n < 1', () => {
    fc.assert(
      fc.property(
        fc.integer({ max: 0 }),
        (n) => {
          const result = DiceRollSimulateInput.safeParse({ action: 'simulate', formula: VALID_FORMULA, n });
          return result.success === false;
        },
      ),
    );
  });

  // Invariant B2: Any integer strictly greater than 1000 must fail.
  it('rejects any integer n > 1000', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1001 }),
        (n) => {
          const result = DiceRollSimulateInput.safeParse({ action: 'simulate', formula: VALID_FORMULA, n });
          return result.success === false;
        },
      ),
    );
  });

  // Invariant C: Non-integer numbers (including fractional floats) must fail.
  // The schema uses .int() which rejects fractional values.
  it('rejects non-integer numbers within the nominal range', () => {
    fc.assert(
      fc.property(
        // Generate floats in [1, 1000] that are NOT whole numbers.
        fc.float({ min: 1, max: 1000, noNaN: true }).filter((n) => !Number.isInteger(n)),
        (n) => {
          const result = DiceRollSimulateInput.safeParse({ action: 'simulate', formula: VALID_FORMULA, n });
          return result.success === false;
        },
      ),
    );
  });

  // Invariant D: The parsed `n` value is always exactly what was provided
  // (no silent transform/clamp) for in-range integers.
  it('parsed n equals the input n exactly (no transform) for valid inputs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        (n) => {
          const result = DiceRollSimulateInput.safeParse({ action: 'simulate', formula: VALID_FORMULA, n });
          if (!result.success) return false;
          return result.data.n === n;
        },
      ),
    );
  });
});
