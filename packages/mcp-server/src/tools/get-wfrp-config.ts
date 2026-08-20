import { GetWfrp4eConfigInput, GetWfrpConfigOutput, GET_WFRP_CONFIG_OUTPUT_JSON_SCHEMA } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface GetWfrpConfigToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class GetWfrpConfigTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'get-wfrp-config', handler: (args: any) => this.handle(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'get-wfrp-config',
        title: 'Get WFRP Config',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        description:
          `Read whitelisted CONFIG.WFRP4E.* keys (game.wfrp4e.config.*) for skill-side rule lookups. Skills use this to read authoritative tables (xpCost, talentMax, statusTiers, earningValues, conditions, ...) instead of hardcoding values. Returns \`{ values: { [key]: resolvedValue, ... }, skipped: [...] }\`: each requested key in the allowlist appears under \`values\`; unknown/disallowed keys land in \`skipped[]\` so callers can detect typos. Access example: \`result.values.statusTiers\`.

Use this when:
- Reading an authoritative WFRP4e rule table (xpCost, talentMax, statusTiers, earningValues, conditions, weaponQualities, etc.) instead of hardcoding a value that could drift from the live system config.
- Resolving i18n-localized labels server-side (e.g. "Defeated" rather than the raw "WFRP4E.ConditionName.Defeated" key).
- Batch-reading multiple config keys in one call via the \`keys\` array.
- Detecting a typo'd or disallowed key name via the \`skipped[]\` array in the response.

Do NOT use a hardcoded copy of a WFRP rule value that exists in the allowlist below — read it via this tool instead; there is no sibling tool boundary here, the misuse is authoring a stale hardcoded copy of a value this tool already exposes live.

Allowlist (53 keys): xpCost, talentMax, characteristics, characteristicsAbbrev, characteristicsBonus, careerLevels, statusTiers, earningValues, moneyValues, moneyNames, conditions, difficultyModifiers, symptoms, mutationTypes, corruptionTables, hitLocationTables, weaponQualities, weaponFlaws, qualityDescriptions, flawDescriptions, weaponGroups, ammunitionGroups, armorTypes, species, subspecies, speciesSkills, speciesTalents, speciesCharacteristics, speciesHeight, speciesMovement, speciesFate, speciesRes, speciesRandomTalents, availability, availabilityTable, trappingCategories, trade, armorQualities, armorFlaws, rangeBands, rangeModifiers, reachNum, groupAdvantageActions, magicLores, magicWind, overCastTablesPerWind, prayerTypes, actorSizes, itemQualities, itemFlaws, trappingTypes, difficultyLabels, vehicleTypes.

Values are i18n-resolved server-side (e.g. "Defeated" not "WFRP4E.ConditionName.Defeated"). The response uses a \`{values, skipped}\` envelope so a future allowlist key literally named "skipped" cannot collide with the bookkeeping field.

**BUG-102 (2026-05-18)**: weaponQualities/weaponFlaws/qualityDescriptions/flawDescriptions/weaponGroups/ammunitionGroups/armorTypes added. **Phase 1 (wfrp_layer_expansion_v1, 2026-06-22)**: +30 keys covering species family, availability/trade, combat (armorQualities/Flaws, rangeBands/Modifiers, reachNum, groupAdvantageActions), magic (magicLores/Wind, overCastTablesPerWind, prayerTypes), actorSizes, itemQualities/Flaws, trappingTypes, difficultyLabels, vehicleTypes.

Performance Notes:
- Response scales with the number of keys requested — each resolves to its full table value under \`values\`. Request only the keys you need; unknown/disallowed keys are cheap (they land in \`skipped[]\`, not resolved).`,
        inputSchema: {
          type: 'object',
          properties: {
            keys: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              description:
                'Top-level CONFIG.WFRP4E key names to read. Example: ["xpCost", "talentMax"].',
            },
          },
          required: ['keys'],
        },
        outputSchema: GET_WFRP_CONFIG_OUTPUT_JSON_SCHEMA,
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = GetWfrp4eConfigInput.parse(args);
    this.logger.info('get-wfrp-config', { keys: parsed.keys });
    const output = await this.query<Record<string, unknown>>('getWfrp4eConfig', parsed);
    GetWfrpConfigOutput.parse(output);
    return {
      content: [{ type: 'text', text: JSON.stringify(output) }],
      structuredContent: output,
    };
  }
}
