// wfrp_imperial_arcana Phase 7 — imperial-arcana MCP tool.
//
// Umbrella tool exposing 4 actions for the wfrp-imperial-arcana module (a 36-card WFRP4e
// divination deck + Reading Records). CONDITIONAL: MODULE_NOT_ACTIVE returned when the
// module is absent/inactive. Additive + isolated (HC6) — composes existing Foundry doc
// surfaces server-side; no module dependency.
//
// Anchors:
//   - DP-15 (BUG-069): typed this.query<T> — never <any> on response.
//   - R2.4 / CCR-G2: errors route through BaseTool.errorResponse (no module-local errorContent).
//   - CCR-9 / R11.1: permissive passthrough outputSchema + structuredContent on every action.

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens, IMPERIAL_ARCANA_OUTPUT_JSON_SCHEMA } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';

// ── Response shapes (DP-15 — typed, never <any>) ─────────────────────────────────

interface DrawPosition {
  position: string;
  numeral: number;
  title: string;
  promise: string;
  peril: string;
  line: string;
}
interface ConjunctionView { key: string; name: string; meaning: string; }

interface DrawResult {
  spread: string;
  spreadName: string;
  question: string;
  positions: DrawPosition[];
  ninefold: boolean;
  conjunctions: ConjunctionView[];
  readOnly: true;
}
interface RecordResult {
  journalId: string;
  name: string;
  flags: { schemaVersion: number; numerals: number[]; spread: string; dominantOmen: number | null; ninefold: boolean; conjunctions: string[]; linkedUuids: string[] };
}
interface RecordSummary {
  journalId: string;
  name: string;
  spread: string;
  spreadName: string;
  numerals: number[];
  dominantOmen: number | null;
  ninefold: boolean;
  conjunctions: string[];
  linkedUuids: string[];
  session: string;
  date: string;
  summary?: string;
}
interface SearchResult { count: number; records: RecordSummary[]; }
interface RecallResult { linkedUuid: string; count: number; records: RecordSummary[]; }

type ImperialArcanaResult = DrawResult | RecordResult | SearchResult | RecallResult;

// ── Format helpers ───────────────────────────────────────────────────────────────

function formatDraw(r: DrawResult): string {
  const lines = r.positions.map((p) => `  • ${p.position}: ${p.numeral}. ${p.title}`);
  const omens: string[] = [];
  if (r.ninefold) omens.push('Ninefold Aligned');
  for (const c of r.conjunctions) omens.push(`Conjunction "${c.name}"`);
  const omenLine = omens.length ? `\nGM-only omens: ${omens.join('; ')}` : '';
  return `imperial-arcana.draw-reading: ${r.spreadName} (${r.spread})\n${lines.join('\n')}${omenLine}`;
}

function formatRecord(r: RecordResult): string {
  return `imperial-arcana.record-reading: wrote Reading Record "${r.name}" (${r.journalId}); schemaVersion ${r.flags.schemaVersion}, numerals [${r.flags.numerals.join(', ')}], spread ${r.flags.spread}.`;
}

function formatSearch(r: SearchResult): string {
  if (r.count === 0) return 'imperial-arcana.search-omens: no matching reading records.';
  const rows = r.records.map((rec) => `  • ${rec.name} (${rec.journalId}) — spread ${rec.spread}, ${rec.date || 'undated'}`);
  return `imperial-arcana.search-omens: ${r.count} record(s)\n${rows.join('\n')}`;
}

function formatRecall(r: RecallResult): string {
  if (r.count === 0) return `imperial-arcana.recall-callbacks: no prior readings linked to ${r.linkedUuid}.`;
  const rows = r.records.map((rec) => `  • ${rec.summary ?? rec.name} (${rec.journalId})`);
  return `imperial-arcana.recall-callbacks: ${r.count} prior reading(s) for ${r.linkedUuid}\n${rows.join('\n')}`;
}

function formatResult(action: string, data: ImperialArcanaResult): string {
  switch (action) {
    case 'draw-reading': return formatDraw(data as DrawResult);
    case 'record-reading': return formatRecord(data as RecordResult);
    case 'search-omens': return formatSearch(data as SearchResult);
    case 'recall-callbacks': return formatRecall(data as RecallResult);
    default: return `imperial-arcana.${action}: done.`;
  }
}

export interface ModuleImperialArcanaToolOptions extends BaseToolOptions {}

export class ModuleImperialArcanaTool extends BaseTool {
  constructor(options: ModuleImperialArcanaToolOptions) {
    super(options);
  }

  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [{ name: 'imperial-arcana', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'imperial-arcana',
        title: 'Imperial Arcana — draw / record / search / recall WFRP4e readings',
        annotations: {
          readOnlyHint: false, // record-reading writes a JournalEntry
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Programmatic integration for the wfrp-imperial-arcana module (a 36-card WFRP4e
divination deck + GM-only Reading Records). Conditional: returns MODULE_NOT_ACTIVE when the module is
absent/inactive. Pre-flight: module-probe.is-active wfrp-imperial-arcana.

4 actions:
- draw-reading     { spread, question?, numerals? }                       READ-ONLY — lay a spread's
    positions with each card's Promise/Peril/Reader's-Line (from the Card Index journal) + GM-only
    Ninefold/Conjunction notices. Creates NO documents. Omit numerals to draw a fresh random spread;
    pass numerals (the already-dealt distinct cards, in position order, length = the spread's position
    count) to interpret an inline / physical reading — same envelope, with ninefold/conjunctions computed.
- record-reading   { spread, numerals[], question?, dominantOmen?,        WRITE — persist a CCR-10
    linkedUuids?, session?, date?, journalId? }                           Reading Record (schemaVersion 1)
    in the "Imperial Arcana — Readings" folder (GM-only). Pass journalId to annotate an existing record.
    The Dominant Omen +10 stays MANUAL (HC2) — this never applies a modifier.
- search-omens     { numerals?, spread?, linkedUuids?, dateFrom?, dateTo? }   READ — filter records.
- recall-callbacks { linkedUuid, limit? }                                 READ — prior readings linked
    to one entity UUID, newest-first (for dramatic callbacks).

Examples:
- { action: "draw-reading", spread: "A", question: "What awaits in Ubersreik?" }
- { action: "draw-reading", spread: "A", numerals: [31,33,35] }   // interpret an already-dealt/physical spread
- { action: "record-reading", spread: "A", numerals: [10,17,13], dominantOmen: 17, linkedUuids: ["Actor.xxxx"] }
- { action: "search-omens", spread: "A" }
- { action: "recall-callbacks", linkedUuid: "Actor.xxxx" }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['draw-reading', 'record-reading', 'search-omens', 'recall-callbacks'],
              description: 'Imperial Arcana action to perform.',
            },
            spread: {
              type: 'string',
              enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
              description: '[draw-reading/record-reading required; search-omens optional] Spread key A–K.',
            },
            question: { type: 'string', description: '[draw-reading/record-reading] The question asked (recorded as context).' },
            numerals: {
              type: 'array', items: { type: 'integer', minimum: 0, maximum: 35 },
              description: "[record-reading required] The drawn card numerals (0–35), in the spread's position order; length must equal the spread's position count. [draw-reading optional] interpret an inline / physical reading — the already-dealt distinct numerals in position order (length = the spread's position count) instead of drawing random ones. [search-omens optional] records must contain ALL of these.",
            },
            dominantOmen: { type: ['integer', 'null'], minimum: 0, maximum: 35, description: '[record-reading] The designated Dominant Omen numeral (must be one of numerals), or null.' },
            linkedUuids: { type: 'array', items: { type: 'string' }, description: '[record-reading] Linked entity UUIDs (e.g. participant actors). [search-omens optional] match records intersecting ANY of these.' },
            linkedUuid: { type: 'string', description: '[recall-callbacks required] The single entity UUID to recall prior readings for.' },
            session: { type: 'string', description: '[record-reading] Session identifier (defaults to game.world.id-style context if omitted).' },
            date: { type: 'string', description: '[record-reading] ISO yyyy-mm-dd (defaults to today).' },
            dateFrom: { type: 'string', description: '[search-omens] ISO yyyy-mm-dd lower bound (inclusive).' },
            dateTo: { type: 'string', description: '[search-omens] ISO yyyy-mm-dd upper bound (inclusive).' },
            journalId: { type: 'string', description: '[record-reading] Existing Reading Record id to annotate/overwrite instead of creating a new one.' },
            limit: { type: 'integer', minimum: 1, maximum: 100, description: '[recall-callbacks] Max records to return (default 20).' },
          },
          required: ['action'],
        },
        // CCR-9 / R11.1: permissive passthrough outputSchema (4 actions, divergent shapes).
        outputSchema: IMPERIAL_ARCANA_OUTPUT_JSON_SCHEMA,
      },
    ];
  }

  async execute(args: Record<string, unknown>) {
    const action = String(args.action ?? 'unknown');
    this.logger.info('Executing imperial-arcana action', { action });
    try {
      const data = await this.query<ImperialArcanaResult>('imperial-arcana', args);
      return {
        content: [{ type: 'text' as const, text: formatResult(action, data) }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) {
        return moduleNotActiveContent('imperial-arcana', msg);
      }
      return this.errorResponse(action, msg);
    }
  }
}
