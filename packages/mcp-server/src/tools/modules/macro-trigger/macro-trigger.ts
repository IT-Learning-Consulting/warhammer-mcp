// Module Integration v2 Phase 11 — module-macro-trigger MCP tool (Macro Trigger v1.0.1, lobowarewolf).
//
// Always-registered umbrella. The foundry-module handler guards on macro-trigger being active; when
// inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw → moduleNotActiveContent().
// Pre-flight with module-probe.is-active macro-trigger.
//
// 5 actions, ONE flat settings-array CRUD architecture (`macro-trigger.macroEvents`). Anchors: DP-15
// (concrete this.query<MacroTriggerResult> — never <any>); R2.4 (errors via errorResponse). formatResult
// exhaustiveness is real — NO `as never` suppression ([[feedback_single_action_module_umbrella_exhaustiveness]]).
//
// CONFIRM-GATE (CCR-4): delete + clear are destructive (remove one/all bindings) and require
// confirm:true — re-establishes the phases 1-9 "at least one confirm-gated pair" norm after narrator's
// intentional zero-gate one-off (D5, phase 10).
//
// event ENUM: exposed exactly as the module registers its 38 supported hooks, including the v13-dead
// `renderJournalSheet` (v13 renamed the hook to `renderJournalEntrySheet`, never registered by the
// module) — see the tool description for the caveat (D2).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { MACRO_TRIGGER_ACTIONS, MACRO_TRIGGER_EVENTS, type MacroTriggerResult } from './schemas.js';
import { z } from 'zod';
import { MacroTriggerInput } from '@foundry-mcp/shared';

type MacroTriggerArgs = z.infer<typeof MacroTriggerInput>;

// ── Single discriminated formatter (one text line per action) ──────────────────

function formatResult(d: MacroTriggerResult): string {
  const p = 'module-macro-trigger';
  switch (d.action) {
    case 'list':
      return `${p}.list: ${d.count} binding(s).`;
    case 'create':
      return `${p}.create: "${d.binding.name}" bound to ${d.binding.event} (id ${d.binding.id})${d.warning ? ` — WARNING: ${d.warning}` : ''}.`;
    case 'update':
      return `${p}.update: binding ${d.binding.id} now "${d.binding.name}" bound to ${d.binding.event}${d.warning ? ` — WARNING: ${d.warning}` : ''}.`;
    case 'delete':
      return `${p}.delete: binding ${d.bindingId} removed.`;
    case 'clear':
      return `${p}.clear: ${d.clearedCount} binding(s) removed.`;
    default: {
      const _exhaustive: never = d;
      return `${p}: ${JSON.stringify(_exhaustive)}`;
    }
  }
}

export interface ModuleMacroTriggerToolOptions extends BaseToolOptions {}

export class ModuleMacroTriggerTool extends BaseTool {
  constructor(options: ModuleMacroTriggerToolOptions) {
    super(options);
  }

  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [{ name: 'module-macro-trigger', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-macro-trigger',
        title: 'Macro Trigger integration — bind world macros to Foundry lifecycle hooks',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Drive the Macro Trigger module — binds world macros to Foundry lifecycle hooks (createActor, combatStart, etc.) so a macro auto-executes whenever that hook fires. Writes the world setting macro-trigger.macroEvents directly (bypasses the module's own manager UI/class entirely).
Conditional: returns MODULE_NOT_ACTIVE when macro-trigger is absent/inactive. Pre-flight: module-probe.is-active macro-trigger.

EVENT ENUM (38 hooks, exposed exactly as the module registers them): setup, ready, canvasReady, preCreateActor, createActor, updateActor, deleteActor, preCreateItem, createItem, updateItem, deleteItem, preCreateToken, createToken, updateToken, preUpdateToken, deleteToken, controlToken, hoverToken, targetToken, preCreateScene, createScene, updateScene, deleteScene, preCreateCombat, createCombat, updateCombat, deleteCombat, combatStart, combatRound, combatTurn, preCreateChatMessage, createChatMessage, renderChatMessage, chatMessage, renderActorSheet, renderItemSheet, renderSceneControls, renderJournalSheet. NOTE: "renderJournalSheet" is DEAD on Foundry v13 (v13 renamed the hook to renderJournalEntrySheet, which the module never registers) — a binding on it persists but never fires; kept in the enum because the tool contract is "write what the module reads", not silently drop what it can't fix.

macroId SOFT-WARN: macroId may be a world-macro id (game.macros) OR a UUID (including a compendium macro, via fromUuid). If it doesn't resolve to either at create/update time, the binding is still written (mirrors the module's own non-blocking console.warn-at-fire) and the result carries a warning string — fix the macroId before relying on the binding firing.

MULTI-CLIENT CAVEAT: macro-trigger registers all 38 hooks on every connected client with no GM/socket gating — a bound macro may execute once PER CONNECTED CLIENT for hooks that fire client-side, not just once globally.

5 actions:
read (ungated): list { event? } — all bindings, optionally filtered to one hook.
writes (GM-only): create { name, event, macroId } · update { bindingId, name?, event?, macroId? }.
writes (GM-only, CONFIRM-GATED — destructive): delete { bindingId, confirm:true } · clear { confirm:true } (removes ALL bindings).

Example: { action: "create", name: "Announce new actor", event: "createActor", macroId: "abc123" }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: [...MACRO_TRIGGER_ACTIONS], description: 'Macro Trigger action to perform.' },
            name: { type: 'string', description: 'create: display name for the binding. update: rename the binding.' },
            event: { type: 'string', enum: [...MACRO_TRIGGER_EVENTS], description: 'The Foundry hook name to bind to (list: optional filter; create: required; update: optional change).' },
            macroId: { type: 'string', description: 'The Macro id (game.macros) or UUID (incl. compendium) to execute when the hook fires. Soft-validated — an unresolvable value still creates/updates the binding but surfaces a warning.' },
            bindingId: { type: 'string', description: 'update/delete: the binding\'s id (returned by create/list).' },
            confirm: { type: 'boolean', description: 'delete/clear: must be true to actually remove the binding(s) — omitted/false returns MACRO_TRIGGER_CONFIRM_REQUIRED.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: MacroTriggerArgs) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-macro-trigger action', { action });
    if (!(MACRO_TRIGGER_ACTIONS as readonly string[]).includes(action)) {
      return this.errorResponse(action, `unknown action: ${action}`);
    }
    try {
      const data = await this.query<MacroTriggerResult>('module-macro-trigger', rawArgs);
      return {
        content: [{ type: 'text' as const, text: formatResult(data) }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-macro-trigger', msg);
      return this.errorResponse(action, msg);
    }
  }
}
