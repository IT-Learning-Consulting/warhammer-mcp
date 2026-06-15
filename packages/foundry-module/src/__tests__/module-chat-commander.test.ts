// Module Integration v1 Phase 12 — Unit test for module-chat-commander dispatcher (_chatcommands).
//
// Deterministic: mocks globalThis.game.modules + game.user + game.chatCommands (a FakeChatCommands
// whose register/unregister use `this` — the BOUND-CALL guard from the Phase-11 carry-forward) +
// game.macros + CONFIG.Macro.documentClass. No live Foundry. Branches:
//   - module inactive               → MODULE_NOT_ACTIVE
//   - api unbound                   → CHAT_COMMANDS_UNAVAILABLE
//   - non-GM on a write             → CHAT_COMMANDER_ACCESS_DENIED
//   - register missing confirm      → CHAT_COMMANDER_INVALID_INPUT
//   - list / get happy              → registry read-back + dedupe
//   - register happy                → bound api.register fires, world-script macro created,
//                                      persistsOnReload true (THE bound-call regression guard —
//                                      a destructured api.register would crash on `this.commands`)
//   - register conflict             → actual commandName auto-namespaced to /<module>.<name>
//   - register w/o advanced-macros  → ADVANCED_MACROS_NOT_ACTIVE (DEPENDENCY_GATED)
//   - unregister happy              → backing macro deleted
//   - unregister built-in WFRP4e    → session-only warning

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

import { dispatchModuleChatCommander } from '../handlers/modules/_chatcommands/chat-commander.js';

// A faithful-enough ChatCommands: register/unregister reference `this.commands` so an UNBOUND call
// (destructured `const { register } = api`) crashes — exactly the defect class the test guards.
class FakeChatCommands {
  commands = new Map<string, any>();
  register(spec: any) {
    let primary = spec.name;
    const clash = this.commands.get(spec.name);
    if (clash && clash.module !== spec.module) {
      primary = `/${spec.module}.${String(spec.name).replace(/^\/+/, '')}`;
    }
    const cmd = {
      ...spec,
      name: primary,
      aliases: spec.aliases ?? [],
      moduleName: spec.module,
      requiredRole: spec.requiredRole ?? 'NONE',
      closeOnComplete: spec.closeOnComplete !== false,
      canInvoke: () => true,
    };
    this.commands.set(primary, cmd); // uses `this` — unbound call would throw here
    for (const a of cmd.aliases) this.commands.set(a, cmd);
  }
  unregister(nameOrCmd: any) {
    const name = typeof nameOrCmd === 'string' ? nameOrCmd : nameOrCmd?.name;
    const cmd = this.commands.get(name);
    if (!cmd) return;
    for (const n of [cmd.name, ...cmd.aliases]) this.commands.delete(n);
  }
}

function makeMacroStore() {
  const map = new Map<string, any>();
  let counter = 0;
  class FakeMacro {
    id: string;
    _source: any;
    constructor(data: any) {
      this.id = `macro${++counter}`;
      this._source = { ...data };
    }
    get name() {
      return this._source.name;
    }
    getFlag(scope: string, key: string) {
      return this._source.flags?.[scope]?.[key];
    }
    async setFlag(scope: string, key: string, val: unknown) {
      this._source.flags ??= {};
      this._source.flags[scope] ??= {};
      this._source.flags[scope][key] = val;
    }
    async delete() {
      map.delete(this.id);
    }
    static async create(data: any) {
      const m = new FakeMacro(data);
      map.set(m.id, m);
      return m;
    }
  }
  return {
    MacroCls: FakeMacro,
    get: (id: string) => map.get(id),
    get contents() {
      return Array.from(map.values());
    },
    values: () => map.values(),
    _map: map,
  };
}

function setGame(opts: {
  active?: boolean;
  advActive?: boolean;
  isGM?: boolean;
  chatCommands?: any | null;
  macros?: any;
}) {
  const macros = opts.macros ?? makeMacroStore();
  (globalThis as any).game = {
    modules: {
      get: (id: string) => {
        if (id === '_chatcommands') return { active: opts.active !== false };
        if (id === 'advanced-macros') return { active: opts.advActive !== false };
        return { active: true };
      },
    },
    user: { isGM: opts.isGM !== false },
    chatCommands: opts.chatCommands === null ? undefined : opts.chatCommands ?? new FakeChatCommands(),
    macros,
  };
  (globalThis as any).CONFIG = { Macro: { documentClass: macros.MacroCls } };
  return { macros };
}

const REGISTER = (over: Record<string, unknown> = {}) => ({
  action: 'register-command',
  name: '/loot',
  callbackBody: 'return { content: "<p>loot</p>" };',
  module: 'warhammer-mcp',
  confirm: true,
  ...over,
});

describe('dispatchModuleChatCommander', () => {
  beforeEach(() => {
    (globalThis as any).game = undefined;
    (globalThis as any).CONFIG = undefined;
  });

  it('returns MODULE_NOT_ACTIVE when _chatcommands is inactive', async () => {
    setGame({ active: false });
    const r = await dispatchModuleChatCommander({ action: 'list-commands' });
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/^MODULE_NOT_ACTIVE:/);
  });

  it('surfaces CHAT_COMMANDS_UNAVAILABLE when game.chatCommands is not bound', async () => {
    setGame({ active: true, chatCommands: null });
    const r = await dispatchModuleChatCommander({ action: 'list-commands' });
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/CHAT_COMMANDS_UNAVAILABLE/);
  });

  it('returns CHAT_COMMANDER_ACCESS_DENIED for a non-GM on a write', async () => {
    setGame({ active: true, isGM: false });
    const r = await dispatchModuleChatCommander(REGISTER());
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/CHAT_COMMANDER_ACCESS_DENIED/);
  });

  it('returns CHAT_COMMANDER_INVALID_INPUT when register-command is missing confirm:true', async () => {
    setGame({ active: true });
    const r = await dispatchModuleChatCommander(REGISTER({ confirm: undefined }));
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/^CHAT_COMMANDER_INVALID_INPUT:/);
  });

  it('lists registered commands (deduped by primary name) with a module filter', async () => {
    const cc = new FakeChatCommands();
    // BUG-383 (live-verified): the built-in wfrp4e commands register under the SYSTEM id "wfrp4e",
    // NOT the module id "chat-commander-wfrp4e" — use the real id so this guards the actual detection.
    cc.register({ name: '/table', module: 'wfrp4e', aliases: ['/t'] });
    cc.register({ name: '/cond', module: 'wfrp4e' });
    setGame({ active: true, chatCommands: cc });
    const r = await dispatchModuleChatCommander({ action: 'list-commands', filter: { module: 'wfrp4e' } });
    expect(r.success).toBe(true);
    // /table has an alias mapping to the same instance → must NOT double-count.
    expect((r as any).data.count).toBe(2);
    // The advisory must be surfaced so a caller doesn't try to permanently unregister commands that
    // re-register on every reload.
    expect((r as any).data.builtinWfrpWarning).toMatch(/re-register on every world reload/);
  });

  it('omits builtinWfrpWarning when no chat-commander-wfrp4e commands are present (BUG-383)', async () => {
    const cc = new FakeChatCommands();
    cc.register({ name: '/loot', module: 'my-module' });
    setGame({ active: true, chatCommands: cc });
    const r = await dispatchModuleChatCommander({ action: 'list-commands' });
    expect(r.success).toBe(true);
    expect((r as any).data.builtinWfrpWarning).toBeUndefined();
  });

  it('gets a command by name and returns null for an unknown name', async () => {
    const cc = new FakeChatCommands();
    cc.register({ name: '/table', module: 'chat-commander-wfrp4e' });
    setGame({ active: true, chatCommands: cc });
    const hit = await dispatchModuleChatCommander({ action: 'get-command', name: '/table' });
    expect((hit as any).data.name).toBe('/table');
    const miss = await dispatchModuleChatCommander({ action: 'get-command', name: '/nope' });
    expect((miss as any).data).toBeNull();
  });

  it('register-command: BOUND api.register fires + world-script macro persists (bound-call guard)', async () => {
    const cc = new FakeChatCommands();
    const { macros } = setGame({ active: true, chatCommands: cc });
    const r = await dispatchModuleChatCommander(REGISTER());
    expect(r.success).toBe(true);
    const d = (r as any).data;
    expect(d.commandName).toBe('/loot');
    expect(d.persistsOnReload).toBe(true);
    expect(d.worldScriptRegistered).toBe(true);
    // The command actually landed in the (this-bound) registry.
    expect(cc.commands.get('/loot')).toBeTruthy();
    // The backing world-script macro exists + carries the advanced-macros flag.
    const macro = macros.get(d.macroId);
    expect(macro.getFlag('advanced-macros', 'runForSpecificUser')).toBe('runAsWorldScript');
    expect(macro._source.command).toContain('chatCommandsReady');
  });

  it('register-command: conflict auto-namespaces and returns the ACTUAL commandName', async () => {
    const cc = new FakeChatCommands();
    cc.register({ name: '/loot', module: 'some-other-module' }); // pre-existing clash
    setGame({ active: true, chatCommands: cc });
    const r = await dispatchModuleChatCommander(REGISTER());
    expect(r.success).toBe(true);
    expect((r as any).data.commandName).toBe('/warhammer-mcp.loot');
    expect((r as any).data.requestedName).toBe('/loot');
  });

  it('register-command: fails ADVANCED_MACROS_NOT_ACTIVE when advanced-macros is inactive', async () => {
    setGame({ active: true, advActive: false });
    const r = await dispatchModuleChatCommander(REGISTER());
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/ADVANCED_MACROS_NOT_ACTIVE/);
  });

  it('unregister-command: removes the command and deletes the backing macro', async () => {
    const cc = new FakeChatCommands();
    const { macros } = setGame({ active: true, chatCommands: cc });
    const reg = await dispatchModuleChatCommander(REGISTER());
    const macroId = (reg as any).data.macroId;
    const r = await dispatchModuleChatCommander({ action: 'unregister-command', name: '/loot', confirm: true });
    expect(r.success).toBe(true);
    expect((r as any).data.unregistered).toBe(true);
    expect((r as any).data.macroDeleted).toBe(true);
    expect(cc.commands.get('/loot')).toBeUndefined();
    expect(macros.get(macroId)).toBeUndefined();
  });

  it('unregister-command: warns when removing a built-in chat-commander-wfrp4e command', async () => {
    const cc = new FakeChatCommands();
    cc.register({ name: '/cond', module: 'chat-commander-wfrp4e' });
    setGame({ active: true, chatCommands: cc });
    const r = await dispatchModuleChatCommander({ action: 'unregister-command', name: '/cond', confirm: true });
    expect(r.success).toBe(true);
    expect((r as any).data.builtinWfrpWarning).toMatch(/re-registers on the next world reload/);
  });
});
