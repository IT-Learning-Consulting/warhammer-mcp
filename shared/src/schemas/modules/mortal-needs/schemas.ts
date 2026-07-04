// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v2 Phase 8 — Zod schema (promoted to @foundry-mcp/shared, ADR-020) for module-mortal-needs
// (Mortal Needs, Wand & Widgets v2.3.2).
//
// CCR-5: module-specific schemas are promoted to @foundry-mcp/shared (ADR-020, Phase C2). `.strict()` on
// every top-level action variant rejects unknown keys. Per carry-forward convention every variant is a
// plain `.strict()` ZodObject (NO `.refine`/`.transform` — a ZodEffects breaks the discriminatedUnion);
// cross-field rules (confirm-gate, consequenceType-dependent field requirements, target resolution)
// live in the handler.
//
// 26 actions across 9 idioms (capability_audit/mortal-needs.md + phase8_pre_plan.md §Action surface):
//   reads (7): get-needs / get-need / list-tracked / get-need-config / query-critical /
//     query-above-threshold / get-need-history
//   single writes (5): stress-need / relieve-need / set-need / reset-need / track-actor
//   batch writes (2): batch-stress / batch-relieve
//   rest (2): short-rest / long-rest
//   config — importConfig-persist (3): configure-need / enable-need / disable-need
//   consequence — dialog-free (2): apply-consequence / remove-consequence
//   scene (1): set-scene-modifier
//   custom needs (2): register-custom-need / unregister-custom-need
//   destructive (2): reset-all / untrack-actor
//
// Confirm-gated (CCR-4): reset-all, untrack-actor, long-rest (party-wide — entityId omitted),
// unregister-custom-need. batch-stress/batch-relieve and every single-actor write stay UNGATED.
//
// Source of truth: .agents/research/module_integration/phase8_pre_plan.md +
// capability_audit/mortal-needs.md.

import { z } from 'zod';

const entityId = z.string().min(1); // BRANDED-ID-EXEMPT:entityId — deliberately polymorphic (actor OR token id; branded-ids.ts POLYMORPHIC note)
const needId = z.string().min(1); // BRANDED-ID-EXEMPT:needId — module-internal need id (mortal-needs registry key), not a Foundry document id
const amount = z.number().nonnegative().optional(); // omitted → engine resolves config.stressAmount / world default

export const MortalNeedsInput = z.discriminatedUnion('action', [
  // ── reads ────────────────────────────────────────────────────────────────────
  z.object({ action: z.literal('get-needs'), entityId }).strict(),
  z.object({ action: z.literal('get-need'), entityId, needId }).strict(),
  z.object({ action: z.literal('list-tracked') }).strict(),
  z.object({ action: z.literal('get-need-config'), needId: needId.optional() }).strict(),
  z.object({ action: z.literal('query-critical') }).strict(),
  z
    .object({ action: z.literal('query-above-threshold'), needId, threshold: z.number().min(0).max(100).optional() })
    .strict(),
  z
    .object({
      action: z.literal('get-need-history'),
      entityId,
      needId: needId.optional(),
      limit: z.number().int().positive().optional(),
    })
    .strict(),

  // ── single writes (ungated) ─────────────────────────────────────────────────
  z.object({ action: z.literal('stress-need'), entityId, needId, amount }).strict(),
  z.object({ action: z.literal('relieve-need'), entityId, needId, amount }).strict(),
  z.object({ action: z.literal('set-need'), entityId, needId, value: z.number() }).strict(),
  z.object({ action: z.literal('reset-need'), entityId, needId }).strict(),
  z.object({ action: z.literal('track-actor'), entityId }).strict(),

  // ── batch writes (ungated — additive/reversible) ────────────────────────────
  z
    .object({ action: z.literal('batch-stress'), needId, amount, entityIds: z.array(entityId).min(1).optional() })
    .strict(),
  z
    .object({ action: z.literal('batch-relieve'), needId, amount, entityIds: z.array(entityId).min(1).optional() })
    .strict(),

  // ── rest ─────────────────────────────────────────────────────────────────────
  z.object({ action: z.literal('short-rest'), reliefPercentage: z.number().min(1).max(100).optional() }).strict(),
  z
    .object({
      action: z.literal('long-rest'),
      entityId: entityId.optional(), // omitted = party-wide, confirm-gated
      confirm: z.boolean().optional(),
    })
    .strict(),

  // ── config — importConfig-persist (the only path that survives a reload) ────
  z.object({ action: z.literal('configure-need'), needId, changes: z.record(z.unknown()) }).strict(),
  z.object({ action: z.literal('enable-need'), needId }).strict(),
  z.object({ action: z.literal('disable-need'), needId }).strict(),

  // ── consequence — dialog-free (consequences.apply/remove, NOT the auto-tick removal-dialog path) ──
  z
    .object({
      action: z.literal('apply-consequence'),
      entityId,
      needId,
      consequenceType: z.enum(['condition-apply', 'attribute-modify']),
      statusId: z.string().min(1).optional(), // BRANDED-ID-EXEMPT:statusId — CONFIG.statusEffects key, not a Foundry document id // required when consequenceType === 'condition-apply'
      path: z.string().min(1).optional(), // required when consequenceType === 'attribute-modify'
      operation: z.enum(['add', 'subtract', 'set', 'multiply']).optional(),
      amount: z.number().optional(),
      threshold: z.number().min(0).max(100).optional(),
      ticks: z.number().int().positive().optional(),
      reversible: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('remove-consequence'),
      entityId,
      needId,
      consequenceType: z.enum(['condition-apply', 'attribute-modify']),
      statusId: z.string().min(1).optional(), // BRANDED-ID-EXEMPT:statusId — CONFIG.statusEffects key, not a Foundry document id
      path: z.string().min(1).optional(),
      operation: z.enum(['add', 'subtract', 'set', 'multiply']).optional(),
      amount: z.number().optional(),
      threshold: z.number().min(0).max(100).optional(),
      ticks: z.number().int().positive().optional(),
      reversible: z.boolean().optional(),
    })
    .strict(),

  // ── scene ──────────────────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('set-scene-modifier'),
      needId,
      stressMultiplier: z.number().positive().optional(),
      decayMultiplier: z.number().positive().optional(),
    })
    .strict(),

  // ── custom needs ───────────────────────────────────────────────────────────────
  z.object({ action: z.literal('register-custom-need'), needConfig: z.record(z.unknown()) }).strict(),
  z.object({ action: z.literal('unregister-custom-need'), needId, confirm: z.boolean().optional() }).strict(),

  // ── destructive (confirm-gated) ─────────────────────────────────────────────────
  z.object({ action: z.literal('reset-all'), entityId, confirm: z.boolean().optional() }).strict(),
  z.object({ action: z.literal('untrack-actor'), entityId, confirm: z.boolean().optional() }).strict(),
]);

export type MortalNeedsInputType = z.infer<typeof MortalNeedsInput>;
