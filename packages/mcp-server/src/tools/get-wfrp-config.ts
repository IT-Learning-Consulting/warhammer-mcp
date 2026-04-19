import { GetWfrp4eConfigInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface GetWfrpConfigToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class GetWfrpConfigTool {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: GetWfrpConfigToolOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'GetWfrpConfigTool' });
  }

  getToolDefinitions() {
    return [
      {
        name: 'get-wfrp-config',
        description:
          'Read whitelisted CONFIG.WFRP4E.* keys (game.wfrp4e.config.*) for skill-side rule lookups. Skills use this to read authoritative tables (xpCost, talentMax, statusTiers, earningValues, conditions, ...) instead of hardcoding values. Returns { [key]: value } for each requested key in the allowlist; unknown keys are silently skipped. Allowlist: xpCost, talentMax, characteristics, characteristicsAbbrev, characteristicsBonus, careerLevels, statusTiers, earningValues, moneyValues, moneyNames, conditions, difficultyModifiers, symptoms, mutationTypes, corruptionTables.',
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
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = GetWfrp4eConfigInput.parse(args);
    this.logger.info('get-wfrp-config', { keys: parsed.keys });
    return await this.foundryClient.query<any>('warhammer-mcp.getWfrp4eConfig', parsed);
  }
}
