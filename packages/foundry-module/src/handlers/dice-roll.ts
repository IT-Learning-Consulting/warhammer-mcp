// Phase 2 mcp_coverage_expansion — dice-roll handler.
//
// GM-side immediate formula evaluation over Foundry v13 `Roll`, distinct from the
// interactive `request-player-rolls` workflow.
//
// 3 actions:
//   roll      — new Roll(formula, actorId ? actor.getRollData() : {}); evaluate; sanitized terms.
//               createMessage:true posts a ChatMessage (Hybrid verify: persisted total === total).
//   validate  — Roll.validate(formula) → {valid} (sync; never throws on bad formula).
//   simulate  — Roll.simulate(formula, n) → distribution stats (n capped at 1000 by schema).
//
// Verification (CCR-2):
//   - roll (no createMessage): transient (CCR-2b) — Promise resolved, total numeric.
//   - roll (createMessage):    hybrid — re-read game.messages.get(id).rolls[0].total === total.
//   - validate / simulate:     read-only.
//
// HC1 / CCR-3: thin primitive — no system-config reads, no game-rule logic. Actor formulas read
// actor.getRollData() ONLY, never raw actor.system (Risk 2.A). Handler returns {success:true, data}.
//
// Error tokens: INVALID_FORMULA, ACTOR_NOT_FOUND, ROLL_DATA_ERROR, EVALUATION_ERROR.

import {
  DiceRollToolInput,
  type DiceRollToolInputType,
  type DiceRollRollInputType,
  type DiceRollValidateInputType,
  type DiceRollSimulateInputType,
} from '@foundry-mcp/shared';

// ── GM gate helper (mirrors item-directory.ts) ──────────────────────────────────

function validateGMAccess(): void {
  if (!game.user?.isGM) {
    throw new Error('Access denied: GM-only operation');
  }
}

// ── Envelope type ───────────────────────────────────────────────────────────────

type Envelope<T> = { success: true; data: T };

// ── Term serializer (R2.1: sanitized projection — NOT the raw serialized Roll dump) ──

function serializeTerm(term: any): Record<string, unknown> {
  const out: Record<string, unknown> = {
    class: term?.constructor?.name ?? 'RollTerm',
    formula:
      typeof term?.formula === 'string'
        ? term.formula
        : typeof term?.expression === 'string'
        ? term.expression
        : '',
    total: typeof term?.total === 'number' ? term.total : null,
    evaluated: term?.evaluated ?? false,
  };
  // DiceTerm subclasses carry per-die results; operator/numeric terms do not.
  if (Array.isArray(term?.results)) {
    out.results = term.results.map((r: any) => ({
      result: r?.result,
      active: r?.active ?? true,
      ...(r?.discarded ? { discarded: true } : {}),
    }));
  }
  return out;
}

// ── Speaker builder (createMessage only) ────────────────────────────────────────

function buildSpeaker(input: DiceRollRollInputType): any {
  const spec: any = {};
  if (input.speaker?.scene) spec.scene = (game.scenes as any)?.get(input.speaker.scene);
  if (input.speaker?.actor) spec.actor = (game.actors as any)?.get(input.speaker.actor);
  else if (input.actorId) spec.actor = (game.actors as any)?.get(input.actorId);
  if (input.speaker?.token && spec.scene) spec.token = spec.scene.tokens?.get(input.speaker.token);
  if (input.speaker?.alias) spec.alias = input.speaker.alias;
  return (ChatMessage as any).getSpeaker(spec);
}

// ── Action handlers ─────────────────────────────────────────────────────────────

async function rollFormula(input: DiceRollRollInputType): Promise<Envelope<unknown>> {
  // Resolve actor roll-data (getRollData ONLY — never raw actor.system).
  let rollData: Record<string, unknown> = {};
  if (input.actorId) {
    const actor: any = (game.actors as any)?.get(input.actorId);
    if (!actor) {
      throw new Error(`ACTOR_NOT_FOUND: no actor with id "${input.actorId}"`);
    }
    try {
      rollData = actor.getRollData() ?? {};
    } catch (e) {
      throw new Error(
        `ROLL_DATA_ERROR: failed to build roll data for actor "${input.actorId}": ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  // Validate the formula up-front so an invalid expression surfaces as INVALID_FORMULA,
  // not a generic evaluation throw.
  if (!(Roll as any).validate(input.formula)) {
    throw new Error(`INVALID_FORMULA: "${input.formula}" is not a valid dice formula`);
  }

  let roll: any;
  try {
    roll = new (Roll as any)(input.formula, rollData);
  } catch (e) {
    throw new Error(`INVALID_FORMULA: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    await roll.evaluate();
  } catch (e) {
    throw new Error(`EVALUATION_ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }

  const terms = Array.isArray(roll.terms) ? roll.terms.map(serializeTerm) : [];

  let messageId: string | null = null;
  if (input.createMessage) {
    const messageData: any = { speaker: buildSpeaker(input) };
    if (input.flavor) messageData.flavor = input.flavor;
    const msg: any = await roll.toMessage(messageData, {
      create: true,
      rollMode: input.rollMode,
    });
    messageId = msg?.id ?? null;

    // CCR-2 hybrid: re-read the persisted message and confirm its roll total matches.
    if (messageId) {
      const fresh: any = (game.messages as any)?.get(messageId);
      const persistedTotal = fresh?.rolls?.[0]?.total;
      if (typeof persistedTotal === 'number' && persistedTotal !== roll.total) {
        throw new Error(
          `EVALUATION_ERROR: persisted message roll total ${persistedTotal} ≠ evaluated total ${roll.total}`,
        );
      }
    }
  }

  return {
    success: true,
    data: {
      total: roll.total,
      formula: roll.formula,
      result: roll.result,
      terms,
      ...(input.createMessage ? { messageId } : {}),
    },
  };
}

function validateFormula(input: DiceRollValidateInputType): Envelope<unknown> {
  // Roll.validate is sync and returns a boolean — a bad formula is {valid:false}, NOT an error.
  const valid = (Roll as any).validate(input.formula);
  return { success: true, data: { valid, formula: input.formula } };
}

async function simulateFormula(input: DiceRollSimulateInputType): Promise<Envelope<unknown>> {
  if (!(Roll as any).validate(input.formula)) {
    throw new Error(`INVALID_FORMULA: "${input.formula}" is not a valid dice formula`);
  }

  let totals: number[];
  try {
    totals = await (Roll as any).simulate(input.formula, input.n);
  } catch (e) {
    throw new Error(`EVALUATION_ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }

  const n = totals.length;
  const min = n ? Math.min(...totals) : 0;
  const max = n ? Math.max(...totals) : 0;
  const mean = n ? totals.reduce((a, b) => a + b, 0) / n : 0;

  return { success: true, data: { totals, n, min, max, mean } };
}

// ── Dispatcher ──────────────────────────────────────────────────────────────────

export async function dispatchDiceRoll(data: unknown): Promise<Envelope<unknown>> {
  let input: DiceRollToolInputType;
  try {
    input = DiceRollToolInput.parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  validateGMAccess();

  if (typeof Roll === 'undefined') {
    throw new Error('Foundry state not ready: Roll unavailable');
  }

  switch (input.action) {
    case 'roll':
      return rollFormula(input);
    case 'validate':
      return validateFormula(input);
    case 'simulate':
      return simulateFormula(input);
  }
}
