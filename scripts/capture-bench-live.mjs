#!/usr/bin/env node
// capture-bench-live.mjs — Tier-B diagnostic-latency bench (validate-time only).
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.8.2 (HC12 / NF1).
//
// Fires N=20 MCP calls per ms-scale hot path (updateActor, template-apply) against
// the live backend on :31414 and records the median round-trip in ms.
//
// This script is authored but NOT run in Tier A (no live Foundry available).
// Tier B: /agent-validate runs it post-restart; results merge into bench/baseline.json.
//
// Guard: if the backend is unreachable (ECONNREFUSED / timeout), the script logs
// a warning and exits 0 (no-op) rather than failing the gate.  Tier B smoke
// is the only path where a live backend is expected.
//
// Usage:
//   node scripts/capture-bench-live.mjs [--out path/to/timings.json]
//
// Output: appends/creates entries with source:"diagnostic-live" in the target file.
//
// Exit: 0 = OK (or backend unreachable), 1 = hard error, 2 = bad args.
//
// node --check scripts/capture-bench-live.mjs must pass (no syntax errors).

import { createConnection } from 'node:net';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 31414;
const SAMPLE_COUNT = 20;
const CONNECT_TIMEOUT_MS = 3000;
const CALL_TIMEOUT_MS = 10000;

// Hot paths to bench (ms-scale, write/Foundry-coupled — not in-process benchable).
// Each entry describes a JSON-RPC call that exercises one handler end-to-end.
// actorId / templateName are placeholders; the live world may not have these
// exact actors — we accept 'error' responses and still record round-trip latency.
const HOT_PATHS = [
  {
    name: 'updateActor (round-trip)',
    method: 'execute_tool',
    params: {
      tool_name: 'warhammer-mcp.update-actor',
      arguments: {
        identifier: '_bench_probe_actor_',
        updates: { name: '_bench_probe_actor_' },
      },
    },
  },
  {
    name: 'applyTemplate (round-trip)',
    method: 'execute_tool',
    params: {
      tool_name: 'warhammer-mcp.apply-template',
      arguments: {
        actorId: '_bench_probe_actor_',
        templateName: '_bench_probe_template_',
      },
    },
  },
];

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  let outPath = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out' && args[i + 1]) {
      outPath = args[++i];
    }
  }
  return { outPath };
}

// ---------------------------------------------------------------------------
// JSON-RPC over TCP
// ---------------------------------------------------------------------------

function connectToBackend(host, port, timeoutMs) {
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error(`Connection timeout after ${timeoutMs}ms`));
    }, timeoutMs);
    socket.once('connect', () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.once('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function sendRpc(socket, opts) {
  const { id, method, params, timeoutMs } = opts;
  return new Promise((resolve, reject) => {
    const request = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
    let buf = '';
    const timer = setTimeout(() => {
      reject(new Error(`RPC timeout after ${timeoutMs}ms`));
    }, timeoutMs);
    const onData = (chunk) => {
      buf += chunk.toString();
      const nl = buf.indexOf('\n');
      if (nl !== -1) {
        clearTimeout(timer);
        socket.off('data', onData);
        socket.off('error', onErr);
        try {
          resolve(JSON.parse(buf.slice(0, nl)));
        } catch (e) {
          reject(new Error(`Failed to parse RPC response: ${e.message}`));
        }
      }
    };
    const onErr = (err) => {
      clearTimeout(timer);
      socket.off('data', onData);
      reject(err);
    };
    socket.on('data', onData);
    socket.once('error', onErr);
    socket.write(request);
  });
}

// ---------------------------------------------------------------------------
// Median helper
// ---------------------------------------------------------------------------

function median(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

// ---------------------------------------------------------------------------
// Bench one path
// ---------------------------------------------------------------------------

async function benchPath(socket, pathSpec, n) {
  const latencies = [];
  for (let i = 0; i < n; i++) {
    const start = performance.now();
    try {
      await sendRpc(socket, { id: i + 1, method: pathSpec.method, params: pathSpec.params, timeoutMs: CALL_TIMEOUT_MS });
    } catch {
      // Errors (actor-not-found etc.) still count as round-trips
    }
    latencies.push(performance.now() - start);
  }
  return {
    name: pathSpec.name,
    source: 'diagnostic-live',
    medianMs: parseFloat(median(latencies).toFixed(3)),
    samples: latencies.length,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { outPath } = parseArgs();
  const targetPath = outPath
    ? resolve(outPath)
    : join(REPO_ROOT, 'bench', 'runs', dateStamp(), 'live-timings.json');

  console.log(`[capture-bench-live] Connecting to backend ${DEFAULT_HOST}:${DEFAULT_PORT}...`);

  let socket;
  try {
    socket = await connectToBackend(DEFAULT_HOST, DEFAULT_PORT, CONNECT_TIMEOUT_MS);
  } catch (err) {
    console.warn(`[capture-bench-live] Backend unreachable (${err.message}) — no-op. Run from Tier B with live Foundry.`);
    return 0;
  }

  console.log(`[capture-bench-live] Connected. Benchmarking ${HOT_PATHS.length} paths × N=${SAMPLE_COUNT}...`);

  const results = [];
  try {
    for (const pathSpec of HOT_PATHS) {
      const result = await benchPath(socket, pathSpec, SAMPLE_COUNT);
      results.push(result);
      console.log(`  ${result.name}: medianMs=${result.medianMs}`);
    }
  } finally {
    socket.destroy();
  }

  // Merge with any existing entries in the target file
  let existing = [];
  if (existsSync(targetPath)) {
    try {
      existing = JSON.parse(readFileSync(targetPath, 'utf8'));
    } catch {
      existing = [];
    }
  }
  const merged = [
    ...existing.filter((e) => e.source !== 'diagnostic-live'),
    ...results,
  ];
  writeFileSync(targetPath, JSON.stringify(merged, null, 2));
  console.log(`[capture-bench-live] ${results.length} live entries → ${targetPath}`);
  return 0;
}

function dateStamp() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error('[capture-bench-live] Fatal:', err?.message ?? err);
    process.exit(1);
  });
