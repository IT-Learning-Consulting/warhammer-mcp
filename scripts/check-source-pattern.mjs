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
// Run from repo root: node scripts/check-source-pattern.mjs
// Exit codes: 0 = clean, 1 = antipattern/missing-header found.

import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import ts from 'typescript';

const HANDLERS_DIR = 'packages/foundry-module/src/handlers';
const MODULES_DIR = join(HANDLERS_DIR, 'modules');

// ── Rule 1: F08 _source antipattern (top-level handlers/*.ts only, unchanged) ─────────────────
//
// We deliberately scan for the antipattern shape, not for `_source` presence,
// so that the alternative `(<var>._source as any)?.[<field>]` is OK.
const ANTIPATTERN = /\((note|token|region|scene|template|light|sound|tile|persisted)\s+as\s+any\)\s*\[(field|"[^"]+"|'[^']+')\]/;

let fail = 0;
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

// ── Rule 4 (helper-decay, mcp_code_quality_v2 Phase C2 task 6.3): banned local redefinitions ──
//
// The C2 task-2.1/2.2 sweep consolidated Envelope<T>/isGM/getGame/getCanvas/settlePoll into
// handlers/modules/_shared/{handler-utils,settle-poll}.ts (44/34/21/9/2 local copies → 0).
// This class regrows with every new module dir (isGM/Envelope regrew between 07-01 and 07-02;
// augur-nexus branded-ids decayed 22→30) — ban fresh local definitions outside _shared/.
// getCanvasOrThrow() wrappers (scene-atmosphere) are deliberately NOT banned — different name,
// documented byte-drift disposition (phaseC2_byte_drift_check.md).

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

process.exit(fail);
