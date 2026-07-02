// wire-ammo tests — ManageInventoryTool P-04 (wfrp_layer_expansion Phase 5).
//
// wire-ammo composes getCharacterInfo (resolve weapon+ammo, validate type) → updateItem
// (write currentAmmo.value) → getCharacterInfo again (DP-16 post-write verify) → notify.
// It throws typed WIRE_AMMO_* errors instead of returning a formatted string on the
// failure paths, so these are explicit assertions (not characterization snapshots).
//
// Mock note: wire-ammo calls getCharacterInfo TWICE (pre-write read + post-write verify).
// The function-keyed mock returns the BEFORE fixture on the 1st getCharacterInfo and the
// AFTER fixture (currentAmmo written) on the 2nd, so the post-write verify passes on the
// happy path and the silent-drop test can force it to fail.

import { describe, it, expect } from 'vitest';
import { ManageInventoryTool } from '../tools/manage-inventory.js';
import { makeToolDeps } from './test-utils.js';

// A bow (ammunitionGroup="bow") + arrows (ammunitionType="bow") + sling-stones (type "sling").
const BASE_ITEMS = [
  {
    id: 'item-bow',
    name: 'Bow',
    type: 'weapon',
    system: { ammunitionGroup: { value: 'bow' }, currentAmmo: { value: '' } },
  },
  {
    id: 'item-arrows',
    name: 'Arrows',
    type: 'ammunition',
    system: { ammunitionType: { value: 'bow' }, quantity: { value: 12 } },
  },
  {
    id: 'item-stones',
    name: 'Sling Stones',
    type: 'ammunition',
    system: { ammunitionType: { value: 'sling' }, quantity: { value: 20 } },
  },
];

function makeCharacter(items: any[]) {
  return { id: 'actor-archer', name: 'Archer', system: {}, items };
}

// Build a stateful function mock: 1st getCharacterInfo → before, 2nd → after.
// `wroteValue` lets the silent-drop test diverge the verify read from what was "written".
function makeMock(opts: { wroteValue?: string } = {}) {
  let getCalls = 0;
  return (key: string, _args: any) => {
    if (key === 'warhammer-mcp.getCharacterInfo') {
      getCalls += 1;
      if (getCalls === 1) return makeCharacter(BASE_ITEMS);
      // post-write verify read: reflect the write (or a forced silent-drop divergence)
      const written = opts.wroteValue ?? 'item-arrows';
      const afterItems = BASE_ITEMS.map((i) =>
        i.id === 'item-bow'
          ? { ...i, system: { ...i.system, currentAmmo: { value: written } } }
          : i,
      );
      return makeCharacter(afterItems);
    }
    if (key === 'warhammer-mcp.updateItem') return { updated: true };
    if (key === 'warhammer-mcp.notify') return { acknowledged: true };
    return null;
  };
}

const tool = (mockReturn: any) => new ManageInventoryTool(makeToolDeps(mockReturn));

describe('ManageInventoryTool.wire-ammo — P-04', () => {
  it('happy path: wires compatible ammo and post-write verify passes', async () => {
    const r = await tool(makeMock()).handle({
      action: 'wire-ammo',
      characterName: 'Archer',
      weaponName: 'Bow',
      ammoName: 'Arrows',
    });
    expect(r).toContain('Wired');
    expect(r).toContain('Arrows');
    expect(r).toContain('Bow');
  });

  it('ammo-type mismatch: throws WIRE_AMMO_TYPE_MISMATCH and performs no write', async () => {
    // sling-stones (type "sling") into a bow (group "bow") → reject before any write
    const calls: string[] = [];
    const mock = (key: string, _args: any) => {
      calls.push(key);
      if (key === 'warhammer-mcp.getCharacterInfo') return makeCharacter(BASE_ITEMS);
      if (key === 'warhammer-mcp.updateItem') return { updated: true };
      return null;
    };
    await expect(
      tool(mock).handle({
        action: 'wire-ammo',
        characterName: 'Archer',
        weaponName: 'Bow',
        ammoName: 'Sling Stones',
      }),
    ).rejects.toThrow('WIRE_AMMO_TYPE_MISMATCH');
    // assert NO updateItem write happened (only the resolve read)
    expect(calls).not.toContain('warhammer-mcp.updateItem');
  });

  it('post-write verify: throws WIRE_AMMO_NOT_PERSISTED when the field did not land', async () => {
    // force the verify read to report an empty currentAmmo (silent drop)
    await expect(
      tool(makeMock({ wroteValue: '' })).handle({
        action: 'wire-ammo',
        characterName: 'Archer',
        weaponName: 'Bow',
        ammoName: 'Arrows',
      }),
    ).rejects.toThrow('WIRE_AMMO_NOT_PERSISTED');
  });

  it('weapon not found: throws WIRE_AMMO_WEAPON_NOT_FOUND', async () => {
    await expect(
      tool(makeMock()).handle({
        action: 'wire-ammo',
        characterName: 'Archer',
        weaponName: 'Crossbow',
        ammoName: 'Arrows',
      }),
    ).rejects.toThrow('WIRE_AMMO_WEAPON_NOT_FOUND');
  });

  it('clear path: ammoName=null wipes the wiring and verify passes', async () => {
    // start from a bow that already has arrows wired; clear → currentAmmo back to ""
    let getCalls = 0;
    const wired = BASE_ITEMS.map((i) =>
      i.id === 'item-bow'
        ? { ...i, system: { ...i.system, currentAmmo: { value: 'item-arrows' } } }
        : i,
    );
    const mock = (key: string, _args: any) => {
      if (key === 'warhammer-mcp.getCharacterInfo') {
        getCalls += 1;
        // 1st read = wired; 2nd (verify) read = cleared
        return getCalls === 1 ? makeCharacter(wired) : makeCharacter(BASE_ITEMS);
      }
      if (key === 'warhammer-mcp.updateItem') return { updated: true };
      if (key === 'warhammer-mcp.notify') return { acknowledged: true };
      return null;
    };
    const r = await tool(mock).handle({
      action: 'wire-ammo',
      characterName: 'Archer',
      weaponName: 'Bow',
      ammoName: null,
    });
    expect(r).toContain('Cleared');
    expect(r).toContain('Bow');
  });
});
