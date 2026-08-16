// Phase 8 (R8.1/R8.2): tool-instantiation factory extracted from backend.ts startBackend so the
// 94-line register block + 80-line getToolDefinitions spread collapse to a single forEach loop +
// flatMap (startBackend lands <=250 lines). The array ORDER mirrors the former allTools spread so
// the tools/list response stays byte-identical (HC8). Adding a tool now touches the tool file +
// this array (<=2 files, R8.1).
import { BaseTool, type BaseToolOptions } from '../../base-tool.js';
import { CharacterTools } from '../character.js';
import { ManageCharacterTool } from '../manage-character.js';
import { ManageInventoryTool } from '../manage-inventory.js';
import { CompendiumTools } from '../compendium.js';
import { SceneTool } from '../scene.js';
import { WorldTool } from '../world.js';
import { ActorCreationTools } from '../actor-creation.js';
import { DiceRollTools } from '../dice-roll.js';
import { KeybindingTools } from '../keybinding.js';
import { OwnershipTool } from '../ownership.js';
import { RollTableTool } from '../rolltable.js';
import { ManageCombatTools } from '../manage-combat.js';
import { ApplyDamageTool } from '../apply-damage.js';
import { ApplyTokenCasualtiesTool } from '../apply-token-casualties.js';
import { ManageConditionsTools } from '../manage-conditions.js';
import { ListActiveEffectsTool } from '../list-active-effects.js';
import { UpdateActorTool } from '../update-actor.js';
import { UpdateItemTool } from '../update-item.js';
import { AddItemFromCompendiumTool } from '../add-item-from-compendium.js';
import { DeleteItemTool } from '../delete-item.js';
import { GetWfrpConfigTool } from '../get-wfrp-config.js';
import { JournalTool } from '../journal.js';
import { WorldDeleteTools } from '../world-delete.js';
import { DuplicateActorTool } from '../duplicate-actor.js';
import { ListActorItemsTool } from '../list-actor-items.js';
import { ApplyNpcCareerAdvanceTool } from '../apply-npc-career-advance.js';
import { ApplyTemplateTool } from '../apply-template.js';
import { ApplyTemplateToTokenTool } from '../apply-template-to-token.js';
import { CreateCustomItemTool } from '../create-custom-item.js';
import { TradeItemTool } from '../trade-item.js';
import { ModifyItemQualitiesTool } from '../modify-item-qualities.js';
import { AddActiveEffectTool } from '../add-active-effect.js';
import { UpdateActiveEffectTool } from '../update-active-effect.js';
import { DeleteActiveEffectTool } from '../delete-active-effect.js';
import { GetActiveEffectByNameTool } from '../get-active-effect-by-name.js';
import { TokenTool } from '../token.js';
import { LightTool } from '../light.js';
import { NoteTool } from '../note.js';
import { SoundTool } from '../sound.js';
import { PlaylistTool } from '../playlist.js';
import { MacroTool } from '../macro.js';
import { UserTool } from '../user.js';
import { CompendiumUmbrellaTools } from '../compendium-umbrella.js';
import { CrossDocFkTool } from '../cross-doc-fk.js';
import { RegionTool } from '../region.js';
import { TileTool } from '../tile.js';
import { TemplateTool } from '../template.js';
import { DrawingTool } from '../drawing.js';
import { CardsTool } from '../cards.js';
import { DocumentIoTool } from '../document-io.js';
import { FilePickerTool } from '../filepicker.js';
import { DiagnosticTool } from '../diagnostic.js';
import { NotifyTool } from '../notify.js';
import { DiseaseTool } from '../disease.js';
import { AvailabilityTestTool } from '../availability-test.js';
import { TravelDistanceTool } from '../travel-distance.js';
import { FolderTool } from '../folder.js';
import { SettingTool } from '../setting.js';
import { ChatMessageTool } from '../chat-message.js';
import { ItemDirectoryTool } from '../item-directory.js';
import { ActorConfigTool } from '../actor-config.js';
import { CombatantTool } from '../combatant.js';
import { ModuleProbeTool } from '../modules/probe/probe.js';
import { ModuleMattTool } from '../modules/monks-active-tiles/matt.js';
import { ModuleTaggerTool } from '../modules/tagger/tagger.js';
import { ModuleTokenizerTool } from '../modules/tokenizer/tokenizer.js';
import { ModuleSequencerTool } from '../modules/sequencer/sequencer.js';
import { ModuleLevelsTool } from '../modules/levels/levels.js';
import { ModuleAutoAnimationsTool } from '../modules/autoanimations/autoanimations.js';
import { ModuleRobakTool } from '../modules/robak/robak.js';
import { ModuleTokenbarTool } from '../modules/tokenbar/tokenbar.js';
import { ModuleArmouryTool } from '../modules/forien-armoury/armoury.js';
import { ModulePartyResourcesTool } from '../modules/fvtt-party-resources/party-resources.js';
import { ModuleGmtoolkitTool } from '../modules/wfrp4e-gm-toolkit/gmtoolkit.js';
import { ModuleChatCommanderTool } from '../modules/_chatcommands/chat-commander.js';
import { ModuleTimekeepingTool } from '../modules/simple-timekeeping/timekeeping.js';
import { ModulePatrolTool } from '../modules/patrol/patrol.js';
import { ModuleGathererTool } from '../modules/gatherer/gatherer.js';
import { ModuleMastercraftedTool } from '../modules/mastercrafted/mastercrafted.js';
import { ModuleSceneAtmosphereTool } from '../modules/scene-atmosphere/scene-atmosphere.js';
import { ModuleAccessControlTool } from '../modules/access-control/access-control.js';
import { ModuleCssTool } from '../modules/custom-css/css.js';
import { ModuleLightingTool } from '../modules/community-lighting/lighting.js';
import { ModuleItempilesTool } from '../modules/item-piles/item-piles.js';
import { ModuleImperialArcanaTool } from '../modules/imperial-arcana/imperial-arcana.js';
import { ModuleConversationHudTool } from '../modules/conversation-hud/conversation-hud.js';
import { ModuleSimpleQuestTool } from '../modules/simple-quest/simple-quest.js';
import { ModuleTokenAttacherTool } from '../modules/token-attacher/token-attacher.js';
import { ModuleTokenPresentationTool } from '../modules/token-presentation/token-presentation.js';
import { ModulePerceptiveTool } from '../modules/perceptive/perceptive.js';
import { ModuleAugurNexusTool } from '../modules/augur-nexus/augur-nexus.js';
import { ModuleWfrpEconomyTool } from '../modules/wfrp-economy/wfrp-economy.js';
import { ModuleMortalNeedsTool } from '../modules/mortal-needs/mortal-needs.js';
import { ModulePolyglotTool } from '../modules/polyglot/polyglot.js';
import { ModuleNarratorTool } from '../modules/narrator/narrator.js';
import { ModuleMacroTriggerTool } from '../modules/macro-trigger/macro-trigger.js';
import { ModuleBackpackTool } from '../modules/backpack/backpack.js';
import { ModulePuzzleLocksTool } from '../modules/puzzle-locks/puzzle-locks.js';
import { ModuleSyrinscapeTool } from '../modules/syrinscape/syrinscape.js';
import { ModulePortalTool } from '../modules/portal/portal.js';
import { ModuleTradingPlacesTool } from '../modules/trading-places/trading-places.js';

export function buildTools(deps: BaseToolOptions): BaseTool[] {
  return [
    new CharacterTools(deps),
    new ManageCharacterTool(deps),
    new ManageInventoryTool(deps),
    new CompendiumTools(deps),
    new SceneTool(deps),
    new WorldTool(deps),
    new ActorCreationTools(deps),
    new DiceRollTools(deps),
    new KeybindingTools(deps),
    new OwnershipTool(deps),
    new RollTableTool(deps),
    new ManageCombatTools(deps),
    new ApplyDamageTool(deps),
    new ApplyTokenCasualtiesTool(deps),
    new ManageConditionsTools(deps),
    new ListActiveEffectsTool(deps),
    new UpdateActorTool(deps),
    new UpdateItemTool(deps),
    new AddItemFromCompendiumTool(deps),
    new DeleteItemTool(deps),
    new GetWfrpConfigTool(deps),
    new JournalTool(deps),
    new WorldDeleteTools(deps),
    new DuplicateActorTool(deps),
    new ListActorItemsTool(deps),
    new ApplyNpcCareerAdvanceTool(deps),
    new ApplyTemplateTool(deps),
    new ApplyTemplateToTokenTool(deps),
    new CreateCustomItemTool(deps),
    new TradeItemTool(deps),
    new ModifyItemQualitiesTool(deps),
    new AddActiveEffectTool(deps),
    new UpdateActiveEffectTool(deps),
    new DeleteActiveEffectTool(deps),
    new GetActiveEffectByNameTool(deps),
    new TokenTool(deps),
    new LightTool(deps),
    new NoteTool(deps),
    new SoundTool(deps),
    new PlaylistTool(deps),
    new MacroTool(deps),
    new UserTool(deps),
    new CompendiumUmbrellaTools(deps),
    new CrossDocFkTool(deps),
    new RegionTool(deps),
    new TileTool(deps),
    new TemplateTool(deps),
    new DrawingTool(deps),
    new CardsTool(deps),
    new DocumentIoTool(deps),
    new FilePickerTool(deps),
    new DiagnosticTool(deps),
    new NotifyTool(deps),
    new DiseaseTool(deps),
    new AvailabilityTestTool(deps),
    new TravelDistanceTool(deps),
    new FolderTool(deps),
    new SettingTool(deps),
    new ChatMessageTool(deps),
    new ItemDirectoryTool(deps),
    new ActorConfigTool(deps),
    new CombatantTool(deps),
    new ModuleProbeTool(deps),
    new ModuleMattTool(deps),
    new ModuleTaggerTool(deps),
    new ModuleTokenizerTool(deps),
    new ModuleSequencerTool(deps),
    new ModuleLevelsTool(deps),
    new ModuleAutoAnimationsTool(deps),
    new ModuleRobakTool(deps),
    new ModuleTokenbarTool(deps),
    new ModuleArmouryTool(deps),
    new ModulePartyResourcesTool(deps),
    new ModuleGmtoolkitTool(deps),
    new ModuleChatCommanderTool(deps),
    new ModuleTimekeepingTool(deps),
    new ModulePatrolTool(deps),
    new ModuleGathererTool(deps),
    new ModuleMastercraftedTool(deps),
    new ModuleSceneAtmosphereTool(deps),
    new ModuleAccessControlTool(deps),
    new ModuleCssTool(deps),
    new ModuleLightingTool(deps),
    new ModuleItempilesTool(deps),
    new ModuleImperialArcanaTool(deps),
    new ModuleConversationHudTool(deps),
    new ModuleSimpleQuestTool(deps),
    new ModuleTokenAttacherTool(deps),
    new ModuleTokenPresentationTool(deps),
    new ModulePerceptiveTool(deps),
    new ModuleAugurNexusTool(deps),
    new ModuleWfrpEconomyTool(deps),
    new ModuleMortalNeedsTool(deps),
    new ModulePolyglotTool(deps),
    new ModuleNarratorTool(deps),
    new ModuleMacroTriggerTool(deps),
    new ModuleBackpackTool(deps),
    new ModulePuzzleLocksTool(deps),
    new ModuleSyrinscapeTool(deps),
    new ModulePortalTool(deps),
    new ModuleTradingPlacesTool(deps),
  ];
}
