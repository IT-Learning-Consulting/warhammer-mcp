// services/compendium-search.ts — MCP Code-Quality Hardening v1, Phase 3 (R3.2).
//
// Extracted from data-access.ts: the creature/compendium search cluster. Zero behavioral change — the
// 204-line searchCompendium is decomposed into sub-cap helpers (Risk 3.B) but every branch is preserved
// verbatim (the da-compendium.snap net only covers the no-filter basic path, so the filter branch is
// moved as a predicate, not rewritten). The only logic change is the injection seam: the cross-service
// call this.persistentIndex.getEnhancedIndex() becomes this.indexReader.getEnhancedIndex() (CCR-Domain-
// Boundary — the reader contract lives in ../service-interfaces.ts, outside services/). The 67 lines of
// dead @unused prioritizePacksForCreatures + getPackPriority were dropped (user-approved).

import type {
  CompendiumSearchResult,
  CreatureIndexReader,
  EnhancedCreatureIndex,
} from '../service-interfaces.js';
import { SEARCH_RESULT_LIMIT, TOP_PACKS_LIMIT } from '../constants/toolLimits.js';

export class CompendiumSearchService {
  constructor(
    private readonly moduleId: string,
    private readonly indexReader: CreatureIndexReader,
  ) {}

  /**
   * Search compendium packs for items matching query with optional filters
   */
  async searchCompendium(query: string, packType?: string | undefined, filters?: {
    challengeRating?: number | { min?: number | undefined; max?: number | undefined } | undefined;
    creatureType?: string | undefined;
    size?: string | undefined;
    spellcaster?: boolean | undefined;
  } | undefined, itemType?: string | undefined): Promise<CompendiumSearchResult[]> {

    // Add defensive checks for query parameter
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      throw new Error('Search query must be a string with at least 2 characters');
    }

    // ENHANCED SEARCH: If we have creature-specific filters and Actor packType, use enhanced index
    const enhanced = await this.tryEnhancedCreatureSearch(packType, filters);
    if (enhanced) {
      return enhanced;
    }

    const cleanQuery = query.toLowerCase().trim();
    const searchTerms = cleanQuery.split(' ').filter(term => term && typeof term === 'string' && term.length > 0);

    if (searchTerms.length === 0) {
      throw new Error('Search query must contain valid search terms');
    }

    // Filter packs by type if specified
    const packs = this.resolveSearchPacks(packType);

    const results = await this.fanOutAcrossPacks(packs, searchTerms, filters);

    // Sort results by relevance with enhanced ranking for filtered searches
    this.rankResults(results, query, filters);

    // BUG-029 groundwork: post-filter by itemType when caller requested a specific type.
    // Full per-subtype indexing is Phase 4; this filter stops cross-type results leaking.
    const finalResults = itemType ? results.filter(r => r.type === itemType) : results;

    return finalResults.slice(0, SEARCH_RESULT_LIMIT); // Final limit
  }

  /**
   * Find best matching compendium entry for creature type.
   * Phase 4 (R3.3 / D3): relocated verbatim from FoundryDataAccess — it IS compendium-matching logic and
   * its only caller (createActorFromCompendium) now reaches it through the injected service.
   */
  async findBestCompendiumMatch(creatureType: string, packPreference?: string): Promise<CompendiumSearchResult | null> {
    // First try exact search
    const exactResults = await this.searchCompendium(creatureType, 'Actor');

    // Look for exact name match first
    const exactMatch = exactResults.find(result =>
      result.name.toLowerCase() === creatureType.toLowerCase()
    );
    if (exactMatch) return exactMatch;

    // Look for partial matches, preferring specified pack
    if (packPreference) {
      const packMatch = exactResults.find(result =>
        result.pack === packPreference
      );
      if (packMatch) return packMatch;
    }

    // Return best fuzzy match
    return exactResults.length > 0 ? exactResults[0]! : null;
  }

  /**
   * Enhanced creature-index search path. Returns mapped results, or null to fall through to the basic
   * name-index scan (when the filter/packType preconditions aren't met, the setting is off, or the
   * enhanced lookup throws). Behavior preserved verbatim from the inline block.
   */
  private async tryEnhancedCreatureSearch(packType: string | undefined, filters?: {
    challengeRating?: number | { min?: number | undefined; max?: number | undefined } | undefined;
    creatureType?: string | undefined;
    size?: string | undefined;
    spellcaster?: boolean | undefined;
  } | undefined): Promise<CompendiumSearchResult[] | null> {
    if (!(filters && packType === 'Actor' && (filters.challengeRating || filters.creatureType))) {
      return null;
    }

    // Check if enhanced creature index is enabled
    const enhancedIndexEnabled = game.settings.get(this.moduleId, 'enableEnhancedCreatureIndex');
    if (!enhancedIndexEnabled) {
      return null;
    }

    try {
      // Convert search criteria and use enhanced search
      const criteria: any = { limit: 100 }; // Default limit for search

      if (filters.challengeRating) criteria.threatLevel = filters.challengeRating;
      if (filters.creatureType) criteria.creatureType = filters.creatureType;
      if (filters.size) criteria.size = filters.size;

      const enhancedResult = await this.listCreaturesByCriteria(criteria);

      // No name filtering needed - trust the enhanced creature index!
      const filteredResults = enhancedResult.creatures;

      // Convert to CompendiumSearchResult format
      return filteredResults.map(creature => ({
        id: creature.id || creature.name,
        name: creature.name,
        type: creature.type || 'npc',
        pack: creature.pack,
        packLabel: creature.packLabel || creature.pack,
        description: creature.description || '',
        hasImage: creature.hasImage || !!creature.img,
        summary: `${creature.creatureType} from ${creature.packLabel}`,
        // Enhanced data (not part of interface but will be included)
        challengeRating: creature.challengeRating,
        creatureType: creature.creatureType,
        size: creature.size,
        hasSpecialAbilities: creature.hasSpecialAbilities
      } as CompendiumSearchResult & {
        challengeRating: number;
        creatureType: string;
        size: string;
        hasSpecialAbilities: boolean;
      }));

    } catch (error) {
      console.warn(`[${this.moduleId}] Enhanced search failed, falling back to basic search:`, error);
      // Fall through to basic search.
      return null;
    }
  }

  /**
   * Resolve which packs to scan in the basic name-index path. Excludes Scene packs for safety.
   */
  private resolveSearchPacks(packType?: string | undefined): any[] {
    return Array.from(game.packs?.values() || []).filter((pack: any) => {
      if (packType && pack.metadata?.type !== packType) {
        return false;
      }
      return pack.metadata?.type !== 'Scene'; // Exclude scene packs for safety
    });
  }

  /**
   * Scan each pack's basic compendium index for entries whose name matches every search term,
   * applying the Actor filter gate where requested. Result list is capped at 100 to bound memory.
   */
  private async fanOutAcrossPacks(packs: any[], searchTerms: string[], filters?: {
    challengeRating?: number | { min?: number | undefined; max?: number | undefined } | undefined;
    creatureType?: string | undefined;
    size?: string | undefined;
    spellcaster?: boolean | undefined;
  } | undefined): Promise<CompendiumSearchResult[]> {
    const results: CompendiumSearchResult[] = [];

    for (const pack of packs) {
      try {
        // Ensure pack index is loaded
        if (!(pack as any).indexed) {
          await (pack as any).getIndex({});
        }

        // Use basic compendium index for all searches
        const entriesToSearch = Array.from((pack as any).index?.values() || []);

        for (const entry of entriesToSearch) {
          try {
            // Type assertion and comprehensive safety checks for entry properties
            const typedEntry = entry as any;
            if (!typedEntry || !typedEntry.name || typeof typedEntry.name !== 'string' || typedEntry.name.trim().length === 0) {
              continue;
            }

            // Ensure searchTerms are valid before using them
            if (!searchTerms || !Array.isArray(searchTerms) || searchTerms.length === 0) {
              continue;
            }

            // Use already created typedEntry

            const entryNameLower = typedEntry.name.toLowerCase();
            const nameMatch = searchTerms.every(term => {
              if (!term || typeof term !== 'string') {
                return false;
              }
              return entryNameLower.includes(term);
            });

            if (nameMatch) {
              // For Actor packs with filters, use simple name/description matching
              if (!this.passesEntryFilters(entry, typedEntry, (pack as any).metadata.type, filters, searchTerms)) {
                continue;
              }

              // Standard index entry result
              results.push({
                id: typedEntry._id || '',
                name: typedEntry.name,
                type: typedEntry.type || 'unknown',
                img: typedEntry.img || undefined,
                pack: (pack as any).metadata.id,
                packLabel: (pack as any).metadata.label,
                description: typedEntry.description || '',
                hasImage: !!typedEntry.img,
                summary: `${typedEntry.type} from ${(pack as any).metadata.label}`,
              });
            }
          } catch (entryError) {
            // Log individual entry errors but continue processing
            console.warn(`[${this.moduleId}] Error processing entry in pack ${(pack as any).metadata.id}:`, entryError);
            continue;
          }

          // Limit results per pack to prevent overwhelming responses
          if (results.length >= 100) break;
        }
      } catch (error) {
        console.warn(`[${this.moduleId}] Failed to search pack ${(pack as any).metadata.id}:`, error);
      }

      // Global limit to prevent memory issues
      if (results.length >= 100) break;
    }

    return results;
  }

  /**
   * Apply the Actor filter gate to a candidate entry. Returns true to keep the entry (no gate applies,
   * or the entry matches the derived criteria), false to skip it. Verbatim from the inline filter block.
   */
  private passesEntryFilters(entry: any, typedEntry: any, packMetadataType: string, filters: {
    challengeRating?: number | { min?: number | undefined; max?: number | undefined } | undefined;
    creatureType?: string | undefined;
    size?: string | undefined;
    spellcaster?: boolean | undefined;
  } | undefined, searchTerms: string[]): boolean {
    if (!(filters && this.shouldApplyFilters(entry, filters) && packMetadataType === 'Actor')) {
      return true;
    }

    // Convert filters to search criteria for compatibility
    const searchCriteria: any = {};

    if (filters.challengeRating) {
      // BUG-266: use a distinct name to avoid shadowing the outer searchTerms.
      const crTerms: string[] = [...searchTerms];
      if (typeof filters.challengeRating === 'number') {
        if (filters.challengeRating >= 15) {
          crTerms.push('ancient', 'legendary', 'elder', 'greater');
        } else if (filters.challengeRating >= 10) {
          crTerms.push('adult', 'warlord', 'champion', 'master');
        } else if (filters.challengeRating >= 5) {
          crTerms.push('captain', 'knight', 'priest', 'mage');
        } else {
          crTerms.push('guard', 'soldier', 'warrior', 'scout');
        }
      }
      searchCriteria.searchTerms = crTerms;
    }

    if (filters.creatureType) {
      const typeTerms = [filters.creatureType];
      if (filters.creatureType.toLowerCase() === 'humanoid') {
        typeTerms.push('human', 'elf', 'dwarf', 'orc', 'goblin');
      }
      searchCriteria.searchTerms = [...(searchCriteria.searchTerms || []), ...typeTerms];
    }

    return this.matchesSearchCriteria(typedEntry, searchCriteria);
  }

  /**
   * Sort search results in place by relevance: exact name matches first, then filter-match quality
   * (when filters present), then alphabetical. Verbatim from the inline results.sort().
   */
  private rankResults(results: CompendiumSearchResult[], query: string, filters?: {
    challengeRating?: number | { min?: number | undefined; max?: number | undefined } | undefined;
    creatureType?: string | undefined;
    size?: string | undefined;
    spellcaster?: boolean | undefined;
  } | undefined): void {
    results.sort((a, b) => {
      // Exact name matches first
      const aExact = a.name.toLowerCase() === query.toLowerCase();
      const bExact = b.name.toLowerCase() === query.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // If filters are used, prioritize by filter match quality
      if (filters) {
        const aScore = this.calculateRelevanceScore(a, filters, query);
        const bScore = this.calculateRelevanceScore(b, filters, query);
        if (aScore !== bScore) return bScore - aScore; // Higher score first
      }

      // Fallback to alphabetical
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Check if filters should be applied to this entry
   */
  private shouldApplyFilters(entry: any, filters: any): boolean {
    // Only apply filters to Actor entries (which includes NPCs/monsters)
    if (entry.type !== 'npc' && entry.type !== 'character') {
      return false;
    }

    // Check if any filters are actually specified
    return Object.keys(filters).some(key => filters[key] !== undefined);
  }

  /**
   * Calculate relevance score for search result ranking
   */
  private calculateRelevanceScore(entry: any, _filters: any, query: string): number {
    let score = 0;

    // Bonus for common creature names (better for encounters)
    const commonNames = ['knight', 'warrior', 'guard', 'soldier', 'mage', 'priest', 'bandit', 'orc', 'goblin', 'dragon'];
    const lowerName = entry.name.toLowerCase();
    if (commonNames.some(name => lowerName.includes(name))) {
      score += 5;
    }

    // Bonus for query term matches in name
    const queryTerms = query.toLowerCase().split(' ');
    for (const term of queryTerms) {
      if (term.length > 2 && lowerName.includes(term)) {
        score += 3;
      }
    }

    return score;
  }

  /**
   * List creatures by criteria using enhanced persistent index - optimized for instant filtering
   */
  async listCreaturesByCriteria(criteria: {
    threatLevel?: number | { min?: number | undefined; max?: number | undefined } | undefined;
    creatureType?: string | undefined;
    size?: string | undefined;
    hasSpells?: boolean | undefined;
    hasSpecialAbilities?: boolean | undefined;
    limit?: number | undefined;
  }): Promise<{ creatures: any[], searchSummary: any }> {

    const limit = criteria.limit || 500;

    // Check if enhanced creature index is enabled
    const enhancedIndexEnabled = game.settings.get(this.moduleId, 'enableEnhancedCreatureIndex');

    if (!enhancedIndexEnabled) {
      return this.fallbackBasicCreatureSearch(criteria, limit);
    }

    try {

      // Get enhanced creature index (builds if needed)
      const enhancedCreatures = await this.indexReader.getEnhancedIndex();

      // Apply filters to enhanced data
      let filteredCreatures = enhancedCreatures.filter(creature => this.passesEnhancedCriteria(creature, criteria));


      // Sort by CR then name for consistent ordering
      filteredCreatures.sort((a, b) => {
        if (a.challengeRating !== b.challengeRating) {
          return a.challengeRating - b.challengeRating; // Lower CR first
        }
        return a.name.localeCompare(b.name);
      });

      // Apply limit
      if (filteredCreatures.length > limit) {
        filteredCreatures = filteredCreatures.slice(0, limit);
      }

      // Convert enhanced creatures to result format
      const results = filteredCreatures.map(creature => ({
        id: creature.id,
        name: creature.name,
        type: creature.type,
        pack: creature.pack,
        packLabel: creature.packLabel,
        description: creature.description || '',
        hasImage: !!creature.img,
        summary: `${creature.creatureType} from ${creature.packLabel}`,
        // Include enhanced data for better sorting and display
        challengeRating: creature.challengeRating,
        creatureType: creature.creatureType,
        size: creature.size,
        wounds: creature.wounds,
        toughness: creature.toughness,
        hasSpells: creature.hasSpells,
        hasSpecialAbilities: creature.hasSpecialAbilities
      }));

      return {
        creatures: results,
        searchSummary: this.buildSearchSummary(results, enhancedCreatures, criteria)
      };

    } catch (error) {
      console.error(`[${this.moduleId}] Enhanced creature search failed:`, error);
      // Fallback to basic search if enhanced index fails
      return this.fallbackBasicCreatureSearch(criteria, limit);
    }
  }

  /**
   * Build the searchSummary block for an enhanced-index listing (pack distribution + index metadata).
   * Verbatim from the inline summary computation.
   */
  private buildSearchSummary(results: any[], enhancedCreatures: EnhancedCreatureIndex[], criteria: any): any {
    // Calculate pack distribution for summary
    const packResults = new Map();
    results.forEach(creature => {
      const count = packResults.get(creature.packLabel) || 0;
      packResults.set(creature.packLabel, count + 1);
    });

    // Get unique pack information
    const uniquePacks = Array.from(new Set(enhancedCreatures.map(c => c.pack)));
    const topPacks = uniquePacks.slice(0, TOP_PACKS_LIMIT).map(packId => {
      const sampleCreature = enhancedCreatures.find(c => c.pack === packId);
      return {
        id: packId,
        label: sampleCreature?.packLabel || 'Unknown Pack',
        priority: 100 // All packs are prioritized equally in enhanced index
      };
    });

    if (packResults.size > 0) {
    }

    return {
      packsSearched: uniquePacks.length,
      topPacks,
      totalCreaturesFound: results.length,
      resultsByPack: Object.fromEntries(packResults),
      criteria: criteria,
      indexMetadata: {
        totalIndexedCreatures: enhancedCreatures.length,
        searchMethod: 'enhanced_persistent_index'
      }
    };
  }

  /**
   * Check if enhanced creature passes all specified criteria
   */
  private passesEnhancedCriteria(creature: EnhancedCreatureIndex, criteria: {
    threatLevel?: number | { min?: number | undefined; max?: number | undefined } | undefined;
    creatureType?: string | undefined;
    size?: string | undefined;
    hasSpells?: boolean | undefined;
    hasSpecialAbilities?: boolean | undefined;
  }): boolean {

    // Challenge Rating filter
    if (criteria.threatLevel !== undefined) {
      if (typeof criteria.threatLevel === 'number') {
        if (creature.challengeRating !== criteria.threatLevel) {
          return false;
        }
      } else if (typeof criteria.threatLevel === 'object') {
        const { min, max } = criteria.threatLevel;
        if (min !== undefined && creature.challengeRating < min) {
          return false;
        }
        if (max !== undefined && creature.challengeRating > max) {
          return false;
        }
      }
    }

    // Creature Type filter
    if (criteria.creatureType) {
      if (creature.creatureType.toLowerCase() !== criteria.creatureType.toLowerCase()) {
        return false;
      }
    }

    // Size filter
    if (criteria.size) {
      if (creature.size.toLowerCase() !== criteria.size.toLowerCase()) {
        return false;
      }
    }

    // Spellcaster filter
    if (criteria.hasSpells !== undefined) {
      if (creature.hasSpells !== criteria.hasSpells) {
        return false;
      }
    }

    // Special Abilities filter (WFRP traits/abilities)
    if (criteria.hasSpecialAbilities !== undefined) {
      if (creature.hasSpecialAbilities !== criteria.hasSpecialAbilities) {
        return false;
      }
    }

    return true;
  }

  /**
   * Fallback to basic creature search if enhanced index fails
   */
  private async fallbackBasicCreatureSearch(criteria: any, limit: number): Promise<{ creatures: any[], searchSummary: any }> {
    console.warn(`[${this.moduleId}] Falling back to basic search due to enhanced index failure`);

    // Use a simple text-based search as fallback
    const searchTerms: string[] = [];

    if (criteria.creatureType) {
      searchTerms.push(criteria.creatureType);
    }

    if (criteria.threatLevel) {
      if (typeof criteria.threatLevel === 'number') {
        // Add CR-based name patterns as fallback
        if (criteria.threatLevel >= 15) searchTerms.push('ancient', 'legendary');
        else if (criteria.threatLevel >= 10) searchTerms.push('adult', 'champion');
        else if (criteria.threatLevel >= 5) searchTerms.push('captain', 'knight');
      }
    }

    const searchQuery = searchTerms.join(' ') || 'monster';
    const basicResults = await this.searchCompendium(searchQuery, 'Actor');

    return {
      creatures: basicResults.slice(0, limit),
      searchSummary: {
        packsSearched: 0,
        topPacks: [],
        totalCreaturesFound: basicResults.length,
        resultsByPack: {},
        criteria: criteria,
        fallback: true,
        searchMethod: 'basic_fallback'
      }
    };
  }

  /**
   * Simple name/description-based matching for creatures using index data only
   */
  private matchesSearchCriteria(entry: any, criteria: {
    searchTerms?: string[];
    excludeTerms?: string[];
    size?: string;
    hasSpells?: boolean;
    hasSpecialAbilities?: boolean;
  }): boolean {
    const name = (entry.name || '').toLowerCase();
    const description = (entry.description || '').toLowerCase();
    const searchText = `${name} ${description}`;

    // Include terms - at least one must match
    if (criteria.searchTerms && criteria.searchTerms.length > 0) {
      const hasMatch = criteria.searchTerms.some(term =>
        searchText.includes(term.toLowerCase())
      );
      if (!hasMatch) {
        return false;
      }
    }

    // Exclude terms - none should match
    if (criteria.excludeTerms && criteria.excludeTerms.length > 0) {
      const hasExcluded = criteria.excludeTerms.some(term =>
        searchText.includes(term.toLowerCase())
      );
      if (hasExcluded) {
        return false;
      }
    }

    return true;
  }
}
