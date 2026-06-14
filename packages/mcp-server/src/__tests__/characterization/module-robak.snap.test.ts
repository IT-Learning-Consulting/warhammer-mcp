// Characterization snapshot — ModuleRobakTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: roll-skill-silent (success); roll-skill-silent with minimal fields;
//         MODULE_NOT_ACTIVE branch.

import { describe, it, expect } from 'vitest';
import { ModuleRobakTool } from '../../tools/modules/robak/robak.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ModuleRobakTool(makeToolDeps(mockReturn));

describe('ModuleRobakTool — characterization', () => {
  it('roll-skill-silent — success with full fields', async () => {
    const r = await tool({
      actorId: 'Actor.abc123',
      actorName: 'Elspeth von Draken',
      skill: 'Perception',
      roll: 42,
      sl: 2,
      outcome: 'success',
    }).execute({ action: 'roll-skill-silent', actorId: 'Actor.abc123', skill: 'Perception' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('roll-skill-silent — failure with difficulty modifier', async () => {
    const r = await tool({
      actorId: 'Actor.abc123',
      actorName: 'Elspeth von Draken',
      skill: 'Cool',
      roll: 78,
      sl: -3,
      outcome: 'failure',
    }).execute({
      action: 'roll-skill-silent',
      actorId: 'Actor.abc123',
      skill: 'Cool',
      options: { difficulty: 'hard', rollMode: 'gmroll' },
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('roll-skill-silent — partial result (outcome unavailable)', async () => {
    const r = await tool({
      actorId: 'Actor.abc123',
      skill: 'Dodge',
      roll: null,
      sl: null,
      outcome: null,
    }).execute({ action: 'roll-skill-silent', actorId: 'Actor.abc123', skill: 'Dodge' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('MODULE_NOT_ACTIVE — wfrp4e-macros-and-more not active', async () => {
    const r = await new ModuleRobakTool(
      makeToolDeps(null, 'MODULE_NOT_ACTIVE: wfrp4e-macros-and-more is not active'),
    ).execute({ action: 'roll-skill-silent', actorId: 'Actor.abc123', skill: 'Perception' });
    expect((r as any).content[0].text).toMatchSnapshot();
    expect((r as any).isError).toBe(true);
  });
});
