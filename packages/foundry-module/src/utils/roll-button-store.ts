// utils/roll-button-store.ts — MCP Code-Quality Hardening v1, Phase 4 (R4.1, D5).
//
// The buttonId↔messageId persistence (game.settings 'buttonMessageMap') + the ChatMessage-flag reader,
// extracted verbatim from FoundryDataAccess. Needed by BOTH RollRequestService (write, in requestPlayerRolls)
// and RollButtonService (read, in updateRollButtonMessage) — housed as a util (not a service) so the two
// services never peer-import each other (the dep-cruiser no-cross-service-import boundary). Zero behavior change.

import { MODULE_ID } from '../constants.js';

/**
 * Save button ID to message ID mapping for ChatMessage updates
 */
export function saveRollButtonMessageId(buttonId: string, messageId: string): void {
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
export function getRollButtonMessageId(buttonId: string): string | null {
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
export function getRollStateFromMessage(chatMessage: any, buttonId: string): any {
  try {
    const rollButtons = chatMessage.getFlag(MODULE_ID, 'rollButtons');
    return rollButtons?.[buttonId] || null;
  } catch (error) {
    console.error(`[${MODULE_ID}] Error getting roll state from message:`, error);
    return null;
  }
}
