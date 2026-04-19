import { UpdateActorInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface UpdateActorToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class UpdateActorTool {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: UpdateActorToolOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'UpdateActorTool' });
  }

  getToolDefinitions() {
    return [
      {
        name: 'update-actor',
        description:
          'Apply an arbitrary system.* update to an actor. Thin pass-through to the Foundry-module updateActor query — does not enforce WFRP rules. Skills (e.g. /wfrp-advance, /wfrp-resources, /wfrp-status) own the rules and call this primitive to write the result. Use Foundry update syntax for nested paths (e.g. {"system.characteristics.ws.advances": 3, "system.details.experience.spent": 75}).',
        inputSchema: {
          type: 'object',
          properties: {
            actorId: {
              type: 'string',
              description: 'Target actor ID.',
            },
            updateData: {
              type: 'object',
              additionalProperties: true,
              description:
                'Foundry update payload. Keys can be dot-paths (e.g. "system.status.fate.value"); values are the new values. NEVER write *.max for fate / fortune / resilience / resolve (per PRD R4.2).',
            },
          },
          required: ['actorId', 'updateData'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = UpdateActorInput.parse(args);
    this.logger.info('update-actor', { actorId: parsed.actorId, paths: Object.keys(parsed.updateData) });
    return await this.foundryClient.query<any>('warhammer-mcp.updateActor', parsed);
  }
}
