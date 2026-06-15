// Module Integration v1 Phase 12 — module-chat-commander mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool
// layer only needs typed response shapes for this.query<T> (DP-15 — never <any>).

import { MacroId } from '@foundry-mcp/shared';

export interface ChatCommandItem {
  name: string;
  aliases: string[];
  module: string;
  moduleName: string;
  description?: string;
  icon?: string;
  requiredRole: string;
  closeOnComplete: boolean;
  hasCallback: boolean;
  hasAutocompleteCallback: boolean;
  canInvoke: boolean;
}

export interface ListCommandsResult {
  count: number;
  commands: ChatCommandItem[];
  builtinWfrpWarning?: string;
}

export type GetCommandResult = ChatCommandItem | null;

export interface RegisterCommandResult {
  macroId: MacroId;
  macroName: string;
  commandName: string; // ACTUAL registered name — may differ from requestedName on conflict
  requestedName: string;
  worldScriptRegistered: boolean;
  persistsOnReload: boolean;
}

export interface UnregisterCommandResult {
  unregistered: boolean;
  macroId?: MacroId;
  macroDeleted: boolean;
  builtinWfrpWarning?: string;
}
