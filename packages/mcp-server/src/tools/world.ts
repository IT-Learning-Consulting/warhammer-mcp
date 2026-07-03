// Phase 4 mcp_crud_expansion — World tool (extracted from tools/scene.ts).
//
// `get-world-info` was historically mis-bucketed in tools/scene.ts. The Phase 4
// umbrella refactor is the right moment to fix it: a dedicated `world` tool
// owns the world-utility surface. The query handler stays at
// `warhammer-mcp.getWorldInfo` (no foundry-module change) — only the MCP-server
// tool bucketing moves.
//
// CCR-Envelope-Consumer: typed concrete payload, no <any>.

import { BaseTool, BaseToolOptions } from '../base-tool.js';

// Concrete payload shape returned by the warhammer-mcp.getWorldInfo handler.
// Mirrors data-access.ts's WorldInfo without importing the foundry-module types
// (mcp-server only consumes the response surface, not internal Foundry types).
interface WorldInfoPayload {
  id?: string;
  title?: string;
  system?: string;
  systemVersion?: string;
  foundryVersion?: string;
  users?: Array<{ id: string; name: string; isGM: boolean; active: boolean }>;
}

interface WorldInfoResponse {
  id: string;
  title: string;
  system: { id: string; version: string };
  foundry: { version: string };
  users: { total: number; active: number; gms: number; players: number };
  activeUsers: Array<{ id: string; name: string; isGM: boolean }>;
}

export interface WorldToolOptions extends BaseToolOptions {}

export class WorldTool extends BaseTool {
  constructor(options: WorldToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'get-world-info', handler: (args: any) => this.handleGetWorldInfo(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'get-world-info',
        title: 'Get World Info',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        description:
          'Get basic information about the Foundry world and game system (e.g., D&D 5e, WFRP 4e). Use this to understand what system is being used and tailor responses accordingly.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  async handleGetWorldInfo(_args: unknown) {
    try {
      const data = await this.query<WorldInfoPayload>('getWorldInfo');

      const response: WorldInfoResponse = {
        id: data.id ?? '',
        title: data.title ?? '',
        system: {
          id: data.system ?? '',
          version: data.systemVersion ?? '',
        },
        foundry: {
          version: data.foundryVersion ?? '',
        },
        users: {
          total: data.users?.length ?? 0,
          active: data.users?.filter((u) => u.active).length ?? 0,
          gms: data.users?.filter((u) => u.isGM).length ?? 0,
          players: data.users?.filter((u) => !u.isGM).length ?? 0,
        },
        activeUsers:
          data.users
            ?.filter((u) => u.active)
            .map((u) => ({ id: u.id, name: u.name, isGM: u.isGM })) ?? [],
      };

      const text =
        `🌍 **World Info**\n\n` +
        `**Title:** ${response.title}\n` +
        `**ID:** \`${response.id}\`\n` +
        `**System:** ${response.system.id} v${response.system.version}\n` +
        `**Foundry version:** ${response.foundry.version}\n\n` +
        `### Users\n` +
        `- Total: ${response.users.total}\n` +
        `- Active: ${response.users.active}\n` +
        `- GMs: ${response.users.gms}\n` +
        `- Players: ${response.users.players}\n\n` +
        `### Active users\n` +
        (response.activeUsers.length === 0
          ? '_(no one connected)_'
          : response.activeUsers
              .map((u) => `- ${u.isGM ? '👑 ' : ''}${u.name} (\`${u.id}\`)`)
              .join('\n'));

      return {
        content: [{ type: 'text' as const, text }],
        structuredContent: response,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return this.errorResponse('get-world-info', message);
    }
  }
}
