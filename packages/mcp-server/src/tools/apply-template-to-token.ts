import {
  ApplyTemplateToTokenInput,
  ApplyTemplateToTokenOutput,
  APPLY_TEMPLATE_TO_TOKEN_OUTPUT_JSON_SCHEMA,
} from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface ApplyTemplateToTokenToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class ApplyTemplateToTokenTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
      { name: 'apply-template-to-token', handler: (args: any) => this.handle(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'apply-template-to-token',
        title: 'Apply Template To Token',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          'Token-delta variant of apply-template. Writes an advancement template (Item of type ' +
          '"template" from owb1/owb2/owb3/core) into a single unlinked token\'s ActorDelta instead ' +
          'of a world actor. World actor stays pristine; sibling tokens sharing the same base are ' +
          'unaffected. Use case: /wfrp-encounter-builder prototype-sheet routing — when multiple ' +
          'entries share the same bestiary base but vary templates or weapons per entry (e.g. a ' +
          '10-Goblin party of 4 Skirmishers + 3 Soldiers + 3 Elites), compose with ' +
          'add-actors-to-scene { quantities: [N] } to drop N unlinked tokens from ONE world actor, ' +
          'then call this tool per token with the varying template. Result: 1 sidebar entry rather ' +
          'than N. Rejects actorLink:true tokens cleanly — their delta is a passthrough to the ' +
          'world actor, so writes would be semantically wrong; caller should use apply-template ' +
          'with the world actor ID in that case. Same preResolvedChoices surface as apply-template ' +
          '(skillGroups / talentGroups / specialisations / lores / spells / trappings) and same ' +
          'stacking semantics (two calls on the same token compose both layers into its delta).',
        inputSchema: {
          type: 'object',
          properties: {
            sceneId: {
              type: 'string',
              description: 'Scene document ID containing the target token.',
            },
            tokenId: {
              type: 'string',
              description:
                'Token document ID on the scene. Token must have actorLink=false (unlinked); the handler rejects linked tokens with guidance to use apply-template instead.',
            },
            templateUuid: {
              type: 'string',
              description:
                'Compendium UUID (preferred: "Compendium.wfrp4e-owb1.items.Item.<id>") or bare 16-char Foundry id of a template-type Item. The handler rejects items whose type is not "template".',
            },
            preResolvedChoices: {
              type: 'object',
              description:
                'Optional overrides for dialog picks. Any field omitted → random pick. Same shape as apply-template so a caller can route identical template math through either primitive.',
              properties: {
                skillGroups: {
                  type: 'object',
                  description: 'Map of skill-group id → chosen skill name. Example: {"1": "Melee"}.',
                  additionalProperties: { type: 'string' },
                },
                talentGroups: {
                  type: 'object',
                  description: 'Map of talent-group id → chosen talent name.',
                  additionalProperties: { type: 'string' },
                },
                specialisations: {
                  type: 'object',
                  description:
                    'Map of base skill name → array of picked specialisation names. Array length must equal the template\'s skill.specialisations count.',
                  additionalProperties: { type: 'array', items: { type: 'string' } },
                },
                lores: {
                  type: 'array',
                  description:
                    'Ordered overrides for template lores.list wildcard ("*") entries. Position-matched by index into the template\'s lore list.',
                  items: { type: 'string' },
                },
                spells: {
                  type: 'object',
                  description:
                    'Map of lore name → array of picked spell names. Length capped at the template\'s lore.number per entry.',
                  additionalProperties: { type: 'array', items: { type: 'string' } },
                },
                trappings: {
                  type: 'object',
                  description:
                    'Map of ChoiceModel structure-node id → chosen option id. Applies to "or" nodes; "and" nodes take all children.',
                  additionalProperties: { type: 'string' },
                },
              },
              additionalProperties: false,
            },
            dryRun: {
              type: 'boolean',
              description:
                'Phase 12 (R12.1): preview-only. When true, returns the planned name change, characteristic ' +
                'advances, the items that WOULD be added, and the token-rename (WRITE #3) it WOULD perform — ' +
                'performing zero writes. Unpinned group/specialisation/spell picks are randomised; pin them ' +
                'via preResolvedChoices for a deterministic preview.',
            },
          },
          required: ['sceneId', 'tokenId', 'templateUuid'],
        },
        outputSchema: APPLY_TEMPLATE_TO_TOKEN_OUTPUT_JSON_SCHEMA,
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = ApplyTemplateToTokenInput.parse(args);
    this.logger.info('apply-template-to-token', {
      sceneId: parsed.sceneId,
      tokenId: parsed.tokenId,
      templateUuid: parsed.templateUuid,
      hasPreResolved: !!parsed.preResolvedChoices,
      dryRun: !!parsed.dryRun,
    });
    const data = await this.query<Record<string, unknown>>('applyTemplateToToken', parsed);
    ApplyTemplateToTokenOutput.parse(data);
    const d = data as any;
    // Phase 12 R12.1: dryRun preview includes the WRITE #3 token-rename that WOULD be performed.
    if (d?.dryRun) {
      const deltas = Object.entries(d.characteristicDeltas ?? {})
        .map(([k, v]) => `${k} +${v}`)
        .join(', ');
      const itemCount = Array.isArray(d.writes)
        ? (d.writes.find((w: any) => w?.op === 'createEmbeddedDocuments')?.itemCount ?? 0)
        : 0;
      const renameNote = d.tokenRename?.wouldRename
        ? `rename token to "${d.tokenRename.plannedName}"`
        : 'leave token name unchanged';
      const text = `[DRY RUN] apply-template-to-token ${d?.templateName ?? d?.templateId ?? ''} → token ${d?.tokenId ?? ''} ` +
        `(${d?.actorName ?? d?.actorId ?? ''}) WOULD: ${renameNote}; advance ${deltas || 'no characteristics'}; ` +
        `add ${itemCount} item(s). No writes performed.`;
      return { content: [{ type: 'text' as const, text }], structuredContent: data };
    }
    const applied = d?.applied?.itemsByType ?? {};
    const text = `Applied template ${d?.templateName ?? d?.templateId ?? ''} to token ${d?.tokenId ?? ''} (${d?.actorName ?? d?.actorId ?? ''}): ` +
      `${applied.skill ?? 0} skills, ${applied.talent ?? 0} talents, ` +
      `${applied.spell ?? 0} spells, ${applied.trapping ?? 0} trappings.`;
    return { content: [{ type: 'text' as const, text }], structuredContent: data };
  }
}
