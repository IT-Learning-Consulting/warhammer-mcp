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
});
