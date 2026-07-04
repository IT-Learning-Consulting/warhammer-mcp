// Fixture for the query-key-parity gate negative test (mcp_code_quality_v2 Phase C3 task 5.2,
// scripts/check-query-key-parity.mjs).
//
// Deliberately calls `this.query('totallyMisspelledQueryKey123', ...)` — a literal with no
// buildHandlerTable() entry in queries.ts — proving the gate fires USED_BUT_UNREGISTERED when a
// tool calls a misspelled/nonexistent key.
//
// This file lives under __tests__/fixtures/, OUTSIDE tools/, so it is never picked up by the live
// gate's own walk (which only scans packages/mcp-server/src/tools/**) — the negative-test proof
// that the gate actually fires on this shape is captured by TEMPORARILY pasting an equivalent call
// into a real tools/**/*.ts file and re-running the gate (see the execution report's task 5.2
// section for the recorded before/after run).

export class FixtureBypassTool {
  async execute() {
    return (this as any).query('totallyMisspelledQueryKey123', {});
  }
}
