/** Registry of pending async events awaited by mcp-server tools (e.g. awaitResult roll round-trips). */
export class PendingEventRegistry {
  private pending = new Map<
    string,
    { resolve: (payload: unknown) => void; reject: (err: Error) => void; timer: NodeJS.Timeout }
  >();

  /**
   * Register a pending event keyed by requestId.
   * Rejects automatically with ROLL_AWAIT_TIMEOUT after timeoutMs (default 180 s, matching query timeout).
   */
  register(requestId: string, timeoutMs = 180_000): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(requestId);
        reject(new Error('ROLL_AWAIT_TIMEOUT'));
      }, timeoutMs);
      this.pending.set(requestId, { resolve, reject, timer });
    });
  }

  resolve(requestId: string, payload: unknown): void {
    const entry = this.pending.get(requestId);
    if (entry) {
      clearTimeout(entry.timer);
      this.pending.delete(requestId);
      entry.resolve(payload);
    }
  }

  reject(requestId: string, reason: string): void {
    const entry = this.pending.get(requestId);
    if (entry) {
      clearTimeout(entry.timer);
      this.pending.delete(requestId);
      entry.reject(new Error(reason));
    }
  }
}
