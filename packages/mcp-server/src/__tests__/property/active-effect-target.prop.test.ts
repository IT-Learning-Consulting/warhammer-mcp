// fast-check property test — ActiveEffectTarget superRefine invariants (Phase 0 R0.2)
//
// Site: ActiveEffectTarget in @foundry-mcp/shared schemas/active-effect-target.ts
// Schema: z.union([ActorTarget, WorldTarget, ActorDirectTargetBase]).superRefine(...)
//
// The superRefine fires only on the 'actor-direct' scope and enforces that at
// least one of actorId / actorName is supplied. The other scopes (actor, world)
// are plain ZodObjects with no superRefine constraint.
//
// Invariants:
//   A. scope='actor-direct' WITH at least one identifier → parse succeeds.
//   B. scope='actor-direct' WITHOUT any identifier → parse fails.
//   C. scope='actor' always passes (no identifier requirement at schema level).
//   D. scope='world' always passes (no identifier requirement at schema level).

import { describe, it } from 'vitest';
import fc from 'fast-check';
import { ActiveEffectTarget } from '@foundry-mcp/shared';

// A generator for a non-empty Foundry-ID-like string (min 1 char).
const foundryId = fc.string({ minLength: 1, maxLength: 60 });

describe('ActiveEffectTarget superRefine — property', () => {
  // Invariant A: actor-direct with actorId supplied always passes.
  it('accepts actor-direct when actorId is supplied', () => {
    fc.assert(
      fc.property(foundryId, (actorId) => {
        const result = ActiveEffectTarget.safeParse({
          scope: 'actor-direct',
          actorId,
        });
        return result.success === true;
      }),
    );
  });

  // Invariant A (variant): actor-direct with actorName supplied always passes.
  it('accepts actor-direct when actorName is supplied', () => {
    fc.assert(
      fc.property(foundryId, (actorName) => {
        const result = ActiveEffectTarget.safeParse({
          scope: 'actor-direct',
          actorName,
        });
        return result.success === true;
      }),
    );
  });

  // Invariant A (both): actor-direct with both actorId and actorName still passes.
  it('accepts actor-direct when both actorId and actorName are supplied', () => {
    fc.assert(
      fc.property(foundryId, foundryId, (actorId, actorName) => {
        const result = ActiveEffectTarget.safeParse({
          scope: 'actor-direct',
          actorId,
          actorName,
        });
        return result.success === true;
      }),
    );
  });

  // Invariant B: actor-direct with NO identifiers always fails.
  // The neither-case is the bug the refine was written to catch.
  it('rejects actor-direct with no actorId or actorName', () => {
    // There is only one shape to test here, but we repeat it many times
    // to confirm the invariant holds deterministically (no flakiness from
    // random empty-string edge cases, etc.).
    fc.assert(
      fc.property(fc.constant(undefined), (_) => {
        const result = ActiveEffectTarget.safeParse({ scope: 'actor-direct' });
        return result.success === false;
      }),
    );
  });

  // Invariant C: scope='actor' always passes regardless of optional field values
  // (no superRefine on this branch — handler enforces identifier at runtime).
  it('accepts scope=actor with any combination of optional fields', () => {
    fc.assert(
      fc.property(
        fc.option(foundryId, { nil: undefined }),
        fc.option(foundryId, { nil: undefined }),
        fc.option(foundryId, { nil: undefined }),
        fc.option(foundryId, { nil: undefined }),
        (actorId, actorName, itemId, itemName) => {
          const payload: Record<string, string> = { scope: 'actor' };
          if (actorId !== undefined) payload.actorId = actorId;
          if (actorName !== undefined) payload.actorName = actorName;
          if (itemId !== undefined) payload.itemId = itemId;
          if (itemName !== undefined) payload.itemName = itemName;
          const result = ActiveEffectTarget.safeParse(payload);
          return result.success === true;
        },
      ),
    );
  });

  // Invariant D: scope='world' always passes regardless of optional field values.
  it('accepts scope=world with any combination of optional fields', () => {
    fc.assert(
      fc.property(
        fc.option(foundryId, { nil: undefined }),
        fc.option(foundryId, { nil: undefined }),
        (itemId, itemName) => {
          const payload: Record<string, string> = { scope: 'world' };
          if (itemId !== undefined) payload.itemId = itemId;
          if (itemName !== undefined) payload.itemName = itemName;
          const result = ActiveEffectTarget.safeParse(payload);
          return result.success === true;
        },
      ),
    );
  });
});
