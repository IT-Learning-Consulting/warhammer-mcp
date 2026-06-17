import {
  ApplyConditionInput,
  RemoveConditionInput,
  ListConditionsInput,
} from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

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

export class ManageConditionsTools extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'apply-condition', handler: (args: any) => this.handleApplyCondition(args) },
        { name: 'remove-condition', handler: (args: any) => this.handleRemoveCondition(args) },
        { name: 'list-conditions', handler: (args: any) => this.handleListConditions(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'apply-condition',
        title: 'Apply Condition',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
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
        title: 'Remove Condition',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
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
        title: 'List Conditions',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        description: 'List the condition-flagged active effects currently on an actor. Read-only.\n\nArgs:\n  - actorId (string): Target actor ID (16-char Foundry document ID, NOT a full Foundry UUID-style string).\n\nReturns:\n  - On success: array of active effects whose statuses include a WFRP4e condition key (ablaze, bleeding, blinded, broken, deafened, entangled, fatigued, poisoned, prone, stunned, surprised, unconscious, dead, stuffed, grappled, engaged, defeated). Returns array directly (not wrapped in an envelope); empty array means "no conditions on this actor" — caller should verify the actorId exists by separate lookup if ambiguity matters.\n  - On error: throws with an actionable message.\n\nUse when: checking which conditions are on a character before a remove-condition call, or summarizing a character\'s status. Don\'t use when: listing all active effects including scripts — use list-active-effects instead.',
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
    return await this.query<any>('applyCondition', parsed);
  }

  async handleRemoveCondition(args: any): Promise<any> {
    const parsed = RemoveConditionInput.parse(args);
    this.logger.info('remove-condition', parsed);
    return await this.query<any>('removeCondition', parsed);
  }

  async handleListConditions(args: any): Promise<any> {
    const parsed = ListConditionsInput.parse(args);
    this.logger.info('list-conditions', parsed);
    return await this.query<any>('listConditions', parsed);
  }
}
