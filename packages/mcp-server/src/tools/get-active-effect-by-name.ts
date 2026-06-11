// TOOL-IDEA-003 (2026-05-14): read-only AE-by-name resolver.
// Replaces the update-active-effect + returnFullPayload=true discovery workaround.
// Phase 4 mcp_coverage_expansion: target widened to ActiveEffectTarget — adds scope='actor-direct'
// which searches actor.effects directly and returns parentType:'Actor'.

import { GetActiveEffectByNameInput, ACTIVE_EFFECT_TARGET_JSON_SCHEMA } from '@foundry-mcp/shared';
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
          'Look up an ActiveEffect by id or name without mutating it. TOOL-IDEA-003 (2026-05-14). effectId is authoritative; effectName is a case-insensitive exact-name fallback (first match wins). Pure read — no .update() or deleteEmbeddedDocuments calls.\n\nTarget scopes:\n  - scope="actor" — searches item.effects on a specific item owned by an actor.\n  - scope="world" — searches item.effects on a world-scope item.\n  - scope="actor-direct" — searches actor.effects directly (actorId or actorName; no item fields). Returns parentType:"Actor".\n\nUse when: you need an AE\'s id or projection before calling update/delete-active-effect.\n\nReturns: `{success, scope, actorId, itemId, itemName, effectId, effectName, parentType:"Actor"|"Item", parentId, parentName, effect: {id, name, img, statuses, disabled, duration, origin, changes}}`.',
        inputSchema: {
          type: 'object',
          properties: {
            target: {
              ...(ACTIVE_EFFECT_TARGET_JSON_SCHEMA as any),
              description: 'ActiveEffectTarget: scope="actor" (item on actor), scope="world" (world item), or scope="actor-direct" (search actor.effects directly — actorId/actorName, no item fields; returns parentType:"Actor").',
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
