// Characterization snapshot — ModuleMastercraftedTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: list-recipes, get-recipe, check-craftable, list-pending-crafts (reads);
//         execute-craft, grant-recipe-discovery (writes); MODULE_NOT_ACTIVE branch.

import { describe, it, expect } from 'vitest';
import { ModuleMastercraftedTool } from '../../tools/modules/mastercrafted/mastercrafted.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ModuleMastercraftedTool(makeToolDeps(mockReturn));

describe('ModuleMastercraftedTool — characterization', () => {
  it('list-recipes — recipes found', async () => {
    const r = await tool({
      count: 2,
      recipes: [
        {
          bookName: 'Blacksmith Recipes',
          recipeName: 'Iron Dagger',
          pageUuid: 'JournalEntry.abc.JournalEntryPage.def',
          time: 30,
          ingredients: ['Iron Bar'],
          products: ['Dagger'],
        },
        {
          bookName: 'Alchemist Compendium',
          recipeName: 'Healing Draught',
          pageUuid: 'JournalEntry.ghi.JournalEntryPage.jkl',
          time: null,
          ingredients: ['Mandrake Root', 'Spring Water'],
          products: ['Healing Potion'],
        },
      ],
    }).execute({ action: 'list-recipes' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-recipes — no recipes', async () => {
    const r = await tool({ count: 0, recipes: [] }).execute({ action: 'list-recipes' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-recipe — populated recipe', async () => {
    const r = await tool({
      pageUuid: 'JournalEntry.abc.JournalEntryPage.def',
      name: 'Iron Dagger',
      bookName: 'Blacksmith Recipes',
      mastercrafted: {
        time: 30,
        ingredients: [
          { name: 'Iron Bar', components: [{ name: 'Iron Bar' }] },
        ],
        products: [
          { name: 'Dagger', components: [{ name: 'Dagger' }] },
        ],
      },
    }).execute({ action: 'get-recipe', pageUuid: 'JournalEntry.abc.JournalEntryPage.def' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('check-craftable — can craft', async () => {
    const r = await tool({
      pageUuid: 'JournalEntry.abc.JournalEntryPage.def',
      name: 'Iron Dagger',
      canCraft: true,
      detail: { missing: [] },
    }).execute({ action: 'check-craftable', pageUuid: 'JournalEntry.abc.JournalEntryPage.def', actorUuid: 'Actor.xyz' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-pending-crafts — pending craft ready', async () => {
    const r = await tool({
      count: 1,
      pending: [
        {
          actorName: 'Grumbar the Smith',
          actorUuid: 'Actor.abc',
          craftId: 'craft-001',
          resolveAt: 1000,
          remainingSeconds: 0,
          itemsToDeliver: ['Dagger'],
          ready: true,
        },
      ],
    }).execute({ action: 'list-pending-crafts' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('execute-craft — instant craft', async () => {
    const r = await tool({
      pageUuid: 'JournalEntry.abc.JournalEntryPage.def',
      recipeName: 'Iron Dagger',
      actorUuid: 'Actor.xyz',
      timed: false,
      pendingCraftIds: [],
      quantityPathFixed: true,
      products: ['Dagger'],
    }).execute({ action: 'execute-craft', pageUuid: 'JournalEntry.abc.JournalEntryPage.def', actorUuid: 'Actor.xyz', confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('grant-recipe-discovery — observer grant', async () => {
    const r = await tool({
      pageUuid: 'JournalEntry.abc.JournalEntryPage.def',
      name: 'Iron Dagger',
      userId: 'User.player1',
      level: 1,
    }).execute({ action: 'grant-recipe-discovery', pageUuid: 'JournalEntry.abc.JournalEntryPage.def', userId: 'User.player1' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('MODULE_NOT_ACTIVE — mastercrafted not active', async () => {
    const r = await new ModuleMastercraftedTool(
      makeToolDeps(null, 'MODULE_NOT_ACTIVE: mastercrafted is not active'),
    ).execute({ action: 'list-recipes' });
    expect((r as any).content[0].text).toMatchSnapshot();
    expect((r as any).isError).toBe(true);
  });
});
