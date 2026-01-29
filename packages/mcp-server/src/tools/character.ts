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
        description: 'Retrieve comprehensive character information for a WFRP 4e character. Returns complete character data including: identity (name, species, status), characteristics (WS, BS, S, T, I, Ag, Dex, Int, WP, Fel), status (wounds, fortune, fate, resilience, resolve, corruption, money, toughness), critical wounds (count and details), biography (motivation, ambitions), skills (with advances and totals), talents (with descriptions), traits (creature traits), conditions (injuries, mutations, diseases, psychology), items (physical inventory only - weapons, armor, trappings), and experience. Use this tool when the user asks for character info - you can then present only the sections they requested (e.g., if they ask for "skills and talents only", retrieve all data but present only those sections in your response).',
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
                // Physical details
                age: { type: 'number', description: 'Character age in years' },
                height: { type: 'string', description: 'Character height (e.g., "185 cm", "6 feet")' },
                weight: { type: 'string', description: 'Character weight or build (e.g., "Fat", "Fit", "Thin", "70 kg")' },
                hair: { type: 'string', description: 'Hair color (e.g., "Blond", "Black", "Brown")' },
                eyes: { type: 'string', description: 'Eye color (e.g., "Blue", "Green", "Brown")' },
                gender: { type: 'string', description: 'Character gender' },
                distinguishingMarks: { type: 'string', description: 'Distinguishing marks or features (e.g., "Black Teeth", "Scar on left cheek")' },
                starSign: { type: 'string', description: 'Astrological star sign (e.g., "The Ghoul", "The Witchling Star")' },
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
      {
        name: 'foundry-update-character-notes',
        description: 'Update GM Notes, Biography, or both for a character. These are text fields that can contain formatted content (HTML). Use this to add narrative details, GM reminders, backstory, or character personality notes. Example: "Add to Test Character\'s GM notes that he hates beer" or "Update Hans\' biography with his backstory"',
        inputSchema: {
          type: 'object',
          properties: {
            identifier: {
              type: 'string',
              description: 'Character name or ID to update',
            },
            gmNotes: {
              type: 'string',
              description: 'Text to set for GM Notes (HTML allowed). Leave empty to not update GM Notes.',
            },
            biography: {
              type: 'string',
              description: 'Text to set for Biography (HTML allowed). Leave empty to not update Biography.',
            },
            appendMode: {
              type: 'boolean',
              description: 'If true, append the text to existing content instead of replacing it. Default: false',
              default: false,
            },
          },
          required: ['identifier'],
        },
      },
      {
        name: 'foundry-add-experience-log-entry',
        description: 'Add an entry to a character\'s experience log. The experience log tracks XP awards and expenditures with reasons. Use this to document why XP was gained or spent. Example: "Log that Hans spent 100 XP on Strong Back talent" or "Award 50 XP to Gustav for defeating the troll"',
        inputSchema: {
          type: 'object',
          properties: {
            identifier: {
              type: 'string',
              description: 'Character name or ID',
            },
            amount: {
              type: 'number',
              description: 'XP amount (positive for awards, negative for spending)',
            },
            reason: {
              type: 'string',
              description: 'Reason for the XP change (e.g., "Strong Back talent", "Defeated troll", "Session reward")',
            },
            type: {
              type: 'string',
              description: 'Type of log entry: "spent" or "total". Default: "spent" for negative amounts, "total" for positive',
              enum: ['spent', 'total'],
            },
          },
          required: ['identifier', 'amount', 'reason'],
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
      const characterData = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
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
      const actors = await this.foundryClient.query('warhammer-mcp.listActors', { type });

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
      conditions: this.formatConditions(characterData.items || []),
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
      basicInfo.criticalWounds = {
        count: criticalWounds.length,
        wounds: criticalWounds.map((crit: any) => ({
          name: crit.name,
          location: crit.system?.location?.value || 'unknown',
          severity: crit.system?.wounds?.value || 0,
          description: this.truncateText(crit.system?.description?.value || '', 200),
        })),
      };

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

      // Biography - WFRP 4e stores motivation and ambitions as separate fields
      if (system.details?.motivation?.value || system.details?.["personal-ambitions"]) {
        basicInfo.biography = {};
        if (system.details.motivation?.value) {
          basicInfo.biography.motivation = system.details.motivation.value;
        }
        if (system.details["personal-ambitions"]?.["short-term"]) {
          basicInfo.biography.shortTermAmbition = system.details["personal-ambitions"]["short-term"];
        }
        if (system.details["personal-ambitions"]?.["long-term"]) {
          basicInfo.biography.longTermAmbition = system.details["personal-ambitions"]["long-term"];
        }
      }

      // GM Notes (WFRP 4e)
      if (system.details?.gmnotes?.value) {
        basicInfo.gmNotes = system.details.gmnotes.value;
      }

      // Movement (WFRP 4e)
      if (system.details?.move) {
        basicInfo.movement = system.details.move.value || system.details.move;
      }

      // Physical Description
      if (system.details?.gender?.value) {
        basicInfo.gender = system.details.gender.value;
      }
      if (system.details?.age?.value) {
        basicInfo.age = system.details.age.value;
      }
      if (system.details?.height?.value) {
        basicInfo.height = system.details.height.value;
      }
      // WFRP4e uses haircolour (not hair), eyecolour (not eyes), distinguishingmark (not distinguishingMarks)
      if (system.details?.haircolour?.value) {
        basicInfo.hair = system.details.haircolour.value;
      }
      if (system.details?.eyecolour?.value) {
        basicInfo.eyes = system.details.eyecolour.value;
      }
      if (system.details?.distinguishingmark?.value) {
        basicInfo.distinguishingMarks = system.details.distinguishingmark.value;
      }
      // Weight (WFRP 4e)
      if (system.details?.weight?.value) {
        basicInfo.weight = system.details.weight.value;
      }
      // Star Sign (WFRP 4e - handle both camelCase and lowercase)
      if (system.details?.starsign?.value) {
        basicInfo.starSign = system.details.starsign.value;
      } else if (system.details?.starSign?.value) {
        basicInfo.starSign = system.details.starSign.value;
      }

      // Experience log (if available)
      if (system.details?.experience?.log) {
        basicInfo.experienceLog = system.details.experience.log;
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
          description: this.truncateText(talent.system?.description?.value || '', 200)
        }));
      }

      // WFRP Traits - Extract creature traits
      const traitItems = items.filter((item: any) => item.type === 'trait');

      if (traitItems.length > 0) {
        stats.traits = traitItems.map((trait: any) => ({
          name: trait.name,
          specification: trait.system?.specification?.value || '',
          description: this.truncateText(trait.system?.description?.value || '', 200)
        }));
      }
    }

    return stats;
  }

  private formatItems(items: any[]): any[] {
    // Filter out non-inventory items:
    // - skills, talents, traits: handled in stats section
    // - career: shown in basicInfo.career
    // - money: aggregated in basicInfo.money
    // - critical: shown in basicInfo.criticalWounds
    // - injury, mutation, disease, psychology: status effects, not inventory
    const inventoryItems = items.filter((item: any) =>
      item.type !== 'skill' &&
      item.type !== 'talent' &&
      item.type !== 'trait' &&
      item.type !== 'career' &&
      item.type !== 'money' &&
      item.type !== 'critical' &&
      item.type !== 'injury' &&
      item.type !== 'mutation' &&
      item.type !== 'disease' &&
      item.type !== 'psychology'
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

  private formatConditions(items: any[]): any {
    // Extract status condition items (injuries, mutations, diseases, psychology)
    const conditions: any = {};

    const injuries = items.filter((item: any) => item.type === 'injury');
    if (injuries.length > 0) {
      conditions.injuries = injuries.map((injury: any) => ({
        name: injury.name,
        location: injury.system?.location?.value || '',
        description: this.truncateText(injury.system?.description?.value || '', 200),
      }));
    }

    const mutations = items.filter((item: any) => item.type === 'mutation');
    if (mutations.length > 0) {
      conditions.mutations = mutations.map((mutation: any) => ({
        name: mutation.name,
        type: mutation.system?.mutationType?.value || '',
        description: this.truncateText(mutation.system?.description?.value || '', 200),
      }));
    }

    const diseases = items.filter((item: any) => item.type === 'disease');
    if (diseases.length > 0) {
      conditions.diseases = diseases.map((disease: any) => ({
        name: disease.name,
        contraction: disease.system?.contraction?.value || '',
        incubation: disease.system?.incubation?.value || '',
        duration: disease.system?.duration?.value || '',
        symptoms: disease.system?.symptoms?.value || '',
        description: this.truncateText(disease.system?.description?.value || '', 200),
      }));
    }

    const psychology = items.filter((item: any) => item.type === 'psychology');
    if (psychology.length > 0) {
      conditions.psychology = psychology.map((psych: any) => ({
        name: psych.name,
        description: this.truncateText(psych.system?.description?.value || '', 200),
      }));
    }

    // Note: Active effects-based conditions (Fatigued, Poisoned, etc.) with counts
    // are handled by extracting from character.effects, not items.
    // Those will need to be added to formatEffects to show condition values.

    return conditions;
  }

  private formatEffects(effects: any[]): any[] {
    return effects.map(effect => {
      const formattedEffect: any = {
        id: effect.id,
        name: effect.name,
        disabled: effect.disabled,
        duration: effect.duration ? {
          type: effect.duration.type,
          remaining: effect.duration.remaining,
        } : null,
        hasIcon: !!effect.icon,
      };

      // Add condition value if this is a WFRP condition (Fatigued, Poisoned, etc.)
      // WFRP4e stores condition values in:
      // - Primary: effect.system.condition.value
      // - Fallback: effect.flags.wfrp4e.value
      const conditionValue = effect.system?.condition?.value ?? effect.flags?.wfrp4e?.value;

      if (conditionValue !== undefined && conditionValue !== null) {
        formattedEffect.conditionValue = conditionValue;

        // Stackable conditions (value > 1): show count
        // Binary conditions (value = 1 or 0): just show name
        if (conditionValue > 1) {
          formattedEffect.displayName = `${effect.name} ${conditionValue}`;
        } else {
          formattedEffect.displayName = effect.name;
        }
      }

      return formattedEffect;
    });
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
      const characterData = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
        characterName: identifier,
      });

      if (!characterData || !characterData.id) {
        throw new Error(`Character "${identifier}" not found`);
      }

      // Map user-friendly field names to Foundry data paths
      const updateData: Record<string, any> = {};
      const warnings: string[] = [];
      const unknownFields: string[] = [];

      // Characteristic mapping (updates the INITIAL value, not advances)
      // Keys are lowercase to match the lowerKey conversion below
      // Supports both full names (weaponskill) and abbreviations (ws)
      const charMap: Record<string, string> = {
        weaponskill: 'ws',
        ws: 'ws',
        ballisticskill: 'bs',
        bs: 'bs',
        strength: 's',
        s: 's',
        toughness: 't',
        t: 't',
        initiative: 'i',
        i: 'i',
        agility: 'ag',
        ag: 'ag',
        dexterity: 'dex',
        dex: 'dex',
        intelligence: 'int',
        int: 'int',
        willpower: 'wp',
        wp: 'wp',
        fellowship: 'fel',
        fel: 'fel',
      };

      // Readable characteristic names for warnings
      const charNames: Record<string, string> = {
        ws: 'Weapon Skill',
        bs: 'Ballistic Skill',
        s: 'Strength',
        t: 'Toughness',
        i: 'Initiative',
        ag: 'Agility',
        dex: 'Dexterity',
        int: 'Intelligence',
        wp: 'Willpower',
        fel: 'Fellowship',
      };

      for (const [key, value] of Object.entries(updates)) {
        const lowerKey = key.toLowerCase();

        // Handle characteristics - update initial value
        if (charMap[lowerKey]) {
          const charKey = charMap[lowerKey];

          // Validation: Reject negative characteristics and cap at 250
          if (typeof value === 'number') {
            if (value < 0) {
              throw new Error(`Cannot set ${charNames[charKey]} to ${value}. Characteristics cannot be negative as this will cause calculation errors in WFRP4e. Minimum value is 0.`);
            }
            if (value > 250) {
              throw new Error(`Cannot set ${charNames[charKey]} to ${value}. Values above 250 are not allowed as they would cause game-breaking issues. Maximum value is 250.`);
            }
          }

          updateData[`system.characteristics.${charKey}.initial`] = value;
          this.logger.debug(`Mapping ${key} to system.characteristics.${charKey}.initial = ${value}`);

          // Warning for unusual but valid values
          if (typeof value === 'number') {
            if (value === 0) {
              warnings.push(`WARNING: ${charNames[charKey]} set to 0. This is unusual in WFRP4e. The character will have no baseline in this characteristic (only advances will contribute to tests).`);
            } else if (value > 100) {
              warnings.push(`WARNING: ${charNames[charKey]} set to ${value}. Values above 100 are exceptionally rare in WFRP4e (beyond legendary).`);
            }
          }
        }
        // Handle status values
        else if (lowerKey === 'currentwounds') {
          // Cap wounds at maximum
          if (typeof value === 'number' && characterData.system?.status?.wounds?.max) {
            const maxWounds = characterData.system.status.wounds.max;
            if (value > maxWounds) {
              updateData['system.status.wounds.value'] = maxWounds;
              warnings.push(`WARNING: Current Wounds capped at maximum (${maxWounds}). Cannot exceed max wounds.`);
            } else {
              updateData['system.status.wounds.value'] = value;
            }
          } else {
            updateData['system.status.wounds.value'] = value;
          }
          if (typeof value === 'number' && value < 0) {
            warnings.push(`WARNING: Current Wounds set to ${value}. Negative wounds indicate the character should be dead or dying.`);
          }
        }
        else if (lowerKey === 'fortune') {
          // Cap Fortune at Fate maximum
          if (typeof value === 'number' && characterData.system?.status?.fate?.value) {
            const maxFortune = characterData.system.status.fate.value;
            if (value > maxFortune) {
              updateData['system.status.fortune.value'] = maxFortune;
              warnings.push(`WARNING: Fortune capped at Fate maximum (${maxFortune}). Fortune cannot exceed Fate.`);
            } else {
              updateData['system.status.fortune.value'] = value;
            }
          } else {
            updateData['system.status.fortune.value'] = value;
          }
          if (typeof value === 'number' && value < 0) {
            warnings.push(`WARNING: Fortune set to ${value}. Negative Fortune is not standard in WFRP4e.`);
          }
        }
        else if (lowerKey === 'fate') {
          updateData['system.status.fate.value'] = value;
          if (typeof value === 'number' && value < 0) {
            warnings.push(`WARNING: Fate set to ${value}. Negative Fate is not standard in WFRP4e.`);
          }
        }
        else if (lowerKey === 'resilience') {
          updateData['system.status.resilience.value'] = value;
          if (typeof value === 'number' && value < 0) {
            warnings.push(`WARNING: Resilience set to ${value}. Negative Resilience is not standard in WFRP4e.`);
          }
        }
        else if (lowerKey === 'resolve') {
          // Cap Resolve at Resilience maximum
          if (typeof value === 'number' && characterData.system?.status?.resilience?.value) {
            const maxResolve = characterData.system.status.resilience.value;
            if (value > maxResolve) {
              updateData['system.status.resolve.value'] = maxResolve;
              warnings.push(`WARNING: Resolve capped at Resilience maximum (${maxResolve}). Resolve cannot exceed Resilience.`);
            } else {
              updateData['system.status.resolve.value'] = value;
            }
          } else {
            updateData['system.status.resolve.value'] = value;
          }
          if (typeof value === 'number' && value < 0) {
            warnings.push(`WARNING: Resolve set to ${value}. Negative Resolve is not standard in WFRP4e.`);
          }
        }
        // Physical detail fields
        else if (lowerKey === 'age') {
          updateData['system.details.age.value'] = value;
        }
        else if (lowerKey === 'height') {
          updateData['system.details.height.value'] = value;
        }
        else if (lowerKey === 'weight') {
          updateData['system.details.weight.value'] = value;
        }
        // Hair - support both user-friendly and WFRP4e field names
        else if (lowerKey === 'hair' || lowerKey === 'haircolour') {
          updateData['system.details.haircolour.value'] = value;
        }
        // Eyes - support both user-friendly and WFRP4e field names
        else if (lowerKey === 'eyes' || lowerKey === 'eyecolour') {
          updateData['system.details.eyecolour.value'] = value;
        }
        else if (lowerKey === 'gender') {
          updateData['system.details.gender.value'] = value;
        }
        // Distinguishing Marks - support both user-friendly and WFRP4e field names
        else if (lowerKey === 'distinguishingmarks' || lowerKey === 'distinguishingmark') {
          updateData['system.details.distinguishingmark.value'] = value;
        }
        else if (lowerKey === 'starsign') {
          updateData['system.details.starsign.value'] = value;
        }
        else {
          // Unknown field - track it for user feedback
          unknownFields.push(key);
          this.logger.warn(`Unknown update field: ${key}`, { value });
        }
      }

      // Add warning for unknown fields
      if (unknownFields.length > 0) {
        warnings.push(`WARNING: Unknown field(s) ignored: ${unknownFields.join(', ')}. Valid fields include: characteristic names (ws, bs, s, t, i, ag, dex, int, wp, fel), currentWounds, fortune, fate, resilience, resolve, age, height, weight, hair, eyes, gender, distinguishingMarks, starSign.`);
      }

      if (Object.keys(updateData).length === 0) {
        throw new Error('No valid fields to update');
      }

      // Execute the update
      const result = await this.foundryClient.query('warhammer-mcp.updateActor', {
        actorId: characterData.id,
        updateData,
        warnings: warnings.length > 0 ? warnings : undefined,
      });

      // Retrieve updated character data to show final calculated values
      const updatedCharacter = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
        characterName: identifier,
      });

      // Build detailed update summary showing initial vs final values for characteristics
      const characteristicUpdates: Record<string, any> = {};
      for (const [path, value] of Object.entries(updateData)) {
        if (path.startsWith('system.characteristics.')) {
          const match = path.match(/system\.characteristics\.(\w+)\.initial/);
          if (match) {
            const charKey = match[1];
            const charData = updatedCharacter.system?.characteristics?.[charKey];
            if (charData) {
              characteristicUpdates[charKey] = {
                requestedInitial: value,
                actualInitial: charData.initial,
                finalValue: charData.value,
                modifier: charData.value - charData.initial,
              };
            }
          }
        }
      }

      this.logger.info('Successfully updated character', {
        characterId: characterData.id,
        characterName: characterData.name,
        fieldsUpdated: Object.keys(updateData),
        characteristicUpdates,
        warnings: warnings.length > 0 ? warnings : undefined,
      });

      // Build success message with characteristic details
      let message = `Successfully updated ${Object.keys(updateData).length} field(s) for ${characterData.name}`;

      // Add characteristic update details if any
      if (Object.keys(characteristicUpdates).length > 0) {
        message += '\n\n**Characteristic Updates:**';
        for (const [key, data] of Object.entries(characteristicUpdates)) {
          const charName = key.toUpperCase();
          message += `\n- ${charName}: initial=${data.actualInitial}, final value=${data.finalValue}`;
          if (data.modifier !== 0) {
            message += ` (${data.modifier > 0 ? '+' : ''}${data.modifier} from talents/items)`;
          }
        }
      }

      if (warnings.length > 0) {
        message += `\n\n**Warnings:**\n${warnings.join('\n')}`;
      }

      return {
        success: true,
        character: {
          id: characterData.id,
          name: characterData.name,
        },
        updated: updateData,
        warnings: warnings.length > 0 ? warnings : undefined,
        message,
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
      const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
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
      await this.foundryClient.query('warhammer-mcp.updateItem', {
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
      const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
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
        const searchResults = await this.foundryClient.query('warhammer-mcp.searchCompendium', {
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
        await this.foundryClient.query('warhammer-mcp.addItemFromCompendium', {
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

        await this.foundryClient.query('warhammer-mcp.createItem', {
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

  async handleUpdateCharacterNotes(args: any): Promise<any> {
    const schema = z.object({
      identifier: z.string().min(1, 'Character identifier cannot be empty'),
      gmNotes: z.string().optional(),
      biography: z.string().optional(),
      appendMode: z.boolean().optional().default(false),
    });

    const { identifier, gmNotes, biography, appendMode } = schema.parse(args);

    this.logger.info('Updating character notes/biography', {
      identifier,
      hasGmNotes: !!gmNotes,
      hasBiography: !!biography,
      appendMode
    });

    try {
      // Get current character data
      const characterData = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
        characterName: identifier,
      });

      if (!characterData || !characterData.id) {
        throw new Error(`Character "${identifier}" not found`);
      }

      const updateData: Record<string, any> = {};

      // Handle GM Notes update
      if (gmNotes !== undefined) {
        if (appendMode && characterData.system?.details?.gmnotes?.value) {
          // Append to existing GM Notes
          const existingNotes = characterData.system.details.gmnotes.value;
          updateData['system.details.gmnotes.value'] = `${existingNotes}\n${gmNotes}`;
        } else {
          // Replace GM Notes
          updateData['system.details.gmnotes.value'] = gmNotes;
        }
      }

      // Handle Biography update
      if (biography !== undefined) {
        if (appendMode && characterData.system?.details?.biography?.value) {
          // Append to existing Biography
          const existingBiography = characterData.system.details.biography.value;
          updateData['system.details.biography.value'] = `${existingBiography}\n${biography}`;
        } else {
          // Replace Biography
          updateData['system.details.biography.value'] = biography;
        }
      }

      if (Object.keys(updateData).length === 0) {
        throw new Error('No updates provided. Please specify gmNotes or biography to update.');
      }

      // Execute the update
      await this.foundryClient.query('warhammer-mcp.updateActor', {
        actorId: characterData.id,
        updateData,
      });

      this.logger.info('Successfully updated character notes/biography', {
        characterId: characterData.id,
        characterName: characterData.name,
        fieldsUpdated: Object.keys(updateData),
      });

      const updatedFields = [];
      if (gmNotes !== undefined) updatedFields.push('GM Notes');
      if (biography !== undefined) updatedFields.push('Biography');

      return {
        success: true,
        character: {
          id: characterData.id,
          name: characterData.name,
        },
        updated: updatedFields,
        mode: appendMode ? 'appended' : 'replaced',
        message: `Successfully ${appendMode ? 'appended to' : 'updated'} ${updatedFields.join(' and ')} for ${characterData.name}`,
      };

    } catch (error) {
      this.logger.error('Failed to update character notes/biography', error);
      throw new Error(`Failed to update notes/biography for "${identifier}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleAddExperienceLogEntry(args: any): Promise<any> {
    const schema = z.object({
      identifier: z.string().min(1, 'Character identifier cannot be empty'),
      amount: z.number(),
      reason: z.string().min(1, 'Reason cannot be empty'),
      type: z.enum(['spent', 'total']).optional(),
    });

    const parsed = schema.parse(args);
    const { identifier, amount, reason } = parsed;
    // Auto-determine type based on amount if not specified
    const type = parsed.type || (amount < 0 ? 'spent' : 'total');

    this.logger.info('Adding experience log entry', { identifier, amount, reason, type });

    try {
      // Get current character data
      const characterData = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
        characterName: identifier,
      });

      if (!characterData || !characterData.id) {
        throw new Error(`Character "${identifier}" not found`);
      }

      // Get existing log or initialize empty array
      const existingLog = characterData.system?.details?.experience?.log || [];

      // Create new log entry
      const newEntry = {
        amount: Math.abs(amount), // WFRP stores as absolute value
        reason: reason,
        type: type,
        // WFRP might have additional fields, but these are the essentials
      };

      // Add new entry to the log
      const updatedLog = [...existingLog, newEntry];

      // Update the experience log
      await this.foundryClient.query('warhammer-mcp.updateActor', {
        actorId: characterData.id,
        updateData: {
          'system.details.experience.log': updatedLog,
        },
      });

      this.logger.info('Successfully added experience log entry', {
        characterId: characterData.id,
        characterName: characterData.name,
        entry: newEntry,
      });

      return {
        success: true,
        character: {
          id: characterData.id,
          name: characterData.name,
        },
        logEntry: newEntry,
        totalLogEntries: updatedLog.length,
        message: `Added experience log entry to ${characterData.name}: ${amount > 0 ? '+' : ''}${amount} XP - ${reason}`,
      };

    } catch (error) {
      this.logger.error('Failed to add experience log entry', error);
      throw new Error(`Failed to add experience log for "${identifier}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}