import { DeleteItemInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface DeleteItemToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class DeleteItemTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'delete-item',
        title: 'Delete Item',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: true,
          openWorldHint: true,
        },
        description:
          'Delete an item. Supports both actor-embedded and world-scope items. Thin pass-through to the Foundry-module deleteItem query — does not enforce WFRP rules. The system\'s deleteItem hook chain auto-removes any Active Effects the item embedded (research §7.4). Legacy shape `{actorId, itemId}` still accepted for backward compat. New shape: `{destination: {type:"actor"|"world", ...}, itemId? or itemName?}`. Used by /wfrp-mutation remove, /wfrp-disease cure, /wfrp-critical remove, and world-item cleanup flows.',
        inputSchema: {
          type: 'object',
          properties: {
            actorId: {
              type: 'string',
              description: 'Legacy: owning actor ID. Use `destination` for world-scope items.',
            },
            itemId: {
              type: 'string',
              description: 'Item ID (embedded or world). Authoritative.',
            },
            itemName: {
              type: 'string',
              description: 'Item name (case-insensitive). First match wins if ambiguous.',
            },
            destination: {
              type: 'object',
              description:
                'Scope discriminator. `{type:"actor", actorId?|actorName?}` or `{type:"world"}`.',
              additionalProperties: true,
            },
          },
          required: [],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = DeleteItemInput.parse(args);
    this.logger.info('delete-item', {
      actorId: parsed.actorId,
      itemId: parsed.itemId,
      itemName: parsed.itemName,
      destinationType: parsed.destination?.type,
    });
    return await this.query<any>('deleteItem', parsed);
  }
}
