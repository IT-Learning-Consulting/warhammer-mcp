// DIALOG-PATH: DIALOG_FREE — pure bounded-retry/timeout polling loop over caller-supplied read/predicate callbacks; no module-API calls, no dialog risk.
// mcp_code_quality_v2 Phase C2 (RC2.1/RC2.4) — shared settle-poll canonical.
//
// Consolidates the 4 divergent bounded-retry re-read implementations that grew
// independently in narrator.ts, item-piles.ts, token-attacher.ts, and
// token-presentation.ts, all solving the same problem: a third-party module's
// OWN method call is internally fire-and-forget (its game.settings.set /
// ChatMessage.create / updateEmbeddedDocuments is never awaited by the module
// itself), so an immediate single re-read races the later-tick write and
// false-fails a *_NOT_PERSISTED verify. See warhammer-mcp-quality-contract.md §8.
//
// Two call shapes coexist by design (two verify idioms, one settle mechanism):
//   1. Generic `(read, isSettled, attempts?, delayMs?)` — narrator.ts's shape.
//      Reads a VALUE repeatedly and returns it once `isSettled(value)` holds
//      (or attempts are exhausted — the caller decides what "still unsettled"
//      means for its own *_NOT_PERSISTED token).
//   2. Boolean-predicate `(persisted, timeoutMs?, stepMs?, initialDelayMs?)` —
//      item-piles.ts's shape. Polls a boolean PREDICATE on a wall-clock
//      deadline and returns true as soon as it holds, false on timeout.
//      `initialDelayMs` (default 0) sleeps once before the first check —
//      needed by callers (e.g. token-presentation) whose write lands after a
//      module-internal setTimeout(fn, someConfiguredDelay) and so never
//      settles on the very first immediate check.

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function settlePoll<T>(
  read: () => T,
  isSettled: (v: T) => boolean,
  attempts?: number,
  delayMs?: number,
): Promise<T>;
export async function settlePoll(
  persisted: () => boolean,
  timeoutMs?: number,
  stepMs?: number,
  initialDelayMs?: number,
): Promise<boolean>;
export async function settlePoll(
  a: (() => any),
  b?: ((v: any) => boolean) | number,
  c?: number,
  d?: number,
): Promise<any> {
  if (typeof b === 'function') {
    // Generic value-read form (narrator.ts shape).
    const read = a as () => any;
    const isSettled = b;
    const attempts = c ?? 6;
    const delayMs = d ?? 40;
    let value = read();
    for (let i = 0; i < attempts && !isSettled(value); i++) {
      await sleep(delayMs);
      value = read();
    }
    return value;
  }

  // Boolean-predicate deadline form (item-piles.ts shape).
  const persisted = a as () => boolean;
  const timeoutMs = b ?? 2000;
  const stepMs = c ?? 200;
  const initialDelayMs = d ?? 0;
  if (initialDelayMs > 0) {
    await sleep(initialDelayMs);
  }
  if (persisted()) return true;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await sleep(stepMs);
    if (persisted()) return true;
  }
  return false;
}
