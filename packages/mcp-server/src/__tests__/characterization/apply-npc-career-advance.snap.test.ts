// Characterization snapshot — ApplyNpcCareerAdvanceTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// ApplyNpcCareerAdvanceTool.handle() is a thin pass-through: returns the raw query result.

import { describe, it, expect } from 'vitest';
import { ApplyNpcCareerAdvanceTool } from '../../tools/apply-npc-career-advance.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ApplyNpcCareerAdvanceTool(makeToolDeps(mockReturn));

describe('ApplyNpcCareerAdvanceTool — characterization', () => {
  it('apply-npc-career-advance — career advanced successfully', async () => {
    const r = await tool({
      actorId: 'npcactor12345678',
      careerItemId: 'career01234567890',
      advanced: true,
      characteristicsUpdated: ['ws', 't'],
      skillsAdded: ['Melee (Basic)', 'Dodge'],
      talentsAdded: [],
    }).handle({
      actorId: 'npcactor12345678',
      careerItemId: 'career01234567890',
    });
    expect(r).toMatchSnapshot();
  });

  it('apply-npc-career-advance — minimal result shape', async () => {
    const r = await tool({
      actorId: 'npcactor98765432',
      careerItemId: 'career09876543210',
      advanced: true,
    }).handle({
      actorId: 'npcactor98765432',
      careerItemId: 'career09876543210',
    });
    expect(r).toMatchSnapshot();
  });
});
