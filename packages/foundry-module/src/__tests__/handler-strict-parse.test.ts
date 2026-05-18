// Phase 3a — BUG-034 / CCR-5: every handler rejects unknown keys via Zod strict parse.
// One describe block per registered warhammer-mcp query (40 total).

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryHandlers } from '../queries.js';

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
  // Phase 4 mcp_crud_expansion — 5 legacy scene handlers folded into umbrella.
  // 11 actions now dispatched via handleScene (action: 'create' | 'update' |
  // 'delete' | 'clone' | 'activate' | 'view' | 'thumbnail' | 'get' | 'list' |
  // 'add-tokens' | 'delete-token'). One strict-parse test per umbrella entry.
  ['handleScene', 'scene'],
  ['handleGetWorldInfo', 'getWorldInfo'],
  ['handlePing', 'ping'],
  ['handleCreateActorFromCompendium', 'createActorFromCompendium'],
  ['handleGetCompendiumDocumentFull', 'getCompendiumDocumentFull'],
  // handleAddActorsToScene folded into handleScene umbrella (action: 'add-tokens')
  // BUG-009 (2026-05-16): handleValidateWritePermissions removed (no MCP-tool consumer).
  ['handleRequestPlayerRolls', 'request-player-rolls'],
  // BUG-009 (2026-05-16): handleGetEnhancedCreatureIndex removed (no MCP-tool consumer).
  ['handleSetActorOwnership', 'setActorOwnership'],
  ['handleGetActorOwnership', 'getActorOwnership'],
  // BUG-009 (2026-05-16): handleGetFriendlyNPCs / handleGetConnectedPlayers removed.
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
  // BUG-009 (2026-05-16): handleGetPartyCharacters / handleFindPlayers / handleFindActor
  // removed (no MCP-tool consumer; staged in Phase 2 for /wfrp-session-prep that never landed).
  // Phase 4b
  ['handleGetCombat', 'getCombat'],
  ['handleListCombatants', 'listCombatants'],
  ['handleAdvanceCombat', 'advanceCombat'],
  ['handleAddCombatants', 'addCombatants'],
  ['handleRemoveCombatants', 'removeCombatants'],
  ['handleEndCombat', 'endCombat'],
  ['handleApplyDamage', 'applyDamage'],
  ['handleApplyCondition', 'applyCondition'],
  ['handleRemoveCondition', 'removeCondition'],
  ['handleListConditions', 'listConditions'],
  ['handleListActiveEffects', 'listActiveEffects'],
  // Phase 4g
  ['handleDuplicateActor', 'duplicateActor'],
  ['handleApplyNpcCareerAdvance', 'applyNpcCareerAdvance'],
  // Phase 4h
  ['handleApplyTemplate', 'applyTemplate'],
  // Phase 4h post-hotfix (BUG-051) — handleDeleteToken folded into handleScene
  // umbrella (action: 'delete-token').
  // apply-template-to-token — prototype-sheet routing primitive
  ['handleApplyTemplateToToken', 'applyTemplateToToken'],
  // Phase 1 mcp_crud_expansion — polymorphic ownership.
  ['handleSetDocumentOwnership', 'setDocumentOwnership'],
  ['handleGetDocumentOwnership', 'getDocumentOwnership'],
  ['handleBulkSetDocumentOwnership', 'bulkSetDocumentOwnership'],
  ['handleResetDocumentOwnership', 'resetDocumentOwnership'],
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

