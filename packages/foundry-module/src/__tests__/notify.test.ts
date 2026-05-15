// Unit tests for src/notify.ts — covers each method × each channel.
// See plan: .agents/plans/features/gm-feedback-channel-notify.md Phase 2.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { notify } from '../notify.js';

// ----------------------------------------------------------------------------
// Mocks — extend the globals from src/__tests__/setup.ts for notify's surface.
// ----------------------------------------------------------------------------

type SettingMap = Record<string, unknown>;

function setupSettings(map: SettingMap): void {
  (globalThis as any).game.settings.get = (_m: string, key: string) => {
    return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : undefined;
  };
}

function setupGMUsers(): void {
  (globalThis as any).game.users = [
    { id: 'gm-1', isGM: true },
    { id: 'gm-2', isGM: true },
    { id: 'player-1', isGM: false },
  ];
}

function setupNotificationsMock() {
  const info = vi.fn().mockReturnValue({ remove: vi.fn(), update: vi.fn() });
  const warn = vi.fn().mockReturnValue({ remove: vi.fn(), update: vi.fn() });
  const error = vi.fn().mockReturnValue({ remove: vi.fn(), update: vi.fn() });
  const success = vi.fn().mockReturnValue({ remove: vi.fn(), update: vi.fn() });
  (globalThis as any).ui.notifications = { info, warn, error, success };
  return { info, warn, error, success };
}

function setupChatMessageMock(reject = false) {
  const create = vi.fn().mockImplementation(() => {
    return reject ? Promise.reject(new Error('permission denied')) : Promise.resolve({});
  });
  (globalThis as any).ChatMessage = { create };
  return create;
}

function setupTooltipMock() {
  const createLockedTooltip = vi.fn().mockReturnValue({ id: 'tooltip-el' });
  const dismissLockedTooltip = vi.fn();
  (globalThis as any).game.tooltip = { createLockedTooltip, dismissLockedTooltip };
  return { createLockedTooltip, dismissLockedTooltip };
}

function setupHooksMock() {
  const callAll = vi.fn();
  (globalThis as any).Hooks.callAll = callAll;
  return callAll;
}

function setupVerboseLocalStorage(value: '1' | null = null) {
  const store: Record<string, string> = value === '1' ? { warhammer_mcp_verbose: '1' } : {};
  (globalThis as any).window = {
    localStorage: {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
    },
  };
}

describe('notify', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleGroupCollapsedSpy: ReturnType<typeof vi.spyOn>;
  let consoleGroupEndSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Default: notifications enabled, audit-to-chat OFF, verbose OFF.
    setupSettings({
      enableNotifications: true,
      auditWritesToChat: false,
      mcpVerboseConsole: false,
    });
    setupGMUsers();
    setupVerboseLocalStorage(null);
    (globalThis as any).game.modules = { get: () => undefined };
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleGroupCollapsedSpy = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('created → success toast + styled console + no chat (default settings)', () => {
    const notifications = setupNotificationsMock();
    const chat = setupChatMessageMock();
    setupTooltipMock();
    setupHooksMock();

    notify.created('actor', 'Grimgor');

    expect(notifications.success).toHaveBeenCalledTimes(1);
    const [msg, opts] = notifications.success.mock.calls[0];
    expect(msg).toContain('[CREATE]');
    expect(msg).toContain('actor: Grimgor');
    expect(opts).toMatchObject({ permanent: false });
    expect(chat).not.toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalled();
    // First arg of console.log carries the %c format string
    const consoleCallArgs = consoleLogSpy.mock.calls[0];
    expect(consoleCallArgs[0]).toContain('%c');
    expect(consoleCallArgs[0]).toContain('CREATE');
  });

  it('created with {chat: true} → chat whisper fires with gm ids', () => {
    setupNotificationsMock();
    const chat = setupChatMessageMock();
    setupTooltipMock();
    setupHooksMock();

    notify.created('actor', 'Grimgor', { chat: true });

    expect(chat).toHaveBeenCalledTimes(1);
    const payload = chat.mock.calls[0][0];
    expect(payload.whisper).toEqual(['gm-1', 'gm-2']);
    expect(payload.style).toBe(0);
    expect(payload.content).toContain('mcp-audit-created');
    expect(payload.content).toContain('CREATE');
  });

  it('error → sticky toast + chat + stack logged', () => {
    const notifications = setupNotificationsMock();
    const chat = setupChatMessageMock();
    setupTooltipMock();
    setupHooksMock();

    const err = new Error('boom');
    err.stack = 'fake-stack-trace';
    notify.error('Operation failed', err);

    expect(notifications.error).toHaveBeenCalledTimes(1);
    const [, opts] = notifications.error.mock.calls[0];
    expect(opts).toMatchObject({ permanent: true });
    expect(chat).toHaveBeenCalledTimes(1);
    // Stack should appear in a console.log call after the styled line
    const stackLogged = consoleLogSpy.mock.calls.some((args) =>
      args.some((a: any) => typeof a === 'string' && a.includes('fake-stack-trace')),
    );
    expect(stackLogged).toBe(true);
  });

  it('lifecycle → sticky toast + chat regardless of setting', () => {
    const notifications = setupNotificationsMock();
    const chat = setupChatMessageMock();
    setupTooltipMock();
    setupHooksMock();

    notify.lifecycle('connection-up', 'MCP connected');

    expect(notifications.info).toHaveBeenCalledTimes(1);
    const [, opts] = notifications.info.mock.calls[0];
    expect(opts).toMatchObject({ permanent: true });
    expect(chat).toHaveBeenCalledTimes(1);
  });

  it('updated with {tooltip: {tokenDoc}} → tooltip fires near token', () => {
    setupNotificationsMock();
    setupChatMessageMock();
    const tip = setupTooltipMock();
    setupHooksMock();

    const tokenDoc = { object: { x: 100, y: 200, width: 80 } };
    notify.updated('actor', 'Grimgor', { tooltip: { tokenDoc, message: '5 damage' } });

    expect(tip.createLockedTooltip).toHaveBeenCalledTimes(1);
    const [position, text, opts] = tip.createLockedTooltip.mock.calls[0];
    expect(position).toEqual({ top: 170, left: 140 }); // y-30, x+width/2
    expect(text).toBe('5 damage');
    expect(opts).toMatchObject({ cssClass: 'mcp-tooltip mcp-tooltip-updated' });
  });

  it('verbose mode (localStorage) → console.groupCollapsed opens with payload', () => {
    setupVerboseLocalStorage('1');
    setupNotificationsMock();
    setupChatMessageMock();
    setupTooltipMock();
    setupHooksMock();

    notify.created('actor', 'Grimgor', { uuid: 'Actor.abc', durationMs: 42 });

    expect(consoleGroupCollapsedSpy).toHaveBeenCalledTimes(1);
    expect(consoleGroupEndSpy).toHaveBeenCalledTimes(1);
    // UUID + duration logged inside the group
    const uuidLogged = consoleLogSpy.mock.calls.some((args) =>
      args.some((a: any) => a === 'Actor.abc'),
    );
    expect(uuidLogged).toBe(true);
    const durationLogged = consoleLogSpy.mock.calls.some((args) =>
      args.some((a: any) => typeof a === 'string' && a.includes('42ms')),
    );
    expect(durationLogged).toBe(true);
  });

  it('enableNotifications off → no toast but console still fires', () => {
    setupSettings({ enableNotifications: false, auditWritesToChat: false, mcpVerboseConsole: false });
    const notifications = setupNotificationsMock();
    setupChatMessageMock();
    setupTooltipMock();
    setupHooksMock();

    notify.created('actor', 'Grimgor');

    expect(notifications.success).not.toHaveBeenCalled();
    expect(notifications.info).not.toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalled();
  });

  it('ChatMessage.create rejection is caught — caller never throws', async () => {
    setupNotificationsMock();
    setupChatMessageMock(true);
    setupTooltipMock();
    setupHooksMock();

    expect(() => notify.error('boom')).not.toThrow();
    // Let the rejection microtask settle
    await new Promise((r) => setTimeout(r, 10));
    const chatRejectionLogged = consoleErrorSpy.mock.calls.some((args) =>
      args.some((a: any) => typeof a === 'string' && a.includes('ChatMessage.create rejected')),
    );
    expect(chatRejectionLogged).toBe(true);
  });

  it('deleted → warn-level toast with DELETE tag', () => {
    const notifications = setupNotificationsMock();
    setupChatMessageMock();
    setupTooltipMock();
    setupHooksMock();

    notify.deleted('item', 'Sword of Pointy');

    expect(notifications.warn).toHaveBeenCalledTimes(1);
    const [msg] = notifications.warn.mock.calls[0];
    expect(msg).toContain('[DELETE]');
    expect(msg).toContain('item: Sword of Pointy');
  });

  it('warn → no chat by default (severity not error/lifecycle, setting off)', () => {
    setupNotificationsMock();
    const chat = setupChatMessageMock();
    setupTooltipMock();
    setupHooksMock();

    notify.warn('Heads up');

    expect(chat).not.toHaveBeenCalled();
  });

  it('info → no chat, no tooltip, ephemeral toast', () => {
    const notifications = setupNotificationsMock();
    const chat = setupChatMessageMock();
    const tip = setupTooltipMock();
    setupHooksMock();

    notify.info('Just FYI');

    expect(notifications.info).toHaveBeenCalledTimes(1);
    const [, opts] = notifications.info.mock.calls[0];
    expect(opts).toMatchObject({ permanent: false });
    expect(chat).not.toHaveBeenCalled();
    expect(tip.createLockedTooltip).not.toHaveBeenCalled();
  });

  it('Hooks.callAll fires `warhammer-mcp:notify` on every call', () => {
    setupNotificationsMock();
    setupChatMessageMock();
    setupTooltipMock();
    const hooks = setupHooksMock();

    notify.created('actor', 'Grimgor');
    notify.updated('item', 'Sword');
    notify.deleted('scene', 'Old Tavern');

    expect(hooks).toHaveBeenCalledTimes(3);
    expect(hooks.mock.calls[0][0]).toBe('warhammer-mcp:notify');
    expect(hooks.mock.calls[0][1]).toMatchObject({ severity: 'created', kind: 'actor' });
    expect(hooks.mock.calls[1][1]).toMatchObject({ severity: 'updated', kind: 'item' });
    expect(hooks.mock.calls[2][1]).toMatchObject({ severity: 'deleted', kind: 'scene' });
  });

  it('auditWritesToChat ON → routine writes also go to chat', () => {
    setupSettings({ enableNotifications: true, auditWritesToChat: true, mcpVerboseConsole: false });
    setupNotificationsMock();
    const chat = setupChatMessageMock();
    setupTooltipMock();
    setupHooksMock();

    notify.created('actor', 'Grimgor');
    notify.updated('item', 'Sword');

    expect(chat).toHaveBeenCalledTimes(2);
  });

  it('progress returns handle with update / done / fail', () => {
    const notifications = setupNotificationsMock();
    setupChatMessageMock();
    setupTooltipMock();
    setupHooksMock();

    const handle = notify.progress('Building index');

    expect(typeof handle.update).toBe('function');
    expect(typeof handle.done).toBe('function');
    expect(typeof handle.fail).toBe('function');
    expect(notifications.info).toHaveBeenCalledWith(
      'Building index',
      expect.objectContaining({ permanent: true, progress: true }),
    );

    handle.update(0.5, 'halfway');
    handle.done('Index built');
    // Final done emits a 'created' severity dispatch — success toast fires
    expect(notifications.success).toHaveBeenCalled();
  });
});
