import { DuplicateActorInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface DuplicateActorToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class DuplicateActorTool {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: DuplicateActorToolOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'DuplicateActorTool' });
  }

  getToolDefinitions() {
    return [
      {
        name: 'duplicate-actor',
        description:
          'Clone a world actor by ID, optionally renaming. Thin pass-through to the Foundry-module duplicateActor query — persists the clone via Actor.create(source.toObject()) with _id/folder/sort stripped. Preferred over createActorFromCompendium when the source is a user-curated world template (e.g. clean NPC-type species bases for /wfrp-build-npc).',
        inputSchema: {
          type: 'object',
          properties: {
            sourceActorId: {
              type: 'string',
              description: 'World actor ID to duplicate.',
            },
            newName: {
              type: 'string',
              description: 'Optional name for the clone. Defaults to the source actor name.',
            },
          },
          required: ['sourceActorId'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = DuplicateActorInput.parse(args);
    this.logger.info('duplicate-actor', {
      sourceActorId: parsed.sourceActorId,
      newName: parsed.newName,
    });
    return await this.foundryClient.query<any>('warhammer-mcp.duplicateActor', parsed);
  }
}
