// Module Integration v2 Phase 13A — module-portal MCP tool (Portal v3.0.4, Posh Rat Games).
//
// Always-registered umbrella. The foundry-module handler guards on portal-lib being active; when inactive it
// returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw -> moduleNotActiveContent().
// Pre-flight with module-probe.is-active portal-lib.
//
// 1 action: spawn. Direct globalThis.Portal fluent builder (addCreature -> setLocation -> spawn), NOT a macro
// bridge. F04: `creatures` is a non-scalar (array-of-object) param — declared with explicit type:'array' +
// items schema so it doesn't silently stringify across the MCP boundary.
//
// STRICT SCENE GUARD: Portal writes to canvas.scene ONLY (no sceneId parameter of its own) — sceneId here MUST
// match the live canvas.scene.id or the call refuses with PORTAL_WRONG_SCENE_ACTIVE.

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { PORTAL_ACTIONS, type PortalResult } from './schemas.js';
import { z } from 'zod';
import { PortalInput } from '@foundry-mcp/shared';

type PortalArgs = z.infer<typeof PortalInput>;

function formatResult(d: PortalResult): string {
  const p = 'module-portal';
  // Single-action umbrella (1-member union — not a real discriminatedUnion exhaustiveness case):
  // no `never`-exhaustive default per [[feedback_single_action_module_umbrella_exhaustiveness]].
  return `${p}.spawn: ${d.tokenIds.length} token(s) spawned on scene ${d.sceneId}: ${d.tokenIds.join(', ')}.`;
}

export interface ModulePortalToolOptions extends BaseToolOptions {}

export class ModulePortalTool extends BaseTool {
  constructor(options: ModulePortalToolOptions) {
    super(options);
  }

  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [{ name: 'module-portal', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-portal',
        title: 'Portal integration — headless prototype-preserving token spawn',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Drive the Portal module to spawn one or more tokens sourced from Actor.getTokenDocument() (prototype-preserving — avoids the plain token.create art/vision/bars loss trap) onto the GM's currently-viewed canvas scene.
Conditional: returns MODULE_NOT_ACTIVE when portal-lib is absent/inactive. Pre-flight: module-probe.is-active portal-lib.

CANVAS-BOUND, STRICT SCENE GUARD: Portal has NO sceneId parameter of its own — it always spawns onto canvas.scene (the scene currently open in the GM's Foundry client). sceneId here is REQUIRED and is checked against the live canvas.scene.id; a mismatch refuses with PORTAL_WRONG_SCENE_ACTIVE (activate the target scene in the GM client first) rather than silently spawning onto the wrong scene. Also requires canvas.ready (PORTAL_CANVAS_NOT_READY otherwise).

1 action:
spawn { sceneId, creatures: [{ uuid, count?, updateData? }], x, y, elevation? } — GM-only. Builds a Portal() fluent call: addCreature(uuid, {count}) per entry, setLocation({x,y,elevation}), then an awaited spawn(). Returns the spawned tokenIds.

Example: { action: "spawn", sceneId: "abc123", creatures: [{ uuid: "Actor.xyz789" }], x: 1500, y: 1200 }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: [...PORTAL_ACTIONS], description: 'Portal action to perform.' },
            sceneId: { type: 'string', description: 'spawn: MUST match the currently-viewed canvas scene id — PORTAL_WRONG_SCENE_ACTIVE otherwise.' },
            creatures: {
              type: 'array',
              description: 'spawn: one or more creatures to spawn, each sourced via Actor.getTokenDocument() (prototype-preserving).',
              items: {
                type: 'object',
                properties: {
                  uuid: { type: 'string', description: 'Actor UUID (world or compendium).' },
                  count: { type: 'integer', minimum: 1, description: 'How many copies of this creature to spawn (default 1).' },
                  updateData: { type: 'object', description: 'Optional per-creature TokenDocument field overrides (e.g. name, disposition).', additionalProperties: true },
                },
                required: ['uuid'],
              },
            },
            x: { type: 'number', description: 'spawn: target canvas x coordinate.' },
            y: { type: 'number', description: 'spawn: target canvas y coordinate.' },
            elevation: { type: 'number', description: 'spawn (optional): target elevation.' },
          },
          required: ['action', 'sceneId', 'creatures', 'x', 'y'],
        },
      },
    ];
  }

  async execute(rawArgs: PortalArgs) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-portal action', { action });
    if (!(PORTAL_ACTIONS as readonly string[]).includes(action)) {
      return this.errorResponse(action, `unknown action: ${action}`);
    }
    try {
      const data = await this.query<PortalResult>('module-portal', rawArgs);
      return {
        content: [{ type: 'text' as const, text: formatResult(data) }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-portal', msg);
      return this.errorResponse(action, msg);
    }
  }
}
