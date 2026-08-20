// Module Integration v1 Phase 14 — module-gatherer MCP tool (gatherer integration).
//
// Always-registered umbrella. The foundry-module handler guards on gatherer being active; when
// inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw →
// moduleNotActiveContent(). Use module-probe.is-active gatherer to pre-flight.
//
// 9 actions: reads (get-spot-status, list-spots) + GM writes (gather, harvest-token,
// reset-spot, configure-spot, create-spot, set-harvest-source, configure-settings).
// The WFRP-flavored composition skill is `module-gatherer`.
//
// Anchors: DP-15 (concrete this.query<T> per action — never <any>).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { z } from 'zod';
import { ModuleGathererInput } from '@foundry-mcp/shared';

type ModuleGathererArgs = z.infer<typeof ModuleGathererInput>;
import type {
  SpotStatusResult,
  GatherResult,
  HarvestResult,
  ResetResult,
  ConfigureResult,
  ListSpotsResult,
  GatherSpot,
  GenericGathererResult,
} from './schemas.js';

const text = (s: string) => ({ content: [{ type: 'text' as const, text: s }] });


function formatStatus(d: SpotStatusResult): string {
  const lines = [
    `module-gatherer.get-spot-status: ${d.name}`,
    `- draws: ${d.drawsUsed}/${d.maxDraws ?? '∞'} used (${d.drawsRemaining ?? '∞'} remaining)`,
    `- table: ${d.tableUuid ?? '(none)'} · reset: ${d.timeHours ? `${d.timeHours}h` : 'manual'}${d.resetInSeconds != null ? ` (in ${d.resetInSeconds}s)` : ''}`,
  ];
  if (d.minigameWarning) lines.push(`- ⚠ ${d.minigameWarning}`);
  return lines.join('\n');
}

function formatGather(d: GatherResult): string {
  const head = d.minigame === 'opened'
    ? `module-gatherer.gather: interactive minigame OPENED for ${d.pageUuid} → ${d.actorUuid}`
    : `module-gatherer.gather: drew from ${d.pageUuid} → ${d.actorUuid}`;
  const lines = [head];
  if (d.minigame === 'opened' && d.note) lines.push(`- 🎰 ${d.note}`);
  if (d.quantityPathWarning) lines.push(`- ⚠ ${d.quantityPathWarning}`);
  return lines.join('\n');
}

function formatHarvest(d: HarvestResult): string {
  const head = d.minigame === 'opened'
    ? `module-gatherer.harvest-token: interactive minigame OPENED for ${d.harvestedFrom} → ${d.gatheringActorUuid}`
    : `module-gatherer.harvest-token: ${d.harvestedFrom} → ${d.gatheringActorUuid}`;
  const lines = [head];
  if (d.minigame === 'opened' && d.note) lines.push(`- 🎰 ${d.note}`);
  if (d.quantityPathWarning) lines.push(`- ⚠ ${d.quantityPathWarning}`);
  return lines.join('\n');
}

function formatReset(d: ResetResult): string {
  return `module-gatherer.reset-spot: ${d.name} reset (draws refreshed)`;
}

function formatConfigure(d: ConfigureResult): string {
  const lines = [`module-gatherer.configure-spot: ${d.name}`, `- written: ${Object.keys(d.written).join(', ')}`];
  if (d.minigameWarning) lines.push(`- ⚠ ${d.minigameWarning}`);
  return lines.join('\n');
}

function spotLine(s: GatherSpot): string {
  const ex = s.exhausted ? ' [exhausted]' : '';
  const mg = s.minigame ? ' ⚠minigame' : '';
  return `  • ${s.name} — ${s.drawsRemaining ?? '∞'} draws [${s.journalName}]${ex}${mg} (${s.pageUuid})`;
}

function formatListSpots(d: ListSpotsResult): string {
  if (!d.count) return 'module-gatherer.list-spots: no gather sources.';
  return `module-gatherer.list-spots: ${d.count} spot(s):\n${d.spots.map(spotLine).join('\n')}`;
}

function formatGenericGatherer(action: string) {
  return (d: GenericGathererResult): string => {
    const parts = Object.entries(d)
      .filter(([k]) => k !== 'note')
      .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`);
    return `module-gatherer.${action}: ${parts.join(' · ')}`;
  };
}

export interface ModuleGathererToolOptions extends BaseToolOptions {}

export class ModuleGathererTool extends BaseTool {
  constructor(options: ModuleGathererToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'module-gatherer', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-gatherer',
        title: 'Gatherer (foraging / harvesting) integration',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Integrate gatherer: execute gather/harvest draws from JournalEntryPage gather sources and manage their config. Items are written to the actor via the module's API. The WFRP-flavored composition skill is /module-gatherer.
Conditional: returns MODULE_NOT_ACTIVE when gatherer is absent/inactive.
Pre-flight: module-probe.is-active gatherer before using this tool.

Use this when:
- Executing a gather or harvest draw for a PC from a configured foraging/harvesting spot.
- Checking a spot's remaining draws, reset timer, or configured table before drawing.
- Authoring a new gather spot on a journal page, or reconfiguring an existing one's table/quantity/DC rules.
- Listing all gather spots (optionally scoped to one journal or filtered to exhausted-only) for GM planning.
- Resetting an exhausted spot's draw count, or adjusting world-level Gatherer settings (quantity path, harvesting eligibility).

9 actions:
Reads — get-spot-status { pageUuid } (draws remaining, reset time, table, minigame flag); list-spots { journalUuid?, exhaustedOnly? } (enumerate gather-source pages).
GM writes — gather { pageUuid, actorUuid }; harvest-token { actorUuid (creature carrying gatherSheet), gatheringActorUuid }; reset-spot { pageUuid }; configure-spot { pageUuid, tableUuid?, draws?, quantity?, require?, time?, expression?, modifierList? }; create-spot { journalUuid, name, tableUuid?, draws?, quantity?, time?, expression?, modifierList? }; set-harvest-source { actorUuid, gatherSheetUuid }; configure-settings { quantityPath?, resourcePath?, resourceValue?, enableHarvesting? }.

MINIGAME: pages flagged with a minigame open the slot-machine dialog on the GM client (fire-and-forget; gather/harvest-token return minigame:"opened" + a note rather than awaiting — awaiting would hang the socket). The GM completes the dialog on screen and the item lands when they click through. For WFRP4e, the world setting gatherer.quantityPath must be "quantity.value" or item stacking silently fails — gather surfaces a warning (fix via /foundry-setting).

Example: { action: "gather", pageUuid: "JournalEntry.x.JournalEntryPage.y", actorUuid: "Actor.z" }

Do NOT use this tool for an arbitrary/ad-hoc table draw not tied to a configured gather-source page — use the \`rolltable\` tool for that. module-gatherer only operates on JournalEntryPage-backed gather spots with their own draw-count/reset/minigame state.

Performance Notes:
- Most actions return a small fixed-shape record (a spot's status, a gather/harvest result, or a configuration confirmation) — no response modes, no pagination. list-spots scales with the number of gather-source pages in the world/journal scope; still no pagination, so a very large journal set returns a proportionally larger list.`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['get-spot-status', 'list-spots', 'gather', 'harvest-token', 'reset-spot', 'configure-spot', 'create-spot', 'set-harvest-source', 'configure-settings'],
              description: 'Gatherer action to perform.',
            },
            pageUuid: { type: 'string', description: 'get-spot-status/gather/reset-spot/configure-spot: the gather-source JournalEntryPage UUID.' },
            actorUuid: { type: 'string', description: 'gather: the gathering actor. harvest-token: the creature being harvested (carries gatherSheet flag).' },
            gatheringActorUuid: { type: 'string', description: 'harvest-token: the actor who receives the harvested items.' },
            tableUuid: { type: 'string', description: 'configure-spot: RollTable UUID to draw from.' },
            draws: { type: 'number', description: 'configure-spot: max draws before exhausted.' },
            quantity: { type: 'string', description: 'configure-spot: quantity roll expression (e.g. "1d4").' },
            require: { type: 'string', description: 'configure-spot: CSV of required item names on the actor.' },
            time: { type: 'number', description: 'configure-spot/create-spot: hours before auto-reset (0 = none).' },
            expression: { type: 'string', description: 'configure-spot/create-spot: macro name or inline JS for DC override.' },
            modifierList: { type: 'array', items: { type: 'object', properties: { modifier: { type: 'string' }, DC: { type: 'number' } } }, description: 'configure-spot/create-spot: tiered DC→quantity modifiers (sorted desc by DC on write).' },
            journalUuid: { type: 'string', description: 'create-spot: parent JournalEntry UUID. list-spots: optional scope to one journal.' },
            name: { type: 'string', description: 'create-spot: the new gather-spot page name.' },
            exhaustedOnly: { type: 'boolean', description: 'list-spots: only return exhausted spots.' },
            gatherSheetUuid: { type: 'string', description: 'set-harvest-source: the gather-source page UUID to harvest from.' },
            quantityPath: { type: 'string', description: 'configure-settings: item quantity path (WFRP4e: "quantity.value").' },
            resourcePath: { type: 'string', description: 'configure-settings: actor path gating harvest eligibility.' },
            resourceValue: { type: 'string', description: 'configure-settings: value at which the resource path is eligible.' },
            enableHarvesting: { type: 'boolean', description: 'configure-settings: show the Gatherer header button on NPC sheets.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: ModuleGathererArgs) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-gatherer action', { action });
    switch (action) {
      case 'get-spot-status': return this.run<SpotStatusResult>(action, rawArgs, formatStatus);
      case 'list-spots': return this.run<ListSpotsResult>(action, rawArgs, formatListSpots);
      case 'gather': return this.run<GatherResult>(action, rawArgs, formatGather);
      case 'harvest-token': return this.run<HarvestResult>(action, rawArgs, formatHarvest);
      case 'reset-spot': return this.run<ResetResult>(action, rawArgs, formatReset);
      case 'configure-spot': return this.run<ConfigureResult>(action, rawArgs, formatConfigure);
      case 'create-spot':
      case 'set-harvest-source':
      case 'configure-settings':
        return this.run<GenericGathererResult>(action, rawArgs, formatGenericGatherer(action));
      default:
        return this.errorResponse('unknown', `unknown action: ${action}`);
    }
  }

  private async run<T>(action: string, args: Record<string, unknown>, fmt: (d: T) => string) {
    try {
      const data = await this.query<T>('module-gatherer', args);
      return { content: [{ type: 'text' as const, text: fmt(data) }], structuredContent: data as Record<string, unknown> };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-gatherer', msg);
      return this.errorResponse(action, msg);
    }
  }
}
