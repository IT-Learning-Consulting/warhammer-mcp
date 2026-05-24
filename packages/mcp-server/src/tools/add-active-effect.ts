import { AddActiveEffectInput, ITEM_TARGET_JSON_SCHEMA } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface AddActiveEffectToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class AddActiveEffectTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'add-active-effect',
        title: 'Add Active Effect',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          'Attach an ActiveEffect to an existing item on an actor or in the world. Uses the same flat {name, trigger, script, ...} effect shape as create-custom-item\'s effects[] field — buildEffectPayload (shared) transforms it into the Foundry nested shape. Target is an ItemTarget: `{scope:"actor", actorId?|actorName?, itemId?|itemName?}` or `{scope:"world", itemId?|itemName?}`. name + trigger are the required fields on effect; script defaults to "" and is optional.\n\nArgs:\n  - target (ItemTarget): scope=actor (actorId/actorName + itemId/itemName) or scope=world (itemId/itemName).\n  - effect (object): flat ActiveEffect — name (required), trigger (required, e.g. "prePrepareData"), script (optional, defaults to ""), and optional label/transfer/disabled/changes/statuses/duration/flags/equipTransfer/enableScript/preApplyScript/testIndependent.\n  - returnFullPayload (boolean, optional): if true, response includes the full created effect document.\n\nReturns:\n  - On success: created effect ID (and full document if returnFullPayload=true).\n  - On error: throws with an actionable message.\n\nUse when: adding a rule-modifying script effect to a specific item. Don\'t use when: adding a WFRP4e condition — use apply-condition instead.\n\nSecurity: script / preApplyScript / enableScript fields are executed by Foundry under GM authority. MCP does not sandbox script content. Only invoke with scripts you wrote or audited.',
        inputSchema: {
          type: 'object',
          properties: {
            target: {
              ...(ITEM_TARGET_JSON_SCHEMA as any),
              description:
                'Item target discriminator. scope="actor" needs one of actorId/actorName plus one of itemId/itemName. scope="world" needs one of itemId/itemName.',
            },
            effect: {
              type: 'object',
              description:
                'Flat ActiveEffect input. name + trigger are required; script defaults to "" and is optional. Other fields are optional. transfer is an optional object (not a boolean) — {disabled: boolean, actorId?: string, name?: string} — that controls whether the effect transfers to owned actors when the item is equipped; buildEffectPayload maps this object into the Foundry nested shape.',
              properties: {
                name: { type: 'string', minLength: 1, description: 'Effect display name (required).' },
                trigger: {
                  type: 'string',
                  description: 'WFRP4e ActiveEffect trigger key (required). E.g. "prePrepareData", "applyDamage", "rollTest".',
                },
                script: { type: 'string', description: 'JS body executed under GM authority. Defaults to "".' },
                label: { type: 'string' },
                transfer: {
                  type: 'object',
                  description: 'Transfer config object (not a boolean). Controls whether the AE transfers to owned actors when item is equipped. Keys: disabled (boolean), actorId (string, optional), name (string, optional). buildEffectPayload maps this into Foundry\'s nested ActiveEffect shape.',
                  properties: {
                    disabled: { type: 'boolean' },
                    actorId: { type: 'string' },
                    name: { type: 'string' },
                  },
                  additionalProperties: true,
                },
                disabled: { type: 'boolean' },
                changes: { type: 'array', items: { type: 'object' } },
                statuses: { type: 'array', items: { type: 'string' } },
                duration: { type: 'object', additionalProperties: true },
                flags: { type: 'object', additionalProperties: true },
                equipTransfer: { type: 'boolean' },
                enableScript: { type: 'string' },
                preApplyScript: { type: 'string' },
                testIndependent: { type: 'boolean' },
              },
              required: ['name', 'trigger'],
              additionalProperties: true,
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
    return await this.query<any>('addActiveEffect', parsed);
  }
}
