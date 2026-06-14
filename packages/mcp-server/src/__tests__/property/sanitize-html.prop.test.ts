// fast-check property test — sanitizeHtml invariants (Phase 0 R0.2)
//
// Site: sanitizeHtml in packages/mcp-server/src/utils/sanitize-html.ts
// Contract: strips <script> tags, on* event handlers, and javascript: URLs from
// journal HTML before echoing it back through MCP. NOT a full parser — limited
// regex-based sanitizer sufficient for this use case.
//
// Invariants:
//   1. Always returns a string — never undefined or null, even for null/undefined input.
//   2. Never throws for any input.
//   3. Idempotent — sanitizeHtml(sanitizeHtml(x)) === sanitizeHtml(x) for any string.
//   4. Output never contains a <script ...>...</script> block.
//   5. Output never contains on[event]= attribute patterns.
//   6. Output never contains javascript: in href/src attributes.

import { describe, it } from 'vitest';
import fc from 'fast-check';
import { sanitizeHtml } from '../../utils/sanitize-html.js';

describe('sanitizeHtml — property', () => {
  // Invariant 1 + 2: always returns string and never throws for any
  // string | null | undefined input (the declared type signature).
  // Note: sanitizeHtml(input: string | null | undefined) — we test within
  // that declared domain. Arbitrary objects outside the signature may throw
  // (e.g. { toString: [] } causes String() to throw); that is an out-of-contract
  // call and is documented as a potential finding separately.
  it('always returns a string and never throws for string | null | undefined inputs', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string(),
          fc.constant(null),
          fc.constant(undefined),
        ),
        (input) => {
          try {
            const result = sanitizeHtml(input as any);
            return typeof result === 'string';
          } catch {
            return false;
          }
        },
      ),
    );
  });

  // Invariant 3: Idempotency — a second sanitize pass produces the same string.
  // This is the most important semantic invariant: the sanitizer must not leave
  // "half-stripped" artifacts that would be further stripped on re-application.
  it('is idempotent — sanitizing twice equals sanitizing once', () => {
    fc.assert(
      fc.property(fc.string(), (html) => {
        const once = sanitizeHtml(html);
        const twice = sanitizeHtml(once);
        return once === twice;
      }),
    );
  });

  // Invariant 4: Output never contains a complete <script> block.
  it('output never contains a <script> block', () => {
    fc.assert(
      fc.property(
        // Generate strings that embed a script tag somewhere.
        fc.string({ maxLength: 100 }).chain((payload) =>
          fc.string({ maxLength: 50 }).map(
            (prefix) => `${prefix}<script type="text/javascript">${payload}</script>`,
          ),
        ),
        (html) => {
          const result = sanitizeHtml(html);
          // The regex pattern from the source: /<script\b[^>]*>[\s\S]*?<\/script\s*>/gi
          return !/<script\b[^>]*>[\s\S]*?<\/script\s*>/i.test(result);
        },
      ),
    );
  });

  // Invariant 5: Output never contains on[a-z]+ event handler attributes.
  it('output never contains on* event handler attributes', () => {
    fc.assert(
      fc.property(
        // Generate an on* attribute embedded in an img tag.
        fc.constantFrom('onclick', 'onerror', 'onmouseover', 'onload').chain((eventName) =>
          fc.string({ maxLength: 50 }).map(
            (code) => `<img src="x" ${eventName}="${code}">`,
          ),
        ),
        (html) => {
          const result = sanitizeHtml(html);
          // Must not contain the on* attribute.
          return !/\s+on[a-z]+\s*=/i.test(result);
        },
      ),
    );
  });

  // Invariant 6: Output never contains javascript: in href/src attributes.
  it('output never contains javascript: in href or src attributes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('href', 'src').chain((attr) =>
          fc.string({ maxLength: 50 }).map(
            (code) => `<a ${attr}="javascript:${code}">link</a>`,
          ),
        ),
        (html) => {
          const result = sanitizeHtml(html);
          return !/(?:href|src)\s*=\s*(?:"javascript:|'javascript:)/i.test(result);
        },
      ),
    );
  });

  // Invariant 7: Clean HTML (no script/on*/javascript:) passes through unchanged.
  // Confirms the sanitizer is non-destructive for safe content.
  it('leaves clean HTML strings unchanged (non-destructive)', () => {
    fc.assert(
      fc.property(
        // Strings that contain none of the three patterns.
        fc.string({ maxLength: 200 }).filter(
          (s) =>
            !/<script/i.test(s) &&
            !/\s+on[a-z]+\s*=/i.test(s) &&
            !/(?:href|src)\s*=\s*["']javascript:/i.test(s),
        ),
        (cleanHtml) => {
          return sanitizeHtml(cleanHtml) === cleanHtml;
        },
      ),
    );
  });
});
