// Phase 9 mcp_crud_expansion — Compendium umbrella tool.
//
// Wraps `dispatchCompendium` (foundry-module handler). 10 actions:
// create-pack / update-pack / read-pack / add-document-to-pack /
// update-document-in-pack / read-document-from-pack + in-pack folder
// management (create/list/update/delete-folder-in-pack, added 2026-06-11).
// HC3 forbids pack-delete + document-delete — grep-enforced absent. NOTE:
// delete-folder-in-pack IS present and HC3-OK (a folder is organizational
// metadata, not a pack or document; deleteContents defaults false).
//
// **CCR-Envelope-Consumer / DP-15:** every handler uses a concrete typed
// generic on `this.query<...>` — no `<any>`. BUG-069: `this.query<T>`
// returns BARE unwrapped data; never check `.success` on the return.
//
// **DP-19 formatter completeness:** every field claimed by the per-action
// description below is grep-findable in the formatter functions.
//
// **Phase 9 post-probe corrections (phase9_pre_plan.md §Post-probe corrections):**
//  - PC1: module-scope create silently downgrades — handler refuses; tool
//    description warns callers.
//  - PR2: `add-document-to-pack` uuid-source preserves source ID — handler
//    rejects collision with COMPENDIUM_DOCUMENT_ALREADY_EXISTS.

import { z } from 'zod';
import { truncatedJoin } from '../utils/truncate.js';
import {
  CompendiumToolInput,
  FolderId,
  FoundryUuid,
  PackId,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type CompendiumArgs = z.infer<typeof CompendiumToolInput>;
type ArgsFor<A extends CompendiumArgs['action']> = Extract<CompendiumArgs, { action: A }>;

// ── Response interfaces (mirror foundry-module handler view-models) ───────

interface PackMetadataView {
  id: string;
  name: string;
  label: string;
  type: string;
  system: string | null;
  packageType: string;
  packageName: string;
  path: string | null;
  locked: boolean;
  folder: FolderId | null;
  sort: number;
}

interface CompendiumCreatePackResponse {
  packId: PackId;
  metadata: PackMetadataView;
  entryCount: number;
  ownership: Record<string, string>;
}

interface CompendiumUpdatePackResponse {
  packId: PackId;
  changedFields: string[];
  metadata: PackMetadataView;
}

interface PackEntrySummary {
  id: string;
  name: string;
  type: string;
  img: string | null;
  uuid: FoundryUuid;
  folder: FolderId | null;
}

interface PackFolderSummary {
  id: string;
  name: string;
  color: string | null;
  sort: number;
  folder: FolderId | null;
  depth: number;
}

interface CompendiumReadPackResponse {
  packId: PackId;
  metadata: PackMetadataView;
  totalEntries: number;
  page: number;
  pageSize: number;
  pageCount: number;
  entries: PackEntrySummary[];
  folders: PackFolderSummary[];
}

interface CompendiumCreateFolderInPackResponse {
  packId: PackId;
  folderId: FolderId;
  name: string;
  uuid: FoundryUuid;
  depth: number;
}

interface CompendiumListFoldersInPackResponse {
  packId: PackId;
  folders: PackFolderSummary[];
}

interface CompendiumUpdateFolderInPackResponse {
  packId: PackId;
  folderId: FolderId;
  changedFields: string[];
}

interface CompendiumDeleteFolderInPackResponse {
  packId: PackId;
  folderId: FolderId;
  deletedFolderIds: FolderId[];
  unParentedDocs: number;
  deletedDocs: number;
}

interface CompendiumAddDocumentResponse {
  packId: PackId;
  documentId: string; // not a branded id (polymorphic / non-document)
  documentUuid: FoundryUuid;
  name: string;
  type: string;
  entryCount: number;
  warnings: string[];
}

interface CompendiumUpdateDocumentResponse {
  packId: PackId;
  documentId: string; // not a branded id (polymorphic / non-document)
  documentUuid: FoundryUuid;
  changedFields: string[];
}

interface CompendiumReadDocumentResponse {
  packId: PackId;
  documentId: string; // not a branded id (polymorphic / non-document)
  documentUuid: FoundryUuid;
  data: Record<string, unknown>;
}

// ── Utilities ─────────────────────────────────────────────────────────────


function formatPackMetadata(m: PackMetadataView): string {
  return [
    `- **id:** \`${m.id}\``,
    `- **name:** ${m.name} · **label:** ${m.label}`,
    `- **type:** ${m.type} · **system:** ${m.system ?? '_(none)_'}`,
    `- **packageType:** ${m.packageType} · **packageName:** ${m.packageName}`,
    `- **path:** ${m.path ?? '_(auto)_'} · **locked:** ${m.locked ? 'yes' : 'no'}`,
    `- **folder:** ${m.folder ?? '_(none)_'} · **sort:** ${m.sort}`,
  ].join('\n');
}

function formatCreatePackResponse(r: CompendiumCreatePackResponse): string {
  const ownershipKeys = Object.keys(r.ownership).length;
  return [
    `## Compendium Pack Created`,
    ``,
    `- **packId:** \`${r.packId}\``,
    `- **entryCount:** ${r.entryCount}`,
    `- **ownership keys:** ${ownershipKeys} (${Object.keys(r.ownership).join(', ') || '_(none)_'})`,
    ``,
    `### Metadata`,
    formatPackMetadata(r.metadata),
  ].join('\n');
}

function formatUpdatePackResponse(r: CompendiumUpdatePackResponse): string {
  return [
    `## Compendium Pack Updated`,
    ``,
    `- **packId:** \`${r.packId}\``,
    `- **changedFields:** ${r.changedFields.join(', ') || '_(none verified)_'}`,
    ``,
    `### Metadata`,
    formatPackMetadata(r.metadata),
  ].join('\n');
}

function formatPackEntry(e: PackEntrySummary): string {
  return `- \`${e.id}\` ${e.name} · type=${e.type} · folder=${e.folder ?? '_(root)_'} · uuid=\`${e.uuid}\`${e.img ? ` · img=${e.img}` : ''}`;
}

function formatPackFolder(f: PackFolderSummary): string {
  return `- \`${f.id}\` ${f.name} · depth=${f.depth} · parent=${f.folder ?? '_(root)_'}${f.color ? ` · color=${f.color}` : ''} · sort=${f.sort}`;
}

function formatReadPackResponse(r: CompendiumReadPackResponse): string {
  const lines: string[] = [
    `## Compendium Pack \`${r.packId}\``,
    ``,
    `**Pagination:** page ${r.page} of ${r.pageCount} · pageSize ${r.pageSize} · totalEntries ${r.totalEntries}`,
    ``,
    `### Metadata`,
    formatPackMetadata(r.metadata),
    ``,
    `### In-pack folders (${r.folders.length})`,
  ];
  if (r.folders.length === 0) {
    lines.push(`_(none)_`);
  } else {
    for (const f of r.folders) lines.push(formatPackFolder(f));
  }
  lines.push(``, `### Entries (${r.entries.length})`);
  if (r.entries.length === 0) {
    lines.push(`_(empty page)_`);
  } else {
    for (const e of r.entries) lines.push(formatPackEntry(e));
  }
  return lines.join('\n');
}

function formatCreateFolderInPackResponse(r: CompendiumCreateFolderInPackResponse): string {
  return [
    `## In-Pack Folder Created`,
    ``,
    `- **packId:** \`${r.packId}\``,
    `- **folderId:** \`${r.folderId}\` · **name:** ${r.name}`,
    `- **uuid:** \`${r.uuid}\``,
    `- **depth:** ${r.depth}`,
  ].join('\n');
}

function formatListFoldersInPackResponse(r: CompendiumListFoldersInPackResponse): string {
  const lines: string[] = [
    `## In-Pack Folders \`${r.packId}\` (${r.folders.length})`,
    ``,
  ];
  if (r.folders.length === 0) {
    lines.push(`_(no folders in this pack)_`);
  } else {
    for (const f of r.folders) lines.push(formatPackFolder(f));
  }
  return lines.join('\n');
}

function formatUpdateFolderInPackResponse(r: CompendiumUpdateFolderInPackResponse): string {
  return [
    `## In-Pack Folder Updated`,
    ``,
    `- **packId:** \`${r.packId}\``,
    `- **folderId:** \`${r.folderId}\``,
    `- **changedFields:** ${r.changedFields.join(', ') || '_(none verified)_'}`,
  ].join('\n');
}

function formatDeleteFolderInPackResponse(r: CompendiumDeleteFolderInPackResponse): string {
  return [
    `## In-Pack Folder Deleted`,
    ``,
    `- **packId:** \`${r.packId}\``,
    `- **folderId:** \`${r.folderId}\``,
    `- **deletedFolderIds (${r.deletedFolderIds.length}):** ${r.deletedFolderIds.join(', ')}`,
    `- **unParentedDocs:** ${r.unParentedDocs} · **deletedDocs:** ${r.deletedDocs}`,
  ].join('\n');
}

function formatAddDocumentResponse(r: CompendiumAddDocumentResponse): string {
  const lines: string[] = [
    `## Document Added to Compendium`,
    ``,
    `- **packId:** \`${r.packId}\``,
    `- **documentId:** \`${r.documentId}\` · **name:** ${r.name} · **type:** ${r.type}`,
    `- **documentUuid:** \`${r.documentUuid}\``,
    `- **entryCount (post-add):** ${r.entryCount}`,
  ];
  if (r.warnings.length > 0) {
    lines.push(``, `### Warnings`);
    for (const w of r.warnings) lines.push(`- ${w}`);
  }
  return lines.join('\n');
}

function formatUpdateDocumentResponse(r: CompendiumUpdateDocumentResponse): string {
  return [
    `## Compendium Document Updated`,
    ``,
    `- **packId:** \`${r.packId}\``,
    `- **documentId:** \`${r.documentId}\``,
    `- **documentUuid:** \`${r.documentUuid}\``,
    `- **changedFields:** ${r.changedFields.join(', ') || '_(none verified)_'}`,
  ].join('\n');
}

function formatReadDocumentResponse(r: CompendiumReadDocumentResponse): string {
  const dataKeys = Object.keys(r.data);
  const preview = truncatedJoin(dataKeys, 25, ', ', (n) => `, … (+${n} more)`);
  return [
    `## Compendium Document \`${r.documentId}\``,
    ``,
    `- **packId:** \`${r.packId}\``,
    `- **documentUuid:** \`${r.documentUuid}\``,
    `- **top-level data keys (${dataKeys.length}):** ${preview || '_(empty)_'}`,
    ``,
    `### Full data`,
    '```json',
    JSON.stringify(r.data, null, 2),
    '```',
  ].join('\n');
}

export interface CompendiumUmbrellaToolOptions extends BaseToolOptions {}

export class CompendiumUmbrellaTools extends BaseTool {
  constructor(options: CompendiumUmbrellaToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'compendium', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'compendium',
        title: 'Manage Compendium packs + documents (CRU; NO DELETE per HC3)',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Manage Foundry VTT Compendium packs and their contained documents. 10 actions span pack CRU + document CRU + in-pack folder management. **HC3: NO pack-delete and NO document-delete** — packs are not deleted by this tool (remove via Foundry's compendium sidebar); documents are not deleted. delete-folder-in-pack IS available (a folder is organizational metadata, not a pack or document — deleteContents defaults false so contained docs survive at pack root).

**Actions:**
- **create-pack**: Create a new world-scope compendium pack. Required: name (slug), label (display title), type (Actor/Item/JournalEntry/RollTable/Macro/Scene/Playlist). Optional: system (defaults to game.system.id), scope ("world" only — module-scope refused per probe finding: Foundry silently downgrades), moduleId (required iff scope==="module"). Returns packId, metadata, entryCount, ownership.
- **update-pack**: Update pack metadata via pack.configure(). packId + changes (≥1 of: folder, sort, locked). Returns changedFields + post-update metadata. NOTE (BUG-099, 2026-05-18): \`label\` is NOT configurable post-create — Foundry v13's pack.configure() silently drops label changes; schema rejects label at the input layer. To rename a world-scope pack, delete + re-create via Foundry UI.
- **read-pack**: List a pack's entries with optional pagination. packId, optional page (1-based) + pageSize (1-500, default 100). Returns metadata, totalEntries, page, pageSize, pageCount, entries[{id,name,type,img,uuid,folder}], and folders[{id,name,color,sort,folder,depth}] (the full in-pack folder tree — not paginated). Each entry's \`folder\` is its in-pack folder id (null = pack root).
- **add-document-to-pack**: Add a document to a pack. packId + source + optional folder. Two source kinds: {kind:"uuid", uuid:"<world-doc-uuid>"} imports a hydrated world document (COPY semantics; source persists; pack collision rejected via COMPENDIUM_DOCUMENT_ALREADY_EXISTS since importDocument preserves source ID); {kind:"inline", data:{...}} creates a doc inline via CONFIG[type].documentClass.create(). Optional \`folder\`: an in-pack folder id to place the document into (must already exist — create via create-folder-in-pack first; importDocument otherwise lands the doc at pack root regardless of its world folder). Returns documentId, documentUuid, name, type, entryCount, warnings.
- **update-document-in-pack**: Update a document inside a pack. packId + documentId + changes (free-form Record). Renaming via changes.name is allowed; also accepts img, sort, system.*, flags.* paths, and \`folder\` (move the document to a different in-pack folder, or null for root). system/flags paths skip strict post-verify (appear in changedFields unconditionally). Returns documentUuid + changedFields. DP-16 post-verify on non-system/non-flags fields.
- **read-document-from-pack**: Fetch a hydrated document's full data. packId + documentId. Returns documentUuid + data (toObject() output).
- **create-folder-in-pack**: Create a folder INSIDE a pack (organizes pack entries; distinct from the pack's sidebar folder). packId + folderName. Optional: parentFolderId (nest under an existing in-pack folder), color (hex), sort (int). Folder type is derived from the pack's document type. Pack folder depth cap is 3 (one less than world folders); exceeding it rejects with COMPENDIUM_FOLDER_MAX_DEPTH_EXCEEDED. Returns folderId, name, uuid, depth.
- **list-folders-in-pack**: List all folders inside a pack. packId. Returns folders[{id,name,color,sort,folder,depth}] (depth 1 = root-level). Use this to discover folder ids for add-document-to-pack placement.
- **update-folder-in-pack**: Rename / recolor / reparent / re-sort an in-pack folder. packId + folderId + changes (≥1 of: folderName, color (nullable), sort, parentFolderId (nullable for root)). type is immutable. Reparent is depth-checked and cycle-checked (cannot move a folder under itself or a descendant). Returns changedFields.
- **delete-folder-in-pack**: Delete a folder inside a pack. packId + folderId + confirm:true (CCR-Delete-Safety). Optional deleteContents (default false). deleteContents:false un-parents contained documents (and docs in subfolders) to the pack root, then removes the folder + its subfolders; deleteContents:true deletes those documents instead. HC3-OK: a folder is organizational metadata, not a pack or document. Returns deletedFolderIds, unParentedDocs, deletedDocs.

**UUID format (v13):** \`Compendium.<packageType>.<packageName>.<DocType>.<docId>\` — 5 segments with the \`Compendium.\` prefix. Example: \`Compendium.world.homebrew-weapons.Item.NugYbojzck5Z92TQ\`. Module-scope packs follow the same shape (e.g. \`Compendium.wfrp4e-core.actors.Actor.<id>\`).

**Pack-ID format:** world-scope = \`world.<name>\`; module-scope = \`<moduleId>.<packName>\`.

**Lock semantics:** locked packs reject all writes with COMPENDIUM_PACK_LOCKED before any Foundry call is made. WFRP4e core packs (\`wfrp4e-core.*\`) are locked by default; create a world-scope pack for homebrew authoring.

**HC3 (no delete):** This tool does NOT expose delete-pack or delete-document-from-pack. Attempting either via the action discriminator rejects at Zod parse time. Pack deletion is a Foundry UI operation (file-level state) and outside the MCP write surface.

**Examples:**
- create-pack: {action:"create-pack", name:"homebrew-weapons", label:"Homebrew Weapons", type:"Item"}
- update-pack: {action:"update-pack", packId:"world.homebrew-weapons", changes:{locked:false, sort:100}}
- read-pack: {action:"read-pack", packId:"wfrp4e-core.actors", page:1, pageSize:20}
- add-document-to-pack (uuid): {action:"add-document-to-pack", packId:"world.homebrew-weapons", source:{kind:"uuid", uuid:"Item.abc123"}}
- add-document-to-pack (inline): {action:"add-document-to-pack", packId:"world.homebrew-weapons", source:{kind:"inline", data:{name:"Sword of Plot", type:"weapon"}}}
- update-document-in-pack: {action:"update-document-in-pack", packId:"world.homebrew-weapons", documentId:"def456", changes:{name:"Renamed Item"}}
- read-document-from-pack: {action:"read-document-from-pack", packId:"wfrp4e-core.actors", documentId:"zzdOpKqBC28J66Mn"}`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'create-pack',
                'update-pack',
                'read-pack',
                'add-document-to-pack',
                'update-document-in-pack',
                'read-document-from-pack',
                'create-folder-in-pack',
                'list-folders-in-pack',
                'update-folder-in-pack',
                'delete-folder-in-pack',
              ],
              description: 'The compendium action to perform. HC3: no delete-pack, no delete-document-from-pack (delete-folder-in-pack IS allowed — folder metadata only).',
            },
            // create-pack
            name: {
              type: 'string',
              minLength: 1,
              description: '[create-pack] Required pack name slug (e.g. "homebrew-weapons"). Becomes \`world.<name>\` for world-scope.',
            },
            label: {
              type: 'string',
              description: '[create-pack] Required human-readable label. NOT accepted on update-pack — Foundry v13 silently drops label changes; rename via Foundry UI (BUG-099).',
            },
            type: {
              type: 'string',
              enum: ['Actor', 'Item', 'JournalEntry', 'RollTable', 'Macro', 'Scene', 'Playlist'],
              description: '[create-pack] Required pack document-type. Determines which CONFIG[type].documentClass is used for inline-data creation.',
            },
            system: {
              type: 'string',
              description: '[create-pack] Optional system id. Defaults to game.system.id ("wfrp4e" in this vault).',
            },
            scope: {
              type: 'string',
              enum: ['world', 'module'],
              description: '[create-pack] Pack scope. Default "world". "module" is REFUSED at runtime (Foundry silently downgrades — declare module-scope packs in module.json manifest instead).',
            },
            moduleId: {
              type: 'string',
              description: '[create-pack] Required iff scope === "module". Module id that owns the pack.',
            },
            // pack-update + pack-read + doc-ops common
            packId: {
              type: 'string',
              description: '[update-pack/read-pack/add-document-to-pack/update-document-in-pack/read-document-from-pack] Pack id (e.g. "world.homebrew-weapons" or "wfrp4e-core.actors").',
            },
            // update-pack
            changes: {
              type: 'object',
              description: '[update-pack] Pack metadata diff (≥1 of: folder (nullable), sort (int), locked (bool)). NOTE: `label` rejected — Foundry v13 silently drops it (BUG-099). [update-document-in-pack] Free-form document changes Record. Renaming via changes.name is allowed. [update-folder-in-pack] In-pack folder diff (≥1 of: folderName, color (nullable), sort, parentFolderId (nullable)). type is immutable.',
            },
            // read-pack pagination
            page: {
              type: 'integer',
              minimum: 1,
              description: '[read-pack] 1-based page number. Default 1.',
            },
            pageSize: {
              type: 'integer',
              minimum: 1,
              maximum: 500,
              description: '[read-pack] Items per page (default 100, max 500). Slices pack.index client-side; no Foundry-native pagination.',
            },
            // add-document-to-pack
            source: {
              type: 'object',
              description: '[add-document-to-pack] Discriminated source. Either {kind:"uuid", uuid:"<world-doc-uuid>"} or {kind:"inline", data:{...}}. UUID path uses pack.importDocument (COPY semantics; source-ID preserved → collision rejected). Inline path uses CONFIG[pack.type].documentClass.create(data, {pack: packId}).',
            },
            // update-document-in-pack + read-document-from-pack
            documentId: {
              type: 'string',
              description: '[update-document-in-pack/read-document-from-pack] Document id inside the pack. Last segment of the 5-segment UUID.',
            },
            // add-document-to-pack placement + folder actions
            folder: {
              type: 'string',
              description: '[add-document-to-pack] Optional in-pack folder id to place the imported document into. Must already exist (create via create-folder-in-pack).',
            },
            folderName: {
              type: 'string',
              minLength: 1,
              description: '[create-folder-in-pack] Required name for the new in-pack folder.',
            },
            folderId: {
              type: 'string',
              description: '[update-folder-in-pack/delete-folder-in-pack] Id of the in-pack folder to update or delete.',
            },
            parentFolderId: {
              type: 'string',
              description: '[create-folder-in-pack] Optional parent in-pack folder id to nest under. (For reparenting an existing folder, use update-folder-in-pack changes.parentFolderId.) Pack folder depth cap is 3.',
            },
            color: {
              type: 'string',
              description: '[create-folder-in-pack] Optional hex color for the folder (e.g. "#aa0000").',
            },
            sort: {
              type: 'integer',
              description: '[create-folder-in-pack] Optional manual sort index for the folder.',
            },
            confirm: {
              type: 'boolean',
              description: '[delete-folder-in-pack] Must be true to proceed (CCR-Delete-Safety).',
            },
            deleteContents: {
              type: 'boolean',
              description: '[delete-folder-in-pack] If true, delete documents contained in the folder (and its subfolders) too. If false (default), un-parent them to the pack root and only remove the folders.',
            },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: CompendiumArgs) {
    this.logger.info('Executing compendium action', { action: args.action });
    switch (args.action) {
      case 'create-pack':
        return this.handleCreatePack(args);
      case 'update-pack':
        return this.handleUpdatePack(args);
      case 'read-pack':
        return this.handleReadPack(args);
      case 'add-document-to-pack':
        return this.handleAddDocumentToPack(args);
      case 'update-document-in-pack':
        return this.handleUpdateDocumentInPack(args);
      case 'read-document-from-pack':
        return this.handleReadDocumentFromPack(args);
      case 'create-folder-in-pack':
        return this.handleCreateFolderInPack(args);
      case 'list-folders-in-pack':
        return this.handleListFoldersInPack(args);
      case 'update-folder-in-pack':
        return this.handleUpdateFolderInPack(args);
      case 'delete-folder-in-pack':
        return this.handleDeleteFolderInPack(args);
    }
  }

  // ── Per-action handlers (concrete typed per CCR-Envelope-Consumer rule 3) ──

  private async handleCreatePack(args: ArgsFor<'create-pack'>) {
    try {
      const data = await this.query<CompendiumCreatePackResponse>('compendium', args);
      return { content: [{ type: 'text' as const, text: formatCreatePackResponse(data) }] };
    } catch (e) {
      return this.errorResponse('create-pack', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdatePack(args: ArgsFor<'update-pack'>) {
    try {
      const data = await this.query<CompendiumUpdatePackResponse>('compendium', args);
      return { content: [{ type: 'text' as const, text: formatUpdatePackResponse(data) }] };
    } catch (e) {
      return this.errorResponse('update-pack', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleReadPack(args: ArgsFor<'read-pack'>) {
    try {
      const data = await this.query<CompendiumReadPackResponse>('compendium', args);
      return { content: [{ type: 'text' as const, text: formatReadPackResponse(data) }] };
    } catch (e) {
      return this.errorResponse('read-pack', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleAddDocumentToPack(args: ArgsFor<'add-document-to-pack'>) {
    try {
      const data = await this.query<CompendiumAddDocumentResponse>('compendium', args);
      return { content: [{ type: 'text' as const, text: formatAddDocumentResponse(data) }] };
    } catch (e) {
      return this.errorResponse('add-document-to-pack', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdateDocumentInPack(args: ArgsFor<'update-document-in-pack'>) {
    try {
      const data = await this.query<CompendiumUpdateDocumentResponse>('compendium', args);
      return { content: [{ type: 'text' as const, text: formatUpdateDocumentResponse(data) }] };
    } catch (e) {
      return this.errorResponse('update-document-in-pack', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleReadDocumentFromPack(args: ArgsFor<'read-document-from-pack'>) {
    try {
      const data = await this.query<CompendiumReadDocumentResponse>('compendium', args);
      return { content: [{ type: 'text' as const, text: formatReadDocumentResponse(data) }] };
    } catch (e) {
      return this.errorResponse('read-document-from-pack', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleCreateFolderInPack(args: ArgsFor<'create-folder-in-pack'>) {
    try {
      const data = await this.query<CompendiumCreateFolderInPackResponse>('compendium', args);
      return { content: [{ type: 'text' as const, text: formatCreateFolderInPackResponse(data) }] };
    } catch (e) {
      return this.errorResponse('create-folder-in-pack', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleListFoldersInPack(args: ArgsFor<'list-folders-in-pack'>) {
    try {
      const data = await this.query<CompendiumListFoldersInPackResponse>('compendium', args);
      return { content: [{ type: 'text' as const, text: formatListFoldersInPackResponse(data) }] };
    } catch (e) {
      return this.errorResponse('list-folders-in-pack', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdateFolderInPack(args: ArgsFor<'update-folder-in-pack'>) {
    try {
      const data = await this.query<CompendiumUpdateFolderInPackResponse>('compendium', args);
      return { content: [{ type: 'text' as const, text: formatUpdateFolderInPackResponse(data) }] };
    } catch (e) {
      return this.errorResponse('update-folder-in-pack', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDeleteFolderInPack(args: ArgsFor<'delete-folder-in-pack'>) {
    try {
      const data = await this.query<CompendiumDeleteFolderInPackResponse>('compendium', args);
      return { content: [{ type: 'text' as const, text: formatDeleteFolderInPackResponse(data) }] };
    } catch (e) {
      return this.errorResponse('delete-folder-in-pack', e instanceof Error ? e.message : String(e));
    }
  }
}
