// Module Integration v2 Phase 13C — Unit tests for module-syrinscape dispatcher + guards.
//
// Deterministic: mocks globalThis.game (modules/user/settings) and globalThis.syrinscapeControl (utils/storage)
// — no live Foundry, no network.
//
// Coverage (Rule 9 — each test encodes WHY the behavior matters):
//   1. Inactive syrinscape-control -> MODULE_NOT_ACTIVE.
//   2. A play action fired by a non-GM -> SYRINSCAPE_ACCESS_DENIED.
//   3. A play action with a blank authToken -> SYRINSCAPE_AUTH_MISSING BEFORE calling utils.* — proves the
//      proactive pre-check fires instead of letting the module's own swallowed-`false` degrade path mask it.
//   4. is-playing needs no auth (pure storage read) — proves list/read actions aren't gated by authToken.
//   5. cold-cache list-soundsets/list-moods return {items:[], hint} on {}/[] settings, never throw, never call
//      REST — proves the handler never falls back to sound.* (which needs auth and can throw pre-null-check).
//   6. direct-call dispatch: set-mood invokes globalThis.syrinscapeControl.utils.playMood(id) directly (no
//      macro bridge) — a `false` return maps to SYRINSCAPE_PLAYBACK_REJECTED, not a silent success.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../../../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

import { dispatchModuleSyrinscape } from '../syrinscape.js';

const MODULE_ID = 'syrinscape-control';

function makeGame(opts: { isGM?: boolean; authToken?: string; bulkData?: any; soundsetInfo?: any } = {}) {
  const settingsStore: Record<string, any> = {
    authToken: opts.authToken ?? '',
    bulkData: opts.bulkData ?? {},
    soundsetInfo: opts.soundsetInfo ?? [],
  };
  return {
    modules: { get: (id: string) => (id === MODULE_ID ? { active: true } : undefined) },
    user: { isGM: opts.isGM ?? true },
    settings: { get: vi.fn((_scope: string, key: string) => settingsStore[key]) },
  };
}

afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).syrinscapeControl;
});

// ── 1. Inactive module guard ────────────────────────────────────────────────────

describe('module-active guard', () => {
  it('inactive syrinscape-control -> MODULE_NOT_ACTIVE', async () => {
    (globalThis as any).game = { modules: { get: () => undefined } };
    const res: any = await dispatchModuleSyrinscape({ action: 'stop-all' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
  });
});

// ── 2. GM gate ──────────────────────────────────────────────────────────────────

describe('GM gate', () => {
  it('a play action fired by a non-GM -> SYRINSCAPE_ACCESS_DENIED', async () => {
    (globalThis as any).game = makeGame({ isGM: false, authToken: 'tok' });
    const res: any = await dispatchModuleSyrinscape({ action: 'set-mood', id: 'm:1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('SYRINSCAPE_ACCESS_DENIED');
  });
});

// ── 3. Auth-missing pre-check (never reaches utils.*) ────────────────────────────

describe('auth-missing pre-check', () => {
  it('a blank authToken -> SYRINSCAPE_AUTH_MISSING, utils.playMood never called', async () => {
    (globalThis as any).game = makeGame({ authToken: '' });
    const playMood = vi.fn();
    (globalThis as any).syrinscapeControl = { utils: { playMood }, storage: { isPlaying: vi.fn() } };
    const res: any = await dispatchModuleSyrinscape({ action: 'set-mood', id: 'm:1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('SYRINSCAPE_AUTH_MISSING');
    expect(playMood).not.toHaveBeenCalled();
  });
});

// ── 4. is-playing needs no auth ──────────────────────────────────────────────────

describe('is-playing', () => {
  it('reads storage.isPlaying without requiring an authToken', async () => {
    (globalThis as any).game = makeGame({ authToken: '' });
    (globalThis as any).syrinscapeControl = { utils: {}, storage: { isPlaying: vi.fn(() => true) } };
    const res: any = await dispatchModuleSyrinscape({ action: 'is-playing', elementId: 'e:5' });
    expect(res.success).toBe(true);
    expect(res.data.playing).toBe(true);
  });
});

// ── 5. cold-cache list actions ────────────────────────────────────────────────────

describe('cold-cache list actions', () => {
  it('list-soundsets on {} bulkData / [] soundsetInfo returns empty + hint, never throws', async () => {
    (globalThis as any).game = makeGame();
    const res: any = await dispatchModuleSyrinscape({ action: 'list-soundsets' });
    expect(res.success).toBe(true);
    expect(res.data.soundsets).toEqual([]);
    expect(res.data.hint).toContain('cache empty');
  });

  it('list-moods on a cold cache returns empty + hint, never calls sound.* REST', async () => {
    (globalThis as any).game = makeGame();
    const soundRest = { bulkData: vi.fn(), listSoundSets: vi.fn(), moods: vi.fn(), elements: vi.fn() };
    (globalThis as any).syrinscapeControl = { utils: {}, storage: {}, sound: soundRest };
    const res: any = await dispatchModuleSyrinscape({ action: 'list-moods' });
    expect(res.success).toBe(true);
    expect(res.data.moods).toEqual([]);
    Object.values(soundRest).forEach((fn) => expect(fn).not.toHaveBeenCalled());
  });

  it('a populated cache returns joined soundset full_name labels', async () => {
    (globalThis as any).game = makeGame({
      bulkData: { 'm:1': { id: 'm:1', type: 'mood', name: 'Thunder', soundset: 'storm-pack' } },
      soundsetInfo: [{ id: 's1', name: 'storm-pack', full_name: 'Storm Sound Pack' }],
    });
    const res: any = await dispatchModuleSyrinscape({ action: 'list-moods' });
    expect(res.success).toBe(true);
    expect(res.data.moods[0].soundsetFullName).toBe('Storm Sound Pack');
  });
});

// ── 6. direct-call dispatch + playback-rejected mapping ──────────────────────────

describe('direct-call dispatch', () => {
  it('set-mood calls globalThis.syrinscapeControl.utils.playMood(id) directly', async () => {
    (globalThis as any).game = makeGame({ authToken: 'tok' });
    const playMood = vi.fn(async () => true);
    (globalThis as any).syrinscapeControl = { utils: { playMood }, storage: {} };
    const res: any = await dispatchModuleSyrinscape({ action: 'set-mood', id: 'm:1' });
    expect(res.success).toBe(true);
    expect(playMood).toHaveBeenCalledWith('m:1');
  });

  it('a `false` return from playMood -> SYRINSCAPE_PLAYBACK_REJECTED, not a silent success', async () => {
    (globalThis as any).game = makeGame({ authToken: 'tok' });
    (globalThis as any).syrinscapeControl = { utils: { playMood: vi.fn(async () => false) }, storage: {} };
    const res: any = await dispatchModuleSyrinscape({ action: 'set-mood', id: 'm:garbage' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('SYRINSCAPE_PLAYBACK_REJECTED');
  });
});
