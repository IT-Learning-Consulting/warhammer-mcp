// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v2 Phase 1 — Zod schema (promoted to @foundry-mcp/shared, ADR-020) for module-conversation-hud
// (ConversationHUD v6.0.0).
//
// CCR-5: module-specific schemas are promoted to @foundry-mcp/shared (ADR-020, Phase C2). `.strict()` on
// every top-level action variant rejects unknown keys. Participant / faction content blobs use
// `.passthrough()` (the module owns many optional rendering fields filled by processParticipantData).
//
// HC-v2-6 (dialog-deadlock): this schema exposes ONLY the dialog-free executeFunction sub-commands.
// The deadlocking types (add-participant / edit-participant / remove-participant / change-background /
// pull-participants-from-scene) are NEVER accepted — the server-safe replacements are add-participants
// (batch), update-active-conversation (full swap), and update-background (direct path).
//
// CCR-v2-A: collective mode is upstream-WIP and banned for v2. create-conversation accepts an optional
// conversationType enum that includes 'collective' so the rejection is explicit + testable; the handler
// returns CONVERSATION_HUD_COLLECTIVE_REJECTED rather than silently building a gm-controlled blob.
//
// Source of truth: .agents/research/module_integration/phase1_pre_plan.md +
// capability_audit/conversation-hud.md + live source read of conversation.js / GmControlledConversation.mjs.

import { z } from 'zod';

// ── Shared content sub-schemas (lenient — the module fills defaults) ───────────────

const PortraitAnchor = z
  .object({
    vertical: z.enum(['top', 'centerVertical', 'bottom']).optional(),
    horizontal: z.enum(['left', 'centerHorizontal', 'right']).optional(),
  })
  .passthrough();

const ParticipantFaction = z
  .object({
    displayFaction: z.boolean().optional(),
    factionName: z.string().optional(),
    factionLogo: z.string().optional(),
    factionBannerEnabled: z.boolean().optional(),
    factionBannerShape: z.string().optional(),
    factionBannerTint: z.string().optional(),
  })
  .passthrough();

const Participant = z
  .object({
    name: z.string().min(1, 'participant name is required'),
    displayName: z.boolean().optional(),
    img: z.string().optional(),
    imgScale: z.number().optional(),
    portraitAnchor: PortraitAnchor.optional(),
    faction: ParticipantFaction.optional(),
    linkedActor: z.string().optional(),
    linkedJournal: z.string().optional(),
  })
  .passthrough();

// Faction document content (faction-sheet-data page). Mirrors EMPTY_FACTION.
const FactionData = z
  .object({
    displayFaction: z.boolean().optional(),
    factionName: z.string().optional(),
    factionLogo: z.string().optional(),
    factionBannerEnabled: z.boolean().optional(),
    factionBannerShape: z.string().optional(),
    factionBannerTint: z.string().optional(),
  })
  .passthrough();

export const ConversationHudInput = z.discriminatedUnion('action', [
  // ── Conversation document CRUD (persisted JournalEntry) ─────────────────────
  z
    .object({
      action: z.literal('create-conversation'),
      name: z.string().min(1).optional(), // default "New Conversation"
      background: z.string().optional(), // image path; default ""
      participants: z.array(Participant).default([]),
      defaultActiveParticipant: z.number().int().nonnegative().optional(),
      folderId: z.string().min(1).optional(),
      // CCR-v2-A: 'collective' is rejected in the handler (upstream-WIP; banned for v2).
      conversationType: z.enum(['gm-controlled', 'collective']).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('get-conversation'),
      journalId: z.string().min(1, 'journalId is required'),
    })
    .strict(),
  z
    .object({
      action: z.literal('list-conversations'),
    })
    .strict(),
  z
    .object({
      action: z.literal('update-conversation'),
      journalId: z.string().min(1, 'journalId is required'),
      name: z.string().min(1).optional(),
      background: z.string().optional(),
      participants: z.array(Participant).optional(),
      defaultActiveParticipant: z.number().int().nonnegative().optional(),
    })
    .strict(),
  z
    .object({
      // CCR-4 — destructive; confirm gate enforced in the handler (item-piles pattern) so an
      // omitted confirm returns the actionable CONVERSATION_HUD_CONFIRM_REQUIRED token rather than
      // a generic INVALID_INPUT (z.literal(true) would surface the latter).
      action: z.literal('delete-conversation'),
      journalId: z.string().min(1, 'journalId is required'),
      confirm: z.boolean().optional(),
    })
    .strict(),

  // ── Runtime control (TRANSIENT — direct game.ConversationHud.*; HC-v2-6 dialog-free only) ──
  z
    .object({
      // journalId-only (Q&A 2026-06-23): promotes verifiable save-then-activate. Response carries transient:true.
      action: z.literal('activate-conversation'),
      journalId: z.string().min(1, 'journalId is required (activate from a saved conversation)'),
      visibilityOff: z.boolean().optional(), // start with the HUD hidden
    })
    .strict(),
  z
    .object({
      action: z.literal('deactivate-conversation'),
    })
    .strict(),
  z
    .object({
      action: z.literal('get-active-state'),
    })
    .strict(),
  z
    .object({
      action: z.literal('set-active-participant'),
      index: z.number().int(), // -1 clears the active participant
    })
    .strict(),
  z
    .object({
      action: z.literal('add-participants'),
      participants: z.array(Participant).min(1, 'at least one participant is required'),
    })
    .strict(),
  z
    .object({
      // Full-data swap — the server-safe replacement for the dialog-bound edit/remove-participant ops.
      action: z.literal('update-active-conversation'),
      participants: z.array(Participant).optional(),
      background: z.string().optional(),
      defaultActiveParticipant: z.number().int().nonnegative().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('reorder-participants'),
      oldIndex: z.number().int().nonnegative(),
      newIndex: z.number().int().nonnegative(),
    })
    .strict(),
  z
    .object({
      action: z.literal('set-visibility'),
      visible: z.boolean(),
    })
    .strict(),
  z
    .object({
      // NOTE: a discriminatedUnion variant must be a plain ZodObject (no .refine — that yields
      // ZodEffects which the union rejects). The "at least one of background/visible" rule is
      // enforced in the handler.
      action: z.literal('set-background'),
      background: z.string().optional(), // image path (update-background)
      visible: z.boolean().optional(), // show/hide the background (set-background-visibility)
    })
    .strict(),
  z
    .object({
      action: z.literal('toggle-speaking-as'),
    })
    .strict(),
  z
    .object({
      // "at least one of minimized/locked" enforced in the handler (see set-background note).
      action: z.literal('set-minimize'),
      minimized: z.boolean().optional(),
      locked: z.boolean().optional(),
    })
    .strict(),

  // ── Scene / token link flags (persisted) ────────────────────────────────────
  z
    .object({
      action: z.literal('set-scene-conversation'),
      sceneId: z.string().min(1, 'sceneId is required'),
      journalId: z.string().min(1).nullable().optional(), // null clears the link
      visibilityOff: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('set-token-conversation'),
      tokenId: z.string().min(1, 'tokenId is required (token id or UUID)'),
      journalId: z.string().min(1).nullable().optional(), // null clears the link
      excludeFromPull: z.boolean().optional(),
    })
    .strict(),

  // ── Faction documents (thin; persisted faction-sheet JournalEntry) ───────────
  z
    .object({
      action: z.literal('create-faction'),
      name: z.string().min(1).optional(),
      faction: FactionData.default({}),
      folderId: z.string().min(1).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('update-faction'),
      journalId: z.string().min(1, 'journalId is required'),
      faction: FactionData,
    })
    .strict(),
  z
    .object({
      action: z.literal('get-faction'),
      journalId: z.string().min(1, 'journalId is required'),
    })
    .strict(),
  z
    .object({
      action: z.literal('list-factions'),
    })
    .strict(),
]);

export type ConversationHudInputType = z.infer<typeof ConversationHudInput>;
