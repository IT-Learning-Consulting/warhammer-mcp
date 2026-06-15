import { MODULE_ID, ERROR_MESSAGES, TOKEN_DISPOSITIONS } from './constants.js';
import { notify } from './notify.js';
import { verifyDocWrite } from './utils/verifyWrite.js';
import { PersistentCreatureIndex, CompendiumSearchService } from './services/index.js';
import type { CompendiumSearchResult, EnhancedCreatureIndex, CreatureIndexReader } from './service-interfaces.js';
// Local type definitions to avoid shared package import issues
interface CharacterInfo {
  id: string;
  name: string;
  type: string;
  img?: string;
  system: Record<string, unknown>;
  items: CharacterItem[];
  effects: CharacterEffect[];
}

interface CharacterItem {
  id: string;
  name: string;
  type: string;
  img?: string;
  system: Record<string, unknown>;
}

interface CharacterEffect {
  id: string;
  name: string;
  icon?: string;
  disabled: boolean;
  duration?: {
    type: string;
    duration?: number;
    remaining?: number;
  };
}

// Phase 3 (R3.1/R3.2): CompendiumSearchResult + the 4 creature-index interfaces moved to
// ./service-interfaces.ts (shared by the extracted services/ files; imported below).

interface SceneInfo {
  id: string;
  name: string;
  img?: string;
  background?: string;
  width: number;
  height: number;
  padding: number;
  active: boolean;
  navigation: boolean;
  tokens: SceneToken[];
  walls: number;
  lights: number;
  sounds: number;
  notes: SceneNote[];
}

interface SceneToken {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  actorId?: string;
  img: string;
  hidden: boolean;
  disposition: number;
}

interface SceneNote {
  id: string;
  text: string;
  x: number;
  y: number;
}

interface WorldInfo {
  id: string;
  title: string;
  system: string;
  systemVersion: string;
  foundryVersion: string;
  users: WorldUser[];
}

interface WorldUser {
  id: string;
  name: string;
  active: boolean;
  isGM: boolean;
}

// Phase 2: Write Operation Interfaces
interface ActorCreationRequest {
  creatureType: string;
  customNames?: string[] | undefined;
  packPreference?: string | undefined;
  quantity?: number | undefined;
  addToScene?: boolean | undefined;
}

interface ActorCreationResult {
  success: boolean;
  actors: CreatedActorInfo[];
  errors?: string[] | undefined;
  tokensPlaced?: number;
  totalRequested: number;
  totalCreated: number;
}

interface CreatedActorInfo {
  id: string;
  name: string;
  originalName: string;
  type: string;
  sourcePackId: string;
  sourcePackLabel: string;
  img?: string;
}

interface CompendiumEntryFull {
  id: string;
  name: string;
  type: string;
  img?: string;
  pack: string;
  packLabel: string;
  system: Record<string, unknown>;
  items?: CompendiumItem[];
  effects?: CompendiumEffect[];
  fullData: Record<string, unknown>;
}

interface CompendiumItem {
  id: string;
  name: string;
  type: string;
  img?: string;
  system: Record<string, unknown>;
}

interface CompendiumEffect {
  id: string;
  name: string;
  icon?: string;
  disabled: boolean;
  duration?: Record<string, unknown>;
}

interface SceneTokenPlacement {
  actorIds: string[];
  quantities?: number[];
  placement: 'random' | 'grid' | 'center' | 'coordinates';
  hidden: boolean;
  coordinates?: { x: number; y: number }[];
  // TOOL-IDEA-004 (2026-05-14): optional sceneId targets a non-active scene.
  sceneId?: string;
}

interface TokenPlacementResult {
  success: boolean;
  tokensCreated: number;
  tokenIds: string[];
  // TOOL-IDEA-005 (2026-05-14): structured per-token list incl. final disambiguated
  // name (Foundry auto-counter rename) + actorId for chaining.
  tokens?: { id: string; name: string; actorId: string }[];
  sceneId?: string;
  sceneName?: string;
  errors?: string[] | undefined;
}

// Phase 3 (R3.1): PersistentCreatureIndex extracted verbatim to ./services/creature-index.ts.
// FoundryDataAccess keeps a same-named `persistentIndex` field (the zero-diff hinge — two characterization
// tests pierce `(da as any).persistentIndex`). The Contract step (deleting facade delegates) is Phase 4.

export class FoundryDataAccess {
  private moduleId: string = MODULE_ID;
  private persistentIndex: PersistentCreatureIndex = new PersistentCreatureIndex();
  // Phase 3 (R3.2): search cluster extracted to ./services/compendium-search.ts. Injected with an adapter
  // that resolves the LIVE persistentIndex field at call time (NOT the by-value reference), so the
  // da-creatures.snap test's post-construction `(da as any).persistentIndex = {...}` stub is honoured.
  private compendiumSearch: CompendiumSearchService = new CompendiumSearchService(
    this.moduleId,
    { getEnhancedIndex: (): Promise<EnhancedCreatureIndex[]> => this.persistentIndex.getEnhancedIndex() } satisfies CreatureIndexReader,
  );

  constructor() { }

  /**
   * Force rebuild of enhanced creature index
   */
  async rebuildEnhancedCreatureIndex(): Promise<{ success: boolean; totalCreatures: number; message: string }> {
    try {
      const creatures = await this.persistentIndex.rebuildIndex();
      return {
        success: true,
        totalCreatures: creatures.length,
        message: `Enhanced creature index rebuilt: ${creatures.length} creatures indexed from all packs`
      };
    } catch (error) {
      console.error(`[${this.moduleId}] Failed to rebuild enhanced creature index:`, error);
      return {
        success: false,
        totalCreatures: 0,
        message: `Failed to rebuild index: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }


  /**
   * Get character/actor information by name or ID
   */
  async getCharacterInfo(identifier: string): Promise<CharacterInfo> {

    let actor: any | undefined;

    // Try to find by ID first, then by name
    if (identifier.length === 16) { // Foundry ID length
      actor = game.actors?.get(identifier);
    }

    if (!actor) {
      actor = game.actors?.find((a: any) =>
        a.name?.toLowerCase() === identifier.toLowerCase()
      );
    }

    // Partial-name fallback (EvalFinding-Phase3-02): parity with findActor /
    // findActorByIdentifier so manage-inventory + similar callers accept short forms
    // like "Lupus" for "Lupus Leonard Joachim Rohrig".
    if (!actor) {
      actor = this.findActorByIdentifier(identifier);
    }

    if (!actor) {
      throw new Error(`${ERROR_MESSAGES.CHARACTER_NOT_FOUND}: ${identifier}`);
    }

    // Build character data structure
    const characterData: CharacterInfo = {
      id: actor.id || '',
      name: actor.name || '',
      type: actor.type,
      ...(actor.img ? { img: actor.img } : {}),
      system: this.sanitizeData(actor.system),
      items: Array.from(actor.items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        ...(item.img ? { img: item.img } : {}),
        system: this.sanitizeData(item.system),
      })),
      effects: Array.from(actor.effects || []).map((effect: any) => ({
        id: effect.id,
        name: effect.name || effect.label || 'Unknown Effect',
        ...(effect.icon ? { icon: effect.icon } : {}),
        disabled: effect.disabled,
        ...(effect.duration ? {
          duration: {
            type: (effect as any).duration.type || 'none',
            duration: (effect as any).duration.duration,
            remaining: (effect as any).duration.remaining,
          }
        } : {}),
        ...(effect.flags ? { flags: effect.flags } : {}),
        ...(effect.system ? { system: effect.system } : {}),
      })),
    };

    return characterData;
  }

  /**
   * Search compendium packs for items matching query with optional filters.
   * Phase 3 (R3.2): delegates to the extracted CompendiumSearchService (branch-by-abstraction facade;
   * the Contract step that deletes this delegate is Phase 4 per R3.3/HC1).
   */
  async searchCompendium(query: string, packType?: string | undefined, filters?: {
    challengeRating?: number | { min?: number | undefined; max?: number | undefined } | undefined;
    creatureType?: string | undefined;
    size?: string | undefined;
    spellcaster?: boolean | undefined;
  } | undefined, itemType?: string | undefined): Promise<CompendiumSearchResult[]> {
    return this.compendiumSearch.searchCompendium(query, packType, filters, itemType);
  }

  /**
   * List creatures by criteria using enhanced persistent index - optimized for instant filtering.
   * Phase 3 (R3.2): delegates to the extracted CompendiumSearchService (facade; Contract is Phase 4).
   */
  async listCreaturesByCriteria(criteria: {
    threatLevel?: number | { min?: number | undefined; max?: number | undefined } | undefined;
    creatureType?: string | undefined;
    size?: string | undefined;
    hasSpells?: boolean | undefined;
    hasSpecialAbilities?: boolean | undefined;
    limit?: number | undefined;
  }): Promise<{ creatures: any[], searchSummary: any }> {
    return this.compendiumSearch.listCreaturesByCriteria(criteria);
  }

  /**
   * List all actors with basic information
   */
  async listActors(type?: string): Promise<Array<{ id: string; name: string; type: string; img?: string }>> {

    const source = type
      ? (game.actors as any).filter((a: any) => a.type === type)
      : game.actors;
    return source.map((actor: any) => ({
      id: actor.id || '',
      name: actor.name || '',
      type: actor.type,
      ...(actor.img ? { img: actor.img } : {}),
    }));
  }

  /**
   * Get active scene information
   * TOOL-IDEA-007 (2026-05-14): optional `sceneId` lets callers inspect a non-active
   * scene without `switch-scene`. Resolves via `game.scenes.get(id)`; throws SceneNotFound
   * if the id misses. When `sceneId` is omitted, behavior is unchanged (returns
   * `game.scenes.current`).
   */
  async getActiveScene(options: { sceneId?: string } = {}): Promise<SceneInfo> {

    const scene = options.sceneId
      ? (game.scenes as any).get(options.sceneId)
      : (game.scenes as any).current;
    if (!scene) {
      throw new Error(
        options.sceneId
          ? `Scene not found: ${options.sceneId}`
          : ERROR_MESSAGES.SCENE_NOT_FOUND
      );
    }

    const sceneData: SceneInfo = {
      id: scene.id,
      name: scene.name,
      img: scene.img || undefined,
      background: scene.background?.src || undefined,
      width: scene.width,
      height: scene.height,
      padding: scene.padding,
      active: scene.active,
      navigation: scene.navigation,
      tokens: scene.tokens.map((token: any) => ({
        id: token.id,
        name: token.name,
        x: token.x,
        y: token.y,
        width: token.width,
        height: token.height,
        actorId: token.actorId || undefined,
        img: token.texture?.src || '',
        hidden: token.hidden,
        disposition: this.getTokenDisposition(token.disposition),
      })),
      walls: scene.walls.size,
      lights: scene.lights.size,
      sounds: scene.sounds.size,
      notes: scene.notes.map((note: any) => ({
        id: note.id,
        text: note.text || '',
        x: note.x,
        y: note.y,
      })),
    };

    return sceneData;
  }

  /**
   * Get world information
   */
  async getWorldInfo(): Promise<WorldInfo> {
    // World info doesn't require special permissions as it's basic metadata

    return {
      id: game.world.id,
      title: game.world.title,
      system: game.system.id,
      systemVersion: game.system.version,
      foundryVersion: game.version,
      users: game.users.map(user => ({
        id: user.id || '',
        name: user.name || '',
        active: user.active,
        isGM: user.isGM,
      })),
    };
  }

  /**
   * Get available compendium packs
   */
  async getAvailablePacks() {

    return Array.from(game.packs.values()).map(pack => ({
      id: pack.metadata.id,
      label: pack.metadata.label,
      type: pack.metadata.type,
      system: pack.metadata.system,
      private: pack.metadata.private,
    }));
  }

  /**
   * Sanitize data to remove sensitive information and make it JSON-safe
   */
  private sanitizeData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data !== 'object') {
      return data;
    }

    try {
      // removeSensitiveFields now returns a sanitized copy
      const sanitized = this.removeSensitiveFields(data);

      // Use custom JSON serializer to avoid deprecated property warnings
      const jsonString = this.safeJSONStringify(sanitized);
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn(`[${this.moduleId}] Failed to sanitize data:`, error);
      return {};
    }
  }

  /**
   * Remove sensitive fields from data object with circular reference protection
   * Returns a sanitized copy instead of modifying the original
   */
  private removeSensitiveFields(obj: any, visited: WeakSet<object> = new WeakSet(), depth: number = 0): any {
    // Handle primitives
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    // Safety depth limit to prevent extremely deep recursion
    if (depth > 50) {
      console.warn(`[${this.moduleId}] Sanitization depth limit reached at depth ${depth}`);
      return { $ref: 'maxDepth', depth };
    }

    // Check for circular reference
    if (visited.has(obj)) {
      return { $ref: 'cycle' };
    }

    // Mark this object as visited
    visited.add(obj);

    try {
      // Handle arrays
      if (Array.isArray(obj)) {
        return obj.map(item => this.removeSensitiveFields(item, visited, depth + 1));
      }

      // Create a new sanitized object
      const sanitized: any = {};

      for (const [key, value] of Object.entries(obj)) {
        // Skip sensitive and problematic fields entirely
        if (this.isSensitiveOrProblematicField(key)) {
          continue;
        }

        // Skip most private properties except essential ones
        if (key.startsWith('_') && !['_id', '_stats', '_source'].includes(key)) {
          continue;
        }

        // Recursively sanitize the value
        sanitized[key] = this.removeSensitiveFields(value, visited, depth + 1);
      }

      return sanitized;

    } catch (error) {
      console.warn(`[${this.moduleId}] Error during sanitization at depth ${depth}:`, error);
      return { $ref: 'sanitizationFailed', error: error instanceof Error ? error.message : 'Unknown' };
    }
  }

  /**
   * Check if a field should be excluded from sanitized output
   */
  private isSensitiveOrProblematicField(key: string): boolean {
    // BUG-386: 'key' removed from this list. In Foundry persisted document data the field literally
    // named `key` is legitimate, load-bearing data — most notably the ActiveEffect change target path
    // ({ key: "system.characteristics.s.initial", value, mode }) — never a credential. Stripping it
    // made correctly-keyed AE changes project as keyless, producing a false "BROKEN/keyless" diagnosis
    // that nearly triggered 15 destructive "fixes" on a locked pack. Foundry documents carry no secret
    // `key`; genuine credentials are covered by 'password'/'token'/'secret'/'auth'/'credential'/'session'.
    const sensitiveKeys = [
      'password', 'token', 'secret', 'auth',
      'credential', 'session', 'cookie', 'private'
    ];

    const problematicKeys = [
      'parent', '_parent', 'collection', 'apps', 'document', '_document',
      'constructor', 'prototype', '__proto__', 'valueOf', 'toString'
    ];

    // Skip deprecated ability save properties that trigger warnings
    const deprecatedKeys = [
      'save' // Skip the deprecated 'save' property on abilities
    ];

    return sensitiveKeys.includes(key) || problematicKeys.includes(key) || deprecatedKeys.includes(key);
  }

  /**
   * Custom JSON serializer that handles Foundry objects safely
   */
  private safeJSONStringify(obj: any): string {
    try {
      return JSON.stringify(obj, (key, value) => {
        // Skip deprecated properties during JSON serialization
        if (key === 'save' && typeof value === 'object' && value !== null) {
          // If this looks like a deprecated ability save object, skip it
          return undefined;
        }
        return value;
      });
    } catch (error) {
      console.warn(`[${this.moduleId}] JSON stringify failed, using fallback:`, error);
      return '{}';
    }
  }

  /**
   * Get token disposition as number
   */
  private getTokenDisposition(disposition: any): number {
    if (typeof disposition === 'number') {
      return disposition;
    }

    // Default to neutral if unknown
    return TOKEN_DISPOSITIONS.NEUTRAL;
  }

  /**
   * Validate that Foundry is ready and world is active
   */
  validateFoundryState(): void {
    if (!game || !game.ready) {
      throw new Error('Foundry VTT is not ready');
    }

    if (!game.world) {
      throw new Error('No active world');
    }

    if (!game.user) {
      throw new Error('No active user');
    }
  }


  /**
   * Audit log for write operations
   */
  private auditLog(operation: string, data: any, result: 'success' | 'failure', error?: string): void {
    // Always audit write operations (no setting required)
    const logEntry = {
      timestamp: new Date().toISOString(),
      operation,
      user: game.user?.name || 'Unknown',
      userId: game.user?.id || 'unknown',
      world: game.world?.id || 'unknown',
      data: this.sanitizeData(data),
      result,
      error,
    };


    // Store in flags for persistence (optional)
    if (game.world && (game.world as any).setFlag) {
      const auditLogs = (game.world as any).getFlag(this.moduleId, 'auditLogs') || [];
      auditLogs.push(logEntry);

      // Keep only last 100 entries to prevent bloat
      if (auditLogs.length > 100) {
        auditLogs.splice(0, auditLogs.length - 100);
      }

      (game.world as any).setFlag(this.moduleId, 'auditLogs', auditLogs);
    }
  }

  // ===== PHASE 2 & 3: WRITE OPERATIONS =====

  // Phase 3 mcp_crud_expansion — journal CRUD methods retired here.
  // The 4 legacy methods (createJournalEntry, listJournals, getJournalContent,
  // updateJournalContent) + deleteJournalEntry are superseded by the 13-action
  // `journal` umbrella in `handlers/journal.ts`. Logic inlined there per Q&A R3
  // suggestion A1 (retire the dual-layer abstraction).

  async deleteActor(data: { id: string }): Promise<{ success: boolean }> {
    this.validateFoundryState();
    const actor = game.actors?.get(data.id);
    if (!actor) {
      this.auditLog('deleteActor', data, 'failure', 'not found');
      // BUG-212: throw instead of {success:false} — matches updateActor/duplicateActor not-found convention.
      // CCR-2: no consumer reads {success:false} from deleteActor; throw propagates via query().
      throw new Error(`Actor with ID "${data.id}" not found`);
    }
    const actorName = actor.name;
    const actorUuid = (actor as any).uuid;
    await actor.delete();
    // BUG-212 + PARITY-020: post-verify the deletion persisted.
    if (game.actors?.get(data.id)) {
      throw new Error(`DELETE_ACTOR_NOT_PERSISTED: actor ${data.id} still present after delete (preDelete hook may have cancelled)`);
    }
    notify.deleted('actor', actorName, { uuid: actorUuid });
    this.auditLog('deleteActor', data, 'success');
    return { success: true };
  }

  // Phase 3 mcp_crud_expansion — deleteJournalEntry retired here.
  // Superseded by handlers/journal.ts deleteEntry (BUG-070 post-verify included).

  /**
   * Create actors from compendium entries with custom names
   */
  async createActorFromCompendium(request: ActorCreationRequest): Promise<ActorCreationResult> {
    this.validateFoundryState();

    const maxActors = game.settings.get(this.moduleId, 'maxActorsPerRequest') as number;
    const quantity = Math.min(request.quantity || 1, maxActors);

    try {
      // Find matching compendium entry
      const compendiumEntry = await this.findBestCompendiumMatch(request.creatureType, request.packPreference);
      if (!compendiumEntry) {
        throw new Error(`No compendium entry found for "${request.creatureType}"`);
      }


      // Get full compendium document
      const sourceDoc = await this.getCompendiumDocumentFull(
        compendiumEntry.pack,
        compendiumEntry.id
      );

      const createdActors: CreatedActorInfo[] = [];
      const errors: string[] = [];

      // Create actors with custom names
      for (let i = 0; i < quantity; i++) {
        try {
          const customName = request.customNames?.[i] ||
            (quantity > 1 ? `${sourceDoc.name} ${i + 1}` : sourceDoc.name);

          const newActor = await this.createActorFromSource(sourceDoc, customName);

          createdActors.push({
            id: newActor.id,
            name: newActor.name,
            originalName: sourceDoc.name,
            type: newActor.type,
            sourcePackId: compendiumEntry.pack,
            sourcePackLabel: compendiumEntry.packLabel,
            img: newActor.img,
          });
        } catch (error) {
          errors.push(`Failed to create actor ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      let tokensPlaced = 0;

      // Add to scene if requested
      if (request.addToScene && createdActors.length > 0) {
        try {
          const tokenResult = await this.addActorsToScene({
            actorIds: createdActors.map(a => a.id),
            placement: 'random',
            hidden: false,
          });
          tokensPlaced = tokenResult.tokensCreated;
        } catch (error) {
          errors.push(`Failed to add actors to scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Partial-failure signal is carried back via `errors`; rollback is now
      // performed by the handler-level wrappedWrite on throw.
      if (errors.length > 0 && createdActors.length < quantity && createdActors.length < quantity / 2) {
        throw new Error(`Actor creation failed: ${errors.join(', ')}`);
      }

      const result: ActorCreationResult = {
        success: createdActors.length > 0,
        actors: createdActors,
        ...(errors.length > 0 ? { errors } : {}),
        tokensPlaced,
        totalRequested: quantity,
        totalCreated: createdActors.length,
      };

      if (createdActors.length > 0) {
        notify.created('actor', `${createdActors.length} actor(s)`, {
          summary: `from compendium (${request.creatureType})`,
        });
      }

      this.auditLog('createActorFromCompendium', request, 'success');
      return result;

    } catch (error) {
      this.auditLog('createActorFromCompendium', request, 'failure', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Create actor from specific compendium entry using pack/item IDs
   */
  async createActorFromCompendiumEntry(request: {
    packId: string;
    itemId: string;
    customNames: string[];
    quantity?: number;
    addToScene?: boolean;
    placement?: {
      type: 'random' | 'grid' | 'center' | 'coordinates';
      coordinates?: { x: number; y: number }[];
    };
  }): Promise<ActorCreationResult> {
    this.validateFoundryState();

    try {
      const { packId, itemId, customNames, quantity = 1, addToScene = false, placement } = request;

      // Validate inputs
      if (!packId || !itemId) {
        throw new Error('Both packId and itemId are required');
      }

      // Get the pack
      const pack = game.packs.get(packId);
      if (!pack) {
        throw new Error(`Compendium pack "${packId}" not found`);
      }

      // Get the specific document
      const sourceDocument = await pack.getDocument(itemId);
      if (!sourceDocument) {
        throw new Error(`Document "${itemId}" not found in pack "${packId}"`);
      }

      if (sourceDocument.documentName !== 'Actor') {
        throw new Error(`Document "${itemId}" is not an Actor (documentName: ${sourceDocument.documentName}); pack "${packId}" must be an Actor compendium.`);
      }

      const sourceActor = sourceDocument as Actor;

      // BUG-273: pad names up to quantity so all requested actors are created.
      // When customNames covers quantity, use them as-is; otherwise auto-number the remainder.
      const baseName = customNames.length > 0 ? customNames[0]! : `${sourceActor.name} Copy`;
      const names: string[] = customNames.length >= quantity
        ? customNames.slice(0, quantity)
        : Array.from({ length: quantity }, (_, i) =>
            i < customNames.length
              ? customNames[i]!
              : i === 0 ? baseName : `${baseName} (${i + 1})`
          );
      const finalQuantity = quantity;

      const createdActors: any[] = [];
      const errors: string[] = [];

      // Create actors
      for (let i = 0; i < finalQuantity; i++) {
        try {
          const customName = names[i] || `${sourceActor.name} ${i + 1}`;

          // Create actor data with full system, items, and effects
          const sourceData = sourceActor.toObject() as any;
          const actorData = {
            name: customName,
            type: sourceData.type,
            img: sourceData.img,
            system: sourceData.system || sourceData.data || {},
            items: sourceData.items || [],
            effects: sourceData.effects || [],
            folder: null, // Don't inherit folder
            prototypeToken: sourceData.prototypeToken, // Include prototype token
          };


          // Fix remote image URLs - normalize to local paths
          if (actorData.prototypeToken?.texture?.src?.startsWith('http')) {
            actorData.prototypeToken.texture.src = null; // Clear remote URL
          }

          // Organize created actors in a folder - use "Foundry MCP Creatures" for generic monsters
          const folderId = await this.getOrCreateFolder('Foundry MCP Creatures', 'Actor');
          if (folderId) {
            (actorData as any).folder = folderId;
          }

          // Create the actor
          const newActor = await (Actor as any).create(actorData);
          if (!newActor) {
            throw new Error(`Failed to create actor "${customName}"`);
          }

          createdActors.push({
            id: newActor.id,
            name: newActor.name,
            originalName: sourceActor.name,
            sourcePackLabel: pack.metadata.label,
          });


        } catch (error) {
          const errorMsg = `Failed to create actor ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          notify.warn(`Failed to create actor ${i + 1}/${finalQuantity}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Add to scene if requested
      let tokensPlaced = 0;
      if (addToScene && createdActors.length > 0) {
        try {
          const sceneResult = await this.addActorsToScene({
            actorIds: createdActors.map(a => a.id),
            placement: placement?.type || 'grid',
            hidden: false,
            ...(placement?.coordinates && { coordinates: placement.coordinates })
          });
          tokensPlaced = sceneResult.success ? sceneResult.tokensCreated : 0;
        } catch (error) {
          errors.push(`Failed to add actors to scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      const result: ActorCreationResult = {
        success: createdActors.length > 0,
        totalCreated: createdActors.length,
        totalRequested: finalQuantity,
        actors: createdActors,
        tokensPlaced,
        errors: errors.length > 0 ? errors : undefined,
      };

      if (createdActors.length > 0) {
        notify.created('actor', `${createdActors.length} actor(s)`, {
          summary: `from ${packId}/${itemId}`,
        });
      }

      this.auditLog('createActorFromCompendiumEntry', request, 'success');
      return result;

    } catch (error) {
      notify.error('Failed to create actor from compendium entry', error instanceof Error ? error : new Error(String(error)));
      this.auditLog('createActorFromCompendiumEntry', request, 'failure', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Get full compendium document with all embedded data
   */
  async getCompendiumDocumentFull(packId: string, documentId: string): Promise<CompendiumEntryFull> {

    const pack = game.packs.get(packId);
    if (!pack) {
      throw new Error(`Compendium pack ${packId} not found`);
    }

    const document = await pack.getDocument(documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found in pack ${packId}`);
    }

    // Build comprehensive data structure
    const fullEntry: CompendiumEntryFull = {
      id: document.id || '',
      name: document.name || '',
      type: (document as any).type || 'unknown',
      img: (document as any).img || undefined,
      pack: packId,
      packLabel: pack.metadata.label,
      system: this.sanitizeData((document as any).system || {}),
      fullData: this.sanitizeData(document.toObject()),
    };

    // Add items if the actor has them
    if ((document as any).items) {
      fullEntry.items = (document as any).items.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        img: item.img || undefined,
        system: this.sanitizeData(item.system || {}),
      }));
    }

    // Add effects if the actor has them
    if ((document as any).effects) {
      fullEntry.effects = (document as any).effects.map((effect: any) => ({
        id: effect.id,
        name: effect.name || effect.label || 'Unknown Effect',
        icon: effect.icon || undefined,
        disabled: effect.disabled || false,
        duration: this.sanitizeData(effect.duration || {}),
      }));
    }

    return fullEntry;
  }

  /**
   * Add actors to the current scene as tokens
   */
  async addActorsToScene(placement: SceneTokenPlacement): Promise<TokenPlacementResult> {
    this.validateFoundryState();

    // TOOL-IDEA-004 (2026-05-14): optional `sceneId` targets a non-active scene.
    // `scene.createEmbeddedDocuments('Token', ...)` is a DB write that works regardless
    // of canvas/active state — tokens become visible when the GM later views the scene.
    const scene = (placement as any).sceneId
      ? (game.scenes as any).get((placement as any).sceneId)
      : (game.scenes as any).current;
    if (!scene) {
      throw new Error(
        (placement as any).sceneId
          ? `Scene not found: ${(placement as any).sceneId}`
          : 'No active scene found'
      );
    }

    try {
      const tokenData: any[] = [];
      const errors: string[] = [];
      // BUG-270: compute total token count up-front so grid cols is stable across the batch.
      const totalTokenCount = placement.actorIds.reduce((sum, _, ai) =>
        sum + Math.max(1, placement.quantities?.[ai] ?? 1), 0);

      for (let ai = 0; ai < placement.actorIds.length; ai++) {
        const actorId = placement.actorIds[ai]!;
        const qty = Math.max(1, placement.quantities?.[ai] ?? 1);
        try {
          const actor = game.actors.get(actorId);
          if (!actor) {
            errors.push(`Actor ${actorId} not found`);
            continue;
          }

          // BUG-051 hotfix: if actor uses linked tokens, note it in the audit log — user may
          // have wanted unlinked (prototype) tokens for per-token independent HP. Proceed anyway.
          if ((actor as any).prototypeToken?.actorLink === true && qty > 1) {
            this.auditLog('addActorsToScene', { actorId, quantity: qty }, 'success', 'actor.prototypeToken.actorLink=true — N tokens share one ActorDelta');
          }

          for (let i = 0; i < qty; i++) {
            const tokenDoc = (actor as any).prototypeToken.toObject();
            const position = this.calculateTokenPosition(placement.placement, scene, tokenData.length, placement.coordinates, totalTokenCount);

            if (tokenDoc.texture?.src?.startsWith('http')) {
              notify.warn(`Token texture still remote: ${tokenDoc.texture.src} — placement may render poorly`);
              tokenDoc.texture.src = null;
            }

            tokenData.push({
              ...tokenDoc,
              x: position.x,
              y: position.y,
              actorId: actorId,
              hidden: placement.hidden,
            });
          }
        } catch (error) {
          errors.push(`Failed to prepare token for actor ${actorId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      const createdTokens = await scene.createEmbeddedDocuments('Token', tokenData);

      if (createdTokens.length > 0) {
        notify.created('token', `${createdTokens.length} token(s)`, {
          summary: `on ${scene.name}`,
        });
      }

      // TOOL-IDEA-005 (2026-05-14): surface placed token names alongside IDs so callers
      // chaining encounter-builder workflows can read auto-counter-renamed names (e.g.
      // "Skeleton (3)") without a follow-up `get-current-scene` over-fetch. `tokenIds`
      // is preserved for back-compat with existing skill prompts.
      const result: TokenPlacementResult = {
        success: createdTokens.length > 0,
        tokensCreated: createdTokens.length,
        tokenIds: createdTokens.map((token: any) => token.id),
        tokens: createdTokens.map((token: any) => ({
          id: token.id,
          name: token.name,
          actorId: token.actorId,
        })),
        sceneId: scene.id,
        sceneName: scene.name,
        ...(errors.length > 0 ? { errors } : {}),
      };

      // BUG-265: audit after the operation; report partial failure when per-token errors occurred.
      if (errors.length > 0) {
        this.auditLog('addActorsToScene', placement, 'failure', `partial: ${errors.join('; ')}`);
      } else {
        this.auditLog('addActorsToScene', placement, 'success');
      }
      return result;

    } catch (error) {
      this.auditLog('addActorsToScene', placement, 'failure', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Find best matching compendium entry for creature type
   */
  private async findBestCompendiumMatch(creatureType: string, packPreference?: string): Promise<CompendiumSearchResult | null> {
    // First try exact search
    const exactResults = await this.searchCompendium(creatureType, 'Actor');

    // Look for exact name match first
    const exactMatch = exactResults.find(result =>
      result.name.toLowerCase() === creatureType.toLowerCase()
    );
    if (exactMatch) return exactMatch;

    // Look for partial matches, preferring specified pack
    if (packPreference) {
      const packMatch = exactResults.find(result =>
        result.pack === packPreference
      );
      if (packMatch) return packMatch;
    }

    // Return best fuzzy match
    return exactResults.length > 0 ? exactResults[0]! : null;
  }

  /**
   * Create actor from source document with custom name
   */
  private async createActorFromSource(sourceDoc: CompendiumEntryFull, customName: string): Promise<any> {

    try {
      // Clone the source data
      const actorData = (foundry.utils as any).duplicate(sourceDoc.fullData) as any;

      // Apply customizations
      actorData.name = customName;
      // Sync the prototype-token name. The clone keeps the compendium source's
      // prototypeToken.name otherwise, so tokens dragged from this actor are
      // mislabelled with the original creature/template name instead of customName.
      if (actorData.prototypeToken) actorData.prototypeToken.name = customName;

      // Fix only token texture - leave portrait (actor.img) alone
      if (actorData.prototypeToken?.texture?.src?.startsWith('http')) {
        console.error(`[${this.moduleId}] Removing remote token texture URL: ${actorData.prototypeToken.texture.src}`);
        actorData.prototypeToken.texture.src = null; // Let Foundry use fallback
      }


      // Remove source-specific identifiers
      delete actorData._id;
      delete actorData.folder;
      delete actorData.sort;

      // Ensure required fields are present
      if (!actorData.name) actorData.name = customName;
      if (!actorData.type) actorData.type = sourceDoc.type || 'npc';

      // Organize created actors in a folder - use "Foundry MCP Creatures" for generic monsters  
      const folderId = await this.getOrCreateFolder('Foundry MCP Creatures', 'Actor');
      if (folderId) {
        (actorData as any).folder = folderId;
      }

      // Create the new actor
      const createdDocs = await (Actor as any).createDocuments([actorData]);
      if (!createdDocs || createdDocs.length === 0) {
        throw new Error('Failed to create actor document');
      }

      return createdDocs[0];
    } catch (error) {
      notify.error('Actor creation failed', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Calculate token position based on placement strategy
   */
  // BUG-270: accept total token count so grid cols is fixed for the whole batch.
  private calculateTokenPosition(placement: 'random' | 'grid' | 'center' | 'coordinates', scene: any, index: number, coordinates?: { x: number; y: number }[], total?: number): { x: number; y: number } {
    const gridSize = scene.grid?.size || 100;
    // BUG-270: cols must be derived from the full batch size, not per-index.
    const effectiveTotal = (total != null && total > 0) ? total : (index + 1);
    const fixedCols = Math.ceil(Math.sqrt(effectiveTotal));

    switch (placement) {
      case 'coordinates':
        if (coordinates && coordinates[index]) {
          return coordinates[index];
        }
        // Fallback to grid if coordinates not provided or insufficient
        const fallbackRow = Math.floor(index / fixedCols);
        const fallbackCol = index % fixedCols;
        return {
          x: gridSize + (fallbackCol * gridSize * 2),
          y: gridSize + (fallbackRow * gridSize * 2),
        };

      case 'center':
        return {
          x: (scene.width / 2) + (index * gridSize),
          y: scene.height / 2,
        };

      case 'grid':
        const row = Math.floor(index / fixedCols);
        const col = index % fixedCols;
        return {
          x: gridSize + (col * gridSize * 2),
          y: gridSize + (row * gridSize * 2),
        };

      case 'random':
      default:
        return {
          x: Math.random() * (scene.width - gridSize),
          y: Math.random() * (scene.height - gridSize),
        };
    }
  }

  /**
   * Request player rolls - creates interactive roll buttons in chat
   */
  async requestPlayerRolls(data: {
    rollType: string;
    rollTarget: string;
    targetPlayer: string;
    isPublic: boolean;
    rollModifier: string;
    flavor: string;
  }): Promise<{ success: boolean; requestId?: string; message: string; error?: string }> {
    this.validateFoundryState();

    try {
      // Resolve target player from character name or player name with enhanced error handling
      const playerInfo = this.resolveTargetPlayer(data.targetPlayer);
      if (!playerInfo.found) {
        // Provide structured error message for MCP that Claude Desktop can understand
        const errorMessage = playerInfo.errorMessage || `Could not find player or character: ${data.targetPlayer}`;

        return {
          success: false,
          message: '',
          error: errorMessage
        };
      }

      // Build roll formula based on type and target
      const rollFormula = this.buildRollFormula(data.rollType, data.rollTarget, data.rollModifier, playerInfo.character);

      // Generate roll button HTML
      const buttonId = (foundry.utils as any).randomID();
      const requestId = (foundry.utils as any).randomID();
      const buttonLabel = this.buildRollButtonLabel(data.rollType, data.rollTarget, data.isPublic);

      // Check if this type of roll was already performed (optional: could check for duplicate recent rolls)
      // For now, we'll just create the button and let the rendering logic handle the state restoration


      const rollButtonHtml = `
        <div class="mcp-roll-request" style="margin: 12px 0; padding: 12px; border: 1px solid #ccc; border-radius: 8px; background: #f9f9f9;">
          <p><strong>Roll Request:</strong> ${buttonLabel}</p>
          <p><strong>Target:</strong> ${playerInfo.targetName} ${playerInfo.character ? `(${playerInfo.character.name})` : ''}</p>
          ${data.flavor ? `<p><strong>Context:</strong> ${data.flavor}</p>` : ''}

          <div style="text-align: center; margin-top: 8px;">
            <!-- Single Roll Button (clickable by both character owner and GM) -->
            <button class="mcp-roll-button mcp-button-active"
                    data-button-id="${buttonId}"
                    data-roll-formula="${rollFormula}"
                    data-roll-label="${buttonLabel}"
                    data-is-public="${data.isPublic}"
                    data-character-id="${playerInfo.character?.id || ''}"
                    data-target-user-id="${playerInfo.user?.id || ''}"
                    data-request-id="${requestId}">
              🎲 ${buttonLabel}
            </button>
          </div>
        </div>
      `;

      // Create chat message with roll button
      // For PUBLIC rolls: both roll request and results visible to all players
      // For PRIVATE rolls: both roll request and results visible to target player + GM only
      const whisperTargets: string[] = [];

      if (!data.isPublic) {
        // Private roll request: whisper to target player + GM only

        // Always whisper to the character owner if they exist
        if (playerInfo.user?.id) {
          whisperTargets.push(playerInfo.user.id);
        }

        // Also send to GM (GMs can see all whispered messages anyway, but this ensures they see it)
        const gmUsers = game.users?.filter((u: User) => u.isGM && u.active);
        if (gmUsers) {
          for (const gm of gmUsers) {
            if (gm.id && !whisperTargets.includes(gm.id)) {
              whisperTargets.push(gm.id);
            }
          }
        }
      } else {
        // Public roll request: visible to all players (empty whisperTargets array)
      }

      const messageData = {
        content: rollButtonHtml,
        // BUG-267: game.user is a User, not an Actor; use the user's assigned character instead.
        speaker: ChatMessage.getSpeaker({ actor: (game.user as any)?.character ?? null }),
        style: (CONST as any).CHAT_MESSAGE_STYLES?.OTHER || 0, // Use style instead of deprecated type
        whisper: whisperTargets,
        flags: {
          [MODULE_ID]: {
            requestId,
            rollButtons: {
              [buttonId]: {
                rolled: false,
                rollFormula: rollFormula,
                rollLabel: buttonLabel,
                isPublic: data.isPublic,
                characterId: playerInfo.character?.id || '',
                targetUserId: playerInfo.user?.id || ''
              }
            }
          }
        }
      };

      const chatMessage = await ChatMessage.create(messageData);

      // Store message ID for later updates
      this.saveRollButtonMessageId(buttonId, chatMessage.id);

      // Note: Click handlers are attached globally via renderChatMessageHTML hook in main.ts
      // This ensures all users get the handlers when they see the message

      notify.created('mcp', 'Roll request', {
        summary: `to ${data.targetPlayer}: ${data.rollType}`,
      });

      return {
        success: true,
        requestId,
        message: `Roll request sent to ${playerInfo.targetName}. ${data.isPublic ? 'Public roll' : 'Private roll'} button created in chat.`
      };

    } catch (error) {
      notify.error('Failed to create roll request', error instanceof Error ? error : new Error(String(error)));
      return {
        success: false,
        message: '',
        error: error instanceof Error ? error.message : 'Unknown error creating roll request'
      };
    }
  }

  /**
   * Enhanced player resolution with offline/non-existent player detection
   * Supports partial matching and provides structured error messages for MCP
   */
  private resolveTargetPlayer(targetPlayer: string): {
    found: boolean;
    user?: User;
    character?: Actor;
    targetName: string;
    errorType?: 'PLAYER_OFFLINE' | 'PLAYER_NOT_FOUND' | 'CHARACTER_NOT_FOUND';
    errorMessage?: string;
  } {
    const searchTerm = targetPlayer.toLowerCase().trim();


    // FIRST: Check all registered users (both active and inactive) for player name match
    const allUsers = Array.from(game.users?.values() || []);

    // Try exact player name match first (active and inactive users)
    let user = allUsers.find((u: User) =>
      u.name?.toLowerCase() === searchTerm
    );

    if (user) {
      const isActive = user.active;

      if (!isActive) {
        // Player exists but is offline
        return {
          found: false,
          user,
          targetName: user.name || 'Unknown Player',
          errorType: 'PLAYER_OFFLINE',
          errorMessage: `Player "${user.name}" is registered but not currently logged in. They need to be online to receive roll requests.`
        };
      }

      // Find the player's character for roll calculations
      const playerCharacter = game.actors?.find((actor: Actor) => {
        if (!user) return false;
        return actor.testUserPermission(user, 'OWNER') && !user.isGM;
      });

      return {
        found: true,
        user,
        ...(playerCharacter && { character: playerCharacter }), // Include character only if found
        targetName: user.name || 'Unknown Player'
      };
    }

    // Try partial player name match (active and inactive users)
    if (!user) {
      user = allUsers.find((u: User) => {
        return Boolean(u.name && u.name.toLowerCase().includes(searchTerm));
      });

      if (user) {
        const isActive = user.active;

        if (!isActive) {
          // Player exists but is offline
          return {
            found: false,
            user,
            targetName: user.name || 'Unknown Player',
            errorType: 'PLAYER_OFFLINE',
            errorMessage: `Player "${user.name}" is registered but not currently logged in. They need to be online to receive roll requests.`
          };
        }

        // Find the player's character for roll calculations
        const playerCharacter = game.actors?.find((actor: Actor) => {
          if (!user) return false;
          return actor.testUserPermission(user, 'OWNER') && !user.isGM;
        });

        return {
          found: true,
          user,
          ...(playerCharacter && { character: playerCharacter }), // Include character only if found
          targetName: user.name || 'Unknown Player'
        };
      }
    }

    // SECOND: Try to find by character name (exact match, then partial match)
    let character = game.actors?.find((actor: Actor) =>
      actor.name?.toLowerCase() === searchTerm && actor.hasPlayerOwner
    );

    if (character) {
    }

    // If no exact character match, try partial match
    if (!character) {
      character = game.actors?.find((actor: Actor) => {
        return Boolean(actor.name && actor.name.toLowerCase().includes(searchTerm) && actor.hasPlayerOwner);
      });

      if (character) {
      }
    }

    if (character) {
      // Find the actual player owner (not GM) of this character
      const ownerUser = allUsers.find((u: User) =>
        character.testUserPermission(u, 'OWNER') && !u.isGM
      );

      if (ownerUser) {
        const isOwnerActive = ownerUser.active;

        if (!isOwnerActive) {
          // Character owner exists but is offline
          return {
            found: false,
            user: ownerUser,
            character,
            targetName: ownerUser.name || 'Unknown Player',
            errorType: 'PLAYER_OFFLINE',
            errorMessage: `Player "${ownerUser.name}" (owner of character "${character.name}") is registered but not currently logged in. They need to be online to receive roll requests.`
          };
        }

        return {
          found: true,
          user: ownerUser,
          character,
          targetName: ownerUser.name || 'Unknown Player'
        };
      } else {
        // No player owner found - character is GM-only controlled
        // Still return found=true but without user, GM can still roll for it
        return {
          found: true,
          character,
          targetName: character.name || 'Unknown Character'
          // user is omitted (undefined) for GM-only characters
        };
      }
    }

    // THIRD: Check if the search term might be a character that exists but has no player owner
    const anyCharacter = game.actors?.find((actor: Actor) => {
      if (!actor.name) return false;
      return actor.name.toLowerCase() === searchTerm ||
        actor.name.toLowerCase().includes(searchTerm);
    });

    if (anyCharacter && !anyCharacter.hasPlayerOwner) {
      return {
        found: true,
        character: anyCharacter,
        targetName: anyCharacter.name || 'Unknown Character'
        // No user for GM-controlled characters
      };
    }

    // No player or character found at all

    return {
      found: false,
      targetName: targetPlayer,
      errorType: 'PLAYER_NOT_FOUND',
      errorMessage: `No player or character named "${targetPlayer}" found. Available players: ${allUsers.filter(u => !u.isGM).map(u => u.name).join(', ') || 'none'}`
    };
  }

  /**
   * Build roll formula based on roll type and target using Foundry's roll data system
   * WFRP 4e specific implementation
   */
  private buildRollFormula(rollType: string, rollTarget: string, rollModifier: string, character?: Actor): string {
    let baseFormula = '1d100<=50';

    // Only support WFRP 4e
    const gameSystem = game.system?.id || '';
    const isWFRP = gameSystem.includes('wfrp');

    if (!isWFRP) {
      console.warn(`[${MODULE_ID}] Non-WFRP system detected. This module only supports WFRP 4e.`);
      return '1d100<=50';
    }

    if (character) {
      // Use Foundry's getRollData() to get calculated modifiers including active effects
      const rollData = character.getRollData() as any; // Type assertion for Foundry's dynamic roll data

      // WFRP 4e uses d100 system with characteristics and skills
      switch (rollType) {
        case 'characteristic':
        case 'ability':
          // WFRP characteristics (WS, BS, S, T, I, Ag, Dex, Int, WP, Fel)
          const charCode = this.getWFRPCharacteristicCode(rollTarget);
          const charValue = rollData.characteristics?.[charCode]?.value ??
            (character as any).system?.characteristics?.[charCode]?.value ?? 50;
          baseFormula = `1d100<=${charValue}`;
          break;

        case 'skill':
          // BUG-271: wfrp4e skills are embedded Items, not system.skills entries.
          // Read the computed total from the item's system.total.value.
          const skillName = rollTarget.toLowerCase();
          const skillItem = (character as any).items?.find(
            (i: any) => i.type === 'skill' && i.name?.toLowerCase() === skillName
          ) as any;
          const skillValue = skillItem?.system?.total?.value ?? 50;
          baseFormula = `1d100<=${skillValue}`;
          break;

        case 'custom':
          baseFormula = rollTarget; // Use rollTarget as the formula directly
          break;

        default:
          baseFormula = '1d100<=50'; // Default WFRP roll
      }
    } else {
      console.warn(`[${MODULE_ID}] No character provided for roll formula, using base 1d100<=50`);
      baseFormula = '1d100<=50';
    }

    // BUG-331: for roll-under formulas the modifier adjusts the TARGET, not the roll —
    // Foundry's v13 parser drops the `<=NN` clause and would fold an appended modifier
    // into the d100 arithmetic (displayed total = die + modifier). Fold flat modifiers
    // into the target number; non-d100 custom formulas keep the arithmetic append.
    if (rollModifier && rollModifier.trim()) {
      const modifier = rollModifier.startsWith('+') || rollModifier.startsWith('-') ? rollModifier : `+${rollModifier}`;
      const rollUnder = /^1d100<=(\d+)$/.exec(baseFormula);
      const flat = parseInt(modifier, 10);
      if (rollUnder && Number.isFinite(flat)) {
        baseFormula = `1d100<=${Math.max(0, parseInt(rollUnder[1]!, 10) + flat)}`;
      } else {
        baseFormula += modifier;
      }
    }

    return baseFormula;
  }

  /**
   * Map WFRP characteristic names to codes
   */
  private getWFRPCharacteristicCode(charName: string): string {
    const charMap: { [key: string]: string } = {
      'weapon skill': 'ws',
      'weaponskill': 'ws',
      'ws': 'ws',
      'ballistic skill': 'bs',
      'ballisticskill': 'bs',
      'bs': 'bs',
      'strength': 's',
      's': 's',
      'toughness': 't',
      't': 't',
      'initiative': 'i',
      'i': 'i',
      'agility': 'ag',
      'ag': 'ag',
      'dexterity': 'dex',
      'dex': 'dex',
      'intelligence': 'int',
      'int': 'int',
      'willpower': 'wp',
      'wp': 'wp',
      'fellowship': 'fel',
      'fel': 'fel'
    };

    const normalized = charName.toLowerCase().replace(/\s+/g, '');
    // BUG-377: charMap is a plain object literal, so charMap[normalized] for a prototype-key
    // ('constructor', '__proto__', 'tostring', 'valueof', 'hasownproperty') resolves to a truthy
    // Object.prototype member and bypasses the `|| 'ws'` fallback, returning a non-string. Guard
    // with hasOwnProperty so only real entries are returned and everything else falls back to 'ws'.
    const code = Object.prototype.hasOwnProperty.call(charMap, normalized) ? charMap[normalized] : undefined;
    return code ?? 'ws'; // Default to weapon skill
  }

  /**
   * Build roll button label
   */
  private buildRollButtonLabel(rollType: string, rollTarget: string, isPublic: boolean): string {
    const visibility = isPublic ? 'Public' : 'Private';

    switch (rollType) {
      case 'ability':
        return `${rollTarget.toUpperCase()} Ability Check (${visibility})`;
      case 'skill':
        return `${rollTarget.charAt(0).toUpperCase() + rollTarget.slice(1)} Skill Check (${visibility})`;
      case 'attack':
        return `${rollTarget} Attack (${visibility})`;
      case 'initiative':
        return `Initiative Roll (${visibility})`;
      case 'custom':
        return `Custom Roll (${visibility})`;
      default:
        return `Roll (${visibility})`;
    }
  }

  /**
   * Restore roll button states from persistent storage
   * Called when chat messages are rendered to maintain state across sessions
   */

  /**
   * Attach click handlers to roll buttons and handle visibility
   * Called by global renderChatMessageHTML hook in main.ts
   */
  public attachRollButtonHandlers(html: any): void {
    const currentUserId = game.user?.id;
    const isGM = game.user?.isGM;

    // Note: Roll state restoration now handled by ChatMessage content, not DOM manipulation

    // Handle button visibility and styling based on permissions and public/private status
    // IMPORTANT: Skip styling for buttons that are already in rolled state
    html.find('.mcp-roll-button').each((_index: number, element: any) => {
      const button = $(element);
      const targetUserId = button.data('target-user-id');
      const isPublicRollRaw = button.data('is-public');
      const isPublicRoll = isPublicRollRaw === true || isPublicRollRaw === 'true';

      // Note: No need to check for rolled state - ChatMessage.update() replaces buttons with completion status

      // Determine if user can interact with this button
      const canClickButton = isGM || (targetUserId && targetUserId === currentUserId);


      if (isPublicRoll) {
        // Public roll: show to all players, but style differently for non-clickable users
        if (canClickButton) {
          // Can click: normal active button
          button.css({
            'background': '#4CAF50',
            'cursor': 'pointer',
            'opacity': '1'
          });
        } else {
          // Cannot click: disabled/informational style
          button.css({
            'background': '#9E9E9E',
            'cursor': 'not-allowed',
            'opacity': '0.7'
          });
          button.prop('disabled', true);
        }
      } else {
        // Private roll: only show to target user and GM
        if (canClickButton) {
          button.show();
        } else {
          button.hide();
        }
      }
    });

    // Attach click handlers to roll buttons
    html.find('.mcp-roll-button').on('click', async (event: any) => {
      const button = $(event.currentTarget);

      // Ignore clicks on disabled buttons
      if (button.prop('disabled')) {
        return;
      }

      // Prevent double-clicks by immediately disabling the button
      button.prop('disabled', true);
      const originalText = button.text();
      button.text('🎲 Rolling...');

      const buttonId = button.data('button-id');

      // BUG-263: a single try/finally spans everything after the disable above, so
      // every exit path (in-flight guard, missing button-id, permission denied, roll
      // error) restores the button — only a completed roll leaves it disabled.
      let rollCompleted = false;
      let markedProcessing = false;

      try {
        // Another click on this button is already mid-roll; that run owns the
        // processing flag and will restore/replace the button itself.
        if (buttonId && this.isRollButtonProcessing(buttonId)) {
          return;
        }

        // Validate button has required data
        if (!buttonId) {
          console.warn(`[${MODULE_ID}] Button missing button-id data attribute`);
          return;
        }

        // Mark this button as being processed
        this.setRollButtonProcessing(buttonId, true);
        markedProcessing = true;

        const rollFormula = button.data('roll-formula');
        const rollLabel = button.data('roll-label');
        const isPublicRaw = button.data('is-public');
        const isPublic = isPublicRaw === true || isPublicRaw === 'true'; // Convert to proper boolean
        const characterId = button.data('character-id');
        const targetUserId = button.data('target-user-id');
        const isGmRoll = game.user?.isGM || false; // Determine if this is a GM executing the roll

        // Check if user has permission to execute this roll
        // Allow GM to roll for any character, or allow character owner to roll for their character
        const canExecuteRoll = game.user?.isGM || (targetUserId && targetUserId === game.user?.id);

        if (!canExecuteRoll) {
          console.warn(`[${MODULE_ID}] Permission denied for roll execution`);
          notify.warn('You do not have permission to execute this roll');
          return;
        }

        // Create and evaluate the roll
        const roll = new Roll(rollFormula);
        await roll.evaluate();


        // Get the character for speaker info
        const character = characterId ? game.actors?.get(characterId) : null;

        // Use the modern Foundry v13 approach with roll.toMessage()
        const whisperTargets: string[] = [];

        if (!isPublic) {
          // For private rolls: whisper to target + GM
          if (targetUserId) {
            whisperTargets.push(targetUserId);
          }
          // Add all active GMs
          const gmUsers = game.users?.filter((u: User) => u.isGM && u.active);
          if (gmUsers) {
            for (const gm of gmUsers) {
              if (gm.id && !whisperTargets.includes(gm.id)) {
                whisperTargets.push(gm.id);
              }
            }
          }
        }

        const messageData: any = {
          speaker: ChatMessage.getSpeaker({ actor: character }),
          flavor: `${rollLabel} ${isGmRoll ? '(GM Override)' : ''}`,
          ...(whisperTargets.length > 0 ? { whisper: whisperTargets } : {})
        };


        // Use roll.toMessage() with proper rollMode
        await roll.toMessage(messageData);

        // Emit roll-result event if an awaitResult requestId is set on this button.
        const rollRequestId = button.data('request-id');
        if (rollRequestId) {
          const emitRollEvent = (window as any).foundryMCPBridge?.emitRollEvent;
          if (typeof emitRollEvent === 'function') {
            emitRollEvent(rollRequestId, this.buildRollResultPayload(String(rollFormula ?? ''), roll));
          }
        }

        // Update the ChatMessage to reflect rolled state
        if (game.user?.id) {
          try {
            await this.updateRollButtonMessage(buttonId, game.user.id, rollLabel);
          } catch (updateError) {
            console.error(`[${MODULE_ID}] Failed to update chat message:`, updateError);
            console.error(`[${MODULE_ID}] Error details:`, updateError instanceof Error ? updateError.stack : updateError);
            // Fall back to DOM manipulation if message update fails
            button.prop('disabled', true).text('✓ Rolled');
          }
        } else {
          console.warn(`[${MODULE_ID}] Cannot update ChatMessage - missing userId for button:`, buttonId);
        }

        rollCompleted = true;
      } catch (error) {
        console.error(`[${MODULE_ID}] Error executing roll:`, error);
        notify.error('Failed to execute roll');
      } finally {
        // Clear processing state only if this handler set it (an in-flight run owns it otherwise)
        if (markedProcessing && buttonId) {
          this.setRollButtonProcessing(buttonId, false);
        }
        // BUG-263: restore the button on every non-completed exit so it never
        // sticks disabled in "Rolling..."; a completed roll keeps its rolled state.
        if (!rollCompleted) {
          button.prop('disabled', false);
          button.text(originalText);
        }
      }
    });
  }

  /**
   * Build the awaitResult roll payload with real WFRP4e values (BUG-272).
   * wfrp4e is roll-under: SL = tens(target) - tens(roll), success = roll <= target,
   * with automatic success on rolls <=5 (SL floored to +1) and automatic failure on
   * rolls >=96 (SL clamped to -1) — mirrors TestWFRP.computeResult, default SLMethod.
   * Foundry's parser DROPS the `<=NN` clause from the formula and folds any appended
   * modifier into the roll arithmetic, so the d100 value must come from the first die
   * (not roll.total) and the target (base + modifier) is parsed from the formula text.
   * Formulas without a `<=target` clause (custom rolls) report the raw total only.
   */
  private buildRollResultPayload(
    rollFormula: string,
    roll: any
  ): { outcome: string; total: number; SL: number | null; success: boolean | null } {
    const targetMatch = /<=\s*([0-9+\- ]+)$/.exec(rollFormula);
    if (!targetMatch) {
      return { outcome: 'roll_completed', total: roll.total ?? 0, SL: null, success: null };
    }
    // Target expression may carry appended modifiers ("1d100<=50+10" → 60).
    const target = targetMatch[1]!
      .replace(/\s+/g, '')
      .split(/(?=[+-])/)
      .reduce((sum, term) => sum + (parseInt(term, 10) || 0), 0);
    const d100 = roll.dice?.[0]?.total ?? roll.total ?? 0;
    const baseSL = Math.floor(target / 10) - Math.floor(d100 / 10);
    const success = d100 <= 5 || (d100 < 96 && d100 <= target);
    const SL = success
      ? (d100 <= 5 && baseSL < 1 ? 1 : baseSL)
      : (d100 >= 96 && baseSL > -1 ? -1 : baseSL);
    return { outcome: 'roll_completed', total: d100, SL, success };
  }

  /**
   * Get enhanced creature index for campaign analysis
   */
  async getEnhancedCreatureIndex(): Promise<any[]> {
    this.validateFoundryState();

    // Get the enhanced creature index (builds if needed)
    const enhancedCreatures = await this.persistentIndex.getEnhancedIndex();

    return enhancedCreatures || [];
  }

  /**
   * Save roll button state to persistent storage
   */
  async saveRollState(buttonId: string, userId: string): Promise<void> {
    // LEGACY METHOD - Redirecting to new ChatMessage.update() system

    try {
      // Use the new ChatMessage.update() approach instead
      const rollLabel = 'Legacy Roll'; // We don't have the label here, use generic
      await this.updateRollButtonMessage(buttonId, userId, rollLabel);
    } catch (error) {
      console.error(`[${MODULE_ID}] Legacy saveRollState redirect failed:`, error);
      // Don't throw - we don't want to break the old system completely
    }
  }

  /**
   * Get roll button state from persistent storage
   */
  getRollState(buttonId: string): { rolled: boolean; rolledBy?: string; rolledByName?: string; timestamp?: number } | null {
    this.validateFoundryState();

    try {
      const rollStates = game.settings.get(MODULE_ID, 'rollStates') || {};
      return rollStates[buttonId] || null;
    } catch (error) {
      console.error(`[${MODULE_ID}] Error getting roll state:`, error);
      return null;
    }
  }

  /**
   * Save button ID to message ID mapping for ChatMessage updates
   */
  saveRollButtonMessageId(buttonId: string, messageId: string): void {
    try {
      const buttonMessageMap = game.settings.get(MODULE_ID, 'buttonMessageMap') || {};
      buttonMessageMap[buttonId] = messageId;
      void game.settings.set(MODULE_ID, 'buttonMessageMap', buttonMessageMap);
    } catch (error) {
      console.error(`[${MODULE_ID}] Error saving button-message mapping:`, error);
    }
  }

  /**
   * Get message ID for a roll button
   */
  getRollButtonMessageId(buttonId: string): string | null {
    try {
      const buttonMessageMap = game.settings.get(MODULE_ID, 'buttonMessageMap') || {};
      return buttonMessageMap[buttonId] || null;
    } catch (error) {
      console.error(`[${MODULE_ID}] Error getting button-message mapping:`, error);
      return null;
    }
  }

  /**
   * Get roll button state from ChatMessage flags
   */
  getRollStateFromMessage(chatMessage: any, buttonId: string): any {
    try {
      const rollButtons = chatMessage.getFlag(MODULE_ID, 'rollButtons');
      return rollButtons?.[buttonId] || null;
    } catch (error) {
      console.error(`[${MODULE_ID}] Error getting roll state from message:`, error);
      return null;
    }
  }

  /**
   * Update the ChatMessage to replace button with rolled state
   */
  async updateRollButtonMessage(buttonId: string, userId: string, rollLabel: string): Promise<void> {
    try {

      // Get the message ID for this button
      const messageId = this.getRollButtonMessageId(buttonId);

      if (!messageId) {
        throw new Error(`No message ID found for button ${buttonId}`);
      }

      // Get the chat message
      const chatMessage = game.messages?.get(messageId);

      if (!chatMessage) {
        throw new Error(`ChatMessage ${messageId} not found`);
      }

      const rolledByName = game.users?.get(userId)?.name || 'Unknown';
      const timestamp = new Date().toLocaleString();

      // Check permissions before attempting update
      const canUpdate = chatMessage.canUserModify(game.user, 'update');

      if (!canUpdate && !game.user?.isGM) {
        // Non-GM user cannot update message - request GM to do it via socket

        // Find online GM
        const onlineGM = game.users?.find(u => u.isGM && u.active);
        if (!onlineGM) {
          throw new Error('No Game Master is online to update the chat message');
        }

        // Send socket request to GM
        if (game.socket) {
          // BUG-274: game.user may be null; use optional access.
          game.socket.emit('module.warhammer-mcp', {
            type: 'requestMessageUpdate',
            buttonId: buttonId,
            userId: userId,
            rollLabel: rollLabel,
            messageId: messageId,
            fromUserId: game.user?.id,
            targetGM: onlineGM.id
          });
          return; // Exit early - GM will handle the update
        } else {
          throw new Error('Socket not available for GM communication');
        }
      }

      // Update the message flags to mark button as rolled
      const currentFlags = chatMessage.flags || {};
      const moduleFlags = currentFlags[MODULE_ID] || {};
      const rollButtons = moduleFlags.rollButtons || {};

      rollButtons[buttonId] = {
        ...rollButtons[buttonId],
        rolled: true,
        rolledBy: userId,
        rolledByName: rolledByName,
        timestamp: Date.now()
      };

      // Create the rolled state HTML
      const rolledHtml = `
        <div class="mcp-roll-request" style="margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background: #f9f9f9;">
          <p><strong>Roll Request:</strong> ${rollLabel}</p>
          <p><strong>Status:</strong> ✅ <strong>Completed by ${rolledByName}</strong> at ${timestamp}</p>
        </div>
      `;


      // Update the message content and flags
      await chatMessage.update({
        content: rolledHtml,
        flags: {
          ...currentFlags,
          [MODULE_ID]: {
            ...moduleFlags,
            rollButtons: rollButtons
          }
        }
      });


    } catch (error) {
      console.error(`[${MODULE_ID}] Error updating roll button message:`, error);
      console.error(`[${MODULE_ID}] Error stack:`, error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  /**
   * Request GM to save roll state (for non-GM users who can't write to world settings)
   */
  requestRollStateSave(buttonId: string, userId: string): void {
    // LEGACY METHOD - Redirecting to new ChatMessage.update() system

    try {
      // Use the new ChatMessage.update() approach instead
      const rollLabel = 'Legacy Roll'; // We don't have the label here, use generic
      this.updateRollButtonMessage(buttonId, userId, rollLabel)
        .then(() => {
        })
        .catch((error) => {
          console.error(`[${MODULE_ID}] Legacy requestRollStateSave redirect failed:`, error);
          // If the new system fails, just log it - don't use the old socket system
        });
    } catch (error) {
      console.error(`[${MODULE_ID}] Error in legacy requestRollStateSave redirect:`, error);
    }
  }

  /**
   * Broadcast roll state change to all connected users for real-time sync
   */
  broadcastRollState(_buttonId: string, _rollState: any): void {
    // LEGACY METHOD - No longer needed with ChatMessage.update() system
    // ChatMessage.update() automatically broadcasts to all clients, so this method is no longer needed
  }

  /**
   * Clean up old roll states (optional maintenance)
   * Removes roll states older than 30 days to prevent storage bloat
   */
  async cleanOldRollStates(): Promise<number> {
    this.validateFoundryState();

    try {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const rollStates = game.settings.get(MODULE_ID, 'rollStates') || {};
      let cleanedCount = 0;

      // Remove old roll states
      for (const [buttonId, rollState] of Object.entries(rollStates)) {
        if (rollState && typeof rollState === 'object' && 'timestamp' in rollState) {
          const timestamp = (rollState as any).timestamp;
          if (typeof timestamp === 'number' && timestamp < thirtyDaysAgo) {
            delete rollStates[buttonId];
            cleanedCount++;
          }
        }
      }

      if (cleanedCount > 0) {
        await game.settings.set(MODULE_ID, 'rollStates', rollStates);
      }

      return cleanedCount;
    } catch (error) {
      console.error(`[${MODULE_ID}] Error cleaning old roll states:`, error);
      return 0;
    }
  }

  // Phase 1 mcp_crud_expansion (2026-05-14): the actor-only `setActorOwnership`
  // and `getActorOwnership` methods that lived here are removed. The polymorphic
  // replacements live in `handlers/ownership.ts` and are dispatched from
  // queries.ts. The deprecation wrappers in queries.ts now strict-parse legacy
  // input and return a deprecation error pointing at the new surface.

  /**
   * Find actor by name or ID
   */
  private findActorByIdentifier(identifier: string): any {
    return game.actors?.get(identifier) ||
      game.actors?.getName(identifier) ||
      Array.from(game.actors?.values() || []).find((a: any) =>
        a.name?.toLowerCase().includes(identifier.toLowerCase())
      );
  }

  /**
   * Get friendly NPCs from current scene
   */
  async getFriendlyNPCs(): Promise<Array<{ id: string, name: string }>> {
    this.validateFoundryState();

    try {
      const scene = game.scenes?.find(s => s.active);
      if (!scene) {
        return [];
      }

      const friendlyTokens = scene.tokens.filter((token: any) =>
        token.disposition === 1 // FRIENDLY disposition
      );

      return friendlyTokens.map((token: any) => ({
        id: token.actor?.id || token.id || '',
        name: token.name || token.actor?.name || 'Unknown',
      })).filter(t => t.id);
    } catch (error) {
      console.error(`[${MODULE_ID}] Error getting friendly NPCs:`, error);
      return [];
    }
  }

  /**
   * Get party characters (player-owned actors)
   */
  async getPartyCharacters(): Promise<Array<{ id: string, name: string }>> {
    this.validateFoundryState();

    try {
      const partyCharacters = Array.from(game.actors?.values() || []).filter((actor: any) =>
        actor.hasPlayerOwner && actor.type === 'character'
      );

      return partyCharacters.map((actor: any) => ({
        id: actor.id || '',
        name: actor.name || 'Unknown',
      })).filter(c => c.id);
    } catch (error) {
      console.error(`[${MODULE_ID}] Error getting party characters:`, error);
      return [];
    }
  }

  /**
   * Get connected players (excluding GM)
   */
  async getConnectedPlayers(): Promise<Array<{ id: string, name: string }>> {
    this.validateFoundryState();

    try {
      const connectedPlayers = Array.from(game.users?.values() || []).filter((user: any) =>
        user.active && !user.isGM
      );

      return connectedPlayers.map((user: any) => ({
        id: user.id || '',
        name: user.name || 'Unknown',
      })).filter(u => u.id);
    } catch (error) {
      console.error(`[${MODULE_ID}] Error getting connected players:`, error);
      return [];
    }
  }

  /**
   * Find players by identifier with partial matching
   */
  async findPlayers(data: { identifier: string; allowPartialMatch?: boolean; includeCharacterOwners?: boolean }): Promise<Array<{ id: string, name: string }>> {
    this.validateFoundryState();

    try {
      const { identifier, allowPartialMatch = true, includeCharacterOwners = true } = data;
      const searchTerm = identifier.toLowerCase();
      const players = [];

      // Direct user name matching
      for (const user of Array.from(game.users?.values() || [])) {
        if ((user as any).isGM) continue;

        const userName = (user as any).name?.toLowerCase() || '';
        if (userName === searchTerm || (allowPartialMatch && userName.includes(searchTerm))) {
          players.push({ id: (user as any).id || '', name: (user as any).name || 'Unknown' });
        }
      }

      // Character name matching (find owner of character)
      if (includeCharacterOwners && players.length === 0) {
        for (const actor of Array.from(game.actors?.values() || [])) {
          if ((actor as any).type !== 'character') continue;

          const actorName = (actor as any).name?.toLowerCase() || '';
          if (actorName === searchTerm || (allowPartialMatch && actorName.includes(searchTerm))) {
            // Find the player owner of this character
            const owner = Array.from(game.users?.values() || []).find((user: any) =>
              (actor as any).testUserPermission(user, 'OWNER') && !user.isGM
            );

            if (owner && !players.some(p => p.id === (owner as any).id)) {
              players.push({ id: (owner as any).id || '', name: (owner as any).name || 'Unknown' });
            }
          }
        }
      }

      return players.filter(p => p.id);
    } catch (error) {
      console.error(`[${MODULE_ID}] Error finding players:`, error);
      return [];
    }
  }

  /**
   * Find single actor by identifier
   */
  async findActor(data: { identifier: string }): Promise<{ id: string, name: string } | null> {
    this.validateFoundryState();

    try {
      const actor = this.findActorByIdentifier(data.identifier);
      return actor ? { id: actor.id, name: actor.name } : null;
    } catch (error) {
      console.error(`[${MODULE_ID}] Error finding actor:`, error);
      return null;
    }
  }

  // Private storage for tracking roll button processing states
  private rollButtonProcessingStates: Map<string, boolean> = new Map();

  /**
   * Check if a roll button is currently being processed
   */
  private isRollButtonProcessing(buttonId: string): boolean {
    return this.rollButtonProcessingStates.get(buttonId) || false;
  }

  /**
   * Set roll button processing state
   */
  private setRollButtonProcessing(buttonId: string, processing: boolean): void {
    if (processing) {
      this.rollButtonProcessingStates.set(buttonId, true);
    } else {
      this.rollButtonProcessingStates.delete(buttonId);
    }
  }

  /**
   * Get or create a folder for organizing MCP-generated content
   */
  private async getOrCreateFolder(folderName: string, type: 'Actor' | 'JournalEntry'): Promise<string | null> {
    try {
      // Look for existing folder
      const existingFolder = game.folders?.find((f: any) =>
        f.name === folderName && f.type === type
      );

      if (existingFolder) {
        return existingFolder.id;
      }

      // Create appropriate descriptions
      let description = '';
      if (type === 'Actor') {
        if (folderName === 'Foundry MCP Creatures') {
          description = 'Creatures and monsters created via Foundry MCP Bridge';
        } else {
          description = `NPCs and creatures related to: ${folderName}`;
        }
      } else {
        description = `Quest and content for: ${folderName}`;
      }

      // Create new folder
      const folderData = {
        name: folderName,
        type: type,
        description: description,
        color: type === 'Actor' ? '#4a90e2' : '#f39c12', // Blue for actors, orange for journals
        sort: 0,
        parent: null,
        flags: {
          'foundry-mcp-bridge': {
            mcpGenerated: true,
            createdAt: new Date().toISOString(),
            questContext: type === 'JournalEntry' ? folderName : undefined
          }
        }
      };

      const folder = await Folder.create(folderData);
      if (folder) notify.created('folder', folderName);
      return folder?.id || null;
    } catch (error) {
      console.warn(`[${this.moduleId}] Failed to create folder "${folderName}":`, error);
      // Return null so items are created without folders rather than failing
      return null;
    }
  }

  /**
   * List all scenes with filtering options
   * TOOL-IDEA-001 (2026-05-14): pagination + count-only mode. Bare-array response
   * preserved when none of page/pageSize/countOnly is provided (back-compat).
   * When any pagination param is set, returns `{total, page, pageSize, pageCount, scenes}`.
   * When countOnly is set, returns `{total, filterApplied}` only.
   */
  async listScenes(options: {
    filter?: string;
    include_active_only?: boolean;
    page?: number;
    pageSize?: number;
    countOnly?: boolean;
  } = {}): Promise<any> {
    this.validateFoundryState();

    try {
      let scenes = game.scenes?.contents || [];

      // Filter by active only if requested
      if (options.include_active_only) {
        scenes = scenes.filter((scene: any) => scene.active);
      }

      // Filter by name if provided
      if (options.filter) {
        const filterLower = options.filter.toLowerCase();
        scenes = scenes.filter((scene: any) =>
          scene.name.toLowerCase().includes(filterLower)
        );
      }

      const total = scenes.length;
      const filterApplied = !!(options.filter || options.include_active_only);

      // Count-only short-circuit: caller wants to probe inventory size before paging.
      if (options.countOnly) {
        return { total, filterApplied };
      }

      const projectScene = (scene: any) => ({
        id: scene.id,
        name: scene.name,
        active: scene.active,
        dimensions: {
          width: scene.dimensions?.width || (scene as any).width || 0,
          height: scene.dimensions?.height || (scene as any).height || 0
        },
        gridSize: scene.grid?.size || 100,
        background: scene.background?.src || scene.img || '',
        walls: scene.walls?.size || 0,
        tokens: scene.tokens?.size || 0,
        lighting: scene.lights?.size || 0,
        sounds: scene.sounds?.size || 0,
        navigation: scene.navigation || false
      });

      const paginate = options.page !== undefined || options.pageSize !== undefined;
      if (paginate) {
        const pageSize = options.pageSize ?? 50;
        const page = options.page ?? 1;
        const start = (page - 1) * pageSize;
        const pageScenes = scenes.slice(start, start + pageSize).map(projectScene);
        return {
          total,
          page,
          pageSize,
          pageCount: Math.max(1, Math.ceil(total / pageSize)),
          scenes: pageScenes,
        };
      }

      // Back-compat: bare array when no pagination/count params are set.
      return scenes.map(projectScene);
    } catch (error) {
      throw new Error(`Failed to list scenes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Switch to a different scene
   */
  async switchScene(options: { scene_identifier: string; optimize_view?: boolean | undefined }): Promise<any> {
    this.validateFoundryState();

    try {
      // Find the target scene by ID or name
      const scenes = game.scenes?.contents || [];
      const targetScene = scenes.find((scene: any) =>
        scene.id === options.scene_identifier ||
        scene.name.toLowerCase() === options.scene_identifier.toLowerCase()
      );

      if (!targetScene) {
        throw new Error(`Scene not found: "${options.scene_identifier}"`);
      }

      // Activate the scene
      await targetScene.activate();

      // Optimize view if requested (default true)
      if (options.optimize_view !== false && typeof canvas !== 'undefined' && canvas?.scene) {
        const dimensions = targetScene.dimensions || {
          width: (targetScene as any).width || 0,
          height: (targetScene as any).height || 0
        };
        const width = (dimensions as any).width || 0;
        const height = (dimensions as any).height || 0;

        if (width && height) {
          // Center the view on the scene (canvas.pan is synchronous in v13 — no await)
          canvas.pan({
            x: width / 2,
            y: height / 2,
            scale: Math.min(
              (canvas as any).screenDimensions?.[0] / width || 1,
              (canvas as any).screenDimensions?.[1] / height || 1,
              1
            )
          });
        }
      }

      return {
        success: true,
        sceneId: targetScene.id,
        sceneName: targetScene.name,
        dimensions: {
          width: (targetScene.dimensions as any)?.width || (targetScene as any).width || 0,
          height: (targetScene.dimensions as any)?.height || (targetScene as any).height || 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to switch scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new actor
   * Creates an actor with the provided data structure.
   * HC9: optional `options` bag plumbed to Actor.create(data, options) — supports
   * `skipItems` to suppress wfrp4e _preCreate basic-skills dialog (mirror of BUG-089).
   */
  async createActor(data: { actorData: Record<string, any>; options?: { skipItems?: boolean } | undefined }): Promise<any> {
    this.validateFoundryState();

    try {
      const actor = await (Actor as any).create(data.actorData as any, (data.options ?? {}) as any);

      if (!actor) {
        throw new Error('Failed to create actor');
      }

      // Show notification to GM
      notify.created('actor', actor.name, { uuid: (actor as any).uuid });

      return {
        success: true,
        id: actor.id,
        name: actor.name,
        type: actor.type
      };
    } catch (error) {
      throw new Error(`Failed to create actor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Duplicate an existing world actor.
   * Phase 4g primitive — clones source via toObject() with _id/folder/sort stripped,
   * then persists via Actor.create. Preferred for /wfrp-build-npc Branch 2/3 (NPC-type
   * templates) to avoid compendium re-cloning.
   */
  async duplicateActor(data: { sourceActorId: string; newName?: string | undefined }): Promise<any> {
    this.validateFoundryState();

    try {
      const source = game.actors?.get(data.sourceActorId);
      if (!source) {
        throw new Error(`Source actor not found with ID: ${data.sourceActorId}`);
      }

      const actorData: any = (source as any).toObject();
      delete actorData._id;
      delete actorData.folder;
      delete actorData.sort;
      if (data.newName) {
        actorData.name = data.newName;
        // Sync the prototype-token name too. toObject() copies the source's
        // prototypeToken (including its name), and Foundry's Actor._preCreate
        // will NOT override a non-default token name — so without this, tokens
        // dragged to the canvas show the source actor's name (e.g. "Human").
        if (actorData.prototypeToken) actorData.prototypeToken.name = data.newName;
      }

      const actor = await (Actor as any).create(actorData);
      if (!actor) {
        throw new Error('Actor.create returned no actor');
      }

      notify.created('actor', actor.name, { summary: `duplicated from ${source.name}`, uuid: (actor as any).uuid });

      return {
        success: true,
        id: actor.id,
        name: actor.name,
        type: actor.type
      };
    } catch (error) {
      throw new Error(`Failed to duplicate actor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Apply a career's auto-advancement to an NPC-type actor without opening the
   * wfrp4e confirmation dialog. Invokes StandardActorModel.advance(career)
   * (wfrp4e.js:6623), which constructs a new Advancement and calls its dialog-free
   * advance() method (wfrp4e.js:2619 — characteristic + skill + talent stamping,
   * no DialogV2). The Advancement class is module-local and not exposed on
   * game.wfrp4e.apps, so the actor.system.advance() entry point is the only path.
   */
  /**
   * List all embedded items on an actor with raw IDs. Read-only surface for
   * skill/talent ID lookups (/wfrp-build-npc Branch 3 uses this to find
   * auto-populated basic skill items before calling update-item on their
   * system.advances.value path).
   */
  async listActorItems(data: { actorId: string; typeFilter?: string | undefined }): Promise<any> {
    this.validateFoundryState();

    try {
      const actor = game.actors?.get(data.actorId);
      if (!actor) {
        throw new Error(`Actor not found with ID: ${data.actorId}`);
      }

      const allItems = Array.from((actor as any).items || []).map((i: any) => ({
        id: i.id,
        name: i.name,
        type: i.type,
        advances: i.system?.advances?.value ?? null,
        specification: i.system?.specification?.value ?? null,
      }));

      const items = data.typeFilter
        ? allItems.filter((i: any) => i.type === data.typeFilter)
        : allItems;

      return {
        success: true,
        actorId: (actor as any).id,
        actorName: (actor as any).name,
        count: items.length,
        items,
      };
    } catch (error) {
      throw new Error(`Failed to list actor items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async applyNpcCareerAdvance(data: { actorId: string; careerItemId: string }): Promise<any> {
    this.validateFoundryState();

    try {
      const actor = game.actors?.get(data.actorId);
      if (!actor) {
        throw new Error(`Actor not found with ID: ${data.actorId}`);
      }

      if ((actor as any).type !== 'npc') {
        throw new Error(`applyNpcCareerAdvance requires an npc-type actor; got "${(actor as any).type}" for actor ${actor.name}`);
      }

      const career = (actor as any).items?.get(data.careerItemId);
      if (!career) {
        throw new Error(`Career item "${data.careerItemId}" not found on actor ${actor.name}`);
      }
      if ((career as any).type !== 'career') {
        throw new Error(`Item "${data.careerItemId}" on actor ${actor.name} is type "${(career as any).type}", expected "career"`);
      }

      const model: any = (actor as any).system;
      if (typeof model?.advance !== 'function') {
        throw new Error(`Actor ${actor.name} (type ${(actor as any).type}) has no system.advance method; wfrp4e system may have changed`);
      }

      // BUG-217: StandardActorModel.advance() is synchronous but fire-and-forgets async actor.update().
      // HC1: bare `await model.advance()` is a NON-FIX (returns undefined). Observer pattern mirrors
      // updateActor:4231-4234 exactly — register BEFORE the sync call, await AFTER.
      const commitObserved = this.waitForActorUpdateCommit(String(actor.id), 250);
      model.advance(career);
      await commitObserved;

      // BUG-218: re-read actor + career after commit to confirm persistence.
      const fresh = game.actors?.get(data.actorId);
      const freshCareer = fresh?.items?.get(data.careerItemId);
      if (!fresh || !freshCareer) {
        throw new Error(`APPLY_NPC_CAREER_ADVANCE_NOT_PERSISTED: actor ${data.actorId} or career ${data.careerItemId} missing after advance`);
      }

      notify.updated('actor', fresh.name ?? 'unknown', { summary: `advancing via ${freshCareer.name}`, uuid: (fresh as any).uuid });

      return {
        success: true,
        actorId: fresh.id,
        actorName: fresh.name,
        careerItemId: freshCareer.id,
        careerName: freshCareer.name,
        careerLevel: (freshCareer as any).system?.level?.value ?? null
      };
    } catch (error) {
      throw new Error(`Failed to apply NPC career advance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 4h — server-side reimplementation of TemplateModel.apply (wfrp4e.js:32647).
  // Bypasses the 5 interactive dialogs (skill-group, skill-spec, lore, spells, trappings)
  // by either honoring preResolvedChoices or picking deterministically-random leaves.
  // Embeds resolved child items with options.fromTemplate → wfrp4e ItemWFRP4e._preCreate
  // (wfrp4e.js:9243) auto-stamps flags.wfrp4e.fromTemplate for undo symmetry.
  //
  // Post-prototype-sheet refactor: this method resolves the world actor + template,
  // then delegates the heavy lifting to `_runTemplateApply`. Its sibling
  // `applyTemplateToToken` resolves a synthetic actor from a token delta and shares
  // the same core. Keep behavior identical for world-actor callers.
  async applyTemplate(data: {
    actorId: string;
    templateUuid: string;
    preResolvedChoices?: {
      skillGroups?: Record<string, string> | undefined;
      talentGroups?: Record<string, string> | undefined;
      specialisations?: Record<string, string[]> | undefined;
      lores?: string[] | undefined;
      spells?: Record<string, string[]> | undefined;
      trappings?: Record<string, string> | undefined;
    } | undefined;
  }): Promise<any> {
    this.validateFoundryState();

    try {
      const actor = game.actors?.get(data.actorId);
      if (!actor) {
        throw new Error(`Actor not found with ID: ${data.actorId}`);
      }

      const template = await this.resolveTemplateDoc(data.templateUuid);
      if (!template) {
        throw new Error(`Template not found for uuid/id: ${data.templateUuid}`);
      }
      if ((template as any).type !== 'template') {
        throw new Error(`Item "${data.templateUuid}" is type "${(template as any).type}", expected "template"`);
      }

      const templateId: string = (template as any).id ?? data.templateUuid;
      return await this._runTemplateApply(actor, template, templateId, data.preResolvedChoices ?? {});
    } catch (error) {
      throw new Error(`Failed to apply template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Token-delta variant: resolves the synthetic actor from a token's ActorDelta and
  // applies the template into that delta. World actor stays untouched; sibling tokens
  // (sharing the same world base) are unaffected. Rejects actorLink=true tokens because
  // their delta is a passthrough — writes would appear to succeed but actually mutate
  // the world actor, which is the opposite of what the caller asked for.
  async applyTemplateToToken(data: {
    sceneId: string;
    tokenId: string;
    templateUuid: string;
    preResolvedChoices?: {
      skillGroups?: Record<string, string> | undefined;
      talentGroups?: Record<string, string> | undefined;
      specialisations?: Record<string, string[]> | undefined;
      lores?: string[] | undefined;
      spells?: Record<string, string[]> | undefined;
      trappings?: Record<string, string> | undefined;
    } | undefined;
  }): Promise<any> {
    this.validateFoundryState();

    try {
      const scene: any = (globalThis as any).game?.scenes?.get(data.sceneId);
      if (!scene) {
        throw new Error(`Scene not found with ID: ${data.sceneId}`);
      }
      const tokenDoc: any = scene.tokens?.get(data.tokenId);
      if (!tokenDoc) {
        throw new Error(`Token not found on scene "${scene.name}": ${data.tokenId}`);
      }
      if (tokenDoc.actorLink === true) {
        throw new Error(
          `Token "${data.tokenId}" is linked (actorLink=true); writes to its delta have no effect. ` +
          `Use apply-template with the world actor ID (${tokenDoc.actorId}) instead.`,
        );
      }
      const actor: any = tokenDoc.actor;
      if (!actor) {
        throw new Error(`Token "${data.tokenId}" has no synthetic actor`);
      }

      const template = await this.resolveTemplateDoc(data.templateUuid);
      if (!template) {
        throw new Error(`Template not found for uuid/id: ${data.templateUuid}`);
      }
      if ((template as any).type !== 'template') {
        throw new Error(`Item "${data.templateUuid}" is type "${(template as any).type}", expected "template"`);
      }

      const templateId: string = (template as any).id ?? data.templateUuid;

      // Redirect template-triggered condition scripts away from the world actor.
      const baseActor: any = (globalThis as any).game?.actors?.get(tokenDoc.actorId);
      let restoreAddCondition: (() => void) | null = null;
      if (baseActor && baseActor !== actor && typeof baseActor.addCondition === 'function') {
        const originalAddCondition = baseActor.addCondition;
        baseActor.addCondition = async (...args: any[]) => {
          const tokenActor: any = tokenDoc.actor;
          if (tokenActor && tokenActor !== baseActor && typeof tokenActor.addCondition === 'function') {
            return await tokenActor.addCondition(...args);
          }
          return await originalAddCondition.apply(baseActor, args as any);
        };
        restoreAddCondition = () => {
          baseActor.addCondition = originalAddCondition;
        };
      }

      let result: any;
      try {
        result = await this._runTemplateApply(actor, template, templateId, data.preResolvedChoices ?? {});
      } finally {
        if (restoreAddCondition) restoreAddCondition();
      }

      // TokenDocument.name is captured at add-actors-to-scene time from the base
      // actor ("Goblin") and never re-reads from the delta. Sync it here + replicate
      // Foundry's create-time auto-numbering (which only fires at drop, not after
      // rename). Skip entirely when the template has no alterName so non-renaming
      // templates (Chaos Knight, Druchii Sorceress) keep the drop-time suffix.
      // Token-delta sibling of BUG-053.
      const tplSys = (template as any).system ?? {};
      const alterPre = (tplSys.alterName?.pre ?? '').trim();
      const alterPost = (tplSys.alterName?.post ?? '').trim();
      const templateRenames = alterPre.length > 0 || alterPost.length > 0;
      const appliedName = result?.applied?.name;
      if (templateRenames && typeof appliedName === 'string' && appliedName.length > 0) {
        const siblingCount = Array.from(scene.tokens?.values() ?? []).filter((t: any) => {
          if (!t || t.id === data.tokenId) return false;
          const n = t.name ?? '';
          return n === appliedName || n.startsWith(`${appliedName} (`);
        }).length;
        // BUG-055 contract (see apply-template-to-token.test.ts): always suffix,
        // singleton → "(1)". BUG-277 proposed dropping the singleton suffix but was
        // rejected — the (1) is a deliberate replication of create-time auto-numbering.
        const numberedName = `${appliedName} (${siblingCount + 1})`;
        if (numberedName !== tokenDoc.name) {
          await tokenDoc.update({ name: numberedName });
        }
      }

      notify.updated('token', tokenDoc.name ?? actor.name, {
        summary: `applied template ${(template as any).name}`,
        uuid: tokenDoc.uuid,
        tooltip: { tokenDoc, message: `+${(template as any).name}` },
      });

      return { ...result, sceneId: data.sceneId, tokenId: data.tokenId };
    } catch (error) {
      throw new Error(`Failed to apply template to token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Core template application. Works on any actor-shaped document (world Actor OR
  // synthetic token-delta actor). Callers are responsible for resolving + validating
  // the actor, template, and templateId (falls back to data.templateUuid when template.id
  // is absent, preserving pre-refactor behavior).
  private async _runTemplateApply(
    actor: any,
    template: any,
    templateId: string,
    choices: {
      skillGroups?: Record<string, string> | undefined;
      talentGroups?: Record<string, string> | undefined;
      specialisations?: Record<string, string[]> | undefined;
      lores?: string[] | undefined;
      spells?: Record<string, string[]> | undefined;
      trappings?: Record<string, string> | undefined;
    },
  ): Promise<any> {
    const sys: any = (template as any).system;
    const rng = (): number => Math.random();
    const pick = <T,>(arr: T[]): T | undefined => (arr.length === 0 ? undefined : arr[Math.floor(rng() * arr.length)]);

    // --- name + characteristics (single update payload) ---
    const pre = (sys.alterName?.pre ?? '').trim();
    const post = (sys.alterName?.post ?? '').trim();
    const newName = `${pre} ${actor.name} ${post}`.trim().replace(/\s+/g, ' ');

    const updateData: Record<string, any> = {};
    // BUG-275: only write name fields when the template actually renames the actor, and
    // never write prototypeToken.name on synthetic token-delta actors (causes DataModelValidationError).
    if (newName !== actor.name) {
      updateData['name'] = newName;
      if (!actor.isToken) {
        updateData['prototypeToken.name'] = newName;
      }
    }
    const characteristicDeltas: Record<string, number> = {};
    const chars = sys.characteristics ?? {};
    for (const key of ['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel']) {
      const delta = chars[key];
      if (typeof delta === 'number' && delta !== 0) {
        characteristicDeltas[key] = delta;
        const current = Number(foundry.utils.getProperty(actor, `system.characteristics.${key}.advances`)) || 0;
        updateData[`system.characteristics.${key}.advances`] = current + delta;
      }
    }

    // --- skills: group collapse, spec expansion ---
    const skillList: Array<{ name: string; advances: number; group?: number | null; specialisations?: number | null }> =
      (sys.skills?.list ?? []).map((s: any) => ({ ...s }));

    // Group collapse: if multiple entries share a group, pick one (or honor override).
    const ungroupedSkills = skillList.filter(s => s.group == null);
    const skillGroupIds = Array.from(new Set(skillList.filter(s => s.group != null).map(s => String(s.group))));
    const collapsedSkillGroups: typeof skillList = [];
    for (const gid of skillGroupIds) {
      const members = skillList.filter(s => String(s.group) === gid);
      const override = choices.skillGroups?.[gid];
      const chosen = (override && members.find(m => m.name === override)) || pick(members);
      if (chosen) collapsedSkillGroups.push(chosen);
    }
    let resolvedSkills: typeof skillList = ungroupedSkills.concat(collapsedSkillGroups);

    // Spec expansion: skills with specialisations > 1 get expanded to N concrete skill entries.
    const specExpansions: typeof skillList = [];
    for (const s of resolvedSkills) {
      if ((s.specialisations ?? 0) > 1) {
        const overrides = choices.specialisations?.[s.name];
        let picks: string[];
        if (overrides && overrides.length === s.specialisations) {
          picks = overrides;
        } else {
          const allSkills: any[] = (await (globalThis as any).warhammer?.utility?.findAllItems?.('skill', 'Loading Skills')) ?? [];
          // BUG-278: dedupe candidates by name before the loop so used.size can reach
          // candidates.length and the break fires, preventing an infinite spin on duplicates.
          const seenNames = new Set<string>();
          const candidates = allSkills.filter((i: any) => {
            if (i.baseName !== s.name) return false;
            if (seenNames.has(i.name)) return false;
            seenNames.add(i.name);
            return true;
          });
          const used = new Set<string>();
          picks = [];
          while (picks.length < (s.specialisations ?? 1) && candidates.length > 0) {
            const c = pick(candidates);
            if (c && !used.has((c as any).name)) {
              used.add((c as any).name);
              picks.push((c as any).name);
            }
            if (used.size === candidates.length) break;
          }
        }
        for (const p of picks) {
          specExpansions.push({ name: p, advances: s.advances });
        }
      }
    }
    resolvedSkills = resolvedSkills
      .filter(s => !((s.specialisations ?? 0) > 1))
      .concat(specExpansions);

    // --- lore pick (BUG-051: hoisted above skills so `Channelling (Any)` can correlate) ---
    const loreList: Array<{ name: string; number: number }> = (sys.lores?.list ?? []).map((l: any) => ({ ...l }));
    const magicLoresConfig: Record<string, string> = (globalThis as any).game?.wfrp4e?.config?.magicLores ?? {};
    const loreDisplayValues = Object.values(magicLoresConfig) as string[];
    const resolvedLoreNames: string[] = [];
    for (let i = 0; i < loreList.length; i++) {
      const l = loreList[i]!;
      let name = l.name;
      if (name === '*') {
        const override = choices.lores?.[i];
        name = override || (loreDisplayValues.length > 0 ? (pick(loreDisplayValues) as string) : '');
      }
      resolvedLoreNames.push(name);
    }

    // --- trappings resolved BEFORE skills (BUG-051: weapon-group leaks into `Melee (Any)` spec) ---
    const trappingItems = await this.walkTrappingsTree(sys.trappings, actor, choices, resolvedSkills);
    const pickedWeaponGroups: string[] = [];
    for (const it of trappingItems) {
      const wg = foundry.utils.getProperty(it, 'system.weaponGroup.value');
      if (typeof wg === 'string' && wg.length > 0) pickedWeaponGroups.push(wg);
    }

    // --- resolve `(Any)` wildcards in skill names using lore + weapon-group context ---
    const resolveContext = { lores: resolvedLoreNames, weaponGroups: pickedWeaponGroups };
    const wildcardResolvedSkills: typeof resolvedSkills = resolvedSkills.map(s => ({
      ...s,
      name: this.resolveSkillWildcard(s.name, resolveContext, choices),
    }));

    // --- skill compendium lookup (wildcards now concrete) ---
    const skillItems: any[] = [];
    for (const s of wildcardResolvedSkills) {
      const found: any = await (globalThis as any).game?.wfrp4e?.utility?.findSkill?.(s.name);
      if (found) {
        const obj = found.toObject();
        foundry.utils.setProperty(obj, 'system.advances.value', s.advances);
        skillItems.push(obj);
      }
    }

    // --- talents: group collapse + multi-advance duplication ---
    const talentList: Array<{ name: string; advances: number; group?: number | null }> =
      (sys.talents?.list ?? []).map((t: any) => ({ ...t }));
    const ungroupedTalents = talentList.filter(t => t.group == null);
    const talentGroupIds = Array.from(new Set(talentList.filter(t => t.group != null).map(t => String(t.group))));
    const collapsedTalentGroups: typeof talentList = [];
    for (const gid of talentGroupIds) {
      const members = talentList.filter(t => String(t.group) === gid);
      const override = choices.talentGroups?.[gid];
      const chosen = (override && members.find(m => m.name === override)) || pick(members);
      if (chosen) collapsedTalentGroups.push(chosen);
    }
    const resolvedTalents = ungroupedTalents.concat(collapsedTalentGroups);

    const talentItems: any[] = [];
    for (const t of resolvedTalents) {
      const found: any = await (globalThis as any).game?.wfrp4e?.utility?.findTalent?.(t.name);
      if (!found) continue;
      const copies = Math.max(1, t.advances ?? 1);
      for (let i = 0; i < copies; i++) {
        talentItems.push(found.toObject());
      }
    }

    // --- spells (consumes already-picked resolvedLoreNames from above) ---
    const spellItems: any[] = [];
    if (loreList.length > 0) {
      const allSpells: any[] =
        (await (globalThis as any).warhammer?.utility?.findAllItems?.('spell', 'Loading Spells', true, ['system.lore.value'])) ?? [];

      for (let i = 0; i < loreList.length; i++) {
        const lore = loreList[i]!;
        const loreName = resolvedLoreNames[i] ?? '';

        const matching = allSpells.filter((s: any) => {
          const key = s.system?.lore?.value;
          const display = magicLoresConfig[key] ?? key;
          return display === loreName;
        });

        const overrideSpells = choices.spells?.[loreName];
        const picks: any[] = [];
        if (overrideSpells && overrideSpells.length > 0) {
          for (const name of overrideSpells.slice(0, lore.number)) {
            const m = matching.find((s: any) => s.name === name);
            if (m) picks.push(m);
          }
        } else {
          const pool = [...matching];
          for (let k = 0; k < lore.number && pool.length > 0; k++) {
            const idx = Math.floor(rng() * pool.length);
            const [chosen] = pool.splice(idx, 1);
            picks.push(chosen);
          }
        }

        for (const p of picks) {
          spellItems.push(p.toObject ? p.toObject() : p);
        }
      }
    }

    // --- traits (DiffReferenceListModel.awaitDocuments equivalent) ---
    const traitItems: any[] = [];
    const traitEntries: Array<{ uuid: string; diff?: Record<string, unknown> }> = sys.traits?.list ?? [];
    for (const entry of traitEntries) {
      const doc: any = await (globalThis as any).warhammer?.utility?.findItemId?.(entry.uuid);
      if (!doc) continue;
      const obj = doc.toObject();
      if (entry.diff && Object.keys(entry.diff).length > 0) {
        foundry.utils.mergeObject(obj, entry.diff);
      }
      traitItems.push(obj);
    }

    // --- single actor.update + single createEmbeddedDocuments ---
    await actor.update(updateData, { skipExperienceChecks: true } as any);

    const allItems = [...skillItems, ...talentItems, ...spellItems, ...traitItems, ...trappingItems];
    // skipSpecialisationChoice (2026-05-19): the wfrp4e SkillModel._handleSpecialisationChoice
    // hook (wfrp4e.js:28490-28518) opens a UI dialog whenever an isSpec skill (e.g. bare
    // "Channelling") is embedded with an empty specifier, blocking server-side execution
    // until the user picks a wind. wfrp4e itself uses this flag for bulk operations
    // (wfrp4e.js:12653, 18806, 18821). The template walker has no UI; surface this flag here
    // so apply-template runs to completion. Skills with concrete specifiers (e.g.
    // "Channelling (Aqshy)") are unaffected — the flag only short-circuits the dialog when
    // the specifier is empty AND isSpec, which is exactly the unwanted case.
    const created: any[] = (await (actor as any).createEmbeddedDocuments(
      'Item',
      allItems,
      { fromTemplate: templateId, skipSpecialisationChoice: true }
    )) ?? [];

    notify.updated('actor', actor.name, { summary: `applied template ${(template as any).name}`, uuid: (actor as any).uuid });

    return {
      success: true,
      actorId: actor.id,
      actorName: actor.name,
      templateId,
      templateName: (template as any).name,
      applied: {
        name: newName,
        characteristics: characteristicDeltas,
        itemIds: created.map((i: any) => i.id),
        itemsByType: {
          skill: created.filter((i: any) => i.type === 'skill').length,
          talent: created.filter((i: any) => i.type === 'talent').length,
          spell: created.filter((i: any) => i.type === 'spell').length,
          trait: created.filter((i: any) => i.type === 'trait').length,
          trapping: created.filter((i: any) => !['skill', 'talent', 'spell', 'trait'].includes(i.type)).length,
        },
      },
    };
  }

  // Accept either a full UUID (Compendium.pack.Item.id), a bare 16-char id, or a pack-qualified id.
  private async resolveTemplateDoc(uuidOrId: string): Promise<any> {
    if (!uuidOrId) return null;
    const util = (globalThis as any).warhammer?.utility;
    if (util?.findItemId) {
      const doc = await util.findItemId(uuidOrId);
      if (doc) return doc;
    }
    if (uuidOrId.startsWith('Compendium.') && (globalThis as any).fromUuid) {
      return await (globalThis as any).fromUuid(uuidOrId);
    }
    return null;
  }

  // BUG-051 — resolve wfrp4e `(Any)` skill-spec wildcard to a concrete specialisation.
  // BUG-052 (2026-05-16) — widened to also match `( )` (empty), `(*)`, and `(Hysh)`-style
  // single-token placeholders used by owb1 caster templates (Shaman Channelling).
  // Correlates with already-resolved lore (Channelling) and trapping weapon-group (Melee/Ranged).
  // Falls through to name-as-is for unrecognised bases — caller's findSkill may still resolve.
  private resolveSkillWildcard(
    name: string,
    context: { lores: string[]; weaponGroups: string[] },
    choices: { specialisations?: Record<string, string[]> | undefined } = {},
  ): string {
    // Matches: " (Any)", " ( )", " (  )", " (*)" — empty-or-explicit-wildcard markers.
    // Concrete specialisations like " (Polearm)" / " (Aqshy)" are NOT matched and pass through.
    const ANY_SUFFIX = /\s\((?:Any|\s*|\*)\)$/;
    if (!ANY_SUFFIX.test(name)) return name;

    const base = name.replace(ANY_SUFFIX, '');
    const config: any = (globalThis as any).game?.wfrp4e?.config ?? {};

    // Explicit preResolvedChoices override takes priority: specialisations["Melee (Any)"] = ["Basic"].
    const override = choices.specialisations?.[name]?.[0];
    if (override) return `${base} (${override})`;

    if (base === 'Channelling') {
      const lore = context.lores[0];
      if (lore) return `${base} (${lore})`;
      const lores = Object.values(config.magicLores ?? {}) as string[];
      if (lores.length > 0) return `${base} (${lores[Math.floor(Math.random() * lores.length)]})`;
      return name;
    }

    if (base === 'Melee' || base === 'Ranged') {
      const groupToType: Record<string, string> = config.groupToType ?? {};
      const type = base.toLowerCase();
      const ctxMatch = context.weaponGroups.find(g => groupToType[g] === type);
      const eligibleKeys = Object.keys(groupToType).filter(k => groupToType[k] === type);
      const chosenKey = ctxMatch
        ?? (eligibleKeys.length > 0 ? eligibleKeys[Math.floor(Math.random() * eligibleKeys.length)] : null);
      if (!chosenKey) return name;
      const label = chosenKey.charAt(0).toUpperCase() + chosenKey.slice(1);
      return `${base} (${label})`;
    }

    // Other wildcard bases (Entertain (Any), Language (Any), Play (Any), …) fall through unchanged.
    return name;
  }

  // Walk ChoiceModel.structure. "and" → recurse all; "or" → pick one (override or random with skill-weapon bias); "option" → resolve.
  private async walkTrappingsTree(
    trappings: any,
    parent: any,
    choices: any,
    resolvedSkills: Array<{ name: string }>,
  ): Promise<any[]> {
    if (!trappings?.structure || !Array.isArray(trappings.options)) return [];

    const optionsById = new Map<string, any>();
    for (const opt of trappings.options) optionsById.set(opt.id, opt);

    const skillSpecs = new Set(resolvedSkills.map(s => s.name));

    const resolveOption = async (option: any): Promise<any | null> => {
      if (!option) return null;
      if (option.type === 'filter') {
        const util = (globalThis as any).warhammer?.utility ?? (globalThis as any).game?.wfrp4e?.utility;
        const allItems: any[] = (await util?.findAllItems?.('weapon', 'Loading Weapons')) ?? [];
        const match = (item: any): boolean => {
          for (const f of option.filters ?? []) {
            const v = foundry.utils.getProperty(item, f.path);
            if (f.operation === '=' && v !== f.value) return false;
          }
          return true;
        };
        let candidates = allItems.filter(match);
        if (candidates.length === 0) {
          // Fallback: search any item type.
          const wider: any[] = (await util?.findAllItems?.('armour', 'Loading Armour')) ?? [];
          candidates = wider.filter(match);
        }
        if (candidates.length === 0) {
          const placeholderData = (globalThis as any).game?.wfrp4e?.config?.placeholderItemData ?? { type: 'trapping' };
          return foundry.utils.mergeObject({ name: option.name ?? 'Unknown' }, placeholderData);
        }
        const chosen: any = candidates[Math.floor(Math.random() * candidates.length)];
        return chosen.toObject ? chosen.toObject() : chosen;
      }
      if (option.type === 'placeholder') {
        const placeholderData = (globalThis as any).game?.wfrp4e?.config?.placeholderItemData ?? { type: 'trapping' };
        return foundry.utils.mergeObject({ name: option.name ?? 'Placeholder' }, placeholderData);
      }
      if (option.idType === 'id' || option.idType === 'uuid') {
        const doc: any = await (globalThis as any).warhammer?.utility?.findItemId?.(option.documentId);
        if (!doc) return null;
        const obj = doc.toObject ? doc.toObject() : doc;
        if (option.diff && Object.keys(option.diff).length > 0) {
          foundry.utils.mergeObject(obj, option.diff);
        }
        return obj;
      }
      if (option.idType === 'relative') {
        // BUG-264: relative documentId format is "Type.id" (e.g. "ActiveEffect.xyz456").
        // split[0] is the doc type; split[1] is the id.
        const split = String(option.documentId ?? '').split('.');
        if (split[0] === 'ActiveEffect') {
          const eff = parent.effects?.get?.(split[1]);
          return eff?.toObject ? eff.toObject() : null;
        }
        const it = parent.items?.get?.(split[1]);
        return it?.toObject ? it.toObject() : null;
      }
      return null;
    };

    const pickOrBranch = (node: any): any | undefined => {
      const override = choices.trappings?.[node.id];
      if (override) {
        const overridden = node.options?.find((c: any) => c.id === override);
        if (overridden) return overridden;
      }
      // Skill-weapon correlation: if an OR branch is a filter whose weaponGroup value
      // matches a resolved skill specialisation, prefer it.
      for (const child of node.options ?? []) {
        if (child.type !== 'option') continue;
        const opt = optionsById.get(child.id);
        if (!opt || opt.type !== 'filter') continue;
        const wg = (opt.filters ?? []).find((f: any) => f.path === 'system.weaponGroup.value');
        if (!wg) continue;
        const specSuffix = `(${String(wg.value).charAt(0).toUpperCase()}${String(wg.value).slice(1)})`;
        for (const specName of skillSpecs) {
          if (specName.endsWith(specSuffix)) return child;
        }
      }
      const opts = node.options ?? [];
      return opts[Math.floor(Math.random() * opts.length)];
    };

    const walk = async (node: any): Promise<any[]> => {
      if (!node) return [];
      if (node.type === 'option') {
        const opt = optionsById.get(node.id);
        const resolved = await resolveOption(opt);
        return resolved ? [resolved] : [];
      }
      if (node.type === 'and') {
        const out: any[] = [];
        for (const child of node.options ?? []) {
          out.push(...(await walk(child)));
        }
        return out;
      }
      if (node.type === 'or') {
        const chosen = pickOrBranch(node);
        return chosen ? await walk(chosen) : [];
      }
      return [];
    };

    return await walk(trappings.structure);
  }

  /**
   * Update actor data
   * Allows updating any actor properties using dot notation for nested fields
   */
  async updateActor(data: { actorId: string; updateData: Record<string, any>; warnings?: string[]; verifyPersistence?: boolean | undefined }): Promise<any> {
    this.validateFoundryState();

    try {
      const actor = game.actors?.get(data.actorId);
      if (!actor) {
        throw new Error(`Actor not found with ID: ${data.actorId}`);
      }

      // Capture previous values before update for better notifications
      const previousValues: Record<string, any> = {};
      for (const key of Object.keys(data.updateData || {})) {
        try {
          previousValues[key] = foundry.utils.getProperty(actor, key);
        } catch (error) {
          // If we can't get previous value, just skip it
          previousValues[key] = undefined;
        }
      }

      // Bypass wfrp4e's programmatic-hostile _preUpdate hooks:
      //   - _checkCharacteristicChange (wfrp4e.js:28735) pops an Advancement Cost dialog
      //     whenever system.characteristics.*.advances changes, doubling cost for
      //     out-of-career advances. It calls actor.update() itself inside the dialog
      //     callback, racing with our update and charging the XP twice.
      //   - _handleExperienceChange (wfrp4e.js:28895) pops an ExpChange dialog whenever
      //     system.details.experience changes without experience.log, then auto-appends
      //     a log entry.
      // Both hooks gate on !options.skipExperienceChecks (wfrp4e.js:28727). Setting it
      // to true is the documented way for programmatic callers to bypass the wizardry.
      // Caller contract: skills that bump experience.spent MUST also include the
      // experience.log entry in updateData (since auto-append is now skipped).
      // The old `skipDialog: true` flag was a no-op — no code in wfrp4e or warhammer-lib
      // references it.
      const commitObserved =
        data.verifyPersistence !== false ? this.waitForActorUpdateCommit(String(actor.id), 250) : null;
      await actor.update(data.updateData, { skipExperienceChecks: true } as any);
      if (commitObserved) await commitObserved;

      // BUG-086 fix (2026-05-17): actor.update() does NOT throw on DataModelValidationError;
      // Foundry logs to console.warn but resolves the promise silently. Without post-write
      // verification, our success envelope lies — caller gets {success:true} for a write
      // that didn't persist any field. Mirrors manage-character.update-stats DP-16 pattern
      // (CCR-Envelope-Consumer extension). Pass verifyPersistence:false to opt out when
      // writing system-derived fields that auto-compute back via prepareDerivedData
      // (e.g. CharacterModel.computeCareer overwriting system.details.status.* per BUG-085).
      if (data.verifyPersistence !== false) {
        const fresh = (game.actors as any)?.get(actor.id);
        if (!fresh) {
          throw new Error(`UPDATE_ACTOR_NOT_PERSISTED: actor ${actor.id} disappeared after update`);
        }
        const flat = (foundry as any).utils.flattenObject(data.updateData) as Record<string, unknown>;
        const drift: string[] = [];
        for (const [path, expected] of Object.entries(flat)) {
          // Skip Foundry's deletion-marker syntax (e.g. "system.foo.-=key": null) — re-read
          // can't validate "key absent" via getProperty/expected comparison.
          if (path.includes('.-=')) continue;
          const actual = (foundry as any).utils.getProperty(fresh, path);
          if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            drift.push(`${path}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
          }
        }
        if (drift.length > 0) {
          throw new Error(
            `UPDATE_ACTOR_NOT_PERSISTED: ${drift.length} field(s) did not persist (DataModelValidationError? auto-derive overwrite?). Drift: ${drift.slice(0, 3).join('; ')}${drift.length > 3 ? `; +${drift.length - 3} more` : ''}`
          );
        }
      }

      // Debug: Log the updateData structure to help diagnose issues
      console.log(`[Warhammer MCP] Update data structure:`, {
        actorName: actor.name,
        updateDataKeys: Object.keys(data.updateData || {}),
        hasWarnings: !!(data.warnings && data.warnings.length),
        warningCount: data.warnings?.length || 0,
        firstWarning: data.warnings?.[0]
      });

      // Format field names in a human-readable way
      const formatFieldName = (key: string): string => {
        // Ensure key is a string
        if (typeof key !== 'string') {
          console.warn(`[Warhammer MCP] Non-string field key:`, key);
          return String(key);
        }

        try {
          const parts = key.split('.');

          if (parts.includes('characteristics')) {
            const charIndex = parts.indexOf('characteristics');

            // Validate array bounds
            if (charIndex + 1 >= parts.length) {
              return 'Unknown Characteristic';
            }

            const char = parts[charIndex + 1];

            // Validate char exists and is string
            if (!char || typeof char !== 'string') {
              return 'Unknown Characteristic';
            }

            const charName: Record<string, string> = {
              'ws': 'Weapon Skill',
              'bs': 'Ballistic Skill',
              's': 'Strength',
              't': 'Toughness',
              'i': 'Initiative',
              'ag': 'Agility',
              'dex': 'Dexterity',
              'int': 'Intelligence',
              'wp': 'Willpower',
              'fel': 'Fellowship'
            };

            const result = charName[char];
            return result || `${char.toUpperCase()} characteristic`;
          } else if (parts.includes('status')) {
            const statIndex = parts.indexOf('status');

            // Validate array bounds
            if (statIndex + 1 >= parts.length) {
              return 'Unknown Status';
            }

            const stat = parts[statIndex + 1];

            if (!stat || typeof stat !== 'string') {
              return 'Unknown Status';
            }

            const statName: Record<string, string> = {
              'wounds': 'Wounds',
              'fortune': 'Fortune',
              'fate': 'Fate',
              'resilience': 'Resilience',
              'resolve': 'Resolve',
              'corruption': 'Corruption',
              'armour': 'Armor Points'
            };

            const result = statName[stat];
            return result || stat;
          } else if (parts.includes('details')) {
            const detailIndex = parts.indexOf('details');

            // Validate array bounds
            if (detailIndex + 1 >= parts.length) {
              return 'Unknown Detail';
            }

            const detail = parts[detailIndex + 1];

            if (!detail || typeof detail !== 'string') {
              return 'Unknown Detail';
            }

            const detailName: Record<string, string> = {
              'age': 'Age',
              'height': 'Height',
              'weight': 'Weight',
              'gender': 'Gender',
              'haircolour': 'Hair Colour',
              'eyecolour': 'Eye Colour',
              'distinguishingmark': 'Distinguishing Mark',
              'starsign': 'Star Sign',
              'move': 'Movement',
              'motivation': 'Motivation',
              'gmnotes': 'GM Notes',
              'personal-ambitions': 'Ambitions',
              'biography': 'Biography',
              'experience': 'Experience'
            };

            const result = detailName[detail];
            return result || detail;
          } else if (parts.includes('experience') || key.includes('experience')) {
            // Handle experience-related fields
            if (parts.includes('log')) {
              return 'Experience Log';
            }
            if (parts.includes('total')) {
              return 'Total XP';
            }
            if (parts.includes('spent')) {
              return 'Spent XP';
            }
            if (parts.includes('current')) {
              return 'Available XP';
            }
            return 'Experience';
          }

          // Default: return last part of path
          const lastPart = parts[parts.length - 1];
          return lastPart || 'Unknown Field';
        } catch (error) {
          console.warn(`[Warhammer MCP] Error formatting field name "${key}":`, error);
          return 'Unknown Field';
        }
      };

      // Helper function to format a value for display
      const formatValue = (value: any): string => {
        if (value === null || value === undefined) return 'null';
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        if (typeof value === 'number') return String(value);
        if (typeof value === 'string') {
          // Truncate long strings
          return value.length > 30 ? value.substring(0, 27) + '...' : value;
        }
        if (Array.isArray(value)) {
          return `[${value.length} items]`;
        }
        if (typeof value === 'object') {
          // For objects, just show "updated" rather than JSON dump
          return '[object]';
        }
        return String(value);
      };

      // Filter out internal fields that shouldn't be shown in notifications
      const isInternalField = (key: string): boolean => {
        const internalPatterns = ['_id', 'type', 'flags', 'ownership', 'folder', 'sort', 'permission'];
        const lowerKey = key.toLowerCase();
        return internalPatterns.some(pattern => lowerKey === pattern || lowerKey.endsWith('.' + pattern));
      };

      // Helper function to flatten nested objects into dot-notation paths
      const flattenObject = (obj: Record<string, any>, prefix = ''): Record<string, any> => {
        const result: Record<string, any> = {};

        for (const key of Object.keys(obj)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          const value = obj[key];

          // Skip internal fields
          if (isInternalField(key) || isInternalField(fullKey)) {
            continue;
          }

          // If value is a plain object (not array, not null), recurse
          if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            // Check if it's a "leaf" value object (has 'value' property that's primitive)
            if ('value' in value && (typeof value.value !== 'object' || value.value === null)) {
              // This is likely a WFRP field like {value: 15}, extract the value
              result[fullKey + '.value'] = value.value;
            } else {
              // Recurse into nested object
              Object.assign(result, flattenObject(value, fullKey));
            }
          } else {
            // Primitive value or array - keep as is
            result[fullKey] = value;
          }
        }

        return result;
      };

      // Flatten the updateData to get actual field paths
      const flattenedUpdates = flattenObject(data.updateData || {});
      const flattenedPrevious = flattenObject(previousValues || {});

      // Create a clear, readable summary of what was updated with before/after values
      const allKeys = Object.keys(flattenedUpdates);
      const userFacingKeys = allKeys.filter(key => !isInternalField(key));

      const fieldDescriptions = userFacingKeys.map((key, index) => {
        try {
          const formatted = formatFieldName(key);
          const oldValue = flattenedPrevious[key];
          const newValue = flattenedUpdates[key];

          // Show before → after format
          let description: string;
          if (oldValue !== undefined && oldValue !== newValue) {
            description = `${formatted}: ${formatValue(oldValue)} → ${formatValue(newValue)}`;
          } else {
            // If we don't have previous value or it's the same, just show new value
            description = `${formatted}: ${formatValue(newValue)}`;
          }

          return description;
        } catch (error) {
          console.warn(`[Warhammer MCP] Error formatting field at index ${index} (key: "${key}"):`, error);
          return `${String(key)}: ${formatValue(flattenedUpdates[key])}`;
        }
      });

      // Filter out any non-strings just in case
      const cleanDescriptions = fieldDescriptions.filter(d => typeof d === 'string');

      // Limit to first 4 items if there are many updates
      const maxItemsToShow = 4;
      let updateSummary: string;
      if (cleanDescriptions.length === 0) {
        updateSummary = 'various fields';
      } else if (cleanDescriptions.length <= maxItemsToShow) {
        updateSummary = cleanDescriptions.join(', ');
      } else {
        const shown = cleanDescriptions.slice(0, maxItemsToShow).join(', ');
        const remaining = cleanDescriptions.length - maxItemsToShow;
        updateSummary = `${shown}, and ${remaining} more field${remaining > 1 ? 's' : ''}`;
      }

      // Show notifications to GM
      if (data.warnings && Array.isArray(data.warnings) && data.warnings.length > 0) {
        // Show each warning as a separate, clear notification
        data.warnings.forEach((warning: any, index: number) => {
          // Ensure warning is converted to readable string
          let warningText: string;

          if (typeof warning === 'string') {
            warningText = warning;
          } else if (warning === null || warning === undefined) {
            warningText = 'Unknown warning';
          } else if (typeof warning === 'object') {
            // Try to extract message from object
            warningText = warning.message || warning.text || JSON.stringify(warning);
          } else {
            warningText = String(warning);
          }

          // Clean up the warning text - remove "WARNING:" prefix if present
          warningText = warningText.replace(/^WARNING:\s*/i, '').trim();

          // Ensure we have a non-empty string
          if (!warningText) {
            warningText = `Warning ${index + 1}`;
          }

          notify.warn(warningText);
        });

        // Show summary notification
        notify.updated('actor', actor.name ?? 'unknown', { summary: updateSummary, uuid: (actor as any).uuid });

        // Log to console for GM review
        console.warn(`[Warhammer MCP] Warnings for ${actor.name}:`, data.warnings);
      } else {
        // Simple success notification
        notify.updated('actor', actor.name ?? 'unknown', { summary: updateSummary, uuid: (actor as any).uuid });
      }

      return {
        success: true,
        actorId: actor.id,
        actorName: actor.name,
        updated: Object.keys(data.updateData)
      };
    } catch (error) {
      throw new Error(`Failed to update actor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Phase 4 mcp_coverage_expansion: resolve an actor by id or name.
   * Used by actor-direct AE branches (add/update/delete/getByName).
   */
  private _resolveActor(actorId?: string, actorName?: string): any {
    let actor: any = null;
    if (actorId) actor = (game.actors as any)?.get(actorId) ?? null;
    if (!actor && actorName) {
      const wanted = actorName.toLowerCase();
      actor = (game.actors as any)?.find((a: any) => a.name?.toLowerCase() === wanted) ?? null;
    }
    if (!actor) {
      throw new Error(`Actor not found: ${actorId ?? actorName ?? '(no identifier)'}`);
    }
    return actor;
  }

  /**
   * Phase 5 follow-up: resolve an item to its doc + (optional) owning actor.
   * Unifies actor-embedded and world-scope lookup across updateItem / deleteItem
   * / addActiveEffect / updateActiveEffect / deleteActiveEffect.
   *
   * Accepts two target shapes:
   *  - legacy `{actorId, itemId}` — actor-embedded lookup by id.
   *  - new `{destination, itemId?, itemName?}` — route on destination.type.
   * World-scope branch does NOT take an owner.
   */
  private _resolveItem(target: {
    actorId?: string | undefined;
    itemId?: string | undefined;
    itemName?: string | undefined;
    destination?:
    | { type: 'actor'; actorId?: string | undefined; actorName?: string | undefined }
    | { type: 'world'; folder?: string[] | undefined }
    | undefined;
  }): { item: any; owner: any | null; scope: 'actor' | 'world' } {
    const dest = target.destination;
    const hasActorLegacy = !!target.actorId;
    if (!dest && !hasActorLegacy) {
      throw new Error('Either `actorId` or `destination` must be supplied to resolve an item');
    }

    // World scope
    if (dest?.type === 'world') {
      const items: any = game.items as any;
      let item: any = null;
      if (target.itemId) item = items?.get?.(target.itemId) ?? null;
      if (!item && target.itemName) {
        const wanted = target.itemName.toLowerCase();
        item = items?.find?.((i: any) => i.name?.toLowerCase() === wanted) ?? null;
      }
      if (!item) {
        throw new Error(
          `World item "${target.itemName ?? target.itemId ?? '(no identifier)'}" not found in Items sidebar`
        );
      }
      return { item, owner: null, scope: 'world' };
    }

    // Actor scope (explicit destination or legacy actorId)
    let actor: any = null;
    if (dest?.type === 'actor') {
      if (dest.actorId) actor = (game.actors as any)?.get(dest.actorId) ?? null;
      if (!actor && dest.actorName) {
        const wanted = dest.actorName.toLowerCase();
        actor = (game.actors as any)?.find((a: any) => a.name?.toLowerCase() === wanted) ?? null;
      }
    } else if (hasActorLegacy) {
      actor = (game.actors as any)?.get(target.actorId!) ?? null;
    }
    if (!actor) {
      const ident =
        dest?.type === 'actor' ? dest.actorId ?? dest.actorName : target.actorId;
      throw new Error(`Actor not found: ${ident ?? '(no identifier)'}`);
    }

    let item: any = null;
    if (target.itemId) item = actor.items?.get?.(target.itemId) ?? null;
    if (!item && target.itemName) {
      const wanted = target.itemName.toLowerCase();
      item = actor.items?.find?.((i: any) => i.name?.toLowerCase() === wanted) ?? null;
    }
    if (!item) {
      throw new Error(
        `Item "${target.itemName ?? target.itemId ?? '(no identifier)'}" not found on ${actor.name}`
      );
    }
    return { item, owner: actor, scope: 'actor' };
  }

  /**
   * Update item data on an actor OR a world-scope item.
   * Legacy `{actorId, itemId, updateData}` callers unaffected.
   */
  async updateItem(data: {
    actorId?: string | undefined;
    itemId?: string | undefined;
    itemName?: string | undefined;
    destination?:
    | { type: 'actor'; actorId?: string | undefined; actorName?: string | undefined }
    | { type: 'world'; folder?: string[] | undefined }
    | undefined;
    updateData: Record<string, any>;
    options?: { skipExperienceChecks?: boolean | undefined } | undefined;
    verifyPersistence?: boolean | undefined;
  }): Promise<any> {
    this.validateFoundryState();

    try {
      const { item, owner, scope } = this._resolveItem(data);
      const flat =
        data.verifyPersistence !== false
          ? ((foundry as any).utils.flattenObject(data.updateData) as Record<string, unknown>)
          : null;
      const beforeValues =
        flat && data.verifyPersistence !== false
          ? Object.fromEntries(
            Object.entries(flat)
              .filter(([path]) => !path.includes('.-='))
              .map(([path]) => [path, (foundry as any).utils.getProperty(item, path)]),
          )
          : null;
      // BUG-385: a skill item whose `system.advances.value` changes on a character-type actor
      // triggers SkillModel._preUpdate → Advancement.advancementDialog (a DialogV2), which
      // deadlocks the MCP await until a human clicks. The wfrp4e gate is !options.skipExperienceChecks;
      // updateActor already injects this unconditionally — mirror it here (GM-only programmatic path,
      // the XP dialog is never appropriate).
      const updateResult = await item.update(
        data.updateData,
        { ...(data.options ?? {}), skipExperienceChecks: true } as any,
      );

      // MCP Completion v1 Phase 1 (R1.2): item.update() does NOT throw on
      // DataModelValidationError; Foundry logs to console.warn but resolves
      // silently. Without post-write verification our success envelope lies.
      // Mirrors updateActor's BUG-086 verify-block (data-access.ts:4190-4211).
      // Pass verifyPersistence:false to opt out when writing auto-derived fields.
      if (data.verifyPersistence !== false) {
        const flatUpdate = flat ?? {};
        // BUG-134: Foundry returns `undefined` when a preUpdate hook cancels the write.
        // Treat that as a failed persistence attempt whenever the requested payload
        // would have changed at least one field.
        if (updateResult === undefined && beforeValues) {
          const cancelled = Object.entries(flatUpdate)
            .filter(([path]) => !path.includes('.-='))
            .filter(([path, expected]) => JSON.stringify(beforeValues[path]) !== JSON.stringify(expected));
          if (cancelled.length > 0) {
            const preview = cancelled
              .slice(0, 3)
              .map(([path, expected]) => `${path}: expected ${JSON.stringify(expected)}, before ${JSON.stringify(beforeValues[path])}`)
              .join('; ');
            throw new Error(
              `UPDATE_ITEM_NOT_PERSISTED: Item.update() returned undefined (preUpdate cancelled write?). Requested changes were not applied. ${preview}${cancelled.length > 3 ? `; +${cancelled.length - 3} more` : ''}`,
            );
          }
        }
        const freshItem =
          scope === 'actor'
            ? (game.actors as any)?.get(owner?.id)?.items?.get(item.id)
            : (game.items as any)?.get(item.id);
        if (!freshItem) {
          throw new Error(`UPDATE_ITEM_NOT_PERSISTED: item ${item.id} disappeared after update`);
        }
        const drift: string[] = [];
        for (const [path, expected] of Object.entries(flatUpdate)) {
          if (path.includes('.-=')) continue;
          const actual = (foundry as any).utils.getProperty(freshItem, path);
          if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            drift.push(`${path}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
          }
        }
        if (drift.length > 0) {
          throw new Error(
            `UPDATE_ITEM_NOT_PERSISTED: ${drift.length} field(s) did not persist (DataModelValidationError? auto-derive overwrite?). Drift: ${drift.slice(0, 3).join('; ')}${drift.length > 3 ? `; +${drift.length - 3} more` : ''}`
          );
        }
      }

      const ownerLabel = scope === 'world' ? '(world)' : owner?.name ?? '(unknown)';
      notify.updated('item', item.name, { summary: `on ${ownerLabel}`, uuid: (item as any).uuid });

      return {
        success: true,
        scope,
        actorId: owner?.id ?? null,
        itemId: item.id,
        itemName: item.name,
        updated: Object.keys(data.updateData),
      };
    } catch (error) {
      throw new Error(`Failed to update item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Walk the Items-sidebar folder tree; create missing segments.
   * Returns the leaf folder's ID. Empty/missing segments → null (root).
   */
  private async _ensureFolderChain(segments: string[]): Promise<string | null> {
    if (!segments || segments.length === 0) return null;

    let parentId: string | null = null;
    for (const name of segments) {
      const existing = (game.folders as any).find((f: any) => {
        const fParent = f.folder?.id ?? f.folder ?? null;
        return f.type === 'Item' && f.name === name && fParent === parentId;
      });
      if (existing) {
        parentId = existing.id;
        continue;
      }
      const payload: any = { name, type: 'Item', folder: parentId };
      const created: any = await (Folder as any).create(payload);
      if (!created?.id) {
        throw new Error(`Folder.create returned no id for segment "${name}"`);
      }
      notify.created('folder', name);
      parentId = created.id;
    }
    return parentId;
  }

  /**
   * Phase 5: Create an item on an actor OR as a world-level document with optional
   * folder placement. Optional compendium-clone seeding and rich-response opt-in.
   *
   * Input: { itemData, destination: {type:"actor"|"world", ...}, fromCompendium?, returnFullPayload? }
   */
  async createItem(data: {
    itemData: Record<string, any>;
    destination:
    | { type: 'actor'; actorId?: string | undefined; actorName?: string | undefined }
    | { type: 'world'; folder?: string[] | undefined };
    fromCompendium?: string | undefined;
    returnFullPayload?: boolean | undefined;
  }): Promise<any> {
    this.validateFoundryState();

    try {
      // 1. Resolve compendium clone seed if requested
      let effectiveItemData: Record<string, any> = data.itemData;
      if (data.fromCompendium) {
        const source: any = await (fromUuid as any)(data.fromCompendium);
        if (!source) {
          throw new Error(`Compendium source not found: ${data.fromCompendium}`);
        }
        const cloned: any = source.toObject();
        delete cloned._id;
        if (Array.isArray(cloned.effects)) {
          for (const eff of cloned.effects) delete eff._id;
        }
        effectiveItemData = (foundry as any).utils.mergeObject(cloned, data.itemData, {
          recursive: true,
          overwrite: true,
          inplace: false,
        });
      }

      // 2. Route on destination type
      if (data.destination.type === 'actor') {
        const dest = data.destination;
        let actor: any = null;
        if (dest.actorId) {
          actor = (game.actors as any)?.get(dest.actorId);
        } else if (dest.actorName) {
          actor = (game.actors as any)?.find(
            (a: any) => a.name?.toLowerCase() === dest.actorName!.toLowerCase()
          );
        }
        if (!actor) {
          throw new Error(
            `Actor not found: ${dest.actorId ?? dest.actorName ?? '(no id/name provided)'}`
          );
        }

        const createdItems = await actor.createEmbeddedDocuments('Item', [effectiveItemData]);
        const item: any = createdItems[0];
        notify.created('item', item.name, { summary: `on ${actor.name}`, uuid: (item as any).uuid });

        const base: any = {
          success: true,
          scope: 'actor',
          actorId: actor.id,
          actorName: actor.name,
          itemId: item.id,
          itemName: item.name,
          itemType: item.type,
        };
        if (data.returnFullPayload === true) {
          base.itemData = item.toObject();
          base.effectIds = (item.effects as any)?.map((e: any) => e.id) ?? [];
        }
        return base;
      }

      // World scope
      const worldDest = data.destination;
      const folderId =
        worldDest.folder && worldDest.folder.length > 0
          ? await this._ensureFolderChain(worldDest.folder)
          : null;

      const createPayload: any = { ...effectiveItemData };
      if (folderId) createPayload.folder = folderId;

      const created: any = await (Item as any).create(createPayload);
      if (!created) throw new Error('Item.create returned null');

      notify.created('item', created.name, { summary: 'in world directory', uuid: (created as any).uuid });

      const base: any = {
        success: true,
        scope: 'world',
        itemId: created.id,
        itemName: created.name,
        itemType: created.type,
        folderId: folderId ?? null,
        folderPath: worldDest.folder ?? [],
      };
      if (data.returnFullPayload === true) {
        base.itemData = created.toObject();
        base.effectIds = (created.effects as any)?.map((e: any) => e.id) ?? [];
      }
      return base;
    } catch (error) {
      throw new Error(
        `Failed to create item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Phase 5: Atomic trade — move an Item from one actor to another. Partial-quantity
   * transfers are supported via the `quantity` parameter. Encumbrance recomputes
   * automatically via the system's prepareData pipeline (HC3).
   *
   * Transaction semantics are provided by wrappedWrite at the handler layer; this
   * method throws on any failure so the outer wrapper rolls back.
   */
  async tradeItem(data: {
    fromActorId: string;
    toActorId: string;
    itemId: string;
    quantity?: number | undefined;
  }): Promise<any> {
    this.validateFoundryState();

    const fromActor: any = (game.actors as any)?.get(data.fromActorId);
    if (!fromActor) {
      throw new Error(`Source actor not found: ${data.fromActorId}`);
    }
    const toActor: any = (game.actors as any)?.get(data.toActorId);
    if (!toActor) {
      throw new Error(`Destination actor not found: ${data.toActorId}`);
    }

    const item: any = fromActor.items?.get(data.itemId);
    if (!item) {
      throw new Error(`Item ${data.itemId} not found on ${fromActor.name}`);
    }

    const itemName: string = item.name;
    const itemType: string = item.type;
    const sourceQty: number = item.system?.quantity?.value ?? 1;

    // Partial transfer: source retains (sourceQty - quantity); dest gets `quantity`.
    if (
      typeof data.quantity === 'number' &&
      data.quantity > 0 &&
      data.quantity < sourceQty
    ) {
      const cloned: any = item.toObject();
      delete cloned._id;
      if (cloned.system?.quantity) cloned.system.quantity.value = data.quantity;

      // Decrement source — capture result for DP-16 verify BEFORE creating destination.
      // BUG-213: if source decrement fails silently, dest create would duplicate the item.
      // The throw MUST precede toActor.createEmbeddedDocuments — that ordering IS the fix.
      const updateResult = await item.update({ 'system.quantity.value': sourceQty - data.quantity });
      const freshItem = fromActor.items?.get(data.itemId);
      const freshQty = (freshItem as any)?.system?.quantity?.value ?? sourceQty;
      if (updateResult === undefined || freshQty !== sourceQty - data.quantity) {
        throw new Error(
          `TRADE_ITEM_SOURCE_DECREMENT_NOT_PERSISTED: source quantity expected ${sourceQty - data.quantity} but found ${freshQty} (updateResult=${updateResult === undefined ? 'undefined' : 'ok'})`,
        );
      }

      // Create on destination
      const destCreated = await toActor.createEmbeddedDocuments('Item', [cloned]);
      const destItem: any = destCreated[0];

      notify.updated('item', itemName, { summary: `traded ${data.quantity} × from ${fromActor.name} → ${toActor.name}` });

      return {
        success: true,
        fromActorId: fromActor.id,
        fromActorName: fromActor.name,
        toActorId: toActor.id,
        toActorName: toActor.name,
        itemId: destItem?.id ?? null,
        itemName,
        itemType,
        quantities: { from: sourceQty - data.quantity, to: data.quantity },
      };
    }

    // Full transfer: delete from source, create on destination
    const cloned: any = item.toObject();
    delete cloned._id;

    await fromActor.deleteEmbeddedDocuments('Item', [data.itemId]);
    const destCreated = await toActor.createEmbeddedDocuments('Item', [cloned]);
    const destItem: any = destCreated[0];

    notify.updated('item', itemName, { summary: `traded from ${fromActor.name} → ${toActor.name}` });

    return {
      success: true,
      fromActorId: fromActor.id,
      fromActorName: fromActor.name,
      toActorId: toActor.id,
      toActorName: toActor.name,
      itemId: destItem?.id ?? null,
      itemName,
      itemType,
      quantities: { from: 0, to: sourceQty },
    };
  }

  /**
   * Delete an item from an actor OR a world-scope item.
   * Legacy `{actorId, itemId}` callers unaffected.
   */
  async deleteItem(data: {
    actorId?: string | undefined;
    itemId?: string | undefined;
    itemName?: string | undefined;
    destination?:
    | { type: 'actor'; actorId?: string | undefined; actorName?: string | undefined }
    | { type: 'world'; folder?: string[] | undefined }
    | undefined;
  }): Promise<any> {
    this.validateFoundryState();

    try {
      const { item, owner, scope } = this._resolveItem(data);
      const itemName = item.name;
      const itemType = item.type;
      const itemId = item.id;

      if (scope === 'world') {
        await item.delete();
        notify.deleted('item', itemName, { summary: 'world directory' });
      } else {
        await owner.deleteEmbeddedDocuments('Item', [itemId]);
        notify.deleted('item', itemName, { summary: `from ${owner.name}` });
      }

      return {
        success: true,
        scope,
        actorId: owner?.id ?? null,
        itemId,
        itemName,
        itemType,
      };
    } catch (error) {
      throw new Error(`Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Phase 5 follow-up B: resolve an ActiveEffect on a document (item or actor) by id or name.
   * doc-agnostic — iterates doc.effects, works for both item-parented and actor-direct AEs.
   */
  private _findEffect(doc: any, effectId?: string, effectName?: string): any {
    const effects: any[] = (doc.effects as any)?.contents ?? Array.from(doc.effects ?? []);
    let found: any = null;
    if (effectId) found = effects.find((e: any) => e.id === effectId) ?? null;
    if (!found && effectName) {
      const wanted = effectName.toLowerCase();
      found = effects.find((e: any) => e.name?.toLowerCase() === wanted) ?? null;
    }
    if (!found) {
      throw new Error(
        `Effect "${effectName ?? effectId ?? '(no identifier)'}" not found on "${doc.name}"`
      );
    }
    return found;
  }

  /**
   * Phase 5 follow-up B — add ActiveEffect to an existing item.
   * Phase 4 mcp_coverage_expansion — also handles scope:'actor-direct' (effect on the actor itself).
   * Target is an ActiveEffectTarget (actor-embedded, world item, or actor-direct).
   * effect is the flat ergonomic shape shared with create-custom-item's effects[] field.
   */
  async addActiveEffect(data: {
    target:
    | { scope: 'actor'; actorId?: string | undefined; actorName?: string | undefined; itemId?: string | undefined; itemName?: string | undefined }
    | { scope: 'world'; itemId?: string | undefined; itemName?: string | undefined }
    | { scope: 'actor-direct'; actorId?: string | undefined; actorName?: string | undefined };
    effect: any;
    returnFullPayload?: boolean | undefined;
  }): Promise<any> {
    this.validateFoundryState();
    try {
      // buildEffectPayload is imported lazily to avoid a top-of-file shuffle.
      const { buildEffectPayload } = await import('@foundry-mcp/shared');

      // BUG-340: an `immediate`-trigger script that returns false self-deletes its own
      // effect during creation (documented wfrp4e recipe — effects/triggers/immediate.md).
      // createEmbeddedDocuments then returns [] (the doc was removed inside the create op),
      // or the read-back is absent — but the script DID run. Detect this so the one-shot
      // self-deleting recipe is reported as success (fired + autoDeleted), not failure.
      const isSelfDeletingImmediate = (eff: any): boolean =>
        eff?.trigger === 'immediate' &&
        /\breturn\s+false\b/.test(typeof eff?.script === 'string' ? eff.script : '');

      // --- actor-direct branch: effect lives directly on the actor ---
      if (data.target.scope === 'actor-direct') {
        const actorDirect = data.target as { scope: 'actor-direct'; actorId?: string; actorName?: string };
        const actor = this._resolveActor(actorDirect.actorId, actorDirect.actorName);
        const effectPayload = buildEffectPayload(data.effect);
        const created: any[] = await actor.createEmbeddedDocuments('ActiveEffect', [effectPayload]);
        if (!created || created.length === 0) {
          if (isSelfDeletingImmediate(data.effect)) {
            notify.created('active-effect', data.effect.name, {
              summary: `on ${actor.name} (immediate one-shot — fired + self-deleted)`,
            });
            return {
              success: true,
              scope: 'actor-direct',
              actorId: actor.id,
              actorName: actor.name,
              itemId: null,
              itemName: null,
              effectId: null,
              effectName: data.effect.name,
              parentType: 'Actor' as const,
              fired: true,
              autoDeleted: true,
            };
          }
          throw new Error('Failed to create ActiveEffect on actor');
        }

        const createdEffect: any = created[0];
        // CCR-2a re-read: verify the AE was persisted
        const fresh: any = actor.effects.get(createdEffect.id);
        if (!fresh) {
          if (isSelfDeletingImmediate(data.effect)) {
            notify.created('active-effect', createdEffect.name, {
              summary: `on ${actor.name} (immediate one-shot — fired + self-deleted)`,
            });
            return {
              success: true,
              scope: 'actor-direct',
              actorId: actor.id,
              actorName: actor.name,
              itemId: null,
              itemName: null,
              effectId: createdEffect.id,
              effectName: createdEffect.name,
              parentType: 'Actor' as const,
              fired: true,
              autoDeleted: true,
            };
          }
          throw new Error(`ADD_ACTIVE_EFFECT_NOT_PERSISTED: effect ${createdEffect.id} absent after create`);
        }

        notify.created('active-effect', createdEffect.name, {
          summary: `on ${actor.name}`,
          uuid: (createdEffect as any).uuid,
        });

        const base: any = {
          success: true,
          scope: 'actor-direct',
          actorId: actor.id,
          actorName: actor.name,
          itemId: null,
          itemName: null,
          effectId: createdEffect.id,
          effectName: createdEffect.name,
          parentType: 'Actor' as const,
        };
        if (data.returnFullPayload === true) {
          base.effectData = createdEffect.toObject?.() ?? null;
        }
        return base;
      }

      // --- item path (scope:'actor' or scope:'world') — unchanged ---
      const { item, owner, scope } = this._resolveItem(this._targetToResolverInput(data.target as any));
      const effectPayload = buildEffectPayload(data.effect);
      const created: any[] = await item.createEmbeddedDocuments('ActiveEffect', [effectPayload]);
      if (!created || created.length === 0) {
        if (isSelfDeletingImmediate(data.effect)) {
          notify.created('active-effect', data.effect.name, {
            summary: `on ${item.name} (immediate one-shot — fired + self-deleted)`,
          });
          return {
            success: true,
            scope,
            actorId: owner?.id ?? null,
            itemId: item.id,
            itemName: item.name,
            effectId: null,
            effectName: data.effect.name,
            fired: true,
            autoDeleted: true,
          };
        }
        throw new Error('Failed to create ActiveEffect');
      }

      const createdEffect: any = created[0];

      // Canvas-anchored tooltip when effect's owning item belongs to an actor
      // that has a token placed on the current scene.
      const ownerActorId: string | null = owner?.id ?? null;
      const placedToken: any = ownerActorId
        ? (globalThis as any).canvas?.tokens?.placeables?.find((t: any) => t?.actor?.id === ownerActorId)
        : null;
      const tokenDoc = placedToken?.document;
      notify.created('active-effect', createdEffect.name, {
        summary: `on ${item.name}`,
        uuid: (createdEffect as any).uuid,
        tooltip: tokenDoc ? { tokenDoc, message: `+${createdEffect.name}` } : undefined,
      });

      const base: any = {
        success: true,
        scope,
        actorId: owner?.id ?? null,
        itemId: item.id,
        itemName: item.name,
        effectId: createdEffect.id,
        effectName: createdEffect.name,
      };
      if (data.returnFullPayload === true) {
        base.effectData = createdEffect.toObject?.() ?? null;
      }
      return base;
    } catch (error) {
      throw new Error(
        `Failed to add active effect: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Phase 5 follow-up B — partial update an existing ActiveEffect.
   * Phase 4 mcp_coverage_expansion — also handles scope:'actor-direct' (effect on the actor itself).
   * Flat input is inflated via buildEffectPayload; merge semantics preserve
   * unlisted fields on the effect.
   */
  async updateActiveEffect(data: {
    target:
    | { scope: 'actor'; actorId?: string | undefined; actorName?: string | undefined; itemId?: string | undefined; itemName?: string | undefined }
    | { scope: 'world'; itemId?: string | undefined; itemName?: string | undefined }
    | { scope: 'actor-direct'; actorId?: string | undefined; actorName?: string | undefined };
    effectId?: string | undefined;
    effectName?: string | undefined;
    updates: any;
    returnFullPayload?: boolean | undefined;
  }): Promise<any> {
    this.validateFoundryState();
    if (!data.effectId && !data.effectName) {
      throw new Error('updateActiveEffect requires one of effectId or effectName');
    }
    try {
      const { buildEffectPayload } = await import('@foundry-mcp/shared');

      // --- actor-direct branch ---
      if (data.target.scope === 'actor-direct') {
        const actorDirect = data.target as { scope: 'actor-direct'; actorId?: string; actorName?: string };
        const actor = this._resolveActor(actorDirect.actorId, actorDirect.actorName);
        const effect: any = this._findEffect(actor, data.effectId, data.effectName);

        const mergedFlat: any = {
          name: data.updates.name ?? effect.name,
          trigger: data.updates.trigger ?? effect.system?.scriptData?.[0]?.trigger ?? 'manual',
          script: data.updates.script ?? effect.system?.scriptData?.[0]?.script ?? '',
          ...data.updates,
        };
        const fullInflated = buildEffectPayload(mergedFlat);

        const updatePayload: Record<string, unknown> = {};
        const touchedScript = 'trigger' in data.updates || 'script' in data.updates || 'label' in data.updates;
        const touchedTransfer = 'transfer' in data.updates;
        for (const key of Object.keys(data.updates)) {
          if (key === 'trigger' || key === 'script' || key === 'label') continue;
          if (key === 'transfer') continue;
          updatePayload[key] = (fullInflated as any)[key] ?? data.updates[key];
        }
        if (touchedScript) updatePayload['system.scriptData'] = (fullInflated as any).system.scriptData;
        if (touchedTransfer) updatePayload['system.transferData'] = (fullInflated as any).system.transferData;

        const flatUpdate = (foundry as any).utils.flattenObject(updatePayload) as Record<string, unknown>;
        const beforeValues: Record<string, unknown> = {};
        for (const path of Object.keys(flatUpdate)) {
          if (path.includes('.-=')) continue;
          beforeValues[path] = (foundry as any).utils.getProperty(effect, path);
        }

        const updateResult = await effect.update(updatePayload);

        if (updateResult === undefined) {
          const cancelled = Object.entries(flatUpdate)
            .filter(([path]) => !path.includes('.-='))
            .filter(([path, expected]) => JSON.stringify(beforeValues[path]) !== JSON.stringify(expected));
          if (cancelled.length > 0) {
            const preview = cancelled.slice(0, 3).map(([path, expected]) =>
              `${path}: expected ${JSON.stringify(expected)}, before ${JSON.stringify(beforeValues[path])}`
            ).join('; ');
            throw new Error(
              `UPDATE_ACTIVE_EFFECT_NOT_PERSISTED: effect.update() returned undefined. ${preview}`,
            );
          }
        }

        // CCR-2a re-read
        let freshEffect: any;
        try {
          freshEffect = this._findEffect(actor, effect.id);
        } catch {
          throw new Error(`UPDATE_ACTIVE_EFFECT_NOT_PERSISTED: effect ${effect.id} disappeared after update`);
        }
        // BUG-342: foundry.utils.flattenObject treats arrays as LEAF values, so the whole
        // `system.scriptData` array is a single flat key. Its wfrp4e-managed `options`
        // sub-object is normalized on write (live keys: targeter/defending/runIfDisabled/
        // deleteEffect/showDuplicates) and never matches the MCP payload template, so a
        // whole-array compare false-fails. Skip the array from the generic drift verify and
        // instead verify the caller-meaningful scriptData[0] fields (script/trigger/label) landed.
        const scriptDataSkip = touchedScript ? ['system.scriptData'] : [];
        verifyDocWrite(freshEffect, flatUpdate, 'UPDATE_ACTIVE_EFFECT_NOT_PERSISTED', { skipPaths: scriptDataSkip });
        if (touchedScript) {
          const sd0: any = (freshEffect as any).system?.scriptData?.[0] ?? {};
          for (const f of ['script', 'trigger', 'label'] as const) {
            if (typeof data.updates[f] === 'string' && sd0[f] !== data.updates[f]) {
              throw new Error(
                `UPDATE_ACTIVE_EFFECT_NOT_PERSISTED: scriptData.${f} did not persist (expected ${JSON.stringify(data.updates[f])}, got ${JSON.stringify(sd0[f])})`,
              );
            }
          }
        }

        notify.updated('active-effect', effect.name, {
          summary: `on ${actor.name}`,
          uuid: (effect as any).uuid,
        });

        const base: any = {
          success: true,
          scope: 'actor-direct',
          actorId: actor.id,
          actorName: actor.name,
          itemId: null,
          itemName: null,
          effectId: effect.id,
          effectName: effect.name,
          updated: Object.keys(updatePayload),
          parentType: 'Actor' as const,
        };
        if (data.returnFullPayload === true) {
          base.effectData = freshEffect.toObject?.() ?? null;
        }
        return base;
      }

      // --- item path (scope:'actor' or scope:'world') — unchanged ---
      const { item, owner, scope } = this._resolveItem(this._targetToResolverInput(data.target as any));
      const effect: any = this._findEffect(item, data.effectId, data.effectName);

      // If updates contains flat keys that map through buildEffectPayload
      // (name, trigger, script, label, transfer, disabled, changes, statuses,
      // duration, flags, equipTransfer, enableScript, preApplyScript,
      // testIndependent), inflate the subset. buildEffectPayload REQUIRES
      // `name` and `trigger`; for a partial update we synthesize those from
      // the existing effect if absent.
      const mergedFlat: any = {
        name: data.updates.name ?? effect.name,
        trigger:
          data.updates.trigger ??
          effect.system?.scriptData?.[0]?.trigger ??
          'manual',
        script:
          data.updates.script ??
          effect.system?.scriptData?.[0]?.script ??
          '',
        ...data.updates,
      };
      const fullInflated = buildEffectPayload(mergedFlat);

      // Build a minimal update payload: only the top-level keys the caller
      // actually supplied get written (merge semantics), except when those
      // keys' values live in nested system.* paths that buildEffectPayload
      // rebuilds — for those, we pass the rebuilt subtree.
      const updatePayload: Record<string, unknown> = {};
      const touchedScript =
        'trigger' in data.updates || 'script' in data.updates || 'label' in data.updates;
      const touchedTransfer = 'transfer' in data.updates;
      for (const key of Object.keys(data.updates)) {
        if (key === 'trigger' || key === 'script' || key === 'label') continue;
        if (key === 'transfer') continue;
        updatePayload[key] = (fullInflated as any)[key] ?? data.updates[key];
      }
      if (touchedScript) {
        updatePayload['system.scriptData'] = (fullInflated as any).system.scriptData;
      }
      if (touchedTransfer) {
        updatePayload['system.transferData'] = (fullInflated as any).system.transferData;
      }

      // Snapshot before-values for the undefined-cancel guard (mirrors updateItem:4665).
      const flatUpdate = (foundry as any).utils.flattenObject(updatePayload) as Record<string, unknown>;
      const beforeValues: Record<string, unknown> = {};
      for (const path of Object.keys(flatUpdate)) {
        if (path.includes('.-=')) continue;
        beforeValues[path] = (foundry as any).utils.getProperty(effect, path);
      }

      const updateResult = await effect.update(updatePayload);

      // BUG-216: full DP-16 post-verify (token: UPDATE_ACTIVE_EFFECT_NOT_PERSISTED).
      if (updateResult === undefined) {
        const cancelled = Object.entries(flatUpdate)
          .filter(([path]) => !path.includes('.-='))
          .filter(([path, expected]) => JSON.stringify(beforeValues[path]) !== JSON.stringify(expected));
        if (cancelled.length > 0) {
          const preview = cancelled.slice(0, 3).map(([path, expected]) =>
            `${path}: expected ${JSON.stringify(expected)}, before ${JSON.stringify(beforeValues[path])}`
          ).join('; ');
          throw new Error(
            `UPDATE_ACTIVE_EFFECT_NOT_PERSISTED: effect.update() returned undefined (preUpdate cancelled write?). ${preview}`,
          );
        }
      }
      // BUG-279: _findEffect throws when not found, so wrap in try/catch to make the
      // UPDATE_ACTIVE_EFFECT_NOT_PERSISTED sentinel reachable.
      let freshEffect: any;
      try {
        freshEffect = this._findEffect(item, effect.id);
      } catch {
        throw new Error(`UPDATE_ACTIVE_EFFECT_NOT_PERSISTED: effect ${effect.id} disappeared after update`);
      }
      // BUG-342: foundry.utils.flattenObject treats arrays as LEAF values, so the whole
      // `system.scriptData` array is a single flat key whose wfrp4e-normalized `options`
      // sub-object never matches the MCP payload template (whole-array compare false-fails).
      // Skip it from the generic drift verify; verify the meaningful scriptData[0] fields instead.
      const scriptDataSkip = touchedScript ? ['system.scriptData'] : [];
      verifyDocWrite(freshEffect, flatUpdate, 'UPDATE_ACTIVE_EFFECT_NOT_PERSISTED', { skipPaths: scriptDataSkip });
      if (touchedScript) {
        const sd0: any = (freshEffect as any).system?.scriptData?.[0] ?? {};
        for (const f of ['script', 'trigger', 'label'] as const) {
          if (typeof data.updates[f] === 'string' && sd0[f] !== data.updates[f]) {
            throw new Error(
              `UPDATE_ACTIVE_EFFECT_NOT_PERSISTED: scriptData.${f} did not persist (expected ${JSON.stringify(data.updates[f])}, got ${JSON.stringify(sd0[f])})`,
            );
          }
        }
      }

      notify.updated('active-effect', effect.name, {
        summary: `on ${item.name}`,
        uuid: (effect as any).uuid,
      });

      const base: any = {
        success: true,
        scope,
        actorId: owner?.id ?? null,
        itemId: item.id,
        effectId: effect.id,
        effectName: effect.name,
        updated: Object.keys(updatePayload),
      };
      if (data.returnFullPayload === true) {
        base.effectData = freshEffect.toObject?.() ?? null;
      }
      return base;
    } catch (error) {
      throw new Error(
        `Failed to update active effect: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Phase 5 follow-up B — remove an ActiveEffect from an item.
   * Phase 4 mcp_coverage_expansion — also handles scope:'actor-direct' (effect on the actor itself).
   */
  async deleteActiveEffect(data: {
    target:
    | { scope: 'actor'; actorId?: string | undefined; actorName?: string | undefined; itemId?: string | undefined; itemName?: string | undefined }
    | { scope: 'world'; itemId?: string | undefined; itemName?: string | undefined }
    | { scope: 'actor-direct'; actorId?: string | undefined; actorName?: string | undefined };
    effectId?: string | undefined;
    effectName?: string | undefined;
  }): Promise<any> {
    this.validateFoundryState();
    if (!data.effectId && !data.effectName) {
      throw new Error('deleteActiveEffect requires one of effectId or effectName');
    }
    try {
      // --- actor-direct branch ---
      if (data.target.scope === 'actor-direct') {
        const actorDirect = data.target as { scope: 'actor-direct'; actorId?: string; actorName?: string };
        const actor = this._resolveActor(actorDirect.actorId, actorDirect.actorName);
        const effect: any = this._findEffect(actor, data.effectId, data.effectName);
        const effectId: string = effect.id;
        const effectName: string = effect.name;
        await actor.deleteEmbeddedDocuments('ActiveEffect', [effectId]);
        // CCR-2a verify gone
        if (actor.effects.get(effectId)) {
          throw new Error(`DELETE_ACTIVE_EFFECT_NOT_PERSISTED: effect ${effectId} still present after delete`);
        }
        notify.deleted('active-effect', effectName, { summary: `from ${actor.name}` });
        return {
          success: true,
          scope: 'actor-direct',
          actorId: actor.id,
          actorName: actor.name,
          itemId: null,
          effectId,
          effectName,
          parentType: 'Actor' as const,
        };
      }

      // --- item path (scope:'actor' or scope:'world') — unchanged ---
      const { item, owner, scope } = this._resolveItem(this._targetToResolverInput(data.target as any));
      const effect: any = this._findEffect(item, data.effectId, data.effectName);
      const effectId: string = effect.id;
      const effectName: string = effect.name;
      await item.deleteEmbeddedDocuments('ActiveEffect', [effectId]);
      notify.deleted('active-effect', effectName, { summary: `from ${item.name}` });
      return {
        success: true,
        scope,
        actorId: owner?.id ?? null,
        itemId: item.id,
        effectId,
        effectName,
      };
    } catch (error) {
      throw new Error(
        `Failed to delete active effect: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Translate an ItemTarget (scope discriminator) into the _resolveItem
   * argument shape (destination discriminator). Keeps _resolveItem's single
   * input shape shared with updateItem / deleteItem.
   */
  private _targetToResolverInput(target: any): {
    itemId?: string | undefined;
    itemName?: string | undefined;
    destination:
    | { type: 'actor'; actorId?: string | undefined; actorName?: string | undefined }
    | { type: 'world' };
  } {
    if (target?.scope === 'world') {
      return {
        itemId: target.itemId,
        itemName: target.itemName,
        destination: { type: 'world' },
      };
    }
    return {
      itemId: target.itemId,
      itemName: target.itemName,
      destination: {
        type: 'actor',
        actorId: target.actorId,
        actorName: target.actorName,
      },
    };
  }

  // BUG-051 hotfix companion — delete a single scene token. Pairs with addActorsToScene.
  async deleteToken(data: { sceneId: string; tokenId: string }): Promise<any> {
    this.validateFoundryState();

    try {
      const scene: any = (game.scenes as any)?.get(data.sceneId);
      if (!scene) {
        throw new Error(`Scene not found with ID: ${data.sceneId}`);
      }

      const token: any = scene.tokens?.get(data.tokenId);
      if (!token) {
        throw new Error(`Token not found with ID: ${data.tokenId} on scene ${scene.name}`);
      }

      const tokenName = token.name;

      await scene.deleteEmbeddedDocuments('Token', [data.tokenId]);

      notify.deleted('token', tokenName, { summary: `from scene ${scene.name}` });

      return {
        success: true,
        sceneId: scene.id,
        tokenId: data.tokenId,
        tokenName,
      };
    } catch (error) {
      throw new Error(`Failed to delete token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================
  // Phase 4b — combat / damage / conditions / active-effects
  // ============================================================

  private resolveCombat(combatId?: string): any {
    const combats: any = (game as any).combats;
    if (combatId) return combats?.get(combatId) ?? null;
    // Primary: game.combats.active (the combat flagged active on the viewed/active scene).
    if (combats?.active) return combats.active;
    // BUG-354 fallback: game.combats.active can read null in the headless MCP path after
    // remove-combatants vacates the turn-holder (the .active getter resolves via the viewed
    // scene + combat.active flag, which can desync when the current-turn slot is emptied),
    // even though the Combat document still lives in game.combats. Recover it so no-combatId
    // callers (end-combat, advance-combat) keep working: prefer a combat on the active scene,
    // else fall back to the sole combat if exactly one exists.
    const all: any[] = Array.from(combats?.values?.() ?? combats?.contents ?? []);
    if (all.length === 0) return null;
    const sceneId: string | undefined = (game as any).scenes?.active?.id ?? (game as any).scenes?.current?.id;
    if (sceneId) {
      const onScene = all.find((c: any) => (c.scene?.id ?? c.scene) === sceneId);
      if (onScene) return onScene;
    }
    return all.length === 1 ? all[0] : null;
  }

  private snapshotStatus(actor: any): any {
    const status: any = actor.system?.status ?? {};
    const conditions: string[] = (actor.effects ?? [])
      .filter((e: any) => e.isCondition)
      .map((e: any) => (e.conditionKey ?? e.statuses?.first?.() ?? e.name) as string)
      .filter(Boolean);
    return {
      wounds: {
        value: status.wounds?.value ?? 0,
        max: status.wounds?.max ?? 0,
      },
      criticalWounds: {
        value: status.criticalWounds?.value ?? 0,
        max: status.criticalWounds?.max ?? 0,
      },
      fate: { value: status.fate?.value ?? 0 },
      fortune: { value: status.fortune?.value ?? 0 },
      advantage: { value: status.advantage?.value ?? 0 },
      conditions,
    };
  }

  async getCombat(data: { combatId?: string | undefined } = {}): Promise<any> {
    this.validateFoundryState();
    const combat = this.resolveCombat(data.combatId);
    if (!combat) return null;
    return {
      id: combat.id,
      round: combat.round,
      turn: combat.turn,
      active: combat.active,
      started: combat.started,
      sceneId: combat.scene?.id ?? null,
      currentCombatantId: combat.combatant?.id ?? null,
      combatantCount: combat.turns?.length ?? 0,
    };
  }

  async listCombatants(data: { combatId?: string | undefined } = {}): Promise<any[]> {
    this.validateFoundryState();
    const combat = this.resolveCombat(data.combatId);
    if (!combat) return [];
    return (combat.turns ?? []).map((c: any) => ({
      id: c.id,
      actorId: c.actorId ?? c.actor?.id ?? null,
      tokenId: c.tokenId ?? c.token?.id ?? null,
      name: c.name,
      initiative: c.initiative,
      defeated: c.defeated ?? false,
      hidden: c.hidden ?? false,
    }));
  }

  async advanceCombat(data: {
    combatId?: string | undefined;
    action: 'start' | 'next' | 'prev' | 'nextRound' | 'prevRound' | 'rollAll' | 'rollNPC';
  }): Promise<any> {
    this.validateFoundryState();
    const combat: any = this.resolveCombat(data.combatId);
    if (!combat) throw new Error('No combat found');

    switch (data.action) {
      case 'start':
        await combat.startCombat();
        break;
      case 'next':
        await combat.nextTurn();
        break;
      case 'prev':
        await combat.previousTurn();
        break;
      case 'nextRound':
        await combat.nextRound();
        break;
      case 'prevRound':
        await combat.previousRound();
        break;
      case 'rollAll':
        await combat.rollAll();
        break;
      case 'rollNPC':
        await combat.rollNPC();
        break;
    }

    notify.updated('combat', combat.id, {
      summary: `action: ${data.action}, round ${combat.round}`,
    });

    return {
      combatId: combat.id,
      round: combat.round,
      turn: combat.turn,
      combatantId: combat.combatant?.id ?? null,
    };
  }

  async addCombatants(data: {
    combatId?: string | undefined;
    actorIds: string[];
    sceneId?: string | undefined;
  }): Promise<{ added: string[] }> {
    this.validateFoundryState();
    let combat: any = this.resolveCombat(data.combatId);

    if (!combat) {
      const sceneId = data.sceneId ?? (game as any).scenes?.active?.id;
      if (!sceneId) throw new Error('No active scene and no sceneId provided');
      combat = await (Combat as any).create({ scene: sceneId, active: true });
    }

    const scene: any = combat.scene ?? (game as any).scenes?.get(data.sceneId) ?? (game as any).scenes?.active;
    const creates: any[] = [];
    const missingTokens: string[] = [];
    for (const actorId of data.actorIds) {
      const actor: any = (game as any).actors?.get(actorId);
      if (!actor) continue;
      const token: any = scene?.tokens?.find((t: any) => t.actorId === actorId);
      if (!token?.id) {
        missingTokens.push(`${actor.name ?? actorId} (${actorId})`);
        continue;
      }
      creates.push({
        actorId,
        tokenId: token.id,
        sceneId: scene?.id,
        hidden: token?.hidden ?? false,
      });
    }

    if (missingTokens.length > 0) {
      const sceneLabel = scene?.name ?? scene?.id ?? data.sceneId ?? '(unknown scene)';
      throw new Error(
        `ADD_COMBATANTS_TOKEN_REQUIRED: add-combatants requires a scene-placed token on scene "${sceneLabel}". Missing token context for: ${missingTokens.join(', ')}. Pass sceneId for the target scene or place tokens before adding combatants.`,
      );
    }

    const created: any[] = await combat.createEmbeddedDocuments('Combatant', creates);
    if (created.length > 0) {
      notify.created('combatant', `${created.length} combatant(s)`, {
        summary: `to combat ${combat.id}`,
      });
    }
    return { added: created.map((c: any) => c.id).filter(Boolean) };
  }

  async removeCombatants(data: {
    combatId?: string | undefined;
    combatantIds: string[];
  }): Promise<{ removed: string[] }> {
    this.validateFoundryState();
    const combat: any = this.resolveCombat(data.combatId);
    if (!combat) throw new Error('No combat found');
    // BUG-215 + PARITY-025: pre-filter the requested IDs against the live combatant
    // collection BEFORE deleting. Foundry's deleteEmbeddedDocuments THROWS on any id not
    // present in the EmbeddedCollection (it does NOT silently skip), so a mixed valid/bogus
    // batch would otherwise fail wholesale and remove nothing. We then map the delete return
    // to surface only the IDs Foundry actually removed (mirrors addCombatants:5400).
    // (BUG-215 re-fix 2026-05-24: original fix assumed silent-skip — a false premise surfaced
    // by /agent-validate live eval; deleteEmbeddedDocuments throws, so the pre-filter is required.)
    const validIds = data.combatantIds.filter((id) => combat.combatants?.get(id));
    const deleted = validIds.length
      ? await combat.deleteEmbeddedDocuments('Combatant', validIds)
      : [];
    const removedIds = deleted.map((c: any) => c.id).filter(Boolean);
    notify.deleted('combatant', `${removedIds.length} combatant(s)`, {
      summary: `from combat ${combat.id}`,
    });
    return { removed: removedIds };
  }

  async endCombat(data: { combatId?: string | undefined } = {}): Promise<{ ended: string }> {
    this.validateFoundryState();
    const combat: any = this.resolveCombat(data.combatId);
    if (!combat) throw new Error('No combat found');
    const id: string = combat.id;
    await combat.delete();
    notify.deleted('combat', id, { summary: 'combat ended' });
    return { ended: id };
  }

  private async waitForActorUpdateCommit(actorId: string, timeoutMs: number = 250): Promise<void> {
    const hooksApi: any = (globalThis as any).Hooks;
    if (!hooksApi?.on || !hooksApi?.off) {
      await Promise.resolve();
      return;
    }

    let hookId: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    try {
      await new Promise<void>((resolve) => {
        hookId = hooksApi.on('updateActor', (updatedActor: any) => {
          if (updatedActor?.id === actorId) {
            resolve();
          }
        });
        timeoutHandle = setTimeout(resolve, timeoutMs);
      });
    } finally {
      if (hookId !== undefined) hooksApi.off('updateActor', hookId);
      if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
    }
  }

  async applyDamage(data: {
    actorId: string;
    amount: number;
    damageType?: 'NORMAL' | 'IGNORE_AP' | 'IGNORE_TB' | 'IGNORE_ALL' | undefined;
    hitLocation?: 'head' | 'body' | 'rArm' | 'lArm' | 'rLeg' | 'lLeg' | undefined;
  }): Promise<any> {
    this.validateFoundryState();
    const actor: any = (game as any).actors?.get(data.actorId);
    if (!actor) throw new Error(`Actor not found with ID: ${data.actorId}`);

    const damageType = data.damageType ?? 'NORMAL';
    // BUG-344: wfrp4e exposes its config as `game.wfrp4e.config`, NOT `CONFIG.WFRP4E`
    // (the latter is undefined in this system — verified live + against wfrp4e.js:33298
    // `game.wfrp4e = { …, config: WFRP4E }`). The old `CONFIG.WFRP4E.DAMAGE_TYPE` lookup
    // always returned undefined → `?? 0` → every IGNORE_* variant silently collapsed to
    // NORMAL, so AP+TB soak was applied regardless of damageType (IGNORE_ALL removed
    // amount−TB, not the full amount). Use the canonical game.wfrp4e.config accessor.
    const wfrp4eConfig: any = (globalThis as any).game?.wfrp4e?.config ?? {};
    const damageTypeConst: any = wfrp4eConfig.DAMAGE_TYPE?.[damageType] ?? 0;

    const before = this.snapshotStatus(actor);

    // BUG-064: wfrp4e's applyDamage at wfrp4e.js:13074 calls `actor.update({...})` fire-and-forget,
    // so applyBasicDamage resolves before the wounds mutation lands on the local document.
    // Snapshotting immediately after the await returned `before === after`. We pre-register a
    // listener for the next updateActor hook on this actor and wait on it before sampling `after`.
    // The 2s safety timeout handles edge cases (e.g. wfrp4e routing the call via SocketHandlers
    // to an offline player owner, where the update will never propagate back this session).
    let hookId: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    const updateApplied = new Promise<void>((resolve) => {
      hookId = (Hooks as any).on('updateActor', (updatedActor: any) => {
        if (updatedActor?.id === actor.id) {
          resolve();
        }
      });
      timeoutHandle = setTimeout(resolve, 2000);
    });

    try {
      // wfrp4e signature is `applyBasicDamage(damage, { damageType, loc, ... })` where `loc`
      // is a plain string ("body", "head", ...). The prior `hitloc: { result: ... }` shape was
      // not recognised by the destructure and silently fell back to the default "body".
      await actor.applyBasicDamage(data.amount, {
        damageType: damageTypeConst,
        loc: data.hitLocation ?? 'body',
      });
      await updateApplied;
    } finally {
      if (hookId !== undefined) (Hooks as any).off('updateActor', hookId);
      if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
    }

    const after = this.snapshotStatus(actor);

    // Surface canvas-anchored feedback when actor has a token on the current scene.
    const damageDelta = (before?.wounds?.value ?? 0) - (after?.wounds?.value ?? 0);
    const placedToken: any = (globalThis as any).canvas?.tokens?.placeables?.find(
      (t: any) => t?.actor?.id === actor.id,
    );
    const tokenDoc = placedToken?.document;
    notify.updated('actor', actor.name, {
      summary: `damage applied (${damageDelta > 0 ? '-' : ''}${Math.abs(damageDelta)} wounds, ${data.hitLocation ?? 'body'})`,
      uuid: actor.uuid,
      tooltip: tokenDoc ? { tokenDoc, message: `-${Math.abs(damageDelta)} wounds` } : undefined,
    });

    return {
      actorId: actor.id,
      damage: {
        amount: data.amount,
        damageType,
        hitLocation: data.hitLocation,
      },
      before,
      after,
    };
  }

  async applyCondition(data: {
    actorId: string;
    conditionKey: string;
    value?: number | undefined;
  }): Promise<any> {
    this.validateFoundryState();
    const actor: any = (game as any).actors?.get(data.actorId);
    if (!actor) throw new Error(`Actor not found with ID: ${data.actorId}`);

    // BUG-344 (same root cause): wfrp4e config is on game.wfrp4e.config, not CONFIG.WFRP4E.
    // The old CONFIG.WFRP4E.conditions lookup returned undefined → validKeys=[] → the guard
    // below was silently skipped, so unknown condition keys were never rejected.
    const validKeys = Object.keys((globalThis as any).game?.wfrp4e?.config?.conditions ?? {});
    if (validKeys.length && !validKeys.includes(data.conditionKey)) {
      throw new Error(
        `Unknown condition key '${data.conditionKey}'. Valid: ${validKeys.join(', ')}`,
      );
    }

    const value = data.value ?? 1;
    await actor.addCondition(data.conditionKey, value);
    const stacked: any = actor.hasCondition?.(data.conditionKey);
    const stackCount =
      typeof stacked === 'object'
        ? stacked?.conditionValue ?? stacked?.flags?.wfrp4e?.value ?? value
        : value;

    // Surface canvas-anchored feedback when actor has a token on the current scene.
    const placedToken: any = (globalThis as any).canvas?.tokens?.placeables?.find(
      (t: any) => t?.actor?.id === actor.id,
    );
    const tokenDoc = placedToken?.document;
    notify.created('condition', data.conditionKey, {
      summary: `on ${actor.name} (stack ${stackCount})`,
      uuid: actor.uuid,
      tooltip: tokenDoc ? { tokenDoc, message: `+${data.conditionKey}` } : undefined,
    });

    return {
      actorId: actor.id,
      conditionKey: data.conditionKey,
      stackCount,
    };
  }

  async removeCondition(data: {
    actorId: string;
    conditionKey: string;
    count?: number | undefined;
  }): Promise<any> {
    this.validateFoundryState();
    const actor: any = (game as any).actors?.get(data.actorId);
    if (!actor) throw new Error(`Actor not found with ID: ${data.actorId}`);
    const count = data.count ?? 1;
    await actor.removeCondition(data.conditionKey, count);
    const stacked: any = actor.hasCondition?.(data.conditionKey);
    const remainingCount =
      stacked && typeof stacked === 'object'
        ? stacked?.conditionValue ?? stacked?.flags?.wfrp4e?.value ?? 0
        : stacked
          ? 1
          : 0;
    notify.deleted('condition', data.conditionKey, {
      summary: `from ${actor.name} (${count} stack(s) removed)`,
      uuid: (actor as any).uuid,
    });
    return {
      actorId: actor.id,
      conditionKey: data.conditionKey,
      remainingCount,
    };
  }

  async listConditions(data: { actorId: string }): Promise<any[]> {
    this.validateFoundryState();
    const actor: any = (game as any).actors?.get(data.actorId);
    if (!actor) throw new Error(`Actor not found with ID: ${data.actorId}`);
    return (actor.effects ?? [])
      .filter((e: any) => e.isCondition)
      .map((e: any) => ({
        conditionKey: e.conditionKey ?? e.statuses?.first?.() ?? e.name,
        value:
          e.conditionValue ?? e.flags?.wfrp4e?.value ?? 1,
        effectId: e.id,
      }));
  }

  async listActiveEffects(data: {
    actorId: string;
    filter?: 'all' | 'applied' | 'temporary' | 'conditions' | undefined;
    includeItemAEs?: boolean | undefined;
  }): Promise<any[]> {
    this.validateFoundryState();
    const actor: any = (game as any).actors?.get(data.actorId);
    if (!actor) throw new Error(`Actor not found with ID: ${data.actorId}`);

    const filter = data.filter ?? 'all';

    // TOOL-IDEA-002 (2026-05-14): per-effect projection helper. parentType/parentId/
    // parentName disambiguate actor-level vs item-level AEs in the flat array result.
    const projectEffect = (e: any, parent: any, parentType: 'Actor' | 'Item') => ({
      id: e.id,
      name: e.name,
      img: e.img ?? e.icon ?? null,
      statuses: Array.from(e.statuses ?? []),
      disabled: !!e.disabled,
      duration: {
        rounds: e.duration?.rounds ?? null,
        turns: e.duration?.turns ?? null,
        seconds: e.duration?.seconds ?? null,
      },
      origin: e.origin ?? null,
      changes: (e.changes ?? []).map((c: any) => ({
        key: c.key,
        mode: c.mode,
        value: c.value,
        priority: c.priority ?? null,
      })),
      parentType,
      parentId: parent?.id,
      parentName: parent?.name,
    });

    // Filter predicate applied per-AE so item-level AEs get the same treatment as
    // actor-level (e.g. filter=temporary still hides non-temporary item-AEs).
    const applyFilter = (e: any): boolean => {
      switch (filter) {
        case 'applied':
          return !e.disabled;
        case 'temporary':
          return !!(e.duration?.rounds || e.duration?.turns || e.duration?.seconds);
        case 'conditions':
          return !!e.isCondition;
        default:
          return true;
      }
    };

    // Actor-level AEs: preserve original semantics by using actor.appliedEffects /
    // actor.temporaryEffects when filter selects them (those collections already do
    // the work in a system-aware way), otherwise iterate actor.effects + filter.
    let actorAEs: any[];
    if (filter === 'applied') {
      actorAEs = Array.from(actor.appliedEffects ?? []);
    } else if (filter === 'temporary') {
      // BUG-364: actor.temporaryEffects includes status/condition AEs whose isTemporary is
      // true purely from a statusId but whose duration fields are all null — i.e. not actually
      // time-bound. Use actor.effects + applyFilter (rounds/turns/seconds > 0) so the actor-level
      // result matches the item-level predicate and only genuinely time-bound AEs are returned.
      actorAEs = Array.from(actor.effects ?? []).filter(applyFilter);
    } else if (filter === 'conditions') {
      actorAEs = Array.from(actor.effects ?? []).filter((e: any) => e.isCondition);
    } else {
      actorAEs = Array.from(actor.effects ?? []);
    }

    const out: any[] = actorAEs.map((e: any) => projectEffect(e, actor, 'Actor'));

    if (data.includeItemAEs) {
      const items: any[] = Array.from(actor.items ?? []);
      for (const item of items) {
        const itemEffects: any[] = (item.effects as any)?.contents
          ?? Array.from(item.effects ?? []);
        for (const e of itemEffects) {
          if (applyFilter(e)) {
            out.push(projectEffect(e, item, 'Item'));
          }
        }
      }
    }

    return out;
  }

  /**
   * TOOL-IDEA-003 (2026-05-14): read-only AE-by-name resolver.
   * Phase 4 mcp_coverage_expansion — also handles scope:'actor-direct': resolves
   * actor.effects directly and returns parentType:'Actor' (R4.4).
   * Replaces the update-active-effect+returnFullPayload=true discovery workaround.
   * effectId authoritative, effectName case-insensitive exact match. Pure read — no .update(),
   * no deleteEmbeddedDocuments calls.
   */
  async getActiveEffectByName(data: {
    target:
    | { scope: 'actor'; actorId?: string | undefined; actorName?: string | undefined; itemId?: string | undefined; itemName?: string | undefined }
    | { scope: 'world'; itemId?: string | undefined; itemName?: string | undefined }
    | { scope: 'actor-direct'; actorId?: string | undefined; actorName?: string | undefined };
    effectId?: string | undefined;
    effectName?: string | undefined;
  }): Promise<any> {
    this.validateFoundryState();
    if (!data.effectId && !data.effectName) {
      throw new Error('getActiveEffectByName requires one of effectId or effectName');
    }
    try {
      // Helper to project an AE's public fields
      const projectAE = (effect: any) => ({
        id: effect.id,
        name: effect.name,
        img: effect.img ?? effect.icon ?? null,
        statuses: Array.from(effect.statuses ?? []),
        disabled: !!effect.disabled,
        duration: {
          rounds: effect.duration?.rounds ?? null,
          turns: effect.duration?.turns ?? null,
          seconds: effect.duration?.seconds ?? null,
        },
        origin: effect.origin ?? null,
        changes: (effect.changes ?? []).map((c: any) => ({
          key: c.key,
          mode: c.mode,
          value: c.value,
          priority: c.priority ?? null,
        })),
      });

      // --- actor-direct branch: search actor.effects directly (R4.4) ---
      if (data.target.scope === 'actor-direct') {
        const actorDirect = data.target as { scope: 'actor-direct'; actorId?: string; actorName?: string };
        const actor = this._resolveActor(actorDirect.actorId, actorDirect.actorName);
        const effect: any = this._findEffect(actor, data.effectId, data.effectName);
        return {
          success: true,
          scope: 'actor-direct',
          actorId: actor.id,
          itemId: null,
          itemName: null,
          effectId: effect.id,
          effectName: effect.name,
          parentType: 'Actor' as const,
          parentId: actor.id,
          parentName: actor.name,
          effect: projectAE(effect),
        };
      }

      // --- item path (scope:'actor' or scope:'world') — parentType:'Item' ---
      const { item, owner, scope } = this._resolveItem(this._targetToResolverInput(data.target as any));
      const effect: any = this._findEffect(item, data.effectId, data.effectName);
      return {
        success: true,
        scope,
        actorId: owner?.id ?? null,
        itemId: item.id,
        itemName: item.name,
        effectId: effect.id,
        effectName: effect.name,
        parentType: 'Item' as const,
        parentId: item.id,
        parentName: item.name,
        effect: projectAE(effect),
      };
    } catch (error) {
      throw new Error(
        `Failed to get active effect: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Phase 4c.0 — read whitelisted CONFIG.WFRP4E.* keys for skill-side rule lookups.
   * Skills (e.g. /wfrp-advance, /wfrp-status) need authoritative WFRP rule tables
   * (xpCost, talentMax, statusTiers, earningValues, ...) at runtime so they can
   * compute costs without hardcoding (BUG-001 / BUG-018). Whitelist enforced here
   * so skills can't read arbitrary `game.wfrp4e.config.*` paths.
   */
  async getWfrp4eConfig(data: { keys: string[] }): Promise<Record<string, unknown>> {
    this.validateFoundryState();
    const ALLOWED = new Set([
      'xpCost',
      'talentMax',
      'characteristics',
      'characteristicsAbbrev',
      'characteristicsBonus',
      'careerLevels',
      'statusTiers',
      'earningValues',
      'moneyValues',
      'moneyNames',
      'conditions',
      'difficultyModifiers',
      'symptoms',
      'mutationTypes',
      'corruptionTables',
      'hitLocationTables',
      // BUG-102 (2026-05-18): weapon/armour enumeration tables surfaced for
      // skill-side qualities/flaws inspection (verifying registered quality
      // labels, looking up quality descriptions, validating weaponGroup +
      // armorType keys against the live runtime).
      'weaponQualities',
      'weaponFlaws',
      'qualityDescriptions',
      'flawDescriptions',
      'weaponGroups',
      'ammunitionGroups',
      'armorTypes',
    ]);
    const config: any = (game as any).wfrp4e?.config ?? (globalThis as any).WFRP4E ?? {};
    const values: Record<string, unknown> = {};
    const skipped: string[] = [];
    for (const key of data.keys) {
      if (!ALLOWED.has(key)) {
        skipped.push(key);
        continue;
      }
      values[key] = this.resolveI18nDeep(config[key] ?? null);
    }
    return { values, skipped };
  }

  /**
   * Recursively walk a CONFIG.WFRP4E.* subtree and localize any leaf string
   * that looks like an i18n key (matches /^WFRP4E\./). Cycle-safe via WeakSet
   * mirror of removeSensitiveFields pattern (EVAL-010).
   */
  private resolveI18nDeep(value: any, visited: WeakSet<object> = new WeakSet(), depth: number = 0): any {
    if (depth > 50) return value;
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      if (/^WFRP4E\./.test(value)) {
        try {
          const localized = (game as any)?.i18n?.localize?.(value);
          return typeof localized === 'string' && localized.length > 0 ? localized : value;
        } catch {
          return value;
        }
      }
      return value;
    }
    if (typeof value !== 'object') return value;
    if (visited.has(value)) return value;
    visited.add(value);
    if (Array.isArray(value)) {
      return value.map((v) => this.resolveI18nDeep(v, visited, depth + 1));
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = this.resolveI18nDeep(v, visited, depth + 1);
    }
    return out;
  }

}
