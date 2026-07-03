// Phase 6.3 BUG-081 regression tests for transaction-manager per-scene tracking.
//
// Verifies:
//   1. wrappedWrite with {sceneId} registers in pendingSceneWrites
//   2. commit deregisters
//   3. awaitPendingWritesForScene resolves only after all writes complete
//   4. The original BUG-081 repro (scene.activate + light.create×3 parallel)
//      now sees all 3 creates committed before activate proceeds.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { wrappedWrite, transactionManager } from '../transaction-manager.js';
import { permissionManager } from '../permissions.js';
import { ErrorTokens } from '@foundry-mcp/shared';

// RC1.2 (mcp_code_quality_v2 Phase C1) — BATCH_PARTIAL_FAILURE rollback-regex guard.
// This is the same `/NOT_PERSISTED|VERIFY_FAILED/` sentinel wrappedWrite's catch block (below,
// :372-384 in transaction-manager.ts) tests against a thrown error message to decide whether to
// append the ROLLBACK_UNAVAILABLE warning. A partial-batch success is NOT a persistence failure —
// matching the regex would misleadingly warn about "rollback" for writes that actually landed.
describe('BATCH_PARTIAL_FAILURE — rollback-regex guard (RC1.2)', () => {
  it('is never matched by the wrappedWrite rollback-sentinel regex', () => {
    const rollbackSentinel = /NOT_PERSISTED|VERIFY_FAILED/;
    expect(rollbackSentinel.test(ErrorTokens.BATCH_PARTIAL_FAILURE)).toBe(false);
  });

  it('does not match even when embedded in a realistic warning message', () => {
    const rollbackSentinel = /NOT_PERSISTED|VERIFY_FAILED/;
    const message = `${ErrorTokens.BATCH_PARTIAL_FAILURE}: 2 of 5 targets failed`;
    expect(rollbackSentinel.test(message)).toBe(false);
  });

  it('sanity check: a genuine *_NOT_PERSISTED token DOES match (proves the regex still works)', () => {
    const rollbackSentinel = /NOT_PERSISTED|VERIFY_FAILED/;
    expect(rollbackSentinel.test(ErrorTokens.UPDATE_ACTOR_NOT_PERSISTED)).toBe(true);
  });
});

describe('Phase 6.3 BUG-081 — transactionManager per-scene tracking', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(permissionManager, 'checkWritePermission').mockReturnValue({ allowed: true });
    transactionManager.clearHistory();
  });

  it('BUG-081 a: wrappedWrite with {sceneId} registers in pendingSceneWrites', async () => {
    const promise = wrappedWrite(
      'test.op',
      async () => {
        // Inside the fn — sync check that the tx is registered.
        const pending = transactionManager.getPendingWritesForScene('scene-a');
        expect(pending.length).toBe(1);
        return 'ok';
      },
      { sceneId: 'scene-a' },
    );

    const result = await promise;
    expect(result).toBe('ok');

    // After commit, deregistered.
    expect(transactionManager.getPendingWritesForScene('scene-a')).toEqual([]);
  });

  it('BUG-081 b: wrappedWrite without {sceneId} does NOT register', async () => {
    await wrappedWrite('test.op-no-scene', async () => {
      expect(transactionManager.getPendingWritesForScene('scene-b')).toEqual([]);
      return 'ok';
    });
    expect(transactionManager.getPendingWritesForScene('scene-b')).toEqual([]);
  });

  it('BUG-081 c: rollback also deregisters', async () => {
    await expect(
      wrappedWrite(
        'test.op-throws',
        async () => {
          throw new Error('boom');
        },
        { sceneId: 'scene-c' },
      ),
    ).rejects.toThrow('boom');

    expect(transactionManager.getPendingWritesForScene('scene-c')).toEqual([]);
  });

  it('BUG-081 d: awaitPendingWritesForScene resolves immediately when no pending', async () => {
    const start = Date.now();
    await transactionManager.awaitPendingWritesForScene('scene-empty');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(50);
  });

  it('BUG-081 e: awaitPendingWritesForScene waits for all in-flight writes (the canonical BUG-081 repro)', async () => {
    // Fire 3 parallel wrappedWrite calls with {sceneId: "scene-x"} that resolve after 30ms each.
    let completedCount = 0;
    const slowWrite = (label: string) =>
      wrappedWrite(
        `light.create.${label}`,
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 30));
          completedCount++;
          return label;
        },
        { sceneId: 'scene-x' },
      );

    const w1 = slowWrite('a');
    const w2 = slowWrite('b');
    const w3 = slowWrite('c');

    // Immediately, 3 pending writes registered on the scene.
    expect(transactionManager.getPendingWritesForScene('scene-x').length).toBe(3);
    expect(completedCount).toBe(0);

    // The activate guard awaits; should resolve only AFTER all 3 commit.
    await transactionManager.awaitPendingWritesForScene('scene-x');
    expect(completedCount).toBe(3);

    // All 3 writes resolved.
    await Promise.all([w1, w2, w3]);
    expect(transactionManager.getPendingWritesForScene('scene-x')).toEqual([]);
  });

  it('BUG-081 f: awaitPendingWritesForScene throws on timeout', async () => {
    // Start a write that never completes.
    const stuckPromise = wrappedWrite(
      'stuck.write',
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return 'late';
      },
      { sceneId: 'scene-timeout' },
    );

    await expect(
      transactionManager.awaitPendingWritesForScene('scene-timeout', 100),
    ).rejects.toThrow(/timeout after 100ms/);

    // Drain the stuck write.
    await stuckPromise;
  });

  it('BUG-081 g: per-scene isolation — pending on scene-a does not block scene-b activate', async () => {
    // 1 pending on scene-a.
    const w1 = wrappedWrite(
      'light.create.iso',
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return 'a';
      },
      { sceneId: 'scene-a-iso' },
    );

    // scene-b has no pending; await should resolve immediately.
    const start = Date.now();
    await transactionManager.awaitPendingWritesForScene('scene-b-iso');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(30);

    await w1;
  });
});
