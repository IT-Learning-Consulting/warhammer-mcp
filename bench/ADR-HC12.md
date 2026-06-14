# ADR-HC12 — Refined HC12 Performance-Budget Application

**Status:** decided  
**Phase:** 0, sub-phase 0.8.3  
**Cross-reference:** journal ADR-020 in `mcp_code_quality_hardening_v1_journal.md`

---

## Context

PRD HC12 and NF1 state a 5% performance regression budget across all hot paths.  
Phase 0 sub-phase 0.8 introduces a vitest `bench()` in-process harness for the
benchable hot paths (`passesEnhancedCriteria`, `getCharacterInfo`, `searchCompendium`
basic path) and a diagnostic-latency script (`capture-bench-live.mjs`) for the
ms-scale write paths (`updateActor`, template-apply) that are not in-process
benchable.

During implementation, two problems with a flat 5% budget were identified:

1. **Windows high-resolution timer noise on sub-µs paths.**  
   The Vitest bench framework reports times in milliseconds; for a 35ns call
   the resolution is effectively 0.1µs (one tick), and the jitter between
   runs easily exceeds ±50%–100% of the actual value.  A 5% budget on a
   baseline of 35ns = 1.75ns, which is below the minimum measureable delta —
   every run would spuriously fail.

2. **Sub-10µs paths need wider headroom.**  
   The `passesEnhancedCriteria` pure comparator runs in 35–130ns on the bench
   machine.  Windows scheduler and CPU frequency scaling introduce ±10–20% jitter
   at this scale.  A 5% budget would gate-fail on idle system activity, not
   real regressions.

3. **Cross-source comparison is meaningless.**  
   In-process µs bench times (wall-clock in test) and diagnostic-live ms times
   (MCP round-trip to a real Foundry process) measure completely different things.
   Comparing them as if they were the same metric would produce nonsense diffs.

---

## Decision

Apply the following **refined HC12 budget** in `scripts/compare-bench.mjs`:

| Condition | Rule |
|-----------|------|
| Delta < 1000ns (absolute floor) | **NEVER FAIL** — sub-µs noise, always PASS |
| `source: "in-process"` paths | **15% budget** — µs-scale, Vitest timer noise |
| `source: "diagnostic-live"` paths | **5% budget** — ms-scale, real latency, strict |
| Baseline metric = 0 | **SKIP** — sub-resolution entry, cannot compare |
| Different `source` types | **Never compare** — apples vs oranges |

The original 5% applies unchanged to the **only path class where it is meaningful**:
`diagnostic-live` ms-scale round-trip latency captured by `capture-bench-live.mjs`.

---

## Rationale

- **1000ns floor:** any delta below 1µs is within Windows `performance.now()` tick
  resolution and Vitest's own measurement overhead.  Gating on it produces false
  positives even when the baseline and current are compiled from the same code.

- **15% for sub-10µs in-process:** empirically, re-running the same bench on the
  same machine across sessions produces ±10–20% variance on µs-scale paths due to
  CPU frequency scaling (Turbo Boost / P-states) and OS scheduler preemption.
  The 15% budget absorbs this noise while still catching a genuine 2× regression
  (which would show +100% and fail at the 15% boundary).

- **5% strictly for ms-scale diagnostic-live:** at 10ms–500ms round-trip latency,
  a 5% delta = 0.5ms–25ms, well above measurement noise.  This preserves the
  intent of HC12/NF1 as a meaningful guard against handler-latency regressions
  introduced during the refactor phases.

- **Strict source segregation:** the two bench types exist at different tiers
  (Tier A = in-process, Tier B = diagnostic-live); mixing them would compare
  test-overhead with network + Foundry-actor overhead, which is not a valid
  perf comparison.

---

## Implications

- `bench/baseline.json` contains only `source:"in-process"` entries at Tier A.
  `source:"diagnostic-live"` entries are appended by `capture-bench-live.mjs`
  during Tier B (post-restart, live Foundry).

- `compare-bench.mjs` respects the `source` field on every entry; a cross-source
  pair is silently skipped (not a failure).

- CI runs `bench:diff` (compare-bench) only when `bench/baseline.json` exists
  (guarded in `quality-gates.yml`).  A fresh checkout with no baseline skips
  the gate rather than false-failing.

- The 15%/5% split applies to `medianNs` / `medianMs` respectively (median-of-N
  strategy; median is more stable than mean for skewed latency distributions).

---

## Revisit when

- A reliable sub-µs timer source becomes available in the bench environment
  (e.g., `process.hrtime.bigint()` with Vitest custom timers — currently not
  exposed in the bench runner).
- The Phase 3 services/ split introduces new hot-path candidates that need
  ms-scale in-process benches (reconsider the sub-10µs threshold).
- A `diagnostic-live` regression consistently hits the 5% wall due to Foundry
  version upgrade overhead (may need a per-phase recalibration).
