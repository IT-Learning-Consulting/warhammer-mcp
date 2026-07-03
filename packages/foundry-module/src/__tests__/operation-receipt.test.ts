// Phase 12 R12.2 — buildOperationReceipt helper unit tests.
// Encodes the receipt contract: a non-empty operationId + the 3 id arrays + warnings, with nullable/empty
// ids filtered out. If a future change drops the operationId or stops filtering nulls, these fail.

import { describe, it, expect } from 'vitest';
import { buildOperationReceipt } from '../services/shared/operation-receipt.js';

describe('buildOperationReceipt', () => {
  it('returns all five fields with a non-empty operationId', () => {
    const r = buildOperationReceipt({ created: ['a'], updated: ['b'], deleted: ['c'], warnings: ['w'] });
    expect(typeof r.operationId).toBe('string');
    expect(r.operationId.length).toBeGreaterThan(0);
    expect(r.createdDocumentIds).toEqual(['a']);
    expect(r.updatedDocumentIds).toEqual(['b']);
    expect(r.deletedDocumentIds).toEqual(['c']);
    expect(r.warnings).toEqual(['w']);
  });

  it('defaults every array to [] when no args are passed (uniform shape)', () => {
    const r = buildOperationReceipt();
    expect(r.createdDocumentIds).toEqual([]);
    expect(r.updatedDocumentIds).toEqual([]);
    expect(r.deletedDocumentIds).toEqual([]);
    expect(r.warnings).toEqual([]);
    expect(r.operationId.length).toBeGreaterThan(0);
  });

  it('filters null/undefined/empty ids (handlers hold nullable ids e.g. destItem?.id ?? null)', () => {
    const r = buildOperationReceipt({ created: ['x', null, undefined, ''], updated: [null] });
    expect(r.createdDocumentIds).toEqual(['x']);
    expect(r.updatedDocumentIds).toEqual([]);
  });

  it('stays well under the 2KB Risk-12.B threshold for a realistic batch', () => {
    const big = Array.from({ length: 20 }, (_, i) => `id-${i}-0123456789abcdef`);
    const r = buildOperationReceipt({ created: big, updated: big });
    expect(JSON.stringify(r).length).toBeLessThan(2048);
  });

  // RC1.2 (mcp_code_quality_v2 Phase C1) — failedItems[] additive contract.
  describe('failedItems (RC1.2)', () => {
    it('is absent (not []) when no `failed` arg is passed — additive-only, byte-identical for pre-C1 callers', () => {
      const r = buildOperationReceipt({ created: ['a'] });
      expect(r.failedItems).toBeUndefined();
      expect('failedItems' in r).toBe(false);
    });

    it('is absent when `failed` is passed but every entry is filtered out', () => {
      const r = buildOperationReceipt({ created: ['a'], failed: [null, undefined, { id: '', reason: 'x' }] });
      expect(r.failedItems).toBeUndefined();
    });

    it('carries {id, reason} pairs when failures are present, nulls/undefined filtered', () => {
      const r = buildOperationReceipt({
        created: ['a'],
        failed: [{ id: 'bad-1', reason: 'not found' }, null, { id: 'bad-2', reason: 'validation failed' }],
      });
      expect(r.failedItems).toEqual([
        { id: 'bad-1', reason: 'not found' },
        { id: 'bad-2', reason: 'validation failed' },
      ]);
    });

    it('stays well under the 2KB Risk-12.B threshold with failedItems populated on a realistic batch', () => {
      const bigCreated = Array.from({ length: 15 }, (_, i) => `id-${i}-0123456789abcdef`);
      const bigFailed = Array.from({ length: 5 }, (_, i) => ({ id: `bad-${i}-0123456789abcdef`, reason: 'ADD_ITEMS_NOT_PERSISTED: drift' }));
      const r = buildOperationReceipt({ created: bigCreated, failed: bigFailed });
      expect(JSON.stringify(r).length).toBeLessThan(2048);
    });
  });
});
