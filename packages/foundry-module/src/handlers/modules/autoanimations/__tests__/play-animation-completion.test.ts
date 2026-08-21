// BUG-795 — manual AA play dropped unresolved targets silently and fabricated completion.
//
// Why: AA's exported playAnimation() (autoanimations.js:18686-18708) fires its internal
// trafficCop$1(handler) WITHOUT awaiting it, then returns the handler object — always truthy
// (unless item itself is falsy), unrelated to whether anything actually got dispatched. The old
// `result !== false` check was therefore true almost unconditionally. AA fires real
// aa.animationStart/aa.animationEnd lifecycle hooks (including a "no-target" signal on the
// zero-target exit path) that this fix observes instead of trusting the return value.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dispatchModuleAutoAnimations } from '../autoanimations.js';

function makeToken(uuid: string) {
  return { uuid, id: uuid, object: undefined as any };
}

function mockGlobalsActive(opts: { sourceToken: any; targets?: Record<string, any>; item?: any }) {
  const { sourceToken, targets = {}, item = { name: 'Fireball' } } = opts;
  (globalThis as any).game = {
    user: { isGM: true },
    modules: { get: (id: string) => (['autoanimations', 'sequencer', 'socketlib'].includes(id) ? { active: true } : null) },
  };
  (globalThis as any).fromUuid = vi.fn(async (uuid: string) => {
    if (uuid === sourceToken.uuid) return sourceToken;
    if (uuid === 'Item.fireball') return item;
    return targets[uuid] ?? null;
  });
  (globalThis as any).AutomatedAnimations = {
    // Mirrors the real signature: always resolves a truthy handler, never awaits its internal
    // dispatcher — the exact shape the old `result !== false` check was fooled by.
    playAnimation: vi.fn(async () => ({ id: 'handler-object' })),
  };

  const hooksListeners = new Map<string, Array<(...args: any[]) => void>>();
  (globalThis as any).Hooks = {
    on: vi.fn((event: string, fn: (...args: any[]) => void) => {
      const arr = hooksListeners.get(event) ?? [];
      arr.push(fn);
      hooksListeners.set(event, arr);
      return arr.length;
    }),
    off: vi.fn((event: string) => {
      hooksListeners.delete(event);
    }),
    callAll: (event: string, ...args: any[]) => {
      for (const fn of hooksListeners.get(event) ?? []) fn(...args);
    },
  };
  return { fireHook: (event: string, ...args: any[]) => (globalThis as any).Hooks.callAll(event, ...args) };
}

afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).fromUuid;
  delete (globalThis as any).AutomatedAnimations;
  delete (globalThis as any).Hooks;
  vi.useRealTimers();
});

describe('play-animation — BUG-795', () => {
  it('fails loud on an unresolved target UUID instead of silently dropping it', async () => {
    const sourceToken = makeToken('Token.source');
    mockGlobalsActive({ sourceToken, targets: {} }); // 'Token.bad' resolves to null

    const result: any = await dispatchModuleAutoAnimations({
      action: 'play-animation',
      sourceTokenUuid: 'Token.source',
      itemUuid: 'Item.fireball',
      targetUuids: ['Token.bad'],
      confirm: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('TARGET_NOT_FOUND');
    expect(result.error).toContain('Token.bad');
    // playAnimation must never have been called — fail BEFORE dispatch, not after.
    expect((globalThis as any).AutomatedAnimations.playAnimation).not.toHaveBeenCalled();
  });

  it('a real aa.animationEnd signal drives outcome:applied (not just a truthy return value)', async () => {
    const sourceToken = makeToken('Token.source');
    const ctl = mockGlobalsActive({ sourceToken });

    const promise = dispatchModuleAutoAnimations({
      action: 'play-animation',
      sourceTokenUuid: 'Token.source',
      itemUuid: 'Item.fireball',
      confirm: true,
    });
    // Fire the real completion hook AA's own pipeline would fire, scoped to this sourceToken.
    await vi.waitFor(() => expect((globalThis as any).Hooks.on).toHaveBeenCalled());
    ctl.fireHook('aa.animationEnd', sourceToken, []);
    const result: any = await promise;

    expect(result.success).toBe(true);
    expect(result.data.outcome).toBe('applied');
    expect(result.data.played).toBe(true);
    expect(result.data.endSignal).toBe('ended');
  });

  it('the "no-target" exit signal is reported as a real failure, not fabricated success', async () => {
    const sourceToken = makeToken('Token.source');
    const ctl = mockGlobalsActive({ sourceToken });

    const promise = dispatchModuleAutoAnimations({
      action: 'play-animation',
      sourceTokenUuid: 'Token.source',
      itemUuid: 'Item.fireball',
      confirm: true,
    });
    await vi.waitFor(() => expect((globalThis as any).Hooks.on).toHaveBeenCalled());
    ctl.fireHook('aa.animationEnd', sourceToken, 'no-target');
    const result: any = await promise;

    expect(result.success).toBe(true);
    expect(result.data.outcome).toBe('failed');
    expect(result.data.played).toBe(false);
    expect(result.data.endSignal).toBe('no-target');
  });

  it('a timeout with no observed end signal is reported honestly as unconfirmed, not fabricated success', async () => {
    vi.useFakeTimers();
    const sourceToken = makeToken('Token.source');
    mockGlobalsActive({ sourceToken }); // no fireHook call — hook never fires

    const promise = dispatchModuleAutoAnimations({
      action: 'play-animation',
      sourceTokenUuid: 'Token.source',
      itemUuid: 'Item.fireball',
      confirm: true,
    });
    await vi.advanceTimersByTimeAsync(3100);
    const result: any = await promise;

    expect(result.success).toBe(true);
    expect(result.data.outcome).toBe('partial');
    expect(result.data.played).toBe(false);
    expect(result.data.endSignal).toBe('timeout');
  });
});
