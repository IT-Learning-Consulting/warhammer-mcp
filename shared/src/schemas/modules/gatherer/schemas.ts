// DIALOG-PATH: DIALOG_GUARDED — documents the same minigame DialogV2 fire-and-forget contract as gatherer.ts (schema-level annotation only; no runtime code).
// Module Integration v1 Phase 14 — Zod schema (promoted to @foundry-mcp/shared, ADR-020) for module-gatherer (gatherer v4.2.5).
//
// CCR-5: module-specific schemas are promoted to @foundry-mcp/shared (ADR-020, Phase C2). `.strict()` on every variant.
//
// 5 actions over the verified server-reachable surface (dossier thin-session.md §3.6):
//   read:  get-spot-status
//   GM writes: gather, harvest-token, reset-spot, configure-spot
//
// MCP TOOL name is `module-gatherer` (CCR-11 thin primitive); the SKILL is `wfrp-gatherer`
// (CCR-20-EXEMPT — wfrp-* runtime skill).
//
// MINIGAME (§3.4): a gather page with `flags.gatherer.minigame` set opens a DialogV2 slot-machine;
// AWAITING API.gather on it would hang the socket. gather/harvest-token instead FIRE-AND-FORGET — they
// kick off API.gather un-awaited (dialog opens on the GM client) and return minigame:"opened" + a note;
// the GM clicks through and the item lands. `minigame` is NOT a writable param on configure-spot (UI-only).
//
// WFRP4e config (§3.5): the world setting `gatherer.quantityPath` must be "quantity.value" or the
// existing-item stack path silently no-ops. gather warns (does NOT auto-write the live setting).
//
// Source: phase14_pre_plan.md + dossiers/thin-session.md §3.

import { z } from 'zod';

const ModifierEntry = z.object({ modifier: z.string(), DC: z.number() }).strict();

export const ModuleGathererInput = z.discriminatedUnion('action', [
  // ── Read ──────────────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('get-spot-status'),
      pageUuid: z.string().min(1),
    })
    .strict(),

  // ── GM writes ───────────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('gather'),
      pageUuid: z.string().min(1),
      actorUuid: z.string().min(1),
    })
    .strict(),
  z
    .object({
      action: z.literal('harvest-token'),
      actorUuid: z.string().min(1), // the creature/NPC being harvested (carries gatherSheet flag)
      gatheringActorUuid: z.string().min(1), // who receives the items
    })
    .strict(),
  z
    .object({
      action: z.literal('reset-spot'),
      pageUuid: z.string().min(1),
    })
    .strict(),
  z
    .object({
      action: z.literal('configure-spot'),
      pageUuid: z.string().min(1),
      tableUuid: z.string().optional(),
      draws: z.number().int().min(0).optional(),
      quantity: z.string().optional(), // roll expression e.g. "1d4"
      require: z.string().optional(), // CSV of required item names
      time: z.number().int().min(0).optional(), // hours to auto-reset (0 = none)
      expression: z.string().optional(), // macro name or inline JS
      modifierList: z.array(ModifierEntry).optional(), // tiered DC→quantity modifiers
    })
    .strict(),

  // ── Phase 14 full-functionality expansion ───────────────────────────────────
  z
    .object({
      // Create a NEW gather-source JournalEntryPage (type gatherer.gatherer) inside a journal.
      action: z.literal('create-spot'),
      journalUuid: z.string().min(1),
      name: z.string().min(1),
      tableUuid: z.string().min(1),
      draws: z.number().int().min(0).optional(),
      quantity: z.string().optional(),
      time: z.number().int().min(0).optional(),
      require: z.string().optional(),
      expression: z.string().optional(),
      modifierList: z.array(ModifierEntry).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('list-spots'),
      journalUuid: z.string().optional(),
      exhaustedOnly: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      // Link a creature/NPC to a gather page so harvest-token works on it.
      action: z.literal('set-harvest-source'),
      actorUuid: z.string().min(1),
      gatherSheetUuid: z.string().min(1),
      draws: z.number().int().min(0).optional(), // actor-specific harvest counter (0/omit = unlimited)
    })
    .strict(),
  z
    .object({
      // Write WFRP4e-relevant world settings (quantityPath="quantity.value" etc).
      action: z.literal('configure-settings'),
      quantityPath: z.string().optional(),
      resourcePath: z.string().optional(),
      resourceValue: z.string().optional(),
      enableHarvesting: z.boolean().optional(),
    })
    .strict(),
]);

export type ModuleGathererInputType = z.infer<typeof ModuleGathererInput>;
