import { UpdateActiveEffectInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface UpdateActiveEffectToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class UpdateActiveEffectTool {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: UpdateActiveEffectToolOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'UpdateActiveEffectTool' });
  }

  getToolDefinitions() {
    return [
      {
        name: 'update-active-effect',
        description:
          'Modify an existing ActiveEffect on an item. Partial update — only fields supplied in `updates` are applied; other fields on the effect are preserved. effectId is authoritative; effectName is the ergonomic fallback. Supply one.',
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
              description: 'Effect ID. Authoritative when supplied.',
            },
            effectName: {
              type: 'string',
              description: 'Effect name — first match wins. Supply effectId when available.',
            },
            updates: {
              type: 'object',
              additionalProperties: true,
              description:
                'Partial flat effect input. Supply only the fields to change (e.g. {disabled: true} or {name: "New Name"}). Merge semantics.',
            },
            returnFullPayload: {
              type: 'boolean',
              description: 'If true, the response includes the full updated effect document.',
            },
          },
          required: ['target', 'updates'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = UpdateActiveEffectInput.parse(args);
    if (!parsed.effectId && !parsed.effectName) {
      throw new Error('update-active-effect requires one of effectId or effectName');
    }
    this.logger.info('update-active-effect', {
      scope: parsed.target.scope,
      effectId: parsed.effectId,
      effectName: parsed.effectName,
      updatedKeys: Object.keys(parsed.updates),
    });
    return await this.foundryClient.query<any>('warhammer-mcp.updateActiveEffect', parsed);
  }
}
