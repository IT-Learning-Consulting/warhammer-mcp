// Module Integration v1 Phase 1 — module-probe MCP tool.
//
// Always-registered umbrella (no MODULE_NOT_ACTIVE guard — the probe always
// succeeds, it just reports whether a module is active). Mirrors setting.ts
// structure: BaseTool.errorResponse, typed query<T>, execute() switch.
//
// Two actions:
//   is-active  { moduleId: string } — { id, active, title?, version? }
//   list-active                     — { modules: [{id,title,version}] }
//
// Annotations: readOnlyHint true — never mutates Foundry documents.
//
// Anchors:
//   - DP-15: typed query<T>; no <any> on response side.
//   - R2.4 (mcp-builder): errors route through the shared BaseTool.errorResponse.
//   - Phase 1 module_integration_v1 acceptance criterion #1.

import { z } from 'zod';
import {
    ModuleProbeInput,
    type ModuleIsActiveResult,
    type ModuleListActiveResult,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../../../base-tool.js';

type ProbeArgs = z.infer<typeof ModuleProbeInput>;
type ArgsFor<A extends ProbeArgs['action']> = Extract<ProbeArgs, { action: A }>;

// ── Response shapes (DP-15) ───────────────────────────────────────────────────

interface ProbeIsActiveResponse {
    id: string;
    active: boolean;
    title?: string;
    version?: string;
}

interface ProbeListActiveResponse {
    modules: Array<{ id: string; title: string; version: string }>;
}

// ── Inline error helper (CCR-G2 — NOT on BaseTool) ───────────────────────────


// ── Format helpers ────────────────────────────────────────────────────────────

function formatIsActive(r: ModuleIsActiveResult): string {
    const status = r.active ? 'ACTIVE' : 'INACTIVE/NOT INSTALLED';
    const meta = r.title ? ` (${r.title}${r.version ? ` v${r.version}` : ''})` : '';
    return `Module "${r.id}"${meta}: ${status}`;
}

function formatListActive(r: ModuleListActiveResult): string {
    if (r.modules.length === 0) return 'No active modules found.';
    const lines = r.modules.map((m) => `- ${m.id} (${m.title}) v${m.version}`);
    return `Active modules (${r.modules.length}):\n\n${lines.join('\n')}`;
}

export interface ModuleProbeToolOptions extends BaseToolOptions { }

export class ModuleProbeTool extends BaseTool {
    constructor(options: ModuleProbeToolOptions) {
        super(options);
    }

    // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
    getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
      return [
          { name: 'module-probe', handler: (args: any) => this.execute(args) },
      ];
    }

    getToolDefinitions() {
        return [
            {
                name: 'module-probe',
                title: 'Foundry module active-state probe',
                annotations: {
                    readOnlyHint: true,
                    destructiveHint: false,
                    idempotentHint: true,
                    openWorldHint: false,
                },
                description:
                    `Read-only probe for Foundry module active state. Always-registered (no MODULE_NOT_ACTIVE guard).
Use for skill-layer pre-flight before calling module-* tools.

Use this when:
- Pre-flighting whether a specific companion module (e.g. "monks-active-tiles") is installed and active before calling its module-* tool.
- Deciding which of several optional module-* tools are usable in the current world by checking one module id.
- Enumerating every currently active module to build a capability picture of the world.
- Diagnosing a MODULE_NOT_ACTIVE error from another tool by confirming the module's real state.

2 actions:
- is-active  { moduleId }  — checks whether a specific module is installed and active.
- list-active              — lists all currently active modules (id, title, version).

is-active never errors on an absent module — it returns { active: false }.
GM required.

Examples:
- { action: "is-active", moduleId: "monks-active-tiles" }
- { action: "list-active" }

Do NOT use is-active in a loop to check many modules — use list-active once and filter locally instead. Both actions serve the same read; list-active is the cheaper path when checking more than one or two module ids.

Performance Notes:
- is-active: a single small fixed-shape response (id/active/title/version) — no pagination.
- list-active: returns every active module's id/title/version in one response — no response modes, no pagination; size scales with how many modules are installed and active in the world (typically tens of entries).`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            enum: ['is-active', 'list-active'],
                            description: 'Probe action: is-active checks one module; list-active returns all active modules.',
                        },
                        moduleId: {
                            type: 'string',
                            description: '[is-active] The Foundry module ID to check (e.g. "monks-active-tiles", "wfrp4e").',
                        },
                    },
                    required: ['action'],
                },
            },
        ];
    }

    async execute(args: ProbeArgs) {
        this.logger.info('Executing module-probe action', { action: args.action });
        switch (args.action) {
            case 'is-active':
                return this.handleIsActive(args);
            case 'list-active':
                return this.handleListActive(args);
          default:
            // BUG-439: an unknown action must throw (clean isError envelope via the
            // dispatch catch) instead of falling through to an undefined result.
            throw new Error(`Unknown action "${String((args as any).action)}" — valid actions: is-active, list-active`);
        }
    }

    private async handleIsActive(args: ArgsFor<'is-active'>) {
        try {
            const data = await this.query<ProbeIsActiveResponse>('module-probe', args);
            return { content: [{ type: 'text' as const, text: formatIsActive(data) }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('is-active', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleListActive(args: ArgsFor<'list-active'>) {
        try {
            const data = await this.query<ProbeListActiveResponse>('module-probe', args);
            return { content: [{ type: 'text' as const, text: formatListActive(data) }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('list-active', e instanceof Error ? e.message : String(e));
        }
    }
}
