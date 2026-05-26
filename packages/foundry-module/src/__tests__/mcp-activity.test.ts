// Unit tests for the MCP in-flight counter (mcp-activity.ts).
//
// WHY these tests exist: the counter is the strict gate for the dialog-chime
// feature.  A false negative (counter stuck at 0 when a request is in flight)
// means missed chimes; a false positive (counter stuck > 0 after the request
// ends) means the GM's manual dialogs start chiming.  The depth semantics are
// especially important: concurrent queries must not clear the flag early when
// the inner one finishes.

import { describe, it, expect, beforeEach } from 'vitest';

// Each test imports fresh module state by re-importing via a unique specifier.
// We instead reset by calling endMcpActivity enough times after each test.
// (Vitest does not isolate module state between tests by default.)
import { beginMcpActivity, endMcpActivity, isMcpActive } from '../mcp-activity.js';

// Helper: drain any leftover count after a test.
function reset(): void {
  for (let i = 0; i < 20; i++) endMcpActivity();
}

describe('mcp-activity counter', () => {
  beforeEach(() => reset());

  it('starts inactive', () => {
    // WHY: counter must be 0 before any request begins or manual dialogs chime.
    expect(isMcpActive()).toBe(false);
  });

  it('becomes active after beginMcpActivity()', () => {
    // WHY: counter must cross 0→1 immediately on begin so the hook sees it.
    beginMcpActivity();
    expect(isMcpActive()).toBe(true);
  });

  it('returns to inactive after a balanced begin/end', () => {
    // WHY: every successful request path must clear the flag or future manual
    // dialogs will chime indefinitely.
    beginMcpActivity();
    endMcpActivity();
    expect(isMcpActive()).toBe(false);
  });

  it('stays active when inner of two concurrent queries finishes first (depth)', () => {
    // WHY: two concurrent MCP requests each call begin.  When the inner one
    // completes it calls end once.  The outer request is still in flight so the
    // counter must remain > 0.  A boolean flag would incorrectly go false here.
    beginMcpActivity(); // outer
    beginMcpActivity(); // inner (concurrent)
    endMcpActivity();   // inner finishes
    expect(isMcpActive()).toBe(true); // outer still in flight
    endMcpActivity();   // outer finishes
    expect(isMcpActive()).toBe(false);
  });

  it('clamps at 0 — extra endMcpActivity() calls never go negative', () => {
    // WHY: unbalanced end() calls (e.g. a bug that calls finally twice) must
    // not leave the counter at -1, which would permanently suppress chimes.
    endMcpActivity();
    endMcpActivity();
    endMcpActivity();
    expect(isMcpActive()).toBe(false);
  });
});
