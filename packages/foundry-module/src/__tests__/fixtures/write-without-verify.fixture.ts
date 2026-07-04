// Fixture for RF.1c (mcp_code_quality_v2 Phase F, task 3.3) — the write-without-post-verify trap
// class.
//
// This file demonstrates the ABSENCE of static-gate coverage: research confirmed (phaseF_pre_plan.md
// §Freeze gates, RF.1 violation->gate mapping item (c)) that NO script across all 24
// `D:\foundry-vtt-mcp\scripts\*.mjs` files catches a handler that performs a document write with no
// accompanying `verifyDocWrite` / `verifyScalarWrite` / `settlePoll` call. Unlike RF.1a (DIALOG-PATH,
// `check-source-pattern.mjs`) and RF.1b (untyped inputSchema param, `check-inputschema-nonscalar.mjs`),
// there is no gate script to red-team here — this fixture exists purely to document the gap's SHAPE.
//
// See journal ADR-022 (v2) (`mcp_code_quality_v2_v1_journal.md` — the v2 numbering, NOT the v1
// `phase_exit_gate.md` ADR-021/022 shorthand used elsewhere in this PRD): the class stays covered by
// convention rather than a static gate. The nets that DO catch a genuine instance of this class:
//   - DP-16 code-review convention — every warhammer-mcp quality-contract checklist item
//     (`agent-mcp-builder/references/warhammer-mcp-quality-contract.md`) requires a post-write
//     re-read + compare on every NEW write handler; a reviewer checks for it by eye.
//   - `/agent-validate`'s L3 fresh-context review — cross-checks new/changed handlers against the
//     quality contract as part of its quality pass.
//   - Live Gate-B — a write that silently drops WILL surface as a genuine FAIL the next time a
//     qa_pair asserts the post-write state (exactly the mechanism that caught BUG-434's clamp-verify
//     defect and F05/F07 in prior phases) — a persistence bug without a static gate still surfaces
//     via a live round-trip.
//
// A future positive write-verify static gate (real AST/control-flow analysis to attribute a write to
// its verify call) is explicitly DEFERRED post-v2 per ADR-022(v2), pending worth-it evidence from an
// incident this convention-based net fails to catch.
//
// Zero production imports — this file is never executed, never imported by production code, and
// carries no runtime behavior; it exists solely as a documented shape for a hypothetical future gate.

/** Handler-shaped function performing a write with NO post-write verify — the undetected shape. */
export async function handleFixtureUnverifiedWrite(input: { actorId: string; value: number }): Promise<{ success: true }> {
  const actor = { update: async (_data: Record<string, unknown>) => undefined };
  // VIOLATION SHAPE: a real handler would call verifyDocWrite(freshDoc, {...}, 'XXX_NOT_PERSISTED')
  // (or verifyScalarWrite / settlePoll) after this write. This fixture omits it on purpose — no
  // static gate exists that would fail a build over this omission (RF.1c gap).
  await actor.update({ 'system.value': input.value });
  return { success: true };
}
