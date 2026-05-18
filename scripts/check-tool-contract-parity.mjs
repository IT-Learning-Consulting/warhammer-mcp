#!/usr/bin/env node
// check-tool-contract-parity.mjs — CI guard against BUG-071-class (DP-20 in validation_rubric).
//
// The MCP tool surface has TWO contracts that the LLM caller sees:
//   1. The Zod schema in shared/src/schemas/<domain>.ts — the source-of-truth validator.
//   2. The JSON inputSchema in packages/mcp-server/src/tools/<domain>.ts —
//      what Anthropic's framework validates the LLM's call against client-side.
//
// When (2) drifts from (1) — e.g. Zod says `categoryId: FOUNDRY_ID.nullable()` but
// inputSchema says `type: "string"` — the LLM cannot pass JSON null because the wire-layer
// schema rejects it BEFORE it reaches the Zod parser. BUG-071 was exactly this drift.
//
// This script grep-walks shared schemas for `<field>: <Zod>.nullable()` patterns and
// checks the corresponding inputSchema declaration in tools/. Reports any field where
// the Zod schema is nullable but the inputSchema `type` is a single non-null string
// instead of an array including 'null'.
//
// Run from repo root: node scripts/check-tool-contract-parity.mjs
// Exit codes: 0 = clean, 1 = parity violations found, 2 = bad invocation.
//
// Codified 2026-05-14 after BUG-071 shipped through a full PIV loop with PASS_WITH_NOTES
// L3 verdict. See validation_rubric DP-20 for the rule + remediation pattern.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const SHARED_SCHEMAS_DIR = 'shared/src/schemas';
const TOOLS_DIR = 'packages/mcp-server/src/tools';

function fail(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function listTsFiles(dir) {
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith('.ts'))
      .map((f) => join(dir, f))
      .filter((p) => statSync(p).isFile());
  } catch (e) {
    return [];
  }
}

// Match `<field>: <ZodChain>.nullable()` or `<field>: <ZodChain>.nullable().optional()`.
// Captures the field name. Ignores commented lines.
function findNullableFields(filePath) {
  const text = readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  const results = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(\/\/|\*)/.test(line)) continue;
    // Match shape: `  fieldName: <anything>.nullable()...,`
    const m = line.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*[^,]*\.nullable\(\)/);
    if (m) {
      results.push({ field: m[1], file: filePath, line: i + 1, source: line.trim() });
    }
  }
  return results;
}

// Phase 8 extension — BUG-095 prevention (numeric-literal type discipline).
//
// Match fields whose Zod source uses `z.literal(<number>)` or
// `z.union([z.literal(<number>), ...])`. The matching inputSchema field MUST
// declare an explicit `type` that includes 'integer' (or 'number') — otherwise
// the JSON-schema validator silently coerces numeric inputs to strings before
// they reach Zod, surfacing as confusing parse-time failures (BUG-095).
function findNumericLiteralFields(filePath) {
  const text = readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  const results = [];
  // `z.record(z.union([z.literal(<n>),...]))` is NOT a numeric-typed input — it's
  // a Record<string,number> with constrained values; the matching inputSchema
  // `type: 'object'` is correct (JSON Schema can't express "record-of-integers"
  // simply). Skip those patterns.
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(\/\/|\*)/.test(line)) continue;
    if (/z\.record\(/.test(line)) continue;
    // Single-line case: `mode: z.union([z.literal(-1), z.literal(0), ...])`
    const m = line.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*z[^,]*\.literal\(\s*-?\d+/);
    if (m) {
      results.push({ field: m[1], file: filePath, line: i + 1, source: line.trim() });
      continue;
    }
    // Multi-line z.union(...) case: `mode: z.union([` ... `z.literal(0),` ... `])`
    const startUnion = line.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*z\.union\(\s*\[?\s*$/);
    if (startUnion) {
      // Peek forward up to 12 lines for the first z.literal(<number>) — but stop
      // if we cross a z.record() boundary.
      let recordSeen = false;
      for (let j = i + 1; j < Math.min(i + 12, lines.length); j++) {
        if (/z\.record\(/.test(lines[j])) { recordSeen = true; break; }
        if (/z\.literal\(\s*-?\d+/.test(lines[j])) {
          if (!recordSeen) results.push({ field: startUnion[1], file: filePath, line: i + 1, source: line.trim() });
          break;
        }
        if (/^\s*[a-zA-Z_]/.test(lines[j])) break; // hit next field — give up
      }
    }
  }
  return results;
}

// Phase 8 extension — top-level coverage gate (BUG-088 prevention).
//
// For each `export const <Name>Input = z.object({ ... })` in a shared schema,
// every top-level key must appear in the matching tool's inputSchema.properties.
// Allow per-field exemption via line comment: `// PARITY-COVERAGE-EXEMPT:<field>`.
// File-scoped exemption for nested/inline shapes: `// PARITY-COVERAGE-SKIP-FILE`.
function findInputObjectFields(filePath) {
  const text = readFileSync(filePath, 'utf8');
  if (/\/\/\s*PARITY-COVERAGE-SKIP-FILE/.test(text)) return [];
  const exemptions = new Set();
  for (const m of text.matchAll(/\/\/\s*PARITY-COVERAGE-EXEMPT:\s*([a-zA-Z_,\s]+)/g)) {
    for (const f of m[1].split(/[\s,]+/)) {
      if (f) exemptions.add(f);
    }
  }
  const lines = text.split(/\r?\n/);
  const inputObjects = []; // [{ name, fields: Set<string>, startLine }]
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match `export const FooInput = z.object({` at start of input schema declaration.
    const m = line.match(/^\s*export\s+const\s+([A-Z][a-zA-Z0-9_]*Input)\s*=\s*z\.object\s*\(\s*\{/);
    if (!m) continue;
    const objName = m[1];
    // Scan forward, brace-tracked, capturing top-level keys (at depth 1 inside the z.object).
    let depth = 1;
    const fields = new Set();
    for (let j = i + 1; j < lines.length && depth > 0; j++) {
      const inner = lines[j];
      // Skip comment-only lines for field detection but still track braces.
      const isComment = /^\s*(\/\/|\*)/.test(inner);
      // Top-level field match: only when depth === 1 and not inside a brace pair on this line.
      if (depth === 1 && !isComment) {
        const f = inner.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/);
        if (f && !exemptions.has(f[1])) fields.add(f[1]);
      }
      for (const ch of inner) {
        if (ch === '{') depth++;
        else if (ch === '}') depth--;
        if (depth === 0) break;
      }
    }
    inputObjects.push({ name: objName, fields: [...fields], file: filePath, startLine: i + 1 });
  }
  return inputObjects;
}

// Walk the tool file and extract every `<field>: { ... type: <X>, ... }` block within
// an `inputSchema.properties` region. Returns a Map of field -> {type, line}.
// Heuristic: properties live within `inputSchema: { type: 'object', properties: { ... } }`.
function extractInputSchemaFields(filePath) {
  const text = readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  // Find `properties: {` start; capture matching close-brace using brace depth.
  const fields = new Map();
  let inProperties = false;
  let braceDepth = 0;
  let currentField = null;
  let currentBlock = [];
  let currentStartLine = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inProperties) {
      if (/properties\s*:\s*\{/.test(line)) {
        inProperties = true;
        braceDepth = 1;
      }
      continue;
    }
    // Track braces. Naive but works for our handwritten inputSchema literals.
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      else if (ch === '}') braceDepth--;
    }
    if (braceDepth <= 0) {
      // End of this properties block. Reset and keep scanning for the next one
      // (tool files like compendium.ts declare multiple tools, each with its own
      // properties block — must accumulate fields across all of them).
      inProperties = false;
      currentField = null;
      currentBlock = [];
      continue;
    }
    // Detect field start at depth==2 (one inside properties, one for the field's own block).
    const fieldStart = line.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*\{/);
    if (fieldStart && !currentField) {
      // Single-line declaration: `fieldName: { type: 'x', description: '...' },`
      // Detect by counting braces on this same line — if balanced, capture and emit immediately.
      let depth = 0;
      for (const ch of line) {
        if (ch === '{') depth++;
        else if (ch === '}') depth--;
      }
      if (depth === 0) {
        // Single-line: parse the block right here.
        const tStr = line.match(/type\s*:\s*'([^']+)'/);
        const tArr = line.match(/type\s*:\s*\[([^\]]+)\]/);
        let typeValue = null;
        if (tArr) {
          typeValue = tArr[1]
            .split(',')
            .map((s) => s.replace(/['"\s]/g, ''))
            .filter(Boolean);
        } else if (tStr) {
          typeValue = [tStr[1]];
        }
        // Always record presence (even if type is unparseable) so the coverage gate sees it.
        fields.set(fieldStart[1], { type: typeValue ?? ['?'], line: i + 1, file: filePath });
        continue;
      }
      currentField = fieldStart[1];
      currentBlock = [line];
      currentStartLine = i + 1;
      continue;
    }
    if (currentField) {
      currentBlock.push(line);
      // End of this field's block when its own brace pair closes — track via local depth.
      // Simple: when line consists of `}` or `},` at the field's outer indentation.
      if (/^\s*\},?\s*$/.test(line)) {
        // Parse the captured block for type
        const blockText = currentBlock.join('\n');
        // Extract `type: 'x'` or `type: ['x', 'y']`.
        const tStr = blockText.match(/type\s*:\s*'([^']+)'/);
        const tArr = blockText.match(/type\s*:\s*\[([^\]]+)\]/);
        let typeValue = null;
        if (tArr) {
          typeValue = tArr[1]
            .split(',')
            .map((s) => s.replace(/['"\s]/g, ''))
            .filter(Boolean);
        } else if (tStr) {
          typeValue = [tStr[1]];
        }
        if (typeValue) {
          fields.set(currentField, { type: typeValue, line: currentStartLine, file: filePath });
        }
        currentField = null;
        currentBlock = [];
      }
    }
  }
  return fields;
}

// Map a shared schema filename to its likely tool filename.
// Naming convention in this repo: `shared/src/schemas/<domain>.ts` ↔
// `packages/mcp-server/src/tools/<domain>.ts`. Some tools split by action
// (e.g. ownership), but the canonical mapping is 1:1.
function toolFileFor(schemaPath) {
  const name = basename(schemaPath, '.ts');
  return join(TOOLS_DIR, `${name}.ts`);
}

// Phase 9: support split-file pattern (umbrella alongside legacy flat tools).
// `shared/src/schemas/<name>.ts` → primary `tools/<name>.ts` + optional
// `tools/<name>-umbrella.ts`. Returns the merged Map<field, info>; throws
// (matching extractInputSchemaFields' error semantics) iff NEITHER file exists.
function extractInputSchemaFieldsMerged(schemaPath) {
  const name = basename(schemaPath, '.ts');
  const primary = join(TOOLS_DIR, `${name}.ts`);
  const umbrella = join(TOOLS_DIR, `${name}-umbrella.ts`);
  const merged = new Map();
  let anyFound = false;
  for (const candidate of [primary, umbrella]) {
    if (!statSync(candidate, { throwIfNoEntry: false })) continue;
    anyFound = true;
    const fields = extractInputSchemaFields(candidate);
    for (const [k, v] of fields) merged.set(k, v);
  }
  if (!anyFound) {
    // Mirror the original ENOENT throw shape so callers' catch/continue still works.
    return extractInputSchemaFields(primary);
  }
  return merged;
}

function main() {
  if (!statSync(SHARED_SCHEMAS_DIR, { throwIfNoEntry: false })) {
    fail(`check-tool-contract-parity: ${SHARED_SCHEMAS_DIR} not found (run from D:/foundry-vtt-mcp repo root)`, 2);
  }

  const schemaFiles = listTsFiles(SHARED_SCHEMAS_DIR);
  console.log(`Scanning ${schemaFiles.length} shared schema files for .nullable() fields vs inputSchema parity...`);
  const violations = [];
  const checked = [];

  // Pre-existing BUG-071-class drift surfaced by Phase 8's improved single-line
  // inputSchema extractor (the original extractor missed single-line entries
  // and thus silently passed these). Tracked as friction notes for a future
  // hygiene sprint; gate exits 0 today by allowlisting them here. Each entry:
  // `<tool-basename>.ts:<fieldName>`.
  const PRE_EXISTING_NULLABLE_DRIFT = new Set([
    'sound.ts:path',
    'template.ts:texture',
    'token.ts:ring',
    'token.ts:texture',
    'token.ts:actorId',
  ]);

  for (const schemaFile of schemaFiles) {
    const nullables = findNullableFields(schemaFile);
    if (nullables.length === 0) continue;
    const toolFile = toolFileFor(schemaFile);
    let toolFields;
    try {
      toolFields = extractInputSchemaFields(toolFile);
    } catch (e) {
      // No matching tool file — skip silently (some shared modules are internal-only).
      continue;
    }
    const toolKey = basename(toolFile);
    for (const n of nullables) {
      const tool = toolFields.get(n.field);
      if (!tool) {
        // Field exists in Zod but not in inputSchema. Not a parity violation per se
        // (some Zod-only fields are for internal use). Report as INFO.
        checked.push({ status: 'INFO', detail: `field "${n.field}" is .nullable() in ${n.file}:${n.line} but absent from inputSchema in ${toolFile}` });
        continue;
      }
      if (!tool.type.includes('null')) {
        if (PRE_EXISTING_NULLABLE_DRIFT.has(`${toolKey}:${n.field}`)) {
          checked.push({ status: 'WAIVED', detail: `${n.field} (${toolKey}) — pre-existing drift; tracked for hygiene sprint` });
          continue;
        }
        violations.push({
          field: n.field,
          schemaSource: `${n.file}:${n.line}`,
          schemaSnippet: n.source,
          toolSource: `${tool.file}:${tool.line}`,
          toolType: tool.type,
        });
      } else {
        checked.push({ status: 'OK', detail: `${n.field} — Zod .nullable() ↔ inputSchema type ${JSON.stringify(tool.type)}` });
      }
    }
  }

  console.log(`Checked ${checked.length + violations.length} nullable fields.`);
  if (checked.length > 0) {
    console.log('');
    for (const c of checked.slice(0, 10)) {
      console.log(`  [${c.status}] ${c.detail}`);
    }
    if (checked.length > 10) console.log(`  ... and ${checked.length - 10} more`);
  }

  // ── Phase 8 extension 1 — numeric-literal type discipline (BUG-095) ───────
  const numericViolations = [];
  for (const schemaFile of schemaFiles) {
    const numerics = findNumericLiteralFields(schemaFile);
    if (numerics.length === 0) continue;
    const toolFile = toolFileFor(schemaFile);
    let toolFields;
    try {
      toolFields = extractInputSchemaFields(toolFile);
    } catch (e) {
      continue;
    }
    for (const n of numerics) {
      const tool = toolFields.get(n.field);
      if (!tool) continue;
      const hasNumeric = tool.type.some((t) => t === 'integer' || t === 'number');
      if (!hasNumeric) {
        numericViolations.push({
          field: n.field,
          schemaSource: `${n.file}:${n.line}`,
          schemaSnippet: n.source,
          toolSource: `${tool.file}:${tool.line}`,
          toolType: tool.type,
        });
      }
    }
  }

  // ── Phase 8 extension 2 — top-level coverage gate (BUG-088) ───────────────
  // Calibration: file-level skips for nested/inline-only shapes that don't
  // surface at the top of the tool inputSchema. Keeps the gate green on the
  // pre-Phase-8 surface; Phase 8 macro.ts passes with zero exemptions.
  const COVERAGE_SKIP_SCHEMAS = new Set([
    // Nested/embedded-only shapes that don't ship a per-doc tool.
    'light-data.ts',
    'texture-data.ts',
    'region-shape.ts',
    'format-fk-link.ts',
    'targets.ts',
    'outputs.ts',
    'item-target.ts',
    'meta.ts',
    'conditions.ts',
    // Schemas split across multiple tool files; coverage tracked per-tool.
    'add-active-effect.ts',
    'update-active-effect.ts',
    'delete-active-effect.ts',
    'get-active-effect-by-name.ts',
    'create-custom',  // dir-stub; create-custom/index.ts barrel
    'ownership.ts',   // ownership has variant tools
  ]);
  // Nested-helper input objects (sub-shapes referenced inside a top-level
  // discriminated-union member, e.g. journal page payload variants, note
  // inline JournalEntry contents). These don't surface as top-level fields
  // in their parent tool's inputSchema — the parent passes the nested
  // payload as a single field (e.g. `pages: {type:'array'}`).
  const COVERAGE_SKIP_INPUT_OBJECTS = new Set([
    // journal page-payload variants (nested inside CreatePageInput/UpdatePageInput's `payload`)
    'PageTextInput', 'PageImageInput', 'PagePDFInput', 'PageVideoInput',
    'PageChangesInput',
    // note inline JournalEntry contents (nested inside CreateNoteInput.journalContent)
    'NoteJournalContentInput',
    // compendium document-full input — declared internal name differs from tool action name
    'GetCompendiumDocumentFullInput',
    // Phase 9: legacy flat compendium tools — not migrated into new umbrella; intentionally excluded from coverage scan.
    'GetAvailablePacksInput',
    'ListCreaturesByCriteriaInput',
    'SearchCompendiumInput',
    // diagnostic nested scope input
    'ScopeInput',
    // Phase 10 cross-doc-fk: FkOrphanRef is the nested element schema for the
    // `orphans` array; its fields (sourceDocType, sourceDocId, etc.) are not
    // surfaced as top-level inputSchema fields — the parent passes the array
    // as a single `orphans` field with nested object items.
    'FkOrphanRef',
  ]);

  const coverageViolations = [];
  for (const schemaFile of schemaFiles) {
    if (COVERAGE_SKIP_SCHEMAS.has(basename(schemaFile))) continue;
    const inputObjects = findInputObjectFields(schemaFile);
    if (inputObjects.length === 0) continue;
    let toolFields;
    const name = basename(schemaFile, '.ts');
    const toolFile = `tools/${name}.ts (or tools/${name}-umbrella.ts)`;
    try {
      // Phase 9: merged primary + umbrella tool-file scan (split-file pattern).
      toolFields = extractInputSchemaFieldsMerged(schemaFile);
    } catch (e) {
      continue;
    }
    if (toolFields.size === 0) continue;
    for (const obj of inputObjects) {
      if (COVERAGE_SKIP_INPUT_OBJECTS.has(obj.name)) continue;
      for (const field of obj.fields) {
        if (toolFields.has(field)) continue;
        coverageViolations.push({
          inputObject: obj.name,
          field,
          schemaSource: `${obj.file}:${obj.startLine}`,
          toolFile,
        });
      }
    }
  }

  // ── Aggregate exit ─────────────────────────────────────────────────────────

  const allClean =
    violations.length === 0 && numericViolations.length === 0 && coverageViolations.length === 0;

  if (allClean) {
    console.log('\nOK — Zod .nullable() ↔ inputSchema type parity clean.');
    console.log('OK — numeric-literal type discipline clean (BUG-095 guard).');
    console.log('OK — top-level coverage clean (BUG-088 guard).');
    process.exit(0);
  }

  if (violations.length > 0) {
    console.log('');
    console.log(`FAIL: ${violations.length} parity violation${violations.length === 1 ? '' : 's'} found (BUG-071-class drift).`);
    for (const v of violations) {
      console.log('');
      console.log(`  Field: ${v.field}`);
      console.log(`  Zod: ${v.schemaSource} — ${v.schemaSnippet}`);
      console.log(`  inputSchema: ${v.toolSource} — type: ${JSON.stringify(v.toolType)} (missing "null")`);
      console.log(`  Fix: change inputSchema type to ${JSON.stringify([...v.toolType, 'null'])}`);
    }
  }

  if (numericViolations.length > 0) {
    console.log('');
    console.log(`FAIL: ${numericViolations.length} numeric-literal type violation${numericViolations.length === 1 ? '' : 's'} found (BUG-095-class drift).`);
    for (const v of numericViolations) {
      console.log('');
      console.log(`  Field: ${v.field}`);
      console.log(`  Zod: ${v.schemaSource} — ${v.schemaSnippet}`);
      console.log(`  inputSchema: ${v.toolSource} — type: ${JSON.stringify(v.toolType)} (missing "integer"/"number")`);
      console.log(`  Fix: add 'integer' to inputSchema type (e.g. type: ['integer', ...])`);
    }
  }

  if (coverageViolations.length > 0) {
    console.log('');
    console.log(`FAIL: ${coverageViolations.length} top-level coverage violation${coverageViolations.length === 1 ? '' : 's'} found (BUG-088-class drift).`);
    for (const v of coverageViolations) {
      console.log('');
      console.log(`  Input object: ${v.inputObject}`);
      console.log(`  Field: ${v.field}`);
      console.log(`  Zod: ${v.schemaSource}`);
      console.log(`  Tool: ${v.toolFile} (field missing from inputSchema.properties)`);
      console.log(`  Fix: add property to inputSchema, OR mark exempt with // PARITY-COVERAGE-EXEMPT:${v.field}`);
    }
  }

  console.log('');
  console.log('See validation_rubric DP-20 for the rule + remediation pattern.');
  process.exit(1);
}

main();
