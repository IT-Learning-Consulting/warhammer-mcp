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
          'Place one or more existing world actors onto the currently active scene as tokens. Thin pass-through to the Foundry-module addActorsToScene query. Used by /wfrp-encounter-builder after create-actor-from-compendium to drop combatants onto the map. BUG-006 guardrail: placement defaults to "random" (spread across the scene) rather than 0,0; pass "grid" for an auto-grid layout or "center" to cluster near the scene center.',
        inputSchema: {
          type: 'object',
          properties: {
            actorIds: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              description: 'Array of world Actor document IDs to place.',
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
      placement: parsed.placement ?? 'random',
      hidden: parsed.hidden ?? false,
    });
    return await this.foundryClient.query<any>('warhammer-mcp.addActorsToScene', parsed);
  }
}
