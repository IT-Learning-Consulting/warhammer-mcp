// Phase 2 mcp_coverage_expansion — dice-roll tool schema tests (CCR-13).
//
// Tests: action enum (3 values), missing required fields → throw, unknown key → throw (strict),
// simulate n-cap (>1000 / <1 / non-int) → throw, invalid discriminant → safeParse false,
// rollMode enum guard, plus tool-behavior formatting.

import { describe, it, expect, vi } from 'vitest';
import { DiceRollToolInput } from '@foundry-mcp/shared';
import { DiceRollTools } from '../tools/dice-roll.js';

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
  return new DiceRollTools({ foundryClient, logger: makeLogger() });
}

// ── Schema tests ──────────────────────────────────────────────────────────────

describe('DiceRollToolInput schema', () => {
  it('action enum contains exactly 3 values', () => {
    const actions = DiceRollToolInput.options.map((o) => o.shape.action.value);
    expect(actions.sort()).toEqual(['roll', 'simulate', 'validate']);
  });

  it('roll action requires formula', () => {
    expect(() => DiceRollToolInput.parse({ action: 'roll' })).toThrow();
  });

  it('roll action parses with formula only', () => {
    expect(() => DiceRollToolInput.parse({ action: 'roll', formula: '4d6kh3+2' })).not.toThrow();
  });

  it('roll action parses with all optional fields', () => {
    expect(() =>
      DiceRollToolInput.parse({
        action: 'roll',
        formula: '1d100',
        actorId: 'abc123',
        createMessage: true,
        rollMode: 'gmroll',
        flavor: 'Weapon Skill test',
        speaker: { alias: 'Hans', actor: 'abc123' },
      }),
    ).not.toThrow();
  });

  it('roll action rejects a bad rollMode', () => {
    expect(() =>
      DiceRollToolInput.parse({ action: 'roll', formula: '1d6', rollMode: 'shout' }),
    ).toThrow();
  });

  it('validate action requires formula', () => {
    expect(() => DiceRollToolInput.parse({ action: 'validate' })).toThrow();
  });

  it('validate action parses with formula', () => {
    expect(() => DiceRollToolInput.parse({ action: 'validate', formula: '1d20+' })).not.toThrow();
  });

  it('simulate action requires formula + n', () => {
    expect(() => DiceRollToolInput.parse({ action: 'simulate', formula: '1d6' })).toThrow();
    expect(() => DiceRollToolInput.parse({ action: 'simulate', n: 100 })).toThrow();
  });

  it('simulate action parses with formula + valid n', () => {
    expect(() =>
      DiceRollToolInput.parse({ action: 'simulate', formula: '1d6', n: 1000 }),
    ).not.toThrow();
  });

  it('simulate rejects n > 1000 (the cap, not a clamp)', () => {
    expect(() =>
      DiceRollToolInput.parse({ action: 'simulate', formula: '1d6', n: 1001 }),
    ).toThrow();
  });

  it('simulate rejects n < 1', () => {
    expect(() =>
      DiceRollToolInput.parse({ action: 'simulate', formula: '1d6', n: 0 }),
    ).toThrow();
  });

  it('simulate rejects non-integer n', () => {
    expect(() =>
      DiceRollToolInput.parse({ action: 'simulate', formula: '1d6', n: 1.5 }),
    ).toThrow();
  });

  it('invalid action discriminant → safeParse false', () => {
    const result = DiceRollToolInput.safeParse({ action: 'reroll', formula: '1d6' });
    expect(result.success).toBe(false);
  });

  it('unknown key → throw (strict mode)', () => {
    expect(() =>
      DiceRollToolInput.parse({ action: 'roll', formula: '1d6', unknownKey: 'should-fail' }),
    ).toThrow();
  });

  it('missing action → throw', () => {
    expect(() => DiceRollToolInput.parse({})).toThrow();
    expect(() => DiceRollToolInput.parse({ formula: '1d6' })).toThrow();
  });
});

// ── Tool behavior tests ───────────────────────────────────────────────────────

describe('DiceRollTools.handleDiceRoll', () => {
  it('exposes both request-player-rolls and dice-roll tool definitions', () => {
    const tool = makeTool();
    const names = tool.getToolDefinitions().map((d: any) => d.name).sort();
    expect(names).toEqual(['dice-roll', 'request-player-rolls']);
  });

  it('roll action formats total + result', async () => {
    const tool = makeTool({
      total: 14,
      formula: '4d6kh3+2',
      result: '12 + 2',
      terms: [{ class: 'Die', formula: '4d6kh3', total: 12, evaluated: true }],
    });
    const result = await tool.handleDiceRoll({ action: 'roll', formula: '4d6kh3+2' });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('14');
  });

  it('roll action surfaces messageId when createMessage', async () => {
    const tool = makeTool({
      total: 7,
      formula: '1d20',
      result: '7',
      terms: [],
      messageId: 'msg123',
    });
    const result = await tool.handleDiceRoll({ action: 'roll', formula: '1d20', createMessage: true });
    expect(result.content[0].text).toContain('msg123');
  });

  it('validate action formats validity', async () => {
    const tool = makeTool({ valid: false, formula: '1d20+' });
    const result = await tool.handleDiceRoll({ action: 'validate', formula: '1d20+' });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('no');
  });

  it('simulate action formats mean/min/max', async () => {
    const tool = makeTool({ totals: [1, 2, 3], n: 3, min: 1, max: 3, mean: 2 });
    const result = await tool.handleDiceRoll({ action: 'simulate', formula: '1d6', n: 3 });
    expect(result.content[0].text).toContain('2.00');
  });

  it('returns isError on tool throw (typed token surfaced)', async () => {
    const tool = makeTool(null, 'ACTOR_NOT_FOUND: no actor with id "bad"');
    const result = await tool.handleDiceRoll({ action: 'roll', formula: '1d6', actorId: 'bad' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('ACTOR_NOT_FOUND');
  });

  it('returns isError on invalid input (schema reject before query)', async () => {
    const tool = makeTool();
    const result = await tool.handleDiceRoll({ action: 'simulate', formula: '1d6', n: 5000 });
    expect(result.isError).toBe(true);
  });
});
