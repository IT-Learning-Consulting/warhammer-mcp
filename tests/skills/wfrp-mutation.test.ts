// wfrp-mutation.test.ts — exercises the /wfrp-mutation sub-command flows.
//
// Mirrors SKILL.md's primitive sequence:
//   1. getCharacterInfo → read actor for context
//   2. Resolve table via CONFIG.WFRP4E.corruptionTables[0|1] (no hardcoded
//      "mutatephys"/"mutatemental" literals in workflow)
//   3. rollOnTable → mutation name
//   4. searchCompendium { itemType: "mutation" }
//   5. addItemFromCompendium → AE chain attaches
//
// GM picks physical vs mental (mutationType input is required on `roll`).
// Remove refuses items whose type is not `mutation`.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  callMcp,
  clearMcpMocks,
  getCallLog,
  mockMcpCall,
} from './_harness.js';

interface MockConfig {
  WFRP4E: { corruptionTables: string[] };
}

interface MutItemStub {
  _id: string;
  name: string;
  type: 'mutation' | 'trait';
  system: { mutationType: { value: 'physical' | 'mental' } };
}

interface CharacterInfoStub {
  id: string;
  name: string;
  system: { characteristics: { wp: { total: number } } };
  items: MutItemStub[];
}

interface RollResult {
  ok: boolean;
  reason?: string;
  mutationName?: string;
  mutationType?: 'physical' | 'mental';
}

async function runRollMutation(
  CONFIG: MockConfig,
  characterId: string,
  mutationType: 'physical' | 'mental' | undefined,
): Promise<RollResult> {
  if (!mutationType) {
    return { ok: false, reason: 'mutationType required: "physical" or "mental"' };
  }

  const charEnv = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId })) as {
    success: boolean;
    data: CharacterInfoStub | null;
  };
  if (!charEnv.data) return { ok: false, reason: 'character not found' };

  // Never hardcode. Always read from CONFIG.
  const tables = CONFIG.WFRP4E.corruptionTables;
  if (!tables || tables.length < 2) {
    return { ok: false, reason: 'corruptionTables config unavailable' };
  }
  const tableId = mutationType === 'physical' ? tables[0] : tables[1];

  const rollEnv = (await callMcp('warhammer-mcp.rollOnTable', { tableName: tableId })) as {
    success: boolean;
    data: { mutationName: string } | null;
  };
  if (!rollEnv.data) return { ok: false, reason: 'mutation table roll returned no result' };
  const { mutationName } = rollEnv.data;

  const searchEnv = (await callMcp('warhammer-mcp.searchCompendium', {
    query: mutationName,
    itemType: 'mutation',
  })) as { success: boolean; data: Array<{ _id: string; name: string; pack: string }> };
  if (!searchEnv.data || searchEnv.data.length === 0) {
    return { ok: false, reason: `no mutation "${mutationName}" found in compendium` };
  }
  const entry = searchEnv.data.find(r => r.pack === 'wfrp4e-core.items') ?? searchEnv.data[0];

  const addEnv = (await callMcp('warhammer-mcp.addItemFromCompendium', {
    actorId: characterId,
    pack: entry.pack,
    itemId: entry._id,
  })) as { success: boolean; data: { itemId: string } | null };
  if (!addEnv.data) return { ok: false, reason: 'addItemFromCompendium failed' };

  return { ok: true, mutationName, mutationType };
}

interface RemoveResult {
  ok: boolean;
  reason?: string;
}

async function runRemoveMutation(
  characterId: string,
  itemId: string,
): Promise<RemoveResult> {
  const charEnv = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId })) as {
    success: boolean;
    data: CharacterInfoStub | null;
  };
  if (!charEnv.data) return { ok: false, reason: 'character not found' };
  const target = charEnv.data.items.find(i => i._id === itemId);
  if (!target) return { ok: false, reason: `item "${itemId}" not found on actor` };
  if (target.type !== 'mutation') {
    return { ok: false, reason: `item "${itemId}" is type ${target.type}, not mutation` };
  }
  await callMcp('warhammer-mcp.deleteItem', { actorId: characterId, itemId });
  return { ok: true };
}

function makeActor(overrides: Partial<CharacterInfoStub> = {}): CharacterInfoStub {
  return {
    id: 'actor1',
    name: 'Hans',
    system: { characteristics: { wp: { total: 35 } } },
    items: [],
    ...overrides,
  };
}

beforeEach(() => {
  clearMcpMocks();
});

// -----------------------------------------------------------------------------
// Scenario 1 — Physical roll: mutationType='physical' → corruptionTables[0]
// -----------------------------------------------------------------------------

describe('wfrp-mutation / physical roll', () => {
  it('uses corruptionTables[0] for physical mutations', async () => {
    const CONFIG: MockConfig = {
      WFRP4E: { corruptionTables: ['mutatephys', 'mutatemental'] },
    };
    const actor = makeActor();

    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.rollOnTable', {
      success: true,
      data: { mutationName: 'Animalistic Legs' },
    });
    mockMcpCall('warhammer-mcp.searchCompendium', {
      success: true,
      data: [{ _id: 'mut1', name: 'Animalistic Legs', pack: 'wfrp4e-core.items' }],
    });
    mockMcpCall('warhammer-mcp.addItemFromCompendium', {
      success: true,
      data: { itemId: 'embedded1' },
    });

    const res = await runRollMutation(CONFIG, 'actor1', 'physical');

    expect(res.ok).toBe(true);
    expect(res.mutationName).toBe('Animalistic Legs');
    expect(res.mutationType).toBe('physical');

    // Table resolved via config, not hardcoded
    const rollCalls = getCallLog().filter(e => e.queryKey === 'warhammer-mcp.rollOnTable');
    expect(rollCalls).toHaveLength(1);
    expect((rollCalls[0].input as any).tableName).toBe('mutatephys');

    // searchCompendium received itemType: "mutation"
    const searchCalls = getCallLog().filter(e => e.queryKey === 'warhammer-mcp.searchCompendium');
    expect((searchCalls[0].input as any).itemType).toBe('mutation');
  });
});

// -----------------------------------------------------------------------------
// Scenario 2 — Mental roll: mutationType='mental' → corruptionTables[1]
// -----------------------------------------------------------------------------

describe('wfrp-mutation / mental roll', () => {
  it('uses corruptionTables[1] for mental mutations', async () => {
    const CONFIG: MockConfig = {
      WFRP4E: { corruptionTables: ['mutatephys', 'mutatemental'] },
    };
    const actor = makeActor();

    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.rollOnTable', {
      success: true,
      data: { mutationName: 'Paranoid' },
    });
    mockMcpCall('warhammer-mcp.searchCompendium', {
      success: true,
      data: [{ _id: 'mut2', name: 'Paranoid', pack: 'wfrp4e-core.items' }],
    });
    mockMcpCall('warhammer-mcp.addItemFromCompendium', {
      success: true,
      data: { itemId: 'embedded2' },
    });

    const res = await runRollMutation(CONFIG, 'actor1', 'mental');

    expect(res.ok).toBe(true);
    const rollCalls = getCallLog().filter(e => e.queryKey === 'warhammer-mcp.rollOnTable');
    expect((rollCalls[0].input as any).tableName).toBe('mutatemental'); // NOT 'mutatephys'
  });
});

// -----------------------------------------------------------------------------
// Scenario 3 — Config-driven: alternate table names flow through
// -----------------------------------------------------------------------------

describe('wfrp-mutation / CONFIG-driven (no hardcoded literals)', () => {
  it('honours a module-overridden corruptionTables array', async () => {
    // Hypothetical Up-in-Arms-style override
    const CONFIG: MockConfig = {
      WFRP4E: { corruptionTables: ['uia-physical-daemonic', 'uia-mental-whispers'] },
    };
    const actor = makeActor();

    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    mockMcpCall('warhammer-mcp.rollOnTable', {
      success: true,
      data: { mutationName: 'Daemonic Eye' },
    });
    mockMcpCall('warhammer-mcp.searchCompendium', {
      success: true,
      data: [{ _id: 'mutX', name: 'Daemonic Eye', pack: 'wfrp4e-core.items' }],
    });
    mockMcpCall('warhammer-mcp.addItemFromCompendium', {
      success: true,
      data: { itemId: 'embeddedX' },
    });

    const res = await runRollMutation(CONFIG, 'actor1', 'physical');

    expect(res.ok).toBe(true);
    const rollCalls = getCallLog().filter(e => e.queryKey === 'warhammer-mcp.rollOnTable');
    expect((rollCalls[0].input as any).tableName).toBe('uia-physical-daemonic');
  });

  it('refuses when CONFIG.WFRP4E.corruptionTables is missing/empty', async () => {
    const CONFIG: MockConfig = { WFRP4E: { corruptionTables: [] } };
    const actor = makeActor();
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });

    const res = await runRollMutation(CONFIG, 'actor1', 'physical');

    expect(res.ok).toBe(false);
    expect(res.reason).toContain('corruptionTables config unavailable');
    const rollCalls = getCallLog().filter(e => e.queryKey === 'warhammer-mcp.rollOnTable');
    expect(rollCalls).toHaveLength(0);
  });

  it('refuses when mutationType is missing (GM must decide)', async () => {
    const CONFIG: MockConfig = {
      WFRP4E: { corruptionTables: ['mutatephys', 'mutatemental'] },
    };

    const res = await runRollMutation(CONFIG, 'actor1', undefined);

    expect(res.ok).toBe(false);
    expect(res.reason).toContain('mutationType required');
  });
});

// -----------------------------------------------------------------------------
// Scenario 4 — Remove only mutations (type guard)
// -----------------------------------------------------------------------------

describe('wfrp-mutation / remove type guard', () => {
  it('refuses to delete non-mutation items', async () => {
    const actor = makeActor({
      items: [
        { _id: 'mutA', name: 'Animalistic Legs', type: 'mutation', system: { mutationType: { value: 'physical' } } },
        { _id: 'trB', name: 'Night Vision', type: 'trait', system: { mutationType: { value: 'physical' } } },
      ],
    });
    mockMcpCall('warhammer-mcp.getCharacterInfo', { success: true, data: actor });
    const deletes: string[] = [];
    mockMcpCall('warhammer-mcp.deleteItem', (input: any) => {
      deletes.push(input.itemId);
      return { success: true, data: {} };
    });

    const ok = await runRemoveMutation('actor1', 'mutA');
    expect(ok.ok).toBe(true);
    expect(deletes).toEqual(['mutA']);

    const refusal = await runRemoveMutation('actor1', 'trB');
    expect(refusal.ok).toBe(false);
    expect(refusal.reason).toContain('is type trait, not mutation');
    expect(deletes).toEqual(['mutA']); // unchanged
  });
});
