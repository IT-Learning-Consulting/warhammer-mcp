// Module Integration v2 Phase 1 — module-conversation-hud MCP tool (ConversationHUD v6.0.0).
//
// Always-registered umbrella. The foundry-module handler guards on conversation-hud being active;
// when inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw →
// moduleNotActiveContent(). Use module-probe.is-active conversation-hud to pre-flight.
//
// 22 actions: reads (list-conversations, get-conversation, get-active-state, list-factions,
// get-faction) + GM-gated doc writes (create/update/delete-conversation, create/update-faction,
// set-scene-conversation, set-token-conversation) + transient runtime control (activate/deactivate,
// set-active-participant, add-participants, update-active-conversation, reorder-participants,
// set-visibility, set-background, toggle-speaking-as, set-minimize).
//
// HC-v2-6: the foundry-module handler routes around every dialog-opening path; this tool exposes
// only the dialog-free surface. CCR-v2-A: collective mode rejected. Anchors: DP-15 (concrete
// this.query<T> per action — never <any>); R2.4 (errors via BaseTool.errorResponse).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import type {
  ConvCreateResult,
  ConvGetResult,
  ConvListResult,
  ConvUpdateResult,
  ConvDeleteResult,
  ConvActivateResult,
  ConvActiveStateResult,
  ConvRuntimeResult,
  ConvSceneResult,
  ConvTokenResult,
  ConvFactionResult,
  ConvFactionListResult,
} from './schemas.js';

// ── Per-action formatters ─────────────────────────────────────────────────────

function formatCreate(d: ConvCreateResult): string {
  return `module-conversation-hud.create-conversation: "${d.name}" (${d.journalId}) — ${d.participantCount} participant(s). Activate with activate-conversation { journalId: "${d.journalId}" }.`;
}
function formatGet(d: ConvGetResult): string {
  const names = d.participants.map((p) => p.name ?? '?').join(', ');
  return `module-conversation-hud.get-conversation: "${d.name}" (${d.journalId}) — ${d.participantCount} participant(s)${names ? `: ${names}` : ''}. Background: ${d.background || '(none)'}.`;
}
function formatList(d: ConvListResult): string {
  if (!d.count) return 'module-conversation-hud.list-conversations: no saved conversations.';
  const lines = d.conversations.map((c) => `  • "${c.name}" (${c.journalId}) — ${c.participantCount} participant(s)`);
  return `module-conversation-hud.list-conversations: ${d.count} conversation(s):\n${lines.join('\n')}`;
}
function formatUpdate(d: ConvUpdateResult): string {
  return `module-conversation-hud.update-conversation: "${d.name}" (${d.journalId}) updated — ${d.participantCount} participant(s).`;
}
function formatDelete(d: ConvDeleteResult): string {
  return `module-conversation-hud.delete-conversation: deleted "${d.name ?? d.journalId}".`;
}
function formatActivate(d: ConvActivateResult): string {
  return `module-conversation-hud.activate-conversation: "${d.name}" active (visible ${d.visible}). ⚠ Runtime state is transient (not persisted; cleared on reload).`;
}
function formatActiveState(d: ConvActiveStateResult): string {
  if (!d.active) return 'module-conversation-hud.get-active-state: no active conversation.';
  return `module-conversation-hud.get-active-state: active, visible ${d.visible}, ${d.participantCount} participant(s), active participant ${d.currentActiveParticipant ?? '(none)'}.`;
}
function formatRuntime(d: ConvRuntimeResult): string {
  const bits: string[] = [];
  if (d.index !== undefined) bits.push(`active participant → ${d.index}`);
  if (d.added !== undefined) bits.push(`added ${d.added}`);
  if (d.oldIndex !== undefined) bits.push(`reorder ${d.oldIndex} → ${d.newIndex}`);
  if (d.visible !== undefined && d.visible !== null) bits.push(`visible ${d.visible}`);
  if (d.background !== undefined && d.background !== null) bits.push(`background ${d.background || '(cleared)'}`);
  if (d.toggled) bits.push('toggled speak-as');
  if (d.minimized !== undefined && d.minimized !== null) bits.push(`minimized ${d.minimized}`);
  if (d.locked !== undefined && d.locked !== null) bits.push(`locked ${d.locked}`);
  if (d.active === false) bits.push('deactivated');
  if (d.participantCount !== undefined && d.index === undefined) bits.push(`${d.participantCount} participant(s)`);
  return `module-conversation-hud: ${bits.join(', ') || 'done'}. (transient runtime state)`;
}
function formatScene(d: ConvSceneResult): string {
  return d.cleared
    ? `module-conversation-hud.set-scene-conversation: cleared link on scene ${d.sceneId}.`
    : `module-conversation-hud.set-scene-conversation: scene ${d.sceneId} → conversation ${d.journalId} (visibilityOff ${d.visibilityOff}).`;
}
function formatToken(d: ConvTokenResult): string {
  return `module-conversation-hud.set-token-conversation: token ${d.tokenId} → ${d.journalId ?? '(cleared)'}${d.excludeFromPull !== null ? `, excludeFromPull ${d.excludeFromPull}` : ''}.`;
}
function formatFaction(d: ConvFactionResult): string {
  return `module-conversation-hud faction: "${d.name}" (${d.journalId}).`;
}
function formatFactionList(d: ConvFactionListResult): string {
  if (!d.count) return 'module-conversation-hud.list-factions: no faction documents.';
  const lines = d.factions.map((f) => `  • "${f.name}" (${f.journalId})`);
  return `module-conversation-hud.list-factions: ${d.count} faction(s):\n${lines.join('\n')}`;
}

export interface ModuleConversationHudToolOptions extends BaseToolOptions {}

export class ModuleConversationHudTool extends BaseTool {
  constructor(options: ModuleConversationHudToolOptions) {
    super(options);
  }

  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [{ name: 'module-conversation-hud', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-conversation-hud',
        title: 'ConversationHUD integration — NPC dialogue scenes',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Author + run ConversationHUD NPC dialogue scenes (WFRP4e). Persisted conversation/faction documents + transient runtime HUD control.
Conditional: returns MODULE_NOT_ACTIVE when conversation-hud is absent/inactive.
Pre-flight: module-probe.is-active conversation-hud before using this tool.

Two surfaces:
• PERSISTED documents (verifiable JournalEntries) — create/get/list/update/delete-conversation; create/update/get/list-faction; set-scene-conversation; set-token-conversation.
• TRANSIENT runtime control (socket-synced, NOT persisted — cleared on reload) — activate-conversation (journalId only), deactivate-conversation, get-active-state, set-active-participant, add-participants, update-active-conversation, reorder-participants, set-visibility, set-background, toggle-speaking-as, set-minimize.

22 actions:
Reads — list-conversations {}; get-conversation { journalId }; get-active-state {}; list-factions {}; get-faction { journalId }.
Doc writes (GM) — create-conversation { name?, background?, participants[], defaultActiveParticipant? }; update-conversation { journalId, name?, background?, participants?, defaultActiveParticipant? }; create-faction { name?, faction }; update-faction { journalId, faction }; set-scene-conversation { sceneId, journalId?(omit or blank clears), visibilityOff? }; set-token-conversation { tokenId, journalId?(omit or blank clears), excludeFromPull? }.
Confirm-gated (GM + confirm:true) — delete-conversation { journalId, confirm }.
Runtime control (GM; transient) — activate-conversation { journalId, visibilityOff? }; deactivate-conversation {}; set-active-participant { index }; add-participants { participants[] }; update-active-conversation { participants?, background?, defaultActiveParticipant? }; reorder-participants { oldIndex, newIndex }; set-visibility { visible }; set-background { background?, visible? }; toggle-speaking-as {}; set-minimize { minimized?, locked? }.

Participant shape: { name (required), img?, displayName?, imgScale?, portraitAnchor?{vertical,horizontal}, faction?{...}, linkedActor?, linkedJournal? }.
Collective mode is NOT supported (CCR-v2-A) — only gm-controlled.
Example: { action: "create-conversation", name: "Tavern Encounter", participants: [{ name: "Gustav", img: "icons/svg/mystery-man.svg" }] }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'create-conversation', 'get-conversation', 'list-conversations', 'update-conversation', 'delete-conversation',
                'activate-conversation', 'deactivate-conversation', 'get-active-state', 'set-active-participant',
                'add-participants', 'update-active-conversation', 'reorder-participants', 'set-visibility', 'set-background',
                'toggle-speaking-as', 'set-minimize', 'set-scene-conversation', 'set-token-conversation',
                'create-faction', 'update-faction', 'get-faction', 'list-factions',
              ],
              description: 'ConversationHUD action to perform.',
            },
            journalId: { type: 'string', description: 'Target conversation/faction JournalEntry id.' },
            name: { type: 'string', description: 'create/update-conversation, create-faction: document name.' },
            background: { type: 'string', description: 'create/update-conversation, set-background: background image path.' },
            participants: {
              type: 'array',
              description: 'Participants. Each { name (required), img?, displayName?, imgScale?, portraitAnchor?, faction?, linkedActor?, linkedJournal? }.',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  img: { type: 'string' },
                  displayName: { type: 'boolean' },
                  imgScale: { type: 'number' },
                  portraitAnchor: { type: 'object' },
                  faction: { type: 'object' },
                  linkedActor: { type: 'string' },
                  linkedJournal: { type: 'string' },
                },
                required: ['name'],
              },
            },
            defaultActiveParticipant: { type: 'number', description: 'Index of the participant active on start.' },
            folderId: { type: 'string', description: 'create-conversation/create-faction: target folder id.' },
            confirm: { type: 'boolean', description: 'delete-conversation: required (true) to delete the JournalEntry.' },
            visibilityOff: { type: 'boolean', description: 'activate-conversation/set-scene-conversation: start with the HUD hidden.' },
            index: { type: 'number', description: 'set-active-participant: participant index (-1 clears).' },
            oldIndex: { type: 'number', description: 'reorder-participants: source index.' },
            newIndex: { type: 'number', description: 'reorder-participants: destination index.' },
            visible: { type: 'boolean', description: 'set-visibility: HUD visibility; set-background: background visibility.' },
            minimized: { type: 'boolean', description: 'set-minimize: minimized state.' },
            locked: { type: 'boolean', description: 'set-minimize: lock the minimized state across clients.' },
            sceneId: { type: 'string', description: 'set-scene-conversation: target scene id.' },
            tokenId: { type: 'string', description: 'set-token-conversation: token id or UUID.' },
            excludeFromPull: { type: 'boolean', description: 'set-token-conversation: exclude this token from pull-from-scene.' },
            faction: {
              type: 'object',
              description: 'create/update-faction: faction data { displayFaction?, factionName?, factionLogo?, factionBannerEnabled?, factionBannerShape?, factionBannerTint? }.',
            },
            conversationType: { type: 'string', enum: ['gm-controlled', 'collective'], description: 'create-conversation: only gm-controlled is supported (collective is rejected).' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: Record<string, unknown>) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-conversation-hud action', { action });
    switch (action) {
      case 'create-conversation': return this.run<ConvCreateResult>(action, rawArgs, formatCreate);
      case 'get-conversation': return this.run<ConvGetResult>(action, rawArgs, formatGet);
      case 'list-conversations': return this.run<ConvListResult>(action, rawArgs, formatList);
      case 'update-conversation': return this.run<ConvUpdateResult>(action, rawArgs, formatUpdate);
      case 'delete-conversation': return this.run<ConvDeleteResult>(action, rawArgs, formatDelete);
      case 'activate-conversation': return this.run<ConvActivateResult>(action, rawArgs, formatActivate);
      case 'deactivate-conversation': return this.run<ConvRuntimeResult>(action, rawArgs, formatRuntime);
      case 'get-active-state': return this.run<ConvActiveStateResult>(action, rawArgs, formatActiveState);
      case 'set-active-participant': return this.run<ConvRuntimeResult>(action, rawArgs, formatRuntime);
      case 'add-participants': return this.run<ConvRuntimeResult>(action, rawArgs, formatRuntime);
      case 'update-active-conversation': return this.run<ConvRuntimeResult>(action, rawArgs, formatRuntime);
      case 'reorder-participants': return this.run<ConvRuntimeResult>(action, rawArgs, formatRuntime);
      case 'set-visibility': return this.run<ConvRuntimeResult>(action, rawArgs, formatRuntime);
      case 'set-background': return this.run<ConvRuntimeResult>(action, rawArgs, formatRuntime);
      case 'toggle-speaking-as': return this.run<ConvRuntimeResult>(action, rawArgs, formatRuntime);
      case 'set-minimize': return this.run<ConvRuntimeResult>(action, rawArgs, formatRuntime);
      case 'set-scene-conversation': return this.run<ConvSceneResult>(action, rawArgs, formatScene);
      case 'set-token-conversation': return this.run<ConvTokenResult>(action, rawArgs, formatToken);
      case 'create-faction': return this.run<ConvFactionResult>(action, rawArgs, formatFaction);
      case 'update-faction': return this.run<ConvFactionResult>(action, rawArgs, formatFaction);
      case 'get-faction': return this.run<ConvFactionResult>(action, rawArgs, formatFaction);
      case 'list-factions': return this.run<ConvFactionListResult>(action, rawArgs, formatFactionList);
      default:
        return this.errorResponse('unknown', `unknown action: ${action}`);
    }
  }

  /** Run one action: typed query + format, intercept MODULE_NOT_ACTIVE, else BaseTool.errorResponse. */
  private async run<T>(action: string, args: Record<string, unknown>, fmt: (d: T) => string) {
    try {
      const data = await this.query<T>('module-conversation-hud', args);
      return { content: [{ type: 'text' as const, text: fmt(data) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-conversation-hud', msg);
      return this.errorResponse(action, msg);
    }
  }
}
