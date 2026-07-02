// Module Integration v2 Phase 3B — module-token-presentation MCP tool.
// 2-member bundle: boss-splash v1.2.1 + token-notes v3.0.1.
//
// CCR-12: per-action member guard in the foundry-module handler; get-bundle-status is unguarded.
// When a member is inactive the handler returns MODULE_NOT_ACTIVE (BaseTool.query() → throw →
// moduleNotActiveContent). Pre-flight with get-bundle-status (reachable even when both members off).
//
// boss-splash is transient (verify via currentOverlay — no document); token-notes writes flags
// (DP-16 verifiable). Anchors: DP-15 (concrete this.query<T> per action — never <any>).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { TOKEN_PRESENTATION_ACTIONS } from './schemas.js';
import type {
  TPBossSplashShowResult,
  TPBossSplashCloseResult,
  TPBossSplashConfigResult,
  TPNoteWriteResult,
  TPNoteReadResult,
  TPUseActorResult,
  TPNoteConfigResult,
  TPBundleStatusResult,
} from './schemas.js';

// ── Per-action formatters ─────────────────────────────────────────────────────

function formatShow(d: TPBossSplashShowResult): string {
  const who = d.actor ? `actor ${d.actor}` : d.video ? `video ${d.video}` : d.message ? `"${d.message}"` : 'splash';
  return `module-token-presentation.boss-splash.show: shown ${who} to all clients (overlayActive=${d.overlayActive}).`;
}
function formatClose(d: TPBossSplashCloseResult): string {
  return `module-token-presentation.boss-splash.close: closed (overlayActive=${d.overlayActive}).`;
}
function formatBSConfig(d: TPBossSplashConfigResult): string {
  return `module-token-presentation.boss-splash config: ${Object.keys(d.settings).length} setting(s).`;
}
function formatNoteWrite(d: TPNoteWriteResult): string {
  return `module-token-presentation.token-notes.write-note: wrote ${d.scope} note on ${d.targetId} (${d.text.length} chars).`;
}
function formatNoteRead(d: TPNoteReadResult): string {
  return `module-token-presentation.token-notes.read-note: ${d.scope} note on ${d.targetId}: ${d.text ? `"${d.text.slice(0, 120)}${d.text.length > 120 ? '…' : ''}"` : '(empty)'}.`;
}
function formatUseActor(d: TPUseActorResult): string {
  return `module-token-presentation.token-notes.set-use-actor: token ${d.tokenId} useActor=${d.useActor}.`;
}
function formatNoteConfig(d: TPNoteConfigResult): string {
  const word = d.allowplayers === 2 ? 'read+write' : d.allowplayers === 1 ? 'read-only' : 'none';
  return `module-token-presentation.token-notes config: allowplayers=${d.allowplayers} (${word}).`;
}
function formatBundleStatus(d: TPBundleStatusResult): string {
  const lines = d.members.map((m) => `  • ${m.id}: ${m.active ? 'ACTIVE' : 'inactive'}${m.version ? ` (v${m.version})` : ''}`);
  return `module-token-presentation.get-bundle-status:\n${lines.join('\n')}`;
}

export interface ModuleTokenPresentationToolOptions extends BaseToolOptions {}

export class ModuleTokenPresentationTool extends BaseTool {
  constructor(options: ModuleTokenPresentationToolOptions) {
    super(options);
  }

  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [{ name: 'module-token-presentation', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-token-presentation',
        title: 'Token presentation bundle — boss splash + token notes',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Two-member token-dressing bundle (WFRP4e): boss-splash (cinematic full-screen reveal to all clients) + token-notes (per-token / per-actor GM notes). CCR-12 — each member is independently activatable; actions guard on their own member. get-bundle-status is unguarded (use it to pre-flight which members are active).
Conditional: a member action returns MODULE_NOT_ACTIVE when that member is absent/inactive (token-notes also MODULE_DEPENDENCY_NOT_ACTIVE if lib-wrapper is off).

boss-splash is TRANSIENT — it broadcasts an overlay and persists NOTHING; verification is currentOverlay (overlayActive). token-notes writes flags.token-notes.* (server-verifiable).

10 actions:
boss-splash.show { actor? | video? | (message + actorImg), subText?, tokenName?, timerMs?(0=stay open), sound?, fill? } — needs at least one identity; refuses if a splash is already up (BOSS_SPLASH_ALREADY_ACTIVE). timerMs is MILLISECONDS.
boss-splash.close {} — dismiss the splash on all clients.
boss-splash.get-config {} — read the 18 world settings.
boss-splash.set-config { key, value } — write one boss-splash world setting.
token-notes.write-note { scope:'token'|'actor', sceneId?+tokenId? OR actorId, text } — '' clears. token scope = scene-local TokenDocument; actor scope = persists across scenes.
token-notes.read-note { scope, ids } — read the note text ('' if none).
token-notes.set-use-actor { sceneId?, tokenId, useActor } — toggle whether the token shows actor notes.
token-notes.get-config {} / token-notes.set-config { allowplayers:0|1|2 } — player permission (none/readonly/readwrite); gates the player UI, not MCP.
get-bundle-status {} — { members:[{id,active,title,version}] } for boss-splash + token-notes (UNGUARDED).
Example: { action: "boss-splash.show", actor: "actorId", message: "{{actor.name}} appears!", timerMs: 6000 }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [...TOKEN_PRESENTATION_ACTIONS],
              description: 'Token presentation action to perform.',
            },
            // boss-splash.show
            actor: { type: 'string', description: 'boss-splash.show: Actor id/UUID (pulls name + portrait).' },
            actorImg: { type: 'string', description: 'boss-splash.show: explicit image path (when no actor).' },
            video: { type: 'string', description: 'boss-splash.show: webm path (video splash).' },
            message: { type: 'string', description: 'boss-splash.show: Handlebars message ({{actor.name}}, {{token.name}}).' },
            subText: { type: 'string', description: 'boss-splash.show: second-band sub-text.' },
            tokenName: { type: 'string', description: 'boss-splash.show: overrides {{token.name}}.' },
            timerMs: { type: 'number', description: 'boss-splash.show: auto-dismiss MILLISECONDS (0 = stays open). NB world splashTimer setting is in seconds.' },
            sound: { type: 'string', description: 'boss-splash.show: audio file path.' },
            fill: { type: 'boolean', description: 'boss-splash.show: object-fit:fill on the video element.' },
            // boss-splash.set-config
            key: { type: 'string', description: 'boss-splash.set-config: world setting key.' },
            value: { description: 'boss-splash.set-config: the setting value (string | number | boolean).' },
            // token-notes
            scope: { type: 'string', enum: ['token', 'actor'], description: 'token-notes.write-note/read-note: token (scene-local) or actor (world-persistent).' },
            sceneId: { type: 'string', description: 'token-notes (token scope): scene that owns the token. Omit for active scene.' },
            tokenId: { type: 'string', description: 'token-notes (token scope) / set-use-actor: the TokenDocument id.' },
            actorId: { type: 'string', description: 'token-notes (actor scope): the Actor id/UUID.' },
            text: { type: 'string', description: 'token-notes.write-note: note text (plain + newlines); "" clears.' },
            useActor: { type: 'boolean', description: 'token-notes.set-use-actor: show actor notes instead of token notes.' },
            allowplayers: { type: 'number', enum: [0, 1, 2], description: 'token-notes.set-config: player permission (0 none, 1 readonly, 2 readwrite).' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: Record<string, unknown>) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-token-presentation action', { action });
    switch (action) {
      case 'boss-splash.show': return this.run<TPBossSplashShowResult>(action, rawArgs, formatShow);
      case 'boss-splash.close': return this.run<TPBossSplashCloseResult>(action, rawArgs, formatClose);
      case 'boss-splash.get-config': return this.run<TPBossSplashConfigResult>(action, rawArgs, formatBSConfig);
      case 'boss-splash.set-config': return this.run<TPBossSplashConfigResult>(action, rawArgs, formatBSConfig);
      case 'token-notes.write-note': return this.run<TPNoteWriteResult>(action, rawArgs, formatNoteWrite);
      case 'token-notes.read-note': return this.run<TPNoteReadResult>(action, rawArgs, formatNoteRead);
      case 'token-notes.set-use-actor': return this.run<TPUseActorResult>(action, rawArgs, formatUseActor);
      case 'token-notes.get-config': return this.run<TPNoteConfigResult>(action, rawArgs, formatNoteConfig);
      case 'token-notes.set-config': return this.run<TPNoteConfigResult>(action, rawArgs, formatNoteConfig);
      case 'get-bundle-status': return this.run<TPBundleStatusResult>(action, rawArgs, formatBundleStatus);
      default:
        return this.errorResponse('unknown', `unknown action: ${action}`);
    }
  }

  /** Run one action: typed query + format, intercept MODULE_NOT_ACTIVE, else BaseTool.errorResponse. */
  private async run<T>(action: string, args: Record<string, unknown>, fmt: (d: T) => string) {
    try {
      const data = await this.query<T>('module-token-presentation', args);
      return { content: [{ type: 'text' as const, text: fmt(data) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-token-presentation', msg);
      return this.errorResponse(action, msg);
    }
  }
}
