// wfrp-session-prep.test.ts — verifies the /wfrp-session-prep workflow primitive sequence.
//
// /wfrp-session-prep is a Markdown skill spec executed by the LLM at runtime — there is
// no TypeScript entrypoint in the production module. To exercise the spec mechanically,
// this test ships a `runSessionPrep` runner that mirrors steps 1-4 of SKILL.md exactly,
// calling primitives via the harness's callMcp(). Tests assert on the resulting call log
// and the runner's composed output. If the SKILL.md workflow changes, update both this
// runner AND SKILL.md in lockstep.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  callMcp,
  clearMcpMocks,
  getCallLog,
  mockMcpCall,
} from './_harness.js';

interface CharacterStub {
  id: string;
  name: string;
}

async function runSessionPrep(): Promise<{ briefing: string; missingPcs: string[] }> {
  // Step 1 — parallel reads
  const [, listActorsRes, sceneRes, journalsRes] = await Promise.all([
    callMcp('warhammer-mcp.getWorldInfo'),
    callMcp('warhammer-mcp.listActors', { type: 'character' }),
    callMcp('warhammer-mcp.getActiveScene'),
    callMcp('warhammer-mcp.listJournals'),
  ]);

  const listActorsEnvelope = listActorsRes as { success: boolean; data?: CharacterStub[] };
  const allActors: CharacterStub[] = listActorsEnvelope.data ?? [];
  const sceneEnvelopeForParty = sceneRes as { success: boolean; data?: { name?: string; tokens?: { actorId: string }[] } | null };
  const sceneActorIds = new Set(
    (sceneEnvelopeForParty?.data?.tokens ?? []).map(t => t.actorId),
  );
  const partyList: CharacterStub[] = allActors.filter(a => sceneActorIds.has(a.id));

  // Step 2 — per-PC fan-out
  const partyDetails = await Promise.all(
    partyList.map(pc =>
      callMcp('warhammer-mcp.getCharacterInfo', { characterId: pc.id }).then(res => ({ pc, res })),
    ),
  );

  const missingPcs: string[] = [];
  const presentParty: CharacterStub[] = [];
  for (const { pc, res } of partyDetails) {
    const env = res as { success: boolean };
    if (env.success === false) {
      missingPcs.push(pc.name);
      continue;
    }
    presentParty.push(pc);
  }

  // Step 3 — scene NPC fan-out
  const sceneEnvelope = sceneEnvelopeForParty;
  const sceneData = sceneEnvelope?.data ?? null;
  const sceneNpcLines: string[] = [];
  if (!sceneData) {
    // skip
  } else {
    const tokens = sceneData.tokens ?? [];
    const partyIds = new Set(partyList.map(pc => pc.id));
    const npcActorIds = tokens
      .map(t => t.actorId)
      .filter(id => !partyIds.has(id));
    const npcResults = await Promise.all(
      npcActorIds.map(id => callMcp('warhammer-mcp.getCharacterInfo', { characterId: id })),
    );
    for (const r of npcResults) {
      const env = r as { success: boolean; data?: { name?: string } };
      if (env.success !== false && env.data) sceneNpcLines.push(env.data.name ?? '(unnamed)');
    }
  }

  // Step 4 — open quests
  const journalsEnvelope = journalsRes as { success: boolean; data?: { id: string; name: string; flags?: { active?: boolean } }[] };
  const allJournals = journalsEnvelope.data ?? [];
  const questJournals = allJournals.filter(j =>
    /^quest:/i.test(j.name) && (j.flags?.active !== false),
  );
  const questContents = await Promise.all(
    questJournals.map(j =>
      callMcp('warhammer-mcp.getJournalContent', { journalId: j.id }).then(res => ({ j, res })),
    ),
  );

  // Step 5 — compose briefing (minimal version sufficient for assertions)
  const briefing = [
    '## Session Prep',
    '',
    '### Party Status',
    ...presentParty.map(pc => `- **${pc.name}**`),
    '',
    '### Current Scene',
    sceneData ? sceneData.name ?? '(unnamed scene)' : '_No active scene._',
    ...sceneNpcLines.map(n => `- ${n}`),
    '',
    '### Open Quests',
    ...(questContents.length === 0
      ? ['_No open quests._']
      : questContents.map(({ j }) => `- **${j.name}**`)),
  ].join('\n');

  return { briefing, missingPcs };
}

beforeEach(() => {
  clearMcpMocks();
});

function defaultMocks(opts: {
  partyCount?: number;
  sceneNpcCount?: number;
  activeQuestCount?: number;
  scene?: { tokens: { actorId: string }[] } | null;
  charLookupOverride?: (characterId: string) => unknown;
} = {}) {
  const partyCount = opts.partyCount ?? 4;
  const sceneNpcCount = opts.sceneNpcCount ?? 16;
  const activeQuestCount = opts.activeQuestCount ?? 2;

  const partyPcs = Array.from({ length: partyCount }, (_, i) => ({
    id: `pc-${i}`,
    name: `PC ${i}`,
  }));
  const npcs = Array.from({ length: sceneNpcCount }, (_, i) => ({
    id: `npc-${i}`,
    name: `NPC ${i}`,
  }));
  const sceneTokens = [
    ...partyPcs.map(p => ({ actorId: p.id })),
    ...npcs.map(n => ({ actorId: n.id })),
  ];
  const scene =
    opts.scene === null
      ? null
      : opts.scene ?? { name: 'Test Scene', tokens: sceneTokens };

  const journals = [
    ...Array.from({ length: activeQuestCount }, (_, i) => ({
      id: `quest-${i}`,
      name: `Quest: Number ${i}`,
      flags: { active: true },
    })),
    { id: 'lore-1', name: 'Lore: Background', flags: {} },
  ];

  mockMcpCall('warhammer-mcp.getWorldInfo', { success: true, data: { name: 'Test World' } });
  mockMcpCall('warhammer-mcp.listActors', {
    success: true,
    data: [...partyPcs, ...npcs.map(n => ({ ...n }))],
  });
  mockMcpCall('warhammer-mcp.getActiveScene', { success: true, data: scene });
  mockMcpCall('warhammer-mcp.listJournals', { success: true, data: journals });
  mockMcpCall('warhammer-mcp.getCharacterInfo', (input: any) => {
    if (opts.charLookupOverride) return opts.charLookupOverride(input.characterId);
    const all = [...partyPcs, ...npcs];
    const found = all.find(a => a.id === input.characterId);
    return found
      ? { success: true, data: found }
      : { success: false, error: 'Actor not found' };
  });
  mockMcpCall('warhammer-mcp.getJournalContent', (input: any) => ({
    success: true,
    data: { id: input.journalId, content: `body for ${input.journalId}` },
  }));
}

describe('wfrp-session-prep / happy path', () => {
  it('issues primitives in workflow order and composes a briefing with all sections', async () => {
    defaultMocks();
    const { briefing } = await runSessionPrep();
    const log = getCallLog();
    const keys = log.map(e => e.queryKey);

    // Step 1 keys all appear before any getCharacterInfo
    const step1Keys = [
      'warhammer-mcp.getWorldInfo',
      'warhammer-mcp.listActors',
      'warhammer-mcp.getActiveScene',
      'warhammer-mcp.listJournals',
    ];
    for (const k of step1Keys) expect(keys).toContain(k);
    const firstCharInfoIdx = keys.indexOf('warhammer-mcp.getCharacterInfo');
    for (const k of step1Keys) {
      expect(keys.indexOf(k)).toBeLessThan(firstCharInfoIdx);
    }

    // getCharacterInfo: 4 PCs + 16 NPCs = 20 calls
    const charInfoCount = keys.filter(k => k === 'warhammer-mcp.getCharacterInfo').length;
    expect(charInfoCount).toBe(20);

    // getJournalContent: exactly 2 (the active Quest: journals)
    const jcount = keys.filter(k => k === 'warhammer-mcp.getJournalContent').length;
    expect(jcount).toBe(2);

    // Briefing has all sections
    expect(briefing).toContain('Party Status');
    expect(briefing).toContain('Current Scene');
    expect(briefing).toContain('Open Quests');
  });
});

describe('wfrp-session-prep / no active scene', () => {
  it('omits scene NPC fan-out and notes "No active scene"', async () => {
    defaultMocks({ scene: null });
    const { briefing } = await runSessionPrep();
    const log = getCallLog();

    // No scene → party = listActors ∩ scene tokens = ∅; 0 getCharacterInfo calls.
    const charInfoCount = log.filter(e => e.queryKey === 'warhammer-mcp.getCharacterInfo').length;
    expect(charInfoCount).toBe(0);

    expect(briefing).toContain('No active scene');
  });
});

describe('wfrp-session-prep / BUG-028 stale party roster', () => {
  it('omits a PC whose getCharacterInfo returns success:false without throwing', async () => {
    defaultMocks({
      partyCount: 4,
      sceneNpcCount: 0,
      scene: { tokens: [{ actorId: 'pc-0' }, { actorId: 'pc-1' }, { actorId: 'pc-2' }, { actorId: 'pc-3' }] },
      charLookupOverride: (id: string) => {
        if (id === 'pc-1') return { success: false, error: 'Actor not found' };
        return { success: true, data: { id, name: `PC ${id.replace('pc-', '')}` } };
      },
    });
    const { briefing, missingPcs } = await runSessionPrep();
    expect(missingPcs).toContain('PC 1');
    expect(briefing).not.toContain('**PC 1**');
    // Still has the other 3 PCs
    expect(briefing).toContain('**PC 0**');
    expect(briefing).toContain('**PC 2**');
    expect(briefing).toContain('**PC 3**');
  });
});
