// DP-16 / CCR-1 — verifyDocWrite unit test.
// 5 cases: happy / drift-throws / disappearance (field absent from _source) /
// opt-out (documented as "don't call" — no flag on the helper itself) /
// .-= marker skip.  Includes the idempotent-no-op pin.

import { describe, it, expect, beforeEach } from 'vitest';
import { verifyDocWrite, verifyFlagWrite, verifyScalarWrite } from '../utils/verifyWrite.js';

function installFoundryUtils() {
  (globalThis as any).foundry = {
    ...(globalThis as any).foundry,
    utils: {
      ...(globalThis as any).foundry?.utils,
      getProperty(obj: any, path: string): any {
        return path.split('.').reduce((cursor: any, seg: string) => cursor?.[seg], obj);
      },
    },
  };
}

beforeEach(() => {
  installFoundryUtils();
});

/** Build a stub Foundry Document with a _source bag. */
function makeDoc(sourceData: Record<string, unknown>): unknown {
  return { _source: sourceData };
}

describe('verifyDocWrite (DP-16 / CCR-1)', () => {
  it('happy path: all fields match _source — returns void, no throw', () => {
    const doc = makeDoc({ 'text': { content: 'Hello' }, name: 'Page 1' });
    expect(() =>
      verifyDocWrite(doc, { 'text.content': 'Hello', name: 'Page 1' }, 'JOURNAL_WRITE_NOT_PERSISTED'),
    ).not.toThrow();
  });

  it('idempotent no-op pin: actual already equals expected — no throw (success, not drift)', () => {
    // actual === expected means the write was either a true no-op or already persisted;
    // both are success — verifyDocWrite must not throw.
    const doc = makeDoc({ level: 3 });
    expect(() =>
      verifyDocWrite(doc, { level: 3 }, 'UPDATE_ACTIVE_EFFECT_NOT_PERSISTED'),
    ).not.toThrow();
  });

  it('drift: one field mismatches — throws errorToken with path summary', () => {
    const doc = makeDoc({ name: 'Old Name' });
    expect(() =>
      verifyDocWrite(doc, { name: 'New Name' }, 'BEHAVIOR_WRITE_NOT_PERSISTED'),
    ).toThrow(/BEHAVIOR_WRITE_NOT_PERSISTED/);
  });

  it('disappearance: field absent from _source — getProperty returns undefined, throws as drift', () => {
    // When a field is missing from _source entirely, undefined !== expected → drift throw.
    const doc = makeDoc({}); // _source has no 'disabled' key
    expect(() =>
      verifyDocWrite(doc, { disabled: false }, 'BEHAVIOR_WRITE_NOT_PERSISTED'),
    ).toThrow(/BEHAVIOR_WRITE_NOT_PERSISTED/);
  });

  // opt-out: verifyDocWrite has no skip flag; callers that need to bypass simply
  // do not call it (e.g. system-derived fields that auto-compute via prepareDerivedData).
  // No test case needed for the helper itself — the opt-out is a caller-side decision.

  it('.-= deletion marker in expectedFields is skipped — no false drift thrown', () => {
    // Foundry deletion markers like "system.qualities.value.-=0": null cannot be
    // validated via value comparison on the re-read doc; they must be silently skipped.
    const doc = makeDoc({ system: { qualities: { value: ['sharp'] } } });
    expect(() =>
      verifyDocWrite(
        doc,
        { 'system.qualities.value.-=0': null },
        'UPDATE_ACTIVE_EFFECT_NOT_PERSISTED',
      ),
    ).not.toThrow();
  });

  it('skipPaths option: caller-declared path skipped — no drift even on mismatch', () => {
    const doc = makeDoc({ mode: -1, name: 'Playlist' });
    // mode is DISABLED (-1 → -1 is fine) but caller wants to skip it
    expect(() =>
      verifyDocWrite(
        doc,
        { mode: 99, name: 'Playlist' },
        'PLAYLIST_WRITE_NOT_PERSISTED',
        { skipPaths: ['mode'] },
      ),
    ).not.toThrow();
  });
});

// R2.5 — verifyFlagWrite: flags read back via doc.getFlag(scope, key). WHY it matters:
// a silently-dropped setFlag leaves the flag-driven behavior (patrol mode, queued craft)
// permanently inert while the write returned success — exactly the BUG-070 silent-drop class.
describe('verifyFlagWrite (DP-16 / R2.5)', () => {
  /** Stub Document whose getFlag resolves from a nested flags bag. */
  function makeFlagDoc(flags: Record<string, Record<string, unknown>>): unknown {
    return {
      getFlag(scope: string, key: string) {
        return flags?.[scope]?.[key];
      },
    };
  }

  it('happy path: flag read-back equals expected — no throw', () => {
    const doc = makeFlagDoc({ patrol: { makePatroller: true } });
    expect(() =>
      verifyFlagWrite(doc, 'patrol', 'makePatroller', true, 'PATROL_FLAG_NOT_PERSISTED'),
    ).not.toThrow();
  });

  it('drift: flag read-back mismatches expected — throws errorToken with scope.key', () => {
    const doc = makeFlagDoc({ patrol: { enablePatrol: false } });
    expect(() =>
      verifyFlagWrite(doc, 'patrol', 'enablePatrol', true, 'PATROL_FLAG_NOT_PERSISTED'),
    ).toThrow(/PATROL_FLAG_NOT_PERSISTED: flag "patrol\.enablePatrol"/);
  });

  it('silent drop: flag absent after write — getFlag undefined ≠ expected → throws', () => {
    const doc = makeFlagDoc({ patrol: {} }); // setFlag silently no-op'd
    expect(() =>
      verifyFlagWrite(doc, 'patrol', 'pathNodeIndex', 3, 'PATROL_FLAG_NOT_PERSISTED'),
    ).toThrow(/PATROL_FLAG_NOT_PERSISTED/);
  });

  it('object value: deep-equal via JSON compare — matching object passes', () => {
    const pending = { time: 1200, items: [{ name: 'Sword' }] };
    const doc = makeFlagDoc({ mastercrafted: { abc123: pending } });
    expect(() =>
      verifyFlagWrite(doc, 'mastercrafted', 'abc123', { time: 1200, items: [{ name: 'Sword' }] }, 'MASTERCRAFTED_PENDING_CRAFT_NOT_PERSISTED'),
    ).not.toThrow();
  });

  it('object value drift: changed nested field throws', () => {
    const doc = makeFlagDoc({ mastercrafted: { abc123: { time: 1200, items: [] } } });
    expect(() =>
      verifyFlagWrite(doc, 'mastercrafted', 'abc123', { time: 9999, items: [] }, 'MASTERCRAFTED_PENDING_CRAFT_NOT_PERSISTED'),
    ).toThrow(/MASTERCRAFTED_PENDING_CRAFT_NOT_PERSISTED/);
  });
});

describe('verifyScalarWrite (mcp_code_quality_v2 Phase C2, RC2.4)', () => {
  it('happy path: exact match — no throw', () => {
    expect(() => verifyScalarWrite(5, 5, 'X_NOT_PERSISTED')).not.toThrow();
  });

  it('coercion tolerance: Number setting registered value vs string boundary input — no throw', () => {
    // game.settings.set coerces "1.5" (string, MCP-boundary input) to 1.5 (number, registered type)
    expect(() => verifyScalarWrite(1.5, '1.5', 'SETTING_NOT_PERSISTED')).not.toThrow();
  });

  it('coercion tolerance: Boolean setting registered value vs string boundary input — no throw', () => {
    expect(() => verifyScalarWrite(true, 'true', 'SETTING_NOT_PERSISTED')).not.toThrow();
  });

  it('genuine drift: mismatched values still throw', () => {
    expect(() => verifyScalarWrite(2, 3, 'X_NOT_PERSISTED')).toThrow(/X_NOT_PERSISTED/);
  });

  it('genuine drift: coercion does not mask a real value change', () => {
    expect(() => verifyScalarWrite(false, true, 'SETTING_NOT_PERSISTED')).toThrow(/SETTING_NOT_PERSISTED/);
  });
});
