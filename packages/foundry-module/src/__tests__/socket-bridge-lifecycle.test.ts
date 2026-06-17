// socket-bridge-lifecycle.test.ts — MCP Code-Quality Hardening v1, Phase 10 (R10.1/R10.3).
//
// Two teardown guarantees for the socket surface:
//   (1) lifecycle.registerSocket pairs game.socket.on('module.warhammer-mcp', fn) with a socket.off on
//       teardownAll() — pre-Phase-10 the main.ts socket listener was never removed and survived reconnects.
//   (2) SocketBridge.disconnect() clears an already-pending reconnect timer (Risk 10.A teardown ordering)
//       → vi.getTimerCount() === 0, using the FakeWebSocket + fake-timers pattern (socket-bridge-reconnect.test.ts).

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../notify.js', () => ({
  notify: {
    lifecycle: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    created: vi.fn(),
    updated: vi.fn(),
    progress: vi.fn(() => ({ update: vi.fn(), done: vi.fn(), fail: vi.fn() })),
  },
}));
vi.mock('../mcp-activity.js', () => ({
  beginMcpActivity: vi.fn(),
  endMcpActivity: vi.fn(),
  setMcpRequestContext: vi.fn(),
}));

import * as lifecycle from '../utils/lifecycle.js';
import { SocketBridge, type BridgeConfig } from '../socket-bridge.js';

describe('lifecycle.registerSocket teardown (R10.1)', () => {
  let onSpy: ReturnType<typeof vi.fn>;
  let offSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSpy = vi.fn();
    offSpy = vi.fn();
    (globalThis as any).game = { socket: { on: onSpy, off: offSpy } };
  });

  afterEach(() => {
    lifecycle.teardownAll();
    delete (globalThis as any).game;
  });

  it('attaches the channel listener via game.socket.on', () => {
    const fn = (): void => {};
    lifecycle.registerSocket('socket-test', 'module.warhammer-mcp', fn);
    expect(onSpy).toHaveBeenCalledWith('module.warhammer-mcp', fn);
  });

  it('teardownAll() calls socket.off for the same channel + fn', () => {
    const fn = (): void => {};
    lifecycle.registerSocket('socket-test', 'module.warhammer-mcp', fn);
    expect(offSpy).not.toHaveBeenCalled();

    lifecycle.teardownAll();
    expect(offSpy).toHaveBeenCalledWith('module.warhammer-mcp', fn);
  });

  it('is a safe no-op when game.socket is absent', () => {
    (globalThis as any).game = {};
    expect(() => lifecycle.registerSocket('no-socket', 'ch', () => {})).not.toThrow();
    expect(() => lifecycle.teardownAll()).not.toThrow();
  });
});

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  url: string;
  onopen: (() => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  onclose: ((e: any) => void) | null = null;
  onmessage: ((e: any) => void) | null = null;
  closeCalls: Array<{ code?: number; reason?: string }> = [];
  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }
  close(code?: number, reason?: string): void {
    this.closeCalls.push({ code, reason });
  }
  send(_data: string): void {}
  static last(): FakeWebSocket {
    return FakeWebSocket.instances[FakeWebSocket.instances.length - 1]!;
  }
}

function makeConfig(overrides: Partial<BridgeConfig> = {}): BridgeConfig {
  return {
    enabled: true,
    serverHost: 'localhost',
    serverPort: 31415,
    namespace: '/test',
    reconnectAttempts: 5,
    reconnectDelay: 1000,
    connectionTimeout: 10,
    debugLogging: false,
    ...overrides,
  };
}

describe('SocketBridge reconnect timer cleared on disconnect (R10.1 / Risk 10.A)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeWebSocket.instances = [];
    (globalThis as any).WebSocket = FakeWebSocket;
    (globalThis as any).window = globalThis;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('disconnect() clears the pending reconnect timer → zero timers left', async () => {
    const bridge = new SocketBridge(makeConfig());
    const p = bridge.connect().catch(() => {});
    const ws = FakeWebSocket.last();

    // One failed connect schedules exactly one reconnect timer.
    ws.onerror?.({} as any);
    ws.onclose?.({ wasClean: false, reason: '' } as any);
    await p;
    expect(vi.getTimerCount()).toBe(1);

    // Teardown must cancel it — otherwise it fires after the world is gone.
    bridge.disconnect();
    expect(vi.getTimerCount()).toBe(0);
  });
});
