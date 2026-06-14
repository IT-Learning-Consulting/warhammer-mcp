// fast-check property test — actorTargetSchema refine invariants (Phase 0 R0.2)
//
// Site: actorTargetSchema in @foundry-mcp/shared schemas/targets.ts
// Schema: z.object({ actorId, actorName }).strict().refine(
//           (v) => !!(v.actorId || v.actorName),
//           { message: 'actorId or actorName is required' }
//         )
//
// This is the at-least-one-of pattern. Invariants:
//   A. Exactly actorId supplied → passes.
//   B. Exactly actorName supplied → passes.
//   C. Both actorId AND actorName → passes.
//   D. Neither actorId nor actorName → fails.
//   E. Extra fields (not actorId/actorName) always fail (strict mode).

import { describe, it } from 'vitest';
import fc from 'fast-check';
import { actorTargetSchema } from '@foundry-mcp/shared';

const foundryId = fc.string({ minLength: 1, maxLength: 60 });

describe('actorTargetSchema refine (at-least-one) — property', () => {
  // Invariant A: actorId alone always passes.
  it('accepts any non-empty actorId (no actorName needed)', () => {
    fc.assert(
      fc.property(foundryId, (actorId) => {
        const result = actorTargetSchema.safeParse({ actorId });
        return result.success === true;
      }),
    );
  });

  // Invariant B: actorName alone always passes.
  it('accepts any non-empty actorName (no actorId needed)', () => {
    fc.assert(
      fc.property(foundryId, (actorName) => {
        const result = actorTargetSchema.safeParse({ actorName });
        return result.success === true;
      }),
    );
  });

  // Invariant C: both supplied always passes.
  it('accepts both actorId and actorName together', () => {
    fc.assert(
      fc.property(foundryId, foundryId, (actorId, actorName) => {
        const result = actorTargetSchema.safeParse({ actorId, actorName });
        return result.success === true;
      }),
    );
  });

  // Invariant D: neither supplied always fails.
  // {} is the only shape here — we confirm the refine fires every time.
  it('rejects when neither actorId nor actorName is supplied', () => {
    fc.assert(
      fc.property(fc.constant({}), (empty) => {
        const result = actorTargetSchema.safeParse(empty);
        return result.success === false;
      }),
    );
  });

  // Invariant D (empty string): empty-string actorId is falsy → still fails refine.
  it('rejects empty-string actorId (falsy value does not satisfy refine)', () => {
    fc.assert(
      fc.property(fc.constant(''), (emptyId) => {
        const result = actorTargetSchema.safeParse({ actorId: emptyId });
        // Either the .min(1)... wait — actorTargetSchema uses z.string() not z.string().min(1)
        // so an empty string IS a valid string type. The refine `!!v.actorId` is falsy for ''.
        return result.success === false;
      }),
    );
  });

  // Invariant E: strict mode — an extra field alongside valid actorId must fail.
  it('rejects objects with extra fields even when actorId is valid (strict mode)', () => {
    fc.assert(
      fc.property(
        foundryId,
        fc.string({ minLength: 1, maxLength: 20 }).filter((k) => k !== 'actorId' && k !== 'actorName'),
        fc.anything(),
        (actorId, extraKey, extraVal) => {
          const payload: Record<string, unknown> = { actorId, [extraKey]: extraVal };
          const result = actorTargetSchema.safeParse(payload);
          // Strict mode rejects extra keys.
          return result.success === false;
        },
      ),
    );
  });
});
