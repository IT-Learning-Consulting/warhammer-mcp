// F7-B — unit coverage for the window.warhammerMcp.fireTrigger client global (src/globals.ts).
// Mirrors the memo AC (07_cross_mcp_proposals.md §C): fires via TileDocument.trigger, defaults
// method to 'manual' + tokens to controlled, and every failure surfaces a UI error WITHOUT throwing.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireTrigger, registerWarhammerMcpGlobals } from '../globals.js';

const g = globalThis as any;

describe('warhammerMcp.fireTrigger', () => {
  let errorSpy: ReturnType<typeof vi.fn>;
  let triggerSpy: ReturnType<typeof vi.fn>;
  // Snapshot the globals this test mutates so setup.ts state is restored for other suites.
  const saved = {
    MonksActiveTiles: g.game.MonksActiveTiles,
    fromUuid: g.fromUuid,
    canvas: g.canvas,
    notifications: g.ui.notifications,
  };

  beforeEach(() => {
    errorSpy = vi.fn();
    triggerSpy = vi.fn(async () => {});
    g.ui.notifications = { info: () => {}, warn: () => {}, error: errorSpy };
    g.game.MonksActiveTiles = { triggerTile: async () => {} }; // MATT active by default
    g.canvas = { tokens: { controlled: ['tok-controlled'] } };
    g.fromUuid = async (_uuid: string) => ({ trigger: triggerSpy });
  });

  afterEach(() => {
    g.game.MonksActiveTiles = saved.MonksActiveTiles;
    g.fromUuid = saved.fromUuid;
    g.canvas = saved.canvas;
    g.ui.notifications = saved.notifications;
  });

  it('fires the tile via TileDocument.trigger with method="manual" and controlled tokens by default', async () => {
    await fireTrigger('Scene.s1.Tile.t1');
    expect(triggerSpy).toHaveBeenCalledTimes(1);
    expect(triggerSpy).toHaveBeenCalledWith({ tokens: ['tok-controlled'], method: 'manual' });
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('passes through explicit tokens and method options', async () => {
    await fireTrigger('Scene.s1.Tile.t1', { tokens: ['tok-a', 'tok-b'], method: 'enter' });
    expect(triggerSpy).toHaveBeenCalledWith({ tokens: ['tok-a', 'tok-b'], method: 'enter' });
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('errors (no throw) and does not fire when Monk’s Active Tiles is inactive', async () => {
    g.game.MonksActiveTiles = undefined;
    await expect(fireTrigger('Scene.s1.Tile.t1')).resolves.toBeUndefined();
    expect(triggerSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledOnce();
    expect(errorSpy.mock.calls[0][0]).toMatch(/not active/i);
  });

  it('errors (no throw) when the tile UUID does not resolve', async () => {
    g.fromUuid = async () => null;
    await expect(fireTrigger('Scene.s1.Tile.missing')).resolves.toBeUndefined();
    expect(triggerSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledOnce();
    expect(errorSpy.mock.calls[0][0]).toMatch(/not found/i);
  });

  it('errors (no throw) when the resolved document is not a triggerable MATT tile', async () => {
    g.fromUuid = async () => ({ name: 'plain tile' }); // no .trigger method
    await fireTrigger('Scene.s1.Tile.plain');
    expect(errorSpy).toHaveBeenCalledOnce();
    expect(errorSpy.mock.calls[0][0]).toMatch(/not a triggerable MATT tile/i);
  });

  it('propagates a rejection from the fired MATT sequence (deliberate — GM must see MATT’s error)', async () => {
    // Precondition failures never throw, but the fired sequence itself does (memo §C Decision B):
    // a throwing MATT action must surface to the macro executor, not be swallowed.
    g.fromUuid = async () => ({ trigger: vi.fn(async () => { throw new Error('MATT_CONFIRM_REQUIRED'); }) });
    await expect(fireTrigger('Scene.s1.Tile.dangerous')).rejects.toThrow(/MATT_CONFIRM_REQUIRED/);
    expect(errorSpy).not.toHaveBeenCalled(); // it reached the fire path — no precondition error
  });

  it('errors on a missing/non-string UUID without touching MATT', async () => {
    await fireTrigger('' as unknown as string);
    await fireTrigger(undefined as unknown as string);
    expect(triggerSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(2);
    expect(errorSpy.mock.calls[0][0]).toMatch(/UUID string is required/i);
  });
});

describe('registerWarhammerMcpGlobals', () => {
  // Regression guard for the 2026-08-21 live-smoke bug: registration set window.warhammerMcp only,
  // so the DOCUMENTED `game.warhammerMcp?.fireTrigger` form was undefined (game !== window in Foundry).
  it('exposes fireTrigger on BOTH game.warhammerMcp and window/globalThis, sharing one api object', () => {
    let readyCb: (() => void) | undefined;
    const savedHooks = g.Hooks;
    const savedGameWmcp = g.game.warhammerMcp;
    const savedBareWmcp = g.warhammerMcp;
    g.Hooks = { once: (evt: string, cb: () => void) => { if (evt === 'ready') readyCb = cb; } };
    try {
      registerWarhammerMcpGlobals();
      expect(readyCb).toBeTypeOf('function'); // registered on the ready hook
      readyCb!();
      expect(typeof g.warhammerMcp?.fireTrigger).toBe('function');      // window / bare shorthand
      expect(typeof g.game.warhammerMcp?.fireTrigger).toBe('function'); // documented game.* form
      expect(g.game.warhammerMcp).toBe(g.warhammerMcp);                 // same api object, not two copies
    } finally {
      g.Hooks = savedHooks;
      g.game.warhammerMcp = savedGameWmcp;
      g.warhammerMcp = savedBareWmcp;
    }
  });
});
