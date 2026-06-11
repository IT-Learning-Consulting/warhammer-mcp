import { UpdateActiveEffectInput, ACTIVE_EFFECT_TARGET_JSON_SCHEMA } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface UpdateActiveEffectToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class UpdateActiveEffectTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'update-active-effect',
        title: 'Update Active Effect',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          'Modify an existing ActiveEffect on an item or directly on an actor. Partial update — only fields supplied in `updates` are applied; other fields on the effect are preserved. effectId is authoritative; effectName is the ergonomic fallback. Supply one.\n\nTarget scopes: scope="actor" (item on actor), scope="world" (world item), scope="actor-direct" (effect directly on the actor — actorId or actorName, no item fields).\n\nSecurity: script / preApplyScript / enableScript fields are executed by Foundry under GM authority. MCP does not sandbox script content. Only invoke with scripts you wrote or audited.',
        inputSchema: {
          type: 'object',
          properties: {
            target: {
              ...(ACTIVE_EFFECT_TARGET_JSON_SCHEMA as any),
              description: 'ActiveEffectTarget: scope="actor" (item on actor), scope="world" (world item), or scope="actor-direct" (effect directly on actor — actorId/actorName, no item fields).',
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
    return await this.query<any>('updateActiveEffect', parsed);
  }
}
