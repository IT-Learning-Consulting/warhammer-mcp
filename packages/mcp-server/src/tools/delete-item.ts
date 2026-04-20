import { DeleteItemInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface DeleteItemToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class DeleteItemTool {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: DeleteItemToolOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'DeleteItemTool' });
  }

  getToolDefinitions() {
    return [
      {
        name: 'delete-item',
        description:
          'Delete an embedded item from an actor. Thin pass-through to the Foundry-module deleteItem query — does not enforce WFRP rules. The system\'s deleteItem hook chain auto-removes any Active Effects the item embedded (research §7.4). Used by /wfrp-mutation remove, /wfrp-disease cure, /wfrp-critical remove.',
        inputSchema: {
          type: 'object',
          properties: {
            actorId: {
              type: 'string',
              description: 'Owning actor ID.',
            },
            itemId: {
              type: 'string',
              description: 'Embedded item ID to delete.',
            },
          },
          required: ['actorId', 'itemId'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = DeleteItemInput.parse(args);
    this.logger.info('delete-item', {
      actorId: parsed.actorId,
      itemId: parsed.itemId,
    });
    return await this.foundryClient.query<any>('warhammer-mcp.deleteItem', parsed);
  }
}
