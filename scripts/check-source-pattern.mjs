#!/usr/bin/env node
// check-source-pattern.mjs — D3 of Phase 6.2 MCP CRUD Expansion plan.
//
// Asserts the F08 antipattern `(persisted as any)[field]` (or any variable
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
// Run from repo root: node scripts/check-source-pattern.mjs
// Exit codes: 0 = clean, 1 = antipattern found.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const HANDLERS_DIR = 'packages/foundry-module/src/handlers';

// Variables we look at — when a handler does `(<var> as any)[field]` it's the
// F08 antipattern. The fix is `(<var>._source as any)?.[field]`.
//
// We deliberately scan for the antipattern shape, not for `_source` presence,
// so that the alternative `(<var>._source as any)?.[<field>]` is OK.
const ANTIPATTERN = /\((note|token|region|scene|template|light|sound|tile|persisted)\s+as\s+any\)\s*\[(field|"[^"]+"|'[^']+')\]/;

let fail = 0;
const offenders = [];

for (const file of readdirSync(HANDLERS_DIR)) {
  if (!file.endsWith('.ts')) continue;
  const path = join(HANDLERS_DIR, file);
  const src = readFileSync(path, 'utf8');
  const lines = src.split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (ANTIPATTERN.test(line)) {
      offenders.push({ path, line: idx + 1, text: line.trim() });
      fail = 1;
    }
  });
}

if (fail === 0) {
  console.log(`✓ F08 _source pattern eradicated. No (<doc> as any)[field] usages found in handlers.`);
} else {
  console.error(`❌ F08 antipattern found in ${offenders.length} location(s):`);
  for (const o of offenders) {
    console.error(`  ${o.path}:${o.line}`);
    console.error(`    ${o.text}`);
  }
  console.error(`\nFix: use \`(<doc>._source as any)?.[field]\` instead — see embeddedCRUDFactory.ts DP-16 loop.`);
}

process.exit(fail);
