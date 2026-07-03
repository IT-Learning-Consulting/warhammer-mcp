// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 11 — package-local Zod schema for module-party-resources
// (Party Resources / fvtt-party-resources v1.9.0a).
//
// CCR-5: module-specific schemas stay package-local (not in @foundry-mcp/shared). `.strict()` on
// every variant rejects unknown top-level keys.
//
// 8 actions over the verified server-reachable surface (capability-manifest.json: 18 SUPPORTED +
// 3 SUPPORTED_WITH_CONFIRMATION → 8 distinct MCP actions). The module stores every resource in
// world `game.settings` namespace "fvtt-party-resources": a `resource_list` array + 14 keys per
// resource id. CCR-4 confirm gates (z.literal(true)) on the two registry-mutating writes:
// create (registers 14 settings + appends to resource_list) + delete (splices resource_list).
//
// ADR-10.1 (dialog deadlock): party-resources has ZERO dialog paths — the ResourceForm dialog is
// dashboard-UI-click-only; no API/settings write opens a dialog. No dialog-avoidance needed.
//
// Source: .agents/research/module_integration/phase11_pre_plan.md + modules-docs/fvtt-party-resources/.

import { z } from 'zod';

// Resource id sanitization contract (resource_form.mjs:138-143 lowercases + strips). We constrain
// callers to the already-safe character class so the id round-trips through the module unchanged.
const ResourceId = z
  .string()
  .min(1, 'resourceId is required')
  .regex(/^[a-z0-9_-]+$/, 'resourceId must be lowercase letters, digits, underscore or hyphen');

export const ModulePartyResourcesInput = z.discriminatedUnion('action', [
  // ── Reads ─────────────────────────────────────────────────────────────────
  z
    .object({
      // Lists every registered resource with full metadata (covers list-resources,
      // resource-list-read, check-module-active manifest rows).
      action: z.literal('list'),
    })
    .strict(),
  z
    .object({
      // Single resource value + metadata (covers get-resource-value, get-resource-metadata).
      action: z.literal('get'),
      resourceId: ResourceId,
    })
    .strict(),

  // ── Value mutations (route through window.pr.api to preserve notify-chat + clamping) ─────
  z
    .object({
      // set-resource-value + reset-value. Value write is reversible → no confirm (consistent with
      // increment/decrement; mirrors armoury repair-item). notifyChat:true routes the module's
      // chat broadcast (otherwise a direct settings write would suppress it — manifest
      // excluded:notify-chat-autofire).
      action: z.literal('set-value'),
      resourceId: ResourceId,
      value: z.number(),
      notifyChat: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      // api.increment clamps to {id}_max; its internal set() does NOT route chat, so no notifyChat
      // field here (would be a dead input — Phase-6 inputSchema↔handler drift lesson).
      action: z.literal('increment'),
      resourceId: ResourceId,
      jump: z.number().int().positive().default(1),
    })
    .strict(),
  z
    .object({
      // api.decrement clamps to {id}_min.
      action: z.literal('decrement'),
      resourceId: ResourceId,
      jump: z.number().int().positive().default(1),
    })
    .strict(),

  // ── Metadata configuration (per-field settings writes) ──────────────────────
  z
    .object({
      // Covers resource-name/max/min/player-managed/visible-flag/toggle-visible/notify-chat-flag/
      // notify-chat-messages/icon-path/use-icon-flag. Every field optional; only provided fields
      // are written.
      action: z.literal('update-meta'),
      resourceId: ResourceId,
      name: z.string().min(1).optional(),
      max: z.number().optional(),
      min: z.number().optional(),
      visible: z.boolean().optional(),
      playerManaged: z.boolean().optional(),
      icon: z.string().min(1).optional(),
      useIcon: z.boolean().optional(),
      notifyChat: z.boolean().optional(),
      incMessage: z.string().min(1).optional(),
      decMessage: z.string().min(1).optional(),
    })
    .strict(),

  // ── Registry mutations (confirm-gated — CCR-4) ──────────────────────────────
  z
    .object({
      // SUPPORTED_WITH_CONFIRMATION — registers 14 settings keys + appends to resource_list.
      action: z.literal('create'),
      resourceId: ResourceId,
      name: z.string().min(1).optional(),
      value: z.number().default(0),
      max: z.number().default(100),
      min: z.number().default(-100),
      visible: z.boolean().optional(),
      playerManaged: z.boolean().optional(),
      icon: z.string().min(1).optional(),
      notifyChat: z.boolean().optional(),
      confirm: z.literal(true, {
        errorMap: () => ({ message: 'create requires confirm:true (registers a new shared resource track)' }),
      }),
    })
    .strict(),
  z
    .object({
      // SUPPORTED_WITH_CONFIRMATION — removes the id from resource_list (orphans its settings keys).
      action: z.literal('delete'),
      resourceId: ResourceId,
      confirm: z.literal(true, {
        errorMap: () => ({ message: 'delete requires confirm:true (removes the resource from the party tracker)' }),
      }),
    })
    .strict(),
]);

export type ModulePartyResourcesInputType = z.infer<typeof ModulePartyResourcesInput>;
