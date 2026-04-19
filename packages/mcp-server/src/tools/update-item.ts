import { UpdateItemInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface UpdateItemToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class UpdateItemTool {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: UpdateItemToolOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'UpdateItemTool' });
  }

  getToolDefinitions() {
    return [
      {
        name: 'update-item',
        description:
          'Apply an arbitrary update to an embedded item on an actor. Thin pass-through to the Foundry-module updateItem query — does not enforce WFRP rules. Used by skills like /wfrp-advance to write skill.system.advances.value or talent.system.advances.value.',
        inputSchema: {
          type: 'object',
          properties: {
            actorId: {
              type: 'string',
              description: 'Owning actor ID.',
            },
            itemId: {
              type: 'string',
              description: 'Embedded item ID on the actor.',
            },
            updateData: {
              type: 'object',
              additionalProperties: true,
              description:
                'Foundry update payload. Keys can be dot-paths (e.g. "system.advances.value"); values are the new values.',
            },
          },
          required: ['actorId', 'itemId', 'updateData'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = UpdateItemInput.parse(args);
    this.logger.info('update-item', {
      actorId: parsed.actorId,
      itemId: parsed.itemId,
      paths: Object.keys(parsed.updateData),
    });
    return await this.foundryClient.query<any>('warhammer-mcp.updateItem', parsed);
  }
}
