// Phase 10 mcp_crud_expansion — Cross-doc FK audit + repair umbrella (mcp-server side).
//
// 3 actions in a single discriminated-union umbrella:
//   - audit-orphans:   paginated world walk; returns FkOrphanEntry[]
//   - audit-document:  single-doc inbound + outbound FK audit
//   - repair-orphans:  GM-only mutation; clears stale FKs; CCR-Delete-Safety
//                      preview→confirm→(dryRun)→confirm flow handled by skill
//
// CCR-Envelope-Consumer §3: every `this.query<T>` uses a concrete response
// type; no `<any>` anywhere in this file. Per BaseTool contract: query returns
// the bare unwrapped data and throws on failure.

import { z } from 'zod';
import {
    CrossDocFkInput,
    type AuditOrphansResponse,
    type AuditDocumentResponse,
    type RepairOrphansResponse,
    type FkOrphanEntry,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type CrossDocFkArgs = z.infer<typeof CrossDocFkInput>;
type ArgsFor<A extends CrossDocFkArgs['action']> = Extract<CrossDocFkArgs, { action: A }>;

function errorContent(action: string, message: string) {
    return {
        content: [{ type: 'text' as const, text: `cross-doc-fk/${action} failed: ${message}` }],
        isError: true,
    };
}

// ============================================================================
// Formatters
// ============================================================================

function formatOrphanLine(o: FkOrphanEntry): string {
    const name = o.sourceDocName ? ` ${o.sourceDocName}` : '';
    const tags = [
        o.isHotbarSlot ? '[HOTBAR]' : null,
        o.isCompendiumRef ? '[COMPENDIUM]' : null,
    ].filter(Boolean).join(' ');
    return `- ${o.sourceDocType} \`${o.sourceDocId}\`${name}: field \`${o.sourceField}\` → stale ref \`${o.refId}\`${tags ? ` ${tags}` : ''} [ORPHAN]`;
}

function groupBySourceDoc(orphans: FkOrphanEntry[]): Map<string, FkOrphanEntry[]> {
    const groups = new Map<string, FkOrphanEntry[]>();
    for (const o of orphans) {
        const key = o.sourceDocType;
        const arr = groups.get(key) ?? [];
        arr.push(o);
        groups.set(key, arr);
    }
    return groups;
}

function formatAuditOrphansResponse(data: AuditOrphansResponse): string {
    if (data.totalOrphans === 0) {
        return [
            `## Cross-doc FK audit`,
            ``,
            `**Pagination:** page ${data.page} of ${data.pageCount} · pageSize ${data.pageSize} · totalOrphans ${data.totalOrphans}`,
            ``,
            `_No FK orphans found across the world catalog._`,
            ``,
            `**Orphan count:** 0`,
            data.includeCompendiums ? `_Compendium refs included._` : `_World refs only — pass \`includeCompendiums: true\` to scan compendium-prefixed UUIDs._`,
        ].join('\n');
    }

    const groups = groupBySourceDoc(data.orphans);
    const sections: string[] = [];
    for (const [docType, list] of groups) {
        sections.push(`### ${docType} (${list.length})`);
        sections.push(list.map(formatOrphanLine).join('\n'));
    }

    return [
        `## Cross-doc FK audit`,
        ``,
        `**Pagination:** page ${data.page} of ${data.pageCount} · pageSize ${data.pageSize} · totalOrphans ${data.totalOrphans}`,
        ``,
        sections.join('\n\n'),
        ``,
        `**Orphan count:** ${data.orphanCount}`,
        data.includeCompendiums ? `_Compendium refs included._` : `_World refs only._`,
        ``,
        `Use \`/wfrp-cleanup-fks bulk-repair\` to clear these (preview → dryRun → confirm flow).`,
    ].join('\n');
}

function formatAuditDocumentResponse(data: AuditDocumentResponse): string {
    const name = data.documentName ? ` ${data.documentName}` : '';
    const lines: string[] = [
        `## Cross-doc FK audit — ${data.documentType} \`${data.documentId}\`${name}`,
        ``,
        `**Outbound stale FKs (this doc points at deleted targets):** ${data.outboundCount}`,
        `**Inbound refs (other docs that point AT this doc; stale-if-deleted):** ${data.inboundCount}`,
        ``,
    ];

    if (data.outbound.length > 0) {
        lines.push(`### Outbound orphans`);
        lines.push(data.outbound.map(formatOrphanLine).join('\n'));
        lines.push(``);
    }

    if (data.inbound.length > 0) {
        lines.push(`### Inbound refs (would orphan on delete)`);
        lines.push(data.inbound.map(formatOrphanLine).join('\n'));
        lines.push(``);
    }

    if (data.outbound.length === 0 && data.inbound.length === 0) {
        lines.push(`_No FK relationships found for this doc._`);
    }

    return lines.join('\n');
}

function formatRepairOrphansResponse(data: RepairOrphansResponse): string {
    const header = data.dryRun ? `## Repair Orphans (DRY RUN)` : `## Repair Orphans`;
    const banner = data.dryRun
        ? `_DRY RUN — no mutations performed. Re-invoke with \`dryRun: false\` to apply._`
        : ``;

    const linesByStatus = {
        cleared: data.results.filter((r) => r.status === 'cleared'),
        wouldClear: data.results.filter((r) => r.status === 'would-clear'),
        skipped: data.results.filter((r) => r.status === 'skipped'),
    };

    const sections: string[] = [];
    if (linesByStatus.cleared.length > 0) {
        sections.push(`### Cleared (${linesByStatus.cleared.length})`);
        sections.push(linesByStatus.cleared.map((r) =>
            `- ${r.sourceDocType} \`${r.sourceDocId}\` field \`${r.sourceField}\` → stale \`${r.refId}\` ✓`
        ).join('\n'));
    }
    if (linesByStatus.wouldClear.length > 0) {
        sections.push(`### Would clear (${linesByStatus.wouldClear.length})`);
        sections.push(linesByStatus.wouldClear.map((r) =>
            `- ${r.sourceDocType} \`${r.sourceDocId}\` field \`${r.sourceField}\` → stale \`${r.refId}\``
        ).join('\n'));
    }
    if (linesByStatus.skipped.length > 0) {
        sections.push(`### Skipped (${linesByStatus.skipped.length})`);
        sections.push(linesByStatus.skipped.map((r) =>
            `- ${r.sourceDocType} \`${r.sourceDocId}\` field \`${r.sourceField}\`: ${r.skipReason ?? '_(no reason)_'}`
        ).join('\n'));
    }

    return [
        header,
        banner,
        ``,
        `- **Requested:** ${data.requestedCount}`,
        `- **Cleared:** ${data.clearedCount}`,
        `- **Skipped:** ${data.skippedCount}`,
        ``,
        sections.join('\n\n') || `_No results._`,
    ].filter((l) => l !== '').join('\n');
}

// ============================================================================
// Tool class
// ============================================================================

export interface CrossDocFkToolOptions extends BaseToolOptions { }

export class CrossDocFkTool extends BaseTool {
    constructor(options: CrossDocFkToolOptions) {
        super(options);
    }

    getToolDefinitions() {
        return [
            {
                name: 'cross-doc-fk',
                title: 'Audit and repair cross-document foreign-key references',
                annotations: {
                    readOnlyHint: false,
                    destructiveHint: false,
                    idempotentHint: false,
                    openWorldHint: true,
                },
                description:
                    `Audit and repair stale cross-document foreign-key references across the world catalog. Phase 10 ships 3 actions over the FK catalog at shared/src/fk-catalog.ts.

Actions: audit-orphans, audit-document, repair-orphans.

Key rules:
- audit-orphans is paginated (page/pageSize; default 100/page, max 500). includeCompendiums defaults false (world FKs only).
- audit-document returns both outbound (this doc's stale FKs) and inbound (refs that would orphan if this doc were deleted).
- repair-orphans is GM-only and requires confirm:true. dryRun:true is defense-in-depth — returns would-clear without mutating.
- Per Phase 4 Probe D foundational fact: Foundry does NOT auto-null FK fields on referent delete. This tool surfaces and repairs the stale-id residue.
- User.hotbar mutations route through assignHotbarMacro(null, slot) per BUG-103; raw -= update silently no-ops.

Examples:
- {action:"audit-orphans"} → page 1 of world orphans
- {action:"audit-orphans", page:2, pageSize:50, includeCompendiums:true}
- {action:"audit-document", documentType:"Scene", documentId:"abc"}
- {action:"repair-orphans", confirm:true, dryRun:true, orphans:[{sourceDocType:"Scene", sourceDocId:"abc", sourceField:"journal", refDocType:"JournalEntry", refId:"def"}]}
- {action:"repair-orphans", confirm:true, orphans:[...]} → real mutation`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            enum: ['audit-orphans', 'audit-document', 'repair-orphans'],
                            description: 'The cross-doc-fk action to perform.',
                        },
                        includeCompendiums: {
                            type: 'boolean',
                            description: '[audit-orphans] When true, scans compendium-prefixed UUID references (slow). Default false.',
                        },
                        page: {
                            type: 'integer',
                            minimum: 1,
                            description: '[audit-orphans] 1-based page number for paginated results. Default 1.',
                        },
                        pageSize: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 500,
                            description: '[audit-orphans] Page size. Default 100, max 500.',
                        },
                        documentType: {
                            type: 'string',
                            enum: [
                                'Actor', 'Adventure', 'Cards', 'Folder', 'Item', 'JournalEntry', 'Macro',
                                'Playlist', 'RollTable', 'Scene', 'User',
                                'Token', 'Note', 'RegionBehavior', 'TableResult', 'JournalEntryPage', 'PlaylistSound',
                            ],
                            description: '[audit-document] Doc type to audit (world doc or embedded doc).',
                        },
                        documentId: {
                            type: 'string',
                            description: '[audit-document] Document ID (bare 16-char id for world docs; embedded id for embedded docs).',
                        },
                        orphans: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    sourceDocType: { type: 'string' },
                                    sourceDocId: { type: 'string' },
                                    sourceField: { type: 'string' },
                                    refDocType: { type: 'string' },
                                    refId: { type: 'string' },
                                },
                                required: ['sourceDocType', 'sourceDocId', 'sourceField', 'refDocType', 'refId'],
                            },
                            description: '[repair-orphans] FK orphan refs (copy from audit-orphans output). Min length 1.',
                        },
                        confirm: {
                            type: 'boolean',
                            const: true,
                            description: '[repair-orphans] Must be exactly true — defensive gate against accidental bulk clears.',
                        },
                        dryRun: {
                            type: 'boolean',
                            description: '[repair-orphans] When true, returns would-clear results without mutating. Default false. Use for preview before confirm.',
                        },
                    },
                    required: ['action'],
                },
            },
        ];
    }

    async execute(args: CrossDocFkArgs) {
        this.logger.info('Executing cross-doc-fk action', { action: args.action });
        switch (args.action) {
            case 'audit-orphans':
                return this.handleAuditOrphans(args);
            case 'audit-document':
                return this.handleAuditDocument(args);
            case 'repair-orphans':
                return this.handleRepairOrphans(args);
        }
    }

    private async handleAuditOrphans(args: ArgsFor<'audit-orphans'>) {
        try {
            const data = await this.query<AuditOrphansResponse>('cross-doc-fk', args);
            return { content: [{ type: 'text' as const, text: formatAuditOrphansResponse(data) }] };
        } catch (e) {
            return errorContent('audit-orphans', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleAuditDocument(args: ArgsFor<'audit-document'>) {
        try {
            const data = await this.query<AuditDocumentResponse>('cross-doc-fk', args);
            return { content: [{ type: 'text' as const, text: formatAuditDocumentResponse(data) }] };
        } catch (e) {
            return errorContent('audit-document', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleRepairOrphans(args: ArgsFor<'repair-orphans'>) {
        try {
            const data = await this.query<RepairOrphansResponse>('cross-doc-fk', args);
            return { content: [{ type: 'text' as const, text: formatRepairOrphansResponse(data) }] };
        } catch (e) {
            return errorContent('repair-orphans', e instanceof Error ? e.message : String(e));
        }
    }
}
