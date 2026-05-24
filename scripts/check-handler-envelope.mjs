#!/usr/bin/env node
// check-handler-envelope.mjs — BUG-172 recurrence guard.
//
// Scans handlers/*.ts for bare object-literal `return {` in dispatch* switch
// case lines that lack a `success:` key — the antipattern introduced before
// the Envelope contract was established (BUG-105 class).
//
// A valid dispatcher switch case is one of:
//   case 'foo': return fn(input)        — function-call delegation (no bare object)
//   case 'foo': return { success: ...   — inline envelope (success: present)
//   default:    return { success: false — error envelope (success: present)
//
// A bare `case 'foo': return { notAnEnvelope: true }` is the violation this guard catches.
// Only lines that start a case AND have a bare `return {` inline are flagged.
// Multi-line returns, helper functions, and delegation returns are not flagged.
//
// Run from repo root: node scripts/check-handler-envelope.mjs
// Exit codes: 0 = clean, 1 = violation found.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const HANDLERS_DIR = 'packages/foundry-module/src/handlers';

// Match: `case '...': return {` (single-line) where `success:` is absent on the same line.
// Captures dispatch switch cases that return a bare object literal without the Envelope contract.
const DISPATCH_BARE_RETURN = /^\s*(?:case\s+['"`][^'"`]*['"`]|default)\s*:\s*return\s*\{(?!.*\bsuccess\s*:)/;

let fail = 0;
const offenders = [];

for (const file of readdirSync(HANDLERS_DIR)) {
  if (!file.endsWith('.ts')) continue;
  const filePath = join(HANDLERS_DIR, file);
  const src = readFileSync(filePath, 'utf8');
  const lines = src.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip comment lines
    if (/^\s*\/\//.test(line)) continue;
    if (DISPATCH_BARE_RETURN.test(line)) {
      offenders.push({ path: filePath, line: i + 1, text: line.trim() });
      fail = 1;
    }
  }
}

if (fail === 0) {
  console.log(`✓ Handler dispatch envelope contract clean. No bare non-success case-return found in handlers.`);
} else {
  console.error(`❌ Handler dispatch envelope violation in ${offenders.length} location(s) (BUG-172 class):`);
  for (const o of offenders) {
    console.error(`  ${o.path}:${o.line}`);
    console.error(`    ${o.text}`);
  }
  console.error(`\nFix: dispatcher case arms must delegate (return fn(input)) or return { success: ... }.`);
  console.error(`See: bugs_to_fix.md BUG-172, packages/foundry-module/src/handlers/*.ts`);
}

process.exit(fail);
