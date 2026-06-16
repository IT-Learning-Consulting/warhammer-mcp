// services/player-lookup.ts — MCP Code-Quality Hardening v1, Phase 4 (R4.1).
//
// Player/actor lookup helpers extracted verbatim from data-access.ts (branch-by-abstraction Migrate;
// FoundryDataAccess keeps thin facade delegates until the Phase 5 Contract). The only seam is the injected
// validateState callback and findActorByIdentifier routed through utils/actor-lookup (shared with
// getCharacterInfo without a cross-service import). Zero behavioral change.

import { MODULE_ID } from '../constants.js';
import { findActorByIdentifier } from '../utils/actor-lookup.js';

export class PlayerLookupService {
  constructor(private readonly validateState: () => void) {}

  /**
   * Get friendly NPCs from current scene
   */
  async getFriendlyNPCs(): Promise<Array<{ id: string, name: string }>> {
    this.validateState();

    try {
      const scene = game.scenes?.find(s => s.active);
      if (!scene) {
        return [];
      }

      const friendlyTokens = scene.tokens.filter((token: any) =>
        token.disposition === 1 // FRIENDLY disposition
      );

      return friendlyTokens.map((token: any) => ({
        id: token.actor?.id || token.id || '',
        name: token.name || token.actor?.name || 'Unknown',
      })).filter(t => t.id);
    } catch (error) {
      console.error(`[${MODULE_ID}] Error getting friendly NPCs:`, error);
      return [];
    }
  }

  /**
   * Get party characters (player-owned actors)
   */
  async getPartyCharacters(): Promise<Array<{ id: string, name: string }>> {
    this.validateState();

    try {
      const partyCharacters = Array.from(game.actors?.values() || []).filter((actor: any) =>
        actor.hasPlayerOwner && actor.type === 'character'
      );

      return partyCharacters.map((actor: any) => ({
        id: actor.id || '',
        name: actor.name || 'Unknown',
      })).filter(c => c.id);
    } catch (error) {
      console.error(`[${MODULE_ID}] Error getting party characters:`, error);
      return [];
    }
  }

  /**
   * Get connected players (excluding GM)
   */
  async getConnectedPlayers(): Promise<Array<{ id: string, name: string }>> {
    this.validateState();

    try {
      const connectedPlayers = Array.from(game.users?.values() || []).filter((user: any) =>
        user.active && !user.isGM
      );

      return connectedPlayers.map((user: any) => ({
        id: user.id || '',
        name: user.name || 'Unknown',
      })).filter(u => u.id);
    } catch (error) {
      console.error(`[${MODULE_ID}] Error getting connected players:`, error);
      return [];
    }
  }

  /**
   * Find players by identifier with partial matching
   */
  async findPlayers(data: { identifier: string; allowPartialMatch?: boolean; includeCharacterOwners?: boolean }): Promise<Array<{ id: string, name: string }>> {
    this.validateState();

    try {
      const { identifier, allowPartialMatch = true, includeCharacterOwners = true } = data;
      const searchTerm = identifier.toLowerCase();
      const players = [];

      // Direct user name matching
      for (const user of Array.from(game.users?.values() || [])) {
        if ((user as any).isGM) continue;

        const userName = (user as any).name?.toLowerCase() || '';
        if (userName === searchTerm || (allowPartialMatch && userName.includes(searchTerm))) {
          players.push({ id: (user as any).id || '', name: (user as any).name || 'Unknown' });
        }
      }

      // Character name matching (find owner of character)
      if (includeCharacterOwners && players.length === 0) {
        for (const actor of Array.from(game.actors?.values() || [])) {
          if ((actor as any).type !== 'character') continue;

          const actorName = (actor as any).name?.toLowerCase() || '';
          if (actorName === searchTerm || (allowPartialMatch && actorName.includes(searchTerm))) {
            // Find the player owner of this character
            const owner = Array.from(game.users?.values() || []).find((user: any) =>
              (actor as any).testUserPermission(user, 'OWNER') && !user.isGM
            );

            if (owner && !players.some(p => p.id === (owner as any).id)) {
              players.push({ id: (owner as any).id || '', name: (owner as any).name || 'Unknown' });
            }
          }
        }
      }

      return players.filter(p => p.id);
    } catch (error) {
      console.error(`[${MODULE_ID}] Error finding players:`, error);
      return [];
    }
  }

  /**
   * Find single actor by identifier
   */
  async findActor(data: { identifier: string }): Promise<{ id: string, name: string } | null> {
    this.validateState();

    try {
      const actor = findActorByIdentifier(data.identifier);
      return actor ? { id: actor.id, name: actor.name } : null;
    } catch (error) {
      console.error(`[${MODULE_ID}] Error finding actor:`, error);
      return null;
    }
  }
}
