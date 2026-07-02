// Module Integration v2 Phase 2 — package-local Zod schema for module-simple-quest
// (Simple Quest v3.0.19, theripper93).
//
// CCR-5: module-specific schemas stay package-local (not in @foundry-mcp/shared). `.strict()` on
// every top-level action variant rejects unknown keys.
//
// All quest/map/lore/achievement state lives in `flags.simple-quest.*` on JournalEntryPage docs —
// pure document writes (the best write-verifiability posture in v2). 24 actions grouped by tab:
//   Quest (15): list-quests, get-quest, create-quest, set-quest-state, set-objective-state,
//     set-objective-visibility, set-quest-visibility, set-subquest-state, move-quest,
//     mark-quest-updated, share-quest, show-quest-to-players, set-counter, duplicate-quest,
//     delete-quest.
//   Map (4):   create-map-marker, update-map-marker, remove-map-marker, set-map-config.
//   Lore (2):  list-lore, create-lore.
//   Achievements (3): list-achievements, create-achievement, set-achievement.
//
// HC-v2-5 (objective rename → orphaned state): objective-key writes derive the key from the
// objective text by tag-strip + HTML-entity-decode + replace(/\s/g,"").replace(/\./g,"").substring(0,50)
// (the server-side reproduction of SimpleQuest.getKeyFromLi — app.js:1626-1627). When the derived key
// matches none of the page's actual <li> objectives, the handler returns SIMPLE_QUEST_RENAME_WARNING
// unless `acknowledgeRename: true` is set. A valid never-ticked objective matches an <li> → no warning.
//
// CCR-4 (destructive): delete-quest is confirm-gated in the handler (item-piles pattern) so an omitted
// confirm returns the actionable SIMPLE_QUEST_CONFIRM_REQUIRED token rather than a generic INVALID_INPUT.
//
// discriminatedUnion variants MUST be plain ZodObjects — a `.refine()` yields ZodEffects which the union
// rejects (carry-forward §4). Cross-field rules ("at least one of …") live in the handler body.
//
// Source of truth: .agents/research/module_integration/phase2_pre_plan.md +
// capability_audit/simple-quest.md (§4 flag model, §12 concrete impls) + live source read of
// modules/simple-quest/scripts/{app/app.js, lib/socket.js, mapImage.js, main.js}.

import { z } from 'zod';

// ── Shared sub-schemas ──────────────────────────────────────────────────────────

// Map marker shape (flags.simple-quest.markers.<randomId>). Lenient on optional rendering fields.
const MarkerData = z
  .object({
    title: z.string().optional(),
    icon: z.string().optional(), // image path
    x: z.number(), // relative 0-1 position on the image
    y: z.number(), // relative 0-1 position on the image
    journal: z.string().nullable().optional(), // linked journal/page UUID
    hidden: z.boolean().optional(),
    color: z.string().optional(), // hex; default "#ff0000"
  })
  .strict();

const MarkerPatch = z
  .object({
    title: z.string().optional(),
    icon: z.string().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    journal: z.string().nullable().optional(),
    hidden: z.boolean().optional(),
    color: z.string().optional(),
  })
  .strict();

export const SimpleQuestInput = z.discriminatedUnion('action', [
  // ── Quest tab (15) ─────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('list-quests'),
    })
    .strict(),
  z
    .object({
      action: z.literal('get-quest'),
      pageUuid: z.string().min(1, 'pageUuid is required'),
    })
    .strict(),
  z
    .object({
      action: z.literal('create-quest'),
      name: z.string().min(1, 'name is required'),
      content: z.string().optional(), // page HTML (objective <ul><li> lists, etc.); default ""
      // Category journal: by name (find-or-create in the configured Quests folder). Defaults to the
      // category named the same as the configured folderName when omitted.
      category: z.string().min(1).optional(),
    })
    .strict(),
  z
    .object({
      // Composite state write (Q&A 2026-06-25): completed + lastUpdated + optional bulk-tick.
      action: z.literal('set-quest-state'),
      pageUuid: z.string().min(1, 'pageUuid is required'),
      completed: z.boolean().optional(),
      // optional bulk-tick: set EVERY existing checkbox key to this state (0|1|2). HC-v2-5-safe
      // because it only rewrites keys that already exist (no new key derivation).
      tickAll: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('set-objective-state'),
      pageUuid: z.string().min(1, 'pageUuid is required'),
      // The objective TEXT (raw HTML or plain). The handler derives the key (HC-v2-5).
      objectiveText: z.string().min(1, 'objectiveText is required'),
      state: z.union([z.literal(0), z.literal(1), z.literal(2)]), // 0 unchecked, 1 checked, 2 failed
      acknowledgeRename: z.boolean().optional(), // HC-v2-5 override
    })
    .strict(),
  z
    .object({
      action: z.literal('set-objective-visibility'),
      pageUuid: z.string().min(1, 'pageUuid is required'),
      objectiveText: z.string().min(1, 'objectiveText is required'),
      hidden: z.boolean(),
      acknowledgeRename: z.boolean().optional(), // HC-v2-5 override
    })
    .strict(),
  z
    .object({
      action: z.literal('set-quest-visibility'),
      pageUuid: z.string().min(1, 'pageUuid is required'),
      hidden: z.boolean(),
    })
    .strict(),
  z
    .object({
      action: z.literal('set-subquest-state'),
      pageUuid: z.string().min(1, 'pageUuid is required'),
      headerText: z.string().min(1, 'headerText is required'), // slugified to the headerKey
      completed: z.boolean(),
    })
    .strict(),
  z
    .object({
      action: z.literal('move-quest'),
      pageUuid: z.string().min(1, 'pageUuid is required'),
      targetCategory: z.string().min(1, 'targetCategory is required'), // category journal name or id
    })
    .strict(),
  z
    .object({
      action: z.literal('mark-quest-updated'),
      pageUuid: z.string().min(1, 'pageUuid is required'),
    })
    .strict(),
  z
    .object({
      action: z.literal('share-quest'),
      pageUuid: z.string().min(1, 'pageUuid is required'),
    })
    .strict(),
  z
    .object({
      action: z.literal('show-quest-to-players'),
      pageUuid: z.string().min(1, 'pageUuid is required'),
      // Target user ids. Omit / empty => all active non-GM users.
      userIds: z.array(z.string().min(1)).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('set-counter'),
      pageUuid: z.string().min(1, 'pageUuid is required'),
      counterId: z.string().min(1, 'counterId is required'),
      value: z.number(),
    })
    .strict(),
  z
    .object({
      action: z.literal('duplicate-quest'),
      pageUuid: z.string().min(1, 'pageUuid is required'),
    })
    .strict(),
  z
    .object({
      // CCR-4 — destructive; confirm gate enforced in the handler.
      action: z.literal('delete-quest'),
      pageUuid: z.string().min(1, 'pageUuid is required'),
      confirm: z.boolean().optional(),
    })
    .strict(),

  // ── Map tab (4) ────────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('create-map-marker'),
      pageUuid: z.string().min(1, 'pageUuid is required (the map JournalEntryPage)'),
      marker: MarkerData,
    })
    .strict(),
  z
    .object({
      action: z.literal('update-map-marker'),
      pageUuid: z.string().min(1, 'pageUuid is required'),
      markerId: z.string().min(1, 'markerId is required'),
      marker: MarkerPatch,
    })
    .strict(),
  z
    .object({
      action: z.literal('remove-map-marker'),
      pageUuid: z.string().min(1, 'pageUuid is required'),
      markerId: z.string().min(1, 'markerId is required'),
    })
    .strict(),
  z
    .object({
      // "at least one of measure/pinsLocked/fowMask" enforced in the handler (see HC-v2-6 note above).
      action: z.literal('set-map-config'),
      pageUuid: z.string().min(1, 'pageUuid is required'),
      measure: z.string().optional(), // "<number><unit>" e.g. "1mi"
      pinsLocked: z.boolean().optional(),
      fowMask: z.string().optional(), // image path
    })
    .strict(),

  // ── Lore tab (2) ───────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('list-lore'),
    })
    .strict(),
  z
    .object({
      action: z.literal('create-lore'),
      name: z.string().min(1, 'name is required'),
      content: z.string().optional(),
      category: z.string().min(1).optional(),
    })
    .strict(),

  // ── Achievements tab (3) ───────────────────────────────────────────────────
  z
    .object({
      action: z.literal('list-achievements'),
    })
    .strict(),
  z
    .object({
      action: z.literal('create-achievement'),
      name: z.string().min(1, 'name is required'),
      content: z.string().optional(),
      color: z.string().optional(), // hex color flag
      category: z.string().min(1).optional(),
    })
    .strict(),
  z
    .object({
      // "at least one of award/revoke/color" enforced in the handler.
      action: z.literal('set-achievement'),
      pageUuid: z.string().min(1, 'pageUuid is required'),
      // ownership: award (grant) or revoke for a specific user.
      userId: z.string().min(1).optional(),
      award: z.boolean().optional(), // true grants (OWNER), false revokes (NONE) for userId
      color: z.string().optional(), // hex color flag
    })
    .strict(),
]);

export type SimpleQuestInputType = z.infer<typeof SimpleQuestInput>;
