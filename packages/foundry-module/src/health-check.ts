// health-check.ts — module self-diagnostic posted ~2 minutes after Foundry "ready".
//
// Two surfaces:
//   - captureInitError(phase, error): record exceptions caught at init/ready boundaries
//     so the diagnostic can report on init regressions even if they didn't kill the module
//   - runHealthCheck(expectedQueryCount?): emit a banner-delimited summary of module
//     active state, registered query count, socket connection, and captured errors
//
// main.ts wires `runHealthCheck` via setTimeout inside the `ready` hook; by 2m post-ready
// the rest of Foundry's load noise has settled, so this banner is easy to spot in F12.

import { MODULE_ID } from './constants.js';
import { MODULE_BADGE_STYLE, badgeStyle, type NotifySeverity } from './notify.js';
// Phase 10 (R10.1): route the error hook + the 2 window listeners through the lifecycle registry
// so teardownAll() deregisters them on world unload (previously they leaked).
import * as lifecycle from './utils/lifecycle.js';

const MODULE_PREFIX = `[${MODULE_ID}]`;

interface CapturedError {
  phase: string;
  error: Error;
  timestamp: number;
}

const capturedErrors: CapturedError[] = [];

export function captureInitError(phase: string, error: unknown): void {
  const err = error instanceof Error ? error : new Error(String(error));
  capturedErrors.push({ phase, error: err, timestamp: Date.now() });
  console.error(`${MODULE_PREFIX} init error in phase "${phase}":`, err);
  // Phase 1 mcp_diagnostic_tool — mirror init-phase errors into the runtime
  // ring buffer so the `diagnostic { action: 'recent-errors' }` MCP surface
  // can surface them with source:'init' / phase:'init'. Read-only side-channel;
  // legacy callers using getCapturedErrors() see no change.
  const initRecord: RuntimeEventRecord = {
    ts: Date.now(),
    severity: 'error',
    source: 'init',
    message: err.message,
    location: phase,
    phase: 'init',
  };
  if (err.stack) initRecord.stack = err.stack;
  runtimeEventStore.push(initRecord);
}

export function getCapturedErrors(): ReadonlyArray<CapturedError> {
  return capturedErrors.slice();
}

export function resetCapturedErrors(): void {
  capturedErrors.length = 0;
}

// ────────────────────────────────────────────────────────────────────────────
// Phase 1 mcp_diagnostic_tool — RuntimeEventStore (200-entry FIFO ring buffer)
//
// PRD ADR-010 / ADR-013 / ADR-014. Read-only side-channel that captures:
//   - window.addEventListener('error')             (uncaught script errors)
//   - window.addEventListener('unhandledrejection') (rejected promises)
//   - Hooks.on('error', ...)                       (Foundry-routed errors)
//   - console.warn (wrapped; origConsoleWarn called FIRST per Risk 1.A)
//   - captureInitError() (mirrored above; phase:'init' source:'init')
//
// Exposed via:
//   - readRuntimeBuffer(filter?)   — used by handlers/diagnostic.ts
//   - installRuntimeCapture()      — wired from main.ts at module init
//
// CCR-7 seam: RuntimeEventStore is an interface; v2 can drop in a
// LocalStorageRuntimeEventStore / world-setting-backed store without
// changing handler imports. v1 ships InMemoryRuntimeEventStore.
// ────────────────────────────────────────────────────────────────────────────

type RuntimeEventSeverityLocal = 'error' | 'warn';
type RuntimeEventSourceLocal =
  | 'window'
  | 'unhandledrejection'
  | 'hooks'
  | 'console.warn'
  | 'init';

export interface RuntimeEventRecord {
  ts: number;
  severity: RuntimeEventSeverityLocal;
  source: RuntimeEventSourceLocal;
  message: string;
  stack?: string;
  location?: string;
  phase?: 'init' | 'runtime';
}

export interface RuntimeEventFilterLocal {
  severity?: RuntimeEventSeverityLocal;
  source?: RuntimeEventSourceLocal;
  limit?: number;
  since?: number;
}

export interface RuntimeEventReadResult {
  events: RuntimeEventRecord[];
  bufferSize: number;
  bufferFull: boolean;
}

export interface RuntimeEventStore {
  push(event: RuntimeEventRecord): void;
  read(filter?: RuntimeEventFilterLocal): RuntimeEventReadResult;
  size(): number;
}

const RUNTIME_BUFFER_CAP = 200;

class InMemoryRuntimeEventStore implements RuntimeEventStore {
  private events: RuntimeEventRecord[] = [];
  private hasOverflowed = false;

  push(event: RuntimeEventRecord): void {
    this.events.push(event);
    if (this.events.length > RUNTIME_BUFFER_CAP) {
      // FIFO eviction — drop oldest until at cap.
      this.events.splice(0, this.events.length - RUNTIME_BUFFER_CAP);
      this.hasOverflowed = true;
    }
  }

  read(filter?: RuntimeEventFilterLocal): RuntimeEventReadResult {
    let out: RuntimeEventRecord[] = this.events.slice();
    if (filter?.severity) out = out.filter((e) => e.severity === filter.severity);
    if (filter?.source) out = out.filter((e) => e.source === filter.source);
    if (typeof filter?.since === 'number') {
      const since = filter.since;
      out = out.filter((e) => e.ts >= since);
    }
    if (typeof filter?.limit === 'number' && filter.limit > 0 && out.length > filter.limit) {
      // Most-recent N — keep tail.
      out = out.slice(-filter.limit);
    }
    return {
      events: out,
      bufferSize: this.events.length,
      bufferFull: this.hasOverflowed,
    };
  }

  size(): number {
    return this.events.length;
  }
}

// Module-scoped singleton (PRD ADR-010 — single FIFO per session, no per-world
// persistence; cleared on world reload by virtue of fresh module load).
const runtimeEventStore: RuntimeEventStore = new InMemoryRuntimeEventStore();

// Installer-state guard — prevent double-wrap if main.ts somehow calls
// installRuntimeCapture twice (shouldn't happen; defensive).
let runtimeCaptureInstalled = false;

/**
 * Install runtime error/warning capture surfaces. Idempotent. Read-only —
 * each listener calls the original handler first (preserve behavior — Risk
 * 1.A) and does NOT throw or short-circuit (Risk 1.B).
 *
 * Wired from main.ts inside Hooks.once('init', ...) BEFORE any code that may
 * throw, so even initialize() failures land in the buffer.
 */
export function installRuntimeCapture(): void {
  if (runtimeCaptureInstalled) return;
  runtimeCaptureInstalled = true;

  // ── window.error — uncaught script errors ──────────────────────────────
  try {
    lifecycle.registerDomListener('health-check', window, 'error', (ev: ErrorEvent) => {
      try {
        const err = ev?.error instanceof Error ? ev.error : undefined;
        const message = err?.message ?? ev?.message ?? 'Unknown error';
        const rec: RuntimeEventRecord = {
          ts: Date.now(),
          severity: 'error',
          source: 'window',
          message: String(message),
          phase: 'runtime',
        };
        if (err?.stack) rec.stack = err.stack;
        if (ev?.filename) {
          rec.location = `${ev.filename}:${ev.lineno ?? '?'}:${ev.colno ?? '?'}`;
        }
        runtimeEventStore.push(rec);
      } catch {
        // Capture itself must never throw — swallow.
      }
    });
  } catch (e) {
    console.error(`${MODULE_PREFIX} runtime-capture: failed to install window.error listener`, e);
  }

  // ── unhandledrejection — rejected Promise without .catch ───────────────
  try {
    lifecycle.registerDomListener('health-check', window, 'unhandledrejection', (ev: PromiseRejectionEvent) => {
      try {
        const reason = ev?.reason;
        const err = reason instanceof Error ? reason : undefined;
        const message =
          err?.message ?? (typeof reason === 'string' ? reason : 'Unhandled promise rejection');
        const rec: RuntimeEventRecord = {
          ts: Date.now(),
          severity: 'error',
          source: 'unhandledrejection',
          message: String(message),
          phase: 'runtime',
        };
        if (err?.stack) rec.stack = err.stack;
        runtimeEventStore.push(rec);
      } catch {
        // swallow
      }
    });
  } catch (e) {
    console.error(`${MODULE_PREFIX} runtime-capture: failed to install unhandledrejection listener`, e);
  }

  // ── Hooks.on('error') — Foundry-routed errors ──────────────────────────
  // v13 signature: Hooks.call('error', location: string, error: Error, data?: object)
  // Listener MUST NOT throw and MUST NOT return false (Risk 1.B — would
  // short-circuit Foundry's own error pipeline).
  try {
    lifecycle.registerHook('health-check', 'error', (location: string, error: Error, data?: any) => {
      try {
        const err = error instanceof Error ? error : new Error(String(error));
        const rec: RuntimeEventRecord = {
          ts: Date.now(),
          severity: 'error',
          source: 'hooks',
          message: err.message,
          phase: 'runtime',
        };
        if (err.stack) rec.stack = err.stack;
        if (typeof location === 'string') rec.location = location;
        runtimeEventStore.push(rec);
        // data is intentionally ignored (may be undefined per Risk-mitigation
        // assumption; eval probe (i) verifies the contract).
        void data;
      } catch {
        // swallow — must never throw, must never return false
      }
    });
  } catch (e) {
    console.error(`${MODULE_PREFIX} runtime-capture: failed to install Hooks.on('error') listener`, e);
  }

  // ── console.warn wrap — capture warnings ───────────────────────────────
  // Risk 1.A: ALWAYS call origConsoleWarn first so third-party modules that
  // log via console.warn still see their output in F12.
  try {
    const origConsoleWarn = console.warn.bind(console);
    console.warn = (...args: any[]) => {
      // Pass through FIRST — never swallow third-party warnings.
      try {
        origConsoleWarn(...args);
      } catch {
        // ignore — if the original throws there's nothing we can do
      }
      // Then push to buffer (best-effort, never throw).
      try {
        const message = args
          .map((a) => {
            if (typeof a === 'string') return a;
            if (a instanceof Error) return a.message;
            try {
              return JSON.stringify(a);
            } catch {
              return String(a);
            }
          })
          .join(' ');
        // Extract Error.stack if any arg was an Error instance.
        const errArg = args.find((a) => a instanceof Error) as Error | undefined;
        const rec: RuntimeEventRecord = {
          ts: Date.now(),
          severity: 'warn',
          source: 'console.warn',
          message: message.slice(0, 2000), // bound long warnings
          phase: 'runtime',
        };
        if (errArg?.stack) rec.stack = errArg.stack;
        runtimeEventStore.push(rec);
      } catch {
        // swallow — capture must never throw
      }
    };
  } catch (e) {
    // Restore-safety: if the wrap install itself throws, the original
    // console.warn is untouched (assignment was the throw point).
    console.error(`${MODULE_PREFIX} runtime-capture: failed to wrap console.warn`, e);
  }

  console.log(`${MODULE_PREFIX} runtime capture installed (4 surfaces; 200-entry FIFO)`);
}

/**
 * Read the runtime event buffer with optional filtering. Always returns a
 * well-formed envelope; never throws on bad filter inputs (silently ignored).
 *
 * Used by handlers/diagnostic.ts to answer
 * `warhammer-mcp.diagnostic { action: 'recent-errors' }`.
 */
export function readRuntimeBuffer(filter?: RuntimeEventFilterLocal): RuntimeEventReadResult {
  return runtimeEventStore.read(filter);
}

export interface HealthCheckResult {
  ok: boolean;
  issues: string[];
  moduleActive: boolean;
  queryCount: number;
  socketConnected: boolean;
  initErrorCount: number;
}

export function runHealthCheck(expectedQueryCount?: number): HealthCheckResult {
  const g = (globalThis as any).game;
  const cfg = (globalThis as any).CONFIG;

  const moduleActive = g?.modules?.get?.('warhammer-mcp')?.active === true;

  const queryCount = cfg?.queries
    ? Object.keys(cfg.queries).filter((k: string) => k.startsWith('warhammer-mcp.')).length
    : 0;

  // Socket state — try (a) module.api.socketBridge, (b) the global foundryMCPBridge instance
  // installed by main.ts. Fall back to false (and flag) if neither resolves.
  let socketConnected = false;
  let socketProbeFailed = false;
  try {
    const bridge =
      g?.modules?.get?.('warhammer-mcp')?.api?.socketBridge ??
      (globalThis as any).foundryMCPBridge?.socketBridge ??
      (globalThis as any).foundryMCPBridge?.['socketBridge'];
    if (bridge && typeof bridge.isConnected === 'function') {
      socketConnected = bridge.isConnected();
    } else {
      socketProbeFailed = true;
    }
  } catch {
    socketProbeFailed = true;
  }

  const issues: string[] = [];
  if (!moduleActive) issues.push('module not active');
  if (queryCount === 0) issues.push('zero queries registered (init likely failed silently)');
  if (expectedQueryCount && queryCount > 0 && queryCount < expectedQueryCount) {
    issues.push(`query count ${queryCount} below expected ${expectedQueryCount}`);
  }
  if (socketProbeFailed) {
    issues.push('socket bridge accessor not found (cannot determine connection state)');
  } else if (!socketConnected) {
    issues.push('socket not connected to backend (check :31415)');
  }
  if (capturedErrors.length > 0) {
    issues.push(`${capturedErrors.length} init exception(s) captured during load`);
  }

  const ok = issues.length === 0;

  // Severity drives the badge color via the shared notify.ts palette so the
  // health banner reads as a sibling of every other GM notification.
  const severity: NotifySeverity = ok
    ? 'lifecycle'
    : capturedErrors.length > 0
    ? 'error'
    : 'warn';
  const tag = ok ? 'HEALTH OK' : 'HEALTH ISSUES';

  const dimStyle = 'color: light-dark(oklch(45% 0 0), oklch(70% 0 0));';
  const labelStyle = 'color: light-dark(oklch(35% 0 0), oklch(80% 0 0)); font-weight: bold;';
  const okStyle = 'color: light-dark(oklch(45% 0.20 145), oklch(72% 0.20 145)); font-weight: bold;';
  const failStyle = 'color: light-dark(oklch(45% 0.22 25), oklch(72% 0.22 25)); font-weight: bold;';

  const moduleStatus = moduleActive ? '[OK]' : '[FAIL]';
  const queryStatus = queryCount > 0 ? '[OK]' : '[FAIL]';
  const queryDetail = `${queryCount}`;
  const socketStatus = socketConnected ? '[OK]' : '[FAIL]';
  const errorStatus = capturedErrors.length === 0 ? '[OK]' : '[FAIL]';
  const errorDetail = capturedErrors.length === 0 ? 'none' : String(capturedErrors.length);

  // Build one styled console.log: module badge → severity badge → header,
  // then four checks on indented lines, then a STATUS line, then optional
  // issue / captured-error detail. Every %c consumes one trailing style arg.
  let format =
    `%c${MODULE_ID}%c ${tag} %c · 2 min post-ready\n` +
    `%c  Module active:       %c${moduleStatus}%c ${moduleActive}\n` +
    `%c  Queries registered:  %c${queryStatus}%c ${queryDetail}\n` +
    `%c  Socket connected:    %c${socketStatus}%c ${socketConnected}\n` +
    `%c  Init exceptions:     %c${errorStatus}%c ${errorDetail}\n` +
    `%c  STATUS: %c${ok ? 'ALL OK' : `${issues.length} ISSUE${issues.length === 1 ? '' : 'S'} DETECTED`}`;
  const styles: string[] = [
    MODULE_BADGE_STYLE,
    badgeStyle(severity),
    dimStyle,
    labelStyle, moduleActive ? okStyle : failStyle, dimStyle,
    labelStyle, queryCount > 0 ? okStyle : failStyle, dimStyle,
    labelStyle, socketConnected ? okStyle : failStyle, dimStyle,
    labelStyle, capturedErrors.length === 0 ? okStyle : failStyle, dimStyle,
    labelStyle, ok ? okStyle : failStyle,
  ];

  if (!ok) {
    format += `\n%c  Action items:`;
    styles.push(labelStyle);
    for (const i of issues) {
      format += `\n%c    · ${i}`;
      styles.push(dimStyle);
    }
    if (capturedErrors.length > 0) {
      format += `\n%c  Captured init errors:`;
      styles.push(labelStyle);
      capturedErrors.forEach(({ phase, error }, idx) => {
        format += `\n%c    [${idx + 1}] phase="${phase}" message="${error.message}"`;
        styles.push(dimStyle);
        const stackLine = error.stack?.split('\n')[1]?.trim();
        if (stackLine) {
          format += `\n%c        ${stackLine}`;
          styles.push(dimStyle);
        }
      });
    }
  }

  console.log(format, ...styles);

  return {
    ok,
    issues,
    moduleActive,
    queryCount,
    socketConnected,
    initErrorCount: capturedErrors.length,
  };
}
