// services/actor.ts — MCP Code-Quality Hardening v1, Phase 7 (R7.1 + R7.2).
//
// The actor MUTATION + CREATION cluster, extracted VERBATIM from data-access.ts (deleteActor /
// createActorFromCompendium / createActorFromCompendiumEntry / createActorFromSource / createActor /
// duplicateActor / applyNpcCareerAdvance / updateActor). FoundryDataAccess keeps thin facade delegates
// (Migrate; Contract → Phase 8). The actor READS (getCharacterInfo / listActors / listActorItems /
// getCompendiumDocumentFull) + applyDamage stay on FoundryDataAccess.
//
// The 2 scene-placement internal self-callers (in createActorFromCompendium/Entry) now resolve through the
// ctor-injected scenePlacement (NOT a services/→services/ import). compendiumSearch, validateState, auditLog,
// and getCompendiumDocumentFull (a surviving DA read) are likewise injected. scenePlacement/compendiumSearch
// are typed `any` because importing their concrete service classes would trip no-cross-service-import; the
// real instances are passed by FoundryDataAccess.
//
// updateActor is the R7.2 orchestrator: prologue + observed single-merged write (BUG-043/018) + BUG-086
// drift-verify + notify, with the 228-line formatter consumed from services/shared/actor-update-summary.
//
// HC1: bodies are byte-identical; the only changes are `this.validateFoundryState()` → `this.validateState()`
// and `this.moduleId` → the imported MODULE_ID constant.

import { MODULE_ID } from '../constants.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { notify } from '../notify.js';
import { getOrCreateFolder } from './shared/folder-helpers.js';
import { buildOperationReceipt } from './shared/operation-receipt.js';
import { waitForActorUpdateCommit } from './shared/actor-update-observer.js';
import { verifyDocWrite } from '../utils/verifyWrite.js';
import { formatActorUpdateSummary } from './shared/actor-update-summary.js';
import type {
  ActorCreationRequest,
  ActorCreationResult,
  CreatedActorInfo,
  CompendiumEntryFull,
} from '../service-interfaces.js';

export class ActorService {
  constructor(
    private readonly scenePlacement: any,
    private readonly compendiumSearch: any,
    private readonly validateState: () => void,
    private readonly auditLog: (operation: string, data: any, result: 'failure' | 'success', error?: any) => void,
    private readonly getCompendiumDocumentFull: (packId: string, documentId: string) => Promise<CompendiumEntryFull>,
  ) {}

  async deleteActor(data: { id: string }): Promise<{ success: boolean }> {
    this.validateState();
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
      throw new Error(`${ErrorTokens.DELETE_ACTOR_NOT_PERSISTED}: actor ${data.id} still present after delete (preDelete hook may have cancelled)`);
    }
    notify.deleted('actor', actorName, { uuid: actorUuid });
    this.auditLog('deleteActor', data, 'success');
    return { success: true };
  }

  /**
   * Create actors from compendium entries with custom names
   */
  async createActorFromCompendium(request: ActorCreationRequest): Promise<ActorCreationResult> {
    this.validateState();

    const maxActors = game.settings.get(MODULE_ID, 'maxActorsPerRequest') as number;
    const quantity = Math.min(request.quantity || 1, maxActors);

    try {
      // Find matching compendium entry (delegated to the injected CompendiumSearchService — Phase 4 R3.3)
      if (!this.compendiumSearch) {
        throw new Error('CompendiumSearchService not provided to FoundryDataAccess');
      }
      const compendiumEntry = await this.compendiumSearch.findBestCompendiumMatch(request.creatureType, request.packPreference);
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
          const tokenResult = await this.scenePlacement.addActorsToScene({
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
    this.validateState();

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
          const folderId = await getOrCreateFolder('Foundry MCP Creatures', 'Actor');
          if (folderId) {
            (actorData as any).folder = folderId;
          }

          // Create the actor
          const newActor = await (Actor as any).create(actorData);
          if (!newActor) {
            throw new Error(`Failed to create actor "${customName}"`);
          }
          // RC1.1a — verify throw stays INSIDE this iteration's try/catch (designed
          // partial-success semantics for the quantity loop; never abort the whole batch).
          if (!(game.actors as any).get(newActor.id)) {
            throw new Error(`${ErrorTokens.ACTOR_CREATE_NOT_PERSISTED}: actor "${customName}" (${newActor.id}) absent from game.actors after create`);
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
          const sceneResult = await this.scenePlacement.addActorsToScene({
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
      // Phase 12 R12.2: operation receipt — created = the new actor ids; warnings = per-actor failures.
      // Placed token ids are NOT surfaced by scenePlacement (only tokensPlaced count) → faithfully omitted.
      return { ...result, ...buildOperationReceipt({ created: createdActors.map(a => a.id), warnings: errors }) };

    } catch (error) {
      notify.error('Failed to create actor from compendium entry', error instanceof Error ? error : new Error(String(error)));
      this.auditLog('createActorFromCompendiumEntry', request, 'failure', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

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
        console.error(`[${MODULE_ID}] Removing remote token texture URL: ${actorData.prototypeToken.texture.src}`);
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
      const folderId = await getOrCreateFolder('Foundry MCP Creatures', 'Actor');
      if (folderId) {
        (actorData as any).folder = folderId;
      }

      // Create the new actor
      const createdDocs = await (Actor as any).createDocuments([actorData]);
      if (!createdDocs || createdDocs.length === 0) {
        throw new Error('Failed to create actor document');
      }
      const createdActor = createdDocs[0];
      if (!(game.actors as any).get(createdActor.id)) {
        throw new Error(`${ErrorTokens.ACTOR_CREATE_NOT_PERSISTED}: actor ${createdActor.id} absent from game.actors after create`);
      }

      return createdActor;
    } catch (error) {
      notify.error('Actor creation failed', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Create a new actor
   * Creates an actor with the provided data structure.
   * HC9: optional `options` bag plumbed to Actor.create(data, options) — supports
   * `skipItems` to suppress wfrp4e _preCreate basic-skills dialog (mirror of BUG-089).
   */
  async createActor(data: { actorData: Record<string, any>; options?: { skipItems?: boolean } | undefined }): Promise<any> {
    this.validateState();

    try {
      const actor = await (Actor as any).create(data.actorData as any, (data.options ?? {}) as any);

      if (!actor) {
        throw new Error('Failed to create actor');
      }
      const freshCreatedActor: any = (game.actors as any).get(actor.id);
      verifyDocWrite(freshCreatedActor, { name: actor.name }, ErrorTokens.ACTOR_CREATE_NOT_PERSISTED);

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
  async duplicateActor(data: { sourceActorId: string; newName?: string | undefined; options?: { skipItems?: boolean | undefined } | undefined }): Promise<any> {
    this.validateState();

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

      // BUG-458: forward options.skipItems to Actor.create(data, options), mirroring
      // createActor above — suppresses the wfrp4e _preCreate basic-skills dialog on
      // bare-source clones.
      const actor = await (Actor as any).create(actorData, (data.options ?? {}) as any);
      if (!actor) {
        throw new Error('Actor.create returned no actor');
      }
      if (!(game.actors as any).get(actor.id)) {
        throw new Error(`${ErrorTokens.ACTOR_CREATE_NOT_PERSISTED}: actor ${actor.id} absent from game.actors after create`);
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
  async applyNpcCareerAdvance(data: { actorId: string; careerItemId: string; talentPolicy?: 'all' | 'min' | undefined }): Promise<any> {
    this.validateState();

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

      // BUG-692: the promised career-derived deltas, snapshotted BEFORE advance() so the
      // post-write verify below checks the actual advancement, not just "the actor and career
      // still exist" (BUG-218's weaker check). Verified against wfrp4e.js Advancement.advance()
      // (:2742-2761): characteristics flagged true on the career get .advances set to
      // 5*career.level; every career.system.skills entry gets an item at that same advances
      // value; every career.system.talents entry gets a talent item added.
      const careerSystem: any = (career as any).system ?? {};
      const careerLevel: number = Number(careerSystem.level?.value ?? 1);
      const advancesNeeded = careerLevel * 5;
      const flaggedChars: string[] = Object.keys(careerSystem.characteristics ?? {}).filter((k) => careerSystem.characteristics[k]);
      const careerSkillNames: string[] = Array.isArray(careerSystem.skills) ? careerSystem.skills.map((s: any) => String(s)) : [];
      const careerTalentNames: string[] = Array.isArray(careerSystem.talents) ? careerSystem.talents.map((t: any) => String(t)) : [];
      const preTalentIds = new Set<string>(
        ((actor as any).items ?? []).filter((it: any) => it.type === 'talent').map((it: any) => String(it.id)),
      );

      // BUG-692/BUG-217: StandardActorModel.advance() (wfrp4e.js:7036) is itself synchronous but
      // fire-and-forgets `adv.advance()`, which is `async` yet ALSO calls `this.actor.update()`
      // (wfrp4e.js:2760) without awaiting it — two un-awaited layers between this call and the
      // actual actor write settling. Observer pattern: register BEFORE the sync call, await AFTER.
      const commitObserved = waitForActorUpdateCommit(String(actor.id), 250);
      model.advance(career);
      const committed = await commitObserved;
      // BUG-692: a timeout is now an EXPLICIT failure — the old implementation resolved
      // identically on hook-fire and on timeout, so a genuinely-incomplete advance (e.g. under
      // contention) was silently reported as success.
      if (!committed) {
        throw new Error(`${ErrorTokens.APPLY_NPC_CAREER_ADVANCE_NOT_PERSISTED}: timed out waiting for actor ${data.actorId}'s updateActor hook after advance() — no commit observed within 250ms`);
      }

      // BUG-218 (existence) + BUG-692 (actual deltas): re-read actor + career, then verify every
      // promised characteristic/skill/talent delta actually landed — not just that the documents
      // still exist.
      const fresh = game.actors?.get(data.actorId);
      const freshCareer = fresh?.items?.get(data.careerItemId);
      if (!fresh || !freshCareer) {
        throw new Error(`${ErrorTokens.APPLY_NPC_CAREER_ADVANCE_NOT_PERSISTED}: actor ${data.actorId} or career ${data.careerItemId} missing after advance`);
      }

      const freshSystem: any = (fresh as any).system ?? {};
      const shortfalls: string[] = [];
      for (const ch of flaggedChars) {
        const advances = Number(freshSystem.characteristics?.[ch]?.advances ?? 0);
        if (advances < advancesNeeded) shortfalls.push(`characteristic "${ch}" advances ${advances} < expected ${advancesNeeded}`);
      }
      const freshItems: any[] = Array.from((fresh as any).items ?? []);
      for (const skillName of careerSkillNames) {
        const skillItem = freshItems.find((it: any) => it.type === 'skill' && String(it.name).toLowerCase() === skillName.toLowerCase());
        const advances = Number(skillItem?.system?.advances?.value ?? -1);
        if (!skillItem || advances < advancesNeeded) {
          shortfalls.push(`skill "${skillName}" advances ${advances} < expected ${advancesNeeded}`);
        }
      }
      const postTalentItems = freshItems.filter((it: any) => it.type === 'talent' && !preTalentIds.has(String(it.id)));
      if (careerTalentNames.length > 0 && postTalentItems.length === 0) {
        shortfalls.push(`expected ${careerTalentNames.length} new talent item(s) from [${careerTalentNames.join(', ')}], found 0`);
      }
      if (shortfalls.length > 0) {
        throw new Error(`${ErrorTokens.APPLY_NPC_CAREER_ADVANCE_NOT_PERSISTED}: advance() reported commit but the promised deltas did not fully land — ${shortfalls.join('; ')}`);
      }

      // BUG-696: wfrp4e's Advancement.advance() (wfrp4e.js:2756-2757) has no talent-count
      // policy — it always embeds EVERY career.system.talents entry, and no parameter on
      // StandardActorModel.advance() can change that. talentPolicy:'min' is a post-hoc trim:
      // keep only the FIRST newly-added talent from this call, delete the rest. Default 'all'
      // preserves prior behavior exactly.
      let removedTalentIds: string[] = [];
      if (data.talentPolicy === 'min' && postTalentItems.length > 1) {
        const toRemove = postTalentItems.slice(1).map((it: any) => String(it.id));
        await (fresh as any).deleteEmbeddedDocuments('Item', toRemove);
        removedTalentIds = toRemove;
      }

      notify.updated('actor', fresh.name ?? 'unknown', { summary: `advancing via ${freshCareer.name}`, uuid: (fresh as any).uuid });

      return {
        success: true,
        actorId: fresh.id,
        actorName: fresh.name,
        careerItemId: freshCareer.id,
        careerName: freshCareer.name,
        careerLevel: (freshCareer as any).system?.level?.value ?? null,
        talentPolicy: data.talentPolicy ?? 'all',
        talentsAdded: postTalentItems.length - removedTalentIds.length,
        talentsTrimmed: removedTalentIds.length,
      };
    } catch (error) {
      throw new Error(`Failed to apply NPC career advance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update actor data
   * Allows updating any actor properties using dot notation for nested fields
   */
  async updateActor(data: { actorId: string; updateData: Record<string, any>; warnings?: string[]; verifyPersistence?: boolean | undefined }): Promise<any> {
    this.validateState();

    try {
      const actor = game.actors?.get(data.actorId);
      if (!actor) {
        throw new Error(`Actor not found with ID: ${data.actorId}`);
      }

      // Phase 12 R12.3: the field allow-list is enforced at the QUERY HANDLER (queries.ts handleUpdateActor),
      // the single boundary every real caller crosses (the update-actor tool AND manage-character, which writes
      // via this.query('updateActor')). It is deliberately NOT here so this service stays a general-purpose
      // Foundry-write utility (its formatter-characterization oracles legitimately exercise derived/internal
      // fields). See execution report for the service→handler placement rationale.

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
        data.verifyPersistence !== false ? waitForActorUpdateCommit(String(actor.id), 250) : null;
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
          throw new Error(`${ErrorTokens.UPDATE_ACTOR_NOT_PERSISTED}: actor ${actor.id} disappeared after update`);
        }
        const flat = (foundry as any).utils.flattenObject(data.updateData) as Record<string, unknown>;
        // CORE-05 (mcp_code_quality_v2 Phase C2) — consolidated onto verifyDocWrite (was a hand-rolled
        // JSON.stringify drift loop). readSource:false preserves the original direct-property read
        // (the hand-rolled loop never read via ._source; switching the default broke test doubles
        // that model a flat live-document shape without a ._source bag).
        // BUG-499 (Wave 2, D6): normalizeDimensions rescues the wrong-dimension family —
        // folder FK moves (Document getter vs scalar id) and numeric coercion
        // (system.status.advantage.value) false-failed real, persisted writes as
        // NOT_PERSISTED. Structural equality is still checked first.
        verifyDocWrite(fresh, flat, ErrorTokens.UPDATE_ACTOR_NOT_PERSISTED, {
          readSource: false,
          normalizeDimensions: true,
        });
      }

      // Debug: Log the updateData structure to help diagnose issues
      console.log(`[Warhammer MCP] Update data structure:`, {
        actorName: actor.name,
        updateDataKeys: Object.keys(data.updateData || {}),
        hasWarnings: !!(data.warnings && data.warnings.length),
        warningCount: data.warnings?.length || 0,
        firstWarning: data.warnings?.[0]
      });

      // Phase 7 (R7.2): the ~228-line notification-formatting block (formatFieldName / formatValue /
      // isInternalField / WFRP-leaf-aware flattenObject + assembly) was extracted VERBATIM to
      // services/shared/actor-update-summary.ts. The orchestrator just consumes the summary string.
      const updateSummary = formatActorUpdateSummary(data.updateData || {}, previousValues || {});

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
}
