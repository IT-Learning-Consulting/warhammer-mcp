// utils/lifecycle.ts — MCP Code-Quality Hardening v1, Phase 10 (R10.1).
//
// Per-owner AbortController registry — the generic lifecycle layer that owns the
// Hooks.on / Hooks.off (and game.socket on/off, DOM addEventListener) pairing for every
// PERSISTENT listener the module attaches. Generalized from utils/message-lifecycle.ts
// (the Phase-4 per-message seed), which stays AS-IS for the fine per-chat-message scope
// (R10.2 — verify, do not rebuild). Per-message controllers nest under this layer.
//
// Why a registry instead of a `{ signal }` pass-through: Foundry's Hooks.on() does NOT
// accept an AbortSignal natively (only DOM addEventListener does — Risk 10.B). So this
// module stores each hook's numeric id and calls Hooks.off(name, id) when the owner's
// AbortController aborts — the signal's own 'abort' event drives teardown. teardownAll()
// aborts every owner and is wired into main.ts cleanup() for module-level teardown.
//
// HC11 EXEMPTIONS — sites deliberately NOT routed through this registry (each serves zero
// persistent-leak surface, so wrapping them is busywork that fights the worth-it filter).
// The scripts/check-signal-hooks.mjs build guardrail mirrors this allowlist:
//   • 3 Hooks.once(...)        — fire-once, self-removing (main.ts init/ready + mcp-dialog-autoresolve ready).
//   • 3 ephemeral Hooks .on    — data-access.ts (updateActor) + services/shared/actor-update-observer.ts
//                                (updateActor) + services/market.ts (updateItem, BUG-430 F-0B-3),
//                                each paired with Hooks.off in a finally{} (no persistent leak).
//   • window 'beforeunload'    — intentionally permanent: it IS the teardown trigger (it calls cleanup()).
//   • heartbeat setInterval    — already cleared in stopHeartbeat() (main.ts).
//   • 2 FormApplication .click — jQuery menu handlers (settings.ts); the app DOM is torn down on close.

// Module-scope registry: one AbortController per owner. noUncheckedIndexedAccess ⇒ every
// Map.get() is guarded.
const controllers = new Map<string, AbortController>();

/** Lazily create (or return) the owner's AbortController signal. */
export function getSignal(owner: string): AbortSignal {
  let controller = controllers.get(owner);
  if (!controller) {
    controller = new AbortController();
    controllers.set(owner, controller);
  }
  return controller.signal;
}

/**
 * Register a PERSISTENT Foundry hook owned by `owner`. Stores the numeric hook id returned
 * by Hooks.on and calls Hooks.off(hookName, id) when the owner's controller aborts.
 *
 * `(Hooks as any)` mirrors the data-access.ts precedent: the typed Hooks.off does not accept
 * the numeric id Hooks.on returns, so the on/off id round-trip is cast.
 */
export function registerHook(owner: string, hookName: string, fn: (...args: any[]) => void): void {
  const id = (Hooks as any).on(hookName, fn);
  getSignal(owner).addEventListener(
    'abort',
    () => {
      (Hooks as any).off(hookName, id);
    },
    { once: true }
  );
}

/**
 * Register a game.socket channel listener owned by `owner`. No-op if game.socket is absent
 * (mirrors the original `game.socket?.on(...)` guard). Calls socket.off(channel, fn) when the
 * owner's controller aborts.
 */
export function registerSocket(owner: string, channel: string, fn: (...args: any[]) => void): void {
  const socket = (game as any)?.socket;
  if (!socket?.on) return;
  socket.on(channel, fn);
  getSignal(owner).addEventListener(
    'abort',
    () => {
      try {
        socket.off?.(channel, fn);
      } catch {
        // The socket may already be torn down on world unload — ignore.
      }
    },
    { once: true }
  );
}

/**
 * Register a native DOM listener owned by `owner`. Uses the native { signal } option, so the
 * browser fires removeEventListener automatically on abort — no manual teardown bookkeeping.
 */
export function registerDomListener(
  owner: string,
  el: EventTarget,
  evt: string,
  fn: (event: any) => void
): void {
  el.addEventListener(evt, fn as EventListener, { signal: getSignal(owner) });
}

/** Abort + drop a single owner's controller (tears down all its hook / socket / DOM listeners). */
export function abort(owner: string): void {
  const controller = controllers.get(owner);
  if (controller) {
    controller.abort();
    controllers.delete(owner);
  }
}

/** Abort every owner's controller. Wired into main.ts cleanup() for module teardown. */
export function teardownAll(): void {
  for (const owner of [...controllers.keys()]) {
    abort(owner);
  }
}
