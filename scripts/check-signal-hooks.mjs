#!/usr/bin/env node
// check-signal-hooks.mjs — MCP Code-Quality Hardening v1, Phase 10 (R10.1 / CCR-Lifecycle; ADR-007 living guardrail, NF8).
//
// Build-time guardrail (wired into build:foundry). Fails the build (exit 1) when a PERSISTENT
// listener is attached OUTSIDE packages/foundry-module/src/utils/lifecycle.ts without going through
// the lifecycle registry — so future MCP additions can't silently regress the leak surface that
// Phase 10 closed.
//
// Parser-not-grep: a lightweight tokenizer blanks comments + string/template literals before
// matching, fixing both failure modes of the PRD's raw `grep "Hooks.on(" | grep -v "{ signal:"`:
//   - false POSITIVES — comment lines (health-check.ts doc-block) + the chat-commander.ts
//     macro-generator template string that literally contains `Hooks.on(` are ignored.
//   - false NEGATIVES (a false PASS) — the cast form `(Hooks as any).on(` and the alias
//     `hooksApi.on(` ARE detected; the raw `grep "Hooks.on("` misses both.
//
// Detected forms: Hooks.on( · (Hooks as any).on( · hooksApi.on( · game.socket(?.)on( ·
//                 window.addEventListener(
//
// EXEMPTIONS (allowlist) — each serves zero persistent-leak surface (HC11):
//   - utils/lifecycle.ts                  — owns the on/off pairing; the registry itself.
//   - data-access.ts (Hooks as any).on('updateActor')        — ephemeral, Hooks.off in finally{}.
//   - actor-update-observer.ts hooksApi.on('updateActor')    — ephemeral, hooksApi.off in finally{}.
//   - market.ts (Hooks as any).on('updateItem')               — ephemeral one-shot promise-race
//     (BUG-430 F-0B-3, Q&A decision 2026-07-03): directPayCommand's internal write is
//     fire-and-forget, so the site races a Promise against a 2s timeout and tears the
//     listener down via Hooks.off in finally{} — structurally identical to the two
//     exemptions above, not a persistent-leak surface.
//   - window.addEventListener('beforeunload')                — intentionally permanent (it IS teardown).
//   - window.addEventListener(..., { signal })               — already torn down on abort.
//   (Hooks.once(, jQuery .click(, and el.addEventListener( are not matched by the patterns.)
//
// Run from repo root: node scripts/check-signal-hooks.mjs
// Exit codes: 0 = clean, 1 = an un-registered persistent listener found.

import { readFileSync, readdirSync } from 'node:fs';

const SRC_DIR = 'packages/foundry-module/src';
const SELF = 'utils/lifecycle.ts'; // the registry file — exempt in full.

const PATTERNS = [
  { name: 'Hooks.on(', re: /\bHooks\.on\s*\(/g },
  { name: '(Hooks as any).on(', re: /\(\s*Hooks\s+as\s+any\s*\)\s*\.on\s*\(/g },
  { name: 'hooksApi.on(', re: /\bhooksApi\.on\s*\(/g },
  { name: 'game.socket.on(', re: /\bgame\.socket(?:\?\.|\.)on\s*\(/g },
  { name: 'window.addEventListener(', re: /\bwindow\.addEventListener\s*\(/g },
];

/** Blank chars[start..end) with spaces, preserving newlines (so line numbers stay accurate). */
function blankRange(chars, start, end) {
  const stop = Math.min(end, chars.length);
  for (let k = start; k < stop; k++) {
    if (chars[k] !== '\n') chars[k] = ' ';
  }
}

/** Index just past the matching unescaped close quote (handles \-escapes; templates blanked whole). */
function endOfString(src, openIdx, quote) {
  let k = openIdx + 1;
  while (k < src.length) {
    const c = src[k];
    if (c === '\\') {
      k += 2;
      continue;
    }
    if (c === quote) return k + 1;
    k++;
  }
  return src.length;
}

/**
 * Return `src` with comment + string/template-literal spans blanked to spaces. Monotonic single
 * pass: at each code position we test for a comment or string opener and jump past the whole span,
 * so `//` inside a string and `'` inside a comment are never misread.
 */
function stripCode(src) {
  const chars = src.split('');
  let i = 0;
  while (i < src.length) {
    const two = src.slice(i, i + 2);
    if (two === '//') {
      const nl = src.indexOf('\n', i);
      const end = nl === -1 ? src.length : nl;
      blankRange(chars, i, end);
      i = end;
    } else if (two === '/*') {
      const close = src.indexOf('*/', i + 2);
      const end = close === -1 ? src.length : close + 2;
      blankRange(chars, i, end);
      i = end;
    } else if (src[i] === "'" || src[i] === '"' || src[i] === '`') {
      const end = endOfString(src, i, src[i]);
      blankRange(chars, i, end);
      i = end;
    } else {
      i++;
    }
  }
  return chars.join('');
}

function lineAt(raw, idx) {
  return raw.slice(0, idx).split('\n').length;
}

function lineTextAt(raw, idx) {
  const start = raw.lastIndexOf('\n', idx - 1) + 1;
  const nl = raw.indexOf('\n', idx);
  return raw.slice(start, nl === -1 ? raw.length : nl).trim();
}

/** True when a detected form is on the documented allowlist (zero persistent-leak surface). */
function isExempt(rel, name, slice) {
  if (name === '(Hooks as any).on(' && rel.endsWith('data-access.ts') && slice.includes("'updateActor'")) {
    return true;
  }
  if (name === 'hooksApi.on(' && rel.endsWith('actor-update-observer.ts') && slice.includes("'updateActor'")) {
    return true;
  }
  if (name === '(Hooks as any).on(' && rel.endsWith('market.ts') && slice.includes("'updateItem'")) {
    return true;
  }
  if (name === 'window.addEventListener(' && (slice.includes("'beforeunload'") || /\{\s*signal/.test(slice))) {
    return true;
  }
  return false;
}

function scanFile(rel, raw) {
  const code = stripCode(raw);
  const offenders = [];
  for (const { name, re } of PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(code)) !== null) {
      const slice = raw.slice(m.index, m.index + 160);
      if (isExempt(rel, name, slice)) continue;
      offenders.push({ rel, line: lineAt(raw, m.index), name, text: lineTextAt(raw, m.index) });
    }
  }
  return offenders;
}

/** Recursively collect non-test .ts files under `dir`, returning forward-slash relative paths. */
function collectTs(dir, acc) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules' || entry.name === 'dist') continue;
      collectTs(rel, acc);
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      acc.push(rel);
    }
  }
  return acc;
}

const files = collectTs(SRC_DIR, []);
const offenders = [];
for (const rel of files) {
  if (rel.endsWith(SELF)) continue; // lifecycle.ts owns these forms.
  offenders.push(...scanFile(rel, readFileSync(rel, 'utf8')));
}

if (offenders.length === 0) {
  console.log('✓ check-signal-hooks: no un-registered persistent listeners outside utils/lifecycle.ts.');
  process.exit(0);
}

console.error(`❌ check-signal-hooks: ${offenders.length} persistent listener(s) attached outside utils/lifecycle.ts:`);
for (const o of offenders) {
  console.error(`  ${o.rel}:${o.line}  [${o.name}]`);
  console.error(`    ${o.text}`);
}
console.error(
  '\nFix: route through utils/lifecycle.ts (registerHook / registerSocket / registerDomListener) so ' +
    'teardownAll() can deregister it. If this site is genuinely self-cleaning (Hooks.off in finally) or ' +
    'intentionally permanent, add it to the allowlist in isExempt() with a logged rationale.'
);
process.exit(1);
