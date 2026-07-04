// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file. Module-API calls here are settings/document writes only.
// Module Integration v1 Phase 9 — module-robak handler.
//
// Single action: roll-skill-silent — a headless, player-invisible skill/characteristic
// test via wfrp4e-macros-and-more's SocketHandlers.rollSkill extension.
//
// Differentiator (dossier §3 CAP-01): warhammer-mcp.request-player-rolls opens a player
// dialog and waits; rollSkill fires immediately, invisible to the player, posting a chat
// message in rollMode. This is a genuine additive capability.
//
// Design constraints (dossier §3, §5; phase9_pre_plan.md):
//   - requireModuleActive('wfrp4e-macros-and-more') is the FIRST executable statement — RETURNS, never throws.
//   - SocketHandlers is a wfrp4e *system* global; robak adds .rollSkill to it. Reach via globalThis.
//   - GM-context op; no destructive state change beyond a chat message (dossier §5: no confirm needed).
//   - CCR-3: notify.updated on the roll (a chat-post write).
//   - The test-object → {roll,sl,outcome} field mapping is smoke-verified (dossier §3 impl note);
//     we extract defensively and echo a trimmed testResult so smoke can confirm the shape.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ModuleRobakInput, type ModuleRobakInputType } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { ROBAK_MACROS_AND_MORE as MODULE_ID } from '../../../constants/moduleIds.js';
import { Envelope, isGM } from '../_shared/handler-utils.js';


// `SocketHandlers` is a wfrp4e *global lexical* binding — a top-level `class` declared in the
// CLASSIC-script wfrp4e.js (system.json `scripts:[...]`, no esmodules). Such a binding is resolvable
// by bare name from any module/script via the global lexical environment, but it is NOT an
// own-property of globalThis, so `(globalThis as any).SocketHandlers` is undefined. The wfrp4e system
// and wfrp4e-macros-and-more both reference it bare; we do the same. (Verified live 2026-06-11.)
declare const SocketHandlers: any;

// ── Local helpers ──────────────────────────────────────────────────────────────

function getSocketHandlers(): any {
  // Bare reference (NOT globalThis.SocketHandlers) — see the `declare const SocketHandlers` note above.
  // `typeof` guards against an unresolved binding without throwing ReferenceError in strict/ESM scope.
  const sh = typeof SocketHandlers !== 'undefined' ? SocketHandlers : null;
  if (!sh || typeof sh.rollSkill !== 'function') {
    throw new Error(
      'ROBAK_ROLL_SKILL_UNAVAILABLE: SocketHandlers.rollSkill is not bound — wfrp4e-macros-and-more may not have reached ready state',
    );
  }
  return sh;
}

/** Resolve actorId (UUID or world-document id) to an Actor, or null if it doesn't exist. */
function resolveActor(actorId: string): any {
  const game = (globalThis as any).game;
  const sync = (globalThis as any).fromUuidSync;
  let actor: any = null;
  if (typeof sync === 'function' && actorId.includes('.')) {
    try {
      actor = sync(actorId);
    } catch {
      actor = null;
    }
  }
  if (!actor) actor = game?.actors?.get?.(actorId) ?? null;
  return actor;
}

/** Defensively extract roll/SL/outcome from a wfrp4e test object (shape smoke-verified). */
function summarizeTest(test: any): {
  roll: number | null;
  sl: number | null;
  outcome: string | null;
  target: number | null;
} {
  // wfrp4e stamps roll/SL/outcome onto test.result (wfrp4e.js:7392-7394). Coerce numerics
  // defensively — SL can surface as a number or a numeric string ("0", "+3").
  const r = test?.result ?? test ?? {};
  const num = (v: unknown): number | null => {
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const roll = num(r.roll);
  const sl = num(r.SL ?? r.sl);
  const outcome = (r.outcome ?? r.description ?? null) as string | null;
  const target = num(r.target);
  return { roll, sl, outcome, target };
}

// ── Public dispatcher ─────────────────────────────────────────────────────────

export async function dispatchModuleRobak(data: unknown): Promise<any> {
  const g = requireModuleActive(MODULE_ID);
  if (g) return g;

  const parsed = ModuleRobakInput.parse(data);

  // Single-action umbrella; default guards against a future schema/dispatch mismatch.
  switch (parsed.action) {
    case 'roll-skill-silent':
      return handleRollSkillSilent(parsed);
    default:
      return { success: false, error: `Unknown module-robak action: ${(parsed as any).action}` };
  }
}

// ── Handler ──────────────────────────────────────────────────────────────────

type RollSkillInput = Extract<ModuleRobakInputType, { action: 'roll-skill-silent' }>;

async function handleRollSkillSilent(input: RollSkillInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can fire a silent skill roll' };
  // Pre-check existence for a clean error (rollSkill does a bare game.actors.get → cryptic
  // "Cannot read properties of undefined (reading 'setupSkill')" on a missing actor).
  const actor = resolveActor(input.actorId);
  if (!actor) {
    return { success: false, error: `ACTOR_NOT_FOUND: no actor resolves for "${input.actorId}"` };
  }
  try {
    const SocketHandlers = getSocketHandlers();
    const test = await SocketHandlers.rollSkill({
      actorId: input.actorId,
      skill: input.skill,
      options: input.options ?? {},
    });
    const summary = summarizeTest(test);
    const actorName = actor.name ?? null;

    notify.updated('robak', actorName ?? input.actorId, {
      summary: `${input.skill}: SL ${summary.sl ?? '?'}, ${summary.outcome ?? '?'}`,
    });

    return {
      success: true,
      data: {
        actorId: input.actorId,
        actorName,
        skill: input.skill,
        roll: summary.roll,
        sl: summary.sl,
        outcome: summary.outcome,
        testResult: summary, // trimmed, non-circular echo for smoke field-shape verification
      },
    };
  } catch (e) {
    return { success: false, error: `ROBAK_ROLL_FAILED: ${e instanceof Error ? e.message : String(e)}` };
  }
}
