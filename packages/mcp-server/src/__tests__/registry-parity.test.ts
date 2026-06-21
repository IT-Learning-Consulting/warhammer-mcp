// Phase 8 (R8.1/R8.2 — Risk 8.A) — the safety gate for the declarative tool registry.
//
// Before Phase 8, backend.ts hardcoded 94 `registry.register('name', ...)` literals and an
// 80-entry `getToolDefinitions()` spread. Phase 8 replaced both with a single forEach loop over
// `buildTools()` instances, each contributing its (name, handler) pairs via `getRegistration()`.
//
// This test is the proof that the collapse preserved the surface byte-for-byte:
//   1. The union of every tool's getRegistration() names == 94, with NO duplicates (Risk 8.A:
//      a multi-method umbrella that under-returns, or two tools claiming the same name, fails here).
//   2. That set == the names emitted by getToolDefinitions() across the same instances.
//   3. That set == the committed __tools-list-snapshot__.json names (HC8 — the live tools/list).
// Any drift (a forgotten override, a typo'd name, a dropped tool) fails loud here at L2, long
// before the validate-time tools/list snapshot diff.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { buildTools } from '../tools/factory/build-tools.js';

function makeLogger(): any {
  const noop = () => undefined;
  return { info: noop, warn: noop, error: noop, debug: noop, child: () => makeLogger() };
}

function instances() {
  const foundryClient: any = { query: async () => ({}) };
  return buildTools({ foundryClient, logger: makeLogger() });
}

function snapshotNames(): string[] {
  const here = dirname(fileURLToPath(import.meta.url));
  // packages/mcp-server/src/__tests__ -> repo root
  const snapPath = resolve(here, '../../../../__tools-list-snapshot__.json');
  return JSON.parse(readFileSync(snapPath, 'utf8')).names as string[];
}

describe('declarative tool registry parity (R8.1/R8.2)', () => {
  it('getRegistration() union has exactly 95 names with no duplicates', () => {
    const names = instances().flatMap((t) => t.getRegistration().map((r) => r.name));
    expect(names.length).toBe(95);
    expect(new Set(names).size).toBe(95); // no duplicate registrations (Risk 8.A)
  });

  it('every registration carries a callable handler', () => {
    for (const t of instances()) {
      for (const r of t.getRegistration()) {
        expect(typeof r.name).toBe('string');
        expect(typeof r.handler).toBe('function');
      }
    }
  });

  it('registration names == tool-definition names (same surface)', () => {
    const insts = instances();
    const regNames = new Set(insts.flatMap((t) => t.getRegistration().map((r) => r.name)));
    const defNames = new Set(insts.flatMap((t) => t.getToolDefinitions().map((d: any) => d.name)));
    expect([...regNames].sort()).toEqual([...defNames].sort());
  });

  it('registration names == committed tools/list snapshot (HC8)', () => {
    const regNames = instances().flatMap((t) => t.getRegistration().map((r) => r.name)).sort();
    const snap = snapshotNames().slice().sort();
    expect(regNames).toEqual(snap);
  });
});
