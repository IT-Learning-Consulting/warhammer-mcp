// Characterization snapshot — CompendiumTools return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: search-compendium, get-compendium-item, list-creatures-by-criteria, list-compendium-packs
// NOTE: get-compendium-entry-full is intentionally EXCLUDED (covered by another batch).
// NOTE: get-compendium-item and list-* return bare objects (not content envelopes) —
//       snapshot `r` directly per source inspection.

import { describe, it, expect } from 'vitest';
import { CompendiumTools } from '../../tools/compendium.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new CompendiumTools(makeToolDeps(mockReturn));

describe('CompendiumTools — characterization', () => {
  it('search-compendium — actor result set', async () => {
    const r = await tool([
      {
        id: 'abc123',
        name: 'Goblin',
        type: 'npc',
        pack: 'wfrp4e-core.actors',
        packLabel: 'WFRP4e Core Actors',
        img: 'icons/goblin.webp',
        system: {
          characteristics: { t: { value: 25 } },
          status: { wounds: { value: 8, max: 12 }, armour: { value: 1 } },
          details: { species: { value: 'Goblin' } },
        },
      },
    ]).handleSearchCompendium({ query: 'goblin', packType: 'Actor', limit: 50 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-compendium-item — compact mode', async () => {
    const r = await tool({
      id: 'item001',
      name: 'Sword',
      type: 'weapon',
      pack: 'wfrp4e-core.items',
      packLabel: 'WFRP4e Core Items',
      img: 'icons/sword.webp',
      system: {
        description: { value: '<p>A sturdy iron sword.</p>' },
        characteristics: {},
        status: {},
      },
      items: [],
      effects: [],
    }).handleGetCompendiumItem({ packId: 'wfrp4e-core.items', itemId: 'item001', compact: true });
    expect(r).toMatchSnapshot();
  });

  it('get-compendium-item — full mode', async () => {
    const r = await tool({
      id: 'item002',
      name: 'Shield',
      type: 'armour',
      pack: 'wfrp4e-core.items',
      packLabel: 'WFRP4e Core Items',
      img: 'icons/shield.webp',
      system: {
        description: { value: '<p>A wooden shield.</p>' },
        armor: { value: 1 },
      },
      items: [],
      effects: [],
      fullData: { _id: 'item002' },
    }).handleGetCompendiumItem({ packId: 'wfrp4e-core.items', itemId: 'item002', compact: false });
    expect(r).toMatchSnapshot();
  });

  it('list-creatures-by-criteria — full entry mode', async () => {
    const r = await tool({
      creatures: [
        {
          id: 'cre001',
          name: 'Beastman',
          type: 'npc',
          pack: 'wfrp4e-core.actors',
          packLabel: 'WFRP4e Core Actors',
          challengeRating: 12,
          creatureType: 'Beastman',
          size: 'avg',
          hasSpells: false,
          hasSpecialAbilities: true,
        },
      ],
      searchSummary: {
        packsSearched: 5,
        topPacks: ['wfrp4e-core.actors'],
        totalCreaturesFound: 1,
      },
    }).handleListCreaturesByCriteria({ creatureType: 'beastman', limit: 100 });
    expect(r).toMatchSnapshot();
  });

  it('list-creatures-by-criteria — compact mode', async () => {
    const r = await tool({
      creatures: [
        { id: 'cre002', name: 'Rat', type: 'npc', pack: 'wfrp4e-core.actors', packLabel: 'WFRP4e Core Actors' },
      ],
      searchSummary: { packsSearched: 2, topPacks: ['wfrp4e-core.actors'], totalCreaturesFound: 1 },
    }).handleListCreaturesByCriteria({ compact: true, limit: 100 });
    expect(r).toMatchSnapshot();
  });

  it('list-compendium-packs — filtered by type', async () => {
    const r = await tool([
      { id: 'wfrp4e-core.actors', label: 'Core Actors', type: 'Actor', system: 'wfrp4e', private: false },
      { id: 'wfrp4e-core.items', label: 'Core Items', type: 'Item', system: 'wfrp4e', private: false },
    ]).handleListCompendiumPacks({ type: 'Actor' });
    expect(r).toMatchSnapshot();
  });

  it('list-compendium-packs — all packs', async () => {
    const r = await tool([
      { id: 'wfrp4e-core.actors', label: 'Core Actors', type: 'Actor', system: 'wfrp4e', private: false },
      { id: 'wfrp4e-core.items', label: 'Core Items', type: 'Item', system: 'wfrp4e', private: false },
      { id: 'wfrp4e-core.tables', label: 'Core Tables', type: 'RollTable', system: 'wfrp4e', private: false },
    ]).handleListCompendiumPacks({});
    expect(r).toMatchSnapshot();
  });
});
