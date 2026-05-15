import { z } from 'zod';
import { MODULE_ID } from './constants.js';
import { FoundryDataAccess } from './data-access.js';
import { wrappedWrite } from './transaction-manager.js';
import { permissionManager } from './permissions.js';
// Phase 1 mcp_crud_expansion — polymorphic ownership handlers.
import {
  setDocumentOwnership as setDocumentOwnershipHandler,
  getDocumentOwnership as getDocumentOwnershipHandler,
  bulkSetDocumentOwnership as bulkSetDocumentOwnershipHandler,
  resetDocumentOwnership as resetDocumentOwnershipHandler,
} from './handlers/ownership.js';
// Phase 2 mcp_crud_expansion — RollTable handlers (migrated from inline + 7 new actions).
import {
  createRollTable as createRollTableHandler,
  addTableResults as addTableResultsHandler,
  listRollTables as listRollTablesHandler,
  getRollTable as getRollTableHandler,
  rollOnTable as rollOnTableHandler,
  deleteRollTable as deleteRollTableHandler,
  updateRollTable as updateRollTableHandler,
  updateTableResults as updateTableResultsHandler,
  deleteTableResults as deleteTableResultsHandler,
  normalizeRollTable as normalizeRollTableHandler,
  resetRollTableResults as resetRollTableResultsHandler,
  drawManyFromTable as drawManyFromTableHandler,
  importRollTableFromCompendium as importRollTableFromCompendiumHandler,
} from './handlers/rolltable.js';
// Phase 3 mcp_crud_expansion — Journal umbrella dispatcher (13 actions).
// Replaces 5 inline handlers (handleCreateJournalEntry, handleListJournals,
// handleGetJournalContent, handleUpdateJournalContent, handleDeleteJournalEntry).
import { dispatchJournal as dispatchJournalHandler } from './handlers/journal.js';
// Phase 4 mcp_crud_expansion — Scene umbrella dispatcher (11 actions).
// Replaces 5 inline handlers (handleGetActiveScene, handleListScenes,
// handleSwitchScene, handleAddActorsToScene, handleDeleteToken).
import { dispatchScene as dispatchSceneHandler } from './handlers/scene.js';
import {
  // actor domain
  GetCharacterInfoInput,
  ListActorsInput,
  CreateActorInput,
  UpdateActorInput,
  CreateActorFromCompendiumInput,
  ValidateWritePermissionsInput,
  SetActorOwnershipInput,
  GetActorOwnershipInput,
  // Phase 1 mcp_crud_expansion — polymorphic ownership schemas.
  SetDocumentOwnershipInput,
  GetDocumentOwnershipInput,
  BulkSetDocumentOwnershipInput,
  ResetDocumentOwnershipInput,
  GetFriendlyNPCsInput,
  GetConnectedPlayersInput,
  GetPartyCharactersInput,
  FindPlayersInput,
  FindActorInput,
  DuplicateActorInput,
  ApplyNpcCareerAdvanceInput,
  ApplyTemplateInput,
  ListActorItemsInput,
  // item domain
  CreateItemInput,
  UpdateItemInput,
  DeleteItemInput,
  ModifyItemQualitiesInput,
  AddItemFromCompendiumInput,
  TradeItemInput,
  // compendium domain
  SearchCompendiumInput,
  ListCreaturesByCriteriaInput,
  GetAvailablePacksInput,
  GetCompendiumDocumentFullInput,
  GetEnhancedCreatureIndexInput,
  // scene domain — Phase 4: 5 legacy schemas folded into SceneToolInput umbrella.
  // Only ApplyTemplateToTokenInput stays (separate prototype-token-routing tool).
  ApplyTemplateToTokenInput,
  // meta (rolltable, ping, world, player rolls)
  PingInput,
  GetWorldInfoInput,
  GetWfrp4eConfigInput,
  // Phase 3 mcp_crud_expansion — journal CRUD moved to journal.ts umbrella.
  // CreateJournalEntryInput / ListJournalsInput / GetJournalContentInput /
  // UpdateJournalContentInput / DeleteJournalEntryInput retired here; handler
  // parses against JournalToolInput from @foundry-mcp/shared/journal.
  RequestPlayerRollsInput,
  // RollTable schemas moved to handlers/rolltable.ts (Phase 2; parsed handler-side).
  DeleteActorInput,
  // combat domain (Phase 4b)
  GetCombatInput,
  ListCombatantsInput,
  AdvanceCombatInput,
  AddCombatantsInput,
  RemoveCombatantsInput,
  EndCombatInput,
  ApplyDamageInput,
  // conditions / effects domain (Phase 4b)
  ApplyConditionInput,
  RemoveConditionInput,
  ListConditionsInput,
  ListActiveEffectsInput,
  // Phase 5 follow-up B — active-effect CRUD
  AddActiveEffectInput,
  UpdateActiveEffectInput,
  DeleteActiveEffectInput,
  // TOOL-IDEA-003 (2026-05-14): get-active-effect-by-name
  GetActiveEffectByNameInput,
} from '@foundry-mcp/shared';

/**
 * Wrap ZodError as Invalid input for consistent boundary error shape (CCR-5).
 */
function rethrowAsInvalidInput(error: unknown): void {
  if (error instanceof z.ZodError) {
    throw new Error(`Invalid input: ${error.message}`);
  }
}

export class QueryHandlers {
  public dataAccess: FoundryDataAccess;

  constructor() {
    this.dataAccess = new FoundryDataAccess();
  }

  /**
   * SECURITY: Validate GM access - returns silent failure for non-GM users
   */
  private validateGMAccess(): { allowed: boolean; error?: any } {
    if (!game.user?.isGM) {
      return { allowed: false };
    }
    return { allowed: true };
  }

  registerHandlers(): void {
    const modulePrefix = MODULE_ID;

    CONFIG.queries[`${modulePrefix}.getCharacterInfo`] = this.handleGetCharacterInfo.bind(this);
    CONFIG.queries[`${modulePrefix}.listActors`] = this.handleListActors.bind(this);
    CONFIG.queries[`${modulePrefix}.searchCompendium`] = this.handleSearchCompendium.bind(this);
    CONFIG.queries[`${modulePrefix}.addItemFromCompendium`] = this.handleAddItemFromCompendium.bind(this);
    CONFIG.queries[`${modulePrefix}.listCreaturesByCriteria`] = this.handleListCreaturesByCriteria.bind(this);
    CONFIG.queries[`${modulePrefix}.getAvailablePacks`] = this.handleGetAvailablePacks.bind(this);
    CONFIG.queries[`${modulePrefix}.getWorldInfo`] = this.handleGetWorldInfo.bind(this);
    CONFIG.queries[`${modulePrefix}.ping`] = this.handlePing.bind(this);
    CONFIG.queries[`${modulePrefix}.createActorFromCompendium`] = this.handleCreateActorFromCompendium.bind(this);
    CONFIG.queries[`${modulePrefix}.getCompendiumDocumentFull`] = this.handleGetCompendiumDocumentFull.bind(this);
    // Phase 4 mcp_crud_expansion — single `scene` umbrella replaces 5 legacy keys
    // (getActiveScene, list-scenes, switch-scene, addActorsToScene, deleteToken).
    // 11 actions dispatched in handlers/scene.ts.
    CONFIG.queries[`${modulePrefix}.scene`] = this.handleScene.bind(this);
    CONFIG.queries[`${modulePrefix}.validateWritePermissions`] = this.handleValidateWritePermissions.bind(this);
    // Phase 3 mcp_crud_expansion — single `journal` umbrella replaces 5 legacy keys
    // (createJournalEntry / listJournals / getJournalContent / updateJournalContent /
    // deleteJournalEntry). 13 actions dispatched in handlers/journal.ts.
    CONFIG.queries[`${modulePrefix}.journal`] = this.handleJournal.bind(this);
    CONFIG.queries[`${modulePrefix}.deleteActor`] = this.handleDeleteActor.bind(this);
    CONFIG.queries[`${modulePrefix}.request-player-rolls`] = this.handleRequestPlayerRolls.bind(this);
    CONFIG.queries[`${modulePrefix}.getEnhancedCreatureIndex`] = this.handleGetEnhancedCreatureIndex.bind(this);
    // Deprecation wrappers — old actor-only ownership keys (PRD R1.5).
    CONFIG.queries[`${modulePrefix}.setActorOwnership`] = this.handleSetActorOwnership.bind(this);
    CONFIG.queries[`${modulePrefix}.getActorOwnership`] = this.handleGetActorOwnership.bind(this);
    // Phase 1 mcp_crud_expansion — polymorphic ownership surface (4 handlers).
    CONFIG.queries[`${modulePrefix}.setDocumentOwnership`] = this.handleSetDocumentOwnership.bind(this);
    CONFIG.queries[`${modulePrefix}.getDocumentOwnership`] = this.handleGetDocumentOwnership.bind(this);
    CONFIG.queries[`${modulePrefix}.bulkSetDocumentOwnership`] = this.handleBulkSetDocumentOwnership.bind(this);
    CONFIG.queries[`${modulePrefix}.resetDocumentOwnership`] = this.handleResetDocumentOwnership.bind(this);
    CONFIG.queries[`${modulePrefix}.getFriendlyNPCs`] = this.handleGetFriendlyNPCs.bind(this);
    CONFIG.queries[`${modulePrefix}.getPartyCharacters`] = this.handleGetPartyCharacters.bind(this);
    CONFIG.queries[`${modulePrefix}.getConnectedPlayers`] = this.handleGetConnectedPlayers.bind(this);
    CONFIG.queries[`${modulePrefix}.findPlayers`] = this.handleFindPlayers.bind(this);
    CONFIG.queries[`${modulePrefix}.findActor`] = this.handleFindActor.bind(this);
    CONFIG.queries[`${modulePrefix}.createActor`] = this.handleCreateActor.bind(this);
    CONFIG.queries[`${modulePrefix}.updateActor`] = this.handleUpdateActor.bind(this);
    CONFIG.queries[`${modulePrefix}.updateItem`] = this.handleUpdateItem.bind(this);
    CONFIG.queries[`${modulePrefix}.createItem`] = this.handleCreateItem.bind(this);
    CONFIG.queries[`${modulePrefix}.deleteItem`] = this.handleDeleteItem.bind(this);
    CONFIG.queries[`${modulePrefix}.modifyItemQualities`] = this.handleModifyItemQualities.bind(this);
    CONFIG.queries[`${modulePrefix}.tradeItem`] = this.handleTradeItem.bind(this);
    // Phase 2 mcp_crud_expansion — RollTable surface (6 migrated + 7 new = 13 handlers).
    CONFIG.queries[`${modulePrefix}.createRollTable`] = this.handleCreateRollTable.bind(this);
    CONFIG.queries[`${modulePrefix}.addTableResults`] = this.handleAddTableResults.bind(this);
    CONFIG.queries[`${modulePrefix}.listRollTables`] = this.handleListRollTables.bind(this);
    CONFIG.queries[`${modulePrefix}.getRollTable`] = this.handleGetRollTable.bind(this);
    CONFIG.queries[`${modulePrefix}.rollOnTable`] = this.handleRollOnTable.bind(this);
    CONFIG.queries[`${modulePrefix}.deleteRollTable`] = this.handleDeleteRollTable.bind(this);
    CONFIG.queries[`${modulePrefix}.updateRollTable`] = this.handleUpdateRollTable.bind(this);
    CONFIG.queries[`${modulePrefix}.updateTableResults`] = this.handleUpdateTableResults.bind(this);
    CONFIG.queries[`${modulePrefix}.deleteTableResults`] = this.handleDeleteTableResults.bind(this);
    CONFIG.queries[`${modulePrefix}.normalizeRollTable`] = this.handleNormalizeRollTable.bind(this);
    CONFIG.queries[`${modulePrefix}.resetRollTableResults`] = this.handleResetRollTableResults.bind(this);
    CONFIG.queries[`${modulePrefix}.drawManyFromTable`] = this.handleDrawManyFromTable.bind(this);
    CONFIG.queries[`${modulePrefix}.importRollTableFromCompendium`] = this.handleImportRollTableFromCompendium.bind(this);

    // Phase 4b — combat + damage + conditions + active-effects
    CONFIG.queries[`${modulePrefix}.getCombat`] = this.handleGetCombat.bind(this);
    CONFIG.queries[`${modulePrefix}.listCombatants`] = this.handleListCombatants.bind(this);
    CONFIG.queries[`${modulePrefix}.advanceCombat`] = this.handleAdvanceCombat.bind(this);
    CONFIG.queries[`${modulePrefix}.addCombatants`] = this.handleAddCombatants.bind(this);
    CONFIG.queries[`${modulePrefix}.removeCombatants`] = this.handleRemoveCombatants.bind(this);
    CONFIG.queries[`${modulePrefix}.endCombat`] = this.handleEndCombat.bind(this);
    CONFIG.queries[`${modulePrefix}.applyDamage`] = this.handleApplyDamage.bind(this);
    CONFIG.queries[`${modulePrefix}.applyCondition`] = this.handleApplyCondition.bind(this);
    CONFIG.queries[`${modulePrefix}.removeCondition`] = this.handleRemoveCondition.bind(this);
    CONFIG.queries[`${modulePrefix}.listConditions`] = this.handleListConditions.bind(this);
    CONFIG.queries[`${modulePrefix}.listActiveEffects`] = this.handleListActiveEffects.bind(this);

    // Phase 4c.0 — config-read primitive for skill-side rule lookups
    CONFIG.queries[`${modulePrefix}.getWfrp4eConfig`] = this.handleGetWfrp4eConfig.bind(this);

    // Phase 4g — /wfrp-build-npc primitives
    CONFIG.queries[`${modulePrefix}.duplicateActor`] = this.handleDuplicateActor.bind(this);
    CONFIG.queries[`${modulePrefix}.applyNpcCareerAdvance`] = this.handleApplyNpcCareerAdvance.bind(this);
    CONFIG.queries[`${modulePrefix}.listActorItems`] = this.handleListActorItems.bind(this);

    // Phase 4h — /wfrp-encounter-builder template-composition primitive
    CONFIG.queries[`${modulePrefix}.applyTemplate`] = this.handleApplyTemplate.bind(this);

    // apply-template-to-token — token-delta variant for prototype-sheet routing
    CONFIG.queries[`${modulePrefix}.applyTemplateToToken`] = this.handleApplyTemplateToToken.bind(this);

    // Phase 5 follow-up B — active-effect CRUD
    CONFIG.queries[`${modulePrefix}.addActiveEffect`] = this.handleAddActiveEffect.bind(this);
    CONFIG.queries[`${modulePrefix}.updateActiveEffect`] = this.handleUpdateActiveEffect.bind(this);
    CONFIG.queries[`${modulePrefix}.deleteActiveEffect`] = this.handleDeleteActiveEffect.bind(this);

    // TOOL-IDEA-003 (2026-05-14): read-only AE-by-name resolver.
    CONFIG.queries[`${modulePrefix}.getActiveEffectByName`] = this.handleGetActiveEffectByName.bind(this);
  }

  unregisterHandlers(): void {
    const modulePrefix = MODULE_ID;
    const keysToRemove = Object.keys(CONFIG.queries).filter(key => key.startsWith(modulePrefix));
    for (const key of keysToRemove) {
      delete CONFIG.queries[key];
    }
  }

  async handleQuery(queryName: string, data: any): Promise<any> {
    try {
      const handler = CONFIG.queries[queryName];
      if (!handler || typeof handler !== 'function') {
        throw new Error(`Query handler not found: ${queryName}`);
      }
      return await handler(data);
    } catch (error) {
      console.error(`[${MODULE_ID}] Query failed: ${queryName}`, error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  private async handleGetCharacterInfo(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = GetCharacterInfoInput.strict().parse(data ?? {});
      const identifier = parsed.characterName || parsed.characterId;
      if (!identifier) throw new Error('characterName or characterId is required');
      return { success: true, data: await this.dataAccess.getCharacterInfo(identifier) };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to get character info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleListActors(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = ListActorsInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.listActors(parsed.type) };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to list actors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleSearchCompendium(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = SearchCompendiumInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.searchCompendium(parsed.query, parsed.packType, parsed.filters as any, parsed.itemType) };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to search compendium: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleAddItemFromCompendium(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = AddItemFromCompendiumInput.strict().parse(data ?? {});
      const uuid = parsed.itemUuid ?? parsed.compendiumId;
      if (!uuid) throw new Error('add-item-from-compendium: one of {itemUuid, compendiumId} is required.');
      return await wrappedWrite('addItemFromCompendium', async () => {
        const actor = game.actors?.get(parsed.actorId);
        if (!actor) throw new Error(`Actor with ID "${parsed.actorId}" not found`);

        const itemDoc = await fromUuid(uuid);
        if (!itemDoc) throw new Error(`Item with UUID "${uuid}" not found in compendium`);

        const itemData = itemDoc.toObject();
        const createdItems = await actor.createEmbeddedDocuments('Item', [itemData]);
        if (!createdItems || createdItems.length === 0) throw new Error('Failed to create item on actor');

        const createdItem = createdItems[0];
        ui.notifications?.info(`MCP: Added ${createdItem.name} to ${actor.name} (from compendium)`);

        const payload = {
          itemId: createdItem.id,
          itemName: createdItem.name,
          itemType: (createdItem as any).type,
          actorId: actor.id,
          actorName: actor.name,
          message: `Successfully added "${createdItem.name}" to ${actor.name} from compendium`,
        };
        return { success: true, data: payload };
      });
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to add item from compendium: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleListCreaturesByCriteria(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = ListCreaturesByCriteriaInput.strict().parse(data ?? {});
      const result = await this.dataAccess.listCreaturesByCriteria(parsed as any);
      return { success: true, data: result };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to list creatures by criteria: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleGetAvailablePacks(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      GetAvailablePacksInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.getAvailablePacks() };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to get available packs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 4 mcp_crud_expansion — single umbrella entry point for all 11 scene
  // actions. Validates Foundry-side state then delegates to dispatchScene
  // (handlers/scene.ts) which routes by `args.action`.
  private async handleScene(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchSceneHandler(data, this.dataAccess);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch scene action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleGetWorldInfo(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      GetWorldInfoInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.getWorldInfo() };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to get world info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handlePing(data: unknown): Promise<any> {
    try {
      PingInput.strict().parse(data ?? {});
      const payload = {
        status: 'ok',
        timestamp: Date.now(),
        module: MODULE_ID,
        foundryVersion: game.version,
        worldId: game.world?.id,
        userId: game.user?.id,
      };
      return { success: true, data: payload };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to ping: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getRegisteredMethods(): string[] {
    const modulePrefix = MODULE_ID;
    return Object.keys(CONFIG.queries)
      .filter(key => key.startsWith(modulePrefix))
      .map(key => key.replace(`${modulePrefix}.`, ''));
  }

  isMethodRegistered(method: string): boolean {
    const queryKey = `${MODULE_ID}.${method}`;
    return queryKey in CONFIG.queries && typeof CONFIG.queries[queryKey] === 'function';
  }

  // ===== Write operation handlers =====

  private async handleCreateActorFromCompendium(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = CreateActorFromCompendiumInput.strict().parse(data ?? {});

      const requestData: any = {
        packId: parsed.packId,
        itemId: parsed.itemId,
        customNames: parsed.customNames || [],
        quantity: parsed.quantity || 1,
        addToScene: parsed.addToScene || false,
      };
      if (parsed.placement) requestData.placement = parsed.placement;

      return await wrappedWrite('createActorFromCompendium', async () => ({ success: true, data: await this.dataAccess.createActorFromCompendiumEntry(requestData) }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to create actor from compendium: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleGetCompendiumDocumentFull(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = GetCompendiumDocumentFullInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.getCompendiumDocumentFull(parsed.packId, parsed.documentId) };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to get compendium document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 4 mcp_crud_expansion — handleAddActorsToScene + handleDeleteToken
  // folded into handleScene umbrella (action: 'add-tokens' / 'delete-token').

  private async handleValidateWritePermissions(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = ValidateWritePermissionsInput.strict().parse(data ?? {});
      const check = permissionManager.checkWritePermission(parsed.operation);
      const payload = {
        allowed: check.allowed,
        ...(check.reason ? { reason: check.reason } : {}),
        ...(check.requiresConfirmation ? { requiresConfirmation: check.requiresConfirmation } : {}),
        ...(check.warnings ? { warnings: check.warnings } : {}),
      };
      return { success: true, data: payload };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to validate write permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 3 mcp_crud_expansion — Journal umbrella dispatcher (13 actions).
  // Replaces 5 legacy inline handlers: handleCreateJournalEntry, handleListJournals,
  // handleGetJournalContent, handleUpdateJournalContent, handleDeleteJournalEntry.
  // The free-function dispatchJournal in handlers/journal.ts owns input strict-parse,
  // GM access gate, transaction wrapping, BUG-070 post-verify, and the typed
  // response envelope per action.
  async handleJournal(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchJournalHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch journal action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleRequestPlayerRolls(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = RequestPlayerRollsInput.strict().parse(data ?? {});
      return await wrappedWrite('requestPlayerRolls', async () => ({ success: true, data: await this.dataAccess.requestPlayerRolls(parsed) }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to request player rolls: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleGetEnhancedCreatureIndex(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      GetEnhancedCreatureIndexInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.getEnhancedCreatureIndex() };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to get enhanced creature index: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // PRD R1.5 — deprecation wrappers. Old actor-only ownership keys are kept
  // exported so cached legacy callers fail loudly with a pointer at the new
  // polymorphic surface. Input is still strict-parsed (BUG-034 / CCR-5).
  async handleSetActorOwnership(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      SetActorOwnershipInput.strict().parse(data ?? {});
      return {
        success: false,
        error: 'setActorOwnership is deprecated; use setDocumentOwnership with documentType: "actor" (PRD mcp_crud_expansion Phase 1 R1.5)',
        deprecated: true,
      };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to set actor ownership: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleGetActorOwnership(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      GetActorOwnershipInput.strict().parse(data ?? {});
      return {
        success: false,
        error: 'getActorOwnership is deprecated; use getDocumentOwnership with documentType: "actor" (PRD mcp_crud_expansion Phase 1 R1.5)',
        deprecated: true,
      };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to get actor ownership: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 1 mcp_crud_expansion — polymorphic ownership handlers. Each strict-parses
  // its input (CCR-5) and delegates to handlers/ownership.ts where the GM gate +
  // wrappedWrite + Foundry doc updates live.
  async handleSetDocumentOwnership(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      const parsed = SetDocumentOwnershipInput.parse(data ?? {});
      return await setDocumentOwnershipHandler(parsed);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to set document ownership: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleGetDocumentOwnership(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      const parsed = GetDocumentOwnershipInput.parse(data ?? {});
      return await getDocumentOwnershipHandler(parsed);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to get document ownership: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleBulkSetDocumentOwnership(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      const parsed = BulkSetDocumentOwnershipInput.parse(data ?? {});
      return await bulkSetDocumentOwnershipHandler(parsed);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to bulk-set document ownership: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleResetDocumentOwnership(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      const parsed = ResetDocumentOwnershipInput.parse(data ?? {});
      return await resetDocumentOwnershipHandler(parsed);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to reset document ownership: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleGetFriendlyNPCs(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      GetFriendlyNPCsInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.getFriendlyNPCs() };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to get friendly NPCs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleGetConnectedPlayers(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      GetConnectedPlayersInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.getConnectedPlayers() };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to get connected players: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleGetPartyCharacters(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      GetPartyCharactersInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.getPartyCharacters() };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to get party characters: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleFindPlayers(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = FindPlayersInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.findPlayers(parsed) };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to find players: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleFindActor(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = FindActorInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.findActor(parsed) };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to find actor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 4 mcp_crud_expansion — handleListScenes folded into handleScene umbrella
  // (action: 'list'). handleSwitchScene removed; clean-break replacement is the
  // pair `scene { action: 'activate' }` (world-active) + `scene { action: 'view' }`
  // (per-user canvas view).

  private async handleCreateActor(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = CreateActorInput.strict().parse(data ?? {});
      return await wrappedWrite('createActor', async () => ({ success: true, data: await this.dataAccess.createActor(parsed) }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to create actor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleDuplicateActor(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = DuplicateActorInput.strict().parse(data ?? {});
      return await wrappedWrite('duplicateActor', async () => ({ success: true, data: await this.dataAccess.duplicateActor(parsed) }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to duplicate actor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleApplyNpcCareerAdvance(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = ApplyNpcCareerAdvanceInput.strict().parse(data ?? {});
      return await wrappedWrite('applyNpcCareerAdvance', async () => ({ success: true, data: await this.dataAccess.applyNpcCareerAdvance(parsed) }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to apply NPC career advance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleApplyTemplate(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = ApplyTemplateInput.strict().parse(data ?? {});
      return await wrappedWrite('applyTemplate', async () => ({ success: true, data: await this.dataAccess.applyTemplate(parsed) }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to apply template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleApplyTemplateToToken(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = ApplyTemplateToTokenInput.strict().parse(data ?? {});
      return await wrappedWrite('applyTemplateToToken', async () => ({ success: true, data: await this.dataAccess.applyTemplateToToken(parsed) }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to apply template to token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleListActorItems(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = ListActorItemsInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.listActorItems(parsed) };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to list actor items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleUpdateActor(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = UpdateActorInput.strict().parse(data ?? {});
      return await wrappedWrite('updateActor', async () => ({ success: true, data: await this.dataAccess.updateActor(parsed) }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to update actor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleUpdateItem(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = UpdateItemInput.strict().parse(data ?? {});
      return await wrappedWrite('updateItem', async () => ({ success: true, data: await this.dataAccess.updateItem(parsed) }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to update item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleCreateItem(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = CreateItemInput.strict().parse(data ?? {});
      return await wrappedWrite('createItem', async () => ({ success: true, data: await this.dataAccess.createItem(parsed) }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to create item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleDeleteItem(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = DeleteItemInput.strict().parse(data ?? {});
      return await wrappedWrite('deleteItem', async () => ({ success: true, data: await this.dataAccess.deleteItem(parsed) }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleDeleteActor(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = DeleteActorInput.strict().parse(data ?? {});
      return await wrappedWrite('deleteActor', async () => ({ success: true, data: await this.dataAccess.deleteActor(parsed) }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to delete actor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 3 mcp_crud_expansion — handleDeleteJournalEntry retired. The
  // `journal { action: "delete-entry" }` umbrella variant supersedes it
  // (free-function deleteEntry in handlers/journal.ts).

  private async handleModifyItemQualities(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = ModifyItemQualitiesInput.strict().parse(data ?? {});
      return await wrappedWrite('modifyItemQualities', async () => {
        // Phase 5: route on destination discriminator OR fall back to legacy characterName.
        let item: any = null;
        let ownerLabel = '';

        if (parsed.destination?.type === 'world') {
          // World-scope item lookup
          const items = (game.items as any) ?? [];
          if (parsed.itemId) {
            item = items.get?.(parsed.itemId) ?? null;
          }
          if (!item && parsed.itemName) {
            item = items.find?.(
              (i: any) => i.name?.toLowerCase() === parsed.itemName!.toLowerCase()
            ) ?? null;
          }
          if (!item) {
            throw new Error(
              `World item "${parsed.itemName ?? parsed.itemId}" not found in Items sidebar`
            );
          }
          ownerLabel = '(world)';
        } else {
          // Actor-scope lookup — destination.actor OR legacy characterName
          let actor: any = null;
          if (parsed.destination?.type === 'actor') {
            const dest = parsed.destination;
            if (dest.actorId) {
              actor = (game.actors as any)?.get(dest.actorId);
            } else if (dest.actorName) {
              actor = (game.actors as any)?.find(
                (a: any) => a.name?.toLowerCase() === dest.actorName!.toLowerCase()
              );
            }
          } else if (parsed.characterName) {
            actor = (game.actors as any)?.find(
              (a: any) => a.name?.toLowerCase() === parsed.characterName!.toLowerCase()
            );
          }
          if (!actor) {
            throw new Error(
              `Actor not found: ${
                parsed.characterName ??
                (parsed.destination?.type === 'actor'
                  ? parsed.destination.actorId ?? parsed.destination.actorName
                  : '(no identifier)')
              }`
            );
          }

          if (parsed.itemId) {
            item = actor.items?.get(parsed.itemId);
          } else if (parsed.itemName) {
            item = actor.items?.find(
              (i: any) => i.name?.toLowerCase() === parsed.itemName!.toLowerCase()
            );
          }
          if (!item) {
            throw new Error(
              `Item "${parsed.itemName ?? parsed.itemId}" not found on ${actor.name}`
            );
          }
          ownerLabel = actor.name;
        }

        // BUG-012: Foundry deep-merges update objects; removing a key requires
        // the `-=` deletion syntax. In-memory `delete` on a copied object is a
        // silent no-op after the merge. Adds use dotted paths; removes use -=.
        const updateData: Record<string, unknown> = {};

        for (const quality of parsed.addQualities) {
          updateData[`system.properties.qualities.${quality.name}`] = quality.value || true;
        }
        for (const quality of parsed.removeQualities) {
          updateData[`system.properties.qualities.-=${quality}`] = null;
        }
        for (const flaw of parsed.addFlaws) {
          updateData[`system.properties.flaws.${flaw.name}`] = flaw.value || true;
        }
        for (const flaw of parsed.removeFlaws) {
          updateData[`system.properties.flaws.-=${flaw}`] = null;
        }

        await item.update(updateData);
        return { success: true, data: { itemName: item.name, owner: ownerLabel } };
      });
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to modify item qualities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 5 — atomic item trade between actors
  // tradeItem: GM-gated via validateGMAccess(); transaction-wrapped via wrappedWrite.
  private async handleTradeItem(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = TradeItemInput.strict().parse(data ?? {});
      return await wrappedWrite('tradeItem', async () => ({
        success: true,
        data: await this.dataAccess.tradeItem(parsed),
      }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(
        `Failed to trade item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Phase 2 mcp_crud_expansion — RollTable thin shims. All logic now lives in
  // handlers/rolltable.ts (strict-parse + GM gate + wrappedWrite + BUG-070 pre/post-verify).
  // Shims just strict-validate Foundry state and delegate.
  private async handleCreateRollTable(data: unknown): Promise<any> {
    try {
      return await createRollTableHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to create RollTable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleAddTableResults(data: unknown): Promise<any> {
    try {
      return await addTableResultsHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to add table results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleListRollTables(data: unknown): Promise<any> {
    try {
      return await listRollTablesHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to list RollTables: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleGetRollTable(data: unknown): Promise<any> {
    try {
      return await getRollTableHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to get RollTable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleRollOnTable(data: unknown): Promise<any> {
    try {
      return await rollOnTableHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to roll on table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleDeleteRollTable(data: unknown): Promise<any> {
    try {
      return await deleteRollTableHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to delete RollTable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleUpdateRollTable(data: unknown): Promise<any> {
    try {
      return await updateRollTableHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to update RollTable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleUpdateTableResults(data: unknown): Promise<any> {
    try {
      return await updateTableResultsHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to update table results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleDeleteTableResults(data: unknown): Promise<any> {
    try {
      return await deleteTableResultsHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to delete table results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleNormalizeRollTable(data: unknown): Promise<any> {
    try {
      return await normalizeRollTableHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to normalize RollTable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleResetRollTableResults(data: unknown): Promise<any> {
    try {
      return await resetRollTableResultsHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to reset RollTable results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleDrawManyFromTable(data: unknown): Promise<any> {
    try {
      return await drawManyFromTableHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to draw from table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleImportRollTableFromCompendium(data: unknown): Promise<any> {
    try {
      return await importRollTableFromCompendiumHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to import RollTable from compendium: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================
  // Phase 4b handlers — combat / damage / conditions / effects
  // ============================================================

  private async handleGetCombat(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = GetCombatInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.getCombat(parsed as any) };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to get combat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleListCombatants(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = ListCombatantsInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.listCombatants(parsed as any) };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to list combatants: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleAdvanceCombat(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = AdvanceCombatInput.strict().parse(data ?? {});
      return await wrappedWrite('advanceCombat', async () => ({
        success: true,
        data: await this.dataAccess.advanceCombat(parsed as any),
      }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to advance combat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleAddCombatants(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = AddCombatantsInput.strict().parse(data ?? {});
      return await wrappedWrite('addCombatants', async () => ({
        success: true,
        data: await this.dataAccess.addCombatants(parsed as any),
      }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to add combatants: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleRemoveCombatants(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = RemoveCombatantsInput.strict().parse(data ?? {});
      return await wrappedWrite('removeCombatants', async () => ({
        success: true,
        data: await this.dataAccess.removeCombatants(parsed as any),
      }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to remove combatants: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleEndCombat(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = EndCombatInput.strict().parse(data ?? {});
      return await wrappedWrite('endCombat', async () => ({
        success: true,
        data: await this.dataAccess.endCombat(parsed as any),
      }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to end combat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleApplyDamage(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = ApplyDamageInput.strict().parse(data ?? {});
      return await wrappedWrite('applyDamage', async () => ({
        success: true,
        data: await this.dataAccess.applyDamage(parsed as any),
      }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to apply damage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleApplyCondition(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = ApplyConditionInput.strict().parse(data ?? {});
      return await wrappedWrite('applyCondition', async () => ({
        success: true,
        data: await this.dataAccess.applyCondition(parsed as any),
      }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to apply condition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleRemoveCondition(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = RemoveConditionInput.strict().parse(data ?? {});
      return await wrappedWrite('removeCondition', async () => ({
        success: true,
        data: await this.dataAccess.removeCondition(parsed as any),
      }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to remove condition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleListConditions(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = ListConditionsInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.listConditions(parsed as any) };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to list conditions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleListActiveEffects(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = ListActiveEffectsInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.listActiveEffects(parsed as any) };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to list active effects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleGetWfrp4eConfig(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = GetWfrp4eConfigInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.getWfrp4eConfig(parsed) };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to read wfrp4e config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================
  // Phase 5 follow-up B — active-effect CRUD
  // ============================================================

  private async handleAddActiveEffect(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = AddActiveEffectInput.strict().parse(data ?? {});
      return await wrappedWrite('addActiveEffect', async () => ({
        success: true,
        data: await this.dataAccess.addActiveEffect(parsed as any),
      }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to add active effect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleUpdateActiveEffect(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = UpdateActiveEffectInput.strict().parse(data ?? {});
      if (!parsed.effectId && !parsed.effectName) {
        throw new Error('updateActiveEffect requires one of effectId or effectName');
      }
      return await wrappedWrite('updateActiveEffect', async () => ({
        success: true,
        data: await this.dataAccess.updateActiveEffect(parsed as any),
      }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to update active effect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleDeleteActiveEffect(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = DeleteActiveEffectInput.strict().parse(data ?? {});
      if (!parsed.effectId && !parsed.effectName) {
        throw new Error('deleteActiveEffect requires one of effectId or effectName');
      }
      return await wrappedWrite('deleteActiveEffect', async () => ({
        success: true,
        data: await this.dataAccess.deleteActiveEffect(parsed as any),
      }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to delete active effect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // TOOL-IDEA-003 (2026-05-14): read-only AE-by-name resolver. Not wrapped in
  // wrappedWrite — pure read.
  private async handleGetActiveEffectByName(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = GetActiveEffectByNameInput.strict().parse(data ?? {});
      if (!parsed.effectId && !parsed.effectName) {
        throw new Error('getActiveEffectByName requires one of effectId or effectName');
      }
      return {
        success: true,
        data: await this.dataAccess.getActiveEffectByName(parsed as any),
      };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to get active effect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
