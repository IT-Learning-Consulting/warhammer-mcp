// Module Integration v2 Phase 1 — module-conversation-hud handler (ConversationHUD v6.0.0).
//
// Always-registered umbrella. requireModuleActive('conversation-hud') is the FIRST executable
// statement — RETURNS the MODULE_NOT_ACTIVE envelope, never throws (v1 Phase 1 contract).
//
// 22 actions over the verified server-reachable surface (capability_audit/conversation-hud.md +
// live source read of conversation.js / GmControlledConversation.mjs):
//   reads:  list-conversations, get-conversation, get-active-state, list-factions, get-faction
//   doc writes (persisted JournalEntry): create-conversation, update-conversation,
//           delete-conversation, create-faction, update-faction, set-scene-conversation,
//           set-token-conversation
//   runtime control (TRANSIENT — direct game.ConversationHud.*): activate-conversation,
//           deactivate-conversation, set-active-participant, add-participants,
//           update-active-conversation, reorder-participants, set-visibility, set-background,
//           toggle-speaking-as, set-minimize
//
// ── HC-v2-6 (dialog-deadlock) — the load-bearing constraint ──────────────────────────
// ConversationHUD has 8 paths that open a DialogV2/confirm which DEADLOCKS the MCP socket
// ([[feedback_module_api_dialog_deadlock]]). This handler NEVER calls them and the schema NEVER
// exposes them. Per-path verdict (verified by reading the live source, ADR-10.1):
//   saveActiveConversation()        DIALOG → reimplemented as JournalEntry.create + page (no dialog)
//   onToggleConversation(true)      DIALOG → never called; activate uses startConversationFromJournalId
//   onToggleConversation(false)     DIALOG-FREE → broadcasts socket removeConversation (deactivate path)
//   closeActiveConversation()       DIALOG (confirm) → never called
//   executeFunction add-participant     DIALOG → use add-participants (batch)
//   executeFunction edit-participant    DIALOG → use update-active-conversation (full swap)
//   executeFunction remove-participant  DIALOG (confirm) → use update-active-conversation (full swap)
//   executeFunction change-background   DIALOG → use update-background (direct path)
//   executeFunction pull-participants-from-scene DIALOG → not exposed
// Dialog-free executeFunction types used: update-conversation, add-participants,
//   change-active-participant, reorder-participants, set-minimization, set-lock-minimization,
//   toggle-speaking-as, update-background, set-background-visibility.
//
// CCR-v2-A: collective mode is rejected (CONVERSATION_HUD_COLLECTIVE_REJECTED).
// Anchors: DP-15 (typed sub-handlers), DP-16 (post-write verify on doc/flag writes), CCR-3 (notify),
// CCR-4 (delete confirm gate). Source: phase1_pre_plan.md.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { verifyFlagWrite } from '../../../utils/verifyWrite.js';
import { ConversationHudInput, type ConversationHudInputType } from './schemas.js';
import { notify } from '../../../notify.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

const MODULE_ID = 'conversation-hud';
const SHEET_CONVERSATION = 'conversation-sheet.ConversationSheet';
const SHEET_FACTION = 'faction-sheet.FactionSheet';
const ENTRY_TYPE_CONVERSATION = 'conversation-sheet';
const ENTRY_TYPE_FACTION = 'faction-sheet';
const PAGE_TYPE_CONVERSATION = 'conversation-sheet-data';
const PAGE_TYPE_FACTION = 'faction-sheet-data';
const DATA_PAGE_NAME = '_chud_conversation_data';
const FACTION_PAGE_NAME = '_chud_faction_data';
const GM_CONTROLLED = 'gm-controlled';

// ── Local helpers ──────────────────────────────────────────────────────────────

function isGM(): boolean {
  return Boolean((globalThis as any).game?.user?.isGM);
}

/** Resolve the live `game.ConversationHud` instance (game.X accessor), or throw. */
function getCHud(): any {
  const chud = (globalThis as any).game?.ConversationHud;
  if (!chud) {
    throw new Error(
      'CONVERSATION_HUD_API_NOT_AVAILABLE: game.ConversationHud is not bound — the module may not have reached its init hook',
    );
  }
  return chud;
}

function getGame(): any {
  return (globalThis as any).game;
}

/** True for a "clear the link" signal. The MCP boundary types journalId as a string, so JSON null
 * cannot reach the handler — callers clear by OMITTING journalId (undefined) or passing a blank
 * string. Treat null / undefined / empty-or-whitespace / the literal "null" as clear so a stray
 * blank never writes a junk flag (BUG found at live smoke). */
function isClearSignal(v: string | null | undefined): boolean {
  if (v === null || v === undefined) return true;
  const t = String(v).trim().toLowerCase();
  return t === '' || t === 'null' || t === 'undefined';
}

/** Find the data page (conversation or faction) on a JournalEntry. */
function findDataPage(journal: any, pageType: string): any {
  return (
    journal?.pages?.find?.(
      (p: any) => (foundry as any).utils.getProperty(p, 'flags.conversation-hud.type') === pageType,
    ) ?? null
  );
}

/** Build the GMControlledConversationData blob the module stores + reads. */
function buildConversationBlob(input: {
  participants: any[];
  background?: string | undefined;
  defaultActiveParticipant?: number | undefined;
  features?: { isMinimized?: boolean; isMinimizationLocked?: boolean; isSpeakingAs?: boolean } | undefined;
}): any {
  return {
    type: GM_CONTROLLED,
    background: input.background ?? '',
    conversation: {
      data: {
        defaultActiveParticipant: input.defaultActiveParticipant,
        participants: input.participants ?? [],
      },
      features: {
        isMinimized: input.features?.isMinimized ?? false,
        isMinimizationLocked: input.features?.isMinimizationLocked ?? false,
        isSpeakingAs: input.features?.isSpeakingAs ?? false,
      },
    },
  };
}

/** GM ownership map (the GM who creates it owns; everyone else observer-0) — mirrors #handleSaveConversation. */
function gmOwnership(): Record<string, number> {
  const game = getGame();
  const permissions: Record<string, number> = {};
  game?.users?.forEach?.((u: any) => {
    permissions[u.id] = game.user?.id === u.id ? 3 : 0;
  });
  return permissions;
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

const WRITE_ACTIONS = new Set([
  'create-conversation',
  'update-conversation',
  'delete-conversation',
  'activate-conversation',
  'deactivate-conversation',
  'set-active-participant',
  'add-participants',
  'update-active-conversation',
  'reorder-participants',
  'set-visibility',
  'set-background',
  'toggle-speaking-as',
  'set-minimize',
  'set-scene-conversation',
  'set-token-conversation',
  'create-faction',
  'update-faction',
]);

export async function dispatchModuleConversationHud(data: unknown): Promise<Envelope<unknown>> {
  // Guard FIRST — RETURNS {success:false,error}; never throws.
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: ConversationHudInputType;
  try {
    input = ConversationHudInput.parse(data);
  } catch (e) {
    return { success: false, error: `CONVERSATION_HUD_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `CONVERSATION_HUD_ACCESS_DENIED: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      case 'create-conversation':
        return await handleCreateConversation(input);
      case 'get-conversation':
        return handleGetConversation(input);
      case 'list-conversations':
        return handleListConversations(input);
      case 'update-conversation':
        return await handleUpdateConversation(input);
      case 'delete-conversation':
        return await handleDeleteConversation(input);
      case 'activate-conversation':
        return handleActivateConversation(input);
      case 'deactivate-conversation':
        return handleDeactivateConversation(input);
      case 'get-active-state':
        return handleGetActiveState(input);
      case 'set-active-participant':
        return handleSetActiveParticipant(input);
      case 'add-participants':
        return handleAddParticipants(input);
      case 'update-active-conversation':
        return handleUpdateActiveConversation(input);
      case 'reorder-participants':
        return handleReorderParticipants(input);
      case 'set-visibility':
        return handleSetVisibility(input);
      case 'set-background':
        return handleSetBackground(input);
      case 'toggle-speaking-as':
        return handleToggleSpeakingAs(input);
      case 'set-minimize':
        return handleSetMinimize(input);
      case 'set-scene-conversation':
        return await handleSetSceneConversation(input);
      case 'set-token-conversation':
        return await handleSetTokenConversation(input);
      case 'create-faction':
        return await handleCreateFaction(input);
      case 'update-faction':
        return await handleUpdateFaction(input);
      case 'get-faction':
        return handleGetFaction(input);
      case 'list-factions':
        return handleListFactions(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `CONVERSATION_HUD_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `CONVERSATION_HUD_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Conversation document CRUD (persisted) ────────────────────────────────────────

type CreateConvInput = Extract<ConversationHudInputType, { action: 'create-conversation' }>;
async function handleCreateConversation(input: CreateConvInput): Promise<Envelope<unknown>> {
  // CCR-v2-A: collective is upstream-WIP, banned for v2.
  if (input.conversationType === 'collective') {
    return {
      success: false,
      error:
        'CONVERSATION_HUD_COLLECTIVE_REJECTED: collective conversation mode is upstream-WIP and not supported in v2 (CCR-v2-A). Use the default gm-controlled mode.',
    };
  }

  const blob = buildConversationBlob({
    participants: input.participants,
    background: input.background,
    defaultActiveParticipant: input.defaultActiveParticipant,
  });

  const JournalEntryCls = (globalThis as any).JournalEntry;
  const journal = await JournalEntryCls.create({
    name: input.name || 'New Conversation',
    folder: input.folderId || '',
    flags: {
      core: { sheetClass: SHEET_CONVERSATION },
      [MODULE_ID]: { type: ENTRY_TYPE_CONVERSATION },
    },
    ownership: gmOwnership(),
  });
  if (!journal) return { success: false, error: 'CONVERSATION_HUD_CREATE_FAILED: JournalEntry.create returned nothing' };

  await journal.createEmbeddedDocuments('JournalEntryPage', [
    {
      name: DATA_PAGE_NAME,
      text: { content: JSON.stringify(blob) },
      flags: { [MODULE_ID]: { type: PAGE_TYPE_CONVERSATION } },
    },
  ]);

  // DP-16 post-write verify: re-read, find the data page, parse, confirm participant count persisted.
  const fresh = getGame().journal.get(journal.id);
  const page = findDataPage(fresh, PAGE_TYPE_CONVERSATION);
  if (!page) {
    return { success: false, error: `${ErrorTokens.CONVERSATION_HUD_NOT_PERSISTED}: data page not found after create` };
  }
  let persistedCount = -1;
  try {
    persistedCount = JSON.parse(page.text.content)?.conversation?.data?.participants?.length ?? -1;
  } catch {
    /* falls through to the mismatch check */
  }
  if (persistedCount !== input.participants.length) {
    return {
      success: false,
      error: `${ErrorTokens.CONVERSATION_HUD_NOT_PERSISTED}: participants read back ${persistedCount}, expected ${input.participants.length}`,
    };
  }

  notify.created('conversation-hud', journal.name ?? 'Conversation', {
    summary: `conversation with ${input.participants.length} participant(s)`,
    uuid: journal.uuid,
  });
  return {
    success: true,
    data: {
      journalId: journal.id,
      uuid: journal.uuid,
      name: journal.name,
      participantCount: input.participants.length,
      background: blob.background,
      defaultActiveParticipant: input.defaultActiveParticipant ?? null,
    },
  };
}

type GetConvInput = Extract<ConversationHudInputType, { action: 'get-conversation' }>;
function handleGetConversation(input: GetConvInput): Envelope<unknown> {
  const journal = getGame().journal.get(input.journalId);
  if (!journal) return { success: false, error: `CONVERSATION_HUD_NOT_FOUND: no journal "${input.journalId}"` };
  if (journal.getFlag?.(MODULE_ID, 'type') !== ENTRY_TYPE_CONVERSATION) {
    return { success: false, error: `CONVERSATION_HUD_WRONG_TYPE: journal "${input.journalId}" is not a conversation document` };
  }
  const page = findDataPage(journal, PAGE_TYPE_CONVERSATION);
  if (!page) return { success: false, error: `CONVERSATION_HUD_NOT_FOUND: conversation "${input.journalId}" has no data page` };
  let blob: any = null;
  try {
    blob = JSON.parse(page.text.content);
  } catch (e) {
    return { success: false, error: `CONVERSATION_HUD_PARSE_FAILED: ${e instanceof Error ? e.message : String(e)}` };
  }
  const participants = blob?.conversation?.data?.participants ?? [];
  return {
    success: true,
    data: {
      journalId: journal.id,
      uuid: journal.uuid,
      name: journal.name,
      background: blob?.background ?? '',
      defaultActiveParticipant: blob?.conversation?.data?.defaultActiveParticipant ?? null,
      participants: participants.map((p: any) => ({ name: p.name ?? null, img: p.img ?? null })),
      participantCount: participants.length,
      conversationData: blob,
    },
  };
}

type ListConvInput = Extract<ConversationHudInputType, { action: 'list-conversations' }>;
function handleListConversations(_input: ListConvInput): Envelope<unknown> {
  const journals = getGame().journal?.filter?.((j: any) => j.getFlag?.(MODULE_ID, 'type') === ENTRY_TYPE_CONVERSATION) ?? [];
  const conversations = journals.map((j: any) => {
    const page = findDataPage(j, PAGE_TYPE_CONVERSATION);
    let count = 0;
    if (page) {
      try {
        count = JSON.parse(page.text.content)?.conversation?.data?.participants?.length ?? 0;
      } catch {
        count = 0;
      }
    }
    return { journalId: j.id, uuid: j.uuid, name: j.name, participantCount: count, folder: j.folder?.id ?? null };
  });
  return { success: true, data: { count: conversations.length, conversations } };
}

type UpdateConvInput = Extract<ConversationHudInputType, { action: 'update-conversation' }>;
async function handleUpdateConversation(input: UpdateConvInput): Promise<Envelope<unknown>> {
  const journal = getGame().journal.get(input.journalId);
  if (!journal) return { success: false, error: `CONVERSATION_HUD_NOT_FOUND: no journal "${input.journalId}"` };
  const page = findDataPage(journal, PAGE_TYPE_CONVERSATION);
  if (!page) return { success: false, error: `CONVERSATION_HUD_NOT_FOUND: conversation "${input.journalId}" has no data page` };

  let blob: any;
  try {
    blob = JSON.parse(page.text.content);
  } catch (e) {
    return { success: false, error: `CONVERSATION_HUD_PARSE_FAILED: ${e instanceof Error ? e.message : String(e)}` };
  }
  // Merge overrides into the existing blob.
  if (input.background !== undefined) blob.background = input.background;
  if (input.participants !== undefined) blob.conversation.data.participants = input.participants;
  if (input.defaultActiveParticipant !== undefined) blob.conversation.data.defaultActiveParticipant = input.defaultActiveParticipant;

  if (input.name) await journal.update({ name: input.name });
  await page.update({ 'text.content': JSON.stringify(blob) });

  // DP-16 verify.
  const freshPage = findDataPage(getGame().journal.get(input.journalId), PAGE_TYPE_CONVERSATION);
  let persistedCount = -1;
  try {
    persistedCount = JSON.parse(freshPage.text.content)?.conversation?.data?.participants?.length ?? -1;
  } catch {
    /* mismatch below */
  }
  const expectedCount = blob.conversation.data.participants?.length ?? 0;
  if (persistedCount !== expectedCount) {
    return {
      success: false,
      error: `${ErrorTokens.CONVERSATION_HUD_NOT_PERSISTED}: participants read back ${persistedCount}, expected ${expectedCount}`,
    };
  }

  notify.updated('conversation-hud', journal.name ?? 'Conversation', {
    summary: `updated (${expectedCount} participant(s))`,
    uuid: journal.uuid,
  });
  return {
    success: true,
    data: { journalId: journal.id, name: journal.name, participantCount: expectedCount, background: blob.background },
  };
}

type DeleteConvInput = Extract<ConversationHudInputType, { action: 'delete-conversation' }>;
async function handleDeleteConversation(input: DeleteConvInput): Promise<Envelope<unknown>> {
  // CCR-4 confirm gate (item-piles pattern) — actionable token on omission.
  if (input.confirm !== true) {
    return {
      success: false,
      error:
        'CONVERSATION_HUD_CONFIRM_REQUIRED: delete-conversation permanently deletes the saved conversation JournalEntry. Re-send with confirm:true.',
    };
  }
  const journal = getGame().journal.get(input.journalId);
  if (!journal) return { success: false, error: `CONVERSATION_HUD_NOT_FOUND: no journal "${input.journalId}"` };
  const name = journal.name;
  await journal.delete();
  // DP-16: confirm the document is gone.
  if (getGame().journal.get(input.journalId)) {
    return { success: false, error: `${ErrorTokens.CONVERSATION_HUD_NOT_PERSISTED}: journal "${input.journalId}" still present after delete` };
  }
  notify.deleted('conversation-hud', name ?? input.journalId, {});
  return { success: true, data: { journalId: input.journalId, name, deleted: true } };
}

// ── Runtime control (TRANSIENT — direct game.ConversationHud.*; dialog-free only) ──

type ActivateInput = Extract<ConversationHudInputType, { action: 'activate-conversation' }>;
function handleActivateConversation(input: ActivateInput): Envelope<unknown> {
  const journal = getGame().journal.get(input.journalId);
  if (!journal) return { success: false, error: `CONVERSATION_HUD_NOT_FOUND: no journal "${input.journalId}"` };
  if (!findDataPage(journal, PAGE_TYPE_CONVERSATION)) {
    return { success: false, error: `CONVERSATION_HUD_WRONG_TYPE: journal "${input.journalId}" has no conversation data page` };
  }
  const chud = getCHud();
  // Dialog-free: startConversationFromJournalId → #handleCreateConversationFromData → socket broadcast.
  chud.startConversationFromJournalId(input.journalId, input.visibilityOff ?? false);
  notify.info(`Conversation activated: ${journal.name ?? input.journalId}${input.visibilityOff ? ' (hidden)' : ''}`);
  return {
    success: true,
    data: {
      journalId: input.journalId,
      name: journal.name,
      active: true,
      visible: !(input.visibilityOff ?? false),
      transient: true, // runtime HUD state is socket-synced JS memory, NOT persisted (cleared on reload).
    },
  };
}

type DeactivateInput = Extract<ConversationHudInputType, { action: 'deactivate-conversation' }>;
function handleDeactivateConversation(_input: DeactivateInput): Envelope<unknown> {
  const chud = getCHud();
  if (!chud.conversationIsActive) {
    return { success: false, error: 'CONVERSATION_HUD_NO_ACTIVE_CONVERSATION: no conversation is currently active to deactivate' };
  }
  // Dialog-free: onToggleConversation(false) broadcasts socket removeConversation to all clients.
  chud.onToggleConversation(false);
  notify.info('Conversation deactivated');
  return { success: true, data: { active: false, transient: true } };
}

type GetActiveInput = Extract<ConversationHudInputType, { action: 'get-active-state' }>;
function handleGetActiveState(_input: GetActiveInput): Envelope<unknown> {
  const chud = getCHud();
  const state = chud.getConversation();
  const blob = state?.activeConversation?.conversationData;
  const participants = blob?.conversation?.data?.participants ?? [];
  return {
    success: true,
    data: {
      active: Boolean(state?.conversationIsActive),
      visible: Boolean(state?.conversationIsVisible),
      participantCount: participants.length,
      currentActiveParticipant: state?.activeConversation?.currentState?.currentActiveParticipant ?? null,
      transient: true,
    },
  };
}

/** Guard: runtime control ops require an active conversation. */
function requireActive(chud: any): Envelope<unknown> | null {
  if (!chud.conversationIsActive) {
    return { success: false, error: 'CONVERSATION_HUD_NO_ACTIVE_CONVERSATION: activate a conversation before runtime control' };
  }
  return null;
}

type SetActiveParticipantInput = Extract<ConversationHudInputType, { action: 'set-active-participant' }>;
function handleSetActiveParticipant(input: SetActiveParticipantInput): Envelope<unknown> {
  const chud = getCHud();
  const g = requireActive(chud);
  if (g) return g;
  chud.executeFunction({ scope: 'everyone', type: 'change-active-participant', data: { index: input.index } });
  notify.updated('conversation-hud', 'active conversation', { summary: `active participant → ${input.index}` });
  return { success: true, data: { index: input.index, transient: true } };
}

type AddParticipantsInput = Extract<ConversationHudInputType, { action: 'add-participants' }>;
function handleAddParticipants(input: AddParticipantsInput): Envelope<unknown> {
  const chud = getCHud();
  const g = requireActive(chud);
  if (g) return g;
  // Dialog-free batch add (the server-safe replacement for the dialog add-participant).
  chud.executeFunction({ scope: 'everyone', type: 'add-participants', data: input.participants });
  notify.updated('conversation-hud', 'active conversation', { summary: `added ${input.participants.length} participant(s)` });
  return { success: true, data: { added: input.participants.length, transient: true } };
}

type UpdateActiveInput = Extract<ConversationHudInputType, { action: 'update-active-conversation' }>;
function handleUpdateActiveConversation(input: UpdateActiveInput): Envelope<unknown> {
  const chud = getCHud();
  const g = requireActive(chud);
  if (g) return g;
  // Read current active blob, merge overrides, full swap — the server-safe edit/remove-participant path.
  const current = chud.getConversation()?.activeConversation?.conversationData;
  if (!current) return { success: false, error: 'CONVERSATION_HUD_NO_ACTIVE_CONVERSATION: no active conversation data to update' };
  const merged = {
    ...current,
    background: input.background !== undefined ? input.background : current.background,
    conversation: {
      ...current.conversation,
      data: {
        ...current.conversation.data,
        participants: input.participants !== undefined ? input.participants : current.conversation.data.participants,
        defaultActiveParticipant:
          input.defaultActiveParticipant !== undefined
            ? input.defaultActiveParticipant
            : current.conversation.data.defaultActiveParticipant,
      },
    },
  };
  chud.executeFunction({ scope: 'everyone', type: 'update-conversation', data: merged, options: { setDefaultParticipant: false } });
  const count = merged.conversation.data.participants?.length ?? 0;
  notify.updated('conversation-hud', 'active conversation', { summary: `full update (${count} participant(s))` });
  return { success: true, data: { participantCount: count, transient: true } };
}

type ReorderInput = Extract<ConversationHudInputType, { action: 'reorder-participants' }>;
function handleReorderParticipants(input: ReorderInput): Envelope<unknown> {
  const chud = getCHud();
  const g = requireActive(chud);
  if (g) return g;
  chud.executeFunction({ scope: 'everyone', type: 'reorder-participants', data: { oldIndex: input.oldIndex, newIndex: input.newIndex } });
  notify.updated('conversation-hud', 'active conversation', { summary: `reorder ${input.oldIndex} → ${input.newIndex}` });
  return { success: true, data: { oldIndex: input.oldIndex, newIndex: input.newIndex, transient: true } };
}

type SetVisibilityInput = Extract<ConversationHudInputType, { action: 'set-visibility' }>;
function handleSetVisibility(input: SetVisibilityInput): Envelope<unknown> {
  const chud = getCHud();
  const g = requireActive(chud);
  if (g) return g;
  // toggleConversationVisibility() broadcasts socket setConversationVisibility(!current). Toggle only if mismatched.
  if (Boolean(chud.conversationIsVisible) !== input.visible) {
    chud.toggleConversationVisibility();
  }
  notify.updated('conversation-hud', 'active conversation', { summary: `visibility → ${input.visible}` });
  return { success: true, data: { visible: input.visible, transient: true } };
}

type SetBackgroundInput = Extract<ConversationHudInputType, { action: 'set-background' }>;
function handleSetBackground(input: SetBackgroundInput): Envelope<unknown> {
  if (input.background === undefined && input.visible === undefined) {
    return { success: false, error: 'CONVERSATION_HUD_INVALID_INPUT: set-background requires at least one of: background, visible' };
  }
  const chud = getCHud();
  const g = requireActive(chud);
  if (g) return g;
  if (input.background !== undefined) {
    chud.executeFunction({ scope: 'everyone', type: 'update-background', data: { background: input.background } });
  }
  if (input.visible !== undefined) {
    chud.executeFunction({ scope: 'everyone', type: 'set-background-visibility', data: { isBackgroundVisible: input.visible } });
  }
  notify.updated('conversation-hud', 'active conversation', {
    summary: `background${input.background !== undefined ? ` → ${input.background || '(cleared)'}` : ''}${input.visible !== undefined ? ` visible=${input.visible}` : ''}`,
  });
  return { success: true, data: { background: input.background ?? null, visible: input.visible ?? null, transient: true } };
}

type ToggleSpeakingInput = Extract<ConversationHudInputType, { action: 'toggle-speaking-as' }>;
function handleToggleSpeakingAs(_input: ToggleSpeakingInput): Envelope<unknown> {
  const chud = getCHud();
  const g = requireActive(chud);
  if (g) return g;
  chud.executeFunction({ scope: 'everyone', type: 'toggle-speaking-as', data: {} });
  notify.updated('conversation-hud', 'active conversation', { summary: 'toggled speak-as mode' });
  return { success: true, data: { toggled: true, transient: true } };
}

type SetMinimizeInput = Extract<ConversationHudInputType, { action: 'set-minimize' }>;
function handleSetMinimize(input: SetMinimizeInput): Envelope<unknown> {
  if (input.minimized === undefined && input.locked === undefined) {
    return { success: false, error: 'CONVERSATION_HUD_INVALID_INPUT: set-minimize requires at least one of: minimized, locked' };
  }
  const chud = getCHud();
  const g = requireActive(chud);
  if (g) return g;
  if (input.minimized !== undefined) {
    chud.executeFunction({ scope: 'everyone', type: 'set-minimization', data: { isMinimized: input.minimized } });
  }
  if (input.locked !== undefined) {
    chud.executeFunction({
      scope: 'everyone',
      type: 'set-lock-minimization',
      data: { isMinimized: input.minimized ?? false, isMinimizationLocked: input.locked },
    });
  }
  notify.updated('conversation-hud', 'active conversation', {
    summary: `minimize${input.minimized !== undefined ? `=${input.minimized}` : ''}${input.locked !== undefined ? ` locked=${input.locked}` : ''}`,
  });
  return { success: true, data: { minimized: input.minimized ?? null, locked: input.locked ?? null, transient: true } };
}

// ── Scene / token link flags (persisted) ──────────────────────────────────────────

type SetSceneConvInput = Extract<ConversationHudInputType, { action: 'set-scene-conversation' }>;
async function handleSetSceneConversation(input: SetSceneConvInput): Promise<Envelope<unknown>> {
  const scene = getGame().scenes?.get?.(input.sceneId);
  if (!scene) return { success: false, error: `CONVERSATION_HUD_NOT_FOUND: no scene "${input.sceneId}"` };
  const clearing = isClearSignal(input.journalId);
  if (clearing) {
    await scene.update({ 'flags.conversation-hud.-=sceneConversation': null, 'flags.conversation-hud.-=sceneConversationVisibilityOff': null });
    notify.updated('conversation-hud', scene.name ?? input.sceneId, { summary: 'scene conversation link cleared' });
    return { success: true, data: { sceneId: input.sceneId, journalId: null, cleared: true } };
  }
  await scene.update({
    'flags.conversation-hud.sceneConversation': input.journalId,
    'flags.conversation-hud.sceneConversationVisibilityOff': input.visibilityOff ?? false,
  });
  // DP-16 flag verify.
  const fresh = getGame().scenes.get(input.sceneId);
  verifyFlagWrite(fresh, MODULE_ID, 'sceneConversation', input.journalId, ErrorTokens.CONVERSATION_HUD_NOT_PERSISTED);
  notify.updated('conversation-hud', scene.name ?? input.sceneId, { summary: `scene conversation → ${input.journalId}` });
  return { success: true, data: { sceneId: input.sceneId, journalId: input.journalId, visibilityOff: input.visibilityOff ?? false } };
}

type SetTokenConvInput = Extract<ConversationHudInputType, { action: 'set-token-conversation' }>;
async function handleSetTokenConversation(input: SetTokenConvInput): Promise<Envelope<unknown>> {
  const sync = (globalThis as any).fromUuidSync;
  const canvas = (globalThis as any).canvas;
  let tokenDoc: any = canvas?.tokens?.get?.(input.tokenId)?.document ?? null;
  if (!tokenDoc && typeof sync === 'function' && input.tokenId.includes('.')) {
    try {
      const r = sync(input.tokenId);
      tokenDoc = r?.document ?? r ?? null;
    } catch {
      tokenDoc = null;
    }
  }
  if (!tokenDoc) return { success: false, error: `CONVERSATION_HUD_NOT_FOUND: no token "${input.tokenId}" on the canvas` };

  const updates: Record<string, unknown> = {};
  // journalId omitted (undefined) => leave the link untouched; provided-but-blank => clear; provided => set.
  const touchingLink = input.journalId !== undefined;
  const clearing = touchingLink && isClearSignal(input.journalId);
  if (touchingLink) {
    if (clearing) updates['flags.conversation-hud.-=linkedConversation'] = null;
    else updates['flags.conversation-hud.linkedConversation'] = input.journalId;
  }
  if (input.excludeFromPull !== undefined) updates['flags.conversation-hud.excludeFromBeingPulled'] = input.excludeFromPull;
  await tokenDoc.update(updates);

  if (touchingLink && !clearing) {
    const fresh = canvas?.tokens?.get?.(input.tokenId)?.document ?? tokenDoc;
    verifyFlagWrite(fresh, MODULE_ID, 'linkedConversation', input.journalId, ErrorTokens.CONVERSATION_HUD_NOT_PERSISTED);
  }
  notify.updated('conversation-hud', tokenDoc.name ?? input.tokenId, {
    summary: `token conversation ${clearing ? 'cleared' : touchingLink ? `→ ${input.journalId}` : '(link unchanged)'}`.trim(),
  });
  return {
    success: true,
    data: { tokenId: input.tokenId, journalId: clearing || !touchingLink ? null : (input.journalId ?? null), excludeFromPull: input.excludeFromPull ?? null },
  };
}

// ── Faction documents (thin; persisted faction-sheet JournalEntry) ─────────────────

type CreateFactionInput = Extract<ConversationHudInputType, { action: 'create-faction' }>;
async function handleCreateFaction(input: CreateFactionInput): Promise<Envelope<unknown>> {
  const content = JSON.stringify({ faction: input.faction });
  const JournalEntryCls = (globalThis as any).JournalEntry;
  const journal = await JournalEntryCls.create({
    name: input.name || 'New Faction',
    folder: input.folderId || '',
    flags: {
      core: { sheetClass: SHEET_FACTION },
      [MODULE_ID]: { type: ENTRY_TYPE_FACTION },
    },
    ownership: gmOwnership(),
  });
  if (!journal) return { success: false, error: 'CONVERSATION_HUD_CREATE_FAILED: faction JournalEntry.create returned nothing' };
  await journal.createEmbeddedDocuments('JournalEntryPage', [
    { name: FACTION_PAGE_NAME, text: { content }, flags: { [MODULE_ID]: { type: PAGE_TYPE_FACTION } } },
  ]);
  const fresh = getGame().journal.get(journal.id);
  if (!findDataPage(fresh, PAGE_TYPE_FACTION)) {
    return { success: false, error: `${ErrorTokens.CONVERSATION_HUD_NOT_PERSISTED}: faction data page not found after create` };
  }
  notify.created('conversation-hud', journal.name ?? 'Faction', { summary: 'faction document', uuid: journal.uuid });
  return { success: true, data: { journalId: journal.id, uuid: journal.uuid, name: journal.name, faction: input.faction } };
}

type UpdateFactionInput = Extract<ConversationHudInputType, { action: 'update-faction' }>;
async function handleUpdateFaction(input: UpdateFactionInput): Promise<Envelope<unknown>> {
  const journal = getGame().journal.get(input.journalId);
  if (!journal) return { success: false, error: `CONVERSATION_HUD_NOT_FOUND: no journal "${input.journalId}"` };
  const page = findDataPage(journal, PAGE_TYPE_FACTION);
  if (!page) return { success: false, error: `CONVERSATION_HUD_WRONG_TYPE: journal "${input.journalId}" is not a faction document` };
  await page.update({ 'text.content': JSON.stringify({ faction: input.faction }) });
  notify.updated('conversation-hud', journal.name ?? 'Faction', { summary: 'faction updated', uuid: journal.uuid });
  return { success: true, data: { journalId: journal.id, name: journal.name, faction: input.faction } };
}

type GetFactionInput = Extract<ConversationHudInputType, { action: 'get-faction' }>;
function handleGetFaction(input: GetFactionInput): Envelope<unknown> {
  const journal = getGame().journal.get(input.journalId);
  if (!journal) return { success: false, error: `CONVERSATION_HUD_NOT_FOUND: no journal "${input.journalId}"` };
  const page = findDataPage(journal, PAGE_TYPE_FACTION);
  if (!page) return { success: false, error: `CONVERSATION_HUD_WRONG_TYPE: journal "${input.journalId}" is not a faction document` };
  let faction: any = null;
  try {
    faction = JSON.parse(page.text.content)?.faction ?? null;
  } catch (e) {
    return { success: false, error: `CONVERSATION_HUD_PARSE_FAILED: ${e instanceof Error ? e.message : String(e)}` };
  }
  return { success: true, data: { journalId: journal.id, uuid: journal.uuid, name: journal.name, faction } };
}

type ListFactionsInput = Extract<ConversationHudInputType, { action: 'list-factions' }>;
function handleListFactions(_input: ListFactionsInput): Envelope<unknown> {
  const journals = getGame().journal?.filter?.((j: any) => j.getFlag?.(MODULE_ID, 'type') === ENTRY_TYPE_FACTION) ?? [];
  const factions = journals.map((j: any) => ({ journalId: j.id, uuid: j.uuid, name: j.name, folder: j.folder?.id ?? null }));
  return { success: true, data: { count: factions.length, factions } };
}
