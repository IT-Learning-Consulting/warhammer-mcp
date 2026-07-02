// Module Integration v2 Phase 4 — Unit tests for module-perceptive dispatcher + guards.
//
// Deterministic: mocks globalThis.game.modules / game.user / game.scenes / game.Perceptive and the
// per-scene token/wall collections — no live Foundry, no canvas render.
//
// Coverage (Rule 9 — each test encodes WHY the behavior matters):
//   1. Inactive perceptive → MODULE_NOT_ACTIVE for every WRITE action (guard returns, never throws).
//      WHY: a tool fired in a world without perceptive must fail with the typed token, not a crash.
//   2. wfrp-stealth-delegate FAILS OPEN when inactive — returns success applied:false, NOT the guard
//      error (CCR-9). WHY: the WFRP host stealth flow must never be blocked by perceptive's absence.
//   3. set-stealth issues a RAW awaited doc.update with the PerceptiveStealthingFlag payload, and the
//      immediate read-back PASSes (NO settle needed — raw await is immediate-consistent). WHY: this is
//      the deliberate contrast with the Phase-3 fire-and-forget settle-race; a raw write we await is safe.
//   4. NO handler path constructs/opens a Dialog (HC-v2-6). WHY: a Dialog deadlocks the MCP socket; the
//      door path must use the GM-direct PlayerID bypass, never a confirm dialog.
//   5. set-stealth where the flag never lands → PERCEPTIVE_NOT_PERSISTED (DP-16 catches a silent drop).
//   6. discriminatedUnion rejects an unknown action → PERCEPTIVE_INVALID_INPUT.
//   7. wfrp-stealth-delegate when ACTIVE writes PPDCFlag=APDCFlag=sl (raw write) and verifies.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { dispatchModulePerceptive } from '../perceptive.js';

const SCENE_ID = 'scene1';
const TOK_ID = 'tok1';
const SPOTTER_ID = 'tok2';

/** A TokenDocument whose perceptive flags are backed by a mutable map; update() merges into it. */
function makeTokenDoc(id: string, name: string, flags: Record<string, unknown>) {
  const doc: any = {
    id,
    name,
    getFlag: (scope: string, key: string) => (scope === 'perceptive' ? flags[key] : undefined),
    update: vi.fn(async (data: any, _ctx?: any) => {
      const incoming = data?.flags?.perceptive ?? {};
      Object.assign(flags, incoming);
      return doc;
    }),
  };
  return doc;
}

function makeScene(tokens: any[], walls: any[] = []) {
  const tokenList = tokens;
  return {
    id: SCENE_ID,
    tokens: {
      get: (id: string) => tokenList.find((t) => t.id === id),
      contents: tokenList,
    },
    walls: { get: (id: string) => walls.find((w) => w.id === id) },
  };
}

function makeGame(opts: {
  active: boolean;
  isGM?: boolean;
  scene?: any;
  api?: any;
  perceptive?: any;
}) {
  return {
    modules: {
      get: (id: string) =>
        id === 'perceptive'
          ? opts.active
            ? { active: true, title: 'Perceptive', version: '6.0.4', api: opts.api }
            : undefined
          : undefined,
    },
    user: { isGM: opts.isGM ?? true, id: 'gm1' },
    scenes: { get: (id: string) => (id === SCENE_ID ? opts.scene : undefined) },
    Perceptive: opts.perceptive,
  };
}

beforeEach(() => {
  (globalThis as any).game = undefined;
  (globalThis as any).canvas = undefined;
});
afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).canvas;
});

// ── 1. Inactive module guard ────────────────────────────────────────────────────

describe('module-active guard', () => {
  it('inactive perceptive → MODULE_NOT_ACTIVE on a write action (returns, never throws)', async () => {
    (globalThis as any).game = makeGame({ active: false });
    const res: any = await dispatchModulePerceptive({ action: 'set-stealth', tokenId: TOK_ID, sceneId: SCENE_ID, stealthing: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
    expect(res.error).toContain('perceptive');
  });

  it('inactive perceptive → MODULE_NOT_ACTIVE on get-state too', async () => {
    (globalThis as any).game = makeGame({ active: false });
    const res: any = await dispatchModulePerceptive({ action: 'get-state', tokenId: TOK_ID, sceneId: SCENE_ID });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
  });
});

// ── 2. wfrp-stealth-delegate fail-open (CCR-9) ──────────────────────────────────

describe('wfrp-stealth-delegate fail-open', () => {
  it('inactive perceptive → soft success (applied:false), NOT the MODULE_NOT_ACTIVE guard error', async () => {
    (globalThis as any).game = makeGame({ active: false });
    const res: any = await dispatchModulePerceptive({ action: 'wfrp-stealth-delegate', tokenName: 'Thief', sl: 3 });
    expect(res.success).toBe(true);
    expect(res.data.applied).toBe(false);
    expect(res.data.moduleActive).toBe(false);
    expect(res.data.sl).toBe(3);
    expect(String(res.error ?? '')).not.toContain('MODULE_NOT_ACTIVE');
  });

  it('active perceptive → writes PPDCFlag=APDCFlag=sl via a raw awaited update + verifies', async () => {
    const flags: Record<string, unknown> = {};
    const tok = makeTokenDoc(TOK_ID, 'Thief', flags);
    const scene = makeScene([tok]);
    (globalThis as any).game = makeGame({ active: true, scene });
    const res: any = await dispatchModulePerceptive({ action: 'wfrp-stealth-delegate', tokenId: TOK_ID, sceneId: SCENE_ID, sl: 4 });
    expect(res.success).toBe(true);
    expect(res.data.applied).toBe(true);
    expect(flags.PPDCFlag).toBe(4);
    expect(flags.APDCFlag).toBe(4);
    expect(tok.update).toHaveBeenCalledTimes(1);
  });
});

// ── 3. set-stealth raw awaited write — immediate-consistent (no settle) ──────────

describe('set-stealth raw awaited write', () => {
  it('writes PerceptiveStealthingFlag via doc.update({PerceptiveVisionupdate:true}) and the read-back PASSes immediately', async () => {
    const flags: Record<string, unknown> = {};
    const tok = makeTokenDoc(TOK_ID, 'Sneak', flags);
    const scene = makeScene([tok]);
    (globalThis as any).game = makeGame({ active: true, scene });
    const res: any = await dispatchModulePerceptive({ action: 'set-stealth', tokenId: TOK_ID, sceneId: SCENE_ID, stealthing: true });
    expect(res.success).toBe(true);
    expect(res.data.stealthing).toBe(true);
    // The write context carries PerceptiveVisionupdate:true (mirrors PerceptiveFlags.#setPerceptiveStealthing).
    const ctxArg = tok.update.mock.calls[0][1];
    expect(ctxArg).toMatchObject({ PerceptiveVisionupdate: true });
    expect(flags.PerceptiveStealthingFlag).toBe(true);
  });

  it('silent drop (update is a no-op) → PERCEPTIVE_NOT_PERSISTED (DP-16 catches it)', async () => {
    const flags: Record<string, unknown> = {};
    const tok: any = {
      id: TOK_ID,
      name: 'Sneak',
      getFlag: (_s: string, _k: string) => undefined, // flag never lands
      update: vi.fn(async () => tok), // no-op write
    };
    const scene = makeScene([tok]);
    (globalThis as any).game = makeGame({ active: true, scene });
    const res: any = await dispatchModulePerceptive({ action: 'set-stealth', tokenId: TOK_ID, sceneId: SCENE_ID, stealthing: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('PERCEPTIVE_NOT_PERSISTED');
  });
});

// ── 4. HC-v2-6 — no Dialog is ever constructed/opened ───────────────────────────

describe('HC-v2-6 dialog-not-exposed', () => {
  it('a full token-action sweep never touches a Dialog (deadlock guard)', async () => {
    const DialogSpy: any = vi.fn(() => {
      throw new Error('Dialog must not be constructed by module-perceptive');
    });
    (DialogSpy as any).confirm = vi.fn(() => {
      throw new Error('Dialog.confirm must not be called by module-perceptive');
    });
    (globalThis as any).Dialog = DialogSpy;

    const flags: Record<string, unknown> = {};
    const tok = makeTokenDoc(TOK_ID, 'Sneak', flags);
    const scene = makeScene([tok]);
    const api = {
      PerceptiveFlags: {
        addSpottedby: vi.fn(async () => { flags.SpottedbyFlag = [SPOTTER_ID]; }),
        setcanbeSpotted: vi.fn(async () => { flags.canbeSpottedFlag = true; }),
        clearSpottedby: vi.fn(async () => { flags.SpottedbyFlag = []; }),
      },
      LightLevel: vi.fn(async () => 2),
    };
    const gp = { RemoveLingeringAP: vi.fn(async () => {}) };
    const spotter = makeTokenDoc(SPOTTER_ID, 'Watcher', {});
    scene.tokens.contents.push(spotter);
    (globalThis as any).game = makeGame({ active: true, scene, api, perceptive: gp });

    for (const args of [
      { action: 'set-stealth', tokenId: TOK_ID, sceneId: SCENE_ID, stealthing: true },
      { action: 'set-spotting', tokenId: TOK_ID, sceneId: SCENE_ID, spotterId: SPOTTER_ID },
      { action: 'set-spottable', tokenId: TOK_ID, sceneId: SCENE_ID, canbeSpotted: true, ppdc: 30, apdc: 20 },
      { action: 'reset-stealth', tokenId: TOK_ID, sceneId: SCENE_ID },
      { action: 'get-state', tokenId: TOK_ID, sceneId: SCENE_ID },
    ]) {
      const res: any = await dispatchModulePerceptive(args);
      expect(res.success).toBe(true);
    }
    expect(DialogSpy).not.toHaveBeenCalled();
    expect((DialogSpy as any).confirm).not.toHaveBeenCalled();
    delete (globalThis as any).Dialog;
  });
});

// ── 5. set-spotting / set-spottable via the properly-awaited module API ──────────

describe('module API write paths', () => {
  it('set-spotting adds the spotter to SpottedbyFlag and verifies (no settle)', async () => {
    const flags: Record<string, unknown> = {};
    const tok = makeTokenDoc(TOK_ID, 'Sneak', flags);
    const spotter = makeTokenDoc(SPOTTER_ID, 'Watcher', {});
    const scene = makeScene([tok, spotter]);
    const api = { PerceptiveFlags: { addSpottedby: vi.fn(async (_t: any, s: any) => { flags.SpottedbyFlag = [s.id]; }) } };
    (globalThis as any).game = makeGame({ active: true, scene, api });
    const res: any = await dispatchModulePerceptive({ action: 'set-spotting', tokenId: TOK_ID, sceneId: SCENE_ID, spotterId: SPOTTER_ID });
    expect(res.success).toBe(true);
    expect(res.data.spottedBy).toContain(SPOTTER_ID);
    expect(api.PerceptiveFlags.addSpottedby).toHaveBeenCalledTimes(1);
  });

  it('set-spottable false-persist (api no-ops) → PERCEPTIVE_NOT_PERSISTED', async () => {
    const flags: Record<string, unknown> = {};
    const tok = makeTokenDoc(TOK_ID, 'Sneak', flags);
    const scene = makeScene([tok]);
    const api = { PerceptiveFlags: { setcanbeSpotted: vi.fn(async () => { /* drops */ }) } };
    (globalThis as any).game = makeGame({ active: true, scene, api });
    const res: any = await dispatchModulePerceptive({ action: 'set-spottable', tokenId: TOK_ID, sceneId: SCENE_ID, canbeSpotted: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('PERCEPTIVE_NOT_PERSISTED');
  });
});

// ── 6. discriminatedUnion rejects an off-list action ────────────────────────────

describe('schema discriminatedUnion', () => {
  it('an unknown action is rejected at parse → PERCEPTIVE_INVALID_INPUT', async () => {
    (globalThis as any).game = makeGame({ active: true, scene: makeScene([]) });
    const res: any = await dispatchModulePerceptive({ action: 'frobnicate', tokenId: TOK_ID });
    expect(res.success).toBe(false);
    expect(res.error).toContain('PERCEPTIVE_INVALID_INPUT');
  });

  it('a token target with neither id nor name → PERCEPTIVE_TARGET_NOT_FOUND', async () => {
    (globalThis as any).game = makeGame({ active: true, scene: makeScene([]) });
    const res: any = await dispatchModulePerceptive({ action: 'get-state', sceneId: SCENE_ID });
    expect(res.success).toBe(false);
    expect(res.error).toContain('PERCEPTIVE_TARGET_NOT_FOUND');
  });
});
