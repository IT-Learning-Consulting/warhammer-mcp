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
          `Batch-write WFRP battle-simulator casualties to specific scene tokens by token ID. ` +
          `For each token: set wounds (system.status.wounds.value, clamped to [0,max]), apply ` +
          `conditions (unconscious/broken/prone/…), and embed an ArtAntares critical-wound Item by ` +
          `compendium UUID. Writes ALWAYS hit the token's synthetic actor (ActorDelta), never the ` +
          `shared world actor — siblings are left untouched (HC2). actorLink=true tokens are rejected. ` +
          `Requires confirmedApply:true (HC4 gate). Pass dryRun:true to preview the planned writes with ` +
          `zero mutations. Returns per-token results with before/after wounds and sibling-isolation verification. ` +
          `RETRY SAFETY (BUG-409): the batch is NOT transactional — if a call ERRORS or times out, some ` +
          `token writes may already have landed. PASS A STABLE batchId to make retries idempotent: each ` +
          `token records that batchId on its synthetic actor, and a re-send with the SAME batchId skips ` +
          `already-applied tokens (results[].alreadyApplied=true) so crit embeds / numbered conditions are ` +
          `never double-counted — just resend the identical batch on timeout. Without a batchId the call is ` +
          `one-shot (legacy): read back the target tokens before any manual retry.\n\n` +
          `Use this when:\n` +
          `- Committing battle-simulator outcomes (wounds/conditions/crits) to multiple unlinked scene tokens in one batch call.\n` +
          `- Previewing the planned per-token writes before committing, via dryRun:true.\n` +
          `- Retrying a partially-failed batch safely by resending the same batchId (idempotent skip of already-applied tokens).\n` +
          `- Isolating writes to a token's own synthetic actor (ActorDelta) without touching the shared world actor or its other placed-token siblings.\n\n` +
          `Do NOT use this for a single-actor live damage roll where AP/TB soak should be computed — use apply-damage instead. Do NOT use this on actorLink:true tokens — they are rejected; use apply-damage on the linked world actor instead.\n\n` +
          `Performance Notes:\n` +
          `- Response scales with the number of tokens in the batch (per-token results with before/after wounds). dryRun:true returns the same shape with zero mutations, so its size matches a live run.`,
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
                    description: 'WFRP4e condition keys to apply (unconscious/broken/prone/…). NOTE: there is no "dead" condition — a slain creature is unconscious + 0 wounds.',
                  },
                  criticalUuid: { type: 'string', description: 'ArtAntares crit Item compendium UUID to embed.' },
                },
                required: ['tokenId'],
              },
            },
            dryRun: { type: 'boolean', description: 'Preview the planned writes with zero mutations.' },
            batchId: {
              type: 'string',
              minLength: 1,
              maxLength: 128,
              description:
                'Optional idempotency key (BUG-409). Reuse the SAME value when retrying after a timeout so ' +
                'already-applied tokens are skipped (results[].alreadyApplied=true) instead of double-written. ' +
                'Generate a stable id per casualty batch, e.g. "<slug>-r<round>-<isoStamp>". Omit for one-shot legacy behavior.',
            },
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
