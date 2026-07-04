// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v2 Phase 11 — Zod schema (promoted to @foundry-mcp/shared, ADR-020) for module-macro-trigger (Macro Trigger v1.0.1).
//
// CCR-5: module-specific schemas are promoted to @foundry-mcp/shared (ADR-020, Phase C2). `.strict()` on every
// top-level action variant rejects unknown keys. Per carry-forward convention every variant is a plain
// `.strict()` ZodObject (NO `.refine`/`.transform` — a ZodEffects breaks the discriminatedUnion); cross-field
// rules (GM gate, soft-warn macroId resolution, confirm-gate) live in the handler.
//
// 5 actions (phase11_pre_plan.md §Solution-space, PRD §Phase 11):
//   read (1, ungated): list (optional `event` filter)
//   writes — GM-only (4): create / update / delete (confirm-gated) / clear (confirm-gated)
//
// MACRO_TRIGGER_EVENTS: the exact 38 Foundry hooks the macro-trigger module registers (corrected from the
// capability audit's 37 — phase11_pre_plan.md §Confirmed facts 3, both languages/en.json and the module's
// L() dropdown array agree). Includes the v13-dead `renderJournalSheet` (v13 renamed the hook to
// `renderJournalEntrySheet`, which the module never registers) — exposed AS-REGISTERED per D2 (the tool
// contract is "write what the module reads"; skill-doc's the dead hook rather than silently dropping it).
//
// Source of truth: .agents/research/module_integration/phase11_pre_plan.md +
// capability_audit/macro-trigger.md.

import { z } from 'zod';

export const MACRO_TRIGGER_EVENTS = [
  // ── Lifecycle ──
  'setup',
  'ready',
  'canvasReady',
  // ── Actor CRUD ──
  'preCreateActor',
  'createActor',
  'updateActor',
  'deleteActor',
  // ── Item CRUD ──
  'preCreateItem',
  'createItem',
  'updateItem',
  'deleteItem',
  // ── Token ──
  'preCreateToken',
  'createToken',
  'updateToken',
  'preUpdateToken',
  'deleteToken',
  'controlToken',
  'hoverToken',
  'targetToken',
  // ── Scene CRUD ──
  'preCreateScene',
  'createScene',
  'updateScene',
  'deleteScene',
  // ── Combat ──
  'preCreateCombat',
  'createCombat',
  'updateCombat',
  'deleteCombat',
  'combatStart',
  'combatRound',
  'combatTurn',
  // ── Chat ──
  'preCreateChatMessage',
  'createChatMessage',
  'renderChatMessage',
  'chatMessage',
  // ── Render (UI) ──
  'renderActorSheet',
  'renderItemSheet',
  'renderSceneControls',
  'renderJournalSheet', // v13-dead hook (v13 uses renderJournalEntrySheet) — exposed as-registered, D2.
] as const;

export type MacroTriggerEvent = (typeof MACRO_TRIGGER_EVENTS)[number];

const event = z.enum(MACRO_TRIGGER_EVENTS);
const bindingId = z.string().min(1);

export const MacroTriggerInput = z.discriminatedUnion('action', [
  // ── read (ungated) ───────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('list'),
      event: event.optional(), // filter to bindings on this hook only
    })
    .strict(),

  // ── writes (GM-only) ─────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('create'),
      name: z.string().min(1),
      event,
      macroId: z.string().min(1), // world-macro id OR a UUID (incl. compendium) — soft-warn if unresolvable
    })
    .strict(),
  z
    .object({
      action: z.literal('update'),
      bindingId,
      name: z.string().min(1).optional(),
      event: event.optional(),
      macroId: z.string().min(1).optional(),
    })
    .strict(),

  // ── writes (confirm-gated — destructive) ────────────────────────────────────
  z
    .object({
      action: z.literal('delete'),
      bindingId,
      confirm: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('clear'),
      confirm: z.boolean().optional(),
    })
    .strict(),
]);

export type MacroTriggerInputType = z.infer<typeof MacroTriggerInput>;
