// Module Integration v1 Phase 13A — vitest: module-css handler.
//
// Deterministic — no live Foundry. game.settings is an in-memory store so we can
// assert the DP-16 write→read-back verify, the sentinel normalisation, the GM gate,
// and the MODULE_NOT_ACTIVE guard without world churn.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dispatchModuleCss } from '../css.js';

const SENTINEL = '/* Custom CSS */';

// In-memory settings store keyed "<namespace>:<key>".
let store: Record<string, string>;
const applyStylesMock = vi.fn();
const socketEmitMock = vi.fn();

function mockGlobals(opts: { active?: boolean; isGM?: boolean } = {}) {
  const active = opts.active ?? true;
  const isGM = opts.isGM ?? true;
  store = {
    'custom-css:worldStylesheet': SENTINEL,
    'custom-css:userStylesheet': SENTINEL,
    'custom-css:stylesheet': SENTINEL,
  };
  (globalThis as any).game = {
    user: { isGM },
    modules: { get: (id: string) => (id === 'custom-css' ? { active } : null) },
    settings: {
      get: (ns: string, key: string) => store[`${ns}:${key}`],
      set: async (ns: string, key: string, value: string) => {
        store[`${ns}:${key}`] = value;
        return value;
      },
    },
    socket: { emit: socketEmitMock },
  };
  (globalThis as any).window = { CustomCss: { applyStyles: applyStylesMock } };
  (globalThis as any).ui = { notifications: { info: vi.fn(), success: vi.fn() } };
}

beforeEach(() => {
  mockGlobals();
  applyStylesMock.mockClear();
  socketEmitMock.mockClear();
});

afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).window;
  delete (globalThis as any).ui;
});

describe('module-css — guard', () => {
  it('returns MODULE_NOT_ACTIVE when custom-css is inactive', async () => {
    mockGlobals({ active: false });
    const res = await dispatchModuleCss({ action: 'get' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
  });
});

describe('module-css — get', () => {
  it('returns the world stylesheet and isEmpty=true at sentinel', async () => {
    const res = await dispatchModuleCss({ action: 'get' });
    expect(res.success).toBe(true);
    expect(res.data.worldStylesheet).toBe(SENTINEL);
    expect(res.data.isEmpty).toBe(true);
    expect(res.data.userStylesheet).toBeUndefined();
  });

  it('includes the GM user CSS only when requested', async () => {
    store['custom-css:userStylesheet'] = '.foo{color:red}';
    const res = await dispatchModuleCss({ action: 'get', includeUserStylesheet: true });
    expect(res.data.userStylesheet).toBe('.foo{color:red}');
    expect(res.data.userScopeCaveat).toContain('client-scoped');
  });
});

describe('module-css — set', () => {
  it('writes world CSS, verifies round-trip, re-injects + broadcasts', async () => {
    const css = '.grim-page{background:#e8dcc0}';
    const res = await dispatchModuleCss({ action: 'set', css });
    expect(res.success).toBe(true);
    expect(res.data.worldStylesheet).toBe(css);
    expect(store['custom-css:worldStylesheet']).toBe(css);
    expect(applyStylesMock).toHaveBeenCalled();
    expect(socketEmitMock).toHaveBeenCalledWith('module.custom-css');
  });

  it('normalises empty CSS to the sentinel', async () => {
    const res = await dispatchModuleCss({ action: 'set', css: '' });
    expect(res.data.worldStylesheet).toBe(SENTINEL);
  });

  it('is GM-gated', async () => {
    mockGlobals({ isGM: false });
    const res = await dispatchModuleCss({ action: 'set', css: '.x{}' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('GM_REQUIRED');
  });
});

describe('module-css — append', () => {
  it('concatenates onto the existing world CSS', async () => {
    await dispatchModuleCss({ action: 'set', css: '.a{}' });
    const res = await dispatchModuleCss({ action: 'append', css: '.b{}', separator: '\n' });
    expect(res.success).toBe(true);
    expect(res.data.worldStylesheet).toBe('.a{}\n.b{}');
    expect(res.data.appendedLength).toBe('.b{}'.length);
  });

  it('appends onto an empty (sentinel) sheet without leading separator', async () => {
    const res = await dispatchModuleCss({ action: 'append', css: '.b{}' });
    expect(res.data.worldStylesheet).toBe('.b{}');
  });
});

describe('module-css — reset', () => {
  it('writes the sentinel and broadcasts', async () => {
    await dispatchModuleCss({ action: 'set', css: '.a{}' });
    const res = await dispatchModuleCss({ action: 'reset' });
    expect(res.success).toBe(true);
    expect(res.data.worldStylesheet).toBe(SENTINEL);
    expect(res.data.reset).toBe(true);
    expect(store['custom-css:worldStylesheet']).toBe(SENTINEL);
    expect(socketEmitMock).toHaveBeenCalledWith('module.custom-css');
  });
});
