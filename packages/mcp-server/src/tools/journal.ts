// Phase 3 mcp_crud_expansion — Journal umbrella tool (13 actions).
//
// Replaces the 4-tool surface (list-journals / get-journal-content /
// create-journal-entry / update-journal-content) + the world-delete.ts
// delete-journal-entry slice with a single `journal` umbrella tool.
//
// **CCR-Envelope-Consumer (post-BUG-069 2026-05-14):** every handler uses a
// concrete typed generic on `this.query<...>` — no `<any>`. Each handler
// wraps its query call in try/catch and routes errors through errorResponse().
//
// **CCR-Schema-Fidelity:** input field paths mirror the shared Zod schemas in
// `@foundry-mcp/shared/journal` 1:1. The tool's local Zod schema imports
// directly from there so the tool side and handler side cannot drift.

import { z } from 'zod';
import {
  JournalToolInput,
  type JournalCreateEntryResponse,
  type JournalUpdateEntryResponse,
  type JournalDeleteEntryResponse,
  type JournalListEntriesResponse,
  type JournalGetEntryResponse,
  type JournalAddPageResponse,
  type JournalUpdatePageResponse,
  type JournalDeletePageResponse,
  type JournalReorderPagesResponse,
  type JournalAddCategoryResponse,
  type JournalUpdateCategoryResponse,
  type JournalDeleteCategoryResponse,
  type JournalAssignPageToCategoryResponse,
} from '@foundry-mcp/shared';
import { sanitizeHtml } from '../utils/sanitize-html.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';
import { formatAffectedDocs } from './format-affected-docs.js';

type JournalArgs = z.infer<typeof JournalToolInput>;

// Narrow each action's args via a small per-action helper so the umbrella
// dispatch retains discriminator-narrowed types without `as` casts.
type ArgsFor<A extends JournalArgs['action']> = Extract<JournalArgs, { action: A }>;

export class JournalTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'journal',
        title: 'Manage Journals',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Manage Foundry VTT JournalEntries with multi-page + multi-type CRUD via 13 actions.

**Actions:**
- **create-entry**: Create a JournalEntry with optional inline pages (text/image/pdf/video) + categories. Returns {id, name, pageIds, categoryIds}.
- **update-entry**: Update top-level fields (name, folder, sort, ownership, flags) on an existing entry. Use update-page for page content.
- **delete-entry**: Permanently delete a JournalEntry and all its pages + categories. ⚠️ Irreversible.
- **list-entries**: List world entries. filterTemplate:"<prefix>" matches name-prefix "<prefix>:" (case-insensitive); filterQuests:true aliases filterTemplate:"quest"; includeContent:true populates each entry's first text-page body.
- **get-entry**: Fetch a single entry. Deep by default; shallow:true returns {id, name, pageIds, pageCount, categoryCount}.
- **add-page**: Append a page (text/image/pdf/video) to an entry. sort auto-increments by 1000s when omitted.
- **update-page**: Partial-diff update of an existing page's writable fields. Type cannot change. Returns {entryId, pageId, changes}.
- **delete-page**: Remove a single page from an entry.
- **reorder-pages**: Reassign sort values on every page. pageIds must be the complete ordered list (rejects partial reorder).
- **add-category**: Add a JournalEntryCategory header to an entry.
- **update-category**: Update a category's name/sort/flags.
- **delete-category**: Remove a category. Previously assigned pages become uncategorised.
- **assign-page-to-category**: Set or clear (categoryId:null) a page's category FK.

**Page types** (input on create-entry / add-page):
- text: {type:"text", name, text:{content, format?:1|2}, title?:{show,level}, sort?, category?}
- image: {type:"image", name, src, image?:{caption}, ...}
- pdf: {type:"pdf", name, src, ...}
- video: {type:"video", name, src?, video?:{autoplay,loop,width,height,volume,timestamp,controls}, ...}

**Text page format**: 1=HTML (ProseMirror default), 2=Markdown. CONST.JOURNAL_ENTRY_PAGE_FORMATS.

**HTML/CSS preservation** (text pages, format:1): round-trips byte-identical except sanitisation of <script>, on*-event handlers, and javascript: URLs. Preserved: tables, inline styles, custom CSS classes, <section class="secret">, <details>/<summary>, blockquotes, lists, headings, data-* attrs, @UUID[Type.Id]{Label} including @UUID[JournalEntry.X.JournalEntryPage.Y]{Label}.

**Examples:**
- create-entry: {action:"create-entry", name:"Quest: Find the Witch Hunter", pages:[{type:"text", name:"Briefing", text:{content:"<p>...</p>"}}]}
- update-entry: {action:"update-entry", entryId:"abc", changes:{name:"Renamed Entry", folder:"folderId"}}
- update-page: {action:"update-page", entryId:"abc", pageId:"p1", changes:{text:{content:"<p>new body</p>"}}}
- reorder-pages: {action:"reorder-pages", entryId:"abc", pageIds:["p3","p1","p2"]}
- assign-page-to-category (unassign): {action:"assign-page-to-category", entryId:"abc", pageId:"p1", categoryId:null}`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'create-entry',
                'update-entry',
                'delete-entry',
                'list-entries',
                'get-entry',
                'add-page',
                'update-page',
                'delete-page',
                'reorder-pages',
                'add-category',
                'update-category',
                'delete-category',
                'assign-page-to-category',
              ],
              description: 'The journal action to perform.',
            },
            entryId: {
              type: 'string',
              description:
                '[update-entry/delete-entry/get-entry/add-page/update-page/delete-page/reorder-pages/add-category/update-category/delete-category/assign-page-to-category] JournalEntry document ID.',
            },
            pageId: {
              type: 'string',
              description:
                '[update-page/delete-page/assign-page-to-category] JournalEntryPage document ID within the entry.',
            },
            categoryId: {
              type: ['string', 'null'],
              description:
                '[update-category/delete-category/assign-page-to-category] JournalEntryCategory document ID within the entry. For assign-page-to-category: pass the categoryId to ASSIGN, or pass null to UNASSIGN.',
            },
            name: {
              type: 'string',
              description: '[create-entry/add-category] Name for the new entry or category.',
            },
            folder: {
              type: ['string', 'null'],
              description: '[create-entry/update-entry] Folder ID to place the entry in. Pass null to clear (move out of any folder).',
            },
            sort: {
              type: 'number',
              description: '[create-entry/add-category] Sort value.',
            },
            ownership: {
              type: 'object',
              description:
                '[create-entry] Foundry DocumentOwnershipField: { default?: 0|1|2|3, "<userId>": 0|1|2|3 }. 0=NONE 1=LIMITED 2=OBSERVER 3=OWNER.',
            },
            flags: {
              type: 'object',
              description: '[create-entry/add-category] Foundry flag bag.',
            },
            pages: {
              type: 'array',
              items: { type: 'object' },
              description:
                '[create-entry] Inline pages (text/image/pdf/video). Each: {type, name, ...subtype fields}. sort auto-increments by 1000s when omitted.',
            },
            categories: {
              type: 'array',
              items: { type: 'object' },
              description: '[create-entry] Inline categories: [{name, sort?, flags?}].',
            },
            changes: {
              type: 'object',
              description:
                '[update-entry/update-page/update-category] Partial-diff of writable fields. Must contain at least one field. update-entry whitelists: name, folder, sort, ownership, flags. update-page accepts: name, sort, title, category, flags, ownership + subtype-specific text/image/video bodies + src.',
            },
            page: {
              type: 'object',
              description:
                '[add-page] Full page object (mirrors create-entry.pages[i]): {type, name, ...subtype fields}.',
            },
            pageIds: {
              type: 'array',
              items: { type: 'string' },
              description:
                '[reorder-pages] Complete ordered list of every page ID on the entry. Length must equal entry.pages.size — partial reorder rejected.',
            },
            filterTemplate: {
              type: 'string',
              description:
                '[list-entries] Match entries whose name starts with "<value>:" (case-insensitive). e.g. "quest" matches "Quest: 1".',
            },
            filterQuests: {
              type: 'boolean',
              description:
                '[list-entries] Back-compat alias for filterTemplate: "quest". Existing /wfrp-session-prep + /wfrp-journal callers continue to work.',
            },
            includeContent: {
              type: 'boolean',
              description:
                '[list-entries] If true, populate each entry\'s first text-page body in the `content` field.',
            },
            shallow: {
              type: 'boolean',
              description:
                '[get-entry] If true, return {id, name, pageIds, pageCount, categoryCount} instead of deep entry shape. Cheaper for large lore journals.',
            },
            // Phase 10 cross-doc-fk cascade flag (delete-entry / delete-page only).
            cascade: {
              type: 'boolean',
              description: '[delete-entry/delete-page] When true, clears cross-doc FK references (Scene.journal, Note.entryId, etc.) targeting this entry/page before deletion. Default false.',
            },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: JournalArgs) {
    this.logger.info('Executing journal action', { action: args.action });

    switch (args.action) {
      case 'create-entry':
        return this.handleCreateEntry(args);
      case 'update-entry':
        return this.handleUpdateEntry(args);
      case 'delete-entry':
        return this.handleDeleteEntry(args);
      case 'list-entries':
        return this.handleListEntries(args);
      case 'get-entry':
        return this.handleGetEntry(args);
      case 'add-page':
        return this.handleAddPage(args);
      case 'update-page':
        return this.handleUpdatePage(args);
      case 'delete-page':
        return this.handleDeletePage(args);
      case 'reorder-pages':
        return this.handleReorderPages(args);
      case 'add-category':
        return this.handleAddCategory(args);
      case 'update-category':
        return this.handleUpdateCategory(args);
      case 'delete-category':
        return this.handleDeleteCategory(args);
      case 'assign-page-to-category':
        return this.handleAssignPageToCategory(args);
    }
  }

  // ── Handlers (concrete typed per CCR-Envelope-Consumer rule 3) ───────────

  private async handleCreateEntry(args: ArgsFor<'create-entry'>) {
    try {
      const data = await this.query<JournalCreateEntryResponse>('journal', args);
      return {
        content: [
          {
            type: 'text' as const,
            text: `📓 **Journal Entry Created**\n\n**Name:** ${data.name}\n**ID:** ${data.id}\n**Pages:** ${data.pageIds.length}\n**Categories:** ${data.categoryIds.length}`,
          },
        ],
      };
    } catch (e) {
      return this.errorResponse('create-entry', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdateEntry(args: ArgsFor<'update-entry'>) {
    try {
      const data = await this.query<JournalUpdateEntryResponse>('journal', args);
      return {
        content: [
          {
            type: 'text' as const,
            text: `✏️ **Journal Entry Updated**\n\n**ID:** ${data.entryId}\n**Changed Fields:** ${Object.keys(data.changes).filter((k) => k !== '_id').join(', ')}`,
          },
        ],
      };
    } catch (e) {
      return this.errorResponse('update-entry', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDeleteEntry(args: ArgsFor<'delete-entry'>) {
    try {
      const data = await this.query<JournalDeleteEntryResponse>('journal', args);
      return {
        content: [
          {
            type: 'text' as const,
            text: `🗑️ **Journal Entry Deleted**\n\n**ID:** ${data.entryId}\n\n⚠️ Permanent. All pages and categories removed.${formatAffectedDocs(data.affectedDocs)}`,
          },
        ],
      };
    } catch (e) {
      return this.errorResponse('delete-entry', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleListEntries(args: ArgsFor<'list-entries'>) {
    try {
      const data = await this.query<JournalListEntriesResponse>('journal', args);
      // Apply sanitizeHtml to includeContent bodies on the way out.
      const sanitised = data.map((j) => ({
        ...j,
        ...(typeof j.content === 'string' ? { content: sanitizeHtml(j.content) } : {}),
      }));
      if (sanitised.length === 0) {
        return {
          content: [
            { type: 'text' as const, text: '📋 **No Journals Found**\n\nNo entries match the filter.' },
          ],
        };
      }
      // BUG-074: when includeContent:true, inline each entry's first text-page
      // body into the response (was previously computed but silently dropped).
      const CONTENT_CAP = 1000;
      const lines = sanitised.map((j) => {
        let line = `- ${j.name} · ${j.id} · ${j.pageCount} page${j.pageCount === 1 ? '' : 's'}`;
        if (args.includeContent === true) {
          const raw = typeof j.content === 'string' ? j.content : '';
          const content = raw.length > CONTENT_CAP
            ? raw.slice(0, CONTENT_CAP) + ` [truncated — ${raw.length - CONTENT_CAP} chars omitted]`
            : raw;
          line += `\n  Content: ${content || '(no text page)'}`;
        }
        return line;
      });
      const text = `📋 **Journals** (${sanitised.length})\n\n${lines.join('\n')}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('list-entries', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleGetEntry(args: ArgsFor<'get-entry'>) {
    try {
      const data = await this.query<JournalGetEntryResponse>('journal', args);
      // Shallow shape lacks `pages`; deep shape includes them.
      if ('pageIds' in data) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `📖 **Journal Entry (shallow)**\n\n**Name:** ${data.name}\n**ID:** ${data.id}\n**Pages:** ${data.pageCount}\n**Categories:** ${data.categoryCount}\n**Page IDs:** ${data.pageIds.join(', ')}`,
            },
          ],
        };
      }
      // Deep — sanitize HTML in text-page content before echo.
      const sanitisedPages = data.pages.map((p) => {
        if (p.text && typeof p.text.content === 'string') {
          return { ...p, text: { ...p.text, content: sanitizeHtml(p.text.content) } };
        }
        return p;
      });
      let text = `📖 **Journal Entry**\n\n**Name:** ${data.name}\n**ID:** ${data.id}\n**Pages:** ${sanitisedPages.length}\n**Categories:** ${data.categories.length}\n\n`;
      if (data.categories.length > 0) {
        text += `**Categories:**\n`;
        for (const c of data.categories) text += `- ${c.name} [_id: ${c.id}]\n`;
        text += `\n`;
      }
      text += `**Pages:**\n`;
      // BUG-073: surface text.content / src / markdown source so callers can
      // verify round-trip integrity through the same call (was previously
      // sanitised but never emitted). Per JournalEntryPageData (foundry_docs):
      //   text.content?: string · text.format: number · text.markdown?: string
      // Cap per-page content at 4000 chars to bound response size on lore-heavy
      // entries; truncation marker preserves the byte-count delta.
      const PAGE_CONTENT_CAP = 4000;
      const PAGE_MARKDOWN_CAP = 2000;
      for (const p of sanitisedPages) {
        const catTag = p.category ? ` · category: ${p.category}` : '';
        text += `- ${p.name} (${p.type}) [_id: ${p.id}, sort: ${p.sort}${catTag}]\n`;
        if (p.src) {
          text += `  src: ${p.src}\n`;
        }
        const pageText: any = (p as any).text;
        if (p.type === 'text' && pageText && typeof pageText.content === 'string') {
          const raw = pageText.content;
          const content = raw.length > PAGE_CONTENT_CAP
            ? raw.slice(0, PAGE_CONTENT_CAP) +
              ` [truncated — ${raw.length - PAGE_CONTENT_CAP} chars omitted]`
            : raw;
          const fmt = typeof pageText.format === 'number' ? pageText.format : 1;
          text += `  Content (format ${fmt}):\n  \`\`\`\n${content}\n  \`\`\`\n`;
          if (typeof pageText.markdown === 'string' && pageText.markdown.length > 0) {
            const md = pageText.markdown.length > PAGE_MARKDOWN_CAP
              ? pageText.markdown.slice(0, PAGE_MARKDOWN_CAP) +
                ` [truncated — ${pageText.markdown.length - PAGE_MARKDOWN_CAP} chars omitted]`
              : pageText.markdown;
            text += `  Markdown source:\n  \`\`\`\n${md}\n  \`\`\`\n`;
          }
        }
      }
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('get-entry', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleAddPage(args: ArgsFor<'add-page'>) {
    try {
      const data = await this.query<JournalAddPageResponse>('journal', args);
      return {
        content: [
          {
            type: 'text' as const,
            text: `➕ **Page Added**\n\n**Entry:** ${data.entryId}\n**Page ID:** ${data.pageId}\n**Type:** ${data.type}`,
          },
        ],
      };
    } catch (e) {
      return this.errorResponse('add-page', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdatePage(args: ArgsFor<'update-page'>) {
    try {
      const data = await this.query<JournalUpdatePageResponse>('journal', args);
      return {
        content: [
          {
            type: 'text' as const,
            text: `✏️ **Page Updated**\n\n**Entry:** ${data.entryId}\n**Page:** ${data.pageId}\n**Changed Fields:** ${Object.keys(data.changes).join(', ')}`,
          },
        ],
      };
    } catch (e) {
      return this.errorResponse('update-page', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDeletePage(args: ArgsFor<'delete-page'>) {
    try {
      const data = await this.query<JournalDeletePageResponse>('journal', args);
      return {
        content: [
          {
            type: 'text' as const,
            text: `🗑️ **Page Deleted**\n\n**Entry:** ${data.entryId}\n**Page:** ${data.pageId}${formatAffectedDocs(data.affectedDocs)}`,
          },
        ],
      };
    } catch (e) {
      return this.errorResponse('delete-page', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleReorderPages(args: ArgsFor<'reorder-pages'>) {
    try {
      const data = await this.query<JournalReorderPagesResponse>('journal', args);
      return {
        content: [
          {
            type: 'text' as const,
            text: `🔀 **Pages Reordered**\n\n**Entry:** ${data.entryId}\n**Pages:** ${data.pageCount}\n**New order:** ${data.pageIds.join(' → ')}`,
          },
        ],
      };
    } catch (e) {
      return this.errorResponse('reorder-pages', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleAddCategory(args: ArgsFor<'add-category'>) {
    try {
      const data = await this.query<JournalAddCategoryResponse>('journal', args);
      return {
        content: [
          {
            type: 'text' as const,
            text: `🗂️ **Category Added**\n\n**Entry:** ${data.entryId}\n**Category ID:** ${data.categoryId}\n**Name:** ${data.name}`,
          },
        ],
      };
    } catch (e) {
      return this.errorResponse('add-category', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdateCategory(args: ArgsFor<'update-category'>) {
    try {
      const data = await this.query<JournalUpdateCategoryResponse>('journal', args);
      return {
        content: [
          {
            type: 'text' as const,
            text: `✏️ **Category Updated**\n\n**Entry:** ${data.entryId}\n**Category:** ${data.categoryId}\n**Changed Fields:** ${Object.keys(data.changes).join(', ')}`,
          },
        ],
      };
    } catch (e) {
      return this.errorResponse('update-category', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDeleteCategory(args: ArgsFor<'delete-category'>) {
    try {
      const data = await this.query<JournalDeleteCategoryResponse>('journal', args);
      return {
        content: [
          {
            type: 'text' as const,
            text:
              `🗑️ **Category Deleted**\n\n**Entry:** ${data.entryId}\n**Category:** ${data.categoryId}\n` +
              `**Pages uncategorised:** ${data.affectedPages.length}` +
              (data.affectedPages.length > 0 ? ` (${data.affectedPages.join(', ')})` : ''),
          },
        ],
      };
    } catch (e) {
      return this.errorResponse('delete-category', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleAssignPageToCategory(args: ArgsFor<'assign-page-to-category'>) {
    try {
      const data = await this.query<JournalAssignPageToCategoryResponse>('journal', args);
      const verb = data.categoryId === null ? 'unassigned from category' : `assigned to category ${data.categoryId}`;
      return {
        content: [
          {
            type: 'text' as const,
            text: `🔗 **Page ${verb}**\n\n**Entry:** ${data.entryId}\n**Page:** ${data.pageId}`,
          },
        ],
      };
    } catch (e) {
      return this.errorResponse(
        'assign-page-to-category',
        e instanceof Error ? e.message : String(e),
      );
    }
  }

  private errorResponse(action: string, error: string) {
    return {
      content: [{ type: 'text' as const, text: `❌ **journal.${action} failed**\n\n${error}` }],
      isError: true,
    };
  }
}
