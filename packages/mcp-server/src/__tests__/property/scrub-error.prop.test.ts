// fast-check property test — scrubError invariants (Phase 0 R0.2)
//
// scrubError(e: unknown): string must satisfy these invariants for ALL inputs:
//   1. Always returns a string — never undefined, null, or another type.
//   2. Never throws — defensive against any input shape.
//   3. Never exceeds MAX_LEN (800) + the truncation suffix length.
//   4. Never leaks Windows absolute paths in its output.
//   5. Output contains no raw newlines (BUG-065 collapse invariant).

import { describe, it } from 'vitest';
import fc from 'fast-check';
import { scrubError } from '../../utils/scrub-error.js';

// The truncation suffix appended when the message exceeds MAX_LEN.
const TRUNCATION_SUFFIX = '… [truncated]';
const MAX_LEN = 800;
const MAX_RESULT_LEN = MAX_LEN + TRUNCATION_SUFFIX.length;

describe('scrubError — property', () => {
  // Invariant 1 + 2: For ANY input value (including null, undefined, numbers,
  // objects, arrays, Errors), scrubError must return a string and never throw.
  it('always returns a string and never throws for any input', () => {
    fc.assert(
      fc.property(fc.anything(), (input) => {
        try {
          const result = scrubError(input);
          return typeof result === 'string';
        } catch {
          // A thrown exception violates the contract.
          return false;
        }
      }),
    );
  });

  // Invariant 3: The output length is bounded by MAX_LEN + suffix length.
  // Strings arbitrarily long must be truncated, never emitted at full length.
  it('output length never exceeds MAX_LEN + suffix length', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 10000 }),
        (msg) => {
          const result = scrubError(new Error(msg));
          return result.length <= MAX_RESULT_LEN;
        },
      ),
    );
  });

  // Invariant 4: Windows absolute paths (C:\...) must be replaced with <path>.
  // The replacement must fire regardless of how long or complex the surrounding text is.
  it('always replaces Windows absolute path patterns with <path>', () => {
    fc.assert(
      fc.property(
        // Generate text with an embedded Windows path.
        fc.string({ maxLength: 200 }).map((prefix) => `${prefix} C:\\Users\\testuser\\secret.txt`),
        (msg) => {
          const result = scrubError(new Error(msg));
          // The literal path must NOT appear in the output.
          return !result.includes('C:\\Users\\testuser');
        },
      ),
    );
  });

  // Invariant 5: The output never contains raw newline characters.
  // scrubError collapses \n runs to a single space (BUG-065 fix).
  it('never contains raw newlines in the output', () => {
    fc.assert(
      fc.property(
        // Strings containing newlines — the exact shape that BUG-065 exposed.
        fc.string({ maxLength: 500 }).chain((base) =>
          fc.array(fc.nat({ max: base.length }), { minLength: 0, maxLength: 5 }).map((positions) => {
            let s = base;
            // Insert newlines at random positions.
            for (const pos of positions.sort((a, b) => b - a)) {
              s = s.slice(0, pos) + '\n' + s.slice(pos);
            }
            return s;
          }),
        ),
        (msgWithNewlines) => {
          const result = scrubError(new Error(msgWithNewlines));
          return !result.includes('\n');
        },
      ),
    );
  });

  // Invariant 6: Strings that are already short (<= MAX_LEN and no newlines or
  // Windows paths) pass through unchanged (modulo whitespace collapse).
  // This confirms scrubError is non-destructive for clean short strings.
  it('returns the original string unchanged for short clean strings', () => {
    fc.assert(
      fc.property(
        // Strings without Windows path patterns, newlines, or leading/trailing whitespace.
        fc.string({ maxLength: 100 }).filter(
          (s) =>
            !s.includes('\n') &&
            !s.includes('\r') &&
            !/[A-Z]:\\/.test(s) &&
            s === s.trim(),
        ),
        (cleanMsg) => {
          const result = scrubError(new Error(cleanMsg));
          return result === cleanMsg;
        },
      ),
    );
  });
});
