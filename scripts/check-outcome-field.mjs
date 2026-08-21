// check-outcome-field.mjs — MCP Systemic Bug-Class Prevention v1, Phase 3 (HC4 / ADR-005 / quality-
// contract §10). Static gate: does every Phase-3-retrofitted write tool actually carry the `outcome`
// discriminator, both in its published outputSchema and in its handler's runtime behavior?
//
// Architectural model (D4): dist-import + Ajv, mirroring check-output-schema-conformance.mjs — NOT
// check-zod-inputschema-parity.mjs (only `compareTool` is exported from that file; its `unwrap` /
// `isOptionalField` / `discriminatorLiteral` helpers are unexported and unusable here). This checker
// does no Zod introspection at all — rule 1 reads the already-generated outputSchema JSON literal, so
// the ZodEffects/ZodOptional peel trap the Zod parity checker hit does not apply. Deliberate omission,
// not an oversight.
//
// Three rules:
//   1. schema           — for each allowlisted tool that declares a concrete `outcome` property in its
//                          published outputSchema, its `.enum` must equal the 5-value OutcomeValue set
//                          exactly. Tools with no outputSchema, or an empty-passthrough outputSchema
//                          (the region/MATT/imperial-arcana carve-out, D5), are skipped — not offenders.
//   2. builder-usage     — each allowlisted tool's known foundry-module handler file(s) must contain at
//                          least one `buildOutcomeResponse(` call. The tool -> handler-file map below is
//                          the plan's own "Files to Modify" list (systemic-bug-class-prevention-phase3-
//                          success-semantics.md), not re-derived by convention-guessing.
//   3. coverage-assertion — `git diff --name-only` over handler/tool source dirs, cross-checked against
//                          the allowlist's mapped files and `// GATE-SUPPRESS[success-semantics]:` anchors.
//                          Per D3, an unrepresented diffed file is a RATCHETED baseline entry, not a
//                          hard failure — it never flips this script's own exit code. (git-diff alone
//                          over-includes: it would conscript every file Phase 2's schema-only retrofit
//                          touched. Allowlist alone under-covers: an author can forget to declare a
//                          tool. Composed, each covers the other's blind spot.)
//
// Offender lines go to STDERR, format `  <relative/path>.ts` (exactly 2 leading spaces, no other
// prefix) — the exact shape run-gates.mjs's per-file-parse counting scans for (combined stdout+stderr).

import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..');
const MODULE_SRC = path.resolve(REPO_ROOT, 'packages', 'foundry-module', 'src');
const TOOLS_DIST = path.resolve(REPO_ROOT, 'packages', 'mcp-server', 'dist', 'tools');
const ALLOWLIST_PATH = path.resolve(HERE, 'outcome-field-allowlist.json');
// Repo-root-relative prefix, matching the convention every other checker's offender paths use
// (e.g. contract-drift's "packages/mcp-server/src/tools/actor-config.ts").
const MODULE_SRC_REL = 'packages/foundry-module/src';

export const OUTCOME_VALUES = ['applied', 'alreadyApplied', 'noop', 'partial', 'failed'];

// The plan's own "Files to Modify" list (systemic-bug-class-prevention-phase3-success-semantics.md) —
// grounded, not guessed. Paths are relative to packages/foundry-module/src/.
const TOOL_HANDLER_FILES = {
  'add-active-effect': ['services/effects.ts'],
  'modify-item-qualities': ['services/item.ts'],
  'apply-npc-career-advance': ['services/actor.ts'],
  'module-matt': [
    'handlers/modules/monks-active-tiles/matt-reads.ts',
    'handlers/modules/monks-active-tiles/matt-sequence.ts',
    'handlers/modules/monks-active-tiles/matt-runtime.ts',
  ],
  'module-itempiles': [
    'handlers/modules/item-piles/verify-quantity.ts',
    'handlers/modules/item-piles/catalog.ts',
    'handlers/modules/item-piles/flow.ts',
    'handlers/modules/item-piles/merchant.ts',
  ],
  'module-sequencer': ['handlers/modules/sequencer/sequencer.ts'],
  'module-autoanimations': ['handlers/modules/autoanimations/autoanimations.ts'],
};

// Additional accounted files for rule 3 beyond TOOL_HANDLER_FILES' foundry-module handlers — the
// mcp-server-side tool file for an allowlisted tool, when that tool's own retrofit touched it
// directly (e.g. BUG-692 adding structuredContent to apply-npc-career-advance.ts). Repo-root-relative.
const ADDITIONAL_ACCOUNTED_FILES = [
  'packages/mcp-server/src/tools/apply-npc-career-advance.ts',
];

// Dirs whose diffed .ts files are in scope for rule 3.
const COVERAGE_DIRS = [
  path.resolve(REPO_ROOT, 'packages', 'foundry-module', 'src', 'handlers'),
  path.resolve(REPO_ROOT, 'packages', 'foundry-module', 'src', 'services'),
  path.resolve(REPO_ROOT, 'packages', 'mcp-server', 'src', 'tools'),
];

function printHelp() {
  console.log(`check-outcome-field.mjs — HC4 outcome-discriminator gate (Phase 3)

Usage: node check-outcome-field.mjs [--help] [--json]

Rules:
  1. schema            allowlisted tool's outputSchema.properties.outcome.enum matches the 5-value set
  2. builder-usage      allowlisted tool's handler file(s) call buildOutcomeResponse(
  3. coverage-assertion git-diff'd handler/tool files not covered by the allowlist or a
                        // GATE-SUPPRESS[success-semantics]: anchor are ratcheted as baseline entries
`);
}

function loadAllowlist() {
  const raw = JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8'));
  if (!Array.isArray(raw)) throw new Error(`${ALLOWLIST_PATH} must be a JSON array of tool names`);
  return raw;
}

function walkJs(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkJs(full));
    else if (e.isFile() && e.name.endsWith('.js')) out.push(full);
  }
  return out;
}

const stubLogger = { child: () => stubLogger, info: () => {}, warn: () => {}, error: () => {}, debug: () => {} };
const stubFoundryClient = {};

/** Instantiate one exported tool class and return its tool-definition array, or [] on any failure. */
function toolDefsFor(ExportedCtor) {
  if (typeof ExportedCtor !== 'function') return [];
  if (!ExportedCtor.prototype || typeof ExportedCtor.prototype.getToolDefinitions !== 'function') return [];
  try {
    const instance = new ExportedCtor({ foundryClient: stubFoundryClient, logger: stubLogger });
    return instance.getToolDefinitions() ?? [];
  } catch {
    return [];
  }
}

/** Import one compiled dist file and merge every tool def it exports into `defsByName`. */
async function collectDefsFromFile(file, defsByName) {
  let mod;
  try {
    mod = await import(pathToFileURL(file).href);
  } catch {
    return;
  }
  for (const exported of Object.values(mod)) {
    for (const def of toolDefsFor(exported)) {
      if (def?.name) defsByName.set(def.name, def);
    }
  }
}

async function collectToolDefs() {
  let files;
  try {
    files = walkJs(TOOLS_DIST);
  } catch (e) {
    console.error(`FATAL: cannot read ${TOOLS_DIST} — did the mcp-server build run first? ${e?.message ?? e}`);
    process.exit(2);
  }
  const defsByName = new Map();
  for (const file of files) await collectDefsFromFile(file, defsByName);
  return defsByName;
}

/** Rule 1 — schema. Returns offender strings (relative .ts-ish label; outputSchema has no source file,
 *  so we label offenders by tool name for readability but the runner's per-file-parse regex only fires
 *  on genuine `<path>.ts` lines, so schema offenders are reported via console.error with a `.ts`-suffixed
 *  synthetic label pointing at the tool's mapped handler file — keeps one offender-reporting convention. */
function outcomeEnumMatches(enumValues) {
  if (!Array.isArray(enumValues) || enumValues.length !== OUTCOME_VALUES.length) return false;
  return OUTCOME_VALUES.every((v) => enumValues.includes(v));
}

/** Returns an offender for one tool's `outcome` enum, or null if the tool is out of this rule's scope
 *  (no def found, no outputSchema, empty-passthrough (D5), or outputSchema simply omits `outcome`) or
 *  its enum already matches. */
function schemaOffenderFor(toolName, def) {
  const props = def?.outputSchema?.properties;
  if (!props || typeof props !== 'object' || !('outcome' in props)) return null;
  const enumValues = props.outcome?.enum;
  if (outcomeEnumMatches(enumValues)) return null;
  const rel = TOOL_HANDLER_FILES[toolName]?.[0] ?? `${toolName}.ts`;
  return { file: `${MODULE_SRC_REL}/${rel}`, detail: `tool "${toolName}": outputSchema.properties.outcome.enum is ${JSON.stringify(enumValues)}, expected ${JSON.stringify(OUTCOME_VALUES)}` };
}

export function checkSchemaRule(allowlist, defsByName) {
  const offenders = [];
  for (const toolName of allowlist) {
    const offender = schemaOffenderFor(toolName, defsByName.get(toolName));
    if (offender) offenders.push(offender);
  }
  return offenders;
}

/** Rule 2 — builder-usage. `readFile` is injectable (defaults to real readFileSync) so the fixture test
 *  can seed red/green content without touching the real handler files on disk. */
export function checkBuilderUsageRule(allowlist, readFile = (full) => readFileSync(full, 'utf8')) {
  const offenders = [];
  for (const toolName of allowlist) {
    const files = TOOL_HANDLER_FILES[toolName];
    if (!files) {
      offenders.push({ file: `${MODULE_SRC_REL}/${toolName}.ts`, detail: `tool "${toolName}" is allowlisted but has no known handler-file mapping in check-outcome-field.mjs` });
      continue;
    }
    let found = false;
    for (const rel of files) {
      const full = path.join(MODULE_SRC, rel);
      let content;
      try {
        content = readFile(full, rel, toolName);
      } catch {
        continue;
      }
      if (content.includes('buildOutcomeResponse(')) {
        found = true;
        break;
      }
    }
    if (!found) {
      offenders.push({ file: `${MODULE_SRC_REL}/${files[0]}`, detail: `tool "${toolName}": no buildOutcomeResponse( call found in ${files.join(', ')}` });
    }
  }
  return offenders;
}

/** Rule 3 — coverage-assertion. Ratcheted, never hard-fails this script. `diffedFiles` is injectable
 *  (defaults to a real `git diff --name-only HEAD`) so the fixture test can seed a synthetic diff list. */
export function checkCoverageAssertionRule(allowlist, diffedFiles = realGitDiffFiles()) {
  const mappedRelPaths = new Set([
    ...Object.values(TOOL_HANDLER_FILES).flat().map((rel) => path.posix.join('packages/foundry-module/src', rel)),
    ...ADDITIONAL_ACCOUNTED_FILES,
  ]);
  const offenders = [];
  for (const rel of diffedFiles) {
    if (!rel.endsWith('.ts')) continue;
    const abs = path.resolve(REPO_ROOT, rel);
    const inScope = COVERAGE_DIRS.some((dir) => abs.startsWith(dir + path.sep));
    if (!inScope) continue;
    if (mappedRelPaths.has(rel.split(path.sep).join('/'))) continue;
    // Unreadable (deleted, or a synthetic path) is treated as "no anchor found", not skipped — an
    // unrepresented file we can't even confirm has a suppression anchor still ratchets as an offender.
    let content = '';
    try {
      content = readFileSync(abs, 'utf8');
    } catch {
      content = '';
    }
    if (content.includes('// GATE-SUPPRESS[success-semantics]:')) continue;
    offenders.push({ file: rel, detail: `diffed handler/tool file not in the outcome-field allowlist and not GATE-SUPPRESS-anchored (ratcheted, not a hard failure)` });
  }
  return offenders;
}

function realGitDiffFiles() {
  try {
    const diffOut = execFileSync('git', ['diff', '--name-only', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8' });
    return diffOut.split('\n').map((l) => l.trim()).filter(Boolean);
  } catch (e) {
    console.error(`WARN: git diff failed, skipping coverage-assertion rule — ${e?.message ?? e}`);
    return [];
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }
  const jsonMode = args.includes('--json');

  const allowlist = loadAllowlist();
  const defsByName = await collectToolDefs();

  const schemaOffenders = checkSchemaRule(allowlist, defsByName);
  const builderOffenders = checkBuilderUsageRule(allowlist);
  const coverageOffenders = checkCoverageAssertionRule(allowlist);

  const hardOffenders = [...schemaOffenders, ...builderOffenders];

  if (jsonMode) {
    console.log(JSON.stringify({ schema: schemaOffenders, builderUsage: builderOffenders, coverageAssertion: coverageOffenders }, null, 2));
  } else {
    console.log(`check-outcome-field: ${allowlist.length} allowlisted tool(s) checked.`);
    if (hardOffenders.length === 0) console.log('PASS: schema + builder-usage rules clean.');
  }

  // Offender lines (stderr, `  <path>.ts` — exactly 2 leading spaces) for ALL three rules, including
  // the ratcheted coverage-assertion ones, so the runner's per-file-parse baseline sees them all.
  if (hardOffenders.length > 0 || coverageOffenders.length > 0) {
    console.error(`\n${hardOffenders.length} offender(s) (schema + builder-usage), ${coverageOffenders.length} ratcheted coverage-assertion entry(ies):\n`);
    for (const o of [...hardOffenders, ...coverageOffenders]) {
      console.error(`  ${o.file}`);
      console.error(`    - ${o.detail}`);
    }
  }

  // Only rules 1+2 (schema, builder-usage) can fail this script — rule 3 is ratcheted (D3), never hard-fails.
  process.exit(hardOffenders.length > 0 ? 1 : 0);
}

// Only run as a gate when invoked directly (`node check-outcome-field.mjs`), not when imported by
// the vitest fixture test (task 1.3) for unit-testing the three rule functions.
const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  main().catch((err) => {
    console.error('FATAL:', err?.stack || err);
    process.exit(2);
  });
}
