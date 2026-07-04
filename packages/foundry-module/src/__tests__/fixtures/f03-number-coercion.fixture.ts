// Fixture for the F03 gate negative test (mcp_code_quality_v2 Phase C3 task 5.1 — type-aware
// redesign, scripts/check-source-pattern.mjs Rule 3).
//
// Deliberately carries a settings/flag round-trip read (`.getFlag(`) followed within 5 lines by a
// bare strict `!==` compare against a NUMBER-typed `input.<field>` — the exact coercion-hazard
// shape the type-aware redesign must still catch (a Zod z.number() field is NOT auto-cleared like
// string/enum/boolean fields are).
//
// This file lives under __tests__/fixtures/, OUTSIDE handlers/modules/, so it is never picked up
// by the live gate's own walk (which only scans handlers/modules/**) — the negative-test proof
// that Rule 3 actually fires on this shape is captured by TEMPORARILY pasting an equivalent
// snippet into a real handlers/modules/**/*.ts file and re-running the gate (see the execution
// report's task 5.1 section for the recorded before/after run + the type resolved).

interface FixtureInput {
  count: number;
}

export async function handleFixtureNumberWrite(input: FixtureInput): Promise<{ success: boolean; error?: string }> {
  const doc = { getFlag: (_scope: string, _key: string) => 0 } as any;
  const persisted = doc.getFlag('fixture-module', 'count');
  if (persisted !== input.count) { // deliberately UNANNOTATED — count is z.number(), a genuine hazard
    return { success: false, error: 'FIXTURE_COUNT_NOT_PERSISTED' };
  }
  return { success: true };
}
