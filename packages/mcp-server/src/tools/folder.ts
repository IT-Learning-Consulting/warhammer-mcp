// Phase 4 mcp_completion_v1 — Folder MCP tool.
//
// 6 actions: create, update, delete, get, list, list-contents.
// inputSchema.properties is hand-written enumerating EVERY field across all 6 actions.
// (CCR-Tool-Contract / CCR-4-Surface: Zod is source-of-truth; this is the LLM-visible contract.)
//
// Side-effect warning: delete with confirm:true + deleteContents:true is irreversible.
// CCR-Delete-Safety: confirm:true is REQUIRED for any delete call.
//
// Anchors:
//   - DP-15: typed query<T>; no <any> on response side.
//   - DP-19: every formatter field reflected in the description.
//   - BUG-088/DP-20: nullable fields use type: ['string', 'null'].

import { z } from 'zod';
import {
    FolderToolInput,
    type FolderViewModel,
    type FolderListItem,
    type FolderContentsItem,
    FolderId,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type FolderArgs = z.infer<typeof FolderToolInput>;
type ArgsFor<A extends FolderArgs['action']> = Extract<FolderArgs, { action: A }>;

// ── Inline response shapes (DP-15) ───────────────────────────────────────────

interface FolderCreateResponse {
    folderId: FolderId;
    folder: FolderViewModel;
    requestedChanges: Record<string, unknown>;
}

interface FolderUpdateResponse {
    folderId: FolderId;
    folder: FolderViewModel;
    requestedChanges: Record<string, unknown>;
    changedFields: string[];
}

interface FolderDeleteResponse {
    deletedId: string; // not a branded id (polymorphic / non-document)
    remainingCount: number;
}

interface FolderGetResponse {
    folder: FolderViewModel;
}

interface FolderListResponse {
    items?: FolderListItem[];
    total?: number;
    page?: number;
    pageSize?: number;
    pageCount?: number;
    filterApplied?: boolean | string | null;
}

interface FolderListContentsResponse {
    folderId: FolderId;
    folderName: string;
    recursive: boolean;
    count: number;
    items: FolderContentsItem[];
}

// ── Helpers ───────────────────────────────────────────────────────────────


function formatFolderView(folder: FolderViewModel): string {
    return [
        `## Folder \`${folder.id}\` — ${folder.name}`,
        ``,
        `- **Type:** ${folder.type}`,
        `- **Depth:** ${folder.depth}`,
        `- **Parent folder:** ${folder.folder ?? '_(root)_'}`,
        `- **Color:** ${folder.color ?? '_(none)_'}`,
        `- **Sort:** ${folder.sort} (sorting: ${folder.sorting === 'a' ? 'alphabetical' : 'manual'})`,
        folder.description ? `- **Description:** ${folder.description}` : '',
    ].filter(Boolean).join('\n');
}

function formatFolderListItem(item: FolderListItem): string {
    const indent = '  '.repeat(item.depth);
    return `${indent}- \`${item.id}\` ${item.name} [${item.type}]${item.color ? ` ${item.color}` : ''}`;
}

export interface FolderToolOptions extends BaseToolOptions { }

export class FolderTool extends BaseTool {
    constructor(options: FolderToolOptions) {
        super(options);
    }

    getToolDefinitions() {
        return [
            {
                name: 'folder',
                title: 'Folder management',
                annotations: {
                    readOnlyHint: false,
                    destructiveHint: true,
                    idempotentHint: false,
                    openWorldHint: true,
                },
                description:
                    `Manage Foundry Folder documents through one umbrella tool. 6 actions: create, update, delete, get, list, list-contents.

WARNING: delete with confirm:true and deleteContents:true is irreversible — contained documents and subfolders are permanently removed.

Key rules:
- create requires name (min 1 char) and type (one of 10 FOLDER_DOCUMENT_TYPES).
- update excludes type (immutable post-create). Changing folder (re-parent) triggers depth pre-check; max depth is CONST.FOLDER_MAX_DEPTH (4).
- delete requires confirm:true. deleteContents:false (default) un-parents contained docs; deleteContents:true bulk-deletes them.
- list-contents returns direct children only by default; pass recursive:true for all descendants.
- Maximum folder nesting depth is 4 (CONST.FOLDER_MAX_DEPTH).

Folder types: Actor, Cards, Item, JournalEntry, Macro, Playlist, RollTable, Scene, Adventure, Compendium.

Examples:
- {action:"create", name:"Session 12 NPCs", type:"Actor"}
- {action:"update", folderId:"abc", changes:{color:"#ff0000"}}
- {action:"delete", folderId:"abc", confirm:true, deleteContents:false}
- {action:"get", folderId:"abc"}
- {action:"list", typeFilter:"Actor", nameFilter:"Session"}
- {action:"list-contents", folderId:"abc", recursive:true}`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            enum: ['create', 'update', 'delete', 'get', 'list', 'list-contents'],
                            description: 'The folder action to perform.',
                        },
                        name: {
                            type: 'string',
                            minLength: 1,
                            description: '[create] Folder name (required).',
                        },
                        type: {
                            type: 'string',
                            enum: ['Actor', 'Cards', 'Item', 'JournalEntry', 'Macro', 'Playlist', 'RollTable', 'Scene', 'Adventure', 'Compendium'],
                            description: '[create] Document type this folder organizes (required). Immutable after creation.',
                        },
                        folderId: {
                            type: 'string',
                            description: '[update/delete/get/list-contents] Folder document ID.',
                        },
                        folder: {
                            type: ['string', 'null'],
                            description: '[create/update.changes] Parent folder ID (or null for root).',
                        },
                        color: {
                            type: ['string', 'null'],
                            description: '[create/update.changes] Hex color string (e.g. #ff0000) or null to clear.',
                        },
                        description: {
                            type: 'string',
                            description: '[create/update.changes] Folder description (HTML).',
                        },
                        sort: {
                            type: 'integer',
                            description: '[create/update.changes] Manual sort order integer.',
                        },
                        sorting: {
                            type: 'string',
                            enum: ['a', 'm'],
                            description: '[create/update.changes] Sort mode: "a" = alphabetical, "m" = manual.',
                        },
                        flags: {
                            type: 'object',
                            additionalProperties: true,
                            description: '[create/update.changes] Arbitrary module flags.',
                        },
                        confirm: {
                            type: 'boolean',
                            description: '[delete] Must be true to proceed with deletion (CCR-Delete-Safety).',
                        },
                        deleteContents: {
                            type: 'boolean',
                            description: '[delete] If true, bulk-delete all contained documents and subfolders before deleting the folder. If false (default), contained docs are un-parented. IRREVERSIBLE.',
                        },
                        cascade: {
                            type: 'boolean',
                            description: '[delete] Reserved for Phase 10 cross-doc FK cleanup. Not yet implemented — passing true returns FOLDER_CASCADE_NOT_IMPLEMENTED. Default false.',
                        },
                        changes: {
                            type: 'object',
                            description: '[update] Object containing only the fields to change (name, folder, color, description, sort, sorting, flags). Do not include type.',
                            properties: {
                                name: { type: 'string', minLength: 1 },
                                folder: { type: ['string', 'null'] },
                                color: { type: ['string', 'null'] },
                                description: { type: 'string' },
                                sort: { type: 'integer' },
                                sorting: { type: 'string', enum: ['a', 'm'] },
                                flags: { type: 'object', additionalProperties: true },
                            },
                            additionalProperties: false,
                        },
                        typeFilter: {
                            type: 'string',
                            enum: ['Actor', 'Cards', 'Item', 'JournalEntry', 'Macro', 'Playlist', 'RollTable', 'Scene', 'Adventure', 'Compendium'],
                            description: '[list] Filter folders to this document type.',
                        },
                        nameFilter: {
                            type: 'string',
                            description: '[list] Case-insensitive substring match on folder name.',
                        },
                        parentId: {
                            type: ['string', 'null'],
                            description: '[list] Filter folders by parent folder ID. Pass null to return only root-level folders.',
                        },
                        page: {
                            type: 'integer',
                            minimum: 1,
                            description: '[list] Page number for paginated results (1-based).',
                        },
                        pageSize: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 100,
                            description: '[list] Number of results per page. Default 50.',
                        },
                        countOnly: {
                            type: 'boolean',
                            description: '[list] If true, return only the total count without items.',
                        },
                        recursive: {
                            type: 'boolean',
                            description: '[list-contents] If true, recursively include all descendant folder contents. Default false (shallow).',
                        },
                    },
                    required: ['action'],
                },
            },
        ];
    }

    async execute(args: FolderArgs) {
        this.logger.info('Executing folder action', { action: args.action });
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
            case 'list-contents':
                return this.handleListContents(args);
        }
    }

    private async handleCreate(args: ArgsFor<'create'>) {
        try {
            const data = await this.query<FolderCreateResponse>('folder', args);
            const text = [
                'Folder Created',
                '',
                `- **ID:** \`${data.folderId}\``,
                `- **Name:** ${data.folder.name}`,
                `- **Type:** ${data.folder.type}`,
                `- **Depth:** ${data.folder.depth}`,
                `- **Parent:** ${data.folder.folder ?? '_(root)_'}`,
            ].join('\n');
            return { content: [{ type: 'text' as const, text }] };
        } catch (e) {
            return this.errorResponse('create', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleUpdate(args: ArgsFor<'update'>) {
        try {
            const data = await this.query<FolderUpdateResponse>('folder', args);
            const text = [
                'Folder Updated',
                '',
                `**Changed fields:** ${data.changedFields.join(', ')}`,
                '',
                formatFolderView(data.folder),
            ].join('\n');
            return { content: [{ type: 'text' as const, text }] };
        } catch (e) {
            return this.errorResponse('update', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleDelete(args: ArgsFor<'delete'>) {
        try {
            const data = await this.query<FolderDeleteResponse>('folder', args);
            const text = [
                'Folder Deleted',
                '',
                `- **Deleted ID:** \`${data.deletedId}\``,
                `- **Remaining folders:** ${data.remainingCount}`,
            ].join('\n');
            return { content: [{ type: 'text' as const, text }] };
        } catch (e) {
            return this.errorResponse('delete', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleGet(args: ArgsFor<'get'>) {
        try {
            const data = await this.query<FolderGetResponse>('folder', args);
            return { content: [{ type: 'text' as const, text: formatFolderView(data.folder) }] };
        } catch (e) {
            return this.errorResponse('get', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleList(args: ArgsFor<'list'>) {
        try {
            const data = await this.query<FolderListResponse>('folder', args);
            if (typeof data.total === 'number' && !data.items) {
                const filterNote = data.filterApplied ? ` (filter: ${data.filterApplied})` : '';
                return { content: [{ type: 'text' as const, text: `Total folders: ${data.total}${filterNote}` }] };
            }
            const items = data.items ?? [];
            if (items.length === 0) {
                return { content: [{ type: 'text' as const, text: 'No folders found matching criteria.' }] };
            }
            const lines = items.map(formatFolderListItem);
            const paginationNote = data.pageCount != null
                ? `\n\nPage ${data.page ?? 1} of ${data.pageCount} (${data.total ?? items.length} total)`
                : ` (${items.length} folders)`;
            const text = `Folders${paginationNote}\n\n${lines.join('\n')}`;
            return { content: [{ type: 'text' as const, text }] };
        } catch (e) {
            return this.errorResponse('list', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleListContents(args: ArgsFor<'list-contents'>) {
        try {
            const data = await this.query<FolderListContentsResponse>('folder', args);
            const recursiveNote = data.recursive ? ' (recursive)' : ' (shallow)';
            if (data.count === 0) {
                return { content: [{ type: 'text' as const, text: `Folder "${data.folderName}"${recursiveNote} is empty.` }] };
            }
            const lines = data.items.map((item) =>
                `- \`${item.id}\` ${item.name} [${item.documentType}]${item.uuid ? ` · ${item.uuid}` : ''}`,
            );
            const text = `Folder Contents — "${data.folderName}"${recursiveNote}\n\n${lines.join('\n')}\n\nTotal: ${data.count}`;
            return { content: [{ type: 'text' as const, text }] };
        } catch (e) {
            return this.errorResponse('list-contents', e instanceof Error ? e.message : String(e));
        }
    }
}
