// Phase 3a — BUG-034 / CCR-5: every handler rejects unknown keys via Zod strict parse.
// One describe block per registered warhammer-mcp query (40 total).

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryHandlers } from '../queries.js';
import { handleGetPartyCharacters, handleFindPlayers, handleFindActor } from '../_staging/orphan-handlers.js';

function bad<T>(extra: Record<string, unknown> = { unknownKey: 'x' }): T {
  return { ...extra } as any;
}

function makeHandlers(): QueryHandlers {
  const qh = new QueryHandlers();
  (qh.dataAccess as any).validateFoundryState = () => {};
  return qh;
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  (globalThis as any).game = {
    ...(globalThis as any).game,
    system: { id: 'wfrp4e' },
    user: { isGM: true, id: 'gm', name: 'GM' },
    tables: new Map(),
    actors: new Map(),
  };
});

// Class-method handlers on QueryHandlers — 37 of them
const methodCases: Array<[string, string]> = [
  ['handleGetCharacterInfo', 'getCharacterInfo'],
  ['handleListActors', 'listActors'],
  ['handleSearchCompendium', 'searchCompendium'],
  ['handleAddItemFromCompendium', 'addItemFromCompendium'],
  ['handleListCreaturesByCriteria', 'listCreaturesByCriteria'],
  ['handleGetAvailablePacks', 'getAvailablePacks'],
  ['handleGetActiveScene', 'getActiveScene'],
  ['handleListScenes', 'list-scenes'],
  ['handleSwitchScene', 'switch-scene'],
  ['handleGetWorldInfo', 'getWorldInfo'],
  ['handlePing', 'ping'],
  ['handleCreateActorFromCompendium', 'createActorFromCompendium'],
  ['handleGetCompendiumDocumentFull', 'getCompendiumDocumentFull'],
  ['handleAddActorsToScene', 'addActorsToScene'],
  ['handleValidateWritePermissions', 'validateWritePermissions'],
  ['handleCreateJournalEntry', 'createJournalEntry'],
  ['handleListJournals', 'listJournals'],
  ['handleGetJournalContent', 'getJournalContent'],
  ['handleUpdateJournalContent', 'updateJournalContent'],
  ['handleRequestPlayerRolls', 'request-player-rolls'],
  ['handleGetEnhancedCreatureIndex', 'getEnhancedCreatureIndex'],
  ['handleSetActorOwnership', 'setActorOwnership'],
  ['handleGetActorOwnership', 'getActorOwnership'],
  ['handleGetFriendlyNPCs', 'getFriendlyNPCs'],
  ['handleGetConnectedPlayers', 'getConnectedPlayers'],
  ['handleCreateActor', 'createActor'],
  ['handleUpdateActor', 'updateActor'],
  ['handleUpdateItem', 'updateItem'],
  ['handleCreateItem', 'createItem'],
  ['handleDeleteItem', 'deleteItem'],
  ['handleModifyItemQualities', 'modifyItemQualities'],
  ['handleCreateRollTable', 'createRollTable'],
  ['handleAddTableResults', 'addTableResults'],
  ['handleListRollTables', 'listRollTables'],
  ['handleGetRollTable', 'getRollTable'],
  ['handleRollOnTable', 'rollOnTable'],
  ['handleDeleteRollTable', 'deleteRollTable'],
];

for (const [methodName, queryKey] of methodCases) {
  describe(`${queryKey}`, () => {
    it('rejects unknown keys with Invalid input ZodError', async () => {
      const qh = makeHandlers();
      // @ts-expect-error — private handler access for boundary validation test
      const fn = qh[methodName].bind(qh);
      await expect(fn(bad())).rejects.toThrow(/Invalid input/);
    });
  });
}

// Orphan handlers (3) — registered as arrow-wrapped functions in queries.ts
describe('getPartyCharacters', () => {
  it('rejects unknown keys with Invalid input ZodError', async () => {
    const qh = makeHandlers();
    await expect(handleGetPartyCharacters(qh.dataAccess, bad())).rejects.toThrow(/Invalid input/);
  });
});

describe('findPlayers', () => {
  it('rejects unknown keys with Invalid input ZodError', async () => {
    const qh = makeHandlers();
    await expect(handleFindPlayers(bad(), qh.dataAccess)).rejects.toThrow(/Invalid input/);
  });
});

describe('findActor', () => {
  it('rejects unknown keys with Invalid input ZodError', async () => {
    const qh = makeHandlers();
    await expect(handleFindActor(bad(), qh.dataAccess)).rejects.toThrow(/Invalid input/);
  });
});
