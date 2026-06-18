import {
  ApplyTemplateInput,
  ApplyTemplateOutput,
  type ApplyTemplateOutputType,
  APPLY_TEMPLATE_OUTPUT_JSON_SCHEMA,
} from '@foundry-mcp/shared';
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

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
      { name: 'apply-template', handler: (args: any) => this.handle(args) },
    ];
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
            dryRun: {
              type: 'boolean',
              description:
                'Phase 12 (R12.1): preview-only. When true, returns the planned name change, characteristic ' +
                'advances, and the list of items that WOULD be added — performing zero writes. NOTE: unpinned ' +
                'group/specialisation/spell picks are resolved with randomness, so an unconstrained preview ' +
                'shows one possible resolution; pin them via preResolvedChoices for a deterministic preview.',
            },
          },
          required: ['actorId', 'templateUuid'],
        },
        outputSchema: APPLY_TEMPLATE_OUTPUT_JSON_SCHEMA,
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = ApplyTemplateInput.parse(args);
    this.logger.info('apply-template', {
      actorId: parsed.actorId,
      templateUuid: parsed.templateUuid,
      hasPreResolved: !!parsed.preResolvedChoices,
      dryRun: !!parsed.dryRun,
    });
    const data = await this.query<ApplyTemplateOutputType>('applyTemplate', parsed);
    ApplyTemplateOutput.parse(data);
    const d = data as ApplyTemplateOutputType & {
      dryRun?: boolean;
      newName?: string;
      characteristicDeltas?: Record<string, number>;
      writes?: Array<{ op: string; itemCount?: number }>;
    };
    // Phase 12 R12.1: dryRun preview renders the planned change without claiming items were applied.
    if (d?.dryRun) {
      const deltas = Object.entries(d.characteristicDeltas ?? {})
        .map(([k, v]) => `${k} +${v}`)
        .join(', ');
      const itemCount = d.writes?.find((w) => w.op === 'createEmbeddedDocuments')?.itemCount ?? 0;
      const text = `[DRY RUN] apply-template ${d?.templateName ?? d?.templateId ?? ''} → ${d?.actorName ?? d?.actorId ?? ''} WOULD: ` +
        `rename to "${d?.newName ?? '(unchanged)'}"; advance ${deltas || 'no characteristics'}; add ${itemCount} item(s). ` +
        `No writes performed.`;
      return { content: [{ type: 'text' as const, text }], structuredContent: data };
    }
    const applied = d?.applied?.itemsByType ?? {};
    const text = `Applied template ${d?.templateName ?? d?.templateId ?? ''} to ${d?.actorName ?? d?.actorId ?? ''}: ` +
      `${applied.skill ?? 0} skills, ${applied.talent ?? 0} talents, ` +
      `${applied.spell ?? 0} spells, ${applied.trapping ?? 0} trappings.`;
    return { content: [{ type: 'text' as const, text }], structuredContent: data };
  }
}
