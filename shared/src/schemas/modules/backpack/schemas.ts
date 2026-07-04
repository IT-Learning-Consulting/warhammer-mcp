// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v2 Phase 12 — Zod schema (promoted to @foundry-mcp/shared, ADR-020) for module-backpack (Backpack v1.2.5, lobowarewolf).
//
// CCR-5: module-specific schemas are promoted to @foundry-mcp/shared (ADR-020, Phase C2). `.strict()` on every
// top-level action variant rejects unknown keys. Per carry-forward convention every variant is a plain
// `.strict()` ZodObject (NO `.refine`/`.transform` — a ZodEffects breaks the discriminatedUnion); cross-field
// rules (GM gate, occupied-slot guard, XOR field checks, min/max clamp, confirm-gate) live in the handler.
//
// 10 actions (phase12_pre_plan.md §Q&A decisions — EXPANDED A2 set):
//   read (1, ungated): read { actorId? } — actorId present: per-actor view; absent: global/players view.
//   writes — GM-only (8): add-item / remove-item / move-item / set-limit / set-user-limit / remove-user /
//            lock-slots / clear-locks.
//   writes — GM-only, CONFIRM-GATED (1): reset (wipes ONLY `backpacks` + resets `backpackLimit`, per
//            memo §Confirmed-facts 6 — NOT items/actor-limits/locks; the handler's confirm message says so).
//
// Source of truth: .agents/research/module_integration/phase12_pre_plan.md +
// capability_audit/backpack.md.

import { z } from 'zod';

export const BACKPACK_ACTIONS = [
  'read',
  'add-item',
  'remove-item',
  'move-item',
  'set-limit',
  'set-user-limit',
  'remove-user',
  'lock-slots',
  'clear-locks',
  'reset',
] as const;

export type BackpackAction = (typeof BACKPACK_ACTIONS)[number];

export const BackpackInput = z.discriminatedUnion('action', [
  // ── read (ungated) ───────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('read'),
      actorId: z.string().min(1).optional(), // present: per-actor items/limit/locks; absent: global/players view
    })
    .strict(),

  // ── writes (GM-only) — atomic round-trip ────────────────────────────────────
  z
    .object({
      action: z.literal('add-item'),
      actorId: z.string().min(1),
      itemId: z.string().min(1), // must exist on actor.items
      slotIndex: z.number().int().nonnegative().optional(), // omitted: first-free/append
      overwrite: z.boolean().optional(), // required true to clobber an occupied slotIndex
    })
    .strict(),
  z
    .object({
      action: z.literal('remove-item'),
      actorId: z.string().min(1),
      slotIndex: z.number().int().nonnegative(),
    })
    .strict(),

  // ── writes (GM-only) — storage-only ──────────────────────────────────────────
  z
    .object({
      action: z.literal('move-item'),
      actorId: z.string().min(1),
      fromSlot: z.number().int().nonnegative(),
      toSlot: z.number().int().nonnegative(),
      overwrite: z.boolean().optional(), // required true to clobber an occupied toSlot
    })
    .strict(),
  z
    .object({
      action: z.literal('set-limit'),
      target: z.enum(['actor', 'default']),
      actorId: z.string().min(1).optional(), // required when target==='actor'
      limit: z.number().int(), // range-validated (5..100) in the handler
    })
    .strict(),
  z
    .object({
      action: z.literal('set-user-limit'),
      userId: z.string().min(1),
      limit: z.number().int(), // range-validated (5..100) in the handler
    })
    .strict(),
  z
    .object({
      action: z.literal('remove-user'),
      userId: z.string().min(1),
    })
    .strict(),
  z
    .object({
      action: z.literal('lock-slots'),
      actorId: z.string().min(1),
      leaderSlot: z.number().int().nonnegative(),
      itemId: z.string().min(1),
      length: z.number().int().positive().optional(), // exactly one of length/indices (handler XOR check)
      indices: z.array(z.number().int().nonnegative()).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('clear-locks'),
      actorId: z.string().min(1),
      itemId: z.string().min(1).optional(), // exactly one of itemId/leaderSlot (handler XOR check)
      leaderSlot: z.number().int().nonnegative().optional(),
    })
    .strict(),

  // ── writes (GM-only, CONFIRM-GATED — destructive) ────────────────────────────
  z
    .object({
      action: z.literal('reset'),
      confirm: z.boolean().optional(),
    })
    .strict(),
]);

export type BackpackInputType = z.infer<typeof BackpackInput>;
