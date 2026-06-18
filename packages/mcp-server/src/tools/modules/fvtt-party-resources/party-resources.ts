// Module Integration v1 Phase 11 — module-party-resources MCP tool (Party Resources).
//
// Always-registered umbrella. The foundry-module handler guards on fvtt-party-resources being
// active; when inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw →
// moduleNotActiveContent(). Use module-probe.is-active fvtt-party-resources to pre-flight.
//
// 8 actions: reads (list, get) + GM-gated writes (set-value, increment, decrement, update-meta) +
// confirm-gated writes (create, delete).
//
// Anchors: DP-15 (concrete this.query<T> per action — never <any>); R2.4 (errors via BaseTool.errorResponse).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import type {
  PartyListResult,
  PartyGetResult,
  PartySetValueResult,
  PartyIncrementResult,
  PartyDecrementResult,
  PartyUpdateMetaResult,
  PartyCreateResult,
  PartyDeleteResult,
  PartyResourceSnapshot,
} from './schemas.js';

const text = (s: string) => ({ content: [{ type: 'text' as const, text: s }] });


// ── Per-action formatters (surface every handler-returned field — Phase-6 drift lesson) ─────

function snapLine(r: PartyResourceSnapshot): string {
  const vis = r.visible ? '' : ' (hidden)';
  const pm = r.playerManaged ? ' [player-managed]' : '';
  const chat = r.notifyChat ? ' [chat]' : '';
  return `  • ${r.name || r.id} (${r.id}): ${r.value} [${r.min}..${r.max}]${vis}${pm}${chat}`;
}

function formatList(d: PartyListResult): string {
  if (!d.count) return 'module-party-resources.list: no resources registered.';
  return `module-party-resources.list: ${d.count} resource(s):\n${d.resources.map(snapLine).join('\n')}`;
}
function formatGet(d: PartyGetResult): string {
  return `module-party-resources.get: "${d.name || d.id}" (${d.id}) = ${d.value} [${d.min}..${d.max}], visible ${d.visible}, player-managed ${d.playerManaged}, notify-chat ${d.notifyChat}, icon ${d.useIcon ? d.icon : '(off)'}, position ${d.position}.`;
}
function formatSetValue(d: PartySetValueResult): string {
  return `module-party-resources.set-value: ${d.resourceId} ${d.previousValue} → ${d.value}${d.notifyChat ? ' (chat broadcast)' : ''}.`;
}
function formatIncrement(d: PartyIncrementResult): string {
  return `module-party-resources.increment: ${d.resourceId} ${d.previousValue} → ${d.value} (+${d.jump}, max ${d.max}).`;
}
function formatDecrement(d: PartyDecrementResult): string {
  return `module-party-resources.decrement: ${d.resourceId} ${d.previousValue} → ${d.value} (-${d.jump}, min ${d.min}).`;
}
function formatUpdateMeta(d: PartyUpdateMetaResult): string {
  return `module-party-resources.update-meta: ${d.resourceId} updated [${d.updatedFields.join(', ')}] → now "${d.snapshot.name || d.snapshot.id}" = ${d.snapshot.value} [${d.snapshot.min}..${d.snapshot.max}], visible ${d.snapshot.visible}.`;
}
function formatCreate(d: PartyCreateResult): string {
  const s = d.snapshot;
  return `module-party-resources.create: "${s.name || s.id}" (${s.id}) created — value ${s.value} [${s.min}..${s.max}], visible ${s.visible}, position ${s.position}.`;
}
function formatDelete(d: PartyDeleteResult): string {
  return `module-party-resources.delete: "${d.resourceId}" removed (${d.remaining} resource(s) remaining).`;
}

export interface ModulePartyResourcesToolOptions extends BaseToolOptions {}

export class ModulePartyResourcesTool extends BaseTool {
  constructor(options: ModulePartyResourcesToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'module-party-resources', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-party-resources',
        title: 'Party Resources integration',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Integrate Party Resources (fvtt-party-resources): shared party resource tracks (doom/corruption/coin pools, etc.) with full CRUD over a world-settings store.
Conditional: returns MODULE_NOT_ACTIVE when fvtt-party-resources is absent/inactive.
Pre-flight: module-probe.is-active fvtt-party-resources before using this tool.

8 actions:
Reads — list (all resources + metadata); get { resourceId } (single resource value + metadata).
Writes (GM) — set-value { resourceId, value, notifyChat? } (notifyChat:true broadcasts the change to chat); increment { resourceId, jump? } (clamped to max); decrement { resourceId, jump? } (clamped to min); update-meta { resourceId, name?, max?, min?, visible?, playerManaged?, icon?, useIcon?, notifyChat?, incMessage?, decMessage? }.
Confirm-gated writes (GM + confirm:true) — create { resourceId, name?, value?, max?, min?, visible?, playerManaged?, icon?, notifyChat?, confirm } (registers a new track); delete { resourceId, confirm } (removes from the tracker).

resourceId must be lowercase letters/digits/underscore/hyphen.
Example: { action: "create", resourceId: "doom_track", name: "Doom", value: 0, max: 13, min: 0, confirm: true }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['list', 'get', 'set-value', 'increment', 'decrement', 'update-meta', 'create', 'delete'],
              description: 'Party Resources action to perform.',
            },
            resourceId: { type: 'string', description: 'Resource id (lowercase letters/digits/underscore/hyphen). Required for all actions except list.' },
            value: { type: 'number', description: 'set-value/create: the resource value.' },
            jump: { type: 'number', description: 'increment/decrement: step size (default 1).' },
            name: { type: 'string', description: 'create/update-meta: display name.' },
            max: { type: 'number', description: 'create/update-meta: ceiling (default 100).' },
            min: { type: 'number', description: 'create/update-meta: floor (default -100).' },
            visible: { type: 'boolean', description: 'create/update-meta: player visibility.' },
            playerManaged: { type: 'boolean', description: 'create/update-meta: allow players to change the value.' },
            icon: { type: 'string', description: 'create/update-meta: icon path (must exist in Foundry user data).' },
            useIcon: { type: 'boolean', description: 'update-meta: show icon instead of name.' },
            notifyChat: { type: 'boolean', description: 'set-value/create/update-meta: chat-notify on value change.' },
            incMessage: { type: 'string', description: 'update-meta: chat message on increase.' },
            decMessage: { type: 'string', description: 'update-meta: chat message on decrease.' },
            confirm: { type: 'boolean', description: 'Required (true) for create and delete.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: Record<string, unknown>) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-party-resources action', { action });
    switch (action) {
      case 'list': return this.run<PartyListResult>(action, rawArgs, formatList);
      case 'get': return this.run<PartyGetResult>(action, rawArgs, formatGet);
      case 'set-value': return this.run<PartySetValueResult>(action, rawArgs, formatSetValue);
      case 'increment': return this.run<PartyIncrementResult>(action, rawArgs, formatIncrement);
      case 'decrement': return this.run<PartyDecrementResult>(action, rawArgs, formatDecrement);
      case 'update-meta': return this.run<PartyUpdateMetaResult>(action, rawArgs, formatUpdateMeta);
      case 'create': return this.run<PartyCreateResult>(action, rawArgs, formatCreate);
      case 'delete': return this.run<PartyDeleteResult>(action, rawArgs, formatDelete);
      default:
        return this.errorResponse('unknown', `unknown action: ${action}`);
    }
  }

  /** Run one action: typed query + format, intercept MODULE_NOT_ACTIVE, else BaseTool.errorResponse. */
  private async run<T>(action: string, args: Record<string, unknown>, fmt: (d: T) => string) {
    try {
      const data = await this.query<T>('module-party-resources', args);
      return { content: [{ type: 'text' as const, text: fmt(data) }], structuredContent: data as Record<string, unknown> };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-party-resources', msg);
      return this.errorResponse(action, msg);
    }
  }
}
