// wfrp-combat.test.ts — exercises the /wfrp-combat sub-command flows.
//
// /wfrp-combat is a Markdown skill spec executed by the LLM at runtime. This test ships
// runners per sub-command that mirror SKILL.md's primitive sequence, so call-log
// assertions can cover the happy path, damage + condition narration, clean combat end
// (no skill-side housekeeping — wfrp4e system auto-clears advantage on deleteCombat),
// and WFRP condition stacking regression.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  callMcp,
  clearMcpMocks,
  getCallLog,
  mockMcpCall,
} from './_harness.js';

interface CombatantStub {
  id: string;
  actorId: string;
  name: string;
  initiative: number;
}

async function runStart(actorIds: string[]): Promise<{ order: string[] }> {
  await callMcp('warhammer-mcp.getActiveScene');
  const combatEnv = (await callMcp('warhammer-mcp.getCombat')) as { success: boolean; data: unknown };
  if (combatEnv.data) throw new Error('Combat already active');
  await callMcp('warhammer-mcp.addCombatants', { actorIds });
  await callMcp('warhammer-mcp.advanceCombat', { action: 'rollAll' });
  await callMcp('warhammer-mcp.advanceCombat', { action: 'start' });
  const list = (await callMcp('warhammer-mcp.listCombatants')) as { success: boolean; data: CombatantStub[] };
  return { order: list.data.map(c => c.name) };
}

async function runNext(): Promise<{ currentName: string }> {
  const c = (await callMcp('warhammer-mcp.getCombat')) as { success: boolean; data: { id: string } | null };
  if (!c.data) throw new Error('No active combat');
  const adv = (await callMcp('warhammer-mcp.advanceCombat', { action: 'next' })) as {
    success: boolean;
    data: { combatantId: string };
  };
  const list = (await callMcp('warhammer-mcp.listCombatants')) as { success: boolean; data: CombatantStub[] };
  const current = list.data.find(cc => cc.id === adv.data.combatantId);
  if (current) {
    await callMcp('warhammer-mcp.listConditions', { actorId: current.actorId });
  }
  return { currentName: current?.name ?? '?' };
}

async function runDamage(
  actorId: string,
  amount: number,
  hitLocation?: string,
): Promise<{ narration: string[] }> {
  const res = (await callMcp('warhammer-mcp.applyDamage', {
    actorId,
    amount,
    hitLocation,
  })) as { success: boolean; data: { before: any; after: any } };
  const before = res.data.before;
  const after = res.data.after;
  const woundsDelta = before.wounds.value - after.wounds.value;
  const narration: string[] = [`Wounds -${woundsDelta} (now ${after.wounds.value}/${after.wounds.max})`];
  const newConditions = (after.conditions as string[]).filter(c => !(before.conditions as string[]).includes(c));
  for (const c of newConditions) narration.push(`Inflicted: ${c}`);
  return { narration };
}

async function runApplyCondition(
  actorId: string,
  conditionKey: string,
): Promise<{ line: string }> {
  const res = (await callMcp('warhammer-mcp.applyCondition', { actorId, conditionKey })) as {
    success: boolean;
    data: { stackCount: number };
  };
  const stack = res.data.stackCount;
  const line = stack === 1 ? `${conditionKey} applied` : `${conditionKey} increased to ${stack}`;
  return { line };
}

async function runEnd(): Promise<{ endedId: string }> {
  const c = (await callMcp('warhammer-mcp.getCombat')) as { success: boolean; data: { id: string } | null };
  if (!c.data) throw new Error('No active combat');
  const res = (await callMcp('warhammer-mcp.endCombat')) as { success: boolean; data: { ended: string } };
  return { endedId: res.data.ended };
}

beforeEach(() => {
  clearMcpMocks();
});

function defaultCombatMocks(combatants: CombatantStub[]) {
  mockMcpCall('warhammer-mcp.getActiveScene', { success: true, data: { id: 's1', name: 'Stage' } });
  mockMcpCall('warhammer-mcp.listCombatants', { success: true, data: combatants });
  mockMcpCall('warhammer-mcp.listConditions', { success: true, data: [] });
}

// -----------------------------------------------------------------------------
// Scenario 1 — happy path: start 3-combatant combat, next turn, end
// -----------------------------------------------------------------------------

describe('wfrp-combat / start + next + end happy path', () => {
  it('drives a 3-combatant combat through start → next → end', async () => {
    const combatants: CombatantStub[] = [
      { id: 'co1', actorId: 'a1', name: 'Hero',  initiative: 67 },
      { id: 'co2', actorId: 'a2', name: 'Rogue', initiative: 51 },
      { id: 'co3', actorId: 'a3', name: 'Grunt', initiative: 44 },
    ];
    defaultCombatMocks(combatants);

    // start: getCombat returns null on first call; after start, next-phase tests would
    // see combat.data populated — but within a single scenario we overload getCombat per
    // runner. Here, `start` needs null; `next` + `end` need populated.
    mockMcpCall('warhammer-mcp.getCombat', (input: any) => {
      void input;
      return { success: true, data: null };
    });
    mockMcpCall('warhammer-mcp.addCombatants', { success: true, data: { added: ['co1', 'co2', 'co3'] } });
    mockMcpCall('warhammer-mcp.advanceCombat', (input: any) => ({
      success: true,
      data: { combatId: 'c1', round: 1, turn: 0, combatantId: 'co1', action: input.action },
    }));

    const startRes = await runStart(['a1', 'a2', 'a3']);
    expect(startRes.order).toEqual(['Hero', 'Rogue', 'Grunt']);

    // For `next`, flip getCombat mock to populated
    mockMcpCall('warhammer-mcp.getCombat', { success: true, data: { id: 'c1', round: 1, turn: 0 } });
    mockMcpCall('warhammer-mcp.advanceCombat', {
      success: true,
      data: { combatId: 'c1', round: 1, turn: 1, combatantId: 'co2' },
    });

    const nextRes = await runNext();
    expect(nextRes.currentName).toBe('Rogue');

    mockMcpCall('warhammer-mcp.endCombat', { success: true, data: { ended: 'c1' } });
    const endRes = await runEnd();
    expect(endRes.endedId).toBe('c1');

    const keys = getCallLog().map(e => e.queryKey);
    expect(keys).toContain('warhammer-mcp.addCombatants');
    expect(keys).toContain('warhammer-mcp.endCombat');
    expect(keys).not.toContain('warhammer-mcp.updateActor');
  });
});

// -----------------------------------------------------------------------------
// Scenario 2 — damage + condition narration
// -----------------------------------------------------------------------------

describe('wfrp-combat / damage applies wounds and narrates inflicted conditions', () => {
  it('reports wounds delta and surfaces conditions present after but not before', async () => {
    mockMcpCall('warhammer-mcp.applyDamage', {
      success: true,
      data: {
        actorId: 'a1',
        damage: { amount: 5, damageType: 'NORMAL', hitLocation: 'body' },
        before: {
          wounds: { value: 12, max: 12 },
          criticalWounds: { value: 0, max: 2 },
          fate: { value: 2 },
          fortune: { value: 2 },
          advantage: { value: 0 },
          conditions: [],
        },
        after: {
          wounds: { value: 7, max: 12 },
          criticalWounds: { value: 0, max: 2 },
          fate: { value: 2 },
          fortune: { value: 2 },
          advantage: { value: 0 },
          conditions: ['bleeding'],
        },
      },
    });

    const { narration } = await runDamage('a1', 5, 'body');
    expect(narration[0]).toContain('Wounds -5');
    expect(narration).toContain('Inflicted: bleeding');
  });
});

// -----------------------------------------------------------------------------
// Scenario 3 — end delegates cleanup to the system (no skill-side fan-out)
// -----------------------------------------------------------------------------

describe('wfrp-combat / end calls endCombat once and does not fan out updateActor', () => {
  it('delegates advantage clearing to the wfrp4e CombatHelpers.endCombat hook', async () => {
    const combatants: CombatantStub[] = [
      { id: 'co1', actorId: 'a1', name: 'Hero',  initiative: 67 },
      { id: 'co2', actorId: 'a2', name: 'Rogue', initiative: 51 },
      { id: 'co3', actorId: 'a3', name: 'Grunt', initiative: 44 },
    ];
    defaultCombatMocks(combatants);
    mockMcpCall('warhammer-mcp.getCombat', { success: true, data: { id: 'c1' } });
    mockMcpCall('warhammer-mcp.endCombat', { success: true, data: { ended: 'c1' } });

    const { endedId } = await runEnd();

    expect(endedId).toBe('c1');
    const log = getCallLog();
    expect(log.filter(e => e.queryKey === 'warhammer-mcp.endCombat')).toHaveLength(1);
    expect(log.filter(e => e.queryKey === 'warhammer-mcp.updateActor')).toHaveLength(0);
  });
});

// -----------------------------------------------------------------------------
// Scenario 4 — regression: Minor → Major condition stacking narration
// -----------------------------------------------------------------------------

describe('wfrp-combat / condition stacking reports increase, not re-apply', () => {
  it('narrates "applied" on first call and "increased to 2" on second', async () => {
    let stack = 0;
    mockMcpCall('warhammer-mcp.applyCondition', (input: any) => {
      stack += 1;
      return {
        success: true,
        data: { actorId: input.actorId, conditionKey: input.conditionKey, stackCount: stack },
      };
    });

    const first = await runApplyCondition('a1', 'bleeding');
    const second = await runApplyCondition('a1', 'bleeding');

    expect(first.line).toBe('bleeding applied');
    expect(second.line).toBe('bleeding increased to 2');
  });
});
