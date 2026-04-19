import {
  ApplyConditionInput,
  RemoveConditionInput,
  ListConditionsInput,
} from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

const CONDITION_KEYS = [
  'ablaze',
  'bleeding',
  'blinded',
  'broken',
  'deafened',
  'entangled',
  'fatigued',
  'poisoned',
  'prone',
  'stunned',
  'surprised',
  'unconscious',
  'dead',
  'stuffed',
  'grappled',
  'engaged',
  'defeated',
];

export interface ManageConditionsToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class ManageConditionsTools {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: ManageConditionsToolsOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'ManageConditionsTools' });
  }

  getToolDefinitions() {
    return [
      {
        name: 'apply-condition',
        description: 'Apply a WFRP 4e condition to an actor via the system\'s actor.addCondition path. Stackable conditions (Minor/Major) are handled by the system via WarhammerActiveEffect._handleConditionCreation.',
        inputSchema: {
          type: 'object',
          properties: {
            actorId: { type: 'string', description: 'Target actor ID.' },
            conditionKey: {
              type: 'string',
              enum: CONDITION_KEYS,
              description: 'Condition key (see CONFIG.WFRP4E.conditions).',
            },
            value: {
              type: 'integer',
              minimum: 1,
              default: 1,
              description: 'Stack count to apply (stackable conditions only).',
            },
          },
          required: ['actorId', 'conditionKey'],
        },
      },
      {
        name: 'remove-condition',
        description: 'Remove a WFRP 4e condition (or N stacks of it) from an actor via the system\'s actor.removeCondition path.',
        inputSchema: {
          type: 'object',
          properties: {
            actorId: { type: 'string', description: 'Target actor ID.' },
            conditionKey: {
              type: 'string',
              enum: CONDITION_KEYS,
              description: 'Condition key (see CONFIG.WFRP4E.conditions).',
            },
            count: {
              type: 'integer',
              minimum: 1,
              default: 1,
              description: 'Number of stacks to remove.',
            },
          },
          required: ['actorId', 'conditionKey'],
        },
      },
      {
        name: 'list-conditions',
        description: 'List the condition-flagged active effects currently on an actor. Read-only.',
        inputSchema: {
          type: 'object',
          properties: {
            actorId: { type: 'string', description: 'Target actor ID.' },
          },
          required: ['actorId'],
        },
      },
    ];
  }

  async handleApplyCondition(args: any): Promise<any> {
    const parsed = ApplyConditionInput.parse(args);
    this.logger.info('apply-condition', parsed);
    return await this.foundryClient.query<any>('warhammer-mcp.applyCondition', parsed);
  }

  async handleRemoveCondition(args: any): Promise<any> {
    const parsed = RemoveConditionInput.parse(args);
    this.logger.info('remove-condition', parsed);
    return await this.foundryClient.query<any>('warhammer-mcp.removeCondition', parsed);
  }

  async handleListConditions(args: any): Promise<any> {
    const parsed = ListConditionsInput.parse(args);
    this.logger.info('list-conditions', parsed);
    return await this.foundryClient.query<any>('warhammer-mcp.listConditions', parsed);
  }
}
