// PRD mcp_completion_v1 RC.1: this section IS the "check-input-schema-coverage" gate.
// Inherited from mcp_crud_expansion_v1.1 Phase 8 BUG-088 extension. Do not duplicate into a separate file.
// See .agents/prds/mcp_completion/mcp_completion_v1_prd.md §9 RC.1 (v1.5 amendment).
//
// Phase 5 mcp_completion_v1 — ChatMessage MCP tool.
//
// 5 actions: create, update, delete, get, list.
// inputSchema.properties is hand-written enumerating EVERY field across all 5 actions.
// (CCR-Tool-Contract / CCR-4-Surface: Zod is source-of-truth; this is the LLM-visible contract.)
//
// IMPORTANT: Use `author` field, NOT `user` (legacy shim). The `user` accessor on ChatMessageData
// is a shimData backward-compat alias — sending it to Foundry will silently fail.
//
// Side-effect warning: delete with confirm:true is irreversible.
// CCR-Delete-Safety: confirm:true is REQUIRED for any delete call.
//
// rollMode is a server-side convenience field resolved via ChatMessage.applyRollMode:
//   publicroll  → whisper=[], blind=false (all players see)
//   gmroll      → whisper=[GM IDs], blind=false (if whisper field is non-empty, it is kept as-is; rollMode whisper assignment skipped)
//   blindroll   → whisper=[GM IDs], blind=true, hides result from sender (if whisper field is non-empty, kept as-is)
//   selfroll    → whisper=[current GM user id (game.user.id)], blind=false — MCP server always runs as the active GM user, so selfroll whispers to that user regardless of the author field
//   roll        → inherits game.settings rollMode
//
// Anchors:
//   - DP-15: typed query<T>; no <any> on response side.
//   - DP-19: every formatter field reflected in the description.
//   - BUG-088/DP-20: nullable fields use type: ['string', 'null'].

import { z } from 'zod';
import {
    ChatMessageToolInput,
    type ChatMessageViewModel,
    type ChatMessageListItem,
    type ChatMessageExportLogResponse,
    type ChatMessageClearLogResponse,
    ChatMessageId,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type ChatMessageArgs = z.infer<typeof ChatMessageToolInput>;
type ArgsFor<A extends ChatMessageArgs['action']> = Extract<ChatMessageArgs, { action: A }>;

// ── Inline response shapes (DP-15) ───────────────────────────────────────────

interface ChatMessageCreateResponse {
    messageId: ChatMessageId;
    message: ChatMessageViewModel;
    requestedChanges: Record<string, unknown>;
}

interface ChatMessageUpdateResponse {
    messageId: ChatMessageId;
    message: ChatMessageViewModel;
    requestedChanges: Record<string, unknown>;
    changedFields: string[];
}

interface ChatMessageDeleteResponse {
    deletedId: string; // not a branded id (polymorphic / non-document)
    remainingCount: number;
}

interface ChatMessageGetResponse {
    message: ChatMessageViewModel;
}

interface ChatMessageListResponse {
    items: ChatMessageListItem[];
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────


function formatChatMessageView(msg: ChatMessageViewModel): string {
    const whisperNote = msg.whisper.length > 0
        ? `whisper to: ${msg.whisper.join(', ')}`
        : 'public';
    return [
        `## ChatMessage \`${msg.id}\``,
        ``,
        `- **Author:** ${msg.author ?? '_(unknown)_'}`,
        `- **Style:** ${msg.style} (0=other, 1=ooc, 2=ic, 3=emote)`,
        `- **Visibility:** ${whisperNote}${msg.blind ? ' [BLIND]' : ''}`,
        msg.speaker.alias ? `- **Speaker:** ${msg.speaker.alias}` : '',
        msg.title ? `- **Title:** ${msg.title}` : '',
        `- **Timestamp:** ${new Date(msg.timestamp).toISOString()}`,
        ``,
        msg.content ? `**Content:**\n${msg.content}` : '_(no content)_',
    ].filter((l) => l !== '').join('\n');
}

function formatListItem(item: ChatMessageListItem): string {
    const alias = item.alias ? ` [${item.alias}]` : '';
    const whisper = item.whisper.length > 0 ? ' [whisper]' : '';
    const preview = item.content.length > 80 ? item.content.slice(0, 77) + '…' : item.content;
    return `- \`${item.id}\`${alias}${whisper} ${preview}`;
}

export interface ChatMessageToolOptions extends BaseToolOptions {}

export class ChatMessageTool extends BaseTool {
    constructor(options: ChatMessageToolOptions) {
        super(options);
    }

    // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
    getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
      return [
          { name: 'chat-message', handler: (args: any) => this.execute(args) },
      ];
    }

    getToolDefinitions() {
        return [
            {
                name: 'chat-message',
                title: 'ChatMessage management',
                annotations: {
                    readOnlyHint: false,
                    destructiveHint: true,
                    idempotentHint: false,
                    openWorldHint: true,
                },
                description:
                    `Manage Foundry ChatMessage documents through one umbrella tool. 7 actions: create, update, delete, get, list, export-chat-log, clear-chat-log.

Use this when:
- Posting narration, a roll result, or a GM-whispered secret to the chat log (action:"create", with rollMode controlling visibility).
- Editing or removing a message already in the chat log, e.g. correcting a typo or retracting an accidental reveal (action:"update"/"delete", delete requires confirm:true).
- Auditing recent chat history, filtered by author/speaker/type/style (action:"list"/"get").
- Exporting a bounded window of the chat log as text/markdown for a session recap (action:"export-chat-log").
- Bulk-clearing old chat history, previewed with dryRun:true first (action:"clear-chat-log").

Do NOT use this for GM-visible multi-channel workflow signals (console+toast+chat+tooltip+hook) — use \`notify\` instead; this tool is for routine chat-log posting, not the dispatcher-backed workflow-bookend channel. Also: never pass the legacy \`user\` field — it is a shimData alias that silently no-ops; always use \`author\`.

IMPORTANT — author vs user trap: always pass the Foundry user ID in the \`author\` field. The legacy \`user\` accessor is a shimData backward-compat alias; passing it will silently fail.

rollMode (server-side convenience, resolved via ChatMessage.applyRollMode):
  publicroll  → whisper=[], blind=false (all players see the message)
  gmroll      → whisper=[active GM IDs], blind=false (if whisper is non-empty, kept as-is; rollMode whisper assignment skipped)
  blindroll   → whisper=[active GM IDs], blind=true, dice hidden from sender (if whisper is non-empty, kept as-is)
  selfroll    → whisper=[current GM user id (game.user.id)], blind=false (author only — MCP server always runs as the active GM user)
  roll        → inherits game.settings.get("core","rollMode")

whisper field: accepts Foundry user IDs (16-char alphanumeric) OR display names (e.g. "Gamemaster"). Names are resolved via ChatMessage.getWhisperRecipients server-side. Pass rollMode AFTER resolving whisper names if you need both.

WARNING: delete requires confirm:true — ChatMessage history is auditable session data. Start with get to confirm the target before deleting.

[SMOKE-TEST] prefix convention: prefix content with "[SMOKE-TEST]" during smoke testing so messages are easy to identify and clean up.

delete with confirm:true is irreversible.

Key rules:
- create: content is optional but at least one of content/flavor/rolls is recommended.
- update: author is not updatable post-create. Passing \`rolls\` in changes throws CHATMESSAGE_ROLLS_IMMUTABLE.
- delete: requires confirm:true. Returns CHATMESSAGE_DELETE_NOT_CONFIRMED otherwise.
- list: always paginated (default pageSize:20, sortOrder:desc). Use filters to narrow by author/speaker/type/style.
- get: returns full ChatMessageViewModel including speaker sub-object, whisper array, rolls, flags.
- export-chat-log (Phase 9C, BOUNDED per BUG-490): read-only render of a chat-log WINDOW as text/markdown. Defaults to the most recent \`limit\` messages (default 200, max 500); pass \`offset\` to page chronologically from the start. Returns {format, messageCount, content, totalAvailable, truncated, offset, limit} — truncated:true means messages outside the window were omitted. Oversize responses fail loud with RESPONSE_TOO_LARGE naming limit/offset.
- clear-chat-log (Phase 9C): ⚠️ bulk-delete the chat log. confirm:true REQUIRED. Pass dryRun:true first for a {totalCount, byVisibility:{public,gmOnly,whispered}, oldest, newest} preview. Optional olderThanDays filter to delete only old messages.

Performance Notes:
- list is always paginated (default pageSize 20). export-chat-log is BOUNDED — default 200/max 500 messages per call, offset-paginated from the start; fails loud with RESPONSE_TOO_LARGE naming limit/offset if you exceed the response budget anyway. create/update/delete/get/clear-chat-log return a single small fixed-shape response.

Examples:
- {action:"create", content:"The bray-shaman raises its staff.", speaker:{alias:"Narrator"}, rollMode:"publicroll"}
- {action:"create", content:"[SECRET] Hans is a Chaos cultist.", whisper:["Gamemaster"], rollMode:"gmroll"}
- {action:"create", content:"[SMOKE-TEST] probe", author:"<userId>", rollMode:"publicroll"}
- {action:"update", messageId:"abc", changes:{content:"Updated narration."}}
- {action:"delete", messageId:"abc", confirm:true}
- {action:"get", messageId:"abc"}
- {action:"list", pageSize:5, sortOrder:"desc"}
- {action:"list", filters:{author:"<userId>"}, pageSize:10}`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            enum: ['create', 'update', 'delete', 'get', 'list', 'export-chat-log', 'clear-chat-log'],
                            description: 'The chat message action to perform.',
                        },
                        // ── create / update (via changes) ────────────────────
                        author: {
                            type: 'string',
                            description: '[create] Foundry user ID of the message author. Defaults to the current GM user. NEVER use the legacy "user" field — it is a shimData alias.',
                        },
                        content: {
                            type: 'string',
                            description: '[create/update.changes] HTML message body. Use [SMOKE-TEST] prefix during testing.',
                        },
                        type: {
                            type: 'string',
                            description: '[create/update.changes] Foundry document type. Default "base".',
                        },
                        style: {
                            type: 'integer',
                            minimum: 0,
                            maximum: 3,
                            description: '[create/update.changes] Message style: 0=other, 1=ooc (out-of-character), 2=ic (in-character), 3=emote.',
                        },
                        speaker: {
                            type: 'object',
                            description: '[create/update.changes] ChatSpeaker sub-object identifying who is speaking.',
                            properties: {
                                scene: { type: 'string', description: 'Scene document ID.' },
                                actor: { type: 'string', description: 'Actor document ID.' },
                                token: { type: 'string', description: 'Token document ID.' },
                                alias: { type: 'string', description: 'Display name for the speaker (shown in chat log).' },
                            },
                            additionalProperties: false,
                        },
                        whisper: {
                            type: 'array',
                            items: { type: 'string' },
                            description: '[create/update.changes] Array of Foundry user IDs or display names who receive the message. Empty = public. Names resolved via ChatMessage.getWhisperRecipients.',
                        },
                        blind: {
                            type: 'boolean',
                            description: '[create/update.changes] If true, hide the message from the sender (GM rolls blind). Usually set automatically via rollMode:blindroll.',
                        },
                        rolls: {
                            type: 'array',
                            items: {},
                            description: '[create only] Serialized Roll objects. CANNOT be changed after creation (CHATMESSAGE_ROLLS_IMMUTABLE). Omit from update.changes.',
                        },
                        flags: {
                            type: 'object',
                            additionalProperties: true,
                            description: '[create/update.changes] Arbitrary module flags.',
                        },
                        flavor: {
                            type: 'string',
                            description: '[create/update.changes] HTML flavor text displayed above the roll.',
                        },
                        sound: {
                            type: 'string',
                            description: '[create/update.changes] Sound file path to play when message is created.',
                        },
                        timestamp: {
                            type: 'integer',
                            description: '[create] Unix epoch ms timestamp. Defaults to Date.now().',
                        },
                        title: {
                            type: 'string',
                            description: '[create/update.changes] Message title (shown in certain UI contexts).',
                        },
                        system: {
                            type: 'object',
                            additionalProperties: true,
                            description: '[create/update.changes] System-defined data (WFRP4e or other system extension fields).',
                        },
                        rollMode: {
                            type: 'string',
                            enum: ['publicroll', 'gmroll', 'blindroll', 'selfroll', 'roll'],
                            description: '[create] Server-side convenience field. Resolved via ChatMessage.applyRollMode before persist; not stored. publicroll=all see, gmroll=GM+sender, blindroll=GM only (blind), selfroll=sender only, roll=use game setting.',
                        },
                        // ── update ───────────────────────────────────────────
                        messageId: {
                            type: 'string',
                            description: '[update/delete/get] ChatMessage document ID.',
                        },
                        changes: {
                            type: 'object',
                            description: '[update] Object containing only the fields to change. Do not include rolls (CHATMESSAGE_ROLLS_IMMUTABLE) or author.',
                            properties: {
                                content: { type: 'string' },
                                type: { type: 'string' },
                                style: { type: 'integer', minimum: 0, maximum: 3 },
                                speaker: {
                                    type: 'object',
                                    properties: {
                                        scene: { type: 'string' },
                                        actor: { type: 'string' },
                                        token: { type: 'string' },
                                        alias: { type: 'string' },
                                    },
                                    additionalProperties: false,
                                },
                                whisper: { type: 'array', items: { type: 'string' } },
                                blind: { type: 'boolean' },
                                flags: { type: 'object', additionalProperties: true },
                                flavor: { type: 'string' },
                                sound: { type: 'string' },
                                title: { type: 'string' },
                                system: { type: 'object', additionalProperties: true },
                            },
                            additionalProperties: false,
                        },
                        // ── delete ───────────────────────────────────────────
                        confirm: {
                            type: 'boolean',
                            description: '[delete/clear-chat-log] Must be true to proceed (CCR-Delete-Safety). delete returns CHATMESSAGE_DELETE_NOT_CONFIRMED if false/omitted; clear-chat-log requires literal true.',
                        },
                        // ── list ─────────────────────────────────────────────
                        page: {
                            type: 'integer',
                            minimum: 1,
                            description: '[list] Page number (1-based). Default 1.',
                        },
                        pageSize: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 200,
                            description: '[list] Results per page. Default 20.',
                        },
                        sortOrder: {
                            type: 'string',
                            enum: ['asc', 'desc'],
                            description: '[list] Sort by timestamp: "desc" = newest first (default), "asc" = oldest first.',
                        },
                        filters: {
                            type: 'object',
                            description: '[list] Optional filter object to narrow results.',
                            properties: {
                                author: { type: 'string', description: 'Filter by author user ID.' },
                                speakerActor: { type: 'string', description: 'Filter by speaker actor ID.' },
                                speakerScene: { type: 'string', description: 'Filter by speaker scene ID.' },
                                type: { type: 'string', description: 'Filter by message type string.' },
                                style: { type: 'integer', minimum: 0, maximum: 3, description: 'Filter by style (0-3).' },
                            },
                            additionalProperties: false,
                        },
                        // Phase 9C export/clear fields.
                        format: { type: 'string', enum: ['text', 'markdown'], description: '[export-chat-log] Output format (default text).' },
                        limit: { type: 'number', description: '[export-chat-log] Max messages in the window (default 200, max 500). BUG-490 bounded contract.' },
                        offset: { type: 'number', description: '[export-chat-log] Zero-based chronological offset; omit to export the most recent window (tail).' },
                        olderThanDays: { type: 'number', minimum: 0, description: '[clear-chat-log] Only delete messages older than N days (omit = all).' },
                        dryRun: { type: 'boolean', description: '[clear-chat-log] Preview only — returns the visibility breakdown without deleting.' },
                    },
                    required: ['action'],
                },
            },
        ];
    }

    async execute(args: ChatMessageArgs) {
        this.logger.info('Executing chat-message action', { action: args.action });
        switch (args.action) {
            case 'create':
                return this.handleCreate(args);
            case 'update':
                return this.handleUpdate(args);
            case 'delete':
                return this.handleDelete(args);
            case 'get':
                return this.handleGet(args);
            case 'list':
                return this.handleList(args);
            case 'export-chat-log':
                return this.handleExportChatLog(args);
            case 'clear-chat-log':
                return this.handleClearChatLog(args);
          default:
            // BUG-439: an unknown action must throw (clean isError envelope via the
            // dispatch catch) instead of falling through to an undefined result.
            throw new Error(`Unknown action "${String((args as any).action)}" — valid actions: create, update, delete, get, list, export-chat-log, clear-chat-log`);
        }
    }

    private async handleExportChatLog(args: ArgsFor<'export-chat-log'>) {
        try {
            const data = await this.query<ChatMessageExportLogResponse>('chat-message', args);
            // BUG-490 (Wave 2): render the truncation notice so a partial window is never silent.
            const windowNote = data.truncated
                ? `\n⚠️ Truncated window — ${data.messageCount} of ${data.totalAvailable} messages (offset ${data.offset}, limit ${data.limit}). Page with limit/offset for the rest.`
                : '';
            const text = `📜 **Chat Log Export** (${data.format}, ${data.messageCount}${data.totalAvailable !== undefined ? ` of ${data.totalAvailable}` : ''} messages)${windowNote}\n\n${data.content || '_(no messages)_'}`;
            return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('export-chat-log', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleClearChatLog(args: ArgsFor<'clear-chat-log'>) {
        try {
            const data = await this.query<ChatMessageClearLogResponse>('chat-message', args);
            if (data.dryRun) {
                const text = `🔎 **Clear chat-log preview**\n\n**Would delete ${data.totalCount}** message(s):\n- public: ${data.byVisibility.public}\n- GM-only: ${data.byVisibility.gmOnly}\n- whispered: ${data.byVisibility.whispered}\n\nOldest: ${data.oldest ? new Date(data.oldest).toISOString() : '—'} · Newest: ${data.newest ? new Date(data.newest).toISOString() : '—'}\n\n_Re-run with confirm:true (dryRun omitted) to delete._`;
                return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
            }
            const text = `🧹 **Chat log cleared**\n\nDeleted **${data.deletedCount}** message(s) (public ${data.byVisibility.public} / GM ${data.byVisibility.gmOnly} / whisper ${data.byVisibility.whispered}).`;
            return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('clear-chat-log', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleCreate(args: ArgsFor<'create'>) {
        try {
            const data = await this.query<ChatMessageCreateResponse>('chat-message', args);
            const msg = data.message;
            const whisperNote = msg.whisper.length > 0
                ? `whisper to ${msg.whisper.length} user(s)`
                : 'public';
            const text = [
                'Chat Message Created',
                '',
                `- **ID:** \`${data.messageId}\``,
                `- **Author:** ${msg.author ?? '_(unknown)_'}`,
                `- **Visibility:** ${whisperNote}${msg.blind ? ' [BLIND]' : ''}`,
                msg.speaker.alias ? `- **Speaker:** ${msg.speaker.alias}` : '',
                `- **Style:** ${msg.style}`,
            ].filter(Boolean).join('\n');
            return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('create', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleUpdate(args: ArgsFor<'update'>) {
        try {
            const data = await this.query<ChatMessageUpdateResponse>('chat-message', args);
            const text = [
                'Chat Message Updated',
                '',
                `**Changed fields:** ${data.changedFields.join(', ')}`,
                '',
                formatChatMessageView(data.message),
            ].join('\n');
            return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('update', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleDelete(args: ArgsFor<'delete'>) {
        try {
            const data = await this.query<ChatMessageDeleteResponse>('chat-message', args);
            const text = [
                'Chat Message Deleted',
                '',
                `- **Deleted ID:** \`${data.deletedId}\``,
                `- **Remaining messages:** ${data.remainingCount}`,
            ].join('\n');
            return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('delete', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleGet(args: ArgsFor<'get'>) {
        try {
            const data = await this.query<ChatMessageGetResponse>('chat-message', args);
            return { content: [{ type: 'text' as const, text: formatChatMessageView(data.message) }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('get', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleList(args: ArgsFor<'list'>) {
        try {
            const data = await this.query<ChatMessageListResponse>('chat-message', args);
            const items = data.items ?? [];
            if (items.length === 0) {
                return { content: [{ type: 'text' as const, text: 'No chat messages found matching criteria.' }], structuredContent: data as unknown as Record<string, unknown> };
            }
            const lines = items.map(formatListItem);
            const paginationNote = `\n\nPage ${data.page} of ${data.pageCount} (${data.total} total)`;
            const text = `Chat Messages${paginationNote}\n\n${lines.join('\n')}`;
            return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('list', e instanceof Error ? e.message : String(e));
        }
    }
}
