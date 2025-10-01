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
   * Supports both D&D 5e and WFRP 4e systems
   */
  getToolDefinitions() {
    return [
      {
        name: 'get-character',
        description: 'Retrieve detailed information about a specific character by name or ID. Supports both D&D 5e (abilities, HP, AC, skills) and WFRP 4e (characteristics, wounds, toughness, skills) systems.',
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
        description: 'List all available characters with basic information. Works with both D&D 5e and WFRP 4e character data.',
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

    } else {
      // D&D 5e / PF2e system
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

      // WFRP Skills
      if (system.skills) {
        stats.skills = {};
        for (const [key, skill] of Object.entries(system.skills)) {
          if (typeof skill === 'object' && skill !== null) {
            const s = skill as any;
            if (s.name) { // Only include named skills
              stats.skills[s.name] = {
                characteristic: s.characteristic?.key || s.characteristic || '',
                advances: s.advances || 0,
                value: s.total || s.value || 0,
              };
            }
          }
        }
      }

      // WFRP Talents
      if (system.talents) {
        stats.talents = Object.values(system.talents)
          .filter((t: any) => t.name)
          .map((t: any) => ({
            name: t.name,
            advances: t.advances || 1,
            description: this.truncateText(t.description || '', 100)
          }));
      }

    } else {
      // D&D 5e Ability Scores
      if (system.abilities) {
        stats.abilities = {};
        for (const [key, ability] of Object.entries(system.abilities)) {
          if (typeof ability === 'object' && ability !== null) {
            stats.abilities[key] = {
              score: (ability as any).value || 10,
              modifier: (ability as any).mod || 0,
            };
          }
        }
      }

      // D&D 5e Skills
      if (system.skills) {
        stats.skills = {};
        for (const [key, skill] of Object.entries(system.skills)) {
          if (typeof skill === 'object' && skill !== null) {
            stats.skills[key] = {
              value: (skill as any).value || 0,
              proficient: (skill as any).proficient || false,
              ability: (skill as any).ability || '',
            };
          }
        }
      }

      // D&D 5e Saves
      if (system.saves) {
        stats.saves = {};
        for (const [key, save] of Object.entries(system.saves)) {
          if (typeof save === 'object' && save !== null) {
            stats.saves[key] = {
              value: (save as any).value || 0,
              proficient: (save as any).proficient || false,
            };
          }
        }
      }
    }

    return stats;
  }

  private formatItems(items: any[]): any[] {
    return items.slice(0, 20).map(item => ({ // Limit to 20 items to avoid overwhelming responses
      id: item.id,
      name: item.name,
      type: item.type,
      quantity: item.system?.quantity || 1,
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
}