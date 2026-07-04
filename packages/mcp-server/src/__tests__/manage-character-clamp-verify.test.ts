// mcp_code_quality_v2 Phase F (BUG-434) — clamp-aware verifyStatsPersisted unit tests.
//
// `manage-character update-stats` writing a value outside a bounded pool's derived range
// (e.g. currentWounds above system.status.wounds.max) used to false-fail
// UPDATE_STATS_NOT_PERSISTED even though Foundry's own clamp landed the write correctly at
// the bound. verifyStatsPersisted now checks the sibling `.max`/`.min` before throwing.
// Regression guard: a genuine persistence failure (re-read matches neither the requested
// value nor the clamp) must still throw — the clamp tolerance must not swallow real bugs.

import { describe, it, expect } from 'vitest';
import { ManageCharacterTool } from '../tools/manage-character.js';
import { makeToolDeps } from './test-utils.js';

/** Minimal character stub — pre-write lookup (wounds below max). */
const CHAR_STUB = {
  id: 'char001234567890',
  name: 'Aldric',
  type: 'character',
  system: {
    details: { experience: { current: 0, total: 0, spent: 0, log: [] }, gmnotes: { value: '' }, biography: { value: '' } },
    status: { wounds: { value: 5, max: 8 } },
    gmnotes: { value: '' },
  },
  items: [],
};

describe('manage-character update-stats — BUG-434 clamp-aware verify', () => {
  it('wounds requested above derived max: clamped write reports success, not UPDATE_STATS_NOT_PERSISTED', async () => {
    let calls = 0;
    const mockFn = (key: string) => {
      if (key === 'warhammer-mcp.updateActor') return {};
      calls++;
      if (calls === 1) return CHAR_STUB; // pre-write lookup
      // post-write verify re-read: Foundry clamped the write to the derived max (8)
      return { ...CHAR_STUB, system: { ...CHAR_STUB.system, status: { wounds: { value: 8, max: 8 } } } };
    };
    const result = await new ManageCharacterTool(makeToolDeps(mockFn)).handle({
      action: 'update-stats',
      characterName: 'Aldric',
      updates: { currentWounds: 10 },
    });
    expect(typeof result).toBe('string');
    expect(result).not.toContain('UPDATE_STATS_NOT_PERSISTED');
    expect(result).toContain('Clamped to derived bounds');
    expect(result).toContain('currentWounds: requested 10, clamped to derived bound 8');
  });

  it('wounds requested within bounds: no clamp note, unchanged happy-path behavior', async () => {
    let calls = 0;
    const mockFn = (key: string) => {
      if (key === 'warhammer-mcp.updateActor') return {};
      calls++;
      if (calls === 1) return CHAR_STUB;
      return { ...CHAR_STUB, system: { ...CHAR_STUB.system, status: { wounds: { value: 6, max: 8 } } } };
    };
    const result = await new ManageCharacterTool(makeToolDeps(mockFn)).handle({
      action: 'update-stats',
      characterName: 'Aldric',
      updates: { currentWounds: 6 },
    });
    expect(result).not.toContain('Clamped to derived bounds');
    expect(result).not.toContain('UPDATE_STATS_NOT_PERSISTED');
  });

  it('regression guard: a genuine non-clamp persistence failure still throws UPDATE_STATS_NOT_PERSISTED', async () => {
    let calls = 0;
    const mockFn = (key: string) => {
      if (key === 'warhammer-mcp.updateActor') return {};
      calls++;
      if (calls === 1) return CHAR_STUB;
      // post-write re-read shows the write never landed at all (stuck at the old value,
      // and 5 is neither the requested 10 nor the clamp bound 8) — must still fail loud.
      return { ...CHAR_STUB, system: { ...CHAR_STUB.system, status: { wounds: { value: 5, max: 8 } } } };
    };
    await expect(
      new ManageCharacterTool(makeToolDeps(mockFn)).handle({
        action: 'update-stats',
        characterName: 'Aldric',
        updates: { currentWounds: 10 },
      }),
    ).rejects.toThrow(/UPDATE_STATS_NOT_PERSISTED/);
  });
});
