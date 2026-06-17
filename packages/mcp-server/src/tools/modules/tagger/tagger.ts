// Module Integration v1 Phase 5A — module-tagger MCP tool.
//
// Umbrella tool exposing 6 actions for Tagger (semantic-tag library module).
// Conditional: MODULE_NOT_ACTIVE returned when tagger is absent/inactive.
// No readOnlyHint — all write actions mutate Foundry document flags.
//
// Anchors:
//   - DP-15: typed this.query<T> — never <any> on response.
//   - R2.4: errors route through the shared BaseTool.errorResponse (was a module-local errorContent helper).
//   - Phase 5 module_integration_v1 acceptance criteria #1–4.

import { z } from 'zod';
import { SceneId } from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { moduleNotActiveContent } from '../_shared/module-guard.js';

// ── Response shapes (DP-15 — typed, never <any>) ─────────────────────────────

interface TaggerWriteResult {
  documentsTagged?: number;
  documentsUntagged?: number;
  documentsUpdated?: number;
  documentsCleared?: number;
  tags?: string[];
  removedTags?: string[];
  clearedTags?: string[] | 'all';
  toggled?: boolean;
  applyRules?: boolean;
  currentTags?: string[];
}

interface TaggerQueryDoc {
  uuid: string;
  name: string | null;
  type: string | null;
}

interface TaggerQueryResult {
  sceneId?: SceneId;
  documents?: TaggerQueryDoc[];
  count?: number;
  allScenes?: boolean;
  byScene?: Record<string, TaggerQueryDoc[]>;
  totalCount?: number;
}

interface TaggerCheckResult {
  hasTags?: boolean;
  documentCount?: number;
  documents?: Array<{ uuid: string; name: string | null; tags: string[] }>;
}

type TaggerResult = TaggerWriteResult | TaggerQueryResult | TaggerCheckResult;

// ── Inline error helper (CCR-G2) ──────────────────────────────────────────────


// ── Format helpers ────────────────────────────────────────────────────────────

function formatWrite(action: string, r: TaggerWriteResult): string {
  const count = r.documentsTagged ?? r.documentsUntagged ?? r.documentsUpdated ?? r.documentsCleared ?? 0;
  const tagDesc = r.tags ? `[${r.tags.join(', ')}]` : r.removedTags ? `[${r.removedTags.join(', ')}]` : 'all tags';
  const current = r.currentTags ? ` Current tags: [${r.currentTags.join(', ')}]` : '';
  return `module-tagger.${action}: applied to ${count} document(s). Tags: ${tagDesc}.${current}`;
}

function formatQuery(r: TaggerQueryResult): string {
  if (r.allScenes && r.byScene) {
    const lines = Object.entries(r.byScene).map(([sceneId, docs]) =>
      `Scene ${sceneId}: ${docs.map((d) => `${d.name ?? d.uuid}`).join(', ')}`
    );
    return `module-tagger.query: found ${r.totalCount ?? 0} document(s) across all scenes.\n\n${lines.join('\n')}`;
  }
  const docs = r.documents ?? [];
  if (docs.length === 0) return `module-tagger.query: no documents found matching the given tags in scene ${r.sceneId}.`;
  const lines = docs.map((d) => `- ${d.name ?? '(unnamed)'} [${d.type ?? 'unknown'}] ${d.uuid}`);
  return `module-tagger.query: found ${docs.length} document(s) in scene ${r.sceneId}.\n\n${lines.join('\n')}`;
}

function formatCheck(r: TaggerCheckResult): string {
  if (r.hasTags !== undefined) {
    return `module-tagger.check-tags: hasTags = ${r.hasTags} (checked ${r.documentCount ?? 0} document(s))`;
  }
  const docs = r.documents ?? [];
  const lines = docs.map((d) => `- ${d.name ?? d.uuid}: [${d.tags.join(', ') || '(none)'}]`);
  return `module-tagger.check-tags: tags for ${docs.length} document(s).\n\n${lines.join('\n')}`;
}

export interface ModuleTaggerToolOptions extends BaseToolOptions {}

export class ModuleTaggerTool extends BaseTool {
  constructor(options: ModuleTaggerToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'module-tagger', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-tagger',
        title: 'Tagger — semantic tag read/write',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Semantic-tag CRUD for Foundry documents via the Tagger library module.
Conditional: returns MODULE_NOT_ACTIVE when tagger module is absent/inactive.
Pre-flight: module-probe.is-active tagger before using this tool.

6 actions:
- tag         { uuids, tags, toggle? }              — addTags (or toggleTags if toggle:true)
- untag       { uuids, tags }                        — removeTags
- query       { tags, sceneId, matchAny?, ... }      — getByTag; sceneId required unless allScenes:true
- set-tags    { uuids, tags, applyRules? }            — setTags (atomic overwrite)
- clear-tags  { uuids, tags?, confirm? }              — clearAllTags (no tags, confirm required) or removeTags
- check-tags  { uuids, tags?, check? }               — getTags (check:false) or hasTags (check:true)

SAFETY:
- tags is REQUIRED and non-empty on tag/untag (Tagger.addTags(docs, undefined) throws).
- sceneId is required on query unless allScenes:true (game.canvas.id may be null server-side).
- allScenes and sceneId are mutually exclusive.
- returnObjects is never accepted (canvas-only; excluded from schema).
- clear-tags with no tags arg requires confirm:true (bulk destructive).
- ignore/objects params accept UUID strings; handler resolves them to Documents.

GM required for all actions.

Examples:
- { action: "tag", uuids: "Scene.abc.Token.xyz", tags: ["enemy","elite"] }
- { action: "query", tags: ["enemy*"], sceneId: "abc123" }
- { action: "check-tags", uuids: "Scene.abc.Token.xyz", check: false }
- { action: "clear-tags", uuids: ["uuid1","uuid2"], confirm: true }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['tag', 'untag', 'query', 'set-tags', 'clear-tags', 'check-tags'],
              description: 'Tagger action to perform.',
            },
            uuids: {
              oneOf: [
                { type: 'string' },
                { type: 'array', items: { type: 'string' } },
              ],
              description: '[tag/untag/set-tags/clear-tags/check-tags] Target document UUID(s).',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: '[tag/untag/query/set-tags/check-tags] Tag strings. Wildcards supported: "enemy*" matches enemy, enemy1, enemyBoss.',
            },
            toggle: {
              type: 'boolean',
              description: '[tag] If true, uses toggleTags (present→remove, absent→add) instead of addTags.',
            },
            sceneId: {
              type: 'string',
              description: '[query] Scene ID to search. Required when allScenes is not set (game.canvas.id may be null).',
            },
            matchAny: { type: 'boolean', description: '[query/check-tags] OR-match: document qualifies if it has any of the tags.' },
            matchExactly: { type: 'boolean', description: '[query/check-tags] Document tag set must equal the provided tags exactly.' },
            caseInsensitive: { type: 'boolean', description: '[query/check-tags] Case-insensitive tag matching.' },
            allScenes: { type: 'boolean', description: '[query] Search all scenes; returns {sceneId:[docs]} map. Mutually exclusive with sceneId.' },
            ignore: {
              type: 'array',
              items: { type: 'string' },
              description: '[query] UUID strings to exclude from results (resolved to Documents internally).',
            },
            objects: {
              type: 'array',
              items: { type: 'string' },
              description: '[query] Restrict search to this UUID set (resolved to Documents internally).',
            },
            applyRules: { type: 'boolean', description: '[set-tags] Apply {#} and {id} substitution rules after setting tags.' },
            confirm: { type: 'boolean', description: '[clear-tags] Required true when clearing all tags (no tags arg) — bulk destructive.' },
            check: { type: 'boolean', description: '[check-tags] true → hasTags boolean; false/omit → getTags array.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: Record<string, unknown>) {
    const action = String(args.action ?? 'unknown');
    this.logger.info('Executing module-tagger action', { action });
    try {
      const data = await this.query<TaggerResult>('module-tagger', args);
      let text: string;
      switch (action) {
        case 'query':
          text = formatQuery(data as TaggerQueryResult);
          break;
        case 'check-tags':
          text = formatCheck(data as TaggerCheckResult);
          break;
        default:
          text = formatWrite(action, data as TaggerWriteResult);
      }
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('MODULE_NOT_ACTIVE')) {
        return moduleNotActiveContent('module-tagger', msg);
      }
      return this.errorResponse(action, msg);
    }
  }
}
