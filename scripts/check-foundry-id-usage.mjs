// mcp_code_quality_v2 Phase C2 (task 6.4, RC2.6-e) — FOUNDRY_ID re-centralization gate.
//
// INVARIANT: any schema field tagged `// polymorphic: not branded` in shared/src/schemas/*.ts
// MUST use the shared FOUNDRY_ID primitive (primitives.ts), never an inline bare `z.string(`.
// The 11-site inline regression this gate pins against re-grew AFTER Phase 13 centralized the
// primitive (audit XPK — decay-proven class; C2 task 5.2 re-swept it to 0).
//
// Scope: top-level shared/src/schemas/*.ts (the polymorphic-tag convention lives there; branded
// ids in branded-ids.ts intentionally inline z.string().min(1) — the brand IS the value — and
// modules/** is the branded-ID gate's domain in check-tool-contract-parity.mjs, not this one's).
//
// One-script-one-invariant convention (check-source-pattern.mjs sibling). Exit 1 on violations.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SCHEMAS_DIR = path.join(ROOT, 'shared', 'src', 'schemas');

const violations = [];

for (const entry of readdirSync(SCHEMAS_DIR)) {
  const full = path.join(SCHEMAS_DIR, entry);
  if (!statSync(full).isFile() || !entry.endsWith('.ts')) continue;
  const lines = readFileSync(full, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    if (!/\/\/.*polymorphic: not branded/.test(line)) return;
    // primitives.ts's own FOUNDRY_ID definition line is the canonical — everything else must
    // reference FOUNDRY_ID rather than inline z.string(.
    if (entry === 'primitives.ts' && /export const FOUNDRY_ID/.test(line)) return;
    if (/z\.string\(/.test(line)) {
      violations.push({ file: path.relative(ROOT, full), line: i + 1, source: line.trim() });
    }
  });
}

if (violations.length > 0) {
  console.error(`[check-foundry-id-usage] ${violations.length} violation(s) — polymorphic-tagged field(s) using inline z.string( instead of FOUNDRY_ID:`);
  for (const v of violations) console.error(`  ${v.file}:${v.line} — ${v.source}`);
  console.error("\nFix hint: import { FOUNDRY_ID } from './primitives.js' and use it for polymorphic doc-id fields.");
  process.exit(1);
}
console.log('[check-foundry-id-usage] OK — every polymorphic-tagged doc-id field uses the FOUNDRY_ID primitive.');
