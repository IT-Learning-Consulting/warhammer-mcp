// fast-check property tests — validateCurrencyString invariants (Phase 0 R0.2)
//
// Site: handlers/modules/item-piles/catalog.ts:validateCurrencyString
//
// Contract (BUG-376 / item-piles getPriceFromString contract):
//   1. TOTALITY: never throws for any input (even non-string passed as `any`).
//   2. EMPTY/BLANK always returns a non-null error string.
//   3. NO-IDENTIFIER strings (no gc/ss/bp) always return a non-null error.
//   4. VALID FORMAT "Ngc Mss Kbp" (N,M,K ≥ 0 integers) returns null (no error).
//   5. ERROR IS A STRING: when non-null, the return value is always a string.

import { describe, it } from 'vitest';
import fc from 'fast-check';
import { validateCurrencyString } from '../../handlers/modules/item-piles/catalog.js';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Non-negative integer as string (including "0"). */
const nonNegIntStr = fc
  .integer({ min: 0, max: 9999 })
  .map((n) => String(n));

/** A valid "Ngc Mss Kbp" currency string (at least one component present).
 *  We vary which components are included but always include at least one. */
const validCurrencyString = fc
  .tuple(
    fc.option(nonNegIntStr, { nil: null }),  // gc component
    fc.option(nonNegIntStr, { nil: null }),  // ss component
    fc.option(nonNegIntStr, { nil: null }),  // bp component
  )
  .filter(([gc, ss, bp]) => gc !== null || ss !== null || bp !== null) // at least one
  .map(([gc, ss, bp]) => {
    const parts: string[] = [];
    if (gc !== null) parts.push(`${gc}gc`);
    if (ss !== null) parts.push(`${ss}ss`);
    if (bp !== null) parts.push(`${bp}bp`);
    return parts.join(' ');
  });

/** A string guaranteed NOT to contain gc/ss/bp substrings. */
const noIdentifierString = fc
  .string({ minLength: 1 })
  .filter((s) => !/gc|ss|bp/i.test(s));

// ---------------------------------------------------------------------------
// Property 1 — Totality: never throws for any arbitrary string
// ---------------------------------------------------------------------------

describe('validateCurrencyString — totality', () => {
  it('never throws for any string input', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        let threw = false;
        try {
          validateCurrencyString(s);
        } catch {
          threw = true;
        }
        return !threw;
      }),
      { numRuns: 2000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2 — Empty / blank strings return a non-null error
// ---------------------------------------------------------------------------

describe('validateCurrencyString — empty/blank yields error', () => {
  it('empty string returns non-null error', () => {
    fc.assert(
      fc.property(fc.constant(''), (s) => validateCurrencyString(s) !== null),
      { numRuns: 1 }
    );
  });

  it('whitespace-only string returns non-null error', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n'), { minLength: 1, maxLength: 10 }),
        (s) => validateCurrencyString(s) !== null
      ),
      { numRuns: 200 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 3 — Strings without gc/ss/bp always return an error
// ---------------------------------------------------------------------------

describe('validateCurrencyString — no identifier yields error', () => {
  it('string with no gc/ss/bp returns non-null error', () => {
    fc.assert(
      fc.property(noIdentifierString, (s) => validateCurrencyString(s) !== null),
      { numRuns: 1000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4 — Valid "Ngc Mss Kbp" format returns null (accepted)
// ---------------------------------------------------------------------------

describe('validateCurrencyString — valid format returns null', () => {
  it('"Ngc Mss Kbp" with at least one component is accepted', () => {
    fc.assert(
      fc.property(validCurrencyString, (s) => validateCurrencyString(s) === null),
      { numRuns: 2000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 5 — When non-null, return value is always a non-empty string
// ---------------------------------------------------------------------------

describe('validateCurrencyString — error return type', () => {
  it('non-null return is always a non-empty string', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const result = validateCurrencyString(s);
        if (result !== null) {
          return typeof result === 'string' && result.length > 0;
        }
        return true;
      }),
      { numRuns: 2000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6 — Case-insensitive: "GC"/"SS"/"BP" is equivalent to lowercase
// ---------------------------------------------------------------------------

describe('validateCurrencyString — case insensitivity', () => {
  it('"5GC 3SS 12BP" (uppercase) is also accepted', () => {
    fc.assert(
      fc.property(
        validCurrencyString,
        (s) => validateCurrencyString(s.toUpperCase()) === null
      ),
      { numRuns: 1000 }
    );
  });
});
