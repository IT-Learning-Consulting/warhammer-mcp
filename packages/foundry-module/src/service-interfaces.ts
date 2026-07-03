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

/**
 * Observable status of the persisted creature search index (R13.1). Returned by
 * PersistentCreatureIndex.getStatus() so diagnostics/tools can report cache freshness
 * without forcing a (possibly expensive) rebuild.
 */
export interface SearchIndexStatus {
  /** metadata.timestamp of the persisted index (ms epoch), or null if no index file is built yet. */
  builtAt: number | null;
  /** True when there is no valid persisted index — the next getEnhancedIndex() will rebuild. */
  stale: boolean;
  /** The current INDEX_VERSION the service builds against. */
  version: string;
  /** Creature count in the persisted index (0 when none built / stale). */
  totalCreatures: number;
  /** Number of pack fingerprints recorded in the persisted index (0 when none built). */
  packCount: number;
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

// Phase 5 (R5.1): scene-placement DTOs relocated here from data-access.ts so ScenePlacementService and
// FoundryDataAccess (the delegating facade) share them without a cross-service import.

export interface SceneInfo {
  id: string;
  name: string;
  img?: string;
  background?: string;
  width: number;
  height: number;
  padding: number;
  active: boolean;
  navigation: boolean;
  tokens: SceneToken[];
  walls: number;
  lights: number;
  sounds: number;
  notes: SceneNote[];
}

export interface SceneToken {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  actorId?: string;
  img: string;
  hidden: boolean;
  disposition: number;
}

export interface SceneNote {
  id: string;
  text: string;
  x: number;
  y: number;
}

export interface SceneTokenPlacement {
  actorIds: string[];
  quantities?: number[];
  placement: 'random' | 'grid' | 'center' | 'coordinates';
  hidden: boolean;
  coordinates?: { x: number; y: number }[];
  // TOOL-IDEA-004 (2026-05-14): optional sceneId targets a non-active scene.
  sceneId?: string;
}

export interface TokenPlacementResult {
  success: boolean;
  tokensCreated: number;
  tokenIds: string[];
  // TOOL-IDEA-005 (2026-05-14): structured per-token list incl. final disambiguated
  // name (Foundry auto-counter rename) + actorId for chaining.
  tokens?: { id: string; name: string; actorId: string }[];
  sceneId?: string;
  sceneName?: string;
  errors?: string[] | undefined;
  // RC1.2 (mcp_code_quality_v2 Phase C1) — additive OperationReceipt fields (operationId,
  // createdDocumentIds, updatedDocumentIds, deletedDocumentIds, warnings) + failedItems.
  // `errors` above stays verbatim (legacy shape, HC3) — failedItems is additive-only.
  operationId?: string;
  createdDocumentIds?: string[];
  updatedDocumentIds?: string[];
  deletedDocumentIds?: string[];
  warnings?: string[];
  failedItems?: Array<{ id: string; reason: string }>;
}

// Phase 7 (R7.1): actor-creation + compendium-entry DTOs relocated here from data-access.ts so
// ActorService and FoundryDataAccess (the delegating facade + the surviving getCompendiumDocumentFull
// read) share them without a cross-service import.

export interface ActorCreationRequest {
  creatureType: string;
  customNames?: string[] | undefined;
  packPreference?: string | undefined;
  quantity?: number | undefined;
  addToScene?: boolean | undefined;
}

export interface ActorCreationResult {
  success: boolean;
  actors: CreatedActorInfo[];
  errors?: string[] | undefined;
  tokensPlaced?: number;
  totalRequested: number;
  totalCreated: number;
}

export interface CreatedActorInfo {
  id: string;
  name: string;
  originalName: string;
  type: string;
  sourcePackId: string;
  sourcePackLabel: string;
  img?: string;
}

export interface CompendiumEntryFull {
  id: string;
  name: string;
  type: string;
  img?: string;
  pack: string;
  packLabel: string;
  system: Record<string, unknown>;
  items?: CompendiumItem[];
  effects?: CompendiumEffect[];
  fullData: Record<string, unknown>;
}

export interface CompendiumItem {
  id: string;
  name: string;
  type: string;
  img?: string;
  system: Record<string, unknown>;
}

export interface CompendiumEffect {
  id: string;
  name: string;
  icon?: string;
  disabled: boolean;
  duration?: Record<string, unknown>;
}
