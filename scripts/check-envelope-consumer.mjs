#!/usr/bin/env node
// check-envelope-consumer.mjs — cross-platform Node port of check-envelope-consumer.sh/.ps1.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.4.1 (R0.8/R0.10 — promote checks on-build).
// See the .sh/.ps1 siblings for the full rationale (BUG-069 / CCR-Envelope-Consumer / DP-15).
//
// BaseTool.query() returns BARE UNWRAPPED data and throws on failure. Consuming it as if it were a
// {success,data,error} envelope is the BUG-069 anti-pattern. This gate scans the MCP tool handlers:
//   1. WARN  — `this.query<any>(...)` type-loss that lets BUG-069 typecheck (grandfathered; backfill).
//   2. FAIL  — `.success` / `?.success` access within <=8 lines of `await this.query(...)`.
//   3. FAIL  — `response.data` / `response.error` (`?.` variants) within the same window.
//
// Run from repo root: node scripts/check-envelope-consumer.mjs
// Exit: 0 = no anti-patterns, 1 = anti-pattern found, 2 = bad invocation.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const TOOLS_DIR = join(REPO_ROOT, 'packages/mcp-server/src/tools');

function walkTs(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkTs(full));
    else if (entry.isFile() && entry.name.endsWith('.ts')) out.push(full);
  }
  return out;
}

if (!existsSync(TOOLS_DIR) || !statSync(TOOLS_DIR).isDirectory()) {
  console.error(`check-envelope-consumer: ${TOOLS_DIR} not found (run from repo root)`);
  process.exit(2);
}

console.log(`Scanning ${TOOLS_DIR.replace(REPO_ROOT + '\\', '').replace(REPO_ROOT + '/', '')} for BUG-069 anti-patterns...`);

const files = walkTs(TOOLS_DIR);
let exitCode = 0;
let queryAnyCount = 0;

const RE_QUERY_ANY = /this\.query<\s*any\s*>/;
const RE_AWAIT_QUERY = /await\s+this\.query/;
const RE_SUCCESS = /\??\.success\b/;
const RE_DATA_ERROR = /response\??\.(data|error)\b/;
const RE_COMMENT = /^\s*(\/\/|\*)/;

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  let captureLine = -1;
  const rel = file.replace(REPO_ROOT + '\\', '').replace(REPO_ROOT + '/', '');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // 1. this.query<any> — WARN only (skip textual references in comments).
    if (RE_QUERY_ANY.test(line) && !RE_COMMENT.test(line)) queryAnyCount++;

    // 2 & 3. envelope access within <=8 lines after `await this.query(...)`.
    if (RE_AWAIT_QUERY.test(line)) {
      captureLine = lineNum;
      continue;
    }
    if (captureLine !== -1) {
      if (lineNum - captureLine > 8) {
        captureLine = -1;
        continue;
      }
      if (RE_SUCCESS.test(line)) {
        console.error(`FAIL (2 — .success): ${rel}:${lineNum}: ${line.trim()}`);
        exitCode = 1;
      }
      if (RE_DATA_ERROR.test(line)) {
        console.error(`FAIL (3 — response.data/error): ${rel}:${lineNum}: ${line.trim()}`);
        exitCode = 1;
      }
    }
  }
}

if (queryAnyCount > 0) {
  console.log('');
  console.log(`WARN: ${queryAnyCount} this.query<any>(...) call(s) — type-loss that lets BUG-069 typecheck.`);
  console.log('      Every new handler must use a concrete response type (see tools/ownership.ts).');
  console.log('      Pre-existing calls are grandfathered; backfill opportunistically.');
}

if (exitCode === 0) console.log('OK — no BUG-069 anti-patterns found.');
process.exit(exitCode);
