import { z } from 'zod';
import { MODULE_ID } from './constants.js';
import { FoundryDataAccess } from './data-access.js';
import { wrappedWrite } from './transaction-manager.js';
import { notify } from './notify.js';
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
    // Phase 3 mcp_crud_expansion — single `journal` umbrella replaces 5 legacy keys
    // (createJournalEntry / listJournals / getJournalContent / updateJournalContent /
    // deleteJournalEntry). 13 actions dispatched in handlers/journal.ts.
    CONFIG.queries[`${modulePrefix}.journal`] = this.handleJournal.bind(this);
    // Phase 1 mcp_diagnostic_tool — read-only diagnostic surface. GM-gated +
    // setting-gated (enableDiagnosticTools, default false) in the dispatcher.
    CONFIG.queries[`${modulePrefix}.diagnostic`] = this.handleDiagnostic.bind(this);
    // Phase 5 mcp_crud_expansion — 7 embedded-doc CRUD umbrellas.
    CONFIG.queries[`${modulePrefix}.token`] = this.handleToken.bind(this);
    CONFIG.queries[`${modulePrefix}.light`] = this.handleLight.bind(this);
    CONFIG.queries[`${modulePrefix}.note`] = this.handleNote.bind(this);
    CONFIG.queries[`${modulePrefix}.sound`] = this.handleSound.bind(this);
    // Phase 7 — playlist umbrella (10 actions; world-level + embedded sounds).
    CONFIG.queries[`${modulePrefix}.playlist`] = this.handlePlaylist.bind(this);
    CONFIG.queries[`${modulePrefix}.macro`] = this.handleMacro.bind(this);
    CONFIG.queries[`${modulePrefix}.user`] = this.handleUser.bind(this);
    // Phase 9 mcp_crud_expansion — Compendium umbrella (6 actions; NO DELETE per HC3).
    CONFIG.queries[`${modulePrefix}.compendium`] = this.handleCompendium.bind(this);
    // Phase 10 mcp_crud_expansion — Cross-doc FK umbrella (3 actions; closes PRD).
    CONFIG.queries[`${modulePrefix}.cross-doc-fk`] = this.handleCrossDocFk.bind(this);
    CONFIG.queries[`${modulePrefix}.region`] = this.handleRegion.bind(this);
    CONFIG.queries[`${modulePrefix}.tile`] = this.handleTile.bind(this);
    CONFIG.queries[`${modulePrefix}.template`] = this.handleTemplate.bind(this);
    // Phase 5 mcp_coverage_expansion — drawing umbrella.
    CONFIG.queries[`${modulePrefix}.drawing`] = this.handleDrawing.bind(this);
    // Phase 7 mcp_coverage_expansion — cards umbrella.
    CONFIG.queries[`${modulePrefix}.cards`] = this.handleCards.bind(this);
    // Phase 8 mcp_coverage_expansion — document-io umbrella (export/import-as-new/preview).
    CONFIG.queries[`${modulePrefix}.document-io`] = this.handleDocumentIo.bind(this);
    CONFIG.queries[`${modulePrefix}.deleteActor`] = this.handleDeleteActor.bind(this);
    CONFIG.queries[`${modulePrefix}.request-player-rolls`] = this.handleRequestPlayerRolls.bind(this);
    // Deprecation wrappers — old actor-only ownership keys (PRD R1.5).
    CONFIG.queries[`${modulePrefix}.setActorOwnership`] = this.handleSetActorOwnership.bind(this);
    CONFIG.queries[`${modulePrefix}.getActorOwnership`] = this.handleGetActorOwnership.bind(this);
    // Phase 1 mcp_crud_expansion — polymorphic ownership surface (4 handlers).
    CONFIG.queries[`${modulePrefix}.setDocumentOwnership`] = this.handleSetDocumentOwnership.bind(this);
    CONFIG.queries[`${modulePrefix}.getDocumentOwnership`] = this.handleGetDocumentOwnership.bind(this);
    CONFIG.queries[`${modulePrefix}.bulkSetDocumentOwnership`] = this.handleBulkSetDocumentOwnership.bind(this);
    CONFIG.queries[`${modulePrefix}.resetDocumentOwnership`] = this.handleResetDocumentOwnership.bind(this);
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

    // Phase 6.1 mcp_crud_expansion — FilePicker surface (upload/list + notify.warn round-trip).
    CONFIG.queries[`${modulePrefix}.uploadFile`] = (data: unknown) => uploadFileHandler(data);
    CONFIG.queries[`${modulePrefix}.listFiles`] = (data: unknown) => listFilesHandler(data);
    CONFIG.queries[`${modulePrefix}.filepickerNotifyWarn`] = (data: unknown) => notifyWarnHandler(data);
    // Phase 9C R9C.6 — create-directory (named query key, Option A).
    CONFIG.queries[`${modulePrefix}.filepickerCreateDirectory`] = (data: unknown) => createDirectoryHandler(data);
    // Phase 4 mcp_notify_coverage — `notify` umbrella surfaces notify.* to MCP
    // skills as workflow bookends + ad-hoc GM-visible events. GM-gated.
    CONFIG.queries[`${modulePrefix}.notify`] = this.handleNotify.bind(this);
    // Phase wfrp-disease — Disease umbrella (8 actions).
    CONFIG.queries[`${modulePrefix}.disease`] = this.handleDisease.bind(this);
    // Phase 4 mcp_completion_v1 — Folder umbrella (6 actions).
    CONFIG.queries[`${modulePrefix}.folder`] = this.handleFolder.bind(this);
    // Phase 4 mcp_completion_v1 — Setting umbrella (4 actions).
    CONFIG.queries[`${modulePrefix}.setting`] = this.handleSetting.bind(this);
    // Phase 5 mcp_completion_v1 — ChatMessage umbrella (5 actions).
    CONFIG.queries[`${modulePrefix}.chat-message`] = this.handleChatMessage.bind(this);
    // Phase 1 mcp_coverage_expansion — item-directory umbrella (5 actions: list/get/search/duplicate/import-from-compendium).
    CONFIG.queries[`${modulePrefix}.item-directory`] = this.handleItemDirectory.bind(this);
    // Phase 1 mcp_coverage_expansion — actor-config umbrella (4 actions: get/update-prototype-token + get/set-art).
    CONFIG.queries[`${modulePrefix}.actor-config`] = this.handleActorConfig.bind(this);
    // Phase 2 mcp_coverage_expansion — dice-roll tool (roll/validate/simulate over Foundry Roll).
    CONFIG.queries[`${modulePrefix}.dice-roll`] = this.handleDiceRoll.bind(this);
    // Phase 10 mcp_coverage_expansion — keybinding tool (GM-client scope over game.keybindings).
    CONFIG.queries[`${modulePrefix}.keybinding`] = this.handleKeybinding.bind(this);
    // Phase 3 mcp_coverage_expansion — combatant umbrella (7 per-combatant actions).
    CONFIG.queries[`${modulePrefix}.combatant`] = this.handleCombatant.bind(this);
    // Phase 1 module_integration_v1 — module-probe umbrella (always-on, read-only).
    // Does NOT call validateFoundryState() — game.modules is available before full init
    // (mirrors handleDiagnostic pattern, not handleSetting). No enableDiagnosticTools gate.
    CONFIG.queries[`${modulePrefix}.module-probe`] = this.handleModuleProbe.bind(this);
    // Phase 1 module_integration_v1 — module-matt stub (monks-active-tiles conditional).
    // requireModuleActive guard in the dispatcher returns MODULE_NOT_ACTIVE when inactive.
    CONFIG.queries[`${modulePrefix}.module-matt`] = this.handleModuleMatt.bind(this);
    // Phase 5 module_integration_v1 — module-tagger + module-sequencer (conditional).
    CONFIG.queries[`${modulePrefix}.module-tagger`] = this.handleModuleTagger.bind(this);
    CONFIG.queries[`${modulePrefix}.module-sequencer`] = this.handleModuleSequencer.bind(this);
    // Phase 4 module_integration_v1 — module-levels (conditional).
    CONFIG.queries[`${modulePrefix}.module-levels`] = this.handleModuleLevels.bind(this);
    // Phase 8 module_integration_v1 — module-autoanimations (conditional).
    CONFIG.queries[`${modulePrefix}.module-autoanimations`] = this.handleModuleAutoAnimations.bind(this);
    // Phase 6 module_integration_v1 — module-scene-atmosphere bundle (conditional, per-member guard).
    CONFIG.queries[`${modulePrefix}.module-scene-atmosphere`] = this.handleModuleSceneAtmosphere.bind(this);
    // Phase 7 module_integration_v1 — module-access-control bundle (conditional, per-member guard).
    CONFIG.queries[`${modulePrefix}.module-access-control`] = this.handleModuleAccessControl.bind(this);
    // Phase 13A module_integration_v1 — module-css (conditional).
    CONFIG.queries[`${modulePrefix}.module-css`] = this.handleModuleCss.bind(this);
    // Phase 15 module_integration_v1 — module-lighting (CommunityLighting, conditional).
    CONFIG.queries[`${modulePrefix}.module-lighting`] = this.handleModuleLighting.bind(this);
    // Phase 9 module_integration_v1 — WFRP mechanic delegates: module-robak + module-tokenbar (conditional).
    CONFIG.queries[`${modulePrefix}.module-robak`] = this.handleModuleRobak.bind(this);
    CONFIG.queries[`${modulePrefix}.module-tokenbar`] = this.handleModuleTokenbar.bind(this);
    // Phase 10 module_integration_v1 — module-armoury (forien-armoury conditional).
    CONFIG.queries[`${modulePrefix}.module-armoury`] = this.handleModuleArmoury.bind(this);
    // Phase 11 module_integration_v1 — module-party-resources + module-gmtoolkit (conditional).
    CONFIG.queries[`${modulePrefix}.module-party-resources`] = this.handleModulePartyResources.bind(this);
    CONFIG.queries[`${modulePrefix}.module-gmtoolkit`] = this.handleModuleGmtoolkit.bind(this);
    // Phase 12 module_integration_v1 — module-chat-commander (conditional).
    CONFIG.queries[`${modulePrefix}.module-chat-commander`] = this.handleModuleChatCommander.bind(this);
    // Phase 14 module_integration_v1 — thin-session modules (conditional).
    CONFIG.queries[`${modulePrefix}.module-timekeeping`] = this.handleModuleTimekeeping.bind(this);
    CONFIG.queries[`${modulePrefix}.module-patrol`] = this.handleModulePatrol.bind(this);
    CONFIG.queries[`${modulePrefix}.module-gatherer`] = this.handleModuleGatherer.bind(this);
    CONFIG.queries[`${modulePrefix}.module-mastercrafted`] = this.handleModuleMastercrafted.bind(this);
    // Phase 3 module_integration_v1 — item-piles economy surface (conditional).
    CONFIG.queries[`${modulePrefix}.module-itempiles`] = this.handleModuleItempiles.bind(this);
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
      return { success: true, data: await this.dataAccess.searchCompendium(parsed.query, parsed.packType, parsed.filters, parsed.itemType) };
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
        const embedOptions: Record<string, unknown> = {};
        if (parsed.skipSpecialisationChoice) embedOptions.skipSpecialisationChoice = true;
        const createdItems = await actor.createEmbeddedDocuments('Item', [itemData], embedOptions);
        if (!createdItems || createdItems.length === 0) throw new Error('Failed to create item on actor');

        const createdItem = createdItems[0];
        notify.created('item', createdItem.name ?? 'unknown', { summary: `on ${actor.name} from compendium`, uuid: (createdItem as any).uuid });

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
      const result = await this.dataAccess.listCreaturesByCriteria(parsed);
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
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchJournalHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch journal action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 1 module_integration_v1 — module-probe umbrella dispatcher.
  // Intentionally skips validateFoundryState() — game.modules is available
  // before Foundry reaches full ready state (mirrors handleDiagnostic).
  // No enableDiagnosticTools gate — module-probe is a standalone read-only probe.
  private async handleModuleProbe(data: unknown): Promise<any> {
    try {
      return await dispatchModuleProbeHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-probe action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 1 module_integration_v1 — module-matt stub dispatcher.
  // requireModuleActive('monks-active-tiles') guard runs inside dispatchModuleMatt.
  // Returns MODULE_NOT_ACTIVE when the module is absent/inactive.
  private async handleModuleMatt(data: unknown): Promise<any> {
    try {
      return await dispatchModuleMattHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-matt action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 5 module_integration_v1 — module-tagger dispatcher.
  // requireModuleActive('tagger') guard runs inside dispatchModuleTagger.
  private async handleModuleTagger(data: unknown): Promise<any> {
    try {
      return await dispatchModuleTaggerHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-tagger action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 4 module_integration_v1 — module-levels dispatcher.
  // requireModuleActive('levels', ['wall-height']) guard runs inside dispatchModuleLevels.
  private async handleModuleLevels(data: unknown): Promise<any> {
    try {
      return await dispatchModuleLevelsHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-levels action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 5 module_integration_v1 — module-sequencer dispatcher.
  // requireModuleActive('sequencer') guard runs inside dispatchModuleSequencer.
  private async handleModuleSequencer(data: unknown): Promise<any> {
    try {
      return await dispatchModuleSequencerHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-sequencer action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 8 module_integration_v1 — module-autoanimations dispatcher.
  // requireModuleActive('autoanimations', ['sequencer','socketlib']) guard runs inside.
  private async handleModuleAutoAnimations(data: unknown): Promise<any> {
    try {
      return await dispatchModuleAutoAnimationsHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-autoanimations action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 6 module_integration_v1 — module-scene-atmosphere dispatcher.
  // Per-action guard via ACTION_MEMBER_MAP + requireModuleActive runs inside
  // dispatchModuleSceneAtmosphere. get-bundle-status is always unguarded.
  private async handleModuleSceneAtmosphere(data: unknown): Promise<any> {
    try {
      return await dispatchModuleSceneAtmosphereHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-scene-atmosphere action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 7 module_integration_v1 — module-access-control dispatcher (LocknKey + LockView).
  // Per-action guard via ACTION_MEMBER_MAP + requireModuleActive runs inside
  // dispatchModuleAccessControl. get-bundle-status is always unguarded; get-lock-state
  // routes to the LnK or LockView member by input shape.
  private async handleModuleAccessControl(data: unknown): Promise<any> {
    try {
      return await dispatchModuleAccessControlHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-access-control action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 9 module_integration_v1 — module-robak dispatcher.
  // requireModuleActive('wfrp4e-macros-and-more') guard runs inside dispatchModuleRobak.
  private async handleModuleRobak(data: unknown): Promise<any> {
    try {
      return await dispatchModuleRobakHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-robak action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 9 module_integration_v1 — module-tokenbar dispatcher.
  // requireModuleActive('monks-tokenbar') guard runs inside dispatchModuleTokenbar.
  private async handleModuleTokenbar(data: unknown): Promise<any> {
    try {
      return await dispatchModuleTokenbarHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-tokenbar action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 10 module_integration_v1 — module-armoury dispatcher.
  // requireModuleActive('forien-armoury') guard runs inside dispatchModuleArmoury.
  private async handleModuleArmoury(data: unknown): Promise<any> {
    try {
      return await dispatchModuleArmouryHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-armoury action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 11 module_integration_v1 — module-party-resources dispatcher.
  // requireModuleActive('fvtt-party-resources') guard runs inside dispatchModulePartyResources.
  private async handleModulePartyResources(data: unknown): Promise<any> {
    try {
      return await dispatchModulePartyResourcesHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-party-resources action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 11 module_integration_v1 — module-gmtoolkit dispatcher.
  // requireModuleActive('wfrp4e-gm-toolkit') guard runs inside dispatchModuleGmtoolkit.
  private async handleModuleGmtoolkit(data: unknown): Promise<any> {
    try {
      return await dispatchModuleGmtoolkitHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-gmtoolkit action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 12 module_integration_v1 — module-chat-commander dispatcher.
  // requireModuleActive('_chatcommands') guard runs inside dispatchModuleChatCommander.
  private async handleModuleChatCommander(data: unknown): Promise<any> {
    try {
      return await dispatchModuleChatCommanderHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-chat-commander action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 14 module_integration_v1 — thin-session dispatchers.
  // requireModuleActive(<id>) guards run inside each dispatcher.
  private async handleModuleTimekeeping(data: unknown): Promise<any> {
    try {
      return await dispatchModuleTimekeepingHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-timekeeping action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleModulePatrol(data: unknown): Promise<any> {
    try {
      return await dispatchModulePatrolHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-patrol action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleModuleGatherer(data: unknown): Promise<any> {
    try {
      return await dispatchModuleGathererHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-gatherer action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleModuleMastercrafted(data: unknown): Promise<any> {
    try {
      return await dispatchModuleMastercraftedHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-mastercrafted action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 3 module_integration_v1 — module-itempiles dispatcher.
  // requireModuleActive('item-piles') guard runs inside dispatchModuleItempiles.
  private async handleModuleItempiles(data: unknown): Promise<any> {
    try {
      return await dispatchModuleItempilesHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-itempiles action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 13A module_integration_v1 — module-css dispatcher.
  // requireModuleActive('custom-css') guard runs inside dispatchModuleCss.
  private async handleModuleCss(data: unknown): Promise<any> {
    try {
      return await dispatchModuleCssHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-css action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 15 module_integration_v1 — module-lighting dispatcher.
  // requireModuleActive('CommunityLighting') guard runs inside dispatchModuleLighting.
  private async handleModuleLighting(data: unknown): Promise<any> {
    try {
      return await dispatchModuleLightingHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch module-lighting action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 1 mcp_diagnostic_tool — Tier 1 read-only diagnostic dispatcher.
  // Tier 1 sub-actions (recent-errors / world-issues / support-snapshot) do
  // NOT call validateFoundryState() per plan Design Decisions row 10 —
  // game.issues, the runtime ring buffer, and SupportDetails are always
  // available, and the diagnostic surface is most valuable precisely when
  // Foundry state is half-broken. Dispatcher owns the dual gate
  // (validateGMAccess + enableDiagnosticTools setting).
  private async handleDiagnostic(data: unknown): Promise<any> {
    try {
      return await dispatchDiagnosticHandler(data, this.dataAccess);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch diagnostic action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchTokenHandler(data, this.dataAccess);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch token action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleLight(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchLightHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch light action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleNote(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchNoteHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch note action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleSound(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchSoundHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch sound action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handlePlaylist(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchPlaylistHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch playlist action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleMacro(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchMacroHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch macro action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleUser(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchUserHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch user action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleCompendium(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchCompendiumHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch compendium action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleCrossDocFk(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchCrossDocFkHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch cross-doc-fk action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleRegion(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchRegionHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch region action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleTile(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchTileHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch tile action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleDrawing(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchDrawingHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch drawing action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleCards(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchCardsHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch cards action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleDocumentIo(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchDocumentIoHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch document-io action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleTemplate(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchTemplateHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch template action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleDisease(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchDiseaseHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch disease action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleFolder(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchFolderHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch folder action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleSetting(data: unknown): Promise<any> {
    try {
      // fail-closed: setting reads succeed pre-ready (game.settings is available before Foundry hits 'ready'),
      // but treat as fully-init flow for predictability. Diagnostic intentionally skips this; setting does not, per canonical-pass review 2026-05-21.
      this.dataAccess.validateFoundryState();
      return await dispatchSettingHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch setting action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleChatMessage(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchChatMessageHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch chat-message action: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // BUG-009 (2026-05-16) — handleGetEnhancedCreatureIndex removed; no MCP-tool
  // consumer. dataAccess.getEnhancedCreatureIndex retained pending review.

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
    try {
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
        data: await this.dataAccess.createActor({
          actorData,
          ...(parsed.options && parsed.options.skipItems !== undefined
            ? { options: { skipItems: parsed.options.skipItems } }
            : {}),
        }),
      }));
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
      const parsed = ModifyItemQualitiesV2Input.parse(data ?? {});
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
          }
          if (!actor) {
            throw new Error(
              `Actor not found: ${parsed.destination?.type === 'actor'
                ? parsed.destination.actorId ?? parsed.destination.actorName
                : '(no identifier)'
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

        const normaliseEntry = (entry: any) => {
          const normalised: Record<string, unknown> = { name: String(entry.name).toLowerCase() };
          if (entry.value !== undefined) normalised.value = entry.value;
          return normalised;
        };
        const readEntries = (key: 'qualities' | 'flaws') => {
          const raw = item.system?.[key]?.value;
          return Array.isArray(raw) ? raw.map((entry: any) => ({ ...entry })) : [];
        };
        const mergeEntries = (
          current: any[],
          additions: any[],
          removals: string[]
        ) => {
          const removeSet = new Set(removals.map((name) => name.toLowerCase()));
          const addNames = new Set(additions.map((entry) => String(entry.name).toLowerCase()));
          const next = current.filter((entry) => {
            const name = String(entry?.name ?? '').toLowerCase();
            return !removeSet.has(name) && !addNames.has(name);
          });
          next.push(...additions.map(normaliseEntry));
          return next;
        };

        const nextQualities = mergeEntries(
          readEntries('qualities'),
          parsed.addQualities,
          parsed.removeQualities
        );
        const nextFlaws = mergeEntries(
          readEntries('flaws'),
          parsed.addFlaws,
          parsed.removeFlaws
        );

        const updateData: Record<string, unknown> = {
          'system.qualities.value': nextQualities,
          'system.flaws.value': nextFlaws,
        };

        await item.update(updateData);

        // BUG-288: re-fetch from parent collection so verify reads persisted
        // _source, not the stale in-memory reference (DP-16 post-write pattern).
        const persistedItem = item.parent
          ? (item.parent.items?.get(item.id) ?? item)
          : ((game.items as any)?.get(item.id) ?? item);
        const persistedQualityNames = new Set(
          ((persistedItem._source as any)?.system?.qualities?.value ?? []).map((entry: any) => String(entry?.name ?? '').toLowerCase())
        );
        const persistedFlawNames = new Set(
          ((persistedItem._source as any)?.system?.flaws?.value ?? []).map((entry: any) => String(entry?.name ?? '').toLowerCase())
        );
        for (const quality of parsed.addQualities) {
          if (!persistedQualityNames.has(String(quality.name).toLowerCase())) {
            throw new Error(`MODIFY_ITEM_QUALITIES_NOT_PERSISTED: missing added quality "${quality.name}"`);
          }
        }
        for (const quality of parsed.removeQualities) {
          if (persistedQualityNames.has(quality.toLowerCase())) {
            throw new Error(`MODIFY_ITEM_QUALITIES_NOT_PERSISTED: quality "${quality}" was not removed`);
          }
        }
        for (const flaw of parsed.addFlaws) {
          if (!persistedFlawNames.has(String(flaw.name).toLowerCase())) {
            throw new Error(`MODIFY_ITEM_QUALITIES_NOT_PERSISTED: missing added flaw "${flaw.name}"`);
          }
        }
        for (const flaw of parsed.removeFlaws) {
          if (persistedFlawNames.has(flaw.toLowerCase())) {
            throw new Error(`MODIFY_ITEM_QUALITIES_NOT_PERSISTED: flaw "${flaw}" was not removed`);
          }
        }

        notify.updated('item', item.name, {
          summary: `qualities modified on ${ownerLabel}`,
          uuid: (item as any).uuid,
        });
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
      return { success: true, data: await this.dataAccess.getCombat(parsed) };
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
      return { success: true, data: await this.dataAccess.listCombatants(parsed) };
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
        data: await this.dataAccess.advanceCombat(parsed),
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
        data: await this.dataAccess.addCombatants(parsed),
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
        data: await this.dataAccess.removeCombatants(parsed),
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
        data: await this.dataAccess.endCombat(parsed),
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
        data: await this.dataAccess.applyDamage(parsed),
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
        data: await this.dataAccess.applyCondition(parsed),
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
        data: await this.dataAccess.removeCondition(parsed),
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
      return { success: true, data: await this.dataAccess.listConditions(parsed) };
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
      return { success: true, data: await this.dataAccess.listActiveEffects(parsed) };
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
      this.dataAccess.validateFoundryState();
      const parsed = AddActiveEffectInput.strict().parse(data ?? {});
      return await wrappedWrite('addActiveEffect', async () => ({
        success: true,
        data: await this.dataAccess.addActiveEffect(parsed),
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
      this.dataAccess.validateFoundryState();
      const parsed = UpdateActiveEffectInput.strict().parse(data ?? {});
      if (!parsed.effectId && !parsed.effectName) {
        throw new Error('updateActiveEffect requires one of effectId or effectName');
      }
      return await wrappedWrite('updateActiveEffect', async () => ({
        success: true,
        data: await this.dataAccess.updateActiveEffect(parsed),
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
      this.dataAccess.validateFoundryState();
      const parsed = DeleteActiveEffectInput.strict().parse(data ?? {});
      if (!parsed.effectId && !parsed.effectName) {
        throw new Error('deleteActiveEffect requires one of effectId or effectName');
      }
      return await wrappedWrite('deleteActiveEffect', async () => ({
        success: true,
        data: await this.dataAccess.deleteActiveEffect(parsed),
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
        data: await this.dataAccess.getActiveEffectByName(parsed),
      };
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to get active effect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchItemDirectoryHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch item-directory action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 2 mcp_coverage_expansion — dice-roll tool (roll/validate/simulate).
  async handleDiceRoll(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchDiceRollHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch dice-roll action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 10 mcp_coverage_expansion — keybinding tool (list/get/set/reset-action/reset-all/find-conflicts).
  async handleKeybinding(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchKeybindingHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch keybinding action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 1 mcp_coverage_expansion — actor-config umbrella (4 actions).
  async handleActorConfig(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchActorConfigHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch actor-config action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Phase 3 mcp_coverage_expansion — combatant umbrella (7 per-combatant actions).
  async handleCombatant(data: unknown): Promise<any> {
    try {
      this.dataAccess.validateFoundryState();
      return await dispatchCombatantHandler(data);
    } catch (error) {
      rethrowAsInvalidInput(error);
      throw new Error(`Failed to dispatch combatant action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
