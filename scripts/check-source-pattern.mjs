#!/usr/bin/env node
// check-source-pattern.mjs — D3 of Phase 6.2 MCP CRUD Expansion plan.
// Extended RC1.4 (mcp_code_quality_v2 Phase C1) to a small multi-rule runner: the original F08
// rule is UNCHANGED (top-level-only, same reporting shape); a second rule (DIALOG-PATH) walks
// handlers/modules/** recursively.
//
// Rule 1 (F08): Asserts the F08 antipattern `(persisted as any)[field]` (or any variable
// referring to the re-read post-update doc using a raw bracket access without
// `._source`) is eradicated from handlers/*.ts.
//
// The factory's DP-16 loop uses `(persisted._source as any)?.[field]` — the
// canonical pattern. Hand-rolled outliers (note / token / region) were
// retrofitted in Phase 6.2.7 (B1).
//
// Variables to check: persisted / persistedValue / note / token / region /
// scene / template / light / sound / tile.
//
// Rule 2 (DIALOG-PATH, CCR-V3): every non-test .ts under handlers/modules/** must carry a
// `// DIALOG-PATH: DIALOG_FREE|DIALOG_GUARDED|DIALOG_INVESTIGATED` anchor line within its first
// 50 lines (bounded window — a stray classification deep in the body can never satisfy it).
//
// Rule 5 (CONFIRM-GATE, systemic_bug_class_prevention v2 Phase 1 task 7.1): recursively walks
// **/assets/** at ANY depth under the vault's `.claude/skills` tree and flags any .json/.md asset
// hardcoding a literal "confirm": true or "confirmedExecution": true — see the Rule 5 block below
// for the full spec (cross-repo path resolution, suppression grammar).
//
// Rule 6 (WRITE-ORDER, systemic_bug_class_prevention v2 Phase 2 task 6.1): recursively walks
// packages/foundry-module/src/services/ + src/handlers/ (non-test .ts) and flags a file with ≥2
// raw document-write-call matches that carries neither the resume-boundary helper
// (`runWriteSteps(`/`precheckAlreadyApplied(`) nor a justified `// WRITE-ORDER:` anchor — see the
// Rule 6 block below for the full spec (BUG-677/711/797, suppression grammar).
//
// CLI filters: `--rule <id>` runs only the named rule's block (ids: f08, dialog-path, f03,
// helper-decay, confirm-gate, write-order); `--skip <id>` runs every rule except the named one.
// Bare invocation (no flags) runs all 6, unchanged from the pre-filter behavior. A positional
// skills-root override for Rule 5 (see resolveSkillsRoot() below) still works alongside these
// flags — the flag-consuming parser below strips `--rule`/`--skip` (and their values) before Rule
// 5 ever inspects the remaining positional argv.
//
// Run from repo root: node scripts/check-source-pattern.mjs [--rule <id> | --skip <id>] [skills-root]
// Exit codes: 0 = clean, 1 = antipattern/missing-header found.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = dirname(fileURLToPath(import.meta.url));

const HANDLERS_DIR = 'packages/foundry-module/src/handlers';
const MODULES_DIR = join(HANDLERS_DIR, 'modules');

// ── CLI filters: --rule <id> (run only) / --skip <id> (run all except) ─────────────────────────
//
// Strips recognized flags (and their values) out of the raw argv before anything else runs, so
// Rule 5's optional positional skills-root argument (`resolveSkillsRoot()` below) only ever sees
// genuinely positional args — a bare `--skip write-order` invocation must produce byte-identical
// Rules 1-5 output to the pre-filter bare invocation, not accidentally hand Rule 5 the literal
// string "--skip" as a bogus skills-root override.
const rawArgs = process.argv.slice(2);
let onlyRuleId = null;
let skipRuleId = null;
const positionalArgs = [];
for (let i = 0; i < rawArgs.length; i++) {
  if (rawArgs[i] === '--rule') {
    onlyRuleId = rawArgs[++i];
    continue;
  }
  if (rawArgs[i] === '--skip') {
    skipRuleId = rawArgs[++i];
    continue;
  }
  positionalArgs.push(rawArgs[i]);
}
function shouldRun(ruleId) {
  if (onlyRuleId) return ruleId === onlyRuleId;
  if (skipRuleId) return ruleId !== skipRuleId;
  return true;
}

let fail = 0;

// ── Rule 1: F08 _source antipattern (top-level handlers/*.ts only, unchanged) ─────────────────
//
// We deliberately scan for the antipattern shape, not for `_source` presence,
// so that the alternative `(<var>._source as any)?.[<field>]` is OK.
if (shouldRun('f08')) {
  const ANTIPATTERN = /\((note|token|region|scene|template|light|sound|tile|persisted)\s+as\s+any\)\s*\[(field|"[^"]+"|'[^']+')\]/;

  const f08Offenders = [];

  for (const file of readdirSync(HANDLERS_DIR)) {
    if (!file.endsWith('.ts')) continue;
    const path = join(HANDLERS_DIR, file);
    const src = readFileSync(path, 'utf8');
    const lines = src.split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (ANTIPATTERN.test(line)) {
        f08Offenders.push({ path, line: idx + 1, text: line.trim() });
        fail = 1;
      }
    });
  }

  if (f08Offenders.length === 0) {
    console.log(`✓ F08 _source pattern eradicated. No (<doc> as any)[field] usages found in handlers.`);
  } else {
    console.error(`❌ F08 antipattern found in ${f08Offenders.length} location(s):`);
    for (const o of f08Offenders) {
      console.error(`  ${o.path}:${o.line}`);
      console.error(`    ${o.text}`);
    }
    console.error(`\nFix: use \`(<doc>._source as any)?.[field]\` instead — see embeddedCRUDFactory.ts DP-16 loop.`);
  }
}

// ── Rule 2: DIALOG-PATH anchor (recursive walk over handlers/modules/**, non-test .ts) ─────────

/** Recursively collect non-test *.ts files under `dir`. */
function walkTs(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      out.push(...walkTs(full));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      out.push(full);
    }
  }
  return out;
}

if (shouldRun('dialog-path')) {
  const DIALOG_PATH_ANCHOR = /^\/\/\s*DIALOG-PATH:\s*(DIALOG_FREE|DIALOG_GUARDED|DIALOG_INVESTIGATED)\b/m;
  const dialogPathOffenders = [];

  for (const path of walkTs(MODULES_DIR)) {
    const src = readFileSync(path, 'utf8');
    const first50 = src.split(/\r?\n/).slice(0, 50).join('\n');
    if (!DIALOG_PATH_ANCHOR.test(first50)) {
      dialogPathOffenders.push(path);
      fail = 1;
    }
  }

  if (dialogPathOffenders.length === 0) {
    console.log(`✓ DIALOG-PATH anchor present on every handlers/modules/**/*.ts file.`);
  } else {
    console.error(`❌ DIALOG-PATH anchor missing (or not within the first 50 lines) in ${dialogPathOffenders.length} file(s):`);
    for (const p of dialogPathOffenders) {
      console.error(`  ${p}`);
    }
    console.error(
      `\nFix: add "// DIALOG-PATH: DIALOG_FREE|DIALOG_GUARDED|DIALOG_INVESTIGATED — <one-line rationale>" ` +
        `near the top of the file (within the first 50 lines). See handlers/modules/backpack/backpack.ts for the format exemplar.`,
    );
  }
}

// ── Rule 3 (F03, mcp_code_quality_v2 Phase C3 task 5.1 — type-aware redesign) ───────────────────
//
// The F03 class: a settings/flag ROUND-TRIP READ compared with strict `!==` against raw
// `input.<field>`. game.settings.set coerces to the registered type (Number 1.5) while the raw
// boundary value can be a string ("1.5"), so `"1.5" !== 1.5` false-fails a landed write
// (warhammer-mcp-quality-contract.md §8 sibling gotcha). Correct idioms: verifyScalarWrite()
// (utils/verifyWrite.ts) or an explicit String()/Number()/Boolean() wrap.
//
// Phase C2's original rule flagged EVERY strict-compare-vs-input candidate regardless of the
// field's actual type, requiring 8 hand-annotated `// F03-SAFE: <reason>` exemptions (all 5
// annotated files were string/enum compares — never a real coercion hazard, since a Zod-typed
// string round-trips byte-identically through game.settings.set/getFlag with no widening). That
// allowlist breached its own 5-entry redesign trigger at birth (ADR-020).
//
// Phase C3 redesign (memo §F05 option 1): keep the SAME syntactic candidate-finder below
// (strict `!==` vs `input.<field>`, no literal/wrapper, a settings/flag read within the previous
// 5 lines) as a cheap first pass, then use the real TypeScript checker to resolve the STATIC
// TYPE of `input.<field>` at that exact source position. Only `number`-flavored types
// (or a union containing one) are coercion-hazard-flagged; a `string`/string-literal-union
// (Zod `.enum()`/`.string()`) or `boolean` auto-classifies SAFE with zero manual annotation
// (boolean has no representational-coercion ambiguity — see classifyType JSDoc). An unresolvable
// type (`any`/`unknown`/checker miss) defaults to FLAGGED (conservative — never silently trusted).
// `// F03-SAFE: <reason>` remains a manual override valve for a case the checker cannot prove
// safe, but is no longer required for any currently-known site — HC10: this must not weaken
// detection; the deliberate-violation fixture (a number-typed field, bare `!==`) still fails.

if (shouldRun('f03')) {
  const F03_COMPARE = /(?:!==\s*input\.[A-Za-z_$][\w.$]*|\binput\.[A-Za-z_$][\w.$]*\s*!==)/;
  const F03_LITERAL = /!==\s*(?:undefined|true|false|null)\b|(?:undefined|true|false|null)\s*!==/;
  const F03_WRAPPER = /\b(?:String|Number|Boolean)\s*\(/;
  const F03_ROUNDTRIP_READ = /(?:settings\.get\(|\.getFlag\??\.?\()/;
  const F03_FIELD = /input\.([A-Za-z_$][\w$]*)/;
  const f03Offenders = [];
  const f03Candidates = [];

  for (const path of walkTs(MODULES_DIR)) {
    if (path.includes('__tests__')) continue;
    const lines = readFileSync(path, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
      if (/^\s*(\/\/|\*)/.test(line)) return;
      if (!F03_COMPARE.test(line)) return;
      if (F03_LITERAL.test(line)) return;
      if (F03_WRAPPER.test(line)) return;
      const window = lines.slice(Math.max(0, i - 5), i).join('\n');
      if (!F03_ROUNDTRIP_READ.test(window)) return;
      const fieldMatch = F03_FIELD.exec(line);
      f03Candidates.push({
        path,
        line: i + 1,
        lineIndex: i,
        source: line.trim(),
        field: fieldMatch ? fieldMatch[1] : null,
        manualSafe: line.includes('F03-SAFE'),
      });
    });
  }

  /** Resolve the static type of `input.<field>` at 0-indexed `lineIndex` in `sourceFile`. */
  function resolveFieldType(sourceFile, checker, lineIndex, fieldName) {
    let result;
    function visit(node) {
      if (result || !fieldName) return;
      if (
        ts.isPropertyAccessExpression(node) &&
        node.name.text === fieldName &&
        node.expression.getText(sourceFile) === 'input' &&
        sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line === lineIndex
      ) {
        result = checker.getTypeAtLocation(node);
        return;
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
    return result;
  }

  /**
   * 'safe' (string/enum/boolean — no representational-coercion ambiguity), 'hazard' (a numeric
   * type is present — the class the rule's header names: Number 1.5 vs raw string "1.5"), or
   * 'unresolved' (any/unknown/checker miss — conservative default, still flagged).
   *
   * Boolean is NOT a hazard class: unlike a number, a genuine JS boolean has no alternate
   * representation that a Boolean-typed Foundry setting round-trip could silently coerce away
   * (Boolean(true) === true always) — confirmed empirically: 2 of the 8 retired F03-SAFE sites
   * were boolean compares with Zod-matched types (memo §F05).
   */
  function classifyType(type) {
    if (!type) return 'unresolved';
    const parts = type.isUnion?.() ? type.types : [type];
    let hazard = false;
    for (const t of parts) {
      if (t.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) return 'unresolved';
      if (t.flags & ts.TypeFlags.NumberLike) hazard = true;
    }
    return hazard ? 'hazard' : 'safe';
  }

  if (f03Candidates.length === 0) {
    console.log(`✓ F03 coercion-blind round-trip verifies: none (strict-compare-vs-raw-input after a settings/flag read).`);
  } else {
    const tsconfigPath = resolve('packages/foundry-module/tsconfig.json');
    const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, dirname(tsconfigPath));
    const program = ts.createProgram({ rootNames: parsedConfig.fileNames, options: parsedConfig.options });
    const checker = program.getTypeChecker();

    for (const c of f03Candidates) {
      const sourceFile = program.getSourceFile(resolve(c.path));
      const type = sourceFile ? resolveFieldType(sourceFile, checker, c.lineIndex, c.field) : undefined;
      const classification = classifyType(type);
      if (classification === 'safe') continue; // auto-proved safe — no annotation needed
      if (classification === 'unresolved' && c.manualSafe) continue; // documented override valve
      f03Offenders.push({ ...c, classification });
      fail = 1;
    }

    if (f03Offenders.length === 0) {
      console.log(`✓ F03 coercion-blind round-trip verifies: none (type-checker-cleared: every candidate resolves to a string/enum type, no number/boolean coercion hazard).`);
    } else {
      console.error(`❌ F03-class strict compare found in ${f03Offenders.length} location(s):`);
      for (const o of f03Offenders) console.error(`  ${o.path}:${o.line} [${o.classification}] — ${o.source}`);
      console.error(
        `\nFix: use verifyScalarWrite(actual, expected, token) from utils/verifyWrite.ts (coercion-tolerant), ` +
          `wrap both sides in String()/Number()/Boolean(), or — for a verified-correct strict compare the checker ` +
          `cannot itself resolve — annotate the line with "// F03-SAFE: <reason>".`,
      );
    }
  }
}

// ── Rule 4 (helper-decay, mcp_code_quality_v2 Phase C2 task 6.3): banned local redefinitions ──
//
// The C2 task-2.1/2.2 sweep consolidated Envelope<T>/isGM/getGame/getCanvas/settlePoll into
// handlers/modules/_shared/{handler-utils,settle-poll}.ts (44/34/21/9/2 local copies → 0).
// This class regrows with every new module dir (isGM/Envelope regrew between 07-01 and 07-02;
// augur-nexus branded-ids decayed 22→30) — ban fresh local definitions outside _shared/.
// getCanvasOrThrow() wrappers (scene-atmosphere) are deliberately NOT banned — different name,
// documented byte-drift disposition (phaseC2_byte_drift_check.md).

if (shouldRun('helper-decay')) {
  const DECAY_PATTERNS = [
    { re: /^(?:export\s+)?(?:type|interface)\s+Envelope</, what: 'local Envelope<T> type' },
    { re: /^(?:export\s+)?(?:async\s+)?function\s+isGM\s*\(/, what: 'local isGM()' },
    { re: /^(?:export\s+)?(?:async\s+)?function\s+getGame\s*\(/, what: 'local getGame()' },
    { re: /^(?:export\s+)?(?:async\s+)?function\s+getCanvas\s*\(/, what: 'local getCanvas()' },
    { re: /^(?:export\s+)?(?:async\s+)?function\s+settlePoll\s*[<(]/, what: 'local settlePoll()' },
  ];
  const decayOffenders = [];

  for (const path of walkTs(MODULES_DIR)) {
    if (path.includes('_shared')) continue;
    if (path.includes('__tests__')) continue;
    const lines = readFileSync(path, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
      for (const { re, what } of DECAY_PATTERNS) {
        if (re.test(line)) {
          decayOffenders.push({ path, line: i + 1, what });
          fail = 1;
        }
      }
    });
  }

  if (decayOffenders.length === 0) {
    console.log(`✓ Helper-decay: no local Envelope/isGM/getGame/getCanvas/settlePoll redefinitions outside _shared/.`);
  } else {
    console.error(`❌ Helper-decay: banned local redefinition(s) in ${decayOffenders.length} location(s):`);
    for (const o of decayOffenders) console.error(`  ${o.path}:${o.line} — ${o.what}`);
    console.error(
      `\nFix: import from handlers/modules/_shared/handler-utils.js (Envelope/isGM/getGame/getCanvas) ` +
        `or _shared/settle-poll.js (settlePoll) instead of redefining locally.`,
    );
  }
}

// ── Rule 5 (CONFIRM-GATE, systemic_bug_class_prevention v2 Phase 1 task 7.1): hardcoded ────────
// confirm literals in vault skill assets ────────────────────────────────────────────────────────
//
// BUG-804's class: a `.claude/skills/**/assets/**` file (ANY depth — module-animation's own
// BUG-804 asset sits one level deeper than a shallow `skills/*/assets/` glob would reach, at
// `module-animation/autoanimations/assets/idioms/...`) ships a literal `"confirm": true` or
// `"confirmedExecution": true` — the vault's historical field-naming split, both spellings
// flagged — hardcoding past a destructive in-world MCP call's confirm gate instead of letting the
// LLM caller supply it only after presenting blast radius to the user live.
//
// Cross-repo path resolution: D:\foundry-vtt-mcp has no relative-path relationship to the vault's
// `.claude/skills` tree (different drive), so the vault skills root is resolved with a
// lint-skills.mjs-style resolveSkillsRoot() chain, adapted (not imported — independent CLI tools)
// into this script:
//   1. CLI arg: `node scripts/check-source-pattern.mjs <skills-root>`
//   2. env var: WFRP_SKILLS_ROOT
//   3. relative-adjacent guess: `<repo>/../../warhammer_system/.claude/skills`
//   4. hardcoded fallback: `E:/warhammer_system/.claude/skills`
//
// Suppression: a flagged file containing a same-file GATE-SUPPRESS[<rule-id>]: <reason> anchor
// using this rule's id is skipped, not offended (HC7 convention; this rule's id is confirm-gate).
// NOTE: this doc block deliberately spells the anchor grammar with a `<rule-id>` placeholder
// (never this rule's id substituted contiguously into the bracket form) so this file's own header
// prose does not match run-gates.mjs's suppression census — the same convention used by
// warhammer-mcp-quality-contract.md §0 (2026-08-20 lesson: a checker documenting its own
// suppression syntax literally would otherwise inflate its own census).

if (shouldRun('confirm-gate')) {
  const resolveSkillsRoot = () => {
    // NOTE: reads the flag-filtered `positionalArgs`, not raw `process.argv` — a bare
    // `--skip write-order` invocation must resolve identically to the unfiltered bare invocation
    // (see the CLI filters block above the Rule 1 section).
    if (positionalArgs[0]) return resolve(positionalArgs[0]);
    if (process.env.WFRP_SKILLS_ROOT) return resolve(process.env.WFRP_SKILLS_ROOT);
    const candidates = [
      resolve(__dirname, '..', '..', 'warhammer_system', '.claude', 'skills'),
      'E:/warhammer_system/.claude/skills',
    ];
    for (const c of candidates) {
      if (existsSync(c)) return c;
    }
    return candidates[0];
  };

  /** Recursively collect .json/.md files that sit under an `assets` path segment at ANY depth. */
  const walkAssetCandidates = (dir, rootLen, out) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return out;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules') continue;
        walkAssetCandidates(full, rootLen, out);
      } else if (entry.isFile() && (entry.name.endsWith('.json') || entry.name.endsWith('.md'))) {
        const relSegments = full.slice(rootLen).split(/[\\/]+/);
        if (relSegments.includes('assets')) out.push(full);
      }
    }
    return out;
  };

  const CONFIRM_GATE_PATTERNS = [/"confirm"\s*:\s*true/, /"confirmedExecution"\s*:\s*true/];
  const CONFIRM_GATE_SUPPRESS = /GATE-SUPPRESS\[confirm-gate\]:/;
  const confirmGateOffenders = [];

  const skillsRoot = resolveSkillsRoot();
  const skillsRootMissing = !existsSync(skillsRoot);
  if (!skillsRootMissing) {
    const assetFiles = walkAssetCandidates(skillsRoot, skillsRoot.length, []);
    for (const path of assetFiles) {
      const content = readFileSync(path, 'utf8');
      if (CONFIRM_GATE_SUPPRESS.test(content)) continue;
      const lines = content.split(/\r?\n/);
      lines.forEach((line, idx) => {
        if (CONFIRM_GATE_PATTERNS.some((re) => re.test(line))) {
          confirmGateOffenders.push({ path, line: idx + 1, text: line.trim() });
          fail = 1;
        }
      });
    }
  }

  if (skillsRootMissing) {
    // F01 (piv-validator, systemic_bug_class_prevention v2 Phase 1): a resolved-but-nonexistent
    // skillsRoot must never read as a clean scan — the rule scanned nothing and that is a failure
    // of its own scoping condition, not a pass on its firing condition.
    console.error(`⚠ CONFIRM-GATE: skills root not found at ${skillsRoot} — rule did not run.`);
    fail = 1;
  } else if (confirmGateOffenders.length === 0) {
    console.log(
      `✓ CONFIRM-GATE: no hardcoded "confirm": true / "confirmedExecution": true literals under **/assets/** in ${skillsRoot}.`,
    );
  } else {
    console.error(`❌ CONFIRM-GATE: hardcoded confirm literal found in ${confirmGateOffenders.length} location(s):`);
    for (const o of confirmGateOffenders) {
      console.error(`  ${o.path}:${o.line}`);
      console.error(`    ${o.text}`);
    }
    console.error(
      `\nFix: never hardcode a destructive in-world MCP call's confirm field inside a shipped skill asset — ` +
        `let the LLM caller present blast radius live and supply confirm:true only after approval ` +
        `(see requireConfirm()/destructiveConfirmField() in services/shared/destructive-confirm.ts). ` +
        `To suppress a verified-safe instance, add a same-file GATE-SUPPRESS[<rule-id>]: <reason> anchor ` +
        `using this rule's id (confirm-gate).`,
    );
  }
}

// ── Rule 6 (WRITE-ORDER, systemic_bug_class_prevention v2 Phase 2 task 6.1): ordered-write ────────
// helper/anchor requirement for multi-write files ──────────────────────────────────────────────────
//
// BUG-677 (executeTemplatePlan), BUG-711 (add-item-from-compendium duplicate creates), and
// BUG-797 (autoanimations flag-write races) share one root class: a file performs ≥2 raw
// document-write calls (`.update(`, `.createEmbeddedDocuments(`, `.updateEmbeddedDocuments(`,
// `.deleteEmbeddedDocuments(`, `.delete(`) with no ordering/rollback contract and no natural-key
// retry guard — a mid-sequence failure, or a timed-out-then-retried call, can leave documents
// partially written or duplicate a create. The fix primitive is `services/shared/resume-boundary.ts`
// (`runWriteSteps()` for ordered writes with rollback, `precheckAlreadyApplied()` for natural-key
// retry guards) — Phase 2's helper. A file adopting neither must instead carry a same-file
// `// WRITE-ORDER: <justification>` anchor within its first 50 lines (same trust model as
// DIALOG-PATH/Rule 2 above: this rule checks anchor PRESENCE only, never anchor truth — that is
// an L3 human/reviewer judgment, HC3's stated trust boundary).
//
// Same-repo scan (packages/foundry-module/src/services/ + src/handlers/, both trees, recursive,
// reuses the shared walkTs() helper which already skips __tests__/node_modules) — no cross-repo
// path resolution needed here, unlike Rule 5's vault-skills-root case.
//
// Suppression: a same-file GATE-SUPPRESS[<rule-id>]: <reason> anchor using this rule's id
// (write-order) is checked FIRST — before the write-call count — so a suppressed file is
// genuinely invisible to the offender count, mirroring Rule 5's suppress-check-first ordering
// (HC7 convention). NOTE: this doc block deliberately spells the anchor grammar with a
// `<rule-id>` placeholder for the same self-referential-match reason documented at Rule 5's
// header above — this file's own header prose must not trip run-gates.mjs's suppression census.
if (shouldRun('write-order')) {
  const SERVICES_DIR = 'packages/foundry-module/src/services';
  const WRITE_ORDER_SCAN_DIRS = [SERVICES_DIR, HANDLERS_DIR];
  const WRITE_CALL_PATTERNS = [
    /\.update\(/g,
    /\.createEmbeddedDocuments\(/g,
    /\.updateEmbeddedDocuments\(/g,
    /\.deleteEmbeddedDocuments\(/g,
    /\.delete\(/g,
  ];
  const WRITE_ORDER_ANCHOR = /^\/\/\s*WRITE-ORDER:\s*(\S.*)$/m;
  const WRITE_ORDER_SUPPRESS = /GATE-SUPPRESS\[write-order\]:/;

  /** Count total write-call regex matches (summed across all 5 patterns) in the whole file. */
  const countWriteCalls = (src) => {
    let total = 0;
    for (const re of WRITE_CALL_PATTERNS) {
      const matches = src.match(re);
      if (matches) total += matches.length;
    }
    return total;
  };

  const writeOrderOffenders = [];
  const writeOrderMissingDirs = [];

  for (const dir of WRITE_ORDER_SCAN_DIRS) {
    if (!existsSync(dir)) {
      writeOrderMissingDirs.push(dir);
      continue;
    }
    for (const path of walkTs(dir)) {
      const src = readFileSync(path, 'utf8');
      if (WRITE_ORDER_SUPPRESS.test(src)) continue; // suppressed — invisible to the count
      const writeCallCount = countWriteCalls(src);
      if (writeCallCount < 2) continue;
      if (src.includes('runWriteSteps(') || src.includes('precheckAlreadyApplied(')) continue;
      const first50 = src.split(/\r?\n/).slice(0, 50).join('\n');
      if (WRITE_ORDER_ANCHOR.test(first50)) continue;
      writeOrderOffenders.push({ path: path.replace(/\\/g, '/'), writeCallCount });
      fail = 1;
    }
  }

  if (writeOrderMissingDirs.length > 0) {
    // F01 (piv-validator, systemic_bug_class_prevention v2 Phase 1): a resolved-but-nonexistent
    // scan dir must never read as a clean scan — same posture as Rule 5's skillsRootMissing branch.
    for (const dir of writeOrderMissingDirs) {
      console.error(`⚠ WRITE-ORDER: scan dir not found: ${dir} — rule did not run against it.`);
    }
    fail = 1;
  } else if (writeOrderOffenders.length === 0) {
    console.log(
      `✓ WRITE-ORDER: every ≥2-write-call file under services/ + handlers/ carries runWriteSteps()/precheckAlreadyApplied() or a justified anchor.`,
    );
  } else {
    console.error(`❌ WRITE-ORDER: ${writeOrderOffenders.length} file(s) with ≥2 write calls and no ordering contract:`);
    for (const o of writeOrderOffenders) {
      console.error(`  ${o.path}:${o.writeCallCount}`);
      console.error(
        `    ${o.writeCallCount} write-call matches, no runWriteSteps()/precheckAlreadyApplied()/WRITE-ORDER anchor/suppression`,
      );
    }
    console.error(
      `\nFix: wrap the write sequence in runWriteSteps() (services/shared/resume-boundary.ts), guard the ` +
        `natural key with precheckAlreadyApplied(), or — for a verified-safe ordering — add ` +
        `"// WRITE-ORDER: <justification>" within the file's first 50 lines. To suppress a verified-safe ` +
        `instance, add a same-file GATE-SUPPRESS[<rule-id>]: <reason> anchor using this rule's id (write-order).`,
    );
  }
}

process.exit(fail);
