import { AddActorsToSceneInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface AddActorsToSceneToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class AddActorsToSceneTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'add-actors-to-scene',
        title: 'Add Actors To Scene',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          'Place one or more existing world actors onto a Foundry scene as tokens. Thin pass-through to the Foundry-module addActorsToScene query. Used by /wfrp-encounter-builder after create-actor-from-compendium to drop combatants onto the map. BUG-006 guardrail: placement defaults to "random" (spread across the scene) rather than 0,0. BUG-051 post-hotfix: pass `quantities` (parallel to `actorIds`) to drop N unlinked tokens from a single actor that has `prototypeToken.actorLink=false` — each token gets its own ActorDelta (independent HP/conditions, shared sheet). TOOL-IDEA-004 (2026-05-14): pass `sceneId` to drop tokens on a non-active scene without `switch-scene` (tokens become visible when the scene is later viewed; `get-current-scene` will still show the active scene\'s tokens). TOOL-IDEA-005 (2026-05-14): response includes a `tokens` array (`[{id, name, actorId}]`) with each placed token\'s final auto-counter-renamed name (e.g. "Skeleton (3)") alongside the existing `tokenIds` array.',
        inputSchema: {
          type: 'object',
          properties: {
            actorIds: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              description: 'Array of world Actor document IDs to place.',
            },
            quantities: {
              type: 'array',
              items: { type: 'integer', minimum: 1 },
              description: 'Parallel to actorIds — number of tokens to drop for each actor. Missing → 1 token each. Length must equal actorIds.length if provided.',
            },
            placement: {
              type: 'string',
              enum: ['random', 'grid', 'center'],
              description: 'Placement strategy (default "random").',
            },
            hidden: {
              type: 'boolean',
              description: 'Place tokens hidden (default false).',
            },
            sceneId: {
              type: 'string',
              description: 'Optional target Scene ID. Defaults to the currently active scene. Use to pre-populate a non-active scene without disrupting the GM\'s view.',
            },
          },
          required: ['actorIds'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = AddActorsToSceneInput.parse(args);
    this.logger.info('add-actors-to-scene', {
      count: parsed.actorIds.length,
      quantities: parsed.quantities,
      placement: parsed.placement ?? 'random',
      hidden: parsed.hidden ?? false,
    });
    return await this.query<any>('addActorsToScene', parsed);
  }
}
