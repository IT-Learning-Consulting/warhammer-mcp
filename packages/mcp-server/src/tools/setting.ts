// Phase 4 mcp_completion_v1 — Setting MCP tool.
//
// 4 actions: get, set, list, list-world-db.
// `register` and `delete` are intentionally excluded (R4.4).
// inputSchema.properties is hand-written enumerating EVERY field across all 4 actions.
//
// WARNING: setting.set on side-effecting keys (e.g. `enabled`, `serverHost`, `serverPort`)
// triggers Foundry onChange callbacks that may restart the MCP bridge or re-render canvas.
// Pass `force:true` to override the safety block. Default is safe (force:false).
//
// Anchors:
//   - DP-15: typed query<T>; no <any> on response side.
//   - DP-19: every formatter field reflected in the description.

import { z } from 'zod';
import {
    SettingToolInput,
    type SettingViewModel,
    type SettingListItem,
    type SettingWorldDbItem,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type SettingArgs = z.infer<typeof SettingToolInput>;
type ArgsFor<A extends SettingArgs['action']> = Extract<SettingArgs, { action: A }>;

// ── Inline response shapes (DP-15) ───────────────────────────────────────────

interface SettingGetResponse {
    setting: SettingViewModel;
}

interface SettingSetResponse {
    setting: SettingViewModel;
    verified: boolean;
}

interface SettingListResponse {
    total: number;
    items?: SettingListItem[];
}

interface SettingListWorldDbResponse {
    total: number;
    items?: SettingWorldDbItem[];
}

// ── Helpers ───────────────────────────────────────────────────────────────


function formatSettingView(s: SettingViewModel): string {
    return [
        `**${s.fullKey}**`,
        `- Scope: ${s.scope} | Type: ${s.typeLabel}`,
        `- Has onChange: ${s.hasOnChange ? 'yes (side-effect capable)' : 'no'}`,
        `- Value: \`${JSON.stringify(s.value)}\``,
    ].join('\n');
}

function formatSettingListItem(item: SettingListItem): string {
    return `- \`${item.fullKey}\` [${item.scope}/${item.typeLabel}]${item.hasOnChange ? ' ⚠ onChange' : ''}`;
}

function formatWorldDbItem(item: SettingWorldDbItem): string {
    const valueStr = JSON.stringify(item.value);
    const preview = valueStr.length > 60 ? valueStr.slice(0, 57) + '...' : valueStr;
    return `- \`${item.key}\` = ${preview} (id: \`${item.id}\`)`;
}

export interface SettingToolOptions extends BaseToolOptions { }

export class SettingTool extends BaseTool {
    constructor(options: SettingToolOptions) {
        super(options);
    }

    // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
    getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
      return [
          { name: 'setting', handler: (args: any) => this.execute(args) },
      ];
    }

    getToolDefinitions() {
        return [
            {
                name: 'setting',
                title: 'Foundry world setting management',
                annotations: {
                    readOnlyHint: false,
                    destructiveHint: false,
                    idempotentHint: false,
                    openWorldHint: true,
                },
                description:
                    `Manage Foundry world settings through one umbrella tool. 4 actions: get, set, list, list-world-db.

WARNING: setting.set on side-effecting keys (e.g. enabled, serverHost, serverPort) triggers Foundry onChange callbacks that may restart the MCP bridge or re-render the canvas. Pass force:true to override the safety block. The default (force:false) will block writes to any key with a registered onChange callback.

register and delete are intentionally excluded: register requires an un-marshalable constructor reference; delete has no legitimate use case (use set-to-default instead).

Key rules:
- get/set use namespace + key as separate fields (not the composite "namespace.key" form).
- list iterates all registered settings (including those at their default value).
- list-world-db iterates only settings that have been explicitly written to the Foundry DB.
- force:true bypasses both the blocklist (enabled/serverHost/serverPort) AND the onChange advisory.
- set verifies persistence via round-trip JSON.stringify comparison after game.settings.set().

Examples:
- {action:"get", namespace:"warhammer-mcp", key:"mcpVerboseConsole"}
- {action:"set", namespace:"warhammer-mcp", key:"auditWritesToChat", value:true}
- {action:"set", namespace:"warhammer-mcp", key:"enabled", value:false, force:true}
- {action:"list", namespacePrefix:"warhammer-mcp", scopeFilter:"world"}
- {action:"list-world-db", namespacePrefix:"warhammer-mcp"}`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            enum: ['get', 'set', 'list', 'list-world-db'],
                            description: 'The setting action to perform. Note: register and delete are not exposed.',
                        },
                        namespace: {
                            type: 'string',
                            description: '[get/set] Setting namespace (e.g. "warhammer-mcp", "wfrp4e", "core").',
                        },
                        key: {
                            type: 'string',
                            description: '[get/set] Setting key within the namespace (e.g. "mcpVerboseConsole"). Do not include the namespace prefix.',
                        },
                        value: {
                            anyOf: [
                                { type: 'object', additionalProperties: true },
                                { type: 'string' },
                                { type: 'number' },
                                { type: 'boolean' },
                                { type: 'array', items: {} },
                                { type: 'null' },
                            ],
                            description: '[set] New value to write. Must be JSON-serializable. Will be round-trip verified after write.',
                        },
                        force: {
                            type: 'boolean',
                            description: '[set] If true, bypass the blocklist (enabled/serverHost/serverPort) AND the onChange advisory. Default false. WARNING: using force:true on K7-class keys may restart the MCP bridge.',
                        },
                        scope: {
                            type: 'string',
                            enum: ['world', 'client', 'user'],
                            description: '[get] Optional scope hint (world/client/user). Not used for filtering in get; informational only.',
                        },
                        namespacePrefix: {
                            type: 'string',
                            description: '[list/list-world-db] Filter settings whose namespace starts with this prefix.',
                        },
                        scopeFilter: {
                            type: 'string',
                            enum: ['world', 'client', 'user'],
                            description: '[list] Filter settings by scope.',
                        },
                        countOnly: {
                            type: 'boolean',
                            description: '[list/list-world-db] If true, return only the total count without items.',
                        },
                    },
                    required: ['action'],
                },
            },
        ];
    }

    async execute(args: SettingArgs) {
        this.logger.info('Executing setting action', { action: args.action });
        switch (args.action) {
            case 'get':
                return this.handleGet(args);
            case 'set':
                return this.handleSet(args);
            case 'list':
                return this.handleList(args);
            case 'list-world-db':
                return this.handleListWorldDb(args);
        }
    }

    private async handleGet(args: ArgsFor<'get'>) {
        try {
            const data = await this.query<SettingGetResponse>('setting', args);
            return { content: [{ type: 'text' as const, text: formatSettingView(data.setting) }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('get', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleSet(args: ArgsFor<'set'>) {
        try {
            const data = await this.query<SettingSetResponse>('setting', args);
            const text = [
                'Setting Updated',
                '',
                formatSettingView(data.setting),
                '',
                `Verified: ${data.verified ? 'yes' : 'no'}`,
            ].join('\n');
            return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('set', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleList(args: ArgsFor<'list'>) {
        try {
            const data = await this.query<SettingListResponse>('setting', args);
            if (!data.items) {
                return { content: [{ type: 'text' as const, text: `Total settings: ${data.total}` }], structuredContent: data as unknown as Record<string, unknown> };
            }
            if (data.items.length === 0) {
                return { content: [{ type: 'text' as const, text: 'No settings found matching criteria.' }], structuredContent: data as unknown as Record<string, unknown> };
            }
            const lines = data.items.map(formatSettingListItem);
            const text = `Settings (${data.total} total)\n\n${lines.join('\n')}`;
            return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('list', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleListWorldDb(args: ArgsFor<'list-world-db'>) {
        try {
            const data = await this.query<SettingListWorldDbResponse>('setting', args);
            if (!data.items) {
                return { content: [{ type: 'text' as const, text: `Total persisted settings: ${data.total}` }], structuredContent: data as unknown as Record<string, unknown> };
            }
            if (data.items.length === 0) {
                return { content: [{ type: 'text' as const, text: 'No persisted settings found matching criteria.' }], structuredContent: data as unknown as Record<string, unknown> };
            }
            const lines = data.items.map(formatWorldDbItem);
            const text = `Persisted World Settings (${data.total} total)\n\n${lines.join('\n')}`;
            return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('list-world-db', e instanceof Error ? e.message : String(e));
        }
    }
}
