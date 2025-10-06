import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface CharacterToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class CharacterTools {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: CharacterToolsOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'CharacterTools' });
  }

  /**
   * Tool: get-character
   * Retrieve detailed information about a specific character
   * WFRP 4e specific
   */
  getToolDefinitions() {
    return [
      {
        name: 'get-character',
        description: 'Retrieve detailed information about a specific character by name or ID. WFRP 4e specific (characteristics, wounds, toughness, skills, talents, traits).',
        inputSchema: {
          type: 'object',
          properties: {
            identifier: {
              type: 'string',
              description: 'Character name or ID to look up',
            },
          },
          required: ['identifier'],
        },
      },
      {
        name: 'list-characters',
        description: 'List all available characters with basic information. WFRP 4e specific.',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Optional filter by character type (e.g., "character", "npc")',
            },
          },
        },
      },
      {
        name: 'foundry-update-character-info',
        description: 'Directly set character stats to specific values (GM override tool - no restrictions). Use this for quick stat changes, character creation, testing, or corrections where you just need to SET a value without ceremony or bounds checking. For AWARDING bonus Fortune/Fate with proper narrative (increments with bounds), use foundry-add-fortune-point or foundry-add-fate-point instead. Use natural language like "set", "change", "update to [number]". Example: "Set Hans\' fate to 3" or "Change strength to 45"',
        inputSchema: {
          type: 'object',
          properties: {
            identifier: {
              type: 'string',
              description: 'Character name or ID to update',
            },
            updates: {
              type: 'object',
              description: 'Object containing fields to update. Sets exact values with no restrictions or bounds checking. Examples: {"strength": 40} sets initial Strength to 40, {"currentWounds": 10} sets current wounds, {"fortune": 2, "fate": 3} sets fortune and fate values',
              properties: {
                // Characteristics (initial values, not advances)
                weaponSkill: { type: 'number', description: 'Weapon Skill initial value (0-100)' },
                ballisticSkill: { type: 'number', description: 'Ballistic Skill initial value (0-100)' },
                strength: { type: 'number', description: 'Strength initial value (0-100)' },
                toughness: { type: 'number', description: 'Toughness initial value (0-100)' },
                initiative: { type: 'number', description: 'Initiative initial value (0-100)' },
                agility: { type: 'number', description: 'Agility initial value (0-100)' },
                dexterity: { type: 'number', description: 'Dexterity initial value (0-100)' },
                intelligence: { type: 'number', description: 'Intelligence initial value (0-100)' },
                willpower: { type: 'number', description: 'Willpower initial value (0-100)' },
                fellowship: { type: 'number', description: 'Fellowship initial value (0-100)' },
                // Status values
                currentWounds: { type: 'number', description: 'Current wounds value (direct set, no bounds)' },
                fortune: { type: 'number', description: 'Fortune points current value (direct set - for awarding bonus Fortune with bounds checking, use foundry-add-fortune-point)' },
                fate: { type: 'number', description: 'Fate points current value (direct set - for epic achievements with ceremony, use foundry-add-fate-point)' },
                resilience: { type: 'number', description: 'Resilience points (max value)' },
                resolve: { type: 'number', description: 'Resolve points (max value)' },
              },
            },
          },
          required: ['identifier', 'updates'],
        },
      },
      {
        name: 'foundry-update-skill-talent',
        description: 'Update skill or talent advances directly without XP costs (GM adjustment tool). Use this to set skill/talent values directly for character creation, corrections, or GM adjustments. For XP-based advancement, use advance-skill or advance-talent tools instead.',
        inputSchema: {
          type: 'object',
          properties: {
            characterName: {
              type: 'string',
              description: 'Character name or ID to update',
            },
            itemName: {
              type: 'string',
              description: 'Name of the skill or talent to update (e.g., "Melee (Basic)", "Warrior Born", "Dodge")',
            },
            itemType: {
              type: 'string',
              enum: ['skill', 'talent'],
              description: 'Type of item to update: "skill" or "talent"',
            },
            advances: {
              type: 'number',
              description: 'New advance value to set directly. For skills: number of advances (e.g., 10). For talents: rank/times taken (e.g., 2 for rank 2)',
              minimum: 0,
            },
          },
          required: ['characterName', 'itemName', 'itemType', 'advances'],
        },
      },
      {
        name: 'add-skill-talent',
        description: 'Add a skill or talent to a character from the WFRP 4e compendium. Searches compendiums for the skill/talent by name and adds it with all official effects and mechanics. Use this when a character learns a new skill or gains a talent. For custom skills/talents not in compendiums, will create a basic entry if search fails. Example: "Add Melee (Basic) skill to Hans" or "Add Warrior Born talent to Gustav"',
        inputSchema: {
          type: 'object',
          properties: {
            characterName: {
              type: 'string',
              description: 'Character name or ID',
            },
            itemName: {
              type: 'string',
              description: 'Name of the skill or talent to add (will search compendiums first)',
            },
            itemType: {
              type: 'string',
              enum: ['skill', 'talent'],
              description: 'Type of item to add: "skill" or "talent"',
            },
          },
          required: ['characterName', 'itemName', 'itemType'],
        },
      },
    ];
  }

  async handleGetCharacter(args: any): Promise<any> {
    const schema = z.object({
      identifier: z.string().min(1, 'Character identifier cannot be empty'),
    });

    const { identifier } = schema.parse(args);

    this.logger.info('Getting character information', { identifier });

    try {
      const characterData = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
        characterName: identifier,
      });

      this.logger.debug('Successfully retrieved character data', {
        characterId: characterData.id,
        characterName: characterData.name
      });

      // Format the response for Claude
      return this.formatCharacterResponse(characterData);

    } catch (error) {
      this.logger.error('Failed to get character information', error);
      throw new Error(`Failed to retrieve character "${identifier}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleListCharacters(args: any): Promise<any> {
    const schema = z.object({
      type: z.string().optional(),
    });

    const { type } = schema.parse(args);

    this.logger.info('Listing characters', { type });

    try {
      const actors = await this.foundryClient.query('foundry-mcp-bridge.listActors', { type });

      this.logger.debug('Successfully retrieved character list', { count: actors.length });

      // Format the response for Claude
      return {
        characters: actors.map((actor: any) => ({
          id: actor.id,
          name: actor.name,
          type: actor.type,
          hasImage: !!actor.img,
        })),
        total: actors.length,
        filtered: type ? `Filtered by type: ${type}` : 'All characters',
      };

    } catch (error) {
      this.logger.error('Failed to list characters', error);
      throw new Error(`Failed to list characters: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatCharacterResponse(characterData: any): any {
    const response = {
      id: characterData.id,
      name: characterData.name,
      type: characterData.type,
      basicInfo: this.extractBasicInfo(characterData),
      stats: this.extractStats(characterData),
      items: this.formatItems(characterData.items || []),
      effects: this.formatEffects(characterData.effects || []),
      hasImage: !!characterData.img,
    };

    return response;
  }

  private extractBasicInfo(characterData: any): any {
    const system = characterData.system || {};
    const items = characterData.items || [];

    // Extract common fields that exist across different game systems
    const basicInfo: any = {};

    // Detect game system based on data structure
    const isWFRP = !!(system.characteristics || system.status?.wounds);

    if (isWFRP) {
      // WFRP 4e system
      if (system.status?.wounds) {
        basicInfo.wounds = {
          current: system.status.wounds.value,
          max: system.status.wounds.max,
        };
      }

      // Fortune and Fate (using correct value property, no max on these - they're set by Fate/Resilience)
      if (system.status?.fortune !== undefined) {
        basicInfo.fortune = system.status.fortune.value || 0;
      }

      if (system.status?.fate !== undefined) {
        basicInfo.fate = system.status.fate.value || 0;
      }

      // Resilience and Resolve (new in WFRP4e)
      if (system.status?.resilience !== undefined) {
        basicInfo.resilience = system.status.resilience.value || 0;
      }

      if (system.status?.resolve !== undefined) {
        basicInfo.resolve = system.status.resolve.value || 0;
      }

      // Corruption
      if (system.status?.corruption) {
        basicInfo.corruption = {
          current: system.status.corruption.value || 0,
          max: system.status.corruption.max || 0,
        };
      }

      // Critical Wounds (count critical wound items)
      const criticalWounds = items.filter((item: any) => item.type === 'critical');
      if (criticalWounds.length > 0) {
        basicInfo.criticalWounds = {
          count: criticalWounds.length,
          wounds: criticalWounds.map((crit: any) => ({
            name: crit.name,
            location: crit.system?.location?.value || 'unknown',
            severity: crit.system?.wounds?.value || 0,
            description: this.truncateText(crit.system?.description?.value || '', 100),
          })),
        };
      }

      // Money (filter and sum money items correctly)
      const moneyItems = items.filter((item: any) => item.type === 'money');
      if (moneyItems.length > 0) {
        basicInfo.money = {};
        for (const moneyItem of moneyItems) {
          // Use item name as key (e.g., "Gold Crown", "Silver Shilling", "Brass Penny")
          const quantity = moneyItem.system?.quantity?.value || 0;
          if (quantity > 0) {
            basicInfo.money[moneyItem.name] = quantity;
          }
        }
      }

      // Toughness Bonus + Armor Points
      if (system.characteristics?.t) {
        const toughnessBonus = Math.floor((system.characteristics.t.value || 0) / 10);
        const armorPoints = system.status?.armour?.value || system.status?.armour?.head || 0;
        basicInfo.toughness = {
          bonus: toughnessBonus,
          armorPoints: armorPoints,
          total: toughnessBonus + armorPoints
        };
      }

      // Species
      if (system.details?.species?.value) {
        basicInfo.species = system.details.species.value;
      }

      // Career
      if (system.details?.career?.value) {
        basicInfo.career = system.details.career.value;
      }

      // Status/Class
      if (system.details?.status?.value) {
        basicInfo.status = system.details.status.value;
      }

      // Experience
      if (system.details?.experience) {
        basicInfo.experience = {
          current: system.details.experience.current || 0,
          total: system.details.experience.total || 0,
          spent: system.details.experience.spent || 0,
        };
      }

    } else {
      // Non-WFRP system - limited data extraction
      if (system.attributes) {
        if (system.attributes.hp) {
          basicInfo.hitPoints = {
            current: system.attributes.hp.value,
            max: system.attributes.hp.max,
            temp: system.attributes.hp.temp || 0,
          };
        }
        if (system.attributes.ac) {
          basicInfo.armorClass = system.attributes.ac.value;
        }
      }

      // Level information
      if (system.details?.level?.value) {
        basicInfo.level = system.details.level.value;
      } else if (system.level) {
        basicInfo.level = system.level;
      }

      // Class information
      if (system.details?.class) {
        basicInfo.class = system.details.class;
      }

      // Race/ancestry information
      if (system.details?.race) {
        basicInfo.race = system.details.race;
      } else if (system.details?.ancestry) {
        basicInfo.ancestry = system.details.ancestry;
      }
    }

    return basicInfo;
  }

  private extractStats(characterData: any): any {
    const system = characterData.system || {};
    const stats: any = {};

    // Detect game system based on data structure
    const isWFRP = !!(system.characteristics || system.status?.wounds);

    if (isWFRP) {
      // WFRP 4e Characteristics (WS, BS, S, T, I, Ag, Dex, Int, WP, Fel)
      if (system.characteristics) {
        stats.characteristics = {};
        const charMap: any = {
          ws: 'Weapon Skill',
          bs: 'Ballistic Skill',
          s: 'Strength',
          t: 'Toughness',
          i: 'Initiative',
          ag: 'Agility',
          dex: 'Dexterity',
          int: 'Intelligence',
          wp: 'Willpower',
          fel: 'Fellowship'
        };

        for (const [key, characteristic] of Object.entries(system.characteristics)) {
          if (typeof characteristic === 'object' && characteristic !== null) {
            const char = characteristic as any;
            stats.characteristics[key.toUpperCase()] = {
              name: charMap[key] || key.toUpperCase(),
              initial: char.initial || 0,
              advances: char.advances || 0,
              value: char.value || char.initial || 0,
              bonus: Math.floor((char.value || char.initial || 0) / 10)
            };
          }
        }
      }

      // WFRP Skills - Extract from items array (skills are items in WFRP4e)
      const items = characterData.items || [];
      const skillItems = items.filter((item: any) => item.type === 'skill');

      if (skillItems.length > 0) {
        stats.skills = {};
        for (const skill of skillItems) {
          const skillSystem = skill.system || {};
          stats.skills[skill.name] = {
            characteristic: skillSystem.characteristic?.key || skillSystem.characteristic?.value || '',
            advances: skillSystem.advances?.value || 0,
            total: skillSystem.total?.value || 0,
            modifier: skillSystem.modifier?.value || 0,
          };
        }
      }

      // WFRP Talents - Extract from items array (talents are also items)
      const talentItems = items.filter((item: any) => item.type === 'talent');

      if (talentItems.length > 0) {
        stats.talents = talentItems.map((talent: any) => ({
          name: talent.name,
          advances: talent.system?.advances?.value || 1,
          tests: talent.system?.tests?.value || '',
          description: this.truncateText(talent.system?.description?.value || '', 100)
        }));
      }
    }

    return stats;
  }

  private formatItems(items: any[]): any[] {
    // Filter out skills and talents as they're handled separately in stats
    const inventoryItems = items.filter((item: any) =>
      item.type !== 'skill' && item.type !== 'talent'
    );

    return inventoryItems.slice(0, 50).map(item => ({ // Increased to 50 items for better inventory visibility
      id: item.id,
      name: item.name,
      type: item.type,
      quantity: item.system?.quantity?.value || 1,
      equipped: item.system?.equipped?.value || item.system?.worn?.value || false,
      description: this.truncateText(item.system?.description?.value || '', 200),
      hasImage: !!item.img,
    }));
  }

  private formatEffects(effects: any[]): any[] {
    return effects.map(effect => ({
      id: effect.id,
      name: effect.name,
      disabled: effect.disabled,
      duration: effect.duration ? {
        type: effect.duration.type,
        remaining: effect.duration.remaining,
      } : null,
      hasIcon: !!effect.icon,
    }));
  }

  private truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }

  async handleUpdateCharacterInfo(args: any): Promise<any> {
    const schema = z.object({
      identifier: z.string().min(1, 'Character identifier cannot be empty'),
      updates: z.record(z.any()).refine(
        (updates) => Object.keys(updates).length > 0,
        'Updates object cannot be empty'
      ),
    });

    const { identifier, updates } = schema.parse(args);

    this.logger.info('Updating character information', { identifier, updates });

    try {
      // First, find the character by name or ID
      const characterData = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
        characterName: identifier,
      });

      if (!characterData || !characterData.id) {
        throw new Error(`Character "${identifier}" not found`);
      }

      // Map user-friendly field names to Foundry data paths
      const updateData: Record<string, any> = {};

      // Characteristic mapping (updates the INITIAL value, not advances)
      const charMap: Record<string, string> = {
        weaponSkill: 'ws',
        ballisticSkill: 'bs',
        strength: 's',
        toughness: 't',
        initiative: 'i',
        agility: 'ag',
        dexterity: 'dex',
        intelligence: 'int',
        willpower: 'wp',
        fellowship: 'fel',
      };

      for (const [key, value] of Object.entries(updates)) {
        const lowerKey = key.toLowerCase();

        // Handle characteristics - update initial value
        if (charMap[lowerKey]) {
          const charKey = charMap[lowerKey];
          updateData[`system.characteristics.${charKey}.initial`] = value;
          this.logger.debug(`Mapping ${key} to system.characteristics.${charKey}.initial = ${value}`);
        }
        // Handle status values
        else if (lowerKey === 'currentwounds') {
          updateData['system.status.wounds.value'] = value;
        }
        else if (lowerKey === 'fortune') {
          updateData['system.status.fortune.value'] = value;
        }
        else if (lowerKey === 'fate') {
          updateData['system.status.fate.value'] = value;
        }
        else if (lowerKey === 'resilience') {
          updateData['system.status.resilience.value'] = value;
        }
        else if (lowerKey === 'resolve') {
          updateData['system.status.resolve.value'] = value;
        }
        else {
          this.logger.warn(`Unknown update field: ${key}`, { value });
        }
      }

      if (Object.keys(updateData).length === 0) {
        throw new Error('No valid fields to update');
      }

      // Execute the update
      const result = await this.foundryClient.query('foundry-mcp-bridge.updateActor', {
        actorId: characterData.id,
        updateData,
      });

      this.logger.info('Successfully updated character', {
        characterId: characterData.id,
        characterName: characterData.name,
        fieldsUpdated: Object.keys(updateData),
      });

      return {
        success: true,
        character: {
          id: characterData.id,
          name: characterData.name,
        },
        updated: updateData,
        message: `Successfully updated ${Object.keys(updateData).length} field(s) for ${characterData.name}`,
      };

    } catch (error) {
      this.logger.error('Failed to update character information', error);
      throw new Error(`Failed to update character "${identifier}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleUpdateSkillTalent(args: any): Promise<any> {
    const schema = z.object({
      characterName: z.string().min(1, 'Character name cannot be empty'),
      itemName: z.string().min(1, 'Item name cannot be empty'),
      itemType: z.enum(['skill', 'talent']),
      advances: z.number().int().min(0, 'Advances must be 0 or greater'),
    });

    const { characterName, itemName, itemType, advances } = schema.parse(args);

    this.logger.info('Updating skill/talent directly', { characterName, itemName, itemType, advances });

    try {
      // Get character
      const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
        characterName: characterName,
      });

      if (!character) {
        throw new Error(`Character "${characterName}" not found`);
      }

      // Find the item (skill or talent)
      const item = character.items?.find(
        (i: any) => i.type === itemType && i.name.toLowerCase().includes(itemName.toLowerCase())
      );

      if (!item) {
        throw new Error(`${itemType === 'skill' ? 'Skill' : 'Talent'} "${itemName}" not found on ${character.name}. Please add it first.`);
      }

      const oldAdvances = item.system?.advances?.value || 0;

      // Update the item directly (no XP cost)
      await this.foundryClient.query('foundry-mcp-bridge.updateItem', {
        actorId: character.id,
        itemId: item.id,
        updateData: {
          'system.advances.value': advances,
        },
      });

      this.logger.info('Successfully updated skill/talent', {
        characterName: character.name,
        itemName: item.name,
        itemType,
        oldAdvances,
        newAdvances: advances,
      });

      const itemTypeLabel = itemType === 'skill' ? 'Skill' : 'Talent';
      return `✅ Successfully updated ${itemTypeLabel} "${item.name}" for ${character.name}!\n` +
        `- Previous advances: ${oldAdvances}\n` +
        `- New advances: ${advances}\n` +
        `- Change: ${advances > oldAdvances ? '+' : ''}${advances - oldAdvances}\n` +
        `- Note: This was a direct update with no XP cost (GM adjustment)`;

    } catch (error) {
      this.logger.error('Failed to update skill/talent', error);
      throw new Error(`Failed to update ${itemType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleAddSkillTalent(args: any): Promise<any> {
    const schema = z.object({
      characterName: z.string().min(1, 'Character name cannot be empty'),
      itemName: z.string().min(1, 'Item name cannot be empty'),
      itemType: z.enum(['skill', 'talent']),
    });

    const { characterName, itemName, itemType } = schema.parse(args);

    this.logger.info('Adding skill/talent from compendium', { characterName, itemName, itemType });

    try {
      const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
        characterName: characterName,
      });

      if (!character) {
        throw new Error(`Character "${characterName}" not found`);
      }

      // Check if item already exists
      const existingItem = character.items?.find(
        (i: any) => i.type === itemType && i.name.toLowerCase() === itemName.toLowerCase()
      );

      if (existingItem) {
        return `⚠️ ${character.name} already has the ${itemType} "${existingItem.name}". Use advance-${itemType} to improve it with XP, or foundry-update-skill-talent to adjust advances directly.`;
      }

      // STEP 1: Search compendiums for the skill/talent
      this.logger.info('Searching compendiums for item', { itemName, itemType });

      let compendiumItem = null;
      let compendiumUuid = null;
      try {
        const searchResults = await this.foundryClient.query('foundry-mcp-bridge.searchCompendium', {
          query: itemName,
          packType: 'Item',
        });

        this.logger.info('Search results:', { searchResults });

        if (searchResults && searchResults.length > 0) {
          // Filter for the specific item type
          const typeResults = searchResults.filter((item: any) => item.type === itemType);

          if (typeResults.length > 0) {
            // Find exact or best match
            compendiumItem = typeResults.find((item: any) =>
              item.name.toLowerCase() === itemName.toLowerCase()
            ) || typeResults[0]; // Use first result if no exact match

            // Construct UUID from pack and id
            // Format: Compendium.{packId}.{itemId}
            if (compendiumItem.pack && compendiumItem.id) {
              compendiumUuid = `Compendium.${compendiumItem.pack}.${compendiumItem.id}`;
            } else if (compendiumItem.pack && compendiumItem._id) {
              compendiumUuid = `Compendium.${compendiumItem.pack}.${compendiumItem._id}`;
            }

            this.logger.info('Found item in compendium', {
              itemName: compendiumItem.name,
              pack: compendiumItem.pack,
              id: compendiumItem.id || compendiumItem._id,
              constructedUuid: compendiumUuid
            });
          } else {
            this.logger.info(`No ${itemType}-type items found in search results`);
          }
        }
      } catch (compendiumError) {
        this.logger.warn('Compendium search failed, will create basic entry', compendiumError);
      }

      let response = '';

      // STEP 2: Add from compendium OR create basic entry
      if (compendiumItem && compendiumUuid) {
        // Add official compendium item with all effects
        await this.foundryClient.query('foundry-mcp-bridge.addItemFromCompendium', {
          actorId: character.id,
          compendiumId: compendiumUuid,
        });

        response = `✅ Added official ${itemType} from compendium to ${character.name}\n\n`;
        response += `**${itemType === 'skill' ? 'Skill' : 'Talent'}**: ${compendiumItem.name}\n`;
        response += `**Source**: WFRP 4e Compendium (${compendiumUuid})\n`;

        if (compendiumItem.description) {
          const desc = compendiumItem.description;
          const truncatedDesc = desc.length > 200 ? desc.substring(0, 200) + '...' : desc;
          response += `**Description**: ${truncatedDesc}\n`;
        }

        response += `\n✅ All official game effects, modifiers, and mechanics have been applied.\n`;

        if (itemType === 'skill') {
          response += `\n💡 Use \`advance-skill\` to improve this skill with XP.`;
        } else {
          response += `\n💡 Use \`advance-talent\` to take this talent additional times (if allowed).`;
        }

      } else {
        // Fallback: Create basic entry
        this.logger.warn(`${itemType} "${itemName}" not found in compendiums, creating basic entry`);

        const itemData: any = {
          name: itemName,
          type: itemType,
          system: {
            advances: { value: 0 },
          },
        };

        if (itemType === 'skill') {
          // Basic skill - requires characteristic assignment
          itemData.system.characteristic = { value: '' }; // GM will need to set this
        } else {
          // Basic talent
          itemData.system.max = { value: 1 };
        }

        await this.foundryClient.query('foundry-mcp-bridge.createItem', {
          actorId: character.id,
          itemData: itemData,
        });

        response = `⚠️ Created basic ${itemType} for ${character.name}\n\n`;
        response += `**${itemType === 'skill' ? 'Skill' : 'Talent'}**: ${itemName}\n`;
        response += `**Source**: Custom (not from compendium)\n\n`;
        response += `⚠️ **Warning**: This is a basic ${itemType} without official WFRP 4e effects.\n`;
        response += `The ${itemType} "${itemName}" was not found in compendiums. `;
        response += `Please verify the name and consider searching the compendium manually in Foundry.\n`;

        if (itemType === 'skill') {
          response += `\n⚠️ **Action Required**: You must set the governing characteristic for this skill in Foundry (WS, BS, S, T, I, Ag, Dex, Int, WP, or Fel).`;
        }
      }

      return response;

    } catch (error) {
      this.logger.error('Failed to add skill/talent', error);
      throw new Error(`Failed to add ${itemType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}