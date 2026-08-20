import { DuplicateActorInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface DuplicateActorToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class DuplicateActorTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'duplicate-actor', handler: (args: any) => this.handle(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'duplicate-actor',
        title: 'Duplicate Actor',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Clone a world actor by ID, optionally renaming. Thin pass-through to the Foundry-module duplicateActor query — persists the clone via Actor.create(source.toObject()) with _id/folder/sort stripped. Preferred over create-actor-from-compendium when the source is a user-curated world template (e.g. clean NPC-type species bases for /wfrp-build-npc).

Use this when:
- Cloning a user-curated world-actor template (e.g. a clean species base) to produce a new named NPC/creature.
- Spinning up several similar actors from one hand-built source without re-authoring items/system data each time.
- Renaming the clone at creation time via newName, instead of duplicating then updating the name separately.
- Bypassing the wfrp4e basic-skills dialog on a bare (item-less) source via options.skipItems:true (BUG-458).

Do NOT use this when the source should be a published compendium stat block rather than a world actor — use create-actor-from-compendium instead.

Performance Notes:
- Single small response: the new clone's id/name, no full sheet payload echoed back. Mode-less — no response-mode variance.`,
        inputSchema: {
          type: 'object',
          properties: {
            sourceActorId: {
              type: 'string',
              description: 'World actor ID to duplicate.',
            },
            newName: {
              type: 'string',
              description: 'Optional name for the clone. Defaults to the source actor name.',
            },
            // BUG-458: mirror of create-actor's options.skipItems (actor-creation.ts).
            options: {
              type: 'object',
              additionalProperties: false,
              properties: {
                skipItems: {
                  type: 'boolean',
                  description:
                    'Pass-through to Foundry Actor.create(data, options). When true, suppresses the wfrp4e ActorWFRP4e._preCreate basic-skills DialogV2.confirm on the clone. Only bare sources need it — the _preCreate guard (!data.items?.length) already skips item-bearing sources. Mirror of create-actor options.skipItems (HC9).',
                },
              },
              description:
                'Optional Foundry creation-options bag passed through to Actor.create(data, options). Currently supports skipItems.',
            },
          },
          required: ['sourceActorId'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = DuplicateActorInput.parse(args);
    this.logger.info('duplicate-actor', {
      sourceActorId: parsed.sourceActorId,
      newName: parsed.newName,
    });
    return await this.query<any>('duplicateActor', parsed);
  }
}
