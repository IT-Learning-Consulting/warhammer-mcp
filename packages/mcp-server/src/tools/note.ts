// Phase 5 mcp_crud_expansion — Note (map-pin) umbrella tool (5 actions).
//
// Wraps the `note` Foundry-side handler (dispatchNote).
// Actions: create / update / delete / get / list.
// All operate on scene.notes (EmbeddedCollectionField of NoteDocument).
//
// **CCR-Envelope-Consumer:** every handler uses a concrete typed generic on
// `this.query<...>` — no `<any>`. Each handler wraps its query call in
// try/catch and routes errors through this.errorResponse().
//
// **BUG-069 compliance:** this.query<T> returns BARE unwrapped data; never check
// the success field on the return value; never use this.query<any>.
//
// **B5-aware formatting:** NoteViewModel carries both entryLinked AND pageLinked
// booleans. Both are surfaced in get and list formatters (FK-orphan visibility).

import { z } from 'zod';
import {
  NoteToolInput,
  type NoteViewModel,
  type NoteListItem,
  SceneId,
  JournalEntryId,
  JournalEntryPageId,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type NoteArgs = z.infer<typeof NoteToolInput>;
type ArgsFor<A extends NoteArgs['action']> = Extract<NoteArgs, { action: A }>;

// ── Inline response interfaces (mirror foundry-module handler data payloads) ──

// BUG-326: removed `success: true` — BaseTool.query<T>() returns bare unwrapped data;
// the success field never exists on the unwrapped object.
interface NoteCreateResponse {
  note: NoteViewModel;
  requestedChanges: Record<string, unknown>;
  journalEntry?: { id: JournalEntryId; firstPageId: JournalEntryPageId | null };
}
interface NoteUpdateResponse {
  note: NoteViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}
interface NoteDeleteResponse {
  deletedId: string; // not a branded id (polymorphic / non-document)
  sceneId: SceneId;
  remainingNotes: number;
}
interface NoteGetResponse {
  note: NoteViewModel;
}
interface NoteListResponse {
  notes: NoteListItem[];
  total: number;
  page: number;
  pageSize: number;
  countOnly?: boolean;
  filterApplied?: string | null;
}

// ── Utilities ────────────────────────────────────────────────────────────────


/**
 * Format a FK link field for display.
 * B5-aware: surfaces both entryLinked and pageLinked booleans from NoteViewModel.
 */
function fmtFK(linked: boolean, raw: string | null): string {
  if (!raw) return '_(none)_';
  return linked ? `\`${raw}\`` : `\`${raw}\` ⚠️ _(stale FK — linked doc no longer exists)_`;
}

function formatNoteView(n: NoteViewModel): string {
  return [
    `## Note \`${n.id}\``,
    `**Scene:** \`${n.sceneId}\``,
    ``,
    `### Journal Link (B5-aware)`,
    `- Entry: ${fmtFK(n.entryLinked, n.entryId)} · entryLinked=${n.entryLinked}`,
    `- Page:  ${fmtFK(n.pageLinked, n.pageId)} · pageLinked=${n.pageLinked}`,
    ``,
    `### Position`,
    `- x: ${n.x}, y: ${n.y}, elevation: ${n.elevation}, sort: ${n.sort}`,
    ``,
    `### Appearance`,
    `- iconSize: ${n.iconSize}px · global: ${n.global ? 'yes' : 'no'}`,
    `- text: ${n.text ? `"${n.text}"` : '_(none)_'}`,
    `- font: ${n.fontFamily} ${n.fontSize}px · anchor: ${n.textAnchor} · color: ${n.textColor}`,
    `- texture: ${n.texture.src ? `\`${n.texture.src}\`` : '_(none)_'}`,
    `  - anchor: (${n.texture.anchorX}, ${n.texture.anchorY}), scale: (${n.texture.scaleX}, ${n.texture.scaleY})`,
    `  - rotation: ${n.texture.rotation}°, tint: ${n.texture.tint}, fit: ${n.texture.fit}`,
  ].join('\n');
}

function formatNoteListItem(n: NoteListItem): string {
  const linkStatus =
    n.entryLinked && n.pageLinked
      ? '✓ entry+page linked'
      : n.entryLinked
        ? '✓ entry linked, ⚠️ page orphaned'
        : n.entryId
          ? '⚠️ entry orphaned'
          : '_(no journal link)_';
  const label = n.text ? `"${n.text}"` : '_(no label)_';
  return `- \`${n.id}\` @ scene \`${n.sceneId}\` · ${label} · ${linkStatus}`;
}

export interface NoteToolOptions extends BaseToolOptions {}

export class NoteTool extends BaseTool {
  constructor(options: NoteToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'note', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'note',
        title: 'Manage Map Notes',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Manage Foundry VTT NoteDocument (map pin) objects via 5 actions (embedded-doc CRUD + list). Notes live on scenes (scene.notes collection) and optionally link to JournalEntry pages.

**Actions:**
- **create**: Place a new map note on a scene. Required: sceneId, x, y. Optional: entryId, pageId, text, iconSize, fontFamily, fontSize, textAnchor, textColor, texture, elevation, sort, global, flags. Phase 6.4 auto-link branch: pass \`journalContent: {name, pages: [...]}\` instead of entryId — handler creates a JournalEntry first, then links the note to it; response includes both note.id and journalEntry.id. Mutually exclusive with entryId. Returns full NoteViewModel with entryLinked + pageLinked booleans.
- **update**: Partial-diff update. sceneId + noteId + changes (≥1 field). Same writable surface as create. Returns full NoteViewModel.
- **delete**: Permanently remove a single note from the scene. ⚠️ Irreversible.
- **get**: Fetch a single note by sceneId + noteId. Returns full NoteViewModel including B5-aware entryLinked + pageLinked FK resolution.
- **list**: List notes on a scene. sceneId optional (defaults to active scene). Filters: filter (substring on text), entryId (match by linked entry), onlyOrphaned (notes whose entryId no longer resolves). Pagination: page/pageSize (1-100). countOnly=true for cheap inventory probe.

**FK-orphan / B5 note:** entryLinked=true means the JournalEntry exists; pageLinked=true means the specific page exists within that entry. Older Foundry data (B5) may store a page UUID in entryId — the handler resolves both cases transparently and sets entryLinked + pageLinked accordingly.

**NoteViewModel fields:** id, sceneId, entryId, pageId, entryLinked, pageLinked, x, y, elevation, sort, texture (TextureData), iconSize, text, fontFamily, fontSize, textAnchor, textColor, global, flags.

**Examples:**
- create: {action:"create", sceneId:"abc", x:500, y:300, entryId:"jid", pageId:"pid", text:"Tavern"}
- create (auto-link): {action:"create", sceneId:"abc", x:300, y:400, journalContent:{name:"Tavern Lore", pages:[{type:"text", name:"Intro", text:{content:"..."}}]}} → response includes journalEntry: {id, firstPageId}
- update: {action:"update", sceneId:"abc", noteId:"xyz", changes:{text:"Updated Label", global:true}}
- delete: {action:"delete", sceneId:"abc", noteId:"xyz"}
- get:    {action:"get", sceneId:"abc", noteId:"xyz"}
- list:   {action:"list", sceneId:"abc", onlyOrphaned:true}`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'update', 'delete', 'get', 'list'],
              description: 'The note action to perform.',
            },
            sceneId: {
              type: 'string',
              description:
                '[create/update/delete/get] Required scene document ID. [list] Optional — defaults to active scene.',
            },
            noteId: {
              type: 'string',
              description: '[update/delete/get] NoteDocument ID.',
            },
            // create/update writable fields
            entryId: {
              type: ['string', 'null'],
              description: '[create/update.changes] Linked JournalEntry document ID (nullable — pass null to unlink).',
            },
            pageId: {
              type: ['string', 'null'],
              description: '[create/update.changes] Linked JournalEntryPage ID within the entry (nullable).',
            },
            x: { type: 'number', description: '[create] Required x-coordinate.' },
            y: { type: 'number', description: '[create] Required y-coordinate.' },
            journalContent: {
              type: 'object',
              description:
                '[create] Phase 6.4 auto-link branch — pass {name: string, pages: [{type, name, ...page-specific-fields}, ...]} to create a JournalEntry first and link this note to it. Page types: "text" {text: {content}}, "image" {src, image: {caption?}}, "video" {video: {src, controls?}}, "pdf" {src}. Response gains journalEntry: {id, firstPageId}. Mutually exclusive with entryId — passing both throws NOTE_BRANCH_AMBIGUOUS.',
            },
            elevation: { type: 'number', description: '[create/update.changes] Elevation value.' },
            sort: { type: 'integer', description: '[create/update.changes] Sort order integer.' },
            texture: {
              type: 'object',
              description:
                '[create/update.changes] TextureData sub-object. {src?, anchorX?, anchorY?, offsetX?, offsetY?, fit?, scaleX?, scaleY?, rotation?, tint?, alphaThreshold?}',
            },
            iconSize: { type: 'number', minimum: 8, description: '[create/update.changes] Icon size in pixels (min 8).' },
            text: { type: 'string', description: '[create/update.changes] Map label text shown on the note pin.' },
            fontFamily: { type: 'string', description: '[create/update.changes] Font family for the label.' },
            fontSize: { type: 'number', minimum: 8, description: '[create/update.changes] Font size in pixels (min 8).' },
            textAnchor: {
              type: 'integer',
              minimum: 0,
              maximum: 4,
              description: '[create/update.changes] Text anchor position (0-4: center/bottom/top/left/right).',
            },
            textColor: { type: 'string', description: '[create/update.changes] Label color hex string.' },
            global: { type: 'boolean', description: '[create/update.changes] Whether note is visible regardless of journal ownership.' },
            flags: { type: 'object', description: '[create/update.changes] Foundry flag bag.' },
            // update
            changes: {
              type: 'object',
              description:
                '[update] Partial-diff of writable NoteDocument fields. Must contain ≥1 field. Shape mirrors create writable fields.',
            },
            // list filters
            filter: { type: 'string', description: '[list] Substring match on note label text.' },
            onlyOrphaned: {
              type: 'boolean',
              description: '[list] Return only notes whose entryId no longer resolves to an existing JournalEntry.',
            },
            page: { type: 'integer', minimum: 1, description: '[list] 1-based page number.' },
            pageSize: { type: 'integer', minimum: 1, maximum: 100, description: '[list] Items per page (default 50, max 100).' },
            countOnly: { type: 'boolean', description: '[list] Return {total} count only.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: NoteArgs) {
    this.logger.info('Executing note action', { action: args.action });
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
    }
  }

  // ── Handlers (concrete typed per CCR-Envelope-Consumer rule 3) ───────────

  private async handleCreate(args: ArgsFor<'create'>) {
    try {
      const data = await this.query<NoteCreateResponse>('note', args);
      const changedKeys = Object.keys(data.requestedChanges)
        .filter((k) => k !== 'action' && k !== 'sceneId')
        .join(', ') || '(x/y only)';
      const text =
        `📌 **Note Created**\n\n${formatNoteView(data.note)}\n\n` +
        `_Requested fields: ${changedKeys}_` +
        (data.journalEntry
          ? `\n\n🔗 **Auto-linked Journal Entry:** \`${data.journalEntry.id}\` (first page: \`${data.journalEntry.firstPageId ?? 'none'}\`)`
          : '');
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('create', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdate(args: ArgsFor<'update'>) {
    try {
      const data = await this.query<NoteUpdateResponse>('note', args);
      const text =
        `✏️ **Note Updated**\n\n**Changed fields:** ${data.changedFields.join(', ')}\n\n${formatNoteView(data.note)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('update', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDelete(args: ArgsFor<'delete'>) {
    try {
      const data = await this.query<NoteDeleteResponse>('note', args);
      const text =
        `🗑️ **Note Deleted**\n\n**ID:** \`${data.deletedId}\`\n**Scene:** \`${data.sceneId}\`\n**Remaining notes on scene:** ${data.remainingNotes}\n\n⚠️ Permanent.`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('delete', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleGet(args: ArgsFor<'get'>) {
    try {
      const data = await this.query<NoteGetResponse>('note', args);
      return { content: [{ type: 'text' as const, text: formatNoteView(data.note) }] };
    } catch (e) {
      return this.errorResponse('get', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleList(args: ArgsFor<'list'>) {
    try {
      const data = await this.query<NoteListResponse>('note', args);

      if (data.countOnly) {
        const text = `📌 **Note count**\n\n**Total:** ${data.total}${data.filterApplied ? `\n**Filter:** "${data.filterApplied}"` : ''}`;
        return { content: [{ type: 'text' as const, text }] };
      }

      if (data.notes.length === 0) {
        return { content: [{ type: 'text' as const, text: '📌 **No Notes Found**' }] };
      }

      const lines = data.notes.map(formatNoteListItem);
      const pageInfo = data.total > data.pageSize
        ? ` (page ${data.page}, ${data.total} total)`
        : ` (${data.total})`;
      const filterNote = data.filterApplied ? `\n_Filter: "${data.filterApplied}"_` : '';
      const text = `📌 **Notes**${pageInfo}\n${filterNote}\n${lines.join('\n')}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('list', e instanceof Error ? e.message : String(e));
    }
  }
}
