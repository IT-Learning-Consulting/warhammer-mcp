// Module Integration v1 Phase 12 — module-chat-commander handler (_chatcommands v2.0.5).
//
// Always-registered umbrella. requireModuleActive('_chatcommands') is the FIRST executable
// statement — RETURNS the MODULE_NOT_ACTIVE envelope, never throws (Phase-1 carry-forward).
//
// 4 actions over the verified server-reachable surface (dossier §4.2):
//   reads:  list-commands, get-command
//   confirm-gated writes: register-command, unregister-command (CCR-4 z.literal(true)).
//
// ADR-9.1 accessor: `game.chatCommands` (Class-1; also game.modules.get('_chatcommands').api, same
// instance). register()/unregister()/commands are INSTANCE methods using `this` → ALWAYS called
// BOUND off `api` (never destructured) — pre-plan §Live-state (subagent 5). register() is
// synchronous (in-memory Map mutation) → immediate read-back is reliable (NOT the party-resources
// fire-and-forget race). _chatcommands never throws its own *_UNAVAILABLE → we author the guard.
//
// Persistence (register-command): the command Map is volatile (lost on reload). We create a Script
// macro whose body re-registers the command on the `chatCommandsReady` hook, flagged
// advanced-macros runForSpecificUser=runAsWorldScript so it auto-runs every world load. This is
// DEPENDENCY_GATED on advanced-macros — if absent, register-command fails (persistence is the point).
//
// Anchors: DP-15 (typed), DP-16 (post-write verify), CCR-3 (notify on writes), CCR-4 (confirm on
// register/unregister). Source: phase12_pre_plan.md.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ModuleChatCommanderInput, type ModuleChatCommanderInputType } from './schemas.js';
import { notify } from '../../../notify.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

const MODULE_ID = '_chatcommands';
const ADV_MACROS = 'advanced-macros';
const WFRP_COMMANDS_MODULE = 'chat-commander-wfrp4e';

// ── Local helpers ──────────────────────────────────────────────────────────────

function isGM(): boolean {
  return Boolean((globalThis as any).game?.user?.isGM);
}

/** Resolve `game.chatCommands` (ADR-9.1 Class-1 accessor), or throw a typed *_UNAVAILABLE. */
function getChatCommandsApi(): any {
  const api = (globalThis as any).game?.chatCommands;
  if (!api) {
    throw new Error(
      'CHAT_COMMANDS_UNAVAILABLE: game.chatCommands is not bound — _chatcommands may not have reached its init hook',
    );
  }
  return api;
}

interface ChatCommandItem {
  name: string;
  aliases: string[];
  module: string;
  moduleName: string;
  description: string | undefined;
  icon: string | undefined;
  requiredRole: string;
  closeOnComplete: boolean;
  hasCallback: boolean;
  hasAutocompleteCallback: boolean;
  canInvoke: boolean;
}

/** Map a ChatCommand instance to a serializable item (functions → booleans). */
function serializeCommand(cmd: any): ChatCommandItem {
  return {
    name: String(cmd.name ?? ''),
    aliases: Array.isArray(cmd.aliases) ? cmd.aliases.map((a: any) => String(a)) : [],
    module: String(cmd.module ?? ''),
    moduleName: String(cmd.moduleName ?? cmd.module ?? ''),
    description: cmd.description != null ? String(cmd.description) : undefined,
    icon: cmd.icon != null ? String(cmd.icon) : undefined,
    requiredRole: String(cmd.requiredRole ?? 'NONE'),
    closeOnComplete: cmd.closeOnComplete !== false,
    hasCallback: typeof cmd.callback === 'function',
    hasAutocompleteCallback: typeof cmd.autocompleteCallback === 'function',
    canInvoke: typeof cmd.canInvoke === 'function' ? Boolean(cmd.canInvoke()) : true,
  };
}

/** Dedupe the commands Map by primary name (each alias maps to the same instance). */
function listAllCommands(api: any): ChatCommandItem[] {
  const seen = new Set<string>();
  const out: ChatCommandItem[] = [];
  const map = api.commands;
  if (!map || typeof map.values !== 'function') return out;
  for (const cmd of map.values()) {
    const primary = String(cmd?.name ?? '');
    if (!primary || seen.has(primary)) continue;
    seen.add(primary);
    out.push(serializeCommand(cmd));
  }
  return out;
}

function stripSlash(name: string): string {
  return name.replace(/^\/+/, '');
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

const WRITE_ACTIONS = new Set(['register-command', 'unregister-command']);

export async function dispatchModuleChatCommander(data: unknown): Promise<Envelope<unknown>> {
  // Guard FIRST — RETURNS {success:false,error}; never throws (carry-forward).
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: ModuleChatCommanderInputType;
  try {
    input = ModuleChatCommanderInput.parse(data);
  } catch (e) {
    return { success: false, error: `CHAT_COMMANDER_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `CHAT_COMMANDER_ACCESS_DENIED: ${input.action} requires GM` };
  }

  try {
    // await each handler so async throws become the typed HANDLER_ERROR envelope (Phase-11 lesson).
    switch (input.action) {
      case 'list-commands':
        return await handleListCommands(input);
      case 'get-command':
        return await handleGetCommand(input);
      case 'register-command':
        return await handleRegisterCommand(input);
      case 'unregister-command':
        return await handleUnregisterCommand(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `CHAT_COMMANDER_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `CHAT_COMMANDER_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Reads ───────────────────────────────────────────────────────────────────────

type ListInput = Extract<ModuleChatCommanderInputType, { action: 'list-commands' }>;
async function handleListCommands(input: ListInput): Promise<Envelope<unknown>> {
  const api = getChatCommandsApi();
  let commands = listAllCommands(api);
  const f = input.filter;
  if (f) {
    if (f.module) commands = commands.filter((c) => c.module === f.module);
    if (f.requiredRole) commands = commands.filter((c) => c.requiredRole === f.requiredRole);
    if (f.nameSubstring) {
      const needle = f.nameSubstring.toLowerCase();
      commands = commands.filter((c) => c.name.toLowerCase().includes(needle));
    }
  }
  commands.sort((a, b) => a.name.localeCompare(b.name));
  // BUG-383: surface the built-in advisory when the result includes chat-commander-wfrp4e
  // commands — they re-register on every world reload, so unregister-command is session-only
  // for them (consistent with the warning unregister-command already returns).
  const hasBuiltinWfrp = commands.some((c) => String(c.module) === WFRP_COMMANDS_MODULE);
  return {
    success: true,
    data: {
      count: commands.length,
      commands,
      builtinWfrpWarning: hasBuiltinWfrp
        ? 'Result includes chat-commander-wfrp4e built-in commands (registered under module id "wfrp4e"). These re-register on every world reload; unregister-command is session-only for them.'
        : undefined,
    },
  };
}

type GetInput = Extract<ModuleChatCommanderInputType, { action: 'get-command' }>;
async function handleGetCommand(input: GetInput): Promise<Envelope<unknown>> {
  const api = getChatCommandsApi();
  const cmd = api.commands?.get?.(input.name.toLowerCase());
  if (!cmd) return { success: true, data: null };
  return { success: true, data: serializeCommand(cmd) };
}

// ── register-command (confirm-gated; DEPENDENCY_GATED on advanced-macros) ─────────

function buildWorldScriptBody(input: RegisterInput, module: string): string {
  const opts: string[] = [
    `      name: ${JSON.stringify(input.name)}`,
    `      module: ${JSON.stringify(module)}`,
  ];
  if (input.description !== undefined) opts.push(`      description: ${JSON.stringify(input.description)}`);
  if (input.icon !== undefined) opts.push(`      icon: ${JSON.stringify(input.icon)}`);
  if (input.requiredRole !== undefined) opts.push(`      requiredRole: ${JSON.stringify(input.requiredRole)}`);
  if (input.aliases !== undefined) opts.push(`      aliases: ${JSON.stringify(input.aliases)}`);
  if (input.closeOnComplete !== undefined) opts.push(`      closeOnComplete: ${JSON.stringify(input.closeOnComplete)}`);
  opts.push(`      callback: async (chat, parameters, messageData) => {\n${input.callbackBody}\n      }`);
  if (input.autocompleteBody !== undefined) {
    opts.push(`      autocompleteCallback: async (menu, alias, parameters) => {\n${input.autocompleteBody}\n      }`);
  }
  // World-script: re-register on chatCommandsReady (NOT bare ready — ensures the API is initialized).
  return [
    `// Auto-generated by warhammer-mcp module-chat-commander (Phase 12). Re-registers on every world load.`,
    `Hooks.on("chatCommandsReady", (chatCommands) => {`,
    `  chatCommands.register({`,
    opts.join(',\n'),
    `  });`,
    `});`,
  ].join('\n');
}

type RegisterInput = Extract<ModuleChatCommanderInputType, { action: 'register-command' }>;
async function handleRegisterCommand(input: RegisterInput): Promise<Envelope<unknown>> {
  // DEPENDENCY_GATED — persistence (the point of register-command) needs advanced-macros.
  if (!(globalThis as any).game?.modules?.get?.(ADV_MACROS)?.active) {
    return {
      success: false,
      error:
        'ADVANCED_MACROS_NOT_ACTIVE: register-command needs advanced-macros active to persist the command via a world-script macro (fallback: session-only registration is not exposed)',
    };
  }
  if (!input.name.startsWith('/')) {
    return { success: false, error: `CHAT_COMMANDER_BAD_NAME: command name must start with "/" (got "${input.name}")` };
  }

  const api = getChatCommandsApi();
  const module = input.module ?? 'warhammer-mcp';

  // 1) Build the immediate-session callback from the raw body (GM + confirm-gated by design).
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  let callback: any;
  try {
    callback = new AsyncFunction('chat', 'parameters', 'messageData', input.callbackBody);
  } catch (e) {
    return { success: false, error: `CHAT_COMMANDER_CALLBACK_PARSE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
  const regSpec: any = {
    name: input.name,
    module,
    callback,
  };
  if (input.description !== undefined) regSpec.description = input.description;
  if (input.icon !== undefined) regSpec.icon = input.icon;
  if (input.requiredRole !== undefined) regSpec.requiredRole = input.requiredRole;
  if (input.aliases !== undefined) regSpec.aliases = input.aliases;
  if (input.closeOnComplete !== undefined) regSpec.closeOnComplete = input.closeOnComplete;
  if (input.autocompleteBody !== undefined) {
    try {
      regSpec.autocompleteCallback = new AsyncFunction('menu', 'alias', 'parameters', input.autocompleteBody);
    } catch (e) {
      return { success: false, error: `CHAT_COMMANDER_AUTOCOMPLETE_PARSE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
    }
  }

  // 2) Register immediately in the current session — call BOUND off api (instance method uses `this`).
  api.register(regSpec);

  // 3) Resolve the ACTUAL registered name (conflict auto-namespaces to /<module>.<name>).
  let commandName = input.name;
  if (api.commands && typeof api.commands.values === 'function') {
    for (const cmd of api.commands.values()) {
      if (cmd?.callback === callback && cmd?.name) {
        commandName = String(cmd.name);
        break;
      }
    }
  }

  // 4) Create the world-script macro for persistence (advanced-macros runAsWorldScript flag).
  const MacroCls = (globalThis as any).CONFIG?.Macro?.documentClass ?? (globalThis as any).Macro;
  const baseMacroName = `_chatcmd_${stripSlash(input.name)}`;
  const nameTaken = (n: string) =>
    Array.from((globalThis as any).game?.macros?.values?.() ?? []).some((m: any) => (m._source?.name ?? m.name) === n);
  const macroName = nameTaken(baseMacroName) ? `_chatcmd_${module}_${stripSlash(input.name)}` : baseMacroName;

  const created = await MacroCls.create({
    name: macroName,
    type: 'script',
    scope: 'global',
    command: buildWorldScriptBody(input, module),
    flags: { [ADV_MACROS]: { runForSpecificUser: 'runAsWorldScript' } },
  });
  if (!created) {
    return { success: false, error: 'CHAT_COMMANDER_MACRO_CREATE_FAILED: world-script macro was not created' };
  }
  // DP-16 — confirm persistence + flag.
  const persisted = (globalThis as any).game?.macros?.get(created.id);
  const persistsOnReload =
    Boolean(persisted) && persisted.getFlag(ADV_MACROS, 'runForSpecificUser') === 'runAsWorldScript';

  notify.created('chat-commander', commandName, {
    summary: persistsOnReload ? 'registered (world-script, persists on reload)' : 'registered (session only)',
  });

  return {
    success: true,
    data: {
      macroId: created.id as string,
      macroName,
      commandName,
      requestedName: input.name,
      worldScriptRegistered: persistsOnReload,
      persistsOnReload,
    },
  };
}

// ── unregister-command (CCR-Delete-Safety) ────────────────────────────────────────

type UnregisterInput = Extract<ModuleChatCommanderInputType, { action: 'unregister-command' }>;
async function handleUnregisterCommand(input: UnregisterInput): Promise<Envelope<unknown>> {
  const api = getChatCommandsApi();
  const lookup = input.name.toLowerCase();
  const existing = api.commands?.get?.(lookup);
  const isBuiltinWfrp = existing && String(existing.module) === WFRP_COMMANDS_MODULE;

  const immediateUnregister = input.immediateUnregister !== false; // default true
  const deleteWorldScript = input.deleteWorldScript !== false; // default true

  let unregistered = false;
  if (immediateUnregister && existing) {
    // Call BOUND off api (instance method uses `this.commands`).
    api.unregister(existing.name ?? input.name);
    unregistered = !api.commands?.get?.(lookup);
  }

  // Delete the backing world-script macro (match by name marker in the generated body).
  let macroId: string | undefined;
  let macroDeleted = false;
  if (deleteWorldScript) {
    const marker = `name: ${JSON.stringify(input.name)}`;
    for (const macro of ((globalThis as any).game?.macros?.contents ?? [])) {
      const flag = macro.getFlag?.(ADV_MACROS, 'runForSpecificUser');
      const cmd = (macro._source?.command as string) ?? '';
      if (
        (flag === 'runAsWorldScript' || flag === 'runAsWorldScriptSetup') &&
        cmd.includes('chatCommands.register') &&
        cmd.includes(marker)
      ) {
        macroId = macro.id as string;
        await macro.delete();
        macroDeleted = !(globalThis as any).game?.macros?.get(macroId);
        break;
      }
    }
  }

  const summary = isBuiltinWfrp
    ? 'built-in WFRP4e command — session-only (chat-commander-wfrp4e re-registers on reload)'
    : `${macroDeleted ? 'backing macro deleted' : 'session-only'}`;
  notify.deleted('chat-commander', input.name, { summary });

  return {
    success: true,
    data: {
      unregistered,
      macroId,
      macroDeleted,
      builtinWfrpWarning: isBuiltinWfrp
        ? 'This is a chat-commander-wfrp4e built-in command. Unregister is session-only; it re-registers on the next world reload unless the module is disabled.'
        : undefined,
    },
  };
}
