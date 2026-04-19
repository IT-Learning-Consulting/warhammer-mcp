import { ListActiveEffectsInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface ListActiveEffectsToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class ListActiveEffectsTool {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: ListActiveEffectsToolOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'ListActiveEffectsTool' });
  }

  getToolDefinitions() {
    return [
      {
        name: 'list-active-effects',
        description: 'List active effects on a WFRP 4e actor with a projection (id, name, statuses, disabled, duration, origin, changes). Read-only.',
        inputSchema: {
          type: 'object',
          properties: {
            actorId: { type: 'string', description: 'Target actor ID.' },
            filter: {
              type: 'string',
              enum: ['all', 'applied', 'temporary', 'conditions'],
              default: 'all',
              description: 'applied = !disabled; temporary = has rounds/turns/seconds; conditions = has condition status.',
            },
          },
          required: ['actorId'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = ListActiveEffectsInput.parse(args);
    this.logger.info('list-active-effects', parsed);
    return await this.foundryClient.query<any>('warhammer-mcp.listActiveEffects', parsed);
  }
}
