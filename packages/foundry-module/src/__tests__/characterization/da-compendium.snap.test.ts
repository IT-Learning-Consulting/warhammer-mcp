// Characterization snapshot tests for FoundryDataAccess compendium methods:
//   searchCompendium (line 921)
//   getCompendiumDocumentFull (line 2051)
//   getAvailablePacks (line 1579)
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
// Helpers
// ---------------------------------------------------------------------------

/** Minimal pack mock that satisfies searchCompendium's duck-typing. */
function makePack(opts: {
  id: string;
  label: string;
  type: string;
  system?: string;
  entries?: Array<{ _id: string; name: string; type: string; img?: string }>;
}) {
  const entries = opts.entries ?? [];
  return {
    indexed: true,
    metadata: {
      id: opts.id,
      label: opts.label,
      type: opts.type,
      system: opts.system ?? 'wfrp4e',
      private: false,
    },
    index: {
      values: () => entries[Symbol.iterator](),
    },
  };
}

// ---------------------------------------------------------------------------
// getAvailablePacks
// ---------------------------------------------------------------------------

describe('FoundryDataAccess.getAvailablePacks — characterization', () => {
  it('snapshot: returns mapped pack metadata array', async () => {
    const packs = new Map([
      ['wfrp4e-core.bestiary', makePack({
        id: 'wfrp4e-core.bestiary',
        label: 'Core Bestiary',
        type: 'Actor',
        system: 'wfrp4e',
      })],
      ['wfrp4e-core.items', makePack({
        id: 'wfrp4e-core.items',
        label: 'Core Items',
        type: 'Item',
        system: 'wfrp4e',
      })],
    ]);

    (globalThis as any).game = {
      ...(globalThis as any).game,
      packs,
    };

    const da = makeDA();
    const result = await da.getAvailablePacks();
    expect(result).toMatchSnapshot();
  });

  it('snapshot: empty packs map returns empty array', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      packs: new Map(),
    };

    const da = makeDA();
    const result = await da.getAvailablePacks();
    expect(result).toMatchSnapshot();
  });
});

// ---------------------------------------------------------------------------
// searchCompendium
// ---------------------------------------------------------------------------

describe('FoundryDataAccess.searchCompendium — characterization', () => {
  it('snapshot: basic name match returns CompendiumSearchResult shape', async () => {
    const pack = makePack({
      id: 'wfrp4e-core.bestiary',
      label: 'Core Bestiary',
      type: 'Actor',
      entries: [
        { _id: 'goblin-id-0001', name: 'Goblin', type: 'npc', img: 'icons/goblin.png' },
        { _id: 'goblin-boss-0001', name: 'Goblin Boss', type: 'npc' },
        { _id: 'human-guard-001', name: 'Town Guard', type: 'npc' },
      ],
    });

    (globalThis as any).game = {
      ...(globalThis as any).game,
      // settings.get('enableEnhancedCreatureIndex') should return false to use basic path
      settings: {
        ...(globalThis as any).game.settings,
        get: (_m: string, k: string) => k === 'enableEnhancedCreatureIndex' ? false : true,
      },
      packs: new Map([['wfrp4e-core.bestiary', pack]]),
    };

    const da = makeDA();
    const result = await da.searchCompendium('goblin');
    expect(result).toMatchSnapshot();
  });

  it('snapshot: no matches returns empty array', async () => {
    const pack = makePack({
      id: 'wfrp4e-core.bestiary',
      label: 'Core Bestiary',
      type: 'Actor',
      entries: [
        { _id: 'goblin-id-0001', name: 'Goblin', type: 'npc' },
      ],
    });

    (globalThis as any).game = {
      ...(globalThis as any).game,
      settings: {
        ...(globalThis as any).game.settings,
        get: (_m: string, k: string) => k === 'enableEnhancedCreatureIndex' ? false : true,
      },
      packs: new Map([['wfrp4e-core.bestiary', pack]]),
    };

    const da = makeDA();
    const result = await da.searchCompendium('dragon');
    expect(result).toMatchSnapshot();
  });

  it('snapshot: itemType filter narrows results by type', async () => {
    const pack = makePack({
      id: 'wfrp4e-core.items',
      label: 'Core Items',
      type: 'Item',
      entries: [
        { _id: 'sword-001', name: 'Sword', type: 'weapon' },
        { _id: 'sword-shield-001', name: 'Sword and Shield', type: 'skill' },
      ],
    });

    (globalThis as any).game = {
      ...(globalThis as any).game,
      settings: {
        ...(globalThis as any).game.settings,
        get: (_m: string, k: string) => k === 'enableEnhancedCreatureIndex' ? false : true,
      },
      packs: new Map([['wfrp4e-core.items', pack]]),
    };

    const da = makeDA();
    const result = await da.searchCompendium('sword', undefined, undefined, 'weapon');
    expect(result).toMatchSnapshot();
  });
});

// ---------------------------------------------------------------------------
// getCompendiumDocumentFull
// ---------------------------------------------------------------------------

describe('FoundryDataAccess.getCompendiumDocumentFull — characterization', () => {
  it('snapshot: actor document with items and effects', async () => {
    const docId = 'goblin-doc-00001';
    const doc = {
      id: docId,
      name: 'Goblin',
      type: 'npc',
      img: 'icons/goblin.png',
      system: {
        characteristics: { ws: { value: 25 }, t: { value: 20 } },
        status: { wounds: { value: 8, max: 8 } },
      },
      toObject: () => ({
        _id: docId,
        name: 'Goblin',
        type: 'npc',
        img: 'icons/goblin.png',
        system: {
          characteristics: { ws: { value: 25 }, t: { value: 20 } },
          status: { wounds: { value: 8, max: 8 } },
        },
      }),
      items: [
        {
          id: 'trait-001',
          name: 'Cowardly',
          type: 'trait',
          img: 'icons/trait.png',
          system: { description: { value: 'Goblins are cowardly.' } },
        },
      ],
      effects: [
        {
          id: 'eff-001',
          name: 'Frightened',
          label: 'Frightened',
          icon: 'icons/effects/frightened.png',
          disabled: false,
          duration: { type: 'rounds', duration: 2, remaining: 1 },
        },
      ],
    };

    const pack = {
      metadata: {
        id: 'wfrp4e-core.bestiary',
        label: 'Core Bestiary',
        type: 'Actor',
      },
      getDocument: async (_id: string) => doc,
    };

    (globalThis as any).game = {
      ...(globalThis as any).game,
      packs: new Map([['wfrp4e-core.bestiary', pack]]),
    };

    const da = makeDA();
    const result = await da.getCompendiumDocumentFull('wfrp4e-core.bestiary', docId);
    expect(result).toMatchSnapshot();
  });

  it('BUG-386: preserves the `key` field on ActiveEffect changes (sanitizer must not strip it)', async () => {
    const docId = 'talent-key-00001';
    const doc = {
      id: docId,
      name: 'Strong-Backed',
      type: 'talent',
      system: {},
      toObject: () => ({
        _id: docId,
        name: 'Strong-Backed',
        type: 'talent',
        effects: [
          {
            _id: 'eff-key-001',
            name: 'Strong-Backed AE',
            changes: [
              { key: 'system.characteristics.s.initial', value: '5', mode: 2, priority: null },
              { key: 'system.characteristics.t.initial', value: '5', mode: 2, priority: null },
            ],
          },
        ],
      }),
    };
    const pack = {
      metadata: { id: 'nations-of-mankind-wfrp4e.talents-nom', label: 'NoM Talents', type: 'Item' },
      getDocument: async (_id: string) => doc,
    };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      packs: new Map([['nations-of-mankind-wfrp4e.talents-nom', pack]]),
    };

    const da = makeDA();
    const result: any = await da.getCompendiumDocumentFull('nations-of-mankind-wfrp4e.talents-nom', docId);

    // WHY: the AE change `key` is the target attribute path — load-bearing data, NOT a credential.
    // Stripping it (BUG-386) made correctly-keyed changes project as keyless and nearly caused 15
    // destructive "fixes". The full change tuple, key included, must survive sanitization in fullData.
    const changes = result.fullData.effects[0].changes;
    expect(changes).toHaveLength(2);
    expect(changes[0].key).toBe('system.characteristics.s.initial');
    expect(changes[1].key).toBe('system.characteristics.t.initial');
    expect(changes[0].value).toBe('5');
    expect(changes[0].mode).toBe(2);
  });

  it('snapshot: item document (no items/effects collections)', async () => {
    const docId = 'sword-item-00001';
    const doc = {
      id: docId,
      name: 'Hand Weapon',
      type: 'weapon',
      img: 'icons/weapons/hand-weapon.png',
      system: {
        damage: { value: 'SB+4' },
        qualities: { value: ['Fast'] },
      },
      toObject: () => ({
        _id: docId,
        name: 'Hand Weapon',
        type: 'weapon',
        system: {
          damage: { value: 'SB+4' },
          qualities: { value: ['Fast'] },
        },
      }),
      // no .items, no .effects
    };

    const pack = {
      metadata: {
        id: 'wfrp4e-core.trappings',
        label: 'Core Trappings',
        type: 'Item',
      },
      getDocument: async (_id: string) => doc,
    };

    (globalThis as any).game = {
      ...(globalThis as any).game,
      packs: new Map([['wfrp4e-core.trappings', pack]]),
    };

    const da = makeDA();
    const result = await da.getCompendiumDocumentFull('wfrp4e-core.trappings', docId);
    expect(result).toMatchSnapshot();
  });

  it('throws when pack does not exist', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      packs: new Map(),
    };

    const da = makeDA();
    await expect(
      da.getCompendiumDocumentFull('non.existent', 'doc-id')
    ).rejects.toThrow('not found');
  });
});
