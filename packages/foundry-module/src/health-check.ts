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

const MODULE_PREFIX = '[warhammer-mcp]';

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
}

export function getCapturedErrors(): ReadonlyArray<CapturedError> {
  return capturedErrors.slice();
}

export function resetCapturedErrors(): void {
  capturedErrors.length = 0;
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

  const banner = '='.repeat(69);
  const ok = issues.length === 0;
  const status = ok ? '[OK] ALL OK' : `[WARN] ${issues.length} ISSUE${issues.length === 1 ? '' : 'S'} DETECTED`;

  console.log(banner);
  console.log(`${MODULE_PREFIX} Health check — 2 minutes post-ready`);
  console.log(banner);
  console.log(`  Module active:       ${moduleActive ? '[OK]' : '[FAIL]'} ${moduleActive}`);
  console.log(`  Queries registered:  ${queryCount > 0 ? '[OK]' : '[FAIL]'} ${queryCount}${expectedQueryCount ? ` (expected >= ${expectedQueryCount})` : ''}`);
  console.log(`  Socket connected:    ${socketConnected ? '[OK]' : '[FAIL]'} ${socketConnected}`);
  console.log(`  Init exceptions:     ${capturedErrors.length === 0 ? '[OK] none' : `[FAIL] ${capturedErrors.length}`}`);
  console.log('');
  console.log(`  STATUS: ${status}`);
  if (!ok) {
    console.log('  Action items:');
    for (const i of issues) console.log(`    - ${i}`);
    if (capturedErrors.length > 0) {
      console.log('  Captured init errors:');
      capturedErrors.forEach(({ phase, error }, idx) => {
        console.log(`    [${idx + 1}] phase="${phase}" message="${error.message}"`);
        const stackLine = error.stack?.split('\n')[1]?.trim();
        if (stackLine) console.log(`        ${stackLine}`);
      });
    }
  }
  console.log(banner);

  return {
    ok,
    issues,
    moduleActive,
    queryCount,
    socketConnected,
    initErrorCount: capturedErrors.length,
  };
}
