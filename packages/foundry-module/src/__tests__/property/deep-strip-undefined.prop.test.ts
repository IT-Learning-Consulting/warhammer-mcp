// fast-check property tests — deepStripUndefined invariants (Phase 0 R0.2)
//
// Site: worldCRUDFactory.ts:deepStripUndefined (exported; canonical copy)
//
// Contract (B3 / BUG-tile-volume-silent-zero-defense):
//   1. IDEMPOTENT: f(f(x)) JSON-equals f(x) for any value.
//   2. OBJECT KEYS WITH UNDEFINED ARE STRIPPED: for any plain object, the output
//      has no undefined-valued own enumerable keys (at any depth of plain objects).
//   3. NON-UNDEFINED PRIMITIVES ARE PRESERVED: scalars (non-object, non-array,
//      non-undefined) pass through unchanged.
//   4. NULL/FALSE/ZERO are NOT stripped — only undefined object-valued keys are.
//   5. ARRAY SHAPE: result of processing an array is still an array of the same length.
//   6. ARRAY ELEMENT UNDEFINED: undefined inside an ARRAY is NOT stripped by this
//      function — only undefined OBJECT KEYS are stripped. (The function maps recursively
//      over array elements but the `if (v === undefined) continue` guard is the object-key
//      branch. Array elements are mapped directly, so undefined slots pass through.)
//
// NOTE: top-level undefined input is returned as undefined (the function only strips
// keys inside objects, not the top-level value itself). This is correct behavior.

import { describe, it } from 'vitest';
import fc from 'fast-check';
import { deepStripUndefined } from '../../utils/worldCRUDFactory.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Recursively scan OBJECT KEYS ONLY — check if any object has an undefined-valued
 *  own key. Does NOT scan array elements (those are a separate concern). */
function objectKeysHaveUndefined(v: unknown): boolean {
  if (Array.isArray(v)) {
    // Recurse into array elements but don't flag undefined array elements
    // (that is not what the function strips).
    return v.filter((el) => el !== undefined).some(objectKeysHaveUndefined);
  }
  if (v !== null && typeof v === 'object') {
    for (const [, val] of Object.entries(v as Record<string, unknown>)) {
      if (val === undefined) return true;
      if (objectKeysHaveUndefined(val)) return true;
    }
  }
  return false;
}

/** JSON-round-trip deep equality. */
function jsonEq(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ---------------------------------------------------------------------------
// Arbitrary: plain objects only (no __proto__ prototype pollution) with
// possible undefined values at any level. fc.object() generates plain objects
// using safe string keys (no __proto__ by default).
// ---------------------------------------------------------------------------

// fc.object() with withUndefinedValues produces plain objects with undefined values.
const plainObjectWithUndef = fc.object({ withUndefinedValues: true });

// fc.anything() can produce undefined at top level — we include it to test
// the top-level passthrough.
const anyValue = fc.anything({ withUndefinedValues: true });

// ---------------------------------------------------------------------------
// Property 1 — Idempotency (core B3 invariant)
// ---------------------------------------------------------------------------

describe('deepStripUndefined — idempotency', () => {
  it('f(f(x)) JSON-equals f(x) for any value', () => {
    fc.assert(
      fc.property(anyValue, (input) => {
        const once = deepStripUndefined(structuredClone(input));
        const twice = deepStripUndefined(structuredClone(once));
        return jsonEq(once, twice);
      }),
      { numRuns: 2000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2 — Object keys with undefined values are stripped (from objects)
// ---------------------------------------------------------------------------

describe('deepStripUndefined — undefined object keys are stripped', () => {
  it('result plain-object tree contains no undefined-valued own keys', () => {
    fc.assert(
      fc.property(plainObjectWithUndef, (input) => {
        const result = deepStripUndefined(input);
        return !objectKeysHaveUndefined(result);
      }),
      { numRuns: 2000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 3 — Non-undefined primitives are preserved
// ---------------------------------------------------------------------------

describe('deepStripUndefined — non-undefined scalar values are preserved', () => {
  const definedScalar = fc.oneof(
    fc.integer(),
    fc.double({ noNaN: true }),
    fc.string(),
    fc.boolean(),
    fc.constant(null)
  );

  it('a non-undefined primitive scalar is returned unchanged', () => {
    fc.assert(
      fc.property(definedScalar, (v) => jsonEq(deepStripUndefined(v), v)),
      { numRuns: 1000 }
    );
  });

  it('a flat object with all defined values is unchanged (safe keys only)', () => {
    // We use fc.dictionary with safe keys (ascii letters only) to avoid
    // __proto__ prototype-pollution edge cases (fc.string() can produce "__proto__").
    const safeKey = fc.string({ minLength: 1, maxLength: 10 }).filter(
      (k) => k !== '__proto__' && k !== 'constructor' && k !== 'prototype'
    );
    fc.assert(
      fc.property(fc.dictionary(safeKey, definedScalar), (obj) => {
        const result = deepStripUndefined(obj);
        return jsonEq(obj, result);
      }),
      { numRuns: 1000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4 — Falsy non-undefined values are NOT stripped
// ---------------------------------------------------------------------------

describe('deepStripUndefined — null/false/0/"" are preserved in objects', () => {
  it('null survives at top level', () => {
    fc.assert(
      fc.property(fc.constant(null), (v) => deepStripUndefined(v) === null),
      { numRuns: 1 }
    );
  });

  it('false survives as an object value', () => {
    fc.assert(
      fc.property(
        fc.record({ flag: fc.constant(false as const) }),
        (obj) => {
          const result = deepStripUndefined(obj) as { flag: boolean };
          return result.flag === false;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('0 and empty-string survive as object values', () => {
    fc.assert(
      fc.property(
        fc.record({ zero: fc.constant(0 as number), empty: fc.constant('' as string) }),
        (obj) => {
          const result = deepStripUndefined(obj) as typeof obj;
          return result.zero === 0 && result.empty === '';
        }
      ),
      { numRuns: 200 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 5 — Array shape is preserved
// ---------------------------------------------------------------------------

describe('deepStripUndefined — array shape preserved', () => {
  it('array length is unchanged (the function does not compact arrays)', () => {
    fc.assert(
      fc.property(fc.array(anyValue, { minLength: 0, maxLength: 20 }), (arr) => {
        const result = deepStripUndefined(arr as any[]);
        return Array.isArray(result) && result.length === arr.length;
      }),
      { numRuns: 1000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6 — Objects nested inside arrays have their undefined keys stripped
// ---------------------------------------------------------------------------

describe('deepStripUndefined — objects inside arrays have undefined keys stripped', () => {
  it('undefined keys are stripped from objects inside arrays', () => {
    fc.assert(
      fc.property(
        fc.array(plainObjectWithUndef, { maxLength: 10 }),
        (arr) => {
          const result = deepStripUndefined(arr);
          // Undefined OBJECT KEYS inside array elements must be stripped.
          return !objectKeysHaveUndefined(result);
        }
      ),
      { numRuns: 1000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7 — Top-level undefined is passed through unchanged
//   (the function can only strip keys inside objects; it cannot strip itself)
// ---------------------------------------------------------------------------

describe('deepStripUndefined — top-level undefined passthrough', () => {
  it('deepStripUndefined(undefined) returns undefined', () => {
    fc.assert(
      fc.property(fc.constant(undefined), (v) => deepStripUndefined(v) === undefined),
      { numRuns: 1 }
    );
  });
});
