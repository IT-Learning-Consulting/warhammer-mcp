// R2.1 acceptance — check-zod-inputschema-parity.mjs (Phase 2, systemic_bug_class_prevention)
// must go RED on a seeded Zod <-> published-inputSchema divergence, and stay GREEN on a
// matched pair. Imports compareTool() directly from the checker script (exported for this
// purpose) rather than shelling out to a full dist build, so the seeded cases below are
// synthetic Zod schemas + inputSchema literals — fast, and independent of build freshness.

import { describe, expect, it } from 'vitest';
import { z } from 'zod';
// @ts-expect-error — plain .mjs script, not part of this package's TS project.
import { compareTool } from '../../../../scripts/check-zod-inputschema-parity.mjs';

describe('check-zod-inputschema-parity — seeded divergence (R2.1)', () => {
  it('goes red: a discriminated-union branch requires a field the published schema does not enforce', () => {
    const zodSchema = z.discriminatedUnion('action', [
      z.object({ action: z.literal('create'), name: z.string(), type: z.string() }),
      z.object({ action: z.literal('delete'), id: z.string(), confirm: z.literal(true) }),
    ]);
    const def = {
      name: 'seeded-fixture-tool',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['create', 'delete'] },
          name: { type: 'string' },
          type: { type: 'string' },
          id: { type: 'string' },
          confirm: { type: 'boolean' },
        },
        required: ['action'], // <-- seeded divergence: branch-specific fields not enforced
      },
    };
    const offenders = compareTool(def, zodSchema);
    expect(offenders.length).toBeGreaterThan(0);
    expect(offenders.some((o: string) => o.includes('create') && o.includes('name'))).toBe(true);
    expect(offenders.some((o: string) => o.includes('delete') && o.includes('confirm'))).toBe(true);
  });

  it('goes red: a discriminator field other than "action" is still checked (BUG-660 class)', () => {
    const zodSchema = z.discriminatedUnion('itemType', [
      z.object({ itemType: z.literal('weapon'), damage: z.string() }),
      z.object({ itemType: z.literal('armour'), ap: z.number() }),
    ]);
    const def = {
      name: 'seeded-fixture-item',
      inputSchema: {
        type: 'object',
        properties: {
          itemType: { type: 'string', enum: ['weapon', 'armour'] },
          damage: { type: 'string' },
          ap: { type: 'number' },
        },
        required: ['itemType'],
      },
    };
    const offenders = compareTool(def, zodSchema);
    expect(offenders.length).toBeGreaterThan(0);
    expect(offenders.some((o: string) => o.includes('weapon') && o.includes('damage'))).toBe(true);
  });

  it('goes green: an allOf/if-then tightened schema matching the Zod branch required-sets', () => {
    const zodSchema = z.discriminatedUnion('action', [
      z.object({ action: z.literal('create'), name: z.string() }),
      z.object({ action: z.literal('delete'), id: z.string(), confirm: z.literal(true) }),
    ]);
    const def = {
      name: 'seeded-fixture-tool-tightened',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['create', 'delete'] },
          name: { type: 'string' },
          id: { type: 'string' },
          confirm: { type: 'boolean' },
        },
        required: ['action'],
        allOf: [
          { if: { properties: { action: { const: 'create' } } }, then: { required: ['name'] } },
          { if: { properties: { action: { const: 'delete' } } }, then: { required: ['confirm', 'id'] } },
        ],
      },
    };
    const offenders = compareTool(def, zodSchema);
    expect(offenders).toEqual([]);
  });

  it('goes green: a plain (non-union) Zod object matching a flat published schema', () => {
    const zodSchema = z.object({ id: z.string(), label: z.string().optional() });
    const def = {
      name: 'seeded-fixture-flat',
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string' }, label: { type: 'string' } },
        required: ['id'],
      },
    };
    expect(compareTool(def, zodSchema)).toEqual([]);
  });

  // Live false-positive found during Phase 2 baseline shrink: .optional().refine(...) wraps the
  // field in ZodEffects<ZodOptional<...>> — a shallow typeName check on the OUTER schema reads
  // "ZodEffects", not "ZodOptional", and misclassifies a genuinely-optional refined field as
  // required (critical.ts's `wounds`, BUG-646's own dice-notation guard).
  it('goes green: an optional field with a trailing .refine() is not misread as required', () => {
    const zodSchema = z.object({
      id: z.string(),
      wounds: z.string().optional().refine((v) => v === undefined || v !== 'bogus'),
    });
    const def = {
      name: 'seeded-fixture-optional-refine',
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string' }, wounds: { type: 'string' } },
        required: ['id'],
      },
    };
    expect(compareTool(def, zodSchema)).toEqual([]);
  });
});
