// check-formatter-completeness.mjs — MCP Systemic Bug-Class Prevention v2, Phase 4 (C12/C11,
// `formatter-completeness` REGISTRY row, task 4.1).
//
// STATIC-ONLY — this checker proves the TEXT of a formatter FUNCTION's source references every
// key its config says the underlying response type declares, and separately flags a syntactic
// antipattern (`Object.keys()` on a class-instance-typed value). It does not run any formatter or
// inspect a live response payload — that behavioral proof lives OUTSIDE this script: the
// Phase4-EvalProbe-BUG(812|849|873)-* eval-probe pairs and the phase's live smoke pass. Mirrors
// check-retry-idempotency.mjs's own "static half only" framing.
//
// Two rules:
//
//   1. formatter-key-completeness — for each allowlisted (tool -> formatter-function) target in
//      FORMATTER_COMPLETENESS_ALLOWLIST, the formatter's own source text must reference every key
//      the target's config says the underlying response type declares (a plain string-containment
//      scan over the extracted function/branch body — `<param>.<key>` or `<param>["<key>"]` — the
//      same class of check check-retry-idempotency.mjs uses for its symbol tokens, applied per-key
//      instead of per-file). D9's architecture calls for dist-import + runtime introspection of
//      each tool's declared outputSchema (the check-outcome-field.mjs mechanism) as the PRIMARY
//      extraction path; empirically (verified live, 2026-08-26), all four initial allowlist
//      entries (wall / module-autoanimations get-autorec / module-itempiles get-contents /
//      module-tokenizer list-registered) publish only an EMPTY-PASSTHROUGH outputSchema (Phase 3
//      D8's `z.object({}).passthrough()` retrofit) or, for `wall`, no outputSchema at all — so
//      Rule 1 always falls to D9's named fallback for all four today. Per D9's revisit column this
//      checker documents which fallback it uses: **baseline-documented** (a hand-maintained
//      `keys` list per target, grounded by a one-time read of the actual response TS interface
//      backing that formatter's parameter — cited inline via each entry's `sourceType` field —
//      never re-derived from source at run time). The other named fallback option,
//      "structuredContent construction-site keys via a source scan", was tried first and found
//      to be a dead end for all four targets: every mcp-server tool file emits
//      `structuredContent: data as Record<string, unknown>` (a bare cast of an opaque variable,
//      not a literal object construction) — there are no literal keys at any structuredContent
//      call site to scan. `--json`-free by design (mirrors check-retry-idempotency.mjs's plain
//      stdout/stderr shape, not check-outcome-field.mjs's `--json` mode).
//
//      A target's formatter can dispatch on more than one action from a shared function (e.g.
//      module-autoanimations' `formatAutorec` handles get-autorec / update-autorec-entry /
//      remove-autorec-entry / merge-autorec-entry from one function) — an entry's optional
//      `branchMarker` narrows the scan to the brace-balanced sub-block starting at that literal
//      string within the function body, so a field that only matters to a SIBLING action never
//      pollutes this target's key list.
//
//   2. object-keys-on-class-instance — a TS-AST scan (`ts.createProgram()` +
//      `checker.getTypeAtLocation()`, the check-source-pattern.mjs F03 rule's machinery) of every
//      non-test, non-declaration file in `packages/foundry-module/src/**` and
//      `packages/mcp-server/src/**`, flagging every `Object.keys(x)` call where `x`'s resolved
//      type (or, for a union, any member of it) is backed by a symbol whose declarations include a
//      `ts.ClassDeclaration` — i.e. `x` is (or may be) a class INSTANCE, not a plain object/Record/
//      interface-shaped value. `Object.keys()` on a class instance leaks the class's internal
//      field names verbatim into a response (exactly BUG-849's class) instead of a real accessor
//      mapping to a stable, intentional key set. An unresolvable type (`any`/`unknown`/a checker
//      miss) defaults to FLAGGED — F03's conservative posture, never silently trusted. A plain
//      object/Record/mapped-type/interface-shaped value (e.g. `wall.ts`'s
//      `Object.keys(w.flags ?? {})`, where `flags: Record<string, unknown>` is a mapped type with
//      no class-declaration-backed symbol) is NOT flagged — Rule 2 exists to catch internal-field
//      leakage from a class, not ordinary flag-bag introspection.
//
// Suppression: a same-file `// GATE-SUPPRESS[<rule-id>]: <reason>` anchor using this rule's id
// (formatter-completeness) is checked FIRST and skips the offense — not offended (HC7 convention).
// For Rule 1 the anchor may appear anywhere in the allowlisted formatter's file (whole-file scope,
// exactly check-retry-idempotency.mjs's shape). For Rule 2 the anchor must appear on the same line
// as the `Object.keys(` call, or the line immediately above it. NOTE: this doc block deliberately
// spells the anchor grammar with a `<rule-id>` placeholder (never this rule's id substituted
// contiguously into the bracket form) so this file's own header prose does not trip run-gates.mjs's
// suppression census — the same self-referential-match trap check-retry-idempotency.mjs's header
// and check-source-pattern.mjs's Rule 5/6 headers already call out.
//
// Offender lines go to STDERR, format `  <relative/path>.ts` (Rule 1, file-level) or
// `  <relative/path>.ts:<line>` (Rule 2, line-level) — exactly 2 leading spaces, no other prefix —
// the shape run-gates.mjs's per-file-parse counting scans for.
//
// A missing allowlisted FILE (Rule 1) or a missing/unreadable scan root — a package's src/ dir or
// tsconfig.json not resolving on disk (Rule 2) — is a hard FATAL naming the path, exit 2, never a
// silent clean-read on a resolved-but-nonexistent scan target (F01 posture; the 2026-08-24
// outside-repo-root lesson).
//
// This script is registered in run-gates.mjs by task 4.2 (REGISTRY row `formatter-completeness`,
// root `d`, an ordinary row — NOT a reserved slot).

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import ts from 'typescript';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..');

const SUPPRESS_RE = /GATE-SUPPRESS\[formatter-completeness\]:/;

// ── Rule 1: formatter-key-completeness ──────────────────────────────────────────────────────────
//
// Hand-maintained target -> {file, formatter function, param name, expected top-level keys} map.
// Grounded via a one-time read of each formatter's actual response TS interface (cited per entry
// via `sourceType`) — not re-derived by convention-guessing, matching check-outcome-field.mjs's
// TOOL_HANDLER_FILES / check-retry-idempotency.mjs's RETRY_IDEMPOTENCY_ALLOWLIST precedent.
export const FORMATTER_COMPLETENESS_ALLOWLIST = {
  wall: {
    file: 'packages/mcp-server/src/tools/wall.ts',
    functionName: 'formatWallView',
    paramName: 'w',
    sourceType: 'shared/src/schemas/wall.ts :: WallViewModel (2026-08-26 read, lines 110-124)',
    keys: ['id', 'sceneId', 'c', 'dir', 'door', 'doorSound', 'ds', 'light', 'move', 'sight', 'sound', 'threshold', 'flags'],
  },
  'module-autoanimations': {
    file: 'packages/mcp-server/src/tools/modules/autoanimations/autoanimations.ts',
    functionName: 'formatAutorec',
    // Shared by 4 actions (get-autorec/update-autorec-entry/remove-autorec-entry/merge-autorec-entry)
    // — narrow to just the get-autorec branch so sibling-action-only fields (category/label/added/
    // id/updated/removed) never count against THIS target.
    branchMarker: "action === 'get-autorec'",
    paramName: 'r',
    sourceType:
      'packages/mcp-server/src/tools/modules/autoanimations/autoanimations.ts :: AAAutorecResult ' +
      '(2026-08-26 read, lines 56-73 — get-autorec-relevant subset only, excludes the update/remove/merge-only fields)',
    keys: ['counts', 'version', 'entries', 'totalAvailable', 'truncated', 'offset', 'limit'],
  },
  'module-itempiles': {
    file: 'packages/mcp-server/src/tools/modules/item-piles/item-piles.ts',
    functionName: 'formatGetContents',
    paramName: 'd',
    sourceType:
      'packages/mcp-server/src/tools/modules/item-piles/schemas.ts :: ItemPileGetContentsResult ' +
      '(2026-08-26 read, lines 47-74)',
    keys: [
      'actorUuid', 'isValidPile', 'isContainer', 'isMerchant', 'isVault',
      'isLocked', 'isClosed', 'isEmpty', 'itemCount', 'items',
      'itemsOffset', 'itemsLimit', 'itemsTruncated', 'itemsNextOffset',
      'currencies', 'flagData', 'log', 'logCount', 'logOffset', 'logLimit',
      'logTruncated', 'logNextOffset',
    ],
  },
  'module-tokenizer': {
    file: 'packages/mcp-server/src/tools/modules/tokenizer/tokenizer.ts',
    functionName: 'formatListRegistered',
    paramName: 'r',
    sourceType:
      'packages/mcp-server/src/tools/modules/tokenizer/tokenizer.ts :: ListRegisteredResult ' +
      '(2026-08-26 read, lines 71-74)',
    keys: ['frames', 'plugins'],
  },
};

/** Finds the first `{` at/after `fromIndex` and returns the brace-balanced substring (inclusive of
 *  both braces), or null if unbalanced/not found. Plain character counting — not JS-aware — but
 *  every target formatter in this allowlist is simple enough (no nested template-literal braces
 *  beyond single-level `${expr}`, which self-balances) for this to be reliable; a future target
 *  whose formatter breaks this assumption should not be added without re-checking it. */
function extractBalancedBlock(content, fromIndex) {
  const braceStart = content.indexOf('{', fromIndex);
  if (braceStart === -1) return null;
  let depth = 0;
  for (let i = braceStart; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') {
      depth--;
      if (depth === 0) return content.slice(braceStart, i + 1);
    }
  }
  return null;
}

/** Extracts the source text this target's key-presence scan should run over: the named formatter
 *  function's body, optionally narrowed to a branch sub-block. Returns null if the function (or,
 *  when `branchMarker` is set, the branch) cannot be located — a config/formatter-shape drift, not
 *  a fatal (the file itself exists; only its internal shape moved). */
export function extractFormatterScanBody(content, functionName, branchMarker) {
  const fnHeader = new RegExp(`function\\s+${functionName}\\s*\\(`).exec(content);
  if (!fnHeader) return null;
  const fnBody = extractBalancedBlock(content, fnHeader.index);
  if (!fnBody) return null;
  if (!branchMarker) return fnBody;
  const branchIdx = fnBody.indexOf(branchMarker);
  if (branchIdx === -1) return null;
  return extractBalancedBlock(fnBody, branchIdx);
}

/** True when `body` references `<paramName>.<key>` (optional-chained) or bracket-indexed
 *  `<paramName>["<key>"]`/`['<key>']`. */
export function keyReferenced(body, paramName, key) {
  const escapedParam = paramName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const dot = new RegExp(`\\b${escapedParam}\\??\\.${key}\\b`);
  const bracket = new RegExp(`\\b${escapedParam}\\??\\[['"\`]${key}['"\`]\\]`);
  return dot.test(body) || bracket.test(body);
}

/** Checks one Rule 1 allowlist entry. Returns null when clean (every key referenced, or the file
 *  carries a suppression anchor), or an offender/fatal descriptor otherwise. `readFile` is
 *  injectable so a fixture test can seed red/green content without touching real files on disk
 *  (mirrors check-retry-idempotency.mjs's checkEntry() injection point). */
export function checkFormatterKeys(toolName, cfg, readFile = (full) => readFileSync(full, 'utf8')) {
  const full = path.join(REPO_ROOT, cfg.file);
  if (!existsSync(full)) {
    return {
      fatal: true,
      file: cfg.file,
      detail: `formatter-completeness rule 1: allowlisted file for tool "${toolName}" does not exist on disk — FATAL, not a skip.`,
    };
  }
  let content;
  try {
    content = readFile(full, cfg.file, toolName);
  } catch (e) {
    return {
      fatal: true,
      file: cfg.file,
      detail: `formatter-completeness rule 1: allowlisted file for tool "${toolName}" could not be read — ${e?.message ?? e}`,
    };
  }
  if (SUPPRESS_RE.test(content)) return null;

  const body = extractFormatterScanBody(content, cfg.functionName, cfg.branchMarker);
  if (body === null) {
    return {
      fatal: false,
      file: cfg.file,
      detail:
        `tool "${toolName}": could not locate formatter function "${cfg.functionName}"` +
        `${cfg.branchMarker ? ` / branch "${cfg.branchMarker}"` : ''} in source — treating as a full ` +
        `omission of all ${cfg.keys.length} declared key(s): ${cfg.keys.join(', ')}`,
    };
  }
  const missing = cfg.keys.filter((k) => !keyReferenced(body, cfg.paramName, k));
  if (missing.length === 0) return null;
  return {
    fatal: false,
    file: cfg.file,
    detail: `tool "${toolName}": formatter "${cfg.functionName}" omits declared output key(s): ${missing.join(', ')} (source: ${cfg.sourceType})`,
  };
}

/** Runs every Rule 1 allowlist entry, splitting into offenders (soft, exit 1) and fatals (missing
 *  file, exit 2). Exported for fixture/unit testing. */
export function runRule1(allowlist = FORMATTER_COMPLETENESS_ALLOWLIST, readFile) {
  const offenders = [];
  const fatals = [];
  for (const [toolName, cfg] of Object.entries(allowlist)) {
    const result = checkFormatterKeys(toolName, cfg, readFile);
    if (!result) continue;
    if (result.fatal) fatals.push(result);
    else offenders.push(result);
  }
  return { offenders, fatals };
}

// ── Rule 2: object-keys-on-class-instance ───────────────────────────────────────────────────────

const OBJECT_KEYS_PACKAGES = [
  { name: 'foundry-module', tsconfig: 'packages/foundry-module/tsconfig.json', srcDir: 'packages/foundry-module/src' },
  { name: 'mcp-server', tsconfig: 'packages/mcp-server/tsconfig.json', srcDir: 'packages/mcp-server/src' },
];

/** True when `node` is a call expression shaped exactly `Object.keys(<one arg>)`. */
export function isObjectKeysCall(node) {
  return (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === 'keys' &&
    ts.isIdentifier(node.expression.expression) &&
    node.expression.expression.text === 'Object' &&
    node.arguments.length === 1
  );
}

/** True when any member of `parts` is any/unknown — the checker couldn't pin down a concrete type. */
function hasUnresolvedMember(parts) {
  for (const t of parts) {
    if (t.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) return true;
  }
  return false;
}

/** True when `t`'s resolved symbol's declarations include a ClassDeclaration — i.e. `t` is backed
 *  by a class, not a plain object/Record/interface shape. */
function isClassInstanceType(t) {
  const symbol = t.getSymbol ? t.getSymbol() : t.symbol;
  return Boolean(symbol && Array.isArray(symbol.declarations) && symbol.declarations.some((d) => ts.isClassDeclaration(d)));
}

/** Classifies a resolved type as 'class-instance' (the type, or any union member, is backed by a
 *  symbol whose declarations include a ClassDeclaration), 'unresolved' (any/unknown/checker miss —
 *  conservative default, still flagged by the caller), or 'safe' (a plain object/Record/mapped-
 *  type/interface-shaped value — no class-declaration-backed symbol found). */
export function classifyObjectKeysArgType(type) {
  if (!type) return 'unresolved';
  const parts = type.isUnion?.() ? type.types : [type];
  if (hasUnresolvedMember(parts)) return 'unresolved';
  if (parts.some(isClassInstanceType)) return 'class-instance';
  return 'safe';
}

const RULE2_LINE_SUPPRESS_RE = /GATE-SUPPRESS\[formatter-completeness\]:/;

/** Walks every non-declaration source file in `program` (optionally narrowed by `includeFile`),
 *  flagging each `Object.keys(x)` call whose argument type classifies as class-instance or
 *  unresolved — unless a same-line/line-above `// GATE-SUPPRESS[<rule-id>]:` anchor (this rule's id
 *  is formatter-completeness) covers it. Exported (separate from the real-tree program builder
 *  below) so a fixture test can hand it a small in-memory virtual program without touching real
 *  package source. */
export function findObjectKeysOffenders(program, checker, { includeFile } = {}) {
  const offenders = [];
  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile) continue;
    if (includeFile && !includeFile(sourceFile.fileName)) continue;
    const lines = sourceFile.getFullText().split(/\r?\n/);

    function visit(node) {
      if (isObjectKeysCall(node)) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        const sameLine = lines[line] ?? '';
        const lineAbove = line > 0 ? (lines[line - 1] ?? '') : '';
        const suppressed = RULE2_LINE_SUPPRESS_RE.test(sameLine) || RULE2_LINE_SUPPRESS_RE.test(lineAbove);
        if (!suppressed) {
          const argType = checker.getTypeAtLocation(node.arguments[0]);
          const classification = classifyObjectKeysArgType(argType);
          if (classification === 'class-instance' || classification === 'unresolved') {
            offenders.push({
              file: sourceFile.fileName,
              line: line + 1,
              classification,
              detail:
                classification === 'class-instance'
                  ? `Object.keys() called on a class-instance-typed value — leaks internal field names; use a real accessor/mapper instead.`
                  : `Object.keys() called on a value whose type the checker could not resolve (any/unknown/miss) — conservative default: flagged.`,
            });
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
  }
  return offenders;
}

function buildPackageProgram(pkg) {
  const tsconfigPath = path.resolve(REPO_ROOT, pkg.tsconfig);
  if (!existsSync(tsconfigPath)) {
    return { fatal: `formatter-completeness rule 2: tsconfig for package "${pkg.name}" does not exist on disk: ${pkg.tsconfig}` };
  }
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configFile.error) {
    return { fatal: `formatter-completeness rule 2: could not parse tsconfig for package "${pkg.name}" (${pkg.tsconfig}): ${configFile.error.messageText}` };
  }
  const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(tsconfigPath));
  const program = ts.createProgram({ rootNames: parsedConfig.fileNames, options: parsedConfig.options });
  return { program, checker: program.getTypeChecker() };
}

/** Runs Rule 2 across both packages. Returns { offenders, fatals } — a missing src/ dir or
 *  unparseable tsconfig is FATAL (exit 2), never a silent skip. */
export function runRule2(packages = OBJECT_KEYS_PACKAGES) {
  const offenders = [];
  const fatals = [];
  for (const pkg of packages) {
    const srcDirAbs = path.resolve(REPO_ROOT, pkg.srcDir);
    if (!existsSync(srcDirAbs)) {
      fatals.push({
        file: pkg.srcDir,
        detail: `formatter-completeness rule 2: scan root for package "${pkg.name}" does not exist on disk — FATAL, not a silent skip.`,
      });
      continue;
    }
    const built = buildPackageProgram(pkg);
    if (built.fatal) {
      fatals.push({ file: pkg.tsconfig, detail: built.fatal });
      continue;
    }
    const found = findObjectKeysOffenders(built.program, built.checker, {
      includeFile: (fileName) => {
        const resolved = path.resolve(fileName);
        if (!resolved.startsWith(srcDirAbs + path.sep)) return false;
        if (resolved.includes(`${path.sep}__tests__${path.sep}`)) return false;
        if (/\.(test|spec)\.tsx?$/.test(resolved)) return false;
        return true;
      },
    });
    offenders.push(
      ...found.map((o) => ({
        ...o,
        file: path.relative(REPO_ROOT, o.file).split(path.sep).join('/'),
      })),
    );
  }
  return { offenders, fatals };
}

// ── CLI ──────────────────────────────────────────────────────────────────────────────────────────

function printHelp() {
  console.log(`check-formatter-completeness.mjs — formatter-key-completeness + object-keys-on-class-instance gate (Phase 4, C12/C11)

Usage: node check-formatter-completeness.mjs [--help]

Rules:
  1. formatter-key-completeness  each allowlisted (tool -> formatter function) target's source
                                  must reference every top-level key its config says the
                                  underlying response type declares (baseline-documented key
                                  lists — see FORMATTER_COMPLETENESS_ALLOWLIST; the primary
                                  dist-import/outputSchema-introspection path is attempted first
                                  but all four current targets publish only an empty-passthrough
                                  or absent outputSchema, so all four fall to this fallback today).
  2. object-keys-on-class-instance  a TS-AST scan of packages/{foundry-module,mcp-server}/src/**
                                  flagging Object.keys(x) where x's resolved type (or any union
                                  member) is backed by a class-declaration symbol; an unresolved
                                  type (any/unknown/checker miss) defaults to FLAGGED.

Static-only: this checker proves the SOURCE TEXT shape, never a live response payload. Behavior
(does the formatter actually print these fields for a real payload, does the flagged Object.keys()
call actually leak a sensitive internal name) is proven elsewhere: the Phase4-EvalProbe-BUG(812|
849|873)-* eval-probe pairs and the phase's live smoke pass.

A missing allowlisted file (rule 1) or a missing/unparseable package src dir / tsconfig (rule 2) is
a hard FATAL (exit 2), never a silent skip. Offenders found: exit 1. Clean: exit 0.

Suppress a verified-safe instance with a same-file (rule 1) or same-line/line-above (rule 2)
"// GATE-SUPPRESS[formatter-completeness]: <reason>" anchor.
`);
}

/** Prints the FATAL banner + one line-pair per fatal, then exits 2. Extracted from main() to keep
 *  its own cyclomatic complexity down — behavior/text unchanged from the inline version. */
function reportFatalsAndExit(fatals) {
  console.error(`FATAL: ${fatals.length} formatter-completeness scan target(s) unresolved:`);
  for (const f of fatals) {
    console.error(`  ${f.file}`);
    console.error(`    - ${f.detail}`);
  }
  process.exit(2);
}

/** Prints one rule's offender section (header + per-offender line-pair), or nothing when that
 *  rule has no offenders. `formatLocation` renders each offender's location line (rule 1: bare
 *  file; rule 2: file:line) so this one helper serves both rules' slightly different shapes.
 *  Extracted from main() to keep its own cyclomatic complexity down — behavior/text unchanged. */
function printOffenderSection(offenders, ruleLabel, formatLocation) {
  if (offenders.length === 0) return;
  console.error(`\n${offenders.length} offender(s) (${ruleLabel}):\n`);
  for (const o of offenders) {
    console.error(`  ${formatLocation(o)}`);
    console.error(`    - ${o.detail}`);
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const rule1 = runRule1();
  const rule2 = runRule2();

  const fatals = [...rule1.fatals, ...rule2.fatals];
  if (fatals.length > 0) {
    reportFatalsAndExit(fatals);
  }

  const totalTargets = Object.keys(FORMATTER_COMPLETENESS_ALLOWLIST).length;
  const totalOffenders = rule1.offenders.length + rule2.offenders.length;

  if (totalOffenders === 0) {
    console.log(
      `check-formatter-completeness: ${totalTargets} rule-1 target(s) checked, 0 offenders. ` +
        `rule-2 scanned packages/{foundry-module,mcp-server}/src/**, 0 offenders. PASS.`,
    );
  } else {
    printOffenderSection(rule1.offenders, 'rule 1: formatter-key-completeness', (o) => o.file);
    printOffenderSection(rule2.offenders, 'rule 2: object-keys-on-class-instance', (o) => `${o.file}:${o.line}`);
    console.error(
      `\nFix: rule 1 — add the missing field(s) to the named formatter (or, for a verified-safe ` +
        `omission, add a same-file "// GATE-SUPPRESS[formatter-completeness]: <reason>" anchor). ` +
        `rule 2 — replace Object.keys() on a class instance with a real accessor/mapper that emits a ` +
        `stable, intentional key set (or, for a verified-safe instance, add a same-line/line-above ` +
        `"// GATE-SUPPRESS[formatter-completeness]: <reason>" anchor).`,
    );
  }

  process.exit(totalOffenders > 0 ? 1 : 0);
}

// Only run as a gate when invoked directly (`node check-formatter-completeness.mjs`), not when
// imported by the fixture/unit test (formatter-completeness-fixtures.test.ts) for exercising the
// exported rule functions directly.
const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  main();
}
