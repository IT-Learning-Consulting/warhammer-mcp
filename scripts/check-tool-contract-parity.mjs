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
      inProperties = false;
      break;
    }
    // Detect field start at depth==2 (one inside properties, one for the field's own block).
    const fieldStart = line.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*\{/);
    if (fieldStart && !currentField) {
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

function main() {
  if (!statSync(SHARED_SCHEMAS_DIR, { throwIfNoEntry: false })) {
    fail(`check-tool-contract-parity: ${SHARED_SCHEMAS_DIR} not found (run from D:/foundry-vtt-mcp repo root)`, 2);
  }

  const schemaFiles = listTsFiles(SHARED_SCHEMAS_DIR);
  console.log(`Scanning ${schemaFiles.length} shared schema files for .nullable() fields vs inputSchema parity...`);
  const violations = [];
  const checked = [];

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
    for (const n of nullables) {
      const tool = toolFields.get(n.field);
      if (!tool) {
        // Field exists in Zod but not in inputSchema. Not a parity violation per se
        // (some Zod-only fields are for internal use). Report as INFO.
        checked.push({ status: 'INFO', detail: `field "${n.field}" is .nullable() in ${n.file}:${n.line} but absent from inputSchema in ${toolFile}` });
        continue;
      }
      if (!tool.type.includes('null')) {
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

  if (violations.length === 0) {
    console.log('\nOK — Zod .nullable() ↔ inputSchema type parity clean.');
    process.exit(0);
  }

  console.log('');
  console.log(`FAIL: ${violations.length} parity violation${violations.length === 1 ? '' : 's'} found (BUG-071-class drift).`);
  for (const v of violations) {
    console.log('');
    console.log(`  Field: ${v.field}`);
    console.log(`  Zod: ${v.schemaSource} — ${v.schemaSnippet}`);
    console.log(`  inputSchema: ${v.toolSource} — type: ${JSON.stringify(v.toolType)} (missing "null")`);
    console.log(`  Fix: change inputSchema type to ${JSON.stringify([...v.toolType, 'null'])}`);
  }
  console.log('');
  console.log('See validation_rubric DP-20 for the rule + remediation pattern.');
  process.exit(1);
}

main();
