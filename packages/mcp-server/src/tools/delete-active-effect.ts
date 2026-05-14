import { DeleteActiveEffectInput, ITEM_TARGET_JSON_SCHEMA } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface DeleteActiveEffectToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class DeleteActiveEffectTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'delete-active-effect',
        title: 'Delete Active Effect',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          'Remove an ActiveEffect from an item. effectId is authoritative; effectName is the ergonomic fallback. Supply one.\n\nArgs:\n  - target (ItemTarget): scope=actor (needs actorId/actorName + itemId/itemName) or scope=world (needs itemId/itemName).\n  - effectId (string, optional): Effect UUID — use when available (authoritative).\n  - effectName (string, optional): Effect name — first match wins. Use when effectId is unknown.\n\nReturns:\n  - On success: deletion confirmation with the removed effectId.\n  - On error: throws with an actionable message.\n\nUse when: removing a script-injected or condition-linked effect from a specific item. Don\'t use when: removing a WFRP4e condition (use remove-condition instead).',
        inputSchema: {
          type: 'object',
          properties: {
            target: {
              ...(ITEM_TARGET_JSON_SCHEMA as any),
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
    return await this.query<any>('deleteActiveEffect', parsed);
  }
}
