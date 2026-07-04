// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v2 Phase 10 — Zod schema (promoted to @foundry-mcp/shared, ADR-020) for module-narrator (Narrator Tools v1.0.1).
//
// CCR-5: module-specific schemas are promoted to @foundry-mcp/shared (ADR-020, Phase C2). `.strict()` on every
// top-level action variant rejects unknown keys. Per carry-forward convention every variant is a plain
// `.strict()` ZodObject (NO `.refine`/`.transform` — a ZodEffects breaks the discriminatedUnion); cross-field
// rules (GM/SETTINGS_MODIFY gates, startPaused resolution, settle-poll verify) live in the handler.
//
// 6 actions (phase10_pre_plan.md §Solution-space, PRD §10 R10.1/R10.2):
//   read (1, ungated): get-state
//   writes — GM-only (5): narrate / describe / notify / scenery / configure
//     (scenery + configure additionally require SETTINGS_MODIFY — handler-side, not schema-side)
//   D5 — no CCR-4-style destructive-op gate field on any variant: narrator has zero destructive/removal
//   ops; this intentionally breaks the phase 1-9 "at least one gated pair" streak.
//
// Source of truth: .agents/research/module_integration/phase10_pre_plan.md.

import { z } from 'zod';

// The 16 typed appearance/permission settings `configure` may write (narrator.js:435-549
// _registerGameSettings, minus the world-persisted `sharedState` which is narrate/describe/notify/
// scenery/get-state's own domain — NOT configurable via this action).
export const NARRATOR_CONFIGURE_KEYS = [
  'FontSize',
  'WebFont',
  'TextColor',
  'TextShadow',
  'TextCSS',
  'Copy',
  'Pause',
  'DurationMultiplier',
  'BGColor',
  'BGImage',
  'NarrationStartPaused',
  'MessageType',
  'PERMScenery',
  'PERMDescribe',
  'PERMNarrate',
  'PERMAs',
] as const;

export const NarratorInput = z.discriminatedUnion('action', [
  // ── read (ungated) ───────────────────────────────────────────────────────────
  z.object({ action: z.literal('get-state') }).strict(),

  // ── writes (GM-only) ─────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('narrate'),
      // D4: string | string[] — array form queues a multi-part cutscene (narrator.js:685-693 auto-
      // queues; OVERWRITES messagesQueue on repeat, does not append — see safety-and-traps).
      message: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
      // D3: default false — guarantees auto-play regardless of the world NarrationStartPaused setting
      // (narrator.js:761 hang-forever trap when true and no live GM tab clicks Play).
      startPaused: z.boolean().optional(),
      speaker: z.string().min(1).optional(), // overrides the default {alias:'Narrator'} ChatMessage speaker
    })
    .strict(),
  z
    .object({
      action: z.literal('describe'),
      message: z.string().min(1),
      speaker: z.string().min(1).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('notify'),
      message: z.string().min(1),
      speaker: z.string().min(1).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('scenery'),
      state: z.boolean().optional(), // omitted = toggle (matches NarratorTools.scenery(state?) semantics)
    })
    .strict(),
  z
    .object({
      action: z.literal('configure'),
      key: z.enum(NARRATOR_CONFIGURE_KEYS),
      value: z.union([z.string(), z.number(), z.boolean()]),
    })
    .strict(),
]);

export type NarratorInputType = z.infer<typeof NarratorInput>;
