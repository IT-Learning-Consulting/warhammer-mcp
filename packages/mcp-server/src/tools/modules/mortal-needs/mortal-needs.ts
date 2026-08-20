// Module Integration v2 Phase 8 — module-mortal-needs MCP tool (Mortal Needs, Wand & Widgets v2.3.2).
//
// Always-registered umbrella. The foundry-module handler guards on mortal-needs being active; when
// inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw → moduleNotActiveContent().
// Pre-flight with module-probe.is-active mortal-needs.
//
// 26 actions across 9 idioms (reads, single writes, batch writes, rest, config, consequence, scene,
// custom needs, destructive). Anchors: DP-15 (concrete this.query<MortalNeedsResult> — never <any>);
// R2.4 (errors via errorResponse). formatResult exhaustiveness is real — NO `as never` suppression
// ([[feedback_single_action_module_umbrella_exhaustiveness]]); 4 actions (get-need-config, long-rest,
// apply-consequence, remove-consequence) carry >1 response SHAPE under the same `action` discriminant —
// each is disambiguated by a runtime property check inside its case, not a second switch layer.

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { MORTAL_NEEDS_ACTIONS, type MortalNeedsResult } from './schemas.js';
import { z } from 'zod';
import { MortalNeedsInput } from '@foundry-mcp/shared';

type MortalNeedsArgs = z.infer<typeof MortalNeedsInput>;

// ── Single discriminated formatter (one text line per action) ──────────────────

function formatResult(d: MortalNeedsResult): string {
  const p = 'module-mortal-needs';
  switch (d.action) {
    case 'get-needs':
      return `${p}.get-needs: entity ${d.entityId} — ${Object.keys(d.needs).length} need(s).`;
    case 'get-need':
      return `${p}.get-need: ${d.needId} on ${d.entityId} = ${d.value} (${d.min}-${d.max}).`;
    case 'list-tracked':
      return `${p}.list-tracked: ${d.count} tracked entit${d.count === 1 ? 'y' : 'ies'}.`;
    case 'get-need-config':
      if ('configs' in d) return `${p}.get-need-config: ${d.count} need config(s).`;
      return `${p}.get-need-config: ${d.needId} (enabled=${Boolean((d.config as any)?.enabled)}).`;
    case 'query-critical':
      return `${p}.query-critical: ${d.count} actor(s) at/above the critical threshold.`;
    case 'query-above-threshold':
      return `${p}.query-above-threshold: ${d.count} actor(s) with ${d.needId} >= ${d.threshold}%.`;
    case 'get-need-history':
      return `${p}.get-need-history: ${d.count} entr(y/ies) for ${d.entityId}${d.needId ? `/${d.needId}` : ''}.`;
    case 'stress-need':
    case 'relieve-need':
      return `${p}.${d.action}: ${d.needId} on ${d.entityId} → ${d.value} (was ${d.previousValue}).`;
    case 'set-need':
      return `${p}.set-need: ${d.needId} on ${d.entityId} → ${d.value}${d.clamped ? ` (clamped from requested ${d.requestedValue})` : ''}.`;
    case 'reset-need':
      return `${p}.reset-need: ${d.needId} on ${d.entityId} → ${d.value}.`;
    case 'track-actor':
      return `${p}.track-actor: ${d.entityId} ${d.alreadyTracked ? 'already tracked' : 'now tracked'}.`;
    case 'batch-stress':
    case 'batch-relieve':
      return `${p}.${d.action}: ${d.needId} affecting ${d.affected} actor(s).`;
    case 'short-rest':
      return `${p}.short-rest: ${d.reliefPercentage}% relief across ${d.affected} tracked actor(s).`;
    case 'long-rest':
      if (d.partyWide) return `${p}.long-rest: party-wide — ${d.affected} actor(s) reset.`;
      return `${p}.long-rest: ${d.entityId} — all needs reset.`;
    case 'configure-need':
    case 'enable-need':
    case 'disable-need':
      return `${p}.${d.action}: ${d.needId} config updated (importConfig-persisted).`;
    case 'apply-consequence':
    case 'remove-consequence':
      if (d.consequenceType === 'condition-apply') {
        return `${p}.${d.action}: ${d.statusId} on ${d.entityId} — active=${d.active}.`;
      }
      return `${p}.${d.action}: ${d.path} on ${d.entityId} — ${d.previousValue} → ${d.value}.`;
    case 'set-scene-modifier':
      return `${p}.set-scene-modifier: ${d.needId} on scene ${d.sceneId} — ${JSON.stringify(d.modifiers)}.`;
    case 'register-custom-need':
      return `${p}.register-custom-need: ${d.needId} registered (importConfig-persisted).`;
    case 'unregister-custom-need':
      return `${p}.unregister-custom-need: ${d.needId} removed (importConfig-persisted).`;
    case 'reset-all':
      return `${p}.reset-all: ${d.entityId} — all needs wiped to default.`;
    case 'untrack-actor':
      return `${p}.untrack-actor: ${d.entityId} removed from the tracked roster.`;
    default: {
      const _exhaustive: never = d;
      return `${p}: ${JSON.stringify(_exhaustive)}`;
    }
  }
}

export interface ModuleMortalNeedsToolOptions extends BaseToolOptions {}

export class ModuleMortalNeedsTool extends BaseTool {
  constructor(options: ModuleMortalNeedsToolOptions) {
    super(options);
  }

  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [{ name: 'module-mortal-needs', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-mortal-needs',
        title: 'Mortal Needs integration — survival tracker (hunger/thirst/exhaustion/cold/corruption/+custom)',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Drive the Mortal Needs module — a system-agnostic survival-stress tracker with a native WFRP4e adapter. Up to 13 built-in needs (hunger/thirst/exhaustion/cold/heat/comfort/sanity/morale/pain/radiation/corruption/fatigue/environmental) plus custom needs, persisted per-actor at actor.flags['mortal-needs'].needs (0-100, server-verifiable). Decays natively on Foundry's updateWorldTime — composes with /module-timekeeping advance with ZERO bridging.
Conditional: returns MODULE_NOT_ACTIVE when mortal-needs is absent/inactive. Pre-flight: module-probe.is-active mortal-needs.

⚠ NAMING COLLISION: this module's "corruption" need is an abstract stress meter, NOT WFRP4e's Corruption/mutation mechanic (/wfrp-corruption owns RAW corruption — Cool/Endurance test, mutation table). Keep them distinct; do not conflate.

EVERY need write idempotently tracks the actor first (api.actors.track) — the engine silently no-ops persistence for an untracked actor while returning truthy, so every write here is post-write flag-verified. Config writes (configure/enable/disable-need, register/unregister-custom-need) route through an importConfig read-modify-write — the module's raw config.* setters mutate in-memory only and never persist (upstream defect, logged to bugs_to_fix.md).

CONFIRM-GATED (CCR-4): reset-all, untrack-actor, long-rest with NO entityId (party-wide), unregister-custom-need — require confirm:true. Single-actor writes and batch-stress/batch-relieve stay UNGATED (additive/reversible).

Use this when:
- Tracking a PC/NPC's survival stats (hunger, thirst, exhaustion, cold, etc.) that decay over game time as travel/rest passes.
- Stressing or relieving one or more actors' needs after an in-fiction event (a forced march, a missed meal, a warm meal at an inn).
- Wiring a need threshold to an automatic consequence — applying a status condition or modifying an attribute when a need crosses a limit.
- Resting the party (short/long rest) to relieve accumulated stress across tracked actors.
- Querying which tracked actors are currently critical or above a threshold for a given need, for GM situational awareness.

26 actions:
reads: get-needs { entityId } · get-need { entityId, needId } · list-tracked {} · get-need-config { needId? } · query-critical {} · query-above-threshold { needId, threshold? } · get-need-history { entityId, needId?, limit? }.
single writes: stress-need { entityId, needId, amount? } · relieve-need { entityId, needId, amount? } · set-need { entityId, needId, value } · reset-need { entityId, needId } · track-actor { entityId }.
batch writes: batch-stress { needId, amount?, entityIds? } · batch-relieve { needId, amount?, entityIds? } (entityIds omitted = ALL tracked).
rest: short-rest { reliefPercentage? } (always party-wide) · long-rest { entityId?, confirm? } (entityId = single actor, ungated; omitted = party-wide, confirm required).
config: configure-need { needId, changes } · enable-need { needId } · disable-need { needId }.
consequence (dialog-free): apply-consequence / remove-consequence { entityId, needId, consequenceType: "condition-apply"|"attribute-modify", statusId?, path?, operation?, amount?, threshold?, ticks?, reversible? }.
scene: set-scene-modifier { needId, stressMultiplier?, decayMultiplier? } (active scene only).
custom needs: register-custom-need { needConfig } · unregister-custom-need { needId, confirm } (destroys per-actor data).
destructive: reset-all { entityId, confirm } · untrack-actor { entityId, confirm }.

WFRP4e idiom: exhaustion need + apply-consequence(condition-apply, statusId:"fatigued") wires the Fatigued condition. attribute-modify with path "system.status.fatigue.value" is the alternate fatigue path — writability under WFRP4e derived-data recompute is unverified (live-smoke caveat); prefer condition-apply.
Example: { action: "stress-need", entityId: "abc123", needId: "hunger", amount: 25 }

Do NOT use this tool for WFRP4e's own Corruption/mutation mechanic — that is the Cool/Endurance test + mutation table owned by /wfrp-corruption. module-mortal-needs' "corruption" need is an unrelated abstract stress meter that happens to share the name; the two are never interchangeable (see the naming-collision warning above).

Performance Notes:
- Most actions return a small fixed-shape result (one need's value, a write confirmation, or a config record) — no response modes, no pagination.
- list-tracked/query-critical/query-above-threshold/get-need-history: size scales with tracked-actor count or history length; get-need-history accepts a limit param (default 50) to bound the response — the query-* actions have no limit and can return every matching tracked actor.`,
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: [...MORTAL_NEEDS_ACTIONS], description: 'Mortal Needs action to perform.' },
            entityId: { type: 'string', description: 'Actor id (most need/rest/track ops).' },
            needId: { type: 'string', description: 'Need id, e.g. hunger/thirst/exhaustion/cold/corruption/fatigue or a custom id.' },
            amount: { type: 'number', description: 'Stress/relieve amount (stress-need/relieve-need/batch-*). Omitted = engine default (config.stressAmount or world default).' },
            value: { type: 'number', description: 'set-need: exact value to set (clamped to the need\'s min/max).' },
            entityIds: { type: 'array', items: { type: 'string' }, description: 'batch-stress/batch-relieve: specific actor ids. Omitted = ALL tracked actors.' },
            reliefPercentage: { type: 'number', description: 'short-rest: percent of each need\'s max to relieve (default 25).' },
            changes: { type: 'object', additionalProperties: true, description: 'configure-need: partial need-config object to merge (e.g. { stressAmount: 20 }).' },
            consequenceType: { type: 'string', enum: ['condition-apply', 'attribute-modify'], description: 'apply-consequence/remove-consequence: which consequence kind.' },
            statusId: { type: 'string', description: 'apply-consequence/remove-consequence (condition-apply): status effect id, e.g. "fatigued".' },
            path: { type: 'string', description: 'apply-consequence/remove-consequence (attribute-modify): dot-path, e.g. "system.status.fatigue.value".' },
            operation: { type: 'string', enum: ['add', 'subtract', 'set', 'multiply'], description: 'apply-consequence/remove-consequence (attribute-modify): math operation.' },
            threshold: { type: 'number', description: 'apply-consequence/remove-consequence: stress percentage threshold (0-100, default 100) / query-above-threshold filter.' },
            ticks: { type: 'number', description: 'apply-consequence/remove-consequence: sustained ticks before re-applying (default 1).' },
            reversible: { type: 'boolean', description: 'apply-consequence/remove-consequence: whether the consequence auto-removes on recovery (default true).' },
            stressMultiplier: { type: 'number', description: 'set-scene-modifier: multiplier applied to incoming stress events for this need on the active scene.' },
            decayMultiplier: { type: 'number', description: 'set-scene-modifier: multiplier applied to time-decay events for this need on the active scene.' },
            needConfig: { type: 'object', additionalProperties: true, description: 'register-custom-need: full need config object, MUST include id.' },
            limit: { type: 'number', description: 'get-need-history: max entries to return (default 50).' },
            confirm: { type: 'boolean', description: 'reset-all / untrack-actor / long-rest (party-wide) / unregister-custom-need: must be true to execute the gated op.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: MortalNeedsArgs) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-mortal-needs action', { action });
    if (!(MORTAL_NEEDS_ACTIONS as readonly string[]).includes(action)) {
      return this.errorResponse(action, `unknown action: ${action}`);
    }
    try {
      const data = await this.query<MortalNeedsResult>('module-mortal-needs', rawArgs);
      return {
        content: [{ type: 'text' as const, text: formatResult(data) }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-mortal-needs', msg);
      return this.errorResponse(action, msg);
    }
  }
}
