import { z } from 'zod';
import { MODULE_ID } from './constants.js';
import { FoundryDataAccess } from './data-access.js';
import { wrappedWrite } from './transaction-manager.js';
import { permissionManager } from './permissions.js';
import { handleGetPartyCharacters, handleFindPlayers, handleFindActor } from './_staging/orphan-handlers.js';
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
  GetFriendlyNPCsInput,
  GetConnectedPlayersInput,
  // item domain
  CreateItemInput,
  UpdateItemInput,
  DeleteItemInput,
  ModifyItemQualitiesInput,
  AddItemFromCompendiumInput,
  // compendium domain
  SearchCompendiumInput,
  ListCreaturesByCriteriaInput,
  GetAvailablePacksInput,
  GetCompendiumDocumentFullInput,
  GetEnhancedCreatureIndexInput,
  // scene domain
  GetActiveSceneInput,
  ListScenesInput,
  SwitchSceneInput,
  AddActorsToSceneInput,
  // meta (journal, rolltable, ping, world, player rolls)
  PingInput,
  GetWorldInfoInput,
  CreateJournalEntryInput,
  ListJournalsInput,
  GetJournalContentInput,
  UpdateJournalContentInput,
  RequestPlayerRollsInput,
  CreateRollTableInput,
  AddTableResultsInput,
  ListRollTablesInput,
  GetRollTableInput,
  RollOnTableInput,
  DeleteRollTableInput,
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
    CONFIG.queries[`${modulePrefix}.getActiveScene`] = this.handleGetActiveScene.bind(this);
    CONFIG.queries[`${modulePrefix}.list-scenes`] = this.handleListScenes.bind(this);
    CONFIG.queries[`${modulePrefix}.switch-scene`] = this.handleSwitchScene.bind(this);
    CONFIG.queries[`${modulePrefix}.getWorldInfo`] = this.handleGetWorldInfo.bind(this);
    CONFIG.queries[`${modulePrefix}.ping`] = this.handlePing.bind(this);
    CONFIG.queries[`${modulePrefix}.createActorFromCompendium`] = this.handleCreateActorFromCompendium.bind(this);
    CONFIG.queries[`${modulePrefix}.getCompendiumDocumentFull`] = this.handleGetCompendiumDocumentFull.bind(this);
    CONFIG.queries[`${modulePrefix}.addActorsToScene`] = this.handleAddActorsToScene.bind(this);
    CONFIG.queries[`${modulePrefix}.validateWritePermissions`] = this.handleValidateWritePermissions.bind(this);
    CONFIG.queries[`${modulePrefix}.createJournalEntry`] = this.handleCreateJournalEntry.bind(this);
    CONFIG.queries[`${modulePrefix}.listJournals`] = this.handleListJournals.bind(this);
    CONFIG.queries[`${modulePrefix}.getJournalContent`] = this.handleGetJournalContent.bind(this);
    CONFIG.queries[`${modulePrefix}.updateJournalContent`] = this.handleUpdateJournalContent.bind(this);
    CONFIG.queries[`${modulePrefix}.request-player-rolls`] = this.handleRequestPlayerRolls.bind(this);
    CONFIG.queries[`${modulePrefix}.getEnhancedCreatureIndex`] = this.handleGetEnhancedCreatureIndex.bind(this);
    CONFIG.queries[`${modulePrefix}.setActorOwnership`] = this.handleSetActorOwnership.bind(this);
    CONFIG.queries[`${modulePrefix}.getActorOwnership`] = this.handleGetActorOwnership.bind(this);
    CONFIG.queries[`${modulePrefix}.getFriendlyNPCs`] = this.handleGetFriendlyNPCs.bind(this);
    CONFIG.queries[`${modulePrefix}.getPartyCharacters`] = () => handleGetPartyCharacters(this.dataAccess);
    CONFIG.queries[`${modulePrefix}.getConnectedPlayers`] = this.handleGetConnectedPlayers.bind(this);
    CONFIG.queries[`${modulePrefix}.findPlayers`] = (args: any) => handleFindPlayers(args, this.dataAccess);
    CONFIG.queries[`${modulePrefix}.findActor`] = (args: any) => handleFindActor(args, this.dataAccess);
    CONFIG.queries[`${modulePrefix}.createActor`] = this.handleCreateActor.bind(this);
    CONFIG.queries[`${modulePrefix}.updateActor`] = this.handleUpdateActor.bind(this);
    CONFIG.queries[`${modulePrefix}.updateItem`] = this.handleUpdateItem.bind(this);
    CONFIG.queries[`${modulePrefix}.createItem`] = this.handleCreateItem.bind(this);
    CONFIG.queries[`${modulePrefix}.deleteItem`] = this.handleDeleteItem.bind(this);
    CONFIG.queries[`${modulePrefix}.modifyItemQualities`] = this.handleModifyItemQualities.bind(this);
    CONFIG.queries[`${modulePrefix}.createRollTable`] = this.handleCreateRollTable.bind(this);
    CONFIG.queries[`${modulePrefix}.addTableResults`] = this.handleAddTableResults.bind(this);
    CONFIG.queries[`${modulePrefix}.listRollTables`] = this.handleListRollTables.bind(this);
    CONFIG.queries[`${modulePrefix}.getRollTable`] = this.handleGetRollTable.bind(this);
    CONFIG.queries[`${modulePrefix}.rollOnTable`] = this.handleRollOnTable.bind(this);
    CONFIG.queries[`${modulePrefix}.deleteRollTable`] = this.handleDeleteRollTable.bind(this);
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
      return await wrappedWrite('addItemFromCompendium', async () => {
        const actor = game.actors?.get(parsed.actorId);
        if (!actor) throw new Error(`Actor with ID "${parsed.actorId}" not found`);

        const itemDoc = await fromUuid(parsed.compendiumId);
        if (!itemDoc) throw new Error(`Item with UUID "${parsed.compendiumId}" not found in compendium`);

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

  private async handleGetActiveScene(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      GetActiveSceneInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.getActiveScene() };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to get active scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  private async handleAddActorsToScene(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = AddActorsToSceneInput.strict().parse(data ?? {});
      return await wrappedWrite('addActorsToScene', async () => {
        const result = await this.dataAccess.addActorsToScene({
          actorIds: parsed.actorIds,
          placement: parsed.placement || 'random',
          hidden: parsed.hidden || false,
        });
        return { success: true, data: result };
      });
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to add actors to scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

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

  async handleCreateJournalEntry(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = CreateJournalEntryInput.strict().parse(data ?? {});
      return await wrappedWrite('createJournalEntry', async () => {
        const result = await this.dataAccess.createJournalEntry({
          name: parsed.name,
          content: parsed.content,
        });
        return { success: true, data: result };
      });
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to create journal entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleListJournals(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      ListJournalsInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.listJournals() };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to list journals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleGetJournalContent(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = GetJournalContentInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.getJournalContent(parsed.journalId) };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to get journal content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleUpdateJournalContent(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = UpdateJournalContentInput.strict().parse(data ?? {});
      return await wrappedWrite('updateJournalContent', async () => {
        const result = await this.dataAccess.updateJournalContent({
          journalId: parsed.journalId,
          content: parsed.content,
        });
        return { success: true, data: result };
      });
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to update journal content: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  async handleSetActorOwnership(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = SetActorOwnershipInput.strict().parse(data ?? {});
      return await wrappedWrite('setActorOwnership', async () => ({ success: true, data: await this.dataAccess.setActorOwnership(parsed as any) }));
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
      const parsed = GetActorOwnershipInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.getActorOwnership(parsed as any) };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to get actor ownership: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  private async handleListScenes(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = ListScenesInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.listScenes(parsed as any) };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to list scenes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleSwitchScene(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = SwitchSceneInput.strict().parse(data ?? {});
      return await wrappedWrite('switchScene', async () => ({ success: true, data: await this.dataAccess.switchScene(parsed) }));
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to switch scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

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

  private async handleModifyItemQualities(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = ModifyItemQualitiesInput.strict().parse(data ?? {});
      return await wrappedWrite('modifyItemQualities', async () => {
        const actor = game.actors?.find((a: any) =>
          a.name.toLowerCase() === parsed.characterName.toLowerCase()
        );
        if (!actor) throw new Error(`Character "${parsed.characterName}" not found`);

        const item = actor.items?.find((i: any) =>
          i.name.toLowerCase() === parsed.itemName.toLowerCase()
        );
        if (!item) throw new Error(`Item "${parsed.itemName}" not found on ${actor.name}`);

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
        return { success: true, data: { itemName: item.name } };
      });
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to modify item qualities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleCreateRollTable(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = CreateRollTableInput.strict().parse(data ?? {});
      return await wrappedWrite('createRollTable', async () => {
        const tableData: any = parsed.tableData;
        const results = tableData.results || [];
        const tableDataWithoutResults = { ...tableData };
        delete tableDataWithoutResults.results;

        if (!tableDataWithoutResults.name) {
          throw new Error('Table name is required');
        }

        const table = await RollTable.create(tableDataWithoutResults);
        if (results.length > 0) {
          await table.createEmbeddedDocuments('TableResult', results);
        }

        return { success: true, data: { id: table.id, name: table.name } };
      });
    } catch (error) {
      rethrowAsInvalidInput(error);
      console.error('Failed to create RollTable:', error);
      throw new Error(`Failed to create RollTable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleAddTableResults(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = AddTableResultsInput.strict().parse(data ?? {});
      return await wrappedWrite('addTableResults', async () => {
        const table = game.tables.get(parsed.tableId);
        if (!table) throw new Error('Table not found');
        await table.createEmbeddedDocuments('TableResult', parsed.results);
        return { success: true, data: { tableId: parsed.tableId } };
      });
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to add table results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleListRollTables(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      ListRollTablesInput.strict().parse(data ?? {});
      const tables = game.tables.map((table: any) => ({
        id: table.id,
        name: table.name,
        formula: table.formula,
        description: table.description || '',
        results: table.results.map((r: any) => ({
          id: r.id,
          text: r.text,
          range: r.range,
          weight: r.weight,
        })),
      }));
      return { success: true, data: tables };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to list RollTables: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleGetRollTable(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = GetRollTableInput.strict().parse(data ?? {});
      const table = game.tables.get(parsed.tableId);
      if (!table) throw new Error('Table not found');

      const payload = {
        id: table.id,
        name: table.name,
        formula: table.formula,
        description: table.description || '',
        replacement: table.replacement,
        displayRoll: table.displayRoll,
        results: (table.results as any).map((r: any) => ({
          id: r.id,
          text: r.text,
          range: r.range,
          weight: r.weight,
        })),
      };
      return { success: true, data: payload };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to get RollTable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleRollOnTable(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = RollOnTableInput.strict().parse(data ?? {});
      const table = game.tables.get(parsed.tableId);
      if (!table) throw new Error('Table not found');

      const rollMode = parsed.rollMode || 'public';
      const draw = await table.draw({ rollMode: rollMode as any });
      if (!draw || !draw.results || draw.results.length === 0) {
        throw new Error('No result drawn from table');
      }

      const drawResult = draw.results[0];
      const payload = {
        tableName: table.name,
        formula: table.formula,
        roll: draw.roll?.total || 0,
        text: drawResult.text,
        drawn: drawResult.drawn,
      };
      return { success: true, data: payload };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to roll on table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleDeleteRollTable(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = DeleteRollTableInput.strict().parse(data ?? {});
      return await wrappedWrite('deleteRollTable', async () => {
        const table = game.tables.get(parsed.tableId);
        if (!table) throw new Error('Table not found');
        await table.delete();
        return { success: true, data: { tableId: parsed.tableId } };
      });
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to delete RollTable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
