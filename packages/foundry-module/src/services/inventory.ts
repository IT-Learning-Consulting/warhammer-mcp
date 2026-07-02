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

    // Branch classification (BUG-418: diff the tracker item's ID, not a boolean —
    // a repeat call on a still-unloaded weapon deletes the old ExtendedTest item and
    // creates a FRESH one, silently discarding accumulated SL progress; boolean-only
    // classification mis-reported that as 'no-op'):
    //   'started'   = no tracker before, tracker after (fresh reload ExtendedTest created)
    //   'completed' = tracker before, none after (ExtendedTest deleted + weapon loaded)
    //   'restarted' = tracker before AND after but DIFFERENT id (old tracker + its
    //                 SL.current progress discarded; a fresh reload started from zero)
    //   'no-op'     = same tracker id (or none either side) — nothing changed
    let branch: 'started' | 'completed' | 'restarted' | 'no-op';
    if (!wasReloading && isReloading) branch = 'started';
    else if (wasReloading && !isReloading) branch = 'completed';
    else if (wasReloading && isReloading && reloadingIdBefore !== reloadingIdAfter) branch = 'restarted';
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
    } else if (branch === 'restarted') {
      notify.created('item', afterWeapon?.name ?? weapon.name, {
        summary: `reload RESTARTED on ${actor.name} — the previous reload tracker (and any accumulated SL progress) was discarded; a fresh reload started from zero`,
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
