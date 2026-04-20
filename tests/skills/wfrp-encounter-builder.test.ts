// wfrp-encounter-builder.test.ts — exercises the /wfrp-encounter-builder
// `build` flow plus BUG-006 placement regression.
//
// SKILL.md primitive sequence (build sub-command):
//   1. getActiveScene — confirm scene present
//   2. listCreaturesByCriteria — pool of candidates
//   3. pick creatures that fit the threat-budget window
//   4. getCompendiumDocumentFull per chosen (for stats in journal)
//   5. createActorFromCompendium per chosen
//   6. addActorsToScene { placement: "random", ... }  ← BUG-006 guardrail
//   7. createJournalEntry summarizing composition
//
// BUG-006 regression: `placement` is ALWAYS set explicitly on the
// addActorsToScene payload — never omitted (the old pipeline left it
// undefined, which fell through to 0,0 stack placement).

import { describe, it, expect, beforeEach } from 'vitest';
import {
  callMcp,
  clearMcpMocks,
  getCallLog,
  mockMcpCall,
} from './_harness.js';

interface CreatureCandidate {
  packId: string;
  documentId: string;
  name: string;
  xp: number;
}

interface BuildResult {
  ok: boolean;
  reason?: string;
  chosen?: CreatureCandidate[];
  xpSum?: number;
  journalId?: string;
  placedActorIds?: string[];
}

async function runBuildEncounter(
  partyLevel: 'starting' | 'experienced' | 'veteran',
  partySize: number,
  threat: 'easy' | 'standard' | 'hard' | 'deadly',
  composition: 'mob' | 'mixed' | 'elite' = 'mixed',
  hidden = false,
): Promise<BuildResult> {
  const sceneEnv = (await callMcp('warhammer-mcp.getActiveScene', {})) as {
    success: boolean;
    data: { id: string; name: string } | null;
  };
  if (!sceneEnv.data) return { ok: false, reason: 'no active scene' };

  const baselines = { starting: 100, experienced: 300, veteran: 800 } as const;
  const multipliers = { easy: 0.5, standard: 1.0, hard: 1.5, deadly: 2.0 } as const;
  const budgetCenter = baselines[partyLevel] * partySize * multipliers[threat];
  const budgetLo = budgetCenter * 0.8;
  const budgetHi = budgetCenter * 1.2;

  const poolEnv = (await callMcp('warhammer-mcp.listCreaturesByCriteria', {})) as {
    success: boolean;
    data: CreatureCandidate[];
  };
  if (!poolEnv.data || poolEnv.data.length === 0) {
    return { ok: false, reason: 'no creatures in pool' };
  }

  // Compose subset: greedy pick in XP order.
  const sorted = [...poolEnv.data].sort((a, b) =>
    composition === 'elite' ? b.xp - a.xp : a.xp - b.xp,
  );
  const chosen: CreatureCandidate[] = [];
  let xpSum = 0;
  for (const c of sorted) {
    if (xpSum + c.xp > budgetHi) break;
    chosen.push(c);
    xpSum += c.xp;
    if (xpSum >= budgetLo && composition === 'elite' && chosen.length >= 1) break;
    if (xpSum >= budgetLo && chosen.length >= 3) break;
  }
  if (xpSum < budgetLo) {
    return { ok: false, reason: 'cannot compose encounter' };
  }

  // Read full stats per chosen (used for journal body).
  for (const c of chosen) {
    await callMcp('warhammer-mcp.getCompendiumDocumentFull', {
      packId: c.packId,
      documentId: c.documentId,
    });
  }

  // Create actor clones.
  const placedActorIds: string[] = [];
  for (const c of chosen) {
    const createEnv = (await callMcp('warhammer-mcp.createActorFromCompendium', {
      packId: c.packId,
      documentId: c.documentId,
    })) as { success: boolean; data: { actorId: string } };
    placedActorIds.push(createEnv.data.actorId);
  }

  // Place them on the scene. BUG-006 — placement MUST be set explicitly.
  await callMcp('warhammer-mcp.addActorsToScene', {
    actorIds: placedActorIds,
    placement: 'random',
    hidden,
  });

  // Write the journal summary.
  const journalBody = chosen.map(c => `<li>${c.name} (${c.xp} XP)</li>`).join('');
  const journalEnv = (await callMcp('warhammer-mcp.createJournalEntry', {
    name: `Encounter: ${threat} × ${chosen.length}`,
    content: `<p>Threat ${threat}, budget ${Math.round(budgetCenter)} XP, sum ${xpSum} XP</p><ul>${journalBody}</ul>`,
  })) as { success: boolean; data: { id: string } };

  return {
    ok: true,
    chosen,
    xpSum,
    journalId: journalEnv.data.id,
    placedActorIds,
  };
}

describe('/wfrp-encounter-builder build', () => {
  beforeEach(() => {
    clearMcpMocks();

    mockMcpCall('warhammer-mcp.getActiveScene', {
      success: true,
      data: { id: 'scene-1', name: 'Altdorf Market' },
    });

    mockMcpCall('warhammer-mcp.listCreaturesByCriteria', {
      success: true,
      data: [
        { packId: 'wfrp4e-core.items', documentId: 'u1', name: 'Ungor', xp: 120 },
        { packId: 'wfrp4e-core.items', documentId: 'u2', name: 'Ungor', xp: 120 },
        { packId: 'wfrp4e-core.items', documentId: 'u3', name: 'Ungor', xp: 120 },
        { packId: 'wfrp4e-core.items', documentId: 'b1', name: 'Bestigor', xp: 400 },
        { packId: 'wfrp4e-core.items', documentId: 'b2', name: 'Bestigor', xp: 400 },
        { packId: 'wfrp4e-core.items', documentId: 'm1', name: 'Minotaur', xp: 1500 },
      ],
    });

    mockMcpCall('warhammer-mcp.getCompendiumDocumentFull', {
      success: true,
      data: { system: { details: { experience: { total: 120 } } } },
    });

    let actorCounter = 1;
    mockMcpCall('warhammer-mcp.createActorFromCompendium', () => ({
      success: true,
      data: { actorId: `actor-${actorCounter++}` },
    }));

    mockMcpCall('warhammer-mcp.addActorsToScene', {
      success: true,
      data: { placed: 3 },
    });

    mockMcpCall('warhammer-mcp.createJournalEntry', {
      success: true,
      data: { id: 'journal-1' },
    });
  });

  it('1. happy path — builds a standard encounter for 4 experienced PCs', async () => {
    const result = await runBuildEncounter('experienced', 4, 'standard', 'mixed');
    expect(result.ok).toBe(true);
    expect(result.chosen?.length).toBeGreaterThan(0);
    expect(result.journalId).toBe('journal-1');
  });

  it('2. BUG-006 regression — addActorsToScene payload sets placement explicitly', async () => {
    await runBuildEncounter('experienced', 4, 'standard', 'mixed');
    const addCall = getCallLog().find(c => c.queryKey === 'warhammer-mcp.addActorsToScene');
    expect(addCall).toBeDefined();
    const payload = addCall!.input as { placement?: string };
    // BUG-006 guardrail: placement must be set and must NOT be undefined / 0,0
    expect(payload.placement).toBe('random');
  });

  it('3. creates a journal summary — createJournalEntry is called once per build', async () => {
    await runBuildEncounter('experienced', 4, 'standard', 'mixed');
    const journalCalls = getCallLog().filter(c => c.queryKey === 'warhammer-mcp.createJournalEntry');
    expect(journalCalls).toHaveLength(1);
    const payload = journalCalls[0].input as { name: string; content: string };
    expect(payload.name).toMatch(/^Encounter:/);
    expect(payload.content).toMatch(/Threat standard/);
  });

  it('4. edge — no active scene refuses cleanly', async () => {
    mockMcpCall('warhammer-mcp.getActiveScene', { success: true, data: null });
    const result = await runBuildEncounter('experienced', 4, 'standard', 'mixed');
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('no active scene');
  });

  it('5. edge — empty creature pool refuses cleanly', async () => {
    mockMcpCall('warhammer-mcp.listCreaturesByCriteria', { success: true, data: [] });
    const result = await runBuildEncounter('experienced', 4, 'standard', 'mixed');
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('no creatures');
  });

  it('6. call order — scene read precedes pool read precedes creates precedes place precedes journal', async () => {
    await runBuildEncounter('experienced', 4, 'standard', 'mixed');
    const order = getCallLog().map(c => c.queryKey);
    const sceneIdx = order.indexOf('warhammer-mcp.getActiveScene');
    const poolIdx = order.indexOf('warhammer-mcp.listCreaturesByCriteria');
    const createIdx = order.indexOf('warhammer-mcp.createActorFromCompendium');
    const placeIdx = order.indexOf('warhammer-mcp.addActorsToScene');
    const journalIdx = order.indexOf('warhammer-mcp.createJournalEntry');
    expect(sceneIdx).toBeLessThan(poolIdx);
    expect(poolIdx).toBeLessThan(createIdx);
    expect(createIdx).toBeLessThan(placeIdx);
    expect(placeIdx).toBeLessThan(journalIdx);
  });
});
