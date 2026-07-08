// Phase 1 mcp_coverage_expansion — Item-directory umbrella tool.
//
// Covers world game.items collection: list / get / search / duplicate / import-from-compendium.
//
// Scope: game.items only (world WorldCollection).
//   - Actor-embedded items → list-actor-items.
//   - Compendium reads → search-compendium / get-compendium-entry-full.
//   - Placed-token art → token {action:"update", changes:{texture:{src}}}.
//
// CCR-1 / BUG-069: all this.query<T> calls use concrete response interfaces, never <any>.
// CCR-6: write actions (duplicate, import-from-compendium) trigger notify.created on the Foundry side.

import { z } from 'zod';
import { ItemDirectoryToolInput, type FolderId, type PackId, type ItemId } from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type ItemDirectoryArgs = z.infer<typeof ItemDirectoryToolInput>;
type ArgsFor<A extends ItemDirectoryArgs['action']> = Extract<ItemDirectoryArgs, { action: A }>;

// ── Inline response interfaces ────────────────────────────────────────────────

interface WorldItemSummary {
  id: string;
  name: string;
  type: string;
  img: string | null;
  folderId: FolderId | null;
  system: Record<string, unknown>;
  flags: Record<string, unknown>;
}

interface ItemDirectoryListResponse {
  items: WorldItemSummary[];
  total: number;
  page: number;
  pageSize: number;
  typeFilter: string | null;
  folderId: FolderId | null;
}

interface ItemDirectoryGetResponse {
  id: string;
  name: string;
  type: string;
  img: string | null;
  folderId: FolderId | null;
  system: Record<string, unknown>;
  flags: Record<string, unknown>;
}

interface ItemDirectorySearchResponse {
  items: WorldItemSummary[];
  totalAvailable: number;
  truncated: boolean;
  offset: number;
  limit: number;
  query: string | null;
}

interface ItemDirectoryDuplicateResponse {
  id: string;
  name: string;
  type: string;
  sourceId: string; // not a branded id (polymorphic / non-document)
  img: string | null;
  folderId: FolderId | null;
}

interface ItemDirectoryImportResponse {
  id: string;
  name: string;
  type: string;
  packId: PackId;
  compendiumItemId: ItemId;
  idMatchesCompendium: boolean;
  img: string | null;
  folderId: FolderId | null;
}

// ── Utilities ─────────────────────────────────────────────────────────────────


function formatWorldItem(item: WorldItemSummary): string {
  return (
    `- **${item.name}** \`${item.id}\` · type: ${item.type}` +
    (item.folderId ? ` · folder: \`${item.folderId}\`` : '') +
    (item.img ? ` · img: \`${item.img}\`` : '')
  );
}

// ── Tool class ────────────────────────────────────────────────────────────────

export interface ItemDirectoryToolOptions extends BaseToolOptions {}

export class ItemDirectoryTool extends BaseTool {
  constructor(options: ItemDirectoryToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'item-directory', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'item-directory',
        title: 'World Item Directory',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Browse and manage the Foundry world Item directory (game.items) via 5 actions.

**Scope:** world game.items only.
- Actor-embedded items → list-actor-items.
- Compendium reads → search-compendium / get-compendium-entry-full.
- Placed-token art → token {action:"update", changes:{texture:{src}}}.

**Actions:**
- **list**: List world items. Optional: typeFilter (item type string), folderId (folder id), page/pageSize (default 100).
- **get**: Get a single world item by itemId. Returns full serialized item.
- **search**: Search world items. Optional: query (name substring), filters ({type?, folder?}), exclude (id array), limit/offset (default 50, max 500 — results carry totalAvailable + truncated).
- **duplicate**: Clone a world item. Strips _id/folder/sort + effects._id so Foundry generates fresh ids. Optional: newName. Returns new id + sourceId.
- **import-from-compendium**: Import a compendium entry to the world Items directory. Required: packId (e.g. "wfrp4e-core.items"), itemId (bare in-pack id). Optional: updateData (merge overrides). Uses the canonical importFromCompendium path (clears the compendium folder FK). Foundry v13 PRESERVES the source compendium id on the imported world item, so the returned world id normally equals the compendium id (see idMatchesCompendium). Re-importing the same entry collides on that id — delete the existing world item first.

**Examples:**
- list: {action:"list", typeFilter:"weapon"}
- get: {action:"get", itemId:"abc123"}
- search: {action:"search", query:"Healing", filters:{type:"trapping"}}
- duplicate: {action:"duplicate", itemId:"abc123", newName:"My Custom Copy"}
- import-from-compendium: {action:"import-from-compendium", packId:"wfrp4e-core.items", itemId:"gxdjLQoQUTYgD6fm"}`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['list', 'get', 'search', 'duplicate', 'import-from-compendium'],
              description: 'The item-directory action to perform.',
            },
            itemId: {
              type: 'string',
              description: '[get/duplicate] World item document id.',
            },
            typeFilter: {
              type: 'string',
              description: '[list] Filter to items of this type (e.g. "weapon", "skill", "trapping").',
            },
            folderId: {
              type: 'string',
              description: '[list] Filter to items in this folder id.',
            },
            page: {
              type: 'integer',
              minimum: 1,
              description: '[list] 1-based page number (default 1).',
            },
            pageSize: {
              type: 'integer',
              minimum: 1,
              maximum: 200,
              description: '[list] Items per page (default 100, max 200).',
            },
            query: {
              type: 'string',
              description: '[search] Name substring query.',
            },
            filters: {
              type: 'object',
              description: '[search] Optional filter object: {type?: string, folder?: string}.',
              properties: {
                type: { type: 'string', description: 'Filter by item type.' },
                folder: { type: 'string', description: 'Filter by folder id.' },
              },
            },
            exclude: {
              type: 'array',
              items: { type: 'string' },
              description: '[search] Array of item ids to exclude from results.',
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 500,
              description: '[search] Max results per page (default 50, max 500).',
            },
            offset: {
              type: 'integer',
              minimum: 0,
              description: '[search] 0-based result offset for paging.',
            },
            newName: {
              type: 'string',
              description: '[duplicate] New name for the cloned item. If omitted, keeps source name.',
            },
            packId: {
              type: 'string',
              description: '[import-from-compendium] Compendium pack id (e.g. "wfrp4e-core.items").',
            },
            updateData: {
              type: 'object',
              description: '[import-from-compendium] Optional merge overrides applied after import.',
            },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: ItemDirectoryArgs) {
    this.logger.info('Executing item-directory action', { action: args.action });
    switch (args.action) {
      case 'list':
        return this.handleList(args);
      case 'get':
        return this.handleGet(args);
      case 'search':
        return this.handleSearch(args);
      case 'duplicate':
        return this.handleDuplicate(args);
      case 'import-from-compendium':
        return this.handleImportFromCompendium(args);
      default:
        // BUG-439: an unknown action must throw (clean isError envelope via the
        // dispatch catch) instead of falling through to an undefined result.
        throw new Error(`Unknown action "${String((args as any).action)}" — valid actions: list, get, search, duplicate, import-from-compendium`);
    }
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  private async handleList(args: ArgsFor<'list'>) {
    try {
      const data = await this.query<ItemDirectoryListResponse>('item-directory', args);
      if (data.items.length === 0) {
        return { content: [{ type: 'text' as const, text: '📦 **No world items found**' }], structuredContent: data as unknown as Record<string, unknown> };
      }
      const pageInfo = `page ${data.page} · ${data.items.length} of ${data.total} total`;
      const filterNote = data.typeFilter ? ` · type: ${data.typeFilter}` : '';
      const lines = data.items.map(formatWorldItem);
      const text = `📦 **World Items** (${pageInfo}${filterNote})\n\n${lines.join('\n')}`;
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('list', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleGet(args: ArgsFor<'get'>) {
    try {
      const data = await this.query<ItemDirectoryGetResponse>('item-directory', args);
      // BUG-338: "Returns full serialized item" — the handler returns the full
      // system + flags trees, so render them (not just the 4-field header) so
      // callers can read back created-item data (e.g. DP-16 post-write verify).
      const fullDoc = {
        id: data.id,
        name: data.name,
        type: data.type,
        img: data.img ?? null,
        folderId: data.folderId ?? null,
        system: data.system ?? {},
        flags: data.flags ?? {},
      };
      const text =
        `📦 **World Item** \`${data.id}\`\n\n` +
        `- **Name:** ${data.name}\n` +
        `- **Type:** ${data.type}\n` +
        `- **img:** ${data.img ?? '_(none)_'}\n` +
        `- **folderId:** ${data.folderId ?? '_(root)_'}\n\n` +
        `**Full serialized item:**\n\`\`\`json\n${JSON.stringify(fullDoc, null, 2)}\n\`\`\``;
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('get', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleSearch(args: ArgsFor<'search'>) {
    try {
      const data = await this.query<ItemDirectorySearchResponse>('item-directory', args);
      if (data.items.length === 0) {
        return { content: [{ type: 'text' as const, text: '📦 **No items matched the search**' }], structuredContent: data as unknown as Record<string, unknown> };
      }
      const lines = data.items.map(formatWorldItem);
      const window = `${data.items.length} of ${data.totalAvailable} results` +
        (data.truncated ? ` · truncated — pass offset:${data.offset + data.limit} for the next page` : '');
      const text =
        `📦 **Item Search** (${window}${data.query ? ` · query: "${data.query}"` : ''})\n\n` +
        lines.join('\n');
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('search', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDuplicate(args: ArgsFor<'duplicate'>) {
    try {
      const data = await this.query<ItemDirectoryDuplicateResponse>('item-directory', args);
      const text =
        `✅ **Item Duplicated**\n\n` +
        `- **New id:** \`${data.id}\`\n` +
        `- **Name:** ${data.name}\n` +
        `- **Type:** ${data.type}\n` +
        `- **Source id:** \`${data.sourceId}\``;
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('duplicate', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleImportFromCompendium(args: ArgsFor<'import-from-compendium'>) {
    try {
      const data = await this.query<ItemDirectoryImportResponse>('item-directory', args);
      const text =
        `✅ **Item Imported from Compendium**\n\n` +
        `- **World id:** \`${data.id}\`\n` +
        `- **Name:** ${data.name}\n` +
        `- **Type:** ${data.type}\n` +
        `- **Pack:** ${data.packId}\n` +
        `- **Compendium id:** \`${data.compendiumItemId}\`` +
        (data.idMatchesCompendium ? ` _(preserved — Foundry v13 keeps the compendium id on import)_` : ` _(re-keyed to a new world id)_`);
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('import-from-compendium', e instanceof Error ? e.message : String(e));
    }
  }
}
