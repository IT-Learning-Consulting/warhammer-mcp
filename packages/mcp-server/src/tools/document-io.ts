// Phase 8 mcp_coverage_expansion — `document-io` umbrella tool (3 actions).
//
// Generic export / import-as-new / preview over 8 world document types:
//   Actor, Item, JournalEntry, Macro, Scene, Playlist, RollTable, Cards.
//
// IMPORTANT SEMANTICS (CCR-9 honesty):
//   - This is CLONE / TEMPLATE, NOT backup/restore. Ids are REGENERATED on import.
//   - World-scope only (no compendium import/export).
//   - @UUID links embedded in document text MAY break after import because they
//     reference the old document id. Cross-document UUID remap is deferred to v2.
//   - Cards round-trips lose cross-stack `origin` FK linkage (the embedded Card
//     `origin` field still points to the SOURCE stack after import).
//
// CCR-Envelope-Consumer / BUG-069: every handler uses a concrete typed generic
// on this.query<...> — never <any>. query returns BARE unwrapped data; never
// re-check a success field.

import { z } from 'zod';
import {
  DocumentIoToolInput,
  type DocumentIoExportResult,
  type DocumentIoImportResult,
  type DocumentIoPreviewResult,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type DocumentIoArgs = z.infer<typeof DocumentIoToolInput>;
type ArgsFor<A extends DocumentIoArgs['action']> = Extract<DocumentIoArgs, { action: A }>;

// ── Inline response wrappers (mirror foundry-module handler return envelopes) ──

interface ExportResponse { success: true; documentType: string; id: string; data: Record<string, unknown>; }
// newId/oldId/idMap values are cross-type polymorphic id remaps (import-as-new spans 8 doc types) — not branded ids (Phase 1 design).
interface ImportResponse { success: true; documentType: string; newId: string; oldId: string; idMap: Record<string, string>; warnings: string[]; }
interface PreviewResponse { success: true; documentType: string; name: string; embeddedCounts: Record<string, number>; hasFolder: boolean; hasOwnership: boolean; uuidLinkCount: number; warnings: string[]; }

// ── Utilities ─────────────────────────────────────────────────────────────────

function errorContent(action: string, message: string) {
  return {
    content: [{ type: 'text' as const, text: `**document-io/${action} failed**\n\n${message}` }],
    isError: true,
  };
}

function formatExport(r: DocumentIoExportResult): string {
  const dataStr = JSON.stringify(r.data, null, 2);
  return [
    `## Exported ${r.documentType} \`${r.id}\``,
    '',
    'The toObject() payload is below. Pass it to action:"import-as-new" with confirm:true to create a clone.',
    '',
    '```json',
    dataStr,
    '```',
  ].join('\n');
}

function formatImport(r: DocumentIoImportResult): string {
  const idMapLines = Object.entries(r.idMap)
    .map(([old, neu]) => `  - \`${old}\` → \`${neu}\``)
    .join('\n');
  const warnLines = r.warnings.map((w) => `- ${w}`).join('\n');
  return [
    `## Imported ${r.documentType} (new id: \`${r.newId}\`)`,
    `**Old id:** \`${r.oldId}\` → **New id:** \`${r.newId}\``,
    '',
    '**Id map:**',
    idMapLines || '  _(none — source had no _id field)_',
    '',
    '**Warnings:**',
    warnLines || '_(none)_',
  ].join('\n');
}

function formatPreview(r: DocumentIoPreviewResult): string {
  const countLines = Object.entries(r.embeddedCounts)
    .map(([k, v]) => `  - ${k}: ${v}`)
    .join('\n');
  const warnLines = r.warnings.map((w) => `- ${w}`).join('\n');
  return [
    `## Preview — ${r.documentType}: "${r.name}"`,
    `**Embedded counts:**`,
    countLines || '  _(none)_',
    `**Has folder:** ${r.hasFolder ? 'yes' : 'no'} · **Has custom ownership:** ${r.hasOwnership ? 'yes' : 'no'}`,
    `**@UUID links:** ${r.uuidLinkCount}`,
    '',
    '_This is a preview only — no document was created._',
    '',
    '**Warnings:**',
    warnLines || '_(none)_',
  ].join('\n');
}

export interface DocumentIoToolOptions extends BaseToolOptions {}

export class DocumentIoTool extends BaseTool {
  constructor(options: DocumentIoToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'document-io',
        title: 'Document Export / Import / Preview',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Export, import-as-new, or preview Foundry world documents as inline JSON. Supports 8 document types: Actor, Item, JournalEntry, Macro, Scene, Playlist, RollTable, Cards.

IMPORTANT: This tool implements CLONE / TEMPLATE semantics, NOT backup/restore.
- Ids are REGENERATED on import (keepId is false). Do NOT use as a faithful backup.
- World-scope only (no compendium packs).
- @UUID links in the document text reference the OLD id and will need re-linking after import (v2 remap deferred).
- Cards round-trips: embedded Card "origin" fields still reference the SOURCE stack after import. Cross-stack deal/draw/recall will not work correctly between the cloned and original stacks.

**Actions:**

- **export**: Read-only. Returns the full toObject() JSON of an existing document. No confirm required.
  Required: documentType, id.

- **import-as-new**: Write. Validates the payload type, strips _id/sort/folder/ownership (per flags), calls DocClass.create, re-reads and verifies the persisted document, returns {newId, oldId, idMap, warnings[]}. confirm:true is required (CCR-4).
  Required: documentType, data (toObject payload), confirm:true.
  Optional: preserveOwnership (default false — clears ownership on import), targetFolderId (place the new doc in this folder; omit to clear folder).

- **preview**: Read-only. Constructs the document in-memory (no DB write) and returns {name, embeddedCounts, hasFolder, hasOwnership, uuidLinkCount, warnings[]}. No confirm required.
  Required: documentType, data.

**Examples:**
- {action:"export", documentType:"Actor", id:"5kYn49mOZa9krFJ0"}
- {action:"import-as-new", documentType:"Actor", data:{...}, confirm:true}
- {action:"import-as-new", documentType:"Macro", data:{...}, preserveOwnership:true, targetFolderId:"abc", confirm:true}
- {action:"preview", documentType:"Scene", data:{...}}`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['export', 'import-as-new', 'preview'],
              description: 'The document-io action: export (read toObject JSON) | import-as-new (clone+create) | preview (in-memory, no write).',
            },
            documentType: {
              type: 'string',
              enum: ['Actor', 'Item', 'JournalEntry', 'Macro', 'Scene', 'Playlist', 'RollTable', 'Cards'],
              description: 'The Foundry document type. Must match the payload for import-as-new and preview.',
            },
            id: {
              type: 'string',
              description: '[export] The world id of the document to export.',
            },
            data: {
              type: 'object',
              description: '[import-as-new, preview] The document payload (toObject() output). Arbitrary keys accepted.',
            },
            preserveOwnership: {
              type: 'boolean',
              description: '[import-as-new] When true, copy the source ownership record to the new document (default false — clears ownership).',
            },
            targetFolderId: {
              type: 'string',
              description: '[import-as-new] Place the new document in this folder id. Omit to clear the folder.',
            },
            confirm: {
              type: 'boolean',
              description: '[import-as-new] Must be true to execute the write (CCR-4).',
            },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: DocumentIoArgs) {
    this.logger.info('Executing document-io action', { action: args.action });
    switch (args.action) {
      case 'export': return this.handleExport(args);
      case 'import-as-new': return this.handleImportAsNew(args);
      case 'preview': return this.handlePreview(args);
    }
  }

  // ── Action handlers ───────────────────────────────────────────────────────

  private async handleExport(args: ArgsFor<'export'>) {
    try {
      const data = await this.query<ExportResponse>('document-io', args);
      return { content: [{ type: 'text' as const, text: formatExport(data) }] };
    } catch (e) { return errorContent('export', e instanceof Error ? e.message : String(e)); }
  }

  private async handleImportAsNew(args: ArgsFor<'import-as-new'>) {
    try {
      const data = await this.query<ImportResponse>('document-io', args);
      return { content: [{ type: 'text' as const, text: formatImport(data) }] };
    } catch (e) { return errorContent('import-as-new', e instanceof Error ? e.message : String(e)); }
  }

  private async handlePreview(args: ArgsFor<'preview'>) {
    try {
      const data = await this.query<PreviewResponse>('document-io', args);
      return { content: [{ type: 'text' as const, text: formatPreview(data) }] };
    } catch (e) { return errorContent('preview', e instanceof Error ? e.message : String(e)); }
  }
}
