// Module Integration v2 Phase 2 — module-simple-quest mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool
// layer only needs typed response shapes for this.query<T> (DP-15 — never <any>).
//
// Simple Quest v3.0.19 (theripper93). All state is flags.simple-quest.* on JournalEntryPage docs.

// ── Quest tab ───────────────────────────────────────────────────────────────────

export interface SQQuestPageSummary {
  pageId: string;
  uuid: string;
  name: string;
  hidden: boolean;
  completed: boolean;
  lastUpdated: number | null;
}

export interface SQCategorySummary {
  journalId: string;
  uuid: string;
  name: string;
  sort: number;
  pages: SQQuestPageSummary[];
}

export interface SQListQuestsResult {
  folderName: string;
  count: number;
  categories: SQCategorySummary[];
}

export interface SQGetQuestResult {
  pageId: string;
  uuid: string;
  name: string;
  category: string | null;
  content: string;
  flags: {
    checkboxes: Record<string, number>;
    secret: Record<string, boolean>;
    hidden: boolean;
    completed: boolean;
    completedSubquests: Record<string, boolean>;
    lastUpdated: number | null;
    counters: Record<string, number>;
    color: string | null;
    markers: Record<string, unknown>;
    measure: string | null;
    pinsLocked: boolean | null;
    fowMask: string | null;
  };
}

export interface SQCreateQuestResult {
  pageId: string;
  uuid: string;
  name: string;
  journalId: string;
  category: string;
}

export interface SQSetQuestStateResult {
  pageUuid: string;
  name: string;
  completed: boolean | null;
  tickedAll: number | null;
  lastUpdated: number;
}

export interface SQObjectiveStateResult {
  pageUuid: string;
  objectiveKey: string;
  state: number;
}

export interface SQObjectiveVisibilityResult {
  pageUuid: string;
  objectiveKey: string;
  hidden: boolean;
}

export interface SQQuestVisibilityResult {
  pageUuid: string;
  hidden: boolean;
}

export interface SQSubquestStateResult {
  pageUuid: string;
  headerKey: string;
  completed: boolean;
}

export interface SQMoveQuestResult {
  oldPageUuid: string;
  newPageUuid: string;
  targetCategory: string;
}

export interface SQMarkUpdatedResult {
  pageUuid: string;
  lastUpdated: number;
}

export interface SQShareQuestResult {
  pageUuid: string;
  name: string;
  chatMessageId: string;
}

export interface SQShowToPlayersResult {
  pageUuid: string;
  userIds: string[];
  delivered: boolean;
}

export interface SQSetCounterResult {
  pageUuid: string;
  counterId: string;
  value: number;
}

export interface SQDuplicateQuestResult {
  sourcePageUuid: string;
  newPageId: string;
  newPageUuid: string;
  name: string;
}

export interface SQDeleteQuestResult {
  pageUuid: string;
  name: string | null;
  deleted: boolean;
}

// ── Map tab ───────────────────────────────────────────────────────────────────

export interface SQMarkerResult {
  pageUuid: string;
  markerId: string;
  marker: Record<string, unknown>;
}

export interface SQRemoveMarkerResult {
  pageUuid: string;
  markerId: string;
  removed: boolean;
}

export interface SQMapConfigResult {
  pageUuid: string;
  measure: string | null;
  pinsLocked: boolean | null;
  fowMask: string | null;
}

// ── Lore tab ───────────────────────────────────────────────────────────────────

export interface SQLorePageSummary {
  pageId: string;
  uuid: string;
  name: string;
}

export interface SQListLoreResult {
  folderName: string;
  count: number;
  pages: SQLorePageSummary[];
}

export interface SQCreateLoreResult {
  pageId: string;
  uuid: string;
  name: string;
  journalId: string;
}

// ── Achievements tab ────────────────────────────────────────────────────────────

export interface SQAchievementSummary {
  pageId: string;
  uuid: string;
  name: string;
  color: string | null;
}

export interface SQListAchievementsResult {
  count: number;
  achievements: SQAchievementSummary[];
}

export interface SQCreateAchievementResult {
  pageId: string;
  uuid: string;
  name: string;
  journalId: string;
  color: string | null;
}

export interface SQSetAchievementResult {
  pageUuid: string;
  userId: string | null;
  award: boolean | null;
  color: string | null;
}

// ── The action enum (mirrors the foundry-module discriminatedUnion literals; 24 actions) ──

export const SIMPLE_QUEST_ACTIONS = [
  // Quest (15)
  'list-quests',
  'get-quest',
  'create-quest',
  'set-quest-state',
  'set-objective-state',
  'set-objective-visibility',
  'set-quest-visibility',
  'set-subquest-state',
  'move-quest',
  'mark-quest-updated',
  'share-quest',
  'show-quest-to-players',
  'set-counter',
  'duplicate-quest',
  'delete-quest',
  // Map (4)
  'create-map-marker',
  'update-map-marker',
  'remove-map-marker',
  'set-map-config',
  // Lore (2)
  'list-lore',
  'create-lore',
  // Achievements (3)
  'list-achievements',
  'create-achievement',
  'set-achievement',
] as const;

export type SimpleQuestAction = (typeof SIMPLE_QUEST_ACTIONS)[number];
