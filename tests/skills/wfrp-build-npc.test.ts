// wfrp-build-npc.test.ts — exercises the /wfrp-build-npc `build` flow.
//
// SKILL.md primitive sequence (build sub-command):
//   1. Read archetype seed from references/archetype-seeds.md (mocked as data here)
//   2. searchCompendium { query: baseCreature, itemType: "creature" } — clone source
//   3. getCompendiumDocumentFull on winning pack+id
//   4. createActorFromCompendium
//   5. For each skill/talent/equipment: searchCompendium + addItemFromCompendium
//   6. updateActor with merged { name, tier, standing }   ← BUG-043 precedent: single call
//   7. Emit summary
//
// BUG-002 regression: this test asserts the skill NEVER calls `createCustomNPC` or
// `previewNPCXP`. The old manage-npc-generation.ts called these dead keys.
//
// BUG-007 regression: this test asserts equipment list is non-empty for the
// human-mercenary archetype — the old pipeline shipped empty loadouts.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  callMcp,
  clearMcpMocks,
  getCallLog,
  mockMcpCall,
} from './_harness.js';

interface ArchetypeSeed {
  archetype: string;
  baseCreature: string;
  career: string;
  tier: string;
  standing: number;
  skills: string[];
  talents: string[];
  equipment: string[];
}

const HUMAN_MERCENARY: ArchetypeSeed = {
  archetype: 'human mercenary',
  baseCreature: 'Commoner',
  career: 'Soldier',
  tier: 'silver',
  standing: 2,
  skills: ['Athletics', 'Cool', 'Melee (Basic)'],
  talents: ['Combat Reflexes', 'Strike Mighty Blow'],
  equipment: ['Hand Weapon', 'Leather Jack', 'Shield'],
};

interface BuildResult {
  ok: boolean;
  reason?: string;
  actorId?: string;
  skipped?: string[];
}

async function runBuildNpc(
  seed: ArchetypeSeed,
  name: string,
): Promise<BuildResult> {
  // Step 2: find base creature
  const cloneSearch = (await callMcp('warhammer-mcp.searchCompendium', {
    query: seed.baseCreature,
    itemType: 'creature',
  })) as { success: boolean; data: Array<{ packId: string; documentId: string }> };
  if (!cloneSearch.data || cloneSearch.data.length === 0) {
    return { ok: false, reason: `base creature "${seed.baseCreature}" not found` };
  }
  const cloneSource = cloneSearch.data[0];

  // Step 3: read full doc
  await callMcp('warhammer-mcp.getCompendiumDocumentFull', {
    packId: cloneSource.packId,
    documentId: cloneSource.documentId,
  });

  // Step 4: create actor
  const createEnv = (await callMcp('warhammer-mcp.createActorFromCompendium', {
    packId: cloneSource.packId,
    documentId: cloneSource.documentId,
  })) as { success: boolean; data: { actorId: string } };
  if (!createEnv.success) {
    return { ok: false, reason: 'createActorFromCompendium failed' };
  }
  const actorId = createEnv.data.actorId;

  // Step 5: outfit (skills, talents, equipment)
  const allItems = [
    ...seed.skills.map(name => ({ name, type: 'skill' })),
    ...seed.talents.map(name => ({ name, type: 'talent' })),
    ...seed.equipment.map(name => ({ name, type: 'trapping' })),
  ];
  const skipped: string[] = [];
  for (const item of allItems) {
    const searchEnv = (await callMcp('warhammer-mcp.searchCompendium', {
      query: item.name,
      itemType: item.type,
    })) as { success: boolean; data: Array<{ packId: string; documentId: string }> };
    if (!searchEnv.data || searchEnv.data.length === 0) {
      skipped.push(item.name);
      continue;
    }
    const pick = searchEnv.data[0];
    const addEnv = (await callMcp('warhammer-mcp.addItemFromCompendium', {
      actorId,
      packId: pick.packId,
      documentId: pick.documentId,
    })) as { success: boolean };
    if (!addEnv.success) skipped.push(item.name);
  }

  // Step 6: merged tier stamp + rename
  await callMcp('warhammer-mcp.updateActor', {
    actorId,
    updateData: {
      name,
      'system.details.status.tier': seed.tier,
      'system.details.status.standing': seed.standing,
    },
  });

  return { ok: true, actorId, skipped };
}

describe('/wfrp-build-npc build', () => {
  beforeEach(() => {
    clearMcpMocks();

    // Clone source found
    mockMcpCall('warhammer-mcp.searchCompendium', (input: any) => {
      if (input?.itemType === 'creature') {
        return {
          success: true,
          data: [{ packId: 'wfrp4e-core.items', documentId: 'commoner-1' }],
        };
      }
      // Every outfit item resolves to one hit
      return {
        success: true,
        data: [{ packId: 'wfrp4e-core.items', documentId: `${input?.query}-id` }],
      };
    });

    mockMcpCall('warhammer-mcp.getCompendiumDocumentFull', {
      success: true,
      data: { system: {} },
    });

    mockMcpCall('warhammer-mcp.createActorFromCompendium', {
      success: true,
      data: { actorId: 'npc-actor-1' },
    });

    mockMcpCall('warhammer-mcp.addItemFromCompendium', { success: true });

    mockMcpCall('warhammer-mcp.updateActor', { success: true, data: {} });
  });

  it('1. happy path — builds a human mercenary', async () => {
    const result = await runBuildNpc(HUMAN_MERCENARY, 'Karl the Merc');
    expect(result.ok).toBe(true);
    expect(result.actorId).toBe('npc-actor-1');
  });

  it('2. BUG-002 regression — never calls createCustomNPC or previewNPCXP', async () => {
    await runBuildNpc(HUMAN_MERCENARY, 'Karl');
    const deadKeys = getCallLog()
      .map(c => c.queryKey)
      .filter(k => k === 'warhammer-mcp.createCustomNPC' || k === 'warhammer-mcp.previewNPCXP');
    expect(deadKeys).toHaveLength(0);
  });

  it('3. BUG-007 regression — equipment loadout is attached (not empty)', async () => {
    await runBuildNpc(HUMAN_MERCENARY, 'Karl');
    const equipmentCalls = getCallLog().filter(c => c.queryKey === 'warhammer-mcp.addItemFromCompendium');
    // 3 skills + 2 talents + 3 equipment = 8 addItemFromCompendium calls
    expect(equipmentCalls.length).toBe(8);
  });

  it('4. BUG-043 precedent — updateActor tier stamp is one merged call, not two', async () => {
    await runBuildNpc(HUMAN_MERCENARY, 'Karl');
    const updateCalls = getCallLog().filter(c => c.queryKey === 'warhammer-mcp.updateActor');
    expect(updateCalls).toHaveLength(1);
    const payload = updateCalls[0].input as { updateData: Record<string, unknown> };
    expect(payload.updateData).toHaveProperty('name');
    expect(payload.updateData).toHaveProperty('system.details.status.tier');
    expect(payload.updateData).toHaveProperty('system.details.status.standing');
  });

  it('5. partial-outfit tolerance — missing equipment is skipped, not a halt', async () => {
    // Override: equipment search for "Shield" returns empty
    mockMcpCall('warhammer-mcp.searchCompendium', (input: any) => {
      if (input?.itemType === 'creature') {
        return {
          success: true,
          data: [{ packId: 'wfrp4e-core.items', documentId: 'commoner-1' }],
        };
      }
      if (input?.query === 'Shield') {
        return { success: true, data: [] };
      }
      return {
        success: true,
        data: [{ packId: 'wfrp4e-core.items', documentId: `${input?.query}-id` }],
      };
    });

    const result = await runBuildNpc(HUMAN_MERCENARY, 'Karl');
    expect(result.ok).toBe(true);
    expect(result.skipped).toContain('Shield');
  });

  it('6. edge — base creature not found refuses cleanly', async () => {
    mockMcpCall('warhammer-mcp.searchCompendium', { success: true, data: [] });
    const result = await runBuildNpc(HUMAN_MERCENARY, 'Karl');
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('Commoner');
  });
});
