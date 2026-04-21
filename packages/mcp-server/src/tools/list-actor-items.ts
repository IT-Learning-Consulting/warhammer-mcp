import { ListActorItemsInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface ListActorItemsToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class ListActorItemsTool {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: ListActorItemsToolOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'ListActorItemsTool' });
  }

  getToolDefinitions() {
    return [
      {
        name: 'list-actor-items',
        description:
          'List all embedded items on an actor with their IDs, optionally filtered by type. Thin pass-through to the Foundry-module listActorItems query. Surfaces the raw {id, name, type, advances} shape that get-character hides under its formatted projection. Needed by /wfrp-build-npc Branch 3 to look up skill/talent item IDs for update-item advances writes.',
        inputSchema: {
          type: 'object',
          properties: {
            actorId: {
              type: 'string',
              description: 'Target actor ID.',
            },
            typeFilter: {
              type: 'string',
              description: 'Optional item type filter (e.g. "skill", "talent", "career", "trait"). Omit to list all embedded items.',
            },
          },
          required: ['actorId'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = ListActorItemsInput.parse(args);
    this.logger.info('list-actor-items', {
      actorId: parsed.actorId,
      typeFilter: parsed.typeFilter,
    });
    return await this.foundryClient.query<any>('warhammer-mcp.listActorItems', parsed);
  }
}
