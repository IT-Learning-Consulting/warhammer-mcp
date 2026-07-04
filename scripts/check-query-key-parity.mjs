#!/usr/bin/env node
// check-query-key-parity.mjs — mcp_code_quality_v2 Phase C3 task 5.2 (19e regression gate).
//
// The Phase C3 research (phaseC3_pre_plan.md §19e) ran a full manual reconciliation of every
// registered CONFIG.queries key (foundry-module/src/queries.ts buildHandlerTable()) against every
// literal key used in a `this.query<T>('key', ...)` call across packages/mcp-server/src/tools/**
// and found ZERO bypasses (a used key with no registered owner). This script is the regression
// gate that keeps that finding true going forward — it does NOT re-run the full reconciliation
// (that needs the QUERY_KEY_ALLOWLIST-style camelCase→kebab knowledge check-registry-orphans.mjs
// already owns for the INVERSE direction); it checks the direction check-registry-orphans.mjs
// does not: every USED literal has a REGISTERED owner.
//
// Set A — registered keys: buildHandlerTable() entries in foundry-module/src/queries.ts (same
//         extraction logic as check-registry-orphans.mjs's extractSetA).
// Set U — used keys: every `this.query<T>('literal', ...)` call site across
//         packages/mcp-server/src/tools/** (excluding __tests__), MULTI-LINE-AWARE (the key
//         literal may be on the line after the opening paren) + packages/mcp-server/src/
//         foundry-client.ts's own `this.query('warhammer-mcp.ping')` raw convention (a fully
//         `warhammer-mcp.`-prefixed literal, special-cased by stripping the prefix before the
//         membership check — it is NOT a query-key bypass, just a different call-site convention).
//
// Hard check: every key in Set U (after prefix-normalization) must be a member of Set A.
//
// Run from repo root: node scripts/check-query-key-parity.mjs
// Exit: 0 = clean, 1 = a used key has no registered owner, 2 = bad invocation.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const QUERIES_TS = join(REPO_ROOT, 'packages/foundry-module/src/queries.ts');
const TOOLS_DIR = join(REPO_ROOT, 'packages/mcp-server/src/tools');
const FOUNDRY_CLIENT_TS = join(REPO_ROOT, 'packages/mcp-server/src/foundry-client.ts');
const WARHAMMER_MCP_PREFIX = 'warhammer-mcp.';

function readFile(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch (e) {
    console.error(`❌ Cannot read ${path}: ${e.message}`);
    process.exit(2);
  }
}

/** Recursively list .ts files under `dir`, excluding __tests__. */
function listToolFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (entry === '__tests__') continue;
    if (statSync(p).isDirectory()) out.push(...listToolFiles(p));
    else if (entry.endsWith('.ts')) out.push(p);
  }
  return out;
}

/**
 * Extract the registered query keys from queries.ts buildHandlerTable() (Set A).
 * Mirrors check-registry-orphans.mjs's extractSetA — same source-of-truth extraction.
 */
function extractRegisteredKeys(src) {
  const keys = [];
  const tableMatch = src.match(
    /(?:const handlerTable[\s\S]*?=\s*\{\r?\n([\s\S]*?)\r?\n {4}\};|buildHandlerTable\(\)\s*\{\r?\n\s*return \{\r?\n([\s\S]*?)\r?\n {4}\} satisfies)/,
  );
  if (tableMatch) {
    const body = tableMatch[1] ?? tableMatch[2];
    const re = /^\s+'([^']+)':\s/gm;
    let m;
    while ((m = re.exec(body)) !== null) keys.push(m[1]);
  }
  const direct = /CONFIG\.queries\[\s*(?:`\$\{modulePrefix\}\.((?!\$\{)[^`]+)`|['"]warhammer-mcp\.([^'"]+)['"])\s*\]\s*=/g;
  let d;
  while ((d = direct.exec(src)) !== null) {
    const k = d[1] || d[2];
    if (k && !keys.includes(k)) keys.push(k);
  }
  return keys;
}

/**
 * Extract every literal key from `this.query<T>('key', ...)` call sites in `src`.
 * MULTI-LINE-AWARE: `\s*` between `(` and the quote spans the call's opening paren onto the next
 * line (the IF-1-class drift shape this gate exists for). The generic body itself is constrained
 * to `[^\n]*?` (single-line, but still lazy-backtracking-aware for nested generics like
 * `this.query<Record<string, unknown>>(...)`) — deliberately NOT `[\s\S]*?`, which bridged across
 * a `this.query<T>` PROSE MENTION in a doc comment (no generics span lines in this codebase) all
 * the way to an unrelated later call, producing a false match (caught during task 5.2 dev/test).
 */
function extractUsedKeys(src) {
  const keys = [];
  const re = /this\.query(?:<[^\n]*?>)?\s*\(\s*(['"])([^'"]+)\1/g;
  let m;
  while ((m = re.exec(src)) !== null) keys.push(m[2]);
  return keys;
}

function main() {
  const queriesSrc = readFile(QUERIES_TS);
  const registered = new Set(extractRegisteredKeys(queriesSrc));

  const usedRaw = [];
  for (const file of listToolFiles(TOOLS_DIR)) {
    usedRaw.push(...extractUsedKeys(readFile(file)).map((key) => ({ key, file })));
  }
  // FoundryClient's own raw convention: fully warhammer-mcp.-prefixed literal (not under tools/**,
  // scanned separately). Normalized below like any other prefixed literal.
  usedRaw.push(...extractUsedKeys(readFile(FOUNDRY_CLIENT_TS)).map((key) => ({ key, file: FOUNDRY_CLIENT_TS })));

  const violations = [];
  const usedKeySet = new Set();
  for (const { key, file } of usedRaw) {
    const normalized = key.startsWith(WARHAMMER_MCP_PREFIX) ? key.slice(WARHAMMER_MCP_PREFIX.length) : key;
    usedKeySet.add(normalized);
    if (!registered.has(normalized)) {
      violations.push(`USED_BUT_UNREGISTERED: '${key}' called via this.query() in ${file.replace(REPO_ROOT + '\\', '').replace(REPO_ROOT + '/', '')} but has no buildHandlerTable() entry in queries.ts`);
    }
  }

  if (violations.length > 0) {
    for (const v of violations) process.stderr.write(`❌ ${v}\n`);
    process.stderr.write(`\nFound ${violations.length} query-key bypass violation(s).\n`);
    process.exit(1);
  }

  console.log(`✓ Query-key parity check PASSED`);
  console.log(`  Set A (registered keys): ${registered.size}`);
  console.log(`  Set U (used keys):       ${usedKeySet.size}`);
  process.exit(0);
}

main();
