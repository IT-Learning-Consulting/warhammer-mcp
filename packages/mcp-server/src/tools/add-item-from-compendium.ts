import { AddItemFromCompendiumInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface AddItemFromCompendiumToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class AddItemFromCompendiumTool {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: AddItemFromCompendiumToolOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'AddItemFromCompendiumTool' });
  }

  getToolDefinitions() {
    return [
      {
        name: 'add-item-from-compendium',
        description:
          'Embed a compendium item onto an actor. Thin pass-through to the Foundry-module addItemFromCompendium query — preserves the source item\'s Active Effects chain (e.g. critical-wound bleeding, mutation stat penalties, disease incubation). Used by /wfrp-critical, /wfrp-mutation, /wfrp-disease, /wfrp-corruption. Does not enforce WFRP rules.',
        inputSchema: {
          type: 'object',
          properties: {
            actorId: {
              type: 'string',
              description: 'Target actor ID.',
            },
            compendiumId: {
              type: 'string',
              description: 'Full compendium UUID of the item to embed, e.g. "Compendium.wfrp4e-core.items.Item.sgBDLL1iLenHJ5um". Skills resolve this by calling search-compendium and constructing the UUID from pack.id + itemId.',
            },
          },
          required: ['actorId', 'compendiumId'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = AddItemFromCompendiumInput.parse(args);
    this.logger.info('add-item-from-compendium', {
      actorId: parsed.actorId,
      compendiumId: parsed.compendiumId,
    });
    return await this.foundryClient.query<any>('warhammer-mcp.addItemFromCompendium', parsed);
  }
}
