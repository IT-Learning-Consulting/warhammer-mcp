// wfrp-critical.test.ts — exercises the /wfrp-critical sub-command flows.
//
// Mirrors SKILL.md's primitive sequence:
//   1. getCharacterInfo → read hitLocationTable key + criticalWounds.value + TB
//   2. Resolve table id via CONFIG.WFRP4E.hitLocationTables[key]
//   3. rollOnTable → location + criticalName
//   4. searchCompendium { itemType: "critical" }
//   5. addItemFromCompendium
//   6. updateItem to stamp rolled location onto the embedded crit
//   7. updateActor to bump system.status.criticalWounds.value
//   8. Death warning when new count > TB
//
// BUG-033 regression: `remove` sub-command refuses to touch items whose type is
// `injury`; only `critical` items decrement criticalWounds. The old
// manage-critical-wound handleRemove swept both types — fixed by skill-level
// type filter.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  callMcp,
  clearMcpMocks,
  getCallLog,
  mockMcpCall,
} from './_harness.js';

interface HitLocationTables {
  [key: string]: string;
}

interface MockConfig {
  WFRP4E: { hitLocationTables: HitLocationTables };
}

interface CritItemStub {
  _id: string;
  name: string;
  type: 'critical' | 'injury';
  system: { location: { value: string } };
}

interface CharacterInfoStub {
  id: string;
  name: string;
  system: {
    details: { hitLocationTable: { value: string } };
    characteristics: { t: { total: number } };
    status: { criticalWounds: { value: number } };
  };
  items: CritItemStub[];
}

interface RollResult {
  ok: boolean;
  reason?: string;
  criticalName?: string;
  location?: string;
  newCount?: number;
  death?: boolean;
}

async function runRollCritical(
  CONFIG: MockConfig,
  characterId: string,
  severity: 'minor' | 'major' = 'minor',
): Promise<RollResult> {
  const charEnv = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId })) as {
    success: boolean;
    data: CharacterInfoStub | null;
  };
  if (!charEnv.data) return { ok: false, reason: 'character not found' };
  const actor = charEnv.data;

  const hitLocKey = actor.system.details.hitLocationTable?.value || 'hitloc';
  const tableRef = CONFIG.WFRP4E.hitLocationTables[hitLocKey];
  if (!tableRef) {
    return { ok: false, reason: `no hit-location table for key "${hitLocKey}"` };
  }

  const modifier = severity === 'major' ? 20 : 0;
  const rollEnv = (await callMcp('warhammer-mcp.rollOnTable', {
    tableName: tableRef,
    modifier,
  })) as { success: boolean; data: { location: string; criticalName: string } | null };
  if (!rollEnv.data) return { ok: false, reason: 'critical table roll returned no result' };
  const { location, criticalName } = rollEnv.data;

  const searchEnv = (await callMcp('warhammer-mcp.searchCompendium', {
    query: criticalName,
    itemType: 'critical',
  })) as { success: boolean; data: Array<{ _id: string; name: string; pack: string }> };
  if (!searchEnv.data || searchEnv.data.length === 0) {
    return { ok: false, reason: `no critical "${criticalName}" found in compendium` };
  }
  const entry = searchEnv.data.find(r => r.pack === 'wfrp4e-core.items') ?? searchEnv.data[0];

  const addEnv = (await callMcp('warhammer-mcp.addItemFromCompendium', {
    actorId: characterId,
    pack: entry.pack,
    itemId: entry._id,
  })) as { success: boolean; data: { itemId: string } | null };
  if (!addEnv.data) return { ok: false, reason: 'addItemFromCompendium failed' };
  const newItemId = addEnv.data.itemId;

  await callMcp('warhammer-mcp.updateItem', {
    actorId: characterId,
    itemId: newItemId,
    updateData: { 'system.location.value': location },
  });

  const current = actor.system.status.criticalWounds.value;
  const newCount = current + 1;
  await callMcp('warhammer-mcp.updateActor', {
    actorId: characterId,
    updateData: { 'system.status.criticalWounds.value': newCount },
  });

  const tb = Math.floor(actor.system.characteristics.t.total / 10);
  const death = newCount > tb;

  return { ok: true, criticalName, location, newCount, death };
}

interface RemoveResult {
  ok: boolean;
  reason?: string;
  newCount?: number;
}

async function runRemoveCritical(
  characterId: string,
  itemId: string,
): Promise<RemoveResult> {
  const charEnv = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId })) as {
    success: boolean;
    data: CharacterInfoStub | null;
  };
  if (!charEnv.data) return { ok: false, reason: 'character not found' };
  const actor = charEnv.data;

  const target = actor.items.find(i => i._id === itemId);
  if (!target) return { ok: false, reason: `item "${itemId}" not found on actor` };

  // BUG-033 guardrail: only `critical` items decrement the counter.
  if (target.type !== 'critical') {
    return {
      ok: false,
      reason: `item "${itemId}" is type ${target.type}, not critical (BUG-033 guardrail)`,
    };
  }

  await callMcp('warhammer-mcp.deleteItem', { actorId: characterId, itemId });

  const current = actor.system.status.criticalWounds.value;
  const newCount = Math.max(0, current - 1);
  await callMcp('warhammer-mcp.updateActor', {
    actorId: characterId,
    updateData: { 'system.status.criticalWounds.value': newCount },
  });

  return { ok: true, newCount };
}

function makeActor(overrides: Partial<CharacterInfoStub> = {}): CharacterInfoStub {
  return {
    id: 'actor1',
    name: 'Hans',
    system: {
      details: { hitLocationTable: { value: 'hitloc' } },
      characteristics: { t: { total: 35 } }, // TB = 3
      status: { criticalWounds: { value: 0 } },
    },
    items: [],
    ...overrides,
  };
}

beforeEach(() => {
  clearMcpMocks();
});

// -----------------------------------------------------------------------------
// Scenario 1 — Humanoid crit: hitloc key → body location → critical added + count+=1
// -----------------------------------------------------------------------------

describe('wfrp-critical / humanoid crit', () => {
  it('uses the "hitloc" table, embeds the rolled critical, and bumps criticalWounds', async () => {
    const CONFIG: MockConfig = {
      WFRP4E: {
        hitLocationTables: {
          hitloc: 'WFRP4E.hitLocationTables.hitloc',
          snake: 'WFRP4E.hitLocationTables.snake',
        },
      },
    };

    const actor = makeActor();
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.rollOnTable', {
      success: true,
      data: { location: 'Body', criticalName: 'Arterial Damage' },
    });
    mockMcpCall('warhammer-mcp.searchCompendium', {
      success: true,
      data: [{ _id: 'crit1', name: 'Arterial Damage', pack: 'wfrp4e-core.items' }],
    });
    mockMcpCall('warhammer-mcp.addItemFromCompendium', {
      success: true,
      data: { itemId: 'embedded1' },
    });
    const itemUpdates: any[] = [];
    mockMcpCall('warhammer-mcp.updateItem', (input: any) => {
      itemUpdates.push(input);
      return { success: true, data: {} };
    });
    const actorUpdates: any[] = [];
    mockMcpCall('warhammer-mcp.updateActor', (input: any) => {
      actorUpdates.push(input);
      return { success: true, data: {} };
    });

    const res = await runRollCritical(CONFIG, 'actor1');

    expect(res.ok).toBe(true);
    expect(res.location).toBe('Body');
    expect(res.criticalName).toBe('Arterial Damage');
    expect(res.newCount).toBe(1);
    expect(res.death).toBe(false); // TB = 3, 1 <= 3

    // updateItem stamps the rolled location onto the embedded crit
    expect(itemUpdates).toHaveLength(1);
    expect(itemUpdates[0].updateData['system.location.value']).toBe('Body');

    // updateActor bumps criticalWounds by exactly 1
    expect(actorUpdates).toHaveLength(1);
    expect(actorUpdates[0].updateData['system.status.criticalWounds.value']).toBe(1);

    // Called the hitloc table, not snake
    const rollCalls = getCallLog().filter(e => e.queryKey === 'warhammer-mcp.rollOnTable');
    expect(rollCalls).toHaveLength(1);
    expect((rollCalls[0].input as any).tableName).toBe('WFRP4E.hitLocationTables.hitloc');
  });
});

// -----------------------------------------------------------------------------
// Scenario 2 — Snake crit: hitLocationTable.value="snake" uses snake table, NOT hitloc
// -----------------------------------------------------------------------------

describe('wfrp-critical / non-humanoid hit-location', () => {
  it('uses the "snake" table when the actor\'s hitLocationTable.value is "snake"', async () => {
    const CONFIG: MockConfig = {
      WFRP4E: {
        hitLocationTables: {
          hitloc: 'WFRP4E.hitLocationTables.hitloc',
          snake: 'WFRP4E.hitLocationTables.snake',
        },
      },
    };

    const actor = makeActor({
      name: 'Garden Snake',
      system: {
        details: { hitLocationTable: { value: 'snake' } },
        characteristics: { t: { total: 20 } }, // TB = 2
        status: { criticalWounds: { value: 0 } },
      },
    });

    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.rollOnTable', {
      success: true,
      data: { location: 'Body', criticalName: 'Shattered Vertebrae' },
    });
    mockMcpCall('warhammer-mcp.searchCompendium', {
      success: true,
      data: [{ _id: 'crit2', name: 'Shattered Vertebrae', pack: 'wfrp4e-core.items' }],
    });
    mockMcpCall('warhammer-mcp.addItemFromCompendium', {
      success: true,
      data: { itemId: 'embedded2' },
    });
    mockMcpCall('warhammer-mcp.updateItem', { success: true, data: {} });
    mockMcpCall('warhammer-mcp.updateActor', { success: true, data: {} });

    const res = await runRollCritical(CONFIG, 'actor1');

    expect(res.ok).toBe(true);
    const rollCalls = getCallLog().filter(e => e.queryKey === 'warhammer-mcp.rollOnTable');
    expect(rollCalls).toHaveLength(1);
    expect((rollCalls[0].input as any).tableName).toBe('WFRP4E.hitLocationTables.snake');
  });

  it('refuses when the hitLocationTable key is not in CONFIG (no silent hitloc fallback)', async () => {
    const CONFIG: MockConfig = {
      WFRP4E: { hitLocationTables: { hitloc: 'WFRP4E.hitLocationTables.hitloc' } },
    };

    const actor = makeActor({
      system: {
        details: { hitLocationTable: { value: 'tentacled_horror' } },
        characteristics: { t: { total: 40 } },
        status: { criticalWounds: { value: 0 } },
      },
    });
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });

    const res = await runRollCritical(CONFIG, 'actor1');

    expect(res.ok).toBe(false);
    expect(res.reason).toContain('no hit-location table for key "tentacled_horror"');
    // Must NOT have fallen back to the hitloc table
    const rollCalls = getCallLog().filter(e => e.queryKey === 'warhammer-mcp.rollOnTable');
    expect(rollCalls).toHaveLength(0);
  });
});

// -----------------------------------------------------------------------------
// Scenario 3 — Death threshold: new count exceeds TB → death warning flag
// -----------------------------------------------------------------------------

describe('wfrp-critical / death threshold', () => {
  it('flags death when (current + 1) > TB', async () => {
    const CONFIG: MockConfig = {
      WFRP4E: { hitLocationTables: { hitloc: 'WFRP4E.hitLocationTables.hitloc' } },
    };

    const actor = makeActor({
      system: {
        details: { hitLocationTable: { value: 'hitloc' } },
        characteristics: { t: { total: 30 } }, // TB = 3
        status: { criticalWounds: { value: 3 } }, // already at TB
      },
    });

    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.rollOnTable', {
      success: true,
      data: { location: 'Head', criticalName: 'Crushed Skull' },
    });
    mockMcpCall('warhammer-mcp.searchCompendium', {
      success: true,
      data: [{ _id: 'crit3', name: 'Crushed Skull', pack: 'wfrp4e-core.items' }],
    });
    mockMcpCall('warhammer-mcp.addItemFromCompendium', {
      success: true,
      data: { itemId: 'embedded3' },
    });
    mockMcpCall('warhammer-mcp.updateItem', { success: true, data: {} });
    mockMcpCall('warhammer-mcp.updateActor', { success: true, data: {} });

    const res = await runRollCritical(CONFIG, 'actor1');

    expect(res.ok).toBe(true);
    expect(res.newCount).toBe(4);
    expect(res.death).toBe(true); // 4 > TB=3
  });

  it('stays alive at exactly TB (boundary case)', async () => {
    const CONFIG: MockConfig = {
      WFRP4E: { hitLocationTables: { hitloc: 'WFRP4E.hitLocationTables.hitloc' } },
    };

    const actor = makeActor({
      system: {
        details: { hitLocationTable: { value: 'hitloc' } },
        characteristics: { t: { total: 30 } }, // TB = 3
        status: { criticalWounds: { value: 2 } },
      },
    });

    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.rollOnTable', {
      success: true,
      data: { location: 'Arm', criticalName: 'Bad Cut' },
    });
    mockMcpCall('warhammer-mcp.searchCompendium', {
      success: true,
      data: [{ _id: 'crit4', name: 'Bad Cut', pack: 'wfrp4e-core.items' }],
    });
    mockMcpCall('warhammer-mcp.addItemFromCompendium', {
      success: true,
      data: { itemId: 'embedded4' },
    });
    mockMcpCall('warhammer-mcp.updateItem', { success: true, data: {} });
    mockMcpCall('warhammer-mcp.updateActor', { success: true, data: {} });

    const res = await runRollCritical(CONFIG, 'actor1');

    expect(res.ok).toBe(true);
    expect(res.newCount).toBe(3); // equals TB
    expect(res.death).toBe(false); // 3 > 3 is false
  });
});

// -----------------------------------------------------------------------------
// Scenario 4 — BUG-033 regression: remove refuses injury-typed items
// -----------------------------------------------------------------------------

describe('wfrp-critical / BUG-033 regression — remove refuses injury items', () => {
  it('decrements criticalWounds only when the removed item is type "critical"', async () => {
    const actor = makeActor({
      system: {
        details: { hitLocationTable: { value: 'hitloc' } },
        characteristics: { t: { total: 30 } },
        status: { criticalWounds: { value: 2 } },
      },
      items: [
        { _id: 'critA', name: 'Arterial Damage', type: 'critical', system: { location: { value: 'Body' } } },
        { _id: 'injB', name: 'Sprained Ankle', type: 'injury', system: { location: { value: 'Leg' } } },
      ],
    });

    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    const deletes: string[] = [];
    mockMcpCall('warhammer-mcp.deleteItem', (input: any) => {
      deletes.push(input.itemId);
      return { success: true, data: {} };
    });
    const actorUpdates: any[] = [];
    mockMcpCall('warhammer-mcp.updateActor', (input: any) => {
      actorUpdates.push(input);
      return { success: true, data: {} };
    });

    // 4a — Removing the critical decrements.
    const critRes = await runRemoveCritical('actor1', 'critA');
    expect(critRes.ok).toBe(true);
    expect(critRes.newCount).toBe(1);
    expect(deletes).toEqual(['critA']);
    expect(actorUpdates[0].updateData['system.status.criticalWounds.value']).toBe(1);

    // 4b — Removing the injury refuses; no delete, no counter decrement.
    const injRes = await runRemoveCritical('actor1', 'injB');
    expect(injRes.ok).toBe(false);
    expect(injRes.reason).toContain('BUG-033 guardrail');
    expect(injRes.reason).toContain('not critical');
    expect(deletes).toEqual(['critA']); // unchanged
    expect(actorUpdates).toHaveLength(1); // still just the crit-remove update
  });

  it('clamps criticalWounds at 0 (never negative)', async () => {
    const actor = makeActor({
      system: {
        details: { hitLocationTable: { value: 'hitloc' } },
        characteristics: { t: { total: 30 } },
        status: { criticalWounds: { value: 0 } },
      },
      items: [
        { _id: 'critZ', name: 'Bad Cut', type: 'critical', system: { location: { value: 'Arm' } } },
      ],
    });

    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.deleteItem', { success: true, data: {} });
    const actorUpdates: any[] = [];
    mockMcpCall('warhammer-mcp.updateActor', (input: any) => {
      actorUpdates.push(input);
      return { success: true, data: {} };
    });

    const res = await runRemoveCritical('actor1', 'critZ');
    expect(res.ok).toBe(true);
    expect(res.newCount).toBe(0);
    expect(actorUpdates[0].updateData['system.status.criticalWounds.value']).toBe(0);
  });
});
