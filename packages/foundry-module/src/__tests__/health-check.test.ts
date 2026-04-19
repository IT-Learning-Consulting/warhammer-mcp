// health-check.test.ts — covers the 2-minute post-ready self-diagnostic.

import { describe, it, expect, beforeEach } from 'vitest';
import { runHealthCheck, captureInitError, getCapturedErrors, resetCapturedErrors } from '../health-check.js';

function setupGame({
  active = true,
  queryCount = 0,
  socketConnected = true,
  exposeBridge = true,
}: {
  active?: boolean;
  queryCount?: number;
  socketConnected?: boolean;
  exposeBridge?: boolean;
} = {}) {
  const queries: Record<string, () => void> = {};
  for (let i = 0; i < queryCount; i++) {
    queries[`warhammer-mcp.q${i}`] = () => {};
  }
  (globalThis as any).CONFIG = { queries };
  const modules = new Map<string, any>();
  modules.set('warhammer-mcp', { active });
  (globalThis as any).game = {
    ...(globalThis as any).game,
    modules,
  };
  if (exposeBridge) {
    (globalThis as any).foundryMCPBridge = {
      socketBridge: { isConnected: () => socketConnected },
    };
  } else {
    (globalThis as any).foundryMCPBridge = undefined;
  }
}

beforeEach(() => {
  resetCapturedErrors();
});

describe('runHealthCheck', () => {
  it('returns ok=true when module active, queries registered, socket connected', () => {
    setupGame({ active: true, queryCount: 50, socketConnected: true });
    const result = runHealthCheck();
    expect(result.ok).toBe(true);
    expect(result.moduleActive).toBe(true);
    expect(result.queryCount).toBe(50);
    expect(result.socketConnected).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('flags zero queries as a fail (init likely failed silently)', () => {
    setupGame({ active: true, queryCount: 0, socketConnected: true });
    const result = runHealthCheck();
    expect(result.ok).toBe(false);
    expect(result.queryCount).toBe(0);
    expect(result.issues.some(i => i.includes('zero queries'))).toBe(true);
  });

  it('flags query count below expected', () => {
    setupGame({ active: true, queryCount: 40, socketConnected: true });
    const result = runHealthCheck(50);
    expect(result.ok).toBe(false);
    expect(result.issues.some(i => i.includes('below expected 50'))).toBe(true);
  });

  it('flags socket-not-connected', () => {
    setupGame({ active: true, queryCount: 10, socketConnected: false });
    const result = runHealthCheck();
    expect(result.ok).toBe(false);
    expect(result.socketConnected).toBe(false);
    expect(result.issues.some(i => i.includes('socket'))).toBe(true);
  });

  it('flags missing socket-bridge accessor when bridge is not exposed', () => {
    setupGame({ active: true, queryCount: 10, exposeBridge: false });
    const result = runHealthCheck();
    expect(result.ok).toBe(false);
    expect(result.issues.some(i => i.includes('socket bridge accessor'))).toBe(true);
  });
});

describe('captureInitError', () => {
  it('records errors and runHealthCheck reports them', () => {
    setupGame({ active: true, queryCount: 50, socketConnected: true });
    captureInitError('settings-register', new Error('boom 1'));
    captureInitError('queryhandlers-register', new Error('boom 2'));
    expect(getCapturedErrors().length).toBe(2);
    const result = runHealthCheck();
    expect(result.ok).toBe(false);
    expect(result.initErrorCount).toBe(2);
    expect(result.issues.some(i => i.includes('2 init exception'))).toBe(true);
  });

  it('coerces non-Error throwables into Error instances', () => {
    captureInitError('synthetic', 'string thrown');
    const errs = getCapturedErrors();
    expect(errs.length).toBe(1);
    expect(errs[0].error).toBeInstanceOf(Error);
    expect(errs[0].error.message).toBe('string thrown');
  });
});
