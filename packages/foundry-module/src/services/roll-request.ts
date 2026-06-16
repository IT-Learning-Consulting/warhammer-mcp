// services/roll-request.ts — MCP Code-Quality Hardening v1, Phase 4 (R4.1).
//
// The player-roll REQUEST half of the roll-button state machine, extracted verbatim from data-access.ts
// (branch-by-abstraction Migrate; FoundryDataAccess keeps thin facade delegates until the Phase 5 Contract
// step). Builds the interactive roll-button ChatMessage from a roll request. Zero behavioral change — the
// only seam is the injected validateState callback (was this.validateFoundryState) and the buttonId↔messageId
// write routed through utils/roll-button-store (shared with RollButtonService without a cross-service import).

import { MODULE_ID } from '../constants.js';
import { notify } from '../notify.js';
import { saveRollButtonMessageId } from '../utils/roll-button-store.js';

export class RollRequestService {
  constructor(private readonly validateState: () => void) {}

  /**
   * Request player rolls - creates interactive roll buttons in chat
   */
  async requestPlayerRolls(data: {
    rollType: string;
    rollTarget: string;
    targetPlayer: string;
    isPublic: boolean;
    rollModifier: string;
    flavor: string;
  }): Promise<{ success: boolean; requestId?: string; message: string; error?: string }> {
    this.validateState();

    try {
      // Resolve target player from character name or player name with enhanced error handling
      const playerInfo = this.resolveTargetPlayer(data.targetPlayer);
      if (!playerInfo.found) {
        // Provide structured error message for MCP that Claude Desktop can understand
        const errorMessage = playerInfo.errorMessage || `Could not find player or character: ${data.targetPlayer}`;

        return {
          success: false,
          message: '',
          error: errorMessage
        };
      }

      // Build roll formula based on type and target
      const rollFormula = this.buildRollFormula(data.rollType, data.rollTarget, data.rollModifier, playerInfo.character);

      // Generate roll button HTML
      const buttonId = (foundry.utils as any).randomID();
      const requestId = (foundry.utils as any).randomID();
      const buttonLabel = this.buildRollButtonLabel(data.rollType, data.rollTarget, data.isPublic);

      // Check if this type of roll was already performed (optional: could check for duplicate recent rolls)
      // For now, we'll just create the button and let the rendering logic handle the state restoration


      const rollButtonHtml = `
        <div class="mcp-roll-request" style="margin: 12px 0; padding: 12px; border: 1px solid #ccc; border-radius: 8px; background: #f9f9f9;">
          <p><strong>Roll Request:</strong> ${buttonLabel}</p>
          <p><strong>Target:</strong> ${playerInfo.targetName} ${playerInfo.character ? `(${playerInfo.character.name})` : ''}</p>
          ${data.flavor ? `<p><strong>Context:</strong> ${data.flavor}</p>` : ''}

          <div style="text-align: center; margin-top: 8px;">
            <!-- Single Roll Button (clickable by both character owner and GM) -->
            <button class="mcp-roll-button mcp-button-active"
                    data-button-id="${buttonId}"
                    data-roll-formula="${rollFormula}"
                    data-roll-label="${buttonLabel}"
                    data-is-public="${data.isPublic}"
                    data-character-id="${playerInfo.character?.id || ''}"
                    data-target-user-id="${playerInfo.user?.id || ''}"
                    data-request-id="${requestId}">
              🎲 ${buttonLabel}
            </button>
          </div>
        </div>
      `;

      // Create chat message with roll button
      // For PUBLIC rolls: both roll request and results visible to all players
      // For PRIVATE rolls: both roll request and results visible to target player + GM only
      const whisperTargets: string[] = [];

      if (!data.isPublic) {
        // Private roll request: whisper to target player + GM only

        // Always whisper to the character owner if they exist
        if (playerInfo.user?.id) {
          whisperTargets.push(playerInfo.user.id);
        }

        // Also send to GM (GMs can see all whispered messages anyway, but this ensures they see it)
        const gmUsers = game.users?.filter((u: User) => u.isGM && u.active);
        if (gmUsers) {
          for (const gm of gmUsers) {
            if (gm.id && !whisperTargets.includes(gm.id)) {
              whisperTargets.push(gm.id);
            }
          }
        }
      } else {
        // Public roll request: visible to all players (empty whisperTargets array)
      }

      const messageData = {
        content: rollButtonHtml,
        // BUG-267: game.user is a User, not an Actor; use the user's assigned character instead.
        speaker: ChatMessage.getSpeaker({ actor: (game.user as any)?.character ?? null }),
        style: (CONST as any).CHAT_MESSAGE_STYLES?.OTHER || 0, // Use style instead of deprecated type
        whisper: whisperTargets,
        flags: {
          [MODULE_ID]: {
            requestId,
            rollButtons: {
              [buttonId]: {
                rolled: false,
                rollFormula: rollFormula,
                rollLabel: buttonLabel,
                isPublic: data.isPublic,
                characterId: playerInfo.character?.id || '',
                targetUserId: playerInfo.user?.id || ''
              }
            }
          }
        }
      };

      const chatMessage = await ChatMessage.create(messageData);

      // Store message ID for later updates
      saveRollButtonMessageId(buttonId, chatMessage.id);

      // Note: Click handlers are attached globally via renderChatMessageHTML hook in main.ts
      // This ensures all users get the handlers when they see the message

      notify.created('mcp', 'Roll request', {
        summary: `to ${data.targetPlayer}: ${data.rollType}`,
      });

      return {
        success: true,
        requestId,
        message: `Roll request sent to ${playerInfo.targetName}. ${data.isPublic ? 'Public roll' : 'Private roll'} button created in chat.`
      };

    } catch (error) {
      notify.error('Failed to create roll request', error instanceof Error ? error : new Error(String(error)));
      return {
        success: false,
        message: '',
        error: error instanceof Error ? error.message : 'Unknown error creating roll request'
      };
    }
  }

  /**
   * Enhanced player resolution with offline/non-existent player detection
   * Supports partial matching and provides structured error messages for MCP
   */
  private resolveTargetPlayer(targetPlayer: string): {
    found: boolean;
    user?: User;
    character?: Actor;
    targetName: string;
    errorType?: 'PLAYER_OFFLINE' | 'PLAYER_NOT_FOUND' | 'CHARACTER_NOT_FOUND';
    errorMessage?: string;
  } {
    const searchTerm = targetPlayer.toLowerCase().trim();


    // FIRST: Check all registered users (both active and inactive) for player name match
    const allUsers = Array.from(game.users?.values() || []);

    // Try exact player name match first (active and inactive users)
    let user = allUsers.find((u: User) =>
      u.name?.toLowerCase() === searchTerm
    );

    if (user) {
      const isActive = user.active;

      if (!isActive) {
        // Player exists but is offline
        return {
          found: false,
          user,
          targetName: user.name || 'Unknown Player',
          errorType: 'PLAYER_OFFLINE',
          errorMessage: `Player "${user.name}" is registered but not currently logged in. They need to be online to receive roll requests.`
        };
      }

      // Find the player's character for roll calculations
      const playerCharacter = game.actors?.find((actor: Actor) => {
        if (!user) return false;
        return actor.testUserPermission(user, 'OWNER') && !user.isGM;
      });

      return {
        found: true,
        user,
        ...(playerCharacter && { character: playerCharacter }), // Include character only if found
        targetName: user.name || 'Unknown Player'
      };
    }

    // Try partial player name match (active and inactive users)
    if (!user) {
      user = allUsers.find((u: User) => {
        return Boolean(u.name && u.name.toLowerCase().includes(searchTerm));
      });

      if (user) {
        const isActive = user.active;

        if (!isActive) {
          // Player exists but is offline
          return {
            found: false,
            user,
            targetName: user.name || 'Unknown Player',
            errorType: 'PLAYER_OFFLINE',
            errorMessage: `Player "${user.name}" is registered but not currently logged in. They need to be online to receive roll requests.`
          };
        }

        // Find the player's character for roll calculations
        const playerCharacter = game.actors?.find((actor: Actor) => {
          if (!user) return false;
          return actor.testUserPermission(user, 'OWNER') && !user.isGM;
        });

        return {
          found: true,
          user,
          ...(playerCharacter && { character: playerCharacter }), // Include character only if found
          targetName: user.name || 'Unknown Player'
        };
      }
    }

    // SECOND: Try to find by character name (exact match, then partial match)
    let character = game.actors?.find((actor: Actor) =>
      actor.name?.toLowerCase() === searchTerm && actor.hasPlayerOwner
    );

    if (character) {
    }

    // If no exact character match, try partial match
    if (!character) {
      character = game.actors?.find((actor: Actor) => {
        return Boolean(actor.name && actor.name.toLowerCase().includes(searchTerm) && actor.hasPlayerOwner);
      });

      if (character) {
      }
    }

    if (character) {
      // Find the actual player owner (not GM) of this character
      const ownerUser = allUsers.find((u: User) =>
        character.testUserPermission(u, 'OWNER') && !u.isGM
      );

      if (ownerUser) {
        const isOwnerActive = ownerUser.active;

        if (!isOwnerActive) {
          // Character owner exists but is offline
          return {
            found: false,
            user: ownerUser,
            character,
            targetName: ownerUser.name || 'Unknown Player',
            errorType: 'PLAYER_OFFLINE',
            errorMessage: `Player "${ownerUser.name}" (owner of character "${character.name}") is registered but not currently logged in. They need to be online to receive roll requests.`
          };
        }

        return {
          found: true,
          user: ownerUser,
          character,
          targetName: ownerUser.name || 'Unknown Player'
        };
      } else {
        // No player owner found - character is GM-only controlled
        // Still return found=true but without user, GM can still roll for it
        return {
          found: true,
          character,
          targetName: character.name || 'Unknown Character'
          // user is omitted (undefined) for GM-only characters
        };
      }
    }

    // THIRD: Check if the search term might be a character that exists but has no player owner
    const anyCharacter = game.actors?.find((actor: Actor) => {
      if (!actor.name) return false;
      return actor.name.toLowerCase() === searchTerm ||
        actor.name.toLowerCase().includes(searchTerm);
    });

    if (anyCharacter && !anyCharacter.hasPlayerOwner) {
      return {
        found: true,
        character: anyCharacter,
        targetName: anyCharacter.name || 'Unknown Character'
        // No user for GM-controlled characters
      };
    }

    // No player or character found at all

    return {
      found: false,
      targetName: targetPlayer,
      errorType: 'PLAYER_NOT_FOUND',
      errorMessage: `No player or character named "${targetPlayer}" found. Available players: ${allUsers.filter(u => !u.isGM).map(u => u.name).join(', ') || 'none'}`
    };
  }

  /**
   * Build roll formula based on roll type and target using Foundry's roll data system
   * WFRP 4e specific implementation
   */
  private buildRollFormula(rollType: string, rollTarget: string, rollModifier: string, character?: Actor): string {
    let baseFormula = '1d100<=50';

    // Only support WFRP 4e
    const gameSystem = game.system?.id || '';
    const isWFRP = gameSystem.includes('wfrp');

    if (!isWFRP) {
      console.warn(`[${MODULE_ID}] Non-WFRP system detected. This module only supports WFRP 4e.`);
      return '1d100<=50';
    }

    if (character) {
      // Use Foundry's getRollData() to get calculated modifiers including active effects
      const rollData = character.getRollData() as any; // Type assertion for Foundry's dynamic roll data

      // WFRP 4e uses d100 system with characteristics and skills
      switch (rollType) {
        case 'characteristic':
        case 'ability':
          // WFRP characteristics (WS, BS, S, T, I, Ag, Dex, Int, WP, Fel)
          const charCode = this.getWFRPCharacteristicCode(rollTarget);
          const charValue = rollData.characteristics?.[charCode]?.value ??
            (character as any).system?.characteristics?.[charCode]?.value ?? 50;
          baseFormula = `1d100<=${charValue}`;
          break;

        case 'skill':
          // BUG-271: wfrp4e skills are embedded Items, not system.skills entries.
          // Read the computed total from the item's system.total.value.
          const skillName = rollTarget.toLowerCase();
          const skillItem = (character as any).items?.find(
            (i: any) => i.type === 'skill' && i.name?.toLowerCase() === skillName
          ) as any;
          const skillValue = skillItem?.system?.total?.value ?? 50;
          baseFormula = `1d100<=${skillValue}`;
          break;

        case 'custom':
          baseFormula = rollTarget; // Use rollTarget as the formula directly
          break;

        default:
          baseFormula = '1d100<=50'; // Default WFRP roll
      }
    } else {
      console.warn(`[${MODULE_ID}] No character provided for roll formula, using base 1d100<=50`);
      baseFormula = '1d100<=50';
    }

    // BUG-331: for roll-under formulas the modifier adjusts the TARGET, not the roll —
    // Foundry's v13 parser drops the `<=NN` clause and would fold an appended modifier
    // into the d100 arithmetic (displayed total = die + modifier). Fold flat modifiers
    // into the target number; non-d100 custom formulas keep the arithmetic append.
    if (rollModifier && rollModifier.trim()) {
      const modifier = rollModifier.startsWith('+') || rollModifier.startsWith('-') ? rollModifier : `+${rollModifier}`;
      const rollUnder = /^1d100<=(\d+)$/.exec(baseFormula);
      const flat = parseInt(modifier, 10);
      if (rollUnder && Number.isFinite(flat)) {
        baseFormula = `1d100<=${Math.max(0, parseInt(rollUnder[1]!, 10) + flat)}`;
      } else {
        baseFormula += modifier;
      }
    }

    return baseFormula;
  }

  /**
   * Map WFRP characteristic names to codes
   */
  private getWFRPCharacteristicCode(charName: string): string {
    const charMap: { [key: string]: string } = {
      'weapon skill': 'ws',
      'weaponskill': 'ws',
      'ws': 'ws',
      'ballistic skill': 'bs',
      'ballisticskill': 'bs',
      'bs': 'bs',
      'strength': 's',
      's': 's',
      'toughness': 't',
      't': 't',
      'initiative': 'i',
      'i': 'i',
      'agility': 'ag',
      'ag': 'ag',
      'dexterity': 'dex',
      'dex': 'dex',
      'intelligence': 'int',
      'int': 'int',
      'willpower': 'wp',
      'wp': 'wp',
      'fellowship': 'fel',
      'fel': 'fel'
    };

    const normalized = charName.toLowerCase().replace(/\s+/g, '');
    // BUG-377: charMap is a plain object literal, so charMap[normalized] for a prototype-key
    // ('constructor', '__proto__', 'tostring', 'valueof', 'hasownproperty') resolves to a truthy
    // Object.prototype member and bypasses the `|| 'ws'` fallback, returning a non-string. Guard
    // with hasOwnProperty so only real entries are returned and everything else falls back to 'ws'.
    const code = Object.prototype.hasOwnProperty.call(charMap, normalized) ? charMap[normalized] : undefined;
    return code ?? 'ws'; // Default to weapon skill
  }

  /**
   * Build roll button label
   */
  private buildRollButtonLabel(rollType: string, rollTarget: string, isPublic: boolean): string {
    const visibility = isPublic ? 'Public' : 'Private';

    switch (rollType) {
      case 'ability':
        return `${rollTarget.toUpperCase()} Ability Check (${visibility})`;
      case 'skill':
        return `${rollTarget.charAt(0).toUpperCase() + rollTarget.slice(1)} Skill Check (${visibility})`;
      case 'attack':
        return `${rollTarget} Attack (${visibility})`;
      case 'initiative':
        return `Initiative Roll (${visibility})`;
      case 'custom':
        return `Custom Roll (${visibility})`;
      default:
        return `Roll (${visibility})`;
    }
  }
}
