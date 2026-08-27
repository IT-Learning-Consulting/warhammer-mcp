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
// Four rules:
//   1. schema           — for each allowlisted tool that declares a concrete `outcome` property in its
//                          published outputSchema, its `.enum` must equal the 5-value OutcomeValue set
//                          exactly. Tools with no outputSchema, or an empty-passthrough outputSchema
//                          (the region/MATT/imperial-arcana carve-out, D5), are skipped — not offenders.
//   1b. schema-presence  — systemic_bug_class_prevention v2 Phase 3, D6. Rule 1 above is silent (not an
//       + wire-emission     offender) when an allowlisted tool declares NO outputSchema at all — exactly
//                          the BUG-869 gap (modify-item-qualities emitted an `outcome` from its handler
//                          that never reached the wire, and rule 1 couldn't see it because it only
//                          inspects tools that already declare an outputSchema). Rule 1b closes that
//                          blind spot: for EVERY allowlisted tool, (a) its published def MUST declare
//                          an outputSchema — an empty-passthrough schema counts, same as rule 1's own
//                          carve-out semantics, this only checks presence, not enum-exactness (rule 1
//                          still owns that); AND (b) its mcp-server tool source file must contain a
//                          literal `structuredContent` emission (source grep via the NEW
//                          TOOL_STRUCTURED_CONTENT_FILES map below — distinct from TOOL_HANDLER_FILES,
//                          which maps to the foundry-module SIDE). Either (a) or (b) absent is a HARD
//                          offender — same severity class as rules 1/2. RULE_1B_CARVEOUTS is the named,
//                          justified-exception escape hatch (R3.8): a tool legitimately cannot emit
//                          structuredContent (an SDK limitation) goes here, WITH justification in a
//                          comment — never as a shortcut for "hasn't been retrofitted yet".
//   2. builder-usage     — each allowlisted tool's known foundry-module handler file(s) must contain at
//                          least one call from BUILDER_TOKENS (`buildOutcomeResponse(` or, per D7,
//                          `runWriteSteps(` — apply-template's outcome is produced by the
//                          resume-boundary.ts runWriteSteps composer, not buildOutcomeResponse; verified
//                          live, systemic_bug_class_prevention v2 task 5.1). The tool -> handler-file map
//                          below is the plan's own "Files to Modify" list (systemic-bug-class-prevention-
//                          phase3-write-verification.md), not re-derived by convention-guessing.
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

// The plan's own "Files to Modify" list (systemic-bug-class-prevention-phase3-success-semantics.md,
// extended by systemic-bug-class-prevention-phase3-write-verification.md task 5.1) — grounded, not
// guessed. Paths are relative to packages/foundry-module/src/.
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
  // Phase 3 (systemic_bug_class_prevention v2) Q1=B adoption sweep, task 5.1(c):
  'apply-template': ['services/template-apply.ts'],
  'add-item-from-compendium': ['services/item.ts'],
  'module-tokenizer': ['handlers/modules/tokenizer/tokenizer.ts'],
  'module-wfrp-economy': ['handlers/modules/wfrp-economy/wfrp-economy.ts'],
};

// Rule 1b's structuredContent-emission source map — the mcp-server-SIDE tool definition file for each
// allowlisted tool (distinct from TOOL_HANDLER_FILES, which is the foundry-module-side handler; a tool
// can call buildOutcomeResponse()/runWriteSteps() in its handler and STILL never wire the resulting
// `outcome` onto the wire if its mcp-server tool class never sets `structuredContent` on its return —
// exactly BUG-869). Repo-root-relative (these files live under packages/mcp-server/src/tools/, outside
// MODULE_SRC, so they can't share TOOL_HANDLER_FILES' MODULE_SRC-relative convention).
const TOOL_STRUCTURED_CONTENT_FILES = {
  'add-active-effect': ['packages/mcp-server/src/tools/add-active-effect.ts'],
  'modify-item-qualities': ['packages/mcp-server/src/tools/modify-item-qualities.ts'],
  'apply-npc-career-advance': ['packages/mcp-server/src/tools/apply-npc-career-advance.ts'],
  'module-matt': ['packages/mcp-server/src/tools/modules/monks-active-tiles/matt.ts'],
  'module-itempiles': ['packages/mcp-server/src/tools/modules/item-piles/item-piles.ts'],
  'module-sequencer': ['packages/mcp-server/src/tools/modules/sequencer/sequencer.ts'],
  'module-autoanimations': ['packages/mcp-server/src/tools/modules/autoanimations/autoanimations.ts'],
  'apply-template': ['packages/mcp-server/src/tools/apply-template.ts'],
  'add-item-from-compendium': ['packages/mcp-server/src/tools/add-item-from-compendium.ts'],
  'module-tokenizer': ['packages/mcp-server/src/tools/modules/tokenizer/tokenizer.ts'],
  'module-wfrp-economy': ['packages/mcp-server/src/tools/modules/wfrp-economy/wfrp-economy.ts'],
};

// Rule 1b carve-out list (D6/R3.8) — initially empty. Admission bar: a tool goes here ONLY when it can
// be shown that it legitimately cannot emit structuredContent (a genuine SDK/transport limitation),
// with the justification written inline as a comment next to its entry. Never add a tool here merely
// because it hasn't been retrofitted with outputSchema/structuredContent yet — that omission is
// precisely the defect class this rule exists to catch, and papering over it here is a shortcut this
// list is explicitly not for.
export const RULE_1B_CARVEOUTS = [];

// Additional accounted files for rule 3 beyond TOOL_HANDLER_FILES' foundry-module handlers — the
// mcp-server-side tool file for an allowlisted tool, when that tool's own retrofit touched it
// directly (e.g. BUG-692 adding structuredContent to apply-npc-career-advance.ts). Repo-root-relative.
const ADDITIONAL_ACCOUNTED_FILES = [
  'packages/mcp-server/src/tools/apply-npc-career-advance.ts',
  // Phase 3 (systemic_bug_class_prevention v2), tasks 3.2/4.2/5.2: retrofitted directly, same reason.
  'packages/mcp-server/src/tools/modify-item-qualities.ts',
  'packages/mcp-server/src/tools/modules/tokenizer/tokenizer.ts',
  'packages/mcp-server/src/tools/modules/item-piles/item-piles.ts',
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
                        (tools with no outputSchema, or an empty-passthrough one, are skipped here)
  1b. schema-presence  every allowlisted tool MUST (a) declare SOME outputSchema (empty-passthrough
      + wire-emission  counts) and (b) emit structuredContent from its mcp-server tool source — either
                        absent is a HARD offender (D6); RULE_1B_CARVEOUTS is the named exception list
  2. builder-usage      allowlisted tool's handler file(s) call buildOutcomeResponse( or runWriteSteps(
  3. coverage-assertion git-diff'd handler/tool files not covered by the allowlist or a
                        // GATE-SUPPRESS[success-semantics]: anchor are ratcheted as baseline entries
`);
}

export function loadAllowlist() {
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

// Exported so the fixture test (outcome-field-fixtures.test.ts, task 5.1's "GREEN on the real tree"
// case) can build a REAL defsByName from the built dist without duplicating this dist-walk-and-import
// logic — same reuse convention as the other exported rule functions.
export async function collectToolDefs() {
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

/** Rule 1b(a) — outputSchema PRESENCE (not enum-exactness; rule 1 still owns that). Unlike rule 1's
 *  `schemaOffenderFor`, absence of any outputSchema at all IS the offense here — that is the whole
 *  point of this rule (D6). An empty-passthrough outputSchema (any truthy object) counts as declared. */
function outputSchemaPresenceOffenderFor(toolName, def) {
  if (def && typeof def === 'object' && def.outputSchema != null && typeof def.outputSchema === 'object') {
    return null;
  }
  const rel = TOOL_HANDLER_FILES[toolName]?.[0] ?? `${toolName}.ts`;
  return { file: `${MODULE_SRC_REL}/${rel}`, detail: `tool "${toolName}": no outputSchema declared at all — rule 1b requires at least an empty-passthrough schema` };
}

/** Rule 1b(b) — structuredContent SOURCE emission. `readFile` is injectable, same convention as rule 2's
 *  `checkBuilderUsageRule`, so the fixture test can seed red/green content without disk I/O. */
function structuredContentOffenderFor(toolName, readFile) {
  const files = TOOL_STRUCTURED_CONTENT_FILES[toolName];
  if (!files) {
    return { file: `${toolName}.ts`, detail: `tool "${toolName}" is allowlisted but has no known mcp-server tool-file mapping for the rule 1b structuredContent check` };
  }
  for (const rel of files) {
    const full = path.resolve(REPO_ROOT, rel);
    let content;
    try {
      content = readFile(full, rel, toolName);
    } catch {
      continue;
    }
    if (content.includes('structuredContent')) return null;
  }
  return { file: files[0], detail: `tool "${toolName}": no structuredContent emission found in ${files.join(', ')}` };
}

/** Rule 1b — schema-presence + structuredContent-emission (D6). `carveOuts` is injectable (defaults to
 *  the real RULE_1B_CARVEOUTS constant) so the fixture test can prove the carve-out mechanism without
 *  mutating the real, always-empty-by-default exported list. A carved-out tool is skipped entirely —
 *  neither check runs for it. */
export function checkRule1b(
  allowlist,
  defsByName,
  readFile = (full) => readFileSync(full, 'utf8'),
  carveOuts = RULE_1B_CARVEOUTS,
) {
  const offenders = [];
  for (const toolName of allowlist) {
    if (carveOuts.includes(toolName)) continue;
    const schemaOffender = outputSchemaPresenceOffenderFor(toolName, defsByName.get(toolName));
    if (schemaOffender) offenders.push(schemaOffender);
    const contentOffender = structuredContentOffenderFor(toolName, readFile);
    if (contentOffender) offenders.push(contentOffender);
  }
  return offenders;
}

// Rule 2's accepted builder-token set (D7): each allowlisted tool's foundry-module handler file(s) must
// contain at least one of these literal call tokens. `buildOutcomeResponse(` is the original idiom;
// `runWriteSteps(` was added because apply-template's outcome is produced by Phase 2's
// resume-boundary.ts runWriteSteps composer, not buildOutcomeResponse — services/template-apply.ts
// imports runWriteSteps and contains zero buildOutcomeResponse( calls (verified live, task 5.1: 1 vs 0
// via a Node file read + `grep -a`, since the file carries a pre-existing NUL byte, BUG-878, that makes
// plain `rg`/`grep` treat it as binary and silently return 0 matches for either token).
const BUILDER_TOKENS = ['buildOutcomeResponse(', 'runWriteSteps('];

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
      if (BUILDER_TOKENS.some((token) => content.includes(token))) {
        found = true;
        break;
      }
    }
    if (!found) {
      offenders.push({ file: `${MODULE_SRC_REL}/${files[0]}`, detail: `tool "${toolName}": no ${BUILDER_TOKENS.join(' or ')} call found in ${files.join(', ')}` });
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
  const rule1bOffenders = checkRule1b(allowlist, defsByName);
  const builderOffenders = checkBuilderUsageRule(allowlist);
  const coverageOffenders = checkCoverageAssertionRule(allowlist);

  const hardOffenders = [...schemaOffenders, ...rule1bOffenders, ...builderOffenders];

  if (jsonMode) {
    console.log(JSON.stringify({ schema: schemaOffenders, rule1b: rule1bOffenders, builderUsage: builderOffenders, coverageAssertion: coverageOffenders }, null, 2));
  } else {
    console.log(`check-outcome-field: ${allowlist.length} allowlisted tool(s) checked.`);
    if (hardOffenders.length === 0) console.log('PASS: schema + rule 1b + builder-usage rules clean.');
  }

  // Offender lines (stderr, `  <path>.ts` — exactly 2 leading spaces) for ALL four rules, including
  // the ratcheted coverage-assertion ones, so the runner's per-file-parse baseline sees them all.
  if (hardOffenders.length > 0 || coverageOffenders.length > 0) {
    console.error(`\n${hardOffenders.length} offender(s) (schema + rule 1b + builder-usage), ${coverageOffenders.length} ratcheted coverage-assertion entry(ies):\n`);
    for (const o of [...hardOffenders, ...coverageOffenders]) {
      console.error(`  ${o.file}`);
      console.error(`    - ${o.detail}`);
    }
  }

  // Only rules 1+1b+2 (schema, schema-presence/structuredContent, builder-usage) can fail this script —
  // rule 3 is ratcheted (D3), never hard-fails.
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
