/**
 * In-flight MCP request counter.
 *
 * Tracks the depth of active MCP requests so that downstream hooks can gate
 * behaviour to "while the MCP is processing" only.  The counter is a depth
 * count (not a boolean) so concurrent overlapping queries don't clear the flag
 * early when the inner one finishes.  The clamp ensures unbalanced decrements
 * never go negative.
 *
 * Usage: call beginMcpActivity() immediately before awaiting a handler and
 * endMcpActivity() in a finally block so every exit path (success or throw)
 * decrements the counter.
 */

import { MODULE_ID } from './constants.js';

let activeCount = 0;

/**
 * Per-request context for the in-flight MCP query.  Set by the socket bridge
 * right before the handler runs so request-scoped consumers (the dialog
 * auto-resolve GM notice) can attribute a silent auto-pick to the actor +
 * operation that triggered it.  Cleared when the counter drains to 0.
 */
export interface McpRequestContext {
  /** Bare query method (namespace stripped), e.g. "applyTemplate". */
  method?: string | undefined;
  /** Target actor id from the query args, when present. */
  actorId?: string | undefined;
  /** Resolved actor name, when the id resolves to a world actor. */
  actorName?: string | undefined;
}

let currentContext: McpRequestContext | null = null;

/** Set the context for the current MCP request.  Call before beginMcpActivity(). */
export function setMcpRequestContext(ctx: McpRequestContext | null): void {
  currentContext = ctx;
}

/** Read the current MCP request context (null when idle). */
export function getMcpRequestContext(): McpRequestContext | null {
  return currentContext;
}

/** Listeners fired once the in-flight counter drains back to 0 (a request batch finished). */
type ActivityDrainListener = () => void;
const drainListeners = new Set<ActivityDrainListener>();

/**
 * Register a callback fired each time the in-flight counter drains to 0.
 *
 * This is the per-request batch boundary: it lets request-scoped consumers
 * (e.g. the dialog auto-resolve net) accumulate state while the MCP is busy
 * and flush it exactly once when the request finishes, instead of firing
 * per-event mid-flight.  Listeners run inside a try/catch so a throwing
 * listener can't corrupt the counter for the next request.
 */
export function onMcpActivityDrained(fn: ActivityDrainListener): void {
  drainListeners.add(fn);
}

/** Increment the in-flight counter.  Call once per MCP request, before the await. */
export function beginMcpActivity(): void {
  activeCount++;
}

/** Decrement the in-flight counter.  Always call in a finally block. */
export function endMcpActivity(): void {
  activeCount = Math.max(0, activeCount - 1);
  if (activeCount === 0) {
    // Run drain listeners FIRST (they read currentContext), then clear it.
    for (const fn of drainListeners) {
      try {
        fn();
      } catch (err) {
        console.warn(`[${MODULE_ID}] mcp-activity drain listener failed`, err);
      }
    }
    currentContext = null;
  }
}

/** Returns true while at least one MCP request is in flight. */
export function isMcpActive(): boolean {
  return activeCount > 0;
}
