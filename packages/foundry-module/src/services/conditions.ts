// services/conditions.ts — MCP Code-Quality Hardening v1, Phase 5 (R5.1).
//
// The conditions cluster, extracted verbatim from data-access.ts (branch-by-abstraction Migrate;
// FoundryDataAccess keeps thin facade delegates until the Phase 6 Contract step). The only seam is the
// injected validateState callback (was this.validateFoundryState). Zero behavioral change — the
// game.wfrp4e.config.conditions accessor (BUG-344-safe; NOT CONFIG.WFRP4E), the notify calls, and the
// canvas-tooltip read travel unchanged. NO DP-16 / verifyDocWrite is added (writes delegate to the wfrp4e
// system methods actor.addCondition / actor.removeCondition, consistent with applyDamage; HC1 zero-diff).
// The active-effects cluster (listActiveEffects / getActiveEffectByName / add|update|deleteActiveEffect)
// stays on FoundryDataAccess (future phase).

import { notify } from '../notify.js';

export class ConditionsService {
  constructor(private readonly validateState: () => void) {}

  async applyCondition(data: {
    actorId: string;
    conditionKey: string;
    value?: number | undefined;
    mode?: 'add' | 'set' | undefined;
  }): Promise<any> {
    this.validateState();
    const actor: any = (game as any).actors?.get(data.actorId);
    if (!actor) throw new Error(`Actor not found with ID: ${data.actorId}`);

    // BUG-344 (same root cause): wfrp4e config is on game.wfrp4e.config, not CONFIG.WFRP4E.
    // The old CONFIG.WFRP4E.conditions lookup returned undefined → validKeys=[] → the guard
    // below was silently skipped, so unknown condition keys were never rejected.
    const validKeys = Object.keys((globalThis as any).game?.wfrp4e?.config?.conditions ?? {});
    if (validKeys.length && !validKeys.includes(data.conditionKey)) {
      throw new Error(
        `Unknown condition key '${data.conditionKey}'. Valid: ${validKeys.join(', ')}`,
      );
    }

    const value = data.value ?? 1;
    const mode: 'add' | 'set' = data.mode ?? 'add';
    if (mode === 'set') {
      // BUG-477/A2: absolute write. wfrp4e's actor.addCondition(key, n) is ADDITIVE (n stacks), so a
      // naive re-apply compounds (5,5 → 10). For mode:"set" read the current stack and move by the delta
      // to land on the requested absolute value (add-up / remove-down / no-op). Default mode "add" keeps
      // the historical additive behavior for back-compat.
      const before: any = actor.hasCondition?.(data.conditionKey);
      const currentStack =
        typeof before === 'object' ? (before?.conditionValue ?? before?.flags?.wfrp4e?.value ?? 0) : before ? 1 : 0;
      const delta = value - currentStack;
      if (delta > 0) await actor.addCondition(data.conditionKey, delta);
      else if (delta < 0) await actor.removeCondition(data.conditionKey, -delta);
    } else {
      await actor.addCondition(data.conditionKey, value);
    }
    const stacked: any = actor.hasCondition?.(data.conditionKey);
    const stackCount =
      typeof stacked === 'object'
        ? stacked?.conditionValue ?? stacked?.flags?.wfrp4e?.value ?? value
        : value;
    // DP-16 (BUG-477/A2): for an absolute set, prove the stack landed on the requested value.
    if (mode === 'set' && stackCount !== value) {
      throw new Error(
        `CONDITION_SET_NOT_PERSISTED: mode:"set" requested stackCount ${value} on '${data.conditionKey}' but read ${stackCount} after write`,
      );
    }

    // Surface canvas-anchored feedback when actor has a token on the current scene.
    const placedToken: any = (globalThis as any).canvas?.tokens?.placeables?.find(
      (t: any) => t?.actor?.id === actor.id,
    );
    const tokenDoc = placedToken?.document;
    notify.created('condition', data.conditionKey, {
      summary: `on ${actor.name} (stack ${stackCount})`,
      uuid: actor.uuid,
      tooltip: tokenDoc ? { tokenDoc, message: `+${data.conditionKey}` } : undefined,
    });

    return {
      actorId: actor.id,
      conditionKey: data.conditionKey,
      mode,
      stackCount,
    };
  }

  async removeCondition(data: {
    actorId: string;
    conditionKey: string;
    count?: number | undefined;
  }): Promise<any> {
    this.validateState();
    const actor: any = (game as any).actors?.get(data.actorId);
    if (!actor) throw new Error(`Actor not found with ID: ${data.actorId}`);
    const count = data.count ?? 1;
    await actor.removeCondition(data.conditionKey, count);
    const stacked: any = actor.hasCondition?.(data.conditionKey);
    const remainingCount =
      stacked && typeof stacked === 'object'
        ? stacked?.conditionValue ?? stacked?.flags?.wfrp4e?.value ?? 0
        : stacked
          ? 1
          : 0;
    notify.deleted('condition', data.conditionKey, {
      summary: `from ${actor.name} (${count} stack(s) removed)`,
      uuid: (actor as any).uuid,
    });
    return {
      actorId: actor.id,
      conditionKey: data.conditionKey,
      remainingCount,
    };
  }

  // P-09: shared per-actor condition projection (used by both the single-actor path and
  // the combatId batch). Pure read of actor.effects — no behavioral change vs the prior inline map.
  private projectActorConditions(actor: any): any[] {
    return (actor.effects ?? [])
      .filter((e: any) => e.isCondition)
      .map((e: any) => ({
        conditionKey: e.conditionKey ?? e.statuses?.first?.() ?? e.name,
        value:
          e.conditionValue ?? e.flags?.wfrp4e?.value ?? 1,
        effectId: e.id,
      }));
  }

  // P-09 (wfrp_layer_expansion Phase 5): single-actor OR combat-batch. Exactly one of
  // actorId / combatId is supplied (mutex enforced upstream by the shared Zod refine).
  // - actorId  → returns the condition array directly (byte-for-byte unchanged).
  // - combatId → resolves the Combat doc, iterates combat.combatants, and returns a
  //   per-actor roster map { [actorId]: { actorName, conditions[] } }. Combatants whose
  //   actor cannot be resolved are skipped (e.g. a dangling token reference).
  async listConditions(data: { actorId?: string | undefined; combatId?: string | undefined }): Promise<any> {
    this.validateState();

    if (data.combatId !== undefined) {
      const combat: any = (game as any).combats?.get(data.combatId);
      if (!combat) throw new Error(`COMBAT_NOT_FOUND: no combat with id "${data.combatId}"`);
      const roster: Record<string, { actorName: string; conditions: any[] }> = {};
      for (const combatant of combat.combatants ?? []) {
        const actor: any = combatant?.actor;
        const actorId: string | undefined = actor?.id ?? combatant?.actorId;
        if (!actor || !actorId) continue; // skip dangling/tokenless combatants
        roster[actorId] = {
          actorName: actor.name,
          conditions: this.projectActorConditions(actor),
        };
      }
      return roster;
    }

    const actor: any = (game as any).actors?.get(data.actorId);
    if (!actor) throw new Error(`Actor not found with ID: ${data.actorId}`);
    return this.projectActorConditions(actor);
  }
}
