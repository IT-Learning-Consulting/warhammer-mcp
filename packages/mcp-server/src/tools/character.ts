import { z } from 'zod';
import {
  GetCharacterOutput,
  GET_CHARACTER_OUTPUT_JSON_SCHEMA,
  type FoundryRawActor,
  type FoundryRawItem,
  type FoundryRawEffect,
  type CharacterBasicInfoView,
  type CharacterStatsView,
  type CharacterConditionsView,
  type CharacterSectionsView,
  type CharacterItemView,
  type CharacterEffectView,
  type CharacterResponseView,
} from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface CharacterToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class CharacterTools extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
      { name: 'get-character', handler: (args: any) => this.handleGetCharacter(args) },
      { name: 'list-characters', handler: (args: any) => this.handleListCharacters(args) },
    ];
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
        title: 'Get Character',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        description: 'Retrieve comprehensive character information for a WFRP 4e character. Returns complete character data including: identity (name, species, status), characteristics (WS, BS, S, T, I, Ag, Dex, Int, WP, Fel), status (wounds, fortune, fate, resilience, resolve, corruption, money, toughness), critical wounds (count and details), biography (motivation, ambitions), skills (with advances and totals), talents (with descriptions), traits (creature traits), conditions (injuries, mutations, diseases, psychology), items (physical inventory only - weapons, armor, trappings), and experience.\n\nTOOL-IDEA-006 (2026-05-14): pass `sections: ["characteristics"]` (or any subset) to receive only those sections in the response. Reduces payload size dramatically for narrow queries (e.g. "what is Camila\'s WS?"). `id`, `name`, `type`, `hasImage` are always returned. Available section names: `identity`, `vitals`, `characteristics`, `skills`, `talents`, `conditions`, `items`, `effects`, `biography`. Omit `sections` to receive the full payload as before.',
        inputSchema: {
          type: 'object',
          properties: {
            identifier: {
              type: 'string',
              description: 'Character name or ID to look up',
            },
            sections: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['identity', 'vitals', 'characteristics', 'skills', 'talents', 'conditions', 'items', 'effects', 'biography'],
              },
              description: 'Optional allowlist of response sections (TOOL-IDEA-006). id/name/type/hasImage are always returned.',
            },
          },
          required: ['identifier'],
        },
        outputSchema: GET_CHARACTER_OUTPUT_JSON_SCHEMA,
      },
      {
        name: 'list-characters',
        title: 'List Characters',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
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
    const SECTIONS = ['identity', 'vitals', 'characteristics', 'skills', 'talents', 'conditions', 'items', 'effects', 'biography'] as const;
    const schema = z.object({
      identifier: z.string().min(1, 'Character identifier cannot be empty'),
      sections: z.array(z.enum(SECTIONS)).optional(),
    });

    const { identifier, sections } = schema.parse(args);

    this.logger.info('Getting character information', { identifier, sections });

    try {
      const isId = /^[A-Za-z0-9]{16}$/.test(identifier);
      const characterData = await this.query<FoundryRawActor>('getCharacterInfo', isId
        ? { characterId: identifier }
        : { characterName: identifier }
      );

      this.logger.debug('Successfully retrieved character data', {
        characterId: characterData.id,
        characterName: characterData.name
      });

      const fullOutput = this.formatCharacterResponse(characterData);
      const output = sections && sections.length > 0
        ? this.applySectionsFilter(fullOutput, sections)
        : fullOutput;
      GetCharacterOutput.parse(output);
      return {
        content: [{ type: 'text', text: JSON.stringify(output) }],
        structuredContent: output,
      };

    } catch (error) {
      this.logger.error('Failed to get character information', error);
      throw new Error(`Failed to retrieve character "${identifier}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // TOOL-IDEA-006 (2026-05-14): post-assembly sections filter.
  // Splits basicInfo into identity/vitals/biography virtual sections, plus
  // characteristics/skills/talents lifted from stats. id/name/type/hasImage
  // are always preserved.
  private applySectionsFilter(full: CharacterResponseView, sections: readonly string[]): CharacterSectionsView {
    const sectionSet = new Set(sections);
    const basicInfo = full.basicInfo ?? {};
    const stats = full.stats ?? {};

    // Field maps (by section bucket) — match the keys produced by extractBasicInfo / extractStats.
    // F01 (2026-05-14): hitLocationTable moved from identity → vitals to match the plan's mapping
    // table (TOOL-IDEA-006). It's a combat-resolution field (which RollTable to roll on for crit
    // location), so it belongs with the other combat vitals.
    const identityKeys = ['species', 'career', 'class', 'careerLevel', 'status', 'gender', 'age', 'height', 'weight', 'hair', 'eyes', 'starSign', 'movement', 'distinguishingMarks'];
    const vitalsKeys = ['wounds', 'fortune', 'fate', 'resilience', 'resolve', 'corruption', 'toughness', 'money', 'criticalWounds', 'hitLocationTable'];
    const biographyKeys = ['biography', 'gmNotes', 'experience', 'experienceLog'];

    const pick = (src: CharacterBasicInfoView, keys: string[]): CharacterBasicInfoView => {
      const out: CharacterBasicInfoView = {};
      for (const k of keys) {
        if (src[k] !== undefined) out[k] = src[k];
      }
      return out;
    };

    const filtered: CharacterSectionsView = {
      id: full.id,
      name: full.name,
      type: full.type,
      hasImage: full.hasImage,
    };

    if (sectionSet.has('identity')) {
      filtered.identity = pick(basicInfo, identityKeys);
    }
    if (sectionSet.has('vitals')) {
      filtered.vitals = pick(basicInfo, vitalsKeys);
    }
    if (sectionSet.has('biography')) {
      filtered.biography = pick(basicInfo, biographyKeys);
    }
    if (sectionSet.has('characteristics') && stats.characteristics) {
      filtered.characteristics = stats.characteristics;
    }
    if (sectionSet.has('skills') && stats.skills) {
      filtered.skills = stats.skills;
    }
    if (sectionSet.has('talents')) {
      const t: CharacterSectionsView = {};
      if (stats.talents) t.talents = stats.talents;
      if (stats.traits) t.traits = stats.traits;
      if (Object.keys(t).length > 0) filtered.talents = t;
    }
    if (sectionSet.has('conditions') && full.conditions) {
      filtered.conditions = full.conditions;
    }
    if (sectionSet.has('items') && full.items) {
      filtered.items = full.items;
    }
    if (sectionSet.has('effects') && full.effects) {
      filtered.effects = full.effects;
    }

    return filtered;
  }

  async handleListCharacters(args: any): Promise<any> {
    const schema = z.object({
      type: z.string().optional(),
    });

    const { type } = schema.parse(args);

    this.logger.info('Listing characters', { type });

    try {
      const actors = await this.query<FoundryRawActor[]>('listActors', { type });

      this.logger.debug('Successfully retrieved character list', { count: actors.length });

      // Format the response for Claude
      return {
        characters: actors.map((actor: FoundryRawActor) => ({
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

  private formatCharacterResponse(characterData: FoundryRawActor): CharacterResponseView {
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

  private extractBasicInfo(characterData: FoundryRawActor): CharacterBasicInfoView {
    const system = characterData.system || {};
    const items = characterData.items || [];

    // Extract common fields that exist across different game systems
    const basicInfo: CharacterBasicInfoView = {};

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
    const criticalWounds = items.filter((item: FoundryRawItem) => item.type === 'critical');
    basicInfo.criticalWounds = {
      count: criticalWounds.length,
      wounds: criticalWounds.map((crit: FoundryRawItem) => ({
        name: crit.name,
        location: crit.system?.location?.value || 'unknown',
        severity: crit.system?.wounds?.value || 0,
        description: this.truncateText(crit.system?.description?.value || '', 200),
      })),
    };

    // Money (filter and sum money items correctly)
    const moneyItems = items.filter((item: FoundryRawItem) => item.type === 'money');
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
      const armorPoints = system.status?.armour?.value ?? system.status?.armour?.head?.value ?? 0;
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

    // Hit-location table key (humanoids: "hitloc"; creatures: "snake", "oversized", etc.)
    // Surfaced so /wfrp-critical can select the correct RollTable per creature.
    if (system.details?.hitLocationTable?.value) {
      basicInfo.hitLocationTable = system.details.hitLocationTable.value;
    }

    // Career / Class / Career level — BUG-184 (revised 2026-05-24 in /agent-validate REVISE).
    // In wfrp4e the manual `system.details.career/class/careerlevel` text fields are typically
    // left blank — wfrp4e's computeCareer() writes details.status from the current career but does
    // NOT write back career/class/careerlevel. The live values come from the CURRENT career Item
    // (the embedded career with system.current.value === true): name = career, system.class.value =
    // class (e.g. "Warrior"), system.level.value = career level (1-4). See
    // wfrp4e_system/data/Item/career.md. Prefer that item; fall back to the manual details fields.
    const currentCareer = items.find(
      (i: FoundryRawItem) => i.type === 'career' && i.system?.current?.value === true
    );
    const careerName = currentCareer?.name ?? (system.details?.career?.value || undefined);
    if (careerName) {
      basicInfo.career = careerName;
    }
    const className = currentCareer?.system?.class?.value ?? (system.details?.class?.value || undefined);
    if (className) {
      basicInfo.class = className;
    }
    // careerlevel (canonical field is all-lowercase per character.md:160) — prefer the current
    // career Item's level; keep the manual-field fallbacks for actors that fill them in.
    const careerLevel = currentCareer?.system?.level?.value
      ?? system.details?.careerlevel?.value
      ?? system.details?.level?.value
      ?? system.details?.careerLevel?.value;
    if (careerLevel !== undefined && careerLevel !== null && careerLevel !== '') {
      basicInfo.careerLevel = careerLevel;
    }

    // Status/Class
    if (system.details?.status?.value) {
      basicInfo.status = system.details.status.value;
    }
    if (system.details?.status?.tier !== undefined) {
      basicInfo.statusTier = system.details.status.tier;
    }
    if (system.details?.status?.standing !== undefined) {
      basicInfo.statusStanding = system.details.status.standing;
    }

    // Experience
    if (system.details?.experience) {
      basicInfo.experience = {
        current: system.details.experience.current || 0,
        total: system.details.experience.total || 0,
        spent: system.details.experience.spent || 0,
      };
    }

    // BUG-328: always build basicInfo.biography so sections:['biography'] filter
    // returns the nested object even when motivation/ambitions are unset.
    // The flat sibling keys (gmNotes, experience, experienceLog) remain at the
    // basicInfo level and are picked by the biography section filter correctly.
    basicInfo.biography = {};
    if (system.details?.motivation?.value) {
      basicInfo.biography.motivation = system.details.motivation.value;
    }
    if (system.details?.["personal-ambitions"]?.["short-term"]) {
      basicInfo.biography.shortTermAmbition = system.details["personal-ambitions"]["short-term"];
    }
    if (system.details?.["personal-ambitions"]?.["long-term"]) {
      basicInfo.biography.longTermAmbition = system.details["personal-ambitions"]["long-term"];
    }
    // Party ambitions — BUG-184
    const pa = system.details?.["party-ambitions"];
    if (pa) {
      if (pa.name) basicInfo.biography.partyAmbitionName = pa.name;
      if (pa["short-term"]) basicInfo.biography.partyAmbitionShort = pa["short-term"];
      if (pa["long-term"]) basicInfo.biography.partyAmbitionLong = pa["long-term"];
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

  private extractStats(characterData: FoundryRawActor): CharacterStatsView {
    const system = characterData.system || {};
    const stats: CharacterStatsView = {};

    // WFRP 4e Characteristics (WS, BS, S, T, I, Ag, Dex, Int, WP, Fel)
    if (system.characteristics) {
      stats.characteristics = {};
      const charMap: Record<string, string> = {
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
          const char = characteristic as any; // Object.entries values are genuinely-Foundry-untyped
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
    const skillItems = items.filter((item: FoundryRawItem) => item.type === 'skill');

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
    const talentItems = items.filter((item: FoundryRawItem) => item.type === 'talent');

    if (talentItems.length > 0) {
      stats.talents = talentItems.map((talent: FoundryRawItem) => ({
        name: talent.name,
        advances: talent.system?.advances?.value || 1,
        tests: talent.system?.tests?.value || '',
        description: this.truncateText(talent.system?.description?.value || '', 200)
      }));
    }

    // WFRP Traits - Extract creature traits
    const traitItems = items.filter((item: FoundryRawItem) => item.type === 'trait');

    if (traitItems.length > 0) {
      stats.traits = traitItems.map((trait: FoundryRawItem) => ({
        name: trait.name,
        specification: trait.system?.specification?.value || '',
        description: this.truncateText(trait.system?.description?.value || '', 200)
      }));
    }

    return stats;
  }

  private formatItems(items: FoundryRawItem[]): CharacterItemView[] {
    // Filter out non-inventory items:
    // - skills, talents, traits: handled in stats section
    // - career: shown in basicInfo.career
    // - money: aggregated in basicInfo.money
    // - critical: shown in basicInfo.criticalWounds
    // - injury, mutation, disease, psychology: status effects, not inventory
    const inventoryItems = items.filter((item: FoundryRawItem) =>
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

  private formatConditions(items: FoundryRawItem[]): CharacterConditionsView {
    // Extract status condition items (injuries, mutations, diseases, psychology)
    const conditions: CharacterConditionsView = {};

    const injuries = items.filter((item: FoundryRawItem) => item.type === 'injury');
    if (injuries.length > 0) {
      conditions.injuries = injuries.map((injury: FoundryRawItem) => ({
        name: injury.name,
        location: injury.system?.location?.value || '',
        description: this.truncateText(injury.system?.description?.value || '', 200),
      }));
    }

    const mutations = items.filter((item: FoundryRawItem) => item.type === 'mutation');
    if (mutations.length > 0) {
      conditions.mutations = mutations.map((mutation: FoundryRawItem) => ({
        name: mutation.name,
        type: mutation.system?.mutationType?.value || '',
        description: this.truncateText(mutation.system?.description?.value || '', 200),
      }));
    }

    const diseases = items.filter((item: FoundryRawItem) => item.type === 'disease');
    if (diseases.length > 0) {
      conditions.diseases = diseases.map((disease: FoundryRawItem) => ({
        name: disease.name,
        contraction: disease.system?.contraction?.value || '',
        incubation: disease.system?.incubation?.value || '',
        duration: disease.system?.duration?.value || '',
        symptoms: disease.system?.symptoms?.value || '',
        description: this.truncateText(disease.system?.description?.value || '', 200),
      }));
    }

    const psychology = items.filter((item: FoundryRawItem) => item.type === 'psychology');
    if (psychology.length > 0) {
      conditions.psychology = psychology.map((psych: FoundryRawItem) => ({
        name: psych.name,
        description: this.truncateText(psych.system?.description?.value || '', 200),
      }));
    }

    // Note: Active effects-based conditions (Fatigued, Poisoned, etc.) with counts
    // are handled by extracting from character.effects, not items.
    // Those will need to be added to formatEffects to show condition values.

    return conditions;
  }

  private formatEffects(effects: FoundryRawEffect[]): CharacterEffectView[] {
    return effects.map(effect => {
      const formattedEffect: CharacterEffectView = {
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
