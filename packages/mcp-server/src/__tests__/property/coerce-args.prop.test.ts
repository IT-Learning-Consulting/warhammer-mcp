// fast-check property test — coerceArgsBySchema invariants (Phase 0 R0.2)
//
// coerceArgsBySchema(schema, args) coerces JSON-string-encoded values to their
// native types before Zod dispatch (BUG-047). Three invariants tested:
//   1. Idempotency — applying coercion twice produces the same result as once.
//   2. Numeric coercion — string-encoded numbers become numbers.
//   3. Never-throws — arbitrary object input never throws.

import { describe, it } from 'vitest';
import fc from 'fast-check';
import { coerceArgsBySchema } from '../../coerce-args.js';

// A minimal schema used for idempotency + numeric coercion probes.
const numberFieldSchema = {
  type: 'object',
  properties: {
    count: { type: 'number' },
    label: { type: 'string' },
  },
};

// Schema used for boolean coercion.
const boolFieldSchema = {
  type: 'object',
  properties: {
    enabled: { type: 'boolean' },
  },
};

describe('coerceArgsBySchema — property', () => {
  // Invariant 1: For any object arg that is already fully coerced (native number
  // where schema says number, native bool where schema says boolean), a second
  // coercion pass produces an identical result. This confirms coercion is
  // idempotent on already-typed values.
  it('is idempotent on already-coerced args (number field)', () => {
    fc.assert(
      fc.property(
        fc.record({
          count: fc.oneof(fc.float(), fc.integer()),
          label: fc.string(),
        }),
        (args) => {
          const once = coerceArgsBySchema(numberFieldSchema, args);
          const twice = coerceArgsBySchema(numberFieldSchema, once);
          return JSON.stringify(once) === JSON.stringify(twice);
        },
      ),
    );
  });

  // Invariant 2: A string-encoded finite number in a 'number' field is coerced
  // to a real number after one pass. The specific check is typeof === 'number'.
  it('coerces numeric-string fields to numbers when schema type is "number"', () => {
    fc.assert(
      fc.property(
        fc.float({ noNaN: true, noDefaultInfinity: true }).map((n) => String(n)),
        (numStr) => {
          const result = coerceArgsBySchema(numberFieldSchema, { count: numStr });
          return typeof result.count === 'number';
        },
      ),
    );
  });

  // Invariant 3: For any object-shaped input (arbitrary keys + values),
  // coerceArgsBySchema must never throw — unknown/untyped props pass through.
  // This is the safety contract: Zod handles the downstream error, not coerce.
  it('never throws for arbitrary object args', () => {
    fc.assert(
      fc.property(
        fc.anything(),
        (input) => {
          try {
            coerceArgsBySchema(numberFieldSchema, input);
            return true;
          } catch {
            return false;
          }
        },
      ),
    );
  });

  // Invariant 4: Boolean string 'true'/'false' in a 'boolean' schema field
  // always coerces to a native boolean, never remains a string.
  it('coerces "true"/"false" strings to booleans in boolean fields', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('true', 'false'),
        (boolStr) => {
          const result = coerceArgsBySchema(boolFieldSchema, { enabled: boolStr });
          return typeof result.enabled === 'boolean';
        },
      ),
    );
  });

  // Invariant 5: Non-boolean-like strings in a boolean field pass through
  // unchanged (not coerced to undefined/null/anything unexpected).
  it('leaves non-boolean-like strings in boolean fields unchanged', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => s !== 'true' && s !== 'false'),
        (nonBool) => {
          const result = coerceArgsBySchema(boolFieldSchema, { enabled: nonBool });
          return result.enabled === nonBool;
        },
      ),
    );
  });
});
