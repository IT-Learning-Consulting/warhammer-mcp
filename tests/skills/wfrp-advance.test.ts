// wfrp-advance.test.ts — exercises the /wfrp-advance sub-command flows.
//
// Mirrors SKILL.md's primitive sequence (post BUG-043 + BUG-046 fix):
//   1. getCharacterInfo to read current advances + spent xp + existing log
//   2. Compute total cost = sum(curve[Math.floor((current+k-1)/5)] for k in 1..count)
//      (banded per Rulebook §9; NOT per-advance curve[n])
//   3. Validate available xp; refuse if short
//   4. SINGLE updateActor call with merged updateData:
//        { 'system.characteristics.<char>.advances': newAdvances,
//          'system.details.experience.spent': prevSpent + totalCost,
//          'system.details.experience.log': [...prevLog, newEntry] }
//      — BUG-046: warhammer-mcp's updateActor now passes skipExperienceChecks:
//        true to bypass wfrp4e's Advancement Cost dialog. That flag ALSO
//        disables the system's auto-log-append, so the skill must write the
//        log itself (canonical shape from addToExpLog).
//      — NEVER two updateActor calls (BUG-043 double-bill risk).
//
// XP cost curve is fed via a mocked CONFIG-shaped object so the test does NOT
// hardcode 25/30/40/50 — if WFRP4e ever updates the curve, the skill follows.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  callMcp,
  clearMcpMocks,
  getCallLog,
  mockMcpCall,
} from './_harness.js';

interface MockConfig {
  WFRP4E: {
    xpCost: {
      characteristic: number[];
      skill: number[];
      talent: number[];
    };
  };
}

interface CharacterInfoStub {
  id: string;
  name: string;
  system: {
    characteristics: Record<string, { initial: number; advances: number; modifier: number }>;
    details: {
      experience: {
        total: number;
        spent: number;
        log: Array<{ id: string; reason: string; amount: number; spent: number }>;
      };
    };
  };
}

interface AdvanceResult {
  ok: boolean;
  reason?: string;
  costCharged?: number;
  newAdvances?: number;
  newSpent?: number;
  logEntriesAfter?: number;
}

async function runAdvanceCharacteristic(
  CONFIG: MockConfig,
  characterId: string,
  characteristic: string,
  advances: number,
): Promise<AdvanceResult> {
  const charEnv = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId })) as {
    success: boolean;
    data: CharacterInfoStub | null;
  };
  if (!charEnv.data) return { ok: false, reason: 'character not found' };
  const actor = charEnv.data;
  const current = actor.system.characteristics[characteristic]?.advances ?? 0;

  // BUG-045 / Rulebook §9: curve is BANDED, not per-advance.
  // curve[0] applies to the 1st–5th advance, curve[1] to the 6th–10th, etc.
  // cost of advance number n = curve[Math.floor((n - 1) / 5)]
  const curve = CONFIG.WFRP4E.xpCost.characteristic;
  let totalCost = 0;
  for (let k = 1; k <= advances; k++) {
    const advanceNumber = current + k;
    const bandIndex = Math.floor((advanceNumber - 1) / 5);
    if (curve[bandIndex] === undefined) {
      return { ok: false, reason: `xp curve exhausted at advance number ${advanceNumber}` };
    }
    totalCost += curve[bandIndex];
  }

  const available = actor.system.details.experience.total - actor.system.details.experience.spent;
  if (available < totalCost) {
    return { ok: false, reason: `insufficient xp (need ${totalCost}, have ${available})` };
  }

  // BUG-043: Single merged updateActor — NEVER split into two calls.
  // BUG-046: MCP's updateActor now passes skipExperienceChecks:true to bypass
  // wfrp4e's Advancement Cost dialog. That also disables auto-log-append, so
  // the skill owns the log write.
  const newSpent = actor.system.details.experience.spent + totalCost;
  const prevLog = actor.system.details.experience.log ?? [];
  const newLogEntry = {
    amount: totalCost,
    reason: `${characteristic} (${current + advances})`,
    spent: newSpent,
    total: actor.system.details.experience.total,
    type: 'spent' as const,
  };
  const newLog = [...prevLog, newLogEntry];
  await callMcp('warhammer-mcp.updateActor', {
    actorId: characterId,
    updateData: {
      [`system.characteristics.${characteristic}.advances`]: current + advances,
      'system.details.experience.spent': newSpent,
      'system.details.experience.log': newLog,
    },
  });

  return {
    ok: true,
    costCharged: totalCost,
    newAdvances: current + advances,
    newSpent,
    logEntriesAfter: newLog.length,
  };
}

function makeCharacter(overrides: Partial<CharacterInfoStub['system']> = {}): CharacterInfoStub {
  return {
    id: 'char1',
    name: 'Hans',
    system: {
      characteristics: {
        ws: { initial: 30, advances: 0, modifier: 0 },
        ...(overrides.characteristics ?? {}),
      },
      details: {
        experience: {
          total: 200,
          spent: 0,
          log: [],
          ...(overrides.details?.experience ?? {}),
        },
      },
    },
  };
}

beforeEach(() => {
  clearMcpMocks();
});

// -----------------------------------------------------------------------------
// Scenario 1 — happy: WS 2 → 3 charges xpCost.characteristic[2]
// -----------------------------------------------------------------------------

describe('wfrp-advance / happy path: WS 2 → 3', () => {
  it('charges band-0 for the 3rd advance (still in band 0-5) via a single merged updateActor call', async () => {
    const CONFIG: MockConfig = {
      WFRP4E: { xpCost: { characteristic: [25, 30, 40, 50, 70], skill: [], talent: [] } },
    };
    const actor = makeCharacter({
      characteristics: { ws: { initial: 30, advances: 2, modifier: 0 } },
      details: { experience: { total: 200, spent: 50, log: [{ id: 'l0', reason: 'seed', amount: -50, spent: 50 }] } },
    });

    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    const updates: any[] = [];
    mockMcpCall('warhammer-mcp.updateActor', (input: any) => {
      updates.push(input);
      return { success: true, data: { actorId: input.actorId } };
    });

    const res = await runAdvanceCharacteristic(CONFIG, 'char1', 'ws', 1);

    expect(res.ok).toBe(true);
    // Advance number 3 (current 2 + 1) → band floor(2/5)=0 → curve[0]=25
    // NOT curve[2]=40 (old per-advance misread)
    expect(res.costCharged).toBe(25);
    expect(res.newAdvances).toBe(3);
    expect(res.newSpent).toBe(75); // 50 + 25

    // BUG-043: exactly ONE updateActor call, both deltas merged
    expect(updates).toHaveLength(1);
    expect(updates[0].updateData['system.characteristics.ws.advances']).toBe(3);
    expect(updates[0].updateData['system.details.experience.spent']).toBe(75);

    // BUG-046: skill owns the log write (auto-append disabled by skipExperienceChecks).
    // Full array: seed entry preserved + new entry appended.
    const writtenLog = updates[0].updateData['system.details.experience.log'];
    expect(Array.isArray(writtenLog)).toBe(true);
    expect(writtenLog).toHaveLength(2);
    expect(writtenLog[0]).toEqual({ id: 'l0', reason: 'seed', amount: -50, spent: 50 }); // seed preserved
    expect(writtenLog[1]).toMatchObject({ amount: 25, spent: 75, type: 'spent' });
  });
});

// -----------------------------------------------------------------------------
// Scenario 2 — insufficient XP refuses and writes nothing
// -----------------------------------------------------------------------------

describe('wfrp-advance / insufficient xp', () => {
  it('refuses and emits no updateActor calls', async () => {
    const CONFIG: MockConfig = {
      WFRP4E: { xpCost: { characteristic: [25, 30, 40, 50, 70], skill: [], talent: [] } },
    };
    const actor = makeCharacter({
      characteristics: { ws: { initial: 30, advances: 0, modifier: 0 } },
      details: { experience: { total: 20, spent: 0, log: [] } },
    });
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.updateActor', { success: true, data: {} });

    const res = await runAdvanceCharacteristic(CONFIG, 'char1', 'ws', 1);

    expect(res.ok).toBe(false);
    expect(res.reason).toContain('insufficient xp');
    expect(res.reason).toContain('need 25');
    expect(res.reason).toContain('have 20');

    // No write attempted
    const updateCalls = getCallLog().filter(e => e.queryKey === 'warhammer-mcp.updateActor');
    expect(updateCalls).toHaveLength(0);
  });
});

// -----------------------------------------------------------------------------
// Scenario 3 — BUG-001 regression: curve change at CONFIG flows through to skill
// -----------------------------------------------------------------------------

describe('wfrp-advance / BUG-001 regression — uses CONFIG curve, not hardcoded', () => {
  it('charges different costs when CONFIG.xpCost.characteristic changes', async () => {
    const altCONFIG: MockConfig = {
      // Hypothetical errata: every step doubled
      WFRP4E: { xpCost: { characteristic: [50, 60, 80, 100, 140], skill: [], talent: [] } },
    };
    const actor = makeCharacter({
      characteristics: { ws: { initial: 30, advances: 0, modifier: 0 } },
      details: { experience: { total: 500, spent: 0, log: [] } },
    });
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.updateActor', { success: true, data: {} });

    const res = await runAdvanceCharacteristic(altCONFIG, 'char1', 'ws', 1);

    expect(res.ok).toBe(true);
    expect(res.costCharged).toBe(50); // first advance under altCONFIG, NOT 25
  });

  it('sums costs across band-crossing advances per the rulebook §9 table', async () => {
    const CONFIG: MockConfig = {
      WFRP4E: { xpCost: { characteristic: [25, 30, 40, 50, 70], skill: [], talent: [] } },
    };
    const actor = makeCharacter({
      characteristics: { ws: { initial: 30, advances: 3, modifier: 0 } },
      details: { experience: { total: 500, spent: 0, log: [] } },
    });
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.updateActor', { success: true, data: {} });

    // Buy 5 advances from current=3 → target numbers 4,5,6,7,8.
    // Bands: floor(3/5), floor(4/5), floor(5/5), floor(6/5), floor(7/5) = 0,0,1,1,1
    // Cost: 25 + 25 + 30 + 30 + 30 = 140 (per Rulebook §9 band table)
    const res = await runAdvanceCharacteristic(CONFIG, 'char1', 'ws', 5);

    expect(res.ok).toBe(true);
    expect(res.costCharged).toBe(140);
    expect(res.newAdvances).toBe(8);
  });

  it('all 5 advances in band 0 are the same cost (not 25+30+40+50+70)', async () => {
    const CONFIG: MockConfig = {
      WFRP4E: { xpCost: { characteristic: [25, 30, 40, 50, 70], skill: [], talent: [] } },
    };
    const actor = makeCharacter({
      characteristics: { ws: { initial: 30, advances: 0, modifier: 0 } },
      details: { experience: { total: 500, spent: 0, log: [] } },
    });
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.updateActor', { success: true, data: {} });

    // Buy 5 advances from 0 → target 1..5, all in band 0 → 25×5 = 125
    // Old per-advance misread would produce 25+30+40+50+70 = 215
    const res = await runAdvanceCharacteristic(CONFIG, 'char1', 'ws', 5);

    expect(res.ok).toBe(true);
    expect(res.costCharged).toBe(125);
  });
});

// -----------------------------------------------------------------------------
// Scenario 4 — BUG-018 regression: log entries accumulate, never overwrite
// -----------------------------------------------------------------------------

describe('wfrp-advance / BUG-018 regression — log is APPENDED, not overwritten', () => {
  it('writes the full log array (prev + new entry), never a single-entry overwrite', async () => {
    const CONFIG: MockConfig = {
      WFRP4E: { xpCost: { characteristic: [25, 30, 40, 50, 70], skill: [], talent: [] } },
    };
    const seedLog = [
      { id: 'l0', reason: 'chargen grant', amount: 100, spent: 0 },
      { id: 'l1', reason: 'session 1', amount: 50, spent: 0 },
      { id: 'l2', reason: 'Advanced ws to 1', amount: -25, spent: 25 },
    ];
    const actor = makeCharacter({
      characteristics: { ws: { initial: 30, advances: 1, modifier: 0 } },
      details: { experience: { total: 200, spent: 25, log: [...seedLog] } },
    });
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });

    const updates: any[] = [];
    mockMcpCall('warhammer-mcp.updateActor', (input: any) => {
      updates.push(input);
      return { success: true, data: {} };
    });

    const res = await runAdvanceCharacteristic(CONFIG, 'char1', 'ws', 1);

    expect(res.ok).toBe(true);
    // current=1, target 2, band 0 → cost 25; newSpent = 25 + 25 = 50
    expect(res.newSpent).toBe(50);

    // BUG-043 + BUG-018 + BUG-046: exactly one call, log preserves history + appends new entry,
    // spent bumped by exactly totalCost.
    expect(updates).toHaveLength(1);
    expect(updates[0].updateData['system.details.experience.spent']).toBe(50);

    // BUG-018: existing log entries preserved, new entry appended
    const writtenLog = updates[0].updateData['system.details.experience.log'];
    expect(writtenLog).toHaveLength(4); // 3 seed + 1 new
    expect(writtenLog.slice(0, 3)).toEqual(seedLog); // first three entries unchanged
    expect(writtenLog[3]).toMatchObject({ amount: 25, spent: 50, type: 'spent' });

    // Delta sanity: spent went up by exactly totalCost (25), not 2× (BUG-043)
    const spentDelta = 50 - 25;
    expect(spentDelta).toBe(res.costCharged);
  });
});

// -----------------------------------------------------------------------------
// Scenario 5 — BUG-043 regression: double-bill impossible even under adversarial mock
// -----------------------------------------------------------------------------

describe('wfrp-advance / BUG-043 regression — experience.spent bumped exactly once', () => {
  it('sums updateActor-captured spent-deltas to exactly totalCost (not 2× totalCost)', async () => {
    const CONFIG: MockConfig = {
      WFRP4E: { xpCost: { characteristic: [25, 30, 40, 50, 70], skill: [], talent: [] } },
    };
    const actor = makeCharacter({
      characteristics: { ws: { initial: 30, advances: 0, modifier: 0 } },
      details: { experience: { total: 200, spent: 0, log: [] } },
    });
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });

    const spentWrites: number[] = [];
    mockMcpCall('warhammer-mcp.updateActor', (input: any) => {
      const spentField = input.updateData['system.details.experience.spent'];
      if (spentField !== undefined) spentWrites.push(spentField);
      return { success: true, data: {} };
    });

    const res = await runAdvanceCharacteristic(CONFIG, 'char1', 'ws', 1);

    expect(res.ok).toBe(true);
    expect(res.costCharged).toBe(25);

    // The live BUG-043 smoke saw spent end at 50 (prevSpent=0 + 25 × 2 calls).
    // Exactly ONE write, value = prevSpent (0) + totalCost (25) = 25.
    expect(spentWrites).toHaveLength(1);
    expect(spentWrites[0]).toBe(25);
  });
});
