// TOOL-IDEA-003 (2026-05-14): read-only AE-by-name resolver.
// Replaces the update-active-effect + returnFullPayload=true discovery workaround.
// Phase 4 mcp_coverage_expansion: target widened to ActiveEffectTarget — adds scope='actor-direct'
// which searches actor.effects directly and returns parentType:'Actor'.

import {
  GetActiveEffectByNameInput,
  ACTIVE_EFFECT_TARGET_JSON_SCHEMA,
  type GetActiveEffectByNameOutputType,
} from '@foundry-mcp/shared';
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

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'get-active-effect-by-name', handler: (args: any) => this.handle(args) },
    ];
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
          `Look up an ActiveEffect by id or name without mutating it. TOOL-IDEA-003 (2026-05-14). effectId is authoritative; effectName is a case-insensitive exact-name fallback (first match wins). Pure read — no .update() or deleteEmbeddedDocuments calls.

Use this when:
- Resolving an effect's id/full projection by name before calling update-active-effect or delete-active-effect.
- Confirming an effect created via add-active-effect actually persisted, by looking it up afterward.
- Inspecting a single known effect's changes/duration/disabled state without listing every effect on the item/actor.
- Reading an actor-direct effect (scope="actor-direct") such as a one-off modifier placed straight on the actor.

Do NOT use this when the effect's name/id is unknown and needs enumeration first — use list-active-effects to enumerate, then call this tool with the resolved name/id.

Target scopes:
  - scope="actor" — searches item.effects on a specific item owned by an actor.
  - scope="world" — searches item.effects on a world-scope item.
  - scope="actor-direct" — searches actor.effects directly (actorId or actorName; no item fields). Returns parentType:"Actor".

Returns: \`{success, scope, actorId, itemId, itemName, effectId, effectName, parentType:"Actor"|"Item", parentId, parentName, effect: {id, name, img, statuses, disabled, duration, origin, changes}}\`.

Performance Notes:
- Single small response: one effect's projection, no full item/actor payload. Mode-less — no response-mode variance.`,
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
    return await this.query<GetActiveEffectByNameOutputType>('getActiveEffectByName', parsed);
  }
}
