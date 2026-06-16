// utils/actor-lookup.ts — MCP Code-Quality Hardening v1, Phase 4 (R4.1).
//
// Shared pure actor resolver, extracted verbatim from FoundryDataAccess.findActorByIdentifier. Lives in
// utils/ (boundary-exempt) so BOTH getCharacterInfo (data-access.ts) and PlayerLookupService.findActor
// (services/player-lookup.ts) can use it without a cross-service import. Zero behavioral change.

/**
 * Find an actor by id, exact name, then partial-name substring (case-insensitive).
 */
export function findActorByIdentifier(identifier: string): any {
  return game.actors?.get(identifier) ||
    game.actors?.getName(identifier) ||
    Array.from(game.actors?.values() || []).find((a: any) =>
      a.name?.toLowerCase().includes(identifier.toLowerCase())
    );
}
