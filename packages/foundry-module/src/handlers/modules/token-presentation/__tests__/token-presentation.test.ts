// Module Integration v2 Phase 3B — Unit tests for module-token-presentation dispatcher + CCR-12.
//
// Deterministic: mocks globalThis.game (modules / user / actors / scenes / settings) + game.bossSplash —
// no live Foundry.
//
// Coverage (Rule 9 — each test encodes WHY CCR-12 / the guards matter):
//   1. get-bundle-status reachable with BOTH members inactive (availability map, NO refusal). WHY: the
//      pre-flight aid must work precisely when the member tools can't — that's its whole purpose.
//   2. boss-splash.show with boss-splash inactive → MODULE_NOT_ACTIVE naming 'boss-splash'. WHY: one
//      member being off must surface that member's name, not a generic bundle failure.
//   3. token-notes.write-note with token-notes inactive → MODULE_NOT_ACTIVE naming 'token-notes'. WHY:
//      CCR-12 — the two members fail independently; a token-notes call must not depend on boss-splash.
//   4. boss-splash.show with no identity → input error (avoids the canvas.tokens.controlled fallback).
//   5. boss-splash.show while currentOverlay is set → BOSS_SPLASH_ALREADY_ACTIVE. WHY: a double-splash
//      silently no-ops in the module — surfacing the token lets the caller close-then-reshow.
//   6. token-notes.write-note happy path verifies the flag persisted (DP-16 via verifyFlagWrite).

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { dispatchModuleTokenPresentation } from '../token-presentation.js';

const SCENE_ID = 'scene1';
const TOKEN_ID = 'tok1';
const ACTOR_ID = 'act1';

/** A doc (Token or Actor) whose flags.token-notes.* is backed by a mutable object update() writes to. */
function makeNoteDoc() {
  const flags: Record<string, any> = { 'token-notes': {} };
  return {
    flags,
    getFlag: (scope: string, key: string) => flags?.[scope]?.[key],
    update: async (delta: Record<string, unknown>) => {
      for (const [path, value] of Object.entries(delta)) {
        if (path.startsWith('flags.token-notes.')) {
          const key = path.slice('flags.token-notes.'.length);
          flags['token-notes'][key] = value;
        }
      }
    },
  };
}

function makeGame(opts: {
  bossSplashActive: boolean;
  tokenNotesActive: boolean;
  libWrapperActive?: boolean;
  isGM?: boolean;
  bossSplash?: any;
  tokenDoc?: any;
  actorDoc?: any;
}) {
  return {
    modules: {
      get: (id: string) => {
        if (id === 'boss-splash') return opts.bossSplashActive ? { active: true, title: 'Boss Splash', version: '1.2.1' } : undefined;
        if (id === 'token-notes') return opts.tokenNotesActive ? { active: true, title: 'Token Notes', version: '3.0.1' } : undefined;
        if (id === 'lib-wrapper') return (opts.libWrapperActive ?? true) ? { active: true } : { active: false };
        return undefined;
      },
    },
    user: { isGM: opts.isGM ?? true },
    bossSplash: opts.bossSplash,
    actors: { get: (id: string) => (id === ACTOR_ID ? opts.actorDoc : undefined) },
    scenes: { get: (id: string) => (id === SCENE_ID ? { tokens: { get: (t: string) => (t === TOKEN_ID ? opts.tokenDoc : undefined) } } : undefined) },
    settings: { get: () => 0, set: () => {} },
  };
}

beforeEach(() => {
  (globalThis as any).game = undefined;
  (globalThis as any).canvas = undefined;
  (globalThis as any).fromUuid = async () => null;
});
afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).canvas;
  delete (globalThis as any).fromUuid;
});

// ── 1. get-bundle-status reachable when both members inactive ────────────────────

describe('CCR-12 get-bundle-status (unguarded)', () => {
  it('reachable with BOTH members inactive — returns the availability map, no refusal', async () => {
    (globalThis as any).game = makeGame({ bossSplashActive: false, tokenNotesActive: false });
    const res: any = await dispatchModuleTokenPresentation({ action: 'get-bundle-status' });
    expect(res.success).toBe(true);
    expect(res.data.members).toHaveLength(2);
    const ids = res.data.members.map((m: any) => m.id).sort();
    expect(ids).toEqual(['boss-splash', 'token-notes']);
    expect(res.data.members.every((m: any) => m.active === false)).toBe(true);
  });
});

// ── 2 + 3. Per-member guard (CCR-12 independence) ───────────────────────────────

describe('CCR-12 per-member guard', () => {
  it('boss-splash.show with boss-splash inactive → MODULE_NOT_ACTIVE naming boss-splash', async () => {
    (globalThis as any).game = makeGame({ bossSplashActive: false, tokenNotesActive: true });
    const res: any = await dispatchModuleTokenPresentation({ action: 'boss-splash.show', actor: ACTOR_ID });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
    expect(res.error).toContain('boss-splash');
  });

  it('token-notes.write-note with token-notes inactive → MODULE_NOT_ACTIVE naming token-notes (independent of boss-splash)', async () => {
    (globalThis as any).game = makeGame({ bossSplashActive: true, tokenNotesActive: false });
    const res: any = await dispatchModuleTokenPresentation({
      action: 'token-notes.write-note',
      scope: 'actor',
      actorId: ACTOR_ID,
      text: 'hates the players',
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
    expect(res.error).toContain('token-notes');
  });
});

// ── 4 + 5. boss-splash input + already-active guards ────────────────────────────

describe('boss-splash guards', () => {
  it('boss-splash.show with no identity → input error (avoids the controlled-token fallback)', async () => {
    (globalThis as any).game = makeGame({
      bossSplashActive: true,
      tokenNotesActive: true,
      bossSplash: { currentOverlay: null, splashBoss: async () => {} },
    });
    const res: any = await dispatchModuleTokenPresentation({ action: 'boss-splash.show', subText: 'beware' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('TOKEN_PRESENTATION_INVALID_INPUT');
  });

  it('boss-splash.show while a splash is already up → BOSS_SPLASH_ALREADY_ACTIVE', async () => {
    (globalThis as any).game = makeGame({
      bossSplashActive: true,
      tokenNotesActive: true,
      bossSplash: { currentOverlay: { close: () => {} }, splashBoss: async () => {} },
    });
    const res: any = await dispatchModuleTokenPresentation({ action: 'boss-splash.show', actor: ACTOR_ID });
    expect(res.success).toBe(false);
    expect(res.error).toContain('BOSS_SPLASH_ALREADY_ACTIVE');
  });

  it('boss-splash.show happy path → overlayActive true (transient verify via currentOverlay)', async () => {
    let overlay: any = null;
    (globalThis as any).game = makeGame({
      bossSplashActive: true,
      tokenNotesActive: true,
      bossSplash: {
        get currentOverlay() { return overlay; },
        splashBoss: async () => { overlay = { close: () => {} }; },
      },
    });
    const res: any = await dispatchModuleTokenPresentation({ action: 'boss-splash.show', actor: ACTOR_ID, message: '{{actor.name}}' });
    expect(res.success).toBe(true);
    expect(res.data.overlayActive).toBe(true);
  });

  it('boss-splash.show settles a DEFERRED overlay assignment → overlayActive (no false NOT_PERSISTED)', async () => {
    // The real module assigns currentOverlay inside setTimeout(fn, animationDelay) (boss-splash.js:347-349),
    // so it lands on a macrotask AFTER splashBoss() resolves. The immediate check raced it — live-audit
    // 2026-06-25 returned TOKEN_PRESENTATION_NOT_PERSISTED for a splash that WAS about to render.
    let overlay: any = null;
    (globalThis as any).game = makeGame({
      bossSplashActive: true,
      tokenNotesActive: true,
      bossSplash: {
        get currentOverlay() { return overlay; },
        splashBoss: async () => { setTimeout(() => { overlay = { close: () => {} }; }, 25); },
      },
    });
    const res: any = await dispatchModuleTokenPresentation({ action: 'boss-splash.show', actor: ACTOR_ID });
    expect(res.success).toBe(true);
    expect(res.data.overlayActive).toBe(true);
  });

  it('boss-splash.close settles the async overlay teardown → closed (no false still-active)', async () => {
    // overlay.close() is async — currentOverlay nulls on a later tick (boss-splash.js:357/473).
    let overlay: any = { close: () => {} };
    (globalThis as any).game = makeGame({
      bossSplashActive: true,
      tokenNotesActive: true,
      bossSplash: {
        get currentOverlay() { return overlay; },
        splashBoss: async (o: any) => { if (o?.close) setTimeout(() => { overlay = null; }, 25); },
      },
    });
    const res: any = await dispatchModuleTokenPresentation({ action: 'boss-splash.close' });
    expect(res.success).toBe(true);
    expect(res.data.closed).toBe(true);
  });
});

// ── 6. token-notes write-note DP-16 ─────────────────────────────────────────────

describe('token-notes write-note DP-16', () => {
  it('actor-scope write persists the note flag (verifyFlagWrite passes)', async () => {
    const actorDoc = makeNoteDoc();
    (globalThis as any).game = makeGame({ bossSplashActive: false, tokenNotesActive: true, actorDoc });
    const res: any = await dispatchModuleTokenPresentation({
      action: 'token-notes.write-note',
      scope: 'actor',
      actorId: ACTOR_ID,
      text: 'hates the players',
    });
    expect(res.success).toBe(true);
    expect(res.data.text).toBe('hates the players');
    expect(actorDoc.getFlag('token-notes', 'notes')).toBe('hates the players');
  });

  it('token-scope write persists on the TokenDocument and reads back', async () => {
    const tokenDoc = makeNoteDoc();
    (globalThis as any).game = makeGame({ bossSplashActive: false, tokenNotesActive: true, tokenDoc });
    const write: any = await dispatchModuleTokenPresentation({
      action: 'token-notes.write-note',
      scope: 'token',
      sceneId: SCENE_ID,
      tokenId: TOKEN_ID,
      text: 'wounded — limping',
    });
    expect(write.success).toBe(true);
    const read: any = await dispatchModuleTokenPresentation({
      action: 'token-notes.read-note',
      scope: 'token',
      sceneId: SCENE_ID,
      tokenId: TOKEN_ID,
    });
    expect(read.success).toBe(true);
    expect(read.data.text).toBe('wounded — limping');
  });
});
