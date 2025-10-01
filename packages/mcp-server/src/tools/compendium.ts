import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface CompendiumToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class CompendiumTools {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: CompendiumToolsOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'CompendiumTools' });
  }

  /**
   * Tool definitions for compendium operations
   */
  getToolDefinitions() {
    return [
      {
        name: 'search-compendium',
        description: 'Enhanced search through compendium packs for items, spells, monsters, and other content. Supports advanced filtering for creatures by Challenge Rating (D&D 5e) or threat level (WFRP 4e), creature type/species, size, and more. Perfect for encounter building and creature discovery. OPTIMIZATION TIPS: Start with broad searches using CR/threat ranges (e.g., {min: 10, max: 15}) rather than exact values. Use minimal query terms initially and rely on filters. The default limit of 50 is optimal for discovery - avoid reducing it. Search results now include key stats (CR/threat, HP/Wounds, AC/Toughness) to reduce need for detailed lookups.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query to find items in compendiums (searches names and descriptions). TIP: For creature discovery, use broad terms like "knight", "warrior", "beast", "beastman", "daemon", "greenskin" or even "*" and rely primarily on filters for specificity.',
            },
            packType: {
              type: 'string',
              description: 'Optional filter by pack type (e.g., "Item", "Actor", "JournalEntry")',
            },
            filters: {
              type: 'object',
              description: 'Advanced filters for actors/creatures (NPCs, monsters). Supports both D&D 5e and WFRP 4e systems.',
              properties: {
                challengeRating: {
                  oneOf: [
                    { type: 'number', description: 'Exact CR/threat value (e.g., 12 for D&D, or threat level for WFRP)' },
                    {
                      type: 'object',
                      properties: {
                        min: { type: 'number', description: 'Minimum CR/threat level' },
                        max: { type: 'number', description: 'Maximum CR/threat level' }
                      }
                    }
                  ]
                },
                creatureType: {
                  type: 'string',
                  description: 'Creature type/species (D&D: "humanoid", "dragon", "beast", "undead", "fey", "fiend", "celestial", "construct", "elemental", "giant", "monstrosity", "ooze", "plant", "aberration"; WFRP: "human", "dwarf", "elf", "beastman", "daemon", "greenskin", "undead", "beast", "chaos")',
                  enum: ['humanoid', 'dragon', 'beast', 'undead', 'fey', 'fiend', 'celestial', 'construct', 'elemental', 'giant', 'monstrosity', 'ooze', 'plant', 'aberration', 'human', 'dwarf', 'elf', 'halfling', 'beastman', 'daemon', 'greenskin', 'chaos', 'animal']
                },
                size: {
                  type: 'string',
                  description: 'Creature size (e.g., "medium", "large", "huge")',
                  enum: ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan']
                },
                alignment: {
                  type: 'string',
                  description: 'Creature alignment (e.g., "lawful good", "chaotic evil", "neutral")'
                },
                hasLegendaryActions: {
                  type: 'boolean',
                  description: 'Filter for creatures with legendary actions'
                },
                spellcaster: {
                  type: 'boolean',
                  description: 'Filter for creatures that can cast spells'
                }
              }
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return (default: 50 for discovery searches, max: 50)',
              minimum: 1,
              maximum: 50,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get-compendium-item',
        description: 'Retrieve detailed information about a specific compendium item. Use compact mode for UI performance when full details are not needed.',
        inputSchema: {
          type: 'object',
          properties: {
            packId: {
              type: 'string',
              description: 'ID of the compendium pack containing the item',
            },
            itemId: {
              type: 'string',
              description: 'ID of the specific item to retrieve',
            },
            compact: {
              type: 'boolean',
              description: 'Return condensed stat block (recommended for UI performance). Includes key stats, abilities, and actions but omits lengthy descriptions and technical data.',
              default: false
            },
          },
          required: ['packId', 'itemId'],
        },
      },
      {
        name: 'list-creatures-by-criteria',
        description: 'OPTIMIZED CREATURE DISCOVERY: Get a comprehensive list of creatures matching specific criteria. Perfect for encounter building - returns minimal data so Claude can use built-in monster knowledge to identify suitable creatures by name, then pull full details only for final selections. Features intelligent pack prioritization (prioritizes core game system packs - D&D 5e or WFRP 4e - then specialized content) and high result limits for complete surveys. This replaces inefficient text searches with efficient criteria-based surveys. Supports both D&D 5e and WFRP 4e systems.',
        inputSchema: {
          type: 'object',
          properties: {
            challengeRating: {
              oneOf: [
                { type: 'number', description: 'Exact CR/threat value (e.g., 12)' },
                { type: 'string', description: 'Exact CR/threat value as string (e.g., "12")' },
                {
                  type: 'object',
                  properties: {
                    min: { type: 'number', description: 'Minimum CR/threat level (default: 0)' },
                    max: { type: 'number', description: 'Maximum CR/threat level (default: 30)' }
                  },
                  description: 'CR/threat range object (e.g., {"min": 10, "max": 15})'
                }
              ],
              description: 'Filter by Challenge Rating (D&D 5e) or threat level (WFRP 4e) - accepts number, string, or range object. Use ranges for broader discovery (e.g., {"min": 10, "max": 15}) or exact values (12 or "12")'
            },
            creatureType: {
              type: 'string',
              description: 'Filter by creature type/species (D&D 5e types or WFRP 4e species)',
              enum: ['humanoid', 'dragon', 'beast', 'undead', 'fey', 'fiend', 'celestial', 'construct', 'elemental', 'giant', 'monstrosity', 'ooze', 'plant', 'aberration', 'human', 'dwarf', 'elf', 'halfling', 'beastman', 'daemon', 'greenskin', 'chaos', 'animal']
            },
            size: {
              type: 'string',
              description: 'Filter by creature size (D&D: tiny/small/medium/large/huge/gargantuan; WFRP: tiny/little/small/average/large/enormous)',
              enum: ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan', 'little', 'average', 'enormous']
            },
            hasSpells: {
              type: 'boolean',
              description: 'Filter for spellcasting creatures (D&D) or magic-using creatures (WFRP)'
            },
            hasLegendaryActions: {
              type: 'boolean',
              description: 'Filter for creatures with legendary actions (D&D) or special traits (WFRP)'
            },
            limit: {
              type: 'number',
              description: 'Maximum results to return (default: 500 for comprehensive surveys, max: 1000)',
              minimum: 1,
              maximum: 1000,
              default: 500
            }
          },
          required: []
        }
      },
      {
        name: 'list-compendium-packs',
        description: 'List all available compendium packs',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Optional filter by pack type',
            },
          },
        },
      },
    ];
  }

  async handleSearchCompendium(args: any): Promise<any> {
    const schema = z.object({
      query: z.string().min(2, 'Search query must be at least 2 characters'),
      packType: z.string().optional(),
      filters: z.object({
        challengeRating: z.union([
          z.number(),
          z.object({
            min: z.number().optional(),
            max: z.number().optional()
          })
        ]).optional(),
        creatureType: z.enum(['humanoid', 'dragon', 'beast', 'undead', 'fey', 'fiend', 'celestial', 'construct', 'elemental', 'giant', 'monstrosity', 'ooze', 'plant', 'aberration']).optional(),
        size: z.enum(['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan']).optional(),
        alignment: z.string().optional(),
        hasLegendaryActions: z.boolean().optional(),
        spellcaster: z.boolean().optional()
      }).optional(),
      limit: z.number().min(1).max(50).default(50),
    });

    // Add defensive parsing for MCP argument structure inconsistencies
    let parsedArgs;
    try {
      parsedArgs = schema.parse(args);
    } catch (zodError) {
      // Try alternative argument structures that MCP might send
      if (typeof args === 'string') {
        parsedArgs = schema.parse({ query: args });
      } else if (args && typeof args.query === 'undefined' && typeof args === 'object') {
        // Handle case where arguments might be nested differently
        const firstKey = Object.keys(args)[0];
        if (firstKey && typeof args[firstKey] === 'string') {
          parsedArgs = schema.parse({ query: args[firstKey] });
        } else {
          throw zodError;
        }
      } else {
        // Log the problematic args for debugging
        this.logger.debug('Failed to parse search args, using fallback', {
          args: typeof args === 'object' ? JSON.stringify(args) : args,
          error: zodError instanceof Error ? zodError.message : 'Unknown parsing error'
        });
        throw zodError;
      }
    }

    const { query, packType, filters, limit } = parsedArgs;

    try {
      const results = await this.foundryClient.query('foundry-mcp-bridge.searchCompendium', {
        query,
        packType,
        filters,
      });

      // Limit results
      const limitedResults = results.slice(0, limit);

      this.logger.debug('Compendium search completed', {
        query,
        totalFound: results.length,
        returned: limitedResults.length,
      });

      return {
        query,
        results: limitedResults.map((item: any) => this.formatCompendiumItem(item)),
        totalFound: results.length,
        showing: limitedResults.length,
        hasMore: results.length > limit,
      };

    } catch (error) {
      this.logger.error('Failed to search compendium', error);
      throw new Error(`Failed to search compendium: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleGetCompendiumItem(args: any): Promise<any> {
    const schema = z.object({
      packId: z.string().min(1, 'Pack ID cannot be empty'),
      itemId: z.string().min(1, 'Item ID cannot be empty'),
      compact: z.boolean().default(false),
    });

    const { packId, itemId, compact } = schema.parse(args);

    try {
      // Use the proper document retrieval method that already exists in actor creation
      const item = await this.foundryClient.query('foundry-mcp-bridge.getCompendiumDocumentFull', {
        packId: packId,
        documentId: itemId,
      });

      if (!item) {
        throw new Error(`Item ${itemId} not found in pack ${packId}`);
      }

      // Format the response using the detailed item data
      const baseResponse = {
        id: item.id,
        name: item.name,
        type: item.type,
        pack: {
          id: item.pack,
          label: item.packLabel,
        },
        description: this.extractDescription(item),
        hasImage: !!item.img,
        imageUrl: item.img,
      };

      if (compact) {
        // Compact response for UI performance
        const compactStats = this.extractCompactStats(item);
        return {
          ...baseResponse,
          stats: compactStats,
          properties: this.extractItemProperties(item),
          items: (item.items || []).slice(0, 5), // Limit items to prevent bloat
          mode: 'compact'
        };
      } else {
        // Full response
        return {
          ...baseResponse,
          fullDescription: this.extractFullDescription(item),
          system: this.sanitizeSystemData(item.system || {}),
          properties: this.extractItemProperties(item),
          items: item.items || [],
          effects: item.effects || [],
          fullData: item.fullData,
          mode: 'full'
        };
      }

    } catch (error) {
      this.logger.error('Failed to get compendium item', error);
      throw new Error(`Failed to retrieve item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleListCreaturesByCriteria(args: any): Promise<any> {
    const schema = z.object({
      challengeRating: z.union([
        // Range object - handle both native objects and JSON strings
        z.object({
          min: z.number().optional().default(0),
          max: z.number().optional().default(30)
        }),
        // JSON string that parses to range object
        z.string().refine((val) => {
          try {
            const parsed = JSON.parse(val);
            return typeof parsed === 'object' && parsed !== null &&
              (typeof parsed.min === 'number' || typeof parsed.max === 'number');
          } catch {
            return false;
          }
        }, {
          message: 'Challenge rating/threat range must be valid JSON object with min/max numbers'
        }).transform((val) => {
          const parsed = JSON.parse(val);
          return {
            min: parsed.min || 0,
            max: parsed.max || 30
          };
        }),
        // Single number
        z.number(),
        // String that converts to number (defensive parsing)
        z.string().refine((val) => !isNaN(parseFloat(val)), {
          message: 'Challenge rating/threat level must be a valid number'
        }).transform((val) => parseFloat(val))
      ]).optional(),
      creatureType: z.enum(['humanoid', 'dragon', 'beast', 'undead', 'fey', 'fiend', 'celestial', 'construct', 'elemental', 'giant', 'monstrosity', 'ooze', 'plant', 'aberration', 'human', 'dwarf', 'elf', 'halfling', 'beastman', 'daemon', 'greenskin', 'chaos', 'animal']).optional(),
      size: z.enum(['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan', 'little', 'average', 'enormous']).optional(),
      hasSpells: z.union([
        z.boolean(),
        z.string().refine((val) => ['true', 'false'].includes(val.toLowerCase()), {
          message: 'hasSpells must be true or false'
        }).transform(val => val.toLowerCase() === 'true')
      ]).optional(),
      hasLegendaryActions: z.union([
        z.boolean(),
        z.string().refine((val) => ['true', 'false'].includes(val.toLowerCase()), {
          message: 'hasLegendaryActions must be true or false'
        }).transform(val => val.toLowerCase() === 'true')
      ]).optional(),
      limit: z.union([
        z.number().min(1).max(1000),
        z.string().refine((val) => {
          const num = parseInt(val, 10);
          return !isNaN(num) && num >= 1 && num <= 1000;
        }, {
          message: 'Limit must be a number between 1 and 1000'
        }).transform(val => parseInt(val, 10))
      ]).optional().default(100), // Reduced default for better Claude Desktop exploration
    });

    let params;
    try {
      params = schema.parse(args);
      this.logger.debug('Parsed creature criteria parameters successfully', params);
    } catch (parseError) {
      this.logger.error('Failed to parse creature criteria parameters', { args, parseError });
      if (parseError instanceof z.ZodError) {
        const errorDetails = parseError.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
        throw new Error(`Parameter validation failed: ${errorDetails}. Received args: ${JSON.stringify(args)}`);
      }
      throw parseError;
    }

    try {
      const results = await this.foundryClient.query('foundry-mcp-bridge.listCreaturesByCriteria', params);

      this.logger.debug('Creature criteria search completed', {
        criteriaCount: Object.keys(params).length,
        totalFound: results.response?.creatures?.length || 0,
        limit: params.limit,
        packsSearched: results.response?.searchSummary?.packsSearched || 0
      });

      // Extract search summary for transparency
      const searchSummary = results.response?.searchSummary || {
        packsSearched: 0,
        topPacks: [],
        totalCreaturesFound: results.response?.creatures?.length || 0
      };

      return {
        creatures: (results.response?.creatures || results).map((creature: any) => this.formatCreatureListItem(creature)),
        totalFound: results.response?.creatures?.length || results.length,
        criteria: params,
        searchSummary: {
          ...searchSummary,
          searchStrategy: 'Prioritized pack search - core game system content (D&D 5e or WFRP 4e) first, then modules, then campaign-specific',
          note: 'Packs searched in priority order to find most relevant creatures first. Supports both D&D 5e and WFRP 4e systems.'
        },
        optimizationNote: 'Use creature names to identify suitable options, then call get-compendium-item for final details only'
      };

    } catch (error) {
      this.logger.error('Failed to list creatures by criteria', error);
      throw new Error(`Failed to list creatures: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleListCompendiumPacks(args: any): Promise<any> {
    const schema = z.object({
      type: z.string().optional(),
    });

    const { type } = schema.parse(args);

    this.logger.info('Listing compendium packs', { type });

    try {
      const packs = await this.foundryClient.query('foundry-mcp-bridge.getAvailablePacks');

      // Filter by type if specified
      const filteredPacks = type
        ? packs.filter((pack: any) => pack.type === type)
        : packs;

      this.logger.debug('Successfully retrieved compendium packs', {
        total: packs.length,
        filtered: filteredPacks.length,
        type
      });

      return {
        packs: filteredPacks.map((pack: any) => ({
          id: pack.id,
          label: pack.label,
          type: pack.type,
          system: pack.system,
          private: pack.private,
        })),
        total: filteredPacks.length,
        availableTypes: [...new Set(packs.map((pack: any) => pack.type))],
      };

    } catch (error) {
      this.logger.error('Failed to list compendium packs', error);
      throw new Error(`Failed to list compendium packs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatCompendiumItem(item: any): any {
    const formatted: any = {
      id: item.id,
      name: item.name,
      type: item.type,
      pack: {
        id: item.pack,
        label: item.packLabel,
      },
      description: this.extractDescription(item),
      hasImage: !!item.img,
      summary: this.createItemSummary(item),
    };

    // Add key stats for actors/creatures to reduce need for detail calls
    // Supports both D&D 5e and WFRP 4e data structures
    if (item.type === 'npc' || item.type === 'character') {
      const system = item.system || {};
      const stats: any = {};

      // Challenge Rating (D&D) or Threat Level (WFRP - calculated)
      const cr = system.details?.cr || system.cr;
      if (cr !== undefined) {
        stats.challengeRating = cr;
      } else {
        // WFRP threat calculation (Toughness + Wounds/10)
        const toughness = system.characteristics?.t?.value ?? system.characteristics?.t?.initial;
        const wounds = system.status?.wounds?.max ?? system.status?.wounds?.value;
        if (toughness !== undefined && wounds !== undefined) {
          stats.threatLevel = toughness + Math.floor(wounds / 10);
        }
      }

      // Hit Points (D&D) or Wounds (WFRP)
      const hp = system.attributes?.hp?.value || system.hp?.value;
      const maxHp = system.attributes?.hp?.max || system.hp?.max;
      const wounds = system.status?.wounds?.value;
      const maxWounds = system.status?.wounds?.max;

      if (hp !== undefined || maxHp !== undefined) {
        stats.hitPoints = { current: hp, max: maxHp };
      } else if (wounds !== undefined || maxWounds !== undefined) {
        stats.wounds = { current: wounds, max: maxWounds };
      }

      // Armor Class (D&D) or Toughness Bonus + Armor (WFRP)
      const ac = system.attributes?.ac?.value || system.ac?.value;
      if (ac !== undefined) {
        stats.armorClass = ac;
      } else {
        // WFRP Toughness Bonus + Armor
        const toughnessBonus = Math.floor((system.characteristics?.t?.value ?? 0) / 10);
        const armorPoints = system.status?.armour?.value ?? system.status?.armour?.head;
        if (toughnessBonus !== undefined || armorPoints !== undefined) {
          stats.toughnessAndArmor = { toughnessBonus, armorPoints: armorPoints || 0 };
        }
      }

      // Creature Type (D&D) or Species (WFRP)
      const creatureType = system.details?.type?.value || system.type?.value ||
        system.details?.species?.value || system.details?.species;
      if (creatureType) stats.creatureType = creatureType;

      // Size
      const size = system.traits?.size || system.size || system.details?.size;
      if (size) stats.size = size;

      // Alignment (D&D only)
      const alignment = system.details?.alignment || system.alignment;
      if (alignment) stats.alignment = alignment;

      if (Object.keys(stats).length > 0) {
        formatted.stats = stats;
      }
    }

    return formatted;
  }

  private formatDetailedCompendiumItem(item: any): any {
    const formatted = this.formatCompendiumItem(item);

    // Add more detailed information
    formatted.system = this.sanitizeSystemData(item.system || {});
    formatted.fullDescription = this.extractFullDescription(item);
    formatted.properties = this.extractItemProperties(item);

    return formatted;
  }

  private extractDescription(item: any): string {
    const system = item.system || {};

    // Try different common description fields
    const description =
      system.description?.value ||
      system.description?.content ||
      system.description ||
      system.details?.description ||
      '';

    return this.truncateText(this.stripHtml(description), 200);
  }

  private extractFullDescription(item: any): string {
    const system = item.system || {};

    const description =
      system.description?.value ||
      system.description?.content ||
      system.description ||
      system.details?.description ||
      '';

    return this.stripHtml(description);
  }

  private createItemSummary(item: any): string {
    const parts = [];

    parts.push(`${item.type} from ${item.packLabel}`);

    const system = item.system || {};

    // Add relevant summary information based on item type
    switch (item.type.toLowerCase()) {
      case 'spell':
        if (system.level) parts.push(`Level ${system.level}`);
        if (system.school) parts.push(system.school);
        break;
      case 'weapon':
        if (system.damage?.parts?.length) {
          const damage = system.damage.parts[0];
          parts.push(`${damage[0]} ${damage[1]} damage`);
        }
        break;
      case 'armor':
        if (system.armor?.value) parts.push(`AC ${system.armor.value}`);
        break;
      case 'equipment':
      case 'item':
        if (system.rarity) parts.push(system.rarity);
        if (system.price?.value) parts.push(`${system.price.value} ${system.price.denomination || 'gp'}`);
        break;
    }

    return parts.join(' • ');
  }

  private formatCreatureListItem(creature: any): any {
    const system = creature.system || {};

    // Handle both enhanced creature index data (direct properties) and raw Foundry data (system paths)
    // Supports D&D 5e and WFRP 4e
    const challengeRating = creature.challengeRating ?? system.details?.cr ?? system.cr;
    const creatureType = creature.creatureType ?? system.details?.type?.value ?? system.type?.value ??
      system.details?.species?.value ?? system.details?.species ?? 'unknown';
    const size = creature.size ?? system.traits?.size ?? system.size ?? system.details?.size ?? 'medium';

    // Use enhanced data for feature flags if available
    // D&D 5e spellcasting or WFRP magic
    const hasSpells = creature.hasSpells ?? !!(system.spells || system.attributes?.spellcasting ||
      (system.details?.spellLevel && system.details.spellLevel > 0) ||
      (system.skills && Object.values(system.skills).some((s: any) =>
        s.name?.toLowerCase().includes('magic') ||
        s.name?.toLowerCase().includes('channelling'))));

    // D&D 5e legendary actions or WFRP special traits
    const hasLegendary = creature.hasLegendaryActions ?? !!(system.resources?.legact || system.legendary ||
      (system.resources?.legres && system.resources.legres.value > 0) ||
      system.traits?.length > 0);

    // Ultra-minimal format for efficient discovery
    return {
      name: creature.name,
      id: creature.id,
      pack: { id: creature.pack, label: creature.packLabel },
      challengeRating: challengeRating,
      creatureType: creatureType,
      size: size,
      // Key feature flags for quick filtering (works for both systems)
      flags: {
        spellcaster: hasSpells,
        legendary: hasLegendary,
        undead: creatureType.toLowerCase().includes('undead'),
        dragon: creatureType.toLowerCase().includes('dragon'),
        fiend: creatureType.toLowerCase().includes('fiend') || creatureType.toLowerCase().includes('daemon'),
        chaos: creatureType.toLowerCase().includes('chaos'),
        beastman: creatureType.toLowerCase().includes('beastman')
      }
    };
  }

  private extractCompactStats(item: any): any {
    const system = item.system || {};
    const stats: any = {};

    // Core combat stats - supports both D&D 5e and WFRP 4e

    // Armor Class (D&D) or Toughness/Armor (WFRP)
    if (system.attributes?.ac?.value) {
      stats.armorClass = system.attributes.ac.value;
    } else {
      const toughnessBonus = Math.floor((system.characteristics?.t?.value ?? 0) / 10);
      const armorPoints = system.status?.armour?.value ?? system.status?.armour?.head;
      if (toughnessBonus || armorPoints) {
        stats.toughness = { bonus: toughnessBonus, armor: armorPoints || 0 };
      }
    }

    // Hit Points (D&D) or Wounds (WFRP)
    if (system.attributes?.hp?.max) {
      stats.hitPoints = system.attributes.hp.max;
    } else if (system.status?.wounds?.max) {
      stats.wounds = system.status.wounds.max;
    }

    // Challenge Rating (D&D) or Threat Level (WFRP)
    if (system.details?.cr !== undefined) {
      stats.challengeRating = system.details.cr;
    } else {
      const toughness = system.characteristics?.t?.value;
      const wounds = system.status?.wounds?.max;
      if (toughness !== undefined && wounds !== undefined) {
        stats.threatLevel = toughness + Math.floor(wounds / 10);
      }
    }

    // Basic info
    const creatureType = system.details?.type?.value || system.details?.species?.value || system.details?.species;
    if (creatureType) stats.creatureType = creatureType;

    const size = system.traits?.size || system.details?.size;
    if (size) stats.size = size;

    const alignment = system.details?.alignment;
    if (alignment) stats.alignment = alignment;

    // Key abilities (D&D) or Characteristics (WFRP)
    if (system.abilities) {
      // D&D 5e abilities
      const abilities: any = {};
      for (const [key, ability] of Object.entries(system.abilities)) {
        const abil = ability as any;
        if (abil.value !== undefined) {
          const mod = Math.floor((abil.value - 10) / 2);
          if (Math.abs(mod) >= 2) { // Only show significant modifiers
            abilities[key.toUpperCase()] = { value: abil.value, modifier: mod };
          }
        }
      }
      if (Object.keys(abilities).length > 0) stats.abilities = abilities;
    } else if (system.characteristics) {
      // WFRP 4e characteristics
      const characteristics: any = {};
      for (const [key, char] of Object.entries(system.characteristics)) {
        const c = char as any;
        if (c.value !== undefined) {
          characteristics[key.toUpperCase()] = c.value;
        }
      }
      if (Object.keys(characteristics).length > 0) stats.characteristics = characteristics;
    }

    // Speed (D&D) or Movement (WFRP)
    if (system.attributes?.movement) {
      // D&D 5e movement
      const movement = system.attributes.movement;
      const speeds: string[] = [];
      if (movement.walk) speeds.push(`${movement.walk} ft`);
      if (movement.fly) speeds.push(`fly ${movement.fly} ft`);
      if (movement.swim) speeds.push(`swim ${movement.swim} ft`);
      if (speeds.length > 0) stats.speed = speeds.join(', ');
    } else if (system.details?.move?.value) {
      // WFRP movement
      stats.movement = system.details.move.value;
    }

    return stats;
  }

  private extractItemProperties(item: any): any {
    const system = item.system || {};
    const properties: any = {};

    // Common properties across different item types
    if (system.rarity) properties.rarity = system.rarity;
    if (system.price) properties.price = system.price;
    if (system.weight) properties.weight = system.weight;
    if (system.quantity) properties.quantity = system.quantity;

    // Spell-specific properties
    if (item.type.toLowerCase() === 'spell') {
      if (system.level !== undefined) properties.spellLevel = system.level;
      if (system.school) properties.school = system.school;
      if (system.components) properties.components = system.components;
      if (system.duration) properties.duration = system.duration;
      if (system.range) properties.range = system.range;
    }

    // Weapon-specific properties
    if (item.type.toLowerCase() === 'weapon') {
      if (system.damage) properties.damage = system.damage;
      if (system.weaponType) properties.weaponType = system.weaponType;
      if (system.properties) properties.weaponProperties = system.properties;
    }

    // Armor-specific properties
    if (item.type.toLowerCase() === 'armor') {
      if (system.armor) properties.armorClass = system.armor;
      if (system.stealth) properties.stealthDisadvantage = system.stealth;
    }

    return properties;
  }

  private sanitizeSystemData(systemData: any): any {
    // Remove potentially large or unnecessary fields
    const sanitized = { ...systemData };

    // Remove large description fields (already handled separately)
    delete sanitized.description;
    delete sanitized.details;

    // Remove internal/technical fields
    delete sanitized._id;
    delete sanitized.folder;
    delete sanitized.sort;
    delete sanitized.ownership;

    return sanitized;
  }

  private stripHtml(text: string): string {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, '').trim();
  }

  private truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }
}