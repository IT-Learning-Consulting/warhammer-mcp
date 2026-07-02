// services/inventory.ts — wfrp_layer_expansion_v1 Phase 13 (R16).
//
// Wraps `actor.checkReloadExtendedTest(weapon, actor)` (wfrp4e.js:13150-13202): fully
// `async` and fully awaited internally — no dialog, no roll (it either deletes a
// completed reload ExtendedTest item + marks the weapon loaded, or creates a fresh
// reload ExtendedTest item). Safe to await directly. The method returns `undefined`,
// so this handler diffs the weapon's `flags.wfrp4e.reloading` id before/after the call
// to report which branch fired and verify the write landed.

import { notify } from '../notify.js';

export class InventoryService {
  constructor(private readonly validateState: () => void) {}

  async checkReload(data: { actorId: string; weaponId: string }): Promise<any> {
    this.validateState();
    const actor: any = (game as any).actors?.get(data.actorId);
    if (!actor) throw new Error(`Actor not found with ID: ${data.actorId}`);
    const weapon: any = actor.items?.get(data.weaponId);
    if (!weapon) {
      throw new Error(`CHECK_RELOAD_WEAPON_NOT_FOUND: item "${data.weaponId}" not found on ${actor.name}`);
    }

    const reloadingIdBefore: string | undefined = weapon.getFlag?.('wfrp4e', 'reloading');
    const wasReloading = !!reloadingIdBefore;

    await actor.checkReloadExtendedTest(weapon, actor);

    const afterWeapon: any = actor.items?.get(data.weaponId);
    const reloadingIdAfter: string | undefined = afterWeapon?.getFlag?.('wfrp4e', 'reloading');
    const isReloading = !!reloadingIdAfter;

    // Branch classification: 'started' = a fresh reload ExtendedTest item was created
    // (weapon.loading true, weapon.loaded.amt <= 0); 'completed' = the ExtendedTest item
    // was deleted + the weapon marked loaded; 'no-op' = the weapon isn't a `loading`
    // weapon type at all (checkReloadExtendedTest's own early-return guard).
    let branch: 'started' | 'completed' | 'no-op';
    if (!wasReloading && isReloading) branch = 'started';
    else if (wasReloading && !isReloading) branch = 'completed';
    else branch = 'no-op';

    if (branch === 'no-op' && !weapon.loading) {
      // Not a reload-eligible weapon — checkReloadExtendedTest silently no-op'd. Not an
      // error (matches the sheet's own behavior calling this on any weapon), but nothing
      // to verify or notify.
      return { actorId: actor.id, weaponId: weapon.id, weaponName: weapon.name, branch, reloading: isReloading };
    }

    if (branch === 'started') {
      notify.created('item', afterWeapon?.name ?? weapon.name, {
        summary: `reload started on ${actor.name}`,
        uuid: actor.uuid,
      });
    } else if (branch === 'completed') {
      notify.deleted('item', weapon.name, {
        summary: `reload complete on ${actor.name}`,
        uuid: actor.uuid,
      });
    }

    return {
      actorId: actor.id,
      weaponId: weapon.id,
      weaponName: weapon.name,
      branch,
      reloading: isReloading,
    };
  }
}
