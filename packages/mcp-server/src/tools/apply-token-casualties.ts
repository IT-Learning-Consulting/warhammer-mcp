import {
  ApplyTokenCasualtiesInput,
  ApplyTokenCasualtiesOutput,
  ApplyTokenCasualtiesOutputType,
  APPLY_TOKEN_CASUALTIES_OUTPUT_JSON_SCHEMA,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

/**
 * apply-token-casualties — WFRP Battle Simulator Phase 5 (R13 / R5.1).
 *
 * Batch per-token ActorDelta casualty writer. Commits the offline simulator's resolved casualties
 * (wounds + conditions + ArtAntares crit items) to the exact unlinked tokens that fought, by token
 * ID. Writes target the token's synthetic actor only (HC2); rejects actorLink=true tokens; honors
 * the confirmedApply trust gate (HC4) and a dryRun preview.
 */
export class ApplyTokenCasualtiesTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
      { name: 'apply-token-casualties', handler: (args: any) => this.handle(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'apply-token-casualties',
        title: 'Apply Token Casualties',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          'Batch-write WFRP battle-simulator casualties to specific scene tokens by token ID. ' +
          'For each token: set wounds (system.status.wounds.value, clamped to [0,max]), apply ' +
          'conditions (dead/unconscious/broken/…), and embed an ArtAntares critical-wound Item by ' +
          'compendium UUID. Writes ALWAYS hit the token\'s synthetic actor (ActorDelta), never the ' +
          'shared world actor — siblings are left untouched (HC2). actorLink=true tokens are rejected. ' +
          'Requires confirmedApply:true (HC4 gate). Pass dryRun:true to preview the planned writes with ' +
          'zero mutations. Returns per-token results with before/after wounds and sibling-isolation verification.',
        inputSchema: {
          type: 'object',
          properties: {
            sceneId: { type: 'string', description: 'Scene holding the target tokens.' },
            confirmedApply: {
              type: 'boolean',
              const: true,
              description: 'Must be true — the GM\'s explicit post-dry-run approval (HC4 trust gate).',
            },
            casualties: {
              type: 'array',
              minItems: 1,
              description: 'One entry per token to write; each must set at least one of wounds/conditions/criticalUuid.',
              items: {
                type: 'object',
                properties: {
                  tokenId: { type: 'string', description: 'Target token ID on the scene.' },
                  wounds: { type: 'integer', minimum: 0, description: 'Absolute remaining Wounds to set (clamped to [0,max]).' },
                  conditions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'WFRP4e condition keys to apply (dead/unconscious/broken/prone/…).',
                  },
                  criticalUuid: { type: 'string', description: 'ArtAntares crit Item compendium UUID to embed.' },
                },
                required: ['tokenId'],
              },
            },
            dryRun: { type: 'boolean', description: 'Preview the planned writes with zero mutations.' },
          },
          required: ['sceneId', 'confirmedApply', 'casualties'],
        },
        outputSchema: APPLY_TOKEN_CASUALTIES_OUTPUT_JSON_SCHEMA,
      },
    ];
  }

  async handle(args: any): Promise<any> {
    try {
      const parsed = ApplyTokenCasualtiesInput.parse(args);
      this.logger.info('apply-token-casualties', { sceneId: parsed.sceneId, tokenCount: parsed.casualties.length, dryRun: parsed.dryRun ?? false });
      const data = await this.query<ApplyTokenCasualtiesOutputType>('applyTokenCasualties', parsed);
      ApplyTokenCasualtiesOutput.parse(data);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data) }], structuredContent: data };
    } catch (e) {
      return this.errorResponse('apply-token-casualties', e instanceof Error ? e.message : String(e));
    }
  }
}
