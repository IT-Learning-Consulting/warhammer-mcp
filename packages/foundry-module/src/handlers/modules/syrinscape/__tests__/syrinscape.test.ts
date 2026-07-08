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
  it('needs no auth and reports not-playing for an id never played this session (BUG-465 tracking)', async () => {
    (globalThis as any).game = makeGame({ authToken: '' });
    // storage.isPlaying is stop-blind (always true) and is deliberately NO LONGER consulted.
    (globalThis as any).syrinscapeControl = { utils: {}, storage: { isPlaying: vi.fn(() => true) } };
    const res: any = await dispatchModuleSyrinscape({ action: 'is-playing', elementId: 'e:never' });
    expect(res.success).toBe(true);
    expect(res.data.playing).toBe(false);
  });
});

// ── BUG-465: stop is now verifiable + id-type coercion ───────────────────────────

describe('BUG-465 stop-verification + id-type', () => {
  it('set-mood -> is-playing true -> stop-mood -> is-playing false (was stuck true before)', async () => {
    (globalThis as any).game = makeGame({ authToken: 'tok' });
    (globalThis as any).syrinscapeControl = {
      utils: { playMood: vi.fn(async () => true), stopMood: vi.fn(async () => true), stopAll: vi.fn(async () => true) },
      storage: { isPlaying: vi.fn(() => true) }, // stop-blind; must NOT leak into is-playing
    };
    const id = 'bug465:1';
    await dispatchModuleSyrinscape({ action: 'stop-all' }); // clean slate (session-scoped tracking)

    expect((await dispatchModuleSyrinscape({ action: 'set-mood', id }) as any).success).toBe(true);
    expect((await dispatchModuleSyrinscape({ action: 'is-playing', elementId: id }) as any).data.playing).toBe(true);
    expect((await dispatchModuleSyrinscape({ action: 'stop-mood', id }) as any).success).toBe(true);
    expect((await dispatchModuleSyrinscape({ action: 'is-playing', elementId: id }) as any).data.playing).toBe(false);
  });

  it('list-soundsets coerces a numeric cache id to string', async () => {
    (globalThis as any).game = makeGame({ soundsetInfo: [{ id: 182405, name: 'pack', full_name: 'The Pack' }] });
    const res: any = await dispatchModuleSyrinscape({ action: 'list-soundsets' });
    expect(res.success).toBe(true);
    expect(res.data.soundsets[0].id).toBe('182405');
    expect(typeof res.data.soundsets[0].id).toBe('string');
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

// ── 7. BUG-464 (Wave 2): bounded list actions ───────────────────────────────────
// Warm-cache overflow was live-proven (53 KB/516 soundsets, 721 KB/4,571 moods —
// BUG-464 ledger body). Row shapes mirror the Phase-13C live cache capture already
// encoded in the handler interfaces (SoundsetInfoRow / BulkDataEntry), not invented.

describe('BUG-464 bounded lists', () => {
  function warmGame() {
    const soundsetInfo = Array.from({ length: 120 }, (_, i) => ({
      id: 1000 + i,
      name: `set-${i}`,
      full_name: `Soundset ${i}`,
    }));
    const bulkData: Record<string, any> = {};
    for (let i = 0; i < 300; i++) {
      bulkData[`m${i}`] = { id: 2000 + i, type: 'mood', name: `mood-${i}`, soundset: `set-${i % 3}` };
    }
    bulkData['el1'] = { id: 9999, type: 'element', name: 'not-a-mood', soundset: 'set-0' };
    return makeGame({ bulkData, soundsetInfo });
  }

  it('list-soundsets defaults to a bounded page with totalAvailable/truncated', async () => {
    (globalThis as any).game = warmGame();
    const res: any = await dispatchModuleSyrinscape({ action: 'list-soundsets' });
    expect(res.success).toBe(true);
    expect(res.data.soundsets.length).toBe(50);
    expect(res.data.totalAvailable).toBe(120);
    expect(res.data.truncated).toBe(true);
  });

  it('list-soundsets honors limit/offset + name filter', async () => {
    (globalThis as any).game = warmGame();
    const res: any = await dispatchModuleSyrinscape({ action: 'list-soundsets', filter: 'Soundset 11', limit: 5 });
    expect(res.success).toBe(true);
    // matches Soundset 11, 110..119
    expect(res.data.totalAvailable).toBe(11);
    expect(res.data.soundsets.length).toBe(5);
    expect(res.data.truncated).toBe(true);
  });

  it('list-moods unfiltered is bounded; soundsetName + filter still narrow', async () => {
    (globalThis as any).game = warmGame();
    const all: any = await dispatchModuleSyrinscape({ action: 'list-moods' });
    expect(all.success).toBe(true);
    expect(all.data.moods.length).toBe(50);
    expect(all.data.totalAvailable).toBe(300);
    expect(all.data.truncated).toBe(true);

    const narrowed: any = await dispatchModuleSyrinscape({ action: 'list-moods', soundsetName: 'set-1', filter: 'mood-10', limit: 10 });
    expect(narrowed.success).toBe(true);
    // set-1 moods are i%3===1; names mood-10x matching 'mood-10' → mood-10, mood-100..109 ∩ set-1
    expect(narrowed.data.moods.every((m: any) => m.soundset === 'set-1')).toBe(true);
    expect(narrowed.data.moods.every((m: any) => String(m.name).includes('mood-10'))).toBe(true);
  });
});
