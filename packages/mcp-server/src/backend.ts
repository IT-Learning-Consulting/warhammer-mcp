import * as fs from 'fs';

import * as os from 'os';

import * as path from 'path';

import * as net from 'net';


import { config } from './config.js';

import { Logger } from './logger.js';

import { FoundryClient } from './foundry-client.js';

import { scrubError } from './utils/scrub-error.js';
import { ToolRegistry } from './tool-registry.js';

import { CharacterTools } from './tools/character.js';
import { ManageCharacterTool } from './tools/manage-character.js';

import { ManageInventoryTool } from './tools/manage-inventory.js';

import { CompendiumTools } from './tools/compendium.js';

// Phase 4 mcp_crud_expansion — single `scene` umbrella tool (11 actions)
// replaces SceneTools (5 legacy tools) + AddActorsToSceneTool + DeleteTokenTool.
// get-world-info extracted to a sibling `world` tool.
import { SceneTool } from './tools/scene.js';
import { WorldTool } from './tools/world.js';

import { ActorCreationTools } from './tools/actor-creation.js';

import { DiceRollTools } from './tools/dice-roll.js';

import { KeybindingTools } from './tools/keybinding.js';

import { OwnershipTool } from './tools/ownership.js';

import { RollTableTool } from './tools/rolltable.js';

import { ManageCombatTools } from './tools/manage-combat.js';

import { ApplyDamageTool } from './tools/apply-damage.js';

import { ManageConditionsTools } from './tools/manage-conditions.js';

import { ListActiveEffectsTool } from './tools/list-active-effects.js';

import { UpdateActorTool } from './tools/update-actor.js';
import { UpdateItemTool } from './tools/update-item.js';
import { AddItemFromCompendiumTool } from './tools/add-item-from-compendium.js';
import { DeleteItemTool } from './tools/delete-item.js';
import { DuplicateActorTool } from './tools/duplicate-actor.js';
import { ListActorItemsTool } from './tools/list-actor-items.js';
import { ApplyNpcCareerAdvanceTool } from './tools/apply-npc-career-advance.js';
import { ApplyTemplateTool } from './tools/apply-template.js';
import { ApplyTemplateToTokenTool } from './tools/apply-template-to-token.js';
import { GetWfrpConfigTool } from './tools/get-wfrp-config.js';
import { JournalTool } from './tools/journal.js';
import { WorldDeleteTools } from './tools/world-delete.js';
// Phase 4 mcp_crud_expansion — AddActorsToSceneTool + DeleteTokenTool folded
// into the scene umbrella (actions: 'add-tokens' / 'delete-token').
import { CreateCustomItemTool } from './tools/create-custom-item.js';
import { TradeItemTool } from './tools/trade-item.js';
import { ModifyItemQualitiesTool } from './tools/modify-item-qualities.js';
import { AddActiveEffectTool } from './tools/add-active-effect.js';
import { UpdateActiveEffectTool } from './tools/update-active-effect.js';
import { DeleteActiveEffectTool } from './tools/delete-active-effect.js';
// TOOL-IDEA-003 (2026-05-14): read-only AE-by-name resolver.
import { GetActiveEffectByNameTool } from './tools/get-active-effect-by-name.js';
// Phase 1 mcp_diagnostic_tool — read-only diagnostic umbrella (3 actions in v1).
import { DiagnosticTool } from './tools/diagnostic.js';
// Phase 5 mcp_crud_expansion — 7 per-doc-type embedded-CRUD umbrellas.
import { TokenTool } from './tools/token.js';
import { LightTool } from './tools/light.js';
import { NoteTool } from './tools/note.js';
import { SoundTool } from './tools/sound.js';
// Phase 7 mcp_crud_expansion — Playlist + PlaylistSound umbrella (10 actions).
import { PlaylistTool } from './tools/playlist.js';
import { MacroTool } from './tools/macro.js';
import { UserTool } from './tools/user.js';
// Phase 9 mcp_crud_expansion — Compendium umbrella (10 actions: 6 pack/doc CRU + 4 in-pack folder; NO pack/document DELETE per HC3).
// Coexists with the existing flat read-only CompendiumTools (D10 — back-compat).
import { CompendiumUmbrellaTools } from './tools/compendium-umbrella.js';
// Phase 10 mcp_crud_expansion — Cross-doc FK audit + repair umbrella (3 actions; closes PRD).
import { CrossDocFkTool } from './tools/cross-doc-fk.js';
import { RegionTool } from './tools/region.js';
import { TileTool } from './tools/tile.js';
import { TemplateTool } from './tools/template.js';
// Phase 5 mcp_coverage_expansion — drawing umbrella (CRUD + list + duplicate).
import { DrawingTool } from './tools/drawing.js';
// Phase 7 mcp_coverage_expansion — cards umbrella (stack + embedded-card CRUD + gameplay verbs).
import { CardsTool } from './tools/cards.js';
// Phase 8 mcp_coverage_expansion — document-io umbrella (export/import-as-new/preview over 8 world doc types).
import { DocumentIoTool } from './tools/document-io.js';
// Phase 6.1 mcp_crud_expansion — FilePicker umbrella tool with Node-side auto-conversion.
import { FilePickerTool } from './tools/filepicker.js';
import { NotifyTool } from './tools/notify.js';
// Phase wfrp-disease — Disease umbrella tool (8 actions).
import { DiseaseTool } from './tools/disease.js';
// Phase 4 mcp_completion_v1 — Folder umbrella (6 actions; delete confirm + deleteContents cascade).
import { FolderTool } from './tools/folder.js';
// Phase 4 mcp_completion_v1 — Setting umbrella (4 actions; force gate + blocklist + onChange-advisory).
import { SettingTool } from './tools/setting.js';
// Phase 5 mcp_completion_v1 — ChatMessage umbrella (5 actions; delete confirm; rollMode resolution; rolls-immutability).
import { ChatMessageTool } from './tools/chat-message.js';
// Phase 1 mcp_coverage_expansion — item-directory umbrella (5 actions: list/get/search/duplicate/import-from-compendium).
import { ItemDirectoryTool } from './tools/item-directory.js';
// Phase 1 mcp_coverage_expansion — actor-config umbrella (4 actions: get/update-prototype-token + get/set-art).
import { ActorConfigTool } from './tools/actor-config.js';
// Phase 3 mcp_coverage_expansion — combatant umbrella (7 per-combatant actions).
import { CombatantTool } from './tools/combatant.js';
// Phase 1 module_integration_v1 — always-registered module-probe + conditional module-matt stub.
import { ModuleProbeTool } from './tools/modules/probe/probe.js';
import { ModuleMattTool } from './tools/modules/monks-active-tiles/matt.js';
// Phase 5 module_integration_v1 — conditional module-tagger + module-sequencer umbrellas.
import { ModuleTaggerTool } from './tools/modules/tagger/tagger.js';
import { ModuleSequencerTool } from './tools/modules/sequencer/sequencer.js';
// Phase 4 module_integration_v1 — conditional module-levels umbrella.
import { ModuleLevelsTool } from './tools/modules/levels/levels.js';
// Phase 8 module_integration_v1 — conditional module-autoanimations umbrella.
import { ModuleAutoAnimationsTool } from './tools/modules/autoanimations/autoanimations.js';
// Phase 9 module_integration_v1 — WFRP mechanic delegates: module-robak + module-tokenbar (conditional).
import { ModuleRobakTool } from './tools/modules/robak/robak.js';
import { ModuleTokenbarTool } from './tools/modules/tokenbar/tokenbar.js';
// Phase 10 module_integration_v1 — module-armoury (Forien's Armoury, conditional).
import { ModuleArmouryTool } from './tools/modules/forien-armoury/armoury.js';
// Phase 11 module_integration_v1 — module-party-resources + module-gmtoolkit (conditional).
import { ModulePartyResourcesTool } from './tools/modules/fvtt-party-resources/party-resources.js';
import { ModuleGmtoolkitTool } from './tools/modules/wfrp4e-gm-toolkit/gmtoolkit.js';
// Phase 12 module_integration_v1 — module-chat-commander (_chatcommands conditional).
import { ModuleChatCommanderTool } from './tools/modules/_chatcommands/chat-commander.js';
// Phase 14 module_integration_v1 — thin-session modules (conditional).
import { ModuleTimekeepingTool } from './tools/modules/simple-timekeeping/timekeeping.js';
import { ModulePatrolTool } from './tools/modules/patrol/patrol.js';
import { ModuleGathererTool } from './tools/modules/gatherer/gatherer.js';
import { ModuleMastercraftedTool } from './tools/modules/mastercrafted/mastercrafted.js';
// Phase 6 module_integration_v1 — conditional module-scene-atmosphere bundle umbrella.
import { ModuleSceneAtmosphereTool } from './tools/modules/scene-atmosphere/scene-atmosphere.js';
// Phase 7 module_integration_v1 — conditional module-access-control bundle umbrella (LocknKey + LockView).
import { ModuleAccessControlTool } from './tools/modules/access-control/access-control.js';
// Phase 13A module_integration_v1 — conditional module-css umbrella.
import { ModuleCssTool } from './tools/modules/custom-css/css.js';
// Phase 15 module_integration_v1 — conditional module-lighting umbrella (CommunityLighting).
import { ModuleLightingTool } from './tools/modules/community-lighting/lighting.js';
// Phase 3 module_integration_v1 — conditional module-itempiles umbrella (Item Piles economy surface).
import { ModuleItempilesTool } from './tools/modules/item-piles/item-piles.js';
// BUG-107: extracted to side-effect-free module so test imports don't boot backend.
import { coerceArgsBySchema } from './coerce-args.js';

const CONTROL_HOST = '127.0.0.1';

const CONTROL_PORT = 31414;

const LOCK_FILE = path.join(os.tmpdir(), 'foundry-mcp-backend.lock');

let lockFd: number | null = null;

function acquireLock(): boolean {

  try {

    try {

      lockFd = fs.openSync(LOCK_FILE, 'wx');

    } catch (err: any) {

      if (err && err.code === 'EEXIST') {

        try {

          const lockData = fs.readFileSync(LOCK_FILE, 'utf8');

          const lockPid = parseInt(lockData.trim(), 10);

          try {

            process.kill(lockPid, 0);

            console.error(`Backend already running with PID ${lockPid}`);

            return false;

          } catch {

            console.error(`Removing stale backend lock for PID ${lockPid}`);

            try { fs.unlinkSync(LOCK_FILE); } catch { }

            lockFd = fs.openSync(LOCK_FILE, 'wx');

          }

        } catch (readErr) {

          console.error('Corrupt backend lock file, removing:', readErr);

          try { fs.unlinkSync(LOCK_FILE); } catch { }

          lockFd = fs.openSync(LOCK_FILE, 'wx');

        }

      } else {

        console.error('Failed to open backend lock file:', err);

        return false;

      }

    }

    if (lockFd === null) return false;

    fs.writeFileSync(lockFd, String(process.pid));

    try { fs.fsyncSync(lockFd); } catch { }

    console.error(`Acquired backend lock with PID ${process.pid}`);

    return true;

  } catch (error) {

    console.error('Failed to acquire backend lock:', error);

    return false;

  }

}

function releaseLock(): void {

  try {

    if (lockFd !== null) { try { fs.closeSync(lockFd); } catch { } lockFd = null; }

    if (fs.existsSync(LOCK_FILE)) { try { fs.unlinkSync(LOCK_FILE); } catch { } }

  } catch (error) {

    console.error('Failed to release backend lock:', error);

  }

}

async function startBackend(): Promise<void> {

  // Logger: file output allowed; avoid stdout noise

  const logger = new Logger({

    level: config.logLevel,

    format: config.logFormat,

    enableConsole: false,

    enableFile: true,

    filePath: path.join(os.tmpdir(), 'foundry-mcp-server', 'mcp-server.log'),

  });

  logger.info('Starting Foundry MCP Backend', {

    version: config.server.version,

    foundryHost: config.foundry.host,

    foundryPort: config.foundry.port,

  });

  // Initialize Foundry client and tools

  const foundryClient = new FoundryClient(config.foundry, logger);

  const characterTools = new CharacterTools({ foundryClient, logger });
  const manageCharacterTool = new ManageCharacterTool({ foundryClient, logger });

  const manageInventoryTool = new ManageInventoryTool({ foundryClient, logger });

  const compendiumTools = new CompendiumTools({ foundryClient, logger });

  const sceneTool = new SceneTool({ foundryClient, logger });
  const worldTool = new WorldTool({ foundryClient, logger });

  const actorCreationTools = new ActorCreationTools({ foundryClient, logger });

  const diceRollTools = new DiceRollTools({ foundryClient, logger });

  const keybindingTools = new KeybindingTools({ foundryClient, logger });

  const ownershipTool = new OwnershipTool({ foundryClient, logger });

  const rollTableTool = new RollTableTool({ foundryClient, logger });

  const manageCombatTools = new ManageCombatTools({ foundryClient, logger });

  const applyDamageTool = new ApplyDamageTool({ foundryClient, logger });

  const manageConditionsTools = new ManageConditionsTools({ foundryClient, logger });

  const listActiveEffectsTool = new ListActiveEffectsTool({ foundryClient, logger });

  const updateActorTool = new UpdateActorTool({ foundryClient, logger });
  const updateItemTool = new UpdateItemTool({ foundryClient, logger });
  const addItemFromCompendiumTool = new AddItemFromCompendiumTool({ foundryClient, logger });
  const deleteItemTool = new DeleteItemTool({ foundryClient, logger });
  const getWfrpConfigTool = new GetWfrpConfigTool({ foundryClient, logger });
  const journalTool = new JournalTool({ foundryClient, logger });
  const worldDeleteTools = new WorldDeleteTools({ foundryClient, logger });
  // Phase 4 mcp_crud_expansion — addActorsToSceneTool + deleteTokenTool folded into sceneTool.
  const duplicateActorTool = new DuplicateActorTool({ foundryClient, logger });
  const listActorItemsTool = new ListActorItemsTool({ foundryClient, logger });
  const applyNpcCareerAdvanceTool = new ApplyNpcCareerAdvanceTool({ foundryClient, logger });
  const applyTemplateTool = new ApplyTemplateTool({ foundryClient, logger });
  const applyTemplateToTokenTool = new ApplyTemplateToTokenTool({ foundryClient, logger });
  const createCustomItemTool = new CreateCustomItemTool({ foundryClient, logger });
  const tradeItemTool = new TradeItemTool({ foundryClient, logger });
  const modifyItemQualitiesTool = new ModifyItemQualitiesTool({ foundryClient, logger });
  const addActiveEffectTool = new AddActiveEffectTool({ foundryClient, logger });
  const updateActiveEffectTool = new UpdateActiveEffectTool({ foundryClient, logger });
  const deleteActiveEffectTool = new DeleteActiveEffectTool({ foundryClient, logger });
  // TOOL-IDEA-003 (2026-05-14).
  const getActiveEffectByNameTool = new GetActiveEffectByNameTool({ foundryClient, logger });
  // Phase 5 mcp_crud_expansion — 7 per-doc-type embedded-CRUD umbrellas.
  const tokenTool = new TokenTool({ foundryClient, logger });
  const lightTool = new LightTool({ foundryClient, logger });
  const noteTool = new NoteTool({ foundryClient, logger });
  const soundTool = new SoundTool({ foundryClient, logger });
  // Phase 7 mcp_crud_expansion — first world-level CRUD umbrella (Playlist + PlaylistSound).
  const playlistTool = new PlaylistTool({ foundryClient, logger });
  // Phase 8 mcp_crud_expansion — Macro CRUD + execute with confirmedExecution gate.
  const macroTool = new MacroTool({ foundryClient, logger });
  // Phase 11 mcp_crud_expansion — User umbrella (9 actions: document, hotbar, role, flags).
  const userTool = new UserTool({ foundryClient, logger });
  // Phase 9 mcp_crud_expansion — Compendium pack + document CRU (no delete per HC3).
  const compendiumUmbrellaTools = new CompendiumUmbrellaTools({ foundryClient, logger });
  // Phase 10 mcp_crud_expansion — Cross-doc FK audit + repair (3 actions; closes PRD).
  const crossDocFkTool = new CrossDocFkTool({ foundryClient, logger });
  const regionTool = new RegionTool({ foundryClient, logger });
  const tileTool = new TileTool({ foundryClient, logger });
  const templateTool = new TemplateTool({ foundryClient, logger });
  const drawingTool = new DrawingTool({ foundryClient, logger });
  const cardsTool = new CardsTool({ foundryClient, logger });
  // Phase 8 mcp_coverage_expansion — document-io umbrella (export/import-as-new/preview).
  const documentIoTool = new DocumentIoTool({ foundryClient, logger });
  // Phase 6.1 mcp_crud_expansion — FilePicker tool with Node-side auto-conversion.
  const filePickerTool = new FilePickerTool({ foundryClient, logger });
  // Phase 1 mcp_diagnostic_tool — read-only diagnostic umbrella (Tier 1).
  const diagnosticTool = new DiagnosticTool({ foundryClient, logger });
  // Phase 4 mcp_notify_coverage — notify umbrella (skill bookends + ad-hoc GM events).
  const notifyTool = new NotifyTool({ foundryClient, logger });
  // Phase wfrp-disease — Disease umbrella.
  const diseaseTool = new DiseaseTool({ foundryClient, logger });
  // Phase 4 mcp_completion_v1 — Folder + Setting umbrellas.
  const folderTool = new FolderTool({ foundryClient, logger });
  const settingTool = new SettingTool({ foundryClient, logger });
  // Phase 5 mcp_completion_v1 — ChatMessage umbrella.
  const chatMessageTool = new ChatMessageTool({ foundryClient, logger });
  // Phase 1 mcp_coverage_expansion — item-directory + actor-config umbrellas.
  const itemDirectoryTool = new ItemDirectoryTool({ foundryClient, logger });
  const actorConfigTool = new ActorConfigTool({ foundryClient, logger });
  // Phase 3 mcp_coverage_expansion — combatant umbrella (7 per-combatant actions).
  const combatantTool = new CombatantTool({ foundryClient, logger });
  // Phase 1 module_integration_v1 — module-probe (always-on) + module-matt (conditional stub).
  const moduleProbeTool = new ModuleProbeTool({ foundryClient, logger });
  const moduleMattTool = new ModuleMattTool({ foundryClient, logger });
  // Phase 5 module_integration_v1 — module-tagger + module-sequencer (conditional).
  const moduleTaggerTool = new ModuleTaggerTool({ foundryClient, logger });
  const moduleSequencerTool = new ModuleSequencerTool({ foundryClient, logger });
  // Phase 4 module_integration_v1 — module-levels (conditional).
  const moduleLevelsTool = new ModuleLevelsTool({ foundryClient, logger });
  // Phase 8 module_integration_v1 — module-autoanimations (conditional).
  const moduleAutoAnimationsTool = new ModuleAutoAnimationsTool({ foundryClient, logger });
  // Phase 9 module_integration_v1 — WFRP mechanic delegates: module-robak + module-tokenbar (conditional).
  const moduleRobakTool = new ModuleRobakTool({ foundryClient, logger });
  const moduleTokenbarTool = new ModuleTokenbarTool({ foundryClient, logger });
  // Phase 10 module_integration_v1 — module-armoury (forien-armoury conditional).
  const moduleArmouryTool = new ModuleArmouryTool({ foundryClient, logger });
  // Phase 11 module_integration_v1 — module-party-resources + module-gmtoolkit (conditional).
  const modulePartyResourcesTool = new ModulePartyResourcesTool({ foundryClient, logger });
  const moduleGmtoolkitTool = new ModuleGmtoolkitTool({ foundryClient, logger });
  // Phase 12 module_integration_v1 — module-chat-commander (_chatcommands conditional).
  const moduleChatCommanderTool = new ModuleChatCommanderTool({ foundryClient, logger });
  // Phase 14 module_integration_v1 — thin-session modules (conditional).
  const moduleTimekeepingTool = new ModuleTimekeepingTool({ foundryClient, logger });
  const modulePatrolTool = new ModulePatrolTool({ foundryClient, logger });
  const moduleGathererTool = new ModuleGathererTool({ foundryClient, logger });
  const moduleMastercraftedTool = new ModuleMastercraftedTool({ foundryClient, logger });
  // Phase 6 module_integration_v1 — module-scene-atmosphere bundle (conditional, per-member guard).
  const moduleSceneAtmosphereTool = new ModuleSceneAtmosphereTool({ foundryClient, logger });
  // Phase 7 module_integration_v1 — module-access-control bundle (conditional, per-member guard).
  const moduleAccessControlTool = new ModuleAccessControlTool({ foundryClient, logger });
  // Phase 13A module_integration_v1 — module-css (conditional).
  const moduleCssTool = new ModuleCssTool({ foundryClient, logger });
  // Phase 15 module_integration_v1 — module-lighting (conditional).
  const moduleLightingTool = new ModuleLightingTool({ foundryClient, logger });
  // Phase 3 module_integration_v1 — module-itempiles (conditional).
  const moduleItempilesTool = new ModuleItempilesTool({ foundryClient, logger });

  const registry = new ToolRegistry();
  registry.register('get-character', (args) => characterTools.handleGetCharacter(args));
  registry.register('list-characters', (args) => characterTools.handleListCharacters(args));
  registry.register('manage-character', (args) => manageCharacterTool.handle(args));
  registry.register('manage-inventory', (args) => manageInventoryTool.handle(args));
  registry.register('create-custom-item', (args) => createCustomItemTool.handle(args));
  registry.register('trade-item', (args) => tradeItemTool.handle(args));
  registry.register('modify-item-qualities', (args) => modifyItemQualitiesTool.handle(args));
  registry.register('add-active-effect', (args) => addActiveEffectTool.handle(args));
  registry.register('update-active-effect', (args) => updateActiveEffectTool.handle(args));
  registry.register('delete-active-effect', (args) => deleteActiveEffectTool.handle(args));
  // TOOL-IDEA-003 (2026-05-14).
  registry.register('get-active-effect-by-name', (args) => getActiveEffectByNameTool.handle(args));
  registry.register('search-compendium', (args) => compendiumTools.handleSearchCompendium(args));
  registry.register('get-compendium-item', (args) => compendiumTools.handleGetCompendiumItem(args));
  registry.register('list-creatures-by-criteria', (args) => compendiumTools.handleListCreaturesByCriteria(args));
  registry.register('list-compendium-packs', (args) => compendiumTools.handleListCompendiumPacks(args));
  // Phase 4 mcp_crud_expansion — single `scene` umbrella replaces 5 legacy tool keys
  // (get-current-scene, list-scenes, switch-scene, add-actors-to-scene, delete-token).
  // 11 actions dispatched server-side. get-world-info extracted to `world` tool.
  registry.register('scene', (args) => sceneTool.execute(args));
  registry.register('get-world-info', (args) => worldTool.handleGetWorldInfo(args));
  registry.register('create-actor', (args) => actorCreationTools.handleCreateActor(args));
  registry.register('create-actor-from-compendium', (args) => actorCreationTools.handleCreateActorFromCompendium(args));
  registry.register('get-compendium-entry-full', (args) => actorCreationTools.handleGetCompendiumEntryFull(args));
  registry.register('request-player-rolls', (args) => diceRollTools.handleRequestPlayerRolls(args));
  // Phase 2 mcp_coverage_expansion — dice-roll (immediate roll/validate/simulate); reuses DiceRollTools.
  registry.register('dice-roll', (args) => diceRollTools.handleDiceRoll(args));
  // Phase 10 mcp_coverage_expansion — keybinding (GM-client list/get/set/reset/find-conflicts).
  registry.register('keybinding', (args) => keybindingTools.handleKeybinding(args));
  registry.register('ownership', (args) => ownershipTool.execute(args));
  // Phase 4 mcp_crud_expansion — list-scenes + switch-scene folded into scene umbrella.
  registry.register('rolltable', (args) => rollTableTool.execute(args));
  registry.register('get-combat', (args) => manageCombatTools.handleGetCombat(args));
  registry.register('list-combatants', (args) => manageCombatTools.handleListCombatants(args));
  registry.register('advance-combat', (args) => manageCombatTools.handleAdvanceCombat(args));
  registry.register('add-combatants', (args) => manageCombatTools.handleAddCombatants(args));
  registry.register('remove-combatants', (args) => manageCombatTools.handleRemoveCombatants(args));
  registry.register('end-combat', (args) => manageCombatTools.handleEndCombat(args));
  registry.register('apply-damage', (args) => applyDamageTool.handle(args));
  registry.register('apply-condition', (args) => manageConditionsTools.handleApplyCondition(args));
  registry.register('remove-condition', (args) => manageConditionsTools.handleRemoveCondition(args));
  registry.register('list-conditions', (args) => manageConditionsTools.handleListConditions(args));
  registry.register('list-active-effects', (args) => listActiveEffectsTool.handle(args));
  registry.register('update-actor', (args) => updateActorTool.handle(args));
  registry.register('update-item', (args) => updateItemTool.handle(args));
  registry.register('duplicate-actor', (args) => duplicateActorTool.handle(args));
  registry.register('list-actor-items', (args) => listActorItemsTool.handle(args));
  registry.register('apply-npc-career-advance', (args) => applyNpcCareerAdvanceTool.handle(args));
  registry.register('apply-template', (args) => applyTemplateTool.handle(args));
  registry.register('apply-template-to-token', (args) => applyTemplateToTokenTool.handle(args));
  registry.register('add-item-from-compendium', (args) => addItemFromCompendiumTool.handle(args));
  registry.register('delete-item', (args) => deleteItemTool.handle(args));
  registry.register('get-wfrp-config', (args) => getWfrpConfigTool.handle(args));
  // Phase 3 mcp_crud_expansion — single `journal` umbrella replaces 5 legacy tool keys
  // (list-journals / get-journal-content / create-journal-entry / update-journal-content /
  // delete-journal-entry). 13 actions dispatched server-side.
  registry.register('journal', (args) => journalTool.execute(args));
  // Phase 5 mcp_crud_expansion — 7 per-doc-type embedded-CRUD umbrellas.
  registry.register('token', (args) => tokenTool.execute(args));
  registry.register('light', (args) => lightTool.execute(args));
  registry.register('note', (args) => noteTool.execute(args));
  registry.register('sound', (args) => soundTool.execute(args));
  // Phase 7 mcp_crud_expansion — Playlist + PlaylistSound umbrella (10 actions).
  registry.register('playlist', (args) => playlistTool.execute(args));
  registry.register('macro', (args) => macroTool.execute(args));
  registry.register('user', (args) => userTool.execute(args));
  // Phase 9 mcp_crud_expansion — Compendium umbrella (10 actions: 6 pack/doc CRU + 4 in-pack folder; NO pack/document DELETE per HC3).
  registry.register('compendium', (args) => compendiumUmbrellaTools.execute(args));
  // Phase 10 mcp_crud_expansion — Cross-doc FK umbrella (3 actions; closes PRD).
  registry.register('cross-doc-fk', (args) => crossDocFkTool.execute(args));
  registry.register('region', (args) => regionTool.execute(args));
  registry.register('tile', (args) => tileTool.execute(args));
  registry.register('template', (args) => templateTool.execute(args));
  registry.register('drawing', (args) => drawingTool.execute(args));
  registry.register('cards', (args) => cardsTool.execute(args));
  // Phase 8 mcp_coverage_expansion — document-io umbrella (export/import-as-new/preview).
  registry.register('document-io', (args) => documentIoTool.execute(args));
  // Phase 6.1 mcp_crud_expansion — FilePicker umbrella (upload / list / convert).
  registry.register('filepicker', (args) => filePickerTool.execute(args));
  // Phase 1 mcp_diagnostic_tool — read-only diagnostic umbrella. Foundry-side
  // dispatcher gates on validateGMAccess + enableDiagnosticTools setting.
  registry.register('diagnostic', (args) => diagnosticTool.execute(args));
  // Phase 4 mcp_notify_coverage — single `notify` umbrella for skill bookends + GM-visible events.
  registry.register('notify', (args) => notifyTool.execute(args));
  // Phase wfrp-disease — Disease umbrella (8 actions).
  registry.register('disease', (args) => diseaseTool.execute(args));
  // Phase 4 mcp_completion_v1 — Folder umbrella (6 actions).
  registry.register('folder', (args) => folderTool.execute(args));
  // Phase 4 mcp_completion_v1 — Setting umbrella (4 actions).
  registry.register('setting', (args) => settingTool.execute(args));
  // Phase 5 mcp_completion_v1 — ChatMessage umbrella (5 actions).
  registry.register('chat-message', (args) => chatMessageTool.execute(args));
  // Phase 1 mcp_coverage_expansion — item-directory + actor-config umbrellas.
  registry.register('item-directory', (args) => itemDirectoryTool.execute(args));
  registry.register('actor-config', (args) => actorConfigTool.execute(args));
  // Phase 3 mcp_coverage_expansion — combatant umbrella (7 per-combatant actions).
  registry.register('combatant', (args) => combatantTool.execute(args));
  // Phase 1 module_integration_v1 — module-probe (always-on) + module-matt (conditional stub).
  registry.register('module-probe', (args) => moduleProbeTool.execute(args as any));
  registry.register('module-matt', (args) => moduleMattTool.execute(args as any));
  // Phase 5 module_integration_v1 — module-tagger + module-sequencer (conditional).
  registry.register('module-tagger', (args) => moduleTaggerTool.execute(args as any));
  registry.register('module-sequencer', (args) => moduleSequencerTool.execute(args as any));
  // Phase 4 module_integration_v1 — module-levels (conditional).
  registry.register('module-levels', (args) => moduleLevelsTool.execute(args as any));
  // Phase 8 module_integration_v1 — module-autoanimations (conditional).
  registry.register('module-autoanimations', (args) => moduleAutoAnimationsTool.execute(args as any));
  // Phase 9 module_integration_v1 — WFRP mechanic delegates: module-robak + module-tokenbar (conditional).
  registry.register('module-robak', (args) => moduleRobakTool.execute(args as any));
  registry.register('module-tokenbar', (args) => moduleTokenbarTool.execute(args as any));
  // Phase 10 module_integration_v1 — module-armoury (forien-armoury conditional).
  registry.register('module-armoury', (args) => moduleArmouryTool.execute(args as any));
  // Phase 11 module_integration_v1 — module-party-resources + module-gmtoolkit (conditional).
  registry.register('module-party-resources', (args) => modulePartyResourcesTool.execute(args as any));
  registry.register('module-gmtoolkit', (args) => moduleGmtoolkitTool.execute(args as any));
  // Phase 12 module_integration_v1 — module-chat-commander (_chatcommands conditional).
  registry.register('module-chat-commander', (args) => moduleChatCommanderTool.execute(args as any));
  // Phase 14 module_integration_v1 — thin-session modules (conditional).
  registry.register('module-timekeeping', (args) => moduleTimekeepingTool.execute(args as any));
  registry.register('module-patrol', (args) => modulePatrolTool.execute(args as any));
  registry.register('module-gatherer', (args) => moduleGathererTool.execute(args as any));
  registry.register('module-mastercrafted', (args) => moduleMastercraftedTool.execute(args as any));
  // Phase 6 module_integration_v1 — module-scene-atmosphere bundle (conditional, per-member guard).
  registry.register('module-scene-atmosphere', (args) => moduleSceneAtmosphereTool.execute(args as any));
  // Phase 7 module_integration_v1 — module-access-control bundle (conditional, per-member guard).
  registry.register('module-access-control', (args) => moduleAccessControlTool.execute(args as any));
  // Phase 13A module_integration_v1 — module-css (conditional).
  registry.register('module-css', (args) => moduleCssTool.execute(args as any));
  // Phase 15 module_integration_v1 — module-lighting (conditional).
  registry.register('module-lighting', (args) => moduleLightingTool.execute(args as any));
  // Phase 3 module_integration_v1 — module-itempiles (conditional).
  registry.register('module-itempiles', (args) => moduleItempilesTool.execute(args as any));
  // Phase 4 mcp_crud_expansion — add-actors-to-scene + delete-token folded into scene umbrella.
  registry.register('delete-actor', (args) => worldDeleteTools.handleDeleteActor(args));

  const allTools = [

    ...characterTools.getToolDefinitions(),
    ...manageCharacterTool.getToolDefinitions(),

    ...manageInventoryTool.getToolDefinitions(),

    ...compendiumTools.getToolDefinitions(),

    ...sceneTool.getToolDefinitions(),

    ...worldTool.getToolDefinitions(),

    ...actorCreationTools.getToolDefinitions(),

    ...diceRollTools.getToolDefinitions(),

    ...keybindingTools.getToolDefinitions(),

    ...ownershipTool.getToolDefinitions(),

    ...rollTableTool.getToolDefinitions(),

    ...manageCombatTools.getToolDefinitions(),

    ...applyDamageTool.getToolDefinitions(),

    ...manageConditionsTools.getToolDefinitions(),

    ...listActiveEffectsTool.getToolDefinitions(),

    ...updateActorTool.getToolDefinitions(),

    ...updateItemTool.getToolDefinitions(),

    ...addItemFromCompendiumTool.getToolDefinitions(),

    ...deleteItemTool.getToolDefinitions(),

    ...getWfrpConfigTool.getToolDefinitions(),

    ...journalTool.getToolDefinitions(),

    ...worldDeleteTools.getToolDefinitions(),

    // Phase 4 mcp_crud_expansion — add-actors-to-scene + delete-token folded into scene umbrella.

    ...duplicateActorTool.getToolDefinitions(),
    ...listActorItemsTool.getToolDefinitions(),

    ...applyNpcCareerAdvanceTool.getToolDefinitions(),

    ...applyTemplateTool.getToolDefinitions(),

    ...applyTemplateToTokenTool.getToolDefinitions(),

    ...createCustomItemTool.getToolDefinitions(),
    ...tradeItemTool.getToolDefinitions(),
    ...modifyItemQualitiesTool.getToolDefinitions(),
    ...addActiveEffectTool.getToolDefinitions(),
    ...updateActiveEffectTool.getToolDefinitions(),
    ...deleteActiveEffectTool.getToolDefinitions(),
    // TOOL-IDEA-003 (2026-05-14).
    ...getActiveEffectByNameTool.getToolDefinitions(),
    // Phase 5 mcp_crud_expansion — 7 per-doc-type embedded-CRUD umbrellas.
    ...tokenTool.getToolDefinitions(),
    ...lightTool.getToolDefinitions(),
    ...noteTool.getToolDefinitions(),
    ...soundTool.getToolDefinitions(),
    // Phase 7 mcp_crud_expansion — Playlist + PlaylistSound umbrella.
    ...playlistTool.getToolDefinitions(),
    ...macroTool.getToolDefinitions(),
    ...userTool.getToolDefinitions(),
    // Phase 9 mcp_crud_expansion — Compendium umbrella (CRU only, NO DELETE).
    ...compendiumUmbrellaTools.getToolDefinitions(),
    // Phase 10 mcp_crud_expansion — Cross-doc FK umbrella (3 actions; closes PRD).
    ...crossDocFkTool.getToolDefinitions(),
    ...regionTool.getToolDefinitions(),
    ...tileTool.getToolDefinitions(),
    ...templateTool.getToolDefinitions(),
    ...drawingTool.getToolDefinitions(),
    ...cardsTool.getToolDefinitions(),
    // Phase 8 mcp_coverage_expansion — document-io umbrella.
    ...documentIoTool.getToolDefinitions(),
    // Phase 6.1 mcp_crud_expansion — FilePicker umbrella (upload / list / convert).
    ...filePickerTool.getToolDefinitions(),
    // Phase 1 mcp_diagnostic_tool — diagnostic umbrella (3 actions in v1).
    ...diagnosticTool.getToolDefinitions(),

    ...notifyTool.getToolDefinitions(),
    // Phase wfrp-disease — Disease umbrella (8 actions).
    ...diseaseTool.getToolDefinitions(),
    // Phase 4 mcp_completion_v1 — Folder + Setting umbrellas.
    ...folderTool.getToolDefinitions(),
    ...settingTool.getToolDefinitions(),
    // Phase 5 mcp_completion_v1 — ChatMessage umbrella (5 actions).
    ...chatMessageTool.getToolDefinitions(),
    // Phase 1 mcp_coverage_expansion — item-directory + actor-config umbrellas.
    ...itemDirectoryTool.getToolDefinitions(),
    ...actorConfigTool.getToolDefinitions(),
    // Phase 3 mcp_coverage_expansion — combatant umbrella (7 per-combatant actions).
    ...combatantTool.getToolDefinitions(),

    // Phase 1 module_integration_v1 — module-probe (always-on) + module-matt (conditional stub).
    ...moduleProbeTool.getToolDefinitions(),
    ...moduleMattTool.getToolDefinitions(),

    // Phase 5 module_integration_v1 — module-tagger + module-sequencer (conditional).
    ...moduleTaggerTool.getToolDefinitions(),
    ...moduleSequencerTool.getToolDefinitions(),
    // Phase 4 module_integration_v1 — module-levels (conditional).
    ...moduleLevelsTool.getToolDefinitions(),
    // Phase 8 module_integration_v1 — module-autoanimations (conditional).
    ...moduleAutoAnimationsTool.getToolDefinitions(),
    // Phase 9 module_integration_v1 — WFRP mechanic delegates: module-robak + module-tokenbar (conditional).
    ...moduleRobakTool.getToolDefinitions(),
    ...moduleTokenbarTool.getToolDefinitions(),
    // Phase 10 module_integration_v1 — module-armoury (forien-armoury conditional).
    ...moduleArmouryTool.getToolDefinitions(),
    // Phase 11 module_integration_v1 — module-party-resources + module-gmtoolkit (conditional).
    ...modulePartyResourcesTool.getToolDefinitions(),
    ...moduleGmtoolkitTool.getToolDefinitions(),
    // Phase 12 module_integration_v1 — module-chat-commander (conditional).
    ...moduleChatCommanderTool.getToolDefinitions(),
    // Phase 14 module_integration_v1 — thin-session modules (conditional).
    ...moduleTimekeepingTool.getToolDefinitions(),
    ...modulePatrolTool.getToolDefinitions(),
    ...moduleGathererTool.getToolDefinitions(),
    ...moduleMastercraftedTool.getToolDefinitions(),

    // Phase 6 module_integration_v1 — module-scene-atmosphere bundle (conditional, per-member guard).
    ...moduleSceneAtmosphereTool.getToolDefinitions(),
    // Phase 7 module_integration_v1 — module-access-control bundle (conditional, per-member guard).
    ...moduleAccessControlTool.getToolDefinitions(),

    // Phase 13A module_integration_v1 — module-css (conditional).
    ...moduleCssTool.getToolDefinitions(),
    // Phase 15 module_integration_v1 — module-lighting (conditional).
    ...moduleLightingTool.getToolDefinitions(),

    // Phase 3 module_integration_v1 — module-itempiles (conditional).
    ...moduleItempilesTool.getToolDefinitions(),

  ];

  // Start Foundry connector (owns app port 31415)

  foundryClient.connect().catch((e) => {

    logger.error('Foundry connector failed to start', e);

  });

  // Control channel (TCP JSON-lines)

  const server = net.createServer((socket) => {

    socket.setEncoding('utf8');

    let buffer = '';

    const writeResponse = (payload: unknown): boolean => {
      if (socket.destroyed || !socket.writable) {
        return false;
      }

      try {
        socket.write(JSON.stringify(payload) + '\n');
        return true;
      } catch (e: any) {
        logger.debug('Backend control socket write failed', {
          code: e?.code,
          error: e?.message || String(e),
        });
        return false;
      }
    };

    socket.on('error', (e: NodeJS.ErrnoException) => {
      const meta = { code: e.code, error: e.message };
      if (e.code === 'ECONNRESET' || e.code === 'EPIPE') {
        logger.debug('Backend control socket closed unexpectedly', meta);
      } else {
        logger.warn('Backend control socket error', meta);
      }
    });

    socket.on('close', () => {
      buffer = '';
    });

    socket.on('data', async (chunk: string) => {

      buffer += chunk;

      let idx: number;

      while ((idx = buffer.indexOf('\n')) >= 0) {

        const line = buffer.slice(0, idx).trim();

        buffer = buffer.slice(idx + 1);

        if (!line) continue;

        try {

          const msg = JSON.parse(line) as { id: string; method: string; params?: any };

          if (msg.method === 'ping') {

            writeResponse({ id: msg.id, result: { ok: true } });

            continue;

          }

          if (msg.method === 'list_tools') {

            writeResponse({ id: msg.id, result: { tools: allTools } });

            continue;

          }

          if (msg.method === 'call_tool') {

            const { name, args: rawArgs } = (msg.params || {}) as { name: string; args?: any };

            const toolDef = allTools.find((t: any) => t.name === name);
            const args = coerceArgsBySchema((toolDef as any)?.inputSchema, rawArgs);

            try {

              const dispatchP = registry.dispatch(name, args);
              if (!dispatchP) {
                writeResponse({ id: msg.id, error: { code: -32602, message: `Unknown tool: ${name}` } });
                continue;
              }
              const result = await dispatchP;
              let payload: any;
              if (result && typeof result === 'object' && 'structuredContent' in result && 'content' in result) {
                payload = result;
              } else {
                payload = { content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result) }] };
              }
              writeResponse({ id: msg.id, result: payload });

            } catch (e: any) {

              writeResponse({ id: msg.id, result: { content: [{ type: 'text', text: `Error: ${scrubError(e)}` }], isError: true } });

            }

            continue;

          }

          // Unknown method

          writeResponse({ id: msg.id, error: { message: 'Unknown method' } });

        } catch (e: any) {

          // BUG-315: include id when it could be salvaged so the client can dispatch the error
          let salvageId: string | null = null;
          try { salvageId = (JSON.parse(line) as any)?.id ?? null; } catch { /* wholly unparseable */ }
          writeResponse({ id: salvageId, error: { message: e?.message || 'Bad request' } });

        }

      }

    });

  });

  await new Promise<void>((resolve, reject) => {

    server.listen(CONTROL_PORT, CONTROL_HOST, () => {

      logger.info(`Backend control channel listening on ${CONTROL_HOST}:${CONTROL_PORT}`);

      resolve();

    });

    server.on('error', reject);

  });

  // Shutdown hooks

  process.on('SIGINT', () => { foundryClient.disconnect(); releaseLock(); process.exit(0); });

  process.on('SIGTERM', () => { foundryClient.disconnect(); releaseLock(); process.exit(0); });

}

(async function main() {

  if (!acquireLock()) process.exit(0);

  process.on('exit', releaseLock);

  try {

    await startBackend();

  } catch (e: any) {

    console.error('Failed to start backend:', e?.message || e);

    releaseLock();

    process.exit(1);

  }

})();
