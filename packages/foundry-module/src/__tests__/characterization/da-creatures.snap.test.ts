// Characterization snapshot tests for FoundryDataAccess creature methods:
//   listCreaturesByCriteria (line 1166)
//   getEnhancedCreatureIndex (line 2989)
// Phase 0, sub-phase 0.7.3 — regression net for the upcoming data-access.ts refactor.
// DO NOT edit data-access.ts, setup.ts, or any source from this file.

import { describe, it, expect, beforeEach } from 'vitest';
import { FoundryDataAccess } from '../../data-access.js';

function makeDA() {
  const da = new FoundryDataAccess();
  (da as any).validateFoundryState = () => {};
  return da;
}

let randomCounter = 0;
beforeEach(() => {
  randomCounter = 0;
  (globalThis as any).foundry.utils.randomID = () => `fixed-id-${++randomCounter}`;
});

// ---------------------------------------------------------------------------
// Canned enhanced creature data
// ---------------------------------------------------------------------------

const CANNED_CREATURES = [
  {
    id: 'goblin-001',
    name: 'Goblin',
    type: 'creature',
    pack: 'wfrp4e-core.bestiary',
    packLabel: 'Core Bestiary',
    challengeRating: 2,
    creatureType: 'greenskin',
    size: 'average',
    wounds: 8,
    toughness: 3,
    hasSpells: false,
    hasSpecialAbilities: true,
    description: 'A sneaky greenskin.',
    img: 'icons/goblin.png',
  },
  {
    id: 'goblin-shaman-001',
    name: 'Goblin Shaman',
    type: 'npc',
    pack: 'wfrp4e-core.bestiary',
    packLabel: 'Core Bestiary',
    challengeRating: 5,
    creatureType: 'greenskin',
    size: 'average',
    wounds: 10,
    toughness: 3,
    hasSpells: true,
    hasSpecialAbilities: true,
    description: 'A greenskin with magical powers.',
    img: 'icons/goblin-shaman.png',
  },
  {
    id: 'gor-001',
    name: 'Gor',
    type: 'creature',
    pack: 'wfrp4e-core.bestiary',
    packLabel: 'Core Bestiary',
    challengeRating: 3,
    creatureType: 'beast',
    size: 'average',
    wounds: 12,
    toughness: 4,
    hasSpells: false,
    hasSpecialAbilities: false,
    description: 'A Beastman warrior.',
    img: 'icons/gor.png',
  },
];

/**
 * Inject a stub persistentIndex so tests never hit fetch/FilePicker.
 * Called per test; pass the creatures array you want returned.
 */
function stubPersistentIndex(da: FoundryDataAccess, creatures: typeof CANNED_CREATURES) {
  (da as any).persistentIndex = {
    getEnhancedIndex: async () => creatures,
    rebuildIndex: async () => creatures,
    registerFoundryHooks: () => {},
  };
}

// ---------------------------------------------------------------------------
// listCreaturesByCriteria — enhanced index path
// ---------------------------------------------------------------------------

describe('FoundryDataAccess.listCreaturesByCriteria — characterization', () => {
  it('snapshot: no filters returns all creatures sorted by CR then name', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      settings: {
        ...(globalThis as any).game.settings,
        get: (_m: string, k: string) => k === 'enableEnhancedCreatureIndex' ? true : true,
      },
    };

    const da = makeDA();
    stubPersistentIndex(da, CANNED_CREATURES);

    const result = await da.listCreaturesByCriteria({});
    expect(result).toMatchSnapshot();
  });

  it('snapshot: creatureType filter narrows to greenskin only', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      settings: {
        ...(globalThis as any).game.settings,
        get: (_m: string, k: string) => k === 'enableEnhancedCreatureIndex' ? true : true,
      },
    };

    const da = makeDA();
    stubPersistentIndex(da, CANNED_CREATURES);

    const result = await da.listCreaturesByCriteria({ creatureType: 'greenskin' });
    expect(result).toMatchSnapshot();
  });

  it('snapshot: threatLevel range filter returns only creatures in range', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      settings: {
        ...(globalThis as any).game.settings,
        get: (_m: string, k: string) => k === 'enableEnhancedCreatureIndex' ? true : true,
      },
    };

    const da = makeDA();
    stubPersistentIndex(da, CANNED_CREATURES);

    // CR 1–3: Goblin (2) + Gor (3); Goblin Shaman (5) excluded
    const result = await da.listCreaturesByCriteria({ threatLevel: { min: 1, max: 3 } });
    expect(result).toMatchSnapshot();
  });

  it('snapshot: hasSpells=true filter returns spellcasters only', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      settings: {
        ...(globalThis as any).game.settings,
        get: (_m: string, k: string) => k === 'enableEnhancedCreatureIndex' ? true : true,
      },
    };

    const da = makeDA();
    stubPersistentIndex(da, CANNED_CREATURES);

    const result = await da.listCreaturesByCriteria({ hasSpells: true });
    expect(result).toMatchSnapshot();
  });

  it('snapshot: fallback path (enhancedIndex disabled) returns basic search shape', async () => {
    // Enhanced index disabled → listCreaturesByCriteria calls fallbackBasicCreatureSearch
    // which calls searchCompendium('monster', 'Actor'). We need a minimal pack to satisfy it.
    const pack = {
      indexed: true,
      metadata: {
        id: 'wfrp4e-core.bestiary',
        label: 'Core Bestiary',
        type: 'Actor',
      },
      index: {
        values: () => [][Symbol.iterator](), // no entries → empty results
      },
    };

    (globalThis as any).game = {
      ...(globalThis as any).game,
      settings: {
        ...(globalThis as any).game.settings,
        get: (_m: string, k: string) => k === 'enableEnhancedCreatureIndex' ? false : true,
      },
      packs: new Map([['wfrp4e-core.bestiary', pack]]),
    };

    const da = makeDA();
    const result = await da.listCreaturesByCriteria({ creatureType: 'greenskin' });
    expect(result).toMatchSnapshot();
  });
});

// ---------------------------------------------------------------------------
// getEnhancedCreatureIndex
// ---------------------------------------------------------------------------

describe('FoundryDataAccess.getEnhancedCreatureIndex — characterization', () => {
  it('snapshot: returns raw enhanced creature array from persistentIndex', async () => {
    const da = makeDA();
    stubPersistentIndex(da, CANNED_CREATURES);

    const result = await da.getEnhancedCreatureIndex();
    expect(result).toMatchSnapshot();
  });

  it('snapshot: empty index returns empty array', async () => {
    const da = makeDA();
    stubPersistentIndex(da, []);

    const result = await da.getEnhancedCreatureIndex();
    expect(result).toMatchSnapshot();
  });
});
