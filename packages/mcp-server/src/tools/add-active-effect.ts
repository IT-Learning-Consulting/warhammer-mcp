import {
  AddActiveEffectInput,
  ACTIVE_EFFECT_TARGET_JSON_SCHEMA,
  AddActiveEffectOutput,
  type AddActiveEffectOutputType,
  ADD_ACTIVE_EFFECT_OUTPUT_JSON_SCHEMA,
} from '@foundry-mcp/shared';
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

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
      { name: 'add-active-effect', handler: (args: any) => this.handle(args) },
    ];
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
          'Attach an ActiveEffect to an existing item on an actor or in the world, or place a one-off effect directly on an actor (no carrier item needed). Uses the same flat {name, trigger, script, ...} effect shape as create-custom-item\'s effects[] field — buildEffectPayload (shared) transforms it into the Foundry nested shape.\n\nTarget scopes:\n  - scope="actor" — effect on a specific item owned by an actor (actorId/actorName + itemId/itemName).\n  - scope="world" — effect on a world-scope item (itemId/itemName).\n  - scope="actor-direct" — effect placed directly on the actor itself (actorId or actorName; no item fields). Use this for one-off modifiers such as a −10 WS debuff on an NPC.\n\nname + trigger are the required fields on effect; script defaults to "" and is optional.\n\nReturns:\n  - On success: created effect ID (and full document if returnFullPayload=true). parentType:"Actor" when scope="actor-direct".\n  - On error: throws with an actionable message.\n\nUse when: adding a rule-modifying effect to an item or directly to an actor. Don\'t use when: adding a WFRP4e condition — use apply-condition instead.\n\nSecurity: script / preApplyScript / enableConditionScript fields are executed by Foundry under GM authority. MCP does not sandbox script content. Only invoke with scripts you wrote or audited.',
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
                  description:
                    'TransferData config object (not a boolean) — controls how/when the AE is routed off its source document. buildEffectPayload inflates this into system.transferData (nesting corrected + live-verified against wfrp4e.js\'s own _migrateEffectFlags, BUG-644). Defaults to {type:"document", documentType:"Actor"}, i.e. classic transfer to the owning actor — the right default for talents/traits/passive buffs. The owner-transfer type is "document"; the legacy alias "ownership" is accepted but normalized to "document" (warhammer-lib only ever dispatches on "document", so a raw "ownership" effect silently never applies).',
                  properties: {
                    type: {
                      type: 'string',
                      enum: ['document', 'damage', 'target', 'area', 'aura', 'crew', 'other', 'ownership'],
                      description:
                        'document = transfer to owning actor (default); damage = applied to whoever takes damage from the owner; target = applied to a test target; area/aura = template-based; crew = vehicle crew transfer; other = manual routing. "ownership" is a deprecated alias for "document". Canonical list: WFRP4E.transferTypes (wfrp4e.js).',
                    },
                    documentType: {
                      type: 'string',
                      enum: ['Actor', 'Item'],
                      description: 'What the effect applies TO once transferred. Default "Actor".',
                    },
                    avoidable: { type: 'boolean', description: 'Whether the target can attempt to avoid the effect.' },
                    avoidTest: { type: 'object', additionalProperties: true, description: 'Avoid-test config (skill/difficulty), passed through as-is.' },
                    testIndependent: { type: 'boolean', description: 'Effect applies independent of any test outcome.' },
                    preApplyScript: { type: 'string', description: 'JS run before the effect applies, under GM authority.' },
                    equipTransfer: { type: 'boolean', description: 'Only transfers while the carrying item is equipped.' },
                    enableConditionScript: { type: 'string', description: 'JS gating whether the effect is currently active (BUG-644: renamed from the dead "enableScript").' },
                    filter: {
                      oneOf: [{ type: 'boolean' }, { type: 'string' }],
                      description: 'Filter condition gating application; exact leaf shape not fully live-verified (boolean or key into a filter-values config).',
                    },
                    prompt: { type: 'boolean', description: 'Prompt the affected party before applying.' },
                    selfOnly: { type: 'boolean', description: 'Only affects the source actor, never transfers.' },
                    area: {
                      type: 'object',
                      properties: {
                        radius: { oneOf: [{ type: 'number' }, { type: 'string' }], description: 'Number or overcast-derived formula string.' },
                        templateData: { type: 'string' },
                        duration: { type: 'string' },
                        keep: { type: 'boolean' },
                        aura: {
                          type: 'object',
                          properties: { render: { type: 'boolean' }, transferred: { type: 'boolean' } },
                        },
                      },
                      description: '[type=area/aura] Template + aura sub-config.',
                    },
                  },
                  additionalProperties: true,
                },
                disabled: { type: 'boolean' },
                changes: { type: 'array', items: { type: 'object' } },
                statuses: { type: 'array', items: { type: 'string' } },
                duration: { type: 'object', additionalProperties: true },
                flags: { type: 'object', additionalProperties: true },
                equipTransfer: { type: 'boolean', description: 'Flat shortcut for transfer.equipTransfer.' },
                enableConditionScript: { type: 'string', description: 'Flat shortcut for transfer.enableConditionScript (BUG-644: renamed from the dead "enableScript").' },
                preApplyScript: { type: 'string', description: 'Flat shortcut for transfer.preApplyScript.' },
                testIndependent: { type: 'boolean', description: 'Flat shortcut for transfer.testIndependent.' },
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
        outputSchema: ADD_ACTIVE_EFFECT_OUTPUT_JSON_SCHEMA,
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
    // Phase 11 (R11.1): envelope wrap; content[0].text === JSON.stringify(data)
    // preserves the prior auto-wrapped wire text (additive structuredContent).
    const data = await this.query<AddActiveEffectOutputType>('addActiveEffect', parsed);
    AddActiveEffectOutput.parse(data);
    return { content: [{ type: 'text' as const, text: JSON.stringify(data) }], structuredContent: data };
  }
}
