// Characterization snapshot — DiceRollTools return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// DiceRollTools.handleDiceRoll() dispatches to roll/validate/simulate.
// Each returns { content:[{type:"text",text}] }.
// Canned query data is fixed so no randomness leaks into the formatted text.

import { describe, it, expect } from 'vitest';
import { DiceRollTools } from '../../tools/dice-roll.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new DiceRollTools(makeToolDeps(mockReturn));

describe('DiceRollTools — characterization', () => {
  it('dice-roll/roll — formatted roll result', async () => {
    const r = await tool({
      total: 14,
      formula: '4d6kh3+2',
      result: '3 + 5 + 4 + 2',
      terms: [
        { class: 'Die', formula: '4d6kh3', total: 12, evaluated: true, results: [
          { result: 3, active: true },
          { result: 5, active: true },
          { result: 4, active: true },
          { result: 2, active: false, discarded: true },
        ]},
        { class: 'OperatorTerm', formula: '+', total: null, evaluated: true },
        { class: 'NumericTerm', formula: '2', total: 2, evaluated: true },
      ],
      messageId: null,
    }).handleDiceRoll({ action: 'roll', formula: '4d6kh3+2' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('dice-roll/roll — with message posted to chat', async () => {
    const r = await tool({
      total: 42,
      formula: '1d100',
      result: '42',
      terms: [
        { class: 'Die', formula: '1d100', total: 42, evaluated: true, results: [
          { result: 42, active: true },
        ]},
      ],
      messageId: 'msg-chat-001',
    }).handleDiceRoll({ action: 'roll', formula: '1d100', createMessage: true, flavor: 'Weapon Skill test' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('dice-roll/validate — valid formula', async () => {
    const r = await tool({
      valid: true,
      formula: '4d6kh3+2',
    }).handleDiceRoll({ action: 'validate', formula: '4d6kh3+2' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('dice-roll/validate — invalid formula', async () => {
    const r = await tool({
      valid: false,
      formula: '1d20+',
    }).handleDiceRoll({ action: 'validate', formula: '1d20+' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('dice-roll/simulate — distribution stats', async () => {
    const r = await tool({
      totals: [3, 4, 5, 4, 6, 3, 5, 4, 3, 5],
      n: 10,
      min: 3,
      max: 6,
      mean: 4.2,
    }).handleDiceRoll({ action: 'simulate', formula: '1d6', n: 10 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
