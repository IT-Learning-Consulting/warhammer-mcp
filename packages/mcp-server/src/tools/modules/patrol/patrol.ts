// Module Integration v1 Phase 14 — module-patrol MCP tool (patrol integration).
//
// Always-registered umbrella. The foundry-module handler guards on patrol being active; when inactive
// it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw → moduleNotActiveContent().
// Use module-probe.is-active patrol to pre-flight.
//
// 7 actions: read (get-config) + GM writes (enable-token, disable-token, set-wander-zone, set-path,
// apply-undetectable) + confirm-gated write (toggle-global).
//
// Anchors: DP-15 (concrete this.query<T> per action — never <any>).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import type {
  GetConfigResult,
  EnableTokenResult,
  DisableTokenResult,
  SetZoneResult,
  UndetectableResult,
  ToggleGlobalResult,
  EnableTokenItem,
  WorldSettingsResult,
  ListTokensResult,
  GenericPatrolResult,
} from './schemas.js';

const text = (s: string) => ({ content: [{ type: 'text' as const, text: s }] });

function errorContent(action: string, message: string) {
  return {
    content: [{ type: 'text' as const, text: `module-patrol/${action} failed: ${message}` }],
    isError: true,
  };
}

function itemLine(r: EnableTokenItem): string {
  return r.ok ? `  ✓ ${r.tokenName ?? r.tokenUuid}${r.mode ? ` (${r.mode})` : ''}` : `  ✗ ${r.tokenUuid}: ${r.error}`;
}

function formatGetConfig(d: GetConfigResult): string {
  const flags = Object.entries(d.flags).map(([k, v]) => `${k}=${v}`).join(', ');
  return [
    `module-patrol.get-config: ${d.tokenName}`,
    `- flags: ${flags}`,
    `- global: wander=${d.global.wanderStarted} path=${d.global.pathStarted}`,
  ].join('\n');
}

function formatEnable(d: EnableTokenResult): string {
  return `module-patrol.enable-token (${d.mode}):\n${d.results.map(itemLine).join('\n')}`;
}

function formatDisable(d: DisableTokenResult): string {
  return `module-patrol.disable-token:\n${d.results.map(itemLine).join('\n')}`;
}

function formatZone(d: SetZoneResult): string {
  return `module-patrol: Drawing "${d.label}" ${d.referenced ? 'referenced' : 'created'} (\`${d.drawingId}\`) on scene ${d.sceneId}`;
}

function formatUndetectable(d: UndetectableResult): string {
  return `module-patrol.apply-undetectable: ${d.actorName} patrolundetectable=${d.active}`;
}

function formatToggle(d: ToggleGlobalResult): string {
  return [
    `module-patrol.toggle-global: ${d.started ? 'started' : 'stopped'} (engines: ${d.engines})`,
    `- wander=${d.wanderStarted} path=${d.pathStarted}`,
    `- ⚠ ${d.note}`,
  ].join('\n');
}

function formatWorldSettings(d: WorldSettingsResult): string {
  const s = Object.entries(d.settings).map(([k, v]) => `${k}=${v}`).join(', ');
  const r = Object.entries(d.runtime).map(([k, v]) => `${k}=${v}`).join(', ');
  return [`module-patrol.get-world-settings:`, `- settings: ${s}`, `- runtime: ${r}`].join('\n');
}

function formatListTokens(d: ListTokensResult): string {
  if (!d.count) return `module-patrol.list-tokens: no patrol tokens on scene ${d.sceneId} (filter: ${d.filter}).`;
  const lines = d.tokens.map((t) => `  • ${t.tokenName} [${t.mode}] (${t.tokenUuid})`);
  return `module-patrol.list-tokens: ${d.count} token(s) (filter: ${d.filter}):\n${lines.join('\n')}`;
}

function formatGenericPatrol(action: string) {
  return (d: GenericPatrolResult): string => {
    const parts = Object.entries(d)
      .filter(([k]) => k !== 'note')
      .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`);
    return `module-patrol.${action}: ${parts.join(' · ')}`;
  };
}

export interface ModulePatrolToolOptions extends BaseToolOptions {}

export class ModulePatrolTool extends BaseTool {
  constructor(options: ModulePatrolToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-patrol',
        title: 'Patrol (NPC movement) integration',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Integrate patrol: configure NPC-movement engines (random-wander / path-follower), detection, and the global patrol toggle by writing token flags + zone Drawings. The canvas-ticker movement itself runs GM-client-side once flags are set.
Conditional: returns MODULE_NOT_ACTIVE when patrol is absent/inactive.
Pre-flight: module-probe.is-active patrol before using this tool.

7 actions:
Read — get-config { tokenUuid } (all patrol flags + global engine state).
GM writes — enable-token { tokenUuids[], mode: wander|path, spotting?, patrolPathName? (path), pathNodeIndex? (path), multiPath? (path) }; disable-token { tokenUuids[] } (clears all patrol flags); set-wander-zone { sceneId, points[]? (≥3 polygon verts) | drawingId? } (creates a "Patrol"-labeled Drawing); set-path { sceneId, pathName, points[]? (≥2) | drawingId? }; apply-undetectable { actorUuid, active }.
Confirm-gated write — toggle-global { started, engines?: wander|path|both, confirm:true } (starts/stops ALL patrol movement; runtime-only — resets on reload).

WRITE-ORDER: for path mode, call set-path FIRST (the named Drawing must exist before enable-token, else pathID resolves empty). Patrols pause during active combat and resume after. Global state is in-memory (not persisted).

Example: { action: "enable-token", tokenUuids: ["Scene.x.Token.y"], mode: "wander", spotting: true }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'get-token-config', 'get-world-settings', 'list-tokens', 'enable-token', 'disable-token',
                'set-wander-zone', 'set-path', 'apply-undetectable', 'configure', 'set-waypoint',
                'toggle-global', 'remap-paths',
              ],
              description: 'Patrol action to perform.',
            },
            tokenUuid: { type: 'string', description: 'get-token-config: token UUID (e.g. "Scene.x.Token.y").' },
            tokenUuids: { type: 'array', items: { type: 'string' }, description: 'enable-token/disable-token/set-waypoint: token UUIDs.' },
            filter: { type: 'string', enum: ['all', 'wander', 'path', 'spotting'], description: 'list-tokens: which patrol tokens to return (default all).' },
            patrolDelay: { type: 'number', description: 'configure: random-wander tick interval ms (500–10000).' },
            pathPatrolDelay: { type: 'number', description: 'configure: path-follower tick interval ms (500–10000).' },
            patrolAlertDelay: { type: 'number', description: 'configure: alert→spotted delay ms (0 = immediate spot, pauses game).' },
            patrolDiagonals: { type: 'boolean', description: 'configure: allow diagonal wander moves.' },
            patrolSmooth: { type: 'boolean', description: 'configure: smooth movement animation.' },
            patrolSound: { type: 'string', description: 'configure: audio path on patrolSpotted.' },
            patrolAlert: { type: 'string', description: 'configure: audio path on patrolAlerted.' },
            resetToRandomNode: { type: 'boolean', description: 'configure: on Drawing change, reset index to random vs 0.' },
            pathID: { type: 'string', description: 'set-waypoint: optionally switch the active path Drawing id.' },
            mode: { type: 'string', enum: ['wander', 'path'], description: 'enable-token: random-wander or path-follower.' },
            spotting: { type: 'boolean', description: 'enable-token: enable FOV detection (enableSpotting).' },
            patrolPathName: { type: 'string', description: 'enable-token path mode: the Drawing label to follow (must exist — call set-path first).' },
            pathNodeIndex: { type: 'number', description: 'enable-token path mode: starting waypoint index (default 0).' },
            multiPath: { type: 'boolean', description: 'enable-token path mode: cycle through multiple same-named Drawings.' },
            sceneId: { type: 'string', description: 'set-wander-zone/set-path: scene id.' },
            points: { type: 'array', items: { type: 'object', properties: { x: { type: 'number' }, y: { type: 'number' } } }, description: 'set-wander-zone (≥3) / set-path (≥2): polygon/polyline vertices in absolute canvas coords.' },
            drawingId: { type: 'string', description: 'set-wander-zone/set-path: reference (and relabel) an existing Drawing instead of creating one.' },
            pathName: { type: 'string', description: 'set-path: the Drawing label (must match enable-token patrolPathName).' },
            actorUuid: { type: 'string', description: 'apply-undetectable: actor UUID.' },
            active: { type: 'boolean', description: 'apply-undetectable: apply (true) or remove (false) the patrolundetectable status.' },
            started: { type: 'boolean', description: 'toggle-global: start (true) or stop (false) the engines.' },
            engines: { type: 'string', enum: ['wander', 'path', 'both'], description: 'toggle-global: which engine(s) (default both).' },
            confirm: { type: 'boolean', description: 'Required (true) for toggle-global.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: Record<string, unknown>) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-patrol action', { action });
    switch (action) {
      case 'get-token-config': return this.run<GetConfigResult>(action, rawArgs, formatGetConfig);
      case 'get-world-settings': return this.run<WorldSettingsResult>(action, rawArgs, formatWorldSettings);
      case 'list-tokens': return this.run<ListTokensResult>(action, rawArgs, formatListTokens);
      case 'enable-token': return this.run<EnableTokenResult>(action, rawArgs, formatEnable);
      case 'disable-token': return this.run<DisableTokenResult>(action, rawArgs, formatDisable);
      case 'set-wander-zone': return this.run<SetZoneResult>(action, rawArgs, formatZone);
      case 'set-path': return this.run<SetZoneResult>(action, rawArgs, formatZone);
      case 'apply-undetectable': return this.run<UndetectableResult>(action, rawArgs, formatUndetectable);
      case 'toggle-global': return this.run<ToggleGlobalResult>(action, rawArgs, formatToggle);
      case 'configure':
      case 'set-waypoint':
      case 'remap-paths':
        return this.run<GenericPatrolResult>(action, rawArgs, formatGenericPatrol(action));
      default:
        return errorContent('unknown', `unknown action: ${action}`);
    }
  }

  private async run<T>(action: string, args: Record<string, unknown>, fmt: (d: T) => string) {
    try {
      const data = await this.query<T>('module-patrol', args);
      return text(fmt(data));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('MODULE_NOT_ACTIVE')) return moduleNotActiveContent('module-patrol', msg);
      return errorContent(action, msg);
    }
  }
}
