// chat-message-lifecycle.test.ts — MCP Code-Quality Hardening v1, Phase 10 (R10.2/R10.3).
//
// R10.2 = verify the Phase-4 roll-button listener-leak fix HOLDS after the Phase-10 rewiring (the
// per-message AbortController in utils/message-lifecycle.ts is deliberately UNCHANGED — it nests under
// the new lifecycle layer). This test asserts the leak-bound invariant directly: across N renders of the
// SAME chat message, exactly ONE controller signal is live (count-stable-at-1) and every superseded
// render's signal is aborted, so a spec-compliant browser keeps exactly one live click listener.
//
// happy-dom flips AbortSignal.aborted but does NOT auto-remove a {signal}-bound listener, so (as in
// roll-button-listener-leak.test.ts) the teardown is asserted at the MECHANISM level: signal.aborted +
// the data-warhammer-mcp-roll-handler-attached sentinel. The end-to-end "click fires once after N
// reloads" is the L4a live smoke.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RollButtonService } from '../services/index.js';
import { bindMessageController, releaseMessageController } from '../utils/message-lifecycle.js';

function installJQueryStub(): void {
  (globalThis as any).$ = (arg: any) => ({
    find: (sel: string) => {
      const nodes: any[] = arg && arg.querySelectorAll ? Array.from(arg.querySelectorAll(sel)) : [];
      return {
        length: nodes.length,
        each: (cb: (i: number, el: any) => void) => nodes.forEach((n, i) => cb(i, n)),
        on: (evt: string, handler: any) => nodes.forEach((n: any) => n.addEventListener(evt, handler)),
      };
    },
    data: (_k: string) => '',
    prop: (_name: string, _val?: any) => false,
    text: (_v?: any) => '',
    css: () => {},
    show: () => {},
    hide: () => {},
  });
}

function makeButtonContainer(): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = '<button class="mcp-roll-button">Roll</button>';
  return container;
}

describe('chat-message lifecycle — R10.2 leak-fix holds', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    installJQueryStub();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    delete (globalThis as any).$;
  });

  it('100 re-renders of one message keep exactly ONE live controller (count-stable-at-1)', () => {
    const svc = new RollButtonService();
    const messageId = 'msg-phase10-1';
    const signals: AbortSignal[] = [];
    const buttons: HTMLElement[] = [];

    for (let i = 0; i < 100; i++) {
      const container = makeButtonContainer();
      const signal = bindMessageController(messageId); // aborts the prior render's controller
      signals.push(signal);
      svc.attachRollButtonHandlers($(container), signal);
      buttons.push(container.querySelector('.mcp-roll-button') as HTMLElement);
    }

    // The leak-bound invariant: regardless of render count, exactly one controller is live.
    const live = signals.filter((s) => !s.aborted).length;
    expect(live).toBe(1);
    expect(signals[99]!.aborted).toBe(false); // the most-recent render is the live one
    expect(signals.slice(0, 99).every((s) => s.aborted)).toBe(true);

    // Every render bound through the native addEventListener path → the sentinel is stamped.
    // A revert to leaky jQuery `.on('click', …)` would not stamp it → this fails.
    expect(buttons.every((b) => b.hasAttribute('data-warhammer-mcp-roll-handler-attached'))).toBe(true);
  });

  it('releaseMessageController (deleteChatMessage) aborts the last live controller → zero live', () => {
    const svc = new RollButtonService();
    const messageId = 'msg-phase10-2';
    const container = makeButtonContainer();
    const signal = bindMessageController(messageId);
    svc.attachRollButtonHandlers($(container), signal);

    expect(signal.aborted).toBe(false);
    releaseMessageController(messageId);
    expect(signal.aborted).toBe(true); // controller dropped from the registry + listener torn down
  });
});
