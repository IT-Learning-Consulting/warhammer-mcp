/**
 * Shared vitest helpers for Phase 3b envelope work (BUG-015 / CCR-1 / R3).
 */
import { expect } from 'vitest';

/**
 * Assert the canonical handler-envelope shape emitted by every Foundry-side
 * handler (PRD CCR-1): `{ success: true, data: T }` on success, or
 * `{ success: false, error: string }` on failure.
 *
 * Tests call this on a success-path return to assert the full shape and
 * narrow the type for subsequent `data`-field assertions.
 */
export function expectEnvelope<T = unknown>(
  result: unknown,
): asserts result is { success: true; data: T } {
  expect(result).toBeDefined();
  expect(result).not.toBeNull();
  expect(typeof result).toBe('object');
  const r = result as { success?: unknown; data?: unknown; error?: unknown };
  expect(r.success).toBe(true);
  expect(r).toHaveProperty('data');
  expect(r.error).toBeUndefined();
}
