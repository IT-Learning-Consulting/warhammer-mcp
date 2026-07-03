// services/combat.ts — MCP Code-Quality Hardening v1, Phase 5 (R5.1).
//
// The combat cluster, extracted verbatim from data-access.ts (branch-by-abstraction Migrate; FoundryDataAccess
// keeps thin facade delegates until the Phase 6 Contract step). The only seams are the injected validateState
// callback (was this.validateFoundryState) and the addCombatants scene-token read routed through
// utils/scene-token-lookup (shared with ScenePlacementService without a cross-service import). The substitution
// is behavior-identical: the lookup's `?? null` is consumed only by `token?.id`, where optional chaining treats
// null/undefined alike. The damage cluster (snapshotStatus / waitForActorUpdateCommit / apply-damage) stays on
// FoundryDataAccess; the `combatant` umbrella (handlers/combatant.ts) is already extracted (Phase 3).

import { notify } from '../notify.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { findSceneTokenByActorId } from '../utils/scene-token-lookup.js';
import { buildOperationReceipt, type OperationReceipt } from './shared/operation-receipt.js';
import { verifyDocWrite } from '../utils/verifyWrite.js';

export class CombatService {
  constructor(private readonly validateState: () => void) {}

  private resolveCombat(combatId?: string): any {
    const combats: any = (game as any).combats;
    if (combatId) return combats?.get(combatId) ?? null;
    // Primary: game.combats.active (the combat flagged active on the viewed/active scene).
    if (combats?.active) return combats.active;
    // BUG-354 fallback: game.combats.active can read null in the headless MCP path after
    // remove-combatants vacates the turn-holder (the .active getter resolves via the viewed
    // scene + combat.active flag, which can desync when the current-turn slot is emptied),
    // even though the Combat document still lives in game.combats. Recover it so no-combatId
    // callers (end-combat, advance-combat) keep working: prefer a combat on the active scene,
    // else fall back to the sole combat if exactly one exists.
    const all: any[] = Array.from(combats?.values?.() ?? combats?.contents ?? []);
    if (all.length === 0) return null;
    const sceneId: string | undefined = (game as any).scenes?.active?.id ?? (game as any).scenes?.current?.id;
    if (sceneId) {
      const onScene = all.find((c: any) => (c.scene?.id ?? c.scene) === sceneId);
      if (onScene) return onScene;
    }
    return all.length === 1 ? all[0] : null;
  }

  async getCombat(data: { combatId?: string | undefined } = {}): Promise<any> {
    this.validateState();
    const combat = this.resolveCombat(data.combatId);
    if (!combat) return null;
    return {
      id: combat.id,
      round: combat.round,
      turn: combat.turn,
      active: combat.active,
      started: combat.started,
      sceneId: combat.scene?.id ?? null,
      currentCombatantId: combat.combatant?.id ?? null,
      combatantCount: combat.turns?.length ?? 0,
    };
  }

  async listCombatants(data: { combatId?: string | undefined } = {}): Promise<any[]> {
    this.validateState();
    const combat = this.resolveCombat(data.combatId);
    if (!combat) return [];
    return (combat.turns ?? []).map((c: any) => ({
      id: c.id,
      actorId: c.actorId ?? c.actor?.id ?? null,
      tokenId: c.tokenId ?? c.token?.id ?? null,
      name: c.name,
      initiative: c.initiative,
      defeated: c.defeated ?? false,
      hidden: c.hidden ?? false,
    }));
  }

  async advanceCombat(data: {
    combatId?: string | undefined;
    action: 'start' | 'next' | 'prev' | 'nextRound' | 'prevRound' | 'rollAll' | 'rollNPC';
  }): Promise<any> {
    this.validateState();
    const combat: any = this.resolveCombat(data.combatId);
    if (!combat) throw new Error('No combat found');

    switch (data.action) {
      case 'start':
        await combat.startCombat();
        break;
      case 'next':
        await combat.nextTurn();
        break;
      case 'prev':
        await combat.previousTurn();
        break;
      case 'nextRound':
        await combat.nextRound();
        break;
      case 'prevRound':
        await combat.previousRound();
        break;
      case 'rollAll':
        await combat.rollAll();
        break;
      case 'rollNPC':
        await combat.rollNPC();
        break;
    }

    notify.updated('combat', combat.id, {
      summary: `action: ${data.action}, round ${combat.round}`,
    });

    return {
      combatId: combat.id,
      round: combat.round,
      turn: combat.turn,
      combatantId: combat.combatant?.id ?? null,
    };
  }

  async addCombatants(data: {
    combatId?: string | undefined;
    actorIds: string[];
    sceneId?: string | undefined;
  }): Promise<{ added: string[]; combatId?: string } & OperationReceipt> {
    this.validateState();
    let combat: any = this.resolveCombat(data.combatId);

    // Phase 12 R12.2: track whether THIS call created the Combat doc, so the receipt only reports it as
    // created when it actually was (an existing combat resolved by combatId/active is not "created" here).
    let combatWasCreated = false;
    if (!combat) {
      const sceneId = data.sceneId ?? (game as any).scenes?.active?.id;
      if (!sceneId) throw new Error('No active scene and no sceneId provided');
      combat = await (Combat as any).create({ scene: sceneId, active: true });
      if (!combat) {
        throw new Error(`${ErrorTokens.ADD_COMBATANTS_NOT_PERSISTED}: Combat.create returned no document`);
      }
      const freshCombat: any = (game as any).combats?.get(combat.id);
      verifyDocWrite(freshCombat, { active: true }, ErrorTokens.ADD_COMBATANTS_NOT_PERSISTED);
      combatWasCreated = true;
    }

    const scene: any = combat.scene ?? (game as any).scenes?.get(data.sceneId) ?? (game as any).scenes?.active;
    const creates: any[] = [];
    const missingTokens: string[] = [];
    for (const actorId of data.actorIds) {
      const actor: any = (game as any).actors?.get(actorId);
      if (!actor) continue;
      const token: any = findSceneTokenByActorId(scene, actorId);
      if (!token?.id) {
        missingTokens.push(`${actor.name ?? actorId} (${actorId})`);
        continue;
      }
      creates.push({
        actorId,
        tokenId: token.id,
        sceneId: scene?.id,
        hidden: token?.hidden ?? false,
      });
    }

    if (missingTokens.length > 0) {
      const sceneLabel = scene?.name ?? scene?.id ?? data.sceneId ?? '(unknown scene)';
      throw new Error(
        `ADD_COMBATANTS_TOKEN_REQUIRED: add-combatants requires a scene-placed token on scene "${sceneLabel}". Missing token context for: ${missingTokens.join(', ')}. Pass sceneId for the target scene or place tokens before adding combatants.`,
      );
    }

    const created: any[] = await combat.createEmbeddedDocuments('Combatant', creates);
    if (created.length !== creates.length) {
      throw new Error(
        `${ErrorTokens.ADD_COMBATANTS_NOT_PERSISTED}: expected ${creates.length} combatant(s), got ${created.length}`,
      );
    }
    if (created.length > 0) {
      notify.created('combatant', `${created.length} combatant(s)`, {
        summary: `to combat ${combat.id}`,
      });
    }
    // Phase 12 R12.2: surface combatId (DTO already carries the optional field) + operation receipt.
    // createdDocumentIds = the combatant ids, plus the Combat doc id only when this call created it.
    const added = created.map((c: any) => c.id).filter(Boolean);
    return {
      added,
      ...(combat?.id ? { combatId: combat.id as string } : {}),
      ...buildOperationReceipt({ created: [...(combatWasCreated && combat?.id ? [combat.id] : []), ...added] }),
    };
  }

  async removeCombatants(data: {
    combatId?: string | undefined;
    combatantIds: string[];
  }): Promise<{ removed: string[] }> {
    this.validateState();
    const combat: any = this.resolveCombat(data.combatId);
    if (!combat) throw new Error('No combat found');
    // BUG-215 + PARITY-025: pre-filter the requested IDs against the live combatant
    // collection BEFORE deleting. Foundry's deleteEmbeddedDocuments THROWS on any id not
    // present in the EmbeddedCollection (it does NOT silently skip), so a mixed valid/bogus
    // batch would otherwise fail wholesale and remove nothing. We then map the delete return
    // to surface only the IDs Foundry actually removed (mirrors addCombatants:5400).
    // (BUG-215 re-fix 2026-05-24: original fix assumed silent-skip — a false premise surfaced
    // by /agent-validate live eval; deleteEmbeddedDocuments throws, so the pre-filter is required.)
    const validIds = data.combatantIds.filter((id) => combat.combatants?.get(id));
    const deleted = validIds.length
      ? await combat.deleteEmbeddedDocuments('Combatant', validIds)
      : [];
    const removedIds = deleted.map((c: any) => c.id).filter(Boolean);
    // RC1.1a — assert against the pre-filtered `validIds` (BUG-215), never the caller's raw
    // `data.combatantIds`: bogus ids are already excluded, so only a genuine drop should throw.
    if (removedIds.length !== validIds.length) {
      throw new Error(
        `${ErrorTokens.REMOVE_COMBATANTS_NOT_PERSISTED}: expected ${validIds.length} combatant(s) removed, got ${removedIds.length}`,
      );
    }
    notify.deleted('combatant', `${removedIds.length} combatant(s)`, {
      summary: `from combat ${combat.id}`,
    });
    return { removed: removedIds };
  }

  async endCombat(data: { combatId?: string | undefined } = {}): Promise<{ ended: string }> {
    this.validateState();
    const combat: any = this.resolveCombat(data.combatId);
    if (!combat) throw new Error('No combat found');
    const id: string = combat.id;
    await combat.delete();
    if ((game as any).combats?.get(id)) {
      throw new Error(`${ErrorTokens.END_COMBAT_NOT_PERSISTED}: combat ${id} still present in game.combats after delete`);
    }
    notify.deleted('combat', id, { summary: 'combat ended' });
    return { ended: id };
  }
}
