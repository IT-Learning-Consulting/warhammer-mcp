import {
  ListActiveEffectsInput,
  type ListActiveEffectsOutputType,
  type FoundryRawActor,
} from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface ListActiveEffectsToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class ListActiveEffectsTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'list-active-effects', handler: (args: any) => this.handle(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'list-active-effects',
        title: 'List Active Effects',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        description: 'List active effects on a WFRP 4e actor with a projection (id, name, statuses, disabled, duration, origin, changes, parentType, parentId, parentName). Read-only.\n\nArgs:\n  - actorId (string): Target actor UUID.\n  - filter (string, optional): "all" (default), "applied" (!disabled), "temporary" (has duration rounds/turns/seconds), "conditions" (has condition status).\n  - includeItemAEs (boolean, optional): TOOL-IDEA-002 (2026-05-14). When true, also enumerates AEs attached to actor.items[*].effects (e.g. AEs on Camila\'s Dagger). Each AE projection includes parentType ("Actor"|"Item"), parentId, parentName so callers can route follow-up update/delete-active-effect calls with the correct itemId. Default: false.\n\nReturns:\n  - On success: {actorId, actorName, effects: [...]} envelope. Each effect projection has id, name, statuses, disabled, duration, origin, changes, parentType, parentId, parentName.\n  - On error: throws with an actionable message.\n\nUse when: inspecting all current effects on a character before add/update/delete operations. Don\'t use when: looking for WFRP4e conditions only — use list-conditions for that. For AE-by-name lookup, use get-active-effect-by-name (TOOL-IDEA-003).',
        inputSchema: {
          type: 'object',
          properties: {
            actorId: { type: 'string', description: 'Target actor ID.' },
            filter: {
              type: 'string',
              enum: ['all', 'applied', 'temporary', 'conditions'],
              default: 'all',
              description: 'applied = !disabled; temporary = has rounds/turns/seconds; conditions = has condition status.',
            },
            includeItemAEs: {
              type: 'boolean',
              default: false,
              description: 'TOOL-IDEA-002 (2026-05-14): also surface AEs on actor.items[*].effects. Each result carries parentType/parentId/parentName for disambiguation.',
            },
          },
          required: ['actorId'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = ListActiveEffectsInput.parse(args);
    this.logger.info('list-active-effects', parsed);
    const result = await this.query<ListActiveEffectsOutputType | unknown[]>('listActiveEffects', parsed);
    if (Array.isArray(result)) {
      // BUG-319: actorId is an ID, not a name — use characterId param
      const character = await this.query<FoundryRawActor>('getCharacterInfo', { characterId: parsed.actorId }).catch(() => null);
      return {
        actorId: parsed.actorId,
        actorName: character?.name ?? null,
        effects: result,
      };
    }
    return result;
  }
}
