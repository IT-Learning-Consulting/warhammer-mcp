// Phase 1 mcp_diagnostic_tool — Diagnostic umbrella tool (Tier 1: 3 actions).
//
// MCP-server side of the `warhammer-mcp.diagnostic` query. Pure read surface
// across all Tier 1 actions: recent-errors / world-issues / support-snapshot.
// Phase 2 + Phase 3 add more action variants to the shared discriminated
// union; this tool's switch is exhaustive on v1.
//
// **CCR-3 / BUG-069 (post-2026-05-14):** every handler parameterises
// `this.query<T>` with a CONCRETE response type, never `<any>`. Each handler
// wraps the query call in try/catch and routes errors through errorResponse.
// BaseTool.query returns unwrapped data + throws on failure — no `.success`
// reads anywhere in this file.
//
// **CCR-1 / HC1:** read-only annotations everywhere. The umbrella shape
// supports future Tier 4 (exec-script, v2 PRD) but the v1 surface is pure
// read.

import { z } from 'zod';
import {
  DiagnosticToolInput,
  type RecentErrorsResponse,
  type WorldIssuesResponse,
  type SupportSnapshotResponse,
  type ValidateWfrpConfigResponse,
  type ScanBrokenUuidsResponse,
  type ScanCareerRefsResponse,
  type ValidateAeScriptsResponse,
  type InspectDocumentResponse,
  type HookInventoryResponse,
  type ModuleInventoryResponse,
  type SettingsInventoryResponse,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type DiagnosticArgs = z.infer<typeof DiagnosticToolInput>;
type ArgsFor<A extends DiagnosticArgs['action']> = Extract<DiagnosticArgs, { action: A }>;

export class DiagnosticTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'diagnostic', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'diagnostic',
        title: 'Warhammer MCP — Diagnostic',
        annotations: {
          // HC1 / CCR-1 — pure read surface across all v1 actions. Phase 2 +
          // Phase 3 sub-actions remain read-only; Tier 4 exec-script is v2-
          // deferred and would re-annotate.
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        description:
          `Read Foundry VTT runtime diagnostics — errors, world-issues, support snapshot. ` +
          `GM-only; off by default (GM enables via "Enable Diagnostic Tools" world setting).

**v1 actions (Tier 1):**
- **recent-errors**: Read the runtime error/warning ring buffer (200-entry FIFO). Captures window.error, unhandledrejection, Hooks.on('error'), and console.warn since module init, plus init-phase errors (source:'init'). Filter by severity ('error'|'warn'), source ('window'|'unhandledrejection'|'hooks'|'console.warn'|'init'), limit (1-200), or since (epoch ms). Returns {events, bufferSize, bufferFull}.
- **world-issues**: Read game.issues — the central diagnostic hub Foundry populates with package compatibility issues, usability issues, and validation failures. Filter by buckets:["packageCompatibility","usability","validation"]. Returns each bucket as a Record<id,issue> plus per-bucket counts.
- **support-snapshot**: Read SupportDetails.generateSupportReport() — core/system version, world identifiers, module list. Pass includeModules:false to omit the per-module breakdown. Falls back to game.version / game.system / game.world when SupportDetails is unavailable (raw._fallback signals this).

**v1 actions (Tier 2 — WFRP4e content-health scans):**
- **validate-wfrp-config**: Assert CONFIG.WFRP4E surface keys exist with expected shape (xpCost.characteristic/skill arrays length>=10; syncTriggers/corruptionTables/magicLores/scriptTriggers populated objects; species/speciesSkills/speciesTalents non-empty records). Returns {ok, failures: [{key, expected, actual}]}. No scope — operates on the live CONFIG surface.
- **scan-broken-uuids**: Walk doc descriptions for @UUID[...]{...} links that no longer resolve. Requires scope. world-scope without confirmExpensive:true returns counts-only (details omitted). Returns {checked, broken, uuidsBroken, elapsedMs, details?}.
- **scan-career-refs**: Walk actor careers for skill/talent name references that don't resolve via exact-name lookup in world items. Read-only fallback — does NOT call WFRP_Utility.findSkill (which may rename-mutate the source). Returns {checked, unresolved, elapsedMs, details?}. NOTE: only skills/talents in game.items (world sidebar) resolve; compendium-only items (never dragged to the world sidebar) appear as unresolved false-positives — run a world scan once to establish the empirical baseline.
- **validate-ae-scripts**: Parse Active Effect script bodies via new Function() (parse-only; never executed) — surfaces SyntaxError, unknown-trigger (not in CONFIG.WFRP4E.scriptTriggers), and schema-drift (pre-v11 non-array scriptData). Returns {checked, invalid, schemaDrift, elapsedMs, details?}.

**Scope discipline** (scan-broken-uuids / scan-career-refs / validate-ae-scripts): scope.type=actor|item|compendium requires scope.id; scope.type=world returns counts-only unless scope.confirmExpensive:true.

**v1 actions (Tier 3 — developer introspection):**
- **inspect-document**: Point-read a single document by UUID via fromUuid. Returns documentName, type, name, system, flags, ownership, sheetClassName (when present), and effects/items as {count, preview[]}. Default preview = first 10 entries; pass includeFull:true for full arrays. Returns DIAGNOSTIC_INSPECT_DOCUMENT_NOT_FOUND on bad UUID (fromUuid returns null on miss).
- **hook-inventory**: Read Hooks.events — every registered hook with its listener count plus drift flags (updateToken count > 5; refreshToken count > 3). Optional hookFilter (substring match). Optional byNamespace:true for opt-in best-effort namespace breakdown via fn.name parse (anonymous arrows bucket under "<unknown>"); default off keeps envelope tight. Returns {totalHooks, totalListeners, hooks[], drift[]}.
- **module-inventory**: Walk game.modules with per-module {id, title, version, active, availability (raw numeric code from CONST.PACKAGE_AVAILABILITY_CODES), availabilityLabel (resolved label), incompatibleWithCoreVersion, unavailable}. Pass onlyActive:true to omit inactive modules. Returns {total, active, modules[]}.
- **settings-inventory**: Walk game.settings.settings — every registered setting with {namespace, key, scope, typeLabel ("Boolean" | "String" | "Number" | "Object" | "DataModel:<name>" | fallback), default, current}. Optional namespaceFilter (exact-match) restricts to one namespace.

**Module overlap:** use support-snapshot for bug-report environment context (modules: id/title/version only); use module-inventory for compat-health triage (adds active, availability, incompatibleWithCoreVersion, unavailable).

**Examples:**
- {action:"recent-errors"} — all events in ring buffer
- {action:"recent-errors", severity:"error", limit:20} — last 20 errors
- {action:"world-issues", buckets:["validation"]} — validation failures only
- {action:"support-snapshot", includeModules:false} — version snapshot without module list
- {action:"validate-wfrp-config"} — assert CONFIG.WFRP4E keys
- {action:"scan-broken-uuids", scope:{type:"actor", id:"<id>"}} — walk one actor's descriptions
- {action:"scan-broken-uuids", scope:{type:"world", confirmExpensive:true}} — full world walk with details
- {action:"scan-career-refs", scope:{type:"world"}} — counts-only world scan
- {action:"validate-ae-scripts", scope:{type:"item", id:"<id>"}} — validate one item's AE scripts
- {action:"inspect-document", uuid:"Actor.abc123"} — counts + first-10 preview
- {action:"inspect-document", uuid:"Actor.abc123", includeFull:true} — full effects/items arrays
- {action:"hook-inventory"} — all hooks with drift flags
- {action:"hook-inventory", hookFilter:"Token", byNamespace:true} — Token-related hooks with namespace breakdown
- {action:"module-inventory", onlyActive:true} — active modules only
- {action:"settings-inventory", namespaceFilter:"warhammer-mcp"} — only warhammer-mcp settings`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'recent-errors',
                'world-issues',
                'support-snapshot',
                'validate-wfrp-config',
                'scan-broken-uuids',
                'scan-career-refs',
                'validate-ae-scripts',
                'inspect-document',
                'hook-inventory',
                'module-inventory',
                'settings-inventory',
              ],
              description: 'The diagnostic action to perform.',
            },
            scope: {
              type: 'object',
              description:
                '[scan-broken-uuids|scan-career-refs|validate-ae-scripts] Scan scope. type=actor|item|compendium requires id. type=world returns counts-only unless confirmExpensive:true.',
              properties: {
                type: {
                  type: 'string',
                  enum: ['actor', 'item', 'compendium', 'world'],
                },
                id: { type: 'string' },
                confirmExpensive: { type: 'boolean' },
              },
              required: ['type'],
            },
            severity: {
              type: 'string',
              enum: ['error', 'warn'],
              description: '[recent-errors] Filter by severity.',
            },
            source: {
              type: 'string',
              enum: ['window', 'unhandledrejection', 'hooks', 'console.warn', 'init'],
              description: '[recent-errors] Filter by capture surface.',
            },
            limit: {
              type: 'number',
              description: '[recent-errors] Maximum number of events to return (1-200). Returns the most recent N when capped.',
            },
            since: {
              type: 'number',
              description: '[recent-errors] Return only events with ts >= since (epoch ms).',
            },
            buckets: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['packageCompatibility', 'usability', 'validation'],
              },
              description: '[world-issues] Restrict to these issue buckets. Defaults to all three.',
            },
            includeModules: {
              type: 'boolean',
              description: '[support-snapshot] If false, omit the per-module breakdown. Default true.',
            },
            uuid: {
              type: 'string',
              description: '[inspect-document] UUID of the document to introspect (passed to fromUuid).',
            },
            includeFull: {
              type: 'boolean',
              description: '[inspect-document] If true, return full items[] and effects[] arrays. Default false (counts + first-10 preview).',
            },
            hookFilter: {
              type: 'string',
              description: '[hook-inventory] Optional substring filter on hook names (case-sensitive).',
            },
            byNamespace: {
              type: 'boolean',
              description: '[hook-inventory] Opt-in best-effort namespace breakdown via fn.name parse. Default false. Anonymous arrows bucket under "<unknown>".',
            },
            onlyActive: {
              type: 'boolean',
              description: '[module-inventory] If true, omit inactive modules. Default false (full inventory).',
            },
            namespaceFilter: {
              type: 'string',
              description: '[settings-inventory] Optional exact-match namespace filter (e.g. "warhammer-mcp").',
            },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: DiagnosticArgs) {
    this.logger.info('Executing diagnostic action', { action: args.action });
    switch (args.action) {
      case 'recent-errors':
        return this.handleRecentErrors(args);
      case 'world-issues':
        return this.handleWorldIssues(args);
      case 'support-snapshot':
        return this.handleSupportSnapshot(args);
      case 'validate-wfrp-config':
        return this.handleValidateWfrpConfig(args);
      case 'scan-broken-uuids':
        return this.handleScanBrokenUuids(args);
      case 'scan-career-refs':
        return this.handleScanCareerRefs(args);
      case 'validate-ae-scripts':
        return this.handleValidateAeScripts(args);
      case 'inspect-document':
        return this.handleInspectDocument(args);
      case 'hook-inventory':
        return this.handleHookInventory(args);
      case 'module-inventory':
        return this.handleModuleInventory(args);
      case 'settings-inventory':
        return this.handleSettingsInventory(args);
    }
  }

  // ── Handlers (concrete typed generic per CCR-3 / BUG-069) ────────────────

  private async handleRecentErrors(args: ArgsFor<'recent-errors'>) {
    try {
      // CCR-3: concrete generic, NEVER <any>. BaseTool.query unwraps + throws.
      const data = await this.query<RecentErrorsResponse>('diagnostic', args);

      const filterParts: string[] = [];
      if (args.severity) filterParts.push(`severity=${args.severity}`);
      if (args.source) filterParts.push(`source=${args.source}`);
      if (args.limit !== undefined) filterParts.push(`limit=${args.limit}`);
      if (args.since !== undefined) filterParts.push(`since=${args.since}`);
      const filterSuffix = filterParts.length ? ` (filter: ${filterParts.join(', ')})` : '';

      if (data.events.length === 0) {
        return {
          content: [
            {
              type: 'text' as const,
              text:
                `**Recent errors** — none${filterSuffix}.\n\n` +
                `Buffer: ${data.bufferSize}/200${data.bufferFull ? ' (full, FIFO eviction active)' : ''}.`,
            },
          ],
          structuredContent: data as unknown as Record<string, unknown>,
        };
      }

      const lines = data.events.map((e) => {
        const ts = new Date(e.ts).toISOString();
        const loc = e.location ? ` @ ${e.location}` : '';
        const phase = e.phase === 'init' ? ' [init]' : '';
        return `- ${ts} [${e.severity}] ${e.source}${phase}${loc}: ${e.message}`;
      });
      return {
        content: [
          {
            type: 'text' as const,
            text:
              `**Recent errors** (${data.events.length} of ${data.bufferSize})${filterSuffix}\n\n` +
              `Buffer: ${data.bufferSize}/200${data.bufferFull ? ' (full, FIFO eviction active)' : ''}.\n\n` +
              `${lines.join('\n')}`,
          },
        ],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      return this.errorResponse('recent-errors', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleWorldIssues(args: ArgsFor<'world-issues'>) {
    try {
      const data = await this.query<WorldIssuesResponse>('diagnostic', args);
      const lines = [
        `**World issues**`,
        ``,
        `- Package compatibility: ${data.counts.packageCompatibility}`,
        `- Usability: ${data.counts.usability}`,
        `- Validation: ${data.counts.validation}`,
      ];
      const detailBuckets: Array<
        ['packageCompatibility' | 'usability' | 'validation', Record<string, unknown>]
      > = [
        ['packageCompatibility', data.packageCompatibilityIssues],
        ['usability', data.usabilityIssues],
        ['validation', data.validationFailures],
      ];
      for (const [name, bucket] of detailBuckets) {
        const keys = Object.keys(bucket);
        if (keys.length > 0) {
          lines.push(``, `**${name}:**`);
          for (const k of keys.slice(0, 20)) {
            let valueRepr: string;
            try {
              valueRepr = JSON.stringify(bucket[k]);
            } catch {
              valueRepr = String(bucket[k]);
            }
            lines.push(`- ${k}: ${valueRepr.slice(0, 200)}`);
          }
          if (keys.length > 20) lines.push(`- … (${keys.length - 20} more)`);
        }
      }
      return { content: [{ type: 'text' as const, text: lines.join('\n') }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('world-issues', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleSupportSnapshot(args: ArgsFor<'support-snapshot'>) {
    try {
      const data = await this.query<SupportSnapshotResponse>('diagnostic', args);
      const lines = [
        `**Support snapshot**`,
        ``,
        `- Foundry core: ${data.coreVersion}`,
        `- System: ${data.systemId} ${data.systemVersion}`,
        `- World: ${data.worldTitle ?? data.worldId} (${data.worldId})`,
        `- Active modules: ${data.activeModuleCount}`,
      ];
      if (data.modules && data.modules.length > 0) {
        lines.push(``, `**Modules:**`);
        for (const m of data.modules.slice(0, 50)) {
          lines.push(
            `- ${m.id}${m.version ? ` @ ${m.version}` : ''}${m.title ? ` — ${m.title}` : ''}`,
          );
        }
        if (data.modules.length > 50) lines.push(`- … (${data.modules.length - 50} more)`);
      }
      if (data.raw && (data.raw as any)._fallback === true) {
        lines.push(
          ``,
          `_Note: SupportDetails.generateSupportReport() unavailable — values derived from game.version / game.system / game.world._`,
        );
      }
      return { content: [{ type: 'text' as const, text: lines.join('\n') }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('support-snapshot', e instanceof Error ? e.message : String(e));
    }
  }

  // ── Phase 2 Tier 2 handlers ──────────────────────────────────────────────

  private async handleValidateWfrpConfig(args: ArgsFor<'validate-wfrp-config'>) {
    try {
      const data = await this.query<ValidateWfrpConfigResponse>('diagnostic', args);
      const lines: string[] = [`**Diagnostic — validate-wfrp-config**`, ``];
      if (data.ok) {
        lines.push(`OK: all CONFIG.WFRP4E keys conform to expected shape.`);
      } else {
        lines.push(`FAIL: ${data.failures.length} failure(s):`, ``);
        for (const f of data.failures) {
          lines.push(`- \`${f.key}\` expected ${f.expected}, actual ${f.actual}`);
        }
      }
      return { content: [{ type: 'text' as const, text: lines.join('\n') }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('validate-wfrp-config', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleScanBrokenUuids(args: ArgsFor<'scan-broken-uuids'>) {
    try {
      const data = await this.query<ScanBrokenUuidsResponse>('diagnostic', args);
      const lines: string[] = [`**Diagnostic — scan-broken-uuids**`, ``];
      const elapsed = data.elapsedMs !== undefined ? ` (${data.elapsedMs}ms)` : '';
      lines.push(
        `Checked ${data.checked} doc(s); ${data.broken} with broken refs; ${data.uuidsBroken} broken @UUID link(s)${elapsed}.`,
      );
      // 'details' in data → present in actor/item/compendium or world+confirmExpensive
      if ('details' in data && Array.isArray(data.details)) {
        if (data.details.length === 0) {
          lines.push(``, `No broken @UUID links found.`);
        } else {
          lines.push(``, `**Broken refs:**`);
          for (const b of data.details.slice(0, 50)) {
            const ext = b.embeddedItemId ? ` (embedded item ${b.embeddedItemId})` : '';
            lines.push(`- ${b.docName} [${b.docId}]${ext} \`${b.field}\`: \`${b.uuid}\``);
          }
          if (data.details.length > 50) lines.push(`- … (${data.details.length - 50} more)`);
        }
      } else {
        lines.push(
          ``,
          `_Counts-only mode (scope.type=world without confirmExpensive). Re-call with \`scope.confirmExpensive: true\` to see per-doc details._`,
        );
      }
      return { content: [{ type: 'text' as const, text: lines.join('\n') }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('scan-broken-uuids', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleScanCareerRefs(args: ArgsFor<'scan-career-refs'>) {
    try {
      const data = await this.query<ScanCareerRefsResponse>('diagnostic', args);
      const lines: string[] = [`**Diagnostic — scan-career-refs**`, ``];
      const elapsed = data.elapsedMs !== undefined ? ` (${data.elapsedMs}ms)` : '';
      lines.push(
        `Checked ${data.checked} career item(s); ${data.unresolved} unresolved skill/talent name(s)${elapsed}.`,
      );
      if ('details' in data && Array.isArray(data.details)) {
        if (data.details.length === 0) {
          lines.push(``, `All career references resolve.`);
        } else {
          lines.push(``, `**Unresolved refs:**`);
          for (const r of data.details.slice(0, 50)) {
            lines.push(
              `- ${r.actorName} / career ${r.careerName} → ${r.refType} \`${r.name}\``,
            );
          }
          if (data.details.length > 50) lines.push(`- … (${data.details.length - 50} more)`);
        }
      } else {
        lines.push(
          ``,
          `_Counts-only mode (scope.type=world without confirmExpensive). Re-call with \`scope.confirmExpensive: true\` for details._`,
        );
      }
      return { content: [{ type: 'text' as const, text: lines.join('\n') }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('scan-career-refs', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleValidateAeScripts(args: ArgsFor<'validate-ae-scripts'>) {
    try {
      const data = await this.query<ValidateAeScriptsResponse>('diagnostic', args);
      const lines: string[] = [`**Diagnostic — validate-ae-scripts**`, ``];
      const elapsed = data.elapsedMs !== undefined ? ` (${data.elapsedMs}ms)` : '';
      lines.push(
        `Checked ${data.checked} AE(s); ${data.invalid} invalid; ${data.schemaDrift} schema-drift (pre-v11 non-array scriptData)${elapsed}.`,
      );
      if ('details' in data && Array.isArray(data.details)) {
        if (data.details.length === 0) {
          lines.push(``, `All Active Effect scripts parse and reference known triggers.`);
        } else {
          const syntax = data.details.filter((d) => d.issue === 'syntax-error');
          const trig = data.details.filter((d) => d.issue === 'unknown-trigger');
          const drift = data.details.filter((d) => d.issue === 'schema-drift');
          if (syntax.length) {
            lines.push(``, `**Syntax errors (${syntax.length}):**`);
            for (const d of syntax.slice(0, 25)) {
              lines.push(
                `- ${d.docName} → AE ${d.aeName}${d.trigger ? ` [${d.trigger}]` : ''}: ${d.error ?? ''}`,
              );
            }
          }
          if (trig.length) {
            lines.push(``, `**Unknown triggers (${trig.length}):**`);
            for (const d of trig.slice(0, 25)) {
              lines.push(`- ${d.docName} → AE ${d.aeName}: trigger \`${d.trigger}\``);
            }
          }
          if (drift.length) {
            lines.push(``, `**Schema drift (${drift.length} — pre-v11 non-array scriptData):**`);
            for (const d of drift.slice(0, 25)) {
              lines.push(`- ${d.docName} → AE ${d.aeName}: ${d.expected ?? ''}`);
            }
          }
        }
      } else {
        lines.push(
          ``,
          `_Counts-only mode (scope.type=world without confirmExpensive). Re-call with \`scope.confirmExpensive: true\` for details._`,
        );
      }
      return { content: [{ type: 'text' as const, text: lines.join('\n') }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('validate-ae-scripts', e instanceof Error ? e.message : String(e));
    }
  }

  // ── Phase 3 Tier 3 handlers ──────────────────────────────────────────────

  private async handleInspectDocument(args: ArgsFor<'inspect-document'>) {
    try {
      const data = await this.query<InspectDocumentResponse>('diagnostic', args);
      const lines: string[] = [
        `**Diagnostic — inspect-document**`,
        ``,
        `**${data.documentName}**${data.type ? `:${data.type}` : ''} "${data.name}"`,
        `- UUID: \`${data.uuid}\``,
      ];
      if (data.sheetClassName) lines.push(`- Sheet: \`${data.sheetClassName}\``);
      lines.push(
        `- Effects: ${data.effects.count}${data.effects.preview.length < data.effects.count ? ` (preview ${data.effects.preview.length})` : ''}`,
      );
      for (const e of data.effects.preview) {
        const flags = [
          e.disabled !== undefined ? `disabled=${e.disabled}` : null,
          e.transfer !== undefined ? `transfer=${e.transfer}` : null,
        ].filter(Boolean).join(', ');
        lines.push(`  - ${e.name} [${e.id}]${flags ? ` (${flags})` : ''}`);
      }
      lines.push(
        `- Items: ${data.items.count}${data.items.preview.length < data.items.count ? ` (preview ${data.items.preview.length})` : ''}`,
      );
      for (const i of data.items.preview) {
        lines.push(`  - ${i.name} [${i.id}]${i.type ? ` (${i.type})` : ''}`);
      }
      if (args.includeFull === true) {
        lines.push(``, `_Mode: full dump (includeFull:true)._`);
      }
      lines.push(``, `**System:**`, '```json', JSON.stringify(data.system, null, 2).slice(0, 4000), '```');
      const flagKeys = Object.keys(data.flags);
      if (flagKeys.length > 0) {
        lines.push(``, `**Flags:** ${flagKeys.join(', ')}`);
      }
      const ownerKeys = Object.keys(data.ownership);
      if (ownerKeys.length > 0) {
        lines.push(``, `**Ownership:** ${ownerKeys.map((k) => `${k}=${data.ownership[k]}`).join(', ')}`);
      }
      return { content: [{ type: 'text' as const, text: lines.join('\n') }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('inspect-document', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleHookInventory(args: ArgsFor<'hook-inventory'>) {
    try {
      const data = await this.query<HookInventoryResponse>('diagnostic', args);
      const lines: string[] = [
        `**Diagnostic — hook-inventory**`,
        ``,
        `Hooks: ${data.totalHooks} distinct, ${data.totalListeners} listener(s).`,
      ];
      if (args.hookFilter) lines.push(`_Filter: substring "${args.hookFilter}"._`);
      if (data.drift.length > 0) {
        lines.push(``, `**Drift detected (${data.drift.length}):**`);
        for (const d of data.drift) {
          lines.push(`- \`${d.hook}\` count=${d.count} > threshold=${d.threshold}`);
        }
      }
      const sorted = [...data.hooks].sort((a, b) => b.count - a.count);
      const top = sorted.slice(0, 50);
      if (top.length > 0) {
        lines.push(``, `**Hooks (top ${top.length}${sorted.length > 50 ? ` of ${sorted.length}` : ''}):**`);
        for (const h of top) {
          const driftFlag = h.drift ? ` ⚠️ drift` : '';
          lines.push(`- \`${h.name}\` × ${h.count}${driftFlag}`);
          if (h.byNamespace) {
            const entries = Object.entries(h.byNamespace).sort((a, b) => b[1] - a[1]).slice(0, 10);
            for (const [ns, n] of entries) {
              lines.push(`  - ${ns}: ${n}`);
            }
          }
        }
        if (sorted.length > 50) lines.push(`- … (${sorted.length - 50} more)`);
      }
      return { content: [{ type: 'text' as const, text: lines.join('\n') }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('hook-inventory', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleModuleInventory(args: ArgsFor<'module-inventory'>) {
    try {
      const data = await this.query<ModuleInventoryResponse>('diagnostic', args);
      const lines: string[] = [
        `**Diagnostic — module-inventory**`,
        ``,
        `Modules: ${data.total} (active: ${data.active}${args.onlyActive === true ? ', showing active only' : ''}).`,
      ];
      if (data.modules.length > 0) {
        lines.push(``, `| id | version | active | availability | unavailable |`, `|---|---|---|---|---|`);
        for (const m of data.modules.slice(0, 100)) {
          lines.push(
            `| \`${m.id}\` | ${m.version} | ${m.active ? 'yes' : 'no'} | ${m.availabilityLabel} (${m.availability}) | ${m.unavailable ? 'yes' : 'no'}${m.incompatibleWithCoreVersion ? ' ⚠️ core-incompat' : ''} |`,
          );
        }
        if (data.modules.length > 100) lines.push(``, `… (${data.modules.length - 100} more)`);
      }
      return { content: [{ type: 'text' as const, text: lines.join('\n') }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('module-inventory', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleSettingsInventory(args: ArgsFor<'settings-inventory'>) {
    try {
      const data = await this.query<SettingsInventoryResponse>('diagnostic', args);
      const lines: string[] = [
        `**Diagnostic — settings-inventory**`,
        ``,
        `Settings: ${data.total} entries${args.namespaceFilter ? ` in namespace "${args.namespaceFilter}"` : ''}.`,
      ];
      const byNs = new Map<string, typeof data.settings>();
      for (const s of data.settings) {
        const list = byNs.get(s.namespace) ?? [];
        list.push(s);
        byNs.set(s.namespace, list);
      }
      const fmtVal = (v: unknown): string => {
        try {
          const j = JSON.stringify(v);
          return j === undefined ? String(v) : j.slice(0, 200);
        } catch {
          return String(v).slice(0, 200);
        }
      };
      for (const [ns, settings] of byNs) {
        lines.push(``, `**${ns}** (${settings.length}):`);
        for (const s of settings.slice(0, 50)) {
          lines.push(`- \`${s.key}\` (${s.scope}, ${s.typeLabel}) — current: ${fmtVal(s.current)} | default: ${fmtVal(s.default)}`);
        }
        if (settings.length > 50) lines.push(`- … (${settings.length - 50} more)`);
      }
      return { content: [{ type: 'text' as const, text: lines.join('\n') }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('settings-inventory', e instanceof Error ? e.message : String(e));
    }
  }

}
