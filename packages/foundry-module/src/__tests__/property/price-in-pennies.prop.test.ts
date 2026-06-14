// fast-check property tests — priceInPennies invariants (Phase 0 R0.2)
//
// Site: handlers/modules/forien-armoury/armoury.ts:priceInPennies (module-private)
//
// The function is not exported, so we inline it faithfully. This is the
// same pattern used by handler-deep-strip-undefined.test.ts (local re-impl).
//
// WFRP4e monetary conversion (Core p.64):
//   1 gc = 20 ss = 240 bp   →   pennies = gc×240 + ss×12 + bp
//
// Contract:
//   1. TOTALITY: never throws for any item shape.
//   2. NON-NEGATIVE: result is always ≥ 0 when inputs are ≥ 0.
//   3. MONOTONE: increasing any denomination increases or keeps the total.
//   4. ADDITIVE: pennyValue({gc:a+b}) === pennyValue({gc:a}) + 240*b.
//   5. CONVERSION RATE: 1gc = 240 pennies, 1ss = 12 pennies, 1bp = 1 penny.
//   6. MISSING FIELDS: undefined/null gc/ss/bp components default to 0.
//   7. NON-NUMERIC FIELDS: NaN-coerced values fall back to 0 (|| 0 guard).

import { describe, it } from 'vitest';
import fc from 'fast-check';

// ---------------------------------------------------------------------------
// Local re-implementation of priceInPennies, copy-faithful from armoury.ts:68-75
// ---------------------------------------------------------------------------

function priceInPennies(item: any): number {
  const p = item?.system?.price ?? {};
  const gc = Number(p.gc ?? 0) || 0;
  const ss = Number(p.ss ?? 0) || 0;
  const bp = Number(p.bp ?? 0) || 0;
  return gc * 240 + ss * 12 + bp;
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Non-negative finite integer denomination. */
const denomination = fc.integer({ min: 0, max: 10000 });

/** Item shape with explicit gc/ss/bp. */
const itemWithPrice = fc
  .record({
    gc: denomination,
    ss: denomination,
    bp: denomination,
  })
  .map((price) => ({ system: { price } }));

// ---------------------------------------------------------------------------
// Property 1 — Totality
// ---------------------------------------------------------------------------

describe('priceInPennies — totality', () => {
  it('never throws for any item shape', () => {
    fc.assert(
      fc.property(fc.anything(), (item) => {
        let threw = false;
        try {
          priceInPennies(item);
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
// Property 2 — Non-negative output when inputs ≥ 0
// ---------------------------------------------------------------------------

describe('priceInPennies — non-negative for non-negative inputs', () => {
  it('result is always ≥ 0', () => {
    fc.assert(
      fc.property(itemWithPrice, (item) => priceInPennies(item) >= 0),
      { numRuns: 2000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 3 — Monotonicity (increasing a denomination never decreases total)
// ---------------------------------------------------------------------------

describe('priceInPennies — monotonicity', () => {
  it('adding 1gc increases total by exactly 240', () => {
    fc.assert(
      fc.property(itemWithPrice, (item) => {
        const base = priceInPennies(item);
        const gcBumped = { system: { price: { ...item.system.price, gc: item.system.price.gc + 1 } } };
        return priceInPennies(gcBumped) === base + 240;
      }),
      { numRuns: 2000 }
    );
  });

  it('adding 1ss increases total by exactly 12', () => {
    fc.assert(
      fc.property(itemWithPrice, (item) => {
        const base = priceInPennies(item);
        const ssBumped = { system: { price: { ...item.system.price, ss: item.system.price.ss + 1 } } };
        return priceInPennies(ssBumped) === base + 12;
      }),
      { numRuns: 2000 }
    );
  });

  it('adding 1bp increases total by exactly 1', () => {
    fc.assert(
      fc.property(itemWithPrice, (item) => {
        const base = priceInPennies(item);
        const bpBumped = { system: { price: { ...item.system.price, bp: item.system.price.bp + 1 } } };
        return priceInPennies(bpBumped) === base + 1;
      }),
      { numRuns: 2000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4 — Conversion rates
// ---------------------------------------------------------------------------

describe('priceInPennies — conversion rates', () => {
  it('1gc = 240bp', () => {
    const gc1 = priceInPennies({ system: { price: { gc: 1, ss: 0, bp: 0 } } });
    const bp240 = priceInPennies({ system: { price: { gc: 0, ss: 0, bp: 240 } } });
    fc.assert(
      fc.property(fc.constant(null), () => gc1 === bp240),
      { numRuns: 1 }
    );
  });

  it('1ss = 12bp', () => {
    const ss1 = priceInPennies({ system: { price: { gc: 0, ss: 1, bp: 0 } } });
    const bp12 = priceInPennies({ system: { price: { gc: 0, ss: 0, bp: 12 } } });
    fc.assert(
      fc.property(fc.constant(null), () => ss1 === bp12),
      { numRuns: 1 }
    );
  });

  it('20ss = 1gc', () => {
    const ss20 = priceInPennies({ system: { price: { gc: 0, ss: 20, bp: 0 } } });
    const gc1 = priceInPennies({ system: { price: { gc: 1, ss: 0, bp: 0 } } });
    fc.assert(
      fc.property(fc.constant(null), () => ss20 === gc1),
      { numRuns: 1 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 5 — Missing / undefined price fields default to 0
// ---------------------------------------------------------------------------

describe('priceInPennies — missing fields default to 0', () => {
  it('item with no price field returns 0', () => {
    fc.assert(
      fc.property(fc.constant({ system: {} }), (item) => priceInPennies(item) === 0),
      { numRuns: 1 }
    );
  });

  it('null item returns 0', () => {
    fc.assert(
      fc.property(fc.constant(null), (item) => priceInPennies(item) === 0),
      { numRuns: 1 }
    );
  });

  it('undefined item returns 0', () => {
    fc.assert(
      fc.property(fc.constant(undefined), (item) => priceInPennies(item) === 0),
      { numRuns: 1 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6 — Non-numeric denomination fields coerce to 0
// ---------------------------------------------------------------------------

describe('priceInPennies — non-numeric fields coerce to 0', () => {
  it('string "abc" in a denomination slot coerces to 0', () => {
    fc.assert(
      fc.property(
        fc.constant({ system: { price: { gc: 'abc', ss: undefined, bp: null } } }),
        (item) => priceInPennies(item) === 0
      ),
      { numRuns: 1 }
    );
  });

  it('NaN denomination coerces to 0 via || 0 guard', () => {
    fc.assert(
      fc.property(
        fc.constant({ system: { price: { gc: NaN, ss: 0, bp: 0 } } }),
        (item) => priceInPennies(item) === 0
      ),
      { numRuns: 1 }
    );
  });
});
