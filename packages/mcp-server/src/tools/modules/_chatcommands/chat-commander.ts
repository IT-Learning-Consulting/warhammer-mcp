// Module Integration v1 Phase 12 — module-chat-commander MCP tool (_chatcommands integration).
//
// Always-registered umbrella. The foundry-module handler guards on _chatcommands being active;
// when inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw →
// moduleNotActiveContent(). Use module-probe.is-active _chatcommands to pre-flight.
//
// 4 actions: reads (list-commands, get-command) + confirm-gated writes
// (register-command [HIGH — callbackBody is arbitrary JS; DEPENDENCY_GATED on advanced-macros],
// unregister-command [MEDIUM — deletes the backing macro]).
//
// Anchors: DP-15 (concrete this.query<T> per action — never <any>); R2.4 (errors via BaseTool.errorResponse).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import type {
  ListCommandsResult,
  GetCommandResult,
  RegisterCommandResult,
  UnregisterCommandResult,
  ChatCommandItem,
} from './schemas.js';

const text = (s: string) => ({ content: [{ type: 'text' as const, text: s }] });


// ── Per-action formatters (surface every handler-returned field) ─────────────

function cmdLine(c: ChatCommandItem): string {
  const aliases = c.aliases.length ? ` (aliases: ${c.aliases.join(', ')})` : '';
  const desc = c.description ? ` — ${c.description}` : '';
  return `  • ${c.name}${aliases} [${c.module}] role=${c.requiredRole}${desc}`;
}

function formatList(d: ListCommandsResult): string {
  if (!d.count) return 'module-chat-commander.list-commands: no commands registered.';
  const lines = [`module-chat-commander.list-commands: ${d.count} command(s):`, ...d.commands.map(cmdLine)];
  if (d.builtinWfrpWarning) lines.push(`- ⚠ ${d.builtinWfrpWarning}`);
  return lines.join('\n');
}

function formatGet(d: GetCommandResult): string {
  if (!d) return 'module-chat-commander.get-command: command not found.';
  return [
    `module-chat-commander.get-command: ${d.name}`,
    `- module: ${d.module} (${d.moduleName})`,
    `- aliases: ${d.aliases.length ? d.aliases.join(', ') : '(none)'}`,
    `- requiredRole: ${d.requiredRole} · canInvoke: ${d.canInvoke} · closeOnComplete: ${d.closeOnComplete}`,
    `- description: ${d.description ?? '(none)'}`,
    `- hasCallback: ${d.hasCallback} · hasAutocompleteCallback: ${d.hasAutocompleteCallback}`,
  ].join('\n');
}

function formatRegister(d: RegisterCommandResult): string {
  const lines = [
    `module-chat-commander.register-command: ${d.commandName}`,
    `- backing macro: \`${d.macroId}\` ${d.macroName}`,
    `- worldScriptRegistered: ${d.worldScriptRegistered} · persistsOnReload: ${d.persistsOnReload}`,
  ];
  if (d.commandName !== d.requestedName) {
    lines.push(`- NOTE: auto-renamed from "${d.requestedName}" (name conflict — _chatcommands namespacing)`);
  }
  return lines.join('\n');
}

function formatUnregister(d: UnregisterCommandResult): string {
  const lines = [
    `module-chat-commander.unregister-command: ${d.unregistered ? 'unregistered' : 'not found (or not session-registered)'}`,
    `- macroDeleted: ${d.macroDeleted}${d.macroId ? ` (\`${d.macroId}\`)` : ''}`,
  ];
  if (d.builtinWfrpWarning) lines.push(`- ⚠ ${d.builtinWfrpWarning}`);
  return lines.join('\n');
}

export interface ModuleChatCommanderToolOptions extends BaseToolOptions {}

export class ModuleChatCommanderTool extends BaseTool {
  constructor(options: ModuleChatCommanderToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'module-chat-commander', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-chat-commander',
        title: 'Chat Commander integration (_chatcommands)',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Integrate _chatcommands: manage the game.chatCommands registry of /slash commands (list, get, register, unregister).
Conditional: returns MODULE_NOT_ACTIVE when _chatcommands is absent/inactive.
Pre-flight: module-probe.is-active _chatcommands before using this tool.

4 actions:
Reads — list-commands { filter? { module?, requiredRole?, nameSubstring? } }; get-command { name } (primary name or alias; null if absent).
Confirm-gated writes — register-command { name (must start with "/"), callbackBody, module?, description?, icon?, requiredRole?, aliases?, closeOnComplete?, autocompleteBody?, confirm:true } (HIGH: callbackBody is raw JS run in Foundry — always show the body + require confirm; DEPENDENCY_GATED — needs advanced-macros active to persist via a world-script macro); unregister-command { name, deleteWorldScript?, immediateUnregister?, confirm:true } (MEDIUM: destructive — warns when unregistering a built-in chat-commander-wfrp4e command, which re-registers on reload).

Persistence: register-command creates a world-script macro (advanced-macros runAsWorldScript + chatCommandsReady hook) so the command re-registers on every world reload, AND registers it immediately in the current session. Without advanced-macros, register-command fails with ADVANCED_MACROS_NOT_ACTIVE.
Naming conflicts: _chatcommands auto-namespaces collisions to /<moduleId>.<name>; register-command returns the ACTUAL commandName (compare to requestedName).

Example: { action: "list-commands", filter: { module: "chat-commander-wfrp4e" } }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['list-commands', 'get-command', 'register-command', 'unregister-command'],
              description: 'Chat Commander action to perform.',
            },
            filter: {
              type: 'object',
              description: 'list-commands: optional filter.',
              properties: {
                module: { type: 'string', description: 'Filter by registrant module ID (e.g. "chat-commander-wfrp4e").' },
                requiredRole: { type: 'string', enum: ['NONE', 'PLAYER', 'TRUSTED', 'ASSISTANT', 'GAMEMASTER'], description: 'Filter by role gate.' },
                nameSubstring: { type: 'string', description: 'Case-insensitive substring match on the command name.' },
              },
            },
            name: { type: 'string', description: 'get-command/unregister-command: primary name or alias. register-command: REQUIRED, must start with "/".' },
            callbackBody: { type: 'string', description: 'register-command: REQUIRED — raw JS body. Receives (chat, parameters, messageData). Return null=pass-through, {}=suppress, {content,type?}=post to chat.' },
            module: { type: 'string', description: 'register-command: registrant module ID (default "warhammer-mcp").' },
            description: { type: 'string', description: 'register-command: human-readable description shown in autocomplete.' },
            icon: { type: 'string', description: 'register-command: HTML icon string, e.g. "<i class=\'fas fa-radiation\'></i>".' },
            requiredRole: { type: 'string', enum: ['NONE', 'PLAYER', 'TRUSTED', 'ASSISTANT', 'GAMEMASTER'], description: 'register-command: role gate (default "NONE"). WARN if NONE + a write-capable callbackBody.' },
            aliases: { type: 'array', items: { type: 'string' }, description: 'register-command: additional invocation names.' },
            closeOnComplete: { type: 'boolean', description: 'register-command: close autocomplete on selection (default true).' },
            autocompleteBody: { type: 'string', description: 'register-command: optional raw JS autocomplete body. Receives (menu, alias, parameters).' },
            deleteWorldScript: { type: 'boolean', description: 'unregister-command: delete the backing _chatcmd_* macro (default true).' },
            immediateUnregister: { type: 'boolean', description: 'unregister-command: call game.chatCommands.unregister() now (default true).' },
            confirm: { type: 'boolean', description: 'Required (true) for register-command and unregister-command.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: Record<string, unknown>) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-chat-commander action', { action });
    switch (action) {
      case 'list-commands': return this.run<ListCommandsResult>(action, rawArgs, formatList);
      case 'get-command': return this.run<GetCommandResult>(action, rawArgs, formatGet);
      case 'register-command': return this.run<RegisterCommandResult>(action, rawArgs, formatRegister);
      case 'unregister-command': return this.run<UnregisterCommandResult>(action, rawArgs, formatUnregister);
      default:
        return this.errorResponse('unknown', `unknown action: ${action}`);
    }
  }

  /** Run one action: typed query + format, intercept MODULE_NOT_ACTIVE, else BaseTool.errorResponse. */
  private async run<T>(action: string, args: Record<string, unknown>, fmt: (d: T) => string) {
    try {
      const data = await this.query<T>('module-chat-commander', args);
      return text(fmt(data));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('MODULE_NOT_ACTIVE')) return moduleNotActiveContent('module-chat-commander', msg);
      return this.errorResponse(action, msg);
    }
  }
}
