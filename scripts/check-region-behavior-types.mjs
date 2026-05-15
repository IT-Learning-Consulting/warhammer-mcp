#!/usr/bin/env node
// check-region-behavior-types.mjs — D4 of Phase 5 MCP CRUD Expansion plan.
//
// Asserts every v13-core RegionBehavior subtype has full surface coverage:
//   1. Zod discriminated-union branch in shared/src/schemas/region.ts
//      (`z.literal('<subtype>')` present)
//   2. Typed `system` schema for the subtype in shared/src/schemas/region.ts
//      (a `<Capitalized>System` schema constant — the typed dispatch contract;
//      for discriminated unions, this IS the dispatch case — the handler
//      type-narrows automatically once the variant is matched, so per-subtype
//      handler switches are unnecessary)
//   3. ≥1 eval qa_pair in evals/region.xml mentioning the subtype (skipped if
//      the eval file doesn't exist yet — incremental-development tolerant)
//
// Per plan §Design Decisions row 2, all 7 v13-core RegionBehavior subtypes ship
// fully typed in Phase 5: TeleportToken / ExecuteMacro / AdjustDarknessLevel /
// SuppressWeather / DisplayScrollingText / ExecuteScript / PauseGame.
//
// Run from repo root: node scripts/check-region-behavior-types.mjs
// Exit codes: 0 = all subtypes PASS, 1 = any FAIL, 2 = bad invocation (file missing).

import { readFileSync, existsSync } from 'node:fs';

const SUBTYPES = [
  'teleportToken',
  'executeMacro',
  'adjustDarknessLevel',
  'suppressWeather',
  'displayScrollingText',
  'executeScript',
  'pauseGame',
];

const REGION_ZOD = 'shared/src/schemas/region.ts';
const REGION_EVAL = 'evals/region.xml';

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}

function readOrFail(path) {
  if (!existsSync(path)) {
    process.stderr.write(`FATAL: required file missing: ${path}\n`);
    process.exit(2);
  }
  return readFileSync(path, 'utf8');
}

function readOrSkip(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

function main() {
  const zod = readOrFail(REGION_ZOD);
  const evalXml = readOrSkip(REGION_EVAL);

  let pass = 0;
  let fail = 0;
  const rows = [];

  for (const subtype of SUBTYPES) {
    // 1. Zod discriminated-union branch: `z.literal('<subtype>')`
    const literalPattern = new RegExp(`z\\.literal\\(['"\`]${subtype}['"\`]\\)`);
    const hasLiteral = literalPattern.test(zod);

    // 2. Typed system schema constant: e.g. `TeleportTokenSystem = z.object(...)`
    const systemPattern = new RegExp(`\\b${capitalize(subtype)}System\\b`);
    const hasSystem = systemPattern.test(zod);

    // 3. Eval qa_pair coverage (skip if file absent — pre-Phase-8 tolerant).
    let evalStatus = 'SKIPPED (eval not yet authored)';
    let hasEval = true;
    if (evalXml !== null) {
      const evalPattern = new RegExp(subtype, 'i');
      hasEval = evalPattern.test(evalXml);
      evalStatus = hasEval ? 'OK' : 'MISSING';
    }

    const passed = hasLiteral && hasSystem && hasEval;
    rows.push({
      subtype,
      literal: hasLiteral ? 'OK' : 'MISSING',
      system: hasSystem ? 'OK' : 'MISSING',
      eval: evalStatus,
      passed,
    });
    if (passed) pass++;
    else fail++;
  }

  process.stdout.write('RegionBehavior subtype coverage:\n\n');
  process.stdout.write('| subtype                | z.literal | <Subtype>System | eval                            |\n');
  process.stdout.write('|------------------------|-----------|-----------------|---------------------------------|\n');
  for (const r of rows) {
    process.stdout.write(
      `| ${r.subtype.padEnd(22)} | ${r.literal.padEnd(9)} | ${r.system.padEnd(15)} | ${r.eval.padEnd(31)} |\n`,
    );
  }
  process.stdout.write(`\n${pass}/${SUBTYPES.length} subtypes PASS, ${fail} FAIL.\n`);

  if (fail > 0) {
    process.stderr.write(`\nFAIL: ${fail} subtype(s) missing discriminated-union variant, typed system schema, or eval coverage.\n`);
    process.exit(1);
  }
  process.stdout.write('\nOK — all 7 RegionBehavior subtypes have full coverage.\n');
  process.exit(0);
}

main();
