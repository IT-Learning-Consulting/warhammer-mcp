// wfrp-status.test.ts — char vs creature schema branching (BUG-022 regression).

import { describe, it, expect, beforeEach } from 'vitest';
import { callMcp, clearMcpMocks, mockMcpCall } from './_harness.js';

interface CharStub {
  id: string; name: string; type: 'character' | 'npc';
  system: { details: { status: { tier: string; standing: number; modifier: number } } };
}
interface CreatureStub {
  id: string; name: string; type: 'creature';
  system: { details: { status: { tier: number; modifier: number } } };
}

// BUG-044: explicit tierKey → number mapping per SKILL.md; creatures write numeric.
const TIER_TO_NUMBER: Record<string, number> = { g: 3, s: 2, b: 1 };

function normalizeTierKey(input: string): string | null {
  // Accept keys ('g'/'s'/'b') or labels ('gold'/'silver'/'brass', case-insensitive).
  const lower = input.toLowerCase();
  if (lower in TIER_TO_NUMBER) return lower;
  if (lower === 'gold') return 'g';
  if (lower === 'silver') return 's';
  if (lower === 'brass') return 'b';
  return null;
}

async function runSetStatus(actorId: string, tier: string | number, standing?: number) {
  const env = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId: actorId })) as {
    success: boolean; data: CharStub | CreatureStub;
  };
  const config = (await callMcp('warhammer-mcp.get-wfrp-config', { keys: ['statusTiers'] })) as {
    success: boolean; data: { statusTiers: Record<string, string> };
  };

  const isCharacter = env.data.type === 'character' || env.data.type === 'npc';
  const tierKey = typeof tier === 'string' ? normalizeTierKey(tier) : null;

  if (isCharacter) {
    if (tierKey === null || !(tierKey in config.data.statusTiers)) {
      return { ok: false, reason: `unknown tier '${tier}'` };
    }
    const updateEnv = (await callMcp('warhammer-mcp.update-actor', {
      actorId,
      updateData: {
        'system.details.status.tier': tierKey,
        'system.details.status.standing': standing,
      },
    })) as { success: boolean; error?: string };
    // BUG-044: surface envelope errors; do NOT emit success line on failure
    if (!updateEnv.success) return { ok: false, reason: updateEnv.error ?? 'update-actor failed' };
    return { ok: true, wrote: 'character' };
  } else {
    // Creature: convert tier string to numeric; allow raw number for internal callers
    let tierNumber: number | null = null;
    if (typeof tier === 'number' && Number.isFinite(tier)) {
      tierNumber = tier;
    } else if (tierKey !== null) {
      tierNumber = TIER_TO_NUMBER[tierKey] ?? null;
    }
    if (tierNumber === null || !Number.isFinite(tierNumber)) {
      return { ok: false, reason: 'creature tier must resolve to a finite number' };
    }
    const updateEnv = (await callMcp('warhammer-mcp.update-actor', {
      actorId,
      updateData: { 'system.details.status.tier': tierNumber },
    })) as { success: boolean; error?: string };
    if (!updateEnv.success) return { ok: false, reason: updateEnv.error ?? 'update-actor failed' };
    return { ok: true, wrote: 'creature' };
  }
}

async function runWeeklyEarn(actorId: string) {
  const env = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId: actorId })) as {
    success: boolean; data: CharStub;
  };
  const config = (await callMcp('warhammer-mcp.get-wfrp-config', { keys: ['earningValues'] })) as {
    success: boolean; data: { earningValues: Record<string, string> };
  };
  const tier = env.data.system.details.status.tier;
  const standing = env.data.system.details.status.standing;
  const formula = config.data.earningValues[tier];
  return formula ? `${formula} × ${standing}` : null;
}

beforeEach(() => clearMcpMocks());

describe('wfrp-status / character path (string tier)', () => {
  it('writes tier as string + standing as number to character.system.details.status', async () => {
    const actor: CharStub = {
      id: 'c1', name: 'Hans', type: 'character',
      system: { details: { status: { tier: 'b', standing: 12, modifier: 0 } } },
    };
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.get-wfrp-config', {
      success: true, data: { statusTiers: { g: 'TIER.Gold', s: 'TIER.Silver', b: 'TIER.Brass' } },
    });
    let captured: any = null;
    mockMcpCall('warhammer-mcp.update-actor', (i: any) => { captured = i; return { success: true, data: {} }; });

    const r = await runSetStatus('c1', 's', 30);

    expect(r.ok).toBe(true);
    expect(r.wrote).toBe('character');
    expect(captured.updateData['system.details.status.tier']).toBe('s');
    expect(captured.updateData['system.details.status.standing']).toBe(30);
    // Never write the derived `value` field
    expect(captured.updateData['system.details.status.value']).toBeUndefined();
  });
});

describe('wfrp-status / creature path (numeric tier)', () => {
  it('writes tier as number, no standing field', async () => {
    const actor: CreatureStub = {
      id: 'cr1', name: 'Wolf', type: 'creature',
      system: { details: { status: { tier: 0, modifier: 0 } } },
    };
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.get-wfrp-config', {
      success: true, data: { statusTiers: { g: 'TIER.Gold', s: 'TIER.Silver', b: 'TIER.Brass' } },
    });
    let captured: any = null;
    mockMcpCall('warhammer-mcp.update-actor', (i: any) => { captured = i; return { success: true, data: {} }; });

    const r = await runSetStatus('cr1', 2);

    expect(r.ok).toBe(true);
    expect(r.wrote).toBe('creature');
    expect(captured.updateData['system.details.status.tier']).toBe(2);
    expect(typeof captured.updateData['system.details.status.tier']).toBe('number');
    expect(captured.updateData['system.details.status.standing']).toBeUndefined();
  });
});

describe('wfrp-status / weekly earn formula', () => {
  it('emits earningValues[tier] × standing as a string formula, no dice rolled', async () => {
    const actor: CharStub = {
      id: 'c2', name: 'Anna', type: 'character',
      system: { details: { status: { tier: 's', standing: 32, modifier: 0 } } },
    };
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.get-wfrp-config', {
      success: true, data: { earningValues: { b: '2d10', s: '1d10', g: '1' } },
    });

    const formula = await runWeeklyEarn('c2');
    expect(formula).toBe('1d10 × 32');
  });
});

describe('wfrp-status / BUG-022 regression — char vs creature schema split', () => {
  it('character payload never contains numeric tier; creature payload never contains standing', async () => {
    const char: CharStub = {
      id: 'c3', name: 'Hans', type: 'character',
      system: { details: { status: { tier: 'b', standing: 5, modifier: 0 } } },
    };
    const creature: CreatureStub = {
      id: 'cr2', name: 'Pig', type: 'creature',
      system: { details: { status: { tier: 0, modifier: 0 } } },
    };

    const writes: any[] = [];
    mockMcpCall('warhammer-mcp.get-wfrp-config', {
      success: true, data: { statusTiers: { g: 'TIER.Gold', s: 'TIER.Silver', b: 'TIER.Brass' } },
    });
    mockMcpCall('warhammer-mcp.update-actor', (i: any) => { writes.push(i); return { success: true, data: {} }; });

    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: char });
    await runSetStatus('c3', 'g', 10);

    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: creature });
    await runSetStatus('cr2', 1);

    // Character write
    const charWrite = writes[0].updateData;
    expect(typeof charWrite['system.details.status.tier']).toBe('string');
    expect(charWrite['system.details.status.standing']).toBe(10);

    // Creature write
    const crWrite = writes[1].updateData;
    expect(typeof crWrite['system.details.status.tier']).toBe('number');
    expect(crWrite['system.details.status.standing']).toBeUndefined();
  });
});

// -----------------------------------------------------------------------------
// BUG-044 regression — creature tier write converts 'brass' → 1 (JS number)
// -----------------------------------------------------------------------------

describe('wfrp-status / BUG-044 regression — creature tier key → number conversion', () => {
  it('writes a JS number for creature tier, even when input is tier key/label string', async () => {
    const creature: CreatureStub = {
      id: 'cr-wolf', name: 'Wolf', type: 'creature',
      system: { details: { status: { tier: 0, modifier: 0 } } },
    };
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: creature });
    mockMcpCall('warhammer-mcp.get-wfrp-config', {
      success: true, data: { statusTiers: { g: 'TIER.Gold', s: 'TIER.Silver', b: 'TIER.Brass' } },
    });
    let captured: any = null;
    mockMcpCall('warhammer-mcp.update-actor', (i: any) => { captured = i; return { success: true, data: {} }; });

    // Input: label 'brass' (what live smoke used). Must resolve to numeric 1.
    const r = await runSetStatus('cr-wolf', 'brass');

    expect(r.ok).toBe(true);
    expect(r.wrote).toBe('creature');
    const writtenTier = captured.updateData['system.details.status.tier'];
    expect(typeof writtenTier).toBe('number');
    expect(Number.isFinite(writtenTier)).toBe(true);
    expect(writtenTier).toBe(1); // brass → 1 per TIER_TO_NUMBER
    // Creature payload NEVER contains standing
    expect(captured.updateData['system.details.status.standing']).toBeUndefined();
  });

  it('surfaces update-actor envelope error instead of emitting a false success line', async () => {
    const creature: CreatureStub = {
      id: 'cr-wolf', name: 'Wolf', type: 'creature',
      system: { details: { status: { tier: 0, modifier: 0 } } },
    };
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: creature });
    mockMcpCall('warhammer-mcp.get-wfrp-config', {
      success: true, data: { statusTiers: { g: 'TIER.Gold', s: 'TIER.Silver', b: 'TIER.Brass' } },
    });
    // Simulate the exact Foundry rejection the live smoke hit.
    mockMcpCall('warhammer-mcp.update-actor', {
      success: false,
      error: 'DataModelValidationError: system.details.status.tier: must be a finite number',
    });

    const r = await runSetStatus('cr-wolf', 'brass');

    // BUG-044 guardrail: do NOT emit `ok: true` when envelope says `success: false`
    expect(r.ok).toBe(false);
    expect(r.reason).toContain('finite number');
  });
});
