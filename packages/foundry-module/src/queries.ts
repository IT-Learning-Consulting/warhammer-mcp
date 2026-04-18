import { MODULE_ID } from './constants.js';
import { FoundryDataAccess } from './data-access.js';
import { handleGetPartyCharacters, handleFindPlayers, handleFindActor } from './_staging/orphan-handlers.js';

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
      // Silent failure - no error message for non-GM users
      return { allowed: false };
    }
    return { allowed: true };
  }

  /**
   * Register all query handlers in CONFIG.queries
   */
  registerHandlers(): void {
    const modulePrefix = MODULE_ID;

    // Character/Actor queries
    CONFIG.queries[`${modulePrefix}.getCharacterInfo`] = this.handleGetCharacterInfo.bind(this);
    CONFIG.queries[`${modulePrefix}.listActors`] = this.handleListActors.bind(this);

    // Compendium queries
    CONFIG.queries[`${modulePrefix}.searchCompendium`] = this.handleSearchCompendium.bind(this);
    CONFIG.queries[`${modulePrefix}.addItemFromCompendium`] = this.handleAddItemFromCompendium.bind(this);
    CONFIG.queries[`${modulePrefix}.listCreaturesByCriteria`] = this.handleListCreaturesByCriteria.bind(this);
    CONFIG.queries[`${modulePrefix}.getAvailablePacks`] = this.handleGetAvailablePacks.bind(this);

    // Scene queries
    CONFIG.queries[`${modulePrefix}.getActiveScene`] = this.handleGetActiveScene.bind(this);
    CONFIG.queries[`${modulePrefix}.list-scenes`] = this.handleListScenes.bind(this);
    CONFIG.queries[`${modulePrefix}.switch-scene`] = this.handleSwitchScene.bind(this);

    // World queries
    CONFIG.queries[`${modulePrefix}.getWorldInfo`] = this.handleGetWorldInfo.bind(this);

    // Utility queries
    CONFIG.queries[`${modulePrefix}.ping`] = this.handlePing.bind(this);

    // Phase 2 & 3: Write operation queries
    CONFIG.queries[`${modulePrefix}.createActorFromCompendium`] = this.handleCreateActorFromCompendium.bind(this);
    CONFIG.queries[`${modulePrefix}.getCompendiumDocumentFull`] = this.handleGetCompendiumDocumentFull.bind(this);
    CONFIG.queries[`${modulePrefix}.addActorsToScene`] = this.handleAddActorsToScene.bind(this);
    CONFIG.queries[`${modulePrefix}.validateWritePermissions`] = this.handleValidateWritePermissions.bind(this);
    CONFIG.queries[`${modulePrefix}.createJournalEntry`] = this.handleCreateJournalEntry.bind(this);
    CONFIG.queries[`${modulePrefix}.listJournals`] = this.handleListJournals.bind(this);
    CONFIG.queries[`${modulePrefix}.getJournalContent`] = this.handleGetJournalContent.bind(this);
    CONFIG.queries[`${modulePrefix}.updateJournalContent`] = this.handleUpdateJournalContent.bind(this);

    // Phase 4: Dice roll queries
    CONFIG.queries[`${modulePrefix}.request-player-rolls`] = this.handleRequestPlayerRolls.bind(this);

    // Enhanced creature index for campaign analysis
    CONFIG.queries[`${modulePrefix}.getEnhancedCreatureIndex`] = this.handleGetEnhancedCreatureIndex.bind(this);

    // Phase 6: Actor ownership management
    CONFIG.queries[`${modulePrefix}.setActorOwnership`] = this.handleSetActorOwnership.bind(this);
    CONFIG.queries[`${modulePrefix}.getActorOwnership`] = this.handleGetActorOwnership.bind(this);
    CONFIG.queries[`${modulePrefix}.getFriendlyNPCs`] = this.handleGetFriendlyNPCs.bind(this);
    CONFIG.queries[`${modulePrefix}.getPartyCharacters`] = () => handleGetPartyCharacters(this.dataAccess);
    CONFIG.queries[`${modulePrefix}.getConnectedPlayers`] = this.handleGetConnectedPlayers.bind(this);
    CONFIG.queries[`${modulePrefix}.findPlayers`] = (args: any) => handleFindPlayers(args, this.dataAccess);
    CONFIG.queries[`${modulePrefix}.findActor`] = (args: any) => handleFindActor(args, this.dataAccess);

    // CRUD operations for items and actors
    CONFIG.queries[`${modulePrefix}.createActor`] = this.handleCreateActor.bind(this);
    CONFIG.queries[`${modulePrefix}.updateActor`] = this.handleUpdateActor.bind(this);
    CONFIG.queries[`${modulePrefix}.updateItem`] = this.handleUpdateItem.bind(this);
    CONFIG.queries[`${modulePrefix}.createItem`] = this.handleCreateItem.bind(this);
    CONFIG.queries[`${modulePrefix}.deleteItem`] = this.handleDeleteItem.bind(this);
    CONFIG.queries[`${modulePrefix}.modifyItemQualities`] = this.handleModifyItemQualities.bind(this);

    // RollTable operations
    CONFIG.queries[`${modulePrefix}.createRollTable`] = this.handleCreateRollTable.bind(this);
    CONFIG.queries[`${modulePrefix}.addTableResults`] = this.handleAddTableResults.bind(this);
    CONFIG.queries[`${modulePrefix}.listRollTables`] = this.handleListRollTables.bind(this);
    CONFIG.queries[`${modulePrefix}.getRollTable`] = this.handleGetRollTable.bind(this);
    CONFIG.queries[`${modulePrefix}.rollOnTable`] = this.handleRollOnTable.bind(this);
    CONFIG.queries[`${modulePrefix}.deleteRollTable`] = this.handleDeleteRollTable.bind(this);

  }

  /**
   * Unregister all query handlers
   */
  unregisterHandlers(): void {
    const modulePrefix = MODULE_ID;
    const keysToRemove = Object.keys(CONFIG.queries).filter(key => key.startsWith(modulePrefix));

    for (const key of keysToRemove) {
      delete CONFIG.queries[key];
    }

  }

  /**
   * Handle query requests from other parts of the module
   */
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
        success: false
      };
    }
  }

  /**
   * Handle character information request
   */
  private async handleGetCharacterInfo(data: { characterName?: string; characterId?: string }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      const identifier = data.characterName || data.characterId;
      if (!identifier) {
        throw new Error('characterName or characterId is required');
      }

      return await this.dataAccess.getCharacterInfo(identifier);
    } catch (error) {
      throw new Error(`Failed to get character info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle list actors request
   */
  private async handleListActors(data: { type?: string }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      return await this.dataAccess.listActors(data.type);
    } catch (error) {
      throw new Error(`Failed to list actors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle compendium search request
   */
  private async handleSearchCompendium(data: {
    query: string;
    packType?: string;
    filters?: {
      challengeRating?: number | { min?: number; max?: number };
      creatureType?: string;
      size?: string;
      spellcaster?: boolean;
    }
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      // Add better parameter validation
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data parameter structure');
      }

      if (!data.query || typeof data.query !== 'string') {
        throw new Error('query parameter is required and must be a string');
      }


      return await this.dataAccess.searchCompendium(data.query, data.packType, data.filters);
    } catch (error) {
      throw new Error(`Failed to search compendium: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle add item from compendium request
   * Adds an item (skill, talent, mutation, spell, etc.) from a compendium to an actor
   */
  private async handleAddItemFromCompendium(data: {
    actorId: string;
    compendiumId: string; // UUID like "Compendium.wfrp4e-core.items.Item.abc123" or "Compendium.wfrp4e-core.mutations.xyz789"
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      // Validate parameters
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data parameter structure');
      }

      if (!data.actorId || typeof data.actorId !== 'string') {
        throw new Error('actorId parameter is required and must be a string');
      }

      if (!data.compendiumId || typeof data.compendiumId !== 'string') {
        throw new Error('compendiumId parameter is required and must be a string (UUID format)');
      }

      // Get the actor
      const actor = game.actors?.get(data.actorId);
      if (!actor) {
        throw new Error(`Actor with ID "${data.actorId}" not found`);
      }

      // Get the item from compendium using UUID
      const itemDoc = await fromUuid(data.compendiumId);
      if (!itemDoc) {
        throw new Error(`Item with UUID "${data.compendiumId}" not found in compendium`);
      }

      // Convert to plain object for creation
      const itemData = itemDoc.toObject();

      // Create the item on the actor
      const createdItems = await actor.createEmbeddedDocuments('Item', [itemData]);

      if (!createdItems || createdItems.length === 0) {
        throw new Error('Failed to create item on actor');
      }

      const createdItem = createdItems[0];

      // Show notification to GM
      ui.notifications?.info(`MCP: Added ${createdItem.name} to ${actor.name} (from compendium)`);

      return {
        success: true,
        itemId: createdItem.id,
        itemName: createdItem.name,
        itemType: (createdItem as any).type,
        actorId: actor.id,
        actorName: actor.name,
        message: `Successfully added "${createdItem.name}" to ${actor.name} from compendium`
      };
    } catch (error) {
      throw new Error(`Failed to add item from compendium: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle list creatures by criteria request
   */
  private async handleListCreaturesByCriteria(data: {
    challengeRating?: number | { min?: number; max?: number };
    creatureType?: string;
    size?: string;
    hasSpells?: boolean;
    hasSpecialAbilities?: boolean;
    limit?: number;
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();


      const result = await this.dataAccess.listCreaturesByCriteria(data);

      // Handle the new format with search summary
      return {
        response: result
      };
    } catch (error) {
      throw new Error(`Failed to list creatures by criteria: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get available packs request
   */
  private async handleGetAvailablePacks(): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();
      return await this.dataAccess.getAvailablePacks();
    } catch (error) {
      throw new Error(`Failed to get available packs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get active scene request
   */
  private async handleGetActiveScene(): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();
      return await this.dataAccess.getActiveScene();
    } catch (error) {
      throw new Error(`Failed to get active scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get world info request
   */
  private async handleGetWorldInfo(): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();
      return await this.dataAccess.getWorldInfo();
    } catch (error) {
      throw new Error(`Failed to get world info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle ping request
   */
  private async handlePing(): Promise<any> {
    return {
      status: 'ok',
      timestamp: Date.now(),
      module: MODULE_ID,
      foundryVersion: game.version,
      worldId: game.world?.id,
      userId: game.user?.id,
    };
  }

  /**
   * Get list of all registered query methods
   */
  getRegisteredMethods(): string[] {
    const modulePrefix = MODULE_ID;
    return Object.keys(CONFIG.queries)
      .filter(key => key.startsWith(modulePrefix))
      .map(key => key.replace(`${modulePrefix}.`, ''));
  }

  /**
   * Test if a specific query handler is registered
   */
  isMethodRegistered(method: string): boolean {
    const queryKey = `${MODULE_ID}.${method}`;
    return queryKey in CONFIG.queries && typeof CONFIG.queries[queryKey] === 'function';
  }

  // ===== PHASE 2: WRITE OPERATION HANDLERS =====

  /**
   * Handle actor creation from specific compendium entry
   */
  private async handleCreateActorFromCompendium(data: {
    packId: string;
    itemId: string;
    customNames?: string[] | undefined;
    quantity?: number | undefined;
    addToScene?: boolean | undefined;
    placement?: {
      type: 'random' | 'grid' | 'center' | 'coordinates';
      coordinates?: { x: number; y: number }[];
    } | undefined;
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      // Clean interface - direct pack/item reference only
      const requestData: any = {
        packId: data.packId,
        itemId: data.itemId,
        customNames: data.customNames || [],
        quantity: data.quantity || 1,
        addToScene: data.addToScene || false,
      };

      if (data.placement) {
        requestData.placement = data.placement;
      }

      return await this.dataAccess.createActorFromCompendiumEntry(requestData);
    } catch (error) {
      throw new Error(`Failed to create actor from compendium: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get compendium document full request
   */
  private async handleGetCompendiumDocumentFull(data: {
    packId: string;
    documentId: string;
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.packId) {
        throw new Error('packId is required');
      }

      if (!data.documentId) {
        throw new Error('documentId is required');
      }

      return await this.dataAccess.getCompendiumDocumentFull(data.packId, data.documentId);
    } catch (error) {
      throw new Error(`Failed to get compendium document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle add actors to scene request
   */
  private async handleAddActorsToScene(data: {
    actorIds: string[];
    placement?: 'random' | 'grid' | 'center';
    hidden?: boolean;
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.actorIds || !Array.isArray(data.actorIds) || data.actorIds.length === 0) {
        throw new Error('actorIds array is required and must not be empty');
      }

      return await this.dataAccess.addActorsToScene({
        actorIds: data.actorIds,
        placement: data.placement || 'random',
        hidden: data.hidden || false,
      });
    } catch (error) {
      throw new Error(`Failed to add actors to scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle validate write permissions request
   */
  private async handleValidateWritePermissions(data: {
    operation: 'createActor' | 'modifyScene';
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.operation) {
        throw new Error('operation is required');
      }

      return await this.dataAccess.validateWritePermissions(data.operation);
    } catch (error) {
      throw new Error(`Failed to validate write permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle journal entry creation
   */
  async handleCreateJournalEntry(data: any): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      if (!data.name) {
        throw new Error('name is required');
      }
      if (!data.content) {
        throw new Error('content is required');
      }

      return await this.dataAccess.createJournalEntry({
        name: data.name,
        content: data.content,
      });
    } catch (error) {
      throw new Error(`Failed to create journal entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle list journals request
   */
  async handleListJournals(): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();
      return await this.dataAccess.listJournals();
    } catch (error) {
      throw new Error(`Failed to list journals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get journal content request
   */
  async handleGetJournalContent(data: { journalId: string }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.journalId) {
        throw new Error('journalId is required');
      }

      return await this.dataAccess.getJournalContent(data.journalId);
    } catch (error) {
      throw new Error(`Failed to get journal content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle update journal content request
   */
  async handleUpdateJournalContent(data: { journalId: string; content: string }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.journalId) {
        throw new Error('journalId is required');
      }
      if (!data.content) {
        throw new Error('content is required');
      }

      return await this.dataAccess.updateJournalContent({
        journalId: data.journalId,
        content: data.content,
      });
    } catch (error) {
      throw new Error(`Failed to update journal content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle request player rolls - creates interactive roll buttons in chat
   */
  async handleRequestPlayerRolls(data: {
    rollType: string;
    rollTarget: string;
    targetPlayer: string;
    isPublic: boolean;
    rollModifier: string;
    flavor: string;
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.rollType || !data.rollTarget || !data.targetPlayer) {
        throw new Error('rollType, rollTarget, and targetPlayer are required');
      }

      return await this.dataAccess.requestPlayerRolls(data);
    } catch (error) {
      throw new Error(`Failed to request player rolls: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get enhanced creature index request
   */
  async handleGetEnhancedCreatureIndex(): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      return await this.dataAccess.getEnhancedCreatureIndex();
    } catch (error) {
      throw new Error(`Failed to get enhanced creature index: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle set actor ownership request
   */
  async handleSetActorOwnership(data: any): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.actorId || !data.userId || data.permission === undefined) {
        throw new Error('actorId, userId, and permission are required');
      }

      return await this.dataAccess.setActorOwnership(data);
    } catch (error) {
      throw new Error(`Failed to set actor ownership: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get actor ownership request
   */
  async handleGetActorOwnership(data: any): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      return await this.dataAccess.getActorOwnership(data);
    } catch (error) {
      throw new Error(`Failed to get actor ownership: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get friendly NPCs request
   */
  async handleGetFriendlyNPCs(): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      return await this.dataAccess.getFriendlyNPCs();
    } catch (error) {
      throw new Error(`Failed to get friendly NPCs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get connected players request
   */
  async handleGetConnectedPlayers(): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      return await this.dataAccess.getConnectedPlayers();
    } catch (error) {
      throw new Error(`Failed to get connected players: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle list scenes request
   */
  private async handleListScenes(data: any): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();
      return await this.dataAccess.listScenes(data);
    } catch (error) {
      throw new Error(`Failed to list scenes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle switch scene request
   */
  private async handleSwitchScene(data: any): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.scene_identifier) {
        throw new Error('scene_identifier is required');
      }

      return await this.dataAccess.switchScene(data);
    } catch (error) {
      throw new Error(`Failed to switch scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle create actor request
   */
  private async handleCreateActor(data: { actorData: Record<string, any> }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      return await this.dataAccess.createActor(data);
    } catch (error) {
      throw new Error(`Failed to create actor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle update actor request
   */
  private async handleUpdateActor(data: { actorId: string; updateData: Record<string, any> }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      return await this.dataAccess.updateActor(data);
    } catch (error) {
      throw new Error(`Failed to update actor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle update item request
   */
  private async handleUpdateItem(data: { actorId: string; itemId: string; updateData: Record<string, any> }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      return await this.dataAccess.updateItem(data);
    } catch (error) {
      throw new Error(`Failed to update item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle create item request
   */
  private async handleCreateItem(data: { actorId: string; itemData: Record<string, any> }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      return await this.dataAccess.createItem(data);
    } catch (error) {
      throw new Error(`Failed to create item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle delete item request
   */
  private async handleDeleteItem(data: { actorId: string; itemId: string }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      return await this.dataAccess.deleteItem(data);
    } catch (error) {
      throw new Error(`Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle modify item qualities request
   */
  private async handleModifyItemQualities(data: {
    characterName: string;
    itemName: string;
    addQualities: Array<{ name: string; value?: number }>;
    removeQualities: string[];
    addFlaws: Array<{ name: string; value?: number }>;
    removeFlaws: string[];
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      // Find character
      const actor = game.actors?.find((a: any) =>
        a.name.toLowerCase() === data.characterName.toLowerCase()
      );

      if (!actor) {
        return { success: false, error: `Character "${data.characterName}" not found` };
      }

      // Find item
      const item = actor.items?.find((i: any) =>
        i.name.toLowerCase() === data.itemName.toLowerCase()
      );

      if (!item) {
        return { success: false, error: `Item "${data.itemName}" not found on ${actor.name}` };
      }

      // Build update data
      const currentQualities = item.system?.properties?.qualities || {};
      const currentFlaws = item.system?.properties?.flaws || {};

      const updateData: any = {
        'system.properties.qualities': { ...currentQualities },
        'system.properties.flaws': { ...currentFlaws }
      };

      // Add qualities
      for (const quality of data.addQualities) {
        updateData['system.properties.qualities'][quality.name] = quality.value || true;
      }

      // Remove qualities
      for (const quality of data.removeQualities) {
        delete updateData['system.properties.qualities'][quality];
      }

      // Add flaws
      for (const flaw of data.addFlaws) {
        updateData['system.properties.flaws'][flaw.name] = flaw.value || true;
      }

      // Remove flaws
      for (const flaw of data.removeFlaws) {
        delete updateData['system.properties.flaws'][flaw];
      }

      await item.update(updateData);

      return { success: true, data: { itemName: item.name } };
    } catch (error) {
      throw new Error(`Failed to modify item qualities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle create RollTable request
   */
  private async handleCreateRollTable(data: { tableData: any }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      console.log("createRollTable received data:", JSON.stringify(data, null, 2));

      // Extract results from tableData if present
      const results = data.tableData.results || [];
      const tableDataWithoutResults = { ...data.tableData };
      delete tableDataWithoutResults.results;

      console.log("Creating table with:", JSON.stringify(tableDataWithoutResults, null, 2));
      console.log("Number of results to add:", results.length);

      // Create the table first - ensure we have a name
      if (!tableDataWithoutResults.name) {
        return { error: 'Table name is required', success: false };
      }

      const table = await RollTable.create(tableDataWithoutResults);

      console.log("Table created with ID:", table.id);

      // If results were provided, add them to the table
      if (results.length > 0) {
        console.log("Adding results:", JSON.stringify(results.slice(0, 2), null, 2)); // Log first 2 results
        await table.createEmbeddedDocuments('TableResult', results);
      }

      return {
        id: table.id,
        name: table.name,
        success: true
      };
    } catch (error) {
      console.error("Failed to create RollTable:", error);
      throw new Error(`Failed to create RollTable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle add table results request
   */
  private async handleAddTableResults(data: { tableId: string; results: any[] }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      const table = game.tables.get(data.tableId);
      if (!table) {
        return { error: 'Table not found', success: false };
      }

      await table.createEmbeddedDocuments('TableResult', data.results);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to add table results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle list RollTables request
   */
  private async handleListRollTables(_data: {}): Promise<any> {
    try {
      const tables = game.tables.map((table: any) => ({
        id: table.id,
        name: table.name,
        formula: table.formula,
        description: table.description || '',
        results: table.results.map((r: any) => ({
          id: r.id,
          text: r.text,
          range: r.range,
          weight: r.weight
        }))
      }));

      return tables;
    } catch (error) {
      throw new Error(`Failed to list RollTables: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get RollTable request
   */
  private async handleGetRollTable(data: { tableId: string }): Promise<any> {
    try {
      const table = game.tables.get(data.tableId);
      if (!table) {
        return { error: 'Table not found' };
      }

      return {
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
          weight: r.weight
        }))
      };
    } catch (error) {
      throw new Error(`Failed to get RollTable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle roll on table request
   */
  private async handleRollOnTable(data: { tableId: string; rollMode?: string }): Promise<any> {
    try {
      const table = game.tables.get(data.tableId);
      if (!table) {
        return { error: 'Table not found' };
      }

      const rollMode = data.rollMode || 'public';
      const draw = await table.draw({ rollMode: rollMode as any });

      if (!draw || !draw.results || draw.results.length === 0) {
        return { error: 'No result drawn from table' };
      }

      const result = draw.results[0];
      return {
        tableName: table.name,
        formula: table.formula,
        roll: draw.roll?.total || 0,
        text: result.text,
        drawn: result.drawn
      };
    } catch (error) {
      throw new Error(`Failed to roll on table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle delete RollTable request
   */
  private async handleDeleteRollTable(data: { tableId: string }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      const table = game.tables.get(data.tableId);
      if (!table) {
        return { error: 'Table not found', success: false };
      }

      await table.delete();
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete RollTable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

}