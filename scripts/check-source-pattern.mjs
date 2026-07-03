#!/usr/bin/env node
// check-source-pattern.mjs — D3 of Phase 6.2 MCP CRUD Expansion plan.
// Extended RC1.4 (mcp_code_quality_v2 Phase C1) to a small multi-rule runner: the original F08
// rule is UNCHANGED (top-level-only, same reporting shape); a second rule (DIALOG-PATH) walks
// handlers/modules/** recursively.
//
// Rule 1 (F08): Asserts the F08 antipattern `(persisted as any)[field]` (or any variable
// referring to the re-read post-update doc using a raw bracket access without
// `._source`) is eradicated from handlers/*.ts.
//
// The factory's DP-16 loop uses `(persisted._source as any)?.[field]` — the
// canonical pattern. Hand-rolled outliers (note / token / region) were
// retrofitted in Phase 6.2.7 (B1).
//
// Variables to check: persisted / persistedValue / note / token / region /
// scene / template / light / sound / tile.
//
// Rule 2 (DIALOG-PATH, CCR-V3): every non-test .ts under handlers/modules/** must carry a
// `// DIALOG-PATH: DIALOG_FREE|DIALOG_GUARDED|DIALOG_INVESTIGATED` anchor line within its first
// 50 lines (bounded window — a stray classification deep in the body can never satisfy it).
//
// Run from repo root: node scripts/check-source-pattern.mjs
// Exit codes: 0 = clean, 1 = antipattern/missing-header found.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const HANDLERS_DIR = 'packages/foundry-module/src/handlers';
const MODULES_DIR = join(HANDLERS_DIR, 'modules');

// ── Rule 1: F08 _source antipattern (top-level handlers/*.ts only, unchanged) ─────────────────
//
// We deliberately scan for the antipattern shape, not for `_source` presence,
// so that the alternative `(<var>._source as any)?.[<field>]` is OK.
const ANTIPATTERN = /\((note|token|region|scene|template|light|sound|tile|persisted)\s+as\s+any\)\s*\[(field|"[^"]+"|'[^']+')\]/;

let fail = 0;
const f08Offenders = [];

for (const file of readdirSync(HANDLERS_DIR)) {
  if (!file.endsWith('.ts')) continue;
  const path = join(HANDLERS_DIR, file);
  const src = readFileSync(path, 'utf8');
  const lines = src.split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (ANTIPATTERN.test(line)) {
      f08Offenders.push({ path, line: idx + 1, text: line.trim() });
      fail = 1;
    }
  });
}

if (f08Offenders.length === 0) {
  console.log(`✓ F08 _source pattern eradicated. No (<doc> as any)[field] usages found in handlers.`);
} else {
  console.error(`❌ F08 antipattern found in ${f08Offenders.length} location(s):`);
  for (const o of f08Offenders) {
    console.error(`  ${o.path}:${o.line}`);
    console.error(`    ${o.text}`);
  }
  console.error(`\nFix: use \`(<doc>._source as any)?.[field]\` instead — see embeddedCRUDFactory.ts DP-16 loop.`);
}

// ── Rule 2: DIALOG-PATH anchor (recursive walk over handlers/modules/**, non-test .ts) ─────────

/** Recursively collect non-test *.ts files under `dir`. */
function walkTs(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      out.push(...walkTs(full));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      out.push(full);
    }
  }
  return out;
}

const DIALOG_PATH_ANCHOR = /^\/\/\s*DIALOG-PATH:\s*(DIALOG_FREE|DIALOG_GUARDED|DIALOG_INVESTIGATED)\b/m;
const dialogPathOffenders = [];

for (const path of walkTs(MODULES_DIR)) {
  const src = readFileSync(path, 'utf8');
  const first50 = src.split(/\r?\n/).slice(0, 50).join('\n');
  if (!DIALOG_PATH_ANCHOR.test(first50)) {
    dialogPathOffenders.push(path);
    fail = 1;
  }
}

if (dialogPathOffenders.length === 0) {
  console.log(`✓ DIALOG-PATH anchor present on every handlers/modules/**/*.ts file.`);
} else {
  console.error(`❌ DIALOG-PATH anchor missing (or not within the first 50 lines) in ${dialogPathOffenders.length} file(s):`);
  for (const p of dialogPathOffenders) {
    console.error(`  ${p}`);
  }
  console.error(
    `\nFix: add "// DIALOG-PATH: DIALOG_FREE|DIALOG_GUARDED|DIALOG_INVESTIGATED — <one-line rationale>" ` +
      `near the top of the file (within the first 50 lines). See handlers/modules/backpack/backpack.ts for the format exemplar.`,
  );
}

process.exit(fail);
