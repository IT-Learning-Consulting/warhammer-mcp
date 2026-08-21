// mcp_code_quality_v2 Phase C2 (RC2.1) — settle-poll.ts unit tests.
// Covers both call shapes: generic value-read + boolean-predicate deadline.

import { describe, it, expect } from 'vitest';
import { settlePoll } from '../handlers/modules/_shared/settle-poll.js';

describe('settlePoll — generic value-read form (narrator.ts shape)', () => {
  it('settles late: value becomes settled after N reads', async () => {
    let n = 0;
    const value = await settlePoll<number>(
      () => ++n,
      (v) => v >= 3,
      6,
      1,
    );
    expect(value).toBe(3);
  });

  it('never settles: returns the last-read value after exhausting attempts', async () => {
    let n = 0;
    const value = await settlePoll<number>(
      () => ++n,
      () => false,
      4,
      1,
    );
    // 1 initial read + up to 4 retry reads = 5 total reads
    expect(value).toBe(5);
  });

  it('immediate: settles on the first read, no retries consumed', async () => {
    const value = await settlePoll<number>(
      () => 42,
      (v) => v === 42,
      6,
      1,
    );
    expect(value).toBe(42);
  });

  // Deliverable-0 (bug-fix-campaign-123 Phase 3): narrator.ts's real call sites omit
  // attempts/delayMs entirely, relying on the documented defaults (6 attempts, 40ms delay). No
  // prior test exercised the truly-zero-optional-args call shape — a silent default change would
  // pass every other test here (which all pass explicit attempts/delayMs) while still breaking
  // every real omitted-args caller.
  it('regression guard: zero optional args (default attempts=6, delayMs=40) settles within the default attempt budget', async () => {
    let n = 0;
    const value = await settlePoll<number>(() => ++n, (v) => v >= 2);
    expect(value).toBe(2);
  });
});

describe('settlePoll — boolean-predicate deadline form (item-piles.ts shape)', () => {
  it('settles late: predicate becomes true within the deadline', async () => {
    let calls = 0;
    const persisted = () => ++calls >= 3;
    const result = await settlePoll(persisted, 200, 5);
    expect(result).toBe(true);
    expect(calls).toBeGreaterThanOrEqual(3);
  });

  it('never settles: returns false after timeout', async () => {
    const result = await settlePoll(() => false, 30, 5);
    expect(result).toBe(false);
  });

  it('immediate: settles on the first check, before any sleep', async () => {
    const result = await settlePoll(() => true, 2000, 200);
    expect(result).toBe(true);
  });

  it('initialDelayMs: sleeps once before the first check', async () => {
    const start = Date.now();
    let checked = false;
    const result = await settlePoll(
      () => {
        checked = true;
        return true;
      },
      2000,
      200,
      30,
    );
    const elapsed = Date.now() - start;
    expect(result).toBe(true);
    expect(checked).toBe(true);
    expect(elapsed).toBeGreaterThanOrEqual(25);
  });

  // Deliverable-0 (bug-fix-campaign-123 Phase 3): every item-piles call site (flow.ts, merchant.ts
  // — see grep across DP-16 verify sites) calls `settlePoll(() => predicate)` with NO other args,
  // relying on the deadline-form defaults (2000ms timeout / 200ms step / 0ms initial delay). This
  // proves a predicate that only settles on the SECOND underlying check (i.e. after one real
  // stepMs sleep) still resolves true — a silent shrink of the default stepMs below what real
  // callers implicitly depend on would still pass every other test in this file (all pass explicit
  // short steps) while breaking every real zero-args caller's retry budget.
  it('regression guard: zero optional args (default timeoutMs=2000, stepMs=200) settles after one default-length step', async () => {
    let calls = 0;
    const start = Date.now();
    const result = await settlePoll(() => ++calls >= 2);
    const elapsed = Date.now() - start;
    expect(result).toBe(true);
    expect(calls).toBeGreaterThanOrEqual(2);
    // ~1 default stepMs (200ms) elapsed before the 2nd check fired — bounds the default without
    // hardcoding an exact literal (jitter-tolerant, matches this file's existing initialDelayMs
    // assertion style), and rules out a shrunk default (e.g. 5ms) settling near-instantly instead.
    expect(elapsed).toBeGreaterThanOrEqual(150);
  }, 10000);
});
