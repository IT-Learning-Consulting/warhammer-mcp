// service-interfaces.ts — MCP Code-Quality Hardening v1, Phase 3 (R3.1 / R3.2, CCR-Domain-Boundary).
//
// Cross-service contracts + shared service DTOs. This file lives OUTSIDE src/services/ on purpose:
// the dependency-cruiser `no-cross-service-import` rule forbids one services/<svc>.ts from importing
// another (even type-only, because tsPreCompilationDeps:true follows type imports). Housing the shared
// types here lets both creature-index.ts and compendium-search.ts import them without tripping the
// boundary — exactly as data-access.ts imports from ../constants.js. No imports of its own → no cycle.

/**
 * Read-only contract the compendium-search service needs from the creature index.
 * PersistentCreatureIndex satisfies this structurally (no `implements` import required), and
 * FoundryDataAccess injects an adapter that resolves its live `persistentIndex` field at call time.
 */
export interface CreatureIndexReader {
  getEnhancedIndex(): Promise<EnhancedCreatureIndex[]>;
}

/**
 * Enhanced creature data stored in creature index
 * Uses WFRP 4e characteristics
 */
export interface EnhancedCreatureIndex {
  id: string;
  name: string;
  type: string;
  pack: string;
  packLabel: string;
  challengeRating: number;  // For WFRP: calculated threat (Toughness + Wounds/10)
  creatureType: string;  // Species in WFRP (human, beast, daemon, etc.)
  size: string;
  wounds: number;  // WFRP wounds
  toughness: number;  // WFRP toughness bonus + armor
  hasSpells: boolean;
  hasSpecialAbilities: boolean;  // WFRP traits/abilities
  description?: string;
  img?: string;
}

export interface PersistentIndexMetadata {
  version: string;
  timestamp: number;
  packFingerprints: Map<string, PackFingerprint>;
  totalCreatures: number;
}

export interface PackFingerprint {
  packId: string;
  packLabel: string;
  lastModified: number;
  documentCount: number;
  checksum: string;
}

export interface PersistentEnhancedIndex {
  metadata: PersistentIndexMetadata;
  creatures: EnhancedCreatureIndex[];
}

export interface CompendiumSearchResult {
  id: string;
  name: string;
  type: string;
  img?: string;
  pack: string;
  packLabel: string;
  system?: Record<string, unknown>;
  summary?: string;
  hasImage?: boolean;
  description?: string;
}
