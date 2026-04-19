import { ApplyDamageInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface ApplyDamageToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class ApplyDamageTool {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: ApplyDamageToolOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'ApplyDamageTool' });
  }

  getToolDefinitions() {
    return [
      {
        name: 'apply-damage',
        description: 'Apply WFRP 4e damage to an actor via the system\'s actor.applyBasicDamage path (AP + TB automatically applied by the system per damageType/hitLocation). Returns before/after status snapshot (wounds, conditions, advantage).',
        inputSchema: {
          type: 'object',
          properties: {
            actorId: {
              type: 'string',
              description: 'Target actor ID.',
            },
            amount: {
              type: 'integer',
              minimum: 0,
              description: 'Damage amount before soak. Use 0 for dry-run (no-op).',
            },
            damageType: {
              type: 'string',
              enum: ['NORMAL', 'IGNORE_AP', 'IGNORE_TB', 'IGNORE_ALL'],
              default: 'NORMAL',
              description: 'NORMAL applies AP + TB soak; IGNORE_* variants bypass the matching soak layer.',
            },
            hitLocation: {
              type: 'string',
              enum: ['head', 'body', 'rArm', 'lArm', 'rLeg', 'lLeg'],
              description: 'Optional hit location (for AP lookup).',
            },
          },
          required: ['actorId', 'amount'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = ApplyDamageInput.parse(args);
    this.logger.info('apply-damage', parsed);
    return await this.foundryClient.query<any>('warhammer-mcp.applyDamage', parsed);
  }
}
