// utils/message-lifecycle.ts — MCP Code-Quality Hardening v1, Phase 4 (R4.2).
//
// Per-message AbortController registry — the foundation of the roll-button listener-leak fix. A module-scope
// Map keyed by ChatMessage id; each renderChatMessageHTML firing aborts the prior controller for that message
// and hands out a fresh AbortSignal, so the superseded render's `addEventListener('click', …, { signal })`
// handlers are torn down instead of accumulating. deleteChatMessage releases the controller to bound map growth.
//
// Phase 4.2 lands this util + RollButtonService consuming the signal is wired in Phase 4.3 (the actual
// renderChatMessageHTML / deleteChatMessage hooks + the addEventListener rewrite). This is the first
// AbortController in the repo; Phase 10 promotes it to the generic utils/lifecycle.ts (R10.2).

const messageControllers = new Map<string, AbortController>();

/**
 * Abort the prior controller for this message (if any), install a fresh one, and return its AbortSignal.
 * Pass the signal to every listener attached for this render so the next render's bind() tears them down.
 */
export function bindMessageController(messageId: string): AbortSignal {
  const prior = messageControllers.get(messageId);
  if (prior) {
    prior.abort();
  }
  const controller = new AbortController();
  messageControllers.set(messageId, controller);
  return controller.signal;
}

/**
 * Abort + drop the controller for this message. Called from the deleteChatMessage hook so the registry
 * does not grow unbounded across a long session.
 */
export function releaseMessageController(messageId: string): void {
  const controller = messageControllers.get(messageId);
  if (controller) {
    controller.abort();
    messageControllers.delete(messageId);
  }
}
