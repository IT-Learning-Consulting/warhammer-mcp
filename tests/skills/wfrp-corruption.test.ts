// wfrp-corruption.test.ts — exercises the /wfrp-corruption sub-command flows.
//
// Mirrors SKILL.md's primitive sequence:
//   add    → read actor; compute resistance = TB + WPB; bump corruption.value
//   test   → requestPlayerRolls { skill: "Cool"|"Endurance" } →
//            PASS: reset to 0, no mutation;
//            FAIL: delegate to /wfrp-mutation (one Minor Mutation), reset to 0.
//
// BUG-030 regression: there is NO ×1/×2/×3 threshold ladder. Core Rulebook
// p.183 has a single threshold (TB + WPB), a single test, a single Minor
// Mutation on failure. The predecessor tool invented Minor/Moderate/Major
// tiers; this skill's workflow contains no such math.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  callMcp,
  clearMcpMocks,
  getCallLog,
  mockMcpCall,
} from './_harness.js';

interface CharacterInfoStub {
  id: string;
  name: string;
  system: {
    characteristics: {
      t: { bonus: number };
      wp: { bonus: number };
    };
    status: { corruption: { value: number } };
  };
}

interface AddResult {
  ok: boolean;
  current: number;
  resistance: number;
  atThreshold: boolean;
}

async function runAddCorruption(
  characterId: string,
  amount: number,
): Promise<AddResult> {
  const charEnv = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId })) as {
    success: boolean;
    data: CharacterInfoStub | null;
  };
  if (!charEnv.data) return { ok: false, current: 0, resistance: 0, atThreshold: false };
  const actor = charEnv.data;
  const resistance = actor.system.characteristics.t.bonus + actor.system.characteristics.wp.bonus;
  const newCorruption = actor.system.status.corruption.value + amount;

  await callMcp('warhammer-mcp.updateActor', {
    actorId: characterId,
    updateData: { 'system.status.corruption.value': newCorruption },
  });

  return { ok: true, current: newCorruption, resistance, atThreshold: newCorruption >= resistance };
}

interface TestResult {
  ok: boolean;
  reason?: string;
  outcome?: 'pass' | 'fail';
  finalCorruption?: number;
  mutationDelegated?: boolean;
}

// Test harness tracks delegation to /wfrp-mutation via a side-effect function
// since we can't actually invoke another skill here.
async function runTestCorruption(
  characterId: string,
  skill: 'Cool' | 'Endurance',
  onMutationDelegate: (mutationType: 'physical' | 'mental') => Promise<void>,
): Promise<TestResult> {
  const charEnv = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId })) as {
    success: boolean;
    data: CharacterInfoStub | null;
  };
  if (!charEnv.data) return { ok: false, reason: 'character not found' };
  const actor = charEnv.data;
  const resistance = actor.system.characteristics.t.bonus + actor.system.characteristics.wp.bonus;
  const current = actor.system.status.corruption.value;

  if (current < resistance) {
    return { ok: false, reason: `not yet at resistance threshold (${current}/${resistance})` };
  }

  const rollEnv = (await callMcp('warhammer-mcp.requestPlayerRolls', {
    actorId: characterId,
    tests: [{ skill, difficulty: 'challenging' }],
  })) as { success: boolean; data: { passed: boolean } };

  const passed = rollEnv.data.passed;
  let mutationDelegated = false;

  if (!passed) {
    // GM convention: Cool → mental, Endurance → physical
    const mutationType: 'physical' | 'mental' = skill === 'Endurance' ? 'physical' : 'mental';
    await onMutationDelegate(mutationType);
    mutationDelegated = true;
  }

  // Reset-on-resolution — both pass and fail set corruption to 0
  await callMcp('warhammer-mcp.updateActor', {
    actorId: characterId,
    updateData: { 'system.status.corruption.value': 0 },
  });

  return {
    ok: true,
    outcome: passed ? 'pass' : 'fail',
    finalCorruption: 0,
    mutationDelegated,
  };
}

function makeActor(overrides?: Partial<CharacterInfoStub['system']>): CharacterInfoStub {
  return {
    id: 'actor1',
    name: 'Hans',
    system: {
      characteristics: {
        t: { bonus: 3 },
        wp: { bonus: 3 },
      },
      status: { corruption: { value: 0 } },
      ...overrides,
    } as CharacterInfoStub['system'],
  };
}

beforeEach(() => {
  clearMcpMocks();
});

// -----------------------------------------------------------------------------
// Scenario 1 — Happy: add below threshold, no test triggered
// -----------------------------------------------------------------------------

describe('wfrp-corruption / happy — add below threshold', () => {
  it('bumps corruption.value and reports resistance without firing a test', async () => {
    const actor = makeActor({
      characteristics: { t: { bonus: 3 }, wp: { bonus: 3 } }, // resistance=6
      status: { corruption: { value: 2 } },
    });

    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    const updates: any[] = [];
    mockMcpCall('warhammer-mcp.updateActor', (input: any) => {
      updates.push(input);
      return { success: true, data: {} };
    });

    const res = await runAddCorruption('actor1', 2); // 2 + 2 = 4, still < 6

    expect(res.ok).toBe(true);
    expect(res.current).toBe(4);
    expect(res.resistance).toBe(6);
    expect(res.atThreshold).toBe(false);

    expect(updates).toHaveLength(1);
    expect(updates[0].updateData['system.status.corruption.value']).toBe(4);

    // No rollRequest / no mutation delegate
    const rollCalls = getCallLog().filter(e => e.queryKey === 'warhammer-mcp.requestPlayerRolls');
    expect(rollCalls).toHaveLength(0);
  });

  it('signals at-threshold when new corruption crosses resistance (one single threshold)', async () => {
    const actor = makeActor({
      characteristics: { t: { bonus: 3 }, wp: { bonus: 3 } }, // resistance=6
      status: { corruption: { value: 4 } },
    });
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.updateActor', { success: true, data: {} });

    const res = await runAddCorruption('actor1', 3); // 4+3=7 >= 6

    expect(res.current).toBe(7);
    expect(res.atThreshold).toBe(true);

    // There is only ONE threshold. No secondary 2× or 3× that would classify
    // the result into "Moderate" or "Major" — the skill makes no such
    // distinction.
  });
});

// -----------------------------------------------------------------------------
// Scenario 2 — Test fail: requestPlayerRolls fails → delegate to /wfrp-mutation
// -----------------------------------------------------------------------------

describe('wfrp-corruption / test fail — exactly one Minor Mutation delegated', () => {
  it('delegates to /wfrp-mutation roll on fail, then resets corruption to 0', async () => {
    const actor = makeActor({
      characteristics: { t: { bonus: 3 }, wp: { bonus: 3 } }, // resistance=6
      status: { corruption: { value: 7 } }, // at/over threshold
    });

    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.requestPlayerRolls', {
      success: true,
      data: { passed: false },
    });
    const updates: any[] = [];
    mockMcpCall('warhammer-mcp.updateActor', (input: any) => {
      updates.push(input);
      return { success: true, data: {} };
    });

    const delegateFn = vi.fn(async (mutationType: 'physical' | 'mental') => {
      void mutationType;
    });

    const res = await runTestCorruption('actor1', 'Endurance', delegateFn);

    expect(res.ok).toBe(true);
    expect(res.outcome).toBe('fail');
    expect(res.mutationDelegated).toBe(true);
    expect(res.finalCorruption).toBe(0);

    // Exactly ONE delegation — not two (no "Moderate" second mutation), not
    // three (no "Major"). BUG-030 regression.
    expect(delegateFn).toHaveBeenCalledTimes(1);
    expect(delegateFn).toHaveBeenCalledWith('physical'); // Endurance → physical by convention

    // Corruption reset to 0
    expect(updates).toHaveLength(1);
    expect(updates[0].updateData['system.status.corruption.value']).toBe(0);
  });
});

// -----------------------------------------------------------------------------
// Scenario 3 — Test pass: no mutation, but corruption still resets to 0
// -----------------------------------------------------------------------------

describe('wfrp-corruption / test pass — no mutation, still reset to 0', () => {
  it('does not delegate to /wfrp-mutation, resets corruption to 0', async () => {
    const actor = makeActor({
      characteristics: { t: { bonus: 3 }, wp: { bonus: 3 } },
      status: { corruption: { value: 6 } },
    });

    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.requestPlayerRolls', {
      success: true,
      data: { passed: true },
    });
    const updates: any[] = [];
    mockMcpCall('warhammer-mcp.updateActor', (input: any) => {
      updates.push(input);
      return { success: true, data: {} };
    });

    const delegateFn = vi.fn();
    const res = await runTestCorruption('actor1', 'Cool', delegateFn);

    expect(res.ok).toBe(true);
    expect(res.outcome).toBe('pass');
    expect(res.mutationDelegated).toBe(false);
    expect(res.finalCorruption).toBe(0);

    expect(delegateFn).not.toHaveBeenCalled(); // no mutation on pass
    expect(updates).toHaveLength(1);
    expect(updates[0].updateData['system.status.corruption.value']).toBe(0);
  });

  it('refuses test when corruption is below resistance', async () => {
    const actor = makeActor({
      characteristics: { t: { bonus: 3 }, wp: { bonus: 3 } },
      status: { corruption: { value: 3 } }, // below 6
    });
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });

    const delegateFn = vi.fn();
    const res = await runTestCorruption('actor1', 'Cool', delegateFn);

    expect(res.ok).toBe(false);
    expect(res.reason).toContain('not yet at resistance threshold (3/6)');
    expect(delegateFn).not.toHaveBeenCalled();
  });
});

// -----------------------------------------------------------------------------
// Scenario 4 — BUG-030 regression: the workflow has no ×1/×2/×3 ladder
// -----------------------------------------------------------------------------

describe('wfrp-corruption / BUG-030 regression — no Minor/Moderate/Major ladder', () => {
  it('a single exposure twice over resistance still fires exactly ONE Minor Mutation', async () => {
    const actor = makeActor({
      characteristics: { t: { bonus: 4 }, wp: { bonus: 4 } }, // resistance=8
      status: { corruption: { value: 17 } }, // 2.125× the threshold
    });

    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.requestPlayerRolls', {
      success: true,
      data: { passed: false },
    });
    mockMcpCall('warhammer-mcp.updateActor', { success: true, data: {} });

    const delegateFn = vi.fn();
    const res = await runTestCorruption('actor1', 'Endurance', delegateFn);

    // If the predecessor's ladder were still here, this corruption level
    // (>2× resistance) would roll a "Moderate" mutation — or worse, two
    // mutations (Minor + Moderate). Canonical Core rules give ONE Minor
    // Mutation regardless of how far over resistance the actor went.
    expect(delegateFn).toHaveBeenCalledTimes(1);
    expect(res.finalCorruption).toBe(0); // reset to 0, not to "minor threshold"
  });

  it('a single exposure far over resistance (3×+) still fires exactly ONE mutation', async () => {
    const actor = makeActor({
      characteristics: { t: { bonus: 3 }, wp: { bonus: 3 } }, // resistance=6
      status: { corruption: { value: 21 } }, // 3.5× threshold
    });

    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.requestPlayerRolls', {
      success: true,
      data: { passed: false },
    });
    mockMcpCall('warhammer-mcp.updateActor', { success: true, data: {} });

    const delegateFn = vi.fn();
    const res = await runTestCorruption('actor1', 'Endurance', delegateFn);

    expect(delegateFn).toHaveBeenCalledTimes(1);
    expect(res.finalCorruption).toBe(0);
  });
});
