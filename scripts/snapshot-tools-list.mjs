#!/usr/bin/env node
// snapshot-tools-list.mjs — MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.6 (R0.6, R0.7).
//
// Tool-surface drift gate (HC6/HC8) + conformance fallback (R0.6 — the official
// @modelcontextprotocol/conformance server mode is HTTP-only; our backend is a stdio/TCP server, so we
// hand-roll the inputSchema validity check against the JSON-Schema draft-07 meta-schema via Ajv).
//
// The standalone backend assembles `allTools` synchronously BEFORE connecting to Foundry and answers
// `list_tools` over its TCP control channel (127.0.0.1:31414, newline-delimited JSON) even with Foundry
// offline (backend.ts:692 fire-and-forget connect; :762 list_tools). So this is a Tier-A gate — no Foundry.
//
// Backend acquisition: connect-first (reuse a live backend if one already holds :31414 — read-only), else
// spawn `packages/mcp-server/dist/backend.bundle.cjs` (single-instance lock guarantees one), query, SIGTERM it.
//
// Modes:
//   (default)  write/update __tools-list-snapshot__.json (sorted names + count).
//   --diff     compare current names+count vs the committed snapshot; exit 1 on any drift.
//   --full     Ajv-validate every tool inputSchema vs draft-07; diff invalid set vs __conformance-baseline__.json
//              (expected-failures); exit 1 on a NEW invalid schema. Writes the baseline on first run.
//
// Run from repo root (POST-BUILD): node scripts/snapshot-tools-list.mjs [--diff|--full]
// Exit: 0 = ok / no drift, 1 = drift or new conformance failure, 2 = bad invocation / backend unreachable.

import net from 'node:net';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

const REPO_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const PORT = 31414;
const HOST = '127.0.0.1';
const BACKEND_BUNDLE = join(REPO_ROOT, 'packages/mcp-server/dist/backend.bundle.cjs');
const SNAPSHOT_FILE = join(REPO_ROOT, '__tools-list-snapshot__.json');
const CONFORMANCE_FILE = join(REPO_ROOT, '__conformance-baseline__.json');

let reqId = 0;

/** One TCP JSON-lines round-trip. Resolves the parsed response object. */
function sendRequest(method, params = {}, timeoutMs = 5000) {
  return new Promise((resolvePromise, reject) => {
    const sock = net.connect(PORT, HOST);
    let buf = '';
    const timer = setTimeout(() => {
      sock.destroy();
      reject(new Error(`timeout waiting for ${method}`));
    }, timeoutMs);
    sock.on('connect', () => sock.write(`${JSON.stringify({ id: String(++reqId), method, params })}\n`));
    sock.on('data', (chunk) => {
      buf += chunk;
      const i = buf.indexOf('\n');
      if (i < 0) return;
      clearTimeout(timer);
      sock.end();
      try {
        resolvePromise(JSON.parse(buf.slice(0, i)));
      } catch (e) {
        reject(e);
      }
    });
    sock.on('error', (e) => {
      clearTimeout(timer);
      reject(e);
    });
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pingOk() {
  try {
    const r = await sendRequest('ping', {}, 1000);
    return r?.result?.ok === true;
  } catch {
    return false;
  }
}

/** Fetch allTools, reusing a live backend if present, else spawning the bundle and killing it after. */
async function fetchTools() {
  if (await pingOk()) {
    const r = await sendRequest('list_tools');
    return r.result.tools;
  }
  if (!existsSync(BACKEND_BUNDLE)) {
    console.error(`snapshot-tools-list: ${BACKEND_BUNDLE} not found — run \`npm run build\` first.`);
    process.exit(2);
  }
  const child = spawn(process.execPath, [BACKEND_BUNDLE], { cwd: REPO_ROOT, stdio: 'ignore' });
  try {
    for (let i = 0; i < 60; i++) {
      if (await pingOk()) break;
      await sleep(250);
    }
    if (!(await pingOk())) throw new Error('spawned backend never listened on :31414');
    const r = await sendRequest('list_tools');
    return r.result.tools;
  } finally {
    child.kill('SIGTERM');
  }
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function writeSnapshot(tools) {
  const names = tools.map((t) => t.name).sort();
  const snap = { count: names.length, capturedVia: 'standalone-backend :31414 list_tools', names };
  writeFileSync(SNAPSHOT_FILE, `${JSON.stringify(snap, null, 2)}\n`);
  console.log(`[snapshot] wrote ${SNAPSHOT_FILE.replace(REPO_ROOT + '\\', '').replace(REPO_ROOT + '/', '')} — ${names.length} tools.`);
  return 0;
}

function diffSnapshot(tools) {
  if (!existsSync(SNAPSHOT_FILE)) {
    console.error('[snapshot] no committed snapshot — run `npm run snapshot:tools-list` first.');
    return 2;
  }
  const committed = readJson(SNAPSHOT_FILE);
  const current = tools.map((t) => t.name).sort();
  const added = current.filter((n) => !committed.names.includes(n));
  const removed = committed.names.filter((n) => !current.includes(n));
  if (added.length === 0 && removed.length === 0 && current.length === committed.count) {
    console.log(`[snapshot] OK — tool surface unchanged (${current.length} tools).`);
    return 0;
  }
  console.error(`[snapshot] DRIFT — committed ${committed.count}, current ${current.length}.`);
  if (added.length) console.error(`  ADDED:   ${added.join(', ')}`);
  if (removed.length) console.error(`  REMOVED: ${removed.join(', ')}`);
  console.error('  If intentional, re-run `npm run snapshot:tools-list` and commit the updated snapshot.');
  return 1;
}

function conformance(tools) {
  const ajv = new Ajv({ strict: false, allowUnionTypes: true });
  const failures = [];
  for (const t of tools) {
    if (!t.inputSchema || typeof t.inputSchema !== 'object') continue;
    if (!ajv.validateSchema(t.inputSchema)) {
      failures.push({ tool: t.name, errors: (ajv.errors || []).map((e) => `${e.instancePath} ${e.message}`) });
    }
  }
  const current = failures.map((f) => f.tool).sort();
  if (!existsSync(CONFORMANCE_FILE)) {
    const baseline = {
      comment: 'Expected inputSchema validity failures vs JSON-Schema draft-07 (R0.6 conformance fallback). A NEW failure fails the gate; when a tool is fixed, remove it here.',
      expectedFailures: failures,
    };
    writeFileSync(CONFORMANCE_FILE, `${JSON.stringify(baseline, null, 2)}\n`);
    console.log(`[conformance] wrote baseline — ${failures.length} expected failure(s), ${tools.length} tools validated.`);
    return 0;
  }
  const expected = readJson(CONFORMANCE_FILE).expectedFailures.map((f) => f.tool).sort();
  const novel = current.filter((n) => !expected.includes(n));
  if (novel.length === 0) {
    console.log(`[conformance] OK — ${tools.length} inputSchemas validated; ${current.length} known/expected failure(s).`);
    return 0;
  }
  console.error(`[conformance] NEW invalid inputSchema(s): ${novel.join(', ')}`);
  for (const f of failures.filter((x) => novel.includes(x.tool))) console.error(`  ${f.tool}: ${f.errors.join('; ')}`);
  return 1;
}

async function main() {
  const mode = process.argv.includes('--diff') ? 'diff' : process.argv.includes('--full') ? 'full' : 'write';
  const tools = await fetchTools();
  if (!Array.isArray(tools) || tools.length === 0) {
    console.error('[snapshot] backend returned no tools — aborting (would corrupt the baseline).');
    return 2;
  }
  if (mode === 'diff') return diffSnapshot(tools);
  if (mode === 'full') return conformance(tools);
  return writeSnapshot(tools);
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error('[snapshot-tools-list] error:', err?.message || err);
    process.exit(2);
  });
