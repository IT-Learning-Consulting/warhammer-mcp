import { z } from 'zod';
import { MODULE_ID } from './constants.js';
import { FoundryDataAccess } from './data-access.js';
// Phase 4 (R3.3): QueryHandlers owns the extracted creature-index + compendium-search services.
import { PersistentCreatureIndex, CompendiumSearchService, RollRequestService, RollButtonService, PlayerLookupService, CombatService, ConditionsService, ScenePlacementService, TemplateApplyService, ActorService, ItemService, EffectsService, TokenCasualtiesService, PsychologyService, InventoryService, MarketService } from './services/index.js';
import { wrappedWrite } from './transaction-manager.js';
import { assertAllowedActorFields } from './services/shared/actor-field-allowlist.js';
import { notify } from './notify.js';
// Phase 13 (auditLog re-narrow carry-in): auditLog relocated here off the DA facade; the sanitize cluster
// it used became a shared pure util, and the ring-buffer cap a named tool-limit constant.
import { sanitizeData } from './utils/sanitize-data.js';
import { AUDIT_LOG_RING_BUFFER } from './constants/toolLimits.js';
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
// Phase 4 mcp_crud_expansion — Scene umbrella dispatcher (9 actions post-Phase-5).
// Replaces 5 inline handlers (handleGetActiveScene, handleListScenes,
// handleSwitchScene, handleAddActorsToScene, handleDeleteToken). Phase 5 retired
// the 2 token-action sub-keys (add-tokens, delete-token) — they live on the
// `token` umbrella now (handlers/token.ts add / delete-token actions).
import { dispatchScene as dispatchSceneHandler } from './handlers/scene.js';
// Phase 1 mcp_diagnostic_tool — Diagnostic umbrella dispatcher (Tier 1: 3 actions).
// Read-only: recent-errors / world-issues / support-snapshot. Phase 2 (Tier 2
// content-health) + Phase 3 (Tier 3 dev introspection) extend the union.
import { dispatchDiagnostic as dispatchDiagnosticHandler } from './handlers/diagnostic.js';
// Phase 5 mcp_crud_expansion — 7 per-doc-type embedded-CRUD umbrellas.
// Each handler module owns input strict-parse, GM gate, transaction wrapping,
// DP-16 post-verify, and typed envelope per action.
import { dispatchToken as dispatchTokenHandler } from './handlers/token.js';
import { dispatchLight as dispatchLightHandler } from './handlers/light.js';
import { dispatchNote as dispatchNoteHandler } from './handlers/note.js';
import { dispatchSound as dispatchSoundHandler } from './handlers/sound.js';
import { dispatchRegion as dispatchRegionHandler } from './handlers/region.js';
import { dispatchTile as dispatchTileHandler } from './handlers/tile.js';
import { dispatchTemplate as dispatchTemplateHandler } from './handlers/template.js';
// Phase 5 mcp_coverage_expansion — drawing umbrella (CRUD + list + duplicate over scene.drawings).
import { dispatchDrawing as dispatchDrawingHandler } from './handlers/drawing.js';
// Phase 7 mcp_coverage_expansion — cards umbrella (stack + embedded-card CRUD + gameplay verbs over game.cards).
import { dispatchCards as dispatchCardsHandler } from './handlers/cards.js';
// Phase 8 mcp_coverage_expansion — document-io umbrella (export/import-as-new/preview over 8 world doc types).
import { dispatchDocumentIo as dispatchDocumentIoHandler } from './handlers/document-io.js';
// Phase 7 mcp_crud_expansion — Playlist + PlaylistSound umbrella (10 actions:
// create/update/delete/get/list-playlist, add/update/delete-sound, play/stop).
// First world-level CRUD umbrella in the system (sibling of Phase 5 embedded
// dispatchers); routes through utils/worldCRUDFactory for PlaylistSound CRUD.
import { dispatchPlaylist as dispatchPlaylistHandler } from './handlers/playlist.js';
import { dispatchMacro as dispatchMacroHandler } from './handlers/macro.js';
import { dispatchUser as dispatchUserHandler } from './handlers/user.js';
// Phase 9 mcp_crud_expansion — Compendium pack + document CRU (NO DELETE per HC3).
// 6 actions: create-pack / update-pack / read-pack / add-document-to-pack /
// update-document-in-pack / read-document-from-pack.
import { dispatchCompendium as dispatchCompendiumHandler } from './handlers/compendium.js';
// Phase 10 mcp_crud_expansion — Cross-doc FK audit + repair (3 actions; closes PRD).
import { dispatchCrossDocFk as dispatchCrossDocFkHandler } from './handlers/cross-doc-fk.js';
// Phase wfrp-disease — Disease umbrella (8 actions).
import { dispatchDisease as dispatchDiseaseHandler } from './handlers/disease.js';
import { dispatchAvailabilityTest as dispatchAvailabilityTestHandler } from './handlers/availability-test.js';
// wfrp_layer_expansion_v1 Phase 7 (P-11) — travel-distance compute-only lookup (never rolls/writes).
import { dispatchTravelDistance as dispatchTravelDistanceHandler } from './handlers/travel-distance.js';
// Phase 4 mcp_completion_v1 — Folder umbrella (6 actions; custom delete + list-contents).
import { dispatchFolder as dispatchFolderHandler } from './handlers/folder.js';
// Phase 4 mcp_completion_v1 — Setting umbrella (4 actions; hand-rolled; force gate + blocklist).
import { dispatchSetting as dispatchSettingHandler } from './handlers/setting.js';
// Phase 5 mcp_completion_v1 — ChatMessage umbrella (5 actions).
import { dispatchChatMessage as dispatchChatMessageHandler } from './handlers/chat-message.js';
// Phase 1 mcp_coverage_expansion — item-directory umbrella (5 actions: list/get/search/duplicate/import-from-compendium).
import { dispatchItemDirectory as dispatchItemDirectoryHandler } from './handlers/item-directory.js';
// Phase 1 mcp_coverage_expansion — actor-config umbrella (4 actions: get/update-prototype-token + get/set-art).
import { dispatchActorConfig as dispatchActorConfigHandler } from './handlers/actor-config.js';
// Phase 2 mcp_coverage_expansion — dice-roll tool (roll/validate/simulate over Foundry Roll).
import { dispatchDiceRoll as dispatchDiceRollHandler } from './handlers/dice-roll.js';
// Phase 10 mcp_coverage_expansion — keybinding tool (list/get/set/reset-action/reset-all/find-conflicts).
import { dispatchKeybinding as dispatchKeybindingHandler } from './handlers/keybinding.js';
// Phase 3 mcp_coverage_expansion — combatant umbrella (7 per-combatant actions).
import { dispatchCombatant as dispatchCombatantHandler } from './handlers/combatant.js';
// Phase 1 module_integration_v1 — module-probe umbrella (always-on, read-only) + module-matt stub.
import { dispatchModuleProbe as dispatchModuleProbeHandler } from './handlers/modules/probe/probe.js';
import { dispatchModuleMatt as dispatchModuleMattHandler } from './handlers/modules/monks-active-tiles/matt.js';
// Phase 5 module_integration_v1 — module-tagger + module-sequencer umbrellas.
import { dispatchModuleTagger as dispatchModuleTaggerHandler } from './handlers/modules/tagger/tagger.js';
import { dispatchModuleSequencer as dispatchModuleSequencerHandler } from './handlers/modules/sequencer/sequencer.js';
// Phase 4 module_integration_v1 — module-levels umbrella.
import { dispatchModuleLevels as dispatchModuleLevelsHandler } from './handlers/modules/levels/levels.js';
// Phase 8 module_integration_v1 — module-autoanimations umbrella.
import { dispatchModuleAutoAnimations as dispatchModuleAutoAnimationsHandler } from './handlers/modules/autoanimations/autoanimations.js';
// Phase 6 module_integration_v1 — module-scene-atmosphere umbrella (6-member bundle: fxmaster/tokenmagic/scenery/scene-transitions/multiface-tiles/dynamic-soundscapes).
import { dispatchModuleSceneAtmosphere as dispatchModuleSceneAtmosphereHandler } from './handlers/modules/scene-atmosphere/scene-atmosphere.js';
// Phase 7 module_integration_v1 — module-access-control umbrella (2-member bundle: LocknKey + LockView).
import { dispatchModuleAccessControl as dispatchModuleAccessControlHandler } from './handlers/modules/access-control/access-control.js';
// Phase 13A module_integration_v1 — module-css umbrella.
import { dispatchModuleCss as dispatchModuleCssHandler } from './handlers/modules/custom-css/css.js';
// wfrp_imperial_arcana Phase 7 — imperial-arcana umbrella.
import { dispatchImperialArcana as dispatchImperialArcanaHandler } from './handlers/modules/imperial-arcana/imperial-arcana.js';
// Phase 15 module_integration_v1 — module-lighting umbrella (CommunityLighting, conditional).
import { dispatchModuleLighting as dispatchModuleLightingHandler } from './handlers/modules/community-lighting/lighting.js';
// Phase 9 module_integration_v1 — WFRP mechanic delegates: module-robak + module-tokenbar (conditional).
import { dispatchModuleRobak as dispatchModuleRobakHandler } from './handlers/modules/robak/robak.js';
import { dispatchModuleTokenbar as dispatchModuleTokenbarHandler } from './handlers/modules/tokenbar/tokenbar.js';
// Phase 10 module_integration_v1 — module-armoury (Forien's Armoury, conditional).
import { dispatchModuleArmoury as dispatchModuleArmouryHandler } from './handlers/modules/forien-armoury/armoury.js';
// Phase 11 module_integration_v1 — module-party-resources (Party Resources, conditional).
import { dispatchModulePartyResources as dispatchModulePartyResourcesHandler } from './handlers/modules/fvtt-party-resources/party-resources.js';
// Phase 11 module_integration_v1 — module-gmtoolkit (GM Toolkit, conditional).
import { dispatchModuleGmtoolkit as dispatchModuleGmtoolkitHandler } from './handlers/modules/wfrp4e-gm-toolkit/gmtoolkit.js';
// Phase 12 module_integration_v1 — module-chat-commander (_chatcommands, conditional).
import { dispatchModuleChatCommander as dispatchModuleChatCommanderHandler } from './handlers/modules/_chatcommands/chat-commander.js';
// Phase 14 module_integration_v1 — thin-session modules (conditional).
import { dispatchModuleTimekeeping as dispatchModuleTimekeepingHandler } from './handlers/modules/simple-timekeeping/timekeeping.js';
// Phase 1 module_integration_v2 — module-conversation-hud (ConversationHUD, conditional).
import { dispatchModuleConversationHud as dispatchModuleConversationHudHandler } from './handlers/modules/conversation-hud/conversation-hud.js';
// Phase 2 module_integration_v2 — module-simple-quest (Simple Quest, conditional).
import { dispatchModuleSimpleQuest as dispatchModuleSimpleQuestHandler } from './handlers/modules/simple-quest/simple-quest.js';
// Phase 3 module_integration_v2 — module-token-attacher (Token Attacher, conditional).
import { dispatchModuleTokenAttacher as dispatchModuleTokenAttacherHandler } from './handlers/modules/token-attacher/token-attacher.js';
// Phase 3 module_integration_v2 — module-token-presentation (boss-splash + token-notes, conditional).
import { dispatchModuleTokenPresentation as dispatchModuleTokenPresentationHandler } from './handlers/modules/token-presentation/token-presentation.js';
// Phase 4 module_integration_v2 — module-perceptive (Perceptive stealth/spotting/door, conditional).
import { dispatchModulePerceptive as dispatchModulePerceptiveHandler } from './handlers/modules/perceptive/perceptive.js';
// Phase 5 module_integration_v2 — module-augur-nexus (scene-tree nav + connections graph, conditional).
import { dispatchModuleAugurNexus as dispatchModuleAugurNexusHandler } from './handlers/modules/augur-nexus/augur-nexus.js';
// Phase 6 module_integration_v2 — module-wfrp-economy (banks/loans/stocks/property, conditional).
import { dispatchModuleWfrpEconomy as dispatchModuleWfrpEconomyHandler } from './handlers/modules/wfrp-economy/wfrp-economy.js';
// Phase 8 module_integration_v2 — module-mortal-needs (survival needs tracker, conditional).
import { dispatchModuleMortalNeeds as dispatchModuleMortalNeedsHandler } from './handlers/modules/mortal-needs/mortal-needs.js';
// Phase 9 module_integration_v2 — module-polyglot (language obfuscation, conditional).
import { dispatchModulePolyglot as dispatchModulePolyglotHandler } from './handlers/modules/polyglot/polyglot.js';
// Phase 10 module_integration_v2 — module-narrator (Narrator Tools read-aloud/narration, conditional).
import { dispatchModuleNarrator as dispatchModuleNarratorHandler } from './handlers/modules/narrator/narrator.js';
// Phase 11 module_integration_v2 — module-macro-trigger (hook→macro bindings, conditional).
import { dispatchModuleMacroTrigger as dispatchModuleMacroTriggerHandler } from './handlers/modules/macro-trigger/macro-trigger.js';
// Phase 12 module_integration_v2 — module-backpack (per-actor item storage, conditional).
import { dispatchModuleBackpack as dispatchModuleBackpackHandler } from './handlers/modules/backpack/backpack.js';
// Phase 13B module_integration_v2 — module-puzzle-locks (14 document puzzle-lock types, conditional).
import { dispatchModulePuzzleLocks as dispatchModulePuzzleLocksHandler } from './handlers/modules/puzzle-locks/puzzle-locks.js';
// Phase 13C module_integration_v2 — module-syrinscape (soundscape mood/element playback, conditional).
import { dispatchModuleSyrinscape as dispatchModuleSyrinscapeHandler } from './handlers/modules/syrinscape/syrinscape.js';
// Phase 13A module_integration_v2 — module-portal (headless prototype-preserving token spawn, conditional).
import { dispatchModulePortal as dispatchModulePortalHandler } from './handlers/modules/portal/portal.js';
import { dispatchModulePatrol as dispatchModulePatrolHandler } from './handlers/modules/patrol/patrol.js';
import { dispatchModuleGatherer as dispatchModuleGathererHandler } from './handlers/modules/gatherer/gatherer.js';
import { dispatchModuleMastercrafted as dispatchModuleMastercraftedHandler } from './handlers/modules/mastercrafted/mastercrafted.js';
// Phase 3 module_integration_v1 — item-piles economy surface (conditional).
import { dispatchModuleItempiles as dispatchModuleItempilesHandler } from './handlers/modules/item-piles/item-piles.js';
// Phase 6.1 mcp_crud_expansion — FilePicker handlers (upload/list + notify.warn round-trip).
import {
  uploadFile as uploadFileHandler,
  listFiles as listFilesHandler,
  notifyWarn as notifyWarnHandler,
  createDirectory as createDirectoryHandler,
} from './handlers/filepicker.js';
import {
  // actor domain
  GetCharacterInfoInput,
  ListActorsInput,
  CreateActorInput,
  UpdateActorInput,
  CreateActorFromCompendiumInput,
  SetActorOwnershipInput,
  GetActorOwnershipInput,
  // Phase 1 mcp_crud_expansion — polymorphic ownership schemas.
  SetDocumentOwnershipInput,
  GetDocumentOwnershipInput,
  BulkSetDocumentOwnershipInput,
  ResetDocumentOwnershipInput,
  DuplicateActorInput,
  ApplyNpcCareerAdvanceInput,
  ApplyTemplateInput,
  ListActorItemsInput,
  // item domain
  CreateItemInput,
  UpdateItemInput,
  DeleteItemInput,
  ModifyItemQualitiesV2Input,
  AddItemFromCompendiumInput,
  TradeItemInput,
  // compendium domain
  SearchCompendiumInput,
  ListCreaturesByCriteriaInput,
  GetAvailablePacksInput,
  GetCompendiumDocumentFullInput,
  // scene domain — Phase 4: 5 legacy schemas folded into SceneToolInput umbrella.
  // Only ApplyTemplateToTokenInput stays (separate prototype-token-routing tool).
  ApplyTemplateToTokenInput,
  // Phase 5 wfrp_battle_simulator — batch per-token ActorDelta casualty writer.
  ApplyTokenCasualtiesInput,
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
  // Phase 13 wfrp_layer_expansion_v1 (R16) — sheet-flow primitives.
  ApplyFearInput,
  CheckReloadInput,
  AddMoneyInput,
  DirectPayInput,
  // Phase 5 follow-up B — active-effect CRUD
  AddActiveEffectInput,
  UpdateActiveEffectInput,
  DeleteActiveEffectInput,
  // TOOL-IDEA-003 (2026-05-14): get-active-effect-by-name
  GetActiveEffectByNameInput,
  // Phase 4 mcp_notify_coverage — notify umbrella (skill bookends + ad-hoc GM events).
  NotifyToolInput,
} from '@foundry-mcp/shared';

/**
 * Wrap ZodError as Invalid input for consistent boundary error shape (CCR-5).
 */
function rethrowAsInvalidInput(error: unknown): void {
  if (error instanceof z.ZodError) {
    throw new Error(`Invalid input: ${error.message}`);
  }
}

/**
 * Phase 8 (R8.3): centralizes the per-handler try/catch boilerplate that wrapped
 * every query handler. `errorPrefix` is the operation message WITHOUT the trailing
 * colon — e.g. 'Failed to list actors' or 'Failed to dispatch scene action'; the
 * helper appends `: <message>` so BOTH wire-format prefix forms are preserved
 * byte-for-byte. ZodErrors are re-thrown as 'Invalid input: …' via
 * rethrowAsInvalidInput first (CCR-5), exactly as the inline catch blocks did.
 * The error contract is locked by characterization/query-error-format.snap.test.ts.
 * Excluded from this collapse (different catch shapes): handleQuery (outer
 * envelope shell) and handleNotify (NOTIFY_INVALID_INPUT path).
 */
async function wrapQuery<T>(errorPrefix: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    rethrowAsInvalidInput(error);
    throw new Error(`${errorPrefix}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export class QueryHandlers {
  public dataAccess: FoundryDataAccess;
  // Phase 4 (R3.3): QueryHandlers owns the creature index + search service (they left FoundryDataAccess).
  // The search service receives the index directly (PersistentCreatureIndex implements CreatureIndexReader);
  // FoundryDataAccess gets the service injected for its one residual caller (createActorFromCompendium).
  public creatureIndex: PersistentCreatureIndex;
  public compendiumSearch: CompendiumSearchService;
  // Phase 5 (R4.3): Contract — the player-rolls / roll-button / player-lookup services moved off
  // FoundryDataAccess to QueryHandlers (mirrors the Phase-4 creatureIndex/compendiumSearch promotion).
  // The live call sites (queries.ts:handleRequestPlayerRolls + main.ts roll-button hooks/socket) call
  // these directly now; FoundryDataAccess no longer carries the facade delegates.
  public rollRequest: RollRequestService;
  public rollButton: RollButtonService;
  public playerLookup: PlayerLookupService;
  // Phase 6 (R5.2): Contract — the combat + conditions clusters promoted off FoundryDataAccess to
  // QueryHandlers (mirrors the Phase-5 rollRequest/rollButton/playerLookup promotion). The live call
  // sites (the combat/conditions handlers below) call these directly now; the facade delegates were
  // deleted from FoundryDataAccess.
  public combat: CombatService;
  public conditions: ConditionsService;
  // Phase 6 (R5.2): scene-placement promoted to QueryHandlers and ctor-injected into FoundryDataAccess so
  // external handlers (handlers/scene.ts, handlers/token.ts) and the 2 internal self-callers
  // (createActors/createActor) share one instance. Its auditLog seam binds to this.auditLog (Phase 13:
  // relocated off the DA facade) so scene-placement audit entries are unchanged (HC1).
  public scenePlacement: ScenePlacementService;
  // Phase 7 (R6.3): Contract — template-apply promoted off FoundryDataAccess to QueryHandlers (mirrors the
  // Phase-6 combat/conditions promotion). The 2 template handlers below call this directly now; the facade
  // delegates were deleted from FoundryDataAccess. Single seam: validateState (no auditLog).
  public templateApply: TemplateApplyService;
  // Phase 8 (R7.3): Contract — the actor/item/effect MUTATION clusters promoted off FoundryDataAccess to
  // QueryHandlers (mirrors the Phase-7 templateApply promotion). The handlers below call these directly now;
  // the 16 facade delegates were deleted from FoundryDataAccess. Seams: actorService takes scenePlacement +
  // compendiumSearch + validateState + an auditLog callback + a getCompendiumDocumentFull callback (both
  // stay on the DA facade); item/effects take validateState only.
  public actorService: ActorService;
  public itemService: ItemService;
  public effectsService: EffectsService;
  // Phase 5 wfrp_battle_simulator: batch per-token ActorDelta casualty writer (single seam: validateState).
  public tokenCasualties: TokenCasualtiesService;
  // Phase 13 wfrp_layer_expansion_v1 (R16): sheet-flow method-wrap services (single seam: validateState).
  public psychology: PsychologyService;
  public inventory: InventoryService;
  public market: MarketService;

  constructor() {
    this.creatureIndex = new PersistentCreatureIndex();
    this.compendiumSearch = new CompendiumSearchService(MODULE_ID, this.creatureIndex);
    const validateState = (): void => this.dataAccess.validateFoundryState();
    // scenePlacement is built BEFORE dataAccess so it can be injected; its callbacks reference
    // this.dataAccess lazily (only invoked at runtime, after construction completes).
    this.scenePlacement = new ScenePlacementService(
      validateState,
      (operation, data, result, error) => this.auditLog(operation, data, result, error),
    );
    // Phase 8 (R7.3): scenePlacement + compendiumSearch injections dropped — FoundryDataAccess no longer
    // constructs the actor/item/effect services (promoted to QueryHandlers below), so it is dependency-free.
    this.dataAccess = new FoundryDataAccess();
    this.rollRequest = new RollRequestService(validateState);
    this.rollButton = new RollButtonService(validateState);
    this.playerLookup = new PlayerLookupService(validateState);
    this.combat = new CombatService(validateState);
    this.conditions = new ConditionsService(validateState);
    this.templateApply = new TemplateApplyService(validateState);
    this.tokenCasualties = new TokenCasualtiesService(validateState);
    this.psychology = new PsychologyService(validateState);
    this.inventory = new InventoryService(validateState);
    this.market = new MarketService(validateState);
    // Phase 8 (R7.3): promoted actor/item/effect services. Callbacks reference this.dataAccess lazily
    // (invoked only at runtime, after construction completes) and reuse the surviving DA facade method
    // (getCompendiumDocumentFull stays public on FoundryDataAccess; auditLog relocated to this.auditLog
    // in Phase 13).
    this.effectsService = new EffectsService(validateState);
    this.itemService = new ItemService(validateState);
    this.actorService = new ActorService(
      this.scenePlacement,
      this.compendiumSearch,
      validateState,
      (operation, data, result, error) => this.auditLog(operation, data, result, error),
      (packId, documentId) => this.dataAccess.getCompendiumDocumentFull(packId, documentId),
    );
  }

  /**
   * Audit log for write operations. Phase 13 (carry-in): relocated from FoundryDataAccess so the DA no
   * longer exposes a public auditLog — the only callers forcing it public were the two service auditLog
   * seams in the constructor above. Writes to the `auditLogs` world flag (ring buffer, last
   * AUDIT_LOG_RING_BUFFER entries); sanitizes via the shared util the cluster was extracted to. Behavior
   * is byte-identical to the former DA method.
   */
  private auditLog(operation: string, data: any, result: 'success' | 'failure', error?: string): void {
    // Always audit write operations (no setting required)
    const logEntry = {
      timestamp: new Date().toISOString(),
      operation,
      user: game.user?.name || 'Unknown',
      userId: game.user?.id || 'unknown',
      world: game.world?.id || 'unknown',
      data: sanitizeData(data),
      result,
      error,
    };

    // Store in flags for persistence (optional)
    if (game.world && (game.world as any).setFlag) {
      const auditLogs = (game.world as any).getFlag(MODULE_ID, 'auditLogs') || [];
      auditLogs.push(logEntry);

      // Keep only last AUDIT_LOG_RING_BUFFER entries to prevent bloat
      if (auditLogs.length > AUDIT_LOG_RING_BUFFER) {
        auditLogs.splice(0, auditLogs.length - AUDIT_LOG_RING_BUFFER);
      }

      (game.world as any).setFlag(MODULE_ID, 'auditLogs', auditLogs);
    }
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
    // Phase 8 (R8.1/R8.2): table-driven registration — replaces the ~112 manual per-key query
    // registrations with one Record + loop. Query keys stay byte-stable (HC8: the registered key is
    // still modulePrefix + '.' + the table key); adding a handler is one table entry.
    const handlerTable: Record<string, (data: unknown) => Promise<any>> = {
      'getCharacterInfo': this.handleGetCharacterInfo.bind(this),
      'listActors': this.handleListActors.bind(this),
      'searchCompendium': this.handleSearchCompendium.bind(this),
      'addItemFromCompendium': this.handleAddItemFromCompendium.bind(this),
      'listCreaturesByCriteria': this.handleListCreaturesByCriteria.bind(this),
      'getAvailablePacks': this.handleGetAvailablePacks.bind(this),
      'getWorldInfo': this.handleGetWorldInfo.bind(this),
      'ping': this.handlePing.bind(this),
      'createActorFromCompendium': this.handleCreateActorFromCompendium.bind(this),
      'getCompendiumDocumentFull': this.handleGetCompendiumDocumentFull.bind(this),
      'scene': this.handleScene.bind(this),
      'journal': this.handleJournal.bind(this),
      'diagnostic': this.handleDiagnostic.bind(this),
      'token': this.handleToken.bind(this),
      'light': this.handleLight.bind(this),
      'note': this.handleNote.bind(this),
      'sound': this.handleSound.bind(this),
      'playlist': this.handlePlaylist.bind(this),
      'macro': this.handleMacro.bind(this),
      'user': this.handleUser.bind(this),
      'compendium': this.handleCompendium.bind(this),
      'cross-doc-fk': this.handleCrossDocFk.bind(this),
      'region': this.handleRegion.bind(this),
      'tile': this.handleTile.bind(this),
      'template': this.handleTemplate.bind(this),
      'drawing': this.handleDrawing.bind(this),
      'cards': this.handleCards.bind(this),
      'document-io': this.handleDocumentIo.bind(this),
      'deleteActor': this.handleDeleteActor.bind(this),
      'request-player-rolls': this.handleRequestPlayerRolls.bind(this),
      'setActorOwnership': this.handleSetActorOwnership.bind(this),
      'getActorOwnership': this.handleGetActorOwnership.bind(this),
      'setDocumentOwnership': this.handleSetDocumentOwnership.bind(this),
      'getDocumentOwnership': this.handleGetDocumentOwnership.bind(this),
      'bulkSetDocumentOwnership': this.handleBulkSetDocumentOwnership.bind(this),
      'resetDocumentOwnership': this.handleResetDocumentOwnership.bind(this),
      'createActor': this.handleCreateActor.bind(this),
      'updateActor': this.handleUpdateActor.bind(this),
      'updateItem': this.handleUpdateItem.bind(this),
      'createItem': this.handleCreateItem.bind(this),
      'deleteItem': this.handleDeleteItem.bind(this),
      'modifyItemQualities': this.handleModifyItemQualities.bind(this),
      'tradeItem': this.handleTradeItem.bind(this),
      'createRollTable': this.handleCreateRollTable.bind(this),
      'addTableResults': this.handleAddTableResults.bind(this),
      'listRollTables': this.handleListRollTables.bind(this),
      'getRollTable': this.handleGetRollTable.bind(this),
      'rollOnTable': this.handleRollOnTable.bind(this),
      'deleteRollTable': this.handleDeleteRollTable.bind(this),
      'updateRollTable': this.handleUpdateRollTable.bind(this),
      'updateTableResults': this.handleUpdateTableResults.bind(this),
      'deleteTableResults': this.handleDeleteTableResults.bind(this),
      'normalizeRollTable': this.handleNormalizeRollTable.bind(this),
      'resetRollTableResults': this.handleResetRollTableResults.bind(this),
      'drawManyFromTable': this.handleDrawManyFromTable.bind(this),
      'importRollTableFromCompendium': this.handleImportRollTableFromCompendium.bind(this),
      'getCombat': this.handleGetCombat.bind(this),
      'listCombatants': this.handleListCombatants.bind(this),
      'advanceCombat': this.handleAdvanceCombat.bind(this),
      'addCombatants': this.handleAddCombatants.bind(this),
      'removeCombatants': this.handleRemoveCombatants.bind(this),
      'endCombat': this.handleEndCombat.bind(this),
      'applyDamage': this.handleApplyDamage.bind(this),
      'applyTokenCasualties': this.handleApplyTokenCasualties.bind(this),
      'applyCondition': this.handleApplyCondition.bind(this),
      'removeCondition': this.handleRemoveCondition.bind(this),
      'listConditions': this.handleListConditions.bind(this),
      'listActiveEffects': this.handleListActiveEffects.bind(this),
      'getWfrp4eConfig': this.handleGetWfrp4eConfig.bind(this),
      'duplicateActor': this.handleDuplicateActor.bind(this),
      'applyNpcCareerAdvance': this.handleApplyNpcCareerAdvance.bind(this),
      'listActorItems': this.handleListActorItems.bind(this),
      'applyTemplate': this.handleApplyTemplate.bind(this),
      'applyTemplateToToken': this.handleApplyTemplateToToken.bind(this),
      'addActiveEffect': this.handleAddActiveEffect.bind(this),
      'updateActiveEffect': this.handleUpdateActiveEffect.bind(this),
      'deleteActiveEffect': this.handleDeleteActiveEffect.bind(this),
      'getActiveEffectByName': this.handleGetActiveEffectByName.bind(this),
      'uploadFile': (data: unknown) => uploadFileHandler(data),
      'listFiles': (data: unknown) => listFilesHandler(data),
      'filepickerNotifyWarn': (data: unknown) => notifyWarnHandler(data),
      'filepickerCreateDirectory': (data: unknown) => createDirectoryHandler(data),
      'notify': this.handleNotify.bind(this),
      'disease': this.handleDisease.bind(this),
      'availability-test': this.handleAvailabilityTest.bind(this),
      'travel-distance': this.handleTravelDistance.bind(this),
      'folder': this.handleFolder.bind(this),
      'setting': this.handleSetting.bind(this),
      'chat-message': this.handleChatMessage.bind(this),
      'item-directory': this.handleItemDirectory.bind(this),
      'actor-config': this.handleActorConfig.bind(this),
      'dice-roll': this.handleDiceRoll.bind(this),
      'keybinding': this.handleKeybinding.bind(this),
      'combatant': this.handleCombatant.bind(this),
      'module-probe': this.handleModuleProbe.bind(this),
      'module-matt': this.handleModuleMatt.bind(this),
      'module-tagger': this.handleModuleTagger.bind(this),
      'module-sequencer': this.handleModuleSequencer.bind(this),
      'module-levels': this.handleModuleLevels.bind(this),
      'module-autoanimations': this.handleModuleAutoAnimations.bind(this),
      'module-scene-atmosphere': this.handleModuleSceneAtmosphere.bind(this),
      'module-access-control': this.handleModuleAccessControl.bind(this),
      'module-css': this.handleModuleCss.bind(this),
      'imperial-arcana': this.handleImperialArcana.bind(this),
      'module-lighting': this.handleModuleLighting.bind(this),
      'module-robak': this.handleModuleRobak.bind(this),
      'module-tokenbar': this.handleModuleTokenbar.bind(this),
      'module-armoury': this.handleModuleArmoury.bind(this),
      'module-party-resources': this.handleModulePartyResources.bind(this),
      'module-gmtoolkit': this.handleModuleGmtoolkit.bind(this),
      'module-chat-commander': this.handleModuleChatCommander.bind(this),
      'module-timekeeping': this.handleModuleTimekeeping.bind(this),
      'module-patrol': this.handleModulePatrol.bind(this),
      'module-gatherer': this.handleModuleGatherer.bind(this),
      'module-mastercrafted': this.handleModuleMastercrafted.bind(this),
      'module-itempiles': this.handleModuleItempiles.bind(this),
      'module-conversation-hud': this.handleModuleConversationHud.bind(this),
      'module-simple-quest': this.handleModuleSimpleQuest.bind(this),
      'module-token-attacher': this.handleModuleTokenAttacher.bind(this),
      'module-token-presentation': this.handleModuleTokenPresentation.bind(this),
      'module-perceptive': this.handleModulePerceptive.bind(this),
      'module-augur-nexus': this.handleModuleAugurNexus.bind(this),
      'module-wfrp-economy': this.handleModuleWfrpEconomy.bind(this),
      'module-mortal-needs': this.handleModuleMortalNeeds.bind(this),
      'module-polyglot': this.handleModulePolyglot.bind(this),
      'module-narrator': this.handleModuleNarrator.bind(this),
      'module-macro-trigger': this.handleModuleMacroTrigger.bind(this),
      'module-backpack': this.handleModuleBackpack.bind(this),
      'module-puzzle-locks': this.handleModulePuzzleLocks.bind(this),
      'module-syrinscape': this.handleModuleSyrinscape.bind(this),
      'module-portal': this.handleModulePortal.bind(this),
      'applyFear': this.handleApplyFear.bind(this),
      'checkReload': this.handleCheckReload.bind(this),
      'addMoney': this.handleAddMoney.bind(this),
      'directPay': this.handleDirectPay.bind(this),
    };
    for (const [key, handler] of Object.entries(handlerTable)) {
      CONFIG.queries[`${modulePrefix}.${key}`] = handler;
    }
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
    return wrapQuery('Failed to get character info', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = GetCharacterInfoInput.strict().parse(data ?? {});
      const identifier = parsed.characterName || parsed.characterId;
      if (!identifier) throw new Error('characterName or characterId is required');
      return { success: true, data: await this.dataAccess.getCharacterInfo(identifier) };
    });
  }

  private async handleListActors(data: unknown): Promise<any> {
    return wrapQuery('Failed to list actors', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = ListActorsInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.listActors(parsed.type) };
    });
  }

  private async handleSearchCompendium(data: unknown): Promise<any> {
    return wrapQuery('Failed to search compendium', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = SearchCompendiumInput.strict().parse(data ?? {});
      return { success: true, data: await this.compendiumSearch.searchCompendium(parsed.query, parsed.packType, parsed.filters, parsed.itemType) };
    });
  }

  private async handleAddItemFromCompendium(data: unknown): Promise<any> {
    return wrapQuery('Failed to add item from compendium', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = AddItemFromCompendiumInput.strict().parse(data ?? {});
      // Phase 7 (R7.1): logic absorbed into ItemService (via the data-access delegate). Handler keeps
      // gmCheck + parse + wrappedWrite + the { success, data } wrap; query key 'addItemFromCompendium' unchanged.
      return await wrappedWrite('addItemFromCompendium', async () => ({ success: true, data: await this.itemService.addItemFromCompendium(parsed) }));
    });
  }

  private async handleListCreaturesByCriteria(data: unknown): Promise<any> {
    return wrapQuery('Failed to list creatures by criteria', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = ListCreaturesByCriteriaInput.strict().parse(data ?? {});
      const result = await this.compendiumSearch.listCreaturesByCriteria(parsed);
      return { success: true, data: result };
    });
  }

  private async handleGetAvailablePacks(data: unknown): Promise<any> {
    return wrapQuery('Failed to get available packs', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      GetAvailablePacksInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.getAvailablePacks() };
    });
  }

  // Phase 4 mcp_crud_expansion — single umbrella entry point for all 11 scene
  // actions. Validates Foundry-side state then delegates to dispatchScene
  // (handlers/scene.ts) which routes by `args.action`.
  private async handleScene(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch scene action', async () => {
      this.dataAccess.validateFoundryState();
      // Phase 6 (R5.2): the `list` action's listScenes now lives on the promoted ScenePlacementService.
      return await dispatchSceneHandler(data, this.scenePlacement);
    });
  }

  private async handleGetWorldInfo(data: unknown): Promise<any> {
    return wrapQuery('Failed to get world info', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      GetWorldInfoInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.getWorldInfo() };
    });
  }

  private async handlePing(data: unknown): Promise<any> {
    return wrapQuery('Failed to ping', async () => {
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
    });
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
    return wrapQuery('Failed to create actor from compendium', async () => {
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

      return await wrappedWrite('createActorFromCompendium', async () => ({ success: true, data: await this.actorService.createActorFromCompendiumEntry(requestData) }));
    });
  }

  private async handleGetCompendiumDocumentFull(data: unknown): Promise<any> {
    return wrapQuery('Failed to get compendium document', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = GetCompendiumDocumentFullInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.getCompendiumDocumentFull(parsed.packId, parsed.documentId) };
    });
  }

  // Phase 4 mcp_crud_expansion — handleAddActorsToScene + handleDeleteToken
  // folded into handleScene umbrella (action: 'add-tokens' / 'delete-token').
  // Phase 5 mcp_crud_expansion — those 2 actions migrated OUT of scene umbrella
  // and into the new `token` umbrella (handleToken; actions 'add' / 'delete-token').

  // BUG-009 (2026-05-16) — handleValidateWritePermissions removed; never had an
  // MCP-tool consumer. permissionManager.checkWritePermission is still used
  // server-side via wrappedWrite.

  // Phase 3 mcp_crud_expansion — Journal umbrella dispatcher (13 actions).
  // Replaces 5 legacy inline handlers: handleCreateJournalEntry, handleListJournals,
  // handleGetJournalContent, handleUpdateJournalContent, handleDeleteJournalEntry.
  // The free-function dispatchJournal in handlers/journal.ts owns input strict-parse,
  // GM access gate, transaction wrapping, BUG-070 post-verify, and the typed
  // response envelope per action.
  async handleJournal(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch journal action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchJournalHandler(data);
    });
  }

  // Phase 1 module_integration_v1 — module-probe umbrella dispatcher.
  // Intentionally skips validateFoundryState() — game.modules is available
  // before Foundry reaches full ready state (mirrors handleDiagnostic).
  // No enableDiagnosticTools gate — module-probe is a standalone read-only probe.
  private async handleModuleProbe(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-probe action', async () => {
      return await dispatchModuleProbeHandler(data);
    });
  }

  // Phase 1 module_integration_v1 — module-matt stub dispatcher.
  // requireModuleActive('monks-active-tiles') guard runs inside dispatchModuleMatt.
  // Returns MODULE_NOT_ACTIVE when the module is absent/inactive.
  private async handleModuleMatt(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-matt action', async () => {
      return await dispatchModuleMattHandler(data);
    });
  }

  // Phase 5 module_integration_v1 — module-tagger dispatcher.
  // requireModuleActive('tagger') guard runs inside dispatchModuleTagger.
  private async handleModuleTagger(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-tagger action', async () => {
      return await dispatchModuleTaggerHandler(data);
    });
  }

  // Phase 4 module_integration_v1 — module-levels dispatcher.
  // requireModuleActive('levels', ['wall-height']) guard runs inside dispatchModuleLevels.
  private async handleModuleLevels(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-levels action', async () => {
      return await dispatchModuleLevelsHandler(data);
    });
  }

  // Phase 5 module_integration_v1 — module-sequencer dispatcher.
  // requireModuleActive('sequencer') guard runs inside dispatchModuleSequencer.
  private async handleModuleSequencer(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-sequencer action', async () => {
      return await dispatchModuleSequencerHandler(data);
    });
  }

  // Phase 8 module_integration_v1 — module-autoanimations dispatcher.
  // requireModuleActive('autoanimations', ['sequencer','socketlib']) guard runs inside.
  private async handleModuleAutoAnimations(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-autoanimations action', async () => {
      return await dispatchModuleAutoAnimationsHandler(data);
    });
  }

  // Phase 6 module_integration_v1 — module-scene-atmosphere dispatcher.
  // Per-action guard via ACTION_MEMBER_MAP + requireModuleActive runs inside
  // dispatchModuleSceneAtmosphere. get-bundle-status is always unguarded.
  private async handleModuleSceneAtmosphere(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-scene-atmosphere action', async () => {
      return await dispatchModuleSceneAtmosphereHandler(data);
    });
  }

  // Phase 7 module_integration_v1 — module-access-control dispatcher (LocknKey + LockView).
  // Per-action guard via ACTION_MEMBER_MAP + requireModuleActive runs inside
  // dispatchModuleAccessControl. get-bundle-status is always unguarded; get-lock-state
  // routes to the LnK or LockView member by input shape.
  private async handleModuleAccessControl(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-access-control action', async () => {
      return await dispatchModuleAccessControlHandler(data);
    });
  }

  // Phase 9 module_integration_v1 — module-robak dispatcher.
  // requireModuleActive('wfrp4e-macros-and-more') guard runs inside dispatchModuleRobak.
  private async handleModuleRobak(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-robak action', async () => {
      return await dispatchModuleRobakHandler(data);
    });
  }

  // Phase 9 module_integration_v1 — module-tokenbar dispatcher.
  // requireModuleActive('monks-tokenbar') guard runs inside dispatchModuleTokenbar.
  private async handleModuleTokenbar(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-tokenbar action', async () => {
      return await dispatchModuleTokenbarHandler(data);
    });
  }

  // Phase 10 module_integration_v1 — module-armoury dispatcher.
  // requireModuleActive('forien-armoury') guard runs inside dispatchModuleArmoury.
  private async handleModuleArmoury(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-armoury action', async () => {
      return await dispatchModuleArmouryHandler(data);
    });
  }

  // Phase 1 module_integration_v2 — module-conversation-hud dispatcher.
  // requireModuleActive('conversation-hud') guard runs inside dispatchModuleConversationHud.
  private async handleModuleConversationHud(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-conversation-hud action', async () => {
      return await dispatchModuleConversationHudHandler(data);
    });
  }

  // Phase 2 module_integration_v2 — module-simple-quest dispatcher.
  // requireModuleActive('simple-quest') guard runs inside dispatchModuleSimpleQuest.
  private async handleModuleSimpleQuest(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-simple-quest action', async () => {
      return await dispatchModuleSimpleQuestHandler(data);
    });
  }

  // Phase 3 module_integration_v2 — module-token-attacher dispatcher.
  // requireModuleActive('token-attacher', ['lib-wrapper']) guard runs inside dispatchModuleTokenAttacher.
  private async handleModuleTokenAttacher(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-token-attacher action', async () => {
      return await dispatchModuleTokenAttacherHandler(data);
    });
  }

  // Phase 3 module_integration_v2 — module-token-presentation dispatcher.
  // Per-action requireModuleActive guard (CCR-12) runs inside dispatchModuleTokenPresentation.
  private async handleModuleTokenPresentation(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-token-presentation action', async () => {
      return await dispatchModuleTokenPresentationHandler(data);
    });
  }

  // Phase 4 module_integration_v2 — module-perceptive dispatcher.
  // requireModuleActive('perceptive') guard runs inside dispatchModulePerceptive (except the
  // wfrp-stealth-delegate fail-open path, CCR-9).
  private async handleModulePerceptive(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-perceptive action', async () => {
      return await dispatchModulePerceptiveHandler(data);
    });
  }

  // Phase 5 module_integration_v2 — module-augur-nexus dispatcher.
  // requireModuleActive('augur-nexus') guard runs inside dispatchModuleAugurNexus.
  private async handleModuleAugurNexus(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-augur-nexus action', async () => {
      return await dispatchModuleAugurNexusHandler(data);
    });
  }

  // Phase 6 module_integration_v2 — module-wfrp-economy dispatcher.
  // requireModuleActive('wfrp4e-economy') guard runs inside dispatchModuleWfrpEconomy.
  private async handleModuleWfrpEconomy(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-wfrp-economy action', async () => {
      return await dispatchModuleWfrpEconomyHandler(data);
    });
  }

  // Phase 8 module_integration_v2 — module-mortal-needs dispatcher.
  // requireModuleActive('mortal-needs') guard runs inside dispatchModuleMortalNeeds.
  private async handleModuleMortalNeeds(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-mortal-needs action', async () => {
      return await dispatchModuleMortalNeedsHandler(data);
    });
  }

  // Phase 9 module_integration_v2 — module-polyglot dispatcher.
  // requireModuleActive('polyglot') guard runs inside dispatchModulePolyglot.
  private async handleModulePolyglot(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-polyglot action', async () => {
      return await dispatchModulePolyglotHandler(data);
    });
  }

  // Phase 10 module_integration_v2 — module-narrator dispatcher.
  // requireModuleActive('narrator-tools') guard runs inside dispatchModuleNarrator.
  private async handleModuleNarrator(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-narrator action', async () => {
      return await dispatchModuleNarratorHandler(data);
    });
  }

  // Phase 11 module_integration_v2 — module-macro-trigger dispatcher.
  // requireModuleActive('macro-trigger') guard runs inside dispatchModuleMacroTrigger.
  private async handleModuleMacroTrigger(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-macro-trigger action', async () => {
      return await dispatchModuleMacroTriggerHandler(data);
    });
  }

  // Phase 12 module_integration_v2 — module-backpack dispatcher.
  // requireModuleActive('backpack') guard runs inside dispatchModuleBackpack.
  private async handleModuleBackpack(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-backpack action', async () => {
      return await dispatchModuleBackpackHandler(data);
    });
  }

  // Phase 13B module_integration_v2 — module-puzzle-locks dispatcher.
  // requireModuleActive('puzzle-locks') guard runs inside dispatchModulePuzzleLocks.
  private async handleModulePuzzleLocks(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-puzzle-locks action', async () => {
      return await dispatchModulePuzzleLocksHandler(data);
    });
  }

  // Phase 13C module_integration_v2 — module-syrinscape dispatcher.
  // requireModuleActive('syrinscape-control') guard runs inside dispatchModuleSyrinscape.
  private async handleModuleSyrinscape(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-syrinscape action', async () => {
      return await dispatchModuleSyrinscapeHandler(data);
    });
  }

  // Phase 13A module_integration_v2 — module-portal dispatcher.
  // requireModuleActive('portal-lib') guard runs inside dispatchModulePortal.
  private async handleModulePortal(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-portal action', async () => {
      return await dispatchModulePortalHandler(data);
    });
  }

  // Phase 11 module_integration_v1 — module-party-resources dispatcher.
  // requireModuleActive('fvtt-party-resources') guard runs inside dispatchModulePartyResources.
  private async handleModulePartyResources(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-party-resources action', async () => {
      return await dispatchModulePartyResourcesHandler(data);
    });
  }

  // Phase 11 module_integration_v1 — module-gmtoolkit dispatcher.
  // requireModuleActive('wfrp4e-gm-toolkit') guard runs inside dispatchModuleGmtoolkit.
  private async handleModuleGmtoolkit(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-gmtoolkit action', async () => {
      return await dispatchModuleGmtoolkitHandler(data);
    });
  }

  // Phase 12 module_integration_v1 — module-chat-commander dispatcher.
  // requireModuleActive('_chatcommands') guard runs inside dispatchModuleChatCommander.
  private async handleModuleChatCommander(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-chat-commander action', async () => {
      return await dispatchModuleChatCommanderHandler(data);
    });
  }

  // Phase 14 module_integration_v1 — thin-session dispatchers.
  // requireModuleActive(<id>) guards run inside each dispatcher.
  private async handleModuleTimekeeping(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-timekeeping action', async () => {
      return await dispatchModuleTimekeepingHandler(data);
    });
  }

  private async handleModulePatrol(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-patrol action', async () => {
      return await dispatchModulePatrolHandler(data);
    });
  }

  private async handleModuleGatherer(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-gatherer action', async () => {
      return await dispatchModuleGathererHandler(data);
    });
  }

  private async handleModuleMastercrafted(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-mastercrafted action', async () => {
      return await dispatchModuleMastercraftedHandler(data);
    });
  }

  // Phase 3 module_integration_v1 — module-itempiles dispatcher.
  // requireModuleActive('item-piles') guard runs inside dispatchModuleItempiles.
  private async handleModuleItempiles(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-itempiles action', async () => {
      return await dispatchModuleItempilesHandler(data);
    });
  }

  // Phase 13A module_integration_v1 — module-css dispatcher.
  // requireModuleActive('custom-css') guard runs inside dispatchModuleCss.
  private async handleModuleCss(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-css action', async () => {
      return await dispatchModuleCssHandler(data);
    });
  }

  // wfrp_imperial_arcana Phase 7 — imperial-arcana dispatcher.
  // requireModuleActive('wfrp-imperial-arcana') guard runs inside dispatchImperialArcana.
  private async handleImperialArcana(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch imperial-arcana action', async () => {
      return await dispatchImperialArcanaHandler(data);
    });
  }

  // Phase 15 module_integration_v1 — module-lighting dispatcher.
  // requireModuleActive('CommunityLighting') guard runs inside dispatchModuleLighting.
  private async handleModuleLighting(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch module-lighting action', async () => {
      return await dispatchModuleLightingHandler(data);
    });
  }

  // Phase 1 mcp_diagnostic_tool — Tier 1 read-only diagnostic dispatcher.
  // Tier 1 sub-actions (recent-errors / world-issues / support-snapshot) do
  // NOT call validateFoundryState() per plan Design Decisions row 10 —
  // game.issues, the runtime ring buffer, and SupportDetails are always
  // available, and the diagnostic surface is most valuable precisely when
  // Foundry state is half-broken. Dispatcher owns the dual gate
  // (validateGMAccess + enableDiagnosticTools setting).
  private async handleDiagnostic(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch diagnostic action', async () => {
      return await dispatchDiagnosticHandler(data, this.dataAccess);
    });
  }

  // Phase 5 mcp_crud_expansion — 7 per-doc-type embedded-CRUD umbrella entry points.
  // Each delegates to a handlers/<type>.ts dispatchX which owns GM gate, strict-parse,
  // transaction wrapping, DP-16 post-verify, and typed envelope.
  //
  // `token` dispatcher needs the dataAccess facade for its migrated `add` and
  // `delete-token` actions (formerly scene.add-tokens / scene.delete-token).
  // The other 6 umbrellas operate via direct scene.<collection>.<verb> calls
  // and do not need the data-access facade.

  async handleToken(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch token action', async () => {
      this.dataAccess.validateFoundryState();
      // Phase 6 (R5.2): add-tokens / delete-token now live on the promoted ScenePlacementService.
      return await dispatchTokenHandler(data, this.scenePlacement);
    });
  }

  async handleLight(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch light action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchLightHandler(data);
    });
  }

  async handleNote(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch note action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchNoteHandler(data);
    });
  }

  async handleSound(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch sound action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchSoundHandler(data);
    });
  }

  async handlePlaylist(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch playlist action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchPlaylistHandler(data);
    });
  }

  async handleMacro(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch macro action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchMacroHandler(data);
    });
  }

  async handleUser(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch user action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchUserHandler(data);
    });
  }

  async handleCompendium(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch compendium action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchCompendiumHandler(data);
    });
  }

  async handleCrossDocFk(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch cross-doc-fk action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchCrossDocFkHandler(data);
    });
  }

  async handleRegion(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch region action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchRegionHandler(data);
    });
  }

  async handleTile(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch tile action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchTileHandler(data);
    });
  }

  async handleDrawing(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch drawing action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchDrawingHandler(data);
    });
  }

  async handleCards(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch cards action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchCardsHandler(data);
    });
  }

  async handleDocumentIo(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch document-io action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchDocumentIoHandler(data);
    });
  }

  async handleTemplate(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch template action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchTemplateHandler(data);
    });
  }

  async handleDisease(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch disease action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchDiseaseHandler(data);
    });
  }

  async handleAvailabilityTest(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch availability-test', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchAvailabilityTestHandler(data);
    });
  }

  async handleTravelDistance(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch travel-distance', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchTravelDistanceHandler(data);
    });
  }

  async handleFolder(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch folder action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchFolderHandler(data);
    });
  }

  async handleSetting(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch setting action', async () => {
      // fail-closed: setting reads succeed pre-ready (game.settings is available before Foundry hits 'ready'),
      // but treat as fully-init flow for predictability. Diagnostic intentionally skips this; setting does not, per canonical-pass review 2026-05-21.
      this.dataAccess.validateFoundryState();
      return await dispatchSettingHandler(data);
    });
  }

  async handleChatMessage(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch chat-message action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchChatMessageHandler(data);
    });
  }

  async handleRequestPlayerRolls(data: unknown): Promise<any> {
    return wrapQuery('Failed to request player rolls', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = RequestPlayerRollsInput.strict().parse(data ?? {});
      return await wrappedWrite('requestPlayerRolls', async () => ({ success: true, data: await this.rollRequest.requestPlayerRolls(parsed) }));
    });
  }

  // BUG-009 (2026-05-16) — handleGetEnhancedCreatureIndex removed; no MCP-tool
  // consumer. dataAccess.getEnhancedCreatureIndex retained pending review.

  // PRD R1.5 — deprecation wrappers. Old actor-only ownership keys are kept
  // exported so cached legacy callers fail loudly with a pointer at the new
  // polymorphic surface. Input is still strict-parsed (BUG-034 / CCR-5).
  async handleSetActorOwnership(data: unknown): Promise<any> {
    return wrapQuery('Failed to set actor ownership', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      SetActorOwnershipInput.strict().parse(data ?? {});
      return {
        success: false,
        error: 'setActorOwnership is deprecated; use setDocumentOwnership with documentType: "actor" (PRD mcp_crud_expansion Phase 1 R1.5)',
        deprecated: true,
      };
    });
  }

  async handleGetActorOwnership(data: unknown): Promise<any> {
    return wrapQuery('Failed to get actor ownership', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      GetActorOwnershipInput.strict().parse(data ?? {});
      return {
        success: false,
        error: 'getActorOwnership is deprecated; use getDocumentOwnership with documentType: "actor" (PRD mcp_crud_expansion Phase 1 R1.5)',
        deprecated: true,
      };
    });
  }

  // Phase 1 mcp_crud_expansion — polymorphic ownership handlers. Each strict-parses
  // its input (CCR-5) and delegates to handlers/ownership.ts where the GM gate +
  // wrappedWrite + Foundry doc updates live.
  async handleSetDocumentOwnership(data: unknown): Promise<any> {
    return wrapQuery('Failed to set document ownership', async () => {
      this.dataAccess.validateFoundryState();
      const parsed = SetDocumentOwnershipInput.parse(data ?? {});
      return await setDocumentOwnershipHandler(parsed);
    });
  }

  async handleGetDocumentOwnership(data: unknown): Promise<any> {
    return wrapQuery('Failed to get document ownership', async () => {
      this.dataAccess.validateFoundryState();
      const parsed = GetDocumentOwnershipInput.parse(data ?? {});
      return await getDocumentOwnershipHandler(parsed);
    });
  }

  async handleBulkSetDocumentOwnership(data: unknown): Promise<any> {
    return wrapQuery('Failed to bulk-set document ownership', async () => {
      this.dataAccess.validateFoundryState();
      const parsed = BulkSetDocumentOwnershipInput.parse(data ?? {});
      return await bulkSetDocumentOwnershipHandler(parsed);
    });
  }

  async handleResetDocumentOwnership(data: unknown): Promise<any> {
    return wrapQuery('Failed to reset document ownership', async () => {
      this.dataAccess.validateFoundryState();
      const parsed = ResetDocumentOwnershipInput.parse(data ?? {});
      return await resetDocumentOwnershipHandler(parsed);
    });
  }

  // BUG-009 (2026-05-16) — 5 orphan handlers removed (handleGetFriendlyNPCs,
  // handleGetConnectedPlayers, handleGetPartyCharacters, handleFindPlayers,
  // handleFindActor). None had an MCP-tool consumer; staged in Phase 2 for
  // a /wfrp-session-prep wrapper that never landed (per BUG-038 retrospective).
  // dataAccess methods retained pending review.

  // Phase 4 mcp_crud_expansion — handleListScenes folded into handleScene umbrella
  // (action: 'list'). handleSwitchScene removed; clean-break replacement is the
  // pair `scene { action: 'activate' }` (world-active) + `scene { action: 'view' }`
  // (per-user canvas view).

  private async handleCreateActor(data: unknown): Promise<any> {
    return wrapQuery('Failed to create actor', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = CreateActorInput.strict().parse(data ?? {});
      const actorData = parsed.folderId
        ? { ...parsed.actorData, folder: parsed.folderId }
        : parsed.actorData;
      // HC9: forward options.skipItems through to Actor.create(data, options)
      // so wfrp4e ActorWFRP4e._preCreate (wfrp4e.js:12384) gate suppresses the
      // basic-skills DialogV2.confirm on npc/creature autonomous creation.
      return await wrappedWrite('createActor', async () => ({
        success: true,
        data: await this.actorService.createActor({
          actorData,
          ...(parsed.options && parsed.options.skipItems !== undefined
            ? { options: { skipItems: parsed.options.skipItems } }
            : {}),
        }),
      }));
    });
  }

  private async handleDuplicateActor(data: unknown): Promise<any> {
    return wrapQuery('Failed to duplicate actor', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = DuplicateActorInput.strict().parse(data ?? {});
      return await wrappedWrite('duplicateActor', async () => ({ success: true, data: await this.actorService.duplicateActor(parsed) }));
    });
  }

  private async handleApplyNpcCareerAdvance(data: unknown): Promise<any> {
    return wrapQuery('Failed to apply NPC career advance', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = ApplyNpcCareerAdvanceInput.strict().parse(data ?? {});
      return await wrappedWrite('applyNpcCareerAdvance', async () => ({ success: true, data: await this.actorService.applyNpcCareerAdvance(parsed) }));
    });
  }

  private async handleApplyTemplate(data: unknown): Promise<any> {
    return wrapQuery('Failed to apply template', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = ApplyTemplateInput.strict().parse(data ?? {});
      return await wrappedWrite('applyTemplate', async () => ({ success: true, data: await this.templateApply.applyTemplate(parsed) }));
    });
  }

  private async handleApplyTemplateToToken(data: unknown): Promise<any> {
    return wrapQuery('Failed to apply template to token', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = ApplyTemplateToTokenInput.strict().parse(data ?? {});
      return await wrappedWrite('applyTemplateToToken', async () => ({ success: true, data: await this.templateApply.applyTemplateToToken(parsed) }));
    });
  }

  private async handleApplyTokenCasualties(data: unknown): Promise<any> {
    return wrapQuery('Failed to apply token casualties', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = ApplyTokenCasualtiesInput.strict().parse(data ?? {});
      return await wrappedWrite('applyTokenCasualties', async () => ({ success: true, data: await this.tokenCasualties.applyTokenCasualties(parsed) }));
    });
  }

  private async handleListActorItems(data: unknown): Promise<any> {
    return wrapQuery('Failed to list actor items', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = ListActorItemsInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.listActorItems(parsed) };
    });
  }

  private async handleUpdateActor(data: unknown): Promise<any> {
    return wrapQuery('Failed to update actor', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = UpdateActorInput.strict().parse(data ?? {});
      // Phase 12 R12.3: reject non-allow-listed updateData leaves at the handler boundary — the single entry
      // every real caller crosses (the update-actor tool AND manage-character, which writes via
      // this.query('updateActor')). Resolve the actor for its type; if it's gone, skip and let updateActor
      // throw the canonical not-found error (no write happens either way).
      const actorForType = (game as any).actors?.get(parsed.actorId);
      if (actorForType) assertAllowedActorFields(parsed.updateData, actorForType.type);
      return await wrappedWrite('updateActor', async () => ({ success: true, data: await this.actorService.updateActor(parsed) }));
    });
  }

  private async handleUpdateItem(data: unknown): Promise<any> {
    return wrapQuery('Failed to update item', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = UpdateItemInput.strict().parse(data ?? {});
      return await wrappedWrite('updateItem', async () => ({ success: true, data: await this.itemService.updateItem(parsed) }));
    });
  }

  private async handleCreateItem(data: unknown): Promise<any> {
    return wrapQuery('Failed to create item', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = CreateItemInput.strict().parse(data ?? {});
      return await wrappedWrite('createItem', async () => ({ success: true, data: await this.itemService.createItem(parsed) }));
    });
  }

  private async handleDeleteItem(data: unknown): Promise<any> {
    return wrapQuery('Failed to delete item', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = DeleteItemInput.strict().parse(data ?? {});
      return await wrappedWrite('deleteItem', async () => ({ success: true, data: await this.itemService.deleteItem(parsed) }));
    });
  }

  private async handleDeleteActor(data: unknown): Promise<any> {
    return wrapQuery('Failed to delete actor', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = DeleteActorInput.strict().parse(data ?? {});
      return await wrappedWrite('deleteActor', async () => ({ success: true, data: await this.actorService.deleteActor(parsed) }));
    });
  }

  // Phase 3 mcp_crud_expansion — handleDeleteJournalEntry retired. The
  // `journal { action: "delete-entry" }` umbrella variant supersedes it
  // (free-function deleteEntry in handlers/journal.ts).

  private async handleModifyItemQualities(data: unknown): Promise<any> {
    return wrapQuery('Failed to modify item qualities', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = ModifyItemQualitiesV2Input.parse(data ?? {});
      // Phase 7 (R7.1): logic absorbed into ItemService (via the data-access delegate). Handler keeps
      // gmCheck + parse + wrappedWrite + the { success, data } wrap; query key 'modifyItemQualities' unchanged.
      return await wrappedWrite('modifyItemQualities', async () => ({ success: true, data: await this.itemService.modifyItemQualities(parsed) }));
    });
  }

  // Phase 5 — atomic item trade between actors
  // tradeItem: GM-gated via validateGMAccess(); transaction-wrapped via wrappedWrite.
  private async handleTradeItem(data: unknown): Promise<any> {
    return wrapQuery('Failed to trade item', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = TradeItemInput.strict().parse(data ?? {});
      return await wrappedWrite('tradeItem', async () => ({
        success: true,
        data: await this.itemService.tradeItem(parsed),
      }));
    });
  }

  // Phase 2 mcp_crud_expansion — RollTable thin shims. All logic now lives in
  // handlers/rolltable.ts (strict-parse + GM gate + wrappedWrite + BUG-070 pre/post-verify).
  // Shims just strict-validate Foundry state and delegate.
  private async handleCreateRollTable(data: unknown): Promise<any> {
    return wrapQuery('Failed to create RollTable', async () => {
      return await createRollTableHandler(data);
    });
  }

  private async handleAddTableResults(data: unknown): Promise<any> {
    return wrapQuery('Failed to add table results', async () => {
      return await addTableResultsHandler(data);
    });
  }

  private async handleListRollTables(data: unknown): Promise<any> {
    return wrapQuery('Failed to list RollTables', async () => {
      return await listRollTablesHandler(data);
    });
  }

  private async handleGetRollTable(data: unknown): Promise<any> {
    return wrapQuery('Failed to get RollTable', async () => {
      return await getRollTableHandler(data);
    });
  }

  private async handleRollOnTable(data: unknown): Promise<any> {
    return wrapQuery('Failed to roll on table', async () => {
      return await rollOnTableHandler(data);
    });
  }

  private async handleDeleteRollTable(data: unknown): Promise<any> {
    return wrapQuery('Failed to delete RollTable', async () => {
      return await deleteRollTableHandler(data);
    });
  }

  private async handleUpdateRollTable(data: unknown): Promise<any> {
    return wrapQuery('Failed to update RollTable', async () => {
      return await updateRollTableHandler(data);
    });
  }

  private async handleUpdateTableResults(data: unknown): Promise<any> {
    return wrapQuery('Failed to update table results', async () => {
      return await updateTableResultsHandler(data);
    });
  }

  private async handleDeleteTableResults(data: unknown): Promise<any> {
    return wrapQuery('Failed to delete table results', async () => {
      return await deleteTableResultsHandler(data);
    });
  }

  private async handleNormalizeRollTable(data: unknown): Promise<any> {
    return wrapQuery('Failed to normalize RollTable', async () => {
      return await normalizeRollTableHandler(data);
    });
  }

  private async handleResetRollTableResults(data: unknown): Promise<any> {
    return wrapQuery('Failed to reset RollTable results', async () => {
      return await resetRollTableResultsHandler(data);
    });
  }

  private async handleDrawManyFromTable(data: unknown): Promise<any> {
    return wrapQuery('Failed to draw from table', async () => {
      return await drawManyFromTableHandler(data);
    });
  }

  private async handleImportRollTableFromCompendium(data: unknown): Promise<any> {
    return wrapQuery('Failed to import RollTable from compendium', async () => {
      return await importRollTableFromCompendiumHandler(data);
    });
  }

  // ============================================================
  // Phase 4b handlers — combat / damage / conditions / effects
  // ============================================================

  private async handleGetCombat(data: unknown): Promise<any> {
    return wrapQuery('Failed to get combat', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = GetCombatInput.strict().parse(data ?? {});
      return { success: true, data: await this.combat.getCombat(parsed) };
    });
  }

  private async handleListCombatants(data: unknown): Promise<any> {
    return wrapQuery('Failed to list combatants', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = ListCombatantsInput.strict().parse(data ?? {});
      return { success: true, data: await this.combat.listCombatants(parsed) };
    });
  }

  private async handleAdvanceCombat(data: unknown): Promise<any> {
    return wrapQuery('Failed to advance combat', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = AdvanceCombatInput.strict().parse(data ?? {});
      return await wrappedWrite('advanceCombat', async () => ({
        success: true,
        data: await this.combat.advanceCombat(parsed),
      }));
    });
  }

  private async handleAddCombatants(data: unknown): Promise<any> {
    return wrapQuery('Failed to add combatants', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = AddCombatantsInput.strict().parse(data ?? {});
      return await wrappedWrite('addCombatants', async () => ({
        success: true,
        data: await this.combat.addCombatants(parsed),
      }));
    });
  }

  private async handleRemoveCombatants(data: unknown): Promise<any> {
    return wrapQuery('Failed to remove combatants', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = RemoveCombatantsInput.strict().parse(data ?? {});
      return await wrappedWrite('removeCombatants', async () => ({
        success: true,
        data: await this.combat.removeCombatants(parsed),
      }));
    });
  }

  private async handleEndCombat(data: unknown): Promise<any> {
    return wrapQuery('Failed to end combat', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = EndCombatInput.strict().parse(data ?? {});
      return await wrappedWrite('endCombat', async () => ({
        success: true,
        data: await this.combat.endCombat(parsed),
      }));
    });
  }

  private async handleApplyDamage(data: unknown): Promise<any> {
    return wrapQuery('Failed to apply damage', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = ApplyDamageInput.strict().parse(data ?? {});
      return await wrappedWrite('applyDamage', async () => ({
        success: true,
        data: await this.dataAccess.applyDamage(parsed),
      }));
    });
  }

  private async handleApplyCondition(data: unknown): Promise<any> {
    return wrapQuery('Failed to apply condition', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = ApplyConditionInput.strict().parse(data ?? {});
      return await wrappedWrite('applyCondition', async () => ({
        success: true,
        data: await this.conditions.applyCondition(parsed),
      }));
    });
  }

  private async handleRemoveCondition(data: unknown): Promise<any> {
    return wrapQuery('Failed to remove condition', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = RemoveConditionInput.strict().parse(data ?? {});
      return await wrappedWrite('removeCondition', async () => ({
        success: true,
        data: await this.conditions.removeCondition(parsed),
      }));
    });
  }

  // Phase 13 wfrp_layer_expansion_v1 (R16) — sheet-flow method-wraps. Design B (fear/terror):
  // create the Fear extendedTest item directly, skip setupExtendedTest (deadlock/dialog guard,
  // see services/psychology.ts header). apply-terror (mcp-server) reuses this same query key.
  private async handleApplyFear(data: unknown): Promise<any> {
    return wrapQuery('Failed to apply fear', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = ApplyFearInput.strict().parse(data ?? {});
      return await wrappedWrite('applyFear', async () => ({
        success: true,
        data: await this.psychology.applyFear(parsed),
      }));
    });
  }

  private async handleCheckReload(data: unknown): Promise<any> {
    return wrapQuery('Failed to check reload', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = CheckReloadInput.strict().parse(data ?? {});
      return await wrappedWrite('checkReload', async () => ({
        success: true,
        data: await this.inventory.checkReload(parsed),
      }));
    });
  }

  private async handleAddMoney(data: unknown): Promise<any> {
    return wrapQuery('Failed to add money', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = AddMoneyInput.strict().parse(data ?? {});
      return await wrappedWrite('addMoney', async () => ({
        success: true,
        data: await this.market.addMoney(parsed),
      }));
    });
  }

  private async handleDirectPay(data: unknown): Promise<any> {
    return wrapQuery('Failed to direct pay', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = DirectPayInput.strict().parse(data ?? {});
      return await wrappedWrite('directPay', async () => ({
        success: true,
        data: await this.market.directPay(parsed),
      }));
    });
  }

  private async handleListConditions(data: unknown): Promise<any> {
    return wrapQuery('Failed to list conditions', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      // P-09: ListConditionsInput is now a ZodEffects (carries .strict() + a mutex
      // .refine()), so call .parse directly — .strict() is already baked in.
      const parsed = ListConditionsInput.parse(data ?? {});
      return { success: true, data: await this.conditions.listConditions(parsed) };
    });
  }

  private async handleListActiveEffects(data: unknown): Promise<any> {
    return wrapQuery('Failed to list active effects', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = ListActiveEffectsInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.listActiveEffects(parsed) };
    });
  }

  private async handleGetWfrp4eConfig(data: unknown): Promise<any> {
    return wrapQuery('Failed to read wfrp4e config', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      const parsed = GetWfrp4eConfigInput.strict().parse(data ?? {});
      return { success: true, data: await this.dataAccess.getWfrp4eConfig(parsed) };
    });
  }

  // ============================================================
  // Phase 5 follow-up B — active-effect CRUD
  // ============================================================

  private async handleAddActiveEffect(data: unknown): Promise<any> {
    return wrapQuery('Failed to add active effect', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = AddActiveEffectInput.strict().parse(data ?? {});
      return await wrappedWrite('addActiveEffect', async () => ({
        success: true,
        data: await this.effectsService.addActiveEffect(parsed),
      }));
    });
  }

  private async handleUpdateActiveEffect(data: unknown): Promise<any> {
    return wrapQuery('Failed to update active effect', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = UpdateActiveEffectInput.strict().parse(data ?? {});
      if (!parsed.effectId && !parsed.effectName) {
        throw new Error('updateActiveEffect requires one of effectId or effectName');
      }
      return await wrappedWrite('updateActiveEffect', async () => ({
        success: true,
        data: await this.effectsService.updateActiveEffect(parsed),
      }));
    });
  }

  private async handleDeleteActiveEffect(data: unknown): Promise<any> {
    return wrapQuery('Failed to delete active effect', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = DeleteActiveEffectInput.strict().parse(data ?? {});
      if (!parsed.effectId && !parsed.effectName) {
        throw new Error('deleteActiveEffect requires one of effectId or effectName');
      }
      return await wrappedWrite('deleteActiveEffect', async () => ({
        success: true,
        data: await this.effectsService.deleteActiveEffect(parsed),
      }));
    });
  }

  // TOOL-IDEA-003 (2026-05-14): read-only AE-by-name resolver. Not wrapped in
  // wrappedWrite — pure read.
  private async handleGetActiveEffectByName(data: unknown): Promise<any> {
    return wrapQuery('Failed to get active effect', async () => {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) return { error: 'Access denied', success: false };
      this.dataAccess.validateFoundryState();
      const parsed = GetActiveEffectByNameInput.strict().parse(data ?? {});
      if (!parsed.effectId && !parsed.effectName) {
        throw new Error('getActiveEffectByName requires one of effectId or effectName');
      }
      return {
        success: true,
        data: await this.dataAccess.getActiveEffectByName(parsed),
      };
    });
  }

  // Phase 4 mcp_notify_coverage — `notify` umbrella handler.
  //
  // Strict-parses NotifyToolInput (discriminated union on `severity`), routes to
  // the corresponding notify.* method. Returns `{success: true, data: {acknowledged}}`.
  // `acknowledged` is true iff the dispatcher invoked notify.* without throwing —
  // false ONLY when the internal notify.* call itself crashed. Channel suppression
  // by world settings does NOT flip acknowledged to false (intentional suppression
  // is not failure; see Design Decision 2 in mcp-notify-coverage-phase4.md).
  private async handleNotify(data: unknown): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { success: false, error: 'Access denied: notify requires GM' };
      }
      const parsed = NotifyToolInput.parse(data);
      try {
        switch (parsed.severity) {
          case 'created':
            notify.created('mcp', parsed.message, { summary: parsed.summary, sticky: parsed.sticky, chat: parsed.chat });
            break;
          case 'updated':
            notify.updated('mcp', parsed.message, { summary: parsed.summary, sticky: parsed.sticky, chat: parsed.chat });
            break;
          case 'deleted':
            notify.deleted('mcp', parsed.message, { summary: parsed.summary, sticky: parsed.sticky, chat: parsed.chat });
            break;
          case 'warn':
            notify.warn(parsed.message, { summary: parsed.summary, sticky: parsed.sticky, chat: parsed.chat });
            break;
          case 'info':
            notify.info(parsed.message, { summary: parsed.summary, sticky: parsed.sticky, chat: parsed.chat });
            break;
          case 'error':
            notify.error(parsed.message, undefined, { summary: parsed.summary, sticky: parsed.sticky, chat: parsed.chat });
            break;
          case 'lifecycle':
            notify.lifecycle(parsed.lifecycleEvent, parsed.message);
            break;
        }
        return { success: true, data: { acknowledged: true } };
      } catch (dispatchErr) {
        console.error(`[${MODULE_ID}] [notify-handler] dispatch threw:`, dispatchErr);
        return { success: true, data: { acknowledged: false } };
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: `NOTIFY_INVALID_INPUT: ${error.message}` };
      }
      throw new Error(`Failed to dispatch notify: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 1 mcp_coverage_expansion — item-directory umbrella (5 actions).
  async handleItemDirectory(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch item-directory action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchItemDirectoryHandler(data);
    });
  }

  // Phase 2 mcp_coverage_expansion — dice-roll tool (roll/validate/simulate).
  async handleDiceRoll(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch dice-roll action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchDiceRollHandler(data);
    });
  }

  // Phase 10 mcp_coverage_expansion — keybinding tool (list/get/set/reset-action/reset-all/find-conflicts).
  async handleKeybinding(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch keybinding action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchKeybindingHandler(data);
    });
  }

  // Phase 1 mcp_coverage_expansion — actor-config umbrella (4 actions).
  async handleActorConfig(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch actor-config action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchActorConfigHandler(data);
    });
  }

  // Phase 3 mcp_coverage_expansion — combatant umbrella (7 per-combatant actions).
  async handleCombatant(data: unknown): Promise<any> {
    return wrapQuery('Failed to dispatch combatant action', async () => {
      this.dataAccess.validateFoundryState();
      return await dispatchCombatantHandler(data);
    });
  }
}
