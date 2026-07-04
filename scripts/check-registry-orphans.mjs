#!/usr/bin/env node
// check-registry-orphans.mjs — Phase 1 mcp_coverage_expansion, CCR-13 acceptance gate.
//
// Cross-references three sets:
//   Set A — CONFIG.queries[`warhammer-mcp.<key>`] entries in foundry-module/src/queries.ts
//   Set B — registry.register('<name>', ...) entries in mcp-server/src/backend.ts
//   Set C — eval coverage: does any evals/*.xml qa_pair question mention this tool?
//
// Primary check (hard failures):
//   1. No duplicate registry.register names in Set B.
//   2. Every umbrella tool in Set B has a CONFIG.queries entry for that exact kebab name in Set A.
//      (Flat-handler camelCase query keys that MAP to Set B tools are handled via QUERY_KEY_ALLOWLIST.)
//
// Advisory check (warnings, does not exit 1):
//   3. Every Set B tool has eval coverage (tool name mentioned in some qa_pair question).
//      Skipped with a warning when the evals directory cannot be found.
//
// Eval directory: pass --evals-dir <path> OR set WARHAMMER_EVALS_DIR env var.
// Default candidate paths tried in order:
//   E:/warhammer_system/evals
//   ../../warhammer_system/evals  (relative to repo root)
//
// Run from repo root: node scripts/check-registry-orphans.mjs
// Exit: 0 = clean (no hard failures), 1 = hard violations found, 2 = bad invocation.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const BACKEND_TS = join(REPO_ROOT, 'packages/mcp-server/src/backend.ts');
const QUERIES_TS = join(REPO_ROOT, 'packages/foundry-module/src/queries.ts');

// Resolve evals directory: CLI arg > env var > candidate paths.
function resolveEvalsDir(args) {
  const flagIdx = args.indexOf('--evals-dir');
  if (flagIdx !== -1 && args[flagIdx + 1]) return args[flagIdx + 1];
  if (process.env.WARHAMMER_EVALS_DIR) return process.env.WARHAMMER_EVALS_DIR;
  const candidates = [
    'E:/warhammer_system/evals',
    join(REPO_ROOT, '../../warhammer_system/evals'),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return null;
}

// ── Allowlist ─────────────────────────────────────────────────────────────────
//
// Set A camelCase query keys that feed into umbrella tools (one-to-many mapping).
// These are NOT orphans — they are correctly handled by their corresponding Set B
// umbrella tool, but their camelCase name doesn't derive from the kebab tool name
// via simple substitution.
//
// Also includes deprecated keys + lambda registrations.
const QUERY_KEY_ALLOWLIST = new Set([
  // ── FilePicker: 4 lambda registrations → 1 registry.register('filepicker'). ──
  'uploadFile',
  'listFiles',
  'filepickerCreateDirectory',
  'filepickerNotifyWarn',

  // ── Flat tools: camelCase query key → kebab Set B name (1:1 but non-trivially derivable). ──
  'getCharacterInfo',        // → get-character
  'listActors',              // → list-characters (note: tool name is list-characters!)
  'searchCompendium',        // → search-compendium
  'addItemFromCompendium',   // → add-item-from-compendium
  'listCreaturesByCriteria', // → list-creatures-by-criteria
  'getAvailablePacks',       // → list-compendium-packs
  'getWorldInfo',            // → get-world-info
  'ping',                    // → (no external tool; internal heartbeat)
  'createActorFromCompendium',// → create-actor-from-compendium
  'getCompendiumDocumentFull',// → get-compendium-entry-full
  'getWfrp4eConfig',         // → get-wfrp-config
  'deleteActor',             // → delete-actor
  'requestPlayerRolls',      // camelCase → request-player-rolls (note hyphenated key in queries.ts: 'request-player-rolls')

  // ── Ownership umbrella: 4 camelCase keys → 1 registry.register('ownership'). ──
  'setDocumentOwnership',
  'getDocumentOwnership',
  'bulkSetDocumentOwnership',
  'resetDocumentOwnership',

  // ── Actor/item write flat tools. ──
  'createActor',             // → create-actor
  'updateActor',             // → update-actor
  'updateItem',              // → update-item
  'createItem',              // → create-custom-item (note: createItem query key != create-custom-item tool name)
  'deleteItem',              // → delete-item
  'modifyItemQualities',     // → modify-item-qualities
  'tradeItem',               // → trade-item

  // ── RollTable umbrella: many camelCase keys → 1 registry.register('rolltable'). ──
  'createRollTable',
  'addTableResults',
  'listRollTables',
  'getRollTable',
  'rollOnTable',
  'deleteRollTable',
  'updateRollTable',
  'updateTableResults',
  'deleteTableResults',
  'normalizeRollTable',
  'resetRollTableResults',
  'drawManyFromTable',
  'importRollTableFromCompendium',

  // ── Combat + damage + conditions: camelCase → kebab flat tools. ──
  'getCombat',               // → get-combat
  'listCombatants',          // → list-combatants
  'advanceCombat',           // → advance-combat
  'addCombatants',           // → add-combatants
  'removeCombatants',        // → remove-combatants
  'endCombat',               // → end-combat
  'applyDamage',             // → apply-damage
  'applyCondition',          // → apply-condition
  'removeCondition',         // → remove-condition
  'listConditions',          // → list-conditions
  'listActiveEffects',       // → list-active-effects

  // ── Active-effect CRUD: camelCase → kebab flat tools. ──
  'addActiveEffect',         // → add-active-effect
  'updateActiveEffect',      // → update-active-effect
  'deleteActiveEffect',      // → delete-active-effect
  'getActiveEffectByName',   // → get-active-effect-by-name

  // ── Build-NPC + encounter flat tools. ──
  'duplicateActor',          // → duplicate-actor
  'applyNpcCareerAdvance',   // → apply-npc-career-advance
  'listActorItems',          // → list-actor-items
  'applyTemplate',           // → apply-template
  'applyTemplateToToken',    // → apply-template-to-token
  'applyTokenCasualties',    // → apply-token-casualties

  // ── Sheet-flow composite handlers: camelCase → manage-character / manage-inventory umbrellas (BUG-430). ──
  'applyFear',               // → manage-character
  'checkReload',             // → manage-inventory
  'addMoney',                // → manage-inventory
  'directPay',               // → manage-inventory
]);

// ── Parsers ───────────────────────────────────────────────────────────────────

function readFile(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch (e) {
    console.error(`❌ Cannot read ${path}: ${e.message}`);
    process.exit(2);
  }
}

/** Recursively list .ts files under a directory. */
function listToolFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...listToolFiles(p));
    else if (entry.endsWith('.ts')) out.push(p);
  }
  return out;
}

/**
 * Extract all registered tool names from the per-tool getRegistration() overrides (Set B).
 *
 * Phase 8 (R8.2): backend.ts no longer holds 94 `registry.register('<name>', ...)` literals —
 * registration is a single forEach loop over buildTools() instances, each contributing its
 * (name, handler) pairs via getRegistration(). The old regex (which required a quoted literal as
 * the first register arg) would match ZERO and silently neuter this gate. So Set B is now harvested
 * from the getRegistration() entries across every tool file. The `handler: (args: any) => this.`
 * shape is distinctive to those entries, so this never picks up unrelated object literals.
 */
function extractSetB() {
  const toolsDir = join(REPO_ROOT, 'packages/mcp-server/src/tools');
  const names = [];
  const re = /\{\s*name:\s*['"]([^'"]+)['"],\s*handler:\s*\(args: any\) => this\./g;
  for (const file of listToolFiles(toolsDir)) {
    const src = readFileSync(file, 'utf8');
    let m;
    while ((m = re.exec(src)) !== null) names.push(m[1]);
  }
  return names;
}

/**
 * Extract the registered query keys from queries.ts (Set A).
 *
 * Phase 8 (R8.2): registerHandlers() no longer holds ~112 individual
 * `CONFIG.queries[`${modulePrefix}.X`] = ...` assignments — the keys now live in a single
 * `handlerTable` Record literal, registered via one `Object.entries(handlerTable)` loop. The old
 * regex would capture only the literal `${key}` from the loop line and miss every real key. So Set A
 * is harvested from the handlerTable entries. (The legacy `CONFIG.queries['warhammer-mcp.X']` form is
 * still supported as a fallback for any direct assignment outside the table.)
 */
function extractSetA(src) {
  const keys = [];
  // mcp_code_quality_v2 Phase C2 (task 1.4): the table moved from a `const handlerTable = {...}`
  // local inside registerHandlers() to a `buildHandlerTable() { return {...} satisfies ... }`
  // method (HandlerKey compile-guard). Match EITHER shape.
  const tableMatch = src.match(
    /(?:const handlerTable[\s\S]*?=\s*\{\r?\n([\s\S]*?)\r?\n {4}\};|buildHandlerTable\(\)\s*\{\r?\n\s*return \{\r?\n([\s\S]*?)\r?\n {4}\} satisfies)/,
  );
  if (tableMatch) {
    const body = tableMatch[1] ?? tableMatch[2];
    const re = /^\s+'([^']+)':\s/gm;
    let m;
    while ((m = re.exec(body)) !== null) keys.push(m[1]);
  }
  // Fallback: any remaining direct CONFIG.queries['warhammer-mcp.X'] / template assignments.
  const direct = /CONFIG\.queries\[\s*(?:`\$\{modulePrefix\}\.((?!\$\{)[^`]+)`|['"]warhammer-mcp\.([^'"]+)['"])\s*\]\s*=/g;
  let d;
  while ((d = direct.exec(src)) !== null) {
    const k = d[1] || d[2];
    if (k && !keys.includes(k)) keys.push(k);
  }
  return keys;
}

/**
 * Recursively collect every eval XML under `dir` (mirrors parse-corpus.mjs's collectXmlFiles,
 * mcp_code_quality_v2 Phase C3 task 6.3 — the prior single-level `readdirSync` never saw
 * `evals/modules/**` or any new `evals/wfrp/**`, making the EVAL_COVERAGE_ADVISORY mostly
 * false-positive). Same exclusions as parse-corpus.mjs: scripts/, runs/, _disabled/.
 */
function collectXmlFilesRecursive(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectXmlFilesRecursive(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.xml')) {
      results.push(fullPath);
    }
  }
  return results;
}

/** Read eval coverage: Map<domain, questionTextBlob> (domain = path relative to evalsDir, no .xml). */
function extractEvalCoverage(evalsDir) {
  let xmlFiles;
  try {
    xmlFiles = collectXmlFilesRecursive(evalsDir).filter((f) => {
      const rel = relative(evalsDir, f).replace(/\\/g, '/');
      return !rel.startsWith('scripts/') && !rel.startsWith('runs/') && !rel.startsWith('_disabled/');
    });
  } catch (e) {
    return null;
  }
  const coverage = new Map();
  for (const file of xmlFiles) {
    const content = readFile(file);
    const questions = [];
    const re = /<question>([\s\S]*?)<\/question>/g;
    let m;
    while ((m = re.exec(content)) !== null) questions.push(m[1].toLowerCase());
    const domain = relative(evalsDir, file).replace(/\\/g, '/').replace(/\.xml$/, '');
    coverage.set(domain, questions.join(' '));
  }
  return coverage;
}

/** Check if a tool name appears in any eval question. */
function hasEvalCoverage(toolName, evalCoverage) {
  const searchTerm = toolName.toLowerCase();
  const searchTermSpaced = searchTerm.replace(/-/g, ' ');
  for (const [, blob] of evalCoverage) {
    if (blob.includes(searchTerm) || blob.includes(searchTermSpaced)) return true;
  }
  return false;
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const queriesSrc = readFile(QUERIES_TS);
  const evalsDir = resolveEvalsDir(args);
  const evalCoverage = evalsDir ? extractEvalCoverage(evalsDir) : null;

  if (!evalCoverage) {
    console.warn(
      `⚠️  Evals directory not found (tried candidates or ${evalsDir ?? 'no path given'}). ` +
      `Eval coverage check SKIPPED. Pass --evals-dir <path> to enable.`,
    );
  }

  const setB = extractSetB();
  const setA = extractSetA(queriesSrc);
  const setBSet = new Set(setA); // Set A for lookup

  const violations = [];
  const warnings = [];

  // ── Hard check 1: No duplicate registry.register names ────────────────────
  const seen = new Map();
  for (const name of setB) seen.set(name, (seen.get(name) ?? 0) + 1);
  for (const [name, count] of seen.entries()) {
    if (count > 1) violations.push(`DUPLICATE_REGISTER: '${name}' appears ${count} times in registry.register calls`);
  }

  const uniqueB = [...new Set(setB)];

  // ── Hard check 2: Every Set B tool has a CONFIG.queries entry ─────────────
  // Umbrella tools use the kebab name directly as the query key (e.g. 'token', 'journal',
  // 'item-directory'). Flat tools use camelCase (handled by QUERY_KEY_ALLOWLIST on the A side).
  // So: check that for each Set B name, either it appears directly in Set A, OR it's derivable
  // from one of the QUERY_KEY_ALLOWLIST mappings (covered indirectly).
  const setBWithAllowlistCoverage = new Set([
    // Tools whose query key IS the kebab name exactly (umbrella pattern).
    ...uniqueB.filter((name) => setA.includes(name)),
    // Flat tools covered by the QUERY_KEY_ALLOWLIST (mapped camelCase → kebab).
    'get-character',           // getCharacterInfo
    'list-characters',         // listActors
    'search-compendium',       // searchCompendium
    'add-item-from-compendium',// addItemFromCompendium
    'list-creatures-by-criteria', // listCreaturesByCriteria
    'list-compendium-packs',   // getAvailablePacks
    'get-world-info',          // getWorldInfo
    'create-actor-from-compendium', // createActorFromCompendium
    'get-compendium-entry-full', // getCompendiumDocumentFull
    'get-wfrp-config',         // getWfrp4eConfig
    'delete-actor',            // deleteActor
    'request-player-rolls',    // request-player-rolls (hyphenated key in Set A)
    'ownership',               // setDocumentOwnership/getDocumentOwnership/... → ownership
    'create-actor',            // createActor
    'update-actor',            // updateActor
    'update-item',             // updateItem
    'create-custom-item',      // createItem (createItem query key maps to create-custom-item tool)
    'delete-item',             // deleteItem
    'modify-item-qualities',   // modifyItemQualities
    'trade-item',              // tradeItem
    'rolltable',               // createRollTable/listRollTables/... → rolltable
    'get-combat',              // getCombat
    'list-combatants',         // listCombatants
    'advance-combat',          // advanceCombat
    'add-combatants',          // addCombatants
    'remove-combatants',       // removeCombatants
    'end-combat',              // endCombat
    'apply-damage',            // applyDamage
    'apply-condition',         // applyCondition
    'remove-condition',        // removeCondition
    'list-conditions',         // listConditions
    'list-active-effects',     // listActiveEffects
    'add-active-effect',       // addActiveEffect
    'update-active-effect',    // updateActiveEffect
    'delete-active-effect',    // deleteActiveEffect
    'get-active-effect-by-name', // getActiveEffectByName
    'duplicate-actor',         // duplicateActor
    'apply-npc-career-advance',// applyNpcCareerAdvance
    'list-actor-items',        // listActorItems
    'apply-template',          // applyTemplate
    'apply-template-to-token', // applyTemplateToToken
    'apply-token-casualties',  // applyTokenCasualties
    'filepicker',              // uploadFile/listFiles/filepickerNotifyWarn → filepicker

    // ── Server-side composite tools (no own CONFIG.queries entry — compose existing primitives). ──
    'manage-character',        // composes getCharacterInfo + updateActor + updateItem + searchCompendium + ...
    'manage-inventory',        // composes getCharacterInfo + tradeItem + ... (server-side only)
    'get-compendium-item',     // composes getCompendiumDocumentFull (in CompendiumTools class)
  ]);

  for (const toolName of uniqueB) {
    if (!setBWithAllowlistCoverage.has(toolName)) {
      violations.push(
        `MISSING_QUERY_REGISTRATION: '${toolName}' is in registry.register but has no CONFIG.queries entry in queries.ts (add the registration or add to setBWithAllowlistCoverage)`,
      );
    }
  }

  // ── Hard check 3: Every Set A key is known ────────────────────────────────
  // Every Set A key must be either (a) the exact kebab name of a Set B tool, or (b) in QUERY_KEY_ALLOWLIST.
  for (const key of setA) {
    if (QUERY_KEY_ALLOWLIST.has(key)) continue;
    if (uniqueB.includes(key)) continue; // exact umbrella match
    // camelCase kebab approximation fallback
    const kebab = key.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
    if (uniqueB.includes(kebab)) continue;
    violations.push(
      `ORPHAN_QUERY_KEY: '${key}' is registered in CONFIG.queries but has no known Set B owner — add to QUERY_KEY_ALLOWLIST if intentional`,
    );
  }

  // ── Advisory check: eval coverage ─────────────────────────────────────────
  if (evalCoverage) {
    const uncoveredTools = uniqueB.filter(
      (name) => !hasEvalCoverage(name, evalCoverage),
    );
    if (uncoveredTools.length > 0) {
      warnings.push(
        `EVAL_COVERAGE_ADVISORY: ${uncoveredTools.length} tool(s) have no qa_pair mentioning them: ` +
        uncoveredTools.join(', '),
      );
    }
  }

  // ── Report ────────────────────────────────────────────────────────────────
  for (const w of warnings) process.stderr.write(`⚠️  ${w}\n`);

  if (violations.length > 0) {
    for (const v of violations) process.stderr.write(`❌ ${v}\n`);
    process.stderr.write(`\nFound ${violations.length} hard violation(s).\n`);
    process.exit(1);
  }

  console.log(`✓ Registry orphan check PASSED`);
  console.log(`  Set B (backend tools):   ${uniqueB.length} unique tool names`);
  console.log(`  Set A (query keys):      ${setA.length} CONFIG.queries registrations`);
  if (evalCoverage) {
    const covered = uniqueB.filter((n) => hasEvalCoverage(n, evalCoverage)).length;
    console.log(`  Set C (eval files):      ${evalCoverage.size} domains`);
    console.log(`  Eval coverage:           ${covered}/${uniqueB.length} tools covered`);
  } else {
    console.log(`  Set C (eval coverage):   skipped (evals dir not found)`);
  }
  process.exit(0);
}

main();
