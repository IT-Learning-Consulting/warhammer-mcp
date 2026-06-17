import { MODULE_ID, ERROR_MESSAGES } from './constants.js';
import { notify } from './notify.js';
import { ScenePlacementService, EffectsService, ItemService, ActorService, type CompendiumSearchService } from './services/index.js';
import { findActorByIdentifier } from './utils/actor-lookup.js';
// Phase 7 (R7.1): shared document/folder/observer helpers extracted VERBATIM to services/shared/.
// Used by the surviving effect READS here (getActiveEffectByName / listActiveEffects) + the actor/item/
// effect mutation methods until they migrate to their services in 7.4-7.6 (which import the same helpers).
// Effect READS that stay here (getActiveEffectByName / listActiveEffects) still use the shared resolvers.
import { _resolveActor, _resolveItem, _findEffect, _targetToResolverInput } from './services/shared/document-resolver.js';
// Phase 7 (R7.1): actor-creation + compendium-entry DTOs relocated to ./service-interfaces.ts so
// ActorService + the surviving getCompendiumDocumentFull read share them (no cross-service import).
import type {
  ActorCreationRequest,
  ActorCreationResult,
  CompendiumEntryFull,
} from './service-interfaces.js';
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
// ./service-interfaces.ts (shared by the extracted services/ files).
// Phase 5 (R5.1): SceneInfo / SceneToken / SceneNote / SceneTokenPlacement / TokenPlacementResult
// likewise relocated to ./service-interfaces.ts (imported at the top); shared with ScenePlacementService.

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

// Phase 4 (R3.3): Contract step. The persistent creature index + the compendium-search cluster have fully
// left FoundryDataAccess — QueryHandlers (the composition layer) now owns the creature index + search
// service, and the index rebuild wrapper lives on the index service's own rebuildEnhancedIndex() method.
// The only residual coupling is an injected CompendiumSearchService used by createActorFromCompendium.

export class FoundryDataAccess {
  private moduleId: string = MODULE_ID;
  // Injected by QueryHandlers (the owner of the creature index + search service). Optional so the many
  // `new FoundryDataAccess()` test constructions that never touch compendium matching keep compiling.
  private compendiumSearch: CompendiumSearchService | undefined;
  // Phase 5 (R4.3): Contract — the player-rolls + roll-button + player-lookup cluster has fully left
  // FoundryDataAccess. QueryHandlers (the composition layer) now owns those three services and the live
  // call sites (queries.ts handleRequestPlayerRolls + main.ts roll-button hooks/socket) call them directly.
  // Phase 5 (R5.1): scene/token-placement + combat + conditions clusters extracted to ScenePlacementService /
  // CombatService / ConditionsService (branch-by-abstraction Migrate).
  // Phase 6 (R5.2): Contract — combat + conditions promoted to QueryHandlers (their facade delegates were
  // deleted). scene-placement stays here as facade delegates below (2 internal self-callers in createActors/
  // createActor still resolve via this injected field; its Contract lands in Phase 7 with services/actor.ts).
  private readonly scenePlacement: ScenePlacementService;
  // Phase 7 (R7.1): active-effect MUTATION cluster extracted to services/effects.ts (Migrate). This file
  // keeps thin facade delegates above (Contract → Phase 8); effect READS stay here. Single seam:
  // validateState (the cluster uses no auditLog).
  private readonly effectsService: EffectsService;
  // Phase 7 (R7.1): item MUTATION cluster (+ 2 absorbed handler bodies) extracted to services/item.ts.
  private readonly itemService: ItemService;
  // Phase 7 (R7.1/R7.2): actor MUTATION + CREATION cluster (+ updateActor orchestrator) extracted to
  // services/actor.ts. The 2 scene-placement self-callers + getCompendiumDocumentFull are ctor-injected.
  // scenePlacement injection STAYS this phase (drops at Phase 8 Contract, per Design Decisions).
  private readonly actorService: ActorService;

  // Phase 6 (R5.2): scenePlacement is ctor-injected by QueryHandlers (the promotion owner) so external
  // handlers + the 2 internal self-callers (createActors/createActor) share one instance. The `??`
  // fallback self-constructs for the many bare `new FoundryDataAccess()` test constructions (they never
  // inject); both paths wire the same validateState + auditLog seams (HC1 audit behavior preserved).
  constructor(compendiumSearch?: CompendiumSearchService, scenePlacement?: ScenePlacementService) {
    this.compendiumSearch = compendiumSearch;
    this.scenePlacement = scenePlacement ?? new ScenePlacementService(
      () => this.validateFoundryState(),
      (operation, data, result, error) => this.auditLog(operation, data, result, error),
    );
    this.effectsService = new EffectsService(() => this.validateFoundryState());
    this.itemService = new ItemService(() => this.validateFoundryState());
    this.actorService = new ActorService(
      this.scenePlacement,
      this.compendiumSearch,
      () => this.validateFoundryState(),
      (operation, data, result, error) => this.auditLog(operation, data, result, error),
      (packId, documentId) => this.getCompendiumDocumentFull(packId, documentId),
    );
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
      actor = findActorByIdentifier(identifier);
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
  // Phase 6 (R5.2): public so QueryHandlers can wire the promoted ScenePlacementService's auditLog seam
  // to this method (scene-placement audit entries still land in the same world-flag log).
  public auditLog(operation: string, data: any, result: 'success' | 'failure', error?: string): void {
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
    // Phase 7 (R7.1): facade delegate → ActorService (Migrate; Contract deferred to Phase 8).
    return this.actorService.deleteActor(data);
  }

  // Phase 3 mcp_crud_expansion — deleteJournalEntry retired here.
  // Superseded by handlers/journal.ts deleteEntry (BUG-070 post-verify included).

  /**
   * Create actors from compendium entries with custom names
   */
  async createActorFromCompendium(request: ActorCreationRequest): Promise<ActorCreationResult> {
    // Phase 7 (R7.1): facade delegate → ActorService (createActorFromSource moved with it).
    return this.actorService.createActorFromCompendium(request);
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
    // Phase 7 (R7.1): facade delegate → ActorService.
    return this.actorService.createActorFromCompendiumEntry(request);
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
   * Create actor from source document with custom name
   */
  // Phase 7 (R7.1): createActorFromSource (private; only caller was createActorFromCompendium) moved to
  // services/actor.ts with the cluster.

  // Phase 1 mcp_crud_expansion (2026-05-14): the actor-only `setActorOwnership`
  // and `getActorOwnership` methods that lived here are removed. The polymorphic
  // replacements live in `handlers/ownership.ts` and are dispatched from
  // queries.ts. The deprecation wrappers in queries.ts now strict-parse legacy
  // input and return a deprecation error pointing at the new surface.


  /**
   * Create a new actor
   * Creates an actor with the provided data structure.
   * HC9: optional `options` bag plumbed to Actor.create(data, options) — supports
   * `skipItems` to suppress wfrp4e _preCreate basic-skills dialog (mirror of BUG-089).
   */
  async createActor(data: { actorData: Record<string, any>; options?: { skipItems?: boolean } | undefined }): Promise<any> {
    // Phase 7 (R7.1): facade delegate → ActorService.
    return this.actorService.createActor(data);
  }

  /**
   * Duplicate an existing world actor.
   * Phase 4g primitive — clones source via toObject() with _id/folder/sort stripped,
   * then persists via Actor.create. Preferred for /wfrp-build-npc Branch 2/3 (NPC-type
   * templates) to avoid compendium re-cloning.
   */
  async duplicateActor(data: { sourceActorId: string; newName?: string | undefined }): Promise<any> {
    // Phase 7 (R7.1): facade delegate → ActorService.
    return this.actorService.duplicateActor(data);
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
    // Phase 7 (R7.1): facade delegate → ActorService.
    return this.actorService.applyNpcCareerAdvance(data);
  }

  /**
   * Update actor data
   * Allows updating any actor properties using dot notation for nested fields
   */
  async updateActor(data: { actorId: string; updateData: Record<string, any>; warnings?: string[]; verifyPersistence?: boolean | undefined }): Promise<any> {
    // Phase 7 (R7.1/R7.2): facade delegate → ActorService (the orchestrator + formatActorUpdateSummary
    // split lives there now; Contract deferred to Phase 8).
    return this.actorService.updateActor(data);
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
    // Phase 7 (R7.1): facade delegate → ItemService (Migrate; Contract deferred to Phase 8).
    return this.itemService.updateItem(data);
  }

  /**
   * Phase 5: Create an item on an actor OR as a world-level document with optional
   * folder placement. Optional compendium-clone seeding and rich-response opt-in.
   */
  async createItem(data: {
    itemData: Record<string, any>;
    destination:
    | { type: 'actor'; actorId?: string | undefined; actorName?: string | undefined }
    | { type: 'world'; folder?: string[] | undefined };
    fromCompendium?: string | undefined;
    returnFullPayload?: boolean | undefined;
  }): Promise<any> {
    // Phase 7 (R7.1): facade delegate → ItemService (the _ensureFolderChain helper moved with it).
    return this.itemService.createItem(data);
  }

  async tradeItem(data: {
    fromActorId: string;
    toActorId: string;
    itemId: string;
    quantity?: number | undefined;
  }): Promise<any> {
    // Phase 7 (R7.1): facade delegate → ItemService.
    return this.itemService.tradeItem(data);
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
    // Phase 7 (R7.1): facade delegate → ItemService.
    return this.itemService.deleteItem(data);
  }

  // Phase 7 (R7.1): NEW thin delegates for the 2 item handler bodies absorbed into ItemService (user Q2).
  // The queries.ts handlers (addItemFromCompendium / modifyItemQualities) keep gmCheck + parse + wrappedWrite
  // + the { success, data } wrap and now call these; query keys + registration are unchanged (tools/list stable).
  async addItemFromCompendium(parsed: any): Promise<any> {
    return this.itemService.addItemFromCompendium(parsed);
  }

  async modifyItemQualities(parsed: any): Promise<any> {
    return this.itemService.modifyItemQualities(parsed);
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
    // Phase 7 (R7.1): facade delegate → EffectsService (Migrate; Contract deferred to Phase 8).
    return this.effectsService.addActiveEffect(data);
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
    // Phase 7 (R7.1): facade delegate → EffectsService (Migrate; Contract deferred to Phase 8).
    return this.effectsService.updateActiveEffect(data);
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
    // Phase 7 (R7.1): facade delegate → EffectsService (Migrate; Contract deferred to Phase 8).
    return this.effectsService.deleteActiveEffect(data);
  }


  // ============================================================
  // Phase 4b — combat / damage / conditions / active-effects
  // ============================================================

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
        const actor = _resolveActor(actorDirect.actorId, actorDirect.actorName);
        const effect: any = _findEffect(actor, data.effectId, data.effectName);
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
      const { item, owner, scope } = _resolveItem(_targetToResolverInput(data.target as any));
      const effect: any = _findEffect(item, data.effectId, data.effectName);
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
