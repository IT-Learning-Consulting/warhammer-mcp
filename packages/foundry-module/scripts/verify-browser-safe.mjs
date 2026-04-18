#!/usr/bin/env node
// Fails the build if dist/main.js contains any import specifier that a browser
// cannot resolve (i.e. anything that is not a relative path or absolute URL).
// Foundry loads dist/main.js as <script type="module">, so bare npm specifiers
// like "@foundry-mcp/shared" leak through tsc-only builds and silently prevent
// the module from loading. esbuild --bundle should inline everything; this
// verifier catches regressions.

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bundle = resolve(__dirname, '..', 'dist', 'main.js');

if (!existsSync(bundle)) {
  console.error(`[verify-browser-safe] FAIL: ${bundle} not found — did esbuild run?`);
  process.exit(1);
}

const src = readFileSync(bundle, 'utf8');

// Match static `from "x"` / `from 'x'` and dynamic `import("x")`.
// Captures the specifier. Strips template-string imports (rare).
const re = /(?:\bfrom\s*|\bimport\s*\()\s*(['"])([^'"\n]+)\1\s*\)?/g;

const allowed = /^(?:\.?\.?\/|https?:|blob:|data:)/;
const offenders = new Set();

for (const m of src.matchAll(re)) {
  const spec = m[2];
  if (!allowed.test(spec)) offenders.add(spec);
}

if (offenders.size > 0) {
  console.error('[verify-browser-safe] FAIL: bare module specifier(s) leaked into dist/main.js:');
  for (const s of offenders) console.error('  -', s);
  console.error('');
  console.error('  Foundry loads dist/main.js in the browser. Browsers cannot resolve');
  console.error('  bare npm specifiers — the module will fail to load silently.');
  console.error('  Fix: ensure esbuild --bundle inlines this dependency, or mark it');
  console.error('  as a true runtime global and exclude it from imports.');
  process.exit(1);
}

console.log('[verify-browser-safe] OK: dist/main.js contains no bare specifiers.');
