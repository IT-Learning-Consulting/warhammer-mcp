// Phase 3a — BUG-019 / HC1: system-id guard coverage.
// Verifies main.ts:initialize() registers handlers only for wfrp4e worlds.

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('system-id guard', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    // Fresh CONFIG.queries + game.system per test
    (globalThis as any).CONFIG.queries = {};
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    // Reset module cache so FoundryMCPBridge re-instantiates cleanly
    vi.resetModules();
  });

  it('wfrp4e world registers warhammer-mcp handlers', async () => {
    (globalThis as any).game.system = { id: 'wfrp4e' };
    const { foundryMCPBridge } = await import('../main.js');
    await foundryMCPBridge.initialize();

    const mcpKeys = Object.keys((globalThis as any).CONFIG.queries).filter((k) =>
      k.startsWith('warhammer-mcp.'),
    );
    expect(mcpKeys.length).toBeGreaterThan(0);
  });

  it('dnd5e world registers zero handlers and logs one line', async () => {
    (globalThis as any).game.system = { id: 'dnd5e' };
    const { foundryMCPBridge } = await import('../main.js');
    await foundryMCPBridge.initialize();

    const mcpKeys = Object.keys((globalThis as any).CONFIG.queries).filter((k) =>
      k.startsWith('warhammer-mcp.'),
    );
    expect(mcpKeys.length).toBe(0);

    const hitsGuardLog = logSpy.mock.calls.some((args) =>
      String(args[0] ?? '').includes('requires wfrp4e system; detected dnd5e'),
    );
    expect(hitsGuardLog).toBe(true);
  });
});
