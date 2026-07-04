// Module Integration v2 Phase 3A — module-token-attacher MCP tool (Token Attacher v4.6.12, KayelGee).
//
// Always-registered umbrella. The foundry-module handler guards on token-attacher (+ lib-wrapper hard
// dep) being active; when inactive it returns MODULE_NOT_ACTIVE / MODULE_DEPENDENCY_NOT_ACTIVE which
// BaseTool.query() converts to a throw → moduleNotActiveContent(). Pre-flight with
// module-probe.is-active token-attacher.
//
// 5 actions: attach / detach / detach-all (canvas-mandatory; resolve ids → live placeables, DP-16
// re-read of flags.token-attacher.attached) + query-attached / query-by-type (headless flag reads).
// Anchors: DP-15 (concrete this.query<T> per action — never <any>); R2.4 (errors via BaseTool.errorResponse).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { TOKEN_ATTACHER_ACTIONS } from './schemas.js';
import { z } from 'zod';
import { TokenAttacherInput } from '@foundry-mcp/shared';

type TokenAttacherArgs = z.infer<typeof TokenAttacherInput>;
import type {
  TAAttachResult,
  TADetachAllResult,
  TAQueryAttachedResult,
  TAQueryByTypeResult,
} from './schemas.js';

// ── Per-action formatters ─────────────────────────────────────────────────────

function formatAttach(d: TAAttachResult): string {
  const total = Object.values(d.attached).reduce((n, ids) => n + ids.length, 0);
  return `module-token-attacher.attach: attached ${d.affected.length} element(s) to token ${d.baseTokenId} — ${total} now attached total.`;
}
function formatDetach(d: TAAttachResult): string {
  const total = Object.values(d.attached).reduce((n, ids) => n + ids.length, 0);
  return `module-token-attacher.detach: detached ${d.affected.length} element(s) from token ${d.baseTokenId} — ${total} still attached.`;
}
function formatDetachAll(d: TADetachAllResult): string {
  return `module-token-attacher.detach-all: cleared all attachments on token ${d.baseTokenId} (cleared=${d.cleared}).`;
}
function formatQueryAttached(d: TAQueryAttachedResult): string {
  if (!d.total) return `module-token-attacher.query-attached: token ${d.baseTokenId} has no attached elements.`;
  const lines = Object.entries(d.attached).map(([type, ids]) => `  • ${type}: ${ids.length}`);
  return `module-token-attacher.query-attached: token ${d.baseTokenId} — ${d.total} attached element(s):\n${lines.join('\n')}`;
}
function formatQueryByType(d: TAQueryByTypeResult): string {
  return `module-token-attacher.query-by-type: token ${d.baseTokenId} has ${d.ids.length} attached ${d.type}(s)${d.ids.length ? `: ${d.ids.join(', ')}` : ''}.`;
}

export interface ModuleTokenAttacherToolOptions extends BaseToolOptions {}

export class ModuleTokenAttacherTool extends BaseTool {
  constructor(options: ModuleTokenAttacherToolOptions) {
    super(options);
  }

  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [{ name: 'module-token-attacher', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-token-attacher',
        title: 'Token Attacher integration — bind canvas placeables to a base token',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Attach / detach canvas placeables (tiles, lights, sounds, drawings, templates, notes, walls, regions, tokens) to a base Token so they move/rotate together — Token Attacher (WFRP4e). State persists as flags.token-attacher.attached on the base TokenDocument (server-verifiable).
Conditional: returns MODULE_NOT_ACTIVE when token-attacher is absent/inactive, MODULE_DEPENDENCY_NOT_ACTIVE when its hard dep lib-wrapper is off.
Pre-flight: module-probe.is-active token-attacher before using this tool.

CANVAS-MANDATORY for attach/detach/detach-all: Token Attacher reads live placeable geometry, so the scene must be open and the canvas ready (else TOKEN_ATTACHER_CANVAS_NOT_READY). query-* are headless flag reads.

5 actions:
attach { baseTokenId, sceneId?, elements:[{type,id}] } — bind one+ placeables; re-reads + verifies each landed (TOKEN_ATTACHER_NOT_PERSISTED if Token Attacher silently dropped an off-canvas id).
detach { baseTokenId, sceneId?, elements:[{type,id}] } — unbind specific placeables.
detach-all { baseTokenId, sceneId? } — clear the whole attached map.
query-attached { baseTokenId, sceneId? } — read the { [type]: ids[] } attached map (headless).
query-by-type { baseTokenId, sceneId?, type } — read the attached ids of one type (headless).

Element type is the placeable document name: AmbientLight | AmbientSound | Drawing | MeasuredTemplate | Note | Tile | Token | Wall | Region. ids are scene-embedded placeable ids. sceneId defaults to the active scene.
NOT wrapped (UI-gated): JSON import/export, Quick Edit Mode, the Attach UI (Dialog.prompt deadlock risk).
Example: { action: "attach", baseTokenId: "abc123", elements: [{ type: "Tile", id: "tile456" }, { type: "AmbientLight", id: "light789" }] }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [...TOKEN_ATTACHER_ACTIONS],
              description: 'Token Attacher action to perform.',
            },
            baseTokenId: { type: 'string', description: 'The base Token placeable id (the anchor everything attaches to).' },
            sceneId: { type: 'string', description: 'Scene that owns the token + elements. Omit for the active scene.' },
            elements: {
              type: 'array',
              description: 'attach/detach: the placeables to (un)bind — each { type, id }.',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['AmbientLight', 'AmbientSound', 'Drawing', 'MeasuredTemplate', 'Note', 'Tile', 'Token', 'Wall', 'Region'],
                    description: 'The placeable document type.',
                  },
                  id: { type: 'string', description: 'The scene-embedded placeable id.' },
                },
                required: ['type', 'id'],
              },
            },
            type: {
              type: 'string',
              enum: ['AmbientLight', 'AmbientSound', 'Drawing', 'MeasuredTemplate', 'Note', 'Tile', 'Token', 'Wall', 'Region'],
              description: 'query-by-type: the single placeable document type to read.',
            },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: TokenAttacherArgs) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-token-attacher action', { action });
    switch (action) {
      case 'attach': return this.run<TAAttachResult>(action, rawArgs, formatAttach);
      case 'detach': return this.run<TAAttachResult>(action, rawArgs, formatDetach);
      case 'detach-all': return this.run<TADetachAllResult>(action, rawArgs, formatDetachAll);
      case 'query-attached': return this.run<TAQueryAttachedResult>(action, rawArgs, formatQueryAttached);
      case 'query-by-type': return this.run<TAQueryByTypeResult>(action, rawArgs, formatQueryByType);
      default:
        return this.errorResponse('unknown', `unknown action: ${action}`);
    }
  }

  /** Run one action: typed query + format, intercept MODULE_NOT_ACTIVE, else BaseTool.errorResponse. */
  private async run<T>(action: string, args: Record<string, unknown>, fmt: (d: T) => string) {
    try {
      const data = await this.query<T>('module-token-attacher', args);
      return { content: [{ type: 'text' as const, text: fmt(data) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-token-attacher', msg);
      return this.errorResponse(action, msg);
    }
  }
}
