// Characterization snapshot tests for FoundryDataAccess.getCharacterInfo
// Phase 0, sub-phase 0.7.3 — regression net for the upcoming data-access.ts refactor.
// DO NOT edit data-access.ts, setup.ts, or any source from this file.

import { describe, it, expect, beforeEach } from 'vitest';
import { FoundryDataAccess } from '../../data-access.js';

function makeDA() {
  const da = new FoundryDataAccess();
  (da as any).validateFoundryState = () => {};
  return da;
}

// Pin randomID so any embedded generated IDs are deterministic.
let randomCounter = 0;
beforeEach(() => {
  randomCounter = 0;
  (globalThis as any).foundry.utils.randomID = () => `fixed-id-${++randomCounter}`;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeActor(overrides: Record<string, any> = {}) {
  return {
    id: 'actor-abc1234567890123',
    name: 'Gretchen Müller',
    type: 'character',
    img: 'icons/characters/gretchen.png',
    system: {
      characteristics: {
        ws: { value: 35, advances: 5 },
        bs: { value: 28, advances: 0 },
      },
      status: {
        wounds: { value: 12, max: 12 },
        advantage: { value: 0, max: 10 },
      },
      details: {
        species: { value: 'Human' },
        career: { value: 'Soldier' },
        experience: { current: 150, spent: 100, total: 250 },
      },
    },
    items: [
      {
        id: 'item-001',
        name: 'Sword',
        type: 'weapon',
        img: 'icons/weapons/sword.png',
        system: {
          damage: { value: 'SB+4' },
          qualities: { value: [] },
        },
      },
    ],
    effects: [
      {
        id: 'effect-001',
        name: 'Fatigued',
        icon: 'icons/effects/fatigued.png',
        disabled: false,
        duration: {
          type: 'rounds',
          duration: 3,
          remaining: 2,
        },
        flags: { 'warhammer-mcp': { source: 'combat' } },
        system: {},
      },
    ],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('FoundryDataAccess.getCharacterInfo — characterization', () => {
  it('snapshot: full character found by name', async () => {
    const actor = makeActor();
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: {
        get: (_id: string) => undefined,
        find: (fn: (a: any) => boolean) => (fn(actor) ? actor : undefined),
        values: () => [actor][Symbol.iterator](),
        getName: (_name: string) => undefined,
      },
    };

    const da = makeDA();
    const result = await da.getCharacterInfo('Gretchen Müller');
    expect(result).toMatchSnapshot();
  });

  it('snapshot: character found by 16-char ID', async () => {
    const actor = makeActor({ id: 'abcdefghijklmnop' }); // exactly 16 chars
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: {
        get: (id: string) => (id === 'abcdefghijklmnop' ? actor : undefined),
        find: (_fn: any) => undefined,
        values: () => [][Symbol.iterator](),
        getName: (_name: string) => undefined,
      },
    };

    const da = makeDA();
    const result = await da.getCharacterInfo('abcdefghijklmnop');
    expect(result).toMatchSnapshot();
  });

  it('snapshot: actor with no img, no effects, no items', async () => {
    const actor = {
      id: 'actor-minimal1234',
      name: 'Minimal NPC',
      type: 'npc',
      // no img
      system: { status: { wounds: { value: 5, max: 5 } } },
      items: [],
      effects: [],
    };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: {
        get: (_id: string) => undefined,
        find: (fn: (a: any) => boolean) => (fn(actor) ? actor : undefined),
        values: () => [actor][Symbol.iterator](),
        getName: (_name: string) => undefined,
      },
    };

    const da = makeDA();
    const result = await da.getCharacterInfo('Minimal NPC');
    expect(result).toMatchSnapshot();
  });

  it('throws CHARACTER_NOT_FOUND when actor does not exist', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: {
        get: (_id: string) => undefined,
        find: (_fn: any) => undefined,
        values: () => [][Symbol.iterator](),
        getName: (_name: string) => undefined,
      },
    };

    const da = makeDA();
    await expect(da.getCharacterInfo('Nobody')).rejects.toThrow('Character not found');
  });
});
