import { describe, it, expect } from 'vitest';
import { GetCharacterOutput } from '@foundry-mcp/shared';

describe('GetCharacterOutput — regression for BUG-062', () => {
  it('accepts the formatter shape with zero conditions (empty object)', () => {
    const output = {
      id: 'abcdef1234567890',
      name: 'Test Character',
      type: 'character',
      basicInfo: { wounds: { current: 12, max: 14 } },
      stats: { characteristics: { WS: { value: 35, bonus: 3 } } },
      conditions: {},
      items: [],
      effects: [],
      hasImage: true,
    };
    expect(() => GetCharacterOutput.parse(output)).not.toThrow();
  });

  it('accepts the formatter shape with populated injuries + mutations', () => {
    const output = {
      id: 'abcdef1234567890',
      name: 'Test Character',
      type: 'character',
      conditions: {
        injuries: [{ name: 'Broken Arm', location: 'Right Arm', description: 'Ouch' }],
        mutations: [{ name: 'Extra Finger', type: 'physical', description: 'Pinky×2' }],
      },
      items: [],
      effects: [],
      hasImage: false,
    };
    expect(() => GetCharacterOutput.parse(output)).not.toThrow();
  });

  it('accepts all four condition buckets populated (injury + mutation + disease + psychology)', () => {
    const output = {
      id: 'abcdef1234567890',
      name: 'Test Creature',
      type: 'creature',
      conditions: {
        injuries: [{ name: 'Cut' }],
        mutations: [{ name: 'Horn' }],
        diseases: [{ name: 'Blood Rot' }],
        psychology: [{ name: 'Hatred (Skaven)' }],
      },
      items: [],
      effects: [],
      hasImage: true,
    };
    expect(() => GetCharacterOutput.parse(output)).not.toThrow();
  });

  it('rejects conditions as a flat array (the pre-fix wrong shape)', () => {
    const wrongShape = {
      id: 'abcdef1234567890',
      name: 'Test',
      type: 'character',
      conditions: [{ name: 'flat-array-shape' }],
    };
    expect(() => GetCharacterOutput.parse(wrongShape)).toThrow();
  });
});
