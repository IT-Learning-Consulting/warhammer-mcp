# Phase 2 Tier 2 Seeded-Fault Fixtures

These fixtures inject deterministic faults into the live Foundry world
(`adventures-in-the-warhammer-world`) so each Phase 2 Tier 2 scan
(`validate-wfrp-config`, `scan-broken-uuids`, `scan-career-refs`,
`validate-ae-scripts`) has something to surface during eval coverage and L4a
smoke. Pairs with the QA-5 through QA-8 entries in `evals/diagnostic.xml`.

## Topology

Fixtures are minimal JSON descriptors — they document *what* mutation to
perform, *which* doc to target, and *what* the corresponding diagnostic call
should detect. They are NOT a separate LevelDB snapshot — the standard
snapshot/restore pipeline (`restore_eval_world.ps1` in
`D:/foundry-vtt-mcp/packages/mcp-server/test-fixtures/eval-world-snapshot/`)
is the reset hook. Each test cycle:

1. **Restore** the world to its clean baseline:
   ```pwsh
   cd D:/foundry-vtt-mcp/packages/mcp-server/test-fixtures/eval-world-snapshot
   ./restore_eval_world.ps1
   ```
   Foundry MUST be **closed** (LevelDB locks; see
   `project_warhammer_mcp_eval_topology`).

2. **Inject** the fault — apply the mutation described in the fault
   descriptor JSON via the MCP tool listed in the descriptor's
   `injection.via` field. For `validate-wfrp-config` the fault is the
   ABSENCE of a fault (clean world expected to report `ok=true`); no
   injection needed.

3. **Run** the corresponding diagnostic scan via the `diagnostic` MCP tool
   with the descriptor's `expected_detection.action` and `expected_detection.scope`.

4. **Assert** the response contains the substring named in
   `expected_detection.response_contains`.

5. **Restore** the world before the next fault.

## Per-fault descriptors

| Fault file | Action | Injection site |
|------------|--------|----------------|
| `fault_validate_wfrp_config.json` | `validate-wfrp-config` | No-op (clean-world expected-ok) |
| `fault_scan_broken_uuids.json` | `scan-broken-uuids` | One actor's `system.description.value` |
| `fault_scan_career_refs.json` | `scan-career-refs` | One actor career item's `system.skills` |
| `fault_validate_ae_scripts.json` | `validate-ae-scripts` | One item's AE `system.scriptData[0].script` |

`target_uuid` placeholders use `Actor.<TBD>` / `Item.<TBD>` — pick a stable
non-essential doc from the live snapshot before the first eval run; record
the resolved UUID inline and commit. Validate-stage smoke does the resolution
on first run.

## Why JSON descriptors, not snapshot variants

Per PRD §10 Phase 2 Risk 2.C: maintaining 4 separate LevelDB snapshots is
expensive and brittle. Programmatic injection on top of the single canonical
snapshot keeps fixture maintenance to a JSON edit and the live world clean
between runs.
