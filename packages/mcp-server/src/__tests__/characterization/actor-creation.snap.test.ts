// Characterization snapshot — ActorCreationTools return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// handleCreateActor returns a plain { summary, actor } object.
// handleCreateActorFromCompendium returns a plain { summary, success, details, message } object.
// handleGetCompendiumEntryFull returns a plain formatted object.
// delete-actor lives in WorldDeleteTools (not this class) — see notes.

import { describe, it, expect } from 'vitest';
import { ActorCreationTools } from '../../tools/actor-creation.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ActorCreationTools(makeToolDeps(mockReturn));

describe('ActorCreationTools — characterization', () => {
  it('create-actor — blank character actor created', async () => {
    const r = await tool({
      id: 'newactor12345678',
      name: 'TestCharacter',
      type: 'character',
    }).handleCreateActor({
      name: 'TestCharacter',
      type: 'character',
    });
    expect(r).toMatchSnapshot();
  });

  it('create-actor — npc with systemData and skipItems', async () => {
    const r = await tool({
      id: 'npcactor12345678',
      name: 'Town Guard',
      type: 'npc',
    }).handleCreateActor({
      name: 'Town Guard',
      type: 'npc',
      systemData: { details: { species: { value: 'Human' } } },
      options: { skipItems: true },
    });
    expect(r).toMatchSnapshot();
  });

  it('create-actor-from-compendium — single actor, no scene placement', async () => {
    const r = await tool({
      success: true,
      totalCreated: 1,
      totalRequested: 1,
      tokensPlaced: 0,
      actors: [{ id: 'gobactor1234567', name: 'Snaggletooth', type: 'creature' }],
      errors: [],
    }).handleCreateActorFromCompendium({
      packId: 'wfrp4e-core.bestiary',
      itemId: 'goblin001234567',
      names: ['Snaggletooth'],
    });
    expect(r).toMatchSnapshot();
  });

  it('create-actor-from-compendium — multiple actors with token placement', async () => {
    const r = await tool({
      success: true,
      totalCreated: 3,
      totalRequested: 3,
      tokensPlaced: 3,
      actors: [
        { id: 'gob001actor12345', name: 'Snag', type: 'creature' },
        { id: 'gob002actor12345', name: 'Fang', type: 'creature' },
        { id: 'gob003actor12345', name: 'Nit',  type: 'creature' },
      ],
      errors: [],
    }).handleCreateActorFromCompendium({
      packId: 'wfrp4e-core.bestiary',
      itemId: 'goblin001234567',
      names: ['Snag', 'Fang', 'Nit'],
      addToScene: true,
      placement: { type: 'grid' },
    });
    expect(r).toMatchSnapshot();
  });

  it('get-compendium-entry-full — full stat block', async () => {
    const r = await tool({
      name: 'Goblin',
      type: 'creature',
      packLabel: 'Core Bestiary',
      system: { characteristics: { ws: { value: 30 } } },
      fullData: { prototypeToken: { name: 'Goblin' } },
      items: [
        { id: 'trait001', name: 'Bite', type: 'trait' },
        { id: 'weapon001', name: 'Crude Club', type: 'weapon' },
      ],
      effects: [],
    }).handleGetCompendiumEntryFull({
      packId: 'wfrp4e-core.bestiary',
      entryId: 'goblin001234567',
    });
    expect(r).toMatchSnapshot();
  });

  it('get-compendium-entry-full — summary_only mode', async () => {
    const r = await tool({
      name: 'Goblin',
      type: 'creature',
      packLabel: 'Core Bestiary',
      system: { characteristics: { ws: { value: 30 } } },
      fullData: { prototypeToken: { name: 'Goblin' } },
      items: [
        { id: 'trait001', name: 'Bite', type: 'trait' },
        { id: 'weapon001', name: 'Crude Club', type: 'weapon' },
      ],
      effects: [],
    }).handleGetCompendiumEntryFull({
      packId: 'wfrp4e-core.bestiary',
      entryId: 'goblin001234567',
      summary_only: true,
    });
    expect(r).toMatchSnapshot();
  });
});
