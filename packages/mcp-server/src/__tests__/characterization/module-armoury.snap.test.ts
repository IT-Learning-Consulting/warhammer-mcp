// Characterization snapshot — ModuleArmouryTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: get-me (read), check-damage (read), spend-me (write), repair-item (write),
// MODULE_NOT_ACTIVE branch.

import { describe, it, expect } from 'vitest';
import { ModuleArmouryTool } from '../../tools/modules/forien-armoury/armoury.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) =>
  new ModuleArmouryTool(makeToolDeps(mockReturn));

describe('ModuleArmouryTool — characterization', () => {
  it('get-me — ME read result', async () => {
    const r = await tool({
      actorId: 'Actor.abc',
      actorName: 'Elspeth',
      value: 12,
      maximum: 15,
      regen: 3,
      virtual: false,
    }).execute({ action: 'get-me', actorId: 'Actor.abc' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-me — non-caster (virtual ME)', async () => {
    const r = await tool({
      actorId: 'Actor.xyz',
      actorName: 'Karl',
      value: 0,
      maximum: null,
      regen: null,
      virtual: true,
    }).execute({ action: 'get-me', actorId: 'Actor.xyz' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('check-damage — no damaged items', async () => {
    const r = await tool({
      actorId: 'Actor.abc',
      actorName: 'Elspeth',
      damaged: [],
      totalRepairCost: 0,
    }).execute({ action: 'check-damage', actorId: 'Actor.abc' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('check-damage — with damaged items', async () => {
    const r = await tool({
      actorId: 'Actor.abc',
      actorName: 'Elspeth',
      damaged: [
        { name: 'Leather Jack', type: 'armour', damage: 2, repairCost: 4 },
        { name: 'Hand Weapon', type: 'weapon', damage: 1, repairCost: 2 },
      ],
      totalRepairCost: 6,
    }).execute({ action: 'check-damage', actorId: 'Actor.abc' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('spend-me — normal spend (no endurance test)', async () => {
    const r = await tool({
      actorId: 'Actor.abc',
      actorName: 'Elspeth',
      previousValue: 12,
      value: 9,
      amount: 3,
      willTriggerEnduranceTest: false,
    }).execute({ action: 'spend-me', actorId: 'Actor.abc', amount: 3 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('spend-me — endurance test triggered', async () => {
    const r = await tool({
      actorId: 'Actor.abc',
      actorName: 'Elspeth',
      previousValue: 2,
      value: -1,
      amount: 3,
      willTriggerEnduranceTest: true,
    }).execute({ action: 'spend-me', actorId: 'Actor.abc', amount: 3 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('repair-item — partial repair', async () => {
    const r = await tool({
      name: 'Leather Jack',
      field: 'body damage',
      previousValue: 2,
      newValue: 0,
    }).execute({ action: 'repair-item', actorId: 'Actor.abc', itemId: 'Item.lj', newValue: 0 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('MODULE_NOT_ACTIVE — probe inactive branch', async () => {
    const r = await new ModuleArmouryTool(
      makeToolDeps(null, 'MODULE_NOT_ACTIVE: forien-armoury is not active'),
    ).execute({ action: 'get-me', actorId: 'Actor.abc' });
    expect((r as any).content[0].text).toMatchSnapshot();
    expect((r as any).isError).toBe(true);
  });
});
