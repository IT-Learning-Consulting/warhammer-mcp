// BUG-065 regression — scrubError must surface Zod issues, not truncate at the first newline.

import { describe, it, expect } from 'vitest';
import { z, ZodError } from 'zod';
import { scrubError } from '../utils/scrub-error.js';

describe('scrubError', () => {
  it('formats a direct ZodError into a single readable line', () => {
    const schema = z.object({ name: z.string(), age: z.number() }).strict();
    let err: unknown;
    try {
      schema.parse({ name: 42, extra: true } as any);
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(ZodError);

    const out = scrubError(err);
    expect(out.startsWith('ZodError:')).toBe(true);
    // Must NOT just be "[" — that was the BUG-065 symptom.
    expect(out.length).toBeGreaterThan(20);
    expect(out).toMatch(/name:/);
  });

  it('collapses multi-line wrapped-Zod messages instead of cutting at \\n', () => {
    // Simulates the Foundry handler re-wrapping a ZodError as `new Error(\`Failed: ${zodErr.message}\`)`.
    // Once wrapped, the inner ZodError instance is lost — we only have the JSON string. We don't
    // re-format that into dotted paths; we just guarantee the body survives the scrub.
    const wrappedBody = JSON.stringify(
      [{ code: 'invalid_type', path: ['effect', 'trigger'], message: 'Required' }],
      null,
      2,
    );
    const wrapped = new Error(`Failed to add active effect: ${wrappedBody}`);

    const out = scrubError(wrapped);
    expect(out.startsWith('Failed to add active effect:')).toBe(true);
    // The pre-fix behaviour returned `Failed to add active effect: [` — make sure the body survives.
    expect(out).toContain('invalid_type');
    expect(out).toContain('"effect"');
    expect(out).toContain('"trigger"');
    expect(out).toContain('Required');
    expect(out).not.toMatch(/\n/);
  });

  it('handles a plain Error with a single-line message', () => {
    expect(scrubError(new Error('boom'))).toBe('boom');
  });

  it('handles strings and unknown values', () => {
    expect(scrubError('raw string error')).toBe('raw string error');
    expect(scrubError(null)).toBe('Unknown error occurred');
    expect(scrubError(undefined)).toBe('Unknown error occurred');
    expect(scrubError(42)).toBe('Unknown error occurred');
  });

  it('scrubs absolute filesystem paths', () => {
    const out = scrubError(new Error('failed at C:\\Users\\me\\secret.txt while reading'));
    expect(out).toContain('<path>');
    expect(out).not.toContain('C:\\Users\\me');
  });

  it('truncates absurdly long messages with the … marker', () => {
    const out = scrubError(new Error('x'.repeat(2000)));
    expect(out.endsWith('… [truncated]')).toBe(true);
    expect(out.length).toBeLessThanOrEqual(800 + '… [truncated]'.length);
  });
});
