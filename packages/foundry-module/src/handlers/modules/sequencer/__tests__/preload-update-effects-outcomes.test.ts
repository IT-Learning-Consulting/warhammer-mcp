// BUG-806 — `preload` discarded Sequencer's own `Preloader.preload()` resolution (which the live
// v4.2.2 bundle proves resolves to a real `numFilesFailedToLoad` count, sequencer.js:11078-11082,
// 11332-11358) and always reported the REQUESTED file count as succeeded.
//
// BUG-807 — `update-effects` accepted an omitted/empty `updates` object as a silent no-op and
// always returned `success:true` even when every settled update was rejected.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dispatchModuleSequencer } from '../sequencer.js';

beforeEach(() => {
  (globalThis as any).game = {
    user: { isGM: true },
    modules: { get: (id: string) => (id === 'sequencer' ? { active: true } : null) },
  };
});

afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).Sequencer;
});

describe('preload — BUG-806', () => {
  it('reports outcome:"partial" and a real failedCount when Preloader.preload() resolves a nonzero failure count', async () => {
    (globalThis as any).Sequencer = { Preloader: { preload: vi.fn().mockResolvedValue(1) } };

    const result: any = await dispatchModuleSequencer({
      action: 'preload',
      files: ['jb2a.ok.webm', 'jb2a.missing.webm'],
    });

    expect(result.success).toBe(true);
    expect(result.data.outcome).toBe('partial');
    expect(result.data.failedCount).toBe(1);
    expect(result.data.succeededCount).toBe(1);
  });

  it('reports outcome:"applied" when nothing failed (baseline: previously always reported the requested count regardless)', async () => {
    (globalThis as any).Sequencer = { Preloader: { preload: vi.fn().mockResolvedValue(0) } };

    const result: any = await dispatchModuleSequencer({
      action: 'preload',
      files: ['jb2a.ok1.webm', 'jb2a.ok2.webm'],
    });

    expect(result.success).toBe(true);
    expect(result.data.outcome).toBe('applied');
    expect(result.data.failedCount).toBe(0);
    expect(result.data.succeededCount).toBe(2);
  });
});

describe('update-effects — BUG-807', () => {
  it('rejects an omitted/empty updates object instead of silently no-opping', async () => {
    (globalThis as any).Sequencer = { EffectManager: { updateEffects: vi.fn() } };

    const result: any = await dispatchModuleSequencer({
      action: 'update-effects',
      filter: { name: 'my-effect' },
      updates: {},
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('updates is required');
    expect((globalThis as any).Sequencer.EffectManager.updateEffects).not.toHaveBeenCalled();
  });

  it('reports outcome:"failed" (baseline: success:true) when every settled update is rejected', async () => {
    (globalThis as any).Sequencer = {
      EffectManager: {
        updateEffects: vi.fn().mockResolvedValue([
          { status: 'rejected', reason: new Error('no matching effect') },
          { status: 'rejected', reason: new Error('no matching effect') },
        ]),
      },
    };

    const result: any = await dispatchModuleSequencer({
      action: 'update-effects',
      filter: { name: 'my-effect' },
      updates: { opacity: 0.5 },
    });

    expect(result.success).toBe(true);
    expect(result.data.outcome).toBe('failed');
    expect(result.data.updatedCount).toBe(0);
    expect(result.data.failedCount).toBe(2);
    expect(result.data.failureReasons).toEqual(['no matching effect', 'no matching effect']);
  });

  it('reports outcome:"partial" when some settle and some reject', async () => {
    (globalThis as any).Sequencer = {
      EffectManager: {
        updateEffects: vi.fn().mockResolvedValue([
          { status: 'fulfilled', value: undefined },
          { status: 'rejected', reason: new Error('gone') },
        ]),
      },
    };

    const result: any = await dispatchModuleSequencer({
      action: 'update-effects',
      filter: { name: 'my-effect' },
      updates: { opacity: 0.5 },
    });

    expect(result.success).toBe(true);
    expect(result.data.outcome).toBe('partial');
    expect(result.data.updatedCount).toBe(1);
    expect(result.data.failedCount).toBe(1);
  });

  it('reports outcome:"applied" when every update settles (regression guard)', async () => {
    (globalThis as any).Sequencer = {
      EffectManager: {
        updateEffects: vi.fn().mockResolvedValue([{ status: 'fulfilled', value: undefined }]),
      },
    };

    const result: any = await dispatchModuleSequencer({
      action: 'update-effects',
      filter: { name: 'my-effect' },
      updates: { opacity: 0.5 },
    });

    expect(result.success).toBe(true);
    expect(result.data.outcome).toBe('applied');
    expect(result.data.failureReasons).toBeUndefined();
  });
});
