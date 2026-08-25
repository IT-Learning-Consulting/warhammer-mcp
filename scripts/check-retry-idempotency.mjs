// check-retry-idempotency.mjs — MCP Systemic Bug-Class Prevention v2, Phase 2 (HC3/HC5,
// `retry-idempotency` reserved slot, task 6.2).
//
// STATIC HALF ONLY — this checker proves ADOPTION, never idempotency BEHAVIOR. It grep-checks
// that each allowlisted composite-write subsystem's file actually calls `runWriteSteps(` or
// `precheckAlreadyApplied(` (services/shared/resume-boundary.ts) — it cannot and does not prove
// that a resend really produces `alreadyApplied`/`noop` instead of a duplicate. That behavioral
// proof lives OUTSIDE this script entirely: the ≥3 `Phase2-EvalProbe-BUG(677|711|779)-retry`
// eval-probe pairs asserting `outcome ∈ {alreadyApplied, noop}`, plus an induced-failure retry
// live-smoke pass (L3, count N not 2N). Mirrors HC4's schema-vs-behavior split in
// check-outcome-field.mjs (rule 2 "builder-usage" there is the direct structural template for
// this whole file) — see `.agents/research/bug-prevention-prd/phase2-slot-mechanics.md` §(c) for
// the trust-boundary rationale (runner is NF1 static-only; no Foundry/network/MCP socket).
//
// Allowlist shape mirrors check-outcome-field.mjs's `TOOL_HANDLER_FILES`: a hand-maintained
// subsystem -> file map, grounded in the plan's own file list for task 6.2 (the four
// resume-boundary helper adopters landed by tasks 2.1/2.3/2.4/2.5) — not re-derived by
// convention-guessing.
//
// A missing allowlisted FILE (path does not resolve on disk) is a hard FATAL naming the path —
// a loud not-found, never a silent skip (F01 posture, piv-validator Phase 1: a resolved-but-
// nonexistent scan target must never read as clean).
//
// Suppression: a same-file `// GATE-SUPPRESS[<rule-id>]: <reason>` anchor using this rule's id
// (retry-idempotency) is checked FIRST and skips the file — not offended (HC7 convention). NOTE:
// this doc block deliberately spells the anchor grammar with a `<rule-id>` placeholder (never
// this rule's id substituted contiguously into the bracket form) so this file's own header prose
// does not trip run-gates.mjs's suppression census — same self-referential-match trap
// check-source-pattern.mjs's Rule 5/6 headers already call out.
//
// Offender lines go to STDERR, format `  <relative/path>.ts` (exactly 2 leading spaces, no other
// prefix) — the exact shape run-gates.mjs's per-file-parse counting scans for.
//
// This script is NOT registered in run-gates.mjs yet — that is task 6.3 (removing the
// `retry-idempotency` entry from RESERVED_SLOTS and adding a REGISTRY entry for this file).

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..');
const MODULE_SRC = path.resolve(REPO_ROOT, 'packages', 'foundry-module', 'src');
// Repo-root-relative prefix, matching the convention every other checker's offender paths use
// (check-outcome-field.mjs's MODULE_SRC_REL) — hand-written forward-slash string, deliberately
// not path.join()-derived (would emit backslashes on Windows and desync from baseline conventions).
const MODULE_SRC_REL = 'packages/foundry-module/src';

// subsystem -> file path (relative to packages/foundry-module/src/). Hand-maintained per task
// 6.2's exact 4-file list — the plan's own file set for the resume-boundary helper's adopters,
// not re-derived by grep/convention.
export const RETRY_IDEMPOTENCY_ALLOWLIST = {
  'template-apply': 'services/template-apply.ts',
  'item': 'services/item.ts',
  'item-piles-container': 'handlers/modules/item-piles/container.ts',
  'autoanimations': 'handlers/modules/autoanimations/autoanimations.ts',
};

const RETRY_SYMBOLS = ['runWriteSteps(', 'precheckAlreadyApplied('];
const RETRY_SUPPRESS = /GATE-SUPPRESS\[retry-idempotency\]:/;

function printHelp() {
  console.log(`check-retry-idempotency.mjs — HC3/HC5 retry-idempotency adoption gate (Phase 2)

Usage: node check-retry-idempotency.mjs [--help]

Static-only adoption check: each allowlisted subsystem's file must contain a call to
runWriteSteps( or precheckAlreadyApplied( (services/shared/resume-boundary.ts), or carry a
same-file // GATE-SUPPRESS[retry-idempotency]: <reason> anchor. A missing allowlisted file is
a hard FATAL (exit 2), never a silent skip.

Idempotency BEHAVIOR (does a resend really no-op, not double-apply) is proven elsewhere: the
Phase2-EvalProbe-BUG(677|711|779)-retry eval-probe pairs + an induced-failure retry live-smoke
pass. This checker only proves the helper is wired into each allowlisted subsystem.
`);
}

/**
 * Checks one allowlist entry. Returns null when clean (symbol present, or suppressed), or an
 * offender/fatal descriptor otherwise. `readFile` is injectable so a fixture test can seed
 * red/green content without touching real files on disk (mirrors check-outcome-field.mjs's
 * checkBuilderUsageRule injection point).
 */
export function checkEntry(subsystem, relFile, readFile = (full) => readFileSync(full, 'utf8')) {
  const full = path.join(MODULE_SRC, relFile);
  if (!existsSync(full)) {
    return {
      fatal: true,
      file: `${MODULE_SRC_REL}/${relFile}`,
      detail: `retry-idempotency: allowlisted file for subsystem "${subsystem}" does not exist on disk — FATAL, not a skip.`,
    };
  }
  let content;
  try {
    content = readFile(full, relFile, subsystem);
  } catch (e) {
    return {
      fatal: true,
      file: `${MODULE_SRC_REL}/${relFile}`,
      detail: `retry-idempotency: allowlisted file for subsystem "${subsystem}" could not be read — ${e?.message ?? e}`,
    };
  }
  if (RETRY_SUPPRESS.test(content)) return null;
  const hasSymbol = RETRY_SYMBOLS.some((sym) => content.includes(sym));
  if (hasSymbol) return null;
  return {
    fatal: false,
    file: `${MODULE_SRC_REL}/${relFile}`,
    detail: `subsystem "${subsystem}": no runWriteSteps( or precheckAlreadyApplied( call found (and no GATE-SUPPRESS[retry-idempotency]: anchor)`,
  };
}

/** Runs every allowlist entry, splitting results into offenders (soft, exit 1) and fatals
 *  (missing file, exit 2). Exported for fixture/unit testing. */
export function runCheck(allowlist = RETRY_IDEMPOTENCY_ALLOWLIST, readFile) {
  const offenders = [];
  const fatals = [];
  for (const [subsystem, relFile] of Object.entries(allowlist)) {
    const result = checkEntry(subsystem, relFile, readFile);
    if (!result) continue;
    if (result.fatal) fatals.push(result);
    else offenders.push(result);
  }
  return { offenders, fatals };
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const { offenders, fatals } = runCheck();

  if (fatals.length > 0) {
    console.error(`FATAL: ${fatals.length} allowlisted retry-idempotency file(s) not found on disk:`);
    for (const f of fatals) {
      console.error(`  ${f.file}`);
      console.error(`    - ${f.detail}`);
    }
    process.exit(2);
  }

  const total = Object.keys(RETRY_IDEMPOTENCY_ALLOWLIST).length;
  if (offenders.length === 0) {
    console.log(
      `check-retry-idempotency: ${total} allowlisted subsystem(s) checked. PASS: all carry runWriteSteps(/precheckAlreadyApplied( or a suppression anchor.`,
    );
  } else {
    console.error(`\n${offenders.length} offender(s) (retry-idempotency adoption):\n`);
    for (const o of offenders) {
      console.error(`  ${o.file}`);
      console.error(`    - ${o.detail}`);
    }
    console.error(
      `\nFix: wire the write sequence through runWriteSteps() and/or guard the natural key with ` +
        `precheckAlreadyApplied() (services/shared/resume-boundary.ts), or — for a verified-safe ` +
        `instance — add a same-file "// GATE-SUPPRESS[retry-idempotency]: <reason>" anchor.`,
    );
  }

  process.exit(offenders.length > 0 ? 1 : 0);
}

// Only run as a gate when invoked directly (`node check-retry-idempotency.mjs`), not when
// imported by a fixture/unit test for exercising checkEntry()/runCheck() directly.
const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  main();
}
