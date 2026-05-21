// BUG-104: Build-time JSON Schema validation guard (vitest mirror).
//
// Mirrors `scripts/validate-tool-schemas.mjs` but runs at `npm test` time,
// against the TypeScript sources via `import.meta.glob`. Both surfaces must
// pass — the script catches schema regressions at build; this test catches
// them in the unit-test loop and CI.

import { describe, it, expect } from 'vitest';
import Ajv from 'ajv';

const stubLogger: any = {
  child: () => stubLogger,
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};
const stubFoundryClient: any = {};

const modules = import.meta.glob('../tools/*.ts', { eager: true }) as Record<string, Record<string, unknown>>;

interface ToolDef {
  name?: string;
  inputSchema?: unknown;
}

interface CollectedTool {
  file: string;
  className: string;
  def: ToolDef;
}

function collectAll(): { tools: CollectedTool[]; errors: string[] } {
  const tools: CollectedTool[] = [];
  const errors: string[] = [];
  for (const [file, mod] of Object.entries(modules)) {
    for (const [exportName, exported] of Object.entries(mod)) {
      if (typeof exported !== 'function') continue;
      const proto = (exported as { prototype?: { getToolDefinitions?: unknown } }).prototype;
      if (!proto || typeof proto.getToolDefinitions !== 'function') continue;
      let instance: { getToolDefinitions: () => ToolDef[] };
      try {
        instance = new (exported as new (opts: { foundryClient: unknown; logger: unknown }) => {
          getToolDefinitions: () => ToolDef[];
        })({ foundryClient: stubFoundryClient, logger: stubLogger });
      } catch (e) {
        errors.push(`${file} / ${exportName}: construction failed — ${(e as Error)?.message ?? e}`);
        continue;
      }
      let defs: ToolDef[];
      try {
        defs = instance.getToolDefinitions();
      } catch (e) {
        errors.push(`${file} / ${exportName}: getToolDefinitions threw — ${(e as Error)?.message ?? e}`);
        continue;
      }
      for (const def of defs ?? []) {
        tools.push({ file, className: exportName, def });
      }
    }
  }
  return { tools, errors };
}

describe('BUG-104 — every tool inputSchema must compile under Ajv strict', () => {
  const { tools, errors: collectionErrors } = collectAll();
  // allowUnionTypes: nullable Zod fields emit `type: [..., "null"]` unions per
  // DP-20 / BUG-088 (4-surface parity); Copilot accepts these.
  const ajv = new Ajv({ strict: true, allowUnionTypes: true, allErrors: true });

  it('tool enumeration completes without construction errors', () => {
    expect(collectionErrors).toEqual([]);
  });

  it('found at least one tool to validate', () => {
    expect(tools.length).toBeGreaterThan(0);
  });

  it.each(tools.map((t) => [`${t.def.name ?? '<anon>'} (${t.file})`, t] as const))(
    'inputSchema is ajv-strict compilable: %s',
    (_label, t) => {
      expect(() => ajv.compile(t.def.inputSchema as object)).not.toThrow();
    },
  );
});
