// Phase 11 (R11.3): centralized error-token registry.
//
// 84 tokens: 80 `*_NOT_PERSISTED` post-verify tokens (DP-16) + 4 cross-package
// module-guard tokens. Previously scattered as bare string literals across ~90
// files in both packages.
//
// ─────────────────────────────────────────────────────────────────────────────
// HARD CONSTRAINT — token string VALUES are byte-identical to the prior literals
// (value === key for every entry). This is NOT cosmetic: the contract is the
// VALUE, not the key. Two live consumers depend on the literal value:
//   1. The 23 mcp-server module tool files that do `msg.includes('MODULE_NOT_ACTIVE')`
//      (and the 3 sibling guard tokens) to detect module-inactive responses.
//   2. foundry-module/src/transaction-manager.ts — a `/NOT_PERSISTED|VERIFY_FAILED/`
//      regex test on the error message. Every `*_NOT_PERSISTED` value preserves the
//      `_NOT_PERSISTED` suffix so that regex still matches.
// Any value change is an HC8 contract break. Migrating a literal to `ErrorTokens.X`
// is a pure syntax change — the emitted string is unchanged.
// ─────────────────────────────────────────────────────────────────────────────
//
// House style: `as const` object (mirrors constants.ts SOCKET_EVENTS/ERROR_MESSAGES),
// NOT a TS enum (enums emit runtime code + hurt tree-shaking).

export const ErrorTokens = {
  // ── Module-guard tokens (string-matched cross-package via .includes()) ──
  MODULE_NOT_ACTIVE: 'MODULE_NOT_ACTIVE',
  MODULE_DEPENDENCY_NOT_ACTIVE: 'MODULE_DEPENDENCY_NOT_ACTIVE',
  COMPANION_NOT_ACTIVE: 'COMPANION_NOT_ACTIVE',
  SOCKETLIB_NOT_ACTIVE: 'SOCKETLIB_NOT_ACTIVE',

  // ── Input-validation rejection tokens (Phase 12 R12.3) ──
  // Pre-write INPUT rejection (the field never reaches actor.update), NOT a post-write verify failure —
  // deliberately omits the `_NOT_PERSISTED` suffix so transaction-manager's /NOT_PERSISTED|VERIFY_FAILED/
  // rollback regex does NOT match it (a rejected field had nothing to roll back).
  FIELD_NOT_ALLOWED: 'FIELD_NOT_ALLOWED',
  // wfrp_layer_expansion_v1 Phase 6 (P-10) — availability-test pre-write input rejections.
  // No `_NOT_PERSISTED` suffix: these reject BEFORE any ChatMessage is posted (nothing to roll back).
  AVAILABILITY_TEST_INVALID_SETTLEMENT: 'AVAILABILITY_TEST_INVALID_SETTLEMENT',
  AVAILABILITY_TEST_INVALID_RARITY: 'AVAILABILITY_TEST_INVALID_RARITY',
  AVAILABILITY_TEST_STOCK_ROLL_REQUIRED: 'AVAILABILITY_TEST_STOCK_ROLL_REQUIRED',
  // wfrp_layer_expansion_v1 Phase 7 (P-11) — travel-distance compute-only lookup failures.
  // No `_NOT_PERSISTED` suffix: this tool never writes, so there is nothing to roll back.
  TRAVEL_DATA_NOT_LOADED: 'TRAVEL_DATA_NOT_LOADED',
  TRAVEL_ROUTE_NOT_FOUND: 'TRAVEL_ROUTE_NOT_FOUND',
  // module_integration_v2 Phase 4 (module-perceptive) — token/door target resolution failure.
  // No `_NOT_PERSISTED` suffix: rejects BEFORE any flag write (nothing to roll back).
  PERCEPTIVE_TARGET_NOT_FOUND: 'PERCEPTIVE_TARGET_NOT_FOUND',
  // module_integration_v2 Phase 5 (module-augur-nexus) — pre-write rejections (no rollback).
  // CONFIRM_REQUIRED: a destructive delete fired without confirm:true. TARGET_NOT_FOUND: scene/site/
  // edge/connection-target could not be resolved. No `_NOT_PERSISTED` suffix (nothing written yet).
  AUGUR_NEXUS_CONFIRM_REQUIRED: 'AUGUR_NEXUS_CONFIRM_REQUIRED',
  AUGUR_NEXUS_TARGET_NOT_FOUND: 'AUGUR_NEXUS_TARGET_NOT_FOUND',
  // module_integration_v2 Phase 6 (module-wfrp-economy) — pre-write rejections (no rollback).
  // CONFIRM_REQUIRED: delete-economy or a large transfer fired without confirm:true.
  // TARGET_NOT_FOUND: economy/bank/account/stock/property/actor could not be resolved. No
  // `_NOT_PERSISTED` suffix on these two (nothing written yet → nothing to roll back).
  WFRP_ECONOMY_CONFIRM_REQUIRED: 'WFRP_ECONOMY_CONFIRM_REQUIRED',
  WFRP_ECONOMY_TARGET_NOT_FOUND: 'WFRP_ECONOMY_TARGET_NOT_FOUND',
  // module_integration_v2 Phase 8 (module-mortal-needs) — pre-write rejections (no rollback).
  // CONFIRM_REQUIRED: reset-all / untrack-actor / party-wide long-rest / unregister-custom-need fired
  // without confirm:true. TARGET_NOT_FOUND: actor/need/need-config could not be resolved. No
  // `_NOT_PERSISTED` suffix on these two (nothing written yet — nothing to roll back).
  MORTAL_NEEDS_CONFIRM_REQUIRED: 'MORTAL_NEEDS_CONFIRM_REQUIRED',
  MORTAL_NEEDS_TARGET_NOT_FOUND: 'MORTAL_NEEDS_TARGET_NOT_FOUND',
  // module_integration_v2 Phase 9 (module-polyglot) — pre-write rejections (no rollback).
  // CONFIRM_REQUIRED: revoke-language / revoke-literacy fired without confirm:true. TARGET_NOT_FOUND:
  // actor/language/journal-page/substring could not be resolved. No `_NOT_PERSISTED` suffix on these two
  // (nothing written yet — nothing to roll back).
  POLYGLOT_CONFIRM_REQUIRED: 'POLYGLOT_CONFIRM_REQUIRED',
  POLYGLOT_TARGET_NOT_FOUND: 'POLYGLOT_TARGET_NOT_FOUND',
  // module_integration_v2 Phase 10 (module-narrator) — dispatch-level rejections (no rollback; D5: no
  // confirm-gate, narrator has zero destructive ops). ACCESS_DENIED: write action by non-GM, or
  // scenery/configure by a GM lacking SETTINGS_MODIFY. INVALID_INPUT: discriminatedUnion parse reject.
  // UNKNOWN_ACTION: exhaustive-switch fallthrough (schema/dispatch mismatch). HANDLER_ERROR: outer
  // try/catch, incl. the bare-lexical NarratorTools identifier being unreachable.
  NARRATOR_ACCESS_DENIED: 'NARRATOR_ACCESS_DENIED',
  NARRATOR_HANDLER_ERROR: 'NARRATOR_HANDLER_ERROR',
  NARRATOR_INVALID_INPUT: 'NARRATOR_INVALID_INPUT',
  NARRATOR_UNKNOWN_ACTION: 'NARRATOR_UNKNOWN_ACTION',
  // module_integration_v2 Phase 11 (module-macro-trigger) — dispatch-level rejections (no rollback).
  // ACCESS_DENIED: a write action (create/update/delete/clear) fired by a non-GM. INVALID_INPUT:
  // discriminatedUnion parse reject (incl. an out-of-38-hook-enum `event`). UNKNOWN_ACTION: exhaustive-
  // switch fallthrough (schema/dispatch mismatch). HANDLER_ERROR: outer try/catch. CONFIRM_REQUIRED: a
  // destructive delete/clear fired without confirm:true. TARGET_NOT_FOUND: an update/delete `bindingId`
  // could not be resolved in the MacroEvents array. No `_NOT_PERSISTED` suffix on CONFIRM_REQUIRED/
  // TARGET_NOT_FOUND (nothing written yet — nothing to roll back).
  MACRO_TRIGGER_ACCESS_DENIED: 'MACRO_TRIGGER_ACCESS_DENIED',
  MACRO_TRIGGER_HANDLER_ERROR: 'MACRO_TRIGGER_HANDLER_ERROR',
  MACRO_TRIGGER_INVALID_INPUT: 'MACRO_TRIGGER_INVALID_INPUT',
  MACRO_TRIGGER_UNKNOWN_ACTION: 'MACRO_TRIGGER_UNKNOWN_ACTION',
  MACRO_TRIGGER_CONFIRM_REQUIRED: 'MACRO_TRIGGER_CONFIRM_REQUIRED',
  MACRO_TRIGGER_TARGET_NOT_FOUND: 'MACRO_TRIGGER_TARGET_NOT_FOUND',
  // module_integration_v2 Phase 12 (module-backpack) — dispatch-level rejections (no rollback) +
  // atomic-round-trip verify tokens (WITH rollback — see the *_NOT_PERSISTED pair below).
  // ACCESS_DENIED: a write action (all but read) fired by a non-GM. INVALID_INPUT: discriminatedUnion
  // parse reject (incl. out-of-5..100-range set-limit/set-user-limit, or a lock-slots/clear-locks call
  // that doesn't supply exactly one of its XOR'd fields). UNKNOWN_ACTION: exhaustive-switch fallthrough
  // (schema/dispatch mismatch). HANDLER_ERROR: outer try/catch. CONFIRM_REQUIRED: reset fired without
  // confirm:true. TARGET_NOT_FOUND: an actor/item/slot/binding could not be resolved (add-item's itemId
  // not on actor.items, remove-item/move-item's empty fromSlot, etc). SLOT_OCCUPIED: add-item/move-item
  // targeting an occupied slot without overwrite:true — the storage layer silently overwrites with no
  // guard of its own (memo §Confirmed-facts 3/§gap-fill 1), so the handler replicates the guard.
  BACKPACK_ACCESS_DENIED: 'BACKPACK_ACCESS_DENIED',
  BACKPACK_INVALID_INPUT: 'BACKPACK_INVALID_INPUT',
  BACKPACK_UNKNOWN_ACTION: 'BACKPACK_UNKNOWN_ACTION',
  BACKPACK_HANDLER_ERROR: 'BACKPACK_HANDLER_ERROR',
  BACKPACK_CONFIRM_REQUIRED: 'BACKPACK_CONFIRM_REQUIRED',
  BACKPACK_TARGET_NOT_FOUND: 'BACKPACK_TARGET_NOT_FOUND',
  BACKPACK_SLOT_OCCUPIED: 'BACKPACK_SLOT_OCCUPIED',
  // wfrp_layer_expansion_v1 Phase 13 (R16, sheet-flow) — pre-write rejections (no rollback).
  // ADD_MONEY_INVALID_AMOUNT: moneyString has no positive numeric prefix — blocks
  // MarketWFRP4e.addMoneyTo's zero-all-coins trap on a falsy/zero amount BEFORE any write.
  // ADD_MONEY_NO_COIN_ITEM: the target tier's money item doesn't exist on the actor (addMoneyTo
  // throws raw otherwise). DIRECT_PAY_INVALID_AMOUNT: amountString didn't parse. DIRECT_PAY_
  // INSUFFICIENT_FUNDS: pre-flight funds check catches directPayCommand's silent-fail path.
  ADD_MONEY_INVALID_AMOUNT: 'ADD_MONEY_INVALID_AMOUNT',
  ADD_MONEY_NO_COIN_ITEM: 'ADD_MONEY_NO_COIN_ITEM',
  DIRECT_PAY_INVALID_AMOUNT: 'DIRECT_PAY_INVALID_AMOUNT',
  DIRECT_PAY_INSUFFICIENT_FUNDS: 'DIRECT_PAY_INSUFFICIENT_FUNDS',
  // module_integration_v2 Phase 13B (module-puzzle-locks) — dispatch-level rejections (no rollback).
  // ACCESS_DENIED: a write action fired by a non-GM. INVALID_INPUT: discriminatedUnion parse reject.
  // UNKNOWN_ACTION: exhaustive-switch fallthrough (schema/dispatch mismatch). HANDLER_ERROR: outer
  // try/catch. CONFIRM_REQUIRED: remove-puzzle/force-unlock fired without confirm:true.
  // TARGET_NOT_FOUND: documentUuid could not be resolved, or the doc has no puzzle-lock attached.
  // INVALID_LOCK_TYPE: attach-puzzle's typeConfig is missing/empty its required solution field for the
  // given lockType (the module itself performs no validation of its own). No `_NOT_PERSISTED` suffix on
  // any of these six (all reject before or independently of a flag write — nothing to roll back).
  PUZZLE_LOCKS_ACCESS_DENIED: 'PUZZLE_LOCKS_ACCESS_DENIED',
  PUZZLE_LOCKS_INVALID_INPUT: 'PUZZLE_LOCKS_INVALID_INPUT',
  PUZZLE_LOCKS_UNKNOWN_ACTION: 'PUZZLE_LOCKS_UNKNOWN_ACTION',
  PUZZLE_LOCKS_HANDLER_ERROR: 'PUZZLE_LOCKS_HANDLER_ERROR',
  PUZZLE_LOCKS_CONFIRM_REQUIRED: 'PUZZLE_LOCKS_CONFIRM_REQUIRED',
  PUZZLE_LOCKS_TARGET_NOT_FOUND: 'PUZZLE_LOCKS_TARGET_NOT_FOUND',
  PUZZLE_LOCKS_INVALID_LOCK_TYPE: 'PUZZLE_LOCKS_INVALID_LOCK_TYPE',
  // module_integration_v2 Phase 13C (module-syrinscape) — dispatch-level rejections (no rollback; no
  // document writes exist for this module at all, so there is no *_NOT_PERSISTED pair). ACCESS_DENIED:
  // a play/stop action fired by a non-GM. INVALID_INPUT: discriminatedUnion parse reject. UNKNOWN_ACTION:
  // exhaustive-switch fallthrough. HANDLER_ERROR: outer try/catch. AUTH_MISSING: the "authToken" world
  // setting is blank — a PROACTIVE pre-check before calling any play/stop util (the module itself would
  // otherwise swallow this into an indistinguishable `false`). NOT_READY: globalThis.syrinscapeControl.
  // utils isn't callable yet (client audio-unlock race). PLAYBACK_REJECTED: a play/stop util returned
  // `false` — Syrinscape accepted the WS send but rejected the command (bad id/scope/session).
  SYRINSCAPE_ACCESS_DENIED: 'SYRINSCAPE_ACCESS_DENIED',
  SYRINSCAPE_INVALID_INPUT: 'SYRINSCAPE_INVALID_INPUT',
  SYRINSCAPE_UNKNOWN_ACTION: 'SYRINSCAPE_UNKNOWN_ACTION',
  SYRINSCAPE_HANDLER_ERROR: 'SYRINSCAPE_HANDLER_ERROR',
  SYRINSCAPE_AUTH_MISSING: 'SYRINSCAPE_AUTH_MISSING',
  SYRINSCAPE_NOT_READY: 'SYRINSCAPE_NOT_READY',
  SYRINSCAPE_PLAYBACK_REJECTED: 'SYRINSCAPE_PLAYBACK_REJECTED',
  // module_integration_v2 Phase 13A (module-portal) — dispatch-level rejections (no rollback; Portal's
  // own spawn() call is properly awaited so a failure never leaves a partial write to roll back).
  // ACCESS_DENIED: spawn fired by a non-GM. INVALID_INPUT: schema parse reject. CANVAS_NOT_READY:
  // canvas.ready is falsy. WRONG_SCENE_ACTIVE: requested sceneId doesn't match the live canvas.scene.id
  // (Portal has no sceneId parameter of its own — this is the actionable-refusal guard that prevents a
  // silent wrong-scene spawn). SPAWN_FAILED: globalThis.Portal uncallable, or spawn() resolved with no
  // token documents, or the builder chain threw.
  PORTAL_ACCESS_DENIED: 'PORTAL_ACCESS_DENIED',
  PORTAL_INVALID_INPUT: 'PORTAL_INVALID_INPUT',
  PORTAL_CANVAS_NOT_READY: 'PORTAL_CANVAS_NOT_READY',
  PORTAL_WRONG_SCENE_ACTIVE: 'PORTAL_WRONG_SCENE_ACTIVE',
  PORTAL_SPAWN_FAILED: 'PORTAL_SPAWN_FAILED',

  // ── *_NOT_PERSISTED post-write-verification tokens (DP-16) ──
  WRITE_NOT_PERSISTED: 'WRITE_NOT_PERSISTED',
  ACTOR_CREATE_NOT_PERSISTED: 'ACTOR_CREATE_NOT_PERSISTED',
  ADD_ACTIVE_EFFECT_NOT_PERSISTED: 'ADD_ACTIVE_EFFECT_NOT_PERSISTED',
  ADD_COMBATANTS_NOT_PERSISTED: 'ADD_COMBATANTS_NOT_PERSISTED',
  ADD_MONEY_NOT_PERSISTED: 'ADD_MONEY_NOT_PERSISTED',
  APPLY_FEAR_NOT_PERSISTED: 'APPLY_FEAR_NOT_PERSISTED',
  CHECK_RELOAD_NOT_PERSISTED: 'CHECK_RELOAD_NOT_PERSISTED',
  DIRECT_PAY_NOT_PERSISTED: 'DIRECT_PAY_NOT_PERSISTED',
  UPDATE_ACTIVE_EFFECT_NOT_PERSISTED: 'UPDATE_ACTIVE_EFFECT_NOT_PERSISTED',
  DELETE_ACTIVE_EFFECT_NOT_PERSISTED: 'DELETE_ACTIVE_EFFECT_NOT_PERSISTED',
  APPLY_NPC_CAREER_ADVANCE_NOT_PERSISTED: 'APPLY_NPC_CAREER_ADVANCE_NOT_PERSISTED',
  ARMOURY_REPAIR_NOT_PERSISTED: 'ARMOURY_REPAIR_NOT_PERSISTED',
  AUGUR_NEXUS_NOT_PERSISTED: 'AUGUR_NEXUS_NOT_PERSISTED',
  AVAILABILITY_TEST_NOT_PERSISTED: 'AVAILABILITY_TEST_NOT_PERSISTED',
  // module_integration_v2 Phase 12 (module-backpack) — atomic round-trip verify tokens. STORAGE:
  // the game.settings-backed storage side (backpackItems/backpackActorLimit/backpackLimit/backpacks/
  // backpackSlotLocks) didn't verify on re-read. ACTOR: the actor-embedded-item side (create/delete)
  // didn't verify on re-read. Each add-item/remove-item call verifies BOTH sides (additive-first
  // ordering; the 2nd-side failure triggers a rollback of the 1st side before throwing).
  BACKPACK_STORAGE_NOT_PERSISTED: 'BACKPACK_STORAGE_NOT_PERSISTED',
  BACKPACK_ACTOR_NOT_PERSISTED: 'BACKPACK_ACTOR_NOT_PERSISTED',
  BEHAVIOR_WRITE_NOT_PERSISTED: 'BEHAVIOR_WRITE_NOT_PERSISTED',
  BOSS_SPLASH_ALREADY_ACTIVE: 'BOSS_SPLASH_ALREADY_ACTIVE',
  CARD_WRITE_NOT_PERSISTED: 'CARD_WRITE_NOT_PERSISTED',
  CARDS_WRITE_NOT_PERSISTED: 'CARDS_WRITE_NOT_PERSISTED',
  CHATMESSAGE_CLEAR_NOT_PERSISTED: 'CHATMESSAGE_CLEAR_NOT_PERSISTED',
  CHATMESSAGE_WRITE_NOT_PERSISTED: 'CHATMESSAGE_WRITE_NOT_PERSISTED',
  COMBATANT_CLEAR_INITIATIVE_NOT_PERSISTED: 'COMBATANT_CLEAR_INITIATIVE_NOT_PERSISTED',
  COMBATANT_REROLL_INITIATIVE_NOT_PERSISTED: 'COMBATANT_REROLL_INITIATIVE_NOT_PERSISTED',
  COMBATANT_SET_DEFEATED_NOT_PERSISTED: 'COMBATANT_SET_DEFEATED_NOT_PERSISTED',
  COMBATANT_SET_HIDDEN_NOT_PERSISTED: 'COMBATANT_SET_HIDDEN_NOT_PERSISTED',
  COMBATANT_SET_INITIATIVE_NOT_PERSISTED: 'COMBATANT_SET_INITIATIVE_NOT_PERSISTED',
  COMBATANT_UPDATE_NOT_PERSISTED: 'COMBATANT_UPDATE_NOT_PERSISTED',
  COMPENDIUM_FOLDER_WRITE_NOT_PERSISTED: 'COMPENDIUM_FOLDER_WRITE_NOT_PERSISTED',
  CONVERSATION_HUD_NOT_PERSISTED: 'CONVERSATION_HUD_NOT_PERSISTED',
  CREATE_ACTOR_NOT_PERSISTED: 'CREATE_ACTOR_NOT_PERSISTED',
  CREATE_ITEM_NOT_PERSISTED: 'CREATE_ITEM_NOT_PERSISTED',
  CSS_WRITE_NOT_PERSISTED: 'CSS_WRITE_NOT_PERSISTED',
  DELETE_ACTOR_NOT_PERSISTED: 'DELETE_ACTOR_NOT_PERSISTED',
  DELETE_ITEM_NOT_PERSISTED: 'DELETE_ITEM_NOT_PERSISTED',
  DISEASE_CURE_NOT_PERSISTED: 'DISEASE_CURE_NOT_PERSISTED',
  DISEASE_DECREMENT_NOT_PERSISTED: 'DISEASE_DECREMENT_NOT_PERSISTED',
  DISEASE_FINISH_NOT_PERSISTED: 'DISEASE_FINISH_NOT_PERSISTED',
  DISEASE_INCREMENT_NOT_PERSISTED: 'DISEASE_INCREMENT_NOT_PERSISTED',
  DISEASE_SYMPTOM_NOT_PERSISTED: 'DISEASE_SYMPTOM_NOT_PERSISTED',
  DISEASE_WRITE_NOT_PERSISTED: 'DISEASE_WRITE_NOT_PERSISTED',
  DOCUMENT_IO_WRITE_NOT_PERSISTED: 'DOCUMENT_IO_WRITE_NOT_PERSISTED',
  END_COMBAT_NOT_PERSISTED: 'END_COMBAT_NOT_PERSISTED',
  FILEPICKER_CREATE_DIRECTORY_NOT_PERSISTED: 'FILEPICKER_CREATE_DIRECTORY_NOT_PERSISTED',
  FOLDER_WRITE_NOT_PERSISTED: 'FOLDER_WRITE_NOT_PERSISTED',
  FXMASTER_REGION_BEHAVIOR_NOT_PERSISTED: 'FXMASTER_REGION_BEHAVIOR_NOT_PERSISTED',
  GATHERER_HARVEST_SOURCE_NOT_PERSISTED: 'GATHERER_HARVEST_SOURCE_NOT_PERSISTED',
  GATHERER_RESET_NOT_PERSISTED: 'GATHERER_RESET_NOT_PERSISTED',
  GATHERER_SPOT_FLAG_NOT_PERSISTED: 'GATHERER_SPOT_FLAG_NOT_PERSISTED',
  GMTOOLKIT_SCENE_LIGHT_NOT_PERSISTED: 'GMTOOLKIT_SCENE_LIGHT_NOT_PERSISTED',
  GMTOOLKIT_STATUS_NOT_PERSISTED: 'GMTOOLKIT_STATUS_NOT_PERSISTED',
  GMTOOLKIT_XP_NOT_PERSISTED: 'GMTOOLKIT_XP_NOT_PERSISTED',
  IMPERIAL_ARCANA_RECORD_NOT_PERSISTED: 'IMPERIAL_ARCANA_RECORD_NOT_PERSISTED',
  // module_integration_v1 Phase 3 (RC1.1b, mcp_code_quality_v2 C1) — item-piles closure-diff
  // idiom verify tokens, one per hardened write action (15 sites; wfrp-economy.ts:128 shape).
  ITEM_PILES_CREATE_NOT_PERSISTED: 'ITEM_PILES_CREATE_NOT_PERSISTED',
  ITEM_PILES_UPDATE_NOT_PERSISTED: 'ITEM_PILES_UPDATE_NOT_PERSISTED',
  ITEM_PILES_DELETE_NOT_PERSISTED: 'ITEM_PILES_DELETE_NOT_PERSISTED',
  ITEM_PILES_TOKEN_CONVERT_NOT_PERSISTED: 'ITEM_PILES_TOKEN_CONVERT_NOT_PERSISTED',
  ITEM_PILES_STATE_NOT_PERSISTED: 'ITEM_PILES_STATE_NOT_PERSISTED',
  ITEM_PILES_ADD_ITEMS_NOT_PERSISTED: 'ITEM_PILES_ADD_ITEMS_NOT_PERSISTED',
  ITEM_PILES_REMOVE_ITEMS_NOT_PERSISTED: 'ITEM_PILES_REMOVE_ITEMS_NOT_PERSISTED',
  ITEM_PILES_TRANSFER_ITEMS_NOT_PERSISTED: 'ITEM_PILES_TRANSFER_ITEMS_NOT_PERSISTED',
  ITEM_PILES_ADD_CURRENCY_NOT_PERSISTED: 'ITEM_PILES_ADD_CURRENCY_NOT_PERSISTED',
  ITEM_PILES_REMOVE_CURRENCY_NOT_PERSISTED: 'ITEM_PILES_REMOVE_CURRENCY_NOT_PERSISTED',
  ITEM_PILES_TRANSFER_CURRENCY_NOT_PERSISTED: 'ITEM_PILES_TRANSFER_CURRENCY_NOT_PERSISTED',
  ITEM_PILES_SPLIT_LOOT_NOT_PERSISTED: 'ITEM_PILES_SPLIT_LOOT_NOT_PERSISTED',
  ITEM_PILES_REFRESH_MERCHANT_NOT_PERSISTED: 'ITEM_PILES_REFRESH_MERCHANT_NOT_PERSISTED',
  ITEM_PILES_TRADE_ITEMS_NOT_PERSISTED: 'ITEM_PILES_TRADE_ITEMS_NOT_PERSISTED',
  ITEM_PILES_PRICE_MODIFIERS_NOT_PERSISTED: 'ITEM_PILES_PRICE_MODIFIERS_NOT_PERSISTED',
  JOURNAL_WRITE_NOT_PERSISTED: 'JOURNAL_WRITE_NOT_PERSISTED',
  KEYBINDING_NOT_PERSISTED: 'KEYBINDING_NOT_PERSISTED',
  LEVELS_WRITE_NOT_PERSISTED: 'LEVELS_WRITE_NOT_PERSISTED',
  MACRO_IMPORT_NOT_PERSISTED: 'MACRO_IMPORT_NOT_PERSISTED',
  MACRO_SET_TARGET_NOT_PERSISTED: 'MACRO_SET_TARGET_NOT_PERSISTED',
  MACRO_TRIGGER_NOT_PERSISTED: 'MACRO_TRIGGER_NOT_PERSISTED',
  MASTERCRAFTED_COMPONENT_NOT_PERSISTED: 'MASTERCRAFTED_COMPONENT_NOT_PERSISTED',
  MASTERCRAFTED_CONSUME_NOT_PERSISTED: 'MASTERCRAFTED_CONSUME_NOT_PERSISTED',
  MASTERCRAFTED_OWNERSHIP_NOT_PERSISTED: 'MASTERCRAFTED_OWNERSHIP_NOT_PERSISTED',
  MASTERCRAFTED_PENDING_CRAFT_NOT_PERSISTED: 'MASTERCRAFTED_PENDING_CRAFT_NOT_PERSISTED',
  MASTERCRAFTED_PRODUCT_NOT_PERSISTED: 'MASTERCRAFTED_PRODUCT_NOT_PERSISTED',
  MASTERCRAFTED_RECIPE_NOT_PERSISTED: 'MASTERCRAFTED_RECIPE_NOT_PERSISTED',
  MASTERCRAFTED_RECIPE_BOOK_NOT_PERSISTED: 'MASTERCRAFTED_RECIPE_BOOK_NOT_PERSISTED',
  MATT_ACTIONS_NOT_PERSISTED: 'MATT_ACTIONS_NOT_PERSISTED',
  MATT_CONFIG_NOT_PERSISTED: 'MATT_CONFIG_NOT_PERSISTED',
  MATT_REGION_LINK_NOT_PERSISTED: 'MATT_REGION_LINK_NOT_PERSISTED',
  MATT_TILE_NOT_PERSISTED: 'MATT_TILE_NOT_PERSISTED',
  MATT_VARIABLE_NOT_PERSISTED: 'MATT_VARIABLE_NOT_PERSISTED',
  MODIFY_ITEM_QUALITIES_NOT_PERSISTED: 'MODIFY_ITEM_QUALITIES_NOT_PERSISTED',
  MORTAL_NEEDS_NOT_PERSISTED: 'MORTAL_NEEDS_NOT_PERSISTED',
  NARRATOR_NOT_PERSISTED: 'NARRATOR_NOT_PERSISTED',
  NOTE_WRITE_NOT_PERSISTED: 'NOTE_WRITE_NOT_PERSISTED',
  OWNERSHIP_WRITE_NOT_PERSISTED: 'OWNERSHIP_WRITE_NOT_PERSISTED',
  PARTY_RESOURCES_CREATE_NOT_PERSISTED: 'PARTY_RESOURCES_CREATE_NOT_PERSISTED',
  PARTY_RESOURCES_DELETE_NOT_PERSISTED: 'PARTY_RESOURCES_DELETE_NOT_PERSISTED',
  PATROL_DRAWING_LABEL_NOT_PERSISTED: 'PATROL_DRAWING_LABEL_NOT_PERSISTED',
  PATROL_FLAG_NOT_PERSISTED: 'PATROL_FLAG_NOT_PERSISTED',
  PERCEPTIVE_NOT_PERSISTED: 'PERCEPTIVE_NOT_PERSISTED',
  PLAYLIST_BULK_IMPORT_NOT_PERSISTED: 'PLAYLIST_BULK_IMPORT_NOT_PERSISTED',
  PLAYLIST_WRITE_NOT_PERSISTED: 'PLAYLIST_WRITE_NOT_PERSISTED',
  POLYGLOT_NOT_PERSISTED: 'POLYGLOT_NOT_PERSISTED',
  // module_integration_v2 Phase 13B (module-puzzle-locks) — attach-puzzle/set-solve-macro/remove-puzzle/
  // force-unlock post-write verify (general/type flags, targeted unlockMacro path, wall ds+flag two-write).
  PUZZLE_LOCKS_NOT_PERSISTED: 'PUZZLE_LOCKS_NOT_PERSISTED',
  REGION_ADD_SHAPE_NOT_PERSISTED: 'REGION_ADD_SHAPE_NOT_PERSISTED',
  REMOVE_COMBATANTS_NOT_PERSISTED: 'REMOVE_COMBATANTS_NOT_PERSISTED',
  REGION_WRITE_NOT_PERSISTED: 'REGION_WRITE_NOT_PERSISTED',
  ROLL_INCOME_NOT_PERSISTED: 'ROLL_INCOME_NOT_PERSISTED',
  ROLL_REQUEST_NOT_PERSISTED: 'ROLL_REQUEST_NOT_PERSISTED',
  ROLLTABLE_WRITE_NOT_PERSISTED: 'ROLLTABLE_WRITE_NOT_PERSISTED',
  SCENE_CLEAR_LAYER_NOT_PERSISTED: 'SCENE_CLEAR_LAYER_NOT_PERSISTED',
  SCENE_IMPORT_NOT_PERSISTED: 'SCENE_IMPORT_NOT_PERSISTED',
  SCENE_ATMOSPHERE_TRANSITION_NOT_PERSISTED: 'SCENE_ATMOSPHERE_TRANSITION_NOT_PERSISTED',
  SCENE_LIGHTING_NOT_PERSISTED: 'SCENE_LIGHTING_NOT_PERSISTED',
  SCENE_PLACEMENT_TOKEN_NOT_PERSISTED: 'SCENE_PLACEMENT_TOKEN_NOT_PERSISTED',
  SCENE_WRITE_NOT_PERSISTED: 'SCENE_WRITE_NOT_PERSISTED',
  SET_ART_NOT_PERSISTED: 'SET_ART_NOT_PERSISTED',
  SETTING_WRITE_NOT_PERSISTED: 'SETTING_WRITE_NOT_PERSISTED',
  SIMPLE_QUEST_CONFIRM_REQUIRED: 'SIMPLE_QUEST_CONFIRM_REQUIRED',
  SIMPLE_QUEST_NOT_PERSISTED: 'SIMPLE_QUEST_NOT_PERSISTED',
  SIMPLE_QUEST_RENAME_WARNING: 'SIMPLE_QUEST_RENAME_WARNING',
  TEMPLATE_APPLY_WRITE_NOT_PERSISTED: 'TEMPLATE_APPLY_WRITE_NOT_PERSISTED',
  TILE_ZORDER_NOT_PERSISTED: 'TILE_ZORDER_NOT_PERSISTED',
  TIMEKEEPING_EVENT_FLAG_NOT_PERSISTED: 'TIMEKEEPING_EVENT_FLAG_NOT_PERSISTED',
  TIMEKEEPING_SYNC_NOT_PERSISTED: 'TIMEKEEPING_SYNC_NOT_PERSISTED',
  TOKENMAGIC_PRESET_NOT_PERSISTED: 'TOKENMAGIC_PRESET_NOT_PERSISTED',
  TOKEN_ATTACHER_CANVAS_NOT_READY: 'TOKEN_ATTACHER_CANVAS_NOT_READY',
  TOKEN_ATTACHER_NOT_PERSISTED: 'TOKEN_ATTACHER_NOT_PERSISTED',
  TOKEN_PRESENTATION_NOT_PERSISTED: 'TOKEN_PRESENTATION_NOT_PERSISTED',
  TOKEN_WRITE_NOT_PERSISTED: 'TOKEN_WRITE_NOT_PERSISTED',
  TRADE_ITEM_SOURCE_DECREMENT_NOT_PERSISTED: 'TRADE_ITEM_SOURCE_DECREMENT_NOT_PERSISTED',
  TRADE_ITEM_SOURCE_DELETE_NOT_PERSISTED: 'TRADE_ITEM_SOURCE_DELETE_NOT_PERSISTED',
  TRADE_ITEM_DEST_CREATE_NOT_PERSISTED: 'TRADE_ITEM_DEST_CREATE_NOT_PERSISTED',
  UPDATE_ACTOR_NOT_PERSISTED: 'UPDATE_ACTOR_NOT_PERSISTED',
  UPDATE_ITEM_NOT_PERSISTED: 'UPDATE_ITEM_NOT_PERSISTED',
  UPDATE_PROTOTYPE_TOKEN_NOT_PERSISTED: 'UPDATE_PROTOTYPE_TOKEN_NOT_PERSISTED',
  UPDATE_STATS_NOT_PERSISTED: 'UPDATE_STATS_NOT_PERSISTED',
  USER_WRITE_NOT_PERSISTED: 'USER_WRITE_NOT_PERSISTED',
  WFRP_ECONOMY_NOT_PERSISTED: 'WFRP_ECONOMY_NOT_PERSISTED',
  XP_TOTAL_NOT_PERSISTED: 'XP_TOTAL_NOT_PERSISTED',

  // ── Batch partial-failure signal (RC1.2, mcp_code_quality_v2 Phase C1) ──
  // A partial-success SIGNAL, NOT a `*_NOT_PERSISTED` token — deliberately omits the
  // `_NOT_PERSISTED` / `_VERIFY_FAILED` suffix so transaction-manager.ts's
  // `/NOT_PERSISTED|VERIFY_FAILED/` rollback regex does NOT match it. A partial batch success
  // has nothing to roll back: the succeeded items are real, durable writes — matching the
  // regex would attempt to roll back (and falsely claim rollback of) writes that must stay.
  // Guarded by a dedicated unit test asserting the regex never matches this literal.
  BATCH_PARTIAL_FAILURE: 'BATCH_PARTIAL_FAILURE',
} as const;

export type ErrorToken = (typeof ErrorTokens)[keyof typeof ErrorTokens];

const ERROR_TOKEN_VALUES = new Set<string>(Object.values(ErrorTokens));

/** True if `s` is exactly one of the registered error-token values. */
export function isErrorToken(s: string): s is ErrorToken {
  return ERROR_TOKEN_VALUES.has(s);
}
