import {
  ApplyDamageInput,
  ApplyDamageOutput,
  APPLY_DAMAGE_OUTPUT_JSON_SCHEMA,
} from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface ApplyDamageToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class ApplyDamageTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
      { name: 'apply-damage', handler: (args: any) => this.handle(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'apply-damage',
        title: 'Apply Damage',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description: 'Apply WFRP 4e damage to an actor via the system\'s actor.applyBasicDamage path (AP + TB automatically applied by the system per damageType/hitLocation). Returns before/after status snapshot (wounds, conditions, advantage). IGNORE_ALL bypasses AP and TB soak, but does NOT bypass creature trait-based reductions (e.g. Undead). Effective wounds removed may be less than amount.',
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
        outputSchema: APPLY_DAMAGE_OUTPUT_JSON_SCHEMA,
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = ApplyDamageInput.parse(args);
    this.logger.info('apply-damage', parsed);
    // Phase 11 (R11.1): wrap the raw query payload in the MCP content envelope +
    // structuredContent. content[0].text === JSON.stringify(data) keeps the wire
    // text byte-identical to the backend's prior auto-wrap (additive structuredContent).
    const data = await this.query<ApplyDamageOutput>('applyDamage', parsed);
    ApplyDamageOutput.parse(data);
    return { content: [{ type: 'text' as const, text: JSON.stringify(data) }], structuredContent: data };
  }
}
