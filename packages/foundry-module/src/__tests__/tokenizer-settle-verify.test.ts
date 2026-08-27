// Fix-cycle round 1 (piv-validator F1, systemic_bug_class_prevention v2 Phase 3 task 2.2).
// Reachability proof for BUG-850's wildcard branch in settleAndVerifyTexture: a unit case for
// EACH side of the gate — (i) the new wildcard-success branch this task added, and (ii) the
// pre-existing concrete-path TOKENIZE_NOT_PERSISTED throw, proving the old exit-state survives
// the wildcard branch's addition. Neither the pre-existing test suite nor the live smoke probe
// (task 7.3) exercised either discriminating condition — see plan Gate decisions, 2026-08-26.
//
// settlePoll's generic form (settle-poll.ts) reads once synchronously and returns immediately
// when isSettled(value) already holds on that first read — case (i) and the optional success
// variant below both satisfy isSettled on the first read, so no fake timers are needed there.
// Case (ii) is the mirror image: the "old exit-state preserved" condition (unchanged .src) is
// BY DEFINITION never isSettled (see settleAndVerifyTexture's non-wildcard isSettled clause),
// so settlePoll genuinely exhausts its bounded real-timer retry loop (up to 6 attempts x 40ms)
// before returning — this is inherent to what case (ii) is proving (the write never lands), not
// a test-authoring gap. Real timers only, no vi.useFakeTimers(); the loop's real-world cost is a
// bounded ~240ms worst case, well inside vitest's default per-test timeout.

import { describe, it, expect, beforeEach } from 'vitest';
import { settleAndVerifyTexture } from '../handlers/modules/tokenizer/tokenizer.js';

beforeEach(() => {
  (globalThis as any).game = undefined;
  (globalThis as any).fromUuidSync = undefined;
});

describe('settleAndVerifyTexture — BUG-850 wildcard branch reachability (F1 fix-cycle)', () => {
  it('case (i): wildcard baseline + unchanged .src + non-null resultPath => SUCCESS (no error)', async () => {
    const baselineTexture = 'tokens/goblin-set/*';
    const actor = { prototypeToken: { texture: { src: baselineTexture } } }; // .src never repointed — by design for a wildcard set-member add
    (globalThis as any).fromUuidSync = () => actor;

    const result = await settleAndVerifyTexture('Actor.wildcard1', baselineTexture, 'tokens/goblin-set/003.webp');

    expect(result.error).toBeUndefined();
    expect(result.texture).toBe(baselineTexture);
  });

  it('case (ii): concrete baseline + unchanged .src != resultPath => still throws TOKENIZE_NOT_PERSISTED (old exit-state preserved)', async () => {
    const baselineTexture = 'actors/npc/goblin.webp';
    const resultPath = 'actors/npc/goblin_tokenized.webp';
    const actor = { prototypeToken: { texture: { src: baselineTexture } } }; // never repoints — genuine non-persisted write
    (globalThis as any).fromUuidSync = () => actor;

    const result = await settleAndVerifyTexture('Actor.concrete1', baselineTexture, resultPath);

    expect(result.error).toContain('TOKENIZE_NOT_PERSISTED');
    expect(result.texture).toBe(baselineTexture);
  }, 2000); // bounded real-timer retry loop inherent to proving the never-settles case; default 5000ms timeout is ample

  it('optional: concrete baseline + .src updates to resultPath => SUCCESS (completeness case)', async () => {
    const baselineTexture = 'actors/npc/goblin.webp';
    const resultPath = 'actors/npc/goblin_tokenized.webp';
    const actor = { prototypeToken: { texture: { src: resultPath } } }; // already repointed by settle time
    (globalThis as any).fromUuidSync = () => actor;

    const result = await settleAndVerifyTexture('Actor.concrete2', baselineTexture, resultPath);

    expect(result.error).toBeUndefined();
    expect(result.texture).toBe(resultPath);
  });
});
