import { UpdateItemInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface UpdateItemToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class UpdateItemTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'update-item',
        title: 'Update Item',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          'Apply an arbitrary update to an item. Supports both actor-embedded and world-scope items. Thin pass-through to the Foundry-module updateItem query — does not enforce WFRP rules. Legacy shape `{actorId, itemId, updateData}` still accepted for backward compat. New shape: `{destination: {type:"actor"|"world", ...}, itemId? or itemName?, updateData}`. Used by skills like /wfrp-advance to write skill.system.advances.value or talent.system.advances.value, and by world-item maintenance flows.',
        inputSchema: {
          type: 'object',
          properties: {
            actorId: {
              type: 'string',
              description: 'Legacy: owning actor ID (actor-embedded lookup). Use `destination` for world-scope items.',
            },
            itemId: {
              type: 'string',
              description: 'Item ID (embedded or world). Authoritative.',
            },
            itemName: {
              type: 'string',
              description: 'Item name (case-insensitive). First match wins if ambiguous. Use itemId when the id is known.',
            },
            destination: {
              type: 'object',
              description:
                'Scope discriminator. `{type:"actor", actorId?|actorName?}` targets an embedded item on that actor. `{type:"world"}` targets an item in the world Items sidebar.',
              additionalProperties: true,
            },
            updateData: {
              type: 'object',
              additionalProperties: true,
              description:
                'Foundry update payload. Keys can be dot-paths (e.g. "system.advances.value"); values are the new values.',
            },
          },
          required: ['updateData'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = UpdateItemInput.parse(args);
    this.logger.info('update-item', {
      actorId: parsed.actorId,
      itemId: parsed.itemId,
      itemName: parsed.itemName,
      destinationType: parsed.destination?.type,
      paths: Object.keys(parsed.updateData),
    });
    return await this.query<any>('updateItem', parsed);
  }
}
