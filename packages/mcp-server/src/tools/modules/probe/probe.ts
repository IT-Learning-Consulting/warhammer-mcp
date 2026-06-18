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

2 actions:
- is-active  { moduleId }  — checks whether a specific module is installed and active.
- list-active              — lists all currently active modules (id, title, version).

is-active never errors on an absent module — it returns { active: false }.
GM required.

Examples:
- { action: "is-active", moduleId: "monks-active-tiles" }
- { action: "list-active" }`,
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
