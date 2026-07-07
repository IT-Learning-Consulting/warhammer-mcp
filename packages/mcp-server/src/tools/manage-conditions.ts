import {
  ApplyConditionInput,
  RemoveConditionInput,
  ListConditionsInput,
  ApplyConditionOutput,
  RemoveConditionOutput,
  type ApplyConditionOutputType,
  type RemoveConditionOutputType,
  type ListConditionsOutputType,
  APPLY_CONDITION_OUTPUT_JSON_SCHEMA,
  REMOVE_CONDITION_OUTPUT_JSON_SCHEMA,
} from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

// Mirrors live CONFIG.WFRP4E.conditions (verified 2026-06-22, BUG-404). No `dead` condition exists
// in wfrp4e; the phantom `dead`/`stuffed`/`grappled` were dropped and the real `grappling` added.
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
  'grappling',
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
        description: 'Apply a WFRP 4e condition to an actor via the system\'s actor.addCondition path. Stackable conditions (Minor/Major) are handled by the system via WarhammerActiveEffect._handleConditionCreation. `value` is ADDITIVE by default (mode:"add" — applying value:5 twice yields stackCount 10); pass mode:"set" to write an absolute stack count (BUG-477).',
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
              description: 'Stack count (stackable conditions only). ADDED to any existing stack when mode:"add" (default); written absolutely when mode:"set".',
            },
            mode: {
              type: 'string',
              enum: ['add', 'set'],
              default: 'add',
              description: 'BUG-477: "add" (default, back-compat) increments the existing stack additively; "set" writes the stack to the absolute `value` (moves by the delta from the current stack). Use "set" for idempotent resolve-terror / surgery-bleeding math that must not compound on re-apply.',
            },
          },
          required: ['actorId', 'conditionKey'],
        },
        outputSchema: APPLY_CONDITION_OUTPUT_JSON_SCHEMA,
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
        outputSchema: REMOVE_CONDITION_OUTPUT_JSON_SCHEMA,
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
        description: 'List the condition-flagged active effects on an actor (single-actor) OR across every combatant in a combat (batch). Read-only. Provide EXACTLY ONE of actorId / combatId.\n\nArgs:\n  - actorId (string, optional): Target actor ID (16-char Foundry document ID, NOT a full Foundry UUID-style string). Single-actor mode.\n  - combatId (string, optional): Target Combat document ID. Batch mode — resolves the combat, iterates its combatants, and returns a per-actor roster map.\n\nReturns:\n  - Single-actor mode (actorId): array of active effects whose statuses include a WFRP4e condition key (ablaze, bleeding, blinded, broken, deafened, entangled, fatigued, poisoned, prone, stunned, surprised, unconscious, grappling, engaged, defeated). Returns the array directly; empty array means "no conditions on this actor".\n  - Batch mode (combatId): an object keyed by actorId → { actorName, conditions[] } for every combatant in the combat (P-09 end-of-round narration). A combatant with no resolvable actor is skipped.\n  - On error: throws with an actionable message (e.g. COMBAT_NOT_FOUND, or a mutex error when both/neither id is supplied).\n\nUse when: checking conditions on one actor before remove-condition, OR narrating end-of-round conditions across the whole combat (combatId). Don\'t use when: listing all active effects including scripts — use list-active-effects instead.',
        inputSchema: {
          type: 'object',
          properties: {
            actorId: { type: 'string', description: 'Target actor ID (single-actor mode). Provide exactly one of actorId / combatId.' },
            combatId: { type: 'string', description: 'Target Combat document ID (batch mode — per-actor roster map). Provide exactly one of actorId / combatId.' },
          },
        },
      },
    ];
  }

  async handleApplyCondition(args: any): Promise<any> {
    const parsed = ApplyConditionInput.parse(args);
    this.logger.info('apply-condition', parsed);
    // Phase 11 (R11.1): envelope wrap; text === JSON.stringify(data) preserves the
    // prior auto-wrapped wire text (additive structuredContent).
    const data = await this.query<ApplyConditionOutputType>('applyCondition', parsed);
    ApplyConditionOutput.parse(data);
    return { content: [{ type: 'text' as const, text: JSON.stringify(data) }], structuredContent: data };
  }

  async handleRemoveCondition(args: any): Promise<any> {
    const parsed = RemoveConditionInput.parse(args);
    this.logger.info('remove-condition', parsed);
    // Phase 11 (R11.1): envelope wrap; text === JSON.stringify(data) preserves the
    // prior auto-wrapped wire text (additive structuredContent).
    const data = await this.query<RemoveConditionOutputType>('removeCondition', parsed);
    RemoveConditionOutput.parse(data);
    return { content: [{ type: 'text' as const, text: JSON.stringify(data) }], structuredContent: data };
  }

  async handleListConditions(args: any): Promise<any> {
    const parsed = ListConditionsInput.parse(args);
    this.logger.info('list-conditions', parsed);
    return await this.query<ListConditionsOutputType>('listConditions', parsed);
  }
}
