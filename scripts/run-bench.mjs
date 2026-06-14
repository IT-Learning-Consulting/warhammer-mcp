#!/usr/bin/env node
// run-bench.mjs — runs the in-process vitest bench suite and emits
// bench/runs/<YYYY-MM-DD>/timings.json
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.8.2 (HC12 / NF1).
//
// Invocation: node scripts/run-bench.mjs
// Exit: 0 on success, 1 on bench failure, 2 on bad environment.
//
// Output schema per entry:
//   { name, source:"in-process", hz, meanNs, medianNs, samples }
//
// Notes:
// - hz  = cycles/second from vitest bench outputJson
// - meanNs / medianNs derived from period/p50 (vitest uses ms internally, we convert)
// - entries with no hz (sub-resolution benchmarks) keep hz:0 / meanNs:0 / medianNs:0
// - vitest bench --outputJson writes the raw file; we parse it and reshape to our schema

import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const BENCH_DIR = join(REPO_ROOT, 'bench');
const FOUNDRY_MODULE_DIR = join(REPO_ROOT, 'packages', 'foundry-module');
const VITEST_BIN = join(REPO_ROOT, 'node_modules', '.bin', 'vitest');

function dateStamp() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function runDir() {
  const dir = join(BENCH_DIR, 'runs', dateStamp());
  mkdirSync(dir, { recursive: true });
  return dir;
}

function vitestBin() {
  // Windows: .cmd wrapper; POSIX: bare binary
  const cmd = `${VITEST_BIN}.cmd`;
  if (existsSync(cmd)) return cmd;
  if (existsSync(VITEST_BIN)) return VITEST_BIN;
  throw new Error(`vitest not found at ${VITEST_BIN}`);
}

function numOr(val, fallback) {
  return typeof val === 'number' ? val : fallback;
}

function parseBenchmark(bm) {
  // vitest period and mean are in ms; convert to ns (1e6)
  return {
    name: bm.name,
    source: 'in-process',
    hz: Math.round(numOr(bm.hz, 0)),
    meanNs: Math.round(numOr(bm.mean, 0) * 1e6),
    medianNs: Math.round(numOr(bm.median, 0) * 1e6),
    samples: numOr(bm.sampleCount, 0),
  };
}

function parseBenchJson(rawPath) {
  if (!existsSync(rawPath)) {
    throw new Error(`Bench output file not found: ${rawPath}`);
  }
  const raw = JSON.parse(readFileSync(rawPath, 'utf8'));
  const results = [];
  for (const file of raw.files ?? []) {
    for (const group of file.groups ?? []) {
      for (const bm of group.benchmarks ?? []) {
        results.push(parseBenchmark(bm));
      }
    }
  }
  return results;
}

function main() {
  const outDir = runDir();
  const rawJsonPath = join(outDir, 'bench-raw.json');
  const timingsPath = join(outDir, 'timings.json');

  const bin = vitestBin();
  const benchFilter = 'src/__tests__/bench/data-access.bench.ts';
  const cmd = [
    `"${bin}"`,
    'bench',
    '--run',
    `--outputJson "${rawJsonPath}"`,
    `"${benchFilter}"`,
  ].join(' ');

  console.log(`[run-bench] Running vitest bench in ${FOUNDRY_MODULE_DIR}`);
  console.log(`[run-bench] Command: ${cmd}`);
  console.log(`[run-bench] Raw output → ${rawJsonPath}`);

  try {
    execSync(cmd, {
      cwd: FOUNDRY_MODULE_DIR,
      stdio: 'inherit',
      encoding: 'utf8',
    });
  } catch (err) {
    // vitest exits 1 on bench errors; still try to parse output
    console.error('[run-bench] vitest bench exited with error:', err.message ?? err);
    if (!existsSync(rawJsonPath)) {
      console.error('[run-bench] No output file produced — aborting.');
      process.exit(1);
    }
  }

  const results = parseBenchJson(rawJsonPath);
  if (results.length === 0) {
    console.error('[run-bench] Parsed 0 bench entries — something went wrong.');
    process.exit(1);
  }

  writeFileSync(timingsPath, JSON.stringify(results, null, 2));
  console.log(`\n[run-bench] ${results.length} entries → ${timingsPath}`);
  for (const r of results) {
    const meanUs = (r.meanNs / 1000).toFixed(3);
    console.log(`  ${r.name}: hz=${r.hz.toLocaleString()}, mean=${meanUs}µs, median=${(r.medianNs / 1000).toFixed(3)}µs, n=${r.samples.toLocaleString()}`);
  }
  console.log('\n[run-bench] OK');
  return 0;
}

try {
  process.exit(main());
} catch (err) {
  console.error('[run-bench] Fatal:', err?.message ?? err);
  process.exit(2);
}
