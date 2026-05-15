// Unit tests for the deepStripUndefined discipline — Task 8.9, Phase 5
// mcp_crud_expansion.
//
// B3 contract: deepStripUndefined ensures absent optional fields stay absent in
// the Foundry write payload. Undefined values must NOT be serialized — Foundry
// would interpret them as "clear the field", silently overwriting e.g.
// Tile.video.volume with the AlphaField initial value (0).
//
// Two scenarios:
//   S1: { video: {} }             → no video.volume key in result
//   S2: { video: { loop: undefined } } → no loop key in result.video
//
// These are pure unit tests against the local re-implementation of the helper.
// No live Foundry, no mocks required.

import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Local re-implementation of deepStripUndefined, copy-faithful from
// handlers/tile.ts lines 92-105.  Testing via re-implementation avoids
// needing to import the handler (which drags in Foundry globals).
// ---------------------------------------------------------------------------

function deepStripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(deepStripUndefined) as any;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      if (v === undefined) continue;
      out[k] = deepStripUndefined(v);
    }
    return out as any;
  }
  return value;
}

// ---------------------------------------------------------------------------
// S1: video: {} → no video.volume key in the stripped result
// ---------------------------------------------------------------------------

describe('S1: deepStripUndefined — video: {} → no video.volume emitted', () => {
  it('strips nested empty-object video sub-field entirely (no volume key)', () => {
    // Simulate a partial TileUpdateInput where only video:{} was supplied.
    // The Zod schema would produce { video: {} } with all sub-fields absent.
    const input = { video: {} };

    const result = deepStripUndefined(input) as Record<string, any>;

    // The video key is preserved (it's an object, not undefined)…
    expect(result).toHaveProperty('video');
    // …but no volume key must be present — it was never set.
    expect(result.video).not.toHaveProperty('volume');
    // Sanity: the result is the empty object, not undefined.
    expect(result.video).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// S2: video: { loop: undefined } → no loop key in result.video
// ---------------------------------------------------------------------------

describe('S2: deepStripUndefined — video: { loop: undefined } → loop key stripped', () => {
  it('removes explicit undefined loop from video sub-object', () => {
    // Simulate Zod producing { video: { loop: undefined } } when the caller
    // passed `video: {}` but the schema materialised the optional key as
    // undefined rather than omitting it entirely.
    const input = { video: { loop: undefined as boolean | undefined } };

    const result = deepStripUndefined(input) as Record<string, any>;

    expect(result).toHaveProperty('video');
    // The explicit undefined must be gone — Foundry must not see this key.
    expect(result.video).not.toHaveProperty('loop');
    expect(result.video).toEqual({});
  });
});
