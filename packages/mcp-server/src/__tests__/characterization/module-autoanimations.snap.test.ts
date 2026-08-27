// Characterization snapshot — ModuleAutoAnimationsTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: get-item-animation (read), get-autorec (read), list-animations (read),
// set-item-animation (write), MODULE_NOT_ACTIVE branch.

import { describe, it, expect } from 'vitest';
import { ModuleAutoAnimationsTool } from '../../tools/modules/autoanimations/autoanimations.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) =>
  new ModuleAutoAnimationsTool(makeToolDeps(mockReturn));

describe('ModuleAutoAnimationsTool — characterization', () => {
  it('get-item-animation — flags present', async () => {
    const r = await tool({
      uuid: 'Actor.x.Item.y',
      name: 'Hand Weapon',
      flags: {
        menu: 'weapon',
        primary: { video: { animation: 'sword' } },
      },
      isCustomized: true,
      version: 5,
    }).execute({ action: 'get-item-animation', uuid: 'Actor.x.Item.y' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-item-animation — no flags (no customization)', async () => {
    const r = await tool({
      uuid: 'Actor.x.Item.z',
      name: 'Dagger',
      flags: null,
      isCustomized: false,
      version: null,
    }).execute({ action: 'get-item-animation', uuid: 'Actor.x.Item.z' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-animations — with keys', async () => {
    const r = await tool({
      trail: ['melee', 'weapon'],
      keys: ['sword', 'axe', 'dagger'],
      count: 3,
    }).execute({ action: 'list-animations', dbSection: 'melee', menuType: 'weapon' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-animations — empty keys at root', async () => {
    const r = await tool({
      trail: [],
      keys: [],
      count: 0,
      note: 'AA not ready',
    }).execute({ action: 'list-animations' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-autorec — entry counts', async () => {
    const r = await tool({
      counts: { melee: 5, range: 2, ontoken: 0, templatefx: 1, aura: 0, preset: 0, aefx: 0 },
      version: 5,
    }).execute({ action: 'get-autorec' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // BUG-812(a) — a filtered/paginated get-autorec call returns an `entries` page instead of
  // the counts-only shape; locks the F03 formatter surface (every field printed).
  it('get-autorec — filtered entries page', async () => {
    const r = await tool({
      entries: [
        { id: 'melee-0001', label: 'Hand Weapon', isEnabled: true, isCustomized: true, fromAmmo: false, menu: 'melee', version: 5, animation: 'melee/weapon/sword' },
      ],
      totalAvailable: 2,
      truncated: true,
      offset: 0,
      limit: 1,
    }).execute({ action: 'get-autorec', category: 'melee', limit: 1 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('set-item-animation — write confirmed', async () => {
    const r = await tool({
      uuid: 'Actor.x.Item.y',
      name: 'Hand Weapon',
      version: 5,
      isCustomized: true,
      menu: 'weapon',
    }).execute({
      action: 'set-item-animation',
      uuid: 'Actor.x.Item.y',
      animation: { primary: { dbSection: 'melee', menuType: 'weapon', animation: 'sword' } },
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // BUG-812(c) — update-autorec-entry / remove-autorec-entry formatter surfaces (F03).
  it('update-autorec-entry — patch confirmed', async () => {
    const r = await tool({
      category: 'melee',
      id: 'melee-0001',
      label: 'Hand Weapon (Renamed)',
      updated: true,
    }).execute({
      action: 'update-autorec-entry',
      category: 'melee',
      id: 'melee-0001',
      label: 'Hand Weapon (Renamed)',
      confirm: true,
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('remove-autorec-entry — removal confirmed', async () => {
    const r = await tool({
      category: 'melee',
      id: 'melee-0001',
      removed: true,
    }).execute({
      action: 'remove-autorec-entry',
      category: 'melee',
      id: 'melee-0001',
      confirm: true,
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('MODULE_NOT_ACTIVE — probe inactive branch', async () => {
    const r = await new ModuleAutoAnimationsTool(
      makeToolDeps(null, 'MODULE_NOT_ACTIVE: autoanimations is not active'),
    ).execute({ action: 'get-autorec' });
    expect((r as any).content[0].text).toMatchSnapshot();
    expect((r as any).isError).toBe(true);
  });
});
