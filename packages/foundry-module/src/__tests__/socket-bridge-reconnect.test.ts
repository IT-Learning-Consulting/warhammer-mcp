// BUG-281/282/283/285 regression tests for SocketBridge reconnect scheduling.
//
// Verifies:
//   1. One failed connect (onerror + onclose firing for the same failure)
//      schedules exactly one reconnect and increments the counter once.
//   2. The connect-timeout path (timeout + late onclose) also schedules once.
//   3. disconnect() suppresses reconnects from late unclean onclose events.
//   4. disconnect() resets reconnectAttempts (no stale 30s back-off on restart).
//   5. Events from a stale (replaced) socket are ignored during restart races.

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

import { SocketBridge, type BridgeConfig } from '../socket-bridge.js';

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
  close(code?: number, reason?: string) {
    this.closeCalls.push({ code, reason });
  }
  send(_data: string) {}
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

describe('SocketBridge reconnect scheduling (BUG-281/282/283/285)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeWebSocket.instances = [];
    (globalThis as any).WebSocket = FakeWebSocket;
    (globalThis as any).window = globalThis;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('schedules exactly one reconnect when onerror and onclose both fire for one failure (BUG-281)', async () => {
    const bridge = new SocketBridge(makeConfig());
    const p = bridge.connect().catch(() => {});
    const ws = FakeWebSocket.last();

    ws.onerror?.({} as any);
    ws.onclose?.({ wasClean: false, reason: '' } as any);
    await p;

    expect(bridge.getConnectionInfo().reconnectAttempts).toBe(1);
    expect(vi.getTimerCount()).toBe(1); // single pending reconnect timer
  });

  it('connect-timeout plus late unclean onclose schedules exactly once (BUG-281/BUG-094)', async () => {
    const bridge = new SocketBridge(makeConfig({ connectionTimeout: 10 }));
    const p = bridge.connect().catch(() => {});
    const ws = FakeWebSocket.last();

    // No events arrive; the 10s connect timeout fires and schedules attempt 1.
    vi.advanceTimersByTime(10_000);
    await p;
    expect(ws.closeCalls.length).toBe(1); // defensive close from the timeout path
    expect(bridge.getConnectionInfo().reconnectAttempts).toBe(1);
    const timersAfterTimeout = vi.getTimerCount();

    // The defensive close() completes asynchronously with wasClean=false.
    ws.onclose?.({ wasClean: false, reason: '' } as any);
    expect(bridge.getConnectionInfo().reconnectAttempts).toBe(1); // not double-counted
    expect(vi.getTimerCount()).toBe(timersAfterTimeout); // no extra timer
  });

  it('disconnect() suppresses reconnects from a late unclean onclose (BUG-283)', async () => {
    const bridge = new SocketBridge(makeConfig());
    const p = bridge.connect().catch(() => {});
    const ws = FakeWebSocket.last();
    ws.onopen?.();
    await p;
    expect(bridge.isConnected()).toBe(true);

    bridge.disconnect();
    // Server unreachable at stop() time → the close handshake is not clean.
    ws.onclose?.({ wasClean: false, reason: 'server gone' } as any);

    expect(vi.getTimerCount()).toBe(0);
    expect(bridge.getConnectionState()).toBe('disconnected');
  });

  it('disconnect() resets reconnectAttempts so a fresh start backs off from 1s (BUG-285)', async () => {
    const bridge = new SocketBridge(makeConfig());
    const p = bridge.connect().catch(() => {});
    FakeWebSocket.last().onerror?.({} as any);
    await p;
    expect(bridge.getConnectionInfo().reconnectAttempts).toBe(1);

    bridge.disconnect();
    expect(bridge.getConnectionInfo().reconnectAttempts).toBe(0);
  });

  it('ignores events from a stale socket replaced during a restart race (BUG-283)', async () => {
    const bridge = new SocketBridge(makeConfig());
    const p = bridge.connect().catch(() => {});
    const ws1 = FakeWebSocket.last();
    ws1.onerror?.({} as any); // schedules reconnect attempt 1 (1s delay)
    await p;

    // The reconnect timer fires and a second socket starts connecting.
    await vi.advanceTimersByTimeAsync(1_000);
    const ws2 = FakeWebSocket.last();
    expect(ws2).not.toBe(ws1);
    expect(bridge.getConnectionState()).toBe('connecting');

    // The stale socket's close arrives late — it must not touch state or
    // schedule anything on top of the in-flight connect.
    ws1.onclose?.({ wasClean: false, reason: '' } as any);
    expect(bridge.getConnectionState()).toBe('connecting');
    expect(bridge.getConnectionInfo().reconnectAttempts).toBe(1);

    // The in-flight socket succeeding resets the counter.
    ws2.onopen?.();
    expect(bridge.isConnected()).toBe(true);
    expect(bridge.getConnectionInfo().reconnectAttempts).toBe(0);
  });
});
