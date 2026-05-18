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
          'Read whitelisted CONFIG.WFRP4E.* keys (game.wfrp4e.config.*) for skill-side rule lookups. Skills use this to read authoritative tables (xpCost, talentMax, statusTiers, earningValues, conditions, ...) instead of hardcoding values. Returns `{ values: { [key]: resolvedValue, ... }, skipped: [...] }`: each requested key in the allowlist appears under `values`; unknown/disallowed keys land in `skipped[]` so callers can detect typos. Access example: `result.values.statusTiers`. Allowlist: xpCost, talentMax, characteristics, characteristicsAbbrev, characteristicsBonus, careerLevels, statusTiers, earningValues, moneyValues, moneyNames, conditions, difficultyModifiers, symptoms, mutationTypes, corruptionTables, hitLocationTables, weaponQualities, weaponFlaws, qualityDescriptions, flawDescriptions, weaponGroups, ammunitionGroups, armorTypes.\n\nValues are i18n-resolved server-side (e.g. "Defeated" not "WFRP4E.ConditionName.Defeated"). The response uses a `{values, skipped}` envelope so a future allowlist key literally named "skipped" cannot collide with the bookkeeping field.\n\n**BUG-102 (2026-05-18)**: weaponQualities/weaponFlaws/qualityDescriptions/flawDescriptions/weaponGroups/ammunitionGroups/armorTypes added — enables skills to verify registered weapon-quality labels (e.g. checking whether a homebrew "slash" key has been registered before authoring a weapon that uses it), look up canonical quality descriptions for tool-tip prose generation, and validate weaponGroup/armorType enum values against the live runtime instead of hardcoding the 17-group / 4-type lists.',
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
    const output = await this.query<any>('getWfrp4eConfig', parsed);
    GetWfrpConfigOutput.parse(output);
    return {
      content: [{ type: 'text', text: JSON.stringify(output) }],
      structuredContent: output,
    };
  }
}
