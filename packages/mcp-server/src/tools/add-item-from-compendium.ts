import { AddItemFromCompendiumInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface AddItemFromCompendiumToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class AddItemFromCompendiumTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'add-item-from-compendium',
        title: 'Add Item From Compendium',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          'Embed a compendium item onto an actor. Accepts the full Foundry UUID via itemUuid (preferred) or the legacy compendiumId alias (deprecated). Thin pass-through to the Foundry-module addItemFromCompendium query — preserves the source item\'s Active Effects chain (e.g. critical-wound bleeding, mutation stat penalties, disease incubation). Used by /wfrp-critical, /wfrp-mutation, /wfrp-disease, /wfrp-corruption. Does not enforce WFRP rules. Exactly one of {itemUuid, compendiumId} must be supplied. Pass skipSpecialisationChoice:true when adding bare isSpec skills (e.g. "Lore ()") to suppress the WFRP4e specialisation-choice dialog that would otherwise block autonomous flows.',
        inputSchema: {
          type: 'object',
          properties: {
            actorId: {
              type: 'string',
              description: 'Target actor ID.',
            },
            itemUuid: {
              type: 'string',
              description: 'Full Foundry document UUID of the compendium item to embed, e.g. "Compendium.wfrp4e-core.items.Item.sgBDLL1iLenHJ5um". Skills resolve this by calling search-compendium and constructing the UUID from pack.id + itemId. (Preferred over the deprecated `compendiumId` alias.)',
            },
            compendiumId: {
              type: 'string',
              description: 'Deprecated alias for itemUuid. Accepted for backwards compatibility — prefer itemUuid in new code.',
            },
            skipSpecialisationChoice: {
              type: 'boolean',
              description: 'When true, suppresses the WFRP4e specialisation-choice dialog for bare isSpec skills (e.g. "Lore ()", "Language ()"). Required for autonomous NPC/PC builds that embed specialisation skills without user interaction. Default false.',
            },
          },
          required: ['actorId'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = AddItemFromCompendiumInput.parse(args);
    const uuid = parsed.itemUuid ?? parsed.compendiumId;
    if (!uuid) {
      throw new Error('add-item-from-compendium: one of {itemUuid, compendiumId} is required.');
    }
    this.logger.info('add-item-from-compendium', {
      actorId: parsed.actorId,
      uuid,
    });
    return await this.query<any>('addItemFromCompendium', parsed);
  }
}
