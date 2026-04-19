// wfrp-resources.test.ts — five-pool resource skill tests.
// Critical: NO writes to fate/fortune/resilience/resolve `.max` (PRD R4.2 / BUG-023).

import { describe, it, expect, beforeEach } from 'vitest';
import { callMcp, clearMcpMocks, getCallLog, mockMcpCall } from './_harness.js';

interface PCStub {
  id: string;
  name: string;
  type: 'character';
  system: {
    status: {
      fate: { value: number };
      fortune: { value: number };
      resilience: { value: number };
      resolve: { value: number };
      advantage: { value: number; max: number };
    };
  };
}

const FORBIDDEN = /(?:fate|fortune|resilience|resolve)\.max/;

async function runBurnFate(actorId: string) {
  const env = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId: actorId })) as {
    success: boolean; data: PCStub;
  };
  if (env.data.system.status.fate.value < 1) return { ok: false, reason: 'no fate' };
  await callMcp('warhammer-mcp.update-actor', {
    actorId,
    updateData: { 'system.status.fate.value': env.data.system.status.fate.value - 1 },
  });
  return { ok: true };
}

async function runSessionRefresh(actorId: string) {
  const env = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId: actorId })) as {
    success: boolean; data: PCStub;
  };
  await callMcp('warhammer-mcp.update-actor', {
    actorId,
    updateData: { 'system.status.fortune.value': env.data.system.status.fate.value },
  });
}

async function runGainAdvantage(actorId: string, amount: number) {
  const env = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId: actorId })) as {
    success: boolean; data: PCStub;
  };
  const adv = env.data.system.status.advantage;
  const newValue = Math.min(adv.value + amount, adv.max);
  await callMcp('warhammer-mcp.update-actor', {
    actorId,
    updateData: { 'system.status.advantage.value': newValue },
  });
  return { newValue, capped: newValue === adv.max };
}

function makePC(overrides: Partial<PCStub['system']['status']> = {}): PCStub {
  return {
    id: 'pc1', name: 'Hans', type: 'character',
    system: {
      status: {
        fate: { value: 3 },
        fortune: { value: 1 },
        resilience: { value: 2 },
        resolve: { value: 1 },
        advantage: { value: 0, max: 10 },
        ...overrides,
      } as any,
    },
  };
}

beforeEach(() => clearMcpMocks());

describe('wfrp-resources / burn fate', () => {
  it('decrements fate.value, no .max touch', async () => {
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: makePC() });
    let captured: any = null;
    mockMcpCall('warhammer-mcp.update-actor', (i: any) => { captured = i; return { success: true, data: {} }; });

    const r = await runBurnFate('pc1');
    expect(r.ok).toBe(true);
    expect(captured.updateData['system.status.fate.value']).toBe(2);
    expect(Object.keys(captured.updateData).some(p => FORBIDDEN.test(p))).toBe(false);
  });

  it('refuses when fate is 0', async () => {
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: makePC({ fate: { value: 0 } }) });
    mockMcpCall('warhammer-mcp.update-actor', { success: true, data: {} });

    const r = await runBurnFate('pc1');
    expect(r.ok).toBe(false);
    expect(getCallLog().some(e => e.queryKey === 'warhammer-mcp.update-actor')).toBe(false);
  });
});

describe('wfrp-resources / session refresh sets fortune = fate.value', () => {
  it('writes fortune.value, never fortune.max', async () => {
    mockMcpCall('warhammer-mcp.getCharacterInfo', {
      success: true, data: makePC({ fate: { value: 3 }, fortune: { value: 0 } }),
    });
    let captured: any = null;
    mockMcpCall('warhammer-mcp.update-actor', (i: any) => { captured = i; return { success: true, data: {} }; });

    await runSessionRefresh('pc1');
    expect(captured.updateData['system.status.fortune.value']).toBe(3);
    expect(captured.updateData['system.status.fortune.max']).toBeUndefined();
  });
});

describe('wfrp-resources / advantage cap', () => {
  it('caps gain at advantage.max', async () => {
    mockMcpCall('warhammer-mcp.getCharacterInfo', {
      success: true, data: makePC({ advantage: { value: 9, max: 10 } }),
    });
    mockMcpCall('warhammer-mcp.update-actor', { success: true, data: {} });

    const r = await runGainAdvantage('pc1', 5);
    expect(r.newValue).toBe(10);
    expect(r.capped).toBe(true);
  });
});

describe('wfrp-resources / PRD R4.2 — no .max writes on protected pools (BUG-023 regression)', () => {
  it('forbidden paths never appear in any update payload across all sub-commands', async () => {
    const captured: any[] = [];
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: makePC() });
    mockMcpCall('warhammer-mcp.update-actor', (i: any) => { captured.push(i); return { success: true, data: {} }; });

    await runBurnFate('pc1');
    await runSessionRefresh('pc1');
    await runGainAdvantage('pc1', 1);

    const allPaths = captured.flatMap(c => Object.keys(c.updateData));
    expect(allPaths).not.toContain('system.status.fate.max');
    expect(allPaths).not.toContain('system.status.fortune.max');
    expect(allPaths).not.toContain('system.status.resilience.max');
    expect(allPaths).not.toContain('system.status.resolve.max');
  });
});
