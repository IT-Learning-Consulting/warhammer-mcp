// DIALOG-PATH: DIALOG_FREE — schema-level annotation only; documents that lose-momentum is intentionally NOT modeled as an action (see wfrp4e-gm-toolkit/gmtoolkit.ts header) and run-group-test always passes bypass:true/skipDialog.
// Module Integration v1 Phase 11 — Zod schema (promoted to @foundry-mcp/shared, ADR-020) for module-gmtoolkit
// (WFRP4e GM Toolkit v9.1.1).
//
// CCR-5: module-specific schemas are promoted to @foundry-mcp/shared (ADR-020, Phase C2). `.strict()` on every variant.
//
// 12 actions over the verified server-reachable surface (capability-manifest.json: 12 SUPPORTED +
// 5 SUPPORTED_WITH_CONFIRMATION). Phase-11 Q&A dispositions (phase11_pre_plan.md):
//   - lose-momentum: NOT an action — Advantage.loseMomentum always opens DialogV2 (no bypass →
//     socket deadlock, ADR-10.1). Its outcome is reachable via update-advantage clear/reduce. The
//     raw API is dispositioned EXCLUDED_UNSAFE_WITH_REASON in the manifest.
//   - deal-damage: NOT an action — dealDamage() is module-private (not on game.gmtoolkit). The
//     outcome is reachable by composing warhammer-mcp.apply-damage in the skill (manifest
//     GUIDANCE_ONLY).
//   - session-turnover: implemented as a DIALOG-FREE direct-write decompose (XP + fortune reset +
//     optional scene activate) — never the dialog-prone module macro.
//   - add-xp: direct write + read-modify-write of system.details.experience.log (auditable entry).
//   - run-group-test: always passes bypass:true (group-test.mjs:152 → skipDialog).
//   - update-advantage: calls game.gmtoolkit.advantage.update(token, mode, "mcp") — the socket-route
//     player-owned fix; respects the module's !inCombat guard for increase/reduce (Q2).
//
// CCR-4 confirm gates (z.literal(true)) on session-turnover + add-xp. clear-bulk advantage is
// handler-enforced confirm (single-action umbrella; documented).
//
// Source: .agents/research/module_integration/phase11_pre_plan.md + modules-docs/wfrp4e-gm-toolkit/.

import { z } from 'zod';

const StatusField = z.enum(['resolve', 'sin', 'corruption', 'fortune']);
const AdvantageMode = z.enum(['increase', 'reduce', 'clear-single', 'clear-bulk']);

export const ModuleGmtoolkitInput = z.discriminatedUnion('action', [
  // ── Group test (always bypass:true — dialog-free) ──────────────────────────
  z
    .object({
      action: z.literal('run-group-test'),
      testSkill: z.string().min(1, 'testSkill is required (e.g. "Perception", "Cool")'),
      difficulty: z.string().min(1).optional(), // e.g. "challenging" (default from settings)
      testModifier: z.number().int().optional(),
      rollMode: z.enum(['publicroll', 'gmroll', 'blindroll', 'selfroll']).optional(),
      targetGroup: z.array(z.string().min(1)).optional(), // actor UUIDs; default = party
    })
    .strict(),

  // ── Advantage (the player-owned socket-route fix; respects !inCombat for inc/reduce) ────
  z
    .object({
      action: z.literal('update-advantage'),
      mode: AdvantageMode,
      // tokenId required for increase/reduce/clear-single; clear-bulk iterates canvas tokens.
      tokenId: z.string().min(1).optional(),
      // clear-bulk is destructive party-wide → confirm:true enforced in the handler (CCR-4).
      confirm: z.boolean().optional(),
    })
    .strict(),

  // ── Session info (read) ─────────────────────────────────────────────────────
  z.object({ action: z.literal('get-session-info') }).strict(),

  // ── Group resolution (read) ─────────────────────────────────────────────────
  z
    .object({
      action: z.literal('get-group'),
      groupType: z.string().min(1).default('party'), // party | company | pcs | ...
      activeOnly: z.boolean().optional(),
      presentOnly: z.boolean().optional(),
    })
    .strict(),

  // ── Adjust social/condition status ──────────────────────────────────────────
  z
    .object({
      action: z.literal('adjust-status'),
      actorId: z.string().min(1, 'actorId is required'),
      status: StatusField,
      change: z.number().int(), // signed delta
    })
    .strict(),

  // ── Scene vision / light toggle (thin convenience over scene update) ─────────
  z
    .object({
      action: z.literal('toggle-scene-light'),
      sceneId: z.string().min(1).optional(), // default: active scene
      tokenVision: z.boolean().optional(),
      globalLight: z.boolean().optional(),
    })
    .strict(),

  // ── Pull players to a scene (scene.activate) ────────────────────────────────
  z
    .object({
      action: z.literal('pull-to-scene'),
      sceneId: z.string().min(1).optional(), // default: active scene
    })
    .strict(),

  // ── Compendium pack visibility toggle ───────────────────────────────────────
  z
    .object({
      action: z.literal('toggle-compendium-visibility'),
      packId: z.string().min(1, 'packId is required (e.g. "world.my-pack")'),
      private: z.boolean().optional(), // omitted → flip current
    })
    .strict(),

  // ── Quick d100 roll ─────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('roll-d100'),
      flavor: z.string().min(1).optional(),
    })
    .strict(),

  // ── Read an actor's active conditions ───────────────────────────────────────
  z
    .object({
      action: z.literal('check-conditions'),
      actorId: z.string().min(1, 'actorId is required'),
    })
    .strict(),

  // ── Session turnover (DIALOG-FREE direct-write decompose; confirm-gated) ─────
  z
    .object({
      action: z.literal('session-turnover'),
      actorId: z.string().min(1, 'actorId is required (run per character)'),
      xp: z.number().int().nonnegative().optional(), // session XP award (0/omitted = no XP)
      reason: z.string().min(1).optional(), // XP log reason
      resetFortune: z.boolean().default(true), // fortune.value = fate.value
      activateSceneId: z.string().min(1).optional(), // optional holding-scene activate
      confirm: z.literal(true, {
        errorMap: () => ({ message: 'session-turnover requires confirm:true (permanent XP + fortune reset)' }),
      }),
    })
    .strict(),

  // ── Add XP (direct write + experience.log append; confirm-gated) ────────────
  z
    .object({
      action: z.literal('add-xp'),
      actorId: z.string().min(1, 'actorId is required'),
      amount: z.number().int(), // signed (negative = deduction)
      reason: z.string().min(1).default('GM award'),
      confirm: z.literal(true, {
        errorMap: () => ({ message: 'add-xp requires confirm:true (permanent experience write + log entry)' }),
      }),
    })
    .strict(),
]);

export type ModuleGmtoolkitInputType = z.infer<typeof ModuleGmtoolkitInput>;
