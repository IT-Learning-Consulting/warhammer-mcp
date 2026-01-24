# hookEvents | Foundry Virtual Tabletop - API Documentation - Version 13

A module which provides documentation for the various hook events which are dispatched throughout the Foundry Virtual Tabletop client-side software.

## Events - AVSettings

- [rtcSettingsChanged](https://foundryvtt.com/api/functions/hookEvents.rtcSettingsChanged.html)

## Events - ActiveEffect

- [applyActiveEffect](https://foundryvtt.com/api/functions/hookEvents.applyActiveEffect.html)

## Events - Actor

- [modifyTokenAttribute](https://foundryvtt.com/api/functions/hookEvents.modifyTokenAttribute.html)

## Events - ActorSheet

- [dropActorSheetData](https://foundryvtt.com/api/functions/hookEvents.dropActorSheetData.html)

## Events - AdventureImporter

- [importAdventure](https://foundryvtt.com/api/functions/hookEvents.importAdventure.html)
- [preImportAdventure](https://foundryvtt.com/api/functions/hookEvents.preImportAdventure.html)

## Events - ApplicationV1

- [closeApplicationV1](https://foundryvtt.com/api/functions/hookEvents.closeApplicationV1.html)
- [getApplicationV1HeaderButtons](https://foundryvtt.com/api/functions/hookEvents.getApplicationV1HeaderButtons.html)
- [renderApplicationV1](https://foundryvtt.com/api/functions/hookEvents.renderApplicationV1.html)

## Events - ApplicationV2

- [closeApplicationV2](https://foundryvtt.com/api/functions/hookEvents.closeApplicationV2.html)
- [getDocumentContextOptions](https://foundryvtt.com/api/functions/hookEvents.getDocumentContextOptions.html)
- [getHeaderControlsApplicationV2](https://foundryvtt.com/api/functions/hookEvents.getHeaderControlsApplicationV2.html)
- [renderApplicationV2](https://foundryvtt.com/api/functions/hookEvents.renderApplicationV2.html)

## Events - AudioHelper

- [globalVolumeChanged](https://foundryvtt.com/api/functions/hookEvents.globalVolumeChanged.html)

## Events - Canvas

- [canvasConfig](https://foundryvtt.com/api/functions/hookEvents.canvasConfig.html)
- [canvasDraw](https://foundryvtt.com/api/functions/hookEvents.canvasDraw.html)
- [canvasInit](https://foundryvtt.com/api/functions/hookEvents.canvasInit.html)
- [canvasPan](https://foundryvtt.com/api/functions/hookEvents.canvasPan.html)
- [canvasReady](https://foundryvtt.com/api/functions/hookEvents.canvasReady.html)
- [canvasTearDown](https://foundryvtt.com/api/functions/hookEvents.canvasTearDown.html)
- [dropCanvasData](https://foundryvtt.com/api/functions/hookEvents.dropCanvasData.html)
- [highlightObjects](https://foundryvtt.com/api/functions/hookEvents.highlightObjects.html)

## Events - CanvasGroup

- [drawGroup](https://foundryvtt.com/api/functions/hookEvents.drawGroup.html)
- [tearDownGroup](https://foundryvtt.com/api/functions/hookEvents.tearDownGroup.html)

## Events - CanvasLayer

- [drawLayer](https://foundryvtt.com/api/functions/hookEvents.drawLayer.html)
- [pastePlaceableObject](https://foundryvtt.com/api/functions/hookEvents.pastePlaceableObject.html)
- [tearDownLayer](https://foundryvtt.com/api/functions/hookEvents.tearDownLayer.html)

## Events - CanvasVisibility

- [initializeVisionMode](https://foundryvtt.com/api/functions/hookEvents.initializeVisionMode.html)
- [initializeVisionSources](https://foundryvtt.com/api/functions/hookEvents.initializeVisionSources.html)
- [sightRefresh](https://foundryvtt.com/api/functions/hookEvents.sightRefresh.html)
- [visibilityRefresh](https://foundryvtt.com/api/functions/hookEvents.visibilityRefresh.html)

## Events - Cards

- [dealCards](https://foundryvtt.com/api/functions/hookEvents.dealCards.html)
- [passCards](https://foundryvtt.com/api/functions/hookEvents.passCards.html)
- [returnCards](https://foundryvtt.com/api/functions/hookEvents.returnCards.html)

## Events - ChatBubbles

- [chatBubbleHTML](https://foundryvtt.com/api/functions/hookEvents.chatBubbleHTML.html)

## Events - ChatLog

- [chatInput](https://foundryvtt.com/api/functions/hookEvents.chatInput.html)
- [chatMessage](https://foundryvtt.com/api/functions/hookEvents.chatMessage.html)

## Events - ChatMessage

- [renderChatMessageHTML](https://foundryvtt.com/api/functions/hookEvents.renderChatMessageHTML.html)

## Events - ClientSettings

- [clientSettingChanged](https://foundryvtt.com/api/functions/hookEvents.clientSettingChanged.html)

## Events - Combat

- [combatRound](https://foundryvtt.com/api/functions/hookEvents.combatRound.html)
- [combatStart](https://foundryvtt.com/api/functions/hookEvents.combatStart.html)
- [combatTurn](https://foundryvtt.com/api/functions/hookEvents.combatTurn.html)
- [combatTurnChange](https://foundryvtt.com/api/functions/hookEvents.combatTurnChange.html)

## Events - CompendiumCollection

- [updateCompendium](https://foundryvtt.com/api/functions/hookEvents.updateCompendium.html)

## Events - Document

- [applyCompendiumArt](https://foundryvtt.com/api/functions/hookEvents.applyCompendiumArt.html)
- [createDocument](https://foundryvtt.com/api/functions/hookEvents.createDocument.html)
- [deleteDocument](https://foundryvtt.com/api/functions/hookEvents.deleteDocument.html)
- [preCreateDocument](https://foundryvtt.com/api/functions/hookEvents.preCreateDocument.html)
- [preDeleteDocument](https://foundryvtt.com/api/functions/hookEvents.preDeleteDocument.html)
- [preUpdateDocument](https://foundryvtt.com/api/functions/hookEvents.preUpdateDocument.html)
- [updateDocument](https://foundryvtt.com/api/functions/hookEvents.updateDocument.html)

## Events - EffectsCanvasGroup

- [initializeLightSources](https://foundryvtt.com/api/functions/hookEvents.initializeLightSources.html)
- [initializePriorityLightSources](https://foundryvtt.com/api/functions/hookEvents.initializePriorityLightSources.html)
- [lightingRefresh](https://foundryvtt.com/api/functions/hookEvents.lightingRefresh.html)

## Events - EnvironmentCanvasGroup

- [configureCanvasEnvironment](https://foundryvtt.com/api/functions/hookEvents.configureCanvasEnvironment.html)
- [initializeCanvasEnvironment](https://foundryvtt.com/api/functions/hookEvents.initializeCanvasEnvironment.html)

## Events - Game

- [error](https://foundryvtt.com/api/functions/hookEvents.error.html)
- [hotReload](https://foundryvtt.com/api/functions/hookEvents.hotReload.html)
- [i18nInit](https://foundryvtt.com/api/functions/hookEvents.i18nInit.html)
- [init](https://foundryvtt.com/api/functions/hookEvents.init.html)
- [pauseGame](https://foundryvtt.com/api/functions/hookEvents.pauseGame.html)
- [ready](https://foundryvtt.com/api/functions/hookEvents.ready.html)
- [setup](https://foundryvtt.com/api/functions/hookEvents.setup.html)
- [updateWorldTime](https://foundryvtt.com/api/functions/hookEvents.updateWorldTime.html)

## Events - Hotbar

- [hotbarDrop](https://foundryvtt.com/api/functions/hookEvents.hotbarDrop.html)

## Events - InteractionLayer

- [activateLayer](https://foundryvtt.com/api/functions/hookEvents.activateLayer.html)
- [deactivateLayer](https://foundryvtt.com/api/functions/hookEvents.deactivateLayer.html)

## Events - Note

- [activateNote](https://foundryvtt.com/api/functions/hookEvents.activateNote.html)

## Events - PlaceableObject

- [controlObject](https://foundryvtt.com/api/functions/hookEvents.controlObject.html)
- [destroyObject](https://foundryvtt.com/api/functions/hookEvents.destroyObject.html)
- [drawObject](https://foundryvtt.com/api/functions/hookEvents.drawObject.html)
- [hoverObject](https://foundryvtt.com/api/functions/hookEvents.hoverObject.html)
- [refreshObject](https://foundryvtt.com/api/functions/hookEvents.refreshObject.html)

## Events - ProseMirrorEditor

- [createProseMirrorEditor](https://foundryvtt.com/api/functions/hookEvents.createProseMirrorEditor.html)

## Events - ProseMirrorMenu

- [getProseMirrorMenuDropDowns](https://foundryvtt.com/api/functions/hookEvents.getProseMirrorMenuDropDowns.html)
- [getProseMirrorMenuItems](https://foundryvtt.com/api/functions/hookEvents.getProseMirrorMenuItems.html)

## Events - RenderedEffectSource

- [initializeRenderedEffectSourceShaders](https://foundryvtt.com/api/functions/hookEvents.initializeRenderedEffectSourceShaders.html)

## Events - RollTableSheet

- [dropRollTableSheetData](https://foundryvtt.com/api/functions/hookEvents.dropRollTableSheetData.html)

## Events - SceneControls

- [getSceneControlButtons](https://foundryvtt.com/api/functions/hookEvents.getSceneControlButtons.html)

## Events - SceneNavigation

- [collapseSceneNavigation](https://foundryvtt.com/api/functions/hookEvents.collapseSceneNavigation.html)

## Events - Sidebar

- [changeSidebarTab](https://foundryvtt.com/api/functions/hookEvents.changeSidebarTab.html)
- [collapseSidebar](https://foundryvtt.com/api/functions/hookEvents.collapseSidebar.html)

## Events - Token

- [applyTokenStatusEffect](https://foundryvtt.com/api/functions/hookEvents.applyTokenStatusEffect.html)
- [targetToken](https://foundryvtt.com/api/functions/hookEvents.targetToken.html)

## Events - TokenDocument

- [moveToken](https://foundryvtt.com/api/functions/hookEvents.moveToken.html)
- [pauseToken](https://foundryvtt.com/api/functions/hookEvents.pauseToken.html)
- [preMoveToken](https://foundryvtt.com/api/functions/hookEvents.preMoveToken.html)
- [recordToken](https://foundryvtt.com/api/functions/hookEvents.recordToken.html)
- [stopToken](https://foundryvtt.com/api/functions/hookEvents.stopToken.html)

## Events - TokenRingConfig

- [initializeDynamicTokenRingConfig](https://foundryvtt.com/api/functions/hookEvents.initializeDynamicTokenRingConfig.html)

## Events - Users

- [userConnected](https://foundryvtt.com/api/functions/hookEvents.userConnected.html)

## Events - WeatherEffects

- [initializeWeatherEffects](https://foundryvtt.com/api/functions/hookEvents.initializeWeatherEffects.html)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)