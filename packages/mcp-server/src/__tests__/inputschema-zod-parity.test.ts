// BUG-330 — published-inputSchema ↔ Zod parity guard.
//
// The static review (2026-06-10) found a recurring drift class between the hand-written
// JSON inputSchema each tool publishes over MCP and the Zod schema that actually parses
// the args (BUG-317/323/324/327: properties missing from one side, defaults/enums lying).
// This suite locks the mechanically-checkable invariants for every tool whose Zod schema
// is exported: property-key parity (both directions) and action-enum parity.
//
// Descriptions/defaults remain prose and are NOT checked here — only keys and enums.

import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import { DiceRollTools, RequestPlayerRollsArgs } from '../tools/dice-roll.js';
import { ModuleMattTool } from '../tools/modules/monks-active-tiles/matt.js';
import { ModuleMattInput } from '../tools/modules/monks-active-tiles/schemas.js';
import { ModuleSequencerTool } from '../tools/modules/sequencer/sequencer.js';
import { ModuleSequencerToolInput } from '../tools/modules/sequencer/schemas.js';
import { ModuleTaggerTool } from '../tools/modules/tagger/tagger.js';
import { ModuleTaggerToolInput } from '../tools/modules/tagger/schemas.js';
import { ModuleCssTool } from '../tools/modules/custom-css/css.js';
import { ModuleCssToolInput } from '../tools/modules/custom-css/schemas.js';
import { DocumentIoTool } from '../tools/document-io.js';
import { DocumentIoToolInput } from '@foundry-mcp/shared';

const stubLogger: any = {
  child: () => stubLogger,
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};
const toolOptions = { foundryClient: {} as any, logger: stubLogger };

/** Strip Optional/Default/Nullable/Effects wrappers down to the core schema. */
function unwrap(schema: z.ZodTypeAny): any {
  let s: any = schema;
  for (;;) {
    const t = s?._def?.typeName;
    if (t === 'ZodOptional' || t === 'ZodDefault' || t === 'ZodNullable') s = s._def.innerType;
    else if (t === 'ZodEffects') s = s._def.schema;
    else return s;
  }
}

/** Top-level input keys accepted by the Zod schema (union of variant shapes for unions). */
function zodTopLevelKeys(schema: z.ZodTypeAny): Set<string> {
  const s = unwrap(schema);
  if (s._def.typeName === 'ZodDiscriminatedUnion') {
    const keys = new Set<string>();
    for (const opt of s.options) {
      for (const k of Object.keys(unwrap(opt).shape)) keys.add(k);
    }
    return keys;
  }
  if (s._def.typeName === 'ZodObject') return new Set(Object.keys(s.shape));
  throw new Error(`zodTopLevelKeys: unsupported schema type ${s._def.typeName}`);
}

/** Action discriminator values from the Zod schema (enum values or union literals). */
function zodActionValues(schema: z.ZodTypeAny): string[] {
  const s = unwrap(schema);
  if (s._def.typeName === 'ZodDiscriminatedUnion') {
    return s.options.map((opt: any) => unwrap(unwrap(opt).shape.action)._def.value as string);
  }
  const action = unwrap((s as any).shape.action);
  if (action._def.typeName === 'ZodEnum') return [...action._def.values];
  throw new Error(`zodActionValues: unsupported action schema type ${action._def.typeName}`);
}

function publishedDef(tool: { getToolDefinitions(): Array<any> }, name: string): any {
  const def = tool.getToolDefinitions().find((d) => d.name === name);
  expect(def, `tool definition "${name}" must exist`).toBeDefined();
  return def;
}

interface ParityCase {
  toolName: string;
  makeTool: () => { getToolDefinitions(): Array<any> };
  zodSchema: z.ZodTypeAny;
  hasActionEnum: boolean;
}

const cases: ParityCase[] = [
  { toolName: 'module-matt', makeTool: () => new ModuleMattTool(toolOptions), zodSchema: ModuleMattInput, hasActionEnum: true },
  { toolName: 'module-sequencer', makeTool: () => new ModuleSequencerTool(toolOptions), zodSchema: ModuleSequencerToolInput, hasActionEnum: true },
  { toolName: 'module-tagger', makeTool: () => new ModuleTaggerTool(toolOptions), zodSchema: ModuleTaggerToolInput, hasActionEnum: true },
  { toolName: 'module-css', makeTool: () => new ModuleCssTool(toolOptions), zodSchema: ModuleCssToolInput, hasActionEnum: true },
  { toolName: 'request-player-rolls', makeTool: () => new DiceRollTools(toolOptions), zodSchema: RequestPlayerRollsArgs, hasActionEnum: false },
  { toolName: 'document-io', makeTool: () => new DocumentIoTool(toolOptions), zodSchema: DocumentIoToolInput, hasActionEnum: true },
];

describe('BUG-330 published inputSchema ↔ Zod schema parity', () => {
  for (const c of cases) {
    describe(c.toolName, () => {
      it('publishes exactly the property keys the Zod schema accepts', () => {
        const def = publishedDef(c.makeTool(), c.toolName);
        const published = new Set(Object.keys(def.inputSchema?.properties ?? {}));
        const zod = zodTopLevelKeys(c.zodSchema);

        // BUG-324 class: Zod-accepted key invisible to callers.
        const missingFromPublished = [...zod].filter((k) => !published.has(k)).sort();
        // Inverse drift: published key the parser does not know about.
        const unknownToZod = [...published].filter((k) => !zod.has(k)).sort();

        expect(missingFromPublished, 'Zod keys missing from published inputSchema.properties').toEqual([]);
        expect(unknownToZod, 'published properties the Zod schema does not accept').toEqual([]);
      });

      if (c.hasActionEnum) {
        it('publishes the same action enum the Zod schema dispatches on', () => {
          const def = publishedDef(c.makeTool(), c.toolName);
          const published = [...(def.inputSchema?.properties?.action?.enum ?? [])].sort();
          const zod = [...zodActionValues(c.zodSchema)].sort();
          expect(published).toEqual(zod);
        });
      }
    });
  }
});
