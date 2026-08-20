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
          `Get a point-in-time snapshot of the Foundry world: title, id, game system (e.g. wfrp4e) + version, Foundry core version, and connected-user roster (GM/player, active/inactive).

Use this when:
- Starting a session and you need to know which game system is active (e.g. wfrp4e vs dnd5e) before choosing system-specific tools like get-wfrp-config.
- Checking who is currently connected and which of them are GMs before sending a GM-visible notify or running a player-facing macro.
- Confirming the Foundry core/system version to reason about which API surface is available.
- Reporting world identity (title, id) back to the user at the start of a task.

Do NOT use this to poll for live user-presence changes — it is a single snapshot, not a subscription; call it again for a fresh read rather than expecting push updates.

Performance Notes:
- Single small fixed-shape response (world metadata + user list), no response modes, no pagination, no size bound of practical concern.`,
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
