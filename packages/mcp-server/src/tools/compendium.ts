import { z } from 'zod';
import { SearchCompendiumOutput, SEARCH_COMPENDIUM_OUTPUT_JSON_SCHEMA, ItemId, PackId } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface CompendiumToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class CompendiumTools extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  /**
   * Tool definitions for compendium operations
   */
  getToolDefinitions() {
    return [
      {
        name: 'search-compendium',
        title: 'Search Compendium',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        description: 'Enhanced search through compendium packs for items, spells, monsters, and other WFRP 4e content. Supports advanced filtering for creatures by threat level (Toughness + Wounds/10), creature species, size, and more. Perfect for encounter building and creature discovery. OPTIMIZATION TIPS: Start with broad searches using threat ranges (e.g., {min: 10, max: 15}) rather than exact values. Use minimal query terms initially and rely on filters. The default limit of 50 is optimal for discovery - avoid reducing it. Search results include key stats (threat, Wounds, Toughness) to reduce need for detailed lookups. Note: filters is creature-only and silently ignored for Actor/JournalEntry/Item searches that don\'t match creature shapes. packType must be top-level — placing it inside filters now throws an error with corrective guidance.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query to find items in compendiums (searches names and descriptions). Must be at least 2 characters. TIP: For creature discovery, use broad terms like "knight", "warrior", "beast", "beastman", "daemon", "greenskin" and rely primarily on filters for specificity.',
            },
            packType: {
              type: 'string',
              description: 'Optional filter by pack type (e.g., "Item", "Actor", "JournalEntry")',
            },
            filters: {
              type: 'object',
              description: 'Advanced filters for actors/creatures (NPCs, monsters). WFRP 4e specific.',
              properties: {
                challengeRating: {
                  oneOf: [
                    { type: 'number', description: 'Exact threat level (WFRP: Toughness + Wounds/10)' },
                    {
                      type: 'object',
                      properties: {
                        min: { type: 'number', description: 'Minimum threat level' },
                        max: { type: 'number', description: 'Maximum threat level' }
                      }
                    }
                  ]
                },
                creatureType: {
                  type: 'string',
                  description: 'Creature species (WFRP 4e: "human", "dwarf", "elf", "halfling", "beastman", "daemon", "greenskin", "undead", "beast", "chaos")',
                  enum: ['human', 'dwarf', 'elf', 'halfling', 'beastman', 'daemon', 'greenskin', 'undead', 'beast', 'chaos', 'animal']
                },
                size: {
                  type: 'string',
                  description: 'Creature size — WFRP4e short-form keys (avg, ltl, sml, lrg, enor, mnst, tiny). Matches system.details.size.value storage.',
                  enum: ['tiny', 'ltl', 'sml', 'avg', 'lrg', 'enor', 'mnst']
                },
                spellcaster: {
                  type: 'boolean',
                  description: 'Filter for creatures that can cast spells or use magic'
                },
                hasSpecialAbilities: {
                  type: 'boolean',
                  description: 'Filter for creatures that have special traits or abilities (WFRP 4e)'
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
        outputSchema: SEARCH_COMPENDIUM_OUTPUT_JSON_SCHEMA,
      },
      {
        name: 'get-compendium-item',
        title: 'Get Compendium Item',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
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
        title: 'List Creatures By Criteria',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        description: 'OPTIMIZED CREATURE DISCOVERY: Get a comprehensive list of creatures matching specific criteria. Perfect for encounter building - returns minimal data so Claude can use built-in monster knowledge to identify suitable creatures by name, then pull full details only for final selections. Features intelligent pack prioritization (prioritizes WFRP 4e core packs, then specialized content) and high result limits for complete surveys. This replaces inefficient text searches with efficient criteria-based surveys. WFRP 4e specific.',
        inputSchema: {
          type: 'object',
          properties: {
            threatLevel: {
              oneOf: [
                { type: 'number', description: 'Exact WFRP4e threat level (TB + Wounds ÷ 10; integer 0-100)' },
                { type: 'string', description: 'Exact threat level as string' },
                {
                  type: 'object',
                  properties: {
                    min: { type: 'number', description: 'Minimum threat level (default: 0)' },
                    max: { type: 'number', description: 'Maximum threat level (default: 30)' }
                  },
                  description: 'Threat level range object (e.g., {"min": 10, "max": 15})'
                }
              ],
              description: 'WFRP4e threat level (TB + Wounds ÷ 10; integer 0-100). Accepts a single value, range object {min, max}, or omit for any level.'
            },
            creatureType: {
              type: 'string',
              description: 'Creature species/type — WFRP4e freeform (e.g. "human", "goblin", "beastman", "skeleton", "wolf"). Stored in system.details.species.value; matched case-insensitively. Common values: Human, Dwarf, Halfling, High Elf, Wood Elf, Beastman, Daemon, Greenskin, Goblin, Orc, Undead, Skaven, Construct, Animal. Module/world authors may write any string.'
            },
            size: {
              type: 'string',
              description: 'Creature size — WFRP4e short-form (avg=average, ltl=little, sml=small, lrg=large, enor=enormous, mnst=monstrous, tiny=tiny). Matches system.details.size.value storage.',
              enum: ['tiny', 'ltl', 'sml', 'avg', 'lrg', 'enor', 'mnst']
            },
            hasSpells: {
              type: 'boolean',
              description: 'Filter for magic-using creatures (WFRP 4e channelling/spells)'
            },
            hasSpecialAbilities: {
              type: 'boolean',
              description: 'Filter for creatures with special traits/abilities (WFRP 4e)'
            },
            limit: {
              type: 'number',
              description: 'Maximum results to return (default: 100, max: 1000)',
              minimum: 1,
              maximum: 1000,
              default: 100
            },
            compact: {
              type: 'boolean',
              description: 'BUG-365: when true, each entry is id/name/type/pack only (omits threatLevel, creatureType, size, flags). Cuts payload ~80% at high limits — a full limit=500 list otherwise runs ~167k chars and can overflow context. Use to survey names, then call get-compendium-item for details on the final picks. Default: false.',
              default: false
            }
          },
          required: []
        }
      },
      {
        name: 'list-compendium-packs',
        title: 'List Compendium Packs',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
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
        creatureType: z.enum(['human', 'dwarf', 'elf', 'halfling', 'beastman', 'daemon', 'greenskin', 'undead', 'beast', 'chaos', 'animal']).optional(),
        size: z.enum(['tiny', 'ltl', 'sml', 'avg', 'lrg', 'enor', 'mnst']).optional(),
        spellcaster: z.boolean().optional(),
        hasSpecialAbilities: z.boolean().optional()
      }).optional(),
      limit: z.number().min(1).max(50).default(50),
    });

    // Reject misplaced packType inside filters with corrective guidance (EVAL-008).
    if (args && typeof args === 'object' && args.filters && typeof args.filters === 'object' && 'packType' in args.filters) {
      throw new Error(
        'search-compendium: packType must be a top-level argument, not inside `filters`. ' +
        'Move it: { query: "...", packType: "Actor", filters: { creatureType: "..." } }. ' +
        '`filters` is creature-only and silently ignored for non-creature searches.'
      );
    }

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
      const results = await this.query<any>('searchCompendium', {
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

      const output = {
        query,
        results: limitedResults.map((item: any) => this.formatCompendiumItem(item)),
        totalFound: results.length,
        showing: limitedResults.length,
        hasMore: results.length > limit,
      };
      SearchCompendiumOutput.parse(output);
      return {
        content: [{ type: 'text', text: JSON.stringify(output) }],
        structuredContent: output,
      };

    } catch (error) {
      this.logger.error('Failed to search compendium', error);
      throw new Error(`Failed to search compendium: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleGetCompendiumItem(args: any): Promise<any> {
    const schema = z.object({
      packId: PackId,
      itemId: ItemId,
      compact: z.boolean().default(false),
    });

    const { packId, itemId, compact } = schema.parse(args);

    try {
      // Use the proper document retrieval method that already exists in actor creation
      const item = await this.query<any>('getCompendiumDocumentFull', {
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
        // Compact response for UI performance.
        // TOOL-IDEA-008 (2026-05-14): tighter compact — items are name-only summaries
        // (no nested .system tree, no embedded effects). Previous behavior kept the full
        // item subtree (including system.description.value HTML and system.effects[].changes
        // script payloads) which defeated the point of "compact".
        const compactStats = this.extractCompactStats(item);
        const compactItems = (item.items || []).slice(0, 5).map((it: any) => ({
          id: it.id,
          name: it.name,
          type: it.type,
          img: it.img,
        }));
        return {
          ...baseResponse,
          stats: compactStats,
          properties: this.extractItemProperties(item),
          items: compactItems,
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
      threatLevel: z.union([
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
          message: 'Threat level range must be valid JSON object with min/max numbers'
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
          message: 'Threat level must be a valid number'
        }).transform((val) => parseFloat(val))
      ]).optional(),
      creatureType: z.string().optional(),
      size: z.enum(['tiny', 'ltl', 'sml', 'avg', 'lrg', 'enor', 'mnst']).optional(),
      hasSpells: z.union([
        z.boolean(),
        z.string().refine((val) => ['true', 'false'].includes(val.toLowerCase()), {
          message: 'hasSpells must be true or false'
        }).transform(val => val.toLowerCase() === 'true')
      ]).optional(),
      hasSpecialAbilities: z.union([
        z.boolean(),
        z.string().refine((val) => ['true', 'false'].includes(val.toLowerCase()), {
          message: 'hasSpecialAbilities must be true or false'
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
      compact: z.boolean().optional().default(false), // BUG-365: trim per-entry payload at high limits
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
      // BUG-365: compact is a response-shaping flag only — strip it before the query so it
      // never contaminates the foundry-module criteria object.
      const { compact, ...queryParams } = params;
      const results = await this.query<any>('listCreaturesByCriteria', queryParams);

      this.logger.debug('Creature criteria search completed', {
        criteriaCount: Object.keys(queryParams).length,
        totalFound: results?.creatures?.length || 0,
        limit: params.limit,
        packsSearched: results?.searchSummary?.packsSearched || 0
      });

      // foundry-client.ts:54-84 is the single envelope unwrap site — `results`
      // here is already `envelope.data`, so creatures + searchSummary are
      // top-level fields (NOT under `.data` or `.response`).
      const searchSummary = results?.searchSummary || {
        packsSearched: 0,
        topPacks: [],
        totalCreaturesFound: results?.creatures?.length || 0
      };

      return {
        creatures: Array.isArray(results?.creatures)
          ? results.creatures.map((creature: any) =>
              compact
                // BUG-365: compact entry — id/name/type/pack only (~40 bytes vs ~334). Survey
                // names at high limits, then get-compendium-item for details on the final picks.
                ? { id: creature.id, name: creature.name, type: creature.type, pack: creature.pack }
                : this.formatCreatureListItem(creature))
          : [],
        totalCount: Array.isArray(results?.creatures) ? results.creatures.length : 0,
        criteria: queryParams,
        searchSummary: {
          ...searchSummary,
          searchStrategy: 'Prioritized pack search - WFRP 4e core content first, then modules, then campaign-specific',
          note: 'Packs searched in priority order to find most relevant creatures first. WFRP 4e specific.'
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
      const packs = await this.query<any>('getAvailablePacks');

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
    // WFRP 4e specific data structures
    if (item.type === 'npc' || item.type === 'character') {
      const system = item.system || {};
      const stats: any = {};

      // Threat Level (WFRP: Toughness + Wounds/10)
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

      // WFRP Wounds
      const wounds = system.status?.wounds?.value;
      const maxWounds = system.status?.wounds?.max;

      if (wounds !== undefined || maxWounds !== undefined) {
        stats.wounds = { current: wounds, max: maxWounds };
      }

      // WFRP Toughness Bonus + Armor
      const toughnessBonus = Math.floor((system.characteristics?.t?.value ?? 0) / 10);
      const armorPoints = system.status?.armour?.value ?? system.status?.armour?.head?.value;
      if (toughnessBonus !== undefined || armorPoints !== undefined) {
        stats.toughnessAndArmor = { toughnessBonus, armorPoints: armorPoints || 0 };
      }

      // Species (WFRP)
      const creatureType = system.details?.species?.value || system.details?.species ||
        system.details?.type?.value || system.type?.value;
      if (creatureType) stats.creatureType = creatureType;

      // Size
      const size = system.traits?.size || system.size || system.details?.size;
      if (size) stats.size = size;

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
    // WFRP 4e specific
    const threatLevel = creature.challengeRating ?? system.details?.cr ?? system.cr;
    const creatureType = creature.creatureType ?? system.details?.type?.value ?? system.type?.value ??
      system.details?.species?.value ?? system.details?.species ?? 'unknown';
    const size = creature.size ?? system.traits?.size ?? system.size ?? system.details?.size ?? 'avg';

    // Use enhanced data for feature flags if available
    // WFRP magic detection
    const hasSpells = creature.hasSpells ?? !!(system.spells || system.attributes?.spellcasting ||
      (system.details?.spellLevel && system.details.spellLevel > 0) ||
      (system.skills && Object.values(system.skills).some((s: any) =>
        s.name?.toLowerCase().includes('magic') ||
        s.name?.toLowerCase().includes('channelling'))));

    // WFRP special traits/abilities
    const hasSpecial = creature.hasSpecialAbilities ?? !!(system.traits?.special || system.special ||
      (system.traits && Object.keys(system.traits).length > 0));

    // Ultra-minimal format for efficient discovery
    return {
      name: creature.name,
      id: creature.id,
      pack: { id: creature.pack, label: creature.packLabel },
      threatLevel: threatLevel,
      creatureType: creatureType,
      size: size,
      // Key feature flags for quick filtering (WFRP specific)
      flags: {
        spellcaster: hasSpells,
        specialAbilities: hasSpecial,
        undead: creatureType.toLowerCase().includes('undead'),
        daemon: creatureType.toLowerCase().includes('daemon'),
        chaos: creatureType.toLowerCase().includes('chaos'),
        beastman: creatureType.toLowerCase().includes('beastman'),
        greenskin: creatureType.toLowerCase().includes('greenskin') || creatureType.toLowerCase().includes('orc')
      }
    };
  }

  private extractCompactStats(item: any): any {
    const system = item.system || {};
    const stats: any = {};

    // Core combat stats - WFRP 4e

    // Toughness/Armor (WFRP)
    const toughnessBonus = Math.floor((system.characteristics?.t?.value ?? 0) / 10);
    const armorPoints = system.status?.armour?.value ?? system.status?.armour?.head?.value;
    if (toughnessBonus || armorPoints) {
      stats.toughness = { bonus: toughnessBonus, armor: armorPoints || 0 };
    }

    // Wounds (WFRP)
    if (system.status?.wounds?.max) {
      stats.wounds = system.status.wounds.max;
    }

    // Threat Level (WFRP)
    const toughness = system.characteristics?.t?.value;
    const wounds = system.status?.wounds?.max;
    if (toughness !== undefined && wounds !== undefined) {
      stats.threatLevel = toughness + Math.floor(wounds / 10);
    }

    // Basic info
    const creatureType = system.details?.species?.value || system.details?.species ||
      system.details?.type?.value;
    if (creatureType) stats.creatureType = creatureType;

    const size = system.traits?.size || system.details?.size;
    if (size) stats.size = size;

    // Characteristics (WFRP)
    if (system.characteristics) {
      const characteristics: any = {};
      for (const [key, char] of Object.entries(system.characteristics)) {
        const c = char as any;
        if (c.value !== undefined) {
          characteristics[key.toUpperCase()] = c.value;
        }
      }
      if (Object.keys(characteristics).length > 0) stats.characteristics = characteristics;
    }

    // Movement (WFRP)
    if (system.details?.move?.value) {
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