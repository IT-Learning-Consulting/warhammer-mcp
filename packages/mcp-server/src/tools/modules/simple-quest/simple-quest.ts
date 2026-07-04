// Module Integration v2 Phase 2 — module-simple-quest MCP tool (Simple Quest v3.0.19, theripper93).
//
// Always-registered umbrella. The foundry-module handler guards on simple-quest being active; when
// inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw →
// moduleNotActiveContent(). Use module-probe.is-active simple-quest to pre-flight.
//
// 24 actions (all flag/document writes on JournalEntryPage docs, the best write-verifiability posture
// in v2). Quest (15) + Map (4) + Lore (2) + Achievements (3). HC-v2-5 rename warning on objective
// writes; CCR-4 confirm gate on delete-quest; 4 dialog ops routed around server-side (HC-v2-6 analog).
// Anchors: DP-15 (concrete this.query<T> per action — never <any>); R2.4 (errors via BaseTool.errorResponse).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { SIMPLE_QUEST_ACTIONS } from './schemas.js';
import { z } from 'zod';
import { SimpleQuestInput } from '@foundry-mcp/shared';

type SimpleQuestArgs = z.infer<typeof SimpleQuestInput>;
import type {
  SQListQuestsResult,
  SQGetQuestResult,
  SQCreateQuestResult,
  SQSetQuestStateResult,
  SQObjectiveStateResult,
  SQObjectiveVisibilityResult,
  SQQuestVisibilityResult,
  SQSubquestStateResult,
  SQMoveQuestResult,
  SQMarkUpdatedResult,
  SQShareQuestResult,
  SQShowToPlayersResult,
  SQSetCounterResult,
  SQDuplicateQuestResult,
  SQDeleteQuestResult,
  SQMarkerResult,
  SQRemoveMarkerResult,
  SQMapConfigResult,
  SQListLoreResult,
  SQCreateLoreResult,
  SQListAchievementsResult,
  SQCreateAchievementResult,
  SQSetAchievementResult,
} from './schemas.js';

// ── Per-action formatters ─────────────────────────────────────────────────────

function formatListQuests(d: SQListQuestsResult): string {
  if (!d.count) return `module-simple-quest.list-quests: no quest categories in folder "${d.folderName}".`;
  const lines = d.categories.map((c) => `  • "${c.name}" (${c.journalId}) — ${c.pages.length} page(s)`);
  return `module-simple-quest.list-quests: ${d.count} categor(ies) in "${d.folderName}":\n${lines.join('\n')}`;
}
function formatGetQuest(d: SQGetQuestResult): string {
  const ticked = Object.values(d.flags.checkboxes).filter((v) => v === 1).length;
  const total = Object.keys(d.flags.checkboxes).length;
  return `module-simple-quest.get-quest: "${d.name}" (${d.pageId}) — ${ticked}/${total} objectives checked, completed=${d.flags.completed}, hidden=${d.flags.hidden}.`;
}
function formatCreateQuest(d: SQCreateQuestResult): string {
  return `module-simple-quest.create-quest: "${d.name}" (${d.pageId}) in category "${d.category}". uuid=${d.uuid}.`;
}
function formatSetQuestState(d: SQSetQuestStateResult): string {
  return `module-simple-quest.set-quest-state: "${d.name}" — completed=${d.completed ?? '(unchanged)'}${d.tickedAll !== null ? `, tickAll=${d.tickedAll}` : ''}.`;
}
function formatObjectiveState(d: SQObjectiveStateResult): string {
  const word = d.state === 1 ? 'checked' : d.state === 2 ? 'failed' : 'unchecked';
  return `module-simple-quest.set-objective-state: objective "${d.objectiveKey}" → ${word} (${d.state}).`;
}
function formatObjectiveVisibility(d: SQObjectiveVisibilityResult): string {
  return `module-simple-quest.set-objective-visibility: objective "${d.objectiveKey}" hidden=${d.hidden}.`;
}
function formatQuestVisibility(d: SQQuestVisibilityResult): string {
  return `module-simple-quest.set-quest-visibility: quest hidden=${d.hidden}.`;
}
function formatSubquestState(d: SQSubquestStateResult): string {
  return `module-simple-quest.set-subquest-state: subquest "${d.headerKey}" completed=${d.completed}.`;
}
function formatMoveQuest(d: SQMoveQuestResult): string {
  return `module-simple-quest.move-quest: moved to "${d.targetCategory}" (new uuid ${d.newPageUuid}).`;
}
function formatMarkUpdated(d: SQMarkUpdatedResult): string {
  return `module-simple-quest.mark-quest-updated: lastUpdated=${d.lastUpdated}.`;
}
function formatShareQuest(d: SQShareQuestResult): string {
  return `module-simple-quest.share-quest: "${d.name}" posted to chat (message ${d.chatMessageId}).`;
}
function formatShowToPlayers(d: SQShowToPlayersResult): string {
  return `module-simple-quest.show-quest-to-players: pushed to ${d.userIds.length} player(s) (delivered=${d.delivered}).`;
}
function formatSetCounter(d: SQSetCounterResult): string {
  return `module-simple-quest.set-counter: "${d.counterId}"=${d.value}.`;
}
function formatDuplicateQuest(d: SQDuplicateQuestResult): string {
  return `module-simple-quest.duplicate-quest: created "${d.name}" (${d.newPageId}).`;
}
function formatDeleteQuest(d: SQDeleteQuestResult): string {
  return `module-simple-quest.delete-quest: deleted "${d.name ?? d.pageUuid}".`;
}
function formatMarker(d: SQMarkerResult): string {
  return `module-simple-quest map marker "${d.markerId}" written on page ${d.pageUuid}.`;
}
function formatRemoveMarker(d: SQRemoveMarkerResult): string {
  return `module-simple-quest.remove-map-marker: removed marker "${d.markerId}" (removed=${d.removed}).`;
}
function formatMapConfig(d: SQMapConfigResult): string {
  return `module-simple-quest.set-map-config: measure=${d.measure ?? '(unset)'}, pinsLocked=${d.pinsLocked ?? '(unset)'}.`;
}
function formatListLore(d: SQListLoreResult): string {
  if (!d.count) return `module-simple-quest.list-lore: no lore pages in folder "${d.folderName}".`;
  const lines = d.pages.map((p) => `  • "${p.name}" (${p.pageId})`);
  return `module-simple-quest.list-lore: ${d.count} lore page(s):\n${lines.join('\n')}`;
}
function formatCreateLore(d: SQCreateLoreResult): string {
  return `module-simple-quest.create-lore: "${d.name}" (${d.pageId}). uuid=${d.uuid}.`;
}
function formatListAchievements(d: SQListAchievementsResult): string {
  if (!d.count) return 'module-simple-quest.list-achievements: no achievements.';
  const lines = d.achievements.map((a) => `  • "${a.name}" (${a.pageId})`);
  return `module-simple-quest.list-achievements: ${d.count} achievement(s):\n${lines.join('\n')}`;
}
function formatCreateAchievement(d: SQCreateAchievementResult): string {
  return `module-simple-quest.create-achievement: "${d.name}" (${d.pageId})${d.color ? `, color ${d.color}` : ''}.`;
}
function formatSetAchievement(d: SQSetAchievementResult): string {
  return `module-simple-quest.set-achievement: page ${d.pageUuid}${d.award !== null ? ` award=${d.award} → ${d.userId}` : ''}${d.color ? `, color ${d.color}` : ''}.`;
}

export interface ModuleSimpleQuestToolOptions extends BaseToolOptions {}

export class ModuleSimpleQuestTool extends BaseTool {
  constructor(options: ModuleSimpleQuestToolOptions) {
    super(options);
  }

  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [{ name: 'module-simple-quest', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-simple-quest',
        title: 'Simple Quest integration — quests, objectives, map, lore, achievements',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Author + manage Simple Quest content (WFRP4e) — quests with checkable/failable/hideable objectives, a completion state, counters, map markers, lore pages, and achievements with per-player ownership. ALL state is flags.simple-quest.* on JournalEntryPage documents (server-verifiable; zero F12).
Conditional: returns MODULE_NOT_ACTIVE when simple-quest is absent/inactive.
Pre-flight: module-probe.is-active simple-quest before using this tool.

24 actions:
Quest (15) — list-quests {}; get-quest { pageUuid }; create-quest { name, content?, category? }; set-quest-state { pageUuid, completed?, tickAll?(0|1|2) }; set-objective-state { pageUuid, objectiveText, state(0|1|2), acknowledgeRename? }; set-objective-visibility { pageUuid, objectiveText, hidden, acknowledgeRename? }; set-quest-visibility { pageUuid, hidden }; set-subquest-state { pageUuid, headerText, completed }; move-quest { pageUuid, targetCategory }; mark-quest-updated { pageUuid }; share-quest { pageUuid }; show-quest-to-players { pageUuid, userIds? }; set-counter { pageUuid, counterId, value }; duplicate-quest { pageUuid }; delete-quest { pageUuid, confirm }.
Map (4) — create-map-marker { pageUuid, marker{ x(0-1, required), y(0-1, required), title?, icon?, color?, hidden?, journal? } }; update-map-marker { pageUuid, markerId, marker{...} }; remove-map-marker { pageUuid, markerId }; set-map-config { pageUuid, measure?, pinsLocked?, fowMask? } (at least one of measure/pinsLocked/fowMask).
Lore (2) — list-lore {}; create-lore { name, content?, category? }.
Achievements (3) — list-achievements {}; create-achievement { name, content?, color? } (achievements are one journal — no category); set-achievement { pageUuid, userId?, award?, color? } (at least one of: award WITH userId, or color).

Objective addressing (HC-v2-5): objectives are keyed by their text — the tool derives the key the same way the module does (strip tags + decode HTML entities + remove whitespace/dots, max 50 chars). Renaming an objective changes its key and orphans its checkbox/secret state; an objective write whose key matches none of the page's actual <li> objectives returns SIMPLE_QUEST_RENAME_WARNING (re-send with acknowledgeRename:true to proceed). A valid objective that simply hasn't been ticked yet does NOT warn.
delete-quest requires confirm:true (CCR-4).
Example: { action: "create-quest", name: "The Missing Caravan", content: "<ul><li>Find the wreck</li><li>Recover the ledger</li></ul>" }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [...SIMPLE_QUEST_ACTIONS],
              description: 'Simple Quest action to perform.',
            },
            pageUuid: { type: 'string', description: 'Target quest/map/lore/achievement JournalEntryPage UUID.' },
            name: { type: 'string', description: 'create-quest/create-lore/create-achievement: page name.' },
            content: { type: 'string', description: 'create-*: page HTML content (objective <ul><li> lists etc.).' },
            category: { type: 'string', description: 'create-*: category journal name (find-or-create in the configured folder).' },
            completed: { type: 'boolean', description: 'set-quest-state: whole-quest completed flag.' },
            tickAll: { type: 'number', enum: [0, 1, 2], description: 'set-quest-state: bulk-set every EXISTING checkbox to this state (0 unchecked, 1 checked, 2 failed).' },
            objectiveText: { type: 'string', description: 'set-objective-*: the objective text — the tool derives the checkbox key from it (HC-v2-5).' },
            state: { type: 'number', enum: [0, 1, 2], description: 'set-objective-state: 0 unchecked, 1 checked, 2 failed.' },
            acknowledgeRename: { type: 'boolean', description: 'set-objective-*: override the SIMPLE_QUEST_RENAME_WARNING when the derived key matches none of the page\'s <li> objectives.' },
            hidden: { type: 'boolean', description: 'set-objective-visibility/set-quest-visibility: hide from players when true.' },
            headerText: { type: 'string', description: 'set-subquest-state: the H2 sub-quest header text (slugified to the key).' },
            targetCategory: { type: 'string', description: 'move-quest: target category journal name or id.' },
            userIds: { type: 'array', items: { type: 'string' }, description: 'show-quest-to-players: target user ids (omit/empty = all active non-GM players).' },
            counterId: { type: 'string', description: 'set-counter: the @COUNT/@REPUTATION counter id (arbitrary string).' },
            value: { type: 'number', description: 'set-counter: the counter value.' },
            confirm: { type: 'boolean', description: 'delete-quest: required (true) to delete the page.' },
            marker: {
              type: 'object',
              description: 'create-map-marker/update-map-marker: { x(0-1), y(0-1), title?, icon?, color?(hex), hidden?, journal?(uuid) }.',
              properties: {
                title: { type: 'string' },
                icon: { type: 'string' },
                x: { type: 'number' },
                y: { type: 'number' },
                journal: { type: 'string' },
                hidden: { type: 'boolean' },
                color: { type: 'string' },
              },
            },
            markerId: { type: 'string', description: 'update-map-marker/remove-map-marker: the marker id.' },
            measure: { type: 'string', description: 'set-map-config: scale string e.g. "1mi".' },
            pinsLocked: { type: 'boolean', description: 'set-map-config: lock map pins.' },
            fowMask: { type: 'string', description: 'set-map-config: fog-of-war mask image path.' },
            color: { type: 'string', description: 'create-achievement/set-achievement: hex color flag.' },
            award: { type: 'boolean', description: 'set-achievement: grant (true → OWNER) or revoke (false → NONE) for userId.' },
            userId: { type: 'string', description: 'set-achievement: the user to award/revoke.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: SimpleQuestArgs) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-simple-quest action', { action });
    switch (action) {
      case 'list-quests': return this.run<SQListQuestsResult>(action, rawArgs, formatListQuests);
      case 'get-quest': return this.run<SQGetQuestResult>(action, rawArgs, formatGetQuest);
      case 'create-quest': return this.run<SQCreateQuestResult>(action, rawArgs, formatCreateQuest);
      case 'set-quest-state': return this.run<SQSetQuestStateResult>(action, rawArgs, formatSetQuestState);
      case 'set-objective-state': return this.run<SQObjectiveStateResult>(action, rawArgs, formatObjectiveState);
      case 'set-objective-visibility': return this.run<SQObjectiveVisibilityResult>(action, rawArgs, formatObjectiveVisibility);
      case 'set-quest-visibility': return this.run<SQQuestVisibilityResult>(action, rawArgs, formatQuestVisibility);
      case 'set-subquest-state': return this.run<SQSubquestStateResult>(action, rawArgs, formatSubquestState);
      case 'move-quest': return this.run<SQMoveQuestResult>(action, rawArgs, formatMoveQuest);
      case 'mark-quest-updated': return this.run<SQMarkUpdatedResult>(action, rawArgs, formatMarkUpdated);
      case 'share-quest': return this.run<SQShareQuestResult>(action, rawArgs, formatShareQuest);
      case 'show-quest-to-players': return this.run<SQShowToPlayersResult>(action, rawArgs, formatShowToPlayers);
      case 'set-counter': return this.run<SQSetCounterResult>(action, rawArgs, formatSetCounter);
      case 'duplicate-quest': return this.run<SQDuplicateQuestResult>(action, rawArgs, formatDuplicateQuest);
      case 'delete-quest': return this.run<SQDeleteQuestResult>(action, rawArgs, formatDeleteQuest);
      case 'create-map-marker': return this.run<SQMarkerResult>(action, rawArgs, formatMarker);
      case 'update-map-marker': return this.run<SQMarkerResult>(action, rawArgs, formatMarker);
      case 'remove-map-marker': return this.run<SQRemoveMarkerResult>(action, rawArgs, formatRemoveMarker);
      case 'set-map-config': return this.run<SQMapConfigResult>(action, rawArgs, formatMapConfig);
      case 'list-lore': return this.run<SQListLoreResult>(action, rawArgs, formatListLore);
      case 'create-lore': return this.run<SQCreateLoreResult>(action, rawArgs, formatCreateLore);
      case 'list-achievements': return this.run<SQListAchievementsResult>(action, rawArgs, formatListAchievements);
      case 'create-achievement': return this.run<SQCreateAchievementResult>(action, rawArgs, formatCreateAchievement);
      case 'set-achievement': return this.run<SQSetAchievementResult>(action, rawArgs, formatSetAchievement);
      default:
        return this.errorResponse('unknown', `unknown action: ${action}`);
    }
  }

  /** Run one action: typed query + format, intercept MODULE_NOT_ACTIVE, else BaseTool.errorResponse. */
  private async run<T>(action: string, args: Record<string, unknown>, fmt: (d: T) => string) {
    try {
      const data = await this.query<T>('module-simple-quest', args);
      return { content: [{ type: 'text' as const, text: fmt(data) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-simple-quest', msg);
      return this.errorResponse(action, msg);
    }
  }
}
