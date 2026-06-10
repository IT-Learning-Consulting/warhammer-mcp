// Phase 3 mcp_coverage_expansion — combatant umbrella schema tests (CCR-13).
//
// Tests: action enum (7 values), required combatantId, missing required fields → throw,
// update-combatant allow-list (REJECTS initiative; rejects unknown keys; non-empty refine),
// set-initiative value type, reroll formula min-length, set-hidden/set-defeated boolean
// guards, invalid discriminant → safeParse false, unknown key → throw (strict),
// plus tool-behavior formatting + typed-error surfacing.

import { describe, it, expect, vi } from 'vitest';
import { CombatantToolInput } from '@foundry-mcp/shared';
import { CombatantTool } from '../tools/combatant.js';

function makeLogger(): any {
  const noop = () => undefined;
  return { info: noop, warn: noop, error: noop, debug: noop, child: () => makeLogger() };
}

function makeTool(mockReturn: any = null, mockThrow: string | null = null) {
  const foundryClient: any = {
    query: vi.fn(async (_key: string, _args: any) => {
      if (mockThrow) throw new Error(mockThrow);
      return mockReturn;
    }),
  };
  return new CombatantTool({ foundryClient, logger: makeLogger() });
}

// ── Schema tests ──────────────────────────────────────────────────────────────

describe('CombatantToolInput schema', () => {
  it('action enum contains exactly 7 values', () => {
    const actions = CombatantToolInput.options.map((o) => o.shape.action.value);
    expect(actions.sort()).toEqual(
      [
        'clear-initiative',
        'get-combatant',
        'reroll-initiative',
        'set-defeated',
        'set-hidden',
        'set-initiative',
        'update-combatant',
      ].sort(),
    );
  });

  it('every action requires combatantId', () => {
    expect(() => CombatantToolInput.parse({ action: 'get-combatant' })).toThrow();
    expect(() => CombatantToolInput.parse({ action: 'set-initiative', value: 5 })).toThrow();
    expect(() => CombatantToolInput.parse({ action: 'set-hidden', hidden: true })).toThrow();
  });

  it('get-combatant parses with combatantId only', () => {
    expect(() => CombatantToolInput.parse({ action: 'get-combatant', combatantId: 'abc' })).not.toThrow();
  });

  it('get-combatant parses with optional combatId', () => {
    expect(() =>
      CombatantToolInput.parse({ action: 'get-combatant', combatantId: 'abc', combatId: 'xyz' }),
    ).not.toThrow();
  });

  it('update-combatant requires changes', () => {
    expect(() => CombatantToolInput.parse({ action: 'update-combatant', combatantId: 'abc' })).toThrow();
  });

  it('update-combatant requires a non-empty changes object (refine)', () => {
    expect(() =>
      CombatantToolInput.parse({ action: 'update-combatant', combatantId: 'abc', changes: {} }),
    ).toThrow();
  });

  it('update-combatant parses with valid allow-list changes', () => {
    expect(() =>
      CombatantToolInput.parse({
        action: 'update-combatant',
        combatantId: 'abc',
        changes: { name: 'Slain Ogre', hidden: true, defeated: false },
      }),
    ).not.toThrow();
  });

  it('update-combatant REJECTS initiative in changes (allow-list, strict)', () => {
    const result = CombatantToolInput.safeParse({
      action: 'update-combatant',
      combatantId: 'abc',
      changes: { initiative: 15 },
    });
    expect(result.success).toBe(false);
  });

  it('update-combatant rejects an unknown change key (strict)', () => {
    expect(() =>
      CombatantToolInput.parse({
        action: 'update-combatant',
        combatantId: 'abc',
        changes: { bogusField: 1 },
      }),
    ).toThrow();
  });

  it('set-initiative requires value', () => {
    expect(() => CombatantToolInput.parse({ action: 'set-initiative', combatantId: 'abc' })).toThrow();
  });

  it('set-initiative parses with a numeric value', () => {
    expect(() =>
      CombatantToolInput.parse({ action: 'set-initiative', combatantId: 'abc', value: 15 }),
    ).not.toThrow();
  });

  it('set-initiative rejects a non-number value', () => {
    expect(() =>
      CombatantToolInput.parse({ action: 'set-initiative', combatantId: 'abc', value: 'high' }),
    ).toThrow();
  });

  it('clear-initiative parses with combatantId', () => {
    expect(() =>
      CombatantToolInput.parse({ action: 'clear-initiative', combatantId: 'abc' }),
    ).not.toThrow();
  });

  it('reroll-initiative parses without a formula', () => {
    expect(() =>
      CombatantToolInput.parse({ action: 'reroll-initiative', combatantId: 'abc' }),
    ).not.toThrow();
  });

  it('reroll-initiative parses with a formula override', () => {
    expect(() =>
      CombatantToolInput.parse({ action: 'reroll-initiative', combatantId: 'abc', formula: '1d10+5' }),
    ).not.toThrow();
  });

  it('reroll-initiative rejects an empty formula (min length 1)', () => {
    expect(() =>
      CombatantToolInput.parse({ action: 'reroll-initiative', combatantId: 'abc', formula: '' }),
    ).toThrow();
  });

  it('set-hidden requires a boolean hidden', () => {
    expect(() => CombatantToolInput.parse({ action: 'set-hidden', combatantId: 'abc' })).toThrow();
    expect(() =>
      CombatantToolInput.parse({ action: 'set-hidden', combatantId: 'abc', hidden: 'yes' }),
    ).toThrow();
  });

  it('set-hidden parses with a boolean', () => {
    expect(() =>
      CombatantToolInput.parse({ action: 'set-hidden', combatantId: 'abc', hidden: true }),
    ).not.toThrow();
  });

  it('set-defeated requires a boolean defeated', () => {
    expect(() => CombatantToolInput.parse({ action: 'set-defeated', combatantId: 'abc' })).toThrow();
    expect(() =>
      CombatantToolInput.parse({ action: 'set-defeated', combatantId: 'abc', defeated: 1 }),
    ).toThrow();
  });

  it('invalid action discriminant → safeParse false', () => {
    const result = CombatantToolInput.safeParse({ action: 'set-resource', combatantId: 'abc' });
    expect(result.success).toBe(false);
  });

  it('unknown top-level key → throw (strict mode)', () => {
    expect(() =>
      CombatantToolInput.parse({ action: 'get-combatant', combatantId: 'abc', sneaky: true }),
    ).toThrow();
  });

  it('missing action → throw', () => {
    expect(() => CombatantToolInput.parse({})).toThrow();
    expect(() => CombatantToolInput.parse({ combatantId: 'abc' })).toThrow();
  });
});

// ── Tool behavior tests ───────────────────────────────────────────────────────

describe('CombatantTool.execute', () => {
  it('exposes the combatant tool definition with 7 actions', () => {
    const tool = makeTool();
    const defs = tool.getToolDefinitions();
    expect(defs.map((d: any) => d.name)).toEqual(['combatant']);
    expect(defs[0].inputSchema.properties.action.enum).toHaveLength(7);
  });

  it('set-defeated formats the defeated state + overlay note', async () => {
    const tool = makeTool({ combatId: 'c1', combatantId: 'abc', defeated: true });
    const result = await tool.execute({ action: 'set-defeated', combatantId: 'abc', defeated: true });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('defeated:true');
    expect(result.content[0].text).toContain('skull overlay');
  });

  it('set-initiative surfaces the turn-pointer-stable flag', async () => {
    const tool = makeTool({
      combatId: 'c1',
      combatantId: 'abc',
      initiative: 15,
      currentCombatantId: 'def',
      turnPointerStable: true,
    });
    const result = await tool.execute({ action: 'set-initiative', combatantId: 'abc', value: 15 });
    expect(result.content[0].text).toContain('15');
    expect(result.content[0].text).toContain('true');
  });

  it('returns isError on tool throw (typed token surfaced)', async () => {
    const tool = makeTool(null, 'COMBATANT_NOT_FOUND: no combatant with id "bad"');
    const result = await tool.execute({ action: 'get-combatant', combatantId: 'bad' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('COMBATANT_NOT_FOUND');
  });
});
