import { ApplyTemplateInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface ApplyTemplateToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class ApplyTemplateTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'apply-template',
        title: 'Apply Template',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          'Server-side reimplementation of wfrp4e TemplateModel.apply (wfrp4e.js:32647) — ' +
          'applies an advancement template (Item of type "template" from owb1/owb2/owb3/core) to ' +
          'any actor (creature or npc), resolving skills, talents, lores+spells, traits, and ' +
          'trappings tree in a single batch call. BYPASSES THE 5 INTERACTIVE DIALOGS ' +
          '(skill-group pick, skill-specialisation pick, lore pick, spell pick, trappings tree pick) ' +
          'the native path opens — makes batch encounter generation possible. Pass preResolvedChoices ' +
          'to override any dialog pick; otherwise each is resolved by a random pick (with skill↔weapon ' +
          'correlation biasing the trappings OR-branch toward weapons matching the actor\'s Melee/Ranged ' +
          'specialisations). Supports stacking: calling apply-template twice on the same actor with ' +
          'different template UUIDs composes both layers (role + rank, e.g. Scout + Veterans from ' +
          'owb3 Hahnbrandt). Embedded child items carry flags.wfrp4e.fromTemplate = <templateId> for ' +
          'future undo symmetry. Use via /wfrp-encounter-builder in direct or band mode.',
        inputSchema: {
          type: 'object',
          properties: {
            actorId: {
              type: 'string',
              description: 'World-actor ID receiving the template application. Any actor type is accepted.',
            },
            templateUuid: {
              type: 'string',
              description:
                'Compendium UUID (preferred: "Compendium.wfrp4e-owb1.items.Item.<id>") or bare 16-char Foundry id of a template-type Item. The handler rejects items whose type is not "template".',
            },
            preResolvedChoices: {
              type: 'object',
              description:
                'Optional overrides for dialog picks. Any field omitted → random pick. Used by ' +
                '/wfrp-encounter-builder to pre-decide lore/spells for casters and trappings branch for cavalry.',
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
          },
          required: ['actorId', 'templateUuid'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = ApplyTemplateInput.parse(args);
    this.logger.info('apply-template', {
      actorId: parsed.actorId,
      templateUuid: parsed.templateUuid,
      hasPreResolved: !!parsed.preResolvedChoices,
    });
    return await this.query<any>('applyTemplate', parsed);
  }
}
