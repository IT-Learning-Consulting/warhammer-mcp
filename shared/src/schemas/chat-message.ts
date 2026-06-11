// Phase 5 mcp_completion_v1 — ChatMessage umbrella shared schemas.
//
// 5 actions: create, update, delete, get, list.
// ChatMessage.delete carries CCR-Delete-Safety confirm gate (no archive-by-rename — messages are unnamed).
// ChatMessage.update explicitly rejects 'rolls' in changes (CHATMESSAGE_ROLLS_IMMUTABLE).
// rollMode is a server-side convenience field resolved via ChatMessage.applyRollMode.
// whisper accepts Foundry user IDs OR display names (resolved via ChatMessage.getWhisperRecipients).
//
// Anchors:
//   - DP-15: typed inputs and response interfaces.
//   - CCR-Schema-Fidelity: all 17 ChatMessage DataModel fields (excl. _id, _stats, emote — emote deferred to style=3).
//   - CCR-Delete-Safety: confirm: z.boolean() required on delete (no .default() — Phase 4 Lesson 2).
//   - R5.2: author field used throughout (never legacy user shim).
//   - R5.3: rollMode enum uses Foundry canonical keys (publicroll/gmroll/blindroll/selfroll/roll).

import { z } from 'zod';

const FOUNDRY_ID = z.string().min(1);

// ── Shared sub-schemas ────────────────────────────────────────────────────────

const ChatSpeaker = z.object({
  scene: FOUNDRY_ID.optional(),
  actor: FOUNDRY_ID.optional(),
  token: FOUNDRY_ID.optional(),
  alias: z.string().optional(),
}).partial().optional();

const CHAT_MESSAGE_STYLE = z.number().int().min(0).max(3);

// rollMode convenience — resolved server-side; not persisted as a ChatMessage field.
const ROLL_MODE = z.enum(['publicroll', 'gmroll', 'blindroll', 'selfroll', 'roll']);

// ── Per-action Input schemas ──────────────────────────────────────────────────

export const ChatMessageCreateInput = z.object({
  action: z.literal('create'),
  // R5.2: author (DocumentAuthorField — current user by default)
  author: FOUNDRY_ID.optional(),
  content: z.string().optional(),
  type: z.string().optional(),
  style: CHAT_MESSAGE_STYLE.optional(),
  speaker: ChatSpeaker,
  // whisper: IDs or display names; resolved via ChatMessage.getWhisperRecipients server-side
  whisper: z.array(z.string()).optional(),
  blind: z.boolean().optional(),
  // rolls is allowed on create (initial dice history)
  rolls: z.array(z.unknown()).optional(),
  flags: z.record(z.unknown()).optional(),
  flavor: z.string().optional(),
  sound: z.string().optional(),
  timestamp: z.number().int().optional(),
  title: z.string().optional(),
  system: z.record(z.unknown()).optional(),
  // Convenience field resolved server-side via ChatMessage.applyRollMode; not persisted.
  rollMode: ROLL_MODE.optional(),
}).strict();

export const ChatMessageUpdateInput = z.object({
  action: z.literal('update'),
  messageId: FOUNDRY_ID,
  changes: z.object({
    // author is not updatable post-create
    content: z.string().optional(),
    type: z.string().optional(),
    style: CHAT_MESSAGE_STYLE.optional(),
    speaker: ChatSpeaker,
    whisper: z.array(z.string()).optional(),
    blind: z.boolean().optional(),
    // rolls accepted at schema layer so wire callers reach the handler guard
    // (CHATMESSAGE_ROLLS_IMMUTABLE in preUpdateTransform). Without this field
    // the .strict() parse rejects rolls first, leaving the handler token unreachable.
    rolls: z.array(z.unknown()).optional(),
    flags: z.record(z.unknown()).optional(),
    flavor: z.string().optional(),
    sound: z.string().optional(),
    title: z.string().optional(),
    system: z.record(z.unknown()).optional(),
  }).strict(),
}).strict();

export const ChatMessageDeleteInput = z.object({
  action: z.literal('delete'),
  messageId: FOUNDRY_ID,
  // CCR-Delete-Safety: confirm required, NO .default() (Phase 4 Lesson 2)
  confirm: z.boolean(),
}).strict();

export const ChatMessageGetInput = z.object({
  action: z.literal('get'),
  messageId: FOUNDRY_ID,
}).strict();

export const ChatMessageListInput = z.object({
  action: z.literal('list'),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(200).default(20),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  filters: z.object({
    author: FOUNDRY_ID.optional(),
    speakerActor: FOUNDRY_ID.optional(),
    speakerScene: FOUNDRY_ID.optional(),
    type: z.string().optional(),
    style: CHAT_MESSAGE_STYLE.optional(),
  }).optional(),
}).strict();

// ── Phase 9C — export / clear chat log ──────────────────────────────────────

// R9C.1 — export-chat-log: read-only render of the chat log. CCR-2b (read-only).
export const ChatMessageExportLogInput = z.object({
  action: z.literal('export-chat-log'),
  format: z.enum(['text', 'markdown']).optional(),
}).strict();

// R9C.2 — clear-chat-log: bulk delete with CCR-4 dryRun preview + confirm.
export const ChatMessageClearLogInput = z.object({
  action: z.literal('clear-chat-log'),
  // Optional filter: only delete messages older than N days.
  olderThanDays: z.number().nonnegative().optional(),
  dryRun: z.boolean().optional(),
  confirm: z.literal(true),
}).strict();

// ── Discriminated union ───────────────────────────────────────────────────────

export const ChatMessageToolInput = z.discriminatedUnion('action', [
  ChatMessageCreateInput,
  ChatMessageUpdateInput,
  ChatMessageDeleteInput,
  ChatMessageGetInput,
  ChatMessageListInput,
  ChatMessageExportLogInput,
  ChatMessageClearLogInput,
]);

// ── Inferred types ────────────────────────────────────────────────────────────

export type ChatMessageCreateInputType = z.infer<typeof ChatMessageCreateInput>;
export type ChatMessageUpdateInputType = z.infer<typeof ChatMessageUpdateInput>;
export type ChatMessageDeleteInputType = z.infer<typeof ChatMessageDeleteInput>;
export type ChatMessageGetInputType = z.infer<typeof ChatMessageGetInput>;
export type ChatMessageListInputType = z.infer<typeof ChatMessageListInput>;
export type ChatMessageExportLogInputType = z.infer<typeof ChatMessageExportLogInput>;
export type ChatMessageClearLogInputType = z.infer<typeof ChatMessageClearLogInput>;
export type ChatMessageToolInputType = z.infer<typeof ChatMessageToolInput>;

// ── Response interfaces ───────────────────────────────────────────────────────

export interface ChatMessageViewModel {
  id: string;
  author: string | null;
  content: string;
  type: string;
  style: number;
  speaker: {
    scene: string | null;
    actor: string | null;
    token: string | null;
    alias: string;
  };
  whisper: string[];
  blind: boolean;
  rolls: unknown[];
  flags: Record<string, unknown>;
  flavor: string;
  sound: string;
  timestamp: number;
  title: string;
  system: Record<string, unknown>;
}

export interface ChatMessageListItem {
  id: string;
  author: string | null;
  alias: string;
  content: string;
  style: number;
  timestamp: number;
  whisper: string[];
}

// Phase 9C — export-chat-log response (read-only render).
export interface ChatMessageExportLogResponse {
  format: 'text' | 'markdown';
  messageCount: number;
  content: string;
}

// Phase 9C — clear-chat-log response. dryRun returns the visibility breakdown
// (CCR-4 preview); confirm returns the deletedCount.
export interface ChatMessageClearLogResponse {
  dryRun: boolean;
  totalCount: number;
  byVisibility: { public: number; gmOnly: number; whispered: number };
  oldest: number | null;
  newest: number | null;
  deletedCount: number;
}
