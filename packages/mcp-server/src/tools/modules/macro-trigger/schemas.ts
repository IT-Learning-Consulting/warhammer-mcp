// Module Integration v2 Phase 11 — module-macro-trigger mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool layer
// only needs typed response shapes for this.query<T> (DP-15 — never <any>).
//
// Macro Trigger v1.0.1. 5 actions over a flat settings-array CRUD (`macro-trigger.macroEvents`). Each
// handler return carries `action` as a discriminant; MacroTriggerResult is their union so the tool stays
// typed without <any>.

export interface MacroTriggerBinding {
  id: string;
  name: string;
  macroId: string;
  event: string;
}

export interface MacroTriggerListResult {
  action: 'list';
  count: number;
  bindings: MacroTriggerBinding[];
}

export interface MacroTriggerCreateResult {
  action: 'create';
  binding: MacroTriggerBinding;
  warning?: string;
}

export interface MacroTriggerUpdateResult {
  action: 'update';
  binding: MacroTriggerBinding;
  warning?: string;
}

export interface MacroTriggerDeleteResult {
  action: 'delete';
  bindingId: string;
  deleted: true;
}

export interface MacroTriggerClearResult {
  action: 'clear';
  clearedCount: number;
}

export type MacroTriggerResult =
  | MacroTriggerListResult
  | MacroTriggerCreateResult
  | MacroTriggerUpdateResult
  | MacroTriggerDeleteResult
  | MacroTriggerClearResult;

// ── The action enum (mirrors the foundry-module discriminatedUnion literals; 5 actions) ──

export const MACRO_TRIGGER_ACTIONS = ['list', 'create', 'update', 'delete', 'clear'] as const;

export type MacroTriggerAction = (typeof MACRO_TRIGGER_ACTIONS)[number];

// The 38 Foundry hooks the macro-trigger module registers (mirrors the foundry-module schema's
// MACRO_TRIGGER_EVENTS — duplicated here package-local per CCR-5 so the mcp-server tool description /
// inputSchema enum can enumerate them without importing across the package boundary). Includes the
// v13-dead `renderJournalSheet` — exposed as-registered (D2); see the tool description for the caveat.
export const MACRO_TRIGGER_EVENTS = [
  'setup',
  'ready',
  'canvasReady',
  'preCreateActor',
  'createActor',
  'updateActor',
  'deleteActor',
  'preCreateItem',
  'createItem',
  'updateItem',
  'deleteItem',
  'preCreateToken',
  'createToken',
  'updateToken',
  'preUpdateToken',
  'deleteToken',
  'controlToken',
  'hoverToken',
  'targetToken',
  'preCreateScene',
  'createScene',
  'updateScene',
  'deleteScene',
  'preCreateCombat',
  'createCombat',
  'updateCombat',
  'deleteCombat',
  'combatStart',
  'combatRound',
  'combatTurn',
  'preCreateChatMessage',
  'createChatMessage',
  'renderChatMessage',
  'chatMessage',
  'renderActorSheet',
  'renderItemSheet',
  'renderSceneControls',
  'renderJournalSheet',
] as const;

export type MacroTriggerEvent = (typeof MACRO_TRIGGER_EVENTS)[number];
