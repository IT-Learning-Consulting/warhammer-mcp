import { DeleteTokenInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface DeleteTokenToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class DeleteTokenTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'delete-token',
        title: 'Delete Token',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: true,
          openWorldHint: true,
        },
        description:
          'Delete a single token from a scene. Thin pass-through to the Foundry-module deleteToken query — pairs with add-actors-to-scene for encounter unwind and orphan-token cleanup (BUG-051 companion). With prototypeToken.actorLink=false, deleting the world actor does NOT cascade-delete its tokens; this tool is the programmatic clean-up path.',
        inputSchema: {
          type: 'object',
          properties: {
            sceneId: {
              type: 'string',
              description: 'Owning scene document ID.',
            },
            tokenId: {
              type: 'string',
              description: 'Token document ID to delete.',
            },
          },
          required: ['sceneId', 'tokenId'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = DeleteTokenInput.parse(args);
    this.logger.info('delete-token', {
      sceneId: parsed.sceneId,
      tokenId: parsed.tokenId,
    });
    return await this.query<any>('deleteToken', parsed);
  }
}
