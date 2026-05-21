// Phase 5 mcp_completion_v1 — ChatMessage CRUD handler.
//
// Architecture:
//   - create/get/list flow through `createFlatWorldDocCRUDHandlers` (flat factory).
//   - update is a thin wrapper adding rolls-immutability guard.
//   - delete is hand-rolled with CCR-Delete-Safety confirm gate.
//   - dispatchChatMessage is the umbrella; mirrors dispatchFolder / dispatchMacro.
//
// Error tokens:
//   CHATMESSAGE_DELETE_NOT_CONFIRMED, CHATMESSAGE_ROLLS_IMMUTABLE,
//   CHATMESSAGE_WHISPER_RECIPIENT_NOT_FOUND, CHATMESSAGE_NOT_FOUND,
//   CHATMESSAGE_WRITE_NOT_PERSISTED, CHATMESSAGE_COLLECTION_NOT_FOUND
//
// Anchors:
//   - DP-15: typed Envelope<T> returns.
//   - DP-16: factory-baked per-field _source compare; dp16SkipFields for HTML/nested fields.
//   - CCR-Delete-Safety: confirm gate fires before any destructive action.
//   - R5.2: author field used throughout (never legacy user shim).
//   - R5.3: rollMode resolved via ChatMessage.applyRollMode static.
//   - NEVER calls ChatMessage.create directly for GM toasts — that is notify.* territory.

import {
  ChatMessageCreateInput,
  ChatMessageUpdateInput,
  ChatMessageDeleteInput,
  ChatMessageGetInput,
  ChatMessageListInput,
  ChatMessageToolInput,
  type ChatMessageViewModel,
  type ChatMessageListItem,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { notify } from '../notify.js';
import {
  createFlatWorldDocCRUDHandlers,
  validateGMAccess,
  type Envelope,
} from '../utils/flatWorldCRUDFactory.js';

// ── Serializers ───────────────────────────────────────────────────────────────

function serializeChatMessageViewModel(msg: any): ChatMessageViewModel {
  const src = msg._source ?? {};
  const speaker = src.speaker ?? {};
  return {
    id: msg.id as string,
    author: (src.author as string | null) ?? null,
    content: (src.content as string) ?? '',
    type: (src.type as string) ?? 'base',
    style: (src.style as number) ?? 0,
    speaker: {
      scene: (speaker.scene as string | null) ?? null,
      actor: (speaker.actor as string | null) ?? null,
      token: (speaker.token as string | null) ?? null,
      alias: (speaker.alias as string) ?? '',
    },
    whisper: (src.whisper as string[]) ?? [],
    blind: (src.blind as boolean) ?? false,
    rolls: (src.rolls as unknown[]) ?? [],
    flags: (src.flags as Record<string, unknown>) ?? {},
    flavor: (src.flavor as string) ?? '',
    sound: (src.sound as string) ?? '',
    timestamp: (src.timestamp as number) ?? 0,
    title: (src.title as string) ?? '',
    system: (src.system as Record<string, unknown>) ?? {},
  };
}

function serializeChatMessageListItem(msg: any): ChatMessageListItem {
  const src = msg._source ?? {};
  const speaker = src.speaker ?? {};
  return {
    id: msg.id as string,
    author: (src.author as string | null) ?? null,
    alias: (speaker.alias as string) ?? '',
    content: (src.content as string) ?? '',
    style: (src.style as number) ?? 0,
    timestamp: (src.timestamp as number) ?? 0,
    whisper: (src.whisper as string[]) ?? [],
  };
}

// ── List filters ──────────────────────────────────────────────────────────────

function applyChatMessageListFilters(input: any, items: any[]): any[] {
  let out = items;
  const filters = input.filters ?? {};

  if (filters.author) {
    out = out.filter((m) => (m._source?.author ?? '') === filters.author);
  }
  if (filters.speakerActor) {
    out = out.filter((m) => (m._source?.speaker?.actor ?? '') === filters.speakerActor);
  }
  if (filters.speakerScene) {
    out = out.filter((m) => (m._source?.speaker?.scene ?? '') === filters.speakerScene);
  }
  if (filters.type !== undefined) {
    out = out.filter((m) => (m._source?.type ?? '') === filters.type);
  }
  if (filters.style !== undefined) {
    out = out.filter((m) => (m._source?.style ?? 0) === filters.style);
  }

  // Sort by timestamp
  const asc = (input.sortOrder ?? 'desc') === 'asc';
  out = [...out].sort((a, b) => {
    const ta = (a._source?.timestamp as number) ?? 0;
    const tb = (b._source?.timestamp as number) ?? 0;
    return asc ? ta - tb : tb - ta;
  });

  return out;
}

function isAnyChatMessageFilterApplied(input: any): boolean | string {
  const filters = input.filters ?? {};
  const applied: string[] = [];
  if (filters.author) applied.push(`author="${filters.author}"`);
  if (filters.speakerActor) applied.push(`speakerActor="${filters.speakerActor}"`);
  if (filters.speakerScene) applied.push(`speakerScene="${filters.speakerScene}"`);
  if (filters.type !== undefined) applied.push(`type="${filters.type}"`);
  if (filters.style !== undefined) applied.push(`style=${filters.style}`);
  return applied.length > 0 ? applied.join(', ') : false;
}

// ── rollMode + whisper resolution ─────────────────────────────────────────────

// Foundry user ID format: 16 alphanumeric chars.
const FOUNDRY_ID_RE = /^[a-zA-Z0-9]{16}$/;

function resolveWhisperAndApplyRollMode(payload: any): any {
  // 1. Resolve whisper names → IDs (BEFORE applyRollMode so its "respect non-empty whisper" branch fires)
  if (Array.isArray(payload.whisper) && payload.whisper.length > 0) {
    const resolved: string[] = [];
    for (const entry of payload.whisper as string[]) {
      if (FOUNDRY_ID_RE.test(entry)) {
        resolved.push(entry);
      } else {
        const users: any[] = (globalThis as any).ChatMessage?.getWhisperRecipients?.(entry) ?? [];
        if (users.length === 0) {
          throw new Error(
            `CHATMESSAGE_WHISPER_RECIPIENT_NOT_FOUND: no user found with name or role "${entry}"`,
          );
        }
        resolved.push(...users.map((u: any) => u.id as string));
      }
    }
    payload.whisper = resolved;
  }

  // 2. Apply rollMode via native static (mutates in place)
  if (payload.rollMode) {
    const ChatMessageClass = (globalThis as any).ChatMessage;
    if (ChatMessageClass && typeof ChatMessageClass.applyRollMode === 'function') {
      ChatMessageClass.applyRollMode(payload, payload.rollMode);
    }
    // Strip rollMode — not a schema field; must not be persisted
    delete payload.rollMode;
  }

  return payload;
}

// ── Factory configuration ─────────────────────────────────────────────────────

const chatMessageFactoryHandlers = createFlatWorldDocCRUDHandlers<
  any,
  { changes: Record<string, any>; messageId: string },
  ChatMessageViewModel,
  ChatMessageListItem
>({
  documentName: 'ChatMessage',
  documentLabel: 'chatMessage',
  collectionKey: 'messages',
  idField: 'messageId',
  gmGateReads: false,
  schemas: {
    create: ChatMessageCreateInput,
    update: ChatMessageUpdateInput,
    delete: ChatMessageDeleteInput,
    get: ChatMessageGetInput,
    list: ChatMessageListInput,
    toolInput: ChatMessageToolInput,
  },
  dp16SkipFields: ['content', 'flavor', 'speaker', 'system'],
  formatter: serializeChatMessageViewModel,
  listItemFormatter: serializeChatMessageListItem,
  applyListFilters: applyChatMessageListFilters,
  isFilterApplied: isAnyChatMessageFilterApplied,
  responseKeys: {
    viewModel: 'message',
    listArray: 'items',
    remainingCount: 'remainingCount',
  },
  notifyKind: 'chatMessage',
  formatNotifyTitle: () => 'Chat message',
  formatNotifySummary: (input) => {
    if (input.action === 'create') {
      const alias = input.speaker?.alias ?? '';
      return alias ? `from ${alias}` : 'chat message';
    }
    return 'chat message';
  },
  defaultPageSize: 20,
  listAlwaysPaginated: true,
  preCreateTransform: resolveWhisperAndApplyRollMode,
  preUpdateTransform: (changes: Record<string, any>): Record<string, any> => {
    if ('rolls' in changes) {
      throw new Error(
        'CHATMESSAGE_ROLLS_IMMUTABLE: rolls cannot be modified after creation',
      );
    }
    return changes;
  },
  responseBuilders: {
    create: ({ doc, requestedChanges }) => ({
      messageId: doc.id,
      message: serializeChatMessageViewModel(doc),
      requestedChanges,
    }),
    update: ({ doc, requestedChanges, changedFields }) => ({
      messageId: doc.id,
      message: serializeChatMessageViewModel(doc),
      requestedChanges,
      changedFields,
    }),
  },
});

// ── Exported CRUD handlers ────────────────────────────────────────────────────

export const createChatMessage = chatMessageFactoryHandlers.create;
export const getChatMessage = chatMessageFactoryHandlers.get;
export const listChatMessages = chatMessageFactoryHandlers.list;

// factory update — preUpdateTransform owns CHATMESSAGE_ROLLS_IMMUTABLE guard
export const updateChatMessage = chatMessageFactoryHandlers.update;

// ── Custom delete (confirm gate) ──────────────────────────────────────────────

export async function deleteChatMessage(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: deleteChatMessage requires GM' };

  let input: any;
  try {
    input = ChatMessageDeleteInput.strict().parse(data ?? {});
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${msg}`);
  }

  // CCR-Delete-Safety: confirm gate
  if (!input.confirm) {
    return {
      success: false,
      error: 'CHATMESSAGE_DELETE_NOT_CONFIRMED: pass confirm:true to proceed with message deletion',
    };
  }

  const messages = (game as any).messages;
  if (!messages || typeof messages.get !== 'function') {
    return { success: false, error: 'CHATMESSAGE_COLLECTION_NOT_FOUND: game.messages is unavailable' };
  }

  const msg = messages.get(input.messageId);
  if (!msg) {
    return {
      success: false,
      error: `CHATMESSAGE_NOT_FOUND: no message with id "${input.messageId}"`,
    };
  }

  return wrappedWrite('chatMessage.deleteChatMessage', async () => {
    await msg.delete();

    // DP-16 post-verify: confirm removal
    if (messages.get(input.messageId)) {
      throw new Error(
        `CHATMESSAGE_WRITE_NOT_PERSISTED: message "${input.messageId}" still present after delete`,
      );
    }

    notify.deleted('chatMessage', `Chat message ${input.messageId}`);

    return {
      success: true as const,
      data: {
        deletedId: input.messageId,
        remainingCount: messages.size ?? 0,
      },
    };
  });
}

// ── Umbrella dispatcher ───────────────────────────────────────────────────────

export async function dispatchChatMessage(data: unknown): Promise<any> {
  let input: any;
  try {
    input = ChatMessageToolInput.parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  switch (input.action) {
    case 'create':
      return createChatMessage(input);
    case 'update':
      return updateChatMessage(input);
    case 'delete':
      return deleteChatMessage(input);
    case 'get':
      return getChatMessage(input);
    case 'list':
      return listChatMessages(input);
    default:
      throw new Error(`Unknown chat message action: ${(input as any).action}`);
  }
}
