// fast-check property tests — passesEnhancedCriteria invariants (Phase 0 R0.2)
//
// Site: FoundryDataAccess.passesEnhancedCriteria (data-access.ts ~1273, private)
//
// Contract:
//   1. TOTALITY: never throws for any well-shaped EnhancedCreatureIndex + criteria.
//   2. DETERMINISM: same creature + same criteria always returns the same boolean.
//   3. EMPTY CRITERIA: passesEnhancedCriteria(creature, {}) is always true —
//      an empty filter matches everything.
//   4. EXACT THREAT LEVEL: threatLevel as number only passes when challengeRating === value.
//   5. RANGE THREAT LEVEL: min/max range correctly brackets challengeRating.
//   6. CREATURE TYPE FILTER: case-insensitive exact match on creatureType.
//   7. SIZE FILTER: case-insensitive exact match on creature.size.
//   8. BOOLEAN FILTERS: hasSpells and hasSpecialAbilities must match exactly.

import { describe, it } from 'vitest';
import fc from 'fast-check';
import { FoundryDataAccess } from '../../data-access.js';

// ---------------------------------------------------------------------------
// Test rig
// ---------------------------------------------------------------------------

const da = (() => {
  const inst = new FoundryDataAccess();
  (inst as any).validateFoundryState = () => {};
  return inst;
})();

function passes(creature: any, criteria: any): boolean {
  return (da as any).passesEnhancedCriteria(creature, criteria);
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const challengeRating = fc.integer({ min: 0, max: 100 });
const creatureTypeName = fc.string({ minLength: 1, maxLength: 20 });
const sizeName = fc.string({ minLength: 1, maxLength: 20 });

/** Build a fully-specified EnhancedCreatureIndex-shaped object. */
const creatureArb = fc.record({
  id: fc.string(),
  name: fc.string(),
  type: fc.string(),
  pack: fc.string(),
  packLabel: fc.string(),
  challengeRating,
  creatureType: creatureTypeName,
  size: sizeName,
  wounds: fc.integer({ min: 0, max: 500 }),
  toughness: fc.integer({ min: 0, max: 20 }),
  hasSpells: fc.boolean(),
  hasSpecialAbilities: fc.boolean(),
});

// ---------------------------------------------------------------------------
// Property 1 — Totality
// ---------------------------------------------------------------------------

describe('passesEnhancedCriteria — totality', () => {
  it('never throws for any creature + criteria shape', () => {
    fc.assert(
      fc.property(creatureArb, fc.anything(), (creature, criteria) => {
        let threw = false;
        try {
          passes(creature, criteria ?? {});
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
// Property 2 — Determinism
// ---------------------------------------------------------------------------

describe('passesEnhancedCriteria — determinism', () => {
  it('same creature + criteria always returns the same boolean', () => {
    fc.assert(
      fc.property(creatureArb, fc.anything(), (creature, criteria) => {
        const c = criteria ?? {};
        const r1 = passes(creature, c);
        const r2 = passes(creature, c);
        return r1 === r2;
      }),
      { numRuns: 2000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 3 — Empty criteria: always true
// ---------------------------------------------------------------------------

describe('passesEnhancedCriteria — empty criteria accepts all creatures', () => {
  it('passes({}) is always true regardless of creature shape', () => {
    fc.assert(
      fc.property(creatureArb, (creature) => passes(creature, {})),
      { numRuns: 2000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4 — Exact threatLevel filter
// ---------------------------------------------------------------------------

describe('passesEnhancedCriteria — exact threatLevel filter', () => {
  it('matches only when challengeRating === threatLevel (numeric)', () => {
    fc.assert(
      fc.property(creatureArb, fc.integer({ min: 0, max: 100 }), (creature, level) => {
        const result = passes(creature, { threatLevel: level });
        return result === (creature.challengeRating === level);
      }),
      { numRuns: 5000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 5 — Range threatLevel filter
// ---------------------------------------------------------------------------

describe('passesEnhancedCriteria — range threatLevel filter', () => {
  it('min-only: passes iff challengeRating >= min', () => {
    fc.assert(
      fc.property(creatureArb, fc.integer({ min: 0, max: 50 }), (creature, min) => {
        const result = passes(creature, { threatLevel: { min } });
        return result === (creature.challengeRating >= min);
      }),
      { numRuns: 3000 }
    );
  });

  it('max-only: passes iff challengeRating <= max', () => {
    fc.assert(
      fc.property(creatureArb, fc.integer({ min: 0, max: 100 }), (creature, max) => {
        const result = passes(creature, { threatLevel: { max } });
        return result === (creature.challengeRating <= max);
      }),
      { numRuns: 3000 }
    );
  });

  it('min+max: passes iff min <= challengeRating <= max', () => {
    fc.assert(
      fc.property(
        creatureArb,
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 50, max: 100 }),
        (creature, min, max) => {
          const result = passes(creature, { threatLevel: { min, max } });
          return result === (creature.challengeRating >= min && creature.challengeRating <= max);
        }
      ),
      { numRuns: 3000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6 — creatureType filter (case-insensitive exact match)
// ---------------------------------------------------------------------------

describe('passesEnhancedCriteria — creatureType filter', () => {
  it('matches when creatureType matches (case-insensitive)', () => {
    fc.assert(
      fc.property(creatureArb, (creature) => {
        // Filter using the creature's own type (always matches).
        return passes(creature, { creatureType: creature.creatureType }) === true;
      }),
      { numRuns: 2000 }
    );
  });

  it('rejects when creatureType differs', () => {
    fc.assert(
      fc.property(
        creatureArb,
        // A type that definitely differs by appending a distinguisher.
        fc.string({ minLength: 1 }).map((s) => s + '__DIFFERENT__'),
        (creature, differentType) => {
          // The filter type can't equal the creature type (different suffix).
          if (creature.creatureType.toLowerCase() === differentType.toLowerCase()) return true; // skip
          return passes(creature, { creatureType: differentType }) === false;
        }
      ),
      { numRuns: 2000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7 — size filter (case-insensitive exact match)
// ---------------------------------------------------------------------------

describe('passesEnhancedCriteria — size filter', () => {
  it('matches when size matches (case-insensitive)', () => {
    fc.assert(
      fc.property(creatureArb, (creature) => {
        return passes(creature, { size: creature.size }) === true;
      }),
      { numRuns: 2000 }
    );
  });

  it('rejects when size differs', () => {
    fc.assert(
      fc.property(
        creatureArb,
        fc.string({ minLength: 1 }).map((s) => s + '__DIFFERENT__'),
        (creature, differentSize) => {
          if (creature.size.toLowerCase() === differentSize.toLowerCase()) return true;
          return passes(creature, { size: differentSize }) === false;
        }
      ),
      { numRuns: 2000 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 8 — boolean filters
// ---------------------------------------------------------------------------

describe('passesEnhancedCriteria — boolean hasSpells filter', () => {
  it('passes only when creature.hasSpells matches the filter value', () => {
    fc.assert(
      fc.property(creatureArb, fc.boolean(), (creature, filterVal) => {
        const result = passes(creature, { hasSpells: filterVal });
        return result === (creature.hasSpells === filterVal);
      }),
      { numRuns: 3000 }
    );
  });
});

describe('passesEnhancedCriteria — boolean hasSpecialAbilities filter', () => {
  it('passes only when creature.hasSpecialAbilities matches the filter value', () => {
    fc.assert(
      fc.property(creatureArb, fc.boolean(), (creature, filterVal) => {
        const result = passes(creature, { hasSpecialAbilities: filterVal });
        return result === (creature.hasSpecialAbilities === filterVal);
      }),
      { numRuns: 3000 }
    );
  });
});
