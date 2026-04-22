import { DeleteActiveEffectInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface DeleteActiveEffectToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class DeleteActiveEffectTool {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: DeleteActiveEffectToolOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'DeleteActiveEffectTool' });
  }

  getToolDefinitions() {
    return [
      {
        name: 'delete-active-effect',
        description:
          'Remove an ActiveEffect from an item. effectId is authoritative; effectName is the ergonomic fallback. Supply one.',
        inputSchema: {
          type: 'object',
          properties: {
            target: {
              type: 'object',
              additionalProperties: true,
              description: 'ItemTarget (same shape as add-active-effect).',
            },
            effectId: {
              type: 'string',
              description: 'Effect ID. Authoritative.',
            },
            effectName: {
              type: 'string',
              description: 'Effect name — first match wins.',
            },
          },
          required: ['target'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = DeleteActiveEffectInput.parse(args);
    if (!parsed.effectId && !parsed.effectName) {
      throw new Error('delete-active-effect requires one of effectId or effectName');
    }
    this.logger.info('delete-active-effect', {
      scope: parsed.target.scope,
      effectId: parsed.effectId,
      effectName: parsed.effectName,
    });
    return await this.foundryClient.query<any>('warhammer-mcp.deleteActiveEffect', parsed);
  }
}
