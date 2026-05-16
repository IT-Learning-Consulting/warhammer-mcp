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
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type DiagnosticArgs = z.infer<typeof DiagnosticToolInput>;
type ArgsFor<A extends DiagnosticArgs['action']> = Extract<DiagnosticArgs, { action: A }>;

export class DiagnosticTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
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

**Future actions (Phase 2 / Phase 3, not callable in v1):** Tier 2 content-health scans (validate-wfrp-config, scan-broken-uuids, scan-career-refs, validate-ae-scripts); Tier 3 dev-introspection (inspect-document, hook-inventory, module-inventory, settings-inventory).

**Examples:**
- {action:"recent-errors"} — all events in ring buffer
- {action:"recent-errors", severity:"error", limit:20} — last 20 errors
- {action:"world-issues", buckets:["validation"]} — validation failures only
- {action:"support-snapshot", includeModules:false} — version snapshot without module list`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['recent-errors', 'world-issues', 'support-snapshot'],
              description: 'The diagnostic action to perform.',
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
      return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
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
      return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
    } catch (e) {
      return this.errorResponse('support-snapshot', e instanceof Error ? e.message : String(e));
    }
  }

  // Per-tool error envelope — mirrors handlers/journal.ts:523.
  private errorResponse(action: string, error: string) {
    return {
      content: [{ type: 'text' as const, text: `❌ **diagnostic.${action} failed**\n\n${error}` }],
      isError: true,
    };
  }
}
