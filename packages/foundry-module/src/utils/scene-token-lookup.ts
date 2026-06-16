// utils/scene-token-lookup.ts — MCP Code-Quality Hardening v1, Phase 5 (R5.1).
//
// Shared pure scene-token resolver. Lives in utils/ (boundary-exempt) so BOTH ScenePlacementService
// and CombatService can use it without a cross-service import (dep-cruiser no-cross-service-import).
// Extracted from the inline `scene.tokens.find(...)` read in CombatService.addCombatants. Mirrors the
// utils/actor-lookup.ts pattern. Zero behavioral change.

/**
 * Find the first token on a scene whose actorId matches (the scene's representation of an actor).
 */
export function findSceneTokenByActorId(scene: any, actorId: string): any {
  return scene?.tokens?.find((t: any) => t.actorId === actorId) ?? null;
}
