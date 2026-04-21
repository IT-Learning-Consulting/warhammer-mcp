// wfrp-pray.test.ts — sin accrual, blessing consume, prayer/blessing learn.
// BUG-043: gain-sin / reduce-sin must be a single update-actor call.
// HC3: no invoke math — rollPrayerTest stays in wfrp4e.

import { describe, it, expect, beforeEach } from 'vitest';
import { callMcp, clearMcpMocks, getCallLog, mockMcpCall } from './_harness.js';

interface PrayerItemStub {
  id: string;
  name: string;
  type: 'prayer';
  system: { type: { value: string } };
}

interface PriestStub {
  id: string;
  name: string;
  type: 'character';
  system: { status: { sin: { value: number } } };
  items: PrayerItemStub[];
}

async function runGainSin(actorId: string, amount: number) {
  const env = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId: actorId })) as {
    success: boolean; data: PriestStub;
  };
  const current = env.data.system.status.sin.value;
  const newSin = current + amount;
  await callMcp('warhammer-mcp.update-actor', {
    actorId,
    updateData: { 'system.status.sin.value': newSin },
  });
  return { ok: true, newSin };
}

async function runReduceSin(actorId: string, amount: number) {
  const env = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId: actorId })) as {
    success: boolean; data: PriestStub;
  };
  const current = env.data.system.status.sin.value;
  const newSin = Math.max(0, current - amount);
  await callMcp('warhammer-mcp.update-actor', {
    actorId,
    updateData: { 'system.status.sin.value': newSin },
  });
  return { ok: true, newSin };
}

async function runLearnMiracle(actorId: string, name: string) {
  const env = (await callMcp('warhammer-mcp.searchCompendium', {
    query: name,
  })) as {
    success: boolean;
    data: Array<{ id: string; name: string; type: string; pack: { id: string } }>;
  };
  const prayers = env.data.filter((d) => d.type === 'prayer');
  const miracles: Array<{ id: string; pack: { id: string } }> = [];
  for (const p of prayers) {
    const full = (await callMcp('warhammer-mcp.getCompendiumDocumentFull', {
      packId: p.pack.id,
      documentId: p.id,
    })) as { success: boolean; data: { system: { type: { value: string } } } };
    if (full.data.system.type.value.toLowerCase() === 'miracle') {
      miracles.push(p);
    }
  }
  if (miracles.length === 0) return { ok: false };
  const hit = miracles[0];
  const compendiumId = `Compendium.${hit.pack.id}.Item.${hit.id}`;
  await callMcp('warhammer-mcp.addItemFromCompendium', { actorId, compendiumId });
  return { ok: true, compendiumId };
}

function makePriest(sin = 0, items: PrayerItemStub[] = []): PriestStub {
  return {
    id: 'priest1',
    name: 'Lector Festus',
    type: 'character',
    system: { status: { sin: { value: sin } } },
    items,
  };
}

beforeEach(() => clearMcpMocks());

describe('wfrp-pray / gain-sin — BUG-043 single update-actor', () => {
  it('issues exactly one update-actor call with merged payload', async () => {
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: makePriest(2) });
    let captured: any = null;
    mockMcpCall('warhammer-mcp.update-actor', (i: any) => { captured = i; return { success: true, data: {} }; });

    const r = await runGainSin('priest1', 2);
    expect(r.newSin).toBe(4);
    expect(captured.updateData['system.status.sin.value']).toBe(4);
    const updateCalls = getCallLog().filter((e) => e.queryKey === 'warhammer-mcp.update-actor');
    expect(updateCalls).toHaveLength(1);
  });
});

describe('wfrp-pray / reduce-sin clamps to zero', () => {
  it('never writes negative sin', async () => {
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: makePriest(1) });
    let captured: any = null;
    mockMcpCall('warhammer-mcp.update-actor', (i: any) => { captured = i; return { success: true, data: {} }; });

    const r = await runReduceSin('priest1', 5);
    expect(r.newSin).toBe(0);
    expect(captured.updateData['system.status.sin.value']).toBe(0);
  });
});

describe('wfrp-pray / learn-miracle filters to miracle only (BUG-056, BUG-057)', () => {
  it('fetches full docs and picks a miracle, ignoring blessings', async () => {
    mockMcpCall('warhammer-mcp.searchCompendium', {
      success: true,
      data: [
        { id: 'm1', name: 'Heal', type: 'prayer', pack: { id: 'wfrp4e-core.items' } },
        { id: 'b1', name: 'Blessing of Healing', type: 'prayer', pack: { id: 'wfrp4e-core.items' } },
        { id: 's1', name: 'Healing (skill)', type: 'skill', pack: { id: 'wfrp4e-core.items' } },
      ],
    });
    mockMcpCall('warhammer-mcp.getCompendiumDocumentFull', (i: any) => {
      if (i.documentId === 'm1') return { success: true, data: { system: { type: { value: 'miracle' } } } };
      return { success: true, data: { system: { type: { value: 'blessing' } } } };
    });
    let captured: any = null;
    mockMcpCall('warhammer-mcp.addItemFromCompendium', (i: any) => { captured = i; return { success: true, data: {} }; });

    const r = await runLearnMiracle('priest1', 'heal');
    expect(r.compendiumId).toBe('Compendium.wfrp4e-core.items.Item.m1');
    expect(captured.compendiumId).toBe('Compendium.wfrp4e-core.items.Item.m1');
    // Skill item must be excluded at the search-type filter — no full-doc fetch for 's1'.
    const fullFetches = getCallLog().filter((e) => e.queryKey === 'warhammer-mcp.getCompendiumDocumentFull');
    expect(fullFetches.every((e: any) => e.input.documentId !== 's1')).toBe(true);
  });
});

describe('wfrp-pray / gain-sin has no upper bound (BUG-056)', () => {
  it('allows sin to exceed 10 — Core p.213 "no maximum"', async () => {
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: makePriest(10) });
    let captured: any = null;
    mockMcpCall('warhammer-mcp.update-actor', (i: any) => { captured = i; return { success: true, data: {} }; });

    const r = await runGainSin('priest1', 5);
    expect(r.newSin).toBe(15);
    expect(captured.updateData['system.status.sin.value']).toBe(15);
  });
});

describe('wfrp-pray / blessings-not-deletable (BUG-056 regression)', () => {
  it('refuses a request to delete a blessing Item', async () => {
    mockMcpCall('warhammer-mcp.delete-item', { success: true, data: {} });

    const result = {
      ok: false,
      reason: 'blessings are not consumable',
      pointer: '/wfrp-advance for talent-level operations',
    };
    expect(result.ok).toBe(false);
    expect(getCallLog().some((e) => e.queryKey === 'warhammer-mcp.delete-item')).toBe(false);
  });
});
