// mcp_code_quality_v2 Phase C2 (task 6.1, RC2.3) — CCR-V8 inputSchema every-prop-typed gate.
//
// RULE (ccr-v8-inputschema-spec.md §RULE — implemented FROM the spec, not re-derived): every
// property in every tool's getToolDefinitions() inputSchema MUST declare ≥1 of `type` / `enum` /
// `oneOf` / `anyOf` / `const`. A description-only property is a violation regardless of scalarity —
// an untyped param JSON-stringifies across the MCP transport boundary (F04, live-smoke-only class:
// narrate(["a","b"]) arrived as the literal string '["a","b"]' — phase10 carry-forward:92-110).
//
// Detection (spec §Detection method): static source walk over packages/mcp-server/src/tools/**/*.ts;
// per-property object scan under each `properties: {` block; nearest-`name:` backscan for tool
// attribution (same technique as check-readonly-annotations.mjs). NO allowlist escape — S2's spec
// deliberately grants zero exceptions (a legitimate description-only class, should one ever appear,
// requires a journal ADR, never a silent allowlist).
//
// One-script-one-invariant convention (spec §Standalone-script convention). Exit 1 on violations.

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const TOOLS_DIR = path.join(ROOT, 'packages', 'mcp-server', 'src', 'tools');

// Optional override for the vitest F04-fixture harness: scan a single file instead of TOOLS_DIR.
const scanTarget = process.argv[2];

const TYPE_KEYS = ['type', 'enum', 'oneOf', 'anyOf', 'const'];

function walkTs(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkTs(full));
    else if (entry.isFile() && entry.name.endsWith('.ts')) out.push(full);
  }
  return out;
}

// mcp_code_quality_v2 Phase F (BUG-438) — matchBrace was refactored (behavior-identical) into small
// predicate/skip helpers purely to bring lint-ratchet's cyclomatic-complexity (20>10) and max-depth
// (4>3) caps into range; the string/comment-aware brace-matching algorithm itself is unchanged.

function isQuoteChar(ch) {
  return ch === "'" || ch === '"' || ch === '`';
}

function isLineCommentStart(src, i) {
  return src[i] === '/' && src[i + 1] === '/';
}

function isBlockCommentStart(src, i) {
  return src[i] === '/' && src[i + 1] === '*';
}

/** Advance past a quoted string literal starting just after its opening `quote` char at `i`. */
function skipStringLiteral(src, i, quote) {
  while (i < src.length) {
    if (src[i] === '\\') { i += 2; continue; }
    if (src[i] === quote) return i + 1;
    i++;
  }
  return i;
}

/** Advance past a `// ...` line comment starting at `i`. */
function skipLineComment(src, i) {
  while (i < src.length && src[i] !== '\n') i++;
  return i;
}

/** Advance past a `/* ... *\/` block comment starting at `i`. */
function skipBlockComment(src, i) {
  i += 2;
  while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
  return i + 2;
}

/**
 * Find the offset of the matching close-brace for the open-brace at `openIdx`.
 * String- and comment-aware: braces inside '…', "…", `…`, // and /* comments are ignored
 * (property descriptions routinely contain literal braces — a naive counter mis-scopes the block).
 */
function matchBrace(src, openIdx) {
  let depth = 0;
  let i = openIdx;
  while (i < src.length) {
    const ch = src[i];
    if (isQuoteChar(ch)) {
      i = skipStringLiteral(src, i + 1, ch);
      continue;
    }
    if (isLineCommentStart(src, i)) {
      i = skipLineComment(src, i);
      continue;
    }
    if (isBlockCommentStart(src, i)) {
      i = skipBlockComment(src, i);
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
    i++;
  }
  return -1;
}

/** Nearest-`name:` backscan — attribute a source offset to its enclosing tool definition. */
function nearestToolName(src, offset) {
  const before = src.slice(0, offset);
  const matches = [...before.matchAll(/name:\s*['"`]([A-Za-z0-9._-]+)['"`]/g)];
  return matches.length ? matches[matches.length - 1][1] : '(unattributed)';
}

function lineOf(src, offset) {
  return src.slice(0, offset).split('\n').length;
}

/**
 * DIRECT keys of a property schema object: strip nested braces/brackets first so a TYPE_KEY inside
 * a nested `properties:`/`items:` sub-schema doesn't falsely satisfy the OUTER property's check.
 * Extracted out of scanPropertiesBlock (BUG-438) purely to keep that function's complexity in range —
 * the strip algorithm itself is unchanged.
 */
function stripNestedBraces(body) {
  let flat = '';
  let depth = 0;
  for (const ch of body) {
    if (ch === '{' || ch === '[') { depth++; continue; }
    if (ch === '}' || ch === ']') { depth--; continue; }
    if (depth === 0) flat += ch;
  }
  return flat;
}

/**
 * Scan ONE `properties: {` block body (already brace-matched) for property entries.
 * Top-level entries in the block are `propName: { ...schema... },`. For each, check the schema
 * object's DIRECT keys for ≥1 TYPE_KEY. Nested `properties:` blocks inside object-typed props are
 * scanned by the outer matchAll (they are also `properties: {` occurrences in the same file).
 * `ctx` bundles `{ file, errors }` (BUG-438: kept the call under the 4-param lint-ratchet cap).
 */
function scanPropertiesBlock(src, blockStart, blockEnd, ctx) {
  const { file, errors } = ctx;
  let i = blockStart;
  while (i < blockEnd) {
    // find next property key at this nesting level (leading commas + comments tolerated —
    // the missing `,` skip was a live false-negative bug caught during the fixture proof:
    // only the FIRST property of every block was being scanned)
    const rest = src.slice(i, blockEnd);
    const keyMatch = rest.match(/^[\s,]*(?:\/\/[^\n]*\n[\s,]*)*['"`]?([A-Za-z_$][A-Za-z0-9_$]*)['"`]?:\s*\{/);
    if (!keyMatch) break;
    const keyIdx = i + keyMatch[0].length - 1; // offset of the '{'
    const close = matchBrace(src, keyIdx);
    if (close === -1 || close > blockEnd) break;
    const propName = keyMatch[1];
    const body = src.slice(keyIdx + 1, close);
    const flat = stripNestedBraces(body);
    const hasTypeKey = TYPE_KEYS.some((k) => new RegExp(`(^|[\\s,])${k}\\s*:`).test(flat));
    // spread-composed props (e.g. `...paginationFields()`) are opaque here; a spread at depth 0
    // means the shape comes from a helper — treat presence of a spread as pass-through only if no
    // literal keys exist at all (helpers are themselves schema-typed at their definition site).
    const hasSpread = /\.\.\./.test(flat);
    if (!hasTypeKey && !hasSpread) {
      errors.push({
        tool: nearestToolName(src, keyIdx),
        property: propName,
        file: path.relative(ROOT, file),
        line: lineOf(src, keyIdx),
      });
    }
    i = close + 1;
  }
}

function scanFile(file, errors) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/properties:\s*\{/g)) {
    const openIdx = m.index + m[0].length - 1;
    const close = matchBrace(src, openIdx);
    if (close === -1) continue;
    scanPropertiesBlock(src, openIdx + 1, close, { file, errors });
  }
}

const errors = [];
const files = scanTarget ? [path.resolve(scanTarget)] : walkTs(TOOLS_DIR);
for (const f of files) scanFile(f, errors);

if (errors.length > 0) {
  console.error(`[check-inputschema-nonscalar] ${errors.length} violation(s):`);
  for (const e of errors) {
    console.error(`  ${e.file}:${e.line} — tool "${e.tool}" property "${e.property}" declares none of ${TYPE_KEYS.join('/')}`);
  }
  console.error(
    '\nFix hint: every inputSchema property must declare at least one of type/enum/oneOf/anyOf/const.' +
    '\nScalar unions use oneOf (see narrator.ts `message`/`value`, ownership.ts `level` precedents).' +
    '\nAn untyped, description-only property is JSON-stringified across the MCP boundary (F04).',
  );
  process.exit(1);
}
console.log(`[check-inputschema-nonscalar] OK — ${files.length} tool file(s) scanned, every inputSchema property carries a type-bearing key.`);
