import { AddActiveEffectInput, ACTIVE_EFFECT_TARGET_JSON_SCHEMA } from '@foundry-mcp/shared';
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
          'Attach an ActiveEffect to an existing item on an actor or in the world, or place a one-off effect directly on an actor (no carrier item needed). Uses the same flat {name, trigger, script, ...} effect shape as create-custom-item\'s effects[] field — buildEffectPayload (shared) transforms it into the Foundry nested shape.\n\nTarget scopes:\n  - scope="actor" — effect on a specific item owned by an actor (actorId/actorName + itemId/itemName).\n  - scope="world" — effect on a world-scope item (itemId/itemName).\n  - scope="actor-direct" — effect placed directly on the actor itself (actorId or actorName; no item fields). Use this for one-off modifiers such as a −10 WS debuff on an NPC.\n\nname + trigger are the required fields on effect; script defaults to "" and is optional.\n\nReturns:\n  - On success: created effect ID (and full document if returnFullPayload=true). parentType:"Actor" when scope="actor-direct".\n  - On error: throws with an actionable message.\n\nUse when: adding a rule-modifying effect to an item or directly to an actor. Don\'t use when: adding a WFRP4e condition — use apply-condition instead.\n\nSecurity: script / preApplyScript / enableScript fields are executed by Foundry under GM authority. MCP does not sandbox script content. Only invoke with scripts you wrote or audited.',
        inputSchema: {
          type: 'object',
          properties: {
            target: {
              ...(ACTIVE_EFFECT_TARGET_JSON_SCHEMA as any),
              description:
                'ActiveEffect target. scope="actor": item on an actor (actorId/actorName + itemId/itemName). scope="world": world item (itemId/itemName). scope="actor-direct": effect directly on the actor (actorId or actorName; no item fields).',
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
                description: {
                  type: 'string',
                  description:
                    'User-facing effect description (HTML ok) shown when the effect is expanded on the sheet. ALWAYS set it — effects without a description are opaque to players/GMs (BUG-334).',
                },
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
