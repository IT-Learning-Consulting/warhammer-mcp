// Phase 3 mcp_coverage_expansion — combatant umbrella handler.
//
// 7 actions: get-combatant / update-combatant / set-initiative / clear-initiative /
//   reroll-initiative / set-hidden / set-defeated.
//
// Architecture:
//   - New umbrella BESIDE the flat manage-combat surface (data-access.ts) — that stays untouched.
//   - Combatants are embedded under a Combat (combat.combatants), NOT under a Scene, so writes
//     re-fetch via game.combats.get(combatId).combatants.get(combatantId) — the scene-embedded
//     CRUD factory does not apply.
//   - Writes use verifyDocWrite({readSource:true}) (F08-safe; CCR-2a / DP-16) or an explicit
//     _source assert for the null/number initiative cases.
//   - Initiative ops:
//       set-initiative   → Combat.setInitiative(id, value)  (maintains turn-order sort + turn pointer)
//       clear-initiative → combatant.update({initiative:null}) (setInitiative is non-nullable)
//       reroll-initiative→ Combat#rollInitiative([id], {formula, updateTurn:true}) (posts a roll message)
//   - update-combatant's allow-list (schema-enforced) is {name, img, flags, hidden, defeated};
//     initiative is rejected (raw update bypasses turn maintenance → tracker corruption).
//   - Error tokens: NO_ACTIVE_COMBAT, COMBAT_NOT_FOUND, COMBATANT_NOT_FOUND,
//     COMBATANT_*_NOT_PERSISTED.
//   - HC1 / CCR-3: no CONFIG reads / no game-rule logic.
//   - NEVER calls ChatMessage.create directly — GM feedback routes through notify.* (reroll's
//     chat message is Foundry's own Combat#rollInitiative side effect, not an MCP-authored post).

import {
  CombatantToolInput,
  type CombatantToolInputType,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { notify } from '../notify.js';
import { verifyDocWrite } from '../utils/verifyWrite.js';

// ── GM gate ───────────────────────────────────────────────────────────────────

function validateGMAccess(): void {
  if (!game.user?.isGM) {
    throw new Error('Access denied: GM-only operation');
  }
}

// ── Combat / combatant resolvers ────────────────────────────────────────────────

// Resolve the target combat: combatId → that combat; omitted → the active combat.
function resolveCombatOrThrow(combatId?: string): any {
  const combats: any = (game as any).combats;
  const combat = combatId ? combats?.get(combatId) : combats?.active;
  if (!combat) {
    throw new Error(
      combatId
        ? `COMBAT_NOT_FOUND: no combat with id "${combatId}"`
        : 'NO_ACTIVE_COMBAT: no active combat (pass combatId to target a specific combat)',
    );
  }
  return combat;
}

function getCombatantOrThrow(combat: any, combatantId: string): any {
  const combatant = combat.combatants?.get(combatantId);
  if (!combatant) {
    throw new Error(`COMBATANT_NOT_FOUND: no combatant with id "${combatantId}" in combat "${combat.id}"`);
  }
  return combatant;
}

// Re-fetch a fresh combatant reference after a write for CCR-2a verification.
function refetchCombatantOrThrow(combatId: string, combatantId: string, token: string): any {
  const combats: any = (game as any).combats;
  const fresh = combats?.get(combatId)?.combatants?.get(combatantId);
  if (!fresh) {
    throw new Error(`${token}: combatant "${combatantId}" not found after write`);
  }
  return fresh;
}

// ── Envelope type ─────────────────────────────────────────────────────────────

type Envelope<T> = { success: true; data: T };

// Project a combatant to a stable response shape (richer than the flat list-combatants row).
function projectCombatant(combat: any, c: any): Record<string, unknown> {
  return {
    combatId: combat.id,
    id: c.id,
    name: c.name,
    img: c.img ?? null,
    actorId: c.actorId ?? c.actor?.id ?? null,
    tokenId: c.tokenId ?? c.token?.id ?? null,
    initiative: c.initiative ?? null,
    hidden: c.hidden ?? false,
    defeated: c.defeated ?? false,
    type: c.type ?? null,
  };
}

// ── Action handlers ───────────────────────────────────────────────────────────

function getCombatant(
  input: Extract<CombatantToolInputType, { action: 'get-combatant' }>,
): Envelope<unknown> {
  const combat = resolveCombatOrThrow(input.combatId);
  const c = getCombatantOrThrow(combat, input.combatantId);
  return { success: true, data: projectCombatant(combat, c) };
}

async function updateCombatant(
  input: Extract<CombatantToolInputType, { action: 'update-combatant' }>,
): Promise<Envelope<unknown>> {
  validateGMAccess();

  return wrappedWrite('combatant.update-combatant', async () => {
    const combat = resolveCombatOrThrow(input.combatId);
    const combatId: string = combat.id;
    const c = getCombatantOrThrow(combat, input.combatantId);

    await c.update(input.changes);

    const fresh = refetchCombatantOrThrow(combatId, input.combatantId, 'COMBATANT_UPDATE_NOT_PERSISTED');

    // CCR-2a: verify name/hidden/defeated strictly. `flags` is arbitrary module data
    // (passthrough, unverified); `img` is a FilePathField that Foundry may normalize a
    // blank value to a default icon, so only verify it when a non-empty path was supplied.
    const expectedFields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input.changes)) {
      if (key === 'flags') continue;
      if (key === 'img' && value === '') continue;
      expectedFields[key] = value;
    }
    if (Object.keys(expectedFields).length > 0) {
      verifyDocWrite(fresh, expectedFields, 'COMBATANT_UPDATE_NOT_PERSISTED', { readSource: true });
    }

    notify.updated('combatant', c.name, { summary: `updated: ${Object.keys(input.changes).join(', ')}` });

    return { success: true, data: projectCombatant(combat, fresh) } satisfies Envelope<unknown>;
  });
}

async function setInitiative(
  input: Extract<CombatantToolInputType, { action: 'set-initiative' }>,
): Promise<Envelope<unknown>> {
  validateGMAccess();

  return wrappedWrite('combatant.set-initiative', async () => {
    const combat = resolveCombatOrThrow(input.combatId);
    const combatId: string = combat.id;
    const c = getCombatantOrThrow(combat, input.combatantId);
    const turnBefore: string | null = combat.combatant?.id ?? null;

    // Combat.setInitiative maintains turn-order sort AND keeps the current-turn pointer
    // anchored to the same combatant — a raw combatant.update({initiative}) would not.
    await combat.setInitiative(c.id, input.value);

    const fresh = refetchCombatantOrThrow(combatId, input.combatantId, 'COMBATANT_SET_INITIATIVE_NOT_PERSISTED');
    verifyDocWrite(fresh, { initiative: input.value }, 'COMBATANT_SET_INITIATIVE_NOT_PERSISTED', {
      readSource: true,
    });

    notify.updated('combatant', c.name, { summary: `initiative set to ${input.value}` });

    const freshCombat = (game as any).combats?.get(combatId);
    const currentCombatantId: string | null = freshCombat?.combatant?.id ?? null;
    return {
      success: true,
      data: {
        combatId,
        combatantId: c.id,
        initiative: input.value,
        currentCombatantId,
        turnPointerStable: currentCombatantId === turnBefore,
      },
    } satisfies Envelope<unknown>;
  });
}

async function clearInitiative(
  input: Extract<CombatantToolInputType, { action: 'clear-initiative' }>,
): Promise<Envelope<unknown>> {
  validateGMAccess();

  return wrappedWrite('combatant.clear-initiative', async () => {
    const combat = resolveCombatOrThrow(input.combatId);
    const combatId: string = combat.id;
    const c = getCombatantOrThrow(combat, input.combatantId);

    // setInitiative is (id, value:number) — non-nullable. Clearing to null sorts the
    // combatant to the bottom of the turn order (expected for an unrolled combatant) and
    // does not corrupt the turn pointer, so a direct update is the correct primitive here.
    await c.update({ initiative: null });

    const fresh = refetchCombatantOrThrow(combatId, input.combatantId, 'COMBATANT_CLEAR_INITIATIVE_NOT_PERSISTED');
    const actual = (foundry as any).utils.getProperty(fresh._source, 'initiative');
    if (actual !== null && actual !== undefined) {
      throw new Error(
        `COMBATANT_CLEAR_INITIATIVE_NOT_PERSISTED: initiative is ${JSON.stringify(actual)}, expected null`,
      );
    }

    notify.updated('combatant', c.name, { summary: 'initiative cleared' });

    return {
      success: true,
      data: { combatId, combatantId: c.id, initiative: null },
    } satisfies Envelope<unknown>;
  });
}

async function rerollInitiative(
  input: Extract<CombatantToolInputType, { action: 'reroll-initiative' }>,
): Promise<Envelope<unknown>> {
  validateGMAccess();

  return wrappedWrite('combatant.reroll-initiative', async () => {
    const combat = resolveCombatOrThrow(input.combatId);
    const combatId: string = combat.id;
    const c = getCombatantOrThrow(combat, input.combatantId);
    const turnBefore: string | null = combat.combatant?.id ?? null;

    // Combat#rollInitiative([id], {formula, updateTurn:true}) is turn-pointer-stable, accepts
    // a formula override, and posts a roll ChatMessage (Foundry's own side effect, mirroring
    // the tracker UX). updateTurn:true re-anchors the current turn after the re-sort.
    const options: any = { updateTurn: true };
    if (input.formula) options.formula = input.formula;
    await combat.rollInitiative([c.id], options);

    const fresh = refetchCombatantOrThrow(combatId, input.combatantId, 'COMBATANT_REROLL_INITIATIVE_NOT_PERSISTED');
    const newInitiative = (foundry as any).utils.getProperty(fresh._source, 'initiative');
    if (typeof newInitiative !== 'number') {
      throw new Error(
        `COMBATANT_REROLL_INITIATIVE_NOT_PERSISTED: initiative is ${JSON.stringify(newInitiative)}, expected a number`,
      );
    }

    notify.updated('combatant', c.name, { summary: `initiative rerolled → ${newInitiative}` });

    const freshCombat = (game as any).combats?.get(combatId);
    const currentCombatantId: string | null = freshCombat?.combatant?.id ?? null;
    return {
      success: true,
      data: {
        combatId,
        combatantId: c.id,
        initiative: newInitiative,
        currentCombatantId,
        turnPointerStable: currentCombatantId === turnBefore,
      },
    } satisfies Envelope<unknown>;
  });
}

async function setHidden(
  input: Extract<CombatantToolInputType, { action: 'set-hidden' }>,
): Promise<Envelope<unknown>> {
  validateGMAccess();

  return wrappedWrite('combatant.set-hidden', async () => {
    const combat = resolveCombatOrThrow(input.combatId);
    const combatId: string = combat.id;
    const c = getCombatantOrThrow(combat, input.combatantId);

    await c.update({ hidden: input.hidden });

    const fresh = refetchCombatantOrThrow(combatId, input.combatantId, 'COMBATANT_SET_HIDDEN_NOT_PERSISTED');
    verifyDocWrite(fresh, { hidden: input.hidden }, 'COMBATANT_SET_HIDDEN_NOT_PERSISTED', { readSource: true });

    notify.updated('combatant', c.name, { summary: `hidden: ${input.hidden}` });

    return {
      success: true,
      data: { combatId, combatantId: c.id, hidden: input.hidden },
    } satisfies Envelope<unknown>;
  });
}

async function setDefeated(
  input: Extract<CombatantToolInputType, { action: 'set-defeated' }>,
): Promise<Envelope<unknown>> {
  validateGMAccess();

  return wrappedWrite('combatant.set-defeated', async () => {
    const combat = resolveCombatOrThrow(input.combatId);
    const combatId: string = combat.id;
    const c = getCombatantOrThrow(combat, input.combatantId);

    // Core's CombatTracker syncs the token "defeated" status overlay off this field via the
    // updateCombatant hook — no extra MCP work is needed to apply/remove the skull overlay.
    await c.update({ defeated: input.defeated });

    const fresh = refetchCombatantOrThrow(combatId, input.combatantId, 'COMBATANT_SET_DEFEATED_NOT_PERSISTED');
    verifyDocWrite(fresh, { defeated: input.defeated }, 'COMBATANT_SET_DEFEATED_NOT_PERSISTED', { readSource: true });

    notify.updated('combatant', c.name, { summary: `defeated: ${input.defeated}` });

    return {
      success: true,
      data: { combatId, combatantId: c.id, defeated: input.defeated },
    } satisfies Envelope<unknown>;
  });
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

export async function dispatchCombatant(data: unknown): Promise<Envelope<unknown>> {
  let input: CombatantToolInputType;
  try {
    input = CombatantToolInput.parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  validateGMAccess();

  if (!(game as any).combats) {
    throw new Error('Foundry state not ready: game.combats unavailable');
  }

  switch (input.action) {
    case 'get-combatant':
      return getCombatant(input);
    case 'update-combatant':
      return updateCombatant(input);
    case 'set-initiative':
      return setInitiative(input);
    case 'clear-initiative':
      return clearInitiative(input);
    case 'reroll-initiative':
      return rerollInitiative(input);
    case 'set-hidden':
      return setHidden(input);
    case 'set-defeated':
      return setDefeated(input);
  }
}
