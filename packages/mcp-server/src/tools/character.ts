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
      }
    ];
  }

  async handleGetCharacter(args: any): Promise<any> {
    const schema = z.object({
      identifier: z.string().min(1, 'Character identifier cannot be empty'),
    });

    const { identifier } = schema.parse(args);

    this.logger.info('Getting character information', { identifier });

    try {
      const characterData = await this.foundryClient.query<any>('warhammer-mcp.getCharacterInfo', {
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
      const actors = await this.foundryClient.query<any>('warhammer-mcp.listActors', { type });

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

    // WFRP 4e system (system-id guard upstream ensures WFRP)
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


    return basicInfo;
  }

  private extractStats(characterData: any): any {
    const system = characterData.system || {};
    const stats: any = {};

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
}
