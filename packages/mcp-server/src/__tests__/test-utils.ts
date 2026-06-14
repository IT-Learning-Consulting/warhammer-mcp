// test-utils.ts — shared mcp-server tool-test helpers.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.1.
//
// Extracts the makeLogger + foundryClient.query mock factory repeated across the tool tests
// (setting.test.ts, folder.test.ts, ...) and the characterization snapshot suite. mcp-server vitest runs in
// a bare node env (no setupFiles), so tool tests build their own deps from these helpers.

import { vi } from 'vitest';

/** A no-op winston-shaped logger (info/warn/error/debug + child()). */
export function makeLogger(): any {
  const noop = (): undefined => undefined;
  return { info: noop, warn: noop, error: noop, debug: noop, child: () => makeLogger() };
}

/**
 * A mock FoundryClient whose `query(key, args)` resolves `mockReturn` (or throws `mockThrow`).
 * Pass a function as `mockReturn` to vary the response by (key, args).
 */
export function makeMockFoundryClient(mockReturn: any = null, mockThrow: string | null = null): any {
  return {
    query: vi.fn(async (key: string, args: any) => {
      if (mockThrow) throw new Error(mockThrow);
      return typeof mockReturn === 'function' ? mockReturn(key, args) : mockReturn;
    }),
  };
}

/** Tool constructor deps ({ foundryClient, logger }) with a canned query response. */
export function makeToolDeps(mockReturn: any = null, mockThrow: string | null = null): any {
  return { foundryClient: makeMockFoundryClient(mockReturn, mockThrow), logger: makeLogger() };
}
