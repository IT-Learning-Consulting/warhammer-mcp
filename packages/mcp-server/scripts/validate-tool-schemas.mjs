// BUG-104: Build-time JSON Schema validation guard for hand-written tool
// `inputSchema` literals.
//
// Background: every tool file under `src/tools/` defines `inputSchema` as a
// hand-written JSON Schema object inside `getToolDefinitions()`. Codex and
// Claude Code's MCP clients accept loose schemas (e.g. `type: "array"` with
// no `items` clause); Copilot Chat's OpenAI-backed validator rejects them
// per spec, and refuses the entire tool list with a 400 on a single offender
// — locking the user out of Copilot until the schema is fixed.
//
// This script runs after `tsc` during `npm run build`. It enumerates every
// compiled tool class in `dist/tools/`, calls `getToolDefinitions()`, and
// compiles each `inputSchema` through Ajv with `strict: true`. If any
// schema fails to compile, the build fails with a list of offenders.

import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import Ajv from 'ajv';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOLS_DIR = path.resolve(HERE, '..', 'dist', 'tools');

const stubLogger = {
  child: () => stubLogger,
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};
const stubFoundryClient = {};

// allowUnionTypes: nullable Zod fields emit `type: [..., "null"]` unions per
// DP-20 / BUG-088 (4-surface parity). Copilot accepts these; only missing-`items`
// arrays + similar Spec violations should fail the guard.
const ajv = new Ajv({ strict: true, allowUnionTypes: true, allErrors: true });

async function collectToolClasses(file) {
  const url = pathToFileURL(path.join(TOOLS_DIR, file)).href;
  const mod = await import(url);
  const classes = [];
  for (const exported of Object.values(mod)) {
    if (typeof exported !== 'function') continue;
    if (!exported.prototype || typeof exported.prototype.getToolDefinitions !== 'function') continue;
    classes.push(exported);
  }
  return classes;
}

async function main() {
  let files;
  try {
    files = readdirSync(TOOLS_DIR).filter((f) => f.endsWith('.js'));
  } catch (e) {
    console.error(`[validate-tool-schemas] cannot read ${TOOLS_DIR} — did tsc run first? ${e?.message ?? e}`);
    process.exit(1);
  }

  const errors = [];
  let toolCount = 0;

  for (const file of files) {
    let classes;
    try {
      classes = await collectToolClasses(file);
    } catch (e) {
      errors.push(`${file}: import failed — ${e?.message ?? e}`);
      continue;
    }
    for (const ClassCtor of classes) {
      let instance;
      try {
        instance = new ClassCtor({ foundryClient: stubFoundryClient, logger: stubLogger });
      } catch (e) {
        errors.push(`${file} / ${ClassCtor.name}: construction failed — ${e?.message ?? e}`);
        continue;
      }
      let toolDefs;
      try {
        toolDefs = instance.getToolDefinitions();
      } catch (e) {
        errors.push(`${file} / ${ClassCtor.name}: getToolDefinitions threw — ${e?.message ?? e}`);
        continue;
      }
      for (const def of toolDefs ?? []) {
        toolCount++;
        try {
          ajv.compile(def.inputSchema);
        } catch (e) {
          errors.push(`tool "${def?.name ?? '<anon>'}" (${file}): invalid inputSchema — ${e?.message ?? e}`);
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error(`\n[validate-tool-schemas] ${errors.length} offender(s):\n`);
    for (const err of errors) console.error(`  - ${err}`);
    console.error(`\nTotal tools scanned: ${toolCount}`);
    process.exit(1);
  }

  console.log(`[validate-tool-schemas] OK — ${toolCount} tool inputSchema objects validated (ajv strict).`);
}

await main();
