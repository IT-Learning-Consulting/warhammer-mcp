// wfrp-rest-recover.test.ts — exercises /wfrp-rest-recover sub-commands.
//
// Verifies: short rest (wounds += TB, fatigued -1), long rest (full wounds,
// fortune = fate.value, multi-condition clear), no .max writes (PRD R4.2).

import { describe, it, expect, beforeEach } from 'vitest';
import {
  callMcp,
  clearMcpMocks,
  getCallLog,
  mockMcpCall,
} from './_harness.js';

interface PCStub {
  id: string;
  name: string;
  type: 'character';
  system: {
    characteristics: { t: { initial: number; advances: number; modifier: number } };
    status: {
      wounds: { value: number; max: number };
      fate: { value: number };
      fortune: { value: number };
    };
  };
}

function tb(actor: PCStub) {
  const t = actor.system.characteristics.t;
  return Math.floor((t.initial + t.advances + t.modifier) / 10);
}

async function runShortRest(actorId: string) {
  const env = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId: actorId })) as {
    success: boolean; data: PCStub;
  };
  const a = env.data;
  const newWounds = Math.min(a.system.status.wounds.value + tb(a), a.system.status.wounds.max);

  const condEnv = (await callMcp('warhammer-mcp.listConditions', { actorId })) as {
    success: boolean; data: Array<{ conditionKey: string; value: number }>;
  };
  for (const c of condEnv.data) {
    if (c.conditionKey === 'fatigued') {
      await callMcp('warhammer-mcp.removeCondition', { actorId, conditionKey: 'fatigued', count: 1 });
    }
  }

  await callMcp('warhammer-mcp.update-actor', {
    actorId,
    updateData: { 'system.status.wounds.value': newWounds },
  });
  return { newWounds, tb: tb(a) };
}

async function runLongRest(actorId: string) {
  const env = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId: actorId })) as {
    success: boolean; data: PCStub;
  };
  const a = env.data;

  const condEnv = (await callMcp('warhammer-mcp.listConditions', { actorId })) as {
    success: boolean; data: Array<{ conditionKey: string; value: number }>;
  };
  const REST_CLEARS = new Set(['fatigued', 'stunned', 'surprised']);
  for (const c of condEnv.data) {
    if (REST_CLEARS.has(c.conditionKey)) {
      await callMcp('warhammer-mcp.removeCondition', {
        actorId, conditionKey: c.conditionKey, count: c.value,
      });
    }
  }

  await callMcp('warhammer-mcp.update-actor', {
    actorId,
    updateData: {
      'system.status.wounds.value': a.system.status.wounds.max,
      'system.status.fortune.value': a.system.status.fate.value,
    },
  });
  return {
    newWounds: a.system.status.wounds.max,
    newFortune: a.system.status.fate.value,
  };
}

beforeEach(() => clearMcpMocks());

describe('wfrp-rest-recover / short rest', () => {
  it('regenerates TB wounds, removes fatigued, no .max writes', async () => {
    const a: PCStub = {
      id: 'a1', name: 'Hans', type: 'character',
      system: {
        characteristics: { t: { initial: 35, advances: 0, modifier: 0 } }, // TB=3
        status: {
          wounds: { value: 7, max: 14 },
          fate: { value: 3 },
          fortune: { value: 1 },
        },
      },
    };
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: a });
    mockMcpCall('warhammer-mcp.listConditions', { success: true, data: [{ conditionKey: 'fatigued', value: 1 }] });

    const updates: any[] = [];
    mockMcpCall('warhammer-mcp.update-actor', (i: any) => { updates.push(i); return { success: true, data: {} }; });
    mockMcpCall('warhammer-mcp.removeCondition', { success: true, data: { remainingCount: 0 } });

    const r = await runShortRest('a1');
    expect(r.newWounds).toBe(10); // 7 + 3
    expect(r.tb).toBe(3);

    const calls = getCallLog().map(e => e.queryKey);
    expect(calls).toContain('warhammer-mcp.removeCondition');

    // No .max paths in any update payload
    for (const u of updates) {
      const paths = Object.keys(u.updateData);
      expect(paths.some(p => /\.max$/.test(p))).toBe(false);
    }
  });
});

describe('wfrp-rest-recover / long rest', () => {
  it('refills wounds, sets fortune = fate.value, clears multiple short-term conditions', async () => {
    const a: PCStub = {
      id: 'a2', name: 'Gustav', type: 'character',
      system: {
        characteristics: { t: { initial: 30, advances: 0, modifier: 0 } },
        status: {
          wounds: { value: 3, max: 12 },
          fate: { value: 2 },
          fortune: { value: 0 },
        },
      },
    };
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: a });
    mockMcpCall('warhammer-mcp.listConditions', {
      success: true,
      data: [
        { conditionKey: 'fatigued', value: 2 },
        { conditionKey: 'stunned', value: 1 },
        { conditionKey: 'bleeding', value: 1 }, // NOT cleared by long rest
      ],
    });

    const updates: any[] = [];
    const removes: any[] = [];
    mockMcpCall('warhammer-mcp.update-actor', (i: any) => { updates.push(i); return { success: true, data: {} }; });
    mockMcpCall('warhammer-mcp.removeCondition', (i: any) => { removes.push(i); return { success: true, data: {} }; });

    const r = await runLongRest('a2');

    expect(r.newWounds).toBe(12);
    expect(r.newFortune).toBe(2); // = fate.value, NOT a fortune.max write

    expect(removes.map(x => x.conditionKey).sort()).toEqual(['fatigued', 'stunned']);
    expect(removes.find(x => x.conditionKey === 'bleeding')).toBeUndefined();

    // Verify NO .max writes anywhere in the payload
    for (const u of updates) {
      const paths = Object.keys(u.updateData);
      expect(paths.some(p => /fortune\.max|fate\.max|resilience\.max|resolve\.max/.test(p))).toBe(false);
    }
  });
});

describe('wfrp-rest-recover / PRD R4.2 — no .max writes on protected pools', () => {
  it('regression: long rest payload contains no fortune.max even when system has the field', async () => {
    const a: PCStub = {
      id: 'a3', name: 'Anna', type: 'character',
      system: {
        characteristics: { t: { initial: 30, advances: 0, modifier: 0 } },
        status: {
          wounds: { value: 8, max: 12 },
          fate: { value: 4 },
          fortune: { value: 1 },
        },
      },
    };
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: a });
    mockMcpCall('warhammer-mcp.listConditions', { success: true, data: [] });

    let captured: any = null;
    mockMcpCall('warhammer-mcp.update-actor', (i: any) => { captured = i; return { success: true, data: {} }; });

    await runLongRest('a3');

    expect(captured).not.toBeNull();
    const paths = Object.keys(captured.updateData);
    expect(paths).not.toContain('system.status.fortune.max');
    expect(paths).not.toContain('system.status.fate.max');
    expect(paths).not.toContain('system.status.resilience.max');
    expect(paths).not.toContain('system.status.resolve.max');
  });
});
