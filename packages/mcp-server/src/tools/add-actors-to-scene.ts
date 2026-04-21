import { AddActorsToSceneInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface AddActorsToSceneToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class AddActorsToSceneTool {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: AddActorsToSceneToolOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'AddActorsToSceneTool' });
  }

  getToolDefinitions() {
    return [
      {
        name: 'add-actors-to-scene',
        description:
          'Place one or more existing world actors onto the currently active scene as tokens. Thin pass-through to the Foundry-module addActorsToScene query. Used by /wfrp-encounter-builder after create-actor-from-compendium to drop combatants onto the map. BUG-006 guardrail: placement defaults to "random" (spread across the scene) rather than 0,0. BUG-051 post-hotfix: pass `quantities` (parallel to `actorIds`) to drop N unlinked tokens from a single actor that has `prototypeToken.actorLink=false` — each token gets its own ActorDelta (independent HP/conditions, shared sheet). Use this pattern for identical-loadout combatants (e.g. 3 Wight Skeletons); omit `quantities` for the original 1-token-per-actor behavior.',
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
    return await this.foundryClient.query<any>('warhammer-mcp.addActorsToScene', parsed);
  }
}
