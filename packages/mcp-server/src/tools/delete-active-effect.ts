import {
  DeleteActiveEffectInput,
  ACTIVE_EFFECT_TARGET_JSON_SCHEMA,
  DeleteActiveEffectOutput,
  type DeleteActiveEffectOutputType,
  DELETE_ACTIVE_EFFECT_OUTPUT_JSON_SCHEMA,
} from '@foundry-mcp/shared';
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

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'delete-active-effect', handler: (args: any) => this.handle(args) },
    ];
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
          `Remove an ActiveEffect from an item or directly from an actor. effectId is authoritative; effectName is the ergonomic fallback. Supply one.

Use this when:
- Removing a custom script-injected effect from an item once it's no longer needed (e.g. an expired one-off buff).
- Removing a one-off actor-direct modifier via scope="actor-direct" (e.g. clearing a manually applied −10 WS debuff).
- Cleaning up an effect created via add-active-effect that was mis-specified, after re-authoring it.
- Removing an effect by known effectId, or by effectName when the id is unknown (first match wins).

Do NOT use this to remove a standard WFRP4e condition (Fatigued, Poisoned, Broken, etc.) — use manage-conditions (remove-condition action) instead, which manages the canonical condition set correctly.

Args:
  - target (ActiveEffectTarget): scope=actor (actorId/actorName + itemId/itemName), scope=world (itemId/itemName), or scope=actor-direct (actorId or actorName; no item fields).
  - effectId (string, optional): Effect ID — use when available (authoritative).
  - effectName (string, optional): Effect name — first match wins. Use when effectId is unknown.

Returns:
  - On success: deletion confirmation with the removed effectId. parentType:"Actor" when scope="actor-direct".
  - On error: throws with an actionable message.

Performance Notes:
- Single small response: deletion confirmation with the removed effectId, no full document payload. Mode-less — no response-mode variance.`,
        inputSchema: {
          type: 'object',
          properties: {
            target: {
              ...(ACTIVE_EFFECT_TARGET_JSON_SCHEMA as any),
              description: 'ActiveEffectTarget: scope="actor" (item on actor), scope="world" (world item), or scope="actor-direct" (effect directly on actor — actorId/actorName, no item fields).',
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
        outputSchema: DELETE_ACTIVE_EFFECT_OUTPUT_JSON_SCHEMA,
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
    // Phase 11 (R11.1): envelope wrap; content[0].text === JSON.stringify(data)
    // preserves the prior auto-wrapped wire text (additive structuredContent).
    const data = await this.query<DeleteActiveEffectOutputType>('deleteActiveEffect', parsed);
    DeleteActiveEffectOutput.parse(data);
    return { content: [{ type: 'text' as const, text: JSON.stringify(data) }], structuredContent: data };
  }
}
