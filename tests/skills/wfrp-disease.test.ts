// wfrp-disease.test.ts — exercises the /wfrp-disease sub-command flows.
//
// Mirrors SKILL.md's primitive sequence:
//   contract  → searchCompendium + requestPlayerRolls (if not endured) + addItemFromCompendium
//   advance   → updateItem on the disease Item's duration/incubation (NOT updateActor)
//   resolve-symptom → rollOnTable(CONFIG.WFRP4E.symptoms[key])
//   cure      → deleteItem (type-guarded to disease)
//
// BUG-003 coverage: the old manage-disease tool's dead write keys
// (addDisease/removeDisease/checkInfectionResilience) are replaced by the
// compendium + updateItem + deleteItem + requestPlayerRolls composition.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  callMcp,
  clearMcpMocks,
  getCallLog,
  mockMcpCall,
} from './_harness.js';

interface MockConfig {
  WFRP4E: { symptoms: Record<string, string> };
}

interface DiseaseItemStub {
  _id: string;
  name: string;
  type: 'disease' | 'injury';
  system: {
    incubation: { value: number };
    duration: { value: number };
  };
}

interface CharacterInfoStub {
  id: string;
  name: string;
  items: DiseaseItemStub[];
}

interface ContractResult {
  ok: boolean;
  reason?: string;
  contracted?: boolean;
}

async function runContract(
  characterId: string,
  diseaseName: string,
  endured: boolean,
  resistancePasses: boolean,
): Promise<ContractResult> {
  const charEnv = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId })) as {
    success: boolean;
    data: CharacterInfoStub | null;
  };
  if (!charEnv.data) return { ok: false, reason: 'character not found' };

  const searchEnv = (await callMcp('warhammer-mcp.searchCompendium', {
    query: diseaseName,
    itemType: 'disease',
  })) as { success: boolean; data: Array<{ _id: string; name: string; pack: string }> };
  if (!searchEnv.data || searchEnv.data.length === 0) {
    return { ok: false, reason: `no disease "${diseaseName}" found in compendium` };
  }
  const entry = searchEnv.data.find(r => r.pack === 'wfrp4e-core.items') ?? searchEnv.data[0];

  if (!endured) {
    const rollEnv = (await callMcp('warhammer-mcp.requestPlayerRolls', {
      actorId: characterId,
      tests: [{ skill: 'Endurance', difficulty: 'challenging' }],
    })) as { success: boolean; data: { passed: boolean } };
    if (rollEnv.data.passed) {
      return { ok: true, contracted: false, reason: `${charEnv.data.name} resists ${diseaseName}` };
    }
  }
  void resistancePasses; // fed through mock

  const addEnv = (await callMcp('warhammer-mcp.addItemFromCompendium', {
    actorId: characterId,
    pack: entry.pack,
    itemId: entry._id,
  })) as { success: boolean; data: { itemId: string } | null };
  if (!addEnv.data) return { ok: false, reason: 'addItemFromCompendium failed' };

  return { ok: true, contracted: true };
}

interface AdvanceResult {
  ok: boolean;
  reason?: string;
  newIncubation?: number;
  newDuration?: number;
}

async function runAdvance(
  characterId: string,
  itemId: string,
  days: number,
): Promise<AdvanceResult> {
  const charEnv = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId })) as {
    success: boolean;
    data: CharacterInfoStub | null;
  };
  if (!charEnv.data) return { ok: false, reason: 'character not found' };
  const target = charEnv.data.items.find(i => i._id === itemId);
  if (!target) return { ok: false, reason: `item "${itemId}" not found on actor` };
  if (target.type !== 'disease') {
    return { ok: false, reason: `item "${itemId}" is type ${target.type}, not disease` };
  }
  const newIncubation = Math.max(0, target.system.incubation.value - days);
  const newDuration = Math.max(0, target.system.duration.value - days);
  await callMcp('warhammer-mcp.updateItem', {
    actorId: characterId,
    itemId,
    updateData: {
      'system.incubation.value': newIncubation,
      'system.duration.value': newDuration,
    },
  });
  return { ok: true, newIncubation, newDuration };
}

interface SymptomResult {
  ok: boolean;
  reason?: string;
  outcome?: string;
}

async function runResolveSymptom(
  CONFIG: MockConfig,
  characterId: string,
  itemId: string,
  symptomKey: string,
): Promise<SymptomResult> {
  void characterId;
  void itemId;
  const tableId = CONFIG.WFRP4E.symptoms[symptomKey];
  if (!tableId) return { ok: false, reason: `unknown symptom "${symptomKey}"` };
  const rollEnv = (await callMcp('warhammer-mcp.rollOnTable', { tableName: tableId })) as {
    success: boolean;
    data: { outcome: string };
  };
  return { ok: true, outcome: rollEnv.data.outcome };
}

interface CureResult {
  ok: boolean;
  reason?: string;
}

async function runCure(
  characterId: string,
  itemId: string,
): Promise<CureResult> {
  const charEnv = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId })) as {
    success: boolean;
    data: CharacterInfoStub | null;
  };
  if (!charEnv.data) return { ok: false, reason: 'character not found' };
  const target = charEnv.data.items.find(i => i._id === itemId);
  if (!target) return { ok: false, reason: `item "${itemId}" not found on actor` };
  if (target.type !== 'disease') {
    return { ok: false, reason: `item "${itemId}" is type ${target.type}, not disease` };
  }
  await callMcp('warhammer-mcp.deleteItem', { actorId: characterId, itemId });
  return { ok: true };
}

function makeActor(overrides: Partial<CharacterInfoStub> = {}): CharacterInfoStub {
  return {
    id: 'actor1',
    name: 'Hans',
    items: [],
    ...overrides,
  };
}

beforeEach(() => {
  clearMcpMocks();
});

// -----------------------------------------------------------------------------
// Scenario 1 — Contract (Endurance test fails → item added)
// -----------------------------------------------------------------------------

describe('wfrp-disease / contract', () => {
  it('triggers an Endurance test then embeds the disease on fail', async () => {
    const actor = makeActor();
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.searchCompendium', {
      success: true,
      data: [{ _id: 'dis1', name: 'The Bloody Flux', pack: 'wfrp4e-core.items' }],
    });
    mockMcpCall('warhammer-mcp.requestPlayerRolls', {
      success: true,
      data: { passed: false }, // failed test → disease takes hold
    });
    mockMcpCall('warhammer-mcp.addItemFromCompendium', {
      success: true,
      data: { itemId: 'embedded1' },
    });

    const res = await runContract('actor1', 'The Bloody Flux', false, false);

    expect(res.ok).toBe(true);
    expect(res.contracted).toBe(true);

    const rollCalls = getCallLog().filter(e => e.queryKey === 'warhammer-mcp.requestPlayerRolls');
    expect(rollCalls).toHaveLength(1);
    const addCalls = getCallLog().filter(e => e.queryKey === 'warhammer-mcp.addItemFromCompendium');
    expect(addCalls).toHaveLength(1);
  });

  it('halts contract when Endurance test passes (no item added)', async () => {
    const actor = makeActor();
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.searchCompendium', {
      success: true,
      data: [{ _id: 'dis1', name: 'The Bloody Flux', pack: 'wfrp4e-core.items' }],
    });
    mockMcpCall('warhammer-mcp.requestPlayerRolls', {
      success: true,
      data: { passed: true }, // resisted
    });

    const res = await runContract('actor1', 'The Bloody Flux', false, true);

    expect(res.ok).toBe(true);
    expect(res.contracted).toBe(false);
    expect(res.reason).toContain('resists');

    const addCalls = getCallLog().filter(e => e.queryKey === 'warhammer-mcp.addItemFromCompendium');
    expect(addCalls).toHaveLength(0); // nothing added
  });
});

// -----------------------------------------------------------------------------
// Scenario 2 — Advance: updates ITEM duration/incubation, NOT the actor
// -----------------------------------------------------------------------------

describe('wfrp-disease / advance ticks the Item, not the actor', () => {
  it('writes to system.incubation/system.duration via updateItem', async () => {
    const actor = makeActor({
      items: [
        {
          _id: 'dis1',
          name: 'The Bloody Flux',
          type: 'disease',
          system: { incubation: { value: 2 }, duration: { value: 7 } },
        },
      ],
    });
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
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

    const res = await runAdvance('actor1', 'dis1', 3);

    expect(res.ok).toBe(true);
    expect(res.newIncubation).toBe(0); // max(0, 2-3) = 0
    expect(res.newDuration).toBe(4); // 7-3

    // updateItem was called, not updateActor
    expect(itemUpdates).toHaveLength(1);
    expect(itemUpdates[0].itemId).toBe('dis1');
    expect(itemUpdates[0].updateData['system.incubation.value']).toBe(0);
    expect(itemUpdates[0].updateData['system.duration.value']).toBe(4);
    expect(actorUpdates).toHaveLength(0); // BUG-003 regression — never updateActor
  });

  it('clamps incubation and duration at 0', async () => {
    const actor = makeActor({
      items: [
        {
          _id: 'dis1',
          name: 'Flu',
          type: 'disease',
          system: { incubation: { value: 1 }, duration: { value: 2 } },
        },
      ],
    });
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.updateItem', { success: true, data: {} });

    const res = await runAdvance('actor1', 'dis1', 100);

    expect(res.ok).toBe(true);
    expect(res.newIncubation).toBe(0);
    expect(res.newDuration).toBe(0);
  });
});

// -----------------------------------------------------------------------------
// Scenario 3 — Resolve symptom uses CONFIG.WFRP4E.symptoms (no hardcoded table)
// -----------------------------------------------------------------------------

describe('wfrp-disease / resolve-symptom reads symptoms config', () => {
  it('maps symptom key to RollTable id via CONFIG', async () => {
    const CONFIG: MockConfig = {
      WFRP4E: {
        symptoms: {
          fever: 'symptomfever',
          flux: 'symptomflux',
          delirium: 'symptomdelirium',
        },
      },
    };
    mockMcpCall('warhammer-mcp.rollOnTable', {
      success: true,
      data: { outcome: 'Sweating; -10 to Toughness' },
    });

    const res = await runResolveSymptom(CONFIG, 'actor1', 'dis1', 'fever');
    expect(res.ok).toBe(true);
    expect(res.outcome).toContain('Toughness');

    const rollCalls = getCallLog().filter(e => e.queryKey === 'warhammer-mcp.rollOnTable');
    expect(rollCalls).toHaveLength(1);
    expect((rollCalls[0].input as any).tableName).toBe('symptomfever');
  });

  it('refuses on unknown symptom key', async () => {
    const CONFIG: MockConfig = { WFRP4E: { symptoms: { fever: 'symptomfever' } } };
    const res = await runResolveSymptom(CONFIG, 'actor1', 'dis1', 'heresy-rash');
    expect(res.ok).toBe(false);
    expect(res.reason).toContain('unknown symptom "heresy-rash"');
    const rollCalls = getCallLog().filter(e => e.queryKey === 'warhammer-mcp.rollOnTable');
    expect(rollCalls).toHaveLength(0);
  });
});

// -----------------------------------------------------------------------------
// Scenario 4 — Cure via deleteItem (type-guarded to disease)
// -----------------------------------------------------------------------------

describe('wfrp-disease / cure via deleteItem', () => {
  it('deletes the disease item and refuses non-disease types', async () => {
    const actor = makeActor({
      items: [
        {
          _id: 'disA',
          name: 'Flu',
          type: 'disease',
          system: { incubation: { value: 0 }, duration: { value: 0 } },
        },
        {
          _id: 'injB',
          name: 'Cracked Rib',
          type: 'injury',
          system: { incubation: { value: 0 }, duration: { value: 0 } },
        },
      ],
    });
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    const deletes: string[] = [];
    mockMcpCall('warhammer-mcp.deleteItem', (input: any) => {
      deletes.push(input.itemId);
      return { success: true, data: {} };
    });

    const okRes = await runCure('actor1', 'disA');
    expect(okRes.ok).toBe(true);
    expect(deletes).toEqual(['disA']);

    const refuseRes = await runCure('actor1', 'injB');
    expect(refuseRes.ok).toBe(false);
    expect(refuseRes.reason).toContain('is type injury, not disease');
    expect(deletes).toEqual(['disA']); // unchanged
  });
});
