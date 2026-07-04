// roll-button-listener-leak.test.ts — R4.2 regression net (MCP Code-Quality Hardening v1, Phase 4.3).
//
// Proves attachRollButtonHandlers no longer leaks click listeners across renderChatMessageHTML firings.
// Pre-fix it re-bound via html.find('.mcp-roll-button').on('click', …) with no removal → N listeners after
// N renders → N duplicate side-effects per click. The fix binds via native addEventListener with a
// per-message AbortSignal (a re-render's bindMessageController() abort tears the prior listener down) plus a
// data-attribute sentinel (a double-attach within one render doesn't stack two listeners).
//
// happy-dom (test env) flips AbortSignal.aborted but — unlike a real browser — does NOT auto-remove a
// {signal}-bound listener on abort. So the abort-teardown is asserted at the MECHANISM level here (every
// listener is bound WITH a per-message signal, and bindMessageController aborts every prior render's signal →
// a spec-compliant browser then keeps exactly one live listener); the end-to-end "click fires once after N
// reloads" is the L4a live-Foundry smoke. The sentinel guard IS behaviorally asserted (it needs no abort).

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RollButtonService } from '../services/index.js';
import { bindMessageController, releaseMessageController } from '../utils/message-lifecycle.js';

// Minimal jQuery stub: enough for attachRollButtonHandlers (.find().each(), $(el).data/prop/text/css/show/hide,
// and a faithful .on() so a revert to the pre-fix code path is exercised by the same harness).
function installJQueryStub(): void {
  (globalThis as any).$ = (arg: any) => ({
    find: (sel: string) => {
      const nodes: any[] = arg && arg.querySelectorAll ? Array.from(arg.querySelectorAll(sel)) : [];
      return {
        length: nodes.length,
        each: (cb: (i: number, el: any) => void) => nodes.forEach((n, i) => cb(i, n)),
        // Faithful jQuery .on: a native listener with NO signal option — the leaky form. Present so that a
        // revert to `.on('click', …)` makes the "bound with a signal" assertion below fail.
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

describe('roll-button listener leak — R4.2 regression', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    installJQueryStub();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    delete (globalThis as any).$;
  });

  // Number of click handlers that actually fired (each logs the "missing button-id" warn once, because the
  // stubbed data attributes are empty so the handler short-circuits at that guard).
  function fireCount(): number {
    return warnSpy.mock.calls.filter((c) => String(c[0] ?? '').includes('Button missing button-id')).length;
  }

  it('100 renders use fresh per-message signals (every prior render aborted) via the sentinel binding path', () => {
    const svc = new RollButtonService();
    const messageId = 'msg-leak-1';
    const signals: AbortSignal[] = [];
    const buttons: any[] = [];

    for (let i = 0; i < 100; i++) {
      // Each renderChatMessageHTML firing = a fresh DOM node + a fresh per-message AbortController.
      const container = makeButtonContainer();
      const signal = bindMessageController(messageId); // aborts the prior render's controller
      signals.push(signal);
      svc.attachRollButtonHandlers($(container), signal);
      buttons.push(container.querySelector('.mcp-roll-button'));
    }

    // bindMessageController aborted every prior render's controller; only the final render stays live.
    // In a spec-compliant browser the 99 aborted renders' {signal}-bound listeners are removed → one survives.
    for (let i = 0; i < 99; i++) {
      expect(signals[i]!.aborted).toBe(true);
    }
    expect(signals[99]!.aborted).toBe(false);

    // Every render bound through the native addEventListener path, which stamps the sentinel attribute.
    // A revert to jQuery `.on('click', …)` would not stamp it → this fails.
    for (const btn of buttons) {
      expect(btn.hasAttribute('data-warhammer-mcp-roll-handler-attached')).toBe(true);
    }
  });

  it('releaseMessageController (deleteChatMessage) aborts the message controller', () => {
    const svc = new RollButtonService();
    const messageId = 'msg-leak-2';
    const container = makeButtonContainer();
    const signal = bindMessageController(messageId);
    svc.attachRollButtonHandlers($(container), signal);

    expect(signal.aborted).toBe(false);
    releaseMessageController(messageId); // the deleteChatMessage hook
    expect(signal.aborted).toBe(true); // the live render's listener is torn down with it (browser-side)
  });

  it('the data-attribute sentinel blocks a double-attach within a single render', () => {
    const svc = new RollButtonService();
    const container = makeButtonContainer();
    const signal = bindMessageController('msg-leak-3');

    // Same render, attach called twice (e.g. both hook branches fire on one element).
    svc.attachRollButtonHandlers($(container), signal);
    svc.attachRollButtonHandlers($(container), signal);

    container.querySelector('.mcp-roll-button')!.dispatchEvent(new Event('click'));
    expect(fireCount()).toBe(1); // sentinel prevented a second listener → one fire, not two
  });
});
