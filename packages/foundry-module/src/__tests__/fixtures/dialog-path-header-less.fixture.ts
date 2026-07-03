// Fixture for the DIALOG-PATH gate negative test (RC1.4, mcp_code_quality_v2 Phase C1 task 5.2).
//
// Deliberately carries NO `// DIALOG-PATH: DIALOG_FREE|DIALOG_GUARDED|DIALOG_INVESTIGATED` anchor
// within its first 50 lines — proves scripts/check-source-pattern.mjs's Rule 2 fires exit 1 when
// pointed at a module-handler-shaped file missing the header.
//
// This file lives under __tests__/fixtures/, OUTSIDE handlers/modules/, so it is never picked up
// by the live gate's own walk (which only scans handlers/modules/**) — the negative-test proof
// that Rule 2 actually fires is captured by TEMPORARILY stripping the anchor from a real
// handlers/modules/**/*.ts file and re-running the gate (see the execution report's task 5.2
// section for the recorded before/after run). This fixture documents the missing-header SHAPE for
// future reference / a future automated harness, without requiring the gate script to support an
// alternate scan-root CLI flag (out of scope for C1).

export async function handleFixtureAction(_input: unknown): Promise<{ success: true; data: unknown }> {
  return { success: true, data: { fixture: true } };
}
