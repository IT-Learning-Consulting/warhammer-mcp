// fast-check property test — compendium pagination range invariants (Phase 0 R0.2)
//
// Site: ReadPackInput in @foundry-mcp/shared schemas/compendium.ts
//   page:     z.number().int().min(1)          — must be >= 1
//   pageSize: z.number().int().min(1).max(500) — must be in [1, 500]
//
// Both fields are optional; these tests probe their range contracts when supplied.
//
// Invariants:
//   A. Valid page [1, MAX_SAFE_INT) and valid pageSize [1, 500] → parse succeeds.
//   B. page < 1 → parse fails.
//   C. pageSize < 1 OR pageSize > 500 → parse fails.
//   D. Non-integer page or pageSize → parse fails.

import { describe, it } from 'vitest';
import fc from 'fast-check';
import { ReadPackInput } from '@foundry-mcp/shared';

const VALID_PACK_ID = 'world.my-pack';

describe('ReadPackInput pagination — property', () => {
  // Invariant A: Valid integer page [1, 1e6] and valid pageSize [1, 500] both pass.
  it('accepts valid page and pageSize combinations', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1_000_000 }),
        fc.integer({ min: 1, max: 500 }),
        (page, pageSize) => {
          const result = ReadPackInput.safeParse({
            action: 'read-pack',
            packId: VALID_PACK_ID,
            page,
            pageSize,
          });
          return result.success === true;
        },
      ),
    );
  });

  // Invariant B: Any integer page < 1 must fail.
  it('rejects page < 1', () => {
    fc.assert(
      fc.property(
        fc.integer({ max: 0 }),
        (page) => {
          const result = ReadPackInput.safeParse({
            action: 'read-pack',
            packId: VALID_PACK_ID,
            page,
          });
          return result.success === false;
        },
      ),
    );
  });

  // Invariant C1: pageSize < 1 must fail.
  it('rejects pageSize < 1', () => {
    fc.assert(
      fc.property(
        fc.integer({ max: 0 }),
        (pageSize) => {
          const result = ReadPackInput.safeParse({
            action: 'read-pack',
            packId: VALID_PACK_ID,
            pageSize,
          });
          return result.success === false;
        },
      ),
    );
  });

  // Invariant C2: pageSize > 500 must fail.
  it('rejects pageSize > 500', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 501 }),
        (pageSize) => {
          const result = ReadPackInput.safeParse({
            action: 'read-pack',
            packId: VALID_PACK_ID,
            pageSize,
          });
          return result.success === false;
        },
      ),
    );
  });

  // Invariant D: Non-integer page must fail (int constraint).
  it('rejects non-integer page values', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1, max: 1000, noNaN: true }).filter((n) => !Number.isInteger(n)),
        (page) => {
          const result = ReadPackInput.safeParse({
            action: 'read-pack',
            packId: VALID_PACK_ID,
            page,
          });
          return result.success === false;
        },
      ),
    );
  });

  // Invariant E: When page and pageSize are omitted (both optional), parse succeeds
  // with only packId supplied — confirms the fields are truly optional.
  it('succeeds when page and pageSize are omitted', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 60 }),
        (packId) => {
          const result = ReadPackInput.safeParse({
            action: 'read-pack',
            packId,
          });
          return result.success === true;
        },
      ),
    );
  });
});
