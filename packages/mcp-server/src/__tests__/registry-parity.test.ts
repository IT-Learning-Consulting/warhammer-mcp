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
  it('getRegistration() union has exactly 110 names with no duplicates', () => {
    const names = instances().flatMap((t) => t.getRegistration().map((r) => r.name));
    // wfrp_layer_expansion_v1 Phase 6 (P-10): 100 → 101 with the availability-test primitive.
    // wfrp_layer_expansion_v1 Phase 7 (P-11): 101 → 102 with the travel-distance primitive.
    // module_integration_v2 Phase 4: 102 → 103 with the module-perceptive umbrella.
    // module_integration_v2 Phase 5: 103 → 104 with the module-augur-nexus umbrella.
    // module_integration_v2 Phase 6: 104 → 105 with the module-wfrp-economy umbrella.
    // module_integration_v2 Phase 8: 105 → 106 with the module-mortal-needs umbrella.
    // module_integration_v2 Phase 9: 106 → 107 with the module-polyglot umbrella.
    // module_integration_v2 Phase 10: 107 → 108 with the module-narrator umbrella.
    // module_integration_v2 Phase 11: 108 → 109 with the module-macro-trigger umbrella.
    // module_integration_v2 Phase 12: 109 → 110 with the module-backpack umbrella.
    // module_integration_v2 Phase 13 (FINAL — closes the PRD): 110 → 113 with three umbrellas:
    // module-puzzle-locks (13B), module-syrinscape (13C), module-portal (13A). 13D (journal-info trio)
    // adds none — zero new code (see phase13_pre_plan.md §13D.5).
    // wfrp_economy_system Phase 3: 113 → 114 with the module-trading-places umbrella (HC8 — the
    // PRD's single allowed new tool; 16 actions over Trading Places v0.3.0).
    expect(names.length).toBe(114);
    expect(new Set(names).size).toBe(114); // no duplicate registrations (Risk 8.A)
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
