// Characterization snapshot — CombatantTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// CombatantTool.execute() wraps every action's result in content[0].text.

import { describe, it, expect } from 'vitest';
import { CombatantTool } from '../../tools/combatant.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new CombatantTool(makeToolDeps(mockReturn));

const SNAPSHOT: any = {
  combatId: 'combat12345678901',
  id: 'comb001234567890',
  name: 'Aldric',
  img: null,
  actorId: 'actor001234567890',
  tokenId: 'token001234567890',
  initiative: 35,
  hidden: false,
  defeated: false,
  type: null,
};

describe('CombatantTool — characterization', () => {
  it('get-combatant — combatant snapshot text', async () => {
    const r = await tool(SNAPSHOT).execute({
      action: 'get-combatant',
      combatantId: 'comb001234567890',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update-combatant — rename, updated snapshot text', async () => {
    const r = await tool({ ...SNAPSHOT, name: 'Slain Goblin' }).execute({
      action: 'update-combatant',
      combatantId: 'comb001234567890',
      changes: { name: 'Slain Goblin' },
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('set-initiative — initiative set, turn pointer stable', async () => {
    const r = await tool({
      combatId: 'combat12345678901',
      combatantId: 'comb001234567890',
      initiative: 42,
      currentCombatantId: 'comb001234567890',
      turnPointerStable: true,
    }).execute({
      action: 'set-initiative',
      combatantId: 'comb001234567890',
      value: 42,
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('clear-initiative — initiative cleared to null', async () => {
    const r = await tool({
      combatId: 'combat12345678901',
      combatantId: 'comb001234567890',
      initiative: null,
    }).execute({
      action: 'clear-initiative',
      combatantId: 'comb001234567890',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('reroll-initiative — new roll posted to chat', async () => {
    const r = await tool({
      combatId: 'combat12345678901',
      combatantId: 'comb001234567890',
      initiative: 28,
      currentCombatantId: null,
      turnPointerStable: true,
    }).execute({
      action: 'reroll-initiative',
      combatantId: 'comb001234567890',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('set-hidden — combatant hidden', async () => {
    const r = await tool({
      combatId: 'combat12345678901',
      combatantId: 'comb001234567890',
      hidden: true,
    }).execute({
      action: 'set-hidden',
      combatantId: 'comb001234567890',
      hidden: true,
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('set-defeated — combatant marked defeated (skull overlay)', async () => {
    const r = await tool({
      combatId: 'combat12345678901',
      combatantId: 'comb001234567890',
      defeated: true,
    }).execute({
      action: 'set-defeated',
      combatantId: 'comb001234567890',
      defeated: true,
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
