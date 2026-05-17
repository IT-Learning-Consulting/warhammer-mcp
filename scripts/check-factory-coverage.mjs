#!/usr/bin/env node
// check-factory-coverage.mjs — D2 of Phase 6.2 MCP CRUD Expansion plan.
//
// Asserts the 7 embedded-CRUD handler files split into:
//   - RETROFITTED via the embeddedCRUDFactory: createEmbeddedCRUDHandlers call present
//     → light.ts / sound.ts / tile.ts / template.ts
//   - FACTORY-EXEMPT: explicit `// FACTORY-EXEMPT: <reason>` marker present
//     → note.ts (B5 FK resolver)
//     → token.ts (legacy add/delete-token delegation)
//     → region.ts (behavior sub-CRUD two-level parent chain)
//
// Any handler that's neither retrofitted nor explicitly exempt is a coverage gap.
//
// Run from repo root: node scripts/check-factory-coverage.mjs
// Exit codes: 0 = coverage complete, 1 = gap detected, 2 = bad invocation.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const HANDLERS_DIR = 'packages/foundry-module/src/handlers';
const TARGETS = ['light', 'sound', 'tile', 'template', 'note', 'token', 'region'];

let fail = 0;
const retrofitted = [];
const exempt = [];
const gaps = [];

for (const name of TARGETS) {
  const path = join(HANDLERS_DIR, `${name}.ts`);
  if (!existsSync(path)) {
    console.error(`❌ MISSING: ${path}`);
    fail = 1;
    continue;
  }
  const src = readFileSync(path, 'utf8');
  const usesFactory = /createEmbeddedCRUDHandlers\s*[<(]/.test(src);
  const hasExemptMarker = /\/\/\s*FACTORY-EXEMPT:/.test(src);

  if (usesFactory && hasExemptMarker) {
    console.error(`❌ AMBIGUOUS: ${name}.ts has BOTH factory call AND FACTORY-EXEMPT marker`);
    fail = 1;
  } else if (usesFactory) {
    retrofitted.push(name);
  } else if (hasExemptMarker) {
    exempt.push(name);
  } else {
    gaps.push(name);
    console.error(
      `❌ GAP: ${name}.ts uses neither createEmbeddedCRUDHandlers nor a // FACTORY-EXEMPT: marker. ` +
        `Either retrofit through the factory OR add the marker with an explanation.`,
    );
    fail = 1;
  }
}

if (fail === 0) {
  console.log(`✓ Factory coverage complete.`);
  console.log(`  RETROFITTED (${retrofitted.length}): ${retrofitted.join(', ')}`);
  console.log(`  FACTORY-EXEMPT (${exempt.length}): ${exempt.join(', ')}`);
}

process.exit(fail);
