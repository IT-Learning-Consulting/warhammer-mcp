import { AddActiveEffectInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface AddActiveEffectToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class AddActiveEffectTool {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: AddActiveEffectToolOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'AddActiveEffectTool' });
  }

  getToolDefinitions() {
    return [
      {
        name: 'add-active-effect',
        description:
          'Attach an ActiveEffect to an existing item on an actor or in the world. Uses the same flat {name, trigger, script, ...} effect shape as create-custom-item\'s effects[] field — buildEffectPayload (shared) transforms it into the Foundry nested shape. Target is an ItemTarget: `{scope:"actor", actorId?|actorName?, itemId?|itemName?}` or `{scope:"world", itemId?|itemName?}`.',
        inputSchema: {
          type: 'object',
          properties: {
            target: {
              type: 'object',
              additionalProperties: true,
              description:
                'Item target discriminator. scope="actor" needs one of actorId/actorName plus one of itemId/itemName. scope="world" needs one of itemId/itemName.',
            },
            effect: {
              type: 'object',
              additionalProperties: true,
              description:
                'Flat ActiveEffect input: name, trigger (e.g. "prePrepareData", "applyDamage"), script, and optional label/transfer/disabled/changes/statuses/duration/flags/equipTransfer/enableScript/preApplyScript/testIndependent.',
            },
            returnFullPayload: {
              type: 'boolean',
              description: 'If true, the response includes the full created effect document.',
            },
          },
          required: ['target', 'effect'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = AddActiveEffectInput.parse(args);
    this.logger.info('add-active-effect', {
      scope: parsed.target.scope,
      effectName: parsed.effect.name,
      trigger: parsed.effect.trigger,
    });
    return await this.foundryClient.query<any>('warhammer-mcp.addActiveEffect', parsed);
  }
}
