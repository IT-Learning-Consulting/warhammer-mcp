#!/usr/bin/env node
// check-dist-freshness.mjs — MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.4.2 (R0.8 / NF8).
//
// Guards against the stale-dist false-green that has bitten prior PRDs: a source edit without a rebuild
// leaves the bundled dist behind, so smoke/CI runs against OLD code while typecheck (source) passes.
//
// Per workspace it compares the newest NON-TEST source mtime against the newest BUILD-OUTPUT mtime in dist:
//   - dist absent / no outputs -> skip (clean checkout / never built — not a staleness signal). Run post-build.
//   - newestSrc > newestDist   -> STALE -> exit 1 (rebuild needed).
//
// Why "newest dist output" and not a single named sentinel: shared/ builds with INCREMENTAL tsc, which only
// re-emits the files that changed — so a fixed file like dist/index.js keeps an old mtime even on a fresh
// build. The newest emitted artifact tracks the last real emit correctly for both tsc and esbuild builds.
// *.tsbuildinfo is excluded (tsc bumps it even on a no-emit run, which would mask staleness).
// Test edits don't invalidate dist (tests aren't bundled), so *.test.* / *.spec.* / __tests__ are excluded.
//
// Run from repo root (POST-BUILD): node scripts/check-dist-freshness.mjs
// Exit: 0 = all dist fresh (or unbuilt), 1 = a workspace's dist is stale, 2 = bad invocation.

import { readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

const WORKSPACES = [
  { name: 'shared', src: 'shared/src', dist: 'shared/dist' },
  { name: 'foundry-module', src: 'packages/foundry-module/src', dist: 'packages/foundry-module/dist' },
  { name: 'mcp-server', src: 'packages/mcp-server/src', dist: 'packages/mcp-server/dist' },
];

const TEST_RE = /(\.test\.|\.spec\.|[/\\]__tests__[/\\])/;
const DIST_OUT_RE = /\.(js|cjs|mjs|d\.ts|map)$/;

function newestMtime(dir, predicate) {
  let newest = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      newest = Math.max(newest, newestMtime(full, predicate));
    } else if (entry.isFile() && predicate(full)) {
      newest = Math.max(newest, statSync(full).mtimeMs);
    }
  }
  return newest;
}

let exitCode = 0;
for (const ws of WORKSPACES) {
  const srcDir = join(REPO_ROOT, ws.src);
  const distDir = join(REPO_ROOT, ws.dist);
  if (!existsSync(srcDir)) {
    console.error(`check-dist-freshness: ${ws.src} not found (run from repo root)`);
    process.exit(2);
  }
  if (!existsSync(distDir)) {
    console.log(`[${ws.name}] dist absent (${ws.dist}) — skip (unbuilt).`);
    continue;
  }
  const distMtime = newestMtime(distDir, (f) => DIST_OUT_RE.test(f));
  if (distMtime === 0) {
    console.log(`[${ws.name}] dist has no build outputs — skip (unbuilt).`);
    continue;
  }
  const srcMtime = newestMtime(srcDir, (f) => f.endsWith('.ts') && !TEST_RE.test(f));
  if (srcMtime > distMtime) {
    const drift = Math.round((srcMtime - distMtime) / 1000);
    console.error(`[${ws.name}] STALE: newest src is ${drift}s newer than newest dist output. Rebuild this workspace.`);
    exitCode = 1;
  } else {
    console.log(`[${ws.name}] fresh.`);
  }
}

if (exitCode === 0) console.log('OK — all built dist bundles are fresh.');
process.exit(exitCode);
