// Phase 11 (R11.2): static proof that every `readOnlyHint: true` MCP tool's
// handler chain never writes a Foundry document.
//
// Annotations already exist on every tool (Phase 11 adds NO annotations) — this
// script is the VERIFYING gate: a future edit that turns a read tool into a writer
// while leaving `readOnlyHint: true` in place is a silent contract lie. This check
// fails the build on that.
//
// Design (pre-plan §"Tool annotations & readonly check"):
//   1. AUTO-DETECT every `readOnlyHint: true` tool NAME in the mcp-server tool
//      source (so a newly-added read tool is forced into the curated map below).
//   2. CURATED MAP: each readonly tool name → the foundry-module queries.ts handler
//      method(s) its query key routes to (key→handler tracing is static but not
//      cheaply regex-derivable across the umbrella dispatch, so it is curated).
//   3. Extract each handler METHOD BODY from queries.ts and grep for write calls
//      (.create/.update/.delete/.*EmbeddedDocuments) + wrappedWrite( / verifyDocWrite(.
//
// FAIL (exit 1) if: a write pattern hits a readonly handler body, OR a detected
// readonly tool is absent from the curated map, OR a mapped method is not found in
// queries.ts (the map drifted).

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const TOOLS_DIR = path.join(ROOT, 'packages', 'mcp-server', 'src', 'tools');
const QUERIES_FILE = path.join(ROOT, 'packages', 'foundry-module', 'src', 'queries.ts');

/** Recursively collect *.ts files under a directory (node18-safe; no globSync). */
function walkTs(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkTs(full));
    else if (entry.isFile() && entry.name.endsWith('.ts')) out.push(full);
  }
  return out;
}

// readonly tool name → queries.ts handler method(s) the tool's query key routes to.
// Tracing verified against queries.ts handlerTable + each tool's this.query('<key>').
const CURATED = {
  'get-character': ['handleGetCharacterInfo'],
  'list-characters': ['handleListActors'],
  'search-compendium': ['handleSearchCompendium'],
  'get-compendium-item': ['handleGetCompendiumDocumentFull'],
  'list-creatures-by-criteria': ['handleListCreaturesByCriteria'],
  'list-compendium-packs': ['handleGetAvailablePacks'],
  'get-compendium-entry-full': ['handleGetCompendiumDocumentFull'],
  'get-wfrp-config': ['handleGetWfrp4eConfig'],
  'get-active-effect-by-name': ['handleGetActiveEffectByName'],
  'list-active-effects': ['handleListActiveEffects', 'handleGetCharacterInfo'],
  'list-actor-items': ['handleListActorItems'],
  'get-combat': ['handleGetCombat'],
  'list-combatants': ['handleListCombatants', 'handleGetCombat'],
  'list-conditions': ['handleListConditions'],
  'get-world-info': ['handleGetWorldInfo'],
  'diagnostic': ['handleDiagnostic'],
  'dice-roll': ['handleDiceRoll'],
  'module-probe': ['handleModuleProbe'],
  'module-lighting': ['handleModuleLighting'],
};

const WRITE_PATTERNS = [
  /\.(create|update|delete|createEmbeddedDocuments|updateEmbeddedDocuments|deleteEmbeddedDocuments)\s*\(/,
  /\bwrappedWrite\s*\(/,
  /\bverifyDocWrite\s*\(/,
];

/** Detect `readOnlyHint: true` tool names: nearest preceding `name: '<X>'` within 12 lines. */
function detectReadonlyTools() {
  const found = new Set();
  const files = walkTs(TOOLS_DIR);
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (!/readOnlyHint:\s*true/.test(lines[i])) continue;
      for (let j = i; j >= Math.max(0, i - 12); j--) {
        const m = lines[j].match(/name:\s*'([^']+)'/);
        if (m) { found.add(m[1]); break; }
      }
    }
  }
  return found;
}

/** Extract a method body from source text by brace-matching from `<name>(`. Returns '' if not found. */
function extractMethodBody(src, methodName) {
  const sigRe = new RegExp(`\\b${methodName}\\s*\\(`);
  const sigMatch = sigRe.exec(src);
  if (!sigMatch) return null;
  // Find the first '{' after the signature's matching ')'.
  let i = sigMatch.index;
  // advance to the opening brace of the method body
  const braceStart = src.indexOf('{', i);
  if (braceStart < 0) return null;
  let depth = 0;
  for (let k = braceStart; k < src.length; k++) {
    const ch = src[k];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return src.slice(braceStart, k + 1);
    }
  }
  return src.slice(braceStart); // unbalanced — return tail (still grep-able)
}

function main() {
  const detected = detectReadonlyTools();
  const queriesSrc = readFileSync(QUERIES_FILE, 'utf8');
  const errors = [];
  let methodsScanned = 0;

  // 1. Every detected readonly tool must be in the curated map.
  for (const name of detected) {
    if (!CURATED[name]) {
      errors.push(`readonly tool "${name}" has readOnlyHint:true but no entry in CURATED map — add its queries.ts handler method(s) so it is write-checked.`);
    }
  }

  // 2. Every mapped handler method must exist + be write-free.
  for (const [tool, methods] of Object.entries(CURATED)) {
    if (!detected.has(tool)) {
      // The map references a tool no longer marked readonly — stale entry.
      errors.push(`CURATED entry "${tool}" is no longer readOnlyHint:true in source — remove the stale map entry.`);
      continue;
    }
    for (const method of methods) {
      const body = extractMethodBody(queriesSrc, method);
      if (body === null) {
        errors.push(`tool "${tool}": handler method ${method}() not found in queries.ts — CURATED map drifted.`);
        continue;
      }
      methodsScanned++;
      for (const pat of WRITE_PATTERNS) {
        const hit = body.match(pat);
        if (hit) {
          errors.push(`tool "${tool}" (readOnlyHint:true): handler ${method}() contains a WRITE call "${hit[0]}" — a read tool must not mutate Foundry documents.`);
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error(`\n[check-readonly-annotations] ${errors.length} violation(s):\n`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(`[check-readonly-annotations] OK — ${detected.size} readOnlyHint:true tools, ${methodsScanned} handler method bodies scanned, no write calls.`);
}

main();
