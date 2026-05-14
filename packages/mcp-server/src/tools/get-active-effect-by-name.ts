// TOOL-IDEA-003 (2026-05-14): read-only AE-by-name resolver.
// Replaces the update-active-effect + returnFullPayload=true discovery workaround
// (a write tool pretending to be a read). Reuses ItemTarget so the resolution path
// matches add/update/delete-active-effect's `_resolveItem` → `_findEffect` chain.

import { GetActiveEffectByNameInput, ITEM_TARGET_JSON_SCHEMA } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface GetActiveEffectByNameToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class GetActiveEffectByNameTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'get-active-effect-by-name',
        title: 'Get Active Effect By Name',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        description:
          'Look up an ActiveEffect on a specific item by id or name without mutating it. TOOL-IDEA-003 (2026-05-14). Reuses the same `_findEffect` resolver as update/delete-active-effect: effectId is authoritative; effectName is a case-insensitive exact-name fallback (first match wins). Pure read — no .update() or deleteEmbeddedDocuments calls.\n\nUse when: you need an AE\'s id (and/or projection) before calling update/delete-active-effect, and you don\'t want the write-side workaround of update-active-effect with returnFullPayload=true.\n\nReturns: `{success, scope, actorId, itemId, itemName, effectId, effectName, parentType:"Item", parentId, parentName, effect: {id, name, img, statuses, disabled, duration, origin, changes}}`.\n\nScope: this tool searches `item.effects`. To search actor-level AEs by name, use `list-active-effects` and filter the response in your code.',
        inputSchema: {
          type: 'object',
          properties: {
            target: {
              ...(ITEM_TARGET_JSON_SCHEMA as any),
              description: 'ItemTarget (same shape as add/update/delete-active-effect).',
            },
            effectId: {
              type: 'string',
              description: 'Effect ID. Authoritative when supplied.',
            },
            effectName: {
              type: 'string',
              description: 'Effect name. Case-insensitive exact match; first match wins. Provide effectId when available.',
            },
          },
          required: ['target'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = GetActiveEffectByNameInput.parse(args);
    if (!parsed.effectId && !parsed.effectName) {
      throw new Error('get-active-effect-by-name requires one of effectId or effectName');
    }
    this.logger.info('get-active-effect-by-name', {
      scope: parsed.target.scope,
      effectId: parsed.effectId,
      effectName: parsed.effectName,
    });
    return await this.query<any>('getActiveEffectByName', parsed);
  }
}
