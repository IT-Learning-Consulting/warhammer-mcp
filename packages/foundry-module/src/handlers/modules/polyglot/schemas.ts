// Module Integration v2 Phase 9 — package-local Zod schema for module-polyglot (Polyglot v2.8.2).
//
// CCR-5: module-specific schemas stay package-local (not in @foundry-mcp/shared). `.strict()` on every
// top-level action variant rejects unknown keys. Per carry-forward convention every variant is a plain
// `.strict()` ZodObject (NO `.refine`/`.transform` — a ZodEffects breaks the discriminatedUnion); cross-field
// rules (confirm-gate, accent-insensitive resolution, idempotency) live in the handler.
//
// 9 actions (capability_audit/polyglot.md + phase9_pre_plan.md §Action-set):
//   reads (3): list-world-languages / check-knows-language / check-literacy
//   writes — ungated (4): send-in-language / grant-language / grant-literacy / tag-journal-page
//   writes — confirm-gated (2): revoke-language / revoke-literacy
//
// Source of truth: .agents/research/module_integration/phase9_pre_plan.md +
// capability_audit/polyglot.md.

import { z } from 'zod';

const entityId = z.string().min(1);
const language = z.string().min(1);

export const PolyglotInput = z.discriminatedUnion('action', [
  // ── reads ────────────────────────────────────────────────────────────────────
  z.object({ action: z.literal('list-world-languages') }).strict(),
  z.object({ action: z.literal('check-knows-language'), entityId, language }).strict(),
  z.object({ action: z.literal('check-literacy'), entityId }).strict(),

  // ── writes (ungated) ─────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('send-in-language'),
      content: z.string().min(1),
      language,
      speaker: z.string().min(1).optional(), // actorId → ChatMessage.getSpeaker({actor})
      whisper: z.array(z.string().min(1)).optional(), // recipient user ids
      rollMode: z.enum(['publicroll', 'gmroll', 'blindroll', 'selfroll']).optional(),
      style: z.enum(['OTHER', 'IC', 'OOC', 'EMOTE']).optional(), // default OTHER (bypasses TomSelect overwrite)
    })
    .strict(),
  z.object({ action: z.literal('grant-language'), entityId, language }).strict(),
  z.object({ action: z.literal('grant-literacy'), entityId }).strict(),
  z
    .object({
      action: z.literal('tag-journal-page'),
      pageUuid: z.string().min(1),
      language,
      text: z.string().min(1).optional(), // substring to wrap; omitted = wrap the whole page content
    })
    .strict(),

  // ── writes (confirm-gated — destructive item-delete) ──────────────────────────
  z.object({ action: z.literal('revoke-language'), entityId, language, confirm: z.boolean().optional() }).strict(),
  z.object({ action: z.literal('revoke-literacy'), entityId, confirm: z.boolean().optional() }).strict(),
]);

export type PolyglotInputType = z.infer<typeof PolyglotInput>;
