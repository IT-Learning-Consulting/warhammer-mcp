// Module Integration v1 Phase 11 — module-gmtoolkit MCP tool (WFRP4e GM Toolkit).
//
// Always-registered umbrella. The foundry-module handler guards on wfrp4e-gm-toolkit being active;
// when inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw →
// moduleNotActiveContent(). Use module-probe.is-active wfrp4e-gm-toolkit to pre-flight.
//
// 12 actions: reads (get-session-info, get-group, check-conditions) + GM-gated writes
// (run-group-test, update-advantage, adjust-status, toggle-scene-light, pull-to-scene,
// toggle-compendium-visibility, roll-d100) + confirm-gated writes (session-turnover, add-xp).
//
// Anchors: DP-15 (concrete this.query<T> per action — never <any>); CCR-G2 (errorContent local).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import type {
  GmtoolkitGroupTestResult,
  GmtoolkitAdvantageResult,
  GmtoolkitSessionInfoResult,
  GmtoolkitGroupResult,
  GmtoolkitAdjustStatusResult,
  GmtoolkitSceneLightResult,
  GmtoolkitPullResult,
  GmtoolkitCompendiumResult,
  GmtoolkitD100Result,
  GmtoolkitConditionsResult,
  GmtoolkitSessionTurnoverResult,
  GmtoolkitAddXpResult,
} from './schemas.js';

const text = (s: string) => ({ content: [{ type: 'text' as const, text: s }] });

function errorContent(action: string, message: string) {
  return {
    content: [{ type: 'text' as const, text: `module-gmtoolkit/${action} failed: ${message}` }],
    isError: true,
  };
}

// ── Per-action formatters (surface every handler-returned field — Phase-6 drift lesson) ─────

function formatGroupTest(d: GmtoolkitGroupTestResult): string {
  return `module-gmtoolkit.run-group-test: "${d.testSkill}" rolled (bypass) for ${d.targetCount ?? 'the party'} target(s).`;
}
function formatAdvantage(d: GmtoolkitAdvantageResult): string {
  if (d.mode === 'clear-bulk') return `module-gmtoolkit.update-advantage: cleared advantage on ${d.clearedCount ?? 0} token(s).`;
  const note = d.note ? ` ${d.note}` : '';
  return `module-gmtoolkit.update-advantage: ${d.actorName ?? d.tokenId} — ${d.mode}: ${d.previousValue} → ${d.value}${d.playerOwned ? ' (player-owned, socket-routed)' : ''}.${note}`;
}
function formatSessionInfo(d: GmtoolkitSessionInfoResult): string {
  return `module-gmtoolkit.get-session-info: session ${d.sessionID ?? '?'} — ${d.date ?? '?'} ${d.time ?? ''}.`;
}
function formatGroup(d: GmtoolkitGroupResult): string {
  if (!d.count) return `module-gmtoolkit.get-group: "${d.groupType}" — no members.`;
  const names = d.members.map((m) => m.name ?? m.id).join(', ');
  return `module-gmtoolkit.get-group: "${d.groupType}" — ${d.count} member(s): ${names}.`;
}
function formatAdjustStatus(d: GmtoolkitAdjustStatusResult): string {
  return `module-gmtoolkit.adjust-status: ${d.actorName ?? d.actorId} — ${d.status} ${d.previousValue} → ${d.value} (${d.change >= 0 ? '+' : ''}${d.change}).`;
}
function formatSceneLight(d: GmtoolkitSceneLightResult): string {
  const parts: string[] = [];
  if (d.tokenVision !== null) parts.push(`tokenVision ${d.tokenVision}`);
  if (d.globalLight !== null) parts.push(`globalLight ${d.globalLight}`);
  return `module-gmtoolkit.toggle-scene-light: "${d.sceneName ?? d.sceneId}" — ${parts.join(', ') || 'no change'}.`;
}
function formatPull(d: GmtoolkitPullResult): string {
  return `module-gmtoolkit.pull-to-scene: "${d.sceneName ?? d.sceneId}" activated — players pulled.`;
}
function formatCompendium(d: GmtoolkitCompendiumResult): string {
  return `module-gmtoolkit.toggle-compendium-visibility: "${d.packId}" → ${d.private ? 'GM-only' : 'visible'} (was ${d.wasPrivate ? 'GM-only' : 'visible'}).`;
}
function formatD100(d: GmtoolkitD100Result): string {
  return `module-gmtoolkit.roll-d100: ${d.flavor} → ${d.total}.`;
}
function formatConditions(d: GmtoolkitConditionsResult): string {
  if (!d.count) return `module-gmtoolkit.check-conditions: ${d.actorName ?? d.actorId} — no active conditions.`;
  const lines = d.conditions.map((c) => `  • ${c.name ?? c.id}${c.value != null ? ` (${c.value})` : ''}`);
  return `module-gmtoolkit.check-conditions: ${d.actorName ?? d.actorId} — ${d.count} condition(s):\n${lines.join('\n')}`;
}
function formatSessionTurnover(d: GmtoolkitSessionTurnoverResult): string {
  const f = d.fortuneReset ? `, fortune ${d.fortuneReset.from} → ${d.fortuneReset.to}` : '';
  return `module-gmtoolkit.session-turnover: ${d.actorName ?? d.actorId} — XP +${d.xpAwarded} (total ${d.experienceTotal})${f}${d.sceneActivated ? ', scene activated' : ''}.`;
}
function formatAddXp(d: GmtoolkitAddXpResult): string {
  return `module-gmtoolkit.add-xp: ${d.actorName ?? d.actorId} — ${d.amount >= 0 ? '+' : ''}${d.amount} XP (${d.reason}) → total ${d.total}, current ${d.current}.`;
}

export interface ModuleGmtoolkitToolOptions extends BaseToolOptions {}

export class ModuleGmtoolkitTool extends BaseTool {
  constructor(options: ModuleGmtoolkitToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-gmtoolkit',
        title: 'WFRP4e GM Toolkit integration',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Integrate WFRP4e GM Toolkit: group tests, advantage management (with the player-owned-token fix), session lifecycle, status adjustments, XP awards, scene/compendium toggles, group reads.
Conditional: returns MODULE_NOT_ACTIVE when wfrp4e-gm-toolkit is absent/inactive.
Pre-flight: module-probe.is-active wfrp4e-gm-toolkit before using this tool.

12 actions:
Reads — get-session-info; get-group { groupType?, activeOnly?, presentOnly? }; check-conditions { actorId }.
Writes (GM) — run-group-test { testSkill, difficulty?, testModifier?, rollMode?, targetGroup? } (always dialog-free bypass); update-advantage { mode, tokenId?, confirm? } (mode increase/reduce/clear-single/clear-bulk; increase/reduce only apply in active combat; player-owned tokens are socket-routed — the GM Toolkit fix; clear-bulk needs confirm:true); adjust-status { actorId, status, change } (resolve/sin/corruption/fortune); toggle-scene-light { sceneId?, tokenVision?, globalLight? }; pull-to-scene { sceneId? } (activates the scene); toggle-compendium-visibility { packId, private? }; roll-d100 { flavor? }.
Confirm-gated writes (GM + confirm:true) — session-turnover { actorId, xp?, reason?, resetFortune?, activateSceneId?, confirm } (dialog-free decompose: XP + fortune reset + scene); add-xp { actorId, amount, reason?, confirm } (writes total/current + appends the experience log).

NOTE: lose-momentum (use update-advantage reduce/clear) and deal-damage (use warhammer-mcp.apply-damage) are reachable via those safe paths.
Example: { action: "update-advantage", mode: "increase", tokenId: "Scene.x.Token.y" }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'run-group-test', 'update-advantage', 'get-session-info', 'get-group',
                'adjust-status', 'toggle-scene-light', 'pull-to-scene',
                'toggle-compendium-visibility', 'roll-d100', 'check-conditions',
                'session-turnover', 'add-xp',
              ],
              description: 'GM Toolkit action to perform.',
            },
            actorId: { type: 'string', description: 'Target actor UUID or world-document id (adjust-status/check-conditions/session-turnover/add-xp).' },
            tokenId: { type: 'string', description: 'update-advantage: canvas token id or UUID (increase/reduce/clear-single).' },
            mode: { type: 'string', enum: ['increase', 'reduce', 'clear-single', 'clear-bulk'], description: 'update-advantage: advantage operation.' },
            testSkill: { type: 'string', description: 'run-group-test: the skill/characteristic to test.' },
            difficulty: { type: 'string', description: 'run-group-test: difficulty key (e.g. "challenging").' },
            testModifier: { type: 'number', description: 'run-group-test: flat modifier.' },
            rollMode: { type: 'string', enum: ['publicroll', 'gmroll', 'blindroll', 'selfroll'], description: 'run-group-test: roll visibility.' },
            targetGroup: { type: 'array', items: { type: 'string' }, description: 'run-group-test: actor UUIDs (default = party).' },
            groupType: { type: 'string', description: 'get-group: group key (party/company/pcs/...). Default "party".' },
            activeOnly: { type: 'boolean', description: 'get-group: only active members.' },
            presentOnly: { type: 'boolean', description: 'get-group: only present members.' },
            status: { type: 'string', enum: ['resolve', 'sin', 'corruption', 'fortune'], description: 'adjust-status: which status to change.' },
            change: { type: 'number', description: 'adjust-status: signed delta.' },
            sceneId: { type: 'string', description: 'toggle-scene-light/pull-to-scene: scene id (default active).' },
            tokenVision: { type: 'boolean', description: 'toggle-scene-light: token vision on/off.' },
            globalLight: { type: 'boolean', description: 'toggle-scene-light: global illumination on/off.' },
            packId: { type: 'string', description: 'toggle-compendium-visibility: compendium pack id.' },
            private: { type: 'boolean', description: 'toggle-compendium-visibility: GM-only (omit to flip).' },
            flavor: { type: 'string', description: 'roll-d100: chat flavor text.' },
            xp: { type: 'number', description: 'session-turnover: session XP award (optional).' },
            amount: { type: 'number', description: 'add-xp: signed XP delta.' },
            reason: { type: 'string', description: 'add-xp/session-turnover: XP log reason.' },
            resetFortune: { type: 'boolean', description: 'session-turnover: reset fortune to fate (default true).' },
            activateSceneId: { type: 'string', description: 'session-turnover: optional scene to activate.' },
            confirm: { type: 'boolean', description: 'Required (true) for session-turnover, add-xp, and update-advantage clear-bulk.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: Record<string, unknown>) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-gmtoolkit action', { action });
    switch (action) {
      case 'run-group-test': return this.run<GmtoolkitGroupTestResult>(action, rawArgs, formatGroupTest);
      case 'update-advantage': return this.run<GmtoolkitAdvantageResult>(action, rawArgs, formatAdvantage);
      case 'get-session-info': return this.run<GmtoolkitSessionInfoResult>(action, rawArgs, formatSessionInfo);
      case 'get-group': return this.run<GmtoolkitGroupResult>(action, rawArgs, formatGroup);
      case 'adjust-status': return this.run<GmtoolkitAdjustStatusResult>(action, rawArgs, formatAdjustStatus);
      case 'toggle-scene-light': return this.run<GmtoolkitSceneLightResult>(action, rawArgs, formatSceneLight);
      case 'pull-to-scene': return this.run<GmtoolkitPullResult>(action, rawArgs, formatPull);
      case 'toggle-compendium-visibility': return this.run<GmtoolkitCompendiumResult>(action, rawArgs, formatCompendium);
      case 'roll-d100': return this.run<GmtoolkitD100Result>(action, rawArgs, formatD100);
      case 'check-conditions': return this.run<GmtoolkitConditionsResult>(action, rawArgs, formatConditions);
      case 'session-turnover': return this.run<GmtoolkitSessionTurnoverResult>(action, rawArgs, formatSessionTurnover);
      case 'add-xp': return this.run<GmtoolkitAddXpResult>(action, rawArgs, formatAddXp);
      default:
        return errorContent('unknown', `unknown action: ${action}`);
    }
  }

  /** Run one action: typed query + format, intercept MODULE_NOT_ACTIVE, else errorContent. */
  private async run<T>(action: string, args: Record<string, unknown>, fmt: (d: T) => string) {
    try {
      const data = await this.query<T>('module-gmtoolkit', args);
      return text(fmt(data));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('MODULE_NOT_ACTIVE')) return moduleNotActiveContent('module-gmtoolkit', msg);
      return errorContent(action, msg);
    }
  }
}
