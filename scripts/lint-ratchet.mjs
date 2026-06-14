#!/usr/bin/env node
// lint-ratchet.mjs — MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.3.2 (R0.4 / CCR-Complexity-Caps).
//
// Two-part ratchet (user decision Q3):
//   - eslint.config.mjs sets the complexity caps at WARN globally, so the 6000-line legacy files stay
//     visible (warnings in `npm run lint`) without failing the build — legacy debt is grandfathered.
//   - THIS script enforces the caps at ERROR on genuinely NEW files only (added vs the base ref + untracked).
//     New code must come in under the caps; modified legacy files are NOT ratcheted (a single touch to a
//     6000-line file must not block a PR, and their violations remain visible as warnings globally).
//
// Limitation (documented): new cap violations ADDED to an EXISTING file are warn-only (visible in
// `npm run lint`), not ratchet-blocked. A betterer-style committed baseline would close this; deferred —
// the Phase-3 services/ split + the services/*.ts error-600 override tighten the hot paths instead.
//
// New-file set: `git diff --diff-filter=A <base>...HEAD` (added since base) + `git ls-files --others
// --exclude-standard` (untracked). Base ref: $RATCHET_BASE (default "HEAD" — locally only untracked files
// are gated; CI sets RATCHET_BASE to the PR merge-base so added-on-branch files are gated too). A stale
// local origin/master would otherwise mark hundreds of long-existing files as "added".
// Caps are enforced with a self-contained config (overrideConfigFile) so no projectService is needed —
// the cap rules are purely syntactic. Test files are exempt (long describe() blocks expected).
//
// Run from repo root: node scripts/lint-ratchet.mjs
// Exit: 0 = new files within caps, 1 = a new file exceeds a cap, 2 = bad invocation.

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import tseslint from 'typescript-eslint';

const REPO_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const CAP_RULES = ['max-lines-per-function', 'complexity', 'max-depth', 'max-params', 'max-lines'];
const CAP_ERROR = {
  'max-lines-per-function': ['error', 60],
  complexity: ['error', 10],
  'max-depth': ['error', 3],
  'max-params': ['error', 4],
  'max-lines': ['error', 400],
};
const LINTABLE = /\.(ts|mjs|cjs|js)$/;
const TEST_GLOBS = ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts', '**/*.bench.ts', 'tests/**/*.ts'];

function tryGit(args) {
  try {
    return execSync(`git ${args}`, { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }
}

function newFiles() {
  const base = process.env.RATCHET_BASE || 'HEAD';
  const rel = new Set();
  if (tryGit(`rev-parse --verify --quiet ${base}`)) {
    for (const f of (tryGit(`diff --name-only --diff-filter=A ${base}...HEAD`) || '').split('\n')) if (f) rel.add(f);
  }
  for (const f of (tryGit('ls-files --others --exclude-standard') || '').split('\n')) if (f) rel.add(f);
  return [...rel].filter((f) => LINTABLE.test(f) && existsSync(join(REPO_ROOT, f)));
}

function makeEslint() {
  return new ESLint({
    cwd: REPO_ROOT,
    overrideConfigFile: true,
    overrideConfig: [
      { ignores: ['**/dist/**', '**/*.d.ts', '**/node_modules/**'] },
      {
        files: ['**/*.ts'],
        languageOptions: { parser: tseslint.parser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module' } },
        rules: CAP_ERROR,
      },
      { files: ['**/*.{mjs,cjs,js}'], rules: CAP_ERROR },
      { files: TEST_GLOBS, rules: Object.fromEntries(CAP_RULES.map((r) => [r, 'off'])) },
    ],
  });
}

function reportFile(relPath, messages) {
  console.error(`\n${relPath}`);
  for (const m of messages) console.error(`  ${m.line}:${m.column}  ${m.ruleId}  ${m.message}`);
}

async function main() {
  const targets = newFiles();
  if (targets.length === 0) {
    console.log('[lint-ratchet] No new lintable files — nothing to ratchet.');
    return 0;
  }
  const eslint = makeEslint();
  const results = await eslint.lintFiles(targets.map((f) => join(REPO_ROOT, f)));
  let violations = 0;
  for (const res of results) {
    const caps = res.messages.filter((m) => CAP_RULES.includes(m.ruleId));
    if (caps.length === 0) continue;
    violations += caps.length;
    reportFile(res.filePath.replace(REPO_ROOT + '\\', '').replace(REPO_ROOT + '/', ''), caps);
  }
  if (violations > 0) {
    console.error(`\n[lint-ratchet] ${violations} cap violation(s) in new files. Refactor or split before merging.`);
    return 1;
  }
  console.log(`[lint-ratchet] ${targets.length} new file(s) — all within complexity caps.`);
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error('[lint-ratchet] Unexpected error:', err?.message || err);
    process.exit(2);
  });
