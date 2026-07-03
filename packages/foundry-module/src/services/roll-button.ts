// services/roll-button.ts — MCP Code-Quality Hardening v1, Phase 4 (R4.1 + R4.2).
//
// The roll-button LIFECYCLE half of the player-roll state machine, extracted verbatim from data-access.ts
// (branch-by-abstraction Migrate; FoundryDataAccess keeps thin facade delegates until the Phase 5 Contract).
// Owns: attaching click handlers on render, the per-click processing-state guard, the awaitResult payload
// computation, the ChatMessage rolled-state update (with the non-GM→GM socket relay), and the legacy
// redirect/no-op methods. The only seam vs the original is the injected validateState callback and the
// buttonId↔messageId read routed through utils/roll-button-store (shared with RollRequestService).
//
// NOTE (Phase 4.3, R4.2): attachRollButtonHandlers was extracted verbatim in 4.2, then the listener-leak
// fix landed here — the click handler now binds via native addEventListener with a per-message AbortSignal
// plus a data-attribute sentinel, replacing the previous leaky jQuery click re-binding.

import { MODULE_ID } from '../constants.js';
import { MODULE_WARHAMMER_MCP } from '../constants/socketEvents.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { notify } from '../notify.js';
import { getRollButtonMessageId } from '../utils/roll-button-store.js';
import { verifyDocWrite } from '../utils/verifyWrite.js';

export class RollButtonService {
  constructor(private readonly validateState: () => void) {}

  /**
   * Attach click handlers to roll buttons and handle visibility
   * Called by global renderChatMessageHTML hook in main.ts
   */
  public attachRollButtonHandlers(html: any, signal?: AbortSignal): void {
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

    // The click handler (extracted to a const so it can be bound via native addEventListener below).
    const onRollButtonClick = async (event: any): Promise<void> => {
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
    };

    // Bind via native addEventListener with the per-message AbortSignal + a data-attribute sentinel
    // (Phase 4.3, R4.2). A re-render's bindMessageController() abort tears down the prior render's listener,
    // and the sentinel stops a double-attach within a single render from stacking two listeners. This replaces
    // the old jQuery click re-binding that re-attached on every render with no removal — the listener leak
    // (N listeners after N renders → N duplicate side-effects per click).
    html.find('.mcp-roll-button').each((_index: number, element: any) => {
      if (element.hasAttribute('data-warhammer-mcp-roll-handler-attached')) {
        return;
      }
      element.setAttribute('data-warhammer-mcp-roll-handler-attached', '1');
      element.addEventListener('click', onRollButtonClick, signal ? { signal } : undefined);
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
    this.validateState();

    try {
      const rollStates = game.settings.get(MODULE_ID, 'rollStates') || {};
      return rollStates[buttonId] || null;
    } catch (error) {
      console.error(`[${MODULE_ID}] Error getting roll state:`, error);
      return null;
    }
  }

  /**
   * Update the ChatMessage to replace button with rolled state
   */
  async updateRollButtonMessage(buttonId: string, userId: string, rollLabel: string): Promise<void> {
    try {

      // Get the message ID for this button
      const messageId = getRollButtonMessageId(buttonId);

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
          game.socket.emit(MODULE_WARHAMMER_MCP, {
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
      const freshMessage: any = (game.messages as any)?.get(chatMessage.id);
      verifyDocWrite(
        freshMessage,
        { content: rolledHtml, [`flags.${MODULE_ID}.rollButtons.${buttonId}.rolled`]: true },
        ErrorTokens.CHATMESSAGE_WRITE_NOT_PERSISTED,
      );


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
    this.validateState();

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
}
