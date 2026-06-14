#!/usr/bin/env node
// compare-bench.mjs — baseline-vs-current diff with refined HC12 budget.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.8.2 (HC12 / NF1).
//
// Refined HC12 budget (ADR-HC12 / ADR-020):
//   - 1000ns absolute-delta floor: deltas under 1µs NEVER fail (Windows timer noise)
//   - ~15% budget for source:"in-process" paths (sub-10µs); Vitest µs-resolution noise
//   - 5% budget for source:"diagnostic-live" ms-scale paths (real latency headroom)
//   - NEVER compare entries across different source types
//
// Usage:
//   node scripts/compare-bench.mjs [current-run-path]
//   If current-run-path is omitted, the newest bench/runs/<date>/timings.json is used.
//
// Baseline: bench/baseline.json (committed; only in-process entries at Tier A;
//   diagnostic-live entries are added at Tier B by capture-bench-live.mjs).
//
// Exit: 0 = no regressions beyond budget, 1 = regression(s) found, 2 = usage error.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const BASELINE_PATH = join(REPO_ROOT, 'bench', 'baseline.json');
const RUNS_DIR = join(REPO_ROOT, 'bench', 'runs');

// Budget constants (ADR-HC12)
const FLOOR_NS = 1000;          // 1µs absolute floor — never fail below this
const BUDGET_IN_PROCESS = 0.15; // 15% for sub-10µs in-process paths
const BUDGET_LIVE = 0.05;       // 5%  for ms-scale diagnostic-live paths

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

function newestTimings() {
  if (!existsSync(RUNS_DIR)) return null;
  const dateDirs = readdirSync(RUNS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => join(RUNS_DIR, e.name, 'timings.json'))
    .filter(existsSync)
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return dateDirs[0] ?? null;
}

function loadJson(path, label) {
  if (!existsSync(path)) {
    console.error(`[compare-bench] ${label} not found: ${path}`);
    process.exit(2);
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    console.error(`[compare-bench] Failed to parse ${label} at ${path}: ${err.message}`);
    process.exit(2);
  }
}

// ---------------------------------------------------------------------------
// Budget logic (ADR-HC12)
// ---------------------------------------------------------------------------

function budget(source) {
  return source === 'diagnostic-live' ? BUDGET_LIVE : BUDGET_IN_PROCESS;
}

function metricLabel(entry) {
  return entry.source === 'diagnostic-live' ? 'medianMs' : 'medianNs';
}

function metricValue(entry) {
  if (entry.source === 'diagnostic-live') return entry.medianMs ?? 0;
  return entry.medianNs ?? 0;
}

function unitSuffix(source) {
  return source === 'diagnostic-live' ? 'ms' : 'ns';
}

function checkEntry(baseline, current) {
  if (baseline.source !== current.source) {
    // Never compare across source types
    return null;
  }

  const bVal = metricValue(baseline);
  const cVal = metricValue(current);

  if (bVal === 0) {
    // Cannot compare — baseline has zero (sub-resolution entry)
    return { name: baseline.name, status: 'SKIP', reason: 'baseline has zero metric (sub-resolution)', bVal, cVal };
  }

  const delta = cVal - bVal;
  const source = baseline.source;

  // 1. Absolute floor: delta < 1000ns never fails for in-process
  if (source === 'in-process' && delta < FLOOR_NS) {
    return { name: baseline.name, status: 'PASS', reason: 'within 1µs floor', bVal, cVal, delta };
  }

  // 2. Percentage budget
  const relChange = delta / bVal;
  const limit = budget(source);
  if (relChange > limit) {
    return {
      name: baseline.name,
      status: 'FAIL',
      reason: `+${(relChange * 100).toFixed(1)}% > ${(limit * 100).toFixed(0)}% budget`,
      bVal,
      cVal,
      delta,
      source,
    };
  }

  return {
    name: baseline.name,
    status: 'PASS',
    reason: `+${(relChange * 100).toFixed(1)}% within budget`,
    bVal,
    cVal,
    delta,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function indexByKey(entries) {
  const map = new Map();
  for (const e of entries) map.set(`${e.name}::${e.source}`, e);
  return map;
}

function printResult(result, unit) {
  const tag = `[${result.status}]`;
  const line = `${tag} ${result.name} | baseline=${result.bVal}${unit} current=${result.cVal}${unit} | ${result.reason}`;
  if (result.status === 'FAIL') console.error(line);
  else console.log(line);
}

function diffEntries(baseline, currentMap) {
  const failures = [], skips = [], passes = [];
  for (const bEntry of baseline) {
    const cEntry = currentMap.get(`${bEntry.name}::${bEntry.source}`);
    if (!cEntry) { skips.push({ name: bEntry.name, status: 'SKIP', reason: 'not in current run', bVal: 0, cVal: 0 }); continue; }
    const result = checkEntry(bEntry, cEntry);
    if (!result) { skips.push({ name: bEntry.name, status: 'SKIP', reason: 'cross-source', bVal: 0, cVal: 0 }); continue; }
    printResult(result, unitSuffix(bEntry.source));
    if (result.status === 'FAIL') failures.push(result);
    else if (result.status === 'SKIP') skips.push(result);
    else passes.push(result);
  }
  return { failures, skips, passes };
}

function main() {
  const currentPath = process.argv[2] ? resolve(process.argv[2]) : newestTimings();
  if (!currentPath) {
    console.error('[compare-bench] No current-run timings.json found. Run: node scripts/run-bench.mjs');
    process.exit(2);
  }
  if (!existsSync(BASELINE_PATH)) {
    console.log('[compare-bench] No baseline.json — skipping (gate inactive until baseline exists).');
    return 0;
  }
  const baseline = loadJson(BASELINE_PATH, 'baseline.json');
  const current = loadJson(currentPath, 'current timings');
  console.log(`[compare-bench] Baseline: ${BASELINE_PATH}`);
  console.log(`[compare-bench] Current:  ${currentPath}\n`);
  const { failures, skips, passes } = diffEntries(baseline, indexByKey(current));
  console.log(`\n[compare-bench] Summary: ${passes.length} PASS / ${failures.length} FAIL / ${skips.length} SKIP`);
  if (failures.length > 0) {
    console.error(`\n[compare-bench] ${failures.length} regression(s) beyond HC12 budget. Investigate before merging.`);
    return 1;
  }
  console.log('[compare-bench] OK — no regressions beyond budget.');
  return 0;
}

try {
  process.exit(main());
} catch (err) {
  console.error('[compare-bench] Fatal:', err?.message ?? err);
  process.exit(2);
}
