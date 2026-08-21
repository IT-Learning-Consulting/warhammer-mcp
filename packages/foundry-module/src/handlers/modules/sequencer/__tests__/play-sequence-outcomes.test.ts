// BUG-794 — Sequence.play() discards its own internal Promise.allSettled results in a .then()
// that ignores them (sequencer.js:27719-27763, live Sequencer v4.2.2), so a missing asset / render
// failure on a fire-and-forget section silently resolves play() as if nothing went wrong. This
// proves the fix: wrapping each section's own _execute() to record its outcome BEFORE upstream's
// allSettled discards it, for both an all-succeed, a one-failed, and an all-failed sequence.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dispatchModuleSequencer } from '../sequencer.js';

/** A fake Section carrying a real _execute() the wrapper can intercept — either resolves or
 *  rejects, mirroring section.run() throwing on a missing asset / invalid render data. */
function fakeSection(shouldFail: boolean) {
  return {
    shouldWaitUntilFinished: false, // fire-and-forget — exactly the path BUG-794 discarded
    _initialize: vi.fn().mockResolvedValue(undefined),
    _execute: vi.fn().mockImplementation(async () => {
      if (shouldFail) throw new Error('ASSET_NOT_FOUND: jb2a.nonexistent.effect');
      return undefined;
    }),
  };
}

/** Mirrors Sequence.play()'s REAL internal shape closely enough to exercise the wrapper: a
 *  `sections` array the fluent builder would have populated, and a `play()` that runs the same
 *  allSettled-then-discard pattern as sequencer.js:27719-27763 (the exact behavior under test). */
function makeRealisticSequenceMock(sections: ReturnType<typeof fakeSection>[]) {
  const seq: any = {
    sections,
    effect: vi.fn(() => {
      const chain: any = {};
      const methods = ['file', 'atLocation', 'attachTo', 'stretchTo', 'scale', 'duration', 'fadeIn', 'fadeOut', 'opacity', 'delay', 'rotate', 'tint', 'name', 'origin', 'repeats', 'persist', 'belowTokens', 'waitUntilFinished'];
      for (const m of methods) chain[m] = vi.fn(() => chain);
      return chain;
    }),
    fromJSON: vi.fn(),
    play: vi.fn().mockImplementation(async () => {
      // Faithful mini-replica of sequencer.js:27719-27763's own discard behavior.
      const promises = seq.sections.map((s: any) => s._execute());
      return Promise.allSettled(promises).then(() => undefined);
    }),
  };
  return seq;
}

beforeEach(() => {
  (globalThis as any).game = {
    user: { isGM: true },
    modules: { get: (id: string) => (id === 'sequencer' ? { active: true } : null) },
  };
  (globalThis as any).Sequencer = { EffectManager: {}, SoundManager: {}, Preloader: {}, Database: {} };
  (globalThis as any).canvas = { tokens: { get: vi.fn(), placeables: [] }, templates: { get: vi.fn() } };
});

afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).Sequencer;
  delete (globalThis as any).Sequence;
  delete (globalThis as any).canvas;
});

describe('handlePlaySequenceJson — BUG-794 per-section outcome tracking', () => {
  it('all sections succeed -> outcome applied, no failures reported', async () => {
    const sections = [fakeSection(false), fakeSection(false)];
    const seq = makeRealisticSequenceMock(sections);
    (globalThis as any).Sequence = vi.fn(() => seq);

    const result: any = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'effect', file: 'jb2a.ok1' }, { type: 'effect', file: 'jb2a.ok2' }],
    });

    expect(result.success).toBe(true);
    expect(result.data.outcome).toBe('applied');
    expect(result.data.playedCount).toBe(2);
    expect(result.data.failedCount).toBe(0);
    expect(result.data.failures).toEqual([]);
  });

  it('one section fails (previously silently discarded) -> outcome partial, failure captured', async () => {
    const sections = [fakeSection(false), fakeSection(true)];
    const seq = makeRealisticSequenceMock(sections);
    (globalThis as any).Sequence = vi.fn(() => seq);

    const result: any = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'effect', file: 'jb2a.ok' }, { type: 'effect', file: 'jb2a.missing' }],
    });

    // Pre-fix this would have been success:true, played:true, no trace of the failure at all.
    expect(result.success).toBe(true);
    expect(result.data.outcome).toBe('partial');
    expect(result.data.playedCount).toBe(1);
    expect(result.data.failedCount).toBe(1);
    expect(result.data.failures[0]).toContain('ASSET_NOT_FOUND');
  });

  it('all sections fail -> outcome failed, success notification suppressed', async () => {
    const sections = [fakeSection(true), fakeSection(true)];
    const seq = makeRealisticSequenceMock(sections);
    (globalThis as any).Sequence = vi.fn(() => seq);

    const result: any = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'effect', file: 'jb2a.missing1' }, { type: 'effect', file: 'jb2a.missing2' }],
    });

    expect(result.success).toBe(true); // the MCP call itself didn't throw — the SECTIONS failed
    expect(result.data.outcome).toBe('failed');
    expect(result.data.played).toBe(false);
    expect(result.data.playedCount).toBe(0);
    expect(result.data.failedCount).toBe(2);
  });

  it('play() itself still throws normally for a real deserialize/synchronous error (unrelated to the fix)', async () => {
    (globalThis as any).Sequence = vi.fn(() => {
      throw new Error('SEQUENCE_CLASS_CONSTRUCTION_ERROR');
    });

    const result: any = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'effect', file: 'jb2a.x' }],
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('SEQUENCER_PLAY_ERROR');
  });
});
