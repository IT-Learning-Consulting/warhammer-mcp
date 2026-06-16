// Characterization snapshot tests for the creature listing path:
//   listCreaturesByCriteria (CompendiumSearchService)
// Phase 0, sub-phase 0.7.3 — regression net for the data-access.ts refactor.
// Phase 4 (R3.3): listCreaturesByCriteria + getEnhancedCreatureIndex left FoundryDataAccess. This file now
// pierces CompendiumSearchService directly; the describe/it names are UNCHANGED so the listCreaturesByCriteria
// snapshots stay byte-identical. The getEnhancedCreatureIndex describe was removed (its facade is gone) —
// the single sanctioned --update-snapshots of this phase drops those two obsolete entries (HC3 ADR).
// DO NOT edit data-access.ts, setup.ts, or any source from this file.

import { describe, it, expect, beforeEach } from 'vitest';
import { CompendiumSearchService } from '../../services/index.js';
import { MODULE_ID } from '../../constants.js';

function makeSearch(creatures: typeof CANNED_CREATURES) {
  return new CompendiumSearchService(MODULE_ID, { getEnhancedIndex: async () => creatures });
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

    const svc = makeSearch(CANNED_CREATURES);

    const result = await svc.listCreaturesByCriteria({});
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

    const svc = makeSearch(CANNED_CREATURES);

    const result = await svc.listCreaturesByCriteria({ creatureType: 'greenskin' });
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

    const svc = makeSearch(CANNED_CREATURES);

    // CR 1–3: Goblin (2) + Gor (3); Goblin Shaman (5) excluded
    const result = await svc.listCreaturesByCriteria({ threatLevel: { min: 1, max: 3 } });
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

    const svc = makeSearch(CANNED_CREATURES);

    const result = await svc.listCreaturesByCriteria({ hasSpells: true });
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

    const svc = makeSearch([]);
    const result = await svc.listCreaturesByCriteria({ creatureType: 'greenskin' });
    expect(result).toMatchSnapshot();
  });
});
