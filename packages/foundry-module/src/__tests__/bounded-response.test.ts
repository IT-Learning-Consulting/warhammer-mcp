// BUG-490 (Wave 2 D2) — bounded-response helper + global size-guard contract.
// The guard exists so an oversize handler response becomes a TYPED error envelope
// instead of a transport-level hard failure (11.2 MB rolltable list precedent);
// boundList pins the pagination envelope contract (items/totalAvailable/truncated).
import { describe, it, expect } from 'vitest';
import {
  boundList,
  guardResponseSize,
  wrapWithSizeGuard,
  DEFAULT_LIST_LIMIT,
  DEFAULT_RESPONSE_BUDGET_CHARS,
} from '../services/bounded-response.js';

describe('boundList', () => {
  const items = Array.from({ length: 120 }, (_, i) => ({ id: `id-${i}` }));

  it('applies the default limit and reports truncation', () => {
    const out = boundList(items);
    expect(out.items).toHaveLength(DEFAULT_LIST_LIMIT);
    expect(out.totalAvailable).toBe(120);
    expect(out.truncated).toBe(true);
    expect(out.offset).toBe(0);
  });

  it('offset pages through; final page is not truncated', () => {
    const out = boundList(items, { limit: 50, offset: 100 });
    expect(out.items).toHaveLength(20);
    expect(out.items[0]).toEqual({ id: 'id-100' });
    expect(out.truncated).toBe(false);
  });

  it('untruncated when everything fits', () => {
    const out = boundList(items.slice(0, 10), { limit: 50 });
    expect(out.items).toHaveLength(10);
    expect(out.truncated).toBe(false);
  });

  it('clamps limit to [1, maxLimit] and offset to >= 0', () => {
    expect(boundList(items, { limit: -5 }).items).toHaveLength(1);
    expect(boundList(items, { limit: 10_000, maxLimit: 500 }).items).toHaveLength(120);
    expect(boundList(items, { offset: -10 }).offset).toBe(0);
  });

  it('honors a per-surface defaultLimit', () => {
    expect(boundList(items, { defaultLimit: 25 }).items).toHaveLength(25);
  });
});

describe('guardResponseSize', () => {
  it('passes small responses through unchanged (same reference)', () => {
    const response = { success: true, data: { ok: 1 } };
    expect(guardResponseSize('listRollTables', response)).toBe(response);
  });

  it('converts an oversize response into the typed RESPONSE_TOO_LARGE envelope, not a throw', () => {
    const oversize = { success: true, data: 'x'.repeat(DEFAULT_RESPONSE_BUDGET_CHARS + 1) };
    const out = guardResponseSize('listRollTables', oversize) as any;
    expect(out.success).toBe(false);
    expect(out.error).toContain('RESPONSE_TOO_LARGE');
    expect(out.error).toContain('listRollTables');
    // Names the surface's bounding params so the caller can self-correct.
    expect(out.error).toMatch(/limit\/offset/);
    // Warns that a write may have already landed (timeout ≠ cancellation class).
    expect(out.error).toContain('may have already completed');
    expect(out.sizeChars).toBeGreaterThan(out.budgetChars);
  });

  it('falls back to the generic hint for unmapped query keys', () => {
    const oversize = { data: 'x'.repeat(DEFAULT_RESPONSE_BUDGET_CHARS + 1) };
    const out = guardResponseSize('someUnknownKey', oversize) as any;
    expect(out.error).toContain('RESPONSE_TOO_LARGE');
    expect(out.error).toContain('limit/offset/filter/projection');
  });

  it('honors a custom budget', () => {
    const out = guardResponseSize('k', { data: 'x'.repeat(200) }, 100) as any;
    expect(out.error).toContain('RESPONSE_TOO_LARGE');
    expect(out.budgetChars).toBe(100);
  });

  it('passes non-serializable responses through untouched', () => {
    const circular: any = {};
    circular.self = circular;
    expect(guardResponseSize('k', circular)).toBe(circular);
  });
});

describe('wrapWithSizeGuard (registration choke point)', () => {
  it('wraps a handler so oversize results become the typed envelope', async () => {
    const handler = async () => ({ success: true, data: 'x'.repeat(DEFAULT_RESPONSE_BUDGET_CHARS + 1) });
    const wrapped = wrapWithSizeGuard('module-syrinscape', handler);
    const out = (await wrapped({})) as any;
    expect(out.success).toBe(false);
    expect(out.error).toContain('RESPONSE_TOO_LARGE');
    expect(out.error).toContain('list-soundsets / list-moods');
  });

  it('leaves in-budget handler results untouched', async () => {
    const payload = { success: true, data: [1, 2, 3] };
    const wrapped = wrapWithSizeGuard('k', async () => payload);
    expect(await wrapped({})).toBe(payload);
  });
});
