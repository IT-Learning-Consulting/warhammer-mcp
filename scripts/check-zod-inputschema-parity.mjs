#!/usr/bin/env node
// check-zod-inputschema-parity.mjs — full-coverage published-inputSchema <-> Zod parity gate.
//
// Supersedes the coverage (not the assertions) of packages/mcp-server/src/__tests__/
// inputschema-zod-parity.test.ts (BUG-330, 9/114 tools, top-level keys + action enum only).
// This checker walks all 114 registered tool definitions and additionally verifies
// per-branch required-sets and nested shapes for discriminated-union (umbrella) tools —
// the defect class named by BUG-782/660/763/808: "the published schema is one permissive
// object requiring only `action`, while every strict Zod variant requires additional
// branch-specific fields... the parity test unions top-level keys and action values, so
// it cannot detect required sets, wrong-branch fields, or nested drift."
//
// Technique: dist-import (proven 100 instances / 114 defs / <300ms). The published side
// comes from packages/mcp-server/dist/tools/factory/build-tools.js; the Zod side comes
// from shared/dist/index.js OR, when a tool defines its Zod schema locally (a real,
// confirmed pattern — see ownership.ts's module-private OwnershipSchema), from a static
// grep of the tool's own .ts source. Both dist bundles are ESM ("type":"module"), so this
// script uses dynamic import() + pathToFileURL, NOT require() — require() on an ESM dist
// file throws ERR_REQUIRE_ESM.
//
// Coverage buckets (D4 — a tool without a *reachable* Zod schema is a baselined finding,
// never a hard failure):
//   (i)   resolvable   — Zod schema importable from shared/dist or re-exported by the tool
//                        file itself. Full structural comparison runs.
//   (ii)  local-private — the tool file defines `const FooSchema = z.object(...)` at module
//                        scope but never exports it (confirmed real: ownership.ts). Cannot
//                        be imported by an external script. Baselined.
//   (iii) inline/none   — no named module-scope Zod schema at all; validation happens via
//                        an anonymous `z.object({...})` literal inside a handler method
//                        (confirmed real: character.ts) or no Zod validation. Baselined.
//
// Exit codes: 0 = clean, 1 = violations found, 2 = bad invocation. Matches all 14 precedents.
//
// Run from repo root: node scripts/check-zod-inputschema-parity.mjs [--help] [--json]

import { readFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const MCP_SERVER_DIR = join(REPO_ROOT, 'packages', 'mcp-server');
const TOOLS_SRC_DIR = join(MCP_SERVER_DIR, 'src', 'tools');
const FACTORY_TS = join(TOOLS_SRC_DIR, 'factory', 'build-tools.ts');
const BUILD_TOOLS_DIST = join(MCP_SERVER_DIR, 'dist', 'tools', 'factory', 'build-tools.js');
const SHARED_DIST = join(REPO_ROOT, 'shared', 'dist', 'index.js');

function printHelp() {
  console.log(`check-zod-inputschema-parity.mjs — full-coverage published-inputSchema <-> Zod parity gate.

Usage:
  node scripts/check-zod-inputschema-parity.mjs [--help] [--json]

Flags:
  --help   print this message and exit 0
  --json   emit machine-readable JSON summary to stdout instead of the console report

Exit codes:
  0  clean (no offenders; bucket (ii)/(iii) tools are reported but do not fail the run)
  1  one or more offenders found (top-level key drift, action-enum drift, or an unenforced
     per-branch required-set on an umbrella/discriminated-union tool)
  2  bad invocation (dist not built, or build-tools.ts import block unparseable)
`);
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}
const jsonMode = args.includes('--json');

if (!existsSync(BUILD_TOOLS_DIST)) {
  console.error(`FATAL: ${relative(REPO_ROOT, BUILD_TOOLS_DIST)} does not exist. Run "npm run build" in packages/mcp-server first.`);
  process.exit(2);
}
if (!existsSync(SHARED_DIST)) {
  console.error(`FATAL: ${relative(REPO_ROOT, SHARED_DIST)} does not exist. Run "npm run build" in shared first.`);
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Step 1: statically parse build-tools.ts's import block -> ClassName -> source .ts file.
// One import line per tool class: `import { ClassName } from '../relative.js';`
// (occasionally two names on one line for a file exporting >1 class — handled by the
// global regex's per-match capture, not per-line).
// ---------------------------------------------------------------------------
function parseClassToSourceFile() {
  const text = readFileSync(FACTORY_TS, 'utf8');
  const map = new Map(); // ClassName -> absolute .ts path
  const importLineRe = /^import\s*\{([^}]+)\}\s*from\s*'(\.\.\/[^']+)';/gm;
  let m;
  let lineCount = 0;
  while ((m = importLineRe.exec(text)) !== null) {
    lineCount++;
    const names = m[1].split(',').map((s) => s.trim()).filter(Boolean).map((s) => s.split(/\s+as\s+/)[0].trim());
    const relPath = m[2]; // e.g. '../character.js', relative to factory/
    const srcTs = resolve(TOOLS_SRC_DIR, 'factory', relPath).replace(/\.js$/, '.ts');
    for (const name of names) map.set(name, srcTs);
  }
  if (map.size === 0) {
    console.error(`FATAL: parsed 0 import lines from ${relative(REPO_ROOT, FACTORY_TS)} — regex drifted from the file's actual shape.`);
    process.exit(2);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Step 2: dynamic-import both dist bundles (ESM — pathToFileURL, not require()).
// ---------------------------------------------------------------------------
async function loadRuntime() {
  const { buildTools } = await import(pathToFileURL(BUILD_TOOLS_DIST).href);
  const sharedMod = await import(pathToFileURL(SHARED_DIST).href);
  const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
  const foundryClient = { query: async () => ({}) };
  const instances = buildTools({ foundryClient, logger });
  return { instances, sharedMod };
}

// ---------------------------------------------------------------------------
// Step 3: per source-file Zod-schema census (shared-imported names + local module-scope
// consts, exported or not). Used to correlate a tool `name` to a Zod schema identifier.
// ---------------------------------------------------------------------------
function censusSourceFile(srcTs) {
  if (!existsSync(srcTs)) return { sharedNames: [], localExported: [], localPrivate: [] };
  const text = readFileSync(srcTs, 'utf8');
  const sharedNames = [];
  const sharedImportRe = /import\s*\{([^}]+)\}\s*from\s*['"]@foundry-mcp\/shared['"]/g;
  let m;
  while ((m = sharedImportRe.exec(text)) !== null) {
    for (const raw of m[1].split(',')) {
      const name = raw.trim().split(/\s+as\s+/)[0].trim();
      if (name && /Input|Schema|Args$/.test(name)) sharedNames.push(name);
    }
  }
  const localExported = [];
  const localPrivate = [];
  const localConstRe = /^(export\s+)?const\s+(\w+)\s*=\s*z\.(object|discriminatedUnion)\(/gm;
  while ((m = localConstRe.exec(text)) !== null) {
    (m[1] ? localExported : localPrivate).push(m[2]);
  }
  return { sharedNames, localExported, localPrivate };
}

// kebab-case tool name -> PascalCase stem, for identifier correlation.
function pascalStem(name) {
  return name.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('');
}

function resolveZodIdentifier(toolName, census) {
  const stem = pascalStem(toolName);
  const candidates = [...census.sharedNames, ...census.localExported];
  // Exact/suffix match first.
  const bySuffix = candidates.find((c) => c.startsWith(stem) || c.toLowerCase().includes(stem.toLowerCase()));
  if (bySuffix) return { name: bySuffix, source: census.sharedNames.includes(bySuffix) ? 'shared' : 'local-exported' };
  // Single-candidate file: high-confidence default pairing regardless of name match.
  if (candidates.length === 1) {
    return { name: candidates[0], source: census.sharedNames.includes(candidates[0]) ? 'shared' : 'local-exported' };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Zod introspection helpers (verbatim technique from inputschema-zod-parity.test.ts:43-76,
// reused unmodified against dist-imported schemas — duck-typed on _def.typeName, so it
// does not care which package's zod instance produced the schema).
// ---------------------------------------------------------------------------
function unwrap(schema) {
  let s = schema;
  for (;;) {
    const t = s?._def?.typeName;
    if (t === 'ZodOptional' || t === 'ZodDefault' || t === 'ZodNullable') s = s._def.innerType;
    else if (t === 'ZodEffects') s = s._def.schema;
    else return s;
  }
}

function isOptionalField(fieldSchema) {
  // .refine()/.transform() wrap the field in ZodEffects even when applied AFTER .optional()
  // (e.g. z.string().optional().refine(...) => ZodEffects<ZodOptional<ZodString>>) — peel those
  // off first or a refined-optional field is misread as required (found live: critical.ts's
  // `wounds` field, BUG-646's own dice-notation refine).
  let s = fieldSchema;
  while (s?._def?.typeName === 'ZodEffects') s = s._def.schema;
  const t = s?._def?.typeName;
  return t === 'ZodOptional' || t === 'ZodDefault';
}

function topLevelKeys(zodObj) {
  return new Set(Object.keys(zodObj.shape));
}

function requiredKeys(zodObj) {
  return new Set(Object.keys(zodObj.shape).filter((k) => !isOptionalField(zodObj.shape[k])));
}

// ---------------------------------------------------------------------------
// Step 4: per-tool comparison.
// ---------------------------------------------------------------------------
// Zod records the real discriminator key on _def.discriminator — it is NOT always 'action'
// (e.g. create-custom-item.ts discriminates on 'itemType', item-target.ts on 'scope').
// Hardcoding 'action' silently no-ops the entire per-branch check on any tool using a
// different discriminator name, which is exactly how BUG-660's own tool passed clean on the
// first run of this checker — caught by re-probing, not assumed correct.
function discriminatorLiteral(branch, discKey) {
  const field = unwrap(branch.shape[discKey]);
  return field?._def?.typeName === 'ZodLiteral' ? field._def.value : null;
}

function collectUnionShape(branches, discKey) {
  const allZodKeys = new Set();
  const actionValues = [];
  for (const b of branches) {
    for (const k of topLevelKeys(b)) allZodKeys.add(k);
    const literal = discriminatorLiteral(b, discKey);
    if (literal !== null) actionValues.push(literal);
  }
  return { allZodKeys, actionValues };
}

function compareTopLevelKeys(allZodKeys, discKey, publishedProps, offenders) {
  for (const k of allZodKeys) if (!publishedProps.has(k)) offenders.push(`property "${k}" in Zod branch(es) but missing from published inputSchema.properties`);
  for (const k of publishedProps) if (!allZodKeys.has(k) && k !== discKey) offenders.push(`property "${k}" in published inputSchema but not present in any Zod branch`);
}

function compareActionEnum(actionValues, discKey, published, offenders) {
  const publishedActionEnum = new Set(published.properties?.[discKey]?.enum || []);
  for (const a of actionValues) if (!publishedActionEnum.has(a)) offenders.push(`${discKey} "${a}" is a valid Zod branch but missing from published ${discKey} enum`);
}

function compareTopLevelAndActionEnum(branches, discKey, ctx) {
  const { publishedProps, published, offenders } = ctx;
  const { allZodKeys, actionValues } = collectUnionShape(branches, discKey);
  compareTopLevelKeys(allZodKeys, discKey, publishedProps, offenders);
  compareActionEnum(actionValues, discKey, published, offenders);
}

// The new capability (BUG-782/660/763/808-class): per-branch required-sets. D1 — expressed
// as allOf/if-then, never anyOf.
function compareBranchRequiredSets(branches, discKey, published, offenders) {
  const allOf = Array.isArray(published.allOf) ? published.allOf : [];
  // A key already in the top-level `required` array is unconditionally enforced by JSON
  // Schema regardless of allOf — e.g. create-custom-item.ts requires ['itemType','name',
  // 'destination'] globally, so a branch needing 'name' is already satisfied without its own
  // if-then clause. Missing this was a real blind spot: it would have flagged every branch of
  // that tool as an offender even after generating allOf, purely from double-counting.
  const globallyRequired = new Set(published.required || []);
  for (const b of branches) {
    const actionLiteral = discriminatorLiteral(b, discKey);
    if (actionLiteral === null) continue;
    const branchRequired = [...requiredKeys(b)].filter((k) => k !== discKey && !globallyRequired.has(k)).sort();
    if (branchRequired.length === 0) continue;
    const matchingClause = allOf.find((clause) => clause?.if?.properties?.[discKey]?.const === actionLiteral);
    const enforcedRequired = new Set(matchingClause?.then?.required || []);
    const missing = branchRequired.filter((k) => !enforcedRequired.has(k));
    if (missing.length > 0) {
      offenders.push(
        `${discKey} "${actionLiteral}" requires [${missing.join(', ')}] in Zod but published schema does not enforce them (no allOf/if-then clause, or clause missing these keys) — BUG-782/660/763/808-class drift`,
      );
    }
  }
}

function compareDiscriminatedUnion(s, published, publishedProps, offenders) {
  const discKey = s._def.discriminator || 'action';
  const branches = s.options.map((opt) => unwrap(opt));
  compareTopLevelAndActionEnum(branches, discKey, { publishedProps, published, offenders });
  compareBranchRequiredSets(branches, discKey, published, offenders);
}

function comparePlainObject(s, publishedProps, publishedRequired, offenders) {
  const zodKeys = topLevelKeys(s);
  const zodRequired = requiredKeys(s);
  for (const k of zodKeys) if (!publishedProps.has(k)) offenders.push(`property "${k}" in Zod but missing from published inputSchema.properties`);
  for (const k of publishedProps) if (!zodKeys.has(k)) offenders.push(`property "${k}" in published inputSchema but not in Zod`);
  for (const k of zodRequired) if (!publishedRequired.has(k)) offenders.push(`"${k}" is required in Zod but not in published inputSchema.required`);
}

export function compareTool(def, zodSchema) {
  const offenders = [];
  const s = unwrap(zodSchema);
  const published = def.inputSchema || {};
  const publishedProps = new Set(Object.keys(published.properties || {}));
  const publishedRequired = new Set(published.required || []);

  if (s._def.typeName === 'ZodDiscriminatedUnion') {
    compareDiscriminatedUnion(s, published, publishedProps, offenders);
  } else if (s._def.typeName === 'ZodObject') {
    comparePlainObject(s, publishedProps, publishedRequired, offenders);
  } else {
    offenders.push(`unsupported Zod root type ${s._def.typeName} — checker cannot compare structurally`);
  }
  return offenders;
}

// Resolve + compare a single tool def; returns one of:
//   { kind: 'baselined', tool, file, reason }
//   { kind: 'compared', file, offenders: string[] }   (offenders may be empty = clean)
function checkOneDef(def, srcTs, sharedMod) {
  if (!srcTs) {
    return { kind: 'baselined', tool: def.name, file: '(unresolved source file)', reason: 'bucket-(iii): could not map class to a tools/*.ts source file' };
  }
  const relFile = relative(REPO_ROOT, srcTs).replace(/\\/g, '/');
  const census = censusSourceFile(srcTs);
  const resolved = resolveZodIdentifier(def.name, census);
  if (!resolved) {
    const reason = census.localPrivate.length > 0
      ? `bucket-(ii): local Zod schema(s) [${census.localPrivate.join(', ')}] present but not exported — unreachable to this checker (D4)`
      : 'bucket-(iii): no named module-scope Zod schema found (likely inline/anonymous per-handler validation)';
    return { kind: 'baselined', tool: def.name, file: relFile, reason };
  }
  const zodSchema = resolved.source === 'shared' ? sharedMod[resolved.name] : undefined;
  if (!zodSchema) {
    return { kind: 'baselined', tool: def.name, file: relFile, reason: `bucket-(ii): identified local schema "${resolved.name}" but it is not exported from shared/dist — unreachable (D4)` };
  }
  return { kind: 'compared', file: relFile, offenders: compareTool(def, zodSchema).map((o) => `[${def.name}] ${o}`) };
}

function runAllChecks(instances, classToFile, sharedMod) {
  const perFileOffenders = new Map(); // relative tool file -> [offender strings]
  const baselined = []; // { tool, file, reason }
  let toolsChecked = 0;

  for (const instance of instances) {
    const srcTs = classToFile.get(instance.constructor.name);
    for (const def of instance.getToolDefinitions()) {
      toolsChecked++;
      const result = checkOneDef(def, srcTs, sharedMod);
      if (result.kind === 'baselined') {
        baselined.push({ tool: result.tool, file: result.file, reason: result.reason });
      } else if (result.offenders.length > 0) {
        const existing = perFileOffenders.get(result.file) ?? [];
        perFileOffenders.set(result.file, [...existing, ...result.offenders]);
      }
    }
  }
  return { perFileOffenders, baselined, toolsChecked };
}

function printReport({ toolsChecked, baselined, perFileOffenders, offenderFiles, wallClockMs }) {
  if (jsonMode) {
    printJsonReport({ toolsChecked, baselined, perFileOffenders, offenderFiles, wallClockMs });
    return;
  }
  console.log(`check-zod-inputschema-parity: tools_checked == ${toolsChecked} (target 114), wall-clock ${wallClockMs}ms`);
  console.log(`baselined (bucket ii/iii, not hard failures): ${baselined.length}`);
  if (offenderFiles.length > 0) {
    console.log('');
    console.log(`FAIL: ${offenderFiles.length} tool file(s) with Zod <-> published-schema drift.`);
    for (const f of offenderFiles) {
      console.log('');
      console.log(`  ${f}`);
      for (const line of perFileOffenders.get(f)) console.log(`    - ${line}`);
    }
  } else {
    console.log('PASS: no Zod <-> published-schema drift found.');
  }
}

function printJsonReport({ toolsChecked, baselined, perFileOffenders, offenderFiles, wallClockMs }) {
  console.log(JSON.stringify({
    tools_checked: toolsChecked,
    offender_files: offenderFiles,
    offenders_by_file: Object.fromEntries(perFileOffenders),
    baselined_count: baselined.length,
    baselined,
    wall_clock_ms: wallClockMs,
  }, null, 2));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const start = Date.now();
  const classToFile = parseClassToSourceFile();
  const { instances, sharedMod } = await loadRuntime();

  const { perFileOffenders, baselined, toolsChecked } = runAllChecks(instances, classToFile, sharedMod);

  const wallClockMs = Date.now() - start;
  const offenderFiles = [...perFileOffenders.keys()].sort();
  printReport({ toolsChecked, baselined, perFileOffenders, offenderFiles, wallClockMs });
  process.exit(offenderFiles.length > 0 ? 1 : 0);
}

// Only run as a gate when invoked directly (`node check-zod-inputschema-parity.mjs`), not
// when imported by the vitest fixture test (task 1.2) for unit-testing compareTool().
const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  main().catch((err) => {
    console.error('FATAL:', err?.stack || err);
    process.exit(2);
  });
}
