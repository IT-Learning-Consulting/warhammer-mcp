import { ApplyNpcCareerAdvanceInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface ApplyNpcCareerAdvanceToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class ApplyNpcCareerAdvanceTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
      { name: 'apply-npc-career-advance', handler: (args: any) => this.handle(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'apply-npc-career-advance',
        title: 'Apply NPC Career Advance',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Apply a career's auto-advancement to an npc-type actor. Invokes StandardActorModel.advance(career) (wfrp4e.js:6623) which runs the Advancement class's dialog-free advance() method — stamps characteristics, skills, and talents per the career's schema. BYPASSES THE WFRP4E CONFIRMATION DIALOG, unlike clicking "Complete" on the career card. Requires actor.type === "npc" and a career-type item already embedded on the actor. Verifies the actual characteristic/skill/talent deltas landed (not just that the actor/career still exist) and fails loud on a genuine advance timeout instead of silently reporting success.

Use this when:
- Advancing an npc-type actor's already-embedded career headlessly (autonomous NPC generation flows), where clicking "Complete" on the career card isn't available.
- Applying the full career advancement schema (characteristics + skills + talents) in one call, with post-write verification of the actual deltas.
- Trimming the resulting talent set to a single talent (talentPolicy:"min") for a lighter-weight NPC, instead of the default "all".

Do NOT use this on a creature-type actor — creature-type actors auto-advance via the wfrp4e _onCreate hook and need no MCP call for this. This tool is npc-type only.

Performance Notes:
- Single small response: the actual characteristic/skill/talent deltas that landed, no full sheet payload. Mode-less — no response-mode variance.`,
        inputSchema: {
          type: 'object',
          properties: {
            actorId: {
              type: 'string',
              description: 'npc-type actor ID. Creature-type actors advance via _onCreate auto-hook; this tool is for npc-type only.',
            },
            careerItemId: {
              type: 'string',
              description: 'Embedded career-type Item ID on the actor.',
            },
            talentPolicy: {
              type: 'string',
              enum: ['all', 'min'],
              description: 'wfrp4e always embeds every career talent with no count control of its own. "all" (default) keeps that behavior. "min" trims the result to a single talent after advance() commits, for a lighter-weight NPC.',
            },
          },
          required: ['actorId', 'careerItemId'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = ApplyNpcCareerAdvanceInput.parse(args);
    this.logger.info('apply-npc-career-advance', {
      actorId: parsed.actorId,
      careerItemId: parsed.careerItemId,
      talentPolicy: parsed.talentPolicy ?? 'all',
    });
    return await this.query<any>('applyNpcCareerAdvance', parsed);
  }
}
