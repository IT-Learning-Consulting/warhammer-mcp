// systemic_bug_class_prevention v2, Phase 2, task 1.1 — resume-boundary.ts unit tests.
//
// Mocks ONLY Foundry document dependencies (`foundry.utils.randomID`/`getProperty`, the same
// installFoundryUtils() shape verify-write.test.ts and operation-receipt.test.ts already use) —
// never this helper's own sequencing/undo/precheck logic. Every `run`/`undo`/`verify` in these
// tests is a real function whose invocation is observed via vi.fn() spies, not stubbed away.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  runWriteSteps,
  precheckAlreadyApplied,
  type WriteStep,
} from '../resume-boundary.js';

function installFoundryUtils() {
  (globalThis as any).foundry = {
    ...(globalThis as any).foundry,
    utils: {
      ...(globalThis as any).foundry?.utils,
      randomID: () => `id-${Math.random().toString(36).slice(2)}`,
      getProperty(obj: any, path: string): any {
        return path.split('.').reduce((cursor: any, seg: string) => cursor?.[seg], obj);
      },
    },
  };
}

beforeEach(() => {
  installFoundryUtils();
});

describe('runWriteSteps', () => {
  it('(i) step-2-of-3 failure: undoes step 1 (reverse order), never runs step 3, outcome partial, receipt lists step-1 ids', async () => {
    const step1Undo = vi.fn().mockResolvedValue(undefined);
    const step3Run = vi.fn().mockResolvedValue({ created: ['c3'] });

    const step1: WriteStep = {
      label: 'step1-create-actor',
      run: vi.fn().mockResolvedValue({ created: ['actor-1'] }),
      undo: step1Undo,
    };
    const step2: WriteStep = {
      label: 'step2-embed-items',
      run: vi.fn().mockRejectedValue(new Error('CREATE_EMBEDDED_DOCUMENTS_FAILED')),
    };
    const step3: WriteStep = {
      label: 'step3-advance-bump',
      run: step3Run,
    };

    const result = await runWriteSteps([step1, step2, step3]);

    expect(step1Undo).toHaveBeenCalledTimes(1);
    expect(step1Undo).toHaveBeenCalledWith({ created: ['actor-1'] });
    expect(step3Run).not.toHaveBeenCalled();
    expect(result.outcome).toBe('partial');
    expect(result.failedStep).toBe('step2-embed-items');
    expect(result.receipt.createdDocumentIds).toEqual(['actor-1']);
  });

  it('(ii) undo itself throws: warning present in receipt, original failure still surfaced (never swallowed)', async () => {
    const step1: WriteStep = {
      label: 'step1-create-actor',
      run: vi.fn().mockResolvedValue({ created: ['actor-1'] }),
      undo: vi.fn().mockRejectedValue(new Error('ROLLBACK_DELETE_FAILED')),
    };
    const step2: WriteStep = {
      label: 'step2-embed-items',
      run: vi.fn().mockRejectedValue(new Error('CREATE_EMBEDDED_DOCUMENTS_FAILED')),
    };

    const result = await runWriteSteps([step1, step2]);

    // Original failure still surfaced — never masked by the undo failure or swallowed into 'applied'.
    expect(result.outcome).not.toBe('applied');
    expect(result.outcome).toBe('partial');
    expect(result.failedStep).toBe('step2-embed-items');
    // Undo failure lands in receipt.warnings — never console-only (BUG-779 residual class).
    expect(result.receipt.warnings.length).toBeGreaterThan(0);
    expect(result.receipt.warnings[0]).toContain('step1-create-actor');
    expect(result.receipt.warnings[0]).toContain('ROLLBACK_DELETE_FAILED');
    expect(result.receipt.warnings[0]).toContain('CREATE_EMBEDDED_DOCUMENTS_FAILED');
    // The ids from the step that landed before the failure stay in the receipt as provenance,
    // even though its (failed) undo attempted to revert them.
    expect(result.receipt.createdDocumentIds).toEqual(['actor-1']);
  });

  it('(iv) full success: outcome applied, complete receipt, no undo called', async () => {
    const step1Undo = vi.fn();
    const step2Undo = vi.fn();
    const step1: WriteStep = {
      label: 'step1-create-actor',
      run: vi.fn().mockResolvedValue({ created: ['actor-1'] }),
      undo: step1Undo,
    };
    const step2: WriteStep = {
      label: 'step2-embed-items',
      run: vi.fn().mockResolvedValue({ created: ['item-1', 'item-2'] }),
      undo: step2Undo,
    };
    const step3: WriteStep = {
      label: 'step3-advance-bump',
      run: vi.fn().mockResolvedValue({ updated: ['actor-1'] }),
    };

    const result = await runWriteSteps([step1, step2, step3]);

    expect(result.outcome).toBe('applied');
    expect(result.failedStep).toBeUndefined();
    expect(result.receipt.createdDocumentIds).toEqual(['actor-1', 'item-1', 'item-2']);
    expect(result.receipt.updatedDocumentIds).toEqual(['actor-1']);
    expect(result.receipt.warnings).toEqual([]);
    expect(typeof result.receipt.operationId).toBe('string');
    expect(result.receipt.operationId.length).toBeGreaterThan(0);
    expect(step1Undo).not.toHaveBeenCalled();
    expect(step2Undo).not.toHaveBeenCalled();
  });

  it('step-1-of-N failure (nothing landed yet): outcome failed, not partial, no undo invoked', async () => {
    const step1: WriteStep = {
      label: 'step1-create-actor',
      run: vi.fn().mockRejectedValue(new Error('ACTOR_CREATE_FAILED')),
      undo: vi.fn(),
    };
    const step2Run = vi.fn().mockResolvedValue({ created: ['x'] });
    const step2: WriteStep = { label: 'step2-embed-items', run: step2Run };

    const result = await runWriteSteps([step1, step2]);

    expect(result.outcome).toBe('failed');
    expect(result.failedStep).toBe('step1-create-actor');
    expect(step1.undo).not.toHaveBeenCalled();
    expect(step2Run).not.toHaveBeenCalled();
    expect(result.receipt.createdDocumentIds).toEqual([]);
  });

  it('a thrown `verify` is treated exactly like a run() throw and triggers the undo cascade', async () => {
    const step1Undo = vi.fn().mockResolvedValue(undefined);
    const step1: WriteStep = {
      label: 'step1-create-actor',
      run: vi.fn().mockResolvedValue({ created: ['actor-1'] }),
      undo: step1Undo,
    };
    const step2: WriteStep = {
      label: 'step2-write-flag',
      run: vi.fn().mockResolvedValue({ updated: ['item-1'] }),
      verify: {
        kind: 'flag',
        doc: () => ({ getFlag: () => 'wrong-value' }),
        scope: 'warhammer-mcp',
        key: 'someFlag',
        expected: 'right-value',
        errorToken: 'SOME_FLAG_NOT_PERSISTED',
      },
    };

    const result = await runWriteSteps([step1, step2]);

    expect(step1Undo).toHaveBeenCalledTimes(1);
    expect(result.outcome).toBe('partial');
    expect(result.failedStep).toBe('step2-write-flag');
    // step2's own write ids never land in the receipt since its verify failed before landing.
    expect(result.receipt.updatedDocumentIds).toEqual([]);
  });
});

describe('precheckAlreadyApplied', () => {
  it('(iii) precheck true → caller never invokes its run function (count spy = 0)', async () => {
    const runSpy = vi.fn();
    const check = () => true;

    const alreadyApplied = await precheckAlreadyApplied(check);
    if (!alreadyApplied) {
      await runSpy();
    }

    expect(alreadyApplied).toBe(true);
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('precheck false → caller proceeds to invoke its run function', async () => {
    const runSpy = vi.fn();
    const check = () => false;

    const alreadyApplied = await precheckAlreadyApplied(check);
    if (!alreadyApplied) {
      await runSpy();
    }

    expect(alreadyApplied).toBe(false);
    expect(runSpy).toHaveBeenCalledTimes(1);
  });

  it('with `settle`, polls a not-yet-visible prior write until it settles true (composes settlePoll, does not fork it)', async () => {
    let calls = 0;
    const check = () => {
      calls += 1;
      return calls >= 3; // settles true on the 3rd read
    };

    const alreadyApplied = await precheckAlreadyApplied(check, { attempts: 5, delayMs: 1 });

    expect(alreadyApplied).toBe(true);
    expect(calls).toBeGreaterThanOrEqual(3);
  });

  it('with `settle`, returns false when the predicate never settles within the attempt budget', async () => {
    const check = () => false;

    const alreadyApplied = await precheckAlreadyApplied(check, { attempts: 2, delayMs: 1 });

    expect(alreadyApplied).toBe(false);
  });
});
